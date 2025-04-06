import React, { useEffect, useRef } from 'react';
import { MessageSquare, GithubIcon, Instagram, BookOpen, Mail } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useSpring, animated } from '@react-spring/web';

// Link data (moved outside components for better organization)
const footerLinks = {
    explore: [
        { name: '地图', path: '/map' },
        { name: '文章', path: '/articles' },
        { name: '3D模型', path: '/models' },
        { name: '首页', path: '/' },
    ],
    about: [
        { name: '关于我们', path: '/about' },
        { name: '文化价值', path: '/about/culture' },
        { name: '项目展示', path: '/models' },
        { name: '常见问题', path: '/faq' },
    ],
    social: [
        { icon: <MessageSquare className="w-5 h-5" />, href: '#', label: '微信', color: 'hover:text-green-500' },
        { icon: <GithubIcon className="w-5 h-5" />, href: '#', label: 'Github', color: 'hover:text-gray-900' },
        { icon: <Instagram className="w-5 h-5" />, href: '#', label: '微博', color: 'hover:text-pink-500' },
        { icon: <BookOpen className="w-5 h-5" />, href: '#', label: '知乎', color: 'hover:text-blue-600' },
        { icon: <Mail className="w-5 h-5" />, href: '#', label: '邮件', color: 'hover:text-yellow-500' },
    ],
};

// Helper function to scroll to the top
const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Simplified Footer for Admin Pages (no changes here for now)
const AdminFooter = () => (
    <footer className="bg-gray-100 border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
            <span className="mb-2 sm:mb-0">© 2025 筑境云枢. 保留所有权利</span>
            <div className="flex space-x-4">
                {footerLinks.social.map((social, index) => (
                    <a
                        key={index}
                        href={social.href}
                        className={`text-gray-500 ${social.color} transition-colors duration-300`}
                        aria-label={social.label}
                    >
                        {social.icon}
                    </a>
                ))}
            </div>
        </div>
    </footer>
);

// Enhanced Footer for Frontend
const FrontendFooter = () => {
    const location = useLocation();
    const buttonSpring = useSpring({
        from: { scale: 0.8, opacity: 0 },
        to: { scale: 1, opacity: 1 },
        config: { tension: 300, friction: 15 },
        delay: 300,
    });

    return (
        <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-200 py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
                    {/* Brand Information (Larger Column) */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-4">
                        <h3 className="text-2xl font-semibold text-white mb-6">筑境云枢</h3>
                        <p className="text-gray-400 text-lg leading-relaxed mb-8">
                            数字化传承中国传统建筑，连接历史与未来。探索精美的3D模型，阅读深入的文章，发现丰富的文化价值。
                        </p>
                        <div className="flex space-x-4">
                            {footerLinks.social.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    className={`w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white ${social.color} transition-colors duration-300`}
                                    aria-label={social.label}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Explore & About Links (Side-by-Side) */}
                    <div className="col-span-1 md:col-span-1 lg:col-span-4">
                        <h4 className="text-lg font-semibold text-white mb-4">探索</h4>
                        <ul className="space-y-2">
                            {footerLinks.explore.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-400 hover:text-white transition-colors duration-300"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="col-span-1 md:col-span-1 lg:col-span-4">
                        <h4 className="text-lg font-semibold text-white mb-4">关于我们</h4>
                        <ul className="space-y-2">
                            {footerLinks.about.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-400 hover:text-white transition-colors duration-300"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="py-8 mt-12 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <span>© 2025 筑境云枢. 保留所有权利。</span>
                    <div className="mt-2 md:mt-0">
                        <Link to="/privacy" className="hover:text-white transition-colors duration-300 mr-4">
                            隐私政策
                        </Link>
                        <Link to="/terms" className="hover:text-white transition-colors duration-300">
                            使用条款
                        </Link>
                    </div>
                </div>

                {/* Back to Top Button */}
                <animated.button
                    style={buttonSpring}
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 p-3 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-all duration-300 focus:outline-none"
                    aria-label="回到顶部"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                </animated.button>
            </div>
        </footer>
    );
};

const Footer = () => {
    const location = useLocation();
    const prevPathname = useRef(location.pathname);
    const isAdminPage = location.pathname.includes('/admin');

    useEffect(() => {
        if (location.pathname !== prevPathname.current) {
            scrollToTop();
            prevPathname.current = location.pathname;
        }
    }, [location]);

    const footerSpring = useSpring({
        from: { opacity: 0, y: 30 },
        to: { opacity: 1, y: 0 },
        config: { tension: 220, friction: 25 },
        delay: 100,
    });

    return (
        <animated.div style={footerSpring}>
            {isAdminPage ? <AdminFooter /> : <FrontendFooter />}
        </animated.div>
    );
};

export default Footer;