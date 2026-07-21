import {
    randomUUID
} from "node:crypto";

const PAGE_SELECT = `
    SELECT
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
    FROM pages
`;

function createPageError(
    message,
    statusCode = 400
) {
    const error =
        new Error(message);

    error.statusCode =
        statusCode;

    return error;
}

function assertDatabase(
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
}

function assertTransactionDatabase(
    database
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
}

function normalizeText(
    value,
    fallback = ""
) {
    const normalizedValue =
        String(value ?? "")
            .trim();

    return normalizedValue ||
        fallback;
}

function normalizeTitle(
    value,
    fallback = ""
) {
    const title =
        normalizeText(
            value,
            fallback
        );

    if (!title) {
        throw createPageError(
            "Der Seitentitel darf nicht leer sein."
        );
    }

    if (title.length > 250) {
        throw createPageError(
            "Der Seitentitel darf höchstens 250 Zeichen enthalten."
        );
    }

    return title;
}

export function generatePageSlug(
    value
) {
    const slug =
        String(value ?? "")
            .toLowerCase()
            .trim()
            .replace(/ä/g, "ae")
            .replace(/ö/g, "oe")
            .replace(/ü/g, "ue")
            .replace(/ß/g, "ss")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

    return slug ||
        "neue-seite";
}

function normalizeSlug(
    value
) {
    const slug =
        generatePageSlug(
            value
        );

    if (slug.length > 180) {
        throw createPageError(
            "Der Seiten-Slug darf höchstens 180 Zeichen enthalten."
        );
    }

    return slug;
}

function normalizeStatus(
    value,
    fallback = "draft"
) {
    const status =
        String(
            value ?? fallback
        )
            .trim()
            .toLowerCase();

    if (
        status !== "draft" &&
        status !== "published"
    ) {
        throw createPageError(
            "Der Seitenstatus muss „draft“ oder „published“ sein."
        );
    }

    return status;
}

function normalizeBlocks(
    value,
    fallback = []
) {
    if (value === undefined) {
        return fallback;
    }

    if (!Array.isArray(value)) {
        throw createPageError(
            "Die Seitenblöcke müssen als Liste gespeichert werden."
        );
    }

    return value;
}

function normalizeTheme(
    value,
    fallback = {}
) {
    if (value === undefined) {
        return fallback;
    }

    if (
        !value ||
        typeof value !==
            "object" ||
        Array.isArray(value)
    ) {
        throw createPageError(
            "Das Seitendesign muss ein JSON-Objekt sein."
        );
    }

    return value;
}

function normalizeDate(
    value
) {
    if (!value) {
        return null;
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }

    return date.toISOString();
}

function mapPageRow(
    row
) {
    if (!row) {
        return null;
    }

    return {
        id:
            row.id,

        title:
            row.title,

        slug:
            row.slug,

        template:
            row.template,

        status:
            row.status,

        blocks:
            row.blocks ?? [],

        theme:
            row.theme ?? {},

        createdAt:
            normalizeDate(
                row.created_at
            ),

        updatedAt:
            normalizeDate(
                row.updated_at
            ),

        publishedAt:
            normalizeDate(
                row.published_at
            ),

        deletedAt:
            normalizeDate(
                row.deleted_at
            )
    };
}

function mapVersionRow(
    row
) {
    return {
        id:
            Number(row.id),

        pageId:
            row.page_id,

        versionNumber:
            Number(
                row.version_number
            ),

        snapshot:
            row.snapshot,

        changeType:
            row.change_type,

        createdBy:
            row.created_by ??
            null,

        createdAt:
            normalizeDate(
                row.created_at
            )
    };
}

function handleDatabaseError(
    error
) {
    if (
        error?.code ===
        "23505"
    ) {
        throw createPageError(
            "Dieser Seiten-Slug wird bereits verwendet.",
            409
        );
    }

    throw error;
}

async function withTransaction(
    database,
    callback
) {
    assertTransactionDatabase(
        database
    );

    const client =
        await database.connect();

    try {
        await client.query(
            "BEGIN"
        );

        const result =
            await callback(
                client
            );

        await client.query(
            "COMMIT"
        );

        return result;
    } catch (error) {
        try {
            await client.query(
                "ROLLBACK"
            );
        } catch (rollbackError) {
            console.error(
                "Die Seitentransaktion konnte nicht zurückgerollt werden.",
                rollbackError
            );
        }

        handleDatabaseError(
            error
        );
    } finally {
        client.release();
    }
}

async function findPageById(
    database,
    pageId,
    {
        lock = false,
        includeDeleted = false
    } = {}
) {
    const result =
        await database.query(
            `
                ${PAGE_SELECT}
                WHERE id = $1
                ${
                    includeDeleted
                        ? ""
                        : "AND deleted_at IS NULL"
                }
                ${lock ? "FOR UPDATE" : ""}
            `,
            [
                pageId
            ]
        );

    return mapPageRow(
        result.rows?.[0]
    );
}

async function insertPageVersion(
    database,
    page,
    changeType,
    createdBy = null
) {
    const versionResult =
        await database.query(
            `
                SELECT
                    COALESCE(
                        MAX(
                            version_number
                        ),
                        0
                    ) + 1 AS next_version
                FROM page_versions
                WHERE page_id = $1
            `,
            [
                page.id
            ]
        );

    const versionNumber =
        Number(
            versionResult
                .rows?.[0]
                ?.next_version
        ) || 1;

    const result =
        await database.query(
            `
                INSERT INTO page_versions (
                    page_id,
                    version_number,
                    snapshot,
                    change_type,
                    created_by
                )
                VALUES (
                    $1,
                    $2,
                    $3::JSONB,
                    $4,
                    $5
                )
                RETURNING
                    id,
                    page_id,
                    version_number,
                    snapshot,
                    change_type,
                    created_by,
                    created_at
            `,
            [
                page.id,
                versionNumber,
                page,
                changeType,
                createdBy
            ]
        );

    return mapVersionRow(
        result.rows[0]
    );
}

async function slugExists(
    database,
    slug,
    excludedPageId = null
) {
    const result =
        await database.query(
            `
                SELECT EXISTS (
                    SELECT 1
                    FROM pages
                    WHERE
                        slug = $1
                        AND deleted_at IS NULL
                        AND (
                            $2::TEXT IS NULL
                            OR id <> $2
                        )
                ) AS exists
            `,
            [
                slug,
                excludedPageId
            ]
        );

    return Boolean(
        result.rows?.[0]?.exists
    );
}

async function findAvailableSlug(
    database,
    requestedSlug
) {
    const baseSlug =
        normalizeSlug(
            requestedSlug
        );

    if (
        !await slugExists(
            database,
            baseSlug
        )
    ) {
        return baseSlug;
    }

    let suffix = 2;

    while (
        await slugExists(
            database,
            `${baseSlug}-${suffix}`
        )
    ) {
        suffix += 1;
    }

    return `${baseSlug}-${suffix}`;
}

export async function listPages(
    database
) {
    assertDatabase(
        database
    );

    const result =
        await database.query(`
            ${PAGE_SELECT}
            WHERE deleted_at IS NULL
            ORDER BY updated_at DESC
        `);

    return result.rows.map(
        mapPageRow
    );
}

export async function getPageById(
    database,
    pageId
) {
    assertDatabase(
        database
    );

    return findPageById(
        database,
        pageId
    );
}

export async function getPageBySlug(
    database,
    slug
) {
    assertDatabase(
        database
    );

    const result =
        await database.query(
            `
                ${PAGE_SELECT}
                WHERE
                    slug = $1
                    AND deleted_at IS NULL
                LIMIT 1
            `,
            [
                normalizeSlug(
                    slug
                )
            ]
        );

    return mapPageRow(
        result.rows?.[0]
    );
}

export async function getPublishedPageBySlug(
    database,
    slug
) {
    assertDatabase(
        database
    );

    const result =
        await database.query(
            `
                ${PAGE_SELECT}
                WHERE
                    slug = $1
                    AND status = 'published'
                    AND deleted_at IS NULL
                LIMIT 1
            `,
            [
                normalizeSlug(
                    slug
                )
            ]
        );

    return mapPageRow(
        result.rows?.[0]
    );
}

export async function isPageSlugAvailable(
    database,
    slug,
    excludedPageId = null
) {
    assertDatabase(
        database
    );

    return !await slugExists(
        database,
        normalizeSlug(
            slug
        ),
        excludedPageId
    );
}

export async function createPage(
    database,
    data = {}
) {
    const title =
        normalizeTitle(
            data.title,
            "Neue Seite"
        );

    const slug =
        normalizeSlug(
            data.slug ??
            title
        );

    const status =
        normalizeStatus(
            data.status
        );

    const template =
        normalizeText(
            data.template,
            "blank"
        );

    const blocks =
        normalizeBlocks(
            data.blocks
        );

    const theme =
        normalizeTheme(
            data.theme
        );

    const pageId =
        normalizeText(
            data.id,
            randomUUID()
        );

    return withTransaction(
        database,
        async (client) => {
            if (
                await slugExists(
                    client,
                    slug
                )
            ) {
                throw createPageError(
                    "Dieser Seiten-Slug wird bereits verwendet.",
                    409
                );
            }

            const result =
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
                            published_at
                        )
                        VALUES (
                            $1,
                            $2,
                            $3,
                            $4,
                            $5,
                            $6::JSONB,
                            $7::JSONB,
                            $8
                        )
                        RETURNING
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
                    `,
                    [
                        pageId,
                        title,
                        slug,
                        template,
                        status,
                        blocks,
                        theme,
                        status ===
                            "published"
                            ? new Date()
                            : null
                    ]
                );

            const page =
                mapPageRow(
                    result.rows[0]
                );

            await insertPageVersion(
                client,
                page,
                "create"
            );

            return page;
        }
    );
}

export async function updatePage(
    database,
    pageId,
    data = {},
    {
        changeType = null
    } = {}
) {
    return withTransaction(
        database,
        async (client) => {
            const currentPage =
                await findPageById(
                    client,
                    pageId,
                    {
                        lock: true
                    }
                );

            if (!currentPage) {
                throw createPageError(
                    "Die Seite wurde nicht gefunden.",
                    404
                );
            }

            const title =
                data.title !==
                    undefined
                    ? normalizeTitle(
                        data.title
                    )
                    : currentPage.title;

            const slug =
                data.slug !==
                    undefined
                    ? normalizeSlug(
                        data.slug
                    )
                    : currentPage.slug;

            const template =
                data.template !==
                    undefined
                    ? normalizeText(
                        data.template,
                        "blank"
                    )
                    : currentPage.template;

            const status =
                data.status !==
                    undefined
                    ? normalizeStatus(
                        data.status
                    )
                    : currentPage.status;

            const blocks =
                normalizeBlocks(
                    data.blocks,
                    currentPage.blocks
                );

            const theme =
                normalizeTheme(
                    data.theme,
                    currentPage.theme
                );

            if (
                await slugExists(
                    client,
                    slug,
                    pageId
                )
            ) {
                throw createPageError(
                    "Dieser Seiten-Slug wird bereits verwendet.",
                    409
                );
            }

            let publishedAt =
                currentPage.publishedAt;

            if (
                status ===
                "published" &&
                !publishedAt
            ) {
                publishedAt =
                    new Date()
                        .toISOString();
            }

            if (
                status ===
                "draft"
            ) {
                publishedAt =
                    null;
            }

            const result =
                await client.query(
                    `
                        UPDATE pages
                        SET
                            title = $2,
                            slug = $3,
                            template = $4,
                            status = $5,
                            blocks = $6::JSONB,
                            theme = $7::JSONB,
                            published_at = $8
                        WHERE
                            id = $1
                            AND deleted_at IS NULL
                        RETURNING
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
                    `,
                    [
                        pageId,
                        title,
                        slug,
                        template,
                        status,
                        blocks,
                        theme,
                        publishedAt
                    ]
                );

            const page =
                mapPageRow(
                    result.rows[0]
                );

            let resolvedChangeType =
                changeType;

            if (!resolvedChangeType) {
                if (
                    currentPage.status !==
                        "published" &&
                    page.status ===
                        "published"
                ) {
                    resolvedChangeType =
                        "publish";
                } else if (
                    currentPage.status ===
                        "published" &&
                    page.status ===
                        "draft"
                ) {
                    resolvedChangeType =
                        "unpublish";
                } else {
                    resolvedChangeType =
                        "save";
                }
            }

            await insertPageVersion(
                client,
                page,
                resolvedChangeType
            );

            return page;
        }
    );
}

export async function publishPage(
    database,
    pageId,
    data = {}
) {
    return updatePage(
        database,
        pageId,
        {
            ...data,
            status: "published"
        },
        {
            changeType:
                "publish"
        }
    );
}

export async function unpublishPage(
    database,
    pageId,
    data = {}
) {
    return updatePage(
        database,
        pageId,
        {
            ...data,
            status: "draft"
        },
        {
            changeType:
                "unpublish"
        }
    );
}

export async function duplicatePage(
    database,
    pageId
) {
    const sourcePage =
        await getPageById(
            database,
            pageId
        );

    if (!sourcePage) {
        throw createPageError(
            "Die zu duplizierende Seite wurde nicht gefunden.",
            404
        );
    }

    const duplicateSlug =
        await findAvailableSlug(
            database,
            `${sourcePage.slug}-kopie`
        );

    return createPage(
        database,
        {
            title:
                `${sourcePage.title} – Kopie`,

            slug:
                duplicateSlug,

            template:
                sourcePage.template,

            status:
                "draft",

            blocks:
                sourcePage.blocks,

            theme:
                sourcePage.theme
        }
    );
}

export async function deletePage(
    database,
    pageId
) {
    return withTransaction(
        database,
        async (client) => {
            const currentPage =
                await findPageById(
                    client,
                    pageId,
                    {
                        lock: true
                    }
                );

            if (!currentPage) {
                throw createPageError(
                    "Die Seite wurde nicht gefunden.",
                    404
                );
            }

            const result =
                await client.query(
                    `
                        UPDATE pages
                        SET
                            deleted_at = NOW()
                        WHERE
                            id = $1
                            AND deleted_at IS NULL
                        RETURNING
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
                    `,
                    [
                        pageId
                    ]
                );

            const deletedPage =
                mapPageRow(
                    result.rows[0]
                );

            await insertPageVersion(
                client,
                deletedPage,
                "delete"
            );

            return true;
        }
    );
}

export async function listPageVersions(
    database,
    pageId
) {
    assertDatabase(
        database
    );

    const page =
        await findPageById(
            database,
            pageId
        );

    if (!page) {
        throw createPageError(
            "Die Seite wurde nicht gefunden.",
            404
        );
    }

    const result =
        await database.query(
            `
                SELECT
                    id,
                    page_id,
                    version_number,
                    snapshot,
                    change_type,
                    created_by,
                    created_at
                FROM page_versions
                WHERE page_id = $1
                ORDER BY version_number DESC
            `,
            [
                pageId
            ]
        );

    return result.rows.map(
        mapVersionRow
    );
}

export async function restorePageVersion(
    database,
    pageId,
    versionNumber
) {
    assertDatabase(
        database
    );

    const result =
        await database.query(
            `
                SELECT
                    id,
                    page_id,
                    version_number,
                    snapshot,
                    change_type,
                    created_by,
                    created_at
                FROM page_versions
                WHERE
                    page_id = $1
                    AND version_number = $2
                LIMIT 1
            `,
            [
                pageId,
                versionNumber
            ]
        );

    const version =
        result.rows?.[0]
            ? mapVersionRow(
                result.rows[0]
            )
            : null;

    if (!version) {
        throw createPageError(
            "Die gewünschte Seitenversion wurde nicht gefunden.",
            404
        );
    }

    const snapshot =
        version.snapshot ?? {};

    return updatePage(
        database,
        pageId,
        {
            title:
                snapshot.title,

            slug:
                snapshot.slug,

            template:
                snapshot.template,

            status:
                snapshot.status,

            blocks:
                snapshot.blocks,

            theme:
                snapshot.theme
        },
        {
            changeType:
                "restore"
        }
    );
}