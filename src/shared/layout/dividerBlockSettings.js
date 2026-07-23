export const DIVIDER_DEVICE_OPTIONS = [
    {
        value: "desktop",
        label: "Desktop",
        icon: "bi-display"
    },
    {
        value: "tablet",
        label: "Tablet",
        icon: "bi-tablet-landscape"
    },
    {
        value: "mobile",
        label: "Mobil",
        icon: "bi-phone"
    }
];

export const DIVIDER_ORIENTATION_OPTIONS = [
    {
        value: "horizontal",
        label: "Horizontal"
    },
    {
        value: "vertical",
        label: "Vertikal"
    }
];

export const DIVIDER_STYLE_OPTIONS = [
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
        value: "gradient",
        label: "Verlauf"
    }
];

export const DIVIDER_LENGTH_MODE_OPTIONS = [
    {
        value: "percent",
        label: "Prozent"
    },
    {
        value: "pixels",
        label: "Pixel"
    },
    {
        value: "stretch",
        label: "Verfügbare Höhe"
    }
];

export const DIVIDER_HORIZONTAL_ALIGNMENT_OPTIONS = [
    {
        value: "start",
        label: "Links"
    },
    {
        value: "center",
        label: "Mittig"
    },
    {
        value: "end",
        label: "Rechts"
    }
];

export const DIVIDER_VERTICAL_ALIGNMENT_OPTIONS = [
    {
        value: "start",
        label: "Oben"
    },
    {
        value: "center",
        label: "Mittig"
    },
    {
        value: "end",
        label: "Unten"
    }
];

const VALID_ORIENTATIONS =
    new Set([
        "horizontal",
        "vertical"
    ]);

const VALID_STYLES =
    new Set([
        "solid",
        "dashed",
        "dotted",
        "gradient"
    ]);

const VALID_LENGTH_MODES =
    new Set([
        "percent",
        "pixels",
        "stretch"
    ]);

const VALID_ALIGNMENTS =
    new Set([
        "start",
        "center",
        "end"
    ]);

const DEFAULT_LAYOUT = {
    orientation: "horizontal",
    style: "solid",
    color: "#334155",
    opacity: 100,
    thickness: 1,
    lengthMode: "percent",
    length: 100,
    alignment: "center",
    spacingBefore: 36,
    spacingAfter: 36,
    verticalMinHeight: 240,
    showLabel: false,
    label: "BluePulse"
};

function isPlainObject(value) {
    return Boolean(
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
    );
}

function clampNumber(
    value,
    minimum,
    maximum,
    fallback
) {
    const numericValue =
        Number(value);

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

function normalizeText(
    value,
    fallback = "",
    maximumLength = 160
) {
    const normalizedValue =
        String(
            value ??
            ""
        )
            .trim()
            .slice(
                0,
                maximumLength
            );

    return (
        normalizedValue ||
        fallback
    );
}

function normalizeColor(
    value,
    fallback
) {
    const normalizedValue =
        normalizeText(
            value,
            "",
            50
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

function normalizeOrientation(
    value,
    fallback
) {
    const normalizedValue =
        normalizeText(
            value,
            fallback,
            20
        ).toLowerCase();

    return VALID_ORIENTATIONS.has(
        normalizedValue
    )
        ? normalizedValue
        : fallback;
}

function normalizeStyle(
    value,
    fallback
) {
    const normalizedValue =
        normalizeText(
            value,
            fallback,
            20
        ).toLowerCase();

    return VALID_STYLES.has(
        normalizedValue
    )
        ? normalizedValue
        : fallback;
}

function normalizeLengthMode(
    value,
    orientation,
    fallback
) {
    const normalizedValue =
        normalizeText(
            value,
            fallback,
            20
        ).toLowerCase();

    if (
        !VALID_LENGTH_MODES.has(
            normalizedValue
        )
    ) {
        return fallback;
    }

    if (
        orientation ===
            "horizontal" &&
        normalizedValue ===
            "stretch"
    ) {
        return "percent";
    }

    return normalizedValue;
}

function normalizeAlignment(
    value,
    fallback
) {
    const normalizedValue =
        normalizeText(
            value,
            fallback,
            20
        ).toLowerCase();

    return VALID_ALIGNMENTS.has(
        normalizedValue
    )
        ? normalizedValue
        : fallback;
}

function getLegacyLength(
    source,
    fallback
) {
    if (
        source.length !==
        undefined
    ) {
        return source.length;
    }

    if (
        source.width !==
        undefined
    ) {
        return source.width;
    }

    return fallback;
}

function getLegacySpacingBefore(
    source,
    fallback
) {
    if (
        source.spacingBefore !==
        undefined
    ) {
        return source.spacingBefore;
    }

    if (
        source.spacingTop !==
        undefined
    ) {
        return source.spacingTop;
    }

    return fallback;
}

function getLegacySpacingAfter(
    source,
    fallback
) {
    if (
        source.spacingAfter !==
        undefined
    ) {
        return source.spacingAfter;
    }

    if (
        source.spacingBottom !==
        undefined
    ) {
        return source.spacingBottom;
    }

    return fallback;
}

function normalizeDividerLayout(
    value,
    fallback = DEFAULT_LAYOUT
) {
    const source =
        isPlainObject(value)
            ? value
            : {};

    const orientation =
        normalizeOrientation(
            source.orientation,
            fallback.orientation
        );

    const lengthMode =
        normalizeLengthMode(
            source.lengthMode,
            orientation,
            fallback.lengthMode
        );

    const fallbackLength =
        lengthMode ===
        "pixels"
            ? (
                orientation ===
                "vertical"
                    ? 240
                    : 600
            )
            : 100;

    const lengthMaximum =
        lengthMode ===
        "percent"
            ? 100
            : 2400;

    const lengthMinimum =
        lengthMode ===
        "percent"
            ? 10
            : 20;

    return {
        orientation,

        style:
            normalizeStyle(
                source.style,
                fallback.style
            ),

        color:
            normalizeColor(
                source.color,
                fallback.color
            ),

        opacity:
            clampNumber(
                source.opacity,
                5,
                100,
                fallback.opacity
            ),

        thickness:
            clampNumber(
                source.thickness,
                1,
                32,
                fallback.thickness
            ),

        lengthMode,

        length:
            clampNumber(
                getLegacyLength(
                    source,
                    fallback.length ??
                    fallbackLength
                ),
                lengthMinimum,
                lengthMaximum,
                fallback.length ??
                fallbackLength
            ),

        alignment:
            normalizeAlignment(
                source.alignment,
                fallback.alignment
            ),

        spacingBefore:
            clampNumber(
                getLegacySpacingBefore(
                    source,
                    fallback.spacingBefore
                ),
                0,
                240,
                fallback.spacingBefore
            ),

        spacingAfter:
            clampNumber(
                getLegacySpacingAfter(
                    source,
                    fallback.spacingAfter
                ),
                0,
                240,
                fallback.spacingAfter
            ),

        verticalMinHeight:
            clampNumber(
                source.verticalMinHeight,
                40,
                2000,
                fallback.verticalMinHeight
            ),

        showLabel:
            Boolean(
                source.showLabel
            ),

        label:
            normalizeText(
                source.label,
                fallback.label,
                120
            )
    };
}

function normalizeResponsiveDevice(
    value,
    desktopLayout
) {
    const source =
        isPlainObject(value)
            ? value
            : {};

    return {
        enabled:
            Boolean(
                source.enabled
            ),

        ...normalizeDividerLayout(
            source,
            desktopLayout
        )
    };
}

export function createDefaultDividerBlockData() {
    return {
        orientation: "horizontal",
        style: "solid",
        color: "#334155",
        opacity: 100,
        thickness: 1,

        /*
         * Die alten Feldnamen bleiben zunächst erhalten,
         * damit bestehende Divider-Eigenschaften weiterhin
         * funktionieren.
         */
        width: 100,
        lengthMode: "percent",
        alignment: "center",

        spacingTop: 36,
        spacingBottom: 36,

        verticalMinHeight: 240,

        showLabel: false,
        label: "BluePulse",

        responsive: {
            tablet: {
                enabled: false
            },

            mobile: {
                enabled: false
            }
        }
    };
}

export function normalizeDividerBlockSettings(
    value
) {
    const source =
        isPlainObject(value)
            ? value
            : {};

    const desktop =
        normalizeDividerLayout(
            source,
            DEFAULT_LAYOUT
        );

    const responsiveSource =
        isPlainObject(
            source.responsive
        )
            ? source.responsive
            : {};

    return {
        ...desktop,

        responsive: {
            tablet:
                normalizeResponsiveDevice(
                    responsiveSource.tablet,
                    desktop
                ),

            mobile:
                normalizeResponsiveDevice(
                    responsiveSource.mobile,
                    desktop
                )
        }
    };
}

export function getDividerBlockSettings(
    data
) {
    return normalizeDividerBlockSettings(
        data
    );
}

export function resolveDividerLayoutForDevice(
    settings,
    device
) {
    const normalizedSettings =
        normalizeDividerBlockSettings(
            settings
        );

    if (
        device !==
            "tablet" &&
        device !==
            "mobile"
    ) {
        return normalizeDividerLayout(
            normalizedSettings
        );
    }

    const responsiveSettings =
        normalizedSettings
            .responsive[
                device
            ];

    if (
        !responsiveSettings
            .enabled
    ) {
        return normalizeDividerLayout(
            normalizedSettings
        );
    }

    return normalizeDividerLayout(
        responsiveSettings,
        normalizedSettings
    );
}

export function updateDividerBlockSettings(
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
        getDividerBlockSettings(
            block.data
        );

    const normalizedPatch =
        isPlainObject(patch)
            ? patch
            : {};

    const nextSettings =
        normalizeDividerBlockSettings({
            ...currentSettings,
            ...normalizedPatch,

            responsive: {
                tablet: {
                    ...currentSettings
                        .responsive
                        .tablet,

                    ...(
                        isPlainObject(
                            normalizedPatch
                                .responsive
                                ?.tablet
                        )
                            ? normalizedPatch
                                .responsive
                                .tablet
                            : {}
                    )
                },

                mobile: {
                    ...currentSettings
                        .responsive
                        .mobile,

                    ...(
                        isPlainObject(
                            normalizedPatch
                                .responsive
                                ?.mobile
                        )
                            ? normalizedPatch
                                .responsive
                                .mobile
                            : {}
                    )
                }
            }
        });

    return {
        ...block,

        data: {
            ...block.data,
            ...nextSettings
        }
    };
}

export function updateResponsiveDividerBlockSettings(
    block,
    device,
    patch
) {
    if (
        device !==
            "tablet" &&
        device !==
            "mobile"
    ) {
        return block;
    }

    const currentSettings =
        getDividerBlockSettings(
            block.data
        );

    return updateDividerBlockSettings(
        block,
        {
            responsive: {
                [
                    device
                ]: {
                    ...currentSettings
                        .responsive[
                            device
                        ],

                    ...(
                        isPlainObject(patch)
                            ? patch
                            : {}
                    )
                }
            }
        }
    );
}