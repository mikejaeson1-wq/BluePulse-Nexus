import { Routes, Route, Navigate } from "react-router-dom";

import Home from "@website/pages/Home";

import LoginPage from "@cms/modules/auth/pages/LoginPage";

import ProtectedRoute from "@cms/modules/auth/components/ProtectedRoute";

import AdminLayout from "@cms/modules/dashboard/admin/layouts/AdminLayout";

import Dashboard from "@cms/modules/dashboard/admin/pages/Dashboard";
import Pages from "@cms/modules/dashboard/admin/pages/Pages";
import PageEditor from "@cms/modules/dashboard/admin/pages/PageEditor";
import Media from "@cms/modules/dashboard/admin/pages/Media";
import Users from "@cms/modules/dashboard/admin/pages/Users";
import Settings from "@cms/modules/dashboard/admin/pages/Settings";

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
                    path="media"
                    element={<Media />}
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
                path="*"
                element={<Navigate to="/" replace />}
            />

        </Routes>

    );

}