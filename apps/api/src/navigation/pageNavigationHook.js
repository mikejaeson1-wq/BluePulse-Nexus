import {
    removePageNavigation,
    synchronizePageNavigation
} from "../services/pageNavigationService.js";

const MUTATING_METHODS =
    new Set([
        "POST",
        "PUT",
        "PATCH",
        "DELETE"
    ]);

function getRequestPath(
    request
) {
    return String(
        request.raw?.url ??
        request.url ??
        ""
    ).split(
        "?"
    )[0];
}

function isPageMutation(
    request
) {
    const method =
        String(
            request.method ??
            ""
        ).toUpperCase();

    if (
        !MUTATING_METHODS.has(
            method
        )
    ) {
        return false;
    }

    const path =
        getRequestPath(
            request
        );

    return /^\/api\/admin\/pages(?:\/|$)/.test(
        path
    );
}

function parsePayload(
    payload
) {
    if (
        payload ===
            null ||
        payload ===
            undefined ||
        payload ===
            ""
    ) {
        return null;
    }

    if (
        typeof payload ===
            "object" &&
        !Buffer.isBuffer(
            payload
        )
    ) {
        return payload;
    }

    const text =
        Buffer.isBuffer(
            payload
        )
            ? payload.toString(
                "utf8"
            )
            : String(
                payload
            );

    if (!text.trim()) {
        return null;
    }

    try {
        return JSON.parse(
            text
        );
    } catch {
        return null;
    }
}

function getPageId(
    request,
    responsePage
) {
    return (
        responsePage?.id ??
        request.params?.pageId ??
        null
    );
}

export function registerPageNavigationHook(
    fastify
) {
    fastify.addHook(
        "onSend",
        async (
            request,
            reply,
            payload
        ) => {
            if (
                !isPageMutation(
                    request
                ) ||
                reply.statusCode <
                    200 ||
                reply.statusCode >=
                    400
            ) {
                return payload;
            }

            const method =
                String(
                    request.method
                ).toUpperCase();

            const responsePage =
                parsePayload(
                    payload
                );

            const pageId =
                getPageId(
                    request,
                    responsePage
                );

            if (!pageId) {
                return payload;
            }

            try {
                if (
                    method ===
                    "DELETE"
                ) {
                    await removePageNavigation(
                        fastify.database,
                        pageId
                    );
                } else {
                    await synchronizePageNavigation(
                        fastify.database,
                        {
                            pageId,
                            page:
                                responsePage
                        }
                    );
                }
            } catch (error) {
                request.log.error(
                    {
                        error,
                        pageId
                    },
                    "Die Builder-Seite konnte nicht automatisch mit der Navigation synchronisiert werden."
                );
            }

            return payload;
        }
    );
}

export default registerPageNavigationHook;