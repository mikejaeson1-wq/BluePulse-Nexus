import "./ProtectedRoute.css";

import {
    Navigate,
    useLocation
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext";

export default function ProtectedRoute({
    children
}) {
    const location =
        useLocation();

    const {
        user,
        loading
    } = useAuth();

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
                    Nexus-Sitzung wird geprüft …
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

    return children;
}