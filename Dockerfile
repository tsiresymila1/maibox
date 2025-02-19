FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install --frozen-lockfile

# Copy the entire app
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js app
RUN yarn build

# Production image
FROM node:22-alpine AS runner
WORKDIR /app

# Install only production dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

# Copy necessary files from the builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./



# Expose ports
EXPOSE  1025 1080

# Start the app and SMTP server
CMD ["sh", "-c", "yarn start"]
