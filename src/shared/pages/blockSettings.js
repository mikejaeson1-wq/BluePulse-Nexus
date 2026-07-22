export const BLOCK_DEVICE_OPTIONS = [
    {
        value: "desktop",
        label: "Desktop",
        icon: "bi-display",
        description: "Ab 1200 Pixel"
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

export const BLOCK_WIDTH_OPTIONS = [
    {
        value: "full",
        label: "Volle Breite",
        description: "Der Block nutzt die gesamte verfügbare Breite."
    },
    {
        value: "content",
        label: "Inhaltsbreite",
        description: "Der Block wird auf maximal 1200 Pixel begrenzt."
    },
    {
        value: "narrow",
        label: "Schmale Breite",
        description: "Der Block wird auf maximal 800 Pixel begrenzt."
    },
    {
        value: "custom",
        label: "Eigene Breite",
        description: "Die maximale Breite wird individuell festgelegt."
    },
    {
        value: "fit",
        label: "Inhalt anpassen",
        description: "Der Block ist nur so breit wie sein Inhalt."
    }
];

export const BLOCK_ALIGNMENT_OPTIONS = [
    {
        value: "left",
        label: "Links"
    },
    {
        value: "center",
        label: "Mittig"
    },
    {
        value: "right",
        label: "Rechts"
    }
];

export const BLOCK_BORDER_STYLE_OPTIONS = [
    {
        value: "solid",
        label: "Durchgezogen"
    },
    {
        value: "dashed",
        label: "Gestrichelt"
    },
    {
        value: "dotted",
        label: "Gepunktet"
    },
    {
        value: "double",
        label: "Doppelt"
    }
];

export const BLOCK_SHADOW_OPTIONS = [
    {
        value: "none",
        label: "Kein Schatten"
    },
    {
        value: "small",
        label: "Klein"
    },
    {
        value: "medium",
        label: "Mittel"
    },
    {
        value: "large",
        label: "Groß"
    }
];

export const BLOCK_OVERFLOW_OPTIONS = [
    {
        value: "visible",
        label: "Inhalte nicht beschneiden"
    },
    {
        value: "hidden",
        label: "Inhalte am Rahmen beschneiden"
    }
];

const RESPONSIVE_DEVICE_VALUES =
    new Set([
        "tablet",
        "mobile"
    ]);

const WIDTH_VALUES =
    new Set(
        BLOCK_WIDTH_OPTIONS.map(
            (option) =>
                option.value
        )
    );

const ALIGNMENT_VALUES =
    new Set(
        BLOCK_ALIGNMENT_OPTIONS.map(
            (option) =>
                option.value
        )
    );

const BORDER_STYLE_VALUES =
    new Set(
        BLOCK_BORDER_STYLE_OPTIONS.map(
            (option) =>
                option.value
        )
    );

const SHADOW_VALUES =
    new Set(
        BLOCK_SHADOW_OPTIONS.map(
            (option) =>
                option.value
        )
    );

const OVERFLOW_VALUES =
    new Set(
        BLOCK_OVERFLOW_OPTIONS.map(
            (option) =>
                option.value
        )
    );

const DEFAULT_LAYOUT_SETTINGS = {
    width:
        "full",

    customWidth:
        1200,

    alignment:
        "center",

    marginTop:
        0,

    marginBottom:
        0,

    paddingTop:
        0,

    paddingRight:
        0,

    paddingBottom:
        0,

    paddingLeft:
        0
};

const DEFAULT_DESIGN_SETTINGS = {
    ...DEFAULT_LAYOUT_SETTINGS,

    responsive: {
        tablet: {
            enabled:
                false,

            ...DEFAULT_LAYOUT_SETTINGS
        },

        mobile: {
            enabled:
                false,

            ...DEFAULT_LAYOUT_SETTINGS
        }
    },

    backgroundEnabled:
        false,

    backgroundColor:
        "#0f172a",

    borderWidth:
        0,

    borderStyle:
        "solid",

    borderColor:
        "#334155",

    borderRadius:
        0,

    shadow:
        "none",

    overflow:
        "visible"
};

const DEFAULT_ADVANCED_SETTINGS = {
    anchorId:
        "",

    classNames:
        "",

    ariaLabel:
        "",

    hideDesktop:
        false,

    hideTablet:
        false,

    hideMobile:
        false
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

function clampNumber(
    value,
    minimum,
    maximum,
    fallback
) {
    const number =
        Number(
            value
        );

    if (
        !Number.isFinite(
            number
        )
    ) {
        return fallback;
    }

    return Math.min(
        maximum,
        Math.max(
            minimum,
            Math.round(
                number
            )
        )
    );
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

function normalizeText(
    value,
    maximumLength = 240
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
            value,
            50
        ).toLowerCase();

    return allowedValues.has(
        normalizedValue
    )
        ? normalizedValue
        : fallback;
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

    if (!normalizedValue) {
        return fallback;
    }

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

function normalizeLayoutSettings(
    value,
    fallback = DEFAULT_LAYOUT_SETTINGS
) {
    const source =
        isPlainObject(
            value
        )
            ? value
            : {};

    return {
        width:
            normalizeEnum(
                source.width,
                WIDTH_VALUES,
                fallback.width
            ),

        customWidth:
            clampNumber(
                source.customWidth,
                240,
                1920,
                fallback.customWidth
            ),

        alignment:
            normalizeEnum(
                source.alignment,
                ALIGNMENT_VALUES,
                fallback.alignment
            ),

        marginTop:
            clampNumber(
                source.marginTop,
                0,
                400,
                fallback.marginTop
            ),

        marginBottom:
            clampNumber(
                source.marginBottom,
                0,
                400,
                fallback.marginBottom
            ),

        paddingTop:
            clampNumber(
                source.paddingTop,
                0,
                300,
                fallback.paddingTop
            ),

        paddingRight:
            clampNumber(
                source.paddingRight,
                0,
                300,
                fallback.paddingRight
            ),

        paddingBottom:
            clampNumber(
                source.paddingBottom,
                0,
                300,
                fallback.paddingBottom
            ),

        paddingLeft:
            clampNumber(
                source.paddingLeft,
                0,
                300,
                fallback.paddingLeft
            )
    };
}

function normalizeResponsiveLayoutSettings(
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

        ...normalizeLayoutSettings(
            source,
            fallback
        )
    };
}

function getBaseLayoutSettings(
    design
) {
    return normalizeLayoutSettings(
        design,
        DEFAULT_LAYOUT_SETTINGS
    );
}

export function normalizeBlockAnchorId(
    value
) {
    return normalizeText(
        value,
        100
    )
        .replace(
            /^#+/,
            ""
        )
        .replace(
            /\s+/g,
            "-"
        )
        .replace(
            /[^a-zA-Z0-9_-]/g,
            ""
        )
        .replace(
            /-{2,}/g,
            "-"
        )
        .replace(
            /^[-_]+|[-_]+$/g,
            ""
        );
}

export function normalizeBlockClassNames(
    value
) {
    const classNames =
        normalizeText(
            value,
            240
        )
            .split(
                /\s+/
            )
            .map(
                (className) =>
                    className
                        .replace(
                            /[^a-zA-Z0-9_-]/g,
                            ""
                        )
                        .trim()
            )
            .filter(
                Boolean
            )
            .slice(
                0,
                8
            );

    return [
        ...new Set(
            classNames
        )
    ].join(
        " "
    );
}

export function normalizeBlockDesignSettings(
    value
) {
    const source =
        isPlainObject(
            value
        )
            ? value
            : {};

    const baseLayout =
        getBaseLayoutSettings(
            source
        );

    const responsiveSource =
        isPlainObject(
            source.responsive
        )
            ? source.responsive
            : {};

    return {
        ...baseLayout,

        responsive: {
            tablet:
                normalizeResponsiveLayoutSettings(
                    responsiveSource.tablet,
                    baseLayout
                ),

            mobile:
                normalizeResponsiveLayoutSettings(
                    responsiveSource.mobile,
                    baseLayout
                )
        },

        backgroundEnabled:
            normalizeBoolean(
                source.backgroundEnabled,
                DEFAULT_DESIGN_SETTINGS.backgroundEnabled
            ),

        backgroundColor:
            normalizeColor(
                source.backgroundColor,
                DEFAULT_DESIGN_SETTINGS.backgroundColor
            ),

        borderWidth:
            clampNumber(
                source.borderWidth,
                0,
                16,
                DEFAULT_DESIGN_SETTINGS.borderWidth
            ),

        borderStyle:
            normalizeEnum(
                source.borderStyle,
                BORDER_STYLE_VALUES,
                DEFAULT_DESIGN_SETTINGS.borderStyle
            ),

        borderColor:
            normalizeColor(
                source.borderColor,
                DEFAULT_DESIGN_SETTINGS.borderColor
            ),

        borderRadius:
            clampNumber(
                source.borderRadius,
                0,
                100,
                DEFAULT_DESIGN_SETTINGS.borderRadius
            ),

        shadow:
            normalizeEnum(
                source.shadow,
                SHADOW_VALUES,
                DEFAULT_DESIGN_SETTINGS.shadow
            ),

        overflow:
            normalizeEnum(
                source.overflow,
                OVERFLOW_VALUES,
                DEFAULT_DESIGN_SETTINGS.overflow
            )
    };
}

export function normalizeBlockAdvancedSettings(
    value
) {
    const source =
        isPlainObject(
            value
        )
            ? value
            : {};

    return {
        anchorId:
            normalizeBlockAnchorId(
                source.anchorId
            ),

        classNames:
            normalizeBlockClassNames(
                source.classNames
            ),

        ariaLabel:
            normalizeText(
                source.ariaLabel,
                180
            ),

        hideDesktop:
            normalizeBoolean(
                source.hideDesktop,
                DEFAULT_ADVANCED_SETTINGS.hideDesktop
            ),

        hideTablet:
            normalizeBoolean(
                source.hideTablet,
                DEFAULT_ADVANCED_SETTINGS.hideTablet
            ),

        hideMobile:
            normalizeBoolean(
                source.hideMobile,
                DEFAULT_ADVANCED_SETTINGS.hideMobile
            )
    };
}

export function normalizeBlockSettings(
    value
) {
    const source =
        isPlainObject(
            value
        )
            ? value
            : {};

    return {
        design:
            normalizeBlockDesignSettings(
                source.design
            ),

        advanced:
            normalizeBlockAdvancedSettings(
                source.advanced
            )
    };
}

export function createDefaultBlockSettings() {
    return normalizeBlockSettings(
        {}
    );
}

export function getBlockSettings(
    block
) {
    return normalizeBlockSettings(
        block?.settings
    );
}

export function setBlockSettings(
    block,
    settings
) {
    if (
        !block ||
        typeof block !==
            "object"
    ) {
        return block;
    }

    return {
        ...block,

        settings:
            normalizeBlockSettings(
                settings
            )
    };
}

export function resolveBlockDesignForDevice(
    designValue,
    device = "desktop"
) {
    const design =
        normalizeBlockDesignSettings(
            designValue
        );

    const baseLayout =
        getBaseLayoutSettings(
            design
        );

    if (
        !RESPONSIVE_DEVICE_VALUES.has(
            device
        )
    ) {
        return baseLayout;
    }

    const responsiveSettings =
        design.responsive[
            device
        ];

    if (
        !responsiveSettings
            ?.enabled
    ) {
        return baseLayout;
    }

    return normalizeLayoutSettings(
        responsiveSettings,
        baseLayout
    );
}

export function updateBlockDesignSettings(
    block,
    patch
) {
    const currentSettings =
        getBlockSettings(
            block
        );

    return setBlockSettings(
        block,
        {
            ...currentSettings,

            design: {
                ...currentSettings.design,

                ...(
                    isPlainObject(
                        patch
                    )
                        ? patch
                        : {}
                )
            }
        }
    );
}

export function updateBlockResponsiveDesignSettings(
    block,
    device,
    patch
) {
    if (
        !RESPONSIVE_DEVICE_VALUES.has(
            device
        )
    ) {
        return block;
    }

    const currentSettings =
        getBlockSettings(
            block
        );

    const currentDesign =
        currentSettings.design;

    const currentResponsive =
        currentDesign.responsive;

    return updateBlockDesignSettings(
        block,
        {
            responsive: {
                ...currentResponsive,

                [
                    device
                ]: {
                    ...currentResponsive[
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

export function updateBlockAdvancedSettings(
    block,
    patch
) {
    const currentSettings =
        getBlockSettings(
            block
        );

    return setBlockSettings(
        block,
        {
            ...currentSettings,

            advanced: {
                ...currentSettings.advanced,

                ...(
                    isPlainObject(
                        patch
                    )
                        ? patch
                        : {}
                )
            }
        }
    );
}