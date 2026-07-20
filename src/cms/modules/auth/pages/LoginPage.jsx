import { useState } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "./LoginPage.css";

export default function LoginPage() {

    const { login, user } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    if (user) {
        return <Navigate to="/admin" replace />;
    }

    function handleSubmit(e) {

        e.preventDefault();

        const success = login(username, password);

        if (!success) {

            setError("Benutzername oder Passwort ist falsch.");

            return;

        }

    }

    return (

        <div className="login-page">

            <div className="login-card">

                <h1>BluePulse Nexus</h1>

                <p>
                    Bitte melde dich an.
                </p>

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        placeholder="Benutzername"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Passwort"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {
                        error &&
                        <div className="login-error">
                            {error}
                        </div>
                    }

                    <button type="submit">

                        Login

                    </button>

                </form>

            </div>

        </div>

    );

}