'use strict';

/**
 * Advanced I/O - Notification Handler
 * Routes:
 *   POST /            -> accept notification payload
 *   GET  /health      -> health check
 */
module.exports = async (req, res) => {
  try {
    const { method, url } = req;

    if (method === 'GET' && url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'healthy', ts: Date.now() }));
    }

    if (method === 'POST' && url === '/') {
      let body = '';
      req.on('data', chunk => (body += chunk));
      req.on('end', () => {
        let data = {};
        try { data = body ? JSON.parse(body) : {}; } catch {}
        // TODO: persist/log as needed
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, received: data }));
      });
      return;
    }
