export const COLUMNS_COUNT_OPTIONS = [
    {
        value: 2,
        label: "2 Spalten"
    },
    {
        value: 3,
        label: "3 Spalten"
    },
    {
        value: 4,
        label: "4 Spalten"
    }
];

export const COLUMNS_RATIO_PRESETS = {
    2: [
        {
            value: "1-1",
            label: "50 / 50",
            template: "minmax(0, 1fr) minmax(0, 1fr)"
        },
        {
            value: "3-2",
            label: "60 / 40",
            template: "minmax(0, 3fr) minmax(0, 2fr)"
        },
        {
            value: "2-3",
            label: "40 / 60",
            template: "minmax(0, 2fr) minmax(0, 3fr)"
        },
        {
            value: "1-2",
            label: "33 / 67",
            template: "minmax(0, 1fr) minmax(0, 2fr)"
        },
        {
            value: "2-1",
            label: "67 / 33",
            template: "minmax(0, 2fr) minmax(0, 1fr)"
        }
    ],

    3: [
        {
            value: "1-1-1",
            label: "33 / 33 / 33",
            template:
                "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)"
        },
        {
            value: "2-1-1",
            label: "50 / 25 / 25",
            template:
                "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)"
        },
        {
            value: "1-2-1",
            label: "25 / 50 / 25",
            template:
                "minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr)"
        },
        {
            value: "1-1-2",
            label: "25 / 25 / 50",
            template:
                "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr)"
        }
    ],

    4: [
        {
            value: "1-1-1-1",
            label: "25 / 25 / 25 / 25",
            template:
                "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)"
        },
        {
            value: "2-1-1-1",
            label: "40 / 20 / 20 / 20",
            template:
                "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)"
        },
        {
            value: "1-2-1-1",
            label: "20 / 40 / 20 / 20",
            template:
                "minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)"
        },
        {
            value: "1-1-2-1",
            label: "20 / 20 / 40 / 20",
            template:
                "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr)"
        },
        {
            value: "1-1-1-2",
            label: "20 / 20 / 20 / 40",
            template:
                "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr)"
        }
    ]
};

export const COLUMNS_VERTICAL_ALIGNMENT_OPTIONS = [
    {
        value: "stretch",
        label: "Gleiche Höhe"
    },
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

const VALID_COLUMN_COUNTS =
    new Set([
        2,
        3,
        4
    ]);

const VALID_VERTICAL_ALIGNMENTS =
    new Set(
        COLUMNS_VERTICAL_ALIGNMENT_OPTIONS.map(
            (option) =>
                option.value
        )
    );

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

const DEFAULT_RESPONSIVE_SETTINGS = {
    tablet: {
        stack: false,
        reverse: false,
        gap: 24
    },

    mobile: {
        stack: true,
        reverse: false,
        gap: 16
    }
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

    if (!Number.isFinite(numericValue)) {
        return fallback;
    }

    return Math.min(
        maximum,
        Math.max(
            minimum,
            Math.round(numericValue)
        )
    );
}

function normalizeBoolean(
    value,
    fallback = false
) {
    if (value === undefined) {
        return fallback;
    }

    return Boolean(value);
}

function normalizeText(
    value,
    maximumLength = 120
) {
    return String(value ?? "")
        .trim()
        .slice(
            0,
            maximumLength
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

function normalizeColumnCount(value) {
    const count =
        Number.parseInt(
            value,
            10
        );

    return VALID_COLUMN_COUNTS.has(count)
        ? count
        : 2;
}

function getDefaultRatio(columnCount) {
    return COLUMNS_RATIO_PRESETS[
        columnCount
    ]?.[0]?.value ?? "1-1";
}

function normalizeRatio(
    value,
    columnCount
) {
    const presets =
        COLUMNS_RATIO_PRESETS[
            columnCount
        ] ?? [];

    const normalizedValue =
        normalizeText(
            value,
            30
        );

    return presets.some(
        (preset) =>
            preset.value ===
            normalizedValue
    )
        ? normalizedValue
        : getDefaultRatio(
            columnCount
        );
}

function normalizeVerticalAlignment(value) {
    const normalizedValue =
        normalizeText(
            value,
            30
        ).toLowerCase();

    return VALID_VERTICAL_ALIGNMENTS.has(
        normalizedValue
    )
        ? normalizedValue
        : "stretch";
}

function normalizeNestedBlocks(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter(
        (block) =>
            isPlainObject(block) &&
            normalizeText(
                block.id,
                160
            ) &&
            normalizeText(
                block.type,
                80
            )
    );
}

function normalizeColumnAppearance(value) {
    const source =
        isPlainObject(value)
            ? value
            : {};

    return {
        backgroundEnabled:
            normalizeBoolean(
                source.backgroundEnabled,
                DEFAULT_COLUMN_APPEARANCE.backgroundEnabled
            ),

        backgroundColor:
            normalizeColor(
                source.backgroundColor,
                DEFAULT_COLUMN_APPEARANCE.backgroundColor
            ),

        paddingTop:
            clampNumber(
                source.paddingTop,
                0,
                240,
                DEFAULT_COLUMN_APPEARANCE.paddingTop
            ),

        paddingRight:
            clampNumber(
                source.paddingRight,
                0,
                240,
                DEFAULT_COLUMN_APPEARANCE.paddingRight
            ),

        paddingBottom:
            clampNumber(
                source.paddingBottom,
                0,
                240,
                DEFAULT_COLUMN_APPEARANCE.paddingBottom
            ),

        paddingLeft:
            clampNumber(
                source.paddingLeft,
                0,
                240,
                DEFAULT_COLUMN_APPEARANCE.paddingLeft
            ),

        borderWidth:
            clampNumber(
                source.borderWidth,
                0,
                16,
                DEFAULT_COLUMN_APPEARANCE.borderWidth
            ),

        borderColor:
            normalizeColor(
                source.borderColor,
                DEFAULT_COLUMN_APPEARANCE.borderColor
            ),

        borderRadius:
            clampNumber(
                source.borderRadius,
                0,
                100,
                DEFAULT_COLUMN_APPEARANCE.borderRadius
            )
    };
}

function createColumn(
    index,
    source = {}
) {
    return {
        id:
            normalizeText(
                source.id,
                160
            ) ||
            `column-${index + 1}`,

        label:
            normalizeText(
                source.label,
                80
            ) ||
            `Spalte ${index + 1}`,

        blocks:
            normalizeNestedBlocks(
                source.blocks
            ),

        appearance:
            normalizeColumnAppearance(
                source.appearance
            )
    };
}

function normalizeColumns(
    value,
    columnCount
) {
    const sourceColumns =
        Array.isArray(value)
            ? value
            : [];

    const columns =
        Array.from(
            {
                length: columnCount
            },
            (
                unused,
                index
            ) =>
                createColumn(
                    index,
                    sourceColumns[index]
                )
        );

    if (
        sourceColumns.length >
        columnCount
    ) {
        const overflowBlocks =
            sourceColumns
                .slice(columnCount)
                .flatMap(
                    (column) =>
                        normalizeNestedBlocks(
                            column?.blocks
                        )
                );

        if (
            overflowBlocks.length >
            0
        ) {
            const lastIndex =
                columns.length - 1;

            columns[lastIndex] = {
                ...columns[lastIndex],

                blocks: [
                    ...columns[lastIndex].blocks,
                    ...overflowBlocks
                ]
            };
        }
    }

    return columns;
}

function normalizeResponsiveDevice(
    value,
    fallback
) {
    const source =
        isPlainObject(value)
            ? value
            : {};

    return {
        stack:
            normalizeBoolean(
                source.stack,
                fallback.stack
            ),

        reverse:
            normalizeBoolean(
                source.reverse,
                fallback.reverse
            ),

        gap:
            clampNumber(
                source.gap,
                0,
                160,
                fallback.gap
            )
    };
}

export function normalizeColumnsBlockData(value) {
    const source =
        isPlainObject(value)
            ? value
            : {};

    const columnCount =
        normalizeColumnCount(
            source.columnCount
        );

    const responsiveSource =
        isPlainObject(
            source.responsive
        )
            ? source.responsive
            : {};

    return {
        columnCount,

        ratio:
            normalizeRatio(
                source.ratio,
                columnCount
            ),

        gap:
            clampNumber(
                source.gap,
                0,
                160,
                24
            ),

        verticalAlignment:
            normalizeVerticalAlignment(
                source.verticalAlignment
            ),

        columns:
            normalizeColumns(
                source.columns,
                columnCount
            ),

        responsive: {
            tablet:
                normalizeResponsiveDevice(
                    responsiveSource.tablet,
                    DEFAULT_RESPONSIVE_SETTINGS.tablet
                ),

            mobile:
                normalizeResponsiveDevice(
                    responsiveSource.mobile,
                    DEFAULT_RESPONSIVE_SETTINGS.mobile
                )
        }
    };
}

export function createDefaultColumnsBlockData() {
    return normalizeColumnsBlockData({
        columnCount: 2,
        ratio: "1-1",
        gap: 24,
        verticalAlignment: "stretch",
        columns: [],
        responsive:
            DEFAULT_RESPONSIVE_SETTINGS
    });
}

export function getColumnsBlockData(block) {
    return normalizeColumnsBlockData(
        block?.data
    );
}

export function getColumnsRatioPreset(
    columnCount,
    ratio
) {
    const normalizedCount =
        normalizeColumnCount(
            columnCount
        );

    const normalizedRatio =
        normalizeRatio(
            ratio,
            normalizedCount
        );

    return (
        COLUMNS_RATIO_PRESETS[
            normalizedCount
        ]?.find(
            (preset) =>
                preset.value ===
                normalizedRatio
        ) ??
        COLUMNS_RATIO_PRESETS[
            normalizedCount
        ]?.[0] ??
        null
    );
}

export function getColumnsGridTemplate(
    data
) {
    const normalizedData =
        normalizeColumnsBlockData(
            data
        );

    return (
        getColumnsRatioPreset(
            normalizedData.columnCount,
            normalizedData.ratio
        )?.template ??
        "minmax(0, 1fr) minmax(0, 1fr)"
    );
}

export function getColumnsRatioLabel(
    data
) {
    const normalizedData =
        normalizeColumnsBlockData(
            data
        );

    return (
        getColumnsRatioPreset(
            normalizedData.columnCount,
            normalizedData.ratio
        )?.label ??
        "50 / 50"
    );
}

export function updateColumnsBlockData(
    block,
    patch
) {
    if (
        !block ||
        typeof block !== "object"
    ) {
        return block;
    }

    const currentData =
        getColumnsBlockData(
            block
        );

    const normalizedPatch =
        isPlainObject(patch)
            ? patch
            : {};

    return {
        ...block,

        data:
            normalizeColumnsBlockData({
                ...currentData,
                ...normalizedPatch,

                responsive: {
                    tablet: {
                        ...currentData.responsive.tablet,
                        ...(
                            isPlainObject(
                                normalizedPatch.responsive?.tablet
                            )
                                ? normalizedPatch.responsive.tablet
                                : {}
                        )
                    },

                    mobile: {
                        ...currentData.responsive.mobile,
                        ...(
                            isPlainObject(
                                normalizedPatch.responsive?.mobile
                            )
                                ? normalizedPatch.responsive.mobile
                                : {}
                        )
                    }
                }
            })
    };
}

export function updateColumnsBlockColumn(
    block,
    columnId,
    patch
) {
    const currentData =
        getColumnsBlockData(
            block
        );

    const normalizedColumnId =
        normalizeText(
            columnId,
            160
        );

    const nextColumns =
        currentData.columns.map(
            (
                column,
                index
            ) => {
                if (
                    column.id !==
                    normalizedColumnId
                ) {
                    return column;
                }

                return createColumn(
                    index,
                    {
                        ...column,
                        ...(
                            isPlainObject(patch)
                                ? patch
                                : {}
                        ),

                        appearance: {
                            ...column.appearance,
                            ...(
                                isPlainObject(
                                    patch?.appearance
                                )
                                    ? patch.appearance
                                    : {}
                            )
                        }
                    }
                );
            }
        );

    return updateColumnsBlockData(
        block,
        {
            columns:
                nextColumns
        }
    );
}

export function replaceColumnsBlockColumnBlocks(
    block,
    columnId,
    blocks
) {
    return updateColumnsBlockColumn(
        block,
        columnId,
        {
            blocks:
                normalizeNestedBlocks(
                    blocks
                )
        }
    );
}