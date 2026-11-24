import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { createServiceWorkerSource } from './service-worker.mjs';

const root = join(process.cwd(), 'dist');
async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async entry => entry.isDirectory() ? collect(join(directory, entry.name)) : entry.name === 'sw.js' ? [] : [join(directory, entry.name)]))).flat();
}
const files = await collect(root);
const hash = createHash('sha256');
for (const file of files) hash.update(await readFile(file));
const version = `ecom-studio-v1-${hash.digest('hex').slice(0, 12)}`;
const assets = ['./', ...files.map(file => './' + relative(root, file).replaceAll('\\', '/'))];
await writeFile(join(root, 'sw.js'), createServiceWorkerSource(version, assets), 'utf8');
console.log(`Offline cache ready: ${files.length} local assets.`);
