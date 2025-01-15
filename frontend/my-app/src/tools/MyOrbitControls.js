import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';

/**
 * 自定义的相机控制 Hook：用于旋转、平移和缩放
 * @param {THREE.PerspectiveCamera} camera 相机对象
 */
const useCameraControl = (camera) => {
    const [isDragging, setIsDragging] = useState(false);
    const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
    const [isRightDragging, setIsRightDragging] = useState(false);
    const [zoomFactor, setZoomFactor] = useState(1);
    const [isZooming, setIsZooming] = useState(false);

    const rotateSpeed = 0.005;  // 旋转速度
    const zoomSpeed = 0.1;     // 缩放速度
    const moveSpeed = 0.1;     // 平移速度

    // 鼠标按下事件 - 旋转
    const handleMouseDown = (event) => {
        if (event.button === 0) {
            setIsDragging(true); // 左键按下开始旋转
            setLastPosition({ x: event.clientX, y: event.clientY });
        }

        if (event.button === 2) {
            setIsRightDragging(true); // 右键按下开始平移
            setLastPosition({ x: event.clientX, y: event.clientY });
        }
    };

    // 鼠标移动事件 - 旋转/平移
    const handleMouseMove = (event) => {
        if (isDragging) {
            const dx = event.clientX - lastPosition.x;
            const dy = event.clientY - lastPosition.y;

            // 控制相机旋转
            camera.rotation.y -= dx * rotateSpeed;
            camera.rotation.x += dy * rotateSpeed;

            setLastPosition({ x: event.clientX, y: event.clientY });
        }

        if (isRightDragging) {
            const dx = event.clientX - lastPosition.x;
            const dy = event.clientY - lastPosition.y;

            // 控制相机平移
            camera.position.x -= dx * moveSpeed;
            camera.position.y += dy * moveSpeed;

            setLastPosition({ x: event.clientX, y: event.clientY });
        }
    };

    // 鼠标抬起事件 - 停止旋转/平移
    const handleMouseUp = () => {
        setIsDragging(false);
        setIsRightDragging(false);
    };

    // 滚轮事件 - 缩放
    const handleWheel = (event) => {
        if (event.deltaY > 0) {
            camera.position.z += zoomSpeed; // 缩小
        } else {
            camera.position.z -= zoomSpeed; // 放大
        }
    };

    useEffect(() => {
        const canvas = document.querySelector("canvas");

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('wheel', handleWheel);

        // 防止右键菜单弹出
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('wheel', handleWheel);
        };
    }, [camera]);

    return null;
};

export default useCameraControl;
