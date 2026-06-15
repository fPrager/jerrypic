# syntax=docker/dockerfile:1

# --- build stage: install all deps and compile TS -> dist/ ---
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY .yarnrc.yml package.json yarn.lock ./
RUN yarn install --immutable
COPY tsconfig.json ./
COPY src ./src
RUN yarn build

# --- deps stage: production-only node_modules ---
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY .yarnrc.yml package.json yarn.lock ./
RUN yarn workspaces focus --production

# --- runtime stage: slim image, just node + express + dist ---
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/data
COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
