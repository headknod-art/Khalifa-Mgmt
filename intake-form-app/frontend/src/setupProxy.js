const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:4000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api',
      },
      onError: (err, req, res) => {
        res.writeHead(503, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({ message: 'Backend server unreachable' }));
      },
    })
  );
};
