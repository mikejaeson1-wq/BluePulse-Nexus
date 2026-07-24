import path from "node:path";

import react from "@vitejs/plugin-react";

import {
    defineConfig
} from "vitest/config";

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

    test: {
        environment:
            "jsdom",

        setupFiles: [
            "./src/test/setupTests.js"
        ],

        include: [
            "src/**/*.test.{js,jsx}"
        ],

        clearMocks:
            true,

        restoreMocks:
            true,

        mockReset:
            true,

        css:
            true
    }
});
