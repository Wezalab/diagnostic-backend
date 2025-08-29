#!/bin/bash

# Nginx Reverse Proxy Setup Script for Diagnostic Backend
echo "🌐 Setting up Nginx reverse proxy with SSL termination..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="46.202.168.1"
BACKEND_PORT="4000"
PROJECT_DIR="/var/www/diagnostic-backend"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ This script must be run as root (sudo)${NC}"
    echo -e "${YELLOW}   Run: sudo ./setup-nginx.sh${NC}"
    exit 1
fi

echo -e "${BLUE}1. Installing Nginx...${NC}"
# Update package list and install Nginx
apt-get update -qq
apt-get install -y nginx openssl

# Stop nginx to avoid conflicts during setup
systemctl stop nginx

echo -e "${BLUE}2. Creating project directory...${NC}"
# Create project directory
mkdir -p "$PROJECT_DIR"
mkdir -p "$PROJECT_DIR/uploads"
mkdir -p "/etc/nginx/ssl"

echo -e "${BLUE}3. Generating SSL certificates for Nginx...${NC}"
# Generate SSL certificate for Nginx
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "/etc/nginx/ssl/diagnostic-backend.key" \
    -out "/etc/nginx/ssl/diagnostic-backend.crt" \
    -subj "/C=US/ST=Production/L=Server/O=Diagnostic Backend/OU=Production Unit/CN=$SERVER_IP" \
    -extensions v3_req \
    -config <(cat <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = Production
L = Server
O = Diagnostic Backend
OU = Production Unit
CN = $SERVER_IP

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
IP.1 = $SERVER_IP
EOF
)

# Set proper permissions for SSL certificates
chmod 600 "/etc/nginx/ssl/diagnostic-backend.key"
chmod 644 "/etc/nginx/ssl/diagnostic-backend.crt"

echo -e "${BLUE}4. Configuring Nginx...${NC}"
# Copy nginx configuration
cp nginx/diagnostic-backend.conf /etc/nginx/sites-available/diagnostic-backend

# Create symlink to enable the site
ln -sf /etc/nginx/sites-available/diagnostic-backend /etc/nginx/sites-enabled/diagnostic-backend

# Remove default nginx site
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo -e "${BLUE}5. Testing Nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration error${NC}"
    nginx -t
    exit 1
fi

echo -e "${BLUE}6. Setting up firewall rules...${NC}"
# Configure UFW firewall (if available)
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo -e "${GREEN}✅ Firewall rules updated${NC}"
else
    echo -e "${YELLOW}⚠️  UFW not found, please configure firewall manually${NC}"
fi

echo -e "${BLUE}7. Starting Nginx...${NC}"
# Start and enable nginx
systemctl start nginx
systemctl enable nginx

# Check nginx status
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx started successfully${NC}"
else
    echo -e "${RED}❌ Failed to start Nginx${NC}"
    systemctl status nginx
    exit 1
fi

echo -e "${BLUE}8. Configuring backend for proxy mode...${NC}"
# Create a systemd override for the backend to disable HTTPS
mkdir -p /etc/systemd/system
cat > /etc/systemd/system/diagnostic-backend-proxy.service << EOF
[Unit]
Description=Diagnostic Backend (Proxy Mode)
After=network.target

[Service]
Type=forking
User=root
WorkingDirectory=$PROJECT_DIR
Environment=NODE_ENV=production
Environment=HTTP_PORT=4000
Environment=HTTPS_DISABLED=true
Environment=TRUST_PROXY=true
ExecStart=/usr/bin/pm2 start ecosystem.config.js --env production
ExecReload=/usr/bin/pm2 reload all
ExecStop=/usr/bin/pm2 stop all
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}✅ Nginx reverse proxy setup completed!${NC}"

echo -e "${YELLOW}📋 Configuration Summary:${NC}"
echo -e "  🌐 Nginx listening on ports 80 (HTTP) and 443 (HTTPS)"
echo -e "  🔒 SSL termination handled by Nginx"
echo -e "  ⚡ Backend running on HTTP port 4000 (internal)"
echo -e "  📁 Static files served directly by Nginx"
echo -e "  🛡️  Security headers and compression enabled"

echo -e "${YELLOW}🔗 Access URLs:${NC}"
echo -e "  📱 Frontend API calls: https://$SERVER_IP"
echo -e "  🔍 Backend test: https://$SERVER_IP/test"
echo -e "  📊 Nginx status: https://$SERVER_IP/nginx-status"

echo -e "${YELLOW}📝 Next Steps:${NC}"
echo -e "  1. Copy your project files to: $PROJECT_DIR"
echo -e "  2. Update your backend to disable HTTPS (Nginx handles it)"
echo -e "  3. Start your backend: pm2 start ecosystem.config.js --env production"
echo -e "  4. Update frontend API calls to use: https://$SERVER_IP"

echo -e "${YELLOW}🔧 Useful Commands:${NC}"
echo -e "  • Check Nginx status: systemctl status nginx"
echo -e "  • Restart Nginx: systemctl restart nginx"
echo -e "  • Check Nginx logs: tail -f /var/log/nginx/diagnostic-backend.error.log"
echo -e "  • Test SSL: curl -k https://$SERVER_IP/test"

echo -e "${GREEN}🎉 Setup complete! Your API is now accessible via HTTPS with proper SSL termination.${NC}"
