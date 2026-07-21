import {
    deleteSiteContent,
    saveSingletonResource,
    saveSiteContent
} from "../services/siteDataService.js";

const arbitraryObjectSchema = {
    type: "object",
    additionalProperties: true
};

const contentKeyParametersSchema = {
    type: "object",

    required: [
        "contentKey"
    ],

    properties: {
        contentKey: {
            type: "string",
            minLength: 1,
            maxLength: 64,
            pattern:
                "^[a-zA-Z0-9][a-zA-Z0-9_-]*$"
        }
    }
};

function createSingletonRoutes({
    path,
    resourceName
}) {
    return async function singletonRoutes(
        fastify
    ) {
        fastify.put(
            path,
            {
                schema: {
                    body:
                        arbitraryObjectSchema,

                    response: {
                        200:
                            arbitraryObjectSchema
                    }
                }
            },
            async (
                request
            ) => {
                const savedResource =
                    await saveSingletonResource(
                        fastify.database,
                        resourceName,
                        request.body
                    );

                return savedResource.data;
            }
        );

        fastify.post(
            `${path}/reset`,
            {
                schema: {
                    body:
                        arbitraryObjectSchema,

                    response: {
                        200:
                            arbitraryObjectSchema
                    }
                }
            },
            async (
                request
            ) => {
                const savedResource =
                    await saveSingletonResource(
                        fastify.database,
                        resourceName,
                        request.body
                    );

                return savedResource.data;
            }
        );
    };
}

export default async function adminSiteRoutes(
    fastify
) {
    fastify.put(
        "/admin/content/:contentKey",
        {
            schema: {
                params:
                    contentKeyParametersSchema,

                body:
                    arbitraryObjectSchema,

                response: {
                    200:
                        arbitraryObjectSchema
                }
            }
        },
        async (
            request
        ) => {
            const savedContent =
                await saveSiteContent(
                    fastify.database,
                    request.params
                        .contentKey,
                    request.body
                );

            return savedContent.data;
        }
    );

    fastify.post(
        "/admin/content/:contentKey/reset",
        {
            schema: {
                params:
                    contentKeyParametersSchema,

                body:
                    arbitraryObjectSchema,

                response: {
                    200:
                        arbitraryObjectSchema
                }
            }
        },
        async (
            request
        ) => {
            const savedContent =
                await saveSiteContent(
                    fastify.database,
                    request.params
                        .contentKey,
                    request.body
                );

            return savedContent.data;
        }
    );

    fastify.delete(
        "/admin/content/:contentKey",
        {
            schema: {
                params:
                    contentKeyParametersSchema
            }
        },
        async (
            request,
            reply
        ) => {
            const deleted =
                await deleteSiteContent(
                    fastify.database,
                    request.params
                        .contentKey
                );

            if (!deleted) {
                return reply
                    .status(404)
                    .send({
                        statusCode: 404,
                        error:
                            "Not Found",
                        message:
                            `Der Website-Inhalt „${request.params.contentKey}“ wurde nicht gefunden.`
                    });
            }

            return reply
                .status(204)
                .send();
        }
    );

    await fastify.register(
        createSingletonRoutes({
            path:
                "/admin/navigation",

            resourceName:
                "navigation"
        })
    );

    await fastify.register(
        createSingletonRoutes({
            path:
                "/admin/home-layout",

            resourceName:
                "homeLayout"
        })
    );

    await fastify.register(
        createSingletonRoutes({
            path:
                "/admin/footer",

            resourceName:
                "footer"
        })
    );
}