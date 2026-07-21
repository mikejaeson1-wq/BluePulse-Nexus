import {
    apiDelete,
    apiGet,
    apiPost,
    apiPut
} from "@shared/data/api/apiClient";

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
        return null;
    },

    getByIdSnapshot() {
        return null;
    },

    getBySlugSnapshot() {
        return null;
    },

    getPublishedBySlugSnapshot() {
        return null;
    },

    async getAll({
        signal
    } = {}) {
        return apiGet(
            "/admin/pages",
            {
                signal
            }
        );
    },

    async getById(
        pageId,
        {
            signal
        } = {}
    ) {
        return apiGet(
            `/admin/pages/${encodeValue(
                pageId
            )}`,
            {
                signal
            }
        );
    },

    async getBySlug(
        slug,
        {
            signal
        } = {}
    ) {
        return apiGet(
            `/admin/pages/by-slug/${encodeValue(
                slug
            )}`,
            {
                signal
            }
        );
    },

    async getPublishedBySlug(
        slug,
        {
            signal
        } = {}
    ) {
        return apiGet(
            `/public/pages/${encodeValue(
                slug
            )}`,
            {
                signal
            }
        );
    },

    async create(data) {
        return apiPost(
            "/admin/pages",
            data
        );
    },

    async update(
        pageId,
        data
    ) {
        return apiPut(
            `/admin/pages/${encodeValue(
                pageId
            )}`,
            data
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

        return true;
    },

    async publish(
        pageId,
        data = {}
    ) {
        return apiPost(
            `/admin/pages/${encodeValue(
                pageId
            )}/publish`,
            data
        );
    },

    async unpublish(
        pageId,
        data = {}
    ) {
        return apiPost(
            `/admin/pages/${encodeValue(
                pageId
            )}/unpublish`,
            data
        );
    },

    async duplicate(pageId) {
        return apiPost(
            `/admin/pages/${encodeValue(
                pageId
            )}/duplicate`
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
        return apiPost(
            `/admin/pages/${encodeValue(
                pageId
            )}/versions/${encodeValue(
                versionNumber
            )}/restore`
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