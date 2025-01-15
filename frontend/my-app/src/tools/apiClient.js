
import axios from 'axios';
import { message } from 'antd'; // Ant Design 的消息组件

// 创建 Axios 实例
const apiClient = axios.create({
    baseURL: 'http://localhost:8005/app', // 后端接口地址
    timeout: 20000,
    withCredentials: true,
});

// 请求拦截器
apiClient.interceptors.request.use(
    (config) => {
        // 在请求头中添加 Token
        const accessToken = localStorage.getItem('access_token');
        if (accessToken === null){
            localStorage.removeItem('username');
            localStorage.removeItem('access_token');
            localStorage.removeItem('avatar_url')

        }
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        // 请求错误
        message.error('Request error');
        return Promise.reject(error);
    }
);
// 响应拦截器
apiClient.interceptors.response.use(
    (response) => {
        const { code, message: msg, ...rest } = response.data;

        if (code === 0) {
            // 如果状态码是成功，直接返回响应数据
            message.success(msg);

            // 返回响应体的其他部分，避免每次修改拦截器
            return rest;  // 动态返回响应的所有内容
        } else {
            // 如果状态码是错误，显示错误提示
            message.error(msg || 'An unknown error occurred');
            return Promise.reject(new Error(msg || 'An unknown error occurred'));
        }
    },
    (error) => {
        // 检查是否是 401 错误
        if (error.response && error.response.status === 401) {
            // 清除 localStorage 和状态
            localStorage.removeItem('username');
            localStorage.removeItem('access_token');
            localStorage.removeItem('avatar_url')

            // 重定向到登录页面
            // window.location.href = '/login'; // 根据实际情况调整重定向路径

            // 显示错误提示
            message.error('Session expired. Please log in again.');
        } else {
            // 网络错误或其他错误
            message.error('Network error, please try again later.');
        }
        return Promise.reject(error);
    }
);


export default apiClient;