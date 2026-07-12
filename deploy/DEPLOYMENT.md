# MuseCrea 部署指南

## 前置条件

1. 阿里云 ECS 服务器（推荐配置：2核4G，Ubuntu 20.04/22.04）
2. 域名 `musecrea.shangmoves.design` 已解析到服务器 IP
3. SSH 访问权限

## 快速部署步骤

### 1. 服务器初始化

SSH 登录服务器后，执行以下命令安装 Docker：

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 将当前用户加入 docker 组（免 sudo）
sudo usermod -aG docker $USER
newgrp docker
```

### 2. 上传项目文件

在本地执行（将 `YOUR_SERVER_IP` 替换为服务器 IP）：

```bash
# 压缩项目文件（排除不必要的文件）
tar --exclude='node_modules' --exclude='.git' --exclude='venv' --exclude='__pycache__' -czf musecrea.tar.gz .

# 上传到服务器
scp musecrea.tar.gz root@YOUR_SERVER_IP:/root/

# SSH 登录服务器
ssh root@YOUR_SERVER_IP

# 解压项目
mkdir -p /opt/musecrea
cd /opt/musecrea
tar -xzf /root/musecrea.tar.gz
```

### 3. 配置环境变量

```bash
cd /opt/musecrea/backend

# 创建 .env 文件
cat > .env << EOF
# 数据库配置
DATABASE_URL=sqlite:///./musecrea.db

# SMTP 邮件配置
SMTP_SERVER=smtp.qq.com
SMTP_PORT=465
SMTP_USERNAME=your_email@qq.com
SMTP_PASSWORD=your_smtp_password

# DashScope API（通义千问）
DASHSCOPE_API_KEY=your_dashscope_api_key

# 管理员邮箱
ADMIN_EMAIL=chenghui2050@qq.com
EOF

# 编辑 .env 填入真实值
nano .env
```

### 4. 配置域名解析

在你的域名服务商（Adobe Portfolio 或域名注册商）添加 DNS 记录：

```
类型: A 记录
主机记录: musecrea
记录值: YOUR_SERVER_IP
TTL: 600
```

### 5. 启动服务

```bash
cd /opt/musecrea/deploy

# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 检查状态
docker-compose ps
```

此时应该可以通过 `http://musecrea.shangmoves.design` 访问（HTTP）。

### 6. 配置 SSL（HTTPS）

```bash
# 获取 SSL 证书
docker-compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email your_email@example.com \
  --agree-tos \
  --no-eff-email \
  -d musecrea.shangmoves.design

# 编辑 nginx.conf，取消 HTTPS server 块的注释
nano nginx.conf

# 重启 nginx
docker-compose restart nginx
```

### 7. 配置自动续期证书

证书会自动续期（certbot 容器已配置），但可以手动测试：

```bash
docker-compose run --rm certbot renew
```

## 常用命令

```bash
# 查看日志
docker-compose logs -f backend
docker-compose logs -f nginx

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新代码后重新部署
cd /opt/musecrea
git pull  # 或用 scp 上传新文件
cd deploy
docker-compose up -d --build

# 备份数据库
cp /opt/musecrea/backend/musecrea.db /opt/musecrea/backend/musecrea.db.backup.$(date +%Y%m%d)
```

## 故障排查

### 端口被占用
```bash
# 查看占用端口的进程
sudo lsof -i :80
sudo lsof -i :443

# 杀掉进程
sudo kill -9 <PID>
```

### Docker 容器启动失败
```bash
# 查看详细日志
docker-compose logs backend
docker-compose logs nginx

# 进入容器调试
docker-compose exec backend /bin/bash
docker-compose exec nginx /bin/sh
```

### 数据库权限问题
```bash
# 确保数据库文件可写
chmod 664 /opt/musecrea/backend/musecrea.db
chown www-data:www-data /opt/musecrea/backend/musecrea.db
```

## 更新部署

```bash
# 1. 上传新代码
scp -r ./frontend root@YOUR_SERVER_IP:/opt/musecrea/
scp -r ./backend root@YOUR_SERVER_IP:/opt/musecrea/

# 2. 重启服务
ssh root@YOUR_SERVER_IP
cd /opt/musecrea/deploy
docker-compose up -d --build

# 3. 清除浏览器缓存（用户端）
# 前端版本号已在 index.html 中管理（?v=XX）
```

## 监控

```bash
# 查看资源使用
docker stats

# 查看磁盘空间
df -h

# 查看内存
free -h
```

## 安全建议

1. 配置防火墙只开放 22、80、443 端口
2. 定期更新系统和 Docker 镜像
3. 定期备份数据库
4. 使用强密码和 SSH 密钥认证
5. 考虑配置 fail2ban 防止暴力破解
