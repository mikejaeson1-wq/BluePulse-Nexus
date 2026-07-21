import assert from "node:assert/strict";

import test from "node:test";

import {
    buildApp
} from "../src/app.js";

import {
    hashPassword
} from "../src/services/authService.js";

function normalizeQuery(
    queryText
) {
    return String(
        queryText
    )
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}

async function createAuthDatabaseMock() {
    const passwordHash =
        await hashPassword(
            "BluePulse-Test-2026!"
        );

    const user = {
        id:
            "2ffba0ed-6a58-473b-9c7e-f8ddf7b59493",

        username:
            "admin",

        email:
            "admin@bluepulse.test",

        display_name:
            "Administrator",

        password_hash:
            passwordHash,

        role:
            "administrator",

        is_active:
            true,

        last_login_at:
            null,

        created_at:
            new Date()
                .toISOString(),

        updated_at:
            new Date()
                .toISOString()
    };

    const sessions =
        new Map();

    async function query(
        queryText,
        parameters = []
    ) {
        const query =
            normalizeQuery(
                queryText
            );

        if (
            query.includes(
                "FROM users"
            ) &&
            query.includes(
                "LOWER(username) = $1"
            )
        ) {
            const identifier =
                parameters[0];

            const matches =
                identifier ===
                    user.username ||
                identifier ===
                    user.email;

            return {
                rows:
                    matches &&
                    user.is_active
                        ? [
                            {
                                ...user
                            }
                        ]
                        : []
            };
        }

        if (
            query.startsWith(
                "INSERT INTO auth_sessions"
            )
        ) {
            sessions.set(
                parameters[1],
                {
                    userId:
                        parameters[0],

                    tokenHash:
                        parameters[1],

                    expiresAt:
                        new Date(
                            parameters[2]
                        ),

                    userAgent:
                        parameters[3],

                    ipAddress:
                        parameters[4]
                }
            );

            return {
                rows: [],
                rowCount: 1
            };
        }

        if (
            query.startsWith(
                "UPDATE users"
            ) &&
            query.includes(
                "last_login_at"
            )
        ) {
            user.last_login_at =
                new Date()
                    .toISOString();

            return {
                rows: [],
                rowCount: 1
            };
        }

        if (
            query.includes(
                "FROM auth_sessions"
            ) &&
            query.includes(
                "INNER JOIN users"
            )
        ) {
            const session =
                sessions.get(
                    parameters[0]
                );

            const validSession =
                session &&
                session.expiresAt
                    .getTime() >
                Date.now() &&
                user.is_active;

            return {
                rows:
                    validSession
                        ? [
                            {
                                ...user
                            }
                        ]
                        : []
            };
        }

        if (
            query.startsWith(
                "UPDATE auth_sessions"
            ) &&
            query.includes(
                "last_seen_at"
            )
        ) {
            return {
                rows: [],

                rowCount:
                    sessions.has(
                        parameters[0]
                    )
                        ? 1
                        : 0
            };
        }

        if (
            query.startsWith(
                "DELETE FROM auth_sessions"
            ) &&
            query.includes(
                "token_hash = $1"
            )
        ) {
            const deleted =
                sessions.delete(
                    parameters[0]
                );

            return {
                rows: [],

                rowCount:
                    deleted
                        ? 1
                        : 0
            };
        }

        throw new Error(
            `Nicht unterstützte Auth-Abfrage: ${query}`
        );
    }

    return {
        query,

        async connect() {
            return {
                query,

                release() {}
            };
        }
    };
}

function getCookieHeader(
    response
) {
    const setCookie =
        response.headers[
            "set-cookie"
        ];

    const cookieValue =
        Array.isArray(
            setCookie
        )
            ? setCookie[0]
            : setCookie;

    return String(
        cookieValue
    ).split(
        ";"
    )[0];
}

test(
    "Login, Sitzungsschutz und Logout funktionieren",
    async (context) => {
        const database =
            await createAuthDatabaseMock();

        const fastify =
            buildApp({
                logger: false,

                databasePool:
                    database,

                authenticationRequired:
                    true
            });

        context.after(
            async () => {
                await fastify.close();
            }
        );

        const unauthorizedResponse =
            await fastify.inject({
                method: "GET",

                url:
                    "/api/admin/auth/session"
            });

        assert.equal(
            unauthorizedResponse
                .statusCode,
            401
        );

        const failedLoginResponse =
            await fastify.inject({
                method: "POST",

                url:
                    "/api/auth/login",

                payload: {
                    identifier:
                        "admin",

                    password:
                        "Falsches-Passwort"
                }
            });

        assert.equal(
            failedLoginResponse
                .statusCode,
            401
        );

        const loginResponse =
            await fastify.inject({
                method: "POST",

                url:
                    "/api/auth/login",

                payload: {
                    identifier:
                        "admin",

                    password:
                        "BluePulse-Test-2026!"
                }
            });

        assert.equal(
            loginResponse.statusCode,
            200
        );

        assert.equal(
            loginResponse
                .json()
                .user
                .role,
            "administrator"
        );

        const cookie =
            getCookieHeader(
                loginResponse
            );

        assert.match(
            cookie,
            /^bluepulse_nexus_session=/
        );

        const currentUserResponse =
            await fastify.inject({
                method: "GET",

                url:
                    "/api/auth/me",

                headers: {
                    cookie
                }
            });

        assert.equal(
            currentUserResponse
                .statusCode,
            200
        );

        assert.equal(
            currentUserResponse
                .json()
                .user
                .username,
            "admin"
        );

        const protectedResponse =
            await fastify.inject({
                method: "GET",

                url:
                    "/api/admin/auth/session",

                headers: {
                    cookie
                }
            });

        assert.equal(
            protectedResponse
                .statusCode,
            200
        );

        const logoutResponse =
            await fastify.inject({
                method: "POST",

                url:
                    "/api/auth/logout",

                headers: {
                    cookie
                }
            });

        assert.equal(
            logoutResponse.statusCode,
            204
        );

        const expiredSessionResponse =
            await fastify.inject({
                method: "GET",

                url:
                    "/api/auth/me",

                headers: {
                    cookie
                }
            });

        assert.equal(
            expiredSessionResponse
                .statusCode,
            401
        );
    }
);