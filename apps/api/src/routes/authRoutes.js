import {
    clearAuthSessionCookie,
    getSessionTokenFromRequest,
    setAuthSessionCookie
} from "../auth/authCookie.js";

import {
    authenticateCredentials,
    createSession,
    destroySession,
    getAuthenticatedUser
} from "../services/authService.js";

const loginBodySchema = {
    type: "object",

    required: [
        "identifier",
        "password"
    ],

    properties: {
        identifier: {
            type: "string",
            minLength: 1,
            maxLength: 254
        },

        password: {
            type: "string",
            minLength: 1,
            maxLength: 256
        }
    },

    additionalProperties: false
};

function sendUnauthorized(
    reply
) {
    return reply
        .status(401)
        .send({
            statusCode: 401,

            error:
                "Unauthorized",

            message:
                "Benutzername, E-Mail-Adresse oder Passwort ist falsch."
        });
}

export default async function authRoutes(
    fastify
) {
    fastify.post(
        "/auth/login",
        {
            schema: {
                body:
                    loginBodySchema
            }
        },
        async (
            request,
            reply
        ) => {
            const user =
                await authenticateCredentials(
                    fastify.database,
                    request.body
                        .identifier,
                    request.body
                        .password
                );

            if (!user) {
                return sendUnauthorized(
                    reply
                );
            }

            const session =
                await createSession(
                    fastify.database,
                    user.id,
                    {
                        userAgent:
                            request.headers[
                                "user-agent"
                            ],

                        ipAddress:
                            request.ip
                    }
                );

            setAuthSessionCookie(
                reply,
                session.token,
                session.expiresAt
            );

            reply.header(
                "Cache-Control",
                "no-store"
            );

            return {
                user,

                expiresAt:
                    session.expiresAt
            };
        }
    );

    fastify.get(
        "/auth/me",
        async (
            request,
            reply
        ) => {
            const token =
                getSessionTokenFromRequest(
                    request
                );

            const user =
                await getAuthenticatedUser(
                    fastify.database,
                    token
                );

            if (!user) {
                return reply
                    .status(401)
                    .send({
                        statusCode: 401,

                        error:
                            "Unauthorized",

                        message:
                            "Es besteht keine gültige Nexus-Sitzung."
                    });
            }

            reply.header(
                "Cache-Control",
                "no-store"
            );

            return {
                user
            };
        }
    );

    fastify.post(
        "/auth/logout",
        async (
            request,
            reply
        ) => {
            const token =
                getSessionTokenFromRequest(
                    request
                );

            await destroySession(
                fastify.database,
                token
            );

            clearAuthSessionCookie(
                reply
            );

            return reply
                .status(204)
                .send();
        }
    );

    fastify.get(
        "/admin/auth/session",
        async (
            request,
            reply
        ) => {
            reply.header(
                "Cache-Control",
                "no-store"
            );

            return {
                user:
                    request.authUser
            };
        }
    );
}