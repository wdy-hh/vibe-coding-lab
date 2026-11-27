import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { readLocalEnv } from './local-env.mjs';

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? filesIn(join(directory, entry.name)) : [join(directory, entry.name)]))).flat();
}
const root = process.cwd();
const local = await readLocalEnv(root);
const values = [local?.AIOP_API_KEY, process.env.AIOP_API_KEY].filter(value => typeof value === 'string' && value.length >= 8);
const files = await filesIn(join(root, 'dist'));
const failures = [];
for (const file of files) {
  const content = (await readFile(file)).toString('utf8');
  if (content.includes('AIOP_API_KEY') || values.some(value => content.includes(value)) || /\b[a-f0-9]{64}\b/i.test(content) || /\bsk-[a-zA-Z0-9_-]{24,}\b/.test(content)) failures.push(relative(root, file));
}
if (failures.length) { console.error(`前端密钥检查失败，请修复这些文件后再发布：${failures.join('、')}`); process.exitCode = 1; }
else console.log(`前端密钥检查通过：已检查 ${files.length} 个构建文件，无服务端密钥。`);
