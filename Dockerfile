FROM node:22-alpine AS builder

WORKDIR /app

# Install OpenSSL again in the runner stage
RUN apk add --no-cache openssl

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --prefer-offline --no-progress

# Copy source code
COPY . .

# Manually install Prisma CLI (in case it's missing)
RUN yarn global add prisma

# Generate Prisma client
RUN yarn prisma generate && yarn prisma migrate deploy && rm -rf node_modules/.prisma/cache

# Build the Next.js app
RUN yarn build

# Remove Yarn cache to free space
RUN yarn cache clean && rm -rf /root/.cache/yarn /usr/local/share/.cache/yarn /tmp/*

# Production image
FROM node:22-alpine AS runner

WORKDIR /app

# Install OpenSSL again in the runner stage
RUN apk add --no-cache openssl

# Install only production dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production --prefer-offline --no-progress && \
    yarn cache clean && \
    rm -rf /root/.cache/yarn /usr/local/share/.cache/yarn /tmp/*

# Copy necessary files from the builder
COPY . .
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma/dev.db ./prisma/dev.db
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./

# Expose ports
EXPOSE 1025 1080


# Start the app
CMD ["sh", "-c", "yarn start"]
