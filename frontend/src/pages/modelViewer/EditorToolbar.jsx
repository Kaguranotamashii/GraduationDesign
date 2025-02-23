// EditorToolbar.jsx
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

const viewModeIcons = {
    normal: <GlobalOutlined />,
    ar: <MobileOutlined />,
    anaglyph: <ExperimentOutlined />
};

const viewModeLabels = {
    normal: '普通视图',
    ar: 'AR模式',
    anaglyph: '3D眼镜模式'
};

const weatherOptions = [

    { value: 'clear', label: '晴天' },
    { value: 'cloudy', label: '多云' },
    { value: 'rainy', label: '雨天' }
];

const groundTypes = [
    { value: 'none', label: '无地面' },    // 添加无地面选项
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
        {
            key: 'normal',
            icon: viewModeIcons.normal,
            label: viewModeLabels.normal
        },
        {
            key: 'ar',
            icon: viewModeIcons.ar,
            label: `${viewModeLabels.ar}`
        },
        {
            key: 'anaglyph',
            icon: viewModeIcons.anaglyph,
            label: `${viewModeLabels.anaglyph}`
        }
    ];

    return (
        <div style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
            <Space split={<Divider type="vertical" />}>
                {/* 视图模式切换下拉菜单 */}
                <Dropdown
                    menu={{
                        items: viewModeItems,
                        selectedKeys: [viewMode],
                        onClick: ({ key }) => onToggleViewMode(key)
                    }}
                >
                    <Button type="text">
                        {viewModeIcons[viewMode]}
                        <span style={{ marginLeft: 8 }}>{viewModeLabels[viewMode]}</span>
                        <DownOutlined style={{ marginLeft: 4 }} />
                    </Button>
                </Dropdown>

                {/* 天气控制 */}
                <Space>
                    <CloudOutlined />
                    <Select
                        value={weather}
                        onChange={onWeatherChange}
                        options={weatherOptions}
                        style={{ width: 100 }}
                        placeholder="天气"
                    />
                </Space>

                {/* 时间控制 */}
                <Space>
                    <ClockCircleOutlined />
                    <TimePicker
                        format="HH:mm"
                        value={dayjs().hour(Math.floor(timeOfDay)).minute((timeOfDay % 1) * 60)}
                        onChange={(time) => {
                            if (time) {
                                onTimeChange(time.hour() + time.minute() / 60);
                            }
                        }}
                        disabled={isRealtimeEnabled}
                    />
                    <Tooltip title={isRealtimeEnabled ? '关闭实时模式' : '开启实时模式'}>
                        <Button
                            type={isRealtimeEnabled ? 'primary' : 'default'}
                            icon={<SyncOutlined spin={isRealtimeEnabled} />}
                            onClick={onToggleRealtime}
                        />
                    </Tooltip>
                </Space>

                {/* 地面类型控制 */}
                <Space>
                    <BorderOutlined />
                    <Select
                        value={groundType}
                        onChange={onGroundTypeChange}
                        options={groundTypes}
                        style={{ width: 100 }}
                        placeholder="地面类型"
                    />
                </Space>

                {/* 基础操作 */}
                <Space>
                    <Button
                        type="text"
                        icon={<HomeOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onResetView();
                        }}
                        title="重置视图"
                    />
                    <Button
                        type="text"
                        icon={<RotateLeftOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onRotateLeft();
                        }}
                        title="向左旋转 (15°)"
                    />
                    <Button
                        type="text"
                        icon={<RotateRightOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onRotateRight();
                        }}
                        title="向右旋转 (15°)"
                    />
                    <Button
                        type="text"
                        icon={<ZoomInOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onZoomIn();
                        }}
                        title="放大 (25%)"
                    />
                    <Button
                        type="text"
                        icon={<ZoomOutOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onZoomOut();
                        }}
                        title="缩小 (25%)"
                    />
                </Space>
            </Space>
        </div>
    );
};

export default EditorToolbar;