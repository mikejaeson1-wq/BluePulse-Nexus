import "./BlockSettingsControls.css";

import {
    createDefaultBlockSettings,
    getBlockSettings,
    updateBlockAdvancedSettings
} from "@shared/pages/blockSettings";

const VISIBILITY_OPTIONS = [
    {
        key: "hideDesktop",
        label: "Desktop",
        description: "Ab 1200 Pixel ausblenden",
        icon: "bi-display"
    },
    {
        key: "hideTablet",
        label: "Tablet",
        description: "Zwischen 768 und 1199 Pixel ausblenden",
        icon: "bi-tablet-landscape"
    },
    {
        key: "hideMobile",
        label: "Mobil",
        description: "Unter 768 Pixel ausblenden",
        icon: "bi-phone"
    }
];

export default function BlockAdvancedSettings({
    block,
    onChange
}) {
    const settings =
        getBlockSettings(
            block
        );

    const advanced =
        settings.advanced;

    function update(
        patch
    ) {
        onChange?.(
            updateBlockAdvancedSettings(
                block,
                patch
            )
        );
    }

    function resetAdvanced() {
        const defaults =
            createDefaultBlockSettings();

        onChange?.(
            updateBlockAdvancedSettings(
                block,
                defaults.advanced
            )
        );
    }

    const hiddenDeviceCount =
        VISIBILITY_OPTIONS.filter(
            (option) =>
                advanced[
                    option.key
                ]
        ).length;

    const selectorPreview = [
        advanced.anchorId
            ? `#${advanced.anchorId}`
            : "",

        advanced.classNames
            ? advanced.classNames
                .split(
                    /\s+/
                )
                .filter(
                    Boolean
                )
                .map(
                    (className) =>
                        `.${className}`
                )
                .join(
                    ""
                )
            : ""
    ]
        .filter(
            Boolean
        )
        .join(
            ""
        );

    return (
        <div className="builder-block-settings">
            <section className="builder-block-settings__section">
                <header className="builder-block-settings__section-header">
                    <span className="builder-block-settings__section-icon">
                        <i
                            className="bi bi-link-45deg"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <h4>
                            Anker und Verlinkung
                        </h4>

                        <p>
                            Der Block kann über eine eindeutige Adresse direkt angesprungen werden.
                        </p>
                    </div>
                </header>

                <label className="builder-block-settings__field">
                    <span className="builder-block-settings__field-label">
                        Anker-ID
                    </span>

                    <div className="builder-block-settings__prefixed-input">
                        <span>
                            #
                        </span>

                        <input
                            type="text"
                            value={
                                advanced.anchorId
                            }
                            placeholder="beispiel-abschnitt"
                            spellCheck="false"
                            onChange={
                                (event) =>
                                    update({
                                        anchorId:
                                            event.target.value
                                    })
                            }
                        />
                    </div>

                    <small className="builder-block-settings__help">
                        Verwende die ID beispielsweise als Linkziel:
                        {" "}
                        <code>
                            /seite#{
                                advanced.anchorId ||
                                "beispiel-abschnitt"
                            }
                        </code>
                    </small>
                </label>
            </section>

            <section className="builder-block-settings__section">
                <header className="builder-block-settings__section-header">
                    <span className="builder-block-settings__section-icon">
                        <i
                            className="bi bi-code-slash"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <h4>
                            Eigene CSS-Klassen
                        </h4>

                        <p>
                            Zusätzliche Klassen für spätere individuelle Gestaltung.
                        </p>
                    </div>
                </header>

                <label className="builder-block-settings__field">
                    <span className="builder-block-settings__field-label">
                        Klassennamen
                    </span>

                    <input
                        type="text"
                        value={
                            advanced.classNames
                        }
                        placeholder="kampagne hervorgehoben"
                        spellCheck="false"
                        onChange={
                            (event) =>
                                update({
                                    classNames:
                                        event.target.value
                                })
                        }
                    />

                    <small className="builder-block-settings__help">
                        Mehrere Klassen werden durch Leerzeichen getrennt. Es sind maximal acht Klassennamen möglich.
                    </small>
                </label>

                {
                    selectorPreview && (
                        <div className="builder-block-settings__code-preview">
                            <span>
                                CSS-Selektor
                            </span>

                            <code>
                                {
                                    selectorPreview
                                }
                            </code>
                        </div>
                    )
                }
            </section>

            <section className="builder-block-settings__section">
                <header className="builder-block-settings__section-header">
                    <span className="builder-block-settings__section-icon">
                        <i
                            className="bi bi-universal-access"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <h4>
                            Barrierefreiheit
                        </h4>

                        <p>
                            Ergänzende Beschreibung für assistive Technologien.
                        </p>
                    </div>
                </header>

                <label className="builder-block-settings__field">
                    <span className="builder-block-settings__field-label">
                        ARIA-Beschriftung
                    </span>

                    <textarea
                        rows={
                            3
                        }
                        value={
                            advanced.ariaLabel
                        }
                        placeholder="Kurze Beschreibung des Abschnitts"
                        onChange={
                            (event) =>
                                update({
                                    ariaLabel:
                                        event.target.value
                                })
                        }
                    />

                    <small className="builder-block-settings__help">
                        Nur eintragen, wenn der sichtbare Inhalt den Zweck des Blocks nicht ausreichend beschreibt.
                    </small>
                </label>
            </section>

            <section className="builder-block-settings__section">
                <header className="builder-block-settings__section-header">
                    <span className="builder-block-settings__section-icon">
                        <i
                            className="bi bi-eye"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <h4>
                            Sichtbarkeit
                        </h4>

                        <p>
                            Blende den Block gezielt auf bestimmten Gerätegrößen aus.
                        </p>
                    </div>
                </header>

                <div className="builder-block-settings__visibility-summary">
                    <span
                        className={
                            hiddenDeviceCount >
                            0
                                ? "builder-block-settings__visibility-status builder-block-settings__visibility-status--warning"
                                : "builder-block-settings__visibility-status"
                        }
                    >
                        <i
                            className={
                                hiddenDeviceCount >
                                0
                                    ? "bi bi-eye-slash"
                                    : "bi bi-eye"
                            }
                            aria-hidden="true"
                        />

                        {
                            hiddenDeviceCount >
                            0
                                ? `Auf ${hiddenDeviceCount} Gerätegröße${hiddenDeviceCount === 1 ? "" : "n"} ausgeblendet`
                                : "Auf allen Geräten sichtbar"
                        }
                    </span>
                </div>

                <div className="builder-block-settings__visibility-grid">
                    {
                        VISIBILITY_OPTIONS.map(
                            (option) => {
                                const hidden =
                                    advanced[
                                        option.key
                                    ];

                                return (
                                    <label
                                        key={
                                            option.key
                                        }
                                        className={
                                            hidden
                                                ? "builder-block-settings__visibility-card builder-block-settings__visibility-card--hidden"
                                                : "builder-block-settings__visibility-card"
                                        }
                                    >
                                        <input
                                            type="checkbox"
                                            checked={
                                                hidden
                                            }
                                            onChange={
                                                (event) =>
                                                    update({
                                                        [
                                                            option.key
                                                        ]:
                                                            event.target.checked
                                                    })
                                            }
                                        />

                                        <span className="builder-block-settings__visibility-icon">
                                            <i
                                                className={
                                                    `bi ${option.icon}`
                                                }
                                                aria-hidden="true"
                                            />
                                        </span>

                                        <span className="builder-block-settings__visibility-content">
                                            <strong>
                                                {
                                                    option.label
                                                }
                                            </strong>

                                            <small>
                                                {
                                                    option.description
                                                }
                                            </small>
                                        </span>

                                        <span className="builder-block-settings__visibility-marker">
                                            <i
                                                className={
                                                    hidden
                                                        ? "bi bi-eye-slash-fill"
                                                        : "bi bi-eye-fill"
                                                }
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </label>
                                );
                            }
                        )
                    }
                </div>

                {
                    hiddenDeviceCount >
                        0 && (
                        <div className="builder-block-settings__warning">
                            <i
                                className="bi bi-info-circle"
                                aria-hidden="true"
                            />

                            <span>
                                Im Bearbeitungsmodus bleibt der Block sichtbar und erhält auf der betroffenen Gerätegröße einen gestrichelten Hinweisrahmen.
                            </span>
                        </div>
                    )
                }
            </section>

            <button
                type="button"
                className="builder-block-settings__reset"
                onClick={
                    resetAdvanced
                }
            >
                <i
                    className="bi bi-arrow-counterclockwise"
                    aria-hidden="true"
                />

                Erweiterte Einstellungen zurücksetzen
            </button>
        </div>
    );
}