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
import ModelEditor from "@/pages/modelEdit/ModelEdit.jsx";
import PrivateBuilderEditRoute from "@/components/Guard/PrivateBuilderEditRoute.jsx";
import ARDemo1 from "@/pages/ARModelEditor/ARDemo.jsx";

import ModelViewerV2 from "@/pages/modelViewer/ModelViewerV2.jsx";
import MyModels from "@/components/admin/model/MyModels.jsx";
import MyModelsUploads from "@/components/admin/model/MyModelsUploads.jsx";
import ModelsPage from "@/pages/models/ModelsPage.jsx";
import PrivacyPolicy from "@/pages/PrivacyPolicy/PrivacyPolicy.jsx";
import TermsOfUse from "@/pages/TermsOfUse/TermsOfUse.jsx";
import ARViewer from "@/pages/ARModelEditor/arV1.jsx";
import ARCompatViewer from "@/pages/ARModelEditor/ARCompatViewer.jsx";
import ARGoogleViewer from "@/pages/ARModelEditor/ARGoogleViewer.jsx";


// 页面组件导入...
// 其他组件保持不变...


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
                path: 'login',
                element: <Auth />,
            },
            {
                path: 'map',
                element: <MapPage/>
            },
            {
                path:'models',
                element: <ModelsPage/>
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
            {
                path: 'modelEdit',
                children: [
                    {
                        path: ':builderId',  // 添加动态路由参数
                        element: < PrivateBuilderEditRoute><ModelEditor /></ PrivateBuilderEditRoute>,
                    }
                ]
            },
            {
              path: 'modelViewer',
                children: [
                    {
                        path: ':builderId',  // 添加动态路由参数
                        element: < ModelViewerV2 />,
                    }
                ]
            },
            {
                path: 'ar1/:builderId',
                element: <ARDemo1 />
            },

            {
                path: 'privacy',
                element: <PrivacyPolicy />
            },
            {
                path: 'terms',
                element: <TermsOfUse />
            },
            {
                path: '/AR/compat/:builderId',
                element: <ARCompatViewer  />
            },
            {
                path: '/AR/google/:builderId',
                element: <ARGoogleViewer   />
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
                    {
                            path: 'models',
                        children: [
                            {
                                index: true,
                                element: <MyModels />
                            },
                            {
                                path: 'create',
                                element: <MyModelsUploads />

                            }

                        ]
                    },

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