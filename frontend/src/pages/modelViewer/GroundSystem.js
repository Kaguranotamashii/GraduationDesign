// GroundSystem.js
import * as THREE from 'three';

export class GroundSystem {
    constructor(scene) {
        this.scene = scene;
        this.currentGround = null;
        this.groundTypes = {
            grid: null,
            grass: null,
            concrete: null,
            water: null
        };
        this.grassDecorations = null; // 存储草地装饰物
        this.clock = new THREE.Clock();
        this.init();
    }

    init() {
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000, 128, 128);

        // 创建各种地面类型
        this.createGridGround(groundGeometry);
        this.createGrassGround(groundGeometry);
        this.createConcreteGround(groundGeometry);
        this.createWaterGround(groundGeometry);

        // 默认显示网格地面
        this.setGroundType('grid');
    }

    createAdvancedGridTexture() {
        const size = 2048;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size*0.7);
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(1, '#2a2a2a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        ctx.strokeStyle = '#3a3a3a';
        ctx.lineWidth = 1;
        const gridSize = size / 40;

        for (let i = 0; i <= size; i += gridSize) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(size, i);
            ctx.stroke();
        }

        ctx.strokeStyle = '#4a4a4a';
        ctx.lineWidth = 2;
        const emphasisSize = gridSize * 5;

        for (let i = 0; i <= size; i += emphasisSize) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(size, i);
            ctx.stroke();
        }

        ctx.strokeStyle = '#5a5a5a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(size/2, 0);
        ctx.lineTo(size/2, size);
        ctx.moveTo(0, size/2);
        ctx.lineTo(size, size/2);
        ctx.stroke();

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        return texture;
    }

    createGridGround(geometry) {
        const gridTexture = this.createAdvancedGridTexture();
        const material = new THREE.MeshPhysicalMaterial({
            map: gridTexture,
            transparent: true,
            opacity: 0.9,
            metalness: 0.2,
            roughness: 0.1,
            envMapIntensity: 1.0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });

        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        ground.visible = false;
        this.groundTypes.grid = ground;
        this.scene.add(ground);
    }

    createGrassDecorations() {
        // 创建草丛实例组
        const grassGeometry = new THREE.PlaneGeometry(0.5, 1.5);
        const grassMaterial = new THREE.MeshPhongMaterial({
            color: 0x70a040, // 更鲜艳的秋天草色
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9,
            shininess: 20
        });
        const instancedGrass = new THREE.InstancedMesh(grassGeometry, grassMaterial, 3000);

        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        const rotation = new THREE.Euler();
        const scale = new THREE.Vector3();
        const groundSize = 500;

        for (let i = 0; i < 3000; i++) {
            position.x = Math.random() * groundSize * 2 - groundSize;
            position.z = Math.random() * groundSize * 2 - groundSize;
            position.y = 0.75;

            rotation.y = Math.random() * Math.PI * 2;

            scale.x = 0.6 + Math.random() * 0.3;
            scale.y = 1.2 + Math.random() * 0.8;
            scale.z = 1;

            matrix.compose(position, new THREE.Quaternion().setFromEuler(rotation), scale);
            instancedGrass.setMatrixAt(i, matrix);
        }
        instancedGrass.castShadow = true;
        instancedGrass.receiveShadow = true;

        // 创建花朵
        const flowers = [];
        const flowerColors = [0xe6b800, 0xcc5200, 0xffd93d]; // 更鲜艳的秋天花色
        const flowerCount = 100;

        for (let i = 0; i < flowerCount; i++) {
            const flowerGeometry = new THREE.CircleGeometry(0.2, 8); // 稍大一点的花
            const flowerMaterial = new THREE.MeshPhongMaterial({
                color: flowerColors[Math.floor(Math.random() * flowerColors.length)],
                side: THREE.DoubleSide
            });
            const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);

            flower.position.x = Math.random() * groundSize * 2 - groundSize;
            flower.position.z = Math.random() * groundSize * 2 - groundSize;
            flower.position.y = 0.15; // 稍高一点
            flower.rotation.x = -Math.PI / 2;

            flower.castShadow = true; // 添加阴影
            flower.receiveShadow = true;

            flowers.push(flower);
        }

        // 创建树
        const trees = [];
        const treeCount = 20;

        for (let i = 0; i < treeCount; i++) {
            const trunkGeometry = new THREE.CylinderGeometry(0.25, 0.35, 2.5, 8);
            const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.castShadow = true;
            trunk.receiveShadow = true;

            const leavesGeometry = new THREE.SphereGeometry(1.5, 12, 12); // 稍大一点的树叶
            const leavesMaterial = new THREE.MeshPhongMaterial({
                color: Math.random() > 0.5 ? 0xe6b800 : 0xcc5200, // 更鲜艳的黄或橙
                transparent: true,
                opacity: 0.9
            });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.y = 2;
            leaves.scale.y = 1.3;
            leaves.castShadow = true;
            leaves.receiveShadow = true;

            const tree = new THREE.Group();
            tree.add(trunk);
            tree.add(leaves);

            tree.position.x = Math.random() * groundSize * 1.8 - groundSize * 0.9;
            tree.position.z = Math.random() * groundSize * 1.8 - groundSize * 0.9;
            tree.position.y = 1.25;
            tree.scale.setScalar(1 + Math.random() * 0.7);

            trees.push(tree);
        }

        return { instancedGrass, flowers, trees };
    }

    createGrassGround(geometry) {
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                grassColor1: { value: new THREE.Color(0x70a040) }, // 更鲜艳的秋天草色
                grassColor2: { value: new THREE.Color(0x4d8030) }, // 阴影色更明亮
                windSpeed: { value: 0.8 }, // 增强风速
                noiseScale: { value: 0.15 } // 增大噪声比例
            },
            vertexShader: `
                varying vec2 vUv;
                varying float noise;
                uniform float time;
                uniform float windSpeed;
                uniform float noiseScale;

                float random(vec2 st) {
                    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
                }

                float noise2D(vec2 st) {
                    vec2 i = floor(st);
                    vec2 f = fract(st);
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    return mix(mix(random(i + vec2(0.0, 0.0)), random(i + vec2(1.0, 0.0)), u.x),
                              mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0, 1.0)), u.x), u.y);
                }

                void main() {
                    vUv = uv;
                    vec3 pos = position;

                    // 增强风吹效果
                    float wind = noise2D(vec2(pos.x * noiseScale + time * windSpeed, pos.z * noiseScale)) * 0.7;
                    wind += sin(pos.x * 0.4 + time * windSpeed) * cos(pos.z * 0.4 + time * windSpeed) * 0.3;
                    pos.y += wind;

                    noise = wind;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 grassColor1;
                uniform vec3 grassColor2;
                uniform float time;
                varying vec2 vUv;
                varying float noise;

                void main() {
                    float detail = sin(vUv.x * 100.0 + time * 0.3) * cos(vUv.y * 100.0) * 0.4;
                    detail += noise * 0.6;

                    vec3 color = mix(grassColor1, grassColor2, detail * 0.5 + 0.5);
                    color = mix(color, vec3(0.9, 0.8, 0.4), 0.15); // 更鲜艳的秋天干枯色

                    color *= (0.85 + noise * 0.35); // 增强光影对比

                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            side: THREE.DoubleSide
        });

        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        ground.castShadow = true;
        ground.visible = false;
        this.groundTypes.grass = ground;
        this.scene.add(ground);

        // 添加装饰物
        const { instancedGrass, flowers, trees } = this.createGrassDecorations();
        this.grassDecorations = new THREE.Group();
        this.grassDecorations.add(instancedGrass);
        flowers.forEach(flower => this.grassDecorations.add(flower));
        trees.forEach(tree => this.grassDecorations.add(tree));
        this.grassDecorations.visible = false;
        this.scene.add(this.grassDecorations);
    }

    createConcreteGround(geometry) {
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                baseColor: { value: new THREE.Color(0x808080) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 baseColor;
                varying vec2 vUv;

                void main() {
                    float noise = fract(sin(dot(vUv, vec2(12.9898,78.233))) * 43758.5453);
                    vec3 color = baseColor * (0.8 + noise * 0.2);
                    gl_FragColor = vec4(color, 1.0);
                }
            `
        });

        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        ground.visible = false;
        this.groundTypes.concrete = ground;
        this.scene.add(ground);
    }

    createWaterGround(geometry) {
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                waterColor: { value: new THREE.Color(0x0066cc) },
                waterDeepColor: { value: new THREE.Color(0x003366) }
            },
            vertexShader: `
                varying vec2 vUv;
                varying float height;
                uniform float time;
                
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    float wave = sin(pos.x * 0.2 + time) * cos(pos.z * 0.2 + time) * 2.0;
                    pos.y += wave;
                    height = wave;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 waterColor;
                uniform vec3 waterDeepColor;
                uniform float time;
                varying vec2 vUv;
                varying float height;

                void main() {
                    vec3 color = mix(waterDeepColor, waterColor, height * 0.5 + 0.5);
                    float sparkle = pow(sin(vUv.x * 100.0 + time) * cos(vUv.y * 100.0 + time), 5.0) * 0.3;
                    color += vec3(sparkle);
                    gl_FragColor = vec4(color, 0.8);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });

        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        ground.visible = false;
        this.groundTypes.water = ground;
        this.scene.add(ground);
    }

    update(delta) {
        const time = this.clock.getElapsedTime();
        Object.values(this.groundTypes).forEach(ground => {
            if (ground && ground.material.uniforms) {
                ground.material.uniforms.time.value = time;
            }
        });
    }

    setGroundType(type) {
        // 隐藏所有地面和装饰物
        Object.values(this.groundTypes).forEach(ground => {
            if (ground) ground.visible = false;
        });
        if (this.grassDecorations) {
            this.grassDecorations.visible = false; // 默认隐藏装饰物
        }

        if (type === 'none') {
            this.currentGround = null;
            return;
        }

        // 显示选中的地面类型
        if (this.groundTypes[type]) {
            this.groundTypes[type].visible = true;
            this.currentGround = this.groundTypes[type];
            // 如果是草地，显示装饰物
            if (type === 'grass' && this.grassDecorations) {
                this.grassDecorations.visible = true;
            }
        }
    }

    isGround(object) {
        return Object.values(this.groundTypes).includes(object);
    }

    dispose() {
        Object.values(this.groundTypes).forEach(ground => {
            if (ground) {
                ground.geometry.dispose();
                ground.material.dispose();
                this.scene.remove(ground);
            }
        });
        if (this.grassDecorations) {
            this.scene.remove(this.grassDecorations);
        }
    }
}