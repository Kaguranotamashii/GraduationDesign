import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { message, Spin } from 'antd';

const AdminRoute = ({ children }) => {
    const { token, isAuthenticated, user } = useSelector((state) => state.auth);
    const location = useLocation();

    // 添加加载状态检查
    const isPersisting = useSelector((state) => state._persist?.rehydrated === false);

    useEffect(() => {
        // 如果用户已登录但token失效，显示提示消息
        if (!isAuthenticated && !token && user) {
            message.error('登录已过期，请重新登录');
        }
    }, [isAuthenticated, token, user]);

    // 如果还在恢复持久化数据，显示加载状态
    if (isPersisting) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Spin size="large" tip="加载中..." />
            </div>
        );
    }

    // 未登录或 token 失效时重定向到登录页
    if (!isAuthenticated || !token) {
        return (
            <Navigate
                to="/auth"
                state={{ from: location.pathname }}
                replace
            />
        );
    }

    // 检查用户信息是否完整并且是否为对象
    if (!user || typeof user !== 'object') {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Spin size="large" tip="正在获取用户信息..." />
            </div>
        );
    }

    // 用户信息校验
    const requiredFields = ['id', 'username', 'email', 'is_staff'];
    const missingFields = requiredFields.filter(field => !(field in user));

    if (missingFields.length > 0) {
        message.error('用户信息不完整，请重新登录');
        return (
            <Navigate
                to="/auth"
                state={{ from: location.pathname }}
                replace
            />
        );
    }

    return children;
};

export default AdminRoute;