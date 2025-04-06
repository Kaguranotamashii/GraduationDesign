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

// ================ 为 MyModels 组件添加新 API 函数 ================

// 获取我的模型列表（分页和筛选）
// 获取我的模型列表（分页和筛选）
export const getMyModelsPaginated = async (params) => {
    try {
        const queryString = new URLSearchParams();

        // 处理基本参数
        if (params.page) queryString.append('page', params.page);
        if (params.page_size) queryString.append('page_size', params.page_size);
        if (params.search) queryString.append('search', params.search);
        if (params.category) queryString.append('category', params.category);
        if (params.has_model) queryString.append('has_model', params.has_model);

        // 处理数组类型参数
        if (Array.isArray(params.tags)) {
            params.tags.forEach(tag => {
                if (tag) queryString.append('tags[]', tag);
            });
        }

        if (Array.isArray(params.date_range)) {
            params.date_range.forEach(date => {
                if (date) queryString.append('date_range[]', date);
            });
        }

        const url = `builder/my/?${queryString.toString()}`;
        const response = await apiClient.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching my models:', error);
        throw error;
    }
};

// 删除我的模型
export const deleteMyModel = async (modelId) => {
    try {
        const response = await apiClient.delete(`builder/my-models/${modelId}/delete/`);
        return response.data;
    } catch (error) {
        console.error('Error deleting model:', error);
        throw error;
    }
};

// 更新我的模型信息
export const updateMyModel = async (modelId, data) => {
    try {
        // 如果包含文件，需使用 FormData
        let requestData = data;
        let headers = {};

        if (data instanceof FormData) {
            headers = {
                'Content-Type': 'multipart/form-data',
            };
        }

        const response = await apiClient.put(`builder/my-models/${modelId}/update/`, requestData, { headers });
        return response.data;
    } catch (error) {
        console.error('Error updating model:', error);
        throw error;
    }
};

// 获取单个模型详情
export const getMyModelDetail = async (modelId) => {
    try {
        const response = await apiClient.get(`builder/my-models/${modelId}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching model detail:', error);
        throw error;
    }
};


// 获取所有有模型的建筑列表
export const getAllModelsWithThreeD = async (params = {}) => {
    try {
        const queryString = new URLSearchParams();

        // 添加默认参数：只获取有模型的建筑
        queryString.append('has_model', '1');

        // 处理其他筛选参数
        if (params.page) queryString.append('page', params.page);
        if (params.page_size) queryString.append('page_size', params.page_size);
        if (params.search) queryString.append('search', params.search);
        if (params.category) queryString.append('category', params.category);

        // 处理标签参数 - 支持字符串或数组
        if (params.tags) {
            if (Array.isArray(params.tags)) {
                // 如果是数组，将所有标签合并为逗号分隔的字符串
                if (params.tags.length > 0) {
                    queryString.append('tags', params.tags.join(','));
                }
            } else {
                // 如果是字符串，直接添加
                queryString.append('tags', params.tags);
            }
        }

        // 处理日期范围
        if (Array.isArray(params.date_range) && params.date_range.length === 2) {
            params.date_range.forEach(date => {
                if (date) queryString.append('date_range[]', date);
            });
        }

        const url = `builder/models-with-3d/?${queryString.toString()}`;
        console.log("Request URL for 3D models:", url);

        const response = await apiClient.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching 3D models:', error);
        throw error;
    }
}








// 分类和标签操作
export const getBuildingCategoriesModels = async () => {
    try {
        const response = await apiClient.get('builder/categories_models/');
        return response.data;
    } catch (error) {
        console.error('Error fetching building categories:', error);
        throw error;
    }
}

export const getBuildingTagsModels = async () => {
    try {
        const response = await apiClient.get('builder/tags_models/');
        return response.data;
    } catch (error) {
        console.error('Error fetching building tags:', error);
        throw error;
    }
}
// 搜索建筑物模型（新函数）
export const searchBuildingModels = async (params = {}) => {
    try {
        // 构造查询参数
        const queryParams = new URLSearchParams();
        if (params.category) {
            queryParams.append('category', params.category);
        }
        if (params.tag) {
            queryParams.append('tag', params.tag);
        }

        // 发送 GET 请求
        const response = await apiClient.get(`builder/search_buildings_models/?${queryParams.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error searching building models:', error);
        throw error;
    }
};



