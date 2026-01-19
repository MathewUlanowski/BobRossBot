import http from 'http';
import { startHealthServer } from '../health';

function httpGet(port: number, path: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    http.get({ hostname: '127.0.0.1', port, path, timeout: 2000 }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c) => chunks.push(Buffer.from(c)));
      res.on('end', () => resolve({ status: res.statusCode || 0, body: Buffer.concat(chunks).toString() }));
    }).on('error', reject);
  });
}

describe('health server', () => {
  let server: http.Server;
  let port: number;

  beforeAll((done) => {
    // Listen on a random free port
    server = startHealthServer(0) as unknown as http.Server;
    server.on('listening', () => {
      const addr = server.address();
      port = typeof addr === 'object' && addr ? addr.port : 3000;
      done();
    });
  });

  afterAll(async () => await new Promise((resolve) => server.close(() => resolve(undefined))));

  it('responds 200 on /healthz', async () => {
    const res = await httpGet(port, '/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toBe('ok');
  });

  it('responds 200 on /health', async () => {
    const res = await httpGet(port, '/health');
    expect(res.status).toBe(200);
    expect(res.body).toBe('ok');
  });
});
