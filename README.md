# Sokoban Game (推箱子)

这是一个基于 Vue 3 + Tailwind CSS 开发的现代化推箱子游戏，支持 PC 和移动端响应式布局。

## 1 How to Run

### 本地运行 (Development)

进入前端目录并启动开发服务器：

```bash
cd frontend-user
npm install
npm run dev
```

访问 http://localhost:5173

### Docker 运行 (Production)

在项目根目录下执行以下命令：

```bash
# 构建并后台启动容器
docker-compose up --build -d
```

访问 http://localhost:8081

## 2 Services

| 服务名称      | 描述                 | 容器端口 | 宿主机映射端口 |
| :------------ | :------------------- | :------- | :------------- |
| frontend-user | 前端用户界面 (Nginx) | 80       | **8081**       |

## 3 测试账号

本项目为纯前端单机游戏，无需登录，无测试账号。

## 4 题目内容

生成一个可以直接在网页中使用的推箱子小游戏，页面美观，整洁大气，纯前端页面，不需要后端技术支持。

---

## 🎮 游戏特色

- **响应式设计**：完美适配 PC 宽屏（左右分栏）和移动端窄屏（垂直布局）。
- **丝滑动画**：所有移动和状态切换均有过渡效果。
- **无限撤销**：支持 Ctrl+Z 或 U 键无限回退。
- **关卡系统**：内置简单/中等/困难三个关卡。
- **精美 UI**：深色玻璃态风格，视觉体验极佳。

## 🏗️ 项目架构

```
frontend-user/src/
├── components/          # UI 组件
│   ├── GameBoard.vue       # 游戏地图
│   ├── GameControls.vue    # PC控制面板
│   ├── GameHeader.vue      # 移动端顶栏
│   ├── GameOverlay.vue     # 胜利弹窗
│   ├── LevelSelector.vue   # 关卡选择
│   └── MobileControls.vue  # 移动端控制
├── composables/         # 逻辑层
│   └── useGame.js          # 游戏核心逻辑
├── data/                # 数据层
│   └── levels.js           # 关卡配置
└── App.vue              # 主布局容器
```

## ⌨️ 操作方式

| 操作 | PC 端         | 移动端   |
| :--- | :------------ | :------- |
| 移动 | WASD / 方向键 | 方向按钮 |
| 撤销 | Ctrl+Z / U    | 撤销按钮 |
| 重置 | R             | 重置按钮 |
