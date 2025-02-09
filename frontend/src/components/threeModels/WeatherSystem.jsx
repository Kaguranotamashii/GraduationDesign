import * as THREE from 'three';
import VolumetricCloudSystem from "./VolumetricCloudSystem.jsx";

class WeatherSystem {
    constructor(scene) {
        this.scene = scene;
        this.weatherParticles = null;
        this.rainCount = 30000;
        this.rainGeometry = null;
        this.rainMaterial = null;
        this.rainVelocity = [];
        this.groundLevel = 0;
        this.currentWeather = 'sunny';

        // 天气影响配置
        this.weatherInfluence = {
            color: null,      // 当前天气的颜色影响
            intensity: 0      // 天气效果强度 (0-1)
        };

        // 修改天气颜色配置，添加夜间颜色
        this.weatherColors = {
            rainy: {
                day: new THREE.Color(0x555555),    // 日间雨天深灰色
                night: new THREE.Color(0x151515)   // 夜间雨天更深的灰色
            },
            cloudy: {
                day: new THREE.Color(0x888888),    // 日间阴天中灰色
                night: new THREE.Color(0x0B0612)   // 夜间阴天深灰色
            },
            sunny: {
                day: null,                         // 晴天使用时间系统的颜色
                night: null
            }
        };

        // 过渡动画相关
        this.transitionDuration = 2.0; // 过渡时间（秒）
        this.transitionProgress = 1.0;  // 1.0 表示没有过渡
        this.previousColor = null;
        this.targetColor = null;

        // 初始化云系统并设置初始状态
        this.cloudSystem = new VolumetricCloudSystem(scene);
        this.cloudSystem.setVisibility(false);
        this.cloudSystem.setCloudColor(new THREE.Color(0xCCCCCC));

        // 添加夜间云颜色
        this.cloudColors = {
            rainy: {
                day: new THREE.Color(0x666666),
                night: new THREE.Color(0x333333)
            },
            cloudy: {
                day: new THREE.Color(0x999999),
                night: new THREE.Color(0x444444)
            },
            sunny: {
                day: new THREE.Color(0xFFFFFF),
                night: new THREE.Color(0x555555)
            }
        };
    }

    setGroundLevel(level) {
        this.groundLevel = level;
    }

    initRain() {
        this.rainGeometry = new THREE.BufferGeometry();
        const rainPositions = [];
        this.rainVelocity = [];

        const rainDropLength = 1.2;
        const areaSize = 150;
        const heightRange = 120;

        for (let i = 0; i < this.rainCount; i++) {
            const x = (Math.random() - 0.5) * areaSize;
            const y = Math.random() * heightRange + 50;
            const z = (Math.random() - 0.5) * areaSize;

            rainPositions.push(
                x, y, z,
                x, y - rainDropLength, z
            );

            const speedY = -25 - Math.random() * 20;
            const speedX = (Math.random() - 0.5) * 4;
            const speedZ = (Math.random() - 0.5) * 4;
            this.rainVelocity.push(
                speedX, speedY, speedZ,
                speedX, speedY, speedZ
            );
        }

        this.rainGeometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(rainPositions, 3)
        );

        this.rainMaterial = new THREE.LineBasicMaterial({
            color: 0xEEEEEE,
            transparent: true,
            opacity: 0.7,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            fog: true
        });

        this.weatherParticles = new THREE.LineSegments(this.rainGeometry, this.rainMaterial);
        this.weatherParticles.name = 'weatherParticles';
        this.weatherParticles.renderOrder = 1;
    }

    updateRain(deltaTime) {
        if (!this.weatherParticles) return;

        const positions = this.rainGeometry.attributes.position.array;
        const areaSize = 150;

        for (let i = 0; i < this.rainCount; i++) {
            const i6 = i * 6;

            for (let j = 0; j < 6; j += 3) {
                positions[i6 + j] += this.rainVelocity[i6 + j] * deltaTime;
                positions[i6 + j + 1] += this.rainVelocity[i6 + j + 1] * deltaTime;
                positions[i6 + j + 2] += this.rainVelocity[i6 + j + 2] * deltaTime;
            }

            if (positions[i6 + 1] < this.groundLevel ||
                Math.abs(positions[i6]) > areaSize/2 ||
                Math.abs(positions[i6 + 2]) > areaSize/2) {

                const x = (Math.random() - 0.5) * areaSize;
                const y = 120 + Math.random() * 30;
                const z = (Math.random() - 0.5) * areaSize;

                positions[i6] = x;
                positions[i6 + 1] = y;
                positions[i6 + 2] = z;
                positions[i6 + 3] = x;
                positions[i6 + 4] = y - 1.2;
                positions[i6 + 5] = z;

                const speedY = -25 - Math.random() * 20;
                const speedX = (Math.random() - 0.5) * 4;
                const speedZ = (Math.random() - 0.5) * 4;
                this.rainVelocity[i6] = speedX;
                this.rainVelocity[i6 + 1] = speedY;
                this.rainVelocity[i6 + 2] = speedZ;
                this.rainVelocity[i6 + 3] = speedX;
                this.rainVelocity[i6 + 4] = speedY;
                this.rainVelocity[i6 + 5] = speedZ;
            }
        }

        this.rainGeometry.attributes.position.needsUpdate = true;
    }

    setWeather(weatherType, fogIntensity = 0, currentTimeColor, hour) {
        const previousWeather = this.currentWeather;
        this.currentWeather = weatherType;

        // 移除现有的雨滴
        const existingParticles = this.scene.getObjectByName('weatherParticles');
        if (existingParticles) {
            this.scene.remove(existingParticles);
        }

        const isNight = hour >= 18 || hour < 6;

        // 设置天气影响
        if (weatherType === 'sunny') {
            this.weatherInfluence = {
                color: null,
                intensity: 0
            };
            this.targetColor = currentTimeColor.clone();
        } else {
            const weatherColor = isNight
                ? this.weatherColors[weatherType].night
                : this.weatherColors[weatherType].day;



            this.weatherInfluence = {
                color: weatherColor,
                intensity: isNight ? 0.3 : 0.6
            };

            this.targetColor = currentTimeColor.clone().lerp(weatherColor, this.weatherInfluence.intensity);
        }

        // 开始颜色过渡
        this.previousColor = this.scene.background.clone();
        this.transitionProgress = 0;

        // 设置雨滴材质的暗度
        if (this.rainMaterial) {
            this.rainMaterial.opacity = isNight ? 0.4 : 0.7;
            this.rainMaterial.color.setHex(isNight ? 0x888888 : 0xEEEEEE);
        }

        // 根据天气类型设置效果
        switch (weatherType) {
            case 'rainy':
                if (!this.rainGeometry) {
                    this.initRain();
                }
                this.scene.add(this.weatherParticles);

                const fogNear = isNight ? 1 : 5;
                const fogFar = isNight
                    ? 20 + (1 - fogIntensity) * 20
                    : 40 + (1 - fogIntensity) * 40;

                this.scene.fog = new THREE.Fog(
                    this.targetColor,
                    fogNear,
                    fogFar
                );

                this.cloudSystem.setVisibility(true, 'rainy');
                this.cloudSystem.setCloudColor(
                    isNight
                        ? this.cloudColors.rainy.night
                        : this.cloudColors.rainy.day
                );
                break;

            case 'cloudy':
                const cloudyFogNear = isNight ? 30 : 50;
                const cloudyFogFar = isNight
                    ? 200 + (1 - fogIntensity) * 50
                    : 500 + (1 - fogIntensity) * 100;

                this.scene.fog = new THREE.Fog(
                    this.targetColor,
                    cloudyFogNear,
                    cloudyFogFar
                );

                this.cloudSystem.setVisibility(true, 'cloudy');
                this.cloudSystem.setCloudColor(
                    isNight
                        ? this.cloudColors.cloudy.night
                        : this.cloudColors.cloudy.day
                );
                break;

            case 'sunny':
                this.cloudSystem.setVisibility(true, 'sunny');
                this.cloudSystem.setCloudColor(
                    isNight
                        ? this.cloudColors.sunny.night
                        : this.cloudColors.sunny.day
                );
                this.scene.fog = null;
                break;
        }
    }

    update(deltaTime, currentTimeColor, hour) {
        // 更新雨效果
        if (this.currentWeather === 'rainy') {
            this.updateRain(deltaTime);
        }

        // 计算目标颜色
        let targetColor;
        if (this.weatherInfluence.color === null) {
            // 晴天直接使用时间颜色
            targetColor = currentTimeColor.clone();
        } else {
            // 其他天气应用天气影响
            targetColor = currentTimeColor.clone().lerp(
                this.weatherInfluence.color,
                this.weatherInfluence.intensity
            );
        }

        // 在过渡期间使用插值
        if (this.transitionProgress < 1.0) {
            this.transitionProgress = Math.min(
                this.transitionProgress + deltaTime / this.transitionDuration,
                1.0
            );

            const currentColor = new THREE.Color();
            currentColor.lerpColors(this.previousColor, targetColor, this.transitionProgress);

            this.scene.background = currentColor;
            if (this.scene.fog) {
                this.scene.fog.color = currentColor;
            }
        } else {
            // 过渡完成后直接设置目标颜色
            this.scene.background = targetColor;
            if (this.scene.fog) {
                this.scene.fog.color = targetColor;
            }
        }

        // 更新云系统
        if (this.cloudSystem && this.scene.camera) {
            this.cloudSystem.update(deltaTime, this.scene.camera);
        }
    }
}

export default WeatherSystem;