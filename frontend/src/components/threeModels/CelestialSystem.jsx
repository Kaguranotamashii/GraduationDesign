import * as THREE from 'three';

class CelestialSystem {
    constructor(scene) {
        this.lightIntensityMultiplier = 1;
        this.scene = scene;
        this.sun = null;
        this.moon = null;
        this.sunLight = null;
        this.moonLight = null;
        this.ambientLight = null;
        this.dayBreakHour = 6;    // 日出时间
        this.nightFallHour = 18;  // 日落时间

        // 当前天空颜色引用
        this.currentSkyColor = new THREE.Color();

        // 24小时天空颜色映射
        this.hourlyColors = {
            0: '#02030A',  // 深蓝接近黑色
            1: '#03040F',  // 深蓝加一点亮度
            2: '#040517',  // 略带紫色的深蓝
            3: '#060824',  // 略微亮一点
            4: '#081035',  // 深蓝微带晨光
            5: '#152B50',  // 天空泛起微光
            6: '#3B6FA0',  // 天蓝色出现
            7: '#74A4D8',  // 清晨明亮天蓝
            8: '#8EC5F3',  // 浅蓝色天光
            9: '#74B2E5',  // 天空明亮
            10: '#5CA0E1', // 深一点的蓝
            11: '#3F92DC', // 接近中午的蓝
            12: '#3090D0', // 最明亮的天蓝
            13: '#3B88C8', // 稍微变深
            14: '#4C7FC1', // 开始趋向傍晚
            15: '#6B6EAE', // 加深的蓝色
            16: '#866399', // 蓝紫色过渡
            17: '#A25272', // 夕阳橙色
            18: '#C23F4E', // 深橙红色
            19: '#792E48', // 夜幕降临的紫红
            20: '#452144', // 深紫色
            21: '#2C1837', // 夜晚加深
            22: '#180E25', // 深蓝接近黑色
            23: '#0B0612'  // 深蓝黑色
        };

        // 调整夜间光照特性
        this.timeCharacteristics = {
            NIGHT: {
                ambientIntensity: 0.075,     // 将夜间环境光降低50% (从0.15降到0.075)
                ambientColor: 0x0B0612,
                moonLightBase: 0.6,          // 增加月光基础强度 (从0.4提升到0.6)
                moonColor: { h: 0.6, s: 0.15, l: 0.9 }
            },
            DAWN: {
                ambientIntensity: 0.3,
                ambientColor: 0x152B50,
                sunColor: { h: 0.05, s: 0.7, l: 0.65 }
            },
            DAY: {
                ambientIntensity: 0.5,
                ambientColor: 0x3090D0,
                sunColor: { h: 0.1, s: 0.2, l: 1.0 }
            },
            DUSK: {
                ambientIntensity: 0.25,
                ambientColor: 0xA25272,
                sunColor: { h: 0.02, s: 0.8, l: 0.55 }
            }
        };


        this.init();
    }

    init() {
        // 创建太阳
        const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xffdd99,
            transparent: true,
            opacity: 0.8
        });
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);

        // 创建太阳光晕
        const sunHaloGeometry = new THREE.SphereGeometry(7, 32, 32);
        const sunHaloMaterial = new THREE.MeshBasicMaterial({
            color: 0xffee99,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const sunHalo = new THREE.Mesh(sunHaloGeometry, sunHaloMaterial);
        this.sun.add(sunHalo);

        // 创建月亮及其光晕
        const moonGeometry = new THREE.SphereGeometry(3, 32, 32);
        const moonMaterial = new THREE.MeshBasicMaterial({
            color: 0xeeeeee,
            transparent: true,
            opacity: 0.8
        });
        this.moon = new THREE.Mesh(moonGeometry, moonMaterial);

        // 创建月亮光晕
        const moonHaloGeometry = new THREE.SphereGeometry(4.5, 32, 32);
        const moonHaloMaterial = new THREE.MeshBasicMaterial({
            color: 0xaaaaff,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        const moonHalo = new THREE.Mesh(moonHaloGeometry, moonHaloMaterial);
        this.moon.add(moonHalo);

        // 创建光源
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
        this.moonLight = new THREE.DirectionalLight(0xaaaaff, 0.8);
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.3);

        // 设置阴影
        this.sunLight.castShadow = true;
        this.moonLight.castShadow = true;

        // 配置阴影参数
        const shadowConfig = {
            mapSize: { width: 4096, height: 4096 },
            camera: {
                near: 0.5,
                far: 350,
                left: -150,
                right: 150,
                top: 150,
                bottom: -150
            }
        };

        // 配置太阳光阴影
        this.configureShadows(this.sunLight, shadowConfig);

        // 配置月光阴影（范围更大）
        this.configureShadows(this.moonLight, {
            mapSize: shadowConfig.mapSize,
            camera: {
                near: shadowConfig.camera.near,
                far: shadowConfig.camera.far * 1.5,
                left: shadowConfig.camera.left * 1.5,
                right: shadowConfig.camera.right * 1.5,
                top: shadowConfig.camera.top * 1.5,
                bottom: shadowConfig.camera.bottom * 1.5
            }
        });

        // 优化月光阴影
        this.moonLight.shadow.bias = -0.0001;
        this.moonLight.shadow.normalBias = 0.05;
        this.moonLight.shadow.radius = 1.5;

        // 添加到场景
        this.scene.add(this.sun);
        this.scene.add(this.moon);
        this.scene.add(this.sunLight);
        this.scene.add(this.moonLight);
        this.scene.add(this.ambientLight);
    }

    configureShadows(light, config) {
        light.shadow.mapSize.width = config.mapSize.width;
        light.shadow.mapSize.height = config.mapSize.height;
        light.shadow.camera.near = config.camera.near;
        light.shadow.camera.far = config.camera.far;
        light.shadow.camera.left = config.camera.left;
        light.shadow.camera.right = config.camera.right;
        light.shadow.camera.top = config.camera.top;
        light.shadow.camera.bottom = config.camera.bottom;
    }

    getCurrentSkyColor() {
        return this.currentSkyColor;
    }

    getHourColor(hour) {
        const baseHour = Math.floor(hour);
        const nextHour = (baseHour + 1) % 24;
        const progress = hour - baseHour;

        const currentColor = new THREE.Color(this.hourlyColors[baseHour]);
        const nextColor = new THREE.Color(this.hourlyColors[nextHour]);

        return new THREE.Color().lerpColors(currentColor, nextColor, progress);
    }

    update(hour, weatherSystem) {
        // 计算时间进度
        const dayProgress = (hour - this.dayBreakHour) / (this.nightFallHour - this.dayBreakHour);
        const nightProgress = (hour < this.dayBreakHour)
            ? (hour + 24 - this.nightFallHour) / (24 - this.nightFallHour + this.dayBreakHour)
            : (hour - this.nightFallHour) / (24 - this.nightFallHour + this.dayBreakHour);

        // 更新天空颜色
        const skyColor = this.getHourColor(hour);
        this.currentSkyColor.copy(skyColor);

        if (!weatherSystem || weatherSystem.currentWeather === 'sunny') {
            this.scene.background = skyColor;
        }

        // 太阳位置和光照
        if (hour >= this.dayBreakHour && hour <= this.nightFallHour) {
            this.updateSunLighting(hour, dayProgress);
        } else {
            this.sun.visible = false;
            this.sunLight.intensity = 0;
        }

        // 月亮位置和光照
        if (hour <= this.dayBreakHour || hour >= this.nightFallHour) {
            this.updateMoonLighting(hour, nightProgress, weatherSystem);
        } else {
            this.moon.visible = false;
            this.moonLight.intensity = 0.1;
        }

        // 更新环境光
        this.updateAmbientLight(hour, dayProgress, nightProgress);
    }

    updateSunLighting(hour, dayProgress) {
        const sunAngle = (dayProgress - 0.5) * Math.PI;
        const radius = 200;

        this.sun.position.set(
            Math.cos(sunAngle) * radius,
            Math.sin(sunAngle) * radius,
            0
        );
        this.sunLight.position.copy(this.sun.position);

        const sunIntensity = Math.sin(dayProgress * Math.PI) * this.lightIntensityMultiplier;
        this.sunLight.intensity = Math.max(0, sunIntensity);

        // 调整太阳颜色
        if (hour < 7) { // 日出
            this.sunLight.color.setHSL(0.05, 0.8, 0.7);
        } else if (hour > 17) { // 日落
            this.sunLight.color.setHSL(0.02, 0.9, 0.6);
        } else {
            const dayColor = { h: 0.1, s: 0.2, l: 1.0 };
            this.sunLight.color.setHSL(dayColor.h, dayColor.s, dayColor.l);
        }

        this.sun.visible = true;
    }

    updateMoonLighting(hour, nightProgress, weatherSystem) {
        const moonAngle = nightProgress * Math.PI;
        const radius = 150;

        this.moon.position.set(
            Math.cos(moonAngle) * radius,
            Math.sin(moonAngle) * radius,
            0
        );
        this.moonLight.position.copy(this.moon.position);

        // 月光强度计算
        let moonIntensity = Math.sin(nightProgress * Math.PI) * 0.5;

        // 天气影响
        if (weatherSystem) {
            console.log(weatherSystem.currentWeather + ' intensity: ' + moonIntensity)
            switch(weatherSystem.currentWeather) {
                case 'rainy': moonIntensity *= 0.5; break;
                case 'cloudy': moonIntensity *= 0.56; break;
            }
        }

        moonIntensity = Math.max(0.4, moonIntensity * this.lightIntensityMultiplier);
        this.moonLight.intensity = moonIntensity;

        // 月光颜色
        const moonHeight = Math.sin(moonAngle);
        const { h, s, l } = this.timeCharacteristics.NIGHT.moonColor;
        this.moonLight.color.setHSL(h, moonHeight < 0.2 ? s + 0.1 : s, l);

        this.moon.visible = true;
    }

    updateAmbientLight(hour, dayProgress, nightProgress) {
        let intensity, color;

        if (hour >= 22 || hour < 4) { // 深夜
            const characteristics = this.timeCharacteristics.NIGHT;
            intensity = characteristics.ambientIntensity;
            color = characteristics.ambientColor;
        } else if (hour >= 4 && hour < 7) { // 黎明
            const characteristics = this.timeCharacteristics.DAWN;
            intensity = characteristics.ambientIntensity;
            color = characteristics.ambientColor;
        } else if (hour >= 7 && hour < 17) { // 白天
            const characteristics = this.timeCharacteristics.DAY;
            intensity = characteristics.ambientIntensity;
            color = characteristics.ambientColor;
        } else if (hour >= 17 && hour < 22) { // 黄昏
            const characteristics = this.timeCharacteristics.DUSK;
            intensity = characteristics.ambientIntensity;
            color = characteristics.ambientColor;
        }

        this.ambientLight.intensity = intensity * this.lightIntensityMultiplier;
        this.ambientLight.color.setHex(color);
    }

    setDayNightTimes(dayBreakHour, nightFallHour) {
        this.dayBreakHour = dayBreakHour;
        this.nightFallHour = nightFallHour;
    }

    setLightIntensityMultiplier(multiplier) {
        this.lightIntensityMultiplier = multiplier;
    }
}

export default CelestialSystem;