import React, { useState, useEffect } from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import MarkdownNavbar from 'markdown-navbar';
import { useSpring, animated } from '@react-spring/web';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import {
    Clock, Calendar, Book, Eye, Bookmark, Share2,
    ThumbsUp, ArrowUpCircle, Home, ChevronLeft, ListFilter
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import CommentSection from "@/components/articles/Comments/CommentSection.jsx";

const MarkdownViewer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [readingProgress, setReadingProgress] = useState(0);
    const [estimatedReadTime, setEstimatedReadTime] = useState(0);

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
        const fetchContent = async () => {
            try {
                const response = await fetch(`/markdown/${id}.md`);
                const text = await response.text();
                setContent(text);

                const wordsPerMinute = 200;
                const words = text.trim().split(/\s+/).length;
                setEstimatedReadTime(Math.ceil(words / wordsPerMinute));

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
                    <div className="mt-4 text-gray-600">Loading document...</div>
                </div>
            </div>
        );
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
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-3 border-r pr-6">
                                <button
                                    onClick={() => navigate('/')}
                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <Home className="w-4 h-4" />
                                    <span className="text-sm">Home</span>
                                </button>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span className="text-sm">Back</span>
                                </button>
                                <button
                                    onClick={() => navigate('/articles')}
                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <ListFilter className="w-4 h-4" />
                                    <span className="text-sm">Articles</span>
                                </button>
                            </div>
                            <Badge variant="secondary" className="flex items-center gap-2">
                                <Book className="w-4 h-4" />
                                <span>Documentation</span>
                            </Badge>
                            <div className="flex items-center text-gray-600 text-sm">
                                <Clock className="w-4 h-4 mr-2" />
                                {estimatedReadTime} min read
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                                <Calendar className="w-4 h-4 mr-2" />
                                {new Date().toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                                <Eye className="w-4 h-4 mr-2" />
                                1.2k views
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
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
                </div>
            </div>

            {/* Title Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
                <div className="container mx-auto px-4">
                    <animated.div style={fadeIn} className="max-w-4xl mx-auto text-center text-white">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Document Title
                        </h1>
                        <p className="text-xl text-blue-100">
                            A comprehensive guide to understanding the topic
                        </p>
                    </animated.div>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Content Area */}
                    <animated.div style={fadeIn} className="flex-1">
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="p-8 prose max-w-none">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[
                                        rehypeSlug,
                                        [rehypeAutolinkHeadings, { behavior: 'wrap' }]
                                    ]}
                                >
                                    {content}
                                </ReactMarkdown>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="mt-8">
                            <CommentSection />
                        </div>
                    </animated.div>

                    {/* Navigation Sidebar */}
                    <animated.div style={fadeIn} className="lg:w-72">
                        <div className="sticky top-20">
                            <div className="bg-white rounded-lg shadow-sm">
                                <div className="p-4 border-b">
                                    <h3 className="font-medium">Table of Contents</h3>
                                </div>
                                <div className="p-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
                                    <MarkdownNavbar
                                        className="markdown-nav"
                                        source={content}
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
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
                >
                    <ArrowUpCircle className="w-6 h-6" />
                </button>
            )}

            <style>{`
                /* Typography Styles */
                .prose {
                    font-family: system-ui, -apple-system, sans-serif;
                    font-size: 1.125rem;
                }
                
                .prose h1 {
                    font-size: 2.5rem;
                    line-height: 1.2;
                    margin-bottom: 1.5rem;
                    color: #1a202c;
                    font-weight: 700;
                }
                
                .prose h2 {
                    font-size: 2rem;
                    color: #2d3748;
                    margin-top: 2.5rem;
                    margin-bottom: 1.25rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid #e2e8f0;
                    font-weight: 600;
                }
                
                .prose h3 {
                    font-size: 1.75rem;
                    color: #4a5568;
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                    font-weight: 600;
                }
                
                .prose p {
                    margin-bottom: 1.25rem;
                    line-height: 1.8;
                    font-size: 1.125rem;
                }
                
                /* List Styles */
                .prose ul, .prose ol {
                    margin-top: 0.5rem;
                    margin-bottom: 0.5rem;
                }
                
                .prose li {
                    margin-top: 0.25rem;
                    margin-bottom: 0.25rem;
                }
                
                .prose li > p {
                    margin-top: 0.5rem;
                    margin-bottom: 0.5rem;
                }
                
                /* Code Styles */
                .prose code {
                    background-color: #f7fafc;
                    padding: 0.2em 0.4em;
                    border-radius: 0.25rem;
                    font-size: 0.875em;
                }
                
                .prose pre {
                    background-color: #2d3748;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    overflow-x: auto;
                    margin: 1rem 0;
                }
                
                .prose pre code {
                    background-color: transparent;
                    color: #e2e8f0;
                    padding: 0;
                }
                
                /* Table of Contents Styles */
                .markdown-nav .title-anchor {
                    display: block;
                    padding: 0.5rem;
                    color: #4a5568;
                    text-decoration: none;
                    border-radius: 0.375rem;
                    transition: all 0.2s;
                    font-size: 0.875rem;
                }
                
                .markdown-nav .title-anchor:hover,
                .markdown-nav .title-anchor.active {
                    background-color: #f7fafc;
                    color: #3182ce;
                }
                
                /* Blockquote Styles */
                .prose blockquote {
                    border-left: 4px solid #4299e1;
                    background-color: #f7fafc;
                    padding: 1rem;
                    margin: 1rem 0;
                    font-style: italic;
                }
                
                /* Table Styles */
                .prose table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    margin: 1rem 0;
                }
                
                .prose th {
                    background-color: #f7fafc;
                    font-weight: 600;
                    text-align: left;
                    padding: 0.75rem;
                    border-bottom: 2px solid #e2e8f0;
                }
                
                .prose td {
                    padding: 0.75rem;
                    border-bottom: 1px solid #e2e8f0;
                }
            `}</style>
        </div>
    );
};

export default MarkdownViewer ;