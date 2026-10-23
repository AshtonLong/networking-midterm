// Validates every data/guide/*.js and data/quiz/*.js file against tools/content-spec.md.
// Usage: node tools/validate.js            (all sections)
//        node tools/validate.js dns http   (only these section ids)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const only = process.argv.slice(2);
const errors = [];
const warnings = [];
const err = (f, m) => errors.push(`${f}: ${m}`);
const warn = (f, m) => warnings.push(`${f}: ${m}`);

const DIAGRAMS = ['stack', 'encapsulation', 'delay-components', 'store-forward', 'network-of-networks',
  'http-nonpersistent', 'email-flow', 'dns-iterative', 'dns-recursive', 'udp-segment', 'tcp-segment',
  'stop-and-wait', 'pipelining', 'gbn-window', 'sr-windows', 'tcp-handshake'];
const GAMES = ['encap', 'delaylab', 'number-crunch', 'match-blitz', 'dns-resolver', 'http-timeline',
  'http-dissect', 'code-order', 'demux', 'checksum', 'rdt-sim', 'window-lab', 'seq-ack', 'rtt-estimator'];
const BLOCK_KEYS = ['p', 'list', 'steps', 'def', 'formula', 'table', 'trap', 'example', 'code', 'diagram', 'game'];
const TYPES = ['mc', 'multi', 'tf', 'num', 'short', 'order'];

const sections = {};
const questions = {};
const NET = {
  addSection(s) { sections[s.id] = s; },
  addQuestions(id, qs) { questions[id] = (questions[id] || []).concat(qs); },
};

function load(dir) {
  const full = path.join(root, 'data', dir);
  if (!fs.existsSync(full)) return;
  for (const f of fs.readdirSync(full).filter(f => f.endsWith('.js'))) {
    const id = f.replace(/\.js$/, '');
    if (only.length && !only.includes(id)) continue;
    const code = fs.readFileSync(path.join(full, f), 'utf8');
    try {
      vm.runInNewContext(code, { NET }, { filename: `data/${dir}/${f}` });
    } catch (e) {
      err(`data/${dir}/${f}`, `failed to execute: ${e.message}`);
    }
  }
}
load('guide');
load('quiz');

function checkInline(where, s) {
  if (typeof s !== 'string') { err(where, `expected string, got ${typeof s}`); return; }
  if (/<\/?(b|i|em|strong|br|p|code|sub|sup|span|div)\b/i.test(s)) warn(where, 'looks like raw HTML; use inline markup instead');
  const opens = (s.match(/\[\[/g) || []).length, closes = (s.match(/\]\]/g) || []).length;
  if (opens !== closes) err(where, 'unbalanced [[ ]]');
  const ticks = (s.match(/`/g) || []).length;
  if (ticks % 2) warn(where, 'odd number of backticks');
  const stars = (s.match(/\*\*/g) || []).length;
  if (stars % 2) warn(where, 'odd number of ** markers');
  if (/(^|[^*])\*([^*]|$)/.test(s.replace(/\*\*/g, ''))) warn(where, 'single * found (use × for multiplication)');
}

for (const [id, s] of Object.entries(sections)) {
  const f = `guide/${id}`;
  for (const k of ['id', 'unit', 'order', 'title', 'short', 'text', 'summary']) if (s[k] === undefined || s[k] === '') err(f, `missing ${k}`);
  if (typeof s.cheat !== 'string') err(f, 'cheat must be a string (use "" if none)');
  if (![1, 2, 3].includes(s.unit)) err(f, 'unit must be 1, 2 or 3');
  if (s.short && s.short.length > 18) warn(f, `short label longer than 18 chars: "${s.short}"`);
  if (!Array.isArray(s.mustKnow) || s.mustKnow.length < 5) err(f, 'mustKnow needs ≥ 5 items');
  (s.mustKnow || []).forEach((m, i) => checkInline(`${f} mustKnow[${i}]`, m));
  if (!Array.isArray(s.topics) || !s.topics.length) err(f, 'topics missing');
  (s.topics || []).forEach((t, ti) => {
    const tf = `${f} topics[${ti}] "${t.title}"`;
    if (!t.title) err(tf, 'missing title');
    if (!['cheat', 'text', 'both'].includes(t.src)) err(tf, `src must be cheat|text|both, got ${t.src}`);
    if (!Array.isArray(t.blocks) || !t.blocks.length) err(tf, 'blocks missing');
    (t.blocks || []).forEach((b, bi) => {
      const bf = `${tf} block[${bi}]`;
      const kind = BLOCK_KEYS.find(k => k in b);
      if (!kind) { err(bf, `unknown block shape: ${Object.keys(b).join(',')}`); return; }
      if (kind === 'p' || kind === 'trap') checkInline(bf, b[kind]);
      if (kind === 'list' || kind === 'steps') {
        if (!Array.isArray(b[kind]) || !b[kind].length) err(bf, `${kind} must be a non-empty array`);
        else b[kind].forEach((x, i) => checkInline(`${bf}[${i}]`, x));
      }
      if (kind === 'def') { checkInline(bf, b.def); checkInline(bf, b.text); }
      if (kind === 'formula') {
        checkInline(bf, b.formula);
        if (b.where && !Array.isArray(b.where)) err(bf, 'formula.where must be array of [sym, meaning]');
        (b.where || []).forEach(w => { if (!Array.isArray(w) || w.length !== 2) err(bf, 'formula.where entries must be [sym, meaning]'); });
      }
      if (kind === 'table') {
        const tb = b.table;
        if (!tb || !Array.isArray(tb.head) || !Array.isArray(tb.rows)) { err(bf, 'table needs head[] and rows[][]'); return; }
        tb.rows.forEach((r, ri) => { if (!Array.isArray(r) || r.length !== tb.head.length) err(bf, `table row ${ri} has ${r && r.length} cells, head has ${tb.head.length}`); });
      }
      if (kind === 'example') { if (!b.example || !b.example.q || !b.example.a) err(bf, 'example needs q and a'); else { checkInline(bf, b.example.q); checkInline(bf, b.example.a); } }
      if (kind === 'code' && typeof b.code !== 'string') err(bf, 'code must be a string');
      if (kind === 'diagram' && !DIAGRAMS.includes(b.diagram)) err(bf, `unknown diagram "${b.diagram}"`);
      if (kind === 'game' && !GAMES.includes(b.game)) err(bf, `unknown game "${b.game}"`);
    });
  });
  if (!Array.isArray(s.recall) || s.recall.length < 8) err(f, 'recall needs ≥ 8 items');
  (s.recall || []).forEach((r, i) => { if (!r.q || !r.a) err(`${f} recall[${i}]`, 'needs q and a'); });
}

for (const [id, qs] of Object.entries(questions)) {
  const f = `quiz/${id}`;
  if (!sections[id] && !only.length) warn(f, 'no matching guide section');
  const seen = new Set();
  const count = { d1: 0, d2: 0, d3: 0, short: 0, num: 0 };
  qs.forEach((q, i) => {
    const qf = `${f} [${i}] ${q.id || ''}`;
    if (!q.id) err(qf, 'missing id');
    else if (seen.has(q.id)) err(qf, 'duplicate id');
    else if (!q.id.startsWith(id + '-')) err(qf, `id must start with "${id}-"`);
    seen.add(q.id);
    if (![1, 2, 3].includes(q.d)) err(qf, 'd must be 1, 2 or 3');
    else count['d' + q.d]++;
    if (!TYPES.includes(q.type)) { err(qf, `bad type ${q.type}`); return; }
    if (!q.src || !/^(cheat|text|ch[123]-[RP]\d+[a-z]?)$/.test(q.src)) err(qf, `bad src "${q.src}"`);
    checkInline(qf + ' q', q.q || '');
    if (!q.q) err(qf, 'missing q');
    if (/\[\[/.test(q.q || '')) err(qf, 'do not use [[...]] in questions');
    if (!q.why) err(qf, 'missing why');
    if (q.type === 'mc') {
      if (!Array.isArray(q.choices) || q.choices.length < 3 || q.choices.length > 5) err(qf, 'mc needs 3–5 choices');
      if (!Number.isInteger(q.a) || q.a < 0 || q.a >= (q.choices || []).length) err(qf, 'mc a must index a choice');
      if (q.choices && new Set(q.choices).size !== q.choices.length) err(qf, 'duplicate choices');
    }
    if (q.type === 'multi') {
      if (!Array.isArray(q.choices) || q.choices.length < 4 || q.choices.length > 6) err(qf, 'multi needs 4–6 choices');
      if (!Array.isArray(q.a) || q.a.length < 2 || q.a.some(x => !Number.isInteger(x) || x < 0 || x >= (q.choices || []).length)) err(qf, 'multi a must be ≥2 valid indices');
      if (!/select all/i.test(q.q || '')) warn(qf, 'multi question should say "Select all that apply."');
    }
    if (q.type === 'tf' && typeof q.a !== 'boolean') err(qf, 'tf a must be boolean');
    if (q.type === 'num') {
      count.num++;
      if (typeof q.a !== 'number' || !isFinite(q.a)) err(qf, 'num a must be a finite number');
      if (typeof q.unit !== 'string') err(qf, 'num needs unit string');
      if (q.tol !== undefined && (typeof q.tol !== 'number' || q.tol < 0 || q.tol > 0.5)) err(qf, 'tol must be 0–0.5');
    }
    if (q.type === 'short') {
      count.short++;
      if (typeof q.a !== 'string' || q.a.length < 10) err(qf, 'short a must be a model answer string');
      if (!Array.isArray(q.keys) || q.keys.length < 2 || q.keys.length > 6) err(qf, 'short keys must have 2–6 entries');
    }
    if (q.type === 'order') {
      if (!Array.isArray(q.items) || q.items.length < 3 || q.items.length > 8) err(qf, 'order needs 3–8 items');
      if (q.items && new Set(q.items).size !== q.items.length) err(qf, 'duplicate order items');
    }
  });
  const n = qs.length;
  const line = `${id}: ${n} questions (easy ${count.d1}, medium ${count.d2}, hard ${count.d3}; short ${count.short}, num ${count.num})`;
  console.log(line);
  if (n < 30) warn(f, `only ${n} questions (target 30–50)`);
  if (count.short < 6) warn(f, `only ${count.short} short-answer questions (target ≥ 6)`);
}
for (const id of Object.keys(sections)) if (!questions[id]) warn(`guide/${id}`, 'no quiz file');

if (warnings.length) { console.log(`\n${warnings.length} warning(s):`); warnings.forEach(w => console.log('  ⚠ ' + w)); }
if (errors.length) { console.log(`\n${errors.length} error(s):`); errors.forEach(e => console.log('  ✗ ' + e)); process.exitCode = 1; }
else console.log('\nOK — no errors.');
