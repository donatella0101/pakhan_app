# 1. Сборка фронтенда
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 2. Сборка TypeScript бэкенда
FROM node:20-slim AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# 3. Финальный легковесный образ
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV DATA_DIR=/app/data
ENV FRONTEND_DIST=/app/frontend/dist

# Установка продакшен зависимостей бэкенда
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Копирование скомпилированного бэкенда и фронтенда
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Папка для постоянной базы SQLite
RUN mkdir -p /app/data

EXPOSE 3001

CMD ["node", "backend/dist/server.js"]
