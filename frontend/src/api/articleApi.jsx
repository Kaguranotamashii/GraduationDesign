import apiClient from "@/utils/apiClient.jsx";

// 用户 - 基础CRUD操作
export const createArticle = async (articleData) => {
    try {
        const response = await apiClient.post('article/articles/create/', articleData);
        return response.data;
    } catch (error) {
        console.error('创建文章失败:', error.response?.data || error.message);
        throw error;
    }
};

export const getArticleList = async (params = {}) => {
    try {
        const response = await apiClient.get(`article/articles/list/?${new URLSearchParams(params)}`);
        return response.data;
    } catch (error) {
        console.error('获取文章列表失败:', error.response?.data || error.message);
        throw error;
    }
};

export const getAllArticles = async (params = {}) => {
    try {
        const response = await apiClient.get(`article/articles/all/?${new URLSearchParams(params)}`);
        return response.data;
    } catch (error) {
        console.error('获取所有文章失败:', error.response?.data || error.message);
        throw error;
    }
};

export const getArticleDetail = async (articleId) => {
    try {
        const response = await apiClient.get(`article/articles/detail/${articleId}/`);
        return response.data;
    } catch (error) {
        console.error('获取文章详情失败:', error.response?.data || error.message);
        throw error;
    }
};

export const updateArticle = async (articleId, updatedData) => {
    try {
        const response = await apiClient.put(`article/articles/update/${articleId}/`, updatedData);
        return response.data;
    } catch (error) {
        console.error('更新文章失败:', error.response?.data || error.message);
        throw error;
    }
};

export const deleteArticle = async (articleId) => {
    try {
        const response = await apiClient.delete(`article/articles/delete/${articleId}/`);
        return response.data;
    } catch (error) {
        console.error('删除文章失败:', error.response?.data || error.message);
        throw error;
    }
};

// 用户 - 草稿相关操作
export const getDrafts = async () => {
    try {
        const response = await apiClient.get('article/articles/drafts/');
        return response.data;
    } catch (error) {
        console.error('获取草稿列表失败:', error.response?.data || error.message);
        throw error;
    }
};

export const saveDraft = async (draftData) => {
    try {
        const response = await apiClient.post('article/articles/draft/save/', draftData);
        return response.data;
    } catch (error) {
        console.error('保存草稿失败:', error.response?.data || error.message);
        throw error;
    }
};

export const updateDraft = async (draftId, draftData) => {
    try {
        const response = await apiClient.post(`article/articles/draft/save/${draftId}/`, draftData);
        return response.data;
    } catch (error) {
        console.error('更新草稿失败:', error.response?.data || error.message);
        throw error;
    }
};

export const submitDraft = async (draftId) => {
    try {
        const response = await apiClient.post(`article/articles/draft/submit/${draftId}/`);
        return response.data;
    } catch (error) {
        console.error('提交草稿审核失败:', error.response?.data || error.message);
        throw error;
    }
};

// 用户 - 其他功能
export const likeArticle = async (articleId) => {
    try {
        const response = await apiClient.post(`article/articles/like/${articleId}/`);
        return response.data;
    } catch (error) {
        console.error('点赞文章失败:', error.response?.data || error.message);
        throw error;
    }
};

export const unlikeArticle = async (articleId) => {
    try {
        const response = await apiClient.post(`article/articles/unlike/${articleId}/`);
        return response.data;
    } catch (error) {
        console.error('取消点赞失败:', error.response?.data || error.message);
        throw error;
    }
};

export const getFeaturedArticles = async () => {
    try {
        const response = await apiClient.get('article/articles/featured/');
        return response.data;
    } catch (error) {
        console.error('获取精选文章失败:', error.response?.data || error.message);
        throw error;
    }
};

export const getMyArticles = async (params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const url = `article/articles/my-articles/${queryString ? `?${queryString}` : ''}`;
        const response = await apiClient.get(url);
        console.log('获取我的文章响应:', response.data);
        return response.data;
    } catch (error) {
        console.error('获取我的文章失败:', error.response?.data || error.message);
        throw error;
    }
};

export const getTopArticles = async () => {
    try {
        const response = await apiClient.get('article/articles/top/');
        return response.data;
    } catch (error) {
        console.error('获取热门文章失败:', error.response?.data || error.message);
        throw error;
    }
};

export const getAllTags = async () => {
    try {
        const response = await apiClient.get('article/articles/tags/');
        return response.data;
    } catch (error) {
        console.error('获取所有标签失败:', error.response?.data || error.message);
        throw error;
    }
};

export const searchArticles = async (params = {}) => {
    try {
        const response = await apiClient.get(`article/articles/search/?${new URLSearchParams(params)}`);
        return response.data;
    } catch (error) {
        console.error('搜索文章失败:', error.response?.data || error.message);
        throw error;
    }
};

// 用户 - 文件上传
export const uploadImage = async (formData) => {
    try {
        const response = await apiClient.post('article/upload-image/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('上传图片失败:', error.response?.data || error.message);
        throw error;
    }
};

// 管理员 - 文章操作
export const adminCreateArticle = async (articleData) => {
    try {
        const response = await apiClient.post('article/admin/articles/create/', articleData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('管理员创建文章失败:', error.response?.data || error.message);
        throw error;
    }
};

export const adminGetAllArticles = async (params = {}) => {
    try {
        const response = await apiClient.get(`article/admin/articles/list/?${new URLSearchParams(params)}`);
        return response.data;
    } catch (error) {
        console.error('管理员获取所有文章失败:', error.response?.data || error.message);
        throw error;
    }
};

export const adminUpdateArticle = async (articleId, updatedData) => {
    try {
        const response = await apiClient.put(
            `article/admin/articles/update/${articleId}/`,
            updatedData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('管理员更新文章失败:', error.response?.data || error.message);
        throw error;
    }
};

export const adminDeleteArticle = async (articleId) => {
    try {
        const response = await apiClient.delete(`article/admin/articles/delete/${articleId}/`);
        return response.data;
    } catch (error) {
        console.error('管理员删除文章失败:', error.response?.data || error.message);
        throw error;
    }
};

export const adminReviewArticle = async (articleId, reviewData) => {
    try {
        const response = await apiClient.post(`article/admin/articles/review/${articleId}/`, reviewData);
        return response.data;
    } catch (error) {
        console.error('管理员审批文章失败:', error.response?.data || error.message);
        throw error;
    }
};