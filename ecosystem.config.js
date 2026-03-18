module.exports = {
  apps: [{
    name: 'salon-appointment-system',
    script: './server/src/index.js',
    instances: 'max', // Use all available CPU cores
    exec_mode: 'cluster',
    
    // Environment variables
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Monitoring
    max_memory_restart: '1G', // Restart if memory usage exceeds 1GB
    min_uptime: '10s', // Minimum uptime before considering restart
    max_restarts: 10, // Maximum restarts in unstable_restarts time window
    unstable_restarts: '10m', // Time window for max_restarts
    
    // Health check
    health_check_grace_period: 30000, // 30 seconds grace period
    health_check_graceful_timeout: 5000, // 5 seconds for graceful shutdown
    
    // Performance
    node_args: '--max-old-space-size=4096', // 4GB memory limit
    wait_ready: true,
    
    // Auto restart
    autorestart: true,
    restart_delay: 4000, // 4 seconds delay between restarts
    
    // Source map support
    source_map_support: true,
    
    // Watch files for changes (development only)
    watch: false,
    ignore_watch: [
      'node_modules',
      'logs',
      '.git'
    ],
    
    // Merge logs from all instances
    merge_logs: true,
    
    // Instance variable for logging
    instance_var: 'INSTANCE_ID'
  }],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-production-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:your-username/salon-appointment-system.git',
      path: '/opt/salon-production',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    },
    staging: {
      user: 'deploy',
      host: ['your-staging-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-username/salon-appointment-system.git',
      path: '/opt/salon-staging',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging',
      'pre-setup': ''
    }
  }
};