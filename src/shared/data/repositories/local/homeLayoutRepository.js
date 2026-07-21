import {
    getHomeLayout,
    resetHomeLayout,
    subscribeToHomeLayout,
    updateHomeLayout
} from "@shared/layout/homeLayoutService";

export const localHomeLayoutRepository = {
    mode: "local",

    getSnapshot() {
        return getHomeLayout();
    },

    async get() {
        return getHomeLayout();
    },

    async update(layout) {
        return updateHomeLayout(
            layout
        );
    },

    async reset() {
        return resetHomeLayout();
    },

    subscribe(listener) {
        return subscribeToHomeLayout(
            listener
        );
    }
};

export default localHomeLayoutRepository;