import React from 'react';
import WeatherModel from '../threeModels/WeatherModel';

const Exploration = ({ visible }) => {
  return (
    <div 
      className="fixed inset-0 bg-white"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 1s cubic-bezier(0.645, 0.045, 0.355, 1)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div style= {{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        height: '100%',
}} >
        <WeatherModel />
         
      </div>
    </div>
  );
};

export default Exploration;