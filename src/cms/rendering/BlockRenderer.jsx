import "./BlockRenderer.css";

import {
    getBlock
} from "@cms/modules/builder/registry/blockRegistry";

import {
    getBlockSettings,
    resolveBlockDesignForDevice
} from "@shared/pages/blockSettings";

const MAXIMUM_NESTING_LEVEL = 8;

function getWrapperClassName(
    mode,
    settings
) {
    const {
        design,
        advanced
    } =
        settings;

    return [
        "bp-rendered-block",

        `bp-rendered-block--shadow-${design.shadow}`,

        `bp-rendered-block--overflow-${design.overflow}`,

        mode === "editor"
            ? "bp-rendered-block--editor"
            : "bp-rendered-block--website",

        advanced.hideDesktop
            ? "bp-rendered-block--hide-desktop"
            : "",

        advanced.hideTablet
            ? "bp-rendered-block--hide-tablet"
            : "",

        advanced.hideMobile
            ? "bp-rendered-block--hide-mobile"
            : "",

        advanced.classNames
    ]
        .filter(Boolean)
        .join(" ");
}

function getWidthValues(layout) {
    switch (layout.width) {
        case "content":
            return {
                width: "min(100%, 1200px)",
                maxWidth: "1200px"
            };

        case "narrow":
            return {
                width: "min(100%, 800px)",
                maxWidth: "800px"
            };

        case "custom":
            return {
                width:
                    `min(100%, ${layout.customWidth}px)`,

                maxWidth:
                    `${layout.customWidth}px`
            };

        case "fit":
            return {
                width: "fit-content",
                maxWidth: "100%"
            };

        case "full":
        default:
            return {
                width: "100%",
                maxWidth: "none"
            };
    }
}

function getAlignmentValues(alignment) {
    switch (alignment) {
        case "left":
            return {
                marginLeft: "0",
                marginRight: "auto"
            };

        case "right":
            return {
                marginLeft: "auto",
                marginRight: "0"
            };

        case "center":
        default:
            return {
                marginLeft: "auto",
                marginRight: "auto"
            };
    }
}

function getDeviceStyleVariables(
    device,
    layout
) {
    const widthValues =
        getWidthValues(
            layout
        );

    const alignmentValues =
        getAlignmentValues(
            layout.alignment
        );

    return {
        [`--bp-block-${device}-width`]:
            widthValues.width,

        [`--bp-block-${device}-max-width`]:
            widthValues.maxWidth,

        [`--bp-block-${device}-margin-left`]:
            alignmentValues.marginLeft,

        [`--bp-block-${device}-margin-right`]:
            alignmentValues.marginRight,

        [`--bp-block-${device}-margin-top`]:
            `${layout.marginTop}px`,

        [`--bp-block-${device}-margin-bottom`]:
            `${layout.marginBottom}px`,

        [`--bp-block-${device}-padding-top`]:
            `${layout.paddingTop}px`,

        [`--bp-block-${device}-padding-right`]:
            `${layout.paddingRight}px`,

        [`--bp-block-${device}-padding-bottom`]:
            `${layout.paddingBottom}px`,

        [`--bp-block-${device}-padding-left`]:
            `${layout.paddingLeft}px`
    };
}

function getWrapperStyle(settings) {
    const {
        design
    } =
        settings;

    const desktopLayout =
        resolveBlockDesignForDevice(
            design,
            "desktop"
        );

    const tabletLayout =
        resolveBlockDesignForDevice(
            design,
            "tablet"
        );

    const mobileLayout =
        resolveBlockDesignForDevice(
            design,
            "mobile"
        );

    return {
        ...getDeviceStyleVariables(
            "desktop",
            desktopLayout
        ),

        ...getDeviceStyleVariables(
            "tablet",
            tabletLayout
        ),

        ...getDeviceStyleVariables(
            "mobile",
            mobileLayout
        ),

        "--bp-block-background":
            design.backgroundEnabled
                ? design.backgroundColor
                : "transparent",

        "--bp-block-border-width":
            `${design.borderWidth}px`,

        "--bp-block-border-style":
            design.borderStyle,

        "--bp-block-border-color":
            design.borderColor,

        "--bp-block-border-radius":
            `${design.borderRadius}px`
    };
}

function UnknownBlock({
    block
}) {
    return (
        <div className="bp-rendered-block__unknown">
            <i
                className="bi bi-exclamation-triangle"
                aria-hidden="true"
            />

            <div>
                <strong>
                    Unbekannter Block
                </strong>

                <span>
                    Der Blocktyp „{
                        block?.type ??
                        "unbekannt"
                    }“ ist nicht registriert.
                </span>
            </div>
        </div>
    );
}

function NestingLimitReached({
    mode
}) {
    if (
        mode !== "editor"
    ) {
        return null;
    }

    return (
        <div className="bp-rendered-block__unknown">
            <i
                className="bi bi-diagram-3"
                aria-hidden="true"
            />

            <div>
                <strong>
                    Maximale Verschachtelung erreicht
                </strong>

                <span>
                    Blöcke dürfen höchstens acht Ebenen tief verschachtelt werden.
                </span>
            </div>
        </div>
    );
}

export default function BlockRenderer({
    block,
    mode = "website",
    nestingLevel = 0
}) {
    if (!block) {
        return null;
    }

    if (
        nestingLevel >
        MAXIMUM_NESTING_LEVEL
    ) {
        return (
            <NestingLimitReached
                mode={
                    mode
                }
            />
        );
    }

    const definition =
        getBlock(
            block.type
        );

    if (!definition) {
        return (
            <UnknownBlock
                block={
                    block
                }
            />
        );
    }

    const settings =
        getBlockSettings(
            block
        );

    const {
        advanced
    } =
        settings;

    const Component =
        definition.component;

    function renderNestedBlock(
        nestedBlock,
        options = {}
    ) {
        return (
            <BlockRenderer
                block={
                    nestedBlock
                }
                mode={
                    options.mode ??
                    mode
                }
                nestingLevel={
                    nestingLevel + 1
                }
            />
        );
    }

    return (
        <div
            id={
                advanced.anchorId ||
                undefined
            }
            className={
                getWrapperClassName(
                    mode,
                    settings
                )
            }
            style={
                getWrapperStyle(
                    settings
                )
            }
            aria-label={
                advanced.ariaLabel ||
                undefined
            }
            data-rendered-block="true"
            data-block-id={
                block.id
            }
            data-block-type={
                block.type
            }
            data-block-mode={
                mode
            }
            data-block-nesting-level={
                nestingLevel
            }
            data-tablet-layout={
                settings.design
                    .responsive
                    .tablet
                    .enabled
                    ? "custom"
                    : "inherited"
            }
            data-mobile-layout={
                settings.design
                    .responsive
                    .mobile
                    .enabled
                    ? "custom"
                    : "inherited"
            }
        >
            <Component
                block={
                    block
                }
                data={
                    block.data
                }
                mode={
                    mode
                }
                nestingLevel={
                    nestingLevel
                }
                renderBlock={
                    renderNestedBlock
                }
            />
        </div>
    );
}