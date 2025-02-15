import React, { useState } from 'react';

const SubscribeForm = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: 处理订阅逻辑
        console.log('Subscribe with email:', email);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入您的邮箱"
                className="px-6 py-4 rounded-full border-2 border-white/30 bg-white/10 text-white
                         placeholder:text-gray-300 focus:outline-none focus:border-red-500
                         backdrop-blur-md transition-all duration-300 flex-1"
                required
            />
            <button
                type="submit"
                className="px-8 py-4 bg-red-600 text-white rounded-full hover:bg-red-700
                         transition-colors shadow-lg hover:shadow-xl hover:shadow-red-600/20
                         transform hover:-translate-y-0.5">
                立即订阅
            </button>
        </form>
    );
};

export default SubscribeForm;