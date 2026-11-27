import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export function parseLocalEnv(text) {
  const result = {};
  for (const line of text.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    else value = value.replace(/\s+#.*$/, '').trim();
    result[match[1]] = value;
  }
  return result;
}

export async function readLocalEnv(root = process.cwd()) {
  try { return parseLocalEnv(await readFile(resolve(root, '.env.local'), 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return null; throw new Error('无法读取 .env.local，请检查文件访问权限。'); }
}
