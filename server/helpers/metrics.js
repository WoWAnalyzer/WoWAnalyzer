import http from 'http';

const Prometheus = require('prom-client');

const collectDefaultMetrics = Prometheus.collectDefaultMetrics;
collectDefaultMetrics();

export const blizzardApiResponseLatencyHistogram = new Prometheus.Histogram({
  name: 'blizzard_api_response_latency',
  help: 'The latency of responses from the Blizzard API',
  labelNames: ['region', 'category', 'statusCode'],
});

export const warcraftLogsApiResponseLatencyHistogram = new Prometheus.Histogram({
  name: 'warcraftlogs_api_response_latency',
  help: 'The latency of responses from the Warcraft Logs API',
  labelNames: ['category', 'statusCode'],
});

export function createServer() {
  const port = process.env.METRICS_PORT || 8000;
  http.createServer((req, res) => {
    if (req.url === '/metrics') {
      const register = Prometheus.register;
      res.setHeader('Connection', 'close');
      res.setHeader('Content-Type', register.contentType);
      res.write(register.metrics());
      res.end();
      return;
    }
    res.statusCode = 404;
    res.statusMessage = 'Not found';
    res.end();
  }).listen(port);
  console.log('/metrics is available at port', port);
}
