import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ARModelEditor = ({ modelUrl }) => {
    const containerRef = useRef(null);
    const videoRef = useRef(null);
    const [hasDeviceOrientation, setHasDeviceOrientation] = useState(false);
    const [hasCamera, setHasCamera] = useState(false);

    // Three.js 组件
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const modelRef = useRef(null);

    useEffect(() => {
        // 初始化Three.js场景
        const initThreeJS = () => {
            const container = containerRef.current;
            const width = container.clientWidth;
            const height = container.clientHeight;

            // 创建场景
            const scene = new THREE.Scene();
            sceneRef.current = scene;

            // 创建相机
            const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            camera.position.z = 5;
            cameraRef.current = camera;

            // 创建渲染器
            const renderer = new THREE.WebGLRenderer({ alpha: true });
            renderer.setSize(width, height);
            renderer.setClearColor(0x000000, 0);
            container.appendChild(renderer.domElement);
            rendererRef.current = renderer;

            // 添加灯光
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(0, 1, 0);
            scene.add(directionalLight);

            // 加载模型
            if (modelUrl) {
                const loader = new GLTFLoader();
                loader.load(modelUrl, (gltf) => {
                    const model = gltf.scene;
                    modelRef.current = model;
                    scene.add(model);
                });
            }

            // 添加控制器
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;

            // 动画循环
            const animate = () => {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            };
            animate();
        };

        // 初始化摄像头
        const initCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setHasCamera(true);
                }
            } catch (error) {
                console.error('Camera access error:', error);
                setHasCamera(false);
            }
        };

        // 初始化设备方向检测
        const initDeviceOrientation = () => {
            if (window.DeviceOrientationEvent) {
                window.addEventListener('deviceorientation', handleOrientation);
                setHasDeviceOrientation(true);
            }
        };

        // 清理函数
        return () => {
            if (rendererRef.current) {
                const container = containerRef.current;
                container.removeChild(rendererRef.current.domElement);
            }
            window.removeEventListener('deviceorientation', handleOrientation);

            // 停止摄像头
            if (videoRef.current?.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, [modelUrl]);

    // 处理设备方向变化
    const handleOrientation = (event) => {
        if (!modelRef.current || !cameraRef.current) return;

        const { alpha, beta, gamma } = event;
        if (alpha !== null && beta !== null && gamma !== null) {
            // 将陀螺仪数据转换为相机旋转
            const rotation = new THREE.Euler(
                THREE.MathUtils.degToRad(beta),
                THREE.MathUtils.degToRad(gamma),
                THREE.MathUtils.degToRad(alpha)
            );
            cameraRef.current.setRotationFromEuler(rotation);
        }
    };

    return (
        <div className="relative w-full h-screen">
            {/* 摄像头预览 */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Three.js 容器 */}
            <div
                ref={containerRef}
                className="absolute inset-0 w-full h-full"
            />

            {/* 状态提示 */}
            {!hasCamera && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded">
                    无法访问摄像头
                </div>
            )}
            {!hasDeviceOrientation && (
                <div className="absolute top-16 left-4 bg-yellow-500 text-white px-4 py-2 rounded">
                    设备方向检测不可用
                </div>
            )}

            {/* 控制面板 */}
            <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-80 p-4 rounded">
                <h3 className="text-lg font-bold mb-2">AR模型编辑器</h3>
                <div className="flex space-x-4">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded">
                        重置视角
                    </button>
                    <button className="px-4 py-2 bg-green-500 text-white rounded">
                        保存更改
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ARModelEditor;