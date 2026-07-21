import {
    useEffect,
    useState
} from "react";

import {
    getMediaAsset,
    getMediaIdFromReference,
    subscribeToMediaLibrary
} from "@shared/media/mediaService";

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

        async function loadAsset() {
            if (!assetId) {
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

                if (objectUrl) {
                    globalThis.URL.revokeObjectURL(
                        objectUrl
                    );

                    objectUrl = "";
                }

                if (!loadedAsset) {
                    setAsset(null);
                    setUrl("");
                    setError(
                        "Die Mediendatei wurde nicht gefunden."
                    );

                    return;
                }

                if (loadedAsset.blob) {
                    objectUrl =
                        globalThis.URL.createObjectURL(
                            loadedAsset.blob
                        );
                }

                setAsset(
                    loadedAsset
                );

                setUrl(
                    objectUrl
                );
            } catch (loadError) {
                if (!active) {
                    return;
                }

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

            if (objectUrl) {
                globalThis.URL.revokeObjectURL(
                    objectUrl
                );
            }
        };
    }, [assetId]);

    return {
        assetId,
        asset,
        url,
        loading,
        error
    };
}