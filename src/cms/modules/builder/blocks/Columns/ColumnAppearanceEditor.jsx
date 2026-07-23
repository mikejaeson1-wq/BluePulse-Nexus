import "./ColumnAppearanceEditor.css";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    getColumnsBlockData,
    updateColumnsBlockColumn
} from "@shared/layout/columnsBlockModel";

const DEFAULT_COLUMN_APPEARANCE = {
    backgroundEnabled: false,
    backgroundColor: "#0f172a",

    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,

    borderWidth: 0,
    borderColor: "#334155",
    borderRadius: 0
};

const COLUMN_STYLE_PRESETS = [
    {
        id: "plain",
        label: "Ohne Stil",
        description: "Transparente Spalte ohne Abstände oder Rahmen.",
        icon: "bi-square",
        appearance: {
            ...DEFAULT_COLUMN_APPEARANCE
        }
    },
    {
        id: "card",
        label: "Karte",
        description: "Dunkle Karte mit Innenabstand und feinem Rahmen.",
        icon: "bi-card-text",
        appearance: {
            backgroundEnabled: true,
            backgroundColor: "#0f172a",

            paddingTop: 24,
            paddingRight: 24,
            paddingBottom: 24,
            paddingLeft: 24,

            borderWidth: 1,
            borderColor: "#334155",
            borderRadius: 16
        }
    },
    {
        id: "soft",
        label: "Weiches Panel",
        description: "Dezenter Hintergrund mit großzügiger Rundung.",
        icon: "bi-app",
        appearance: {
            backgroundEnabled: true,
            backgroundColor: "#111827",

            paddingTop: 28,
            paddingRight: 28,
            paddingBottom: 28,
            paddingLeft: 28,

            borderWidth: 1,
            borderColor: "#1e293b",
            borderRadius: 24
        }
    },
    {
        id: "accent",
        label: "BluePulse",
        description: "Blaues Akzentpanel im BluePulse-Stil.",
        icon: "bi-water",
        appearance: {
            backgroundEnabled: true,
            backgroundColor: "#082f49",

            paddingTop: 24,
            paddingRight: 24,
            paddingBottom: 24,
            paddingLeft: 24,

            borderWidth: 1,
            borderColor: "#0ea5e9",
            borderRadius: 18
        }
    }
];

function NumericField({
    label,
    value,
    minimum = 0,
    maximum = 240,
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
        <label className="builder-column-appearance__field">
            <span className="builder-column-appearance__label">
                {
                    label
                }
            </span>

            <div className="builder-column-appearance__number">
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
    const validPickerColor =
        /^#[0-9a-f]{6}$/i.test(
            value
        )
            ? value
            : "#0f172a";

    return (
        <label className="builder-column-appearance__field">
            <span className="builder-column-appearance__label">
                {
                    label
                }
            </span>

            <div className="builder-column-appearance__color">
                <input
                    type="color"
                    value={
                        validPickerColor
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

function ColumnSelector({
    columns,
    activeColumnId,
    onChange
}) {
    return (
        <div
            className="builder-column-appearance__selector"
            role="tablist"
            aria-label="Spalte zur Gestaltung auswählen"
        >
            {
                columns.map(
                    (
                        column,
                        index
                    ) => {
                        const active =
                            column.id ===
                            activeColumnId;

                        return (
                            <button
                                key={
                                    column.id
                                }
                                type="button"
                                className={
                                    active
                                        ? "builder-column-appearance__selector-button builder-column-appearance__selector-button--active"
                                        : "builder-column-appearance__selector-button"
                                }
                                role="tab"
                                aria-selected={
                                    active
                                }
                                onClick={
                                    () =>
                                        onChange(
                                            column.id
                                        )
                                }
                            >
                                <span>
                                    {
                                        index +
                                        1
                                    }
                                </span>

                                <div>
                                    <strong>
                                        {
                                            column.label
                                        }
                                    </strong>

                                    <small>
                                        {
                                            column.blocks.length
                                        } {
                                            column.blocks.length ===
                                            1
                                                ? "Block"
                                                : "Blöcke"
                                        }
                                    </small>
                                </div>

                                <i
                                    className={
                                        active
                                            ? "bi bi-check-circle-fill"
                                            : "bi bi-chevron-right"
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

function StylePresetSelector({
    activeAppearance,
    onSelect
}) {
    function matchesPreset(
        preset
    ) {
        return Object.entries(
            preset.appearance
        ).every(
            (
                [
                    property,
                    value
                ]
            ) =>
                activeAppearance[
                    property
                ] ===
                value
        );
    }

    return (
        <div className="builder-column-appearance__presets">
            {
                COLUMN_STYLE_PRESETS.map(
                    (preset) => {
                        const active =
                            matchesPreset(
                                preset
                            );

                        return (
                            <button
                                key={
                                    preset.id
                                }
                                type="button"
                                className={
                                    active
                                        ? "builder-column-appearance__preset builder-column-appearance__preset--active"
                                        : "builder-column-appearance__preset"
                                }
                                aria-pressed={
                                    active
                                }
                                onClick={
                                    () =>
                                        onSelect(
                                            preset
                                        )
                                }
                            >
                                <span className="builder-column-appearance__preset-icon">
                                    <i
                                        className={
                                            `bi ${preset.icon}`
                                        }
                                        aria-hidden="true"
                                    />
                                </span>

                                <div>
                                    <strong>
                                        {
                                            preset.label
                                        }
                                    </strong>

                                    <small>
                                        {
                                            preset.description
                                        }
                                    </small>
                                </div>

                                <i
                                    className={
                                        active
                                            ? "bi bi-check-circle-fill"
                                            : "bi bi-circle"
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

function PaddingEditor({
    appearance,
    onChange
}) {
    function setAllPadding() {
        const nextValue =
            Math.max(
                appearance.paddingTop,
                appearance.paddingRight,
                appearance.paddingBottom,
                appearance.paddingLeft,
                24
            );

        onChange({
            paddingTop:
                nextValue,

            paddingRight:
                nextValue,

            paddingBottom:
                nextValue,

            paddingLeft:
                nextValue
        });
    }

    function clearPadding() {
        onChange({
            paddingTop:
                0,

            paddingRight:
                0,

            paddingBottom:
                0,

            paddingLeft:
                0
        });
    }

    return (
        <>
            <div className="builder-column-appearance__padding-grid">
                <NumericField
                    label="Oben"
                    value={
                        appearance.paddingTop
                    }
                    onChange={
                        (paddingTop) =>
                            onChange({
                                paddingTop
                            })
                    }
                />

                <NumericField
                    label="Rechts"
                    value={
                        appearance.paddingRight
                    }
                    onChange={
                        (paddingRight) =>
                            onChange({
                                paddingRight
                            })
                    }
                />

                <NumericField
                    label="Unten"
                    value={
                        appearance.paddingBottom
                    }
                    onChange={
                        (paddingBottom) =>
                            onChange({
                                paddingBottom
                            })
                    }
                />

                <NumericField
                    label="Links"
                    value={
                        appearance.paddingLeft
                    }
                    onChange={
                        (paddingLeft) =>
                            onChange({
                                paddingLeft
                            })
                    }
                />
            </div>

            <div className="builder-column-appearance__quick-actions">
                <button
                    type="button"
                    onClick={
                        setAllPadding
                    }
                >
                    <i
                        className="bi bi-arrows-expand"
                        aria-hidden="true"
                    />

                    Gleicher Abstand
                </button>

                <button
                    type="button"
                    onClick={
                        clearPadding
                    }
                >
                    <i
                        className="bi bi-x-circle"
                        aria-hidden="true"
                    />

                    Abstände entfernen
                </button>
            </div>
        </>
    );
}

function ColumnPreview({
    column
}) {
    const appearance =
        column.appearance;

    const style = {
        paddingTop:
            `${appearance.paddingTop}px`,

        paddingRight:
            `${appearance.paddingRight}px`,

        paddingBottom:
            `${appearance.paddingBottom}px`,

        paddingLeft:
            `${appearance.paddingLeft}px`,

        background:
            appearance.backgroundEnabled
                ? appearance.backgroundColor
                : "transparent",

        borderWidth:
            `${appearance.borderWidth}px`,

        borderColor:
            appearance.borderColor,

        borderRadius:
            `${appearance.borderRadius}px`
    };

    return (
        <div className="builder-column-appearance__preview">
            <header>
                <span>
                    <i
                        className="bi bi-eye"
                        aria-hidden="true"
                    />

                    Spaltenvorschau
                </span>

                <small>
                    {
                        column.label
                    }
                </small>
            </header>

            <div className="builder-column-appearance__preview-canvas">
                <div
                    className="builder-column-appearance__preview-column"
                    style={
                        style
                    }
                >
                    <span />

                    <span />

                    <span />
                </div>
            </div>
        </div>
    );
}

export default function ColumnAppearanceEditor({
    block,
    onChange
}) {
    const data =
        getColumnsBlockData(
            block
        );

    const [
        activeColumnId,
        setActiveColumnId
    ] =
        useState(
            () =>
                data.columns[0]
                    ?.id ??
                null
        );

    const columnIdentity =
        data.columns
            .map(
                (column) =>
                    column.id
            )
            .join("|");

    useEffect(() => {
        const selectedColumnExists =
            data.columns.some(
                (column) =>
                    column.id ===
                    activeColumnId
            );

        if (
            selectedColumnExists
        ) {
            return;
        }

        setActiveColumnId(
            data.columns[0]
                ?.id ??
            null
        );
    }, [
        activeColumnId,
        columnIdentity,
        data.columns
    ]);

    const activeColumn =
        useMemo(
            () =>
                data.columns.find(
                    (column) =>
                        column.id ===
                        activeColumnId
                ) ??
                data.columns[0] ??
                null,
            [
                activeColumnId,
                columnIdentity,
                data.columns
            ]
        );

    if (
        !activeColumn
    ) {
        return null;
    }

    function updateColumn(
        patch
    ) {
        onChange?.(
            updateColumnsBlockColumn(
                block,
                activeColumn.id,
                patch
            )
        );
    }

    function updateAppearance(
        patch
    ) {
        updateColumn({
            appearance:
                patch
        });
    }

    function applyPreset(
        preset
    ) {
        updateAppearance(
            preset.appearance
        );
    }

    function resetAppearance() {
        updateAppearance(
            DEFAULT_COLUMN_APPEARANCE
        );
    }

    function copyAppearanceToAllColumns() {
        const sourceAppearance = {
            ...activeColumn.appearance
        };

        const updatedBlock =
            data.columns.reduce(
                (
                    currentBlock,
                    column
                ) =>
                    updateColumnsBlockColumn(
                        currentBlock,
                        column.id,
                        {
                            appearance:
                                sourceAppearance
                        }
                    ),
                block
            );

        onChange?.(
            updatedBlock
        );
    }

    return (
        <section className="builder-column-appearance">
            <header className="builder-column-appearance__header">
                <span className="builder-column-appearance__header-icon">
                    <i
                        className="bi bi-palette"
                        aria-hidden="true"
                    />
                </span>

                <div>
                    <span className="builder-column-appearance__eyebrow">
                        Einzelne Spalten
                    </span>

                    <h4>
                        Spaltengestaltung
                    </h4>

                    <p>
                        Hintergrund, Innenabstände, Rahmen und Rundung getrennt konfigurieren.
                    </p>
                </div>
            </header>

            <ColumnSelector
                columns={
                    data.columns
                }
                activeColumnId={
                    activeColumn.id
                }
                onChange={
                    setActiveColumnId
                }
            />

            <ColumnPreview
                column={
                    activeColumn
                }
            />

            <section className="builder-column-appearance__section">
                <header className="builder-column-appearance__section-header">
                    <span>
                        <i
                            className="bi bi-tag"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <h5>
                            Spaltenbezeichnung
                        </h5>

                        <p>
                            Die Bezeichnung dient nur der Übersicht im CMS.
                        </p>
                    </div>
                </header>

                <label className="builder-column-appearance__field">
                    <span className="builder-column-appearance__label">
                        Interner Name
                    </span>

                    <input
                        type="text"
                        value={
                            activeColumn.label
                        }
                        maxLength="80"
                        placeholder="Zum Beispiel Bild, Text oder Kontakt"
                        onChange={
                            (event) =>
                                updateColumn({
                                    label:
                                        event.target.value
                                })
                        }
                    />
                </label>
            </section>

            <section className="builder-column-appearance__section">
                <header className="builder-column-appearance__section-header">
                    <span>
                        <i
                            className="bi bi-magic"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <h5>
                            Gestaltungsvorlagen
                        </h5>

                        <p>
                            Schnellstart für typische Spaltendarstellungen.
                        </p>
                    </div>
                </header>

                <StylePresetSelector
                    activeAppearance={
                        activeColumn.appearance
                    }
                    onSelect={
                        applyPreset
                    }
                />
            </section>

            <section className="builder-column-appearance__section">
                <header className="builder-column-appearance__section-header">
                    <span>
                        <i
                            className="bi bi-paint-bucket"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <h5>
                            Hintergrund
                        </h5>

                        <p>
                            Aktiviere einen eigenen Hintergrund für diese Spalte.
                        </p>
                    </div>
                </header>

                <label className="builder-column-appearance__switch">
                    <span>
                        <strong>
                            Spaltenhintergrund
                        </strong>

                        <small>
                            {
                                activeColumn
                                    .appearance
                                    .backgroundEnabled
                                    ? "Eigene Hintergrundfarbe ist aktiv."
                                    : "Die Spalte bleibt transparent."
                            }
                        </small>
                    </span>

                    <input
                        type="checkbox"
                        checked={
                            activeColumn
                                .appearance
                                .backgroundEnabled
                        }
                        onChange={
                            (event) =>
                                updateAppearance({
                                    backgroundEnabled:
                                        event.target.checked
                                })
                        }
                    />
                </label>

                {
                    activeColumn
                        .appearance
                        .backgroundEnabled && (
                        <ColorField
                            label="Hintergrundfarbe"
                            value={
                                activeColumn
                                    .appearance
                                    .backgroundColor
                            }
                            onChange={
                                (backgroundColor) =>
                                    updateAppearance({
                                        backgroundColor
                                    })
                            }
                        />
                    )
                }
            </section>

            <section className="builder-column-appearance__section">
                <header className="builder-column-appearance__section-header">
                    <span>
                        <i
                            className="bi bi-arrows-angle-contract"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <h5>
                            Innenabstand
                        </h5>

                        <p>
                            Abstand zwischen Spaltenrand und enthaltenen Blöcken.
                        </p>
                    </div>
                </header>

                <PaddingEditor
                    appearance={
                        activeColumn.appearance
                    }
                    onChange={
                        updateAppearance
                    }
                />
            </section>

            <section className="builder-column-appearance__section">
                <header className="builder-column-appearance__section-header">
                    <span>
                        <i
                            className="bi bi-bounding-box"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <h5>
                            Rahmen und Rundung
                        </h5>

                        <p>
                            Stärke, Farbe und Ecken der Spalte gestalten.
                        </p>
                    </div>
                </header>

                <div className="builder-column-appearance__grid">
                    <NumericField
                        label="Rahmenstärke"
                        value={
                            activeColumn
                                .appearance
                                .borderWidth
                        }
                        minimum={
                            0
                        }
                        maximum={
                            16
                        }
                        onChange={
                            (borderWidth) =>
                                updateAppearance({
                                    borderWidth
                                })
                        }
                    />

                    <NumericField
                        label="Eckenrundung"
                        value={
                            activeColumn
                                .appearance
                                .borderRadius
                        }
                        minimum={
                            0
                        }
                        maximum={
                            100
                        }
                        onChange={
                            (borderRadius) =>
                                updateAppearance({
                                    borderRadius
                                })
                        }
                    />
                </div>

                {
                    activeColumn
                        .appearance
                        .borderWidth >
                    0 && (
                        <ColorField
                            label="Rahmenfarbe"
                            value={
                                activeColumn
                                    .appearance
                                    .borderColor
                            }
                            onChange={
                                (borderColor) =>
                                    updateAppearance({
                                        borderColor
                                    })
                            }
                        />
                    )
                }
            </section>

            <div className="builder-column-appearance__actions">
                <button
                    type="button"
                    className="builder-column-appearance__copy"
                    onClick={
                        copyAppearanceToAllColumns
                    }
                >
                    <i
                        className="bi bi-copy"
                        aria-hidden="true"
                    />

                    Stil auf alle Spalten übertragen
                </button>

                <button
                    type="button"
                    className="builder-column-appearance__reset"
                    onClick={
                        resetAppearance
                    }
                >
                    <i
                        className="bi bi-arrow-counterclockwise"
                        aria-hidden="true"
                    />

                    Gewählte Spalte zurücksetzen
                </button>
            </div>
        </section>
    );
}