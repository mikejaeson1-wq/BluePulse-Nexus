import "./Modal.css";

export default function Modal({

    open,

    title,

    children,

    onClose

}) {

    if (!open) {

        return null;

    }

    return (

        <div

            className="bp-modal-backdrop"

            onClick={onClose}

        >

            <div

                className="bp-modal"

                onClick={(e)=>e.stopPropagation()}

            >

                <div className="bp-modal-header">

                    <h2>{title}</h2>

                    <button onClick={onClose}>

                        ✕

                    </button>

                </div>

                <div className="bp-modal-content">

                    {children}

                </div>

            </div>

        </div>

    );

}