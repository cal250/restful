FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json backend/
RUN npm install
COPY backend backend
RUN npm run prisma:generate --workspace backend && npm run build --workspace backend

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/package.json ./backend/package.json
COPY --from=build /app/backend/prisma ./backend/prisma
CMD ["node", "backend/dist/src/server.js"]
