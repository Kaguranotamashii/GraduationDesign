import * as THREE from 'three';

class GeometryAnalyzer {
    constructor() {
        // 法向量相似度阈值 (cosine similarity)
        this.NORMAL_THRESHOLD = 0.95;  // cos(约18度)
        // 位置连续性阈值
        this.POSITION_THRESHOLD = 0.1;
        // 构件集合
        this.components = new Map();
    }

    // 分析网格的几何特征
    analyzeMesh(mesh) {
        const geometry = mesh.geometry;

        // 确保几何体被索引
        if (!geometry.index) {
            geometry = geometry.toIndexed();
        }

        // 获取顶点位置和法向量
        const positions = geometry.attributes.position.array;
        const normals = geometry.attributes.normal.array;
        const indices = geometry.index.array;

        // 获取所有三角形面
        const faces = [];
        for (let i = 0; i < indices.length; i += 3) {
            const face = {
                indices: [indices[i], indices[i + 1], indices[i + 2]],
                vertices: [],
                normal: new THREE.Vector3(),
                center: new THREE.Vector3(),
                neighbors: new Set()
            };

            // 计算面的顶点位置
            for (let j = 0; j < 3; j++) {
                const idx = indices[i + j];
                const vertex = new THREE.Vector3(
                    positions[idx * 3],
                    positions[idx * 3 + 1],
                    positions[idx * 3 + 2]
                );
                face.vertices.push(vertex);
            }

            // 计算面的法向量（使用顶点法向量的平均值）
            for (let j = 0; j < 3; j++) {
                const idx = indices[i + j];
                face.normal.add(new THREE.Vector3(
                    normals[idx * 3],
                    normals[idx * 3 + 1],
                    normals[idx * 3 + 2]
                ));
            }
            face.normal.divideScalar(3).normalize();

            // 计算面的中心点
            face.center.addVectors(face.vertices[0], face.vertices[1])
                .add(face.vertices[2])
                .divideScalar(3);

            faces.push(face);
        }

        // 建立面的邻接关系
        this.buildFaceAdjacency(faces);

        // 根据几何特征分组
        return this.groupFacesByFeatures(faces);
    }

    // 建立面的邻接关系
    buildFaceAdjacency(faces) {
        const vertexToFace = new Map();

        // 为每个顶点建立关联的面的索引
        faces.forEach((face, faceIndex) => {
            face.indices.forEach(vertexIndex => {
                if (!vertexToFace.has(vertexIndex)) {
                    vertexToFace.set(vertexIndex, new Set());
                }
                vertexToFace.get(vertexIndex).add(faceIndex);
            });
        });

        // 通过共享顶点找到相邻面
        faces.forEach((face, faceIndex) => {
            const neighborFaces = new Set();
            face.indices.forEach(vertexIndex => {
                vertexToFace.get(vertexIndex).forEach(neighborIndex => {
                    if (neighborIndex !== faceIndex) {
                        neighborFaces.add(neighborIndex);
                    }
                });
            });

            // 检查每个潜在的邻居是否真的共享边
            neighborFaces.forEach(neighborIndex => {
                const neighbor = faces[neighborIndex];
                if (this.facesShareEdge(face, neighbor)) {
                    face.neighbors.add(neighborIndex);
                }
            });
        });
    }

    // 检查两个面是否共享边
    facesShareEdge(face1, face2) {
        let sharedVertices = 0;
        face1.indices.forEach(idx1 => {
            if (face2.indices.includes(idx1)) {
                sharedVertices++;
            }
        });
        return sharedVertices >= 2;
    }

    // 根据几何特征对面进行分组
    groupFacesByFeatures(faces) {
        const components = [];
        const visited = new Set();

        faces.forEach((face, faceIndex) => {
            if (visited.has(faceIndex)) return;

            // 开始新的构件
            const component = {
                faces: [],
                normal: face.normal.clone(),
                boundingBox: new THREE.Box3()
            };

            // 使用广度优先搜索找到所有相连的相似面
            const queue = [faceIndex];
            visited.add(faceIndex);

            while (queue.length > 0) {
                const currentFaceIndex = queue.shift();
                const currentFace = faces[currentFaceIndex];
                component.faces.push(currentFaceIndex);

                // 更新包围盒
                currentFace.vertices.forEach(vertex => {
                    component.boundingBox.expandByPoint(vertex);
                });

                // 检查相邻面
                currentFace.neighbors.forEach(neighborIndex => {
                    if (visited.has(neighborIndex)) return;

                    const neighborFace = faces[neighborIndex];
                    if (this.areFacesSimilar(currentFace, neighborFace)) {
                        queue.push(neighborIndex);
                        visited.add(neighborIndex);
                    }
                });
            }

            components.push(component);
        });

        // 合并相近的小构件
        return this.mergeCloseComponents(components, faces);
    }

    // 检查两个面是否具有相似的几何特征
    areFacesSimilar(face1, face2) {
        // 检查法向量相似度
        const normalSimilarity = face1.normal.dot(face2.normal);
        if (Math.abs(normalSimilarity) < this.NORMAL_THRESHOLD) {
            return false;
        }

        // 检查空间位置连续性
        const distance = face1.center.distanceTo(face2.center);
        if (distance > this.POSITION_THRESHOLD) {
            return false;
        }

        return true;
    }

    // 合并相近的小构件
    mergeCloseComponents(components, faces) {
        const mergedComponents = [];
        const merged = new Set();

        components.forEach((comp1, i) => {
            if (merged.has(i)) return;

            const mergedComponent = {
                faces: [...comp1.faces],
                boundingBox: comp1.boundingBox.clone()
            };

            components.forEach((comp2, j) => {
                if (i === j || merged.has(j)) return;

                if (this.shouldMergeComponents(comp1, comp2, faces)) {
                    mergedComponent.faces.push(...comp2.faces);
                    mergedComponent.boundingBox.union(comp2.boundingBox);
                    merged.add(j);
                }
            });

            mergedComponents.push(mergedComponent);
            merged.add(i);
        });

        return mergedComponents;
    }

    // 判断两个构件是否应该合并
    shouldMergeComponents(comp1, comp2, faces) {
        // 检查包围盒是否接近
        const distance = this.getComponentsDistance(comp1, comp2);
        if (distance > this.POSITION_THRESHOLD * 2) {
            return false;
        }

        // 检查法向量是否相似
        const normal1 = this.getAverageNormal(comp1, faces);
        const normal2 = this.getAverageNormal(comp2, faces);
        const normalSimilarity = normal1.dot(normal2);

        return Math.abs(normalSimilarity) > this.NORMAL_THRESHOLD;
    }

    // 计算两个构件之间的最小距离
    getComponentsDistance(comp1, comp2) {
        return comp1.boundingBox.distanceTo(comp2.boundingBox);
    }

    // 计算构件的平均法向量
    getAverageNormal(component, faces) {
        const avgNormal = new THREE.Vector3();
        component.faces.forEach(faceIndex => {
            avgNormal.add(faces[faceIndex].normal);
        });
        return avgNormal.normalize();
    }
}

export default GeometryAnalyzer;