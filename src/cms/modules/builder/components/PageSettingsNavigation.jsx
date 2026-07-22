import "./PageSettingsNavigation.css";

import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    loadPageNavigationContext
} from "@shared/navigation/pageNavigationSync";

const EMPTY_CONTEXT = {
    parentOptions: [],
    synchronizedItem: null,
    duplicateCount: 0,
    mode: "local"
};

function getSynchronizationState({
    page,
    settings,
    synchronizedItem
}) {
    if (
        !settings.navigation
            .includeInNavigation
    ) {
        return {
            tone:
                "neutral",

            icon:
                "bi-eye-slash",

            title:
                "Nicht in der Navigation",

            text:
                "Für diese Seite ist aktuell kein automatischer Menüpunkt vorgesehen."
        };
    }

    if (!synchronizedItem) {
        return {
            tone:
                "pending",

            icon:
                "bi-arrow-repeat",

            title:
                "Synchronisierung ausstehend",

            text:
                "Der Menüpunkt wird beim nächsten Speichern oder Veröffentlichen angelegt."
        };
    }

    if (
        synchronizedItem.enabled &&
        page.status ===
            "published"
    ) {
        return {
            tone:
                "success",

            icon:
                "bi-check-circle-fill",

            title:
                "Aktiv synchronisiert",

            text:
                "Der Menüpunkt ist in der öffentlichen Website-Navigation sichtbar."
        };
    }

    return {
        tone:
            "draft",

        icon:
            "bi-file-earmark",

        title:
            "Als Entwurf vorbereitet",

        text:
            "Der Menüpunkt ist gespeichert, bleibt aber bis zur Veröffentlichung unsichtbar."
    };
}

export default function PageSettingsNavigation({
    page,
    settings,
    updateSetting
}) {
    const [
        navigationContext,
        setNavigationContext
    ] =
        useState(
            EMPTY_CONTEXT
        );

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

    const loadNavigation =
        useCallback(
            async ({
                signal
            } = {}) => {
                if (!page?.id) {
                    setLoading(false);

                    return;
                }

                setLoading(true);
                setError("");

                try {
                    const context =
                        await loadPageNavigationContext(
                            page.id,
                            {
                                signal
                            }
                        );

                    if (
                        signal?.aborted
                    ) {
                        return;
                    }

                    setNavigationContext({
                        ...EMPTY_CONTEXT,
                        ...context,

                        parentOptions:
                            Array.isArray(
                                context
                                    ?.parentOptions
                            )
                                ? context
                                    .parentOptions
                                : []
                    });
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
                        "Die vorhandene Navigation konnte nicht geladen werden."
                    );
                } finally {
                    if (
                        !signal?.aborted
                    ) {
                        setLoading(false);
                    }
                }
            },
            [
                page?.id
            ]
        );

    useEffect(() => {
        const controller =
            new AbortController();

        loadNavigation({
            signal:
                controller.signal
        });

        return () => {
            controller.abort();
        };
    }, [
        loadNavigation
    ]);

    const parentOptions =
        navigationContext
            .parentOptions;

    const selectedParentExists =
        useMemo(
            () =>
                !settings.navigation
                    .parentId ||
                parentOptions.some(
                    (option) =>
                        option.id ===
                        settings.navigation
                            .parentId
                ),
            [
                parentOptions,
                settings.navigation
                    .parentId
            ]
        );

    const synchronizationState =
        getSynchronizationState({
            page,
            settings,

            synchronizedItem:
                navigationContext
                    .synchronizedItem
        });

    const navigationEnabled =
        settings.navigation
            .includeInNavigation;

    return (
        <section className="page-settings__section">
            <div className="page-settings__section-heading">
                <div className="page-navigation-settings__heading">
                    <div>
                        <h3>
                            Website-Navigation
                        </h3>

                        <p>
                            Nexus hält Menübezeichnung, Seitenadresse, Status und Hierarchie automatisch mit dieser Builder-Seite synchron.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="page-navigation-settings__reload"
                        disabled={
                            loading
                        }
                        onClick={
                            () =>
                                loadNavigation()
                        }
                        title="Navigation neu laden"
                        aria-label="Navigation neu laden"
                    >
                        <i
                            className={
                                loading
                                    ? "bi bi-arrow-clockwise page-navigation-settings__rotating"
                                    : "bi bi-arrow-clockwise"
                            }
                            aria-hidden="true"
                        />
                    </button>
                </div>
            </div>

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

            <div
                className={
                    `page-navigation-settings__status page-navigation-settings__status--${synchronizationState.tone}`
                }
            >
                <span className="page-navigation-settings__status-icon">
                    <i
                        className={
                            `bi ${synchronizationState.icon}`
                        }
                        aria-hidden="true"
                    />
                </span>

                <div>
                    <strong>
                        {
                            synchronizationState
                                .title
                        }
                    </strong>

                    <small>
                        {
                            synchronizationState
                                .text
                        }
                    </small>
                </div>
            </div>

            {
                navigationContext
                    .duplicateCount >
                    0 && (
                    <div className="page-settings__information page-settings__information--warning">
                        <i
                            className="bi bi-exclamation-triangle"
                            aria-hidden="true"
                        />

                        Es wurden {
                            navigationContext
                                .duplicateCount
                        } doppelte Menüpunkte erkannt. Beim nächsten Speichern werden sie automatisch zusammengeführt.
                    </div>
                )
            }

            <div className="page-settings__switch">
                <div>
                    <strong>
                        In Navigation anzeigen
                    </strong>

                    <span>
                        Erstellt und verwaltet automatisch einen Menüpunkt für diese Seite.
                    </span>
                </div>

                <input
                    type="checkbox"
                    className="form-check-input"
                    checked={
                        navigationEnabled
                    }
                    onChange={
                        (event) =>
                            updateSetting(
                                "navigation",
                                "includeInNavigation",
                                event.target.checked
                            )
                    }
                />
            </div>

            <div className="page-settings__field">
                <label htmlFor="builder-navigation-label">
                    Bezeichnung im Menü
                </label>

                <input
                    id="builder-navigation-label"
                    className="form-control"
                    value={
                        settings.navigation
                            .label
                    }
                    placeholder={
                        page.title
                    }
                    disabled={
                        !navigationEnabled
                    }
                    maxLength="120"
                    onChange={
                        (event) =>
                            updateSetting(
                                "navigation",
                                "label",
                                event.target.value
                            )
                    }
                />

                <small>
                    Leer lassen, um automatisch den Seitentitel zu verwenden.
                </small>
            </div>

            <div className="page-settings__field">
                <label htmlFor="builder-navigation-parent">
                    Übergeordneter Menüpunkt
                </label>

                <select
                    id="builder-navigation-parent"
                    className="form-select"
                    value={
                        settings.navigation
                            .parentId
                    }
                    disabled={
                        !navigationEnabled ||
                        loading
                    }
                    onChange={
                        (event) =>
                            updateSetting(
                                "navigation",
                                "parentId",
                                event.target.value
                            )
                    }
                >
                    <option value="">
                        Hauptebene
                    </option>

                    {
                        !selectedParentExists && (
                            <option
                                value={
                                    settings.navigation
                                        .parentId
                                }
                            >
                                Nicht mehr verfügbar – wird auf Hauptebene verschoben
                            </option>
                        )
                    }

                    {
                        parentOptions.map(
                            (option) => (
                                <option
                                    key={
                                        option.id
                                    }
                                    value={
                                        option.id
                                    }
                                >
                                    {
                                        `${"— ".repeat(
                                            option.depth
                                        )}${option.label}${option.enabled
                                            ? ""
                                            : " (inaktiv)"}`
                                    }
                                </option>
                            )
                        )
                    }
                </select>

                <small>
                    Die eigene Seite und ihre Unterpunkte werden ausgeschlossen, damit keine Menüschleife entstehen kann.
                </small>
            </div>

            <div className="page-settings__field">
                <label htmlFor="builder-navigation-order">
                    Reihenfolge
                </label>

                <input
                    id="builder-navigation-order"
                    className="form-control"
                    type="number"
                    min="0"
                    max="9999"
                    value={
                        settings.navigation
                            .order
                    }
                    disabled={
                        !navigationEnabled
                    }
                    onChange={
                        (event) =>
                            updateSetting(
                                "navigation",
                                "order",
                                Number(
                                    event.target.value
                                )
                            )
                    }
                />

                <small>
                    Kleinere Werte erscheinen innerhalb derselben Menüebene weiter vorne.
                </small>
            </div>

            <div className="page-settings__switch">
                <div>
                    <strong>
                        Hervorgehoben
                    </strong>

                    <span>
                        Markiert den Menüpunkt als besondere Aktion.
                    </span>
                </div>

                <input
                    type="checkbox"
                    className="form-check-input"
                    checked={
                        settings.navigation
                            .highlighted
                    }
                    disabled={
                        !navigationEnabled
                    }
                    onChange={
                        (event) =>
                            updateSetting(
                                "navigation",
                                "highlighted",
                                event.target.checked
                            )
                    }
                />
            </div>

            <div className="page-settings__switch">
                <div>
                    <strong>
                        In neuem Fenster öffnen
                    </strong>

                    <span>
                        Öffnet den Menüpunkt mit dem Zielattribut „_blank“.
                    </span>
                </div>

                <input
                    type="checkbox"
                    className="form-check-input"
                    checked={
                        settings.navigation
                            .openInNewTab
                    }
                    disabled={
                        !navigationEnabled
                    }
                    onChange={
                        (event) =>
                            updateSetting(
                                "navigation",
                                "openInNewTab",
                                event.target.checked
                            )
                    }
                />
            </div>

            <div className="page-navigation-settings__summary">
                <div>
                    <span>
                        Datenquelle
                    </span>

                    <strong>
                        {
                            navigationContext
                                .mode ===
                            "api"
                                ? "PostgreSQL"
                                : "Browser"
                        }
                    </strong>
                </div>

                <div>
                    <span>
                        Ziel
                    </span>

                    <strong>
                        /{
                            page.slug
                        }
                    </strong>
                </div>

                <div>
                    <span>
                        Sichtbarkeit
                    </span>

                    <strong>
                        {
                            page.status ===
                            "published"
                                ? "Öffentlich"
                                : "Entwurf"
                        }
                    </strong>
                </div>
            </div>

            <div className="page-settings__information">
                <i
                    className="bi bi-info-circle"
                    aria-hidden="true"
                />

                Die zentrale Navigation wird beim Speichern, Veröffentlichen oder Entfernen der Seite synchronisiert.
            </div>
        </section>
    );
}