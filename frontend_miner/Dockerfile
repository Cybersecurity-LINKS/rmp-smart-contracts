FROM node:18-alpine AS builder

WORKDIR /app

#COPY sdk ./sdk

COPY frontend_miner ./frontend_miner/

WORKDIR /app/frontend_miner

# Build arg to invalidate cache when needed
ARG CACHEBUST=1

RUN npm install

RUN npm run build --force

# Production stage
FROM nginx:alpine
# Copy build files
COPY --from=builder /app/frontend_miner/dist /usr/share/nginx/html

# Copy nginx configuration files
COPY frontend_miner/nginx.conf /etc/nginx/nginx.conf

# Copia il template nella directory corretta
COPY frontend_miner/default.conf.template /etc/nginx/templates/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


