import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {calculateModelGeometry} from "@/components/threeModels/customModelUtils.jsx";
import * as THREE from 'three';

class SimpleModelManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.model = null;
        this.modelGeometry = null;
    }

    loadModel(modelPath) {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();

            loader.load(modelPath,
                (gltf) => {
                    if (this.model) {
                        this.sceneManager.scene.remove(this.model);
                        this.disposeModel();
                    }

                    this.model = gltf.scene;
                    this.modelGeometry = calculateModelGeometry(this.model);

                    // 调整模型到合适大小
                    const maxDim = Math.max(
                        this.modelGeometry.dimensions.x,
                        this.modelGeometry.dimensions.y,
                        this.modelGeometry.dimensions.z
                    );
                    const scale = 20 / maxDim;  // 将模型缩放到合适大小
                    this.model.scale.setScalar(scale);

                    // 居中模型
                    const center = this.modelGeometry.center;
                    this.model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

                    this.sceneManager.scene.add(this.model);

                    // 设置相机位置
                    const distance = maxDim * 2;
                    this.sceneManager.camera.position.set(distance, distance, distance);
                    this.sceneManager.controls.target.set(0, 0, 0);
                    this.sceneManager.controls.update();

                    resolve(this.model);
                },
                (progress) => {
                    console.log(`Model loading: ${Math.round((progress.loaded / progress.total) * 100)}%`);
                },
                (error) => {
                    console.error('Error loading model:', error);
                    reject(error);
                }
            );
        });
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
        }
    }

    dispose() {
        this.disposeModel();
    }
}

export default SimpleModelManager;