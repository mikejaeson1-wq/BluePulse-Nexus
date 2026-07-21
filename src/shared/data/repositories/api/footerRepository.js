import footerDefaults from "@shared/footer/footerDefaults";

import {
    apiGet,
    apiPost,
    apiPut
} from "@shared/data/api/apiClient";

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

export const apiFooterRepository = {
    mode: "api",

    getSnapshot() {
        return null;
    },

    async get({
        signal
    } = {}) {
        return apiGet(
            "/public/footer",
            {
                signal
            }
        );
    },

    async update(settings) {
        return apiPut(
            "/admin/footer",
            settings
        );
    },

    async reset() {
        return apiPost(
            "/admin/footer/reset",
            cloneValue(
                footerDefaults
            )
        );
    },

    subscribe() {
        return () => {};
    }
};

export default apiFooterRepository;