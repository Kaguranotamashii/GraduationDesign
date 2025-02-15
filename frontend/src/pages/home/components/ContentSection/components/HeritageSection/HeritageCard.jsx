import React from 'react';
import PropTypes from 'prop-types';

const HeritageCard = ({ title, desc, image, tags }) => {
    return (
        <div className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer">
            <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transform transition-transform duration-700
                             group-hover:scale-110"
                />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent
                          opacity-90 transition-opacity duration-500">
                <div className="absolute bottom-0 p-6 w-full">
                    <h3 className="text-2xl font-bold text-white mb-2
                               transform group-hover:translate-y-[-4px] transition-transform">
                        {title}
                    </h3>
                    <p className="text-gray-200 mb-4 transform group-hover:translate-y-[-4px]
                               transition-transform delay-75">
                        {desc}
                    </p>
                    <div className="flex flex-wrap gap-2 transform group-hover:translate-y-[-4px]
                                 transition-transform delay-100">
                        {tags.map((tag, index) => (
                            <span key={index}
                                  className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full
                                           text-sm text-white">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

HeritageCard.propTypes = {
    title: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default HeritageCard;