# Step 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm install

# Copy source and config
COPY . .

# Generate Prisma client and build TS
RUN npx prisma generate
RUN npm run build

# Step 2: Production
FROM node:20-alpine

WORKDIR /app

# Ensure we only have production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy built files
COPY --from=builder /app/dist ./dist
# Re-copy the Prisma folder so migrations can be run if needed
COPY --from=builder /app/prisma ./prisma
# Copy the generated prisma client from node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Expose server port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
