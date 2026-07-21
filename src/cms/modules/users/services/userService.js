import {
    apiGet,
    apiPatch,
    apiPost
} from "@shared/data/api/apiClient";

export const USER_ROLES =
    Object.freeze({
        ADMINISTRATOR:
            "administrator",

        EDITOR:
            "editor",

        MEDIA_MANAGER:
            "media_manager"
    });

export const USER_ROLE_OPTIONS =
    Object.freeze([
        {
            value:
                USER_ROLES.ADMINISTRATOR,

            label:
                "Administrator",

            description:
                "Vollständiger Zugriff auf Nexus, Benutzer und Migrationen."
        },

        {
            value:
                USER_ROLES.EDITOR,

            label:
                "Redakteur",

            description:
                "Kann Website-Inhalte, Seiten, Layouts und Medien bearbeiten."
        },

        {
            value:
                USER_ROLES.MEDIA_MANAGER,

            label:
                "Medienverwalter",

            description:
                "Hat ausschließlich Zugriff auf die Medienbibliothek."
        }
    ]);

export function getUserRoleLabel(
    role
) {
    return (
        USER_ROLE_OPTIONS.find(
            (option) =>
                option.value === role
        )?.label ??
        role ??
        "Unbekannt"
    );
}

export async function listUsers() {
    const payload =
        await apiGet(
            "/admin/users"
        );

    return Array.isArray(
        payload
    )
        ? payload
        : [];
}

export async function createUser(
    userData
) {
    const payload =
        await apiPost(
            "/admin/users",
            userData
        );

    return payload?.user ??
        null;
}

export async function updateUser(
    userId,
    changes
) {
    const payload =
        await apiPatch(
            `/admin/users/${userId}`,
            changes
        );

    return payload?.user ??
        null;
}

export async function resetUserPassword(
    userId,
    password
) {
    const payload =
        await apiPost(
            `/admin/users/${userId}/password`,
            {
                password
            }
        );

    return payload ?? {
        user: null,
        sessionsRevoked: false
    };
}

export async function revokeUserSessions(
    userId
) {
    const payload =
        await apiPost(
            `/admin/users/${userId}/sessions/revoke`,
            {}
        );

    return Number(
        payload?.revokedSessions
    ) || 0;
}