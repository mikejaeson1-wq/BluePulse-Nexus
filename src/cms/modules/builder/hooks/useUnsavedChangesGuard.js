import {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

import {
    useLocation,
    useNavigate
} from "react-router-dom";

const BEFORE_UNLOAD_MESSAGE =
    "Diese Seite enthält ungespeicherte Änderungen.";

const HISTORY_NAVIGATION_MESSAGE =
    "Diese Seite enthält ungespeicherte Änderungen. Wirklich verlassen und die Änderungen verwerfen?";

function getCurrentPath(
    location
) {
    return [
        location.pathname,
        location.search,
        location.hash
    ].join("");
}

function getInternalDestination(
    element
) {
    const explicitDestination =
        element.getAttribute(
            "data-unsaved-navigation"
        );

    if (
        explicitDestination
    ) {
        return explicitDestination;
    }

    if (
        element.tagName !==
        "A"
    ) {
        return null;
    }

    if (
        element.hasAttribute(
            "download"
        )
    ) {
        return null;
    }

    const target =
        element.getAttribute(
            "target"
        );

    if (
        target &&
        target !==
            "_self"
    ) {
        return null;
    }

    const href =
        element.getAttribute(
            "href"
        );

    if (
        !href ||
        href.startsWith(
            "#"
        )
    ) {
        return null;
    }

    let destinationUrl;

    try {
        destinationUrl =
            new URL(
                href,
                globalThis.location.href
            );
    } catch {
        return null;
    }

    if (
        destinationUrl.origin !==
        globalThis.location.origin
    ) {
        return null;
    }

    return [
        destinationUrl.pathname,
        destinationUrl.search,
        destinationUrl.hash
    ].join("");
}

export default function useUnsavedChangesGuard({
    active = false,
    onSave
}) {
    const navigate =
        useNavigate();

    const location =
        useLocation();

    const activeRef =
        useRef(
            active
        );

    const bypassNavigationRef =
        useRef(false);

    const bypassNextPopStateRef =
        useRef(false);

    const [
        pendingDestination,
        setPendingDestination
    ] =
        useState(null);

    const [
        isSavingBeforeLeave,
        setIsSavingBeforeLeave
    ] =
        useState(false);

    const [
        saveError,
        setSaveError
    ] =
        useState("");

    useEffect(() => {
        activeRef.current =
            active;
    }, [
        active
    ]);

    useEffect(() => {
        if (
            active ||
            !pendingDestination
        ) {
            return;
        }

        setPendingDestination(
            null
        );

        setSaveError(
            ""
        );
    }, [
        active,
        pendingDestination
    ]);

    useEffect(() => {
        if (!active) {
            return undefined;
        }

        function handleBeforeUnload(
            event
        ) {
            if (
                bypassNavigationRef.current ||
                !activeRef.current
            ) {
                return;
            }

            event.preventDefault();

            event.returnValue =
                BEFORE_UNLOAD_MESSAGE;

            return BEFORE_UNLOAD_MESSAGE;
        }

        globalThis.addEventListener(
            "beforeunload",
            handleBeforeUnload
        );

        return () => {
            globalThis.removeEventListener(
                "beforeunload",
                handleBeforeUnload
            );
        };
    }, [
        active
    ]);

    useEffect(() => {
        if (!active) {
            return undefined;
        }

        function handleDocumentClick(
            event
        ) {
            if (
                bypassNavigationRef.current ||
                !activeRef.current ||
                event.defaultPrevented ||
                event.button !==
                    0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
            ) {
                return;
            }

            const target =
                event.target;

            if (
                !target ||
                typeof target.closest !==
                    "function"
            ) {
                return;
            }

            const navigationElement =
                target.closest(
                    "a[href], [data-unsaved-navigation]"
                );

            if (!navigationElement) {
                return;
            }

            const destination =
                getInternalDestination(
                    navigationElement
                );

            if (!destination) {
                return;
            }

            const currentPath =
                getCurrentPath(
                    location
                );

            if (
                destination ===
                currentPath
            ) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            if (
                typeof event
                    .stopImmediatePropagation ===
                "function"
            ) {
                event.stopImmediatePropagation();
            }

            setSaveError(
                ""
            );

            setPendingDestination(
                destination
            );
        }

        globalThis.document
            ?.addEventListener(
                "click",
                handleDocumentClick,
                true
            );

        return () => {
            globalThis.document
                ?.removeEventListener(
                    "click",
                    handleDocumentClick,
                    true
                );
        };
    }, [
        active,
        location
    ]);

    useEffect(() => {
        if (!active) {
            return undefined;
        }

        function handlePopState() {
            if (
                bypassNextPopStateRef.current
            ) {
                bypassNextPopStateRef.current =
                    false;

                return;
            }

            if (
                !activeRef.current
            ) {
                return;
            }

            const shouldLeave =
                globalThis.confirm(
                    HISTORY_NAVIGATION_MESSAGE
                );

            if (shouldLeave) {
                bypassNavigationRef.current =
                    true;

                return;
            }

            bypassNextPopStateRef.current =
                true;

            globalThis.history
                .forward();
        }

        globalThis.addEventListener(
            "popstate",
            handlePopState
        );

        return () => {
            globalThis.removeEventListener(
                "popstate",
                handlePopState
            );
        };
    }, [
        active
    ]);

    const navigateToPendingDestination =
        useCallback(
            () => {
                if (
                    !pendingDestination
                ) {
                    return;
                }

                const destination =
                    pendingDestination;

                bypassNavigationRef.current =
                    true;

                setPendingDestination(
                    null
                );

                setSaveError(
                    ""
                );

                navigate(
                    destination
                );

                globalThis.setTimeout(
                    () => {
                        bypassNavigationRef.current =
                            false;
                    },
                    250
                );
            },
            [
                navigate,
                pendingDestination
            ]
        );

    const cancelNavigation =
        useCallback(
            () => {
                if (
                    isSavingBeforeLeave
                ) {
                    return;
                }

                setPendingDestination(
                    null
                );

                setSaveError(
                    ""
                );
            },
            [
                isSavingBeforeLeave
            ]
        );

    const discardAndLeave =
        useCallback(
            () => {
                if (
                    isSavingBeforeLeave
                ) {
                    return;
                }

                navigateToPendingDestination();
            },
            [
                isSavingBeforeLeave,
                navigateToPendingDestination
            ]
        );

    const saveAndLeave =
        useCallback(
            async () => {
                if (
                    isSavingBeforeLeave ||
                    typeof onSave !==
                        "function"
                ) {
                    return;
                }

                setIsSavingBeforeLeave(
                    true
                );

                setSaveError(
                    ""
                );

                try {
                    await onSave();

                    navigateToPendingDestination();
                } catch (error) {
                    setSaveError(
                        error?.message ??
                        "Die Seite konnte nicht gespeichert werden."
                    );
                } finally {
                    setIsSavingBeforeLeave(
                        false
                    );
                }
            },
            [
                isSavingBeforeLeave,
                navigateToPendingDestination,
                onSave
            ]
        );

    return {
        open:
            Boolean(
                pendingDestination
            ),

        pendingDestination,

        isSavingBeforeLeave,

        saveError,

        cancelNavigation,

        discardAndLeave,

        saveAndLeave
    };
}
