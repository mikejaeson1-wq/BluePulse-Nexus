const blocks = new Map();

export function registerBlock(definition) {

    if (blocks.has(definition.type)) {

        console.warn(`Block "${definition.type}" ist bereits registriert.`);
        return;

    }

    blocks.set(definition.type, definition);

}

export function getBlock(type) {

    return blocks.get(type);

}

export function getBlocks() {

    return [...blocks.values()];

}