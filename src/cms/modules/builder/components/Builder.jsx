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

            <div className="bp-builder">
                <Sidebar
                    onAdd={
                        builder.addBlock
                    }
                />

                <Canvas
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
                    <PropertiesPanel
                        block={
                            builder.selectedBlock
                        }
                        onChange={
                            builder.updateBlock
                        }
                    />
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