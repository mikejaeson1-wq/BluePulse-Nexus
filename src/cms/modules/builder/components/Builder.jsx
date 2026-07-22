import "./Builder.css";

import {
    useState
} from "react";

import "../registry/registerBlocks";

import useBuilder from "../hooks/useBuilder";

import Sidebar from "./Sidebar";
import Canvas from "./Canvas";
import PropertiesPanel from "./PropertiesPanel";
import PageHeader from "./PageHeader";
import PageSettingsPanel from "./PageSettingsPanel";

function getSelectedBlockLabel(
    selectedBlock
) {
    if (!selectedBlock) {
        return "Kein Block ausgewählt";
    }

    return selectedBlock.type ??
        "Ausgewählter Block";
}

export default function Builder({
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
                        builder.deleteBlock
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
                        <PropertiesPanel
                            block={
                                builder.selectedBlock
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
        </>
    );
}