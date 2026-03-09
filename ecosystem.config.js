module.exports = {
  apps: [
    {
      name: "mission-control",
      script: "server.js",
      cwd: __dirname,
      watch: false,
      restart_delay: 3000,
      max_restarts: 10,
      env: {
        NODE_ENV: "production",
        DASHBOARD_PORT: "3457",
      },
      out_file: "./logs/dashboard-out.log",
      error_file: "./logs/dashboard-error.log",
      time: true,
    },
  ],
};
