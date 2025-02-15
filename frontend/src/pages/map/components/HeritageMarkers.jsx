// components/heritage/HeritageMarkers.jsx
import { useEffect, useState, useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Button, Card, Tag, Spin } from 'antd';
import L from 'leaflet';
import { getAllModels } from '@/api/builderApi';

const HeritageMarkers = ({ mapZoom }) => {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSites = async () => {
            try {
                const response = await getAllModels();
                // 确保我们获取到的是数组
                const sitesData = Array.isArray(response) ? response :
                    Array.isArray(response.data) ? response.data : [];
                setSites(sitesData);
            } catch (error) {
                console.error('Error fetching sites:', error);
                setSites([]); // 确保错误时设置为空数组
            } finally {
                setLoading(false);
            }
        };

        fetchSites();
    }, []);

    const visibleSites = useMemo(() => {
        return mapZoom >= 4 ? sites : [];
    }, [mapZoom, sites]);

    if (loading) {
        return <Spin className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />;
    }

    return (
        <>
            {Array.isArray(visibleSites) && visibleSites.map(site => {
                try {
                    // 安全地解析坐标
                    const coordinates = (() => {
                        try {
                            const parsed = JSON.parse(site.address.replace(/\s/g, ''));
                            return Array.isArray(parsed) && parsed.length === 2 ? parsed : [35.8617, 104.1954];
                        } catch (e) {
                            console.error('Error parsing coordinates:', e);
                            return [35.8617, 104.1954]; // 默认坐标
                        }
                    })();

                    // 安全地分割标签
                    const tagList = site.tags ? site.tags.split(',').filter(Boolean) : [];

                    return (
                        <Marker
                            key={site.id}
                            position={coordinates}
                            icon={L.divIcon({
                                className: 'heritage-marker',
                                html: `<div class="w-3 h-3 bg-red-500 rounded-full"></div>`
                            })}
                        >
                            <Popup>
                                <Card
                                    cover={
                                        site.image_url && (
                                            <img
                                                alt={site.name}
                                                src={site.image_url}
                                                style={{ height: 128, objectFit: 'cover' }}
                                            />
                                        )
                                    }
                                    bodyStyle={{ padding: 12 }}
                                >
                                    <Card.Meta
                                        title={site.name}
                                        description={
                                            <div>
                                                <p>{site.description}</p>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {tagList.map((tag, index) => (
                                                        <Tag key={index} color="blue">
                                                            {tag.trim()}
                                                        </Tag>
                                                    ))}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-2">
                                                    创建时间: {new Date(site.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        }
                                    />
                                    <Button
                                        type="primary"
                                        block
                                        onClick={() => window.location.href = `/heritage/${site.id}`}
                                        style={{ marginTop: 12 }}
                                    >
                                        查看详情
                                    </Button>
                                </Card>
                            </Popup>
                        </Marker>
                    );
                } catch (error) {
                    console.error('Error rendering marker:', error);
                    return null;
                }
            })}
        </>
    );
};

export default HeritageMarkers;