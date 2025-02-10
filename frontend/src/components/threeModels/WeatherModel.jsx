import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const Model = ({ themeColor }) => {
    const { scene } = useGLTF("models/42.glb");

    // 创建材质
    const material = new THREE.MeshPhysicalMaterial({
        color: themeColor,
        metalness: 0.3,
        roughness: 0.2,
        transparent: true,
        opacity: 0.9,
    });

    // 遍历模型中的所有网格并应用材质
    scene.traverse((child) => {
        if (child.isMesh) {
            child.material = material;
        }
    });

    return (
        <group position={[0, -1.5, 0]} scale={0.6}>
            <primitive object={scene} />
            {/* 环绕粒子效果 */}
            <points>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={1000}
                        array={new Float32Array(1000 * 3).map(() => THREE.MathUtils.randFloatSpread(5))}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.05}
                    color={themeColor}
                    transparent
                    opacity={0.7}
                />
            </points>
        </group>
    );
};

const WeatherModel = ({ scrollProgress = 0 }) => {
    const [themeColor, setThemeColor] = useState("#87CEEB");
    const [backgroundColor, setBackgroundColor] = useState("#e0f2fe");
    const canvasRef = useRef(null);

    // 更新背景颜色
    useEffect(() => {
        const targetColor = scrollProgress > 0.8 ? "#1a365d" : "#e0f2fe";
        setBackgroundColor(targetColor);
    }, [scrollProgress]);

    // 更新主题颜色
    useEffect(() => {
        const colors = [
            ["#87CEEB", 0],   // 天蓝色
            ["#4682b4", 0.5], // 钢青色
            ["#1e3c72", 1]    // 深蓝色
        ];
        const colorIndex = Math.floor(scrollProgress * colors.length);
        setThemeColor(colors[colorIndex]?.[0] || "#87CEEB");
    }, [scrollProgress]);

    return (
        <div
            className="relative w-screen h-screen overflow-hidden"
            style={{
                backgroundColor,
                transition: 'background-color 0.3s ease-in-out'
            }}
        >
            <Canvas
                ref={canvasRef}
                className="absolute inset-0"
                camera={{ position: [5, 3, 5], fov: 45 }}
            >
                {/* 光照系统 */}
                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[5, 5, 5]}
                    intensity={1.2}
                    color={themeColor}
                />
                <hemisphereLight
                    intensity={0.5}
                    color="#ffffff"
                    groundColor="#404040"
                />

                <Suspense fallback={null}>
                    <Model themeColor={themeColor} />
                </Suspense>

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                    maxPolarAngle={Math.PI/2}
                    minPolarAngle={Math.PI/4}
                />
            </Canvas>

            <div className="absolute bottom-8 left-8 text-white">
                <h2 className="text-4xl font-light mb-2">Weather Station</h2>
                <div className="flex gap-4 opacity-75">
                    <div className="weather-data">
                        <span className="text-2xl">24°C</span>
                        <p className="text-sm">Temperature</p>
                    </div>
                    <div className="weather-data">
                        <span className="text-2xl">65%</span>
                        <p className="text-sm">Humidity</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherModel;