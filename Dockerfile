FROM nginx:stable-alpine

ENV PUID=0 \
  PGID=0 \
  UMASK=000 \
  PORT=7633 \
  BACKEND_URL=http://localhost:9091

RUN mkdir -p /app/static /app /config

# 复制已构建好的静态资源
COPY ./dist /app/static

# 复制 nginx 配置模板与 entrypoint
COPY ./nginx.conf /app/nginx.conf.template
COPY ./entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh && chmod -R 0777 /app/*

ENTRYPOINT ["/app/entrypoint.sh"]

# 默认端口
EXPOSE 7633
