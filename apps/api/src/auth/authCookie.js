import runtimeConfig from "../config/runtimeConfig.js";

function getBaseCookieOptions() {
    return {
        path: "/",

        httpOnly: true,

        sameSite:
            "lax",

        secure:
            runtimeConfig
                .auth
                .secureCookie
    };
}

export function getSessionTokenFromRequest(
    request
) {
    return (
        request.cookies?.[
            runtimeConfig
                .auth
                .cookieName
        ] ??
        null
    );
}

export function setAuthSessionCookie(
    reply,
    token,
    expiresAt
) {
    reply.setCookie(
        runtimeConfig
            .auth
            .cookieName,
        token,
        {
            ...getBaseCookieOptions(),

            maxAge:
                runtimeConfig
                    .auth
                    .sessionTtlSeconds,

            expires:
                new Date(
                    expiresAt
                )
        }
    );
}

export function clearAuthSessionCookie(
    reply
) {
    reply.clearCookie(
        runtimeConfig
            .auth
            .cookieName,
        getBaseCookieOptions()
    );
}