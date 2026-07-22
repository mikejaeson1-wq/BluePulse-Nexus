const DEFAULT_CTA = {
    id:
        "spenden",

    label:
        "Spenden",

    href:
        "/#spenden",

    enabled:
        true,

    target:
        "_self"
};

function createNavigationError(
    message
) {
    const error =
        new Error(
            message
        );

    error.statusCode =
        500;

    return error;
}

function isPlainObject(
    value
) {
    return Boolean(
        value &&
        typeof value ===
            "object" &&
        !Array.isArray(
            value
        )
    );
}

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
    value,
    fallback = ""
) {
    const normalized =
        String(
            value ??
            ""
        ).trim();

    return normalized ||
        fallback;
}

function normalizeTarget(
    openInNewTab
) {
    return openInNewTab
        ? "_blank"
        : "_self";
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
        isPlainObject(
            value
        )
            ? value
            : {};

    return {
        ...source,

        items:
            Array.isArray(
                source.items
            )
                ? source.items
                    .filter(
                        isPlainObject
                    )
                    .map(
                        cloneValue
                    )
                : [],

        cta:
            isPlainObject(
                source.cta
            )
                ? {
                    ...DEFAULT_CTA,
                    ...cloneValue(
                        source.cta
                    )
                }
                : {
                    ...DEFAULT_CTA
                }
    };
}

function normalizePage(
    page
) {
    if (
        !page ||
        typeof page !==
            "object"
    ) {
        return null;
    }

    return {
        id:
            normalizeText(
                page.id
            ),

        title:
            normalizeText(
                page.title,
                "Unbenannte Seite"
            ),

        slug:
            normalizeText(
                page.slug
            ).replace(
                /^\/+/,
                ""
            ),

        status:
            normalizeText(
                page.status,
                "draft"
            ),

        theme:
            isPlainObject(
                page.theme
            )
                ? page.theme
                : {},

        deletedAt:
            page.deletedAt ??
            page.deleted_at ??
            null
    };
}

function getNavigationSettings(
    page
) {
    const pageSettings =
        isPlainObject(
            page.theme
                ?.pageSettings
        )
            ? page.theme
                .pageSettings
            : {};

    const navigation =
        isPlainObject(
            pageSettings
                .navigation
        )
            ? pageSettings
                .navigation
            : {};

    return {
        includeInNavigation:
            Boolean(
                navigation
                    .includeInNavigation
            ),

        label:
            normalizeText(
                navigation.label,
                page.title
            ),

        parentId:
            normalizeText(
                navigation.parentId
            ) ||
            null,

        order:
            normalizeOrder(
                navigation.order
            ),

        highlighted:
            Boolean(
                navigation.highlighted
            ),

        openInNewTab:
            Boolean(
                navigation.openInNewTab
            )
    };
}

function isPageNavigationItem(
    item,
    pageId
) {
    return (
        item?.source ===
            "page" &&
        String(
            item?.sourceId ??
            ""
        ) ===
            pageId
    );
}

function isPageCta(
    cta,
    pageId
) {
    return (
        cta?.source ===
            "page" &&
        String(
            cta?.sourceId ??
            ""
        ) ===
            pageId
    );
}

function createPageHref(
    page
) {
    return page.slug
        ? `/${page.slug}`
        : "/";
}

function createPageItemId(
    pageId
) {
    return `page-${pageId}`;
}

function getLinkedPageItems(
    navigation,
    pageId
) {
    return navigation.items
        .filter(
            (item) =>
                isPageNavigationItem(
                    item,
                    pageId
                )
        );
}

function removeLinkedPageItems(
    navigation,
    pageId
) {
    const linkedItems =
        getLinkedPageItems(
            navigation,
            pageId
        );

    if (
        linkedItems.length ===
        0
    ) {
        return navigation;
    }

    const linkedIds =
        new Set(
            linkedItems.map(
                (item) =>
                    item.id
            )
        );

    const remainingItems =
        navigation.items.filter(
            (item) =>
                !linkedIds.has(
                    item.id
                )
        );

    const remainingIds =
        new Set(
            remainingItems.map(
                (item) =>
                    item.id
            )
        );

    const requestedFallbackParentId =
        linkedItems.find(
            (item) =>
                item.parentId
        )?.parentId ??
        null;

    const fallbackParentId =
        requestedFallbackParentId &&
        remainingIds.has(
            requestedFallbackParentId
        )
            ? requestedFallbackParentId
            : null;

    return {
        ...navigation,

        items:
            remainingItems.map(
                (item) =>
                    linkedIds.has(
                        item.parentId
                    )
                        ? {
                            ...item,

                            parentId:
                                fallbackParentId
                        }
                        : item
            )
    };
}

function restoreBackedUpCta(
    navigation
) {
    const backup =
        isPlainObject(
            navigation
                .pageSettingsCtaBackup
        )
            ? cloneValue(
                navigation
                    .pageSettingsCtaBackup
            )
            : {
                ...DEFAULT_CTA
            };

    const nextNavigation = {
        ...navigation,

        cta:
            backup
    };

    delete nextNavigation
        .pageSettingsCtaBackup;

    return nextNavigation;
}

function removePageCta(
    navigation,
    pageId
) {
    if (
        !isPageCta(
            navigation.cta,
            pageId
        )
    ) {
        return navigation;
    }

    return restoreBackedUpCta(
        navigation
    );
}

function removePageFromNavigation(
    navigation,
    pageId
) {
    const withoutItems =
        removeLinkedPageItems(
            navigation,
            pageId
        );

    return removePageCta(
        withoutItems,
        pageId
    );
}

function createPageNavigationItem(
    page,
    settings,
    itemId,
    parentId
) {
    return {
        id:
            itemId,

        label:
            settings.label,

        href:
            createPageHref(
                page
            ),

        enabled:
            true,

        target:
            normalizeTarget(
                settings
                    .openInNewTab
            ),

        order:
            settings.order,

        parentId:
            parentId,

        source:
            "page",

        sourceId:
            page.id,

        removable:
            true
    };
}

function upsertPageNavigationItem(
    navigation,
    page,
    settings
) {
    const linkedItems =
        getLinkedPageItems(
            navigation,
            page.id
        );

    const primaryItem =
        linkedItems[0] ??
        null;

    const itemId =
        primaryItem?.id ??
        createPageItemId(
            page.id
        );

    const duplicateIds =
        new Set(
            linkedItems
                .slice(1)
                .map(
                    (item) =>
                        item.id
                )
        );

    let items =
        navigation.items
            .filter(
                (item) =>
                    !isPageNavigationItem(
                        item,
                        page.id
                    ) ||
                    item.id ===
                        itemId
            )
            .map(
                (item) =>
                    duplicateIds.has(
                        item.parentId
                    )
                        ? {
                            ...item,

                            parentId:
                                itemId
                        }
                        : item
            );

    const allowedParentIds =
        new Set(
            items
                .filter(
                    (item) =>
                        item.id !==
                        itemId
                )
                .map(
                    (item) =>
                        item.id
                )
        );

    const parentId =
        settings.parentId &&
        allowedParentIds.has(
            settings.parentId
        )
            ? settings.parentId
            : null;

    const nextItem =
        createPageNavigationItem(
            page,
            settings,
            itemId,
            parentId
        );

    const existingIndex =
        items.findIndex(
            (item) =>
                item.id ===
                itemId
        );

    if (
        existingIndex ===
        -1
    ) {
        items = [
            ...items,
            nextItem
        ];
    } else {
        items =
            items.map(
                (item) =>
                    item.id ===
                    itemId
                        ? nextItem
                        : item
            );
    }

    return {
        ...navigation,

        items
    };
}

function promotePageToCta(
    navigation,
    page,
    settings
) {
    let nextNavigation =
        removeLinkedPageItems(
            navigation,
            page.id
        );

    if (
        !isPlainObject(
            nextNavigation
                .pageSettingsCtaBackup
        )
    ) {
        nextNavigation = {
            ...nextNavigation,

            pageSettingsCtaBackup:
                nextNavigation.cta
                    ?.source ===
                    "page"
                    ? {
                        ...DEFAULT_CTA
                    }
                    : cloneValue(
                        nextNavigation.cta
                    )
        };
    }

    return {
        ...nextNavigation,

        cta: {
            id:
                `page-cta-${page.id}`,

            label:
                settings.label,

            href:
                createPageHref(
                    page
                ),

            enabled:
                true,

            target:
                normalizeTarget(
                    settings
                        .openInNewTab
                ),

            source:
                "page",

            sourceId:
                page.id
        }
    };
}

function synchronizeNavigationData(
    navigation,
    page,
    {
        forceRemove = false
    } = {}
) {
    if (
        forceRemove ||
        !page
    ) {
        return removePageFromNavigation(
            navigation,
            page?.id ??
            ""
        );
    }

    const settings =
        getNavigationSettings(
            page
        );

    const shouldAppear =
        page.status ===
            "published" &&
        !page.deletedAt &&
        settings
            .includeInNavigation;

    if (!shouldAppear) {
        return removePageFromNavigation(
            navigation,
            page.id
        );
    }

    if (
        settings.highlighted
    ) {
        return promotePageToCta(
            navigation,
            page,
            settings
        );
    }

    const withoutPageCta =
        removePageCta(
            navigation,
            page.id
        );

    return upsertPageNavigationItem(
        withoutPageCta,
        page,
        settings
    );
}

function assertDatabasePool(
    database
) {
    if (
        !database ||
        typeof database.connect !==
            "function"
    ) {
        throw createNavigationError(
            "Es wurde kein gültiger PostgreSQL-Pool für die Navigationssynchronisierung bereitgestellt."
        );
    }
}

async function readPage(
    database,
    pageId
) {
    const result =
        await database.query(
            `
                SELECT
                    id,
                    title,
                    slug,
                    status,
                    theme,
                    deleted_at
                FROM pages
                WHERE id = $1
                LIMIT 1
            `,
            [
                pageId
            ]
        );

    return normalizePage(
        result.rows?.[0]
    );
}

async function readNavigation(
    database
) {
    const result =
        await database.query(
            `
                SELECT
                    data
                FROM site_navigation
                WHERE id = 1
                FOR UPDATE
            `
        );

    return normalizeNavigation(
        result.rows?.[0]
            ?.data
    );
}

async function saveNavigation(
    database,
    navigation
) {
    await database.query(
        `
            INSERT INTO site_navigation (
                id,
                data
            )
            VALUES (
                1,
                $1::JSONB
            )
            ON CONFLICT (
                id
            )
            DO UPDATE SET
                data = EXCLUDED.data
        `,
        [
            navigation
        ]
    );
}

async function withTransaction(
    database,
    callback
) {
    assertDatabasePool(
        database
    );

    const client =
        await database.connect();

    try {
        await client.query(
            "BEGIN"
        );

        const result =
            await callback(
                client
            );

        await client.query(
            "COMMIT"
        );

        return result;
    } catch (error) {
        try {
            await client.query(
                "ROLLBACK"
            );
        } catch (
            rollbackError
        ) {
            console.error(
                "Die Navigationstransaktion konnte nicht zurückgerollt werden.",
                rollbackError
            );
        }

        throw error;
    } finally {
        client.release();
    }
}

export async function synchronizePageNavigation(
    database,
    {
        pageId,
        page = null,
        forceRemove = false
    }
) {
    const normalizedPageId =
        normalizeText(
            pageId ??
            page?.id
        );

    if (!normalizedPageId) {
        return null;
    }

    return withTransaction(
        database,
        async (
            client
        ) => {
            const currentNavigation =
                await readNavigation(
                    client
                );

            const resolvedPage =
                forceRemove
                    ? {
                        id:
                            normalizedPageId
                    }
                    : normalizePage(
                        page
                    ) ??
                    await readPage(
                        client,
                        normalizedPageId
                    );

            const nextNavigation =
                synchronizeNavigationData(
                    currentNavigation,
                    resolvedPage,
                    {
                        forceRemove
                    }
                );

            if (
                JSON.stringify(
                    nextNavigation
                ) !==
                JSON.stringify(
                    currentNavigation
                )
            ) {
                await saveNavigation(
                    client,
                    nextNavigation
                );
            }

            return nextNavigation;
        }
    );
}

export async function removePageNavigation(
    database,
    pageId
) {
    return synchronizePageNavigation(
        database,
        {
            pageId,
            forceRemove:
                true
        }
    );
}