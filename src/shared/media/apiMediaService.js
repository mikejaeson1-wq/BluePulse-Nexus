import {
    apiDelete,
    apiGet,
    apiPatch,
    apiPost
} from "@shared/data/api/apiClient";

const MAX_FILE_SIZE =
    15 * 1024 * 1024;

const CHANGE_EVENT =
    "bluepulse:media-library-change";

const SUPPORTED_MIME_TYPES =
    new Set([
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/avif",
        "application/pdf"
    ]);

function emitMediaChange(
    assetId = null
) {
    if (
        typeof globalThis.window ===
        "undefined"
    ) {
        return;
    }

    globalThis.window.dispatchEvent(
        new CustomEvent(
            CHANGE_EVENT,
            {
                detail: {
                    assetId
                }
            }
        )
    );
}

function removeFileExtension(
    fileName
) {
    return String(
        fileName ?? ""
    ).replace(
        /\.[^/.]+$/,
        ""
    );
}

function validateFile(file) {
    if (
        !file ||
        !(file instanceof Blob)
    ) {
        throw new Error(
            "Es wurde keine gültige Datei ausgewählt."
        );
    }

    if (
        !SUPPORTED_MIME_TYPES.has(
            file.type
        )
    ) {
        throw new Error(
            `„${file.name}“ wird nicht unterstützt. Erlaubt sind JPEG, PNG, WebP, GIF, AVIF und PDF.`
        );
    }

    if (
        file.size <= 0
    ) {
        throw new Error(
            `„${file.name}“ ist leer.`
        );
    }

    if (
        file.size >
        MAX_FILE_SIZE
    ) {
        throw new Error(
            `„${file.name}“ ist größer als 15 MB.`
        );
    }
}

function getImageDimensions(file) {
    if (
        !file.type.startsWith(
            "image/"
        )
    ) {
        return Promise.resolve({
            width: null,
            height: null
        });
    }

    return new Promise(
        (resolve) => {
            const objectUrl =
                globalThis.URL
                    .createObjectURL(
                        file
                    );

            const image =
                new globalThis.Image();

            image.onload = () => {
                resolve({
                    width:
                        image.naturalWidth,

                    height:
                        image.naturalHeight
                });

                globalThis.URL
                    .revokeObjectURL(
                        objectUrl
                    );
            };

            image.onerror = () => {
                resolve({
                    width: null,
                    height: null
                });

                globalThis.URL
                    .revokeObjectURL(
                        objectUrl
                    );
            };

            image.src =
                objectUrl;
        }
    );
}

function appendFormField(
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

function normalizeAsset(asset) {
    if (
        !asset ||
        typeof asset !==
            "object" ||
        Array.isArray(asset)
    ) {
        return null;
    }

    const id =
        String(
            asset.id ?? ""
        ).trim();

    if (!id) {
        return null;
    }

    return {
        ...asset,

        id,

        name:
            String(
                asset.name ??
                asset.originalName ??
                "Datei"
            ),

        originalName:
            String(
                asset.originalName ??
                asset.name ??
                "Datei"
            ),

        type:
            String(
                asset.type ??
                "application/octet-stream"
            ),

        size:
            Number(
                asset.size
            ) || 0,

        width:
            asset.width ===
                null ||
            asset.width ===
                undefined
                ? null
                : Number(
                    asset.width
                ),

        height:
            asset.height ===
                null ||
            asset.height ===
                undefined
                ? null
                : Number(
                    asset.height
                ),

        altText:
            String(
                asset.altText ??
                ""
            ),

        caption:
            String(
                asset.caption ??
                ""
            ),

        reference:
            asset.reference ||
            createMediaReference(
                id
            ),

        url:
            asset.url ||
            createMediaFileUrl(
                id
            ),

        storage:
            "api"
    };
}

function normalizeAssets(assets) {
    if (!Array.isArray(assets)) {
        return [];
    }

    return assets
        .map(
            normalizeAsset
        )
        .filter(Boolean);
}

async function createUploadFormData(
    file
) {
    validateFile(file);

    const dimensions =
        await getImageDimensions(
            file
        );

    const formData =
        new FormData();

    appendFormField(
        formData,
        "name",
        file.name
    );

    appendFormField(
        formData,
        "altText",
        file.type.startsWith(
            "image/"
        )
            ? removeFileExtension(
                file.name
            )
            : ""
    );

    appendFormField(
        formData,
        "width",
        dimensions.width
    );

    appendFormField(
        formData,
        "height",
        dimensions.height
    );

    formData.append(
        "file",
        file,
        file.name
    );

    return formData;
}

export async function getMediaAssets({
    signal
} = {}) {
    const assets =
        await apiGet(
            "/admin/media",
            {
                signal
            }
        );

    return normalizeAssets(
        assets
    );
}

export async function getMediaAsset(
    assetId,
    {
        signal
    } = {}
) {
    if (!assetId) {
        return null;
    }

    try {
        const asset =
            await apiGet(
                `/public/media/${encodeURIComponent(
                    assetId
                )}`,
                {
                    signal
                }
            );

        return normalizeAsset(
            asset
        );
    } catch (error) {
        if (
            error?.status ===
            404
        ) {
            return null;
        }

        throw error;
    }
}

export async function addMediaFiles(
    files
) {
    const fileList =
        Array.from(
            files ?? []
        );

    if (
        fileList.length ===
        0
    ) {
        return [];
    }

    const uploadedAssets = [];

    for (const file of fileList) {
        const formData =
            await createUploadFormData(
                file
            );

        const uploadedAsset =
            await apiPost(
                "/admin/media",
                formData
            );

        const normalizedAsset =
            normalizeAsset(
                uploadedAsset
            );

        if (normalizedAsset) {
            uploadedAssets.push(
                normalizedAsset
            );

            emitMediaChange(
                normalizedAsset.id
            );
        }
    }

    return uploadedAssets;
}

export async function updateMediaAsset(
    assetId,
    changes = {}
) {
    if (!assetId) {
        throw new Error(
            "Es wurde keine Medien-ID angegeben."
        );
    }

    const allowedChanges = {};

    [
        "name",
        "altText",
        "caption",
        "width",
        "height"
    ].forEach(
        (fieldName) => {
            if (
                changes[fieldName] !==
                undefined
            ) {
                allowedChanges[
                    fieldName
                ] =
                    changes[
                        fieldName
                    ];
            }
        }
    );

    const asset =
        await apiPatch(
            `/admin/media/${encodeURIComponent(
                assetId
            )}`,
            allowedChanges
        );

    const normalizedAsset =
        normalizeAsset(
            asset
        );

    emitMediaChange(
        assetId
    );

    return normalizedAsset;
}

export async function deleteMediaAsset(
    assetId
) {
    if (!assetId) {
        throw new Error(
            "Es wurde keine Medien-ID angegeben."
        );
    }

    await apiDelete(
        `/admin/media/${encodeURIComponent(
            assetId
        )}`
    );

    emitMediaChange(
        assetId
    );

    return true;
}

export function subscribeToMediaLibrary(
    listener
) {
    if (
        typeof globalThis.window ===
        "undefined"
    ) {
        return () => {};
    }

    function handleChange(event) {
        listener(
            event.detail?.assetId ??
            null
        );
    }

    globalThis.window.addEventListener(
        CHANGE_EVENT,
        handleChange
    );

    return () => {
        globalThis.window
            .removeEventListener(
                CHANGE_EVENT,
                handleChange
            );
    };
}