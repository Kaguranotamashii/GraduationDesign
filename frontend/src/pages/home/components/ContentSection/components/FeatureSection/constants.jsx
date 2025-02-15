import { MapPin, Clock, Book, Camera } from 'lucide-react';

export const features = [
    {
        icon: <MapPin className="w-8 h-8 text-red-600" />,
        title: "互动地图",
        description: "探索中国各地古建筑遗产，通过互动地图发现近在咫尺的历史瑰宝",
        link: "探索地图"
    },
    {
        icon: <Clock className="w-8 h-8 text-red-600" />,
        title: "历史长河",
        description: "跨越朝代，了解中国建筑发展脉络，感受匠心营造的精妙演变",
        link: "查看时间线"
    },
    {
        icon: <Book className="w-8 h-8 text-red-600" />,
        title: "古籍档案",
        description: "查阅历史文献记载，深入了解古建筑的营造技艺与文化内涵",
        link: "浏览档案"
    },
    {
        icon: <Camera className="w-8 h-8 text-red-600" />,
        title: "虚拟游览",
        description: "通过全景影像技术，身临其境体验中国古建筑的恢宏气势",
        link: "开始游览"
    }
];