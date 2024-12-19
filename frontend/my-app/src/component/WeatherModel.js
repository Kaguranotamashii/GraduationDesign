
import React, { useEffect, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Sky, Text } from '@react-three/drei'; // 导入 Text 组件
import { useSpring, animated } from 'react-spring';
import { DirectionalLight, MeshStandardMaterial, Points, BufferGeometry, Float32BufferAttribute } from 'three';

const WeatherModel = () => {
    // 状态管理，控制天气效果
    const [weather, setWeather] = useState('clear'); // 默认天气是晴天
    const [timeOfDay, setTimeOfDay] = useState('day'); // 默认是白天



    // 模拟根据时间动态变化的天气
    useEffect(() => {
        const currentTime = new Date();
        const hours = currentTime.getHours();

        // 根据小时来设置白天和夜晚
        if (hours >= 6 && hours < 18) {
            setTimeOfDay('day');
        } else {
            setTimeOfDay('night');
        }

        // 设置随机天气
        const weatherOptions = ['clear', 'rain', 'snow'];
        setWeather('rain');
    }, []);

    // 使用 useSpring 来动画化光照的强度
    const { lightIntensity, lightPosition } = useSpring({
        lightIntensity: timeOfDay === 'day' ? 1 : 0.1, // 白天光照强度为 1，晚上为 0.1
        lightPosition: timeOfDay === 'day' ? [5, 5, 5] : [0, -5, 5], // 日间的光源位置和夜间的光源位置不同
        config: { tension: 200, friction: 30 },
    });



    return (
        <div style={{ height: '100vh', backgroundColor: 'black' }}>
            <Canvas>
                <ambientLight intensity={0.3} />

                {/* 动画化的光照，根据时间控制强度和位置 */}
                <directionalLight
                    position={lightPosition} // 光照的位置随时间改变
                    intensity={lightIntensity} // 光照强度随时间改变
                    castShadow
                />

                <Sky sunPosition={[100, 100, 100]} />
                <OrbitControls />

                {/* 使用 Suspense 来包裹异步加载的 3D 模型 */}
                <Suspense fallback={<LoadingText />}> {/* 替换为 LoadingText 组件 */}
                    <Model />
                </Suspense>

                {weather === 'rain' && <RainEffect />}
                {weather === 'snow' && <SnowEffect />}
            </Canvas>
        </div>
    );
};

// 3D 模型组件

// 3D 模型组件
const Model = () => {
    const { scene } = useGLTF('model/42.glb');

    // 调试信息
    useEffect(() => {
        console.log('Loaded scene:', scene);
        if (scene) {
            scene.traverse(child => {
                if (child.isMesh) {
                    console.log('Mesh with material:', child.material);
                    if (child.material.map) {
                        console.log('Texture loaded:', child.material.map.image.src);
                    } else {
                        console.warn('No texture found on mesh:', child.name);
                    }
                }
            });
        }
    }, [scene]);

    if (!scene) {
        console.error('Failed to load model');
        return null; // 如果模型加载失败，返回空或显示加载中的提示
    }
    return <primitive object={scene} scale={0.5} position={[0, 0, 0]} />;
};

// 雨天效果
const RainEffect = () => {
    const rainCount = 1000; // 雨滴数量

    // 创建雨滴粒子
    const geometry = new BufferGeometry();
    const positions = [];
    for (let i = 0; i < rainCount; i++) {
        positions.push(Math.random() * 200 - 100); // x
        positions.push(Math.random() * 200); // y
        positions.push(Math.random() * 200 - 100); // z
    }
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));

    const material = new MeshStandardMaterial({ color: 'gray', transparent: true, opacity: 0.6 });

    return (
        <points geometry={geometry} material={material} />
    );
};

// 雪天效果
const SnowEffect = () => {
    const snowCount = 1000; // 雪花数量

    // 创建雪花粒子
    const geometry = new BufferGeometry();
    const positions = [];
    for (let i = 0; i < snowCount; i++) {
        positions.push(Math.random() * 200 - 100); // x
        positions.push(Math.random() * 200); // y
        positions.push(Math.random() * 200 - 100); // z
    }
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));

    const material = new MeshStandardMaterial({ color: 'white', transparent: true, opacity: 0.7 });

    return (
        <points geometry={geometry} material={material} />
    );
};

// 加载文本组件
const LoadingText = () => {
    return (
        <Text
            position={[0, 0, 0]}
            fontSize={1}
            color="white"
            anchorX="center"
            anchorY="middle"
        >
            Loading...
        </Text>
    );
};

export default WeatherModel;