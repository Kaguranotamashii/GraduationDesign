// tools/CameraControl.js

import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';

/**
 * 自定义的相机控制 Hook：用于旋转、平移和缩放
 * @param {THREE.PerspectiveCamera} camera 相机对象
 */
const useCameraControl = (camera) => {
    const [isDragging, setIsDragging] = useState(false);
    const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
    const [zoomFactor, setZoomFactor] = useState(1);

    const rotateSpeed = 0.005;
    const zoomSpeed = 0.1;
    const moveSpeed = 0.05;

    const handleMouseDown = (event) => {
        if (event.button === 0) {
            setIsDragging(true);
            setLastPosition({ x: event.clientX, y: event.clientY });
        }
    };

    const handleMouseMove = (event) => {
        if (!isDragging) return;

        const dx = event.clientX - lastPosition.x;
        const dy = event.clientY - lastPosition.y;

        // 控制相机旋转
        camera.rotation.y -= dx * rotateSpeed;
        camera.rotation.x += dy * rotateSpeed;

        setLastPosition({ x: event.clientX, y: event.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (event) => {
        const zoomAmount = event.deltaY > 0 ? zoomSpeed : -zoomSpeed;
        camera.position.z += zoomAmount;
    };

    const handleMouseMove2D = (event) => {
        if (event.buttons !== 1) return;

        const dx = event.movementX * moveSpeed;
        const dy = -event.movementY * moveSpeed;

        camera.position.x += dx;
        camera.position.y += dy;
    };

    useEffect(() => {
        const canvas = document.querySelector("canvas");

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('wheel', handleWheel);
        canvas.addEventListener('mousemove', handleMouseMove2D);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('wheel', handleWheel);
            canvas.removeEventListener('mousemove', handleMouseMove2D);
        };
    }, [camera]);

    return null;
};

export default useCameraControl;
