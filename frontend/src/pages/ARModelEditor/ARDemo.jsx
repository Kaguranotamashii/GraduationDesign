import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const ARDemoGyro = () => {
    const containerRef = useRef(null);
    const videoRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const cubeRef = useRef(null);

    const [hasPermission, setHasPermission] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let animationFrameId;

        const initAR = async () => {
            // 初始化Three.js场景
            const scene = new THREE.Scene();
            sceneRef.current = scene;

            // 设置相机
            const camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            camera.position.z = 5;
            cameraRef.current = camera;

            // 设置渲染器
            const renderer = new THREE.WebGLRenderer({ alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0x000000, 0);
            containerRef.current.appendChild(renderer.domElement);
            rendererRef.current = renderer;

            // 创建一个彩色立方体
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshPhongMaterial({
                color: 0x00ff00,
                specular: 0x555555,
                shininess: 30
            });
            const cube = new THREE.Mesh(geometry, material);
            cubeRef.current = cube;
            scene.add(cube);

            // 添加灯光
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(1, 1, 1);
            scene.add(directionalLight);

            const ambientLight = new THREE.AmbientLight(0x404040);
            scene.add(ambientLight);

            // 请求设备方向权限
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    const permission = await DeviceOrientationEvent.requestPermission();
                    setHasPermission(permission === 'granted');
                    if (permission === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                    }
                } catch (err) {
                    setError('需要设备方向访问权限');
                }
            } else {
                // 对于不需要权限的设备，直接添加监听器
                window.addEventListener('deviceorientation', handleOrientation);
                setHasPermission(true);
            }

            // 初始化摄像头
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                setError('无法访问摄像头');
            }
        };

        const handleOrientation = (event) => {
            if (!cameraRef.current) return;

            const { alpha, beta, gamma } = event;

            if (alpha !== null && beta !== null && gamma !== null) {
                // 将角度转换为弧度
                const alphaRad = THREE.MathUtils.degToRad(alpha);
                const betaRad = THREE.MathUtils.degToRad(beta);
                const gammaRad = THREE.MathUtils.degToRad(gamma);

                // 创建欧拉角
                const euler = new THREE.Euler(betaRad, alphaRad, -gammaRad, 'YXZ');

                // 应用旋转到相机
                cameraRef.current.setRotationFromEuler(euler);
            }
        };

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            // 旋转立方体
            if (cubeRef.current) {
                cubeRef.current.rotation.x += 0.01;
                cubeRef.current.rotation.y += 0.01;
            }

            // 渲染场景
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };

        // 初始化AR
        initAR();
        animate();

        // 清理函数
        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
            cancelAnimationFrame(animationFrameId);

            if (videoRef.current?.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }

            if (rendererRef.current && containerRef.current) {
                containerRef.current.removeChild(rendererRef.current.domElement);
            }
        };
    }, []);

    const requestPermission = async () => {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                setHasPermission(permission === 'granted');
                if (permission === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                }
            } catch (err) {
                setError('无法获取设备方向权限');
            }
        }
    };

    return (
        <div className="relative w-full h-screen overflow-hidden">
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

            {/* 错误提示 */}
            {error && (
                <div className="absolute top-4 left-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg">
                    {error}
                </div>
            )}

            {/* 权限请求按钮 */}
            {!hasPermission && (
                <button
                    onClick={requestPermission}
                    className="absolute top-20 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                    允许访问陀螺仪
                </button>
            )}

            {/* 提示信息 */}
            <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-80 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-2">AR 陀螺仪演示</h3>
                <p>移动设备来改变视角。绿色立方体会跟随设备方向变化。</p>
            </div>
        </div>
    );
};

export default ARDemoGyro;