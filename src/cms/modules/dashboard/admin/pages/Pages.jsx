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
    getPages,
    deletePage
} from "@cms/modules/pages/services/pageService";

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
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [pages, setPages] = useState([]);

    function loadPages() {
        setPages(
            getPages()
        );
    }

    useEffect(() => {
        loadPages();
    }, []);

    function handleSave() {
        loadPages();
        setOpen(false);
    }

    function handleDelete(id) {
        if (!confirm("Seite wirklich löschen?")) {
            return;
        }

        deletePage(id);
        loadPages();
    }

    function openWebsiteItem(item) {
        window.open(
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
                    <Button
                        onClick={() => setOpen(true)}
                    >
                        + Neue Seite
                    </Button>
                }
            >
                <section className="mb-5">
                    <div className="mb-3">
                        <h2>
                            Vorhandene Website-Struktur
                        </h2>

                        <p className="text-secondary mb-0">
                            Diese Bereiche stammen aus der
                            bestehenden BluePulse-Website.
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

                                                        {
                                                            item.status !==
                                                            "active" && (
                                                                <span className="text-secondary">
                                                                    —
                                                                </span>
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
                    <div className="mb-3">
                        <h2>
                            Zusätzliche CMS-Seiten
                        </h2>

                        <p className="text-secondary mb-0">
                            Frei erstellte Seiten aus dem
                            BluePulse Builder.
                        </p>
                    </div>

                    {
                        pages.length === 0 && (
                            <p>
                                Noch keine zusätzlichen
                                CMS-Seiten vorhanden.
                            </p>
                        )
                    }

                    {
                        pages.length > 0 && (
                            <div className="table-responsive">
                                <table className="table table-dark table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th>Titel</th>
                                            <th>Slug</th>
                                            <th>Template</th>
                                            <th>Status</th>
                                            <th>Aktionen</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {
                                            pages.map((page) => (
                                                <tr key={page.id}>
                                                    <td>
                                                        {page.title}
                                                    </td>

                                                    <td>
                                                        {page.slug}
                                                    </td>

                                                    <td>
                                                        {page.template}
                                                    </td>

                                                    <td>
                                                        {
                                                            page.status ===
                                                            "published"
                                                                ? "Veröffentlicht"
                                                                : "Entwurf"
                                                        }
                                                    </td>

                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            <Button
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/admin/pages/${page.id}`
                                                                    )
                                                                }
                                                            >
                                                                Bearbeiten
                                                            </Button>

                                                            <Button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        page.id
                                                                    )
                                                                }
                                                            >
                                                                Löschen
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
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
                onClose={() => setOpen(false)}
            >
                <PageForm
                    onSave={handleSave}
                />
            </Modal>
        </>
    );
}