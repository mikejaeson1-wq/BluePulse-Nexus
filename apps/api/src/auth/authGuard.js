import {
    getSessionTokenFromRequest
} from "./authCookie.js";

import {
    AUTH_ROLES,
    getAuthenticatedUser
} from "../services/authService.js";

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

function isProtectedAdminPath(
    request
) {
    const requestPath =
        getRequestPath(
            request
        );

    return (
        requestPath ===
            "/api/admin" ||
        requestPath.startsWith(
            "/api/admin/"
        )
    );
}

function isMediaPath(
    requestPath
) {
    return (
        requestPath ===
            "/api/admin/media" ||
        requestPath.startsWith(
            "/api/admin/media/"
        )
    );
}

function isMediaMigrationPath(
    requestPath
) {
    return requestPath.startsWith(
        "/api/admin/media/import/"
    );
}

function isDataMigrationPath(
    requestPath
) {
    return (
        requestPath ===
            "/api/admin/migration" ||
        requestPath.startsWith(
            "/api/admin/migration/"
        )
    );
}

function isUserManagementPath(
    requestPath
) {
    return (
        requestPath ===
            "/api/admin/users" ||
        requestPath.startsWith(
            "/api/admin/users/"
        )
    );
}

function canAccessAdminPath(
    user,
    requestPath
) {
    if (
        user.role ===
        AUTH_ROLES.ADMINISTRATOR
    ) {
        return true;
    }

    if (
        requestPath ===
        "/api/admin/auth/session"
    ) {
        return true;
    }

    if (
        user.role ===
        AUTH_ROLES.EDITOR
    ) {
        return (
            !isUserManagementPath(
                requestPath
            ) &&
            !isDataMigrationPath(
                requestPath
            ) &&
            !isMediaMigrationPath(
                requestPath
            )
        );
    }

    if (
        user.role ===
        AUTH_ROLES.MEDIA_MANAGER
    ) {
        return (
            isMediaPath(
                requestPath
            ) &&
            !isMediaMigrationPath(
                requestPath
            )
        );
    }

    return false;
}

function sendUnauthorized(
    reply
) {
    return reply
        .status(401)
        .send({
            statusCode: 401,

            error:
                "Unauthorized",

            message:
                "Für diese Anfrage ist eine gültige Nexus-Sitzung erforderlich."
        });
}

function sendForbidden(
    reply
) {
    return reply
        .status(403)
        .send({
            statusCode: 403,

            error:
                "Forbidden",

            message:
                "Deine Benutzerrolle besitzt für diesen Bereich keine Berechtigung."
        });
}

export function registerAuthenticationGuard(
    fastify,
    {
        required = true
    } = {}
) {
    fastify.decorateRequest(
        "authUser",
        null
    );

    fastify.addHook(
        "preHandler",
        async (
            request,
            reply
        ) => {
            if (
                !required ||
                !isProtectedAdminPath(
                    request
                )
            ) {
                return;
            }

            const token =
                getSessionTokenFromRequest(
                    request
                );

            const user =
                await getAuthenticatedUser(
                    fastify.database,
                    token
                );

            if (!user) {
                return sendUnauthorized(
                    reply
                );
            }

            request.authUser =
                user;

            const requestPath =
                getRequestPath(
                    request
                );

            if (
                !canAccessAdminPath(
                    user,
                    requestPath
                )
            ) {
                return sendForbidden(
                    reply
                );
            }
        }
    );
}

export default registerAuthenticationGuard;