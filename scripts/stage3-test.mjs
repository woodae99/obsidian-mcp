import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const buildEntry = path.join(repoRoot, 'build', 'index.js');
const vaultPath = fs.mkdtempSync(path.join(os.tmpdir(), 'obsidian-mcp-stage3-'));

async function expectReject(label, fn, expectedMessage) {
  try {
    await fn();
  } catch (error) {
    const message = error?.message || String(error);
    if (expectedMessage && !message.includes(expectedMessage)) {
      throw new Error(`Expected ${label} to reject with "${expectedMessage}", got: ${message}`);
    }
    return;
  }
  throw new Error(`Expected ${label} to reject`);
}

async function createMockLinkPlugin() {
  const requests = [];
  const server = http.createServer((req, res) => {
    requests.push({ method: req.method, url: req.url });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'mock move failure',
    }));
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  return {
    port: server.address().port,
    requests,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

const mockPlugin = await createMockLinkPlugin();

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [buildEntry],
  env: {
    ...process.env,
    OBSIDIAN_VAULT_PATH: vaultPath,
    OBSIDIAN_API_TOKEN: 'stage3-test-token',
    OBSIDIAN_API_HOST: '127.0.0.1',
    OBSIDIAN_API_PORT: String(mockPlugin.port),
    OBSIDIAN_LINK_PLUGIN_MOVE_ROUTE: '/links/move-v3',
  },
});

const client = new Client({ name: 'stage3-test', version: '1.0.0' }, { capabilities: {} });

try {
  await client.connect(transport);

  await expectReject('folder create vault escape', () => client.callTool({
    name: 'manage_folder',
    arguments: { operation: 'create', path: '../outside-folder' },
  }), 'Path escapes vault');

  await expectReject('folder delete vault escape', () => client.callTool({
    name: 'manage_folder',
    arguments: { operation: 'delete', path: '../outside-folder' },
  }), 'Path escapes vault');

  fs.writeFileSync(path.join(vaultPath, 'Source.md'), '# Source\n', 'utf-8');

  await expectReject('unsafe move source vault escape', () => client.callTool({
    name: 'move_note',
    arguments: {
      sourcePath: '../outside-source.md',
      destinationPath: 'Destination.md',
      updateLinks: false,
      allowUnsafeFallback: true,
    },
  }), 'Path escapes vault');

  await expectReject('unsafe move destination vault escape', () => client.callTool({
    name: 'move_note',
    arguments: {
      sourcePath: 'Source.md',
      destinationPath: '../outside-destination.md',
      updateLinks: false,
      allowUnsafeFallback: true,
    },
  }), 'Path escapes vault');

  await expectReject('link plugin success false', () => client.callTool({
    name: 'move_note',
    arguments: {
      sourcePath: 'Source.md',
      destinationPath: 'Destination.md',
    },
  }), 'did not confirm note move');

  if (!mockPlugin.requests.some((request) => request.method === 'POST' && request.url === '/links/move-v3')) {
    throw new Error('Expected move_note to call the configured link plugin route');
  }

  console.log('Stage 3 move safety regression test passed.');
} finally {
  await client.close().catch(() => {});
  await mockPlugin.close();
  fs.rmSync(vaultPath, { recursive: true, force: true });
}
