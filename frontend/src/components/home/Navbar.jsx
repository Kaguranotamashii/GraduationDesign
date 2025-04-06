import React, { useState, useEffect, useRef } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LogOut, User } from 'lucide-react';
import { clearAuth } from '../../store/authSlice';
import './Navbar.css'; // 新增 CSS 文件

const Navbar = () => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false); // 新增移动端菜单状态
    const [scrolled, setScrolled] = useState(false);
    const [hovered, setHovered] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const isAdminPage = location.pathname.includes('/admin');
    const userMenuRef = useRef(null);
    const mobileMenuRef = useRef(null);

    // 监听滚动事件
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 点击外部关闭菜单
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setShowMobileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 动画配置
    const navAnimation = useSpring({
        from: { y: -100 },
        to: { y: 0 },
        config: { tension: 280, friction: 20 },
    });

    const menuItemAnimation = useSpring({
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
        config: config.wobbly,
    });

    const userDropdownAnimation = useSpring({
        opacity: showUserMenu ? 1 : 0,
        transform: showUserMenu ? 'translateY(0)' : 'translateY(-10px)',
        config: config.gentle,
    });

    const mobileMenuAnimation = useSpring({
        opacity: showMobileMenu ? 1 : 0,
        transform: showMobileMenu ? 'translateY(0)' : 'translateY(-10px)',
        config: config.gentle,
    });

    const logoSpring = useSpring({
        transform: hovered === 'logo' ? 'scale(1.05)' : 'scale(1)',
        config: config.gentle,
    });

    // 处理退出登录
    const handleLogout = () => {
        dispatch(clearAuth());
        setShowUserMenu(false);
        setShowMobileMenu(false);
        navigate('/');
    };

    // 渲染用户头像
    const renderAvatar = () => {
        if (!user) return null;
        if (user.avatar) {
            return (
                <img
                    src={user.avatar}
                    alt={user.nickname || 'User'}
                    className="w-9 h-9 rounded-full object-cover border border-gray-200"
                />
            );
        }
        const initial = (user.nickname || 'U')[0].toUpperCase();
        return (
            <div className="w-9 h-9 rounded-full bg-gray-800 text-white flex items-center justify-center font-medium">
                {initial}
            </div>
        );
    };

    // 判断导航项是否活跃
    const isActive = (path) => {
        return path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
    };

    // 获取导航项样式
    const getNavItemClass = (path) => {
        const active = isActive(path);
        return `px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
            scrolled || isAdminPage
                ? active
                    ? 'text-black bg-gray-100 font-semibold border-b-2 border-blue-500'
                    : 'text-gray-800 hover:text-black hover:bg-gray-100'
                : active
                    ? 'text-black bg-white/20 font-semibold backdrop-blur-sm'
                    : 'text-gray-800 hover:text-black hover:bg-white/10'
        }`;
    };

    return (
        <animated.nav
            style={navAnimation}
            className={`w-full z-[1000] ${isAdminPage ? '' : 'fixed'} 
            ${scrolled ? 'shadow-md' : ''} 
            transition-all duration-300 ease-in-out
            ${isAdminPage || scrolled ? 'bg-white/95 backdrop-blur-md' : 'bg-transparent'}`}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <animated.div
                        style={logoSpring}
                        className="flex items-center space-x-2 cursor-pointer"
                        onMouseEnter={() => setHovered('logo')}
                        onMouseLeave={() => setHovered('')}
                        onClick={() => navigate('/')}
                    >
                        <img
                            src="/logo.png"
                            alt="筑境云枢"
                            className="h-8 w-8 object-contain transition-transform duration-300 hover:scale-110"
                        />
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-gray-900">筑境云枢</span>
                            <span className="text-xs text-gray-600 hidden md:block">
                                传统建筑数字化平台
                            </span>
                        </div>
                    </animated.div>

                    {/* 桌面端导航 */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            to="/"
                            className={getNavItemClass('/')}
                            onMouseEnter={() => setHovered('home')}
                            onMouseLeave={() => setHovered('')}
                        >
                            <animated.span style={hovered === 'home' ? menuItemAnimation : {}}>
                                首页
                            </animated.span>
                        </Link>
                        <Link
                            to="/models"
                            className={getNavItemClass('/models')}
                            onMouseEnter={() => setHovered('models')}
                            onMouseLeave={() => setHovered('')}
                        >
                            <animated.span style={hovered === 'models' ? menuItemAnimation : {}}>
                                建筑模型
                            </animated.span>
                        </Link>
                        <Link
                            to="/map"
                            className={getNavItemClass('/map')}
                            onMouseEnter={() => setHovered('map')}
                            onMouseLeave={() => setHovered('')}
                        >
                            <animated.span style={hovered === 'map' ? menuItemAnimation : {}}>
                                地图
                            </animated.span>
                        </Link>
                        <Link
                            to="/articles"
                            className={getNavItemClass('/articles')}
                            onMouseEnter={() => setHovered('articles')}
                            onMouseLeave={() => setHovered('')}
                        >
                            <animated.span style={hovered === 'articles' ? menuItemAnimation : {}}>
                                文章
                            </animated.span>
                        </Link>
                        <Link
                            to="/about"
                            className={getNavItemClass('/about')}
                            onMouseEnter={() => setHovered('about')}
                            onMouseLeave={() => setHovered('')}
                        >
                            <animated.span style={hovered === 'about' ? menuItemAnimation : {}}>
                                关于
                            </animated.span>
                        </Link>

                        {/* 用户菜单 */}
                        {!isAdminPage && (
                            <div className="relative" ref={userMenuRef}>
                                {isAuthenticated ? (
                                    <div>
                                        <button
                                            className="flex items-center p-1 rounded-full hover:bg-gray-100 transition-all duration-300"
                                            onClick={() => setShowUserMenu(!showUserMenu)}
                                        >
                                            {renderAvatar()}
                                        </button>
                                        {showUserMenu && (
                                            <animated.div
                                                style={userDropdownAnimation}
                                                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden"
                                            >
                                                <div className="p-3 flex items-center space-x-2">
                                                    {renderAvatar()}
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {user?.nickname || '用户'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {user?.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="border-t border-gray-100">
                                                    <Link
                                                        to="/admin/profile"
                                                        className="block px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <User className="w-4 h-4 mr-2 inline text-gray-600" />
                                                        个人信息
                                                    </Link>
                                                    <Link
                                                        to="/admin/models"
                                                        className="block px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <svg className="w-4 h-4 mr-2 inline text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                                        </svg>
                                                        我的模型
                                                    </Link>
                                                    <Link
                                                        to="/admin/articles"
                                                        className="block px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <svg className="w-4 h-4 mr-2 inline text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                                        </svg>
                                                        我的文章
                                                    </Link>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                                    >
                                                        <LogOut className="w-4 h-4 mr-2 inline" />
                                                        退出登录
                                                    </button>
                                                </div>
                                            </animated.div>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => navigate('/auth')}
                                        className={getNavItemClass('/auth')}
                                    >
                                        <User className="w-4 h-4 mr-2 inline" />
                                        登录
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 移动端菜单按钮 */}
                    <button
                        className="md:hidden p-2 rounded-lg text-gray-800 hover:bg-gray-100"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {/* 移动端菜单 */}
                {showMobileMenu && (
                    <animated.div
                        style={mobileMenuAnimation}
                        className="md:hidden bg-white shadow-lg rounded-b-lg px-4 py-2 absolute top-16 left-0 right-0"
                        ref={mobileMenuRef}
                    >
                        <Link
                            to="/"
                            className="block py-2 text-gray-800 hover:bg-gray-50"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            首页
                        </Link>
                        <Link
                            to="/models"
                            className="block py-2 text-gray-800 hover:bg-gray-50"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            建筑模型
                        </Link>
                        <Link
                            to="/map"
                            className="block py-2 text-gray-800 hover:bg-gray-50"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            地图
                        </Link>
                        <Link
                            to="/articles"
                            className="block py-2 text-gray-800 hover:bg-gray-50"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            文章
                        </Link>
                        <Link
                            to="/about"
                            className="block py-2 text-gray-800 hover:bg-gray-50"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            关于
                        </Link>
                        {!isAdminPage && (
                            <>
                                {isAuthenticated ? (
                                    <>
                                        <Link
                                            to="/admin/profile"
                                            className="block py-2 text-gray-800 hover:bg-gray-50"
                                            onClick={() => setShowMobileMenu(false)}
                                        >
                                            个人信息
                                        </Link>
                                        <Link
                                            to="/admin/models"
                                            className="block py-2 text-gray-800 hover:bg-gray-50"
                                            onClick={() => setShowMobileMenu(false)}
                                        >
                                            我的模型
                                        </Link>
                                        <Link
                                            to="/admin/articles"
                                            className="block py-2 text-gray-800 hover:bg-gray-50"
                                            onClick={() => setShowMobileMenu(false)}
                                        >
                                            我的文章
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left py-2 text-red-600 hover:bg-red-50"
                                        >
                                            退出登录
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => {
                                            navigate('/auth');
                                            setShowMobileMenu(false);
                                        }}
                                        className="w-full text-left py-2 text-gray-800 hover:bg-gray-50"
                                    >
                                        登录
                                    </button>
                                )}
                            </>
                        )}
                    </animated.div>
                )}
            </div>
        </animated.nav>
    );
};

export default Navbar;