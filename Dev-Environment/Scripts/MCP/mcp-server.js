const http = require('http');

const port = 8001; // The primary port MCP will communicate on

// A simple request handler
const requestListener = function (req, res) {
  console.log(`[MCP Server] Received request: ${req.method} ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', message: 'MCP Server is running' }));
};

const server = http.createServer(requestListener);

server.listen(port, (err) => {
  if (err) {
    console.error('[MCP Server] Error starting server:', err);
    return;
  }
  console.log(`[MCP Server] Started and listening on port ${port}`);
  console.log('[MCP Server] Ready for Windsurf IDE connections.');
});

// Handle termination signals for graceful shutdown
process.on('SIGTERM', () => {
  console.log('[MCP Server] SIGTERM signal received. Closing server.');
  server.close(() => {
    console.log('[MCP Server] Server closed.');
    process.exit(0);
  });
});
