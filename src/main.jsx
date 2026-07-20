import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import "./website/styles/globals.css";

import App from "./App.jsx";

import { AuthProvider } from "@cms/modules/auth/context/AuthContext";
import { MediaProvider } from "@cms/modules/media/store/MediaStore";

import "@shared/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")).render(

    <React.StrictMode>

        <BrowserRouter>

            <AuthProvider>

                <MediaProvider>

                    <App />

                </MediaProvider>

            </AuthProvider>

        </BrowserRouter>

    </React.StrictMode>

);