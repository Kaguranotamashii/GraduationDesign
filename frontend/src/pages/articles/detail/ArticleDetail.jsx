import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Import useSelector to access Redux state
import ReactMarkdown from 'react-markdown';
import MarkdownNavbar from 'markdown-navbar';
import { useSpring, animated } from '@react-spring/web';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import {
    Clock, Calendar, Book, Eye, Bookmark, Share2,
    Heart, ArrowUpCircle, Home, ChevronLeft, ListFilter,
    Tag, Menu
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { message } from 'antd';
import CommentSection from "@/components/articles/Comments/CommentSection";
import { getArticleDetail, likeArticle, unlikeArticle } from '@/api/articleApi';
import { format, parseISO } from 'date-fns';
import { toast } from "sonner";
import "./ArticleDetail.css"

const ArticleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [readingProgress, setReadingProgress] = useState(0);
    const [estimatedReadTime, setEstimatedReadTime] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isTocOpen, setIsTocOpen] = useState(false);

    // Access authentication state from Redux
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    const fadeIn = useSpring({
        from: { opacity: 0, transform: 'translateY(20px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
        config: { tension: 280, friction: 20 }
    });

    useEffect(() => {
        const handleScroll = () => {
            const element = document.documentElement;
            const scrollTop = element.scrollTop || document.body.scrollTop;
            const scrollHeight = element.scrollHeight || document.body.scrollHeight;
            const clientHeight = element.clientHeight;

            const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
            setReadingProgress(Math.min(scrolled, 100));
            setShowBackToTop(scrollTop > 500);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setLoading(true);
                const response = await getArticleDetail(id);

                if (response.code === 200 || response.code === 201) {
                    setArticle(response.data);
                    setIsLiked(response.data.is_liked || false);
                    const wordsPerMinute = 200;
                    const words = response.data.content.trim().split(/\s+/).length;
                    setEstimatedReadTime(Math.ceil(words / wordsPerMinute));
                } else {
                    message.error(response.message || "加载文章失败");
                }
            } catch (error) {
                message.error("加载文章失败: " + error.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchArticle();
        }
    }, [id]);

    const handleLike = async () => {
        if (!isAuthenticated) {
            message.warning("请先登录再点赞！");
            navigate('/login');
            return;
        }
        try {
            const response = await (isLiked ? unlikeArticle : likeArticle)(id);

            if (response.code === 200) {
                setArticle(prev => ({
                    ...prev,
                    likes: response.data.likes,
                    is_liked: response.data.is_liked
                }));
                setIsLiked(response.data.is_liked);
                message.success(response.message);
            }
        } catch (error) {
            toast({
                title: "操作失败",
                description: "操作失败: " + error.message,
                variant: "destructive"
            });
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: article.title,
                    text: article.title,
                    url: window.location.href,
                });
                message.success('分享成功');
            } catch (error) {
                if (error.name !== 'AbortError') {
                    message.error('分享失败');
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                message.success('链接已复制到剪贴板');
            } catch (error) {
                message.error('复制链接失败');
            }
        }
    };

    const handleBookmark = () => {
        if (!isAuthenticated) {
            message.warning("请先登录再收藏！");
            navigate('/login');
            return;
        }
        message.info('收藏功能开发中');
    };

    const formatTags = (tags) => {
        if (!tags) return [];
        return tags.split(',').map(tag => tag.trim());
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return format(parseISO(dateString), 'yyyy年MM月dd日 HH:mm');
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex justify-center items-center z-50">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <div className="mt-4 text-gray-600">Loading article...</div>
                </div>
            </div>
        );
    }

    if (!article) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Reading Progress Bar */}
            <div
                className="fixed top-0 left-0 h-1 bg-blue-600 transition-all duration-300 z-50"
                style={{ width: `${readingProgress}%` }}
            />

            {/* Header Info Section */}
            <div className="bg-white border-b shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3 md:space-x-6">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                <span className="text-sm hidden md:inline">返回</span>
                            </button>
                            <button
                                onClick={() => setIsTocOpen(!isTocOpen)}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 md:hidden"
                            >
                                <Menu className="w-5 h-5" />
                                <span className="text-sm">目录</span>
                            </button>
                            <div className="hidden md:flex items-center space-x-3">
                                <button
                                    onClick={() => navigate('/')}
                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <Home className="w-4 h-4" />
                                    <span className="text-sm">首页</span>
                                </button>
                                <button
                                    onClick={() => navigate('/articles')}
                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <ListFilter className="w-4 h-4" />
                                    <span className="text-sm">文章列表</span>
                                </button>
                            </div>
                            <Badge variant="secondary" className="flex items-center gap-2">
                                <Book className="w-4 h-4" />
                                <span>{article.category || '文章'}</span>
                            </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleLike}
                                className={`p-2 rounded-lg transition-colors flex items-center gap-1
                                    ${isLiked
                                    ? 'text-red-500 bg-red-50 hover:bg-red-100'
                                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
                            >
                                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                <span className="text-sm hidden md:inline">{article.likes}</span>
                            </button>
                            {/*<button*/}
                            {/*    onClick={handleBookmark}*/}
                            {/*    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"*/}
                            {/*>*/}
                            {/*    <Bookmark className="w-5 h-5" />*/}
                            {/*</button>*/}
                            <button
                                onClick={handleShare}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Title Section with Cover Image */}
            <div className="relative">
                <div className={`bg-gradient-to-r from-blue-600 to-indigo-600 py-12 md:py-16 relative overflow-hidden`}>
                    {article?.cover_image_url && (
                        <div className="absolute inset-0">
                            <img
                                src={article.cover_image_url}
                                alt={article.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-indigo-600/80" />
                        </div>
                    )}
                    <div className="container mx-auto px-4 relative z-10">
                        <animated.div style={fadeIn} className="max-w-4xl mx-auto text-center text-white">
                            <h1 className="text-3xl md:text-5xl font-bold mb-4">
                                {article.title}
                            </h1>
                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                                {formatTags(article.tags).map((tag, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="bg-white/20 hover:bg-white/30 transition-colors"
                                    >
                                        <Tag className="w-3 h-3 mr-1" />
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-6 text-white/80 text-sm md:text-base">
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {formatDate(article.published_at)}
                                </div>
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2" />
                                    {estimatedReadTime} 分钟阅读
                                </div>
                                <div className="flex items-center">
                                    <Eye className="w-4 h-4 mr-2" />
                                    {article.views} 次浏览
                                </div>
                                <div className="flex items-center">
                                    <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                                    {article.likes} 次点赞
                                </div>
                            </div>
                        </animated.div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6 md:py-8">
                <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                    {/* Content Area */}
                    <animated.div style={fadeIn} className="flex-1">
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="p-4 md:p-8 prose max-w-none">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[
                                        rehypeSlug,
                                        [rehypeAutolinkHeadings, { behavior: 'wrap' }]
                                    ]}
                                >
                                    {article.content}
                                </ReactMarkdown>
                            </div>
                        </div>

                        {/* Comments */}
                        <div className="mt-6 md:mt-8">
                            {isAuthenticated ? (
                                <CommentSection articleId={id} />
                            ) : (
                                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                                    <p className="text-gray-600 mb-4">
                                        请先登录以查看和发表评论
                                    </p>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        立即登录
                                    </button>
                                </div>
                            )}
                        </div>
                    </animated.div>

                    {/* Table of Contents (Hidden on Mobile by Default) */}
                    <animated.div
                        style={fadeIn}
                        className={`lg:w-72 ${isTocOpen ? 'block' : 'hidden'} lg:block fixed lg:static top-16 left-0 w-full lg:w-72 bg-white lg:bg-transparent z-30 lg:z-0 transition-all duration-300`}
                    >
                        <div className="sticky top-16 p-4 lg:p-0">
                            <div className="bg-white rounded-lg shadow-sm">
                                <div className="p-4 border-b flex justify-between items-center">
                                    <h3 className="font-medium">目录</h3>
                                    <button
                                        onClick={() => setIsTocOpen(false)}
                                        className="p-2 text-gray-600 hover:text-blue-600 lg:hidden"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
                                    <MarkdownNavbar
                                        className="markdown-nav"
                                        source={article.content}
                                        ordered={false}
                                        updateHashAuto={true}
                                        headingTopOffset={-80}
                                    />
                                </div>
                            </div>
                        </div>
                    </animated.div>
                </div>
            </main>

            {/* Back to Top Button */}
            {showBackToTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-8 right-4 md:right-8 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
                >
                    <ArrowUpCircle className="w-6 h-6" />
                </button>
            )}
        </div>
    );
};

export default ArticleDetail;