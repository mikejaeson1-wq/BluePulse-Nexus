import {

    DndContext,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors

} from "@dnd-kit/core";

import {

    SortableContext,
    verticalListSortingStrategy,
    arrayMove

} from "@dnd-kit/sortable";

import SortableBlock from "./SortableBlock";

export default function Canvas({

    blocks,

    selectedId,

    onSelect,

    onDelete,

    onDuplicate,

    onMove,

    onMoveUp,

    onMoveDown

}) {

    const sensors = useSensors(

        useSensor(PointerSensor)

    );

    function handleDragEnd(event) {

        const { active, over } = event;

        if (!over) return;

        if (active.id === over.id) return;

        const oldIndex = blocks.findIndex(

            block => block.id === active.id

        );

        const newIndex = blocks.findIndex(

            block => block.id === over.id

        );

        const reordered = arrayMove(

            blocks,

            oldIndex,

            newIndex

        );

        onMove(reordered);

    }

    if (blocks.length === 0) {

        return (

            <main className="bp-builder-canvas">

                <div className="bp-builder-empty">

                    <h2>Leere Seite</h2>

                    <p>Füge links einen Block hinzu.</p>

                </div>

            </main>

        );

    }

    return (

        <main className="bp-builder-canvas">

            <DndContext

                sensors={sensors}

                collisionDetection={closestCenter}

                onDragEnd={handleDragEnd}

            >

                <SortableContext

                    items={blocks}

                    strategy={verticalListSortingStrategy}

                >

                    {

                        blocks.map(block => (

                            <SortableBlock

                                key={block.id}

                                block={block}

                                selected={selectedId === block.id}

                                onSelect={onSelect}

                                onDelete={onDelete}

                                onDuplicate={onDuplicate}

                                onMoveUp={onMoveUp}

                                onMoveDown={onMoveDown}

                            />

                        ))

                    }

                </SortableContext>

            </DndContext>

        </main>

    );

}