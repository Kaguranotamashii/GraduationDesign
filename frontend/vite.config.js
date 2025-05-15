import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

var url = 'https://192.168.60.81:8005';
// 将上面的url 8005变成5173
if (url.includes('8005')) {
    var url2 = url.replace('8005', '5173');
}


var url1 = url.replace(/^https?:\/\//, '');

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
        host: '0.0.0.0',
        https: {
            key: fs.readFileSync('./key.pem'),
            cert: fs.readFileSync('./cert.pem'),
        },
        proxy: {
            '/media': {
                target: url,
                changeOrigin: true,
                secure: false,
                configure: (proxy, options) => {
                    proxy.on('proxyReq', (proxyReq, req, res) => {
                        proxyReq.setHeader('Host', url1);
                    });
                },
            },
            '/app': {
                target: url,
                changeOrigin: true,
                secure: false,
                configure: (proxy, options) => {
                    proxy.on('proxyReq', (proxyReq, req, res) => {
                        proxyReq.setHeader('Origin',  url2);
                    });
                    proxy.on('proxyRes', (proxyRes, req, res) => {
                        proxyRes.headers['Access-Control-Allow-Origin'] =  url2;
                        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
                        proxyRes.headers['Access-Control-Allow-Headers'] = 'authorization, content-type, x-csrftoken, x-requested-with';
                    });
                },
            },
        },
    },
    publicDir: 'public',
});