const PREVIEW_STORAGE_PREFIX =
    "bluepulse.cms.preview.v1.";

function getPreviewKey(pageId) {
    return `${PREVIEW_STORAGE_PREFIX}${pageId}`;
}

export function savePreviewPage(page) {
    if (!page?.id) {
        return;
    }

    localStorage.setItem(
        getPreviewKey(page.id),
        JSON.stringify(page)
    );
}

export function getPreviewPage(pageId) {
    try {
        const storedPreview = localStorage.getItem(
            getPreviewKey(pageId)
        );

        if (!storedPreview) {
            return null;
        }

        return JSON.parse(storedPreview);
    } catch (error) {
        console.error(
            "Vorschau konnte nicht geladen werden.",
            error
        );

        return null;
    }
}

export function clearPreviewPage(pageId) {
    localStorage.removeItem(
        getPreviewKey(pageId)
    );
}