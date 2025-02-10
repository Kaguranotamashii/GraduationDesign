// ContentSection.js
import { MapPin, Clock, Book, Camera, ChevronRight } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useSpring, animated, useTrail } from '@react-spring/web';

const ContentSection = () => {
    const features = [
        {
            icon: <MapPin className="w-8 h-8 text-red-600" />,
            title: "互动地图",
            description: "探索中国各地古建筑遗产，通过互动地图发现近在咫尺的历史瑰宝",
            link: "探索地图"
        },
        {
            icon: <Clock className="w-8 h-8 text-red-600" />,
            title: "历史长河",
            description: "跨越朝代，了解中国建筑发展脉络，感受匠心营造的精妙演变",
            link: "查看时间线"
        },
        {
            icon: <Book className="w-8 h-8 text-red-600" />,
            title: "古籍档案",
            description: "查阅历史文献记载，深入了解古建筑的营造技艺与文化内涵",
            link: "浏览档案"
        },
        {
            icon: <Camera className="w-8 h-8 text-red-600" />,
            title: "虚拟游览",
            description: "通过全景影像技术，身临其境体验中国古建筑的恢宏气势",
            link: "开始游览"
        }
    ];

    const locations = [
        {
            title: '故宫太和殿',
            desc: '天下第一大殿，尽显皇权威仪',
            image: '/images/swiper/1.jpg',
            tags: ['明清', '宫殿建筑', '世界遗产']
        },
        {
            title: '敦煌莫高窟',
            desc: '佛教艺术瑰宝，千年壁画胜境',
            image: '/images/swiper/2.jpg',
            tags: ['石窟寺庙', '丝绸之路', '世界遗产']
        },
        {
            title: '苏州园林',
            desc: '古典园林典范，诗意山水之美',
            image: '/images/swiper/3.jpg',
            tags: ['园林', '江南建筑', '世界遗产']
        }
    ];

    // 使用 react-intersection-observer 监测元素是否进入视口
    const [featuresRef, featuresInView] = useInView({
        triggerOnce: true,
        threshold: 0.1
    });

    const [locationsRef, locationsInView] = useInView({
        triggerOnce: true,
        threshold: 0.1
    });

    // 特性卡片动画
    const featureTrail = useTrail(features.length, {
        from: { opacity: 0, y: 40 },
        to: { opacity: featuresInView ? 1 : 0, y: featuresInView ? 0 : 40 },
        config: { tension: 280, friction: 60 },
    });

    // 地点卡片动画
    const locationTrail = useTrail(locations.length, {
        from: { opacity: 0, scale: 0.9 },
        to: { opacity: locationsInView ? 1 : 0, scale: locationsInView ? 1 : 0.9 },
        config: { tension: 280, friction: 60 },
    });

    return (
        <div className="bg-white">
            <section className="py-20 px-4" ref={featuresRef}>
                <div className="container mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-16">
                        <span className="text-red-600">探索</span> 建筑遗产
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featureTrail.map((style, index) => (
                            <animated.div key={index} style={style}>
                                <div className="p-6 bg-white rounded-xl hover:shadow-xl transition-all duration-500
                                            border border-gray-100 group cursor-pointer">
                                    <div className="mb-4 transform group-hover:scale-110 transition-transform duration-500">
                                        {features[index].icon}
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">{features[index].title}</h3>
                                    <p className="text-gray-600 mb-4">{features[index].description}</p>
                                    <a href="#" className="inline-flex items-center text-red-600 hover:text-red-700
                                                       group-hover:translate-x-2 transition-transform duration-300">
                                        {features[index].link}
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </a>
                                </div>
                            </animated.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 px-4 bg-gray-50" ref={locationsRef}>
                <div className="container mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-16">
                        <span className="text-red-600">精选</span> 古迹
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {locationTrail.map((style, index) => (
                            <animated.div key={index} style={style}>
                                <div className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer">
                                    <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                                        <img
                                            src={locations[index].image}
                                            alt={locations[index].title}
                                            className="w-full h-full object-cover transform transition-transform duration-700
                                                     group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent
                                                  opacity-90 transition-opacity duration-500">
                                        <div className="absolute bottom-0 p-6 w-full">
                                            <h3 className="text-2xl font-bold text-white mb-2
                                                       transform group-hover:translate-y-[-4px] transition-transform">
                                                {locations[index].title}
                                            </h3>
                                            <p className="text-gray-200 mb-4 transform group-hover:translate-y-[-4px]
                                                       transition-transform delay-75">
                                                {locations[index].desc}
                                            </p>
                                            <div className="flex flex-wrap gap-2 transform group-hover:translate-y-[-4px]
                                                         transition-transform delay-100">
                                                {locations[index].tags.map((tag, tagIndex) => (
                                                    <span key={tagIndex}
                                                          className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full
                                                                   text-sm text-white">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </animated.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 px-4 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/swiper/4.jpg"
                        alt="背景"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60 backdrop-blur-sm"></div>
                </div>
                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <h2 className="text-4xl font-bold mb-6 text-white">订阅资讯</h2>
                    <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
                        获取最新的古建筑保护动态和虚拟导览信息，探索更多中国传统建筑的精彩故事
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
                        <input
                            type="email"
                            placeholder="请输入您的邮箱"
                            className="px-6 py-4 rounded-full border-2 border-white/30 bg-white/10 text-white
                                     placeholder:text-gray-300 focus:outline-none focus:border-red-500
                                     backdrop-blur-md transition-all duration-300 flex-1"
                        />
                        <button className="px-8 py-4 bg-red-600 text-white rounded-full hover:bg-red-700
                                         transition-colors shadow-lg hover:shadow-xl hover:shadow-red-600/20
                                         transform hover:-translate-y-0.5">
                            立即订阅
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContentSection;