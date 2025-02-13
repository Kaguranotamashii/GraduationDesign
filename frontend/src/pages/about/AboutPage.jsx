import React from 'react';
import { GithubIcon, Code2, Users, Coffee, Heart, Star } from 'lucide-react';
import Footer from "../../components/home/Footer";
import Navbar from "../../components/home/Navbar";

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Navbar />

            <main className="container mx-auto px-4 py-12">
                {/* 项目介绍 */}
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h1 className="text-4xl font-bold mb-6">关于筑境云枢</h1>
                    <p className="text-lg text-gray-600 mb-8">
                        这是一个开源的中国传统建筑文化交流平台，
                        我们希望通过开源社区的力量，共同探索和传承建筑文化的价值。
                    </p>
                    <div className="flex justify-center gap-4">
                        <a
                            href="https://github.com/yourusername/project"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <GithubIcon className="w-5 h-5 mr-2" />
                            GitHub
                        </a>
                        <a
                            href="https://github.com/yourusername/project/stargazers"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            <Star className="w-5 h-5 mr-2" />
                            Star Us
                        </a>
                    </div>
                </div>

                {/* 项目特色 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <Code2 className="w-10 h-10 text-red-500 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">开源共建</h3>
                        <p className="text-gray-600">
                            我们相信开源的力量。任何人都可以参与项目开发，
                            贡献代码，提出建议，共同完善这个平台。
                        </p>
                    </div>

                    <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <Users className="w-10 h-10 text-red-500 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">社区驱动</h3>
                        <p className="text-gray-600">
                            这是一个由社区驱动的项目，我们欢迎所有对建筑文化感兴趣的人加入，
                            分享经验，互相学习。
                        </p>
                    </div>

                    <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <Heart className="w-10 h-10 text-red-500 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">自由分享</h3>
                        <p className="text-gray-600">
                            在这里，你可以自由地分享你对建筑的理解和见解，
                            与其他建筑爱好者交流探讨。
                        </p>
                    </div>
                </div>

                {/* 参与贡献 */}
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm mb-16">
                    <h2 className="text-2xl font-bold mb-6">参与贡献</h2>
                    <div className="space-y-4 text-gray-600">
                        <p>我们欢迎任何形式的贡献，无论是：</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>提交新功能</li>
                            <li>报告Bug</li>
                            <li>改进文档</li>
                            <li>分享使用经验</li>
                            <li>参与社区讨论</li>
                        </ul>
                        <p className="mt-6">
                            如果你想为项目做出贡献，可以先查看我们的
                            <a href="#" className="text-red-500 hover:underline mx-1">贡献指南</a>，
                            了解具体的参与方式。
                        </p>
                    </div>
                </div>

                {/* 技术栈 */}
                <div className="max-w-4xl mx-auto mb-16">
                    <h2 className="text-2xl font-bold mb-6">技术栈</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['React', 'Django', 'PostgreSQL', 'Redis', 'Docker', 'Nginx', 'TailwindCSS', 'JWT'].map((tech) => (
                            <div
                                key={tech}
                                className="px-4 py-2 bg-gray-100 rounded-lg text-center hover:bg-gray-200 transition-colors"
                            >
                                {tech}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 联系我们 */}
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-6">联系我们</h2>
                    <p className="text-gray-600 mb-4">
                        有任何问题或建议？欢迎通过以下方式联系我们：
                    </p>
                    <div className="flex justify-center items-center gap-4">
                        <a
                            href="https://github.com/yourusername/project/issues"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-gray-600 hover:text-black transition-colors"
                        >
                            <GithubIcon className="w-5 h-5 mr-1" />
                            Issues
                        </a>
                        <span className="text-gray-300">|</span>
                        <a
                            href="mailto:contact@example.com"
                            className="flex items-center text-gray-600 hover:text-black transition-colors"
                        >
                            <Coffee className="w-5 h-5 mr-1" />
                            Email
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AboutPage;