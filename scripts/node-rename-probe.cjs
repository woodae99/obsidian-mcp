const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const repoRoot = path.resolve(__dirname, '..');
const envFile = process.env.OBSIDIAN_LIVE_ENV_FILE
  ? path.resolve(process.env.OBSIDIAN_LIVE_ENV_FILE)
  : path.join(repoRoot, '.env.test.local');
dotenv.config({ path: envFile });

const vaultPath = process.env.OBSIDIAN_VAULT_PATH;
if (!vaultPath) {
  throw new Error(`Missing OBSIDIAN_VAULT_PATH. Populate ${envFile} or set OBSIDIAN_LIVE_ENV_FILE.`);
}

const testNoteDir = process.env.OBSIDIAN_TEST_NOTE_DIR || 'Dev/Hermes/Inbox';
const p = path.join(vaultPath, testNoteDir, 'hermes-obsidian-node-rename-probe.md');
const t = p + '.tmp';
fs.mkdirSync(path.dirname(p), { recursive: true });
fs.writeFileSync(p, 'original\n', 'utf8');
fs.writeFileSync(t, 'updated\n', 'utf8');
try {
  fs.renameSync(t, p);
  console.log('rename_ok');
} catch (e) {
  console.log('rename_err:' + e.message);
}
try {
  fs.writeFileSync(p, 'directwrite\n', 'utf8');
  console.log('directwrite_ok');
} catch (e) {
  console.log('directwrite_err:' + e.message);
}
try { fs.unlinkSync(p); } catch {}
try { fs.unlinkSync(t); } catch {}
