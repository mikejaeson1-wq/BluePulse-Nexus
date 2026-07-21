const MIGRATION_FORMAT =
    "bluepulse-browser-migration";

const MIGRATION_FORMAT_VERSION = 1;

const CONTENT_KEY_PATTERN =
    /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

function createMigrationError(
    message,
    statusCode = 400
) {
    const error =
        new Error(message);

    error.statusCode =
        statusCode;

    return error;
}

function assertPlainObject(
    value,
    fieldName
) {
    if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value)
    ) {
        throw createMigrationError(
            `${fieldName} muss ein JSON-Objekt sein.`
        );
    }
}

function normalizeText(
    value,
    fallback = ""
) {
    const normalizedValue =
        String(value ?? "").trim();

    return normalizedValue ||
        fallback;
}

function normalizeStatus(value) {
    const normalizedValue =
        String(value ?? "")
            .trim()
            .toLowerCase();

    if (
        normalizedValue === "published" ||
        normalizedValue ===
            "veröffentlicht" ||
        normalizedValue ===
            "veroeffentlicht"
    ) {
        return "published";
    }

    return "draft";
}

function normalizeDate(
    value,
    fallback
) {
    const date =
        new Date(
            value ?? fallback
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return new Date(
            fallback
        ).toISOString();
    }

    return date.toISOString();
}

function normalizePage(
    page,
    index
) {
    assertPlainObject(
        page,
        `Seite ${index + 1}`
    );

    const now =
        new Date().toISOString();

    const id =
        normalizeText(
            page.id
        );

    if (!id) {
        throw createMigrationError(
            `Seite ${index + 1} besitzt keine gültige ID.`
        );
    }

    const title =
        normalizeText(
            page.title,
            `Unbenannte Seite ${index + 1}`
        );

    const slug =
        normalizeText(
            page.slug
        );

    if (!slug) {
        throw createMigrationError(
            `Die Seite „${title}“ besitzt keinen gültigen Slug.`
        );
    }

    const status =
        normalizeStatus(
            page.status
        );

    const createdAt =
        normalizeDate(
            page.createdAt,
            now
        );

    const updatedAt =
        normalizeDate(
            page.updatedAt,
            createdAt
        );

    return {
        id,
        title,
        slug,

        template:
            normalizeText(
                page.template,
                "blank"
            ),

        status,

        blocks:
            Array.isArray(
                page.blocks
            )
                ? page.blocks
                : [],

        theme:
            page.theme &&
            typeof page.theme ===
                "object" &&
            !Array.isArray(
                page.theme
            )
                ? page.theme
                : {},

        createdAt,
        updatedAt,

        publishedAt:
            status === "published"
                ? normalizeDate(
                    page.publishedAt,
                    updatedAt
                )
                : null
    };
}

function validateMigrationPayload(
    payload
) {
    assertPlainObject(
        payload,
        "Migrationsdaten"
    );

    if (
        payload.format !==
        MIGRATION_FORMAT
    ) {
        throw createMigrationError(
            "Die Daten besitzen kein gültiges BluePulse-Migrationsformat."
        );
    }

    const formatVersion =
        Number(
            payload.formatVersion
        );

    if (
        !Number.isInteger(
            formatVersion
        ) ||
        formatVersion < 1 ||
        formatVersion >
            MIGRATION_FORMAT_VERSION
    ) {
        throw createMigrationError(
            "Die Migrationsversion wird nicht unterstützt."
        );
    }

    assertPlainObject(
        payload.siteContent,
        "Website-Inhalte"
    );

    assertPlainObject(
        payload.navigation,
        "Navigation"
    );

    assertPlainObject(
        payload.homeLayout,
        "Startseiten-Layout"
    );

    assertPlainObject(
        payload.footer,
        "Footer"
    );

    if (
        !Array.isArray(
            payload.pages
        )
    ) {
        throw createMigrationError(
            "Die Builder-Seiten müssen als Liste übertragen werden."
        );
    }

    Object.keys(
        payload.siteContent
    ).forEach(
        (contentKey) => {
            if (
                !CONTENT_KEY_PATTERN.test(
                    contentKey
                )
            ) {
                throw createMigrationError(
                    `Ungültiger Website-Inhalt: ${contentKey}`
                );
            }

            assertPlainObject(
                payload.siteContent[
                    contentKey
                ],
                `Website-Inhalt „${contentKey}“`
            );
        }
    );

    const pages =
        payload.pages.map(
            normalizePage
        );

    const pageIds =
        new Set();

    const pageSlugs =
        new Set();

    pages.forEach((page) => {
        if (
            pageIds.has(
                page.id
            )
        ) {
            throw createMigrationError(
                `Doppelte Seiten-ID: ${page.id}`
            );
        }

        if (
            pageSlugs.has(
                page.slug
            )
        ) {
            throw createMigrationError(
                `Doppelter Seiten-Slug: ${page.slug}`
            );
        }

        pageIds.add(
            page.id
        );

        pageSlugs.add(
            page.slug
        );
    });

    return {
        formatVersion,
        siteContent:
            payload.siteContent,
        navigation:
            payload.navigation,
        homeLayout:
            payload.homeLayout,
        footer:
            payload.footer,
        pages,

        exportedAt:
            normalizeDate(
                payload.exportedAt,
                new Date()
                    .toISOString()
            ),

        mediaSummary:
            payload.mediaSummary &&
            typeof payload.mediaSummary ===
                "object" &&
            !Array.isArray(
                payload.mediaSummary
            )
                ? payload.mediaSummary
                : {
                    count: 0,
                    totalBytes: 0
                }
    };
}

async function replaceSingleton(
    client,
    tableName,
    data
) {
    await client.query(
        `
            INSERT INTO ${tableName} (
                id,
                data
            )
            VALUES (
                1,
                $1::JSONB
            )
            ON CONFLICT (
                id
            )
            DO UPDATE SET
                data = EXCLUDED.data
        `,
        [
            data
        ]
    );
}

async function replaceSiteContent(
    client,
    siteContent
) {
    await client.query(
        "DELETE FROM site_content"
    );

    for (
        const [
            contentKey,
            data
        ] of Object.entries(
            siteContent
        )
    ) {
        await client.query(
            `
                INSERT INTO site_content (
                    content_key,
                    data
                )
                VALUES (
                    $1,
                    $2::JSONB
                )
            `,
            [
                contentKey,
                data
            ]
        );
    }
}

async function replacePages(
    client,
    pages
) {
    await client.query(
        "DELETE FROM page_versions"
    );

    await client.query(
        "DELETE FROM pages"
    );

    for (const page of pages) {
        await client.query(
            `
                INSERT INTO pages (
                    id,
                    title,
                    slug,
                    template,
                    status,
                    blocks,
                    theme,
                    created_at,
                    updated_at,
                    published_at,
                    deleted_at
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6::JSONB,
                    $7::JSONB,
                    $8,
                    $9,
                    $10,
                    NULL
                )
            `,
            [
                page.id,
                page.title,
                page.slug,
                page.template,
                page.status,
                page.blocks,
                page.theme,
                page.createdAt,
                page.updatedAt,
                page.publishedAt
            ]
        );
    }
}

async function saveMigrationMetadata(
    client,
    migration
) {
    const migratedAt =
        new Date().toISOString();

    const metadata = [
        [
            "browser_migration_completed_at",
            migratedAt
        ],
        [
            "browser_migration_exported_at",
            migration.exportedAt
        ],
        [
            "browser_migration_format_version",
            String(
                migration.formatVersion
            )
        ],
        [
            "browser_migration_media_count",
            String(
                Number(
                    migration
                        .mediaSummary
                        .count
                ) || 0
            )
        ]
    ];

    for (
        const [
            key,
            value
        ] of metadata
    ) {
        await client.query(
            `
                INSERT INTO system_meta (
                    key,
                    value
                )
                VALUES (
                    $1,
                    $2
                )
                ON CONFLICT (
                    key
                )
                DO UPDATE SET
                    value = EXCLUDED.value,
                    updated_at = NOW()
            `,
            [
                key,
                value
            ]
        );
    }

    return migratedAt;
}

export async function migrateBrowserData(
    database,
    payload
) {
    if (
        !database ||
        typeof database.connect !==
            "function"
    ) {
        throw new Error(
            "Es wurde kein gültiger PostgreSQL-Pool bereitgestellt."
        );
    }

    const migration =
        validateMigrationPayload(
            payload
        );

    const client =
        await database.connect();

    try {
        await client.query(
            "BEGIN"
        );

        await replaceSiteContent(
            client,
            migration.siteContent
        );

        await replaceSingleton(
            client,
            "site_navigation",
            migration.navigation
        );

        await replaceSingleton(
            client,
            "home_layout",
            migration.homeLayout
        );

        await replaceSingleton(
            client,
            "footer_settings",
            migration.footer
        );

        await replacePages(
            client,
            migration.pages
        );

        const migratedAt =
            await saveMigrationMetadata(
                client,
                migration
            );

        await client.query(
            "COMMIT"
        );

        return {
            migratedAt,

            siteContent:
                Object.keys(
                    migration.siteContent
                ).length,

            pages:
                migration.pages.length,

            publishedPages:
                migration.pages.filter(
                    (page) =>
                        page.status ===
                        "published"
                ).length,

            draftPages:
                migration.pages.filter(
                    (page) =>
                        page.status ===
                        "draft"
                ).length,

            mediaAssetsNotTransferred:
                Number(
                    migration
                        .mediaSummary
                        .count
                ) || 0
        };
    } catch (error) {
        try {
            await client.query(
                "ROLLBACK"
            );
        } catch (rollbackError) {
            console.error(
                "Die Browsermigration konnte nicht zurückgerollt werden.",
                rollbackError
            );
        }

        throw error;
    } finally {
        client.release();
    }
}

export async function readBrowserMigrationStatus(
    database
) {
    if (
        !database ||
        typeof database.query !==
            "function"
    ) {
        throw new Error(
            "Es wurde keine gültige Datenbankverbindung bereitgestellt."
        );
    }

    const result =
        await database.query(`
            SELECT
                (
                    SELECT COUNT(*)::INTEGER
                    FROM site_content
                ) AS site_content_count,

                (
                    SELECT COUNT(*)::INTEGER
                    FROM pages
                    WHERE deleted_at IS NULL
                ) AS page_count,

                (
                    SELECT COUNT(*)::INTEGER
                    FROM pages
                    WHERE
                        deleted_at IS NULL
                        AND status = 'published'
                ) AS published_page_count,

                (
                    SELECT COUNT(*)::INTEGER
                    FROM pages
                    WHERE
                        deleted_at IS NULL
                        AND status = 'draft'
                ) AS draft_page_count,

                (
                    SELECT value
                    FROM system_meta
                    WHERE key =
                        'browser_migration_completed_at'
                    LIMIT 1
                ) AS migrated_at,

                (
                    SELECT value
                    FROM system_meta
                    WHERE key =
                        'browser_migration_exported_at'
                    LIMIT 1
                ) AS exported_at,

                (
                    SELECT value
                    FROM system_meta
                    WHERE key =
                        'browser_migration_media_count'
                    LIMIT 1
                ) AS media_count
        `);

    const row =
        result.rows?.[0] ?? {};

    return {
        migrated:
            Boolean(
                row.migrated_at
            ),

        migratedAt:
            row.migrated_at ??
            null,

        exportedAt:
            row.exported_at ??
            null,

        siteContent:
            Number(
                row.site_content_count
            ) || 0,

        pages:
            Number(
                row.page_count
            ) || 0,

        publishedPages:
            Number(
                row.published_page_count
            ) || 0,

        draftPages:
            Number(
                row.draft_page_count
            ) || 0,

        mediaAssetsNotTransferred:
            Number(
                row.media_count
            ) || 0
    };
}