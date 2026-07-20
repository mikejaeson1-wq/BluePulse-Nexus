export function createBlock(definition) {

    return {

        id: crypto.randomUUID(),

        type: definition.type,

        data: structuredClone(definition.defaultData)

    };

}