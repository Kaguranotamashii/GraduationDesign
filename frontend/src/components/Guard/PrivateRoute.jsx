// src/components/Guard/PrivateRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';

const PrivateRoute = ({ children }) => {
    const { token, isAuthenticated, user } = useSelector((state) => state.auth);
    const location = useLocation();

    // 添加加载状态检查
    const isPersisting = useSelector((state) => state._persist?.rehydrated === false);

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
    console.log('PrivateRoute' ,isAuthenticated )
    console.log('PrivateRoute' ,token)
    console.log('PrivateRoute' ,user)
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

    // 检查用户信息是否完整
    if (!user) {
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

    return children;
};

export default PrivateRoute;