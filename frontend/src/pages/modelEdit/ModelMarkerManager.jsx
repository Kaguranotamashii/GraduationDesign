// ModelMarkerManager.jsx
import * as THREE from 'three';
import {Modal, Input} from 'antd';
import React from 'react';

class ModelMarkerManager {
    constructor(sceneManager, model) {
        this.sceneManager = sceneManager;
        this.model = model;
        this.isMarking = false;
        this.selectedFaces = new Set(); // 当前选中的面
        this.isCtrlPressed = false; // 是否按下Ctrl键

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
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleNormalClick = this.handleNormalClick.bind(this);

        // 标记缓存
        this.markers = new Map();
        this.markerHistory = [];
        this.historyIndex = -1;

        // 创建提示容器
        this.tooltipContainer = null;
        this.createTooltipContainer();

        // 绑定场景的点击事件
        const canvas = this.sceneManager.renderer.domElement;
        canvas.addEventListener('click', this.handleNormalClick);
    }

    createTooltipContainer() {
        this.tooltipContainer = document.createElement('div');
        this.tooltipContainer.style.cssText = `
            position: absolute;
            padding: 8px 12px;
            background: rgba(0, 0, 0, 0.75);
            color: white;
            border-radius: 4px;
            font-size: 14px;
            pointer-events: none;
            display: none;
            z-index: 1000;
            max-width: 300px;
            word-wrap: break-word;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(this.tooltipContainer);
    }

    handleNormalClick(event) {
        if (this.isMarking) return; // 在标记模式下不处理普通点击

        const intersect = this.getIntersection(event);
        if (!intersect || intersect.faceIndex === undefined) {
            this.hidePartInfo();
            return;
        }

        // 查找点击的面属于哪个标记
        const clickedFaceIndex = intersect.faceIndex;
        let foundMarker = null;

        for (const marker of this.markers.values()) {
            if (marker.faces.includes(clickedFaceIndex)) {
                foundMarker = marker;
                break;
            }
        }

        if (foundMarker) {
            this.showPartInfo(foundMarker, event);
        } else {
            this.hidePartInfo();
        }
    }

    showPartInfo(marker, event) {
        // 高亮显示对应的面
        this.highlightFaces(new Set(marker.faces));

        // 显示提示信息
        const canvas = this.sceneManager.renderer.domElement;
        const rect = canvas.getBoundingClientRect();

        this.tooltipContainer.style.display = 'block';
        this.tooltipContainer.innerHTML = `
            <div style="margin-bottom: 8px;"><strong>位置信息：</strong></div>
            <div>${marker.description}</div>
        `;

        // 计算提示框位置
        const tooltipRect = this.tooltipContainer.getBoundingClientRect();
        let left = event.clientX + 10;
        let top = event.clientY + 10;

        // 边界检查
        if (left + tooltipRect.width > window.innerWidth) {
            left = event.clientX - tooltipRect.width - 10;
        }
        if (top + tooltipRect.height > window.innerHeight) {
            top = event.clientY - tooltipRect.height - 10;
        }

        this.tooltipContainer.style.left = `${left}px`;
        this.tooltipContainer.style.top = `${top}px`;
    }

    hidePartInfo() {
        this.clearSelection();
        if (this.tooltipContainer) {
            this.tooltipContainer.style.display = 'none';
        }
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
                connected: new Set()
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
            .lengthSq() <= 0.01;
    }

    startMarking() {
        if (this.isMarking) return;

        this.isMarking = true;
        const canvas = this.sceneManager.renderer.domElement;
        canvas.addEventListener('click', this.handleClick);
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);

        // 进入标记模式时隐藏提示
        this.hidePartInfo();
    }

    stopMarking() {
        if (!this.isMarking) return;

        this.isMarking = false;
        const canvas = this.sceneManager.renderer.domElement;
        canvas.removeEventListener('click', this.handleClick);
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        this.clearSelection();

        // 退出标记模式时隐藏提示
        this.hidePartInfo();
    }

    handleKeyDown(event) {
        if (event.key === 'Control') {
            this.isCtrlPressed = true;
        }
    }

    handleKeyUp(event) {
        if (event.key === 'Control') {
            this.isCtrlPressed = false;
            if (this.selectedFaces.size > 0) {
                this.promptForMarkerInfo(this.selectedFaces);
            }
        }
    }

    handleClick(event) {
        if (!this.isMarking) return;

        const intersect = this.getIntersection(event);
        if (intersect && intersect.faceIndex !== undefined) {
            if (!this.isCtrlPressed) {
                this.selectedFaces.clear();
            }
            this.selectConnectedFaces(intersect.faceIndex);
            this.highlightFaces(this.selectedFaces);

            if (!this.isCtrlPressed) {
                this.promptForMarkerInfo(this.selectedFaces);
            }
        } else if (!this.isCtrlPressed) {
            this.clearSelection();
        }
    }

    getIntersection(event) {
        const canvas = this.sceneManager.renderer.domElement;
        const rect = canvas.getBoundingClientRect();

        this.mouse.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);
        const intersects = this.raycaster.intersectObject(this.mesh, false);
        return intersects[0] || null;
    }

    selectConnectedFaces(startFaceIndex) {
        const newFaces = new Set();
        const queue = [startFaceIndex];
        let queueIndex = 0;

        while (queueIndex < queue.length) {
            const currentFaceIndex = queue[queueIndex++];
            if (newFaces.has(currentFaceIndex)) continue;

            newFaces.add(currentFaceIndex);
            const currentFace = this.faces[currentFaceIndex];

            currentFace.connected.forEach(neighborIndex => {
                if (!newFaces.has(neighborIndex)) {
                    queue.push(neighborIndex);
                }
            });
        }

        newFaces.forEach(faceIndex => {
            this.selectedFaces.add(faceIndex);
        });
    }

    highlightFaces(faceIndices) {
        const geometry = this.mesh.geometry;

        geometry.clearGroups();
        geometry.addGroup(0, geometry.index.count, 0);

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
        if (selectedFaces.size === 0) return;

        let inputValue = '';

        Modal.confirm({
            title: '添加标记',
            content: (
                <div>
                    <p>请输入部位层级，使用 / 分隔（例如：一层/楼梯）</p>
                    <Input.TextArea
                        defaultValue=""
                        onChange={(e) => {
                            inputValue = e.target.value;
                        }}
                        placeholder="例如：一层/楼梯"
                        rows={4}
                    />
                </div>
            ),
            onOk: () => {
                if (inputValue && inputValue.trim()) {
                    this.createMarker(inputValue, selectedFaces);
                }
            },
            onCancel: () => {
                if (!this.isCtrlPressed) {
                    this.clearSelection();
                }
            },
        });
    }

    createMarker(description, selectedFaces) {
        const markerId = Date.now().toString();
        const center = this._vec3_2.set(0, 0, 0);

        selectedFaces.forEach(faceIndex => {
            center.add(this.faces[faceIndex].center);
        });
        center.divideScalar(selectedFaces.size);

        const marker = {
            id: markerId,
            faces: Array.from(selectedFaces),
            description: description,
            position: center.clone(),
            regions: this.getRegionsInfo(selectedFaces)
        };

        this.markers.set(markerId, marker);
        this.addToHistory(marker);

        if (!this.isCtrlPressed) {
            this.clearSelection();
        }

        if (this.onMarkersChanged) {
            this.onMarkersChanged(this.getMarkersData());
        }
    }

    getRegionsInfo(selectedFaces) {
        const regions = [];
        const processedFaces = new Set();

        selectedFaces.forEach(startFace => {
            if (processedFaces.has(startFace)) return;

            const region = new Set();
            const queue = [startFace];

            while (queue.length > 0) {
                const currentFace = queue.shift();
                if (region.has(currentFace)) continue;

                region.add(currentFace);
                processedFaces.add(currentFace);

                this.faces[currentFace].connected.forEach(neighborIndex => {
                    if (selectedFaces.has(neighborIndex) && !region.has(neighborIndex)) {
                        queue.push(neighborIndex);
                    }
                });
            }

            const regionCenter = new THREE.Vector3();
            region.forEach(faceIndex => {
                regionCenter.add(this.faces[faceIndex].center);
            });
            regionCenter.divideScalar(region.size);

            regions.push({
                faces: Array.from(region),
                center: regionCenter.clone()
            });
        });

        return regions;
    }

    updateMarkerDescription(markerId, newDescription) {
        const marker = this.markers.get(markerId);
        if (marker) {
            const updatedMarker = {
                ...marker,
                description: newDescription
            };

            this.markers.set(markerId, updatedMarker);

            this.addToHistory({
                ...updatedMarker,
                id: Date.now().toString()
            });

            if (this.onMarkersChanged) {
                this.onMarkersChanged(this.getMarkersData());
            }
        }
    }

    deleteMarker(markerId) {
        if (this.markers.has(markerId)) {
            const marker = this.markers.get(markerId);
            this.markers.delete(markerId);

            this.addToHistory({
                ...marker,
                type: 'delete'
            });

            this.clearSelection();

            if (this.onMarkersChanged) {
                this.onMarkersChanged(this.getMarkersData());
            }
        }
    }

    clearSelection() {
        this.selectedFaces.clear();
        if (!this.mesh) return;

        const geometry = this.mesh.geometry;
        geometry.clearGroups();
        geometry.addGroup(0, geometry.index.count, 0);
        this.mesh.material = this.defaultMaterial;
    }

    addToHistory(marker) {
        this.historyIndex++;
        this.markerHistory = this.markerHistory.slice(0, this.historyIndex);
        this.markerHistory.push(marker);
    }

    undoLastMarker() {
        if (this.historyIndex >= 0) {
            const marker = this.markerHistory[this.historyIndex];
            if (marker.type === 'delete') {
                this.markers.set(marker.id, {
                    ...marker,
                    type: undefined
                });
            } else {
                this.markers.delete(marker.id);
            }
            this.historyIndex--;
            if (this.onMarkersChanged) {
                this.onMarkersChanged(this.getMarkersData());
            }
        }
    }

    redoMarker() {
        if (this.historyIndex < this.markerHistory.length - 1) {
            this.historyIndex++;
            const marker = this.markerHistory[this.historyIndex];
            if (marker.type === 'delete') {
                this.markers.delete(marker.id);
            } else {
                this.markers.set(marker.id, {
                    ...marker,
                    type: undefined
                });
            }
            if (this.onMarkersChanged) {
                this.onMarkersChanged(this.getMarkersData());
            }
        }
    }

    getMarkersData() {
        return Array.from(this.markers.values()).map(marker => ({
            id: marker.id,
            description: marker.description,
            faces: marker.faces,
            position: {
                x: marker.position.x,
                y: marker.position.y,
                z: marker.position.z
            },
            regions: marker.regions ? marker.regions.map(region => ({
                faces: region.faces,
                center: {
                    x: region.center.x,
                    y: region.center.y,
                    z: region.center.z
                }
            })) : []
        }));
    }

    highlightMarker(markerId) {
        const marker = this.markers.get(markerId);
        if (marker) {
            this.currentHighlightedMarkerId = markerId;
            this.highlightFaces(new Set(marker.faces));
        }
    }

    deleteSelectedMarker() {
        if (this.currentHighlightedMarkerId) {
            this.deleteMarker(this.currentHighlightedMarkerId);
            this.currentHighlightedMarkerId = null;
            return;
        }

        let markerToDelete = null;
        for (const [id, marker] of this.markers) {
            const markerFaces = new Set(marker.faces);
            if (this.areSetsEqual(markerFaces, this.selectedFaces)) {
                markerToDelete = id;
                break;
            }
        }

        if (markerToDelete) {
            this.deleteMarker(markerToDelete);
        }
    }

    areSetsEqual(a, b) {
        if (a.size !== b.size) return false;
        for (const item of a) {
            if (!b.has(item)) return false;
        }
        return true;
    }

    setOnMarkersChanged(callback) {
        this.onMarkersChanged = callback;
    }

    dispose() {
        this.stopMarking();

        const canvas = this.sceneManager.renderer.domElement;
        canvas.removeEventListener('click', this.handleNormalClick);

        if (this.tooltipContainer) {
            document.body.removeChild(this.tooltipContainer);
            this.tooltipContainer = null;
        }

        if (this.highlightMaterial) {
            this.highlightMaterial.dispose();
        }

        this._vec3 = null;
        this._vec3_2 = null;
        this._vec3_3 = null;

        this.faces = null;
        this.markers.clear();
        this.markers = null;
        this.markerHistory = null;
        this.currentHighlightedMarkerId = null;
    }
}

export default ModelMarkerManager;