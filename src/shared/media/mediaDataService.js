import {
    MEDIA_DATA_MODE
} from "@shared/data/dataMode";

import {
    addMediaFiles as addLocalMediaFiles,
    createMediaReference,
    deleteMediaAsset as deleteLocalMediaAsset,
    formatFileSize,
    getMediaAsset as getLocalMediaAsset,
    getMediaAssets as getLocalMediaAssets,
    getMediaIdFromReference,
    isImageAsset,
    isMediaReference,
    isPdfAsset,
    subscribeToMediaLibrary as subscribeToLocalMediaLibrary,
    updateMediaAsset as updateLocalMediaAsset
} from "./mediaService";

import {
    addMediaFiles as addApiMediaFiles,
    deleteMediaAsset as deleteApiMediaAsset,
    getMediaAsset as getApiMediaAsset,
    getMediaAssets as getApiMediaAssets,
    subscribeToMediaLibrary as subscribeToApiMediaLibrary,
    updateMediaAsset as updateApiMediaAsset
} from "./apiMediaService";

const activeMediaService =
    MEDIA_DATA_MODE ===
    "api"
        ? {
            getMediaAssets:
                getApiMediaAssets,

            getMediaAsset:
                getApiMediaAsset,

            addMediaFiles:
                addApiMediaFiles,

            updateMediaAsset:
                updateApiMediaAsset,

            deleteMediaAsset:
                deleteApiMediaAsset,

            subscribeToMediaLibrary:
                subscribeToApiMediaLibrary
        }
        : {
            getMediaAssets:
                getLocalMediaAssets,

            getMediaAsset:
                getLocalMediaAsset,

            addMediaFiles:
                addLocalMediaFiles,

            updateMediaAsset:
                updateLocalMediaAsset,

            deleteMediaAsset:
                deleteLocalMediaAsset,

            subscribeToMediaLibrary:
                subscribeToLocalMediaLibrary
        };

export function getMediaStorageMode() {
    return MEDIA_DATA_MODE;
}

export function getMediaAssets(
    options = {}
) {
    return activeMediaService
        .getMediaAssets(
            options
        );
}

export function getMediaAsset(
    assetId,
    options = {}
) {
    return activeMediaService
        .getMediaAsset(
            assetId,
            options
        );
}

export function addMediaFiles(
    files
) {
    return activeMediaService
        .addMediaFiles(
            files
        );
}

export function updateMediaAsset(
    assetId,
    changes
) {
    return activeMediaService
        .updateMediaAsset(
            assetId,
            changes
        );
}

export function deleteMediaAsset(
    assetId
) {
    return activeMediaService
        .deleteMediaAsset(
            assetId
        );
}

export function subscribeToMediaLibrary(
    listener
) {
    return activeMediaService
        .subscribeToMediaLibrary(
            listener
        );
}

export {
    createMediaReference,
    formatFileSize,
    getMediaIdFromReference,
    isImageAsset,
    isMediaReference,
    isPdfAsset
};