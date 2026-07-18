FROM node:20-alpine AS client-build
WORKDIR /build/client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

FROM node:20-alpine AS server-build
WORKDIR /build/server
COPY server/package*.json ./
RUN npm ci
COPY server/ .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app

COPY --from=server-build /build/server/dist ./dist
COPY --from=server-build /build/server/node_modules ./node_modules
COPY --from=server-build /build/server/prisma ./prisma
COPY --from=client-build /build/client/dist ./public

ENV NODE_ENV=production

EXPOSE ${PORT}

CMD ["node", "dist/index.js"]
