@echo off
echo 正在导入文章到数据库...
echo.

curl -X POST http://localhost:4321/api/admin/articles/import ^
  -H "Cookie: admin_auth=true" ^
  -F "file=@articles-import.json"

echo.
echo 导入完成！
pause
