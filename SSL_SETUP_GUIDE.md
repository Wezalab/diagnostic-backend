# SSL Certificate Setup Guide

This guide helps you set up proper SSL certificates for your diagnostic backend server to eliminate browser security warnings.

## 🔍 **The Problem**

When accessing `https://46.202.168.1:4443`, browsers show:
```
Your connection is not private
Attackers might be trying to steal your information from 46.202.168.1
net::ERR_CERT_AUTHORITY_INVALID
```

This happens because:
- Your server uses self-signed certificates
- Browsers don't trust self-signed certificates by default
- No valid SSL certificates are present

## 🚀 **Quick Solutions**

### Option 1: Generate Self-Signed Certificates (Immediate)

```bash
# On your Ubuntu server
./generate-ssl-cert.sh
```

**Pros**: Works immediately, no external dependencies  
**Cons**: Browser warnings persist, not recommended for production  

### Option 2: Use Let's Encrypt (Recommended for Production)

```bash
# 1. Update the domain in setup-letsencrypt.sh
nano setup-letsencrypt.sh  # Set your domain and email

# 2. Run the setup (requires root)
sudo ./setup-letsencrypt.sh
```

**Pros**: Trusted by browsers, free, auto-renewal  
**Cons**: Requires domain name (can't use IP address)  

### Option 3: Use HTTP Instead (Development/Testing)

Access your server using HTTP:
```
http://46.202.168.1:4000
```

**Pros**: No SSL warnings, works immediately  
**Cons**: No encryption, not secure for production  

## 📋 **Detailed Setup Instructions**

### Self-Signed Certificate Setup

1. **Generate certificates**:
   ```bash
   ./generate-ssl-cert.sh
   ```

2. **Verify generation**:
   ```bash
   ls -la ssl/
   # Should show: server-prod.key, server-prod.crt
   ```

3. **Start your server**:
   ```bash
   pm2 restart diagnostic-backend
   ```

4. **Access with warnings**:
   - Visit `https://46.202.168.1:4443`
   - Click "Advanced" → "Proceed to 46.202.168.1 (unsafe)"

### Let's Encrypt Certificate Setup

1. **Prerequisites**:
   - Domain name pointing to your server IP
   - Root access to the server
   - Port 80 available

2. **Configure the script**:
   ```bash
   nano setup-letsencrypt.sh
   
   # Update these lines:
   DOMAIN="yourdomain.com"
   EMAIL="admin@yourdomain.com"
   ```

3. **Run the setup**:
   ```bash
   sudo ./setup-letsencrypt.sh
   ```

4. **Verify**:
   ```bash
   # Check certificate
   openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout
   
   # Access your site
   https://yourdomain.com:4443
   ```

## 🔧 **Configuration Details**

### Current SSL Configuration

Your server is configured to use:
- **Private Key**: `ssl/server-prod.key`
- **Certificate**: `ssl/server-prod.crt`
- **HTTPS Port**: 4443
- **HTTP Port**: 4000

### OpenSSL Configuration

The `ssl/openssl.conf` file defines:
```ini
[req_distinguished_name]
CN = 46.202.168.1        # Common Name (IP address)

[alt_names]
IP.1 = 46.202.168.1      # Subject Alternative Name
```

### Server Code

Your `index.js` loads SSL certificates:
```javascript
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, sslKeyPath)),
  cert: fs.readFileSync(path.join(__dirname, sslCertPath))
};

const httpsServer = https.createServer(sslOptions, app);
```

## 🛠️ **Troubleshooting**

### Certificate Not Found Error

```bash
Error: ENOENT: no such file or directory, open 'ssl/server-prod.key'
```

**Solution**:
```bash
./generate-ssl-cert.sh
```

### Permission Denied Error

```bash
Error: EACCES: permission denied, open 'ssl/server-prod.key'
```

**Solution**:
```bash
chmod 600 ssl/server-prod.key
chmod 644 ssl/server-prod.crt
```

### Certificate Expired

```bash
# Check expiration
openssl x509 -in ssl/server-prod.crt -noout -dates

# Regenerate if expired
./generate-ssl-cert.sh
```

### Let's Encrypt Domain Validation Failed

**Common Issues**:
- Domain doesn't point to server IP
- Port 80 blocked or in use
- DNS propagation incomplete

**Debug Steps**:
```bash
# Check DNS resolution
dig yourdomain.com

# Check port 80
netstat -tulpn | grep :80

# Test with staging certificate
certbot certonly --standalone --test-cert -d yourdomain.com
```

## 🔐 **Security Considerations**

### Self-Signed Certificates

**Risk Level**: Medium  
**Use Case**: Development, internal networks  
**Limitations**:
- Browser warnings
- No certificate transparency
- Manual trust required

### Let's Encrypt Certificates

**Risk Level**: Low  
**Use Case**: Production, public-facing services  
**Benefits**:
- Trusted by all browsers
- Certificate transparency
- Automatic renewal

### HTTP-Only

**Risk Level**: High  
**Use Case**: Development only  
**Limitations**:
- No encryption
- Vulnerable to MITM attacks
- Not suitable for sensitive data

## 📝 **Deployment Integration**

The deployment script automatically:

1. **Checks for existing certificates**
2. **Generates self-signed certificates if missing**
3. **Verifies certificate validity**
4. **Warns about upcoming expiration**
5. **Sets proper file permissions**

### Manual Certificate Management

```bash
# Generate self-signed
./generate-ssl-cert.sh

# Setup Let's Encrypt
sudo ./setup-letsencrypt.sh

# Check certificate info
openssl x509 -in ssl/server-prod.crt -text -noout

# Verify certificate chain
openssl verify ssl/server-prod.crt
```

## 🔄 **Certificate Renewal**

### Self-Signed Certificates

```bash
# Manual renewal (annually)
./generate-ssl-cert.sh
pm2 restart diagnostic-backend
```

### Let's Encrypt Certificates

Auto-renewal is configured via cron:
```bash
# Check auto-renewal status
sudo crontab -l | grep letsencrypt

# Manual renewal test
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal
```

## 🌐 **Domain vs IP Address**

### Using IP Address (Current: 46.202.168.1)

**Limitations**:
- Cannot use Let's Encrypt
- Browser warnings persist
- Self-signed certificates only

**Solutions**:
- Use self-signed certificates
- Access via HTTP for development
- Get a domain name for production

### Using Domain Name

**Benefits**:
- Let's Encrypt certificates possible
- No browser warnings
- Professional appearance
- SEO friendly

**Requirements**:
- Register domain name
- Point DNS A record to 46.202.168.1
- Update server configuration

## 📞 **Next Steps**

### For Immediate Use (Self-Signed)

1. Run `./generate-ssl-cert.sh`
2. Accept browser security warnings
3. Continue with development/testing

### For Production (Let's Encrypt)

1. Register domain name
2. Point domain to your server IP
3. Update `setup-letsencrypt.sh` with your domain
4. Run `sudo ./setup-letsencrypt.sh`
5. Access via your domain name

### Alternative Solutions

1. **Use HTTP for development**: `http://46.202.168.1:4000`
2. **Reverse proxy with Nginx**: Handle SSL termination
3. **Cloud load balancer**: Managed SSL certificates
4. **Cloudflare**: Free SSL proxy service

---

**Last Updated**: January 2024  
**Server IP**: 46.202.168.1  
**Ports**: HTTP 4000, HTTPS 4443
