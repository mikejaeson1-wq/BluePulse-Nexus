import {
    apiGet,
    apiPost
} from "@shared/data/api/apiClient";

const LEGACY_STORAGE_KEY =
    "bp_user";

function removeLegacyLogin() {
    if (
        typeof globalThis
            .localStorage ===
        "undefined"
    ) {
        return;
    }

    try {
        globalThis.localStorage
            .removeItem(
                LEGACY_STORAGE_KEY
            );
    } catch {
        // Ein blockierter Browser-Speicher
        // darf die API-Anmeldung nicht verhindern.
    }
}

function normalizeUser(
    user
) {
    if (
        !user ||
        typeof user !==
            "object" ||
        Array.isArray(user)
    ) {
        return null;
    }

    const id =
        String(
            user.id ?? ""
        ).trim();

    if (!id) {
        return null;
    }

    return {
        ...user,

        id,

        username:
            String(
                user.username ??
                ""
            ),

        email:
            String(
                user.email ??
                ""
            ),

        name:
            String(
                user.name ??
                user.displayName ??
                user.username ??
                "Nexus-Benutzer"
            ),

        displayName:
            String(
                user.displayName ??
                user.name ??
                user.username ??
                "Nexus-Benutzer"
            ),

        role:
            String(
                user.role ??
                ""
            ),

        roleLabel:
            String(
                user.roleLabel ??
                user.role ??
                ""
            ),

        active:
            user.active !==
            false
    };
}

export async function login(
    identifier,
    password
) {
    removeLegacyLogin();

    const response =
        await apiPost(
            "/auth/login",
            {
                identifier:
                    String(
                        identifier ??
                        ""
                    ).trim(),

                password:
                    String(
                        password ??
                        ""
                    )
            }
        );

    return normalizeUser(
        response?.user
    );
}

export async function logout() {
    removeLegacyLogin();

    try {
        await apiPost(
            "/auth/logout",
            {}
        );
    } catch (error) {
        /*
         * Eine bereits abgelaufene Sitzung gilt lokal
         * ebenfalls als erfolgreich abgemeldet.
         */
        if (
            error?.status !==
            401
        ) {
            throw error;
        }
    }
}

export async function getCurrentUser({
    signal
} = {}) {
    removeLegacyLogin();

    try {
        const response =
            await apiGet(
                "/auth/me",
                {
                    signal
                }
            );

        return normalizeUser(
            response?.user
        );
    } catch (error) {
        if (
            error?.name ===
            "AbortError"
        ) {
            throw error;
        }

        if (
            error?.status ===
            401
        ) {
            return null;
        }

        throw error;
    }
}