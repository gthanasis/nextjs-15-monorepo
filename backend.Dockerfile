# Base stage
FROM node:20-alpine AS base

RUN apk update && apk add --no-cache libc6-compat

# Define arguments for build context
ARG BUILD_CONTEXT
ENV WORKSPACE=$BUILD_CONTEXT

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
RUN turbo prune --scope=$WORKSPACE --docker

# Installer stage
FROM base AS installer

WORKDIR /app

# Copy pruned workspace files
COPY --from=builder /app/out/json/ .

# Install dependencies for the workspace
RUN yarn install --frozen-lockfile

# Copy the full workspace for build
COPY --from=builder /app/out/full/ .

# Build the target workspace
RUN yarn turbo run build --filter=$WORKSPACE...

# Runner stage
FROM base AS runner

WORKDIR /app

# Create a non-root user for running the application
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 $WORKSPACE
USER $WORKSPACE

COPY --from=installer --chown=$WORKSPACE:nodejs /app ./app

# Define the default command
CMD sh -c "node app/microservices/${WORKSPACE}/dist/index.js"
