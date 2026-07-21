const STORAGE_KEY =
    "bluepulse.cms.pages.v1";

const CHANGE_EVENT =
    "bluepulse:cms-pages-change";

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

function createId() {
    if (globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
    }

    return `page-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
}

function createIsoDate(value) {
    if (!value) {
        return new Date().toISOString();
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return new Date().toISOString();
    }

    return date.toISOString();
}

function normalizeStatus(status) {
    const normalizedStatus =
        String(status ?? "")
            .trim()
            .toLowerCase();

    if (
        normalizedStatus ===
            "published" ||
        normalizedStatus ===
            "veröffentlicht" ||
        normalizedStatus ===
            "veroeffentlicht"
    ) {
        return "published";
    }

    return "draft";
}

export function generatePageSlug(
    value
) {
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

    return slug || "neue-seite";
}

function ensureUniqueSlug(
    requestedSlug,
    pages,
    excludedPageId = null
) {
    const baseSlug =
        generatePageSlug(
            requestedSlug
        );

    const usedSlugs =
        new Set(
            pages
                .filter(
                    (page) =>
                        page.id !==
                        excludedPageId
                )
                .map(
                    (page) =>
                        generatePageSlug(
                            page.slug
                        )
                )
        );

    if (
        !usedSlugs.has(
            baseSlug
        )
    ) {
        return baseSlug;
    }

    let suffix = 2;

    while (
        usedSlugs.has(
            `${baseSlug}-${suffix}`
        )
    ) {
        suffix += 1;
    }

    return `${baseSlug}-${suffix}`;
}

function normalizePage(
    page,
    index = 0
) {
    const createdAt =
        createIsoDate(
            page?.createdAt
        );

    const updatedAt =
        createIsoDate(
            page?.updatedAt ??
            createdAt
        );

    const status =
        normalizeStatus(
            page?.status
        );

    return {
        ...page,

        id:
            String(
                page?.id ??
                ""
            ).trim() ||
            createId(),

        title:
            String(
                page?.title ??
                ""
            ).trim() ||
            `Unbenannte Seite ${index + 1}`,

        slug:
            generatePageSlug(
                page?.slug ??
                page?.title
            ),

        template:
            String(
                page?.template ??
                "blank"
            ).trim() ||
            "blank",

        status,

        blocks:
            Array.isArray(
                page?.blocks
            )
                ? page.blocks
                : [],

        theme:
            page?.theme &&
            typeof page.theme ===
                "object" &&
            !Array.isArray(
                page.theme
            )
                ? page.theme
                : {},

        createdAt,
        updatedAt,

        publishedAt:
            status === "published"
                ? createIsoDate(
                    page?.publishedAt ??
                    updatedAt
                )
                : null
    };
}

function normalizePages(value) {
    const sourcePages =
        Array.isArray(value)
            ? value
            : Array.isArray(
                value?.pages
            )
                ? value.pages
                : [];

    const usedIds =
        new Set();

    const normalizedPages =
        sourcePages.map(
            (page, index) => {
                const normalizedPage =
                    normalizePage(
                        page,
                        index
                    );

                if (
                    usedIds.has(
                        normalizedPage.id
                    )
                ) {
                    normalizedPage.id =
                        createId();
                }

                usedIds.add(
                    normalizedPage.id
                );

                return normalizedPage;
            }
        );

    const completedPages = [];

    normalizedPages.forEach(
        (page) => {
            completedPages.push({
                ...page,

                slug:
                    ensureUniqueSlug(
                        page.slug,
                        completedPages
                    )
            });
        }
    );

    return completedPages;
}

function readStoredPages() {
    if (
        typeof globalThis.localStorage ===
        "undefined"
    ) {
        return [];
    }

    try {
        const storedValue =
            globalThis.localStorage.getItem(
                STORAGE_KEY
            );

        if (!storedValue) {
            return [];
        }

        return normalizePages(
            JSON.parse(
                storedValue
            )
        );
    } catch (error) {
        console.error(
            "CMS-Seiten konnten nicht geladen werden.",
            error
        );

        return [];
    }
}

function writeStoredPages(pages) {
    const normalizedPages =
        normalizePages(pages);

    if (
        typeof globalThis.localStorage !==
        "undefined"
    ) {
        globalThis.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                normalizedPages
            )
        );
    }

    return normalizedPages;
}

function emitPagesChange(
    pages
) {
    if (
        typeof globalThis.window ===
        "undefined"
    ) {
        return;
    }

    globalThis.window.dispatchEvent(
        new CustomEvent(
            CHANGE_EVENT,
            {
                detail: {
                    pages:
                        cloneValue(
                            pages
                        )
                }
            }
        )
    );
}

function commitPages(pages) {
    const storedPages =
        writeStoredPages(
            pages
        );

    emitPagesChange(
        storedPages
    );

    return cloneValue(
        storedPages
    );
}

function getPageIndex(
    pages,
    pageId
) {
    return pages.findIndex(
        (page) =>
            page.id === pageId
    );
}

export const localPageRepository = {
    mode: "local",

    getSnapshot() {
        return cloneValue(
            readStoredPages()
        );
    },

    getByIdSnapshot(pageId) {
        const page =
            readStoredPages().find(
                (currentPage) =>
                    currentPage.id ===
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
            readStoredPages().find(
                (currentPage) =>
                    currentPage.slug ===
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
            readStoredPages().find(
                (currentPage) =>
                    currentPage.slug ===
                        normalizedSlug &&
                    currentPage.status ===
                        "published"
            );

        return page
            ? cloneValue(page)
            : null;
    },

    getAll() {
        return this.getSnapshot();
    },

    getById(pageId) {
        return this.getByIdSnapshot(
            pageId
        );
    },

    getBySlug(slug) {
        return this.getBySlugSnapshot(
            slug
        );
    },

    getPublishedBySlug(slug) {
        return this
            .getPublishedBySlugSnapshot(
                slug
            );
    },

    create(data = {}) {
        const pages =
            readStoredPages();

        const now =
            new Date().toISOString();

        const title =
            String(
                data.title ??
                "Neue Seite"
            ).trim() ||
            "Neue Seite";

        const status =
            normalizeStatus(
                data.status
            );

        const page = {
            ...data,

            id:
                String(
                    data.id ?? ""
                ).trim() ||
                createId(),

            title,

            slug:
                ensureUniqueSlug(
                    data.slug ??
                    title,
                    pages
                ),

            template:
                String(
                    data.template ??
                    "blank"
                ).trim() ||
                "blank",

            status,

            blocks:
                Array.isArray(
                    data.blocks
                )
                    ? data.blocks
                    : [],

            theme:
                data.theme &&
                typeof data.theme ===
                    "object" &&
                !Array.isArray(
                    data.theme
                )
                    ? data.theme
                    : {},

            createdAt:
                createIsoDate(
                    data.createdAt ??
                    now
                ),

            updatedAt: now,

            publishedAt:
                status === "published"
                    ? createIsoDate(
                        data.publishedAt ??
                        now
                    )
                    : null
        };

        const savedPages =
            commitPages([
                ...pages,
                page
            ]);

        return cloneValue(
            savedPages.find(
                (savedPage) =>
                    savedPage.id ===
                    page.id
            )
        );
    },

    update(
        pageId,
        data = {}
    ) {
        const pages =
            readStoredPages();

        const pageIndex =
            getPageIndex(
                pages,
                pageId
            );

        if (pageIndex === -1) {
            return null;
        }

        const currentPage =
            pages[pageIndex];

        const nextStatus =
            data.status !== undefined
                ? normalizeStatus(
                    data.status
                )
                : currentPage.status;

        const requestedSlug =
            data.slug !== undefined
                ? data.slug
                : currentPage.slug;

        const now =
            new Date().toISOString();

        const updatedPage = {
            ...currentPage,
            ...data,

            id:
                currentPage.id,

            title:
                String(
                    data.title ??
                    currentPage.title
                ).trim() ||
                currentPage.title,

            slug:
                ensureUniqueSlug(
                    requestedSlug,
                    pages,
                    pageId
                ),

            status:
                nextStatus,

            blocks:
                Array.isArray(
                    data.blocks
                )
                    ? data.blocks
                    : currentPage.blocks,

            theme:
                data.theme &&
                typeof data.theme ===
                    "object" &&
                !Array.isArray(
                    data.theme
                )
                    ? data.theme
                    : currentPage.theme,

            createdAt:
                currentPage.createdAt,

            updatedAt:
                now,

            publishedAt:
                nextStatus ===
                "published"
                    ? (
                        currentPage
                            .publishedAt ??
                        now
                    )
                    : null
        };

        const nextPages = [
            ...pages
        ];

        nextPages[pageIndex] =
            updatedPage;

        const savedPages =
            commitPages(
                nextPages
            );

        return cloneValue(
            savedPages.find(
                (savedPage) =>
                    savedPage.id ===
                    pageId
            )
        );
    },

    save(pageOrId, data) {
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

        if (
            page.id &&
            this.getByIdSnapshot(
                page.id
            )
        ) {
            return this.update(
                page.id,
                page
            );
        }

        return this.create(
            page
        );
    },

    remove(pageId) {
        const pages =
            readStoredPages();

        const pageExists =
            pages.some(
                (page) =>
                    page.id ===
                    pageId
            );

        if (!pageExists) {
            return false;
        }

        commitPages(
            pages.filter(
                (page) =>
                    page.id !==
                    pageId
            )
        );

        return true;
    },

    publish(
        pageId,
        data = {}
    ) {
        return this.update(
            pageId,
            {
                ...data,
                status:
                    "published"
            }
        );
    },

    unpublish(
        pageId,
        data = {}
    ) {
        return this.update(
            pageId,
            {
                ...data,
                status:
                    "draft"
            }
        );
    },

    duplicate(pageId) {
        const sourcePage =
            this.getByIdSnapshot(
                pageId
            );

        if (!sourcePage) {
            return null;
        }

        const {
            id,
            createdAt,
            updatedAt,
            publishedAt,
            ...pageData
        } = sourcePage;

        return this.create({
            ...pageData,

            title:
                `${sourcePage.title} – Kopie`,

            slug:
                `${sourcePage.slug}-kopie`,

            status:
                "draft"
        });
    },

    isSlugAvailable(
        slug,
        excludedPageId = null
    ) {
        const normalizedSlug =
            generatePageSlug(
                slug
            );

        return !readStoredPages().some(
            (page) =>
                page.id !==
                    excludedPageId &&
                page.slug ===
                    normalizedSlug
        );
    },

    generateSlug(value) {
        return generatePageSlug(
            value
        );
    },

    subscribe(listener) {
        if (
            typeof globalThis.window ===
            "undefined"
        ) {
            return () => {};
        }

        function handleCustomEvent(
            event
        ) {
            const eventPages =
                event.detail?.pages;

            listener(
                Array.isArray(
                    eventPages
                )
                    ? cloneValue(
                        eventPages
                    )
                    : cloneValue(
                        readStoredPages()
                    )
            );
        }

        function handleStorageEvent(
            event
        ) {
            if (
                event.key !==
                STORAGE_KEY
            ) {
                return;
            }

            listener(
                cloneValue(
                    readStoredPages()
                )
            );
        }

        globalThis.window.addEventListener(
            CHANGE_EVENT,
            handleCustomEvent
        );

        globalThis.window.addEventListener(
            "storage",
            handleStorageEvent
        );

        return () => {
            globalThis.window.removeEventListener(
                CHANGE_EVENT,
                handleCustomEvent
            );

            globalThis.window.removeEventListener(
                "storage",
                handleStorageEvent
            );
        };
    }
};

export default localPageRepository;