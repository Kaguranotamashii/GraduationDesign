import apiClient from "@/utils/apiClient.jsx";

// 基础模型操作
export const addBuilder = async (modelData) => {
    try {
        const response = await apiClient.post('builder/add-builder/', modelData);
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
        console.log("Sending params:", params); // 添加日志
        const queryString = new URLSearchParams();

        // 正确处理参数
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryString.append(key, value);
            }
        });

        const url = `builder/all-page-models/?${queryString.toString()}`;
        console.log("Request URL:", url); // 添加日志

        const response = await apiClient.get(url);
        console.log("Response:", response.data); // 添加日志
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

export const addModel = async (modelData) => {
    try {
        const response = await apiClient.post('builder/add-model/', modelData);
        return response.data;
    } catch (error) {
        console.error('Error adding model:', error);
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

// 在 builderApi.jsx 中添加
export const uploadBuildingModel = async (builderId, modelFile) => {
    try {
        const formData = new FormData();
        formData.append('model', modelFile);

        const response = await apiClient.post(`builder/upload-building-model/${builderId}/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading building model:', error);
        throw error;
    }
};

// 在 builderApi.jsx 中添加
export const updateBuilderInfo = async (builderId, data) => {
    try {
        const response = await apiClient.put(`builder/update-builder-info/${builderId}/`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating builder info:', error);
        throw error;
    }
};

// 在 builderApi.jsx 中添加
export const getBuilderModelUrl = async (builderId) => {
    try {
        const response = await apiClient.get(`builder/details/${builderId}/`);
        return response.data;
    } catch (error) {
        console.error('Error getting builder model URL:', error);
        throw error;
    }
};