// mcp-client.ts - Minimal MCP client example
import * as cp from 'child_process';

const server = cp.spawn('npx', ['-y', '@azure/mcp@latest', 'server', 'start', '--transport', 'stdio']);

server.stdout.on('data', (data) => {
  console.log(`[MCP Server]: ${data}`);
});

server.stderr.on('data', (data) => {
  console.error(`[MCP Error]: ${data}`);
});

server.on('close', (code) => {
  console.log(`MCP server exited with code ${code}`);
});

// You can now send/receive messages to the MCP server via stdio
