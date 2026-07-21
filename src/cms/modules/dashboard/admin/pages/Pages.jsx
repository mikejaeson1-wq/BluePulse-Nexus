import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import AdminPage from "../components/AdminPage";

import Modal from "@shared/ui/Modal";
import Button from "@shared/ui/Button";

import PageForm from "@cms/modules/pages/components/PageForm";

import {
    deletePage,
    duplicatePage,
    refreshPages
} from "@cms/modules/pages/services/pageService";

import {
    getPageDataMode
} from "@shared/data/dataMode";

import {
    WEBSITE_STRUCTURE
} from "@shared/constants/siteStructure";

function getStructureTypeLabel(item) {
    return item.type === "page"
        ? "Kernseite"
        : "Abschnitt";
}

function getStructureStatusLabel(item) {
    return item.status === "active"
        ? "Vorhanden"
        : "Noch nicht angelegt";
}

function getNavigationLabel(item) {
    if (item.cta) {
        return "CTA-Button";
    }

    if (item.navigation) {
        return "Hauptmenü";
    }

    return "Nicht im Menü";
}

export default function Pages() {
    const navigate =
        useNavigate();

    const [
        open,
        setOpen
    ] = useState(false);

    const [
        pages,
        setPages
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
        processingId,
        setProcessingId
    ] = useState(null);

    const pageDataMode =
        getPageDataMode();

    async function loadPages({
        silent = false
    } = {}) {
        if (!silent) {
            setLoading(true);
        }

        setError("");

        try {
            const loadedPages =
                await Promise.resolve(
                    refreshPages()
                );

            setPages(
                Array.isArray(
                    loadedPages
                )
                    ? loadedPages
                    : []
            );
        } catch (loadError) {
            setError(
                loadError.message ??
                "Die Builder-Seiten konnten nicht geladen werden."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPages();
    }, []);

    async function handleSave(
        createdPage
    ) {
        setOpen(false);

        await loadPages({
            silent: true
        });

        if (createdPage?.id) {
            navigate(
                `/admin/pages/${createdPage.id}`
            );
        }
    }

    async function handleDelete(
        page
    ) {
        if (
            !globalThis.confirm(
                `Seite „${page.title}“ wirklich löschen?`
            )
        ) {
            return;
        }

        setProcessingId(
            page.id
        );
        setError("");

        try {
            await Promise.resolve(
                deletePage(
                    page.id
                )
            );

            await loadPages({
                silent: true
            });
        } catch (deleteError) {
            setError(
                deleteError.message ??
                "Die Seite konnte nicht gelöscht werden."
            );
        } finally {
            setProcessingId(null);
        }
    }

    async function handleDuplicate(
        page
    ) {
        setProcessingId(
            page.id
        );
        setError("");

        try {
            const duplicatedPage =
                await Promise.resolve(
                    duplicatePage(
                        page.id
                    )
                );

            await loadPages({
                silent: true
            });

            if (
                duplicatedPage?.id
            ) {
                navigate(
                    `/admin/pages/${duplicatedPage.id}`
                );
            }
        } catch (duplicateError) {
            setError(
                duplicateError.message ??
                "Die Seite konnte nicht dupliziert werden."
            );
        } finally {
            setProcessingId(null);
        }
    }

    function openWebsiteItem(item) {
        globalThis.open(
            item.route,
            "_blank",
            "noopener,noreferrer"
        );
    }

    function editWebsiteItem(item) {
        navigate(
            `/admin/website/${item.id}`
        );
    }

    return (
        <>
            <AdminPage
                title="Seiten"
                description="Verwalte die vorhandene Website-Struktur und zusätzliche CMS-Seiten."
                action={
                    <div className="d-flex align-items-center gap-3">
                        <span className="badge text-bg-info">
                            Builder: {
                                pageDataMode ===
                                "api"
                                    ? "PostgreSQL"
                                    : "Browser"
                            }
                        </span>

                        <Button
                            onClick={() =>
                                setOpen(true)
                            }
                        >
                            + Neue Seite
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

                <section className="mb-5">
                    <div className="mb-3">
                        <h2>
                            Vorhandene Website-Struktur
                        </h2>

                        <p className="text-secondary mb-0">
                            Diese Bereiche stammen aus der bestehenden
                            BluePulse-Website.
                        </p>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-dark table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>Bereich</th>
                                    <th>Typ</th>
                                    <th>Komponente</th>
                                    <th>Status</th>
                                    <th>Navigation</th>
                                    <th>Aktionen</th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    WEBSITE_STRUCTURE.map(
                                        (item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    {item.title}
                                                </td>

                                                <td>
                                                    {
                                                        getStructureTypeLabel(
                                                            item
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.component ??
                                                        "—"
                                                    }
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            item.status ===
                                                            "active"
                                                                ? "badge text-bg-success"
                                                                : "badge text-bg-secondary"
                                                        }
                                                    >
                                                        {
                                                            getStructureStatusLabel(
                                                                item
                                                            )
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    {
                                                        getNavigationLabel(
                                                            item
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    <div className="d-flex gap-2">
                                                        {
                                                            item.editable &&
                                                            item.contentKey && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        editWebsiteItem(
                                                                            item
                                                                        )
                                                                    }
                                                                >
                                                                    Bearbeiten
                                                                </Button>
                                                            )
                                                        }

                                                        {
                                                            item.status ===
                                                            "active" && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    onClick={() =>
                                                                        openWebsiteItem(
                                                                            item
                                                                        )
                                                                    }
                                                                >
                                                                    Ansehen
                                                                </Button>
                                                            )
                                                        }
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )
                                }
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                        <div>
                            <h2>
                                Zusätzliche CMS-Seiten
                            </h2>

                            <p className="text-secondary mb-0">
                                Frei erstellte Seiten aus dem
                                BluePulse Builder.
                            </p>
                        </div>

                        <Button
                            size="sm"
                            variant="secondary"
                            disabled={loading}
                            onClick={() =>
                                loadPages()
                            }
                        >
                            Aktualisieren
                        </Button>
                    </div>

                    {
                        loading && (
                            <div className="d-flex align-items-center gap-3 py-4">
                                <div className="spinner-border spinner-border-sm text-info" />

                                <span className="text-secondary">
                                    Builder-Seiten werden geladen …
                                </span>
                            </div>
                        )
                    }

                    {
                        !loading &&
                        pages.length === 0 && (
                            <div className="alert alert-secondary">
                                Noch keine zusätzlichen CMS-Seiten vorhanden.
                            </div>
                        )
                    }

                    {
                        !loading &&
                        pages.length > 0 && (
                            <div className="table-responsive">
                                <table className="table table-dark table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th>Titel</th>
                                            <th>Slug</th>
                                            <th>Template</th>
                                            <th>Status</th>
                                            <th>Aktualisiert</th>
                                            <th>Aktionen</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {
                                            pages.map(
                                                (page) => (
                                                    <tr key={page.id}>
                                                        <td>
                                                            {page.title}
                                                        </td>

                                                        <td>
                                                            <code>
                                                                /{page.slug}
                                                            </code>
                                                        </td>

                                                        <td>
                                                            {page.template}
                                                        </td>

                                                        <td>
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
                                                        </td>

                                                        <td>
                                                            {
                                                                page.updatedAt
                                                                    ? new Date(
                                                                        page.updatedAt
                                                                    ).toLocaleString(
                                                                        "de-DE"
                                                                    )
                                                                    : "—"
                                                            }
                                                        </td>

                                                        <td>
                                                            <div className="d-flex flex-wrap gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    disabled={
                                                                        processingId ===
                                                                        page.id
                                                                    }
                                                                    onClick={() =>
                                                                        navigate(
                                                                            `/admin/pages/${page.id}`
                                                                        )
                                                                    }
                                                                >
                                                                    Bearbeiten
                                                                </Button>

                                                                <Button
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    disabled={
                                                                        processingId ===
                                                                        page.id
                                                                    }
                                                                    onClick={() =>
                                                                        handleDuplicate(
                                                                            page
                                                                        )
                                                                    }
                                                                >
                                                                    Duplizieren
                                                                </Button>

                                                                {
                                                                    page.status ===
                                                                    "published" && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="secondary"
                                                                            onClick={() =>
                                                                                globalThis.open(
                                                                                    `/${page.slug}`,
                                                                                    "_blank",
                                                                                    "noopener,noreferrer"
                                                                                )
                                                                            }
                                                                        >
                                                                            Ansehen
                                                                        </Button>
                                                                    )
                                                                }

                                                                <Button
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    disabled={
                                                                        processingId ===
                                                                        page.id
                                                                    }
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            page
                                                                        )
                                                                    }
                                                                >
                                                                    Löschen
                                                                </Button>
                                                            </div>
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
            </AdminPage>

            <Modal
                open={open}
                title="Neue Seite"
                onClose={() =>
                    setOpen(false)
                }
            >
                <PageForm
                    onSave={
                        handleSave
                    }
                />
            </Modal>
        </>
    );
}