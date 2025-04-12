import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBuilderModelUrl } from '@/api/builderApi';
import { message } from 'antd';

const ARGoogleViewer = () => {
    const { builderId } = useParams();
    const navigate = useNavigate();
    const [modelData, setModelData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isARCoreSupported, setIsARCoreSupported] = useState(null);
    const [markersData, setMarkersData] = useState([]);
    const viewerRef = useRef(null);
    const containerRef = useRef(null);

    // 添加加载进度指示
    const [loadingProgress, setLoadingProgress] = useState(0);

    const fetchModelData = useCallback(async () => {
        try {
            setLoading(true);
            console.log(`[DEBUG] 获取模型数据, builderId: ${builderId}`);
            const response = await getBuilderModelUrl(builderId);
            console.log('[DEBUG] API 响应:', JSON.stringify(response, null, 2));

            if (response.code === 200 && response.data.model_url) {
                const originalUrl = response.data.model_url;
                console.log('[DEBUG] 原始模型URL:', originalUrl);

                // 这里可以根据您的实际环境调整URL
                // 针对移动设备使用外部可访问的URL
                const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                const fixedModelUrl = isLocalhost
                    ? originalUrl.replace('http://localhost:8005', 'http://10.157.69.198:8005')
                    : originalUrl;

                console.log('[DEBUG] 修正后的模型URL:', fixedModelUrl);

                // 检查模型文件是否可访问
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000);

                    const res = await fetch(fixedModelUrl, {
                        method: 'HEAD',
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);

                    if (!res.ok) {
                        throw new Error('模型文件不可访问');
                    }
                } catch (fetchErr) {
                    console.error('[DEBUG] 模型文件访问检查失败:', fetchErr);
                    throw new Error('模型文件不可访问: ' + fetchErr.message);
                }

                // 处理标记数据
                if (response.data.json) {
                    try {
                        const parsedMarkers = JSON.parse(response.data.json);
                        console.log('[DEBUG] 解析的标记数据:', parsedMarkers);
                        setMarkersData(parsedMarkers);
                    } catch (e) {
                        console.error('[DEBUG] 标记数据解析失败:', e);
                    }
                }

                setModelData({ ...response.data, model_url: fixedModelUrl });
                message.success('模型数据加载成功');
            } else {
                throw new Error('未找到模型文件');
            }
        } catch (err) {
            const errorMessage = err.message || '加载模型失败';
            setError(errorMessage);
            console.error('[DEBUG] 获取模型错误:', err);
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [builderId]);

    useEffect(() => {
        let mounted = true;

        // 检查ARCore和SceneViewer支持情况
        const checkARSupport = async () => {
            const isAndroid = /Android/i.test(navigator.userAgent);
            const isChrome = /Chrome/i.test(navigator.userAgent);
            console.log('[DEBUG] 设备User Agent:', navigator.userAgent);
            console.log('[DEBUG] 是否Android设备:', isAndroid);
            console.log('[DEBUG] 是否Chrome浏览器:', isChrome);

            if (!isAndroid) {
                if (mounted) {
                    setIsARCoreSupported(false);
                    message.warning('ARCore需要Android设备');
                }
                return;
            }

            // 检查WebXR支持（更现代的AR API）
            if (navigator.xr) {
                try {
                    const supported = await navigator.xr.isSessionSupported('immersive-ar');
                    console.log('[DEBUG] WebXR AR支持:', supported);
                    if (mounted) setIsARCoreSupported(supported);
                } catch (err) {
                    console.error('[DEBUG] WebXR检查错误:', err);
                    // 即使WebXR不支持，SceneViewer可能仍然可用
                    if (mounted) setIsARCoreSupported(isAndroid && isChrome);
                }
            } else {
                // 无WebXR API，但可能仍支持SceneViewer
                if (mounted) setIsARCoreSupported(isAndroid && isChrome);
            }
        };

        fetchModelData();
        checkARSupport();

        // 加载model-viewer组件脚本
        const loadModelViewerScript = () => {
            if (!document.querySelector('script[src*="model-viewer.min.js"]')) {
                const script = document.createElement('script');
                script.type = 'module';
                script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
                document.head.appendChild(script);

                script.onload = () => {
                    console.log('[DEBUG] model-viewer脚本加载完成');
                };

                script.onerror = (err) => {
                    console.error('[DEBUG] model-viewer脚本加载失败:', err);
                    if (mounted) setError('无法加载AR查看器组件');
                };
            }
        };

        loadModelViewerScript();

        return () => {
            mounted = false;
        };
    }, [fetchModelData]);

    // 处理model-viewer的进度事件
    const handleProgress = (event) => {
        const progress = event.detail.totalProgress;
        const progressPercent = Math.round(progress * 100);
        setLoadingProgress(progressPercent);
        console.log(`[DEBUG] 模型加载进度: ${progressPercent}%`);
    };

    // 处理AR会话开始
    const handleARActivate = (event) => {
        console.log('[DEBUG] ARCore会话已启动');
        message.success('ARCore已启动');
    };

    // 处理AR会话结束
    const handleARDeactivate = (event) => {
        console.log('[DEBUG] ARCore会话已结束');
    };

    // 处理模型加载完成
    const handleModelLoad = () => {
        console.log('[DEBUG] 模型加载完成');
        setLoadingProgress(100);

        // 如果有标记数据，可以将其添加到model-viewer的一些自定义属性中
        if (markersData.length > 0 && viewerRef.current) {
            console.log('[DEBUG] 应用标记数据到模型');
            // 可以在这里实现自定义标记处理逻辑
        }
    };

    // 处理模型加载错误
    const handleModelError = () => {
        console.error('[DEBUG] 模型加载错误');
        setError('模型加载失败');
        message.error('模型加载失败');
    };

    // 当SceneViewer不可用时，手动启动AR
    const handleManualAR = useCallback(() => {
        if (!modelData?.model_url) {
            console.log('[DEBUG] 没有可用的模型URL');
            message.warning('没有可用的模型URL');
            return;
        }

        try {
            // 构建SceneViewer的Intent URL
            const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(
                modelData.model_url
            )}&mode=ar_preferred&title=${encodeURIComponent(
                modelData.name || '3D模型'
            )}#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(
                window.location.href
            )};end;`;

            console.log('[DEBUG] 手动Intent URL:', intentUrl);
            message.info('正在启动AR查看器...');

            // 延迟一点点再跳转，让用户看到提示
            setTimeout(() => {
                window.location.href = intentUrl;
            }, 300);
        } catch (e) {
            console.error('[DEBUG] 启动SceneViewer失败:', e);
            message.error('启动AR查看器失败');
        }
    }, [modelData]);

    // 返回到模型查看器
    const handleReturnToViewer = () => {
        navigate(`/model/${builderId}`);
    };

    // 显示加载界面
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center bg-white p-8 rounded-lg shadow-md">
                    <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-700 text-lg mb-2">正在加载ARCore模式...</p>
                    <p className="text-gray-500 text-sm">请稍候，这可能需要一点时间</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4" ref={containerRef}>
            <h1 className="text-3xl font-bold mb-4">ARCore 查看器 - ID: {builderId}</h1>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                    <p className="text-red-500 mb-2">{error}</p>
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        onClick={fetchModelData}
                    >
                        重试加载
                    </button>
                </div>
            )}

            {modelData && !error && (
                <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
                    {loadingProgress < 100 && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-black bg-opacity-60 p-6 rounded-lg text-center">
                            <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-white text-lg mb-1">加载模型中...</p>
                            <p className="text-white">{loadingProgress}%</p>
                        </div>
                    )}

                    <model-viewer
                        ref={viewerRef}
                        src={modelData.model_url}
                        alt={modelData.name || '3D模型'}
                        ar
                        ar-modes="scene-viewer webxr quick-look"
                        ar-scale="auto"
                        camera-controls
                        auto-rotate
                        shadow-intensity="1"
                        exposure="1"
                        environment-image="neutral"
                        style={{ width: '100%', height: '70vh', backgroundColor: '#f5f5f5' }}
                        onprogress={handleProgress}
                        onar-status={handleARActivate}
                        onload={handleModelLoad}
                        onerror={handleModelError}
                    >
                        <button
                            slot="ar-button"
                            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-600 transition-colors shadow-lg"
                        >
                            在AR中查看
                        </button>
                    </model-viewer>

                    {/* 控制面板 */}
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex flex-wrap justify-center gap-4">
                            {isARCoreSupported === false && (
                                <button
                                    className="px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md flex items-center gap-2"
                                    onClick={handleManualAR}
                                >
                                    <span className="material-icons">view_in_ar</span>
                                    手动启动 AR
                                </button>
                            )}

                            <button
                                className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md flex items-center gap-2"
                                onClick={handleReturnToViewer}
                            >
                                <span className="material-icons">arrow_back</span>
                                返回常规查看器
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isARCoreSupported === false && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-4xl">
                    <div className="flex items-start gap-3">
                        <span className="material-icons text-yellow-500">warning</span>
                        <div>
                            <h3 className="font-semibold text-yellow-700 mb-1">AR兼容性提示</h3>
                            <p className="text-yellow-600 text-sm">
                                当前设备可能不支持 ARCore 或 Google Scene Viewer。
                                请确保您使用的是 Android 设备且安装了最新版本的
                                Google Play 服务（AR）和 Chrome 浏览器。
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* 标记数据信息面板（可选） */}
            {markersData.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-4xl">
                    <h3 className="font-semibold text-blue-700 mb-2">模型包含标记数据</h3>
                    <p className="text-blue-600 text-sm">
                        此模型包含 {markersData.length} 个部位标记。在Google的AR模式中，
                        您可以通过点击模型查看这些标记信息。
                    </p>
                </div>
            )}
        </div>
    );
};

export default ARGoogleViewer;