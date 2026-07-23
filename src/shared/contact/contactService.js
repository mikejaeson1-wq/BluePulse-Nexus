import {
    apiDelete,
    apiGet,
    apiPatch,
    apiPost
} from "@shared/data/api/apiClient";

export const CONTACT_PAGE_SIZE =
    25;

export const CONTACT_STATUS_OPTIONS = [
    {
        value:
            "new",

        label:
            "Neu",

        icon:
            "bi-envelope-exclamation",

        tone:
            "new"
    },
    {
        value:
            "in_progress",

        label:
            "In Bearbeitung",

        icon:
            "bi-hourglass-split",

        tone:
            "progress"
    },
    {
        value:
            "answered",

        label:
            "Beantwortet",

        icon:
            "bi-reply-fill",

        tone:
            "answered"
    },
    {
        value:
            "closed",

        label:
            "Geschlossen",

        icon:
            "bi-check-circle-fill",

        tone:
            "closed"
    },
    {
        value:
            "spam",

        label:
            "Spam",

        icon:
            "bi-shield-exclamation",

        tone:
            "spam"
    }
];

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

export function getContactStatusDefinition(
    value
) {
    return (
        CONTACT_STATUS_OPTIONS.find(
            (option) =>
                option.value ===
                value
        ) ??
        CONTACT_STATUS_OPTIONS[0]
    );
}

export async function submitContactMessage(
    submission,
    {
        signal
    } = {}
) {
    return apiPost(
        "/contact",
        submission,
        {
            signal
        }
    );
}

export async function getContactOverview({
    signal
} = {}) {
    const payload =
        await apiGet(
            "/admin/contact/overview",
            {
                signal
            }
        );

    return {
        total:
            Number(
                payload?.total
            ) || 0,

        new:
            Number(
                payload?.new
            ) || 0,

        unread:
            Number(
                payload?.unread
            ) || 0,

        inProgress:
            Number(
                payload?.inProgress
            ) || 0,

        answered:
            Number(
                payload?.answered
            ) || 0,

        closed:
            Number(
                payload?.closed
            ) || 0,

        spam:
            Number(
                payload?.spam
            ) || 0,

        today:
            Number(
                payload?.today
            ) || 0
    };
}

export async function listContactMessages({
    limit =
        CONTACT_PAGE_SIZE,

    offset = 0,
    status = "",
    read = "",
    search = "",
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
        "status",
        status
    );

    appendQueryParameter(
        query,
        "read",
        read
    );

    appendQueryParameter(
        query,
        "search",
        search
    );

    const payload =
        await apiGet(
            `/admin/contact?${query.toString()}`,
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

export function getContactMessage(
    messageId,
    {
        signal
    } = {}
) {
    return apiGet(
        `/admin/contact/${encodeURIComponent(
            messageId
        )}`,
        {
            signal
        }
    );
}

export function updateContactMessage(
    messageId,
    patch,
    {
        signal
    } = {}
) {
    return apiPatch(
        `/admin/contact/${encodeURIComponent(
            messageId
        )}`,
        patch,
        {
            signal
        }
    );
}

export function deleteContactMessage(
    messageId,
    {
        signal
    } = {}
) {
    return apiDelete(
        `/admin/contact/${encodeURIComponent(
            messageId
        )}`,
        {
            signal
        }
    );
}
