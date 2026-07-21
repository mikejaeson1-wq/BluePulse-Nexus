import {
    createHash,
    randomBytes
} from "node:crypto";

import argon2 from "argon2";

import runtimeConfig from "../config/runtimeConfig.js";

export const AUTH_ROLES =
    Object.freeze({
        ADMINISTRATOR:
            "administrator",

        EDITOR:
            "editor",

        MEDIA_MANAGER:
            "media_manager"
    });

const ROLE_LABELS =
    Object.freeze({
        administrator:
            "Administrator",

        editor:
            "Redakteur",

        media_manager:
            "Medienverwalter"
    });

const ALLOWED_ROLES =
    new Set(
        Object.values(
            AUTH_ROLES
        )
    );

const USERNAME_PATTERN =
    /^[a-z0-9][a-z0-9._-]{2,39}$/;

const EMAIL_PATTERN =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_HASH_OPTIONS = {
    type:
        argon2.argon2id,

    memoryCost:
        19456,

    timeCost:
        2,

    parallelism:
        1
};

function createAuthError(
    message,
    statusCode = 400
) {
    const error =
        new Error(message);

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
    const normalizedRole =
        String(
            value ?? ""
        )
            .trim()
            .toLowerCase();

    if (
        !ALLOWED_ROLES.has(
            normalizedRole
        )
    ) {
        throw createAuthError(
            "Die angegebene Benutzerrolle ist ungültig."
        );
    }

    return normalizedRole;
}

function validateUsername(
    username
) {
    if (
        !USERNAME_PATTERN.test(
            username
        )
    ) {
        throw createAuthError(
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
        throw createAuthError(
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
        throw createAuthError(
            "Der Anzeigename muss zwischen 2 und 120 Zeichen lang sein."
        );
    }
}

function validatePassword(
    password
) {
    if (
        typeof password !==
            "string" ||
        password.length < 12
    ) {
        throw createAuthError(
            "Das Passwort muss mindestens 12 Zeichen lang sein."
        );
    }

    if (
        password.length > 256
    ) {
        throw createAuthError(
            "Das Passwort darf höchstens 256 Zeichen lang sein."
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

function hashSessionToken(
    token
) {
    return createHash(
        "sha256"
    )
        .update(
            token,
            "utf8"
        )
        .digest(
            "hex"
        );
}

export async function hashPassword(
    password
) {
    validatePassword(
        password
    );

    return argon2.hash(
        password,
        PASSWORD_HASH_OPTIONS
    );
}

export async function createUser(
    database,
    {
        username,
        email,
        displayName,
        password,
        role =
            AUTH_ROLES.EDITOR
    }
) {
    const normalizedUsername =
        normalizeUsername(
            username
        );

    const normalizedEmail =
        normalizeEmail(
            email
        );

    const normalizedDisplayName =
        normalizeDisplayName(
            displayName
        );

    const normalizedRole =
        normalizeRole(
            role
        );

    validateUsername(
        normalizedUsername
    );

    validateEmail(
        normalizedEmail
    );

    validateDisplayName(
        normalizedDisplayName
    );

    const passwordHash =
        await hashPassword(
            password
        );

    try {
        const result =
            await database.query(
                `
                    INSERT INTO users (
                        username,
                        email,
                        display_name,
                        password_hash,
                        role
                    )
                    VALUES (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5
                    )
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
                [
                    normalizedUsername,
                    normalizedEmail,
                    normalizedDisplayName,
                    passwordHash,
                    normalizedRole
                ]
            );

        return mapUserRow(
            result.rows?.[0]
        );
    } catch (error) {
        if (
            error?.code ===
            "23505"
        ) {
            throw createAuthError(
                "Benutzername oder E-Mail-Adresse wird bereits verwendet.",
                409
            );
        }

        throw error;
    }
}

export async function authenticateCredentials(
    database,
    identifier,
    password
) {
    const normalizedIdentifier =
        String(
            identifier ?? ""
        )
            .trim()
            .toLowerCase();

    if (
        !normalizedIdentifier ||
        typeof password !==
            "string" ||
        !password
    ) {
        return null;
    }

    const result =
        await database.query(
            `
                SELECT
                    id,
                    username,
                    email,
                    display_name,
                    password_hash,
                    role,
                    is_active,
                    last_login_at,
                    created_at,
                    updated_at
                FROM users
                WHERE
                    (
                        LOWER(username) = $1
                        OR LOWER(email) = $1
                    )
                    AND is_active = TRUE
                LIMIT 1
            `,
            [
                normalizedIdentifier
            ]
        );

    const row =
        result.rows?.[0];

    if (!row) {
        return null;
    }

    let passwordMatches =
        false;

    try {
        passwordMatches =
            await argon2.verify(
                row.password_hash,
                password
            );
    } catch {
        passwordMatches =
            false;
    }

    if (!passwordMatches) {
        return null;
    }

    return mapUserRow(
        row
    );
}

export async function createSession(
    database,
    userId,
    {
        userAgent = "",
        ipAddress = ""
    } = {}
) {
    const token =
        randomBytes(
            32
        ).toString(
            "base64url"
        );

    const tokenHash =
        hashSessionToken(
            token
        );

    const expiresAt =
        new Date(
            Date.now() +
            runtimeConfig
                .auth
                .sessionTtlSeconds *
            1000
        );

    await database.query(
        `
            INSERT INTO auth_sessions (
                user_id,
                token_hash,
                expires_at,
                user_agent,
                ip_address
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5
            )
        `,
        [
            userId,
            tokenHash,
            expiresAt,
            String(
                userAgent ?? ""
            ).slice(
                0,
                1000
            ) || null,
            String(
                ipAddress ?? ""
            ).slice(
                0,
                200
            ) || null
        ]
    );

    await database.query(
        `
            UPDATE users
            SET
                last_login_at = NOW()
            WHERE id = $1
        `,
        [
            userId
        ]
    );

    return {
        token,
        expiresAt:
            expiresAt.toISOString()
    };
}

export async function getAuthenticatedUser(
    database,
    token
) {
    if (
        typeof token !==
            "string" ||
        token.length < 20
    ) {
        return null;
    }

    const tokenHash =
        hashSessionToken(
            token
        );

    const result =
        await database.query(
            `
                SELECT
                    users.id,
                    users.username,
                    users.email,
                    users.display_name,
                    users.role,
                    users.is_active,
                    users.last_login_at,
                    users.created_at,
                    users.updated_at
                FROM auth_sessions
                INNER JOIN users
                    ON users.id =
                        auth_sessions.user_id
                WHERE
                    auth_sessions.token_hash = $1
                    AND auth_sessions.expires_at > NOW()
                    AND users.is_active = TRUE
                LIMIT 1
            `,
            [
                tokenHash
            ]
        );

    const user =
        mapUserRow(
            result.rows?.[0]
        );

    if (!user) {
        return null;
    }

    await database.query(
        `
            UPDATE auth_sessions
            SET
                last_seen_at = NOW()
            WHERE token_hash = $1
        `,
        [
            tokenHash
        ]
    );

    return user;
}

export async function destroySession(
    database,
    token
) {
    if (
        typeof token !==
            "string" ||
        !token
    ) {
        return false;
    }

    const tokenHash =
        hashSessionToken(
            token
        );

    const result =
        await database.query(
            `
                DELETE FROM auth_sessions
                WHERE token_hash = $1
            `,
            [
                tokenHash
            ]
        );

    return (
        Number(
            result.rowCount
        ) > 0
    );
}

export async function destroyAllUserSessions(
    database,
    userId
) {
    const result =
        await database.query(
            `
                DELETE FROM auth_sessions
                WHERE user_id = $1
            `,
            [
                userId
            ]
        );

    return Number(
        result.rowCount
    ) || 0;
}

export async function removeExpiredSessions(
    database
) {
    const result =
        await database.query(
            `
                DELETE FROM auth_sessions
                WHERE expires_at <= NOW()
            `
        );

    return Number(
        result.rowCount
    ) || 0;
}