# Nginx Reverse Proxy Setup Guide

This guide shows how to set up Nginx as a reverse proxy with SSL termination for your diagnostic backend, eliminating SSL certificate errors and providing production-ready HTTPS.

## 🎯 **Why Use Nginx Reverse Proxy?**

### **Benefits**:
- ✅ **Proper SSL termination** - No more browser warnings
- ✅ **Better performance** - Static file serving, compression, caching
- ✅ **Security** - Security headers, rate limiting, DDoS protection
- ✅ **Scalability** - Load balancing, multiple backend instances
- ✅ **Let's Encrypt support** - Free, trusted SSL certificates
- ✅ **Production ready** - Battle-tested, used by millions of sites

### **Architecture**:
```
[Browser] ──HTTPS──► [Nginx:443] ──HTTP──► [Node.js:4000]
                         │
                    [SSL Termination]
```

## 🚀 **Quick Setup Options**

### **Option 1: Self-Signed Certificates (Immediate)**
```bash
# On your Ubuntu server
sudo ./setup-nginx.sh
```
- ✅ Works immediately
- ⚠️ Browser warnings (click "Advanced" → "Proceed")
- 🎯 Perfect for development/testing

### **Option 2: Let's Encrypt Certificates (Production)**
```bash
# 1. Edit configuration
nano setup-nginx-letsencrypt.sh  # Set DOMAIN and EMAIL

# 2. Run setup
sudo ./setup-nginx-letsencrypt.sh
```
- ✅ No browser warnings
- ✅ Trusted by all browsers
- ✅ Auto-renewal
- 🎯 Perfect for production

## 📋 **Detailed Setup Instructions**

### **Prerequisites**

1. **Ubuntu server** with root access
2. **Domain name** (for Let's Encrypt only)
3. **Ports 80 and 443** available
4. **Node.js backend** running on port 4000

### **Self-Signed Certificate Setup**

1. **Run the setup script**:
   ```bash
   sudo ./setup-nginx.sh
   ```

2. **Deploy your backend**:
   ```bash
   # Copy files to /var/www/diagnostic-backend
   sudo cp -r . /var/www/diagnostic-backend/
   
   # Set environment for proxy mode
   export HTTPS_DISABLED=true
   export TRUST_PROXY=true
   
   # Start backend
   pm2 start ecosystem.config.js --env production
   ```

3. **Access your API**:
   ```bash
   # Test the setup
   curl -k https://46.202.168.1/test
   
   # In browser: https://46.202.168.1
   # Click "Advanced" → "Proceed to 46.202.168.1 (unsafe)"
   ```

### **Let's Encrypt Certificate Setup**

1. **Prerequisites**:
   - Domain name pointing to your server IP
   - DNS propagation completed

2. **Configure the script**:
   ```bash
   nano setup-nginx-letsencrypt.sh
   
   # Update these lines:
   DOMAIN="yourdomain.com"
   EMAIL="admin@yourdomain.com"
   ```

3. **Run the setup**:
   ```bash
   sudo ./setup-nginx-letsencrypt.sh
   ```

4. **Deploy and test**:
   ```bash
   # Test with trusted certificate
   curl https://yourdomain.com/test
   
   # Should return: "diagnostic api responding successfully ..."
   ```

## 🔧 **Configuration Details**

### **Nginx Configuration Features**

The `nginx/diagnostic-backend.conf` includes:

```nginx
# SSL Termination
listen 443 ssl http2;
ssl_certificate /path/to/certificate;
ssl_certificate_key /path/to/private-key;

# Security Headers
add_header Strict-Transport-Security "max-age=31536000";
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;

# Reverse Proxy
location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;
}

# Static Files
location /uploads/ {
    alias /var/www/diagnostic-backend/uploads/;
    expires 1y;
}
```

### **Backend Configuration**

Your Node.js backend automatically:
- **Trusts proxy** when `TRUST_PROXY=true`
- **Disables HTTPS** when `HTTPS_DISABLED=true`
- **Accepts forwarded headers** for real client IPs
- **Handles CORS** for the new endpoints

## 🛠️ **Management Commands**

### **NPM Scripts**
```bash
# Nginx management
npm run nginx:setup          # Setup with self-signed certs
npm run nginx:letsencrypt     # Setup with Let's Encrypt
npm run nginx:status          # Check Nginx status
npm run nginx:restart         # Restart Nginx
npm run nginx:logs            # View error logs

# SSL management
npm run ssl:check             # Check certificate info
```

### **Manual Commands**
```bash
# Nginx management
sudo systemctl status nginx          # Check status
sudo systemctl restart nginx         # Restart
sudo systemctl reload nginx          # Reload config
sudo nginx -t                        # Test configuration

# Certificate management
sudo certbot certificates             # List certificates
sudo certbot renew --dry-run         # Test renewal
sudo certbot renew                   # Force renewal

# Logs
sudo tail -f /var/log/nginx/diagnostic-backend.access.log
sudo tail -f /var/log/nginx/diagnostic-backend.error.log
```

## 🔍 **Troubleshooting**

### **Common Issues**

#### **1. "Connection Refused"**
```bash
# Check if backend is running
pm2 status

# Check if backend is listening on port 4000
netstat -tulpn | grep :4000

# Start backend if needed
pm2 start ecosystem.config.js --env production
```

#### **2. "502 Bad Gateway"**
```bash
# Check backend logs
pm2 logs diagnostic-backend

# Check Nginx error logs
sudo tail -f /var/log/nginx/diagnostic-backend.error.log

# Verify proxy configuration
sudo nginx -t
```

#### **3. "SSL Certificate Error"**
```bash
# Check certificate validity
sudo openssl x509 -in /etc/nginx/ssl/diagnostic-backend.crt -text -noout

# For Let's Encrypt
sudo certbot certificates

# Regenerate if needed
sudo ./setup-nginx.sh  # Self-signed
# OR
sudo ./setup-nginx-letsencrypt.sh  # Let's Encrypt
```

#### **4. "Permission Denied"**
```bash
# Check file permissions
ls -la /etc/nginx/ssl/
ls -la /var/www/diagnostic-backend/

# Fix permissions
sudo chown -R www-data:www-data /var/www/diagnostic-backend/
sudo chmod 644 /etc/nginx/ssl/diagnostic-backend.crt
sudo chmod 600 /etc/nginx/ssl/diagnostic-backend.key
```

### **Let's Encrypt Specific Issues**

#### **Domain Validation Failed**
```bash
# Check DNS resolution
dig yourdomain.com

# Check if domain points to your server
nslookup yourdomain.com

# Verify port 80 is available
sudo netstat -tulpn | grep :80
```

#### **Rate Limit Exceeded**
```bash
# Use staging environment for testing
certbot certonly --staging --nginx -d yourdomain.com

# Remove staging cert and get production cert
sudo certbot delete --cert-name yourdomain.com
sudo ./setup-nginx-letsencrypt.sh
```

## 📱 **Frontend Integration**

### **Update API Base URL**

After setting up Nginx, update your frontend configuration:

```javascript
// Before (direct backend)
const API_BASE_URL = 'https://46.202.168.1:4443';

// After (Nginx reverse proxy)
const API_BASE_URL = 'https://46.202.168.1';        // Self-signed
// OR
const API_BASE_URL = 'https://yourdomain.com';       // Let's Encrypt
```

### **Remove Port Numbers**

Nginx serves on standard ports:
- **HTTP**: Port 80 (default)
- **HTTPS**: Port 443 (default)

No need to specify ports in URLs.

### **Example Frontend Configuration**

```javascript
// config/api.js
const config = {
  development: {
    apiUrl: 'http://localhost:4000'
  },
  production: {
    apiUrl: 'https://yourdomain.com'  // or https://46.202.168.1
  }
};

export const API_BASE_URL = config[process.env.NODE_ENV || 'development'].apiUrl;
```

## 🔐 **Security Considerations**

### **What Nginx Provides**

- ✅ **SSL/TLS termination** with modern cipher suites
- ✅ **Security headers** (HSTS, XSS protection, etc.)
- ✅ **Rate limiting** (can be configured)
- ✅ **Request filtering** (file type restrictions)
- ✅ **DDoS protection** (basic)

### **Additional Security**

```nginx
# Add to nginx configuration for enhanced security
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

server {
    # Rate limiting
    limit_req zone=api burst=20 nodelay;
    
    # Block common attacks
    location ~ /\. { deny all; }
    location ~ ~$ { deny all; }
    
    # File upload restrictions
    location /uploads/ {
        location ~* \.(php|pl|py|jsp|asp|sh|cgi)$ {
            deny all;
        }
    }
}
```

## 📊 **Performance Benefits**

### **Static File Serving**
- **Uploads served by Nginx** (not Node.js)
- **Better caching** with proper headers
- **Compression** (gzip) enabled

### **HTTP/2 Support**
- **Multiplexing** - faster page loads
- **Server push** capabilities
- **Header compression**

### **Load Balancing** (Future)
```nginx
upstream backend {
    server 127.0.0.1:4000;
    server 127.0.0.1:4001;  # Additional instances
    server 127.0.0.1:4002;
}

location / {
    proxy_pass http://backend;
}
```

## 📋 **Deployment Checklist**

### **Before Deployment**
- [ ] Domain configured (for Let's Encrypt)
- [ ] DNS pointing to server
- [ ] Ports 80/443 available
- [ ] Root access to server

### **Self-Signed Setup**
- [ ] Run `sudo ./setup-nginx.sh`
- [ ] Deploy backend code
- [ ] Set `HTTPS_DISABLED=true`
- [ ] Start backend with PM2
- [ ] Test: `curl -k https://46.202.168.1/test`
- [ ] Update frontend API URL

### **Let's Encrypt Setup**
- [ ] Update domain in script
- [ ] Run `sudo ./setup-nginx-letsencrypt.sh`
- [ ] Deploy backend code
- [ ] Set `HTTPS_DISABLED=true`
- [ ] Start backend with PM2
- [ ] Test: `curl https://yourdomain.com/test`
- [ ] Update frontend API URL

### **Post-Deployment**
- [ ] Test all API endpoints
- [ ] Test file uploads
- [ ] Check SSL certificate
- [ ] Monitor logs
- [ ] Setup monitoring/alerting

## 🎉 **Expected Results**

After successful setup:

✅ **Frontend API calls work** without SSL errors  
✅ **Browser shows secure connection** (lock icon)  
✅ **Better performance** with static file serving  
✅ **Production-ready** SSL configuration  
✅ **Auto-renewal** (Let's Encrypt)  
✅ **Security headers** included  

Your `ERR_CERT_AUTHORITY_INVALID` error will be completely eliminated! 🔒

---

**Last Updated**: January 2024  
**Server**: 46.202.168.1  
**Ports**: 80 (HTTP), 443 (HTTPS)
