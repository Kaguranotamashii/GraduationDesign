import React, { useState, useEffect } from 'react';
import { Card, Avatar, Button, Form, Input, Upload, message, Spin, Tabs, Typography, Divider } from 'antd';
import {
    UserOutlined,
    EditOutlined,
    UploadOutlined,
    MailOutlined,
    IdcardOutlined,
    ClockCircleOutlined,
    SaveOutlined,
    CloseOutlined
} from '@ant-design/icons';
import { getUserInfo, uploadAvatar, updateUserProfile } from '../../../api/userApi';

const { Title, Text } = Typography;
const { TextArea } = Input;

const UserProfile = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const response = await getUserInfo();
            console.log('获取用户信息成功:', response.data)
            if (response.code === 200) {
                setUserInfo(response.data);
                form.setFieldsValue({
                    username: response.data.username,
                    email: response.data.email,
                    signature: response.data.signature
                });
            }
        } catch (error) {
            console.error('获取用户信息失败:', error);
            message.error('获取用户信息失败');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (file) => {
        try {
            setAvatarLoading(true);
            const response = await uploadAvatar(file);
            if (response.code === 200) {
                message.success('头像上传成功');
                fetchUserInfo(); // 刷新用户信息
            }
        } catch (error) {
            message.error('头像上传失败');
        } finally {
            setAvatarLoading(false);
        }
        return false; // 阻止自动上传
    };

    const handleSave = async (values) => {
        try {
            const response = await updateUserProfile(values);
            if (response.code === 200) {
                message.success('个人信息更新成功');
                setIsEditing(false);
                fetchUserInfo(); // 刷新用户信息
            }
        } catch (error) {
            message.error('更新失败');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <Card
                bordered={false}
                className="shadow-md"
                title={
                    <div className="flex items-center justify-between">
                        <Title level={4} className="mb-0">个人信息</Title>
                        {!isEditing && (
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => setIsEditing(true)}
                            >
                                编辑资料
                            </Button>
                        )}
                    </div>
                }
            >
                <div className="flex flex-col md:flex-row md:space-x-8">
                    {/* 左侧头像区域 */}
                    <div className="flex flex-col items-center space-y-4 mb-8 md:mb-0">
                        <div className="relative group">
                            <Avatar
                                size={160}
                                src={userInfo?.avatar}
                                icon={<UserOutlined />}
                                className="border-4 border-white shadow-lg"
                            />
                            {isEditing && (
                                <Upload
                                    accept="image/*"
                                    showUploadList={false}
                                    beforeUpload={handleUpload}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                        <Button
                                            type="text"
                                            icon={<UploadOutlined />}
                                            className="text-white"
                                            loading={avatarLoading}
                                        >
                                            更换头像
                                        </Button>
                                    </div>
                                </Upload>
                            )}
                        </div>
                        <Title level={4} className="mb-0 text-center">
                            {userInfo?.username}
                        </Title>
                        <Text type="secondary" className="text-center">
                            {userInfo?.is_staff ? '管理员' : '普通用户'}
                        </Text>
                    </div>

                    {/* 右侧信息区域 */}
                    <div className="flex-1">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSave}
                            initialValues={userInfo}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Form.Item
                                    label={
                                        <span className="flex items-center">
                                            <UserOutlined className="mr-2" />
                                            用户名
                                        </span>
                                    }
                                    name="username"
                                >
                                    <Input disabled className="bg-gray-50" />
                                </Form.Item>

                                <Form.Item
                                    label={
                                        <span className="flex items-center">
                                            <MailOutlined className="mr-2" />
                                            邮箱
                                        </span>
                                    }
                                    name="email"
                                >
                                    <Input disabled className="bg-gray-50" />
                                </Form.Item>
                            </div>

                            <Form.Item
                                label={
                                    <span className="flex items-center">
                                        <IdcardOutlined className="mr-2" />
                                        个性签名
                                    </span>
                                }
                                name="signature"
                            >
                                <TextArea
                                    disabled={!isEditing}
                                    rows={4}
                                    placeholder="写点什么介绍一下自己吧..."
                                    className={!isEditing ? 'bg-gray-50' : ''}
                                />
                            </Form.Item>

                            {isEditing && (
                                <Form.Item className="mb-0">
                                    <div className="flex justify-end space-x-4">
                                        <Button
                                            onClick={() => setIsEditing(false)}
                                            icon={<CloseOutlined />}
                                        >
                                            取消
                                        </Button>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            icon={<SaveOutlined />}
                                        >
                                            保存更改
                                        </Button>
                                    </div>
                                </Form.Item>
                            )}
                        </Form>

                        {!isEditing && (
                            <>
                                <Divider />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2 text-gray-500">
                                        <ClockCircleOutlined />
                                        <Text type="secondary">注册时间：{userInfo?.register_time}</Text>
                                    </div>
                                    <div className="flex items-center space-x-2 text-gray-500">
                                        <ClockCircleOutlined />
                                        <Text type="secondary">最后登录：{userInfo?.last_login || '暂无记录'}</Text>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default UserProfile;