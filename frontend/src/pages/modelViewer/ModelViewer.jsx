import React, { useEffect, useRef, useState } from 'react';
import SceneManager from '../../components/threeModels/SceneManager';
import ModelManager from '../../components/threeModels/ModelManager';
import SceneControls from '../../components/threeModels/SceneControls';
import dayjs from 'dayjs';
import {Button} from 'antd'
const ModelViewer = () => {
    // Refs
    const containerRef = useRef(null);
    const sceneManagerRef = useRef(null);
    const modelManagerRef = useRef(null);

    // States
    const [weather, setWeather] = useState('sunny');
    const [groundPosition, setGroundPosition] = useState(-5);
    const [showGrid, setShowGrid] = useState(false);
    const [fogIntensity, setFogIntensity] = useState(0);
    const [useRealTime, setUseRealTime] = useState(true);
    const [currentTime, setCurrentTime] = useState(dayjs());
    const [dayBreakTime, setDayBreakTime] = useState(dayjs().hour(6).minute(0));
    const [nightFallTime, setNightFallTime] = useState(dayjs().hour(18).minute(0));

    // Initialize scene and model managers
    useEffect(() => {
        if (!containerRef.current) return;

        sceneManagerRef.current = new SceneManager(containerRef.current);
        modelManagerRef.current = new ModelManager(sceneManagerRef.current);

        // Initial setup
        sceneManagerRef.current.createGround(groundPosition);
        modelManagerRef.current.loadModel('/models/qiniandian.glb', groundPosition);

        // Cleanup
        return () => {
            sceneManagerRef.current.dispose();
            modelManagerRef.current.dispose();
        };
    }, []);

    // Update weather effects
    useEffect(() => {
        if (sceneManagerRef.current) {
            sceneManagerRef.current.updateWeather(weather, fogIntensity);
        }
    }, [weather, fogIntensity]);

    // Update time effects
    useEffect(() => {
        if (sceneManagerRef.current) {
            const hour = currentTime.hour() + currentTime.minute() / 60;
            sceneManagerRef.current.updateTime(hour);
        }
    }, [currentTime]);

    // Update day/night times
    useEffect(() => {
        if (sceneManagerRef.current) {
            sceneManagerRef.current.setDayNightTimes(
                dayBreakTime.hour() + dayBreakTime.minute() / 60,
                nightFallTime.hour() + nightFallTime.minute() / 60
            );
        }
    }, [dayBreakTime, nightFallTime]);

    // Real-time updates
    useEffect(() => {
        let timeInterval;
        if (useRealTime) {
            timeInterval = setInterval(() => {
                setCurrentTime(dayjs());
            }, 1000);
        }
        return () => timeInterval && clearInterval(timeInterval);
    }, [useRealTime]);

    // Update ground and grid position
    useEffect(() => {
        if (sceneManagerRef.current) {
            sceneManagerRef.current.updateGroundPosition(groundPosition);
        }
        if (modelManagerRef.current) {
            modelManagerRef.current.updateModelPosition(groundPosition);
        }
    }, [groundPosition]);

    // Update grid visibility
    useEffect(() => {
        if (sceneManagerRef.current) {
            sceneManagerRef.current.updateGridVisibility(showGrid);
        }
    }, [showGrid]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            {/*# 这里在左上角侧添加个返回按钮返回主页*/}
            <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
                <Button type="primary" onClick={() => window.location.href = '/'}>
                    返回主页
                </Button>


            </div>
            <div
                ref={containerRef}
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#87CEEB',
                    touchAction: 'none'
                }}
            />
            <SceneControls
                weather={weather}
                groundPosition={groundPosition}
                showGrid={showGrid}
                fogIntensity={fogIntensity}
                currentTime={currentTime}
                useRealTime={useRealTime}
                dayBreakTime={dayBreakTime}
                nightFallTime={nightFallTime}
                onWeatherChange={setWeather}
                onGroundPositionChange={setGroundPosition}
                onGridVisibleChange={setShowGrid}
                onFogIntensityChange={setFogIntensity}
                onTimeChange={(hour) => {
                    if (!useRealTime) {
                        const newTime = dayjs().hour(Math.floor(hour)).minute((hour % 1) * 60);
                        setCurrentTime(newTime);
                    }
                }}
                onUseRealTimeChange={setUseRealTime}
                onDayNightTimeChange={(times) => {
                    if (times?.[0] && times?.[1]) {
                        setDayBreakTime(times[0]);
                        setNightFallTime(times[1]);
                        sceneManagerRef.current?.setDayNightTimes(
                            times[0].hour() + times[0].minute() / 60,
                            times[1].hour() + times[1].minute() / 60
                        );
                    }
                }}
                onResetCamera={() => {
                    sceneManagerRef.current?.resetCamera();
                }}
            />
        </div>
    );
};

export default ModelViewer;