# 知几 - AI Agent 可行性评估平台

<div align="center">
  <h3>让每个 AI 创新者都能洞察先机，预见成败</h3>
  <p>
    <a href="#功能特性">功能</a> •
    <a href="#快速开始">开始</a> •
    <a href="#技术架构">架构</a> •
    <a href="#部署">部署</a> •
    <a href="#文档">文档</a>
  </p>
</div>

## 📖 项目简介

知几是一个专门为 AI Agent 项目设计的可行性评估平台。通过多维度分析和智能评估，帮助创新者在项目启动前就能预见潜在的挑战和机遇。

## ✨ 功能特性

### 核心功能
- 🎯 **智能评估** - 基于多个 AI 模型的综合评估
- 📊 **五维分析** - 清晰度、能力匹配、客观性、数据质量、容错性
- 💡 **智能建议** - 提供具体可行的改进建议
- ⚠️ **风险预警** - 识别潜在风险并提供应对策略
- 📈 **可行性矩阵** - 技术难度与商业价值的可视化分析

### 技术特点
- ⚡ **边缘计算** - 基于 Cloudflare Workers 的全球部署
- 🔒 **数据安全** - 本地化存储，保护隐私
- 🚀 **高性能** - 毫秒级响应，支持高并发
- 💰 **低成本** - Serverless 架构，按需付费

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Cloudflare 账号（部署时需要）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/yourusername/zhiji.git
cd zhiji
```

2. **安装依赖**
```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd workers/api
npm install
cd ../..
```

3. **启动开发环境**
```bash
# 使用演示脚本（推荐）
./demo.sh

# 或手动启动
# 终端1：启动后端
cd workers/api
npm run dev

# 终端2：启动前端
npm run dev
```

4. **访问应用**
- 前端：http://localhost:3000
- API：http://localhost:8787

## 🏗 技术架构

```
知几平台
├── 前端 (Next.js 14)
│   ├── React 18
│   ├── TypeScript
│   └── Tailwind CSS
├── 后端 (Cloudflare Workers)
│   ├── Hono Framework
│   ├── D1 Database
│   └── TypeScript
└── AI 集成
    ├── GPT-5
    ├── Claude 4.1
    ├── DeepSeek 3.1
    └── Qwen3
```

## 📁 项目结构

```
zhiji/
├── src/                    # Next.js 前端源码
│   ├── app/               # 页面组件
│   └── lib/               # 工具库
├── workers/               # Cloudflare Workers
│   └── api/              # API 服务
├── database/             # 数据库文件
│   └── schema.sql       # 表结构
├── docs/                 # 文档
│   └── trd/             # 技术需求文档
├── DEPLOYMENT.md        # 部署指南
├── CLAUDE.md           # AI 开发指导
└── README.md          # 本文件
```

## 🔧 开发指南

### 本地开发

```bash
# 前端开发（支持热重载）
npm run dev

# 后端开发（支持热重载）
cd workers/api
npm run dev

# 数据库操作
npx wrangler d1 execute zhiji-db --local --command="SELECT * FROM evaluations"
```

### 测试

```bash
# 运行测试
npm test

# 构建检查
npm run build
```

## 📦 部署

### 快速部署

详细部署步骤请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 部署到 Cloudflare

1. **部署后端 API**
```bash
cd workers/api
npx wrangler deploy --env production
```

2. **部署前端**
```bash
npm run build
npx wrangler pages deploy .next --project-name=zhiji
```

## 📊 使用示例

### 创建评估

```javascript
const evaluation = {
  projectName: "智能客服系统",
  description: "基于AI的自动客服解决方案",
  targetUsers: "企业客服团队",
  features: ["多轮对话", "情感分析", "知识库"],
  constraints: ["响应时间<2秒", "准确率>90%"],
  modelId: "gpt-5"
};

const response = await fetch('http://localhost:8787/api/evaluations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(evaluation)
});
```

## 📚 文档

- [技术需求文档](./docs/trd/main-trd.md)
- [API 设计文档](./docs/trd/api-design.md)
- [数据库设计](./docs/trd/database-design.md)
- [AI 集成指南](./docs/trd/ai-integration.md)
- [部署指南](./DEPLOYMENT.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- Cloudflare Workers 提供的边缘计算平台
- Next.js 团队的优秀框架
- 所有开源贡献者

## 📮 联系方式

- 项目主页：[https://zhiji.ai](https://zhiji.ai)
- 问题反馈：[GitHub Issues](https://github.com/yourusername/zhiji/issues)

---

<div align="center">
  <p>用 ❤️ 打造，为 AI 创新者服务</p>
  <p>© 2024 知几团队</p>
</div>
