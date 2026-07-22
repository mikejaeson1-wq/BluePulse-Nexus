import {
    AUTH_ROLES
} from "../services/authService.js";

import {
    listDeletedPages,
    permanentlyDeletePage,
    restoreDeletedPage
} from "../services/pageTrashService.js";

const arbitraryObjectSchema = {
    type: "object",
    additionalProperties: true
};

const pageIdParametersSchema = {
    type: "object",

    required: [
        "pageId"
    ],

    properties: {
        pageId: {
            type: "string",
            minLength: 1,
            maxLength: 180
        }
    }
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
                "Nur Administratoren dürfen Seiten endgültig löschen."
        });
}

export default async function pageTrashRoutes(
    fastify
) {
    fastify.get(
        "/admin/pages/trash",
        {
            schema: {
                response: {
                    200: {
                        type: "array",

                        items:
                            arbitraryObjectSchema
                    }
                }
            }
        },
        async () => {
            return listDeletedPages(
                fastify.database
            );
        }
    );

    fastify.post(
        "/admin/pages/:pageId/restore",
        {
            schema: {
                params:
                    pageIdParametersSchema,

                response: {
                    200:
                        arbitraryObjectSchema
                }
            }
        },
        async (
            request
        ) => {
            return restoreDeletedPage(
                fastify.database,
                request.params.pageId,
                {
                    restoredBy:
                        request.authUser
                            ?.id ??
                        null
                }
            );
        }
    );

    fastify.delete(
        "/admin/pages/:pageId/permanent",
        {
            preHandler:
                ensureAdministrator,

            schema: {
                params:
                    pageIdParametersSchema
            }
        },
        async (
            request,
            reply
        ) => {
            await permanentlyDeletePage(
                fastify.database,
                request.params.pageId
            );

            return reply
                .status(204)
                .send();
        }
    );
}