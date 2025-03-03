import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Spin, Input, Select, Pagination, Empty, Tag, Dropdown, Menu, Tooltip } from 'antd';
import {
    EyeOutlined,
    EnvironmentOutlined,
    TagOutlined,
    HistoryOutlined,
    AppstoreOutlined,
    BarsOutlined,
    FullscreenOutlined
} from '@ant-design/icons';
import { getAllModelsWithThreeD, getBuildingCategories, getBuildingTags } from '@/api/builderApi';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const { Search } = Input;
const { Option } = Select;

// Fix for the ModelPreview component
const ModelPreview = ({ modelUrl, onClose }) => {
    const containerRef = useRef(null);
    const requestRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);
    const modelRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 初始化场景
        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // 创建场景
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5f5f5);
        sceneRef.current = scene;

        // 创建相机
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(5, 3, 5);
        cameraRef.current = camera;

        // 创建渲染器
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;

        // Fix: Replace outputEncoding with outputColorSpace
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        container.innerHTML = '';
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // 添加灯光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1).normalize();
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
        backLight.position.set(-1, 0.5, -1).normalize();
        scene.add(backLight);

        // 添加控制器
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 3;
        controls.enableZoom = true;
        controls.enablePan = false;
        controlsRef.current = controls;

        // 添加参考网格
        const gridHelper = new THREE.GridHelper(10, 10, 0x888888, 0xcccccc);
        scene.add(gridHelper);

        // 加载模型
        if (modelUrl) {
            setLoading(true);
            const loader = new GLTFLoader();

            loader.load(
                modelUrl,
                (gltf) => {
                    // 清除之前的模型
                    if (modelRef.current) {
                        scene.remove(modelRef.current);
                    }

                    const model = gltf.scene;
                    modelRef.current = model;
                    scene.add(model);

                    // 计算模型包围盒以调整相机位置
                    const box = new THREE.Box3().setFromObject(model);
                    const size = box.getSize(new THREE.Vector3()).length();
                    const center = box.getCenter(new THREE.Vector3());

                    // 调整模型位置到中心
                    model.position.x = -center.x;
                    model.position.y = -center.y;
                    model.position.z = -center.z;

                    // 调整相机位置
                    camera.position.copy(center);
                    camera.position.x += size / 2.0;
                    camera.position.y += size / 3.0;
                    camera.position.z += size / 2.0;
                    camera.lookAt(center);

                    // 调整控制器
                    controls.target.set(0, 0, 0);

                    setLoading(false);
                },
                (xhr) => {
                    // 加载进度
                    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                },
                (error) => {
                    console.error('Error loading model:', error);
                    setError('加载模型失败');
                    setLoading(false);
                }
            );
        }

        // 动画循环
        const animate = () => {
            requestRef.current = requestAnimationFrame(animate);

            if (controlsRef.current) {
                controlsRef.current.update();
            }

            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };

        animate();

        // 处理窗口大小变化
        const handleResize = () => {
            if (containerRef.current && cameraRef.current && rendererRef.current) {
                const width = containerRef.current.clientWidth;
                const height = containerRef.current.clientHeight;

                cameraRef.current.aspect = width / height;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(width, height);
            }
        };

        window.addEventListener('resize', handleResize);

        // 清理函数
        return () => {
            window.removeEventListener('resize', handleResize);

            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }



            if (controlsRef.current) {
                controlsRef.current.dispose();
            }
        };
    }, [modelUrl]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="relative bg-white rounded-sm w-5/6 h-5/6 max-w-5xl">
                <button
                    className="absolute top-4 right-4 z-20 text-gray-700 hover:text-red-800 p-2 bg-white rounded-full shadow-md"
                    onClick={onClose}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div
                    ref={containerRef}
                    className="w-full h-full relative"
                >
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70">
                            <Spin size="large" tip="加载模型中..." />
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <div className="text-center">
                                <p className="text-red-600 mb-2">{error}</p>
                                <p className="text-gray-600">请尝试查看其他模型</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Fix for the ModelHoverPreview component
const ModelHoverPreview = ({ modelUrl }) => {
    const previewRef = useRef(null);
    const animationRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const modelRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!previewRef.current || !modelUrl) return;

        const container = previewRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // 创建场景
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        sceneRef.current = scene;

        // 创建相机
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(3, 2, 3);
        cameraRef.current = camera;

        // 创建渲染器
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;

        // Fix: Replace outputEncoding with outputColorSpace
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        // Fix: Check if container already has a child and remove it first
        // while (container.firstChild) {
        //     container.removeChild(container.firstChild);
        // }
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // 添加灯光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1).normalize();
        scene.add(directionalLight);

        // 加载模型
        const loader = new GLTFLoader();

        loader.load(
            modelUrl,
            (gltf) => {
                // 清除之前的模型
                if (modelRef.current) {
                    scene.remove(modelRef.current);
                }

                const model = gltf.scene;
                modelRef.current = model;
                scene.add(model);

                // 计算模型包围盒以调整相机位置
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3()).length();
                const center = box.getCenter(new THREE.Vector3());

                // 调整模型位置到中心
                model.position.x = -center.x;
                model.position.y = -center.y;
                model.position.z = -center.z;

                // 调整相机位置
                camera.position.copy(center);
                camera.position.x += size / 2.0;
                camera.position.y += size / 3.0;
                camera.position.z += size / 2.0;
                camera.lookAt(center);

                setIsLoaded(true);
            },
            undefined,
            (error) => {
                console.error('Error loading model preview:', error);
            }
        );

        // 动画循环
        let rotationSpeed = 0.01;

        const animate = () => {
            animationRef.current = requestAnimationFrame(animate);

            if (modelRef.current) {
                modelRef.current.rotation.y += rotationSpeed;
            }

            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };

        animate();

        // 清理函数
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }

            // Fix: Check if the renderer's domElement is still a child of the container before removing

        };
    }, [modelUrl]);

    return (
        <div
            ref={previewRef}
            className="w-full h-full absolute inset-0 z-10"
        >
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 text-white">
                    <span className="animate-pulse">加载预览...</span>
                </div>
            )}
        </div>
    );
};
const ModelsPage = () => {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [searchText, setSearchText] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' 或 'list'
    const [categoryFilter, setCategoryFilter] = useState('');
    const [tagFilter, setTagFilter] = useState([]);
    const [previewModel, setPreviewModel] = useState(null);
    const [hoverPreviewId, setHoverPreviewId] = useState(null);

    const navigate = useNavigate();

    // 加载筛选数据
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [categoriesRes, tagsRes] = await Promise.all([
                    getBuildingCategories(),
                    getBuildingTags()
                ]);

                if (categoriesRes.code === 200) {
                    setCategories(categoriesRes.data || []);
                }

                if (tagsRes.code === 200) {
                    setTags(tagsRes.data || []);
                }
            } catch (error) {
                console.error('获取筛选数据失败:', error);
            }
        };

        fetchFilters();
    }, []);

    // 获取模型数据
    useEffect(() => {
        const fetchModels = async () => {
            setLoading(true);
            try {
                // 构建查询参数
                const params = {
                    page: currentPage,
                    page_size: pageSize,
                    search: searchText,
                    category: categoryFilter,
                    tags: tagFilter
                };

                const response = await getAllModelsWithThreeD(params);

                if (response.code === 200) {
                    setModels(response.results?.data || []);
                    setTotal(response.count || 0);
                }
            } catch (error) {
                console.error('获取模型列表失败:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchModels();
    }, [currentPage, pageSize, searchText, categoryFilter, tagFilter]);

    // 处理搜索
    const handleSearch = (value) => {
        setSearchText(value);
        setCurrentPage(1);
    };

    // 处理分类筛选
    const handleCategoryChange = (value) => {
        setCategoryFilter(value);
        setCurrentPage(1);
    };

    // 处理标签筛选
    const handleTagChange = (value) => {
        setTagFilter(value);
        setCurrentPage(1);
    };

    // 处理页面变化
    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    // 点击查看模型
    const handleViewModel = (modelId) => {
        navigate(`/modelViewer/${modelId}`);
    };

    // 预览模型
    const handlePreviewModel = (e, model) => {
        e.stopPropagation();
        setPreviewModel(model);
    };

    // 关闭预览
    const handleClosePreview = () => {
        setPreviewModel(null);
    };

    // 处理鼠标悬停预览
    const handleMouseEnter = (modelId) => {
        setHoverPreviewId(modelId);
    };

    const handleMouseLeave = () => {
        setHoverPreviewId(null);
    };

    // 渲染网格视图的模型卡片
    const renderGridItem = (model) => (
        <div
            key={model.id}
            className="group relative bg-white rounded-none overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl border border-gray-200 hover:border-red-800"
            onClick={() => handleViewModel(model.id)}
            onMouseEnter={() => handleMouseEnter(model.id)}
            onMouseLeave={handleMouseLeave}
        >
            <div className="h-60 overflow-hidden relative">
                <img
                    src={model.image_url || "/src/assets/images/default-model.jpg"}
                    alt={model.name}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${hoverPreviewId === model.id ? 'opacity-0' : 'opacity-100'}`}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/src/assets/images/default-model.jpg";
                    }}
                />
                {hoverPreviewId === model.id && model.model_url && (
                    <ModelHoverPreview modelUrl={model.model_url} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>
            </div>

            <div className="p-4">
                <div className="mb-2 flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-800 transition-colors duration-300">{model.name}</h3>
                    <Tag color="blue">{model.category}</Tag>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{model.description || "探索这座传统建筑的精妙结构与历史风貌。"}</p>

                {model.address && (
                    <div className="flex items-center text-gray-500 text-xs mb-2">
                        <EnvironmentOutlined className="mr-1" />
                        <span className="truncate">{model.address}</span>
                    </div>
                )}

                <div className="flex flex-wrap gap-1 mt-2">
                    {model.tags_list?.slice(0, 3).map(tag => (
                        <Tag key={tag} className="text-xs" color="green">{tag}</Tag>
                    ))}
                    {model.tags_list?.length > 3 && <Tag className="text-xs">+{model.tags_list.length - 3}</Tag>}
                </div>

                <div className="absolute right-3 bottom-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">

                    <Tooltip title="查看详情">
                        <button
                            className="bg-red-800 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleViewModel(model.id);
                            }}
                        >
                            <EyeOutlined />
                        </button>
                    </Tooltip>
                </div>
            </div>
        </div>
    );

    // 渲染列表视图的模型项
    const renderListItem = (model) => (
        <div
            key={model.id}
            className="group flex bg-white border border-gray-200 hover:border-red-800 rounded-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
            onClick={() => handleViewModel(model.id)}
            onMouseEnter={() => handleMouseEnter(model.id)}
            onMouseLeave={handleMouseLeave}
        >
            <div className="w-40 h-40 flex-shrink-0 overflow-hidden relative">
                <img
                    src={model.image_url || "/src/assets/images/default-model.jpg"}
                    alt={model.name}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${hoverPreviewId === model.id ? 'opacity-0' : 'opacity-100'}`}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/src/assets/images/default-model.jpg";
                    }}
                />
                {hoverPreviewId === model.id && model.model_url && (
                    <ModelHoverPreview modelUrl={model.model_url} />
                )}
            </div>

            <div className="flex-grow p-4 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-800 transition-colors duration-300">{model.name}</h3>
                    <Tag color="blue">{model.category}</Tag>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">{model.description || "探索这座传统建筑的精妙结构与历史风貌。"}</p>

                <div className="flex items-center text-gray-500 text-xs mb-2">
                    {model.address && (
                        <div className="flex items-center mr-4">
                            <EnvironmentOutlined className="mr-1" />
                            <span className="truncate max-w-xs">{model.address}</span>
                        </div>
                    )}
                    <div className="flex items-center">
                        <HistoryOutlined className="mr-1" />
                        <span>{new Date(model.created_at).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                    {model.tags_list?.map(tag => (
                        <Tag key={tag} className="text-xs" color="green">{tag}</Tag>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-center">
                <Tooltip title="预览模型">
                    <button
                        className="w-12 h-12 bg-yellow-600 text-white hover:bg-yellow-500 transition-colors flex items-center justify-center"
                        onClick={(e) => handlePreviewModel(e, model)}
                    >
                        <FullscreenOutlined />
                    </button>
                </Tooltip>
                <div className="w-12 h-12 bg-gray-100 group-hover:bg-red-800 transition-colors duration-300 flex items-center justify-center">
                    <EyeOutlined className="text-gray-600 group-hover:text-white transition-colors duration-300" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                {/* 顶部标题 */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold text-red-800 mb-4 font-serif">古建筑模型库</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        探索中国传统建筑的数字化模型，从不同角度欣赏古建筑的精湛工艺与艺术之美。
                    </p>
                </div>

                {/* 过滤器和搜索栏 */}
                <div className="bg-white p-6 rounded-none shadow-md mb-8 border-l-4 border-red-800">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap gap-4 items-center">
                            <Select
                                placeholder="选择分类"
                                allowClear
                                style={{ width: 150 }}
                                value={categoryFilter}
                                onChange={handleCategoryChange}
                                className="rounded-none"
                            >
                                {categories.map(category => (
                                    <Option key={category} value={category}>{category}</Option>
                                ))}
                            </Select>

                            <Select
                                placeholder="选择标签"
                                mode="multiple"
                                allowClear
                                style={{ width: 250 }}
                                value={tagFilter}
                                onChange={handleTagChange}
                                className="rounded-none"
                                maxTagCount={2}
                            >
                                {tags.map(tag => (
                                    <Option key={tag} value={tag}>{tag}</Option>
                                ))}
                            </Select>

                            <Search
                                placeholder="搜索建筑名称"
                                onSearch={handleSearch}
                                style={{ width: 250 }}
                                className="rounded-none"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-gray-500">视图:</span>
                            <div className="flex border border-gray-300 rounded-none">
                                <button
                                    className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-red-800 text-white' : 'bg-white text-gray-600'}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <AppstoreOutlined />
                                </button>
                                <button
                                    className={`px-3 py-2 ${viewMode === 'list' ? 'bg-red-800 text-white' : 'bg-white text-gray-600'}`}
                                    onClick={() => setViewMode('list')}
                                >
                                    <BarsOutlined />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 模型列表 */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spin size="large" />
                    </div>
                ) : models.length > 0 ? (
                    <div className="mb-8">
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {models.map(model => renderGridItem(model))}
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-4">
                                {models.map(model => renderListItem(model))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-none shadow-md flex flex-col items-center justify-center">
                        <Empty description="暂无模型数据" />
                        <p className="mt-4 text-gray-500">请尝试调整筛选条件或搜索关键词</p>
                    </div>
                )}

                {/* 分页 */}
                {total > 0 && (
                    <div className="flex justify-center mt-8">
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={total}
                            onChange={handlePageChange}
                            showSizeChanger
                            showTotal={(total) => `共 ${total} 个模型`}
                        />
                    </div>
                )}

                {/* 底部说明 */}
                <div className="mt-16 bg-gray-100 p-6 rounded-none border-t-2 border-red-800">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">关于模型库</h3>
                    <p className="text-gray-600 mb-4">
                        本模型库收录了众多中国传统建筑的三维数字模型，让您足不出户便可欣赏古代建筑的风采。每个模型均由专业团队精心制作，
                        力求还原建筑的原貌与细节。通过这些模型，我们希望能够帮助用户更好地了解和欣赏中国古建筑的魅力。
                    </p>
                    <p className="text-gray-600">
                        如果您对模型有任何建议或者希望贡献自己的模型作品，欢迎与我们联系。
                    </p>
                </div>
            </div>

            {/* 全屏预览模态框 */}
            {previewModel && (
                <ModelPreview
                    modelUrl={previewModel.model_url}
                    onClose={handleClosePreview}
                />
            )}
        </div>
    );
};

export default ModelsPage;