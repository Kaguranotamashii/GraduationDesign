import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, Eye, ThumbsUp, Tag, TrendingUp, BookOpen, Star, Clock, ChevronRight, Filter, Camera, Paintbrush, Mountain } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import AllArticlesSection from "@/components/articles/AllArticles/AllArticlesSection.jsx";

const ArticleList = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedTimeframe, setSelectedTimeframe] = useState('all');
    const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

    // 背景图片集合
    const backgroundImages = {
        "古建筑": "https://images.unsplash.com/photo-1470004914212-05527e49370b",
        "园林艺术": "https://images.unsplash.com/photo-1546436836-07a91091f160",
        "文化遗产": "https://images.unsplash.com/photo-1510332981392-36692ea3a195",
        "建筑智慧": "https://images.unsplash.com/photo-1604328698692-f76ea9498e76",
        "传统民居": "https://images.unsplash.com/photo-1527838832700-5059252407fa",
        "现代传承": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab"
    };

    useEffect(() => {
        setTimeout(() => {
            const demoArticles = Array.from({ length: 15 }, (_, i) => ({
                id: i + 1,
                title: [
                    '故宫的建筑艺术：探索紫禁城的建筑之美',
                    '颐和园建筑布局与江南园林的异同',
                    '中国传统园林设计中的美学思想探析',
                    '天坛祭天建筑群的礼制文化研究',
                    '北京四合院：传统民居建筑的典范',
                    '苏州园林：诗意栖居的艺术典范',
                    '中国古建筑的匠心智慧：斗拱结构解析',
                    '江南水乡古镇建筑特色研究',
                    '明清园林建筑的空间意境营造',
                    '传统建筑装饰艺术的符号语言',
                    '中国古代建筑的防震智慧',
                    '园林建筑中的诗情画意',
                    '古建筑修复技艺的传承与创新',
                    '中国传统建筑的可持续发展理念',
                    '数字技术在古建筑保护中的应用'
                ][i],
                content: '探索传统建筑文化的深度解读，感受千年建筑智慧的传承...',
                author: ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'][i % 8],
                date: `2024-0${Math.floor(i/4) + 1}-${10 + i}`,
                views: Math.floor(Math.random() * 1000 + 100),
                likes: Math.floor(Math.random() * 500 + 50),
                readTime: Math.floor(Math.random() * 10 + 5),
                category: ['古建筑', '园林艺术', '文化遗产', '建筑智慧', '传统民居', '现代传承'][i % 6],
                tags: [
                    ['建筑文化', '古代建筑', '文化遗产'],
                    ['园林设计', '建筑艺术', '文化传承'],
                    ['建筑智慧', '传统技艺', '匠心精神'],
                    ['数字保护', '创新应用', '可持续发展']
                ][i % 4],
                cover_image: Object.values(backgroundImages)[i % Object.keys(backgroundImages).length],
                featured: i < 3,
                trending: i >= 3 && i < 6,
                isNew: i >= 12,
                difficulty: ['入门', '进阶', '专业'][i % 3],
                type: ['图文', '视频', '专题'][i % 3]
            }));
            setArticles(demoArticles);
            setLoading(false);
        }, 1000);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentFeaturedIndex((prev) =>
                prev === featuredArticles.length - 1 ? 0 : prev + 1
            );
        }, 5000);
        return () => clearInterval(timer);
    }, [articles]);

    const featuredArticles = articles.filter(article => article.featured);
    const trendingArticles = articles.filter(article => article.trending);
    const regularArticles = articles.filter(article => !article.featured && !article.trending);

    const CategoryIcon = ({ category }) => {
        const icons = {
            "古建筑": Camera,
            "园林艺术": Paintbrush,
            "文化遗产": Camera,
            "建筑智慧": Mountain,
        };
        const Icon = icons[category] || Camera;
        return <Icon className="w-4 h-4" />;
    };

    const DifficultyBadge = ({ level }) => {
        const colors = {
            '入门': 'bg-green-100 text-green-800',
            '进阶': 'bg-yellow-100 text-yellow-800',
            '专题': 'bg-red-100 text-red-800'
        };
        return (
            <span className={`text-xs px-2 py-1 rounded-full ${colors[level]}`}>
                {level}
            </span>
        );
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="fixed top-0 left-0 right-0 z-50">
                <Navbar />
            </div>

            <main className="flex-grow pt-16">
                {/* Hero Section with Dynamic Background */}
                <div
                    className="relative h-96 bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${featuredArticles[currentFeaturedIndex]?.cover_image})`,
                    }}
                >
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-white text-center">
                        <h1 className="text-6xl font-bold mb-6">
                            探索<span className="text-red-500">建筑文化</span>之美
                        </h1>
                        <p className="text-xl mb-8 max-w-2xl">
                            感受千年建筑智慧的传承，领略东方建筑艺术的精髓
                        </p>

                    </div>
                </div>

                <div className="container mx-auto px-4 py-12">
                    {/* Advanced Search and Filter */}
                    {/*<div className="mb-12 bg-white p-6 rounded-xl shadow-sm">*/}
                    {/*    <div className="flex flex-col space-y-4">*/}
                    {/*        <div className="flex flex-col md:flex-row gap-4">*/}
                    {/*            <div className="flex-1 relative">*/}
                    {/*                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />*/}
                    {/*                <Input*/}
                    {/*                    type="text"*/}
                    {/*                    placeholder="搜索感兴趣的文章..."*/}
                    {/*                    className="pl-10"*/}
                    {/*                    value={searchQuery}*/}
                    {/*                    onChange={(e) => setSearchQuery(e.target.value)}*/}
                    {/*                />*/}
                    {/*            </div>*/}
                    {/*            <Select value={selectedCategory} onValueChange={setSelectedCategory}>*/}
                    {/*                <SelectTrigger className="w-[180px] bg-white">*/}
                    {/*                    <SelectValue placeholder="选择分类" />*/}
                    {/*                </SelectTrigger>*/}
                    {/*                <SelectContent>*/}
                    {/*                    <SelectItem value="all">全部分类</SelectItem>*/}
                    {/*                    {Object.keys(backgroundImages).map(cat => (*/}
                    {/*                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>*/}
                    {/*                    ))}*/}
                    {/*                </SelectContent>*/}
                    {/*            </Select>*/}
                    {/*            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>*/}
                    {/*                <SelectTrigger className="w-[180px] bg-white">*/}
                    {/*                    <SelectValue placeholder="时间范围" />*/}
                    {/*                </SelectTrigger>*/}
                    {/*                <SelectContent>*/}
                    {/*                    <SelectItem value="all">全部时间</SelectItem>*/}
                    {/*                    <SelectItem value="week">最近一周</SelectItem>*/}
                    {/*                    <SelectItem value="month">最近一月</SelectItem>*/}
                    {/*                    <SelectItem value="year">最近一年</SelectItem>*/}
                    {/*                </SelectContent>*/}
                    {/*            </Select>*/}
                    {/*        </div>*/}
                    {/*        <div className="flex flex-wrap gap-2">*/}
                    {/*            <Badge className="cursor-pointer hover:bg-gray-100" variant="outline">*/}
                    {/*                建筑文化*/}
                    {/*            </Badge>*/}
                    {/*            <Badge className="cursor-pointer hover:bg-gray-100" variant="outline">*/}
                    {/*                古代建筑*/}
                    {/*            </Badge>*/}
                    {/*            <Badge className="cursor-pointer hover:bg-gray-100" variant="outline">*/}
                    {/*                文化遗产*/}
                    {/*            </Badge>*/}
                    {/*            /!* Add more quick filter badges *!/*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                    {/* Featured Articles Carousel */}
                    {featuredArticles.length > 0 && (
                        <div className="mb-16">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Star className="w-6 h-6 mr-2 text-yellow-500" />
                                精选文章
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {featuredArticles.map((article, index) => (
                                    <Card
                                        key={article.id}
                                        className={`group hover:shadow-xl transition-all duration-500 
                                                  ${index === currentFeaturedIndex ? 'ring-2 ring-red-500' : ''}`}
                                    >
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <img
                                                src={article.cover_image}
                                                alt={article.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                            <div className="absolute top-4 left-4 flex gap-2">
                                                <Badge className="bg-red-500">精选</Badge>
                                                <DifficultyBadge level={article.difficulty} />
                                            </div>
                                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                                <h3 className="text-xl font-bold mb-2 group-hover:text-red-400 transition-colors">
                                                    {article.title}
                                                </h3>
                                                <div className="flex items-center text-sm">
                                                    <User className="w-4 h-4 mr-1" />
                                                    <span className="mr-4">{article.author}</span>
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    <span>{article.readTime} 分钟阅读</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Content Tabs */}
                    <Tabs defaultValue="trending" className="mb-16">
                        <TabsList className="mb-6">
                            <TabsTrigger value="trending" className="text-lg">
                                <TrendingUp className="w-5 h-5 mr-2" />
                                热门阅读
                            </TabsTrigger>
                            <TabsTrigger value="latest" className="text-lg">
                                <Clock className="w-5 h-5 mr-2" />
                                最新发布
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="trending">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {trendingArticles.map((article) => (
                                    <Card key={article.id} className="group hover:shadow-lg transition-all duration-300">
                                        <div className="p-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <CategoryIcon category={article.category} />
                                                <span className="text-sm text-gray-600">{article.category}</span>
                                            </div>
                                            <h3 className="text-lg font-bold mb-3 group-hover:text-red-600 transition-colors">
                                                {article.title}
                                            </h3>
                                            <div className="flex items-center text-sm text-gray-600 mb-4">
                                                <Eye className="w-4 h-4 mr-1" />
                                                <span className="mr-4">{article.views} 阅读</span>
                                                <ThumbsUp className="w-4 h-4 mr-1" />
                                                <span>{article.likes} 喜欢</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {article.tags.map((tag, idx) => (
                                                    <Badge key={idx} variant="outline"
                                                           className="hover:bg-red-50 hover:text-red-600 transition-colors">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="latest">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {regularArticles.filter(a => a.isNew).map((article) => (
                                    <Card key={article.id} className="group overflow-hidden">
                                        <div className="relative aspect-video">
                                            <img
                                                src={article.cover_image}
                                                alt={article.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute top-2 right-2">
                                                <Badge className="bg-blue-500">最新</Badge>
                                            </div>
                                        </div>
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <DifficultyBadge level={article.difficulty} />
                                                <span className="text-sm text-gray-500">•</span>
                                                <span className="text-sm text-gray-600">{article.type}</span>
                                            </div>
                                            <h3 className="text-lg font-bold mb-3 group-hover:text-red-600 transition-colors">
                                                {article.title}
                                            </h3>
                                            <p className="text-gray-600 mb-4 line-clamp-2">{article.content}</p>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <User className="w-4 h-4 mr-1" />
                                                <span className="mr-4">{article.author}</span>
                                                <Calendar className="w-4 h-4 mr-1" />
                                                <span>{article.date}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>


                    <AllArticlesSection articles={articles} />


                </div>
            </main>

            <Footer />

            {/* Enhanced Loading State */}
            {loading && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
                        <div className="mt-4 text-gray-600">正在加载精彩内容...</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArticleList;