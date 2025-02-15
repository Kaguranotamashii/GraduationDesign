import React from 'react';
import { ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';

const FeatureCard = ({ icon, title, description, link }) => {
    return (
        <div className="p-6 bg-white rounded-xl hover:shadow-xl transition-all duration-500
                    border border-gray-100 group cursor-pointer">
            <div className="mb-4 transform group-hover:scale-110 transition-transform duration-500">
                {icon}
            </div>
            <h3 className="text-xl font-semibold mb-3">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            <a href="#" className="inline-flex items-center text-red-600 hover:text-red-700
                               group-hover:translate-x-2 transition-transform duration-300">
                {link}
                <ChevronRight className="w-4 h-4 ml-1" />
            </a>
        </div>
    );
};

FeatureCard.propTypes = {
    icon: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
};

export default FeatureCard;