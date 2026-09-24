FROM oven/bun:1.3-slim AS base
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS dev
COPY . .
EXPOSE 8080
CMD ["bun", "run", "dev"]

FROM base AS build
COPY . .
RUN bun run build

FROM gcr.io/distroless/base-debian12:nonroot AS prod
COPY --from=build /app/dist/server /server
EXPOSE 8080
CMD ["/server"]
