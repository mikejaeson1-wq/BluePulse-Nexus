import "./Columns.css";
import "./ColumnsDragDrop.css";

import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    useDndContext,
    useDroppable
} from "@dnd-kit/core";

import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";

import {
    CSS
} from "@dnd-kit/utilities";

import {
    getBlock,
    getBlocks
} from "../../registry/blockRegistry";

import {
    useBuilderEditor
} from "../../context/BuilderEditorContext";

import EditorOverlay from "../../components/EditorOverlay";

import {
    getColumnsGridTemplate,
    getColumnsRatioLabel,
    normalizeColumnsBlockData
} from "@shared/layout/columnsBlockModel";

const COMPACT_BLOCK_TYPES =
    new Set([
        "divider",
        "spacer"
    ]);

function getBlockIcon(
    definition
) {
    const icon =
        String(
            definition?.icon ??
            ""
        ).trim();

    return icon.startsWith(
        "bi-"
    )
        ? icon
        : "bi-box";
}

function getColumnStyle(column) {
    const appearance =
        column.appearance;

    return {
        "--bp-column-background":
            appearance.backgroundEnabled
                ? appearance.backgroundColor
                : "transparent",

        "--bp-column-padding-top":
            `${appearance.paddingTop}px`,

        "--bp-column-padding-right":
            `${appearance.paddingRight}px`,

        "--bp-column-padding-bottom":
            `${appearance.paddingBottom}px`,

        "--bp-column-padding-left":
            `${appearance.paddingLeft}px`,

        "--bp-column-border-width":
            `${appearance.borderWidth}px`,

        "--bp-column-border-color":
            appearance.borderColor,

        "--bp-column-border-radius":
            `${appearance.borderRadius}px`
    };
}

function NestedColumnBlock({
    nestedBlock,
    parentBlockId,
    columnId,
    index,
    total,
    renderBlock,
    editor,
    disabled = false
}) {
    const localNodeRef =
        useRef(null);

    const definition =
        getBlock(
            nestedBlock.type
        );

    const blockName =
        definition?.name ??
        nestedBlock.type ??
        "Block";

    const blockType =
        definition?.type ??
        nestedBlock.type ??
        "block";

    const selected =
        editor.selectedId ===
        nestedBlock.id;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } =
        useSortable({
            id:
                nestedBlock.id,

            disabled,

            data: {
                type:
                    "builder-block",

                blockId:
                    nestedBlock.id,

                blockType,

                containerType:
                    "column",

                parentBlockId,

                columnId,

                index
            }
        });

    function setCombinedNodeRef(node) {
        localNodeRef.current =
            node;

        setNodeRef(
            node
        );
    }

    useEffect(() => {
        if (
            !selected ||
            isDragging ||
            !localNodeRef.current
        ) {
            return;
        }

        localNodeRef.current
            .scrollIntoView({
                behavior:
                    "smooth",

                block:
                    "nearest"
            });
    }, [
        isDragging,
        selected
    ]);

    const style = {
        transform:
            CSS.Transform.toString(
                transform
            ),

        transition,

        position:
            "relative",

        zIndex:
            isDragging
                ? 80
                : undefined,

        opacity:
            isDragging
                ? 0.68
                : 1
    };

    return (
        <div
            ref={
                setCombinedNodeRef
            }
            className={
                [
                    "bp-columns__nested-editor",

                    selected
                        ? "bp-columns__nested-editor--selected"
                        : "",

                    isDragging
                        ? "bp-columns__nested-editor--dragging"
                        : ""
                ]
                    .filter(Boolean)
                    .join(" ")
            }
            style={
                style
            }
            data-builder-nested-block-id={
                nestedBlock.id
            }
            data-builder-nested-column-id={
                columnId
            }
        >
            <EditorOverlay
                blockName={
                    blockName
                }
                blockType={
                    blockType
                }
                blockIcon={
                    getBlockIcon(
                        definition
                    )
                }
                position={
                    index + 1
                }
                total={
                    total
                }
                compact={
                    COMPACT_BLOCK_TYPES.has(
                        blockType
                    )
                }
                selected={
                    selected
                }
                canMoveUp={
                    index >
                    0
                }
                canMoveDown={
                    index <
                    total - 1
                }
                onSelect={
                    () =>
                        editor
                            .onSelectBlock(
                                nestedBlock.id
                            )
                }
                onDelete={
                    () =>
                        editor
                            .onRequestDeleteBlock(
                                nestedBlock.id
                            )
                }
                onDuplicate={
                    () =>
                        editor
                            .onDuplicateBlock(
                                nestedBlock.id
                            )
                }
                onMoveUp={
                    () =>
                        editor
                            .onMoveBlockUp(
                                nestedBlock.id
                            )
                }
                onMoveDown={
                    () =>
                        editor
                            .onMoveBlockDown(
                                nestedBlock.id
                            )
                }
                dragHandleProps={
                    disabled
                        ? null
                        : {
                            ...attributes,
                            ...listeners
                        }
                }
            >
                {
                    renderBlock(
                        nestedBlock
                    )
                }
            </EditorOverlay>
        </div>
    );
}

function ColumnBlockPicker({
    open,
    definitions,
    onToggle,
    onAdd
}) {
    return (
        <div
            className="bp-columns__add-control"
            onClick={
                (event) =>
                    event.stopPropagation()
            }
        >
            <button
                type="button"
                className={
                    open
                        ? "bp-columns__add-button bp-columns__add-button--open"
                        : "bp-columns__add-button"
                }
                aria-expanded={
                    open
                }
                onClick={
                    onToggle
                }
            >
                <i
                    className={
                        open
                            ? "bi bi-x-lg"
                            : "bi bi-plus-lg"
                    }
                    aria-hidden="true"
                />

                {
                    open
                        ? "Auswahl schließen"
                        : "Block hinzufügen"
                }
            </button>

            {
                open && (
                    <div className="bp-columns__block-picker">
                        <header>
                            <div>
                                <strong>
                                    Block auswählen
                                </strong>

                                <span>
                                    Der Block wird in dieser Spalte eingefügt.
                                </span>
                            </div>

                            <span>
                                {
                                    definitions.length
                                }
                            </span>
                        </header>

                        <div className="bp-columns__block-picker-grid">
                            {
                                definitions.map(
                                    (definition) => (
                                        <button
                                            key={
                                                definition.type
                                            }
                                            type="button"
                                            onClick={
                                                () =>
                                                    onAdd(
                                                        definition
                                                    )
                                            }
                                        >
                                            <span>
                                                <i
                                                    className={
                                                        `bi ${getBlockIcon(
                                                            definition
                                                        )}`
                                                    }
                                                    aria-hidden="true"
                                                />
                                            </span>

                                            <div>
                                                <strong>
                                                    {
                                                        definition.name
                                                    }
                                                </strong>

                                                <small>
                                                    {
                                                        definition.category
                                                    }
                                                </small>
                                            </div>

                                            <i
                                                className="bi bi-plus-circle"
                                                aria-hidden="true"
                                            />
                                        </button>
                                    )
                                )
                            }
                        </div>

                        <footer>
                            Weitere Spaltencontainer können per Drag-and-drop verschachtelt werden.
                        </footer>
                    </div>
                )
            }
        </div>
    );
}

function EmptyColumn({
    column
}) {
    return (
        <div className="bp-columns__empty">
            <span className="bp-columns__empty-icon">
                <i
                    className="bi bi-grid"
                    aria-hidden="true"
                />
            </span>

            <strong>
                {
                    column.label
                } ist leer
            </strong>

            <span>
                Füge einen Block hinzu oder ziehe einen Block hierher.
            </span>
        </div>
    );
}

function MissingNestedRenderer({
    column
}) {
    return (
        <div className="bp-columns__renderer-warning">
            <i
                className="bi bi-exclamation-triangle"
                aria-hidden="true"
            />

            <div>
                <strong>
                    Verschachtelte Inhalte vorhanden
                </strong>

                <span>
                    Die Blöcke in „{
                        column.label
                    }“ konnten nicht gerendert werden.
                </span>
            </div>
        </div>
    );
}

function EditableColumn({
    parentBlockId,
    column,
    columnIndex,
    availableBlocks,
    open,
    renderBlock,
    editor,
    onTogglePicker,
    onAddBlock
}) {
    const {
        active
    } =
        useDndContext();

    const activeBlockId =
        String(
            active?.data?.current
                ?.blockId ??
            active?.id ??
            ""
        );

    const parentIsDragging =
        activeBlockId ===
        parentBlockId;

    const dragActive =
        Boolean(
            active
        ) &&
        !parentIsDragging;

    const dropzoneId =
        [
            "bp-column-drop",
            parentBlockId,
            column.id
        ].join(":");

    const {
        setNodeRef,
        isOver
    } =
        useDroppable({
            id:
                dropzoneId,

            disabled:
                parentIsDragging,

            data: {
                type:
                    "builder-column-dropzone",

                containerType:
                    "column",

                parentBlockId,

                columnId:
                    column.id,

                index:
                    column.blocks.length
            }
        });

    return (
        <div
            ref={
                setNodeRef
            }
            className={
                [
                    "bp-columns__column",
                    "bp-columns__column--editor",

                    isOver
                        ? "bp-columns__column--drag-over"
                        : "",

                    parentIsDragging
                        ? "bp-columns__column--drop-disabled"
                        : ""
                ]
                    .filter(Boolean)
                    .join(" ")
            }
            style={
                getColumnStyle(
                    column
                )
            }
            data-column-id={
                column.id
            }
            data-column-position={
                columnIndex + 1
            }
            data-drag-active={
                dragActive
                    ? "true"
                    : "false"
            }
            data-drag-over={
                isOver
                    ? "true"
                    : "false"
            }
        >
            <div className="bp-columns__column-heading">
                <span>
                    {
                        columnIndex +
                        1
                    }
                </span>

                <div>
                    <strong>
                        {
                            column.label
                        }
                    </strong>

                    <small>
                        {
                            column.blocks.length
                        } {
                            column.blocks.length ===
                            1
                                ? "Block"
                                : "Blöcke"
                        }
                    </small>
                </div>

                {
                    dragActive && (
                        <span className="bp-columns__column-drag-status">
                            <i
                                className={
                                    isOver
                                        ? "bi bi-box-arrow-in-down"
                                        : "bi bi-arrows-move"
                                }
                                aria-hidden="true"
                            />

                            {
                                isOver
                                    ? "Hier ablegen"
                                    : "Ablagebereich"
                            }
                        </span>
                    )
                }
            </div>

            <SortableContext
                items={
                    column.blocks.map(
                        (nestedBlock) =>
                            nestedBlock.id
                    )
                }
                strategy={
                    verticalListSortingStrategy
                }
            >
                {
                    column.blocks.length >
                    0 ? (
                        typeof renderBlock ===
                        "function" ? (
                            <div className="bp-columns__nested">
                                {
                                    column.blocks.map(
                                        (
                                            nestedBlock,
                                            nestedIndex
                                        ) => (
                                            <NestedColumnBlock
                                                key={
                                                    nestedBlock.id
                                                }
                                                nestedBlock={
                                                    nestedBlock
                                                }
                                                parentBlockId={
                                                    parentBlockId
                                                }
                                                columnId={
                                                    column.id
                                                }
                                                index={
                                                    nestedIndex
                                                }
                                                total={
                                                    column.blocks.length
                                                }
                                                renderBlock={
                                                    renderBlock
                                                }
                                                editor={
                                                    editor
                                                }
                                                disabled={
                                                    parentIsDragging
                                                }
                                            />
                                        )
                                    )
                                }
                            </div>
                        ) : (
                            <MissingNestedRenderer
                                column={
                                    column
                                }
                            />
                        )
                    ) : (
                        <EmptyColumn
                            column={
                                column
                            }
                        />
                    )
                }
            </SortableContext>

            {
                dragActive && (
                    <div
                        className={
                            isOver
                                ? "bp-columns__drop-message bp-columns__drop-message--active"
                                : "bp-columns__drop-message"
                        }
                        aria-hidden="true"
                    >
                        <i
                            className="bi bi-box-arrow-in-down"
                        />

                        <span>
                            {
                                isOver
                                    ? "Block jetzt in dieser Spalte ablegen"
                                    : "Block in diese Spalte ziehen"
                            }
                        </span>
                    </div>
                )
            }

            <ColumnBlockPicker
                open={
                    open
                }
                definitions={
                    availableBlocks
                }
                onToggle={
                    onTogglePicker
                }
                onAdd={
                    onAddBlock
                }
            />
        </div>
    );
}

function WebsiteColumn({
    column,
    columnIndex,
    renderBlock
}) {
    return (
        <div
            className="bp-columns__column"
            style={
                getColumnStyle(
                    column
                )
            }
            data-column-id={
                column.id
            }
            data-column-position={
                columnIndex + 1
            }
        >
            {
                column.blocks.length >
                    0 &&
                typeof renderBlock ===
                    "function" && (
                    <div className="bp-columns__nested">
                        {
                            column.blocks.map(
                                (nestedBlock) => (
                                    <div
                                        key={
                                            nestedBlock.id
                                        }
                                        className="bp-columns__nested-item"
                                    >
                                        {
                                            renderBlock(
                                                nestedBlock
                                            )
                                        }
                                    </div>
                                )
                            )
                        }
                    </div>
                )
            }
        </div>
    );
}

export default function Columns({
    block,
    data,
    mode = "website",
    renderBlock
}) {
    const editor =
        useBuilderEditor();

    const [
        openColumnId,
        setOpenColumnId
    ] =
        useState(null);

    const normalizedData =
        normalizeColumnsBlockData(
            data
        );

    const editorMode =
        mode ===
            "editor" &&
        editor.enabled;

    const availableBlocks =
        useMemo(
            () =>
                getBlocks().filter(
                    (definition) =>
                        definition.type !==
                        "columns"
                ),
            []
        );

    const hasNestedBlocks =
        normalizedData.columns.some(
            (column) =>
                column.blocks.length >
                0
        );

    if (
        !editorMode &&
        !hasNestedBlocks
    ) {
        return null;
    }

    function toggleColumnPicker(
        columnId
    ) {
        setOpenColumnId(
            (
                currentColumnId
            ) =>
                currentColumnId ===
                columnId
                    ? null
                    : columnId
        );
    }

    function addBlock(
        columnId,
        definition
    ) {
        editor.onAddBlockToColumn(
            block.id,
            columnId,
            definition
        );

        setOpenColumnId(
            null
        );
    }

    const className = [
        "bp-columns",

        `bp-columns--align-${normalizedData.verticalAlignment}`,

        normalizedData.responsive
            .tablet
            .stack
            ? "bp-columns--stack-tablet"
            : "",

        normalizedData.responsive
            .tablet
            .reverse
            ? "bp-columns--reverse-tablet"
            : "",

        normalizedData.responsive
            .mobile
            .stack
            ? "bp-columns--stack-mobile"
            : "",

        normalizedData.responsive
            .mobile
            .reverse
            ? "bp-columns--reverse-mobile"
            : "",

        editorMode
            ? "bp-columns--editor"
            : "bp-columns--website"
    ]
        .filter(Boolean)
        .join(" ");

    const style = {
        "--bp-columns-template":
            getColumnsGridTemplate(
                normalizedData
            ),

        "--bp-columns-gap":
            `${normalizedData.gap}px`,

        "--bp-columns-tablet-gap":
            `${normalizedData.responsive.tablet.gap}px`,

        "--bp-columns-mobile-gap":
            `${normalizedData.responsive.mobile.gap}px`
    };

    return (
        <section
            className={
                className
            }
            style={
                style
            }
            data-columns-count={
                normalizedData.columnCount
            }
            data-columns-ratio={
                normalizedData.ratio
            }
        >
            {
                editorMode && (
                    <header className="bp-columns__editor-header">
                        <span>
                            <i
                                className="bi bi-columns-gap"
                                aria-hidden="true"
                            />

                            Spalten-Container
                        </span>

                        <small>
                            {
                                normalizedData.columnCount
                            } Spalten · {
                                getColumnsRatioLabel(
                                    normalizedData
                                )
                            }
                        </small>
                    </header>
                )
            }

            <div className="bp-columns__grid">
                {
                    normalizedData.columns.map(
                        (
                            column,
                            columnIndex
                        ) =>
                            editorMode ? (
                                <EditableColumn
                                    key={
                                        column.id
                                    }
                                    parentBlockId={
                                        block.id
                                    }
                                    column={
                                        column
                                    }
                                    columnIndex={
                                        columnIndex
                                    }
                                    availableBlocks={
                                        availableBlocks
                                    }
                                    open={
                                        openColumnId ===
                                        column.id
                                    }
                                    renderBlock={
                                        renderBlock
                                    }
                                    editor={
                                        editor
                                    }
                                    onTogglePicker={
                                        () =>
                                            toggleColumnPicker(
                                                column.id
                                            )
                                    }
                                    onAddBlock={
                                        (definition) =>
                                            addBlock(
                                                column.id,
                                                definition
                                            )
                                    }
                                />
                            ) : (
                                <WebsiteColumn
                                    key={
                                        column.id
                                    }
                                    column={
                                        column
                                    }
                                    columnIndex={
                                        columnIndex
                                    }
                                    renderBlock={
                                        renderBlock
                                    }
                                />
                            )
                    )
                }
            </div>
        </section>
    );
}