FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

FROM base AS builder
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/
RUN pnpm install --frozen-lockfile --filter backend...
COPY backend/ ./backend/
COPY shared/ ./shared/
WORKDIR /app/backend
RUN npx prisma generate
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/
RUN pnpm install --frozen-lockfile --prod --filter backend...
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/prisma.config.ts ./backend/prisma.config.ts

EXPOSE 4000
WORKDIR /app/backend
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
