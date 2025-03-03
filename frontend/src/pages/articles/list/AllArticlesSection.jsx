import React, { useState, useEffect, useRef } from 'react';
import { Grid, List, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const AllArticlesSection = ({ articles: initialArticles, onArticleClick }) => {
    const [viewMode, setViewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTag, setSelectedTag] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredArticles, setFilteredArticles] = useState([]);
    const articlesRef = useRef(null);
    const tagsRef = useRef(null);

    const itemsPerPage = 9;

    useEffect(() => {
        setFilteredArticles(Array.isArray(initialArticles) ? initialArticles : []);
    }, [initialArticles]);

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

    const getAllTags = () => {
        if (!Array.isArray(initialArticles)) return [];
        const tagSet = new Set();
        initialArticles.forEach(article => {
            const tags = Array.isArray(article.tags) ? article.tags : String(article.tags || '').split(',');
            tags.forEach(tag => tag.trim() && tagSet.add(tag.trim()));
        });
        return Array.from(tagSet);
    };

    const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedArticles = filteredArticles.slice(startIndex, startIndex + itemsPerPage);

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('zh-CN');
        } catch {
            return '';
        }
    };

    const getImageUrl = (article) => {
        if (!article) return '/api/placeholder/400/300';
        const imageUrl = article.cover_image_url || article.cover_image || '';
        return imageUrl ? (imageUrl.startsWith('http') ? imageUrl : imageUrl.replace(/\\/g, '/')) : '/api/placeholder/400/300';
    };

    const getArticleTags = (article) => {
        if (!article) return [];
        return Array.isArray(article.tags) ? article.tags : String(article.tags || '').split(',').filter(tag => tag.trim());
    };

    // GSAP Animations with ScrollTrigger
    useEffect(() => {
        if (!articlesRef.current) return;

        const cards = articlesRef.current.children;
        gsap.fromTo(cards,
            { y: 100, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: articlesRef.current,
                    start: "top 80%",
                    toggleActions: "play none none reset",
                },
            }
        );

        // Parallax effect for images within cards
        Array.from(cards).forEach(card => {
            const img = card.querySelector('img');
            if (img) {
                gsap.to(img, {
                    yPercent: 20, // Move image slower than scroll
                    ease: "none",
                    scrollTrigger: {
                        trigger: card,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true, // Links animation to scroll position
                    },
                });
            }
        });

        // Animate tags
        if (tagsRef.current) {
            gsap.fromTo(tagsRef.current.children,
                { x: -20, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: tagsRef.current,
                        start: "top 90%",
                    },
                }
            );
        }
    }, [paginatedArticles]);

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
                        <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
                            <Grid className="h-4 w-4" />
                        </Button>
                        <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div ref={tagsRef} className="flex flex-wrap gap-2">
                <Badge variant={!selectedTag ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedTag('')}>
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

            <div ref={articlesRef} className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                {paginatedArticles.map((article) => (
                    <Card
                        key={article.id}
                        className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${viewMode === 'list' ? 'flex' : ''}`}
                        onClick={() => onArticleClick?.(article.id)}
                    >
                        <div className={`${viewMode === 'list' ? 'w-48' : 'w-full'}`}>
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

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="mx-4">第 {currentPage} 页，共 {totalPages} 页</span>
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {paginatedArticles.length === 0 && (
                <div className="text-center py-12 text-gray-500">没有找到相关文章</div>
            )}
        </div>
    );
};

export default AllArticlesSection;