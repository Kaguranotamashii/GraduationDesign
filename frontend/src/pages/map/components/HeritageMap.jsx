// components/heritage/HeritageMap.jsx
import { useState } from 'react';
import { MapContainer, TileLayer, useMapEvent } from 'react-leaflet';
import { FloatButton, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import HeritageMarkers from './HeritageMarkers';
import AddHeritageSiteForm from './AddHeritageSiteForm';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
});

function MapClickHandler({ isSelectingLocation, onLocationSelect }) {
    useMapEvent('click', (e) => {
        if (!isSelectingLocation) return;
        const { lat, lng } = e.latlng;
        onLocationSelect([lat, lng]);
        message.success('位置选择成功！');
    });
    return null;
}

const HeritageMap = () => {
    const [mapZoom, setMapZoom] = useState(4);
    const [showForm, setShowForm] = useState(false);
    const [isSelectingLocation, setIsSelectingLocation] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);

    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
        setIsSelectingLocation(false);
    };

    return (
        <div className="relative w-full h-screen overflow-hidden">
            <MapContainer
                center={[35.8617, 104.1954]}
                zoom={4}
                className="h-full w-full"
                onZoomEnd={(e) => setMapZoom(e.target._zoom)}
                zoomControl={false}
            >
                <TileLayer
                    url="https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
                    attribution="&copy; 高德地图"
                />
                <HeritageMarkers mapZoom={mapZoom} />
                <MapClickHandler
                    isSelectingLocation={isSelectingLocation}
                    onLocationSelect={handleLocationSelect}
                />
            </MapContainer>

            <FloatButton
                icon={<PlusOutlined />}
                type="primary"
                style={{
                    right: 24,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 1000
                }}
                onClick={() => setShowForm(true)}
            />

            <AddHeritageSiteForm
                visible={showForm}
                onClose={() => setShowForm(false)}
                isSelectingLocation={isSelectingLocation}
                setIsSelectingLocation={setIsSelectingLocation}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
            />
        </div>
    );
};

export default HeritageMap;