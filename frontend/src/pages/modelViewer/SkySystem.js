// SkySystem.js
import * as THREE from 'three';
import { WeatherSystem } from './WeatherSystem';

// 天空颜色配置
const SKY_COLORS = {
    0: { top: new THREE.Color(0x0a1432), bottom: new THREE.Color(0x141e32) },   // 深夜
    1: { top: new THREE.Color(0x141e3c), bottom: new THREE.Color(0x1a243c) },   // 凌晨
    2: { top: new THREE.Color(0x1e2846), bottom: new THREE.Color(0x202846) },   // 黎明前
    3: { top: new THREE.Color(0x283250), bottom: new THREE.Color(0x283250) },   // 破晓前
    4: { top: new THREE.Color(0x3c4664), bottom: new THREE.Color(0x3c4664) },   // 黎明初现
    5: { top: new THREE.Color(0x505a78), bottom: new THREE.Color(0x505a78) },   // 天色渐亮
    6: { top: new THREE.Color(0x78648c), bottom: new THREE.Color(0xff9966) },   // 日出
    7: { top: new THREE.Color(0x9682a0), bottom: new THREE.Color(0xffa07a) },   // 清晨
    8: { top: new THREE.Color(0x6496c8), bottom: new THREE.Color(0xadd8e6) },   // 上午初
    9: { top: new THREE.Color(0x50a0dc), bottom: new THREE.Color(0xb0e0e6) },   // 上午
    10: { top: new THREE.Color(0x5aaae6), bottom: new THREE.Color(0xb8e6f0) },  // 上午中
    11: { top: new THREE.Color(0x46b4f0), bottom: new THREE.Color(0xc0ebf5) },  // 接近中午
    12: { top: new THREE.Color(0x3cbefa), bottom: new THREE.Color(0xc8f0fa) },  // 正午
    13: { top: new THREE.Color(0x46b4f5), bottom: new THREE.Color(0xc0ebf5) },  // 下午初
    14: { top: new THREE.Color(0x50aff0), bottom: new THREE.Color(0xb8e6f0) },  // 下午
    15: { top: new THREE.Color(0x64a0d2), bottom: new THREE.Color(0xb0e0e6) },  // 下午中
    16: { top: new THREE.Color(0x7896c8), bottom: new THREE.Color(0xffa07a) },  // 黄昏前
    17: { top: new THREE.Color(0x967884), bottom: new THREE.Color(0xff7f50) },  // 日落
    18: { top: new THREE.Color(0x826496), bottom: new THREE.Color(0x483d8b) },  // 黄昏
    19: { top: new THREE.Color(0x5a508c), bottom: new THREE.Color(0x2f4f4f) },  // 傍晚
    20: { top: new THREE.Color(0x323c78), bottom: new THREE.Color(0x1a1a3c) },  // 夜晚初
    21: { top: new THREE.Color(0x1e3264), bottom: new THREE.Color(0x141432) },  // 夜晚
    22: { top: new THREE.Color(0x142850), bottom: new THREE.Color(0x0f1428) },  // 深夜初
    23: { top: new THREE.Color(0x0a1e3c), bottom: new THREE.Color(0x0a0f1e) }   // 深夜
};

export class SkySystem {
    constructor(scene) {
        this.scene = scene;
        this.timeOfDay = 12;
        this.weatherType = 'clear';
        this.isRealtime = false;

        // 组件
        this.skyDome = null;
        this.sunLight = null;
        this.ambientLight = null;
        this.moonLight = null;
        this.sun = null;
        this.moon = null;
        this.weatherSystem = null;

        this.init();
    }

    init() {
        // 创建天空球
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(SKY_COLORS[12].top) },
                bottomColor: { value: new THREE.Color(SKY_COLORS[12].bottom) },
                offset: { value: 33 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide
        });
        this.skyDome = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(this.skyDome);

        // 创建天气系统
        this.weatherSystem = new WeatherSystem(this.scene);

        // 创建光源
        this.setupLights();

        // 创建日月
        this.setupCelestialBodies();

        // 初始更新位置
        this.updateCelestialPositions();
    }

    setupLights() {
        // 主阳光
        this.sunLight = new THREE.DirectionalLight(0xffffeb, 1);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 500;
        this.scene.add(this.sunLight);

        // 月光
        this.moonLight = new THREE.DirectionalLight(0x4444ff, 0.2);
        this.moonLight.castShadow = true;
        this.scene.add(this.moonLight);

        // 环境光
        this.ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(this.ambientLight);
    }

    setupCelestialBodies() {
        // 太阳
        const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xffdd00,
            transparent: true,
            opacity: 0.8
        });
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.scene.add(this.sun);

        // 月亮
        const moonGeometry = new THREE.SphereGeometry(8, 32, 32);
        const moonMaterial = new THREE.MeshBasicMaterial({
            color: 0xdddddd,
            transparent: true,
            opacity: 0.8
        });
        this.moon = new THREE.Mesh(moonGeometry, moonMaterial);
        this.scene.add(this.moon);
    }

    updateSkyColors() {
        const hour = Math.floor(this.timeOfDay);
        const nextHour = (hour + 1) % 24;
        const fraction = this.timeOfDay - hour;

        const currentColors = SKY_COLORS[hour];
        const nextColors = SKY_COLORS[nextHour];

        // 插值计算当前颜色
        const topColor = new THREE.Color();
        const bottomColor = new THREE.Color();

        topColor.lerpColors(
            currentColors.top,
            nextColors.top,
            fraction
        );

        bottomColor.lerpColors(
            currentColors.bottom,
            nextColors.bottom,
            fraction
        );

        // 根据天气调整颜色
        switch (this.weatherType) {
            case 'cloudy':
                topColor.multiplyScalar(0.8);
                bottomColor.multiplyScalar(0.8);
                break;
            case 'rainy':
                topColor.multiplyScalar(0.6);
                bottomColor.multiplyScalar(0.6);
                break;
        }

        this.skyDome.material.uniforms.topColor.value.copy(topColor);
        this.skyDome.material.uniforms.bottomColor.value.copy(bottomColor);
    }

    setTimeOfDay(hour) {
        this.timeOfDay = hour;
        this.updateCelestialPositions();
        this.updateSkyColors();
        this.updateLighting();
    }

    setWeather(type) {
        this.weatherType = type;
        this.updateSkyColors();
        this.updateLighting();

        // 更新雨天效果
        if (type === 'rainy') {
            this.weatherSystem.setRainIntensity(1.0);
        } else if (type === 'cloudy') {
            this.weatherSystem.setRainIntensity(0);
        } else {
            this.weatherSystem.setRainIntensity(0);
        }
    }

    updateCelestialPositions() {
        const angle = (this.timeOfDay - 6) * (Math.PI / 12); // 从早上6点开始计算
        const radius = 400;

        // 太阳位置
        this.sun.position.x = Math.cos(angle) * radius;
        this.sun.position.y = Math.sin(angle) * radius;
        this.sun.position.z = 0;

        // 月亮位置 (与太阳相反)
        this.moon.position.x = Math.cos(angle + Math.PI) * radius;
        this.moon.position.y = Math.sin(angle + Math.PI) * radius;
        this.moon.position.z = 0;

        // 更新光源位置
        this.sunLight.position.copy(this.sun.position);
        this.moonLight.position.copy(this.moon.position);
    }

// 在 SkySystem.js updateLighting 方法中更新
    updateLighting() {
        // 计算当前时段的光照强度
        let sunIntensity;
        let moonIntensity;
        const hour = this.timeOfDay;

        // 时段光照强度调整
        if (hour >= 6 && hour < 10) {
            // 早晨时段 (6点-10点) - 基础亮度20%，逐渐增加
            const progress = (hour - 6) / 4;
            sunIntensity = 0.2 + progress * 0.3; // 20% 到 50%
            moonIntensity = 0;
        } else if (hour >= 10 && hour <= 15) {
            // 中午时段 (10点-15点) - 保持50%亮度
            sunIntensity = 0.5;
            moonIntensity = 0;
        } else if (hour > 15 && hour <= 18) {
            // 下午时段 (15点-18点) - 从50%降到30%
            const progress = (hour - 15) / 3;
            sunIntensity = 0.5 - progress * 0.2; // 50% 到 30%
            moonIntensity = 0;
        } else {
            // 夜晚时段
            sunIntensity = 0;
            // 计算月光强度，午夜0点最强
            moonIntensity = 0.3 - Math.abs((hour > 18 ? hour - 24 : hour) - 0) / 6 * 0.2;
            moonIntensity = Math.max(0.1, Math.min(0.3, moonIntensity));
        }

        // 根据天气调整光照
        switch (this.weatherType) {
            case 'cloudy':
                sunIntensity *= 0.8; // 减少光照衰减
                moonIntensity *= 0.8;
                break;
            case 'rainy':
                sunIntensity *= 0.6; // 减少光照衰减
                moonIntensity *= 0.6;
                break;
        }

        // 增加基础光照强度
        this.sunLight.intensity = sunIntensity * 2; // 整体提高光照强度
        this.moonLight.intensity = moonIntensity;

        // 提高环境光基础亮度
        const ambientIntensity = Math.max(
            0.3,  // 提高最小环境光
            (hour >= 6 && hour <= 18) ? sunIntensity * 0.7 : moonIntensity
        );
        this.ambientLight.intensity = ambientIntensity;

        // 更新天体可见度
        const sunOpacity = Math.max(0.2, sunIntensity);
        const moonOpacity = Math.max(0.2, moonIntensity * 2);

        this.sun.material.opacity = sunOpacity;
        this.moon.material.opacity = moonOpacity;
    }

    toggleRealtime() {
        this.isRealtime = !this.isRealtime;
        if (this.isRealtime) {
            const now = new Date();
            this.setTimeOfDay(now.getHours() + now.getMinutes() / 60);
        }
    }

    update(delta) {
        if (this.isRealtime) {
            const now = new Date();
            this.setTimeOfDay(now.getHours() + now.getMinutes() / 60);
        }

        // 更新天气系统
        if (this.weatherSystem) {
            this.weatherSystem.update(delta);
        }
    }

    dispose() {
        // 清理天空球
        if (this.skyDome) {
            this.skyDome.geometry.dispose();
            this.skyDome.material.dispose();
            this.scene.remove(this.skyDome);
        }

        // 清理天体
        if (this.sun) {
            this.sun.geometry.dispose();
            this.sun.material.dispose();
            this.scene.remove(this.sun);
        }
        if (this.moon) {
            this.moon.geometry.dispose();
            this.moon.material.dispose();
            this.scene.remove(this.moon);
        }

        // 清理光源
        if (this.sunLight) {
            this.scene.remove(this.sunLight);
        }
        if (this.moonLight) {
            this.scene.remove(this.moonLight);
        }
        if (this.ambientLight) {
            this.scene.remove(this.ambientLight);
        }

        // 清理天气系统
        if (this.weatherSystem) {
            this.weatherSystem.dispose();
        }
    }
}