import "./AdminLayout.css";

import { Outlet, NavLink } from "react-router-dom";

import { useAuth } from "@cms/modules/auth/context/AuthContext";

export default function AdminLayout() {

    const { user, logout } = useAuth();

    return (

        <div className="bp-layout">

            <aside className="bp-sidebar">

                <div className="bp-logo">

                    <h2>BluePulse Nexus</h2>

                    <span>Version 0.1 Alpha</span>

                </div>

                <nav className="bp-nav">

                    <NavLink
                        to="/admin"
                        end
                    >
                        🏠 Dashboard
                    </NavLink>

                    <NavLink to="/admin/pages">

                        📄 Seiten

                    </NavLink>

                    <NavLink to="/admin/media">

                        🖼 Medien

                    </NavLink>

                    <NavLink to="/admin/users">

                        👥 Benutzer

                    </NavLink>

                    <NavLink to="/admin/settings">

                        ⚙ Einstellungen

                    </NavLink>

                </nav>

                <div className="bp-user">

                    <strong>

                        {user?.name}

                    </strong>

                    <small>

                        {user?.role}

                    </small>

                    <button
                        type="button"
                        onClick={logout}
                    >

                        Logout

                    </button>

                </div>

            </aside>

            <main className="bp-content">

                <Outlet />

            </main>

        </div>

    );

}