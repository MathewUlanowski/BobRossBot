import http from 'http';
import logger from './logger';

// Support both /health and /healthz to accommodate different health probe conventions
export function startHealthServer(port = 3000) {
  const server = http.createServer((req, res) => {
    if (req.method === 'GET' && (req.url === '/health' || req.url === '/healthz')) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('ok');
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  server.listen(port, () => {
    logger.info(`Health server listening on port ${port}`);
  });

  return server;
}
