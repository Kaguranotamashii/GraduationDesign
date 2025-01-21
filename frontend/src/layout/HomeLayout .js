import React from 'react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const HomeLayout = ({ children }) => {
    return (
        <div>
            <div className="home-layout">{children}</div>
        </div>
    );
};
export default HomeLayout;