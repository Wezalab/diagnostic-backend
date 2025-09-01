#!/bin/bash

# Fix SSL Certificate Common Name Issue
echo "🔧 Fixing SSL certificate Common Name for 46.202.168.1..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SERVER_IP="46.202.168.1"

echo -e "${BLUE}1. Stopping Nginx temporarily...${NC}"
systemctl stop nginx

echo -e "${BLUE}2. Backing up old certificate...${NC}"
cp /etc/nginx/ssl/diagnostic.crt /etc/nginx/ssl/diagnostic.crt.backup 2>/dev/null || true
cp /etc/nginx/ssl/diagnostic.key /etc/nginx/ssl/diagnostic.key.backup 2>/dev/null || true

echo -e "${BLUE}3. Generating new certificate with correct Common Name...${NC}"
# Generate new certificate with proper CN and SAN
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "/etc/nginx/ssl/diagnostic.key" \
    -out "/etc/nginx/ssl/diagnostic.crt" \
    -subj "/C=US/ST=Production/L=Server/O=Diagnostic Backend/OU=SSL Certificate/CN=$SERVER_IP" \
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
OU = SSL Certificate
CN = $SERVER_IP

[v3_req]
keyUsage = critical, digitalSignature, keyEncipherment, keyAgreement
extendedKeyUsage = serverAuth
subjectAltName = @alt_names
basicConstraints = CA:FALSE

[alt_names]
IP.1 = $SERVER_IP
DNS.1 = $SERVER_IP
EOF
)

# Set proper permissions
chmod 600 "/etc/nginx/ssl/diagnostic.key"
chmod 644 "/etc/nginx/ssl/diagnostic.crt"

echo -e "${BLUE}4. Verifying new certificate...${NC}"
echo "Certificate subject:"
openssl x509 -in /etc/nginx/ssl/diagnostic.crt -noout -subject
echo "Certificate SAN:"
openssl x509 -in /etc/nginx/ssl/diagnostic.crt -noout -text | grep -A2 "Subject Alternative Name"

echo -e "${BLUE}5. Testing Nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo "❌ Nginx configuration error"
    exit 1
fi

echo -e "${BLUE}6. Starting Nginx...${NC}"
systemctl start nginx

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx started successfully${NC}"
else
    echo "❌ Failed to start Nginx"
    exit 1
fi

echo -e "${GREEN}🎉 SSL certificate fixed!${NC}"

echo -e "${YELLOW}📋 Certificate Details:${NC}"
echo -e "  🔒 Common Name: $SERVER_IP"
echo -e "  🌐 Subject Alternative Name: IP:$SERVER_IP, DNS:$SERVER_IP"
echo -e "  📅 Valid for: 365 days"

echo -e "${YELLOW}🧪 Test the fix:${NC}"
echo -e "  curl -k https://$SERVER_IP/test"
echo -e "  Browser: https://$SERVER_IP"

echo -e "${YELLOW}⚠️  Note:${NC}"
echo -e "  • You may still see a security warning (this is normal for self-signed certificates)"
echo -e "  • The error should now be ERR_CERT_AUTHORITY_INVALID instead of ERR_CERT_COMMON_NAME_INVALID"
echo -e "  • Click 'Advanced' → 'Proceed to $SERVER_IP (unsafe)' to continue"

echo -e "${GREEN}✅ Your frontend API calls should now work properly!${NC}"
