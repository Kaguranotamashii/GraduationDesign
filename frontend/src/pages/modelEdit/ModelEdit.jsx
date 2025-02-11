import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'antd';
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
        // 当进入编辑模式时，退出标记模式
        if (!isEditing && isMarking) {
            handleToggleMarking();
        }
    };

    // 标记模式切换
    const handleToggleMarking = () => {
        setIsMarking(!isMarking);
        if (!isMarking) {
            // 进入标记模式时退出编辑模式
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
        } else if (isEditing) {
            // TODO: 实现编辑模式的撤销功能
            console.log('Undo clicked in edit mode');
        }
    };

    const handleRedo = () => {
        if (isMarking) {
            markerManagerRef.current?.redoMarker();
        } else if (isEditing) {
            // TODO: 实现编辑模式的重做功能
            console.log('Redo clicked in edit mode');
        }
    };

    const handleSave = () => {
        // 保存所有标记和编辑内容
        const markersData = markerManagerRef.current?.getMarkersData();
        // TODO: 实现保存功能
        console.log('Saving markers:', markersData);
    };

    const handleUpload = () => {
        // TODO: 实现上传新模型功能
        console.log('Upload clicked');
    };

    const handleDelete = () => {
        if (isMarking) {
            markerManagerRef.current?.deleteSelectedMarker();
        } else {
            // TODO: 实现删除功能
            console.log('Delete clicked');
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
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

            {/* 返回按钮 */}
            <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 1 }}>
                <Button type="primary" onClick={() => window.location.href = '/'}>
                    返回主页
                </Button>
            </div>

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
    );
};

export default ModelEditor;