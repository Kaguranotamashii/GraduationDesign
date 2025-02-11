import * as THREE from 'three';
import { Modal, Input } from 'antd';

class ModelMarkerManager {
    constructor(sceneManager, model) {
        this.sceneManager = sceneManager;
        this.model = model;
        this.isMarking = false;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // 找到模型中的 mesh
        this.mesh = null;
        model.traverse((node) => {
            if (node.isMesh) {
                this.mesh = node;
            }
        });

        if (!this.mesh) {
            console.error('No mesh found in model');
            return;
        }

        // 创建材质
        this.defaultMaterial = this.mesh.material;
        this.highlightMaterial = this.defaultMaterial.clone();
        this.highlightMaterial.color.setHex(0x00ff00);
        this.highlightMaterial.transparent = true;
        this.highlightMaterial.opacity = 0.8;

        // 初始化分组
        this.initializeGroups();

        // 绑定方法
        this.handleClick = this.handleClick.bind(this);
    }

    initializeGroups() {
        const geometry = this.mesh.geometry;
        const position = geometry.attributes.position;
        const normal = geometry.attributes.normal;
        const index = geometry.index;

        // 创建面的数据结构
        this.faces = [];
        for (let i = 0; i < index.count; i += 3) {
            const face = {
                indices: [
                    index.getX(i),
                    index.getX(i + 1),
                    index.getX(i + 2)
                ],
                normal: new THREE.Vector3(),
                center: new THREE.Vector3(),
                connected: new Set()  // 连接的面
            };

            // 计算面的法向量
            const v1 = new THREE.Vector3(
                position.getX(face.indices[0]),
                position.getY(face.indices[0]),
                position.getZ(face.indices[0])
            );
            const v2 = new THREE.Vector3(
                position.getX(face.indices[1]),
                position.getY(face.indices[1]),
                position.getZ(face.indices[1])
            );
            const v3 = new THREE.Vector3(
                position.getX(face.indices[2]),
                position.getY(face.indices[2]),
                position.getZ(face.indices[2])
            );

            // 计算面的法向量（使用顶点的平均法向量）
            face.normal.set(0, 0, 0);
            for (let j = 0; j < 3; j++) {
                face.normal.add(new THREE.Vector3(
                    normal.getX(face.indices[j]),
                    normal.getY(face.indices[j]),
                    normal.getZ(face.indices[j])
                ));
            }
            face.normal.normalize();

            // 计算面的中心点
            face.center.addVectors(v1, v2).add(v3).divideScalar(3);

            this.faces.push(face);
        }

        // 找到相邻面
        this.findConnectedFaces();

        console.log(`Initialized ${this.faces.length} faces`);
    }

    findConnectedFaces() {
        // 创建顶点到面的映射
        const vertexToFaces = new Map();
        this.faces.forEach((face, faceIndex) => {
            face.indices.forEach(vertexIndex => {
                if (!vertexToFaces.has(vertexIndex)) {
                    vertexToFaces.set(vertexIndex, new Set());
                }
                vertexToFaces.get(vertexIndex).add(faceIndex);
            });
        });

        // 找到共享顶点的面
        this.faces.forEach((face, faceIndex) => {
            const potentialNeighbors = new Set();
            face.indices.forEach(vertexIndex => {
                vertexToFaces.get(vertexIndex).forEach(neighborIndex => {
                    if (neighborIndex !== faceIndex) {
                        potentialNeighbors.add(neighborIndex);
                    }
                });
            });

            // 检查每个潜在的邻居
            potentialNeighbors.forEach(neighborIndex => {
                const neighbor = this.faces[neighborIndex];
                // 检查法向量夹角和距离
                if (this.areFacesSimilar(face, neighbor)) {
                    face.connected.add(neighborIndex);
                }
            });
        });
    }

    areFacesSimilar(face1, face2) {
        // 检查法向量夹角
        const normalDot = face1.normal.dot(face2.normal);
        if (Math.abs(normalDot) < 0.9) { // 约26度
            return false;
        }

        // 检查距离
        const distance = face1.center.distanceTo(face2.center);
        const threshold = 0.1; // 根据模型大小调整
        if (distance > threshold) {
            return false;
        }

        return true;
    }

    startMarking() {
        console.log('Starting marking mode');
        this.isMarking = true;
        const canvas = this.sceneManager.renderer.domElement;
        canvas.addEventListener('click', this.handleClick);
    }

    stopMarking() {
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

        this.mouse.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);
        const intersects = this.raycaster.intersectObject(this.mesh);

        return intersects.length > 0 ? intersects[0] : null;
    }

    selectConnectedFaces(startFaceIndex) {
        // 使用广度优先搜索找到所有相连的相似面
        const selectedFaces = new Set();
        const queue = [startFaceIndex];

        while (queue.length > 0) {
            const currentFaceIndex = queue.shift();
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
        this.highlightFaces(selectedFaces);

        // 如果选中了面，显示标记对话框
        if (selectedFaces.size > 0) {
            this.promptForMarkerInfo(selectedFaces);
        }
    }

    highlightFaces(faceIndices) {
        // 复制原始几何体
        const geometry = this.mesh.geometry.clone();

        // 创建新的材质组
        const materialIndex = 1;  // 使用新的材质索引
        geometry.clearGroups();

        // 为所有面设置默认材质
        geometry.addGroup(0, geometry.index.count, 0);

        // 为选中的面设置高亮材质
        faceIndices.forEach(faceIndex => {
            geometry.addGroup(faceIndex * 3, 3, materialIndex);
        });

        // 更新网格
        this.mesh.geometry.dispose();
        this.mesh.geometry = geometry;
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

        // 计算选中面的中心点
        const center = new THREE.Vector3();
        selectedFaces.forEach(faceIndex => {
            center.add(this.faces[faceIndex].center);
        });
        center.divideScalar(selectedFaces.size);

        // 保存标记信息
        this.markers.set(markerId, {
            id: markerId,
            faces: Array.from(selectedFaces),
            description: description,
            position: center
        });

        this.clearSelection();
    }

    clearSelection() {
        if (!this.mesh) return;

        // 恢复默认材质
        this.mesh.geometry.clearGroups();
        this.mesh.geometry.addGroup(0, this.mesh.geometry.index.count, 0);
        this.mesh.material = this.defaultMaterial;
    }

    dispose() {
        this.stopMarking();
        if (this.highlightMaterial) {
            this.highlightMaterial.dispose();
        }
    }
}

export default ModelMarkerManager;