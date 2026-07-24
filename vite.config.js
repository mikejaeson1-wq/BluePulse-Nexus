import {
    defineConfig
} from "vite";

import react from "@vitejs/plugin-react";

import path from "path";

const API_PROXY = {
    target:
        "http://127.0.0.1:3001",

    changeOrigin:
        true
};

export default defineConfig({
    plugins: [
        react()
    ],

    resolve: {
        alias: {
            "@":
                path.resolve(
                    __dirname,
                    "./src"
                ),

            "@assets":
                path.resolve(
                    __dirname,
                    "./src/assets"
                ),

            "@cms":
                path.resolve(
                    __dirname,
                    "./src/cms"
                ),

            "@website":
                path.resolve(
                    __dirname,
                    "./src/website"
                ),

            "@shared":
                path.resolve(
                    __dirname,
                    "./src/shared"
                )
        }
    },

    server: {
        proxy: {
            "/api":
                API_PROXY,

            "/robots.txt":
                API_PROXY,

            "/sitemap.xml":
                API_PROXY
        }
    },

    preview: {
        proxy: {
            "/api":
                API_PROXY,

            "/robots.txt":
                API_PROXY,

            "/sitemap.xml":
                API_PROXY
        }
    }
});
