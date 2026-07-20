import { createContext, useContext, useEffect, useState } from "react";

import {
    login as loginService,
    logout as logoutService,
    getCurrentUser
} from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    useEffect(() => {

        const currentUser = getCurrentUser();

        if (currentUser) {
            setUser(currentUser);
        }

    }, []);

    function login(username, password) {

        const user = loginService(username, password);

        if (!user) {
            return false;
        }

        setUser(user);

        return true;

    }

    function logout() {

        logoutService();

        setUser(null);

    }

    return (

        <AuthContext.Provider
            value={{
                user,
                login,
                logout
            }}
        >

            {children}

        </AuthContext.Provider>

    );

}

export function useAuth() {

    return useContext(AuthContext);

}