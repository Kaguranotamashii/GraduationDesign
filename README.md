# 筑境云枢 - 中国传统建筑文化交流平台

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Django](https://img.shields.io/badge/Django-4.2-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.150-orange.svg)](https://threejs.org/)

## 项目概述

筑境云枢是一个开源的中国传统建筑文化交流平台,旨在通过数字化手段促进传统建筑文化的传承与创新.平台集成了3D模型展示、文章管理、社区互动、数据分析等功能,为建筑文化爱好者、专业人士和研究者提供了一个全面的交流与学习环境.

![项目首页展示图](https://github.com/Kaguranotamashii/GraduationDesign/raw/main/docs/images/homepage.png)

*筑境云枢平台首页展示,集成了3D模型浏览、文章阅读和社区互动功能*

## 项目背景与意义

### 背景

中国传统建筑是中华文明的重要组成部分,蕴含着丰富的历史文化价值和技术智慧.然而,随着现代化进程的加速,传统建筑文化面临着传承困难、资料分散、展示方式单一等问题.数字化技术的发展为解决这些问题提供了新的可能性.

### 意义

- **文化传承**:通过数字化手段记录和展示传统建筑,促进建筑文化的保护与传承
- **知识普及**:降低传统建筑知识的获取门槛,提高公众对传统建筑的认知和欣赏能力
- **学术研究**:为建筑学研究提供数字化资料和交流平台,推动学术创新
- **跨界融合**:促进传统建筑文化与现代技术的融合,探索传统文化的创新表达方式

## 系统架构

### 技术栈

#### 前端技术栈

- **框架**:React.js
- **UI组件库**:Ant Design、Tailwind CSS
- **状态管理**:React Hooks、Redux Toolkit
- **路由管理**:React Router
- **3D渲染**:Three.js
- **动画效果**:Framer Motion
- **HTTP客户端**:Axios
- **构建工具**:Vite

#### 后端技术栈

- **框架**:Django (Python)
- **API设计**:Django REST Framework
- **数据库**:SQLite (开发环境),可扩展至PostgreSQL (生产环境)
- **认证授权**:JWT (JSON Web Token)
- **文件存储**:本地文件系统,可扩展至云存储
- **任务队列**:Celery (用于异步任务处理)
- **缓存系统**:Redis

### 系统架构图

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  前端应用 (React) |<--->|  后端API (Django) |<--->|  数据库 (SQLite/  |
|                  |     |                  |     |   PostgreSQL)    |
+------------------+     +------------------+     +------------------+
        |                         |                        |
        |                         |                        |
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  Three.js渲染引擎 |     |  文件存储系统     |     |  缓存系统(Redis)  |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
        |                         |                        |
        |                         |                        |
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  用户界面组件     |     |  任务队列(Celery) |     |  数据分析服务     |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
```

#### 详细架构说明

##### 前端架构

前端采用基于React的单页应用(SPA)架构,主要分为以下几层:

- **表现层**:由React组件构成,负责用户界面的渲染和交互
- **状态管理层**:使用Redux Toolkit管理全局状态,React Hooks管理局部状态
- **服务层**:封装API调用,处理数据转换和业务逻辑
- **工具层**:提供通用工具函数和服务

##### 后端架构

后端采用Django REST Framework构建API服务,主要分为以下几层:

- **表现层**:API视图和序列化器,负责请求处理和响应格式化
- **业务逻辑层**:服务类,封装核心业务逻辑
- **数据访问层**:模型和管理器,负责数据库交互
- **基础设施层**:中间件、信号处理器、任务队列等

##### 数据流向

系统采用前后端分离架构,数据流向如下:

1. 用户在浏览器中与前端应用交互
2. 前端应用通过API与后端服务通信
3. 后端服务处理请求,与数据库和其他服务交互
4. 后端服务返回处理结果
5. 前端应用更新状态并重新渲染界面

### 数据流程

1. 用户通过前端界面发起请求
2. 请求经由API网关路由至相应的后端服务
3. 后端服务处理请求,与数据库交互
4. 处理结果返回至前端
5. 前端渲染数据,呈现给用户

## 核心功能模块

### 1. 3D模型展示系统

平台的核心特色功能,利用Three.js实现传统建筑的三维可视化展示.

#### 主要功能

- **模型浏览**:支持旋转、缩放、平移等交互操作
- **模型详情**:展示建筑的历史背景、结构特点、文化价值等信息
- **模型分类**:按朝代、地区、类型等多维度分类
- **模型搜索**:支持关键词、标签等多种搜索方式

#### 技术实现

- 使用GLTFLoader加载.glb/.gltf格式的3D模型
- 实现OrbitControls提供交互控制
- 优化模型加载过程,提供加载进度反馈
- 实现模型自动旋转、光照效果等增强视觉体验的功能
- 使用后处理效果(如UnrealBloomPass)提升视觉效果
- 实现天气系统和天体系统,增强场景真实感

### 2. 文章管理系统

为用户提供发布、编辑、管理建筑相关文章的功能,促进知识分享和交流.

#### 主要功能

- **文章创建**:支持富文本编辑,包含图片、视频等多媒体内容
- **草稿管理**:自动保存草稿,支持草稿列表管理
- **文章发布**:支持定时发布、标签分类等功能
- **文章互动**:支持点赞、收藏、评论等社交功能

#### 技术实现

- 前端使用富文本编辑器组件
- 后端实现文章CRUD接口
- 实现文章内容的版本控制和草稿自动保存
- 集成评论系统,支持多级评论和通知

### 3. 用户系统

提供用户注册、登录、个人中心等基础功能,支持社区互动.

#### 主要功能

- **用户认证**:注册、登录、找回密码等
- **个人中心**:个人资料管理、内容管理、收藏管理等
- **权限管理**:普通用户、专业用户、管理员等多级权限
- **社交功能**:关注、私信等社交互动

#### 技术实现

- 基于JWT的认证授权机制
- 用户数据加密存储
- 基于角色的访问控制(RBAC)
- 社交关系图数据结构设计

### 4. 建筑管理模块

管理传统建筑的基础信息和多媒体资源,支持分类、标签和搜索功能.

#### 主要功能

- **建筑创建**:用户可以创建新的建筑信息,包括名称、描述、地址、分类等
- **多媒体管理**:支持建筑图片和3D模型的上传、更新和删除
- **分类与标签**:建筑按类别进行组织和管理,支持多标签标注
- **搜索与筛选**:支持多条件搜索和筛选

#### 技术实现

- 文件处理:实现图片和模型文件的验证、保存和删除
- 分页处理:大量建筑数据的分页展示
- 序列化处理:使用DRF序列化器简化API响应格式化
- URL构建:自动生成资源文件的完整URL路径

### 5. 数据分析模块

收集和分析平台运行数据,为用户和管理员提供数据洞察.

#### 主要功能

- **API访问日志**:记录所有API请求的详细信息,支持多条件查询和导出
- **用户行为分析**:记录用户的各类操作行为,支持行为统计和趋势分析
- **系统统计报表**:提供每日统计、用户统计、内容热度等多维度报表
- **热门内容排名**:基于浏览量、点赞数、评论数计算内容热度分数

#### 技术实现

- 中间件监控:通过中间件自动记录API请求信息
- 信号处理:通过Django信号自动捕获用户行为
- 数据聚合:使用Django ORM的聚合函数进行数据分析
- 定时任务:使用Celery实现定时统计任务

## 安装与部署

### 环境要求

- Python 3.8+
- Node.js 14+
- SQLite3 (开发) / PostgreSQL 12+ (生产)
- Redis (可选,用于缓存和Celery)

### 后端部署

1. 克隆仓库

```bash
git clone https://github.com/Kaguranotamashii/GraduationDesign.git
cd GraduationDesign/backend
```

2. 创建虚拟环境并安装依赖

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. 初始化数据库

```bash
python manage.py migrate
python manage.py createsuperuser
```

4. 启动开发服务器

```bash
python manage.py runserver
```

### 前端部署

1. 进入前端目录

```bash
cd ../frontend
```

2. 安装依赖

```bash
npm install
```

3. 启动开发服务器

```bash
npm run dev
```

4. 构建生产版本

```bash
npm run build
```

### 生产环境部署

1. 配置Nginx作为静态文件服务器和反向代理
2. 使用Gunicorn作为WSGI服务器
3. 配置PostgreSQL作为数据库
4. 设置Redis用于缓存和Celery
5. 使用Supervisor管理进程

详细的生产环境部署指南请参考[部署文档](docs/deployment.md).

## 项目结构

```
├── backend/                # 后端Django项目
│   ├── app/                # 应用模块
│   │   ├── analytics/      # 数据分析模块
│   │   ├── article/        # 文章管理模块
│   │   ├── builder/        # 建筑管理模块
│   │   ├── comment/        # 评论模块
│   │   ├── public/         # 公共功能模块
│   │   └── user/           # 用户模块
│   ├── media/              # 媒体文件
│   ├── probject/           # 项目配置
│   └── templates/          # 模板文件
├── frontend/              # 前端React项目
│   ├── public/             # 静态资源
│   └── src/                # 源代码
│       ├── api/            # API调用
│       ├── components/     # 组件
│       ├── pages/          # 页面
│       ├── routes/         # 路由
│       ├── store/          # 状态管理
│       └── utils/          # 工具函数
└── data/                  # 数据文件
    ├── md/                 # Markdown文档
    └── models/             # 3D模型文件
```

## 核心技术实现

### 1. 3D模型渲染与交互

项目使用Three.js实现3D模型的渲染和交互,主要包括以下技术点:

- **场景管理**:通过SceneManager类管理Three.js场景、相机、渲染器等核心组件
- **模型加载**:使用GLTFLoader异步加载GLTF/GLB格式的3D模型
- **交互控制**:实现OrbitControls提供模型旋转、缩放、平移等交互功能
- **光照系统**:实现方向光、环境光、点光源等多种光照,提升模型真实感
- **后处理效果**:使用EffectComposer和UnrealBloomPass等后处理效果增强视觉体验
- **性能优化**:实现模型LOD、视锥体剔除等优化技术,提升渲染性能

#### 核心代码示例

```javascript
// 场景管理器示例代码
class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    
    this.init();
  }
  
  init() {
    // 设置渲染器
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    
    // 设置相机位置
    this.camera.position.set(0, 5, 10);
    
    // 添加光源
    this.addLights();
    
    // 设置控制器
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    
    // 添加后处理效果
    this.setupPostProcessing();
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => this.onWindowResize());
  }
  
  addLights() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // 方向光(模拟太阳光)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
  }
  
  loadModel(url) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          this.scene.add(model);
          resolve(model);
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        (error) => {
          console.error('模型加载错误:', error);
          reject(error);
        }
      );
    });
  }
  
  setupPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,  // 强度
      0.4,  // 半径
      0.85  // 阈值
    );
    this.composer.addPass(bloomPass);
  }
  
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    this.controls.update();
    this.composer.render();
  }
}
```

#### 模型展示效果

![应用中的3D模型展示](https://github.com/Kaguranotamashii/GraduationDesign/raw/main/docs/images/model_showcase.png)

*注:上图为应用中的应县木塔3D模型展示效果图*

### 2. 数据分析系统

项目实现了完整的数据分析系统,主要包括以下模型:

- **APIAccessLog**:记录API访问日志,包括用户、IP、请求方法、路径、状态码、响应时间等
- **UserAction**:记录用户行为,使用GenericForeignKey实现对不同类型内容的关联
- **DailyStatistics**:每日统计数据,包括用户、内容、互动、API等多维度统计
- **UserStatistics**:用户统计数据,记录用户的内容创建、互动和活跃度等指标
- **PopularContent**:热门内容统计,基于多维度指标计算内容热度分数

通过中间件和信号机制,系统能够自动收集数据,并通过定时任务进行数据聚合和分析.

#### 核心代码示例

```python
# 中间件示例:记录API访问日志
class APIAccessLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 记录请求开始时间
        start_time = time.time()
        
        # 处理请求
        response = self.get_response(request)
        
        # 计算响应时间
        duration = time.time() - start_time
        
        # 排除静态资源和管理员请求
        if not request.path.startswith('/static/') and not request.path.startswith('/admin/'):
            # 获取用户信息
            user = request.user if request.user.is_authenticated else None
            
            # 创建访问日志
            APIAccessLog.objects.create(
                user=user,
                ip_address=self.get_client_ip(request),
                method=request.method,
                path=request.path,
                query_params=dict(request.GET.items()),
                status_code=response.status_code,
                response_time=duration,
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
        
        return response
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

# 信号处理示例:记录用户行为
@receiver(post_save, sender=Article)
def article_post_save(sender, instance, created, **kwargs):
    if created:
        # 记录文章创建行为
        UserAction.objects.create(
            user=instance.author,
            action_type='create',
            content_type=ContentType.objects.get_for_model(instance),
            object_id=instance.id,
            object_repr=str(instance)
        )

# 定时任务示例:生成每日统计数据
@shared_task
def generate_daily_statistics():
    # 获取昨天的日期
    yesterday = timezone.now().date() - timezone.timedelta(days=1)
    
    # 统计新用户数
    new_users_count = User.objects.filter(date_joined__date=yesterday).count()
    
    # 统计新文章数
    new_articles_count = Article.objects.filter(created_at__date=yesterday).count()
    
    # 统计新评论数
    new_comments_count = Comment.objects.filter(created_at__date=yesterday).count()
    
    # 统计API请求数
    api_requests_count = APIAccessLog.objects.filter(created_at__date=yesterday).count()
    
    # 创建或更新每日统计记录
    DailyStatistics.objects.update_or_create(
        date=yesterday,
        defaults={
            'new_users_count': new_users_count,
            'new_articles_count': new_articles_count,
            'new_comments_count': new_comments_count,
            'api_requests_count': api_requests_count,
            # 其他统计数据...
        }
    )
```

#### 数据可视化效果

![数据分析仪表板](https://github.com/Kaguranotamashii/GraduationDesign/raw/main/docs/images/analytics_dashboard.png)

*注:上图为平台管理员数据分析仪表板示例*

## API文档

平台提供了完整的RESTful API,支持第三方应用集成和扩展开发.

### API概览

| 资源 | 方法 | 端点 | 描述 |
|------|------|------|------|
| 用户 | GET | `/api/users/` | 获取用户列表 |
| 用户 | POST | `/api/users/` | 创建新用户 |
| 用户 | GET | `/api/users/{id}/` | 获取用户详情 |
| 用户 | PUT | `/api/users/{id}/` | 更新用户信息 |
| 用户 | DELETE | `/api/users/{id}/` | 删除用户 |
| 认证 | POST | `/api/auth/login/` | 用户登录 |
| 认证 | POST | `/api/auth/logout/` | 用户登出 |
| 认证 | POST | `/api/auth/refresh/` | 刷新令牌 |
| 建筑 | GET | `/api/buildings/` | 获取建筑列表 |
| 建筑 | POST | `/api/buildings/` | 创建新建筑 |
| 建筑 | GET | `/api/buildings/{id}/` | 获取建筑详情 |
| 建筑 | PUT | `/api/buildings/{id}/` | 更新建筑信息 |
| 建筑 | DELETE | `/api/buildings/{id}/` | 删除建筑 |
| 文章 | GET | `/api/articles/` | 获取文章列表 |
| 文章 | POST | `/api/articles/` | 创建新文章 |
| 文章 | GET | `/api/articles/{id}/` | 获取文章详情 |
| 文章 | PUT | `/api/articles/{id}/` | 更新文章 |
| 文章 | DELETE | `/api/articles/{id}/` | 删除文章 |
| 评论 | GET | `/api/comments/` | 获取评论列表 |
| 评论 | POST | `/api/comments/` | 创建新评论 |
| 评论 | GET | `/api/comments/{id}/` | 获取评论详情 |
| 评论 | PUT | `/api/comments/{id}/` | 更新评论 |
| 评论 | DELETE | `/api/comments/{id}/` | 删除评论 |
| 统计 | GET | `/api/analytics/daily/` | 获取每日统计数据 |
| 统计 | GET | `/api/analytics/popular/` | 获取热门内容 |

### API认证

所有API请求(除了登录和注册)都需要在请求头中包含有效的JWT令牌:

```
Authorization: Bearer <your_token>
```

### API请求示例

#### 用户登录

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "example", "password": "password123"}'
```

响应:

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### 获取建筑列表

```bash
curl -X GET http://localhost:8000/api/buildings/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

响应:

```json
{
  "count": 25,
  "next": "http://localhost:8000/api/buildings/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "应县木塔",
      "dynasty": "辽",
      "location": "山西省朔州市应县",
      "description": "应县木塔,又称佛宫寺释迦塔,是中国现存最高最古的木构塔式建筑...",
      "year_built": 1056,
      "height": 67.31,
      "image_url": "http://localhost:8000/media/buildings/yingxian_tower.jpg",
      "model_url": "http://localhost:8000/media/models/yingxian_tower.glb",
      "created_at": "2023-01-15T14:30:45Z",
      "updated_at": "2023-01-15T14:30:45Z"
    },
    // 更多建筑...
  ]
}
```

完整的API文档请参考[API文档](https://github.com/Kaguranotamashii/GraduationDesign/wiki/API-Documentation).

## 项目路线图

### 已完成功能

- ✅ 用户认证与授权系统
- ✅ 建筑信息管理
- ✅ 3D模型展示
- ✅ 文章管理系统
- ✅ 评论系统
- ✅ 数据分析基础功能

### 进行中功能

- 🔄 移动端适配优化
- 🔄 性能优化
- 🔄 多语言支持
- 🔄 高级搜索功能

### 计划功能

- 📅 VR/AR支持(计划于2023年Q4)
- 📅 AI辅助内容生成(计划于2024年Q1)
- 📅 社区互动增强功能(计划于2024年Q2)
- 📅 建筑知识图谱(计划于2024年Q3)

## 常见问题解答

### 一般问题

#### Q: 这个项目的主要目标是什么?

A: 筑境云枢旨在通过数字化手段促进中国传统建筑文化的传承与创新,为建筑文化爱好者、专业人士和研究者提供一个全面的交流与学习环境.

#### Q: 如何参与项目贡献?

A: 您可以通过提交bug报告、功能请求、代码修复或新功能来参与项目.详细流程请参考下方的贡献指南.

### 技术问题

#### Q: 项目使用什么技术栈?

A: 前端使用React.js、Three.js等技术,后端使用Django和Django REST Framework.详细技术栈请参考系统架构部分.

#### Q: 如何解决3D模型加载慢的问题?

A: 可以通过以下方法优化:
1. 使用模型压缩和LOD技术
2. 实现模型预加载和缓存
3. 使用CDN加速模型文件加载
4. 优化模型文件大小和复杂度

#### Q: 如何添加新的建筑模型?

A: 管理员可以通过管理界面上传新的建筑模型,支持.glb和.gltf格式.普通用户需要先提交建筑信息,经管理员审核后才能上传模型.

## 贡献指南

我们欢迎各种形式的贡献,包括但不限于:

- 提交bug报告和功能请求
- 提交代码修复和新功能
- 改进文档和示例
- 分享使用经验和案例
- 翻译文档到其他语言

### 贡献流程

1. Fork项目仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

### 开发环境设置

```bash
# 克隆您fork的仓库
git clone https://github.com/YOUR_USERNAME/GraduationDesign.git
cd GraduationDesign

# 添加上游仓库
git remote add upstream https://github.com/Kaguranotamashii/GraduationDesign.git

# 创建虚拟环境并安装依赖
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r backend/requirements.txt

# 安装前端依赖
cd frontend
npm install
```

### 代码规范

- 前端代码遵循ESLint和Prettier配置
- 后端代码遵循PEP 8规范
- 提交信息遵循[约定式提交](https://www.conventionalcommits.org/)规范

### 提交PR前的检查清单

- [ ] 代码符合项目的代码规范
- [ ] 添加了必要的测试并通过所有测试
- [ ] 更新了相关文档
- [ ] 提交信息符合约定式提交规范
- [ ] 确保没有引入新的警告或错误

### 行为准则

参与本项目即表示您同意遵守我们的[行为准则](CODE_OF_CONDUCT.md).请确保您的所有交流和贡献都尊重所有参与者.

## 许可证

本项目采用MIT许可证 - 详见[LICENSE](LICENSE)文件

## 联系方式

- 项目维护者:[Your Name](mailto:your.email@example.com)
- 项目仓库:[GitHub](https://github.com/Kaguranotamashii/GraduationDesign)
- 问题反馈:[Issues](https://github.com/Kaguranotamashii/GraduationDesign/issues)
- 讨论区:[Discussions](https://github.com/Kaguranotamashii/GraduationDesign/discussions)

## 致谢

- 感谢所有为本项目做出贡献的开发者
- 感谢Three.js、React、Django等开源项目提供的技术支持
- 感谢所有为中国传统建筑文化保护与传承做出努力的人们

## 项目展示画廊

以下是项目的一些功能和界面展示:

### 建筑详情页

![建筑详情页](https://github.com/Kaguranotamashii/GraduationDesign/raw/main/docs/images/building_detail.png)

*建筑详情页展示了建筑的基本信息、历史背景、结构特点和文化价值*

### 文章编辑器

![文章编辑器](https://github.com/Kaguranotamashii/GraduationDesign/raw/main/docs/images/article_editor.png)

*富文本编辑器支持多媒体内容和Markdown语法*

### 用户个人中心

![用户个人中心](https://github.com/Kaguranotamashii/GraduationDesign/raw/main/docs/images/user_profile.png)

*用户个人中心展示用户信息、内容管理和社交互动*

### 移动端适配

![移动端界面](https://github.com/Kaguranotamashii/GraduationDesign/raw/main/docs/images/mobile_view.png)

*平台支持响应式设计,提供良好的移动端体验*

---

*筑境云枢 - 连接传统与未来的桥梁*