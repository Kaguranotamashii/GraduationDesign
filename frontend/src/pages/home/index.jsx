// HomePage.jsx
import React, { useEffect, useRef, useState } from 'react';
import MainLayout from '@/layout/MainLayout.jsx';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getTopArticles, getFeaturedArticles } from '@/api/articleApi';
import { getAllModels } from '@/api/builderApi';

// 导入组件
import {
    HeroSection,
    FeatureSection,
    ArticleSection,
    FeaturedArticleSection,
    ModelSection,
    QuoteSection,
    CallToActionSection
} from './HomeComponents';

// 注册 ScrollTrigger 插件
gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
    // 创建引用
    const heroRef = useRef(null);
    const featureRef = useRef(null);
    const articleRef = useRef(null);
    const modelRef = useRef(null);
    const quoteRef = useRef(null);

    // 状态管理
    const [topArticles, setTopArticles] = useState([]);
    const [featuredArticles, setFeaturedArticles] = useState([]);
    const [topModels, setTopModels] = useState([]);
    const [loading, setLoading] = useState({
        articles: true,
        models: true
    });
    const [error, setError] = useState({
        articles: null,
        models: null
    });

    // 获取热门文章和模型数据
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 获取热门文章
                const topArticlesResponse = await getTopArticles();
                setTopArticles(topArticlesResponse.data || []);

                // 获取精选文章
                const featuredArticlesResponse = await getFeaturedArticles();
                setFeaturedArticles(featuredArticlesResponse.data?.results || []);

                setLoading(prev => ({...prev, articles: false}));
            } catch (err) {
                console.error('获取文章数据失败:', err);
                setError(prev => ({...prev, articles: '获取文章数据失败'}));
                setLoading(prev => ({...prev, articles: false}));
            }

            try {
                // 获取所有模型数据
                const modelsResponse = await getAllModels();
                // 取前4个模型展示
                setTopModels((modelsResponse.data || []).slice(0, 4));
                setLoading(prev => ({...prev, models: false}));
            } catch (err) {
                console.error('获取模型数据失败:', err);
                setError(prev => ({...prev, models: '获取模型数据失败'}));
                setLoading(prev => ({...prev, models: false}));
            }
        };

        fetchData();
    }, []);

    // 动画效果
    useEffect(() => {
        // 英雄区域动画
        gsap.fromTo(
            heroRef.current.querySelector('.hero-content'),
            { opacity: 0, y: 100 },
            { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' }
        );

        // 卷轴展开动画
        gsap.fromTo(
            heroRef.current.querySelector('.scroll-decoration'),
            { scaleY: 0 },
            { scaleY: 1, duration: 1.2, ease: 'power2.out', delay: 0.3 }
        );

        // 特色区域动画
        gsap.from(featureRef.current.querySelectorAll('.feature-card'), {
            opacity: 0,
            y: 50,
            stagger: 0.2,
            duration: 0.8,
            ease: 'back.out(1.7)',
            scrollTrigger: {
                trigger: featureRef.current,
                start: 'top 80%',
            },
        });

        // 文章区域动画
        gsap.from(articleRef.current.querySelectorAll('.article-card'), {
            opacity: 0,
            x: -50,
            stagger: 0.15,
            duration: 0.8,
            scrollTrigger: {
                trigger: articleRef.current,
                start: 'top 75%',
            },
        });

        // 模型展示区动画
        gsap.from(modelRef.current.querySelectorAll('.model-item'), {
            opacity: 0,
            scale: 0.8,
            stagger: 0.2,
            duration: 1,
            ease: 'elastic.out(1, 0.75)',
            scrollTrigger: {
                trigger: modelRef.current,
                start: 'top 70%',
            },
        });

        // 引言区动画
        gsap.fromTo(
            quoteRef.current,
            { opacity: 0, scale: 0.9 },
            {
                opacity: 1,
                scale: 1,
                duration: 1.2,
                scrollTrigger: {
                    trigger: quoteRef.current,
                    start: 'top 80%',
                },
            }
        );
    }, []);

    return (
        <MainLayout>
            {/* 英雄区 */}
            <HeroSection
                heroRef={heroRef}
                topArticles={topArticles}
                topModels={topModels}
            />

            {/* 特色功能区域 */}
            <FeatureSection featureRef={featureRef} />

            {/* 最新文章区域 */}
            <ArticleSection
                articleRef={articleRef}
                topArticles={topArticles}
                loading={loading}
                error={error}
            />

            {/* 精选文章横幅 */}
            <FeaturedArticleSection featuredArticles={featuredArticles} />

            {/* 3D模型展示区 */}
            <ModelSection
                modelRef={modelRef}
                topModels={topModels}
                loading={loading}
                error={error}
            />

            {/* 引言区 */}
            <QuoteSection quoteRef={quoteRef} />

            {/* 呼吁行动区 */}
            <CallToActionSection />
        </MainLayout>
    );
};

export default HomePage;