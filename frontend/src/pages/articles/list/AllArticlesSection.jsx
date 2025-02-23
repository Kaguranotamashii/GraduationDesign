import React, { useState, useEffect } from 'react';
import { Grid, List, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AllArticlesSection = ({ articles: initialArticles, onArticleClick }) => {
    const [viewMode, setViewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTag, setSelectedTag] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredArticles, setFilteredArticles] = useState([]);

    const itemsPerPage = 9;

    // 确保 initialArticles 是数组
    useEffect(() => {
        setFilteredArticles(Array.isArray(initialArticles) ? initialArticles : []);
    }, [initialArticles]);

    // 过滤和搜索文章
    useEffect(() => {
        if (!Array.isArray(initialArticles)) return;

        let filtered = [...initialArticles];

        // 标签筛选
        if (selectedTag) {
            filtered = filtered.filter(article => {
                const tags = Array.isArray(article.tags)
                    ? article.tags
                    : String(article.tags || '').split(',');
                return tags.some(tag => tag.trim() === selectedTag);
            });
        }

        // 搜索筛选
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(article =>
                (article.title || '').toLowerCase().includes(term) ||
                (article.content || '').toLowerCase().includes(term)
            );
        }

        setFilteredArticles(filtered);
        setCurrentPage(1); // 重置到第一页
    }, [selectedTag, searchTerm, initialArticles]);

    // 获取所有唯一标签
    const getAllTags = () => {
        if (!Array.isArray(initialArticles)) return [];

        const tagSet = new Set();
        initialArticles.forEach(article => {
            try {
                const tags = Array.isArray(article.tags)
                    ? article.tags
                    : String(article.tags || '').split(',');

                tags.forEach(tag => {
                    const trimmedTag = tag.trim();
                    if (trimmedTag) {
                        tagSet.add(trimmedTag);
                    }
                });
            } catch (error) {
                console.error('Error processing tags:', error);
            }
        });
        return Array.from(tagSet);
    };

    // 分页逻辑
    const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedArticles = filteredArticles.slice(startIndex, startIndex + itemsPerPage);

    // 格式化日期
    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('zh-CN');
        } catch (error) {
            return '';
        }
    };

    // 处理图片URL
    const getImageUrl = (article) => {
        if (!article) return '/api/placeholder/400/300';
        const imageUrl = article.cover_image_url || article.cover_image || '';
        if (!imageUrl) return '/api/placeholder/400/300';
        return imageUrl.startsWith('http') ? imageUrl : imageUrl.replace(/\\/g, '/');
    };

    // 安全地处理标签
    const getArticleTags = (article) => {
        try {
            if (!article) return [];
            if (Array.isArray(article.tags)) return article.tags;
            const tagsStr = String(article.tags || '');
            return tagsStr.split(',').filter(tag => tag.trim());
        } catch (error) {
            console.error('Error processing article tags:', error);
            return [];
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold">全部文章</h2>
                <div className="flex items-center gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            type="text"
                            placeholder="搜索文章..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 border rounded-lg p-1">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* 标签过滤器 */}
            <div className="flex flex-wrap gap-2">
                <Badge
                    variant={!selectedTag ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedTag('')}
                >
                    全部
                </Badge>
                {getAllTags().map((tag, index) => (
                    <Badge
                        key={`${tag}-${index}`}
                        variant={selectedTag === tag ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedTag(tag)}
                    >
                        {tag}
                    </Badge>
                ))}
            </div>

            {/* 文章网格/列表视图 */}
            <div className={viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }>
                {paginatedArticles.map((article) => (
                    <Card
                        key={article.id}
                        className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
                            viewMode === 'list' ? 'flex' : ''
                        }`}
                        onClick={() => onArticleClick?.(article.id)}
                    >
                        <div className={`${
                            viewMode === 'list' ? 'w-48' : 'w-full'
                        }`}>
                            <img
                                src={getImageUrl(article)}
                                alt={article.title || '文章图片'}
                                className="w-full h-48 object-cover"
                                onError={(e) => {
                                    e.target.src = '/api/placeholder/400/300';
                                }}
                            />
                        </div>
                        <CardContent className="p-4">
                            <h3 className="text-lg font-bold mb-2 line-clamp-2 hover:text-red-600 transition-colors">
                                {article.title || '无标题'}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                                {formatDate(article.created_at)}
                            </p>
                            <p className="text-gray-600 mb-4 line-clamp-2">
                                {article.content || '暂无内容'}
                            </p>
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

            {/* 分页控件 */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="mx-4">
                        第 {currentPage} 页，共 {totalPages} 页
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* 无数据提示 */}
            {paginatedArticles.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    没有找到相关文章
                </div>
            )}
        </div>
    );
};

export default AllArticlesSection;