import "./Builder.css";

import {
    useMemo,
    useState
} from "react";

import "../registry/registerBlocks";

import {
    BuilderViewportProvider
} from "../context/BuilderViewportContext";

import {
    getBlock
} from "../registry/blockRegistry";

import useBuilder from "../hooks/useBuilder";
import useBuilderKeyboardShortcuts from "../hooks/useBuilderKeyboardShortcuts";

import Sidebar from "./Sidebar";
import Canvas from "./Canvas";
import BlockNavigator from "./BlockNavigator";
import BlockDeleteDialog from "./BlockDeleteDialog";
import PropertiesPanel from "./PropertiesPanel";
import PageHeader from "./PageHeader";
import PageSettingsPanel from "./PageSettingsPanel";

function getBlockName(
    block
) {
    if (!block) {
        return "Block";
    }

    const definition =
        getBlock(
            block.type
        );

    return (
        definition?.name ??
        block.type ??
        "Block"
    );
}

function getBlockType(
    block
) {
    if (!block) {
        return "block";
    }

    const definition =
        getBlock(
            block.type
        );

    return (
        definition?.type ??
        block.type ??
        "block"
    );
}

function getSelectedBlockLabel(
    selectedBlock
) {
    if (!selectedBlock) {
        return "Kein Block ausgewählt";
    }

    const blockName =
        getBlockName(
            selectedBlock
        );

    const blockType =
        getBlockType(
            selectedBlock
        );

    return `${blockName} · ${blockType}`;
}

function BuilderContent({
    initialPage,
    onSave,
    onPublish,
    onPreview
}) {
    const [
        settingsOpen,
        setSettingsOpen
    ] =
        useState(false);

    const [
        pendingDeleteId,
        setPendingDeleteId
    ] =
        useState(null);

    const builder =
        useBuilder({
            initialPage,
            onSave,
            onPublish,
            onPreview
        });

    const selectedBlockLabel =
        getSelectedBlockLabel(
            builder.selectedBlock
        );

    const pendingDeleteBlock =
        useMemo(
            () =>
                builder.blocks.find(
                    (block) =>
                        block.id ===
                        pendingDeleteId
                ) ??
                null,
            [
                builder.blocks,
                pendingDeleteId
            ]
        );

    const pendingDeleteIndex =
        useMemo(
            () =>
                builder.blocks.findIndex(
                    (block) =>
                        block.id ===
                        pendingDeleteId
                ),
            [
                builder.blocks,
                pendingDeleteId
            ]
        );

    const pendingDeleteName =
        getBlockName(
            pendingDeleteBlock
        );

    const pendingDeleteType =
        getBlockType(
            pendingDeleteBlock
        );

    const deleteDialogOpen =
        Boolean(
            pendingDeleteBlock
        );

    function requestDeleteBlock(
        blockId
    ) {
        const blockExists =
            builder.blocks.some(
                (block) =>
                    block.id ===
                    blockId
            );

        if (!blockExists) {
            return;
        }

        setPendingDeleteId(
            blockId
        );
    }

    function cancelDeleteBlock() {
        setPendingDeleteId(
            null
        );
    }

    function confirmDeleteBlock() {
        if (
            !pendingDeleteBlock
        ) {
            setPendingDeleteId(
                null
            );

            return;
        }

        builder.deleteBlock(
            pendingDeleteBlock.id
        );

        setPendingDeleteId(
            null
        );
    }

    useBuilderKeyboardShortcuts({
        enabled:
            !settingsOpen &&
            !deleteDialogOpen,

        blocks:
            builder.blocks,

        selectedId:
            builder.selectedId,

        canUndo:
            builder.canUndo,

        canRedo:
            builder.canRedo,

        onSelect:
            builder.setSelectedId,

        onRequestDelete:
            requestDeleteBlock,

        onDuplicate:
            builder.duplicateBlock,

        onMoveUp:
            builder.moveBlockUp,

        onMoveDown:
            builder.moveBlockDown,

        onUndo:
            builder.undo,

        onRedo:
            builder.redo
    });

    return (
        <>
            <PageHeader
                page={
                    builder.page
                }
                onUndo={
                    builder.undo
                }
                onRedo={
                    builder.redo
                }
                onSave={
                    builder.savePage
                }
                onPublish={
                    builder.publishPage
                }
                onPreview={
                    builder.previewPage
                }
                onSettings={
                    () =>
                        setSettingsOpen(
                            true
                        )
                }
                canUndo={
                    builder.canUndo
                }
                canRedo={
                    builder.canRedo
                }
                isSaving={
                    builder.isSaving
                }
                isPublishing={
                    builder.isPublishing
                }
            />

            <div
                className={
                    builder.selectedBlock
                        ? "bp-builder bp-builder--has-selection"
                        : "bp-builder"
                }
            >
                <Sidebar
                    onAdd={
                        builder.addBlock
                    }
                />

                <Canvas
                    page={
                        builder.page
                    }
                    blocks={
                        builder.blocks
                    }
                    selectedId={
                        builder.selectedId
                    }
                    onSelect={
                        builder.setSelectedId
                    }
                    onDelete={
                        requestDeleteBlock
                    }
                    onDuplicate={
                        builder.duplicateBlock
                    }
                    onMove={
                        builder.moveBlocks
                    }
                    onMoveUp={
                        builder.moveBlockUp
                    }
                    onMoveDown={
                        builder.moveBlockDown
                    }
                />

                <aside className="bp-builder-right">
                    <header className="bp-builder-right__header">
                        <div>
                            <span className="bp-builder-right__eyebrow">
                                Block-Inspector
                            </span>

                            <h2>
                                Eigenschaften
                            </h2>

                            <small>
                                {
                                    selectedBlockLabel
                                }
                            </small>
                        </div>

                        <span
                            className={
                                builder.selectedBlock
                                    ? "bp-builder-right__status bp-builder-right__status--active"
                                    : "bp-builder-right__status"
                            }
                            title={
                                builder.selectedBlock
                                    ? "Block ausgewählt"
                                    : "Kein Block ausgewählt"
                            }
                        >
                            <i
                                className={
                                    builder.selectedBlock
                                        ? "bi bi-check-circle-fill"
                                        : "bi bi-circle"
                                }
                                aria-hidden="true"
                            />
                        </span>
                    </header>

                    <div className="bp-builder-right__content">
                        <BlockNavigator
                            blocks={
                                builder.blocks
                            }
                            selectedId={
                                builder.selectedId
                            }
                            onSelect={
                                builder.setSelectedId
                            }
                            onClearSelection={
                                () =>
                                    builder.setSelectedId(
                                        null
                                    )
                            }
                        />

                        <PropertiesPanel
                            block={
                                builder.selectedBlock
                            }
                            blocks={
                                builder.blocks
                            }
                            selectedId={
                                builder.selectedId
                            }
                            onSelect={
                                builder.setSelectedId
                            }
                            onChange={
                                builder.updateBlock
                            }
                        />
                    </div>

                    {
                        builder.selectedBlock && (
                            <footer className="bp-builder-right__footer">
                                <i
                                    className="bi bi-lightning-charge"
                                    aria-hidden="true"
                                />

                                Änderungen erscheinen unmittelbar in der Live-Leinwand.
                            </footer>
                        )
                    }
                </aside>
            </div>

            <PageSettingsPanel
                open={
                    settingsOpen
                }
                page={
                    builder.page
                }
                onChange={
                    builder.updatePageDetails
                }
                onClose={
                    () =>
                        setSettingsOpen(
                            false
                        )
                }
            />

            <BlockDeleteDialog
                open={
                    deleteDialogOpen
                }
                blockName={
                    pendingDeleteName
                }
                blockType={
                    pendingDeleteType
                }
                position={
                    pendingDeleteIndex >=
                    0
                        ? pendingDeleteIndex +
                            1
                        : 1
                }
                total={
                    builder.blocks.length
                }
                onCancel={
                    cancelDeleteBlock
                }
                onConfirm={
                    confirmDeleteBlock
                }
            />
        </>
    );
}

export default function Builder(
    props
) {
    return (
        <BuilderViewportProvider>
            <BuilderContent
                {
                    ...props
                }
            />
        </BuilderViewportProvider>
    );
}