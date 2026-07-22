import "./BuilderLivePreview.css";

import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    createPortal
} from "react-dom";

import WebsiteRenderer from "@cms/rendering/WebsiteRenderer";

const PREVIEW_ROOT_ID =
    "bluepulse-builder-live-preview";

const PREVIEW_DOCUMENT = `
    <!doctype html>

    <html lang="de">
        <head>
            <meta charset="UTF-8" />

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            />

            <title>
                BluePulse Live-Vorschau
            </title>
        </head>

        <body>
            <div id="${PREVIEW_ROOT_ID}"></div>
        </body>
    </html>
`;

function getPreviewHeadNodes() {
    if (
        typeof globalThis.document ===
        "undefined"
    ) {
        return [];
    }

    return [
        ...globalThis.document
            .head
            .querySelectorAll(
                [
                    "link[rel='stylesheet']",
                    "style"
                ].join(
                    ","
                )
            )
    ];
}

function cloneHeadNode(
    sourceNode
) {
    if (
        !sourceNode ||
        typeof sourceNode.cloneNode !==
            "function"
    ) {
        return null;
    }

    const clonedNode =
        sourceNode.cloneNode(
            true
        );

    if (
        sourceNode.tagName ===
            "LINK" &&
        sourceNode.href
    ) {
        clonedNode.href =
            sourceNode.href;
    }

    clonedNode.setAttribute(
        "data-builder-preview-style",
        "true"
    );

    return clonedNode;
}

function synchronizeStyles(
    frameDocument
) {
    if (
        !frameDocument?.head
    ) {
        return;
    }

    frameDocument
        .head
        .querySelectorAll(
            "[data-builder-preview-style]"
        )
        .forEach(
            (node) => {
                node.remove();
            }
        );

    getPreviewHeadNodes()
        .forEach(
            (sourceNode) => {
                const clonedNode =
                    cloneHeadNode(
                        sourceNode
                    );

                if (!clonedNode) {
                    return;
                }

                frameDocument
                    .head
                    .appendChild(
                        clonedNode
                    );
            }
        );
}

function applyDocumentStyles(
    frameDocument,
    {
        background
    }
) {
    if (
        !frameDocument?.documentElement ||
        !frameDocument?.body
    ) {
        return;
    }

    const documentElement =
        frameDocument
            .documentElement;

    const body =
        frameDocument
            .body;

    documentElement.setAttribute(
        "data-builder-preview",
        "true"
    );

    documentElement.style.width =
        "100%";

    documentElement.style.minHeight =
        "100%";

    documentElement.style.margin =
        "0";

    documentElement.style.padding =
        "0";

    documentElement.style.background =
        background;

    body.style.width =
        "100%";

    body.style.minHeight =
        "100%";

    body.style.margin =
        "0";

    body.style.padding =
        "0";

    body.style.overflowX =
        "hidden";

    body.style.overflowY =
        "auto";

    body.style.background =
        background;
}

function getThemeBackground(
    page
) {
    return (
        page?.theme
            ?.colors
            ?.background ??
        page?.theme
            ?.background ??
        "#020617"
    );
}

export default function BuilderLivePreview({
    page,
    width,
    height,
    title
}) {
    const frameRef =
        useRef(null);

    const [
        frameDocument,
        setFrameDocument
    ] =
        useState(null);

    const [
        previewRoot,
        setPreviewRoot
    ] =
        useState(null);

    const [
        loading,
        setLoading
    ] =
        useState(true);

    const [
        failed,
        setFailed
    ] =
        useState(false);

    const themeBackground =
        useMemo(
            () =>
                getThemeBackground(
                    page
                ),
            [
                page
            ]
        );

    function initializeFrame() {
        const iframe =
            frameRef.current;

        const nextDocument =
            iframe
                ?.contentDocument ??
            iframe
                ?.contentWindow
                ?.document ??
            null;

        if (!nextDocument) {
            setFrameDocument(
                null
            );

            setPreviewRoot(
                null
            );

            setFailed(
                true
            );

            setLoading(
                false
            );

            return;
        }

        try {
            synchronizeStyles(
                nextDocument
            );

            applyDocumentStyles(
                nextDocument,
                {
                    background:
                        themeBackground
                }
            );

            const nextPreviewRoot =
                nextDocument
                    .getElementById(
                        PREVIEW_ROOT_ID
                    );

            if (!nextPreviewRoot) {
                throw new Error(
                    "Der Vorschau-Container wurde nicht gefunden."
                );
            }

            setFrameDocument(
                nextDocument
            );

            setPreviewRoot(
                nextPreviewRoot
            );

            setFailed(
                false
            );

            setLoading(
                false
            );
        } catch (
            initializationError
        ) {
            console.error(
                "Die Live-Vorschau konnte nicht initialisiert werden.",
                initializationError
            );

            setFrameDocument(
                null
            );

            setPreviewRoot(
                null
            );

            setFailed(
                true
            );

            setLoading(
                false
            );
        }
    }

    function reloadFrame() {
        setLoading(
            true
        );

        setFailed(
            false
        );

        setFrameDocument(
            null
        );

        setPreviewRoot(
            null
        );

        const iframe =
            frameRef.current;

        if (!iframe) {
            return;
        }

        iframe.srcdoc =
            PREVIEW_DOCUMENT;
    }

    useEffect(() => {
        if (!frameDocument) {
            return undefined;
        }

        synchronizeStyles(
            frameDocument
        );

        applyDocumentStyles(
            frameDocument,
            {
                background:
                    themeBackground
            }
        );

        const sourceHead =
            globalThis.document
                ?.head;

        if (
            !sourceHead ||
            typeof globalThis
                .MutationObserver !==
                "function"
        ) {
            return undefined;
        }

        let synchronizationTimer =
            null;

        const observer =
            new globalThis
                .MutationObserver(
                    () => {
                        globalThis
                            .clearTimeout(
                                synchronizationTimer
                            );

                        synchronizationTimer =
                            globalThis
                                .setTimeout(
                                    () => {
                                        synchronizeStyles(
                                            frameDocument
                                        );
                                    },
                                    100
                                );
                    }
                );

        observer.observe(
            sourceHead,
            {
                childList:
                    true,

                subtree:
                    true,

                attributes:
                    true,

                characterData:
                    true
            }
        );

        return () => {
            observer.disconnect();

            globalThis
                .clearTimeout(
                    synchronizationTimer
                );
        };
    }, [
        frameDocument,
        themeBackground
    ]);

    useEffect(() => {
        if (!frameDocument) {
            return;
        }

        applyDocumentStyles(
            frameDocument,
            {
                background:
                    themeBackground
            }
        );
    }, [
        frameDocument,
        themeBackground
    ]);

    return (
        <div
            className="builder-live-preview"
            style={{
                width:
                    `${width}px`,

                height:
                    `${height}px`
            }}
        >
            {
                loading && (
                    <div
                        className="builder-live-preview__state"
                        role="status"
                        aria-live="polite"
                    >
                        <span
                            className="spinner-border text-info"
                            aria-hidden="true"
                        />

                        <strong>
                            Live-Vorschau wird vorbereitet
                        </strong>

                        <span>
                            Website-Stile und aktuelle Seitendaten werden geladen.
                        </span>
                    </div>
                )
            }

            {
                failed && (
                    <div
                        className="builder-live-preview__state builder-live-preview__state--error"
                        role="alert"
                    >
                        <i
                            className="bi bi-exclamation-triangle"
                            aria-hidden="true"
                        />

                        <strong>
                            Vorschau nicht verfügbar
                        </strong>

                        <span>
                            Der interne Website-Browser konnte nicht initialisiert werden.
                        </span>

                        <button
                            type="button"
                            onClick={
                                reloadFrame
                            }
                        >
                            Erneut laden
                        </button>
                    </div>
                )
            }

            <iframe
                ref={
                    frameRef
                }
                className={
                    loading ||
                    failed
                        ? "builder-live-preview__frame builder-live-preview__frame--hidden"
                        : "builder-live-preview__frame"
                }
                title={
                    title
                }
                width={
                    width
                }
                height={
                    height
                }
                srcDoc={
                    PREVIEW_DOCUMENT
                }
                onLoad={
                    initializeFrame
                }
            />

            {
                previewRoot &&
                createPortal(
                    <div className="builder-live-preview__document">
                        <WebsiteRenderer
                            page={
                                page
                            }
                            mode="website"
                        />
                    </div>,
                    previewRoot
                )
            }
        </div>
    );
}