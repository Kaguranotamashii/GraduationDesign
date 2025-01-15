import React, {useEffect, useRef, useState} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";


const CameraFeed = () => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" }, // 后置摄像头
                });
                videoRef.current.srcObject = stream;
            } catch (err) {
                console.error("摄像头启动失败：", err);
            }
        };
        startCamera();
    }, []);

    const handlePlay = () => {
        if (videoRef.current && !isPlaying) {
            videoRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch((err) => {
                console.error("视频播放失败：", err);
            });
        }
    };

    return (
        <>
            <video
                ref={videoRef}
                muted
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    zIndex: -1,
                }}
            />
            {!isPlaying && (
                <button onClick={handlePlay} style={{ position: "absolute", zIndex: 10 }}>
                    点击开始播放
                </button>
            )}
        </>
    );
};
// 3D 模型组件
const Model = ({position}) => {
    const {scene} = useGLTF("model/42.glb");
    return <primitive object={scene} scale={0.2} position={position}/>;
};

// 平面检测和模型显示
const PlaneDetector = () => {
    const planeRef = useRef();
    const modelPosition = useRef([0, 0, 0]); // 模型位置

    // 动态检测平面
    useEffect(() => {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const detectPlane = (event) => {
            const { clientX, clientY } = event;

            // 转换为标准化设备坐标
            mouse.x = (clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(clientY / window.innerHeight) * 2 + 1;

            // 射线投射
            raycaster.setFromCamera(mouse, planeRef.current);

            // 如果射线与平面相交，更新模型位置
            const intersects = raycaster.intersectObject(planeRef.current);
            if (intersects.length > 0) {
                modelPosition.current = intersects[0].point;
            }
        };

        window.addEventListener("click", detectPlane);
        return () => window.removeEventListener("click", detectPlane);
    }, []);

    return (
        <>
            {/* 检测平面 */}
            <mesh ref={planeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
                <planeGeometry args={[10, 10]} />
                <meshBasicMaterial color="gray" transparent opacity={0.2} />
            </mesh>

            {/* 显示模型 */}
            <Model position={modelPosition.current} />
        </>
    );
};

// 主组件
const ARApp = () => {
    return (
        <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
            {/* 摄像头背景 */}
            <CameraFeed />

            {/* 3D 场景 */}
            <Canvas>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 10]} intensity={1} />
                <PlaneDetector />
                <OrbitControls />
            </Canvas>
        </div>
    );
};

export default ARApp;
