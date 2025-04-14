import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getBuilderModelUrl } from '@/api/builderApi';
import { message } from 'antd';

const ARGoogleViewer = () => {
    const { builderId } = useParams();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [markersData, setMarkersData] = useState([]);
    const [activeMarker, setActiveMarker] = useState(null);
    const [isARActive, setIsARActive] = useState(false);
    const [modelScale, setModelScale] = useState(1.0);

    // Three.js 引用
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const modelRef = useRef(null);
    const textSpriteRef = useRef(null);
    const xrSessionRef = useRef(null);
    const shadowPlaneRef = useRef(null);
    const animationFrameRef = useRef(null);

    // 创建文字贴图
    const createTextSprite = (text, position) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 256;

        // 圆角背景
        context.fillStyle = 'rgba(0, 0, 0, 0.85)';
        context.beginPath();
        context.roundRect(0, 0, canvas.width, canvas.height, 20);
        context.fill();

        // 边框
        context.strokeStyle = '#4CAF50';
        context.lineWidth = 6;
        context.beginPath();
        context.roundRect(0, 0, canvas.width, canvas.height, 20);
        context.stroke();

        // 文字
        context.fillStyle = '#ffffff';
        context.font = 'bold 48px Arial, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.shadowColor = 'rgba(0, 0, 0, 0.7)';
        context.shadowBlur = 4;
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.copy(position);

        // 根据与相机的距离动态调整大小
        const distanceToCamera = position.distanceTo(cameraRef.current.position);
        const baseScale = 0.05 * distanceToCamera;
        sprite.scale.set(baseScale * 2, baseScale, 1);

        return sprite;
    };

    // 清除文字 Sprite
    const clearTextSprite = () => {
        if (textSpriteRef.current && sceneRef.current) {
            sceneRef.current.remove(textSpriteRef.current);
            textSpriteRef.current.material.map.dispose();
            textSpriteRef.current.material.dispose();
            textSpriteRef.current = null;
        }
    };

    // 处理模型点击 - 优化逻辑确保点击同一部件会取消高亮
    const handleModelClick = (event, isXRSelect = false) => {
        if (!modelRef.current || !markersData.length) return;

        const canvas = rendererRef.current.domElement;
        const rect = canvas.getBoundingClientRect();
        const mouse = new THREE.Vector2();

        if (!isXRSelect && event.clientX !== undefined && event.clientY !== undefined) {
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        } else {
            // AR模式使用中心点
            mouse.x = 0;
            mouse.y = 0;
        }

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, cameraRef.current);

        const meshes = [];
        modelRef.current.traverse((child) => {
            if (child.isMesh && child.geometry) meshes.push(child);
        });

        const intersects = raycaster.intersectObjects(meshes, true);

        // 如果点击没有命中任何物体，清除所有高亮
        if (intersects.length === 0) {
            clearTextSprite();
            clearHighlight();
            setActiveMarker(null);
            return;
        }

        const intersect = intersects[0];
        const hitPosition = intersect.point;
        let foundMarker = null;

        // 通过面索引查找标记
        if (intersect.faceIndex !== undefined) {
            foundMarker = markersData.find(
                marker => marker.faces && marker.faces.includes(intersect.faceIndex)
            );
        }

        // 通过对象名称查找标记
        if (!foundMarker && intersect.object.name) {
            foundMarker = markersData.find(
                marker => marker.objects && marker.objects.includes(intersect.object.name)
            );
        }

        // 没找到使用默认标记
        if (!foundMarker && markersData.length) {
            foundMarker = markersData[0];
        }

        // 检查是否点击了已高亮的标记
        if (foundMarker && activeMarker && activeMarker.description === foundMarker.description) {
            // 如果点击同一个标记，取消高亮
            clearTextSprite();
            clearHighlight();
            setActiveMarker(null);
        } else if (foundMarker) {
            // 点击了不同的标记，先清除旧的，然后高亮新的
            clearTextSprite();
            clearHighlight();

            // 创建并添加文字标签
            const textPosition = hitPosition.clone().add(new THREE.Vector3(0, 0.2, 0));
            textSpriteRef.current = createTextSprite(foundMarker.description, textPosition);
            sceneRef.current.add(textSpriteRef.current);

            // 高亮部件
            highlightPart(foundMarker, intersect.object);
            setActiveMarker(foundMarker);
        }
    };

    // 高亮部件 - 带脉动效果
    const highlightPart = (marker, hitObject) => {
        if (!modelRef.current) return;

        // 脉动动画参数
        const pulseIntensity = {value: 0.7};

        // 清除现有的动画帧
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        // 脉动动画函数
        const pulseAnimation = () => {
            pulseIntensity.value = 0.7 + Math.sin(Date.now() * 0.005) * 0.3;

            modelRef.current.traverse((child) => {
                if (child.isMesh && child.userData.isHighlighted) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => {
                            if (mat.userData && mat.userData.isHighlightMaterial) {
                                mat.opacity = pulseIntensity.value;
                            }
                        });
                    } else if (child.material.userData && child.material.userData.isHighlightMaterial) {
                        child.material.opacity = pulseIntensity.value;
                    }
                }
            });

            // 只有在marker仍然激活时继续动画
            if (activeMarker) {
                animationFrameRef.current = requestAnimationFrame(pulseAnimation);
            }
        };

        modelRef.current.traverse((child) => {
            if (child.isMesh && child.geometry) {
                // 保存原始材质
                if (!child.userData.originalMaterial) {
                    child.userData.originalMaterial = child.material.clone();
                }

                // 通过对象名称高亮
                if (marker.objects && marker.objects.includes(child.name)) {
                    child.userData.isHighlighted = true;
                    child.material = child.userData.originalMaterial.clone();
                    child.material.userData = child.material.userData || {};
                    child.material.userData.isHighlightMaterial = true;
                    child.material.color.setHex(0x4CAF50);
                    child.material.transparent = true;
                    child.material.opacity = 0.8;
                    child.material.emissive = new THREE.Color(0x2E7D32);
                    child.material.emissiveIntensity = 0.3;
                    return;
                }

                // 通过面索引高亮
                if (marker.faces && child.geometry.index) {
                    child.userData.isHighlighted = true;

                    if (!Array.isArray(child.material)) {
                        child.material = [child.userData.originalMaterial.clone()];
                    }

                    const highlightMaterial = child.userData.originalMaterial.clone();
                    highlightMaterial.userData = highlightMaterial.userData || {};
                    highlightMaterial.userData.isHighlightMaterial = true;
                    highlightMaterial.color.setHex(0x4CAF50);
                    highlightMaterial.transparent = true;
                    highlightMaterial.opacity = 0.8;
                    highlightMaterial.emissive = new THREE.Color(0x2E7D32);
                    highlightMaterial.emissiveIntensity = 0.3;
                    child.material.push(highlightMaterial);

                    // 设置面分组
                    child.geometry.clearGroups();
                    child.geometry.addGroup(0, child.geometry.index.count, 0);

                    if (marker.faces.length) {
                        const sortedIndices = [...marker.faces].sort((a, b) => a - b);
                        let start = sortedIndices[0] * 3;
                        let count = 3;
                        for (let i = 1; i < sortedIndices.length; i++) {
                            if (sortedIndices[i] === sortedIndices[i - 1] + 1) {
                                count += 3;
                            } else {
                                child.geometry.addGroup(start, count, 1);
                                start = sortedIndices[i] * 3;
                                count = 3;
                            }
                        }
                        child.geometry.addGroup(start, count, 1);
                    }
                }
            }
        });

        // 开始脉动动画
        pulseAnimation();
    };

    // 清除高亮
    const clearHighlight = () => {
        if (!modelRef.current) return;

        // 取消脉动动画
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        modelRef.current.traverse((child) => {
            if (child.isMesh && child.geometry && child.userData.originalMaterial) {
                child.material = child.userData.originalMaterial.clone();
                child.userData.isHighlighted = false;
                child.geometry.clearGroups();
                if (child.geometry.index) {
                    child.geometry.addGroup(0, child.geometry.index.count, 0);
                }
            }
        });
    };

    // AR环境优化
    const optimizeForAR = () => {
        if (!sceneRef.current) return null;

        // 移除现有光源
        sceneRef.current.children.forEach(child => {
            if (child.isLight) sceneRef.current.remove(child);
        });

        // 添加环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        sceneRef.current.add(ambientLight);

        // 添加平行光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 5, 2);
        directionalLight.castShadow = true;
        sceneRef.current.add(directionalLight);

        // 添加半球光
        const hemisphereLight = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 0.6);
        sceneRef.current.add(hemisphereLight);

        // 添加阴影平面
        const shadowPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(5, 5),
            new THREE.ShadowMaterial({
                opacity: 0.3,
                transparent: true,
                side: THREE.DoubleSide
            })
        );
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.position.y = -0.5;
        shadowPlane.receiveShadow = true;
        shadowPlane.visible = false;
        sceneRef.current.add(shadowPlane);
        shadowPlaneRef.current = shadowPlane;

        return shadowPlane;
    };

    // 初始化场景
    useEffect(() => {
        if (!containerRef.current || !builderId) {
            console.error('缺少容器或 builderId');
            return;
        }

        const initScene = async () => {
            try {
                setLoading(true);

                // 检查WebXR支持
                if (!navigator.xr) {
                    throw new Error('设备不支持 WebXR');
                }
                const isARSupported = await navigator.xr.isSessionSupported('immersive-ar');
                if (!isARSupported) {
                    throw new Error('设备不支持 AR');
                }

                // 获取模型URL
                const response = await getBuilderModelUrl(builderId);
                if (response.code !== 200 || !response.data.model_url) {
                    throw new Error('模型未找到');
                }

                // 解析标记数据
                if (response.data.json) {
                    try {
                        const parsedMarkers = JSON.parse(response.data.json);
                        setMarkersData(parsedMarkers);
                    } catch (e) {
                        setMarkersData([
                            { description: '测试部件', faces: [0, 1, 2], objects: [''] },
                        ]);
                    }
                } else {
                    setMarkersData([
                        { description: '默认部件', faces: [0, 1, 2], objects: [''] },
                    ]);
                }

                // 创建场景和相机
                const scene = new THREE.Scene();
                sceneRef.current = scene;

                const camera = new THREE.PerspectiveCamera(
                    75,
                    window.innerWidth / window.innerHeight,
                    0.1,
                    1000
                );
                cameraRef.current = camera;

                // 创建渲染器
                const renderer = new THREE.WebGLRenderer({
                    antialias: true,
                    alpha: true,
                });
                rendererRef.current = renderer;
                renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.xr.enabled = true;
                containerRef.current.appendChild(renderer.domElement);

                // 添加事件监听
                renderer.domElement.addEventListener('click', handleModelClick);
                renderer.domElement.addEventListener('touchstart', (event) => {
                    event.preventDefault();
                    event.clientX = event.touches[0].clientX;
                    event.clientY = event.touches[0].clientY;
                    handleModelClick(event);
                });

                // 添加光源
                scene.add(new THREE.AmbientLight(0xffffff, 0.7));
                const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
                directionalLight.position.set(5, 5, 5);
                scene.add(directionalLight);

                // 加载模型
                const loader = new GLTFLoader();
                const gltf = await new Promise((resolve, reject) => {
                    loader.load(
                        response.data.model_url,
                        (gltf) => resolve(gltf),
                        (xhr) => {},
                        (err) => reject(new Error('模型加载失败'))
                    );
                });

                // 设置模型
                const model = gltf.scene;
                modelRef.current = model;

                // 计算适当的缩放
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const baseScale = 0.5 / Math.max(size.x, size.y, size.z);
                const finalScale = baseScale * modelScale;
                model.scale.set(finalScale, finalScale, finalScale);
                model.position.set(0, 0, -1);
                scene.add(model);

                // 启动动画循环
                const animate = () => {
                    renderer.setAnimationLoop((time) => {
                        renderer.render(scene, camera);
                    });
                };
                animate();

                // 窗口大小变化处理
                const onResize = () => {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(window.innerWidth, window.innerHeight);
                };
                window.addEventListener('resize', onResize);

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        initScene();

        // 清理函数
        return () => {
            // 取消动画
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            // 移除事件监听
            window.removeEventListener('resize', () => {});
            if (rendererRef.current?.domElement) {
                rendererRef.current.domElement.removeEventListener('click', handleModelClick);
                rendererRef.current.domElement.removeEventListener('touchstart', () => {});
            }

            // 结束AR会话
            if (xrSessionRef.current) {
                xrSessionRef.current.end().catch(() => {});
                xrSessionRef.current = null;
            }

            // 清理渲染器
            if (rendererRef.current) {
                rendererRef.current.setAnimationLoop(null);
                rendererRef.current.dispose();
                if (rendererRef.current.domElement && rendererRef.current.domElement.parentNode) {
                    rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
                }
            }

            // 清理模型资源
            if (modelRef.current) {
                modelRef.current.traverse((child) => {
                    if (child.isMesh && child.geometry) {
                        child.geometry.dispose();
                        if (Array.isArray(child.material)) {
                            child.material.forEach((material) => material.dispose());
                        } else if (child.material) {
                            child.material.dispose();
                        }
                    }
                });
            }

            // 清除文字精灵
            clearTextSprite();
        };
    }, [builderId]);

    // 启动 AR
    const startAR = async () => {
        try {
            if (!navigator.xr) throw new Error('浏览器不支持 WebXR');

            const session = await navigator.xr.requestSession('immersive-ar', {
                optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'hit-test'],
                requiredFeatures: ['local']
            });

            xrSessionRef.current = session;
            rendererRef.current.xr.setSession(session);
            setIsARActive(true);

            // 优化AR环境
            optimizeForAR();

            // 设置命中测试
            let hitTestSource = null;
            let hitTestSourceRequested = false;

            // 添加选择事件监听
            session.addEventListener('select', (event) => {
                handleModelClick(event, true);
            });

            // XR帧处理
            const onXRFrame = (time, frame) => {
                const session = frame.session;
                const referenceSpace = rendererRef.current.xr.getReferenceSpace();

                // 如需要，请求命中测试源
                if (!hitTestSourceRequested && session.requestHitTestSource) {
                    session.requestReferenceSpace('viewer').then((referenceSpace) => {
                        session.requestHitTestSource({ space: referenceSpace }).then((source) => {
                            hitTestSource = source;
                        });
                    });
                    hitTestSourceRequested = true;
                }

                // 执行命中测试
                if (hitTestSource && shadowPlaneRef.current) {
                    const hitTestResults = frame.getHitTestResults(hitTestSource);

                    if (hitTestResults.length) {
                        const hit = hitTestResults[0];
                        const pose = hit.getPose(referenceSpace);

                        if (pose) {
                            // 移动模型到命中位置
                            modelRef.current.position.set(
                                pose.transform.position.x,
                                pose.transform.position.y,
                                pose.transform.position.z
                            );

                            // 移动阴影平面
                            shadowPlaneRef.current.position.set(
                                pose.transform.position.x,
                                pose.transform.position.y - 0.01,
                                pose.transform.position.z
                            );
                            shadowPlaneRef.current.visible = true;
                        }
                    }
                }

                // 继续帧循环
                session.requestAnimationFrame(onXRFrame);
            };

            // 启动XR帧循环
            session.requestAnimationFrame(onXRFrame);

            // 会话结束处理
            session.addEventListener('end', () => {
                setIsARActive(false);
                if (shadowPlaneRef.current) shadowPlaneRef.current.visible = false;
                rendererRef.current.xr.setSession(null);
                xrSessionRef.current = null;
            });

            message.success('AR 模式已启动，请移动设备寻找平面放置模型');
        } catch (err) {
            message.error('无法启动 AR: ' + err.message);
        }
    };

    // 缩放模型
    const scaleModel = (scaleFactor) => {
        setModelScale((prevScale) => {
            const newScale = prevScale * scaleFactor;
            if (newScale < 0.2) return 0.2;
            if (newScale > 5.0) return 5.0;
            return newScale;
        });
    };

    // 更新模型缩放
    useEffect(() => {
        if (modelRef.current) {
            const box = new THREE.Box3().setFromObject(modelRef.current);
            const size = box.getSize(new THREE.Vector3());
            const baseScale = 0.5 / Math.max(size.x, size.y, size.z);
            const finalScale = baseScale * modelScale;
            modelRef.current.scale.set(finalScale, finalScale, finalScale);
        }
    }, [modelScale]);

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center ${isARActive ? 'bg-black' : ''}`}>
            {!isARActive && <h1 className="text-3xl font-bold mb-4">AR模型查看器 - ID: {builderId}</h1>}

            {loading && (
                <div className="text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-white">加载模型中...</p>
                </div>
            )}

            {error && (
                <p className="text-red-500 absolute top-10 left-1/2 transform -translate-x-1/2 z-30">错误：{error}</p>
            )}

            <div
                className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-black bg-opacity-50 p-2 rounded text-white text-center"
                style={{ display: isARActive ? 'none' : 'block' }}
            >
                <p>点击"启动AR"在增强现实中查看模型</p>
                <p className="text-xs mt-1">使用+/-按钮调整模型大小</p>
                <p className="text-xs">点击模型部件可高亮，再次点击可取消高亮</p>
                {activeMarker && (
                    <div className="mt-2 p-2 bg-green-900 rounded">
                        <p><strong>当前选中:</strong> {activeMarker.description}</p>
                    </div>
                )}
            </div>

            <div ref={containerRef} className="relative w-full h-[70vh]" style={{ overflow: 'hidden' }} />

            <div className="flex gap-2 mt-4">
                <button
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={startAR}
                    disabled={isARActive}
                >
                    启动AR
                </button>
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
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => navigate(`/model/${builderId}`)}
                >
                    返回
                </button>
            </div>
        </div>
    );
};

export default ARGoogleViewer;