# PM2 Configuration Guide for Diagnostic Backend

## Overview
This project is now configured to use PM2 for process management in production environments.

## Quick Start

### Development
```bash
# Run with nodemon (development)
npm start

# Run with PM2 (production-like)
npm run pm2:start
```

### Production
```bash
# Start application in production mode
npm run pm2:start:prod

# Or start with specific environment
pm2 start ecosystem.config.js --env production
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run pm2:start` | Start the application with PM2 |
| `npm run pm2:start:prod` | Start in production mode |
| `npm run pm2:start:staging` | Start in staging mode |
| `npm run pm2:restart` | Restart the application |
| `npm run pm2:reload` | Graceful reload (zero-downtime) |
| `npm run pm2:stop` | Stop the application |
| `npm run pm2:delete` | Delete the application from PM2 |
| `npm run pm2:status` | Show PM2 status |
| `npm run pm2:logs` | Show application logs |
| `npm run pm2:monit` | Open PM2 monitoring dashboard |
| `npm run pm2:flush` | Clear all logs |
| `npm run pm2:save` | Save current PM2 processes |
| `npm run pm2:resurrect` | Restore saved PM2 processes |

## Environment Configuration

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Update the `.env` file with your configuration:
   - Database URL
   - JWT secret
   - API keys
   - Other environment-specific variables

## PM2 Ecosystem Configuration

The `ecosystem.config.js` file contains:

- **Process Settings**: Name, script, instances, execution mode
- **Environment Variables**: Different configs for dev/staging/production
- **Logging**: Separate files for different log types
- **Monitoring**: Health checks and restart policies
- **Memory Management**: Automatic restart on memory threshold

## Key Features

### 1. Cluster Mode
- Runs in cluster mode for better performance
- Can be scaled to multiple instances

### 2. Automatic Restart
- Restarts on crashes
- Memory-based restart (1GB threshold)
- Exponential backoff on restart failures

### 3. Logging
- Separate log files for errors and output
- Timestamped logs
- Log rotation and management

### 4. Environment Management
- Development, staging, and production configurations
- Environment-specific variables

### 5. Deployment Ready
- Deployment configurations included
- Post-deploy hooks for automation

## Monitoring

### Real-time Monitoring
```bash
npm run pm2:monit
```

### Log Monitoring
```bash
# View all logs
npm run pm2:logs

# View logs with tail
pm2 logs diagnostic-backend --lines 100

# View only error logs
pm2 logs diagnostic-backend --err
```

### Process Status
```bash
npm run pm2:status
```

## Production Deployment

### Manual Deployment
1. Clone repository on server
2. Install dependencies: `npm install`
3. Copy and configure `.env` file
4. Start with PM2: `npm run pm2:start:prod`
5. Save PM2 configuration: `npm run pm2:save`
6. Setup PM2 startup: `pm2 startup`

### Automated Deployment
Use the deployment configurations in `ecosystem.config.js`:

```bash
# Setup deployment
pm2 deploy ecosystem.config.js production setup

# Deploy
pm2 deploy ecosystem.config.js production
```

## Troubleshooting

### Common Commands
```bash
# Check if PM2 is running
pm2 list

# Restart all processes
pm2 restart all

# Stop all processes
pm2 stop all

# Delete all processes
pm2 delete all

# Reload PM2 daemon
pm2 kill && pm2 resurrect
```

### Log Locations
- Combined logs: `./logs/combined.log`
- Output logs: `./logs/out.log`
- Error logs: `./logs/error.log`
- PID files: `./pids/`

### Performance Tuning
- Adjust `instances` in ecosystem.config.js for load balancing
- Modify `max_memory_restart` based on your server capacity
- Configure `node_args` for Node.js optimization

## Security Notes

1. Always use environment variables for sensitive data
2. Never commit `.env` files to version control
3. Use proper firewall rules in production
4. Keep PM2 and Node.js updated
5. Monitor logs regularly for security issues

## Support

For PM2-specific issues, refer to:
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [PM2 GitHub Repository](https://github.com/Unitech/pm2)

For application-specific issues, check the application logs and contact the development team.
