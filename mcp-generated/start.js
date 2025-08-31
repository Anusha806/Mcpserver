// start.js - bootstrap entry point
import('./server.ts')
  .catch(err => {
    console.error("Failed to start MCP server:", err);
    process.exit(1);
  });
