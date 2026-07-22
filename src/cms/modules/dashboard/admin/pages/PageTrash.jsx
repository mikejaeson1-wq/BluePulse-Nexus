import "./PageTrash.css";

import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import AdminPage from "../components/AdminPage";

import Button from "@shared/ui/Button";

import {
    useAuth
} from "@cms/modules/auth/context/AuthContext";

import {
    listDeletedPages,
    permanentlyDeletePage,
    restoreDeletedPage
} from "@cms/modules/pages/services/pageTrashService";

const ADMINISTRATOR =
    "administrator";

function formatDate(value) {
    if (!value) {
        return "Unbekannt";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Unbekannt";
    }

    return new Intl.DateTimeFormat(
        "de-DE",
        {
            dateStyle:
                "medium",

            timeStyle:
                "short"
        }
    ).format(date);
}

function getStatusLabel(status) {
    return status ===
        "published"
        ? "War veröffentlicht"
        : "War Entwurf";
}

function TrashStatistic({
    icon,
    value,
    label,
    description
}) {
    return (
        <article className="page-trash-stat">
            <span className="page-trash-stat__icon">
                <i
                    className={
                        `bi ${icon}`
                    }
                    aria-hidden="true"
                />
            </span>

            <div>
                <strong>
                    {value}
                </strong>

                <span>
                    {label}
                </span>

                <small>
                    {description}
                </small>
            </div>
        </article>
    );
}

function LoadingState() {
    return (
        <div
            className="page-trash-loading"
            role="status"
            aria-live="polite"
        >
            <span
                className="spinner-border text-info"
                aria-hidden="true"
            />

            <span>
                Papierkorb wird aus PostgreSQL geladen …
            </span>
        </div>
    );
}

export default function PageTrash() {
    const navigate =
        useNavigate();

    const {
        user
    } =
        useAuth();

    const [
        pages,
        setPages
    ] =
        useState([]);

    const [
        loading,
        setLoading
    ] =
        useState(true);

    const [
        error,
        setError
    ] =
        useState("");

    const [
        message,
        setMessage
    ] =
        useState("");

    const [
        searchTerm,
        setSearchTerm
    ] =
        useState("");

    const [
        processing,
        setProcessing
    ] =
        useState({
            pageId: null,
            action: null
        });

    const isAdministrator =
        user?.role ===
        ADMINISTRATOR;

    const busy =
        Boolean(
            processing.pageId
        );

    const loadTrash =
        useCallback(
            async ({
                signal,
                silent = false
            } = {}) => {
                if (!silent) {
                    setLoading(true);
                }

                setError("");

                try {
                    const loadedPages =
                        await listDeletedPages({
                            signal
                        });

                    if (
                        signal?.aborted
                    ) {
                        return;
                    }

                    setPages(
                        loadedPages
                    );
                } catch (
                    loadError
                ) {
                    if (
                        loadError?.name ===
                            "AbortError" ||
                        signal?.aborted
                    ) {
                        return;
                    }

                    setError(
                        loadError.message ??
                        "Der Papierkorb konnte nicht geladen werden."
                    );
                } finally {
                    if (
                        !signal?.aborted
                    ) {
                        setLoading(false);
                    }
                }
            },
            []
        );

    useEffect(() => {
        const controller =
            new AbortController();

        loadTrash({
            signal:
                controller.signal
        });

        return () => {
            controller.abort();
        };
    }, [
        loadTrash
    ]);

    const statistics =
        useMemo(
            () => ({
                total:
                    pages.length,

                published:
                    pages.filter(
                        (page) =>
                            page.status ===
                            "published"
                    ).length,

                drafts:
                    pages.filter(
                        (page) =>
                            page.status !==
                            "published"
                    ).length
            }),
            [
                pages
            ]
        );

    const filteredPages =
        useMemo(
            () => {
                const search =
                    searchTerm
                        .trim()
                        .toLowerCase();

                if (!search) {
                    return pages;
                }

                return pages.filter(
                    (page) =>
                        [
                            page.title,
                            page.slug,
                            page.template,
                            getStatusLabel(
                                page.status
                            )
                        ]
                            .filter(
                                Boolean
                            )
                            .some(
                                (value) =>
                                    String(
                                        value
                                    )
                                        .toLowerCase()
                                        .includes(
                                            search
                                        )
                            )
                );
            },
            [
                pages,
                searchTerm
            ]
        );

    async function handleRestore(
        page
    ) {
        if (busy) {
            return;
        }

        const confirmed =
            globalThis.confirm(
                [
                    `Seite „${page.title}“ wiederherstellen?`,
                    "",
                    "Die Seite wird als Entwurf wiederhergestellt und ist nicht sofort öffentlich."
                ].join(
                    "\n"
                )
            );

        if (!confirmed) {
            return;
        }

        setProcessing({
            pageId:
                page.id,

            action:
                "restore"
        });

        setError("");
        setMessage("");

        try {
            const restoredPage =
                await restoreDeletedPage(
                    page.id
                );

            setPages(
                (currentPages) =>
                    currentPages.filter(
                        (
                            currentPage
                        ) =>
                            currentPage.id !==
                            page.id
                    )
            );

            if (
                restoredPage
                    ?.restoredSlugChanged
            ) {
                setMessage(
                    [
                        `„${restoredPage.title}“ wurde als Entwurf wiederhergestellt.`,
                        `Der ursprüngliche Slug war bereits vergeben. Neuer Slug: /${restoredPage.slug}`
                    ].join(
                        " "
                    )
                );
            } else {
                setMessage(
                    `„${restoredPage?.title ?? page.title}“ wurde als Entwurf wiederhergestellt.`
                );
            }
        } catch (
            restoreError
        ) {
            setError(
                restoreError.message ??
                "Die Seite konnte nicht wiederhergestellt werden."
            );
        } finally {
            setProcessing({
                pageId: null,
                action: null
            });
        }
    }

    async function handlePermanentDelete(
        page
    ) {
        if (
            busy ||
            !isAdministrator
        ) {
            return;
        }

        const confirmation =
            globalThis.prompt(
                [
                    `„${page.title}“ endgültig löschen?`,
                    "",
                    "Die Seite und alle gespeicherten Versionen werden unwiderruflich entfernt.",
                    "",
                    `Gib zur Bestätigung exakt diesen Seitentitel ein:`,
                    page.title
                ].join(
                    "\n"
                )
            );

        if (
            confirmation ===
            null
        ) {
            return;
        }

        if (
            confirmation.trim() !==
            page.title
        ) {
            setMessage("");

            setError(
                "Der eingegebene Seitentitel stimmt nicht überein. Die Seite wurde nicht gelöscht."
            );

            return;
        }

        setProcessing({
            pageId:
                page.id,

            action:
                "delete"
        });

        setError("");
        setMessage("");

        try {
            await permanentlyDeletePage(
                page.id
            );

            setPages(
                (currentPages) =>
                    currentPages.filter(
                        (
                            currentPage
                        ) =>
                            currentPage.id !==
                            page.id
                    )
            );

            setMessage(
                `„${page.title}“ wurde endgültig gelöscht.`
            );
        } catch (
            deleteError
        ) {
            setError(
                deleteError.message ??
                "Die Seite konnte nicht endgültig gelöscht werden."
            );
        } finally {
            setProcessing({
                pageId: null,
                action: null
            });
        }
    }

    function openPageManagement() {
        navigate(
            "/admin/pages"
        );
    }

    return (
        <AdminPage
            title="Seiten-Papierkorb"
            description="Gelöschte Builder-Seiten wiederherstellen oder endgültig entfernen."
            action={
                <div className="page-trash__header-actions">
                    <span className="page-trash__counter">
                        <i
                            className="bi bi-trash3"
                            aria-hidden="true"
                        />

                        {
                            pages.length
                        }

                        {
                            pages.length ===
                                1
                                ? " Seite"
                                : " Seiten"
                        }
                    </span>

                    <Button
                        variant="secondary"
                        onClick={
                            openPageManagement
                        }
                    >
                        <i
                            className="bi bi-arrow-left"
                            aria-hidden="true"
                        />

                        Zur Seitenverwaltung
                    </Button>
                </div>
            }
        >
            {
                error && (
                    <div
                        className="alert alert-danger"
                        role="alert"
                    >
                        {error}
                    </div>
                )
            }

            {
                message && (
                    <div
                        className="alert alert-success"
                        role="status"
                    >
                        {message}
                    </div>
                )
            }

            <div className="page-trash__notice">
                <i
                    className="bi bi-info-circle"
                    aria-hidden="true"
                />

                <div>
                    <strong>
                        Wiederhergestellte Seiten werden als Entwurf gespeichert.
                    </strong>

                    <span>
                        Dadurch wird eine zuvor veröffentlichte Seite nicht versehentlich sofort wieder öffentlich.
                    </span>
                </div>
            </div>

            {
                !isAdministrator && (
                    <div className="page-trash__permission-notice">
                        <i
                            className="bi bi-shield-lock"
                            aria-hidden="true"
                        />

                        <span>
                            Als Redakteur kannst du Seiten wiederherstellen. Endgültiges Löschen ist ausschließlich Administratoren erlaubt.
                        </span>
                    </div>
                )
            }

            <section className="page-trash__statistics">
                <TrashStatistic
                    icon="bi-trash3"
                    value={
                        statistics.total
                    }
                    label="Im Papierkorb"
                    description="Gelöschte Builder-Seiten"
                />

                <TrashStatistic
                    icon="bi-globe2"
                    value={
                        statistics.published
                    }
                    label="Zuvor veröffentlicht"
                    description="Waren öffentlich erreichbar"
                />

                <TrashStatistic
                    icon="bi-file-earmark"
                    value={
                        statistics.drafts
                    }
                    label="Zuvor Entwurf"
                    description="Waren nicht veröffentlicht"
                />
            </section>

            <section className="page-trash__toolbar">
                <label className="page-trash__search">
                    <i
                        className="bi bi-search"
                        aria-hidden="true"
                    />

                    <input
                        type="search"
                        value={
                            searchTerm
                        }
                        onChange={
                            (event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                        }
                        placeholder="Titel, Slug oder Template suchen …"
                    />
                </label>

                <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={
                        loading ||
                        busy
                    }
                    onClick={
                        () =>
                            loadTrash()
                    }
                >
                    <i
                        className="bi bi-arrow-clockwise"
                        aria-hidden="true"
                    />

                    Aktualisieren
                </Button>
            </section>

            {
                loading ? (
                    <LoadingState />
                ) : pages.length ===
                    0 ? (
                    <section className="page-trash__empty">
                        <span className="page-trash__empty-icon">
                            <i
                                className="bi bi-trash3"
                                aria-hidden="true"
                            />
                        </span>

                        <h2>
                            Der Papierkorb ist leer
                        </h2>

                        <p>
                            Gelöschte Builder-Seiten erscheinen automatisch an dieser Stelle.
                        </p>

                        <Button
                            variant="secondary"
                            onClick={
                                openPageManagement
                            }
                        >
                            Zur Seitenverwaltung
                        </Button>
                    </section>
                ) : filteredPages.length ===
                    0 ? (
                    <section className="page-trash__empty">
                        <span className="page-trash__empty-icon">
                            <i
                                className="bi bi-search"
                                aria-hidden="true"
                            />
                        </span>

                        <h2>
                            Keine passenden Seiten gefunden
                        </h2>

                        <p>
                            Passe den Suchbegriff an oder leere das Suchfeld.
                        </p>
                    </section>
                ) : (
                    <div className="page-trash__table-wrapper">
                        <table className="page-trash__table">
                            <thead>
                                <tr>
                                    <th>
                                        Seite
                                    </th>

                                    <th>
                                        Alter Status
                                    </th>

                                    <th>
                                        Gelöscht am
                                    </th>

                                    <th>
                                        Template
                                    </th>

                                    <th>
                                        Aktionen
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    filteredPages.map(
                                        (page) => {
                                            const isProcessing =
                                                processing.pageId ===
                                                page.id;

                                            return (
                                                <tr
                                                    key={
                                                        page.id
                                                    }
                                                >
                                                    <td>
                                                        <div className="page-trash__page">
                                                            <span className="page-trash__page-icon">
                                                                <i
                                                                    className="bi bi-file-earmark-x"
                                                                    aria-hidden="true"
                                                                />
                                                            </span>

                                                            <div>
                                                                <strong>
                                                                    {
                                                                        page.title
                                                                    }
                                                                </strong>

                                                                <code>
                                                                    /{
                                                                        page.slug
                                                                    }
                                                                </code>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={
                                                                page.status ===
                                                                "published"
                                                                    ? "page-trash__status page-trash__status--published"
                                                                    : "page-trash__status page-trash__status--draft"
                                                            }
                                                        >
                                                            <i
                                                                className={
                                                                    page.status ===
                                                                    "published"
                                                                        ? "bi bi-globe2"
                                                                        : "bi bi-file-earmark"
                                                                }
                                                                aria-hidden="true"
                                                            />

                                                            {
                                                                getStatusLabel(
                                                                    page.status
                                                                )
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span className="page-trash__date">
                                                            {
                                                                formatDate(
                                                                    page.deletedAt
                                                                )
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <code className="page-trash__template">
                                                            {
                                                                page.template ??
                                                                "blank"
                                                            }
                                                        </code>
                                                    </td>

                                                    <td>
                                                        <div className="page-trash__actions">
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                disabled={
                                                                    busy
                                                                }
                                                                onClick={
                                                                    () =>
                                                                        handleRestore(
                                                                            page
                                                                        )
                                                                }
                                                            >
                                                                {
                                                                    isProcessing &&
                                                                    processing.action ===
                                                                        "restore" ? (
                                                                        <>
                                                                            <span
                                                                                className="spinner-border spinner-border-sm"
                                                                                aria-hidden="true"
                                                                            />

                                                                            Wird wiederhergestellt …
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <i
                                                                                className="bi bi-arrow-counterclockwise"
                                                                                aria-hidden="true"
                                                                            />

                                                                            Wiederherstellen
                                                                        </>
                                                                    )
                                                                }
                                                            </Button>

                                                            {
                                                                isAdministrator && (
                                                                    <button
                                                                        type="button"
                                                                        className="page-trash__delete-button"
                                                                        disabled={
                                                                            busy
                                                                        }
                                                                        onClick={
                                                                            () =>
                                                                                handlePermanentDelete(
                                                                                    page
                                                                                )
                                                                        }
                                                                    >
                                                                        {
                                                                            isProcessing &&
                                                                            processing.action ===
                                                                                "delete" ? (
                                                                                <>
                                                                                    <span
                                                                                        className="spinner-border spinner-border-sm"
                                                                                        aria-hidden="true"
                                                                                    />

                                                                                    Wird gelöscht …
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <i
                                                                                        className="bi bi-trash3-fill"
                                                                                        aria-hidden="true"
                                                                                    />

                                                                                    Endgültig löschen
                                                                                </>
                                                                            )
                                                                        }
                                                                    </button>
                                                                )
                                                            }
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )
                                }
                            </tbody>
                        </table>
                    </div>
                )
            }
        </AdminPage>
    );
}