import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Modal, message, Input } from 'antd';
import { DeleteOutlined, EyeOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getMyComments, deleteComment } from '@/api/commentApi';
const { Search } = Input;

const MyComment = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();

    const fetchComments = async (page = currentPage, size = pageSize) => {
        setLoading(true);
        try {
            const params = {
                page,
                page_size: size,
                ...(searchText && { search: searchText })
            };

            const response = await getMyComments(params);
            if (response.code === 200) {
                setComments(response.data);
                setTotal(response.total);
            } else {
                throw new Error(response.message || '获取评论失败');
            }
        } catch (error) {
            console.error('获取评论列表失败:', error);
            message.error('获取评论列表失败：' + (error.message || '未知错误'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [currentPage, pageSize, searchText]);

    const handleDelete = async (id) => {
        Modal.confirm({
            title: '确认删除评论',
            content: (
                <div>
                    <p>确定要删除这条评论吗？</p>
                    <p className="text-red-500">注意：删除后，这条评论的所有回复也会被删除。</p>
                </div>
            ),
            okText: '确认',
            cancelText: '取消',
            okButtonProps: {
                danger: true
            },
            onOk: async () => {
                try {
                    const response = await deleteComment(id);
                    if (response.code === 200) {
                        message.success('评论删除成功');
                        if (comments.length === 1 && currentPage > 1) {
                            setCurrentPage(currentPage - 1);
                        } else {
                            fetchComments();
                        }
                    } else {
                        throw new Error(response.message || '删除失败');
                    }
                } catch (error) {
                    console.error('删除评论失败:', error);
                    message.error('删除评论失败：' + (error.message || '未知错误'));
                }
            }
        });
    };

    const columns = [
        {
            title: '评论内容',
            dataIndex: 'content',
            key: 'content',
            ellipsis: true,
            width: 300,
        },
// 在 columns 数组中修改这两列的 render 函数
        {
            title: '文章标题',
            key: 'article',
            width: 200,
            render: (_, record) => (
                <a
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    onClick={() => navigate(`/articles/${record.article}`)}
                >
                    {record.article_title}
                </a>
            )
        },
        {
            title: '回复给',
            key: 'replyTo',
            width: 120,
            render: (_, record) => (
                record.parent ? (
                    <span className="text-gray-600">
                @{record.parent_author_name}
            </span>
                ) : '-'
            )

        },

        {
            title: '时间',
            key: 'time',
            width: 180,
            render: (_, record) => (
                <div className="text-sm">
                    <div>
                        {new Date(record.created_at).toLocaleString()}
                    </div>
                    {record.updated_at !== record.created_at && (
                        <div className="text-gray-400">
                            已编辑
                        </div>
                    )}
                </div>
            )
        },
        {
            title: '互动',
            key: 'interactions',
            width: 100,
            render: (_, record) => (
                <Space size="middle" className="text-gray-600">
                    <span title="点赞数">
                        <LikeOutlined /> {record.likes}
                    </span>
                    <span title="回复数">
                        <MessageOutlined /> {record.reply_count}
                    </span>
                </Space>
            )
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/articles/${record.article}`, {
                            state: { scrollToComment: record.id }
                        })}
                        title="查看"
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
        <Card title="我的评论" className="shadow-sm">
            <Space direction="vertical" className="w-full mb-4">
                <Space className="w-full justify-end">
                    <Search
                        placeholder="搜索评论内容"
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
                dataSource={comments}
                rowKey="id"
                loading={loading}
                scroll={{ x: 1200 }}
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
        </Card>
    );
};

export default MyComment;