import {
    apiGet,
    apiPost,
    apiPut
} from "@shared/data/api/apiClient";

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
            "/admin/footer/reset"
        );
    },

    subscribe() {
        return () => {};
    }
};

export default apiFooterRepository;