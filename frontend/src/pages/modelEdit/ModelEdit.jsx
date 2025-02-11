// ModelEditor.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Layout, Tree, Button, Modal, Input } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
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
    const [collapsed, setCollapsed] = useState(false); // 添加收缩状态

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

    // 编辑标记
    const handleEditMarker = (markerId, nodeData) => {
        let inputValue = '';
        Modal.confirm({
            title: '编辑标记',
            content: (
                <div>
                    <p>请输入部位层级，使用 / 分隔（例如：一层/楼梯）</p>
                    <Input.TextArea
                        defaultValue={nodeData.fullPath}
                        onChange={(e) => {
                            inputValue = e.target.value;
                        }}
                        placeholder="例如：一层/楼梯"
                        rows={4}
                    />
                </div>
            ),
            onOk: () => {
                if (inputValue && inputValue.trim()) {
                    markerManagerRef.current?.updateMarkerDescription(markerId, inputValue);
                }
            }
        });
    };

    // 删除标记
    const handleDeleteMarker = (markerId) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这个标记吗？',
            onOk: () => {
                markerManagerRef.current?.deleteMarker(markerId);
            }
        });
    };

    // 更新左侧树形结构
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

    // 渲染树节点
    const renderTreeNodes = (nodes) => {
        return nodes.map(node => {
            if (node.isLeaf) {
                // 如果是标记节点，添加编辑和删除按钮
                const title = (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%'
                    }}>
                        <span>{node.title}</span>
                        <span
                            style={{
                                marginLeft: 'auto',
                                visibility: 'hidden'
                            }}
                            className="tree-node-actions"
                        >
                            <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditMarker(node.markerId, node);
                                }}
                            />
                            <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMarker(node.markerId);
                                }}
                            />
                        </span>
                    </div>
                );
                return { ...node, title };
            }
            if (node.children) {
                return { ...node, children: renderTreeNodes(node.children) };
            }
            return node;
        });
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
            <Sider
                width={300}
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                style={{
                    background: '#fff',
                    overflow: 'auto'
                }}
            >
                <div style={{
                    padding: collapsed ? '8px' : '16px',
                    transition: 'all 0.2s'
                }}>
                    {!collapsed && (
                        <div style={{ marginBottom: '16px' }}>
                            <Button type="primary" onClick={handleExport} style={{ width: '100%' }}>
                                导出标注数据
                            </Button>
                        </div>
                    )}
                    <Tree
                        treeData={renderTreeNodes(markerTree)}
                        defaultExpandAll
                        onSelect={(_, { node }) => {
                            if (node.markerId) {
                                markerManagerRef.current?.highlightMarker(node.markerId);
                            }
                        }}
                    />
                </div>
                <style jsx>{`
                    .tree-node-actions {
                        transition: visibility 0.2s;
                    }
                    .ant-tree-node-content-wrapper:hover .tree-node-actions {
                        visibility: visible !important;
                    }
                `}</style>
            </Sider>
            <Content>
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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