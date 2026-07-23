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
    BuilderEditorProvider
} from "../context/BuilderEditorContext";

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

function getBlockName(block) {
    if (!block) {
        return "Block";
    }

    return (
        getBlock(
            block.type
        )?.name ??
        block.type ??
        "Block"
    );
}

function getBlockType(block) {
    if (!block) {
        return "block";
    }

    return (
        getBlock(
            block.type
        )?.type ??
        block.type ??
        "block"
    );
}

function getSelectedBlockLabel(
    selectedEntry
) {
    if (
        !selectedEntry?.block
    ) {
        return "Kein Block ausgewählt";
    }

    const blockName =
        getBlockName(
            selectedEntry.block
        );

    const blockType =
        getBlockType(
            selectedEntry.block
        );

    if (
        selectedEntry.depth >
        0
    ) {
        return `${blockName} · ${blockType} · ${selectedEntry.columnLabel}`;
    }

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
            builder.selectedEntry
        );

    const pendingDeleteEntry =
        useMemo(
            () =>
                builder.blockEntries.find(
                    (entry) =>
                        entry.block.id ===
                        pendingDeleteId
                ) ??
                null,
            [
                builder.blockEntries,
                pendingDeleteId
            ]
        );

    const pendingDeleteBlock =
        pendingDeleteEntry?.block ??
        null;

    const deleteDialogOpen =
        Boolean(
            pendingDeleteBlock
        );

    function requestDeleteBlock(
        blockId
    ) {
        const blockExists =
            builder.blockEntries.some(
                (entry) =>
                    entry.block.id ===
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
            pendingDeleteBlock
        ) {
            builder.deleteBlock(
                pendingDeleteBlock.id
            );
        }

        setPendingDeleteId(
            null
        );
    }

    useBuilderKeyboardShortcuts({
        enabled:
            !settingsOpen &&
            !deleteDialogOpen,

        blocks:
            builder.flatBlocks,

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

    const editorContextValue = {
        selectedId:
            builder.selectedId,

        onSelectBlock:
            builder.setSelectedId,

        onRequestDeleteBlock:
            requestDeleteBlock,

        onDuplicateBlock:
            builder.duplicateBlock,

        onMoveBlockUp:
            builder.moveBlockUp,

        onMoveBlockDown:
            builder.moveBlockDown,

        onAddBlockToColumn:
            builder.addBlockToColumn
    };

    return (
        <BuilderEditorProvider
            value={
                editorContextValue
            }
        >
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
                            entries={
                                builder.blockEntries
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
                                builder.flatBlocks
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
                    getBlockName(
                        pendingDeleteBlock
                    )
                }
                blockType={
                    getBlockType(
                        pendingDeleteBlock
                    )
                }
                position={
                    pendingDeleteEntry
                        ? pendingDeleteEntry.index +
                            1
                        : 1
                }
                total={
                    pendingDeleteEntry?.total ??
                    1
                }
                onCancel={
                    cancelDeleteBlock
                }
                onConfirm={
                    confirmDeleteBlock
                }
            />
        </BuilderEditorProvider>
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