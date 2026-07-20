import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({

    plugins: [

        react()

    ],

    resolve: {

        alias: {
            "@": path.resolve(__dirname, "./src"),

            "@assets": path.resolve(__dirname, "./src/assets"),

            "@cms": path.resolve(__dirname, "./src/cms"),

            "@website": path.resolve(__dirname, "./src/website"),

            "@shared": path.resolve(__dirname, "./src/shared")
        }

    }
        
});