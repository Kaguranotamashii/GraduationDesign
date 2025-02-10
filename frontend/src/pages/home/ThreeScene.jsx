import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import Stats from 'stats.js';

// Xbox 360专用配置
const XBOX_CONFIG = {
  axes: {
    leftX: 0,    // 左摇杆X轴
    leftY: 1,    // 左摇杆Y轴
    rightX: 2,   // 右摇杆X轴
    rightY: 3    // 右摇杆Y轴
  },
  deadZone: 0.15,
  moveSpeed: 0.3,
  rotateSpeed: 0.15,  // 提升旋转速度
  invertRightX: false // Xbox不需要反转
};

const ThreeScene = () => {
  const mountRef = useRef(null);
  const cubeRef = useRef();
  const animationId = useRef(null);
  const gamepadRef = useRef(null);
  const statsRef = useRef(null); // 明确初始化stats引用
  const lastFrameTime = useRef(performance.now());

  // 调试状态
  const [debugInfo, setDebugInfo] = useState({
    rawRightX: 0,
    processedRightX: 0,
    rotation: 0
  });

  /* 摇杆数据处理（带曲线调整） */
  const processAxis = (value) => {
    const absValue = Math.abs(value);
    if (absValue < XBOX_CONFIG.deadZone) return 0;
    // 应用非线性曲线
    const processed = Math.sign(value) * Math.pow((absValue - XBOX_CONFIG.deadZone)/(1 - XBOX_CONFIG.deadZone), 1.5);
    return processed;
  };

  /* 核心游戏循环 */
  const gameLoop = () => {
    const now = performance.now();
    const deltaTime = (now - lastFrameTime.current) / 1000; // 精确帧时间
    lastFrameTime.current = now;

    if (!gamepadRef.current || !cubeRef.current) return;

    try {
      const gamepad = navigator.getGamepads()[gamepadRef.current.index];
      if (!gamepad) return;

      // 获取原始摇杆数据
      const rawRightX = gamepad.axes[XBOX_CONFIG.axes.rightX];
      const rawRightY = gamepad.axes[XBOX_CONFIG.axes.rightY];

      // 处理输入
      const processedRightX = processAxis(rawRightX);
      const processedRightY = processAxis(rawRightY);

      // 旋转逻辑
      let rotationDelta = 0;
      if (Math.abs(processedRightX) > 0) {
        rotationDelta = processedRightX * XBOX_CONFIG.rotateSpeed * deltaTime;
        cubeRef.current.rotation.y += rotationDelta;
        cubeRef.current.updateMatrixWorld(); // 强制更新矩阵
      }

      // 更新调试信息
      setDebugInfo({
        rawRightX: rawRightX.toFixed(3),
        processedRightX: processedRightX.toFixed(3),
        rotation: THREE.MathUtils.radToDeg(cubeRef.current.rotation.y).toFixed(1)
      });

    } catch (error) {
      console.error('Game loop error:', error);
    }
  };

  /* Three.js初始化 */
  const initScene = () => {
    const stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
    statsRef.current = stats; // 必须在此处赋值
    // 场景基础设置
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    
    // 渲染器设置
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // 光照系统
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 2, 3);
    scene.add(directionalLight);

    // 创建立方体
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x000f02,
      shininess: 100,
      wireframe: false 
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.rotation.order = 'YXZ'; // 设置旋转顺序
    scene.add(cube);
    cubeRef.current = cube;

    // 启动渲染循环
    const animate = () => {
      statsRef.current.begin();
      gameLoop();
      renderer.render(scene, camera);
      statsRef.current.end();
      animationId.current = requestAnimationFrame(animate);
    };
    animate();

  

    return () => {
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  };

  /* 手柄事件处理 */
  useEffect(() => {
    const handleConnect = (e) => {
      if (e.gamepad.id.includes('Xbox')) {
        console.log('Xbox 360手柄已连接');
        gamepadRef.current = e.gamepad;
      }
    };

    const handleDisconnect = () => {
      gamepadRef.current = null;
    };

    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleDisconnect);
    
    initScene();

    return () => {
      window.removeEventListener('gamepadconnected', handleConnect);
      window.removeEventListener('gamepaddisconnected', handleDisconnect);
      cancelAnimationFrame(animationId.current);
    };
  }, []);

  return (
    <div>
      <div ref={mountRef} />
      
      {/* 调试面板 */}
      <div style={panelStyle}>
        <h3>Xbox 360手柄调试器</h3>
        <div style={rowStyle}>
          <label>原始右X轴:</label>
          <div style={valueStyle}>{debugInfo.rawRightX}</div>
        </div>
        <div style={rowStyle}>
          <label>处理后右X轴:</label>
          <div style={valueStyle}>{debugInfo.processedRightX}</div>
        </div>
        <div style={rowStyle}>
          <label>当前角度:</label>
          <div style={valueStyle}>{debugInfo.rotation}°</div>
        </div>
        <div style={rowStyle}>
          <label>旋转速度:</label>
          <input 
            type="range"
            min="0.01"
            max="0.5"
            step="0.01"
            value={XBOX_CONFIG.rotateSpeed}
            onChange={(e) => XBOX_CONFIG.rotateSpeed = parseFloat(e.target.value)}
            style={sliderStyle}
          />
        </div>
      </div>
    </div>
  );
};

// 样式配置
const panelStyle = {
  position: 'fixed',
  top: '20px',
  left: '20px',
  background: 'rgba(0,0,0,0.8)',
  color: '#00ff00',
  padding: '15px',
  borderRadius: '8px',
  fontFamily: 'monospace',
  zIndex: 1000
};

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  margin: '8px 0',
  width: '250px'
};

const valueStyle = {
  color: '#fff',
  fontWeight: 'bold'
};

const sliderStyle = {
  width: '120px',
  marginLeft: '10px'
};

export default ThreeScene;