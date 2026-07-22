import "./Canvas.css";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    DndContext,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors
} from "@dnd-kit/core";

import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";

import ThemeContext from "@website/theme/ThemeContext";
import defaultTheme from "@website/theme/defaultTheme";

import {
    useBuilderViewport
} from "../context/BuilderViewportContext";

import BuilderLivePreview from "./BuilderLivePreview";
import BuilderViewportToolbar from "./BuilderViewportToolbar";
import SortableBlock from "./SortableBlock";

const STORAGE_KEY =
    "bluepulse.builder.viewport.v1";

const MINIMUM_ZOOM =
    25;

const MAXIMUM_ZOOM =
    100;

const ZOOM_STEP =
    5;

const VIEWPORT_PADDING =
    28;

const VIEWPORT_VERTICAL_SPACE =
    92;

const VIEWPORTS = [
    {
        id:
            "desktop",

        label:
            "Desktop",

        icon:
            "bi-display",

        width:
            1440,

        height:
            900,

        browserHeight:
            44,

        defaultZoom:
            45,

        description:
            "Großer Bildschirm"
    },

    {
        id:
            "tablet",

        label:
            "Tablet",

        icon:
            "bi-tablet-landscape",

        width:
            834,

        height:
            1112,

        browserHeight:
            0,

        defaultZoom:
            70,

        description:
            "Tablet Hochformat"
    },

    {
        id:
            "mobile",

        label:
            "Mobil",

        icon:
            "bi-phone",

        width:
            390,

        height:
            844,

        browserHeight:
            0,

        defaultZoom:
            90,

        description:
            "Smartphone"
    }
];

const DEFAULT_PREFERENCES = {
    activeViewport:
        "desktop",

    canvasMode:
        "edit",

    autoFit:
        true,

    zoomLevels: {
        desktop:
            45,

        tablet:
            70,

        mobile:
            90
    }
};

function isValidViewport(
    viewportId
) {
    return VIEWPORTS.some(
        (viewport) =>
            viewport.id ===
            viewportId
    );
}

function clampZoom(
    value
) {
    const numericValue =
        Number(
            value
        );

    if (
        !Number.isFinite(
            numericValue
        )
    ) {
        return MINIMUM_ZOOM;
    }

    return Math.min(
        MAXIMUM_ZOOM,
        Math.max(
            MINIMUM_ZOOM,
            Math.round(
                numericValue /
                ZOOM_STEP
            ) *
            ZOOM_STEP
        )
    );
}

function clampFitZoom(
    value
) {
    const numericValue =
        Number(
            value
        );

    if (
        !Number.isFinite(
            numericValue
        )
    ) {
        return MINIMUM_ZOOM;
    }

    const steppedValue =
        Math.floor(
            numericValue /
            ZOOM_STEP
        ) *
        ZOOM_STEP;

    return Math.min(
        MAXIMUM_ZOOM,
        Math.max(
            MINIMUM_ZOOM,
            steppedValue
        )
    );
}

function normalizePreferences(
    value
) {
    const activeViewport =
        isValidViewport(
            value?.activeViewport
        )
            ? value.activeViewport
            : DEFAULT_PREFERENCES
                .activeViewport;

    const canvasMode =
        value?.canvasMode ===
        "preview"
            ? "preview"
            : "edit";

    const zoomLevels = {};

    VIEWPORTS.forEach(
        (viewport) => {
            zoomLevels[
                viewport.id
            ] =
                clampZoom(
                    value?.zoomLevels?.[
                        viewport.id
                    ] ??
                    viewport.defaultZoom
                );
        }
    );

    return {
        activeViewport,

        canvasMode,

        autoFit:
            value?.autoFit !==
            undefined
                ? Boolean(
                    value.autoFit
                )
                : true,

        zoomLevels
    };
}

function loadPreferences() {
    if (
        typeof globalThis
            .localStorage ===
        "undefined"
    ) {
        return DEFAULT_PREFERENCES;
    }

    try {
        const storedValue =
            globalThis.localStorage
                .getItem(
                    STORAGE_KEY
                );

        if (!storedValue) {
            return DEFAULT_PREFERENCES;
        }

        return normalizePreferences(
            JSON.parse(
                storedValue
            )
        );
    } catch (
        error
    ) {
        console.error(
            "Die Builder-Ansicht konnte nicht geladen werden.",
            error
        );

        return DEFAULT_PREFERENCES;
    }
}

function savePreferences(
    preferences
) {
    if (
        typeof globalThis
            .localStorage ===
        "undefined"
    ) {
        return;
    }

    try {
        globalThis.localStorage
            .setItem(
                STORAGE_KEY,
                JSON.stringify(
                    preferences
                )
            );
    } catch (
        error
    ) {
        console.error(
            "Die Builder-Ansicht konnte nicht gespeichert werden.",
            error
        );
    }
}

function getPreviewPath(
    page
) {
    const slug =
        String(
            page?.slug ??
            ""
        )
            .trim()
            .replace(
                /^\/+/,
                ""
            );

    return slug
        ? `/${slug}`
        : "/";
}

function calculateFitZoom(
    viewport,
    availableSize
) {
    if (
        availableSize.width <=
            0 ||
        availableSize.height <=
            0
    ) {
        return viewport
            .defaultZoom;
    }

    const availableWidth =
        Math.max(
            availableSize.width -
            VIEWPORT_PADDING,
            1
        );

    const availableHeight =
        Math.max(
            availableSize.height -
            VIEWPORT_VERTICAL_SPACE,
            1
        );

    const widthZoom =
        (
            availableWidth /
            viewport.width
        ) *
        100;

    const heightZoom =
        (
            availableHeight /
            viewport.height
        ) *
        100;

    return clampFitZoom(
        Math.min(
            widthZoom,
            heightZoom,
            MAXIMUM_ZOOM
        )
    );
}

export default function Canvas({
    page = null,
    blocks = [],
    selectedId,
    onSelect,
    onDelete,
    onDuplicate,
    onMove,
    onMoveUp,
    onMoveDown
}) {
    const canvasRef =
        useRef(null);

    const viewportRef =
        useRef(null);

    const {
        activeViewport:
            synchronizedViewport,

        setActiveViewport:
            setSynchronizedViewport
    } =
        useBuilderViewport();

    const [
        preferences,
        setPreferences
    ] =
        useState(
            loadPreferences
        );

    const [
        availableSize,
        setAvailableSize
    ] =
        useState({
            width:
                0,

            height:
                0
        });

    const [
        isFullscreen,
        setIsFullscreen
    ] =
        useState(false);

    const sensors =
        useSensors(
            useSensor(
                PointerSensor,
                {
                    activationConstraint: {
                        distance:
                            6
                    }
                }
            )
        );

    const resolvedViewportId =
        isValidViewport(
            synchronizedViewport
        )
            ? synchronizedViewport
            : preferences
                .activeViewport;

    const currentViewport =
        useMemo(
            () =>
                VIEWPORTS.find(
                    (viewport) =>
                        viewport.id ===
                        resolvedViewportId
                ) ??
                VIEWPORTS[0],
            [
                resolvedViewportId
            ]
        );

    const zoom =
        preferences
            .zoomLevels[
                currentViewport.id
            ] ??
        currentViewport
            .defaultZoom;

    const scale =
        zoom /
        100;

    const scaledWidth =
        Math.round(
            currentViewport.width *
            scale
        );

    const scaledHeight =
        Math.round(
            currentViewport.height *
            scale
        );

    const previewContentHeight =
        Math.max(
            currentViewport.height -
            currentViewport.browserHeight,
            400
        );

    const previewTitle =
        `${
            page?.title ??
            "Unbenannte Seite"
        } – ${
            currentViewport.label
        }-Vorschau`;

    const measureAvailableSize =
        useCallback(
            () => {
                const viewportElement =
                    viewportRef.current;

                if (
                    !viewportElement
                ) {
                    return;
                }

                const bounds =
                    viewportElement
                        .getBoundingClientRect();

                const nextSize = {
                    width:
                        Math.round(
                            bounds.width
                        ),

                    height:
                        Math.round(
                            bounds.height
                        )
                };

                setAvailableSize(
                    (
                        currentSize
                    ) => {
                        if (
                            currentSize.width ===
                                nextSize.width &&
                            currentSize.height ===
                                nextSize.height
                        ) {
                            return currentSize;
                        }

                        return nextSize;
                    }
                );
            },
            []
        );

    useEffect(() => {
        if (
            synchronizedViewport
        ) {
            return;
        }

        setSynchronizedViewport(
            preferences.activeViewport
        );
    }, [
        preferences.activeViewport,
        setSynchronizedViewport,
        synchronizedViewport
    ]);

    useEffect(() => {
        if (
            !isValidViewport(
                synchronizedViewport
            ) ||
            synchronizedViewport ===
                preferences.activeViewport
        ) {
            return;
        }

        setPreferences(
            (
                currentPreferences
            ) => ({
                ...currentPreferences,

                activeViewport:
                    synchronizedViewport
            })
        );
    }, [
        preferences.activeViewport,
        synchronizedViewport
    ]);

    useEffect(() => {
        savePreferences(
            preferences
        );
    }, [
        preferences
    ]);

    useEffect(() => {
        measureAvailableSize();

        const viewportElement =
            viewportRef.current;

        if (
            !viewportElement
        ) {
            return undefined;
        }

        if (
            typeof globalThis
                .ResizeObserver ===
            "function"
        ) {
            const observer =
                new globalThis
                    .ResizeObserver(
                        measureAvailableSize
                    );

            observer.observe(
                viewportElement
            );

            return () => {
                observer.disconnect();
            };
        }

        globalThis.window
            ?.addEventListener(
                "resize",
                measureAvailableSize
            );

        return () => {
            globalThis.window
                ?.removeEventListener(
                    "resize",
                    measureAvailableSize
                );
        };
    }, [
        measureAvailableSize
    ]);

    useEffect(() => {
        if (
            !preferences.autoFit ||
            availableSize.width <=
                0 ||
            availableSize.height <=
                0
        ) {
            return;
        }

        const fittedZoom =
            calculateFitZoom(
                currentViewport,
                availableSize
            );

        setPreferences(
            (
                currentPreferences
            ) => {
                const currentZoom =
                    currentPreferences
                        .zoomLevels[
                            currentViewport.id
                        ];

                if (
                    currentZoom ===
                    fittedZoom
                ) {
                    return currentPreferences;
                }

                return {
                    ...currentPreferences,

                    zoomLevels: {
                        ...currentPreferences
                            .zoomLevels,

                        [
                            currentViewport.id
                        ]:
                            fittedZoom
                    }
                };
            }
        );
    }, [
        availableSize.height,
        availableSize.width,
        currentViewport,
        isFullscreen,
        preferences.autoFit
    ]);

    useEffect(() => {
        function handleFullscreenChange() {
            const fullscreenActive =
                globalThis.document
                    ?.fullscreenElement ===
                canvasRef.current;

            setIsFullscreen(
                fullscreenActive
            );

            globalThis
                .requestAnimationFrame
                ?.(
                    measureAvailableSize
                );
        }

        globalThis.document
            ?.addEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );

        return () => {
            globalThis.document
                ?.removeEventListener(
                    "fullscreenchange",
                    handleFullscreenChange
                );
        };
    }, [
        measureAvailableSize
    ]);

    function changeViewport(
        viewportId
    ) {
        if (
            !isValidViewport(
                viewportId
            )
        ) {
            return;
        }

        setSynchronizedViewport(
            viewportId
        );

        setPreferences(
            (
                currentPreferences
            ) => ({
                ...currentPreferences,

                activeViewport:
                    viewportId
            })
        );
    }

    function changeCanvasMode(
        canvasMode
    ) {
        setPreferences(
            (
                currentPreferences
            ) => ({
                ...currentPreferences,

                canvasMode:
                    canvasMode ===
                    "preview"
                        ? "preview"
                        : "edit"
            })
        );
    }

    function changeZoom(
        nextZoom
    ) {
        setPreferences(
            (
                currentPreferences
            ) => ({
                ...currentPreferences,

                autoFit:
                    false,

                zoomLevels: {
                    ...currentPreferences
                        .zoomLevels,

                    [
                        currentViewport.id
                    ]:
                        clampZoom(
                            nextZoom
                        )
                }
            })
        );
    }

    function resetZoom() {
        setPreferences(
            (
                currentPreferences
            ) => ({
                ...currentPreferences,

                autoFit:
                    false,

                zoomLevels: {
                    ...currentPreferences
                        .zoomLevels,

                    [
                        currentViewport.id
                    ]:
                        currentViewport
                            .defaultZoom
                }
            })
        );
    }

    function toggleAutoFit() {
        setPreferences(
            (
                currentPreferences
            ) => {
                const nextAutoFit =
                    !currentPreferences
                        .autoFit;

                if (!nextAutoFit) {
                    return {
                        ...currentPreferences,

                        autoFit:
                            false
                    };
                }

                const fittedZoom =
                    calculateFitZoom(
                        currentViewport,
                        availableSize
                    );

                return {
                    ...currentPreferences,

                    autoFit:
                        true,

                    zoomLevels: {
                        ...currentPreferences
                            .zoomLevels,

                        [
                            currentViewport.id
                        ]:
                            fittedZoom
                    }
                };
            }
        );
    }

    async function toggleFullscreen() {
        try {
            if (
                globalThis.document
                    ?.fullscreenElement
            ) {
                await globalThis.document
                    .exitFullscreen();

                return;
            }

            await canvasRef.current
                ?.requestFullscreen();
        } catch (
        error
        ) {
            console.error(
                "Der Vollbildmodus konnte nicht geändert werden.",
                error
            );
        }
    }

    function handleDragEnd(
        event
    ) {
        const {
            active,
            over
        } =
            event;

        if (
            !over ||
            active.id ===
            over.id
        ) {
            return;
        }

        const oldIndex =
            blocks.findIndex(
                (block) =>
                    block.id ===
                    active.id
            );

        const newIndex =
            blocks.findIndex(
                (block) =>
                    block.id ===
                    over.id
            );

        if (
            oldIndex ===
                -1 ||
            newIndex ===
                -1
        ) {
            return;
        }

        onMove?.(
            arrayMove(
                blocks,
                oldIndex,
                newIndex
            )
        );
    }

    function handleEditSurfaceClick(
        event
    ) {
        const target =
            event.target;

        const clickedBlock =
            typeof target?.closest ===
                "function"
                ? target.closest(
                    "[data-builder-block-id]"
                )
                : null;

        if (clickedBlock) {
            return;
        }

        onSelect?.(
            null
        );
    }

    return (
        <section
            ref={
                canvasRef
            }
            className={
                [
                    "bp-builder-canvas",

                    isFullscreen
                        ? "bp-builder-canvas--fullscreen"
                        : "",

                    preferences
                        .canvasMode ===
                    "preview"
                        ? "bp-builder-canvas--preview"
                        : "bp-builder-canvas--edit"
                ]
                    .filter(
                        Boolean
                    )
                    .join(
                        " "
                    )
            }
        >
            <BuilderViewportToolbar
                viewports={
                    VIEWPORTS
                }
                activeViewport={
                    currentViewport.id
                }
                canvasMode={
                    preferences
                        .canvasMode
                }
                zoom={
                    zoom
                }
                minimumZoom={
                    MINIMUM_ZOOM
                }
                maximumZoom={
                    MAXIMUM_ZOOM
                }
                zoomStep={
                    ZOOM_STEP
                }
                autoFit={
                    preferences.autoFit
                }
                isFullscreen={
                    isFullscreen
                }
                onViewportChange={
                    changeViewport
                }
                onCanvasModeChange={
                    changeCanvasMode
                }
                onZoomChange={
                    changeZoom
                }
                onResetZoom={
                    resetZoom
                }
                onToggleAutoFit={
                    toggleAutoFit
                }
                onToggleFullscreen={
                    toggleFullscreen
                }
            />

            <div
                ref={
                    viewportRef
                }
                className="bp-builder-viewport"
            >
                <div className="bp-builder-viewport__environment">
                    <span>
                        <i
                            className={
                                preferences
                                    .canvasMode ===
                                "preview"
                                    ? "bi bi-eye"
                                    : "bi bi-pencil-square"
                            }
                            aria-hidden="true"
                        />

                        {
                            preferences
                                .canvasMode ===
                            "preview"
                                ? "Responsive Website-Vorschau"
                                : "Bearbeitbare Live-Ansicht"
                        }
                    </span>

                    <span>
                        {
                            currentViewport.label
                        } · {
                            zoom
                        } %
                        {
                            preferences
                                .autoFit
                                ? " · Eingepasst"
                                : ""
                        }
                    </span>
                </div>

                <div
                    className={
                        preferences
                            .canvasMode ===
                        "preview"
                            ? "bp-builder-viewport__shell bp-builder-viewport__shell--preview"
                            : "bp-builder-viewport__shell bp-builder-viewport__shell--edit"
                    }
                    style={{
                        width:
                            `${scaledWidth}px`,

                        minHeight:
                            `${scaledHeight}px`
                    }}
                >
                    <div
                        className={
                            [
                                "bp-builder-viewport__frame",

                                `bp-builder-viewport__frame--${currentViewport.id}`,

                                preferences
                                    .canvasMode ===
                                "preview"
                                    ? "bp-builder-viewport__frame--preview"
                                    : "bp-builder-viewport__frame--edit"
                            ]
                                .filter(
                                    Boolean
                                )
                                .join(
                                    " "
                                )
                        }
                        data-viewport={
                            currentViewport.id
                        }
                        data-canvas-mode={
                            preferences
                                .canvasMode
                        }
                        data-auto-fit={
                            preferences
                                .autoFit
                        }
                        style={{
                            width:
                                `${currentViewport.width}px`,

                            minHeight:
                                `${currentViewport.height}px`,

                            height:
                                preferences
                                    .canvasMode ===
                                "preview"
                                    ? `${currentViewport.height}px`
                                    : undefined,

                            zoom:
                                scale
                        }}
                    >
                        <div className="bp-builder-viewport__browser">
                            <div className="bp-builder-viewport__browser-controls">
                                <span />
                                <span />
                                <span />
                            </div>

                            <div className="bp-builder-viewport__address">
                                <i
                                    className="bi bi-lock-fill"
                                    aria-hidden="true"
                                />

                                <span>
                                    blue-pulse.de{
                                        getPreviewPath(
                                            page
                                        )
                                    }
                                </span>
                            </div>

                            <span className="bp-builder-viewport__browser-mode">
                                {
                                    preferences
                                        .canvasMode ===
                                    "preview"
                                        ? "Live"
                                        : "Editor"
                                }
                            </span>
                        </div>

                        {
                            preferences
                                .canvasMode ===
                            "preview" ? (
                                <BuilderLivePreview
                                    page={{
                                        ...page,

                                        blocks
                                    }}
                                    width={
                                        currentViewport
                                            .width
                                    }
                                    height={
                                        previewContentHeight
                                    }
                                    title={
                                        previewTitle
                                    }
                                />
                            ) : (
                                <div
                                    className="bp-builder-viewport__page bp-builder-viewport__page--edit"
                                    data-builder-edit-surface="true"
                                    style={{
                                        minHeight:
                                            `${previewContentHeight}px`
                                    }}
                                    onClick={
                                        handleEditSurfaceClick
                                    }
                                >
                                    <ThemeContext.Provider
                                        value={
                                            page?.theme ??
                                            defaultTheme
                                        }
                                    >
                                        {
                                            blocks.length ===
                                            0 ? (
                                                <div className="bp-builder-empty">
                                                    <span className="bp-builder-empty__icon">
                                                        <i
                                                            className="bi bi-layout-text-window"
                                                            aria-hidden="true"
                                                        />
                                                    </span>

                                                    <h2>
                                                        Leere Seite
                                                    </h2>

                                                    <p>
                                                        Füge links einen Block hinzu, um deine Website zu gestalten.
                                                    </p>
                                                </div>
                                            ) : (
                                                <DndContext
                                                    sensors={
                                                        sensors
                                                    }
                                                    collisionDetection={
                                                        closestCenter
                                                    }
                                                    onDragEnd={
                                                        handleDragEnd
                                                    }
                                                >
                                                    <SortableContext
                                                        items={
                                                            blocks.map(
                                                                (block) =>
                                                                    block.id
                                                            )
                                                        }
                                                        strategy={
                                                            verticalListSortingStrategy
                                                        }
                                                    >
                                                        {
                                                            blocks.map(
                                                                (
                                                                    block,
                                                                    index
                                                                ) => (
                                                                    <SortableBlock
                                                                        key={
                                                                            block.id
                                                                        }
                                                                        block={
                                                                            block
                                                                        }
                                                                        selected={
                                                                            selectedId ===
                                                                            block.id
                                                                        }
                                                                        canMoveUp={
                                                                            index >
                                                                            0
                                                                        }
                                                                        canMoveDown={
                                                                            index <
                                                                            blocks.length -
                                                                                1
                                                                        }
                                                                        onSelect={
                                                                            onSelect
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
                                                                )
                                                            )
                                                        }
                                                    </SortableContext>
                                                </DndContext>
                                            )
                                        }
                                    </ThemeContext.Provider>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </section>
    );
}