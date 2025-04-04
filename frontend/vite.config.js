import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import tailwindcss from '@tailwindcss/vite'
import path from "path"

var url = 'http://10.157.248.175:8005'

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
            key: fs.readFileSync('./key.pem'),
            cert: fs.readFileSync('./cert.pem')
        },
        proxy: {
            '/media': {
                target: url,
                changeOrigin: true,
                secure: false
            },
            '/app': {
                target: url,
                changeOrigin: true,
                secure: false
            },

        }
    },
    publicDir: 'public',
});