import siteNavigationDefaults from "./SiteNavigationDefaults";

const STORAGE_KEY =
    "bluepulse.website.navigation.v1";

const CHANGE_EVENT =
    "bluepulse:site-navigation-change";

const DEFAULT_ITEM_IDS = new Set(
    siteNavigationDefaults.items.map(
        (item) => item.id
    )
);

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

function createId(prefix = "navigation") {
    if (globalThis.crypto?.randomUUID) {
        return `${prefix}-${globalThis.crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
}

function normalizeTarget(target) {
    return target === "_blank"
        ? "_blank"
        : "_self";
}

function normalizeText(
    value,
    fallback = ""
) {
    if (typeof value !== "string") {
        return fallback;
    }

    return value.trim();
}

function normalizeItem(
    item,
    fallback = {},
    index = 0
) {
    const id =
        normalizeText(
            item?.id,
            fallback.id
        ) || createId();

    const numericOrder =
        Number(item?.order);

    return {
        id,

        label:
            normalizeText(
                item?.label,
                fallback.label
            ) || "Unbenannter Link",

        href:
            typeof item?.href === "string"
                ? item.href.trim()
                : fallback.href ?? "",

        enabled:
            item?.enabled !== undefined
                ? Boolean(item.enabled)
                : Boolean(fallback.enabled),

        target:
            normalizeTarget(
                item?.target ??
                fallback.target
            ),

        order:
            Number.isFinite(numericOrder)
                ? numericOrder
                : fallback.order ??
                    (index + 1) * 10,

        parentId:
            normalizeText(
                item?.parentId,
                fallback.parentId
            ) || null,

        source:
            normalizeText(
                item?.source,
                fallback.source
            ) || "custom",

        sourceId:
            normalizeText(
                item?.sourceId,
                fallback.sourceId
            ) || null,

        removable:
            item?.removable !== undefined
                ? Boolean(item.removable)
                : fallback.removable !== undefined
                    ? Boolean(
                        fallback.removable
                    )
                    : !DEFAULT_ITEM_IDS.has(id)
    };
}

function wouldCreateCycle(
    item,
    itemMap
) {
    if (!item.parentId) {
        return false;
    }

    const visited =
        new Set([item.id]);

    let currentParentId =
        item.parentId;

    while (currentParentId) {
        if (visited.has(currentParentId)) {
            return true;
        }

        visited.add(currentParentId);

        const parent =
            itemMap.get(
                currentParentId
            );

        if (!parent) {
            return false;
        }

        currentParentId =
            parent.parentId;
    }

    return false;
}

function normalizeOrders(items) {
    const groups =
        new Map();

    items.forEach((item) => {
        const groupKey =
            item.parentId ?? "__root__";

        if (!groups.has(groupKey)) {
            groups.set(
                groupKey,
                []
            );
        }

        groups.get(groupKey).push(item);
    });

    groups.forEach((groupItems) => {
        groupItems
            .sort(
                (
                    firstItem,
                    secondItem
                ) =>
                    firstItem.order -
                    secondItem.order
            )
            .forEach(
                (item, index) => {
                    item.order =
                        (index + 1) * 10;
                }
            );
    });

    return items;
}

function normalizeNavigation(value = {}) {
    const storedItems =
        Array.isArray(value.items)
            ? value.items
            : [];

    const defaultItems =
        siteNavigationDefaults.items;

    const normalizedDefaults =
        defaultItems.map(
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
        );

    const additionalItems =
        storedItems
            .filter(
                (storedItem) =>
                    !DEFAULT_ITEM_IDS.has(
                        storedItem.id
                    )
            )
            .map(
                (item, index) =>
                    normalizeItem(
                        item,
                        {},
                        defaultItems.length +
                            index
                    )
            );

    let items = [
        ...normalizedDefaults,
        ...additionalItems
    ];

    const itemIds =
        new Set(
            items.map(
                (item) => item.id
            )
        );

    items = items.map((item) => {
        if (
            !item.parentId ||
            !itemIds.has(
                item.parentId
            ) ||
            item.parentId === item.id
        ) {
            return {
                ...item,
                parentId: null
            };
        }

        return item;
    });

    const itemMap =
        new Map(
            items.map(
                (item) => [
                    item.id,
                    item
                ]
            )
        );

    items = items.map((item) => {
        if (
            wouldCreateCycle(
                item,
                itemMap
            )
        ) {
            return {
                ...item,
                parentId: null
            };
        }

        return item;
    });

    items = normalizeOrders(
        items
    );

    const cta =
        normalizeItem(
            value.cta,
            siteNavigationDefaults.cta,
            0
        );

    return {
        items,
        cta: {
            id: cta.id,
            label: cta.label,
            href: cta.href,
            enabled: cta.enabled,
            target: cta.target
        }
    };
}

function readStoredNavigation() {
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
            "Navigation konnte nicht geladen werden.",
            error
        );

        return null;
    }
}

function writeNavigation(navigation) {
    if (
        typeof globalThis.localStorage ===
        "undefined"
    ) {
        return;
    }

    globalThis.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(navigation)
    );
}

function emitNavigationChange() {
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

export function getSiteNavigation() {
    return normalizeNavigation(
        readStoredNavigation() ??
        siteNavigationDefaults
    );
}

export function updateSiteNavigation(
    navigation
) {
    const normalizedNavigation =
        normalizeNavigation(
            navigation
        );

    writeNavigation(
        normalizedNavigation
    );

    emitNavigationChange();

    return cloneValue(
        normalizedNavigation
    );
}

export function resetSiteNavigation() {
    const defaultNavigation =
        normalizeNavigation(
            siteNavigationDefaults
        );

    writeNavigation(
        defaultNavigation
    );

    emitNavigationChange();

    return cloneValue(
        defaultNavigation
    );
}

export function subscribeToSiteNavigation(
    listener
) {
    if (
        typeof globalThis.window ===
        "undefined"
    ) {
        return () => {};
    }

    function handleNavigationChange() {
        listener(
            getSiteNavigation()
        );
    }

    function handleStorageChange(event) {
        if (
            event.key !==
            STORAGE_KEY
        ) {
            return;
        }

        handleNavigationChange();
    }

    globalThis.window.addEventListener(
        CHANGE_EVENT,
        handleNavigationChange
    );

    globalThis.window.addEventListener(
        "storage",
        handleStorageChange
    );

    return () => {
        globalThis.window.removeEventListener(
            CHANGE_EVENT,
            handleNavigationChange
        );

        globalThis.window.removeEventListener(
            "storage",
            handleStorageChange
        );
    };
}