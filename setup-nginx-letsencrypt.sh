#!/bin/bash

# Nginx + Let's Encrypt Setup Script for Diagnostic Backend
echo "🌐 Setting up Nginx reverse proxy with Let's Encrypt SSL..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - UPDATE THESE VALUES
DOMAIN="yourdomain.com"           # Replace with your actual domain
EMAIL="admin@yourdomain.com"      # Replace with your email
SERVER_IP="46.202.168.1"
BACKEND_PORT="4000"
PROJECT_DIR="/var/www/diagnostic-backend"

echo -e "${YELLOW}⚠️  IMPORTANT: Update DOMAIN and EMAIL variables in this script!${NC}"
echo -e "${YELLOW}   Current domain: $DOMAIN${NC}"
echo -e "${YELLOW}   Current email: $EMAIL${NC}"
echo ""

# Check if domain is set properly
if [ "$DOMAIN" = "yourdomain.com" ]; then
    echo -e "${RED}❌ Please update the DOMAIN and EMAIL variables in this script${NC}"
    exit 1
fi

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ This script must be run as root (sudo)${NC}"
    exit 1
fi

echo -e "${BLUE}1. Installing Nginx and Certbot...${NC}"
# Install required packages
apt-get update -qq
apt-get install -y nginx certbot python3-certbot-nginx openssl

# Stop nginx and any conflicting services
systemctl stop nginx
systemctl stop apache2 2>/dev/null || true
pm2 stop diagnostic-backend 2>/dev/null || true

echo -e "${BLUE}2. Creating project directory...${NC}"
mkdir -p "$PROJECT_DIR"
mkdir -p "$PROJECT_DIR/uploads"

echo -e "${BLUE}3. Creating temporary Nginx configuration...${NC}"
# Create temporary nginx config for domain verification
cat > /etc/nginx/sites-available/diagnostic-backend-temp << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        return 200 'Domain verification for Let\'s Encrypt';
        add_header Content-Type text/plain;
    }
}
EOF

# Enable temporary config
ln -sf /etc/nginx/sites-available/diagnostic-backend-temp /etc/nginx/sites-enabled/diagnostic-backend-temp
rm -f /etc/nginx/sites-enabled/default

# Start nginx for domain verification
systemctl start nginx

echo -e "${BLUE}4. Obtaining Let's Encrypt certificate...${NC}"
# Get Let's Encrypt certificate
certbot certonly --nginx \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    -d "$DOMAIN"

# Check if certificate was obtained
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "${RED}❌ Let's Encrypt certificate generation failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Let's Encrypt certificate obtained successfully!${NC}"

echo -e "${BLUE}5. Creating production Nginx configuration...${NC}"
# Create production nginx configuration with Let's Encrypt certificates
cat > /etc/nginx/sites-available/diagnostic-backend << EOF
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server with Let's Encrypt SSL
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN;

    # Let's Encrypt SSL Certificate
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Modern SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Client upload size limit
    client_max_body_size 50M;

    # Logging
    access_log /var/log/nginx/diagnostic-backend.access.log;
    error_log /var/log/nginx/diagnostic-backend.error.log;

    # Serve static files directly
    location /uploads/ {
        alias $PROJECT_DIR/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        location ~* \.(php|pl|py|jsp|asp|sh|cgi)\$ {
            deny all;
        }
    }

    # Main API proxy to Node.js backend
    location / {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_cache_bypass \$http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:$BACKEND_PORT/test;
        access_log off;
    }
}
EOF

# Remove temporary config and enable production config
rm -f /etc/nginx/sites-enabled/diagnostic-backend-temp
ln -sf /etc/nginx/sites-available/diagnostic-backend /etc/nginx/sites-enabled/diagnostic-backend

echo -e "${BLUE}6. Testing Nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration error${NC}"
    exit 1
fi

echo -e "${BLUE}7. Setting up automatic certificate renewal...${NC}"
# Setup automatic renewal
cat > /etc/cron.d/letsencrypt-diagnostic-backend << EOF
# Auto-renew Let's Encrypt certificate for diagnostic-backend
0 2 * * * root certbot renew --quiet --deploy-hook "systemctl reload nginx"
EOF

echo -e "${BLUE}8. Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo -e "${GREEN}✅ Firewall configured${NC}"
fi

echo -e "${BLUE}9. Starting services...${NC}"
# Start nginx
systemctl restart nginx
systemctl enable nginx

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx started successfully${NC}"
else
    echo -e "${RED}❌ Failed to start Nginx${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Nginx + Let's Encrypt setup completed!${NC}"

echo -e "${YELLOW}📋 Configuration Summary:${NC}"
echo -e "  🌐 Domain: $DOMAIN"
echo -e "  🔒 SSL: Let's Encrypt (trusted by all browsers)"
echo -e "  ⚡ Backend: HTTP on port $BACKEND_PORT (internal)"
echo -e "  🔄 Auto-renewal: Configured via cron"

echo -e "${YELLOW}🔗 Access URLs:${NC}"
echo -e "  📱 Production API: https://$DOMAIN"
echo -e "  🔍 Backend test: https://$DOMAIN/test"

echo -e "${YELLOW}📝 Next Steps:${NC}"
echo -e "  1. Deploy your code to: $PROJECT_DIR"
echo -e "  2. Set HTTPS_DISABLED=true in your backend environment"
echo -e "  3. Start backend: pm2 start ecosystem.config.js --env production"
echo -e "  4. Update frontend to use: https://$DOMAIN"

echo -e "${YELLOW}🔧 Useful Commands:${NC}"
echo -e "  • Test SSL: curl https://$DOMAIN/test"
echo -e "  • Check cert: certbot certificates"
echo -e "  • Renew cert: certbot renew --dry-run"
echo -e "  • Nginx logs: tail -f /var/log/nginx/diagnostic-backend.error.log"

echo -e "${GREEN}✅ Your API is now accessible with a trusted SSL certificate!${NC}"
