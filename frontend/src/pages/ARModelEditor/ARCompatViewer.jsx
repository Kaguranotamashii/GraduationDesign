import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { ARButton } from 'three/examples/jsm/webxr/ARButton';
import { THREEx } from '@ar-js-org/ar.js-threejs';
import { getBuilderModelUrl } from '@/api/builderApi';
import { useParams } from 'react-router-dom';

const ARCompatViewer = () => {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const arToolkitSourceRef = useRef(null);
    const arToolkitContextRef = useRef(null);
    const modelRef = useRef(null);
    const markerRootRef = useRef(null);
    const meshRef = useRef(null);
    const [modelUrl, setModelUrl] = useState(null);
    const [error, setError] = useState(null);
    const [scale, setScale] = useState(0.8);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [markerNotDetected, setMarkerNotDetected] = useState(false);
    const [markersData, setMarkersData] = useState([]);
    const tooltipRef = useRef(null);
    const raycasterRef = useRef(new THREE.Raycaster());
    const mouseRef = useRef(new THREE.Vector2());
    const mounted = useRef(true);
    const { builderId } = useParams();
    const [isMarkerVisible, setIsMarkerVisible] = useState(false);
    const [highlightColor, setHighlightColor] = useState('#ff0000'); // Default highlight color
    const [highlightedPart, setHighlightedPart] = useState(null); // Track single highlighted part

    // Fetch model and marker data
    useEffect(() => {
        const fetchModelData = async () => {
            try {
                const response = await getBuilderModelUrl(builderId);
                if (!mounted.current) return;
                if (response.code !== 200 || !response.data.model_url) {
                    throw new Error('未找到模型文件');
                }
                console.log('API Response:', response.data);
                setModelUrl(response.data.model_url);

                if (response.data.json) {
                    console.log('原始 JSON 数据:', response.data.json);
                    try {
                        const markers = JSON.parse(response.data.json);
                        console.log('解析后的标记数据:', markers);
                        setMarkersData(markers);
                    } catch (e) {
                        console.error('JSON 解析错误:', e.message);
                        setError('标记数据解析失败: ' + e.message);
                    }
                } else {
                    console.log('API 响应中未找到 JSON 数据');
                }
            } catch (err) {
                console.error('API 错误:', err.message);
                setError(`API 错误: ${err.message}`);
            }
        };
        fetchModelData();
        return () => {
            mounted.current = false;
        };
    }, [builderId]);

    // Create tooltip
    useEffect(() => {
        const tooltip = document.createElement('div');
        tooltip.style.cssText = `
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
        document.body.appendChild(tooltip);
        tooltipRef.current = tooltip;

        return () => {
            if (tooltipRef.current && document.body.contains(tooltipRef.current)) {
                document.body.removeChild(tooltipRef.current);
            }
        };
    }, []);

    // Initialize AR scene
    useEffect(() => {
        if (!modelUrl) return;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        cameraRef.current = camera;
        scene.add(camera);

        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;
        rendererRef.current = renderer;
        containerRef.current.appendChild(renderer.domElement);

        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';

        const arButton = ARButton.createButton(renderer, {
            onError: (error) => {
                console.error('ARButton 初始化错误:', error);
                setError('AR 初始化失败: ' + error.message);
            },
        });
        document.body.appendChild(arButton);

        const sourceWidth = Math.min(window.innerWidth, 640);
        const sourceHeight = Math.min(window.innerHeight, 480);

        const arToolkitSource = new THREEx.ArToolkitSource({
            sourceType: 'webcam',
            sourceWidth: sourceWidth,
            sourceHeight: sourceHeight,
            displayWidth: window.innerWidth,
            displayHeight: window.innerHeight,
        });
        arToolkitSourceRef.current = arToolkitSource;

        arToolkitSource.init(
            () => {
                console.log('摄像头初始化成功:', { sourceWidth, sourceHeight });
                onResize();
                if (arToolkitSource.domElement) {
                    arToolkitSource.domElement.style.position = 'absolute';
                    arToolkitSource.domElement.style.top = '0';
                    arToolkitSource.domElement.style.left = '0';
                    arToolkitSource.domElement.style.width = '100%';
                    arToolkitSource.domElement.style.height = '100%';
                    arToolkitSource.domElement.style.objectFit = 'contain';
                    arToolkitSource.domElement.style.transform = 'translateZ(0)';
                } else {
                    console.error('arToolkitSource.domElement 未创建');
                    setError('摄像头初始化失败');
                }
            },
            (error) => {
                console.error('摄像头初始化错误:', error);
                setError('摄像头访问失败: ' + error.message);
            }
        );

        const arToolkitContext = new THREEx.ArToolkitContext({
            cameraParametersUrl: '/camera_para.dat',
            detectionMode: 'mono_and_matrix',
            matrixCodeType: '3x3',
            maxDetectionRate: 60,
            patternRatio: 0.5,
            imageSmoothingEnabled: true,
        });
        arToolkitContextRef.current = arToolkitContext;

        arToolkitContext.init(() => {
            console.log('AR 上下文初始化成功');
            camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
        });

        const markerRoot = new THREE.Group();
        markerRootRef.current = markerRoot;
        scene.add(markerRoot);

        try {
            const markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
                type: 'pattern',
                patternUrl: '/patt.hiro',
                changeMatrixMode: 'modelViewMatrix',
            });
            console.log('标记控件初始化成功，patternUrl: /patt.hiro');
        } catch (error) {
            console.error('标记控件初始化错误:', error);
            setError('标记控件初始化失败: ' + error.message);
        }

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 0);
        scene.add(directionalLight);

        const loader = new GLTFLoader();
        loader.load(
            modelUrl,
            (gltf) => {
                const model = gltf.scene;
                modelRef.current = model;

                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.set(-center.x, -center.y, -center.z);
                model.scale.set(scale, scale, scale);
                model.rotation.set(0, 0, 0);

                const meshes = [];
                model.traverse((node) => {
                    if (node.isMesh) {
                        meshes.push(node);
                    }
                });
                if (meshes.length > 0) {
                    meshRef.current = meshes;
                    console.log('找到模型 Mesh 列表:', meshes);
                } else {
                    console.error('模型中未找到 Mesh');
                    setError('模型中未找到 Mesh');
                }

                markerRoot.add(model);
                console.log('模型加载并居中:', modelUrl);

                meshes.forEach((mesh, index) => {
                    const faceCount = mesh.geometry.index
                        ? mesh.geometry.index.count / 3
                        : mesh.geometry.attributes.position.count / 3;
                    console.log(`Mesh ${index} 面数: ${faceCount}`);
                });
            },
            (progress) => {
                const percent = Math.round((progress.loaded / progress.total) * 100);
                setLoadingProgress(percent);
                console.log('模型加载进度:', percent, '%');
            },
            (err) => {
                console.error('模型加载错误:', err);
                setError(`模型加载失败: ${err.message}`);
            }
        );

        const handleClick = (event) => {
            if (!meshRef.current || !rendererRef.current || !cameraRef.current) {
                console.log('点击检测失败: 缺少 mesh, renderer 或 camera');
                return;
            }

            const canvas = renderer.domElement;
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
            mouseRef.current.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

            raycasterRef.current.setFromCamera(mouseRef.current, camera);
            const intersects = raycasterRef.current.intersectObjects(
                Array.isArray(meshRef.current) ? meshRef.current : [meshRef.current],
                true
            );

            if (intersects.length > 0 && intersects[0].faceIndex !== undefined) {
                const clickedFaceIndex = intersects[0].faceIndex;
                const clickedMesh = intersects[0].object;
                console.log('点击的面索引:', clickedFaceIndex, '交点 Mesh:', clickedMesh);

                const foundMarker = markersData.find((marker) => marker.faces.includes(clickedFaceIndex));
                if (foundMarker) {
                    console.log('找到标记:', foundMarker, '高亮面数:', foundMarker.faces.length);

                    // Check if this marker is already highlighted
                    if (highlightedPart && highlightedPart.markerId === foundMarker.id) {
                        // Remove highlight
                        if (sceneRef.current && highlightedPart.mesh) {
                            sceneRef.current.remove(highlightedPart.mesh);
                        }
                        setHighlightedPart(null);
                        console.log('移除高亮部位:', foundMarker.id);
                        hidePartInfo();
                        return;
                    }

                    // Remove existing highlight if any
                    if (highlightedPart && highlightedPart.mesh) {
                        sceneRef.current.remove(highlightedPart.mesh);
                        console.log('移除旧高亮部位:', highlightedPart.markerId);
                    }

                    // Create new highlight Mesh
                    const highlightGeometry = new THREE.BufferGeometry();
                    const originalGeometry = clickedMesh.geometry;
                    const indices = [];
                    const vertices = originalGeometry.attributes.position.array;

                    // Validate face indices
                    const maxFaceIndex = originalGeometry.index
                        ? originalGeometry.index.count / 3
                        : originalGeometry.attributes.position.count / 3;
                    const validFaces = foundMarker.faces.filter((faceIndex) => faceIndex < maxFaceIndex);

                    if (validFaces.length === 0) {
                        console.error('无效的面索引:', foundMarker.faces);
                        hidePartInfo();
                        setHighlightedPart(null);
                        return;
                    }

                    validFaces.forEach((faceIndex) => {
                        if (originalGeometry.index) {
                            const start = faceIndex * 3;
                            indices.push(
                                originalGeometry.index.array[start],
                                originalGeometry.index.array[start + 1],
                                originalGeometry.index.array[start + 2]
                            );
                        } else {
                            const start = faceIndex * 3;
                            indices.push(start, start + 1, start + 2);
                        }
                    });

                    highlightGeometry.setIndex(indices);
                    highlightGeometry.setAttribute(
                        'position',
                        new THREE.Float32BufferAttribute(vertices, 3)
                    );
                    highlightGeometry.computeVertexNormals();

                    const highlightMaterial = new THREE.MeshStandardMaterial({
                        color: highlightColor,
                        emissive: highlightColor,
                        emissiveIntensity: 0.5,
                        transparent: true,
                        opacity: 0.8,
                        side: THREE.DoubleSide,
                    });

                    const highlightMesh = new THREE.Mesh(highlightGeometry, highlightMaterial);
                    highlightMesh.position.copy(clickedMesh.position);
                    highlightMesh.rotation.copy(clickedMesh.rotation);
                    highlightMesh.scale.copy(clickedMesh.scale);
                    clickedMesh.parent.add(highlightMesh);

                    // Set new highlight
                    setHighlightedPart({
                        markerId: foundMarker.id,
                        mesh: highlightMesh,
                        sourceMesh: clickedMesh,
                    });
                    console.log('添加高亮部位:', foundMarker.id);

                    showPartInfo(foundMarker, event);
                } else {
                    console.log('未找到匹配的标记，面索引:', clickedFaceIndex);
                    console.log('当前 markersData:', markersData);
                    // Clear highlight
                    if (highlightedPart && highlightedPart.mesh) {
                        sceneRef.current.remove(highlightedPart.mesh);
                        setHighlightedPart(null);
                        console.log('清除高亮部位: 非标记部位');
                    }
                    hidePartInfo();
                }
            } else {
                console.log('未检测到点击交点，交点数组:', intersects);
                // Clear highlight
                if (highlightedPart && highlightedPart.mesh) {
                    sceneRef.current.remove(highlightedPart.mesh);
                    setHighlightedPart(null);
                    console.log('清除高亮部位: 空白区域');
                }
                hidePartInfo();
            }
        };

        const showPartInfo = (marker, event) => {
            if (!tooltipRef.current) {
                console.error('提示框未初始化');
                return;
            }

            const canvas = renderer.domElement;
            const rect = canvas.getBoundingClientRect();

            tooltipRef.current.style.display = 'block';
            tooltipRef.current.innerHTML = `
        <div style="margin-bottom: 8px;"><strong>位置信息：</strong></div>
        <div>${marker.description}</div>
      `;

            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            let left = event.clientX + 10;
            let top = event.clientY + 10;

            if (left + tooltipRect.width > window.innerWidth) {
                left = event.clientX - tooltipRect.width - 10;
            }
            if (top + tooltipRect.height > window.innerHeight) {
                top = event.clientY - tooltipRect.height - 10;
            }

            tooltipRef.current.style.left = `${left}px`;
            tooltipRef.current.style.top = `${top}px`;
            console.log('显示提示框:', marker.description);
        };

        const hidePartInfo = () => {
            if (tooltipRef.current) {
                tooltipRef.current.style.display = 'none';
                console.log('隐藏提示框');
            }
        };

        renderer.domElement.addEventListener('click', handleClick);

        const onResize = () => {
            arToolkitSource.onResizeElement();
            arToolkitSource.copyElementSizeTo(renderer.domElement);
            if (arToolkitContext.arController !== null) {
                arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
            }
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            console.log('窗口调整大小');
        };
        window.addEventListener('resize', onResize, { passive: true });

        const animate = () => {
            renderer.setAnimationLoop(() => {
                if (arToolkitSource.ready) {
                    arToolkitContext.update(arToolkitSource.domElement);
                    if (markerRootRef.current) {
                        const isVisible = markerRootRef.current.visible;
                        if (isVisible && !isMarkerVisible) {
                            console.log('Hiro 标记已检测');
                            setIsMarkerVisible(true);
                            setMarkerNotDetected(false);
                        } else if (!isVisible && isMarkerVisible) {
                            console.log('未检测到 Hiro 标记');
                            setIsMarkerVisible(false);
                            setMarkerNotDetected(true);
                        }
                        scene.visible = camera.visible;
                    }
                } else {
                    console.log('arToolkitSource 未准备就绪');
                }
                renderer.render(scene, camera);
            });
        };
        animate();

        const timer = setTimeout(() => {
            if (markerRootRef.current && !markerRootRef.current.visible) {
                setMarkerNotDetected(true);
            }
        }, 10000);

        return () => {
            renderer.setAnimationLoop(null);
            if (containerRef.current && renderer.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.domElement.removeEventListener('click', handleClick);
            window.removeEventListener('resize', onResize);
            if (arButton && document.body.contains(arButton)) {
                document.body.removeChild(arButton);
            }
            if (highlightedPart && highlightedPart.mesh) {
                sceneRef.current.remove(highlightedPart.mesh);
            }
            clearTimeout(timer);
            console.log('清理 AR 场景');
        };
    }, [modelUrl, scale, markersData]);

    const handleScaleUp = () => {
        setScale((prev) => {
            const newScale = Math.min(prev + 0.1, 2.0);
            if (modelRef.current) {
                modelRef.current.scale.set(newScale, newScale, newScale);
                // Update highlighted part scale
                if (highlightedPart && highlightedPart.mesh) {
                    highlightedPart.mesh.scale.copy(modelRef.current.scale);
                }
                console.log('放大模型，缩放:', newScale);
            }
            return newScale;
        });
    };

    const handleScaleDown = () => {
        setScale((prev) => {
            const newScale = Math.max(prev - 0.1, 0.1);
            if (modelRef.current) {
                modelRef.current.scale.set(newScale, newScale, newScale);
                // Update highlighted part scale
                if (highlightedPart && highlightedPart.mesh) {
                    highlightedPart.mesh.scale.copy(modelRef.current.scale);
                }
                console.log('缩小模型，缩放:', newScale);
            }
            return newScale;
        });
    };

    const handleColorChange = (event) => {
        setHighlightColor(event.target.value);
        // Update highlighted part
        if (highlightedPart && highlightedPart.mesh) {
            highlightedPart.mesh.material.color.set(event.target.value);
            highlightedPart.mesh.material.emissive.set(event.target.value);
            console.log('更新高亮颜色:', event.target.value);
        }
    };

    if (error) {
        return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>错误: {error}</div>;
    }

    return (
        <div
            ref={containerRef}
            style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}
        >
            {!modelUrl && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        zIndex: 9999,
                    }}
                >
                    加载模型中... {loadingProgress}%
                </div>
            )}
            {markerNotDetected && modelUrl && (
                <div
                    style={{
                        position: 'absolute',
                        top: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '5px',
                        zIndex: 1000,
                        textAlign: 'center',
                    }}
                >
                    未检测到 Hiro 标记，请确保标记清晰可见，调整摄像头角度或增加光线
                </div>
            )}
            {modelUrl && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                    }}
                >
                    <button
                        onClick={handleScaleUp}
                        style={{
                            padding: '15px 30px',
                            fontSize: '18px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                        }}
                    >
                        放大
                    </button>
                    <button
                        onClick={handleScaleDown}
                        style={{
                            padding: '15px 30px',
                            fontSize: '18px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                        }}
                    >
                        缩小
                    </button>
                    <input
                        type="color"
                        value={highlightColor}
                        onChange={handleColorChange}
                        style={{
                            width: '40px',
                            height: '40px',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                        title="选择高亮颜色"
                    />
                </div>
            )}
        </div>
    );
};

export default ARCompatViewer;