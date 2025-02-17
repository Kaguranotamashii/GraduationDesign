import apiClient from "@/utils/apiClient.jsx";

// 基础模型操作
export const addModel = async (modelData) => {
    try {
        const response = await apiClient.post('builder/add-models/', modelData);
        return response.data;
    } catch (error) {
        console.error('Error adding model:', error);
        throw error;
    }
}

export const getMyModels = async () => {
    try {
        const response = await apiClient.get('builder/my/');
        return response.data;
    } catch (error) {
        console.error('Error fetching my models:', error);
        throw error;
    }
}

export const getAllModels = async () => {
    try {
        const response = await apiClient.get('builder/all/');
        return response.data;
    } catch (error) {
        console.error('Error fetching all models:', error);
        throw error;
    }
}

export const getAllModelsPaginated = async (params) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const response = await apiClient.get(`builder/all-page-models/?${queryString}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching paginated models:', error);
        throw error;
    }
}

// 分类和标签操作
export const getBuildingCategories = async () => {
    try {
        const response = await apiClient.get('builder/categories/');
        return response.data;
    } catch (error) {
        console.error('Error fetching building categories:', error);
        throw error;
    }
}

export const getBuildingTags = async () => {
    try {
        const response = await apiClient.get('builder/tags/');
        return response.data;
    } catch (error) {
        console.error('Error fetching building tags:', error);
        throw error;
    }
}

// 模型文件管理
export const uploadModelFile = async (modelId, fileData) => {
    try {
        const response = await apiClient.post(`builder/upload-model/${modelId}/`, fileData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading model file:', error);
        throw error;
    }
}

export const deleteModelFile = async (modelId) => {
    try {
        const response = await apiClient.delete(`builder/delete-model/${modelId}/`);
        return response.data;
    } catch (error) {
        console.error('Error deleting model file:', error);
        throw error;
    }
}

export const updateModelJson = async (modelId, jsonData) => {
    try {
        const response = await apiClient.put(`builder/update-json/${modelId}/`, jsonData);
        return response.data;
    } catch (error) {
        console.error('Error updating model JSON:', error);
        throw error;
    }
}

export const getModelDetails = async (modelId) => {
    try {
        const response = await apiClient.get(`builder/details/${modelId}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching model details:', error);
        throw error;
    }
}

// JSON 数据操作
export const addBuilderJson = async (builderId, jsonData) => {
    try {
        const response = await apiClient.post(`builder/builders/${builderId}/json/`, jsonData);
        return response.data;
    } catch (error) {
        console.error('Error adding builder JSON:', error);
        throw error;
    }
}

export const updateBuilderJson = async (builderId, jsonData) => {
    try {
        const response = await apiClient.put(`builder/builders/${builderId}/json/update/`, jsonData);
        return response.data;
    } catch (error) {
        console.error('Error updating builder JSON:', error);
        throw error;
    }
}

export const deleteBuilderJson = async (builderId) => {
    try {
        const response = await apiClient.delete(`builder/builders/${builderId}/json/delete/`);
        return response.data;
    } catch (error) {
        console.error('Error deleting builder JSON:', error);
        throw error;
    }
}