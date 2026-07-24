import {
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import Home from "@website/pages/Home";
import Contact from "@website/pages/Contact";
import NotFound from "@website/pages/NotFound";
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

import SettingsNavigationLayout from "@cms/modules/dashboard/admin/layouts/SettingsNavigationLayout";

import Dashboard from "@cms/modules/dashboard/admin/pages/Dashboard";
import Pages from "@cms/modules/dashboard/admin/pages/Pages";
import PageTrash from "@cms/modules/dashboard/admin/pages/PageTrash";
import PageEditor from "@cms/modules/dashboard/admin/pages/PageEditor";
import ContactInbox from "@cms/modules/dashboard/admin/pages/ContactInbox";
import SeoLegalCenter from "@cms/modules/dashboard/admin/pages/SeoLegalCenter";
import LegalPageSetup from "@cms/modules/dashboard/admin/pages/LegalPageSetup";
import HomeLayout from "@cms/modules/dashboard/admin/pages/HomeLayout";
import FooterSettings from "@cms/modules/dashboard/admin/pages/FooterSettings";
import Media from "@cms/modules/dashboard/admin/pages/Media";
import MediaMigration from "@cms/modules/dashboard/admin/pages/MediaMigration";
import Backups from "@cms/modules/dashboard/admin/pages/Backups";
import DataMigration from "@cms/modules/dashboard/admin/pages/DataMigration";
import AuditLog from "@cms/modules/dashboard/admin/pages/AuditLog";
import Users from "@cms/modules/dashboard/admin/pages/Users";
import Settings from "@cms/modules/dashboard/admin/pages/Settings";
import NavigationSync from "@cms/modules/dashboard/admin/pages/NavigationSync";

import PagePreview from "@cms/modules/pages/pages/PagePreview";
import WebsiteSectionEditor from "@cms/modules/pages/pages/WebsiteSectionEditor";

import SeoBoundary from "@shared/seo/SeoBoundary";

import {
    ADMIN_SEO_PAGE
} from "@shared/seo/siteSeo";

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

function AdminSeo({
    children
}) {
    return (
        <SeoBoundary
            page={
                ADMIN_SEO_PAGE
            }
            structuredData={[]}
            structuredDataScope="admin"
        >
            {
                children
            }
        </SeoBoundary>
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
                path="/kontakt"
                element={
                    <Contact />
                }
            />

            <Route
                path="/admin/login"
                element={
                    <AdminSeo>
                        <LoginPage />
                    </AdminSeo>
                }
            />

            <Route
                path="/admin/preview/:id"
                element={
                    <AdminSeo>
                        <ProtectedRoute>
                            <RoleRoute
                                roles={
                                    CONTENT_ROLES
                                }
                            >
                                <PagePreview />
                            </RoleRoute>
                        </ProtectedRoute>
                    </AdminSeo>
                }
            />

            <Route
                path="/admin"
                element={
                    <AdminSeo>
                        <ProtectedRoute>
                            <AdminLayout />
                        </ProtectedRoute>
                    </AdminSeo>
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
                    path="pages/trash"
                    element={
                        <RoleRoute
                            roles={
                                CONTENT_ROLES
                            }
                        >
                            <PageTrash />
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
                    path="contact"
                    element={
                        <RoleRoute
                            roles={
                                CONTENT_ROLES
                            }
                        >
                            <ContactInbox />
                        </RoleRoute>
                    }
                />

                <Route
                    path="seo"
                    element={
                        <RoleRoute
                            roles={
                                CONTENT_ROLES
                            }
                        >
                            <SeoLegalCenter />
                        </RoleRoute>
                    }
                />

                <Route
                    path="legal"
                    element={
                        <RoleRoute
                            roles={
                                CONTENT_ROLES
                            }
                        >
                            <LegalPageSetup />
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
                    path="audit"
                    element={
                        <RoleRoute
                            roles={
                                ADMINISTRATOR_ROLES
                            }
                        >
                            <AuditLog />
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
                            <SettingsNavigationLayout />
                        </RoleRoute>
                    }
                >
                    <Route
                        index
                        element={
                            <Settings />
                        }
                    />

                    <Route
                        path="navigation-sync"
                        element={
                            <NavigationSync />
                        }
                    />
                </Route>

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
                    <NotFound />
                }
            />
        </Routes>
    );
}
