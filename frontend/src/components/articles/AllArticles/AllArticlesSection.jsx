import React, { useState, useEffect } from 'react';
import {
    Book,
    ChevronRight,
    Filter,
    Grid,
    List,
    Search,
    Clock,
    Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const AllArticlesSection = ({ articles }) => {
    const [viewMode, setViewMode] = useState('grid');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTimeframe, setSelectedTimeframe] = useState('all');

    // 筛选文章的函数
    const filterArticles = () => {
        return articles.filter(article => {
            const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
            const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                article.content.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTimeframe = () => {
                if (selectedTimeframe === 'all') return true;
                const articleDate = new Date(article.date);
                const now = new Date();
                switch (selectedTimeframe) {
                    case 'week':
                        return now - articleDate <= 7 * 24 * 60 * 60 * 1000;
                    case 'month':
                        return now - articleDate <= 30 * 24 * 60 * 60 * 1000;
                    case 'year':
                        return now - articleDate <= 365 * 24 * 60 * 60 * 1000;
                    default:
                        return true;
                }
            };
            return matchesCategory && matchesSearch && matchesTimeframe();
        });
    };

    const filteredArticles = filterArticles();
    const categories = ['all', ...new Set(articles.map(article => article.category))];

    // 常用标签
    const commonTags = ['建筑文化', '古代建筑', '文化遗产', '园林设计', '传统技艺'];

    return (
        <div className="pt-20 bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold mb-4 md:mb-0 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-600">
                        探索全部文章
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="flex bg-white rounded-lg shadow-sm p-1">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid className="w-4 h-4"/>
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="w-4 h-4"/>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* 增强的侧边栏：搜索、分类和筛选 */}
                    <div className="md:w-72 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 space-y-6">
                            {/* 搜索框 */}
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4"/>
                                    <Input
                                        type="text"
                                        placeholder="搜索文章..."
                                        className="pl-10"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                {/* 时间范围选择 */}
                                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue placeholder="选择时间范围"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">全部时间</SelectItem>
                                        <SelectItem value="week">最近一周</SelectItem>
                                        <SelectItem value="month">最近一月</SelectItem>
                                        <SelectItem value="year">最近一年</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 分类选择 */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center">
                                    <Filter className="w-5 h-5 mr-2"/>
                                    分类筛选
                                </h3>
                                <div className="space-y-2">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            className={`w-full text-left px-4 py-2 rounded-lg transition-all
                                                ${selectedCategory === category
                                                ? 'bg-red-50 text-red-600 font-medium'
                                                : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            {category === 'all' ? '全部分类' : category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 常用标签 */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">常用标签</h3>
                                <div className="flex flex-wrap gap-2">
                                    {commonTags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="outline"
                                            className="cursor-pointer hover:bg-red-50 hover:text-red-600"
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {filteredArticles.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <Search className="w-12 h-12 mx-auto"/>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-600">未找到相关文章</h3>
                                <p className="text-gray-500 mt-2">请尝试调整搜索条件</p>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredArticles.map((article, idx) => (
                                    <motion.div
                                        key={article.id}
                                        initial={{opacity: 0, y: 20}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{duration: 0.3, delay: idx * 0.1}}
                                    >
                                        <Card className="group h-full hover:shadow-lg transition-all duration-300">
                                            <div className="relative aspect-video overflow-hidden rounded-t-xl">
                                                <img
                                                    src={article.cover_image}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div
                                                    className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                                                <div
                                                    className="absolute bottom-4 left-4 right-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                    <Button variant="default" size="sm" className="w-full">
                                                        阅读详情
                                                        <ChevronRight className="w-4 h-4 ml-1"/>
                                                    </Button>
                                                </div>
                                            </div>
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Badge variant="secondary">{article.category}</Badge>
                                                    <Badge variant="outline">{article.difficulty}</Badge>
                                                </div>
                                                <h3 className="text-lg font-bold mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
                                                    {article.title}
                                                </h3>
                                                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                                    {article.content}
                                                </p>
                                                <div
                                                    className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-1"/>
                                                        <span>{article.readTime} 分钟阅读</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-1"/>
                                                        <span>{article.date}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredArticles.map((article, idx) => (
                                    <motion.div
                                        key={article.id}
                                        initial={{opacity: 0, x: -20}}
                                        animate={{opacity: 1, x: 0}}
                                        transition={{duration: 0.3, delay: idx * 0.1}}
                                    >
                                        <Accordion type="single" collapsible>
                                            <AccordionItem value={article.id.toString()}>
                                                <AccordionTrigger className="hover:no-underline">
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={article.cover_image}
                                                            alt={article.title}
                                                            className="w-16 h-16 object-cover rounded-lg"
                                                        />
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-left">
                                                                {article.title}
                                                            </h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge variant="secondary">{article.category}</Badge>
                                                                <span className="text-sm text-gray-500">
                                                                    {article.readTime} 分钟阅读
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="pl-20">
                                                        <p className="text-gray-600 mb-4">{article.content}</p>
                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            {article.tags.map((tag, tagIdx) => (
                                                                <Badge key={tagIdx} variant="outline">
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                        <Button variant="default" size="sm">
                                                            阅读详情
                                                            <ChevronRight className="w-4 h-4 ml-1"/>
                                                        </Button>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllArticlesSection;