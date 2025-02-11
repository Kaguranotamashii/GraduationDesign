import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import tailwindcss from '@tailwindcss/vite'
import path from "path"

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),

    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        https: {
            key: fs.readFileSync('./key.pem'),  // 确保路径正确
            cert: fs.readFileSync('./cert.pem') // 确保路径正确
        },
    },

});
