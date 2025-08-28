#!/bin/bash

# SSL Certificate Generation Script for Production
echo "🔐 Generating SSL certificates for production server..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Server IP address
SERVER_IP="46.202.168.1"

# Create SSL directory if it doesn't exist
mkdir -p ssl

echo -e "${YELLOW}Creating SSL certificates for IP: ${SERVER_IP}${NC}"

# Generate private key
echo -e "${BLUE}1. Generating private key...${NC}"
openssl genrsa -out ssl/server-prod.key 2048

# Generate certificate signing request (CSR)
echo -e "${BLUE}2. Generating certificate signing request...${NC}"
openssl req -new -key ssl/server-prod.key -out ssl/server-prod.csr -config ssl/openssl.conf

# Generate self-signed certificate
echo -e "${BLUE}3. Generating self-signed certificate...${NC}"
openssl x509 -req -in ssl/server-prod.csr -signkey ssl/server-prod.key -out ssl/server-prod.crt -days 365 -extensions v3_req -extfile ssl/openssl.conf

# Set proper permissions
echo -e "${BLUE}4. Setting proper permissions...${NC}"
chmod 600 ssl/server-prod.key
chmod 644 ssl/server-prod.crt
chmod 644 ssl/server-prod.csr

# Verify certificate
echo -e "${BLUE}5. Verifying certificate...${NC}"
if openssl x509 -in ssl/server-prod.crt -text -noout > /dev/null 2>&1; then
    echo -e "${GREEN}✅ SSL certificate generated successfully!${NC}"
    
    # Display certificate info
    echo -e "${YELLOW}Certificate Information:${NC}"
    openssl x509 -in ssl/server-prod.crt -text -noout | grep -E "Subject:|Not Before:|Not After:|DNS:|IP Address:"
    
    echo -e "${GREEN}Files created:${NC}"
    echo -e "  📄 ssl/server-prod.key (private key)"
    echo -e "  📄 ssl/server-prod.crt (certificate)"
    echo -e "  📄 ssl/server-prod.csr (certificate request)"
    
    echo -e "${YELLOW}⚠️  IMPORTANT NOTES:${NC}"
    echo -e "  • This is a self-signed certificate"
    echo -e "  • Browsers will show security warnings"
    echo -e "  • For production, consider using Let's Encrypt or a CA-signed certificate"
    echo -e "  • To bypass browser warnings, you can:"
    echo -e "    - Click 'Advanced' → 'Proceed to 46.202.168.1 (unsafe)'"
    echo -e "    - Or use HTTP instead: http://46.202.168.1:4000"
    
else
    echo -e "${RED}❌ Certificate verification failed${NC}"
    exit 1
fi

# Clean up CSR file (optional)
# rm ssl/server-prod.csr

echo -e "${GREEN}🎉 SSL setup completed!${NC}"
echo -e "${BLUE}You can now start your server with HTTPS support.${NC}"
