# 薪资计算器 💰

一个现代化的薪资计算PWA应用，专为移动端优化，支持离线使用。

## ✨ 主要功能

### 📊 薪资计算
- **基础薪资管理**：本薪、专业加给、餐补、夜班津贴、无尘衣津贴
- **加班费计算**：支持三种不同费率的加班时数计算
- **自定义项目**：灵活添加其他收入项目
- **实时计算**：输入数据后立即显示总薪资

### 📈 数据可视化
- **趋势图表**：薪资变化趋势一目了然
- **分类统计**：基础薪资与加班费分别统计
- **数据导出**：支持导出图表为图片格式

### 📱 移动端优化
- **响应式设计**：完美适配各种屏幕尺寸
- **触摸友好**：针对触摸设备优化的交互体验
- **PWA支持**：可安装到桌面，支持离线使用
- **自定义弹窗**：替换原生弹窗，提供更好的移动端体验

### 🎨 用户体验
- **深色/浅色主题**：支持主题切换
- **数据持久化**：本地存储，数据不丢失
- **历史记录**：查看和管理历史计算记录
- **数据导入导出**：支持备份和恢复数据

## 🚀 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **样式框架**：Tailwind CSS
- **状态管理**：Zustand
- **图表库**：Recharts
- **PWA**：Vite PWA Plugin
- **UI组件**：自定义组件库

## 📦 安装和运行

### 环境要求
- Node.js 16+
- npm 或 yarn

### 本地开发

```bash
# 克隆项目
git clone https://github.com/dolbyw/salary-calculator.git

# 进入项目目录
cd salary-calculator

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🌟 特色功能

### PWA 支持
- 📱 可安装到手机桌面
- 🔄 支持离线使用
- 🚀 快速启动和加载
- 📊 后台数据同步

### 移动端优化
- 👆 触摸友好的界面设计
- 📐 响应式布局适配
- 🎯 大按钮和易点击区域
- 💬 自定义确认对话框

### 数据管理
- 💾 本地数据存储
- 📤 数据导入导出
- 🗂️ 历史记录管理
- 🔄 数据备份恢复

## 📱 使用指南

1. **输入基础薪资**：在薪资计算页面输入各项基础薪资
2. **设置加班时数**：输入不同费率的加班时间
3. **查看计算结果**：实时显示总薪资金额
4. **保存记录**：点击保存按钮将计算结果存入历史
5. **查看图表**：在历史页面查看薪资趋势图表
6. **管理数据**：在设置页面进行数据导入导出

## 🔧 开发说明

### 项目结构
```
src/
├── components/          # React 组件
│   ├── ui/             # 基础 UI 组件
│   ├── SalaryCalculator.tsx
│   ├── SalaryHistory.tsx
│   └── SalarySettings.tsx
├── hooks/              # 自定义 Hooks
├── store/              # 状态管理
├── types/              # TypeScript 类型定义
└── lib/                # 工具函数
```

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 组件采用函数式编程
- 使用 React Hooks 管理状态

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

**薪资计算器** - 让薪资计算变得简单高效 ✨
