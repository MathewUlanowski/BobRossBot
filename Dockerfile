# Builder stage: install dev deps, build, then prune dev dependencies
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies (use npm ci for reproducible builds)
COPY package*.json ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build && npm prune --production --silent

# Final stage: small runtime image, run as non-root
FROM node:18-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy only what's needed for runtime
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Ensure files are owned by the Node user and run non-root
RUN chown -R node:node /app
USER node

EXPOSE 3000

# Lightweight healthcheck using the bundled node binary
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s CMD node -e "require('http').get('http://127.0.0.1:3000/health',res=>{process.exit(res.statusCode===200?0:1)}).on('error',()=>process.exit(1))"

# Use the compiled entrypoint for faster startup
CMD ["node", "dist/index.js"]