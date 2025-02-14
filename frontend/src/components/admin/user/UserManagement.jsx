import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Input,
    Button,
    Space,
    Tag,
    Switch,
    message,
    Tooltip,
    Modal,
    Form,
    Popconfirm
} from 'antd';
import {
    SearchOutlined,
    UserOutlined,
    UserDeleteOutlined,
    UserSwitchOutlined,
    MailOutlined,
    KeyOutlined,
    EditOutlined
} from '@ant-design/icons';
import {
    getAdminUserList,
    updateUserByAdmin,
    deleteUserByAdmin,
    resetUserPasswordByAdmin
} from '@/api/userApi.jsx';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [resetPasswordModal, setResetPasswordModal] = useState({
        visible: false,
        userId: null
    });
    const [resetPasswordForm] = Form.useForm();

    useEffect(() => {
        fetchUsers();
    }, [pagination.current, pagination.pageSize, searchText]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await getAdminUserList({
                page: pagination.current,
                pageSize: pagination.pageSize,
                search: searchText
            });
            if (response.code === 200) {
                setUsers(response.data.users);
                setPagination({
                    ...pagination,
                    total: response.data.total
                });
            }
        } catch (error) {
            message.error('获取用户列表失败');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (newPagination) => {
        setPagination({
            ...pagination,
            current: newPagination.current,
            pageSize: newPagination.pageSize
        });
    };

    const handleStatusChange = async (checked, record) => {
        try {
            const response = await updateUserByAdmin(record.id, {
                is_active: checked
            });
            if (response.code === 200) {
                message.success('用户状态更新成功');
                fetchUsers();
            }
        } catch (error) {
            message.error('状态更新失败');
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
        setPagination({ ...pagination, current: 1 }); // 重置到第一页
    };

    const handleDelete = async (userId) => {
        try {
            const response = await deleteUserByAdmin(userId);
            if (response.code === 200) {
                message.success('用户删除成功');
                fetchUsers();
            }
        } catch (error) {
            message.error('删除用户失败');
        }
    };

    const handleResetPassword = async (values) => {
        try {
            const response = await resetUserPasswordByAdmin(
                resetPasswordModal.userId,
                values.newPassword
            );
            if (response.code === 200) {
                message.success('密码重置成功');
                setResetPasswordModal({ visible: false, userId: null });
                resetPasswordForm.resetFields();
            }
        } catch (error) {
            message.error('密码重置失败');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
            render: (text, record) => (
                <Space>
                    <UserOutlined />
                    {text}
                    {record.is_staff && <Tag color="blue">管理员</Tag>}
                </Space>
            ),
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
            render: (text) => (
                <Space>
                    <MailOutlined />
                    {text}
                </Space>
            ),
        },
        {
            title: '注册时间',
            dataIndex: 'date_joined',
            key: 'date_joined',
            render: (text) => new Date(text).toLocaleString(),
        },
        {
            title: '状态',
            key: 'status',
            render: (_, record) => (
                <Space>
                    <Tooltip title={record.is_active ? '点击禁用用户' : '点击启用用户'}>
                        <Switch
                            checked={record.is_active}
                            onChange={(checked) => handleStatusChange(checked, record)}
                            disabled={record.is_staff} // 禁止修改管理员状态
                        />
                    </Tooltip>
                    <Tag color={record.is_active ? 'green' : 'red'}>
                        {record.is_active ? '正常' : '禁用'}
                    </Tag>
                </Space>
            ),
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<KeyOutlined />}
                        onClick={() => setResetPasswordModal({
                            visible: true,
                            userId: record.id
                        })}
                        disabled={record.is_staff}
                    >
                        重置密码
                    </Button>
                    <Popconfirm
                        title="确定要删除此用户吗？"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                        disabled={record.is_staff}
                    >
                        <Button
                            type="text"
                            danger
                            icon={<UserDeleteOutlined />}
                            disabled={record.is_staff}
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card title="用户管理" className="shadow-md">
            <div className="mb-4 flex justify-between items-center">
                <Input
                    placeholder="搜索用户名或邮箱"
                    prefix={<SearchOutlined />}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ width: 300 }}
                    allowClear
                />
                <Space>
                    <Button
                        type="primary"
                        icon={<UserSwitchOutlined />}
                        onClick={fetchUsers}
                    >
                        刷新列表
                    </Button>
                </Space>
            </div>
            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条记录`,
                    pageSizeOptions: ['10', '20', '50'],
                }}
                onChange={handleTableChange}
            />

            <Modal
                title="重置用户密码"
                open={resetPasswordModal.visible}
                onCancel={() => {
                    setResetPasswordModal({ visible: false, userId: null });
                    resetPasswordForm.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={resetPasswordForm}
                    onFinish={handleResetPassword}
                    layout="vertical"
                >
                    <Form.Item
                        name="newPassword"
                        label="新密码"
                        rules={[
                            { required: true, message: '请输入新密码' },
                            { min: 8, message: '密码长度至少8位' }
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        label="确认密码"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: '请确认新密码' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('两次输入的密码不一致'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item className="mb-0 text-right">
                        <Space>
                            <Button onClick={() => {
                                setResetPasswordModal({ visible: false, userId: null });
                                resetPasswordForm.resetFields();
                            }}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit">
                                确认重置
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default UserManagement;