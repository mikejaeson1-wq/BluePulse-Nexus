import "@cms/modules/dashboard/admin/layouts/AdminLayout.css";

import {
    NavLink,
    Outlet
} from "react-router-dom";

import {
    useAuth
} from "@cms/modules/auth/context/AuthContext";

const NAVIGATION_ITEMS = [
    {
        to: "/admin",
        end: true,
        icon: "bi-speedometer2",
        label: "Dashboard"
    },
    {
        to: "/admin/pages",
        icon: "bi-file-earmark-text",
        label: "Seiten"
    },
    {
        to: "/admin/home-layout",
        icon: "bi-grid-1x2",
        label: "Startseiten-Layout"
    },
    {
        to: "/admin/footer",
        icon: "bi-layout-text-window-reverse",
        label: "Footer"
    },
    {
        to: "/admin/media",
        icon: "bi-images",
        label: "Medien"
    },
    {
        to: "/admin/media-migration",
        icon: "bi-cloud-arrow-up",
        label: "Medienmigration"
    },
    {
        to: "/admin/backups",
        icon: "bi-cloud-arrow-down",
        label: "Sicherungen"
    },
    {
        to: "/admin/data-migration",
        icon: "bi-database-up",
        label: "Datenmigration"
    },
    {
        to: "/admin/users",
        icon: "bi-people",
        label: "Benutzer"
    },
    {
        to: "/admin/settings",
        icon: "bi-gear",
        label: "Einstellungen"
    }
];

export default function AdminLayout() {
    const {
        user,
        logout
    } = useAuth();

    return (
        <div className="bp-layout">
            <aside className="bp-sidebar">
                <div className="bp-logo">
                    <div className="bp-logo__mark">
                        <i
                            className="bi bi-water"
                            aria-hidden="true"
                        />
                    </div>

                    <div>
                        <h2>
                            BluePulse Nexus
                        </h2>

                        <span>
                            Version 0.3 Alpha
                        </span>
                    </div>
                </div>

                <nav
                    className="bp-nav"
                    aria-label="Nexus-Navigation"
                >
                    {
                        NAVIGATION_ITEMS.map(
                            (item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                >
                                    <i
                                        className={
                                            `bi ${item.icon}`
                                        }
                                        aria-hidden="true"
                                    />

                                    <span>
                                        {item.label}
                                    </span>
                                </NavLink>
                            )
                        )
                    }
                </nav>

                <div className="bp-user">
                    <div className="bp-user__avatar">
                        <i
                            className="bi bi-person"
                            aria-hidden="true"
                        />
                    </div>

                    <div className="bp-user__information">
                        <strong>
                            {
                                user?.name ??
                                "Administrator"
                            }
                        </strong>

                        <small>
                            {
                                user?.role ??
                                "Administrator"
                            }
                        </small>
                    </div>

                    <button
                        type="button"
                        className="bp-user__logout"
                        onClick={logout}
                        aria-label="Abmelden"
                        title="Abmelden"
                    >
                        <i
                            className="bi bi-box-arrow-right"
                            aria-hidden="true"
                        />
                    </button>
                </div>
            </aside>

            <main className="bp-content">
                <Outlet />
            </main>
        </div>
    );
}