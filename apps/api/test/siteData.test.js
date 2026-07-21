import assert from "node:assert/strict";
import test from "node:test";

import {
    buildApp
} from "../src/app.js";

function cloneValue(value) {
    return JSON.parse(
        JSON.stringify(value)
    );
}

function createSiteDatabaseMock() {
    const state = {
        siteContent:
            new Map(),

        site_navigation: {
            items: []
        },

        home_layout: {
            items: []
        },

        footer_settings: {
            legalName:
                ""
        }
    };

    return {
        state,

        async query(
            queryText,
            parameters = []
        ) {
            const query =
                queryText
                    .replace(/\s+/g, " ")
                    .trim();

            if (
                query.includes(
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
                query.includes(
                    "FROM system_meta"
                )
            ) {
                return {
                    rows: []
                };
            }

            if (
                query.startsWith(
                    "SELECT content_key, data, updated_at FROM site_content"
                ) &&
                !query.includes(
                    "WHERE content_key"
                )
            ) {
                return {
                    rows: [
                        ...state
                            .siteContent
                            .entries()
                    ].map(
                        ([
                            contentKey,
                            data
                        ]) => ({
                            content_key:
                                contentKey,

                            data:
                                cloneValue(
                                    data
                                ),

                            updated_at:
                                new Date()
                        })
                    )
                };
            }

            if (
                query.includes(
                    "FROM site_content"
                ) &&
                query.includes(
                    "WHERE content_key = $1"
                )
            ) {
                const contentKey =
                    parameters[0];

                if (
                    !state.siteContent.has(
                        contentKey
                    )
                ) {
                    return {
                        rows: []
                    };
                }

                return {
                    rows: [
                        {
                            content_key:
                                contentKey,

                            data:
                                cloneValue(
                                    state
                                        .siteContent
                                        .get(
                                            contentKey
                                        )
                                ),

                            updated_at:
                                new Date()
                        }
                    ]
                };
            }

            if (
                query.startsWith(
                    "INSERT INTO site_content"
                )
            ) {
                const [
                    contentKey,
                    data
                ] = parameters;

                state.siteContent.set(
                    contentKey,
                    cloneValue(data)
                );

                return {
                    rows: [
                        {
                            content_key:
                                contentKey,

                            data:
                                cloneValue(data),

                            updated_at:
                                new Date()
                        }
                    ]
                };
            }

            if (
                query.startsWith(
                    "DELETE FROM site_content"
                )
            ) {
                const deleted =
                    state.siteContent.delete(
                        parameters[0]
                    );

                return {
                    rowCount:
                        deleted
                            ? 1
                            : 0,

                    rows:
                        deleted
                            ? [
                                {
                                    content_key:
                                        parameters[0]
                                }
                            ]
                            : []
                };
            }

            const singletonTable =
                [
                    "site_navigation",
                    "home_layout",
                    "footer_settings"
                ].find(
                    (tableName) =>
                        query.includes(
                            tableName
                        )
                );

            if (
                singletonTable &&
                query.startsWith(
                    "SELECT data, updated_at"
                )
            ) {
                return {
                    rows: [
                        {
                            data:
                                cloneValue(
                                    state[
                                        singletonTable
                                    ]
                                ),

                            updated_at:
                                new Date()
                        }
                    ]
                };
            }

            if (
                singletonTable &&
                query.startsWith(
                    `INSERT INTO ${singletonTable}`
                )
            ) {
                state[
                    singletonTable
                ] =
                    cloneValue(
                        parameters[0]
                    );

                return {
                    rows: [
                        {
                            data:
                                cloneValue(
                                    parameters[0]
                                ),

                            updated_at:
                                new Date()
                        }
                    ]
                };
            }

            throw new Error(
                `Nicht unterstützte Testabfrage: ${query}`
            );
        }
    };
}

test(
    "Website-Inhalte können gespeichert und öffentlich gelesen werden",
    async (context) => {
        const database =
            createSiteDatabaseMock();

        const fastify =
            buildApp({
                logger: false,
                databasePool:
                    database
            });

        context.after(
            async () => {
                await fastify.close();
            }
        );

        const updateResponse =
            await fastify.inject({
                method: "PUT",
                url:
                    "/api/admin/content/hero",

                payload: {
                    titleLine1:
                        "Every Life",

                    titleLine2:
                        "Matters"
                }
            });

        assert.equal(
            updateResponse.statusCode,
            200
        );

        const publicResponse =
            await fastify.inject({
                method: "GET",
                url:
                    "/api/public/content/hero"
            });

        assert.equal(
            publicResponse.statusCode,
            200
        );

        assert.deepEqual(
            publicResponse.json(),
            {
                titleLine1:
                    "Every Life",

                titleLine2:
                    "Matters"
            }
        );
    }
);

test(
    "Alle Website-Inhalte werden als Objekt zurückgegeben",
    async (context) => {
        const database =
            createSiteDatabaseMock();

        database.state
            .siteContent
            .set(
                "mission",
                {
                    title:
                        "Unsere Mission"
                }
            );

        const fastify =
            buildApp({
                logger: false,
                databasePool:
                    database
            });

        context.after(
            async () => {
                await fastify.close();
            }
        );

        const response =
            await fastify.inject({
                method: "GET",
                url:
                    "/api/public/content"
            });

        assert.equal(
            response.statusCode,
            200
        );

        assert.deepEqual(
            response.json(),
            {
                mission: {
                    title:
                        "Unsere Mission"
                }
            }
        );
    }
);

test(
    "Navigation kann gespeichert und gelesen werden",
    async (context) => {
        const database =
            createSiteDatabaseMock();

        const fastify =
            buildApp({
                logger: false,
                databasePool:
                    database
            });

        context.after(
            async () => {
                await fastify.close();
            }
        );

        const navigation = {
            items: [
                {
                    id: "start",
                    label: "Start",
                    href: "/#start"
                }
            ],

            cta: {
                enabled: true,
                label: "Spenden",
                href: "/#spenden"
            }
        };

        const updateResponse =
            await fastify.inject({
                method: "PUT",
                url:
                    "/api/admin/navigation",
                payload:
                    navigation
            });

        assert.equal(
            updateResponse.statusCode,
            200
        );

        const publicResponse =
            await fastify.inject({
                method: "GET",
                url:
                    "/api/public/navigation"
            });

        assert.deepEqual(
            publicResponse.json(),
            navigation
        );
    }
);

test(
    "Startseiten-Layout und Footer können gespeichert werden",
    async (context) => {
        const database =
            createSiteDatabaseMock();

        const fastify =
            buildApp({
                logger: false,
                databasePool:
                    database
            });

        context.after(
            async () => {
                await fastify.close();
            }
        );

        const layoutResponse =
            await fastify.inject({
                method: "PUT",
                url:
                    "/api/admin/home-layout",

                payload: {
                    items: [
                        {
                            id: "start",
                            enabled: true,
                            order: 10
                        }
                    ]
                }
            });

        assert.equal(
            layoutResponse.statusCode,
            200
        );

        const footerResponse =
            await fastify.inject({
                method: "PUT",
                url:
                    "/api/admin/footer",

                payload: {
                    legalName:
                        "BluePulse Tierschutz n.e.V"
                }
            });

        assert.equal(
            footerResponse.statusCode,
            200
        );

        const publicFooter =
            await fastify.inject({
                method: "GET",
                url:
                    "/api/public/footer"
            });

        assert.equal(
            publicFooter
                .json()
                .legalName,
            "BluePulse Tierschutz n.e.V"
        );
    }
);

test(
    "Nicht vorhandene Inhalte liefern HTTP 404",
    async (context) => {
        const database =
            createSiteDatabaseMock();

        const fastify =
            buildApp({
                logger: false,
                databasePool:
                    database
            });

        context.after(
            async () => {
                await fastify.close();
            }
        );

        const response =
            await fastify.inject({
                method: "GET",
                url:
                    "/api/public/content/nicht-vorhanden"
            });

        assert.equal(
            response.statusCode,
            404
        );
    }
);