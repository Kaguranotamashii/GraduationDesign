import apiClient from '../tools/apiClient';
import {message} from "antd"; // 引入封装好的 apiClient

/**
 * 获取用户列表
 * @returns {Promise<Object>} 用户列表数据
 */
export const getUserList = async () => {
    try {
        const response = await apiClient.get('/user/list/'); // 使用封装的 apiClient 发起 GET 请求
        console.log('User list fetched successfully:', response);
        return response; // apiClient 已在拦截器中处理返回的数据，只需直接返回
    } catch (error) {
        console.error('Error fetching user list:', error.message); // 打印错误日志
        throw error; // 抛出错误供调用方处理
    }
};

/**
 * 创建随机用户
 * @returns {Promise<Object>} 创建成功的用户信息
 */
export const addRandomUser = async () => {
    try {
        const response = await apiClient.post('/user/add-random/'); // 使用封装的 apiClient 发起 POST 请求
        console.log('Random user added successfully:', response);
        return response; // 返回创建的用户数据
    } catch (error) {
        console.error('Error adding random user:', error.message); // 打印错误日志
        throw error; // 抛出错误供调用方处理
    }
};

/**
 * 登录用户
 * @param {Object} loginData 登录数据，包含用户名和密码
 * @returns {Promise<Object>} 登录成功返回的用户信息
 */
export const loginUser = async (loginData) => {
    try {
        const response = await apiClient.post('/user/login/', loginData); // 发起登录请求
        console.log('User logged in successfully:', response);
        return response;
    } catch (error) {
        console.error('Error logging in user:', error.message); // 打印错误日志
        throw error;
    }
};


/**
 * 注册用户
 * @param {Object} registerData 注册数据，包含用户名、密码和邮箱
 * @returns {Promise<Object>} 注册成功返回的用户信息
 */
export const registerUser = async (registerData) => {
    try {
        console.log('Registering user:', registerData);
        const response = await apiClient.post('/user/register/', registerData); // 发起注册请求

        return response;
    } catch (error) {
        console.error('Error registering user:', error.message); // 打印错误日志
        throw error;
    }
};
/**
 * 登出用户
 * @returns {Promise<Object>} 登出成功消息
 */
export const logoutUser = async () => {
    try {
        const accessToken = localStorage.getItem('access_token'); // 从 localStorage 获取 token

        // 检查 access token 是否存在
        if (!accessToken) {
            message.error('Access token is missing');

        }

        console.log( accessToken )
        const response = await apiClient.post('/user/logout/', {}, {
            headers: {
                Authorization: `Bearer ${accessToken}`, // 添加 Authorization 头
            },
        });

        localStorage.removeItem('access_token');
        localStorage.removeItem('username');
        localStorage.removeItem('avatar_url')

        // console.log('User logged out successfully:', response);
        return response;
    } catch (error) {
        console.error('Error logging out user:', error.message); // 打印错误日志
        throw error; // 抛出错误供调用方处理
    }
};


/**
 * 上传图片
 * @param {Object} imageData 图片数据
 * @returns {Promise<Object>} 上传成功返回的图片信息
 */
export const uploadImage = async (imageData) => {
    try {
        const response = await apiClient.post('/user/upload-avatar/', imageData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('Response data from backend:', response);  // 打印完整的响应内容
        return response;  // 直接返回整个响应对象

    } catch (error) {
        console.error('Error uploading image:', error.message);
        throw error;  // 抛出错误供调用方处理
    }
};
