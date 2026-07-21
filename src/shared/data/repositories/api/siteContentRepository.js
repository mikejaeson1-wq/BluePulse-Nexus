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
        return apiPost(
            `/admin/content/${encodeContentKey(
                contentKey
            )}/reset`
        );
    },

    subscribe() {
        return () => {};
    }
};

export default apiSiteContentRepository;