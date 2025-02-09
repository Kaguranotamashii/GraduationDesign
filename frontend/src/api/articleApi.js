// urlpatterns = [
// # 基础CRUD操作
// path('articles/', views.create_article, name='create_article'),  # POST
// path('articles/list/', views.get_article_list, name='get_article_list'),  # GET with pagination
//     path('articles/all/', views.get_all_articles, name='get_all_articles'),  # GET without pagination
// path('articles/<int:article_id>/', views.get_article_detail, name='get_article_detail'),  # GET
// path('articles/<int:article_id>/', views.update_article, name='update_article'),  # PUT/PATCH
// path('articles/<int:article_id>/', views.delete_article, name='delete_article'),  # DELETE
//
// # 额外功能
// path('articles/<int:article_id>/like/', views.like_article, name='like_article'),
//     path('articles/<int:article_id>/toggle-featured/', views.toggle_featured, name='toggle_featured'),
//     path('articles/featured/', views.get_featured_articles, name='get_featured_articles'),
// ]

import apiClient    from "../utils/apiClient.jsx"


export const createArticle = async (articleData) => {
    try {
        const response = await apiClient.post('article/articles/', articleData);
        return response.data;
    } catch (error) {
        console.error('Error creating article:', error);
        throw error;
    }
}

export const getArticleList = async (page, pageSize) => {
    try {
        const response = await apiClient.get(`article/articles/list/?page=${page}&page_size=${pageSize}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching article list:', error);
        throw error;
    }
}


export const getAllArticles = async () => {
    try {
        const response = await apiClient.get('article/articles/all/');
        return response.data;
    } catch (error) {
        console.error('Error fetching all articles:', error);
        throw error;
    }
}

export const getArticleDetail = async (articleId) => {
    try {
        const response = await apiClient.get(`article/articles/${articleId}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching article detail:', error);
        throw error;
    }
}

export const updateArticle = async (articleId, updatedData) => {
    try {
        const response = await apiClient.put(`article/articles/${articleId}/`, updatedData);
        return response.data;
    } catch (error) {
        console.error('Error updating article:', error);
        throw error;
    }
}

export const deleteArticle = async (articleId) => {
    try {
        const response = await apiClient.delete(`article/articles/${articleId}/`);
        return response.data;
    } catch (error) {
        console.error('Error deleting article:', error);
        throw error;
    }
}

export const likeArticle = async (articleId) => {
    try {
        const response = await apiClient.post(`article/articles/${articleId}/like/`);
        return response.data;
    } catch (error) {
        console.error('Error liking article:', error);
        throw error;
    }
}

export const toggleFeatured = async (articleId) => {
    try {
        const response = await apiClient.post(`article/articles/${articleId}/toggle-featured/`);
        return response.data;
    } catch (error) {
        console.error('Error toggling featured status:', error);
        throw error;
    }
}

export const getFeaturedArticles = async () => {
    try {
        const response = await apiClient.get('article/articles/featured/');
        return response.data;
    } catch (error) {
        console.error('Error fetching featured articles:', error);
        throw error;
    }
}

