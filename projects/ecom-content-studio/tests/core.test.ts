import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { createDemoProducts, createDemoTemplates } from '../src/data/demoData';
import { createCsvTemplate, importProducts, parseCsv } from '../src/utils/csvHelper';
import { generateContent, mockGenerate } from '../src/utils/mockGenerator';
import { drawWrappedText } from '../src/utils/canvasRenderer';
import { loadState, saveState, STORAGE_KEY } from '../src/utils/storage';
import { createInitialState } from '../src/data/demoData';

test('CSV parses BOM, quoted commas, escaped quotes and multiline fields', () => {
  assert.deepEqual(parseCsv('\uFEFF名称,描述\r\n"随行杯,450ml","他说""好用""\n便携"\r\n'), [['名称', '描述'], ['随行杯,450ml', '他说"好用"\n便携']]);
  assert.throws(() => parseCsv('名称,描述\n"未闭合,内容'), /未闭合/);
  assert.throws(() => parseCsv('名称,描述\n"内容"多余,正常'), /多余字符/);
});

test('template has a BOM and imports real products without inventing image URLs', () => {
  const csv = createCsvTemplate();
  assert.equal(csv.charCodeAt(0), 0xFEFF);
  const products = importProducts(csv);
  assert.equal(products.length, 1);
  assert.equal(products[0].category, '箱包配饰');
  assert.equal(products[0].imageUrl, '');
  assert.throws(() => importProducts(''), /没有商品/);
  assert.throws(() => importProducts('商品名称,其他\n杯子,正常'), /缺少表头/);
  assert.throws(() => importProducts(csv + '\r\n,箱包配饰,,,,,'), /缺少商品名称/);
});

test('all demo images are standalone local SVGs and the first product is ready', () => {
  const products = createDemoProducts();
  assert.equal(products.length, 3);
  assert.equal(products[0].status, 'generated');
  assert.ok(products[0].generated);
  for (const product of products) {
    assert.ok(product.imageUrl.startsWith('data:image/svg+xml;'));
    const svg = decodeURIComponent(product.imageUrl.split(',').slice(1).join(','));
    assert.ok(!/href=|url\(https?:/i.test(svg));
  }
});

test('generation respects title lengths, product parameters, tones and formula order', () => {
  const products = createDemoProducts();
  const templates = createDemoTemplates();
  for (const product of products) for (const template of [...templates, undefined]) for (let variant = 0; variant < 4; variant++) {
    const result = generateContent(product, template, variant);
    assert.ok(Array.from(result.seoTitle).length >= 22 && Array.from(result.seoTitle).length <= 30);
    assert.ok(Array.from(result.posterTitle).length >= 6 && Array.from(result.posterTitle).length <= 12);
    assert.equal(result.sellingPoints.length, 3);
    assert.ok(result.sellingPoints[0].includes(product.material));
    assert.ok(!/示例标题|卖点\s*1/.test(result.seoTitle + result.sellingPoints.join('')));
  }
  const custom = { ...templates[0], titleFormulaHint: '商品名 + 颜色规格 + 核心功能' };
  assert.ok(generateContent(products[0], custom).seoTitle.startsWith(products[0].name + products[0].specs));
  assert.notDeepEqual(generateContent(products[0], templates[0], 0).sellingPoints, generateContent(products[0], templates[0], 1).sellingPoints);
  const tinyProduct = { ...products[0], name: '杯', material: '', category: '其他', specs: '', highlights: '轻', audience: '' };
  assert.ok(Array.from(generateContent(tinyProduct, templates[0]).posterTitle).length >= 6);
});

test('mock generation has the required asynchronous delay', async () => {
  const started = performance.now();
  const result = await mockGenerate(createDemoProducts()[0]);
  assert.ok(performance.now() - started >= 590);
  assert.ok(result.seoTitle);
});

test('Chinese wrapping limits lines and fits an ellipsis inside the available width', () => {
  const drawn: { text: string; x: number; y: number }[] = [];
  const ctx = { measureText: (text: string) => ({ width: Array.from(text).length * 10 }), fillText: (text: string, x: number, y: number) => { drawn.push({ text, x, y }); } } as unknown as CanvasRenderingContext2D;
  drawWrappedText(ctx, '这是一个很长很长的中文标题', 5, 20, 50, 15, 2);
  assert.equal(drawn.length, 2);
  assert.ok(drawn[1].text.endsWith('…'));
  assert.ok(drawn.every(line => Array.from(line.text).length <= 5));
  assert.equal(drawn[1].y, 35);
});

test('storage recovers interrupted generation and rejects broken persisted data', () => {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) } });
  const state = createInitialState();
  state.workspace.items[0].status = 'generating';
  state.workspace.items[1].status = 'generating';
  assert.equal(saveState(state), null);
  assert.equal(loadState().state.workspace.items[0].status, 'generated');
  assert.equal(loadState().state.workspace.items[1].status, 'draft');
  values.set(STORAGE_KEY, '{broken json');
  assert.ok(loadState().error);
  assert.equal(loadState().state.workspace.items.length, 3);
});

test('storage quota failures return a useful error instead of throwing', () => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => null, setItem: () => { throw new Error('QuotaExceededError'); } } });
  assert.match(saveState(createInitialState()) ?? '', /本地自动保存失败/);
});
