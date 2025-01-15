
import React, { useState, useEffect } from 'react';
import { message, Input, Button, Form, Upload, Image } from 'antd'; // 引入 Ant Design 的组件
import { getUserList, addRandomUser, loginUser, registerUser, logoutUser, uploadImage } from '../api/user'; // 引入用户相关的 API

const AuthTest = () => {
    const [users, setUsers] = useState([]); // 用户列表
    const [loading, setLoading] = useState(false); // 加载状态
    const [isLoggedIn, setIsLoggedIn] = useState(false); // 登录状态
    const [currentUsername, setCurrentUsername] = useState(null); // 当前登录用户名
    const [currentAvatar, setCurrentAvatar] = useState(null); // 当前登录用户的头像

    const [loginForm] = Form.useForm();
    const [registerForm] = Form.useForm();
    const [uploadForm] = Form.useForm();

    // 检查是否已经登录
    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedAccessToken = localStorage.getItem('access_token');

        console.log('localStorage:', storedUsername, storedAccessToken);
        if (storedUsername && storedAccessToken) {
            setIsLoggedIn(true);
            setCurrentUsername(storedUsername);
        }
    }, []);

    // 登录用户
    const handleLogin = async (values) => {
        try {
            setLoading(true);
            const response = await loginUser(values);
            console.log('登录成功:', response.data);

            const { username, access , avatar} = response.data;

            // 保存登录信息到 localStorage
            localStorage.setItem('username', username);
            localStorage.setItem('access_token', access);
            localStorage.setItem('avatar_url',avatar)

            // 更新状态
            setIsLoggedIn(true);
            setCurrentUsername(username);

            console.log('登录成功:', response);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    // 注册用户
    const handleRegister = async (values) => {
        try {
            setLoading(true);
            const response = await registerUser(values);
            // message.success('注册成功');
            console.log('注册成功:', response);
        } catch (error) {
            // message.error('注册失败: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // 登出用户
    const handleLogout = async () => {
        try {
            setLoading(true);
            const response = await logoutUser();

            // 清除 localStorage 和状态
            localStorage.removeItem('username');
            localStorage.removeItem('access_token');
            setIsLoggedIn(false);
            setCurrentUsername(null);
            setCurrentAvatar(null);

            // message.success('登出成功');
            console.log('登出成功:', response);
        } catch (error) {
            // message.error('登出失败: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // 上传头像
    const handleUploadAvatar = async (info) => {
        // debugger
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }

        if (1) {
            const formData = new FormData();
            formData.append('avatar', info.file.originFileObj);

            try {
                const response = await uploadImage(formData);
                // message.success('头像上传成功');
                setCurrentAvatar(response.data.avatar); // 更新头像 URL
            } catch (error) {
                // message.error('头像上传失败: ' + error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div>
            <h1>用户管理测试</h1>

            {/* 显示登录状态 */}
            {isLoggedIn ? (
                <p>当前登录用户：<strong>{currentUsername}</strong></p>
            ) : (
                <p>用户未登录</p>
            )}

            {/* 显示头像 */}
            {isLoggedIn && currentAvatar && (
                <div>
                    <h2>头像</h2>
                    <Image src={currentAvatar} alt="Avatar" width={100} />
                </div>
            )}

            {/* 登录表单 */}
            {!isLoggedIn && (
                <Form form={loginForm} onFinish={handleLogin} layout="inline">
                    <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            )}

            {/* 注册表单 */}
            {!isLoggedIn && (
                <Form form={registerForm} onFinish={handleRegister} layout="inline">
                    <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            注册
                        </Button>
                    </Form.Item>
                </Form>
            )}

            {/* 上传头像表单 */}
            {isLoggedIn && (
                <Form form={uploadForm} layout="inline">
                    <Form.Item name="avatar" label="头像">
                        <Upload
                            name="avatar"
                            beforeUpload={() => true} // 禁用默认上传行为
                            customRequest={handleUploadAvatar}
                            showUploadList={false}
                        >
                            <Button loading={loading}>上传头像</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            )}

            {/* 登出按钮 */}
            {isLoggedIn && (
                <Button onClick={handleLogout} loading={loading}>
                    登出
                </Button>
            )}
        </div>
    );
};

export default AuthTest;