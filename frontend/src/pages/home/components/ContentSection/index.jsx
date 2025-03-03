import React, { useEffect, useRef } from 'react';
import FeatureSection from './components/FeatureSection';
import HeritageSection from './components/HeritageSection';
import SubscribeSection from './components/SubscribeSection';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const ContentSection = () => {
    const contentRef = useRef(null);

    useEffect(() => {
        // Create a smooth scrolling effect for the entire content section
        gsap.fromTo(contentRef.current,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: contentRef.current,
                    start: "top 80%",
                }
            }
        );

        // Create staggered reveal for child sections
        gsap.utils.toArray('.section-container').forEach((section, i) => {
            gsap.fromTo(section,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    delay: 0.2 * i,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 75%",
                    }
                }
            );
        });

        return () => {
            // Clean up ScrollTrigger instances when component unmounts
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <div className="bg-white" ref={contentRef}>
            <div className="section-container">
                <FeatureSection />
            </div>
            <div className="section-container">
                <HeritageSection />
            </div>
            <div className="section-container">
                <SubscribeSection />
            </div>
        </div>
    );
};

export default ContentSection;