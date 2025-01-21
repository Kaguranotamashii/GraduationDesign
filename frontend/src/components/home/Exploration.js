// Exploration.js
import React from 'react';

const Exploration = ({ visible,scrollProgress  }) => {
  return (
    <div 
      className="fixed inset-0 bg-white"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 1s cubic-bezier(0.645, 0.045, 0.355, 1)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div className="p-16">
        <h2 className="text-5xl font-bold mb-6 text-gray-800">
          探索新世界 ✨
        </h2>
        <p className="text-xl leading-relaxed text-gray-600 max-w-2xl">
          在这里，我们将开启一段奇妙的旅程...
        </p>
      </div>
    </div>
  );
};

export default Exploration;