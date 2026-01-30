# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies (including dev deps for build)
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build --silent

# Production image
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy package files and install only production deps
COPY package.json package-lock.json* ./
RUN npm ci --only=production --silent

# Copy built files
COPY --from=builder /app/dist ./dist

# Expose port used by Cloud Run
ENV PORT=8080
EXPOSE 8080

# Start the compiled app
CMD ["node", "dist/server.js"]
