import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const InteractiveModelViewer = () => {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);
    const raycasterRef = useRef(null);
    const mouseRef = useRef(new THREE.Vector2());
    const interactionMeshesRef = useRef(new Map());
    const modelRef = useRef(null);

    useEffect(() => {
        // 初始化场景
        const initScene = () => {
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0xf0f0f0);
            sceneRef.current = scene;

            // 设置相机
            const camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            camera.position.set(5, 5, 5);
            cameraRef.current = camera;

            // 设置渲染器
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            rendererRef.current = renderer;
            containerRef.current.appendChild(renderer.domElement);

            // 设置控制器
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controlsRef.current = controls;

            // 添加光源
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(10, 10, 10);
            scene.add(directionalLight);

            // 初始化射线检测器
            raycasterRef.current = new THREE.Raycaster();
        };

        // 加载模型和元数据
        const loadModelAndMeta = async () => {
            try {
                // 加载元数据
                const metaResponse = await fetch('/models/qiniandian_meta.json');
                const metadata = await metaResponse.json();

                // 加载模型
                const loader = new GLTFLoader();
                loader.load('/models/qiniandian123.glb', (gltf) => {
                    modelRef.current = gltf.scene;
                    sceneRef.current.add(gltf.scene);

                    // 创建交互层
                    createInteractionLayer(metadata.face_groups);

                    // 调整相机位置以适应模型
                    const box = new THREE.Box3().setFromObject(gltf.scene);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);

                    cameraRef.current.position.set(
                        center.x + maxDim * 2,
                        center.y + maxDim * 2,
                        center.z + maxDim * 2
                    );
                    cameraRef.current.lookAt(center);
                    controlsRef.current.target.copy(center);
                });
            } catch (error) {
                console.error('Error loading model or metadata:', error);
            }
        };

        // 创建交互层
        const createInteractionLayer = (faceGroups) => {
            const highlightMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            });

            faceGroups.forEach((group) => {
                const bounds = group.bounds;
                const size = new THREE.Vector3(
                    bounds[1][0] - bounds[0][0],
                    bounds[1][1] - bounds[0][1],
                    bounds[1][2] - bounds[0][2]
                );

                const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
                const material = new THREE.MeshBasicMaterial({
                    transparent: true,
                    opacity: 0,
                    side: THREE.DoubleSide
                });

                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(
                    (bounds[1][0] + bounds[0][0]) / 2,
                    (bounds[1][1] + bounds[0][1]) / 2,
                    (bounds[1][2] + bounds[0][2]) / 2
                );

                interactionMeshesRef.current.set(mesh.uuid, {
                    mesh,
                    originalMaterial: material,
                    highlightMaterial
                });
                sceneRef.current.add(mesh);
            });
        };

        // 处理鼠标移动
        const handleMouseMove = (event) => {
            event.preventDefault();

            mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        // 动画循环
        const animate = () => {
            requestAnimationFrame(animate);

            if (controlsRef.current) {
                controlsRef.current.update();
            }

            // 射线检测
            if (raycasterRef.current && cameraRef.current) {
                raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

                const interactionMeshes = Array.from(interactionMeshesRef.current.values())
                    .map(({ mesh }) => mesh);

                const intersects = raycasterRef.current.intersectObjects(interactionMeshes);

                // 重置所有mesh的材质
                interactionMeshesRef.current.forEach(({ mesh, originalMaterial }) => {
                    mesh.material = originalMaterial;
                });

                // 高亮被悬停的mesh
                if (intersects.length > 0) {
                    const hoveredMesh = intersects[0].object;
                    const meshData = interactionMeshesRef.current.get(hoveredMesh.uuid);
                    if (meshData) {
                        hoveredMesh.material = meshData.highlightMaterial;
                    }
                }
            }

            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };

        // 处理窗口大小变化
        const handleResize = () => {
            if (cameraRef.current && rendererRef.current) {
                cameraRef.current.aspect = window.innerWidth / window.innerHeight;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(window.innerWidth, window.innerHeight);
            }
        };

        // 初始化
        initScene();
        loadModelAndMeta();

        // 添加事件监听
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        // 开始动画循环
        animate();

        // 清理函数
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);

            if (rendererRef.current && rendererRef.current.domElement) {
                rendererRef.current.domElement.remove();
            }

            // 清理资源
            interactionMeshesRef.current.forEach(({ mesh, originalMaterial, highlightMaterial }) => {
                mesh.geometry.dispose();
                originalMaterial.dispose();
                highlightMaterial.dispose();
            });
            interactionMeshesRef.current.clear();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                width: '100vw',
                height: '100vh'
            }}
        />
    );
};

export default InteractiveModelViewer;