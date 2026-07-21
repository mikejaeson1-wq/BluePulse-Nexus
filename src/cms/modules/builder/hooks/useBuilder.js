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

function clonePage(page) {
    if (typeof globalThis.structuredClone === "function") {
        return globalThis.structuredClone(page);
    }

    return JSON.parse(
        JSON.stringify(page)
    );
}

function getInitialPage(initialPage) {
    if (initialPage) {
        return clonePage(initialPage);
    }

    return createBuilderPage();
}

export default function useBuilder({
    initialPage,
    onSave,
    onPublish,
    onPreview
} = {}) {
    const [history, setHistory] = useState(() => [
        getInitialPage(initialPage)
    ]);

    const [historyIndex, setHistoryIndex] = useState(0);
    const [selectedId, setSelectedId] = useState(null);

    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const page = history[historyIndex];

    useEffect(() => {
        const nextPage = getInitialPage(initialPage);

        setHistory([nextPage]);
        setHistoryIndex(0);
        setSelectedId(null);
    }, [initialPage?.id]);

    function commit(nextPage) {
        const nextHistory = history.slice(
            0,
            historyIndex + 1
        );

        nextHistory.push(
            clonePage(nextPage)
        );

        setHistory(nextHistory);
        setHistoryIndex(
            nextHistory.length - 1
        );
    }

    function replaceCurrentPage(nextPage) {
        setHistory(currentHistory =>
            currentHistory.map(
                (historyPage, index) =>
                    index === historyIndex
                        ? clonePage(nextPage)
                        : historyPage
            )
        );
    }

    function updatePage(callback) {
        const updatedPage = callback(page);

        if (
            !updatedPage ||
            updatedPage === page
        ) {
            return;
        }

        commit(updatedPage);
    }

    function addBlock(definition) {
        const block = createBlock(definition);

        updatePage(currentPage => ({
            ...currentPage,
            updatedAt: new Date().toISOString(),
            blocks: [
                ...currentPage.blocks,
                block
            ]
        }));

        setSelectedId(block.id);
    }

    function updateBlock(updatedBlock) {
        updatePage(currentPage => ({
            ...currentPage,
            updatedAt: new Date().toISOString(),
            blocks: currentPage.blocks.map(block =>
                block.id === updatedBlock.id
                    ? updatedBlock
                    : block
            )
        }));
    }

    function deleteBlock(id) {
        updatePage(currentPage => ({
            ...currentPage,
            updatedAt: new Date().toISOString(),
            blocks: currentPage.blocks.filter(
                block => block.id !== id
            )
        }));

        setSelectedId(null);
    }

    function duplicateBlock(id) {
        const originalBlock = page.blocks.find(
            block => block.id === id
        );

        if (!originalBlock) {
            return;
        }

        const duplicatedBlock = clonePage(
            originalBlock
        );

        duplicatedBlock.id =
            globalThis.crypto?.randomUUID?.() ??
            `block-${Date.now()}`;

        updatePage(currentPage => ({
            ...currentPage,
            updatedAt: new Date().toISOString(),
            blocks: [
                ...currentPage.blocks,
                duplicatedBlock
            ]
        }));

        setSelectedId(
            duplicatedBlock.id
        );
    }

    function moveBlockUp(id) {
        updatePage(currentPage => {
            const blocks = [
                ...currentPage.blocks
            ];

            const index = blocks.findIndex(
                block => block.id === id
            );

            if (index <= 0) {
                return currentPage;
            }

            [
                blocks[index],
                blocks[index - 1]
            ] = [
                blocks[index - 1],
                blocks[index]
            ];

            return {
                ...currentPage,
                updatedAt: new Date().toISOString(),
                blocks
            };
        });
    }

    function moveBlockDown(id) {
        updatePage(currentPage => {
            const blocks = [
                ...currentPage.blocks
            ];

            const index = blocks.findIndex(
                block => block.id === id
            );

            if (
                index === -1 ||
                index >= blocks.length - 1
            ) {
                return currentPage;
            }

            [
                blocks[index],
                blocks[index + 1]
            ] = [
                blocks[index + 1],
                blocks[index]
            ];

            return {
                ...currentPage,
                updatedAt: new Date().toISOString(),
                blocks
            };
        });
    }

    function moveBlocks(blocks) {
        updatePage(currentPage => ({
            ...currentPage,
            updatedAt: new Date().toISOString(),
            blocks
        }));
    }

    function undo() {
        if (historyIndex <= 0) {
            return;
        }

        setHistoryIndex(
            currentIndex => currentIndex - 1
        );

        setSelectedId(null);
    }

    function redo() {
        if (
            historyIndex >=
            history.length - 1
        ) {
            return;
        }

        setHistoryIndex(
            currentIndex => currentIndex + 1
        );

        setSelectedId(null);
    }

    async function savePage() {
        if (!onSave || isSaving) {
            return page;
        }

        setIsSaving(true);

        try {
            const savedPage = await onSave(
                clonePage(page)
            );

            if (savedPage) {
                replaceCurrentPage(savedPage);
            }

            return savedPage ?? page;
        } finally {
            setIsSaving(false);
        }
    }

    async function publishPage() {
        if (isPublishing) {
            return page;
        }

        const nextPage = {
            ...page,
            published: true,
            status: "published",
            updatedAt: new Date().toISOString()
        };

        setIsPublishing(true);

        try {
            const publishedPage = onPublish
                ? await onPublish(
                    clonePage(nextPage)
                )
                : nextPage;

            commit(
                publishedPage ?? nextPage
            );

            return publishedPage ?? nextPage;
        } finally {
            setIsPublishing(false);
        }
    }

    async function previewPage() {
        if (onPreview) {
            return onPreview(
                clonePage(page)
            );
        }

        console.log(
            "Vorschau",
            page
        );

        return page;
    }

    const selectedBlock = useMemo(
        () =>
            page.blocks.find(
                block => block.id === selectedId
            ) ?? null,
        [
            page.blocks,
            selectedId
        ]
    );

    return {
        page,
        blocks: page.blocks,
        selectedId,
        selectedBlock,

        canUndo: historyIndex > 0,
        canRedo:
            historyIndex <
            history.length - 1,

        isSaving,
        isPublishing,

        addBlock,
        updateBlock,
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