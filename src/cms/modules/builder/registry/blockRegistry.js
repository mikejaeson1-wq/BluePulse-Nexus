const blocks =
    new Map();

const CATEGORY_ORDER = [
    "Layout",
    "Inhalt",
    "Medien",
    "Interaktion",
    "Daten",
    "Erweitert",
    "Allgemein"
];

function normalizeText(
    value,
    fallback = ""
) {
    const normalized =
        String(
            value ??
            ""
        ).trim();

    return normalized ||
        fallback;
}

function normalizeKeywords(
    value
) {
    if (
        !Array.isArray(
            value
        )
    ) {
        return [];
    }

    return [
        ...new Set(
            value
                .map(
                    (keyword) =>
                        normalizeText(
                            keyword
                        ).toLowerCase()
                )
                .filter(
                    Boolean
                )
        )
    ];
}

function normalizeOrder(
    value,
    fallback = 100
) {
    const order =
        Number(value);

    return Number.isFinite(
        order
    )
        ? order
        : fallback;
}

function normalizeVersion(
    value
) {
    const version =
        Number.parseInt(
            value,
            10
        );

    return Number.isInteger(
        version
    ) &&
        version >
        0
        ? version
        : 1;
}

function normalizeDefaultData(
    value
) {
    if (
        !value ||
        typeof value !==
            "object" ||
        Array.isArray(
            value
        )
    ) {
        return {};
    }

    return value;
}

function normalizeDefinition(
    definition
) {
    if (
        !definition ||
        typeof definition !==
            "object"
    ) {
        throw new TypeError(
            "Eine Blockdefinition muss ein Objekt sein."
        );
    }

    const type =
        normalizeText(
            definition.type
        ).toLowerCase();

    if (!type) {
        throw new Error(
            "Eine Blockdefinition benötigt einen eindeutigen Typ."
        );
    }

    if (
        !/^[a-z][a-z0-9_-]*$/.test(
            type
        )
    ) {
        throw new Error(
            `Der Blocktyp „${type}“ besitzt ein ungültiges Format.`
        );
    }

    if (
        typeof definition.component !==
        "function"
    ) {
        throw new Error(
            `Der Block „${type}“ besitzt keine gültige React-Komponente.`
        );
    }

    return {
        ...definition,

        type,

        name:
            normalizeText(
                definition.name,
                type
            ),

        description:
            normalizeText(
                definition.description,
                "Inhaltsblock für den BluePulse Builder."
            ),

        icon:
            normalizeText(
                definition.icon,
                "bi-box"
            ),

        category:
            normalizeText(
                definition.category,
                "Allgemein"
            ),

        keywords:
            normalizeKeywords(
                definition.keywords
            ),

        order:
            normalizeOrder(
                definition.order
            ),

        version:
            normalizeVersion(
                definition.version
            ),

        defaultData:
            normalizeDefaultData(
                definition.defaultData
            )
    };
}

function getCategoryPosition(
    category
) {
    const position =
        CATEGORY_ORDER.indexOf(
            category
        );

    return position ===
        -1
        ? CATEGORY_ORDER.length
        : position;
}

function compareBlocks(
    firstBlock,
    secondBlock
) {
    const categoryDifference =
        getCategoryPosition(
            firstBlock.category
        ) -
        getCategoryPosition(
            secondBlock.category
        );

    if (
        categoryDifference !==
        0
    ) {
        return categoryDifference;
    }

    const orderDifference =
        firstBlock.order -
        secondBlock.order;

    if (
        orderDifference !==
        0
    ) {
        return orderDifference;
    }

    return firstBlock.name.localeCompare(
        secondBlock.name,
        "de"
    );
}

export function registerBlock(
    definition
) {
    const normalizedDefinition =
        normalizeDefinition(
            definition
        );

    if (
        blocks.has(
            normalizedDefinition.type
        )
    ) {
        blocks.set(
            normalizedDefinition.type,
            normalizedDefinition
        );

        return normalizedDefinition;
    }

    blocks.set(
        normalizedDefinition.type,
        normalizedDefinition
    );

    return normalizedDefinition;
}

export function getBlock(
    type
) {
    return blocks.get(
        normalizeText(
            type
        ).toLowerCase()
    );
}

export function getBlocks() {
    return [
        ...blocks.values()
    ].sort(
        compareBlocks
    );
}

export function getBlockCategories() {
    return [
        ...new Set(
            getBlocks().map(
                (block) =>
                    block.category
            )
        )
    ];
}

export function hasBlock(
    type
) {
    return blocks.has(
        normalizeText(
            type
        ).toLowerCase()
    );
}

export function clearBlockRegistry() {
    blocks.clear();
}