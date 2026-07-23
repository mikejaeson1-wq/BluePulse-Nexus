export const IMAGE_SHAPE_OPTIONS = [
    {
        value: "square",
        label: "Eckig",
        description: "Klassische rechteckige Darstellung ohne Rundung.",
        icon: "bi-square",
        recommendedAspectRatio: null
    },
    {
        value: "rounded",
        label: "Abgerundet",
        description: "Verwendet die frei einstellbare Eckenrundung.",
        icon: "bi-square-fill",
        recommendedAspectRatio: null
    },
    {
        value: "circle",
        label: "Kreis",
        description: "Runde Darstellung für Porträts, Logos und Profile.",
        icon: "bi-circle",
        recommendedAspectRatio: "1:1"
    },
    {
        value: "oval",
        label: "Oval",
        description: "Weiche elliptische Bildform.",
        icon: "bi-record-circle",
        recommendedAspectRatio: "4:3"
    },
    {
        value: "pebble",
        label: "Kiesel",
        description: "Asymmetrische, weich gerundete Kieselform.",
        icon: "bi-gem",
        recommendedAspectRatio: "1:1"
    },
    {
        value: "drop",
        label: "Tropfen",
        description: "Organische Tropfenform mit spitzem oberen Ende.",
        icon: "bi-droplet",
        recommendedAspectRatio: "1:1"
    },
    {
        value: "hexagon",
        label: "Hexagon",
        description: "Geometrische sechseckige Bildform.",
        icon: "bi-hexagon",
        recommendedAspectRatio: "1:1"
    },
    {
        value: "organic",
        label: "Freiform",
        description: "Natürlich wirkende organische Freiform.",
        icon: "bi-stars",
        recommendedAspectRatio: "1:1"
    }
];

const RESPONSIVE_DEVICES =
    new Set([
        "tablet",
        "mobile"
    ]);

const SHAPE_VALUES =
    new Set(
        IMAGE_SHAPE_OPTIONS.map(
            (option) =>
                option.value
        )
    );

const DEFAULT_IMAGE_SHAPE_SETTINGS = {
    shape: "rounded",

    responsive: {
        tablet: {
            enabled: false,
            shape: "rounded"
        },

        mobile: {
            enabled: false,
            shape: "rounded"
        }
    }
};

function isPlainObject(value) {
    return Boolean(
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
    );
}

function normalizeText(
    value,
    maximumLength = 40
) {
    return String(
        value ??
        ""
    )
        .trim()
        .toLowerCase()
        .slice(
            0,
            maximumLength
        );
}

function normalizeShape(
    value,
    fallback = "rounded"
) {
    const normalizedValue =
        normalizeText(
            value
        );

    return SHAPE_VALUES.has(
        normalizedValue
    )
        ? normalizedValue
        : fallback;
}

function normalizeResponsiveShape(
    value,
    fallbackShape
) {
    const source =
        isPlainObject(value)
            ? value
            : {};

    return {
        enabled:
            source.enabled !==
            undefined
                ? Boolean(
                    source.enabled
                )
                : false,

        shape:
            normalizeShape(
                source.shape,
                fallbackShape
            )
    };
}

export function createDefaultImageShapeSettings() {
    return normalizeImageShapeSettings(
        DEFAULT_IMAGE_SHAPE_SETTINGS
    );
}

export function normalizeImageShapeSettings(
    value
) {
    const source =
        isPlainObject(value)
            ? value
            : {};

    const desktopShape =
        normalizeShape(
            source.shape,
            DEFAULT_IMAGE_SHAPE_SETTINGS.shape
        );

    const responsiveSource =
        isPlainObject(
            source.responsive
        )
            ? source.responsive
            : {};

    return {
        shape:
            desktopShape,

        responsive: {
            tablet:
                normalizeResponsiveShape(
                    responsiveSource.tablet,
                    desktopShape
                ),

            mobile:
                normalizeResponsiveShape(
                    responsiveSource.mobile,
                    desktopShape
                )
        }
    };
}

export function getImageShapeSettings(
    data
) {
    return normalizeImageShapeSettings(
        data?.imageShapeSettings
    );
}

export function resolveImageShapeForDevice(
    settingsValue,
    device = "desktop"
) {
    const settings =
        normalizeImageShapeSettings(
            settingsValue
        );

    if (
        !RESPONSIVE_DEVICES.has(
            device
        )
    ) {
        return settings.shape;
    }

    const responsiveSettings =
        settings.responsive[
            device
        ];

    if (
        !responsiveSettings
            ?.enabled
    ) {
        return settings.shape;
    }

    return normalizeShape(
        responsiveSettings.shape,
        settings.shape
    );
}

export function getImageShapeDefinition(
    shape
) {
    const normalizedShape =
        normalizeShape(
            shape
        );

    return (
        IMAGE_SHAPE_OPTIONS.find(
            (option) =>
                option.value ===
                normalizedShape
        ) ??
        IMAGE_SHAPE_OPTIONS[1]
    );
}

export function getImageShapeCss(
    shape
) {
    switch (
        normalizeShape(
            shape
        )
    ) {
        case "square":
            return {
                borderRadius: "0",
                clipPath: "none"
            };

        case "circle":
            return {
                borderRadius: "50%",
                clipPath:
                    "circle(50% at 50% 50%)"
            };

        case "oval":
            return {
                borderRadius:
                    "50% / 44%",
                clipPath:
                    "ellipse(50% 44% at 50% 50%)"
            };

        case "pebble":
            return {
                borderRadius:
                    "63% 37% 55% 45% / 46% 58% 42% 54%",
                clipPath: "none"
            };

        case "drop":
            return {
                borderRadius: "0",
                clipPath:
                    "polygon(50% 0%, 68% 17%, 84% 36%, 95% 58%, 91% 77%, 79% 92%, 63% 100%, 37% 100%, 21% 92%, 9% 77%, 5% 58%, 16% 36%, 32% 17%)"
            };

        case "hexagon":
            return {
                borderRadius: "0",
                clipPath:
                    "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)"
            };

        case "organic":
            return {
                borderRadius:
                    "42% 58% 63% 37% / 44% 38% 62% 56%",
                clipPath: "none"
            };

        case "rounded":
        default:
            return {
                borderRadius:
                    "var(--bp-image-border-radius, 12px)",
                clipPath: "none"
            };
    }
}

export function updateImageShapeSettings(
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
        getImageShapeSettings(
            block.data
        );

    const normalizedPatch =
        isPlainObject(patch)
            ? patch
            : {};

    return {
        ...block,

        data: {
            ...block.data,

            imageShapeSettings:
                normalizeImageShapeSettings({
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
                })
        }
    };
}

export function updateResponsiveImageShapeSettings(
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

    return updateImageShapeSettings(
        block,
        {
            responsive: {
                [device]:
                    patch
            }
        }
    );
}