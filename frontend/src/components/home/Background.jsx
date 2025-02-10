import React, { useState, useEffect } from 'react';
import { useSpring, animated, useTrail, config, useSpringRef, useChain } from '@react-spring/web';

const Background = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const images = [
        '/images/swiper/1.jpg',
        '/images/swiper/2.jpg',
        '/images/swiper/3.jpg',
        '/images/swiper/4.jpg'
    ];

    const mainTitle = "传承千年匠心";
    const subTitles = [
        { text: "传统建筑", highlight: "诗意栖居" },
        { text: "匠心营造", highlight: "文化瑰宝" },
        { text: "数字记录", highlight: "永续传承" }
    ];

    const decorativeText = "建筑 · 文化 · 传承 · 创新";

    // 图片过渡动画
    const [{ opacity, scale }, api] = useSpring(() => ({
        opacity: 1,
        scale: 1,
        config: { tension: 200, friction: 20 }
    }));

    const switchImage = async (newIndex) => {
        if (isTransitioning) return;
        setIsTransitioning(true);

        await api.start({
            opacity: 0.3,
            scale: 1.05,
            config: { duration: 1000 }
        });

        setCurrentImageIndex(newIndex);

        await api.start({
            opacity: 1,
            scale: 1,
            config: { duration: 1000 }
        });

        setIsTransitioning(false);
    };

    useEffect(() => {
        setIsLoaded(true);
        const timer = setInterval(() => {
            const nextIndex = (currentImageIndex + 1) % images.length;
            switchImage(nextIndex);
        }, 6000);

        return () => clearInterval(timer);
    }, [currentImageIndex]);

    const springRef = useSpringRef();
    const trailRef = useSpringRef();
    const decorRef = useSpringRef();

    const mainTitleSpring = useSpring({
        from: {
            opacity: 0,
            y: 30,
        },
        to: {
            opacity: isLoaded ? 1 : 0,
            y: isLoaded ? 0 : 30,
        },
        delay: 500,
        config: config.molasses,
    });

    const trail = useTrail(subTitles.length, {
        ref: trailRef,
        from: { opacity: 0, x: 20, scale: 0.9 },
        to: { opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 20, scale: isLoaded ? 1 : 0.9 },
        config: { tension: 280, friction: 60 },
    });

    const decorSpring = useSpring({
        ref: decorRef,
        from: { opacity: 0, scale: 1.1 },
        to: { opacity: isLoaded ? 0.6 : 0, scale: 1 },
        config: { duration: 1000 },
    });

    useChain(isLoaded ? [springRef, trailRef, decorRef] : [], [0, 0.3, 0.5], 1500);

    return (
        <div className="relative h-screen overflow-hidden">
            {/* 背景图片 */}
            <animated.div
                style={{
                    opacity,
                    transform: scale.to(s => `scale(${s})`),
                    backgroundImage: `url(${images[currentImageIndex]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
                className="absolute inset-0 z-0 transition-all duration-1000"
            >
                {/* 渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 transition-opacity duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent transition-opacity duration-1000" />
            </animated.div>

            {/* 主要内容 */}
            <div className="absolute inset-0 flex items-center z-10">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto relative">
                        {/* 装饰圆环 */}
                        <animated.div
                            style={decorSpring}
                            className="absolute -left-20 -top-20 w-40 h-40 border border-white/10 rounded-full"
                        />
                        <animated.div
                            style={decorSpring}
                            className="absolute -right-10 bottom-10 w-20 h-20 border border-red-500/10 rounded-full"
                        />

                        {/* 主标题 */}
                        <animated.h1
                            style={mainTitleSpring}
                            className="text-6xl md:text-7xl font-bold text-white mb-8 relative"
                        >
                            {mainTitle}
                            <span className="absolute -top-8 left-0 text-sm font-normal tracking-[0.2em] text-red-500/80">
                                TRADITIONAL ARCHITECTURE
                            </span>
                        </animated.h1>

                        {/* 副标题 */}
                        <div className="space-y-4 mb-12">
                            {trail.map((style, index) => (
                                <animated.div
                                    key={index}
                                    style={style}
                                    className="flex items-center space-x-4"
                                >
                                    <span className="text-gray-300 text-xl">
                                        {subTitles[index].text}
                                    </span>
                                    <span className="text-red-500/90 text-2xl font-semibold">
                                        {subTitles[index].highlight}
                                    </span>
                                </animated.div>
                            ))}
                        </div>

                        {/* 装饰文字 */}
                        <animated.div
                            style={decorSpring}
                            className="absolute -right-40 top-1/2 -rotate-90 transform origin-left
                                     text-white/30 tracking-[0.5em] whitespace-nowrap text-sm"
                        >
                            {decorativeText}
                        </animated.div>
                    </div>
                </div>
            </div>

            {/* 滚动提示 */}
            <animated.div
                style={decorSpring}
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/60
                         flex flex-col items-center animate-bounce"
            >
                <span className="text-sm mb-2">向下滚动探索更多</span>
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                </svg>
            </animated.div>

            {/* 页面指示器 */}
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 space-y-2">
                {images.map((_, index) => (
                    <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer
                                ${currentImageIndex === index ? 'bg-red-500 w-4' : 'bg-white/30'}`}
                        onClick={() => !isTransitioning && switchImage(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Background;