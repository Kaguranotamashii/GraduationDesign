import apiClient from "@/utils/apiClient.jsx";
import {message} from "antd";

// 获取文章评论列表
export const getComments = async (articleId, params = {}) => {
    try {
        const response = await apiClient.get(`comment/comments/article/${articleId}/list/`, { params });
        console.log('Comments:', response.data)
        return response.data;
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
};

// 获取评论的回复列表
export const getReplies = async (commentId) => {
    try {
        const response = await apiClient.get(`comment/comments/replies/${commentId}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching replies:', error);
        throw error;
    }
};

// 添加新评论
export const addComment = async (commentData) => {
    try {
        const response = await apiClient.post('comment/comments/', commentData);
        return response.data;
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
};

// 删除评论
export const deleteComment = async (commentId) => {
    try {
        const response = await apiClient.delete(`comment/comments/${commentId}/`);
        return response.data;
    } catch (error) {
        console.error('Error deleting comment:', error);
        throw error;
    }
};

// 点赞评论
export const likeComment = async (commentId) => {
    try {
        const response = await apiClient.post(`comment/comments/${commentId}/like/`);
        return response.data;
    } catch (error) {
        console.error('Error liking comment:', error);
        throw error;
    }
};

// 取消点赞评论
export const unlikeComment = async (commentId) => {
    try {
        const response = await apiClient.post(`comment/comments/${commentId}/unlike/`);
        return response.data;
    } catch (error) {
        console.error('Error unliking comment:', error);
        throw error;
    }
};

// 回复评论（使用 addComment，但带上 parent 参数）
export const replyToComment = async (articleId, commentId, content) => {
    try {
        const response = await apiClient.post('comment/comments/', {
            article: articleId,
            parent: commentId,
            content: content
        });
        return response.data;
    } catch (error) {
        console.error('Error replying to comment:', error);
        throw error;
    }
};

// 在 commentApi.jsx 中添加
export const getMyComments = async (params = {}) => {
    try {
        const response = await apiClient.get('comment/comments/my/', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching my comments:', error);
        throw error;
    }
};


// 管理员获取评论列表
export const getAdminComments = async (params = {}) => {
    try {
        const response = await apiClient.get('comment/admin/comments/', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching admin comments:', error);
        throw error;
    }
};

// 管理员删除单个评论
export const adminDeleteComment = async (commentId) => {
    try {
        const response = await apiClient.delete(`comment/admin/comments/${commentId}/`);
        return response.data;
    } catch (error) {
        console.error('Error deleting comment:', error);
        throw error;
    }
};

// 管理员批量删除评论
export const adminBatchDeleteComments = async (commentIds) => {
    try {
        const response = await apiClient.post('comment/admin/comments/batch-delete/', {
            ids: commentIds
        });
        return response.data;
    } catch (error) {
        console.error('Error batch deleting comments:', error);
        throw error;
    }
};

// 管理员切换评论置顶状态
export const adminToggleTopComment = async (commentId) => {
    try {
        const response = await apiClient.post(`comment/admin/comments/${commentId}/toggle-top/`);
        return response.data;
    } catch (error) {
        console.error('Error toggling comment top status:', error);
        throw error;
    }
};

