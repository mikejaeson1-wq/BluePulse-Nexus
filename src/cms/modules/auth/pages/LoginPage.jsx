import "./LoginPage.css";

import {
    useState
} from "react";

import {
    Navigate,
    useLocation
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext";

function getDestination(
    location
) {
    const from =
        location.state?.from;

    if (
        !from ||
        typeof from !==
            "object"
    ) {
        return "/admin";
    }

    const pathname =
        String(
            from.pathname ??
            ""
        );

    if (
        !pathname.startsWith(
            "/admin"
        ) ||
        pathname ===
            "/admin/login"
    ) {
        return "/admin";
    }

    return [
        pathname,
        String(
            from.search ??
            ""
        ),
        String(
            from.hash ??
            ""
        )
    ].join("");
}

export default function LoginPage() {
    const location =
        useLocation();

    const {
        login,
        user,
        loading,
        authError
    } = useAuth();

    const [
        identifier,
        setIdentifier
    ] = useState("");

    const [
        password,
        setPassword
    ] = useState("");

    const [
        submitting,
        setSubmitting
    ] = useState(false);

    const [
        error,
        setError
    ] = useState("");

    const destination =
        getDestination(
            location
        );

    if (
        !loading &&
        user
    ) {
        return (
            <Navigate
                to={destination}
                replace
            />
        );
    }

    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        if (submitting) {
            return;
        }

        const normalizedIdentifier =
            identifier.trim();

        if (
            !normalizedIdentifier ||
            !password
        ) {
            setError(
                "Bitte gib deinen Benutzernamen und dein Passwort ein."
            );

            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const successful =
                await login(
                    normalizedIdentifier,
                    password
                );

            if (!successful) {
                setError(
                    "Benutzername, E-Mail-Adresse oder Passwort ist falsch."
                );
            }
        } catch (loginError) {
            if (
                loginError?.status ===
                401
            ) {
                setError(
                    "Benutzername, E-Mail-Adresse oder Passwort ist falsch."
                );
            } else {
                setError(
                    loginError.message ??
                    "Die Anmeldung ist fehlgeschlagen."
                );
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="login-page">
            <section
                className="login-card"
                aria-labelledby="login-title"
            >
                <div className="login-brand">
                    <div className="login-brand__icon">
                        <i
                            className="bi bi-water"
                            aria-hidden="true"
                        />
                    </div>

                    <div>
                        <span>
                            BluePulse
                        </span>

                        <strong>
                            Nexus
                        </strong>
                    </div>
                </div>

                <div className="login-heading">
                    <span className="login-eyebrow">
                        Geschützter CMS-Bereich
                    </span>

                    <h1 id="login-title">
                        Bei Nexus anmelden
                    </h1>

                    <p>
                        Melde dich mit deinem Benutzerkonto oder deiner
                        E-Mail-Adresse an.
                    </p>
                </div>

                {
                    loading ? (
                        <div
                            className="login-session-check"
                            role="status"
                        >
                            <div
                                className="spinner-border spinner-border-sm text-info"
                                aria-hidden="true"
                            />

                            <span>
                                Bestehende Sitzung wird geprüft …
                            </span>
                        </div>
                    ) : (
                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >
                            <label>
                                <span>
                                    Benutzername oder E-Mail-Adresse
                                </span>

                                <div className="login-input">
                                    <i
                                        className="bi bi-person"
                                        aria-hidden="true"
                                    />

                                    <input
                                        type="text"
                                        name="username"
                                        autoComplete="username"
                                        autoCapitalize="none"
                                        spellCheck="false"
                                        placeholder="admin"
                                        value={
                                            identifier
                                        }
                                        disabled={
                                            submitting
                                        }
                                        onChange={
                                            (
                                                event
                                            ) => {
                                                setIdentifier(
                                                    event
                                                        .target
                                                        .value
                                                );

                                                setError("");
                                            }
                                        }
                                    />
                                </div>
                            </label>

                            <label>
                                <span>
                                    Passwort
                                </span>

                                <div className="login-input">
                                    <i
                                        className="bi bi-lock"
                                        aria-hidden="true"
                                    />

                                    <input
                                        type="password"
                                        name="password"
                                        autoComplete="current-password"
                                        placeholder="Dein Passwort"
                                        value={
                                            password
                                        }
                                        disabled={
                                            submitting
                                        }
                                        onChange={
                                            (
                                                event
                                            ) => {
                                                setPassword(
                                                    event
                                                        .target
                                                        .value
                                                );

                                                setError("");
                                            }
                                        }
                                    />
                                </div>
                            </label>

                            {
                                (
                                    error ||
                                    authError
                                ) && (
                                    <div
                                        className="login-error"
                                        role="alert"
                                    >
                                        <i
                                            className="bi bi-exclamation-circle"
                                            aria-hidden="true"
                                        />

                                        <span>
                                            {
                                                error ||
                                                authError
                                            }
                                        </span>
                                    </div>
                                )
                            }

                            <button
                                type="submit"
                                disabled={
                                    submitting
                                }
                            >
                                {
                                    submitting ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm"
                                                aria-hidden="true"
                                            />

                                            Anmeldung läuft …
                                        </>
                                    ) : (
                                        <>
                                            Anmelden

                                            <i
                                                className="bi bi-arrow-right"
                                                aria-hidden="true"
                                            />
                                        </>
                                    )
                                }
                            </button>
                        </form>
                    )
                }

                <div className="login-security">
                    <i
                        className="bi bi-shield-lock"
                        aria-hidden="true"
                    />

                    <span>
                        Sichere serverseitige Sitzung mit HttpOnly-Cookie
                    </span>
                </div>
            </section>
        </main>
    );
}