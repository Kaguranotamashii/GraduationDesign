import { useState, useEffect } from 'react';
import {
    Drawer,
    Form,
    Input,
    Button,
    Upload,
    Space,
    message,
    Tag,
    Select,
    Spin
} from 'antd';
import {
    UploadOutlined,
    EnvironmentOutlined,
    PlusOutlined
} from '@ant-design/icons';

import {
    addModels,
    getBuildingCategories,
    getBuildingTags
} from '../../api/builderApi';

const { TextArea } = Input;

const AddHeritageSiteForm = ({
                                 visible,
                                 onClose,
                                 isSelectingLocation,
                                 setIsSelectingLocation,
                                 selectedLocation,
                                 setSelectedLocation
                             }) => {
    const [form] = Form.useForm();
    const [uploading, setUploading] = useState(false);
    const [tags, setTags] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesData, tagsData] = await Promise.all([
                    getBuildingCategories(),
                    getBuildingTags()
                ]);

                // 处理分类数据
                const formattedCategories = Array.isArray(categoriesData)
                    ? categoriesData.map(cat => {
                        if (typeof cat === 'string') {
                            return {
                                value: cat,
                                label: cat
                            };
                        }
                        return {
                            value: cat.id || cat.name,
                            label: cat.name
                        };
                    })
                    : [];
                setCategories(formattedCategories);

                // 处理后端返回的标签数据
                let initialTags = [];
                if (typeof tagsData === 'string') {
                    // 如果是字符串，按逗号分割
                    initialTags = tagsData.split(',').map(tag => tag.trim());
                } else if (Array.isArray(tagsData)) {
                    initialTags = tagsData;
                }
                setTags(initialTags);

                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch form data:', error);
                message.error('加载数据失败，请刷新重试');
                setLoading(false);
            }
        };

        if (visible) {
            fetchData();
        }
    }, [visible]);

    const handleSubmit = async (values) => {
        if (!selectedLocation) {
            message.error('请在地图上选择位置');
            return;
        }

        if (!values.image?.fileList?.[0]) {
            message.error('请上传建筑物照片');
            return;
        }

        if (!values.category) {
            message.error('请选择建筑物分类');
            return;
        }

        setUploading(true);
        try {
            const modelData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (value) {
                    if (key === 'image' || key === 'model') {
                        if (value.fileList?.length > 0) {
                            modelData.append(key, value.fileList[0].originFileObj);
                        }
                    } else {
                        modelData.append(key, value);
                    }
                }
            });

            modelData.append('address', JSON.stringify(selectedLocation));
            // 直接使用标签数组，因为后端已经处理好了格式
            modelData.append('tags', tags);

            await addModels(modelData);
            message.success('添加成功！');
            form.resetFields();
            setSelectedLocation(null);
            setTags([]);
            onClose();
        } catch (error) {
            console.error('添加失败:', error);
            message.error('添加失败，请重试');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Drawer
            z-index={101231312312300}
            title="添加建筑遗产"
            placement="right"
            width={800}
            onClose={onClose}
            open={visible}
            mask={true}
            extra={
                <Space>
                    <Button onClick={onClose}>取消</Button>
                    <Button
                        type="primary"
                        onClick={() => form.submit()}
                        loading={uploading}
                    >
                        提交
                    </Button>
                </Space>
            }
            styles={{
                body: {
                    overflow: 'auto',
                    height: 'calc(100vh - 108px)',
                    paddingBottom: '108px'
                },
                mask: {
                    background: 'rgba(0, 0, 0, 0.3)'
                }
            }}
        >
            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '40vh' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="名称"
                        rules={[{ required: true, message: '请输入建筑物名称' }]}
                    >
                        <Input placeholder="请输入建筑物名称" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="建筑物描述"
                        rules={[{ required: true, message: '请输入建筑物描述' }]}
                    >
                        <TextArea rows={4} placeholder="请详细描述建筑物的特点、历史、文化价值等" />
                    </Form.Item>

                    <Form.Item
                        label="位置"
                        required
                        help="请在地图上选择建筑物的具体位置"
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {selectedLocation ? (
                                <div>
                                    已选择位置：[{selectedLocation[0].toFixed(5)}, {selectedLocation[1].toFixed(5)}]
                                </div>
                            ) : (
                                <div className="text-red-500">* 未选择位置</div>
                            )}
                            <Button
                                icon={<EnvironmentOutlined />}
                                onClick={() => setIsSelectingLocation(true)}
                                type={isSelectingLocation ? 'primary' : 'default'}
                            >
                                {isSelectingLocation ? '正在选择位置...' : '选择位置'}
                            </Button>
                        </Space>
                    </Form.Item>

                    <Form.Item
                        name="category"
                        label="分类"
                        rules={[{ required: true, message: '请选择建筑物分类' }]}
                    >
                        <Select
                            placeholder="请选择建筑物分类"
                            options={categories}
                            showSearch
                            allowClear
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            // 添加以下属性来支持创建新选项
                            mode="tags"
                            onSelect={(value) => {
                                // 如果选择的值不在现有选项中，添加到categories
                                if (!categories.find(cat => cat.value === value)) {
                                    setCategories([...categories, { value, label: value }]);
                                }
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="标签"
                        required
                        help="输入标签后按回车添加"
                    >
                        <Select
                            mode="tags"
                            style={{ width: '100%' }}
                            placeholder="请输入标签"
                            onChange={setTags}
                            value={tags}
                            open={false}
                            tokenSeparators={[',']}
                        />
                    </Form.Item>

                    <Form.Item
                        name="image"
                        label="建筑物照片"
                        required
                        rules={[{ required: true, message: '请上传建筑物照片' }]}
                    >
                        <Upload
                            maxCount={1}
                            beforeUpload={() => false}
                            accept="image/*"
                            listType="picture-card"
                        >
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>上传照片</div>
                            </div>
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        name="model"
                        label="3D模型文件"
                        help="支持.obj、.fbx、.glb格式"
                    >
                        <Upload
                            maxCount={1}
                            beforeUpload={() => false}
                            accept=".obj,.fbx,.glb"
                        >
                            <Button icon={<UploadOutlined />}>选择模型文件</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        name="json"
                        label="JSON 描述"
                    >
                        <TextArea rows={4} placeholder="请输入建筑物的JSON格式描述（可选）" />
                    </Form.Item>
                </Form>
            )}
        </Drawer>
    );
};

export default AddHeritageSiteForm;