import runtimeConfig from "../config/runtimeConfig.js";

export default async function versionRoutes(
    fastify
) {
    fastify.get(
        "/version",
        {
            schema: {
                response: {
                    200: {
                        type: "object",

                        required: [
                            "name",
                            "version",
                            "environment"
                        ],

                        properties: {
                            name: {
                                type: "string"
                            },

                            version: {
                                type: "string"
                            },

                            environment: {
                                type: "string"
                            }
                        }
                    }
                }
            }
        },
        async () => ({
            name:
                runtimeConfig
                    .applicationName,

            version:
                runtimeConfig
                    .applicationVersion,

            environment:
                runtimeConfig
                    .nodeEnvironment
        })
    );
}