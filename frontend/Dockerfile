FROM node:22.19-bullseye AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

FROM base AS build
ARG VITE_API_URL
ARG VITE_URL
COPY . .
RUN npm run build

FROM node:22.19-alpine AS prod
RUN npm install -g serve@14
COPY --from=build /app/dist /app
USER node
EXPOSE 3000
CMD ["serve", "-s", "/app", "-l", "3000"]
