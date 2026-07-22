import {
    AUTH_ROLES
} from "../services/authService.js";

import {
    listAuditEntries
} from "../services/auditService.js";

const arbitraryObjectSchema = {
    type: "object",
    additionalProperties: true
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
            error: "Forbidden",
            message:
                "Das Aktivitätsprotokoll ist ausschließlich für Administratoren verfügbar."
        });
}

export default async function auditRoutes(
    fastify
) {
    fastify.get(
        "/admin/audit",
        {
            preHandler:
                ensureAdministrator,

            schema: {
                querystring: {
                    type: "object",

                    properties: {
                        limit: {
                            type: "integer",
                            minimum: 1,
                            maximum: 250,
                            default: 100
                        },

                        offset: {
                            type: "integer",
                            minimum: 0,
                            default: 0
                        },

                        action: {
                            type: "string",
                            maxLength: 120
                        },

                        entityType: {
                            type: "string",
                            maxLength: 120
                        },

                        actorUserId: {
                            type: "string",
                            maxLength: 36
                        }
                    },

                    additionalProperties:
                        false
                },

                response: {
                    200:
                        arbitraryObjectSchema
                }
            }
        },
        async (
            request
        ) => {
            return listAuditEntries(
                fastify.database,
                {
                    limit:
                        request.query
                            .limit,

                    offset:
                        request.query
                            .offset,

                    action:
                        request.query
                            .action,

                    entityType:
                        request.query
                            .entityType,

                    actorUserId:
                        request.query
                            .actorUserId
                }
            );
        }
    );
}