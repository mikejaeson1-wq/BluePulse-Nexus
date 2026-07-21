import {
    readAllSiteContent,
    readSingletonResource,
    readSiteContent
} from "../services/siteDataService.js";

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

const arbitraryObjectSchema = {
    type: "object",
    additionalProperties: true
};

function sendContentNotFound(
    reply,
    contentKey
) {
    return reply
        .status(404)
        .send({
            statusCode: 404,
            error: "Not Found",
            message:
                `Der Website-Inhalt „${contentKey}“ wurde nicht gefunden.`
        });
}

export default async function publicSiteRoutes(
    fastify
) {
    fastify.get(
        "/public/content",
        {
            schema: {
                response: {
                    200:
                        arbitraryObjectSchema
                }
            }
        },
        async () => {
            return readAllSiteContent(
                fastify.database
            );
        }
    );

    fastify.get(
        "/public/content/:contentKey",
        {
            schema: {
                params:
                    contentKeyParametersSchema,

                response: {
                    200:
                        arbitraryObjectSchema
                }
            }
        },
        async (
            request,
            reply
        ) => {
            const content =
                await readSiteContent(
                    fastify.database,
                    request.params
                        .contentKey
                );

            if (!content) {
                return sendContentNotFound(
                    reply,
                    request.params
                        .contentKey
                );
            }

            return content.data;
        }
    );

    fastify.get(
        "/public/navigation",
        {
            schema: {
                response: {
                    200:
                        arbitraryObjectSchema
                }
            }
        },
        async () => {
            const navigation =
                await readSingletonResource(
                    fastify.database,
                    "navigation"
                );

            return navigation.data;
        }
    );

    fastify.get(
        "/public/home-layout",
        {
            schema: {
                response: {
                    200:
                        arbitraryObjectSchema
                }
            }
        },
        async () => {
            const layout =
                await readSingletonResource(
                    fastify.database,
                    "homeLayout"
                );

            return layout.data;
        }
    );

    fastify.get(
        "/public/footer",
        {
            schema: {
                response: {
                    200:
                        arbitraryObjectSchema
                }
            }
        },
        async () => {
            const footer =
                await readSingletonResource(
                    fastify.database,
                    "footer"
                );

            return footer.data;
        }
    );
}