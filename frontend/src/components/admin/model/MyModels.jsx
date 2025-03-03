import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Modal, message, Input, Select, DatePicker, Switch } from 'antd';
import { EyeOutlined, FileTextOutlined, EditOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
    getMyModelsPaginated,
    deleteMyModel,
    getBuildingCategories,
    getBuildingTags,
    updateBuilderJson,
    getModelDetails
} from '@/api/builderApi';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const MyModels = () => {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [tagFilter, setTagFilter] = useState([]);
    const [dateRange, setDateRange] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [jsonModalVisible, setJsonModalVisible] = useState(false);
    const [currentJsonModel, setCurrentJsonModel] = useState(null);
    const [onlyWithModel, setOnlyWithModel] = useState(false);

    const navigate = useNavigate();

    // 获取分类和标签数据
    useEffect(() => {
        const fetchCategoriesAndTags = async () => {
            try {
                const [categoriesRes, tagsRes] = await Promise.all([
                    getBuildingCategories(),
                    getBuildingTags()
                ]);

                if (categoriesRes.code === 200) {
                    setCategories(categoriesRes.data || []);
                }

                if (tagsRes.code === 200) {
                    setTags(tagsRes.data || []);
                }
            } catch (error) {
                console.error('获取分类或标签失败:', error);
                message.error('加载筛选选项失败');
            }
        };

        fetchCategoriesAndTags();
    }, []);

    // 获取模型列表数据
    const fetchModels = async () => {
        setLoading(true);
        try {
            // 构建查询参数
            const params = {
                page: currentPage,
                page_size: pageSize,
                search: searchText,
                category: categoryFilter,
                tags: tagFilter,
                has_model: onlyWithModel ? 1 : undefined, // 添加有模型筛选
            };

            // 添加日期范围参数（如果有）
            if (dateRange && dateRange.length === 2) {
                params.date_range = [
                    dateRange[0].format('YYYY-MM-DD'),
                    dateRange[1].format('YYYY-MM-DD')
                ];
            }

            const response = await getMyModelsPaginated(params);

            if (response.code === 200) {
                setModels(response.results.data || []);
                setTotal(response.count || 0);
            } else {
                message.error('获取模型列表失败');
            }
        } catch (error) {
            console.error('获取模型列表失败:', error);
            message.error('获取模型列表失败: ' + (error.message || '未知错误'));
        } finally {
            setLoading(false);
        }
    };

    // 当筛选条件变化时重新获取数据
    useEffect(() => {
        fetchModels();
    }, [currentPage, pageSize, searchText, categoryFilter, tagFilter, dateRange, onlyWithModel]);

    // 处理删除模型
    const handleDelete = (id) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这个建筑模型吗？此操作不可恢复。',
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                try {
                    const response = await deleteMyModel(id);
                    if (response.code === 200) {
                        message.success('删除成功');

                        // 如果当前页只有一条数据且不是第一页，则返回上一页
                        if (models.length === 1 && currentPage > 1) {
                            setCurrentPage(currentPage - 1);
                        } else {
                            fetchModels();
                        }
                    } else {
                        message.error(response.message || '删除失败');
                    }
                } catch (error) {
                    console.error('删除模型失败:', error);
                    message.error('删除失败: ' + (error.message || '未知错误'));
                }
            }
        });
    };

    // 打开编辑页面
    const handleEdit = (model) => {
        navigate(`/admin/models/edit/${model.id}`);
    };

    // 查看3D模型
    const handleViewModel = (modelId) => {
        navigate(`/modelViewer/${modelId}`);
    };

    // 下载模型文件
    const handleDownloadModel = async (modelId) => {
        try {
            // 先获取模型详情信息
            const response = await getModelDetails(modelId);

            if (response.code === 200 && response.data.model_url) {
                // 创建一个临时链接并点击它来下载文件
                const link = document.createElement('a');
                link.href = response.data.model_url;
                link.download = response.data.model_url.split('/').pop();
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                message.error('获取模型文件失败');
            }
        } catch (error) {
            console.error('下载模型文件失败:', error);
            message.error('下载失败: ' + (error.message || '未知错误'));
        }
    };

    // 处理 JSON 数据查看/编辑
    const handleJsonEdit = (model) => {
        setCurrentJsonModel({
            ...model,
            jsonEditorContent: model.json || '{}'
        });
        setJsonModalVisible(true);
    };

    // 保存 JSON 数据
    const handleSaveJson = async () => {
        if (!currentJsonModel) return;

        try {
            // 验证 JSON 格式
            try {
                JSON.parse(currentJsonModel.jsonEditorContent);
            } catch (error) {
                message.error('JSON 格式不正确，请检查');
                return;
            }

            const response = await updateBuilderJson(currentJsonModel.id, {
                json: currentJsonModel.jsonEditorContent
            });

            if (response.code === 200) {
                message.success('JSON 数据保存成功');
                setJsonModalVisible(false);
                fetchModels();
            } else {
                message.error(response.message || 'JSON 数据保存失败');
            }
        } catch (error) {
            console.error('保存 JSON 数据失败:', error);
            message.error('保存失败: ' + (error.message || '未知错误'));
        }
    };

    // 表格列定义
    const columns = [
        {
            title: '预览图',
            key: 'image',
            width: 100,
            render: (_, record) => (
                <div className="w-16 h-16 overflow-hidden rounded">
                    {record.image_url ? (
                        <img
                            src={record.image_url}
                            alt={record.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                            无图
                        </div>
                    )}
                </div>
            )
        },
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            width: 150,
        },
        {
            title: '分类',
            dataIndex: 'category',
            key: 'category',
            width: 120,
            render: (category) => (
                <Tag color="blue">{category}</Tag>
            )
        },
        {
            title: '标签',
            key: 'tags',
            width: 200,
            render: (_, record) => (
                <div className="flex flex-wrap gap-1">
                    {record.tags_list?.map((tag) => (
                        <Tag key={tag} color="green">
                            {tag}
                        </Tag>
                    ))}
                </div>
            )
        },
        {
            title: '地址',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true,
            width: 200,
        },
        {
            title: '模型文件',
            key: 'model',
            width: 100,
            render: (_, record) => (
                <div>
                    {record.model_url ? (
                        <Tag color="success">已上传</Tag>
                    ) : (
                        <Tag color="warning">未上传</Tag>
                    )}
                </div>
            )
        },
        {
            title: 'JSON数据',
            key: 'json',
            width: 100,
            render: (_, record) => (
                <div>
                    {record.json ? (
                        <Tag color="success">已配置</Tag>
                    ) : (
                        <Tag color="warning">未配置</Tag>
                    )}
                </div>
            )
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
            render: (created_at) => new Date(created_at).toLocaleString()
        },
        {
            title: '操作',
            key: 'action',
            width: 250,
            fixed: 'right',
            render: (_, record) => (
                <Space size="middle">
                    {record.model_url && (
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewModel(record.id)}
                            title="查看模型"
                            className="text-blue-600 hover:text-blue-500"
                        />
                    )}

                    <Button
                        type="text"
                        icon={<FileTextOutlined />}
                        onClick={() => handleJsonEdit(record)}
                        title="查看/编辑JSON"
                        className="text-purple-600 hover:text-purple-500"
                    />

                    {record.model_url && (
                        <Button
                            type="text"
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownloadModel(record.id)}
                            title="下载模型"
                            className="text-green-600 hover:text-green-500"
                        />
                    )}

                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        title="修改"
                    />

                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                        title="删除"
                    />
                </Space>
            ),
        },
    ];

    return (
        <Card
            title="我的建筑模型"
            extra={
                <Button type="primary" onClick={() => navigate('/admin/models/create')}>
                    添加新建筑
                </Button>
            }
        >
            <Space direction="vertical" className="w-full mb-4">
                <Space className="w-full flex-wrap justify-between">
                    <Space className="flex-wrap">
                        <Select
                            placeholder="选择分类"
                            allowClear
                            style={{ width: 150 }}
                            value={categoryFilter}
                            onChange={(value) => {
                                setCategoryFilter(value);
                                setCurrentPage(1);
                            }}
                        >
                            {categories.map(category => (
                                <Option key={category} value={category}>{category}</Option>
                            ))}
                        </Select>

                        <Select
                            placeholder="选择标签"
                            mode="multiple"
                            allowClear
                            style={{ width: 200 }}
                            value={tagFilter}
                            onChange={(value) => {
                                setTagFilter(value);
                                setCurrentPage(1);
                            }}
                        >
                            {tags.map(tag => (
                                <Option key={tag} value={tag}>{tag}</Option>
                            ))}
                        </Select>

                        <RangePicker
                            placeholder={['开始日期', '结束日期']}
                            onChange={(dates) => {
                                setDateRange(dates);
                                setCurrentPage(1);
                            }}
                        />

                        <Search
                            placeholder="搜索建筑名称"
                            allowClear
                            style={{ width: 200 }}
                            onSearch={(value) => {
                                setSearchText(value);
                                setCurrentPage(1);
                            }}
                        />
                    </Space>

                    <div className="flex items-center">
                        <span className="mr-2">仅显示有模型的建筑:</span>
                        <Switch
                            checked={onlyWithModel}
                            onChange={(checked) => {
                                setOnlyWithModel(checked);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </Space>
            </Space>

            <Table
                columns={columns}
                dataSource={models}
                rowKey="id"
                loading={loading}
                scroll={{ x: 1600 }}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    },
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条记录`,
                }}
            />

            {/* JSON 数据编辑模态框 */}
            <Modal
                title="JSON 数据"
                open={jsonModalVisible}
                onCancel={() => setJsonModalVisible(false)}
                onOk={handleSaveJson}
                width={800}
                okText="保存"
                cancelText="取消"
            >
                {currentJsonModel && (
                    <Input.TextArea
                        rows={20}
                        value={currentJsonModel.jsonEditorContent}
                        onChange={(e) => {
                            setCurrentJsonModel({
                                ...currentJsonModel,
                                jsonEditorContent: e.target.value
                            });
                        }}
                        placeholder="请输入 JSON 数据"
                    />
                )}
            </Modal>
        </Card>
    );
};

export default MyModels;