
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import "./WeatherModel.css"; // 引入 CSS 文件

/**
 * 3D 模型组件
 */
const Model = () => {
    // 加载 GLTF 模型文件
    const { scene } = useGLTF("model/42.glb");

    return (
        <group>
            {/* 模型 */}
            <primitive object={scene} scale={0.8} position={[-4.5, -2.8, 4.5]} />
             坐标轴助手（可选）
            <axesHelper args={[5]} />
             网格助手（可选）
            <gridHelper args={[10, 10]} />
        </group>
    );
};

/**
 * 主组件
 */
const WeatherModel = () => {
    return (
        <div className="container">
            {/* 银河背景 */}
            <div className="galaxyBackground"></div>

            {/* Three.js 渲染区域 */}
            <Canvas camera={{ position: [10, 0, 10], fov: 50 }}>
                {/* 环境光 */}
                <ambientLight intensity={0.5} />
                {/* 方向光 */}
                <directionalLight position={[10, 10, 10]} intensity={1} />

                {/* 模型 */}
                <Suspense fallback={null}>
                    <Model />
                </Suspense>

                {/* 控制器：禁止缩放和平移，仅允许围绕中心点旋转 */}
                <OrbitControls />
            </Canvas>
        </div>
    );
};

export default WeatherModel;