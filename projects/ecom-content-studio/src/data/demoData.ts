import type { ProductItem, StudioState, TemplateAsset, VisualStyleId } from '../types';
import { generateContent } from '../utils/mockGenerator';

const svgDataUrl = (body: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">${body}</svg>`)}`;

// Standalone SVGs use no linked images, fonts or filters with external resources.
export const backpackImage = svgDataUrl(`
  <defs>
    <linearGradient id="body" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#4c5155"/><stop offset=".4" stop-color="#272c2f"/><stop offset="1" stop-color="#101517"/></linearGradient>
    <linearGradient id="front" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#3e4447"/><stop offset="1" stop-color="#202629"/></linearGradient>
    <linearGradient id="side"><stop stop-color="#151b1d"/><stop offset="1" stop-color="#363c3f"/></linearGradient>
    <radialGradient id="shadow"><stop stop-color="#1b252b" stop-opacity=".23"/><stop offset="1" stop-color="#1b252b" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse cx="302" cy="534" rx="180" ry="29" fill="url(#shadow)"/>
  <path d="M211 149C175 161 161 227 151 327L160 469Q180 494 199 477L213 197Z" fill="#171c1e"/>
  <path d="M387 151Q441 179 448 291L442 464Q428 491 406 474L385 193Z" fill="#171c1e"/>
  <path d="M257 141V113Q257 84 282 83H312Q337 84 337 113V140" fill="none" stroke="#1a2023" stroke-width="16"/>
  <path d="M260 133V113Q260 93 283 92H310Q333 93 333 113V133" fill="none" stroke="#454c50" stroke-width="3"/>
  <path d="M195 174Q210 130 267 126H332Q384 130 405 176L426 454Q431 507 380 519H216Q166 513 170 465Z" fill="url(#body)" stroke="#171d20" stroke-width="3"/>
  <path d="M194 180Q210 149 264 146H332Q379 149 392 183L410 457Q414 492 381 500" fill="none" stroke="#646a6c" stroke-opacity=".55" stroke-width="2"/>
  <path d="M207 187Q227 161 268 161H329Q365 163 383 190" fill="none" stroke="#111719" stroke-width="8"/>
  <path d="M207 187Q227 161 268 161H329Q365 163 383 190" fill="none" stroke="#8c9394" stroke-dasharray="1 4" stroke-opacity=".65" stroke-width="2"/>
  <path d="M202 182L194 210" stroke="#bbc1c2" stroke-width="4"/><rect x="187" y="205" width="10" height="26" rx="4" fill="#838c91"/>
  <path d="M174 340L156 355L164 458Q167 477 189 478L197 352Z" fill="url(#side)"/>
  <path d="M172 359L189 364M171 371L189 377M172 383L188 389M174 396L189 402M175 409L188 415M176 422L188 428" stroke="#4b5457" stroke-width="2"/>
  <path d="M407 335L434 349L431 459Q426 477 410 475L400 350Z" fill="url(#side)"/>
  <path d="M211 330Q295 310 386 332L391 454Q387 485 361 487H236Q207 484 204 459Z" fill="url(#front)" stroke="#151c1f" stroke-width="2"/>
  <path d="M218 339Q301 321 379 340" fill="none" stroke="#7c8589" stroke-width="2"/>
  <path d="M219 345Q300 327 378 345" fill="none" stroke="#111719" stroke-width="4"/>
  <rect x="366" y="341" width="7" height="25" rx="2" fill="#b7bdbd"/>
  <path d="M221 359L219 454Q221 471 238 473H360" fill="none" stroke="#667174" stroke-opacity=".35" stroke-width="1.5" stroke-dasharray="3 4"/>
  <rect x="269" y="256" width="60" height="18" rx="3" fill="#1e2528" stroke="#737c7d" stroke-width=".7"/>
  <text x="299" y="268" font-family="sans-serif" font-size="8" letter-spacing="3" text-anchor="middle" fill="#ced3d0">URBAN</text>
  <path d="M225 202L216 301M374 206L383 303" stroke="#7d8789" stroke-opacity=".16" stroke-width="2"/>
`);

export const jacketImage = svgDataUrl(`
  <defs>
    <linearGradient id="jacket" x1="0" x2="1" y2="1"><stop stop-color="#eff1ed"/><stop offset=".5" stop-color="#c6cdc7"/><stop offset="1" stop-color="#9ea9a3"/></linearGradient>
    <linearGradient id="sleeve"><stop stop-color="#bcc6bd"/><stop offset="1" stop-color="#e2e6df"/></linearGradient>
    <radialGradient id="s"><stop stop-color="#293a30" stop-opacity=".18"/><stop offset="1" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse cx="301" cy="532" rx="205" ry="22" fill="url(#s)"/>
  <path d="M235 143Q234 82 300 76Q366 83 366 143L340 185H263Z" fill="#aebbb2" stroke="#89998d" stroke-width="3"/>
  <path d="M250 141Q254 96 300 94Q346 97 352 141L320 168H279Z" fill="#dbe2d8"/>
  <path d="M238 135L177 161L91 344L126 399L206 286L200 484Q300 508 400 484L394 286L474 399L509 344L423 161L362 135L319 169H281Z" fill="url(#jacket)" stroke="#96a397" stroke-width="2"/>
  <path d="M177 164L203 231L126 397L91 344Z" fill="url(#sleeve)"/><path d="M423 164L397 231L474 397L509 344Z" fill="url(#sleeve)"/>
  <path d="M300 171V494" stroke="#7c8a7e" stroke-width="5"/><path d="M301 171V490" stroke="#f6f8f2" stroke-width="2"/>
  <path d="M239 145L281 178L264 207L232 156M361 145L319 178L336 207L368 156" fill="#e7ebe3" stroke="#9eada0" stroke-width="2"/>
  <path d="M225 343L257 365M375 343L343 365" stroke="#88998b" stroke-width="4"/>
  <path d="M201 476Q300 497 399 476" fill="none" stroke="#819183" stroke-width="3"/>
  <path d="M97 349L127 383M473 383L503 349" stroke="#8b9b8d" stroke-width="9"/>
  <path d="M206 243L218 304M394 243L382 304" stroke="#f8faf5" stroke-opacity=".6" stroke-width="3"/>
  <rect x="296" y="195" width="9" height="24" rx="3" fill="#697f70"/>
  <text x="341" y="271" font-family="sans-serif" font-size="11" letter-spacing="1" fill="#738a7a">NORTH</text>
`);

export const cupImage = svgDataUrl(`
  <defs>
    <linearGradient id="cup"><stop stop-color="#d8cdb9"/><stop offset=".25" stop-color="#f6edde"/><stop offset=".65" stop-color="#ede2cf"/><stop offset="1" stop-color="#bcae95"/></linearGradient>
    <linearGradient id="lid"><stop stop-color="#b5a58a"/><stop offset=".45" stop-color="#e9dec9"/><stop offset="1" stop-color="#b2a38b"/></linearGradient>
    <radialGradient id="s"><stop stop-color="#3b3220" stop-opacity=".23"/><stop offset="1" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse cx="302" cy="532" rx="148" ry="27" fill="url(#s)"/>
  <path d="M210 189H390L374 481Q370 519 301 520Q231 519 226 481Z" fill="url(#cup)" stroke="#bbad97" stroke-width="2"/>
  <ellipse cx="300" cy="194" rx="90" ry="23" fill="#e8dcc6"/>
  <path d="M207 153Q300 121 393 153L392 194Q300 224 208 194Z" fill="url(#lid)" stroke="#a3947b" stroke-width="2"/>
  <ellipse cx="300" cy="153" rx="93" ry="25" fill="#ddcfb7" stroke="#ae9e83" stroke-width="3"/>
  <path d="M246 146Q299 126 353 146L348 158Q299 174 250 158Z" fill="#766c5a"/>
  <path d="M259 124Q302 110 344 123L347 147Q301 160 256 146Z" fill="#b2a286" stroke="#91836a" stroke-width="2"/>
  <ellipse cx="302" cy="124" rx="42" ry="10" fill="#e8dcc4"/>
  <path d="M386 183Q432 197 427 239Q419 272 392 271" fill="none" stroke="#c7b69a" stroke-width="13"/>
  <path d="M238 242L250 467" stroke="#fff9ef" stroke-width="5" stroke-linecap="round" stroke-opacity=".5"/>
  <text x="302" y="355" text-anchor="middle" font-family="sans-serif" font-size="21" letter-spacing="6" fill="#8b7c64">SLOW</text>
  <text x="302" y="376" text-anchor="middle" font-family="sans-serif" font-size="9" letter-spacing="3" fill="#9f8e71">TAKE A MOMENT</text>
  <path d="M232 484Q300 506 369 484" fill="none" stroke="#b7a78c" stroke-width="2"/>
`);

export const CATEGORIES = ['箱包配饰', '服饰鞋靴', '家居水具', '数码配件'];

export const VISUAL_STYLES: { id: VisualStyleId; name: string; short: string; color: string; subtitle: string }[] = [
  { id: 'promo-red', name: '大促爆款红', short: '大促爆款', color: '#e74a39', subtitle: '高点击 · 强转化' },
  { id: 'minimal-white', name: '极简通勤白', short: '极简通勤', color: '#e9e9e6', subtitle: '轻留白 · 有质感' },
  { id: 'luxury-black', name: '高端质感黑金', short: '黑金质感', color: '#252727', subtitle: '高客单 · 品牌感' },
  { id: 'fresh-green', name: '清新种草绿', short: '清新种草', color: '#bad1ac', subtitle: '生活感 · 轻种草' },
];

export function createDemoTemplates(): TemplateAsset[] {
  const createdAt = new Date().toISOString();
  return [
    { id: 'preset-promo', name: '大促测款爆款模板', tags: ['大促冲量', '高点击'], visualStyle: 'promo-red', copyTone: 'promo', badgeDefault: '限时直降', titleFormulaHint: '核心关键词 + 商品名 + 爆款利益点', description: '直击需求，突出利益点，用短句放大商品吸引力。', createdAt },
    { id: 'preset-minimal', name: '极简都市通勤模板', tags: ['极简质感', '箱包服饰', '通勤日用'], visualStyle: 'minimal-white', copyTone: 'minimal', badgeDefault: '新品首发', titleFormulaHint: '材质关键词 + 商品名 + 使用场景', description: '克制表达，聚焦材质与实用细节，让品质自己说话。', createdAt },
    { id: 'preset-luxury', name: '高客单黑金质感模板', tags: ['高端送礼', '品质感'], visualStyle: 'luxury-black', copyTone: 'professional', badgeDefault: '品质之选', titleFormulaHint: '品质材质 + 商品名 + 核心功能', description: '以材质工艺和功能参数建立信任，适合品质型商品。', createdAt },
  ];
}

export function createDemoProducts(): ProductItem[] {
  const items: ProductItem[] = [
    { id: 'demo-backpack', name: '轻量防泼水通勤双肩包', category: '箱包配饰', material: '哑光高密尼龙', specs: '曜石黑 15.6寸', audience: '职场通勤/大学生', highlights: '780g超轻、独立电脑仓、USB外接充电口', badgeText: '新品立减50', imageUrl: backpackImage, status: 'generated' },
    { id: 'demo-jacket', name: '冰感 UPF50+ 凉感防晒衣', category: '服饰鞋靴', material: '冰丝原纱锦纶', specs: '云雾灰 M/L', audience: '户外通勤/骑行人群', highlights: '凉感透气、加长护手背、可收纳成口袋', badgeText: '买一送一', imageUrl: jacketImage, status: 'draft' },
    { id: 'demo-cup', name: '316不锈钢便携随行咖啡杯', category: '家居水具', material: '316医用级内胆', specs: '燕麦奶白 450ml', audience: '咖啡党/上班族', highlights: '6小时长效锁温、360度防漏、单手弹盖', badgeText: '限时直降', imageUrl: cupImage, status: 'draft' },
  ];
  items[0].generated = generateContent(items[0], createDemoTemplates()[1], 0);
  items[0].generated.posterTitle = '轻装上阵，自在通勤';
  return items;
}

export function createInitialState(): StudioState {
  const items = createDemoProducts();
  return {
    workspace: { items, activeId: items[0].id, templateId: 'preset-minimal', batchName: '日常上新 · 通勤好物', batchId: null, batchCreatedAt: null },
    templates: createDemoTemplates(),
    history: [],
  };
}
