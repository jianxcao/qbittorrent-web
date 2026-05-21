FROM node:23-alpine AS node_builder
WORKDIR /build


# 先复制依赖相关文件，利用Docker缓存层
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# RUN npm config set registry https://registry.npmmirror.com/
RUN npm install -g pnpm

# 强制重新安装所有依赖，确保构建环境的一致性
RUN pnpm install --ignore-scripts=false --force

# 可选的更严格选项（根据需要启用）：
# RUN pnpm install --force --frozen-lockfile --no-optional
# RUN pnpm install --force --ignore-scripts  # 如果需要跳过构建脚本

# 复制源代码（.dockerignore 会自动忽略 node_modules 等目录）
COPY ./ ./

RUN pnpm build


# 创建运行镜像
FROM nginx:stable-alpine

ENV PUID=0 \
  PGID=0 \
  UMASK=000 \
  PORT=7633 \
  BACKEND_URL=http://localhost:9091


RUN mkdir -p /app/static
COPY --from=node_builder /build/dist /app/static


RUN mkdir -p /app
RUN mkdir -p /config

# 复制 nginx 配置模板文件
COPY ./nginx.conf /app/nginx.conf.template

# 将 entrypoint.sh 复制到镜像中
COPY ./entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
RUN chmod -R 0777 /app/*
ENTRYPOINT ["/app/entrypoint.sh"]

# 注意：EXPOSE 不支持环境变量，这里使用默认端口，实际端口由 PORT 环境变量控制
EXPOSE 7633
