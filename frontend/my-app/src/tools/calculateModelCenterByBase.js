import * as THREE from "three";

/**
 * 计算模型底部的中心点和凸包点
 * @param {THREE.Object3D} scene - Three.js 场景对象
 * @returns {Object} - 返回中心点和底部点
 */
export function calculateModelCenterByBase(scene) {
    const vertices = []; // 存储模型所有的顶点

    // 遍历场景对象，提取所有的顶点
    scene.traverse((child) => {
        if (child.isMesh) {
            const geometry = child.geometry;
            geometry.computeBoundingBox(); // 确保有边界盒信息
            const position = geometry.attributes.position;
            const vector = new THREE.Vector3();

            for (let i = 0; i < position.count; i++) {
                vector.fromBufferAttribute(position, i).applyMatrix4(child.matrixWorld);
                vertices.push(vector.clone());
            }
        }
    });

    // 筛选底部点
    const minY = Math.min(...vertices.map((v) => v.y)); // 找到最小的 y 值
    const bottomPoints = vertices.filter((v) => Math.abs(v.y - minY) < 0.1); // 允许一些浮动误差

    // 使用凸包算法计算底部点的凸包
    const convexHull = new THREE.ConvexHull();
    convexHull.setFromPoints(bottomPoints);

    // 获取凸包点的几何中心
    const convexHullPoints = convexHull.vertices.map((v) => v.clone());
    const center = new THREE.Vector3();
    convexHullPoints.forEach((point) => {
        center.add(point);
    });
    center.divideScalar(convexHullPoints.length); // 求平均值

    return { center, bottomPoints };
}
