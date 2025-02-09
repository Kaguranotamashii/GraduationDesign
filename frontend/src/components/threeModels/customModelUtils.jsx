import * as THREE from 'three';

/**
 * 自定义包围盒类
 */
class CustomBoundingBox {
    constructor() {
        this.min = new THREE.Vector3(Infinity, Infinity, Infinity);
        this.max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    }

    /**
     * 扩展包围盒以包含指定点
     * @param {THREE.Vector3} point - 需要包含的点
     */
    expandByPoint(point) {
        this.min.x = Math.min(this.min.x, point.x);
        this.min.y = Math.min(this.min.y, point.y);
        this.min.z = Math.min(this.min.z, point.z);

        this.max.x = Math.max(this.max.x, point.x);
        this.max.y = Math.max(this.max.y, point.y);
        this.max.z = Math.max(this.max.z, point.z);
    }

    /**
     * 获取包围盒的中心点
     * @returns {THREE.Vector3} 中心点
     */
    getCenter() {
        return new THREE.Vector3(
            (this.min.x + this.max.x) / 2,
            (this.min.y + this.max.y) / 2,
            (this.min.z + this.max.z) / 2
        );
    }

    /**
     * 获取包围盒的尺寸
     * @returns {THREE.Vector3} 尺寸向量
     */
    getSize() {
        return new THREE.Vector3(
            this.max.x - this.min.x,
            this.max.y - this.min.y,
            this.max.z - this.min.z
        );
    }
}

/**
 * 从模型中提取所有顶点
 * @param {THREE.Object3D} model - 3D模型对象
 * @returns {THREE.Vector3[]} 顶点数组
 */
const extractVertices = (model) => {
    const vertices = [];

    model.traverse((child) => {
        if (child.isMesh && child.geometry) {
            const positionAttribute = child.geometry.attributes.position;
            const vertexCount = positionAttribute.count;

            // 获取当前mesh的世界变换矩阵
            const worldMatrix = child.matrixWorld;

            // 遍历所有顶点
            for (let i = 0; i < vertexCount; i++) {
                const vertex = new THREE.Vector3();
                vertex.fromBufferAttribute(positionAttribute, i);
                // 应用世界变换
                vertex.applyMatrix4(worldMatrix);
                vertices.push(vertex);
            }
        }
    });

    return vertices;
};

/**
 * 计算模型的几何信息
 * @param {THREE.Object3D} model - 3D模型对象
 * @returns {{
 *   boundingBox: CustomBoundingBox,
 *   center: THREE.Vector3,
 *   groundCenter: THREE.Vector3,
 *   dimensions: THREE.Vector3,
 *   vertices: THREE.Vector3[]
 * }}
 */
export const calculateModelGeometry = (model) => {
    // 确保模型矩阵是最新的
    model.updateWorldMatrix(true, true);

    // 提取所有顶点
    const vertices = extractVertices(model);

    // 计算自定义包围盒
    const boundingBox = new CustomBoundingBox();
    vertices.forEach(vertex => boundingBox.expandByPoint(vertex));

    // 计算中心点和尺寸
    const center = boundingBox.getCenter();
    const dimensions = boundingBox.getSize();

    // 计算底部中心点
    const groundCenter = new THREE.Vector3(
        center.x,
        boundingBox.min.y,
        center.z
    );

    return {
        boundingBox,
        center,
        groundCenter,
        dimensions,
        vertices
    };
};

/**
 * 计算适合模型的相机位置
 * @param {Object} geometry - 模型几何信息
 * @param {number} [fov=75] - 相机视场角
 * @returns {{
 *   position: THREE.Vector3,
 *   target: THREE.Vector3,
 *   distance: number
 * }}
 */
export const calculateOptimalCameraPosition = (geometry, fov = 75) => {
    const { center, dimensions } = geometry;

    // 计算合适的相机距离
    const maxDimension = Math.max(dimensions.x, dimensions.y, dimensions.z);
    const distance = maxDimension / (2 * Math.tan(fov * Math.PI / 360));

    // 计算相机位置（45度角俯视）
    const angle = Math.PI / 4; // 45度
    const height = distance * Math.sin(angle);
    const offset = distance * Math.cos(angle);

    const position = new THREE.Vector3(
        center.x + offset,
        center.y + height,
        center.z + offset
    );

    return {
        position,
        target: center.clone(),
        distance
    };
};

/**
 * 调整模型位置和旋转
 * @param {THREE.Object3D} model - 3D模型对象
 * @param {Object} geometry - 模型几何信息
 * @param {Object} options - 调整选项
 */
export const adjustModel = (model, geometry, options = {}) => {
    const { alignToGround = true, position, rotation } = options;

    if (alignToGround) {
        // 将模型底部对齐到地面
        const offset = new THREE.Vector3(0, -geometry.boundingBox.min.y, 0);
        model.position.add(offset);
    }

    if (position) {
        model.position.add(position);
    }

    if (rotation) {
        model.rotation.copy(rotation);
    }

    // 更新模型矩阵
    model.updateMatrix();
};