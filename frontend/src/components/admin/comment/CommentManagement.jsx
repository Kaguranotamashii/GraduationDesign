import React, { useState, useEffect, useCallback } from 'react';
import {
    Table, Card, Button, Space, Modal, message,
    Input, Select, DatePicker, Form, Tooltip, Tag,
    Popconfirm
} from 'antd';
import {
    DeleteOutlined, EyeOutlined,
    PushpinOutlined, LikeOutlined,
    MessageOutlined, ExclamationCircleOutlined,
    SearchOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
    getAdminComments,
    adminDeleteComment,
    adminBatchDeleteComments,
    adminToggleTopComment
} from '@/api/commentApi';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const CommentManagement = () => {
    // 状态管理
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [searchForm] = Form.useForm();
    const [refreshKey, setRefreshKey] = useState(0);
    const navigate = useNavigate();

    // 获取评论列表
    const fetchComments = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const response = await getAdminComments({
                page: params.page || currentPage,
                page_size: params.page_size || pageSize,
                ...params
            });

            if (response.code === 200) {
                setComments(response.data);
                setTotal(response.total);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            message.error('获取评论列表失败：' + (error.message || '未知错误'));
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize]);

    useEffect(() => {
        const formValues = searchForm.getFieldsValue();
        fetchComments(formValues);
    }, [fetchComments, refreshKey]);

    // 删除评论
    const handleDelete = async (id) => {
        try {
            const response = await adminDeleteComment(id);
            if (response.code === 200) {
                message.success('删除成功');
                const currentDataLength = comments.length;
                // 如果当前页只有一条数据，且不是第一页，则跳转到上一页
                if (currentDataLength === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    setRefreshKey(prev => prev + 1);
                }
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            message.error('删除失败：' + (error.message || '未知错误'));
        }
    };

    // 批量删除
    const handleBatchDelete = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('请先选择要删除的评论');
            return;
        }

        try {
            const response = await adminBatchDeleteComments(selectedRowKeys);
            if (response.code === 200) {
                message.success('批量删除成功');
                setSelectedRowKeys([]);
                const remainingItems = total - selectedRowKeys.length;
                const newTotalPages = Math.ceil(remainingItems / pageSize);
                if (currentPage > newTotalPages) {
                    setCurrentPage(Math.max(1, newTotalPages));
                }
                setRefreshKey(prev => prev + 1);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            message.error('批量删除失败：' + (error.message || '未知错误'));
        }
    };

    // 置顶/取消置顶
    const handleToggleTop = async (id, currentStatus) => {
        try {
            const response = await adminToggleTopComment(id);
            if (response.code === 200) {
                message.success(currentStatus ? '取消置顶成功' : '置顶成功');
                setRefreshKey(prev => prev + 1);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            message.error((currentStatus ? '取消置顶' : '置顶') + '失败：' +
                (error.message || '未知错误'));
        }
    };

    // 搜索处理
    const handleSearch = () => {
        setCurrentPage(1);
        const values = searchForm.getFieldsValue();
        // 格式化日期范围
        if (values.date_range) {
            values.start_date = values.date_range[0]?.format('YYYY-MM-DD');
            values.end_date = values.date_range[1]?.format('YYYY-MM-DD');
        }
        delete values.date_range;
        fetchComments(values);
    };

    // 重置搜索
    const handleReset = () => {
        searchForm.resetFields();
        setCurrentPage(1);
        setSelectedRowKeys([]);
        setRefreshKey(prev => prev + 1);
    };

    // 表格列配置
    const columns = [
        {
            title: '评论内容',
            dataIndex: 'content',
            key: 'content',
            ellipsis: {
                showTitle: false,
            },
            render: (content) => (
                <Tooltip placement="topLeft" title={content}>
                    <span className="truncate block max-w-md">{content}</span>
                </Tooltip>
            ),
            width: 300,
        },
        {
            title: '评论者',
            key: 'author',
            width: 150,
            render: (_, record) => (
                <Space>
                    {record.author_avatar && (
                        <img
                            src={record.author_avatar}
                            alt="avatar"
                            className="w-6 h-6 rounded-full"
                        />
                    )}
                    <span>{record.author_name}</span>
                </Space>
            )
        },
        {
            title: '文章标题',
            key: 'article',
            width: 200,
            render: (_, record) => (
                <a
                    className="text-blue-600 hover:text-blue-800 cursor-pointer truncate block max-w-[200px]"
                    onClick={() => navigate(`/articles/${record.article}`)}
                    title={record.article_title}
                >
                    {record.article_title}
                </a>
            )
        },
        {
            title: '状态',
            key: 'status',
            width: 100,
            render: (_, record) => (
                <Space>
                    {record.is_top && (
                        <Tag color="blue" icon={<PushpinOutlined />}>
                            置顶
                        </Tag>
                    )}
                </Space>
            ),
            filters: [
                { text: '置顶', value: 'top' },
                { text: '普通', value: 'normal' },
            ],
            onFilter: (value, record) =>
                value === 'top' ? record.is_top : !record.is_top,
        },
        {
            title: '时间',
            key: 'time',
            width: 180,
            render: (_, record) => (
                <div className="text-sm">
                    <div>
                        {dayjs(record.created_at).format('YYYY-MM-DD HH:mm:ss')}
                    </div>
                    {record.updated_at !== record.created_at && (
                        <div className="text-gray-400 text-xs">
                            已编辑于 {dayjs(record.updated_at).format('YYYY-MM-DD HH:mm:ss')}
                        </div>
                    )}
                </div>
            ),
            sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
        },
        {
            title: '互动',
            key: 'interactions',
            width: 120,
            render: (_, record) => (
                <Space size="middle" className="text-gray-600">
                    <Tooltip title="点赞数">
                        <span>
                            <LikeOutlined /> {record.likes}
                        </span>
                    </Tooltip>
                    <Tooltip title="回复数">
                        <span>
                            <MessageOutlined /> {record.reply_count}
                        </span>
                    </Tooltip>
                </Space>
            )
        },
        {
            title: '操作',
            key: 'action',
            width: 180,
            fixed: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="查看">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/articles/${record.article}`, {
                                state: { scrollToComment: record.id }
                            })}
                        />
                    </Tooltip>
                    <Tooltip title={record.is_top ? "取消置顶" : "置顶"}>
                        <Button
                            type="text"
                            icon={<PushpinOutlined />}
                            onClick={() => handleToggleTop(record.id, record.is_top)}
                            className={record.is_top ? "text-blue-600" : ""}
                        />
                    </Tooltip>
                    <Tooltip title="删除">
                        <Popconfirm
                            title="确认删除"
                            description="确定要删除这条评论吗？删除后不可恢复，且相关回复也会被删除。"
                            onConfirm={() => handleDelete(record.id)}
                            okText="确认"
                            cancelText="取消"
                            okButtonProps={{ danger: true }}
                        >
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                            />
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
        <Card
            title="评论管理"
            className="shadow-sm"
            extra={
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => setRefreshKey(prev => prev + 1)}
                >
                    刷新
                </Button>
            }
        >
            {/* 搜索表单 */}
            <Form
                form={searchForm}
                layout="inline"
                className="mb-4 gap-2"
                onFinish={handleSearch}
            >
                <Form.Item name="search" className="min-w-[200px]">
                    <Input
                        placeholder="搜索评论内容/用户名"
                        allowClear
                        prefix={<SearchOutlined className="text-gray-400" />}
                    />
                </Form.Item>
                <Form.Item name="date_range">
                    <RangePicker
                        placeholder={['开始日期', '结束日期']}
                        className="w-[250px]"
                    />
                </Form.Item>
                <Form.Item name="status">
                    <Select
                        placeholder="评论状态"
                        style={{ width: 120 }}
                        allowClear
                    >
                        <Option value="top">置顶</Option>
                        <Option value="normal">普通</Option>
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

            {/* 批量操作工具栏 */}
            <div className="mb-4 flex justify-between items-center">
                <Space>
                    <Popconfirm
                        title="批量删除确认"
                        description={`确定要删除选中的 ${selectedRowKeys.length} 条评论吗？此操作不可恢复。`}
                        onConfirm={handleBatchDelete}
                        okText="确认"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                        disabled={selectedRowKeys.length === 0}
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            disabled={selectedRowKeys.length === 0}
                        >
                            批量删除
                        </Button>
                    </Popconfirm>
                </Space>
                <span className="text-gray-500">
                    {selectedRowKeys.length > 0 &&
                        `已选择 ${selectedRowKeys.length} 项`}
                </span>
            </div>

            {/* 评论列表表格 */}
            <Table
                columns={columns}
                dataSource={comments}
                rowKey="id"
                loading={loading}
                rowSelection={rowSelection}
                pagination={paginationConfig}
                scroll={{ x: 1200 }}
                className="w-full"
            />
        </Card>
    );
};

export default CommentManagement;