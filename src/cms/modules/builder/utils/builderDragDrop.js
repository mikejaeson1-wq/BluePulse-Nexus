import {
    closestCenter,
    pointerWithin
} from "@dnd-kit/core";

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

function normalizeId(value) {
    return String(
        value ??
        ""
    ).trim();
}

function isColumnsBlock(block) {
    return (
        block?.type ===
        "columns"
    );
}

function clampIndex(
    value,
    maximum
) {
    const numericValue =
        Number.parseInt(
            value,
            10
        );

    const normalizedValue =
        Number.isInteger(
            numericValue
        )
            ? numericValue
            : maximum;

    return Math.min(
        maximum,
        Math.max(
            0,
            normalizedValue
        )
    );
}

function rebuildColumnsBlock(
    block,
    normalizedData,
    columns
) {
    return {
        ...block,

        data: {
            ...(
                isPlainObject(
                    block.data
                )
                    ? block.data
                    : {}
            ),

            ...normalizedData,

            columns
        }
    };
}

function getCollisionContainer(
    argumentsValue,
    collisionId
) {
    return argumentsValue
        .droppableContainers
        ?.get?.(
            collisionId
        ) ??
        null;
}

function getCollisionData(
    argumentsValue,
    collisionId
) {
    return (
        getCollisionContainer(
            argumentsValue,
            collisionId
        )?.data?.current ??
        {}
    );
}

function getCollisionPriority(data) {
    if (
        data.type ===
            "builder-block" &&
        data.containerType ===
            "column"
    ) {
        return 50;
    }

    if (
        data.type ===
        "builder-column-dropzone"
    ) {
        return 40;
    }

    if (
        data.type ===
        "builder-block"
    ) {
        return 30;
    }

    return 0;
}

export function builderCollisionDetection(
    argumentsValue
) {
    const pointerCollisions =
        pointerWithin(
            argumentsValue
        );

    if (
        pointerCollisions.length >
        0
    ) {
        return [
            ...pointerCollisions
        ].sort(
            (
                firstCollision,
                secondCollision
            ) =>
                getCollisionPriority(
                    getCollisionData(
                        argumentsValue,
                        secondCollision.id
                    )
                ) -
                getCollisionPriority(
                    getCollisionData(
                        argumentsValue,
                        firstCollision.id
                    )
                )
        );
    }

    return closestCenter(
        argumentsValue
    );
}

function findBlockLocation(
    blocks,
    targetId,
    container = {
        type: "root"
    }
) {
    const sourceBlocks =
        normalizeBlocks(
            blocks
        );

    for (
        let index = 0;
        index <
        sourceBlocks.length;
        index += 1
    ) {
        const block =
            sourceBlocks[
                index
            ];

        if (
            block.id ===
            targetId
        ) {
            return {
                block,
                index,
                total:
                    sourceBlocks.length,
                container
            };
        }

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
            const column
            of data.columns
        ) {
            const nestedLocation =
                findBlockLocation(
                    column.blocks,
                    targetId,
                    {
                        type:
                            "column",

                        parentBlockId:
                            block.id,

                        columnId:
                            column.id
                    }
                );

            if (
                nestedLocation
            ) {
                return nestedLocation;
            }
        }
    }

    return null;
}

function blockContainsId(
    block,
    targetId
) {
    if (
        !block ||
        !targetId
    ) {
        return false;
    }

    if (
        block.id ===
        targetId
    ) {
        return true;
    }

    if (
        !isColumnsBlock(
            block
        )
    ) {
        return false;
    }

    const data =
        normalizeColumnsBlockData(
            block.data
        );

    return data.columns.some(
        (column) =>
            column.blocks.some(
                (nestedBlock) =>
                    blockContainsId(
                        nestedBlock,
                        targetId
                    )
            )
    );
}

function updateBlockById(
    blocks,
    targetId,
    updater
) {
    const sourceBlocks =
        normalizeBlocks(
            blocks
        );

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
            block.id ===
            targetId
        ) {
            const updatedBlock =
                updater(
                    block
                );

            if (
                !updatedBlock ||
                updatedBlock ===
                block
            ) {
                return {
                    blocks:
                        sourceBlocks,

                    changed:
                        false
                };
            }

            const nextBlocks = [
                ...sourceBlocks
            ];

            nextBlocks[
                blockIndex
            ] =
                updatedBlock;

            return {
                blocks:
                    nextBlocks,

                changed:
                    true
            };
        }

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
                updateBlockById(
                    column.blocks,
                    targetId,
                    updater
                );

            if (
                !nestedResult.changed
            ) {
                continue;
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
                    data,
                    nextColumns
                );

            return {
                blocks:
                    nextBlocks,

                changed:
                    true
            };
        }
    }

    return {
        blocks:
            sourceBlocks,

        changed:
            false
    };
}

function removeBlockById(
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
        return {
            blocks: [
                ...sourceBlocks.slice(
                    0,
                    directIndex
                ),

                ...sourceBlocks.slice(
                    directIndex + 1
                )
            ],

            removedBlock:
                sourceBlocks[
                    directIndex
                ],

            changed:
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
                removeBlockById(
                    column.blocks,
                    targetId
                );

            if (
                !nestedResult.changed
            ) {
                continue;
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
                    data,
                    nextColumns
                );

            return {
                blocks:
                    nextBlocks,

                removedBlock:
                    nestedResult.removedBlock,

                changed:
                    true
            };
        }
    }

    return {
        blocks:
            sourceBlocks,

        removedBlock:
            null,

        changed:
            false
    };
}

function insertIntoRoot(
    blocks,
    block,
    index
) {
    const sourceBlocks =
        normalizeBlocks(
            blocks
        );

    const insertionIndex =
        clampIndex(
            index,
            sourceBlocks.length
        );

    return {
        blocks: [
            ...sourceBlocks.slice(
                0,
                insertionIndex
            ),

            block,

            ...sourceBlocks.slice(
                insertionIndex
            )
        ],

        changed:
            true
    };
}

function insertIntoColumn(
    blocks,
    destination,
    block,
    index
) {
    return updateBlockById(
        blocks,
        destination.parentBlockId,
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

            let columnFound =
                false;

            const nextColumns =
                data.columns.map(
                    (column) => {
                        if (
                            column.id !==
                            destination.columnId
                        ) {
                            return column;
                        }

                        columnFound =
                            true;

                        const nestedBlocks =
                            normalizeBlocks(
                                column.blocks
                            );

                        const insertionIndex =
                            clampIndex(
                                index,
                                nestedBlocks.length
                            );

                        return {
                            ...column,

                            blocks: [
                                ...nestedBlocks.slice(
                                    0,
                                    insertionIndex
                                ),

                                block,

                                ...nestedBlocks.slice(
                                    insertionIndex
                                )
                            ]
                        };
                    }
                );

            if (
                !columnFound
            ) {
                return parentBlock;
            }

            return rebuildColumnsBlock(
                parentBlock,
                data,
                nextColumns
            );
        }
    );
}

function insertIntoContainer(
    blocks,
    destination,
    block,
    index
) {
    if (
        destination.type ===
        "root"
    ) {
        return insertIntoRoot(
            blocks,
            block,
            index
        );
    }

    return insertIntoColumn(
        blocks,
        destination,
        block,
        index
    );
}

function getContainerKey(container) {
    if (
        container.type ===
        "root"
    ) {
        return "root";
    }

    return [
        "column",
        container.parentBlockId,
        container.columnId
    ].join(":");
}

function isSameContainer(
    firstContainer,
    secondContainer
) {
    return (
        getContainerKey(
            firstContainer
        ) ===
        getContainerKey(
            secondContainer
        )
    );
}

function getBlockIdFromDragItem(
    item
) {
    return normalizeId(
        item?.data?.current
            ?.blockId ??
        item?.id
    );
}

function getTranslatedRectangle(
    event
) {
    return (
        event.active?.rect?.current
            ?.translated ??
        event.active?.rect?.current
            ?.initial ??
        null
    );
}

function shouldInsertAfter(
    event
) {
    const activeRectangle =
        getTranslatedRectangle(
            event
        );

    const overRectangle =
        event.over?.rect ??
        null;

    if (
        !activeRectangle ||
        !overRectangle
    ) {
        return false;
    }

    const activeCenter =
        activeRectangle.top +
        activeRectangle.height /
        2;

    const overCenter =
        overRectangle.top +
        overRectangle.height /
        2;

    return (
        activeCenter >
        overCenter
    );
}

function resolveDestination(
    blocks,
    event
) {
    const over =
        event.over;

    if (!over) {
        return null;
    }

    const overData =
        over.data?.current ??
        {};

    if (
        overData.type ===
        "builder-column-dropzone"
    ) {
        const parentBlockId =
            normalizeId(
                overData.parentBlockId
            );

        const columnId =
            normalizeId(
                overData.columnId
            );

        if (
            !parentBlockId ||
            !columnId
        ) {
            return null;
        }

        return {
            container: {
                type:
                    "column",

                parentBlockId,

                columnId
            },

            index:
                Number(
                    overData.index
                ) || 0
        };
    }

    const overBlockId =
        getBlockIdFromDragItem(
            over
        );

    const overLocation =
        findBlockLocation(
            blocks,
            overBlockId
        );

    if (
        !overLocation
    ) {
        return null;
    }

    return {
        container:
            overLocation.container,

        index:
            overLocation.index +
            (
                shouldInsertAfter(
                    event
                )
                    ? 1
                    : 0
            )
    };
}

export function moveBlockTreeByDrag(
    blocks,
    event
) {
    const sourceBlocks =
        normalizeBlocks(
            blocks
        );

    const activeBlockId =
        getBlockIdFromDragItem(
            event.active
        );

    if (
        !activeBlockId ||
        !event.over
    ) {
        return {
            blocks:
                sourceBlocks,

            moved:
                false,

            reason:
                "missing-target"
        };
    }

    const sourceLocation =
        findBlockLocation(
            sourceBlocks,
            activeBlockId
        );

    if (
        !sourceLocation
    ) {
        return {
            blocks:
                sourceBlocks,

            moved:
                false,

            reason:
                "block-not-found"
        };
    }

    const destination =
        resolveDestination(
            sourceBlocks,
            event
        );

    if (
        !destination
    ) {
        return {
            blocks:
                sourceBlocks,

            moved:
                false,

            reason:
                "destination-not-found"
        };
    }

    if (
        destination.container.type ===
        "column"
    ) {
        const destinationParentId =
            destination.container
                .parentBlockId;

        if (
            blockContainsId(
                sourceLocation.block,
                destinationParentId
            )
        ) {
            return {
                blocks:
                    sourceBlocks,

                moved:
                    false,

                reason:
                    "self-nesting"
            };
        }
    }

    const sameContainer =
        isSameContainer(
            sourceLocation.container,
            destination.container
        );

    let destinationIndex =
        destination.index;

    if (
        sameContainer &&
        sourceLocation.index <
        destinationIndex
    ) {
        destinationIndex -=
            1;
    }

    if (
        sameContainer &&
        sourceLocation.index ===
        destinationIndex
    ) {
        return {
            blocks:
                sourceBlocks,

            moved:
                false,

            reason:
                "same-position"
        };
    }

    const removalResult =
        removeBlockById(
            sourceBlocks,
            activeBlockId
        );

    if (
        !removalResult.changed ||
        !removalResult.removedBlock
    ) {
        return {
            blocks:
                sourceBlocks,

            moved:
                false,

            reason:
                "remove-failed"
        };
    }

    const insertionResult =
        insertIntoContainer(
            removalResult.blocks,
            destination.container,
            removalResult.removedBlock,
            destinationIndex
        );

    if (
        !insertionResult.changed
    ) {
        return {
            blocks:
                sourceBlocks,

            moved:
                false,

            reason:
                "insert-failed"
        };
    }

    return {
        blocks:
            insertionResult.blocks,

        moved:
            true,

        reason:
            "moved"
    };
}