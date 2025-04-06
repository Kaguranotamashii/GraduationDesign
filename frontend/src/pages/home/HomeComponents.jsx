// HomeComponents.jsx
import React from 'react';
import { Link } from 'react-router-dom';


export const HeroSection = ({ topArticles, topModels, heroRef }) => (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="absolute inset-0">
            <img
                src="/images/swiper/1.jpg"
                alt="Hero Background"
                className="w-full h-full object-cover opacity-50"
                onError={(e) => {
                    console.error("图片加载失败:", e);
                    e.target.src = "https://via.placeholder.com/1500x1000"; // 加载失败时显示占位图
                }}
            />
            {/* 暂时注释掉遮罩层，便于调试 */}
            {/* <div className="absolute inset-0 bg-black bg-opacity-60"></div> */}
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center hero-content">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                <span className="text-amber-400 font-serif">古建筑</span> 数字新生
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                探索中国传统建筑的瑰丽之美，见证千年工艺与现代科技的交融。
            </p>
            <div className="flex justify-center gap-6">
                <Link
                    to="/map"
                    className="px-6 py-3 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-all duration-300 flex items-center"
                >
                    探索地图
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>
                <Link
                    to="/articles"
                    className="px-6 py-3 border-2 border-amber-500 text-amber-500 rounded-md hover:bg-amber-500 hover:text-white transition-all duration-300"
                >
                    浏览文章
                </Link>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <StatCard value={`${topArticles.length || 0}+`} label="精选文章" />
                <StatCard value={`${topModels.length || 0}+`} label="3D模型" />
                <StatCard value={`${(topArticles.reduce((sum, article) => sum + article.views, 0) || 0).toLocaleString()}+`} label="内容浏览" />
            </div>
        </div>
    </section>
);

const StatCard = ({ value, label }) => (
    <div className="bg-gray-800 bg-opacity-70 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-amber-400">{value}</div>
        <div className="text-sm text-gray-300">{label}</div>
    </div>
);


export const FeatureSection = ({ featureRef }) => (
    <section
        ref={featureRef}
        className="py-20 bg-cover relative"
        style={{
            backgroundImage: "url('/images/shouyeduibitu.png')",
            backgroundAttachment: 'fixed',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            // 添加高速视差效果
            backgroundPositionY: 'calc(50% + var(--parallax-offset, 0px))',
            position: 'relative',
        }}
    >
        <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-center mb-16 relative">
        <span className="inline-block relative">
          <span className="block text-3xl font-bold text-white font-serif relative z-10 px-8 py-3">数字时代的古建新貌</span>
          <span className="absolute inset-0 bg-gradient-to-r from-red-800 to-red-700 rounded-lg shadow-lg transform -rotate-1 z-0"></span>
        </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard
                    title="互动地图"
                    description="通过交互式地图探索中国各地区标志性古代建筑，了解它们的历史与文化价值。"
                    icon={
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        />
                    }
                    imageUrl="/images/hudongditu.png"
                />
                <FeatureCard
                    title="3D模型库"
                    description="浏览高精度3D模型，从不同角度欣赏传统建筑的工艺与美学，感受古人智慧。"
                    icon={
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                        />
                    }
                    imageUrl="/images/3dmoxingku.png"
                />
                <FeatureCard
                    title="AR体验"
                    description="通过增强现实技术，将古建筑带入现代生活空间，创造沉浸式数字文化体验。"
                    icon={
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v10.764a1 1 0 01-1.447.894L15 18M5 18l-4.553-2.276A1 1 0 010 14.618V3.382a1 1 0 011.447-.894L5 4.5M5 4.5l4.553-2.276A1 1 0 0111 3.118v2.764"
                        />
                    }
                    imageUrl="/images/ar.png"
                />
            </div>
        </div>

    </section>
);

const FeatureCard = ({ title, description, icon, imageUrl }) => (
    <div className="feature-card bg-white bg-opacity-90 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* 使用固定宽高比容器，确保图片完全填充 */}
        <div className="relative w-full aspect-square overflow-hidden">
            <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x300"; // 备用图片
                }}
            />
        </div>
        <div className="p-6">
            <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-amber-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {icon}
                </svg>
                <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
    </div>
);

export const ArticleSection = ({ articleRef, topArticles, loading, error }) => (
    <section ref={articleRef} className="py-20 bg-white">
        <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12 font-serif">匠心研究</h2>
            {loading.articles ? (
                <div className="flex justify-center">
                    <div className="animate-spin w-12 h-12 border-4 border-t-amber-500 border-gray-200 rounded-full"></div>
                </div>
            ) : error.articles ? (
                <div className="text-center text-red-600">{error.articles}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {topArticles.slice(0, 3).map((article) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            )}
            <div className="text-center mt-12">
                <Link to="/articles" className="px-6 py-3 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-all duration-300">
                    查看更多文章
                </Link>
            </div>
        </div>
    </section>
);

const ArticleCard = ({ article }) => {
    const excerpt = article.content?.replace(/<[^>]+>/g, '').substring(0, 100) + '...';
    const category = article.tags?.split(',')[0].trim() || '建筑研究';

    return (
        <div className="article-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <img
                src={article.cover_image_url || 'https://via.placeholder.com/400x250'}
                alt={article.title}
                className="w-full h-48 object-cover"
            />
            <div className="p-6">
                <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded mb-3">{category}</span>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{excerpt}</p>
                <Link to={`/articles/${article.id}`} className="text-amber-500 hover:text-amber-600 font-medium flex items-center">
                    阅读更多
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export const FeaturedArticleSection = ({ featuredArticles }) => (
    featuredArticles.length > 0 && (
        <section className="py-16 bg-gray-900 text-white">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl font-bold text-center mb-12 font-serif">精选推荐</h2>
                <div className="flex flex-col md:flex-row gap-8 bg-gray-800 rounded-lg p-6">
                    <img
                        src={featuredArticles[0].cover_image_url || 'https://via.placeholder.com/400x250'}
                        alt={featuredArticles[0].title}
                        className="md:w-1/3 w-full h-64 object-cover rounded-md"
                    />
                    <div className="md:w-2/3">
                        <span className="inline-block px-2 py-1 bg-amber-500 text-white text-xs rounded mb-3">精选文章</span>
                        <h3 className="text-2xl font-semibold mb-4">{featuredArticles[0].title}</h3>
                        <p className="text-gray-300 mb-6 line-clamp-3">
                            {featuredArticles[0].content?.replace(/<[^>]+>/g, '').substring(0, 150)}...
                        </p>
                        <Link to={`/articles/${featuredArticles[0].id}`} className="px-6 py-3 bg-amber-500 rounded-md hover:bg-amber-600 transition-all duration-300">
                            阅读全文
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
);

export const ModelSection = ({ modelRef, topModels, loading, error }) => (
    <section ref={modelRef} className="py-20 bg-gray-100">
        <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12 font-serif">精选模型展示</h2>
            {loading.models ? (
                <div className="flex justify-center">
                    <div className="animate-spin w-12 h-12 border-4 border-t-amber-500 border-gray-200 rounded-full"></div>
                </div>
            ) : error.models ? (
                <div className="text-center text-red-600">{error.models}</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {topModels.map((model) => (
                        <ModelCard key={model.id} model={model} />
                    ))}
                </div>
            )}
            <div className="text-center mt-12">
                <Link to="/map" className="px-6 py-3 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-all duration-300">
                    探索更多模型
                </Link>
            </div>
        </div>
    </section>
);

const ModelCard = ({ model }) => (
    <div className="model-item bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <img
            src={model.image_url || 'https://via.placeholder.com/400x250'}
            alt={model.name}
            className="w-full h-64 object-cover"
        />
        <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{model.name}</h3>
            <Link to={`/modelViewer/${model.id}`} className="text-amber-500 hover:text-amber-600 font-medium flex items-center">
                查看3D模型
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </Link>
        </div>
    </div>
);

export const QuoteSection = ({ quoteRef }) => (
    <section ref={quoteRef} className="py-24 bg-amber-600 text-white text-center">
        <div className="container mx-auto px-6 max-w-3xl">
            <blockquote className="text-2xl md:text-3xl font-serif italic mb-8">
                “古建筑是历史的见证，通过数字化技术，我们让这些文化瑰宝与现代对话。”
            </blockquote>
            <p className="text-lg font-medium">—— 古建数字研究院</p>
        </div>
    </section>
);

export const CallToActionSection = () => (
    <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-6 font-serif">加入古建筑数字化项目</h2>
            <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
                无论你是建筑爱好者还是技术专家，一起为传统文化的传承贡献力量吧。
            </p>
            <div className="flex justify-center gap-6">
                <Link to="/auth" className="px-6 py-3 bg-amber-500 rounded-md hover:bg-amber-600 transition-all duration-300">
                    加入我们
                </Link>
                <Link to="/about" className="px-6 py-3 border-2 border-amber-500 text-amber-500 rounded-md hover:bg-amber-500 hover:text-white transition-all duration-300">
                    了解更多
                </Link>
            </div>
        </div>
    </section>
);