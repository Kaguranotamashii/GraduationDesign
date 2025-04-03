import React, { useEffect, useRef } from 'react';
import { Github, Code, Users, Heart, Star, Mail, Hexagon } from 'lucide-react';
import Footer from "../../components/home/Footer";
import Navbar from "../../components/home/Navbar";
import { motion, useScroll, useTransform, useInView, useAnimation } from 'framer-motion';

const AboutPage = () => {
    const controls = useAnimation();
    const { scrollYProgress } = useScroll();

    const headerRef = useRef(null);
    const featuresRef = useRef(null);
    const contributionRef = useRef(null);
    const techStackRef = useRef(null);
    const contactRef = useRef(null);

    const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
    const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });
    const contributionInView = useInView(contributionRef, { once: true, amount: 0.3 });
    const techStackInView = useInView(techStackRef, { once: true, amount: 0.3 });
    const contactInView = useInView(contactRef, { once: true, amount: 0.5 });

    // Parallax effects
    const bgY = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const textY = useTransform(scrollYProgress, [0, 1], [0, -100]);

    useEffect(() => {
        if (headerInView) {
            controls.start("visible");
        }
    }, [controls, headerInView]);

    // Fancy gradient blob animation
    const blobVariants = {
        initial: { scale: 0.8, opacity: 0.5 },
        animate: {
            scale: 1.1,
            opacity: 0.8,
            transition: {
                duration: 8,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
            }
        }
    };

    // Card hover effect
    const cardVariants = {
        initial: { y: 0 },
        hover: {
            y: -12,
            transition: { duration: 0.3, ease: "easeOut" }
        }
    };

    // Text reveal animations
    const textVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    // Staggered container animations
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
                ease: "easeOut"
            }
        }
    };

    // Item animations
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white overflow-hidden">
            {/* Animated Background Blobs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div
                    style={{ y: bgY }}
                    className="w-full h-full absolute"
                >
                    <motion.div
                        className="absolute top-10 -left-40 w-96 h-96 rounded-full bg-purple-700/20 blur-[100px]"
                        variants={blobVariants}
                        initial="initial"
                        animate="animate"
                        custom={1}
                    />
                    <motion.div
                        className="absolute bottom-20 -right-20 w-96 h-96 rounded-full bg-blue-700/20 blur-[100px]"
                        variants={blobVariants}
                        initial="initial"
                        animate="animate"
                        custom={2}
                    />
                    <motion.div
                        className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-red-700/20 blur-[100px]"
                        variants={blobVariants}
                        initial="initial"
                        animate="animate"
                        custom={3}
                    />
                </motion.div>
            </div>

            {/* Fixed Navbar */}
            <Navbar />

            <main className="relative z-10">
                {/* Hero Section */}
                <motion.section
                    ref={headerRef}
                    className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-20"
                    initial="hidden"
                    animate={headerInView ? "visible" : "hidden"}
                    variants={containerVariants}
                >
                    <div className="container mx-auto px-4 md:px-8 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <motion.div variants={textVariants}>
                <span className="inline-block px-3 py-1 text-sm font-medium bg-red-500/20 text-red-300 rounded-full mb-6">
                  开源项目
                </span>
                            </motion.div>

                            <motion.h1
                                variants={textVariants}
                                className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400"
                            >
                                关于筑境云枢
                            </motion.h1>

                            <motion.p
                                variants={textVariants}
                                className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto"
                            >
                                这是一个开源的中国传统建筑文化交流平台，我们通过社区协作，探索和传承建筑文化的深层价值。
                            </motion.p>

                            <motion.div
                                variants={containerVariants}
                                className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6"
                            >
                                <motion.a
                                    href="https://github.com/yourusername/project"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-lg border border-white/10 hover:bg-white/20 transition-all duration-300 w-full sm:w-auto"
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Github className="w-5 h-5 mr-3" /> GitHub
                                </motion.a>

                                <motion.a
                                    href="https://github.com/yourusername/project/stargazers"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-400 transition-all duration-300 w-full sm:w-auto"
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Star className="w-5 h-5 mr-3" /> Star Us
                                </motion.a>
                            </motion.div>
                        </div>
                    </div>
                </motion.section>

                {/* Features Section */}
                <section
                    ref={featuresRef}
                    className="py-24 relative z-10"
                >
                    <div className="container mx-auto px-4 md:px-8">
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 0, y: 30 }}
                            animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.6 }}
                        >
              <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-500/20 text-blue-300 rounded-full mb-4">
                核心理念
              </span>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">平台特色</h2>
                            <p className="text-gray-400 max-w-2xl mx-auto">
                                我们致力于建立一个全面、专业、开放的传统建筑文化交流平台
                            </p>
                        </motion.div>

                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
                            initial="hidden"
                            animate={featuresInView ? "visible" : "hidden"}
                            variants={containerVariants}
                        >
                            {[
                                {
                                    icon: <Code className="w-10 h-10 text-red-400" />,
                                    title: "开源共建",
                                    desc: "通过开源协作，任何人可为平台贡献代码与创意，共同完善这个传统文化数字平台。"
                                },
                                {
                                    icon: <Users className="w-10 h-10 text-blue-400" />,
                                    title: "社区驱动",
                                    desc: "由热爱建筑文化的人们共同推动与发展，专业人士和爱好者联动创造价值。"
                                },
                                {
                                    icon: <Heart className="w-10 h-10 text-purple-400" />,
                                    title: "自由分享",
                                    desc: "自由交流建筑见解，连接全球爱好者，促进传统建筑文化的研究与传播。"
                                },
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    className="relative group"
                                    variants={itemVariants}
                                >
                                    <motion.div
                                        variants={cardVariants}
                                        initial="initial"
                                        whileHover="hover"
                                        className="h-full p-8 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col"
                                    >
                                        <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 mb-6 shadow-lg">
                                            {feature.icon}
                                        </div>
                                        <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                                        <p className="text-gray-400 flex-grow">{feature.desc}</p>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Contribution Section */}
                <section
                    ref={contributionRef}
                    className="py-24 relative"
                >
                    <div className="container mx-auto px-4 md:px-8">
                        <motion.div
                            className="max-w-4xl mx-auto rounded-3xl overflow-hidden"
                            initial={{ opacity: 0, y: 50 }}
                            animate={contributionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                            transition={{ duration: 0.7 }}
                        >
                            <div className="p-2 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 rounded-3xl">
                                <div className="bg-gray-900 rounded-2xl p-8 md:p-12">
                                    <div className="flex flex-col md:flex-row gap-12">
                                        <div className="md:w-1/2">
                      <span className="inline-block px-3 py-1 text-sm font-medium bg-purple-500/20 text-purple-300 rounded-full mb-4">
                        加入我们
                      </span>
                                            <h2 className="text-3xl font-bold mb-6">参与贡献</h2>
                                            <p className="text-gray-300 mb-8">
                                                我们欢迎各种形式的参与，无论您是开发者、设计师、研究者还是建筑爱好者，都可以在这里找到发挥才能的方式。
                                            </p>
                                            <a
                                                href="#"
                                                className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-medium transition-all duration-300 transform hover:translate-y-[-2px]"
                                            >
                                                贡献指南
                                                <svg className="ml-2 w-5 h-5" viewBox="0 0 24 24" fill="none">
                                                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </a>
                                        </div>
                                        <div className="md:w-1/2">
                                            <ul className="space-y-4">
                                                {[
                                                    "提交新功能和模型",
                                                    "报告Bug与改进建议",
                                                    "完善文档与教程",
                                                    "分享使用经验与案例",
                                                    "参与社区讨论与研究"
                                                ].map((item, idx) => (
                                                    <motion.li
                                                        key={idx}
                                                        className="flex items-center bg-white/5 p-4 rounded-xl border border-white/10"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={contributionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                                                        transition={{ duration: 0.5, delay: 0.1 * idx }}
                                                    >
                                                        <div className="flex items-center justify-center mr-4 w-10 h-10 rounded-lg bg-purple-500/20">
                                                            <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none">
                                                                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                        </div>
                                                        <span className="text-gray-200">{item}</span>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Tech Stack Section */}
                <section
                    ref={techStackRef}
                    className="py-24 relative"
                >
                    <div className="container mx-auto px-4 md:px-8">
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 0, y: 30 }}
                            animate={techStackInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.6 }}
                        >
              <span className="inline-block px-3 py-1 text-sm font-medium bg-green-500/20 text-green-300 rounded-full mb-4">
                技术支持
              </span>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">技术栈</h2>
                            <p className="text-gray-400 max-w-2xl mx-auto">
                                我们使用现代前沿技术，为传统文化打造现代化的数字体验
                            </p>
                        </motion.div>

                        <motion.div
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:gap-6 max-w-4xl mx-auto"
                            initial="hidden"
                            animate={techStackInView ? "visible" : "hidden"}
                            variants={containerVariants}
                        >
                            {[
                                { name: 'React', color: 'from-blue-400 to-blue-600' },
                                { name: 'Django', color: 'from-green-400 to-green-600' },
                                { name: 'PostgreSQL', color: 'from-blue-500 to-blue-700' },
                                { name: 'Redis', color: 'from-red-400 to-red-600' },
                                { name: 'Docker', color: 'from-blue-400 to-blue-600' },
                                { name: 'Nginx', color: 'from-green-400 to-green-600' },
                                { name: 'TailwindCSS', color: 'from-teal-400 to-teal-600' },
                                { name: 'JWT', color: 'from-purple-400 to-purple-600' },
                            ].map((tech, idx) => (
                                <motion.div
                                    key={tech.name}
                                    variants={itemVariants}
                                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                >
                                    <div className="group relative p-[1px] rounded-xl bg-gradient-to-br from-white/30 via-white/20 to-white/0 hover:from-white/40 hover:via-white/30 hover:to-white/10 transition-all duration-300">
                                        <div className="p-6 rounded-xl bg-gray-900 relative z-10 h-full flex flex-col items-center">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-br ${tech.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                                                <Hexagon className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="font-medium text-gray-200 group-hover:text-white transition-colors">
                                                {tech.name}
                                            </h3>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Contact Section */}
                <section
                    ref={contactRef}
                    className="py-24 relative"
                >
                    <div className="container mx-auto px-4 md:px-8">
                        <motion.div
                            className="max-w-3xl mx-auto text-center"
                            initial={{ opacity: 0, y: 30 }}
                            animate={contactInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.6 }}
                        >
              <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-500/20 text-blue-300 rounded-full mb-4">
                联系我们
              </span>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">有问题或建议？</h2>
                            <p className="text-gray-400 mb-10">
                                我们重视每一位社区成员的反馈，欢迎通过以下方式联系我们
                            </p>

                            <motion.div
                                className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6"
                                initial="hidden"
                                animate={contactInView ? "visible" : "hidden"}
                                variants={containerVariants}
                            >
                                <motion.a
                                    href="https://github.com/yourusername/project/issues"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 w-full sm:w-auto"
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Github className="w-5 h-5 mr-3" /> GitHub Issues
                                </motion.a>

                                <motion.a
                                    href="mailto:contact@example.com"
                                    className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all duration-300 w-full sm:w-auto"
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Mail className="w-5 h-5 mr-3" /> 发送邮件
                                </motion.a>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default AboutPage;