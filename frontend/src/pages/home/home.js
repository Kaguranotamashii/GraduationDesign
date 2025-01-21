import React, { useState } from 'react';
import HomeLayout from '../../layout/HomeLayout ';
import ThreeDLanding from '../../components/home/ThreeDLanding';
import Exploration from '../../components/home/Exploration';

const Home = () => {
    const [scrollProgress, setScrollProgress] = useState(0);

    return (
        <div>
            <HomeLayout>
                <ThreeDLanding scrollProgress={scrollProgress} setScrollProgress={setScrollProgress}>
                    <Exploration visible={scrollProgress > 0.8} />
                </ThreeDLanding>
            </HomeLayout>
        </div>
    );
};

export default Home;