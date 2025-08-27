#!/bin/bash

# 知几平台开发环境快速启动脚本
# 用于同时启动前端和后端服务

echo "🚀 知几平台 - 开发环境启动"
echo "=========================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 错误: 需要安装 Node.js${NC}"
    echo "请访问 https://nodejs.org 下载安装"
    exit 1
fi

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ 错误: 需要安装 npm${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 环境检查通过${NC}"
echo ""

# 检查并安装依赖
install_deps() {
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 安装前端依赖...${NC}"
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ 前端依赖安装失败${NC}"
            exit 1
        fi
    fi

    if [ ! -d "workers/api/node_modules" ]; then
        echo -e "${YELLOW}📦 安装后端依赖...${NC}"
        cd workers/api
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ 后端依赖安装失败${NC}"
            exit 1
        fi
        cd ../..
    fi
}

# 停止所有服务
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 正在停止所有服务...${NC}"
    
    # 停止后端
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}✅ 后端服务已停止${NC}"
    fi
    
    # 停止前端
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}✅ 前端服务已停止${NC}"
    fi
    
    # 清理端口（如果需要）
    lsof -ti:8787 | xargs kill -9 2>/dev/null
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    
    echo -e "${GREEN}✅ 清理完成${NC}"
    exit 0
}

# 设置中断处理
trap cleanup INT TERM

# 主菜单
show_menu() {
    echo "请选择启动模式："
    echo -e "${BLUE}1)${NC} 完整启动 (前端 + 后端)"
    echo -e "${BLUE}2)${NC} 仅启动前端"
    echo -e "${BLUE}3)${NC} 仅启动后端"
    echo -e "${BLUE}4)${NC} 数据库管理"
    echo -e "${BLUE}5)${NC} 退出"
    echo ""
    read -p "请输入选项 [1-5]: " choice
}

# 启动后端
start_backend() {
    echo -e "${YELLOW}🔧 启动后端 API...${NC}"
    cd workers/api
    npx wrangler dev src/index.ts --local --persist-to=.wrangler/state &
    BACKEND_PID=$!
    cd ../..
    sleep 3
    
    # 检查后端是否启动成功
    if curl -s http://localhost:8787/api/health > /dev/null; then
        echo -e "${GREEN}✅ 后端启动成功: http://localhost:8787${NC}"
    else
        echo -e "${RED}⚠️  后端启动可能失败，请检查日志${NC}"
    fi
}

# 启动前端
start_frontend() {
    echo -e "${YELLOW}🎨 启动前端应用...${NC}"
    npm run dev &
    FRONTEND_PID=$!
    sleep 5
    echo -e "${GREEN}✅ 前端启动成功: http://localhost:3000${NC}"
}

# 数据库管理
manage_database() {
    echo -e "${BLUE}数据库管理菜单：${NC}"
    echo "1) 查看所有评估"
    echo "2) 查看用户列表"
    echo "3) 清空评估数据"
    echo "4) 返回主菜单"
    read -p "请选择 [1-4]: " db_choice
    
    case $db_choice in
        1)
            echo -e "${YELLOW}查询评估记录...${NC}"
            npx wrangler d1 execute zhiji-db --local --command="SELECT id, project_name, status, total_score FROM evaluations ORDER BY created_at DESC"
            ;;
        2)
            echo -e "${YELLOW}查询用户列表...${NC}"
            npx wrangler d1 execute zhiji-db --local --command="SELECT * FROM users"
            ;;
        3)
            read -p "确定要清空所有评估数据吗？(y/n): " confirm
            if [ "$confirm" = "y" ]; then
                npx wrangler d1 execute zhiji-db --local --command="DELETE FROM evaluation_metrics"
                npx wrangler d1 execute zhiji-db --local --command="DELETE FROM evaluations"
                echo -e "${GREEN}✅ 评估数据已清空${NC}"
            fi
            ;;
        4)
            return
            ;;
    esac
    
    echo ""
    read -p "按回车键继续..."
    manage_database
}

# 主流程
main() {
    # 安装依赖
    install_deps
    
    # 显示菜单
    show_menu
    
    case $choice in
        1)
            # 完整启动
            start_backend
            start_frontend
            
            echo ""
            echo -e "${GREEN}================================${NC}"
            echo -e "${GREEN}✨ 所有服务已启动！${NC}"
            echo -e "${GREEN}================================${NC}"
            echo -e "📱 前端: ${BLUE}http://localhost:3000${NC}"
            echo -e "🔌 API: ${BLUE}http://localhost:8787${NC}"
            echo -e "${GREEN}================================${NC}"
            echo ""
            echo -e "${YELLOW}提示: 按 Ctrl+C 停止所有服务${NC}"
            
            # 等待中断
            wait
            ;;
            
        2)
            # 仅前端
            start_frontend
            echo -e "${YELLOW}提示: 按 Ctrl+C 停止服务${NC}"
            wait
            ;;
            
        3)
            # 仅后端
            start_backend
            echo -e "${YELLOW}提示: 按 Ctrl+C 停止服务${NC}"
            wait
            ;;
            
        4)
            # 数据库管理
            manage_database
            main
            ;;
            
        5)
            echo -e "${GREEN}再见！${NC}"
            exit 0
            ;;
            
        *)
            echo -e "${RED}无效选项${NC}"
            main
            ;;
    esac
}

# 运行主程序
main