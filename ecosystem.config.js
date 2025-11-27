/**
 * PM2 ecosystem file to manage backend and frontend
 * Run: pm2 start ecosystem.config.js --env development
 */
module.exports = {
  apps: [
    {
      name: 'hkmsp-backend',
      cwd: '/workspaces/Khalifa-Mgmt',
      script: 'npm',
      args: 'run dev:backend',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      error_file: '/workspaces/Khalifa-Mgmt/logs/pm2-backend-error.log',
      out_file: '/workspaces/Khalifa-Mgmt/logs/pm2-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z'
    },
    {
      name: 'hkmsp-frontend',
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
