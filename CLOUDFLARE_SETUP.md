# Cloudflare Pages 设置指南

## 🚨 重要：启用 Node.js 兼容性

由于 Next.js 使用了一些 Node.js API，你需要在 Cloudflare Dashboard 中手动启用 `nodejs_compat` 兼容性标志。

### 步骤：

1. **登录 Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com/

2. **进入 Pages 项目**
   - 点击 "Pages"
   - 选择 "zhiji" 项目

3. **设置兼容性标志**
   - 点击 "Settings" （设置）
   - 找到 "Compatibility Flags" （兼容性标志）部分
   - 点击 "Configure Production compatibility" （配置生产环境兼容性）
   - 添加标志：`nodejs_compat`
   - 点击 "Save" （保存）

4. **重新部署**
   - 返回 "Deployments" （部署）页面
   - 点击最新部署旁边的 "..." 
   - 选择 "Retry deployment" （重试部署）

## 访问地址

配置完成后，你可以通过以下地址访问：

- 主域名：https://zhiji.pages.dev
- 当前部署：https://b9ab2ccf.zhiji.pages.dev
- API：https://zhiji-api-production.wutongci.workers.dev

## 验证配置

1. 访问网站，应该能看到正常的页面
2. 测试评估功能是否正常工作
3. 检查 API 连接是否成功

## 常见问题

### Q: 仍然看到 Node.js Compatibility Error
A: 确保在 Production 和 Preview 环境都添加了 `nodejs_compat` 标志

### Q: 部署后页面空白
A: 检查浏览器控制台是否有错误，可能需要清除缓存

### Q: API 连接失败
A: 确保 Workers API 已部署并且 URL 正确配置在环境变量中