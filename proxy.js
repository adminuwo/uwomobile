const http = require('http');

const PORT = 8083; // Port for the phone to connect to
const TARGET_HOST = '127.0.0.1';
const TARGET_PORT = 8000; // Django backend

const server = http.createServer((req, res) => {
  const options = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    // Set CORS headers for the mobile app
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy Error:', err.message);
    res.writeHead(500);
    res.end('Proxy Error');
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Node.js Proxy running at http://0.0.0.0:${PORT}`);
  console.log(`Forwarding all requests to http://${TARGET_HOST}:${TARGET_PORT}`);
  console.log(`Tell your mobile app to connect to http://<YOUR_LAN_IP>:${PORT}`);
});
