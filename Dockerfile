# syntax=docker/dockerfile:1
FROM node:24.19.0-bookworm-slim AS build
WORKDIR /app
COPY game/package.json game/pnpm-lock.yaml ./
RUN npm install --global pnpm@11.19.0 && pnpm install --frozen-lockfile
COPY game/tsconfig.json ./
COPY game/scripts/check.mjs ./scripts/check.mjs
COPY game/src ./src
COPY game/tests ./tests
COPY game/public ./public
COPY docs/signal-foundry-validation.json /docs/signal-foundry-validation.json
RUN pnpm test
RUN pnpm prune --prod

FROM node:24.19.0-bookworm-slim AS runtime
ARG VCS_REF=unknown
LABEL org.opencontainers.image.title="Signal Foundry" \
      org.opencontainers.image.version="1.1.0" \
      org.opencontainers.image.revision=$VCS_REF \
      org.opencontainers.image.source="https://github.com/LucasLee1234/Multi-Player-Game-with-AI"
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 GAME_MODE=foundry
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist/src ./dist/src
COPY --chown=node:node game/public ./public
COPY --chown=node:node LICENSE THIRD_PARTY_NOTICES.md ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/health/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/src/server/main.js"]
