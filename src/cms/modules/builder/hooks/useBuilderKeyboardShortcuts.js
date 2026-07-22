import {
    useEffect
} from "react";

function isEditableTarget(
    target
) {
    if (
        !target ||
        typeof target.closest !==
        "function"
    ) {
        return false;
    }

    return Boolean(
        target.closest(
            [
                "input",
                "textarea",
                "select",
                "[contenteditable='true']",
                "[contenteditable='']",
                "[role='textbox']"
            ].join(
                ","
            )
        )
    );
}

function findSelectedIndex(
    blocks,
    selectedId
) {
    return blocks.findIndex(
        (block) =>
            block.id ===
            selectedId
    );
}

export default function useBuilderKeyboardShortcuts({
    enabled = true,
    blocks = [],
    selectedId = null,
    canUndo = false,
    canRedo = false,
    onSelect,
    onRequestDelete,
    onDuplicate,
    onMoveUp,
    onMoveDown,
    onUndo,
    onRedo
}) {
    useEffect(() => {
        if (!enabled) {
            return undefined;
        }

        const normalizedBlocks =
            Array.isArray(
                blocks
            )
                ? blocks
                : [];

        function handleKeyDown(
            event
        ) {
            if (
                event.defaultPrevented ||
                isEditableTarget(
                    event.target
                )
            ) {
                return;
            }

            const key =
                String(
                    event.key ??
                    ""
                ).toLowerCase();

            const modifierPressed =
                event.ctrlKey ||
                event.metaKey;

            const selectedIndex =
                findSelectedIndex(
                    normalizedBlocks,
                    selectedId
                );

            if (
                modifierPressed &&
                key ===
                "z"
            ) {
                event.preventDefault();

                if (
                    event.shiftKey
                ) {
                    if (canRedo) {
                        onRedo?.();
                    }

                    return;
                }

                if (canUndo) {
                    onUndo?.();
                }

                return;
            }

            if (
                modifierPressed &&
                key ===
                "y"
            ) {
                event.preventDefault();

                if (canRedo) {
                    onRedo?.();
                }

                return;
            }

            if (
                key ===
                "escape"
            ) {
                if (!selectedId) {
                    return;
                }

                event.preventDefault();

                onSelect?.(
                    null
                );

                return;
            }

            if (
                normalizedBlocks.length ===
                0
            ) {
                return;
            }

            if (
                !selectedId &&
                (
                    key ===
                        "arrowdown" ||
                    key ===
                        "arrowup"
                )
            ) {
                event.preventDefault();

                const nextBlock =
                    key ===
                    "arrowdown"
                        ? normalizedBlocks[0]
                        : normalizedBlocks[
                            normalizedBlocks.length -
                            1
                        ];

                onSelect?.(
                    nextBlock.id
                );

                return;
            }

            if (
                !selectedId ||
                selectedIndex ===
                -1
            ) {
                return;
            }

            if (
                modifierPressed &&
                key ===
                "d"
            ) {
                event.preventDefault();

                if (!event.repeat) {
                    onDuplicate?.(
                        selectedId
                    );
                }

                return;
            }

            if (
                key ===
                    "delete" ||
                key ===
                    "backspace"
            ) {
                event.preventDefault();

                if (!event.repeat) {
                    onRequestDelete?.(
                        selectedId
                    );
                }

                return;
            }

            if (
                event.altKey &&
                key ===
                "arrowup"
            ) {
                event.preventDefault();

                if (
                    selectedIndex >
                    0
                ) {
                    onMoveUp?.(
                        selectedId
                    );
                }

                return;
            }

            if (
                event.altKey &&
                key ===
                "arrowdown"
            ) {
                event.preventDefault();

                if (
                    selectedIndex <
                    normalizedBlocks.length -
                        1
                ) {
                    onMoveDown?.(
                        selectedId
                    );
                }

                return;
            }

            if (
                !modifierPressed &&
                !event.altKey &&
                key ===
                "arrowup"
            ) {
                event.preventDefault();

                const previousIndex =
                    Math.max(
                        selectedIndex -
                            1,
                        0
                    );

                onSelect?.(
                    normalizedBlocks[
                        previousIndex
                    ].id
                );

                return;
            }

            if (
                !modifierPressed &&
                !event.altKey &&
                key ===
                "arrowdown"
            ) {
                event.preventDefault();

                const nextIndex =
                    Math.min(
                        selectedIndex +
                            1,
                        normalizedBlocks.length -
                            1
                    );

                onSelect?.(
                    normalizedBlocks[
                        nextIndex
                    ].id
                );
            }
        }

        globalThis.document
            ?.addEventListener(
                "keydown",
                handleKeyDown
            );

        return () => {
            globalThis.document
                ?.removeEventListener(
                    "keydown",
                    handleKeyDown
                );
        };
    }, [
        blocks,
        canRedo,
        canUndo,
        enabled,
        onDuplicate,
        onMoveDown,
        onMoveUp,
        onRedo,
        onRequestDelete,
        onSelect,
        onUndo,
        selectedId
    ]);
}