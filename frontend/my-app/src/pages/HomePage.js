// src/pages/HomePage.js
import React from 'react';
import WeatherModel from "../component/WeatherModel";

const HomePage = () => {
    return (
        <div>
            <h1>Welcome to the Ancient Architecture Learning Platform</h1>
            <p>Here you can explore ancient buildings with interactive 3D models and experience different weather effects!</p>


            <WeatherModel />

        </div>


    );
};

export default HomePage;
