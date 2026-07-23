import "./Divider.css";

import {
    getDividerBlockSettings,
    resolveDividerLayoutForDevice
} from "@shared/layout/dividerBlockSettings";

function getLengthCss(
    layout
) {
    if (
        layout.lengthMode ===
        "stretch"
    ) {
        return "100%";
    }

    if (
        layout.lengthMode ===
        "pixels"
    ) {
        return `${layout.length}px`;
    }

    return `${layout.length}%`;
}

function getHorizontalMargins(
    alignment
) {
    switch (alignment) {
        case "start":
            return {
                marginLeft: "0",
                marginRight: "auto"
            };

        case "end":
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

function getVerticalMargins(
    alignment
) {
    switch (alignment) {
        case "start":
            return {
                marginTop: "0",
                marginBottom: "auto"
            };

        case "end":
            return {
                marginTop: "auto",
                marginBottom: "0"
            };

        case "center":
        default:
            return {
                marginTop: "auto",
                marginBottom: "auto"
            };
    }
}

function DividerPresentation({
    device,
    layout
}) {
    const vertical =
        layout.orientation ===
        "vertical";

    const showLabel =
        !vertical &&
        layout.showLabel &&
        layout.label;

    const horizontalMargins =
        getHorizontalMargins(
            layout.alignment
        );

    const verticalMargins =
        getVerticalMargins(
            layout.alignment
        );

    const className = [
        "bp-divider__presentation",

        `bp-divider__presentation--${device}`,

        vertical
            ? "bp-divider__presentation--vertical"
            : "bp-divider__presentation--horizontal",

        `bp-divider__presentation--${layout.style}`,

        `bp-divider__presentation--length-${layout.lengthMode}`
    ]
        .filter(Boolean)
        .join(" ");

    const style = {
        "--bp-divider-color":
            layout.color,

        "--bp-divider-opacity":
            layout.opacity /
            100,

        "--bp-divider-thickness":
            `${layout.thickness}px`,

        "--bp-divider-length":
            getLengthCss(
                layout
            ),

        "--bp-divider-spacing-before":
            `${layout.spacingBefore}px`,

        "--bp-divider-spacing-after":
            `${layout.spacingAfter}px`,

        "--bp-divider-vertical-min-height":
            `${Math.max(
                layout.verticalMinHeight,
                layout.lengthMode ===
                    "pixels"
                    ? layout.length
                    : 0
            )}px`,

        "--bp-divider-margin-left":
            horizontalMargins.marginLeft,

        "--bp-divider-margin-right":
            horizontalMargins.marginRight,

        "--bp-divider-margin-top":
            verticalMargins.marginTop,

        "--bp-divider-margin-bottom":
            verticalMargins.marginBottom
    };

    return (
        <div
            className={
                className
            }
            style={
                style
            }
            role="separator"
            aria-orientation={
                vertical
                    ? "vertical"
                    : "horizontal"
            }
            aria-label={
                layout.label ||
                "Inhaltstrenner"
            }
            data-divider-device={
                device
            }
            data-divider-orientation={
                layout.orientation
            }
            data-divider-length-mode={
                layout.lengthMode
            }
        >
            {
                showLabel ? (
                    <div className="bp-divider__body bp-divider__labeled">
                        <span
                            className="bp-divider__line"
                            aria-hidden="true"
                        />

                        <span className="bp-divider__label">
                            {
                                layout.label
                            }
                        </span>

                        <span
                            className="bp-divider__line"
                            aria-hidden="true"
                        />
                    </div>
                ) : (
                    <div className="bp-divider__body">
                        <span
                            className="bp-divider__line"
                            aria-hidden="true"
                        />
                    </div>
                )
            }
        </div>
    );
}

export default function Divider({
    data = {}
}) {
    const settings =
        getDividerBlockSettings(
            data
        );

    const desktop =
        resolveDividerLayoutForDevice(
            settings,
            "desktop"
        );

    const tablet =
        resolveDividerLayoutForDevice(
            settings,
            "tablet"
        );

    const mobile =
        resolveDividerLayoutForDevice(
            settings,
            "mobile"
        );

    return (
        <div
            className="bp-divider"
            data-desktop-orientation={
                desktop.orientation
            }
            data-tablet-orientation={
                tablet.orientation
            }
            data-mobile-orientation={
                mobile.orientation
            }
            data-desktop-length-mode={
                desktop.lengthMode
            }
            data-tablet-length-mode={
                tablet.lengthMode
            }
            data-mobile-length-mode={
                mobile.lengthMode
            }
        >
            <DividerPresentation
                device="desktop"
                layout={
                    desktop
                }
            />

            <DividerPresentation
                device="tablet"
                layout={
                    tablet
                }
            />

            <DividerPresentation
                device="mobile"
                layout={
                    mobile
                }
            />
        </div>
    );
}