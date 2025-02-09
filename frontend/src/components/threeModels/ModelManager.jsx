import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { calculateModelGeometry, calculateOptimalCameraPosition } from './customModelUtils';

class ModelManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.model = null;
        this.modelGeometry = null;
        this.targetHeight = 10; // 目标模型高度
    }

    loadModel(modelPath, groundPosition) {
        const loader = new GLTFLoader();

        loader.load(modelPath, (gltf) => {
                // 移除之前的模型（如果存在）
                if (this.model) {
                    this.sceneManager.getScene().remove(this.model);
                    this.disposeModel();
                }

                this.model = gltf.scene;

                // 计算和调整模型大小
                const geometry = calculateModelGeometry(this.model);
                const scale = this.targetHeight / geometry.dimensions.y;
                this.model.scale.setScalar(scale);

                // 重新计算调整后的几何信息
                this.modelGeometry = calculateModelGeometry(this.model);
                const modelHeight = this.modelGeometry.dimensions.y;

                // 调整模型位置
                this.model.position.y = groundPosition + modelHeight / 2;

                // 设置材质和阴影
                this.setupModelMaterials();

                // 将模型添加到场景
                this.sceneManager.getScene().add(this.model);

                // 设置相机位置
                this.setupCameraPosition();
            },
            // 加载进度回调
            (progress) => {
                const percentComplete = (progress.loaded / progress.total) * 100;
                console.log(`Model loading: ${Math.round(percentComplete)}%`);
            },
            // 错误回调
            (error) => {
                console.error('Error loading model:', error);
            });
    }

    setupModelMaterials() {
        this.model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                if (child.material) {
                    // 设置材质属性
                    child.material.roughness = 0.7;
                    child.material.metalness = 0.2;
                    child.material.envMapIntensity = 1.5;

                    // 确保正确的材质编码
                    child.material.needsUpdate = true;
                }
            }
        });
    }

    setupCameraPosition() {
        const { position, target } = calculateOptimalCameraPosition(this.modelGeometry);
        const camera = this.sceneManager.getCamera();
        const controls = this.sceneManager.getControls();

        if (camera && controls) {
            camera.position.copy(position);
            controls.target.copy(target);

            // 保存初始相机位置用于重置
            this.sceneManager.setInitialCameraPosition(position.clone(), target.clone());

            controls.update();
        }
    }

    updateModelPosition(groundPosition) {
        if (this.model && this.modelGeometry) {
            const modelHeight = this.modelGeometry.dimensions.y;
            this.model.position.y = groundPosition + modelHeight / 2;
        }
    }

    getModelBoundingBox() {
        if (this.model) {
            const bbox = new THREE.Box3().setFromObject(this.model);
            return bbox;
        }
        return null;
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

    setModelScale(scale) {
        if (this.model) {
            this.model.scale.setScalar(scale);
            this.modelGeometry = calculateModelGeometry(this.model);
            this.updateModelPosition(this.model.position.y - this.modelGeometry.dimensions.y / 2);
        }
    }

    rotateModel(euler) {
        if (this.model) {
            this.model.rotation.set(euler.x, euler.y, euler.z);
        }
    }

    getModel() {
        return this.model;
    }

    dispose() {
        this.disposeModel();
    }
}

export default ModelManager;