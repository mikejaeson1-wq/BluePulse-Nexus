import "./Properties.css";

import {
    DIVIDER_DEVICE_OPTIONS,
    DIVIDER_HORIZONTAL_ALIGNMENT_OPTIONS,
    DIVIDER_LENGTH_MODE_OPTIONS,
    DIVIDER_ORIENTATION_OPTIONS,
    DIVIDER_STYLE_OPTIONS,
    DIVIDER_VERTICAL_ALIGNMENT_OPTIONS,
    createDefaultDividerBlockData,
    getDividerBlockSettings,
    resolveDividerLayoutForDevice,
    updateDividerBlockSettings,
    updateResponsiveDividerBlockSettings
} from "@shared/layout/dividerBlockSettings";

import {
    useBuilderViewport
} from "../../context/BuilderViewportContext";

const VALID_DEVICES = new Set([
    "desktop",
    "tablet",
    "mobile"
]);

function NumericField({
    label,
    value,
    minimum,
    maximum,
    suffix = "px",
    disabled = false,
    onChange
}) {
    function handleChange(event) {
        const rawValue = event.target.value;

        if (rawValue === "") {
            return;
        }

        onChange?.(Number(rawValue));
    }

    return (
        <label className="builder-divider-settings__field">
            <span className="builder-divider-settings__label">
                {label}
            </span>

            <div className="builder-divider-settings__number">
                <input
                    type="number"
                    min={minimum}
                    max={maximum}
                    value={value}
                    disabled={disabled}
                    onChange={handleChange}
                />

                <small>{suffix}</small>
            </div>
        </label>
    );
}

function SelectField({
    label,
    value,
    options,
    disabled = false,
    onChange
}) {
    return (
        <label className="builder-divider-settings__field">
            <span className="builder-divider-settings__label">
                {label}
            </span>

            <select
                value={value}
                disabled={disabled}
                onChange={(event) => onChange?.(event.target.value)}
            >
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function ColorField({
    label,
    value,
    onChange
}) {
    const pickerValue = /^#[0-9a-f]{6}$/i.test(value)
        ? value
        : "#334155";

    return (
        <label className="builder-divider-settings__field">
            <span className="builder-divider-settings__label">
                {label}
            </span>

            <div className="builder-divider-settings__color">
                <input
                    type="color"
                    value={pickerValue}
                    aria-label={`${label} auswählen`}
                    onChange={(event) => onChange?.(event.target.value)}
                />

                <input
                    type="text"
                    value={value}
                    spellCheck="false"
                    onChange={(event) => onChange?.(event.target.value)}
                />
            </div>
        </label>
    );
}

function DeviceSwitcher({
    activeDevice,
    settings,
    onChange
}) {
    return (
        <div
            className="builder-divider-settings__devices"
            role="tablist"
            aria-label="Gerätegröße für den Trenner"
        >
            {DIVIDER_DEVICE_OPTIONS.map((device) => {
                const active = device.value === activeDevice;

                const responsiveEnabled =
                    device.value === "desktop" ||
                    Boolean(
                        settings.responsive[
                            device.value
                        ]?.enabled
                    );

                const layout = resolveDividerLayoutForDevice(
                    settings,
                    device.value
                );

                let status = "Desktop übernehmen";

                if (device.value === "desktop") {
                    status = layout.orientation === "vertical"
                        ? "Vertikal · Basis"
                        : "Horizontal · Basis";
                } else if (responsiveEnabled) {
                    status = layout.orientation === "vertical"
                        ? "Vertikal · Eigen"
                        : "Horizontal · Eigen";
                }

                return (
                    <button
                        key={device.value}
                        type="button"
                        className={
                            active
                                ? "builder-divider-settings__device builder-divider-settings__device--active"
                                : "builder-divider-settings__device"
                        }
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange?.(device.value)}
                    >
                        <span className="builder-divider-settings__device-icon">
                            <i
                                className={`bi ${device.icon}`}
                                aria-hidden="true"
                            />
                        </span>

                        <span className="builder-divider-settings__device-content">
                            <strong>{device.label}</strong>
                            <small>{status}</small>
                        </span>

                        <i
                            className={
                                responsiveEnabled
                                    ? "bi bi-check-circle-fill"
                                    : "bi bi-link-45deg"
                            }
                            aria-hidden="true"
                        />
                    </button>
                );
            })}
        </div>
    );
}

function ResponsiveOverride({
    device,
    enabled,
    onEnable,
    onDisable
}) {
    if (device === "desktop") {
        return (
            <div className="builder-divider-settings__inheritance">
                <span className="builder-divider-settings__inheritance-icon">
                    <i
                        className="bi bi-display"
                        aria-hidden="true"
                    />
                </span>

                <div>
                    <strong>Desktop ist die Basis</strong>
                    <p>
                        Tablet und Mobil können die Desktop-Einstellungen
                        übernehmen oder eigene Werte verwenden.
                    </p>
                </div>
            </div>
        );
    }

    const deviceLabel = device === "tablet"
        ? "Tablet"
        : "Mobil";

    return (
        <div
            className={
                enabled
                    ? "builder-divider-settings__inheritance builder-divider-settings__inheritance--enabled"
                    : "builder-divider-settings__inheritance"
            }
        >
            <span className="builder-divider-settings__inheritance-icon">
                <i
                    className={
                        enabled
                            ? "bi bi-sliders"
                            : "bi bi-link-45deg"
                    }
                    aria-hidden="true"
                />
            </span>

            <div>
                <strong>
                    {enabled
                        ? `Eigene ${deviceLabel}-Werte`
                        : `${deviceLabel} übernimmt Desktop`}
                </strong>

                <p>
                    {enabled
                        ? "Ausrichtung, Maße, Position und Abstände werden getrennt gespeichert."
                        : "Aktiviere eigene Werte für eine responsive Darstellung."}
                </p>
            </div>

            <button
                type="button"
                onClick={enabled ? onDisable : onEnable}
            >
                <i
                    className={
                        enabled
                            ? "bi bi-link-45deg"
                            : "bi bi-sliders"
                    }
                    aria-hidden="true"
                />

                {enabled
                    ? "Desktop übernehmen"
                    : "Eigene Werte"}
            </button>
        </div>
    );
}

function OrientationControl({
    value,
    disabled,
    onChange
}) {
    return (
        <div className="builder-divider-settings__field">
            <span className="builder-divider-settings__label">
                Ausrichtung
            </span>

            <div
                className="builder-divider-settings__orientation"
                role="group"
                aria-label="Ausrichtung des Trenners"
            >
                {DIVIDER_ORIENTATION_OPTIONS.map((option) => {
                    const active = option.value === value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            className={
                                active
                                    ? "builder-divider-settings__orientation-button builder-divider-settings__orientation-button--active"
                                    : "builder-divider-settings__orientation-button"
                            }
                            disabled={disabled}
                            aria-pressed={active}
                            onClick={() => onChange?.(option.value)}
                        >
                            <span className="builder-divider-settings__orientation-preview">
                                <i
                                    className={
                                        option.value === "vertical"
                                            ? "bi bi-distribute-vertical"
                                            : "bi bi-dash-lg"
                                    }
                                    aria-hidden="true"
                                />
                            </span>

                            <strong>{option.label}</strong>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function AlignmentControl({
    orientation,
    value,
    disabled,
    onChange
}) {
    const options = orientation === "vertical"
        ? DIVIDER_VERTICAL_ALIGNMENT_OPTIONS
        : DIVIDER_HORIZONTAL_ALIGNMENT_OPTIONS;

    function getIcon(optionValue) {
        if (orientation === "vertical") {
            if (optionValue === "start") {
                return "bi-align-top";
            }

            if (optionValue === "end") {
                return "bi-align-bottom";
            }

            return "bi-align-middle";
        }

        if (optionValue === "start") {
            return "bi-align-start";
        }

        if (optionValue === "end") {
            return "bi-align-end";
        }

        return "bi-align-center";
    }

    return (
        <div className="builder-divider-settings__field">
            <span className="builder-divider-settings__label">
                Position
            </span>

            <div
                className="builder-divider-settings__alignment"
                role="group"
                aria-label="Position des Trenners"
            >
                {options.map((option) => {
                    const active = option.value === value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            className={
                                active
                                    ? "builder-divider-settings__alignment-button builder-divider-settings__alignment-button--active"
                                    : "builder-divider-settings__alignment-button"
                            }
                            disabled={disabled}
                            aria-pressed={active}
                            onClick={() => onChange?.(option.value)}
                        >
                            <i
                                className={`bi ${getIcon(option.value)}`}
                                aria-hidden="true"
                            />

                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function DividerPreview({
    layout
}) {
    const vertical = layout.orientation === "vertical";

    const previewLength = layout.lengthMode === "stretch"
        ? "100%"
        : layout.lengthMode === "pixels"
            ? `${Math.min(layout.length, 180)}px`
            : `${layout.length}%`;

    const previewStyle = {
        "--builder-divider-preview-color": layout.color,
        "--builder-divider-preview-opacity": layout.opacity / 100,
        "--builder-divider-preview-thickness": `${layout.thickness}px`,
        "--builder-divider-preview-length": previewLength
    };

    return (
        <section className="builder-divider-settings__preview">
            <header>
                <span>
                    <i
                        className="bi bi-eye"
                        aria-hidden="true"
                    />

                    Live-Vorschau
                </span>

                <small>
                    {vertical ? "Vertikal" : "Horizontal"}
                </small>
            </header>

            <div
                className={
                    vertical
                        ? "builder-divider-settings__preview-canvas builder-divider-settings__preview-canvas--vertical"
                        : "builder-divider-settings__preview-canvas"
                }
                data-alignment={layout.alignment}
            >
                <div
                    className={[
                        "builder-divider-settings__preview-divider",
                        vertical
                            ? "builder-divider-settings__preview-divider--vertical"
                            : "builder-divider-settings__preview-divider--horizontal",
                        `builder-divider-settings__preview-divider--${layout.style}`
                    ].join(" ")}
                    style={previewStyle}
                />

                {!vertical &&
                    layout.showLabel &&
                    layout.label && (
                        <span className="builder-divider-settings__preview-label">
                            {layout.label}
                        </span>
                    )}
            </div>
        </section>
    );
}

export default function DividerProperties({
    block,
    onChange
}) {
    const {
        activeViewport,
        setActiveViewport
    } = useBuilderViewport();

    const activeDevice = VALID_DEVICES.has(activeViewport)
        ? activeViewport
        : "desktop";

    const settings = getDividerBlockSettings(
        block.data
    );

    const activeLayout = resolveDividerLayoutForDevice(
        settings,
        activeDevice
    );

    const responsiveEnabled =
        activeDevice === "desktop" ||
        Boolean(
            settings.responsive[
                activeDevice
            ]?.enabled
        );

    const vertical = activeLayout.orientation === "vertical";

    function updateSettings(patch) {
        onChange?.(
            updateDividerBlockSettings(
                block,
                patch
            )
        );
    }

    function updateResponsive(device, patch) {
        onChange?.(
            updateResponsiveDividerBlockSettings(
                block,
                device,
                patch
            )
        );
    }

    function updateActiveLayout(patch) {
        if (activeDevice === "desktop") {
            updateSettings(patch);
            return;
        }

        if (!responsiveEnabled) {
            return;
        }

        updateResponsive(
            activeDevice,
            patch
        );
    }

    function updateSharedAppearance(patch) {
        updateSettings({
            ...patch,

            responsive: {
                tablet: {
                    ...patch
                },

                mobile: {
                    ...patch
                }
            }
        });
    }

    function enableResponsive() {
        if (activeDevice === "desktop") {
            return;
        }

        const desktopLayout = resolveDividerLayoutForDevice(
            settings,
            "desktop"
        );

        const responsiveLayout = activeDevice === "mobile"
            ? {
                ...desktopLayout,
                enabled: true,
                orientation: "horizontal",
                lengthMode:
                    desktopLayout.lengthMode === "stretch"
                        ? "percent"
                        : desktopLayout.lengthMode,
                length:
                    desktopLayout.lengthMode === "stretch"
                        ? 100
                        : desktopLayout.length,
                alignment: "center"
            }
            : {
                ...desktopLayout,
                enabled: true
            };

        updateResponsive(
            activeDevice,
            responsiveLayout
        );
    }

    function disableResponsive() {
        if (activeDevice === "desktop") {
            return;
        }

        updateResponsive(
            activeDevice,
            {
                enabled: false
            }
        );
    }

    function changeOrientation(orientation) {
        if (orientation === activeLayout.orientation) {
            return;
        }

        if (orientation === "vertical") {
            updateActiveLayout({
                orientation: "vertical",
                lengthMode: "pixels",
                length:
                    activeLayout.lengthMode === "pixels"
                        ? Math.max(activeLayout.length, 120)
                        : 240,
                alignment: "center",
                verticalMinHeight: Math.max(
                    activeLayout.verticalMinHeight,
                    240
                )
            });

            return;
        }

        updateActiveLayout({
            orientation: "horizontal",
            lengthMode:
                activeLayout.lengthMode === "stretch"
                    ? "percent"
                    : activeLayout.lengthMode,
            length:
                activeLayout.lengthMode === "percent"
                    ? Math.min(activeLayout.length, 100)
                    : activeLayout.length,
            alignment: "center"
        });
    }

    function changeLengthMode(lengthMode) {
        if (lengthMode === activeLayout.lengthMode) {
            return;
        }

        let length = activeLayout.length;

        if (lengthMode === "percent") {
            length = Math.min(
                Math.max(length, 10),
                100
            );
        }

        if (lengthMode === "pixels") {
            length = Math.max(
                length,
                vertical ? 120 : 200
            );
        }

        updateActiveLayout({
            lengthMode,
            length
        });
    }

    function resetActiveDevice() {
        const defaults = getDividerBlockSettings(
            createDefaultDividerBlockData()
        );

        if (activeDevice === "desktop") {
            updateSettings({
                orientation: defaults.orientation,
                lengthMode: defaults.lengthMode,
                length: defaults.length,
                alignment: defaults.alignment,
                spacingBefore: defaults.spacingBefore,
                spacingAfter: defaults.spacingAfter,
                verticalMinHeight: defaults.verticalMinHeight
            });

            return;
        }

        updateResponsive(
            activeDevice,
            {
                ...resolveDividerLayoutForDevice(
                    defaults,
                    activeDevice
                ),
                enabled: false
            }
        );
    }

    function resetAllSettings() {
        onChange?.({
            ...block,
            data: createDefaultDividerBlockData()
        });

        setActiveViewport("desktop");
    }

    return (
        <div className="builder-divider-settings">
            <DividerPreview
                layout={activeLayout}
            />

            <section className="builder-divider-settings__responsive-panel">
                <header className="builder-divider-settings__section-header">
                    <span>
                        <i
                            className="bi bi-display"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <span className="builder-divider-settings__eyebrow">
                            Responsive Trenner
                        </span>

                        <h4>Gerätegröße auswählen</h4>

                        <p>
                            Die Auswahl wechselt gleichzeitig die Ansicht der Leinwand.
                        </p>
                    </div>
                </header>

                <DeviceSwitcher
                    activeDevice={activeDevice}
                    settings={settings}
                    onChange={setActiveViewport}
                />

                <ResponsiveOverride
                    device={activeDevice}
                    enabled={responsiveEnabled}
                    onEnable={enableResponsive}
                    onDisable={disableResponsive}
                />
            </section>

            <fieldset
                className="builder-divider-settings__responsive-fields"
                disabled={!responsiveEnabled}
            >
                <section className="builder-divider-settings__section">
                    <header className="builder-divider-settings__section-header">
                        <span>
                            <i
                                className="bi bi-arrows-move"
                                aria-hidden="true"
                            />
                        </span>

                        <div>
                            <h4>Ausrichtung und Position</h4>
                            <p>
                                Stelle den Trenner horizontal oder vertikal dar.
                            </p>
                        </div>
                    </header>

                    <OrientationControl
                        value={activeLayout.orientation}
                        disabled={!responsiveEnabled}
                        onChange={changeOrientation}
                    />

                    <AlignmentControl
                        orientation={activeLayout.orientation}
                        value={activeLayout.alignment}
                        disabled={!responsiveEnabled}
                        onChange={(alignment) =>
                            updateActiveLayout({
                                alignment
                            })
                        }
                    />
                </section>

                <section className="builder-divider-settings__section">
                    <header className="builder-divider-settings__section-header">
                        <span>
                            <i
                                className={
                                    vertical
                                        ? "bi bi-arrows-expand-vertical"
                                        : "bi bi-arrows-expand"
                                }
                                aria-hidden="true"
                            />
                        </span>

                        <div>
                            <h4>{vertical ? "Höhe" : "Länge"}</h4>
                            <p>
                                {vertical
                                    ? "Nutze eine feste Höhe oder den verfügbaren Platz der Spalte."
                                    : "Bestimme die Breite in Prozent oder Pixel."}
                            </p>
                        </div>
                    </header>

                    <div className="builder-divider-settings__grid">
                        <SelectField
                            label={vertical ? "Höhenmodus" : "Einheit"}
                            value={activeLayout.lengthMode}
                            options={
                                vertical
                                    ? DIVIDER_LENGTH_MODE_OPTIONS.filter(
                                        (option) => option.value !== "percent"
                                    )
                                    : DIVIDER_LENGTH_MODE_OPTIONS.filter(
                                        (option) => option.value !== "stretch"
                                    )
                            }
                            disabled={!responsiveEnabled}
                            onChange={changeLengthMode}
                        />

                        {activeLayout.lengthMode !== "stretch" && (
                            <NumericField
                                label={vertical ? "Höhe" : "Länge"}
                                value={activeLayout.length}
                                minimum={
                                    activeLayout.lengthMode === "percent"
                                        ? 10
                                        : 20
                                }
                                maximum={
                                    activeLayout.lengthMode === "percent"
                                        ? 100
                                        : 2400
                                }
                                suffix={
                                    activeLayout.lengthMode === "percent"
                                        ? "%"
                                        : "px"
                                }
                                disabled={!responsiveEnabled}
                                onChange={(length) =>
                                    updateActiveLayout({
                                        length
                                    })
                                }
                            />
                        )}
                    </div>

                    {vertical &&
                        activeLayout.lengthMode === "stretch" && (
                            <>
                                <NumericField
                                    label="Mindesthöhe"
                                    value={activeLayout.verticalMinHeight}
                                    minimum={40}
                                    maximum={2000}
                                    disabled={!responsiveEnabled}
                                    onChange={(verticalMinHeight) =>
                                        updateActiveLayout({
                                            verticalMinHeight
                                        })
                                    }
                                />

                                <div className="builder-divider-settings__notice">
                                    <i
                                        className="bi bi-info-circle"
                                        aria-hidden="true"
                                    />

                                    <span>
                                        Die verfügbare Höhe funktioniert am besten in einer eigenen schmalen Spalte zwischen zwei Inhaltsbereichen.
                                    </span>
                                </div>
                            </>
                        )}
                </section>

                <section className="builder-divider-settings__section">
                    <header className="builder-divider-settings__section-header">
                        <span>
                            <i
                                className="bi bi-arrows-angle-expand"
                                aria-hidden="true"
                            />
                        </span>

                        <div>
                            <h4>Abstände</h4>
                            <p>
                                {vertical
                                    ? "Freiraum links und rechts neben der Linie."
                                    : "Freiraum oberhalb und unterhalb der Linie."}
                            </p>
                        </div>
                    </header>

                    <div className="builder-divider-settings__grid">
                        <NumericField
                            label={
                                vertical
                                    ? "Abstand links"
                                    : "Abstand oben"
                            }
                            value={activeLayout.spacingBefore}
                            minimum={0}
                            maximum={240}
                            disabled={!responsiveEnabled}
                            onChange={(spacingBefore) =>
                                updateActiveLayout({
                                    spacingBefore
                                })
                            }
                        />

                        <NumericField
                            label={
                                vertical
                                    ? "Abstand rechts"
                                    : "Abstand unten"
                            }
                            value={activeLayout.spacingAfter}
                            minimum={0}
                            maximum={240}
                            disabled={!responsiveEnabled}
                            onChange={(spacingAfter) =>
                                updateActiveLayout({
                                    spacingAfter
                                })
                            }
                        />
                    </div>
                </section>

                <button
                    type="button"
                    className="builder-divider-settings__device-reset"
                    disabled={!responsiveEnabled}
                    onClick={resetActiveDevice}
                >
                    <i
                        className="bi bi-arrow-counterclockwise"
                        aria-hidden="true"
                    />

                    Einstellungen dieser Ansicht zurücksetzen
                </button>
            </fieldset>

            <section className="builder-divider-settings__section">
                <header className="builder-divider-settings__section-header">
                    <span>
                        <i
                            className="bi bi-palette"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <h4>Liniengestaltung</h4>
                        <p>
                            Diese Werte gelten für Desktop, Tablet und Mobil.
                        </p>
                    </div>
                </header>

                <SelectField
                    label="Linienart"
                    value={settings.style}
                    options={DIVIDER_STYLE_OPTIONS}
                    onChange={(style) =>
                        updateSharedAppearance({
                            style
                        })
                    }
                />

                <ColorField
                    label="Linienfarbe"
                    value={settings.color}
                    onChange={(color) =>
                        updateSharedAppearance({
                            color
                        })
                    }
                />

                <div className="builder-divider-settings__grid">
                    <NumericField
                        label="Stärke"
                        value={settings.thickness}
                        minimum={1}
                        maximum={32}
                        onChange={(thickness) =>
                            updateSharedAppearance({
                                thickness
                            })
                        }
                    />

                    <NumericField
                        label="Deckkraft"
                        value={settings.opacity}
                        minimum={5}
                        maximum={100}
                        suffix="%"
                        onChange={(opacity) =>
                            updateSharedAppearance({
                                opacity
                            })
                        }
                    />
                </div>
            </section>

            <section className="builder-divider-settings__section">
                <header className="builder-divider-settings__section-header">
                    <span>
                        <i
                            className="bi bi-fonts"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <h4>Beschriftung</h4>
                        <p>
                            Beschriftungen werden bei horizontalen Trennern zwischen den Linien dargestellt.
                        </p>
                    </div>
                </header>

                <label className="builder-divider-settings__switch">
                    <span>
                        <strong>Beschriftung anzeigen</strong>
                        <small>
                            {settings.showLabel
                                ? "Die Beschriftung ist aktiv."
                                : "Der Trenner wird ohne Text dargestellt."}
                        </small>
                    </span>

                    <input
                        type="checkbox"
                        checked={settings.showLabel}
                        onChange={(event) =>
                            updateSharedAppearance({
                                showLabel: event.target.checked
                            })
                        }
                    />
                </label>

                <label className="builder-divider-settings__field">
                    <span className="builder-divider-settings__label">
                        Text
                    </span>

                    <input
                        type="text"
                        value={settings.label}
                        maxLength="120"
                        disabled={!settings.showLabel}
                        onChange={(event) =>
                            updateSharedAppearance({
                                label: event.target.value
                            })
                        }
                    />
                </label>

                {vertical && settings.showLabel && (
                    <div className="builder-divider-settings__notice">
                        <i
                            className="bi bi-info-circle"
                            aria-hidden="true"
                        />

                        <span>
                            Bei vertikaler Ausrichtung wird die Beschriftung ausgeblendet. Sie bleibt gespeichert und erscheint wieder, sobald der Trenner horizontal dargestellt wird.
                        </span>
                    </div>
                )}
            </section>

            <button
                type="button"
                className="builder-divider-settings__reset-all"
                onClick={resetAllSettings}
            >
                <i
                    className="bi bi-arrow-counterclockwise"
                    aria-hidden="true"
                />

                Alle Trenner-Einstellungen zurücksetzen
            </button>
        </div>
    );
}
