const SINGLETON_RESOURCES = Object.freeze({
    navigation: {
        tableName: "site_navigation"
    },

    homeLayout: {
        tableName: "home_layout"
    },

    footer: {
        tableName: "footer_settings"
    }
});

function cloneValue(value) {
    if (
        typeof globalThis.structuredClone ===
        "function"
    ) {
        return globalThis.structuredClone(value);
    }

    return JSON.parse(
        JSON.stringify(value)
    );
}

function assertDatabase(database) {
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

function assertPlainObject(
    value,
    fieldName = "Daten"
) {
    if (
        !value ||
        typeof value !==
            "object" ||
        Array.isArray(value)
    ) {
        const error =
            new Error(
                `${fieldName} müssen ein JSON-Objekt sein.`
            );

        error.statusCode = 400;

        throw error;
    }
}

function getSingletonResource(
    resourceName
) {
    const resource =
        SINGLETON_RESOURCES[
            resourceName
        ];

    if (!resource) {
        throw new Error(
            `Unbekannte Website-Ressource: ${resourceName}`
        );
    }

    return resource;
}

export async function readAllSiteContent(
    database
) {
    assertDatabase(database);

    const result =
        await database.query(`
            SELECT
                content_key,
                data,
                updated_at
            FROM site_content
            ORDER BY content_key ASC
        `);

    return result.rows.reduce(
        (
            content,
            row
        ) => {
            content[row.content_key] =
                cloneValue(
                    row.data ?? {}
                );

            return content;
        },
        {}
    );
}

export async function readSiteContent(
    database,
    contentKey
) {
    assertDatabase(database);

    const result =
        await database.query(
            `
                SELECT
                    content_key,
                    data,
                    updated_at
                FROM site_content
                WHERE content_key = $1
                LIMIT 1
            `,
            [
                contentKey
            ]
        );

    const row =
        result.rows?.[0];

    if (!row) {
        return null;
    }

    return {
        contentKey:
            row.content_key,

        data:
            cloneValue(
                row.data ?? {}
            ),

        updatedAt:
            row.updated_at
    };
}

export async function saveSiteContent(
    database,
    contentKey,
    data
) {
    assertDatabase(database);

    assertPlainObject(
        data,
        "Website-Inhalte"
    );

    const result =
        await database.query(
            `
                INSERT INTO site_content (
                    content_key,
                    data
                )
                VALUES (
                    $1,
                    $2::JSONB
                )
                ON CONFLICT (
                    content_key
                )
                DO UPDATE SET
                    data = EXCLUDED.data
                RETURNING
                    content_key,
                    data,
                    updated_at
            `,
            [
                contentKey,
                data
            ]
        );

    const row =
        result.rows[0];

    return {
        contentKey:
            row.content_key,

        data:
            cloneValue(
                row.data
            ),

        updatedAt:
            row.updated_at
    };
}

export async function deleteSiteContent(
    database,
    contentKey
) {
    assertDatabase(database);

    const result =
        await database.query(
            `
                DELETE FROM site_content
                WHERE content_key = $1
                RETURNING content_key
            `,
            [
                contentKey
            ]
        );

    return result.rowCount > 0;
}

export async function readSingletonResource(
    database,
    resourceName
) {
    assertDatabase(database);

    const {
        tableName
    } =
        getSingletonResource(
            resourceName
        );

    const result =
        await database.query(`
            SELECT
                data,
                updated_at
            FROM ${tableName}
            WHERE id = 1
            LIMIT 1
        `);

    const row =
        result.rows?.[0];

    if (!row) {
        return {
            data: {},
            updatedAt: null
        };
    }

    return {
        data:
            cloneValue(
                row.data ?? {}
            ),

        updatedAt:
            row.updated_at
    };
}

export async function saveSingletonResource(
    database,
    resourceName,
    data
) {
    assertDatabase(database);

    assertPlainObject(
        data,
        "Website-Einstellungen"
    );

    const {
        tableName
    } =
        getSingletonResource(
            resourceName
        );

    const result =
        await database.query(
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
                RETURNING
                    data,
                    updated_at
            `,
            [
                data
            ]
        );

    const row =
        result.rows[0];

    return {
        data:
            cloneValue(
                row.data
            ),

        updatedAt:
            row.updated_at
    };
}