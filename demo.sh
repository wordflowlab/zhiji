#!/bin/bash

# 知几平台演示脚本
# 用于快速演示项目功能

echo "🚀 知几 AI Agent 可行性评估平台 - 演示脚本"
echo "========================================="
echo ""

# 检查依赖
echo "📦 检查项目依赖..."
if ! command -v node &> /dev/null; then
    echo "❌ 需要安装 Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ 需要安装 npm"
    exit 1
fi

echo "✅ 依赖检查通过"
echo ""

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📥 安装前端依赖..."
    npm install
fi

if [ ! -d "workers/api/node_modules" ]; then
    echo "📥 安装后端依赖..."
    cd workers/api && npm install && cd ../..
fi

# 启动后端
echo "🔧 启动后端 API 服务器..."
cd workers/api
npx wrangler dev src/index.ts &
BACKEND_PID=$!
cd ../..
sleep 5

# 启动前端
echo "🎨 启动前端应用..."
npm run dev &
FRONTEND_PID=$!
sleep 5

echo ""
echo "✨ 应用已启动！"
echo "========================================="
echo "📱 前端地址: http://localhost:3000"
echo "🔌 API地址: http://localhost:8787"
echo "========================================="
echo ""
echo "🎯 演示步骤："
echo "1. 打开浏览器访问 http://localhost:3000"
echo "2. 点击「开始评估」按钮"
echo "3. 填写测试项目信息："
echo "   - 项目名称：智能客服系统"
echo "   - 项目描述：基于AI的智能客服解决方案"
echo "   - 目标用户：企业客服团队"
echo "   - 主要功能：多轮对话, 情感分析, 知识库"
echo "   - 技术约束：响应时间<2秒, 准确率>90%"
echo "4. 提交后查看评估结果"
echo ""
echo "📊 测试数据："
echo "   - 访问 http://localhost:8787/api/evaluations 查看所有评估"
echo "   - 访问 http://localhost:8787/api/health 检查服务状态"
echo ""
echo "按 Ctrl+C 停止演示..."

# 等待用户中断
trap "echo ''; echo '🛑 停止演示...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait