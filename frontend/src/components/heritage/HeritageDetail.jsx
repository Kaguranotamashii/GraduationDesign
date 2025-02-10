// pages/HeritageDetail.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import MarkdownNavbar from 'markdown-navbar';
import { useSpring, animated } from '@react-spring/web';

import Footer from '../home/Footer';
import Navbar from "../home/Navbar";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { ChevronRight, Clock, MapPin, Calendar } from 'lucide-react';

import MarkdownIt from 'markdown-it';
import markdownItTocDoneRight from 'markdown-it-toc-done-right';
import markdownItAnchor from 'markdown-it-anchor';

const HeritageDetail = () => {
    const { id } = useParams();
    const [content, setContent] = useState('');
    const [scrollY, setScrollY] = useState(0);

    // 添加滚动渐变效果
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 渐入动画
    const fadeIn = useSpring({
        from: { opacity: 0, transform: 'translateY(20px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
        config: { tension: 280, friction: 20 }
    });



    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await fetch(`/markdown/${id}.md`);
                const text = await response.text();
                setContent(text);
            } catch (error) {
                console.error('Failed to load markdown:', error);
            }
        };
        fetchContent();
    }, [id]);


    const mdParser = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true
    })
        .use(markdownItTocDoneRight)
        .use(markdownItAnchor, { permalink: true, permalinkBefore: true });


    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            {/* 头部大图 */}
            <div className="relative h-[70vh] overflow-hidden">
                <img
                    src="https://bpic.588ku.com/back_origin_min_pic/20/11/06/4d74e2846cb7909b3f4556f018bc9d05.jpg!/fw/750/quality/99/unsharp/true/compress/true"
                    alt="太和殿"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60"></div>
                <animated.div
                    style={fadeIn}
                    className="absolute bottom-0 left-0 right-0 p-12 text-white"
                >
                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        故宫太和殿
                    </h1>
                    <div className="flex flex-wrap gap-8 text-lg opacity-90">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-6 h-6" />
                            <span>明清时期</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-6 h-6" />
                            <span>北京故宫紫禁城中轴线上</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-6 h-6" />
                            <span>始建于明永乐十八年（1420年）</span>
                        </div>
                    </div>
                </animated.div>
            </div>

            {/* 主要内容区 */}
            <main className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12">
                {/* 左侧内容 */}
                <animated.div style={fadeIn} className="flex-1">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-8 md:p-12 max-w-4xl mx-auto">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, {behavior: 'wrap'}]]}
                                components={{
                                    h1: ({node, ...props}) => (
                                        <h1 className="text-4xl font-bold text-gray-900 my-12 pb-6 border-b-2 border-gray-100
                        leading-tight tracking-tight" {...props} />
                                    ),
                                    h2: ({node, ...props}) => (
                                        <div className="group">
                                            <h2 className="text-3xl font-bold text-gray-800 mt-16 mb-8 pl-6 border-l-4
                            border-red-500 leading-relaxed transition-colors hover:text-red-700
                            hover:border-red-600" {...props} />
                                        </div>
                                    ),
                                    h3: ({node, ...props}) => (
                                        <h3 className="text-2xl font-semibold text-gray-700 mt-12 mb-6
                        leading-relaxed" {...props} />
                                    ),
                                    h4: ({node, ...props}) => (
                                        <h4 className="text-xl font-medium text-gray-600 mt-8 mb-4" {...props} />
                                    ),
                                    p: ({node, ...props}) => (
                                        <p className="text-lg text-gray-600 leading-relaxed my-6
                        [&:not(:first-child)]:mt-8" {...props} />
                                    ),
                                    ol: ({node, ...props}) => (
                                        <ol className="list-none space-y-6 my-8 ml-2" {...props} />
                                    ),
                                    ul: ({node, ...props}) => (
                                        <ul className="list-none space-y-3 my-6 ml-8" {...props} />
                                    ),
                                    li: ({node, ordered, ...props}) => {
                                        const isNestedList = node.children?.some(child =>
                                            child.type === 'element' && (child.tagName === 'ul' || child.tagName === 'ol')
                                        );
                                        const isOrderedList = node.parent?.tagName === 'ol';
                                        const index = isOrderedList ? node.parent.children.indexOf(node) + 1 : null;

                                        return (
                                            <li className={`relative group ${isNestedList ? 'mb-6' : ''}`}>
                                                <div
                                                    className="flex items-start group-hover:translate-x-1 transition-transform">
                                                    {isOrderedList ? (
                                                        <span
                                                            className="text-lg font-medium text-red-600 mr-6 opacity-90">
                                            {index}.
                                        </span>
                                                    ) : (
                                                        <span className="absolute left-0 top-2.5 w-2 h-2 rounded-full
                                        bg-red-500 -translate-x-6 group-hover:scale-125 transition-all
                                        group-hover:bg-red-600"></span>
                                                    )}
                                                    <div className="flex-1 text-lg">{props.children}</div>
                                                </div>
                                            </li>
                                        );
                                    },
                                    strong: ({node, ...props}) => (
                                        <strong className="font-bold text-gray-900 px-0.5" {...props} />
                                    ),
                                    blockquote: ({node, ...props}) => (
                                        <blockquote className="border-l-4 border-red-500 pl-8 py-6 my-8
                        bg-gradient-to-r from-red-50/50 to-transparent italic text-gray-700
                        rounded-r-lg" {...props} />
                                    ),
                                    code: ({node, inline, ...props}) => (
                                        inline ?
                                            <code className="bg-gray-100 px-2 py-0.5 rounded text-red-600
                            text-sm font-medium" {...props} /> :
                                            <code className="block bg-gray-100 p-6 rounded-lg overflow-x-auto
                            text-sm my-6 shadow-inner" {...props} />
                                    ),
                                    a: ({node, ...props}) => (
                                        <a className="text-red-600 hover:text-red-700 underline-offset-4
                        decoration-red-300/50 hover:decoration-red-400 transition-colors
                        underline" {...props} />
                                    ),
                                    hr: ({node, ...props}) => (
                                        <hr className="my-12 border-t-2 border-gray-100" {...props} />
                                    ),
                                    img: ({node, ...props}) => (
                                        <div className="my-10 group">
                                            <img className="rounded-lg shadow-lg w-full object-cover
                            group-hover:shadow-xl transition-shadow duration-300" {...props} />
                                        </div>
                                    ),
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        </div>
                    </div>
                </animated.div>

                {/* 右侧目录 */}
                <animated.div
                    style={fadeIn}
                    className="lg:w-80"
                >
                    <div className="sticky top-6">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900">目录导航</h3>
                            </div>
                            <div className="navigation-tree px-2">
                                <MarkdownNavbar
                                    className="navigation-nav"
                                    source={content}
                                    ordered={false}
                                    updateHashAuto={true}
                                    headingTopOffset={-100}

                                />
                            </div>
                        </div>
                    </div>
                </animated.div>
            </main>

            <Footer/>
        </div>
    );
};

export default HeritageDetail;
