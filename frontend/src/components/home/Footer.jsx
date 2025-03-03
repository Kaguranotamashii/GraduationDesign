import React from 'react';
import { MessageSquare, GithubIcon, Instagram, BookOpen, Mail } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const Footer = () => {
    const location = useLocation();

    // 判断是否在管理界面
    const isAdminPage = location.pathname.includes('/admin');

    const links = {
        explore: [
            { name: '地图', path: '/map' },
            { name: '文章', path: '/articles' },
            { name: '3D模型', path: '/models' },
            { name: '首页', path: '/' }
        ],
        resources: [
            { name: '建筑研究', path: '/articles/category/research' },
            { name: '设计理念', path: '/articles/category/design' },
            { name: '建筑保护', path: '/articles/category/preservation' },
            { name: '历史传承', path: '/articles/category/history' }
        ],
        about: [
            { name: '关于我们', path: '/about' },
            { name: '文化价值', path: '/about/culture' },
            { name: '项目展示', path: '/models' },
            { name: '常见问题', path: '/faq' }
        ],
        social: [
            { icon: <MessageSquare className="w-5 h-5" />, href: '#', label: '微信', color: 'hover:text-green-500' },
            { icon: <GithubIcon className="w-5 h-5" />, href: '#', label: 'Github', color: 'hover:text-purple-500' },
            { icon: <Instagram className="w-5 h-5" />, href: '#', label: '微博', color: 'hover:text-red-500' },
            { icon: <BookOpen className="w-5 h-5" />, href: '#', label: '知乎', color: 'hover:text-blue-500' },
            { icon: <Mail className="w-5 h-5" />, href: '#', label: '邮件', color: 'hover:text-yellow-500' }
        ]
    };

    // 管理界面使用简化版页脚
    if (isAdminPage) {
        return (
            <footer className="bg-gray-50 border-t border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="text-sm text-gray-500">
                            © 2025 筑境云枢. 保留所有权利
                        </div>
                        <div className="flex space-x-6 mt-2 md:mt-0">
                            {links.social.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    className={`text-gray-400 ${social.color} transition-colors duration-300`}
                                    aria-label={social.label}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        );
    }

    // 前台页面使用美化版页脚
    return (
        <footer className="relative bg-gradient-to-b from-gray-900 to-black text-gray-300 overflow-hidden">
            {/* 中式装饰元素 */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-[url('/src/assets/images/chinese-pattern.png')] bg-repeat-x opacity-40"></div>
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-[url('/src/assets/images/chinese-pattern.png')] bg-repeat-x opacity-40 transform rotate-180"></div>
            <div className="absolute top-12 right-12 w-40 h-40 bg-[url('/src/assets/images/chinese-seal.png')] bg-contain bg-no-repeat opacity-10 transform rotate-12"></div>

            <div className="container mx-auto px-6 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
                    <div className="lg:col-span-2">
                        <div className="flex items-center mb-6">
                            <div className="w-10 h-10 bg-red-800 rounded-none flex items-center justify-center mr-3">
                                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12,2L1,21H23L12,2M12,6L19.5,19H4.5L12,6Z" fill="currentColor"/>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white font-serif tracking-wide">筑境云枢</h3>
                        </div>
                        <p className="text-gray-400 mb-6 leading-relaxed pr-4">
                            致力于通过数字创新保护与传播中国传统建筑文化遗产，连接历史与现代，让古老智慧在当代焕发新生。
                        </p>
                        <div className="flex space-x-4 mb-8">
                            {links.social.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    className={`w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 ${social.color} transition-all duration-300 hover:transform hover:scale-110`}
                                    aria-label={social.label}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                        <div className="bg-gray-800/50 p-4 border-l-2 border-yellow-600">
                            <p className="text-sm text-gray-300 italic">
                                "不学礼，无以立。" — 《论语》
                            </p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold text-white mb-6 border-b border-red-800 pb-2 inline-block">
                            探索发现
                        </h4>
                        <ul className="space-y-3">
                            {links.explore.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="hover:text-yellow-500 transition-colors duration-300 flex items-center group"
                                    >
                                        <span className="w-1.5 h-1.5 bg-red-800 rounded-full mr-2 group-hover:bg-yellow-500 transition-colors duration-300"></span>
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold text-white mb-6 border-b border-red-800 pb-2 inline-block">
                            分类文章
                        </h4>
                        <ul className="space-y-3">
                            {links.resources.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="hover:text-yellow-500 transition-colors duration-300 flex items-center group"
                                    >
                                        <span className="w-1.5 h-1.5 bg-red-800 rounded-full mr-2 group-hover:bg-yellow-500 transition-colors duration-300"></span>
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold text-white mb-6 border-b border-red-800 pb-2 inline-block">
                            关于我们
                        </h4>
                        <ul className="space-y-3">
                            {links.about.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="hover:text-yellow-500 transition-colors duration-300 flex items-center group"
                                    >
                                        <span className="w-1.5 h-1.5 bg-red-800 rounded-full mr-2 group-hover:bg-yellow-500 transition-colors duration-300"></span>
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-gray-800">
                    <div className="flex flex-wrap items-center">
                        <div className="text-sm bg-red-800/20 px-4 py-2 border-l border-red-800">
                            <span className="text-gray-400">中国传统建筑数字化展示平台</span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center md:justify-end">
                        <div className="text-sm text-gray-400 mb-4 md:mb-0 md:mr-6">
                            © 2025 筑境云枢. 保留所有权利
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link to="/privacy" className="text-sm text-gray-400 hover:text-yellow-500 transition-colors">
                                隐私政策
                            </Link>
                            <span className="text-gray-600">|</span>
                            <Link to="/terms" className="text-sm text-gray-400 hover:text-yellow-500 transition-colors">
                                使用条款
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 装饰性波浪 */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-[url('/src/assets/images/wave-pattern.png')] bg-repeat-x opacity-10"></div>
            </div>

            {/* 装饰性流动线条 - 可以用CSS实现 */}
            <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
                <div className="flowing-lines"></div>
            </div>
        </footer>
    );
};

// 在你的全局CSS中添加以下样式来实现装饰性流动线条
/*
.flowing-lines {
  position: absolute;
  width: 200%;
  height: 100%;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 80px,
    rgba(255, 215, 0, 0.1) 80px,
    rgba(255, 215, 0, 0.1) 160px
  );
  animation: flow 20s linear infinite;
}

@keyframes flow {
  0% {
    transform: translateX(0) translateY(0);
  }
  100% {
    transform: translateX(-50%) translateY(0);
  }
}
*/

export default Footer;