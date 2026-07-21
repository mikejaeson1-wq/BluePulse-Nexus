import {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

import {
    addMediaFiles,
    deleteMediaAsset,
    getMediaAssets,
    updateMediaAsset
} from "../services/mediaService";

export default function useMediaLibrary() {
    const [
        assets,
        setAssets
    ] = useState([]);

    const [
        previewUrls,
        setPreviewUrls
    ] = useState({});

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        uploading,
        setUploading
    ] = useState(false);

    const [
        error,
        setError
    ] = useState("");

    const objectUrlsRef =
        useRef(
            new Set()
        );

    const mountedRef =
        useRef(true);

    const revokeObjectUrls =
        useCallback(
            () => {
                objectUrlsRef.current
                    .forEach(
                        (url) => {
                            globalThis.URL
                                .revokeObjectURL(
                                    url
                                );
                        }
                    );

                objectUrlsRef.current
                    .clear();
            },
            []
        );

    const replacePreviewUrls =
        useCallback(
            (nextAssets) => {
                revokeObjectUrls();

                const nextPreviewUrls = {};

                nextAssets.forEach(
                    (asset) => {
                        if (asset.url) {
                            nextPreviewUrls[
                                asset.id
                            ] =
                                asset.url;

                            return;
                        }

                        if (!asset.blob) {
                            return;
                        }

                        const objectUrl =
                            globalThis.URL
                                .createObjectURL(
                                    asset.blob
                                );

                        objectUrlsRef.current
                            .add(
                                objectUrl
                            );

                        nextPreviewUrls[
                            asset.id
                        ] =
                            objectUrl;
                    }
                );

                if (
                    mountedRef.current
                ) {
                    setPreviewUrls(
                        nextPreviewUrls
                    );
                }
            },
            [
                revokeObjectUrls
            ]
        );

    const refresh =
        useCallback(
            async () => {
                setLoading(true);
                setError("");

                try {
                    const nextAssets =
                        await getMediaAssets();

                    if (
                        !mountedRef.current
                    ) {
                        return;
                    }

                    const normalizedAssets =
                        Array.isArray(
                            nextAssets
                        )
                            ? nextAssets
                            : [];

                    setAssets(
                        normalizedAssets
                    );

                    replacePreviewUrls(
                        normalizedAssets
                    );
                } catch (
                    refreshError
                ) {
                    if (
                        !mountedRef.current
                    ) {
                        return;
                    }

                    setError(
                        refreshError.message ??
                        "Medien konnten nicht geladen werden."
                    );
                } finally {
                    if (
                        mountedRef.current
                    ) {
                        setLoading(false);
                    }
                }
            },
            [
                replacePreviewUrls
            ]
        );

    useEffect(() => {
        mountedRef.current = true;

        refresh();

        return () => {
            mountedRef.current =
                false;

            revokeObjectUrls();
        };
    }, [
        refresh,
        revokeObjectUrls
    ]);

    async function upload(files) {
        setUploading(true);
        setError("");

        try {
            const uploadedAssets =
                await addMediaFiles(
                    files
                );

            await refresh();

            return uploadedAssets;
        } catch (uploadError) {
            setError(
                uploadError.message ??
                "Dateien konnten nicht hochgeladen werden."
            );

            throw uploadError;
        } finally {
            setUploading(false);
        }
    }

    async function saveAsset(
        assetId,
        changes
    ) {
        setError("");

        try {
            const updatedAsset =
                await updateMediaAsset(
                    assetId,
                    changes
                );

            await refresh();

            return updatedAsset;
        } catch (saveError) {
            setError(
                saveError.message ??
                "Mediendaten konnten nicht gespeichert werden."
            );

            throw saveError;
        }
    }

    async function removeAsset(
        assetId
    ) {
        setError("");

        try {
            await deleteMediaAsset(
                assetId
            );

            await refresh();

            return true;
        } catch (deleteError) {
            setError(
                deleteError.message ??
                "Datei konnte nicht gelöscht werden."
            );

            throw deleteError;
        }
    }

    return {
        assets,
        previewUrls,

        loading,
        uploading,
        error,

        refresh,
        upload,
        saveAsset,
        removeAsset
    };
}