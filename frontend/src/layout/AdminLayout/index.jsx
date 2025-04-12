import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Button, Spin, Drawer } from 'antd';
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
    MenuOutlined,
} from '@ant-design/icons';
import { clearAuth } from '../../store/authSlice';
import { logoutUser, getUserInfo } from '../../api/userApi';
import Navbar from "../../components/home/Navbar";
import Footer from "../../components/home/Footer";
import './AdminLayout.css'; // 新增 CSS 文件

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(true); // 默认收起（移动端）
    const [drawerVisible, setDrawerVisible] = useState(false); // 控制移动端抽屉
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // 检测屏幕宽度，动态设置 collapsed 状态
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setCollapsed(true); // 移动端默认收起
            } else {
                setCollapsed(false); // 桌面端默认展开
            }
        };

        handleResize(); // 初始检查
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            key: '/admin/profile',
            icon: <UserOutlined />,
            label: '个人中心',
            children: [
                {
                    key: '/admin/profile',
                    label: '个人信息',
                },
            ],
        },
        {
            key: 'content',
            type: 'group',
            label: '内容管理',
            children: [
                {
                    key: 'articles',
                    icon: <FileTextOutlined />,
                    label: '文章管理',
                    children: [
                        {
                            key: '/admin/articles',
                            label: '我的文章',
                        },
                        {
                            key: '/admin/articles/create',
                            label: '发布文章',
                        },
                    ],
                },
                {
                    key: 'models',
                    icon: <DatabaseOutlined />,
                    label: '模型管理',
                    children: [
                        {
                            key: '/admin/models',
                            label: '我的模型',
                        },
                        // {
                        //     key: '/admin/models/create',
                        //     label: '上传模型',
                        // },
                    ],
                },
                {
                    key: '/admin/comments',
                    icon: <CommentOutlined />,
                    label: '我的评论',
                },
            ],
        },
    ];

    // 管理员菜单项
    const adminMenuItems = userInfo?.is_staff
        ? [
            {
                key: 'system',
                type: 'group',
                label: '系统管理',
                children: [
                    {
                        key: '/admin/system/users',
                        icon: <TeamOutlined />,
                        label: '用户管理',
                    },
                    {
                        key: '/admin/system/articles',
                        icon: <FileTextOutlined />,
                        label: '文章管理',
                    },
                    {
                        key: '/admin/system/models',
                        icon: <DatabaseOutlined />,
                        label: '模型管理',
                    },
                    {
                        key: '/admin/system/comments',
                        icon: <CommentOutlined />,
                        label: '评论管理',
                    },
                ],
            },
        ]
        : [];

    const menuItems = [...baseMenuItems, ...adminMenuItems];

    const handleMenuClick = ({ key }) => {
        if (key.startsWith('/admin/system') && !userInfo?.is_staff) {
            message.error('该页面仅管理员可访问');
            return;
        }
        navigate(key);
        setDrawerVisible(false); // 移动端点击菜单项后关闭抽屉
    };

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
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <Button
                                type="text"
                                icon={<MenuOutlined />}
                                onClick={() => setDrawerVisible(true)}
                                className="md:hidden"
                            />
                            <Link to="/" className="text-lg font-semibold text-gray-800">
                                管理后台
                            </Link>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Avatar
                                size={36}
                                icon={<UserOutlined />}
                                src={userInfo?.avatar}
                                className="bg-red-500"
                            />
                            <span className="text-sm text-gray-600 hidden md:inline">
                                {userInfo?.username}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex container mx-auto px-4 py-4 md:px-6 md:py-6">
                {/* 桌面端侧边栏 */}
                <div
                    className={`hidden md:flex flex-col bg-white rounded-lg shadow-sm mr-0 md:mr-6 transition-all duration-300 ${
                        collapsed ? 'w-20' : 'w-64'
                    }`}
                >
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
                            defaultOpenKeys={['content', 'system', 'articles', 'models']}
                            items={menuItems}
                            onClick={handleMenuClick}
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

                {/* 移动端抽屉 */}
                <Drawer
                    title={
                        <div className="flex items-center space-x-2">
                            <Avatar
                                size={36}
                                icon={<UserOutlined />}
                                src={userInfo?.avatar}
                                className="bg-red-500"
                            />
                            <div>
                                <div className="text-sm font-medium text-gray-800">
                                    {userInfo?.username}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {userInfo?.is_staff ? '管理员' : '普通用户'}
                                </div>
                            </div>
                        </div>
                    }
                    placement="left"
                    onClose={() => setDrawerVisible(false)}
                    open={drawerVisible}
                    width={280}
                    className="md:hidden"
                    bodyStyle={{ padding: 0 }}
                >
                    <div className="flex flex-col h-full">
                        <div className="flex-1 py-4 overflow-y-auto">
                            <Menu
                                mode="inline"
                                selectedKeys={[location.pathname]}
                                defaultOpenKeys={['content', 'system', 'articles', 'models']}
                                items={menuItems}
                                onClick={handleMenuClick}
                                className="border-none"
                            />
                        </div>
                        <div className="p-4 border-t border-gray-100">
                            <Button
                                type="primary"
                                danger
                                onClick={handleLogout}
                                className="w-full"
                            >
                                退出登录
                            </Button>
                        </div>
                    </div>
                </Drawer>

                {/* 主内容区 */}
                <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 md:p-6 min-h-full">
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