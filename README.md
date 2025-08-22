# 知几（ZhiJi）- AI Agent 可行性评估平台

<div align="center">
  
  **让每个 AI 创新者都能洞察先机，预见成败**
  
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Status](https://img.shields.io/badge/status-development-orange.svg)](https://github.com/wordflowlab/zhiji)
  
</div>

## 📖 项目简介

知几（ZhiJi）是一个专为 AI Agent 开发者打造的智能可行性评估平台。名称源自《易经》"知几其神乎"，寓意洞察事物发展的细微征兆，帮助开发者在项目启动前准确判断成败可能。

### 🎯 核心价值

- **节省 90% 评估时间** - 即时生成专业评估报告
- **降低 80% 试错成本** - 投入开发前明确可行性
- **提升 4 倍项目成功率** - 基于数据驱动的评估体系

## ✨ 核心特性

### 1. 能力矩阵可视化
业界首创的 LLM 能力 vs 业务复杂度矩阵，直观展示项目在"最大公约数"区域的位置。

### 2. 多模型智能评估
- 支持 GPT-5、Claude 3、DeepSeek、Qwen 等主流模型
- 根据项目特点智能推荐最适合的评估模型

### 3. 即时专业报告
- 5 秒内生成专业评估报告
- 包含可行性评分、风险分析、改进建议
- 支持 PDF 导出和团队分享

### 4. 案例知识库
- 持续更新的真实项目案例
- 成功与失败案例对比学习
- 行业最佳实践参考

## 🛠 技术架构

基于 Cloudflare 生态构建的全球化边缘计算架构：

```
前端框架：Next.js 14 + TypeScript + Tailwind CSS
后端服务：Cloudflare Workers (Edge Functions)
数据存储：Cloudflare D1 (SQLite) + KV (缓存)
文件存储：Cloudflare R2 (对象存储)
AI 集成：OpenAI、Anthropic、DeepSeek API
```

## 📁 项目结构

```
zhiji/
├── docs/                      # 项目文档
│   ├── agent-feasibility-evaluator-prd.md    # 产品需求文档
│   ├── zhiji-market-requirements-document.md  # 市场需求文档
│   ├── zhiji-technical-requirements-document.md # 技术需求文档
│   └── images/               # 文档图片资源
├── src/                      # 源代码（待开发）
├── tests/                    # 测试代码（待开发）
├── .gitignore               # Git 忽略配置
└── README.md                # 项目说明文档
```

## 🚀 快速开始

### 环境要求

- Node.js 18.17 或更高版本
- npm 或 yarn 包管理器
- Cloudflare 账号（用于部署）

### 安装步骤

```bash
# 克隆仓库
git clone git@github.com:wordflowlab/zhiji.git
cd zhiji

# 安装依赖（待项目初始化后）
npm install

# 本地开发（待项目初始化后）
npm run dev

# 构建生产版本（待项目初始化后）
npm run build
```

## 📚 项目文档

- [产品需求文档 (PRD)](docs/agent-feasibility-evaluator-prd.md) - 详细的产品功能设计
- [市场需求文档 (MRD)](docs/zhiji-market-requirements-document.md) - 市场分析与商业策略
- [技术需求文档 (TRD)](docs/zhiji-technical-requirements-document.md) - 技术架构与实现方案

## 🎯 产品路线图

### Phase 1: MVP (2025 Q1)
- [x] 项目规划与设计
- [ ] 基础评估功能
- [ ] 能力矩阵可视化
- [ ] 5 个模型支持

### Phase 2: 商业化 (2025 Q2)
- [ ] 付费订阅系统
- [ ] PDF 报告生成
- [ ] 案例库建设

### Phase 3: 企业功能 (2025 Q3)
- [ ] 团队协作
- [ ] API 开放
- [ ] 批量评估

## 🤝 贡献指南

我们欢迎所有形式的贡献！包括但不限于：

- 提交 Bug 报告和功能建议
- 改进文档
- 提交代码补丁
- 分享使用案例

请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解更多信息。

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🌟 致谢

感谢所有为知几项目做出贡献的开发者和用户！

---

<div align="center">
  
  **知几 - 见几而作，不俟终日**
  
  Built with ❤️ by [WordFlowLab](https://github.com/wordflowlab)
  
</div>