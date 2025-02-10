import React, { useState } from 'react';
import { Form, Input, Button, message, Tabs } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setToken, setUser, clearAuth } from '../../store/authSlice';
import { registerUser, sendVerificationEmail, loginUser } from '../../api/userApi';

const { TabPane } = Tabs;

const AuthPage = () => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 发送验证码
  const handleSendCode = async () => {
    const email = form.getFieldValue('email');
    if (!email) {
      message.error('请输入邮箱');
      return;
    }

    try {
      setLoading(true);
      await sendVerificationEmail({ email });
      message.success('验证码已发送');
      setEmailSent(true);
      startCountdown();
    } catch (error) {
      message.error('发送验证码失败');
    } finally {
      setLoading(false);
    }
  };

  // 开始倒计时
  const startCountdown = () => {
    let time = 60;
    setCountdown(time);
    const timer = setInterval(() => {
      time -= 1;
      setCountdown(time);
      if (time === 0) {
        clearInterval(timer);
        setEmailSent(false);
      }
    }, 1000);
  };

  // 处理登录
  const handleLogin = async (values) => {
    try {
      setLoading(true);
      const response = await loginUser(values);
      dispatch(setToken(response.access_token));
      console.log('登录成功:', response.user)
      dispatch(setUser(response.user));
      message.success('登录成功');
      navigate('/');
    } catch (error) {
      message.error('登录失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理注册
  const handleRegister = async (values) => {
    try {
      setLoading(true);
      await registerUser(values);
      message.success('注册成功');
      setActiveTab('login');
    } catch (error) {
      message.error('注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
            <TabPane tab="登录" key="login">
              <Form onFinish={handleLogin}>
                <Form.Item
                    name="identifier"
                    rules={[{ required: true, message: '请输入用户名或邮箱' }]}
                >
                  <Input
                      prefix={<UserOutlined />}
                      placeholder="用户名/邮箱"
                  />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="密码"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                      type="primary"
                      htmlType="submit"
                      block
                      loading={loading}
                  >
                    登录
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane tab="注册" key="register">
              <Form form={form} onFinish={handleRegister}>
                <Form.Item
                    name="username"
                    rules={[
                      { required: true, message: '请输入用户名' },
                      { min: 4, message: '用户名至少4个字符' },
                    ]}
                >
                  <Input
                      prefix={<UserOutlined />}
                      placeholder="用户名"
                  />
                </Form.Item>

                <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: '请输入邮箱' },
                      { type: 'email', message: '邮箱格式不正确' },
                    ]}
                >
                  <Input
                      prefix={<MailOutlined />}
                      placeholder="邮箱"
                  />
                </Form.Item>

                <Form.Item
                    name="code"
                    rules={[{ required: true, message: '请输入验证码' }]}
                >
                  <Input
                      prefix={<SafetyOutlined />}
                      placeholder="验证码"
                      suffix={
                        <Button
                            type="link"
                            onClick={handleSendCode}
                            disabled={emailSent || countdown > 0}
                        >
                          {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
                        </Button>
                      }
                  />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: '请输入密码' },
                      { min: 8, message: '密码至少8位' },
                    ]}
                >
                  <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="密码"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                      type="primary"
                      htmlType="submit"
                      block
                      loading={loading}
                  >
                    注册
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </div>
      </div>
  );
};

export default AuthPage;