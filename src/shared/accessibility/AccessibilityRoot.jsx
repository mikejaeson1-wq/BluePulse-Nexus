import "./accessibility.css";

import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    useLocation
} from "react-router-dom";

function getMainContentElement() {
    return (
        globalThis.document
            ?.querySelector(
                "main#main-content"
            ) ??
        globalThis.document
            ?.querySelector(
                "main"
            ) ??
        null
    );
}

function ensureMainContentTarget() {
    const mainContent =
        getMainContentElement();

    if (!mainContent) {
        return null;
    }

    if (!mainContent.id) {
        mainContent.id =
            "main-content";
    }

    if (
        !mainContent.hasAttribute(
            "tabindex"
        )
    ) {
        mainContent.setAttribute(
            "tabindex",
            "-1"
        );
    }

    return mainContent;
}

function getHashTarget(
    hash
) {
    const normalizedHash =
        String(
            hash ??
            ""
        ).replace(
            /^#/,
            ""
        );

    if (!normalizedHash) {
        return null;
    }

    try {
        return globalThis.document
            ?.getElementById(
                decodeURIComponent(
                    normalizedHash
                )
            ) ??
            null;
    } catch {
        return globalThis.document
            ?.getElementById(
                normalizedHash
            ) ??
            null;
    }
}

function prefersReducedMotion() {
    return Boolean(
        globalThis.window
            ?.matchMedia?.(
                "(prefers-reduced-motion: reduce)"
            )
            .matches
    );
}

function focusTarget(
    target,
    {
        scroll =
            true
    } = {}
) {
    if (!target) {
        return;
    }

    if (
        !target.hasAttribute(
            "tabindex"
        )
    ) {
        target.setAttribute(
            "tabindex",
            "-1"
        );
    }

    target.focus({
        preventScroll:
            true
    });

    if (scroll) {
        target.scrollIntoView({
            behavior:
                prefersReducedMotion()
                    ? "auto"
                    : "smooth",

            block:
                "start"
        });
    }
}

export default function AccessibilityRoot({
    children
}) {
    const location =
        useLocation();

    const firstRoute =
        useRef(
            true
        );

    const [
        announcement,
        setAnnouncement
    ] =
        useState("");

    function handleSkipToContent(
        event
    ) {
        event.preventDefault();

        const mainContent =
            ensureMainContentTarget();

        focusTarget(
            mainContent
        );
    }

    useEffect(() => {
        const frameId =
            globalThis.window
                ?.requestAnimationFrame?.(
                    () => {
                        ensureMainContentTarget();
                    }
                );

        const timeoutId =
            globalThis.window
                ?.setTimeout?.(
                    () => {
                        const title =
                            String(
                                globalThis.document
                                    ?.title ??
                                "BluePulse"
                            ).trim();

                        setAnnouncement(
                            `Seite geladen: ${title}`
                        );
                    },
                    180
                );

        if (
            firstRoute.current
        ) {
            firstRoute.current =
                false;

            return () => {
                if (frameId) {
                    globalThis.window
                        ?.cancelAnimationFrame?.(
                            frameId
                        );
                }

                if (timeoutId) {
                    globalThis.window
                        ?.clearTimeout?.(
                            timeoutId
                        );
                }
            };
        }

        const focusTimeoutId =
            globalThis.window
                ?.setTimeout?.(
                    () => {
                        const hashTarget =
                            getHashTarget(
                                location.hash
                            );

                        if (hashTarget) {
                            focusTarget(
                                hashTarget
                            );

                            return;
                        }

                        const mainContent =
                            ensureMainContentTarget();

                        focusTarget(
                            mainContent,
                            {
                                scroll:
                                    false
                            }
                        );
                    },
                    40
                );

        return () => {
            if (frameId) {
                globalThis.window
                    ?.cancelAnimationFrame?.(
                        frameId
                    );
            }

            if (timeoutId) {
                globalThis.window
                    ?.clearTimeout?.(
                        timeoutId
                    );
            }

            if (focusTimeoutId) {
                globalThis.window
                    ?.clearTimeout?.(
                        focusTimeoutId
                    );
            }
        };
    }, [
        location.pathname,
        location.search,
        location.hash
    ]);

    return (
        <>
            <a
                className="bp-skip-link"
                href="#main-content"
                onClick={
                    handleSkipToContent
                }
            >
                Zum Hauptinhalt
            </a>

            <div
                className="bp-screen-reader-only"
                role="status"
                aria-live="polite"
                aria-atomic="true"
            >
                {
                    announcement
                }
            </div>

            {
                children
            }
        </>
    );
}
