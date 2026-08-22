# syntax=docker/dockerfile:1

# ===================== 阶段 1：安装依赖 =====================
FROM node:22-slim AS deps
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@10.16.1

COPY package.json pnpm-lock.yaml .npmrc pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

# ===================== 阶段 2：构建 =====================
FROM node:22-slim AS build
WORKDIR /app

RUN npm install -g pnpm@10.16.1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG VITE_BASE_URL=/api
ENV VITE_BASE_URL=${VITE_BASE_URL}

RUN pnpm build

# ===================== 阶段 3：运行 =====================
FROM node:22-slim AS runtime
WORKDIR /app

# 安装curl用于健康检查
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000
ENV NITRO_HOST=0.0.0.0

# 拷贝构建产物 + package.json
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./package.json

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/bill/list || exit 1

CMD ["node", ".output/server/index.mjs"]
