import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home/home.js';
import './index.css';
import ThreeScene from './pages/home/ThreeScene.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ThreeScene />} />
        <Route path="/test" element={<a>123123万岁</a>} />
      </Routes>
    </Router>
  );
}

export default App;