import * as THREE from 'three';

/**
 * 计算模型底部中心点
 * @param {THREE.Object3D} scene - GLTF 模型的场景对象
 * @returns {Object} 包含模型中心点和底部四个顶点坐标
 */
export const calculateModelCenterByBase = (scene) => {
    // 存储底部点的数组
    const bottomPoints = [];
    const vertices = [];

    // 用于计算模型边界
    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject(scene);

    // 获取模型的最低点
    const minY = boundingBox.min.y;

    // 遍历模型中的所有 Mesh，提取几何体顶点
    scene.traverse((child) => {
        if (child.isMesh && child.geometry) {
            const geometry = child.geometry;
            const positionAttribute = geometry.attributes.position;

            // 如果几何体没有顶点，跳过
            if (!positionAttribute || positionAttribute.count === 0) {
                console.warn('Mesh has no vertices:', child);
                return;
            }

            // 获取模型的变换矩阵
            const matrixWorld = child.matrixWorld;

            // 提取顶点并转换为世界坐标
            for (let i = 0; i < positionAttribute.count; i++) {
                const vertex = new THREE.Vector3();
                vertex.fromBufferAttribute(positionAttribute, i);
                vertex.applyMatrix4(matrixWorld); // 转换为世界坐标
                vertices.push(vertex);

                // 如果顶点接近最低点，则认为是底部点
                if (Math.abs(vertex.y - minY) < 0.001) { // 更严格的阈值
                    bottomPoints.push(vertex);
                }
            }
        }
    });

    // 如果没有底部点，返回模型的中心点
    if (bottomPoints.length === 0) {
        console.warn('No bottom points found. Using bounding box center.');
        const center = new THREE.Vector3();
        boundingBox.getCenter(center);
        return { center, bottomPoints: [] };
    }

    // 找到底部最远的四个点
    const farthestPoints = findFarthestFourPoints(bottomPoints);

    // 根据四个点计算中间点
    const center = calculateCenterFromFourPoints(farthestPoints);

    // 输出调试信息
    console.log('Model center:', center);
    console.log('Bottom points:', farthestPoints);

    return { center, bottomPoints: farthestPoints };

    /**
     * 找到底部最远的四个点
     * @param {THREE.Vector3[]} points - 底部所有点
     * @returns {THREE.Vector3[]} 最远的四个点
     */
    function findFarthestFourPoints(points) {
        if (points.length <= 4) return points;

        // 找到最远的四个点
        const farthestPoints = [];
        const center = calculateCenterFromFourPoints(points);

        // 计算每个点相对于中心点的距离
        const distances = points.map((point) => ({
            point,
            distance: point.distanceTo(center),
        }));

        // 按距离从大到小排序
        distances.sort((a, b) => b.distance - a.distance);

        // 选择最远的四个点
        for (let i = 0; i < 4; i++) {
            farthestPoints.push(distances[i].point);
        }

        return farthestPoints;
    }

    /**
     * 根据四个点计算中间点
     * @param {THREE.Vector3[]} points - 四个点
     * @returns {THREE.Vector3} 中间点
     */
    function calculateCenterFromFourPoints(points) {
        if (points.length === 0) {
            return new THREE.Vector3();
        }

        const center = new THREE.Vector3();
        points.forEach((point) => center.add(point));
        center.divideScalar(points.length); // 取平均值
        return center;
    }
};