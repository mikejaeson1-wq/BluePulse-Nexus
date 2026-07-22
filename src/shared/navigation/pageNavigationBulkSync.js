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

function normalizePages(
    pages
) {
    if (!Array.isArray(pages)) {
        return [];
    }

    const seenIds =
        new Set();

    return pages.filter(
        (page) => {
            const pageId =
                normalizeText(
                    page?.id
                );

            if (
                !pageId ||
                seenIds.has(
                    pageId
                )
            ) {
                return false;
            }

            seenIds.add(
                pageId
            );

            return true;
        }
    );
}

function serializeValue(
    value
) {
    return JSON.stringify(
        value
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

function isAutomaticPageItem(
    item
) {
    return (
        item?.source ===
            "page" &&
        Boolean(
            normalizeText(
                item?.sourceId
            )
        )
    );
}

function groupAutomaticItems(
    items
) {
    const groups =
        new Map();

    items.forEach(
        (
            item,
            index
        ) => {
            if (
                !isAutomaticPageItem(
                    item
                )
            ) {
                return;
            }

            const pageId =
                normalizeText(
                    item.sourceId
                );

            if (
                !groups.has(
                    pageId
                )
            ) {
                groups.set(
                    pageId,
                    []
                );
            }

            groups
                .get(
                    pageId
                )
                .push({
                    item,
                    index
                });
        }
    );

    groups.forEach(
        (groupItems) => {
            groupItems.sort(
                (
                    firstEntry,
                    secondEntry
                ) =>
                    firstEntry.index -
                    secondEntry.index
            );
        }
    );

    return groups;
}

function createPageItemId(
    pageId
) {
    return `page-${pageId}`;
}

function createUniqueItemId(
    items,
    pageId
) {
    const baseId =
        createPageItemId(
            pageId
        );

    const usedIds =
        new Set(
            items.map(
                (item) =>
                    item.id
            )
        );

    if (
        !usedIds.has(
            baseId
        )
    ) {
        return baseId;
    }

    let suffix =
        2;

    while (
        usedIds.has(
            `${baseId}-${suffix}`
        )
    ) {
        suffix +=
            1;
    }

    return `${baseId}-${suffix}`;
}

function resolveReplacementId(
    value,
    replacementMap
) {
    let resolvedValue =
        value ??
        null;

    const visited =
        new Set();

    while (
        resolvedValue &&
        replacementMap.has(
            resolvedValue
        ) &&
        !visited.has(
            resolvedValue
        )
    ) {
        visited.add(
            resolvedValue
        );

        resolvedValue =
            replacementMap.get(
                resolvedValue
            ) ??
            null;
    }

    return resolvedValue;
}

function removeMarkedItems(
    items,
    removalIds,
    replacementMap
) {
    return items
        .filter(
            (item) =>
                !removalIds.has(
                    item.id
                )
        )
        .map(
            (item) => ({
                ...item,

                parentId:
                    resolveReplacementId(
                        item.parentId,
                        replacementMap
                    )
            })
        );
}

function relevantItemValues(
    item
) {
    return {
        label:
            item?.label ??
            "",

        href:
            item?.href ??
            "",

        enabled:
            Boolean(
                item?.enabled
            ),

        target:
            item?.target ===
                "_blank"
                ? "_blank"
                : "_self",

        order:
            Number(
                item?.order
            ) ||
            0,

        parentId:
            item?.parentId ??
            null,

        source:
            item?.source ??
            "custom",

        sourceId:
            item?.sourceId ??
            null,

        removable:
            item?.removable !==
            false,

        highlighted:
            Boolean(
                item?.highlighted
            )
    };
}

function itemsAreEqual(
    firstItem,
    secondItem
) {
    return serializeValue(
        relevantItemValues(
            firstItem
        )
    ) ===
        serializeValue(
            relevantItemValues(
                secondItem
            )
        );
}

function buildDesiredItem({
    page,
    settings,
    currentItem,
    itemId,
    parentId
}) {
    return {
        ...(
            currentItem ??
            {}
        ),

        id:
            currentItem?.id ??
            itemId,

        label:
            settings.navigation
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
            settings.navigation
                .openInNewTab
                ? "_blank"
                : "_self",

        order:
            normalizeOrder(
                settings.navigation
                    .order
            ),

        parentId:
            parentId ??
            null,

        source:
            "page",

        sourceId:
            page.id,

        removable:
            true,

        highlighted:
            Boolean(
                settings.navigation
                    .highlighted
            )
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
        new Set([
            item.id
        ]);

    let currentParentId =
        item.parentId;

    while (
        currentParentId
    ) {
        if (
            visited.has(
                currentParentId
            )
        ) {
            return true;
        }

        visited.add(
            currentParentId
        );

        const parentItem =
            itemMap.get(
                currentParentId
            );

        if (!parentItem) {
            return false;
        }

        currentParentId =
            parentItem.parentId;
    }

    return false;
}

function sanitizeHierarchy(
    items
) {
    const itemIds =
        new Set(
            items.map(
                (item) =>
                    item.id
            )
        );

    let sanitizedItems =
        items.map(
            (item) => {
                if (
                    !item.parentId ||
                    !itemIds.has(
                        item.parentId
                    ) ||
                    item.parentId ===
                        item.id
                ) {
                    return {
                        ...item,

                        parentId:
                            null
                    };
                }

                return item;
            }
        );

    const itemMap =
        new Map(
            sanitizedItems.map(
                (item) => [
                    item.id,
                    item
                ]
            )
        );

    sanitizedItems =
        sanitizedItems.map(
            (item) => {
                if (
                    wouldCreateCycle(
                        item,
                        itemMap
                    )
                ) {
                    return {
                        ...item,

                        parentId:
                            null
                    };
                }

                return item;
            }
        );

    return sanitizedItems;
}

function getActionLabel(
    action
) {
    const labels = {
        current:
            "Aktuell",

        create:
            "Menüpunkt anlegen",

        update:
            "Menüpunkt aktualisieren",

        deduplicate:
            "Duplikate bereinigen",

        remove:
            "Menüpunkt entfernen",

        excluded:
            "Nicht vorgesehen"
    };

    return labels[action] ??
        action;
}

function createSummary({
    pageReports,
    orphanReports,
    duplicateCount
}) {
    const includedPages =
        pageReports.filter(
            (report) =>
                report.includeInNavigation
        ).length;

    const currentPages =
        pageReports.filter(
            (report) =>
                report.action ===
                "current"
        ).length;

    const excludedPages =
        pageReports.filter(
            (report) =>
                report.action ===
                "excluded"
        ).length;

    const pendingPages =
        pageReports.filter(
            (report) =>
                ![
                    "current",
                    "excluded"
                ].includes(
                    report.action
                )
        ).length;

    const staleItems =
        pageReports
            .filter(
                (report) =>
                    report.action ===
                    "remove"
            )
            .reduce(
                (
                    total,
                    report
                ) =>
                    total +
                    report.existingItemCount,
                0
            );

    const orphanItems =
        orphanReports.reduce(
            (
                total,
                report
            ) =>
                total +
                report.itemCount,
            0
        );

    return {
        totalPages:
            pageReports.length,

        includedPages,

        currentPages,

        pendingPages,

        excludedPages,

        staleItems,

        duplicateItems:
            duplicateCount,

        orphanItems,

        totalProblems:
            pendingPages +
            orphanItems
    };
}

function buildSynchronizationPlan(
    pages,
    navigation
) {
    const normalizedPages =
        normalizePages(
            pages
        );

    const normalizedNavigation =
        normalizeNavigation(
            navigation
        );

    const pageMap =
        new Map(
            normalizedPages.map(
                (page) => [
                    page.id,
                    page
                ]
            )
        );

    const automaticGroups =
        groupAutomaticItems(
            normalizedNavigation
                .items
        );

    const removalIds =
        new Set();

    const replacementMap =
        new Map();

    const primaryItems =
        new Map();

    const orphanReports = [];

    let duplicateCount =
        0;

    automaticGroups.forEach(
        (
            groupEntries,
            pageId
        ) => {
            const page =
                pageMap.get(
                    pageId
                );

            const groupItems =
                groupEntries.map(
                    (entry) =>
                        entry.item
                );

            if (!page) {
                groupItems.forEach(
                    (item) => {
                        removalIds.add(
                            item.id
                        );

                        replacementMap.set(
                            item.id,
                            item.parentId ??
                            null
                        );
                    }
                );

                orphanReports.push({
                    pageId,

                    label:
                        groupItems[0]
                            ?.label ??
                        "Unbekannte Seite",

                    href:
                        groupItems[0]
                            ?.href ??
                        "",

                    itemCount:
                        groupItems.length
                });

                return;
            }

            const settings =
                getPageSettings(
                    page
                );

            if (
                !settings.navigation
                    .includeInNavigation
            ) {
                groupItems.forEach(
                    (item) => {
                        removalIds.add(
                            item.id
                        );

                        replacementMap.set(
                            item.id,
                            item.parentId ??
                            null
                        );
                    }
                );

                return;
            }

            const primaryItem =
                groupItems[0];

            primaryItems.set(
                pageId,
                primaryItem
            );

            groupItems
                .slice(1)
                .forEach(
                    (duplicateItem) => {
                        duplicateCount +=
                            1;

                        removalIds.add(
                            duplicateItem.id
                        );

                        replacementMap.set(
                            duplicateItem.id,
                            primaryItem.id
                        );
                    }
                );
        }
    );

    let nextItems =
        removeMarkedItems(
            normalizedNavigation
                .items,
            removalIds,
            replacementMap
        );

    const pageReports = [];

    normalizedPages.forEach(
        (page) => {
            const settings =
                getPageSettings(
                    page
                );

            const groupEntries =
                automaticGroups.get(
                    page.id
                ) ??
                [];

            const existingItemCount =
                groupEntries.length;

            if (
                !settings.navigation
                    .includeInNavigation
            ) {
                const action =
                    existingItemCount >
                    0
                        ? "remove"
                        : "excluded";

                pageReports.push({
                    pageId:
                        page.id,

                    title:
                        page.title,

                    slug:
                        page.slug,

                    pageStatus:
                        page.status,

                    includeInNavigation:
                        false,

                    highlighted:
                        false,

                    action,

                    actionLabel:
                        getActionLabel(
                            action
                        ),

                    existingItemCount,

                    duplicateCount:
                        Math.max(
                            existingItemCount -
                            1,
                            0
                        ),

                    itemId:
                        null,

                    label:
                        settings.navigation
                            .label ||
                        page.title,

                    href:
                        getPageHref(
                            page
                        ),

                    parentId:
                        null
                });

                return;
            }

            const currentItem =
                primaryItems.get(
                    page.id
                ) ??
                null;

            const itemId =
                currentItem?.id ??
                createUniqueItemId(
                    nextItems,
                    page.id
                );

            const requestedParentId =
                resolveReplacementId(
                    settings.navigation
                        .parentId,
                    replacementMap
                );

            const parentExists =
                requestedParentId &&
                nextItems.some(
                    (item) =>
                        item.id ===
                        requestedParentId
                );

            const parentId =
                parentExists &&
                requestedParentId !==
                    itemId
                    ? requestedParentId
                    : null;

            const desiredItem =
                buildDesiredItem({
                    page,
                    settings,
                    currentItem,
                    itemId,
                    parentId
                });

            const existingIndex =
                nextItems.findIndex(
                    (item) =>
                        item.id ===
                        itemId
                );

            let action =
                "current";

            if (!currentItem) {
                action =
                    "create";

                nextItems.push(
                    desiredItem
                );
            } else {
                if (
                    existingItemCount >
                    1
                ) {
                    action =
                        "deduplicate";
                } else if (
                    !itemsAreEqual(
                        currentItem,
                        desiredItem
                    )
                ) {
                    action =
                        "update";
                }

                if (
                    existingIndex !==
                    -1
                ) {
                    nextItems[
                        existingIndex
                    ] =
                        desiredItem;
                } else {
                    nextItems.push(
                        desiredItem
                    );
                }
            }

            pageReports.push({
                pageId:
                    page.id,

                title:
                    page.title,

                slug:
                    page.slug,

                pageStatus:
                    page.status,

                includeInNavigation:
                    true,

                highlighted:
                    Boolean(
                        settings.navigation
                            .highlighted
                    ),

                action,

                actionLabel:
                    getActionLabel(
                        action
                    ),

                existingItemCount,

                duplicateCount:
                    Math.max(
                        existingItemCount -
                        1,
                        0
                    ),

                itemId,

                label:
                    desiredItem.label,

                href:
                    desiredItem.href,

                parentId:
                    desiredItem.parentId
            });
        }
    );

    nextItems =
        sanitizeHierarchy(
            nextItems
        );

    const nextNavigation = {
        ...normalizedNavigation,

        items:
            nextItems
    };

    const summary =
        createSummary({
            pageReports,
            orphanReports,
            duplicateCount
        });

    return {
        changed:
            serializeValue(
                nextNavigation
            ) !==
            serializeValue(
                normalizedNavigation
            ),

        navigation:
            cloneValue(
                normalizedNavigation
            ),

        nextNavigation:
            cloneValue(
                nextNavigation
            ),

        pageReports,
        orphanReports,
        summary,

        mode:
            navigationRepository.mode
    };
}

export async function loadPageNavigationSyncReport(
    pages,
    {
        signal
    } = {}
) {
    const navigation =
        await navigationRepository.get({
            signal
        });

    const plan =
        buildSynchronizationPlan(
            pages,
            navigation
        );

    return {
        changed:
            plan.changed,

        pageReports:
            cloneValue(
                plan.pageReports
            ),

        orphanReports:
            cloneValue(
                plan.orphanReports
            ),

        summary:
            cloneValue(
                plan.summary
            ),

        mode:
            plan.mode
    };
}

export async function synchronizeAllPageNavigation(
    pages
) {
    const navigation =
        await navigationRepository.get();

    const plan =
        buildSynchronizationPlan(
            pages,
            navigation
        );

    if (!plan.changed) {
        return {
            changed:
                false,

            performed:
                cloneValue(
                    plan.summary
                ),

            report: {
                changed:
                    false,

                pageReports:
                    cloneValue(
                        plan.pageReports
                    ),

                orphanReports:
                    cloneValue(
                        plan.orphanReports
                    ),

                summary:
                    cloneValue(
                        plan.summary
                    ),

                mode:
                    plan.mode
            }
        };
    }

    const savedNavigation =
        await navigationRepository.update(
            plan.nextNavigation
        );

    const finalPlan =
        buildSynchronizationPlan(
            pages,
            savedNavigation
        );

    return {
        changed:
            true,

        performed:
            cloneValue(
                plan.summary
            ),

        report: {
            changed:
                finalPlan.changed,

            pageReports:
                cloneValue(
                    finalPlan.pageReports
                ),

            orphanReports:
                cloneValue(
                    finalPlan.orphanReports
                ),

            summary:
                cloneValue(
                    finalPlan.summary
                ),

            mode:
                finalPlan.mode
        }
    };
}