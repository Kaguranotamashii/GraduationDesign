import * as THREE from 'three';
// src/utils/calculateModelCenterByBase
/**
 * 计算模型底部中心点
 * @param {THREE.Object3D} scene - GLTF 模型的场景对象
 * @returns {Object} 包含模型中心点和底部四个顶点坐标
 */
export const calculateModelCenterByBase = (scene) => {
    // 存储底部点的数组
    const bottomPoints = [];
    const vertices = [];

    // 遍历模型中的所有 Mesh，提取几何体顶点
    scene.traverse((child) => {
        if (child.isMesh && child.geometry) {
            const positionAttribute = child.geometry.attributes.position;

            for (let i = 0; i < positionAttribute.count; i++) {
                const vertex = new THREE.Vector3();
                vertex.fromBufferAttribute(positionAttribute, i);
                vertex.applyMatrix4(child.matrixWorld); // 转换为世界坐标
                vertices.push(vertex);
            }
        }
    });

    // 找到模型的最低点
    const minY = Math.min(...vertices.map((v) => v.y));

    // 筛选出所有底部的点
    vertices.forEach((vertex) => {
        if (Math.abs(vertex.y - minY) < 0.01) {
            bottomPoints.push(vertex);
        }
    });

    // 找到底部最远的四个点
    const farthestPoints = findFarthestFourPoints(bottomPoints);

    // 根据四个点计算中间点
    const center = calculateCenterFromFourPoints(farthestPoints);

    return { center, bottomPoints: farthestPoints };
};

/**
 * 找到底部最远的四个点
 * @param {THREE.Vector3[]} points - 底部所有点
 * @returns {THREE.Vector3[]} 最远的四个点
 */
const findFarthestFourPoints = (points) => {
    if (points.length <= 4) return points;

    // 计算所有点对之间的距离
    const distances = [];
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const distance = points[i].distanceTo(points[j]);
            distances.push({
                points: [points[i], points[j]],
                distance: distance,
            });
        }
    }

    // 按距离排序，选择最远的四个点对
    distances.sort((a, b) => b.distance - a.distance);

    const farthestPointsSet = new Set();
    distances.slice(0, 4).forEach((item) => {
        farthestPointsSet.add(item.points[0]);
        farthestPointsSet.add(item.points[1]);
    });

    // 如果有超过四个点，截取最远的四个点
    return Array.from(farthestPointsSet).slice(0, 4);
};

/**
 * 根据四个点计算中间点
 * @param {THREE.Vector3[]} points - 四个点
 * @returns {THREE.Vector3} 中间点
 */
const calculateCenterFromFourPoints = (points) => {
    const center = new THREE.Vector3();
    points.forEach((point) => center.add(point));
    center.divideScalar(points.length); // 取平均值
    return center;
};
