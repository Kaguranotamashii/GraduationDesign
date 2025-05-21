import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { THREEx } from '@ar-js-org/ar.js-threejs';
import { getBuilderModelUrl } from '@/api/builderApi';
import { useParams } from 'react-router-dom';

// Utility to debounce functions
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

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
    const tooltipRef = useRef(null);
    const debugCubeRef = useRef(null);
    const raycasterRef = useRef(new THREE.Raycaster());
    const mouseRef = useRef(new THREE.Vector2());
    const [modelUrl, setModelUrl] = useState(null);
    const [error, setError] = useState(null);
    const [scale, setScale] = useState(1.6);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [markerNotDetected, setMarkerNotDetected] = useState(false);
    const [markersData, setMarkersData] = useState([]);
    const [isMarkerVisible, setIsMarkerVisible] = useState(false);
    const [highlightColor, setHighlightColor] = useState('#ff0000');
    const [highlightedPart, setHighlightedPart] = useState(null);
    const [showDebugCube, setShowDebugCube] = useState(true);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const { builderId } = useParams();
    const mounted = useRef(true);

    // Fetch model and marker data
    useEffect(() => {
        const fetchModelData = async () => {
            try {
                const response = await getBuilderModelUrl(builderId);
                if (!mounted.current) return;
                if (response.code !== 200 || !response.data.model_url) {
                    throw new Error('未找到模型文件');
                }
                setModelUrl(response.data.model_url);
                if (response.data.json) {
                    try {
                        const markers = JSON.parse(response.data.json);
                        // Validate markersData
                        const validatedMarkers = markers.filter(marker => {
                            if (!marker.id || !Array.isArray(marker.faces) || !marker.description) {
                                console.warn('无效标记数据:', marker);
                                return false;
                            }
                            marker.faces = marker.faces.filter(face => Number.isInteger(face) && face >= 0);
                            return marker.faces.length > 0;
                        });
                        setMarkersData(validatedMarkers);
                        console.log('Validated markersData:', validatedMarkers);
                    } catch (e) {
                        setError('标记数据解析失败: ' + e.message);
                    }
                }
            } catch (err) {
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
            if (tooltipRef.current) {
                document.body.removeChild(tooltipRef.current);
            }
        };
    }, []);

    // Initialize AR scene
    useEffect(() => {
        if (!modelUrl) return;

        // Initialize scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Initialize camera
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        cameraRef.current = camera;
        scene.add(camera);

        // Initialize renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        rendererRef.current = renderer;
        containerRef.current.appendChild(renderer.domElement);

        // Initialize ARToolkitSource
        const arToolkitSource = new THREEx.ArToolkitSource({
            sourceType: 'webcam',
            sourceWidth: 640,
            sourceHeight: 480,
        });
        arToolkitSourceRef.current = arToolkitSource;

        arToolkitSource.init(() => {
            onResize();
            const video = arToolkitSource.domElement;
            if (video) {
                video.style.position = 'fixed';
                video.style.top = '0';
                video.style.left = '0';
                video.style.width = '100%';
                video.style.height = '100%';
                video.style.objectFit = 'cover';
                video.style.zIndex = '-1';
            }
        }, (error) => setError('摄像头访问失败: ' + error.message));

        // Initialize ARToolkitContext
        const arToolkitContext = new THREEx.ArToolkitContext({
            cameraParametersUrl: '/camera_para.dat',
            detectionMode: 'mono',
            maxDetectionRate: 30,
            imageSmoothingEnabled: false,
            canvasWidth: 640,
            canvasHeight: 480,
            patternRatio: 0.5,
            debug: true,
        });
        arToolkitContextRef.current = arToolkitContext;

        arToolkitContext.init(() => {
            console.log('ARToolkitContext 初始化成功');
            camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
        }, (error) => {
            console.error('初始化 ARToolkitContext 错误:', error);
            setError('ARToolkit 初始化失败: ' + error.message);
        });

        // Initialize marker
        const markerRoot = new THREE.Group();
        markerRootRef.current = markerRoot;
        scene.add(markerRoot);

        try {
            new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
                type: 'pattern',
                patternUrl: '/patt.hiro',
                patternRatio: 0.5,
            });
            console.log('ArMarkerControls 初始化成功');
        } catch (error) {
            console.error('初始化 ArMarkerControls 错误:', error);
            setError('标记控件初始化失败: ' + error.message);
        }

        // Add debug marker at markerRoot origin
        const debugGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const debugMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });
        const debugCube = new THREE.Mesh(debugGeometry, debugMaterial);
        debugCube.visible = showDebugCube;
        debugCubeRef.current = debugCube;
        markerRoot.add(debugCube);

        // Apply offset to markerRoot
        markerRoot.position.set(offsetX, offsetY, 0);

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 1.0));
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 0);
        scene.add(directionalLight);

        // Load model
        const loader = new GLTFLoader();
        loader.load(
            modelUrl,
            (gltf) => {
                const model = gltf.scene;
                modelRef.current = model;

                // Compute bounding box to center the model
                const box = new THREE.Box3();
                model.traverse((node) => {
                    if (node.isMesh) {
                        node.geometry.computeBoundingBox();
                        const nodeBox = node.geometry.boundingBox.clone();
                        nodeBox.applyMatrix4(node.matrixWorld);
                        box.union(nodeBox);
                    }
                });
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());

                // Adjust model position to align bottom with markerRoot origin
                model.position.set(-center.x, -center.y, -center.z + size.z / 2);
                model.scale.set(scale, scale, scale);

                // Log bounding box and triangle count
                let totalTriangles = 0;
                model.traverse((node) => {
                    if (node.isMesh && node.geometry.index) {
                        totalTriangles += node.geometry.index.count / 3;
                    }
                });
                console.log('Model Bounding Box:', box);
                console.log('Center:', center);
                console.log('Size:', size);
                console.log('Total triangles:', totalTriangles);

                // Collect meshes for raycasting
                const meshes = [];
                model.traverse((node) => {
                    if (node.isMesh) meshes.push(node);
                });
                if (meshes.length) {
                    meshRef.current = meshes;
                    console.log('Meshes collected:', meshes.length);
                } else {
                    setError('模型中未找到 Mesh');
                }
                markerRoot.add(model);
            },
            (progress) => setLoadingProgress(Math.round((progress.loaded / progress.total) * 100)),
            (err) => setError(`模型加载失败: ${err.message}`)
        );

        // Handle click for part highlighting with debounce
        const handleClick = debounce((event) => {
            if (!meshRef.current || !rendererRef.current || !cameraRef.current || !sceneRef.current) {
                console.log('点击失败：缺少必要组件（mesh, renderer, camera, scene）');
                return;
            }

            // Step 1: Clear existing highlight
            if (highlightedPart?.mesh) {
                try {
                    sceneRef.current.remove(highlightedPart.mesh);
                    console.log('已清除现有高亮，markerId:', highlightedPart.markerId);
                } catch (err) {
                    console.error('清除高亮失败:', err);
                }
                setHighlightedPart(null);
                hidePartInfo();
            }

            // Step 2: Raycast to find clicked face
            const canvas = renderer.domElement;
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
            mouseRef.current.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

            raycasterRef.current.setFromCamera(mouseRef.current, camera);
            const intersects = raycasterRef.current.intersectObjects(
                Array.isArray(meshRef.current) ? meshRef.current : [meshRef.current],
                true
            );

            if (!intersects.length || intersects[0].faceIndex === undefined) {
                console.log('未点击有效部位或无 faceIndex');
                return;
            }

            // Step 3: Find matching marker
            const clickedFaceIndex = intersects[0].faceIndex;
            const clickedMesh = intersects[0].object;
            console.log('点击 faceIndex:', clickedFaceIndex, 'mesh:', clickedMesh.name || 'unnamed');

            // Ensure only one marker matches
            const foundMarker = markersData.find((marker) =>
                marker.faces.includes(clickedFaceIndex)
            );

            if (!foundMarker) {
                console.log('未找到匹配的标记，faceIndex:', clickedFaceIndex);
                return;
            }

            console.log('找到标记:', foundMarker);

            // Step 4: Create new highlight
            const highlightGeometry = new THREE.BufferGeometry();
            const originalGeometry = clickedMesh.geometry;
            const indices = [];
            const vertices = originalGeometry.attributes.position.array;
            const maxFaceIndex = originalGeometry.index
                ? originalGeometry.index.count / 3
                : originalGeometry.attributes.position.count / 3;
            const validFaces = foundMarker.faces.filter((faceIndex) => faceIndex < maxFaceIndex);

            if (!validFaces.length) {
                console.log('无有效面，无法高亮，markerId:', foundMarker.id);
                hidePartInfo();
                return;
            }

            console.log('有效面:', validFaces);

            validFaces.forEach((faceIndex) => {
                const start = faceIndex * 3;
                indices.push(
                    originalGeometry.index ? originalGeometry.index.array[start] : start,
                    originalGeometry.index ? originalGeometry.index.array[start + 1] : start + 1,
                    originalGeometry.index ? originalGeometry.index.array[start + 2] : start + 2
                );
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

            // Step 5: Update highlighted part
            setHighlightedPart({
                markerId: foundMarker.id,
                mesh: highlightMesh,
                sourceMesh: clickedMesh,
            });
            showPartInfo(foundMarker, event);
            console.log(`高亮创建成功，markerId: ${foundMarker.id}, faces: ${validFaces}`);
        }, 100); // Debounce 100ms to prevent rapid clicks

        const showPartInfo = (marker, event) => {
            if (!tooltipRef.current) {
                console.log('工具提示未初始化');
                return;
            }
            tooltipRef.current.style.display = 'block';
            tooltipRef.current.innerHTML = `
        <div style="margin-bottom: 8px;"><strong>位置信息：</strong></div>
        <div>${marker.description}</div>
      `;
            const canvas = renderer.domElement;
            const rect = canvas.getBoundingClientRect();
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
            console.log('显示工具提示:', marker.description);
        };

        const hidePartInfo = () => {
            if (tooltipRef.current) {
                tooltipRef.current.style.display = 'none';
                console.log('隐藏工具提示');
            }
        };

        renderer.domElement.addEventListener('click', handleClick);

        // Handle resize
        const onResize = () => {
            arToolkitSource.onResizeElement();
            arToolkitSource.copyElementSizeTo(renderer.domElement);
            if (arToolkitContext.arController) {
                arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
            }
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        };

        const debouncedResize = debounce(onResize, 100);
        window.addEventListener('resize', debouncedResize);

        // Animation loop
        const animate = () => {
            let lastTimeMsec = null;
            const render = (nowMsec) => {
                requestAnimationFrame(render);
                lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
                const deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
                lastTimeMsec = nowMsec;

                if (arToolkitSource.ready) {
                    arToolkitContext.update(arToolkitSource.domElement);
                    if (markerRootRef.current) {
                        const isVisible = markerRootRef.current.visible;
                        setIsMarkerVisible(isVisible);
                        setMarkerNotDetected(!isVisible && modelUrl);
                        console.log('markerRoot visible:', isVisible, 'matrix:', markerRootRef.current.matrix, 'position:', markerRootRef.current.position);
                    }
                    scene.visible = camera.visible;
                }
                renderer.render(scene, camera);
            };
            requestAnimationFrame(render);
        };
        animate();

        // Marker detection timeout
        const markerTimeout = setTimeout(() => {
            if (markerRootRef.current && !markerRootRef.current.visible) {
                setMarkerNotDetected(true);
            }
        }, 10000);

        // Cleanup
        return () => {
            renderer.setAnimationLoop(null);
            if (containerRef.current && renderer.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.domElement.removeEventListener('click', handleClick);
            window.removeEventListener('resize', debouncedResize);
            if (highlightedPart?.mesh && sceneRef.current) {
                sceneRef.current.remove(highlightedPart.mesh);
            }
            clearTimeout(markerTimeout);
        };
    }, [modelUrl, scale, markersData, highlightColor, showDebugCube, offsetX, offsetY]);

    // Update debug cube visibility
    useEffect(() => {
        if (debugCubeRef.current) {
            debugCubeRef.current.visible = showDebugCube;
        }
    }, [showDebugCube]);

    // Update markerRoot offset
    useEffect(() => {
        if (markerRootRef.current) {
            markerRootRef.current.position.set(offsetX, offsetY, 0);
        }
    }, [offsetX, offsetY]);

    // Scale up handler
    const handleScaleUp = () => {
        setScale((prev) => {
            const newScale = Math.min(prev + 0.1, 2.0);
            if (modelRef.current) {
                modelRef.current.scale.set(newScale, newScale, newScale);
                if (highlightedPart?.mesh) {
                    highlightedPart.mesh.scale.copy(modelRef.current.scale);
                }
            }
            return newScale;
        });
    };

    // Scale down handler
    const handleScaleDown = () => {
        setScale((prev) => {
            const newScale = Math.max(prev - 0.1, 0.1);
            if (modelRef.current) {
                modelRef.current.scale.set(newScale, newScale, newScale);
                if (highlightedPart?.mesh) {
                    highlightedPart.mesh.scale.copy(modelRef.current.scale);
                }
            }
            return newScale;
        });
    };

    // Color change handler
    const handleColorChange = (event) => {
        setHighlightColor(event.target.value);
        if (highlightedPart?.mesh) {
            highlightedPart.mesh.material.color.set(event.target.value);
            highlightedPart.mesh.material.emissive.set(event.target.value);
        }
    };

    // Toggle debug cube visibility
    const toggleDebugCube = () => {
        setShowDebugCube((prev) => !prev);
    };

    // Offset change handlers
    const handleOffsetXChange = (event) => {
        const value = parseFloat(event.target.value);
        if (!isNaN(value)) {
            setOffsetX(value);
        }
    };

    const handleOffsetYChange = (event) => {
        const value = parseFloat(event.target.value);
        if (!isNaN(value)) {
            setOffsetY(value);
        }
    };

    // Error rendering
    if (error) {
        return (
            <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
                错误: {error}
            </div>
        );
    }

    // Main rendering
    return (
        <div
            ref={containerRef}
            style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0 }}
        >
            {!modelUrl && (
                <div
                    style={{
                        position: 'fixed',
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
                    未检测到 Hiro 标记，请确保标记清晰可见、平整且光照充足
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
                        flexWrap: 'wrap',
                        gap: '10px',
                        alignItems: 'center',
                    }}
                >
                    <button onClick={handleScaleUp}>放大</button>
                    <button onClick={handleScaleDown}>缩小</button>
                    <input
                        type="color"
                        value={highlightColor}
                        onChange={handleColorChange}
                        style={{ width: '50px' }}
                    />
                    <button onClick={toggleDebugCube}>
                        {showDebugCube ? '隐藏调试方块' : '显示调试方块'}
                    </button>
                    <div>
                        <label>X 偏移: </label>
                        <input
                            type="number"
                            step="0.01"
                            value={offsetX}
                            onChange={handleOffsetXChange}
                            style={{ width: '60px' }}
                        />
                    </div>
                    <div>
                        <label>Y 偏移: </label>
                        <input
                            type="number"
                            step="0.01"
                            value={offsetY}
                            onChange={handleOffsetYChange}
                            style={{ width: '60px' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ARCompatViewer;