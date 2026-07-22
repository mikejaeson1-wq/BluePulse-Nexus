import {
    createDefaultBlockSettings
} from "@shared/pages/blockSettings";

function createBlockId() {
    return (
        globalThis.crypto
            ?.randomUUID?.() ??
        `block-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`
    );
}

function cloneDefaultData(
    value
) {
    const source =
        value &&
        typeof value ===
            "object"
            ? value
            : {};

    if (
        typeof globalThis
            .structuredClone ===
        "function"
    ) {
        return globalThis
            .structuredClone(
                source
            );
    }

    return JSON.parse(
        JSON.stringify(
            source
        )
    );
}

export function createBlock(
    definition
) {
    if (
        !definition ||
        typeof definition !==
            "object" ||
        !definition.type
    ) {
        throw new TypeError(
            "Für einen neuen Block wird eine gültige Blockdefinition benötigt."
        );
    }

    return {
        id:
            createBlockId(),

        type:
            definition.type,

        data:
            cloneDefaultData(
                definition.defaultData
            ),

        settings:
            createDefaultBlockSettings()
    };
}