import siteContentDefaults from "@shared/content/siteContentDefaults";

import {
    apiGet,
    apiPost,
    apiPut
} from "@shared/data/api/apiClient";

function encodeContentKey(
    contentKey
) {
    return encodeURIComponent(
        String(contentKey)
    );
}

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

export const apiSiteContentRepository = {
    mode: "api",

    getSnapshot() {
        return null;
    },

    getSectionSnapshot() {
        return null;
    },

    async getAll({
        signal
    } = {}) {
        return apiGet(
            "/public/content",
            {
                signal
            }
        );
    },

    async getSection(
        contentKey,
        {
            signal
        } = {}
    ) {
        return apiGet(
            `/public/content/${encodeContentKey(
                contentKey
            )}`,
            {
                signal
            }
        );
    },

    async updateSection(
        contentKey,
        content
    ) {
        return apiPut(
            `/admin/content/${encodeContentKey(
                contentKey
            )}`,
            content
        );
    },

    async resetSection(
        contentKey
    ) {
        const defaultContent =
            siteContentDefaults[
                contentKey
            ];

        if (!defaultContent) {
            throw new Error(
                `Für „${contentKey}“ existieren keine Standardinhalte.`
            );
        }

        return apiPost(
            `/admin/content/${encodeContentKey(
                contentKey
            )}/reset`,
            cloneValue(
                defaultContent
            )
        );
    },

    subscribe() {
        return () => {};
    }
};

export default apiSiteContentRepository;