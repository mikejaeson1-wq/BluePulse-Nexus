import "./Image.css";

import {
    getImageAspectRatioCss,
    getImageBlockSettings,
    resolveImageLayoutForDevice
} from "@shared/media/imageBlockSettings";

function getWidthValue(
    layout
) {
    if (
        layout.widthMode ===
        "pixels"
    ) {
        return `min(100%, ${layout.width}px)`;
    }

    return `${layout.width}%`;
}

function getMaximumWidthValue(
    layout
) {
    if (
        layout.maxWidth >
        0
    ) {
        return `min(100%, ${layout.maxWidth}px)`;
    }

    return "100%";
}

function getAlignmentValues(
    alignment
) {
    switch (
        alignment
    ) {
        case "left":
            return {
                left:
                    "0",

                right:
                    "auto"
            };

        case "right":
            return {
                left:
                    "auto",

                right:
                    "0"
            };

        case "center":
        default:
            return {
                left:
                    "auto",

                right:
                    "auto"
            };
    }
}

function getDeviceVariables(
    device,
    layout
) {
    const alignment =
        getAlignmentValues(
            layout.alignment
        );

    const naturalHeight =
        layout.heightMode ===
            "auto" &&
        layout.aspectRatio ===
            "original";

    const fixedHeight =
        layout.heightMode ===
        "fixed";

    return {
        [
            `--bp-image-${device}-width`
        ]:
            getWidthValue(
                layout
            ),

        [
            `--bp-image-${device}-max-width`
        ]:
            getMaximumWidthValue(
                layout
            ),

        [
            `--bp-image-${device}-height`
        ]:
            fixedHeight
                ? `${layout.fixedHeight}px`
                : "auto",

        [
            `--bp-image-${device}-aspect-ratio`
        ]:
            fixedHeight ||
            naturalHeight
                ? "auto"
                : getImageAspectRatioCss(
                    layout.aspectRatio
                ),

        [
            `--bp-image-${device}-margin-left`
        ]:
            alignment.left,

        [
            `--bp-image-${device}-margin-right`
        ]:
            alignment.right,

        [
            `--bp-image-${device}-fit`
        ]:
            layout.objectFit,

        [
            `--bp-image-${device}-focus-x`
        ]:
            `${layout.focusX}%`,

        [
            `--bp-image-${device}-focus-y`
        ]:
            `${layout.focusY}%`,

        [
            `--bp-image-${device}-natural`
        ]:
            naturalHeight
                ? 1
                : 0
    };
}

function getImageClassName(
    settings
) {
    return [
        "bp-image",

        `bp-image--shadow-${settings.shadow}`
    ].join(
        " "
    );
}

export default function Image({
    data = {}
}) {
    const settings =
        getImageBlockSettings(
            data
        );

    const desktopLayout =
        resolveImageLayoutForDevice(
            settings,
            "desktop"
        );

    const tabletLayout =
        resolveImageLayoutForDevice(
            settings,
            "tablet"
        );

    const mobileLayout =
        resolveImageLayoutForDevice(
            settings,
            "mobile"
        );

    const caption =
        String(
            data.caption ??
            ""
        ).trim();

    const loading =
        data.loading ===
        "eager"
            ? "eager"
            : "lazy";

    const style = {
        ...getDeviceVariables(
            "desktop",
            desktopLayout
        ),

        ...getDeviceVariables(
            "tablet",
            tabletLayout
        ),

        ...getDeviceVariables(
            "mobile",
            mobileLayout
        ),

        "--bp-image-border-radius":
            `${settings.borderRadius}px`,

        "--bp-image-border-width":
            `${settings.borderWidth}px`,

        "--bp-image-border-color":
            settings.borderColor,

        "--bp-image-background":
            settings.backgroundColor
    };

    return (
        <figure
            className={
                getImageClassName(
                    settings
                )
            }
            style={
                style
            }
        >
            <div className="bp-image__stage">
                <img
                    src={
                        data.src
                    }
                    alt={
                        data.alt ??
                        ""
                    }
                    className="bp-image__element"
                    loading={
                        loading
                    }
                    decoding="async"
                />
            </div>

            {
                caption && (
                    <figcaption className="bp-image__caption">
                        {
                            caption
                        }
                    </figcaption>
                )
            }
        </figure>
    );
}