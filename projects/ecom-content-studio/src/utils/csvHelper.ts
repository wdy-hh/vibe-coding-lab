import type { ProductItem } from '../types';
import { createId } from './id';

export const CSV_HEADERS = ['商品名称', '商品类目', '材质', '颜色规格', '目标人群', '核心卖点', '角标文案'];

// State machine preserves commas, escaped quotes and CRLF inside quoted cells.
export function parseCsv(text: string): string[][] {
  const input = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [], cell = '', quoted = false, closedQuote = false;
  const pushCell = () => { row.push(cell.trim()); cell = ''; closedQuote = false; };
  const pushRow = () => { pushCell(); if (row.some(Boolean)) rows.push(row); row = []; };
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') { cell += '"'; i++; }
      else if (char === '"') { quoted = false; closedQuote = true; }
      else cell += char;
    } else if (char === '"') {
      if (cell.trim() || closedQuote) throw new Error('CSV 引号格式有误，请使用下载的模板重新整理。');
      quoted = true;
      cell = '';
    } else if (char === ',') pushCell();
    else if (char === '\r' || char === '\n') {
      if (char === '\r' && input[i + 1] === '\n') i++;
      pushRow();
    } else if (closedQuote && char.trim()) throw new Error('带引号字段后存在多余字符，请检查 CSV 格式。');
    else if (!closedQuote) cell += char;
  }
  if (quoted) throw new Error('CSV 中有未闭合的引号，请检查文件后重试。');
  if (cell || row.length) pushRow();
  return rows;
}

export function importProducts(text: string): ProductItem[] {
  const rows = parseCsv(text);
  if (rows.length < 2) throw new Error('文件中没有商品数据，请填写 CSV 模板后再导入。');
  const header = rows[0];
  const missing = CSV_HEADERS.filter(name => !header.includes(name));
  if (missing.length) throw new Error(`缺少表头：${missing.join('、')}。请使用标准导入模板。`);
  if (rows.length > 101) throw new Error('单批最多导入 100 款商品，请拆分文件后重试。');
  return rows.slice(1).map((row, index) => {
    const get = (name: string) => row[header.indexOf(name)] ?? '';
    if (row.length !== header.length) throw new Error(`第 ${index + 2} 行列数不匹配；含英文逗号的内容请用双引号包裹。`);
    if (!get('商品名称')) throw new Error(`第 ${index + 2} 行缺少商品名称，请补全后重新导入。`);
    if (!get('商品类目')) throw new Error(`第 ${index + 2} 行缺少商品类目，请补全后重新导入。`);
    return { id: createId('csv'), name: get('商品名称'), category: get('商品类目'), material: get('材质'), specs: get('颜色规格'), audience: get('目标人群'), highlights: get('核心卖点'), badgeText: get('角标文案'), imageUrl: '', status: 'draft' };
  });
}

const csvCell = (value: string) => /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
export function createCsvTemplate(): string {
  return '\uFEFF' + [CSV_HEADERS, ['轻量防泼水通勤双肩包', '箱包配饰', '哑光高密尼龙', '曜石黑 15.6寸', '职场通勤/大学生', '780g超轻、独立电脑仓、USB外接充电口', '新品立减50']].map(row => row.map(csvCell).join(',')).join('\r\n');
}

export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadCsvTemplate(): void {
  downloadFile(new Blob([createCsvTemplate()], { type: 'text/csv;charset=utf-8;' }), '电商内容工作台-商品导入模板.csv');
}
