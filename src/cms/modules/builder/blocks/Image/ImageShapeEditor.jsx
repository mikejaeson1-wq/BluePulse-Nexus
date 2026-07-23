import "./ImageShapeEditor.css";

import {
    useState
} from "react";

import {
    IMAGE_DEVICE_OPTIONS,
    getImageBlockSettings,
    resolveImageLayoutForDevice,
    updateImageBlockSettings,
    updateResponsiveImageBlockSettings
} from "@shared/media/imageBlockSettings";

import {
    IMAGE_SHAPE_OPTIONS,
    createDefaultImageShapeSettings,
    getImageShapeCss,
    getImageShapeDefinition,
    getImageShapeSettings,
    resolveImageShapeForDevice,
    updateImageShapeSettings,
    updateResponsiveImageShapeSettings
} from "@shared/media/imageShapeSettings";

import {
    useBuilderViewport
} from "../../context/BuilderViewportContext";

const RESPONSIVE_DEVICES =
    new Set([
        "tablet",
        "mobile"
    ]);

const VALID_DEVICES =
    new Set(
        IMAGE_DEVICE_OPTIONS.map(
            (device) =>
                device.value
        )
    );

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

function createLayoutPatch(
    layout
) {
    return IMAGE_LAYOUT_KEYS.reduce(
        (
            result,
            key
        ) => ({
            ...result,

            [key]:
                layout[key]
        }),
        {}
    );
}

function getDeviceLabel(
    device
) {
    return (
        IMAGE_DEVICE_OPTIONS.find(
            (option) =>
                option.value ===
                device
        )?.label ??
        "Desktop"
    );
}

function getShapePreviewStyle(
    shape,
    borderRadius
) {
    const shapeCss =
        getImageShapeCss(
            shape
        );

    return {
        borderRadius:
            shape ===
            "rounded"
                ? `${borderRadius}px`
                : shapeCss.borderRadius,

        clipPath:
            shapeCss.clipPath
    };
}

function ShapeDeviceSwitcher({
    activeDevice,
    settings,
    onChange
}) {
    return (
        <div
            className="builder-image-shape__devices"
            role="tablist"
            aria-label="Gerätegröße für Bildform"
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

                        const resolvedShape =
                            resolveImageShapeForDevice(
                                settings,
                                device.value
                            );

                        const definition =
                            getImageShapeDefinition(
                                resolvedShape
                            );

                        return (
                            <button
                                key={
                                    device.value
                                }
                                type="button"
                                className={
                                    active
                                        ? "builder-image-shape__device builder-image-shape__device--active"
                                        : "builder-image-shape__device"
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
                                <span className="builder-image-shape__device-icon">
                                    <i
                                        className={
                                            `bi ${device.icon}`
                                        }
                                        aria-hidden="true"
                                    />
                                </span>

                                <span className="builder-image-shape__device-content">
                                    <strong>
                                        {
                                            device.label
                                        }
                                    </strong>

                                    <small>
                                        {
                                            device.value ===
                                            "desktop"
                                                ? definition.label
                                                : customValues
                                                    ? definition.label
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

function ResponsiveShapeStatus({
    device,
    enabled,
    onEnable,
    onDisable
}) {
    if (
        device ===
        "desktop"
    ) {
        return (
            <div className="builder-image-shape__inheritance">
                <span className="builder-image-shape__inheritance-icon">
                    <i
                        className="bi bi-display"
                        aria-hidden="true"
                    />
                </span>

                <div>
                    <strong>
                        Desktop ist die Basisform
                    </strong>

                    <p>
                        Tablet und Mobil übernehmen diese Form, solange dort keine eigene Bildform aktiv ist.
                    </p>
                </div>
            </div>
        );
    }

    const deviceLabel =
        getDeviceLabel(
            device
        );

    return (
        <div
            className={
                enabled
                    ? "builder-image-shape__inheritance builder-image-shape__inheritance--enabled"
                    : "builder-image-shape__inheritance"
            }
        >
            <span className="builder-image-shape__inheritance-icon">
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
                            ? `Eigene ${deviceLabel}-Form`
                            : `${deviceLabel} übernimmt Desktop`
                    }
                </strong>

                <p>
                    {
                        enabled
                            ? "Die Bildform wird für diese Gerätegröße getrennt gespeichert."
                            : "Aktiviere eine eigene Form für diese Ansicht."
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
                        : "Eigene Form"
                }
            </button>
        </div>
    );
}

function ShapePreview({
    src,
    alt,
    shape,
    borderRadius
}) {
    const definition =
        getImageShapeDefinition(
            shape
        );

    return (
        <section className="builder-image-shape__preview">
            <header>
                <span>
                    <i
                        className="bi bi-eye"
                        aria-hidden="true"
                    />

                    Formvorschau
                </span>

                <small>
                    {
                        definition.label
                    }
                </small>
            </header>

            <div className="builder-image-shape__preview-canvas">
                <div
                    className="builder-image-shape__preview-stage"
                    style={
                        getShapePreviewStyle(
                            shape,
                            borderRadius
                        )
                    }
                >
                    {
                        src ? (
                            <img
                                src={
                                    src
                                }
                                alt={
                                    alt
                                }
                            />
                        ) : (
                            <div className="builder-image-shape__preview-empty">
                                <i
                                    className="bi bi-image"
                                    aria-hidden="true"
                                />

                                <span>
                                    Kein Bild ausgewählt
                                </span>
                            </div>
                        )
                    }
                </div>
            </div>
        </section>
    );
}

function ShapeSelector({
    value,
    borderRadius,
    disabled,
    onChange
}) {
    return (
        <div
            className="builder-image-shape__grid"
            role="group"
            aria-label="Bildform auswählen"
        >
            {
                IMAGE_SHAPE_OPTIONS.map(
                    (option) => {
                        const active =
                            option.value ===
                            value;

                        return (
                            <button
                                key={
                                    option.value
                                }
                                type="button"
                                className={
                                    active
                                        ? "builder-image-shape__card builder-image-shape__card--active"
                                        : "builder-image-shape__card"
                                }
                                disabled={
                                    disabled
                                }
                                aria-pressed={
                                    active
                                }
                                title={
                                    option.description
                                }
                                onClick={
                                    () =>
                                        onChange(
                                            option.value
                                        )
                                }
                            >
                                <span className="builder-image-shape__card-preview">
                                    <span
                                        style={
                                            getShapePreviewStyle(
                                                option.value,
                                                borderRadius
                                            )
                                        }
                                    >
                                        <i
                                            className={
                                                `bi ${option.icon}`
                                            }
                                            aria-hidden="true"
                                        />
                                    </span>
                                </span>

                                <strong>
                                    {
                                        option.label
                                    }
                                </strong>

                                <small>
                                    {
                                        option.recommendedAspectRatio
                                            ? `Empfohlen: ${option.recommendedAspectRatio}`
                                            : "Freies Format"
                                    }
                                </small>

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

export default function ImageShapeEditor({
    block,
    onChange
}) {
    const [
        automaticAspectRatio,
        setAutomaticAspectRatio
    ] =
        useState(true);

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

    const imageSettings =
        getImageBlockSettings(
            block.data
        );

    const shapeSettings =
        getImageShapeSettings(
            block.data
        );

    const activeShape =
        resolveImageShapeForDevice(
            shapeSettings,
            activeDevice
        );

    const responsiveEnabled =
        activeDevice ===
            "desktop" ||
        Boolean(
            shapeSettings
                .responsive?.[
                    activeDevice
                ]?.enabled
        );

    const activeDefinition =
        getImageShapeDefinition(
            activeShape
        );

    function updateRecommendedAspectRatio(
        nextBlock,
        shape
    ) {
        if (
            !automaticAspectRatio
        ) {
            return nextBlock;
        }

        const definition =
            getImageShapeDefinition(
                shape
            );

        const recommendedAspectRatio =
            definition
                .recommendedAspectRatio;

        if (
            !recommendedAspectRatio
        ) {
            return nextBlock;
        }

        if (
            activeDevice ===
            "desktop"
        ) {
            return updateImageBlockSettings(
                nextBlock,
                {
                    heightMode:
                        "auto",

                    aspectRatio:
                        recommendedAspectRatio
                }
            );
        }

        if (
            !RESPONSIVE_DEVICES.has(
                activeDevice
            )
        ) {
            return nextBlock;
        }

        const currentImageSettings =
            getImageBlockSettings(
                nextBlock.data
            );

        const currentLayout =
            resolveImageLayoutForDevice(
                currentImageSettings,
                activeDevice
            );

        return updateResponsiveImageBlockSettings(
            nextBlock,
            activeDevice,
            {
                enabled:
                    true,

                ...createLayoutPatch(
                    currentLayout
                ),

                heightMode:
                    "auto",

                aspectRatio:
                    recommendedAspectRatio
            }
        );
    }

    function selectShape(
        shape
    ) {
        let nextBlock =
            block;

        if (
            activeDevice ===
            "desktop"
        ) {
            nextBlock =
                updateImageShapeSettings(
                    nextBlock,
                    {
                        shape
                    }
                );
        } else {
            if (
                !responsiveEnabled ||
                !RESPONSIVE_DEVICES.has(
                    activeDevice
                )
            ) {
                return;
            }

            nextBlock =
                updateResponsiveImageShapeSettings(
                    nextBlock,
                    activeDevice,
                    {
                        enabled:
                            true,

                        shape
                    }
                );
        }

        nextBlock =
            updateRecommendedAspectRatio(
                nextBlock,
                shape
            );

        onChange?.(
            nextBlock
        );
    }

    function enableResponsiveShape() {
        if (
            !RESPONSIVE_DEVICES.has(
                activeDevice
            )
        ) {
            return;
        }

        const desktopShape =
            resolveImageShapeForDevice(
                shapeSettings,
                "desktop"
            );

        onChange?.(
            updateResponsiveImageShapeSettings(
                block,
                activeDevice,
                {
                    enabled:
                        true,

                    shape:
                        desktopShape
                }
            )
        );
    }

    function disableResponsiveShape() {
        if (
            !RESPONSIVE_DEVICES.has(
                activeDevice
            )
        ) {
            return;
        }

        onChange?.(
            updateResponsiveImageShapeSettings(
                block,
                activeDevice,
                {
                    enabled:
                        false
                }
            )
        );
    }

    function resetActiveShape() {
        if (
            activeDevice ===
            "desktop"
        ) {
            onChange?.(
                updateImageShapeSettings(
                    block,
                    {
                        shape:
                            "rounded"
                    }
                )
            );

            return;
        }

        if (
            !RESPONSIVE_DEVICES.has(
                activeDevice
            )
        ) {
            return;
        }

        onChange?.(
            updateResponsiveImageShapeSettings(
                block,
                activeDevice,
                {
                    enabled:
                        false,

                    shape:
                        shapeSettings.shape
                }
            )
        );
    }

    function resetAllShapes() {
        onChange?.({
            ...block,

            data: {
                ...block.data,

                imageShapeSettings:
                    createDefaultImageShapeSettings()
            }
        });

        setActiveViewport(
            "desktop"
        );
    }

    return (
        <section className="builder-image-shape">
            <header className="builder-image-shape__header">
                <span className="builder-image-shape__header-icon">
                    <i
                        className="bi bi-gem"
                        aria-hidden="true"
                    />
                </span>

                <div>
                    <span className="builder-image-shape__eyebrow">
                        Bildgestaltung
                    </span>

                    <h4>
                        Form und Silhouette
                    </h4>

                    <p>
                        Nutze klassische, geometrische oder organische Bildformen.
                    </p>
                </div>
            </header>

            <ShapePreview
                src={
                    block.data.src
                }
                alt=""
                shape={
                    activeShape
                }
                borderRadius={
                    imageSettings.borderRadius
                }
            />

            <section className="builder-image-shape__responsive">
                <header className="builder-image-shape__section-header">
                    <span>
                        <i
                            className="bi bi-display"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <h5>
                            Responsive Form
                        </h5>

                        <p>
                            Die Geräteauswahl wechselt gleichzeitig die Canvas-Ansicht.
                        </p>
                    </div>
                </header>

                <ShapeDeviceSwitcher
                    activeDevice={
                        activeDevice
                    }
                    settings={
                        shapeSettings
                    }
                    onChange={
                        setActiveViewport
                    }
                />

                <ResponsiveShapeStatus
                    device={
                        activeDevice
                    }
                    enabled={
                        responsiveEnabled
                    }
                    onEnable={
                        enableResponsiveShape
                    }
                    onDisable={
                        disableResponsiveShape
                    }
                />
            </section>

            <fieldset
                className="builder-image-shape__fields"
                disabled={
                    !responsiveEnabled
                }
            >
                <section className="builder-image-shape__section">
                    <header className="builder-image-shape__section-header">
                        <span>
                            <i
                                className="bi bi-bounding-box-circles"
                                aria-hidden="true"
                            />
                        </span>

                        <div>
                            <h5>
                                Form auswählen
                            </h5>

                            <p>
                                Die Form wird direkt auf das aktuelle Bild angewendet.
                            </p>
                        </div>
                    </header>

                    <ShapeSelector
                        value={
                            activeShape
                        }
                        borderRadius={
                            imageSettings.borderRadius
                        }
                        disabled={
                            !responsiveEnabled
                        }
                        onChange={
                            selectShape
                        }
                    />
                </section>

                <section className="builder-image-shape__section">
                    <header className="builder-image-shape__section-header">
                        <span>
                            <i
                                className="bi bi-aspect-ratio"
                                aria-hidden="true"
                            />
                        </span>

                        <div>
                            <h5>
                                Passendes Bildformat
                            </h5>

                            <p>
                                Einige Formen wirken mit einem bestimmten Seitenverhältnis deutlich sauberer.
                            </p>
                        </div>
                    </header>

                    <label className="builder-image-shape__switch">
                        <span>
                            <strong>
                                Seitenverhältnis automatisch anpassen
                            </strong>

                            <small>
                                {
                                    automaticAspectRatio
                                        ? "Beim Formwechsel wird das empfohlene Seitenverhältnis verwendet."
                                        : "Das aktuell eingestellte Seitenverhältnis bleibt unverändert."
                                }
                            </small>
                        </span>

                        <input
                            type="checkbox"
                            checked={
                                automaticAspectRatio
                            }
                            onChange={
                                (event) =>
                                    setAutomaticAspectRatio(
                                        event.target.checked
                                    )
                            }
                        />
                    </label>

                    <div className="builder-image-shape__recommendation">
                        <span>
                            <i
                                className={
                                    `bi ${activeDefinition.icon}`
                                }
                                aria-hidden="true"
                            />
                        </span>

                        <div>
                            <strong>
                                {
                                    activeDefinition.label
                                }
                            </strong>

                            <p>
                                {
                                    activeDefinition
                                        .recommendedAspectRatio
                                        ? `Empfohlenes Format: ${activeDefinition.recommendedAspectRatio}`
                                        : "Diese Form funktioniert mit jedem Seitenverhältnis."
                                }
                            </p>
                        </div>
                    </div>

                    {
                        activeShape ===
                        "rounded" && (
                            <div className="builder-image-shape__notice">
                                <i
                                    className="bi bi-info-circle"
                                    aria-hidden="true"
                                />

                                <span>
                                    Die Rundung der Form „Abgerundet“ wird weiterhin im bestehenden Bereich „Gemeinsame Darstellung“ eingestellt.
                                </span>
                            </div>
                        )
                    }
                </section>

                <button
                    type="button"
                    className="builder-image-shape__device-reset"
                    onClick={
                        resetActiveShape
                    }
                >
                    <i
                        className="bi bi-arrow-counterclockwise"
                        aria-hidden="true"
                    />

                    {
                        activeDevice ===
                        "desktop"
                            ? "Desktop-Form zurücksetzen"
                            : `${getDeviceLabel(
                                activeDevice
                            )}-Form zurücksetzen`
                    }
                </button>
            </fieldset>

            <button
                type="button"
                className="builder-image-shape__reset-all"
                onClick={
                    resetAllShapes
                }
            >
                <i
                    className="bi bi-arrow-counterclockwise"
                    aria-hidden="true"
                />

                Alle Bildformen zurücksetzen
            </button>
        </section>
    );
}