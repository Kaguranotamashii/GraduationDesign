import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import MarkdownNavbar from 'markdown-navbar';
import { useSpring, animated } from '@react-spring/web';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import {
    Clock,
    Calendar,
    Book,
    BookOpen,
    Bookmark,
    Share2,
    ThumbsUp,
    Eye,
    MessageSquare,
    ChevronRight,
    ArrowUpCircle
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import CommentSection from "@/components/articles/Comments/CommentSection.jsx";

const MarkdownViewer = () => {
    const { id } = useParams();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [activeSection, setActiveSection] = useState('');

    const fadeIn = useSpring({
        from: { opacity: 0, transform: 'translateY(20px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
        config: { tension: 280, friction: 20 }
    });

    // 监听滚动
    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 500);

            // 更新当前阅读位置
            const headings = document.querySelectorAll('h1, h2, h3');
            for (let heading of headings) {
                const rect = heading.getBoundingClientRect();
                if (rect.top > 0 && rect.top < window.innerHeight / 2) {
                    setActiveSection(heading.id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 获取Markdown内容
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await fetch(`/markdown/${id}.md`);
                const text = await response.text();
                setContent(text);
                setLoading(false);
            } catch (error) {
                console.error('Failed to load markdown:', error);
                setLoading(false);
            }
        };
        fetchContent();
    }, [id]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex justify-center items-center z-50">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <div className="mt-4 text-gray-600">正在加载文档...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* 文档头部 */}
            <div className="relative h-[40vh] overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800">
                <div className="absolute inset-0 bg-grid-white/[0.2] bg-grid-8" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="container mx-auto px-4 h-full flex items-end">
                    <animated.div style={fadeIn} className="pb-12 text-white">
                        <div className="flex items-center gap-4 mb-6">
                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                                <Book className="w-4 h-4 mr-2" />
                                技术文档
                            </Badge>
                            <div className="flex items-center text-white/80">
                                <Clock className="w-4 h-4 mr-2" />
                                预计阅读时间：10 分钟
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">技术文档标题</h1>
                        <div className="flex flex-wrap items-center gap-6 text-white/80">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>最后更新：2024-02-14</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye className="w-5 h-5" />
                                <span>1,234 次阅读</span>
                            </div>
                        </div>
                    </animated.div>
                </div>
            </div>

            {/* 主要内容区 */}
            <main className="container mx-auto px-4 -mt-16 pb-12 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* 左侧内容 */}
                    <animated.div style={fadeIn} className="flex-1">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            {/* 文档操作栏 */}
                            <div className="px-8 py-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Badge variant="outline" className="gap-1">
                                        <BookOpen className="w-4 h-4" />
                                        文档阅读
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <ThumbsUp className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Bookmark className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Markdown 内容 */}
                            <div className="p-8 md:p-12 max-w-4xl mx-auto">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[
                                        rehypeSlug,
                                        [rehypeAutolinkHeadings, { behavior: 'wrap' }]
                                    ]}
                                    components={{
                                        h1: ({node, ...props}) => (
                                            <h1 className="text-4xl font-bold text-gray-900 my-12 pb-6 border-b-2
                                                border-gray-100 leading-tight tracking-tight scroll-mt-32" {...props} />
                                        ),
                                        h2: ({node, ...props}) => (
                                            <div className="group scroll-mt-32">
                                                <h2 className="text-3xl font-bold text-gray-800 mt-16 mb-8 pl-6
                                                    border-l-4 border-blue-500 leading-relaxed transition-colors
                                                    hover:text-blue-700 hover:border-blue-600 flex items-center gap-4" {...props}>
                                                    <span className="flex-1">{props.children}</span>
                                                    <a href={`#${props.id}`} className="opacity-0 group-hover:opacity-100
                                                        text-blue-500 hover:text-blue-600 transition-opacity">
                                                        <ChevronRight className="w-5 h-5" />
                                                    </a>
                                                </h2>
                                            </div>
                                        ),
                                        h3: ({node, ...props}) => (
                                            <h3 className="text-2xl font-semibold text-gray-700 mt-12 mb-6
                                                leading-relaxed scroll-mt-32" {...props} />
                                        ),
                                        p: ({node, ...props}) => (
                                            <p className="text-lg text-gray-600 leading-relaxed my-6
                                                [&:not(:first-child)]:mt-8" {...props} />
                                        ),
                                        ul: ({node, ...props}) => (
                                            <ul className="space-y-4 my-8 ml-6" {...props} />
                                        ),
                                        ol: ({node, ...props}) => (
                                            <ol className="list-decimal space-y-4 my-8 ml-6 marker:text-blue-600
                                                marker:font-semibold" {...props} />
                                        ),
                                        li: ({node, ...props}) => (
                                            <li className="text-gray-600 text-lg leading-relaxed pl-2" {...props} />
                                        ),
                                        blockquote: ({node, ...props}) => (
                                            <blockquote className="border-l-4 border-blue-500 pl-8 py-6 my-8
                                                bg-gradient-to-r from-blue-50/50 to-transparent italic
                                                text-gray-700 rounded-r-lg" {...props} />
                                        ),
                                        code: ({node, inline, ...props}) => (
                                            inline ? (
                                                <code className="bg-gray-100 px-2 py-0.5 rounded text-blue-600
                                                    text-sm font-medium" {...props} />
                                            ) : (
                                                <div className="relative group">
                                                    <div className="absolute top-0 right-0 p-2 opacity-0
                                                        group-hover:opacity-100 transition-opacity">
                                                        <button className="px-3 py-1 text-xs text-gray-500
                                                            hover:text-blue-600 bg-white/90 rounded-md shadow-sm
                                                            hover:shadow transition-all">
                                                            复制代码
                                                        </button>
                                                    </div>
                                                    <code className="block bg-gray-100 p-6 rounded-lg overflow-x-auto
                                                        text-sm my-6 shadow-inner" {...props} />
                                                </div>
                                            )
                                        ),
                                        a: ({node, ...props}) => (
                                            <a className="text-blue-600 hover:text-blue-700 underline-offset-4
                                                decoration-blue-300/50 hover:decoration-blue-400 transition-colors
                                                underline" {...props} />
                                        ),
                                        img: ({node, ...props}) => (
                                            <div className="my-10 group">
                                                <img className="rounded-lg shadow-lg w-full object-cover
                                                    group-hover:shadow-xl transition-shadow duration-300" {...props} />
                                                {props.alt && (
                                                    <p className="mt-3 text-center text-gray-500 text-sm">
                                                        {props.alt}
                                                    </p>
                                                )}
                                            </div>
                                        ),
                                        table: ({node, ...props}) => (
                                            <div className="my-8 overflow-x-auto">
                                                <table className="w-full border-collapse" {...props} />
                                            </div>
                                        ),
                                        th: ({node, ...props}) => (
                                            <th className="border-b-2 border-gray-200 bg-gray-50 p-4 text-left
                                                text-sm font-semibold text-gray-600" {...props} />
                                        ),
                                        td: ({node, ...props}) => (
                                            <td className="border-b border-gray-100 p-4 text-sm
                                                text-gray-600" {...props} />
                                        ),
                                    }}
                                >
                                    {content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </animated.div>

                    {/* 右侧目录 */}
                    <animated.div style={fadeIn} className="lg:w-80">
                        <div className="sticky top-6">
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900">目录导航</h3>
                                </div>
                                <div className="navigation-tree p-4 max-h-[calc(100vh-20rem)] overflow-y-auto">
                                    <MarkdownNavbar
                                        className="markdown-nav"
                                        source={content}
                                        ordered={false}
                                        updateHashAuto={true}
                                        headingTopOffset={-100}
                                    />
                                </div>
                            </div>
                        </div>
                    </animated.div>
                </div>
                {/* 评论区 */}
                <div className="mt-8">
                    <CommentSection />
                </div>
            </main>

            {/* 返回顶部按钮 */}
            {showBackToTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 p-3 bg-blue-600 text-white rounded-full
                        shadow-lg hover:bg-blue-700 transition-colors z-50"
                >
                    <ArrowUpCircle className="w-6 h-6" />
                </button>
            )}

            {/* 全局样式 */}
            <style>{`
                .markdown-nav {
                    font-size: 14px;
                }
                
                .markdown-nav .title-anchor {
                    display: block;
                    padding: 8px 12px;
                    margin: 2px 0;
                    color: #4B5563;
                    text-decoration: none;
                    border-radius: 6px;
                    transition: all 0.2s;
                    position: relative;
                    padding-left: 24px;
                }
                
                .markdown-nav .title-anchor:hover {
                    background-color: #F3F4F6;
                    color: #2563EB;
                }
                
                .markdown-nav .title-anchor.active {
                    background-color: #EFF6FF;
                    color: #2563EB;
                    font-weight: 500;
                }
                
                .markdown-nav .title-anchor::before {
                    content: '';
                    position: absolute;
                    left: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background-color: #CBD5E1;
                    transition: all 0.2s;
                }
                
                .markdown-nav .title-anchor:hover::before,
                .markdown-nav .title-anchor.active::before {
                    background-color: #2563EB;
                    transform: translateY(-50%) scale(1.2);
                }
                
                .markdown-nav .title-level1 { padding-left: 24px; }
                .markdown-nav .title-level2 { padding-left: 36px; }
                .markdown-nav .title-level3 { padding-left: 48px; }
                .markdown-nav .title-level4 { padding-left: 60px; }
                
                /* 滚动条美化 */
                .navigation-tree::-webkit-scrollbar {
                    width: 6px;
                }
                
                .navigation-tree::-webkit-scrollbar-track {
                    background: #F3F4F6;
                    border-radius: 3px;
                }
                
                .navigation-tree::-webkit-scrollbar-thumb {
                    background: #CBD5E1;
                    border-radius: 3px;
                }
                
                .navigation-tree::-webkit-scrollbar-thumb:hover {
                    background: #94A3B8;
                }
                
                /* 代码块样式增强 */
                pre {
                    background-color: #F8FAFC !important;
                    border: 1px solid #E2E8F0;
                }
                
                pre code {
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                    line-height: 1.6;
                }
                
                /* 表格样式增强 */
                table {
                    border-collapse: separate;
                    border-spacing: 0;
                    width: 100%;
                }
                
                th {
                    background-color: #F8FAFC;
                    font-weight: 600;
                    text-align: left;
                    padding: 12px 24px;
                    border-bottom: 2px solid #E2E8F0;
                }
                
                td {
                    padding: 12px 24px;
                    border-bottom: 1px solid #E2E8F0;
                }
                
                tr:hover {
                    background-color: #F8FAFC;
                }
                
                /* 动画过渡效果 */
                .transition-all {
                    transition-property: all;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;
                }
            `}</style>
            {/* 添加到 head 中的全局样式 */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    .markdown-nav {
                        font-size: 14px !important;
                    }
                    
                    .navigation-tree::-webkit-scrollbar {
                        width: 6px !important;
                    }
                    
                    .navigation-tree::-webkit-scrollbar-track {
                        background: #F3F4F6 !important;
                        border-radius: 3px !important;
                    }
                    
                    .navigation-tree::-webkit-scrollbar-thumb {
                        background: #CBD5E1 !important;
                        border-radius: 3px !important;
                    }
                    
                    .navigation-tree::-webkit-scrollbar-thumb:hover {
                        background: #94A3B8 !important;
                    }
                `
            }} />
        </div>
    );
};

export default MarkdownViewer;