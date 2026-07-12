#!/bin/bash

# MuseCrea 快速部署脚本
# 在服务器上执行此脚本以自动完成部署

set -e

echo "=== MuseCrea 部署脚本 ==="

# 检查是否以 root 运行
if [ "$EUID" -ne 0 ]; then
  echo "请使用 root 用户或 sudo 执行此脚本"
  exit 1
fi

# 更新系统
echo "[1/6] 更新系统..."
apt update && apt upgrade -y

# 安装 Docker（如果未安装）
if ! command -v docker &> /dev/null; then
    echo "[2/6] 安装 Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
else
    echo "[2/6] Docker 已安装，跳过"
fi

# 安装 Docker Compose（如果未安装）
if ! command -v docker-compose &> /dev/null; then
    echo "[3/6] 安装 Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo "[3/6] Docker Compose 已安装，跳过"
fi

# 创建项目目录
echo "[4/6] 创建项目目录..."
mkdir -p /opt/musecrea
cd /opt/musecrea

# 检查项目文件是否存在
if [ ! -f "backend/main.py" ]; then
    echo ""
    echo "⚠️  请将项目文件上传到 /opt/musecrea 目录"
    echo "   在本地执行："
    echo "   scp musecrea.tar.gz root@YOUR_SERVER_IP:/opt/musecrea/"
    echo "   ssh root@YOUR_SERVER_IP"
    echo "   cd /opt/musecrea && tar -xzf musecrea.tar.gz"
    echo ""
    echo "上传完成后，重新运行此脚本"
    exit 1
fi

# 创建 .env 文件（如果不存在）
if [ ! -f "backend/.env" ]; then
    echo "[5/6] 创建 .env 配置文件..."
    cat > backend/.env << 'EOF'
# 数据库配置
DATABASE_URL=sqlite:///./musecrea.db

# SMTP 邮件配置（QQ邮箱）
SMTP_SERVER=smtp.qq.com
SMTP_PORT=465
SMTP_USERNAME=your_email@qq.com
SMTP_PASSWORD=your_smtp_authorization_code

# DashScope API（通义千问）
DASHSCOPE_API_KEY=your_dashscope_api_key

# 管理员邮箱
ADMIN_EMAIL=chenghui2050@qq.com
EOF
    echo ""
    echo "⚠️  请编辑 /opt/musecrea/backend/.env 填入真实配置"
    echo "   nano /opt/musecrea/backend/.env"
    echo ""
    read -p "编辑完成后按 Enter 继续..."
fi

# 启动服务
echo "[6/6] 启动服务..."
cd /opt/musecrea/deploy
docker-compose up -d --build

echo ""
echo "=== 部署完成 ==="
echo ""
echo "访问地址: http://musecrea.shangmoves.design"
echo ""
echo "常用命令:"
echo "  查看日志: docker-compose logs -f"
echo "  重启服务: docker-compose restart"
echo "  停止服务: docker-compose down"
echo ""
echo "下一步: 配置 SSL 证书（可选）"
echo "  docker-compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot -d musecrea.shangmoves.design"
echo ""
