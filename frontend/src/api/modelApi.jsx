import apiClient from '../utils/apiClient';
import {message} from "antd"; // 引入封装好的 apiClient
//src/api/modelApi.js

export const getAllModels = async () => {
    try {
        const response = await apiClient.get('/models/all-models/');
        return response.data;
    } catch (error) {
        message.error('获取模型列表失败');
        throw error;
    }
};
export const getAllPagesModels = async () => {
    try {
        const response = await apiClient.get('/models/all-page-models/');
        return response.data;
    } catch (error) {
        message.error('获取模型列表失败');
        throw error;
    }
};

export const addModels = async (modelData) => {
    try {
        const response = await apiClient.post('/models/add-models/', modelData);
        return response.data;
    } catch (error) {
        message.error('添加模型失败');
        throw error;
    }
};