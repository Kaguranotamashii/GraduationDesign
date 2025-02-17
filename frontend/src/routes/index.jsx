import {createBrowserRouter, Outlet} from 'react-router-dom';
import PrivateRoute from '../components/Guard/PrivateRoute';
import AdminLayout from '../layout/AdminLayout';
import Auth from '../pages/auth/Auth';
import NotFound from '../components/ErrorBoundary/NotFound';
import ErrorPage from '../components/ErrorBoundary/ErrorPage';
import HomePage from "@/pages/home/index.jsx";
import MapPage from "@/pages/map/index.jsx";
import ArticleList from "@/pages/articles/list/ArticleList.jsx";
import ArticleDetail from "@/pages/articles/detail/ArticleDetail.jsx";
import AboutPage from "@/pages/about/AboutPage.jsx";
import UserProfile from "@/components/admin/user/UserProfile.jsx";
import MyArticles from "@/components/admin/article/MyArticles.jsx";
import CreateArticle from "@/components/admin/article/CreateArticle.jsx";
import AdminRoute from "@/components/Guard/AdminRoute.jsx";
import React from "react";
import UserManagement from "@/components/admin/user/UserManagement.jsx";
import ArticleManagement from "@/components/admin/article/ArticleManagement.jsx"
import ModelManagement from "@/components/admin/model/ModelManagement.jsx";
import CommentManagement from "@/components/admin/comment/CommentManagement.jsx";
import MyComment from "@/components/admin/comment/MyComment.jsx";


// 页面组件导入...
// 其他组件保持不变...

// @ts-ignore
const router = createBrowserRouter([
    {
        path: '/',
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <HomePage/>
            },
            {
                path: 'auth',
                element: <Auth />,
            },
            {
                path: 'map',
                element: <MapPage/>
            },
            // 公开文章路由
            {
                path: 'articles',
                children: [
                    {
                        index: true,
                        element: <ArticleList />
                    },
                    {
                        path: ':id',
                        element: <ArticleDetail />
                    }
                ]
            },
            {
                path: 'about',
                element: <AboutPage />,
            },
            // 后台管理路由
            {
                path: 'admin',
                element: <PrivateRoute><AdminLayout /></PrivateRoute>,
                children: [
                    // 个人中心模块
                    {
                        path: 'profile',
                        children: [
                            {
                                index: true,
                                element: <UserProfile />
                            },
                        ]
                    },
                    // 文章管理模块
                    {
                        path: 'articles',
                        children: [
                            {
                                index: true,
                                element: <MyArticles />
                            },
                            {
                                path: 'create',
                                element: <CreateArticle />
                            },

                        ]
                    },
                    // 模型管理模块

                    // 评论管理模块
                    {
                        path: 'comments',
                        element: <MyComment  />
                    },

                    // 管理员功能模块
                    {
                        path: 'system',
                        element: <AdminRoute>
                            <Outlet />
                        </AdminRoute>,
                        children: [
                            {
                                path: 'users',
                                element: <UserManagement />
                            },
                            {
                                path: 'articles',
                                element: <ArticleManagement />
                            },
                            {
                                path: 'models',
                                element: <ModelManagement/>
                            },
                            {
                                path: 'comments',
                                element: <CommentManagement/>
                            },

                        ]


                        }
                ]
            },
            {
                path: '*',
                element: <NotFound />,
            }
        ]
    }
]);

export default router;