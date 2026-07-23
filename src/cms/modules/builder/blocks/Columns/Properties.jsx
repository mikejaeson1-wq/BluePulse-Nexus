import "./Properties.css";

import {
    COLUMNS_COUNT_OPTIONS,
    COLUMNS_RATIO_PRESETS,
    COLUMNS_VERTICAL_ALIGNMENT_OPTIONS,
    getColumnsBlockData,
    getColumnsGridTemplate,
    getColumnsRatioLabel,
    updateColumnsBlockData
} from "@shared/layout/columnsBlockModel";

import {
    useBuilderViewport
} from "../../context/BuilderViewportContext";

const VALID_DEVICES =
    new Set([
        "desktop",
        "tablet",
        "mobile"
    ]);

const DEVICE_OPTIONS = [
    {
        value: "desktop",
        label: "Desktop",
        icon: "bi-display",
        description: "Grundlayout"
    },
    {
        value: "tablet",
        label: "Tablet",
        icon: "bi-tablet-landscape",
        description: "768 bis 1199 Pixel"
    },
    {
        value: "mobile",
        label: "Mobil",
        icon: "bi-phone",
        description: "Unter 768 Pixel"
    }
];

function NumericField({
    label,
    value,
    minimum,
    maximum,
    suffix = "px",
    onChange
}) {
    function handleChange(event) {
        const rawValue =
            event.target.value;

        if (rawValue === "") {
            return;
        }

        onChange(
            Number(
                rawValue
            )
        );
    }

    return (
        <label className="builder-columns-settings__field">
            <span className="builder-columns-settings__label">
                {
                    label
                }
            </span>

            <div className="builder-columns-settings__number">
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

function DeviceSwitcher({
    activeDevice,
    data,
    onChange
}) {
    return (
        <div
            className="builder-columns-settings__devices"
            role="tablist"
            aria-label="Gerätegröße für Spalteneinstellungen"
        >
            {
                DEVICE_OPTIONS.map(
                    (device) => {
                        const active =
                            activeDevice ===
                            device.value;

                        const stacked =
                            device.value === "desktop"
                                ? false
                                : data.responsive[
                                    device.value
                                ].stack;

                        return (
                            <button
                                key={
                                    device.value
                                }
                                type="button"
                                className={
                                    active
                                        ? "builder-columns-settings__device builder-columns-settings__device--active"
                                        : "builder-columns-settings__device"
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
                                    device.description
                                }
                                onClick={
                                    () =>
                                        onChange(
                                            device.value
                                        )
                                }
                            >
                                <span className="builder-columns-settings__device-icon">
                                    <i
                                        className={
                                            `bi ${device.icon}`
                                        }
                                        aria-hidden="true"
                                    />
                                </span>

                                <span className="builder-columns-settings__device-content">
                                    <strong>
                                        {
                                            device.label
                                        }
                                    </strong>

                                    <small>
                                        {
                                            device.value === "desktop"
                                                ? "Grundlayout"
                                                : stacked
                                                    ? "Gestapelt"
                                                    : "Nebeneinander"
                                        }
                                    </small>
                                </span>

                                <i
                                    className={
                                        device.value === "desktop"
                                            ? "bi bi-grid-3x2-gap-fill"
                                            : stacked
                                                ? "bi bi-view-stacked"
                                                : "bi bi-columns-gap"
                                    }
                                    aria-hidden="true"
                                />
                            </button>
                        );
                    }
                )
            }
        </div>
    );
}

function ColumnCountControl({
    value,
    onChange
}) {
    return (
        <div className="builder-columns-settings__count-grid">
            {
                COLUMNS_COUNT_OPTIONS.map(
                    (option) => {
                        const active =
                            value ===
                            option.value;

                        return (
                            <button
                                key={
                                    option.value
                                }
                                type="button"
                                className={
                                    active
                                        ? "builder-columns-settings__count-card builder-columns-settings__count-card--active"
                                        : "builder-columns-settings__count-card"
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
                                <span
                                    className="builder-columns-settings__count-preview"
                                    aria-hidden="true"
                                >
                                    {
                                        Array.from(
                                            {
                                                length:
                                                    option.value
                                            },
                                            (
                                                unused,
                                                index
                                            ) => (
                                                <span
                                                    key={
                                                        index
                                                    }
                                                />
                                            )
                                        )
                                    }
                                </span>

                                <strong>
                                    {
                                        option.label
                                    }
                                </strong>
                            </button>
                        );
                    }
                )
            }
        </div>
    );
}

function RatioControl({
    columnCount,
    value,
    onChange
}) {
    const presets =
        COLUMNS_RATIO_PRESETS[
            columnCount
        ] ?? [];

    return (
        <div className="builder-columns-settings__ratio-grid">
            {
                presets.map(
                    (preset) => {
                        const active =
                            value ===
                            preset.value;

                        return (
                            <button
                                key={
                                    preset.value
                                }
                                type="button"
                                className={
                                    active
                                        ? "builder-columns-settings__ratio-card builder-columns-settings__ratio-card--active"
                                        : "builder-columns-settings__ratio-card"
                                }
                                aria-pressed={
                                    active
                                }
                                onClick={
                                    () =>
                                        onChange(
                                            preset.value
                                        )
                                }
                            >
                                <span
                                    className="builder-columns-settings__ratio-preview"
                                    style={{
                                        gridTemplateColumns:
                                            preset.template
                                    }}
                                    aria-hidden="true"
                                >
                                    {
                                        preset.value
                                            .split("-")
                                            .map(
                                                (
                                                    part,
                                                    index
                                                ) => (
                                                    <span
                                                        key={
                                                            `${preset.value}-${index}`
                                                        }
                                                    />
                                                )
                                            )
                                    }
                                </span>

                                <strong>
                                    {
                                        preset.label
                                    }
                                </strong>
                            </button>
                        );
                    }
                )
            }
        </div>
    );
}

function VerticalAlignmentControl({
    value,
    onChange
}) {
    function getIcon(
        alignment
    ) {
        switch (alignment) {
            case "start":
                return "bi-align-top";

            case "center":
                return "bi-align-middle";

            case "end":
                return "bi-align-bottom";

            case "stretch":
            default:
                return "bi-arrows-expand";
        }
    }

    return (
        <div className="builder-columns-settings__field">
            <span className="builder-columns-settings__label">
                Vertikale Ausrichtung
            </span>

            <div
                className="builder-columns-settings__alignment"
                role="group"
                aria-label="Vertikale Spaltenausrichtung"
            >
                {
                    COLUMNS_VERTICAL_ALIGNMENT_OPTIONS.map(
                        (option) => {
                            const active =
                                value ===
                                option.value;

                            return (
                                <button
                                    key={
                                        option.value
                                    }
                                    type="button"
                                    className={
                                        active
                                            ? "builder-columns-settings__alignment-button builder-columns-settings__alignment-button--active"
                                            : "builder-columns-settings__alignment-button"
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
                                            `bi ${getIcon(
                                                option.value
                                            )}`
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

function ResponsiveControls({
    device,
    settings,
    onChange
}) {
    const deviceLabel =
        device === "tablet"
            ? "Tablet"
            : "Mobil";

    return (
        <>
            <label className="builder-columns-settings__switch">
                <span>
                    <strong>
                        Spalten stapeln
                    </strong>

                    <small>
                        {
                            settings.stack
                                ? `Die Spalten stehen auf ${deviceLabel} untereinander.`
                                : `Die Spalten bleiben auf ${deviceLabel} nebeneinander.`
                        }
                    </small>
                </span>

                <input
                    type="checkbox"
                    checked={
                        settings.stack
                    }
                    onChange={
                        (event) =>
                            onChange({
                                stack:
                                    event.target.checked
                            })
                    }
                />
            </label>

            <label
                className={
                    settings.stack
                        ? "builder-columns-settings__switch"
                        : "builder-columns-settings__switch builder-columns-settings__switch--disabled"
                }
            >
                <span>
                    <strong>
                        Reihenfolge umkehren
                    </strong>

                    <small>
                        Die letzte Spalte wird beim Stapeln zuerst angezeigt.
                    </small>
                </span>

                <input
                    type="checkbox"
                    checked={
                        settings.reverse
                    }
                    disabled={
                        !settings.stack
                    }
                    onChange={
                        (event) =>
                            onChange({
                                reverse:
                                    event.target.checked
                            })
                    }
                />
            </label>

            <NumericField
                label={
                    settings.stack
                        ? "Abstand zwischen gestapelten Spalten"
                        : "Spaltenabstand"
                }
                value={
                    settings.gap
                }
                minimum={
                    0
                }
                maximum={
                    160
                }
                onChange={
                    (gap) =>
                        onChange({
                            gap
                        })
                }
            />

            <div
                className={
                    settings.stack
                        ? "builder-columns-settings__responsive-preview builder-columns-settings__responsive-preview--stacked"
                        : "builder-columns-settings__responsive-preview"
                }
                data-reversed={
                    settings.reverse
                }
            >
                <span />
                <span />
                <span />
            </div>

            <div className="builder-columns-settings__responsive-status">
                <i
                    className={
                        settings.stack
                            ? "bi bi-view-stacked"
                            : "bi bi-columns-gap"
                    }
                    aria-hidden="true"
                />

                <span>
                    {
                        settings.stack
                            ? `${deviceLabel}: gestapelte Darstellung`
                            : `${deviceLabel}: Spalten nebeneinander`
                    }
                </span>
            </div>
        </>
    );
}

export default function ColumnsProperties({
    block,
    onChange
}) {
    const {
        activeViewport,
        setActiveViewport
    } =
        useBuilderViewport();

    const activeDevice =
        VALID_DEVICES.has(
            activeViewport
        )
            ? activeViewport
            : "desktop";

    const data =
        getColumnsBlockData(
            block
        );

    const nestedBlockCount =
        data.columns.reduce(
            (
                total,
                column
            ) =>
                total +
                column.blocks.length,
            0
        );

    function updateData(
        patch
    ) {
        onChange?.(
            updateColumnsBlockData(
                block,
                patch
            )
        );
    }

    function updateColumnCount(
        columnCount
    ) {
        const defaultRatio =
            COLUMNS_RATIO_PRESETS[
                columnCount
            ]?.[0]?.value;

        updateData({
            columnCount,

            ratio:
                defaultRatio
        });
    }

    function updateResponsive(
        device,
        patch
    ) {
        if (
            device !== "tablet" &&
            device !== "mobile"
        ) {
            return;
        }

        updateData({
            responsive: {
                [
                    device
                ]:
                    patch
            }
        });
    }

    function resetPresentation() {
        const defaultRatio =
            COLUMNS_RATIO_PRESETS[
                data.columnCount
            ]?.[0]?.value;

        updateData({
            ratio:
                defaultRatio,

            gap:
                24,

            verticalAlignment:
                "stretch",

            responsive: {
                tablet: {
                    stack: false,
                    reverse: false,
                    gap: 24
                },

                mobile: {
                    stack: true,
                    reverse: false,
                    gap: 16
                }
            }
        });

        setActiveViewport(
            "desktop"
        );
    }

    return (
        <div className="builder-columns-settings">
            <section className="builder-columns-settings__summary">
                <span className="builder-columns-settings__summary-icon">
                    <i
                        className="bi bi-columns-gap"
                        aria-hidden="true"
                    />
                </span>

                <div>
                    <span className="builder-columns-settings__eyebrow">
                        Layout-Container
                    </span>

                    <h4>
                        {
                            data.columnCount
                        } Spalten · {
                            getColumnsRatioLabel(
                                data
                            )
                        }
                    </h4>

                    <p>
                        {
                            nestedBlockCount
                        } verschachtelte {
                            nestedBlockCount === 1
                                ? "Block"
                                : "Blöcke"
                        }
                    </p>
                </div>
            </section>

            <section className="builder-columns-settings__responsive-panel">
                <header className="builder-columns-settings__section-header">
                    <span>
                        <i
                            className="bi bi-display"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <span className="builder-columns-settings__eyebrow">
                            Responsive Layout
                        </span>

                        <h4>
                            Gerätegröße auswählen
                        </h4>

                        <p>
                            Die Auswahl wechselt gleichzeitig die Canvas-Ansicht.
                        </p>
                    </div>
                </header>

                <DeviceSwitcher
                    activeDevice={
                        activeDevice
                    }
                    data={
                        data
                    }
                    onChange={
                        setActiveViewport
                    }
                />
            </section>

            {
                activeDevice === "desktop" ? (
                    <>
                        <section className="builder-columns-settings__section">
                            <header className="builder-columns-settings__section-header">
                                <span>
                                    <i
                                        className="bi bi-layout-three-columns"
                                        aria-hidden="true"
                                    />
                                </span>

                                <div>
                                    <h4>
                                        Spaltenanzahl
                                    </h4>

                                    <p>
                                        Wähle zwei, drei oder vier Inhaltsbereiche.
                                    </p>
                                </div>
                            </header>

                            <ColumnCountControl
                                value={
                                    data.columnCount
                                }
                                onChange={
                                    updateColumnCount
                                }
                            />

                            <div className="builder-columns-settings__notice">
                                <i
                                    className="bi bi-info-circle"
                                    aria-hidden="true"
                                />

                                <span>
                                    Beim späteren Reduzieren der Spaltenzahl werden enthaltene Blöcke nicht gelöscht, sondern in die letzte verbleibende Spalte verschoben.
                                </span>
                            </div>
                        </section>

                        <section className="builder-columns-settings__section">
                            <header className="builder-columns-settings__section-header">
                                <span>
                                    <i
                                        className="bi bi-grid-3x2-gap"
                                        aria-hidden="true"
                                    />
                                </span>

                                <div>
                                    <h4>
                                        Größenverhältnis
                                    </h4>

                                    <p>
                                        Bestimme, wie viel Platz die einzelnen Spalten erhalten.
                                    </p>
                                </div>
                            </header>

                            <RatioControl
                                columnCount={
                                    data.columnCount
                                }
                                value={
                                    data.ratio
                                }
                                onChange={
                                    (ratio) =>
                                        updateData({
                                            ratio
                                        })
                                }
                            />

                            <div className="builder-columns-settings__template-preview">
                                <span>
                                    Aktuelles Raster
                                </span>

                                <div
                                    style={{
                                        gridTemplateColumns:
                                            getColumnsGridTemplate(
                                                data
                                            )
                                    }}
                                >
                                    {
                                        data.columns.map(
                                            (
                                                column,
                                                index
                                            ) => (
                                                <span
                                                    key={
                                                        column.id
                                                    }
                                                >
                                                    {
                                                        index + 1
                                                    }
                                                </span>
                                            )
                                        )
                                    }
                                </div>
                            </div>
                        </section>

                        <section className="builder-columns-settings__section">
                            <header className="builder-columns-settings__section-header">
                                <span>
                                    <i
                                        className="bi bi-arrows-expand"
                                        aria-hidden="true"
                                    />
                                </span>

                                <div>
                                    <h4>
                                        Abstand und Ausrichtung
                                    </h4>

                                    <p>
                                        Stelle den Zwischenraum und die vertikale Position ein.
                                    </p>
                                </div>
                            </header>

                            <NumericField
                                label="Spaltenabstand"
                                value={
                                    data.gap
                                }
                                minimum={
                                    0
                                }
                                maximum={
                                    160
                                }
                                onChange={
                                    (gap) =>
                                        updateData({
                                            gap
                                        })
                                }
                            />

                            <VerticalAlignmentControl
                                value={
                                    data.verticalAlignment
                                }
                                onChange={
                                    (verticalAlignment) =>
                                        updateData({
                                            verticalAlignment
                                        })
                                }
                            />
                        </section>
                    </>
                ) : (
                    <section className="builder-columns-settings__section">
                        <header className="builder-columns-settings__section-header">
                            <span>
                                <i
                                    className={
                                        activeDevice === "tablet"
                                            ? "bi bi-tablet-landscape"
                                            : "bi bi-phone"
                                    }
                                    aria-hidden="true"
                                />
                            </span>

                            <div>
                                <h4>
                                    {
                                        activeDevice === "tablet"
                                            ? "Tablet-Darstellung"
                                            : "Mobil-Darstellung"
                                    }
                                </h4>

                                <p>
                                    Bestimme Stapelung, Reihenfolge und Abstand.
                                </p>
                            </div>
                        </header>

                        <ResponsiveControls
                            device={
                                activeDevice
                            }
                            settings={
                                data.responsive[
                                    activeDevice
                                ]
                            }
                            onChange={
                                (patch) =>
                                    updateResponsive(
                                        activeDevice,
                                        patch
                                    )
                            }
                        />
                    </section>
                )
            }

            <button
                type="button"
                className="builder-columns-settings__reset"
                onClick={
                    resetPresentation
                }
            >
                <i
                    className="bi bi-arrow-counterclockwise"
                    aria-hidden="true"
                />

                Spaltendarstellung zurücksetzen
            </button>
        </div>
    );
}