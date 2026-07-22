import "./NavigationSync.css";

import {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import AdminPage from "../components/AdminPage";

import Button from "@shared/ui/Button";

import {
    refreshPages
} from "@cms/modules/pages/services/pageService";

import {
    loadPageNavigationSyncReport,
    synchronizeAllPageNavigation
} from "@shared/navigation/pageNavigationBulkSync";

const EMPTY_SUMMARY = {
    totalPages:
        0,

    includedPages:
        0,

    currentPages:
        0,

    pendingPages:
        0,

    excludedPages:
        0,

    staleItems:
        0,

    duplicateItems:
        0,

    orphanItems:
        0,

    totalProblems:
        0
};

const ACTION_DETAILS = {
    current: {
        label:
            "Aktuell",

        className:
            "text-bg-success",

        icon:
            "bi-check-circle"
    },

    create: {
        label:
            "Anlegen",

        className:
            "text-bg-warning",

        icon:
            "bi-plus-circle"
    },

    update: {
        label:
            "Aktualisieren",

        className:
            "text-bg-warning",

        icon:
            "bi-arrow-repeat"
    },

    deduplicate: {
        label:
            "Duplikate bereinigen",

        className:
            "text-bg-danger",

        icon:
            "bi-copy"
    },

    remove: {
        label:
            "Entfernen",

        className:
            "text-bg-danger",

        icon:
            "bi-trash3"
    },

    excluded: {
        label:
            "Nicht vorgesehen",

        className:
            "text-bg-secondary",

        icon:
            "bi-eye-slash"
    }
};

function getActionDetails(
    action
) {
    return ACTION_DETAILS[
        action
    ] ??
        ACTION_DETAILS
            .excluded;
}

function SummaryCard({
    icon,
    label,
    value,
    tone = "default"
}) {
    return (
        <article
            className={
                `navigation-sync__summary-card navigation-sync__summary-card--${tone}`
            }
        >
            <span className="navigation-sync__summary-icon">
                <i
                    className={
                        `bi ${icon}`
                    }
                    aria-hidden="true"
                />
            </span>

            <div>
                <strong>
                    {
                        value
                    }
                </strong>

                <span>
                    {
                        label
                    }
                </span>
            </div>
        </article>
    );
}

function LoadingState() {
    return (
        <div
            className="navigation-sync__loading"
            role="status"
            aria-live="polite"
        >
            <span
                className="spinner-border text-info"
                aria-hidden="true"
            />

            <span>
                Builder-Seiten und Navigation werden geprüft …
            </span>
        </div>
    );
}

export default function NavigationSync() {
    const [
        pages,
        setPages
    ] =
        useState([]);

    const [
        report,
        setReport
    ] =
        useState(null);

    const [
        loading,
        setLoading
    ] =
        useState(true);

    const [
        synchronizing,
        setSynchronizing
    ] =
        useState(false);

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

    const loadReport =
        useCallback(
            async ({
                signal
            } = {}) => {
                setLoading(
                    true
                );

                setError("");

                try {
                    const loadedPages =
                        await refreshPages({
                            signal
                        });

                    if (
                        signal?.aborted
                    ) {
                        return;
                    }

                    const normalizedPages =
                        Array.isArray(
                            loadedPages
                        )
                            ? loadedPages
                            : [];

                    const loadedReport =
                        await loadPageNavigationSyncReport(
                            normalizedPages,
                            {
                                signal
                            }
                        );

                    if (
                        signal?.aborted
                    ) {
                        return;
                    }

                    setPages(
                        normalizedPages
                    );

                    setReport(
                        loadedReport
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

                    setPages([]);
                    setReport(null);

                    setError(
                        loadError.message ??
                        "Die Navigationsprüfung konnte nicht geladen werden."
                    );
                } finally {
                    if (
                        !signal?.aborted
                    ) {
                        setLoading(
                            false
                        );
                    }
                }
            },
            []
        );

    useEffect(() => {
        const controller =
            new AbortController();

        loadReport({
            signal:
                controller.signal
        });

        return () => {
            controller.abort();
        };
    }, [
        loadReport
    ]);

    async function handleSynchronize() {
        if (
            synchronizing ||
            loading
        ) {
            return;
        }

        setSynchronizing(
            true
        );

        setError("");
        setMessage("");

        try {
            const result =
                await synchronizeAllPageNavigation(
                    pages
                );

            setReport(
                result.report
            );

            if (!result.changed) {
                setMessage(
                    "Die Navigation war bereits vollständig synchronisiert."
                );

                return;
            }

            const performed =
                result.performed ??
                EMPTY_SUMMARY;

            setMessage(
                `Synchronisierung abgeschlossen: ${performed.pendingPages} Seiten korrigiert, ${performed.duplicateItems} Duplikate und ${performed.orphanItems} verwaiste Menüpunkte bereinigt.`
            );
        } catch (
            synchronizationError
        ) {
            setError(
                synchronizationError.message ??
                "Die Builder-Seiten konnten nicht synchronisiert werden."
            );
        } finally {
            setSynchronizing(
                false
            );
        }
    }

    const summary =
        report?.summary ??
        EMPTY_SUMMARY;

    const pageReports =
        report?.pageReports ??
        [];

    const orphanReports =
        report?.orphanReports ??
        [];

    const hasProblems =
        summary.totalProblems >
        0;

    return (
        <AdminPage
            title="Navigationsprüfung"
            description="Alle Builder-Seiten mit der zentralen Website-Navigation vergleichen und synchronisieren."
            action={
                <div className="d-flex flex-wrap align-items-center gap-2">
                    <span className="badge text-bg-info">
                        {
                            report?.mode ===
                            "api"
                                ? "PostgreSQL"
                                : "Browser"
                        }
                    </span>

                    <Link
                        className="btn btn-outline-secondary"
                        to="/admin/settings"
                    >
                        <i
                            className="bi bi-arrow-left me-2"
                            aria-hidden="true"
                        />

                        Navigation verwalten
                    </Link>

                    <Button
                        disabled={
                            loading ||
                            synchronizing ||
                            !report
                        }
                        onClick={
                            handleSynchronize
                        }
                    >
                        {
                            synchronizing ? (
                                <>
                                    <span
                                        className="spinner-border spinner-border-sm"
                                        aria-hidden="true"
                                    />

                                    Synchronisiert …
                                </>
                            ) : (
                                <>
                                    <i
                                        className="bi bi-arrow-repeat"
                                        aria-hidden="true"
                                    />

                                    Builder-Seiten synchronisieren
                                </>
                            )
                        }
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
                        {
                            error
                        }
                    </div>
                )
            }

            {
                message && (
                    <div
                        className="alert alert-success"
                        role="status"
                    >
                        {
                            message
                        }
                    </div>
                )
            }

            {
                loading ? (
                    <LoadingState />
                ) : (
                    <>
                        <section className="navigation-sync__overview">
                            <div className="navigation-sync__overview-heading">
                                <div>
                                    <h2>
                                        Gesamtstatus
                                    </h2>

                                    <p>
                                        Manuell angelegte Links bleiben bei der Synchronisierung unverändert.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    disabled={
                                        synchronizing
                                    }
                                    onClick={
                                        () =>
                                            loadReport()
                                    }
                                >
                                    <i
                                        className="bi bi-arrow-clockwise me-2"
                                        aria-hidden="true"
                                    />

                                    Neu prüfen
                                </button>
                            </div>

                            <div className="navigation-sync__summary-grid">
                                <SummaryCard
                                    icon="bi-files"
                                    label="Builder-Seiten"
                                    value={
                                        summary.totalPages
                                    }
                                />

                                <SummaryCard
                                    icon="bi-list-check"
                                    label="Für Navigation"
                                    value={
                                        summary.includedPages
                                    }
                                    tone="info"
                                />

                                <SummaryCard
                                    icon="bi-check-circle"
                                    label="Bereits aktuell"
                                    value={
                                        summary.currentPages
                                    }
                                    tone="success"
                                />

                                <SummaryCard
                                    icon="bi-exclamation-triangle"
                                    label="Korrekturen nötig"
                                    value={
                                        summary.totalProblems
                                    }
                                    tone={
                                        hasProblems
                                            ? "warning"
                                            : "success"
                                    }
                                />

                                <SummaryCard
                                    icon="bi-copy"
                                    label="Duplikate"
                                    value={
                                        summary.duplicateItems
                                    }
                                    tone={
                                        summary.duplicateItems >
                                        0
                                            ? "danger"
                                            : "default"
                                    }
                                />

                                <SummaryCard
                                    icon="bi-link-45deg"
                                    label="Verwaiste Einträge"
                                    value={
                                        summary.orphanItems
                                    }
                                    tone={
                                        summary.orphanItems >
                                        0
                                            ? "danger"
                                            : "default"
                                    }
                                />
                            </div>

                            <div
                                className={
                                    hasProblems
                                        ? "navigation-sync__status navigation-sync__status--warning"
                                        : "navigation-sync__status navigation-sync__status--success"
                                }
                            >
                                <i
                                    className={
                                        hasProblems
                                            ? "bi bi-exclamation-circle"
                                            : "bi bi-check-circle-fill"
                                    }
                                    aria-hidden="true"
                                />

                                <div>
                                    <strong>
                                        {
                                            hasProblems
                                                ? "Die Navigation benötigt eine Synchronisierung."
                                                : "Alle Builder-Seiten sind synchronisiert."
                                        }
                                    </strong>

                                    <span>
                                        {
                                            hasProblems
                                                ? "Der Abgleich korrigiert Titel, Slugs, Status, Hierarchie und doppelte automatische Einträge."
                                                : "Titel, Links, Status und Hierarchie entsprechen den aktuellen Seiteneinstellungen."
                                        }
                                    </span>
                                </div>
                            </div>
                        </section>

                        <section className="navigation-sync__section">
                            <div className="navigation-sync__section-heading">
                                <div>
                                    <h2>
                                        Builder-Seiten
                                    </h2>

                                    <p>
                                        Prüfstatus aller aktiven Seiten einschließlich Entwürfen.
                                    </p>
                                </div>

                                <span className="badge text-bg-secondary">
                                    {
                                        pageReports.length
                                    } Seiten
                                </span>
                            </div>

                            {
                                pageReports.length ===
                                0 ? (
                                    <div className="alert alert-secondary">
                                        Noch keine Builder-Seiten vorhanden.
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-dark table-hover align-middle navigation-sync__table">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        Seite
                                                    </th>

                                                    <th>
                                                        Seitenstatus
                                                    </th>

                                                    <th>
                                                        Navigation
                                                    </th>

                                                    <th>
                                                        Ziel
                                                    </th>

                                                    <th>
                                                        Prüfstatus
                                                    </th>

                                                    <th>
                                                        Aktion
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {
                                                    pageReports.map(
                                                        (pageReport) => {
                                                            const action =
                                                                getActionDetails(
                                                                    pageReport.action
                                                                );

                                                            return (
                                                                <tr
                                                                    key={
                                                                        pageReport.pageId
                                                                    }
                                                                >
                                                                    <td>
                                                                        <strong>
                                                                            {
                                                                                pageReport.title
                                                                            }
                                                                        </strong>

                                                                        <small className="navigation-sync__table-secondary">
                                                                            ID: {
                                                                                pageReport.pageId
                                                                            }
                                                                        </small>
                                                                    </td>

                                                                    <td>
                                                                        <span
                                                                            className={
                                                                                pageReport.pageStatus ===
                                                                                "published"
                                                                                    ? "badge text-bg-success"
                                                                                    : "badge text-bg-secondary"
                                                                            }
                                                                        >
                                                                            {
                                                                                pageReport.pageStatus ===
                                                                                "published"
                                                                                    ? "Veröffentlicht"
                                                                                    : "Entwurf"
                                                                            }
                                                                        </span>
                                                                    </td>

                                                                    <td>
                                                                        {
                                                                            pageReport.includeInNavigation ? (
                                                                                <div className="navigation-sync__navigation-state">
                                                                                    <span>
                                                                                        <i
                                                                                            className="bi bi-check-circle text-success"
                                                                                            aria-hidden="true"
                                                                                        />

                                                                                        Vorgesehen
                                                                                    </span>

                                                                                    {
                                                                                        pageReport.highlighted && (
                                                                                            <small>
                                                                                                <i
                                                                                                    className="bi bi-stars"
                                                                                                    aria-hidden="true"
                                                                                                />

                                                                                                Hervorgehoben
                                                                                            </small>
                                                                                        )
                                                                                    }
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-secondary">
                                                                                    Nicht vorgesehen
                                                                                </span>
                                                                            )
                                                                        }
                                                                    </td>

                                                                    <td>
                                                                        <code>
                                                                            {
                                                                                pageReport.href
                                                                            }
                                                                        </code>

                                                                        <small className="navigation-sync__table-secondary">
                                                                            {
                                                                                pageReport.label
                                                                            }
                                                                        </small>
                                                                    </td>

                                                                    <td>
                                                                        <span
                                                                            className={
                                                                                `badge ${action.className}`
                                                                            }
                                                                        >
                                                                            <i
                                                                                className={
                                                                                    `bi ${action.icon} me-1`
                                                                                }
                                                                                aria-hidden="true"
                                                                            />

                                                                            {
                                                                                action.label
                                                                            }
                                                                        </span>

                                                                        {
                                                                            pageReport.duplicateCount >
                                                                            0 && (
                                                                                <small className="navigation-sync__problem-note">
                                                                                    {
                                                                                        pageReport.duplicateCount
                                                                                    } zusätzliche Einträge
                                                                                </small>
                                                                            )
                                                                        }
                                                                    </td>

                                                                    <td>
                                                                        <Link
                                                                            className="btn btn-outline-info btn-sm"
                                                                            to={
                                                                                `/admin/pages/${pageReport.pageId}`
                                                                            }
                                                                        >
                                                                            Bearbeiten
                                                                        </Link>
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
                        </section>

                        {
                            orphanReports.length >
                            0 && (
                                <section className="navigation-sync__section">
                                    <div className="navigation-sync__section-heading">
                                        <div>
                                            <h2>
                                                Verwaiste Menüpunkte
                                            </h2>

                                            <p>
                                                Diese automatischen Einträge verweisen auf keine vorhandene Builder-Seite mehr.
                                            </p>
                                        </div>

                                        <span className="badge text-bg-danger">
                                            {
                                                summary.orphanItems
                                            } Einträge
                                        </span>
                                    </div>

                                    <div className="navigation-sync__orphan-list">
                                        {
                                            orphanReports.map(
                                                (
                                                    orphan,
                                                    index
                                                ) => (
                                                    <article
                                                        key={
                                                            `${orphan.pageId}-${index}`
                                                        }
                                                        className="navigation-sync__orphan"
                                                    >
                                                        <span>
                                                            <i
                                                                className="bi bi-link-45deg"
                                                                aria-hidden="true"
                                                            />
                                                        </span>

                                                        <div>
                                                            <strong>
                                                                {
                                                                    orphan.label
                                                                }
                                                            </strong>

                                                            <small>
                                                                {
                                                                    orphan.href ||
                                                                    "Kein Linkziel"
                                                                }
                                                            </small>

                                                            <code>
                                                                Seiten-ID: {
                                                                    orphan.pageId
                                                                }
                                                            </code>
                                                        </div>

                                                        <span className="badge text-bg-danger">
                                                            {
                                                                orphan.itemCount
                                                            } Einträge
                                                        </span>
                                                    </article>
                                                )
                                            )
                                        }
                                    </div>
                                </section>
                            )
                        }
                    </>
                )
            }
        </AdminPage>
    );
}