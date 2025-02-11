// ModelEditor.jsx
import React, { useEffect, useRef, useState } from 'react';
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
import SimpleSceneManager from './SimpleSceneManager';
import SimpleModelManager from './SimpleModelManager';
import EditorToolbar from './EditorToolbar';
import ModelMarkerManager from './ModelMarkerManager';

const ModelEditor = () => {
    const containerRef = useRef(null);
    const sceneManagerRef = useRef(null);
    const modelManagerRef = useRef(null);
    const markerManagerRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isMarking, setIsMarking] = useState(false);
    const [markerTree, setMarkerTree] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [currentMarker, setCurrentMarker] = useState(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        if (!containerRef.current) return;

        sceneManagerRef.current = new SimpleSceneManager(containerRef.current);
        modelManagerRef.current = new SimpleModelManager(sceneManagerRef.current);

        modelManagerRef.current.loadModel('/models/qiniandian.glb')
            .then(() => {
                markerManagerRef.current = new ModelMarkerManager(
                    sceneManagerRef.current,
                    modelManagerRef.current.model
                );
                markerManagerRef.current.setOnMarkersChanged((markers) => {
                    updateMarkerTree(markers);
                });
            })
            .catch(error => {
                console.error('Failed to load model:', error);
            });

        return () => {
            markerManagerRef.current?.dispose();
            modelManagerRef.current?.dispose();
            sceneManagerRef.current?.dispose();
        };
    }, []);

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

    // ... 保持原有的工具栏处理函数 ...
    // 添加工具栏相关的处理函数
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

    const handleSave = () => {
        if (markerManagerRef.current) {
            handleExport();
        }
    };

    const handleUpload = () => {
        // 实现文件上传功能
        console.log('Upload clicked');
    };

    const handleDelete = () => {
        if (isMarking) {
            markerManagerRef.current?.deleteSelectedMarker();
        }
    };
    return (


    <div className="fixed inset-0 flex">
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
                onUpload={handleUpload}
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
        `}</style>
    </div>
)
    ;
};

export default ModelEditor;