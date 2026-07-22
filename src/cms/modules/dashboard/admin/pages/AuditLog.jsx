import "./AuditLog.css";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import AdminPage from "../components/AdminPage";

import Button from "@shared/ui/Button";
import Modal from "@shared/ui/Modal";

import {
    AUDIT_PAGE_SIZE,
    listAuditEntries
} from "@cms/modules/audit/services/auditService";

const ACTION_OPTIONS = [
    {
        value: "",
        label:
            "Alle Aktionen"
    },

    {
        value:
            "page.create",
        label:
            "Seite erstellt"
    },

    {
        value:
            "page.update",
        label:
            "Seite bearbeitet"
    },

    {
        value:
            "page.publish",
        label:
            "Seite veröffentlicht"
    },

    {
        value:
            "page.unpublish",
        label:
            "Veröffentlichung aufgehoben"
    },

    {
        value:
            "page.duplicate",
        label:
            "Seite dupliziert"
    },

    {
        value:
            "page.move_to_trash",
        label:
            "Seite in Papierkorb"
    },

    {
        value:
            "page.restore_from_trash",
        label:
            "Seite wiederhergestellt"
    },

    {
        value:
            "page.permanent_delete",
        label:
            "Seite endgültig gelöscht"
    },

    {
        value:
            "page.restore_version",
        label:
            "Seitenversion wiederhergestellt"
    },

    {
        value:
            "website_content.update",
        label:
            "Website-Inhalt gespeichert"
    },

    {
        value:
            "website_content.reset",
        label:
            "Website-Inhalt zurückgesetzt"
    },

    {
        value:
            "navigation.update",
        label:
            "Navigation gespeichert"
    },

    {
        value:
            "navigation.reset",
        label:
            "Navigation zurückgesetzt"
    },

    {
        value:
            "home_layout.update",
        label:
            "Startseiten-Layout gespeichert"
    },

    {
        value:
            "home_layout.reset",
        label:
            "Startseiten-Layout zurückgesetzt"
    },

    {
        value:
            "footer.update",
        label:
            "Footer gespeichert"
    },

    {
        value:
            "footer.reset",
        label:
            "Footer zurückgesetzt"
    },

    {
        value:
            "user.create",
        label:
            "Benutzer erstellt"
    },

    {
        value:
            "user.update",
        label:
            "Benutzer bearbeitet"
    },

    {
        value:
            "user.password_reset",
        label:
            "Passwort zurückgesetzt"
    },

    {
        value:
            "user.sessions_revoke",
        label:
            "Sitzungen beendet"
    },

    {
        value:
            "media.upload",
        label:
            "Medium hochgeladen"
    },

    {
        value:
            "media.update",
        label:
            "Medium bearbeitet"
    },

    {
        value:
            "media.delete",
        label:
            "Medium gelöscht"
    },

    {
        value:
            "media.import",
        label:
            "Medienmigration"
    },

    {
        value:
            "admin.mutation",
        label:
            "Sonstige Änderung"
    }
];

const ENTITY_OPTIONS = [
    {
        value: "",
        label:
            "Alle Bereiche"
    },

    {
        value:
            "page",
        label:
            "Builder-Seiten"
    },

    {
        value:
            "website_content",
        label:
            "Website-Inhalte"
    },

    {
        value:
            "navigation",
        label:
            "Navigation"
    },

    {
        value:
            "home_layout",
        label:
            "Startseiten-Layout"
    },

    {
        value:
            "footer",
        label:
            "Footer"
    },

    {
        value:
            "user",
        label:
            "Benutzer"
    },

    {
        value:
            "media",
        label:
            "Medien"
    }
];

const ACTION_DEFINITIONS = {
    "page.create": {
        label:
            "Seite erstellt",

        icon:
            "bi-file-earmark-plus",

        tone:
            "success"
    },

    "page.update": {
        label:
            "Seite bearbeitet",

        icon:
            "bi-pencil-square",

        tone:
            "info"
    },

    "page.publish": {
        label:
            "Seite veröffentlicht",

        icon:
            "bi-globe2",

        tone:
            "success"
    },

    "page.unpublish": {
        label:
            "Veröffentlichung aufgehoben",

        icon:
            "bi-eye-slash",

        tone:
            "warning"
    },

    "page.duplicate": {
        label:
            "Seite dupliziert",

        icon:
            "bi-copy",

        tone:
            "info"
    },

    "page.move_to_trash": {
        label:
            "In Papierkorb verschoben",

        icon:
            "bi-trash3",

        tone:
            "danger"
    },

    "page.restore_from_trash": {
        label:
            "Seite wiederhergestellt",

        icon:
            "bi-arrow-counterclockwise",

        tone:
            "success"
    },

    "page.permanent_delete": {
        label:
            "Endgültig gelöscht",

        icon:
            "bi-trash3-fill",

        tone:
            "danger"
    },

    "page.restore_version": {
        label:
            "Version wiederhergestellt",

        icon:
            "bi-clock-history",

        tone:
            "success"
    },

    "website_content.update": {
        label:
            "Inhalt gespeichert",

        icon:
            "bi-window",

        tone:
            "info"
    },

    "website_content.reset": {
        label:
            "Inhalt zurückgesetzt",

        icon:
            "bi-arrow-repeat",

        tone:
            "warning"
    },

    "website_content.delete": {
        label:
            "Inhalt gelöscht",

        icon:
            "bi-trash3",

        tone:
            "danger"
    },

    "navigation.update": {
        label:
            "Navigation gespeichert",

        icon:
            "bi-list-nested",

        tone:
            "info"
    },

    "navigation.reset": {
        label:
            "Navigation zurückgesetzt",

        icon:
            "bi-arrow-repeat",

        tone:
            "warning"
    },

    "home_layout.update": {
        label:
            "Layout gespeichert",

        icon:
            "bi-grid-1x2",

        tone:
            "info"
    },

    "home_layout.reset": {
        label:
            "Layout zurückgesetzt",

        icon:
            "bi-arrow-repeat",

        tone:
            "warning"
    },

    "footer.update": {
        label:
            "Footer gespeichert",

        icon:
            "bi-layout-text-window-reverse",

        tone:
            "info"
    },

    "footer.reset": {
        label:
            "Footer zurückgesetzt",

        icon:
            "bi-arrow-repeat",

        tone:
            "warning"
    },

    "user.create": {
        label:
            "Benutzer erstellt",

        icon:
            "bi-person-plus",

        tone:
            "success"
    },

    "user.update": {
        label:
            "Benutzer bearbeitet",

        icon:
            "bi-person-gear",

        tone:
            "info"
    },

    "user.password_reset": {
        label:
            "Passwort zurückgesetzt",

        icon:
            "bi-key",

        tone:
            "warning"
    },

    "user.sessions_revoke": {
        label:
            "Sitzungen beendet",

        icon:
            "bi-box-arrow-right",

        tone:
            "warning"
    },

    "media.upload": {
        label:
            "Medium hochgeladen",

        icon:
            "bi-cloud-arrow-up",

        tone:
            "success"
    },

    "media.update": {
        label:
            "Medium bearbeitet",

        icon:
            "bi-image",

        tone:
            "info"
    },

    "media.delete": {
        label:
            "Medium gelöscht",

        icon:
            "bi-trash3",

        tone:
            "danger"
    },

    "media.import": {
        label:
            "Medienmigration",

        icon:
            "bi-database-up",

        tone:
            "info"
    },

    "admin.mutation": {
        label:
            "Administrative Änderung",

        icon:
            "bi-gear",

        tone:
            "neutral"
    }
};

const ENTITY_LABELS = {
    page:
        "Builder-Seite",

    website_content:
        "Website-Inhalt",

    navigation:
        "Navigation",

    home_layout:
        "Startseiten-Layout",

    footer:
        "Footer",

    user:
        "Benutzer",

    media:
        "Medium",

    migration:
        "Migration",

    settings:
        "Einstellung",

    admin:
        "Administration"
};

function getActionDefinition(
    action
) {
    return (
        ACTION_DEFINITIONS[
            action
        ] ?? {
            label:
                action ||
                "Unbekannte Aktion",

            icon:
                "bi-activity",

            tone:
                "neutral"
        }
    );
}

function getEntityLabel(
    entityType
) {
    return (
        ENTITY_LABELS[
            entityType
        ] ??
        entityType ??
        "Unbekannt"
    );
}

function getActorName(
    entry
) {
    return (
        entry.actorDisplayName ??
        entry.actorUsername ??
        "Unbekannter Benutzer"
    );
}

function getActorInitials(
    entry
) {
    const source =
        getActorName(
            entry
        );

    return source
        .split(
            /\s+/
        )
        .filter(
            Boolean
        )
        .slice(
            0,
            2
        )
        .map(
            (part) =>
                part[0]
                    ?.toUpperCase()
        )
        .join("");
}

function getRoleLabel(
    role
) {
    if (
        role ===
        "administrator"
    ) {
        return "Administrator";
    }

    if (
        role ===
        "editor"
    ) {
        return "Redakteur";
    }

    if (
        role ===
        "media_manager"
    ) {
        return "Medienverwalter";
    }

    return role ||
        "Unbekannte Rolle";
}

function formatDate(
    value
) {
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
                "medium"
        }
    ).format(date);
}

function formatRelativeTime(
    value
) {
    if (!value) {
        return "";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    const differenceSeconds =
        Math.round(
            (
                date.getTime() -
                Date.now()
            ) /
            1000
        );

    const absoluteSeconds =
        Math.abs(
            differenceSeconds
        );

    const formatter =
        new Intl.RelativeTimeFormat(
            "de-DE",
            {
                numeric:
                    "auto"
            }
        );

    if (
        absoluteSeconds <
        60
    ) {
        return formatter.format(
            differenceSeconds,
            "second"
        );
    }

    const differenceMinutes =
        Math.round(
            differenceSeconds /
            60
        );

    if (
        Math.abs(
            differenceMinutes
        ) <
        60
    ) {
        return formatter.format(
            differenceMinutes,
            "minute"
        );
    }

    const differenceHours =
        Math.round(
            differenceMinutes /
            60
        );

    if (
        Math.abs(
            differenceHours
        ) <
        24
    ) {
        return formatter.format(
            differenceHours,
            "hour"
        );
    }

    const differenceDays =
        Math.round(
            differenceHours /
            24
        );

    if (
        Math.abs(
            differenceDays
        ) <
        30
    ) {
        return formatter.format(
            differenceDays,
            "day"
        );
    }

    return formatDate(
        value
    );
}

function formatMetadata(
    metadata
) {
    if (
        !metadata ||
        typeof metadata !==
            "object" ||
        Object.keys(
            metadata
        ).length ===
            0
    ) {
        return "Keine zusätzlichen Metadaten vorhanden.";
    }

    return JSON.stringify(
        metadata,
        null,
        2
    );
}

function AuditStatistic({
    icon,
    value,
    label,
    description
}) {
    return (
        <article className="audit-stat">
            <span className="audit-stat__icon">
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

function AuditLoading() {
    return (
        <div
            className="audit-log__loading"
            role="status"
            aria-live="polite"
        >
            <span
                className="spinner-border text-info"
                aria-hidden="true"
            />

            <span>
                Aktivitätsprotokoll wird aus PostgreSQL geladen …
            </span>
        </div>
    );
}

export default function AuditLog() {
    const [
        entries,
        setEntries
    ] =
        useState([]);

    const [
        total,
        setTotal
    ] =
        useState(0);

    const [
        loading,
        setLoading
    ] =
        useState(true);

    const [
        loadingMore,
        setLoadingMore
    ] =
        useState(false);

    const [
        error,
        setError
    ] =
        useState("");

    const [
        searchTerm,
        setSearchTerm
    ] =
        useState("");

    const [
        actionFilter,
        setActionFilter
    ] =
        useState("");

    const [
        entityFilter,
        setEntityFilter
    ] =
        useState("");

    const [
        selectedEntry,
        setSelectedEntry
    ] =
        useState(null);

    useEffect(() => {
        const controller =
            new AbortController();

        async function loadInitialEntries() {
            setLoading(true);
            setError("");

            try {
                const payload =
                    await listAuditEntries({
                        limit:
                            AUDIT_PAGE_SIZE,

                        offset:
                            0,

                        action:
                            actionFilter,

                        entityType:
                            entityFilter,

                        signal:
                            controller.signal
                    });

                if (
                    controller.signal
                        .aborted
                ) {
                    return;
                }

                setEntries(
                    payload.items
                );

                setTotal(
                    payload.total
                );
            } catch (
                loadError
            ) {
                if (
                    loadError?.name ===
                        "AbortError" ||
                    controller.signal
                        .aborted
                ) {
                    return;
                }

                setEntries([]);
                setTotal(0);

                setError(
                    loadError.message ??
                    "Das Aktivitätsprotokoll konnte nicht geladen werden."
                );
            } finally {
                if (
                    !controller.signal
                        .aborted
                ) {
                    setLoading(false);
                }
            }
        }

        loadInitialEntries();

        return () => {
            controller.abort();
        };
    }, [
        actionFilter,
        entityFilter
    ]);

    const filteredEntries =
        useMemo(
            () => {
                const search =
                    searchTerm
                        .trim()
                        .toLowerCase();

                if (!search) {
                    return entries;
                }

                return entries.filter(
                    (entry) => {
                        const actionDefinition =
                            getActionDefinition(
                                entry.action
                            );

                        return [
                            entry.summary,
                            entry.action,
                            actionDefinition.label,
                            entry.entityType,
                            getEntityLabel(
                                entry.entityType
                            ),
                            entry.entityId,
                            entry.entityLabel,
                            entry.actorUsername,
                            entry.actorDisplayName,
                            entry.actorRole,
                            getRoleLabel(
                                entry.actorRole
                            ),
                            entry.requestMethod,
                            entry.requestPath
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
                            );
                    }
                );
            },
            [
                entries,
                searchTerm
            ]
        );

    const statistics =
        useMemo(
            () => ({
                total,

                loaded:
                    entries.length,

                actors:
                    new Set(
                        entries
                            .map(
                                (entry) =>
                                    entry.actorUserId ??
                                    entry.actorUsername
                            )
                            .filter(
                                Boolean
                            )
                    ).size,

                destructive:
                    entries.filter(
                        (entry) =>
                            entry.action
                                ?.includes(
                                    "delete"
                                ) ||
                            entry.action ===
                                "page.move_to_trash"
                    ).length
            }),
            [
                entries,
                total
            ]
        );

    const hasMore =
        entries.length <
        total;

    async function refreshEntries() {
        if (
            loading ||
            loadingMore
        ) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const payload =
                await listAuditEntries({
                    limit:
                        AUDIT_PAGE_SIZE,

                    offset:
                        0,

                    action:
                        actionFilter,

                    entityType:
                        entityFilter
                });

            setEntries(
                payload.items
            );

            setTotal(
                payload.total
            );
        } catch (
            refreshError
        ) {
            setError(
                refreshError.message ??
                "Das Aktivitätsprotokoll konnte nicht aktualisiert werden."
            );
        } finally {
            setLoading(false);
        }
    }

    async function loadMoreEntries() {
        if (
            loading ||
            loadingMore ||
            !hasMore
        ) {
            return;
        }

        setLoadingMore(true);
        setError("");

        try {
            const payload =
                await listAuditEntries({
                    limit:
                        AUDIT_PAGE_SIZE,

                    offset:
                        entries.length,

                    action:
                        actionFilter,

                    entityType:
                        entityFilter
                });

            setEntries(
                (
                    currentEntries
                ) => {
                    const knownIds =
                        new Set(
                            currentEntries.map(
                                (entry) =>
                                    entry.id
                            )
                        );

                    const newEntries =
                        payload.items.filter(
                            (entry) =>
                                !knownIds.has(
                                    entry.id
                                )
                        );

                    return [
                        ...currentEntries,
                        ...newEntries
                    ];
                }
            );

            setTotal(
                payload.total
            );
        } catch (
            loadError
        ) {
            setError(
                loadError.message ??
                "Weitere Aktivitäten konnten nicht geladen werden."
            );
        } finally {
            setLoadingMore(false);
        }
    }

    function resetFilters() {
        setSearchTerm("");
        setActionFilter("");
        setEntityFilter("");
    }

    return (
        <>
            <AdminPage
                title="Aktivitätsprotokoll"
                description="Unveränderbare Historie erfolgreicher Änderungen im BluePulse Nexus."
                action={
                    <Button
                        variant="secondary"
                        disabled={
                            loading ||
                            loadingMore
                        }
                        onClick={
                            refreshEntries
                        }
                    >
                        <i
                            className="bi bi-arrow-clockwise"
                            aria-hidden="true"
                        />

                        Aktualisieren
                    </Button>
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

                <div className="audit-log__immutability">
                    <span className="audit-log__immutability-icon">
                        <i
                            className="bi bi-shield-lock-fill"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <strong>
                            Audit-Einträge sind unveränderbar.
                        </strong>

                        <span>
                            Einträge können über Nexus weder bearbeitet noch gelöscht werden. Passwörter, Cookies und Sitzungstoken werden nicht protokolliert.
                        </span>
                    </div>
                </div>

                <section className="audit-log__statistics">
                    <AuditStatistic
                        icon="bi-journal-text"
                        value={
                            statistics.total
                        }
                        label="Einträge insgesamt"
                        description="Passend zu den Filtern"
                    />

                    <AuditStatistic
                        icon="bi-list-check"
                        value={
                            statistics.loaded
                        }
                        label="Aktuell geladen"
                        description={
                            hasMore
                                ? "Weitere Einträge verfügbar"
                                : "Alle Einträge geladen"
                        }
                    />

                    <AuditStatistic
                        icon="bi-people"
                        value={
                            statistics.actors
                        }
                        label="Akteure"
                        description="In den geladenen Einträgen"
                    />

                    <AuditStatistic
                        icon="bi-exclamation-triangle"
                        value={
                            statistics.destructive
                        }
                        label="Löschaktionen"
                        description="In den geladenen Einträgen"
                    />
                </section>

                <section className="audit-log__filters">
                    <label className="audit-log__search">
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
                            placeholder="Akteur, Zusammenfassung, Objekt oder API-Pfad suchen …"
                        />
                    </label>

                    <label className="audit-log__filter">
                        <span>
                            Bereich
                        </span>

                        <select
                            value={
                                entityFilter
                            }
                            onChange={
                                (event) =>
                                    setEntityFilter(
                                        event.target.value
                                    )
                            }
                        >
                            {
                                ENTITY_OPTIONS.map(
                                    (option) => (
                                        <option
                                            key={
                                                option.value ||
                                                "all"
                                            }
                                            value={
                                                option.value
                                            }
                                        >
                                            {
                                                option.label
                                            }
                                        </option>
                                    )
                                )
                            }
                        </select>
                    </label>

                    <label className="audit-log__filter">
                        <span>
                            Aktion
                        </span>

                        <select
                            value={
                                actionFilter
                            }
                            onChange={
                                (event) =>
                                    setActionFilter(
                                        event.target.value
                                    )
                            }
                        >
                            {
                                ACTION_OPTIONS.map(
                                    (option) => (
                                        <option
                                            key={
                                                option.value ||
                                                "all"
                                            }
                                            value={
                                                option.value
                                            }
                                        >
                                            {
                                                option.label
                                            }
                                        </option>
                                    )
                                )
                            }
                        </select>
                    </label>

                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={
                            !searchTerm &&
                            !actionFilter &&
                            !entityFilter
                        }
                        onClick={
                            resetFilters
                        }
                    >
                        Filter löschen
                    </Button>
                </section>

                {
                    loading ? (
                        <AuditLoading />
                    ) : entries.length ===
                        0 ? (
                        <section className="audit-log__empty">
                            <span>
                                <i
                                    className="bi bi-journal-x"
                                    aria-hidden="true"
                                />
                            </span>

                            <h2>
                                Keine Aktivitäten gefunden
                            </h2>

                            <p>
                                Für die gewählten Filter existieren noch keine protokollierten Aktionen.
                            </p>

                            <Button
                                variant="secondary"
                                onClick={
                                    resetFilters
                                }
                            >
                                Filter zurücksetzen
                            </Button>
                        </section>
                    ) : filteredEntries.length ===
                        0 ? (
                        <section className="audit-log__empty">
                            <span>
                                <i
                                    className="bi bi-search"
                                    aria-hidden="true"
                                />
                            </span>

                            <h2>
                                Kein geladener Eintrag passt zur Suche
                            </h2>

                            <p>
                                Die Freitextsuche durchsucht die derzeit geladenen Audit-Einträge.
                            </p>
                        </section>
                    ) : (
                        <>
                            <section className="audit-log__list">
                                {
                                    filteredEntries.map(
                                        (entry) => {
                                            const definition =
                                                getActionDefinition(
                                                    entry.action
                                                );

                                            return (
                                                <article
                                                    key={
                                                        entry.id
                                                    }
                                                    className="audit-entry"
                                                >
                                                    <span
                                                        className={
                                                            `audit-entry__action audit-entry__action--${definition.tone}`
                                                        }
                                                    >
                                                        <i
                                                            className={
                                                                `bi ${definition.icon}`
                                                            }
                                                            aria-hidden="true"
                                                        />
                                                    </span>

                                                    <div className="audit-entry__content">
                                                        <div className="audit-entry__heading">
                                                            <span
                                                                className={
                                                                    `audit-entry__badge audit-entry__badge--${definition.tone}`
                                                                }
                                                            >
                                                                {
                                                                    definition.label
                                                                }
                                                            </span>

                                                            <span className="audit-entry__entity">
                                                                {
                                                                    getEntityLabel(
                                                                        entry.entityType
                                                                    )
                                                                }

                                                                {
                                                                    entry.entityLabel &&
                                                                    ` · ${entry.entityLabel}`
                                                                }
                                                            </span>
                                                        </div>

                                                        <strong className="audit-entry__summary">
                                                            {
                                                                entry.summary
                                                            }
                                                        </strong>

                                                        <div className="audit-entry__actor">
                                                            <span className="audit-entry__avatar">
                                                                {
                                                                    getActorInitials(
                                                                        entry
                                                                    )
                                                                }
                                                            </span>

                                                            <div>
                                                                <strong>
                                                                    {
                                                                        getActorName(
                                                                            entry
                                                                        )
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        entry.actorUsername
                                                                            ? `@${entry.actorUsername} · `
                                                                            : ""
                                                                    }

                                                                    {
                                                                        getRoleLabel(
                                                                            entry.actorRole
                                                                        )
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="audit-entry__time">
                                                        <strong>
                                                            {
                                                                formatRelativeTime(
                                                                    entry.createdAt
                                                                )
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                formatDate(
                                                                    entry.createdAt
                                                                )
                                                            }
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="audit-entry__details"
                                                        onClick={
                                                            () =>
                                                                setSelectedEntry(
                                                                    entry
                                                                )
                                                        }
                                                    >
                                                        <i
                                                            className="bi bi-info-circle"
                                                            aria-hidden="true"
                                                        />

                                                        Details
                                                    </button>
                                                </article>
                                            );
                                        }
                                    )
                                }
                            </section>

                            <footer className="audit-log__pagination">
                                <span>
                                    {
                                        entries.length
                                    } von {
                                        total
                                    } Einträgen geladen
                                </span>

                                {
                                    hasMore && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            disabled={
                                                loadingMore
                                            }
                                            onClick={
                                                loadMoreEntries
                                            }
                                        >
                                            {
                                                loadingMore ? (
                                                    <>
                                                        <span
                                                            className="spinner-border spinner-border-sm"
                                                            aria-hidden="true"
                                                        />

                                                        Weitere werden geladen …
                                                    </>
                                                ) : (
                                                    <>
                                                        <i
                                                            className="bi bi-chevron-down"
                                                            aria-hidden="true"
                                                        />

                                                        Weitere {
                                                            Math.min(
                                                                AUDIT_PAGE_SIZE,
                                                                total -
                                                                entries.length
                                                            )
                                                        } laden
                                                    </>
                                                )
                                            }
                                        </Button>
                                    )
                                }
                            </footer>
                        </>
                    )
                }
            </AdminPage>

            <Modal
                open={
                    Boolean(
                        selectedEntry
                    )
                }
                title="Audit-Details"
                onClose={
                    () =>
                        setSelectedEntry(
                            null
                        )
                }
            >
                {
                    selectedEntry && (
                        <div className="audit-detail">
                            <div className="audit-detail__headline">
                                <span
                                    className={
                                        `audit-entry__action audit-entry__action--${
                                            getActionDefinition(
                                                selectedEntry.action
                                            ).tone
                                        }`
                                    }
                                >
                                    <i
                                        className={
                                            `bi ${
                                                getActionDefinition(
                                                    selectedEntry.action
                                                ).icon
                                            }`
                                        }
                                        aria-hidden="true"
                                    />
                                </span>

                                <div>
                                    <span
                                        className={
                                            `audit-entry__badge audit-entry__badge--${
                                                getActionDefinition(
                                                    selectedEntry.action
                                                ).tone
                                            }`
                                        }
                                    >
                                        {
                                            getActionDefinition(
                                                selectedEntry.action
                                            ).label
                                        }
                                    </span>

                                    <h3>
                                        {
                                            selectedEntry.summary
                                        }
                                    </h3>
                                </div>
                            </div>

                            <dl className="audit-detail__grid">
                                <div>
                                    <dt>
                                        Eintragsnummer
                                    </dt>

                                    <dd>
                                        #{
                                            selectedEntry.id
                                        }
                                    </dd>
                                </div>

                                <div>
                                    <dt>
                                        Zeitpunkt
                                    </dt>

                                    <dd>
                                        {
                                            formatDate(
                                                selectedEntry.createdAt
                                            )
                                        }
                                    </dd>
                                </div>

                                <div>
                                    <dt>
                                        Akteur
                                    </dt>

                                    <dd>
                                        {
                                            getActorName(
                                                selectedEntry
                                            )
                                        }

                                        {
                                            selectedEntry.actorUsername &&
                                            ` (@${selectedEntry.actorUsername})`
                                        }
                                    </dd>
                                </div>

                                <div>
                                    <dt>
                                        Rolle
                                    </dt>

                                    <dd>
                                        {
                                            getRoleLabel(
                                                selectedEntry.actorRole
                                            )
                                        }
                                    </dd>
                                </div>

                                <div>
                                    <dt>
                                        Aktionscode
                                    </dt>

                                    <dd>
                                        <code>
                                            {
                                                selectedEntry.action
                                            }
                                        </code>
                                    </dd>
                                </div>

                                <div>
                                    <dt>
                                        Objekttyp
                                    </dt>

                                    <dd>
                                        {
                                            getEntityLabel(
                                                selectedEntry.entityType
                                            )
                                        }

                                        <code>
                                            {
                                                selectedEntry.entityType
                                            }
                                        </code>
                                    </dd>
                                </div>

                                <div>
                                    <dt>
                                        Objekt-ID
                                    </dt>

                                    <dd>
                                        <code>
                                            {
                                                selectedEntry.entityId ??
                                                "Nicht vorhanden"
                                            }
                                        </code>
                                    </dd>
                                </div>

                                <div>
                                    <dt>
                                        Objektbezeichnung
                                    </dt>

                                    <dd>
                                        {
                                            selectedEntry.entityLabel ??
                                            "Nicht vorhanden"
                                        }
                                    </dd>
                                </div>

                                <div className="audit-detail__wide">
                                    <dt>
                                        API-Anfrage
                                    </dt>

                                    <dd>
                                        <span className="audit-detail__method">
                                            {
                                                selectedEntry.requestMethod
                                            }
                                        </span>

                                        <code>
                                            {
                                                selectedEntry.requestPath
                                            }
                                        </code>
                                    </dd>
                                </div>
                            </dl>

                            <section className="audit-detail__metadata">
                                <h4>
                                    Metadaten
                                </h4>

                                <pre>
                                    {
                                        formatMetadata(
                                            selectedEntry.metadata
                                        )
                                    }
                                </pre>
                            </section>

                            <div className="audit-detail__security">
                                <i
                                    className="bi bi-shield-check"
                                    aria-hidden="true"
                                />

                                Dieser Eintrag ist durch den Datenbank-Manipulationsschutz gesichert.
                            </div>
                        </div>
                    )
                }
            </Modal>
        </>
    );
}