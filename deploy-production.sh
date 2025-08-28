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

# Install system dependencies for Sharp on Ubuntu
echo -e "${YELLOW}Installing system dependencies for Sharp...${NC}"
if command -v apt-get &> /dev/null; then
    # Update package list
    apt-get update -qq
    
    # Install required packages for Sharp/libvips
    apt-get install -y -qq libvips-dev libvips42 pkg-config
    
    echo -e "${GREEN}✅ System dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  apt-get not found, skipping system dependency installation${NC}"
fi

# Create necessary directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p logs
mkdir -p pids
mkdir -p uploads/{profiles,covers,attachments,temp}

# Check and generate SSL certificates if needed
echo -e "${YELLOW}Checking SSL certificates...${NC}"
if [ ! -f "ssl/server-prod.key" ] || [ ! -f "ssl/server-prod.crt" ]; then
    echo -e "${YELLOW}⚠️  SSL certificates not found. Generating self-signed certificates...${NC}"
    
    # Make sure the SSL generation script is executable
    chmod +x generate-ssl-cert.sh
    
    # Generate SSL certificates
    ./generate-ssl-cert.sh
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ SSL certificates generated successfully${NC}"
    else
        echo -e "${RED}❌ Failed to generate SSL certificates${NC}"
        exit 1
    fi
else
    # Verify existing SSL certificates
    echo -e "${YELLOW}Verifying existing SSL certificates...${NC}"
    if openssl x509 -in ssl/server-prod.crt -text -noout > /dev/null 2>&1; then
        echo -e "${GREEN}✅ SSL certificate is valid${NC}"
        
        # Check if certificate is expiring soon (within 30 days)
        if openssl x509 -checkend 2592000 -noout -in ssl/server-prod.crt; then
            echo -e "${GREEN}✅ SSL certificate is not expiring soon${NC}"
        else
            echo -e "${YELLOW}⚠️  SSL certificate expires within 30 days${NC}"
            echo -e "${YELLOW}   Consider renewing with: sudo ./setup-letsencrypt.sh${NC}"
        fi
    else
        echo -e "${RED}❌ SSL certificate is invalid, regenerating...${NC}"
        ./generate-ssl-cert.sh
    fi
fi

# Install production dependencies
echo -e "${YELLOW}Installing production dependencies...${NC}"
npm install --production

# Fix Sharp for Ubuntu platform
echo -e "${YELLOW}Fixing Sharp for Ubuntu platform...${NC}"

# Remove existing Sharp installation
npm uninstall sharp

# Install Sharp with platform-specific options for Ubuntu
echo -e "${YELLOW}Installing Sharp for Linux platform...${NC}"
npm install --platform=linux --arch=x64 sharp

# Verify Sharp installation
echo -e "${YELLOW}Verifying Sharp installation...${NC}"
if node -e "require('sharp'); console.log('Sharp loaded successfully');" 2>/dev/null; then
    echo -e "${GREEN}✅ Sharp installed and working correctly${NC}"
else
    echo -e "${RED}❌ Sharp installation failed, trying alternative method...${NC}"
    
    # Alternative installation method
    npm install --include=optional sharp
    
    if node -e "require('sharp'); console.log('Sharp loaded successfully');" 2>/dev/null; then
        echo -e "${GREEN}✅ Sharp installed successfully with alternative method${NC}"
    else
        echo -e "${RED}❌ Sharp installation failed completely${NC}"
        echo -e "${YELLOW}Continuing deployment without Sharp - image processing will be disabled${NC}"
    fi
fi

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
