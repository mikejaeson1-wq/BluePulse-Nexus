import {
    apiGet
} from "@shared/data/api/apiClient";

export const AUDIT_PAGE_SIZE =
    50;

function appendQueryParameter(
    query,
    key,
    value
) {
    const normalizedValue =
        String(
            value ??
            ""
        ).trim();

    if (!normalizedValue) {
        return;
    }

    query.set(
        key,
        normalizedValue
    );
}

export async function listAuditEntries({
    limit =
        AUDIT_PAGE_SIZE,

    offset = 0,
    action = "",
    entityType = "",
    actorUserId = "",
    signal
} = {}) {
    const query =
        new URLSearchParams();

    query.set(
        "limit",
        String(limit)
    );

    query.set(
        "offset",
        String(offset)
    );

    appendQueryParameter(
        query,
        "action",
        action
    );

    appendQueryParameter(
        query,
        "entityType",
        entityType
    );

    appendQueryParameter(
        query,
        "actorUserId",
        actorUserId
    );

    const payload =
        await apiGet(
            `/admin/audit?${query.toString()}`,
            {
                signal
            }
        );

    return {
        items:
            Array.isArray(
                payload?.items
            )
                ? payload.items
                : [],

        total:
            Number(
                payload?.total
            ) || 0,

        limit:
            Number(
                payload?.limit
            ) || limit,

        offset:
            Number(
                payload?.offset
            ) || offset
    };
}