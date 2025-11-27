/**
 * PM2 ecosystem file (CommonJS) to manage backend and frontend
 * Run: pm2 start ecosystem.config.cjs --env development
 */
module.exports = {
  apps: [
    {
      name: 'Khalifa-backend',
      cwd: '/workspaces/Khalifa-Mgmt',
      script: 'npm',
      args: 'run dev:backend',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        OPENSIGN_URL: process.env.OPENSIGN_URL || 'http://localhost:3001'
      },
      error_file: '/workspaces/Khalifa-Mgmt/logs/pm2-backend-error.log',
      out_file: '/workspaces/Khalifa-Mgmt/logs/pm2-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z'
    },
    {
      name: 'Khalifa-frontend',
      cwd: '/workspaces/Khalifa-Mgmt/client',
      script: 'npm',
      args: 'run dev',
      watch: false,
      env: {
        NODE_ENV: 'development'
      },
      error_file: '/workspaces/Khalifa-Mgmt/logs/pm2-frontend-error.log',
      out_file: '/workspaces/Khalifa-Mgmt/logs/pm2-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z'
    }
  ]
};
