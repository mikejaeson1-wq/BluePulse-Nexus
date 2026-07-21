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
    fileName,
    mimeType,
    content
}) {
    const boundary =
        `----bluepulse-${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}`;

    const body =
        Buffer.concat([
            Buffer.from(
                [
                    `--${boundary}`,
                    'Content-Disposition: form-data; name="name"',
                    "",
                    "Importiertes Bild",
                    `--${boundary}`,
                    `Content-Disposition: form-data; name="file"; filename="${fileName}"`,
                    `Content-Type: ${mimeType}`,
                    "",
                    ""
                ].join(
                    "\r\n"
                )
            ),

            Buffer.from(
                content
            ),

            Buffer.from(
                `\r\n--${boundary}--\r\n`
            )
        ]);

    return {
        body,

        contentType:
            `multipart/form-data; boundary=${boundary}`
    };
}

test(
    "IndexedDB-Medien werden mit unveränderter ID importiert",
    async (context) => {
        const storageDirectory =
            await mkdtemp(
                path.join(
                    os.tmpdir(),
                    "bluepulse-media-import-"
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

        const legacyAssetId =
            "media-legacy-12345";

        const multipart =
            createMultipartPayload({
                fileName:
                    "legacy.png",

                mimeType:
                    "image/png",

                content:
                    Buffer.from([
                        137,
                        80,
                        78,
                        71
                    ])
            });

        const response =
            await fastify.inject({
                method: "POST",

                url:
                    `/api/admin/media/import/${legacyAssetId}`,

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
            201
        );

        const asset =
            response.json();

        assert.equal(
            asset.id,
            legacyAssetId
        );

        assert.equal(
            asset.reference,
            `media://${legacyAssetId}`
        );

        const metadataResponse =
            await fastify.inject({
                method: "GET",

                url:
                    `/api/public/media/${legacyAssetId}`
            });

        assert.equal(
            metadataResponse.statusCode,
            200
        );

        assert.equal(
            metadataResponse
                .json()
                .id,
            legacyAssetId
        );
    }
);