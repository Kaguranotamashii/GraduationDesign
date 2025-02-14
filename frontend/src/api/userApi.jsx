import apiClient from '../utils/apiClient';
import {message} from "antd"; // 引入封装好的 apiClient
//src/api/user.js
/**注册用户
 * @param {Object} registerData 注册数据，包含用户名、密码和邮箱
 *
 * */
export const registerUser = async (registerData) => {
    console.log(registerData)
    try {
        const response = await apiClient.post('/user/register/', registerData);
        return response.data;
    } catch (error) {
        // message.error('注册失败');
        throw error;
    }
}

/*邮箱验证码
 * @param {Object} emailData 邮箱数据，包含邮箱
 *
 * */
export const sendVerificationEmail = async (emailData) => {

    try {
        console.log(emailData)
        const response = await apiClient.post('/user/send-verification-email/', emailData);
        return response;
    } catch (error) {
        // message.error('发送验证码失败');
        throw error;
    }
}


/**
 *  登录用户
 * @param {Object} loginData 登录数据，包含用户名和密码
 *
 */
export const loginUser = async (loginData) => {
    try {
        const response = await apiClient.post('/user/login/', loginData);
        return response.data;
    } catch (error) {
        // message.error('登录失败');
        throw error;
    }
}


/**登出用户
 * @param {Object} logoutData 登出数据，包含用户名
 *
 * */
export const logoutUser = async (logoutData) => {

    try {
        const response = await apiClient.post('/user/logout', logoutData);
        return response.data;
    } catch (error) {
        // message.error('登出失败');
        throw error;
    }


}
/**
 * Google登录
 * @param {string} credential Google返回的ID token
 */
export const googleLogin = async (credential) => {
    try {
        const response = await apiClient.post('/user/google-login/', {credential});
        return response.data;
    } catch (error) {
        // message.error('Google登录失败');
        throw error;
    }
}

export const getUserInfo = async () => {
    try {
        const response = await apiClient.get('/user/current-user/');
        return response.data;
    } catch (error) {
        // message.error('获取用户信息失败');
        throw error;
    }
}


export const uploadAvatar = async (avatar) => {
    try {
        const formData = new FormData();
        formData.append('avatar', avatar);
        const response = await apiClient.post('/user/avatar/upload/', formData);
        return response.data;
    } catch (error) {
        // message.error('上传头像失败');
        throw error;
    }
}
export const updateUserProfile = async (profileData) => {
    try {
        const response = await apiClient.post('/user/profile/update/', profileData);
        return response.data;
    } catch (error) {
        // message.error('更新用户资料失败');
        throw error;
    }
}


export const changePassword = async (passwordData) => {
    try {
        const response = await apiClient.post('/user/password/change/', passwordData);
        return response.data;
    } catch (error) {
        // message.error('修改密码失败');
        throw error;
    }
}



// 管理员获取用户列表（支持分页和搜索）
export const getAdminUserList = async (params) => {
    try {
        const { page = 1, pageSize = 10, search = '' } = params;
        const response = await apiClient.get('/user/admin/users/', {
            params: {
                page,
                page_size: pageSize,
                search
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 管理员更新用户信息
export const updateUserByAdmin = async (userId, userData) => {
    try {
        const response = await apiClient.put(`/user/admin/users/${userId}/`, userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 管理员删除用户
export const deleteUserByAdmin = async (userId) => {
    try {
        const response = await apiClient.delete(`/user/admin/users/${userId}/delete/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 管理员重置用户密码
export const resetUserPasswordByAdmin = async (userId, newPassword) => {
    try {
        const response = await apiClient.post(`/user/admin/users/${userId}/reset-password/`, {
            new_password: newPassword
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};