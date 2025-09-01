#!/bin/bash

# Setup SSL for api.alphanew.coach subdomain
echo "🌐 Setting up SSL for api.alphanew.coach..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="api.alphanew.coach"
EMAIL="admin@alphanew.coach"  # Update with your actual email
SERVER_IP="46.202.168.1"
BACKEND_PORT="4000"
PROJECT_DIR="/var/www/diagnostic-backend"

echo -e "${YELLOW}📋 Configuration:${NC}"
echo -e "  🌐 Domain: $DOMAIN"
echo -e "  📧 Email: $EMAIL"
echo -e "  🖥️  Server IP: $SERVER_IP"
echo -e "  🔌 Backend Port: $BACKEND_PORT"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ This script must be run as root (sudo)${NC}"
    exit 1
fi

echo -e "${BLUE}1. Installing required packages...${NC}"
apt-get update -qq
apt-get install -y nginx certbot python3-certbot-nginx openssl

echo -e "${BLUE}2. Stopping services...${NC}"
systemctl stop nginx 2>/dev/null || true
systemctl stop apache2 2>/dev/null || true

echo -e "${BLUE}3. Creating project directory...${NC}"
mkdir -p "$PROJECT_DIR"
mkdir -p "$PROJECT_DIR/uploads"

echo -e "${BLUE}4. Creating temporary Nginx config for domain verification...${NC}"
cat > /etc/nginx/sites-available/diagnostic-backend-temp << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        return 200 'Domain verification for api.alphanew.coach';
        add_header Content-Type text/plain;
    }
}
EOF

# Enable temporary config
ln -sf /etc/nginx/sites-available/diagnostic-backend-temp /etc/nginx/sites-enabled/diagnostic-backend-temp
rm -f /etc/nginx/sites-enabled/default

echo -e "${BLUE}5. Starting Nginx for domain verification...${NC}"
systemctl start nginx

echo -e "${BLUE}6. Obtaining Let's Encrypt certificate for $DOMAIN...${NC}"
certbot certonly --nginx \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    -d "$DOMAIN"

# Check if certificate was obtained
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "${RED}❌ Let's Encrypt certificate generation failed${NC}"
    echo -e "${YELLOW}💡 Make sure:${NC}"
    echo -e "   1. DNS A record for api.alphanew.coach points to $SERVER_IP"
    echo -e "   2. Port 80 is open and accessible"
    echo -e "   3. Domain is propagated (check with: dig api.alphanew.coach)"
    exit 1
fi

echo -e "${GREEN}✅ Let's Encrypt certificate obtained successfully!${NC}"

echo -e "${BLUE}7. Creating production Nginx configuration...${NC}"
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

    # CORS Headers for API
    add_header Access-Control-Allow-Origin "https://alphanew.coach" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Accept, Authorization, Cache-Control, Content-Type, DNT, If-Modified-Since, Keep-Alive, Origin, User-Agent, X-Requested-With" always;
    add_header Access-Control-Allow-Credentials true always;

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

    # Serve static files (uploads)
    location /uploads/ {
        alias $PROJECT_DIR/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # Security for uploads
        location ~* \.(php|pl|py|jsp|asp|sh|cgi)\$ {
            deny all;
        }
    }

    # Main API proxy to Node.js backend
    location / {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        
        # Proxy headers
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        
        # Proxy timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_cache_bypass \$http_upgrade;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:$BACKEND_PORT/test;
        access_log off;
    }
}
EOF

echo -e "${BLUE}8. Enabling new configuration...${NC}"
# Remove temporary config
rm -f /etc/nginx/sites-enabled/diagnostic-backend-temp

# Enable production config
ln -sf /etc/nginx/sites-available/diagnostic-backend /etc/nginx/sites-enabled/diagnostic-backend

echo -e "${BLUE}9. Testing Nginx configuration...${NC}"
nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
    
    echo -e "${BLUE}10. Restarting Nginx...${NC}"
    systemctl restart nginx
    systemctl enable nginx
    
    echo -e "${GREEN}🎉 Setup complete!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Next steps:${NC}"
    echo -e "  1. Make sure your Node.js app is running on port $BACKEND_PORT"
    echo -e "  2. Test your API: https://$DOMAIN/health"
    echo -e "  3. Update your frontend to use: https://$DOMAIN"
    echo ""
    echo -e "${YELLOW}🔄 Certificate auto-renewal:${NC}"
    echo -e "  Certbot has been configured to auto-renew your certificate."
    echo -e "  Test renewal: sudo certbot renew --dry-run"
    
else
    echo -e "${RED}❌ Nginx configuration error${NC}"
    exit 1
fi
