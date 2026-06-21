# =============================================================================
# Stage 1: builder
# Install all dependencies (including devDependencies) and compile TypeScript
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy only package files first — npm install layer is cached as long as
# package.json/package-lock.json don't change (TypeScript files are irrelevant here)
COPY package*.json ./

RUN npm ci

# Copy source code and compile
COPY . .

RUN npm run build

# =============================================================================
# Stage 2: production
# Lean image — only compiled JS + production dependencies
# =============================================================================
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/main"]
