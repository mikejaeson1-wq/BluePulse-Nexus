import "./AccessibilityDiagnostics.css";

import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import AdminPage from "../components/AdminPage";

import {
    ACCESSIBILITY_SEVERITY,
    auditAccessibilityDocument
} from "@shared/accessibility/accessibilityAudit";

const PRESET_PATHS = [
    {
        label:
            "Startseite",

        path:
            "/"
    },
    {
        label:
            "Kontakt",

        path:
            "/#kontakt"
    },
    {
        label:
            "Impressum",

        path:
            "/impressum"
    },
    {
        label:
            "Datenschutz",

        path:
            "/datenschutz"
    },
    {
        label:
            "404-Test",

        path:
            "/barrierefreiheits-testseite"
    }
];

const SEVERITY_LABELS = {
    [ACCESSIBILITY_SEVERITY.ERROR]:
        "Fehler",

    [ACCESSIBILITY_SEVERITY.WARNING]:
        "Warnung",

    [ACCESSIBILITY_SEVERITY.NOTICE]:
        "Hinweis"
};

function normalizePublicPath(
    value
) {
    const normalizedValue =
        String(
            value ??
            ""
        ).trim();

    if (!normalizedValue) {
        return "/";
    }

    let parsedUrl;

    try {
        parsedUrl =
            new URL(
                normalizedValue,
                globalThis.location
                    .origin
            );
    } catch {
        throw new Error(
            "Die eingegebene Adresse ist ungültig."
        );
    }

    if (
        parsedUrl.origin !==
        globalThis.location
            .origin
    ) {
        throw new Error(
            "Es können nur Seiten der aktuellen BluePulse-Website geprüft werden."
        );
    }

    if (
        parsedUrl.pathname ===
            "/admin" ||
        parsedUrl.pathname.startsWith(
            "/admin/"
        )
    ) {
        throw new Error(
            "Der Prüfer ist für öffentliche Website-Seiten vorgesehen. Adminseiten würden die Prüfung rekursiv laden."
        );
    }

    return [
        parsedUrl.pathname,
        parsedUrl.search,
        parsedUrl.hash
    ].join("");
}

function getResultClassName(
    severity
) {
    switch (
        severity
    ) {
        case ACCESSIBILITY_SEVERITY.ERROR:
            return "accessibility-diagnostics__issue accessibility-diagnostics__issue--error";

        case ACCESSIBILITY_SEVERITY.WARNING:
            return "accessibility-diagnostics__issue accessibility-diagnostics__issue--warning";

        default:
            return "accessibility-diagnostics__issue accessibility-diagnostics__issue--notice";
    }
}

function getSeverityIcon(
    severity
) {
    switch (
        severity
    ) {
        case ACCESSIBILITY_SEVERITY.ERROR:
            return "bi-x-octagon-fill";

        case ACCESSIBILITY_SEVERITY.WARNING:
            return "bi-exclamation-triangle-fill";

        default:
            return "bi-info-circle-fill";
    }
}

export default function AccessibilityDiagnostics() {
    const frameRef =
        useRef(
            null
        );

    const auditTimeoutRef =
        useRef(
            null
        );

    const [
        path,
        setPath
    ] =
        useState("/");

    const [
        targetPath,
        setTargetPath
    ] =
        useState("/");

    const [
        frameVersion,
        setFrameVersion
    ] =
        useState(1);

    const [
        loading,
        setLoading
    ] =
        useState(true);

    const [
        result,
        setResult
    ] =
        useState(null);

    const [
        error,
        setError
    ] =
        useState("");

    const sortedIssues =
        useMemo(
            () => {
                if (
                    !Array.isArray(
                        result?.issues
                    )
                ) {
                    return [];
                }

                const order = {
                    [ACCESSIBILITY_SEVERITY.ERROR]:
                        0,

                    [ACCESSIBILITY_SEVERITY.WARNING]:
                        1,

                    [ACCESSIBILITY_SEVERITY.NOTICE]:
                        2
                };

                return [
                    ...result.issues
                ].sort(
                    (
                        firstIssue,
                        secondIssue
                    ) =>
                        order[
                            firstIssue.severity
                        ] -
                        order[
                            secondIssue.severity
                        ]
                );
            },
            [
                result
            ]
        );

    function startAudit(
        requestedPath
    ) {
        try {
            const normalizedPath =
                normalizePublicPath(
                    requestedPath
                );

            setPath(
                normalizedPath
            );

            setTargetPath(
                normalizedPath
            );

            setFrameVersion(
                (
                    currentVersion
                ) =>
                    currentVersion +
                    1
            );

            setLoading(
                true
            );

            setResult(
                null
            );

            setError(
                ""
            );
        } catch (
            pathError
        ) {
            setError(
                pathError.message
            );
        }
    }

    function handleSubmit(
        event
    ) {
        event.preventDefault();

        startAudit(
            path
        );
    }

    useEffect(() => {
        return () => {
            if (
                auditTimeoutRef.current
            ) {
                globalThis.clearTimeout(
                    auditTimeoutRef.current
                );
            }
        };
    }, []);

    function handleFrameLoad() {
        if (
            auditTimeoutRef.current
        ) {
            globalThis.clearTimeout(
                auditTimeoutRef.current
            );
        }

        auditTimeoutRef.current =
            globalThis.setTimeout(
                () => {
                    try {
                        const frame =
                            frameRef.current;

                        const document =
                            frame
                                ?.contentDocument;

                        if (!document) {
                            throw new Error(
                                "Die eingebettete Seite konnte nicht gelesen werden."
                            );
                        }

                        const auditResult =
                            auditAccessibilityDocument(
                                document
                            );

                        setResult(
                            auditResult
                        );

                        setError(
                            ""
                        );
                    } catch (
                        auditError
                    ) {
                        setResult(
                            null
                        );

                        setError(
                            auditError?.message ??
                            "Die Barrierefreiheitsprüfung ist fehlgeschlagen."
                        );
                    } finally {
                        setLoading(
                            false
                        );
                    }
                },
                700
            );
    }

    return (
        <AdminPage
            title="Barrierefreiheitsprüfung"
            description="Öffentliche BluePulse-Seiten auf häufige semantische und tastaturbezogene Probleme prüfen."
            action={
                <a
                    className="accessibility-diagnostics__open"
                    href={
                        targetPath
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i
                        className="bi bi-box-arrow-up-right"
                        aria-hidden="true"
                    />

                    Seite öffnen
                </a>
            }
        >
            <div className="accessibility-diagnostics">
                <form
                    className="accessibility-diagnostics__toolbar"
                    onSubmit={
                        handleSubmit
                    }
                >
                    <label>
                        <span>
                            Öffentliche Route
                        </span>

                        <input
                            value={
                                path
                            }
                            placeholder="/ oder /datenschutz"
                            onChange={
                                (
                                    event
                                ) =>
                                    setPath(
                                        event.target.value
                                    )
                            }
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={
                            loading
                        }
                    >
                        <i
                            className={
                                loading
                                    ? "bi bi-arrow-repeat"
                                    : "bi bi-universal-access-circle"
                            }
                            aria-hidden="true"
                        />

                        {
                            loading
                                ? "Prüfung läuft …"
                                : "Seite prüfen"
                        }
                    </button>
                </form>

                <div className="accessibility-diagnostics__presets">
                    {
                        PRESET_PATHS.map(
                            (
                                preset
                            ) => (
                                <button
                                    key={
                                        preset.path
                                    }
                                    type="button"
                                    onClick={
                                        () =>
                                            startAudit(
                                                preset.path
                                            )
                                    }
                                >
                                    {
                                        preset.label
                                    }
                                </button>
                            )
                        )
                    }
                </div>

                {
                    error && (
                        <div
                            className="accessibility-diagnostics__alert"
                            role="alert"
                        >
                            <i
                                className="bi bi-exclamation-circle-fill"
                                aria-hidden="true"
                            />

                            {
                                error
                            }
                        </div>
                    )
                }

                {
                    result && (
                        <section className="accessibility-diagnostics__summary">
                            <article>
                                <span className="accessibility-diagnostics__summaryIcon accessibility-diagnostics__summaryIcon--status">
                                    <i
                                        className={
                                            result.summary.passed
                                                ? "bi bi-check-circle-fill"
                                                : "bi bi-exclamation-octagon-fill"
                                        }
                                        aria-hidden="true"
                                    />
                                </span>

                                <div>
                                    <strong>
                                        {
                                            result.summary.passed
                                                ? "Grundprüfung bestanden"
                                                : "Fehler gefunden"
                                        }
                                    </strong>

                                    <small>
                                        {
                                            result.title ||
                                            targetPath
                                        }
                                    </small>
                                </div>
                            </article>

                            <article>
                                <span className="accessibility-diagnostics__summaryIcon accessibility-diagnostics__summaryIcon--error">
                                    <i
                                        className="bi bi-x-octagon"
                                        aria-hidden="true"
                                    />
                                </span>

                                <div>
                                    <strong>
                                        {
                                            result.summary.errors
                                        }
                                    </strong>

                                    <small>
                                        Fehler
                                    </small>
                                </div>
                            </article>

                            <article>
                                <span className="accessibility-diagnostics__summaryIcon accessibility-diagnostics__summaryIcon--warning">
                                    <i
                                        className="bi bi-exclamation-triangle"
                                        aria-hidden="true"
                                    />
                                </span>

                                <div>
                                    <strong>
                                        {
                                            result.summary.warnings
                                        }
                                    </strong>

                                    <small>
                                        Warnungen
                                    </small>
                                </div>
                            </article>

                            <article>
                                <span className="accessibility-diagnostics__summaryIcon accessibility-diagnostics__summaryIcon--notice">
                                    <i
                                        className="bi bi-info-circle"
                                        aria-hidden="true"
                                    />
                                </span>

                                <div>
                                    <strong>
                                        {
                                            result.summary.notices
                                        }
                                    </strong>

                                    <small>
                                        Hinweise
                                    </small>
                                </div>
                            </article>
                        </section>
                    )
                }

                <section className="accessibility-diagnostics__layout">
                    <article className="accessibility-diagnostics__panel">
                        <header>
                            <div>
                                <span>
                                    Prüfergebnis
                                </span>

                                <h2>
                                    Fundstellen
                                </h2>
                            </div>

                            <i
                                className="bi bi-clipboard2-pulse"
                                aria-hidden="true"
                            />
                        </header>

                        {
                            loading ? (
                                <div className="accessibility-diagnostics__empty">
                                    <span className="spinner-border text-info" />

                                    Seite wird geladen und geprüft …
                                </div>
                            ) : sortedIssues.length ===
                                0 ? (
                                <div className="accessibility-diagnostics__empty accessibility-diagnostics__empty--success">
                                    <i
                                        className="bi bi-check-circle-fill"
                                        aria-hidden="true"
                                    />

                                    <strong>
                                        Keine Probleme in der Grundprüfung gefunden.
                                    </strong>

                                    <span>
                                        Zusätzlich weiterhin Tastatur, Screenreader, Zoom und Farbkontraste manuell prüfen.
                                    </span>
                                </div>
                            ) : (
                                <div className="accessibility-diagnostics__issues">
                                    {
                                        sortedIssues.map(
                                            (
                                                issue
                                            ) => (
                                                <article
                                                    key={
                                                        issue.id
                                                    }
                                                    className={
                                                        getResultClassName(
                                                            issue.severity
                                                        )
                                                    }
                                                >
                                                    <span className="accessibility-diagnostics__issueIcon">
                                                        <i
                                                            className={
                                                                `bi ${getSeverityIcon(
                                                                    issue.severity
                                                                )}`
                                                            }
                                                            aria-hidden="true"
                                                        />
                                                    </span>

                                                    <div>
                                                        <header>
                                                            <strong>
                                                                {
                                                                    issue.title
                                                                }
                                                            </strong>

                                                            <small>
                                                                {
                                                                    SEVERITY_LABELS[
                                                                        issue.severity
                                                                    ]
                                                                } · {
                                                                    issue.rule
                                                                }
                                                            </small>
                                                        </header>

                                                        <p>
                                                            {
                                                                issue.message
                                                            }
                                                        </p>

                                                        {
                                                            issue.selector && (
                                                                <code>
                                                                    {
                                                                        issue.selector
                                                                    }
                                                                </code>
                                                            )
                                                        }

                                                        <span>
                                                            {
                                                                issue.recommendation
                                                            }
                                                        </span>
                                                    </div>
                                                </article>
                                            )
                                        )
                                    }
                                </div>
                            )
                        }
                    </article>

                    <article className="accessibility-diagnostics__panel">
                        <header>
                            <div>
                                <span>
                                    Seitenansicht
                                </span>

                                <h2>
                                    Prüf-Vorschau
                                </h2>
                            </div>

                            <i
                                className="bi bi-window"
                                aria-hidden="true"
                            />
                        </header>

                        <iframe
                            key={
                                frameVersion
                            }
                            ref={
                                frameRef
                            }
                            className="accessibility-diagnostics__frame"
                            src={
                                targetPath
                            }
                            title={
                                `Barrierefreiheitsprüfung für ${targetPath}`
                            }
                            onLoad={
                                handleFrameLoad
                            }
                        />
                    </article>
                </section>

                <aside className="accessibility-diagnostics__information">
                    <i
                        className="bi bi-info-circle-fill"
                        aria-hidden="true"
                    />

                    <p>
                        Diese Grundprüfung erkennt häufige technische Probleme wie fehlende Beschriftungen, doppelte IDs, falsche Überschriftenhierarchien und fehlende Landmarken. Sie ersetzt keine vollständige manuelle Prüfung mit Tastatur, Screenreader und verschiedenen Zoomstufen.
                    </p>
                </aside>
            </div>
        </AdminPage>
    );
}
