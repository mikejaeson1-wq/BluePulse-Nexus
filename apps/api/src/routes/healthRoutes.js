import runtimeConfig from "../config/runtimeConfig.js";

import {
    inspectDatabase
} from "../database/database.js";

const databaseSchema = {
    type: "object",

    required: [
        "status",
        "name",
        "latencyMilliseconds"
    ],

    properties: {
        status: {
            type: "string"
        },

        name: {
            type: "string"
        },

        latencyMilliseconds: {
            type: "number"
        }
    }
};

const healthResponseSchema = {
    type: "object",

    required: [
        "status",
        "service",
        "version",
        "environment",
        "timestamp",
        "uptime",
        "database"
    ],

    properties: {
        status: {
            type: "string"
        },

        service: {
            type: "string"
        },

        version: {
            type: "string"
        },

        environment: {
            type: "string"
        },

        timestamp: {
            type: "string"
        },

        uptime: {
            type: "number"
        },

        database:
            databaseSchema
    }
};

export default async function healthRoutes(
    fastify
) {
    fastify.get(
        "/health",
        {
            schema: {
                response: {
                    200:
                        healthResponseSchema
                }
            }
        },
        async (
            request
        ) => {
            let databaseStatus = {
                status:
                    "disconnected",

                name: "",

                latencyMilliseconds:
                    -1
            };

            try {
                const inspection =
                    await inspectDatabase(
                        fastify.database
                    );

                databaseStatus = {
                    status:
                        "connected",

                    name:
                        inspection.name,

                    latencyMilliseconds:
                        inspection
                            .latencyMilliseconds
                };
            } catch (error) {
                request.log.warn(
                    {
                        error
                    },
                    "Datenbank ist beim Healthcheck nicht erreichbar."
                );
            }

            return {
                status:
                    databaseStatus.status ===
                    "connected"
                        ? "ok"
                        : "degraded",

                service:
                    runtimeConfig
                        .applicationName,

                version:
                    runtimeConfig
                        .applicationVersion,

                environment:
                    runtimeConfig
                        .nodeEnvironment,

                timestamp:
                    new Date()
                        .toISOString(),

                uptime:
                    Math.round(
                        process.uptime()
                    ),

                database:
                    databaseStatus
            };
        }
    );

    fastify.get(
        "/ready",
        {
            schema: {
                response: {
                    200: {
                        type: "object",

                        required: [
                            "status",
                            "database"
                        ],

                        properties: {
                            status: {
                                type: "string"
                            },

                            database: {
                                type: "string"
                            }
                        }
                    },

                    503: {
                        type: "object",

                        required: [
                            "status",
                            "database"
                        ],

                        properties: {
                            status: {
                                type: "string"
                            },

                            database: {
                                type: "string"
                            }
                        }
                    }
                }
            }
        },
        async (
            request,
            reply
        ) => {
            try {
                await inspectDatabase(
                    fastify.database
                );

                return {
                    status:
                        "ready",

                    database:
                        "connected"
                };
            } catch (error) {
                request.log.warn(
                    {
                        error
                    },
                    "API ist noch nicht bereit."
                );

                return reply
                    .status(503)
                    .send({
                        status:
                            "not_ready",

                        database:
                            "disconnected"
                    });
            }
        }
    );
}