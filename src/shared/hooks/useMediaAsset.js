import {
    useEffect,
    useState
} from "react";

import {
    getMediaAsset,
    getMediaIdFromReference,
    subscribeToMediaLibrary
} from "@shared/media/mediaDataService";

export default function useMediaAsset(
    reference
) {
    const assetId =
        getMediaIdFromReference(
            reference
        );

    const [
        asset,
        setAsset
    ] = useState(null);

    const [
        url,
        setUrl
    ] = useState("");

    const [
        loading,
        setLoading
    ] = useState(
        Boolean(assetId)
    );

    const [
        error,
        setError
    ] = useState("");

    useEffect(() => {
        let active = true;
        let objectUrl = "";

        function revokeObjectUrl() {
            if (!objectUrl) {
                return;
            }

            globalThis.URL
                .revokeObjectURL(
                    objectUrl
                );

            objectUrl = "";
        }

        async function loadAsset() {
            if (!assetId) {
                revokeObjectUrl();

                setAsset(null);
                setUrl("");
                setLoading(false);
                setError("");

                return;
            }

            setLoading(true);
            setError("");

            try {
                const loadedAsset =
                    await getMediaAsset(
                        assetId
                    );

                if (!active) {
                    return;
                }

                revokeObjectUrl();

                if (!loadedAsset) {
                    setAsset(null);
                    setUrl("");

                    setError(
                        "Die Mediendatei wurde nicht gefunden."
                    );

                    return;
                }

                let resolvedUrl =
                    loadedAsset.url ??
                    "";

                if (
                    !resolvedUrl &&
                    loadedAsset.blob
                ) {
                    objectUrl =
                        globalThis.URL
                            .createObjectURL(
                                loadedAsset.blob
                            );

                    resolvedUrl =
                        objectUrl;
                }

                if (!resolvedUrl) {
                    setAsset(
                        loadedAsset
                    );

                    setUrl("");

                    setError(
                        "Für die Mediendatei ist keine Datei-URL verfügbar."
                    );

                    return;
                }

                setAsset(
                    loadedAsset
                );

                setUrl(
                    resolvedUrl
                );
            } catch (loadError) {
                if (!active) {
                    return;
                }

                revokeObjectUrl();

                setAsset(null);
                setUrl("");

                setError(
                    loadError.message ??
                    "Die Mediendatei konnte nicht geladen werden."
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadAsset();

        const unsubscribe =
            subscribeToMediaLibrary(
                (changedAssetId) => {
                    if (
                        changedAssetId &&
                        changedAssetId !==
                            assetId
                    ) {
                        return;
                    }

                    loadAsset();
                }
            );

        return () => {
            active = false;

            unsubscribe();
            revokeObjectUrl();
        };
    }, [
        assetId
    ]);

    return {
        assetId,
        asset,
        url,
        loading,
        error
    };
}