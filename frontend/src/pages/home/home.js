
import React from 'react';

import HomeLayout from '../../layout/HomeLayout ';
import ThreeDLanding from '../../components/home/ThreeDLanding';
import Exploration from '../../components/home/Exploration';
 

const Home = () => {
    return (
        <div>
            <HomeLayout>
                <ThreeDLanding>
                    <Exploration/>
                </ThreeDLanding>

            </HomeLayout>
        </div>
    );
};

export default Home;