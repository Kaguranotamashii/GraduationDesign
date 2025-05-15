import React, { useState, useEffect, useCallback } from 'react';
import {
    Table, Card, Button, Space, Modal, message,
    Input, Select, Form, Tooltip, Tag,
    Popconfirm,
} from 'antd';
import {
    DeleteOutlined, EyeOutlined, EditOutlined,
    SearchOutlined, ReloadOutlined, StarOutlined,
    CheckOutlined, RollbackOutlined, LikeOutlined, LikeFilled,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
    adminGetAllArticles,
    adminDeleteArticle,
    adminUpdateArticle,
    likeArticle,
    unlikeArticle,
} from '@/api/articleApi';

const { Search } = Input;
const { Option } = Select;

const ArticleManagement = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [searchForm] = Form.useForm();
    const [refreshKey, setRefreshKey] = useState(0);
    const navigate = useNavigate();

    // 状态显示配置
    const statusDisplay = {
        draft: { text: '草稿', color: 'orange' },
        reviewing: { text: '审核中', color: 'blue' },
        review_failed: { text: '审核失败', color: 'red' },
        published: { text: '已发布', color: 'green' },
    };

    // 获取文章列表
    const fetchArticles = useCallback(
        async (params = {}) => {
            setLoading(true);
            try {
                const cleanParams = {};
                Object.keys(params).forEach((key) => {
                    if (params[key] && params[key] !== 'undefined' && params[key] !== 'all') {
                        cleanParams[key] = params[key];
                    }
                });
                cleanParams.page = params.page || currentPage;
                cleanParams.page_size = params.page_size || pageSize;

                const response = await adminGetAllArticles(cleanParams);
                if (response.results?.code === 200 && Array.isArray(response.results.data)) {
                    setArticles(response.results.data || []);
                    setTotal(response.count || 0);
                } else {
                    throw new Error(response.results?.message || '数据格式错误');
                }
            } catch (error) {
                message.error('获取文章列表失败：' + (error.response?.data?.message || error.message || '未知错误'));
            } finally {
                setLoading(false);
            }
        },
        [currentPage, pageSize]
    );

    useEffect(() => {
        const formValues = searchForm.getFieldsValue();
        fetchArticles(formValues);
    }, [fetchArticles, refreshKey]);

    // 删除文章
    const handleDelete = async (id) => {
        try {
            const response = await adminDeleteArticle(id);
            if (response.code === 200) {
                message.success('删除成功');
                const currentDataLength = articles.length;
                if (currentDataLength === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    setRefreshKey((prev) => prev + 1);
                }
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            message.error('删除失败：' + (error.response?.data?.message || error.message || '未知错误'));
        }
    };

    // 批量删除
    const handleBatchDelete = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('请先选择要删除的文章');
            return;
        }
        try {
            const results = await Promise.all(
                selectedRowKeys.map(async (id) => {
                    try {
                        await adminDeleteArticle(id);
                        return { id, success: true };
                    } catch (error) {
                        return { id, success: false, error };
                    }
                })
            );
            const failed = results.filter((r) => !r.success);
            if (failed.length === 0) {
                message.success('批量删除成功');
            } else {
                message.error(`部分删除失败：${failed.length} 篇文章`);
                console.error('批量删除错误:', failed);
            }
            setSelectedRowKeys([]);
            const remainingItems = total - selectedRowKeys.length;
            const newTotalPages = Math.ceil(remainingItems / pageSize);
            if (currentPage > newTotalPages) {
                setCurrentPage(Math.max(1, newTotalPages));
            }
            setRefreshKey((prev) => prev + 1);
        } catch (error) {
            message.error('批量删除失败：' + (error.response?.data?.message || error.message || '未知错误'));
        }
    };

    // 切换精选状态
    const handleToggleFeatured = async (article) => {
        try {
            const formData = new FormData();
            formData.append('is_featured', !article.is_featured);
            const response = await adminUpdateArticle(article.id, formData);
            if (response.code === 200) {
                message.success(article.is_featured ? '取消精选成功' : '设为精选成功');
                setRefreshKey((prev) => prev + 1);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            message.error('操作失败：' + (error.response?.data?.message || error.message || '未知错误'));
        }
    };

    // 审核文章（支持所有状态转换）
    const handleUpdateStatus = async (article, newStatus) => {
        try {
            const formData = new FormData();
            formData.append('status', newStatus);
            const response = await adminUpdateArticle(article.id, formData);
            if (response.code === 200) {
                message.success(
                    newStatus === 'published' ? '已通过审核并发布' :
                        newStatus === 'review_failed' ? '已拒绝审核' :
                            newStatus === 'reviewing' ? '已重新提交审核' :
                                '已转为草稿'
                );
                setRefreshKey((prev) => prev + 1);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            message.error('操作失败：' + (error.response?.data?.message || error.message || '未知错误'));
        }
    };

    // 点赞或取消点赞
    const handleToggleLike = async (article) => {
        try {
            const isLiked = article.is_liked;
            const response = isLiked ? await unlikeArticle(article.id) : await likeArticle(article.id);
            if (response.code === 200) {
                message.success(isLiked ? '取消点赞成功' : '点赞成功');
                setArticles((prevArticles) =>
                    prevArticles.map((item) =>
                        item.id === article.id
                            ? {
                                ...item,
                                is_liked: !isLiked,
                                likes: isLiked ? item.likes - 1 : item.likes + 1,
                            }
                            : item
                    )
                );
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            message.error('操作失败：' + (error.response?.data?.message || error.message || '未知错误'));
        }
    };

    // 搜索处理
    const handleSearch = () => {
        setCurrentPage(1);
        const values = searchForm.getFieldsValue();
        fetchArticles(values);
    };

    // 重置搜索
    const handleReset = () => {
        searchForm.resetFields();
        setCurrentPage(1);
        setSelectedRowKeys([]);
        setRefreshKey((prev) => prev + 1);
    };

    // 表格列配置
    const columns = [
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
            render: (title) => (
                <Tooltip placement="topLeft" title={title}>
                    <span className="truncate block max-w-md">{title}</span>
                </Tooltip>
            ),
            width: 250,
        },
        {
            title: '作者',
            dataIndex: 'author_name',
            key: 'author',
            width: 150,
            render: (text, record) => text || record.author || '未知',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <Tag color={statusDisplay[status]?.color || 'default'}>
                    {statusDisplay[status]?.text || status}
                </Tag>
            ),
            filters: [
                { text: '草稿', value: 'draft' },
                { text: '审核中', value: 'reviewing' },
                { text: '审核失败', value: 'review_failed' },
                { text: '已发布', value: 'published' },
                { text: '全部', value: 'all' },
            ],
            onFilter: (value, record) => value === 'all' || record.status === value,
        },
        {
            title: '精选',
            dataIndex: 'is_featured',
            key: 'is_featured',
            width: 80,
            render: (isFeatured) => (isFeatured ? <Tag color="gold">精选</Tag> : null),
        },
        {
            title: '浏览/点赞',
            key: 'stats',
            width: 120,
            render: (_, record) => (
                <Space>
                    <span>{record.views}</span>/
                    <Tooltip title={record.is_liked ? '取消点赞' : '点赞'}>
                        <Button
                            type="text"
                            icon={record.is_liked ? <LikeFilled /> : <LikeOutlined />}
                            onClick={() => handleToggleLike(record)}
                            className={record.is_liked ? 'text-blue-600' : 'text-gray-600'}
                        >
                            {record.likes}
                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
            render: (time) => new Date(time).toLocaleString(),
            sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
        },
        {
            title: '操作',
            key: 'action',
            width: 300,
            fixed: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="查看">
                        <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/articles/${record.id}`)} />
                    </Tooltip>
                    <Tooltip title="编辑">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/articles/edit/${record.id}`)}
                        />
                    </Tooltip>
                    {record.status === 'reviewing' ? (
                        <>
                            <Tooltip title="通过审核并发布">
                                <Popconfirm
                                    title="通过审核"
                                    description="确认通过审核并发布此文章？"
                                    onConfirm={() => handleUpdateStatus(record, 'published')}
                                    okText="确认"
                                    cancelText="取消"
                                >
                                    <Button type="text" icon={<CheckOutlined />} className="text-green-600" />
                                </Popconfirm>
                            </Tooltip>
                            <Tooltip title="拒绝审核">
                                <Popconfirm
                                    title="拒绝审核"
                                    description="确认拒绝此文章的审核？"
                                    onConfirm={() => handleUpdateStatus(record, 'review_failed')}
                                    okText="确认"
                                    cancelText="取消"
                                >
                                    <Button type="text" icon={<RollbackOutlined />} className="text-red-600" />
                                </Popconfirm>
                            </Tooltip>
                        </>
                    ) : (
                        <Tooltip title={record.status === 'published' ? '转为草稿' : '提交审核'}>
                            <Popconfirm
                                title={record.status === 'published' ? '转为草稿' : '提交审核'}
                                description={
                                    record.status === 'published' ? '转为草稿后文章将不再公开，确认操作？' : '确认提交此文章进行审核？'
                                }
                                onConfirm={() => handleUpdateStatus(record, record.status === 'published' ? 'draft' : 'reviewing')}
                                okText="确认"
                                cancelText="取消"
                            >
                                <Button
                                    type="text"
                                    icon={record.status === 'published' ? <RollbackOutlined /> : <CheckOutlined />}
                                    className={record.status === 'published' ? 'text-orange-600' : 'text-blue-600'}
                                />
                            </Popconfirm>
                        </Tooltip>
                    )}
                    <Tooltip title={record.is_featured ? '取消精选' : '设为精选'}>
                        <Button
                            type="text"
                            icon={<StarOutlined />}
                            onClick={() => handleToggleFeatured(record)}
                            className={record.is_featured ? 'text-yellow-600 hover:text-yellow-500' : 'text-gray-600 hover:text-gray-500'}
                        />
                    </Tooltip>
                    <Tooltip title="删除">
                        <Popconfirm
                            title="确认删除"
                            description="确定要删除这篇文章吗？删除后不可恢复。"
                            onConfirm={() => handleDelete(record.id)}
                            okText="确认"
                            cancelText="取消"
                            okButtonProps={{ danger: true }}
                        >
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // 表格行选择配置
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        },
    };

    // 分页配置
    const paginationConfig = {
        current: currentPage,
        pageSize: pageSize,
        total: total,
        onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
            if (size !== pageSize) {
                setCurrentPage(1);
            }
        },
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
    };

    return (
        <Card title="文章管理" className="shadow-sm" extra={
            <Space>
                <Button type="primary" onClick={() => navigate('/admin/articles/create')}>
                    创建文章
                </Button>
                <Button icon={<ReloadOutlined />} onClick={() => setRefreshKey((prev) => prev + 1)}>
                    刷新
                </Button>
            </Space>
        }>
            <Form form={searchForm} layout="inline" className="mb-4 gap-2" onFinish={handleSearch}>
                <Form.Item name="search" className="min-w-[200px]">
                    <Input
                        placeholder="搜索文章标题"
                        allowClear
                        prefix={<SearchOutlined className="text-gray-400" />}
                    />
                </Form.Item>
                <Form.Item name="status">
                    <Select placeholder="文章状态" style={{ width: 120 }} allowClear>
                        <Option value="draft">草稿</Option>
                        <Option value="reviewing">审核中</Option>
                        <Option value="review_failed">审核失败</Option>
                        <Option value="published">已发布</Option>
                        <Option value="all">全部</Option>
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                            搜索
                        </Button>
                        <Button onClick={handleReset}>重置</Button>
                    </Space>
                </Form.Item>
            </Form>
            <div className="mb-4 flex justify-between items-center">
                <Space>
                    <Popconfirm
                        title="批量删除确认"
                        description={`确定要删除选中的 ${selectedRowKeys.length} 篇文章吗？此操作不可恢复。`}
                        onConfirm={handleBatchDelete}
                        okText="确认"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                        disabled={selectedRowKeys.length === 0}
                    >
                        <Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0}>
                            批量删除
                        </Button>
                    </Popconfirm>
                </Space>
                <span className="text-gray-500">
          {selectedRowKeys.length > 0 && `已选择 ${selectedRowKeys.length} 项`}
        </span>
            </div>
            <Table
                columns={columns}
                dataSource={articles}
                rowKey="id"
                loading={loading}
                rowSelection={rowSelection}
                pagination={paginationConfig}
                scroll={{ x: 1300 }}
                className="w-full"
            />
        </Card>
    );
};

export default ArticleManagement;