# syntax=docker/dockerfile:1

# ===================== 阶段 1：安装依赖 =====================
FROM node:22-slim AS deps
WORKDIR /app

# 安装 pnpm（版本与 pnpm-lock.yaml 保持一致，保证可复现构建）
RUN npm install -g pnpm@10.16.1

# 先只复制依赖清单，充分利用 Docker 层缓存
COPY package.json pnpm-lock.yaml .npmrc pnpm-workspace.yaml ./

# 按锁文件精确安装依赖
RUN pnpm install --frozen-lockfile

# ===================== 阶段 2：构建 =====================
FROM node:22-slim AS build
WORKDIR /app

RUN npm install -g pnpm@10.16.1

# 复用上一阶段装好的依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 前端构建所需环境变量（默认 /api，可用 --build-arg 覆盖）
ARG VITE_BASE_URL=/api
ENV VITE_BASE_URL=${VITE_BASE_URL}

# 构建前端 + Nitro 后端，产物输出到 .output
RUN pnpm build

# ===================== 阶段 3：运行 =====================
FROM node:22-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# 只复制构建产物（前端静态资源 public + 后端 server）
COPY --from=build /app/.output ./.output

# 以非 root 用户运行，降低安全风险
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/bill/list').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", ".output/server/index.mjs"]
