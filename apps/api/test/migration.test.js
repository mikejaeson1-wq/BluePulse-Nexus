import assert from "node:assert/strict";
import test from "node:test";

import {
    buildApp
} from "../src/app.js";

function createMigrationDatabaseMock() {
    const state = {
        siteContent: 0,
        pages: 0,
        publishedPages: 0,
        draftPages: 0,
        migratedAt: null,
        exportedAt: null,
        mediaCount: 0
    };

    const client = {
        async query(
            queryText,
            parameters = []
        ) {
            const query =
                queryText
                    .replace(/\s+/g, " ")
                    .trim();

            if (
                query === "BEGIN" ||
                query === "COMMIT" ||
                query === "ROLLBACK"
            ) {
                return {
                    rows: []
                };
            }

            if (
                query ===
                "DELETE FROM site_content"
            ) {
                state.siteContent = 0;

                return {
                    rows: []
                };
            }

            if (
                query.startsWith(
                    "INSERT INTO site_content"
                )
            ) {
                state.siteContent += 1;

                return {
                    rows: []
                };
            }

            if (
                query ===
                "DELETE FROM page_versions"
            ) {
                return {
                    rows: []
                };
            }

            if (
                query ===
                "DELETE FROM pages"
            ) {
                state.pages = 0;
                state.publishedPages = 0;
                state.draftPages = 0;

                return {
                    rows: []
                };
            }

            if (
                query.startsWith(
                    "INSERT INTO pages"
                )
            ) {
                state.pages += 1;

                if (
                    parameters[4] ===
                    "published"
                ) {
                    state.publishedPages += 1;
                } else {
                    state.draftPages += 1;
                }

                return {
                    rows: []
                };
            }

            if (
                query.startsWith(
                    "INSERT INTO site_navigation"
                ) ||
                query.startsWith(
                    "INSERT INTO home_layout"
                ) ||
                query.startsWith(
                    "INSERT INTO footer_settings"
                )
            ) {
                return {
                    rows: []
                };
            }

            if (
                query.startsWith(
                    "INSERT INTO system_meta"
                )
            ) {
                const [
                    key,
                    value
                ] = parameters;

                if (
                    key ===
                    "browser_migration_completed_at"
                ) {
                    state.migratedAt =
                        value;
                }

                if (
                    key ===
                    "browser_migration_exported_at"
                ) {
                    state.exportedAt =
                        value;
                }

                if (
                    key ===
                    "browser_migration_media_count"
                ) {
                    state.mediaCount =
                        Number(value);
                }

                return {
                    rows: []
                };
            }

            throw new Error(
                `Nicht unterstützte Migrationsabfrage: ${query}`
            );
        },

        release() {}
    };

    return {
        state,

        async connect() {
            return client;
        },

        async query(queryText) {
            const query =
                queryText
                    .replace(/\s+/g, " ")
                    .trim();

            if (
                query.includes(
                    "FROM site_content"
                ) &&
                query.includes(
                    "browser_migration_completed_at"
                )
            ) {
                return {
                    rows: [
                        {
                            site_content_count:
                                state.siteContent,

                            page_count:
                                state.pages,

                            published_page_count:
                                state
                                    .publishedPages,

                            draft_page_count:
                                state
                                    .draftPages,

                            migrated_at:
                                state.migratedAt,

                            exported_at:
                                state.exportedAt,

                            media_count:
                                String(
                                    state.mediaCount
                                )
                        }
                    ]
                };
            }

            throw new Error(
                `Nicht unterstützte Statusabfrage: ${query}`
            );
        }
    };
}

function createMigrationPayload() {
    return {
        format:
            "bluepulse-browser-migration",

        formatVersion: 1,

        exportedAt:
            new Date()
                .toISOString(),

        siteContent: {
            hero: {
                titleLine1:
                    "Every Life",

                titleLine2:
                    "Matters"
            }
        },

        navigation: {
            items: [],
            cta: {}
        },

        homeLayout: {
            items: []
        },

        footer: {
            legalName:
                "BluePulse Tierschutz n.e.V"
        },

        pages: [
            {
                id:
                    "test-page",

                title:
                    "Testseite",

                slug:
                    "testseite",

                template:
                    "blank",

                status:
                    "published",

                blocks: [],

                theme: {},

                createdAt:
                    new Date()
                        .toISOString(),

                updatedAt:
                    new Date()
                        .toISOString(),

                publishedAt:
                    new Date()
                        .toISOString()
            }
        ],

        mediaSummary: {
            count: 3,
            totalBytes: 1000
        }
    };
}

test(
    "Browserdaten können nach PostgreSQL migriert werden",
    async (context) => {
        const database =
            createMigrationDatabaseMock();

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
                method: "POST",

                url:
                    "/api/admin/migration/browser-data",

                payload:
                    createMigrationPayload()
            });

        assert.equal(
            response.statusCode,
            200
        );

        const payload =
            response.json();

        assert.equal(
            payload.status,
            "completed"
        );

        assert.equal(
            payload.siteContent,
            1
        );

        assert.equal(
            payload.pages,
            1
        );

        assert.equal(
            payload.publishedPages,
            1
        );

        assert.equal(
            payload.mediaAssetsNotTransferred,
            3
        );
    }
);

test(
    "Migrationsstatus zeigt den PostgreSQL-Stand",
    async (context) => {
        const database =
            createMigrationDatabaseMock();

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

        await fastify.inject({
            method: "POST",

            url:
                "/api/admin/migration/browser-data",

            payload:
                createMigrationPayload()
        });

        const response =
            await fastify.inject({
                method: "GET",

                url:
                    "/api/admin/migration/status"
            });

        assert.equal(
            response.statusCode,
            200
        );

        const payload =
            response.json();

        assert.equal(
            payload.migrated,
            true
        );

        assert.equal(
            payload.siteContent,
            1
        );

        assert.equal(
            payload.pages,
            1
        );

        assert.equal(
            payload.mediaAssetsNotTransferred,
            3
        );
    }
);