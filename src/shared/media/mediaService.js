const DATABASE_NAME =
    "bluepulse-nexus-media";

const DATABASE_VERSION = 1;

const STORE_NAME = "assets";

const MAX_FILE_SIZE =
    15 * 1024 * 1024;

const SUPPORTED_TYPES = [
    "application/pdf"
];

const CHANGE_EVENT =
    "bluepulse:media-library-change";

function createId() {
    if (
        globalThis.crypto
            ?.randomUUID
    ) {
        return globalThis.crypto
            .randomUUID();
    }

    return `media-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
}

function requestToPromise(
    request
) {
    return new Promise(
        (
            resolve,
            reject
        ) => {
            request.onsuccess =
                () => {
                    resolve(
                        request.result
                    );
                };

            request.onerror =
                () => {
                    reject(
                        request.error ??
                        new Error(
                            "IndexedDB-Anfrage fehlgeschlagen."
                        )
                    );
                };
        }
    );
}

function transactionToPromise(
    transaction
) {
    return new Promise(
        (
            resolve,
            reject
        ) => {
            transaction.oncomplete =
                () =>
                    resolve();

            transaction.onerror =
                () => {
                    reject(
                        transaction.error ??
                        new Error(
                            "IndexedDB-Transaktion fehlgeschlagen."
                        )
                    );
                };

            transaction.onabort =
                () => {
                    reject(
                        transaction.error ??
                        new Error(
                            "IndexedDB-Transaktion wurde abgebrochen."
                        )
                    );
                };
        }
    );
}

function openDatabase() {
    return new Promise(
        (
            resolve,
            reject
        ) => {
            if (
                !globalThis
                    .indexedDB
            ) {
                reject(
                    new Error(
                        "Dieser Browser unterstützt keine IndexedDB-Medienbibliothek."
                    )
                );

                return;
            }

            const request =
                globalThis
                    .indexedDB
                    .open(
                        DATABASE_NAME,
                        DATABASE_VERSION
                    );

            request.onupgradeneeded =
                () => {
                    const database =
                        request.result;

                    if (
                        database
                            .objectStoreNames
                            .contains(
                                STORE_NAME
                            )
                    ) {
                        return;
                    }

                    const store =
                        database
                            .createObjectStore(
                                STORE_NAME,
                                {
                                    keyPath:
                                        "id"
                                }
                            );

                    store.createIndex(
                        "createdAt",
                        "createdAt",
                        {
                            unique:
                                false
                        }
                    );

                    store.createIndex(
                        "type",
                        "type",
                        {
                            unique:
                                false
                        }
                    );
                };

            request.onsuccess =
                () => {
                    resolve(
                        request.result
                    );
                };

            request.onerror =
                () => {
                    reject(
                        request.error ??
                        new Error(
                            "Medien-Datenbank konnte nicht geöffnet werden."
                        )
                    );
                };
        }
    );
}

function emitMediaChange(
    assetId = null
) {
    if (
        typeof globalThis
            .window ===
        "undefined"
    ) {
        return;
    }

    globalThis.window
        .dispatchEvent(
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
    name
) {
    return name.replace(
        /\.[^/.]+$/,
        ""
    );
}

function isSupportedFile(
    file
) {
    return (
        file.type.startsWith(
            "image/"
        ) ||
        SUPPORTED_TYPES.includes(
            file.type
        )
    );
}

function validateFile(
    file
) {
    if (
        !isSupportedFile(
            file
        )
    ) {
        throw new Error(
            `„${file.name}“ wird nicht unterstützt. Erlaubt sind Bilder und PDF-Dateien.`
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

function getImageDimensions(
    file
) {
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
                new globalThis
                    .Image();

            image.onload =
                () => {
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

            image.onerror =
                () => {
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

async function createAssetFromFile(
    file
) {
    validateFile(
        file
    );

    const dimensions =
        await getImageDimensions(
            file
        );

    const now =
        new Date()
            .toISOString();

    return {
        id:
            createId(),

        name:
            file.name,

        originalName:
            file.name,

        type:
            file.type ||
            "application/octet-stream",

        size:
            file.size,

        width:
            dimensions.width,

        height:
            dimensions.height,

        altText:
            file.type.startsWith(
                "image/"
            )
                ? removeFileExtension(
                    file.name
                )
                : "",

        caption: "",

        createdAt:
            now,

        updatedAt:
            now,

        blob:
            file
    };
}

export async function getMediaAssets() {
    const database =
        await openDatabase();

    try {
        const transaction =
            database.transaction(
                STORE_NAME,
                "readonly"
            );

        const transactionDone =
            transactionToPromise(
                transaction
            );

        const store =
            transaction.objectStore(
                STORE_NAME
            );

        const assets =
            await requestToPromise(
                store.getAll()
            );

        await transactionDone;

        return assets.sort(
            (
                firstAsset,
                secondAsset
            ) =>
                new Date(
                    secondAsset
                        .createdAt
                ).getTime() -
                new Date(
                    firstAsset
                        .createdAt
                ).getTime()
        );
    } finally {
        database.close();
    }
}

export async function getMediaAsset(
    assetId
) {
    if (!assetId) {
        return null;
    }

    const database =
        await openDatabase();

    try {
        const transaction =
            database.transaction(
                STORE_NAME,
                "readonly"
            );

        const transactionDone =
            transactionToPromise(
                transaction
            );

        const store =
            transaction.objectStore(
                STORE_NAME
            );

        const asset =
            await requestToPromise(
                store.get(
                    assetId
                )
            );

        await transactionDone;

        return asset ?? null;
    } finally {
        database.close();
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

    const assets = [];

    for (
        const file
        of fileList
    ) {
        const asset =
            await createAssetFromFile(
                file
            );

        assets.push(
            asset
        );
    }

    const database =
        await openDatabase();

    try {
        const transaction =
            database.transaction(
                STORE_NAME,
                "readwrite"
            );

        const transactionDone =
            transactionToPromise(
                transaction
            );

        const store =
            transaction.objectStore(
                STORE_NAME
            );

        assets.forEach(
            (asset) => {
                store.put(
                    asset
                );
            }
        );

        await transactionDone;

        assets.forEach(
            (asset) => {
                emitMediaChange(
                    asset.id
                );
            }
        );

        return assets;
    } finally {
        database.close();
    }
}

export async function updateMediaAsset(
    assetId,
    changes
) {
    const currentAsset =
        await getMediaAsset(
            assetId
        );

    if (!currentAsset) {
        throw new Error(
            "Die Mediendatei wurde nicht gefunden."
        );
    }

    const updatedAsset = {
        ...currentAsset,
        ...changes,

        id:
            currentAsset.id,

        blob:
            currentAsset.blob,

        updatedAt:
            new Date()
                .toISOString()
    };

    const database =
        await openDatabase();

    try {
        const transaction =
            database.transaction(
                STORE_NAME,
                "readwrite"
            );

        const transactionDone =
            transactionToPromise(
                transaction
            );

        const store =
            transaction.objectStore(
                STORE_NAME
            );

        store.put(
            updatedAsset
        );

        await transactionDone;

        emitMediaChange(
            assetId
        );

        return updatedAsset;
    } finally {
        database.close();
    }
}

export async function deleteMediaAsset(
    assetId
) {
    const database =
        await openDatabase();

    try {
        const transaction =
            database.transaction(
                STORE_NAME,
                "readwrite"
            );

        const transactionDone =
            transactionToPromise(
                transaction
            );

        const store =
            transaction.objectStore(
                STORE_NAME
            );

        store.delete(
            assetId
        );

        await transactionDone;

        emitMediaChange(
            assetId
        );

        return true;
    } finally {
        database.close();
    }
}

export function createMediaReference(
    assetId
) {
    return `media://${assetId}`;
}

export function getMediaIdFromReference(
    reference
) {
    if (
        typeof reference !==
            "string" ||
        !reference.startsWith(
            "media://"
        )
    ) {
        return null;
    }

    return reference.slice(
        "media://".length
    );
}

export function isMediaReference(
    value
) {
    return Boolean(
        getMediaIdFromReference(
            value
        )
    );
}

export function isImageAsset(
    asset
) {
    return Boolean(
        asset?.type?.startsWith(
            "image/"
        )
    );
}

export function isPdfAsset(
    asset
) {
    return (
        asset?.type ===
        "application/pdf"
    );
}

export function subscribeToMediaLibrary(
    listener
) {
    if (
        typeof globalThis
            .window ===
        "undefined"
    ) {
        return () => {};
    }

    function handleChange(
        event
    ) {
        listener(
            event.detail
                ?.assetId ??
            null
        );
    }

    globalThis.window
        .addEventListener(
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

export function formatFileSize(
    bytes
) {
    const numericBytes =
        Number(
            bytes
        ) || 0;

    if (
        numericBytes ===
        0
    ) {
        return "0 B";
    }

    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];

    const unitIndex =
        Math.min(
            Math.floor(
                Math.log(
                    numericBytes
                ) /
                Math.log(
                    1024
                )
            ),
            units.length - 1
        );

    const value =
        numericBytes /
        1024 ** unitIndex;

    return `${value.toLocaleString(
        "de-DE",
        {
            maximumFractionDigits:
                unitIndex === 0
                    ? 0
                    : 2
        }
    )} ${units[unitIndex]}`;
}