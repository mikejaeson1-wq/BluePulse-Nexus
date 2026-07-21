import {
    getSiteContent,
    getSiteSection,
    resetSiteSection,
    subscribeToSiteContent,
    updateSiteSection
} from "@shared/content/siteContentService";

export const localSiteContentRepository = {
    mode: "local",

    getSnapshot() {
        return getSiteContent();
    },

    getSectionSnapshot(
        contentKey
    ) {
        return getSiteSection(
            contentKey
        );
    },

    async getAll() {
        return getSiteContent();
    },

    async getSection(
        contentKey
    ) {
        return getSiteSection(
            contentKey
        );
    },

    async updateSection(
        contentKey,
        content
    ) {
        return updateSiteSection(
            contentKey,
            content
        );
    },

    async resetSection(
        contentKey
    ) {
        return resetSiteSection(
            contentKey
        );
    },

    subscribe(listener) {
        return subscribeToSiteContent(
            (content) => {
                listener(content);
            }
        );
    }
};

export default localSiteContentRepository;