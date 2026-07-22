import {
    apiDelete,
    apiGet,
    apiPost
} from "@shared/data/api/apiClient";

import {
    removePageNavigation,
    synchronizePageNavigation
} from "@shared/navigation/pageNavigationSync";

function encodeValue(
    value
) {
    return encodeURIComponent(
        String(
            value ??
            ""
        )
    );
}

async function synchronizeRestoredPage(
    page
) {
    if (!page?.id) {
        return page;
    }

    try {
        await synchronizePageNavigation(
            page
        );
    } catch (
        synchronizationError
    ) {
        console.error(
            "Die Navigation der wiederhergestellten Seite konnte nicht synchronisiert werden.",
            synchronizationError
        );
    }

    return page;
}

async function removeDeletedPageNavigation(
    pageId
) {
    try {
        await removePageNavigation(
            pageId
        );
    } catch (
        synchronizationError
    ) {
        console.error(
            "Der Navigationspunkt der endgültig gelöschten Seite konnte nicht entfernt werden.",
            synchronizationError
        );
    }
}

export async function listDeletedPages({
    signal
} = {}) {
    const payload =
        await apiGet(
            "/admin/pages/trash",
            {
                signal
            }
        );

    return Array.isArray(
        payload
    )
        ? payload
        : [];
}

export async function restoreDeletedPage(
    pageId
) {
    const restoredPage =
        await apiPost(
            `/admin/pages/${encodeValue(
                pageId
            )}/restore`,
            {}
        );

    return synchronizeRestoredPage(
        restoredPage
    );
}

export async function permanentlyDeletePage(
    pageId
) {
    await apiDelete(
        `/admin/pages/${encodeValue(
            pageId
        )}/permanent`
    );

    await removeDeletedPageNavigation(
        pageId
    );

    return true;
}