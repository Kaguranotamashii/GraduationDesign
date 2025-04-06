import React from 'react';
import { Button, Tooltip, Space, Divider, Dropdown, Select, TimePicker } from 'antd';
import {
    HomeOutlined,
    RotateLeftOutlined,
    RotateRightOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
    GlobalOutlined,
    MobileOutlined,
    ExperimentOutlined,
    ClockCircleOutlined,
    CloudOutlined,
    SyncOutlined,
    BorderOutlined,
    DownOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './EditorToolbar.css'; // 更新 CSS 文件

const viewModeIcons = {
    normal: <GlobalOutlined />,
    ar1: <MobileOutlined />,
    ar2: <MobileOutlined />,
    anaglyph: <ExperimentOutlined />
};

const viewModeLabels = {
    normal: '普通视图',
    ar1: 'AR 兼容模式',
    ar2: 'AR 谷歌模式',
    anaglyph: '3D眼镜模式'
};

const weatherOptions = [
    { value: 'clear', label: '晴天' },
    { value: 'cloudy', label: '多云' },
    { value: 'rainy', label: '雨天' }
];

const groundTypes = [
    { value: 'none', label: '无地面' },
    { value: 'grid', label: '网格' },
    { value: 'grass', label: '草地' },
    { value: 'concrete', label: '混凝土' },
];

const EditorToolbar = ({
                           onResetView,
                           onRotateLeft,
                           onRotateRight,
                           onZoomIn,
                           onZoomOut,
                           onToggleViewMode,
                           onWeatherChange,
                           onTimeChange,
                           onToggleRealtime,
                           onGroundTypeChange,
                           viewMode = 'normal',
                           weather = 'clear',
                           groundType = 'grid',
                           timeOfDay = 12,
                           isRealtimeEnabled = false
                       }) => {
    const viewModeItems = [
        { key: 'normal', icon: viewModeIcons.normal, label: viewModeLabels.normal },
        { key: 'ar1', icon: viewModeIcons.ar1, label: viewModeLabels.ar1 },
        { key: 'ar2', icon: viewModeIcons.ar2, label: viewModeLabels.ar2 },
        { key: 'anaglyph', icon: viewModeIcons.anaglyph, label: viewModeLabels.anaglyph }
    ];

    return (
        <div className="editor-toolbar">
            <Space
                split={<Divider type="vertical" />}
                size="small" // 统一小间距
                className="toolbar-content" // 添加类名控制滚动
            >
                {/* 视图模式切换 */}
                <Dropdown
                    menu={{
                        items: viewModeItems,
                        selectedKeys: [viewMode],
                        onClick: ({ key }) => onToggleViewMode(key)
                    }}
                    trigger={['click']}
                >
                    <Button type="text" className="toolbar-button">
                        {viewModeIcons[viewMode]}
                        <DownOutlined style={{ marginLeft: 4 }} />
                    </Button>
                </Dropdown>

                {/* 天气控制 */}
                <Space size="small">
                    <CloudOutlined />
                    <Select
                        value={weather}
                        onChange={onWeatherChange}
                        options={weatherOptions}
                        style={{ width: 80 }}
                        placeholder="天气"
                        size="small"
                    />
                </Space>

                {/* 时间控制 */}
                <Space size="small">
                    <ClockCircleOutlined />
                    <TimePicker
                        format="HH:mm"
                        value={dayjs().hour(Math.floor(timeOfDay)).minute((timeOfDay % 1) * 60)}
                        onChange={(time) => time && onTimeChange(time.hour() + time.minute() / 60)}
                        disabled={isRealtimeEnabled}
                        size="small"
                        style={{ width: 80 }}
                    />
                    <Tooltip title={isRealtimeEnabled ? '关闭实时模式' : '开启实时模式'}>
                        <Button
                            type={isRealtimeEnabled ? 'primary' : 'default'}
                            icon={<SyncOutlined spin={isRealtimeEnabled} />}
                            onClick={onToggleRealtime}
                            size="small"
                            className="toolbar-button"
                        />
                    </Tooltip>
                </Space>

                {/* 地面类型控制 */}
                <Space size="small">
                    <BorderOutlined />
                    <Select
                        value={groundType}
                        onChange={onGroundTypeChange}
                        options={groundTypes}
                        style={{ width: 80 }}
                        placeholder="地面类型"
                        size="small"
                    />
                </Space>

                {/* 基础操作 */}
                <Space size="small">
                    <Tooltip title="重置视图">
                        <Button
                            type="text"
                            icon={<HomeOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onResetView();
                            }}
                            size="small"
                            className="toolbar-button"
                        />
                    </Tooltip>
                    <Tooltip title="向左旋转 (15°)">
                        <Button
                            type="text"
                            icon={<RotateLeftOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRotateLeft();
                            }}
                            size="small"
                            className="toolbar-button"
                        />
                    </Tooltip>
                    <Tooltip title="向右旋转 (15°)">
                        <Button
                            type="text"
                            icon={<RotateRightOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRotateRight();
                            }}
                            size="small"
                            className="toolbar-button"
                        />
                    </Tooltip>
                    <Tooltip title="放大 (25%)">
                        <Button
                            type="text"
                            icon={<ZoomInOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onZoomIn();
                            }}
                            size="small"
                            className="toolbar-button"
                        />
                    </Tooltip>
                    <Tooltip title="缩小 (25%)">
                        <Button
                            type="text"
                            icon={<ZoomOutOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onZoomOut();
                            }}
                            size="small"
                            className="toolbar-button"
                        />
                    </Tooltip>
                </Space>
            </Space>
        </div>
    );
};

export default EditorToolbar;