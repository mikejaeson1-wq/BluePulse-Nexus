import "./PageHeader.css";

function formatSavedTime(
    value
) {
    if (!value) {
        return "Noch nicht gespeichert";
    }

    const date =
        new Date(
            value
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Gespeichert";
    }

    return `Gespeichert um ${date.toLocaleTimeString(
        "de-DE",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    )}`;
}

export default function PageHeader({
    page,
    onSave,
    onPublish,
    onPreview,
    onSettings,
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false,
    isSaving = false,
    isPublishing = false,
    isDirty = false,
    lastSavedAt = null
}) {
    const statusLabel =
        page.status ===
        "published"
            ? "Veröffentlicht"
            : "Entwurf";

    return (
        <header className="bp-page-header">
            <div className="bp-page-header__identity">
                <div>
                    <span className="bp-page-header__eyebrow">
                        BluePulse Builder
                    </span>

                    <h1>
                        {
                            page.title
                        }
                    </h1>

                    <small className="bp-page-header__meta">
                        <span>
                            Status: {
                                statusLabel
                            }
                        </span>

                        <span>
                            /{
                                page.slug
                            }
                        </span>
                    </small>
                </div>

                <div
                    className={
                        isDirty
                            ? "bp-page-header__save-status bp-page-header__save-status--dirty"
                            : "bp-page-header__save-status bp-page-header__save-status--clean"
                    }
                    role="status"
                    aria-live="polite"
                >
                    <i
                        className={
                            isDirty
                                ? "bi bi-exclamation-circle-fill"
                                : "bi bi-check-circle-fill"
                        }
                        aria-hidden="true"
                    />

                    <span>
                        <strong>
                            {
                                isDirty
                                    ? "Ungespeicherte Änderungen"
                                    : "Alle Änderungen gespeichert"
                            }
                        </strong>

                        <small>
                            {
                                isDirty
                                    ? "Vor dem Verlassen speichern"
                                    : formatSavedTime(
                                        lastSavedAt
                                    )
                            }
                        </small>
                    </span>
                </div>
            </div>

            <div className="bp-page-header__actions">
                <div className="bp-page-header__action-group">
                    <button
                        type="button"
                        onClick={
                            onUndo
                        }
                        disabled={
                            !canUndo
                        }
                    >
                        <i
                            className="bi bi-arrow-counterclockwise"
                            aria-hidden="true"
                        />

                        Rückgängig
                    </button>

                    <button
                        type="button"
                        onClick={
                            onRedo
                        }
                        disabled={
                            !canRedo
                        }
                    >
                        <i
                            className="bi bi-arrow-clockwise"
                            aria-hidden="true"
                        />

                        Wiederholen
                    </button>
                </div>

                <div className="bp-page-header__action-group">
                    <button
                        type="button"
                        onClick={
                            onSettings
                        }
                    >
                        <i
                            className="bi bi-sliders"
                            aria-hidden="true"
                        />

                        Einstellungen
                    </button>

                    <button
                        type="button"
                        onClick={
                            onPreview
                        }
                    >
                        <i
                            className="bi bi-eye"
                            aria-hidden="true"
                        />

                        Vorschau
                    </button>
                </div>

                <div className="bp-page-header__action-group">
                    <button
                        type="button"
                        className={
                            isDirty
                                ? "bp-page-header__save-button bp-page-header__save-button--dirty"
                                : "bp-page-header__save-button"
                        }
                        onClick={
                            onSave
                        }
                        disabled={
                            isSaving
                        }
                    >
                        <i
                            className={
                                isSaving
                                    ? "bi bi-arrow-repeat"
                                    : "bi bi-floppy"
                            }
                            aria-hidden="true"
                        />

                        {
                            isSaving
                                ? "Speichert …"
                                : "Speichern"
                        }
                    </button>

                    <button
                        type="button"
                        className="bp-page-header__publish-button"
                        onClick={
                            onPublish
                        }
                        disabled={
                            isPublishing
                        }
                    >
                        <i
                            className={
                                isPublishing
                                    ? "bi bi-arrow-repeat"
                                    : "bi bi-cloud-arrow-up"
                            }
                            aria-hidden="true"
                        />

                        {
                            isPublishing
                                ? "Veröffentlicht …"
                                : "Veröffentlichen"
                        }
                    </button>
                </div>
            </div>
        </header>
    );
}
