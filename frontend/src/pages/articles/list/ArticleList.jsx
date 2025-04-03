import React, { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, Eye, Heart, ChevronLeft, ChevronRight, TrendingUp, ChevronDown, Filter, X, Tag } from 'lucide-react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { searchArticlesV2, getTopArticles, getAllTags } from '@/api/articleApi';
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    // Only show a reasonable number of page buttons
    const getPageButtons = () => {
        const maxButtons = 5;
        const pages = [];

        if (totalPages <= maxButtons) {
            // If we have fewer pages than max buttons, show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Calculate which pages to show
            let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
            let endPage = Math.min(totalPages, startPage + maxButtons - 1);

            // Adjust if we're near the end
            if (endPage - startPage + 1 < maxButtons) {
                startPage = Math.max(1, endPage - maxButtons + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-3 mt-8">
            <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-full"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
            >
                <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex gap-2">
                {getPageButtons().map((page) => (
                    <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        className={`w-10 h-10 rounded-full ${
                            currentPage === page ? "bg-red-600 hover:bg-red-700" : ""
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
                className="w-10 h-10 rounded-full"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
            >
                <ChevronRight className="h-5 w-5" />
            </Button>
        </div>
    );
};

// Article card component
const ArticleCard = ({ article, showBadge = false, onClick }) => {
    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('zh-CN');
        } catch (e) {
            return '';
        }
    };

    return (
        <Card
            className="h-full overflow-hidden rounded-xl cursor-pointer bg-white border border-gray-100"
            onClick={() => onClick(article.id)}
        >
            <div className="aspect-[16/9] relative overflow-hidden">
                <img
                    src={article.cover_image_url || '/api/placeholder/400/300'}
                    alt={article.title}
                    className="w-full h-full object-cover"
                />
                {showBadge && article.is_featured && (
                    <Badge className="absolute top-3 right-3 bg-red-500 px-3 py-1 text-sm">精选</Badge>
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

                <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-tight">
                    {article.title}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {article.content}
                </p>

                {article.tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {typeof article.tags === 'string' ?
                            article.tags.split(',').map((tag, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className="bg-red-50 text-red-600"
                                >
                                    {tag.trim()}
                                </Badge>
                            )) :
                            article.tags.map((tag, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className="bg-red-50 text-red-600"
                                >
                                    {tag}
                                </Badge>
                            ))
                        }
                    </div>
                )}
            </CardContent>

            <CardFooter className="px-6 py-4 bg-gray-50 flex justify-between items-center border-t border-gray-100">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>{article.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Heart className={`w-4 h-4 ${article.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
                        <span>{article.likes || 0}</span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                >
                    阅读全文
                </Button>
            </CardFooter>
        </Card>
    );
};

// Top article card component
const TopArticleCard = ({ article, onClick }) => {
    return (
        <Card
            className="cursor-pointer rounded-xl overflow-hidden border-0"
            onClick={() => onClick(article.id)}
        >
            <div className="relative aspect-video overflow-hidden">
                <img
                    src={article.cover_image_url || '/api/placeholder/400/300'}
                    alt={article.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">
                        {article.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-white/80">
                        <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span>{article.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Heart className={`w-4 h-4 ${article.is_liked ? 'fill-red-400' : ''}`} />
                            <span>{article.likes || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

// Search bar component
const SearchBar = ({ onSearch }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSearch(inputValue);
            setTimeout(() => window.scrollTo({ top: 800, behavior: 'smooth' }), 100);
        }
    };

    return (
        <div className="relative max-w-2xl mx-auto w-full">
            <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入关键词后按回车搜索..."
                className="w-full pl-12 h-14 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 rounded-full backdrop-blur-sm"
            />
            <Search className="absolute left-4 top-4 w-6 h-6 text-white/60" />
            <div className="absolute right-4 top-4 text-white/60 text-sm">按回车搜索</div>
        </div>
    );
};

// Tags sidebar component
const TagsSidebar = ({ allTags, selectedTag, onTagSelect, articleCounts = {} }) => {
    const [tagSearchTerm, setTagSearchTerm] = useState('');
    const [expandedCategories, setExpandedCategories] = useState({
        '中文': true,  // 默认展开中文标签
        '英文': false,
        '数字': false,
        '其他': false
    });

    // 按首字母对标签进行分类
    const categorizedTags = allTags.reduce((acc, tag) => {
        if (!tag || typeof tag !== 'string') return acc;

        // 获取标签首字母
        const firstChar = tag.charAt(0);

        // 判断是否是汉字、字母或数字
        let category = '其他';
        if (/[\u4e00-\u9fa5]/.test(firstChar)) {
            category = '中文';
        } else if (/[a-zA-Z]/.test(firstChar)) {
            category = '英文';
        } else if (/[0-9]/.test(firstChar)) {
            category = '数字';
        }

        if (!acc[category]) {
            acc[category] = [];
        }

        // 只添加有文章计数的标签
        if (articleCounts[tag] && articleCounts[tag] > 0) {
            acc[category].push(tag);
        }

        return acc;
    }, {});

    // 过滤搜索结果 - 只包含有文章计数的标签
    const filteredTags = tagSearchTerm
        ? allTags.filter(tag =>
            tag &&
            typeof tag === 'string' &&
            tag.toLowerCase().includes(tagSearchTerm.toLowerCase()) &&
            articleCounts[tag] &&
            articleCounts[tag] > 0)
        : [];

    // 切换分类的展开/折叠状态
    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    // 处理标签选择
    const handleTagSelect = (tag) => {
        onTagSelect(tag);
        // 清除搜索条件
        setTagSearchTerm('');
    };

    // 标签显示顺序
    const categoryOrder = ['中文', '英文', '数字', '其他'];
    const sortedCategories = Object.keys(categorizedTags)
        .filter(category => categorizedTags[category].length > 0) // 只显示有标签的分类
        .sort((a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b));

    return (
        <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="mb-6">
                <h2 className="text-lg font-bold mb-4 flex items-center">
                    <Tag className="w-5 h-5 mr-2 text-red-500" />
                    标签分类
                </h2>
                <div className="relative">
                    <Input
                        type="text"
                        placeholder="搜索标签..."
                        value={tagSearchTerm}
                        onChange={(e) => setTagSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    {tagSearchTerm && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                            onClick={() => setTagSearchTerm('')}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* 全部标签选项 */}
            <div className="mb-4">
                <Badge
                    variant={selectedTag === 'all' ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-1.5 w-full justify-between ${selectedTag === 'all' ? 'bg-red-600' : 'hover:bg-red-50'}`}
                    onClick={() => handleTagSelect('all')}
                >
                    <span>全部文章</span>
                    {articleCounts['all'] > 0 && <span className="text-xs ml-1">({articleCounts['all']})</span>}
                </Badge>
            </div>

            {/* 搜索结果 */}
            {tagSearchTerm && (
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">搜索结果</h3>
                    <div className="flex flex-col gap-2">
                        {filteredTags.length > 0 ? (
                            filteredTags.map(tag => (
                                <Badge
                                    key={tag}
                                    variant={selectedTag === tag ? "default" : "outline"}
                                    className={`cursor-pointer justify-between px-4 py-1.5 ${selectedTag === tag ? 'bg-red-600' : 'hover:bg-red-50'}`}
                                    onClick={() => handleTagSelect(tag)}
                                >
                                    <span>{tag}</span>
                                    <span className="text-xs ml-1">({articleCounts[tag]})</span>
                                </Badge>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">没有找到相关标签</p>
                        )}
                    </div>
                </div>
            )}

            {/* 分类标签列表 */}
            {!tagSearchTerm && sortedCategories.length > 0 && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {sortedCategories.map(category => (
                        <div key={category} className="border-t pt-4 first:border-t-0 first:pt-0">
                            <button
                                className="flex justify-between items-center w-full text-left text-sm font-medium text-gray-700 mb-2 hover:text-red-600"
                                onClick={() => toggleCategory(category)}
                            >
                                <span>{category}标签 ({categorizedTags[category].length})</span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${expandedCategories[category] ? 'rotate-180' : ''}`} />
                            </button>

                            {expandedCategories[category] && (
                                <div className="flex flex-col gap-2 pl-2">
                                    {categorizedTags[category]
                                        .sort((a, b) => a.localeCompare(b, 'zh-CN')) // 按字母顺序排序
                                        .map(tag => (
                                            <Badge
                                                key={tag}
                                                variant={selectedTag === tag ? "default" : "outline"}
                                                className={`cursor-pointer justify-between px-4 py-1.5 ${selectedTag === tag ? 'bg-red-600' : 'hover:bg-red-50'}`}
                                                onClick={() => handleTagSelect(tag)}
                                            >
                                                <span>{tag}</span>
                                                <span className="text-xs ml-1">({articleCounts[tag]})</span>
                                            </Badge>
                                        ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!tagSearchTerm && sortedCategories.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">暂无标签数据</p>
            )}
        </div>
    );
};

// Main ArticleList component
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
    const [tagArticleCounts, setTagArticleCounts] = useState({ all: 0 });
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Fetch tags - completely rewritten to properly handle comma-separated tags
    const fetchTags = useCallback(async () => {
        try {
            const response = await getAllTags();
            if (response?.code === 200 && response.data) {
                // 获取原始标签数据
                const rawTags = response.data;
                const uniqueTags = new Set();

                // 处理可能存在的逗号分隔的标签字符串
                rawTags.forEach(tagItem => {
                    // 跳过无效标签
                    if (!tagItem) return;

                    // 如果是逗号分隔的字符串，拆分处理
                    if (typeof tagItem === 'string' && tagItem.includes(',')) {
                        const splitTags = tagItem.split(',')
                            .map(t => t.trim())
                            .filter(Boolean);

                        splitTags.forEach(tag => uniqueTags.add(tag));
                    }
                    // 处理单个标签
                    else if (typeof tagItem === 'string') {
                        const trimmedTag = tagItem.trim();
                        if (trimmedTag) uniqueTags.add(trimmedTag);
                    }
                });

                const processedTags = [...uniqueTags].sort((a, b) => a.localeCompare(b, 'zh-CN'));
                console.log("Processed tags:", processedTags);

                setAllTags(processedTags);
            }
        } catch (err) {
            console.error('Error fetching tags:', err);
        }
    }, []);

    // Fetch top articles
    const fetchTopArticles = useCallback(async () => {
        try {
            const response = await getTopArticles();
            if (response?.code === 200 && response.data) {
                setState(prev => ({ ...prev, topArticles: response.data.slice(0, 5) }));
            }
        } catch (err) {
            console.error('Error fetching top articles:', err);
        }
    }, []);

    // Fetch articles with filtering and pagination - completely rewritten to properly handle tag counting
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
            console.log("Fetching articles with params:", searchParams);

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

                // 只有在全部文章视图下才计算标签计数
                if (currentTag === 'all' && !searchTerm) {
                    // 尝试获取所有文章以获取准确的标签计数
                    let allArticles = response.data.results || [];

                    // 如果分页且有更多文章，尝试获取所有文章
                    if (response.data.count > pagination.pageSize) {
                        try {
                            // 直接请求大量文章可能导致性能问题，可以考虑限制一个合理的数量
                            const maxArticles = Math.min(1000, response.data.count);
                            const fullResponse = await searchArticlesV2({
                                page: 1,
                                page_size: maxArticles,
                                status: 'published'
                            });

                            if (fullResponse?.code === 200 && fullResponse.data?.results) {
                                allArticles = fullResponse.data.results;
                                console.log(`Retrieved ${allArticles.length} articles for tag counting`);
                            }
                        } catch (err) {
                            console.error('Error fetching all articles for tag counting:', err);
                        }
                    }

                    // 使用改进的计数逻辑计算标签数量
                    calculateTagCounts(allArticles);
                }
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

    // Calculate tag article counts - completely rewritten to properly handle comma-separated tags
    const calculateTagCounts = (articles) => {
        // 首先计算总文章数
        const counts = { all: articles.length };

        // 创建一个临时集合，用于存储每个标签出现的文章ID，避免重复计数
        const tagArticleMap = new Map();

        // 遍历文章，提取并分割标签
        articles.forEach(article => {
            if (!article.id || !article.tags) return;

            let tagList = [];

            // 处理标签字符串 - 格式如 "古典风格,佛塔,宋代建筑"
            if (typeof article.tags === 'string') {
                // 分割字符串并清理每个标签
                tagList = article.tags.split(',').map(tag => tag.trim()).filter(Boolean);
            }
            // 处理标签数组
            else if (Array.isArray(article.tags)) {
                tagList = article.tags.map(tag =>
                    typeof tag === 'string' ? tag.trim() : String(tag)
                ).filter(Boolean);
            }

            // 为每个标签记录当前文章ID
            tagList.forEach(tag => {
                if (!tagArticleMap.has(tag)) {
                    tagArticleMap.set(tag, new Set());
                }
                tagArticleMap.get(tag).add(article.id);
            });
        });

        // 计算每个标签的文章数量（基于唯一文章ID）
        tagArticleMap.forEach((articleIds, tag) => {
            counts[tag] = articleIds.size;
        });

        // 确保每个已知标签都有计数，即使为0
        allTags.forEach(tag => {
            if (tag && typeof tag === 'string' && tag.trim() && !counts[tag.trim()]) {
                counts[tag.trim()] = 0;
            }
        });

        console.log("Tag counts calculated:", counts);
        console.log("Tag-article mapping:", Object.fromEntries([...tagArticleMap].map(([tag, ids]) => [tag, [...ids]])));

        setTagArticleCounts(counts);
    };

    // Initialize data
    useEffect(() => {
        Promise.all([fetchTags(), fetchTopArticles()]);
    }, [fetchTags, fetchTopArticles]);

    // Fetch articles when search or tag changes
    useEffect(() => {
        fetchArticles(1);
    }, [fetchArticles, searchTerm, currentTag]);

    // Event handlers
    const handleSearch = useCallback((searchValue) => {
        setSearchTerm(searchValue);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
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
        setIsMobileSidebarOpen(false);
    }, []);

    // Error display
    const renderError = () => state.error && (
        <div className="text-center p-4 mb-4 bg-red-50 text-red-600 rounded-lg">
            {state.error}
        </div>
    );

    // Empty state
    const renderEmptyState = () => !state.loading && state.articles.length === 0 && (
        <div className="text-center py-16 bg-gray-50/50 rounded-xl">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-3">暂无相关文章</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">试试更换关键词或选择其他标签重新搜索</p>
            <Button
                variant="outline"
                onClick={() => {
                    setSearchTerm('');
                    setCurrentTag('all');
                }}
                className="bg-white"
            >
                <X className="w-4 h-4 mr-2" />
                清除筛选条件
            </Button>
        </div>
    );

    // Loading skeleton
    const renderLoadingSkeleton = () => state.loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, index) => (
                <div key={`skeleton-${index}`} className="rounded-xl overflow-hidden bg-gray-100">
                    <div className="aspect-[16/9] bg-gray-200" />
                    <div className="p-6 space-y-4">
                        <div className="h-4 bg-gray-200 rounded-md w-1/3" />
                        <div className="h-6 bg-gray-200 rounded-md w-3/4" />
                        <div className="h-4 bg-gray-200 rounded-md w-full" />
                        <div className="flex gap-2">
                            <div className="h-6 bg-gray-200 rounded-full w-16" />
                            <div className="h-6 bg-gray-200 rounded-full w-20" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <div className="relative h-[650px] text-white shadow-xl overflow-hidden">
                <div className="absolute inset-0">
                    <img src="/images/article.png" alt="Background" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 backdrop-blur-[2px]" />
                </div>
                <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center relative z-10">
                    <h1 className="text-6xl md:text-7xl font-bold mb-8 text-center">
                        探索<span className="text-red-400 drop-shadow">建筑文化</span>的魅力
                    </h1>

                    <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-3xl text-center leading-relaxed">
                        发现独特的建筑故事，感受时光与空间的对话
                    </p>

                    <SearchBar onSearch={handleSearch} />

                    <Button
                        variant="outline"
                        className="mt-8 text-white border-white/30 hover:bg-white/20"
                        onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
                    >
                        <ChevronDown className="w-5 h-5 mr-2" /> 浏览文章
                    </Button>
                </div>
            </div>

            {/* 主内容区 - 左侧标签，右侧文章列表 */}
            <div className="container mx-auto px-4 py-12 -mt-28 relative z-10">
                {/* 移动端筛选按钮 */}
                <div className="lg:hidden flex justify-between items-center mb-6">
                    <Button
                        variant="outline"
                        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                        className="flex items-center gap-2 bg-white"
                    >
                        <Filter className="w-4 h-4" />
                        标签筛选
                        {currentTag !== 'all' && <Badge className="ml-1 bg-red-600">{currentTag}</Badge>}
                    </Button>
                </div>

                {/* 移动端侧边栏 */}
                {isMobileSidebarOpen && (
                    <div className="lg:hidden mb-8">
                        <div className="bg-white rounded-xl shadow-md p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold">标签筛选</h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsMobileSidebarOpen(false)}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                            <TagsSidebar
                                allTags={allTags}
                                selectedTag={currentTag}
                                onTagSelect={handleTagChange}
                                articleCounts={tagArticleCounts}
                            />
                        </div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* 桌面端左侧标签栏 */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-8">
                            <TagsSidebar
                                allTags={allTags}
                                selectedTag={currentTag}
                                onTagSelect={handleTagChange}
                                articleCounts={tagArticleCounts}
                            />
                        </div>
                    </div>

                    {/* 右侧文章内容区 */}
                    <div className="flex-1">
                        {/* 热门文章 */}
                        {!state.loading && state.topArticles?.length > 0 && pagination.currentPage === 1 && currentTag === 'all' && !searchTerm && (
                            <div className="mb-10">
                                <div className="bg-white rounded-2xl shadow-xl p-8">
                                    <div className="flex items-center mb-8">
                                        <TrendingUp className="w-7 h-7 text-red-500 mr-3" />
                                        <h2 className="text-3xl font-bold">热门推荐</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {state.topArticles.slice(0, 3).map((article) => (
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

                        {/* 文章列表 */}
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold flex items-center">
                                    {currentTag !== 'all' ? (
                                        <>
                                            <span className="mr-2">标签:</span>
                                            <Badge className="px-3 py-1.5 text-base bg-red-600">{currentTag}</Badge>
                                        </>
                                    ) : searchTerm ? (
                                        <>
                                            <span className="mr-2">搜索:</span>
                                            <Badge className="px-3 py-1.5 text-base bg-red-600">{searchTerm}</Badge>
                                        </>
                                    ) : (
                                        '全部文章'
                                    )}
                                </h2>

                                {(currentTag !== 'all' || searchTerm) && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setCurrentTag('all');
                                            setSearchTerm('');
                                        }}
                                        className="flex items-center gap-1"
                                    >
                                        <X className="w-4 h-4" />
                                        清除筛选
                                    </Button>
                                )}
                            </div>

                            {renderError()}
                            {renderLoadingSkeleton()}

                            {!state.loading && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {state.articles.map((article) => (
                                        <ArticleCard
                                            key={article.id}
                                            article={article}
                                            showBadge={true}
                                            onClick={handleArticleClick}
                                        />
                                    ))}
                                </div>
                            )}

                            {renderEmptyState()}

                            {pagination.totalPages > 1 && !state.loading && state.articles.length > 0 && (
                                <Pagination
                                    currentPage={pagination.currentPage}
                                    totalPages={pagination.totalPages}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ArticleList;