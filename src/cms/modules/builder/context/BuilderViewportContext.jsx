import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState
} from "react";

const VALID_VIEWPORTS =
    new Set([
        "desktop",
        "tablet",
        "mobile"
    ]);

const BuilderViewportContext =
    createContext(null);

function normalizeViewport(
    viewport
) {
    const normalizedViewport =
        String(
            viewport ??
            ""
        )
            .trim()
            .toLowerCase();

    return VALID_VIEWPORTS.has(
        normalizedViewport
    )
        ? normalizedViewport
        : null;
}

export function BuilderViewportProvider({
    children
}) {
    const [
        activeViewport,
        setActiveViewportState
    ] =
        useState(null);

    const setActiveViewport =
        useCallback(
            (
                nextViewport
            ) => {
                setActiveViewportState(
                    (
                        currentViewport
                    ) => {
                        const resolvedViewport =
                            typeof nextViewport ===
                            "function"
                                ? nextViewport(
                                    currentViewport
                                )
                                : nextViewport;

                        const normalizedViewport =
                            normalizeViewport(
                                resolvedViewport
                            );

                        return normalizedViewport ??
                            currentViewport;
                    }
                );
            },
            []
        );

    const value =
        useMemo(
            () => ({
                activeViewport,

                setActiveViewport
            }),
            [
                activeViewport,
                setActiveViewport
            ]
        );

    return (
        <BuilderViewportContext.Provider
            value={
                value
            }
        >
            {
                children
            }
        </BuilderViewportContext.Provider>
    );
}

export function useBuilderViewport() {
    const context =
        useContext(
            BuilderViewportContext
        );

    if (context) {
        return context;
    }

    return {
        activeViewport:
            null,

        setActiveViewport:
            () => {}
    };
}