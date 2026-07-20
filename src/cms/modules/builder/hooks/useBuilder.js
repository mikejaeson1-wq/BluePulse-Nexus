import { useMemo, useState } from "react";

import { createPage } from "../models/PageModel";
import { createBlock } from "../models/BlockModel";

export default function useBuilder() {

    const [history, setHistory] = useState([

        createPage("Startseite")

    ]);

    const [historyIndex, setHistoryIndex] = useState(0);

    const page = history[historyIndex];

    const [selectedId, setSelectedId] = useState(null);

    function commit(nextPage) {

        const nextHistory = history.slice(0, historyIndex + 1);

        nextHistory.push(nextPage);

        setHistory(nextHistory);

        setHistoryIndex(nextHistory.length - 1);

    }

    function updatePage(callback) {

        const updated = callback(page);

        commit(updated);

    }

    function addBlock(definition) {

        const block = createBlock(definition);

        updatePage(current => ({

            ...current,

            updatedAt: new Date().toISOString(),

            blocks: [

                ...current.blocks,

                block

            ]

        }));

        setSelectedId(block.id);

    }

    function updateBlock(updated) {

        updatePage(current => ({

            ...current,

            updatedAt: new Date().toISOString(),

            blocks: current.blocks.map(block =>

                block.id === updated.id

                    ? updated

                    : block

            )

        }));

    }

    function deleteBlock(id) {

        updatePage(current => ({

            ...current,

            updatedAt: new Date().toISOString(),

            blocks: current.blocks.filter(

                block => block.id !== id

            )

        }));

        setSelectedId(null);

    }

    function duplicateBlock(id) {

        const original = page.blocks.find(

            block => block.id === id

        );

        if (!original) return;

        const copy = structuredClone(original);

        copy.id = crypto.randomUUID();

        updatePage(current => ({

            ...current,

            updatedAt: new Date().toISOString(),

            blocks: [

                ...current.blocks,

                copy

            ]

        }));

    }

    function moveBlockUp(id) {

        updatePage(current => {

            const blocks = [...current.blocks];

            const index = blocks.findIndex(

                block => block.id === id

            );

            if (index <= 0) return current;

            [blocks[index], blocks[index - 1]] = [

                blocks[index - 1],

                blocks[index]

            ];

            return {

                ...current,

                updatedAt: new Date().toISOString(),

                blocks

            };

        });

    }

    function moveBlockDown(id) {

        updatePage(current => {

            const blocks = [...current.blocks];

            const index = blocks.findIndex(

                block => block.id === id

            );

            if (index === -1 || index >= blocks.length - 1) {

                return current;

            }

            [blocks[index], blocks[index + 1]] = [

                blocks[index + 1],

                blocks[index]

            ];

            return {

                ...current,

                updatedAt: new Date().toISOString(),

                blocks

            };

        });

    }

    function undo() {

        if (historyIndex > 0) {

            setHistoryIndex(historyIndex - 1);

        }

    }

    function redo() {

        if (historyIndex < history.length - 1) {

            setHistoryIndex(historyIndex + 1);

        }

    }

    function savePage() {

        console.log("Speichern", page);

    }

    function publishPage() {

        updatePage(current => ({

            ...current,

            published: true,

            status: "published",

            updatedAt: new Date().toISOString()

        }));

    }

    function previewPage() {

        console.log("Preview");

    }

    const selectedBlock = useMemo(

        () =>

            page.blocks.find(

                block => block.id === selectedId

            ),

        [page.blocks, selectedId]

    );

    function moveBlocks(blocks) {

        updatePage(current => ({

            ...current,

            updatedAt: new Date().toISOString(),

            blocks

        }));

    }

    return {

        page,

        blocks: page.blocks,

        selectedId,

        selectedBlock,

        addBlock,

        updateBlock,

        deleteBlock,

        duplicateBlock,

        moveBlockUp,

        moveBlockDown,

        savePage,

        publishPage,

        previewPage,

        undo,

        redo,

        setSelectedId,

        moveBlocks

    };

}