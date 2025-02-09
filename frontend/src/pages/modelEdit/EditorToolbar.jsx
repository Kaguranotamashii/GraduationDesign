import React from 'react';
import { Button, Tooltip, Space, Divider } from 'antd';
import {
    HomeOutlined,
    EditOutlined,
    RotateLeftOutlined,
    RotateRightOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
    UndoOutlined,
    RedoOutlined,
    SaveOutlined,
    UploadOutlined,
    DeleteOutlined
} from '@ant-design/icons';

const EditorToolbar = ({
                           isEditing,
                           onResetView,
                           onRotateLeft,
                           onRotateRight,
                           onZoomIn,
                           onZoomOut,
                           onToggleEdit,
                           onUndo,
                           onRedo,
                           onSave,
                           onUpload,
                           onDelete
                       }) => {
    return (
        <div style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1,
            background: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
            <Space split={<Divider type="vertical" />}>
                {/* 基础操作 */}
                <Space>
                    <Tooltip title="重置视图">
                        <Button icon={<HomeOutlined />} onClick={onResetView} />
                    </Tooltip>
                    <Tooltip title="向左旋转">
                        <Button icon={<RotateLeftOutlined />} onClick={onRotateLeft} />
                    </Tooltip>
                    <Tooltip title="向右旋转">
                        <Button icon={<RotateRightOutlined />} onClick={onRotateRight} />
                    </Tooltip>
                    <Tooltip title="放大">
                        <Button icon={<ZoomInOutlined />} onClick={onZoomIn} />
                    </Tooltip>
                    <Tooltip title="缩小">
                        <Button icon={<ZoomOutOutlined />} onClick={onZoomOut} />
                    </Tooltip>
                </Space>

                {/* 编辑操作 */}
                <Space>
                    <Tooltip title="编辑模型">
                        <Button
                            icon={<EditOutlined />}
                            type={isEditing ? 'primary' : 'default'}
                            onClick={onToggleEdit}
                        />
                    </Tooltip>
                    <Tooltip title="撤销">
                        <Button
                            icon={<UndoOutlined />}
                            disabled={!isEditing}
                            onClick={onUndo}
                        />
                    </Tooltip>
                    <Tooltip title="重做">
                        <Button
                            icon={<RedoOutlined />}
                            disabled={!isEditing}
                            onClick={onRedo}
                        />
                    </Tooltip>
                </Space>

                {/* 文件操作 */}
                <Space>
                    <Tooltip title="保存">
                        <Button icon={<SaveOutlined />} onClick={onSave} />
                    </Tooltip>
                    <Tooltip title="上传新模型">
                        <Button icon={<UploadOutlined />} onClick={onUpload} />
                    </Tooltip>
                    <Tooltip title="删除">
                        <Button icon={<DeleteOutlined />} danger onClick={onDelete} />
                    </Tooltip>
                </Space>
            </Space>
        </div>
    );
};

export default EditorToolbar;