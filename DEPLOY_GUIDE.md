# 知几平台 Cloudflare 部署指南

## 前置准备

1. 确保已安装 wrangler CLI
2. 拥有 Cloudflare 账号
3. 代码已推送到 GitHub

## 部署步骤

### 1. 登录 Cloudflare

```bash
wrangler login
```

在浏览器中完成授权。

### 2. 创建 D1 数据库

```bash
cd workers/api

# 创建生产环境数据库
wrangler d1 create zhiji-db

# 记录返回的 database_id
# 例如：database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 3. 更新配置

编辑 `workers/api/wrangler.toml`，将 database_id 更新为实际值：

```toml
[[d1_databases]]
binding = "DB"
database_name = "zhiji-db"
database_id = "你的实际database_id"  # 更新这里
```

### 4. 初始化数据库

```bash
# 执行数据库初始化脚本
wrangler d1 execute zhiji-db --file=../../database/schema.sql
```

### 5. 部署 Workers API

```bash
# 在 workers/api 目录下
wrangler deploy --env production
```

记录部署后的 API URL，例如：`https://zhiji-api.你的账号.workers.dev`

### 6. 更新前端环境变量

创建 `.env.production` 文件：

```env
NEXT_PUBLIC_API_URL=https://zhiji-api.你的账号.workers.dev/api
```

### 7. 部署前端到 Cloudflare Pages

#### 方法一：通过 Cloudflare Dashboard（推荐）

1. 访问 [Cloudflare Pages](https://dash.cloudflare.com/pages)
2. 点击 "Create a project"
3. 选择 "Connect to Git"
4. 授权并选择 GitHub 仓库 `zhiji`
5. 配置构建设置：
   - Framework preset: `Next.js`
   - Build command: `npm run build`
   - Build output directory: `.next`
6. 添加环境变量：
   - `NEXT_PUBLIC_API_URL`: 你的 Workers API URL
7. 点击 "Save and Deploy"

#### 方法二：通过 CLI

```bash
# 在项目根目录
npm run build

# 部署到 Pages
wrangler pages deploy .next --project-name=zhiji
```

### 8. 配置自定义域名（可选）

1. 在 Cloudflare Pages 项目设置中
2. 转到 "Custom domains"
3. 添加你的域名
4. 按照提示配置 DNS

## 验证部署

1. 访问你的 Pages URL 或自定义域名
2. 测试评估功能是否正常工作
3. 检查 API 连接是否成功

## 常见问题

### Q: D1 数据库创建失败
A: 确保你的 Cloudflare 账号有权限创建 D1 数据库

### Q: API 部署后 CORS 错误
A: 检查 API 代码中的 CORS 配置，确保允许前端域名访问

### Q: Pages 构建失败
A: 检查 Node.js 版本要求，确保环境变量正确设置

## 监控和日志

- Workers 日志：`wrangler tail --env production`
- Pages 构建日志：在 Cloudflare Dashboard 查看
- D1 数据库查询：`wrangler d1 execute zhiji-db --command="SELECT * FROM evaluations"`

## 更新部署

### 更新 API
```bash
cd workers/api
wrangler deploy --env production
```

### 更新前端
推送代码到 GitHub，Cloudflare Pages 会自动重新构建和部署。

## 回滚

如需回滚，可以在 Cloudflare Dashboard 中：
- Workers：选择之前的版本
- Pages：选择之前的部署

---

完成以上步骤后，你的知几平台就成功部署到 Cloudflare 了！