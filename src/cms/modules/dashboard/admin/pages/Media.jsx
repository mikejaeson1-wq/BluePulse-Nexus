import "./Media.css";

import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import AdminPage from "../components/AdminPage";

import Button from "@shared/ui/Button";

import useMediaLibrary from "@cms/modules/media/hooks/useMediaLibrary";

import {
    createMediaReference,
    formatFileSize,
    isImageAsset,
    isPdfAsset
} from "@cms/modules/media/services/mediaService";

function copyText(value) {
    if (
        navigator.clipboard?.writeText
    ) {
        return navigator.clipboard.writeText(
            value
        );
    }

    return new Promise(
        (resolve, reject) => {
            const textarea =
                document.createElement(
                    "textarea"
                );

            textarea.value = value;

            textarea.style.position =
                "fixed";

            textarea.style.opacity =
                "0";

            document.body.appendChild(
                textarea
            );

            textarea.select();

            const successful =
                document.execCommand(
                    "copy"
                );

            textarea.remove();

            if (successful) {
                resolve();
                return;
            }

            reject(
                new Error(
                    "Kopieren wurde vom Browser abgelehnt."
                )
            );
        }
    );
}

function formatDate(value) {
    if (!value) {
        return "—";
    }

    return new Date(
        value
    ).toLocaleString(
        "de-DE",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}

function MediaPreview({
    asset,
    previewUrl,
    className = ""
}) {
    if (
        isImageAsset(asset) &&
        previewUrl
    ) {
        return (
            <img
                className={className}
                src={previewUrl}
                alt={
                    asset.altText ||
                    asset.name
                }
            />
        );
    }

    if (isPdfAsset(asset)) {
        return (
            <div
                className={
                    `media-library__fileIcon ${className}`
                }
            >
                <i
                    className="bi bi-file-earmark-pdf"
                    aria-hidden="true"
                />

                <span>
                    PDF
                </span>
            </div>
        );
    }

    return (
        <div
            className={
                `media-library__fileIcon ${className}`
            }
        >
            <i
                className="bi bi-file-earmark"
                aria-hidden="true"
            />
        </div>
    );
}

export default function Media() {
    const fileInputRef =
        useRef(null);

    const {
        assets,
        previewUrls,
        loading,
        uploading,
        error,
        upload,
        saveAsset,
        removeAsset
    } = useMediaLibrary();

    const [
        search,
        setSearch
    ] = useState("");

    const [
        selectedId,
        setSelectedId
    ] = useState(null);

    const [
        draft,
        setDraft
    ] = useState({
        name: "",
        altText: "",
        caption: ""
    });

    const [
        notice,
        setNotice
    ] = useState("");

    const [
        dragActive,
        setDragActive
    ] = useState(false);

    const selectedAsset =
        useMemo(
            () =>
                assets.find(
                    (asset) =>
                        asset.id ===
                        selectedId
                ) ?? null,
            [
                assets,
                selectedId
            ]
        );

    const filteredAssets =
        useMemo(
            () => {
                const normalizedSearch =
                    search
                        .trim()
                        .toLowerCase();

                if (!normalizedSearch) {
                    return assets;
                }

                return assets.filter(
                    (asset) =>
                        [
                            asset.name,
                            asset.altText,
                            asset.caption,
                            asset.type
                        ]
                            .filter(Boolean)
                            .some((value) =>
                                value
                                    .toLowerCase()
                                    .includes(
                                        normalizedSearch
                                    )
                            )
                );
            },
            [
                assets,
                search
            ]
        );

    useEffect(() => {
        if (!selectedAsset) {
            setDraft({
                name: "",
                altText: "",
                caption: ""
            });

            return;
        }

        setDraft({
            name:
                selectedAsset.name ?? "",
            altText:
                selectedAsset.altText ??
                "",
            caption:
                selectedAsset.caption ??
                ""
        });
    }, [selectedAsset]);

    useEffect(() => {
        if (
            selectedId &&
            !assets.some(
                (asset) =>
                    asset.id ===
                    selectedId
            )
        ) {
            setSelectedId(null);
        }
    }, [
        assets,
        selectedId
    ]);

    async function handleFiles(files) {
        if (
            !files ||
            files.length === 0
        ) {
            return;
        }

        setNotice("");

        try {
            const uploadedAssets =
                await upload(files);

            setNotice(
                uploadedAssets.length === 1
                    ? "Eine Datei wurde hochgeladen."
                    : `${uploadedAssets.length} Dateien wurden hochgeladen.`
            );

            if (
                uploadedAssets.length > 0
            ) {
                setSelectedId(
                    uploadedAssets[0].id
                );
            }
        } catch {
            // Fehlermeldung kommt aus dem Hook.
        }
    }

    function handleFileInput(
        event
    ) {
        handleFiles(
            event.target.files
        );

        event.target.value = "";
    }

    function handleDragOver(
        event
    ) {
        event.preventDefault();

        setDragActive(true);
    }

    function handleDragLeave(
        event
    ) {
        event.preventDefault();

        if (
            event.currentTarget.contains(
                event.relatedTarget
            )
        ) {
            return;
        }

        setDragActive(false);
    }

    function handleDrop(event) {
        event.preventDefault();

        setDragActive(false);

        handleFiles(
            event.dataTransfer.files
        );
    }

    function updateDraft(
        field,
        value
    ) {
        setDraft(
            (currentDraft) => ({
                ...currentDraft,
                [field]: value
            })
        );

        setNotice("");
    }

    async function handleSaveMetadata(
        event
    ) {
        event.preventDefault();

        if (!selectedAsset) {
            return;
        }

        try {
            await saveAsset(
                selectedAsset.id,
                {
                    name:
                        draft.name.trim() ||
                        selectedAsset.name,

                    altText:
                        draft.altText.trim(),

                    caption:
                        draft.caption.trim()
                }
            );

            setNotice(
                "Mediendaten wurden gespeichert."
            );
        } catch {
            // Fehlermeldung kommt aus dem Hook.
        }
    }

    async function handleCopyReference() {
        if (!selectedAsset) {
            return;
        }

        try {
            await copyText(
                createMediaReference(
                    selectedAsset.id
                )
            );

            setNotice(
                "Medienreferenz wurde kopiert."
            );
        } catch (copyError) {
            setNotice(
                copyError.message
            );
        }
    }

    function handleDownload() {
        if (
            !selectedAsset ||
            !previewUrls[
                selectedAsset.id
            ]
        ) {
            return;
        }

        const anchor =
            document.createElement(
                "a"
            );

        anchor.href =
            previewUrls[
                selectedAsset.id
            ];

        anchor.download =
            selectedAsset.name;

        document.body.appendChild(
            anchor
        );

        anchor.click();
        anchor.remove();
    }

    async function handleDelete() {
        if (!selectedAsset) {
            return;
        }

        if (
            !confirm(
                `„${selectedAsset.name}“ wirklich löschen?`
            )
        ) {
            return;
        }

        try {
            await removeAsset(
                selectedAsset.id
            );

            setSelectedId(null);

            setNotice(
                "Datei wurde gelöscht."
            );
        } catch {
            // Fehlermeldung kommt aus dem Hook.
        }
    }

    return (
        <AdminPage
            title="Medien"
            description="Bilder und PDF-Dateien zentral verwalten."
            action={
                <Button
                    onClick={() =>
                        fileInputRef.current?.click()
                    }
                    disabled={uploading}
                >
                    {
                        uploading
                            ? "Wird hochgeladen …"
                            : "+ Dateien hochladen"
                    }
                </Button>
            }
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                multiple
                hidden
                onChange={
                    handleFileInput
                }
            />

            {
                error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )
            }

            {
                notice && (
                    <div className="alert alert-success">
                        {notice}
                    </div>
                )
            }

            <div
                className={
                    dragActive
                        ? "media-library__dropzone media-library__dropzone--active"
                        : "media-library__dropzone"
                }
                onDragOver={
                    handleDragOver
                }
                onDragLeave={
                    handleDragLeave
                }
                onDrop={handleDrop}
            >
                <i
                    className="bi bi-cloud-arrow-up"
                    aria-hidden="true"
                />

                <div>
                    <strong>
                        Dateien hierher ziehen
                    </strong>

                    <span>
                        Bilder oder PDFs bis maximal 15 MB
                    </span>
                </div>

                <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                        fileInputRef.current?.click()
                    }
                    disabled={uploading}
                >
                    Dateien auswählen
                </Button>
            </div>

            <div className="media-library__toolbar">
                <div>
                    <h2>
                        Medienbibliothek
                    </h2>

                    <span>
                        {assets.length}{" "}
                        {
                            assets.length === 1
                                ? "Datei"
                                : "Dateien"
                        }
                    </span>
                </div>

                <div className="media-library__search">
                    <i
                        className="bi bi-search"
                        aria-hidden="true"
                    />

                    <input
                        type="search"
                        placeholder="Medien durchsuchen …"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />
                </div>
            </div>

            <div className="media-library__layout">
                <section className="media-library__content">
                    {
                        loading && (
                            <div className="media-library__empty">
                                Medien werden geladen …
                            </div>
                        )
                    }

                    {
                        !loading &&
                        filteredAssets.length ===
                        0 && (
                            <div className="media-library__empty">
                                <i
                                    className="bi bi-images"
                                    aria-hidden="true"
                                />

                                <strong>
                                    Keine Medien gefunden
                                </strong>

                                <span>
                                    Lade eine Datei hoch oder ändere deine Suche.
                                </span>
                            </div>
                        )
                    }

                    {
                        !loading &&
                        filteredAssets.length >
                        0 && (
                            <div className="media-library__grid">
                                {
                                    filteredAssets.map(
                                        (asset) => (
                                            <button
                                                key={asset.id}
                                                type="button"
                                                className={
                                                    selectedId ===
                                                    asset.id
                                                        ? "media-library__card media-library__card--selected"
                                                        : "media-library__card"
                                                }
                                                onClick={() =>
                                                    setSelectedId(
                                                        asset.id
                                                    )
                                                }
                                            >
                                                <div className="media-library__thumbnail">
                                                    <MediaPreview
                                                        asset={
                                                            asset
                                                        }
                                                        previewUrl={
                                                            previewUrls[
                                                                asset.id
                                                            ]
                                                        }
                                                    />
                                                </div>

                                                <div className="media-library__cardBody">
                                                    <strong title={asset.name}>
                                                        {
                                                            asset.name
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            formatFileSize(
                                                                asset.size
                                                            )
                                                        }
                                                    </span>
                                                </div>
                                            </button>
                                        )
                                    )
                                }
                            </div>
                        )
                    }
                </section>

                <aside className="media-library__details">
                    {
                        !selectedAsset && (
                            <div className="media-library__detailsEmpty">
                                <i
                                    className="bi bi-info-circle"
                                    aria-hidden="true"
                                />

                                <p>
                                    Wähle eine Datei aus, um ihre Details zu bearbeiten.
                                </p>
                            </div>
                        )
                    }

                    {
                        selectedAsset && (
                            <>
                                <div className="media-library__detailPreview">
                                    <MediaPreview
                                        asset={
                                            selectedAsset
                                        }
                                        previewUrl={
                                            previewUrls[
                                                selectedAsset.id
                                            ]
                                        }
                                    />
                                </div>

                                <form
                                    onSubmit={
                                        handleSaveMetadata
                                    }
                                >
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Dateiname
                                        </label>

                                        <input
                                            className="form-control"
                                            value={
                                                draft.name
                                            }
                                            onChange={(event) =>
                                                updateDraft(
                                                    "name",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    {
                                        isImageAsset(
                                            selectedAsset
                                        ) && (
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Alternativtext
                                                </label>

                                                <textarea
                                                    className="form-control"
                                                    rows="3"
                                                    value={
                                                        draft.altText
                                                    }
                                                    onChange={(event) =>
                                                        updateDraft(
                                                            "altText",
                                                            event.target.value
                                                        )
                                                    }
                                                />

                                                <small className="text-secondary">
                                                    Beschreibt das Bild für Barrierefreiheit und Suchmaschinen.
                                                </small>
                                            </div>
                                        )
                                    }

                                    <div className="mb-3">
                                        <label className="form-label">
                                            Bildunterschrift / Beschreibung
                                        </label>

                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={
                                                draft.caption
                                            }
                                            onChange={(event) =>
                                                updateDraft(
                                                    "caption",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <dl className="media-library__metadata">
                                        <div>
                                            <dt>
                                                Dateityp
                                            </dt>

                                            <dd>
                                                {
                                                    selectedAsset.type
                                                }
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>
                                                Dateigröße
                                            </dt>

                                            <dd>
                                                {
                                                    formatFileSize(
                                                        selectedAsset.size
                                                    )
                                                }
                                            </dd>
                                        </div>

                                        {
                                            selectedAsset.width &&
                                            selectedAsset.height && (
                                                <div>
                                                    <dt>
                                                        Abmessungen
                                                    </dt>

                                                    <dd>
                                                        {
                                                            selectedAsset.width
                                                        } × {
                                                            selectedAsset.height
                                                        } px
                                                    </dd>
                                                </div>
                                            )
                                        }

                                        <div>
                                            <dt>
                                                Hochgeladen
                                            </dt>

                                            <dd>
                                                {
                                                    formatDate(
                                                        selectedAsset.createdAt
                                                    )
                                                }
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>
                                                Nexus-Referenz
                                            </dt>

                                            <dd>
                                                <code>
                                                    {
                                                        createMediaReference(
                                                            selectedAsset.id
                                                        )
                                                    }
                                                </code>
                                            </dd>
                                        </div>
                                    </dl>

                                    <div className="media-library__actions">
                                        <Button type="submit">
                                            Metadaten speichern
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={
                                                handleCopyReference
                                            }
                                        >
                                            Referenz kopieren
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={
                                                handleDownload
                                            }
                                        >
                                            Herunterladen
                                        </Button>

                                        <button
                                            type="button"
                                            className="media-library__delete"
                                            onClick={
                                                handleDelete
                                            }
                                        >
                                            Datei löschen
                                        </button>
                                    </div>
                                </form>
                            </>
                        )
                    }
                </aside>
            </div>
        </AdminPage>
    );
}