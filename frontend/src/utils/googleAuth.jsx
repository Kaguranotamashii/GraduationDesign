// src/utils/googleAuth.js
import { googleLogin } from '../api/userApi';
import { message } from 'antd';

export const initializeGoogleAuth = () => {
    return new Promise((resolve) => {
        window.google.accounts.id.initialize({
            client_id: ' ',
            callback: handleGoogleResponse,
        });
        resolve();
    });
};

const handleGoogleResponse = async (response) => {
    try {
        const result = await googleLogin(response.credential);

        if (result.code === 200) {
            // 登录成功，存储token等信息
            localStorage.setItem('token', result.data.access_token);
            window.location.href = '/'; // 或者使用 router 导航
        }
    } catch (error) {
        console.error('Google login error:', error);
    }
};

export const renderGoogleButton = (buttonRef) => {
    window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        width: '100%',
    });
};