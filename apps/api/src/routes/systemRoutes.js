import {
    readSystemMetadata
} from "../database/database.js";

export default async function systemRoutes(
    fastify
) {
    fastify.get(
        "/system/meta",
        {
            schema: {
                response: {
                    200: {
                        type: "object",

                        required: [
                            "items"
                        ],

                        properties: {
                            items: {
                                type: "array",

                                items: {
                                    type:
                                        "object",

                                    required: [
                                        "key",
                                        "value"
                                    ],

                                    properties: {
                                        key: {
                                            type:
                                                "string"
                                        },

                                        value: {
                                            type:
                                                "string"
                                        },

                                        updatedAt: {
                                            type:
                                                "string"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        async () => {
            const metadata =
                await readSystemMetadata(
                    fastify.database
                );

            return {
                items:
                    metadata.map(
                        (item) => ({
                            ...item,

                            updatedAt:
                                new Date(
                                    item.updatedAt
                                ).toISOString()
                        })
                    )
            };
        }
    );
}