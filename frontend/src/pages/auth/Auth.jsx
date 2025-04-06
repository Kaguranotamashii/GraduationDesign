import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Modal, message, Spin } from 'antd'; // Import Spin for a more prominent loading indicator
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '../../store/authSlice';
import {loginUser, registerUser, sendVerificationEmail} from "../../api/userApi";
import { useNavigate, useLocation } from 'react-router-dom';

const Auth = () => {
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [registerModalOpen, setRegisterModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation();

    const startCountdown = () => {
        setCountdown(60);
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSendCode = async () => {
        try {
            const email = form.getFieldValue('email');
            if (!email) {
                message.error('请输入邮箱');
                return;
            }
            setSendingCode(true);
            await sendVerificationEmail({ email });
            message.success('验证码已发送');
            startCountdown();
        } catch (error) {
            message.error('发送验证码失败');
        } finally {
            setSendingCode(false);
        }
    };

    const handleLogin = async (values) => {
        try {
            setLoading(true);
            const response = await loginUser({
                identifier: values.username,
                password: values.password,
            });
            if (response.code === 200) {
                dispatch(setToken(response.data.access_token));
                dispatch(setUser(response.data.user));
                message.success('登录成功');
                setLoginModalOpen(false);
                // Introduce a small delay before navigation to allow modal to fully close
                setTimeout(() => {
                    if (window.history.length > 1 && location.pathname === '/auth') {
                        navigate(-1);
                    } else if (location.pathname === '/auth') {
                        navigate('/'); // Or your default dashboard route
                    }
                }, 300); // Adjust the delay as needed (milliseconds)
            } else {
                message.error('登录失败'); // Ensure an error message is shown for non-200 responses
            }
        } catch (error) {
            message.error('登录失败');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (values) => {
        try {
            setLoading(true);
            const response = await registerUser({
                username: values.username,
                password: values.password,
                email: values.email,
                code: values.verificationCode,
            });
            if (response.code === 200) {
                message.success('注册成功');
                setRegisterModalOpen(false);
                setLoginModalOpen(true);
            }
        } catch (error) {
            message.error('注册失败');
        } finally {
            setLoading(false);
        }
    };

    const LoginModal = () => (
        <Modal
            open={loginModalOpen}
            onCancel={() => setLoginModalOpen(false)}
            footer={null}
            width={600}
            centered
        >
            <div className="p-8">
                <div className="flex justify-center mb-6">
                    <img src="/logo.png" alt="Logo" className="h-8" />
                </div>
                <h2 className="text-3xl font-bold mb-8">登录筑境云枢</h2>

                <button
                    className="w-full mb-4 flex items-center justify-center gap-2 py-2.5 px-4 border rounded-full hover:bg-gray-50 transition"
                    onClick={() => message.info('Google登录功能开发中')}
                >
                    <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" className="w-5 h-5" alt="Google" />
                    使用 Google 账号登录
                </button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">或</span>
                    </div>
                </div>

                <Form
                    form={form}
                    onFinish={handleLogin}
                    layout="vertical"
                    initialValues={{
                        username: 'root',
                        password: '12345678',
                    }}
                >
                    <Form.Item
                        name="username"
                        rules={[
                            { required: true, message: '请输入用户名' },
                            { min: 4, message: '用户名至少4个字符' }
                        ]}
                    >
                        <Input
                            placeholder="用户名"
                            size="large"
                            className="rounded-md"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: '请输入密码' },
                            { min: 8, message: '密码至少8个字符' }
                        ]}
                    >
                        <Input.Password
                            placeholder="密码"
                            size="large"
                            className="rounded-md"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            className="w-full h-10 rounded-full bg-black hover:bg-gray-800"
                        >
                            {loading ? <Spin size="small" /> : '登录'} {/* Display a Spin component when loading */}
                        </Button>
                    </Form.Item>
                </Form>

                <p className="mt-4 text-center">
                    还没有账号？{' '}
                    <button
                        onClick={() => {
                            setLoginModalOpen(false);
                            setRegisterModalOpen(true);
                        }}
                        className="text-blue-500 hover:underline"
                    >
                        立即注册
                    </button>
                </p>
            </div>
        </Modal>
    );

    const RegisterModal = () => (
        <Modal
            open={registerModalOpen}
            onCancel={() => setRegisterModalOpen(false)}
            footer={null}
            width={600}
            centered
        >
            {/* ... RegisterModal content remains the same ... */}
            <div className="p-8">
                <div className="flex justify-center mb-6">
                    <img src="/logo.png" alt="Logo" className="h-8" />
                </div>
                <h2 className="text-3xl font-bold mb-8">创建你的账号</h2>

                <button
                    className="w-full mb-4 flex items-center justify-center gap-2 py-2.5 px-4 border rounded-full hover:bg-gray-50 transition"
                    onClick={() => message.info('Google注册功能开发中')}
                >
                    <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" className="w-5 h-5" alt="Google" />
                    使用 Google 账号注册
                </button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">或</span>
                    </div>
                </div>

                <Form
                    form={form}
                    onFinish={handleRegister}
                    layout="vertical"
                >
                    <Form.Item
                        name="username"
                        rules={[
                            { required: true, message: '请输入用户名' },
                            { min: 4, message: '用户名至少4个字符' }
                        ]}
                    >
                        <Input
                            placeholder="用户名"
                            size="large"
                            className="rounded-md"
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: '请输入邮箱' },
                            { type: 'email', message: '请输入有效的邮箱地址' }
                        ]}
                    >
                        <Input
                            placeholder="邮箱"
                            size="large"
                            className="rounded-md"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: '请输入密码' },
                            { min: 8, message: '密码至少8个字符' }
                        ]}
                    >
                        <Input.Password
                            placeholder="密码"
                            size="large"
                            className="rounded-md"
                        />
                    </Form.Item>

                    <Form.Item
                        name="verificationCode"
                        rules={[{ required: true, message: '请输入验证码' }]}
                    >
                        <div className="flex gap-2">
                            <Input
                                placeholder="验证码"
                                size="large"
                                className="rounded-md"
                            />
                            <Button
                                onClick={handleSendCode}
                                disabled={countdown > 0 || sendingCode}
                                size="large"
                            >
                                {sendingCode ? '发送中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
                            </Button>
                        </div>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            className="w-full h-10 rounded-full bg-black hover:bg-gray-800"
                        >
                            {loading ? <Spin size="small" /> : '注册'} {/* You might want a separate loading state for registration */}
                        </Button>
                    </Form.Item>
                </Form>

                <p className="mt-4 text-center">
                    已有账号？{' '}
                    <button
                        onClick={() => {
                            setRegisterModalOpen(false);
                            setLoginModalOpen(true);
                        }}
                        className="text-blue-500 hover:underline"
                    >
                        去登录
                    </button>
                </p>
            </div>
        </Modal>
    );

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex flex-1">
                {/* Left Logo Area */}
                <div className="flex items-center justify-center w-1/2 p-8">
                    <img src="/logo.png" alt="Logo" className="max-w-md w-full" />
                </div>

                {/* Right Content Area */}
                <div className="flex flex-col justify-center w-1/2 p-8">
                    <h1 className="text-6xl font-bold mb-12">正在发生</h1>
                    <h2 className="text-3xl font-bold mb-8">现在加入</h2>

                    <div className="space-y-4 max-w-sm">
                        <button
                            className="w-full flex items-center justify-center gap-2 py-2 px-4 border rounded-full hover:bg-gray-50 transition"
                            onClick={() => message.info('Google登录功能开发中')}
                        >
                            <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" className="w-5 h-5" alt="Google" />
                            使用 Google 账号注册
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">或</span>
                            </div>
                        </div>

                        <Button
                            type="primary"
                            className="w-full h-10 rounded-full bg-black hover:bg-gray-800"
                            onClick={() => setRegisterModalOpen(true)}
                        >
                            创建账号
                        </Button>

                        <p className="text-xs text-gray-500">
                            注册即表示同意我们的服务条款和隐私政策
                        </p>

                        <div className="mt-10">
                            <h3 className="font-bold mb-4">已有账号？</h3>
                            <Button
                                className="w-full h-10 rounded-full border-2 hover:bg-gray-50"
                                onClick={() => setLoginModalOpen(true)}
                            >
                                登录
                            </Button>
                        </div>
                    </div>
                </div>

                <LoginModal />
                <RegisterModal />
            </div>

            {/* Footer */}
            <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 px-4 py-3 text-sm text-gray-500">
                <a href="/about" className="hover:underline">关于</a>

                <span>© 2025 筑境云枢</span>
            </nav>
        </div>
    );
};

export default Auth;