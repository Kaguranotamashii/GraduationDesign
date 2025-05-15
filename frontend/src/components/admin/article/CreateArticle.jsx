import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, Card, Space, Tag, Upload } from 'antd';
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import { useNavigate } from 'react-router-dom';
import { getAllModels, getBuildingTags } from '@/api/builderApi';
import { createArticle, saveDraft, uploadImage } from '@/api/articleApi';

const { Dragger } = Upload;

const CreateArticle = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [builders, setBuilders] = useState([]);
    const [tags, setTags] = useState([]);
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [existingTags, setExistingTags] = useState([]);
    const [coverFile, setCoverFile] = useState(null);
    const [content, setContent] = useState('');
    const navigate = useNavigate();

    // 获取建筑列表和标签
    useEffect(() => {
        const fetchData = async () => {
            try {
                const buildersResponse = await getAllModels();
                console.log('获取建筑数据成功:', buildersResponse.data);
                if (buildersResponse.code === 200) {
                    setBuilders(buildersResponse.data);
                }

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

    // 提交文章
    const handleSubmit = async (values, status) => {
        if (!content.trim()) {
            message.error('请输入文章内容');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', values.title.trim());
            formData.append('content', content.trim());
            if (coverFile) {
                if (!coverFile.type.startsWith('image/')) {
                    throw new Error('封面图片必须是图片格式（jpg、png等）');
                }
                formData.append('cover_image_file', coverFile);
            }

            // 设置状态（普通用户：draft 或 reviewing）
            formData.append('status', status);

            // 处理 builder，确保是整数
            if (values.builder) {
                const builderId = parseInt(values.builder, 10);
                if (isNaN(builderId)) {
                    throw new Error('关联建筑 ID 无效');
                }
                formData.append('builder', builderId);
            }

            // 处理 tags
            if (tags.length > 0) {
                formData.append('tags', tags.map((tag) => tag.trim()).join(','));
            }

            // 调试 FormData
            console.log('提交的 FormData:', {
                title: formData.get('title'),
                status: formData.get('status'),
                builder: formData.get('builder'),
                tags: formData.get('tags'),
                hasCover: !!formData.get('cover_image_file'),
            });

            // 选择接口
            const response = await (status === 'draft' ? saveDraft(formData) : createArticle(formData));

            if (response.code === 200) {
                message.success(status === 'draft' ? '草稿保存成功！' : '文章提交审核成功！');
                navigate('/admin/articles'); // 跳转到用户文章列表
            } else {
                throw new Error(response.message || '请求失败');
            }
        } catch (error) {
            console.error('保存文章失败:', error);
            let errorMsg = '保存失败：';
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                if (errors.status) {
                    errorMsg += `状态无效：${errors.status}`;
                } else if (errors.title) {
                    errorMsg += `标题错误：${errors.title}`;
                } else if (errors.builder) {
                    errorMsg += `建筑错误：${errors.builder}`;
                } else {
                    errorMsg += Object.values(errors).flat().join('；');
                }
            } else {
                errorMsg += error.message || '未知错误';
            }
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // 保存草稿
    const handleDraftClick = () => {
        form
            .validateFields()
            .then((values) => {
                handleSubmit(values, 'draft');
            })
            .catch((err) => {
                console.error('表单验证失败:', err);
                message.error('请检查表单字段');
            });
    };

    // 提交审核
    const handleSubmitForReviewClick = () => {
        form
            .validateFields()
            .then((values) => {
                handleSubmit(values, 'reviewing');
            })
            .catch((err) => {
                console.error('表单验证失败:', err);
                message.error('请检查表单字段');
            });
    };

    // 封面上传配置
    const uploadProps = {
        accept: 'image/*',
        multiple: false,
        showUploadList: true,
        maxCount: 1,
        beforeUpload: (file) => {
            if (!file.type.startsWith('image/')) {
                message.error('只能上传图片文件（jpg、png等）');
                return Upload.LIST_IGNORE;
            }
            setCoverFile(file);
            return false;
        },
        onRemove: () => {
            setCoverFile(null);
        },
    };

    // 标签相关处理
    const handleClose = (removedTag) => {
        const newTags = tags.filter((tag) => tag !== removedTag);
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
            setTags([...tags, inputValue.trim()]);
        }
        setInputVisible(false);
        setInputValue('');
    };

    const handleSelectTag = (tag) => {
        if (!tags.includes(tag)) {
            setTags([...tags, tag.trim()]);
        }
    };

    // 处理图片上传
    const handleImageUpload = async (file) => {
        try {
            if (!file.type.startsWith('image/')) {
                throw new Error('只能上传图片文件');
            }
            const formData = new FormData();
            formData.append('image', file);
            formData.append('folder', 'articles/content');

            const response = await uploadImage(formData);
            if (response.code === 200) {
                return response.data.url;
            } else {
                throw new Error(response.message || '图片上传失败');
            }
        } catch (error) {
            console.error('上传图片失败:', error);
            message.error('上传图片失败：' + (error.message || '未知错误'));
            return null;
        }
    };

    // 处理粘贴图片
    const handlePaste = async (event) => {
        const items = event.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    try {
                        const url = await handleImageUpload(file);
                        if (url) {
                            const imageMarkdown = `![image](${url})\n`;
                            setContent((prev) => {
                                const textarea = document.querySelector('.w-md-editor-text-input');
                                if (textarea) {
                                    const start = textarea.selectionStart;
                                    const end = textarea.selectionEnd;
                                    return prev.substring(0, start) + imageMarkdown + prev.substring(end);
                                }
                                return prev + imageMarkdown;
                            });
                        }
                    } catch (error) {
                        console.error('粘贴图片处理失败:', error);
                        message.error('粘贴图片处理失败');
                    }
                }
                break;
            }
        }
    };

    // 处理拖放图片
    const handleDrop = async (event) => {
        event.preventDefault();
        const files = event.dataTransfer?.files;
        if (!files) return;

        for (let i = 0; i < files.length; i++) {
            if (files[i].type.indexOf('image') !== -1) {
                try {
                    const url = await handleImageUpload(files[i]);
                    if (url) {
                        const imageMarkdown = `![image](${url})\n`;
                        setContent((prev) => prev + imageMarkdown);
                    }
                } catch (error) {
                    console.error('拖放图片处理失败:', error);
                    message.error('拖放图片处理失败');
                }
            }
        }
    };

    return (
        <Card title="创建文章" className="shadow-sm">
            <Form
                form={form}
                layout="vertical"
                className="max-w-4xl"
            >
                <Form.Item
                    name="title"
                    label="文章标题"
                    rules={[{ required: true, message: '请输入文章标题' }, { max: 200, message: '标题不能超过200个字符' }]}
                >
                    <Input placeholder="请输入文章标题" />
                </Form.Item>

                <Form.Item
                    label="封面图片"
                    tooltip="支持jpg、png格式的图片"
                >
                    <Dragger {...uploadProps}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
                        <p className="ant-upload-hint">建议尺寸: 1200 x 675 像素</p>
                    </Dragger>
                </Form.Item>

                <Form.Item
                    name="builder"
                    label="关联建筑"
                    rules={[{ type: 'number', message: '请选择有效的建筑' }]}
                >
                    <Select
                        placeholder="请选择关联建筑（可选）"
                        showSearch
                        allowClear
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {builders.map((builder) => (
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
                                <Tag key={tag} className="cursor-pointer" onClick={() => handleSelectTag(tag)}>
                                    {tag}
                                </Tag>
                            ))}
                        </Space>
                    </div>
                    <div>
                        <span className="text-gray-600 text-sm mb-2 block">已选标签:</span>
                        <Space size={[0, 8]} wrap>
                            {tags.map((tag) => (
                                <Tag key={tag} closable onClose={() => handleClose(tag)}>
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
                                <Tag onClick={showInput} className="cursor-pointer hover:bg-gray-100">
                                    <PlusOutlined /> 新标签
                                </Tag>
                            )}
                        </Space>
                    </div>
                </Form.Item>

                <Form.Item
                    label="文章内容"
                    required
                    rules={[{ validator: () => (content.trim() ? Promise.resolve() : Promise.reject('请输入文章内容')) }]}
                >
                    <MDEditor
                        value={content}
                        onChange={setContent}
                        height={400}
                        className="mb-12"
                        preview="live"
                        onPaste={handlePaste}
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        previewOptions={{
                            rehypePlugins: [[rehypeSanitize]],
                        }}
                        data-color-mode="light"
                    />
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button type="primary" onClick={handleDraftClick} loading={loading}>
                            保存为草稿
                        </Button>
                        <Button type="primary" onClick={handleSubmitForReviewClick} loading={loading}>
                            提交审核
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default CreateArticle;