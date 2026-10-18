/* 命運市集・前端。純原生 JS，無框架、無 build。
 * 結構：API 路徑 → 狀態 → DOM 小工具 → 呼叫層（含 mock）→ 表單 → 排盤流程 → 解讀 → 合盤 → 對話 → 初始化。
 * 純渲染函式（el、四柱、八字詳細盤面、紫微盤面、大限→流年、查核）在 render.js，report.html 也用。
 * 原則：畫面上所有命盤內容都從後端回傳的資料渲染，這裡不寫死任何命理內容。 */
'use strict';

// ------------------------------------------------------------------ API 路徑（集中管理）
const API = {
  health: '/api/health',
  cast: '/api/cast',
  castAll: '/api/cast/all',
  reading: '/api/reading',
  readingStream: '/api/reading/stream',
  synastry: '/api/synastry',
  chat: '/api/chat',
  cards: '/api/cards',
  card: (id) => `/api/cards/${encodeURIComponent(id)}`,
  persona: '/api/persona',
  consistency: '/api/consistency',
  usage: '/api/usage',
  schools: '/api/schools',
  llmBackends: '/api/llm/backends',
  llmModels: '/api/llm/models',
  geo: '/api/geo',
  cities: '/api/cities',
};

// 流派開關的中文名（選項文字來自 /api/schools 的 schema；這裡只翻開關本身的名字，沒對到就顯示 key）
const SWITCH_LABELS = {
  bazi: { year_boundary: '年柱換年', month_stem_follows: '月干依據', late_zi: '晚子時', true_solar_time: '真太陽時', minggong_month: '命宮生月', yangren_yin_stems: '陰干羊刃', xusui_boundary: '虛歲', chenggu_year: '稱骨年', strength_method: '旺衰' },
  ziwei: { leap_month: '閏月', sihua_variant: '四化', hour_source: '時支', late_zi: '晚子時', tianma_basis: '天馬' },
  xingming: { stroke_basis: '筆畫', numeral_strokes: '數字字', jiashu: '假數' },
};
const SCHOOL_STORE_KEY = 'bof.school';
const LLM_STORE_KEY = 'bof.llm';
// 思考深度的中文（清單本身來自 /api/llm/backends 的 thinking）
const THINKING_LABELS = { default: '預設（依供應商）', off: '關（最便宜、最快）', low: '低', high: '高' };

// 出生地：文字欄＋ datalist（城市表來自 /api/cities）；輸入後打 /api/geo 自動補經度與時區（含台灣日光節約時間）
const MOCK = Boolean(window.MOCK_DATA);          // index.html?mock=1 時為 true
const HTML2CANVAS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';

// ------------------------------------------------------------------ 狀態
const state = {
  charts: { bazi: null, ziwei: null, xingming: null },   // 目前（第一個人）的命盤；姓名學只在填了姓名時有
  xingmingError: null,                   // 姓名學排不出來的原因（非中文、查不到筆畫）
  candidates: null,                      // 紫微缺時辰時的十二時辰候選
  chartSystem: 'bazi',                   // 排盤分頁目前顯示的系統
  readingSystem: 'bazi',
  reading: null,
  consistency: null,                     // 同盤問三次的報告
  synastry: null,
  chat: { sessionId: null },
  persona: null,
  cardCache: new Map(),
  // 流派：meta 是 /api/schools 的回應；name 是選中的流派；overrides 只放使用者改過（與該流派預設不同）的開關；
  // known 是從排盤回傳 chart.school.settings 學到的各流派設定（/api/schools 不給每派的值）
  school: { meta: null, name: 'default', overrides: { bazi: {}, ziwei: {} }, known: {} },
  // AI 設定（自帶金鑰）：mode 'site' 用站台的 AI；'byok' 用使用者自己的金鑰（每次請求帶 llm:{…}，伺服器不保存）
  // backends／thinkingOpts 是 /api/llm/backends 的回應；models／served／label 是驗證（/api/llm/models）後學到的
  llm: { mode: 'site', backend: '', api_key: '', model: '', base_url: '', thinking: 'default', remember: true, backends: [], thinkingOpts: [], models: [], served: '', label: '', verified: false },
  health: null,                          // /api/health 的回應（狀態列用；自帶模式時改顯示自帶）
  healthError: null,
};

// ------------------------------------------------------------------ DOM 小工具
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));


/** 極簡 Markdown（知識卡用）：## 標題、- 條列、段落 */
function md(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  const out = [];
  let list = null;
  const flush = () => { if (list) { out.push(`<ul>${list.join('')}</ul>`); list = null; } };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { flush(); out.push(`<h3>${esc(h[2])}</h3>`); continue; }
    const li = line.match(/^[-*]\s+(.*)$/);
    if (li) { (list ??= []).push(`<li>${esc(li[1])}</li>`); continue; }
    flush(); out.push(`<p>${esc(line)}</p>`);
  }
  flush();
  return out.join('');
}

/** 頂部提示列：kind = info | error | ok */
function notice(message, kind = 'info') {
  const box = $('#notice');
  if (!message) { box.hidden = true; return; }
  box.className = `notice ${kind}`;
  box.textContent = message;
  box.hidden = false;
}

function switchTab(name) {
  $$('.tab').forEach((t) => { const on = t.dataset.tab === name; t.classList.toggle('active', on); t.setAttribute('aria-selected', on); });
  $$('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === `tab-${name}`));
}

function setBusy(btn, busy, label) {
  btn.disabled = busy;
  if (busy && label) { btn.dataset.label ??= btn.textContent; btn.textContent = label; }
  else if (!busy && btn.dataset.label) btn.textContent = btn.dataset.label;
}

/** 費用／token 顯示（9-1）：$0.0060、$0；5,190 */
const fmtUsd = (n) => { const v = Number(n); if (!Number.isFinite(v) || v <= 0) return '$0'; return v < 0.01 ? `$${v.toFixed(4)}` : `$${v.toFixed(v < 1 ? 3 : 2)}`; };
const fmtTok = (n) => Number(n || 0).toLocaleString('en-US');
/** 解讀的費用列：離線示範・$0 ／ deepseek-flash・$0.0060・in 5,190 / out 1,820 tok */
function costLine(r) {
  if (!r || !r.backend) return '';
  if (r.backend === 'mock') return '離線示範・$0';
  const u = r.usage || {};
  const parts = [r.model || r.backend, fmtUsd(r.cost_usd)];
  if (u.input_tokens != null || u.output_tokens != null) parts.push(`in ${fmtTok(u.input_tokens)} / out ${fmtTok(u.output_tokens)} tok${u.cache_read_tokens ? `（快取 ${fmtTok(u.cache_read_tokens)}）` : ''}`);
  if (r.byok === true) parts.unshift('🔑 自付');       // 自帶金鑰：費用由使用者的金鑰支付，不計入本站預算
  return parts.join('・');
}

/** 小視窗（今日用量等）：沿用 index.html 的 #card-dialog */
function openDialog(...children) {
  const dlg = $('#card-dialog');
  if (!dlg) return;
  clear($('#card-dialog-body')).append(...children.flat().filter(Boolean));
  if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
}

// ------------------------------------------------------------------ 呼叫層
class ApiError extends Error {
  constructor(status, body) {
    super((body && body.message) || `HTTP ${status}`);
    this.status = status;
    this.code = body && body.error;
    this.data = body || {};
  }
}

/** JSON 請求；非 2xx 丟 ApiError（body 依契約為 {error, message, ...}） */
async function request(path, { method = 'GET', body } = {}) {
  if (MOCK) return mockRequest(path, body);
  let res;
  try {
    res = await fetch(path, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
  } catch (e) {
    throw new ApiError(0, { error: 'network', message: '連不上後端，請確認服務是否啟動。' });
  }
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { error: 'bad_json', message: text.slice(0, 200) }; }
  if (!res.ok) throw new ApiError(res.status, json);
  return json;
}

/** 把 API 錯誤翻成使用者看得懂的訊息；需要時辰的 422 交給呼叫端處理 */
function explainError(err) {
  if (!(err instanceof ApiError)) return err.message || String(err);
  if (err.status === 429) return '今日次數已達上限，明天再來吧。';
  if (err.status === 503) return '命理師暫時休息中，請稍後再試。';
  if (err.status === 400 && err.code === 'refused') return err.data.reply || err.message;
  if (err.status === 422 && err.code === 'needs_birth_time') return '紫微斗數需要出生時辰。';
  if (err.status === 422 && (err.code === 'needs_full_name' || err.code === 'bad_name')) { $('#birth-panel').open = true; return err.code === 'needs_full_name' ? '姓名學需要完整姓名，請在出生資料填「姓名」。' : err.message; }
  if (err.status === 400 && err.code === 'bad_school') { const p = $('#school-panel'); if (p) p.open = true; return err.message || '流派設定有誤。'; }
  if (err.status === 400 && err.code === 'bad_llm') { const msg = err.message || 'AI 設定有誤。'; llmShowError(msg); return msg; }
  return err.message;
}

/** mock 模式：依路徑回假資料，模擬網路延遲 */
async function mockRequest(path, body) {
  const M = window.MOCK_DATA;
  await new Promise((r) => setTimeout(r, 250));
  const birthHasTime = (b) => Boolean(b && b.birth_time);
  // 把請求帶的 school／overrides 反映到回傳的 chart.school（mock-data.js 的 schoolFor 會算；沒有就原樣）
  const withSchool = (chart) => {
    if (!chart || typeof M.schoolFor !== 'function') return chart;
    const info = M.schoolFor(body || {});
    if (info && info.error) throw new ApiError(400, { error: 'bad_school', message: info.error });
    return info ? { ...chart, school: info } : chart;
  };
  if (path === API.persona) return M.persona;
  if (path === API.health) return M.health;
  if (path === API.schools) { if (!M.schools) throw new ApiError(404, { error: 'not_found', message: 'mock 沒有 schools' }); return M.schools; }
  if (path === API.llmBackends) { if (!M.llm_backends) throw new ApiError(404, { error: 'not_found', message: 'mock 沒有 llm_backends' }); return M.llm_backends; }
  if (path === API.cities) { if (!Array.isArray(M.cities)) throw new ApiError(404, { error: 'not_found', message: 'mock 沒有 cities' }); return M.cities; }
  if (path.startsWith(API.geo + '?')) {
    const q = new URLSearchParams(path.slice(API.geo.length + 1));
    if (typeof M.geoLookup !== 'function') throw new ApiError(404, { error: 'not_found', message: 'mock 沒有 geo' });
    return M.geoLookup(q.get('place') || '', q.get('date') || '');
  }
  if (path === API.llmModels) {
    const b = body || {};
    const entry = ((M.llm_backends || {}).backends || []).find((x) => x.name === b.backend);
    if (!entry) throw new ApiError(400, { error: 'bad_llm', message: `不支援的供應商：${b.backend || '（空白）'}` });
    if (entry.needs_key && !b.api_key) throw new ApiError(400, { error: 'bad_llm', message: `${entry.label} 需要金鑰` });
    if (b.api_key === 'bad') return { ok: false, backend: b.backend, label: entry.label, model: b.model || entry.default_model, models: [], served: '', error: '401 invalid key' };
    const base = M.llm_models || {};
    const models = (base.backend === b.backend && Array.isArray(base.models) && base.models.length) ? base.models : [{ id: entry.default_model, name: entry.default_model }];
    const model = b.model || entry.default_model;
    return { ...base, ok: true, backend: b.backend, label: entry.label, model, models, served: models.some((m) => m.id === model) ? model : models[0].id, error: '' };
  }
  // 自帶金鑰：解讀／對話回傳標上 byok，backend／model 照請求的 llm 回
  const withByok = (r) => (body && body.llm) ? { ...r, byok: true, backend: body.llm.backend, model: body.llm.model || r.model } : r;
  // 姓名學：有填姓名才有盤（mock 只有一份：陳美玲）
  const hasName = Boolean(body && body.birth && body.birth.full_name && M.xingming);
  const needsName = () => { if (body.system === 'xingming' && !hasName) throw new ApiError(422, { error: 'needs_full_name', message: '姓名學需要完整姓名' }); };
  if (path === API.castAll) {
    const hasTime = birthHasTime(body.birth);
    return { bazi: withSchool(M.bazi), ziwei: hasTime ? withSchool(M.ziwei) : null, ziwei_candidates: hasTime ? null : M.ziwei_candidates,
      xingming: hasName ? withSchool(M.xingming) : null, xingming_error: null };
  }
  if (path === API.cast) {
    if (body.system === 'ziwei' && !birthHasTime(body.birth)) throw new ApiError(422, { error: 'needs_birth_time', message: '紫微斗數需要出生時辰', candidates: M.ziwei_candidates });
    needsName();
    return withSchool({ ziwei: M.ziwei, xingming: M.xingming }[body.system] || M.bazi);
  }
  if (path === API.reading) {
    if (body.system === 'ziwei' && !birthHasTime(body.birth)) throw new ApiError(422, { error: 'needs_birth_time', message: '紫微斗數需要出生時辰', candidates: M.ziwei_candidates });
    needsName();
    return withByok({ ziwei: M.reading_ziwei, xingming: M.reading_xingming }[body.system] || M.reading_bazi);
  }
  if (path === API.synastry) {
    const s = M.synastry;
    return { ...s, a: withSchool(s.a), b: withSchool(s.b), a_ziwei: withSchool(s.a_ziwei), b_ziwei: withSchool(s.b_ziwei) };
  }
  if (path === API.consistency) {
    if (body.system === 'ziwei' && !birthHasTime(body.birth)) throw new ApiError(422, { error: 'needs_birth_time', message: '紫微斗數需要出生時辰', candidates: M.ziwei_candidates });
    await new Promise((r) => setTimeout(r, 900));   // 假裝問了三次
    return M.consistency;
  }
  if (path === API.usage) return M.usage;
  if (path === API.chat) {
    const q = body.message || '';
    const r = M.chat.replies;
    if (/股票|投資|買房|病|藥|官司|訴訟|死/.test(q)) throw new ApiError(400, { error: 'refused', message: '越界問題', reply: r.refuse.reply });
    const pick = /流年|明年|今年|20\d\d/.test(q) ? r.recast : /是什麼|什麼是|意思|解釋/.test(q) ? r.lookup : r.answer;
    return withByok({ session_id: M.chat.session_id, chart_summary: M.chat.chart_summary, ...pick });
  }
  if (path.startsWith(API.cards + '/')) {
    const id = decodeURIComponent(path.slice(API.cards.length + 1));
    if (M.cards[id]) return M.cards[id];
    throw new ApiError(404, { error: 'not_found', message: `找不到知識卡 ${id}` });
  }
  if (path === API.cards) return Object.values(M.cards);
  throw new ApiError(404, { error: 'not_found', message: `mock 沒有 ${path}` });
}

/** 解析 SSE：fetch + ReadableStream，逐個 event 回呼 */
async function readSSE(response, onEvent) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const dispatch = (block) => {
    let event = 'message';
    const data = [];
    for (const line of block.split(/\r?\n/)) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''));
    }
    if (data.length) onEvent(event, data.join('\n'));
  };
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.search(/\r?\n\r?\n/)) >= 0) {
      const block = buffer.slice(0, idx);
      buffer = buffer.slice(idx).replace(/^\r?\n\r?\n/, '');
      if (block.trim()) dispatch(block);
    }
  }
  if (buffer.trim()) dispatch(buffer);
}

/** 串流解讀：delta 逐段回呼，done 回傳完整 Reading。失敗則丟錯，由呼叫端退回非串流端點。 */
async function streamReading(body, onDelta) {
  if (MOCK) {
    const reading = await mockRequest(API.reading, body);
    for (const sec of reading.sections) {
      for (const ch of `【${sec.title}】${sec.text}\n`) { onDelta(ch); await new Promise((r) => setTimeout(r, 8)); }
    }
    return reading;
  }
  const res = await fetch(API.readingStream, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' }, body: JSON.stringify(body) });
  if (!res.ok) {
    let json = null; try { json = await res.json(); } catch { /* 非 JSON */ }
    throw new ApiError(res.status, json);
  }
  if (!res.body || !/text\/event-stream/.test(res.headers.get('content-type') || '')) throw new Error('SSE 不可用');
  let result = null;
  let streamError = null;
  await readSSE(res, (event, data) => {
    if (event === 'delta') { try { onDelta(JSON.parse(data).text || ''); } catch { onDelta(data); } }
    else if (event === 'done') { result = JSON.parse(data); }
    else if (event === 'error') { let j = null; try { j = JSON.parse(data); } catch { j = { message: data }; } streamError = new ApiError(j.status || 500, j); }
  });
  if (streamError) throw streamError;
  if (!result) throw new Error('串流未收到 done');
  return result;
}

/** 知識卡（有快取） */
async function fetchCard(id) {
  if (state.cardCache.has(id)) return state.cardCache.get(id);
  const p = request(API.card(id)).catch((e) => ({ id, error: explainError(e) }));
  state.cardCache.set(id, p);
  return p;
}

// ------------------------------------------------------------------ 出生資料表單
/** 城市表 → <datalist>：每城一個 name 選項，別名各一個（value 別名、label 顯示名） */
async function loadCities() {
  const list = $('#city-list');
  if (!list) return;
  try {
    const cities = await request(API.cities);
    if (!Array.isArray(cities)) return;
    const opts = [];
    for (const c of cities) {
      if (!c || !c.name) continue;
      const label = `${c.name}${c.longitude != null ? '　經度 ' + c.longitude : ''}${c.tz != null ? '　UTC' + (c.tz >= 0 ? '+' : '') + c.tz : ''}`;
      opts.push(el('option', { value: c.name, label }));
      for (const a of (Array.isArray(c.aliases) ? c.aliases : [])) if (a && a !== c.name) opts.push(el('option', { value: a, label }));
    }
    clear(list).append(...opts);
  } catch { /* 舊後端沒有 /api/cities：欄位照樣可自填 */ }
}

/** 出生地 → /api/geo：自動填經度與時區，欄下顯示說明（DST 時淡金）；查不到就顯示 message、不改原值 */
async function geoLookup(form) {
  const input = form.elements.place;
  const note = $('.geo-note', form);
  const place = (input.value || '').trim();
  const setNote = (text, cls) => { if (!note) return; note.textContent = text || ''; note.className = `hint geo-note${cls ? ' ' + cls : ''}`; };
  if (!place) { setNote(''); return; }
  const date = form.elements.birth_date.value;
  setNote('查詢中…');
  const seq = (form._geoSeq = (form._geoSeq || 0) + 1);
  try {
    const g = await request(`${API.geo}?place=${encodeURIComponent(place)}${date ? '&date=' + encodeURIComponent(date) : ''}`);
    if (seq !== form._geoSeq) return;                 // 使用者又改了，丟掉舊結果
    if (!g || !g.name) { setNote((g && g.message) || `查不到「${place}」，請手動填經度與時區`, 'miss'); return; }
    if (g.longitude != null) form.elements.longitude.value = g.longitude;
    if (g.tz_offset_hours != null) form.elements.tz_offset_hours.value = g.tz_offset_hours;
    const tz = g.tz_offset_hours != null ? `UTC${g.tz_offset_hours >= 0 ? '+' : ''}${g.tz_offset_hours}` : '';
    setNote(g.note || `${g.name}${g.longitude != null ? '・經度 ' + g.longitude : ''}${tz ? '・' + tz : ''}`, g.dst ? 'dst' : 'ok');
    // 查到了就把焦點移開：datalist 的建議選單還開著時，下一次點「排盤」會先被拿去關選單
    if (document.activeElement === form.elements.place) form.elements.place.blur();
  } catch (e) {
    if (seq !== form._geoSeq) return;
    setNote('查不到出生地：' + explainError(e), 'miss');
  }
}

function setupPlaceField(form) {
  const input = form.elements.place;
  if (!input) return;
  input.addEventListener('change', () => geoLookup(form));
  // 日期變了也重查：台灣日光節約時間依出生日而定
  form.elements.birth_date.addEventListener('change', () => { if ((input.value || '').trim()) geoLookup(form); });
}

/** 讀表單 → birth 物件（契約格式；空欄位不送）。place 照送；前端已填經度就以前端為準（後端只在缺經度時補） */
function readBirth(form) {
  const fd = new FormData(form);
  const birth = { birth_date: fd.get('birth_date'), tz_offset_hours: Number(fd.get('tz_offset_hours') || 8), use_true_solar_time: true };
  if (!birth.birth_date) throw new Error('請填出生日期。');
  const name = (fd.get('name') || '').trim();
  if (name) birth.name = name;
  const fullName = (fd.get('full_name') || '').trim();
  if (fullName) birth.full_name = fullName;
  const t = fd.get('birth_time');
  if (t) birth.birth_time = t.slice(0, 5);
  if (fd.get('gender')) birth.gender = fd.get('gender');
  const place = (fd.get('place') || '').trim();
  if (place) birth.place = place;
  const lng = fd.get('longitude');
  if (lng !== '' && lng != null && Number.isFinite(Number(lng))) birth.longitude = Number(lng);
  return birth;
}

/** 開新分頁：一頁式報告（report.html），帶目前表單與流派 */
function openReport(form) {
  let birth;
  try { birth = readBirth(form); } catch (e) { notice(e.message, 'error'); $('#birth-panel').open = true; return; }
  const q = new URLSearchParams();
  const fields = { name: birth.name, full_name: birth.full_name, birth_date: birth.birth_date, birth_time: birth.birth_time, gender: birth.gender, place: birth.place, longitude: birth.longitude, tz: birth.tz_offset_hours };
  for (const [k, v] of Object.entries(fields)) if (v != null && v !== '') q.set(k, String(v));
  const sp = schoolPayload();
  if (sp.school) q.set('school', sp.school);
  if (sp.overrides) q.set('overrides', JSON.stringify(sp.overrides));
  if (MOCK) q.set('mock', '1');
  window.open(`report.html?${q.toString()}`, '_blank', 'noopener');
}

function describeBirth(b) {
  return `${b.name || '命主'}・${b.birth_date}${b.birth_time ? ' ' + b.birth_time : '（時辰不明）'}${b.place ? '・' + b.place : ''}`;
}

/** 記住第一個人的表單（純方便，失敗就算了） */
function rememberForm(form, key) {
  try { localStorage.setItem(key, JSON.stringify(Object.fromEntries(new FormData(form)))); } catch { /* 忽略 */ }
}
function restoreForm(form, key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (!saved) return;
    for (const [k, v] of Object.entries(saved)) { const f = form.elements[k]; if (f && v !== 'custom') f.value = v; }   // 舊版把「自填經度」存成 custom
  } catch { /* 忽略 */ }
}

// ------------------------------------------------------------------ 流派面板（進階）
/** schema（/api/schools）的兩組開關；沒載到就空物件，面板什麼都不畫 */
const schoolSchema = () => (state.school.meta && state.school.meta.schema) || {};
const schoolList = () => (state.school.meta && Array.isArray(state.school.meta.schools)) ? state.school.meta.schools : [];
const schoolEntry = (name) => schoolList().find((s) => s && s.name === name) || null;

/** 某流派的開關預設值：先用排盤回傳學到的設定（known），沒有就用 schema 的 default */
function schoolBase(name) {
  const schema = schoolSchema();
  const known = state.school.known[name] || {};
  const out = {};
  for (const sys of Object.keys(schema)) {
    out[sys] = {};
    for (const [key, sw] of Object.entries(schema[sys] || {})) {
      const k = known[sys] && known[sys][key];
      out[sys][key] = (k != null && sw && sw.options && k in sw.options) ? k : (sw && sw.default);
    }
  }
  return out;
}

/** 目前的開關值（流派預設 + 使用者覆寫） */
function schoolEffective() {
  const base = schoolBase(state.school.name);
  for (const sys of Object.keys(base)) Object.assign(base[sys], state.school.overrides[sys] || {});
  return base;
}

/** 所有 POST 共用：{school, overrides?}；overrides 只放使用者改過的開關 */
function schoolPayload() {
  const out = {};
  if (state.school.name) out.school = state.school.name;
  const ov = {};
  for (const [sys, map] of Object.entries(state.school.overrides || {})) if (map && Object.keys(map).length) ov[sys] = { ...map };
  if (Object.keys(ov).length) out.overrides = ov;
  return out;
}
const schoolOverrideCount = () => Object.values(state.school.overrides || {}).reduce((n, m) => n + Object.keys(m || {}).length, 0);

/** 畫面上要顯示的「目前選的流派」：{title, summary}（還沒排盤時用 /api/schools 的資料拼） */
function schoolCurrentInfo() {
  const s = schoolEntry(state.school.name) || { title: state.school.name || '課程預設' };
  const n = schoolOverrideCount();
  return { name: state.school.name, title: `${s.title || s.name}${n ? '（改 ' + n + ' 項）' : ''}`, summary: s.description || '' };
}

function saveSchoolPrefs() {
  try { localStorage.setItem(SCHOOL_STORE_KEY, JSON.stringify({ name: state.school.name, overrides: state.school.overrides, known: state.school.known })); } catch { /* 忽略 */ }
}
function loadSchoolPrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem(SCHOOL_STORE_KEY) || 'null');
    if (!saved || typeof saved !== 'object') return;
    if (typeof saved.name === 'string') state.school.name = saved.name;
    if (saved.overrides && typeof saved.overrides === 'object') state.school.overrides = { bazi: {}, ziwei: {}, ...saved.overrides };
    if (saved.known && typeof saved.known === 'object') state.school.known = saved.known;
  } catch { /* 忽略 */ }
}

/** 流派或開關變了：命盤會不同 → 對話 session 作廢；提示重新排盤 */
function schoolChanged() {
  state.chat.sessionId = null;
  saveSchoolPrefs();
  renderSchoolBrief();
  const stale = $('#school-stale');
  if (stale) stale.hidden = !(state.charts.bazi || state.charts.ziwei || state.charts.xingming);
  const reset = $('#school-reset');
  if (reset) reset.disabled = schoolOverrideCount() === 0;
  const panel = $('#school-panel');
  if (panel) panel.classList.toggle('customised', schoolOverrideCount() > 0 || state.school.name !== ((state.school.meta && state.school.meta.default) || 'default'));
}

function renderSchoolBrief() {
  const brief = $('#school-brief');
  if (!brief) return;
  const info = schoolCurrentInfo();
  brief.textContent = state.school.meta ? info.title : '';
  const entry = schoolEntry(state.school.name) || {};
  const desc = $('#school-desc'); const src = $('#school-source');
  if (desc) desc.textContent = entry.description || '';
  if (src) src.textContent = entry.source ? `出處：${entry.source}` : '';
}

/** 兩組開關（八字／紫微）：每個開關一個 select，選項文字用 schema.options；與流派預設不同的標成 changed */
function renderSchoolSwitches() {
  const box = $('#school-groups');
  if (!box) return;
  clear(box);
  const schema = schoolSchema();
  const base = schoolBase(state.school.name);
  const titles = { bazi: '八字', ziwei: '紫微', xingming: '姓名學' };
  for (const sys of Object.keys(schema)) {
    const fields = Object.entries(schema[sys] || {}).filter(([, sw]) => sw && sw.options && typeof sw.options === 'object');
    if (!fields.length) continue;
    box.append(el('fieldset', { class: 'school-group' },
      el('legend', { text: titles[sys] || sys }),
      el('div', { class: 'school-grid' }, fields.map(([key, sw]) => {
        const ov = (state.school.overrides[sys] || {})[key];
        const cur = ov != null ? ov : base[sys][key];
        const sel = el('select', { dataset: { sys, key }, 'aria-label': `${titles[sys] || sys}・${(SWITCH_LABELS[sys] || {})[key] || key}` },
          Object.entries(sw.options).map(([val, label]) => el('option', { value: val, text: String(label) })));
        if (cur != null && cur in sw.options) sel.value = cur;
        sel.classList.toggle('changed', ov != null && ov !== base[sys][key]);
        sel.addEventListener('change', () => {
          const b = schoolBase(state.school.name)[sys][key];
          state.school.overrides[sys] ??= {};
          if (sel.value === b) delete state.school.overrides[sys][key]; else state.school.overrides[sys][key] = sel.value;
          sel.classList.toggle('changed', sel.value !== b);
          schoolChanged();
        });
        return el('label', { class: 'school-switch' },
          el('span', { class: 'sw-name', text: (SWITCH_LABELS[sys] || {})[key] || key, title: `${sys}.${key}` }), sel);
      }))));
  }
  const reset = $('#school-reset');
  if (reset) reset.disabled = schoolOverrideCount() === 0;
}

/** 排盤回傳的 chart.school.settings：沒被覆寫的開關就是該流派的真實預設，記起來（known） */
function learnSchool(chart) {
  const sc = chart && chart.school;
  if (!sc || !sc.settings || typeof sc.settings !== 'object') return;
  const name = String(sc.name || '').replace(/\+custom$/, '');
  if (!name || name !== state.school.name) return;
  const known = state.school.known[name] = state.school.known[name] || {};
  let changed = false;
  for (const [sys, map] of Object.entries(sc.settings)) {
    if (!map || typeof map !== 'object') continue;
    known[sys] = known[sys] || {};
    for (const [key, val] of Object.entries(map)) {
      if ((state.school.overrides[sys] || {})[key] != null) continue;   // 使用者改過的看不出流派預設
      if (known[sys][key] !== val) { known[sys][key] = val; changed = true; }
    }
  }
  if (changed) { saveSchoolPrefs(); renderSchoolSwitches(); }
}

function setupSchoolPanel() {
  const panel = $('#school-panel');
  const sel = $('#school-select');
  if (!panel || !sel) return;
  loadSchoolPrefs();
  const list = schoolList();
  const def = (state.school.meta && state.school.meta.default) || 'default';
  clear(sel).append(...list.map((s) => el('option', { value: s.name, text: s.title || s.name })));
  if (!list.length) { panel.hidden = true; return; }
  if (!schoolEntry(state.school.name)) { state.school.name = schoolEntry(def) ? def : list[0].name; state.school.overrides = { bazi: {}, ziwei: {} }; }
  sel.value = state.school.name;
  sel.addEventListener('change', () => {
    state.school.name = sel.value;
    state.school.overrides = { bazi: {}, ziwei: {} };
    renderSchoolSwitches();
    schoolChanged();
  });
  $('#school-reset').addEventListener('click', () => {
    state.school.overrides = { bazi: {}, ziwei: {} };
    renderSchoolSwitches();
    schoolChanged();
  });
  renderSchoolSwitches();
  renderSchoolBrief();
  if (schoolOverrideCount() || state.school.name !== def) panel.classList.add('customised');
}

async function loadSchools() {
  try {
    const meta = await request(API.schools);
    if (meta && Array.isArray(meta.schools)) state.school.meta = meta;
  } catch { /* 舊後端沒有 /api/schools：面板不顯示，請求也不帶流派 */ }
  if (!state.school.meta) { const p = $('#school-panel'); if (p) p.hidden = true; state.school.name = ''; return; }
  setupSchoolPanel();
}

// ------------------------------------------------------------------ AI 設定（自帶金鑰）
const llmBackendEntry = (name) => state.llm.backends.find((b) => b && b.name === (name ?? state.llm.backend)) || null;
/** 供應商短名：「Gemini（Google）」→「Gemini」 */
const llmShortLabel = (label) => String(label || '').replace(/[（(].*?[）)]/g, '').trim();
/** 自帶模式是否生效（面板有載到供應商清單且選了自帶） */
const llmActive = () => state.llm.mode === 'byok' && state.llm.backends.length > 0;
/** 自帶模式下金鑰是否齊全：需要金鑰的供應商要有金鑰；openai_compatible 不必 */
function llmReady() {
  const entry = llmBackendEntry();
  if (!entry) return false;
  return entry.needs_key === false || Boolean(state.llm.api_key);
}

/** 所有會叫 AI 的 POST 共用：自帶模式且金鑰齊全 → { llm: {backend, api_key, model, base_url, thinking} }；否則 {} */
function llmPayload() {
  if (!llmActive() || !llmReady()) return {};
  const entry = llmBackendEntry() || {};
  return { llm: {
    backend: state.llm.backend,
    api_key: state.llm.api_key || '',
    model: state.llm.model || entry.default_model || '',
    base_url: state.llm.backend === 'openai_compatible' ? (state.llm.base_url || entry.base_url || '') : '',
    thinking: state.llm.thinking || 'default',
  } };
}

/** 按解讀／對話前的守門：自帶模式但金鑰空白 → 不送請求，提示並展開面板 */
function llmGuard() {
  if (!llmActive() || llmReady()) return true;
  llmShowError('請先填金鑰並驗證。');
  notice('自帶金鑰模式：請先填金鑰並驗證。', 'error');
  const key = $('#llm-key'); if (key) key.focus();
  return false;
}

/** 面板內的紅字（400 bad_llm、金鑰空白等），同時展開面板 */
function llmShowError(message) {
  const panel = $('#llm-panel');
  const box = $('#llm-error');
  if (panel) { panel.hidden = false; panel.open = true; }
  if (box) { box.textContent = message || ''; box.hidden = !message; }
}

function saveLlmPrefs() {
  try {
    const s = state.llm;
    const out = { mode: s.mode, backend: s.backend, model: s.model, base_url: s.base_url, thinking: s.thinking, remember: s.remember, served: s.served, label: s.label, verified: s.verified };
    if (s.remember) out.api_key = s.api_key;             // 勾「記住」才存金鑰
    localStorage.setItem(LLM_STORE_KEY, JSON.stringify(out));
  } catch { /* 忽略 */ }
}
function loadLlmPrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem(LLM_STORE_KEY) || 'null');
    if (!saved || typeof saved !== 'object') return;
    const s = state.llm;
    if (saved.mode === 'byok' || saved.mode === 'site') s.mode = saved.mode;
    for (const k of ['backend', 'model', 'base_url', 'thinking', 'served', 'label']) if (typeof saved[k] === 'string') s[k] = saved[k];
    if (typeof saved.remember === 'boolean') s.remember = saved.remember;
    if (s.remember && typeof saved.api_key === 'string') s.api_key = saved.api_key;
    s.verified = saved.verified === true && Boolean(s.api_key || !((llmBackendEntry() || {}).needs_key));
  } catch { /* 忽略 */ }
}
function clearLlmPrefs() {
  try { localStorage.removeItem(LLM_STORE_KEY); } catch { /* 忽略 */ }
}

/** 面板 summary 右側的狀態：「站台預設」或「自帶：Gemini・gemini-2.5-pro」 */
function llmBriefText() {
  if (!llmActive()) return '站台預設';
  const entry = llmBackendEntry() || {};
  const model = state.llm.model || entry.default_model || '';
  return `自帶：${llmShortLabel(state.llm.label || entry.label || state.llm.backend)}${model ? '・' + model : ''}${llmReady() ? '' : '（未填金鑰）'}`;
}

/** 設定變了（模式／供應商／模型…）：對話 session 作廢、存檔、更新摘要與頁首狀態列 */
function llmChanged({ resetSession = true } = {}) {
  if (resetSession) state.chat.sessionId = null;
  saveLlmPrefs();
  const brief = $('#llm-brief'); if (brief) brief.textContent = llmBriefText();
  const panel = $('#llm-panel'); if (panel) panel.classList.toggle('customised', llmActive());
  renderAiStatus();
}

/** 模型 select：驗證後列出可用模型（id＋name＋context_window）；還沒驗證就只有目前選的／預設的那一個 */
function renderLlmModels() {
  const sel = $('#llm-model');
  if (!sel) return;
  const entry = llmBackendEntry() || {};
  const list = state.llm.models.length ? state.llm.models : [];
  const current = state.llm.model || entry.default_model || '';
  const opts = list.map((m) => ({ id: m.id, text: `${m.id}${m.name && m.name !== m.id ? '　' + m.name : ''}${m.context_window ? '　' + Number(m.context_window).toLocaleString('en-US') + ' ctx' : ''}` }));
  if (current && !opts.some((o) => o.id === current)) opts.unshift({ id: current, text: current });
  clear(sel).append(...opts.map((o) => el('option', { value: o.id, text: o.text })));
  if (current) sel.value = current;
  sel.disabled = opts.length === 0;
  const hint = $('#llm-model-hint');
  if (hint) hint.textContent = state.llm.verified && list.length ? `此金鑰可用 ${list.length} 個模型。` : '按「驗證並載入模型」後會列出此金鑰可用的模型。';
}

/** 驗證狀態文字：✓ 金鑰有效・實際服務 xxx／紅字錯誤 */
function renderLlmStatus(text, kind) {
  const box = $('#llm-status');
  if (!box) return;
  box.textContent = text || '';
  box.className = `llm-status${kind ? ' ' + kind : ''}`;
}

/** 依目前供應商調整欄位：base_url 只在 openai_compatible 顯示；不需金鑰的供應商把金鑰欄標成選填 */
function renderLlmFields() {
  const entry = llmBackendEntry() || {};
  const baseField = $('#llm-base-field');
  if (baseField) baseField.hidden = state.llm.backend !== 'openai_compatible';
  const base = $('#llm-base');
  if (base) { base.value = state.llm.base_url || ''; base.placeholder = entry.base_url || 'http://localhost:11434/v1'; }
  const key = $('#llm-key');
  if (key) { key.value = state.llm.api_key || ''; key.placeholder = entry.needs_key === false ? '（此供應商可留空）' : 'sk-…'; }
  const byok = $('#llm-byok'); if (byok) byok.hidden = state.llm.mode !== 'byok';
  renderLlmModels();
  if (state.llm.verified && state.llm.served) renderLlmStatus(`✓ 金鑰有效・實際服務 ${state.llm.served}`, 'ok');
  else renderLlmStatus('', '');
}

/** 驗證並載入模型：POST /api/llm/models */
async function verifyLlm() {
  const btn = $('#llm-verify');
  const entry = llmBackendEntry();
  if (!entry) { renderLlmStatus('請先選供應商。', 'error'); return; }
  if (entry.needs_key !== false && !state.llm.api_key) { renderLlmStatus('請先填金鑰。', 'error'); const k = $('#llm-key'); if (k) k.focus(); return; }
  const body = { backend: state.llm.backend, api_key: state.llm.api_key || '' };
  if (state.llm.model) body.model = state.llm.model;
  if (state.llm.backend === 'openai_compatible') body.base_url = state.llm.base_url || entry.base_url || '';
  setBusy(btn, true, '驗證中…');
  renderLlmStatus('連線中…', '');
  llmShowError('');
  try {
    const r = await request(API.llmModels, { method: 'POST', body });
    if (!r || r.ok !== true) {
      state.llm.verified = false; state.llm.served = '';
      renderLlmStatus(`✗ ${(r && r.error) || '驗證失敗'}`, 'error');
      llmChanged({ resetSession: false });
      return;
    }
    state.llm.models = Array.isArray(r.models) ? r.models.filter((m) => m && m.id) : [];
    state.llm.label = r.label || entry.label || '';
    state.llm.served = r.served || '';
    const pick = r.served || r.model || state.llm.model || entry.default_model || '';
    state.llm.model = pick;
    state.llm.verified = true;
    renderLlmModels();
    renderLlmStatus(`✓ 金鑰有效・實際服務 ${r.served || pick}`, 'ok');
    llmChanged();
  } catch (e) {
    state.llm.verified = false; state.llm.served = '';
    renderLlmStatus(`✗ ${explainError(e)}`, 'error');
    llmChanged({ resetSession: false });
  } finally {
    setBusy(btn, false);
  }
}

function setupLlmPanel() {
  const panel = $('#llm-panel');
  const backendSel = $('#llm-backend');
  if (!panel || !backendSel) return;
  const list = state.llm.backends;
  clear(backendSel).append(...list.map((b) => el('option', { value: b.name, text: b.label || b.name })));
  loadLlmPrefs();
  if (!llmBackendEntry()) { state.llm.backend = list[0].name; state.llm.model = ''; state.llm.models = []; state.llm.verified = false; state.llm.served = ''; }
  backendSel.value = state.llm.backend;
  const entry0 = llmBackendEntry() || {};
  if (!state.llm.model) state.llm.model = entry0.default_model || '';
  if (state.llm.backend === 'openai_compatible' && !state.llm.base_url) state.llm.base_url = entry0.base_url || '';
  // 思考深度
  const thinkSel = $('#llm-thinking');
  const thinkOpts = state.llm.thinkingOpts.length ? state.llm.thinkingOpts : ['default', 'off', 'low', 'high'];
  clear(thinkSel).append(...thinkOpts.map((t) => el('option', { value: t, text: THINKING_LABELS[t] || t })));
  if (!thinkOpts.includes(state.llm.thinking)) state.llm.thinking = thinkOpts[0];
  thinkSel.value = state.llm.thinking;
  // 模式
  $$('input[name=llm_mode]', panel).forEach((r) => {
    r.checked = r.value === state.llm.mode;
    r.addEventListener('change', () => {
      if (!r.checked) return;
      state.llm.mode = r.value;
      renderLlmFields();
      llmShowError('');
      llmChanged();
    });
  });
  // 供應商
  backendSel.addEventListener('change', () => {
    state.llm.backend = backendSel.value;
    const entry = llmBackendEntry() || {};
    state.llm.model = entry.default_model || '';
    state.llm.models = []; state.llm.verified = false; state.llm.served = ''; state.llm.label = entry.label || '';
    state.llm.base_url = state.llm.backend === 'openai_compatible' ? (entry.base_url || '') : '';
    renderLlmFields();
    llmShowError('');
    llmChanged();
  });
  // 金鑰（輸入即記，不等驗證；改了金鑰就要重新驗證）
  const keyInput = $('#llm-key');
  keyInput.addEventListener('input', () => {
    state.llm.api_key = keyInput.value.trim();
    if (state.llm.verified) { state.llm.verified = false; state.llm.served = ''; renderLlmStatus('金鑰已更改，請重新驗證。', ''); }
    llmChanged({ resetSession: false });
  });
  $('#llm-key-toggle').addEventListener('click', (e) => {
    const show = keyInput.type === 'password';
    keyInput.type = show ? 'text' : 'password';
    e.currentTarget.textContent = show ? '隱藏' : '顯示';
    e.currentTarget.setAttribute('aria-label', show ? '隱藏金鑰' : '顯示金鑰');
  });
  const baseInput = $('#llm-base');
  baseInput.addEventListener('input', () => { state.llm.base_url = baseInput.value.trim(); if (state.llm.verified) { state.llm.verified = false; state.llm.served = ''; renderLlmStatus('端點已更改，請重新驗證。', ''); } llmChanged({ resetSession: false }); });
  thinkSel.addEventListener('change', () => { state.llm.thinking = thinkSel.value; llmChanged(); });
  $('#llm-model').addEventListener('change', (e) => { state.llm.model = e.target.value; llmChanged(); });
  $('#llm-verify').addEventListener('click', verifyLlm);
  // 記住／清除
  const remember = $('#llm-remember');
  remember.checked = state.llm.remember;
  remember.addEventListener('change', () => { state.llm.remember = remember.checked; saveLlmPrefs(); });
  $('#llm-clear').addEventListener('click', () => {
    clearLlmPrefs();
    Object.assign(state.llm, { mode: 'site', backend: list[0].name, api_key: '', model: list[0].default_model || '', base_url: list[0].name === 'openai_compatible' ? (list[0].base_url || '') : '', thinking: thinkOpts[0], remember: true, models: [], served: '', label: '', verified: false });
    backendSel.value = state.llm.backend; thinkSel.value = state.llm.thinking; remember.checked = true;
    if (keyInput.type !== 'password') $('#llm-key-toggle').click();
    $$('input[name=llm_mode]', panel).forEach((r) => { r.checked = r.value === 'site'; });
    renderLlmFields();
    llmShowError('');
    llmChanged();
    clearLlmPrefs();                                   // llmChanged 會存一份預設，清掉讓下次載入乾淨
    notice('已清除自帶金鑰設定，改用站台的 AI。', 'ok');
  });
  renderLlmFields();
  llmChanged({ resetSession: false });
}

async function loadLlmBackends() {
  try {
    const meta = await request(API.llmBackends);
    if (meta && Array.isArray(meta.backends) && meta.backends.length) {
      state.llm.backends = meta.backends.filter((b) => b && b.name);
      state.llm.thinkingOpts = Array.isArray(meta.thinking) ? meta.thinking.filter((t) => typeof t === 'string') : [];
    }
  } catch { /* 舊後端沒有 /api/llm/backends：面板不顯示，請求也不帶 llm */ }
  if (!state.llm.backends.length) { const p = $('#llm-panel'); if (p) p.hidden = true; state.llm.mode = 'site'; return; }
  setupLlmPanel();
}

/** 紫微缺時辰：列十二時辰候選，點選後回填時間並重排 */
function renderCandidates(cands) {
  return el('div', { class: 'card' },
    el('h3', { text: '紫微需要出生時辰' }),
    el('p', { class: 'hint', text: '不硬猜。下面是十二個時辰各自的命宮主星，請用你的個性對照；點一個就把時間填回去重新排盤。' }),
    el('div', { class: 'candidates' }, cands.map((c) => el('button', { type: 'button', class: 'candidate', onclick: () => pickCandidate(c) },
      el('div', {}, el('span', { class: 'hb', text: `${c.hour_branch}時` }), el('span', { class: 'clk', text: c.clock })),
      el('div', { class: 'stars', text: (c.life_major || []).join('、') }),
      el('div', { class: 'fc', text: `命宮${c.life_branch || ''}${c.five_class ? '・' + c.five_class : ''}` }),
    ))),
  );
}

function pickCandidate(c) {
  const start = (c.clock || '').split(/[–-]/)[0].trim();   // "23:00–01:00" → 23:00
  const hh = start.slice(0, 2);
  const form = $('#birth-form');
  form.elements.birth_time.value = `${hh}:30`;
  $('#birth-panel').open = true;
  form.requestSubmit();
}

// ------------------------------------------------------------------ 排盤：流程
function renderChartArea() {
  const area = clear($('#chart-area'));
  const sys = state.chartSystem;
  const chart = state.charts[sys];
  if (chart) area.append({ bazi: renderBazi, ziwei: renderZiwei, xingming: renderXingming }[sys](chart));
  else if (sys === 'ziwei' && state.candidates) area.append(renderCandidates(state.candidates));
  else if (sys === 'xingming' && state.charts.bazi) area.append(el('p', { class: 'empty', text: state.xingmingError ? `姓名學排不出來：${state.xingmingError}` : '在出生資料填「姓名」，再按「排盤」就會排姓名學。' }));
  else area.append(el('p', { class: 'empty', text: state.charts.bazi ? '尚無此系統的命盤。' : '填好出生資料後按「排盤」。' }));
  const has = Boolean(chart);
  $('#export-png').disabled = !has;
  $('#print-chart').disabled = !has;
}

async function castAll(birth) {
  const btn = $('#cast-btn');
  setBusy(btn, true, '排盤中…');
  notice('');
  try {
    const data = await request(API.castAll, { method: 'POST', body: { birth, ...schoolPayload() } });
    state.charts.bazi = data.bazi || null;
    state.charts.ziwei = data.ziwei || null;
    state.charts.xingming = data.xingming || null;
    state.xingmingError = data.xingming_error || null;
    state.candidates = data.ziwei ? null : (data.ziwei_candidates || null);
    state.chat.sessionId = null;                  // 換了出生資料，對話要重新開 session
    $('#birth-brief').textContent = describeBirth(birth);
    learnSchool(state.charts.bazi); learnSchool(state.charts.ziwei); learnSchool(state.charts.xingming);   // 回填這個流派的真實開關值
    const stale = $('#school-stale'); if (stale) stale.hidden = true;
    if (!data.ziwei && state.candidates) {
      state.chartSystem = 'ziwei';
      $$('#chart-system-seg .seg-btn').forEach((b) => b.classList.toggle('active', b.dataset.system === 'ziwei'));
      notice('已排好八字；紫微需要出生時辰，請在下方對照十二時辰的命宮主星。');
    } else {
      $('#birth-panel').open = false;
    }
    renderChartArea();
    switchTab('cast');
  } catch (e) {
    notice(explainError(e), 'error');
  } finally {
    setBusy(btn, false);
  }
}

/** 匯出 PNG：第一次點才載 html2canvas */
async function exportPng() {
  const btn = $('#export-png');
  setBusy(btn, true, '擷取中…');
  try {
    if (!window.html2canvas) {
      await new Promise((resolve, reject) => { const s = el('script', { src: HTML2CANVAS_URL, onload: resolve, onerror: () => reject(new Error('載入 html2canvas 失敗')) }); document.head.append(s); });
    }
    const target = $('#chart-area .card');
    const bg = getComputedStyle(document.body).backgroundColor;
    const canvas = await window.html2canvas(target, { backgroundColor: bg, scale: 2, useCORS: true });
    const a = el('a', { href: canvas.toDataURL('image/png'), download: `${state.chartSystem}-${(state.charts[state.chartSystem].birth || {}).birth_date || 'chart'}.png` });
    document.body.append(a); a.click(); a.remove();
  } catch (e) {
    notice('匯出失敗：' + e.message, 'error');
  } finally {
    setBusy(btn, false);
  }
}

// ------------------------------------------------------------------ 依據標籤（事實 / 知識卡）：解讀、合盤、對話共用

function factDetail(fact, who) {
  return el('div', { class: 'evidence-detail' },
    who && el('span', { class: 'meta', text: who + '・' }),
    el('b', { text: fact.label }), '：', fact.value,
    fact.note && el('div', { class: 'note', text: fact.note }),
    fact.how && el('div', { class: 'how' }, el('span', { class: 'how-label', text: '⚙ 怎麼算的' }), '：', fact.how),   // 6-1：查得到做到底
    hasItems(fact.alternatives) && el('div', { class: 'alts' },                                                        // 換一派會得到什麼
      el('div', { class: 'alts-head' }, el('span', { class: 'school-tag', text: '流派' }), '流派歧見'),
      el('ul', {}, fact.alternatives.map((a) => el('li', {}, el('span', { class: 'alt-label', text: a.label || a.option || a.switch || '' }), '：', el('span', { class: 'alt-value', text: String(a.value ?? '') }))))),
    el('div', { class: 'meta', text: fact.id }));
}

function cardDetail(card) {
  if (card.error) return el('div', { class: 'evidence-detail card-detail' }, el('b', { text: card.id }), '：', card.error);
  const skip = new Set(['id', 'name', 'type', 'system', 'keywords', 'source', 'body', 'content', 'text', 'markdown']);
  const body = card.body ?? card.content ?? card.text ?? card.markdown ?? '';
  return el('div', { class: 'evidence-detail card-detail' },
    el('b', { text: card.name || card.id }), card.type && el('span', { class: 'meta', text: `　${card.type}${card.system ? '・' + card.system : ''}` }),
    el('div', { class: 'md', html: md(body) }),
    Object.entries(card).filter(([k, v]) => !skip.has(k) && typeof v === 'string').map(([k, v]) => el('div', { class: 'md', html: `<h3>${esc(k)}</h3>${md(v)}` })),
    card.source && el('div', { class: 'meta', text: '出處：' + card.source }),
    el('div', { class: 'meta', text: card.id }));
}

/**
 * 依據列：evidence 為 [{key, label, who?, resolve: () => fact|null}]，cards 為 id 陣列。
 * 點標籤在下方展開／收起詳細內容。
 */
function evidenceBar(evidence, cards) {
  if ((!evidence || !evidence.length) && (!cards || !cards.length)) return null;
  const details = el('div', { class: 'evidence-details' });
  const bar = el('div', { class: 'evidence-bar' }, '依據：');
  const toggle = async (tag, key, build) => {
    const existing = details.querySelector(`[data-key="${CSS.escape(key)}"]`);
    if (existing) { existing.remove(); tag.classList.remove('open'); return; }
    const node = await build();
    if (!node) return;
    node.dataset.key = key;
    details.append(node);
    tag.classList.add('open');
  };
  for (const ev of evidence || []) {
    const fact = ev.resolve();
    const tag = el('button', { type: 'button', class: `tag fact${fact ? '' : ' missing'}`, title: fact ? `${fact.label}：${fact.value}` : '目前命盤找不到這條事實' },
      ev.who && el('span', { class: 'who', text: ev.who }), ev.label || ev.key);
    if (fact) tag.addEventListener('click', () => toggle(tag, ev.key, () => factDetail(fact, ev.who)));
    bar.append(tag);
  }
  for (const id of cards || []) {
    const tag = el('button', { type: 'button', class: 'tag card', text: id, title: '知識卡' });
    tag.addEventListener('click', () => toggle(tag, 'card:' + id, async () => cardDetail(await fetchCard(id))));
    bar.append(tag);
  }
  bar.append(details);
  return bar;
}


// ------------------------------------------------------------------ 解讀

function renderReading(reading) {
  const charts = [state.charts[reading.system], state.charts.bazi, state.charts.ziwei, state.charts.xingming];
  const area = clear($('#reading-area'));
  const cost = costLine(reading);
  // 流派：解讀本身帶 school 最準；沒有就用這張盤排盤時回傳的，再沒有就用送出時選的
  const school = reading.school || (reading.chart && reading.chart.school) || (state.charts[reading.system] || {}).school || reading._sentSchool;
  append(area,
    el('p', { class: 'subject reading-head' },
      el('span', { text: `${reading.persona ? reading.persona + '・' : ''}${reading.subject || ''}` }),
      schoolTitle(school),
      cost && el('span', { class: 'cost', text: cost, title: reading.usage && reading.usage.cache_read_tokens ? `快取讀取 ${fmtTok(reading.usage.cache_read_tokens)} tok` : null })),
    renderChecks(reading.checks),
    (reading.sections || []).map((s) => el('div', { class: `card section dir-${s.direction || '平'}` },
      el('h3', {}, s.title || s.key, el('span', { class: `dir dir-tag-${s.direction || '平'}`, text: s.direction || '—' })),
      el('p', { class: 'text', text: s.text }),
      evidenceBar((s.evidence || []).map((id) => ({ key: id, label: factLabel(id, charts), resolve: () => findFact(id, charts) })), s.cards))),
    reading.disclaimer && el('p', { class: 'disclaimer', text: reading.disclaimer }),
  );
  $('#print-reading').disabled = false;
}

async function requestReading(focus) {
  const btn = $('#reading-btn');
  const area = $('#reading-area');
  let birth;
  try { birth = readBirth($('#birth-form')); } catch (e) { notice(e.message, 'error'); return; }
  if (!llmGuard()) return;
  const body = { system: state.readingSystem, birth, ...schoolPayload(), ...llmPayload() };
  if (focus) body.focus = focus;
  const sentSchool = schoolCurrentInfo();
  setBusy(btn, true, '命理師思考中…');
  notice('');
  const box = el('div', { class: 'stream-box' });
  clear(area).append(el('div', { class: 'card' }, el('h3', { text: '命理師正在細看命盤…' }), box));
  const onDelta = (t) => { box.append(t); };
  try {
    let reading;
    try {
      reading = await streamReading(body, onDelta);
    } catch (e) {
      if (e instanceof ApiError && e.status >= 400) throw e;      // 後端明確拒絕，不重試
      box.append('\n（串流不可用，改用一般模式…）');
      reading = await request(API.reading, { method: 'POST', body });
    }
    if (reading && typeof reading === 'object' && !reading.school) reading._sentSchool = sentSchool;
    state.reading = reading;
    renderReading(reading);
  } catch (e) {
    clear(area).append(el('p', { class: 'empty', text: explainError(e) }));
    if (e instanceof ApiError && e.code === 'needs_birth_time') {
      state.candidates = e.data.candidates || state.candidates;
      if (state.candidates) { area.append(renderCandidates(state.candidates)); }
    } else {
      notice(explainError(e), 'error');
    }
  } finally {
    setBusy(btn, false);
  }
}

// ------------------------------------------------------------------ 一致性（6-5）：同一張盤問三次
const scoreClass = (s) => { const v = Number(s); return !Number.isFinite(v) ? '' : v >= 0.8 ? 'gold' : v >= 0.6 ? 'grey' : 'bad'; };
const fmtPct = (s) => Number.isFinite(Number(s)) ? Number(s).toFixed(2) : '—';

function renderConsistency(rep) {
  const area = clear($('#consistency-area'));
  const sections = Array.isArray(rep.sections) ? rep.sections : [];
  const runs = Number(rep.runs) || Math.max(1, ...sections.map((s) => (s.directions || []).length));
  const texts = Array.isArray(rep.texts) ? rep.texts : [];
  const ok = rep.ok === true;
  const card = el('div', { class: 'card consistency' },
    el('h3', {}, '同一張盤問三次', el('span', { class: `verdict ${ok ? 'ok' : 'bad'}`, text: ok ? '一致' : '不一致' }), schoolTitle(rep.school || (state.charts[rep.system || state.readingSystem] || {}).school)),
    el('div', { class: 'cons-summary' },
      el('span', {}, el('b', { text: '最低分' }), el('span', { class: `score-val ${scoreClass(rep.worst_score)}`, text: fmtPct(rep.worst_score) })),
      el('span', {}, el('b', { text: '次數' }), `${runs}`),
      rep.backend && el('span', {}, el('b', { text: '後端' }), rep.backend === 'mock' ? '離線示範' : rep.backend),
      el('span', {}, el('b', { text: '費用' }), fmtUsd(rep.cost_usd))),
    el('div', { class: 'tscroll' }, el('table', { class: 'dtable cons-table' },
      el('thead', {}, el('tr', {}, el('th', { text: '段落' }), el('th', { text: '三次方向' }), el('th', { text: '依據相似' }), el('th', { text: '用詞相似' }), el('th', { text: '分數' }))),
      el('tbody', {}, sections.map((s) => el('tr', { class: s.direction_consistent === false ? 'inconsistent' : '' },
        el('td', { class: 'name', text: s.title || s.key || '' }),
        el('td', { class: 'dirs' }, (s.directions || []).map((d) => el('span', { class: `dir dir-tag-${d || '平'}`, text: d || '—' })),
          s.direction_consistent === false && el('span', { class: 'drift', text: '方向飄了' })),
        el('td', { class: 'num', text: fmtPct(s.evidence_similarity) }),
        el('td', { class: 'num', text: fmtPct(s.mention_similarity) }),
        el('td', { class: `num score ${scoreClass(s.score)}`, text: fmtPct(s.score) })))))),
    texts.length > 0 && el('details', { class: 'cons-texts' },
      el('summary', { text: `看${texts.length === 3 ? '三' : texts.length}次的原文` }),
      el('div', { class: 'cons-cols', style: `--runs:${texts.length}` }, texts.map((run, i) => el('div', { class: 'cons-col' },
        el('h4', { text: `第 ${i + 1} 次` }),
        (Array.isArray(run) ? run : [run]).map((t, j) => el('div', { class: 'cons-sec' },
          el('b', { text: (sections[j] && sections[j].title) || `段落 ${j + 1}` }),
          el('p', { text: t ?? '' }))))))),
    rep.note && el('p', { class: 'hint note', text: rep.note }));
  area.append(card);
  return card;
}

async function requestConsistency() {
  const btn = $('#consistency-btn');
  const area = $('#consistency-area');
  let birth;
  try { birth = readBirth($('#birth-form')); } catch (e) { notice(e.message, 'error'); $('#birth-panel').open = true; return; }
  if (!llmGuard()) return;
  const body = { system: state.readingSystem, birth, runs: 3, ...schoolPayload(), ...llmPayload() };
  setBusy(btn, true, '解讀中…（會呼叫三次模型）');
  notice('');
  clear(area).append(el('div', { class: 'card consistency pending' }, el('h3', { text: '同一張盤問三次' }), el('div', { class: 'stream-box', text: '正在把同一張盤拿去問三次，比對方向與依據是否一致…' })));
  try {
    const rep = await request(API.consistency, { method: 'POST', body });
    state.consistency = rep;
    renderConsistency(rep);
  } catch (e) {
    clear(area);
    if (e instanceof ApiError && e.code === 'needs_birth_time') {
      state.candidates = e.data.candidates || state.candidates;
      area.append(el('p', { class: 'empty', text: explainError(e) }));
      if (state.candidates) area.append(renderCandidates(state.candidates));
    } else {
      notice(explainError(e), 'error');
    }
  } finally {
    setBusy(btn, false);
  }
}

// ------------------------------------------------------------------ 合盤
function renderMiniChart(chart, label) {
  if (!chart) return el('div', { class: 'card' }, el('p', { class: 'empty', text: `${label}：無資料` }));
  const p = chart.payload || {};
  const dm = chart.facts.find((f) => f.id === 'bazi.day_master');
  return el('div', { class: 'card' },
    el('h3', {}, `${label}・${(chart.birth && chart.birth.name) || '命主'}`, schoolTitle(chart.school)),
    el('p', { class: 'subject', text: chart.subject }),
    renderPillars(p, { mini: true, chart }),
    el('div', { class: 'kv' },
      el('div', {}, el('b', { text: '日主' }), el('span', { text: dm ? dm.value : (p.day_master || '—') })),
      el('div', {}, el('b', { text: '旺衰' }), el('span', { text: (p.strength || {}).label || '—' })),
      el('div', {}, el('b', { text: '喜用' }), el('span', { text: ((p.strength || {}).favourable || []).join('、') || '—' }))),
    warningsBlock(chart.warnings));
}

function renderSynastry(syn) {
  const area = clear($('#synastry-area'));
  const who = { a: (syn.a && syn.a.birth && syn.a.birth.name) || '甲方', b: (syn.b && syn.b.birth && syn.b.birth.name) || '乙方' };
  const score = syn.score || {};
  append(area,
    el('div', { class: 'pair' }, renderMiniChart(syn.a, '甲'), renderMiniChart(syn.b, '乙')),
    el('div', { class: 'card' },
      el('div', { class: 'score' },
        el('span', { class: 'net', text: score.net ?? '—' }),
        el('span', { class: 'h', text: `合 ${score.harmony ?? '—'}` }),
        el('span', { class: 't', text: `沖 ${score.tension ?? '—'}` }),
        el('span', { class: 'hint', text: '淨分 = 相合 − 相沖' })),
      syn.summary && el('p', { class: 'text serif', text: syn.summary })),
    (syn.items || []).map((it) => renderSynastryItem(it, syn, who, (w) => [syn[w]])),
    renderZiweiSynastry(syn, who),
    syn.reading && el('div', { class: 'card' }, el('h3', { text: '合盤解讀' }), el('p', { class: 'text serif', style: 'white-space: pre-wrap', text: syn.reading })),
  );
}

/** 合盤比對項目卡；chartsFor(who) 決定 evidence 要去哪幾張盤找事實 */
function renderSynastryItem(it, syn, who, chartsFor) {
  return el('div', { class: `card item k-${it.kind}` },
    el('h3', {}, el('span', { class: `kind kind-${it.kind}`, text: it.kind }), it.title),
    el('p', { class: 'text', text: it.text }),
    evidenceBar((it.evidence || []).map((ev, i) => {
      const charts = chartsFor(ev.who);
      return { key: `${ev.who}:${ev.fact_id}:${i}`, who: who[ev.who] || ev.who, label: factLabel(ev.fact_id, charts), resolve: () => findFact(ev.fact_id, charts) };
    }), it.cards));
}

/** 紫微合盤小節（7-4）：兩人命宮／夫妻宮四格並排 ＋ ziwei_items；任一方缺時辰就只提示一行 */
function renderZiweiSynastry(syn, who) {
  if (!('a_ziwei' in syn) && !('b_ziwei' in syn) && !hasItems(syn.ziwei_items)) return null;   // 舊後端沒這些欄位：整節不顯示
  const az = syn.a_ziwei, bz = syn.b_ziwei;
  const head = el('h3', { class: 'ziwei-syn-title', text: '紫微合盤' });
  if (!az || !bz) return el('div', { class: 'card ziwei-syn' }, head, el('p', { class: 'hint', text: '紫微合盤需要兩人的出生時辰。' }));
  const palace = (chart, name) => ((chart.payload || {}).palaces || []).find((p) => p.name === name) || null;
  const tile = (chart, label, name) => {
    const p = palace(chart, name);
    const stars = (cls, list, title) => Array.isArray(list) && list.length > 0 && el('div', { class: `star-row ${cls}` }, el('span', { class: 'lbl', text: title }), list.map((s) => starWithHua(s, p.hua, null, p.brightness)));
    return el('div', { class: `palace syn-palace${name === '命宮' ? ' life' : ''}` },
      el('div', { class: 'p-head' }, el('span', { class: 'p-name', text: `${label}・${name}` }), el('span', { class: 'p-gz', text: p ? (p.gz || `${p.stem || ''}${p.branch || ''}`) : '' })),
      !p ? el('div', { class: 'major' }, el('span', { class: 'empty-star', text: '資料不足' })) : [
        el('div', { class: 'major' }, hasItems(p.major) ? p.major.map((s) => starWithHua(s, p.hua, null, p.brightness)) : el('span', { class: 'empty-star', text: '空宮' })),
        stars('lucky', p.lucky, '吉'),
        stars('unlucky', p.unlucky, '煞'),
        stars('other', p.other, '雜'),
      ]);
  };
  const items = Array.isArray(syn.ziwei_items) ? syn.ziwei_items : [];
  // evidence 的 who 決定看哪一張紫微盤；找不到再退回同一人的八字盤
  const chartsFor = (w) => [syn[`${w}_ziwei`], syn[w]];
  return [
    el('div', { class: 'card ziwei-syn' },
      head,
      el('p', { class: 'hint', text: '把兩人的命宮與夫妻宮擺在一起看：主星、吉星、煞星與生年四化。' }),
      el('div', { class: 'syn-palaces' },
        tile(az, who.a, '命宮'), tile(az, who.a, '夫妻宮'), tile(bz, who.b, '命宮'), tile(bz, who.b, '夫妻宮')),
      el('div', { class: 'hint legend' }, el('span', { class: 'hua hua-祿', text: '祿' }), ' ', el('span', { class: 'hua hua-權', text: '權' }), ' ', el('span', { class: 'hua hua-科', text: '科' }), ' ', el('span', { class: 'hua hua-忌', text: '忌' }), ' 生年四化・', el('span', { class: 'lucky', text: '吉星' }), '・', el('span', { class: 'unlucky', text: '煞星' })),
      items.length === 0 && el('p', { class: 'hint', text: '兩張紫微盤之間沒有特別的比對結果。' })),
    items.map((it) => renderSynastryItem(it, syn, who, chartsFor)),
  ];
}

async function requestSynastry() {
  const btn = $('#synastry-btn');
  let a, b;
  try { a = readBirth($('#birth-form')); b = readBirth($('#birth-form-b')); } catch (e) { notice(e.message + '（兩個人的出生日期都要填）', 'error'); return; }
  if (!llmGuard()) return;
  setBusy(btn, true, '合盤中…');
  notice('');
  try {
    const syn = await request(API.synastry, { method: 'POST', body: { a, b, ...schoolPayload(), ...llmPayload() } });
    state.synastry = syn;
    renderSynastry(syn);
  } catch (e) {
    notice(explainError(e), 'error');
  } finally {
    setBusy(btn, false);
  }
}

// ------------------------------------------------------------------ 對話
const ACTION_LABEL = { answer: '直接回答', recast: '重算流年', lookup: '查知識卡', refuse: '婉拒' };
const DEFAULT_SUGGESTIONS = ['我的性格有什麼特質？', '最近有桃花嗎？', '明年適合換工作嗎？', '我的財運怎麼看？', '正官是什麼意思？'];

// 「可以這樣問」：點一下就填進輸入框並送出
function renderSuggestions(list) {
  const box = $('#chat-suggestions');
  if (!box) return;
  box.replaceChildren(el('span', { class: 'hint', text: '可以這樣問：' }),
    ...list.map((q) => el('button', { type: 'button', class: 'chip', text: q, onclick: () => {
      $('#chat-form [name=message]').value = q;
      $('#chat-form').requestSubmit();
    } })));
}

function chatMessage(role, text, extra = {}) {
  const win = $('#chat-window');
  const node = el('div', { class: `msg ${role}` },
    extra.action && el('div', { class: `action ${extra.action}` }, ACTION_LABEL[extra.action] || extra.action,
      extra.byok === true && el('span', { class: 'cost byok', text: '🔑 自付', title: '這則回覆用你自己的金鑰，費用由你支付，不計入本站預算' }),
      Number(extra.cost_usd) > 0 && el('span', { class: 'cost', text: fmtUsd(extra.cost_usd), title: '這則回覆的模型費用' })),
    el('div', { class: 'msg-text', text }),
    (extra.evidence || extra.cards) && evidenceBar(
      (extra.evidence || []).map((id) => ({ key: id, label: factLabel(id, [state.charts.bazi, state.charts.ziwei]), resolve: () => findFact(id, [state.charts.bazi, state.charts.ziwei]) })),
      extra.cards));
  win.append(node);
  win.scrollTop = win.scrollHeight;
  return node;
}

/** 8-3 個資：顯示 session 編號，使用者可一鍵刪除伺服器上的對話與命盤 */
function renderSessionLine() {
  const win = $('#chat-window');
  if (!win || !state.chat.sessionId) return;
  const old = win.querySelector('.session-line'); if (old) old.remove();
  const sid = state.chat.sessionId;
  win.append(el('div', { class: 'msg sys session-line' },
    el('span', { text: `session ${sid}　` }),
    el('button', { type: 'button', class: 'linkish', text: '刪除我的資料', onclick: async () => {
      try {
        await request(`${API.chat}/${encodeURIComponent(sid)}`, { method: 'DELETE' });
        state.chat.sessionId = null;
        chatMessage('sys', '已刪除伺服器上的對話與命盤；下一句會重新開始。');
      } catch (e) { chatMessage('sys', explainError(e)); }
    } })));
  win.scrollTop = win.scrollHeight;
}

async function sendChat(message) {
  const btn = $('#chat-btn');
  const body = { message };
  if (state.chat.sessionId) body.session_id = state.chat.sessionId;
  else {
    try { body.birth = readBirth($('#birth-form')); } catch (e) { notice('對話前請先在上方填好出生資料。', 'error'); $('#birth-panel').open = true; return; }
    Object.assign(body, schoolPayload());          // 第一句才排盤，流派跟著送；之後只靠 session_id
  }
  if (!llmGuard()) return;
  Object.assign(body, llmPayload());               // 自帶金鑰：伺服器不保存，所以每一句都要帶
  chatMessage('user', message);
  const pending = chatMessage('bot pending', '…');
  setBusy(btn, true);
  try {
    const r = await request(API.chat, { method: 'POST', body });
    pending.remove();
    const firstReply = !state.chat.sessionId;
    state.chat.sessionId = r.session_id || state.chat.sessionId;
    if (firstReply && r.chart_summary) {
      const cs = r.chart_summary;
      const txt = typeof cs === 'string' ? cs : Object.values(cs).join('　');
      chatMessage('sys', `命盤：${txt}`);
      renderSessionLine();                         // 8-3：session 編號＋「刪除我的資料」
    }
    chatMessage('bot', r.reply, { action: r.action, evidence: r.evidence, cards: r.cards, cost_usd: r.cost_usd, byok: r.byok });
  } catch (e) {
    pending.remove();
    if (e instanceof ApiError && e.status === 400 && e.code === 'refused') chatMessage('bot', e.data.reply || e.message, { action: 'refuse' });
    else chatMessage('sys', explainError(e));
  } finally {
    setBusy(btn, false);
  }
}

async function loadPersona() {
  try {
    const p = await request(API.persona);
    state.persona = p;
    const name = p.name || p.persona || '命理師';
    const greeting = p.greeting || p.opening || p.intro || '';
    $('#persona-line').textContent = `${name}${p.title ? '・' + p.title : ''}${greeting ? '：' + greeting : ''}`;
    chatMessage('bot', greeting || `我是${name}。`);
    renderSuggestions(p.suggestions || DEFAULT_SUGGESTIONS);
  } catch (e) {
    $('#persona-line').textContent = explainError(e);
  }
}

// ------------------------------------------------------------------ 初始化
// 解讀後端狀態：讓使用者一眼看出現在是接哪家 AI、哪個模型，還是離線示範
async function loadAiStatus() {
  if (!$('#ai-status')) return;
  try { state.health = await request(API.health); state.healthError = null; }
  catch (e) { state.health = null; state.healthError = e; }
  renderAiStatus();
}

/** 頁首狀態列：自帶金鑰模式顯示自帶（金色）；否則照 /api/health 顯示站台的 AI */
function renderAiStatus() {
  const box = $('#ai-status');
  if (!box) return;
  box.onclick = null; box.style.cursor = '';
  if (llmActive()) {
    const entry = llmBackendEntry() || {};
    const label = llmShortLabel(state.llm.label || entry.label || state.llm.backend);
    const model = state.llm.model || entry.default_model || '';
    let text = `🔑 自帶金鑰：${label}・${model}`;
    if (state.llm.verified && state.llm.served) text += `（實際服務 ${state.llm.served}）`;
    else if (!llmReady()) text += '（尚未填金鑰）';
    else text += '（尚未驗證）';
    box.title = '費用由你的金鑰支付，不計入本站預算；金鑰只存在你的瀏覽器，伺服器不保存。';
    box.className = 'ai-status byok';
    box.replaceChildren(el('span', { class: 'dot' }), document.createTextNode(text));
    return;
  }
  box.title = '解讀後端狀態（來自 /api/health）';
  if (!state.health) {
    box.className = 'ai-status down';
    box.replaceChildren(el('span', { class: 'dot' }), document.createTextNode('連不上後端：' + (state.healthError ? explainError(state.healthError) : '')));
    return;
  }
  {
    const h = state.health;
    let cls = 'offline', text;
    if (h.maintenance) { cls = 'down'; text = '命理師暫時休息中（維護模式）'; }
    else if (h.backend && h.backend !== 'mock') {
      cls = 'live';
      const mi = h.model_info || {};
      const served = mi.served || h.model || '';
      const name = mi.served_name || mi.name || '';
      // 例：AI 解讀：DeepSeek・deepseek-flash（DeepSeek-V4.1-Flash）；設定的是別名時標出來
      text = `AI 解讀：${h.provider || h.backend}・${served}${name && name !== served ? `（${name}）` : ''}`;
      if (mi.configured && mi.served && mi.configured !== mi.served) text += `　← 設定 ${mi.configured}`;
      if (mi.error) { cls = 'down'; text = `AI 連線失敗（${h.provider || h.backend}・${h.model}）：${mi.error}`; }
      box.title = [
        mi.configured && `設定的模型：${mi.configured}`,
        mi.served && `實際服務：${mi.served}${mi.served_name ? '（' + mi.served_name + '）' : ''}`,
        mi.context_window && `context window：${Number(mi.context_window).toLocaleString()} tokens`,
        mi.max_output_tokens && `最大輸出：${Number(mi.max_output_tokens).toLocaleString()} tokens`,
        mi.created && `發布：${mi.created}`,
        mi.fingerprint && `system_fingerprint：${mi.fingerprint}`,
        mi.note && mi.note.trim(),
        (mi.available || []).length && '點一下看此金鑰可用的模型',
      ].filter(Boolean).join('\n');
      if ((mi.available || []).length) {
        box.style.cursor = 'pointer';
        box.onclick = () => {
          const list = mi.available.map((m) => `${m.id}${m.name && m.name !== m.id ? '　' + m.name : ''}${m.context_window ? '　' + Number(m.context_window).toLocaleString() + ' ctx' : ''}`);
          notice(`此金鑰可用的模型（${h.provider}）：\n` + list.join('\n') + '\n\n改 .env 的 LLM_MODEL 即可切換', 'ok');
        };
      }
    }
    else text = '離線示範模式：未接 AI 金鑰，解讀由程式依盤面事實組出';
    box.className = `ai-status ${cls}`;
    box.replaceChildren(el('span', { class: 'dot' }), document.createTextNode(text));
  }
}

// 今日用量（9-1）：次數／上限、費用／預算、各模型平均每份費用、最近幾筆
async function showUsage() {
  const link = $('#usage-link');
  if (link) link.setAttribute('aria-busy', 'true');
  try {
    const u = await request(API.usage);
    const log = u.cost_log || {};
    const byModel = Object.entries(log.by_model || {});
    const rows = (Array.isArray(log.rows) ? log.rows : []).slice(-5).reverse();
    const kv = (label, value) => el('div', {}, el('b', { text: label }), el('span', { text: value }));
    const hhmm = (t) => { const m = String(t || '').match(/T(\d{2}:\d{2})/); return m ? m[1] : String(t || ''); };
    openDialog(
      el('h3', { text: `今日用量${u.day ? '・' + u.day : ''}` }),
      el('div', { class: 'kv usage-kv' },
        kv('解讀次數', `${u.total_readings ?? '—'} / ${u.cap ?? '—'}`),
        kv('費用', `${fmtUsd(u.cost_usd)} / ${u.budget_usd != null ? '$' + Number(u.budget_usd).toFixed(2) : '—'}`),
        u.per_ip_limit != null && kv('每人上限', `${u.per_ip_limit} 次`),
        u.distinct_ips != null && kv('今日人數', `${u.distinct_ips}`),
        u.maintenance && kv('維護模式', '開啟')),
      el('h4', { class: 'dtitle', text: '各模型平均每份' }),
      byModel.length === 0 ? el('p', { class: 'hint', text: '還沒有任何模型呼叫紀錄（離線示範不計費）。' })
        : el('div', { class: 'tscroll' }, el('table', { class: 'dtable usage-table' },
          el('thead', {}, el('tr', {}, ['模型', '次數', '平均', '合計', 'in / out tok'].map((t) => el('th', { text: t })))),
          el('tbody', {}, byModel.map(([name, m]) => el('tr', {},
            el('td', { class: 'name', text: name }), el('td', { class: 'num', text: m.count ?? '—' }),
            el('td', { class: 'num', text: fmtUsd(m.avg_usd) }), el('td', { class: 'num', text: fmtUsd(m.usd) }),
            el('td', { class: 'num', text: `${fmtTok(m.input_tokens)} / ${fmtTok(m.output_tokens)}` })))))),
      el('h4', { class: 'dtitle', text: '最近 5 筆' }),
      rows.length === 0 ? el('p', { class: 'hint', text: '沒有紀錄。' })
        : el('div', { class: 'tscroll' }, el('table', { class: 'dtable usage-table' },
          el('thead', {}, el('tr', {}, ['時間', '類型', '模型', 'in / out', '費用'].map((t) => el('th', { text: t })))),
          el('tbody', {}, rows.map((r) => el('tr', {},
            el('td', { text: hhmm(r.time) }), el('td', { text: r.kind || '' }), el('td', { class: 'name', text: r.model || r.backend || '' }),
            el('td', { class: 'num', text: `${fmtTok(r.input_tokens)} / ${fmtTok(r.output_tokens)}${Number(r.cache_read_tokens) > 0 ? '＋快取' : ''}` }),
            el('td', { class: 'num', text: fmtUsd(r.usd) })))))),
    );
  } catch (e) {
    notice('讀不到今日用量：' + explainError(e), 'error');
  } finally {
    if (link) link.removeAttribute('aria-busy');
  }
}

function init() {
  if (MOCK) notice('mock 模式：使用 web/mock-data.js 的假資料，不會呼叫後端。', 'ok');
  loadAiStatus();
  loadSchools();
  loadLlmBackends();
  const usageLink = $('#usage-link');
  if (usageLink) usageLink.addEventListener('click', (e) => { e.preventDefault(); showUsage(); });
  const consBtn = $('#consistency-btn');
  if (consBtn) consBtn.addEventListener('click', requestConsistency);

  // 分頁
  $$('.tab').forEach((t) => t.addEventListener('click', () => switchTab(t.dataset.tab)));
  // 排盤系統切換
  $$('#chart-system-seg .seg-btn').forEach((b) => b.addEventListener('click', () => {
    state.chartSystem = b.dataset.system;
    $$('#chart-system-seg .seg-btn').forEach((x) => x.classList.toggle('active', x === b));
    renderChartArea();
  }));
  $$('#reading-system-seg .seg-btn').forEach((b) => b.addEventListener('click', () => {
    state.readingSystem = b.dataset.system;
    $$('#reading-system-seg .seg-btn').forEach((x) => x.classList.toggle('active', x === b));
  }));

  // 表單
  const formA = $('#birth-form');
  const formB = $('#birth-form-b');
  setupPlaceField(formA);
  setupPlaceField(formB);
  loadCities();
  restoreForm(formA, 'bof.birth.a');
  restoreForm(formB, 'bof.birth.b');
  const reportBtn = $('#report-btn');
  if (reportBtn) reportBtn.addEventListener('click', () => openReport(formA));
  formA.addEventListener('submit', (e) => {
    e.preventDefault();
    try { const birth = readBirth(formA); rememberForm(formA, 'bof.birth.a'); castAll(birth); } catch (err) { notice(err.message, 'error'); }
  });
  formB.addEventListener('submit', (e) => { e.preventDefault(); rememberForm(formB, 'bof.birth.b'); requestSynastry(); });
  $('#reading-form').addEventListener('submit', (e) => { e.preventDefault(); requestReading(new FormData(e.target).get('focus').trim()); });
  $('#chat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.target.elements.message;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendChat(text);
  });

  // 匯出／列印
  $('#export-png').addEventListener('click', exportPng);
  $('#print-chart').addEventListener('click', () => { switchTab('cast'); window.print(); });
  $('#print-reading').addEventListener('click', () => { switchTab('reading'); window.print(); });

  // mock 模式幫忙填好資料，方便檢查版面
  if (MOCK && !formA.elements.birth_date.value) {
    const b = window.MOCK_DATA.bazi.birth;
    formA.elements.name.value = b.name || ''; formA.elements.birth_date.value = b.birth_date; formA.elements.birth_time.value = (b.birth_time || '').slice(0, 5);
    formA.elements.gender.value = b.gender || ''; formA.elements.place.value = b.place || ''; formA.elements.longitude.value = b.longitude ?? '';
    const b2 = window.MOCK_DATA.bazi_b.birth;
    formB.elements.name.value = b2.name || ''; formB.elements.birth_date.value = b2.birth_date; formB.elements.birth_time.value = (b2.birth_time || '').slice(0, 5);
    formB.elements.gender.value = b2.gender || ''; formB.elements.place.value = b2.place || ''; formB.elements.longitude.value = b2.longitude ?? '';
  }

  loadPersona();
  renderChartArea();
}

document.addEventListener('DOMContentLoaded', init);
