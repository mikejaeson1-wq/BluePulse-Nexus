import JSZip from "jszip";

const BACKUP_FORMAT =
    "bluepulse-nexus-backup";

const BACKUP_FORMAT_VERSION = 1;

const STORAGE_PREFIX =
    "bluepulse.";

const MEDIA_DATABASE_NAME =
    "bluepulse-nexus-media";

const MEDIA_DATABASE_VERSION = 1;

const MEDIA_STORE_NAME =
    "assets";

const REFRESH_EVENTS = [
    "bluepulse:site-content-change",
    "bluepulse:site-navigation-change",
    "bluepulse:home-layout-change",
    "bluepulse:footer-change",
    "bluepulse:media-library-change"
];

const SENSITIVE_STORAGE_PATTERN =
    /(auth|session|token|password|credential|secret)/i;

const MAX_BACKUP_FILE_SIZE =
    1024 * 1024 * 1024;

function cloneValue(value) {
    if (
        typeof globalThis.structuredClone ===
        "function"
    ) {
        return globalThis.structuredClone(value);
    }

    return JSON.parse(
        JSON.stringify(value)
    );
}

function requestToPromise(request) {
    return new Promise(
        (resolve, reject) => {
            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
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
        (resolve, reject) => {
            transaction.oncomplete =
                () => resolve();

            transaction.onerror = () => {
                reject(
                    transaction.error ??
                    new Error(
                        "IndexedDB-Transaktion fehlgeschlagen."
                    )
                );
            };

            transaction.onabort = () => {
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

function openMediaDatabase() {
    return new Promise(
        (resolve, reject) => {
            if (!globalThis.indexedDB) {
                reject(
                    new Error(
                        "Dieser Browser unterstützt IndexedDB nicht."
                    )
                );

                return;
            }

            const request =
                globalThis.indexedDB.open(
                    MEDIA_DATABASE_NAME,
                    MEDIA_DATABASE_VERSION
                );

            request.onupgradeneeded = () => {
                const database =
                    request.result;

                if (
                    database.objectStoreNames
                        .contains(
                            MEDIA_STORE_NAME
                        )
                ) {
                    return;
                }

                const store =
                    database.createObjectStore(
                        MEDIA_STORE_NAME,
                        {
                            keyPath: "id"
                        }
                    );

                store.createIndex(
                    "createdAt",
                    "createdAt",
                    {
                        unique: false
                    }
                );

                store.createIndex(
                    "type",
                    "type",
                    {
                        unique: false
                    }
                );
            };

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
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

function isSensitiveStorageKey(key) {
    return SENSITIVE_STORAGE_PATTERN.test(
        key
    );
}

function getStorageSnapshot() {
    const entries = {};
    const excludedKeys = [];

    if (
        typeof globalThis.localStorage ===
        "undefined"
    ) {
        return {
            entries,
            excludedKeys
        };
    }

    for (
        let index = 0;
        index <
        globalThis.localStorage.length;
        index += 1
    ) {
        const key =
            globalThis.localStorage.key(
                index
            );

        if (
            !key ||
            !key.startsWith(
                STORAGE_PREFIX
            )
        ) {
            continue;
        }

        if (
            isSensitiveStorageKey(
                key
            )
        ) {
            excludedKeys.push(key);
            continue;
        }

        const value =
            globalThis.localStorage.getItem(
                key
            );

        if (value !== null) {
            entries[key] = value;
        }
    }

    return {
        entries,
        excludedKeys
    };
}

function clearBluePulseStorage() {
    if (
        typeof globalThis.localStorage ===
        "undefined"
    ) {
        return;
    }

    const keysToRemove = [];

    for (
        let index = 0;
        index <
        globalThis.localStorage.length;
        index += 1
    ) {
        const key =
            globalThis.localStorage.key(
                index
            );

        if (
            key?.startsWith(
                STORAGE_PREFIX
            ) &&
            !isSensitiveStorageKey(key)
        ) {
            keysToRemove.push(key);
        }
    }

    keysToRemove.forEach((key) => {
        globalThis.localStorage.removeItem(
            key
        );
    });
}

function replaceStorageEntries(entries) {
    clearBluePulseStorage();

    Object.entries(
        entries
    ).forEach(([key, value]) => {
        if (
            !key.startsWith(
                STORAGE_PREFIX
            )
        ) {
            return;
        }

        if (
            isSensitiveStorageKey(
                key
            )
        ) {
            return;
        }

        if (
            typeof value !== "string"
        ) {
            return;
        }

        globalThis.localStorage.setItem(
            key,
            value
        );
    });
}

async function getAllMediaAssets() {
    const database =
        await openMediaDatabase();

    try {
        const transaction =
            database.transaction(
                MEDIA_STORE_NAME,
                "readonly"
            );

        const transactionDone =
            transactionToPromise(
                transaction
            );

        const store =
            transaction.objectStore(
                MEDIA_STORE_NAME
            );

        const assets =
            await requestToPromise(
                store.getAll()
            );

        await transactionDone;

        return assets;
    } finally {
        database.close();
    }
}

async function replaceAllMediaAssets(
    assets
) {
    const database =
        await openMediaDatabase();

    try {
        const transaction =
            database.transaction(
                MEDIA_STORE_NAME,
                "readwrite"
            );

        const transactionDone =
            transactionToPromise(
                transaction
            );

        const store =
            transaction.objectStore(
                MEDIA_STORE_NAME
            );

        store.clear();

        assets.forEach((asset) => {
            store.put(asset);
        });

        await transactionDone;
    } finally {
        database.close();
    }
}

function removeBlobFromAsset(asset) {
    const metadata = {
        ...asset
    };

    delete metadata.blob;

    return metadata;
}

function getFileExtension(
    fileName,
    mimeType
) {
    const match =
        String(fileName ?? "").match(
            /(\.[a-z0-9]{1,10})$/i
        );

    if (match) {
        return match[1].toLowerCase();
    }

    const extensionByMimeType = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "image/svg+xml": ".svg",
        "image/avif": ".avif",
        "application/pdf": ".pdf"
    };

    return (
        extensionByMimeType[
            mimeType
        ] ?? ".bin"
    );
}

function createBackupFileName(
    createdAt
) {
    const safeDate =
        createdAt
            .replace(/\.\d{3}Z$/, "")
            .replaceAll(":", "-");

    return `bluepulse-nexus-backup-${safeDate}.zip`;
}

function getApplicationVersion() {
    return (
        import.meta.env
            .VITE_APP_VERSION ??
        "0.1-alpha"
    );
}

function notifyProgress(
    onProgress,
    phase,
    progress,
    message
) {
    if (
        typeof onProgress !==
        "function"
    ) {
        return;
    }

    onProgress({
        phase,
        progress:
            Math.max(
                0,
                Math.min(
                    100,
                    Math.round(
                        progress
                    )
                )
            ),
        message
    });
}

function parseJson(
    value,
    fileName
) {
    try {
        return JSON.parse(value);
    } catch {
        throw new Error(
            `„${fileName}“ enthält kein gültiges JSON.`
        );
    }
}

function validateManifest(manifest) {
    if (
        !manifest ||
        typeof manifest !== "object"
    ) {
        throw new Error(
            "Das Backup besitzt kein gültiges Manifest."
        );
    }

    if (
        manifest.format !==
        BACKUP_FORMAT
    ) {
        throw new Error(
            "Die Datei ist kein BluePulse-Nexus-Backup."
        );
    }

    if (
        Number(
            manifest.formatVersion
        ) >
        BACKUP_FORMAT_VERSION
    ) {
        throw new Error(
            "Das Backup wurde mit einer neueren Nexus-Version erstellt."
        );
    }

    if (
        Number(
            manifest.formatVersion
        ) < 1
    ) {
        throw new Error(
            "Die Backup-Version wird nicht unterstützt."
        );
    }
}

function validateStoragePayload(
    payload
) {
    if (
        !payload ||
        typeof payload !== "object" ||
        !payload.entries ||
        typeof payload.entries !==
            "object" ||
        Array.isArray(
            payload.entries
        )
    ) {
        throw new Error(
            "Die gespeicherten Nexus-Daten sind ungültig."
        );
    }

    Object.entries(
        payload.entries
    ).forEach(([key, value]) => {
        if (
            !key.startsWith(
                STORAGE_PREFIX
            )
        ) {
            throw new Error(
                `Ungültiger Speicherbereich im Backup: ${key}`
            );
        }

        if (
            typeof value !==
            "string"
        ) {
            throw new Error(
                `Ungültiger Speicherwert für: ${key}`
            );
        }
    });
}

function validateMediaIndex(
    mediaIndex
) {
    if (!Array.isArray(mediaIndex)) {
        throw new Error(
            "Der Medienindex ist ungültig."
        );
    }

    const assetIds =
        new Set();

    mediaIndex.forEach(
        (asset) => {
            if (
                !asset ||
                typeof asset !==
                    "object" ||
                typeof asset.id !==
                    "string" ||
                !asset.id
            ) {
                throw new Error(
                    "Das Backup enthält einen ungültigen Medieneintrag."
                );
            }

            if (
                assetIds.has(
                    asset.id
                )
            ) {
                throw new Error(
                    `Doppelte Medien-ID im Backup: ${asset.id}`
                );
            }

            assetIds.add(
                asset.id
            );

            if (
                typeof asset.filePath !==
                    "string" ||
                !asset.filePath.startsWith(
                    "media/files/"
                ) ||
                asset.filePath.includes(
                    ".."
                )
            ) {
                throw new Error(
                    `Ungültiger Medienpfad für: ${asset.id}`
                );
            }
        }
    );
}

function dispatchRefreshEvents() {
    if (
        typeof globalThis.window ===
        "undefined"
    ) {
        return;
    }

    REFRESH_EVENTS.forEach(
        (eventName) => {
            globalThis.window.dispatchEvent(
                new CustomEvent(
                    eventName
                )
            );
        }
    );
}

async function readBackupArchive(
    file,
    {
        loadMediaBlobs = false,
        onProgress
    } = {}
) {
    if (!(file instanceof Blob)) {
        throw new Error(
            "Bitte wähle eine gültige Backup-Datei aus."
        );
    }

    if (
        file.size >
        MAX_BACKUP_FILE_SIZE
    ) {
        throw new Error(
            "Die Backup-Datei ist größer als 1 GB."
        );
    }

    notifyProgress(
        onProgress,
        "read",
        5,
        "Backup-Datei wird geöffnet …"
    );

    let zip;

    try {
        zip =
            await JSZip.loadAsync(
                file,
                {
                    checkCRC32: true
                }
            );
    } catch {
        throw new Error(
            "Die ZIP-Datei ist beschädigt oder wird nicht unterstützt."
        );
    }

    const manifestFile =
        zip.file(
            "manifest.json"
        );

    const storageFile =
        zip.file(
            "data/local-storage.json"
        );

    const mediaIndexFile =
        zip.file(
            "media/index.json"
        );

    if (
        !manifestFile ||
        !storageFile ||
        !mediaIndexFile
    ) {
        throw new Error(
            "Im Backup fehlen erforderliche Nexus-Dateien."
        );
    }

    notifyProgress(
        onProgress,
        "read",
        15,
        "Manifest wird geprüft …"
    );

    const manifest =
        parseJson(
            await manifestFile.async(
                "string"
            ),
            "manifest.json"
        );

    validateManifest(
        manifest
    );

    const storagePayload =
        parseJson(
            await storageFile.async(
                "string"
            ),
            "data/local-storage.json"
        );

    validateStoragePayload(
        storagePayload
    );

    const mediaIndex =
        parseJson(
            await mediaIndexFile.async(
                "string"
            ),
            "media/index.json"
        );

    validateMediaIndex(
        mediaIndex
    );

    const missingMediaFiles =
        mediaIndex.filter(
            (asset) =>
                !zip.file(
                    asset.filePath
                )
        );

    if (
        missingMediaFiles.length > 0
    ) {
        throw new Error(
            `${missingMediaFiles.length} Mediendateien fehlen im Backup.`
        );
    }

    if (!loadMediaBlobs) {
        return {
            manifest,
            storageEntries:
                storagePayload.entries,
            excludedKeys:
                storagePayload.excludedKeys ??
                [],
            mediaIndex,
            mediaAssets: []
        };
    }

    const mediaAssets = [];

    for (
        let index = 0;
        index <
        mediaIndex.length;
        index += 1
    ) {
        const assetMetadata =
            mediaIndex[index];

        const zipFile =
            zip.file(
                assetMetadata.filePath
            );

        const originalBlob =
            await zipFile.async(
                "blob"
            );

        const blob =
            new Blob(
                [originalBlob],
                {
                    type:
                        assetMetadata.type ||
                        originalBlob.type ||
                        "application/octet-stream"
                }
            );

        const asset = {
            ...assetMetadata,
            blob
        };

        delete asset.filePath;

        mediaAssets.push(
            asset
        );

        notifyProgress(
            onProgress,
            "read",
            20 +
                (
                    (
                        index + 1
                    ) /
                    Math.max(
                        mediaIndex.length,
                        1
                    )
                ) *
                45,
            `Mediendatei ${index + 1} von ${mediaIndex.length} wird vorbereitet …`
        );
    }

    return {
        manifest,
        storageEntries:
            storagePayload.entries,
        excludedKeys:
            storagePayload.excludedKeys ??
            [],
        mediaIndex,
        mediaAssets
    };
}

export async function createNexusBackup({
    onProgress
} = {}) {
    notifyProgress(
        onProgress,
        "collect",
        2,
        "Nexus-Daten werden gesammelt …"
    );

    const storageSnapshot =
        getStorageSnapshot();

    const mediaAssets =
        await getAllMediaAssets();

    const createdAt =
        new Date().toISOString();

    const zip =
        new JSZip();

    const mediaIndex = [];

    notifyProgress(
        onProgress,
        "collect",
        15,
        "Medien werden vorbereitet …"
    );

    mediaAssets.forEach(
        (asset, index) => {
            const extension =
                getFileExtension(
                    asset.name,
                    asset.type
                );

            const filePath =
                `media/files/${asset.id}${extension}`;

            mediaIndex.push({
                ...removeBlobFromAsset(
                    asset
                ),
                filePath
            });

            if (asset.blob) {
                zip.file(
                    filePath,
                    asset.blob
                );
            }

            notifyProgress(
                onProgress,
                "collect",
                15 +
                    (
                        (
                            index + 1
                        ) /
                        Math.max(
                            mediaAssets.length,
                            1
                        )
                    ) *
                    25,
                `Medium ${index + 1} von ${mediaAssets.length} wird hinzugefügt …`
            );
        }
    );

    const manifest = {
        format:
            BACKUP_FORMAT,

        formatVersion:
            BACKUP_FORMAT_VERSION,

        createdAt,

        application: {
            name:
                "BluePulse Nexus",

            version:
                getApplicationVersion()
        },

        contents: {
            storageEntries:
                Object.keys(
                    storageSnapshot.entries
                ).length,

            mediaAssets:
                mediaAssets.length,

            excludedSensitiveEntries:
                storageSnapshot
                    .excludedKeys.length
        }
    };

    zip.file(
        "manifest.json",
        JSON.stringify(
            manifest,
            null,
            2
        )
    );

    zip.file(
        "data/local-storage.json",
        JSON.stringify(
            {
                exportedAt:
                    createdAt,

                entries:
                    storageSnapshot.entries,

                excludedKeys:
                    storageSnapshot
                        .excludedKeys
            },
            null,
            2
        )
    );

    zip.file(
        "media/index.json",
        JSON.stringify(
            mediaIndex,
            null,
            2
        )
    );

    zip.file(
        "README.txt",
        [
            "BluePulse Nexus Backup",
            "",
            `Erstellt: ${createdAt}`,
            `Format-Version: ${BACKUP_FORMAT_VERSION}`,
            "",
            "Diese Datei kann über BluePulse Nexus wiederhergestellt werden.",
            "Aktive Sitzungen, Passwörter und Sicherheitstokens sind nicht enthalten."
        ].join("\n")
    );

    notifyProgress(
        onProgress,
        "compress",
        45,
        "Backup wird komprimiert …"
    );

    const blob =
        await zip.generateAsync(
            {
                type: "blob",

                mimeType:
                    "application/zip",

                compression:
                    "DEFLATE",

                compressionOptions: {
                    level: 6
                }
            },
            (metadata) => {
                notifyProgress(
                    onProgress,
                    "compress",
                    45 +
                        metadata.percent *
                        0.55,
                    `Backup wird komprimiert: ${Math.round(
                        metadata.percent
                    )} %`
                );
            }
        );

    notifyProgress(
        onProgress,
        "complete",
        100,
        "Backup wurde erstellt."
    );

    return {
        blob,

        fileName:
            createBackupFileName(
                createdAt
            ),

        manifest:
            cloneValue(
                manifest
            )
    };
}

export function downloadNexusBackup(
    backup
) {
    if (
        !backup?.blob ||
        !backup?.fileName
    ) {
        throw new Error(
            "Es wurde kein gültiges Backup erstellt."
        );
    }

    const objectUrl =
        globalThis.URL.createObjectURL(
            backup.blob
        );

    const anchor =
        globalThis.document.createElement(
            "a"
        );

    anchor.href =
        objectUrl;

    anchor.download =
        backup.fileName;

    globalThis.document.body.appendChild(
        anchor
    );

    anchor.click();
    anchor.remove();

    globalThis.setTimeout(
        () => {
            globalThis.URL.revokeObjectURL(
                objectUrl
            );
        },
        1000
    );
}

export async function inspectNexusBackup(
    file,
    {
        onProgress
    } = {}
) {
    const archive =
        await readBackupArchive(
            file,
            {
                loadMediaBlobs: false,
                onProgress
            }
        );

    notifyProgress(
        onProgress,
        "complete",
        100,
        "Backup wurde geprüft."
    );

    return {
        manifest:
            cloneValue(
                archive.manifest
            ),

        storageEntryCount:
            Object.keys(
                archive.storageEntries
            ).length,

        mediaAssetCount:
            archive.mediaIndex.length,

        excludedKeyCount:
            archive.excludedKeys.length
    };
}

export async function restoreNexusBackup(
    file,
    {
        onProgress
    } = {}
) {
    notifyProgress(
        onProgress,
        "prepare",
        1,
        "Wiederherstellung wird vorbereitet …"
    );

    const archive =
        await readBackupArchive(
            file,
            {
                loadMediaBlobs: true,
                onProgress
            }
        );

    notifyProgress(
        onProgress,
        "safety",
        68,
        "Aktueller Stand wird intern gesichert …"
    );

    const previousStorage =
        getStorageSnapshot().entries;

    const previousMediaAssets =
        await getAllMediaAssets();

    try {
        notifyProgress(
            onProgress,
            "restore",
            74,
            "Medien werden wiederhergestellt …"
        );

        await replaceAllMediaAssets(
            archive.mediaAssets
        );

        notifyProgress(
            onProgress,
            "restore",
            88,
            "Inhalte und Einstellungen werden wiederhergestellt …"
        );

        replaceStorageEntries(
            archive.storageEntries
        );

        dispatchRefreshEvents();

        notifyProgress(
            onProgress,
            "complete",
            100,
            "Wiederherstellung abgeschlossen."
        );

        return {
            manifest:
                cloneValue(
                    archive.manifest
                ),

            restoredStorageEntries:
                Object.keys(
                    archive.storageEntries
                ).length,

            restoredMediaAssets:
                archive.mediaAssets.length
        };
    } catch (restoreError) {
        try {
            await replaceAllMediaAssets(
                previousMediaAssets
            );

            replaceStorageEntries(
                previousStorage
            );

            dispatchRefreshEvents();
        } catch (rollbackError) {
            console.error(
                "Die automatische Rücksicherung ist fehlgeschlagen.",
                rollbackError
            );
        }

        throw new Error(
            restoreError.message ??
            "Das Backup konnte nicht wiederhergestellt werden."
        );
    }
}

export function formatBackupFileSize(
    bytes
) {
    const numericBytes =
        Number(bytes) || 0;

    if (numericBytes === 0) {
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
                Math.log(1024)
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