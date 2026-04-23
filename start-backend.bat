@echo off
echo Starting PHP Backend Server on http://127.0.0.1:8000
cd /d "%~dp0backend\public"
php -S 127.0.0.1:8000
