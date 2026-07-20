import "./BlockToolbar.css";

export default function BlockToolbar({

    onDuplicate,

    onDelete,

    onMoveUp,

    onMoveDown

}){

    return(

        <div className="bp-block-toolbar">

            <button onClick={onDuplicate}>

                📄

            </button>

            <button onClick={onMoveUp}>

                ⬆

            </button>

            <button onClick={onMoveDown}>

                ⬇

            </button>

            <button onClick={onDelete}>

                🗑

            </button>

        </div>

    );

}