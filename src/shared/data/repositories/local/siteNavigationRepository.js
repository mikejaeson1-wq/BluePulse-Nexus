import {
    getSiteNavigation,
    resetSiteNavigation,
    subscribeToSiteNavigation,
    updateSiteNavigation
} from "@shared/navigation/SiteNavigationService";

export const localSiteNavigationRepository = {
    mode: "local",

    getSnapshot() {
        return getSiteNavigation();
    },

    async get() {
        return getSiteNavigation();
    },

    async update(navigation) {
        return updateSiteNavigation(
            navigation
        );
    },

    async reset() {
        return resetSiteNavigation();
    },

    subscribe(listener) {
        return subscribeToSiteNavigation(
            listener
        );
    }
};

export default localSiteNavigationRepository;