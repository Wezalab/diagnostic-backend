#!/bin/bash

# Let's Encrypt SSL Certificate Setup Script
echo "🔐 Setting up Let's Encrypt SSL certificate..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="your-domain.com"  # Replace with your actual domain
EMAIL="admin@your-domain.com"  # Replace with your email
SERVER_IP="46.202.168.1"

echo -e "${YELLOW}⚠️  IMPORTANT: This script requires a domain name!${NC}"
echo -e "${YELLOW}   You cannot use Let's Encrypt with just an IP address.${NC}"
echo -e "${YELLOW}   Please update DOMAIN and EMAIL variables in this script.${NC}"
echo ""

# Check if domain is set properly
if [ "$DOMAIN" = "your-domain.com" ]; then
    echo -e "${RED}❌ Please update the DOMAIN variable in this script${NC}"
    echo -e "${YELLOW}   Edit setup-letsencrypt.sh and set your actual domain name${NC}"
    exit 1
fi

# Check if running as root (required for certbot)
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ This script must be run as root (sudo)${NC}"
    echo -e "${YELLOW}   Run: sudo ./setup-letsencrypt.sh${NC}"
    exit 1
fi

# Install certbot if not already installed
echo -e "${BLUE}1. Installing Certbot...${NC}"
if command -v apt-get &> /dev/null; then
    # Ubuntu/Debian
    apt-get update -qq
    apt-get install -y certbot
elif command -v yum &> /dev/null; then
    # CentOS/RHEL
    yum install -y certbot
else
    echo -e "${RED}❌ Unsupported package manager. Please install certbot manually.${NC}"
    exit 1
fi

# Stop any services running on port 80 (required for certbot)
echo -e "${BLUE}2. Stopping services on port 80...${NC}"
systemctl stop nginx 2>/dev/null || true
systemctl stop apache2 2>/dev/null || true
pm2 stop diagnostic-backend 2>/dev/null || true

# Generate Let's Encrypt certificate
echo -e "${BLUE}3. Generating Let's Encrypt certificate for ${DOMAIN}...${NC}"
certbot certonly --standalone \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    -d "$DOMAIN"

# Check if certificate was generated successfully
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "${GREEN}✅ Let's Encrypt certificate generated successfully!${NC}"
    
    # Create symbolic links to the certificates in your project
    echo -e "${BLUE}4. Creating certificate links...${NC}"
    mkdir -p ssl
    
    # Remove old certificates if they exist
    rm -f ssl/server-prod.key ssl/server-prod.crt
    
    # Create links to Let's Encrypt certificates
    ln -s "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "ssl/server-prod.key"
    ln -s "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "ssl/server-prod.crt"
    
    # Set proper permissions
    chmod 600 ssl/server-prod.key
    chmod 644 ssl/server-prod.crt
    
    echo -e "${GREEN}✅ Certificate links created successfully!${NC}"
    
    # Setup auto-renewal
    echo -e "${BLUE}5. Setting up auto-renewal...${NC}"
    
    # Create renewal script
    cat > /etc/cron.d/letsencrypt-renewal << EOF
# Let's Encrypt auto-renewal for diagnostic-backend
0 2 * * * root certbot renew --quiet --deploy-hook "pm2 restart diagnostic-backend"
EOF
    
    echo -e "${GREEN}✅ Auto-renewal configured!${NC}"
    
    # Display certificate info
    echo -e "${YELLOW}Certificate Information:${NC}"
    openssl x509 -in "/etc/letsencrypt/live/$DOMAIN/cert.pem" -text -noout | grep -E "Subject:|Not Before:|Not After:|DNS:"
    
    echo -e "${GREEN}🎉 Let's Encrypt SSL setup completed!${NC}"
    echo -e "${BLUE}Your server now has a valid SSL certificate.${NC}"
    echo -e "${BLUE}You can access your server at: https://$DOMAIN:4443${NC}"
    
else
    echo -e "${RED}❌ Let's Encrypt certificate generation failed${NC}"
    echo -e "${YELLOW}Possible reasons:${NC}"
    echo -e "  • Domain $DOMAIN doesn't point to this server ($SERVER_IP)"
    echo -e "  • Port 80 is blocked or in use"
    echo -e "  • DNS propagation hasn't completed"
    echo -e "  • Rate limits reached (5 certificates per week per domain)"
    
    echo -e "${YELLOW}💡 To debug:${NC}"
    echo -e "  • Check DNS: dig $DOMAIN"
    echo -e "  • Check port 80: netstat -tulpn | grep :80"
    echo -e "  • Manual test: certbot certonly --standalone --test-cert -d $DOMAIN"
    
    exit 1
fi

# Restart the application
echo -e "${BLUE}6. Restarting application...${NC}"
pm2 restart diagnostic-backend

echo -e "${GREEN}🚀 Setup complete! Your HTTPS server should now work without warnings.${NC}"
