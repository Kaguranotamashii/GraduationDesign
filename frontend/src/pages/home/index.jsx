import React, { useEffect, useRef, useState } from 'react';
import MainLayout from '@/layout/MainLayout.jsx';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getTopArticles, getFeaturedArticles } from '@/api/articleApi';
import { getAllModels } from '@/api/builderApi';
import {
    HeroSection,
    FeatureSection,
    ArticleSection,
    FeaturedArticleSection,
    ModelSection,
    QuoteSection,
    CallToActionSection,
} from './HomeComponents';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
    const heroRef = useRef(null);
    const featureRef = useRef(null);
    const articleRef = useRef(null);
    const modelRef = useRef(null);
    const quoteRef = useRef(null);

    const [topArticles, setTopArticles] = useState([]);
    const [featuredArticles, setFeaturedArticles] = useState([]);
    const [topModels, setTopModels] = useState([]);
    const [loading, setLoading] = useState({ articles: true, models: true });
    const [error, setError] = useState({ articles: null, models: null });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const topArticlesResponse = await getTopArticles();
                setTopArticles(topArticlesResponse.data || []);
                const featuredArticlesResponse = await getFeaturedArticles();
                setFeaturedArticles(featuredArticlesResponse.data?.results || []);
                setLoading((prev) => ({ ...prev, articles: false }));
            } catch (err) {
                console.error('获取文章数据失败:', err);
                setError((prev) => ({ ...prev, articles: '获取文章数据失败' }));
                setLoading((prev) => ({ ...prev, articles: false }));
            }

            try {
                const modelsResponse = await getAllModels();
                setTopModels((modelsResponse.data || []).slice(0, 4));
                setLoading((prev) => ({ ...prev, models: false }));
            } catch (err) {
                console.error('获取模型数据失败:', err);
                setError((prev) => ({ ...prev, models: '获取模型数据失败' }));
                setLoading((prev) => ({ ...prev, models: false }));
            }
        };
        fetchData();
    }, []);

    // 移除了包含 GSAP 代码的 useEffect

    return (
        <MainLayout>
            <HeroSection heroRef={heroRef} topArticles={topArticles} topModels={topModels} />
            <FeatureSection featureRef={featureRef} />
            <ArticleSection articleRef={articleRef} topArticles={topArticles} loading={loading} error={error} />
            <FeaturedArticleSection featuredArticles={featuredArticles} />
            <ModelSection modelRef={modelRef} topModels={topModels} loading={loading} error={error} />
            <QuoteSection quoteRef={quoteRef} />
            <CallToActionSection />
        </MainLayout>
    );
};

export default HomePage;