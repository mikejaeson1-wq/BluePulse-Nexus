import {
    assertStoredMediaFile,
    discardPreparedMediaFile,
    getDefaultMediaName,
    movePreparedMediaFile,
    moveStoredMediaToTombstone,
    removeMediaTombstone,
    restoreMediaTombstone
} from "../media/mediaFileStorage.js";

const MEDIA_SELECT = `
    SELECT
        id,
        storage_key,
        name,
        original_name,
        mime_type,
        file_size,
        width,
        height,
        alt_text,
        caption,
        checksum_sha256,
        created_at,
        updated_at
    FROM media_assets
`;

function createMediaError(
    message,
    statusCode = 400
) {
    const error =
        new Error(message);

    error.statusCode =
        statusCode;

    return error;
}

function assertDatabase(
    database
) {
    if (
        !database ||
        typeof database.query !==
            "function"
    ) {
        throw new Error(
            "Es wurde keine gültige Datenbankverbindung bereitgestellt."
        );
    }
}

function assertTransactionDatabase(
    database
) {
    if (
        !database ||
        typeof database.connect !==
            "function"
    ) {
        throw new Error(
            "Es wurde kein gültiger PostgreSQL-Pool bereitgestellt."
        );
    }
}

function normalizeText(
    value,
    fallback = "",
    maximumLength = 1000
) {
    const normalizedValue =
        String(
            value ?? ""
        )
            .trim()
            .slice(
                0,
                maximumLength
            );

    return normalizedValue ||
        fallback;
}

function normalizeDimension(
    value
) {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return null;
    }

    const numericValue =
        Number.parseInt(
            String(value),
            10
        );

    if (
        !Number.isInteger(
            numericValue
        ) ||
        numericValue <= 0 ||
        numericValue >
            100000
    ) {
        return null;
    }

    return numericValue;
}

function normalizeDate(
    value
) {
    if (!value) {
        return null;
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }

    return date.toISOString();
}

function createMediaReference(
    assetId
) {
    return `media://${assetId}`;
}

function createMediaFileUrl(
    assetId
) {
    return `/api/public/media/${encodeURIComponent(
        assetId
    )}/file`;
}

function mapMediaRow(
    row
) {
    if (!row) {
        return null;
    }

    return {
        id:
            row.id,

        name:
            row.name,

        originalName:
            row.original_name,

        type:
            row.mime_type,

        size:
            Number(
                row.file_size
            ) || 0,

        width:
            row.width === null
                ? null
                : Number(
                    row.width
                ),

        height:
            row.height === null
                ? null
                : Number(
                    row.height
                ),

        altText:
            row.alt_text ??
            "",

        caption:
            row.caption ??
            "",

        checksumSha256:
            row.checksum_sha256,

        createdAt:
            normalizeDate(
                row.created_at
            ),

        updatedAt:
            normalizeDate(
                row.updated_at
            ),

        reference:
            createMediaReference(
                row.id
            ),

        url:
            createMediaFileUrl(
                row.id
            ),

        storageKey:
            row.storage_key
    };
}

async function findMediaRow(
    database,
    assetId,
    {
        lock = false
    } = {}
) {
    const result =
        await database.query(
            `
                ${MEDIA_SELECT}
                WHERE id = $1
                ${lock ? "FOR UPDATE" : ""}
            `,
            [
                assetId
            ]
        );

    return result.rows?.[0] ??
        null;
}

export async function listMediaAssets(
    database
) {
    assertDatabase(
        database
    );

    const result =
        await database.query(`
            ${MEDIA_SELECT}
            ORDER BY created_at DESC
        `);

    return result.rows.map(
        mapMediaRow
    );
}

export async function getMediaAsset(
    database,
    assetId
) {
    assertDatabase(
        database
    );

    const row =
        await findMediaRow(
            database,
            assetId
        );

    return mapMediaRow(
        row
    );
}

export async function createMediaAsset(
    database,
    preparedUpload,
    metadata,
    storageDirectory
) {
    assertTransactionDatabase(
        database
    );

    if (!preparedUpload) {
        throw createMediaError(
            "Es wurde keine Datei zum Speichern bereitgestellt."
        );
    }

    const defaultName =
        getDefaultMediaName(
            preparedUpload
                .originalName
        );

    const name =
        normalizeText(
            metadata?.name,
            defaultName,
            255
        );

    const altText =
        normalizeText(
            metadata?.altText,
            preparedUpload
                .mimeType
                .startsWith(
                    "image/"
                )
                ? defaultName
                : "",
            1000
        );

    const caption =
        normalizeText(
            metadata?.caption,
            "",
            5000
        );

    const width =
        normalizeDimension(
            metadata?.width
        );

    const height =
        normalizeDimension(
            metadata?.height
        );

    const client =
        await database.connect();

    let fileMoved = false;

    try {
        await client.query(
            "BEGIN"
        );

        const result =
            await client.query(
                `
                    INSERT INTO media_assets (
                        id,
                        storage_key,
                        name,
                        original_name,
                        mime_type,
                        file_size,
                        width,
                        height,
                        alt_text,
                        caption,
                        checksum_sha256
                    )
                    VALUES (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7,
                        $8,
                        $9,
                        $10,
                        $11
                    )
                    RETURNING
                        id,
                        storage_key,
                        name,
                        original_name,
                        mime_type,
                        file_size,
                        width,
                        height,
                        alt_text,
                        caption,
                        checksum_sha256,
                        created_at,
                        updated_at
                `,
                [
                    preparedUpload.id,
                    preparedUpload
                        .storageKey,
                    name,
                    preparedUpload
                        .originalName,
                    preparedUpload
                        .mimeType,
                    preparedUpload
                        .fileSize,
                    width,
                    height,
                    altText,
                    caption,
                    preparedUpload
                        .checksumSha256
                ]
            );

        await movePreparedMediaFile(
            preparedUpload
        );

        fileMoved = true;

        await client.query(
            "COMMIT"
        );

        return mapMediaRow(
            result.rows[0]
        );
    } catch (error) {
        try {
            await client.query(
                "ROLLBACK"
            );
        } catch (rollbackError) {
            console.error(
                "Die Medientransaktion konnte nicht zurückgerollt werden.",
                rollbackError
            );
        }

        await discardPreparedMediaFile({
            ...preparedUpload,

            temporaryPath:
                preparedUpload
                    .temporaryPath,

            finalPath:
                fileMoved
                    ? preparedUpload
                        .finalPath
                    : ""
        });

        throw error;
    } finally {
        client.release();
    }
}

export async function updateMediaAsset(
    database,
    assetId,
    changes = {}
) {
    assertDatabase(
        database
    );

    const currentAsset =
        await getMediaAsset(
            database,
            assetId
        );

    if (!currentAsset) {
        throw createMediaError(
            "Die Mediendatei wurde nicht gefunden.",
            404
        );
    }

    const name =
        changes.name !==
            undefined
            ? normalizeText(
                changes.name,
                currentAsset.name,
                255
            )
            : currentAsset.name;

    const altText =
        changes.altText !==
            undefined
            ? normalizeText(
                changes.altText,
                "",
                1000
            )
            : currentAsset.altText;

    const caption =
        changes.caption !==
            undefined
            ? normalizeText(
                changes.caption,
                "",
                5000
            )
            : currentAsset.caption;

    const width =
        changes.width !==
            undefined
            ? normalizeDimension(
                changes.width
            )
            : currentAsset.width;

    const height =
        changes.height !==
            undefined
            ? normalizeDimension(
                changes.height
            )
            : currentAsset.height;

    const result =
        await database.query(
            `
                UPDATE media_assets
                SET
                    name = $2,
                    alt_text = $3,
                    caption = $4,
                    width = $5,
                    height = $6
                WHERE id = $1
                RETURNING
                    id,
                    storage_key,
                    name,
                    original_name,
                    mime_type,
                    file_size,
                    width,
                    height,
                    alt_text,
                    caption,
                    checksum_sha256,
                    created_at,
                    updated_at
            `,
            [
                assetId,
                name,
                altText,
                caption,
                width,
                height
            ]
        );

    return mapMediaRow(
        result.rows[0]
    );
}

export async function getMediaAssetFile(
    database,
    assetId,
    storageDirectory
) {
    const asset =
        await getMediaAsset(
            database,
            assetId
        );

    if (!asset) {
        throw createMediaError(
            "Die Mediendatei wurde nicht gefunden.",
            404
        );
    }

    const filePath =
        await assertStoredMediaFile(
            storageDirectory,
            asset.storageKey
        );

    return {
        asset,
        filePath
    };
}

export async function deleteMediaAsset(
    database,
    assetId,
    storageDirectory
) {
    assertTransactionDatabase(
        database
    );

    const client =
        await database.connect();

    let tombstone = null;

    try {
        await client.query(
            "BEGIN"
        );

        const row =
            await findMediaRow(
                client,
                assetId,
                {
                    lock: true
                }
            );

        if (!row) {
            throw createMediaError(
                "Die Mediendatei wurde nicht gefunden.",
                404
            );
        }

        tombstone =
            await moveStoredMediaToTombstone(
                storageDirectory,
                row.storage_key
            );

        await client.query(
            `
                DELETE FROM media_assets
                WHERE id = $1
            `,
            [
                assetId
            ]
        );

        await client.query(
            "COMMIT"
        );

        await removeMediaTombstone(
            tombstone
        );

        return true;
    } catch (error) {
        try {
            await client.query(
                "ROLLBACK"
            );
        } catch (rollbackError) {
            console.error(
                "Die Medienlöschung konnte nicht zurückgerollt werden.",
                rollbackError
            );
        }

        try {
            await restoreMediaTombstone(
                tombstone
            );
        } catch (restoreError) {
            console.error(
                "Die gelöschte Mediendatei konnte nicht wiederhergestellt werden.",
                restoreError
            );
        }

        throw error;
    } finally {
        client.release();
    }
}