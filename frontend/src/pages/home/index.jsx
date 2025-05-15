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
                console.log("topArticlesResponse", topArticlesResponse)
                setTopArticles(topArticlesResponse.data.results || topArticlesResponse.data || []);
                const featuredArticlesResponse = await getFeaturedArticles();
                console.log("featuredArticlesResponse", featuredArticlesResponse)
                setFeaturedArticles(featuredArticlesResponse.results || featuredArticlesResponse.data || []);
                setLoading((prev) => ({ ...prev, articles: false }));
            } catch (err) {
                console.error('Error fetching articles:', err);
                setError((prev) => ({ ...prev, articles: 'Failed to fetch articles' }));
                setLoading((prev) => ({ ...prev, articles: false }));
            }

            try {
                const modelsResponse = await getAllModels();
                setTopModels((modelsResponse.data || []).slice(0, 4));
                setLoading((prev) => ({ ...prev, models: false }));
            } catch (err) {
                console.error('Error fetching models:', err);
                setError((prev) => ({ ...prev, models: 'Failed to fetch models' }));
                setLoading((prev) => ({ ...prev, models: false }));
            }
        };
        fetchData();
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