import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const lock = JSON.parse(await readFile(path.join(root, 'vision-assets.lock.json'), 'utf8'));
const sdkRoot = path.join(root, 'node_modules/@mediapipe/tasks-vision');
const sdk = JSON.parse(await readFile(path.join(sdkRoot, 'package.json'), 'utf8'));
if (sdk.version !== lock.sdkVersion) throw new Error('SDK version differs from vision-assets.lock.json');
const publicRoot = path.join(root, 'public');
const modelPath = path.join(publicRoot, lock.model.path);
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const existing = await readFile(modelPath).catch(() => null);

if (!existing || sha256(existing) !== lock.model.sha256) {
  if (!process.argv.includes('--download')) {
    throw new Error('Local model missing or checksum mismatch. Run npm run assets:download once with network access.');
  }
  const response = await fetch(lock.model.url, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`Official model download failed: HTTP ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength !== lock.model.bytes || sha256(bytes) !== lock.model.sha256) throw new Error('Official model checksum mismatch');
  await mkdir(path.dirname(modelPath), { recursive: true });
  await writeFile(`${modelPath}.download`, bytes);
  await rename(`${modelPath}.download`, modelPath);
}

const wasmSource = path.join(sdkRoot, 'wasm');
const wasmTarget = path.join(publicRoot, lock.wasmDirectory);
await mkdir(wasmTarget, { recursive: true });
const files = (await readdir(wasmSource)).filter((file) => /\.(js|wasm)$/.test(file)).sort();
const manifest = { sdkVersion: sdk.version, model: lock.model, wasm: [] };
for (const file of files) {
  await copyFile(path.join(wasmSource, file), path.join(wasmTarget, file));
  const bytes = await readFile(path.join(wasmTarget, file));
  manifest.wasm.push({ path: `${lock.wasmDirectory}/${file}`, sha256: sha256(bytes), bytes: bytes.byteLength });
}
await writeFile(path.join(publicRoot, 'vision-assets.json'), `${JSON.stringify(manifest, null, 2)}\n`);
await mkdir(path.join(publicRoot, 'licenses'), { recursive: true });
await copyFile(path.join(root, 'node_modules/three/LICENSE'), path.join(publicRoot, 'licenses/Three-MIT.txt'));
console.log(`Local vision assets verified: model ${lock.model.version}, SDK ${sdk.version}, ${files.length} WASM runtime files.`);
