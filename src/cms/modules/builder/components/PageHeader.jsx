import "./PageHeader.css";

export default function PageHeader({
    page,
    onSave,
    onPublish,
    onPreview,
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false,
    isSaving = false,
    isPublishing = false
}) {
    const statusLabel =
        page.status === "published"
            ? "Veröffentlicht"
            : "Entwurf";

    return (
        <header className="bp-page-header">
            <div className="bp-page-header-left">
                <h1>
                    {page.title}
                </h1>

                <small>
                    Status: {statusLabel}
                </small>
            </div>

            <div className="bp-page-header-right">
                <button
                    type="button"
                    onClick={onUndo}
                    disabled={!canUndo}
                >
                    ↶ Rückgängig
                </button>

                <button
                    type="button"
                    onClick={onRedo}
                    disabled={!canRedo}
                >
                    ↷ Wiederholen
                </button>

                <button
                    type="button"
                    onClick={onPreview}
                >
                    Vorschau
                </button>

                <button
                    type="button"
                    onClick={onSave}
                    disabled={isSaving}
                >
                    {
                        isSaving
                            ? "Speichert …"
                            : "Speichern"
                    }
                </button>

                <button
                    type="button"
                    onClick={onPublish}
                    disabled={isPublishing}
                >
                    {
                        isPublishing
                            ? "Veröffentlicht …"
                            : "Veröffentlichen"
                    }
                </button>
            </div>
        </header>
    );
}