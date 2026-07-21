import "./MediaPicker.css";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import Modal from "@shared/ui/Modal";
import Button from "@shared/ui/Button";

import useMediaLibrary from "@cms/modules/media/hooks/useMediaLibrary";

import {
    createMediaReference,
    getMediaIdFromReference,
    isImageAsset
} from "@shared/media/mediaService";

export default function MediaPicker({
    open,
    value = "",
    onSelect,
    onClose
}) {
    const {
        assets,
        previewUrls,
        loading,
        error
    } = useMediaLibrary();

    const [
        search,
        setSearch
    ] = useState("");

    const [
        selectedId,
        setSelectedId
    ] = useState(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        setSelectedId(
            getMediaIdFromReference(
                value
            )
        );

        setSearch("");
    }, [
        open,
        value
    ]);

    const imageAssets =
        useMemo(
            () =>
                assets.filter(
                    isImageAsset
                ),
            [assets]
        );

    const filteredAssets =
        useMemo(
            () => {
                const normalizedSearch =
                    search
                        .trim()
                        .toLowerCase();

                if (!normalizedSearch) {
                    return imageAssets;
                }

                return imageAssets.filter(
                    (asset) =>
                        [
                            asset.name,
                            asset.altText,
                            asset.caption
                        ]
                            .filter(Boolean)
                            .some((text) =>
                                text
                                    .toLowerCase()
                                    .includes(
                                        normalizedSearch
                                    )
                            )
                );
            },
            [
                imageAssets,
                search
            ]
        );

    function selectAsset() {
        if (!selectedId) {
            return;
        }

        onSelect(
            createMediaReference(
                selectedId
            )
        );

        onClose();
    }

    return (
        <Modal
            open={open}
            title="Bild aus Medienbibliothek auswählen"
            onClose={onClose}
        >
            <div className="media-picker">
                <div className="media-picker__search">
                    <i
                        className="bi bi-search"
                        aria-hidden="true"
                    />

                    <input
                        type="search"
                        placeholder="Bilder durchsuchen …"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />
                </div>

                {
                    error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )
                }

                {
                    loading && (
                        <div className="media-picker__empty">
                            Medien werden geladen …
                        </div>
                    )
                }

                {
                    !loading &&
                    filteredAssets.length ===
                    0 && (
                        <div className="media-picker__empty">
                            <i
                                className="bi bi-images"
                                aria-hidden="true"
                            />

                            <strong>
                                Keine Bilder vorhanden
                            </strong>

                            <span>
                                Lade zuerst ein Bild unter „Medien“ hoch.
                            </span>
                        </div>
                    )
                }

                {
                    !loading &&
                    filteredAssets.length >
                    0 && (
                        <div className="media-picker__grid">
                            {
                                filteredAssets.map(
                                    (asset) => (
                                        <button
                                            key={asset.id}
                                            type="button"
                                            className={
                                                selectedId ===
                                                asset.id
                                                    ? "media-picker__card media-picker__card--selected"
                                                    : "media-picker__card"
                                            }
                                            onClick={() =>
                                                setSelectedId(
                                                    asset.id
                                                )
                                            }
                                        >
                                            <div className="media-picker__image">
                                                <img
                                                    src={
                                                        previewUrls[
                                                            asset.id
                                                        ]
                                                    }
                                                    alt={
                                                        asset.altText ||
                                                        asset.name
                                                    }
                                                />
                                            </div>

                                            <div className="media-picker__cardBody">
                                                <strong>
                                                    {
                                                        asset.name
                                                    }
                                                </strong>

                                                {
                                                    selectedId ===
                                                    asset.id && (
                                                        <i
                                                            className="bi bi-check-circle-fill"
                                                            aria-hidden="true"
                                                        />
                                                    )
                                                }
                                            </div>
                                        </button>
                                    )
                                )
                            }
                        </div>
                    )
                }

                <div className="media-picker__actions">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                    >
                        Abbrechen
                    </Button>

                    <Button
                        type="button"
                        disabled={!selectedId}
                        onClick={selectAsset}
                    >
                        Bild übernehmen
                    </Button>
                </div>
            </div>
        </Modal>
    );
}