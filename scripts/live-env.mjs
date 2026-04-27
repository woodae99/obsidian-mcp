import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const defaultEnvFile = path.join(repoRoot, '.env.test.local');
const envFile = process.env.OBSIDIAN_LIVE_ENV_FILE
  ? path.resolve(process.env.OBSIDIAN_LIVE_ENV_FILE)
  : defaultEnvFile;

dotenv.config({ path: envFile });

export const loadedEnvFile = envFile;
export const repoRootPath = repoRoot;
export const buildEntry = path.join(repoRoot, 'build', 'index.js');

export function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Populate ${envFile} or set OBSIDIAN_LIVE_ENV_FILE to another env file.`);
  }
  return value;
}

export function getTestNoteDir() {
  return process.env.OBSIDIAN_TEST_NOTE_DIR || 'Dev/Hermes/Inbox';
}

export function serverEnv() {
  return {
    ...process.env,
    OBSIDIAN_VAULT_PATH: requireEnv('OBSIDIAN_VAULT_PATH'),
    OBSIDIAN_API_TOKEN: requireEnv('OBSIDIAN_API_TOKEN'),
    OBSIDIAN_API_HOST: process.env.OBSIDIAN_API_HOST || '127.0.0.1',
    OBSIDIAN_API_PORT: process.env.OBSIDIAN_API_PORT || '27123',
    OBSIDIAN_LINK_PLUGIN_MOVE_ROUTE: process.env.OBSIDIAN_LINK_PLUGIN_MOVE_ROUTE || '/links/move-v3',
  };
}
