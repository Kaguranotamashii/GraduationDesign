import React, { useState, useEffect, useRef } from 'react';
import Exploration from './Exploration';

const ThreeDLanding = ({ children, scrollProgress, setScrollProgress }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [cubePosition, setCubePosition] = useState({ x: 30, y: 40 }); // 初始位置为 30% 和 40%（手机端更靠上）
  const [emojis, setEmojis] = useState([]); // 存储每个面的 Emoji
  const cubeRef = useRef(null);
  const dragStartPosition = useRef({ x: 0, y: 0 });

  // 12 种情绪 Emoji
  const allEmojis = ['😀', '😎', '🤔', '😍', '😡', '😭', '😱', '🤯', '🥳', '🥺', '😴', '🤩'];

  // 初始化 Emoji
  useEffect(() => {
    const initialEmojis = Array(6)
      .fill()
      .map(() => allEmojis[Math.floor(Math.random() * allEmojis.length)]);
    setEmojis(initialEmojis);
  }, []);

  // 随机更换 Emoji
  useEffect(() => {
    const interval = setInterval(() => {
      const randomFaceIndex = Math.floor(Math.random() * 6); // 随机选择一个面
      const randomEmoji = allEmojis[Math.floor(Math.random() * allEmojis.length)]; // 随机选择一个 Emoji

      setEmojis((prevEmojis) => {
        const newEmojis = [...prevEmojis];
        newEmojis[randomFaceIndex] = randomEmoji; // 更新对应面的 Emoji
        return newEmojis;
      });
    }, 100); // 每 0.1 秒更换一次

    return () => clearInterval(interval); // 清除定时器
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = window.innerHeight;
      const progress = Math.min(window.scrollY / maxScroll, 1);
      setScrollProgress(progress);
    };

    const handleMouseMove = (e) => {
      if (cubeRef.current) {
        const rect = cubeRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const x = (e.clientX - centerX) / (rect.width / 2);
        const y = (e.clientY - centerY) / (rect.height / 2);
        setMousePosition({ x, y });
      }

      // 拖动逻辑
      if (isDragging) {
        const deltaX = e.clientX - dragStartPosition.current.x;
        const deltaY = e.clientY - dragStartPosition.current.y;
        setCubePosition((prev) => ({
          x: Math.min(Math.max(prev.x + deltaX / window.innerWidth * 100, 0), 100), // 限制在 0% 到 100% 之间
          y: Math.min(Math.max(prev.y + deltaY / window.innerHeight * 100, 0), 100),
        }));
        dragStartPosition.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, setScrollProgress]);

  // 计算立方体变换
  const getTransform = (index) => {
    const spread = scrollProgress * 500;
    const baseSize = window.innerWidth < 768 ? 120 : 360; // 手机端进一步缩小立方体尺寸
    
    const transforms = {
      0: {
        transform: `translateZ(${baseSize / 2}px)`,
        background: 'rgba(255, 255, 255, 0.1)',
      },
      1: {
        transform: `translateZ(${-baseSize / 2 - spread}px) rotateY(180deg)`,
        background: 'rgba(255, 255, 255, 0.1)',
        opacity: 1 - scrollProgress,
      },
      2: {
        transform: `translateX(${baseSize / 2 + spread}px) rotateY(90deg)`,
        background: 'rgba(255, 255, 255, 0.12)',
        opacity: 1 - scrollProgress,
      },
      3: {
        transform: `translateX(${-baseSize / 2 - spread}px) rotateY(-90deg)`,
        background: 'rgba(255, 255, 255, 0.12)',
        opacity: 1 - scrollProgress,
      },
      4: {
        transform: `translateY(${-baseSize / 2 - spread}px) rotateX(90deg)`,
        background: 'rgba(255, 255, 255, 0.15)',
        opacity: 1 - scrollProgress,
      },
      5: {
        transform: `translateY(${baseSize / 2 + spread}px) rotateX(-90deg)`,
        background: 'rgba(255, 255, 255, 0.15)',
        opacity: 1 - scrollProgress,
      },
    };

    return transforms[index];
  };

  // 处理鼠标按下事件
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartPosition.current = { x: e.clientX, y: e.clientY };
  };

  return (
    <div className="relative min-h-[200vh] bg-white overflow-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0">
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(135, 206, 235, 0.15) 0%, transparent 60%),
              radial-gradient(circle at 70% 70%, rgba(255, 182, 193, 0.15) 0%, transparent 60%)
            `,
            transform: `scale(${1 + scrollProgress * 0.2})`,
            transition: 'transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1)',
          }}
        />
      </div>

      {/* Floating Stars */}
      <div className="fixed inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-50 animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 5 + 5}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* 3D Scene */}
      <div className="fixed inset-0 w-full h-screen">
        <div
          className="absolute w-full h-full"
          style={{
            perspective: window.innerWidth < 768 ? '600px' : '2000px', // 手机端进一步减小透视值
            perspectiveOrigin: '50% 50%',
          }}
        >
          {/* Cube */}
          <div
            ref={cubeRef}
            className="absolute w-[120px] h-[120px] md:w-[360px] md:h-[360px]"
            style={{
              left: `${cubePosition.x}%`,
              top: `${cubePosition.y}%`,
              transformStyle: 'preserve-3d',
              transform: `
                translate(-50%, -50%)
                rotateX(${scrollProgress * 180 + mousePosition.y * 30}deg)
                rotateY(${scrollProgress * 90 + mousePosition.x * 30}deg)
                scale(${1 + scrollProgress * 2})
              `,
              transition: isDragging ? 'none' : 'transform 0.8s cubic-bezier(0.22, 0.61, 0.36, 1)',
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={handleMouseDown}
          >
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="absolute inset-0 w-full h-full"
                style={{
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  transition: 'all 1s cubic-bezier(0.22, 0.61, 0.36, 1)',
                  boxShadow: '0 0 30px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(8px)',
                  ...getTransform(index),
                }}
              >
                <div 
                  className="w-full h-full rounded-lg flex items-center justify-center"
                  style={{
                    background: `linear-gradient(
                      ${45 + index * 60}deg,
                      rgba(255,255,255,0.95),
                      rgba(255,255,255,0.8)
                    )`,
                    boxShadow: 'inset 0 0 50px rgba(0,0,0,0.05)',
                  }}
                >
                  <span className="text-[40px] md:text-[180px] select-none transition-opacity duration-500">
                    {emojis[index]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content - Mobile Layout */}
      <div 
        className="fixed bottom-0 left-0 right-0 p-8 bg-white/90 backdrop-blur-md md:hidden"
        style={{
          opacity: Math.max(0, 1 - scrollProgress * 2),
          transform: `translateY(${scrollProgress * 50}px)`,
          transition: 'all 0.8s cubic-bezier(0.22, 0.61, 0.36, 1)',
        }}
      >
        <h1 className="text-4xl font-bold mb-6 text-gray-800">
          欢迎来到 ✨
          <br />
          这个平台 🚀
        </h1>

        <div className="space-y-6 text-gray-600">
          <p className="text-xl leading-relaxed">
            让创意绽放 💫
            <br />
            探索无限可能 🌈
          </p>
          <p className="text-lg leading-relaxed">
            在这里，每一次互动都是独特的体验 ⚡️
            <br />
            让我们一起创造令人惊叹的作品 🎨
          </p>
        </div>
      </div>

      {/* Content - Desktop Layout */}
      <div 
        className="fixed top-1/2 right-24 transform -translate-y-1/2 max-w-xl hidden md:block"
        style={{
          opacity: Math.max(0, 1 - scrollProgress * 2),
          transform: `translate(${scrollProgress * 100}px, -50%)`,
          transition: 'all 0.8s cubic-bezier(0.22, 0.61, 0.36, 1)',
        }}
      >
        <h1 className="text-6xl font-bold mb-8 text-gray-800">
          欢迎来到 ✨
          <br />
          这个平台 🚀
        </h1>

        <div className="space-y-6 text-gray-600">
          <p className="text-2xl leading-relaxed">
            让创意绽放 💫
            <br />
            探索无限可能 🌈
          </p>
          <p className="text-xl leading-relaxed">
            在这里，每一次互动都是独特的体验 ⚡️
            <br />
            让我们一起创造令人惊叹的作品 🎨
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        className="fixed bottom-12 left-1/2 transform -translate-x-1/2 text-gray-400"
        style={{ 
          opacity: Math.max(0, 1 - scrollProgress * 2),
          transform: `translate(-50%, ${scrollProgress * 50}px)`,
        }}
      >
        <p className="text-lg font-light tracking-wide mb-3 text-center">
          向下滚动探索更多 👇
        </p>
        <div className="w-6 h-6 mx-auto border-b-2 border-r-2 border-gray-400 rotate-45 animate-bounce" />
      </div>

      {children}
       
    </div>
  );
};

export default ThreeDLanding;