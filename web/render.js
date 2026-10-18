/* 命運市集・純渲染層。index.html 與 report.html 共用：這裡的函式只吃後端回傳的資料、回傳 DOM 節點，
 * 不碰頁面上的 id、不打 API、不存狀態（互動只限節點內部的展開／收合）。
 * 原則同 app.js：畫面上所有命盤內容都從資料渲染，這裡不寫死任何命理內容。 */
'use strict';

// ------------------------------------------------------------------ DOM 小工具
/** 建立元素：el('div', {class:'x', text:'…', onclick}, child1, child2…) */
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false || c === '') continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}
const clear = (node) => { node.replaceChildren(); return node; };
/** append 的平坦化版本：接受陣列與 null/false（DOM 原生 append 不會攤平陣列） */
const append = (node, ...children) => { for (const c of children.flat(Infinity)) if (c != null && c !== false) node.append(c); return node; };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** 「MM-DD HH:MM」：節氣、交運時間用；非 ISO 字串就原樣回傳 */
function shortTime(iso) {
  const m = String(iso ?? '').match(/^\d{4}-(\d{2})-(\d{2})(?:[T ](\d{2}:\d{2}))?/);
  return m ? `${m[1]}-${m[2]}${m[3] ? ' ' + m[3] : ''}` : String(iso ?? '');
}
const hasItems = (a) => Array.isArray(a) && a.length > 0;
const nonEmpty = (o) => o && typeof o === 'object' && Object.keys(o).length > 0;
/** 「庚子［壁上土］」：干支加納音（納音缺就只有干支） */
const gzNayin = (o) => o && o.gz ? `${o.gz}${o.nayin ? `［${o.nayin}］` : ''}` : null;
/** 分數顯示：3.25 → 3.25、1 → 1、-0.8 → −0.8 */
const fmtScore = (n) => { const v = Number(n); return Number.isFinite(v) ? String(Math.round(v * 100) / 100).replace('-', '−') : String(n ?? ''); };
const BRANCHES12 = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// ------------------------------------------------------------------ 事實
/** 從命盤清單找事實 id */
function findFact(id, charts) {
  for (const c of charts) {
    if (!c) continue;
    const f = (c.facts || []).find((x) => x.id === id);
    if (f) return f;
  }
  return null;
}
/** 事實 id 顯示用短標籤：有命盤就用 label，沒有就顯示 id */
const factLabel = (id, charts) => { const f = findFact(id, charts); return f ? f.label : id; };

// ------------------------------------------------------------------ 流派標註（盤面）
/** 某幾條事實若有流派歧見 → 「派」角標，hover 顯示各派的結果 */
function schoolMark(chart, ids) {
  if (!chart || !Array.isArray(chart.facts)) return null;
  const list = Array.isArray(ids) ? ids : [ids];
  const dep = new Set(((chart.payload || {}).school_dependent) || []);
  const lines = [];
  for (const id of list) {
    const f = chart.facts.find((x) => x && x.id === id);
    if (!f) continue;
    const alts = Array.isArray(f.alternatives) ? f.alternatives : [];
    if (!alts.length && !dep.has(id)) continue;
    for (const a of alts) lines.push(`${list.length > 1 ? f.label + '　' : ''}${a.label || a.option || a.switch || ''}：${a.value ?? ''}`);
    if (!alts.length) lines.push(`${f.label}：受流派設定影響`);
  }
  if (!lines.length) return null;
  return el('span', { class: 'school-mark', text: '派', title: `流派歧見\n${lines.join('\n')}`, 'aria-label': `流派歧見：${lines.join('；')}` });
}

/** 卡片標題旁的流派名，hover 顯示一行摘要 */
function schoolTitle(school) {
  if (!school || typeof school !== 'object' || !school.title) return null;
  return el('span', { class: 'school-title', text: school.title, title: school.summary || school.source || '' });
}

function warningsBlock(list) {
  if (!list || !list.length) return null;
  return el('div', { class: 'warnings' }, list.map((w) => el('div', { text: '⚠ ' + w })));
}

// ------------------------------------------------------------------ 八字
/** 四柱橫排；mini 用於合盤縮小版 */
const PILLAR_KEY = { 年柱: 'year', 月柱: 'month', 日柱: 'day', 時柱: 'hour' };
function renderPillars(payload, { mini = false, chart = null } = {}) {
  const order = ['年柱', '月柱', '日柱', '時柱'];
  const byName = Object.fromEntries((payload.pillars || []).map((p) => [p.name, p]));
  return el('div', { class: 'pillars' }, order.map((name) => {
    const p = byName[name];
    if (!p) return el('div', { class: 'pillar missing' }, el('div', { class: 'pname', text: name }), el('div', { class: 'glyph', text: '資料不足' }), !mini && el('div', { class: 'elem', text: '時辰不明' }));
    const isDay = name === '日柱';
    return el('div', { class: `pillar${isDay ? ' day' : ''}` },
      schoolMark(chart, `bazi.pillar.${PILLAR_KEY[name]}`),
      el('div', { class: 'pname', text: name }),
      el('div', { class: `god${isDay ? ' dm' : ''}`, text: p.stem_god || '' }),
      el('div', { class: 'glyphs' },
        el('span', { class: 'glyph stem', text: p.stem }),
        el('span', { class: 'glyph branch', text: p.branch })),
      el('div', { class: 'elem', text: `${p.stem_elem || ''}${p.branch_elem || ''}${p.zodiac ? '・' + p.zodiac : ''}` }),
      !mini && el('div', { class: 'hidden' },
        (p.hidden_stems || []).map((h, i) => el('span', { text: `${h}${p.hidden_gods && p.hidden_gods[i] ? ' ' + p.hidden_gods[i] : ''}` }))),
    );
  }));
}

/** 目前走的大運：有交運日期就用日期判定，否則用虛歲 */
function currentDayun(chart) {
  const p = chart.payload || {};
  const age = p.age;
  const todayIso = (chart.cast_at || new Date().toISOString()).slice(0, 10);
  return (p.dayun || []).find((d) => d.start_date
    ? (todayIso >= d.start_date && todayIso < (String(Number(d.start_date.slice(0, 4)) + 10) + d.start_date.slice(4)))   // 以交運日期判定
    : (age != null && d.start_age <= age && age < d.end_age)) || null;
}

/** 摘要列：日主／旺衰／喜用／目前大運／真太陽時／月令。旺衰格可點，展開 strengthBlock（若有） */
function renderBaziKv(chart, current, strengthBlock) {
  const p = chart.payload || {};
  const s = p.strength || {};
  const kv = (label, value, factId) => el('div', {}, el('b', { text: label }, factId && schoolMark(chart, factId)), el('span', { text: value ?? '—' }));
  const strengthKv = el('div', { class: strengthBlock ? 'kv-toggle' : '', role: strengthBlock ? 'button' : null, tabindex: strengthBlock ? '0' : null, title: strengthBlock ? '點開看旺衰判定依據' : null },
    el('b', { text: '旺衰' }, schoolMark(chart, 'bazi.strength')), el('span', { text: s.label ?? '—' }),
    strengthBlock && el('small', { class: 'kv-more', text: '依據 ▾' }));
  if (strengthBlock) {
    const toggle = () => { strengthBlock.open = !strengthBlock.open; };
    strengthKv.addEventListener('click', toggle);
    strengthKv.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  }
  return el('div', { class: 'kv' },
    kv('日主', p.day_master ? `${p.day_master}${(chart.facts.find((f) => f.id === 'bazi.day_master') || {}).value?.slice(1) ?? ''}` : null, 'bazi.day_master'),
    strengthKv,
    kv('喜用', (s.favourable || []).join('、'), 'bazi.favourable'),
    kv('目前大運', current
      ? `${current.gz}（${Math.round(current.start_age)}–${Math.round(current.end_age)} 歲）`
      : (p.dayun && p.dayun.length && p.age < p.dayun[0].start_age)
        ? `尚未起運（${p.dayun[0].start_age} 歲起運，第一步 ${p.dayun[0].gz}）`   // 起運前：不是資料不足
        : '資料不足', 'bazi.dayun.current'),
    p.true_solar_time && kv('真太陽時', `${p.true_solar_time}${p.solar_correction_min != null ? `（${p.solar_correction_min > 0 ? '+' : ''}${Math.round(p.solar_correction_min)} 分）` : ''}`),
    p.month_term && kv('月令', p.month_term),
  );
}

/** 旺衰判定依據的逐項分數：優先 payload.strength.notes，沒有就把 bazi.strength 事實的 note 以「；」切開 */
function strengthNotes(chart, s) {
  if (hasItems(s.notes)) return s.notes.map((n) => String(n));
  const f = (chart.facts || []).find((x) => x && x.id === 'bazi.strength');
  if (!f || !f.note) return [];
  return String(f.note).split(/；|;/).map((t) => t.trim()).filter(Boolean);
}

/**
 * 旺衰 v2（可稽核）：比例條（生扶 vs 耗洩，各類分數）、逐項分數、用神／調候／月令格局／忌神。
 * v1（或舊後端）只列 notes。回傳 <details>，由摘要列的「旺衰」格或自己的 summary 展開。
 */
function renderStrength(chart, { open = false } = {}) {
  const p = chart.payload || {};
  const s = p.strength || {};
  const v2 = s.method === 'score_v2' || (s.method == null && nonEmpty(s.support_by) && nonEmpty(s.drain_by));
  const notes = strengthNotes(chart, s);
  if (!v2 && !notes.length) return null;
  const blocks = [];
  if (v2) {
    const sup = Number(s.support) || 0, dr = Number(s.drain) || 0, tot = sup + dr;
    const pct = tot ? Math.round((sup / tot) * 100) : 50;
    const cats = (obj) => Object.entries(obj || {}).map(([k, v]) => el('span', { class: 'scat' }, el('b', { text: k }), fmtScore(v)));
    blocks.push(el('div', { class: 'ratio' },
      el('div', { class: 'ratio-bar', role: 'img', 'aria-label': `生扶 ${fmtScore(sup)}，耗洩 ${fmtScore(dr)}` },
        el('span', { class: 'seg support', style: `width:${pct}%`, text: pct >= 16 ? `生扶 ${fmtScore(sup)}` : '' }),
        el('span', { class: 'seg drain', style: `width:${100 - pct}%`, text: (100 - pct) >= 16 ? `耗洩 ${fmtScore(dr)}` : '' })),
      el('div', { class: 'ratio-cats' },
        el('div', { class: 'cats support' }, el('i', { text: '生扶' }), cats(s.support_by)),
        el('div', { class: 'cats drain' }, el('i', { text: '耗洩' }), cats(s.drain_by))),
      s.ratio != null && el('div', { class: 'hint', text: `比例 ${s.ratio}＝生扶 ÷（生扶＋耗洩）；≥0.58 身強、≤0.42 身弱、其間中和${s.cong ? '；無根且 <0.22 疑從格' : ''}` }),
    ));
  }
  if (notes.length) blocks.push(el('ul', { class: 'issues snotes' }, notes.map((n) => el('li', { text: n }))));
  if (v2) {
    const rows = [];
    const row = (label, value, note, factId) => (value || note) && rows.push(el('div', { class: 'drow' },
      el('b', { text: label }, factId && schoolMark(chart, factId)),
      el('span', {}, value && el('strong', { text: value }), note && el('small', { class: 'hint', text: note }))));
    row('用神', s.yongshen, s.yongshen_why, 'bazi.yongshen');
    row('調候', s.tiaohou || (s.tiaohou_note ? '不急' : null), s.tiaohou_note, 'bazi.tiaohou');
    row('格局', s.pattern, s.pattern_note, 'bazi.pattern');
    if (hasItems(s.avoid)) row('忌神', s.avoid.join('、'), null, null);
    if (rows.length) blocks.push(el('div', { class: 'dkv strength-kv' }, rows));
  }
  if (s.disclaimer) blocks.push(el('p', { class: 'hint', text: s.disclaimer }));
  return el('details', { class: 'strength-notes', open: open || null },
    el('summary', {}, el('span', { class: 'stitle', text: '旺衰判定依據' }), el('span', { class: `ver ${v2 ? 'v2' : 'v1'}`, text: v2 ? 'v2 可稽核' : 'v1 簡化', title: v2 ? '月令旺相休囚死、藏干加權通根、透干，每一項分數都列出來' : '課程用的簡化計分法' })),
    el('div', { class: 'strength-body' }, blocks));
}

/** 大運一列（最多 8 步） */
function renderDayunRow(p, current) {
  return p.dayun && p.dayun.length
    ? el('div', { class: 'dayun-row' }, p.dayun.slice(0, 8).map((d) => el('div', { class: `dayun${d === current ? ' current' : ''}` },
      el('span', { class: 'gz', text: d.gz }),
      `${Math.round(d.start_age)}歲`, el('br'), `${d.start_year}`,
      d === current && el('div', { text: '目前' }))))
    : el('p', { class: 'hint', text: '資料不足（性別未填，無法定大運方向）' });
}

/** 流年三格（bazi.liunian.YYYY 事實） */
function renderLiunianRow(chart) {
  const liunian = chart.facts.filter((f) => /^bazi\.liunian\.\d{4}$/.test(f.id)).slice(0, 3);
  const currentYear = (chart.facts.find((f) => f.id === 'bazi.liunian.current') || {}).value;
  return el('div', { class: 'liunian-row' }, liunian.map((f) => {
    const year = f.id.slice(-4);
    const [gz, gods] = String(f.value).split('・');
    return el('div', { class: `liunian${gz === currentYear ? ' current' : ''}` },
      el('div', { class: 'y', text: `${year}${gz === currentYear ? '・今年' : ''}` }),
      el('span', { class: 'gz', text: gz }), gods || '',
      f.note && el('div', { class: 'hint', text: f.note }));
  }));
}

function renderBazi(chart) {
  const p = chart.payload || {};
  const current = currentDayun(chart);
  const strengthBlock = renderStrength(chart);
  return el('div', { class: 'card' },
    el('h3', {}, '八字命盤', schoolTitle(chart.school)),
    el('p', { class: 'subject', text: chart.subject }),
    renderPillars(p, { chart }),
    warningsBlock(chart.warnings),
    renderBaziKv(chart, current, strengthBlock),
    strengthBlock,
    el('h3', { text: '大運' }),
    renderDayunRow(p, current),
    el('h3', { text: '流年' }),
    renderLiunianRow(chart),
    renderBaziDetail(chart, current),
  );
}

/** 黃曆（lunar-python 提供，文字為簡體照顯示）：有 almanac 才渲染 */
function renderAlmanac(a) {
  if (!nonEmpty(a)) return null;
  const tags = (list, cls) => hasItems(list) && el('div', { class: 'alm-tags' }, list.map((t) => el('span', { class: `stag ${cls}`, text: t })));
  const row = (label, node) => node ? el('div', { class: 'drow' }, el('b', { text: label }), el('span', {}, node)) : null;
  const rows = [
    row('星宿', a.xiu && el('span', {}, a.xiu, a.xiu_luck && el('span', { class: `luck ${a.xiu_luck === '吉' ? 'good' : 'bad'}`, text: a.xiu_luck }))),
    row('建除', a.zhixing),
    row('彭祖', hasItems(a.pengzu) && a.pengzu.map((t) => el('div', { class: 'pengzu', text: t }))),
    row('宜', tags(a.day_yi, 'yi')),
    row('忌', tags(a.day_ji, 'ji')),
    row('吉神', tags(a.jishen, 'yi')),
    row('凶煞', tags(a.xiongsha, 'ji')),
    row('方位', nonEmpty(a.positions) && Object.entries(a.positions).map(([k, v]) => el('span', { class: 'pos' }, el('i', { text: k }), v))),
    row('胎息', a.taixi), row('身宮', a.shengong), row('命宮', a.mingong),
  ].filter(Boolean);
  if (!rows.length) return null;
  return [
    el('h4', { class: 'dtitle' }, '黃曆', el('small', { class: 'hint', text: '（lunar-python 提供）' })),
    el('div', { class: 'dkv almanac' }, rows),
    a.source && el('p', { class: 'hint source', text: `來源：${a.source}` }),
  ];
}

/**
 * 詳細盤面：農曆／節氣／起運、四柱加列、地支關係、神煞總表、大運×流年、流月、稱骨、黃曆。
 * 每一塊都只在資料存在時才渲染，缺欄位就整塊不顯示（後端欄位可能逐步加上）。
 * 放在同一張 .card 內，匯出 PNG 與列印自然包含。
 */
function renderBaziDetail(chart, currentDayunObj) {
  const p = chart.payload || {};
  const blocks = [];
  const h4 = (text) => el('h4', { class: 'dtitle', text });
  const godPair = (o) => [o.stem_god, o.branch_god].filter(Boolean).join('／');

  // 1. 基本：農曆、節氣、起運、胎元、命宮
  const basics = [];
  const row = (label, value, factId) => value && basics.push(el('div', { class: 'drow' }, el('b', { text: label }, factId && schoolMark(chart, factId)), el('span', { text: value })));
  row('農曆', p.lunar && p.lunar.text, 'bazi.lunar');
  if (p.terms && (p.terms.prev || p.terms.next)) {
    const t = (x) => x && x.name ? `${x.name} ${shortTime(x.time)}`.trim() : null;
    row('節氣', [t(p.terms.prev), t(p.terms.next)].filter(Boolean).join(' ～ '), 'bazi.terms');
  }
  row('起運', p.qiyun && p.qiyun.text, 'bazi.qiyun');
  row('胎元', gzNayin(p.taiyuan), 'bazi.taiyuan');
  row('命宮', gzNayin(p.minggong), 'bazi.minggong');
  if (basics.length) blocks.push(h4('基本'), el('div', { class: 'dkv' }, basics));

  // 2. 四柱加列：納音、空亡、十二長生、神煞（四欄對應年月日時）
  const order = ['年柱', '月柱', '日柱', '時柱'];
  const byName = Object.fromEntries((p.pillars || []).map((x) => [x.name, x]));
  const extRows = [
    ['納音', (x) => x.nayin, 'nayin'],
    ['空亡', (x) => x.kongwang, 'kongwang'],
    ['長生', (x) => x.changsheng, 'changsheng'],
    ['神煞', (x) => hasItems(x.shensha) ? x.shensha.map((s) => el('span', { class: 'stag', text: s })) : null, null],
  ].filter(([, get]) => order.some((n) => byName[n] && get(byName[n])));
  if (extRows.length) {
    blocks.push(h4('四柱'), el('div', { class: 'tscroll' }, el('table', { class: 'dtable pillar-ext' },
      el('thead', {}, el('tr', {}, el('th', { text: '' }), order.map((n) => el('th', { class: n === '日柱' ? 'day' : '', text: n.slice(0, 1) })))),
      el('tbody', {}, extRows.map(([label, get, prefix]) => el('tr', {},
        el('th', { text: label }, label === '神煞' && schoolMark(chart, 'bazi.shensha')),
        order.map((n) => {
          const x = byName[n]; const v = x ? get(x) : null;
          return el('td', { class: n === '日柱' ? 'day' : '' }, v == null ? '—' : v, prefix && schoolMark(chart, `bazi.${prefix}.${PILLAR_KEY[n]}`));
        })))))));
  }

  // 3. 地支關係：合／會＝金，沖／刑／害／破＝硃砂
  if (hasItems(p.relations)) {
    blocks.push(h4('刑沖合會'), el('ul', { class: 'drel' }, p.relations.map((r) => el('li', {},
      r.kind && el('span', { class: `kind kind-${r.kind}`, text: r.kind }),
      el('span', { text: r.text || '' }),
      hasItems(r.pillars) && el('small', { class: 'hint', text: `（${r.pillars.join('・')}）` })))));
  }

  // 4. 神煞總表
  if (hasItems(p.shensha)) {
    blocks.push(el('h4', { class: 'dtitle' }, '神煞', schoolMark(chart, 'bazi.shensha')), el('div', { class: 'tscroll' }, el('table', { class: 'dtable shensha-table' },
      el('thead', {}, el('tr', {}, ['名稱', '落點', '依據'].map((t) => el('th', { text: t })))),
      el('tbody', {}, p.shensha.map((s) => el('tr', {},
        el('td', { class: 'name', text: s.name || '' }), el('td', { text: s.where || '' }), el('td', { class: 'basis', text: s.basis || '' })))))));
  }

  // 5. 大運 × 流年：每個大運一欄，欄下縱列 10 個流年；目前大運欄與今年高亮
  const thisYear = (p.liuyue && p.liuyue.year) || (chart.cast_at ? Number(String(chart.cast_at).slice(0, 4)) : new Date().getFullYear());
  if (hasItems(p.dayun)) {
    const dayun = p.dayun.slice(0, 10);
    const rows = Math.max(0, ...dayun.map((d) => (d.liunian || []).length));
    const isCur = (d) => d === currentDayunObj;
    const age = (d) => d.start_age != null && d.end_age != null ? `${Math.round(d.start_age)}–${Math.round(d.end_age)} 歲` : (d.start_age != null ? `${Math.round(d.start_age)} 歲起` : '');
    blocks.push(h4('大運・流年'), el('div', { class: 'tscroll' }, el('table', { class: 'dtable dl-table', style: `--cols:${dayun.length}` },
      el('thead', {}, el('tr', {}, dayun.map((d) => el('th', { class: isCur(d) ? 'current' : '' },
        el('div', { class: 'gz', text: d.gz || '' }),
        el('div', { class: 'age', text: age(d) }),
        godPair(d) && el('div', { class: 'gods', text: godPair(d) }),
        d.changsheng && el('div', { class: 'cs', text: d.changsheng }),
        hasItems(d.shensha) && el('div', { class: 'tags' }, d.shensha.map((s) => el('span', { class: 'stag', text: s }))),
        isCur(d) && el('div', { class: 'now', text: '目前' }))))),
      rows > 0 && el('tbody', {}, Array.from({ length: rows }, (_, i) => el('tr', {}, dayun.map((d) => {
        const y = (d.liunian || [])[i];
        if (!y) return el('td', { class: isCur(d) ? 'cur-col' : '' });
        const cur = y.year === thisYear;
        return el('td', { class: `${isCur(d) ? 'cur-col' : ''}${cur ? ' cur-year' : ''}` },
          el('span', { class: 'y', text: y.year ?? '' }), el('span', { class: 'gz', text: y.gz || '' }),
          el('span', { class: 'gods', text: godPair(y) }));
      }))))),
    ), hasItems(dayun) && el('p', { class: 'scroll-hint', text: '← 表格可左右滑動 →' }));
  }

  // 6. 流月
  if (p.liuyue && hasItems(p.liuyue.months)) {
    blocks.push(h4(`流月${p.liuyue.year ? `・${p.liuyue.year}` : ''}`), el('div', { class: 'liuyue' }, p.liuyue.months.map((m) => el('div', { class: 'ly' },
      el('div', { class: 'term', text: m.term || '' }), el('div', { class: 'gz', text: m.gz || '' }), el('div', { class: 'gods', text: godPair(m) })))));
  }

  // 7. 稱骨
  const c = p.chenggu;
  if (nonEmpty(c) && (c.text || c.verse || c.total_qian != null)) {
    const parts = nonEmpty(c.parts) ? [['年', c.parts.year], ['月', c.parts.month], ['日', c.parts.day], ['時', c.parts.hour]].filter(([, v]) => v != null) : [];
    const verse = String(c.verse || '').replace(/([。！？；])/g, '$1\n').split('\n').map((s) => s.trim()).filter(Boolean);
    blocks.push(el('h4', { class: 'dtitle' }, '稱骨', schoolMark(chart, 'bazi.chenggu')), el('div', { class: 'chenggu' },
      el('div', { class: 'weight', text: c.text || `${c.total_qian} 錢` }),
      parts.length > 0 && el('div', { class: 'parts' }, parts.map(([k, v]) => el('span', {}, el('b', { text: k }), `${v} 錢`))),
      verse.length > 0 && el('div', { class: 'verse' }, verse.map((line) => el('div', { text: line }))),
      c.note && el('div', { class: 'hint', text: c.note })));
  }

  // 8. 黃曆（可選）
  const alm = renderAlmanac(p.almanac);
  if (alm) blocks.push(...alm.filter(Boolean));

  if (!blocks.length) return null;
  return el('details', { class: 'detail', open: true }, el('summary', { text: '詳細盤面' }), el('div', { class: 'detail-body' }, blocks));
}

// ------------------------------------------------------------------ 紫微
// 十二宮固定位置（4×4，行/列從 1 起算）
const ZIWEI_POS = { 巳: [1, 1], 午: [1, 2], 未: [1, 3], 申: [1, 4], 辰: [2, 1], 酉: [2, 4], 卯: [3, 1], 戌: [3, 4], 寅: [4, 1], 丑: [4, 2], 子: [4, 3], 亥: [4, 4] };
// 廟旺利陷的顏色分組：廟旺＝綠、陷不＝硃砂、其餘灰
const BRIGHT_CLASS = { 廟: 'good', 旺: 'good', 陷: 'bad', 不: 'bad' };

/** 四化標籤有流派歧見時（ziwei.hua.化X 的 alternatives）：{化科: "庚壬年天府化科：天府（在財帛宮）"} */
function huaAltTitles(chart) {
  const out = {};
  for (const f of (chart && chart.facts) || []) {
    const m = f && typeof f.id === 'string' && f.id.match(/^ziwei\.hua\.(化[祿權科忌])$/);
    if (m && Array.isArray(f.alternatives) && f.alternatives.length) out[m[1]] = `流派歧見\n${f.alternatives.map((a) => `${a.label || a.option || ''}：${a.value ?? ''}`).join('\n')}`;
  }
  return out;
}

/** 星名＋廟旺（可選，右上角小字）＋四化角標 */
function starWithHua(star, hua, huaAlts, brightness) {
  const h = hua && hua[star];
  const alt = h && huaAlts && huaAlts[h];
  const b = brightness && brightness[star];
  return el('span', {}, star,
    b && el('sup', { class: `bri ${BRIGHT_CLASS[b] || 'mid'}`, text: b, title: `廟旺：${b}` }),
    h && el('span', { class: `hua hua-${h.replace('化', '')}${alt ? ' alt' : ''}`, text: h.replace('化', ''), title: alt || null }));
}

function renderPalace(p, lifeBranch, chart, { compact = false } = {}) {
  const [row, col] = ZIWEI_POS[p.branch] || [1, 1];
  const huaAlts = huaAltTitles(chart);
  const isLife = p.branch === lifeBranch;
  const bright = nonEmpty(p.brightness) ? p.brightness : null;
  const star = (s) => starWithHua(s, p.hua, huaAlts, bright);
  const adj = Array.isArray(p.adjective_stars) ? p.adjective_stars.filter(Boolean) : [];
  const shown = adj.slice(0, 4), rest = adj.slice(4);
  return el('div', { class: `palace${isLife ? ' life' : ''}`, style: `grid-row:${row};grid-column:${col}` },
    el('div', { class: 'p-head' },
      el('span', { class: 'p-name', text: p.name }, schoolMark(chart, isLife ? ['ziwei.life_palace', `ziwei.palace.${p.name}`] : `ziwei.palace.${p.name}`)),
      el('span', { class: 'p-gz', text: p.gz || `${p.stem || ''}${p.branch}` })),
    el('div', { class: 'major' }, (p.major && p.major.length) ? p.major.map(star) : el('span', { class: 'empty-star', text: '空宮' })),
    Array.isArray(p.lucky) && p.lucky.length > 0 && el('div', { class: 'star-row lucky' }, p.lucky.map(star)),
    Array.isArray(p.unlucky) && p.unlucky.length > 0 && el('div', { class: 'star-row unlucky' }, p.unlucky.map(star)),
    Array.isArray(p.other) && p.other.length > 0 && el('div', { class: 'star-row other' }, p.other.map(star)),
    !compact && shown.length > 0 && el('div', { class: 'p-adj', title: adj.join('、') },
      shown.map((s) => el('span', { text: s })), rest.length > 0 && el('span', { class: 'more', text: `+${rest.length}` })),
    (p.changsheng || p.boshi) && el('div', { class: 'p-tags' },
      p.changsheng && el('span', { class: 'ptag cs', text: p.changsheng, title: '十二長生' }),
      p.boshi && el('span', { class: 'ptag bs', text: p.boshi, title: '博士十二神' })),
    el('div', { class: 'p-foot' },
      el('span', { text: p.daxian ? `${p.daxian[0]}–${p.daxian[1]}` : '' }),
      p.is_body && el('span', { class: 'body-mark', text: '身' })),
  );
}

/** x-iztro 格局膠囊：名稱＋宮位；破格加刪除線 */
function renderPatterns(enrich) {
  if (!nonEmpty(enrich) || !hasItems(enrich.patterns)) return null;
  return el('div', { class: 'patterns' },
    el('span', { class: 'lbl', text: '格局（x-iztro）', title: enrich.source || '' }),
    enrich.patterns.filter((pt) => pt && pt.name).map((pt) => el('span', {
      class: `ptn${pt.broken ? ' broken' : ''}`,
      title: `${pt.broken ? '破格' : '成格'}${hasItems(pt.stars) ? '：' + pt.stars.join('、') : ''}`,
    }, pt.name, pt.palace && el('small', { text: pt.palace }))));
}

/** 四化四顆：星名＋色標＋落宮 */
function sihuaTags(o) {
  if (!hasItems(o.sihua)) return null;
  return el('div', { class: 'sihua' }, o.sihua.map((h) => {
    const s = String(h); const k = s.slice(-2); const key = s.slice(-1); const star = s.slice(0, -2);
    const land = o.sihua_landing && o.sihua_landing[k];
    return el('span', { class: 'sh' }, star || s, el('span', { class: `hua hua-${key}`, text: key }), land && el('small', { text: land }));
  }));
}

/** 歲前／將前十二神兩列（12 個支→神） */
function renderTwelveGods(ln) {
  const rows = [['歲前', ln.suiqian], ['將前', ln.jiangqian]].filter(([, m]) => nonEmpty(m));
  if (!rows.length) return null;
  return el('div', { class: 'ln-gods' }, rows.map(([label, map]) => el('div', { class: 'gods-row' },
    el('b', { text: label }),
    el('div', { class: 'gods-cells' }, (BRANCHES12.every((b) => b in map) ? BRANCHES12 : Object.keys(map)).map((b) => el('span', { class: 'g' }, el('i', { text: b }), map[b] || ''))))));
}

/** 一張流年卡；interactive 時點卡片展開歲前／將前 */
function renderLiunianCard(ln, thisYear, { interactive = true, godsOpen = false } = {}) {
  const cur = ln.current === true || ln.year === thisYear;
  const gods = renderTwelveGods(ln);
  if (gods) gods.hidden = !godsOpen;
  const card = el('div', { class: `ln${cur ? ' current' : ''}${gods && interactive ? ' clickable' : ''}`, role: gods && interactive ? 'button' : null, tabindex: gods && interactive ? '0' : null },
    el('div', { class: 'ln-head' }, el('span', { class: 'y', text: `${ln.year ?? ''}${cur ? '・今年' : ''}` }), ln.age != null && el('span', { class: 'age', text: `${ln.age} 歲` })),
    el('div', { class: 'gz', text: ln.gz || '' }),
    ln.taisui_palace && el('div', { class: 'tai', text: `太歲入${ln.taisui_palace}${ln.branch ? '（' + ln.branch + '）' : ''}` }),
    sihuaTags(ln),
    nonEmpty(ln.flow_stars) && el('div', { class: 'flow' }, Object.entries(ln.flow_stars).map(([k, v]) => el('span', {}, el('i', { text: k.replace(/^流/, '') }), v))),
    gods);
  if (gods && interactive) {
    const toggle = () => { gods.hidden = !gods.hidden; card.classList.toggle('open', !gods.hidden); };
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  }
  return card;
}

const daxianAges = (dx) => hasItems(dx.ages) ? `${dx.ages[0]}–${dx.ages[1]} 歲` : '';
const daxianYears = (dx) => hasItems(dx.years) ? `${dx.years[0]}–${dx.years[1]}` : '';
const daxianTitle = (dx) => `${dx.palace || ''} ${dx.gz || ''}大限 ${daxianAges(dx)} ${daxianYears(dx)}\n大限四化（${dx.stem || ''}干）\n${(dx.sihua || []).map((h) => `${h}${dx.sihua_landing && dx.sihua_landing[String(h).slice(-2)] ? ' → ' + dx.sihua_landing[String(h).slice(-2)] : ''}`).join('\n')}`.trim();

/** 大限 → 流年面板：12 個大限膠囊（點一個展開 10 個流年卡；流年卡再點開歲前／將前） */
function renderLuckPanel(luck, { year = null } = {}) {
  if (!nonEmpty(luck) || !hasItems(luck.daxian)) return null;
  const thisYear = year || new Date().getFullYear();
  const lnArea = el('div', { class: 'ln-area' });
  const row = el('div', { class: 'dx-row' });
  let active = null;
  const show = (dx, btn) => {
    if (active) { active.classList.remove('open'); active.setAttribute('aria-expanded', 'false'); }
    active = btn; btn.classList.add('open'); btn.setAttribute('aria-expanded', 'true');
    clear(lnArea).append(
      el('div', { class: 'dx-detail' },
        el('b', { text: `${dx.palace || ''}・${dx.gz || ''}大限` }), el('span', { class: 'hint', text: `${daxianAges(dx)}　${daxianYears(dx)}${dx.changsheng ? '　' + dx.changsheng : ''}` }),
        hasItems(dx.sihua) && el('span', { class: 'lbl', text: `大限四化（${dx.stem || ''}干）` }), sihuaTags(dx)),
      el('div', { class: 'ln-grid' }, (dx.liunian || []).map((ln) => renderLiunianCard(ln, thisYear))),
    );
  };
  let first = null, cur = null;
  for (const dx of luck.daxian) {
    const btn = el('button', { type: 'button', class: `dx${dx.current ? ' current' : ''}`, title: daxianTitle(dx), 'aria-expanded': 'false' },
      el('span', { class: 'pal', text: dx.palace || '' }),
      el('span', { class: 'gz', text: dx.gz || '' }),
      el('span', { class: 'age', text: daxianAges(dx).replace(' 歲', '') }),
      dx.changsheng && el('span', { class: 'cs', text: dx.changsheng }));
    btn.addEventListener('click', () => show(dx, btn));
    row.append(btn);
    first ??= [dx, btn];
    if (dx.current && !cur) cur = [dx, btn];
  }
  const def = cur || first;
  if (def) show(def[0], def[1]);
  const meta = [luck.forward === true ? '順行' : luck.forward === false ? '逆行' : null, luck.start_age != null ? `${luck.start_age} 歲起第一大限` : null, luck.age_now != null ? `今年虛歲 ${luck.age_now}` : null].filter(Boolean).join('・');
  return el('div', { class: 'luck' },
    el('h4', { class: 'dtitle' }, '大限 → 流年', meta && el('small', { class: 'hint', text: meta })),
    row, lnArea,
    el('p', { class: 'hint', text: '點大限看十個流年；點流年卡看歲前／將前十二神。' }));
}

/** 報告用：目前大限＋今年流年（不可互動、十二神直接展開） */
function renderLuckNow(luck, { year = null } = {}) {
  if (!nonEmpty(luck) || !hasItems(luck.daxian)) return null;
  const thisYear = year || new Date().getFullYear();
  const dx = luck.daxian.find((d) => d.current) || luck.daxian.find((d) => (d.liunian || []).some((l) => l.year === thisYear)) || null;
  if (!dx) return null;
  const ln = (dx.liunian || []).find((l) => l.current === true) || (dx.liunian || []).find((l) => l.year === thisYear) || null;
  return el('div', { class: 'luck luck-now' },
    el('div', { class: 'dx-detail' },
      el('b', { text: `目前大限：${dx.palace || ''}・${dx.gz || ''}` }), el('span', { class: 'hint', text: `${daxianAges(dx)}　${daxianYears(dx)}${dx.changsheng ? '　' + dx.changsheng : ''}` }),
      hasItems(dx.sihua) && el('span', { class: 'lbl', text: `大限四化（${dx.stem || ''}干）` }), sihuaTags(dx)),
    ln && el('div', { class: 'ln-grid one' }, renderLiunianCard(ln, thisYear, { interactive: false, godsOpen: true })));
}

/** 紫微 4×4 盤面（含中央資訊區）；compact 時不列雜曜 */
function renderZiweiGrid(chart, { compact = false } = {}) {
  const p = chart.payload || {};
  const lunar = p.lunar || {};
  const bodyPalace = (p.palaces || []).find((x) => x.is_body);
  const cur = chart.facts.find((f) => f.id === 'ziwei.daxian.current');
  const row = (...pairs) => el('div', { class: 'row' }, pairs.filter(([, v]) => v != null && v !== '').map(([k, v, id]) => el('span', {}, el('b', { text: k }, id && schoolMark(chart, id)), v)));
  const huaAlts = huaAltTitles(chart);
  const huaTag = (h) => el('span', { class: `hua hua-${h}${huaAlts['化' + h] ? ' alt' : ''}`, text: h, title: huaAlts['化' + h] || null });
  return el('div', { class: 'ziwei-wrap' }, el('div', { class: `ziwei-grid${compact ? ' compact' : ''}` },
    (p.palaces || []).map((pl) => renderPalace(pl, p.life_branch, chart, { compact })),
    el('div', { class: 'ziwei-center' },
      el('div', { class: 'who', text: (chart.birth && chart.birth.name) || '命主' }),
      row(['農曆', lunar.year_gz ? `${lunar.year_gz}年${lunar.is_leap ? '閏' : ''}${lunar.raw_month ?? lunar.month}月${lunar.day}日${p.hour_branch ? ' ' + p.hour_branch + '時' : ''}` : null, 'ziwei.lunar']),
      row(['五行局', p.five_class, 'ziwei.five_class'], ['虛歲', p.age]),
      row(['命主', p.soul_star, 'ziwei.soul_star'], ['身主', p.body_star, 'ziwei.body_star']),
      row(['命宮', p.life_branch, 'ziwei.life_palace'], ['身宮', bodyPalace ? `${bodyPalace.name}（${p.body_branch}）` : p.body_branch, 'ziwei.body_palace']),
      cur && row(['目前大限', cur.value, 'ziwei.daxian.current']),
      el('div', { class: 'hint' }, huaTag('祿'), ' ', huaTag('權'), ' ', huaTag('科'), ' ', huaTag('忌'), ' 生年四化', schoolMark(chart, ['ziwei.hua.化祿', 'ziwei.hua.化權', 'ziwei.hua.化科', 'ziwei.hua.化忌']), '・', el('span', { class: 'lucky', text: '吉星' }), '・', el('span', { class: 'unlucky', text: '煞星' })),
      renderPatterns(p.enrich),
    ),
  ));
}

function renderZiwei(chart) {
  const p = chart.payload || {};
  const thisYear = chart.cast_at ? Number(String(chart.cast_at).slice(0, 4)) : null;
  return el('div', { class: 'card' },
    el('h3', {}, '紫微斗數命盤', schoolTitle(chart.school)),
    el('p', { class: 'subject', text: chart.subject }),
    renderZiweiGrid(chart),
    el('p', { class: 'scroll-hint', text: '命盤可左右滑動' }),
    warningsBlock(chart.warnings),
    renderLuckPanel(p.luck, { year: thisYear }),
    ('luck' in p && p.luck == null) && el('p', { class: 'hint', text: '大限 → 流年：需要性別才能定大限方向，請在出生資料填性別。' }),
  );
}

// ------------------------------------------------------------------ 姓名學
const XM_LUCK_CLASS = { 吉: 'ji', 半吉: 'banji', 凶: 'xiong' };
const XM_BAZI_CLASS = { 喜用: 'fav', 忌: 'avoid', 閒: 'idle' };

/** 姓名學盤面：每個字的筆畫 → 五格 → 三才與三運 → 八字配合；筆畫怎麼算的可展開。bare：報告用，不帶標題列 */
function renderXingming(chart, { bare = false } = {}) {
  const p = chart.payload || {};
  const fact = (id) => (chart.facts || []).find((f) => f.id === id) || {};
  const chars = el('div', { class: 'xm-chars' }, (p.chars || []).map((c, i) => el('div', { class: `xm-char ${c.role === '姓' ? 'sur' : ''}`, title: c.how },
    el('span', { class: 'xm-glyph', text: c.char }),
    el('span', { class: 'xm-role', text: c.role }),
    el('span', { class: 'xm-strokes' }, `${c.strokes} 畫`, schoolMark(chart, `xingming.char.${i + 1}`)))));
  const grids = el('div', { class: 'xm-grids' }, (p.grids || []).map((g) => el('div', { class: `xm-grid g-${g.id}`, title: g.formula },
    el('b', {}, g.name, schoolMark(chart, `xingming.ge.${g.id}`)),
    el('span', { class: 'xm-num', text: g.shuli !== g.number ? `${g.number}→${g.shuli}` : String(g.number) }),
    el('span', { class: 'xm-elem', text: `${g.element}・${g.yinyang}` }),
    el('span', {},
      el('span', { class: `xm-luck ${XM_LUCK_CLASS[g.luck] || ''}`, text: g.luck }),
      g.bazi && el('span', { class: `xm-bazi ${XM_BAZI_CLASS[g.bazi] || ''}`, text: g.bazi, title: '這一格的五行對八字喜用' })),
    el('small', { class: 'xm-role-note', text: (g.role || '').split('：')[0] }))));
  const rel = p.relations || {};
  const kv = (label, value, factId) => el('div', {}, el('b', { text: label }, factId && schoolMark(chart, factId)), el('span', { text: value ?? '—' }));
  const bz = p.bazi || {};
  const how = el('details', { class: 'xm-how', open: bare },
    el('summary', { text: '筆畫與五格怎麼算的' }),
    el('ul', {},
      (p.chars || []).map((c) => el('li', {}, el('b', { text: `${c.char}（${c.role}）${c.strokes} 畫` }), '：', c.how)),
      (p.grids || []).map((g) => el('li', {}, el('b', { text: `${g.name} ${g.number}` }), '：', g.formula, '；', g.role))),
    p.split_note && el('p', { class: 'hint', text: p.split_note }),
    el('p', { class: 'hint', text: fact('xingming.ge.ren').how || '' }));
  return el('div', { class: 'card xingming' },
    !bare && el('h3', {}, '姓名學', schoolTitle(chart.school)),
    !bare && el('p', { class: 'subject', text: chart.subject }),
    warningsBlock(chart.warnings),
    chars,
    grids,
    el('div', { class: 'kv' },
      kv('三才', p.sancai ? `${p.sancai}（天・人・地）` : null, 'xingming.sancai'),
      ['成功運', '基礎運', '社交運'].map((k, i) => rel[k] && kv(k, `${rel[k].kind}・${rel[k].text}`, `xingming.yun.${['success', 'base', 'social'][i]}`)),
      kv('八字喜用', bz.favourable ? `${bz.favourable.join('、')}（忌 ${(bz.avoid || []).join('、') || '無'}）` : null, 'xingming.bazi.favourable'),
      kv('人格對八字', fact('xingming.bazi.link').value, 'xingming.bazi.link')),
    how);
}

// ------------------------------------------------------------------ 解讀查核（解讀、報告共用）
function renderChecks(checks) {
  if (!checks) return null;
  const names = { chart_check: '命盤對照', citation_check: '引用查核', boundary_check: '邊界查核', consistency_check: '一致性' };
  const entries = Object.entries(checks).filter(([k, v]) => k.endsWith('_check') && v && typeof v === 'object');
  const issues = entries.flatMap(([k, v]) => (v.issues || []).map((i) => ({ check: names[k] || k, ...i })));
  return el('div', { class: 'card' },
    el('div', { class: 'checks' },
      entries.map(([k, v]) => el('span', { class: `check ${v.ok ? 'ok' : 'bad'}`, text: `${v.ok ? '✓' : '✗'} ${names[k] || k}` })),
      el('span', { class: 'check-summary', text: checks.summary || (checks.passed ? '全部通過' : '有未通過項目') })),
    issues.length > 0 && el('ul', { class: 'issues' }, issues.map((i) => el('li', {},
      el('code', { text: i.check }), i.section ? `　段落「${i.section}」` : '', i.sentence ? `　句子：「${i.sentence}」` : '', i.rule ? `　規則：${i.rule}` : '',
      (!i.section && !i.sentence && !i.rule) ? '　' + JSON.stringify(i) : ''))));
}
