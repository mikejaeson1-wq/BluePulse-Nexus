import {
    AUTH_ROLES
} from "../services/authService.js";

import {
    createManagedUser,
    listUsers,
    resetManagedUserPassword,
    revokeManagedUserSessions,
    updateManagedUser
} from "../services/userService.js";

const userIdParametersSchema = {
    type: "object",

    required: [
        "userId"
    ],

    properties: {
        userId: {
            type: "string",
            minLength: 36,
            maxLength: 36,

            pattern:
                "^[0-9a-fA-F-]{36}$"
        }
    },

    additionalProperties: false
};

const createUserBodySchema = {
    type: "object",

    required: [
        "username",
        "email",
        "displayName",
        "password",
        "role"
    ],

    properties: {
        username: {
            type: "string",
            minLength: 3,
            maxLength: 40
        },

        email: {
            type: "string",
            minLength: 3,
            maxLength: 254
        },

        displayName: {
            type: "string",
            minLength: 2,
            maxLength: 120
        },

        password: {
            type: "string",
            minLength: 12,
            maxLength: 256
        },

        role: {
            type: "string",

            enum: [
                AUTH_ROLES.ADMINISTRATOR,
                AUTH_ROLES.EDITOR,
                AUTH_ROLES.MEDIA_MANAGER
            ]
        }
    },

    additionalProperties: false
};

const updateUserBodySchema = {
    type: "object",

    minProperties: 1,

    properties: {
        username: {
            type: "string",
            minLength: 3,
            maxLength: 40
        },

        email: {
            type: "string",
            minLength: 3,
            maxLength: 254
        },

        displayName: {
            type: "string",
            minLength: 2,
            maxLength: 120
        },

        role: {
            type: "string",

            enum: [
                AUTH_ROLES.ADMINISTRATOR,
                AUTH_ROLES.EDITOR,
                AUTH_ROLES.MEDIA_MANAGER
            ]
        },

        active: {
            type: "boolean"
        }
    },

    additionalProperties: false
};

const passwordBodySchema = {
    type: "object",

    required: [
        "password"
    ],

    properties: {
        password: {
            type: "string",
            minLength: 12,
            maxLength: 256
        }
    },

    additionalProperties: false
};

async function ensureAdministrator(
    request,
    reply
) {
    if (
        request.authUser?.role ===
        AUTH_ROLES.ADMINISTRATOR
    ) {
        return;
    }

    return reply
        .status(403)
        .send({
            statusCode: 403,

            error:
                "Forbidden",

            message:
                "Für die Benutzerverwaltung sind Administratorrechte erforderlich."
        });
}

export default async function userRoutes(
    fastify
) {
    fastify.get(
        "/admin/users",
        {
            preHandler:
                ensureAdministrator
        },
        async () => {
            return listUsers(
                fastify.database
            );
        }
    );

    fastify.post(
        "/admin/users",
        {
            preHandler:
                ensureAdministrator,

            schema: {
                body:
                    createUserBodySchema
            }
        },
        async (
            request,
            reply
        ) => {
            const user =
                await createManagedUser(
                    fastify.database,
                    request.body
                );

            return reply
                .status(201)
                .send({
                    user
                });
        }
    );

    fastify.patch(
        "/admin/users/:userId",
        {
            preHandler:
                ensureAdministrator,

            schema: {
                params:
                    userIdParametersSchema,

                body:
                    updateUserBodySchema
            }
        },
        async (
            request
        ) => {
            const targetUserId =
                request.params.userId;

            if (
                targetUserId ===
                    request.authUser.id &&
                request.body.active ===
                    false
            ) {
                const error =
                    new Error(
                        "Du kannst dein eigenes Benutzerkonto nicht deaktivieren."
                    );

                error.statusCode =
                    409;

                throw error;
            }

            if (
                targetUserId ===
                    request.authUser.id &&
                request.body.role &&
                request.body.role !==
                    request.authUser.role
            ) {
                const error =
                    new Error(
                        "Du kannst deine eigene Administratorrolle nicht ändern."
                    );

                error.statusCode =
                    409;

                throw error;
            }

            const user =
                await updateManagedUser(
                    fastify.database,
                    targetUserId,
                    request.body
                );

            return {
                user
            };
        }
    );

    fastify.post(
        "/admin/users/:userId/password",
        {
            preHandler:
                ensureAdministrator,

            schema: {
                params:
                    userIdParametersSchema,

                body:
                    passwordBodySchema
            }
        },
        async (
            request
        ) => {
            const user =
                await resetManagedUserPassword(
                    fastify.database,
                    request.params
                        .userId,
                    request.body
                        .password
                );

            return {
                user,

                sessionsRevoked:
                    true
            };
        }
    );

    fastify.post(
        "/admin/users/:userId/sessions/revoke",
        {
            preHandler:
                ensureAdministrator,

            schema: {
                params:
                    userIdParametersSchema
            }
        },
        async (
            request
        ) => {
            if (
                request.params.userId ===
                request.authUser.id
            ) {
                const error =
                    new Error(
                        "Verwende für dein eigenes Konto die reguläre Abmeldung."
                    );

                error.statusCode =
                    409;

                throw error;
            }

            const revokedSessions =
                await revokeManagedUserSessions(
                    fastify.database,
                    request.params
                        .userId
                );

            return {
                revokedSessions
            };
        }
    );
}