import {
    createHmac
} from "node:crypto";

export const CONTACT_MESSAGE_STATUSES =
    Object.freeze([
        "new",
        "in_progress",
        "answered",
        "closed",
        "spam"
    ]);

const CONTACT_MESSAGE_STATUS_SET =
    new Set(
        CONTACT_MESSAGE_STATUSES
    );

function assertDatabase(
    database
) {
    if (
        !database ||
        typeof database.query !==
            "function"
    ) {
        throw new Error(
            "Es wurde keine gültige Datenbankverbindung für Kontaktanfragen bereitgestellt."
        );
    }
}

function createServiceError(
    message,
    statusCode = 400,
    name = "Contact Request Error"
) {
    const error =
        new Error(
            message
        );

    error.statusCode =
        statusCode;

    error.name =
        name;

    return error;
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

function normalizeText(
    value,
    {
        maximumLength = 500,
        preserveWhitespace = false
    } = {}
) {
    const rawValue =
        String(
            value ??
            ""
        );

    const normalizedValue =
        preserveWhitespace
            ? rawValue
                .replace(
                    /\r\n?/g,
                    "\n"
                )
                .trim()
            : rawValue
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();

    return normalizedValue.slice(
        0,
        maximumLength
    );
}

function normalizeOptionalText(
    value,
    options
) {
    const normalizedValue =
        normalizeText(
            value,
            options
        );

    return normalizedValue ||
        null;
}

function normalizeEmail(
    value
) {
    return normalizeText(
        value,
        {
            maximumLength:
                254
        }
    ).toLowerCase();
}

function isValidEmail(
    value
) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        value
    );
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

function normalizeIdentifier(
    value
) {
    const numericValue =
        Number.parseInt(
            String(
                value ??
                ""
            ),
            10
        );

    if (
        !Number.isInteger(
            numericValue
        ) ||
        numericValue < 1
    ) {
        throw createServiceError(
            "Die Kontaktanfrage besitzt keine gültige ID.",
            400
        );
    }

    return numericValue;
}

function normalizeStatus(
    value,
    fallback = "new"
) {
    const normalizedValue =
        normalizeText(
            value,
            {
                maximumLength:
                    40
            }
        ).toLowerCase();

    if (
        CONTACT_MESSAGE_STATUS_SET.has(
            normalizedValue
        )
    ) {
        return normalizedValue;
    }

    if (
        fallback &&
        CONTACT_MESSAGE_STATUS_SET.has(
            fallback
        )
    ) {
        return fallback;
    }

    throw createServiceError(
        "Der angegebene Bearbeitungsstatus ist ungültig.",
        400
    );
}

function mapContactMessageRow(
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

        name:
            row.sender_name,

        email:
            row.sender_email,

        subject:
            row.subject,

        message:
            row.message,

        status:
            row.status,

        isRead:
            Boolean(
                row.read_at
            ),

        readAt:
            normalizeDate(
                row.read_at
            ),

        respondedAt:
            normalizeDate(
                row.responded_at
            ),

        internalNote:
            row.internal_note ??
            "",

        privacyAcceptedAt:
            normalizeDate(
                row.privacy_accepted_at
            ),

        sourcePath:
            row.source_path ??
            "",

        userAgent:
            row.user_agent ??
            "",

        lastUpdatedByUserId:
            row.last_updated_by_user_id ??
            null,

        lastUpdatedByName:
            row.last_updated_by_name ??
            "",

        createdAt:
            normalizeDate(
                row.created_at
            ),

        updatedAt:
            normalizeDate(
                row.updated_at
            )
    };
}

const CONTACT_SELECT_COLUMNS = `
    id,
    sender_name,
    sender_email,
    subject,
    message,
    status,
    read_at,
    responded_at,
    internal_note,
    privacy_accepted_at,
    source_path,
    user_agent,
    last_updated_by_user_id,
    last_updated_by_name,
    created_at,
    updated_at
`;

export function normalizeContactSubmission(
    value
) {
    const source =
        isPlainObject(
            value
        )
            ? value
            : {};

    const name =
        normalizeText(
            source.name,
            {
                maximumLength:
                    120
            }
        );

    const email =
        normalizeEmail(
            source.email
        );

    const subject =
        normalizeText(
            source.subject,
            {
                maximumLength:
                    180
            }
        );

    const message =
        normalizeText(
            source.message,
            {
                maximumLength:
                    5000,
                preserveWhitespace:
                    true
            }
        );

    const privacyAccepted =
        source.privacyAccepted ===
        true;

    if (
        name.length < 2
    ) {
        throw createServiceError(
            "Bitte gib einen Namen mit mindestens zwei Zeichen ein.",
            400
        );
    }

    if (
        !isValidEmail(
            email
        )
    ) {
        throw createServiceError(
            "Bitte gib eine gültige E-Mail-Adresse ein.",
            400
        );
    }

    if (
        subject.length < 3
    ) {
        throw createServiceError(
            "Der Betreff muss mindestens drei Zeichen enthalten.",
            400
        );
    }

    if (
        message.length < 20
    ) {
        throw createServiceError(
            "Die Nachricht muss mindestens 20 Zeichen enthalten.",
            400
        );
    }

    if (!privacyAccepted) {
        throw createServiceError(
            "Die Datenschutzhinweise müssen vor dem Absenden bestätigt werden.",
            400
        );
    }

    return {
        name,
        email,
        subject,
        message,
        privacyAccepted,
        sourcePath:
            normalizeOptionalText(
                source.sourcePath,
                {
                    maximumLength:
                        500
                }
            )
    };
}

export function hashContactIp(
    ipAddress,
    secret
) {
    const normalizedIpAddress =
        normalizeText(
            ipAddress,
            {
                maximumLength:
                    200
            }
        ) ||
        "unknown";

    const normalizedSecret =
        normalizeText(
            secret,
            {
                maximumLength:
                    500
            }
        ) ||
        "bluepulse-contact-development-secret";

    return createHmac(
        "sha256",
        normalizedSecret
    )
        .update(
            normalizedIpAddress
        )
        .digest(
            "hex"
        );
}

export async function hasRecentContactMessage(
    database,
    {
        email,
        ipHash,
        windowSeconds = 60
    }
) {
    assertDatabase(
        database
    );

    const normalizedEmail =
        normalizeEmail(
            email
        );

    const normalizedIpHash =
        normalizeOptionalText(
            ipHash,
            {
                maximumLength:
                    64
            }
        );

    const normalizedWindowSeconds =
        Math.min(
            Math.max(
                Number.parseInt(
                    String(
                        windowSeconds ??
                        60
                    ),
                    10
                ) || 60,
                1
            ),
            3600
        );

    if (!normalizedIpHash) {
        return false;
    }

    const result =
        await database.query(
            `
                SELECT EXISTS (
                    SELECT 1
                    FROM contact_messages
                    WHERE
                        sender_email = $1 AND
                        ip_hash = $2 AND
                        created_at >=
                            NOW() -
                            ($3::INTEGER * INTERVAL '1 second')
                ) AS exists
            `,
            [
                normalizedEmail,
                normalizedIpHash,
                normalizedWindowSeconds
            ]
        );

    return Boolean(
        result.rows?.[0]
            ?.exists
    );
}

export async function createContactMessage(
    database,
    submission,
    {
        ipHash = null,
        userAgent = null,
        duplicateWindowSeconds = 60
    } = {}
) {
    assertDatabase(
        database
    );

    const normalizedSubmission =
        normalizeContactSubmission(
            submission
        );

    const normalizedIpHash =
        normalizeOptionalText(
            ipHash,
            {
                maximumLength:
                    64
            }
        );

    const duplicate =
        await hasRecentContactMessage(
            database,
            {
                email:
                    normalizedSubmission.email,
                ipHash:
                    normalizedIpHash,
                windowSeconds:
                    duplicateWindowSeconds
            }
        );

    if (duplicate) {
        throw createServiceError(
            "Eine gleichartige Kontaktanfrage wurde gerade erst übermittelt. Bitte warte einen Moment.",
            429,
            "Too Many Requests"
        );
    }

    const result =
        await database.query(
            `
                INSERT INTO contact_messages (
                    sender_name,
                    sender_email,
                    subject,
                    message,
                    privacy_accepted_at,
                    source_path,
                    user_agent,
                    ip_hash
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    NOW(),
                    $5,
                    $6,
                    $7
                )
                RETURNING
                    ${CONTACT_SELECT_COLUMNS}
            `,
            [
                normalizedSubmission.name,
                normalizedSubmission.email,
                normalizedSubmission.subject,
                normalizedSubmission.message,
                normalizedSubmission.sourcePath,
                normalizeOptionalText(
                    userAgent,
                    {
                        maximumLength:
                            1000
                    }
                ),
                normalizedIpHash
            ]
        );

    return mapContactMessageRow(
        result.rows?.[0]
    );
}

export async function listContactMessages(
    database,
    {
        limit = 50,
        offset = 0,
        status = "",
        read = "",
        search = ""
    } = {}
) {
    assertDatabase(
        database
    );

    const normalizedLimit =
        Math.min(
            Math.max(
                Number.parseInt(
                    String(
                        limit ??
                        50
                    ),
                    10
                ) || 50,
                1
            ),
            250
        );

    const normalizedOffset =
        Math.max(
            Number.parseInt(
                String(
                    offset ??
                    0
                ),
                10
            ) || 0,
            0
        );

    const normalizedStatus =
        normalizeText(
            status,
            {
                maximumLength:
                    40
            }
        ).toLowerCase();

    const normalizedRead =
        normalizeText(
            read,
            {
                maximumLength:
                    20
            }
        ).toLowerCase();

    const normalizedSearch =
        normalizeText(
            search,
            {
                maximumLength:
                    200
            }
        );

    const conditions = [];
    const values = [];

    function addValueCondition(
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

    if (normalizedStatus) {
        if (
            !CONTACT_MESSAGE_STATUS_SET.has(
                normalizedStatus
            )
        ) {
            throw createServiceError(
                "Der Filter für den Bearbeitungsstatus ist ungültig.",
                400
            );
        }

        addValueCondition(
            "status = ?",
            normalizedStatus
        );
    }

    if (
        normalizedRead ===
        "read"
    ) {
        conditions.push(
            "read_at IS NOT NULL"
        );
    } else if (
        normalizedRead ===
        "unread"
    ) {
        conditions.push(
            "read_at IS NULL"
        );
    }

    if (normalizedSearch) {
        values.push(
            `%${normalizedSearch}%`
        );

        const searchParameter =
            `$${values.length}`;

        conditions.push(
            `(
                sender_name ILIKE ${searchParameter} OR
                sender_email ILIKE ${searchParameter} OR
                subject ILIKE ${searchParameter} OR
                message ILIKE ${searchParameter}
            )`
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
                FROM contact_messages
                ${whereClause}
            `,
            values
        );

    const limitParameter =
        `$${values.length + 1}`;

    const offsetParameter =
        `$${values.length + 2}`;

    const result =
        await database.query(
            `
                SELECT
                    ${CONTACT_SELECT_COLUMNS}
                FROM contact_messages
                ${whereClause}
                ORDER BY
                    created_at DESC,
                    id DESC
                LIMIT ${limitParameter}
                OFFSET ${offsetParameter}
            `,
            [
                ...values,
                normalizedLimit,
                normalizedOffset
            ]
        );

    return {
        items:
            result.rows.map(
                mapContactMessageRow
            ),

        total:
            Number(
                countResult.rows?.[0]
                    ?.total
            ) || 0,

        limit:
            normalizedLimit,

        offset:
            normalizedOffset
    };
}

export async function getContactOverview(
    database
) {
    assertDatabase(
        database
    );

    const result =
        await database.query(
            `
                SELECT
                    COUNT(*) AS total,
                    COUNT(*) FILTER (
                        WHERE status = 'new'
                    ) AS new_count,
                    COUNT(*) FILTER (
                        WHERE read_at IS NULL
                    ) AS unread_count,
                    COUNT(*) FILTER (
                        WHERE status = 'in_progress'
                    ) AS in_progress_count,
                    COUNT(*) FILTER (
                        WHERE status = 'answered'
                    ) AS answered_count,
                    COUNT(*) FILTER (
                        WHERE status = 'closed'
                    ) AS closed_count,
                    COUNT(*) FILTER (
                        WHERE status = 'spam'
                    ) AS spam_count,
                    COUNT(*) FILTER (
                        WHERE created_at >=
                            CURRENT_DATE
                    ) AS today_count
                FROM contact_messages
            `
        );

    const row =
        result.rows?.[0] ??
        {};

    return {
        total:
            Number(
                row.total
            ) || 0,
        new:
            Number(
                row.new_count
            ) || 0,
        unread:
            Number(
                row.unread_count
            ) || 0,
        inProgress:
            Number(
                row.in_progress_count
            ) || 0,
        answered:
            Number(
                row.answered_count
            ) || 0,
        closed:
            Number(
                row.closed_count
            ) || 0,
        spam:
            Number(
                row.spam_count
            ) || 0,
        today:
            Number(
                row.today_count
            ) || 0
    };
}

export async function getContactMessageById(
    database,
    messageId
) {
    assertDatabase(
        database
    );

    const normalizedMessageId =
        normalizeIdentifier(
            messageId
        );

    const result =
        await database.query(
            `
                SELECT
                    ${CONTACT_SELECT_COLUMNS}
                FROM contact_messages
                WHERE id = $1
                LIMIT 1
            `,
            [
                normalizedMessageId
            ]
        );

    return mapContactMessageRow(
        result.rows?.[0]
    );
}

export async function updateContactMessage(
    database,
    messageId,
    patch,
    actor = null
) {
    assertDatabase(
        database
    );

    const normalizedMessageId =
        normalizeIdentifier(
            messageId
        );

    const source =
        isPlainObject(
            patch
        )
            ? patch
            : {};

    const assignments = [];
    const values = [];

    function addAssignment(
        sql,
        value
    ) {
        values.push(
            value
        );

        assignments.push(
            sql.replace(
                "?",
                `$${values.length}`
            )
        );
    }

    if (
        Object.prototype
            .hasOwnProperty.call(
                source,
                "status"
            )
    ) {
        const status =
            normalizeStatus(
                source.status,
                null
            );

        addAssignment(
            "status = ?",
            status
        );

        if (
            status ===
            "answered"
        ) {
            assignments.push(
                "responded_at = COALESCE(responded_at, NOW())"
            );
        }
    }

    if (
        Object.prototype
            .hasOwnProperty.call(
                source,
                "isRead"
            )
    ) {
        assignments.push(
            source.isRead
                ? "read_at = COALESCE(read_at, NOW())"
                : "read_at = NULL"
        );
    }

    if (
        Object.prototype
            .hasOwnProperty.call(
                source,
                "internalNote"
            )
    ) {
        addAssignment(
            "internal_note = ?",
            normalizeOptionalText(
                source.internalNote,
                {
                    maximumLength:
                        10000,
                    preserveWhitespace:
                        true
                }
            )
        );
    }

    if (
        assignments.length ===
        0
    ) {
        return getContactMessageById(
            database,
            normalizedMessageId
        );
    }

    addAssignment(
        "last_updated_by_user_id = ?",
        actor?.id ??
        null
    );

    addAssignment(
        "last_updated_by_name = ?",
        normalizeOptionalText(
            actor?.displayName ??
                actor?.name ??
                actor?.username,
            {
                maximumLength:
                    200
            }
        )
    );

    values.push(
        normalizedMessageId
    );

    const messageIdParameter =
        `$${values.length}`;

    const result =
        await database.query(
            `
                UPDATE contact_messages
                SET
                    ${assignments.join(
                        ",\n                    "
                    )}
                WHERE id = ${messageIdParameter}
                RETURNING
                    ${CONTACT_SELECT_COLUMNS}
            `,
            values
        );

    return mapContactMessageRow(
        result.rows?.[0]
    );
}

export async function deleteContactMessage(
    database,
    messageId
) {
    assertDatabase(
        database
    );

    const normalizedMessageId =
        normalizeIdentifier(
            messageId
        );

    const result =
        await database.query(
            `
                DELETE FROM contact_messages
                WHERE id = $1
                RETURNING id
            `,
            [
                normalizedMessageId
            ]
        );

    return Boolean(
        result.rows?.[0]
    );
}
