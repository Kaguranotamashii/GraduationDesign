import React from 'react';
import MainLayout from '@/layout/MainLayout.jsx';  // 自定义的布局组件


import './map.module.css';
import HeritageMap from "@/pages/map/components/HeritageMap.jsx";


const MapPage = () => {
    return (
        <MainLayout>
            <div className="map-page">
                <HeritageMap/>
            </div>
        </MainLayout>
);
}

export default MapPage;
