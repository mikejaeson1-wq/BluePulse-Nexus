import "@cms/modules/dashboard/admin/layouts/AdminLayout.css";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    NavLink,
    Outlet,
    useLocation
} from "react-router-dom";

import {
    useAuth
} from "@cms/modules/auth/context/AuthContext";

import {
    getContactOverview
} from "@shared/contact/contactService";

const ADMINISTRATOR =
    "administrator";

const EDITOR =
    "editor";

const MEDIA_MANAGER =
    "media_manager";

const CONTENT_ROLES = [
    ADMINISTRATOR,
    EDITOR
];

const ALL_ROLES = [
    ADMINISTRATOR,
    EDITOR,
    MEDIA_MANAGER
];

const NAVIGATION_ITEMS = [
    {
        to:
            "/admin",

        end:
            true,

        icon:
            "bi-speedometer2",

        label:
            "Dashboard",

        roles:
            CONTENT_ROLES
    },
    {
        to:
            "/admin/pages",

        end:
            true,

        icon:
            "bi-file-earmark-text",

        label:
            "Seiten",

        roles:
            CONTENT_ROLES
    },
    {
        to:
            "/admin/pages/trash",

        end:
            true,

        icon:
            "bi-trash3",

        label:
            "Papierkorb",

        roles:
            CONTENT_ROLES
    },
    {
        to:
            "/admin/contact",

        end:
            true,

        icon:
            "bi-envelope-heart",

        label:
            "Kontaktanfragen",

        badge:
            "contactUnread",

        roles:
            CONTENT_ROLES
    },
    {
        to:
            "/admin/home-layout",

        end:
            true,

        icon:
            "bi-grid-1x2",

        label:
            "Startseiten-Layout",

        roles:
            CONTENT_ROLES
    },
    {
        to:
            "/admin/footer",

        end:
            true,

        icon:
            "bi-layout-text-window-reverse",

        label:
            "Footer",

        roles:
            CONTENT_ROLES
    },
    {
        to:
            "/admin/media",

        end:
            true,

        icon:
            "bi-images",

        label:
            "Medien",

        roles:
            ALL_ROLES
    },
    {
        to:
            "/admin/media-migration",

        end:
            true,

        icon:
            "bi-cloud-arrow-up",

        label:
            "Medienmigration",

        roles: [
            ADMINISTRATOR
        ]
    },
    {
        to:
            "/admin/backups",

        end:
            true,

        icon:
            "bi-cloud-arrow-down",

        label:
            "Sicherungen",

        roles:
            CONTENT_ROLES
    },
    {
        to:
            "/admin/data-migration",

        end:
            true,

        icon:
            "bi-database-up",

        label:
            "Datenmigration",

        roles: [
            ADMINISTRATOR
        ]
    },
    {
        to:
            "/admin/audit",

        end:
            true,

        icon:
            "bi-clock-history",

        label:
            "Aktivitäten",

        roles: [
            ADMINISTRATOR
        ]
    },
    {
        to:
            "/admin/users",

        end:
            true,

        icon:
            "bi-people",

        label:
            "Benutzer",

        roles: [
            ADMINISTRATOR
        ]
    },
    {
        to:
            "/admin/settings",

        end:
            true,

        icon:
            "bi-gear",

        label:
            "Einstellungen",

        roles:
            CONTENT_ROLES
    },
    {
        to:
            "/admin/settings/navigation-sync",

        end:
            true,

        icon:
            "bi-diagram-3",

        label:
            "Navigationsprüfung",

        roles:
            CONTENT_ROLES
    }
];

export default function AdminLayout() {
    const {
        user,
        logout,
        loggingOut
    } =
        useAuth();

    const location =
        useLocation();

    const [
        contactUnread,
        setContactUnread
    ] =
        useState(0);

    const visibleNavigationItems =
        useMemo(
            () =>
                NAVIGATION_ITEMS.filter(
                    (item) =>
                        item.roles.includes(
                            user?.role
                        )
                ),
            [
                user?.role
            ]
        );

    useEffect(() => {
        if (
            !CONTENT_ROLES.includes(
                user?.role
            )
        ) {
            setContactUnread(0);

            return undefined;
        }

        let active =
            true;

        async function loadContactBadge() {
            try {
                const overview =
                    await getContactOverview();

                if (active) {
                    setContactUnread(
                        overview.unread
                    );
                }
            } catch {
                if (active) {
                    setContactUnread(0);
                }
            }
        }

        loadContactBadge();

        const intervalId =
            globalThis.setInterval(
                loadContactBadge,
                60000
            );

        return () => {
            active =
                false;

            globalThis.clearInterval(
                intervalId
            );
        };
    }, [
        location.pathname,
        user?.role
    ]);

    function getBadgeValue(
        item
    ) {
        if (
            item.badge ===
            "contactUnread"
        ) {
            return contactUnread;
        }

        return 0;
    }

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
                        visibleNavigationItems.map(
                            (item) => {
                                const badgeValue =
                                    getBadgeValue(
                                        item
                                    );

                                return (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.end}
                                    >
                                        <i
                                            className={`bi ${item.icon}`}
                                            aria-hidden="true"
                                        />

                                        <span className="bp-nav__label">
                                            {item.label}
                                        </span>

                                        {
                                            badgeValue > 0 && (
                                                <span
                                                    className="bp-nav__badge"
                                                    aria-label={`${badgeValue} ungelesene Kontaktanfragen`}
                                                >
                                                    {
                                                        badgeValue > 99
                                                            ? "99+"
                                                            : badgeValue
                                                    }
                                                </span>
                                            )
                                        }
                                    </NavLink>
                                );
                            }
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
                                user?.displayName ??
                                user?.name ??
                                user?.username ??
                                "Nexus-Benutzer"
                            }
                        </strong>

                        <small>
                            {
                                user?.roleLabel ??
                                user?.role ??
                                "Benutzer"
                            }
                        </small>
                    </div>

                    <button
                        type="button"
                        className="bp-user__logout"
                        disabled={loggingOut}
                        onClick={logout}
                        aria-label="Abmelden"
                        title={
                            loggingOut
                                ? "Abmeldung läuft"
                                : "Abmelden"
                        }
                    >
                        {
                            loggingOut ? (
                                <span
                                    className="spinner-border spinner-border-sm"
                                    aria-hidden="true"
                                />
                            ) : (
                                <i
                                    className="bi bi-box-arrow-right"
                                    aria-hidden="true"
                                />
                            )
                        }
                    </button>
                </div>
            </aside>

            <main className="bp-content">
                <Outlet />
            </main>
        </div>
    );
}
