import React, { useState, useEffect, useRef } from 'react';
import { Grid, List, Search, ChevronLeft, ChevronRight, ChevronDown, Filter, X, Tag } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AllArticlesSection = ({ articles: initialArticles, onArticleClick, featuredArticles = [] }) => {
    const [viewMode, setViewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTag, setSelectedTag] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredArticles, setFilteredArticles] = useState([]);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState({
        '中文': true,  // 默认展开中文标签
        '英文': false,
        '数字': false,
        '其他': false
    });

    const itemsPerPage = 9;

    // 初始化文章列表
    useEffect(() => {
        setFilteredArticles(Array.isArray(initialArticles) ? initialArticles : []);
    }, [initialArticles]);

    // 根据标签和搜索词筛选文章
    useEffect(() => {
        if (!Array.isArray(initialArticles)) return;

        let filtered = [...initialArticles];
        if (selectedTag) {
            filtered = filtered.filter(article => {
                const tags = Array.isArray(article.tags) ? article.tags : String(article.tags || '').split(',');
                return tags.some(tag => tag.trim() === selectedTag);
            });
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(article =>
                (article.title || '').toLowerCase().includes(term) ||
                (article.content || '').toLowerCase().includes(term)
            );
        }
        setFilteredArticles(filtered);
        setCurrentPage(1);
    }, [selectedTag, searchTerm, initialArticles]);

    // 获取所有标签并统计文章数量
    const getTagsWithCount = () => {
        if (!Array.isArray(initialArticles)) return { tags: [], counts: {} };

        const tagCounts = {};
        const tagSet = new Set();

        initialArticles.forEach(article => {
            const tags = Array.isArray(article.tags)
                ? article.tags
                : String(article.tags || '').split(',');

            tags.forEach(tag => {
                const trimmedTag = tag.trim();
                if (trimmedTag) {
                    tagSet.add(trimmedTag);
                    tagCounts[trimmedTag] = (tagCounts[trimmedTag] || 0) + 1;
                }
            });
        });

        return {
            tags: Array.from(tagSet),
            counts: tagCounts
        };
    };

    // 将标签分类（中文、英文、数字和其他）
    const categorizeTagsWithCount = () => {
        const { tags, counts } = getTagsWithCount();

        return tags.reduce((acc, tag) => {
            const firstChar = tag.charAt(0);

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

            acc[category].push({
                tag,
                count: counts[tag] || 0
            });

            return acc;
        }, {});
    };

    // 标签分类数据
    const categorizedTags = categorizeTagsWithCount();

    // 分类标签的显示顺序
    const categoryOrder = ['中文', '英文', '数字', '其他'];
    const sortedCategories = Object.keys(categorizedTags).sort(
        (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
    );

    // 切换分类的展开/折叠状态
    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    // 分页计算
    const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedArticles = filteredArticles.slice(startIndex, startIndex + itemsPerPage);

    // 日期格式化
    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('zh-CN');
        } catch {
            return '';
        }
    };

    // 获取文章图片URL
    const getImageUrl = (article) => {
        if (!article) return '/api/placeholder/400/300';
        const imageUrl = article.cover_image_url || article.cover_image || '';
        return imageUrl ? (imageUrl.startsWith('http') ? imageUrl : imageUrl.replace(/\\/g, '/')) : '/api/placeholder/400/300';
    };

    // 获取文章标签
    const getArticleTags = (article) => {
        if (!article) return [];
        return Array.isArray(article.tags) ? article.tags : String(article.tags || '').split(',').filter(tag => tag.trim());
    };

    // 按标签过滤搜索结果
    const [tagSearchTerm, setTagSearchTerm] = useState('');
    const filteredTagsBySearch = tagSearchTerm
        ? getTagsWithCount().tags.filter(tag =>
            tag.toLowerCase().includes(tagSearchTerm.toLowerCase()))
        : [];

    // 标签侧边栏组件
    const TagsSidebar = () => (
        <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="mb-4">
                <h2 className="text-lg font-medium mb-3 flex items-center">
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

            {/* 全部文章选项 */}
            <div className="mb-4">
                <Badge
                    variant={!selectedTag ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-1.5 w-full justify-between ${!selectedTag ? 'bg-red-600' : 'hover:bg-red-50'}`}
                    onClick={() => setSelectedTag('')}
                >
                    <span>全部文章</span>
                    <span className="text-xs">{initialArticles.length}</span>
                </Badge>
            </div>

            {/* 搜索结果 */}
            {tagSearchTerm && (
                <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">搜索结果</h3>
                    <div className="flex flex-col gap-2">
                        {filteredTagsBySearch.length > 0 ? (
                            filteredTagsBySearch.map(tag => {
                                const count = getTagsWithCount().counts[tag] || 0;
                                return (
                                    <Badge
                                        key={`search-${tag}`}
                                        variant={selectedTag === tag ? "default" : "outline"}
                                        className={`cursor-pointer justify-between px-4 py-1.5 ${selectedTag === tag ? 'bg-red-600' : 'hover:bg-red-50'}`}
                                        onClick={() => {
                                            setSelectedTag(tag);
                                            setTagSearchTerm('');
                                        }}
                                    >
                                        <span>{tag}</span>
                                        <span className="text-xs">{count}</span>
                                    </Badge>
                                );
                            })
                        ) : (
                            <p className="text-sm text-gray-500">没有找到相关标签</p>
                        )}
                    </div>
                </div>
            )}

            {/* 分类标签列表 */}
            {!tagSearchTerm && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {sortedCategories.map(category => {
                        const tagsInCategory = categorizedTags[category] || [];
                        if (tagsInCategory.length === 0) return null;

                        return (
                            <div key={category} className="border-t pt-4 first:border-t-0 first:pt-0">
                                <button
                                    className="flex justify-between items-center w-full text-left text-sm font-medium text-gray-700 mb-2 hover:text-red-600"
                                    onClick={() => toggleCategory(category)}
                                >
                                    <span>{category}标签 ({tagsInCategory.length})</span>
                                    <ChevronDown className={`h-4 w-4 transition-transform ${expandedCategories[category] ? 'rotate-180' : ''}`} />
                                </button>

                                {expandedCategories[category] && (
                                    <div className="flex flex-col gap-2 pl-2">
                                        {tagsInCategory.map(({ tag, count }) => (
                                            <Badge
                                                key={tag}
                                                variant={selectedTag === tag ? "default" : "outline"}
                                                className={`cursor-pointer justify-between px-4 py-1.5 ${selectedTag === tag ? 'bg-red-600' : 'hover:bg-red-50'}`}
                                                onClick={() => setSelectedTag(tag)}
                                            >
                                                <span>{tag}</span>
                                                <span className="text-xs">{count}</span>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    // 热门文章组件
    const FeaturedArticles = () => {
        if (!featuredArticles || featuredArticles.length === 0) return null;

        return (
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">热门推荐</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {featuredArticles.slice(0, 3).map(article => (
                        <Card
                            key={`featured-${article.id}`}
                            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => onArticleClick?.(article.id)}
                        >
                            <div className="relative aspect-video">
                                <img
                                    src={getImageUrl(article)}
                                    alt={article.title || '文章图片'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => e.target.src = '/api/placeholder/400/300'}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                    <h3 className="font-bold line-clamp-1">{article.title}</h3>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    };

    // 渲染网格视图
    const renderGridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedArticles.map((article) => (
                <Card
                    key={article.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => onArticleClick?.(article.id)}
                >
                    <div className="w-full">
                        <img
                            src={getImageUrl(article)}
                            alt={article.title || '文章图片'}
                            className="w-full h-48 object-cover"
                            onError={(e) => e.target.src = '/api/placeholder/400/300'}
                        />
                    </div>
                    <CardContent className="p-4">
                        <h3 className="text-lg font-bold mb-2 line-clamp-2 hover:text-red-600 transition-colors">
                            {article.title || '无标题'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">{formatDate(article.created_at)}</p>
                        <p className="text-gray-600 mb-4 line-clamp-2">{article.content || '暂无内容'}</p>
                        <div className="flex flex-wrap gap-2">
                            {getArticleTags(article).map((tag, idx) => (
                                <Badge
                                    key={`${article.id}-${tag}-${idx}`}
                                    variant="outline"
                                    className="hover:bg-red-50 hover:text-red-600 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTag(tag.trim());
                                    }}
                                >
                                    {tag.trim()}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    // 渲染列表视图
    const renderListView = () => (
        <div className="space-y-4">
            {paginatedArticles.map((article) => (
                <Card
                    key={article.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col md:flex-row"
                    onClick={() => onArticleClick?.(article.id)}
                >
                    <div className="md:w-48 h-48 overflow-hidden relative">
                        <img
                            src={getImageUrl(article)}
                            alt={article.title || '文章图片'}
                            className="w-full h-full object-cover"
                            onError={(e) => e.target.src = '/api/placeholder/400/300'}
                        />
                    </div>
                    <CardContent className="p-4 flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold line-clamp-1 hover:text-red-600 transition-colors pr-4">
                                {article.title || '无标题'}
                            </h3>
                            <p className="text-gray-600 text-sm whitespace-nowrap">{formatDate(article.created_at)}</p>
                        </div>
                        <p className="text-gray-600 mb-4 line-clamp-2">{article.content || '暂无内容'}</p>
                        <div className="flex flex-wrap gap-2">
                            {getArticleTags(article).map((tag, idx) => (
                                <Badge
                                    key={`${article.id}-${tag}-${idx}`}
                                    variant="outline"
                                    className="hover:bg-red-50 hover:text-red-600 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTag(tag.trim());
                                    }}
                                >
                                    {tag.trim()}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    // 空状态提示
    const EmptyState = () => (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-3">没有找到相关文章</h3>
            <p className="text-gray-500 mb-6">试试更换关键词或选择其他标签</p>
            <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    setSearchTerm('');
                    setSelectedTag('');
                }}
                className="bg-white"
            >
                <X className="w-4 h-4 mr-2" />
                清除筛选条件
            </Button>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            {/* 移动端筛选按钮 */}
            <div className="lg:hidden flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">文章列表</h2>
                <Button
                    variant="outline"
                    onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    className="flex items-center gap-2"
                >
                    <Filter className="w-4 h-4" />
                    筛选标签
                    {selectedTag && <Badge className="ml-1 bg-red-600">{selectedTag}</Badge>}
                </Button>
            </div>

            {/* 移动端标签侧边栏 */}
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
                        <TagsSidebar />
                    </div>
                </div>
            )}

            {/* 主内容区 - 左侧标签分类，右侧文章列表 */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* 桌面端左侧标签栏 */}
                <div className="hidden lg:block w-64 flex-shrink-0">
                    <div className="sticky top-8">
                        <TagsSidebar />
                    </div>
                </div>

                {/* 右侧文章内容区 */}
                <div className="flex-1">
                    {/* 搜索和视图切换 */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                        <h2 className="text-2xl font-bold">
                            {selectedTag ? `标签：${selectedTag}` : '全部文章'}
                        </h2>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    type="text"
                                    placeholder="搜索文章..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-1 border rounded-lg p-1 bg-white">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('grid')}
                                    className={viewMode === 'grid' ? 'bg-red-600 hover:bg-red-700' : ''}
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('list')}
                                    className={viewMode === 'list' ? 'bg-red-600 hover:bg-red-700' : ''}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* 当前筛选条件显示 */}
                    {(selectedTag || searchTerm) && (
                        <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
                            <span className="text-gray-500">筛选条件:</span>
                            {selectedTag && (
                                <Badge variant="secondary" className="flex items-center gap-1 bg-red-50 text-red-600">
                                    标签: {selectedTag}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4 p-0 ml-1 hover:bg-red-100"
                                        onClick={() => setSelectedTag('')}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                            {searchTerm && (
                                <Badge variant="secondary" className="flex items-center gap-1 bg-red-50 text-red-600">
                                    关键词: {searchTerm}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4 p-0 ml-1 hover:bg-red-100"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-gray-500 hover:text-red-600"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedTag('');
                                }}
                            >
                                清除全部
                            </Button>
                        </div>
                    )}

                    {/* 热门推荐文章 */}
                    {!selectedTag && !searchTerm && featuredArticles?.length > 0 && (
                        <FeaturedArticles />
                    )}

                    {/* 文章列表 */}
                    {paginatedArticles.length > 0 ? (
                        viewMode === 'grid' ? renderGridView() : renderListView()
                    ) : (
                        <EmptyState />
                    )}

                    {/* 分页控件 */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full w-10 h-10"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="mx-4">第 {currentPage} 页，共 {totalPages} 页</span>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full w-10 h-10"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllArticlesSection;