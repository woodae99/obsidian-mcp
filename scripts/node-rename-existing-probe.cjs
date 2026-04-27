const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const repoRoot = path.resolve(__dirname, '..');
const envFile = process.env.OBSIDIAN_LIVE_ENV_FILE
  ? path.resolve(process.env.OBSIDIAN_LIVE_ENV_FILE)
  : path.join(repoRoot, '.env.test.local');
dotenv.config({ path: envFile });

const p = process.env.OBSIDIAN_RENAME_EXISTING_PROBE_PATH;
if (!p) {
  throw new Error(`Missing OBSIDIAN_RENAME_EXISTING_PROBE_PATH. Populate ${envFile} with a test note path before running this probe.`);
}
const t = p + '.tmp';
try {
  const c = fs.readFileSync(p, 'utf8');
  fs.writeFileSync(t, c.replace('Status: created', 'Status: updated'), 'utf8');
  fs.renameSync(t, p);
  console.log('rename_ok');
} catch (e) {
  console.log('rename_err:' + e.message);
}
