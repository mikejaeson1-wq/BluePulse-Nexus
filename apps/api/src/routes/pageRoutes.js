import {
    createPage,
    deletePage,
    duplicatePage,
    getPageById,
    getPageBySlug,
    getPublishedPageBySlug,
    isPageSlugAvailable,
    listPages,
    listPageVersions,
    publishPage,
    restorePageVersion,
    unpublishPage,
    updatePage
} from "../services/pageService.js";

const arbitraryObjectSchema = {
    type: "object",
    additionalProperties: true
};

const pageSchema = {
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

const slugParametersSchema = {
    type: "object",

    required: [
        "slug"
    ],

    properties: {
        slug: {
            type: "string",
            minLength: 1,
            maxLength: 180
        }
    }
};

const versionParametersSchema = {
    type: "object",

    required: [
        "pageId",
        "versionNumber"
    ],

    properties: {
        pageId: {
            type: "string",
            minLength: 1,
            maxLength: 180
        },

        versionNumber: {
            type: "integer",
            minimum: 1
        }
    }
};

const pageBodySchema = {
    type: "object",

    properties: {
        id: {
            type: "string"
        },

        title: {
            type: "string"
        },

        slug: {
            type: "string"
        },

        template: {
            type: "string"
        },

        status: {
            type: "string",
            enum: [
                "draft",
                "published"
            ]
        },

        blocks: {
            type: "array",
            items:
                arbitraryObjectSchema
        },

        theme:
            arbitraryObjectSchema
    },

    additionalProperties: true
};

function sendPageNotFound(
    reply
) {
    return reply
        .status(404)
        .send({
            statusCode: 404,
            error: "Not Found",
            message:
                "Die Seite wurde nicht gefunden."
        });
}

export default async function pageRoutes(
    fastify
) {
    fastify.get(
        "/admin/pages/slug-availability",
        {
            schema: {
                querystring: {
                    type: "object",

                    required: [
                        "slug"
                    ],

                    properties: {
                        slug: {
                            type: "string",
                            minLength: 1,
                            maxLength: 180
                        },

                        exclude: {
                            type: "string"
                        }
                    }
                },

                response: {
                    200: {
                        type: "object",

                        required: [
                            "available"
                        ],

                        properties: {
                            available: {
                                type: "boolean"
                            }
                        }
                    }
                }
            }
        },
        async (
            request
        ) => {
            const available =
                await isPageSlugAvailable(
                    fastify.database,
                    request.query.slug,
                    request.query
                        .exclude ??
                    null
                );

            return {
                available
            };
        }
    );

    fastify.get(
        "/admin/pages/by-slug/:slug",
        {
            schema: {
                params:
                    slugParametersSchema,

                response: {
                    200:
                        pageSchema
                }
            }
        },
        async (
            request,
            reply
        ) => {
            const page =
                await getPageBySlug(
                    fastify.database,
                    request.params.slug
                );

            if (!page) {
                return sendPageNotFound(
                    reply
                );
            }

            return page;
        }
    );

    fastify.get(
        "/admin/pages",
        {
            schema: {
                response: {
                    200: {
                        type: "array",
                        items:
                            pageSchema
                    }
                }
            }
        },
        async () => {
            return listPages(
                fastify.database
            );
        }
    );

    fastify.post(
        "/admin/pages",
        {
            schema: {
                body:
                    pageBodySchema,

                response: {
                    201:
                        pageSchema
                }
            },

            bodyLimit:
                10 * 1024 * 1024
        },
        async (
            request,
            reply
        ) => {
            const page =
                await createPage(
                    fastify.database,
                    request.body
                );

            return reply
                .status(201)
                .send(page);
        }
    );

    fastify.get(
        "/admin/pages/:pageId/versions",
        {
            schema: {
                params:
                    pageIdParametersSchema,

                response: {
                    200: {
                        type: "array",
                        items:
                            arbitraryObjectSchema
                    }
                }
            }
        },
        async (
            request
        ) => {
            return listPageVersions(
                fastify.database,
                request.params.pageId
            );
        }
    );

    fastify.post(
        "/admin/pages/:pageId/versions/:versionNumber/restore",
        {
            schema: {
                params:
                    versionParametersSchema,

                response: {
                    200:
                        pageSchema
                }
            }
        },
        async (
            request
        ) => {
            return restorePageVersion(
                fastify.database,
                request.params.pageId,
                request.params
                    .versionNumber
            );
        }
    );

    fastify.get(
        "/admin/pages/:pageId",
        {
            schema: {
                params:
                    pageIdParametersSchema,

                response: {
                    200:
                        pageSchema
                }
            }
        },
        async (
            request,
            reply
        ) => {
            const page =
                await getPageById(
                    fastify.database,
                    request.params.pageId
                );

            if (!page) {
                return sendPageNotFound(
                    reply
                );
            }

            return page;
        }
    );

    fastify.put(
        "/admin/pages/:pageId",
        {
            schema: {
                params:
                    pageIdParametersSchema,

                body:
                    pageBodySchema,

                response: {
                    200:
                        pageSchema
                }
            },

            bodyLimit:
                10 * 1024 * 1024
        },
        async (
            request
        ) => {
            return updatePage(
                fastify.database,
                request.params.pageId,
                request.body
            );
        }
    );

    fastify.post(
        "/admin/pages/:pageId/publish",
        {
            schema: {
                params:
                    pageIdParametersSchema,

                body:
                    pageBodySchema,

                response: {
                    200:
                        pageSchema
                }
            }
        },
        async (
            request
        ) => {
            return publishPage(
                fastify.database,
                request.params.pageId,
                request.body ?? {}
            );
        }
    );

    fastify.post(
        "/admin/pages/:pageId/unpublish",
        {
            schema: {
                params:
                    pageIdParametersSchema,

                body:
                    pageBodySchema,

                response: {
                    200:
                        pageSchema
                }
            }
        },
        async (
            request
        ) => {
            return unpublishPage(
                fastify.database,
                request.params.pageId,
                request.body ?? {}
            );
        }
    );

    fastify.post(
        "/admin/pages/:pageId/duplicate",
        {
            schema: {
                params:
                    pageIdParametersSchema,

                response: {
                    201:
                        pageSchema
                }
            }
        },
        async (
            request,
            reply
        ) => {
            const page =
                await duplicatePage(
                    fastify.database,
                    request.params.pageId
                );

            return reply
                .status(201)
                .send(page);
        }
    );

    fastify.delete(
        "/admin/pages/:pageId",
        {
            schema: {
                params:
                    pageIdParametersSchema
            }
        },
        async (
            request,
            reply
        ) => {
            await deletePage(
                fastify.database,
                request.params.pageId
            );

            return reply
                .status(204)
                .send();
        }
    );

    fastify.get(
        "/public/pages/:slug",
        {
            schema: {
                params:
                    slugParametersSchema,

                response: {
                    200:
                        pageSchema
                }
            }
        },
        async (
            request,
            reply
        ) => {
            const page =
                await getPublishedPageBySlug(
                    fastify.database,
                    request.params.slug
                );

            if (!page) {
                return sendPageNotFound(
                    reply
                );
            }

            return page;
        }
    );
}