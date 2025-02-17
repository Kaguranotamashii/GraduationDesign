import apiClient from "@/utils/apiClient.jsx";

// 基础CRUD操作
export const createArticle = async (articleData) => {
    try {
        const response = await apiClient.post('article/articles/create/', articleData);
        return response.data;
    } catch (error) {
        console.error('Error creating article:', error);
        throw error;
    }
}

export const getArticleList = async (params) => {
    try {
        const response = await apiClient.get(`article/articles/list/?${new URLSearchParams(params)}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching article list:', error);
        throw error;
    }
}

export const getAllArticles = async (params) => {
    try {
        const response = await apiClient.get(`article/articles/all/?${new URLSearchParams(params)}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all articles:', error);
        throw error;
    }
}

export const getArticleDetail = async (articleId) => {
    try {
        const response = await apiClient.get(`article/articles/detail/${articleId}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching article detail:', error);
        throw error;
    }
}

export const updateArticle = async (articleId, updatedData) => {
    try {
        const response = await apiClient.put(`article/articles/update/${articleId}/`, updatedData);
        return response.data;
    } catch (error) {
        console.error('Error updating article:', error);
        throw error;
    }
}

export const deleteArticle = async (articleId) => {
    try {
        const response = await apiClient.delete(`article/articles/delete/${articleId}/`);
        return response.data;
    } catch (error) {
        console.error('Error deleting article:', error);
        throw error;
    }
}

// 草稿相关操作
export const getDrafts = async () => {
    try {
        const response = await apiClient.get('article/articles/drafts/');
        return response.data;
    } catch (error) {
        console.error('Error fetching drafts:', error);
        throw error;
    }
}

export const saveDraft = async (draftData) => {
    try {
        const response = await apiClient.post('article/articles/draft/save/', draftData);
        return response.data;
    } catch (error) {
        console.error('Error saving draft:', error);
        throw error;
    }
}

export const updateDraft = async (draftId, draftData) => {
    try {
        const response = await apiClient.post(`article/articles/draft/save/${draftId}/`, draftData);
        return response.data;
    } catch (error) {
        console.error('Error updating draft:', error);
        throw error;
    }
}

export const publishDraft = async (draftId) => {
    try {
        const response = await apiClient.post(`article/articles/draft/publish/${draftId}/`);
        return response.data;
    } catch (error) {
        console.error('Error publishing draft:', error);
        throw error;
    }
}



export const toggleFeatured = async (articleId) => {
    try {
        const response = await apiClient.post(`article/articles/featured/toggle/${articleId}/`);
        return response.data;
    } catch (error) {
        console.error('Error toggling featured status:', error);
        throw error;
    }
}

export const getFeaturedArticles = async () => {
    try {
        const response = await apiClient.get('article/articles/featured/list/');
        return response.data;
    } catch (error) {
        console.error('Error fetching featured articles:', error);
        throw error;
    }
}

export const getMyArticles = async (params) => {
    try {
        // 构建查询参数
        const queryString = new URLSearchParams(params).toString();
        const url = 'article/articles/my-articles/' + (queryString ? `?${queryString}` : '');

        const response = await apiClient.get(url);
        // 直接返回响应数据，让组件处理数据格式
        console.log('getMyArticles response:', response.data)
        return response.data;
    } catch (error) {
        console.error('Error fetching my articles:', error);
        throw error;
    }
};

// 文件上传
export const uploadImage = async (formData) => {
    try {
        const response = await apiClient.post('article/upload-image/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}
export const likeArticle = async (articleId) => {
    try {
        const response = await apiClient.post(`article/articles/like/${articleId}/`);
        return response.data;
    } catch (error) {
        console.error('Error liking article:', error);
        throw error;
    }
}



// 取消点赞文章
export const unlikeArticle = async (articleId) => {
    try {
        const response = await apiClient.post(`article/articles/unlike/${articleId}/`);
        return response.data;
    } catch (error) {
        console.error('Error unliking article:', error);
        throw error;
    }
}