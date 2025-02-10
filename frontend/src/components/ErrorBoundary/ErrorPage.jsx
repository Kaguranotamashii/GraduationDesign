// src/components/ErrorBoundary/ErrorPage.jsx
import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate, useRouteError } from 'react-router-dom';

const ErrorPage = () => {
    const error = useRouteError();
    const navigate = useNavigate();

    return (
        <Result
            status="error"
            title="出错了"
            subTitle={error?.message || "抱歉，页面发生了一些错误。"}
            extra={[
                <Button type="primary" key="home" onClick={() => navigate('/')}>
                    返回首页
                </Button>,
                <Button key="retry" onClick={() => window.location.reload()}>
                    重试
                </Button>,
            ]}
        />
    );
};

export default ErrorPage;