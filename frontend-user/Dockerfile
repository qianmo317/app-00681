# Build stage
# 使用跨平台的 alpine 镜像，支持 ARM 和 X86
FROM node:20-alpine AS build-stage
WORKDIR /app

# 设置 npm 镜像源以加速安装（可选，根据网络环境）
RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine as production-stage

# 从构建阶段复制构建产物
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制自定义 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
