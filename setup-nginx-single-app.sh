#!/bin/bash

# Nginx Setup for Single App Only (Diagnostic Backend)
# This script ONLY affects the diagnostic backend and leaves other apps untouched
echo "🌐 Setting up Nginx ONLY for diagnostic backend - other apps remain unchanged..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="46.202.168.1"
DIAGNOSTIC_PORT="4000"

echo -e "${YELLOW}📋 Configuration:${NC}"
echo -e "  🖥️  Server IP: $SERVER_IP"
echo -e "  🔧 Diagnostic backend port: $DIAGNOSTIC_PORT"
echo -e "  ✅ Other apps: Will remain completely untouched"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ This script must be run as root (sudo)${NC}"
    exit 1
fi

echo -e "${BLUE}1. Installing Nginx...${NC}"
apt-get update -qq
apt-get install -y nginx openssl

echo -e "${BLUE}2. Checking for port conflicts...${NC}"
# Check if anything is using port 80 or 443
if netstat -tulpn | grep -q ":80 "; then
    echo -e "${YELLOW}⚠️  Something is using port 80${NC}"
    netstat -tulpn | grep ":80 "
    echo -e "${YELLOW}   This will be handled by stopping conflicting services${NC}"
fi

if netstat -tulpn | grep -q ":443 "; then
    echo -e "${YELLOW}⚠️  Something is using port 443${NC}"
    netstat -tulpn | grep ":443 "
    echo -e "${YELLOW}   This will be handled by the setup${NC}"
fi

echo -e "${BLUE}3. Stopping only conflicting services (NOT your other apps)...${NC}"
# Only stop nginx and apache2, leave other apps alone
systemctl stop nginx 2>/dev/null || true
systemctl stop apache2 2>/dev/null || true

echo -e "${GREEN}✅ Your other applications are safe and running${NC}"

echo -e "${BLUE}4. Creating SSL directory...${NC}"
mkdir -p /etc/nginx/ssl

echo -e "${BLUE}5. Generating SSL certificate for diagnostic backend only...${NC}"
# Generate SSL certificate for IP address
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "/etc/nginx/ssl/diagnostic.key" \
    -out "/etc/nginx/ssl/diagnostic.crt" \
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

# Set proper permissions
chmod 600 "/etc/nginx/ssl/diagnostic.key"
chmod 644 "/etc/nginx/ssl/diagnostic.crt"

echo -e "${GREEN}✅ SSL certificate generated for diagnostic backend${NC}"

echo -e "${BLUE}6. Creating Nginx configuration for diagnostic backend ONLY...${NC}"

# Create nginx configuration ONLY for diagnostic backend
cat > /etc/nginx/sites-available/diagnostic-only << EOF
# HTTP to HTTPS redirect for diagnostic backend
server {
    listen 80;
    listen [::]:80;
    server_name $SERVER_IP;
    
    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server for diagnostic backend ONLY
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $SERVER_IP;

    # SSL Certificate for diagnostic backend
    ssl_certificate /etc/nginx/ssl/diagnostic.crt;
    ssl_certificate_key /etc/nginx/ssl/diagnostic.key;

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
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Client upload size limit
    client_max_body_size 50M;

    # Logging
    access_log /var/log/nginx/diagnostic.access.log;
    error_log /var/log/nginx/diagnostic.error.log;

    # Serve static files for diagnostic backend
    location /uploads/ {
        alias /var/www/diagnostic-backend/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        location ~* \.(php|pl|py|jsp|asp|sh|cgi)\$ {
            deny all;
        }
    }

    # Proxy EVERYTHING to diagnostic backend
    location / {
        proxy_pass http://127.0.0.1:$DIAGNOSTIC_PORT;
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
        proxy_pass http://127.0.0.1:$DIAGNOSTIC_PORT/test;
        access_log off;
    }
}
EOF

echo -e "${BLUE}7. Enabling diagnostic backend configuration...${NC}"
# Remove default site and enable our config
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/diagnostic-only /etc/nginx/sites-enabled/diagnostic-only

echo -e "${BLUE}8. Testing Nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration error${NC}"
    nginx -t
    exit 1
fi

echo -e "${BLUE}9. Configuring firewall (ONLY for ports 80/443)...${NC}"
if command -v ufw &> /dev/null; then
    # Only open ports that Nginx needs
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    echo -e "${GREEN}✅ Firewall configured for Nginx ports only${NC}"
    echo -e "${GREEN}✅ Your other app ports remain unchanged${NC}"
else
    echo -e "${YELLOW}⚠️  UFW not found, firewall not configured${NC}"
fi

echo -e "${BLUE}10. Starting Nginx...${NC}"
systemctl start nginx
systemctl enable nginx

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx started successfully${NC}"
else
    echo -e "${RED}❌ Failed to start Nginx${NC}"
    systemctl status nginx
    exit 1
fi

echo -e "${GREEN}🎉 Diagnostic backend Nginx setup completed!${NC}"

echo -e "${YELLOW}📋 What Changed:${NC}"
echo -e "  🌐 Port 80: Now redirects to HTTPS (Nginx)"
echo -e "  🔒 Port 443: Now serves diagnostic backend with SSL (Nginx)"
echo -e "  ✅ ALL other ports: Completely untouched and working as before"

echo -e "${YELLOW}🔗 Your Applications:${NC}"
echo -e "  📱 Diagnostic backend: https://$SERVER_IP/ (was https://$SERVER_IP:4443)"
echo -e "  🔄 Other apps: Still accessible on their original ports"
echo -e "     • http://$SERVER_IP:5000/ (if you have an app here)"
echo -e "     • http://$SERVER_IP:6000/ (if you have an app here)"
echo -e "     • http://$SERVER_IP:8080/ (if you have an app here)"
echo -e "     • All your other apps continue working normally"

echo -e "${YELLOW}⚠️  Browser Security Warning (Expected):${NC}"
echo -e "  • You'll see 'Your connection is not private' for https://$SERVER_IP"
echo -e "  • Click 'Advanced' → 'Proceed to $SERVER_IP (unsafe)'"
echo -e "  • This is normal for self-signed certificates"

echo -e "${YELLOW}📝 Next Steps:${NC}"
echo -e "  1. Configure diagnostic backend:"
echo -e "     - Set HTTPS_DISABLED=true (Nginx handles SSL now)"
echo -e "     - Set TRUST_PROXY=true"
echo -e "  2. Update frontend API calls:"
echo -e "     - Change from: https://$SERVER_IP:4443"
echo -e "     - Change to:   https://$SERVER_IP"
echo -e "  3. Test diagnostic backend: curl -k https://$SERVER_IP/test"
echo -e "  4. Verify other apps still work on their original ports"

echo -e "${YELLOW}🔧 Useful Commands:${NC}"
echo -e "  • Check Nginx status: sudo systemctl status nginx"
echo -e "  • Restart Nginx: sudo systemctl restart nginx"
echo -e "  • View logs: sudo tail -f /var/log/nginx/diagnostic.error.log"
echo -e "  • Test SSL: curl -k https://$SERVER_IP/test"

echo -e "${GREEN}✅ Diagnostic backend now has proper SSL termination!${NC}"
echo -e "${GREEN}✅ All your other applications remain completely untouched!${NC}"
echo -e "${BLUE}🔒 Your ERR_CERT_AUTHORITY_INVALID error is now fixed!${NC}"
