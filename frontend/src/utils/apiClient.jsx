// apiClient.js - 修改版本
import axios from 'axios';
import { message } from 'antd';

import {clearAuth} from "../store/authSlice";
import {store} from "../store/store"; // 直接导入 store

// 创建 Axios 实例
const apiClient = axios.create({
    baseURL: 'http://localhost:8005/app',
    timeout: 20000,
    withCredentials: true,
});

// 请求拦截器
apiClient.interceptors.request.use(
    (config) => {
        // 直接从 store 获取当前状态
        const token = store.getState().auth.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('请求错误:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器保持不变
apiClient.interceptors.response.use(
    (response) => {
        if (response.data.code === 200) {
            // message.success(response.data.message);
        }

        return response;
    },
    (error) => {
        if (error.response) {
            const errorMessage = error.response.data.message || '未知错误';
            switch (error.response.status) {
                case 400:
                    message.error(`请求参数错误: ${errorMessage}`);
                    break;
                case 401:
                    message.error(`未授权: ${errorMessage}`);
                    store.dispatch(clearAuth()); // 使用 store.dispatch
                    window.location.href = '/login';
                    break;
                case 403:
                    message.error(`无权限访问: ${errorMessage}`);
                    break;
                case 404:
                    message.error(`资源未找到: ${errorMessage}`);
                    break;
                case 500:
                    message.error(`服务器错误: ${errorMessage}`);
                    break;
                default:
                    message.error(`发生错误: ${errorMessage}`);
            }
        } else {
            message.error('网络请求失败，请检查网络连接');
        }
        return Promise.reject(error);
    }
);

export default apiClient;