#!/bin/bash

# Production Deployment Script for Diagnostic Backend
echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}PM2 is not installed. Installing PM2...${NC}"
    npm install -g pm2
fi

# Create necessary directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p logs
mkdir -p pids
mkdir -p uploads/{profiles,covers,attachments,temp}

# Set proper permissions for SSL certificates
echo -e "${YELLOW}Setting SSL certificate permissions...${NC}"
chmod 600 ssl/server-prod.key
chmod 644 ssl/server-prod.crt

# Verify SSL certificates
echo -e "${YELLOW}Verifying SSL certificates...${NC}"
if openssl x509 -in ssl/server-prod.crt -text -noout > /dev/null 2>&1; then
    echo -e "${GREEN}✅ SSL certificate is valid${NC}"
else
    echo -e "${RED}❌ SSL certificate is invalid${NC}"
    exit 1
fi

# Install production dependencies
echo -e "${YELLOW}Installing production dependencies...${NC}"
npm install --production

# Stop existing PM2 processes
echo -e "${YELLOW}Stopping existing processes...${NC}"
pm2 stop diagnostic-backend 2>/dev/null || true

# Start application in production mode
echo -e "${YELLOW}Starting application in production mode...${NC}"
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
echo -e "${YELLOW}Saving PM2 configuration...${NC}"
pm2 save

# Setup PM2 startup script
echo -e "${YELLOW}Setting up PM2 startup script...${NC}"
pm2 startup

# Show status
echo -e "${GREEN}🎉 Production deployment completed!${NC}"
echo -e "${GREEN}Server Status:${NC}"
pm2 status

echo -e "${GREEN}Server URLs:${NC}"
echo -e "${GREEN}HTTP:  http://46.202.168.1:4000${NC}"
echo -e "${GREEN}HTTPS: https://46.202.168.1:4443${NC}"

echo -e "${YELLOW}To monitor logs: pm2 logs diagnostic-backend${NC}"
echo -e "${YELLOW}To restart: pm2 restart diagnostic-backend${NC}"
echo -e "${YELLOW}To stop: pm2 stop diagnostic-backend${NC}"
