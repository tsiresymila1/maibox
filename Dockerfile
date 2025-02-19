FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --prefer-offline --no-progress

# Copy source code
COPY . .

# Generate Prisma client
RUN yarn prisma generate && rm -rf node_modules/.prisma/cache

# Build the Next.js app
RUN yarn build

# Reduce build cache size
RUN yarn cache clean && rm -rf /tmp/*

# Production image
FROM node:22-alpine AS runner

WORKDIR /app

# Install only production dependencies
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production --prefer-offline --no-progress && \
    yarn cache clean && \
    rm -rf /root/.cache/yarn /usr/local/share/.cache/yarn

# Copy necessary files from the builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./

# Expose ports
EXPOSE 1025 1080

# Start the app
CMD ["sh", "-c", "yarn start"]
