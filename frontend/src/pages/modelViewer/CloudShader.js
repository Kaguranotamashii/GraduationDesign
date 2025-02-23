// CloudShader.js
import * as THREE from 'three';

export const CloudShader = {
    uniforms: {
        time: { value: 0 },
        scale: { value: 1.0 },
        opacity: { value: 0.6 },
        cloudColor: { value: new THREE.Color(0xffffff) },
        cloudDensity: { value: 0.8 }
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform float scale;
        uniform float opacity;
        uniform vec3 cloudColor;
        uniform float cloudDensity;
        varying vec2 vUv;
        varying vec3 vPosition;

        // 改进的哈希函数
        float hash(vec2 p) {
            p = fract(p * vec2(234.34, 435.345));
            p += dot(p, p + 34.23);
            return fract(p.x * p.y);
        }

        // 改进的2D噪声
        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            
            // 四个角的值
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            
            // 平滑插值
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        // FBM (分形布朗运动)
        float fbm(vec2 p) {
            float value = 0.0;
            float amplitude = 0.5;
            float frequency = 1.0;
            
            // 添加多个八度的噪声
            for(int i = 0; i < 6; i++) {
                value += amplitude * noise(p * frequency);
                frequency *= 2.0;
                amplitude *= 0.5;
            }
            
            return value;
        }

        void main() {
            // 创建多层动态云纹理
            vec2 position = vUv * scale;
            
            // 添加时间偏移，创造云的流动效果
            float timeOffset = time * 0.05;
            vec2 movement = vec2(timeOffset, timeOffset * 0.5);
            
            // 生成基础云层
            float baseCloud = fbm(position + movement);
            
            // 添加细节层
            float detail = fbm(position * 2.0 - movement);
            
            // 组合层并添加动态效果
            float finalCloud = baseCloud;
            finalCloud += detail * 0.5;
            finalCloud = smoothstep(0.4, 0.8, finalCloud * cloudDensity);
            
            // 使边缘更柔和
            finalCloud *= smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
            finalCloud *= smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
            
            // 设置最终颜色
            vec3 finalColor = mix(cloudColor, vec3(1.0), finalCloud * 0.3);
            float finalOpacity = finalCloud * opacity;
            
            gl_FragColor = vec4(finalColor, finalOpacity);
        }
    `
};

export class CloudLayer {
    setCloudDensity(density) {
        this.clouds.forEach(cloud => {
            cloud.material.uniforms.cloudDensity.value = density;
            // 调整不透明度以匹配密度
            cloud.material.uniforms.opacity.value = density * 0.6;
        });
    }
    constructor(scene, options = {}) {
        this.scene = scene;
        this.clouds = [];
        this.cloudTime = 0;
        this.options = {
            count: options.count || 8,
            size: options.size || 30,
            height: options.height || { min: 20, max: 35 },
            opacity: options.opacity || { min: 0.2, max: 0.5 },
            speed: options.speed || { min: 0.05, max: 0.2 },
            ...options
        };

        this.createClouds();
    }

    createClouds() {
        const cloudGeometry = new THREE.PlaneGeometry(this.options.size, this.options.size, 32, 32);

        for (let i = 0; i < this.options.count; i++) {
            const cloudMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    scale: { value: Math.random() * 1.5 + 1.0 },
                    opacity: { value: Math.random() *
                            (this.options.opacity.max - this.options.opacity.min) +
                            this.options.opacity.min },
                    cloudColor: { value: new THREE.Color(0xffffff) },
                    cloudDensity: { value: Math.random() * 0.3 + 0.6 }
                },
                vertexShader: CloudShader.vertexShader,
                fragmentShader: CloudShader.fragmentShader,
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide
            });

            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);

            // 随机位置和旋转
            cloud.position.set(
                Math.random() * 60 - 30,
                Math.random() *
                (this.options.height.max - this.options.height.min) +
                this.options.height.min,
                Math.random() * 60 - 30
            );

            cloud.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.2;
            cloud.rotation.y = (Math.random() - 0.5) * 0.2;

            // 随机缩放
            const scale = Math.random() * 0.5 + 0.8;
            cloud.scale.set(scale, scale, 1);

            // 移动速度
            cloud.speed = Math.random() *
                (this.options.speed.max - this.options.speed.min) +
                this.options.speed.min;

            this.clouds.push(cloud);
            this.scene.add(cloud);
        }
    }

    update(delta) {
        this.cloudTime += delta;
        this.clouds.forEach((cloud, index) => {
            // 更新着色器时间
            cloud.material.uniforms.time.value = this.cloudTime + index;

            // 移动云
            cloud.position.x += cloud.speed * delta;
            if (cloud.position.x > 30) {
                cloud.position.x = -30;
            }
        });
    }

    dispose() {
        this.clouds.forEach(cloud => {
            cloud.geometry.dispose();
            cloud.material.dispose();
            this.scene.remove(cloud);
        });
        this.clouds = [];
    }
}