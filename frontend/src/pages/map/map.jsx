import React from 'react';
import HeritageMap from "../../components/map/HeritageMap";
import Navbar from "../../components/home/Navbar";
import './map.css';

const Map = () => {
    return (
        <div className="site-layout">
            <div className="navbar-wrapper">
                <Navbar />
            </div>
            <div className="map-container">
                <HeritageMap />
            </div>
        </div>
    );
}

export default Map;