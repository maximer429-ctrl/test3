FROM node:20-alpine

# Install development tools
RUN apk add --no-cache git bash

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (if package.json exists)
RUN if [ -f package.json ]; then npm install; fi

# Copy application files
COPY . .

# Expose port for web server
EXPOSE 8080

# Default command - start a simple HTTP server
CMD ["npx", "http-server", ".", "-p", "8080", "-c-1"]
