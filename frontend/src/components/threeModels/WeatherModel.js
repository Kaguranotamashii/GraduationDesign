import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {OrbitControls, useGLTF} from "@react-three/drei";
 
import { calculateModelCenterByBase } from "../../utils/calculateModelCenterByBase";
import * as THREE from "three";
import "./WeatherModel.css"; // 引入 CSS 文件

/**
 * 3D 模型组件
 */
const Model = () => {
    // 加载 GLTF 模型文件
    const { scene } = useGLTF("models/42.glb");

    // 计算模型的中心点和底部四点
    const { center, bottomPoints } = calculateModelCenterByBase(scene);

    return (
        <group>
            {/* 将模型整体移动到中心点位置 */}
            <group position={[-center.x, -2, -center.z]}>
                {/* 模型 */}
                <primitive object={scene} scale={0.8} />
            </group>

            {/* 可视化底部四点 */}
            {bottomPoints.map((point, index) => (
                <mesh key={index} position={[point.x, -0.5, point.z]}>
                    <sphereGeometry args={[0.1, 16, 16]} />
                    <meshBasicMaterial color="red" />
                </mesh>
            ))}

            {/* 可选的坐标轴助手 */}
            <axesHelper args={[5]} />
            {/* 可选的网格助手 */}
            <gridHelper args={[10, 10]} />
        </group>
    );
};

/**
 * 主组件
 */
const WeatherModel = () => {
    const cameraRef = useRef(); // 相机引用
    const canvasRef = useRef(null);

    // 初始相机位置
    const [cameraPosition] = useState(new THREE.Vector3(10, 0, 10));

    // 使用自定义相机控制
    // useCameraControl(cameraRef.current);

    return (
        <div className="container">
            {/* 银河背景 */}
            <div className="galaxyBackground"></div>

            {/* Three.js 渲染区域 */}
            <Canvas ref={canvasRef} camera={{ position: cameraPosition.toArray(), fov: 50 }} onCreated={({ camera }) => cameraRef.current = camera}>
                {/* 环境光 */}
                <ambientLight intensity={0.5} />
                {/* 方向光 */}
                <directionalLight position={[10, 10, 10]} intensity={1} />

                {/* 模型 */}
                <Suspense fallback={null}>
                    <Model />
                </Suspense>

                {/* 这里不需要 OrbitControls，已由自定义控制处理 */}
                <OrbitControls />
            </Canvas>
        </div>
    );
};

export default WeatherModel;
