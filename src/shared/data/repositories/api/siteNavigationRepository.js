import siteNavigationDefaults from "@shared/navigation/SiteNavigationDefaults";

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

export const apiSiteNavigationRepository = {
    mode: "api",

    getSnapshot() {
        return null;
    },

    async get({
        signal
    } = {}) {
        return apiGet(
            "/public/navigation",
            {
                signal
            }
        );
    },

    async update(navigation) {
        return apiPut(
            "/admin/navigation",
            navigation
        );
    },

    async reset() {
        return apiPost(
            "/admin/navigation/reset",
            cloneValue(
                siteNavigationDefaults
            )
        );
    },

    subscribe() {
        return () => {};
    }
};

export default apiSiteNavigationRepository;