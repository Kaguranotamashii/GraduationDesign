/**
 * 计算模型底部中心点
 * @param {Object} scene - GLTF 模型的场景对象
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

            // 如果几何体没有顶点，跳过
            if (!positionAttribute || positionAttribute.count === 0) {
                console.warn('Mesh has no vertices:', child);
                return;
            }

            // 获取模型的变换矩阵
            const matrixWorld = child.matrixWorld.elements;

            // 提取顶点并转换为世界坐标
            for (let i = 0; i < positionAttribute.count; i++) {
                const x = positionAttribute.getX(i);
                const y = positionAttribute.getY(i);
                const z = positionAttribute.getZ(i);

                // 手动应用变换矩阵
                const wx = matrixWorld[0] * x + matrixWorld[4] * y + matrixWorld[8] * z + matrixWorld[12];
                const wy = matrixWorld[1] * x + matrixWorld[5] * y + matrixWorld[9] * z + matrixWorld[13];
                const wz = matrixWorld[2] * x + matrixWorld[6] * y + matrixWorld[10] * z + matrixWorld[14];

                const vertex = { x: wx, y: wy, z: wz };
                vertices.push(vertex);
            }
        }
    });

    // 找到模型的最低点
    const minY = vertices.reduce((min, v) => (v.y < min ? v.y : min), Infinity);

    // 筛选出所有底部的点
    vertices.forEach((vertex) => {
        if (Math.abs(vertex.y - minY) < 0.001) { // 更严格的阈值
            bottomPoints.push(vertex);
        }
    });

    // 如果没有底部点，返回 (0, 0, 0)
    if (bottomPoints.length === 0) {
        console.warn('No bottom points found. Using (0, 0, 0) as center.');
        return { center: { x: 0, y: 0, z: 0 }, bottomPoints: [] };
    }

    // 找到底部最远的四个点
    const farthestPoints = findFarthestFourPoints(bottomPoints);

    // 根据四个点计算中间点
    const center = calculateCenterFromFourPoints(farthestPoints);

    return { center, bottomPoints: farthestPoints };
};

/**
 * 找到底部最远的四个点
 * @param {Object[]} points - 底部所有点
 * @returns {Object[]} 最远的四个点
 */
const findFarthestFourPoints = (points) => {
    if (points.length <= 4) return points;

    // 找到最远的四个点
    const farthestPoints = [];
    const center = calculateCenterFromFourPoints(points);

    // 计算每个点相对于中心点的距离
    const distances = points.map((point) => ({
        point,
        distance: Math.sqrt(
            (point.x - center.x) ** 2 +
            (point.y - center.y) ** 2 +
            (point.z - center.z) ** 2
        ),
    }));

    // 按距离从大到小排序
    distances.sort((a, b) => b.distance - a.distance);

    // 选择最远的四个点
    for (let i = 0; i < 4; i++) {
        farthestPoints.push(distances[i].point);
    }

    return farthestPoints;
};

/**
 * 根据四个点计算中间点
 * @param {Object[]} points - 四个点
 * @returns {Object} 中间点
 */
const calculateCenterFromFourPoints = (points) => {
    if (points.length === 0) {
        return { x: 0, y: 0, z: 0 };
    }

    const center = { x: 0, y: 0, z: 0 };
    points.forEach((point) => {
        center.x += point.x;
        center.y += point.y;
        center.z += point.z;
    });
    center.x /= points.length;
    center.y /= points.length;
    center.z /= points.length;

    return center;
};