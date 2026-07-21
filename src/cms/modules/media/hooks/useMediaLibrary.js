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

    const previewUrlsRef =
        useRef({});

    const mountedRef =
        useRef(true);

    const replacePreviewUrls =
        useCallback(
            (nextAssets) => {
                Object.values(
                    previewUrlsRef.current
                ).forEach((url) => {
                    URL.revokeObjectURL(
                        url
                    );
                });

                const nextPreviewUrls = {};

                nextAssets.forEach(
                    (asset) => {
                        if (!asset.blob) {
                            return;
                        }

                        nextPreviewUrls[
                            asset.id
                        ] =
                            URL.createObjectURL(
                                asset.blob
                            );
                    }
                );

                previewUrlsRef.current =
                    nextPreviewUrls;

                if (mountedRef.current) {
                    setPreviewUrls(
                        nextPreviewUrls
                    );
                }
            },
            []
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

                    setAssets(
                        nextAssets
                    );

                    replacePreviewUrls(
                        nextAssets
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
            [replacePreviewUrls]
        );

    useEffect(() => {
        mountedRef.current = true;

        refresh();

        return () => {
            mountedRef.current =
                false;

            Object.values(
                previewUrlsRef.current
            ).forEach((url) => {
                URL.revokeObjectURL(
                    url
                );
            });
        };
    }, [refresh]);

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