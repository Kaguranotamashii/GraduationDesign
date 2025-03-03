// ModelViewerV2.jsx
import React, {useEffect, useRef, useState} from 'react';
import {useParams} from 'react-router-dom';
import {Button} from "@/components/ui/button";
import {ChevronRight, ChevronLeft, Edit2, Trash2, Download} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {ScrollArea} from "@/components/ui/scroll-area";
import {message, Progress} from 'antd';
import SimpleSceneManager from './SimpleSceneManager';
import SimpleModelManager from './SimpleModelManager';
import EditorToolbar from './EditorToolbar';
import ModelMarkerManager from './ModelMarkerManager';
import {getBuilderModelUrl, updateBuilderJson} from '@/api/builderApi';

const ModelViewerV2 = () => {
    const {builderId} = useParams();
    const containerRef = useRef(null);
    const sceneManagerRef = useRef(null);
    const modelManagerRef = useRef(null);
    const markerManagerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isMarking, setIsMarking] = useState(false);
    const [markerTree, setMarkerTree] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [currentMarker, setCurrentMarker] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [viewMode, setViewMode] = useState('normal');
    const [groundType, setGroundType] = useState('grid');
    // 添加新的状态
    const [weather, setWeather] = useState('clear');
    const [timeOfDay, setTimeOfDay] = useState(12);
    const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(false);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Escape' && viewMode !== 'normal') {
                handleToggleViewMode('normal');
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            if (sceneManagerRef.current) {
                sceneManagerRef.current.setRenderMode('normal');
            }
        };
    }, [viewMode]);

    useEffect(() => {
        if (!containerRef.current || !builderId) return;

        const initScene = async () => {
            try {
                setLoading(true);
                setLoadingProgress(0);
                const response = await getBuilderModelUrl(builderId);
                console.log(response);

                if (response.code === 200 && response.data.model_url) {
                    sceneManagerRef.current = new SimpleSceneManager(containerRef.current);
                    modelManagerRef.current = new SimpleModelManager(sceneManagerRef.current);

                    await modelManagerRef.current.loadModel(response.data.model_url,
                        (progress) => {
                            const percent = Math.round((progress.loaded / progress.total) * 100);
                            setLoadingProgress(percent);
                        }
                    );

                    markerManagerRef.current = new ModelMarkerManager(
                        sceneManagerRef.current,
                        modelManagerRef.current.model
                    );
                    markerManagerRef.current.setOnMarkersChanged((markers) => {
                        updateMarkerTree(markers);
                    });

                    if (response.data.json) {
                        try {
                            const markersData = JSON.parse(response.data.json);
                            markerManagerRef.current.loadMarkers(markersData);
                        } catch (e) {
                            console.error('Failed to load markers data:', e);
                        }
                    }
                } else {
                    throw new Error('未找到模型文件');
                }
            } catch (err) {
                setError(err.message || '加载模型失败');
                console.error('Failed to initialize scene:', err);
            } finally {
                setLoading(false);
            }
        };

        initScene();

        return () => {
            markerManagerRef.current?.dispose();
            modelManagerRef.current?.dispose();
            sceneManagerRef.current?.dispose();
        };
    }, [builderId]);

    const handleResetView = () => {
        if (sceneManagerRef.current?.controls) {
            sceneManagerRef.current.controls.reset();
            if (modelManagerRef.current?.model) {
                modelManagerRef.current.model.rotation.set(0, 0, 0);
            }
        }
    };

    const handleRotateLeft = () => {
        if (modelManagerRef.current?.model) {
            modelManagerRef.current.model.rotation.y += Math.PI / 36;
        }
    };

    const handleRotateRight = () => {
        if (modelManagerRef.current?.model) {
            modelManagerRef.current.model.rotation.y -= Math.PI / 36;
        }
    };

    const handleZoomIn = () => {
        if (sceneManagerRef.current?.camera) {
            const camera = sceneManagerRef.current.camera;
            const zoomFactor = 0.9;
            camera.position.multiplyScalar(zoomFactor);
            sceneManagerRef.current.controls?.update();
        }
    };

    const handleZoomOut = () => {
        if (sceneManagerRef.current?.camera) {
            const camera = sceneManagerRef.current.camera;
            const zoomFactor = 1.1;
            camera.position.multiplyScalar(zoomFactor);
            sceneManagerRef.current.controls?.update();
        }
    };

    // 添加天气控制处理函数
    const handleWeatherChange = (newWeather) => {
        setWeather(newWeather);
        if (sceneManagerRef.current) {
            sceneManagerRef.current.setWeather(newWeather);
        }
    };

    // 添加时间控制处理函数
    const handleTimeChange = (newTime) => {
        setTimeOfDay(newTime);
        if (sceneManagerRef.current) {
            sceneManagerRef.current.setTimeOfDay(newTime);
        }
    };

    // 添加实时模式切换处理函数
    const handleToggleRealtime = () => {
        setIsRealtimeEnabled(!isRealtimeEnabled);
        if (sceneManagerRef.current) {
            sceneManagerRef.current.toggleRealtime();
        }
    };

    const handleToggleViewMode = (mode) => {
        console.log('Toggling view mode to:', mode);

        setViewMode(mode);

        if (sceneManagerRef.current) {
            setTimeout(() => {
                sceneManagerRef.current.setRenderMode(mode);
            }, 0);

            if (mode === 'anaglyph') {
                message.info('请戴上红蓝3D眼镜以获得最佳观看效果');
            }
        }
    };

    const handleExport = () => {
        if (markerManagerRef.current) {
            const markersData = markerManagerRef.current.getMarkersData();
            const blob = new Blob([JSON.stringify(markersData, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'building-markers.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const handleEditMarker = (markerId, nodeData) => {
        setCurrentMarker({id: markerId, data: nodeData});
        setEditValue(nodeData.fullPath);
        setEditDialogOpen(true);
    };

    const handleDeleteMarker = (markerId) => {
        setCurrentMarker({id: markerId});
        setDeleteDialogOpen(true);
    };

    const handleToggleEdit = () => {
        setIsEditing(!isEditing);
        if (!isEditing && isMarking) {
            handleToggleMarking();
        }
    };

    const handleToggleMarking = () => {
        setIsMarking(!isMarking);
        if (!isMarking) {
            if (isEditing) {
                setIsEditing(false);
            }
            markerManagerRef.current?.startMarking();
        } else {
            markerManagerRef.current?.stopMarking();
        }
    };

    const confirmEdit = () => {
        if (editValue && editValue.trim() && currentMarker) {
            markerManagerRef.current?.updateMarkerDescription(currentMarker.id, editValue);
        }
        setEditDialogOpen(false);
        setCurrentMarker(null);
        setEditValue('');
    };

    const confirmDelete = () => {
        if (currentMarker) {
            markerManagerRef.current?.deleteMarker(currentMarker.id);
        }
        setDeleteDialogOpen(false);
        setCurrentMarker(null);
    };

    const updateMarkerTree = (markers) => {
        const treeData = [];
        markers.forEach((marker) => {
            const parts = marker.description.split('/');
            let current = treeData;
            let currentPath = '';

            parts.forEach((part, index) => {
                currentPath = currentPath ? `${currentPath}/${part}` : part;
                const existing = current.find(node => node.title === part);

                if (existing) {
                    current = existing.children;
                } else {
                    const newNode = {
                        key: `${marker.id}-${index}`,
                        title: part,
                        children: [],
                        fullPath: currentPath
                    };

                    if (index === parts.length - 1) {
                        newNode.markerId = marker.id;
                        newNode.isLeaf = true;
                    }

                    current.push(newNode);
                    current = newNode.children;
                }
            });
        });
        setMarkerTree(treeData);
    };

    // 添加地面类型切换处理函数
    const handleGroundTypeChange = (type) => {
        setGroundType(type);
        if (sceneManagerRef.current) {
            sceneManagerRef.current.setGroundType(type);
            // 确保模型对齐到新的地面
            if (modelManagerRef.current) {
                modelManagerRef.current.alignToGround();
            }
        }
    };

    const renderTreeNodes = (nodes) => (
        <div className="space-y-2">
            {nodes.map(node => (
                <div key={node.key} className="tree-node">
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100">
                        <span
                            className="flex-1 cursor-pointer"
                            onClick={() => node.markerId && markerManagerRef.current?.highlightMarker(node.markerId)}
                        >
                            {node.title}
                        </span>
                        {node.isLeaf && (
                            <div className="tree-node-actions flex gap-1">
                                {/*<Button*/}
                                {/*    variant="ghost"*/}
                                {/*    size="icon"*/}
                                {/*    onClick={() => handleEditMarker(node.markerId, node)}*/}
                                {/*>*/}
                                {/*    <Edit2 className="h-4 w-4"/>*/}
                                {/*</Button>*/}
                                {/*<Button*/}
                                {/*    variant="ghost"*/}
                                {/*    size="icon"*/}
                                {/*    onClick={() => handleDeleteMarker(node.markerId)}*/}
                                {/*>*/}
                                {/*    <Trash2 className="h-4 w-4"/>*/}
                                {/*</Button>*/}
                            </div>
                        )}
                    </div>
                    {node.children && node.children.length > 0 && (
                        <div className="ml-4">
                            {renderTreeNodes(node.children)}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 flex">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
                    <div className="text-center w-64">
                        <div className="mb-4">
                            <Progress
                                type="circle"
                                percent={loadingProgress}
                                status={loadingProgress < 100 ? "active" : "success"}
                            />
                        </div>
                        <div className="text-gray-600">
                            {loadingProgress < 100 ? '模型加载中...' : '初始化场景...'}
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
                    <div className="text-center text-red-500">
                        <div className="mb-2">错误</div>
                        <div>{error}</div>
                    </div>
                </div>
            )}

            <Button
                variant="outline"
                size="icon"
                className={`
                    fixed z-50 transition-transform duration-300 
                    left-72 top-1/2 -translate-y-1/2
                    ${!sidebarOpen && 'translate-x-[-280px]'}
                    bg-white hover:bg-gray-100
                    shadow-md hover:shadow-lg
                    border border-gray-200
                `}
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? <ChevronLeft className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
            </Button>

            <div
                className={`
                    fixed left-0 top-0 h-full bg-white
                    transition-transform duration-300 ease-in-out
                    w-72
                    ${!sidebarOpen && '-translate-x-full'}
                    border-r border-gray-200
                    z-40
                `}
            >
                <ScrollArea className="h-full w-full px-4">
                    <div className="py-4">
                        <div className="flex gap-2 mb-4">

                        </div>
                        {renderTreeNodes(markerTree)}
                    </div>
                </ScrollArea>
            </div>

            {/* 主内容区 */}
            <div className="flex-1 h-full">
                <EditorToolbar
                    onResetView={handleResetView}
                    onRotateLeft={handleRotateLeft}
                    onRotateRight={handleRotateRight}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onToggleViewMode={handleToggleViewMode}
                    viewMode={viewMode}
                    weather={weather}
                    onWeatherChange={handleWeatherChange}
                    timeOfDay={timeOfDay}
                    onTimeChange={handleTimeChange}
                    isRealtimeEnabled={isRealtimeEnabled}
                    onToggleRealtime={handleToggleRealtime}
                    groundType={groundType}
                    onGroundTypeChange={handleGroundTypeChange}
                />

                <div
                    ref={containerRef}
                    className="w-full h-full bg-[#E6F3FF]"
                    style={{touchAction: 'none'}}
                />

                {/* 视图模式提示 - 当不是普通模式时显示 */}
                {viewMode !== 'normal' && (
                    <div className="fixed bottom-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                        {viewMode === 'ar' ? 'AR模式 (开发中)' : '3D眼镜模式'}
                    </div>
                )}
            </div>

            {/* 编辑对话框 */}
            <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>编辑标记</AlertDialogTitle>
                        <AlertDialogDescription>
                            请输入部位层级，使用 / 分隔（例如：一层/楼梯）
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">部位层级</Label>
                            <Input
                                id="name"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                placeholder="例如：一层/楼梯"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        confirmEdit();
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmEdit}>确认</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* 删除确认对话框 */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                            确定要删除这个标记吗？此操作无法撤销。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>删除</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <style jsx>{`
                .tree-node-actions {
                    transition: opacity 0.2s;
                    opacity: 0;
                }

                .tree-node:hover .tree-node-actions {
                    opacity: 1;
                }

                .loading-spinner {
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #3498db;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                }

                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
};

export default ModelViewerV2;