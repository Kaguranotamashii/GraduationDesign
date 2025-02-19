// src/components/ErrorBoundary/NotFound.jsx
import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import MainLayout from "@/layout/MainLayout.jsx";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <MainLayout>
        <Result
            status="404"
            title="404"
            subTitle="对不起，您访问的页面不存在。"
            extra={
                <Button type="primary" onClick={() => navigate('/')}>
                    返回首页
                </Button>
            }
        />
        </MainLayout>
    );
};

export default NotFound;
