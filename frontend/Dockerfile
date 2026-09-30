FROM oven/bun:1.3-slim AS base
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS dev
COPY . .
EXPOSE 5173
CMD ["bun", "run", "dev"]

FROM base AS build
ARG VITE_API_URL
ARG VITE_URL
COPY . .
RUN bun run build

FROM node:22.19-alpine AS prod
RUN npm install -g serve@14
COPY --from=build /app/dist /app
USER node
EXPOSE 3000
CMD ["serve", "/app", "-l", "3000"]
