# Sharp Troubleshooting Guide

This guide helps resolve Sharp image processing library issues, particularly on Ubuntu 25 production servers.

## The Problem

Sharp is a native Node.js module that requires platform-specific binaries. When you install dependencies on one platform (e.g., macOS during development) and deploy to another (e.g., Ubuntu in production), you may encounter errors like:

```
Error: Could not load the "sharp" module using the linux-x64 runtime
ERR_DLOPEN_FAILED: libvips-cpp.so.8.17.1: cannot open shared object file: No such file or directory
```

## Solutions Implemented

### 1. Updated Deployment Script

The `deploy-production.sh` script now includes:

- **System Dependencies**: Installs required Ubuntu packages (`libvips-dev`, `libvips42`, `pkg-config`)
- **Platform-Specific Installation**: Removes and reinstalls Sharp for Linux x64
- **Verification**: Tests Sharp functionality before proceeding
- **Graceful Fallback**: Continues deployment even if Sharp fails (disables image processing)

### 2. Enhanced Upload Middleware

The `middleware/upload.js` has been updated to:

- **Safe Loading**: Loads Sharp with try-catch error handling
- **Graceful Degradation**: Continues without image processing if Sharp unavailable
- **Better Logging**: Shows Sharp availability status in logs

### 3. Diagnostic Tools

Added helpful scripts:

- **`npm run check-sharp`**: Tests Sharp functionality
- **`npm run fix-sharp`**: Reinstalls Sharp for current platform
- **`node check-sharp.js`**: Comprehensive Sharp diagnostic

## Quick Fix Commands

### On Ubuntu Production Server

```bash
# Method 1: Use the automated deployment script
./deploy-production.sh

# Method 2: Manual fix
sudo apt-get update
sudo apt-get install -y libvips-dev libvips42 pkg-config
npm run fix-sharp

# Method 3: Alternative installation
npm install --include=optional sharp

# Method 4: Rebuild existing installation
npm rebuild sharp
```

### Check if Sharp is Working

```bash
# Run diagnostic script
npm run check-sharp

# Or manually test
node -e "require('sharp'); console.log('Sharp works!');"
```

## Understanding the Error

### Root Cause
- Sharp contains platform-specific binary dependencies
- Installing on macOS creates macOS binaries in `node_modules`
- Ubuntu can't use macOS binaries, hence the error

### Why This Happens
1. `npm install` on macOS downloads macOS-specific Sharp binaries
2. Code is deployed to Ubuntu with these incompatible binaries
3. Ubuntu tries to load macOS binaries and fails

### The Fix
- Install Sharp specifically for the target platform (Ubuntu/Linux)
- Install required system libraries (libvips)
- Verify installation works before starting the app

## Prevention

### For Development
- Use Docker for consistent environments
- Test deployment script in staging environment
- Document platform-specific dependencies

### For Production
- Always rebuild native modules on target platform
- Install system dependencies first
- Verify critical dependencies before app startup

## Fallback Behavior

If Sharp cannot be installed or loaded:

- ✅ **File uploads still work** - images are saved without processing
- ❌ **No image optimization** - larger file sizes, no resizing
- ✅ **Application continues** - no service interruption
- ⚠️ **Warning logged** - Sharp unavailability is logged

## System Requirements

### Ubuntu/Debian
```bash
sudo apt-get install libvips-dev libvips42 pkg-config
```

### CentOS/RHEL
```bash
sudo yum install vips-devel pkgconfig
```

### Alpine Linux
```bash
apk add vips-dev pkgconfig
```

## Advanced Troubleshooting

### Check System Libraries
```bash
# Check if libvips is installed
ldconfig -p | grep vips

# Check library paths
ldd node_modules/sharp/build/Release/sharp-linux-x64.node
```

### Environment Variables
```bash
# Force Sharp to use system libvips
export SHARP_IGNORE_GLOBAL_LIBVIPS=0

# Skip Sharp post-install download
export SHARP_DISABLE_DOWNLOAD=true
```

### Docker Considerations
```dockerfile
# In Dockerfile
RUN apt-get update && apt-get install -y \
    libvips-dev \
    libvips42 \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install Node dependencies after system packages
COPY package*.json ./
RUN npm ci --only=production
```

## Testing

After implementing fixes, test:

1. **Sharp Loading**: `npm run check-sharp`
2. **Image Upload**: Upload an image via your API
3. **File Processing**: Check if images are resized/optimized
4. **Error Handling**: Verify app works even if Sharp fails

## Support

If issues persist:

1. Check Node.js version compatibility
2. Verify Ubuntu version and packages
3. Review application logs for Sharp-related errors
4. Consider using alternative image processing solutions

---

**Last Updated**: January 2024  
**Tested On**: Ubuntu 25, Node.js 23.8.0
