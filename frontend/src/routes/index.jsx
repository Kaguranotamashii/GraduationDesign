import { createBrowserRouter } from 'react-router-dom';
import PrivateRoute from '../components/Guard/PrivateRoute';
import AdminLayout from '../layout/AdminLayout';
import Auth from '../pages/auth/Auth';
import NotFound from '../components/ErrorBoundary/NotFound';
import ErrorPage from '../components/ErrorBoundary/ErrorPage';
import Home from "../pages/home/home";
import Map from "../pages/map/map.jsx";
import CreateArticle from "../components/admin/CreateArticle.jsx";
import UserProfile from '../components/admin/user/UserProfile.jsx';
import ModelViewer from "../pages/modelViewer/ModelViewer.jsx";
import ModelEditor from "@/pages/modelEdit/ModelEdit.jsx";
import InteractiveModelViewer from "@/pages/modeldEMO/demo1.jsx";
import ArticleList from "@/pages/articles/list/ArticleList.jsx"
import ArticleDetail from "@/pages/articles/detail/ArticleDetail.jsx";
import AboutPage from "@/pages/about/AboutPage.jsx";
import MarkdownViewer from "@/components/articles/Markdown/MarkdownViewer.jsx";

const router = createBrowserRouter([
    {
        path: '/',
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <Home/>
            },
            {
                path: 'auth',
                element: <Auth />,
            },
            {
                path: 'map',
                element: <Map/>
            },
            {
                path: 'builderModel',
                element: <ModelViewer />
            },
            {
                path: 'modelEditor',
                element: <ModelEditor />,
            },
            {
                path: 'text',
                element: <InteractiveModelViewer />,
            },
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
                path: "/doc/:id",
                element: <MarkdownViewer  />
            },
            {
                path: 'about',
                element: <AboutPage />,
            },
            {
                path: 'admin',
                element: <PrivateRoute><AdminLayout /></PrivateRoute>,
                children: [
                    {
                        index: true,
                        element: <UserProfile />
                    },
                    {
                        path: 'add-article',
                        element: <CreateArticle />,
                    },
                    {
                        path: '*',
                        element: <NotFound />,
                    },
                ],
            },
            {
                path: '*',
                element: <NotFound />,
            },
        ],
    },
]);

export default router;