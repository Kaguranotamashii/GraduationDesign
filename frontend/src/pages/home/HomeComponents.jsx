// HomeComponents.jsx
import React from 'react';
import { Link } from 'react-router-dom';

// 英雄区组件
export const HeroSection = ({ topArticles, topModels, heroRef }) => (
    <section
        ref={heroRef}
        className="relative min-h-[100vh] flex items-center justify-center"
    >
        {/* 背景图片 - 使用本地图片 */}
        <div className="absolute inset-0 overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('/images/swiper/1.jpg')",
                    filter: "brightness(0.7)"
                }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60"></div>
        </div>

        {/* 主要内容区 */}
        <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center">
                {/* 中心内容区 */}
                <div className="text-center max-w-4xl">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
                        <span className="block text-yellow-500 font-serif">古建筑</span>
                        <span className="block mt-3 font-normal text-4xl md:text-5xl">数字新生</span>
                    </h1>
                    <div className="w-24 h-1 bg-red-700 mx-auto mb-8"></div>
                    <p className="text-xl md:text-2xl text-gray-200 leading-relaxed mb-12 px-4">
                        探索中国传统建筑的瑰丽之美，见证千年工艺与现代科技的完美结合
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link
                            to="/map"
                            className="px-8 py-4 bg-red-800 text-white font-medium rounded-none hover:bg-red-700 transition-all duration-300 flex items-center justify-center group"
                        >
                            探索地图
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                        <Link
                            to="/articles"
                            className="px-8 py-4 bg-transparent text-white border-2 border-yellow-600 font-medium rounded-none hover:bg-yellow-600 hover:bg-opacity-20 transition-all duration-300"
                        >
                            浏览文章
                        </Link>
                    </div>
                </div>

                {/* 数据统计卡片 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full max-w-3xl">
                    <div className="text-center p-4 border-t-4 border-red-700 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm">
                        <div className="text-3xl font-bold text-yellow-500 counting-number mb-1">
                            {topArticles.length || '0'}+
                        </div>
                        <div className="text-gray-300 text-sm">精选文章</div>
                    </div>
                    <div className="text-center p-4 border-t-4 border-yellow-600 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm">
                        <div className="text-3xl font-bold text-yellow-500 counting-number mb-1">
                            {topModels.length || '0'}+
                        </div>
                        <div className="text-gray-300 text-sm">3D模型</div>
                    </div>
                    <div className="text-center p-4 border-t-4 border-red-700 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm">
                        <div className="text-3xl font-bold text-yellow-500 counting-number mb-1">
                            {(topArticles.reduce((sum, article) => sum + article.views, 0) || 0).toLocaleString()}+
                        </div>
                        <div className="text-gray-300 text-sm">内容浏览</div>
                    </div>
                </div>
            </div>
        </div>

        {/* 底部装饰 - 简洁线条 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-800 via-yellow-600 to-red-800"></div>
    </section>
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
                    imageUrl="https://images.unsplash.com/photo-1590074072786-a66914d668f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
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
                    imageUrl="https://images.unsplash.com/photo-1600001833650-d92ce8fef7c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
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
                    imageUrl="https://images.unsplash.com/photo-1578169153217-54730cdb0913?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                />
            </div>
        </div>

        {/* 添加视差效果的脚本，使用CSS变量控制视差速度 */}
        <script dangerouslySetInnerHTML={{
            __html: `
        document.addEventListener('DOMContentLoaded', function() {
          // 保存初始背景位置
          const section = document.querySelector('section[style*="backgroundImage"]');
          let lastScrollY = window.scrollY;
          let ticking = false;
          
          // 监听滚动事件
          window.addEventListener('scroll', function() {
            lastScrollY = window.scrollY;
            
            if (!ticking) {
              window.requestAnimationFrame(function() {
                // 视差系数，数值越大视差效果越明显（负值会让背景向相反方向移动）
                const parallaxSpeed = 5; // 高速视差效果
                const offset = lastScrollY * parallaxSpeed;
                section.style.setProperty('--parallax-offset', offset + 'px');
                ticking = false;
              });
              
              ticking = true;
            }
          });
        });
      `
        }} />
    </section>
);







// 重新设计的特色功能卡片组件
const FeatureCard = ({ title, description, icon, imageUrl }) => (
    <div className="feature-card group overflow-hidden rounded-sm shadow-xl bg-white bg-opacity-90 hover:bg-opacity-100 transition-all duration-500">
        <div className="h-48 overflow-hidden">
            <img src={imageUrl} alt={title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
        </div>
        <div className="p-6">
            <div className="w-14 h-14 bg-red-800 rounded-full flex items-center justify-center mb-4 transform group-hover:rotate-12 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-7 h-7 text-white">
                    {icon}
                </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-red-800">{title}</h3>
            <p className="text-gray-700">{description}</p>
        </div>
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
        <div className="article-card bg-white shadow-lg overflow-hidden rounded-sm border-b-4 border-red-800 transform hover:translate-y-2 transition-all duration-300">
            <div className="h-52 overflow-hidden">
                <img
                    src={article.cover_image_url || "https://images.unsplash.com/photo-1522113221064-c394d74d7039?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1522113221064-c394d74d7039?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
                    }}
                />
            </div>
            <div className="p-6">
                <span className="inline-block px-3 py-1 bg-red-800 text-white text-xs rounded-sm mb-3">
                    {category}
                </span>
                <h3 className="text-lg font-bold mb-3 line-clamp-2">{article.title}</h3>
                <p className="text-gray-600 text-sm mb-5 line-clamp-3">{excerpt}</p>
                <Link to={`/articles/${article.id}`} className="text-red-800 font-medium hover:text-red-600 inline-flex items-center">
                    阅读更多
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

// 文章区域组件
export const ArticleSection = ({ articleRef, topArticles, loading, error }) => (
    <section
        ref={articleRef}
        className="py-20 bg-gray-50"
    >
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16 relative">
                <span className="relative text-red-800 font-serif pb-2 border-b-2 border-red-800">
                    匠心研究
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {topArticles.slice(0, 3).map((article) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            )}

            {!loading.articles && !error.articles && (
                <div className="text-center mt-14">
                    <Link
                        to="/articles"
                        className="inline-block px-8 py-3 border-2 border-red-800 text-red-800 font-medium rounded-sm hover:bg-red-800 hover:text-white transition-colors duration-300"
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
        <section className="py-16 bg-cover bg-fixed" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1529528744093-6f8abeee511d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80')" }}>
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12 text-white font-serif">
                    <span className="bg-red-800 bg-opacity-80 px-6 py-2 inline-block">
                        精选推荐
                    </span>
                </h2>

                <div className="backdrop-blur-sm bg-white bg-opacity-80 p-8 rounded-sm shadow-xl">
                    {featuredArticles[0] && (
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="md:w-1/3">
                                <img
                                    src={featuredArticles[0].cover_image_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"}
                                    alt={featuredArticles[0].title}
                                    className="w-full h-64 object-cover rounded-sm shadow-md"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
                                    }}
                                />
                            </div>
                            <div className="md:w-2/3">
                                <span className="inline-block px-3 py-1 bg-red-800 text-white text-xs rounded-sm mb-3">
                                    精选文章
                                </span>
                                <h3 className="text-2xl font-bold mb-4">{featuredArticles[0].title}</h3>
                                <p className="text-gray-700 mb-5 line-clamp-3">
                                    {featuredArticles[0].content?.replace(/<[^>]+>/g, '').substring(0, 200)}...
                                </p>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-600 text-sm flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            {featuredArticles[0].views}
                                        </span>
                                        <span className="text-gray-600 text-sm flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                            {featuredArticles[0].likes}
                                        </span>
                                    </div>
                                    <Link to={`/articles/${featuredArticles[0].id}`} className="inline-block px-5 py-2 bg-red-800 text-white rounded-sm hover:bg-red-700 transition-colors duration-300 flex items-center">
                                        阅读全文
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
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
    <div className="model-item group relative overflow-hidden rounded-sm shadow-lg transform hover:-translate-y-2 transition-all duration-300">
        <img
            src={model.image_url || "https://images.unsplash.com/photo-1552321868-3b9ca99d27ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"}
            alt={model.name}
            className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1552321868-3b9ca99d27ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
            }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-white font-bold text-lg mb-2">{model.name}</h3>
            <Link to={`/modelViewer/${model.id}`} className="text-yellow-400 inline-flex items-center hover:text-yellow-300 transition-colors">
                查看3D模型
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </Link>
        </div>
    </div>
);

// 3D模型展示区组件
export const ModelSection = ({ modelRef, topModels, loading, error }) => (
    <section
        ref={modelRef}
        className="py-20 bg-cover"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1607427293702-036707c99c04?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80')" }}
    >
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16 relative">
                <span className="relative text-white font-serif bg-red-800 px-6 py-2">
                    精选模型展示
                </span>
            </h2>

            {loading.models ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
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

            <div className="text-center mt-14">
                <Link
                    to="/map"
                    className="inline-block px-8 py-3 bg-yellow-600 text-white font-medium rounded-sm hover:bg-yellow-700 transition-all duration-300 transform hover:translate-y-1"
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
        className="py-24 bg-red-900 text-white text-center"
    >
        <div className="container mx-auto px-4 max-w-3xl">
            <div className="mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-16 h-16 text-yellow-500 mx-auto opacity-80" viewBox="0 0 975.036 975.036">
                    <path d="M925.036 57.197h-304c-27.6 0-50 22.4-50 50v304c0 27.601 22.4 50 50 50h145.5c-1.9 79.601-20.4 143.3-55.4 191.2-27.6 37.8-69.399 69.1-125.3 93.8-25.7 11.3-36.8 41.7-24.8 67.101l36 76c11.6 24.399 40.3 35.1 65.1 24.399 66.2-28.6 122.101-64.8 167.7-108.8 55.601-53.7 93.7-114.3 114.3-181.9 20.601-67.6 30.9-159.8 30.9-276.8v-239c0-27.599-22.401-50-50-50zM106.036 913.497c65.4-28.5 121-64.699 166.9-108.6 56.1-53.7 94.4-114.1 115-181.2 20.6-67.1 30.899-159.6 30.899-277.5v-239c0-27.6-22.399-50-50-50h-304c-27.6 0-50 22.4-50 50v304c0 27.601 22.4 50 50 50h145.5c-1.9 79.601-20.4 143.3-55.4 191.2-27.6 37.8-69.4 69.1-125.3 93.8-25.7 11.3-36.8 41.7-24.8 67.101l35.9 75.8c11.601 24.399 40.501 35.2 65.301 24.399z"></path>
                </svg>
            </div>
            <blockquote className="text-2xl font-serif italic mb-10 leading-relaxed">
                "古建筑是历史的见证，技艺的结晶，也是民族智慧的象征。通过数字化技术，我们得以让这些沉默的文化瑰宝重获新生，与当代人展开跨越时空的对话。"
            </blockquote>
            <div className="flex items-center justify-center">
                <div className="w-12 h-1 bg-yellow-500 mr-4"></div>
                <span className="font-medium">古建数字研究院</span>
                <div className="w-12 h-1 bg-yellow-500 ml-4"></div>
            </div>
        </div>
    </section>
);

// 呼吁行动区组件
export const CallToActionSection = () => (
    <section className="py-20 bg-cover" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518893063132-36e46dbe2428?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80')" }}>
        <div className="container mx-auto px-4 text-center max-w-2xl">
            <div className="bg-white bg-opacity-90 p-10 rounded-sm shadow-xl">
                <h2 className="text-3xl font-bold mb-6 text-red-800 font-serif">参与古建筑数字化项目</h2>
                <p className="text-gray-700 mb-8 leading-relaxed">
                    无论您是建筑爱好者、历史研究者，还是3D建模专家，都可以为中国传统建筑的数字化保护与传承贡献力量。
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Link
                        to="/auth"
                        className="px-8 py-3 bg-yellow-600 text-white font-medium rounded-sm hover:bg-yellow-700 transition-all duration-300 transform hover:translate-y-1"
                    >
                        加入我们
                    </Link>
                    <Link
                        to="/about"
                        className="px-8 py-3 bg-transparent text-red-800 border-2 border-red-800 font-medium rounded-sm hover:bg-red-800 hover:text-white transition-all duration-300 transform hover:translate-y-1"
                    >
                        了解更多
                    </Link>
                </div>
            </div>
        </div>
    </section>
);