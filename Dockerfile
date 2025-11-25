FROM node:20-alpine AS builder

# Build arguments for public env vars
ARG PUBLIC_WS_SERVER
ARG PUBLIC_BLUESKY_DID
ARG PUBLIC_TURNSTILE_KEY

# Build arguments for private env vars
ARG CONTACT_EMAIL
ARG FROM_EMAIL
ARG SENDGRID_API_KEY
ARG TURNSTILE_SECRET

# Set as environment variables for build
ENV PUBLIC_WS_SERVER=$PUBLIC_WS_SERVER
ENV PUBLIC_BLUESKY_DID=$PUBLIC_BLUESKY_DID
ENV PUBLIC_TURNSTILE_KEY=$PUBLIC_TURNSTILE_KEY
ENV CONTACT_EMAIL=$CONTACT_EMAIL
ENV FROM_EMAIL=$FROM_EMAIL
ENV SENDGRID_API_KEY=$SENDGRID_API_KEY
ENV TURNSTILE_SECRET=$TURNSTILE_SECRET

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Run svelte-kit sync to generate types
RUN pnpm exec svelte-kit sync

# Build the app
RUN pnpm build

# Production stage
FROM node:20-alpine

# Runtime environment variables (private vars needed at runtime)
ARG CONTACT_EMAIL
ARG FROM_EMAIL
ARG SENDGRID_API_KEY
ARG TURNSTILE_SECRET

ENV CONTACT_EMAIL=$CONTACT_EMAIL
ENV FROM_EMAIL=$FROM_EMAIL
ENV SENDGRID_API_KEY=$SENDGRID_API_KEY
ENV TURNSTILE_SECRET=$TURNSTILE_SECRET

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built app from builder
COPY --from=builder /app/build ./build

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "build"]
