import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { getBuilderModelUrl } from '@/api/builderApi';

const ARCompatViewer = () => {
    const { builderId } = useParams();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let scene, camera, renderer, controls;
        const initScene = async () => {
            try {
                setLoading(true);
                const response = await getBuilderModelUrl(builderId);
                if (response.code !== 200 || !response.data.model_url) throw new Error('未找到模型文件');

                scene = new THREE.Scene();
                camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                renderer = new THREE.WebGLRenderer({ antialias: true });
                renderer.setSize(window.innerWidth, window.innerHeight);
                containerRef.current.appendChild(renderer.domElement);

                scene.add(new THREE.AmbientLight(0xffffff, 0.5));
                scene.add(new THREE.DirectionalLight(0xffffff, 0.5).position.set(5, 5, 5));

                const loader = new GLTFLoader();
                loader.load(response.data.model_url, (gltf) => {
                    const model = gltf.scene;
                    scene.add(model);
                    camera.position.z = 5;
                    const box = new THREE.Box3().setFromObject(model);
                    const size = box.getSize(new THREE.Vector3());
                    const scale = 2 / Math.max(size.x, size.y, size.z);
                    model.scale.set(scale, scale, scale);
                });

                controls = new OrbitControls(camera, renderer.domElement);
                controls.enableDamping = true;

                const animate = () => {
                    requestAnimationFrame(animate);
                    controls.update();
                    renderer.render(scene, camera);
                };
                animate();

                window.addEventListener('resize', () => {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(window.innerWidth, window.innerHeight);
                });

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        initScene();
        return () => renderer?.dispose();
    }, [builderId]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">AR 兼容模式 - ID: {builderId}</h1>
            {loading && <p>加载模型中...</p>}
            {error && <p className="text-red-500">{error}</p>}
            <div ref={containerRef} className="w-full h-full" />
            <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => navigate(`/model/${builderId}`)}
            >
                返回
            </button>
        </div>
    );
};

export default ARCompatViewer;