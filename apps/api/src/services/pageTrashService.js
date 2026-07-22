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

function createPageTrashError(
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
            Array.isArray(
                row.blocks
            )
                ? row.blocks
                : [],

        theme:
            row.theme &&
            typeof row.theme ===
                "object" &&
            !Array.isArray(
                row.theme
            )
                ? row.theme
                : {},

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
        } catch (
            rollbackError
        ) {
            console.error(
                "Die Papierkorb-Transaktion konnte nicht zurückgerollt werden.",
                rollbackError
            );
        }

        throw error;
    } finally {
        client.release();
    }
}

async function findDeletedPageById(
    database,
    pageId,
    {
        lock = false
    } = {}
) {
    const result =
        await database.query(
            `
                ${PAGE_SELECT}
                WHERE
                    id = $1
                    AND deleted_at IS NOT NULL
                ${lock ? "FOR UPDATE" : ""}
                LIMIT 1
            `,
            [
                pageId
            ]
        );

    return mapPageRow(
        result.rows?.[0]
    );
}

async function activeSlugExists(
    database,
    slug
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
                ) AS exists
            `,
            [
                slug
            ]
        );

    return Boolean(
        result.rows?.[0]
            ?.exists
    );
}

async function findRestoredSlug(
    database,
    originalSlug
) {
    if (
        !await activeSlugExists(
            database,
            originalSlug
        )
    ) {
        return originalSlug;
    }

    const baseSlug =
        `${originalSlug}-wiederhergestellt`;

    if (
        !await activeSlugExists(
            database,
            baseSlug
        )
    ) {
        return baseSlug;
    }

    let suffix =
        2;

    while (
        await activeSlugExists(
            database,
            `${baseSlug}-${suffix}`
        )
    ) {
        suffix +=
            1;
    }

    return `${baseSlug}-${suffix}`;
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
        `,
        [
            page.id,
            versionNumber,
            page,
            changeType,
            createdBy
        ]
    );
}

export async function listDeletedPages(
    database
) {
    assertDatabase(
        database
    );

    const result =
        await database.query(`
            ${PAGE_SELECT}
            WHERE deleted_at IS NOT NULL
            ORDER BY deleted_at DESC
        `);

    return result.rows.map(
        mapPageRow
    );
}

export async function restoreDeletedPage(
    database,
    pageId,
    {
        restoredBy = null
    } = {}
) {
    return withTransaction(
        database,
        async (
            client
        ) => {
            const deletedPage =
                await findDeletedPageById(
                    client,
                    pageId,
                    {
                        lock: true
                    }
                );

            if (!deletedPage) {
                throw createPageTrashError(
                    "Die gelöschte Seite wurde nicht gefunden.",
                    404
                );
            }

            const restoredSlug =
                await findRestoredSlug(
                    client,
                    deletedPage.slug
                );

            const result =
                await client.query(
                    `
                        UPDATE pages
                        SET
                            slug = $2,
                            status = 'draft',
                            published_at = NULL,
                            deleted_at = NULL
                        WHERE
                            id = $1
                            AND deleted_at IS NOT NULL
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
                        restoredSlug
                    ]
                );

            const restoredPage =
                mapPageRow(
                    result.rows?.[0]
                );

            if (!restoredPage) {
                throw createPageTrashError(
                    "Die Seite konnte nicht wiederhergestellt werden.",
                    409
                );
            }

            await insertPageVersion(
                client,
                restoredPage,
                "restore_from_trash",
                restoredBy
            );

            return {
                ...restoredPage,

                originalSlug:
                    deletedPage.slug,

                restoredSlugChanged:
                    restoredSlug !==
                    deletedPage.slug
            };
        }
    );
}

export async function permanentlyDeletePage(
    database,
    pageId
) {
    return withTransaction(
        database,
        async (
            client
        ) => {
            const deletedPage =
                await findDeletedPageById(
                    client,
                    pageId,
                    {
                        lock: true
                    }
                );

            if (!deletedPage) {
                throw createPageTrashError(
                    "Die Seite befindet sich nicht im Papierkorb.",
                    404
                );
            }

            const result =
                await client.query(
                    `
                        DELETE FROM pages
                        WHERE
                            id = $1
                            AND deleted_at IS NOT NULL
                        RETURNING id
                    `,
                    [
                        pageId
                    ]
                );

            if (
                result.rowCount !==
                1
            ) {
                throw createPageTrashError(
                    "Die Seite konnte nicht endgültig gelöscht werden.",
                    409
                );
            }

            return deletedPage;
        }
    );
}