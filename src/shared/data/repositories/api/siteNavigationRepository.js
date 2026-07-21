import {
    apiGet,
    apiPost,
    apiPut
} from "@shared/data/api/apiClient";

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
            "/admin/navigation/reset"
        );
    },

    subscribe() {
        return () => {};
    }
};

export default apiSiteNavigationRepository;