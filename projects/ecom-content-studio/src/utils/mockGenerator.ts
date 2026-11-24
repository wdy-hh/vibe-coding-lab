import type { CopyTone, ProductItem, TemplateAsset } from '../types';

const chars = (value: string) => Array.from(value);
const short = (value: string, limit: number) => chars(value.trim()).slice(0, limit).join('');
export function splitHighlights(value: string): string[] {
  return value.split(/[、,，;；\n]+/).map(value => value.trim()).filter(Boolean);
}

const categoryWords: Record<string, { search: string[]; scenes: string[]; posters: string[] }> = {
  箱包配饰: { search: ['大容量电脑背包', '轻量通勤收纳', '日常出行双肩包'], scenes: ['赶地铁、去上课，让日常随身物品各就各位', '从早高峰到周末出行，轻松切换每一程'], posters: ['轻装出发自在通勤', '把轻盈背在身上', '日常出行轻松有序'] },
  服饰鞋靴: { search: ['户外通勤穿搭', '日常百搭轻盈', '舒适出行穿搭'], scenes: ['通勤路上、周末骑行，都能穿出自在节奏', '从城市街头到周末户外，轻松搭配日常造型'], posters: ['清爽出行自在穿搭', '轻盈穿搭自在一夏', '把舒适穿进日常'] },
  家居水具: { search: ['通勤便携水杯', '办公家用随行', '日常饮水好物'], scenes: ['办公桌边到通勤路上，喜欢的饮品随手相伴', '清晨咖啡与午后小憩，让每次饮水更从容'], posters: ['一杯随行温暖日常', '把喜欢装进日常', '每一口都有好心情'] },
  数码配件: { search: ['便携数码好物', '办公通勤实用', '日常随身配件'], scenes: ['办公、学习与外出，让数码日常更得心应手', '从桌面到背包，为你的日常多一份便利'], posters: ['实用细节高效日常', '让日常更得心应手', '轻巧随身效率在线'] },
};
const fallback = { search: ['日常实用好物', '品质生活精选', '多场景适用'], scenes: ['融入工作与生活，让每天的使用更从容', '从日常使用到周末出行，实用细节随心相伴'], posters: ['用心好物自在日常', '让喜欢融入每一天', '日常所需恰到好处'] };

function makeSeoTitle(item: ProductItem, tone: CopyTone, variant: number, template?: TemplateAsset): string {
  const meta = categoryWords[item.category] ?? fallback;
  const cleanName = item.name.replace(/\s+/g, '');
  const material = item.material.replace(/\s+/g, '');
  const highlight = splitHighlights(item.highlights)[variant % Math.max(1, splitHighlights(item.highlights).length)] ?? '';
  const core = [cleanName, material, short(item.specs, 8), meta.search[variant % 3]];
  const candidates: Record<CopyTone, string> = {
    promo: `${cleanName}${highlight}${meta.search[variant % 3]}${material}`,
    minimal: variant % 2 ? `${cleanName}${material}${meta.search[variant % 3]}${item.specs}` : core.join(''),
    lifestyle: `${cleanName}${meta.search[variant % 3]}${highlight}${material}`,
    professional: `${cleanName}${material}${highlight}${item.specs}${meta.search[variant % 3]}`,
  };
  const fields: Record<string, string> = {
    商品名: cleanName, 商品名称: cleanName, 材质关键词: material, 商品材质: material,
    品质材质: material, 核心关键词: highlight || meta.search[variant % 3],
    使用场景: meta.search[variant % 3], 核心功能: highlight || meta.search[variant % 3],
    爆款利益点: highlight || item.badgeText, 颜色规格: item.specs, 目标人群: item.audience,
  };
  const formulaParts = template?.titleFormulaHint.split(/\s*\+\s*/).map(part => part.trim()).filter(Boolean);
  let title = formulaParts?.some(part => part in fields)
    ? formulaParts.map(part => fields[part] ?? part).join('')
    : candidates[tone];
  while (chars(title).length < 22) title += meta.search[(variant + 1) % 3];
  return short(title, 30);
}

export function generateContent(item: ProductItem, template?: TemplateAsset, variant = 0): NonNullable<ProductItem['generated']> {
  const tone = template?.copyTone ?? 'lifestyle';
  const meta = categoryWords[item.category] ?? fallback;
  const highlights = splitHighlights(item.highlights);
  const material = short(item.material, 34) || '用心选材';
  const audience = short(item.audience, 30).replace(/\//g, '与');
  const productFeature = highlights[variant % Math.max(1, highlights.length)] || '兼顾日常所需与实用细节';
  const extraFeature = highlights[(variant + 1) % Math.max(1, highlights.length)];
  const details = item.specs ? `，${short(item.specs, 30)}适配你的日常选择` : '，把贴心细节融入每天的使用';
  const points: Record<CopyTone, string[]> = {
    promo: [
      `${material}，${productFeature}。看得见的用料，实实在在的体验。`,
      `${meta.scenes[variant % 2]}${extraFeature ? `；${extraFeature}，好用不止一面` : ''}。`,
      `${audience ? `为${audience}准备` : '为日常使用准备'}${details}。${item.badgeText || '喜欢的好物，现在就入手'}。`,
    ],
    minimal: [
      `${material} · ${productFeature}，实用与质感恰到好处。`,
      `${meta.scenes[variant % 2]}${extraFeature ? `，${extraFeature}` : ''}。`,
      `${audience ? `适合${audience}` : '为日常而设计'}${details}，让喜欢经得起日常。`,
    ],
    lifestyle: [
      `${material}搭配${productFeature}，把小小的讲究藏进日常。`,
      `${meta.scenes[variant % 2]}${extraFeature ? `，还有${extraFeature}的贴心设计` : ''}。`,
      `${audience ? `${audience}的日常搭子` : '每天都想带在身边'}${details}，让普通一天也有好心情。`,
    ],
    professional: [
      `材质与工艺：${material}，${productFeature}，聚焦实际使用需求。`,
      `场景与功能：${meta.scenes[variant % 2]}${extraFeature ? `；${extraFeature}` : ''}。`,
      `规格与适配：${item.specs || '日常实用设计'}${audience ? `，面向${audience}` : ''}，品质体现在每个使用细节。`,
    ],
  };
  let posterTitle = tone === 'promo'
    ? short(`${highlights[0] ? short(highlights[0], 6) : '人气好物'}限时上新`, 12)
    : meta.posters[variant % meta.posters.length];
  if (chars(posterTitle).length < 6) posterTitle += '好物';
  return { seoTitle: makeSeoTitle(item, tone, variant, template), posterTitle, sellingPoints: points[tone], visualStyle: template?.visualStyle ?? 'fresh-green', updatedAt: new Date().toISOString() };
}

let generationVersion = 0;
export async function mockGenerate(item: ProductItem, template?: TemplateAsset): Promise<NonNullable<ProductItem['generated']>> {
  const variant = ++generationVersion;
  await new Promise<void>(resolve => setTimeout(resolve, 600 + Math.floor(Math.random() * 301)));
  return generateContent(item, template, variant);
}
