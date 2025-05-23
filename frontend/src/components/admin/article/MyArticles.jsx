import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Modal, message, Input, Select } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, LikeOutlined, FilterOutlined, CheckOutlined, RollbackOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getMyArticles, deleteArticle, submitDraft, updateArticle } from '@/api/articleApi';
import EditArticleModal from './EditArticleModal';

const { Search } = Input;
const { Option } = Select;

const MyArticles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const navigate = useNavigate();
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [currentArticle, setCurrentArticle] = useState(null);

    useEffect(() => {
        fetchArticles();
    }, [currentPage, pageSize, statusFilter, searchText]);

    const fetchArticles = async (page = currentPage, size = pageSize) => {
        setLoading(true);
        try {
            const params = {
                page,
                page_size: size,
                ...(statusFilter && { status: statusFilter }),
                ...(searchText && { search: searchText }),
            };
            const response = await getMyArticles(params);
            if (response?.results?.code === 200 && Array.isArray(response.results.data)) {
                setArticles(response.results.data);
                setTotal(response.count || 0);
            } else {
                throw new Error('数据格式不正确');
            }
        } catch (error) {
            console.error('获取文章列表失败:', error);
            message.error('获取文章列表失败：' + (error.response?.data?.message || error.message || '未知错误'));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitForReview = async (id) => {
        try {
            const response = await submitDraft(id);
            if (response.code === 200) {
                message.success('已提交审核');
                fetchArticles();
            }
        } catch (error) {
            console.error('提交审核失败:', error);
            message.error('提交审核失败：' + (error.response?.data?.message || error.message || '未知错误'));
        }
    };

    const handleToDraft = async (id) => {
        Modal.confirm({
            title: '确认转为草稿',
            content: '确定要将这篇文章转为草稿吗？',
            onOk: async () => {
                try {
                    const response = await updateArticle(id, { status: 'draft' });
                    if (response.code === 200) {
                        message.success('已转为草稿');
                        fetchArticles();
                    }
                } catch (error) {
                    console.error('转为草稿失败:', error);
                    message.error('转为草稿失败：' + (error.response?.data?.message || error.message || '未知错误'));
                }
            },
        });
    };

    const handleEdit = (article) => {
        setCurrentArticle(article);
        setEditModalVisible(true);
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这篇文章吗？此操作不可恢复。',
            onOk: async () => {
                try {
                    const response = await deleteArticle(id);
                    if (response.code === 200) {
                        message.success('删除成功');
                        if (articles.length === 1 && currentPage > 1) {
                            setCurrentPage(currentPage - 1);
                        } else {
                            fetchArticles();
                        }
                    }
                } catch (error) {
                    console.error('删除失败:', error);
                    message.error('删除失败：' + (error.response?.data?.message || error.message || '未知错误'));
                }
            },
        });
    };

    const statusDisplay = {
        draft: { text: '草稿', color: 'orange' },
        reviewing: { text: '审核中', color: 'blue' },
        review_failed: { text: '审核失败', color: 'red' },
        published: { text: '已发布', color: 'green' },
    };

    const columns = [
        {
            title: '封面',
            key: 'cover',
            width: 100,
            render: (_, record) => (
                <div className="w-16 h-16 overflow-hidden rounded">
                    {record.cover_image_url ? (
                        <img src={record.cover_image_url} alt={record.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">无图</div>
                    )}
                </div>
            ),
        },
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
            width: 150,
        },
        {
            title: '关联建筑',
            dataIndex: 'builder_name',
            key: 'builder',
            width: 150,
            render: (text, record) => (
                <span className={record.builder ? 'text-blue-600 cursor-pointer' : 'text-gray-400'}>{text || '无'}</span>
            ),
        },
        {
            title: '标签',
            dataIndex: 'tags',
            key: 'tags',
            width: 200,
            render: (tags) => (
                <div className="flex flex-wrap gap-1">
                    {tags?.split(',').filter((tag) => tag.trim()).map((tag) => (
                        <Tag key={tag} color="blue" className="m-0">{tag.trim()}</Tag>
                    ))}
                </div>
            ),
        },
        {
            title: '状态',
            key: 'status',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tag color={statusDisplay[record.status]?.color || 'default'}>
                        {statusDisplay[record.status]?.text || record.status}
                    </Tag>
                    {record.is_featured && <Tag color="gold">精选</Tag>}
                </Space>
            ),
        },
        {
            title: '时间',
            key: 'time',
            width: 180,
            render: (_, record) => (
                <div className="text-sm">
                    <div>创建: {new Date(record.created_at).toLocaleDateString()}</div>
                    <div className="text-gray-400">
                        {record.status === 'draft' || record.status === 'reviewing' || record.status === 'review_failed'
                            ? `最后保存: ${record.draft_saved_at ? new Date(record.draft_saved_at).toLocaleString() : '-'}`
                            : `发布: ${record.published_at ? new Date(record.published_at).toLocaleString() : '-'}`}
                    </div>
                </div>
            ),
        },
        {
            title: '数据',
            key: 'stats',
            width: 120,
            render: (_, record) => (
                <div className="text-sm">
                    <div title="浏览量">
                        <EyeOutlined className="mr-1" />
                        {record.views}
                    </div>
                    <div title="点赞数">
                        <LikeOutlined className="mr-1" />
                        {record.likes}
                    </div>
                </div>
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            render: (_, record) => (
                <Space size="middle">
                    <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/articles/${record.id}`)} title="查看" />
                    <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} title="编辑" />
                    {record.status === 'draft' ? (
                        <Button
                            type="text"
                            icon={<CheckOutlined />}
                            onClick={() => handleSubmitForReview(record.id)}
                            title="提交审核"
                            className="text-blue-600 hover:text-blue-500"
                        />
                    ) : (
                        <Button
                            type="text"
                            icon={<RollbackOutlined />}
                            onClick={() => handleToDraft(record.id)}
                            title="转为草稿"
                            className="text-orange-600 hover:text-orange-500"
                            disabled={record.status === 'published'} // 普通用户不能修改已发布文章
                        />
                    )}
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} title="删除" />
                </Space>
            ),
        },
    ];

    return (
        <Card
            title="我的文章"
            extra={<Button type="primary" onClick={() => navigate('/articles/create')}>发布新文章</Button>}
        >
            <Space direction="vertical" className="w-full mb-4">
                <Space className="w-full justify-between">
                    <Select
                        value={statusFilter}
                        onChange={(value) => {
                            setStatusFilter(value);
                            setCurrentPage(1);
                        }}
                        style={{ width: 120 }}
                        placeholder="选择状态"
                    >
                        <Option value="">全部状态</Option>
                        <Option value="draft">草稿</Option>
                        <Option value="reviewing">审核中</Option>
                        <Option value="review_failed">审核失败</Option>
                        <Option value="published">已发布</Option>
                    </Select>
                    <Search
                        placeholder="搜索文章标题"
                        allowClear
                        onSearch={(value) => {
                            setSearchText(value);
                            setCurrentPage(1);
                        }}
                        style={{ width: 200 }}
                    />
                </Space>
            </Space>
            <Table
                columns={columns}
                dataSource={articles}
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
                    showTotal: (total) => `共 ${total} 条`,
                }}
            />
            <EditArticleModal
                visible={editModalVisible}
                article={currentArticle}
                onCancel={() => {
                    setEditModalVisible(false);
                    setCurrentArticle(null);
                }}
                onSuccess={() => {
                    setEditModalVisible(false);
                    setCurrentArticle(null);
                    fetchArticles();
                }}
            />
        </Card>
    );
};

export default MyArticles;