// WeatherSystem.js
import * as THREE from 'three';

export class WeatherSystem {
    constructor(scene) {
        this.scene = scene;
        this.raindrops = [];
        this.rainGeometry = null;
        this.rainMaterial = null;
        this.rainSystem = null;
        this.isRaining = false;

        this.init();
    }

    init() {
        // 创建雨滴几何体
        this.rainGeometry = new THREE.BufferGeometry();
        const rainCount = 15000;
        const vertices = new Float32Array(rainCount * 3);

        for (let i = 0; i < rainCount * 3; i += 3) {
            // 随机分布在一个大区域内
            vertices[i] = Math.random() * 400 - 200;     // x
            vertices[i + 1] = Math.random() * 500;       // y
            vertices[i + 2] = Math.random() * 400 - 200; // z
        }

        this.rainGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        // 创建雨滴材质
        this.rainMaterial = new THREE.ShaderMaterial({
            transparent: true,
            uniforms: {
                time: { value: 0 },
                size: { value: 0.1 },
                color: { value: new THREE.Color(0xaaaaaa) }
            },
            vertexShader: `
                uniform float time;
                uniform float size;
                
                void main() {
                    vec3 pos = position;
                    // 雨滴下落动画
                    pos.y = mod(pos.y - time * 200.0, 500.0);
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                
                void main() {
                    // 创建雨滴形状
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float strength = length(center);
                    if (strength > 0.5) discard;
                    
                    // 渐变效果
                    float alpha = 1.0 - strength * 2.0;
                    gl_FragColor = vec4(color, alpha * 0.5);
                }
            `
        });

        // 创建粒子系统
        this.rainSystem = new THREE.Points(this.rainGeometry, this.rainMaterial);
        this.rainSystem.visible = false;
        this.scene.add(this.rainSystem);
    }

    update(delta) {
        if (this.isRaining && this.rainMaterial) {
            this.rainMaterial.uniforms.time.value += delta;
        }
    }

    setRainIntensity(intensity) {
        if (!this.rainMaterial) return;

        // 调整雨滴大小和可见度
        this.rainMaterial.uniforms.size.value = intensity * 0.2;
        if (intensity > 0) {
            this.isRaining = true;
            this.rainSystem.visible = true;
        } else {
            this.isRaining = false;
            this.rainSystem.visible = false;
        }
    }

    dispose() {
        if (this.rainGeometry) {
            this.rainGeometry.dispose();
        }
        if (this.rainMaterial) {
            this.rainMaterial.dispose();
        }
        if (this.rainSystem) {
            this.scene.remove(this.rainSystem);
        }
    }
}