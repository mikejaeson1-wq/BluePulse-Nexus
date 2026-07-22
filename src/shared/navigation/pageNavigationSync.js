import {
    getSiteNavigationRepository
} from "@shared/data/repositories";

import {
    getPageSettings
} from "@shared/pages/pageSettings";

const navigationRepository =
    getSiteNavigationRepository();

const EMPTY_NAVIGATION = {
    items: [],

    cta: {
        id:
            "navigation-cta",

        label:
            "",

        href:
            "",

        enabled:
            false,

        target:
            "_self"
    }
};

function cloneValue(
    value
) {
    if (
        typeof globalThis
            .structuredClone ===
        "function"
    ) {
        return globalThis
            .structuredClone(
                value
            );
    }

    return JSON.parse(
        JSON.stringify(
            value
        )
    );
}

function normalizeText(
    value
) {
    return String(
        value ??
        ""
    ).trim();
}

function normalizeOrder(
    value
) {
    const order =
        Number.parseInt(
            value,
            10
        );

    if (
        !Number.isInteger(
            order
        )
    ) {
        return 100;
    }

    return Math.min(
        Math.max(
            order,
            0
        ),
        9999
    );
}

function normalizeNavigation(
    value
) {
    const source =
        value &&
        typeof value ===
            "object" &&
        !Array.isArray(
            value
        )
            ? value
            : {};

    return {
        ...EMPTY_NAVIGATION,
        ...source,

        items:
            Array.isArray(
                source.items
            )
                ? source.items.map(
                    (item) => ({
                        ...item,

                        parentId:
                            item.parentId ??
                            null
                    })
                )
                : [],

        cta: {
            ...EMPTY_NAVIGATION
                .cta,

            ...(
                source.cta ??
                {}
            )
        }
    };
}

function valuesAreEqual(
    firstValue,
    secondValue
) {
    return JSON.stringify(
        firstValue
    ) ===
        JSON.stringify(
            secondValue
        );
}

function getPageHref(
    page
) {
    const slug =
        normalizeText(
            page?.slug
        ).replace(
            /^\/+/,
            ""
        );

    return slug
        ? `/${slug}`
        : "/";
}

function getPageNavigationItems(
    items,
    pageId
) {
    return items.filter(
        (item) =>
            item.source ===
                "page" &&
            item.sourceId ===
                pageId
    );
}

function getChildren(
    items,
    parentId
) {
    return items
        .filter(
            (item) =>
                (
                    item.parentId ??
                    null
                ) ===
                parentId
        )
        .sort(
            (
                firstItem,
                secondItem
            ) =>
                (
                    Number(
                        firstItem.order
                    ) ||
                    0
                ) -
                (
                    Number(
                        secondItem.order
                    ) ||
                    0
                )
        );
}

function flattenNavigation(
    items
) {
    const result = [];
    const visited =
        new Set();

    function appendChildren(
        parentId,
        depth
    ) {
        getChildren(
            items,
            parentId
        ).forEach(
            (item) => {
                if (
                    visited.has(
                        item.id
                    )
                ) {
                    return;
                }

                visited.add(
                    item.id
                );

                result.push({
                    item,
                    depth
                });

                appendChildren(
                    item.id,
                    depth +
                        1
                );
            }
        );
    }

    appendChildren(
        null,
        0
    );

    items
        .filter(
            (item) =>
                !visited.has(
                    item.id
                )
        )
        .sort(
            (
                firstItem,
                secondItem
            ) =>
                (
                    Number(
                        firstItem.order
                    ) ||
                    0
                ) -
                (
                    Number(
                        secondItem.order
                    ) ||
                    0
                )
        )
        .forEach(
            (item) => {
                if (
                    visited.has(
                        item.id
                    )
                ) {
                    return;
                }

                visited.add(
                    item.id
                );

                result.push({
                    item,
                    depth: 0
                });

                appendChildren(
                    item.id,
                    1
                );
            }
        );

    return result;
}

function getDescendantIds(
    items,
    parentIds
) {
    const descendants =
        new Set();

    const queue = [
        ...parentIds
    ];

    while (
        queue.length >
        0
    ) {
        const parentId =
            queue.shift();

        items
            .filter(
                (item) =>
                    item.parentId ===
                    parentId
            )
            .forEach(
                (child) => {
                    if (
                        descendants.has(
                            child.id
                        ) ||
                        parentIds.has(
                            child.id
                        )
                    ) {
                        return;
                    }

                    descendants.add(
                        child.id
                    );

                    queue.push(
                        child.id
                    );
                }
            );
    }

    return descendants;
}

function createPageItemId(
    pageId
) {
    return `page-${pageId}`;
}

function getUniquePageItemId(
    items,
    pageId
) {
    const baseId =
        createPageItemId(
            pageId
        );

    if (
        !items.some(
            (item) =>
                item.id ===
                baseId
        )
    ) {
        return baseId;
    }

    let suffix = 2;

    while (
        items.some(
            (item) =>
                item.id ===
                `${baseId}-${suffix}`
        )
    ) {
        suffix += 1;
    }

    return `${baseId}-${suffix}`;
}

function resolveParentId({
    items,
    requestedParentId,
    ownItemIds,
    descendantIds
}) {
    const parentId =
        normalizeText(
            requestedParentId
        );

    if (!parentId) {
        return null;
    }

    if (
        ownItemIds.has(
            parentId
        ) ||
        descendantIds.has(
            parentId
        )
    ) {
        return null;
    }

    const parentExists =
        items.some(
            (item) =>
                item.id ===
                parentId
        );

    return parentExists
        ? parentId
        : null;
}

function buildPageNavigationItem({
    page,
    currentItem,
    parentId,
    itemId
}) {
    const settings =
        getPageSettings(
            page
        );

    const navigationSettings =
        settings.navigation;

    return {
        ...(
            currentItem ??
            {}
        ),

        id:
            currentItem?.id ??
            itemId,

        label:
            navigationSettings
                .label ||
            normalizeText(
                page.title
            ) ||
            "Unbenannte Seite",

        href:
            getPageHref(
                page
            ),

        enabled:
            page.status ===
            "published",

        target:
            navigationSettings
                .openInNewTab
                ? "_blank"
                : "_self",

        order:
            normalizeOrder(
                navigationSettings
                    .order
            ),

        parentId,

        source:
            "page",

        sourceId:
            page.id,

        removable:
            true,

        highlighted:
            Boolean(
                navigationSettings
                    .highlighted
            )
    };
}

function resolveRemovedParentId(
    parentId,
    removedParentMap
) {
    let resolvedParentId =
        parentId ??
        null;

    const visited =
        new Set();

    while (
        resolvedParentId &&
        removedParentMap.has(
            resolvedParentId
        ) &&
        !visited.has(
            resolvedParentId
        )
    ) {
        visited.add(
            resolvedParentId
        );

        resolvedParentId =
            removedParentMap.get(
                resolvedParentId
            ) ??
            null;
    }

    return resolvedParentId;
}

function removeNavigationItems(
    items,
    itemsToRemove
) {
    if (
        itemsToRemove.length ===
        0
    ) {
        return items;
    }

    const removedIds =
        new Set(
            itemsToRemove.map(
                (item) =>
                    item.id
            )
        );

    const removedParentMap =
        new Map(
            itemsToRemove.map(
                (item) => [
                    item.id,
                    item.parentId ??
                    null
                ]
            )
        );

    return items
        .filter(
            (item) =>
                !removedIds.has(
                    item.id
                )
        )
        .map(
            (item) => {
                if (
                    !removedIds.has(
                        item.parentId
                    )
                ) {
                    return item;
                }

                return {
                    ...item,

                    parentId:
                        resolveRemovedParentId(
                            item.parentId,
                            removedParentMap
                        )
                };
            }
        );
}

function mergePageNavigationItem({
    items,
    pageItems,
    page,
    parentId
}) {
    const primaryItem =
        pageItems[0] ??
        null;

    const primaryItemId =
        primaryItem?.id ??
        getUniquePageItemId(
            items,
            page.id
        );

    const duplicateIds =
        new Set(
            pageItems
                .slice(1)
                .map(
                    (item) =>
                        item.id
                )
        );

    const nextPageItem =
        buildPageNavigationItem({
            page,
            currentItem:
                primaryItem,
            parentId,
            itemId:
                primaryItemId
        });

    let primaryInserted =
        false;

    const nextItems =
        items.flatMap(
            (item) => {
                if (
                    duplicateIds.has(
                        item.id
                    )
                ) {
                    return [];
                }

                if (
                    item.id ===
                    primaryItemId
                ) {
                    primaryInserted =
                        true;

                    return [
                        nextPageItem
                    ];
                }

                if (
                    duplicateIds.has(
                        item.parentId
                    )
                ) {
                    return [
                        {
                            ...item,

                            parentId:
                                primaryItemId
                        }
                    ];
                }

                return [
                    item
                ];
            }
        );

    if (!primaryInserted) {
        nextItems.push(
            nextPageItem
        );
    }

    return {
        items:
            nextItems,

        item:
            nextPageItem
    };
}

export function getNavigationParentOptions(
    navigation,
    pageId
) {
    const normalizedNavigation =
        normalizeNavigation(
            navigation
        );

    const pageItems =
        getPageNavigationItems(
            normalizedNavigation
                .items,
            pageId
        );

    const ownItemIds =
        new Set(
            pageItems.map(
                (item) =>
                    item.id
            )
        );

    const descendantIds =
        getDescendantIds(
            normalizedNavigation
                .items,
            ownItemIds
        );

    return flattenNavigation(
        normalizedNavigation
            .items
    )
        .filter(
            ({
                item
            }) =>
                !ownItemIds.has(
                    item.id
                ) &&
                !descendantIds.has(
                    item.id
                )
        )
        .map(
            ({
                item,
                depth
            }) => ({
                id:
                    item.id,

                label:
                    item.label,

                depth,

                enabled:
                    Boolean(
                        item.enabled
                    ),

                source:
                    item.source ??
                    "custom"
            })
        );
}

export async function loadPageNavigationContext(
    pageId,
    {
        signal
    } = {}
) {
    const loadedNavigation =
        await navigationRepository.get({
            signal
        });

    const navigation =
        normalizeNavigation(
            loadedNavigation
        );

    const pageItems =
        getPageNavigationItems(
            navigation.items,
            pageId
        );

    return {
        navigation:
            cloneValue(
                navigation
            ),

        parentOptions:
            getNavigationParentOptions(
                navigation,
                pageId
            ),

        synchronizedItem:
            pageItems[0] ??
            null,

        duplicateCount:
            Math.max(
                pageItems.length -
                1,
                0
            ),

        mode:
            navigationRepository.mode
    };
}

export async function synchronizePageNavigation(
    page
) {
    if (!page?.id) {
        return {
            changed:
                false,

            navigation:
                null,

            item:
                null
        };
    }

    const loadedNavigation =
        await navigationRepository.get();

    const navigation =
        normalizeNavigation(
            loadedNavigation
        );

    const pageItems =
        getPageNavigationItems(
            navigation.items,
            page.id
        );

    const settings =
        getPageSettings(
            page
        );

    if (
        !settings.navigation
            .includeInNavigation
    ) {
        const nextNavigation = {
            ...navigation,

            items:
                removeNavigationItems(
                    navigation.items,
                    pageItems
                )
        };

        if (
            valuesAreEqual(
                nextNavigation,
                navigation
            )
        ) {
            return {
                changed:
                    false,

                navigation:
                    cloneValue(
                        navigation
                    ),

                item:
                    null
            };
        }

        const savedNavigation =
            await navigationRepository.update(
                nextNavigation
            );

        return {
            changed:
                true,

            navigation:
                savedNavigation,

            item:
                null
        };
    }

    const ownItemIds =
        new Set(
            pageItems.map(
                (item) =>
                    item.id
            )
        );

    const descendantIds =
        getDescendantIds(
            navigation.items,
            ownItemIds
        );

    const parentId =
        resolveParentId({
            items:
                navigation.items,

            requestedParentId:
                settings.navigation
                    .parentId,

            ownItemIds,

            descendantIds
        });

    const mergedNavigation =
        mergePageNavigationItem({
            items:
                navigation.items,

            pageItems,

            page,

            parentId
        });

    const nextNavigation = {
        ...navigation,

        items:
            mergedNavigation
                .items
    };

    if (
        valuesAreEqual(
            nextNavigation,
            navigation
        )
    ) {
        return {
            changed:
                false,

            navigation:
                cloneValue(
                    navigation
                ),

            item:
                cloneValue(
                    mergedNavigation
                        .item
                )
        };
    }

    const savedNavigation =
        await navigationRepository.update(
            nextNavigation
        );

    const synchronizedItem =
        getPageNavigationItems(
            savedNavigation?.items ??
            [],
            page.id
        )[0] ??
        mergedNavigation.item;

    return {
        changed:
            true,

        navigation:
            savedNavigation,

        item:
            synchronizedItem
    };
}

export async function removePageNavigation(
    pageId
) {
    const normalizedPageId =
        normalizeText(
            pageId
        );

    if (!normalizedPageId) {
        return {
            changed:
                false,

            navigation:
                null
        };
    }

    const loadedNavigation =
        await navigationRepository.get();

    const navigation =
        normalizeNavigation(
            loadedNavigation
        );

    const pageItems =
        getPageNavigationItems(
            navigation.items,
            normalizedPageId
        );

    if (
        pageItems.length ===
        0
    ) {
        return {
            changed:
                false,

            navigation:
                cloneValue(
                    navigation
                )
        };
    }

    const nextNavigation = {
        ...navigation,

        items:
            removeNavigationItems(
                navigation.items,
                pageItems
            )
    };

    const savedNavigation =
        await navigationRepository.update(
            nextNavigation
        );

    return {
        changed:
            true,

        navigation:
            savedNavigation
    };
}