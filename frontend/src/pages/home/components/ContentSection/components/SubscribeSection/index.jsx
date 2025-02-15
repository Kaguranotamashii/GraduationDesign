import React from 'react';
import SubscribeForm from './SubscribeForm';

const SubscribeSection = () => {
    return (
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
                <SubscribeForm />
            </div>
        </section>
    );
};

export default SubscribeSection;