import homeLayoutDefaults from "./homeLayoutDefaults";

const STORAGE_KEY =
    "bluepulse.website.home-layout.v1";

const CHANGE_EVENT =
    "bluepulse:home-layout-change";

function cloneValue(value) {
    if (
        typeof globalThis.structuredClone ===
        "function"
    ) {
        return globalThis.structuredClone(value);
    }

    return JSON.parse(
        JSON.stringify(value)
    );
}

function normalizeItem(
    storedItem,
    defaultItem,
    index
) {
    const storedOrder =
        Number(storedItem?.order);

    return {
        id: defaultItem.id,
        sectionId:
            defaultItem.sectionId,
        label:
            defaultItem.label,
        component:
            defaultItem.component,
        route:
            defaultItem.route,
        required:
            Boolean(
                defaultItem.required
            ),

        enabled:
            defaultItem.required
                ? true
                : storedItem?.enabled !==
                    undefined
                    ? Boolean(
                        storedItem.enabled
                    )
                    : Boolean(
                        defaultItem.enabled
                    ),

        order:
            Number.isFinite(
                storedOrder
            )
                ? storedOrder
                : defaultItem.order ??
                    (
                        index + 1
                    ) * 10
    };
}

function normalizeLayout(value = {}) {
    const storedItems =
        Array.isArray(value.items)
            ? value.items
            : [];

    const items =
        homeLayoutDefaults.items
            .map(
                (
                    defaultItem,
                    index
                ) => {
                    const storedItem =
                        storedItems.find(
                            (item) =>
                                item.id ===
                                defaultItem.id
                        );

                    return normalizeItem(
                        storedItem,
                        defaultItem,
                        index
                    );
                }
            )
            .sort(
                (
                    firstItem,
                    secondItem
                ) =>
                    firstItem.order -
                    secondItem.order
            )
            .map(
                (item, index) => ({
                    ...item,
                    order:
                        (
                            index + 1
                        ) * 10
                })
            );

    return {
        items
    };
}

function readStoredLayout() {
    if (
        typeof globalThis.localStorage ===
        "undefined"
    ) {
        return null;
    }

    try {
        const storedValue =
            globalThis.localStorage.getItem(
                STORAGE_KEY
            );

        if (!storedValue) {
            return null;
        }

        return JSON.parse(
            storedValue
        );
    } catch (error) {
        console.error(
            "Startseiten-Layout konnte nicht geladen werden.",
            error
        );

        return null;
    }
}

function writeLayout(layout) {
    if (
        typeof globalThis.localStorage ===
        "undefined"
    ) {
        return;
    }

    globalThis.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(layout)
    );
}

function emitLayoutChange() {
    if (
        typeof globalThis.window ===
        "undefined"
    ) {
        return;
    }

    globalThis.window.dispatchEvent(
        new CustomEvent(
            CHANGE_EVENT
        )
    );
}

export function getHomeLayout() {
    return normalizeLayout(
        readStoredLayout() ??
        homeLayoutDefaults
    );
}

export function updateHomeLayout(
    layout
) {
    const normalizedLayout =
        normalizeLayout(layout);

    writeLayout(
        normalizedLayout
    );

    emitLayoutChange();

    return cloneValue(
        normalizedLayout
    );
}

export function resetHomeLayout() {
    const defaultLayout =
        normalizeLayout(
            homeLayoutDefaults
        );

    writeLayout(
        defaultLayout
    );

    emitLayoutChange();

    return cloneValue(
        defaultLayout
    );
}

export function subscribeToHomeLayout(
    listener
) {
    if (
        typeof globalThis.window ===
        "undefined"
    ) {
        return () => {};
    }

    function handleLayoutChange() {
        listener(
            getHomeLayout()
        );
    }

    function handleStorageChange(event) {
        if (
            event.key !==
            STORAGE_KEY
        ) {
            return;
        }

        handleLayoutChange();
    }

    globalThis.window.addEventListener(
        CHANGE_EVENT,
        handleLayoutChange
    );

    globalThis.window.addEventListener(
        "storage",
        handleStorageChange
    );

    return () => {
        globalThis.window.removeEventListener(
            CHANGE_EVENT,
            handleLayoutChange
        );

        globalThis.window.removeEventListener(
            "storage",
            handleStorageChange
        );
    };
}