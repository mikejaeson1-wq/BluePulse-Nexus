import "./Properties.css";

import {
    useState
} from "react";

import Modal from "@shared/ui/Modal";

import MediaLibrary from "@cms/modules/media/components/MediaLibrary";

import {
    IMAGE_ALIGNMENT_OPTIONS,
    IMAGE_ASPECT_RATIO_OPTIONS,
    IMAGE_DEVICE_OPTIONS,
    IMAGE_HEIGHT_MODE_OPTIONS,
    IMAGE_OBJECT_FIT_OPTIONS,
    IMAGE_SHADOW_OPTIONS,
    IMAGE_WIDTH_MODE_OPTIONS,
    createDefaultImageBlockSettings,
    getImageAspectRatioCss,
    getImageBlockSettings,
    resolveImageLayoutForDevice,
    updateImageBlockSettings,
    updateResponsiveImageBlockSettings
} from "@shared/media/imageBlockSettings";

import {
    useBuilderViewport
} from "@cms/modules/builder/context/BuilderViewportContext";

const RESPONSIVE_DEVICES =
    new Set([
        "tablet",
        "mobile"
    ]);

const IMAGE_LAYOUT_KEYS = [
    "widthMode",
    "width",
    "maxWidth",
    "heightMode",
    "fixedHeight",
    "aspectRatio",
    "objectFit",
    "focusX",
    "focusY",
    "alignment"
];

function isValidDevice(
    device
) {
    return IMAGE_DEVICE_OPTIONS.some(
        (option) =>
            option.value ===
            device
    );
}

function createImageLayoutPatch(
    layout
) {
    return IMAGE_LAYOUT_KEYS.reduce(
        (
            result,
            key
        ) => ({
            ...result,

            [
                key
            ]:
                layout[
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
        const nextValue =
            event.target.value;

        if (
            nextValue ===
            ""
        ) {
            return;
        }

        onChange(
            Number(
                nextValue
            )
        );
    }

    return (
        <label className="builder-image-properties__field">
            <span className="builder-image-properties__label">
                {
                    label
                }
            </span>

            <div className="builder-image-properties__number">
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

function SelectField({
    label,
    value,
    options,
    onChange
}) {
    return (
        <label className="builder-image-properties__field">
            <span className="builder-image-properties__label">
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

function ColorField({
    label,
    value,
    onChange
}) {
    const pickerValue =
        /^#[0-9a-f]{6}$/i.test(
            value
        )
            ? value
            : "#0f172a";

    return (
        <label className="builder-image-properties__field">
            <span className="builder-image-properties__label">
                {
                    label
                }
            </span>

            <div className="builder-image-properties__color">
                <input
                    type="color"
                    value={
                        pickerValue
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

function DeviceSwitcher({
    activeDevice,
    settings,
    onChange
}) {
    return (
        <div
            className="builder-image-properties__devices"
            role="tablist"
            aria-label="Gerätegröße für Bildeinstellungen"
        >
            {
                IMAGE_DEVICE_OPTIONS.map(
                    (device) => {
                        const active =
                            activeDevice ===
                            device.value;

                        const customValues =
                            device.value ===
                                "desktop" ||
                            Boolean(
                                settings
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
                                        ? "builder-image-properties__device builder-image-properties__device--active"
                                        : "builder-image-properties__device"
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
                                onClick={
                                    () =>
                                        onChange(
                                            device.value
                                        )
                                }
                            >
                                <span className="builder-image-properties__device-icon">
                                    <i
                                        className={
                                            `bi ${device.icon}`
                                        }
                                        aria-hidden="true"
                                    />
                                </span>

                                <span className="builder-image-properties__device-content">
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
                                                : customValues
                                                    ? "Eigene Werte"
                                                    : "Übernimmt Desktop"
                                        }
                                    </small>
                                </span>

                                <i
                                    className={
                                        customValues
                                            ? "bi bi-check-circle-fill"
                                            : "bi bi-link-45deg"
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

function ResponsiveStatus({
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
            <div className="builder-image-properties__inheritance">
                <span className="builder-image-properties__inheritance-icon">
                    <i
                        className="bi bi-display"
                        aria-hidden="true"
                    />
                </span>

                <div>
                    <strong>
                        Desktop ist die Bildbasis
                    </strong>

                    <p>
                        Tablet und Mobil übernehmen diese Einstellungen, solange dort keine eigenen Werte aktiviert sind.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={
                enabled
                    ? "builder-image-properties__inheritance builder-image-properties__inheritance--enabled"
                    : "builder-image-properties__inheritance"
            }
        >
            <span className="builder-image-properties__inheritance-icon">
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
                    {
                        enabled
                            ? `Eigene ${deviceLabel}-Werte aktiv`
                            : `${deviceLabel} übernimmt Desktop`
                    }
                </strong>

                <p>
                    {
                        enabled
                            ? "Größe, Zuschnitt und Fokuspunkt werden für dieses Gerät getrennt gespeichert."
                            : "Aktiviere eigene Werte für eine individuelle Darstellung."
                    }
                </p>
            </div>

            <button
                type="button"
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
        <div className="builder-image-properties__field">
            <span className="builder-image-properties__label">
                Bildausrichtung
            </span>

            <div
                className="builder-image-properties__segments"
                role="group"
                aria-label="Bildausrichtung"
            >
                {
                    IMAGE_ALIGNMENT_OPTIONS.map(
                        (option) => {
                            const active =
                                option.value ===
                                value;

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
                                            ? "builder-image-properties__segment builder-image-properties__segment--active"
                                            : "builder-image-properties__segment"
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

                                    {
                                        option.label
                                    }
                                </button>
                            );
                        }
                    )
                }
            </div>
        </div>
    );
}

function FocusControl({
    focusX,
    focusY,
    src,
    objectFit,
    onChange
}) {
    return (
        <div className="builder-image-properties__focus">
            <div
                className="builder-image-properties__focus-preview"
                style={{
                    "--builder-image-focus-x":
                        `${focusX}%`,

                    "--builder-image-focus-y":
                        `${focusY}%`,

                    "--builder-image-focus-fit":
                        objectFit
                }}
            >
                {
                    src ? (
                        <img
                            src={
                                src
                            }
                            alt=""
                        />
                    ) : (
                        <span>
                            Keine Bildvorschau
                        </span>
                    )
                }

                <span
                    className="builder-image-properties__focus-marker"
                    aria-hidden="true"
                />
            </div>

            <label className="builder-image-properties__range">
                <span>
                    Horizontaler Fokus
                </span>

                <div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={
                            focusX
                        }
                        onChange={
                            (event) =>
                                onChange({
                                    focusX:
                                        Number(
                                            event.target.value
                                        )
                                })
                        }
                    />

                    <output>
                        {
                            focusX
                        } %
                    </output>
                </div>
            </label>

            <label className="builder-image-properties__range">
                <span>
                    Vertikaler Fokus
                </span>

                <div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={
                            focusY
                        }
                        onChange={
                            (event) =>
                                onChange({
                                    focusY:
                                        Number(
                                            event.target.value
                                        )
                                })
                        }
                    />

                    <output>
                        {
                            focusY
                        } %
                    </output>
                </div>
            </label>

            <button
                type="button"
                className="builder-image-properties__focus-reset"
                onClick={
                    () =>
                        onChange({
                            focusX:
                                50,

                            focusY:
                                50
                        })
                }
            >
                <i
                    className="bi bi-bullseye"
                    aria-hidden="true"
                />

                Fokus zentrieren
            </button>
        </div>
    );
}

function ImagePreview({
    src,
    alt,
    caption,
    layout,
    settings
}) {
    const width =
        layout.widthMode ===
        "pixels"
            ? `min(100%, ${layout.width}px)`
            : `${layout.width}%`;

    const maximumWidth =
        layout.maxWidth >
        0
            ? `${layout.maxWidth}px`
            : "100%";

    const fixedHeight =
        layout.heightMode ===
        "fixed";

    const originalRatio =
        layout.aspectRatio ===
        "original";

    return (
        <figure className="builder-image-properties__preview">
            <div className="builder-image-properties__preview-header">
                <span>
                    <i
                        className="bi bi-image"
                        aria-hidden="true"
                    />

                    Aktuelle Vorschau
                </span>

                <small>
                    {
                        layout.widthMode ===
                        "percent"
                            ? `${layout.width} %`
                            : `${layout.width} px`
                    }
                </small>
            </div>

            <div className="builder-image-properties__preview-canvas">
                {
                    src ? (
                        <div
                            className={
                                `builder-image-properties__preview-stage builder-image-properties__preview-stage--shadow-${settings.shadow}`
                            }
                            style={{
                                width,

                                maxWidth:
                                    maximumWidth,

                                height:
                                    fixedHeight
                                        ? `${layout.fixedHeight}px`
                                        : "auto",

                                aspectRatio:
                                    !fixedHeight &&
                                    !originalRatio
                                        ? getImageAspectRatioCss(
                                            layout.aspectRatio
                                        )
                                        : "auto",

                                marginLeft:
                                    layout.alignment ===
                                    "left"
                                        ? "0"
                                        : "auto",

                                marginRight:
                                    layout.alignment ===
                                    "right"
                                        ? "0"
                                        : "auto",

                                borderRadius:
                                    `${settings.borderRadius}px`,

                                borderWidth:
                                    `${settings.borderWidth}px`,

                                borderColor:
                                    settings.borderColor,

                                backgroundColor:
                                    settings.backgroundColor
                            }}
                        >
                            <img
                                src={
                                    src
                                }
                                alt={
                                    alt
                                }
                                style={{
                                    objectFit:
                                        layout.objectFit,

                                    objectPosition:
                                        `${layout.focusX}% ${layout.focusY}%`
                                }}
                            />
                        </div>
                    ) : (
                        <div className="builder-image-properties__preview-empty">
                            <i
                                className="bi bi-image"
                                aria-hidden="true"
                            />

                            <span>
                                Noch kein Bild ausgewählt
                            </span>
                        </div>
                    )
                }

                {
                    caption && (
                        <figcaption>
                            {
                                caption
                            }
                        </figcaption>
                    )
                }
            </div>
        </figure>
    );
}

export default function ImageProperties({
    block,
    onChange
}) {
    const [
        mediaOpen,
        setMediaOpen
    ] =
        useState(false);

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
        getImageBlockSettings(
            block.data
        );

    const activeLayout =
        resolveImageLayoutForDevice(
            settings,
            activeDevice
        );

    const activeDeviceDefinition =
        IMAGE_DEVICE_OPTIONS.find(
            (device) =>
                device.value ===
                activeDevice
        ) ??
        IMAGE_DEVICE_OPTIONS[0];

    const responsiveEnabled =
        activeDevice ===
            "desktop" ||
        Boolean(
            settings
                .responsive?.[
                activeDevice
            ]?.enabled
        );

    function updateContent(
        patch
    ) {
        onChange?.({
            ...block,

            data: {
                ...block.data,

                ...patch
            }
        });
    }

    function updateSharedSettings(
        patch
    ) {
        onChange?.(
            updateImageBlockSettings(
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
            updateSharedSettings(
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
            updateResponsiveImageBlockSettings(
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
            resolveImageLayoutForDevice(
                settings,
                "desktop"
            );

        onChange?.(
            updateResponsiveImageBlockSettings(
                block,
                activeDevice,
                {
                    enabled:
                        true,

                    ...createImageLayoutPatch(
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
            updateResponsiveImageBlockSettings(
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
                createDefaultImageBlockSettings();

            updateSharedSettings(
                createImageLayoutPatch(
                    defaults
                )
            );

            return;
        }

        const desktopLayout =
            resolveImageLayoutForDevice(
                settings,
                "desktop"
            );

        onChange?.(
            updateResponsiveImageBlockSettings(
                block,
                activeDevice,
                {
                    enabled:
                        false,

                    ...createImageLayoutPatch(
                        desktopLayout
                    )
                }
            )
        );
    }

    function resetAllImageSettings() {
        const defaults =
            createDefaultImageBlockSettings();

        onChange?.(
            updateImageBlockSettings(
                block,
                defaults
            )
        );
    }

    function selectImage(
        file
    ) {
        const imageUrl =
            file?.url ??
            file?.src ??
            "";

        if (!imageUrl) {
            return;
        }

        const currentAlt =
            String(
                block.data.alt ??
                ""
            ).trim();

        updateContent({
            src:
                imageUrl,

            alt:
                currentAlt ||
                file?.alt ||
                file?.name ||
                "Bild"
        });

        setMediaOpen(
            false
        );
    }

    return (
        <div className="builder-image-properties">
            <ImagePreview
                src={
                    block.data.src
                }
                alt={
                    block.data.alt ??
                    ""
                }
                caption={
                    block.data.caption ??
                    ""
                }
                layout={
                    activeLayout
                }
                settings={
                    settings
                }
            />

            <section className="builder-image-properties__section">
                <header className="builder-image-properties__section-header">
                    <span>
                        <i
                            className="bi bi-folder2-open"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <h4>
                            Bildquelle
                        </h4>

                        <p>
                            Wähle ein Bild aus der BluePulse-Mediathek.
                        </p>
                    </div>
                </header>

                <button
                    type="button"
                    className="builder-image-properties__media-button"
                    onClick={
                        () =>
                            setMediaOpen(
                                true
                            )
                    }
                >
                    <i
                        className="bi bi-images"
                        aria-hidden="true"
                    />

                    Bild aus Mediathek auswählen
                </button>

                <label className="builder-image-properties__field">
                    <span className="builder-image-properties__label">
                        Bildadresse
                    </span>

                    <input
                        type="url"
                        value={
                            block.data.src ??
                            ""
                        }
                        placeholder="https://..."
                        onChange={
                            (event) =>
                                updateContent({
                                    src:
                                        event.target.value
                                })
                        }
                    />
                </label>
            </section>

            <section className="builder-image-properties__section">
                <header className="builder-image-properties__section-header">
                    <span>
                        <i
                            className="bi bi-card-text"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <h4>
                            Beschreibung
                        </h4>

                        <p>
                            Alternativtext, Bildunterschrift und Ladeverhalten.
                        </p>
                    </div>
                </header>

                <label className="builder-image-properties__field">
                    <span className="builder-image-properties__label">
                        Alternativer Text
                    </span>

                    <input
                        type="text"
                        value={
                            block.data.alt ??
                            ""
                        }
                        placeholder="Beschreibe den Bildinhalt"
                        onChange={
                            (event) =>
                                updateContent({
                                    alt:
                                        event.target.value
                                })
                        }
                    />

                    <small className="builder-image-properties__help">
                        Der Alternativtext ist wichtig für Screenreader und sollte den wesentlichen Bildinhalt beschreiben.
                    </small>
                </label>

                <label className="builder-image-properties__field">
                    <span className="builder-image-properties__label">
                        Bildunterschrift
                    </span>

                    <textarea
                        rows="3"
                        value={
                            block.data.caption ??
                            ""
                        }
                        placeholder="Optionale sichtbare Bildunterschrift"
                        onChange={
                            (event) =>
                                updateContent({
                                    caption:
                                        event.target.value
                                })
                        }
                    />
                </label>

                <SelectField
                    label="Ladeverhalten"
                    value={
                        block.data.loading ===
                        "eager"
                            ? "eager"
                            : "lazy"
                    }
                    options={[
                        {
                            value:
                                "lazy",

                            label:
                                "Verzögert laden"
                        },

                        {
                            value:
                                "eager",

                            label:
                                "Sofort laden"
                        }
                    ]}
                    onChange={
                        (loading) =>
                            updateContent({
                                loading
                            })
                    }
                />
            </section>

            <section className="builder-image-properties__responsive">
                <header className="builder-image-properties__responsive-header">
                    <span>
                        <i
                            className="bi bi-aspect-ratio"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <span className="builder-image-properties__eyebrow">
                            Responsive Bilddarstellung
                        </span>

                        <h4>
                            Größe und Zuschnitt
                        </h4>

                        <p>
                            Die Geräteauswahl ist direkt mit der Canvas-Ansicht verbunden.
                        </p>
                    </div>
                </header>

                <DeviceSwitcher
                    activeDevice={
                        activeDevice
                    }
                    settings={
                        settings
                    }
                    onChange={
                        setActiveViewport
                    }
                />

                <ResponsiveStatus
                    activeDevice={
                        activeDevice
                    }
                    deviceLabel={
                        activeDeviceDefinition.label
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

            <fieldset
                className="builder-image-properties__responsive-fields"
                disabled={
                    !responsiveEnabled
                }
            >
                <section className="builder-image-properties__section">
                    <header className="builder-image-properties__section-header">
                        <span>
                            <i
                                className="bi bi-arrows-angle-expand"
                                aria-hidden="true"
                            />
                        </span>

                        <div>
                            <h4>
                                Bildbreite
                            </h4>

                            <p>
                                Definiere Breite und optionale Maximalbreite.
                            </p>
                        </div>
                    </header>

                    <div className="builder-image-properties__grid builder-image-properties__grid--two">
                        <SelectField
                            label="Einheit"
                            value={
                                activeLayout.widthMode
                            }
                            options={
                                IMAGE_WIDTH_MODE_OPTIONS
                            }
                            onChange={
                                (widthMode) =>
                                    updateActiveLayout({
                                        widthMode
                                    })
                            }
                        />

                        <NumericField
                            label="Breite"
                            value={
                                activeLayout.width
                            }
                            minimum={
                                activeLayout.widthMode ===
                                "percent"
                                    ? 10
                                    : 80
                            }
                            maximum={
                                activeLayout.widthMode ===
                                "percent"
                                    ? 100
                                    : 2400
                            }
                            suffix={
                                activeLayout.widthMode ===
                                "percent"
                                    ? "%"
                                    : "px"
                            }
                            onChange={
                                (width) =>
                                    updateActiveLayout({
                                        width
                                    })
                            }
                        />
                    </div>

                    <NumericField
                        label="Maximalbreite"
                        value={
                            activeLayout.maxWidth
                        }
                        minimum={
                            0
                        }
                        maximum={
                            2400
                        }
                        onChange={
                            (maxWidth) =>
                                updateActiveLayout({
                                    maxWidth
                                })
                        }
                    />

                    <small className="builder-image-properties__help">
                        Der Wert 0 deaktiviert die zusätzliche Maximalbreite.
                    </small>

                    <AlignmentControl
                        value={
                            activeLayout.alignment
                        }
                        onChange={
                            (alignment) =>
                                updateActiveLayout({
                                    alignment
                                })
                        }
                    />
                </section>

                <section className="builder-image-properties__section">
                    <header className="builder-image-properties__section-header">
                        <span>
                            <i
                                className="bi bi-arrows-expand-vertical"
                                aria-hidden="true"
                            />
                        </span>

                        <div>
                            <h4>
                                Höhe und Format
                            </h4>

                            <p>
                                Nutze die natürliche Höhe oder einen festen Bildrahmen.
                            </p>
                        </div>
                    </header>

                    <div className="builder-image-properties__grid builder-image-properties__grid--two">
                        <SelectField
                            label="Höhenmodus"
                            value={
                                activeLayout.heightMode
                            }
                            options={
                                IMAGE_HEIGHT_MODE_OPTIONS
                            }
                            onChange={
                                (heightMode) =>
                                    updateActiveLayout({
                                        heightMode
                                    })
                            }
                        />

                        {
                            activeLayout.heightMode ===
                                "fixed" ? (
                                <NumericField
                                    label="Feste Höhe"
                                    value={
                                        activeLayout.fixedHeight
                                    }
                                    minimum={
                                        80
                                    }
                                    maximum={
                                        1600
                                    }
                                    onChange={
                                        (fixedHeight) =>
                                            updateActiveLayout({
                                                fixedHeight
                                            })
                                    }
                                />
                            ) : (
                                <SelectField
                                    label="Seitenverhältnis"
                                    value={
                                        activeLayout.aspectRatio
                                    }
                                    options={
                                        IMAGE_ASPECT_RATIO_OPTIONS
                                    }
                                    onChange={
                                        (aspectRatio) =>
                                            updateActiveLayout({
                                                aspectRatio
                                            })
                                    }
                                />
                            )
                        }
                    </div>

                    <SelectField
                        label="Bildanpassung"
                        value={
                            activeLayout.objectFit
                        }
                        options={
                            IMAGE_OBJECT_FIT_OPTIONS
                        }
                        onChange={
                            (objectFit) =>
                                updateActiveLayout({
                                    objectFit
                                })
                        }
                    />
                </section>

                <section className="builder-image-properties__section">
                    <header className="builder-image-properties__section-header">
                        <span>
                            <i
                                className="bi bi-bullseye"
                                aria-hidden="true"
                            />
                        </span>

                        <div>
                            <h4>
                                Fokuspunkt
                            </h4>

                            <p>
                                Lege fest, welcher Bildbereich beim Zuschneiden sichtbar bleiben soll.
                            </p>
                        </div>
                    </header>

                    <FocusControl
                        focusX={
                            activeLayout.focusX
                        }
                        focusY={
                            activeLayout.focusY
                        }
                        src={
                            block.data.src
                        }
                        objectFit={
                            activeLayout.objectFit
                        }
                        onChange={
                            updateActiveLayout
                        }
                    />
                </section>

                <button
                    type="button"
                    className="builder-image-properties__device-reset"
                    onClick={
                        resetActiveLayout
                    }
                >
                    <i
                        className="bi bi-arrow-counterclockwise"
                        aria-hidden="true"
                    />

                    {
                        activeDevice ===
                        "desktop"
                            ? "Desktop-Bildlayout zurücksetzen"
                            : `${
                                activeDeviceDefinition.label
                            }-Werte zurücksetzen`
                    }
                </button>
            </fieldset>

            <section className="builder-image-properties__section">
                <header className="builder-image-properties__section-header">
                    <span>
                        <i
                            className="bi bi-palette"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <h4>
                            Gemeinsame Darstellung
                        </h4>

                        <p>
                            Diese Werte gelten auf allen Gerätegrößen.
                        </p>
                    </div>
                </header>

                <div className="builder-image-properties__grid builder-image-properties__grid--two">
                    <NumericField
                        label="Eckenrundung"
                        value={
                            settings.borderRadius
                        }
                        minimum={
                            0
                        }
                        maximum={
                            100
                        }
                        onChange={
                            (borderRadius) =>
                                updateSharedSettings({
                                    borderRadius
                                })
                        }
                    />

                    <NumericField
                        label="Rahmenstärke"
                        value={
                            settings.borderWidth
                        }
                        minimum={
                            0
                        }
                        maximum={
                            16
                        }
                        onChange={
                            (borderWidth) =>
                                updateSharedSettings({
                                    borderWidth
                                })
                        }
                    />
                </div>

                {
                    settings.borderWidth >
                        0 && (
                        <ColorField
                            label="Rahmenfarbe"
                            value={
                                settings.borderColor
                            }
                            onChange={
                                (borderColor) =>
                                    updateSharedSettings({
                                        borderColor
                                    })
                            }
                        />
                    )
                }

                <ColorField
                    label="Hintergrund bei Contain"
                    value={
                        settings.backgroundColor
                    }
                    onChange={
                        (backgroundColor) =>
                            updateSharedSettings({
                                backgroundColor
                            })
                    }
                />

                <SelectField
                    label="Schatten"
                    value={
                        settings.shadow
                    }
                    options={
                        IMAGE_SHADOW_OPTIONS
                    }
                    onChange={
                        (shadow) =>
                            updateSharedSettings({
                                shadow
                            })
                    }
                />
            </section>

            <button
                type="button"
                className="builder-image-properties__reset-all"
                onClick={
                    resetAllImageSettings
                }
            >
                <i
                    className="bi bi-arrow-counterclockwise"
                    aria-hidden="true"
                />

                Alle Bildeinstellungen zurücksetzen
            </button>

            <Modal
                open={
                    mediaOpen
                }
                title="Bild aus Mediathek auswählen"
                onClose={
                    () =>
                        setMediaOpen(
                            false
                        )
                }
            >
                <MediaLibrary
                    onSelect={
                        selectImage
                    }
                />
            </Modal>
        </div>
    );
}