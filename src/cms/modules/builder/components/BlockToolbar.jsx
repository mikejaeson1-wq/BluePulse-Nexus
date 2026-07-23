import "./BlockToolbar.css";

function ToolbarButton({
    icon,
    label,
    danger = false,
    disabled = false,
    dragHandleProps = null,
    onClick
}) {
    function handleClick(
        event
    ) {
        event.preventDefault();
        event.stopPropagation();

        if (
            disabled ||
            !onClick
        ) {
            return;
        }

        onClick();
    }

    return (
        <button
            type="button"
            className={
                danger
                    ? "bp-block-toolbar__button bp-block-toolbar__button--danger"
                    : "bp-block-toolbar__button"
            }
            disabled={
                disabled
            }
            aria-label={
                label
            }
            title={
                label
            }
            onClick={
                handleClick
            }
            {
                ...(
                    dragHandleProps ??
                    {}
                )
            }
        >
            <i
                className={
                    `bi ${icon}`
                }
                aria-hidden="true"
            />

            <span className="bp-block-toolbar__tooltip">
                {
                    label
                }
            </span>
        </button>
    );
}

export default function BlockToolbar({
    canMoveUp = true,
    canMoveDown = true,
    dragHandleProps = null,
    onDuplicate,
    onDelete,
    onMoveUp,
    onMoveDown
}) {
    const hasDragHandle =
        Boolean(
            dragHandleProps
        );

    return (
        <div
            className="bp-block-toolbar"
            role="toolbar"
            aria-label="Block-Werkzeuge"
            onClick={
                (event) => {
                    event.stopPropagation();
                }
            }
        >
            {
                hasDragHandle && (
                    <>
                        <ToolbarButton
                            icon="bi-grip-vertical"
                            label="Block ziehen"
                            dragHandleProps={
                                dragHandleProps
                            }
                        />

                        <span
                            className="bp-block-toolbar__separator"
                            aria-hidden="true"
                        />
                    </>
                )
            }

            <ToolbarButton
                icon="bi-arrow-up"
                label="Block nach oben"
                disabled={
                    !canMoveUp
                }
                onClick={
                    onMoveUp
                }
            />

            <ToolbarButton
                icon="bi-arrow-down"
                label="Block nach unten"
                disabled={
                    !canMoveDown
                }
                onClick={
                    onMoveDown
                }
            />

            <ToolbarButton
                icon="bi-copy"
                label="Block duplizieren"
                onClick={
                    onDuplicate
                }
            />

            <span
                className="bp-block-toolbar__separator"
                aria-hidden="true"
            />

            <ToolbarButton
                icon="bi-trash3"
                label="Block löschen"
                danger
                onClick={
                    onDelete
                }
            />
        </div>
    );
}