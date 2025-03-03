import React, { useEffect, useRef } from 'react';
import { GithubIcon, Code2, Users, Coffee, Heart, Star } from 'lucide-react';
import Footer from "../../components/home/Footer";
import Navbar from "../../components/home/Navbar";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const AboutPage = () => {
    const pageRef = useRef(null);
    const headerRef = useRef(null);
    const featuresRef = useRef(null);
    const contributionRef = useRef(null);
    const techStackRef = useRef(null);
    const contactRef = useRef(null);
    const parallaxLayersRef = useRef([]);
    const featureCardsRef = useRef([]);
    const techItemsRef = useRef([]);
    const particleRefs = useRef([]);

    const addToParallaxLayersRef = (el) => {
        if (el && !parallaxLayersRef.current.includes(el)) parallaxLayersRef.current.push(el);
    };

    const addToFeatureCardsRef = (el) => {
        if (el && !featureCardsRef.current.includes(el)) featureCardsRef.current.push(el);
    };

    const addToTechItemsRef = (el) => {
        if (el && !techItemsRef.current.includes(el)) techItemsRef.current.push(el);
    };

    const addToParticleRefs = (el) => {
        if (el && !particleRefs.current.includes(el)) particleRefs.current.push(el);
    };

    useEffect(() => {
        // Page Load Animation with Glowing Effect
        const tl = gsap.timeline();
        tl.fromTo(pageRef.current,
            { opacity: 0, scale: 1.1 },
            { opacity: 1, scale: 1, duration: 2, ease: "power4.inOut" }
        );

        // Header with Neon Glow and 3D Flip
        tl.fromTo(headerRef.current.querySelector('h1'),
            { y: 150, opacity: 0, rotationX: 90, transformPerspective: 1500 },
            {
                y: 0,
                opacity: 1,
                rotationX: 0,
                duration: 1.5,
                ease: "elastic.out(1, 0.3)",
                onUpdate: function () {
                    headerRef.current.querySelector('h1').style.textShadow = `0 0 ${this.ratio * 20}px rgba(255, 255, 255, ${this.ratio})`;
                },
            },
            "-=1.8"
        );

        tl.fromTo(headerRef.current.querySelector('p'),
            { y: 80, opacity: 0, scale: 0.9 },
            { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" },
            "-=1.2"
        );

        tl.fromTo(headerRef.current.querySelectorAll('a'),
            { y: 100, opacity: 0, rotation: 360 },
            {
                y: 0,
                opacity: 1,
                rotation: 0,
                duration: 1.5,
                stagger: 0.2,
                ease: "elastic.out(1, 0.5)",
                boxShadow: "0 0 15px rgba(255, 255, 255, 0.5)",
            },
            "-=1"
        );

        // Multi-Layered Parallax with Pulsing Glow
        parallaxLayersRef.current.forEach((layer, index) => {
            const depth = (index + 1) * 0.25;
            gsap.to(layer, {
                y: depth * 800,
                x: Math.cos(index) * 300,
                rotation: depth * 20,
                ease: "none",
                scrollTrigger: {
                    trigger: pageRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: 0.8,
                },
            });

            // Pulsing glow effect
            gsap.to(layer, {
                scale: 1.1,
                opacity: 0.7,
                repeat: -1,
                yoyo: true,
                duration: 2 + index * 0.5,
                ease: "sine.inOut",
            });
        });

        // Particle Animation for Background
        particleRefs.current.forEach((particle, index) => {
            gsap.to(particle, {
                x: Math.random() * 200 - 100,
                y: Math.random() * 600 - 300,
                scale: Math.random() * 0.5 + 0.5,
                opacity: 0,
                duration: 3 + Math.random() * 2,
                repeat: -1,
                ease: "power1.inOut",
                delay: index * 0.2,
            });
        });

        // Features Section with Holographic 3D Cards
        featureCardsRef.current.forEach((card, index) => {
            gsap.fromTo(card,
                { y: 200, opacity: 0, rotationY: 180, transformPerspective: 2000 },
                {
                    y: 0,
                    opacity: 1,
                    rotationY: 0,
                    duration: 1.8,
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: featuresRef.current,
                        start: "top 85%",
                        toggleActions: "play none none reset",
                    },
                }
            );

            gsap.to(card, {
                y: -60 * (index + 1),
                rotationY: index * 10,
                ease: "none",
                scrollTrigger: {
                    trigger: featuresRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1.2,
                },
            });

            // Holographic hover with glow
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                gsap.to(card, {
                    rotationY: x * 30,
                    rotationX: -y * 30,
                    z: 50,
                    boxShadow: `0 0 20px rgba(255, 255, 255, ${0.3 + Math.abs(x) * 0.2})`,
                    duration: 0.4,
                    ease: "power3.out",
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotationY: 0,
                    rotationX: 0,
                    z: 0,
                    boxShadow: "0 0 10px rgba(255, 255, 255, 0.1)",
                    duration: 0.6,
                    ease: "power3.out",
                });
            });
        });

        // Contribution Section with Exploding List Items
        const contribTl = gsap.timeline({
            scrollTrigger: {
                trigger: contributionRef.current,
                start: "top 80%",
            },
        });

        contribTl.fromTo(contributionRef.current.querySelector('h2'),
            { y: 120, opacity: 0, rotationX: 90 },
            {
                y: 0,
                opacity: 1,
                rotationX: 0,
                duration: 1.5,
                ease: "power4.out",
                textShadow: "0 0 15px rgba(255, 255, 255, 0.8)",
            }
        );

        contribTl.fromTo(contributionRef.current.querySelectorAll('li'),
            { x: (i) => (i % 2 === 0 ? -200 : 200), y: 100, opacity: 0, scale: 0.5 },
            {
                x: 0,
                y: (i) => -i * 20,
                opacity: 1,
                scale: 1,
                duration: 1.2,
                stagger: 0.2,
                ease: "elastic.out(1, 0.5)",
            },
            "-=1.2"
        );

        // Tech Stack with Orbital Burst and Glow
        techItemsRef.current.forEach((item, index) => {
            gsap.fromTo(item,
                { opacity: 0, scale: 0, rotationY: 360, transformPerspective: 1500 },
                {
                    opacity: 1,
                    scale: 1,
                    rotationY: 0,
                    duration: 1.5,
                    ease: "back.out(1.7)",
                    scrollTrigger: {
                        trigger: techStackRef.current,
                        start: "top 85%",
                    },
                }
            );

            gsap.to(item, {
                motionPath: {
                    path: [
                        { x: 0, y: 0 },
                        { x: Math.cos(index) * 80, y: -80 * index },
                        { x: Math.sin(index) * 120, y: -120 * index },
                    ],
                    curviness: 1.8,
                },
                ease: "none",
                scrollTrigger: {
                    trigger: techStackRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1,
                },
            });

            // Glowing hover with particle burst effect
            item.addEventListener('mousemove', (e) => {
                const rect = item.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                gsap.to(item, {
                    rotationY: x * 40,
                    rotationX: -y * 40,
                    z: 60,
                    boxShadow: `0 0 25px rgba(255, 255, 255, ${0.5 + Math.abs(x) * 0.3})`,
                    duration: 0.4,
                    ease: "power3.out",
                });

                // Simulated particle burst
                gsap.to(item.querySelector('.particle-emitter'), {
                    scale: 1.5,
                    opacity: 0.8,
                    duration: 0.3,
                    ease: "power2.out",
                    onComplete: () => {
                        gsap.to(item.querySelector('.particle-emitter'), {
                            scale: 0,
                            opacity: 0,
                            duration: 0.5,
                            ease: "power2.in",
                        });
                    },
                });
            });

            item.addEventListener('mouseleave', () => {
                gsap.to(item, {
                    rotationY: 0,
                    rotationX: 0,
                    z: 0,
                    boxShadow: "0 0 10px rgba(255, 255, 255, 0.2)",
                    duration: 0.6,
                    ease: "power3.out",
                });
            });
        });

        // Contact Section with Floating Buttons and Glow
        const contactTl = gsap.timeline({
            scrollTrigger: {
                trigger: contactRef.current,
                start: "top 80%",
            },
        });

        contactTl.fromTo(contactRef.current.querySelector('h2'),
            { y: 100, opacity: 0, rotationX: 90 },
            {
                y: 0,
                opacity: 1,
                rotationX: 0,
                duration: 1.5,
                ease: "power4.out",
                textShadow: "0 0 15px rgba(255, 255, 255, 0.8)",
            }
        );

        contactTl.fromTo(contactRef.current.querySelectorAll('a'),
            { y: 150, opacity: 0, rotation: 720 },
            {
                y: (i) => -i * 30,
                opacity: 1,
                rotation: 0,
                duration: 1.8,
                stagger: 0.3,
                ease: "elastic.out(1, 0.5)",
                boxShadow: "0 0 20px rgba(255, 255, 255, 0.6)",
            },
            "-=1.2"
        );

        // Continuous floating animation for buttons
        gsap.to(contactRef.current.querySelectorAll('a'), {
            y: "+=20",
            repeat: -1,
            yoyo: true,
            duration: 2,
            ease: "sine.inOut",
            stagger: 0.2,
        });

        // Advanced Mouse-Driven Effects with Particles
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const xPos = (clientX / window.innerWidth - 0.5) * 2;
            const yPos = (clientY / window.innerHeight - 0.5) * 2;

            gsap.to('.parallax-layer-fast', {
                x: xPos * 100,
                y: yPos * 100,
                rotation: xPos * 25,
                scale: 1.2,
                duration: 0.8,
                ease: "power3.out",
            });

            gsap.to('.parallax-layer-slow', {
                x: xPos * 50,
                y: yPos * 50,
                rotation: yPos * 15,
                duration: 1.2,
                ease: "power3.out",
            });

            gsap.to(featureCardsRef.current, {
                x: xPos * 30,
                y: yPos * 30,
                rotationY: xPos * 15,
                stagger: 0.05,
                duration: 0.6,
                ease: "power2.out",
            });

            gsap.to(techItemsRef.current, {
                x: xPos * 20,
                y: yPos * 20,
                rotationX: yPos * 15,
                stagger: 0.03,
                duration: 0.6,
                ease: "power2.out",
            });
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Cleanup
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            window.removeEventListener('mousemove', handleMouseMove);
            featureCardsRef.current.forEach(card => {
                card.removeEventListener('mousemove', () => {});
                card.removeEventListener('mouseleave', () => {});
            });
            techItemsRef.current.forEach(item => {
                item.removeEventListener('mousemove', () => {});
                item.removeEventListener('mouseleave', () => {});
            });
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black overflow-hidden" ref={pageRef}>
            {/* Enhanced Parallax Background with Particles */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 to-black/80 backdrop-blur-2xl"></div>
                <div ref={addToParallaxLayersRef} className="absolute top-10 left-10 w-72 h-72 rounded-full bg-gradient-to-br from-red-500/40 to-transparent parallax-layer-fast blur-xl"></div>
                <div ref={addToParallaxLayersRef} className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/40 to-transparent parallax-layer-fast blur-xl"></div>
                <div ref={addToParallaxLayersRef} className="absolute top-1/3 left-1/4 w-56 h-56 rounded-full bg-gradient-to-br from-yellow-500/30 to-transparent parallax-layer-slow blur-lg"></div>
                <div ref={addToParallaxLayersRef} className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-green-500/30 to-transparent parallax-layer-slow blur-lg"></div>
                <div ref={addToParallaxLayersRef} className="absolute top-3/4 left-1/2 w-48 h-48 rounded-full bg-gradient-to-br from-purple-500/35 to-transparent parallax-layer-fast blur-lg"></div>
                {/* Particle Elements */}
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        ref={addToParticleRefs}
                        className="absolute w-2 h-2 bg-white/50 rounded-full"
                        style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
                    />
                ))}
            </div>

            <Navbar />

            <main className="container mx-auto px-4 py-12 relative z-10 text-white">
                {/* Header with Neon Glow */}
                <div ref={headerRef} className="max-w-4xl mx-auto text-center mb-32 perspective-1500">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6">关于筑境云枢</h1>
                    <p className="text-lg mb-12 max-w-3xl mx-auto">这是一个开源的中国传统建筑文化交流平台，我们通过社区协作，探索和传承建筑文化的深层价值。</p>
                    <div className="flex justify-center gap-6">
                        <a href="https://github.com/yourusername/project" target="_blank" rel="noopener noreferrer" className="flex items-center px-8 py-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all transform hover:shadow-[0_0_25px_rgba(255,255,255,0.7)]">
                            <GithubIcon className="w-5 h-5 mr-2" /> GitHub
                        </a>
                        <a href="https://github.com/yourusername/project/stargazers" target="_blank" rel="noopener noreferrer" className="flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:shadow-[0_0_25px_rgba(255,0,0,0.7)]">
                            <Star className="w-5 h-5 mr-2" /> Star Us
                        </a>
                    </div>
                </div>

                {/* Features with Holographic 3D Cards */}
                <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32 perspective-1500">
                    {[
                        { icon: <Code2 className="w-16 h-16 text-red-500 mb-6" />, title: "开源共建", desc: "通过开源协作，任何人可为平台贡献代码与创意。" },
                        { icon: <Users className="w-16 h-16 text-blue-500 mb-6" />, title: "社区驱动", desc: "由热爱建筑文化的人们共同推动与发展。" },
                        { icon: <Heart className="w-16 h-16 text-purple-500 mb-6" />, title: "自由分享", desc: "自由交流建筑见解，连接全球爱好者。" },
                    ].map((feature, index) => (
                        <div key={index} ref={addToFeatureCardsRef} className="p-8 bg-gray-800/90 rounded-xl shadow-lg backdrop-blur-lg transform transition-all relative">
                            {feature.icon}
                            <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                            <p className="text-gray-300">{feature.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Contribution with Exploding List */}
                <div ref={contributionRef} className="max-w-4xl mx-auto bg-gray-800/90 p-10 rounded-2xl shadow-lg mb-32 backdrop-blur-lg">
                    <h2 className="text-3xl font-bold mb-8 border-b border-gray-700 pb-4">参与贡献</h2>
                    <div className="space-y-6 text-gray-300">
                        <p className="text-lg">我们欢迎各种形式的参与，例如：</p>
                        <ul className="space-y-4 ml-6">
                            {["提交新功能", "报告Bug", "改进文档", "分享使用经验", "参与社区讨论"].map((item, idx) => (
                                <li key={idx} className="flex items-center">
                                    <span className={`w-3 h-3 bg-${["red-500", "blue-500", "green-500", "yellow-500", "purple-500"][idx]} rounded-full mr-4 animate-pulse`}></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <p className="mt-8 text-lg border-t border-gray-700 pt-6">
                            想加入我们？请查看
                            <a href="#" className="text-red-500 hover:text-red-400 mx-2 relative inline-block">
                                贡献指南
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 transform scale-x-0 transition-transform origin-left hover:scale-x-100"></span>
                            </a>
                            了解详情。
                        </p>
                    </div>
                </div>

                {/* Tech Stack with Orbital Burst */}
                <div ref={techStackRef} className="max-w-4xl mx-auto mb-32 perspective-1500">
                    <h2 className="text-3xl font-bold mb-10 text-center">技术栈</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { name: 'React', color: 'bg-blue-500' },
                            { name: 'Django', color: 'bg-green-600' },
                            { name: 'PostgreSQL', color: 'bg-blue-600' },
                            { name: 'Redis', color: 'bg-red-600' },
                            { name: 'Docker', color: 'bg-blue-500' },
                            { name: 'Nginx', color: 'bg-green-500' },
                            { name: 'TailwindCSS', color: 'bg-teal-500' },
                            { name: 'JWT', color: 'bg-purple-500' },
                        ].map((tech, index) => (
                            <div key={tech.name} ref={addToTechItemsRef} className="relative group tech-item transform transition-all">
                                <div className={`absolute inset-0 rounded-xl opacity-20 group-hover:opacity-50 transition-opacity bg-gradient-to-br from-${tech.color.replace('bg-', '')} to-transparent particle-emitter`}></div>
                                <div className="px-6 py-4 bg-gray-800/90 border border-gray-700 rounded-xl text-center shadow-lg backdrop-blur-lg">
                                    <div className={`w-3 h-3 ${tech.color} rounded-full mx-auto mb-3 animate-pulse`}></div>
                                    <span className="font-medium">{tech.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact with Floating Glowing Buttons */}
                <div ref={contactRef} className="max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-3xl font-bold mb-8">联系我们</h2>
                    <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">有问题或建议？欢迎联系我们：</p>
                    <div className="flex justify-center items-center gap-8 perspective-1500">
                        <a href="https://github.com/yourusername/project/issues" target="_blank" rel="noopener noreferrer" className="flex items-center px-6 py-3 bg-gray-800/90 text-white hover:text-gray-200 rounded-xl transition-all transform hover:shadow-[0_0_20px_rgba(255,255,255,0.6)] backdrop-blur-lg">
                            <GithubIcon className="w-5 h-5 mr-2" /> Issues
                        </a>
                        <a href="mailto:contact@example.com" className="flex items-center px-6 py-3 bg-gray-800/90 text-white hover:text-gray-200 rounded-xl transition-all transform hover:shadow-[0_0_20px_rgba(255,255,255,0.6)] backdrop-blur-lg">
                            <Coffee className="w-5 h-5 mr-2" /> Email
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AboutPage;