import {
    createHash,
    randomUUID
} from "node:crypto";

import {
    createWriteStream
} from "node:fs";

import {
    access,
    mkdir,
    rename,
    unlink
} from "node:fs/promises";

import path from "node:path";

import {
    Transform
} from "node:stream";

import {
    pipeline
} from "node:stream/promises";

import runtimeConfig from "../config/runtimeConfig.js";

const MIME_TYPE_EXTENSIONS =
    Object.freeze({
        "image/jpeg":
            ".jpg",

        "image/png":
            ".png",

        "image/webp":
            ".webp",

        "image/gif":
            ".gif",

        "image/avif":
            ".avif",

        "application/pdf":
            ".pdf"
    });

function createStorageError(
    message,
    statusCode = 400
) {
    const error =
        new Error(message);

    error.statusCode =
        statusCode;

    return error;
}

function removeFileExtension(
    fileName
) {
    return fileName.replace(
        /\.[^/.]+$/,
        ""
    );
}

export function sanitizeMediaFileName(
    value
) {
    const baseName =
        path.basename(
            String(
                value ??
                "datei"
            )
        );

    const sanitizedName =
        baseName
            .replace(
                /[\u0000-\u001f\u007f]/g,
                ""
            )
            .trim()
            .slice(
                0,
                255
            );

    return sanitizedName ||
        "datei";
}

export function getDefaultMediaName(
    originalName
) {
    return (
        removeFileExtension(
            sanitizeMediaFileName(
                originalName
            )
        ) ||
        "Datei"
    );
}

export function normalizeMediaMimeType(
    value
) {
    return String(value ?? "")
        .trim()
        .toLowerCase();
}

export function assertSupportedMediaMimeType(
    mimeType
) {
    const normalizedMimeType =
        normalizeMediaMimeType(
            mimeType
        );

    if (
        !runtimeConfig
            .media
            .allowedMimeTypes
            .includes(
                normalizedMimeType
            )
    ) {
        throw createStorageError(
            "Dieser Dateityp wird nicht unterstützt. Erlaubt sind JPEG, PNG, WebP, GIF, AVIF und PDF.",
            415
        );
    }

    return normalizedMimeType;
}

export function getStoredMediaPath(
    storageDirectory,
    storageKey
) {
    return path.join(
        storageDirectory,
        storageKey
    );
}

async function removeFileQuietly(
    filePath
) {
    if (!filePath) {
        return;
    }

    try {
        await unlink(
            filePath
        );
    } catch (error) {
        if (
            error?.code !==
            "ENOENT"
        ) {
            throw error;
        }
    }
}

export async function prepareMediaFileUpload({
    stream,
    filename,
    mimetype,
    storageDirectory,
    maximumFileSizeBytes =
        runtimeConfig.media
            .maximumFileSizeBytes
}) {
    if (
        !stream ||
        typeof stream.pipe !==
            "function"
    ) {
        throw createStorageError(
            "Es wurde keine gültige Datei übertragen."
        );
    }

    const mimeType =
        assertSupportedMediaMimeType(
            mimetype
        );

    const extension =
        MIME_TYPE_EXTENSIONS[
            mimeType
        ];

    const id =
        randomUUID();

    const storageKey =
        `${id}${extension}`;

    const originalName =
        sanitizeMediaFileName(
            filename
        );

    await mkdir(
        storageDirectory,
        {
            recursive: true
        }
    );

    const temporaryPath =
        path.join(
            storageDirectory,
            `.${storageKey}.uploading`
        );

    const finalPath =
        getStoredMediaPath(
            storageDirectory,
            storageKey
        );

    const checksum =
        createHash(
            "sha256"
        );

    let fileSize = 0;

    const meter =
        new Transform({
            transform(
                chunk,
                encoding,
                callback
            ) {
                fileSize +=
                    chunk.length;

                if (
                    fileSize >
                    maximumFileSizeBytes
                ) {
                    callback(
                        createStorageError(
                            "Die Datei ist größer als 15 MB.",
                            413
                        )
                    );

                    return;
                }

                checksum.update(
                    chunk
                );

                callback(
                    null,
                    chunk
                );
            }
        });

    try {
        await pipeline(
            stream,
            meter,

            createWriteStream(
                temporaryPath,
                {
                    flags: "wx"
                }
            )
        );

        if (
            stream.truncated
        ) {
            throw createStorageError(
                "Die Datei ist größer als 15 MB.",
                413
            );
        }

        if (
            fileSize <= 0
        ) {
            throw createStorageError(
                "Leere Dateien können nicht hochgeladen werden."
            );
        }

        return {
            id,
            storageKey,
            originalName,
            mimeType,
            fileSize,

            checksumSha256:
                checksum.digest(
                    "hex"
                ),

            temporaryPath,
            finalPath
        };
    } catch (error) {
        await removeFileQuietly(
            temporaryPath
        );

        if (
            error?.code ===
            "FST_REQ_FILE_TOO_LARGE"
        ) {
            throw createStorageError(
                "Die Datei ist größer als 15 MB.",
                413
            );
        }

        throw error;
    }
}

export async function movePreparedMediaFile(
    preparedUpload
) {
    await rename(
        preparedUpload
            .temporaryPath,

        preparedUpload
            .finalPath
    );
}

export async function discardPreparedMediaFile(
    preparedUpload
) {
    if (!preparedUpload) {
        return;
    }

    await removeFileQuietly(
        preparedUpload
            .temporaryPath
    );

    await removeFileQuietly(
        preparedUpload
            .finalPath
    );
}

export async function assertStoredMediaFile(
    storageDirectory,
    storageKey
) {
    const filePath =
        getStoredMediaPath(
            storageDirectory,
            storageKey
        );

    try {
        await access(
            filePath
        );
    } catch (error) {
        if (
            error?.code ===
            "ENOENT"
        ) {
            throw createStorageError(
                "Die Mediendatei wurde auf dem Server nicht gefunden.",
                404
            );
        }

        throw error;
    }

    return filePath;
}

export async function moveStoredMediaToTombstone(
    storageDirectory,
    storageKey
) {
    const originalPath =
        getStoredMediaPath(
            storageDirectory,
            storageKey
        );

    const tombstonePath =
        `${originalPath}.deleting-${randomUUID()}`;

    try {
        await rename(
            originalPath,
            tombstonePath
        );

        return {
            moved: true,
            originalPath,
            tombstonePath
        };
    } catch (error) {
        if (
            error?.code ===
            "ENOENT"
        ) {
            return {
                moved: false,
                originalPath,
                tombstonePath
            };
        }

        throw error;
    }
}

export async function restoreMediaTombstone(
    tombstone
) {
    if (
        !tombstone?.moved
    ) {
        return;
    }

    try {
        await rename(
            tombstone
                .tombstonePath,

            tombstone
                .originalPath
        );
    } catch (error) {
        if (
            error?.code !==
            "ENOENT"
        ) {
            throw error;
        }
    }
}

export async function removeMediaTombstone(
    tombstone
) {
    if (
        !tombstone?.moved
    ) {
        return;
    }

    await removeFileQuietly(
        tombstone
            .tombstonePath
    );
}