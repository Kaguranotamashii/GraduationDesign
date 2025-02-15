import React from 'react';
import { useInView } from 'react-intersection-observer';
import { useTrail, animated } from '@react-spring/web';
import FeatureCard from './FeatureCard';
import { features } from './constants.jsx';

const FeatureSection = () => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1
    });

    const trail = useTrail(features.length, {
        from: { opacity: 0, y: 40 },
        to: { opacity: inView ? 1 : 0, y: inView ? 0 : 40 },
        config: { tension: 280, friction: 60 },
    });

    return (
        <section className="py-20 px-4" ref={ref}>
            <div className="container mx-auto">
                <h2 className="text-4xl font-bold text-center mb-16">
                    <span className="text-red-600">探索</span> 建筑遗产
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {trail.map((style, index) => (
                        <animated.div key={index} style={style}>
                            <FeatureCard {...features[index]} />
                        </animated.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeatureSection;