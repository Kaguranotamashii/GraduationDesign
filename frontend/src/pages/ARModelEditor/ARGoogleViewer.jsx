import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBuilderModelUrl } from '@/api/builderApi';

const ARGoogleViewer = () => {
    const { builderId } = useParams();
    const navigate = useNavigate();
    const [modelData, setModelData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isARCoreSupported, setIsARCoreSupported] = useState(null);

    // 获取模型数据并调试 URL
    useEffect(() => {
        const fetchModelData = async () => {
            try {
                setLoading(true);
                console.log(`[DEBUG] Fetching model data for builderId: ${builderId}`);
                const response = await getBuilderModelUrl(builderId);
                console.log('[DEBUG] API Response:', JSON.stringify(response, null, 2));

                if (response.code === 200 && response.data.model_url) {
                    const originalUrl = response.data.model_url;
                    console.log('[DEBUG] Original Model URL:', originalUrl);

                    // 替换 localhost 为局域网 IP
                    const fixedModelUrl = originalUrl.replace('http://localhost:8005', 'http://10.157.69.198:8005');
                    console.log('[DEBUG] Fixed Model URL:', fixedModelUrl);

                    // 测试 URL 是否可访问
                    console.log('[DEBUG] Testing URL accessibility...');
                    fetch(fixedModelUrl, { method: 'HEAD' })
                        .then((res) => {
                            console.log('[DEBUG] URL Accessibility:', res.ok ? 'Success' : 'Failed', `Status: ${res.status}`);
                        })
                        .catch((err) => {
                            console.error('[DEBUG] URL Test Failed:', err.message);
                        });

                    setModelData({ ...response.data, model_url: fixedModelUrl });
                } else {
                    throw new Error('未找到模型文件');
                }
            } catch (err) {
                setError(err.message || '加载模型失败');
                console.error('[DEBUG] Error fetching model:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchModelData();
    }, [builderId]);

    // 检查 ARCore 支持并调试
    useEffect(() => {
        const checkARSupport = async () => {
            const isAndroid = /Android/i.test(navigator.userAgent);
            console.log('[DEBUG] Device User Agent:', navigator.userAgent);
            console.log('[DEBUG] Is Android:', isAndroid);

            if (isAndroid && navigator.xr) {
                console.log('[DEBUG] Checking WebXR support...');
                try {
                    const supported = await navigator.xr.isSessionSupported('immersive-ar');
                    console.log('[DEBUG] WebXR AR Supported:', supported);
                    setIsARCoreSupported(supported);
                } catch (err) {
                    console.error('[DEBUG] WebXR Check Error:', err);
                    setIsARCoreSupported(false);
                }
            } else {
                console.log('[DEBUG] Not an Android device or no WebXR support');
                setIsARCoreSupported(false);
            }
        };

        checkARSupport();
    }, []);

    // 处理 AR 激活事件
    const handleARActivate = () => {
        console.log('[DEBUG] ARCore mode activated via Scene Viewer');
    };

    // 处理加载进度
    const handleProgress = (event) => {
        const progress = event.detail.totalProgress;
        console.log(`[DEBUG] Model loading progress: ${(progress * 100).toFixed(2)}%`);
    };

    // 手动触发 Scene Viewer 并调试
    const handleManualAR = () => {
        if (modelData?.model_url) {
            const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(
                modelData.model_url
            )}&mode=ar_preferred#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(
                modelData.model_url
            )};end;`;
            console.log('[DEBUG] Manual Intent URL:', intentUrl);
            window.location.href = intentUrl;
        } else {
            console.log('[DEBUG] No model URL available for manual AR');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <h1 className="text-3xl font-bold mb-4">ARCore Viewer - ID: {builderId}</h1>

            {loading && <p className="text-gray-600">加载模型中...</p>}

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {modelData && (
                <div className="w-full max-w-4xl">
                    <model-viewer
                        src={modelData.model_url}
                        alt={modelData.name || '3D Model'}
                        ar
                        ar-modes="scene-viewer webxr quick-look"
                        camera-controls
                        auto-rotate
                        shadow-intensity="1"
                        exposure="1"
                        environment-image="neutral"
                        style={{ width: '100%', height: '70vh', backgroundColor: '#fff' }}
                        onar-sessionstart={handleARActivate}
                        onprogress={handleProgress}
                    >
                        <button
                            slot="ar-button"
                            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            使用 ARCore 查看
                        </button>
                    </model-viewer>

                    {isARCoreSupported === false && (
                        <div className="mt-4 text-center">
                            <p className="text-yellow-600 mb-2">
                                当前设备可能不支持 ARCore 或 WebXR。请确保使用 Android 设备并安装 Google Play 服务（AR）。
                            </p>
                            <button
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                onClick={handleManualAR}
                            >
                                手动启动 ARCore（Scene Viewer）
                            </button>
                        </div>
                    )}
                </div>
            )}

            <button
                className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => navigate(`/model/${builderId}`)}
            >
                返回模型查看器
            </button>
        </div>
    );
};

export default ARGoogleViewer;