import "./SettingsNavigationLayout.css";

import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Link,
    Outlet,
    useLocation
} from "react-router-dom";

import {
    refreshPages
} from "@cms/modules/pages/services/pageService";

import {
    loadPageNavigationSyncReport
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
        0,

    excludedPages:
        0,

    staleItems:
        0
};

function StatusMetric({
    icon,
    label,
    value,
    tone = "neutral"
}) {
    return (
        <div
            className={
                `settings-navigation-status__metric settings-navigation-status__metric--${tone}`
            }
        >
            <span className="settings-navigation-status__metric-icon">
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
        </div>
    );
}

function StatusLoading() {
    return (
        <div
            className="settings-navigation-status__loading"
            role="status"
            aria-live="polite"
        >
            <span
                className="spinner-border spinner-border-sm text-info"
                aria-hidden="true"
            />

            <span>
                Navigationsstatus wird geprüft …
            </span>
        </div>
    );
}

export default function SettingsNavigationLayout() {
    const location =
        useLocation();

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
        error,
        setError
    ] =
        useState("");

    const isNavigationSyncPage =
        location.pathname.endsWith(
            "/navigation-sync"
        );

    const loadStatus =
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

                    setReport(
                        null
                    );

                    setError(
                        loadError.message ??
                        "Der Navigationsstatus konnte nicht geprüft werden."
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
        if (
            isNavigationSyncPage
        ) {
            return undefined;
        }

        const controller =
            new AbortController();

        loadStatus({
            signal:
                controller.signal
        });

        return () => {
            controller.abort();
        };
    }, [
        isNavigationSyncPage,
        loadStatus
    ]);

    useEffect(() => {
        if (
            isNavigationSyncPage
        ) {
            return undefined;
        }

        function handleNavigationChange() {
            loadStatus();
        }

        function handleWindowFocus() {
            loadStatus();
        }

        globalThis.window
            ?.addEventListener(
                "bluepulse:site-navigation-change",
                handleNavigationChange
            );

        globalThis.window
            ?.addEventListener(
                "focus",
                handleWindowFocus
            );

        return () => {
            globalThis.window
                ?.removeEventListener(
                    "bluepulse:site-navigation-change",
                    handleNavigationChange
                );

            globalThis.window
                ?.removeEventListener(
                    "focus",
                    handleWindowFocus
                );
        };
    }, [
        isNavigationSyncPage,
        loadStatus
    ]);

    const summary =
        report?.summary ??
        EMPTY_SUMMARY;

    const hasProblems =
        summary.totalProblems >
        0;

    const statusContent =
        useMemo(
            () => {
                if (
                    !report
                ) {
                    return {
                        tone:
                            "neutral",

                        icon:
                            "bi-question-circle",

                        title:
                            "Status noch nicht verfügbar",

                        text:
                            "Die zentrale Navigation wurde noch nicht vollständig geprüft."
                    };
                }

                if (hasProblems) {
                    return {
                        tone:
                            "warning",

                        icon:
                            "bi-exclamation-triangle-fill",

                        title:
                            "Die Navigation benötigt Aufmerksamkeit",

                        text:
                            "Mindestens eine Builder-Seite oder ein automatischer Menüpunkt weicht von den aktuellen Seiteneinstellungen ab."
                    };
                }

                return {
                    tone:
                        "success",

                    icon:
                        "bi-check-circle-fill",

                    title:
                        "Navigation vollständig synchronisiert",

                    text:
                        "Alle automatischen Menüpunkte entsprechen den aktuellen Builder-Seiten und Seiteneinstellungen."
                };
            },
            [
                hasProblems,
                report
            ]
        );

    if (
        isNavigationSyncPage
    ) {
        return (
            <Outlet />
        );
    }

    return (
        <div className="settings-navigation-layout">
            <section
                className={
                    `settings-navigation-status settings-navigation-status--${statusContent.tone}`
                }
            >
                <header className="settings-navigation-status__header">
                    <div className="settings-navigation-status__title">
                        <span className="settings-navigation-status__title-icon">
                            <i
                                className="bi bi-diagram-3"
                                aria-hidden="true"
                            />
                        </span>

                        <div>
                            <span className="settings-navigation-status__eyebrow">
                                Builder 2.0
                            </span>

                            <h2>
                                Navigationsstatus
                            </h2>

                            <p>
                                Automatische Builder-Seiten und zentrale Website-Navigation im direkten Vergleich.
                            </p>
                        </div>
                    </div>

                    <div className="settings-navigation-status__actions">
                        {
                            report && (
                                <span className="badge text-bg-info">
                                    {
                                        report.mode ===
                                        "api"
                                            ? "PostgreSQL"
                                            : "Browser"
                                    }
                                </span>
                            )
                        }

                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            disabled={
                                loading
                            }
                            onClick={
                                () =>
                                    loadStatus()
                            }
                        >
                            <i
                                className={
                                    loading
                                        ? "bi bi-arrow-clockwise settings-navigation-status__rotating"
                                        : "bi bi-arrow-clockwise"
                                }
                                aria-hidden="true"
                            />

                            Neu prüfen
                        </button>

                        <Link
                            className={
                                hasProblems
                                    ? "btn btn-warning btn-sm"
                                    : "btn btn-outline-info btn-sm"
                            }
                            to="/admin/settings/navigation-sync"
                        >
                            <i
                                className="bi bi-arrow-repeat"
                                aria-hidden="true"
                            />

                            {
                                hasProblems
                                    ? "Jetzt synchronisieren"
                                    : "Prüfung öffnen"
                            }
                        </Link>
                    </div>
                </header>

                {
                    loading ? (
                        <StatusLoading />
                    ) : error ? (
                        <div
                            className="alert alert-danger mb-0"
                            role="alert"
                        >
                            <div>
                                <strong>
                                    Statusprüfung fehlgeschlagen
                                </strong>

                                <p className="mb-0 mt-1">
                                    {
                                        error
                                    }
                                </p>
                            </div>

                            <button
                                type="button"
                                className="btn btn-outline-light btn-sm"
                                onClick={
                                    () =>
                                        loadStatus()
                                }
                            >
                                Erneut versuchen
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="settings-navigation-status__metrics">
                                <StatusMetric
                                    icon="bi-files"
                                    label="Builder-Seiten"
                                    value={
                                        summary.totalPages
                                    }
                                />

                                <StatusMetric
                                    icon="bi-list-check"
                                    label="Für Navigation"
                                    value={
                                        summary.includedPages
                                    }
                                    tone="info"
                                />

                                <StatusMetric
                                    icon="bi-check-circle"
                                    label="Bereits aktuell"
                                    value={
                                        summary.currentPages
                                    }
                                    tone="success"
                                />

                                <StatusMetric
                                    icon="bi-exclamation-triangle"
                                    label="Korrekturen"
                                    value={
                                        summary.pendingPages
                                    }
                                    tone={
                                        summary.pendingPages >
                                        0
                                            ? "warning"
                                            : "neutral"
                                    }
                                />

                                <StatusMetric
                                    icon="bi-copy"
                                    label="Duplikate"
                                    value={
                                        summary.duplicateItems
                                    }
                                    tone={
                                        summary.duplicateItems >
                                        0
                                            ? "danger"
                                            : "neutral"
                                    }
                                />

                                <StatusMetric
                                    icon="bi-link-45deg"
                                    label="Verwaiste Einträge"
                                    value={
                                        summary.orphanItems
                                    }
                                    tone={
                                        summary.orphanItems >
                                        0
                                            ? "danger"
                                            : "neutral"
                                    }
                                />
                            </div>

                            <div
                                className={
                                    `settings-navigation-status__message settings-navigation-status__message--${statusContent.tone}`
                                }
                            >
                                <span className="settings-navigation-status__message-icon">
                                    <i
                                        className={
                                            `bi ${statusContent.icon}`
                                        }
                                        aria-hidden="true"
                                    />
                                </span>

                                <div>
                                    <strong>
                                        {
                                            statusContent.title
                                        }
                                    </strong>

                                    <span>
                                        {
                                            statusContent.text
                                        }
                                    </span>
                                </div>
                            </div>

                            {
                                summary.excludedPages >
                                0 && (
                                    <div className="settings-navigation-status__note">
                                        <i
                                            className="bi bi-info-circle"
                                            aria-hidden="true"
                                        />

                                        {
                                            summary.excludedPages
                                        } Builder-Seite{
                                            summary.excludedPages ===
                                            1
                                                ? ""
                                                : "n"
                                        } {
                                            summary.excludedPages ===
                                            1
                                                ? "ist"
                                                : "sind"
                                        } bewusst nicht für die Website-Navigation vorgesehen.
                                    </div>
                                )
                            }
                        </>
                    )
                }
            </section>

            <Outlet />
        </div>
    );
}