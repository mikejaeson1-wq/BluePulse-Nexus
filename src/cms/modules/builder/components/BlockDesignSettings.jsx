import "./BlockSettingsControls.css";
import "./BlockResponsiveControls.css";

import {
    useMemo
} from "react";

import {
    BLOCK_ALIGNMENT_OPTIONS,
    BLOCK_BORDER_STYLE_OPTIONS,
    BLOCK_DEVICE_OPTIONS,
    BLOCK_OVERFLOW_OPTIONS,
    BLOCK_SHADOW_OPTIONS,
    BLOCK_WIDTH_OPTIONS,
    createDefaultBlockSettings,
    getBlockSettings,
    resolveBlockDesignForDevice,
    updateBlockDesignSettings,
    updateBlockResponsiveDesignSettings
} from "@shared/pages/blockSettings";

import {
    useBuilderViewport
} from "../context/BuilderViewportContext";

const RESPONSIVE_DEVICES =
    new Set([
        "tablet",
        "mobile"
    ]);

const LAYOUT_KEYS = [
    "width",
    "customWidth",
    "alignment",
    "marginTop",
    "marginBottom",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft"
];

function isValidDevice(
    device
) {
    return BLOCK_DEVICE_OPTIONS.some(
        (option) =>
            option.value ===
            device
    );
}

function createLayoutPatch(
    source
) {
    return LAYOUT_KEYS.reduce(
        (
            result,
            key
        ) => ({
            ...result,

            [
                key
            ]:
                source[
                    key
                ]
        }),
        {}
    );
}

function NumericField({
    label,
    value,
    minimum,
    maximum,
    suffix = "px",
    onChange
}) {
    function handleChange(
        event
    ) {
        const rawValue =
            event.target.value;

        if (
            rawValue ===
            ""
        ) {
            return;
        }

        onChange(
            Number(
                rawValue
            )
        );
    }

    return (
        <label className="builder-block-settings__numeric-field">
            <span>
                {
                    label
                }
            </span>

            <div className="builder-block-settings__numeric-control">
                <input
                    type="number"
                    min={
                        minimum
                    }
                    max={
                        maximum
                    }
                    value={
                        value
                    }
                    onChange={
                        handleChange
                    }
                />

                <small>
                    {
                        suffix
                    }
                </small>
            </div>
        </label>
    );
}

function ColorField({
    label,
    value,
    onChange
}) {
    const colorPickerValue =
        /^#[0-9a-f]{6}$/i.test(
            value
        )
            ? value
            : "#0f172a";

    return (
        <label className="builder-block-settings__field">
            <span className="builder-block-settings__field-label">
                {
                    label
                }
            </span>

            <div className="builder-block-settings__color-control">
                <input
                    type="color"
                    value={
                        colorPickerValue
                    }
                    aria-label={
                        `${label} auswählen`
                    }
                    onChange={
                        (event) =>
                            onChange(
                                event.target.value
                            )
                    }
                />

                <input
                    type="text"
                    value={
                        value
                    }
                    spellCheck="false"
                    onChange={
                        (event) =>
                            onChange(
                                event.target.value
                            )
                    }
                />
            </div>
        </label>
    );
}

function SelectField({
    label,
    value,
    options,
    onChange
}) {
    return (
        <label className="builder-block-settings__field">
            <span className="builder-block-settings__field-label">
                {
                    label
                }
            </span>

            <select
                value={
                    value
                }
                onChange={
                    (event) =>
                        onChange(
                            event.target.value
                        )
                }
            >
                {
                    options.map(
                        (option) => (
                            <option
                                key={
                                    option.value
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
    );
}

function DeviceSwitcher({
    activeDevice,
    design,
    onChange
}) {
    return (
        <div
            className="builder-responsive-design__devices"
            role="tablist"
            aria-label="Gerätegröße für Layout-Einstellungen"
        >
            {
                BLOCK_DEVICE_OPTIONS.map(
                    (device) => {
                        const active =
                            activeDevice ===
                            device.value;

                        const responsiveEnabled =
                            device.value ===
                                "desktop" ||
                            Boolean(
                                design
                                    .responsive?.[
                                    device.value
                                ]?.enabled
                            );

                        return (
                            <button
                                key={
                                    device.value
                                }
                                type="button"
                                className={
                                    active
                                        ? "builder-responsive-design__device builder-responsive-design__device--active"
                                        : "builder-responsive-design__device"
                                }
                                role="tab"
                                aria-selected={
                                    active
                                }
                                tabIndex={
                                    active
                                        ? 0
                                        : -1
                                }
                                title={
                                    `${device.description} · Canvas ebenfalls wechseln`
                                }
                                onClick={
                                    () =>
                                        onChange(
                                            device.value
                                        )
                                }
                            >
                                <span className="builder-responsive-design__device-icon">
                                    <i
                                        className={
                                            `bi ${device.icon}`
                                        }
                                        aria-hidden="true"
                                    />
                                </span>

                                <span className="builder-responsive-design__device-content">
                                    <strong>
                                        {
                                            device.label
                                        }
                                    </strong>

                                    <small>
                                        {
                                            device.value ===
                                            "desktop"
                                                ? "Basis"
                                                : responsiveEnabled
                                                    ? "Eigene Werte"
                                                    : "Übernimmt Desktop"
                                        }
                                    </small>
                                </span>

                                <span
                                    className={
                                        responsiveEnabled
                                            ? "builder-responsive-design__device-status builder-responsive-design__device-status--custom"
                                            : "builder-responsive-design__device-status"
                                    }
                                    aria-hidden="true"
                                >
                                    <i
                                        className={
                                            responsiveEnabled
                                                ? "bi bi-check-circle-fill"
                                                : "bi bi-link-45deg"
                                        }
                                    />
                                </span>
                            </button>
                        );
                    }
                )
            }
        </div>
    );
}

function ResponsiveOverride({
    activeDevice,
    deviceLabel,
    enabled,
    onEnable,
    onDisable
}) {
    if (
        activeDevice ===
        "desktop"
    ) {
        return (
            <div className="builder-responsive-design__base-notice">
                <span className="builder-responsive-design__base-icon">
                    <i
                        className="bi bi-display"
                        aria-hidden="true"
                    />
                </span>

                <div>
                    <strong>
                        Desktop ist die Layout-Basis
                    </strong>

                    <p>
                        Tablet und Mobil übernehmen diese Werte, solange dort keine eigenen Einstellungen aktiviert sind.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={
                enabled
                    ? "builder-responsive-design__override builder-responsive-design__override--enabled"
                    : "builder-responsive-design__override"
            }
        >
            <span className="builder-responsive-design__override-icon">
                <i
                    className={
                        enabled
                            ? "bi bi-sliders"
                            : "bi bi-link-45deg"
                    }
                    aria-hidden="true"
                />
            </span>

            <div className="builder-responsive-design__override-content">
                <strong>
                    {
                        enabled
                            ? `Eigene ${deviceLabel}-Werte aktiv`
                            : `${deviceLabel} übernimmt Desktop`
                    }
                </strong>

                <p>
                    {
                        enabled
                            ? "Breite, Ausrichtung und Abstände werden für dieses Gerät getrennt gespeichert."
                            : "Aktiviere eigene Werte, um das Layout auf dieser Gerätegröße individuell anzupassen."
                    }
                </p>
            </div>

            <button
                type="button"
                className={
                    enabled
                        ? "builder-responsive-design__override-button builder-responsive-design__override-button--disable"
                        : "builder-responsive-design__override-button"
                }
                onClick={
                    enabled
                        ? onDisable
                        : onEnable
                }
            >
                <i
                    className={
                        enabled
                            ? "bi bi-link-45deg"
                            : "bi bi-sliders"
                    }
                    aria-hidden="true"
                />

                {
                    enabled
                        ? "Desktop übernehmen"
                        : "Eigene Werte"
                }
            </button>
        </div>
    );
}

function AlignmentControl({
    value,
    onChange
}) {
    return (
        <div className="builder-block-settings__field">
            <span className="builder-block-settings__field-label">
                Ausrichtung
            </span>

            <div
                className="builder-block-settings__segmented"
                role="group"
                aria-label="Blockausrichtung"
            >
                {
                    BLOCK_ALIGNMENT_OPTIONS.map(
                        (option) => {
                            const active =
                                value ===
                                option.value;

                            const icon =
                                option.value ===
                                "left"
                                    ? "bi-align-start"
                                    : option.value ===
                                        "right"
                                        ? "bi-align-end"
                                        : "bi-align-center";

                            return (
                                <button
                                    key={
                                        option.value
                                    }
                                    type="button"
                                    className={
                                        active
                                            ? "builder-block-settings__segment builder-block-settings__segment--active"
                                            : "builder-block-settings__segment"
                                    }
                                    aria-pressed={
                                        active
                                    }
                                    onClick={
                                        () =>
                                            onChange(
                                                option.value
                                            )
                                    }
                                >
                                    <i
                                        className={
                                            `bi ${icon}`
                                        }
                                        aria-hidden="true"
                                    />

                                    <span>
                                        {
                                            option.label
                                        }
                                    </span>
                                </button>
                            );
                        }
                    )
                }
            </div>
        </div>
    );
}

function ResponsiveLayoutFields({
    layout,
    disabled,
    activeDevice,
    onUpdate,
    onReset
}) {
    return (
        <fieldset
            className="builder-responsive-design__layout-fieldset"
            disabled={
                disabled
            }
        >
            <section className="builder-block-settings__section">
                <header className="builder-block-settings__section-header">
                    <span className="builder-block-settings__section-icon">
                        <i
                            className="bi bi-arrows-angle-expand"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <h4>
                            Breite und Ausrichtung
                        </h4>

                        <p>
                            Bestimme die Blockbreite und horizontale Position für
                            {" "}
                            {
                                activeDevice ===
                                "desktop"
                                    ? "Desktop"
                                    : activeDevice ===
                                        "tablet"
                                        ? "Tablet"
                                        : "Mobil"
                            }.
                        </p>
                    </div>
                </header>

                <SelectField
                    label="Blockbreite"
                    value={
                        layout.width
                    }
                    options={
                        BLOCK_WIDTH_OPTIONS
                    }
                    onChange={
                        (width) =>
                            onUpdate({
                                width
                            })
                    }
                />

                {
                    layout.width ===
                        "custom" && (
                        <NumericField
                            label="Maximale Breite"
                            value={
                                layout.customWidth
                            }
                            minimum={
                                240
                            }
                            maximum={
                                1920
                            }
                            onChange={
                                (customWidth) =>
                                    onUpdate({
                                        customWidth
                                    })
                            }
                        />
                    )
                }

                <AlignmentControl
                    value={
                        layout.alignment
                    }
                    onChange={
                        (alignment) =>
                            onUpdate({
                                alignment
                            })
                    }
                />
            </section>

            <section className="builder-block-settings__section">
                <header className="builder-block-settings__section-header">
                    <span className="builder-block-settings__section-icon">
                        <i
                            className="bi bi-distribute-vertical"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <h4>
                            Außenabstand
                        </h4>

                        <p>
                            Abstand zwischen diesem Block und benachbarten Blöcken.
                        </p>
                    </div>
                </header>

                <div className="builder-block-settings__numeric-grid builder-block-settings__numeric-grid--two">
                    <NumericField
                        label="Oben"
                        value={
                            layout.marginTop
                        }
                        minimum={
                            0
                        }
                        maximum={
                            400
                        }
                        onChange={
                            (marginTop) =>
                                onUpdate({
                                    marginTop
                                })
                        }
                    />

                    <NumericField
                        label="Unten"
                        value={
                            layout.marginBottom
                        }
                        minimum={
                            0
                        }
                        maximum={
                            400
                        }
                        onChange={
                            (marginBottom) =>
                                onUpdate({
                                    marginBottom
                                })
                        }
                    />
                </div>
            </section>

            <section className="builder-block-settings__section">
                <header className="builder-block-settings__section-header">
                    <span className="builder-block-settings__section-icon">
                        <i
                            className="bi bi-bounding-box"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <h4>
                            Innenabstand
                        </h4>

                        <p>
                            Abstand zwischen dem Blockrahmen und seinem Inhalt.
                        </p>
                    </div>
                </header>

                <div className="builder-block-settings__numeric-grid">
                    <NumericField
                        label="Oben"
                        value={
                            layout.paddingTop
                        }
                        minimum={
                            0
                        }
                        maximum={
                            300
                        }
                        onChange={
                            (paddingTop) =>
                                onUpdate({
                                    paddingTop
                                })
                        }
                    />

                    <NumericField
                        label="Rechts"
                        value={
                            layout.paddingRight
                        }
                        minimum={
                            0
                        }
                        maximum={
                            300
                        }
                        onChange={
                            (paddingRight) =>
                                onUpdate({
                                    paddingRight
                                })
                        }
                    />

                    <NumericField
                        label="Unten"
                        value={
                            layout.paddingBottom
                        }
                        minimum={
                            0
                        }
                        maximum={
                            300
                        }
                        onChange={
                            (paddingBottom) =>
                                onUpdate({
                                    paddingBottom
                                })
                        }
                    />

                    <NumericField
                        label="Links"
                        value={
                            layout.paddingLeft
                        }
                        minimum={
                            0
                        }
                        maximum={
                            300
                        }
                        onChange={
                            (paddingLeft) =>
                                onUpdate({
                                    paddingLeft
                                })
                        }
                    />
                </div>
            </section>

            <button
                type="button"
                className="builder-responsive-design__device-reset"
                onClick={
                    onReset
                }
            >
                <i
                    className="bi bi-arrow-counterclockwise"
                    aria-hidden="true"
                />

                {
                    activeDevice ===
                    "desktop"
                        ? "Desktop-Layout zurücksetzen"
                        : `${
                            activeDevice ===
                            "tablet"
                                ? "Tablet"
                                : "Mobil"
                        }-Layout zurücksetzen`
                }
            </button>
        </fieldset>
    );
}

export default function BlockDesignSettings({
    block,
    onChange
}) {
    const {
        activeViewport,
        setActiveViewport
    } =
        useBuilderViewport();

    const activeDevice =
        isValidDevice(
            activeViewport
        )
            ? activeViewport
            : "desktop";

    const settings =
        getBlockSettings(
            block
        );

    const design =
        settings.design;

    const activeDeviceOption =
        BLOCK_DEVICE_OPTIONS.find(
            (device) =>
                device.value ===
                activeDevice
        ) ??
        BLOCK_DEVICE_OPTIONS[0];

    const responsiveEnabled =
        activeDevice ===
            "desktop" ||
        Boolean(
            design
                .responsive?.[
                activeDevice
            ]?.enabled
        );

    const activeLayout =
        useMemo(
            () =>
                resolveBlockDesignForDevice(
                    design,
                    activeDevice
                ),
            [
                activeDevice,
                design
            ]
        );

    function updateSharedDesign(
        patch
    ) {
        onChange?.(
            updateBlockDesignSettings(
                block,
                patch
            )
        );
    }

    function updateActiveLayout(
        patch
    ) {
        if (
            activeDevice ===
            "desktop"
        ) {
            updateSharedDesign(
                patch
            );

            return;
        }

        if (
            !responsiveEnabled ||
            !RESPONSIVE_DEVICES.has(
                activeDevice
            )
        ) {
            return;
        }

        onChange?.(
            updateBlockResponsiveDesignSettings(
                block,
                activeDevice,
                patch
            )
        );
    }

    function enableResponsiveValues() {
        if (
            !RESPONSIVE_DEVICES.has(
                activeDevice
            )
        ) {
            return;
        }

        const desktopLayout =
            resolveBlockDesignForDevice(
                design,
                "desktop"
            );

        onChange?.(
            updateBlockResponsiveDesignSettings(
                block,
                activeDevice,
                {
                    enabled:
                        true,

                    ...createLayoutPatch(
                        desktopLayout
                    )
                }
            )
        );
    }

    function disableResponsiveValues() {
        if (
            !RESPONSIVE_DEVICES.has(
                activeDevice
            )
        ) {
            return;
        }

        onChange?.(
            updateBlockResponsiveDesignSettings(
                block,
                activeDevice,
                {
                    enabled:
                        false
                }
            )
        );
    }

    function resetActiveLayout() {
        if (
            activeDevice ===
            "desktop"
        ) {
            const defaults =
                createDefaultBlockSettings();

            updateSharedDesign(
                createLayoutPatch(
                    defaults.design
                )
            );

            return;
        }

        const desktopLayout =
            resolveBlockDesignForDevice(
                design,
                "desktop"
            );

        onChange?.(
            updateBlockResponsiveDesignSettings(
                block,
                activeDevice,
                {
                    enabled:
                        false,

                    ...createLayoutPatch(
                        desktopLayout
                    )
                }
            )
        );
    }

    function resetDesign() {
        const defaults =
            createDefaultBlockSettings();

        onChange?.(
            updateBlockDesignSettings(
                block,
                defaults.design
            )
        );
    }

    return (
        <div className="builder-block-settings">
            <section className="builder-responsive-design">
                <header className="builder-responsive-design__header">
                    <span className="builder-responsive-design__header-icon">
                        <i
                            className="bi bi-display"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <span className="builder-responsive-design__eyebrow">
                            Responsive Layout
                        </span>

                        <h3>
                            Gerätegröße auswählen
                        </h3>

                        <p>
                            Die Auswahl ist jetzt direkt mit der Canvas-Geräteansicht verbunden.
                        </p>
                    </div>
                </header>

                <DeviceSwitcher
                    activeDevice={
                        activeDevice
                    }
                    design={
                        design
                    }
                    onChange={
                        setActiveViewport
                    }
                />

                <ResponsiveOverride
                    activeDevice={
                        activeDevice
                    }
                    deviceLabel={
                        activeDeviceOption.label
                    }
                    enabled={
                        responsiveEnabled
                    }
                    onEnable={
                        enableResponsiveValues
                    }
                    onDisable={
                        disableResponsiveValues
                    }
                />
            </section>

            <ResponsiveLayoutFields
                layout={
                    activeLayout
                }
                disabled={
                    !responsiveEnabled
                }
                activeDevice={
                    activeDevice
                }
                onUpdate={
                    updateActiveLayout
                }
                onReset={
                    resetActiveLayout
                }
            />

            <div className="builder-responsive-design__shared-heading">
                <span className="builder-responsive-design__shared-icon">
                    <i
                        className="bi bi-palette"
                        aria-hidden="true"
                    />
                </span>

                <div>
                    <span>
                        Gemeinsame Darstellung
                    </span>

                    <p>
                        Die folgenden Einstellungen gelten auf allen Gerätegrößen.
                    </p>
                </div>
            </div>

            <section className="builder-block-settings__section">
                <header className="builder-block-settings__section-header">
                    <span className="builder-block-settings__section-icon">
                        <i
                            className="bi bi-paint-bucket"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <h4>
                            Hintergrund
                        </h4>

                        <p>
                            Optionaler Hintergrund für den gesamten Block.
                        </p>
                    </div>
                </header>

                <label className="builder-block-settings__switch-row">
                    <span>
                        <strong>
                            Hintergrund verwenden
                        </strong>

                        <small>
                            Aktiviert eine eigene Hintergrundfarbe.
                        </small>
                    </span>

                    <input
                        type="checkbox"
                        checked={
                            design.backgroundEnabled
                        }
                        onChange={
                            (event) =>
                                updateSharedDesign({
                                    backgroundEnabled:
                                        event.target.checked
                                })
                        }
                    />
                </label>

                {
                    design.backgroundEnabled && (
                        <ColorField
                            label="Hintergrundfarbe"
                            value={
                                design.backgroundColor
                            }
                            onChange={
                                (backgroundColor) =>
                                    updateSharedDesign({
                                        backgroundColor
                                    })
                            }
                        />
                    )
                }
            </section>

            <section className="builder-block-settings__section">
                <header className="builder-block-settings__section-header">
                    <span className="builder-block-settings__section-icon">
                        <i
                            className="bi bi-border-style"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <h4>
                            Rahmen
                        </h4>

                        <p>
                            Rahmenstärke, Stil, Farbe und Eckenrundung.
                        </p>
                    </div>
                </header>

                <div className="builder-block-settings__numeric-grid builder-block-settings__numeric-grid--two">
                    <NumericField
                        label="Rahmenstärke"
                        value={
                            design.borderWidth
                        }
                        minimum={
                            0
                        }
                        maximum={
                            16
                        }
                        onChange={
                            (borderWidth) =>
                                updateSharedDesign({
                                    borderWidth
                                })
                        }
                    />

                    <NumericField
                        label="Eckenrundung"
                        value={
                            design.borderRadius
                        }
                        minimum={
                            0
                        }
                        maximum={
                            100
                        }
                        onChange={
                            (borderRadius) =>
                                updateSharedDesign({
                                    borderRadius
                                })
                        }
                    />
                </div>

                {
                    design.borderWidth >
                        0 && (
                        <>
                            <SelectField
                                label="Rahmenstil"
                                value={
                                    design.borderStyle
                                }
                                options={
                                    BLOCK_BORDER_STYLE_OPTIONS
                                }
                                onChange={
                                    (borderStyle) =>
                                        updateSharedDesign({
                                            borderStyle
                                        })
                                }
                            />

                            <ColorField
                                label="Rahmenfarbe"
                                value={
                                    design.borderColor
                                }
                                onChange={
                                    (borderColor) =>
                                        updateSharedDesign({
                                            borderColor
                                        })
                                }
                            />
                        </>
                    )
                }
            </section>

            <section className="builder-block-settings__section">
                <header className="builder-block-settings__section-header">
                    <span className="builder-block-settings__section-icon">
                        <i
                            className="bi bi-layers"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <h4>
                            Darstellung
                        </h4>

                        <p>
                            Schatten und Verhalten von überstehenden Inhalten.
                        </p>
                    </div>
                </header>

                <div className="builder-block-settings__select-grid">
                    <SelectField
                        label="Schatten"
                        value={
                            design.shadow
                        }
                        options={
                            BLOCK_SHADOW_OPTIONS
                        }
                        onChange={
                            (shadow) =>
                                updateSharedDesign({
                                    shadow
                                })
                        }
                    />

                    <SelectField
                        label="Überstehender Inhalt"
                        value={
                            design.overflow
                        }
                        options={
                            BLOCK_OVERFLOW_OPTIONS
                        }
                        onChange={
                            (overflow) =>
                                updateSharedDesign({
                                    overflow
                                })
                        }
                    />
                </div>
            </section>

            <button
                type="button"
                className="builder-block-settings__reset"
                onClick={
                    resetDesign
                }
            >
                <i
                    className="bi bi-arrow-counterclockwise"
                    aria-hidden="true"
                />

                Gesamtes Design zurücksetzen
            </button>
        </div>
    );
}