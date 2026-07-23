import "./UnsavedChangesDialog.css";

import {
    useEffect
} from "react";

export default function UnsavedChangesDialog({
    open = false,
    destination = "",
    isSaving = false,
    error = "",
    onCancel,
    onDiscard,
    onSaveAndLeave
}) {
    useEffect(() => {
        if (!open) {
            return undefined;
        }

        function handleKeyDown(
            event
        ) {
            if (
                event.key ===
                    "Escape" &&
                !isSaving
            ) {
                onCancel?.();
            }
        }

        globalThis.document
            ?.addEventListener(
                "keydown",
                handleKeyDown
            );

        return () => {
            globalThis.document
                ?.removeEventListener(
                    "keydown",
                    handleKeyDown
                );
        };
    }, [
        isSaving,
        onCancel,
        open
    ]);

    if (!open) {
        return null;
    }

    return (
        <div
            className="bp-unsaved-dialog"
            role="presentation"
        >
            <button
                type="button"
                className="bp-unsaved-dialog__backdrop"
                aria-label="Dialog schließen und weiterbearbeiten"
                disabled={
                    isSaving
                }
                onClick={
                    onCancel
                }
            />

            <section
                className="bp-unsaved-dialog__panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="bp-unsaved-dialog-title"
                aria-describedby="bp-unsaved-dialog-description"
            >
                <header className="bp-unsaved-dialog__header">
                    <span className="bp-unsaved-dialog__icon">
                        <i
                            className="bi bi-exclamation-triangle-fill"
                            aria-hidden="true"
                        />
                    </span>

                    <div>
                        <span className="bp-unsaved-dialog__eyebrow">
                            Ungespeicherte Änderungen
                        </span>

                        <h2 id="bp-unsaved-dialog-title">
                            Builder wirklich verlassen?
                        </h2>
                    </div>
                </header>

                <div className="bp-unsaved-dialog__content">
                    <p id="bp-unsaved-dialog-description">
                        Die aktuelle Seite enthält Änderungen, die noch nicht gespeichert wurden.
                    </p>

                    {
                        destination && (
                            <div className="bp-unsaved-dialog__destination">
                                <i
                                    className="bi bi-box-arrow-right"
                                    aria-hidden="true"
                                />

                                <span>
                                    Ziel: {
                                        destination
                                    }
                                </span>
                            </div>
                        )
                    }

                    {
                        error && (
                            <div
                                className="bp-unsaved-dialog__error"
                                role="alert"
                            >
                                <i
                                    className="bi bi-x-circle-fill"
                                    aria-hidden="true"
                                />

                                <span>
                                    {
                                        error
                                    }
                                </span>
                            </div>
                        )
                    }
                </div>

                <footer className="bp-unsaved-dialog__actions">
                    <button
                        type="button"
                        className="bp-unsaved-dialog__button bp-unsaved-dialog__button--secondary"
                        disabled={
                            isSaving
                        }
                        onClick={
                            onCancel
                        }
                    >
                        <i
                            className="bi bi-pencil-square"
                            aria-hidden="true"
                        />

                        Weiterbearbeiten
                    </button>

                    <button
                        type="button"
                        className="bp-unsaved-dialog__button bp-unsaved-dialog__button--danger"
                        disabled={
                            isSaving
                        }
                        onClick={
                            onDiscard
                        }
                    >
                        <i
                            className="bi bi-trash3"
                            aria-hidden="true"
                        />

                        Änderungen verwerfen
                    </button>

                    <button
                        type="button"
                        className="bp-unsaved-dialog__button bp-unsaved-dialog__button--primary"
                        disabled={
                            isSaving
                        }
                        onClick={
                            onSaveAndLeave
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
                                ? "Wird gespeichert …"
                                : "Speichern und verlassen"
                        }
                    </button>
                </footer>
            </section>
        </div>
    );
}
