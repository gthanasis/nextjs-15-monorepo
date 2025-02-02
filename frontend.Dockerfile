# Base stage
FROM node:20-alpine AS base

RUN apk update && apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Install Turbo globally
RUN yarn global add turbo@^2

# Builder stage
FROM base AS builder

WORKDIR /app

# Copy the repository files
COPY . .

# Generate a partial monorepo with a pruned lockfile for the target workspace
RUN turbo prune --scope=frontend --docker

# Installer stage
FROM base AS installer

WORKDIR /app

# Copy pruned workspace files
COPY --from=builder /app/out/json/ .

# Install dependencies for the workspace
RUN yarn install --frozen-lockfile

# Copy the full workspace for build
COPY --from=builder /app/out/full/ .

# Set build time environment variables
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_LOG_LEVEL
ARG NEXT_PUBLIC_GTM_ID

# Set environment variables
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL \
    NEXT_PUBLIC_LOG_LEVEL=$NEXT_PUBLIC_LOG_LEVEL \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
    NEXT_PUBLIC_VAPID_PUBLIC_KEY=$NEXT_PUBLIC_VAPID_PUBLIC_KEY \
    NEXT_PUBLIC_GTM_ID=$NEXT_PUBLIC_GTM_ID

# Build the target workspace
RUN yarn turbo run build --filter=frontend...

## Runner stage
FROM base AS runner

WORKDIR /app

# Create a non-root user for running the application
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

## Copy the built files for the workspace
COPY --from=installer --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static

# Define the default command
CMD ["node", "/app/frontend/server.js"]


