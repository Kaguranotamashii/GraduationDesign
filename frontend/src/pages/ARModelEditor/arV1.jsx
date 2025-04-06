import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBuilderModelUrl } from '@/api/builderApi'; // 导入 API 函数

const ARViewer = () => {
    const { builderId } = useParams(); // 从 URL 中获取 builderId
    const [modelData, setModelData] = useState(null); // 存储模型数据
    const [loading, setLoading] = useState(true); // 加载状态
    const [error, setError] = useState(null); // 错误状态

    // 在组件加载时调用 API 获取模型数据
    useEffect(() => {
        const fetchModelData = async () => {
            try {
                setLoading(true);
                const response = await getBuilderModelUrl(builderId); // 调用 API
                if (response.code === 200) {
                    setModelData(response.data); // 存储返回的数据
                } else {
                    throw new Error('无法获取模型数据');
                }
            } catch (err) {
                setError(err.message || '加载模型失败');
                console.error('Error fetching model data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (builderId) {
            fetchModelData();
        }
    }, [builderId]); // 依赖 builderId，当它变化时重新加载

    // 渲染加载中状态
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>加载模型中...</p>
            </div>
        );
    }

    // 渲染错误状态
    if (error) {
        return (
            <div className="flex items-center justify-center h-screen text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    // 渲染 AR 页面内容
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <h1 className="text-3xl font-bold mb-4">AR 模式 - 建筑物 ID: {builderId}</h1>
            {modelData && (
                <div className="text-center">
                    <p className="text-lg mb-2">模型名称: {modelData.name || '未知'}</p>
                    <p className="text-lg mb-4">模型地址: {modelData.model_url || '无'}</p>
                    {modelData.model_url ? (
                        <div>
                            <p className="mb-2">AR 体验（开发中）:</p>
                            {/* 这里可以嵌入 AR 渲染逻辑，例如使用 Three.js 或其他 AR 库 */}
                            <div className="bg-white p-4 rounded-lg shadow-md">
                                <p>此处将展示 {builderId} 的 AR 模型</p>
                                <p>模型 URL: {modelData.model_url}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-red-500">未找到模型文件</p>
                    )}
                </div>
            )}
            <button
                className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => window.history.back()}
            >
                返回
            </button>
        </div>
    );
};

export default ARViewer;