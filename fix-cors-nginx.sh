#!/bin/bash

# Fix CORS duplication issue - Remove CORS headers from nginx, let Express handle CORS

echo "🔧 Fixing CORS duplication issue..."

# Update the nginx configuration to remove CORS headers
cat > /etc/nginx/sites-available/diagnostic-backend << 'EOF'
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name api.alphanew.coach;
    return 301 https://$server_name$request_uri;
}

# HTTPS server with Let's Encrypt SSL
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.alphanew.coach;

    # Let's Encrypt SSL Certificate
    ssl_certificate /etc/letsencrypt/live/api.alphanew.coach/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.alphanew.coach/privkey.pem;

    # Modern SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers (no CORS - let Express handle it)
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

    # Serve static files (uploads)
    location /uploads/ {
        alias /var/www/diagnostic-backend/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # Security for uploads
        location ~* \.(php|pl|py|jsp|asp|sh|cgi)$ {
            deny all;
        }
    }

    # Main API proxy to Node.js backend
    location / {
        proxy_pass http://127.0.0.1:4000;
        
        # Proxy headers
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Proxy timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:4000/test;
        access_log off;
    }
}
EOF

echo "✅ Updated nginx configuration (removed CORS headers)"

# Test configuration
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    echo "🔄 Reloading nginx..."
    systemctl reload nginx
    echo "🎉 CORS fix applied! Your Express app will now handle all CORS headers."
else
    echo "❌ Nginx configuration error"
    exit 1
fi
