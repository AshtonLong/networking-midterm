/* Quiz engine: setup → run → results. Sessions live in memory and sessionStorage. */
(function () {
  const { el, fmt, html, esc, store, UNITS, shuffle } = NET;
  const main = document.getElementById('main');
  const LETTERS = 'ABCDEF';
  const DIFF = ['', 'Easy', 'Medium', 'Hard'];
  const TYPE_LABEL = { mc: 'Multiple choice', multi: 'Select all that apply', tf: 'True or false', num: 'Calculation', short: 'Written answer', order: 'Put in order' };
  let S = null;            // current session
  let keyHandler = null;

  const defaults = { sections: [], diffs: [1, 2, 3], types: 'all', count: 20, order: 'ramp', focus: 'smart' };
  function getSetup() { return Object.assign({}, defaults, store.setting('quizSetup') || {}); }
  function saveSetup(s) { store.setting('quizSetup', s); }

  const qById = () => { const m = {}; NET.allQuestions().forEach(q => { m[q.id] = q; }); return m; };

  function persist() {
    if (!S) { sessionStorage.removeItem('quizSession'); return; }
    sessionStorage.setItem('quizSession', JSON.stringify({ ids: S.qs.map(q => q.id), i: S.i, results: S.results, label: S.label, back: S.back, perms: S.perms || {} }));
  }
  function restore() {
    try {
      const raw = JSON.parse(sessionStorage.getItem('quizSession'));
      if (!raw) return null;
      const m = qById();
      const qs = raw.ids.map(id => m[id]).filter(Boolean);
      if (!qs.length) return null;
      return { qs, i: Math.min(raw.i, qs.length), results: raw.results || [], label: raw.label, back: raw.back, perms: raw.perms || {} };
    } catch (e) { return null; }
  }

  /* ---------- building a session ---------- */
  function filterPool(o) {
    let pool = NET.sections.filter(s => !o.sections.length || o.sections.includes(s.id)).flatMap(s => NET.questions[s.id] || []);
    pool = pool.filter(q => o.diffs.includes(q.d));
    if (o.types === 'auto') pool = pool.filter(q => q.type !== 'short');
    if (o.types === 'written') pool = pool.filter(q => q.type === 'short' || q.type === 'num');
    if (o.types === 'calc') pool = pool.filter(q => q.type === 'num');
    if (o.types === 'textbook') pool = pool.filter(q => /^ch\d-/.test(q.src));
    return pool;
  }
  function priority(q) {
    const r = store.q(q.id);
    if (!r || !r.n) return 1;                 // unseen
    if (r.last < 1) return 0;                 // missed or partial: first
    return 2 + Math.min(r.c / r.n, 1);        // known: last
  }
  // groups questions sharing ctx so multi-part problems stay together, in id order
  function groupByCtx(qs) {
    const groups = [], byCtx = new Map();
    qs.forEach(q => {
      if (q.ctx) {
        if (!byCtx.has(q.ctx)) { const g = []; byCtx.set(q.ctx, g); groups.push(g); }
        byCtx.get(q.ctx).push(q);
      } else groups.push([q]);
    });
    groups.forEach(g => g.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true })));
    return groups;
  }
  function buildSession(o) {
    let pool = filterPool(o);
    if (o.focus === 'smart') pool = shuffle(pool).sort((a, b) => priority(a) - priority(b));
    else pool = shuffle(pool);
    const n = o.count === 'all' ? pool.length : Math.min(+o.count, pool.length);
    let picked = pool.slice(0, n);
    // pull in sibling parts of picked multi-part problems when there is room
    let groups = groupByCtx(picked);
    if (o.order === 'ramp') {
      groups = shuffle(groups).sort((a, b) => Math.max(...a.map(q => q.d)) - Math.max(...b.map(q => q.d)));
    } else groups = shuffle(groups);
    return groups.flat();
  }
  function start(qs, label, back) {
    if (!qs.length) return false;
    S = { qs, i: 0, results: [], label, back, perms: {} };
    persist();
    location.hash = '#/quiz/run';
    return true;
  }

  /* ---------- setup page ---------- */
  function renderSetup(params) {
    NET.setTitle('Quiz');
    const o = getSetup();
    const pre = (params.get('s') || '').split(',').filter(id => NET.byId[id]);
    if (pre.length) o.sections = pre;
    const head = el('header', { class: 'page-head' }, el('h1', null, 'Quiz'),
      el('p', null, 'Pick sections and difficulty. Questions you missed come first, then ones you haven’t seen. Multi-part textbook problems stay together.'));

    const summaryCount = el('h2');
    const summaryText = el('p');
    const dl = el('dl');
    const startBtn = el('button', { class: 'btn', type: 'button' }, 'Start quiz');
    const resume = restore();

    function refresh() {
      const pool = filterPool(o);
      const n = o.count === 'all' ? pool.length : Math.min(+o.count, pool.length);
      summaryCount.textContent = String(n);
      summaryText.textContent = n === 1 ? 'question in this quiz' : `questions in this quiz (pool of ${pool.length})`;
      const unseen = pool.filter(q => !(store.q(q.id) || {}).n).length;
      const missed = pool.filter(q => { const r = store.q(q.id); return r && r.n && r.last < 1; }).length;
      dl.replaceChildren(
        el('dt', null, 'Sections'), el('dd', null, o.sections.length ? String(o.sections.length) : 'All'),
        el('dt', null, 'Missed in pool'), el('dd', null, String(missed)),
        el('dt', null, 'Unseen in pool'), el('dd', null, String(unseen)),
        el('dt', null, 'Order'), el('dd', null, o.order === 'ramp' ? 'Easy to hard' : 'Shuffled'));
      startBtn.disabled = !n;
      saveSetup(o);
    }
    startBtn.addEventListener('click', () => {
      const qs = buildSession(o);
      const label = o.sections.length === 1 ? NET.byId[o.sections[0]].title : o.sections.length ? `${o.sections.length} sections` : 'Whole course';
      start(qs, label, o.sections.length === 1 ? '#/guide/' + o.sections[0] : null);
    });

    // section picker
    const picker = el('div', { class: 'sec-picker' });
    function chipFor(s) {
      const c = el('button', { class: 'chip ' + 'u' + s.unit, type: 'button', 'aria-pressed': String(o.sections.includes(s.id)) },
        NET.led(s.id), `${NET.sectionNum(s)} ${s.short}`);
      c.addEventListener('click', () => {
        const on = o.sections.includes(s.id);
        o.sections = on ? o.sections.filter(x => x !== s.id) : o.sections.concat(s.id);
        c.setAttribute('aria-pressed', String(!on));
        refresh(); syncAll();
      });
      c.dataset.id = s.id;
      return c;
    }
    const allBtn = el('button', { class: 'chip', type: 'button' }, 'Whole course');
    function syncAll() {
      allBtn.setAttribute('aria-pressed', String(!o.sections.length));
      picker.querySelectorAll('.chip[data-id]').forEach(c => c.setAttribute('aria-pressed', String(o.sections.includes(c.dataset.id))));
    }
    allBtn.addEventListener('click', () => { o.sections = []; syncAll(); refresh(); });
    picker.appendChild(el('div', { class: 'chip-row' }, allBtn));
    [1, 2, 3].forEach(u => {
      const secs = NET.sections.filter(s => s.unit === u);
      if (!secs.length) return;
      const unitBtn = el('button', { class: 'btn ghost small', type: 'button' }, 'Select chapter');
      unitBtn.addEventListener('click', () => {
        const ids = secs.map(s => s.id);
        const allOn = ids.every(id => o.sections.includes(id));
        o.sections = allOn ? o.sections.filter(id => !ids.includes(id)) : [...new Set(o.sections.concat(ids))];
        syncAll(); refresh();
      });
      picker.appendChild(el('div', null,
        el('div', { class: 'sec-group-head u' + u }, el('span', { class: 'unit-dot' }), `${UNITS[u].chapter}: ${UNITS[u].name}`, unitBtn),
        el('div', { class: 'chip-row' }, secs.map(chipFor))));
    });
    syncAll();

    function radioRow(key, opts) {
      const row = el('div', { class: 'chip-row', role: 'group' });
      opts.forEach(([v, label]) => {
        const c = el('button', { class: 'chip', type: 'button', 'aria-pressed': String(o[key] === v) }, label);
        c.addEventListener('click', () => { o[key] = v; row.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', 'false')); c.setAttribute('aria-pressed', 'true'); refresh(); });
        row.appendChild(c);
      });
      return row;
    }
    const diffRow = el('div', { class: 'chip-row', role: 'group' });
    [1, 2, 3].forEach(d => {
      const c = el('button', { class: 'chip', type: 'button', 'aria-pressed': String(o.diffs.includes(d)) }, NET.bars(d), DIFF[d]);
      c.addEventListener('click', () => {
        const on = o.diffs.includes(d);
        if (on && o.diffs.length === 1) return;
        o.diffs = on ? o.diffs.filter(x => x !== d) : o.diffs.concat(d).sort();
        c.setAttribute('aria-pressed', String(!on)); refresh();
      });
      diffRow.appendChild(c);
    });

    const left = el('div', null,
      el('div', { class: 'setup-block' }, el('h2', null, 'Sections'), picker),
      el('div', { class: 'setup-block' }, el('h2', null, 'Difficulty'), diffRow),
      el('div', { class: 'setup-block' }, el('h2', null, 'Question types'),
        radioRow('types', [['all', 'Everything'], ['auto', 'Auto-graded only'], ['written', 'Written and calculations'], ['calc', 'Calculations only'], ['textbook', 'Textbook exercises only']])),
      el('div', { class: 'setup-block' }, el('h2', null, 'Length'), radioRow('count', [[10, '10'], [20, '20'], [40, '40'], ['all', 'All']])),
      el('div', { class: 'setup-block' }, el('h2', null, 'Order'), radioRow('order', [['ramp', 'Easy to hard'], ['shuffle', 'Shuffled']])),
      el('div', { class: 'setup-block' }, el('h2', null, 'Which questions first'),
        radioRow('focus', [['smart', 'Missed, then unseen'], ['random', 'Random']])));
    const right = el('aside', { class: 'setup-summary' }, summaryCount, summaryText, dl, startBtn,
      resume && resume.results.length < resume.qs.length ? el('a', { class: 'btn secondary', href: '#/quiz/run', style: { width: '100%', marginTop: '10px' }, onclick: () => { S = resume; } },
        `Resume: question ${resume.i + 1} of ${resume.qs.length}`) : null);
    main.replaceChildren(head, el('div', { class: 'quiz-setup' }, left, right));
    refresh();
    window.scrollTo(0, 0);
  }

  /* ---------- grading helpers ---------- */
  function evalNumber(s) {
    const t = String(s).trim().replace(/,/g, '').replace(/×/g, '*').replace(/\^/g, '**');
    if (!t) return NaN;
    if (!/^[0-9eE+\-*/().\s]+$/.test(t)) return NaN;
    try { const v = Function('"use strict";return (' + t + ')')(); return typeof v === 'number' ? v : NaN; } catch (e) { return NaN; }
  }
  function numOK(v, q) {
    if (!isFinite(v)) return false;
    const tol = q.tol === undefined ? 0.02 : q.tol;
    if (q.a === 0) return Math.abs(v) <= 1e-9 + tol;
    return Math.abs(v - q.a) <= Math.abs(q.a) * tol + 1e-12;
  }
  const norm = s => ' ' + String(s).toLowerCase().replace(/[`*_{}\[\]]/g, '').replace(/[^a-z0-9.%/+\-\s]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  function keyHits(text, keys) {
    const t = norm(text);
    return keys.map(k => {
      const alts = k.split('|').map(x => norm(x).trim()).filter(Boolean);
      return { label: k.split('|')[0], hit: alts.some(a => t.includes(a)) };
    });
  }
  function fmtNum(x) {
    if (!isFinite(x)) return String(x);
    const ax = Math.abs(x);
    if (ax !== 0 && (ax >= 1e7 || ax < 1e-3)) return x.toExponential(3).replace(/\.?0+e/, 'e');
    return String(Number(x.toPrecision(6)));
  }

  /* Display-time choice order: shuffle unless choices depend on their position;
     all-numeric choice lists are sorted ascending instead. */
  const ORDER_DEP = /\b(all|none|both|neither) of (the )?(above|these|them|those)\b|^(both|neither|all of|none of)\b|\b[a-e] and [a-e]\b|\b(option|choice)s? [a-e1-6]\b/i;
  function choicePerm(q) {
    const idx = q.choices.map((_, i) => i);
    if (q.choices.some(c => ORDER_DEP.test(c)) || /\b(option|choice|answer) \(?[A-E]\b/.test(q.why || '')) return idx;
    const nums = q.choices.map(c => (/^\s*-?[\d.,]+(e-?\d+)?\s*([a-zA-Zµ%/ ]{0,12})?$/.test(String(c)) ? parseFloat(String(c).replace(/,/g, '')) : NaN));
    if (nums.every(x => isFinite(x))) return idx.sort((a, b) => nums[a] - nums[b]);
    return shuffle(idx);
  }
  function view(q) {
    if (q.type !== 'mc' && q.type !== 'multi') return null;
    S.perms = S.perms || {};
    let perm = S.perms[S.i];
    if (!perm || perm.length !== q.choices.length) { perm = choicePerm(q); S.perms[S.i] = perm; persist(); }
    return {
      choices: perm.map(i => q.choices[i]),
      a: q.type === 'mc' ? perm.indexOf(q.a) : q.a.map(x => perm.indexOf(x)),
    };
  }

  /* ---------- run page ---------- */
  function setKeys(h) { keyHandler = h; }
  document.addEventListener('keydown', e => {
    if (!keyHandler || !document.querySelector('.quiz-run')) return;
    keyHandler(e);
  });

  function renderRun() {
    if (!S) S = restore();
    if (!S) { location.replace('#/quiz'); return; }
    if (S.i >= S.qs.length) { renderResults(); return; }
    NET.setTitle(`Question ${S.i + 1} of ${S.qs.length}`);
    const q = S.qs[S.i];
    const prior = S.results[S.i];
    const sec = NET.byId[q.section];

    // strip
    const strip = el('div', { class: 'window-strip', 'aria-hidden': 'true' }, S.qs.map((_, k) => {
      const r = S.results[k];
      let cls = r ? (r.score === 1 ? 'ack' : r.score > 0 ? 'part' : 'nak') : '';
      if (k === S.i) cls += ' cur';
      else if (k > S.i && k < S.i + 4) cls += ' inwin';
      return el('i', { class: cls });
    }));
    const done = S.results.filter(Boolean);
    const correct = done.reduce((a, r) => a + r.score, 0);
    const legend = el('div', { class: 'strip-legend' },
      el('span', null, el('b', null, `Question ${S.i + 1} of ${S.qs.length}`), S.label ? ` in ${S.label}` : ''),
      el('span', null,
        el('span', null, el('i', { style: { background: 'var(--ack)' } }), 'ACKed'),
        ' ', el('span', null, el('i', { style: { background: 'var(--nak)' } }), 'NAKed'),
        ' ', el('span', null, el('i', { style: { background: 'var(--amber)' } }), 'partial'),
        ' ', el('span', null, `${fmtNum(correct)} / ${done.length} so far`)));

    const flagged = !!(store.q(q.id) || {}).flag;
    const flagBtn = el('button', { class: 'flag-btn', type: 'button', 'aria-pressed': String(flagged), title: 'Flag for later review (F)' }, flagged ? 'Flagged' : 'Flag');
    flagBtn.addEventListener('click', () => { const f = store.toggleFlag(q.id); flagBtn.setAttribute('aria-pressed', String(f)); flagBtn.textContent = f ? 'Flagged' : 'Flag'; });

    const card = el('div', { class: 'qcard' },
      el('div', { class: 'qmeta' },
        sec ? el('a', { class: 'sec-name u' + sec.unit, href: '#/guide/' + sec.id, title: 'Open the guide for this section' }, el('span', { class: 'unit-dot' }), `${NET.sectionNum(sec)} ${sec.short}`) : null,
        el('span', null, NET.bars(q.d), ' ', DIFF[q.d]),
        el('span', null, TYPE_LABEL[q.type]),
        NET.srcTag(q.src),
        el('span', { class: 'spacer' }), flagBtn));
    if (q.ctx) card.appendChild(html('div', 'qctx', q.ctx));
    card.appendChild(html('p', 'qtext', q.q));

    const body = el('div');
    const fb = el('div', { 'aria-live': 'polite' });
    card.append(body, fb);

    const nextBtn = el('button', { class: 'btn', type: 'button', hidden: true }, S.i === S.qs.length - 1 ? 'See results' : 'Next question');
    nextBtn.addEventListener('click', next);
    const backBtn = el('button', { class: 'btn ghost small', type: 'button', disabled: S.i === 0 }, 'Previous');
    backBtn.addEventListener('click', () => { S.i = Math.max(0, S.i - 1); persist(); renderRun(); });
    const quitBtn = el('a', { class: 'btn ghost small', href: '#/quiz/results' }, 'End quiz');
    const hint = el('span', { class: 'kbd-hint' });
    const nav = el('div', { class: 'qnav' }, el('div', { class: 'btn-row' }, backBtn, quitBtn), hint, nextBtn);

    function next() { S.i++; persist(); renderRun(); }
    function finishQ(score, answer, fbNode) {
      if (!S.results[S.i]) {
        S.results[S.i] = { score, answer };
        store.recordAnswer(q.id, score);
        persist();
      }
      fb.replaceChildren(fbNode);
      nextBtn.hidden = false;
      nextBtn.focus();
      hint.textContent = 'Enter: next';
    }
    function verdict(score, extra) {
      const kind = score === 1 ? 'good' : score > 0 ? 'part' : 'bad';
      const title = score === 1 ? 'Correct' : score > 0 ? 'Partly right' : 'Not quite';
      return el('div', { class: 'feedback ' + kind }, el('h3', null, title), extra || null, html('p', 'why', q.why));
    }

    const type = q.type;
    const v = view(q);
    if (type === 'mc' || type === 'tf') {
      const choices = type === 'tf' ? ['True', 'False'] : v.choices;
      const answerIdx = type === 'tf' ? (q.a ? 0 : 1) : v.a;
      const list = el('ul', { class: 'choices' });
      const btns = choices.map((c, i) => {
        const b = el('button', { class: 'choice', type: 'button' }, el('span', { class: 'key' }, LETTERS[i]), html('span', null, c));
        b.addEventListener('click', () => choose(i));
        list.appendChild(el('li', null, b));
        return b;
      });
      body.appendChild(list);
      function choose(i) {
        if (S.results[S.i] && !prior) return;
        btns.forEach(b => { b.disabled = true; });
        btns[answerIdx].classList.add('right');
        if (i !== answerIdx) btns[i].classList.add('wrong');
        btns[i].setAttribute('aria-pressed', 'true');
        const score = i === answerIdx ? 1 : 0;
        finishQ(score, i, verdict(score, score ? null : html('p', null, `Answer: **${LETTERS[answerIdx]}.** ${choices[answerIdx]}`)));
      }
      hint.textContent = type === 'tf' ? 'Keys: T or F, A or B' : `Keys: A–${LETTERS[choices.length - 1]} or 1–${choices.length}`;
      setKeys(e => {
        if (S.results[S.i]) { if (e.key === 'Enter') { e.preventDefault(); next(); } return; }
        let i = -1;
        if (/^[1-6]$/.test(e.key)) i = +e.key - 1;
        else if (/^[a-f]$/i.test(e.key) && !(type === 'tf' && /^f$/i.test(e.key))) i = LETTERS.indexOf(e.key.toUpperCase());
        if (type === 'tf' && /^t$/i.test(e.key)) i = 0;
        if (type === 'tf' && /^f$/i.test(e.key)) i = 1;
        if (i >= 0 && i < choices.length) { e.preventDefault(); choose(i); }
      });
      if (prior) choose(prior.answer);
    } else if (type === 'multi') {
      const picked = new Set();
      const list = el('ul', { class: 'choices' });
      const btns = v.choices.map((c, i) => {
        const b = el('button', { class: 'choice', type: 'button', 'aria-pressed': 'false' }, el('span', { class: 'key' }, LETTERS[i]), html('span', null, c));
        b.addEventListener('click', () => toggle(i));
        list.appendChild(el('li', null, b));
        return b;
      });
      const check = el('button', { class: 'btn', type: 'button' }, 'Check');
      check.addEventListener('click', () => submit());
      body.append(list, el('div', { class: 'btn-row', style: { marginBottom: '8px' } }, check));
      function toggle(i) {
        if (S.results[S.i]) return;
        if (picked.has(i)) picked.delete(i); else picked.add(i);
        btns[i].setAttribute('aria-pressed', String(picked.has(i)));
      }
      function submit(pre) {
        const chosen = pre || [...picked];
        const ans = new Set(v.a);
        btns.forEach((b, i) => {
          b.disabled = true;
          if (ans.has(i)) b.classList.add('right');
          else if (chosen.includes(i)) b.classList.add('wrong');
          b.setAttribute('aria-pressed', String(chosen.includes(i)));
        });
        check.hidden = true;
        const ok = chosen.length === ans.size && chosen.every(i => ans.has(i));
        const missedN = [...ans].filter(i => !chosen.includes(i)).length;
        const extraN = chosen.filter(i => !ans.has(i)).length;
        const note = ok ? null : el('p', null, `Correct set: ${v.a.slice().sort().map(i => LETTERS[i]).join(', ')}.` + (missedN ? ` You missed ${missedN}.` : '') + (extraN ? ` ${extraN} of your picks ${extraN === 1 ? 'was' : 'were'} wrong.` : ''));
        finishQ(ok ? 1 : 0, chosen, verdict(ok ? 1 : 0, note));
      }
      hint.textContent = 'Keys: A–F toggle, Enter checks';
      setKeys(e => {
        if (S.results[S.i]) { if (e.key === 'Enter') { e.preventDefault(); next(); } return; }
        let i = -1;
        if (/^[1-6]$/.test(e.key)) i = +e.key - 1;
        else if (/^[a-f]$/i.test(e.key)) i = LETTERS.indexOf(e.key.toUpperCase());
        if (i >= 0 && i < v.choices.length) { e.preventDefault(); toggle(i); }
        if (e.key === 'Enter' && !e.target.closest('button')) { e.preventDefault(); submit(); }
      });
      if (prior) submit(prior.answer);
    } else if (type === 'num') {
      const input = el('input', { type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Your answer' + (q.unit ? ' in ' + q.unit : ''), placeholder: 'e.g. 12.5 or 1500*8/1e6' });
      const check = el('button', { class: 'btn', type: 'button' }, 'Check');
      body.appendChild(el('div', { class: 'answer-input' }, input, q.unit ? el('span', { class: 'unit' }, q.unit) : null, check));
      body.appendChild(el('p', { class: 'kbd-hint', style: { margin: '-8px 0 12px', fontSize: '0.85rem', color: 'var(--ink-3)' } }, 'Arithmetic is allowed: 8*1000/2e6. Answers within 2% count.'));
      function submit(pre) {
        const raw = pre !== undefined ? pre : input.value;
        const v = evalNumber(raw);
        if (pre === undefined && !isFinite(v)) { input.focus(); fb.replaceChildren(el('div', { class: 'feedback neutral' }, el('p', { class: 'why' }, 'Enter a number (arithmetic like 1500*8/1e6 works).'))); return; }
        input.value = raw; input.disabled = true; check.hidden = true;
        const ok = numOK(v, q);
        finishQ(ok ? 1 : 0, raw, verdict(ok ? 1 : 0, html('p', null, `Expected **${fmtNum(q.a)}${q.unit ? ' ' + q.unit : ''}**${isFinite(v) ? `; you entered ${fmtNum(v)}` : ''}.`)));
      }
      check.addEventListener('click', () => submit());
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (!S.results[S.i]) submit(); else next(); } });
      hint.textContent = 'Enter: check';
      setKeys(e => { if (S.results[S.i] && e.key === 'Enter' && e.target !== input) { e.preventDefault(); next(); } });
      if (prior) submit(prior.answer); else setTimeout(() => input.focus(), 0);
    } else if (type === 'short') {
      const ta = el('textarea', { class: 'short-input', 'aria-label': 'Your answer', placeholder: 'Answer from memory, in your own words. Then check against the model answer.' });
      const check = el('button', { class: 'btn', type: 'button' }, 'Check my answer');
      body.append(ta, el('div', { class: 'btn-row', style: { marginBottom: '8px' } }, check));
      let revealed = false;
      function reveal(preText) {
        revealed = true;
        if (preText !== undefined) ta.value = preText;
        ta.readOnly = true; check.hidden = true;
        const hits = keyHits(ta.value, q.keys || []);
        const hitN = hits.filter(h => h.hit).length;
        const panel = el('div', null,
          el('div', { class: 'model' }, el('h3', null, 'Model answer'), html('div', null, q.a)),
          el('p', { style: { margin: '0 0 6px', fontWeight: 700, fontSize: '0.95rem' } }, ta.value.trim() ? `Key ideas you mentioned: ${hitN} of ${hits.length}` : 'Key ideas to include:'),
          el('div', { class: 'keys' }, hits.map(h => el('span', { class: 'key-idea ' + (h.hit ? 'hit' : 'miss') }, h.label))));
        if (S.results[S.i]) {
          panel.appendChild(verdict(S.results[S.i].score));
          fb.replaceChildren(panel);
          nextBtn.hidden = false;
          return;
        }
        const grade = el('div', { class: 'selfgrade' }, el('p', null, 'How did you do?'),
          el('button', { class: 'btn bad small', type: 'button', onclick: () => grade_(0) }, 'Missed it'),
          el('button', { class: 'btn warn small', type: 'button', onclick: () => grade_(0.5) }, 'Partly'),
          el('button', { class: 'btn good small', type: 'button', onclick: () => grade_(1) }, 'Got it'));
        panel.appendChild(grade);
        if (q.why && q.why !== q.a) panel.appendChild(html('p', 'why', q.why));
        fb.replaceChildren(panel);
        grade.querySelector('.good').focus();
        hint.textContent = 'Keys: 1 missed, 2 partly, 3 got it';
        function grade_(score) {
          const kind = score === 1 ? 'good' : score > 0 ? 'part' : 'bad';
          grade.replaceWith(el('div', { class: 'feedback ' + kind }, el('h3', null, score === 1 ? 'Marked as known' : score > 0 ? 'Marked as partly known' : 'Marked as missed: it will come back in Review')));
          S.results[S.i] = { score, answer: ta.value };
          store.recordAnswer(q.id, score);
          persist();
          nextBtn.hidden = false; nextBtn.focus();
          hint.textContent = 'Enter: next';
        }
        setKeys(e => {
          if (S.results[S.i]) { if (e.key === 'Enter') { e.preventDefault(); next(); } return; }
          if (['1', '2', '3'].includes(e.key) && e.target !== ta) { e.preventDefault(); grade_([0, 0.5, 1][+e.key - 1]); }
        });
      }
      check.addEventListener('click', () => reveal());
      ta.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); if (!revealed) reveal(); } });
      hint.textContent = 'Ctrl+Enter: check';
      setKeys(() => {});
      if (prior) reveal(prior.answer); else setTimeout(() => ta.focus(), 0);
    } else if (type === 'order') {
      let order = shuffle(q.items.map((_, i) => i));
      if (order.every((v, i) => v === i) && order.length > 1) order = order.slice(1).concat(order[0]);
      if (prior) order = prior.answer.slice();
      const list = el('ol', { class: 'order-list' });
      const check = el('button', { class: 'btn', type: 'button' }, 'Check order');
      body.append(el('p', { class: 'kbd-hint', style: { margin: '-8px 0 10px', fontSize: '0.9rem', color: 'var(--ink-2)' } }, 'Use the arrows (or drag) to put the steps in order, first at the top.'), list, el('div', { class: 'btn-row', style: { marginBottom: '8px' } }, check));
      let dragFrom = null;
      function focusMove(pos, dir) {
        const btns = list.children[pos].querySelectorAll('.moves button');
        const pref = dir === 'up' ? btns[0] : btns[1];
        const alt = dir === 'up' ? btns[1] : btns[0];
        (pref && !pref.disabled ? pref : alt).focus();
      }
      function draw(locked) {
        list.replaceChildren(...order.map((itemIdx, pos) => {
          const up = el('button', { type: 'button', 'aria-label': 'Move up', disabled: locked || pos === 0, html: '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 3l5 6H2z" fill="currentColor"/></svg>' });
          const down = el('button', { type: 'button', 'aria-label': 'Move down', disabled: locked || pos === order.length - 1, html: '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 11L2 5h10z" fill="currentColor"/></svg>' });
          up.addEventListener('click', () => { [order[pos - 1], order[pos]] = [order[pos], order[pos - 1]]; draw(); focusMove(pos - 1, 'up'); });
          down.addEventListener('click', () => { [order[pos + 1], order[pos]] = [order[pos], order[pos + 1]]; draw(); focusMove(pos + 1, 'down'); });
          const li = el('li', { class: 'order-item', draggable: locked ? null : 'true' },
            el('span', { class: 'pos' }, String(pos + 1)), html('span', null, q.items[itemIdx]),
            el('span', { class: 'moves' }, up, down));
          if (!locked) {
            li.addEventListener('dragstart', () => { dragFrom = pos; li.classList.add('dragging'); });
            li.addEventListener('dragend', () => li.classList.remove('dragging'));
            li.addEventListener('dragover', e => e.preventDefault());
            li.addEventListener('drop', e => { e.preventDefault(); if (dragFrom === null || dragFrom === pos) return; const [m] = order.splice(dragFrom, 1); order.splice(pos, 0, m); dragFrom = null; draw(); });
          }
          return li;
        }));
      }
      draw(false);
      function submit() {
        draw(true);
        check.hidden = true;
        let right = 0;
        [...list.children].forEach((li, pos) => {
          const ok = order[pos] === pos;
          if (ok) right++;
          li.classList.add(ok ? 'right' : 'wrong');
          if (!ok) li.querySelector('.moves').replaceChildren(el('span', { class: 'should' }, `belongs at ${order[pos] + 1}`));
          else li.querySelector('.moves').replaceChildren();
        });
        const n = order.length;
        const score = right === n ? 1 : right / n >= 0.6 ? 0.5 : 0;
        const correctList = el('ol', { style: { margin: '6px 0 10px' } }, q.items.map(x => html('li', null, x)));
        finishQ(score, order.slice(), verdict(score, el('div', null, el('p', { style: { margin: 0 } }, `${right} of ${n} in the right place. Correct order:`), correctList)));
      }
      check.addEventListener('click', () => submit());
      hint.textContent = 'Enter: check';
      setKeys(e => {
        if (S.results[S.i]) { if (e.key === 'Enter') { e.preventDefault(); next(); } return; }
        if (e.key === 'Enter' && !(e.target.closest && e.target.closest('.order-item button'))) { e.preventDefault(); submit(); }
      });
      if (prior) submit();
    }

    // global keys: F to flag
    const inner = keyHandler;
    setKeys(e => {
      const fIsChoice = q.type === 'tf' || ((q.type === 'multi' || q.type === 'mc') && q.choices.length >= 6);
      if ((e.key === 'f' || e.key === 'F') && !fIsChoice && !/^(INPUT|TEXTAREA)$/.test(e.target.tagName) && !e.ctrlKey && !e.metaKey) { flagBtn.click(); return; }
      if (inner) inner(e);
    });

    main.replaceChildren(el('div', { class: 'quiz-run' }, strip, legend, card, nav));
    window.scrollTo(0, 0);
  }

  /* ---------- results ---------- */
  function renderResults() {
    if (!S) S = restore();
    if (!S) { location.replace('#/quiz'); return; }
    NET.setTitle('Quiz results');
    setKeys(null);
    const answered = S.qs.map((q, i) => ({ q, r: S.results[i] })).filter(x => x.r);
    const total = answered.length;
    const score = answered.reduce((a, x) => a + x.r.score, 0);
    const pct = total ? Math.round((score / total) * 100) : 0;
    const by = [1, 2, 3].map(d => {
      const xs = answered.filter(x => x.q.d === d);
      return { d, n: xs.length, s: xs.reduce((a, x) => a + x.r.score, 0) };
    });
    const missed = answered.filter(x => x.r.score < 1);
    const head = el('div', { class: 'results-head' },
      el('div', { class: 'big-score' }, pct + '%', el('small', null, ` ${fmtNum(score)}/${total}`)),
      el('div', null,
        el('p', { style: { margin: '0 0 12px', color: 'var(--ink-2)' } }, total < S.qs.length ? `You answered ${total} of ${S.qs.length} questions${S.label ? ' in ' + S.label : ''}.` : `${S.label || 'Quiz'} complete.`),
        el('div', { class: 'breakdown' }, by.map(b => el('div', null, el('b', null, b.n ? `${fmtNum(b.s)}/${b.n}` : '–'), el('span', null, NET.bars(b.d), ' ', DIFF[b.d]))))));
    const actions = el('div', { class: 'btn-row', style: { margin: '6px 0 26px' } },
      missed.length ? el('button', { class: 'btn', type: 'button', onclick: () => start(missed.map(x => x.q), 'Retry missed', S.back) }, `Retry the ${missed.length} you missed`) : null,
      el('a', { class: 'btn secondary', href: '#/quiz' }, 'New quiz'),
      S.back ? el('a', { class: 'btn ghost', href: S.back }, 'Back to the guide') : null,
      el('a', { class: 'btn ghost', href: '#/review' }, 'Review hub'));
    const list = el('div', { class: 'missed-list' });
    missed.forEach(({ q, r }) => {
      const sec = NET.byId[q.section];
      let ans;
      if (q.type === 'mc') ans = `**Answer:** ${q.choices[q.a]}`;
      else if (q.type === 'tf') ans = `**Answer:** ${q.a ? 'True' : 'False'}`;
      else if (q.type === 'multi') ans = `**Answer:** ${q.a.map(i => q.choices[i]).join('; ')}`;
      else if (q.type === 'num') ans = `**Answer:** ${fmtNum(q.a)} ${q.unit || ''} (you: ${r.answer})`;
      else if (q.type === 'short') ans = `**Model answer:** ${q.a}`;
      else if (q.type === 'order') ans = `**Order:** ${q.items.map((x, i) => `${i + 1}. ${x}`).join('  ')}`;
      list.appendChild(el('div', { class: 'missed-item' + (r.score > 0 ? ' part' : '') },
        el('div', { class: 'qmeta', style: { marginBottom: 0 } }, sec ? el('span', { class: 'sec-name u' + sec.unit }, el('span', { class: 'unit-dot' }), sec.short) : null, el('span', null, NET.bars(q.d), ' ', DIFF[q.d]), NET.srcTag(q.src)),
        q.ctx ? html('p', 'why', q.ctx) : null,
        html('p', 'q', q.q), html('p', 'ans', ans), html('p', 'why', q.why)));
    });
    main.replaceChildren(el('div', { class: 'quiz-run', style: { maxWidth: '900px' } },
      el('header', { class: 'page-head' }, el('h1', null, 'Results')), head, actions,
      missed.length ? el('h2', { style: { fontFamily: 'var(--font-display)', fontSize: '1.7rem', margin: '0 0 4px' } }, 'What you missed') : el('p', null, 'Nothing missed. Try a harder mix or another section.'),
      list));
    window.scrollTo(0, 0);
  }

  /* ---------- routing entry ---------- */
  function quickStart(params) {
    const mode = params.get('mode');
    const ids = (params.get('s') || '').split(',').filter(id => NET.byId[id]);
    let qs, label, back = null;
    if (mode === 'missed' || mode === 'flagged') {
      let pool = ids.length ? ids.flatMap(id => NET.questions[id] || []) : NET.allQuestions();
      pool = pool.filter(q => { const r = store.q(q.id); return r && (mode === 'missed' ? r.n && r.last < 1 : r.flag); });
      qs = groupByCtx(shuffle(pool)).sort((a, b) => Math.max(...a.map(q => q.d)) - Math.max(...b.map(q => q.d))).flat();
      label = mode === 'missed' ? 'Missed questions' : 'Flagged questions';
    } else {
      const o = Object.assign({}, defaults, { sections: ids, count: 'all', focus: 'random', order: 'ramp' });
      qs = buildSession(o);
      label = ids.length === 1 ? NET.byId[ids[0]].title : 'Quiz';
      if (ids.length === 1) back = '#/guide/' + ids[0];
    }
    if (!start(qs, label, back)) {
      main.replaceChildren(NET.emptyState(mode ? 'Nothing to quiz' : 'No questions loaded', mode === 'missed' ? 'You have no missed questions here.' : mode === 'flagged' ? 'Flag questions during a quiz to collect them here.' : 'The quiz data for this section did not load.',
        el('a', { class: 'btn', href: '#/quiz' }, 'Build a quiz')));
    }
  }

  NET.quiz = {
    session: () => S, // used by tools/ smoke tests
    route(sub, params) {
      setKeys(null);
      if (sub === 'start') quickStart(params);
      else if (sub === 'run') renderRun();
      else if (sub === 'results') renderResults();
      else renderSetup(params);
    },
  };
})();
