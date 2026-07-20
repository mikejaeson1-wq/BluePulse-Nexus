import "./EditorOverlay.css";
import BlockToolbar from "./BlockToolbar";

export default function EditorOverlay({

    selected,

    onSelect,

    onDelete,

    onDuplicate,

    onMoveUp,

    onMoveDown,

    dragHandleProps,

    children

}) {

    return (

        <div

            className={`bp-editor-overlay ${selected ? "selected" : ""}`}

            onClick={onSelect}

        >

            <div

                className="bp-drag-handle"

                {...dragHandleProps}

                title="Block verschieben"

            >

                ⋮⋮

            </div>

            <BlockToolbar

                onDelete={onDelete}

                onDuplicate={onDuplicate}

                onMoveUp={onMoveUp}

                onMoveDown={onMoveDown}

            />

            {children}

        </div>

    );

}