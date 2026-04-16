@echo off
chcp 65001 >nul
title G17 营销美术管理系统 - 局域网服务器
color 0A

echo.
echo  ╔════════════════════════════════════════╗
echo  ║   G17 营销美术管理系统 正在启动...    ║
echo  ╚════════════════════════════════════════╝
echo.

cd /d "%~dp0"
node server.js

echo.
echo 服务器已停止。按任意键退出...
pause >nul
