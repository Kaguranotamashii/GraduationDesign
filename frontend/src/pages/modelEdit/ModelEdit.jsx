// ModelEditor.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Layout, Tree, Button } from 'antd';
import SimpleSceneManager from './SimpleSceneManager';
import SimpleModelManager from './SimpleModelManager';
import EditorToolbar from './EditorToolbar';
import ModelMarkerManager from './ModelMarkerManager';

const { Sider, Content } = Layout;

const ModelEditor = () => {
    const containerRef = useRef(null);
    const sceneManagerRef = useRef(null);
    const modelManagerRef = useRef(null);
    const markerManagerRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isMarking, setIsMarking] = useState(false);
    const [markerTree, setMarkerTree] = useState([]); // 存储标记树形数据

    useEffect(() => {
        if (!containerRef.current) return;

        sceneManagerRef.current = new SimpleSceneManager(containerRef.current);
        modelManagerRef.current = new SimpleModelManager(sceneManagerRef.current);

        // 加载模型
        modelManagerRef.current.loadModel('/models/qiniandian.glb')
            .then(() => {
                // 模型加载完成后初始化标记管理器
                markerManagerRef.current = new ModelMarkerManager(
                    sceneManagerRef.current,
                    modelManagerRef.current.model
                );
                // 设置标记变化的回调
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

    // 导出功能
    const handleExport = () => {
        if (markerManagerRef.current) {
            const markersData = markerManagerRef.current.getMarkersData();
            const blob = new Blob([JSON.stringify(markersData, null, 2)], { type: 'application/json' });
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

    // 更新左侧树形结构
    const updateMarkerTree = (markers) => {
        const treeData = [];
        markers.forEach((marker) => {
            const parts = marker.description.split('/');
            let current = treeData;
            parts.forEach((part, index) => {
                const existing = current.find(node => node.title === part);
                if (existing) {
                    current = existing.children;
                } else {
                    const newNode = {
                        key: `${marker.id}-${index}`,
                        title: part,
                        children: [],
                    };
                    if (index === parts.length - 1) {
                        newNode.markerId = marker.id;
                    }
                    current.push(newNode);
                    current = newNode.children;
                }
            });
        });
        setMarkerTree(treeData);
    };

    // 工具栏功能处理函数
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
        <Layout style={{ height: '100vh' }}>
            <Sider width={300} style={{ background: '#fff', padding: '16px' }}>
                <div style={{ marginBottom: '16px' }}>
                    <Button type="primary" onClick={handleExport} style={{ width: '100%' }}>
                        导出标注数据
                    </Button>
                </div>
                <Tree
                    treeData={markerTree}
                    defaultExpandAll
                    onSelect={(_, { node }) => {
                        if (node.markerId) {
                            markerManagerRef.current?.highlightMarker(node.markerId);
                        }
                    }}
                />
            </Sider>
            <Content>
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    {/* 工具栏 */}
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

                    {/* 3D 场景容器 */}
                    <div
                        ref={containerRef}
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#E6F3FF',
                            touchAction: 'none'
                        }}
                    />
                </div>
            </Content>
        </Layout>
    );
};

export default ModelEditor;