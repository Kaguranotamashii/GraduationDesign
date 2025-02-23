import React from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { ARButton } from 'three/examples/jsm/webxr/ARButton';

class ARDemo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showPopup: false,
            popupPosition: { x: 0, y: 0 },
            buildingInfo: {
                name: "齐年殿",
                year: "始建于明朝",
                description: "这是一座具有重要历史价值的古建筑"
            }
        };

        this.mount = React.createRef();
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.model = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }

    init = () => {
        // 设置渲染器
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.xr.enabled = true;
        this.mount.current.appendChild(this.renderer.domElement);

        // 添加AR按钮
        const arButton = ARButton.createButton(this.renderer, {
            requiredFeatures: ['hit-test'],
            optionalFeatures: ['dom-overlay'],
            domOverlay: { root: document.body }
        });
        document.body.appendChild(arButton);

        // 设置相机位置
        this.camera.position.set(0, 2, 5);

        // 添加环境光和定向光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 5, 0);
        this.scene.add(ambientLight, directionalLight);

        // 加载3D模型
        const loader = new GLTFLoader();
        loader.load(
            '/models/qiniandian.glb',
            (gltf) => {
                this.model = gltf.scene;
                this.model.scale.set(0.1, 0.1, 0.1);
                this.scene.add(this.model);
            },
            (progress) => {
                console.log('Loading model...', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('Error loading model:', error);
            }
        );

        // 添加点击事件监听
        window.addEventListener('click', this.onModelClick);

        // 开始动画循环
        this.renderer.setAnimationLoop(this.animate);
    }

    onModelClick = (event) => {
        // 将鼠标位置归一化为设备坐标
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // 更新射线
        this.raycaster.setFromCamera(this.mouse, this.camera);

        if (this.model) {
            // 检查射线与模型的相交
            const intersects = this.raycaster.intersectObject(this.model, true);

            if (intersects.length > 0) {
                // 显示弹窗
                this.setState({
                    showPopup: true,
                    popupPosition: {
                        x: event.clientX,
                        y: event.clientY
                    }
                });

                // 模型点击动画效果
                const clickedMesh = intersects[0].object;
                const originalScale = clickedMesh.scale.clone();
                clickedMesh.scale.multiplyScalar(1.2);

                setTimeout(() => {
                    clickedMesh.scale.copy(originalScale);
                }, 200);
            } else {
                // 点击其他地方时关闭弹窗
                this.setState({ showPopup: false });
            }
        }
    }

    animate = () => {
        if (this.model) {
            this.model.rotation.y += 0.001;
        }
        this.renderer.render(this.scene, this.camera);
    }

    componentDidMount() {
        this.init();
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.onModelClick);
        this.mount.current.removeChild(this.renderer.domElement);
        this.renderer.dispose();
    }

    render() {
        const { showPopup, popupPosition, buildingInfo } = this.state;

        return (
            <>
                <div ref={this.mount} style={{ width: '100%', height: '100vh' }} />

                {/* 信息弹窗 */}
                {showPopup && (
                    <div
                        style={{
                            position: 'fixed',
                            left: popupPosition.x + 20,
                            top: popupPosition.y - 20,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            padding: '15px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                            zIndex: 1000,
                            maxWidth: '250px'
                        }}
                    >
                        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                            {buildingInfo.name}
                        </h3>
                        <p style={{ margin: '5px 0', color: '#666' }}>
                            {buildingInfo.year}
                        </p>
                        <p style={{ margin: '5px 0', color: '#666' }}>
                            {buildingInfo.description}
                        </p>
                        <button
                            style={{
                                position: 'absolute',
                                right: '5px',
                                top: '5px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '16px',
                                color: '#999'
                            }}
                            onClick={() => this.setState({ showPopup: false })}
                        >
                            ×
                        </button>
                    </div>
                )}
            </>
        );
    }
}

export default ARDemo;