import "./PageHeader.css";

export default function PageHeader({

    page,

    onSave,

    onPublish,

    onPreview,

    onUndo,

    onRedo

}) {

    return (

        <header className="bp-page-header">

            <div className="bp-page-header-left">

                <h1>{page.title}</h1>

                <small>

                    Status: {page.status}

                </small>

            </div>

            <div className="bp-page-header-right">

                <button onClick={onUndo}>

                    ↶ Rückgängig

                </button>

                <button onClick={onRedo}>

                    ↷ Wiederholen

                </button>

                <button onClick={onPreview}>

                    Vorschau

                </button>

                <button onClick={onSave}>

                    Speichern

                </button>

                <button onClick={onPublish}>

                    Veröffentlichen

                </button>

            </div>

        </header>

    );

}