import {
    apiGet,
    apiPost,
    apiPut
} from "@shared/data/api/apiClient";

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
            "/admin/home-layout/reset"
        );
    },

    subscribe() {
        return () => {};
    }
};

export default apiHomeLayoutRepository;