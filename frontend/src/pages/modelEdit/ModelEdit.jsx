import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'antd';
import SimpleSceneManager from './SimpleSceneManager';
import SimpleModelManager from './SimpleModelManager';
import EditorToolbar from './EditorToolbar';

const ModelEditor = () => {
    const containerRef = useRef(null);
    const sceneManagerRef = useRef(null);
    const modelManagerRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;

        sceneManagerRef.current = new SimpleSceneManager(containerRef.current);
        modelManagerRef.current = new SimpleModelManager(sceneManagerRef.current);

        // 加载模型
        modelManagerRef.current.loadModel('/models/qiniandian.glb');

        return () => {
            sceneManagerRef.current?.dispose();
            modelManagerRef.current?.dispose();
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
        // TODO: 实现编辑模式的具体逻辑
    };

    const handleUndo = () => {
        // TODO: 实现撤销功能
        console.log('Undo clicked');
    };

    const handleRedo = () => {
        // TODO: 实现重做功能
        console.log('Redo clicked');
    };

    const handleSave = () => {
        // TODO: 实现保存功能
        console.log('Save clicked');
    };

    const handleUpload = () => {
        // TODO: 实现上传新模型功能
        console.log('Upload clicked');
    };

    const handleDelete = () => {
        // TODO: 实现删除功能
        console.log('Delete clicked');
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            {/* 工具栏 */}
            <EditorToolbar
                isEditing={isEditing}
                onResetView={handleResetView}
                onRotateLeft={handleRotateLeft}
                onRotateRight={handleRotateRight}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onToggleEdit={handleToggleEdit}
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