import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

var url = 'https://10.157.69.198:8005';
// 去掉https://
var url1  = url.replace(/^https?:\/\//, '');

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
                secure: false,  // 忽略证书验证
                // 添加 HTTPS 请求配置
                configure: (proxy, options) => {
                    proxy.on('proxyReq', (proxyReq, req, res) => {
                        proxyReq.setHeader('Host', 'urls1');
                    });
                },
            },
            '/app': {
                target: url,
                changeOrigin: true,
                secure: false,
            },
        },
    },
    publicDir: 'public',
});