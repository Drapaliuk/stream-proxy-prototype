const http = require('http');
const { URL } = require('url');

const proxy = http.createServer((req, res) => {
    const targetUrl = req.url.slice(1);
    if (!targetUrl.startsWith('http')) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        return res.end('Invalid URL');
    }

    const url = new URL(targetUrl);
    const options = {
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname + url.search,
        method: req.method,
        headers: req.headers,
    };

    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
    });

    req.pipe(proxyReq, { end: true });
    proxyReq.on('error', (err) => {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Proxy error: ' + err.message);
    });
});

const PORT = 3000;
proxy.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
