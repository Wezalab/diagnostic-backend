# IP-Only Nginx Setup Guide (No Domain Required)

This guide shows how to set up Nginx reverse proxy for multiple applications using only an IP address (46.202.168.1), without needing a domain name.

## 🎯 **Why IP-Only Setup?**

### **Benefits:**
- ✅ **No domain required** - Works with just your server IP
- ✅ **Multiple apps support** - Path-based routing
- ✅ **SSL termination** - Handles SSL properly (with warnings)
- ✅ **Immediate setup** - No DNS configuration needed
- ✅ **Cost effective** - No domain registration costs

### **Limitations:**
- ⚠️ **Browser warnings** - "Your connection is not private"
- ❌ **No Let's Encrypt** - Can't use trusted certificates with IP
- 🔒 **Self-signed only** - Must use self-signed certificates

## 🏗️ **Architecture**

```
[Frontend] ──HTTPS──► [Nginx:443] ──HTTP──► [Apps on different ports]
                          │
                    [SSL Termination]
                          │
                    [Path-based Routing]
                          ├─ / ──► diagnostic:4000
                          ├─ /shop/ ──► shop:5000  
                          ├─ /admin/ ──► admin:6000
                          └─ /api/ ──► api:8080
```

## 🚀 **Quick Setup**

### **1. Configure Your Apps**

Edit the setup script to match your applications:

```bash
nano setup-nginx-ip-only.sh

# Update this section:
APPS=(
    "diagnostic:4000"    # Your diagnostic backend
    "shop:5000"          # Replace with your actual app names
    "admin:6000"         # and their ports
    "api:8080"
)
```

### **2. Run the Setup**

```bash
sudo ./setup-nginx-ip-only.sh
```

### **3. Access Your Apps**

```
🌐 Main app (diagnostic): https://46.202.168.1/
🛍️ Shop app:             https://46.202.168.1/shop/
⚙️ Admin panel:          https://46.202.168.1/admin/
🔌 API service:          https://46.202.168.1/api/
```

## 📋 **URL Structure**

### **Application Routing:**

| Application | Original Port | New URL | Internal Route |
|-------------|---------------|---------|----------------|
| Diagnostic (main) | 4000 | `https://46.202.168.1/` | Root path |
| Shop | 5000 | `https://46.202.168.1/shop/` | `/shop/` → port 5000 |
| Admin | 6000 | `https://46.202.168.1/admin/` | `/admin/` → port 6000 |
| API | 8080 | `https://46.202.168.1/api/` | `/api/` → port 8080 |

### **Frontend Configuration:**

Update your frontend API calls:

```javascript
// Before (failing due to SSL)
const API_ENDPOINTS = {
  diagnostic: 'https://46.202.168.1:4443',
  shop: 'http://46.202.168.1:5000',
  admin: 'http://46.202.168.1:6000'
};

// After (working through Nginx)
const API_ENDPOINTS = {
  diagnostic: 'https://46.202.168.1',           // Main app
  shop: 'https://46.202.168.1/shop',            // Path-based
  admin: 'https://46.202.168.1/admin',          // Path-based
  api: 'https://46.202.168.1/api'               // Path-based
};
```

## 🔧 **Configuration Details**

### **Nginx Configuration Features:**

```nginx
# Main server block for IP
server {
    listen 443 ssl http2;
    server_name 46.202.168.1;
    
    # Self-signed SSL certificate
    ssl_certificate /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;
    
    # Main diagnostic app (root path)
    location / {
        proxy_pass http://127.0.0.1:4000;
    }
    
    # Other apps (path-based)
    location /shop/ {
        rewrite ^/shop/(.*) /$1 break;
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header X-Forwarded-Path /shop;
    }
    
    location /admin/ {
        rewrite ^/admin/(.*) /$1 break;
        proxy_pass http://127.0.0.1:6000;
        proxy_set_header X-Forwarded-Path /admin;
    }
}
```

### **Backend Configuration:**

Configure each app to work behind the proxy:

```javascript
// In each app's configuration
app.set('trust proxy', true);  // Trust Nginx proxy

// Listen only on localhost (not 0.0.0.0)
app.listen(port, '127.0.0.1', () => {
    console.log(`App running on localhost:${port}`);
});

// Environment variables
process.env.HTTPS_DISABLED = 'true';  // Nginx handles SSL
process.env.TRUST_PROXY = 'true';     // Trust proxy headers
```

## 🛡️ **Security Configuration**

### **Firewall Rules:**

The setup automatically configures:

```bash
# Allow Nginx ports
ufw allow 80/tcp
ufw allow 443/tcp

# Block direct access to app ports
ufw deny 4000/tcp  # Diagnostic
ufw deny 5000/tcp  # Shop
ufw deny 6000/tcp  # Admin

# Allow internal access only
ufw allow from 127.0.0.1 to any port 4000
ufw allow from 127.0.0.1 to any port 5000
ufw allow from 127.0.0.1 to any port 6000
```

### **SSL Certificate:**

Self-signed certificate with IP address:

```bash
# Generated automatically by the script
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/server.key \
    -out /etc/nginx/ssl/server.crt \
    -subj "/CN=46.202.168.1" \
    -extensions v3_req \
    -config <(echo "[v3_req]"; echo "subjectAltName=IP:46.202.168.1")
```

## 🔍 **Handling Browser Warnings**

### **Expected Behavior:**

When accessing `https://46.202.168.1`, you'll see:

```
⚠️ Your connection is not private
Attackers might be trying to steal your information from 46.202.168.1
NET::ERR_CERT_AUTHORITY_INVALID
```

### **How to Proceed:**

1. **Click "Advanced"**
2. **Click "Proceed to 46.202.168.1 (unsafe)"**
3. **Your app will work normally**

### **Why This Happens:**

- Self-signed certificates aren't trusted by browsers
- IP addresses can't use Let's Encrypt certificates
- This is expected behavior, not a problem

### **For Development Teams:**

```javascript
// Disable SSL verification in development (NOT for production)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Or in axios configuration
const api = axios.create({
  baseURL: 'https://46.202.168.1',
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});
```

## 🛠️ **Management & Monitoring**

### **NPM Scripts:**

Add to your package.json:

```json
{
  "scripts": {
    "nginx:setup-ip": "sudo ./setup-nginx-ip-only.sh",
    "nginx:status": "sudo systemctl status nginx",
    "nginx:restart": "sudo systemctl restart nginx",
    "nginx:logs": "sudo tail -f /var/log/nginx/multi-app.error.log",
    "nginx:test": "sudo nginx -t"
  }
}
```

### **Useful Commands:**

```bash
# Check all services
sudo systemctl status nginx
pm2 status

# Test individual apps
curl -k https://46.202.168.1/test         # Diagnostic
curl -k https://46.202.168.1/shop/health  # Shop
curl -k https://46.202.168.1/admin/health # Admin

# Monitor logs
sudo tail -f /var/log/nginx/multi-app.access.log
sudo tail -f /var/log/nginx/multi-app.error.log

# Restart services
sudo systemctl restart nginx
pm2 restart all
```

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **1. 502 Bad Gateway**
```bash
# Check if backend apps are running
pm2 status
curl http://127.0.0.1:4000/test

# Check Nginx logs
sudo tail -f /var/log/nginx/multi-app.error.log
```

#### **2. SSL Certificate Errors**
```bash
# Verify certificate
openssl x509 -in /etc/nginx/ssl/server.crt -text -noout

# Regenerate if needed
sudo ./setup-nginx-ip-only.sh
```

#### **3. App Not Accessible**
```bash
# Check Nginx configuration
sudo nginx -t

# Check port binding
netstat -tulpn | grep :4000

# Check firewall
sudo ufw status
```

#### **4. Path Routing Issues**
```bash
# Test specific paths
curl -k https://46.202.168.1/shop/
curl -k https://46.202.168.1/admin/

# Check proxy headers in app logs
console.log(req.headers['x-forwarded-path']);
```

### **App-Specific Fixes:**

#### **For Express.js Apps:**
```javascript
// Handle proxy paths correctly
app.use((req, res, next) => {
  const forwardedPath = req.headers['x-forwarded-path'];
  if (forwardedPath) {
    req.baseUrl = forwardedPath;
  }
  next();
});

// Fix asset paths for apps not on root
if (process.env.BASE_PATH) {
  app.use(express.static('public', {
    prefix: process.env.BASE_PATH
  }));
}
```

#### **For React Apps:**
```javascript
// In React app's package.json for non-root apps
{
  "homepage": "/shop",  // For shop app
  "scripts": {
    "build": "PUBLIC_URL=/shop react-scripts build"
  }
}
```

## 📊 **Performance Considerations**

### **Static File Serving:**

```nginx
# Serve static files directly from Nginx
location /shop/static/ {
    alias /var/www/shop-app/build/static/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /uploads/ {
    alias /var/www/diagnostic-backend/uploads/;
    expires 1y;
}
```

### **Caching:**

```nginx
# Add caching for API responses
location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    proxy_pass http://127.0.0.1:8080;
}
```

## 🎯 **Comparison: IP vs Domain**

| Feature | IP-Only Setup | Domain Setup |
|---------|---------------|--------------|
| **Setup Time** | ✅ Immediate | ⏱️ Requires DNS |
| **Cost** | ✅ Free | 💰 Domain cost |
| **SSL Warnings** | ❌ Always | ✅ None (Let's Encrypt) |
| **Professional Look** | ❌ IP addresses | ✅ Custom domain |
| **Let's Encrypt** | ❌ Not supported | ✅ Supported |
| **Subdomain Support** | ❌ Path-based only | ✅ Full subdomain support |

## 📝 **Deployment Checklist**

### **Before Setup:**
- [ ] List all your applications and ports
- [ ] Stop any services using ports 80/443
- [ ] Ensure root access to server
- [ ] Backup existing Nginx config (if any)

### **During Setup:**
- [ ] Update APPS array in script
- [ ] Run `sudo ./setup-nginx-ip-only.sh`
- [ ] Accept browser security warnings for testing
- [ ] Verify all apps are accessible

### **After Setup:**
- [ ] Update frontend API configurations
- [ ] Test all application endpoints
- [ ] Configure app environment variables
- [ ] Set up monitoring/logging
- [ ] Document new URLs for team

### **App Configuration:**
- [ ] Set `HTTPS_DISABLED=true` in each app
- [ ] Set `TRUST_PROXY=true` in each app
- [ ] Bind apps to `127.0.0.1` (not `0.0.0.0`)
- [ ] Update asset paths for non-root apps
- [ ] Test proxy header handling

## ✅ **Expected Results**

After successful setup:

✅ **All apps accessible via HTTPS** (with warnings)  
✅ **SSL termination handled by Nginx**  
✅ **Path-based routing working**  
✅ **Direct port access blocked**  
✅ **Security headers added**  
✅ **Static file serving optimized**  

Your `ERR_CERT_AUTHORITY_INVALID` error will be eliminated, though you'll need to accept browser warnings for self-signed certificates.

## 🚀 **Future Upgrades**

### **When You Get a Domain:**

1. **Register domain** and point to your IP
2. **Switch to domain-based setup**:
   ```bash
   sudo ./setup-nginx-letsencrypt.sh
   ```
3. **Get trusted SSL certificates** (Let's Encrypt)
4. **No more browser warnings**
5. **Use subdomains** instead of paths

### **Subdomain Migration:**

```bash
# From paths:
https://46.202.168.1/shop/

# To subdomains:
https://shop.yourdomain.com/
```

---

**Last Updated**: January 2024  
**Server IP**: 46.202.168.1  
**SSL**: Self-signed certificates (browser warnings expected)
