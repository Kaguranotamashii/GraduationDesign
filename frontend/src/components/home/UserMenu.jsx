import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSpring, animated } from '@react-spring/web';
import { LogOut, User, Settings } from 'lucide-react';
import { clearAuth } from '../../store/authSlice';

const UserMenu = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    const dropdownAnimation = useSpring({
        opacity: showDropdown ? 1 : 0,
        transform: showDropdown ? 'translateY(0)' : 'translateY(-10px)',
        config: { tension: 300, friction: 20 },
    });

    const handleLogout = () => {
        dispatch(clearAuth());
        setShowDropdown(false);
    };

    // 生成用户头像或首字母头像
    const renderAvatar = () => {
        if (!user) return null;

        // 如果用户有头像，显示头像
        if (user.avatar) {
            return (
                <img
                    src={user.avatar}
                    alt={user.nickname || 'User'}
                    className="w-8 h-8 rounded-full object-cover"
                />
            );
        }

        // 否则显示首字母头像
        const initial = (user.nickname || 'U')[0].toUpperCase();
        return (
            <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-semibold">
                {initial}
            </div>
        );
    };

    return (
        <div className="relative">
            {isAuthenticated ? (
                <div
                    className="cursor-pointer flex items-center space-x-2"
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                >
                    {renderAvatar()}
                    {showDropdown && (
                        <animated.div
                            style={dropdownAnimation}
                            className="absolute top-full right-0 mt-2 w-48 py-2 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5"
                        >
                            <div className="px-4 py-2 border-b border-gray-100">
                                <p className="text-sm font-medium text-gray-900">{user?.nickname || 'User'}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                            <a
                                href="#"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500"
                            >
                                <User className="w-4 h-4 mr-2" />
                                个人信息
                            </a>
                            <a
                                href="#"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500"
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                设置
                            </a>
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                退出登录
                            </button>
                        </animated.div>
                    )}
                </div>
            ) : (
                <a
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-300"
                >
                    登录
                </a>
            )}
        </div>
    );
};

export default UserMenu;