import React from 'react';
import Background from './Background';
import Navbar from './Navbar';

const Header = () => {
    return (
        <div className="min-h-screen relative">
            <Navbar />
            <Background />

        </div>
    );
};

export default Header;