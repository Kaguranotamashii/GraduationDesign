import React from 'react';
import { MessageSquare, GithubIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Footer = () => {
    const location = useLocation();

    // 判断是否在管理界面
    const isAdminPage = location.pathname.includes('/admin');

    const links = {
        explore: ['地图', '时间线', '虚拟游览', '古籍档案'],
        resources: ['学术研究', '教育资源', '出版物', '多媒体'],
        about: ['关于我们', '团队介绍', '合作伙伴', '联系方式'],
        social: [
            { icon: <MessageSquare className="w-5 h-5" />, href: '#', label: '微信' },
            { icon: <GithubIcon className="w-5 h-5" />, href: '#', label: 'Github' }
        ]
    };

    // 管理界面使用简化版页脚
    if (isAdminPage) {
        return (
            <footer className="bg-gray-50 border-t border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="text-sm text-gray-500">
                            © 2025 华夏建筑. 保留所有权利
                        </div>
                        <div className="flex space-x-6 mt-2 md:mt-0">
                            {links.social.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    className="text-gray-400 hover:text-red-400 transition-colors"
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

    // 前台页面使用完整版页脚
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">华夏建筑</h3>
                        <p className="text-gray-400">
                            致力于通过数字创新保护与传播中国传统建筑文化遗产。
                        </p>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">探索</h4>
                        <ul className="space-y-2">
                            {links.explore.map((link) => (
                                <li key={link}>
                                    <a href="#" className="hover:text-red-400 transition-colors">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">资源</h4>
                        <ul className="space-y-2">
                            {links.resources.map((link) => (
                                <li key={link}>
                                    <a href="#" className="hover:text-red-400 transition-colors">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">关于</h4>
                        <ul className="space-y-2">
                            {links.about.map((link) => (
                                <li key={link}>
                                    <a href="#" className="hover:text-red-400 transition-colors">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="text-sm text-gray-400 mb-4 md:mb-0">
                            © 2025 华夏建筑. 保留所有权利
                        </div>

                        <div className="flex space-x-6">
                            {links.social.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    className="text-gray-400 hover:text-red-400 transition-colors"
                                    aria-label={social.label}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;