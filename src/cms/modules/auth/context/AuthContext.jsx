import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    getCurrentUser,
    login as loginService,
    logout as logoutService
} from "../services/authService";

const AuthContext =
    createContext(null);

export function AuthProvider({
    children
}) {
    const [
        user,
        setUser
    ] = useState(null);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        loggingOut,
        setLoggingOut
    ] = useState(false);

    const [
        authError,
        setAuthError
    ] = useState("");

    const refreshSession =
        useCallback(
            async ({
                signal,
                showLoading = true
            } = {}) => {
                if (showLoading) {
                    setLoading(true);
                }

                setAuthError("");

                try {
                    const currentUser =
                        await getCurrentUser({
                            signal
                        });

                    if (
                        signal?.aborted
                    ) {
                        return null;
                    }

                    setUser(
                        currentUser
                    );

                    return currentUser;
                } catch (error) {
                    if (
                        error?.name ===
                            "AbortError" ||
                        signal?.aborted
                    ) {
                        return null;
                    }

                    setUser(null);

                    setAuthError(
                        error.message ??
                        "Die Nexus-Sitzung konnte nicht geprüft werden."
                    );

                    return null;
                } finally {
                    if (
                        !signal?.aborted
                    ) {
                        setLoading(false);
                    }
                }
            },
            []
        );

    useEffect(() => {
        const controller =
            new AbortController();

        refreshSession({
            signal:
                controller.signal
        });

        return () => {
            controller.abort();
        };
    }, [
        refreshSession
    ]);

    const login =
        useCallback(
            async (
                identifier,
                password
            ) => {
                setAuthError("");

                try {
                    const authenticatedUser =
                        await loginService(
                            identifier,
                            password
                        );

                    if (
                        !authenticatedUser
                    ) {
                        setUser(null);

                        return false;
                    }

                    setUser(
                        authenticatedUser
                    );

                    return true;
                } catch (error) {
                    setUser(null);

                    setAuthError(
                        error.message ??
                        "Die Anmeldung ist fehlgeschlagen."
                    );

                    throw error;
                }
            },
            []
        );

    const logout =
        useCallback(
            async () => {
                if (loggingOut) {
                    return;
                }

                setLoggingOut(true);
                setAuthError("");

                try {
                    await logoutService();
                } catch (error) {
                    setAuthError(
                        error.message ??
                        "Die Abmeldung konnte nicht vollständig abgeschlossen werden."
                    );
                } finally {
                    setUser(null);
                    setLoggingOut(false);
                }
            },
            [
                loggingOut
            ]
        );

    const contextValue =
        useMemo(
            () => ({
                user,

                authenticated:
                    Boolean(user),

                loading,
                loggingOut,
                authError,

                login,
                logout,
                refreshSession
            }),
            [
                user,
                loading,
                loggingOut,
                authError,
                login,
                logout,
                refreshSession
            ]
        );

    return (
        <AuthContext.Provider
            value={
                contextValue
            }
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context =
        useContext(
            AuthContext
        );

    if (!context) {
        throw new Error(
            "useAuth muss innerhalb des AuthProvider verwendet werden."
        );
    }

    return context;
}