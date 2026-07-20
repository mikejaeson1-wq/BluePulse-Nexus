import {

    useSortable

} from "@dnd-kit/sortable";

import {

    CSS

} from "@dnd-kit/utilities";

import BlockRenderer from "../../../rendering/BlockRenderer";
import EditorOverlay from "./EditorOverlay";

export default function SortableBlock({

    block,

    selected,

    onSelect,

    onDelete,

    onDuplicate,

    onMoveUp,

    onMoveDown

}) {

    const {

        attributes,

        listeners,

        setNodeRef,

        transform,

        transition

    } = useSortable({

        id: block.id

    });

    const style = {

        transform: CSS.Transform.toString(transform),

        transition

    };

    return (

        <div

            ref={setNodeRef}

            style={style}

        >

            <EditorOverlay

                selected={selected}

                onSelect={() => onSelect(block.id)}

                onDelete={() => onDelete(block.id)}

                onDuplicate={() => onDuplicate(block.id)}

                onMoveUp={() => onMoveUp(block.id)}

                onMoveDown={() => onMoveDown(block.id)}

                dragHandleProps={{

                    ...attributes,

                    ...listeners

                }}

            >

                <BlockRenderer

                    block={block}

                    mode="editor"

                />

            </EditorOverlay>

        </div>

    );

}