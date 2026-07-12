# MuseCrea Railway 部署指南

## 前置条件

1. 注册 Railway 账号：https://railway.app
2. 安装 Railway CLI（可选）：`npm install -g @railway/cli`
3. 域名 `musecrea.shangmoves.design` 的管理权限

## 部署步骤

### 1. 初始化 Git 仓库（如果还没有）

```bash
cd D:\MuseCrea
git init
git add .
git commit -m "Initial commit for Railway deployment"
```

### 2. 推送到 GitHub

```bash
# 在 GitHub 创建新仓库：musecrea
git remote add origin https://github.com/YOUR_USERNAME/musecrea.git
git branch -M main
git push -u origin main
```

### 3. 在 Railway 创建项目

1. 登录 https://railway.app
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择 `musecrea` 仓库
5. Railway 会自动开始部署

### 4. 配置环境变量

在 Railway 项目设置中，点击 "Variables" 添加：

```
SMTP_SERVER=smtp.qq.com
SMTP_PORT=465
SMTP_USERNAME=your_email@qq.com
SMTP_PASSWORD=your_smtp_password
DASHSCOPE_API_KEY=your_dashscope_api_key
ADMIN_EMAIL=chenghui2050@qq.com
```

### 5. 配置域名

1. 在 Railway 项目设置 → "Networking" → "Public Networking"
2. 点击 "Generate Domain" 获取临时域名（如 `musecrea-production.up.railway.app`）
3. 或添加自定义域名：
   - 点击 "Add Domain"
   - 输入 `musecrea.shangmoves.design`
   - Railway 会显示 CNAME 记录

### 6. 配置 DNS

在你的域名服务商添加 CNAME 记录：

```
类型: CNAME
主机记录: musecrea
记录值: musecrea-production.up.railway.app（Railway 提供的值）
TTL: 600
```

### 7. 等待部署完成

- Railway 会自动构建和部署
- 首次部署约需 3-5 分钟
- 部署完成后访问 `https://musecrea.shangmoves.design`

## 常用操作

### 查看日志
- Railway 控制台 → 选择服务 → "Deployments" → 点击最新部署 → "View Logs"

### 重新部署
- 推送新代码到 GitHub，Railway 自动重新部署
- 或手动：Railway 控制台 → "Deployments" → "Redeploy"

### 更新环境变量
- Railway 控制台 → "Variables" → 编辑 → 保存
- 会自动触发重新部署

### 查看使用量
- Railway 控制台 → "Usage"
- 免费额度：每月 $5（约 500 小时）

## 故障排查

### 部署失败
- 查看部署日志，常见错误：
  - 缺少依赖：检查 `requirements.txt`
  - 端口错误：确保使用 `$PORT` 环境变量

### 网站无法访问
- 检查 Railway 控制台服务状态
- 检查 DNS 配置是否正确（用 `nslookup musecrea.shangmoves.design` 验证）
- 等待 DNS 生效（最长 48 小时，通常 10 分钟）

### 数据库问题
- Railway 使用 SQLite，数据存在容器内
- 重启后数据会丢失（需要配置持久化存储或切换 PostgreSQL）
- 如需持久化：Railway → "New" → "Database" → "Add PostgreSQL"

## 注意事项

1. **免费额度限制**：每月 $5，超出会暂停服务
2. **数据持久化**：SQLite 在重启后会丢失，建议后续迁移到 PostgreSQL
3. **SSL 证书**：Railway 自动提供，无需配置
4. **自动部署**：每次 push 到 main 分支都会自动部署

## 后续优化

如需数据持久化，可以：
1. 在 Railway 添加 PostgreSQL 数据库（免费额度内）
2. 修改 `DATABASE_URL` 环境变量
3. 运行数据库迁移脚本
