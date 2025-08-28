module.exports = {
  apps: [
    {
      name: 'diagnostic-backend',
      script: 'index.js',
      instances: 1, // You can increase this for load balancing
      exec_mode: 'cluster', // Use cluster mode for better performance
      watch: false, // Set to true for development
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        HTTP_PORT: 4000,
        HTTPS_PORT: 4443
      },
      env_production: {
        NODE_ENV: 'production',
        HTTP_PORT: 4000,
        HTTPS_PORT: 4443,
        SSL_KEY_PATH: 'ssl/server-prod.key',
        SSL_CERT_PATH: 'ssl/server-prod.crt',
        TRUST_PROXY: 'true'
      },
      env_staging: {
        NODE_ENV: 'staging',
        HTTP_PORT: 4000,
        HTTPS_PORT: 4443
      },
      // Logging configuration
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      
      // Auto restart configuration
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Advanced PM2 features
      kill_timeout: 1600,
      listen_timeout: 3000,
      
      // Health monitoring
      health_check_grace_period: 30000,
      
      // Source control integration
      source_map_support: true,
      
      // Environment-specific settings
      node_args: '--max-old-space-size=4096',
      
      // Graceful shutdown
      kill_timeout: 5000,
      
      // Process file
      pid_file: './pids/diagnostic-backend.pid',
      
      // Additional monitoring
      pmx: true,
      
      // Restart policy
      exp_backoff_restart_delay: 100,
      
      // Merge logs
      merge_logs: true,
      
      // Time format
      time: true
    }
  ],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:Wezalab/diagnostic-backend.git',
      path: '/var/www/production',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    },
    staging: {
      user: 'node',
      host: 'staging-server.com',
      ref: 'origin/develop',
      repo: 'git@github.com:Wezalab/diagnostic-backend.git',
      path: '/var/www/staging',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env staging'
    }
  }
};
