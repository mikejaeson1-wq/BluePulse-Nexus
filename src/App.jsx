import {
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import Home from "@website/pages/Home";
import PublishedPage from "@website/pages/PublishedPage";

import LoginPage from "@cms/modules/auth/pages/LoginPage";

import ProtectedRoute from "@cms/modules/auth/components/ProtectedRoute";

import RoleRoute, {
    CMS_ROLES,
    getDefaultAdminRoute
} from "@cms/modules/auth/components/RoleRoute";

import {
    useAuth
} from "@cms/modules/auth/context/AuthContext";

import AdminLayout from "@cms/modules/dashboard/admin/layouts/AdminLayout";

import Dashboard from "@cms/modules/dashboard/admin/pages/Dashboard";
import Pages from "@cms/modules/dashboard/admin/pages/Pages";
import PageEditor from "@cms/modules/dashboard/admin/pages/PageEditor";
import HomeLayout from "@cms/modules/dashboard/admin/pages/HomeLayout";
import FooterSettings from "@cms/modules/dashboard/admin/pages/FooterSettings";
import Media from "@cms/modules/dashboard/admin/pages/Media";
import MediaMigration from "@cms/modules/dashboard/admin/pages/MediaMigration";
import Backups from "@cms/modules/dashboard/admin/pages/Backups";
import DataMigration from "@cms/modules/dashboard/admin/pages/DataMigration";
import Users from "@cms/modules/dashboard/admin/pages/Users";
import Settings from "@cms/modules/dashboard/admin/pages/Settings";

import PagePreview from "@cms/modules/pages/pages/PagePreview";
import WebsiteSectionEditor from "@cms/modules/pages/pages/WebsiteSectionEditor";

const CONTENT_ROLES = [
    CMS_ROLES.ADMINISTRATOR,
    CMS_ROLES.EDITOR
];

const ALL_CMS_ROLES = [
    CMS_ROLES.ADMINISTRATOR,
    CMS_ROLES.EDITOR,
    CMS_ROLES.MEDIA_MANAGER
];

const ADMINISTRATOR_ROLES = [
    CMS_ROLES.ADMINISTRATOR
];

function AdminFallback() {
    const {
        user
    } =
        useAuth();

    return (
        <Navigate
            to={
                getDefaultAdminRoute(
                    user?.role
                )
            }
            replace
        />
    );
}

export default function App() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <Home />
                }
            />

            <Route
                path="/admin/login"
                element={
                    <LoginPage />
                }
            />

            <Route
                path="/admin/preview/:id"
                element={
                    <ProtectedRoute>
                        <RoleRoute
                            roles={
                                CONTENT_ROLES
                            }
                        >
                            <PagePreview />
                        </RoleRoute>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin"
                element={
                    <ProtectedRoute>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route
                    index
                    element={
                        <RoleRoute
                            roles={
                                CONTENT_ROLES
                            }
                        >
                            <Dashboard />
                        </RoleRoute>
                    }
                />

                <Route
                    path="pages"
                    element={
                        <RoleRoute
                            roles={
                                CONTENT_ROLES
                            }
                        >
                            <Pages />
                        </RoleRoute>
                    }
                />

                <Route
                    path="pages/:id"
                    element={
                        <RoleRoute
                            roles={
                                CONTENT_ROLES
                            }
                        >
                            <PageEditor />
                        </RoleRoute>
                    }
                />

                <Route
                    path="website/:sectionId"
                    element={
                        <RoleRoute
                            roles={
                                CONTENT_ROLES
                            }
                        >
                            <WebsiteSectionEditor />
                        </RoleRoute>
                    }
                />

                <Route
                    path="home-layout"
                    element={
                        <RoleRoute
                            roles={
                                CONTENT_ROLES
                            }
                        >
                            <HomeLayout />
                        </RoleRoute>
                    }
                />

                <Route
                    path="footer"
                    element={
                        <RoleRoute
                            roles={
                                CONTENT_ROLES
                            }
                        >
                            <FooterSettings />
                        </RoleRoute>
                    }
                />

                <Route
                    path="media"
                    element={
                        <RoleRoute
                            roles={
                                ALL_CMS_ROLES
                            }
                        >
                            <Media />
                        </RoleRoute>
                    }
                />

                <Route
                    path="media-migration"
                    element={
                        <RoleRoute
                            roles={
                                ADMINISTRATOR_ROLES
                            }
                        >
                            <MediaMigration />
                        </RoleRoute>
                    }
                />

                <Route
                    path="backups"
                    element={
                        <RoleRoute
                            roles={
                                CONTENT_ROLES
                            }
                        >
                            <Backups />
                        </RoleRoute>
                    }
                />

                <Route
                    path="data-migration"
                    element={
                        <RoleRoute
                            roles={
                                ADMINISTRATOR_ROLES
                            }
                        >
                            <DataMigration />
                        </RoleRoute>
                    }
                />

                <Route
                    path="users"
                    element={
                        <RoleRoute
                            roles={
                                ADMINISTRATOR_ROLES
                            }
                        >
                            <Users />
                        </RoleRoute>
                    }
                />

                <Route
                    path="settings"
                    element={
                        <RoleRoute
                            roles={
                                CONTENT_ROLES
                            }
                        >
                            <Settings />
                        </RoleRoute>
                    }
                />

                <Route
                    path="*"
                    element={
                        <AdminFallback />
                    }
                />
            </Route>

            <Route
                path="/:slug"
                element={
                    <PublishedPage />
                }
            />

            <Route
                path="*"
                element={
                    <Navigate
                        to="/"
                        replace
                    />
                }
            />
        </Routes>
    );
}