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

    useEffect(() => {
        gsap.fromTo(
            heroRef.current.querySelector('.hero-content'),
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out' }
        );

        gsap.from(featureRef.current.querySelectorAll('.feature-card'), {
            opacity: 0,
            y: 60,
            stagger: 0.2,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: featureRef.current, start: 'top 85%' },
        });

        gsap.from(articleRef.current.querySelectorAll('.article-card'), {
            opacity: 0,
            y: 40,
            stagger: 0.15,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: { trigger: articleRef.current, start: 'top 80%' },
        });

        gsap.from(modelRef.current.querySelectorAll('.model-item'), {
            opacity: 0,
            scale: 0.9,
            stagger: 0.2,
            duration: 1.2,
            ease: 'elastic.out(1, 0.5)',
            scrollTrigger: { trigger: modelRef.current, start: 'top 75%' },
        });

        gsap.fromTo(
            quoteRef.current,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: { trigger: quoteRef.current, start: 'top 85%' },
            }
        );
    }, []);

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