import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import AdminPage from "../components/AdminPage";

import Builder from "@cms/modules/builder/components/Builder";

import Button from "@shared/ui/Button";

import {
    getPage,
    getPageVersions,
    publishPage,
    restorePageVersion,
    unpublishPage,
    updatePage
} from "@cms/modules/pages/services/pageService";

import {
    getPageDataMode
} from "@shared/data/dataMode";

import {
    savePreviewPage
} from "@cms/modules/pages/services/previewService";

function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }

    return date.toLocaleString(
        "de-DE"
    );
}

function getChangeTypeLabel(
    changeType
) {
    const labels = {
        create:
            "Erstellt",

        save:
            "Gespeichert",

        publish:
            "Veröffentlicht",

        unpublish:
            "Als Entwurf gesetzt",

        restore:
            "Wiederhergestellt",

        delete:
            "Gelöscht"
    };

    return labels[changeType] ??
        changeType;
}

export default function PageEditor() {
    const navigate =
        useNavigate();

    const {
        id
    } = useParams();

    const [
        page,
        setPage
    ] = useState(null);

    const [
        versions,
        setVersions
    ] = useState([]);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        error,
        setError
    ] = useState("");

    const [
        message,
        setMessage
    ] = useState("");

    const [
        changingStatus,
        setChangingStatus
    ] = useState(false);

    const [
        restoringVersion,
        setRestoringVersion
    ] = useState(null);

    const [
        builderRevision,
        setBuilderRevision
    ] = useState(0);

    const pageDataMode =
        getPageDataMode();

    async function loadVersions() {
        if (
            pageDataMode !==
            "api"
        ) {
            setVersions([]);

            return;
        }

        const loadedVersions =
            await Promise.resolve(
                getPageVersions(id)
            );

        setVersions(
            Array.isArray(
                loadedVersions
            )
                ? loadedVersions
                : []
        );
    }

    async function loadPage() {
        setLoading(true);
        setError("");

        try {
            const loadedPage =
                await Promise.resolve(
                    getPage(id)
                );

            setPage(
                loadedPage ?? null
            );

            if (loadedPage) {
                await loadVersions();
            }
        } catch (loadError) {
            if (
                loadError.status ===
                404
            ) {
                setPage(null);
            } else {
                setError(
                    loadError.message ??
                    "Die Seite konnte nicht geladen werden."
                );
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPage();
    }, [id]);

    async function handleSave(
        builderPage
    ) {
        setMessage("");
        setError("");

        try {
            const savedPage =
                await Promise.resolve(
                    updatePage(
                        id,
                        builderPage
                    )
                );

            setPage(
                savedPage
            );

            setMessage(
                "Seite wurde gespeichert."
            );

            await loadVersions();

            return savedPage;
        } catch (saveError) {
            setError(
                saveError.message ??
                "Die Seite konnte nicht gespeichert werden."
            );

            throw saveError;
        }
    }

    async function handlePublish(
        builderPage
    ) {
        setMessage("");
        setError("");

        try {
            const publishedPage =
                await Promise.resolve(
                    publishPage(
                        id,
                        builderPage
                    )
                );

            setPage(
                publishedPage
            );

            setMessage(
                "Seite wurde veröffentlicht."
            );

            await loadVersions();

            return publishedPage;
        } catch (publishError) {
            setError(
                publishError.message ??
                "Die Seite konnte nicht veröffentlicht werden."
            );

            throw publishError;
        }
    }

    async function handleUnpublish() {
        if (
            !page ||
            changingStatus
        ) {
            return;
        }

        if (
            !globalThis.confirm(
                "Die veröffentlichte Seite wieder als Entwurf speichern?"
            )
        ) {
            return;
        }

        setChangingStatus(true);
        setMessage("");
        setError("");

        try {
            const draftPage =
                await Promise.resolve(
                    unpublishPage(
                        id,
                        page
                    )
                );

            setPage(
                draftPage
            );

            setBuilderRevision(
                (currentRevision) =>
                    currentRevision + 1
            );

            setMessage(
                "Die Seite ist jetzt wieder ein Entwurf."
            );

            await loadVersions();
        } catch (statusError) {
            setError(
                statusError.message ??
                "Der Seitenstatus konnte nicht geändert werden."
            );
        } finally {
            setChangingStatus(false);
        }
    }

    async function handleRestore(
        version
    ) {
        if (
            !globalThis.confirm(
                `Version ${version.versionNumber} wirklich wiederherstellen? Der aktuelle Stand bleibt als eigene Version erhalten.`
            )
        ) {
            return;
        }

        setRestoringVersion(
            version.versionNumber
        );
        setMessage("");
        setError("");

        try {
            const restoredPage =
                await Promise.resolve(
                    restorePageVersion(
                        id,
                        version.versionNumber
                    )
                );

            setPage(
                restoredPage
            );

            setBuilderRevision(
                (currentRevision) =>
                    currentRevision + 1
            );

            setMessage(
                `Version ${version.versionNumber} wurde wiederhergestellt.`
            );

            await loadVersions();
        } catch (restoreError) {
            setError(
                restoreError.message ??
                "Die Seitenversion konnte nicht wiederhergestellt werden."
            );
        } finally {
            setRestoringVersion(null);
        }
    }

    function handlePreview(
        builderPage
    ) {
        savePreviewPage(
            builderPage
        );

        const previewWindow =
            globalThis.open(
                `/admin/preview/${id}`,
                "_blank"
            );

        if (previewWindow) {
            previewWindow.opener =
                null;
        } else {
            navigate(
                `/admin/preview/${id}`
            );
        }

        return builderPage;
    }

    if (loading) {
        return (
            <AdminPage
                title="BluePulse Builder"
                description="Seite wird geladen …"
            >
                <div className="d-flex align-items-center gap-3 py-5">
                    <div className="spinner-border text-info" />

                    <span className="text-secondary">
                        Builder-Seite wird aus {
                            pageDataMode ===
                            "api"
                                ? "PostgreSQL"
                                : "dem Browser"
                        } geladen …
                    </span>
                </div>
            </AdminPage>
        );
    }

    if (!page) {
        return (
            <AdminPage
                title="Seite nicht gefunden"
                description="Die angeforderte Seite existiert nicht oder wurde gelöscht."
                action={
                    <Button
                        onClick={() =>
                            navigate(
                                "/admin/pages"
                            )
                        }
                    >
                        ← Zurück zu den Seiten
                    </Button>
                }
            >
                {
                    error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )
                }

                <p>
                    Für die ID „{id}“ wurde keine Seite gefunden.
                </p>
            </AdminPage>
        );
    }

    return (
        <AdminPage
            title="BluePulse Builder"
            description={`/${page.slug}`}
            action={
                <div className="d-flex flex-wrap align-items-center gap-2">
                    <span className="badge text-bg-info">
                        {
                            pageDataMode ===
                            "api"
                                ? "PostgreSQL"
                                : "Browser"
                        }
                    </span>

                    <span
                        className={
                            page.status ===
                            "published"
                                ? "badge text-bg-success"
                                : "badge text-bg-secondary"
                        }
                    >
                        {
                            page.status ===
                            "published"
                                ? "Veröffentlicht"
                                : "Entwurf"
                        }
                    </span>

                    {
                        page.status ===
                        "published" && (
                            <Button
                                variant="secondary"
                                disabled={
                                    changingStatus
                                }
                                onClick={
                                    handleUnpublish
                                }
                            >
                                Als Entwurf
                            </Button>
                        )
                    }

                    <Button
                        variant="secondary"
                        onClick={() =>
                            navigate(
                                "/admin/pages"
                            )
                        }
                    >
                        ← Zurück
                    </Button>
                </div>
            }
        >
            {
                error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )
            }

            {
                message && (
                    <div className="alert alert-success">
                        {message}
                    </div>
                )
            }

            <Builder
                key={
                    `${page.id}-${builderRevision}`
                }
                initialPage={page}
                onSave={handleSave}
                onPublish={
                    handlePublish
                }
                onPreview={
                    handlePreview
                }
            />

            {
                pageDataMode ===
                "api" && (
                    <section className="mt-5">
                        <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                            <div>
                                <h2>
                                    Versionsverlauf
                                </h2>

                                <p className="text-secondary mb-0">
                                    Bei jedem Speichern und Veröffentlichen wird
                                    automatisch eine PostgreSQL-Version erstellt.
                                </p>
                            </div>

                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={
                                    loadVersions
                                }
                            >
                                Aktualisieren
                            </Button>
                        </div>

                        {
                            versions.length ===
                            0 ? (
                                <div className="alert alert-secondary">
                                    Noch keine Seitenversionen vorhanden.
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-dark table-hover align-middle">
                                        <thead>
                                            <tr>
                                                <th>Version</th>
                                                <th>Änderung</th>
                                                <th>Titel</th>
                                                <th>Status</th>
                                                <th>Zeitpunkt</th>
                                                <th>Aktion</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {
                                                versions.map(
                                                    (version) => (
                                                        <tr
                                                            key={
                                                                version.id
                                                            }
                                                        >
                                                            <td>
                                                                <strong>
                                                                    #
                                                                    {
                                                                        version.versionNumber
                                                                    }
                                                                </strong>
                                                            </td>

                                                            <td>
                                                                {
                                                                    getChangeTypeLabel(
                                                                        version.changeType
                                                                    )
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    version
                                                                        .snapshot
                                                                        ?.title ??
                                                                    "—"
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    version
                                                                        .snapshot
                                                                        ?.status ===
                                                                    "published"
                                                                        ? "Veröffentlicht"
                                                                        : "Entwurf"
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    formatDate(
                                                                        version.createdAt
                                                                    )
                                                                }
                                                            </td>

                                                            <td>
                                                                <Button
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    disabled={
                                                                        restoringVersion !==
                                                                        null
                                                                    }
                                                                    onClick={() =>
                                                                        handleRestore(
                                                                            version
                                                                        )
                                                                    }
                                                                >
                                                                    {
                                                                        restoringVersion ===
                                                                        version.versionNumber
                                                                            ? "Wird wiederhergestellt …"
                                                                            : "Wiederherstellen"
                                                                    }
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    )
                                                )
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            )
                        }
                    </section>
                )
            }
        </AdminPage>
    );
}