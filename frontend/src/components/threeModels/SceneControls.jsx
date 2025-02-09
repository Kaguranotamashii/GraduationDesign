import React from 'react';
import { Card, Slider, Switch, Button, Space, TimePicker } from 'antd';
import {
    SunOutlined,
    CloudOutlined,
    CloudDownloadOutlined,
    SettingOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const SceneControls = ({
                           onWeatherChange,
                           onGroundPositionChange,
                           onGridVisibleChange,
                           onFogIntensityChange,
                           onResetCamera,
                           onTimeChange,
                           onLightIntensityChange,
                           onLightColorChange,
                           weather,
                           groundPosition,
                           showGrid,
                           fogIntensity,
                           currentTime,
                           lightIntensity,
                           lightColor,
                       }) => {
    return (
        <Card
            title="场景控制"
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                width: 300,
                background: 'rgba(255, 255, 255, 0.9)'
            }}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                {/* 时间控制 */}
                <div>
                    <div style={{ marginBottom: 8 }}>时间</div>
                    <TimePicker
                        value={currentTime}
                        onChange={onTimeChange}
                        format="HH:mm"
                        style={{ width: '100%' }}
                    />
                </div>

                {/* 天气控制 */}
                <div>
                    <div style={{ marginBottom: 8 }}>天气</div>
                    <Space>
                        <Button
                            type={weather === 'sunny' ? 'primary' : 'default'}
                            icon={<SunOutlined />}
                            onClick={() => onWeatherChange('sunny')}
                        >
                            晴天
                        </Button>
                        <Button
                            type={weather === 'cloudy' ? 'primary' : 'default'}
                            icon={<CloudOutlined />}
                            onClick={() => onWeatherChange('cloudy')}
                        >
                            多云
                        </Button>
                        <Button
                            type={weather === 'rainy' ? 'primary' : 'default'}
                            icon={<CloudDownloadOutlined />}
                            onClick={() => onWeatherChange('rainy')}
                        >
                            雨天
                        </Button>
                    </Space>
                </div>

                {/* 光照强度控制 */}
                <div>
                    <div style={{ marginBottom: 8 }}>光照强度</div>
                    <Slider
                        min={0}
                        max={2}
                        step={0.1}
                        value={lightIntensity}
                        onChange={onLightIntensityChange}
                    />
                </div>

                {/* 光照颜色温度 */}
                <div>
                    <div style={{ marginBottom: 8 }}>光照色温</div>
                    <Slider
                        min={1000}
                        max={12000}
                        step={100}
                        value={lightColor}
                        onChange={onLightColorChange}
                        marks={{
                            1000: '暖',
                            6500: '中性',
                            12000: '冷'
                        }}
                    />
                </div>

                {/* 地面位置控制 */}
                <div>
                    <div style={{ marginBottom: 8 }}>地面位置</div>
                    <Slider
                        min={-20}
                        max={0}
                        step={0.1}
                        value={groundPosition}
                        onChange={onGroundPositionChange}
                    />
                </div>

                {/* 雾气强度控制 */}
                <div>
                    <div style={{ marginBottom: 8 }}>雾气强度</div>
                    <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={fogIntensity}
                        onChange={onFogIntensityChange}
                    />
                </div>

                {/* 网格显示控制 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>显示网格</span>
                    <Switch checked={showGrid} onChange={onGridVisibleChange} />
                </div>

                {/* 重置相机按钮 */}
                <Button
                    icon={<SettingOutlined />}
                    onClick={onResetCamera}
                    block
                >
                    重置视角
                </Button>
            </Space>
        </Card>
    );
};

export default SceneControls;