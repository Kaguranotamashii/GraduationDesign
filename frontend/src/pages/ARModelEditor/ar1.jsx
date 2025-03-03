import React, { useEffect } from 'react';

const ARDemo = () => {
    useEffect(() => {
        // Import libraries dynamically to prevent issues with SSR
        const script1 = document.createElement('script');
        script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script1.async = true;

        const script2 = document.createElement('script');
        script2.src = 'https://raw.githack.com/AR-js-org/AR.js/master/three.js/build/ar.js';
        script2.async = true;

        // Ensure scripts load in correct order
        document.body.appendChild(script1);

        script1.onload = () => {
            document.body.appendChild(script2);

            script2.onload = () => {
                initAR();
            };
        };

        // Clean up
        return () => {
            document.body.removeChild(script1);
            if (document.body.contains(script2)) {
                document.body.removeChild(script2);
            }

            // Remove any AR.js created elements
            const arElements = document.querySelectorAll('canvas, video');
            arElements.forEach(el => {
                if (el.parentElement) {
                    el.parentElement.removeChild(el);
                }
            });
        };
    }, []);

    const initAR = () => {
        // AR.js and Three.js initialization
        const { THREE, THREEx } = window;

        // Init scene and camera
        const scene = new THREE.Scene();
        const camera = new THREE.Camera();
        scene.add(camera);

        // Create renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0px';
        renderer.domElement.style.left = '0px';
        document.body.appendChild(renderer.domElement);

        // Handle window resize
        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Create AR scene
        const arToolkitSource = new THREEx.ArToolkitSource({
            sourceType: 'webcam',
        });

        arToolkitSource.init(() => {
            setTimeout(() => {
                arToolkitSource.onResize(renderer.domElement);
            }, 2000);
        });

        // Create AR context
        const arToolkitContext = new THREEx.ArToolkitContext({
            cameraParametersUrl: '/data/camera_para.dat',
            detectionMode: 'mono',
        });

        arToolkitContext.init(() => {
            // Copy projection matrix to camera
            camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
        });

        // Create AR marker
        const markerRoot = new THREE.Group();
        scene.add(markerRoot);

        const markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
            type: 'pattern',
            patternUrl: '/data/patt.hiro',
        });

        // Add light to scene
        const ambientLight = new THREE.AmbientLight(0xcccccc, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 1, 0);
        scene.add(directionalLight);

        // Load 3D model
        const gltfLoader = new THREE.GLTFLoader();
        gltfLoader.load('/models/qiniandian.glb', (gltf) => {
                // Center and scale the model
                const model = gltf.scene;

                // Calculate bounding box
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);

                // Scale model to reasonable size
                const scale = 1.0 / maxDim;
                model.scale.set(scale, scale, scale);

                // Center model
                const center = box.getCenter(new THREE.Vector3());
                model.position.x = -center.x * scale;
                model.position.y = -center.y * scale;
                model.position.z = -center.z * scale;

                // Add model to marker
                markerRoot.add(model);

                console.log('3D model loaded successfully');
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('Error loading 3D model:', error);
            });

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            if (arToolkitSource.ready) {
                arToolkitContext.update(arToolkitSource.domElement);
            }

            renderer.render(scene, camera);
        };

        animate();
    };

    return (
        <div className="ar-container">
            <div id="info" style={{ position: 'absolute', top: '10px', width: '100%', textAlign: 'center', zIndex: '10', color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: '5px' }}>
                Point your camera at the HIRO marker to see the 3D model
            </div>
        </div>
    );
};

export default ARDemo;