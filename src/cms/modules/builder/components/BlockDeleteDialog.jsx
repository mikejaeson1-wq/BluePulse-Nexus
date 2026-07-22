import "./BlockDeleteDialog.css";

import {
    useEffect,
    useRef
} from "react";

import {
    createPortal
} from "react-dom";

export default function BlockDeleteDialog({
    open = false,
    blockName = "Block",
    blockType = "block",
    position = 1,
    total = 1,
    onCancel,
    onConfirm
}) {
    const cancelButtonRef =
        useRef(null);

    const normalizedPosition =
        Math.max(
            Number(position) ||
            1,
            1
        );

    const normalizedTotal =
        Math.max(
            Number(total) ||
            1,
            normalizedPosition
        );

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const previousActiveElement =
            globalThis.document
                ?.activeElement;

        const previousOverflow =
            globalThis.document
                ?.body
                ?.style
                ?.overflow;

        if (
            globalThis.document
                ?.body
        ) {
            globalThis.document
                .body
                .style
                .overflow =
                "hidden";
        }

        const focusTimer =
            globalThis.setTimeout(
                () => {
                    cancelButtonRef
                        .current
                        ?.focus();
                },
                0
            );

        function handleKeyDown(
            event
        ) {
            if (
                event.key ===
                "Escape"
            ) {
                event.preventDefault();
                event.stopPropagation();

                onCancel?.();

                return;
            }

            if (
                event.key !==
                "Tab"
            ) {
                return;
            }

            const dialog =
                globalThis.document
                    ?.querySelector(
                        "[data-block-delete-dialog='true']"
                    );

            if (!dialog) {
                return;
            }

            const focusableElements = [
                ...dialog.querySelectorAll(
                    [
                        "button:not([disabled])",
                        "[href]",
                        "input:not([disabled])",
                        "select:not([disabled])",
                        "textarea:not([disabled])",
                        "[tabindex]:not([tabindex='-1'])"
                    ].join(
                        ","
                    )
                )
            ];

            if (
                focusableElements.length ===
                0
            ) {
                return;
            }

            const firstElement =
                focusableElements[0];

            const lastElement =
                focusableElements[
                    focusableElements.length -
                    1
                ];

            if (
                event.shiftKey &&
                globalThis.document
                    ?.activeElement ===
                firstElement
            ) {
                event.preventDefault();

                lastElement.focus();

                return;
            }

            if (
                !event.shiftKey &&
                globalThis.document
                    ?.activeElement ===
                lastElement
            ) {
                event.preventDefault();

                firstElement.focus();
            }
        }

        globalThis.document
            ?.addEventListener(
                "keydown",
                handleKeyDown,
                true
            );

        return () => {
            globalThis.clearTimeout(
                focusTimer
            );

            globalThis.document
                ?.removeEventListener(
                    "keydown",
                    handleKeyDown,
                    true
                );

            if (
                globalThis.document
                    ?.body
            ) {
                globalThis.document
                    .body
                    .style
                    .overflow =
                    previousOverflow ??
                    "";
            }

            if (
                previousActiveElement &&
                typeof previousActiveElement
                    .focus ===
                    "function"
            ) {
                previousActiveElement
                    .focus();
            }
        };
    }, [
        onCancel,
        open
    ]);

    if (
        !open ||
        typeof globalThis.document ===
        "undefined"
    ) {
        return null;
    }

    function handleBackdropClick(
        event
    ) {
        if (
            event.target !==
            event.currentTarget
        ) {
            return;
        }

        onCancel?.();
    }

    function handleConfirm() {
        onConfirm?.();
    }

    return createPortal(
        <div
            className="builder-delete-dialog"
            role="presentation"
            onMouseDown={
                handleBackdropClick
            }
        >
            <section
                className="builder-delete-dialog__panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="builder-delete-dialog-title"
                aria-describedby="builder-delete-dialog-description"
                data-block-delete-dialog="true"
            >
                <div className="builder-delete-dialog__icon">
                    <i
                        className="bi bi-trash3"
                        aria-hidden="true"
                    />
                </div>

                <div className="builder-delete-dialog__content">
                    <span className="builder-delete-dialog__eyebrow">
                        Block löschen
                    </span>

                    <h2 id="builder-delete-dialog-title">
                        „{
                            blockName
                        }“ wirklich entfernen?
                    </h2>

                    <p id="builder-delete-dialog-description">
                        Der Block wird aus der aktuellen Seite entfernt. Die Änderung kann anschließend weiterhin über
                        {" "}
                        <strong>
                            Rückgängig
                        </strong>
                        {" "}
                        wiederhergestellt werden.
                    </p>

                    <div className="builder-delete-dialog__block">
                        <span className="builder-delete-dialog__block-icon">
                            <i
                                className="bi bi-box"
                                aria-hidden="true"
                            />
                        </span>

                        <span className="builder-delete-dialog__block-content">
                            <strong>
                                {
                                    blockName
                                }
                            </strong>

                            <small>
                                {
                                    blockType
                                } · Position {
                                    normalizedPosition
                                } von {
                                    normalizedTotal
                                }
                            </small>
                        </span>
                    </div>

                    <div className="builder-delete-dialog__hint">
                        <i
                            className="bi bi-info-circle"
                            aria-hidden="true"
                        />

                        <span>
                            Mit
                            {" "}
                            <kbd>
                                Esc
                            </kbd>
                            {" "}
                            kannst du den Vorgang abbrechen.
                        </span>
                    </div>
                </div>

                <footer className="builder-delete-dialog__actions">
                    <button
                        ref={
                            cancelButtonRef
                        }
                        type="button"
                        className="builder-delete-dialog__cancel"
                        onClick={
                            onCancel
                        }
                    >
                        <i
                            className="bi bi-x-lg"
                            aria-hidden="true"
                        />

                        Abbrechen
                    </button>

                    <button
                        type="button"
                        className="builder-delete-dialog__confirm"
                        onClick={
                            handleConfirm
                        }
                    >
                        <i
                            className="bi bi-trash3"
                            aria-hidden="true"
                        />

                        Block löschen
                    </button>
                </footer>
            </section>
        </div>,
        globalThis.document.body
    );
}