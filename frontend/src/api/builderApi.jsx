// from django.urls import path
//     from . import views
//
// urlpatterns = [
//     path('models/', views.add_model, name='add_model'),
//     path('models/my-models/', views.get_my_models, name='get_my_models'),  # 新增路由
// path('models/all-models/', views.get_all_models, name='get_all_models'),
//     path('models/all-page-models', views.get_all_buildings_paginated, name='get_all_models_page'),
//
//     #分类
// path('models/categories/', views.get_building_categories, name='get_building_categories'),
//     path('models/tags/', views.get_building_tags, name='get_building_tags'),
//
// ]

import apiClient from '../utils/apiClient';
import { message} from 'antd';
export const getAllModels = async () => {
    try {
        const response = await apiClient.get('/builder/all/');
        return response.data;
    } catch (error) {
        console.error('Error fetching models:', error);
        message.error('Error fetching models');
        return [];
    }
};
export const getAllBuildingsPaginated = async (page, pageSize) => {
    try {
        const response = await apiClient.get(`/builder/all-page-models/?page=${page}&page_size=${pageSize}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching models:', error);
        message.error('Error fetching models');
        return [];
    }
};

export const getAllPagesModels = async () => {
    try {
        const response = await apiClient.get('/builder/all-page-models/');
        return response.data;
    } catch (error) {
        message.error('获取模型列表失败');
        throw error;
    }
};

export const getMyModels = async () => {
    try {
        const response = await apiClient.get('/builder/my-models/');
        return response.data;
    } catch (error) {
        message.error('获取模型列表失败');
        throw error;
    }
};

export const addModels = async (modelData) => {
    try {
        const response = await apiClient.post('/builder/add-models/', modelData);
        return response.data;
    } catch (error) {
        message.error('添加模型失败');
        throw error;
    }
};

export const getBuildingCategories = async () => {
    try {
        const response = await apiClient.get('/builder/categories/');
        return response.data;
    } catch (error) {
        message.error('获取建筑类别失败');
        throw error;
    }
};

export const getBuildingTags = async () => {
    try {
        const response = await apiClient.get('/builder/tags/');
        return response.data;
    } catch (error) {
        message.error('获取建筑标签失败');
        throw error;
    }
};