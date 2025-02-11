import * as THREE from 'three';
import { Modal, Input } from 'antd';

class ModelMarkerManager {
    constructor(sceneManager, model) {
        this.sceneManager = sceneManager;
        this.model = model;
        this.isMarking = false;
        // 重用 Raycaster 和 Vector2 实例
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // 缓存计算用的向量对象
        this._vec3 = new THREE.Vector3();
        this._vec3_2 = new THREE.Vector3();
        this._vec3_3 = new THREE.Vector3();

        // 找到模型中的 mesh
        this.mesh = model.children.find(node => node.isMesh) || null;

        if (!this.mesh) {
            console.error('No mesh found in model');
            return;
        }

        // 创建材质 - 延迟创建 highlightMaterial
        this.defaultMaterial = this.mesh.material;
        this.highlightMaterial = null;

        // 初始化分组
        this.initializeGroups();

        // 绑定方法
        this.handleClick = this.handleClick.bind(this);

        // 标记缓存
        this.markers = new Map();
    }

    initializeGroups() {
        const geometry = this.mesh.geometry;
        const position = geometry.attributes.position;
        const normal = geometry.attributes.normal;
        const index = geometry.index;

        // 缓存顶点位置和法线数据
        const positionArray = position.array;
        const normalArray = normal.array;
        const indexArray = index.array;

        // 预分配面数组
        const faceCount = index.count / 3;
        this.faces = new Array(faceCount);

        // 创建面的数据结构
        for (let i = 0; i < index.count; i += 3) {
            const faceIndex = i / 3;
            const face = {
                indices: new Uint32Array([
                    indexArray[i],
                    indexArray[i + 1],
                    indexArray[i + 2]
                ]),
                normal: new THREE.Vector3(),
                center: new THREE.Vector3(),
                connected: new Set()  // 保留 Set 用于快速查找
            };

            // 计算面的法向量和中心点
            let vx = 0, vy = 0, vz = 0;
            let nx = 0, ny = 0, nz = 0;

            for (let j = 0; j < 3; j++) {
                const idx = face.indices[j] * 3;

                // 累加顶点位置
                vx += positionArray[idx];
                vy += positionArray[idx + 1];
                vz += positionArray[idx + 2];

                // 累加法线
                nx += normalArray[idx];
                ny += normalArray[idx + 1];
                nz += normalArray[idx + 2];
            }

            // 设置法线
            face.normal.set(nx / 3, ny / 3, nz / 3).normalize();

            // 设置中心点
            face.center.set(vx / 3, vy / 3, vz / 3);

            this.faces[faceIndex] = face;
        }

        // 找到相邻面
        this.findConnectedFaces();

        console.log(`Initialized ${this.faces.length} faces`);
    }

    findConnectedFaces() {
        // 使用数组代替 Map 来存储顶点到面的映射
        const vertexToFaces = new Array(this.mesh.geometry.attributes.position.count);
        for (let i = 0; i < vertexToFaces.length; i++) {
            vertexToFaces[i] = [];
        }

        // 构建顶点到面的映射
        this.faces.forEach((face, faceIndex) => {
            face.indices.forEach(vertexIndex => {
                vertexToFaces[vertexIndex].push(faceIndex);
            });
        });

        // 找到共享顶点的面
        this.faces.forEach((face, faceIndex) => {
            const potentialNeighbors = new Set();

            // 收集所有相邻面
            face.indices.forEach(vertexIndex => {
                vertexToFaces[vertexIndex].forEach(neighborIndex => {
                    if (neighborIndex !== faceIndex) {
                        potentialNeighbors.add(neighborIndex);
                    }
                });
            });

            // 检查每个潜在的邻居
            potentialNeighbors.forEach(neighborIndex => {
                if (this.areFacesSimilar(face, this.faces[neighborIndex])) {
                    face.connected.add(neighborIndex);
                }
            });
        });
    }

    areFacesSimilar(face1, face2) {
        // 使用点积快速比较法向量
        const normalDot = face1.normal.dot(face2.normal);
        if (Math.abs(normalDot) < 0.9) return false;

        // 使用缓存的向量计算距离
        return this._vec3.copy(face1.center)
            .sub(face2.center)
            .lengthSq() <= 0.01; // 平方距离阈值，避免开平方
    }

    startMarking() {
        if (this.isMarking) return;

        console.log('Starting marking mode');
        this.isMarking = true;
        const canvas = this.sceneManager.renderer.domElement;
        canvas.addEventListener('click', this.handleClick);
    }

    stopMarking() {
        if (!this.isMarking) return;

        this.isMarking = false;
        const canvas = this.sceneManager.renderer.domElement;
        canvas.removeEventListener('click', this.handleClick);
    }

    handleClick(event) {
        if (!this.isMarking) return;

        const intersect = this.getIntersection(event);
        if (intersect && intersect.faceIndex !== undefined) {
            this.selectConnectedFaces(intersect.faceIndex);
        }
    }

    getIntersection(event) {
        const canvas = this.sceneManager.renderer.domElement;
        const rect = canvas.getBoundingClientRect();

        // 重用已存在的 Vector2 实例
        this.mouse.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

        // 优化: 直接返回第一个交点
        const intersects = this.raycaster.intersectObject(this.mesh, false);
        return intersects[0] || null;
    }

    selectConnectedFaces(startFaceIndex) {
        // 使用数组替代 Set 来提高性能
        const selectedFaces = new Set();
        const queue = [startFaceIndex];
        let queueIndex = 0;  // 使用索引代替 shift() 操作

        while (queueIndex < queue.length) {
            const currentFaceIndex = queue[queueIndex++];
            if (selectedFaces.has(currentFaceIndex)) continue;

            selectedFaces.add(currentFaceIndex);
            const currentFace = this.faces[currentFaceIndex];

            // 添加所有相连的面到队列
            currentFace.connected.forEach(neighborIndex => {
                if (!selectedFaces.has(neighborIndex)) {
                    queue.push(neighborIndex);
                }
            });
        }

        // 高亮选中的面
        if (selectedFaces.size > 0) {
            this.highlightFaces(selectedFaces);
            this.promptForMarkerInfo(selectedFaces);
        }
    }

    highlightFaces(faceIndices) {
        // 延迟创建 highlightMaterial
        if (!this.highlightMaterial) {
            this.highlightMaterial = this.defaultMaterial.clone();
            this.highlightMaterial.color.setHex(0x00ff00);
            this.highlightMaterial.transparent = true;
            this.highlightMaterial.opacity = 0.8;
        }

        const geometry = this.mesh.geometry;

        // 优化材质组设置
        geometry.clearGroups();
        geometry.addGroup(0, geometry.index.count, 0);

        // 批量设置高亮面
        if (faceIndices.size > 0) {
            const sortedIndices = Array.from(faceIndices).sort((a, b) => a - b);
            let start = sortedIndices[0] * 3;
            let count = 3;

            for (let i = 1; i < sortedIndices.length; i++) {
                if (sortedIndices[i] === sortedIndices[i - 1] + 1) {
                    count += 3;
                } else {
                    geometry.addGroup(start, count, 1);
                    start = sortedIndices[i] * 3;
                    count = 3;
                }
            }
            geometry.addGroup(start, count, 1);
        }

        this.mesh.material = [this.defaultMaterial, this.highlightMaterial];
    }

    promptForMarkerInfo(selectedFaces) {
        Modal.confirm({
            title: '添加标记',
            content: (
                <Input.TextArea
                    placeholder="请输入该部位的说明信息"
                    rows={4}
                />
            ),
            onOk: (description) => {
                this.createMarker(description, selectedFaces);
            },
            onCancel: () => {
                this.clearSelection();
            },
        });
    }

    createMarker(description, selectedFaces) {
        const markerId = Date.now().toString();

        // 使用缓存的向量计算中心点
        const center = this._vec3_2.set(0, 0, 0);
        selectedFaces.forEach(faceIndex => {
            center.add(this.faces[faceIndex].center);
        });
        center.divideScalar(selectedFaces.size);

        // 保存标记信息
        this.markers.set(markerId, {
            id: markerId,
            faces: Array.from(selectedFaces),
            description: description,
            position: center.clone() // 需要克隆以保存独立的向量
        });

        this.clearSelection();
    }

    clearSelection() {
        if (!this.mesh) return;

        // 恢复默认材质
        const geometry = this.mesh.geometry;
        geometry.clearGroups();
        geometry.addGroup(0, geometry.index.count, 0);
        this.mesh.material = this.defaultMaterial;
    }

    dispose() {
        this.stopMarking();
        if (this.highlightMaterial) {
            this.highlightMaterial.dispose();
        }

        // 清理缓存的向量对象
        this._vec3 = null;
        this._vec3_2 = null;
        this._vec3_3 = null;

        // 清理其他引用
        this.faces = null;
        this.markers.clear();
        this.markers = null;
    }
}

export default ModelMarkerManager;