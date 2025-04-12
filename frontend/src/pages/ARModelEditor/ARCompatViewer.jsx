import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getBuilderModelUrl } from '@/api/builderApi';
import * as ARThreex from '../../lib/ar-threex.mjs';
import { message } from 'antd';

const ARCompatViewer = () => {
    const { builderId } = useParams();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [markersData, setMarkersData] = useState([]);
    const [activeMarker, setActiveMarker] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [modelScale, setModelScale] = useState(1.0);

    // 创建引用来保存Three.js对象
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const arToolkitSourceRef = useRef(null);
    const arToolkitContextRef = useRef(null);
    const markerRootRef = useRef(null);
    const modelRef = useRef(null);
    const tooltipRef = useRef(null);

    // 创建提示容器用于显示部位信息
    useEffect(() => {
        tooltipRef.current = document.createElement('div');
        tooltipRef.current.style.cssText = `
            position: absolute;
            padding: 8px 12px;
            background: rgba(0, 0, 0, 0.75);
            color: white;
            border-radius: 4px;
            font-size: 14px;
            pointer-events: none;
            display: none;
            z-index: 1000;
            max-width: 300px;
            word-wrap: break-word;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(tooltipRef.current);

        return () => {
            if (tooltipRef.current && tooltipRef.current.parentNode) {
                tooltipRef.current.parentNode.removeChild(tooltipRef.current);
            }
        };
    }, []);

    const onResize = () => {
        if (arToolkitSourceRef.current) {
            arToolkitSourceRef.current.onResizeElement();
            if (rendererRef.current) {
                arToolkitSourceRef.current.copyElementSizeTo(rendererRef.current.domElement);
            }
            if (arToolkitContextRef.current && arToolkitContextRef.current.arController !== null) {
                arToolkitSourceRef.current.copyElementSizeTo(arToolkitContextRef.current.arController.canvas);
            }
        }
        if (cameraRef.current) {
            cameraRef.current.aspect = window.innerWidth / window.innerHeight;
            cameraRef.current.updateProjectionMatrix();
        }
        if (rendererRef.current) {
            rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        }
        console.log('解析的标记数据:', markersData);
    };

    // 处理模型点击事件，显示部位信息
    const handleModelClick = (event) => {
        if (!modelRef.current || !markersData.length) return;

        // 计算鼠标在归一化设备坐标中的位置
        const rect = rendererRef.current.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // 使用射线检测与模型的交叉
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, cameraRef.current);

        // 收集模型中的所有网格
        const meshes = [];
        modelRef.current.traverse((child) => {
            if (child.isMesh) {
                meshes.push(child);
            }
        });

        const intersects = raycaster.intersectObjects(meshes, true);

        if (intersects.length > 0) {
            const intersect = intersects[0];
            const faceIndex = intersect.faceIndex;

            // 查找包含此面的标记
            const foundMarker = markersData.find(marker =>
                marker.faces && marker.faces.includes(faceIndex)
            );

            if (foundMarker) {
                showPartInfo(foundMarker, event);
                highlightPart(foundMarker);
                setActiveMarker(foundMarker);
            } else {
                hidePartInfo();
                clearHighlight();
                setActiveMarker(null);
            }
        } else {
            hidePartInfo();
            clearHighlight();
            setActiveMarker(null);
        }



    };

    // 显示部位信息提示框
    const showPartInfo = (marker, event) => {
        if (!tooltipRef.current) return;

        tooltipRef.current.style.display = 'block';
        tooltipRef.current.innerHTML = `
            <div style="margin-bottom: 8px;"><strong>位置信息：</strong></div>
            <div>${marker.description}</div>
        `;

        // 计算提示框位置
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        let left = event.clientX + 10;
        let top = event.clientY + 10;

        // 边界检查
        if (left + tooltipRect.width > window.innerWidth) {
            left = event.clientX - tooltipRect.width - 10;
        }
        if (top + tooltipRect.height > window.innerHeight) {
            top = event.clientY - tooltipRect.height - 10;
        }

        tooltipRef.current.style.left = `${left}px`;
        tooltipRef.current.style.top = `${top}px`;
    };

    // 隐藏提示框
    const hidePartInfo = () => {
        if (tooltipRef.current) {
            tooltipRef.current.style.display = 'none';
        }
    };

    // 高亮显示选中的部位
    const highlightPart = (marker) => {
        if (!modelRef.current) return;

        // 先重置所有材质
        clearHighlight();

        // 查找需要高亮的所有网格
        modelRef.current.traverse((child) => {
            if (child.isMesh) {
                const geometry = child.geometry;
                if (!geometry.index) return;

                // 存储原始材质以便后续恢复
                if (!child.userData.originalMaterial) {
                    child.userData.originalMaterial = child.material;
                }

                // 如果需要，创建材质数组
                if (!Array.isArray(child.material)) {
                    child.material = [child.userData.originalMaterial.clone()];
                    child.material[0] = child.userData.originalMaterial.clone();
                }

                // 添加高亮材质
                const highlightMaterial = child.userData.originalMaterial.clone();
                highlightMaterial.color.setHex(0x00ff00);
                highlightMaterial.transparent = true;
                highlightMaterial.opacity = 0.8;
                child.material.push(highlightMaterial);

                // 为原始和高亮部分设置组
                geometry.clearGroups();
                geometry.addGroup(0, geometry.index.count, 0); // 默认材质

                // 为高亮面添加组
                if (marker.faces && marker.faces.length) {
                    const sortedIndices = [...marker.faces].sort((a, b) => a - b);
                    let start = sortedIndices[0] * 3;
                    let count = 3;

                    for (let i = 1; i < sortedIndices.length; i++) {
                        if (sortedIndices[i] === sortedIndices[i - 1] + 1) {
                            count += 3;
                        } else {
                            geometry.addGroup(start, count, 1); // 高亮材质
                            start = sortedIndices[i] * 3;
                            count = 3;
                        }
                    }
                    geometry.addGroup(start, count, 1); // 添加最后一组
                }
            }
        });
    };

    // 清除所有高亮显示
    const clearHighlight = () => {
        if (!modelRef.current) return;

        modelRef.current.traverse((child) => {
            if (child.isMesh && child.userData.originalMaterial) {
                child.material = child.userData.originalMaterial;
                if (child.geometry) {
                    child.geometry.clearGroups();
                    if (child.geometry.index) {
                        child.geometry.addGroup(0, child.geometry.index.count, 0);
                    }
                }
            }
        });
    };

    useEffect(() => {
        if (!containerRef.current || !builderId) return;

        const initScene = async () => {
            try {
                setLoading(true);

                // 获取模型URL和标记数据
                const response = await getBuilderModelUrl(builderId);
                if (response.code !== 200 || !response.data.model_url) {
                    throw new Error('未找到模型文件');
                }

                // 尝试解析标记数据
                if (response.data.json) {
                    try {
                        const parsedMarkers = JSON.parse(response.data.json);
                        setMarkersData(parsedMarkers);
                    } catch (e) {
                        console.error('标记数据解析失败:', e);
                    }
                }

                // 创建场景、相机和渲染器
                const scene = new THREE.Scene();
                sceneRef.current = scene;

                const camera = new THREE.PerspectiveCamera(
                    75,
                    window.innerWidth / window.innerHeight,
                    0.1,
                    1000
                );
                cameraRef.current = camera;

                const renderer = new THREE.WebGLRenderer({
                    antialias: true,
                    alpha: true,
                    preserveDrawingBuffer: true
                });
                rendererRef.current = renderer;

                renderer.setClearColor(0x000000, 0);
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.domElement.style.position = 'absolute';
                renderer.domElement.style.top = '0';
                renderer.domElement.style.left = '0';
                renderer.domElement.style.width = '100%';
                renderer.domElement.style.height = '100%';
                renderer.domElement.style.zIndex = '2';
                containerRef.current.appendChild(renderer.domElement);

                // 添加点击事件监听器到渲染器
                renderer.domElement.addEventListener('click', handleModelClick);

                // 添加光照
                scene.add(new THREE.AmbientLight(0xffffff, 0.7));
                const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
                directionalLight.position.set(5, 5, 5);
                scene.add(directionalLight);

                // 初始化AR工具包源
                const arToolkitSource = new ARThreex.ArToolkitSource({
                    sourceType: 'webcam',
                    sourceWidth: window.innerWidth,
                    sourceHeight: window.innerHeight,
                    displayWidth: window.innerWidth,
                    displayHeight: window.innerHeight,
                });
                arToolkitSourceRef.current = arToolkitSource;

                await new Promise((resolve, reject) => {
                    arToolkitSource.init(() => {
                        try {
                            // 设置视频元素
                            const videoElement = arToolkitSource.domElement;
                            videoElement.setAttribute('playsinline', '');
                            videoElement.setAttribute('autoplay', '');
                            videoElement.setAttribute('webkit-playsinline', '');
                            videoElement.muted = true;

                            // 确保视频元素在渲染器下方
                            containerRef.current.appendChild(videoElement);
                            videoElement.style.position = 'absolute';
                            videoElement.style.top = '0';
                            videoElement.style.left = '0';
                            videoElement.style.width = '100%';
                            videoElement.style.height = '100%';
                            videoElement.style.zIndex = '1';
                            videoElement.style.objectFit = 'cover';

                            console.log('AR Toolkit Source 初始化成功');

                            // 尝试播放视频
                            videoElement.play().then(() => {
                                console.log('视频开始播放');
                                onResize();
                                resolve();
                            }).catch((err) => {
                                console.error('视频播放失败:', err);
                                // 尝试再次播放
                                setTimeout(() => {
                                    videoElement.play().then(() => {
                                        console.log('视频延迟播放成功');
                                        onResize();
                                        resolve();
                                    }).catch(e => {
                                        reject(new Error('视频播放失败: ' + e.message));
                                    });
                                }, 1000);
                            });
                        } catch (err) {
                            reject(new Error('视频源初始化失败: ' + err.message));
                        }
                    });
                });

                // 初始化AR上下文
                const arToolkitContext = new ARThreex.ArToolkitContext({
                    cameraParametersUrl: '/camera_para.dat',
                    detectionMode: 'mono',
                    maxDetectionRate: 60,
                    canvasWidth: window.innerWidth,
                    canvasHeight: window.innerHeight,
                });
                arToolkitContextRef.current = arToolkitContext;

                // 添加全屏变化监听器
                const handleResize = () => {
                    if (document.fullscreenElement) {
                        // 全屏状态下调整尺寸
                        if (arToolkitSource) {
                            arToolkitSource.onResizeElement();
                            arToolkitSource.copyElementSizeTo(renderer.domElement);
                            if (arToolkitSource.domElement) {
                                arToolkitSource.domElement.style.width = '100%';
                                arToolkitSource.domElement.style.height = '100%';
                            }
                        }
                        if (renderer) {
                            renderer.setSize(window.innerWidth, window.innerHeight);
                        }
                        if (camera) {
                            camera.aspect = window.innerWidth / window.innerHeight;
                            camera.updateProjectionMatrix();
                        }
                    }
                };

                document.addEventListener('fullscreenchange', handleResize);

                await new Promise((resolve, reject) => {
                    arToolkitContext.init(() => {
                        try {
                            camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
                            console.log('AR Toolkit Context 初始化成功');
                            resolve();
                        } catch (err) {
                            reject(new Error('AR 上下文初始化失败: ' + err.message));
                        }
                    });
                });

                // 创建标记根节点
                const markerRoot = new THREE.Group();
                markerRootRef.current = markerRoot;
                scene.add(markerRoot);

                // 设置标记控制器
                const markerControls = new ARThreex.ArMarkerControls(arToolkitContext, markerRoot, {
                    type: 'pattern',
                    patternUrl: '/patt.hiro',
                    changeMatrixMode: 'modelViewMatrix'
                });

                markerControls.addEventListener('markerFound', () => {
                    console.log('标记被检测到！');
                    // message.success('AR标记检测成功！');
                });

                markerControls.addEventListener('markerLost', () => {
                    console.log('标记丢失');
                    hidePartInfo();
                });

                // 加载3D模型
                const loader = new GLTFLoader();
                await new Promise((resolve, reject) => {
                    loader.load(
                        response.data.model_url,
                        (gltf) => {
                            const model = gltf.scene;
                            modelRef.current = model;

                            // 调整模型到合适大小
                            const box = new THREE.Box3().setFromObject(model);
                            const size = box.getSize(new THREE.Vector3());
                            const baseScale = 0.5 / Math.max(size.x, size.y, size.z);
                            // 应用当前缩放比例
                            const finalScale = baseScale * modelScale;
                            model.scale.set(finalScale, finalScale, finalScale);
                            model.position.y = 0;

                            // 将模型添加到标记根节点
                            markerRoot.add(model);
                            console.log('模型加载成功');
                            resolve();
                        },
                        (xhr) => {

                        },
                        (err) => {
                            reject(new Error('模型加载失败: ' + err.message));
                        }
                    );
                });

                // 动画循环
                const animate = () => {
                    requestAnimationFrame(animate);

                    if (arToolkitSource.ready !== false) {
                        arToolkitContext.update(arToolkitSource.domElement);
                    }

                    renderer.render(scene, camera);
                };

                animate();
                window.addEventListener('resize', onResize);

                // 添加点击事件用于iOS设备触发
                document.addEventListener('click', () => {
                    if (arToolkitSource.domElement && arToolkitSource.domElement.play) {
                        arToolkitSource.domElement.play();
                    }
                }, { once: true });

                setLoading(false);
            } catch (err) {
                setError(err.message);
                console.error('初始化错误:', err);
                setLoading(false);
            }
        };

        initScene();

        return () => {
            // 清理事件监听器
            window.removeEventListener('resize', onResize);
            if (rendererRef.current?.domElement) {
                rendererRef.current.domElement.removeEventListener('click', handleModelClick);
            }

            // 清理Three.js资源
            if (arToolkitSourceRef.current && arToolkitSourceRef.current.domElement) {
                arToolkitSourceRef.current.domElement.remove();
            }

            if (rendererRef.current) {
                rendererRef.current.dispose();
                if (rendererRef.current.domElement && rendererRef.current.domElement.parentNode) {
                    rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
                }
            }

            // 清理模型资源
            if (modelRef.current) {
                modelRef.current.traverse((child) => {
                    if (child.isMesh) {
                        if (child.geometry) {
                            child.geometry.dispose();
                        }
                        if (Array.isArray(child.material)) {
                            child.material.forEach(material => material.dispose());
                        } else if (child.material) {
                            child.material.dispose();
                        }
                    }
                });
            }

            // 确保退出全屏
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => {
                    console.error(`退出全屏错误: ${err.message}`);
                });
            }
        };
    }, [builderId]);

    // 处理全屏切换
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            // 进入全屏模式
            containerRef.current.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(err => {
                console.error(`全屏错误: ${err.message}`);
            });
        } else {
            // 退出全屏模式
            document.exitFullscreen().then(() => {
                setIsFullscreen(false);
            }).catch(err => {
                console.error(`退出全屏错误: ${err.message}`);
            });
        }
    };

    // 缩放模型大小
    const scaleModel = (scaleFactor) => {
        // 更新状态以保持当前缩放值
        setModelScale(prevScale => {
            const newScale = prevScale * scaleFactor;
            // 限制缩放范围，防止模型过大或过小
            if (newScale < 0.2) return 0.2;
            if (newScale > 5.0) return 5.0;
            return newScale;
        });

        // 直接应用到当前模型
        if (modelRef.current) {
            const currentScale = modelRef.current.scale.x;
            const newScale = currentScale * scaleFactor;

            // 限制缩放范围
            if (newScale < 0.1 || newScale > 10.0) return;

            modelRef.current.scale.multiplyScalar(scaleFactor);
        }
    };

    // 监听全屏状态变化
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // 监听缩放变化，更新模型大小
    useEffect(() => {
        if (modelRef.current) {
            const box = new THREE.Box3().setFromObject(modelRef.current);
            const size = box.getSize(new THREE.Vector3());
            const baseScale = 0.5 / Math.max(size.x, size.y, size.z);
            const finalScale = baseScale * modelScale;

            // 应用新的缩放比例
            modelRef.current.scale.set(finalScale, finalScale, finalScale);
        }
    }, [modelScale]);

    return (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'min-h-screen'} flex flex-col items-center justify-center`}>
            {!isFullscreen && <h1 className="text-3xl font-bold mb-4">AR 兼容模式 - ID: {builderId}</h1>}

            {loading && (
                <div className="text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-white">加载模型中...</p>
                </div>
            )}
            {error && <p className="text-red-500 absolute top-10 left-1/2 transform -translate-x-1/2 z-30">{error}</p>}

            {/* AR 操作指引 */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-black bg-opacity-50 p-2 rounded text-white text-center">
                <p>将相机对准<a href="/hiro.png" target="_blank" className="text-blue-300 underline">Hiro 标记</a>，点击模型部位查看标记</p>
                <p className="text-xs mt-1">使用界面下方的 + / - 按钮调整模型大小</p>
                {activeMarker && (
                    <div className="mt-2 p-2 bg-green-900 rounded">
                        <p><strong>当前选中:</strong> {activeMarker.description}</p>
                    </div>
                )}
            </div>

            <div
                ref={containerRef}
                className={`relative ${isFullscreen ? 'w-full h-full' : 'w-full h-[70vh]'}`}
                style={{ overflow: 'hidden' }}
            />

            <div className={`flex gap-2 ${isFullscreen ? 'absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20' : 'mt-4'}`}>
                <button
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={() => {
                        if (arToolkitSourceRef.current && arToolkitSourceRef.current.domElement) {
                            arToolkitSourceRef.current.domElement.play();
                        }
                    }}
                >
                    启动摄像头
                </button>
                <button
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                    onClick={toggleFullscreen}
                >
                    {isFullscreen ? '退出全屏' : '进入全屏'}
                </button>

                {/* 模型缩放控制按钮 */}
                <div className="flex items-center gap-1">
                    <button
                        className="px-3 py-2 bg-yellow-500 text-white rounded-l hover:bg-yellow-600 font-bold"
                        onClick={() => scaleModel(0.8)}
                        title="缩小模型"
                    >
                        -
                    </button>
                    <span className="bg-gray-700 text-white px-2 py-1 text-sm">
                        {Math.round(modelScale * 100)}%
                    </span>
                    <button
                        className="px-3 py-2 bg-yellow-500 text-white rounded-r hover:bg-yellow-600 font-bold"
                        onClick={() => scaleModel(1.25)}
                        title="放大模型"
                    >
                        +
                    </button>
                </div>

                {!isFullscreen && (
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => navigate(`/model/${builderId}`)}
                    >
                        返回
                    </button>
                )}
            </div>
        </div>
    );
};

export default ARCompatViewer;