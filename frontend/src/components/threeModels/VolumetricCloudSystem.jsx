import * as THREE from 'three';

class VolumetricCloudSystem {
    constructor(scene) {
        this.scene = scene;
        this.clouds = [];
        this.baseCloudCount = 30;
        this.currentCloudCount = this.baseCloudCount;
        this.cloudShader = {
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vWorldPosition;
                varying float vElevation;
                
                void main() {
                    vUv = uv;
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    vElevation = worldPosition.y;
                    gl_Position = projectionMatrix * viewMatrix * worldPosition;
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform vec3 uCloudColor;
                uniform float uCloudDensity;
                
                varying vec2 vUv;
                varying vec3 vWorldPosition;
                varying float vElevation;
                
                float random(vec3 p) {
                    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
                }
                
                // 改进的柏林噪声实现
                float noise(vec3 x) {
                    vec3 p = floor(x);
                    vec3 f = fract(x);
                    f = f * f * (3.0 - 2.0 * f);
                
                    float n = p.x + p.y * 157.0 + 113.0 * p.z;
                    return mix(
                        mix(
                            mix(random(p + vec3(0, 0, 0)), random(p + vec3(1, 0, 0)), f.x),
                            mix(random(p + vec3(0, 1, 0)), random(p + vec3(1, 1, 0)), f.x),
                            f.y
                        ),
                        mix(
                            mix(random(p + vec3(0, 0, 1)), random(p + vec3(1, 0, 1)), f.x),
                            mix(random(p + vec3(0, 1, 1)), random(p + vec3(1, 1, 1)), f.x),
                            f.y
                        ),
                        f.z
                    );
                }
                
                // 分形布朗运动（FBM）
                float fbm(vec3 p) {
                    float value = 0.0;
                    float amplitude = 0.5;
                    float frequency = 1.0;
                    
                    // 添加多个噪声层以创建更自然的形状
                    for(int i = 0; i < 5; i++) {
                        value += amplitude * noise(p * frequency + uTime * 0.1);
                        frequency *= 2.0;
                        amplitude *= 0.5;
                    }
                    
                    return value;
                }
                
                // 从边缘到中心的渐变
                float radialGradient(vec2 center, float radius) {
                    float dist = length(vUv - center);
                    return smoothstep(radius, radius * 0.5, dist);
                }
                
                void main() {
                    // 基础云形状
                    vec3 noisePos = vec3(vUv * 5.0, uTime * 0.05);
                    float noise1 = fbm(noisePos);
                    float noise2 = fbm(noisePos * 2.0 + vec3(100.0));
                    
                    // 创建云的层次感
                    float cloudShape = noise1 * 0.6 + noise2 * 0.4;
                    
                    // 添加边缘渐变
                    float edge = radialGradient(vec2(0.5), 0.8);
                    cloudShape *= edge;
                    
                    // 添加高度渐变，使云底部较暗
                    float heightGradient = smoothstep(0.2, 0.8, vElevation / 100.0);
                    cloudShape *= mix(0.6, 1.0, heightGradient);
                    
                    // 调整云的密度和形状
                    float density = smoothstep(0.3, 0.7, cloudShape) * uCloudDensity;
                    
                    // 创建云的明暗变化
                    vec3 cloudColorWithShading = mix(
                        uCloudColor * 0.8,  // 暗部
                        uCloudColor * 1.2,  // 亮部
                        noise2
                    );
                    
                    // 最终颜色
                    gl_FragColor = vec4(cloudColorWithShading, density * smoothstep(0.0, 0.2, cloudShape));
                }
            `
        };

        this.init();
    }

    init() {
        for (let i = 0; i < this.baseCloudCount; i++) {
            const cloudGeometry = new THREE.PlaneGeometry(100 + Math.random() * 50, 100 + Math.random() * 50);

            const cloudMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0 },
                    uCloudColor: { value: new THREE.Color(0xFFFFFF) },
                    uCloudDensity: { value: 0.8 + Math.random() * 0.2 }
                },
                vertexShader: this.cloudShader.vertexShader,
                fragmentShader: this.cloudShader.fragmentShader,
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });

            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);

            // 随机位置和旋转
            cloud.position.set(
                (Math.random() - 0.5) * 300,
                60 + Math.random() * 40,
                (Math.random() - 0.5) * 300
            );

            // 添加一些随机旋转让云看起来更自然
            cloud.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.2;
            cloud.rotation.y = (Math.random() - 0.5) * 0.2;
            cloud.rotation.z = Math.random() * Math.PI * 2;

            this.clouds.push(cloud);
            this.scene.add(cloud);
        }
    }

    update(deltaTime) {
        this.clouds.forEach((cloud, index) => {
            // 更新时间uniform
            cloud.material.uniforms.uTime.value += deltaTime * 0.5;

            // 缓慢移动云
            cloud.position.x += deltaTime * (0.5 + Math.sin(index * 0.1) * 0.5);

            // 如果云移出范围，重置到另一边
            if (cloud.position.x > 150) {
                cloud.position.x = -150;
                cloud.position.z = (Math.random() - 0.5) * 300;
                cloud.position.y = 60 + Math.random() * 40;

                // 重置旋转
                cloud.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.2;
                cloud.rotation.y = (Math.random() - 0.5) * 0.2;
                cloud.rotation.z = Math.random() * Math.PI * 2;
            }
        });
    }

    setVisibility(visible, weatherType = 'sunny') {
        // 根据天气类型调整可见的云的数量
        switch(weatherType) {
            case 'rainy':
                this.currentCloudCount = this.baseCloudCount * 2;
                break;
            case 'cloudy':
                this.currentCloudCount = this.baseCloudCount * 1.5;
                break;
            case 'sunny':
                this.currentCloudCount = Math.floor(this.baseCloudCount * 0.5);
                break;
        }

        // 设置云的可见性
        this.clouds.forEach((cloud, index) => {
            const isVisible = visible && index < this.currentCloudCount;
            cloud.visible = isVisible;
            if (isVisible) {
                // 根据天气调整云的密度
                cloud.material.uniforms.uCloudDensity.value =
                    weatherType === 'rainy' ? 0.9 + Math.random() * 0.1 :
                        weatherType === 'cloudy' ? 0.7 + Math.random() * 0.2 :
                            0.5 + Math.random() * 0.2;
            }
        });
    }

    setCloudColor(color) {
        this.clouds.forEach(cloud => {
            cloud.material.uniforms.uCloudColor.value = color;
        });
    }
}

export default VolumetricCloudSystem;