import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState
} from "react";

import {
    useSortable
} from "@dnd-kit/sortable";

import {
    CSS
} from "@dnd-kit/utilities";

import BlockRenderer from "../../../rendering/BlockRenderer";

import {
    getBlock
} from "../registry/blockRegistry";

import EditorOverlay from "./EditorOverlay";

const COMPACT_BLOCK_TYPES =
    new Set([
        "divider",
        "spacer"
    ]);

function getBlockIcon(
    definition
) {
    const icon =
        String(
            definition?.icon ??
            ""
        ).trim();

    return icon.startsWith(
        "bi-"
    )
        ? icon
        : "bi-box";
}

function getBlockPosition(
    node
) {
    if (!node) {
        return {
            position:
                1,

            total:
                1
        };
    }

    const editSurface =
        node.closest(
            "[data-builder-edit-surface='true']"
        );

    if (!editSurface) {
        return {
            position:
                1,

            total:
                1
        };
    }

    const blockNodes = [
        ...editSurface
            .querySelectorAll(
                "[data-builder-block-id]"
            )
    ];

    const blockIndex =
        blockNodes.indexOf(
            node
        );

    return {
        position:
            blockIndex >=
                0
                ? blockIndex +
                    1
                : 1,

        total:
            Math.max(
                blockNodes.length,
                1
            )
    };
}

function scrollBlockIntoView(
    node
) {
    if (!node) {
        return;
    }

    const viewport =
        node.closest(
            ".bp-builder-viewport"
        );

    if (!viewport) {
        node.scrollIntoView({
            behavior:
                "smooth",

            block:
                "nearest"
        });

        return;
    }

    const nodeBounds =
        node.getBoundingClientRect();

    const viewportBounds =
        viewport.getBoundingClientRect();

    const upperBoundary =
        viewportBounds.top +
        90;

    const lowerBoundary =
        viewportBounds.bottom -
        45;

    if (
        nodeBounds.top <
        upperBoundary
    ) {
        viewport.scrollBy({
            top:
                nodeBounds.top -
                upperBoundary -
                20,

            behavior:
                "smooth"
        });

        return;
    }

    if (
        nodeBounds.bottom >
        lowerBoundary
    ) {
        viewport.scrollBy({
            top:
                nodeBounds.bottom -
                lowerBoundary +
                20,

            behavior:
                "smooth"
        });
    }
}

export default function SortableBlock({
    block,
    selected,
    canMoveUp = true,
    canMoveDown = true,
    onSelect,
    onDelete,
    onDuplicate,
    onMoveUp,
    onMoveDown
}) {
    const localNodeRef =
        useRef(null);

    const [
        positionInformation,
        setPositionInformation
    ] =
        useState({
            position:
                1,

            total:
                1
        });

    const definition =
        getBlock(
            block.type
        );

    const blockName =
        definition?.name ??
        block.type ??
        "Block";

    const blockType =
        definition?.type ??
        block.type ??
        "block";

    const blockIcon =
        getBlockIcon(
            definition
        );

    const compact =
        COMPACT_BLOCK_TYPES.has(
            blockType
        );

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } =
        useSortable({
            id:
                block.id,

            data: {
                type:
                    "builder-block",

                blockId:
                    block.id,

                blockType
            }
        });

    const setCombinedNodeRef =
        useCallback(
            (node) => {
                localNodeRef.current =
                    node;

                setNodeRef(
                    node
                );
            },
            [
                setNodeRef
            ]
        );

    useLayoutEffect(() => {
        const nextPosition =
            getBlockPosition(
                localNodeRef.current
            );

        setPositionInformation(
            (
                currentPosition
            ) => {
                if (
                    currentPosition.position ===
                        nextPosition.position &&
                    currentPosition.total ===
                        nextPosition.total
                ) {
                    return currentPosition;
                }

                return nextPosition;
            }
        );
    });

    useEffect(() => {
        if (
            !selected ||
            isDragging
        ) {
            return undefined;
        }

        const animationFrame =
            globalThis
                .requestAnimationFrame(
                    () => {
                        scrollBlockIntoView(
                            localNodeRef.current
                        );
                    }
                );

        return () => {
            globalThis
                .cancelAnimationFrame(
                    animationFrame
                );
        };
    }, [
        isDragging,
        selected
    ]);

    const style = {
        transform:
            CSS.Transform.toString(
                transform
            ),

        transition,

        position:
            "relative",

        zIndex:
            isDragging
                ? 70
                : undefined,

        opacity:
            isDragging
                ? 0.82
                : 1
    };

    return (
        <div
            ref={
                setCombinedNodeRef
            }
            className={
                [
                    "bp-sortable-block",

                    compact
                        ? "bp-sortable-block--compact"
                        : "",

                    isDragging
                        ? "bp-sortable-block--dragging"
                        : ""
                ]
                    .filter(
                        Boolean
                    )
                    .join(
                        " "
                    )
            }
            style={
                style
            }
            data-builder-block-id={
                block.id
            }
            data-builder-block-type={
                blockType
            }
        >
            <EditorOverlay
                blockName={
                    blockName
                }
                blockType={
                    blockType
                }
                blockIcon={
                    blockIcon
                }
                position={
                    positionInformation
                        .position
                }
                total={
                    positionInformation
                        .total
                }
                compact={
                    compact
                }
                selected={
                    selected
                }
                canMoveUp={
                    canMoveUp
                }
                canMoveDown={
                    canMoveDown
                }
                onSelect={
                    () =>
                        onSelect?.(
                            block.id
                        )
                }
                onDelete={
                    () =>
                        onDelete?.(
                            block.id
                        )
                }
                onDuplicate={
                    () =>
                        onDuplicate?.(
                            block.id
                        )
                }
                onMoveUp={
                    () => {
                        if (
                            canMoveUp
                        ) {
                            onMoveUp?.(
                                block.id
                            );
                        }
                    }
                }
                onMoveDown={
                    () => {
                        if (
                            canMoveDown
                        ) {
                            onMoveDown?.(
                                block.id
                            );
                        }
                    }
                }
                dragHandleProps={{
                    ...attributes,
                    ...listeners
                }}
            >
                <BlockRenderer
                    block={
                        block
                    }
                    mode="editor"
                />
            </EditorOverlay>
        </div>
    );
}