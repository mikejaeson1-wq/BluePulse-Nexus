import "./Builder.css";

import "../registry/registerBlocks";

import useBuilder from "../hooks/useBuilder";

import Sidebar from "./Sidebar";
import Canvas from "./Canvas";
import PropertiesPanel from "./PropertiesPanel";
import PageHeader from "./PageHeader";

export default function Builder() {

    const builder = useBuilder();

    return (

        <>

            <PageHeader

                page={builder.page}

                onUndo={builder.undo}

                onRedo={builder.redo}

                onSave={builder.savePage}

                onPublish={builder.publishPage}

                onPreview={builder.previewPage}

            />

            <div className="bp-builder">

                <Sidebar

                    onAdd={builder.addBlock}

                />

                <Canvas

                    blocks={builder.blocks}

                    selectedId={builder.selectedId}

                    onSelect={builder.setSelectedId}

                    onDelete={builder.deleteBlock}

                    onDuplicate={builder.duplicateBlock}

                    onMove={builder.moveBlocks}

                    onMoveUp={builder.moveBlockUp}

                    onMoveDown={builder.moveBlockDown}

                />

                <aside className="bp-builder-right">

                    <PropertiesPanel

                        block={builder.selectedBlock}

                        onChange={builder.updateBlock}

                    />

                </aside>

            </div>

        </>

    );

}