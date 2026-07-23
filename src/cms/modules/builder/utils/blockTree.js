import {
    normalizeColumnsBlockData
} from "@shared/layout/columnsBlockModel";

function isPlainObject(value) {
    return Boolean(
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
    );
}

function normalizeBlocks(value) {
    return Array.isArray(value)
        ? value.filter(isPlainObject)
        : [];
}

function isColumnsBlock(block) {
    return (
        block?.type ===
        "columns"
    );
}

function cloneValue(value) {
    if (
        typeof globalThis
            .structuredClone ===
        "function"
    ) {
        return globalThis
            .structuredClone(
                value
            );
    }

    return JSON.parse(
        JSON.stringify(value)
    );
}

function createId(prefix = "block") {
    return (
        globalThis.crypto
            ?.randomUUID?.() ??
        `${prefix}-${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}`
    );
}

function rebuildColumnsBlock(
    block,
    columns
) {
    const data =
        normalizeColumnsBlockData(
            block.data
        );

    return {
        ...block,

        data: {
            ...data,
            columns
        }
    };
}

function updateBlockList(
    blocks,
    targetId,
    updater
) {
    const sourceBlocks =
        normalizeBlocks(
            blocks
        );

    let changed =
        false;

    const nextBlocks =
        sourceBlocks.map(
            (block) => {
                if (
                    block.id ===
                    targetId
                ) {
                    const updatedBlock =
                        updater(
                            block
                        );

                    if (
                        updatedBlock !==
                        block
                    ) {
                        changed =
                            true;
                    }

                    return (
                        updatedBlock ??
                        block
                    );
                }

                if (
                    !isColumnsBlock(
                        block
                    )
                ) {
                    return block;
                }

                const data =
                    normalizeColumnsBlockData(
                        block.data
                    );

                let columnsChanged =
                    false;

                const nextColumns =
                    data.columns.map(
                        (column) => {
                            const nextNestedBlocks =
                                updateBlockList(
                                    column.blocks,
                                    targetId,
                                    updater
                                );

                            if (
                                nextNestedBlocks ===
                                column.blocks
                            ) {
                                return column;
                            }

                            columnsChanged =
                                true;

                            return {
                                ...column,
                                blocks:
                                    nextNestedBlocks
                            };
                        }
                    );

                if (!columnsChanged) {
                    return block;
                }

                changed =
                    true;

                return rebuildColumnsBlock(
                    block,
                    nextColumns
                );
            }
        );

    return changed
        ? nextBlocks
        : sourceBlocks;
}

function removeFromBlockList(
    blocks,
    targetId
) {
    const sourceBlocks =
        normalizeBlocks(
            blocks
        );

    const directIndex =
        sourceBlocks.findIndex(
            (block) =>
                block.id ===
                targetId
        );

    if (
        directIndex >=
        0
    ) {
        return [
            ...sourceBlocks.slice(
                0,
                directIndex
            ),

            ...sourceBlocks.slice(
                directIndex + 1
            )
        ];
    }

    let changed =
        false;

    const nextBlocks =
        sourceBlocks.map(
            (block) => {
                if (
                    !isColumnsBlock(
                        block
                    )
                ) {
                    return block;
                }

                const data =
                    normalizeColumnsBlockData(
                        block.data
                    );

                let columnsChanged =
                    false;

                const nextColumns =
                    data.columns.map(
                        (column) => {
                            const nextNestedBlocks =
                                removeFromBlockList(
                                    column.blocks,
                                    targetId
                                );

                            if (
                                nextNestedBlocks ===
                                column.blocks
                            ) {
                                return column;
                            }

                            columnsChanged =
                                true;

                            return {
                                ...column,
                                blocks:
                                    nextNestedBlocks
                            };
                        }
                    );

                if (!columnsChanged) {
                    return block;
                }

                changed =
                    true;

                return rebuildColumnsBlock(
                    block,
                    nextColumns
                );
            }
        );

    return changed
        ? nextBlocks
        : sourceBlocks;
}

function insertAfterInBlockList(
    blocks,
    targetId,
    newBlock
) {
    const sourceBlocks =
        normalizeBlocks(
            blocks
        );

    const directIndex =
        sourceBlocks.findIndex(
            (block) =>
                block.id ===
                targetId
        );

    if (
        directIndex >=
        0
    ) {
        return [
            ...sourceBlocks.slice(
                0,
                directIndex + 1
            ),

            newBlock,

            ...sourceBlocks.slice(
                directIndex + 1
            )
        ];
    }

    let changed =
        false;

    const nextBlocks =
        sourceBlocks.map(
            (block) => {
                if (
                    !isColumnsBlock(
                        block
                    )
                ) {
                    return block;
                }

                const data =
                    normalizeColumnsBlockData(
                        block.data
                    );

                let columnsChanged =
                    false;

                const nextColumns =
                    data.columns.map(
                        (column) => {
                            const nextNestedBlocks =
                                insertAfterInBlockList(
                                    column.blocks,
                                    targetId,
                                    newBlock
                                );

                            if (
                                nextNestedBlocks ===
                                column.blocks
                            ) {
                                return column;
                            }

                            columnsChanged =
                                true;

                            return {
                                ...column,
                                blocks:
                                    nextNestedBlocks
                            };
                        }
                    );

                if (!columnsChanged) {
                    return block;
                }

                changed =
                    true;

                return rebuildColumnsBlock(
                    block,
                    nextColumns
                );
            }
        );

    return changed
        ? nextBlocks
        : sourceBlocks;
}

function moveInsideBlockList(
    blocks,
    targetId,
    offset
) {
    const sourceBlocks =
        normalizeBlocks(
            blocks
        );

    const directIndex =
        sourceBlocks.findIndex(
            (block) =>
                block.id ===
                targetId
        );

    if (
        directIndex >=
        0
    ) {
        const nextIndex =
            directIndex +
            offset;

        if (
            nextIndex <
                0 ||
            nextIndex >=
                sourceBlocks.length
        ) {
            return {
                blocks:
                    sourceBlocks,

                found:
                    true
            };
        }

        const nextBlocks = [
            ...sourceBlocks
        ];

        [
            nextBlocks[
                directIndex
            ],
            nextBlocks[
                nextIndex
            ]
        ] = [
            nextBlocks[
                nextIndex
            ],
            nextBlocks[
                directIndex
            ]
        ];

        return {
            blocks:
                nextBlocks,

            found:
                true
        };
    }

    for (
        let blockIndex = 0;
        blockIndex <
        sourceBlocks.length;
        blockIndex += 1
    ) {
        const block =
            sourceBlocks[
                blockIndex
            ];

        if (
            !isColumnsBlock(
                block
            )
        ) {
            continue;
        }

        const data =
            normalizeColumnsBlockData(
                block.data
            );

        for (
            let columnIndex = 0;
            columnIndex <
            data.columns.length;
            columnIndex += 1
        ) {
            const column =
                data.columns[
                    columnIndex
                ];

            const nestedResult =
                moveInsideBlockList(
                    column.blocks,
                    targetId,
                    offset
                );

            if (
                !nestedResult.found
            ) {
                continue;
            }

            if (
                nestedResult.blocks ===
                column.blocks
            ) {
                return {
                    blocks:
                        sourceBlocks,

                    found:
                        true
                };
            }

            const nextColumns = [
                ...data.columns
            ];

            nextColumns[
                columnIndex
            ] = {
                ...column,

                blocks:
                    nestedResult.blocks
            };

            const nextBlocks = [
                ...sourceBlocks
            ];

            nextBlocks[
                blockIndex
            ] =
                rebuildColumnsBlock(
                    block,
                    nextColumns
                );

            return {
                blocks:
                    nextBlocks,

                found:
                    true
            };
        }
    }

    return {
        blocks:
            sourceBlocks,

        found:
            false
    };
}

export function getBlockTreeEntries(
    blocks,
    options = {}
) {
    const sourceBlocks =
        normalizeBlocks(
            blocks
        );

    const {
        depth = 0,
        parentBlockId = null,
        columnId = null,
        columnLabel = ""
    } =
        options;

    const entries = [];

    sourceBlocks.forEach(
        (
            block,
            index
        ) => {
            entries.push({
                block,

                depth,

                parentBlockId,

                columnId,

                columnLabel,

                index,

                total:
                    sourceBlocks.length
            });

            if (
                !isColumnsBlock(
                    block
                )
            ) {
                return;
            }

            const data =
                normalizeColumnsBlockData(
                    block.data
                );

            data.columns.forEach(
                (column) => {
                    entries.push(
                        ...getBlockTreeEntries(
                            column.blocks,
                            {
                                depth:
                                    depth + 1,

                                parentBlockId:
                                    block.id,

                                columnId:
                                    column.id,

                                columnLabel:
                                    column.label
                            }
                        )
                    );
                }
            );
        }
    );

    return entries;
}

export function findBlockTreeEntry(
    blocks,
    targetId
) {
    if (!targetId) {
        return null;
    }

    return (
        getBlockTreeEntries(
            blocks
        ).find(
            (entry) =>
                entry.block.id ===
                targetId
        ) ??
        null
    );
}

export function updateBlockInTree(
    blocks,
    updatedBlock
) {
    if (
        !updatedBlock?.id
    ) {
        return normalizeBlocks(
            blocks
        );
    }

    return updateBlockList(
        blocks,
        updatedBlock.id,
        () =>
            updatedBlock
    );
}

export function removeBlockFromTree(
    blocks,
    targetId
) {
    if (!targetId) {
        return normalizeBlocks(
            blocks
        );
    }

    return removeFromBlockList(
        blocks,
        targetId
    );
}

export function appendBlockToColumn(
    blocks,
    parentBlockId,
    columnId,
    newBlock
) {
    if (
        !parentBlockId ||
        !columnId ||
        !newBlock
    ) {
        return normalizeBlocks(
            blocks
        );
    }

    return updateBlockList(
        blocks,
        parentBlockId,
        (parentBlock) => {
            if (
                !isColumnsBlock(
                    parentBlock
                )
            ) {
                return parentBlock;
            }

            const data =
                normalizeColumnsBlockData(
                    parentBlock.data
                );

            let foundColumn =
                false;

            const nextColumns =
                data.columns.map(
                    (column) => {
                        if (
                            column.id !==
                            columnId
                        ) {
                            return column;
                        }

                        foundColumn =
                            true;

                        return {
                            ...column,

                            blocks: [
                                ...column.blocks,
                                newBlock
                            ]
                        };
                    }
                );

            if (!foundColumn) {
                return parentBlock;
            }

            return rebuildColumnsBlock(
                parentBlock,
                nextColumns
            );
        }
    );
}

export function cloneBlockTree(
    block
) {
    const clonedBlock =
        cloneValue(
            block
        );

    clonedBlock.id =
        createId(
            "block"
        );

    if (
        !isColumnsBlock(
            clonedBlock
        )
    ) {
        return clonedBlock;
    }

    const data =
        normalizeColumnsBlockData(
            clonedBlock.data
        );

    clonedBlock.data = {
        ...data,

        columns:
            data.columns.map(
                (
                    column,
                    index
                ) => ({
                    ...column,

                    id:
                        createId(
                            `column-${index + 1}`
                        ),

                    blocks:
                        column.blocks.map(
                            cloneBlockTree
                        )
                })
            )
    };

    return clonedBlock;
}

export function duplicateBlockInTree(
    blocks,
    targetId
) {
    const entry =
        findBlockTreeEntry(
            blocks,
            targetId
        );

    if (!entry) {
        return {
            blocks:
                normalizeBlocks(
                    blocks
                ),

            duplicatedBlock:
                null
        };
    }

    const duplicatedBlock =
        cloneBlockTree(
            entry.block
        );

    return {
        blocks:
            insertAfterInBlockList(
                blocks,
                targetId,
                duplicatedBlock
            ),

        duplicatedBlock
    };
}

export function moveBlockInTree(
    blocks,
    targetId,
    offset
) {
    if (
        !targetId ||
        ![
            -1,
            1
        ].includes(
            offset
        )
    ) {
        return normalizeBlocks(
            blocks
        );
    }

    return moveInsideBlockList(
        blocks,
        targetId,
        offset
    ).blocks;
}