import {
    apiGet,
    apiPost
} from "@shared/data/api/apiClient";

import {
    getMediaAssets
} from "@shared/media/mediaService";

function sumAssetSizes(
    assets
) {
    return assets.reduce(
        (
            total,
            asset
        ) =>
            total +
            (
                Number(
                    asset.size
                ) || 0
            ),
        0
    );
}

function appendOptionalField(
    formData,
    fieldName,
    value
) {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return;
    }

    formData.append(
        fieldName,
        String(value)
    );
}

function createAssetFormData(
    asset
) {
    if (
        !asset?.blob ||
        !(asset.blob instanceof Blob)
    ) {
        throw new Error(
            `„${asset?.name ?? asset?.id ?? "Unbekannte Datei"}“ besitzt keine lesbare lokale Datei.`
        );
    }

    const formData =
        new FormData();

    appendOptionalField(
        formData,
        "name",
        asset.name
    );

    appendOptionalField(
        formData,
        "altText",
        asset.altText
    );

    appendOptionalField(
        formData,
        "caption",
        asset.caption
    );

    appendOptionalField(
        formData,
        "width",
        asset.width
    );

    appendOptionalField(
        formData,
        "height",
        asset.height
    );

    formData.append(
        "file",
        asset.blob,
        asset.originalName ||
            asset.name ||
            `${asset.id}.bin`
    );

    return formData;
}

export async function inspectMediaMigration() {
    const [
        localAssets,
        serverAssets
    ] =
        await Promise.all([
            getMediaAssets(),

            apiGet(
                "/admin/media"
            )
        ]);

    const normalizedServerAssets =
        Array.isArray(
            serverAssets
        )
            ? serverAssets
            : [];

    const serverIds =
        new Set(
            normalizedServerAssets.map(
                (asset) =>
                    asset.id
            )
        );

    const matchingAssets =
        localAssets.filter(
            (asset) =>
                serverIds.has(
                    asset.id
                )
        );

    const pendingAssets =
        localAssets.filter(
            (asset) =>
                !serverIds.has(
                    asset.id
                )
        );

    const unreadableAssets =
        pendingAssets.filter(
            (asset) =>
                !asset.blob ||
                !(asset.blob instanceof Blob)
        );

    return {
        localAssets,
        serverAssets:
            normalizedServerAssets,

        pendingAssets,

        summary: {
            localCount:
                localAssets.length,

            localBytes:
                sumAssetSizes(
                    localAssets
                ),

            serverCount:
                normalizedServerAssets
                    .length,

            serverBytes:
                sumAssetSizes(
                    normalizedServerAssets
                ),

            matchingCount:
                matchingAssets.length,

            pendingCount:
                pendingAssets.length,

            unreadableCount:
                unreadableAssets.length
        }
    };
}

export async function migrateLocalMediaAssets(
    assets,
    {
        onProgress
    } = {}
) {
    const serverAssets =
        await apiGet(
            "/admin/media"
        );

    const existingIds =
        new Set(
            (
                Array.isArray(
                    serverAssets
                )
                    ? serverAssets
                    : []
            ).map(
                (asset) =>
                    asset.id
            )
        );

    const sourceAssets =
        Array.isArray(
            assets
        )
            ? assets
            : [];

    const result = {
        transferred: [],
        skipped: [],
        failed: []
    };

    for (
        let index = 0;
        index <
            sourceAssets.length;
        index += 1
    ) {
        const asset =
            sourceAssets[index];

        const progressBase = {
            current:
                index + 1,

            total:
                sourceAssets.length,

            assetId:
                asset.id,

            assetName:
                asset.name ||
                asset.originalName ||
                asset.id
        };

        if (
            existingIds.has(
                asset.id
            )
        ) {
            result.skipped.push({
                id:
                    asset.id,

                name:
                    asset.name,

                reason:
                    "Bereits vorhanden"
            });

            onProgress?.({
                ...progressBase,
                status:
                    "skipped"
            });

            continue;
        }

        onProgress?.({
            ...progressBase,
            status:
                "uploading"
        });

        try {
            const formData =
                createAssetFormData(
                    asset
                );

            const uploadedAsset =
                await apiPost(
                    `/admin/media/import/${encodeURIComponent(
                        asset.id
                    )}`,
                    formData
                );

            existingIds.add(
                asset.id
            );

            result.transferred.push(
                uploadedAsset
            );

            onProgress?.({
                ...progressBase,
                status:
                    "completed"
            });
        } catch (error) {
            if (
                error?.status ===
                409
            ) {
                existingIds.add(
                    asset.id
                );

                result.skipped.push({
                    id:
                        asset.id,

                    name:
                        asset.name,

                    reason:
                        "Bereits vorhanden"
                });

                onProgress?.({
                    ...progressBase,
                    status:
                        "skipped"
                });

                continue;
            }

            result.failed.push({
                id:
                    asset.id,

                name:
                    asset.name,

                message:
                    error.message ??
                    "Unbekannter Übertragungsfehler"
            });

            onProgress?.({
                ...progressBase,
                status:
                    "failed"
            });
        }
    }

    return result;
}