// SimpleModelManager.jsx
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { calculateModelGeometry } from "@/components/threeModels/customModelUtils.jsx";
import * as THREE from 'three';

class SimpleModelManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.model = null;
        this.modelGeometry = null;
        this.boundingBox = null;
    }

    loadModel(modelPath, onProgress) {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();

            loader.load(
                modelPath,
                (gltf) => {
                    if (this.model) {
                        this.sceneManager.scene.remove(this.model);
                        this.disposeModel();
                    }

                    this.model = gltf.scene;
                    this.modelGeometry = calculateModelGeometry(this.model);

                    // 计算包围盒
                    this.boundingBox = new THREE.Box3().setFromObject(this.model);
                    const modelHeight = this.boundingBox.max.y - this.boundingBox.min.y;
                    const modelWidth = this.boundingBox.max.x - this.boundingBox.min.x;
                    const modelDepth = this.boundingBox.max.z - this.boundingBox.min.z;

                    // 调整模型到合适大小
                    const maxDim = Math.max(modelWidth, modelHeight, modelDepth);
                    const targetSize = 20; // 目标大小
                    const scale = targetSize / maxDim;
                    this.model.scale.setScalar(scale);

                    // 重新计算包围盒
                    this.boundingBox.setFromObject(this.model);

                    // 将模型底部对齐到地面 (y = 0)
                    const bottomY = this.boundingBox.min.y;
                    this.model.position.y -= bottomY;

                    // 居中模型（在 x-z 平面上）
                    const center = this.boundingBox.getCenter(new THREE.Vector3());
                    this.model.position.x = -center.x;
                    this.model.position.z = -center.z;

                    this.sceneManager.scene.add(this.model);

                    // 设置相机位置
                    const distance = maxDim * 2;
                    this.sceneManager.camera.position.set(distance, distance * 0.75, distance);
                    this.sceneManager.controls.target.set(0, modelHeight * scale * 0.5, 0);
                    this.sceneManager.controls.update();

                    resolve(this.model);
                },
                (progress) => {
                    if (onProgress) {
                        onProgress(progress);
                    }
                },
                (error) => {
                    console.error('Error loading model:', error);
                    reject(error);
                }
            );
        });
    }

    alignToGround() {
        if (!this.model || !this.boundingBox) return;

        // 重新计算包围盒
        this.boundingBox.setFromObject(this.model);

        // 将模型底部对齐到地面
        const bottomY = this.boundingBox.min.y;
        this.model.position.y -= bottomY;
    }

    disposeModel() {
        if (this.model) {
            this.model.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else if (child.material) {
                        child.material.dispose();
                    }
                }
            });
            this.model = null;
            this.modelGeometry = null;
            this.boundingBox = null;
        }
    }

    dispose() {
        this.disposeModel();
    }
}

export default SimpleModelManager;