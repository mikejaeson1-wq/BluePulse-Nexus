export const IMAGE_DEVICE_OPTIONS = [
    {
        value:
            "desktop",

        label:
            "Desktop",

        icon:
            "bi-display"
    },

    {
        value:
            "tablet",

        label:
            "Tablet",

        icon:
            "bi-tablet-landscape"
    },

    {
        value:
            "mobile",

        label:
            "Mobil",

        icon:
            "bi-phone"
    }
];

export const IMAGE_WIDTH_MODE_OPTIONS = [
    {
        value:
            "percent",

        label:
            "Prozent"
    },

    {
        value:
            "pixels",

        label:
            "Pixel"
    }
];

export const IMAGE_HEIGHT_MODE_OPTIONS = [
    {
        value:
            "auto",

        label:
            "Automatisch"
    },

    {
        value:
            "fixed",

        label:
            "Feste Höhe"
    }
];

export const IMAGE_ASPECT_RATIO_OPTIONS = [
    {
        value:
            "original",

        label:
            "Originalformat",

        cssValue:
            "auto"
    },

    {
        value:
            "1:1",

        label:
            "Quadratisch · 1:1",

        cssValue:
            "1 / 1"
    },

    {
        value:
            "4:3",

        label:
            "Klassisch · 4:3",

        cssValue:
            "4 / 3"
    },

    {
        value:
            "3:2",

        label:
            "Foto · 3:2",

        cssValue:
            "3 / 2"
    },

    {
        value:
            "16:9",

        label:
            "Breitbild · 16:9",

        cssValue:
            "16 / 9"
    }
];

export const IMAGE_OBJECT_FIT_OPTIONS = [
    {
        value:
            "cover",

        label:
            "Fläche ausfüllen"
    },

    {
        value:
            "contain",

        label:
            "Ganzes Bild zeigen"
    }
];

export const IMAGE_ALIGNMENT_OPTIONS = [
    {
        value:
            "left",

        label:
            "Links"
    },

    {
        value:
            "center",

        label:
            "Mittig"
    },

    {
        value:
            "right",

        label:
            "Rechts"
    }
];

export const IMAGE_SHADOW_OPTIONS = [
    {
        value:
            "none",

        label:
            "Kein Schatten"
    },

    {
        value:
            "small",

        label:
            "Klein"
    },

    {
        value:
            "medium",

        label:
            "Mittel"
    },

    {
        value:
            "large",

        label:
            "Groß"
    }
];

const RESPONSIVE_DEVICES =
    new Set([
        "tablet",
        "mobile"
    ]);

const WIDTH_MODE_VALUES =
    new Set(
        IMAGE_WIDTH_MODE_OPTIONS.map(
            (option) =>
                option.value
        )
    );

const HEIGHT_MODE_VALUES =
    new Set(
        IMAGE_HEIGHT_MODE_OPTIONS.map(
            (option) =>
                option.value
        )
    );

const ASPECT_RATIO_VALUES =
    new Set(
        IMAGE_ASPECT_RATIO_OPTIONS.map(
            (option) =>
                option.value
        )
    );

const OBJECT_FIT_VALUES =
    new Set(
        IMAGE_OBJECT_FIT_OPTIONS.map(
            (option) =>
                option.value
        )
    );

const ALIGNMENT_VALUES =
    new Set(
        IMAGE_ALIGNMENT_OPTIONS.map(
            (option) =>
                option.value
        )
    );

const SHADOW_VALUES =
    new Set(
        IMAGE_SHADOW_OPTIONS.map(
            (option) =>
                option.value
        )
    );

const DEFAULT_IMAGE_LAYOUT = {
    widthMode:
        "percent",

    width:
        100,

    maxWidth:
        0,

    heightMode:
        "auto",

    fixedHeight:
        500,

    aspectRatio:
        "original",

    objectFit:
        "cover",

    focusX:
        50,

    focusY:
        50,

    alignment:
        "center"
};

const DEFAULT_IMAGE_SETTINGS = {
    ...DEFAULT_IMAGE_LAYOUT,

    responsive: {
        tablet: {
            enabled:
                false,

            ...DEFAULT_IMAGE_LAYOUT
        },

        mobile: {
            enabled:
                false,

            ...DEFAULT_IMAGE_LAYOUT
        }
    },

    borderRadius:
        12,

    borderWidth:
        0,

    borderColor:
        "#334155",

    shadow:
        "none",

    backgroundColor:
        "#0f172a"
};

function isPlainObject(
    value
) {
    return Boolean(
        value &&
        typeof value ===
            "object" &&
        !Array.isArray(
            value
        )
    );
}

function normalizeText(
    value,
    maximumLength = 80
) {
    return String(
        value ??
        ""
    )
        .trim()
        .slice(
            0,
            maximumLength
        );
}

function normalizeEnum(
    value,
    allowedValues,
    fallback
) {
    const normalizedValue =
        normalizeText(
            value
        ).toLowerCase();

    return allowedValues.has(
        normalizedValue
    )
        ? normalizedValue
        : fallback;
}

function normalizeBoolean(
    value,
    fallback = false
) {
    if (
        value ===
        undefined
    ) {
        return fallback;
    }

    return Boolean(
        value
    );
}

function clampNumber(
    value,
    minimum,
    maximum,
    fallback
) {
    const numericValue =
        Number(
            value
        );

    if (
        !Number.isFinite(
            numericValue
        )
    ) {
        return fallback;
    }

    return Math.min(
        maximum,
        Math.max(
            minimum,
            Math.round(
                numericValue
            )
        )
    );
}

function normalizeColor(
    value,
    fallback
) {
    const normalizedValue =
        normalizeText(
            value,
            40
        );

    if (
        /^#[0-9a-f]{3,8}$/i.test(
            normalizedValue
        )
    ) {
        return normalizedValue;
    }

    if (
        /^(rgb|rgba|hsl|hsla)\(/i.test(
            normalizedValue
        )
    ) {
        return normalizedValue;
    }

    return fallback;
}

function normalizeImageLayout(
    value,
    fallback = DEFAULT_IMAGE_LAYOUT
) {
    const source =
        isPlainObject(
            value
        )
            ? value
            : {};

    const widthMode =
        normalizeEnum(
            source.widthMode,
            WIDTH_MODE_VALUES,
            fallback.widthMode
        );

    return {
        widthMode,

        width:
            clampNumber(
                source.width,
                widthMode ===
                    "percent"
                    ? 10
                    : 80,
                widthMode ===
                    "percent"
                    ? 100
                    : 2400,
                fallback.width
            ),

        maxWidth:
            clampNumber(
                source.maxWidth,
                0,
                2400,
                fallback.maxWidth
            ),

        heightMode:
            normalizeEnum(
                source.heightMode,
                HEIGHT_MODE_VALUES,
                fallback.heightMode
            ),

        fixedHeight:
            clampNumber(
                source.fixedHeight,
                80,
                1600,
                fallback.fixedHeight
            ),

        aspectRatio:
            normalizeEnum(
                source.aspectRatio,
                ASPECT_RATIO_VALUES,
                fallback.aspectRatio
            ),

        objectFit:
            normalizeEnum(
                source.objectFit,
                OBJECT_FIT_VALUES,
                fallback.objectFit
            ),

        focusX:
            clampNumber(
                source.focusX,
                0,
                100,
                fallback.focusX
            ),

        focusY:
            clampNumber(
                source.focusY,
                0,
                100,
                fallback.focusY
            ),

        alignment:
            normalizeEnum(
                source.alignment,
                ALIGNMENT_VALUES,
                fallback.alignment
            )
    };
}

function normalizeResponsiveLayout(
    value,
    fallback
) {
    const source =
        isPlainObject(
            value
        )
            ? value
            : {};

    return {
        enabled:
            normalizeBoolean(
                source.enabled,
                false
            ),

        ...normalizeImageLayout(
            source,
            fallback
        )
    };
}

export function normalizeImageBlockSettings(
    value
) {
    const source =
        isPlainObject(
            value
        )
            ? value
            : {};

    const desktopLayout =
        normalizeImageLayout(
            source,
            DEFAULT_IMAGE_LAYOUT
        );

    const responsiveSource =
        isPlainObject(
            source.responsive
        )
            ? source.responsive
            : {};

    return {
        ...desktopLayout,

        responsive: {
            tablet:
                normalizeResponsiveLayout(
                    responsiveSource.tablet,
                    desktopLayout
                ),

            mobile:
                normalizeResponsiveLayout(
                    responsiveSource.mobile,
                    desktopLayout
                )
        },

        borderRadius:
            clampNumber(
                source.borderRadius,
                0,
                100,
                DEFAULT_IMAGE_SETTINGS.borderRadius
            ),

        borderWidth:
            clampNumber(
                source.borderWidth,
                0,
                16,
                DEFAULT_IMAGE_SETTINGS.borderWidth
            ),

        borderColor:
            normalizeColor(
                source.borderColor,
                DEFAULT_IMAGE_SETTINGS.borderColor
            ),

        shadow:
            normalizeEnum(
                source.shadow,
                SHADOW_VALUES,
                DEFAULT_IMAGE_SETTINGS.shadow
            ),

        backgroundColor:
            normalizeColor(
                source.backgroundColor,
                DEFAULT_IMAGE_SETTINGS.backgroundColor
            )
    };
}

export function createDefaultImageBlockSettings() {
    return normalizeImageBlockSettings(
        {}
    );
}

export function getImageBlockSettings(
    data
) {
    return normalizeImageBlockSettings(
        data?.imageSettings
    );
}

export function resolveImageLayoutForDevice(
    settingsValue,
    device = "desktop"
) {
    const settings =
        normalizeImageBlockSettings(
            settingsValue
        );

    const desktopLayout =
        normalizeImageLayout(
            settings,
            DEFAULT_IMAGE_LAYOUT
        );

    if (
        !RESPONSIVE_DEVICES.has(
            device
        )
    ) {
        return desktopLayout;
    }

    const responsiveLayout =
        settings.responsive[
            device
        ];

    if (
        !responsiveLayout
            ?.enabled
    ) {
        return desktopLayout;
    }

    return normalizeImageLayout(
        responsiveLayout,
        desktopLayout
    );
}

export function getImageAspectRatioCss(
    aspectRatio
) {
    return (
        IMAGE_ASPECT_RATIO_OPTIONS.find(
            (option) =>
                option.value ===
                aspectRatio
        )?.cssValue ??
        "auto"
    );
}

export function updateImageBlockSettings(
    block,
    patch
) {
    if (
        !block ||
        typeof block !==
            "object"
    ) {
        return block;
    }

    const currentSettings =
        getImageBlockSettings(
            block.data
        );

    return {
        ...block,

        data: {
            ...block.data,

            imageSettings:
                normalizeImageBlockSettings({
                    ...currentSettings,

                    ...(
                        isPlainObject(
                            patch
                        )
                            ? patch
                            : {}
                    )
                })
        }
    };
}

export function updateResponsiveImageBlockSettings(
    block,
    device,
    patch
) {
    if (
        !RESPONSIVE_DEVICES.has(
            device
        )
    ) {
        return block;
    }

    const currentSettings =
        getImageBlockSettings(
            block?.data
        );

    return updateImageBlockSettings(
        block,
        {
            responsive: {
                ...currentSettings.responsive,

                [
                    device
                ]: {
                    ...currentSettings
                        .responsive[
                        device
                    ],

                    ...(
                        isPlainObject(
                            patch
                        )
                            ? patch
                            : {}
                    )
                }
            }
        }
    );
}