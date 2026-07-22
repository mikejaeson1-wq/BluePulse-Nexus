import {
    getSiteNavigationRepository
} from "@shared/data/repositories";

import {
    getPageSettings,
    hasExplicitPageNavigationSettings,
    setPageSettings
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
    value,
    fallback = 100
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
        return fallback;
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
    const navigation =
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
        ...navigation,

        items:
            Array.isArray(
                navigation.items
            )
                ? navigation.items
                : [],

        cta: {
            ...EMPTY_NAVIGATION
                .cta,

            ...(
                navigation.cta ??
                {}
            )
        }
    };
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

function getLinkedPageItems(
    items,
    pageId
) {
    const normalizedPageId =
        normalizeText(
            pageId
        );

    return items
        .filter(
            (item) =>
                item.source ===
                    "page" &&
                normalizeText(
                    item.sourceId
                ) ===
                    normalizedPageId
        )
        .sort(
            (
                firstItem,
                secondItem
            ) => {
                const orderDifference =
                    normalizeOrder(
                        firstItem.order
                    ) -
                    normalizeOrder(
                        secondItem.order
                    );

                if (
                    orderDifference !==
                    0
                ) {
                    return orderDifference;
                }

                return normalizeText(
                    firstItem.id
                ).localeCompare(
                    normalizeText(
                        secondItem.id
                    ),
                    "de"
                );
            }
        );
}

function collectDescendantIds(
    items,
    startingIds
) {
    const descendants =
        new Set();

    const queue = [
        ...startingIds
    ];

    while (
        queue.length >
        0
    ) {
        const currentParentId =
            queue.shift();

        items
            .filter(
                (item) =>
                    item.parentId ===
                    currentParentId
            )
            .forEach(
                (item) => {
                    if (
                        descendants.has(
                            item.id
                        ) ||
                        startingIds.has(
                            item.id
                        )
                    ) {
                        return;
                    }

                    descendants.add(
                        item.id
                    );

                    queue.push(
                        item.id
                    );
                }
            );
    }

    return descendants;
}

function getSortedChildren(
    items,
    parentId
) {
    return items
        .filter(
            (item) =>
                (