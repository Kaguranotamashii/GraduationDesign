import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Edit2, Trash2, Download } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {message, Progress} from 'antd';
import SimpleSceneManager from './SimpleSceneManager';
import SimpleModelManager from './SimpleModelManager';
import EditorToolbar from './EditorToolbar';
import ModelMarkerManager from './ModelMarkerManager';
import { getBuilderModelUrl, updateBuilderJson } from '@/api/builderApi';

const ModelEditor = () => {
    const { builderId } = useParams();
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
    const [loadingProgress, setLoadingProgress] = useState(0);  // 添加进度状态

    useEffect(() => {
        if (!containerRef.current || !builderId) return;

        const initScene = async () => {
            try {
                setLoading(true);
                setLoadingProgress(0);  // 重置进度
                // 获取模型URL和标注数据
                const response = await getBuilderModelUrl(builderId);
                console.log( response)

                if (response.code === 200 && response.data.model_url) {
                    // 初始化场景
                    sceneManagerRef.current = new SimpleSceneManager(containerRef.current);
                    modelManagerRef.current = new SimpleModelManager(sceneManagerRef.current);

                    // 加载模型，添加进度回调
                    await modelManagerRef.current.loadModel(response.data.model_url,
                        (progress) => {
                            // 将进度转换为百分比
                            const percent = Math.round((progress.loaded / progress.total) * 100);
                            setLoadingProgress(percent);
                        }
                    );



                    // 初始化标注管理器
                    markerManagerRef.current = new ModelMarkerManager(
                        sceneManagerRef.current,
                        modelManagerRef.current.model
                    );
                    markerManagerRef.current.setOnMarkersChanged((markers) => {
                        updateMarkerTree(markers);
                    });

                    // 加载已有的标注数据
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
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditMarker(node.markerId, node);
                                    }}
                                >
                                    <Edit2 className="h-4 w-4"/>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteMarker(node.markerId);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 text-red-500"/>
                                </Button>
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

    const handleResetView = () => {
        sceneManagerRef.current?.controls?.reset();
    };

    const handleRotateLeft = () => {
        if (modelManagerRef.current?.model) {
            modelManagerRef.current.model.rotation.y += Math.PI / 2;
        }
    };

    const handleRotateRight = () => {
        if (modelManagerRef.current?.model) {
            modelManagerRef.current.model.rotation.y -= Math.PI / 2;
        }
    };

    const handleZoomIn = () => {
        if (sceneManagerRef.current?.controls) {
            sceneManagerRef.current.controls.zoomIn();
        }
    };

    const handleZoomOut = () => {
        if (sceneManagerRef.current?.controls) {
            sceneManagerRef.current.controls.zoomOut();
        }
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

    const handleUndo = () => {
        if (isMarking) {
            markerManagerRef.current?.undoLastMarker();
        }
    };

    const handleRedo = () => {
        if (isMarking) {
            markerManagerRef.current?.redoMarker();
        }
    };

    const handleSave = async () => {
        if (markerManagerRef.current) {
            try {
                const markersData = markerManagerRef.current.getMarkersData();
                // 修改为使用 updateBuilderJson 接口
                const response = await updateBuilderJson(builderId, {
                    json: JSON.stringify(markersData)
                });

                if (response.code === 200) {
                    message.success('标注数据保存成功');
                } else {
                    throw new Error(response.message || '保存失败');
                }
            } catch (error) {
                message.error('保存失败：' + (error.message || '未知错误'));
                console.error('Save markers error:', error);
            }
        }
    };

    const handleDelete = () => {
        if (isMarking) {
            markerManagerRef.current?.deleteSelectedMarker();
        }
    };

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

            {/* 悬浮按钮 */}
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

            {/* 左侧面板 */}
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
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            className="w-full mb-4"
                        >
                            <Download className="h-4 w-4 mr-2"/>
                            导出标注数据
                        </Button>
                        {renderTreeNodes(markerTree)}
                    </div>
                </ScrollArea>
            </div>

            {/* 主内容区 */}
            <div className="flex-1 h-full">
                <EditorToolbar
                    isEditing={isEditing}
                    isMarking={isMarking}
                    onResetView={handleResetView}
                    onRotateLeft={handleRotateLeft}
                    onRotateRight={handleRotateRight}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onToggleEdit={handleToggleEdit}
                    onToggleMarking={handleToggleMarking}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onSave={handleSave}
                    onDelete={handleDelete}
                />

                <div
                    ref={containerRef}
                    className="w-full h-full bg-[#E6F3FF]"
                    style={{touchAction: 'none'}}
                />
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
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ModelEditor;
