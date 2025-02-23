import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Calendar, Eye, Heart, ChevronLeft, ChevronRight, TrendingUp, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { searchArticlesV2, getTopArticles, getAllTags } from '@/api/articleApi';
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

// 改进的分页组件
const Pagination = ({ currentPage, totalPages, onPageChange }) => (
    <div className="flex items-center justify-center gap-3 mt-16">
        <Button
            variant="outline"
            size="icon"
            className="w-10 h-10 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
        >
            <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    className={`w-10 h-10 rounded-full ${
                        currentPage === page
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "hover:bg-blue-50 hover:text-blue-600"
                    }`}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </Button>
            ))}
        </div>

        <Button
            variant="outline"
            size="icon"
            className="w-10 h-10 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
        >
            <ChevronRight className="h-5 w-5" />
        </Button>
    </div>
);

// 改进的文章卡片组件
const ArticleCard = React.memo(({ article, showBadge = false, onClick }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('zh-CN');
    };

    return (
        <Card
            className="group hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white overflow-hidden rounded-xl"
            onClick={() => onClick(article.id)}
        >
            <div className="aspect-[16/10] relative overflow-hidden">
                <img
                    src={article.cover_image_url || '/api/placeholder/400/300'}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {showBadge && article.is_featured && (
                    <Badge className="absolute top-3 right-3 bg-blue-500/90 backdrop-blur-sm px-3 py-1 text-sm">
                        精选
                    </Badge>
                )}
            </div>
            <CardContent className="p-6">
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(article.created_at)}</span>
                    {article.builder_name && (
                        <>
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            <span>{article.builder_name}</span>
                        </>
                    )}
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                    {article.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {article.content}
                </p>

                {article.tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {article.tags.split(',').map((tag, index) => (
                            <Badge
                                key={index}
                                variant="secondary"
                                className="bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            >
                                {tag.trim()}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter className="px-6 py-4 bg-gray-50 flex justify-between items-center border-t border-gray-100">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>{article.views}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Heart className={`w-4 h-4 transition-colors ${article.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
                        <span>{article.likes}</span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                >
                    阅读全文
                </Button>
            </CardFooter>
        </Card>
    );
});

// 热门文章卡片组件
const TopArticleCard = ({ article, onClick }) => (
    <Card
        className="group cursor-pointer hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden"
        onClick={() => onClick(article.id)}
    >
        <div className="relative aspect-[4/3] overflow-hidden">
            <img
                src={article.cover_image_url || '/api/placeholder/400/300'}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-200 transition-colors">
                    {article.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-white/80">
                    <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>{article.views}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Heart className={`w-4 h-4 ${article.is_liked ? 'fill-red-400' : ''}`} />
                        <span>{article.likes}</span>
                    </div>
                </div>
            </div>
        </div>
    </Card>
);

// 改进的搜索组件
const SearchBar = ({ onSearch }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSearch(inputValue);
            // 滚动到文章列表
            setTimeout(() => {
                window.scrollTo({
                    top: 990,
                    behavior: 'smooth'
                });
            }, 100);
        }
    };

    return (
        <div className="relative max-w-2xl mx-auto">
            <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入关键词后按回车搜索..."
                className="w-full pl-12 h-14 bg-white/20 border-white/30 text-white
                          placeholder:text-white/60 focus:bg-white/30 rounded-full
                          backdrop-blur-sm focus:ring-2 focus:ring-blue-400
                          focus:border-transparent"
            />
            <Search className="absolute left-4 top-4 w-6 h-6 text-white/60" />
            <div className="absolute right-4 top-4 text-white/60 text-sm">
                按回车搜索
            </div>
        </div>
    );
};

// 主组件
const ArticleList = () => {
    const [state, setState] = useState({
        articles: [],
        topArticles: [],
        loading: true,
        error: null
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentTag, setCurrentTag] = useState('all');
    const [allTags, setAllTags] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        pageSize: 9
    });

    // 获取所有标签
    const fetchTags = useCallback(async () => {
        try {
            const response = await getAllTags();
            if (response?.code === 200 && response.data) {
                setAllTags(response.data);
            }
        } catch (err) {
            console.error('Error fetching tags:', err);
        }
    }, []);

    // 获取热门文章
    const fetchTopArticles = useCallback(async () => {
        try {
            const response = await getTopArticles();
            if (response?.code === 200 && response.data) {
                setState(prev => ({
                    ...prev,
                    topArticles: response.data.slice(0, 5)
                }));
            }
        } catch (err) {
            console.error('Error fetching top articles:', err);
        }
    }, []);

    // 获取文章列表
    const fetchArticles = useCallback(async (page = 1) => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const searchParams = {
                page,
                page_size: pagination.pageSize,
                title: searchTerm,
                tags: currentTag !== 'all' ? currentTag : undefined,
                status: 'published'
            };

            const response = await searchArticlesV2(searchParams);

            if (response?.code === 200 && response.data) {
                setState(prev => ({
                    ...prev,
                    articles: response.data.results || [],
                    loading: false
                }));

                setPagination(prev => ({
                    ...prev,
                    currentPage: page,
                    totalPages: Math.ceil(response.data.count / pagination.pageSize)
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    error: '获取文章列表失败',
                    loading: false,
                    articles: []
                }));
            }
        } catch (err) {
            console.error('Error fetching articles:', err);
            setState(prev => ({
                ...prev,
                error: '获取文章列表失败，请稍后重试',
                loading: false,
                articles: []
            }));
        }
    }, [searchTerm, currentTag, pagination.pageSize]);

    // 初始化数据
    useEffect(() => {
        const initializeData = async () => {
            await Promise.all([
                fetchTags(),
                fetchTopArticles()
            ]);
        };
        initializeData();
    }, [fetchTags, fetchTopArticles]);

    // 监听搜索和标签变化
    useEffect(() => {
        fetchArticles(1);
    }, [fetchArticles, searchTerm, currentTag]);

    const handleSearch = useCallback((searchValue) => {
        setSearchTerm(searchValue);
    }, []);

    const handleArticleClick = useCallback((articleId) => {
        window.location.href = `/articles/${articleId}`;
    }, []);

    const handlePageChange = useCallback((page) => {
        fetchArticles(page);
        window.scrollTo({ top: 800, behavior: 'smooth' });
    }, [fetchArticles]);

    const handleTagChange = useCallback((tag) => {
        setCurrentTag(tag);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, []);

    // 渲染错误提示
    const renderError = () => {
        if (!state.error) return null;
        return (
            <div className="text-center p-4 mb-4 bg-red-50 text-red-600 rounded-lg">
                {state.error}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Section with updated search */}
            <div className="relative h-[600px] text-white shadow-xl overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="/images/article.png"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 backdrop-blur-[2px]" />
                </div>

                <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center relative z-10">
                    <h1 className="text-6xl md:text-7xl font-bold mb-8 text-center">
                        探索<span className="text-blue-400 drop-shadow">建筑文化</span>的魅力
                    </h1>
                    <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-3xl text-center leading-relaxed">
                        发现独特的建筑故事，感受时光与空间的对话
                    </p>
                    <SearchBar onSearch={handleSearch} />
                    <Button
                        variant="outline"
                        className="mt-8 text-white border-white/30 hover:bg-white/20 transition-colors"
                        onClick={() => window.scrollTo({ top: 800, behavior:'smooth' })}
                    >
                        <ChevronDown className="w-5 h-5 mr-2" />
                        浏览文章
                    </Button>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="container mx-auto px-4 -mt-20 relative z-10">
                {/* Top Articles Section */}
                {!state.loading && state.topArticles?.length > 0 && (
                    <div className="mb-16">
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <div className="flex items-center mb-8">
                                <TrendingUp className="w-7 h-7 text-blue-500 mr-3" />
                                <h2 className="text-3xl font-bold">热门推荐</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                {state.topArticles.map((article) => (
                                    <TopArticleCard
                                        key={article.id}
                                        article={article}
                                        onClick={handleArticleClick}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Articles Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
                    {renderError()}

                    {/* Tags Section */}
                    <div className="mb-8">
                        <div className="flex flex-wrap gap-3">
                            <Badge
                                key="all"
                                variant={currentTag === 'all' ? "default" : "outline"}
                                className={`cursor-pointer hover:shadow-md transition-all px-6 py-2.5 text-sm ${
                                    currentTag === 'all'
                                        ? 'bg-blue-600 hover:bg-blue-700'
                                        : 'hover:bg-blue-50'
                                }`}
                                onClick={() => handleTagChange('all')}
                            >
                                全部文章
                            </Badge>
                            {allTags.map(tag => (
                                <Badge
                                    key={tag}
                                    variant={currentTag === tag ? "default" : "outline"}
                                    className={`cursor-pointer hover:shadow-md transition-all px-4 py-2 text-sm ${
                                        currentTag === tag
                                            ? 'bg-blue-600 hover:bg-blue-700'
                                            : 'hover:bg-blue-50'
                                    }`}
                                    onClick={() => handleTagChange(tag)}
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Articles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {state.articles.map(article => (
                            <ArticleCard
                                key={article.id}
                                article={article}
                                showBadge={true}
                                onClick={handleArticleClick}
                            />
                        ))}
                    </div>

                    {/* Empty State */}
                    {!state.loading && state.articles.length === 0 && (
                        <div className="text-center py-20">
                            <div className="mb-6">
                                <Search className="w-16 h-16 text-gray-300 mx-auto" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-3">
                                暂无相关文章
                            </h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                试试更换关键词或选择其他标签重新搜索
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
            </div>



            <Footer />
        </div>
    );
};

export default ArticleList;