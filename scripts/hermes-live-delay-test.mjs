import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { buildEntry, getTestNoteDir, loadedEnvFile, serverEnv } from './live-env.mjs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const notePath = `${getTestNoteDir()}/hermes-obsidian-mcp-test-delay-${Date.now()}.md`;

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [buildEntry],
  env: serverEnv(),
});

const client = new Client({ name: 'hermes-delay-test', version: '1.0.0' }, { capabilities: {} });

try {
  await client.connect(transport);
  await client.callTool({ name: 'create_note', arguments: { path: notePath, content: '# Delay test\n\nStatus: created\n' } });
  await sleep(2500);
  const updated = await client.callTool({
    name: 'update_note',
    arguments: { path: notePath, edits: [{ oldText: 'Status: created', newText: 'Status: updated', expectedCount: 1 }] }
  });
  const read = await client.callTool({ name: 'read_note', arguments: { path: notePath } });
  await client.callTool({ name: 'delete_note', arguments: { path: notePath } });
  console.log(JSON.stringify({ envFile: loadedEnvFile, notePath, update: updated.content?.[0]?.text, read: read.content?.[0]?.text }, null, 2));
} finally {
  await client.close().catch(() => {});
}
