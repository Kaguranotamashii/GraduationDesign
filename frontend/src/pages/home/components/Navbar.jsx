
import React, { useState, useEffect, useRef } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LogOut, User, Settings } from 'lucide-react';
import { clearAuth } from '../../store/authSlice';

const Navbar = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hovered, setHovered] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const isAdminPage = location.pathname.includes('/admin');
    const userMenuRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            setScrolled(offset > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navAnimation = useSpring({
        from: { y: -100 },
        to: { y: 0 },
        config: { tension: 300, friction: 20 },
    });

    const menuItemAnimation = useSpring({
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
        transformOrigin: 'center', // 确保放大时不会改变布局
        config: config.wobbly,
    });

    const dropdownAnimation = useSpring({
        opacity: showMenu ? 1 : 0,
        transform: showMenu ? 'translateY(0)' : 'translateY(-20px)',
        config: config.gentle,
    });

    const userDropdownAnimation = useSpring({
        opacity: showUserMenu ? 1 : 0,
        transform: showUserMenu ? 'translateY(0)' : 'translateY(-10px)',
        config: config.gentle,
    });

    const logoSpring = useSpring({
        transform: hovered === 'logo' ? 'scale(1.05)' : 'scale(1)',
        transformOrigin: 'center', // 确保 logo 放大时不会偏移
        config: config.gentle,
    });

    const handleLogout = () => {
        dispatch(clearAuth());
        setShowUserMenu(false);
        navigate('/');
    };

    const renderAvatar = () => {
        if (!user) return null;

        if (user.avatar) {
            return (
                <img
                    src={user.avatar}
                    alt={user.nickname || 'User'}
                    className="w-8 h-8 rounded-full object-cover"
                />
            );
        }

        const initial = (user.nickname || 'U')[0].toUpperCase();
        return (
            <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-semibold">
                {initial}
            </div>
        );
    };

    return (
        <animated.nav
            style={navAnimation}
            className={`w-full z-[1000] ${isAdminPage ? '' : 'fixed'} 
                ${scrolled ? 'shadow-lg' : ''} 
                transition-all duration-300 ease-in-out
                ${isAdminPage ? 'bg-white/95 backdrop-blur-md border-b border-gray-100' :
                scrolled ? 'bg-white/95 backdrop-blur-md' : 'bg-transparent'}`}
        >



            <div className="container mx-auto px-6 ">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <animated.div
                        style={logoSpring}
                        className="flex items-center space-x-3 group cursor-pointer"
                        onMouseEnter={() => setHovered('logo')}
                        onMouseLeave={() => setHovered('')}
                        onClick={() => navigate('/')}
                    >
                        <img
                            src="/logo.png"
                            alt="筑境云枢"
                            className="h-12 w-12 object-contain transition-transform duration-300 group-hover:rotate-3"
                        />
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-gray-800 tracking-wide">筑境云枢</span>
                            <span className="text-xs text-gray-500 tracking-wider">
                                传统建筑数字化平台
                            </span>
                        </div>
                    </animated.div>

                    {/* Navigation Items */}
                    <div className="hidden md:flex items-center space-x-6 relative">
                        {/* Building Types Dropdown */}
                        <div className="relative">
                            <button
                                className="px-4 py-2 rounded-lg text-gray-700 hover:text-red-500 hover:bg-red-50 transition-all duration-300 flex items-center text-sm font-medium"
                                onClick={() => setShowMenu(!showMenu)}
                            >
                                建筑类型
                                <svg
                                    className={`w-4 h-4 ml-1 transform transition-transform duration-300 ${showMenu ? 'rotate-180' : ''}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M5 8l5 5 5-5H5z" />
                                </svg>
                            </button>

                            {showMenu && (
                                <animated.div
                                    style={dropdownAnimation}
                                    className="absolute top-full left-0 w-48 pt-2"
                                >
                                    <div className="bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden">
                                        {['宫殿', '寺庙', '园林', '城墙'].map((item) => (
                                            <button
                                                key={item}
                                                className="block w-full px-4 py-3 text-sm text-left text-gray-700 hover:bg-red-50 hover:text-red-500 transition-all duration-300 border-b border-gray-50 last:border-0"
                                                onMouseEnter={() => setHovered(item)}
                                                onMouseLeave={() => setHovered('')}
                                                onClick={() => {
                                                    setShowMenu(false);
                                                    // 处理建筑类型选择
                                                }}
                                            >
                                                <animated.span
                                                    style={hovered === item ? menuItemAnimation : {}}
                                                    className="flex items-center"
                                                >
                                                    {item}
                                                </animated.span>
                                            </button>
                                        ))}
                                    </div>
                                </animated.div>
                            )}
                        </div>

                        {/* Navigation Links */}
                        {['地图', '词典', '支持'].map((item) => (
                            item === '地图' ? (
                                <Link
                                    key={item}
                                    to="/map"
                                    className="px-4 py-2 rounded-lg text-gray-700 hover:text-red-500 hover:bg-red-50 transition-all duration-300 text-sm font-medium"
                                    onMouseEnter={() => setHovered(item)}
                                    onMouseLeave={() => setHovered('')}
                                >
                                    <animated.span
                                        style={hovered === item ? menuItemAnimation : {}}
                                        className="block"
                                    >
                                        {item}
                                    </animated.span>
                                </Link>
                            ) : (
                                <button
                                    key={item}
                                    className="px-4 py-2 rounded-lg text-gray-700 hover:text-red-500 hover:bg-red-50 transition-all duration-300 text-sm font-medium"
                                    onMouseEnter={() => setHovered(item)}
                                    onMouseLeave={() => setHovered('')}
                                >
                                    <animated.span
                                        style={hovered === item ? menuItemAnimation : {}}
                                        className="block"
                                    >
                                        {item}
                                    </animated.span>
                                </button>
                            )
                        ))}

                        {/* User Menu */}
                        {!isAdminPage && (
                            <div className="relative" ref={userMenuRef}>
                                {isAuthenticated ? (
                                    <div className="relative">
                                        <button
                                            className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100/80 transition-all duration-300 group"
                                            onClick={() => setShowUserMenu(!showUserMenu)}
                                        >
                                            {renderAvatar()}
                                            <svg
                                                className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${
                                                    showUserMenu ? 'rotate-180' : ''
                                                }`}
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>

                                        {showUserMenu && (
                                            <animated.div
                                                style={userDropdownAnimation}
                                                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl ring-1 ring-black/5 overflow-hidden"
                                            >
                                                <div className="p-4">
                                                    <div className="flex items-center space-x-3">
                                                        {renderAvatar()}
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-800">
                                                                {user?.nickname || 'User'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {user?.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="border-t border-gray-100">
                                                    <Link
                                                        to="/admin"
                                                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <User className="w-4 h-4 mr-3 text-gray-500" />
                                                        个人信息
                                                    </Link>
                                                    <button
                                                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <Settings className="w-4 h-4 mr-3 text-gray-500" />
                                                        设置
                                                    </button>
                                                </div>

                                                <div className="border-t border-gray-100 p-3">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center justify-center w-full px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                                                    >
                                                        <LogOut className="w-4 h-4 mr-2" />
                                                        退出登录
                                                    </button>
                                                </div>
                                            </animated.div>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => navigate('/auth')}
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300"
                                    >
                                        <User className="w-4 h-4 mr-2" />
                                        登录
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </animated.nav>
    );
};

export default Navbar;