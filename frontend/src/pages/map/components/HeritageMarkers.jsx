import { useEffect, useState, useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Button, Card, Tag, Spin, notification } from 'antd';
import L from 'leaflet';
import { getAllModels } from '@/api/builderApi';

const HeritageMarkers = ({ mapZoom }) => {
    const [sites, setSites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 获取遗址数据
    useEffect(() => {
        const fetchSites = async () => {
            try {
                const response = await getAllModels();
                const sitesData = Array.isArray(response)
                    ? response
                    : Array.isArray(response.data)
                        ? response.data
                        : [];
                setSites(sitesData);
            } catch (error) {
                console.error('Failed to fetch sites:', error);
                setSites([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSites();
    }, []);

    // 根据缩放级别过滤可见遗址
    const visibleSites = useMemo(() => (
        mapZoom >= 4 ? sites : []
    ), [mapZoom, sites]);

    // 处理 DeepSeek 点击事件
    const handleDeepSeekClick = (siteName) => {
        const query = `${siteName} 的详细介绍，包括其建筑风格、历史背景、文化意义以及在当代社会中的地位和作用。此外，还希望了解该建筑在设计和建造过程中遇到的主要问题及其解决方案，以及其在维护和保护方面面临的挑战和应对措施。`;

        navigator.clipboard.writeText(query).then(() => {
            notification.success({
                message: '已复制到剪贴板',
                description: '即将跳转至 DeepSeek 平台',
                duration: 1.5,
                style: {
                    width: 320,
                    marginTop: 50,
                    background: '#f6ffed',
                    border: '1px solid #b7eb8f',
                    borderRadius: 8,
                },
            });

            setTimeout(() => {
                window.open(
                    `https://chat.deepseek.com/?query=${encodeURIComponent(query)}`,
                    '_blank'
                );
            }, 1000);
        });
    };

    // 解析坐标
    const parseCoordinates = (address) => {
        try {
            const cleaned = address.replace(/\s/g, '');
            const coords = JSON.parse(cleaned);
            return Array.isArray(coords) && coords.length === 2
                ? coords
                : [35.8617, 104.1954];
        } catch {
            return [35.8617, 104.1954];
        }
    };

    if (isLoading) {
        return (
            <Spin
                size="large"
                className="absolute inset-0 m-auto w-12 h-12"
            />
        );
    }

    return visibleSites.map((site) => {
        try {
            const coordinates = parseCoordinates(site.address);
            const tags = site.tags?.split(',').filter(Boolean) || [];
            const articleLink = site.article_id
                ? `https://10.157.248.175:5173/articles/${site.article_id}`
                : null;
            const modelLink = site.model_url
                ? `https://10.157.248.175:5173/modelViewer/${site.id}`
                : null;

            return (
                <Marker
                    key={site.id}
                    position={coordinates}
                    icon={L.divIcon({
                        className: 'heritage-marker',
                        html: '<div class="w-4 h-4 bg-gradient-to-br from-red-500 to-pink-500 rounded-full shadow-md"></div>',
                    })}
                >
                    <Popup>
                        <Card
                            cover={site.image_url && (
                                <img
                                    alt={site.name}
                                    src={site.image_url}
                                    className="h-40 object-cover rounded-t-lg"
                                />
                            )}
                            className="w-72 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <Card.Meta
                                title={<h3 className="text-lg font-semibold text-gray-800">{site.name}</h3>}
                                description={
                                    <div className="space-y-2">
                                        <p className="text-gray-600 text-sm">{site.description}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {tags.map((tag, idx) => (
                                                <Tag
                                                    key={idx}
                                                    color="geekblue"
                                                    className="rounded-full px-2"
                                                >
                                                    {tag.trim()}
                                                </Tag>
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-400">
                      创建于: {new Date(site.created_at).toLocaleDateString()}
                    </span>
                                    </div>
                                }
                            />
                            <div className="mt-4 space-y-2">
                                {articleLink && (
                                    <Button
                                        type="primary"
                                        block
                                        className="rounded-md bg-blue-500 hover:bg-blue-600"
                                        onClick={() => window.location.href = articleLink}
                                    >
                                        查看文章
                                    </Button>
                                )}
                                {modelLink && (
                                    <Button
                                        type="primary"
                                        block
                                        className="rounded-md bg-blue-500 hover:bg-blue-600"
                                        onClick={() => window.location.href = modelLink}
                                    >
                                        查看模型
                                    </Button>
                                )}
                                <Button
                                    block
                                    className="rounded-md bg-green-500 hover:bg-green-600 text-white"
                                    onClick={() => handleDeepSeekClick(site.name)}
                                >
                                    探索详情
                                </Button>
                            </div>
                        </Card>
                    </Popup>
                </Marker>
            );
        } catch (error) {
            console.error('Marker render error:', error);
            return null;
        }
    });
};

export default HeritageMarkers;