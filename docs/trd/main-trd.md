# 知几（ZhiJi）- 技术需求文档总览

## 1. 项目概述

### 1.1 产品定位
**知几**是一个基于 Cloudflare 生态的 AI Agent 可行性评估平台，通过多维度智能分析帮助用户在项目启动前准确判断可行性，真正做到"见几而作"。

### 1.2 技术愿景
构建一个高性能、全球化、低成本的智能评估平台，利用边缘计算架构实现毫秒级响应，支持多种主流 AI 模型，为全球用户提供专业的 AI Agent 项目评估服务。

### 1.3 核心技术特征
- **边缘计算优先**：基于 Cloudflare Workers 的 Serverless 架构
- **多模型支持**：集成 GPT-5、Claude、DeepSeek、Qwen 等主流模型
- **实时可视化**：动态 SVG 能力矩阵展示
- **全球部署**：利用 Cloudflare 200+ 边缘节点
- **成本优化**：智能模型选择和多级缓存策略

## 2. 系统架构

### 2.1 技术架构分层
```
┌─────────────────────────────────────────────────────────┐
│                     表现层 (Presentation)                │
│         Next.js 14 + React 18 + TypeScript 5             │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                    边缘计算层 (Edge Computing)            │
│      Cloudflare Workers + Pages + Durable Objects        │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                     服务层 (Service)                      │
│    评估服务 | 用户服务 | 报告服务 | 实时通信服务           │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                      数据层 (Data)                        │
│      D1 Database | KV Store | R2 Storage | Queues        │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                   外部服务层 (External)                   │
│         OpenAI | Anthropic | DeepSeek | Alibaba          │
└─────────────────────────────────────────────────────────┘
```

### 2.2 核心技术栈

#### 前端技术栈
- **框架**: Next.js 14.2.0 (App Router)
- **语言**: TypeScript 5.3
- **样式**: Tailwind CSS 3.4 + shadcn/ui
- **状态管理**: Zustand 4.5 + TanStack Query 5.0
- **表单处理**: React Hook Form 7.50 + Zod 3.22
- **可视化**: D3.js + Recharts 2.10
- **动画**: Framer Motion 11.0

#### 后端技术栈
- **运行时**: Cloudflare Workers
- **框架**: Hono 4.0
- **数据库**: Cloudflare D1 (SQLite)
- **缓存**: Cloudflare KV
- **存储**: Cloudflare R2
- **队列**: Cloudflare Queues
- **实时通信**: Durable Objects (WebSocket)

### 2.3 关键技术决策

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 边缘计算 | Cloudflare Workers | 全球低延迟、自动扩展、成本效益 |
| 前端框架 | Next.js 14 | SSR/SSG支持、优秀的性能、生态成熟 |
| 数据库 | D1 + KV | 边缘原生、高性能、成本低 |
| AI 模型 | 多模型支持 | 灵活选择、成本优化、避免单点依赖 |
| 实时通信 | Durable Objects | 状态管理简单、自动扩展 |

## 3. 性能目标

### 3.1 关键性能指标 (KPI)

| 指标 | 目标值 | 优先级 |
|------|--------|--------|
| 首屏加载时间 (FCP) | < 1.5s | P0 |
| 可交互时间 (TTI) | < 3s | P0 |
| API 响应时间 (P95) | < 500ms | P0 |
| 评估处理时间 | < 5s | P1 |
| 并发处理能力 | 10,000 QPS | P1 |
| 缓存命中率 | > 80% | P1 |
| 系统可用性 | 99.9% | P0 |
| 错误率 | < 0.1% | P0 |

### 3.2 容量规划

| 指标 | 初期 (3个月) | 中期 (6个月) | 长期 (12个月) |
|------|-------------|-------------|--------------|
| MAU | 1,000 | 10,000 | 100,000 |
| 日评估次数 | 100 | 1,000 | 10,000 |
| 数据存储 | 1GB | 10GB | 100GB |
| 月度成本 | $500 | $2,000 | $10,000 |

## 4. 技术约束与要求

### 4.1 强制要求
- ✅ 必须使用 Cloudflare 生态系统
- ✅ 必须支持 SSR/SSG 以优化 SEO
- ✅ 必须支持多语言（初期中英文）
- ✅ 必须符合 GDPR 合规要求
- ✅ 必须支持移动端响应式设计

### 4.2 技术约束
- 单个 Worker 执行时间限制：30秒
- KV 单个值大小限制：25MB
- D1 数据库大小限制：10GB
- R2 单个文件大小限制：5TB
- WebSocket 连接数限制：依据套餐

## 5. 安全要求

### 5.1 认证与授权
- JWT Token 认证
- RBAC 权限控制
- OAuth 2.0 社交登录支持

### 5.2 数据安全
- AES-256 加密敏感数据
- TLS 1.3 传输加密
- 定期安全审计
- 自动备份机制

### 5.3 合规要求
- GDPR 合规（欧洲）
- 个人信息保护法合规（中国）
- 数据最小化原则
- 用户数据删除权

## 6. 集成要求

### 6.1 AI 模型集成
- OpenAI GPT-5
- Anthropic Claude 4.1
- DeepSeek 3.1
- Alibaba Qwen3

### 6.2 第三方服务
- Cloudflare Analytics
- Sentry 错误监控
- GitHub Actions CI/CD
- Stripe 支付（未来）

## 7. 开发环境要求

### 7.1 本地开发
```bash
# 必需工具
- Node.js 20+
- npm/pnpm
- Wrangler CLI
- Git

# 推荐工具
- VS Code
- Postman/Insomnia
- Docker (可选)
```

### 7.2 开发流程
1. 本地开发 (localhost:3000)
2. 预览环境 (preview.zhiji.ai)
3. 预发布环境 (staging.zhiji.ai)
4. 生产环境 (zhiji.ai)

## 8. 文档结构

本 TRD 文档集包含以下专项文档：

| 文档 | 说明 | 路径 |
|------|------|------|
| 数据库设计 | 完整的数据模型和存储方案 | [database-design.md](./database-design.md) |
| API 设计 | RESTful API 和 WebSocket 设计 | [api-design.md](./api-design.md) |
| AI 模型集成 | 多模型集成和提示词工程 | [ai-integration.md](./ai-integration.md) |
| 前端技术 | React/Next.js 架构和组件设计 | [frontend-tech.md](./frontend-tech.md) |
| 部署运维 | CI/CD 和监控方案 | [deployment-ops.md](./deployment-ops.md) |
| 安全设计 | 认证、加密和合规方案 | [security-design.md](./security-design.md) |
| 测试策略 | 测试框架和覆盖率要求 | [testing-strategy.md](./testing-strategy.md) |
| 成本分析 | 详细的成本预算和优化策略 | [cost-analysis.md](./cost-analysis.md) |
| 实施计划 | 项目里程碑和资源规划 | [implementation-plan.md](./implementation-plan.md) |

## 9. 快速开始

### 9.1 环境准备
```bash
# 克隆项目
git clone https://github.com/zhiji/zhiji-platform.git
cd zhiji-platform

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 添加必要的 API Keys

# 启动开发服务器
npm run dev
```

### 9.2 Cloudflare 配置
```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 创建 D1 数据库
wrangler d1 create zhiji-db

# 创建 KV 命名空间
wrangler kv:namespace create zhiji-cache

# 部署到 Cloudflare
npm run deploy
```

## 10. 联系方式

- **技术负责人**: TBD
- **产品负责人**: TBD
- **项目仓库**: https://github.com/zhiji/zhiji-platform
- **文档站点**: https://docs.zhiji.ai
- **技术支持**: tech@zhiji.ai

---

**文档版本**: v1.0.0  
**最后更新**: 2025年1月  
**下次评审**: 2025年2月  
**维护团队**: 知几技术团队