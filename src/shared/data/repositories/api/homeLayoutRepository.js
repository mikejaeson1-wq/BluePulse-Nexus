import homeLayoutDefaults from "@shared/layout/homeLayoutDefaults";

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

export const apiHomeLayoutRepository = {
    mode: "api",

    getSnapshot() {
        return null;
    },

    async get({
        signal
    } = {}) {
        return apiGet(
            "/public/home-layout",
            {
                signal
            }
        );
    },

    async update(layout) {
        return apiPut(
            "/admin/home-layout",
            layout
        );
    },

    async reset() {
        return apiPost(
            "/admin/home-layout/reset",
            cloneValue(
                homeLayoutDefaults
            )
        );
    },

    subscribe() {
        return () => {};
    }
};

export default apiHomeLayoutRepository;