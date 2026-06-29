FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN ["corepack", "enable"]
WORKDIR /app

FROM base AS installer
COPY package.json .
COPY pnpm-*.yaml .
RUN ["pnpm", "install", "--frozen-lockfile"]

FROM base AS builder
COPY --from=installer /app/node_modules ./node_modules
COPY . .
RUN ["pnpm", "build"]
RUN ["pnpm", "prune", "--prod"]

FROM base AS deploy
WORKDIR /app
ENV NODE_ENV=production
USER node
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

EXPOSE 7614
CMD ["node", "dist/main.js"]