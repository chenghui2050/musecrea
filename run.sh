#!/bin/bash
echo "============================================"
echo "  MuseCrea - 文创产品创意评价系统"
echo "============================================"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "[错误] 未检测到 Python3，请先安装"
    exit 1
fi

# Install deps
echo "[1/3] 安装依赖..."
cd backend
pip3 install -r requirements.txt -q
cd ..

# Create dirs
echo "[2/3] 初始化目录..."
mkdir -p uploads/images uploads/reports

# Start
echo "[3/3] 启动服务..."
echo ""
echo "============================================"
echo "  访问地址: http://localhost:8000"
echo "  按 Ctrl+C 停止"
echo "============================================"
echo ""

cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
