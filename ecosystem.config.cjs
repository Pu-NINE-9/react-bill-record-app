// pm2部署相关
module.exports = {
  apps: [
    {
      name: "bill-record",
      script: "./.output/server/index.mjs",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
}
