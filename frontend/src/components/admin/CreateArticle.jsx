import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, Card, Space, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import { getAllModels, getBuildingTags } from '../../api/builderApi';
import apiClient from '../../utils/apiClient';

const { TextArea } = Input;

const CreateArticle = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [builders, setBuilders] = useState([]);
    const [tags, setTags] = useState([]);
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [existingTags, setExistingTags] = useState([]);
    const navigate = useNavigate();

    // 获取建筑列表和标签
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 获取建筑列表
                const buildersResponse = await getAllModels();
                if (buildersResponse.code === 200) {
                    setBuilders(buildersResponse.data);
                }

                // 获取已有标签
                const tagsResponse = await getBuildingTags();
                if (tagsResponse.code === 200) {
                    setExistingTags(tagsResponse.data);
                }
            } catch (error) {
                console.error('获取数据失败:', error);
                message.error('获取数据失败');
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const articleData = {
                ...values,
                tags: tags.join(','),
            };

            const response = await apiClient.post('/articles/', articleData);

            if (response.data.code === 200) {
                message.success('文章创建成功！');
                navigate('/admin/my-articles');
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('创建文章失败:', error);
            message.error('创建文章失败：' + (error.message || '未知错误'));
        } finally {
            setLoading(false);
        }
    };

    // 标签相关处理
    const handleClose = (removedTag) => {
        const newTags = tags.filter(tag => tag !== removedTag);
        setTags(newTags);
    };

    const showInput = () => {
        setInputVisible(true);
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleInputConfirm = () => {
        if (inputValue && !tags.includes(inputValue)) {
            setTags([...tags, inputValue]);
        }
        setInputVisible(false);
        setInputValue('');
    };

    const handleSelectTag = (tag) => {
        if (!tags.includes(tag)) {
            setTags([...tags, tag]);
        }
    };

    return (
        <Card title="发布新文章" className="shadow-sm">
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="max-w-4xl"
            >
                <Form.Item
                    name="title"
                    label="文章标题"
                    rules={[{ required: true, message: '请输入文章标题' }]}
                >
                    <Input placeholder="请输入文章标题" />
                </Form.Item>

                <Form.Item
                    name="builder"
                    label="关联建筑"
                    rules={[{ required: true, message: '请选择关联建筑' }]}
                >
                    <Select
                        placeholder="请选择关联建筑"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {builders.map(builder => (
                            <Select.Option key={builder.id} value={builder.id}>
                                {builder.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label="文章标签">
                    <div className="mb-3">
                        <span className="text-gray-600 text-sm mb-2 block">已有标签:</span>
                        <Space size={[0, 8]} wrap>
                            {existingTags.map((tag) => (
                                <Tag
                                    key={tag}
                                    className="cursor-pointer"
                                    onClick={() => handleSelectTag(tag)}
                                >
                                    {tag}
                                </Tag>
                            ))}
                        </Space>
                    </div>
                    <div>
                        <span className="text-gray-600 text-sm mb-2 block">已选标签:</span>
                        <Space size={[0, 8]} wrap>
                            {tags.map((tag) => (
                                <Tag
                                    key={tag}
                                    closable
                                    onClose={() => handleClose(tag)}
                                >
                                    {tag}
                                </Tag>
                            ))}
                            {inputVisible ? (
                                <Input
                                    type="text"
                                    size="small"
                                    className="w-20"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    onBlur={handleInputConfirm}
                                    onPressEnter={handleInputConfirm}
                                    autoFocus
                                />
                            ) : (
                                <Tag
                                    onClick={showInput}
                                    className="cursor-pointer hover:bg-gray-100"
                                >
                                    <PlusOutlined /> 新标签
                                </Tag>
                            )}
                        </Space>
                    </div>
                </Form.Item>

                <Form.Item
                    name="content"
                    label="文章内容"
                    rules={[{ required: true, message: '请输入文章内容' }]}
                >
                    <ReactQuill
                        theme="snow"
                        className="h-72 mb-12"
                    />
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => {
                                form.setFieldsValue({ status: 'draft' });
                                form.submit();
                            }}
                            loading={loading}
                        >
                            保存为草稿
                        </Button>
                        <Button
                            onClick={() => {
                                form.setFieldsValue({ status: 'published' });
                                form.submit();
                            }}
                            loading={loading}
                        >
                            直接发布
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default CreateArticle;