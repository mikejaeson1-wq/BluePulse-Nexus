function assertDatabase(
    database
) {
    if (
        !database ||
        typeof database.query !==
            "function"
    ) {
        throw new Error(
            "Es wurde keine gültige Datenbankverbindung für das Audit-Log bereitgestellt."
        );
    }
}

function normalizeText(
    value,
    {
        fallback = "",
        maximumLength = 500
    } = {}
) {
    const normalized =
        String(
            value ??
            ""
        ).trim();

    const resolved =
        normalized ||
        fallback;

    return resolved.slice(
        0,
        maximumLength
    );
}

function normalizeOptionalText(
    value,
    maximumLength = 500
) {
    const normalized =
        normalizeText(
            value,
            {
                maximumLength
            }
        );

    return normalized ||
        null;
}

function normalizeDate(
    value
) {
    if (!value) {
        return null;
    }

    const date =
        new Date(
            value
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }

    return date.toISOString();
}

function isPlainObject(
    value
) {
    return Boolean(
        value &&
        typeof value ===
            "object" &&
        !Array.isArray(
            value
        )
    );
}

const SENSITIVE_KEY_PATTERN =
    /password|passwort|token|cookie|authorization|secret|hash/i;

function sanitizeMetadataValue(
    value,
    depth = 0
) {
    if (
        depth >
        5
    ) {
        return "[gekürzt]";
    }

    if (
        value ===
            null ||
        value ===
            undefined
    ) {
        return null;
    }

    if (
        typeof value ===
        "string"
    ) {
        return value.slice(
            0,
            1000
        );
    }

    if (
        typeof value ===
            "number" ||
        typeof value ===
            "boolean"
    ) {
        return value;
    }

    if (
        Array.isArray(
            value
        )
    ) {
        return value
            .slice(
                0,
                100
            )
            .map(
                (item) =>
                    sanitizeMetadataValue(
                        item,
                        depth +
                            1
                    )
            );
    }

    if (
        isPlainObject(
            value
        )
    ) {
        return Object.fromEntries(
            Object.entries(
                value
            )
                .filter(
                    ([key]) =>
                        !SENSITIVE_KEY_PATTERN.test(
                            key
                        )
                )
                .slice(
                    0,
                    100
                )
                .map(
                    ([
                        key,
                        item
                    ]) => [
                        key,
                        sanitizeMetadataValue(
                            item,
                            depth +
                                1
                        )
                    ]
                )
        );
    }

    return normalizeText(
        value,
        {
            maximumLength:
                1000
        }
    );
}

function normalizeMetadata(
    value
) {
    if (
        !isPlainObject(
            value
        )
    ) {
        return {};
    }

    return sanitizeMetadataValue(
        value
    );
}

function mapAuditRow(
    row
) {
    if (!row) {
        return null;
    }

    return {
        id:
            Number(
                row.id
            ),

        actorUserId:
            row.actor_user_id ??
            null,

        actorUsername:
            row.actor_username ??
            null,

        actorDisplayName:
            row.actor_display_name ??
            null,

        actorRole:
            row.actor_role ??
            null,

        action:
            row.action,

        entityType:
            row.entity_type,

        entityId:
            row.entity_id ??
            null,

        entityLabel:
            row.entity_label ??
            null,

        summary:
            row.summary,

        requestMethod:
            row.request_method,

        requestPath:
            row.request_path,

        metadata:
            row.metadata ?? {},

        createdAt:
            normalizeDate(
                row.created_at
            )
    };
}

export async function createAuditEntry(
    database,
    {
        actor = null,
        action,
        entityType,
        entityId = null,
        entityLabel = null,
        summary,
        requestMethod,
        requestPath,
        metadata = {}
    }
) {
    assertDatabase(
        database
    );

    const normalizedAction =
        normalizeText(
            action,
            {
                maximumLength:
                    120
            }
        );

    const normalizedEntityType =
        normalizeText(
            entityType,
            {
                maximumLength:
                    120
            }
        );

    const normalizedSummary =
        normalizeText(
            summary,
            {
                maximumLength:
                    1000
            }
        );

    const normalizedRequestMethod =
        normalizeText(
            requestMethod,
            {
                maximumLength:
                    20
            }
        ).toUpperCase();

    const normalizedRequestPath =
        normalizeText(
            requestPath,
            {
                maximumLength:
                    1000
            }
        );

    if (
        !normalizedAction ||
        !normalizedEntityType ||
        !normalizedSummary ||
        !normalizedRequestMethod ||
        !normalizedRequestPath
    ) {
        throw new Error(
            "Der Audit-Eintrag enthält unvollständige Pflichtangaben."
        );
    }

    const result =
        await database.query(
            `
                INSERT INTO audit_log (
                    actor_user_id,
                    actor_username,
                    actor_display_name,
                    actor_role,
                    action,
                    entity_type,
                    entity_id,
                    entity_label,
                    summary,
                    request_method,
                    request_path,
                    metadata
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8,
                    $9,
                    $10,
                    $11,
                    $12::JSONB
                )
                RETURNING
                    id,
                    actor_user_id,
                    actor_username,
                    actor_display_name,
                    actor_role,
                    action,
                    entity_type,
                    entity_id,
                    entity_label,
                    summary,
                    request_method,
                    request_path,
                    metadata,
                    created_at
            `,
            [
                actor?.id ??
                    null,

                normalizeOptionalText(
                    actor?.username,
                    120
                ),

                normalizeOptionalText(
                    actor?.displayName ??
                        actor?.name,
                    200
                ),

                normalizeOptionalText(
                    actor?.role,
                    80
                ),

                normalizedAction,

                normalizedEntityType,

                normalizeOptionalText(
                    entityId,
                    300
                ),

                normalizeOptionalText(
                    entityLabel,
                    500
                ),

                normalizedSummary,

                normalizedRequestMethod,

                normalizedRequestPath,

                JSON.stringify(
                    normalizeMetadata(
                        metadata
                    )
                )
            ]
        );

    return mapAuditRow(
        result.rows?.[0]
    );
}

export async function listAuditEntries(
    database,
    {
        limit = 100,
        offset = 0,
        action = "",
        entityType = "",
        actorUserId = ""
    } = {}
) {
    assertDatabase(
        database
    );

    const normalizedLimit =
        Math.min(
            Math.max(
                Number.parseInt(
                    limit,
                    10
                ) || 100,
                1
            ),
            250
        );

    const normalizedOffset =
        Math.max(
            Number.parseInt(
                offset,
                10
            ) || 0,
            0
        );

    const conditions = [];
    const values = [];

    function addCondition(
        sql,
        value
    ) {
        values.push(
            value
        );

        conditions.push(
            sql.replace(
                "?",
                `$${values.length}`
            )
        );
    }

    if (
        String(
            action ??
            ""
        ).trim()
    ) {
        addCondition(
            "action = ?",
            String(
                action
            ).trim()
        );
    }

    if (
        String(
            entityType ??
            ""
        ).trim()
    ) {
        addCondition(
            "entity_type = ?",
            String(
                entityType
            ).trim()
        );
    }

    if (
        String(
            actorUserId ??
            ""
        ).trim()
    ) {
        addCondition(
            "actor_user_id = ?::UUID",
            String(
                actorUserId
            ).trim()
        );
    }

    const whereClause =
        conditions.length >
        0
            ? `WHERE ${conditions.join(
                " AND "
            )}`
            : "";

    const countResult =
        await database.query(
            `
                SELECT COUNT(*) AS total
                FROM audit_log
                ${whereClause}
            `,
            values
        );

    const dataValues = [
        ...values,
        normalizedLimit,
        normalizedOffset
    ];

    const limitParameter =
        `$${values.length + 1}`;

    const offsetParameter =
        `$${values.length + 2}`;

    const result =
        await database.query(
            `
                SELECT
                    id,
                    actor_user_id,
                    actor_username,
                    actor_display_name,
                    actor_role,
                    action,
                    entity_type,
                    entity_id,
                    entity_label,
                    summary,
                    request_method,
                    request_path,
                    metadata,
                    created_at
                FROM audit_log
                ${whereClause}
                ORDER BY
                    created_at DESC,
                    id DESC
                LIMIT ${limitParameter}
                OFFSET ${offsetParameter}
            `,
            dataValues
        );

    return {
        items:
            result.rows.map(
                mapAuditRow
            ),

        total:
            Number(
                countResult
                    .rows?.[0]
                    ?.total
            ) || 0,

        limit:
            normalizedLimit,

        offset:
            normalizedOffset
    };
}