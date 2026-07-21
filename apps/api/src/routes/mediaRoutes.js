import {
    createReadStream
} from "node:fs";

import {
    discardPreparedMediaFile,
    prepareMediaFileUpload
} from "../media/mediaFileStorage.js";

import {
    createMediaAsset,
    deleteMediaAsset,
    getMediaAsset,
    getMediaAssetFile,
    listMediaAssets,
    updateMediaAsset
} from "../services/mediaService.js";

const arbitraryObjectSchema = {
    type: "object",
    additionalProperties: true
};

const assetIdParametersSchema = {
    type: "object",

    required: [
        "assetId"
    ],

    properties: {
        assetId: {
            type: "string",
            minLength: 1,
            maxLength: 180
        }
    }
};

const metadataBodySchema = {
    type: "object",

    properties: {
        name: {
            type: "string"
        },

        altText: {
            type: "string"
        },

        caption: {
            type: "string"
        },

        width: {
            anyOf: [
                {
                    type: "integer"
                },
                {
                    type: "null"
                }
            ]
        },

        height: {
            anyOf: [
                {
                    type: "integer"
                },
                {
                    type: "null"
                }
            ]
        }
    },

    additionalProperties: false
};

function createRouteError(
    message,
    statusCode = 400
) {
    const error =
        new Error(message);

    error.statusCode =
        statusCode;

    return error;
}

function sendMediaNotFound(
    reply
) {
    return reply
        .status(404)
        .send({
            statusCode: 404,
            error: "Not Found",
            message:
                "Die Mediendatei wurde nicht gefunden."
        });
}

async function readUpload(
    request,
    storageDirectory
) {
    const metadata = {};

    let preparedUpload =
        null;

    try {
        for await (
            const part
            of request.parts()
        ) {
            if (
                part.type ===
                "file"
            ) {
                if (preparedUpload) {
                    part.file.resume();

                    throw createRouteError(
                        "Pro Anfrage kann nur eine Datei hochgeladen werden."
                    );
                }

                preparedUpload =
                    await prepareMediaFileUpload({
                        stream:
                            part.file,

                        filename:
                            part.filename,

                        mimetype:
                            part.mimetype,

                        storageDirectory
                    });

                continue;
            }

            if (
                [
                    "name",
                    "altText",
                    "caption",
                    "width",
                    "height"
                ].includes(
                    part.fieldname
                )
            ) {
                metadata[
                    part.fieldname
                ] =
                    part.value;
            }
        }

        if (!preparedUpload) {
            throw createRouteError(
                "Es wurde keine Datei hochgeladen."
            );
        }

        return {
            preparedUpload,
            metadata
        };
    } catch (error) {
        await discardPreparedMediaFile(
            preparedUpload
        );

        throw error;
    }
}

export default async function mediaRoutes(
    fastify
) {
    fastify.get(
        "/admin/media",
        {
            schema: {
                response: {
                    200: {
                        type: "array",

                        items:
                            arbitraryObjectSchema
                    }
                }
            }
        },
        async () => {
            return listMediaAssets(
                fastify.database
            );
        }
    );

    fastify.post(
        "/admin/media",
        async (
            request,
            reply
        ) => {
            const {
                preparedUpload,
                metadata
            } =
                await readUpload(
                    request,
                    fastify
                        .mediaStorageDirectory
                );

            try {
                const asset =
                    await createMediaAsset(
                        fastify.database,
                        preparedUpload,
                        metadata,
                        fastify
                            .mediaStorageDirectory
                    );

                return reply
                    .status(201)
                    .send(asset);
            } catch (error) {
                await discardPreparedMediaFile(
                    preparedUpload
                );

                throw error;
            }
        }
    );

    fastify.get(
        "/admin/media/:assetId",
        {
            schema: {
                params:
                    assetIdParametersSchema,

                response: {
                    200:
                        arbitraryObjectSchema
                }
            }
        },
        async (
            request,
            reply
        ) => {
            const asset =
                await getMediaAsset(
                    fastify.database,
                    request.params
                        .assetId
                );

            if (!asset) {
                return sendMediaNotFound(
                    reply
                );
            }

            return asset;
        }
    );

    fastify.patch(
        "/admin/media/:assetId",
        {
            schema: {
                params:
                    assetIdParametersSchema,

                body:
                    metadataBodySchema,

                response: {
                    200:
                        arbitraryObjectSchema
                }
            }
        },
        async (
            request
        ) => {
            return updateMediaAsset(
                fastify.database,
                request.params
                    .assetId,
                request.body
            );
        }
    );

    fastify.delete(
        "/admin/media/:assetId",
        {
            schema: {
                params:
                    assetIdParametersSchema
            }
        },
        async (
            request,
            reply
        ) => {
            await deleteMediaAsset(
                fastify.database,
                request.params
                    .assetId,
                fastify
                    .mediaStorageDirectory
            );

            return reply
                .status(204)
                .send();
        }
    );

    fastify.get(
        "/public/media/:assetId",
        {
            schema: {
                params:
                    assetIdParametersSchema,

                response: {
                    200:
                        arbitraryObjectSchema
                }
            }
        },
        async (
            request,
            reply
        ) => {
            const asset =
                await getMediaAsset(
                    fastify.database,
                    request.params
                        .assetId
                );

            if (!asset) {
                return sendMediaNotFound(
                    reply
                );
            }

            return asset;
        }
    );

    fastify.get(
        "/public/media/:assetId/file",
        {
            schema: {
                params:
                    assetIdParametersSchema
            }
        },
        async (
            request,
            reply
        ) => {
            const {
                asset,
                filePath
            } =
                await getMediaAssetFile(
                    fastify.database,
                    request.params
                        .assetId,
                    fastify
                        .mediaStorageDirectory
                );

            const etag =
                `"${asset.checksumSha256}"`;

            if (
                request.headers[
                    "if-none-match"
                ] === etag
            ) {
                return reply
                    .status(304)
                    .send();
            }

            reply.header(
                "Content-Type",
                asset.type
            );

            reply.header(
                "Content-Length",
                String(
                    asset.size
                )
            );

            reply.header(
                "Content-Disposition",
                `inline; filename*=UTF-8''${encodeURIComponent(
                    asset.originalName
                )}`
            );

            reply.header(
                "Cache-Control",
                "public, max-age=31536000, immutable"
            );

            reply.header(
                "ETag",
                etag
            );

            reply.header(
                "X-Content-Type-Options",
                "nosniff"
            );

            return reply.send(
                createReadStream(
                    filePath
                )
            );
        }
    );
}