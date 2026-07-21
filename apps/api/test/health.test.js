import assert from "node:assert/strict";
import test from "node:test";

import {
    buildApp
} from "../src/app.js";

function createDatabaseMock({
    failing = false
} = {}) {
    return {
        async query(queryText) {
            if (failing) {
                throw new Error(
                    "Test-Datenbank nicht erreichbar."
                );
            }

            if (
                queryText.includes(
                    "current_database()"
                )
            ) {
                return {
                    rows: [
                        {
                            database_name:
                                "bluepulse_nexus",

                            database_user:
                                "bluepulse",

                            server_time:
                                new Date()
                                    .toISOString()
                        }
                    ]
                };
            }

            if (
                queryText.includes(
                    "FROM system_meta"
                )
            ) {
                return {
                    rows: [
                        {
                            key:
                                "schema_version",

                            value:
                                "1",

                            updated_at:
                                new Date()
                        }
                    ]
                };
            }

            return {
                rows: []
            };
        }
    };
}

test(
    "GET /api/health liefert einen gültigen Status",
    async (context) => {
        const fastify =
            buildApp({
                logger: false,

                databasePool:
                    createDatabaseMock()
            });

        context.after(
            async () => {
                await fastify.close();
            }
        );

        const response =
            await fastify.inject({
                method: "GET",
                url: "/api/health"
            });

        assert.equal(
            response.statusCode,
            200
        );

        const payload =
            response.json();

        assert.equal(
            payload.status,
            "ok"
        );

        assert.equal(
            payload.database.status,
            "connected"
        );

        assert.equal(
            payload.database.name,
            "bluepulse_nexus"
        );
    }
);

test(
    "GET /api/ready liefert HTTP 200 bei erreichbarer Datenbank",
    async (context) => {
        const fastify =
            buildApp({
                logger: false,

                databasePool:
                    createDatabaseMock()
            });

        context.after(
            async () => {
                await fastify.close();
            }
        );

        const response =
            await fastify.inject({
                method: "GET",
                url: "/api/ready"
            });

        assert.equal(
            response.statusCode,
            200
        );

        assert.deepEqual(
            response.json(),
            {
                status:
                    "ready",

                database:
                    "connected"
            }
        );
    }
);

test(
    "GET /api/ready liefert HTTP 503 bei nicht erreichbarer Datenbank",
    async (context) => {
        const fastify =
            buildApp({
                logger: false,

                databasePool:
                    createDatabaseMock({
                        failing: true
                    })
            });

        context.after(
            async () => {
                await fastify.close();
            }
        );

        const response =
            await fastify.inject({
                method: "GET",
                url: "/api/ready"
            });

        assert.equal(
            response.statusCode,
            503
        );

        assert.equal(
            response.json().status,
            "not_ready"
        );
    }
);

test(
    "GET /api/system/meta liefert Systeminformationen",
    async (context) => {
        const fastify =
            buildApp({
                logger: false,

                databasePool:
                    createDatabaseMock()
            });

        context.after(
            async () => {
                await fastify.close();
            }
        );

        const response =
            await fastify.inject({
                method: "GET",
                url: "/api/system/meta"
            });

        assert.equal(
            response.statusCode,
            200
        );

        const payload =
            response.json();

        assert.equal(
            payload.items.length,
            1
        );

        assert.equal(
            payload.items[0].key,
            "schema_version"
        );
    }
);

test(
    "GET /api/version liefert die Nexus-Version",
    async (context) => {
        const fastify =
            buildApp({
                logger: false,

                databasePool:
                    createDatabaseMock()
            });

        context.after(
            async () => {
                await fastify.close();
            }
        );

        const response =
            await fastify.inject({
                method: "GET",
                url: "/api/version"
            });

        assert.equal(
            response.statusCode,
            200
        );

        assert.equal(
            typeof response
                .json()
                .version,
            "string"
        );
    }
);

test(
    "Unbekannte API-Routen liefern HTTP 404",
    async (context) => {
        const fastify =
            buildApp({
                logger: false,

                databasePool:
                    createDatabaseMock()
            });

        context.after(
            async () => {
                await fastify.close();
            }
        );

        const response =
            await fastify.inject({
                method: "GET",
                url: "/api/unbekannt"
            });

        assert.equal(
            response.statusCode,
            404
        );

        assert.equal(
            response.json().statusCode,
            404
        );
    }
);