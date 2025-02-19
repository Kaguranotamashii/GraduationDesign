import React, { useState, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { getModelDetails } from '@/api/builderApi';
import { getUserInfo } from "@/api/userApi";
import { Button, Result } from "antd";
import NotFound from '@/components/ErrorBoundary/NotFound';

const PrivateBuilderEditRoute = ({ children }) => {
    const { builderId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const response = await getModelDetails(builderId);
                const currentUser = await getUserInfo();

                if (response.code === 200) {
                    const isCreator = response.data.creator === currentUser.data.id;
                    const isAdmin = currentUser.data.is_staff;
                    setHasPermission(isCreator || isAdmin);
                } else {
                    setError(response.message || '无法获取模型信息');
                }
            } catch (err) {
                if (err.response?.status === 404) {
                    setNotFound(true);
                } else if (err.response?.status === 403) {
                    setError('无权限访问');
                } else {
                    setError('检查权限时发生错误');
                }
            } finally {
                setLoading(false);
            }
        };

        checkAccess();
    }, [builderId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (notFound) {
        return <NotFound />;
    }

    if (error) {
        return (
            <Result
                status="error"
                title="出错了"
                subTitle={error}
                extra={[
                    <Button type="primary" key="home" onClick={() => window.location.href = '/'}>
                        返回首页
                    </Button>,
                    <Button key="retry" onClick={() => window.location.reload()}>
                        重试
                    </Button>,
                ]}
            />
        );
    }

    if (!hasPermission) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default PrivateBuilderEditRoute;