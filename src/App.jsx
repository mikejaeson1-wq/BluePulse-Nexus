import {
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import Home from "@website/pages/Home";
import PublishedPage from "@website/pages/PublishedPage";

import LoginPage from "@cms/modules/auth/pages/LoginPage";

import ProtectedRoute from "@cms/modules/auth/components/ProtectedRoute";

import AdminLayout from "@cms/modules/dashboard/admin/layouts/AdminLayout";

import Dashboard from "@cms/modules/dashboard/admin/pages/Dashboard";
import Pages from "@cms/modules/dashboard/admin/pages/Pages";
import PageEditor from "@cms/modules/dashboard/admin/pages/PageEditor";
import HomeLayout from "@cms/modules/dashboard/admin/pages/HomeLayout";
import FooterSettings from "@cms/modules/dashboard/admin/pages/FooterSettings";
import Media from "@cms/modules/dashboard/admin/pages/Media";
import Backups from "@cms/modules/dashboard/admin/pages/Backups";
import DataMigration from "@cms/modules/dashboard/admin/pages/DataMigration";
import Users from "@cms/modules/dashboard/admin/pages/Users";
import Settings from "@cms/modules/dashboard/admin/pages/Settings";

import PagePreview from "@cms/modules/pages/pages/PagePreview";
import WebsiteSectionEditor from "@cms/modules/pages/pages/WebsiteSectionEditor";

export default function App() {
    return (
        <Routes>
            <Route
                path="/"
                element={<Home />}
            />

            <Route
                path="/admin/login"
                element={<LoginPage />}
            />

            <Route
                path="/admin/preview/:id"
                element={
                    <ProtectedRoute>
                        <PagePreview />
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
                    element={<Dashboard />}
                />

                <Route
                    path="pages"
                    element={<Pages />}
                />

                <Route
                    path="pages/:id"
                    element={<PageEditor />}
                />

                <Route
                    path="website/:sectionId"
                    element={
                        <WebsiteSectionEditor />
                    }
                />

                <Route
                    path="home-layout"
                    element={<HomeLayout />}
                />

                <Route
                    path="footer"
                    element={<FooterSettings />}
                />

                <Route
                    path="media"
                    element={<Media />}
                />

                <Route
                    path="backups"
                    element={<Backups />}
                />

                <Route
                    path="data-migration"
                    element={<DataMigration />}
                />

                <Route
                    path="users"
                    element={<Users />}
                />

                <Route
                    path="settings"
                    element={<Settings />}
                />
            </Route>

            <Route
                path="/:slug"
                element={<PublishedPage />}
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