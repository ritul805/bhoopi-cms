module.exports = {
  apps: [
    {
      name: "boopi-admin-cms",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};
