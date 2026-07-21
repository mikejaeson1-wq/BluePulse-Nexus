import assert from "node:assert/strict";

import {
    mkdtemp,
    rm
} from "node:fs/promises";

import os from "node:os";
import path from "node:path";

import test from "node:test";

import {
    buildApp
} from "../src/app.js";

function cloneValue(value) {
    return JSON.parse(
        JSON.stringify(value)
    );
}

function createMediaDatabaseMock() {
    const assets =
        new Map();

    function toRow(asset) {
        return {
            id:
                asset.id,

            storage_key:
                asset.storageKey,

            name:
                asset.name,

            original_name:
                asset.originalName,

            mime_type:
                asset.mimeType,

            file_size:
                asset.fileSize,

            width:
                asset.width,

            height:
                asset.height,

            alt_text:
                asset.altText,

            caption:
                asset.caption,

            checksum_sha256:
                asset.checksumSha256,

            created_at:
                asset.createdAt,

            updated_at:
                asset.updatedAt
        };
    }

    async function query(
        queryText,
        parameters = []
    ) {
        const query =
            queryText
                .replace(
                    /\s+/g,
                    " "
                )
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
            query.startsWith(
                "INSERT INTO media_assets"
            )
        ) {
            const now =
                new Date()
                    .toISOString();

            const asset = {
                id:
                    parameters[0],

                storageKey:
                    parameters[1],

                name:
                    parameters[2],

                originalName:
                    parameters[3],

                mimeType:
                    parameters[4],

                fileSize:
                    parameters[5],

                width:
                    parameters[6],

                height:
                    parameters[7],

                altText:
                    parameters[8],

                caption:
                    parameters[9],

                checksumSha256:
                    parameters[10],

                createdAt:
                    now,

                updatedAt:
                    now
            };

            assets.set(
                asset.id,
                asset
            );

            return {
                rows: [
                    toRow(
                        asset
                    )
                ]
            };
        }

        if (
            query.startsWith(
                "UPDATE media_assets SET"
            )
        ) {
            const asset =
                assets.get(
                    parameters[0]
                );

            if (!asset) {
                return {
                    rows: []
                };
            }

            asset.name =
                parameters[1];

            asset.altText =
                parameters[2];

            asset.caption =
                parameters[3];

            asset.width =
                parameters[4];

            asset.height =
                parameters[5];

            asset.updatedAt =
                new Date()
                    .toISOString();

            return {
                rows: [
                    toRow(
                        asset
                    )
                ]
            };
        }

        if (
            query.startsWith(
                "DELETE FROM media_assets"
            )
        ) {
            assets.delete(
                parameters[0]
            );

            return {
                rows: []
            };
        }

        if (
            query.includes(
                "FROM media_assets"
            ) &&
            query.includes(
                "WHERE id = $1"
            )
        ) {
            const asset =
                assets.get(
                    parameters[0]
                );

            return {
                rows:
                    asset
                        ? [
                            toRow(
                                asset
                            )
                        ]
                        : []
            };
        }

        if (
            query.includes(
                "FROM media_assets"
            ) &&
            query.includes(
                "ORDER BY created_at DESC"
            )
        ) {
            return {
                rows: [
                    ...assets.values()
                ]
                    .reverse()
                    .map(
                        toRow
                    )
            };
        }

        throw new Error(
            `Nicht unterstützte Medienabfrage: ${query}`
        );
    }

    return {
        query,

        async connect() {
            return {
                query,

                release() {}
            };
        }
    };
}

function createMultipartPayload({
    fields = {},
    fileName,
    mimeType,
    content
}) {
    const boundary =
        `----bluepulse-${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}`;

    const chunks = [];

    Object.entries(
        fields
    ).forEach(
        ([
            fieldName,
            value
        ]) => {
            chunks.push(
                Buffer.from(
                    [
                        `--${boundary}`,
                        `Content-Disposition: form-data; name="${fieldName}"`,
                        "",
                        String(value),
                        ""
                    ].join(
                        "\r\n"
                    )
                )
            );
        }
    );

    chunks.push(
        Buffer.from(
            [
                `--${boundary}`,
                `Content-Disposition: form-data; name="file"; filename="${fileName}"`,
                `Content-Type: ${mimeType}`,
                "",
                ""
            ].join(
                "\r\n"
            )
        )
    );

    chunks.push(
        Buffer.from(
            content
        )
    );

    chunks.push(
        Buffer.from(
            `\r\n--${boundary}--\r\n`
        )
    );

    return {
        body:
            Buffer.concat(
                chunks
            ),

        contentType:
            `multipart/form-data; boundary=${boundary}`
    };
}

async function createMediaTestApp(
    context
) {
    const storageDirectory =
        await mkdtemp(
            path.join(
                os.tmpdir(),
                "bluepulse-media-"
            )
        );

    const fastify =
        buildApp({
            logger: false,

            databasePool:
                createMediaDatabaseMock(),

            mediaStorageDirectory:
                storageDirectory
        });

    context.after(
        async () => {
            await fastify.close();

            await rm(
                storageDirectory,
                {
                    recursive: true,
                    force: true
                }
            );
        }
    );

    return fastify;
}

test(
    "Eine Mediendatei kann hochgeladen und öffentlich abgerufen werden",
    async (context) => {
        const fastify =
            await createMediaTestApp(
                context
            );

        const fileContent =
            Buffer.from([
                137,
                80,
                78,
                71,
                13,
                10,
                26,
                10
            ]);

        const multipart =
            createMultipartPayload({
                fields: {
                    name:
                        "BluePulse Testbild",

                    altText:
                        "Testbild",

                    width:
                        100,

                    height:
                        50
                },

                fileName:
                    "test.png",

                mimeType:
                    "image/png",

                content:
                    fileContent
            });

        const uploadResponse =
            await fastify.inject({
                method: "POST",

                url:
                    "/api/admin/media",

                headers: {
                    "content-type":
                        multipart
                            .contentType
                },

                payload:
                    multipart.body
            });

        assert.equal(
            uploadResponse.statusCode,
            201
        );

        const asset =
            uploadResponse.json();

        assert.equal(
            asset.name,
            "BluePulse Testbild"
        );

        assert.equal(
            asset.type,
            "image/png"
        );

        assert.equal(
            asset.width,
            100
        );

        assert.equal(
            asset.reference,
            `media://${asset.id}`
        );

        const fileResponse =
            await fastify.inject({
                method: "GET",

                url:
                    `/api/public/media/${asset.id}/file`
            });

        assert.equal(
            fileResponse.statusCode,
            200
        );

        assert.deepEqual(
            fileResponse.rawPayload,
            fileContent
        );
    }
);

test(
    "Medienmetadaten können geändert werden",
    async (context) => {
        const fastify =
            await createMediaTestApp(
                context
            );

        const multipart =
            createMultipartPayload({
                fileName:
                    "metadata.png",

                mimeType:
                    "image/png",

                content:
                    Buffer.from([
                        1,
                        2,
                        3,
                        4
                    ])
            });

        const asset =
            (
                await fastify.inject({
                    method: "POST",

                    url:
                        "/api/admin/media",

                    headers: {
                        "content-type":
                            multipart
                                .contentType
                    },

                    payload:
                        multipart.body
                })
            ).json();

        const updateResponse =
            await fastify.inject({
                method: "PATCH",

                url:
                    `/api/admin/media/${asset.id}`,

                payload: {
                    name:
                        "Neuer Name",

                    altText:
                        "Neue Beschreibung",

                    caption:
                        "Neue Bildunterschrift"
                }
            });

        assert.equal(
            updateResponse.statusCode,
            200
        );

        const updatedAsset =
            updateResponse.json();

        assert.equal(
            updatedAsset.name,
            "Neuer Name"
        );

        assert.equal(
            updatedAsset.altText,
            "Neue Beschreibung"
        );

        assert.equal(
            updatedAsset.caption,
            "Neue Bildunterschrift"
        );
    }
);

test(
    "Mediendateien können aufgelistet und gelöscht werden",
    async (context) => {
        const fastify =
            await createMediaTestApp(
                context
            );

        const multipart =
            createMultipartPayload({
                fileName:
                    "delete.pdf",

                mimeType:
                    "application/pdf",

                content:
                    Buffer.from(
                        "%PDF-1.4"
                    )
            });

        const asset =
            (
                await fastify.inject({
                    method: "POST",

                    url:
                        "/api/admin/media",

                    headers: {
                        "content-type":
                            multipart
                                .contentType
                    },

                    payload:
                        multipart.body
                })
            ).json();

        const listResponse =
            await fastify.inject({
                method: "GET",

                url:
                    "/api/admin/media"
            });

        assert.equal(
            listResponse.statusCode,
            200
        );

        assert.equal(
            listResponse
                .json()
                .length,
            1
        );

        const deleteResponse =
            await fastify.inject({
                method: "DELETE",

                url:
                    `/api/admin/media/${asset.id}`
            });

        assert.equal(
            deleteResponse.statusCode,
            204
        );

        const missingResponse =
            await fastify.inject({
                method: "GET",

                url:
                    `/api/admin/media/${asset.id}`
            });

        assert.equal(
            missingResponse.statusCode,
            404
        );
    }
);

test(
    "Nicht unterstützte Dateitypen werden abgelehnt",
    async (context) => {
        const fastify =
            await createMediaTestApp(
                context
            );

        const multipart =
            createMultipartPayload({
                fileName:
                    "script.svg",

                mimeType:
                    "image/svg+xml",

                content:
                    Buffer.from(
                        "<svg></svg>"
                    )
            });

        const response =
            await fastify.inject({
                method: "POST",

                url:
                    "/api/admin/media",

                headers: {
                    "content-type":
                        multipart
                            .contentType
                },

                payload:
                    multipart.body
            });

        assert.equal(
            response.statusCode,
            415
        );
    }
);