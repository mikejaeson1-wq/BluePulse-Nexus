import {
    getFooterSettings,
    resetFooterSettings,
    subscribeToFooterSettings,
    updateFooterSettings
} from "@shared/footer/footerService";

export const localFooterRepository = {
    mode: "local",

    getSnapshot() {
        return getFooterSettings();
    },

    async get() {
        return getFooterSettings();
    },

    async update(settings) {
        return updateFooterSettings(
            settings
        );
    },

    async reset() {
        return resetFooterSettings();
    },

    subscribe(listener) {
        return subscribeToFooterSettings(
            listener
        );
    }
};

export default localFooterRepository;