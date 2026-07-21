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

function createPagesDatabaseMock() {
    const state = {
        pages:
            new Map(),

        versions:
            new Map(),

        nextVersionId: 1
    };

    function toPageRow(
        page
    ) {
        return {
            id:
                page.id,

            title:
                page.title,

            slug:
                page.slug,

            template:
                page.template,

            status:
                page.status,

            blocks:
                cloneValue(
                    page.blocks
                ),

            theme:
                cloneValue(
                    page.theme
                ),

            created_at:
                page.createdAt,

            updated_at:
                page.updatedAt,

            published_at:
                page.publishedAt,

            deleted_at:
                page.deletedAt
        };
    }

    function toVersionRow(
        version
    ) {
        return {
            id:
                version.id,

            page_id:
                version.pageId,

            version_number:
                version.versionNumber,

            snapshot:
                cloneValue(
                    version.snapshot
                ),

            change_type:
                version.changeType,

            created_by:
                null,

            created_at:
                version.createdAt
        };
    }

    async function query(
        queryText,
        parameters = []
    ) {
        const normalizedQuery =
            queryText
                .replace(/\s+/g, " ")
                .trim();

        if (
            normalizedQuery === "BEGIN" ||
            normalizedQuery === "COMMIT" ||
            normalizedQuery === "ROLLBACK"
        ) {
            return {
                rows: []
            };
        }

        if (
            normalizedQuery.includes(
                "SELECT EXISTS ( SELECT 1 FROM pages"
            )
        ) {
            const [
                slug,
                excludedPageId
            ] = parameters;

            const exists = [
                ...state.pages.values()
            ].some(
                (page) =>
                    page.slug ===
                        slug &&
                    !page.deletedAt &&
                    page.id !==
                        excludedPageId
            );

            return {
                rows: [
                    {
                        exists
                    }
                ]
            };
        }

        if (
            normalizedQuery.includes(
                "COALESCE( MAX( version_number )"
            )
        ) {
            const pageId =
                parameters[0];

            const versions =
                state.versions.get(
                    pageId
                ) ?? [];

            return {
                rows: [
                    {
                        next_version:
                            versions.length +
                            1
                    }
                ]
            };
        }

        if (
            normalizedQuery.startsWith(
                "INSERT INTO page_versions"
            )
        ) {
            const [
                pageId,
                versionNumber,
                snapshot,
                changeType
            ] = parameters;

            const version = {
                id:
                    state.nextVersionId++,

                pageId,

                versionNumber,

                snapshot:
                    cloneValue(
                        snapshot
                    ),

                changeType,

                createdAt:
                    new Date()
                        .toISOString()
            };

            const versions =
                state.versions.get(
                    pageId
                ) ?? [];

            versions.push(
                version
            );

            state.versions.set(
                pageId,
                versions
            );

            return {
                rows: [
                    toVersionRow(
                        version
                    )
                ]
            };
        }

        if (
            normalizedQuery.startsWith(
                "INSERT INTO pages"
            )
        ) {
            const [
                id,
                title,
                slug,
                template,
                status,
                blocks,
                theme,
                publishedAt
            ] = parameters;

            const now =
                new Date()
                    .toISOString();

            const page = {
                id,
                title,
                slug,
                template,
                status,

                blocks:
                    cloneValue(
                        blocks
                    ),

                theme:
                    cloneValue(
                        theme
                    ),

                createdAt:
                    now,

                updatedAt:
                    now,

                publishedAt:
                    publishedAt
                        ? new Date(
                            publishedAt
                        ).toISOString()
                        : null,

                deletedAt:
                    null
            };

            state.pages.set(
                id,
                page
            );

            return {
                rows: [
                    toPageRow(
                        page
                    )
                ]
            };
        }

        if (
            normalizedQuery.startsWith(
                "UPDATE pages SET deleted_at = NOW()"
            )
        ) {
            const page =
                state.pages.get(
                    parameters[0]
                );

            page.deletedAt =
                new Date()
                    .toISOString();

            page.updatedAt =
                new Date()
                    .toISOString();

            return {
                rows: [
                    toPageRow(
                        page
                    )
                ]
            };
        }

        if (
            normalizedQuery.startsWith(
                "UPDATE pages SET title = $2"
            )
        ) {
            const [
                id,
                title,
                slug,
                template,
                status,
                blocks,
                theme,
                publishedAt
            ] = parameters;

            const page =
                state.pages.get(id);

            page.title =
                title;

            page.slug =
                slug;

            page.template =
                template;

            page.status =
                status;

            page.blocks =
                cloneValue(
                    blocks
                );

            page.theme =
                cloneValue(
                    theme
                );

            page.publishedAt =
                publishedAt
                    ? new Date(
                        publishedAt
                    ).toISOString()
                    : null;

            page.updatedAt =
                new Date()
                    .toISOString();

            return {
                rows: [
                    toPageRow(
                        page
                    )
                ]
            };
        }

        if (
            normalizedQuery.includes(
                "FROM page_versions"
            ) &&
            normalizedQuery.includes(
                "version_number = $2"
            )
        ) {
            const [
                pageId,
                versionNumber
            ] = parameters;

            const version =
                (
                    state.versions.get(
                        pageId
                    ) ?? []
                ).find(
                    (item) =>
                        item.versionNumber ===
                        Number(
                            versionNumber
                        )
                );

            return {
                rows:
                    version
                        ? [
                            toVersionRow(
                                version
                            )
                        ]
                        : []
            };
        }

        if (
            normalizedQuery.includes(
                "FROM page_versions"
            )
        ) {
            const versions =
                state.versions.get(
                    parameters[0]
                ) ?? [];

            return {
                rows:
                    [...versions]
                        .reverse()
                        .map(
                            toVersionRow
                        )
            };
        }

        if (
            normalizedQuery.includes(
                "FROM pages"
            ) &&
            normalizedQuery.includes(
                "WHERE id = $1"
            )
        ) {
            const page =
                state.pages.get(
                    parameters[0]
                );

            if (
                !page ||
                page.deletedAt
            ) {
                return {
                    rows: []
                };
            }

            return {
                rows: [
                    toPageRow(
                        page
                    )
                ]
            };
        }

        if (
            normalizedQuery.includes(
                "FROM pages"
            ) &&
            normalizedQuery.includes(
                "WHERE slug = $1"
            )
        ) {
            const page = [
                ...state.pages.values()
            ].find(
                (item) =>
                    item.slug ===
                        parameters[0] &&
                    !item.deletedAt &&
                    (
                        !normalizedQuery.includes(
                            "status = 'published'"
                        ) ||
                        item.status ===
                            "published"
                    )
            );

            return {
                rows:
                    page
                        ? [
                            toPageRow(
                                page
                            )
                        ]
                        : []
            };
        }

        if (
            normalizedQuery.includes(
                "FROM pages"
            ) &&
            normalizedQuery.includes(
                "ORDER BY updated_at DESC"
            )
        ) {
            return {
                rows: [
                    ...state.pages.values()
                ]
                    .filter(
                        (page) =>
                            !page.deletedAt
                    )
                    .map(
                        toPageRow
                    )
            };
        }

        throw new Error(
            `Nicht unterstützte Seitenabfrage: ${normalizedQuery}`
        );
    }

    return {
        state,

        query,

        async connect() {
            return {
                query,

                release() {}
            };
        }
    };
}

test(
    "Builder-Seite wird erstellt und versioniert",
    async (context) => {
        const database =
            createPagesDatabaseMock();

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

        const createResponse =
            await fastify.inject({
                method: "POST",

                url:
                    "/api/admin/pages",

                payload: {
                    title:
                        "Unsere Arbeit",

                    slug:
                        "unsere-arbeit",

                    blocks: [],

                    theme: {}
                }
            });

        assert.equal(
            createResponse.statusCode,
            201
        );

        const page =
            createResponse.json();

        assert.equal(
            page.status,
            "draft"
        );

        const versionResponse =
            await fastify.inject({
                method: "GET",

                url:
                    `/api/admin/pages/${page.id}/versions`
            });

        assert.equal(
            versionResponse.statusCode,
            200
        );

        assert.equal(
            versionResponse
                .json()
                .length,
            1
        );

        assert.equal(
            versionResponse
                .json()[0]
                .changeType,
            "create"
        );
    }
);

test(
    "Seitenänderungen erzeugen neue Versionen",
    async (context) => {
        const database =
            createPagesDatabaseMock();

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

        const created =
            (
                await fastify.inject({
                    method: "POST",

                    url:
                        "/api/admin/pages",

                    payload: {
                        title:
                            "Projektseite",

                        slug:
                            "projektseite",

                        blocks: [],

                        theme: {}
                    }
                })
            ).json();

        const updateResponse =
            await fastify.inject({
                method: "PUT",

                url:
                    `/api/admin/pages/${created.id}`,

                payload: {
                    title:
                        "Neue Projektseite"
                }
            });

        assert.equal(
            updateResponse.statusCode,
            200
        );

        const versions =
            (
                await fastify.inject({
                    method: "GET",

                    url:
                        `/api/admin/pages/${created.id}/versions`
                })
            ).json();

        assert.equal(
            versions.length,
            2
        );

        assert.equal(
            versions[0]
                .changeType,
            "save"
        );
    }
);

test(
    "Veröffentlichte Seiten sind öffentlich erreichbar",
    async (context) => {
        const database =
            createPagesDatabaseMock();

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

        const created =
            (
                await fastify.inject({
                    method: "POST",

                    url:
                        "/api/admin/pages",

                    payload: {
                        title:
                            "Öffentliche Seite",

                        slug:
                            "oeffentliche-seite",

                        blocks: [],

                        theme: {}
                    }
                })
            ).json();

        const draftResponse =
            await fastify.inject({
                method: "GET",

                url:
                    "/api/public/pages/oeffentliche-seite"
            });

        assert.equal(
            draftResponse.statusCode,
            404
        );

        await fastify.inject({
            method: "POST",

            url:
                `/api/admin/pages/${created.id}/publish`,

            payload: {}
        });

        const publicResponse =
            await fastify.inject({
                method: "GET",

                url:
                    "/api/public/pages/oeffentliche-seite"
            });

        assert.equal(
            publicResponse.statusCode,
            200
        );

        assert.equal(
            publicResponse
                .json()
                .status,
            "published"
        );
    }
);

test(
    "Seiten können dupliziert und gelöscht werden",
    async (context) => {
        const database =
            createPagesDatabaseMock();

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

        const created =
            (
                await fastify.inject({
                    method: "POST",

                    url:
                        "/api/admin/pages",

                    payload: {
                        title:
                            "Original",

                        slug:
                            "original",

                        blocks: [],

                        theme: {}
                    }
                })
            ).json();

        const duplicateResponse =
            await fastify.inject({
                method: "POST",

                url:
                    `/api/admin/pages/${created.id}/duplicate`
            });

        assert.equal(
            duplicateResponse.statusCode,
            201
        );

        const duplicate =
            duplicateResponse.json();

        assert.equal(
            duplicate.slug,
            "original-kopie"
        );

        const deleteResponse =
            await fastify.inject({
                method: "DELETE",

                url:
                    `/api/admin/pages/${duplicate.id}`
            });

        assert.equal(
            deleteResponse.statusCode,
            204
        );

        const deletedResponse =
            await fastify.inject({
                method: "GET",

                url:
                    `/api/admin/pages/${duplicate.id}`
            });

        assert.equal(
            deletedResponse.statusCode,
            404
        );
    }
);

test(
    "Eine frühere Seitenversion kann wiederhergestellt werden",
    async (context) => {
        const database =
            createPagesDatabaseMock();

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

        const created =
            (
                await fastify.inject({
                    method: "POST",

                    url:
                        "/api/admin/pages",

                    payload: {
                        title:
                            "Erster Titel",

                        slug:
                            "versionsseite",

                        blocks: [],

                        theme: {}
                    }
                })
            ).json();

        await fastify.inject({
            method: "PUT",

            url:
                `/api/admin/pages/${created.id}`,

            payload: {
                title:
                    "Zweiter Titel"
            }
        });

        const restoreResponse =
            await fastify.inject({
                method: "POST",

                url:
                    `/api/admin/pages/${created.id}/versions/1/restore`
            });

        assert.equal(
            restoreResponse.statusCode,
            200
        );

        assert.equal(
            restoreResponse
                .json()
                .title,
            "Erster Titel"
        );

        const versions =
            (
                await fastify.inject({
                    method: "GET",

                    url:
                        `/api/admin/pages/${created.id}/versions`
                })
            ).json();

        assert.equal(
            versions.length,
            3
        );

        assert.equal(
            versions[0]
                .changeType,
            "restore"
        );
    }
);