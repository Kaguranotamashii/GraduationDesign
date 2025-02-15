import React from 'react';
import FeatureSection from './components/FeatureSection';
import HeritageSection from './components/HeritageSection';
import SubscribeSection from './components/SubscribeSection';

const ContentSection = () => {
    return (
        <div className="bg-white">
            <FeatureSection />
            <HeritageSection />
            <SubscribeSection />
        </div>
    );
};

export default ContentSection;