import axios from 'axios';
import { message } from 'antd'; // 引入 Ant Design 的消息组件

// 创建 Axios 实例
const apiClient = axios.create({
    baseURL: 'http://localhost:8005/app', // 后端接口地址
    timeout: 20000, // 请求超时时间
    withCredentials: true, // 允许携带跨域凭证
});

/**
 * 请求拦截器
 * 在请求发送前统一处理请求配置
 */
apiClient.interceptors.request.use(
    (config) => {
        // 从 localStorage 中获取 access_token
        const accessToken = localStorage.getItem('access_token');

        // 如果 access_token 不存在，清除相关用户信息
        if (!accessToken) {
            localStorage.removeItem('username');
            localStorage.removeItem('access_token');
            localStorage.removeItem('avatar_url');
        }

        // 如果 access_token 存在，将其添加到请求头中
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => {
        // 请求错误处理
        message.error('Request error');
        return Promise.reject(error);
    }
);

/**
 * 响应拦截器
 * 在响应返回后统一处理响应数据
 */
apiClient.interceptors.response.use(
    (response) => {
        const { code, message: msg, ...rest } = response.data;

        // 如果状态码为 0，表示请求成功
        if (code === 0) {
            message.success(msg); // 显示成功提示
            return rest; // 返回响应体的其他部分
        } else {
            // 如果状态码不为 0，表示请求失败
            message.error(msg || 'An unknown error occurred'); // 显示错误提示
            return Promise.reject(new Error(msg || 'An unknown error occurred')); // 抛出错误
        }
    },
    (error) => {
        // 响应错误处理
        if (error.response && error.response.status === 401) {
            // 401 错误：未授权或 token 失效
            localStorage.removeItem('username');
            localStorage.removeItem('access_token');
            localStorage.removeItem('avatar_url'); // 清除用户信息

            window.location.href = '/'; // 重定向到登录页面
            message.error('Session expired. Please log in again.'); // 提示用户重新登录
        } else {
            // 其他错误（如网络错误）
            message.error('Network error, please try again later.'); // 显示网络错误提示
        }

        return Promise.reject(error); // 抛出错误
    }
);

export default apiClient; // 导出封装后的 Axios 实例