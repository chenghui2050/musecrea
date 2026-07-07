@echo off
chcp 65001 >nul
echo ============================================
echo   MuseCrea - 文创产品创意评价系统
echo ============================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Python，请先安装 Python 3.10+
    pause
    exit /b 1
)

REM Install dependencies
echo [1/3] 正在安装依赖...
cd backend
pip install -r requirements.txt -q
if errorlevel 1 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)

REM Create directories
echo [2/3] 初始化目录...
cd ..
if not exist "uploads\images" mkdir "uploads\images"
if not exist "uploads\reports" mkdir "uploads\reports"

REM Start server
echo [3/3] 启动服务...
echo.
echo ============================================
echo   服务已启动！
echo   访问地址: http://localhost:8000
echo   按 Ctrl+C 停止服务
echo ============================================
echo.

cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
