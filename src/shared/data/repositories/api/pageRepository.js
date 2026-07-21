import {
    apiDelete,
    apiGet,
    apiPost,
    apiPut
} from "@shared/data/api/apiClient";

const CACHE_KEY =
    "bluepulse.api.pages.cache.v1";

function cloneValue(value) {
    if (
        typeof globalThis.structuredClone ===
        "function"
    ) {
        return globalThis.structuredClone(
            value
        );
    }

    return JSON.parse(
        JSON.stringify(value)
    );
}

function isPlainObject(value) {
    return Boolean(
        value &&
        typeof value ===
            "object" &&
        !Array.isArray(value)
    );
}

function normalizePage(page) {
    if (
        !page ||
        typeof page !==
            "object" ||
        Array.isArray(page)
    ) {
        return null;
    }

    const status =
        page.status ===
            "published"
            ? "published"
            : "draft";

    return {
        ...page,

        status,

        published:
            status ===
            "published",

        blocks:
            Array.isArray(
                page.blocks
            )
                ? page.blocks
                : [],

        theme:
            isPlainObject(
                page.theme
            )
                ? page.theme
                : {}
    };
}

function normalizePages(pages) {
    if (!Array.isArray(pages)) {
        return [];
    }

    return pages
        .map(
            normalizePage
        )
        .filter(Boolean);
}

function readStoredCache() {
    if (
        typeof globalThis.localStorage ===
        "undefined"
    ) {
        return [];
    }

    try {
        const storedValue =
            globalThis.localStorage.getItem(
                CACHE_KEY
            );

        if (!storedValue) {
            return [];
        }

        return normalizePages(
            JSON.parse(
                storedValue
            )
        );
    } catch {
        return [];
    }
}

let pageCache =
    readStoredCache();

function persistCache() {
    if (
        typeof globalThis.localStorage ===
        "undefined"
    ) {
        return;
    }

    globalThis.localStorage.setItem(
        CACHE_KEY,
        JSON.stringify(
            pageCache
        )
    );
}

function replaceCache(pages) {
    pageCache =
        normalizePages(
            pages
        );

    persistCache();

    return cloneValue(
        pageCache
    );
}

function upsertCachedPage(page) {
    const normalizedPage =
        normalizePage(
            page
        );

    if (!normalizedPage?.id) {
        return normalizedPage;
    }

    const existingIndex =
        pageCache.findIndex(
            (cachedPage) =>
                cachedPage.id ===
                normalizedPage.id
        );

    if (existingIndex === -1) {
        pageCache = [
            normalizedPage,
            ...pageCache
        ];
    } else {
        pageCache =
            pageCache.map(
                (cachedPage) =>
                    cachedPage.id ===
                    normalizedPage.id
                        ? normalizedPage
                        : cachedPage
            );
    }

    persistCache();

    return cloneValue(
        normalizedPage
    );
}

function removeCachedPage(pageId) {
    pageCache =
        pageCache.filter(
            (page) =>
                page.id !==
                pageId
        );

    persistCache();
}

function encodeValue(value) {
    return encodeURIComponent(
        String(value ?? "")
    );
}

function generatePageSlug(value) {
    const slug =
        String(value ?? "")
            .toLowerCase()
            .trim()
            .replace(/ä/g, "ae")
            .replace(/ö/g, "oe")
            .replace(/ü/g, "ue")
            .replace(/ß/g, "ss")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

    return slug ||
        "neue-seite";
}

export const apiPageRepository = {
    mode: "api",

    getSnapshot() {
        return cloneValue(
            pageCache
        );
    },

    getByIdSnapshot(pageId) {
        const page =
            pageCache.find(
                (cachedPage) =>
                    cachedPage.id ===
                    pageId
            );

        return page
            ? cloneValue(page)
            : null;
    },

    getBySlugSnapshot(slug) {
        const normalizedSlug =
            generatePageSlug(
                slug
            );

        const page =
            pageCache.find(
                (cachedPage) =>
                    cachedPage.slug ===
                    normalizedSlug
            );

        return page
            ? cloneValue(page)
            : null;
    },

    getPublishedBySlugSnapshot(
        slug
    ) {
        const normalizedSlug =
            generatePageSlug(
                slug
            );

        const page =
            pageCache.find(
                (cachedPage) =>
                    cachedPage.slug ===
                        normalizedSlug &&
                    cachedPage.status ===
                        "published"
            );

        return page
            ? cloneValue(page)
            : null;
    },

    async getAll({
        signal
    } = {}) {
        const pages =
            await apiGet(
                "/admin/pages",
                {
                    signal
                }
            );

        return replaceCache(
            pages
        );
    },

    async getById(
        pageId,
        {
            signal
        } = {}
    ) {
        const page =
            await apiGet(
                `/admin/pages/${encodeValue(
                    pageId
                )}`,
                {
                    signal
                }
            );

        return upsertCachedPage(
            page
        );
    },

    async getBySlug(
        slug,
        {
            signal
        } = {}
    ) {
        const page =
            await apiGet(
                `/admin/pages/by-slug/${encodeValue(
                    slug
                )}`,
                {
                    signal
                }
            );

        return upsertCachedPage(
            page
        );
    },

    async getPublishedBySlug(
        slug,
        {
            signal
        } = {}
    ) {
        const page =
            await apiGet(
                `/public/pages/${encodeValue(
                    slug
                )}`,
                {
                    signal
                }
            );

        return upsertCachedPage(
            page
        );
    },

    async create(data) {
        const page =
            await apiPost(
                "/admin/pages",
                data
            );

        return upsertCachedPage(
            page
        );
    },

    async update(
        pageId,
        data
    ) {
        const page =
            await apiPut(
                `/admin/pages/${encodeValue(
                    pageId
                )}`,
                data
            );

        return upsertCachedPage(
            page
        );
    },

    async save(
        pageOrId,
        data
    ) {
        if (
            typeof pageOrId ===
            "string"
        ) {
            return this.update(
                pageOrId,
                data ?? {}
            );
        }

        const page =
            pageOrId ?? {};

        if (page.id) {
            return this.update(
                page.id,
                page
            );
        }

        return this.create(
            page
        );
    },

    async remove(pageId) {
        await apiDelete(
            `/admin/pages/${encodeValue(
                pageId
            )}`
        );

        removeCachedPage(
            pageId
        );

        return true;
    },

    async publish(
        pageId,
        data = {}
    ) {
        const page =
            await apiPost(
                `/admin/pages/${encodeValue(
                    pageId
                )}/publish`,
                data
            );

        return upsertCachedPage(
            page
        );
    },

    async unpublish(
        pageId,
        data = {}
    ) {
        const page =
            await apiPost(
                `/admin/pages/${encodeValue(
                    pageId
                )}/unpublish`,
                data
            );

        return upsertCachedPage(
            page
        );
    },

    async duplicate(pageId) {
        const page =
            await apiPost(
                `/admin/pages/${encodeValue(
                    pageId
                )}/duplicate`
            );

        return upsertCachedPage(
            page
        );
    },

    async getVersions(
        pageId,
        {
            signal
        } = {}
    ) {
        return apiGet(
            `/admin/pages/${encodeValue(
                pageId
            )}/versions`,
            {
                signal
            }
        );
    },

    async restoreVersion(
        pageId,
        versionNumber
    ) {
        const page =
            await apiPost(
                `/admin/pages/${encodeValue(
                    pageId
                )}/versions/${encodeValue(
                    versionNumber
                )}/restore`
            );

        return upsertCachedPage(
            page
        );
    },

    async isSlugAvailable(
        slug,
        excludedPageId = null
    ) {
        const searchParameters =
            new URLSearchParams({
                slug:
                    generatePageSlug(
                        slug
                    )
            });

        if (excludedPageId) {
            searchParameters.set(
                "exclude",
                excludedPageId
            );
        }

        const result =
            await apiGet(
                `/admin/pages/slug-availability?${searchParameters.toString()}`
            );

        return Boolean(
            result?.available
        );
    },

    generateSlug(value) {
        return generatePageSlug(
            value
        );
    },

    subscribe() {
        return () => {};
    }
};

export default apiPageRepository;