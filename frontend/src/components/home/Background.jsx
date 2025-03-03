import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Background = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;

        // 设置canvas尺寸为全屏
        canvas.width = width;
        canvas.height = height;

        // 建筑轮廓数据 - 简化的建筑线条
        const buildingData = [
            // 左侧建筑群
            { x: 0, height: 0.3, width: 0.05 },
            { x: 0.05, height: 0.5, width: 0.07 },
            { x: 0.12, height: 0.4, width: 0.06 },
            { x: 0.18, height: 0.6, width: 0.08 },
            { x: 0.26, height: 0.35, width: 0.06 },

            // 中间建筑群
            { x: 0.35, height: 0.7, width: 0.05 }, // 高楼
            { x: 0.4, height: 0.45, width: 0.07 },
            { x: 0.47, height: 0.65, width: 0.06 },
            { x: 0.53, height: 0.5, width: 0.04 },
            { x: 0.57, height: 0.8, width: 0.08 }, // 高楼

            // 右侧建筑群
            { x: 0.68, height: 0.55, width: 0.07 },
            { x: 0.75, height: 0.4, width: 0.05 },
            { x: 0.8, height: 0.6, width: 0.09 },
            { x: 0.89, height: 0.3, width: 0.06 },
            { x: 0.95, height: 0.45, width: 0.05 }
        ];

        // 创建粒子系统
        const particles = [];
        const particleCount = 100;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.5 + 0.5,
                speed: Math.random() * 0.5 + 0.2,
                opacity: Math.random() * 0.5 + 0.3
            });
        }

        // 绘制函数
        const draw = () => {
            // 清空画布
            ctx.clearRect(0, 0, width, height);

            // 绘制渐变背景
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, '#0d2b4a'); // 深蓝色顶部
            gradient.addColorStop(0.7, '#1a4a7c'); // 中间色
            gradient.addColorStop(1, '#2c5d8f'); // 底部色

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // 绘制星星（粒子）
            ctx.fillStyle = '#ffffff';
            particles.forEach(particle => {
                ctx.globalAlpha = particle.opacity;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fill();

                // 移动粒子
                particle.y += particle.speed;

                // 如果粒子到达底部，重置到顶部
                if (particle.y > height) {
                    particle.y = 0;
                    particle.x = Math.random() * width;
                }
            });

            // 恢复透明度
            ctx.globalAlpha = 1;

            // 绘制建筑剪影
            ctx.fillStyle = '#000000';
            buildingData.forEach(building => {
                const x = building.x * width;
                const buildingHeight = building.height * height;
                const buildingWidth = building.width * width;

                // 绘制主体
                ctx.beginPath();
                ctx.rect(x, height - buildingHeight, buildingWidth, buildingHeight);
                ctx.fill();

                // 随机添加一些窗户点缀
                ctx.fillStyle = 'rgba(255, 255, 190, 0.6)';
                const windowRows = Math.floor(buildingHeight / 20);
                const windowCols = Math.floor(buildingWidth / 15);

                for (let r = 0; r < windowRows; r++) {
                    for (let c = 0; c < windowCols; c++) {
                        // 只绘制部分窗户，给人一种随机点亮的感觉
                        if (Math.random() > 0.6) {
                            const windowX = x + c * 15 + 5;
                            const windowY = height - buildingHeight + r * 20 + 10;
                            const windowSize = 3 + Math.random() * 2;

                            ctx.fillRect(
                                windowX,
                                windowY,
                                windowSize,
                                windowSize
                            );
                        }
                    }
                }

                // 重置填充色为黑色，准备绘制下一个建筑
                ctx.fillStyle = '#000000';
            });
        };

        // 动画循环
        let animationId;
        const animate = () => {
            draw();
            animationId = requestAnimationFrame(animate);
        };

        // 开始动画
        animate();

        // 窗口大小改变时调整canvas尺寸
        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', handleResize);

        // 添加视差滚动效果
        const parallaxEffect = () => {
            const scrollY = window.scrollY || window.pageYOffset;

            // 背景随滚动轻微移动，创造视差效果
            gsap.to(canvasRef.current, {
                y: scrollY * 0.2,
                duration: 0.5,
                ease: "power1.out"
            });
        };

        window.addEventListener('scroll', parallaxEffect);

        // 清理函数
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', parallaxEffect);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-10"
            style={{ pointerEvents: 'none' }}
        />
    );
};

export default Background;