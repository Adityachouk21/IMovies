# Stage 1: Base image
FROM node:20-alpine AS base
WORKDIR /app

# Stage 2: Dependencies
FROM base AS dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 3: Production Runner
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

EXPOSE 5000
CMD ["node", "server.js"]
