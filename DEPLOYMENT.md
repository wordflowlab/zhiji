# 知几平台部署指南

## 部署前检查清单

- [x] 前端项目能够成功构建
- [x] 后端 API 本地测试通过
- [x] 数据库迁移脚本准备完成
- [x] 环境变量配置完成
- [ ] Cloudflare 账号准备
- [ ] 域名配置（可选）

## 部署步骤

### 1. 部署后端 API 到 Cloudflare Workers

#### 1.1 创建远程 D1 数据库
```bash
cd workers/api
npx wrangler d1 create zhiji-db --experimental-backend
```

记录返回的 database_id，更新 `wrangler.toml`：
```toml
[[d1_databases]]
binding = "DB"
database_name = "zhiji-db"
database_id = "你的实际database_id"
```

#### 1.2 执行数据库迁移
```bash
npx wrangler d1 execute zhiji-db --file=../../database/schema.sql --remote
```

#### 1.3 设置环境变量（如需要）
```bash
npx wrangler secret put DEEPSEEK_API_KEY
# 输入你的 API Key
```

#### 1.4 部署 Workers
```bash
npx wrangler deploy --env production
```

部署成功后会得到 URL：`https://zhiji-api.你的子域名.workers.dev`

### 2. 部署前端到 Cloudflare Pages

#### 2.1 安装 Cloudflare Pages 适配器
```bash
cd ../../  # 回到项目根目录
npm install -D @cloudflare/next-on-pages
```

#### 2.2 更新环境变量
更新 `.env.production` 中的 API URL 为实际的 Workers URL：
```
NEXT_PUBLIC_API_URL=https://zhiji-api.你的子域名.workers.dev/api
```

#### 2.3 构建项目
```bash
npm run build
```

#### 2.4 部署到 Pages
```bash
npx wrangler pages deploy .next --project-name=zhiji
```

或者使用 Git 集成（推荐）：
1. 将代码推送到 GitHub
2. 在 Cloudflare Dashboard 中连接 GitHub 仓库
3. 设置构建命令：`npm run build`
4. 设置输出目录：`.next`
5. 添加环境变量

### 3. 验证部署

#### 3.1 检查 API 健康状态
```bash
curl https://zhiji-api.你的子域名.workers.dev/api/health
```

#### 3.2 访问前端应用
打开浏览器访问：`https://zhiji.pages.dev`

#### 3.3 测试完整流程
1. 访问评估页面
2. 提交测试评估
3. 查看结果页面
4. 验证数据持久化

## 环境配置

### 生产环境变量

#### Workers (wrangler.toml)
```toml
[env.production]
vars = { ENVIRONMENT = "production" }
# secrets 通过 wrangler secret 设置
```

#### Pages (通过 Dashboard 设置)
- `NEXT_PUBLIC_API_URL`: Workers API 的完整 URL

## 监控和日志

### Workers 日志
```bash
npx wrangler tail --env production
```

### D1 数据库查询
```bash
npx wrangler d1 execute zhiji-db --command="SELECT * FROM evaluations" --remote
```

## 故障排除

### CORS 问题
确保 `workers/api/src/index.ts` 中包含正确的 CORS 配置：
```typescript
app.use('*', cors({
  origin: ['https://zhiji.pages.dev', 'https://zhiji.ai'],
  credentials: true,
}));
```

### 数据库连接问题
1. 确认 database_id 正确
2. 检查数据库是否创建成功
3. 验证表结构是否正确迁移

### API 调用失败
1. 检查环境变量是否正确设置
2. 查看 Workers 日志定位问题
3. 确认 API URL 配置正确

## 回滚方案

### Workers 回滚
```bash
npx wrangler rollback --env production
```

### Pages 回滚
在 Cloudflare Dashboard 中选择之前的部署版本

## 性能优化建议

1. **启用缓存**：为静态资源设置合适的缓存策略
2. **使用 KV 存储**：缓存频繁访问的评估结果
3. **优化数据库查询**：添加必要的索引
4. **启用压缩**：确保 gzip/brotli 压缩已启用

## 安全建议

1. **API 密钥管理**：使用 wrangler secret 管理敏感信息
2. **速率限制**：实施 API 调用速率限制
3. **输入验证**：确保所有用户输入都经过验证
4. **HTTPS**：确保所有通信都通过 HTTPS

## 成本估算

基于 Cloudflare 免费套餐：
- Workers: 100,000 请求/天
- D1: 5GB 存储
- Pages: 无限静态请求

预计可支持：
- 日活跃用户：1000+
- 月评估次数：10000+

## 联系支持

如有部署问题，请联系：
- 技术文档：[Cloudflare Docs](https://developers.cloudflare.com)
- 社区支持：[Cloudflare Community](https://community.cloudflare.com)