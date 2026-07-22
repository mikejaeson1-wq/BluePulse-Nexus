import "./EditorOverlay.css";

import BlockToolbar from "./BlockToolbar";

export default function EditorOverlay({
    blockName = "Block",
    blockType = "block",
    blockIcon = "bi-box",
    position = 1,
    total = 1,
    compact = false,
    selected = false,
    canMoveUp = true,
    canMoveDown = true,
    onSelect,
    onDelete,
    onDuplicate,
    onMoveUp,
    onMoveDown,
    dragHandleProps,
    children
}) {
    const normalizedPosition =
        Math.max(
            Number(
                position
            ) ||
            1,
            1
        );

    const normalizedTotal =
        Math.max(
            Number(
                total
            ) ||
            1,
            normalizedPosition
        );

    function selectBlock(
        event
    ) {
        event.stopPropagation();

        onSelect?.();
    }

    function handleKeyDown(
        event
    ) {
        if (
            event.key !==
                "Enter" &&
            event.key !==
                " "
        ) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        onSelect?.();
    }

    return (
        <div
            className={
                [
                    "bp-editor-overlay",

                    compact
                        ? "bp-editor-overlay--compact"
                        : "",

                    selected
                        ? "selected"
                        : ""
                ]
                    .filter(
                        Boolean
                    )
                    .join(
                        " "
                    )
            }
            tabIndex={
                0
            }
            role="button"
            aria-pressed={
                selected
            }
            aria-label={
                `${blockName}-Block, Position ${normalizedPosition} von ${normalizedTotal}, auswählen`
            }
            data-block-type={
                blockType
            }
            data-block-position={
                normalizedPosition
            }
            data-block-total={
                normalizedTotal
            }
            onClick={
                selectBlock
            }
            onKeyDown={
                handleKeyDown
            }
        >
            <div className="bp-editor-overlay__identity">
                <span className="bp-editor-overlay__identity-icon">
                    <i
                        className={
                            `bi ${blockIcon}`
                        }
                        aria-hidden="true"
                    />
                </span>

                <span className="bp-editor-overlay__identity-content">
                    <strong>
                        {
                            blockName
                        }
                    </strong>

                    <small>
                        {
                            blockType
                        }
                    </small>
                </span>
            </div>

            <BlockToolbar
                canMoveUp={
                    canMoveUp
                }
                canMoveDown={
                    canMoveDown
                }
                dragHandleProps={
                    dragHandleProps
                }
                onDelete={
                    onDelete
                }
                onDuplicate={
                    onDuplicate
                }
                onMoveUp={
                    onMoveUp
                }
                onMoveDown={
                    onMoveDown
                }
            />

            <div className="bp-editor-overlay__content">
                {
                    children
                }
            </div>

            <div
                className="bp-editor-overlay__position"
                aria-hidden="true"
            >
                <i className="bi bi-layers" />

                <span>
                    {
                        normalizedPosition
                    } / {
                        normalizedTotal
                    }
                </span>
            </div>

            {
                compact && (
                    <div
                        className="bp-editor-overlay__compact-guide"
                        aria-hidden="true"
                    >
                        <span />

                        <small>
                            {
                                blockType ===
                                "spacer"
                                    ? "Abstandsblock"
                                    : "Trennlinie"
                            }
                        </small>

                        <span />
                    </div>
                )
            }
        </div>
    );
}