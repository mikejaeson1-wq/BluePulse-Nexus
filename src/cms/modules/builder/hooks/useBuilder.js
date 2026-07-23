import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    createPage as createBuilderPage
} from "../models/PageModel";

import {
    createBlock
} from "../models/BlockModel";

import {
    appendBlockToColumn,
    duplicateBlockInTree,
    findBlockTreeEntry,
    getBlockTreeEntries,
    moveBlockInTree,
    removeBlockFromTree,
    updateBlockInTree
} from "../utils/blockTree";

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

function getInitialPage(
    initialPage
) {
    return initialPage
        ? cloneValue(
            initialPage
        )
        : createBuilderPage();
}

function touchPage(
    page,
    blocks
) {
    return {
        ...page,

        updatedAt:
            new Date()
                .toISOString(),

        blocks
    };
}

export default function useBuilder({
    initialPage,
    onSave,
    onPublish,
    onPreview
} = {}) {
    const [
        history,
        setHistory
    ] =
        useState(
            () => [
                getInitialPage(
                    initialPage
                )
            ]
        );

    const [
        historyIndex,
        setHistoryIndex
    ] =
        useState(0);

    const [
        selectedId,
        setSelectedId
    ] =
        useState(null);

    const [
        isSaving,
        setIsSaving
    ] =
        useState(false);

    const [
        isPublishing,
        setIsPublishing
    ] =
        useState(false);

    const page =
        history[
            historyIndex
        ];

    useEffect(() => {
        const nextPage =
            getInitialPage(
                initialPage
            );

        setHistory([
            nextPage
        ]);

        setHistoryIndex(
            0
        );

        setSelectedId(
            null
        );
    }, [
        initialPage?.id
    ]);

    function commit(
        nextPage
    ) {
        const nextHistory =
            history.slice(
                0,
                historyIndex + 1
            );

        nextHistory.push(
            cloneValue(
                nextPage
            )
        );

        setHistory(
            nextHistory
        );

        setHistoryIndex(
            nextHistory.length - 1
        );
    }

    function replaceCurrentPage(
        nextPage
    ) {
        setHistory(
            (
                currentHistory
            ) =>
                currentHistory.map(
                    (
                        historyPage,
                        index
                    ) =>
                        index ===
                        historyIndex
                            ? cloneValue(
                                nextPage
                            )
                            : historyPage
                )
        );
    }

    function updatePage(
        callback
    ) {
        const updatedPage =
            callback(
                page
            );

        if (
            !updatedPage ||
            updatedPage ===
            page
        ) {
            return false;
        }

        commit(
            updatedPage
        );

        return true;
    }

    function updatePageDetails(
        nextPage
    ) {
        if (
            !nextPage ||
            typeof nextPage !==
                "object"
        ) {
            return;
        }

        updatePage(
            (
                currentPage
            ) => ({
                ...currentPage,
                ...nextPage,

                id:
                    currentPage.id,

                blocks:
                    Array.isArray(
                        nextPage.blocks
                    )
                        ? nextPage.blocks
                        : currentPage.blocks,

                updatedAt:
                    new Date()
                        .toISOString()
            })
        );
    }

    function addBlock(
        definition
    ) {
        const block =
            createBlock(
                definition
            );

        updatePage(
            (
                currentPage
            ) =>
                touchPage(
                    currentPage,
                    [
                        ...currentPage.blocks,
                        block
                    ]
                )
        );

        setSelectedId(
            block.id
        );

        return block;
    }

    function addBlockToColumn(
        parentBlockId,
        columnId,
        definition
    ) {
        const block =
            createBlock(
                definition
            );

        const changed =
            updatePage(
                (
                    currentPage
                ) => {
                    const nextBlocks =
                        appendBlockToColumn(
                            currentPage.blocks,
                            parentBlockId,
                            columnId,
                            block
                        );

                    if (
                        nextBlocks ===
                        currentPage.blocks
                    ) {
                        return currentPage;
                    }

                    return touchPage(
                        currentPage,
                        nextBlocks
                    );
                }
            );

        if (!changed) {
            return null;
        }

        setSelectedId(
            block.id
        );

        return block;
    }

    function updateBlock(
        updatedBlock
    ) {
        if (
            !updatedBlock?.id
        ) {
            return;
        }

        updatePage(
            (
                currentPage
            ) => {
                const nextBlocks =
                    updateBlockInTree(
                        currentPage.blocks,
                        updatedBlock
                    );

                if (
                    nextBlocks ===
                    currentPage.blocks
                ) {
                    return currentPage;
                }

                return touchPage(
                    currentPage,
                    nextBlocks
                );
            }
        );
    }

    function deleteBlock(
        id
    ) {
        updatePage(
            (
                currentPage
            ) => {
                const nextBlocks =
                    removeBlockFromTree(
                        currentPage.blocks,
                        id
                    );

                if (
                    nextBlocks ===
                    currentPage.blocks
                ) {
                    return currentPage;
                }

                return touchPage(
                    currentPage,
                    nextBlocks
                );
            }
        );

        setSelectedId(
            null
        );
    }

    function duplicateBlock(
        id
    ) {
        let duplicatedBlock =
            null;

        updatePage(
            (
                currentPage
            ) => {
                const result =
                    duplicateBlockInTree(
                        currentPage.blocks,
                        id
                    );

                duplicatedBlock =
                    result.duplicatedBlock;

                if (
                    !duplicatedBlock ||
                    result.blocks ===
                    currentPage.blocks
                ) {
                    return currentPage;
                }

                return touchPage(
                    currentPage,
                    result.blocks
                );
            }
        );

        if (
            duplicatedBlock
        ) {
            setSelectedId(
                duplicatedBlock.id
            );
        }

        return duplicatedBlock;
    }

    function moveBlockUp(
        id
    ) {
        updatePage(
            (
                currentPage
            ) => {
                const nextBlocks =
                    moveBlockInTree(
                        currentPage.blocks,
                        id,
                        -1
                    );

                if (
                    nextBlocks ===
                    currentPage.blocks
                ) {
                    return currentPage;
                }

                return touchPage(
                    currentPage,
                    nextBlocks
                );
            }
        );
    }

    function moveBlockDown(
        id
    ) {
        updatePage(
            (
                currentPage
            ) => {
                const nextBlocks =
                    moveBlockInTree(
                        currentPage.blocks,
                        id,
                        1
                    );

                if (
                    nextBlocks ===
                    currentPage.blocks
                ) {
                    return currentPage;
                }

                return touchPage(
                    currentPage,
                    nextBlocks
                );
            }
        );
    }

    function moveBlocks(
        blocks
    ) {
        if (
            !Array.isArray(
                blocks
            )
        ) {
            return;
        }

        updatePage(
            (
                currentPage
            ) =>
                touchPage(
                    currentPage,
                    blocks
                )
        );
    }

    function undo() {
        if (
            historyIndex <=
            0
        ) {
            return;
        }

        setHistoryIndex(
            (
                currentIndex
            ) =>
                currentIndex - 1
        );

        setSelectedId(
            null
        );
    }

    function redo() {
        if (
            historyIndex >=
            history.length - 1
        ) {
            return;
        }

        setHistoryIndex(
            (
                currentIndex
            ) =>
                currentIndex + 1
        );

        setSelectedId(
            null
        );
    }

    async function savePage() {
        if (
            !onSave ||
            isSaving
        ) {
            return page;
        }

        setIsSaving(
            true
        );

        try {
            const savedPage =
                await onSave(
                    cloneValue(
                        page
                    )
                );

            if (savedPage) {
                replaceCurrentPage(
                    savedPage
                );
            }

            return (
                savedPage ??
                page
            );
        } finally {
            setIsSaving(
                false
            );
        }
    }

    async function publishPage() {
        if (isPublishing) {
            return page;
        }

        const nextPage = {
            ...page,

            published:
                true,

            status:
                "published",

            updatedAt:
                new Date()
                    .toISOString()
        };

        setIsPublishing(
            true
        );

        try {
            const publishedPage =
                onPublish
                    ? await onPublish(
                        cloneValue(
                            nextPage
                        )
                    )
                    : nextPage;

            commit(
                publishedPage ??
                nextPage
            );

            return (
                publishedPage ??
                nextPage
            );
        } finally {
            setIsPublishing(
                false
            );
        }
    }

    async function previewPage() {
        if (onPreview) {
            return onPreview(
                cloneValue(
                    page
                )
            );
        }

        console.log(
            "Vorschau",
            page
        );

        return page;
    }

    const blockEntries =
        useMemo(
            () =>
                getBlockTreeEntries(
                    page.blocks
                ),
            [
                page.blocks
            ]
        );

    const flatBlocks =
        useMemo(
            () =>
                blockEntries.map(
                    (entry) =>
                        entry.block
                ),
            [
                blockEntries
            ]
        );

    const selectedEntry =
        useMemo(
            () =>
                findBlockTreeEntry(
                    page.blocks,
                    selectedId
                ),
            [
                page.blocks,
                selectedId
            ]
        );

    const selectedBlock =
        selectedEntry?.block ??
        null;

    return {
        page,

        blocks:
            page.blocks,

        blockEntries,

        flatBlocks,

        selectedId,

        selectedEntry,

        selectedBlock,

        canUndo:
            historyIndex >
            0,

        canRedo:
            historyIndex <
            history.length - 1,

        isSaving,

        isPublishing,

        addBlock,

        addBlockToColumn,

        updateBlock,

        updatePageDetails,

        deleteBlock,

        duplicateBlock,

        moveBlockUp,

        moveBlockDown,

        moveBlocks,

        savePage,

        publishPage,

        previewPage,

        undo,

        redo,

        setSelectedId
    };
}