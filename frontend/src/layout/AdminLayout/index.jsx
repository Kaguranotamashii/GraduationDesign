import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Button, Spin } from 'antd';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    TeamOutlined,
    DatabaseOutlined,
    FileTextOutlined,
    CommentOutlined,
    HomeOutlined,
} from '@ant-design/icons';
import { clearAuth } from '../../store/authSlice';
import { logoutUser, getUserInfo } from '../../api/userApi';
import Navbar from "../../components/home/Navbar";
import Footer from "../../components/home/Footer";

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const response = await getUserInfo();
            if (response.code === 200) {
                setUserInfo(response.data);
            }
        } catch (error) {
            console.error('获取用户信息失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
            dispatch(clearAuth());
            navigate('/auth');
        } catch (error) {
            console.error('登出失败:', error);
        }
    };

    // 基础菜单项
    const baseMenuItems = [
        {
            key: '/admin',
            icon: <HomeOutlined />,
            label: '个人中心',
        },
        {
            key: '/admin/add-article',
            icon: <FileTextOutlined />,
            label: '发布文章',
        },
        {
            key: '/my-models',
            icon: <DatabaseOutlined />,
            label: '我的模型',
        },
        {
            key: '/my-articles',
            icon: <FileTextOutlined />,
            label: '我的文章',
        },
        {
            key: '/my-comments',
            icon: <CommentOutlined />,
            label: '我的评论',
        },
    ];

    // 管理员菜单项
    const adminMenuItems = userInfo?.is_staff ? [
        {
            type: 'divider',
        },
        {
            key: 'admin',
            type: 'group',
            label: '管理功能',
            children: [
                {
                    key: '/admin/users',
                    icon: <TeamOutlined />,
                    label: '用户管理',
                },
                {
                    key: '/admin/all-models',
                    icon: <DatabaseOutlined />,
                    label: '模型管理',
                },
                {
                    key: '/admin/all-articles',
                    icon: <FileTextOutlined />,
                    label: '文章管理',
                },
                {
                    key: '/admin/all-comments',
                    icon: <CommentOutlined />,
                    label: '评论管理',
                },
            ],
        },
    ] : [];

    const menuItems = [...baseMenuItems, ...adminMenuItems];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* 顶部导航 */}
            <div className="w-full bg-white shadow-sm">
                <Navbar />
            </div>

            <div className="flex-1 flex container mx-auto px-6 py-6">
                {/* 左侧边栏 */}
                <div className={`${collapsed ? 'w-20' : 'w-64'} flex flex-col bg-white rounded-lg shadow-sm mr-6 transition-all duration-300`}>
                    {/* 用户信息 */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center p-2">
                            <Avatar
                                size={40}
                                icon={<UserOutlined />}
                                src={userInfo?.avatar}
                                className="bg-red-500"
                            />
                            {!collapsed && (
                                <div className="ml-3 overflow-hidden">
                                    <div className="text-sm font-medium text-gray-800 truncate">
                                        {userInfo?.username}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                        {userInfo?.is_staff ? '管理员' : '普通用户'}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 菜单区域 */}
                    <div className="flex-1 py-4 overflow-y-auto">
                        <Menu
                            mode="inline"
                            selectedKeys={[location.pathname]}
                            defaultOpenKeys={['admin']}
                            items={menuItems}
                            onClick={({ key }) => navigate(key)}
                            className="border-none"
                            inlineCollapsed={collapsed}
                        />
                    </div>

                    {/* 底部按钮区 */}
                    <div className="p-4 border-t border-gray-100">
                        <div className="flex flex-col space-y-2">
                            <Button
                                type="text"
                                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                                onClick={() => setCollapsed(!collapsed)}
                                className="w-full flex items-center justify-center"
                            >
                                {!collapsed && '收起菜单'}
                            </Button>
                            {!collapsed && (
                                <Button
                                    type="primary"
                                    danger
                                    onClick={handleLogout}
                                    className="w-full"
                                >
                                    退出登录
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 主内容区 */}
                <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6 min-h-full">
                        <Outlet />
                    </div>
                </div>
            </div>

            {/* 页脚 */}
            <div className="mt-auto">
                <Footer />
            </div>
        </div>
    );
};

export default AdminLayout;