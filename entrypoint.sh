#!/bin/sh

# 设置默认端口（如果未设置）
PORT=${PORT:-7632}
# 设置默认后端URL（如果未设置）
BACKEND_URL=${BACKEND_URL:-http://localhost:9091}

# 使用 envsubst 替换环境变量并生成最终的 nginx 配置文件
echo "生成 nginx 配置文件..."
envsubst '${PORT} ${BACKEND_URL}' < /app/nginx.conf.template > /etc/nginx/nginx.conf

# 测试 nginx 配置
echo "测试 nginx 配置..."
nginx -t

if [ $? -ne 0 ]; then
    echo "nginx 配置错误"
    exit 1
fi

echo "启动 nginx 服务..."
echo "静态文件目录: /app/static"
echo "监听端口: $PORT"
echo "后端URL: $BACKEND_URL"
echo "nginx 配置文件: /etc/nginx/nginx.conf"
# 启动 nginx（前台运行）
exec nginx -g "daemon off;"
