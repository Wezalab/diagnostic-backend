# Multiple Applications on Same Server - Nginx Configuration

This guide explains how to run multiple applications on the same server with Nginx reverse proxy, ensuring each app is accessible without conflicts.

## 🎯 **What Happens to Other Apps?**

### **Current Nginx Setup Impact:**

✅ **Other apps are NOT affected**:
- Apps on different ports (5000, 6000, 8080, etc.) continue working
- Direct access via `http://46.202.168.1:5000` still works
- Only ports 80 and 443 are handled by Nginx

⚠️ **Port 80 and 443 conflicts**:
- If other apps use port 80 or 443, they'll conflict with Nginx
- You'll need to reconfigure them to use different ports

## 🏗️ **Architecture Examples**

### **Current Setup (Single App)**
```
Port 80:   Nginx ──► Redirect to HTTPS
Port 443:  Nginx ──► diagnostic-backend:4000
Port 4000: diagnostic-backend (internal)
Port 5000: other-app (still accessible directly)
Port 6000: another-app (still accessible directly)
```

### **Multi-App Setup with Subdomains**
```
Port 443:  Nginx ──► diagnostic.yourdomain.com ──► diagnostic-backend:4000
           Nginx ──► shop.yourdomain.com ──► shop-app:5000
           Nginx ──► blog.yourdomain.com ──► blog-app:6000
```

### **Multi-App Setup with Paths**
```
Port 443:  Nginx ──► yourdomain.com/api ──► diagnostic-backend:4000
           Nginx ──► yourdomain.com/shop ──► shop-app:5000
           Nginx ──► yourdomain.com/blog ──► blog-app:6000
```

## 🔧 **Configuration Options**

### **Option 1: Keep Current Setup (Simplest)**

Your current Nginx setup only affects the diagnostic backend:

```nginx
# /etc/nginx/sites-available/diagnostic-backend
server {
    listen 443 ssl;
    server_name 46.202.168.1;  # or yourdomain.com
    
    location / {
        proxy_pass http://127.0.0.1:4000;  # Only diagnostic-backend
    }
}
```

**Other apps remain accessible**:
- `http://46.202.168.1:5000` ✅ Still works
- `http://46.202.168.1:6000` ✅ Still works
- `https://46.202.168.1/` → diagnostic-backend

### **Option 2: Multiple Apps with Subdomains**

Create separate Nginx configurations for each app:

```bash
# Diagnostic backend
server {
    listen 443 ssl;
    server_name diagnostic.yourdomain.com;
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://127.0.0.1:4000;
    }
}

# Shop app
server {
    listen 443 ssl;
    server_name shop.yourdomain.com;
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
    }
}

# Blog app
server {
    listen 443 ssl;
    server_name blog.yourdomain.com;
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://127.0.0.1:6000;
    }
}
```

### **Option 3: Multiple Apps with Path-Based Routing**

Route different paths to different applications:

```nginx
server {
    listen 443 ssl;
    server_name 46.202.168.1;
    
    # Diagnostic backend (main app)
    location / {
        proxy_pass http://127.0.0.1:4000;
    }
    
    # Shop app
    location /shop/ {
        proxy_pass http://127.0.0.1:5000/;
        proxy_set_header X-Forwarded-Path /shop;
    }
    
    # Admin panel
    location /admin/ {
        proxy_pass http://127.0.0.1:6000/;
        proxy_set_header X-Forwarded-Path /admin;
    }
    
    # API gateway
    location /api/v2/ {
        proxy_pass http://127.0.0.1:7000/;
    }
}
```

## 📝 **Step-by-Step Multi-App Setup**

### **Setup Multiple Apps with Subdomains**

1. **Create DNS records**:
   ```
   A    diagnostic.yourdomain.com    46.202.168.1
   A    shop.yourdomain.com          46.202.168.1
   A    blog.yourdomain.com          46.202.168.1
   ```

2. **Generate certificates for all subdomains**:
   ```bash
   sudo certbot certonly --nginx \
     -d diagnostic.yourdomain.com \
     -d shop.yourdomain.com \
     -d blog.yourdomain.com
   ```

3. **Create Nginx configurations**:
   ```bash
   # Diagnostic backend
   sudo cp nginx/diagnostic-backend.conf /etc/nginx/sites-available/diagnostic
   
   # Shop app
   sudo cp nginx/diagnostic-backend.conf /etc/nginx/sites-available/shop
   # Edit server_name and proxy_pass port
   
   # Enable all sites
   sudo ln -s /etc/nginx/sites-available/diagnostic /etc/nginx/sites-enabled/
   sudo ln -s /etc/nginx/sites-available/shop /etc/nginx/sites-enabled/
   ```

### **Setup Multiple Apps with Paths**

1. **Update main Nginx config**:
   ```bash
   sudo nano /etc/nginx/sites-available/diagnostic-backend
   ```

2. **Add location blocks for each app**:
   ```nginx
   # Add to existing server block
   location /shop/ {
       proxy_pass http://127.0.0.1:5000/;
       # Copy other proxy settings from main location
   }
   
   location /admin/ {
       proxy_pass http://127.0.0.1:6000/;
   }
   ```

3. **Update app configurations** to handle base paths.

## 🛡️ **Security Considerations**

### **Firewall Configuration**

With Nginx handling external traffic:

```bash
# Allow only Nginx ports externally
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Block direct access to app ports (optional)
sudo ufw deny 4000/tcp  # Diagnostic backend
sudo ufw deny 5000/tcp  # Shop app
sudo ufw deny 6000/tcp  # Blog app

# Allow internal access
sudo ufw allow from 127.0.0.1 to any port 4000
sudo ufw allow from 127.0.0.1 to any port 5000
sudo ufw allow from 127.0.0.1 to any port 6000
```

### **App Security**

```javascript
// In each app, bind only to localhost
app.listen(4000, '127.0.0.1', () => {
    console.log('App listening on localhost:4000');
});
```

## 📊 **Example Multi-App Script**

Here's a script to set up multiple apps:

```bash
#!/bin/bash
# setup-multi-app-nginx.sh

DOMAIN="yourdomain.com"
APPS=(
    "diagnostic:4000"
    "shop:5000"
    "blog:6000"
    "admin:7000"
)

# Get certificates for all subdomains
SUBDOMAINS=""
for app in "${APPS[@]}"; do
    subdomain=$(echo $app | cut -d: -f1)
    SUBDOMAINS="$SUBDOMAINS -d $subdomain.$DOMAIN"
done

sudo certbot certonly --nginx $SUBDOMAINS

# Create Nginx configs for each app
for app in "${APPS[@]}"; do
    subdomain=$(echo $app | cut -d: -f1)
    port=$(echo $app | cut -d: -f2)
    
    cat > /etc/nginx/sites-available/$subdomain << EOF
server {
    listen 80;
    server_name $subdomain.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $subdomain.$DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    location / {
        proxy_pass http://127.0.0.1:$port;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    
    sudo ln -s /etc/nginx/sites-available/$subdomain /etc/nginx/sites-enabled/
done

sudo nginx -t && sudo systemctl reload nginx
```

## 🔍 **Troubleshooting Multi-App Setup**

### **Port Conflicts**

```bash
# Check what's using port 80/443
sudo netstat -tulpn | grep -E ':80|:443'

# Stop conflicting services
sudo systemctl stop apache2  # If Apache is running
sudo systemctl stop other-app
```

### **SSL Certificate Issues**

```bash
# Check certificates
sudo certbot certificates

# Add subdomain to existing certificate
sudo certbot --expand -d yourdomain.com -d newapp.yourdomain.com
```

### **Routing Issues**

```bash
# Test each app individually
curl http://127.0.0.1:4000/test  # Diagnostic backend
curl http://127.0.0.1:5000/test  # Shop app

# Test through Nginx
curl https://diagnostic.yourdomain.com/test
curl https://shop.yourdomain.com/test
```

## 📱 **Frontend Configuration**

### **Subdomain Approach**

```javascript
// Different apps, different subdomains
const API_CONFIGS = {
  diagnostic: 'https://diagnostic.yourdomain.com',
  shop: 'https://shop.yourdomain.com',
  blog: 'https://blog.yourdomain.com'
};
```

### **Path-Based Approach**

```javascript
// Same domain, different paths
const API_CONFIGS = {
  diagnostic: 'https://yourdomain.com',
  shop: 'https://yourdomain.com/shop',
  admin: 'https://yourdomain.com/admin'
};
```

## 🎯 **Recommendations**

### **For Your Situation**

1. **Keep it simple initially**:
   - Use current setup for diagnostic backend
   - Keep other apps on their original ports
   - Add Nginx configs later if needed

2. **If you want all apps behind Nginx**:
   - Use subdomain approach for better separation
   - Each app gets its own SSL certificate
   - Easier to manage and scale

3. **For development**:
   - Keep direct port access for debugging
   - Use Nginx only for production traffic

### **Example Configuration**

```bash
# Current working setup
https://46.202.168.1/          → diagnostic-backend:4000 (via Nginx)
http://46.202.168.1:5000/      → shop-app:5000 (direct)
http://46.202.168.1:6000/      → blog-app:6000 (direct)

# Future enhanced setup
https://diagnostic.yourdomain.com/  → diagnostic-backend:4000
https://shop.yourdomain.com/        → shop-app:5000
https://blog.yourdomain.com/        → blog-app:6000
```

## ✅ **Summary**

- **Other apps are safe** - Nginx only affects ports 80/443
- **Direct port access still works** for other applications
- **Multiple apps can coexist** with proper Nginx configuration
- **Subdomain approach is recommended** for multiple apps
- **Path-based routing is possible** but more complex

Your current setup will only affect the diagnostic backend. Other apps on different ports will continue working as before! 🚀

---

**Last Updated**: January 2024  
**Server**: 46.202.168.1  
**Apps**: Multiple on different ports
