import {
    AUTH_ROLES,
    createUser,
    destroyAllUserSessions,
    hashPassword
} from "./authService.js";

const ALLOWED_ROLES =
    new Set(
        Object.values(
            AUTH_ROLES
        )
    );

const ROLE_LABELS =
    Object.freeze({
        administrator:
            "Administrator",

        editor:
            "Redakteur",

        media_manager:
            "Medienverwalter"
    });

const USERNAME_PATTERN =
    /^[a-z0-9][a-z0-9._-]{2,39}$/;

const EMAIL_PATTERN =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createUserError(
    message,
    statusCode = 400
) {
    const error =
        new Error(
            message
        );

    error.statusCode =
        statusCode;

    return error;
}

function normalizeUsername(
    value
) {
    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase();
}

function normalizeEmail(
    value
) {
    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase();
}

function normalizeDisplayName(
    value
) {
    return String(
        value ?? ""
    ).trim();
}

function normalizeRole(
    value
) {
    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase();
}

function validateUsername(
    username
) {
    if (
        !USERNAME_PATTERN.test(
            username
        )
    ) {
        throw createUserError(
            "Der Benutzername muss 3 bis 40 Zeichen lang sein und darf nur Kleinbuchstaben, Zahlen, Punkte, Unterstriche und Bindestriche enthalten."
        );
    }
}

function validateEmail(
    email
) {
    if (
        email.length > 254 ||
        !EMAIL_PATTERN.test(
            email
        )
    ) {
        throw createUserError(
            "Die E-Mail-Adresse ist ungültig."
        );
    }
}

function validateDisplayName(
    displayName
) {
    if (
        displayName.length < 2 ||
        displayName.length > 120
    ) {
        throw createUserError(
            "Der Anzeigename muss zwischen 2 und 120 Zeichen lang sein."
        );
    }
}

function validateRole(
    role
) {
    if (
        !ALLOWED_ROLES.has(
            role
        )
    ) {
        throw createUserError(
            "Die angegebene Benutzerrolle ist ungültig."
        );
    }
}

function mapUserRow(
    row
) {
    if (!row) {
        return null;
    }

    return {
        id:
            String(
                row.id
            ),

        username:
            row.username,

        email:
            row.email,

        name:
            row.display_name,

        displayName:
            row.display_name,

        role:
            row.role,

        roleLabel:
            ROLE_LABELS[
                row.role
            ] ??
            row.role,

        active:
            Boolean(
                row.is_active
            ),

        lastLoginAt:
            row.last_login_at ??
            null,

        createdAt:
            row.created_at ??
            null,

        updatedAt:
            row.updated_at ??
            null
    };
}

function hasOwnProperty(
    object,
    propertyName
) {
    return Object.prototype
        .hasOwnProperty.call(
            object,
            propertyName
        );
}

export async function listUsers(
    database
) {
    const result =
        await database.query(
            `
                SELECT
                    id,
                    username,
                    email,
                    display_name,
                    role,
                    is_active,
                    last_login_at,
                    created_at,
                    updated_at
                FROM users
                ORDER BY
                    is_active DESC,
                    display_name ASC,
                    username ASC
            `
        );

    return result.rows.map(
        mapUserRow
    );
}

export async function getUserById(
    database,
    userId
) {
    const result =
        await database.query(
            `
                SELECT
                    id,
                    username,
                    email,
                    display_name,
                    role,
                    is_active,
                    last_login_at,
                    created_at,
                    updated_at
                FROM users
                WHERE id = $1
                LIMIT 1
            `,
            [
                userId
            ]
        );

    return mapUserRow(
        result.rows?.[0]
    );
}

export async function createManagedUser(
    database,
    {
        username,
        email,
        displayName,
        password,
        role
    }
) {
    return createUser(
        database,
        {
            username,
            email,
            displayName,
            password,
            role
        }
    );
}

export async function countActiveAdministrators(
    database
) {
    const result =
        await database.query(
            `
                SELECT
                    COUNT(*)::INTEGER
                        AS administrator_count
                FROM users
                WHERE
                    role = 'administrator'
                    AND is_active = TRUE
            `
        );

    return Number(
        result.rows?.[0]
            ?.administrator_count
    ) || 0;
}

export async function updateManagedUser(
    database,
    userId,
    changes = {}
) {
    const currentUser =
        await getUserById(
            database,
            userId
        );

    if (!currentUser) {
        throw createUserError(
            "Der Benutzer wurde nicht gefunden.",
            404
        );
    }

    const updateFields = [];
    const updateValues = [];

    function addUpdate(
        columnName,
        value
    ) {
        updateValues.push(
            value
        );

        updateFields.push(
            `${columnName} = $${updateValues.length}`
        );
    }

    if (
        hasOwnProperty(
            changes,
            "username"
        )
    ) {
        const username =
            normalizeUsername(
                changes.username
            );

        validateUsername(
            username
        );

        addUpdate(
            "username",
            username
        );
    }

    if (
        hasOwnProperty(
            changes,
            "email"
        )
    ) {
        const email =
            normalizeEmail(
                changes.email
            );

        validateEmail(
            email
        );

        addUpdate(
            "email",
            email
        );
    }

    if (
        hasOwnProperty(
            changes,
            "displayName"
        )
    ) {
        const displayName =
            normalizeDisplayName(
                changes.displayName
            );

        validateDisplayName(
            displayName
        );

        addUpdate(
            "display_name",
            displayName
        );
    }

    let nextRole =
        currentUser.role;

    if (
        hasOwnProperty(
            changes,
            "role"
        )
    ) {
        nextRole =
            normalizeRole(
                changes.role
            );

        validateRole(
            nextRole
        );

        addUpdate(
            "role",
            nextRole
        );
    }

    let nextActive =
        currentUser.active;

    if (
        hasOwnProperty(
            changes,
            "active"
        )
    ) {
        if (
            typeof changes.active !==
            "boolean"
        ) {
            throw createUserError(
                "Der Aktivstatus muss ein boolescher Wert sein."
            );
        }

        nextActive =
            changes.active;

        addUpdate(
            "is_active",
            nextActive
        );
    }

    const removesActiveAdministrator =
        currentUser.role ===
            AUTH_ROLES.ADMINISTRATOR &&
        currentUser.active &&
        (
            nextRole !==
                AUTH_ROLES.ADMINISTRATOR ||
            nextActive ===
                false
        );

    if (
        removesActiveAdministrator
    ) {
        const administratorCount =
            await countActiveAdministrators(
                database
            );

        if (
            administratorCount <=
            1
        ) {
            throw createUserError(
                "Der letzte aktive Administrator kann weder deaktiviert noch herabgestuft werden.",
                409
            );
        }
    }

    if (
        updateFields.length ===
        0
    ) {
        return currentUser;
    }

    updateValues.push(
        userId
    );

    try {
        const result =
            await database.query(
                `
                    UPDATE users
                    SET
                        ${updateFields.join(
                            ",\n"
                        )}
                    WHERE id =
                        $${updateValues.length}
                    RETURNING
                        id,
                        username,
                        email,
                        display_name,
                        role,
                        is_active,
                        last_login_at,
                        created_at,
                        updated_at
                `,
                updateValues
            );

        const updatedUser =
            mapUserRow(
                result.rows?.[0]
            );

        if (!updatedUser) {
            throw createUserError(
                "Der Benutzer wurde nicht gefunden.",
                404
            );
        }

        if (
            updatedUser.active ===
            false
        ) {
            await destroyAllUserSessions(
                database,
                userId
            );
        }

        return updatedUser;
    } catch (error) {
        if (
            error?.code ===
            "23505"
        ) {
            throw createUserError(
                "Benutzername oder E-Mail-Adresse wird bereits verwendet.",
                409
            );
        }

        throw error;
    }
}

export async function resetManagedUserPassword(
    database,
    userId,
    password
) {
    const currentUser =
        await getUserById(
            database,
            userId
        );

    if (!currentUser) {
        throw createUserError(
            "Der Benutzer wurde nicht gefunden.",
            404
        );
    }

    const passwordHash =
        await hashPassword(
            password
        );

    await database.query(
        `
            UPDATE users
            SET
                password_hash = $1
            WHERE id = $2
        `,
        [
            passwordHash,
            userId
        ]
    );

    await destroyAllUserSessions(
        database,
        userId
    );

    return getUserById(
        database,
        userId
    );
}

export async function revokeManagedUserSessions(
    database,
    userId
) {
    const currentUser =
        await getUserById(
            database,
            userId
        );

    if (!currentUser) {
        throw createUserError(
            "Der Benutzer wurde nicht gefunden.",
            404
        );
    }

    return destroyAllUserSessions(
        database,
        userId
    );
}