FROM oven/bun:1.3-slim AS base
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS dev
COPY . .
EXPOSE 8080
CMD ["bun", "run", "dev"]

FROM base AS prod
COPY . .
RUN bun run warm
USER bun
EXPOSE 8080
CMD ["bun", "src/main.ts"]
