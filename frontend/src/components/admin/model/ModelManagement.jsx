import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Button,
    Space,
    Modal,
    Form,
    Input,
    Upload,
    Select,
    message,
    Tag,
    Image,
    Tooltip,
    Popconfirm,
    DatePicker
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UploadOutlined,
    SearchOutlined,
    ReloadOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { MapContainer, TileLayer, useMapEvent, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

import {
    getAllModelsPaginated,
    addBuilder,
    getBuildingCategories,
    getBuildingTags,
    uploadBuildingModel,
    updateBuilderInfo,

} from '@/api/builderApi';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// 设置Leaflet默认图标
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

// 地图点击处理组件
function MapClickHandler({ onLocationSelect }) {
    useMapEvent('click', (e) => {
        const { lat, lng } = e.latlng;
        onLocationSelect([lat, lng]);
        message.success('位置选择成功！');
    });
    return null;
}

const BuilderManagement = () => {
    // 添加导航钩子
    const navigate = useNavigate();

    // 状态定义
    const [loading, setLoading] = useState(false);
    const [builders, setBuilders] = useState([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('add');
    const [currentBuilder, setCurrentBuilder] = useState(null);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [location, setLocation] = useState(null);

    // Form hooks
    const [form] = Form.useForm();
    const [searchForm] = Form.useForm();

    // 获取建筑列表
    const fetchBuilders = async (page = currentPage, size = pageSize, searchParams = {}) => {
        try {
            setLoading(true);
            const params = {
                page,
                page_size: size
            };

            // 只添加有值的搜索参数
            if (searchParams.search) params.search = searchParams.search;
            if (searchParams.category) params.category = searchParams.category;
            if (searchParams.tags?.length) params.tags = searchParams.tags;
            if (searchParams.date_range?.length) {
                params.date_range = searchParams.date_range.map(date =>
                    date ? date.format('YYYY-MM-DD') : ''
                ).filter(Boolean);
            }

            const response = await getAllModelsPaginated(params);
            if (response && response.results) {
                setBuilders(response.results);
                setTotal(response.count);
            } else {
                throw new Error('获取建筑列表失败');
            }
        } catch (error) {
            message.error(error.message || '获取建筑列表失败');
            setBuilders([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    // 获取分类和标签
    const fetchCategoriesAndTags = async () => {
        try {
            const [categoriesRes, tagsRes] = await Promise.all([
                getBuildingCategories(),
                getBuildingTags()
            ]);

            if (categoriesRes.code === 200) {
                setCategories(categoriesRes.data);
            }
            if (tagsRes.code === 200) {
                setTags(tagsRes.data);
            }
        } catch (error) {
            message.error('获取分类和标签失败');
        }
    };

    useEffect(() => {
        fetchBuilders();
        fetchCategoriesAndTags();
    }, []);

    // 处理搜索
    const handleSearch = async () => {
        try {
            const values = await searchForm.validateFields();
            setCurrentPage(1);
            fetchBuilders(1, pageSize, values);
        } catch (err) {
            console.error('Search form validation failed:', err);
        }
    };

    // 重置搜索
    const handleReset = () => {
        searchForm.resetFields();
        setCurrentPage(1);
        fetchBuilders(1, pageSize);
    };

    // 导航到模型编辑页面
    const handleNavigateToModelEdit = (builderId) => {
        navigate(`/modelEdit/${builderId}`);
    };

    // 编辑建筑
    const handleEdit = (record) => {
        setCurrentBuilder(record);
        setModalType('edit');
        try {
            const locationData = JSON.parse(record.address);
            setLocation(locationData);
        } catch (e) {
            setLocation([35.8617, 104.1954]); // 默认位置
        }

        // 设置表单初始值
        form.setFieldsValue({
            name: record.name,
            description: record.description,
            category: record.category,
            tags: record.tags_list || []
        });

        setModalVisible(true);
    };

    // 表单提交处理
    const handleSubmit = async (values) => {
        if (!location) {
            message.error('请选择位置');
            return;
        }

        try {
            const data = {
                ...values,
                address: JSON.stringify(location),
                tags: values.tags ? values.tags.join(',') : ''
            };

            let response;
            if (modalType === 'add') {
                // 处理添加
                const formData = new FormData();
                Object.keys(data).forEach(key => {
                    if (key === 'image' && values[key]) {
                        const file = values[key].fileList?.[0]?.originFileObj;
                        if (file) {
                            formData.append('image', file);
                        }
                    } else {
                        formData.append(key, data[key]);
                    }
                });
                response = await addBuilder(formData);
            } else {
                // 处理编辑
                response = await updateBuilderInfo(currentBuilder.id, data);
            }

            if (response.code === 200) {
                message.success(modalType === 'add' ? '添加成功' : '更新成功');
                setModalVisible(false);
                form.resetFields();
                setLocation(null);
                fetchBuilders();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            message.error(error.message || '操作失败');
        }
    };

    // 处理删除
    const handleDelete = async (id) => {
        try {
            const response = await deleteBuilderFile(id);
            if (response.code === 200) {
                message.success('删除成功');
                if (builders.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    fetchBuilders();
                }
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            message.error(error.message || '删除失败');
        }
    };

    // 处理分页变化
    const handleTableChange = (pagination, filters, sorter) => {
        setCurrentPage(pagination.current);
        setPageSize(pagination.pageSize);
        const searchValues = searchForm.getFieldsValue();
        fetchBuilders(pagination.current, pagination.pageSize, searchValues);
    };

    // 处理模型上传
    const handleModelUpload = async (builderId, file) => {
        try {
            const response = await uploadBuildingModel(builderId, file);
            if (response.code === 200) {
                message.success('模型文件上传成功');
                fetchBuilders(currentPage, pageSize); // 刷新列表
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            message.error(error.message || '模型文件上传失败');
        }
    };

    // 表格列配置
    const columns = [
        {
            title: '预览图',
            dataIndex: 'image_url',
            key: 'image_url',
            width: 100,
            render: (url) => (
                url ? (
                    <Image
                        src={url}
                        alt="预览图"
                        style={{ width: 50, height: 50, objectFit: 'cover' }}
                        fallback="/placeholder-image.png"
                    />
                ) : (
                    <div className="w-[50px] h-[50px] bg-gray-200 flex items-center justify-center text-gray-400">
                        暂无图片
                    </div>
                )
            )
        },
        {
            title: '建筑名称',
            dataIndex: 'name',
            key: 'name',
            width: 180,
            render: (text) => (
                <Tooltip title={text}>
                    <span className="truncate block max-w-[160px]">{text}</span>
                </Tooltip>
            )
        },
        {
            title: '分类',
            dataIndex: 'category',
            key: 'category',
            width: 120,
            render: (category) => (
                <Tag color="blue">{category}</Tag>
            )
        },
        {
            title: '位置',
            dataIndex: 'address',
            key: 'address',
            width: 200,
            render: (address) => {
                try {
                    const [lat, lng] = JSON.parse(address);
                    return `[${lat.toFixed(5)}, ${lng.toFixed(5)}]`;
                } catch {
                    return '位置无效';
                }
            }
        },
        {
            title: '标签',
            dataIndex: 'tags_list',
            key: 'tags',
            width: 200,
            render: (tags) => (
                <div className="flex flex-wrap gap-1">
                    {tags?.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                    ))}
                </div>
            )
        },
        {
            title: '模型状态',
            dataIndex: 'model_url',
            key: 'model_status',
            width: 120,
            render: (model_url) => (
                model_url ? (
                    <Tag color="green">已上传</Tag>
                ) : (
                    <Tag color="red">未上传</Tag>
                )
            )
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
            render: (date) => new Date(date).toLocaleString()
        },
        {
            title: '操作',
            key: 'action',
            width: 250,
            fixed: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        编辑
                    </Button>
                    {record.model_url ? (
                        <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => handleNavigateToModelEdit(record.id)}
                        >
                            编辑模型
                        </Button>
                    ) : (
                        <Upload
                            showUploadList={false}
                            accept=".glb,.gltf"
                            beforeUpload={(file) => {
                                handleModelUpload(record.id, file);
                                return false;
                            }}
                        >
                            <Button
                                type="link"
                                icon={<UploadOutlined />}
                            >
                                上传模型
                            </Button>
                        </Upload>
                    )}
                    <Popconfirm
                        title="确定要删除这个建筑吗？"
                        description="删除后无法恢复，请谨慎操作。"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        }
    ];

    return (
        <Card title="建筑管理" className="shadow-sm">
            {/* 搜索表单 */}
            <Form
                form={searchForm}
                layout="inline"
                onFinish={handleSearch}
                className="mb-4"
            >
                <Form.Item name="search">
                    <Input
                        placeholder="搜索建筑名称"
                        allowClear
                        style={{ width: 200 }}
                        prefix={<SearchOutlined className="text-gray-400" />}
                    />
                </Form.Item>

                <Form.Item name="category">
                    <Select
                        placeholder="选择分类"
                        allowClear
                        showSearch
                        style={{ width: 150 }}
                        optionFilterProp="children"
                    >
                        {categories.map((category) => (
                            <Option key={category} value={category}>{category}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="tags">
                    <Select
                        mode="multiple"
                        placeholder="选择标签"
                        allowClear
                        style={{ width: 200 }}
                        maxTagCount="responsive"
                    >
                        {tags.map((tag) => (
                            <Option key={tag} value={tag}>{tag}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="date_range">
                    <RangePicker
                        placeholder={['开始日期', '结束日期']}
                    />
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

            {/* 工具栏 */}
            <div className="mb-4 flex justify-between">
                <Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setModalType('add');
                            setCurrentBuilder(null);
                            setLocation(null);
                            form.resetFields();
                            setModalVisible(true);
                        }}
                    >
                        添加建筑
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => {
                            handleReset();
                            fetchBuilders();
                        }}
                    >
                        刷新
                    </Button>
                </Space>
                <span className="text-gray-500">
                    共找到 {total} 条记录
                </span>
            </div>

            {/* 表格 */}
            <Table
                columns={columns}
                dataSource={builders}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条`,
                }}
                onChange={handleTableChange}
                scroll={{ x: 1300 }}
            />

            {/* 添加/编辑模态框 */}
            <Modal
                title={modalType === 'add' ? '添加建筑' : '编辑建筑'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setLocation(null);
                }}
                onOk={() => form.submit()}
                width={800}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ tags: [] }}
                >
                    <Form.Item
                        name="name"
                        label="建筑名称"
                        rules={[{ required: true, message: '请输入建筑名称' }]}
                    >
                        <Input placeholder="请输入建筑名称" maxLength={200} />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="建筑描述"
                        rules={[{ required: true, message: '请输入建筑描述' }]}
                    >
                        <TextArea
                            placeholder="请输入建筑描述"
                            rows={4}
                            maxLength={1000}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item
                        label="位置"
                        required
                        help="点击地图选择位置"
                    >
                        <div style={{ height: '300px', width: '100%', marginBottom: '1rem' }}>
                            <MapContainer
                                center={location || [35.8617, 104.1954]}
                                zoom={4}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
                                    attribution="&copy; 高德地图"
                                />
                                {location && (
                                    <Marker position={location} />
                                )}
                                <MapClickHandler
                                    onLocationSelect={(loc) => {
                                        setLocation(loc);
                                    }}
                                />
                            </MapContainer>
                        </div>
                        {location && (
                            <div className="text-gray-500 text-sm">
                                当前位置：[{location[0].toFixed(5)}, {location[1].toFixed(5)}]
                            </div>
                        )}
                    </Form.Item>

                    <Form.Item
                        name="category"
                        label="建筑分类"
                        rules={[{ required: true, message: '请选择建筑分类' }]}
                    >
                        <Select
                            placeholder="请选择建筑分类"
                            allowClear
                            showSearch
                            optionFilterProp="children"
                        >
                            {categories.map((category) => (
                                <Option key={category} value={category}>{category}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="tags"
                        label="建筑标签"
                    >
                        <Select
                            mode="tags"
                            placeholder="请选择或输入建筑标签"
                            allowClear
                            showSearch
                            optionFilterProp="children"
                        >
                            {tags.map((tag) => (
                                <Option key={tag} value={tag}>{tag}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {modalType === 'add' && (
                        <Form.Item
                            name="image"
                            label="建筑预览图"
                            valuePropName="fileList"
                            getValueFromEvent={(e) => {
                                if (Array.isArray(e)) {
                                    return e;
                                }
                                return e?.fileList;
                            }}
                        >
                            <Upload
                                accept="image/*"
                                listType="picture-card"
                                maxCount={1}
                                beforeUpload={() => false}
                            >
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>上传图片</div>
                                </div>
                            </Upload>
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </Card>
    );
};

export default BuilderManagement;