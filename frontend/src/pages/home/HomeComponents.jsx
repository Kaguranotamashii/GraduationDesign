// HomeComponents.jsx
import React from 'react';
import { Link } from 'react-router-dom';

// 英雄区组件
export const HeroSection = ({ topArticles, topModels, heroRef }) => (
    <section
        ref={heroRef}
        className="relative min-h-[90vh] flex items-center justify-center bg-[url('/src/assets/images/ancient-architecture-bg.jpg')] bg-cover bg-center"
    >
        {/* 装饰性的卷轴元素 */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="scroll-decoration absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-4xl h-[60vh] border-t-8 border-b-8 border-yellow-600 bg-[url('/src/assets/images/rice-paper.jpg')] bg-cover bg-opacity-95 origin-top"></div>

        <div className="hero-content relative z-10 text-center px-6 py-12 max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-yellow-500 font-serif tracking-wide">
                古建筑 · 数字新生
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white">
                探索中国传统建筑的瑰丽之美与现代科技的完美结合
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link
                    to="/map"
                    className="px-8 py-3 bg-red-800 text-white font-medium rounded-sm hover:bg-red-700 transition-colors duration-300 border border-red-700"
                >
                    探索地图
                </Link>
                <Link
                    to="/articles"
                    className="px-8 py-3 bg-transparent text-white border border-yellow-600 font-medium rounded-sm hover:bg-yellow-900 hover:bg-opacity-30 transition-colors duration-300"
                >
                    浏览文章
                </Link>
            </div>
        </div>

        {/* 中式纹样装饰 */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[url('/src/assets/images/chinese-pattern.png')] bg-repeat-x opacity-70"></div>

        {/* 数字计数器 */}
        <div className="absolute bottom-20 left-0 right-0">
            <div className="container mx-auto">
                <div className="flex flex-wrap justify-center gap-8 text-center">
                    <div className="bg-black bg-opacity-70 px-6 py-4 rounded-sm">
                        <div className="text-3xl font-bold text-yellow-500 counting-number">
                            {topArticles.length || '0'}+
                        </div>
                        <div className="text-white text-sm">经典文章</div>
                    </div>
                    <div className="bg-black bg-opacity-70 px-6 py-4 rounded-sm">
                        <div className="text-3xl font-bold text-yellow-500 counting-number">
                            {topModels.length || '0'}+
                        </div>
                        <div className="text-white text-sm">3D模型</div>
                    </div>
                    <div className="bg-black bg-opacity-70 px-6 py-4 rounded-sm">
                        <div className="text-3xl font-bold text-yellow-500 counting-number">
                            {(topArticles.reduce((sum, article) => sum + article.views, 0) || 0).toLocaleString()}+
                        </div>
                        <div className="text-white text-sm">内容浏览</div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

// 特色功能组件
export const FeatureSection = ({ featureRef }) => (
    <section
        ref={featureRef}
        className="py-16 bg-[url('/src/assets/images/rice-paper-light.jpg')] bg-cover"
    >
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 relative">
        <span className="relative text-red-800 font-serif">
          数字时代的古建新貌
          <span className="absolute -bottom-2 left-0 w-full h-1 bg-red-800"></span>
        </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard
                    title="互动地图"
                    description="通过交互式地图探索中国各地区标志性古代建筑,了解它们的历史与文化价值."
                    icon={
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    }
                />

                <FeatureCard
                    title="3D模型库"
                    description="浏览高精度3D模型,从不同角度欣赏传统建筑的工艺与美学,感受古人智慧."
                    icon={
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    }
                />

                <FeatureCard
                    title="AR体验"
                    description="通过增强现实技术,将古建筑带入现代生活空间,创造沉浸式数字文化体验."
                    icon={
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v10.764a1 1 0 01-1.447.894L15 18M5 18l-4.553-2.276A1 1 0 010 14.618V3.382a1 1 0 011.447-.894L5 4.5M5 4.5l4.553-2.276A1 1 0 0111 3.118v2.764" />
                    }
                />
            </div>
        </div>
    </section>
);

// 特色功能卡片组件
const FeatureCard = ({ title, description, icon }) => (
    <div className="feature-card bg-white bg-opacity-70 p-6 rounded-sm shadow-lg border-t-4 border-yellow-600">
        <div className="w-16 h-16 bg-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-white">
                {icon}
            </svg>
        </div>
        <h3 className="text-xl font-bold text-center mb-3 text-red-800">{title}</h3>
        <p className="text-gray-700 text-center">{description}</p>
    </div>
);

// 文章卡片组件
export const ArticleCard = ({ article }) => {
    // 提取文章内容的纯文本摘要
    const textContent = article.content
        ? article.content.replace(/<[^>]+>/g, '') // 移除HTML标签
        : '';
    const excerpt = textContent.substring(0, 120) + (textContent.length > 120 ? '...' : '');

    // 提取标签的第一个作为分类显示
    const category = article.tags
        ? article.tags.split(',')[0].trim()
        : '建筑研究';

    return (
        <div className="article-card bg-white shadow-md overflow-hidden rounded-sm border border-gray-200">
            <div className="h-48 overflow-hidden">
                <img
                    src={article.cover_image_url || "/src/assets/images/default-article.jpg"}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/src/assets/images/default-article.jpg";
                    }}
                />
            </div>
            <div className="p-4">
        <span className="inline-block px-3 py-1 bg-red-800 text-white text-xs rounded-sm mb-2">
          {category}
        </span>
                <h3 className="text-lg font-bold mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{excerpt}</p>
                <Link to={`/articles/${article.id}`} className="text-red-800 font-medium hover:underline">
                    阅读更多 →
                </Link>
            </div>
        </div>
    );
};

// 文章区域组件
export const ArticleSection = ({ articleRef, topArticles, loading, error }) => (
    <section
        ref={articleRef}
        className="py-16 bg-gray-50"
    >
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 relative">
        <span className="relative text-red-800 font-serif">
          匠心研究
          <span className="absolute -bottom-2 left-0 w-full h-1 bg-red-800"></span>
        </span>
            </h2>

            {loading.articles ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
                </div>
            ) : error.articles ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error.articles}</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {topArticles.slice(0, 3).map((article) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            )}

            {!loading.articles && !error.articles && (
                <div className="text-center mt-10">
                    <Link
                        to="/articles"
                        className="inline-block px-6 py-3 border-2 border-red-800 text-red-800 font-medium rounded-sm hover:bg-red-800 hover:text-white transition-colors duration-300"
                    >
                        查看更多文章
                    </Link>
                </div>
            )}
        </div>
    </section>
);

// 精选文章区域
export const FeaturedArticleSection = ({ featuredArticles }) => (
    featuredArticles.length > 0 && (
        <section className="py-12 bg-[url('/src/assets/images/chinese-texture.jpg')] bg-cover bg-fixed">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8 text-white font-serif">
          <span className="bg-red-800 bg-opacity-80 px-6 py-2 inline-block">
            精选推荐
          </span>
                </h2>

                <div className="bg-white bg-opacity-90 p-6 rounded-sm shadow-lg">
                    {featuredArticles[0] && (
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="md:w-1/3">
                                <img
                                    src={featuredArticles[0].cover_image_url || "/src/assets/images/default-article.jpg"}
                                    alt={featuredArticles[0].title}
                                    className="w-full h-64 object-cover rounded-sm"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/src/assets/images/default-article.jpg";
                                    }}
                                />
                            </div>
                            <div className="md:w-2/3">
                <span className="inline-block px-3 py-1 bg-red-800 text-white text-xs rounded-sm mb-2">
                  精选文章
                </span>
                                <h3 className="text-2xl font-bold mb-4">{featuredArticles[0].title}</h3>
                                <p className="text-gray-700 mb-4 line-clamp-3">
                                    {featuredArticles[0].content?.replace(/<[^>]+>/g, '').substring(0, 200)}...
                                </p>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-600 text-sm">浏览量: {featuredArticles[0].views}</span>
                                        <span className="text-gray-600 text-sm">点赞数: {featuredArticles[0].likes}</span>
                                    </div>
                                    <Link to={`/articles/${featuredArticles[0].id}`} className="inline-block px-4 py-2 bg-red-800 text-white rounded-sm hover:bg-red-700 transition-colors duration-300">
                                        阅读全文
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
);

// 3D模型卡片组件
export const ModelCard = ({ model }) => (
    <div className="model-item group relative overflow-hidden rounded-sm shadow-lg">
        <img
            src={model.image_url || "/src/assets/images/default-model.jpg"}
            alt={model.name}
            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/src/assets/images/default-model.jpg";
            }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-bold text-lg">{model.name}</h3>
            <Link to={`/modelViewer/${model.id}`} className="text-yellow-400 text-sm hover:underline mt-1 inline-block">
                查看3D模型 →
            </Link>
        </div>
    </div>
);

// 3D模型展示区组件
export const ModelSection = ({ modelRef, topModels, loading, error }) => (
    <section
        ref={modelRef}
        className="py-16 bg-[url('/src/assets/images/subtle-pattern-bg.jpg')] bg-cover"
    >
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 relative">
        <span className="relative text-red-800 font-serif">
          精选模型展示
          <span className="absolute -bottom-2 left-0 w-full h-1 bg-red-800"></span>
        </span>
            </h2>

            {loading.models ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
                </div>
            ) : error.models ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error.models}</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {topModels.map((model) => (
                        <ModelCard key={model.id} model={model} />
                    ))}
                </div>
            )}

            <div className="text-center mt-10">
                <Link
                    to="/map"
                    className="inline-block px-6 py-3 bg-yellow-600 text-white font-medium rounded-sm hover:bg-yellow-700 transition-colors duration-300"
                >
                    探索更多模型
                </Link>
            </div>
        </div>
    </section>
);

// 引言区组件
export const QuoteSection = ({ quoteRef }) => (
    <section
        ref={quoteRef}
        className="py-20 bg-red-900 text-white text-center"
    >
        <div className="container mx-auto px-4 max-w-3xl">
            <div className="mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-12 h-12 text-yellow-500 mx-auto opacity-80" viewBox="0 0 975.036 975.036">
                    <path d="M925.036 57.197h-304c-27.6 0-50 22.4-50 50v304c0 27.601 22.4 50 50 50h145.5c-1.9 79.601-20.4 143.3-55.4 191.2-27.6 37.8-69.399 69.1-125.3 93.8-25.7 11.3-36.8 41.7-24.8 67.101l36 76c11.6 24.399 40.3 35.1 65.1 24.399 66.2-28.6 122.101-64.8 167.7-108.8 55.601-53.7 93.7-114.3 114.3-181.9 20.601-67.6 30.9-159.8 30.9-276.8v-239c0-27.599-22.401-50-50-50zM106.036 913.497c65.4-28.5 121-64.699 166.9-108.6 56.1-53.7 94.4-114.1 115-181.2 20.6-67.1 30.899-159.6 30.899-277.5v-239c0-27.6-22.399-50-50-50h-304c-27.6 0-50 22.4-50 50v304c0 27.601 22.4 50 50 50h145.5c-1.9 79.601-20.4 143.3-55.4 191.2-27.6 37.8-69.4 69.1-125.3 93.8-25.7 11.3-36.8 41.7-24.8 67.101l35.9 75.8c11.601 24.399 40.501 35.2 65.301 24.399z"></path>
                </svg>
            </div>
            <blockquote className="text-2xl font-serif italic mb-8">
                "古建筑是历史的见证,技艺的结晶,也是民族智慧的象征.通过数字化技术,我们得以让这些沉默的文化瑰宝重获新生,与当代人展开跨越时空的对话."
            </blockquote>
            <div className="flex items-center justify-center">
                <div className="w-10 h-1 bg-yellow-500 mr-3"></div>
                <span className="font-medium">古建数字研究院</span>
                <div className="w-10 h-1 bg-yellow-500 ml-3"></div>
            </div>
        </div>
    </section>
);

// 呼吁行动区组件
export const CallToActionSection = () => (
    <section className="py-16 bg-[url('/src/assets/images/rice-paper-light.jpg')] bg-cover">
        <div className="container mx-auto px-4 text-center max-w-2xl">
            <h2 className="text-3xl font-bold mb-6 text-red-800 font-serif">参与古建筑数字化项目</h2>
            <p className="text-gray-700 mb-8">
                无论您是建筑爱好者、历史研究者,还是3D建模专家,都可以为中国传统建筑的数字化保护与传承贡献力量.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                    to="/auth"
                    className="px-8 py-3 bg-yellow-600 text-white font-medium rounded-sm hover:bg-yellow-700 transition-colors duration-300"
                >
                    加入我们
                </Link>
                <Link
                    to="/about"
                    className="px-8 py-3 bg-transparent text-red-800 border-2 border-red-800 font-medium rounded-sm hover:bg-red-800 hover:text-white transition-colors duration-300"
                >
                    了解更多
                </Link>
            </div>
        </div>
    </section>
);