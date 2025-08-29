#!/bin/bash

# Multi-Application Nginx Setup Script
echo "🌐 Setting up Nginx for multiple applications..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - UPDATE THESE VALUES
DOMAIN="yourdomain.com"           # Replace with your domain
EMAIL="admin@yourdomain.com"      # Replace with your email
SERVER_IP="46.202.168.1"

# Define your applications (subdomain:port)
APPS=(
    "diagnostic:4000"
    "shop:5000"
    "blog:6000"
    "admin:7000"
)

echo -e "${YELLOW}⚠️  IMPORTANT: Update DOMAIN, EMAIL, and APPS array in this script!${NC}"
echo -e "${YELLOW}   Current domain: $DOMAIN${NC}"
echo -e "${YELLOW}   Current apps: ${APPS[@]}${NC}"
echo ""

# Check if domain is set properly
if [ "$DOMAIN" = "yourdomain.com" ]; then
    echo -e "${RED}❌ Please update the DOMAIN, EMAIL, and APPS variables in this script${NC}"
    exit 1
fi

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ This script must be run as root (sudo)${NC}"
    exit 1
fi

echo -e "${BLUE}1. Installing required packages...${NC}"
apt-get update -qq
apt-get install -y nginx certbot python3-certbot-nginx openssl

echo -e "${BLUE}2. Stopping conflicting services...${NC}"
systemctl stop nginx
systemctl stop apache2 2>/dev/null || true

echo -e "${BLUE}3. Building subdomain list for SSL certificate...${NC}"
SUBDOMAINS=""
for app in "${APPS[@]}"; do
    subdomain=$(echo $app | cut -d: -f1)
    SUBDOMAINS="$SUBDOMAINS -d $subdomain.$DOMAIN"
    echo -e "  📱 $subdomain.$DOMAIN"
done

echo -e "${BLUE}4. Creating temporary Nginx configuration...${NC}"
# Create temporary config for domain verification
cat > /etc/nginx/sites-available/temp-multi-app << EOF
# Temporary configuration for domain verification
$(for app in "${APPS[@]}"; do
    subdomain=$(echo $app | cut -d: -f1)
    cat << SUBEOF
server {
    listen 80;
    server_name $subdomain.$DOMAIN;
    location / {
        return 200 'Domain verification for $subdomain.$DOMAIN';
        add_header Content-Type text/plain;
    }
}
SUBEOF
done)
EOF

# Enable temporary config
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/temp-multi-app /etc/nginx/sites-enabled/temp-multi-app

# Start nginx for verification
systemctl start nginx

echo -e "${BLUE}5. Obtaining Let's Encrypt certificates...${NC}"
# Get certificates for all subdomains
certbot certonly --nginx \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    $SUBDOMAINS

# Check if certificates were obtained
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "${RED}❌ Let's Encrypt certificate generation failed${NC}"
    echo -e "${YELLOW}💡 Make sure all subdomains point to this server${NC}"
    exit 1
fi

echo -e "${GREEN}✅ SSL certificates obtained for all subdomains!${NC}"

echo -e "${BLUE}6. Creating production Nginx configurations...${NC}"

# Remove temporary config
rm -f /etc/nginx/sites-enabled/temp-multi-app

# Create individual configs for each app
for app in "${APPS[@]}"; do
    subdomain=$(echo $app | cut -d: -f1)
    port=$(echo $app | cut -d: -f2)
    
    echo -e "  📝 Creating config for $subdomain.$DOMAIN → port $port"
    
    cat > /etc/nginx/sites-available/$subdomain << EOF
# Redirect HTTP to HTTPS for $subdomain
server {
    listen 80;
    listen [::]:80;
    server_name $subdomain.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server for $subdomain
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $subdomain.$DOMAIN;

    # SSL Certificate (shared across subdomains)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Modern SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
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
    access_log /var/log/nginx/$subdomain.access.log;
    error_log /var/log/nginx/$subdomain.error.log;

    # Serve uploads if this is the diagnostic app
EOF

    if [ "$subdomain" = "diagnostic" ]; then
        cat >> /etc/nginx/sites-available/$subdomain << EOF
    # Static file serving for uploads (diagnostic app only)
    location /uploads/ {
        alias /var/www/diagnostic-backend/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        location ~* \.(php|pl|py|jsp|asp|sh|cgi)\$ {
            deny all;
        }
    }
EOF
    fi

    cat >> /etc/nginx/sites-available/$subdomain << EOF

    # Main application proxy
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

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:$port/test;
        access_log off;
    }
}
EOF

    # Enable the site
    ln -sf /etc/nginx/sites-available/$subdomain /etc/nginx/sites-enabled/$subdomain
done

echo -e "${BLUE}7. Testing Nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ All Nginx configurations are valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration error${NC}"
    nginx -t
    exit 1
fi

echo -e "${BLUE}8. Setting up automatic certificate renewal...${NC}"
cat > /etc/cron.d/letsencrypt-multi-app << EOF
# Auto-renew Let's Encrypt certificates for multi-app setup
0 2 * * * root certbot renew --quiet --deploy-hook "systemctl reload nginx"
EOF

echo -e "${BLUE}9. Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Optionally block direct access to app ports
    echo -e "${YELLOW}🔒 Blocking direct access to application ports...${NC}"
    for app in "${APPS[@]}"; do
        port=$(echo $app | cut -d: -f2)
        ufw deny $port/tcp
        ufw allow from 127.0.0.1 to any port $port  # Allow internal access
    done
    
    echo -e "${GREEN}✅ Firewall configured${NC}"
fi

echo -e "${BLUE}10. Starting services...${NC}"
systemctl restart nginx
systemctl enable nginx

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx started successfully${NC}"
else
    echo -e "${RED}❌ Failed to start Nginx${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Multi-application Nginx setup completed!${NC}"

echo -e "${YELLOW}📋 Configuration Summary:${NC}"
echo -e "  🌐 SSL Certificate: /etc/letsencrypt/live/$DOMAIN/"
echo -e "  🔄 Auto-renewal: Configured via cron"
echo -e "  🛡️  Firewall: Direct port access blocked"

echo -e "${YELLOW}🔗 Your Applications:${NC}"
for app in "${APPS[@]}"; do
    subdomain=$(echo $app | cut -d: -f1)
    port=$(echo $app | cut -d: -f2)
    echo -e "  📱 https://$subdomain.$DOMAIN → localhost:$port"
done

echo -e "${YELLOW}📝 Next Steps:${NC}"
echo -e "  1. Deploy your applications to their respective directories"
echo -e "  2. Configure each app to:"
echo -e "     - Set HTTPS_DISABLED=true (SSL handled by Nginx)"
echo -e "     - Set TRUST_PROXY=true"
echo -e "     - Bind to 127.0.0.1 (not 0.0.0.0)"
echo -e "  3. Start your applications with PM2"
echo -e "  4. Update frontend configurations with new URLs"

echo -e "${YELLOW}🔧 Useful Commands:${NC}"
echo -e "  • Test all apps: $(for app in "${APPS[@]}"; do subdomain=$(echo $app | cut -d: -f1); echo -n "curl https://$subdomain.$DOMAIN/test; "; done)"
echo -e "  • Check certificates: sudo certbot certificates"
echo -e "  • Nginx logs: sudo tail -f /var/log/nginx/*.error.log"
echo -e "  • Restart Nginx: sudo systemctl restart nginx"

echo -e "${GREEN}✅ All applications are now accessible via HTTPS with trusted certificates!${NC}"
