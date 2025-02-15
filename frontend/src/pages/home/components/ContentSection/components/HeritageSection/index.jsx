import React from 'react';
import { useInView } from 'react-intersection-observer';
import { useTrail, animated } from '@react-spring/web';
import HeritageCard from './HeritageCard';
import { heritageLocations } from './constants';

const HeritageSection = () => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1
    });

    const trail = useTrail(heritageLocations.length, {
        from: { opacity: 0, scale: 0.9 },
        to: { opacity: inView ? 1 : 0, scale: inView ? 1 : 0.9 },
        config: { tension: 280, friction: 60 },
    });

    return (
        <section className="py-20 px-4 bg-gray-50" ref={ref}>
            <div className="container mx-auto">
                <h2 className="text-4xl font-bold text-center mb-16">
                    <span className="text-red-600">精选</span> 古迹
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {trail.map((style, index) => (
                        <animated.div key={index} style={style}>
                            <HeritageCard {...heritageLocations[index]} />
                        </animated.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeritageSection;