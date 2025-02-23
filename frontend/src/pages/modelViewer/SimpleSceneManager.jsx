// SimpleSceneManager.jsx
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { AnaglyphEffect } from 'three/examples/jsm/effects/AnaglyphEffect';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { CloudLayer } from './CloudShader';
import { SkySystem } from './SkySystem';
import { GroundSystem } from './GroundSystem';

class SimpleSceneManager {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.anaglyphEffect = null;
        this.composer = null;
        this.outlinePass = null;
        this.renderPass = null;
        this.fxaaPass = null;
        this.currentMode = 'normal';
        this.clock = new THREE.Clock();

        // 环境系统
        this.cloudLayer = null;
        this.skySystem = null;
        this.groundSystem = null;
        this.autoRotateEnabled = false;

        this.init();
        this.addEnvironmentalEffects();
        this.animate();
    }

    init() {
        // 创建场景
        this.scene.background = new THREE.Color(0xe6f3ff);

        // 创建相机
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(5, 5, 5);
        this.originalCameraPosition = this.camera.position.clone();

        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            logarithmicDepthBuffer: true,
            precision: 'highp'
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // 创建控制器
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = true;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 50;
        this.controls.maxPolarAngle = Math.PI / 1.5;

        // 初始化环境系统
        this.skySystem = new SkySystem(this.scene);
        this.groundSystem = new GroundSystem(this.scene);
        // 默认设置为网格地面
        this.groundSystem.setGroundType('grid');
        // 添加窗口大小调整监听
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    addEnvironmentalEffects() {
        // 创建云层
        this.cloudLayer = new CloudLayer(this.scene, {
            count: 15,
            size: 30,
            height: { min: 60, max: 120 },
            opacity: { min: 0.2, max: 0.5 },
            speed: { min: 0.2, max: 0.3 }
        });
    }

    // 环境控制方法
    setTimeOfDay(hour) {
        if (this.skySystem) {
            this.skySystem.setTimeOfDay(hour);
        }
    }

    setWeather(type) {
        if (this.skySystem) {
            this.skySystem.setWeather(type);
        }

        if (this.cloudLayer) {
            switch (type) {
                case 'clear':
                    this.cloudLayer.setCloudDensity(0.3);
                    break;
                case 'cloudy':
                    this.cloudLayer.setCloudDensity(0.7);
                    break;
                case 'rainy':
                    this.cloudLayer.setCloudDensity(0.9);
                    break;
            }
        }
    }

    toggleRealtime() {
        if (this.skySystem) {
            this.skySystem.toggleRealtime();
        }
    }

    setGroundType(type) {
        if (this.groundSystem) {
            this.groundSystem.setGroundType(type);
        }
    }

    toggleAutoRotate() {
        this.autoRotateEnabled = !this.autoRotateEnabled;
        this.controls.autoRotate = this.autoRotateEnabled;
        this.controls.autoRotateSpeed = 0.5;
    }

    animate() {
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

        const delta = this.clock.getDelta();

        // 更新环境效果
        if (this.cloudLayer) {
            this.cloudLayer.update(delta);
        }
        if (this.skySystem) {
            this.skySystem.update(delta);
        }

        if (this.controls) {
            this.controls.update();
        }

        this.render();
    }

    setRenderMode(mode) {
        if (this.currentMode === mode) return;

        if (mode === 'anaglyph') {
            this.setupAnaglyphMode();
        } else {
            this.restoreNormalMode();
        }

        this.currentMode = mode;
        this.onWindowResize();
    }

    setupAnaglyphMode() {
        this.anaglyphEffect = new AnaglyphEffect(this.renderer, {
            eyeSeparation: 0.03,
            focalLength: 20,
            colorMatrixLeft: new THREE.Matrix3().fromArray([
                0.8, 0.0, 0.0,
                0.0, 0.0, 0.0,
                0.0, 0.0, 0.0
            ]),
            colorMatrixRight: new THREE.Matrix3().fromArray([
                0.0, 0.0, 0.0,
                0.0, 0.2, 0.0,
                0.0, 0.0, 0.7
            ])
        });

        this.composer = new EffectComposer(this.renderer);
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);

        this.outlinePass = new OutlinePass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            this.scene,
            this.camera
        );
        this.configureOutlinePass();
        this.composer.addPass(this.outlinePass);

        this.fxaaPass = new ShaderPass(FXAAShader);
        this.composer.addPass(this.fxaaPass);

        this.camera.position.z *= 1.2;
        this.camera.fov = 65;
        this.camera.updateProjectionMatrix();

        // 启用自动旋转
        this.toggleAutoRotate();

        this.updateEffectSizes();
    }

    configureOutlinePass() {
        this.outlinePass.edgeStrength = 1.5;
        this.outlinePass.edgeGlow = 0.3;
        this.outlinePass.edgeThickness = 1.0;
        this.outlinePass.pulsePeriod = 0;
        this.outlinePass.visibleEdgeColor.set('#202020');
        this.outlinePass.hiddenEdgeColor.set('#404040');

        // 选择要描边的对象
        const selectedObjects = [];
        this.scene.traverse((object) => {
            if (object.isMesh &&
                !this.cloudLayer?.clouds.includes(object) &&
                !this.groundSystem?.isGround(object)) {
                selectedObjects.push(object);
            }
        });
        this.outlinePass.selectedObjects = selectedObjects;
    }

    restoreNormalMode() {
        // 关闭自动旋转
        if (this.autoRotateEnabled) {
            this.toggleAutoRotate();
        }

        this.camera.position.z /= 1.2;
        this.camera.fov = 75;
        this.camera.updateProjectionMatrix();

        this.anaglyphEffect = null;
        if (this.composer) {
            this.composer.dispose();
            this.composer = null;
        }
        this.outlinePass = null;
        this.renderPass = null;
        this.fxaaPass = null;
    }

    updateEffectSizes() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        const pixelRatio = window.devicePixelRatio;

        if (this.anaglyphEffect) {
            this.anaglyphEffect.setSize(width, height);
        }

        if (this.composer) {
            this.composer.setSize(width * pixelRatio, height * pixelRatio);

            if (this.fxaaPass) {
                this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (width * pixelRatio);
                this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (height * pixelRatio);
            }
        }
    }

    onWindowResize() {
        if (!this.container || !this.camera) return;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.updateEffectSizes();
    }

    render() {
        if (!this.camera) return;

        if (this.anaglyphEffect && this.currentMode === 'anaglyph') {
            if (this.composer) {
                this.composer.render();
            }
            this.anaglyphEffect.render(this.scene, this.camera);
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    dispose() {
        // 停止动画循环
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        // 清理环境系统
        if (this.cloudLayer) {
            this.cloudLayer.dispose();
            this.cloudLayer = null;
        }
        if (this.skySystem) {
            this.skySystem.dispose();
            this.skySystem = null;
        }
        if (this.groundSystem) {
            this.groundSystem.dispose();
            this.groundSystem = null;
        }

        // 清理后处理效果
        if (this.composer) {
            this.composer.dispose();
        }
        if (this.anaglyphEffect) {
            this.anaglyphEffect = null;
        }

        // 清理控制器
        if (this.controls) {
            this.controls.dispose();
        }

        // 清理渲染器
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }

        // 清理场景中的所有对象
        this.scene.traverse((object) => {
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.dispose) {
                object.dispose();
            }
        });

        // 移除事件监听器
        window.removeEventListener('resize', this.onWindowResize.bind(this));
    }
}
export default SimpleSceneManager;