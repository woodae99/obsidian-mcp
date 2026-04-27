import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { buildEntry, getTestNoteDir, loadedEnvFile, serverEnv } from './live-env.mjs';

function textFromResult(result) {
  return result.content?.map((item) => item.text || '').join('\n') || '';
}

function tryJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

const notePath = `${getTestNoteDir()}/hermes-obsidian-mcp-test-${Date.now()}.md`;
const createContent = [
  '# Hermes obsidian-mcp test',
  '',
  'Status: created',
  '',
  '- item 1',
].join('\n');

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [buildEntry],
  env: serverEnv(),
});

const client = new Client({ name: 'hermes-live-crud-test', version: '1.0.0' }, { capabilities: {} });

try {
  await client.connect(transport);

  const createResult = await client.callTool({
    name: 'create_note',
    arguments: {
      path: notePath,
      content: createContent,
    },
  });

  const readAfterCreate = await client.callTool({
    name: 'read_note',
    arguments: { path: notePath },
  });

  const updateResult = await client.callTool({
    name: 'update_note',
    arguments: {
      path: notePath,
      edits: [
        { oldText: 'Status: created', newText: 'Status: updated', expectedCount: 1 },
        { mode: 'insert', heading: 'Hermes obsidian-mcp test', level: 1, content: '\nUpdated via MCP tool.\n', position: 'append' }
      ],
    },
  });

  const readAfterUpdate = await client.callTool({
    name: 'read_note',
    arguments: { path: notePath },
  });

  const deleteResult = await client.callTool({
    name: 'delete_note',
    arguments: { path: notePath },
  });

  let readAfterDelete;
  let deleteReadError = null;
  try {
    readAfterDelete = await client.callTool({
      name: 'read_note',
      arguments: { path: notePath },
    });
  } catch (err) {
    deleteReadError = err?.message || String(err);
  }

  console.log(JSON.stringify({
    envFile: loadedEnvFile,
    notePath,
    createResult: tryJson(textFromResult(createResult)),
    readAfterCreate: textFromResult(readAfterCreate),
    updateResult: tryJson(textFromResult(updateResult)),
    readAfterUpdate: textFromResult(readAfterUpdate),
    deleteResult: tryJson(textFromResult(deleteResult)),
    readAfterDelete: readAfterDelete ? textFromResult(readAfterDelete) : null,
    readAfterDeleteError: deleteReadError,
  }, null, 2));
} finally {
  await client.close().catch(() => {});
}
