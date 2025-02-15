import React from 'react';
import MainLayout from '@/layout/MainLayout.jsx';
import Background from "@/components/home/Background.jsx";
import ContentSection from "@/pages/home/components/ContentSection/";


const HomePage = () => {
    return (
        <MainLayout>
            <div className="home-page">
                <Background></Background>
                <ContentSection />
            </div>
        </MainLayout>
    );
};

export default HomePage;