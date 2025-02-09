import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import WeatherSystem from './WeatherSystem';
import CelestialSystem from './CelestialSystem';

class SceneManager {
    constructor(container) {
        this.container = container;
        this.clock = new THREE.Clock();
        this.frameId = null;
        this.initialCameraPosition = null;

        this.initScene();
        this.initRenderer();
        this.initCamera();
        this.initControls();
        this.initSystems();
        this.initPostProcessing();
        this.setupEventListeners();
        this.animate();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#87CEEB');
    }

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.container.appendChild(this.renderer.domElement);
    }

    initCamera() {
        this.camera = new THREE.PerspectiveCamera(
            60,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            2000
        );
        this.camera.position.set(50, 50, 50);
    }

    initControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.03;
        this.controls.screenSpacePanning = true;
        this.controls.panSpeed = 2.0;
        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.5;
        this.controls.minDistance = 0.1;
        this.controls.maxDistance = 500;
        this.controls.maxPolarAngle = Math.PI * 0.48;
    }

    initSystems() {
        this.weatherSystem = new WeatherSystem(this.scene);
        this.celestialSystem = new CelestialSystem(this.scene);
    }

    initPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.composer.addPass(new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.5, 0.4, 0.85
        ));
    }

    createGround(groundPosition) {
        const textureLoader = new THREE.TextureLoader();
        const grassTexture = textureLoader.load('/textures/grass/grass_diffuse.jpg', (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(30, 30);
            texture.encoding = THREE.sRGBEncoding;

            if (this.renderer.capabilities.getMaxAnisotropy()) {
                texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
            }
        });

        const groundGeometry = new THREE.PlaneGeometry(300, 300);
        const groundMaterial = new THREE.MeshStandardMaterial({
            map: grassTexture,
            roughness: 0.8,
            metalness: 0.1,
        });

        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.position.y = groundPosition;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);

        this.gridHelper = new THREE.GridHelper(100, 100, 0x888888, 0x888888);
        this.gridHelper.position.y = groundPosition + 0.01;
        this.scene.add(this.gridHelper);
    }

    setupEventListeners() {
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    handleResize() {
        if (!this.container) return;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
    }

    animate() {
        const deltaTime = this.clock.getDelta();
        this.controls.update();

        if (this.celestialSystem) {
            this.celestialSystem.update(this.currentHour, this.weatherSystem);
        }

        if (this.weatherSystem) {
            this.weatherSystem.update(
                deltaTime,
                this.celestialSystem?.getCurrentSkyColor()
            );
        }

        this.composer.render();
        this.frameId = requestAnimationFrame(this.animate.bind(this));
    }

    updateWeather(weather, fogIntensity) {
        if (this.weatherSystem && this.celestialSystem) {
            const currentTimeColor = this.celestialSystem.getCurrentSkyColor();
            this.weatherSystem.setWeather(weather, fogIntensity, currentTimeColor, this.currentHour);
        }
    }

    updateTime(hour) {
        this.currentHour = hour;
    }

    setDayNightTimes(dayBreakTime, nightFallTime) {
        if (this.celestialSystem) {
            this.celestialSystem.setDayNightTimes(dayBreakTime, nightFallTime);
        }
    }

    updateGroundPosition(position) {
        if (this.ground) {
            this.ground.position.y = position;
        }
        if (this.gridHelper) {
            this.gridHelper.position.y = position + 0.01;
        }
        if (this.weatherSystem) {
            this.weatherSystem.setGroundLevel(position);
        }
    }

    updateGridVisibility(visible) {
        if (this.gridHelper) {
            this.gridHelper.visible = visible;
        }
    }

    resetCamera() {
        if (this.camera && this.controls && this.initialCameraPosition) {
            this.camera.position.copy(this.initialCameraPosition.position);
            this.controls.target.copy(this.initialCameraPosition.target);
            this.controls.update();
        }
    }

    setInitialCameraPosition(position, target) {
        this.initialCameraPosition = { position, target };
    }

    dispose() {
        window.removeEventListener('resize', this.handleResize);
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
        }
        if (this.container && this.renderer.domElement) {
            this.container.removeChild(this.renderer.domElement);
        }

        this.renderer.dispose();
        this.composer.dispose();
        this.scene.traverse((object) => {
            if (object.isMesh) {
                object.geometry.dispose();
                if (object.material.isMaterial) {
                    object.material.dispose();
                }
            }
        });
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }

    getControls() {
        return this.controls;
    }
}

export default SceneManager;