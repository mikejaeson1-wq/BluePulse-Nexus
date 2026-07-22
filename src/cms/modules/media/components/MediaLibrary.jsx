import "./MediaLibrary.css";

import {
    useMemo,
    useState
} from "react";

import useMediaLibrary from "../hooks/useMediaLibrary";

import {
    formatFileSize,
    isImageAsset
} from "../services/mediaService";

function normalizeSearchValue(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase();
}

function getAssetPreviewUrl(
    asset,
    previewUrls
) {
    return (
        previewUrls?.[asset.id] ??
        asset.url ??
        ""
    );
}

function getAssetAltText(asset) {
    return (
        String(asset.altText ?? "").trim() ||
        String(asset.name ?? "").trim() ||
        "Bild"
    );
}

function MediaPickerCard({
    asset,
    previewUrl,
    onSelect
}) {
    const altText =
        getAssetAltText(
            asset
        );

    function handleSelect() {
        if (!previewUrl) {
            return;
        }

        onSelect?.({
            ...asset,

            src:
                asset.url ||
                previewUrl,

            url:
                asset.url ||
                previewUrl,

            previewUrl,

            alt:
                altText,

            altText,

            caption:
                String(
                    asset.caption ??
                    ""
                )
        });
    }

    return (
        <button
            type="button"
            className="bp-media-picker__card"
            disabled={
                !previewUrl
            }
            title={
                previewUrl
                    ? `${asset.name} auswählen`
                    : "Für dieses Bild ist keine Vorschau verfügbar."
            }
            onClick={
                handleSelect
            }
        >
            <span className="bp-media-picker__thumbnail">
                {
                    previewUrl ? (
                        <img
                            src={
                                previewUrl
                            }
                            alt={
                                altText
                            }
                            loading="lazy"
                            decoding="async"
                        />
                    ) : (
                        <span className="bp-media-picker__thumbnail-placeholder">
                            <i
                                className="bi bi-image"
                                aria-hidden="true"
                            />
                        </span>
                    )
                }

                <span className="bp-media-picker__select-indicator">
                    <i
                        className="bi bi-check-lg"
                        aria-hidden="true"
                    />

                    Auswählen
                </span>
            </span>

            <span className="bp-media-picker__card-content">
                <strong
                    title={
                        asset.name
                    }
                >
                    {
                        asset.name
                    }
                </strong>

                <span className="bp-media-picker__card-meta">
                    <span>
                        {
                            formatFileSize(
                                asset.size
                            )
                        }
                    </span>

                    {
                        asset.width &&
                        asset.height && (
                            <span>
                                {
                                    asset.width
                                } × {
                                    asset.height
                                } px
                            </span>
                        )
                    }
                </span>

                {
                    asset.altText && (
                        <small
                            title={
                                asset.altText
                            }
                        >
                            {
                                asset.altText
                            }
                        </small>
                    )
                }
            </span>
        </button>
    );
}

export default function MediaLibrary({
    onSelect
}) {
    const {
        assets,
        previewUrls,
        loading,
        error,
        refresh
    } =
        useMediaLibrary();

    const [
        search,
        setSearch
    ] =
        useState("");

    const imageAssets =
        useMemo(
            () =>
                assets.filter(
                    isImageAsset
                ),
            [
                assets
            ]
        );

    const filteredAssets =
        useMemo(
            () => {
                const normalizedSearch =
                    normalizeSearchValue(
                        search
                    );

                if (!normalizedSearch) {
                    return imageAssets;
                }

                return imageAssets.filter(
                    (asset) => {
                        const searchableValues = [
                            asset.name,
                            asset.originalName,
                            asset.altText,
                            asset.caption,
                            asset.type
                        ];

                        return searchableValues
                            .filter(Boolean)
                            .some(
                                (value) =>
                                    normalizeSearchValue(
                                        value
                                    ).includes(
                                        normalizedSearch
                                    )
                            );
                    }
                );
            },
            [
                imageAssets,
                search
            ]
        );

    return (
        <section className="bp-media-picker">
            <header className="bp-media-picker__header">
                <div>
                    <span className="bp-media-picker__eyebrow">
                        BluePulse-Mediathek
                    </span>

                    <h3>
                        Bild auswählen
                    </h3>

                    <p>
                        Wähle ein Bild aus der zentralen Medienbibliothek aus.
                    </p>
                </div>

                <span className="bp-media-picker__count">
                    <i
                        className="bi bi-images"
                        aria-hidden="true"
                    />

                    {
                        imageAssets.length
                    } {
                        imageAssets.length ===
                        1
                            ? "Bild"
                            : "Bilder"
                    }
                </span>
            </header>

            <div className="bp-media-picker__toolbar">
                <label className="bp-media-picker__search">
                    <i
                        className="bi bi-search"
                        aria-hidden="true"
                    />

                    <input
                        type="search"
                        value={
                            search
                        }
                        placeholder="Bilder durchsuchen …"
                        autoComplete="off"
                        onChange={
                            (event) =>
                                setSearch(
                                    event.target.value
                                )
                        }
                    />

                    {
                        search && (
                            <button
                                type="button"
                                aria-label="Suche leeren"
                                title="Suche leeren"
                                onClick={
                                    () =>
                                        setSearch(
                                            ""
                                        )
                                }
                            >
                                <i
                                    className="bi bi-x-lg"
                                    aria-hidden="true"
                                />
                            </button>
                        )
                    }
                </label>

                <button
                    type="button"
                    className="bp-media-picker__refresh"
                    disabled={
                        loading
                    }
                    onClick={
                        refresh
                    }
                >
                    <i
                        className={
                            loading
                                ? "bi bi-arrow-repeat bp-media-picker__spin"
                                : "bi bi-arrow-clockwise"
                        }
                        aria-hidden="true"
                    />

                    Neu laden
                </button>
            </div>

            {
                error && (
                    <div
                        className="bp-media-picker__message bp-media-picker__message--error"
                        role="alert"
                    >
                        <i
                            className="bi bi-exclamation-triangle"
                            aria-hidden="true"
                        />

                        <div>
                            <strong>
                                Medien konnten nicht geladen werden
                            </strong>

                            <span>
                                {
                                    error
                                }
                            </span>
                        </div>
                    </div>
                )
            }

            {
                loading && (
                    <div
                        className="bp-media-picker__loading"
                        aria-live="polite"
                    >
                        <span className="bp-media-picker__loader">
                            <i
                                className="bi bi-arrow-repeat"
                                aria-hidden="true"
                            />
                        </span>

                        <strong>
                            Mediathek wird geladen
                        </strong>

                        <span>
                            Die Bilder werden aus der zentralen Medienverwaltung abgerufen.
                        </span>
                    </div>
                )
            }

            {
                !loading &&
                !error &&
                filteredAssets.length ===
                0 && (
                    <div className="bp-media-picker__empty">
                        <span className="bp-media-picker__empty-icon">
                            <i
                                className="bi bi-images"
                                aria-hidden="true"
                            />
                        </span>

                        <strong>
                            {
                                search
                                    ? "Keine passenden Bilder gefunden"
                                    : "Noch keine Bilder vorhanden"
                            }
                        </strong>

                        <span>
                            {
                                search
                                    ? "Ändere den Suchbegriff oder leere die Suche."
                                    : "Lade zuerst auf der Seite „Medien“ ein Bild hoch."
                            }
                        </span>

                        {
                            search && (
                                <button
                                    type="button"
                                    onClick={
                                        () =>
                                            setSearch(
                                                ""
                                            )
                                    }
                                >
                                    Suche zurücksetzen
                                </button>
                            )
                        }
                    </div>
                )
            }

            {
                !loading &&
                !error &&
                filteredAssets.length >
                0 && (
                    <div className="bp-media-picker__grid">
                        {
                            filteredAssets.map(
                                (asset) => (
                                    <MediaPickerCard
                                        key={
                                            asset.id
                                        }
                                        asset={
                                            asset
                                        }
                                        previewUrl={
                                            getAssetPreviewUrl(
                                                asset,
                                                previewUrls
                                            )
                                        }
                                        onSelect={
                                            onSelect
                                        }
                                    />
                                )
                            )
                        }
                    </div>
                )
            }

            <footer className="bp-media-picker__footer">
                <i
                    className="bi bi-info-circle"
                    aria-hidden="true"
                />

                <span>
                    Durch Anklicken eines Bildes wird es unmittelbar in den ausgewählten Bildblock übernommen.
                </span>
            </footer>
        </section>
    );
}