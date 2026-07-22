import {
    apiDelete,
    apiGet,
    apiPost
} from "@shared/data/api/apiClient";

function encodeValue(value) {
    return encodeURIComponent(
        String(value ?? "")
    );
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
    return apiPost(
        `/admin/pages/${encodeValue(
            pageId
        )}/restore`,
        {}
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

    return true;
}