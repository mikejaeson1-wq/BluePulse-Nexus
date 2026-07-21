import "./ProtectedRoute.css";

import {
    Navigate,
    useLocation
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext";

export const CMS_ROLES =
    Object.freeze({
        ADMINISTRATOR:
            "administrator",

        EDITOR:
            "editor",

        MEDIA_MANAGER:
            "media_manager"
    });

export function getDefaultAdminRoute(
    role
) {
    if (
        role ===
        CMS_ROLES.MEDIA_MANAGER
    ) {
        return "/admin/media";
    }

    if (
        role ===
            CMS_ROLES.ADMINISTRATOR ||
        role ===
            CMS_ROLES.EDITOR
    ) {
        return "/admin";
    }

    return "/";
}

export default function RoleRoute({
    children,
    roles = []
}) {
    const location =
        useLocation();

    const {
        user,
        loading
    } =
        useAuth();

    if (loading) {
        return (
            <div
                className="auth-route-loading"
                role="status"
                aria-live="polite"
            >
                <div
                    className="spinner-border text-info"
                    aria-hidden="true"
                />

                <span>
                    Nexus-Berechtigungen werden geprüft …
                </span>
            </div>
        );
    }

    if (!user) {
        return (
            <Navigate
                to="/admin/login"
                replace
                state={{
                    from: {
                        pathname:
                            location.pathname,

                        search:
                            location.search,

                        hash:
                            location.hash
                    }
                }}
            />
        );
    }

    if (
        !roles.includes(
            user.role
        )
    ) {
        return (
            <Navigate
                to={
                    getDefaultAdminRoute(
                        user.role
                    )
                }
                replace
            />
        );
    }

    return children;
}