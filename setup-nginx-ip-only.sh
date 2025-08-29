#!/bin/bash

# Nginx Setup for IP-only (No Domain) - Multi-App Support
echo "🌐 Setting up Nginx for IP-only access with multiple applications..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="46.202.168.1"

# Define your applications (name:port)
APPS=(
    "diagnostic:4000"
    "shop:5000"
    "admin:6000"
    "api:8080"
)

echo -e "${YELLOW}📋 Current configuration:${NC}"
echo -e "  🖥️  Server IP: $SERVER_IP"
echo -e "  📱 Applications: ${APPS[@]}"
echo ""
echo -e "${YELLOW}⚠️  Update the APPS array above with your actual applications!${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ This script must be run as root (sudo)${NC}"
    exit 1
fi

echo -e "${BLUE}1. Installing Nginx...${NC}"
apt-get update -qq
apt-get install -y nginx openssl

echo -e "${BLUE}2. Stopping conflicting services...${NC}"
systemctl stop nginx
systemctl stop apache2 2>/dev/null || true

echo -e "${BLUE}3. Creating SSL directories...${NC}"
mkdir -p /etc/nginx/ssl

echo -e "${BLUE}4. Generating self-signed SSL certificate for IP...${NC}"
# Generate SSL certificate for IP address
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "/etc/nginx/ssl/server.key" \
    -out "/etc/nginx/ssl/server.crt" \
    -subj "/C=US/ST=Production/L=Server/O=Multi-App Server/OU=Production Unit/CN=$SERVER_IP" \
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
O = Multi-App Server
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
chmod 600 "/etc/nginx/ssl/server.key"
chmod 644 "/etc/nginx/ssl/server.crt"

echo -e "${GREEN}✅ SSL certificate generated for IP $SERVER_IP${NC}"

echo -e "${BLUE}5. Creating main Nginx configuration with path-based routing...${NC}"

# Create main nginx configuration with path-based routing
cat > /etc/nginx/sites-available/multi-app-ip << EOF
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $SERVER_IP;
    return 301 https://\$server_name\$request_uri;
}

# Main HTTPS server with path-based routing
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $SERVER_IP;

    # SSL Certificate
    ssl_certificate /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;

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
    access_log /var/log/nginx/multi-app.access.log;
    error_log /var/log/nginx/multi-app.error.log;

    # Serve static files for diagnostic app
    location /uploads/ {
        alias /var/www/diagnostic-backend/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        location ~* \.(php|pl|py|jsp|asp|sh|cgi)\$ {
            deny all;
        }
    }

EOF

# Add location blocks for each app
for app in "${APPS[@]}"; do
    app_name=$(echo $app | cut -d: -f1)
    port=$(echo $app | cut -d: -f2)
    
    echo -e "  📝 Adding route: /$app_name/ → localhost:$port"
    
    if [ "$app_name" = "diagnostic" ]; then
        # Main diagnostic app gets root path
        cat >> /etc/nginx/sites-available/multi-app-ip << EOF
    # Main Diagnostic Application (root path)
    location / {
        proxy_pass http://127.0.0.1:$port;
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

EOF
    else
        # Other apps get path-based routing
        cat >> /etc/nginx/sites-available/multi-app-ip << EOF
    # $app_name Application
    location /$app_name/ {
        rewrite ^/$app_name/(.*) /\$1 break;
        proxy_pass http://127.0.0.1:$port;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        proxy_set_header X-Forwarded-Path /$app_name;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_cache_bypass \$http_upgrade;
    }

    # Health check for $app_name
    location /$app_name/health {
        rewrite ^/$app_name/health /test break;
        proxy_pass http://127.0.0.1:$port;
        access_log off;
    }

EOF
    fi
done

# Close the server block
cat >> /etc/nginx/sites-available/multi-app-ip << EOF
    # Global health check
    location /health {
        return 200 'Multi-app server is running';
        add_header Content-Type text/plain;
        access_log off;
    }

    # Nginx status (for monitoring)
    location /nginx-status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        allow $SERVER_IP;
        deny all;
    }
}
EOF

echo -e "${BLUE}6. Enabling the configuration...${NC}"
# Remove default site and enable our config
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/multi-app-ip /etc/nginx/sites-enabled/multi-app-ip

echo -e "${BLUE}7. Testing Nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration error${NC}"
    nginx -t
    exit 1
fi

echo -e "${BLUE}8. Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Optionally block direct access to app ports
    echo -e "${YELLOW}🔒 Configuring firewall for app ports...${NC}"
    for app in "${APPS[@]}"; do
        port=$(echo $app | cut -d: -f2)
        echo -e "  🛡️  Port $port: Allowing internal access only"
        ufw deny $port/tcp
        ufw allow from 127.0.0.1 to any port $port
        ufw allow from $SERVER_IP to any port $port
    done
    
    echo -e "${GREEN}✅ Firewall configured${NC}"
fi

echo -e "${BLUE}9. Starting Nginx...${NC}"
systemctl start nginx
systemctl enable nginx

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx started successfully${NC}"
else
    echo -e "${RED}❌ Failed to start Nginx${NC}"
    systemctl status nginx
    exit 1
fi

echo -e "${GREEN}🎉 Multi-application Nginx setup completed!${NC}"

echo -e "${YELLOW}📋 Configuration Summary:${NC}"
echo -e "  🖥️  Server IP: $SERVER_IP"
echo -e "  🔒 SSL: Self-signed certificate (browser warnings expected)"
echo -e "  🌐 HTTP: Redirects to HTTPS"
echo -e "  🛡️  Firewall: Direct port access blocked"

echo -e "${YELLOW}🔗 Your Applications:${NC}"
for app in "${APPS[@]}"; do
    app_name=$(echo $app | cut -d: -f1)
    port=$(echo $app | cut -d: -f2)
    
    if [ "$app_name" = "diagnostic" ]; then
        echo -e "  📱 https://$SERVER_IP/ → $app_name (port $port) [Main App]"
    else
        echo -e "  📱 https://$SERVER_IP/$app_name/ → $app_name (port $port)"
    fi
done

echo -e "${YELLOW}📝 Application URL Examples:${NC}"
echo -e "  🔍 Main app: https://$SERVER_IP/"
echo -e "  🔍 Test endpoint: https://$SERVER_IP/test"
for app in "${APPS[@]}"; do
    app_name=$(echo $app | cut -d: -f1)
    if [ "$app_name" != "diagnostic" ]; then
        echo -e "  🔍 $app_name: https://$SERVER_IP/$app_name/"
    fi
done

echo -e "${YELLOW}⚠️  Browser Security Warning:${NC}"
echo -e "  • You'll see 'Your connection is not private' warnings"
echo -e "  • Click 'Advanced' → 'Proceed to $SERVER_IP (unsafe)'"
echo -e "  • This is normal for self-signed certificates"

echo -e "${YELLOW}📝 Next Steps:${NC}"
echo -e "  1. Configure each application:"
echo -e "     - Set HTTPS_DISABLED=true"
echo -e "     - Set TRUST_PROXY=true"
echo -e "     - Bind to 127.0.0.1 (not 0.0.0.0)"
echo -e "  2. Update frontend API configurations:"
echo -e "     - Main app: https://$SERVER_IP"
echo -e "     - Other apps: https://$SERVER_IP/appname/"
echo -e "  3. Test each application:"

for app in "${APPS[@]}"; do
    app_name=$(echo $app | cut -d: -f1)
    if [ "$app_name" = "diagnostic" ]; then
        echo -e "     - curl -k https://$SERVER_IP/test"
    else
        echo -e "     - curl -k https://$SERVER_IP/$app_name/health"
    fi
done

echo -e "${YELLOW}🔧 Useful Commands:${NC}"
echo -e "  • Check Nginx status: sudo systemctl status nginx"
echo -e "  • Restart Nginx: sudo systemctl restart nginx"
echo -e "  • View logs: sudo tail -f /var/log/nginx/multi-app.error.log"
echo -e "  • Test configuration: sudo nginx -t"

echo -e "${GREEN}✅ All applications are now accessible via HTTPS through Nginx!${NC}"
echo -e "${BLUE}🔒 SSL warnings are expected with IP-only setup (no domain).${NC}"
