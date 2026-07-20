import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";

import LoginPage from "./features/auth/pages/LoginPage";

import ProtectedRoute from "./features/auth/components/ProtectedRoute";

import AdminLayout from "./features/admin/layouts/AdminLayout";

import Dashboard from "./features/admin/pages/Dashboard";
import Pages from "./features/admin/pages/Pages";
import PageEditor from "./features/admin/pages/PageEditor";
import Media from "./features/admin/pages/Media";
import Users from "./features/admin/pages/Users";
import Settings from "./features/admin/pages/Settings";

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