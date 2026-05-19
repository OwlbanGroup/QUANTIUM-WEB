# Quantium Docker Image
# Quantium Internet & Web of Things

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY bin/ bin/
COPY quantium-core/ quantium-core/
COPY quantium-net/ quantium-net/
COPY web-of-things/ web-of-things/
COPY server/ server/

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('net').connect(3000, 'localhost', () => process.exit(0)).on('error', () => process.exit(1))"

# Start command
CMD ["node", "server/index.js"]

# Labels
LABEL maintainer="Quantium Project" \
      version="1.0.0" \
      description="Quantium Internet & Web of Things - A next-generation distributed network protocol"
