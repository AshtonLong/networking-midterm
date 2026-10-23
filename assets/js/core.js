/* Core registry, formatting helpers and progress store.
   Data files call NET.addSection / NET.addQuestions; games call NET.addGame. */
window.NET = (function () {
  const sections = [];
  const byId = {};
  const questions = {};
  const games = [];
  const gameById = {};

  const UNITS = {
    1: { name: 'Foundations', chapter: 'Chapter 1', cls: 'u1' },
    2: { name: 'Application layer', chapter: 'Chapter 2', cls: 'u2' },
    3: { name: 'Transport layer', chapter: 'Chapter 3', cls: 'u3' },
  };

  function addSection(s) {
    if (byId[s.id]) return;
    byId[s.id] = s;
    sections.push(s);
    sections.sort((a, b) => a.order - b.order);
  }
  function addQuestions(id, qs) {
    if (!questions[id]) questions[id] = [];
    qs.forEach(q => { q.section = id; questions[id].push(q); });
  }
  function addGame(g) {
    if (gameById[g.id]) return;
    gameById[g.id] = g;
    games.push(g);
  }
  function allQuestions() {
    return sections.flatMap(s => questions[s.id] || []);
  }

  /* ---------- DOM helper ---------- */
  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === undefined || v === null || v === false) continue;
        if (k === 'class') n.className = v;
        else if (k === 'html') n.innerHTML = v;
        else if (k === 'text') n.textContent = v;
        else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
        else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
        else if (v === true) n.setAttribute(k, '');
        else n.setAttribute(k, v);
      }
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid === undefined || kid === null || kid === false) continue;
      n.appendChild(typeof kid === 'string' || typeof kid === 'number' ? document.createTextNode(String(kid)) : kid);
    }
    return n;
  }

  /* ---------- inline markup ---------- */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  // mode: 'guide' renders [[x]] as cloze spans; anything else renders them as plain key terms.
  function fmt(s, mode) {
    if (s === undefined || s === null) return '';
    let t = esc(s);
    const codes = [];
    t = t.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
    t = t.replace(/\[\[(.+?)\]\]/g, (_, c) => mode === 'guide'
      ? `<span class="cloze" tabindex="0" role="button" aria-label="Hidden term, press to reveal">${c}</span>`
      : `<span class="term">${c}</span>`);
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/_\{([^}]*)\}/g, '<sub>$1</sub>');
    t = t.replace(/\^\{([^}]*)\}/g, '<sup>$1</sup>');
    t = t.replace(/\\n|\n/g, '<br>');
    t = t.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[+i]}</code>`);
    return t;
  }
  function html(tag, cls, s, mode) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    n.innerHTML = fmt(s, mode);
    return n;
  }
  function plain(s) {
    return String(s || '').replace(/\[\[(.+?)\]\]/g, '$1').replace(/\*\*|`/g, '').replace(/_\{([^}]*)\}/g, '$1').replace(/\^\{([^}]*)\}/g, '^$1');
  }

  /* ---------- random helpers ---------- */
  function shuffle(a) {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  }
  const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  function round(x, sig) {
    if (!isFinite(x) || x === 0) return x;
    const p = sig || 4;
    return Number(x.toPrecision(p));
  }

  /* ---------- progress store (localStorage) ---------- */
  const KEY = 'topdown-cram-v1';
  let state;
  try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { state = {}; }
  state.q = state.q || {};          // question id -> { n, c, last, t, flag }
  state.read = state.read || {};    // section id -> timestamp when guide marked read
  state.cards = state.cards || {};  // flashcard id -> box (0..4)
  state.games = state.games || {};  // game id -> { best, plays }
  state.settings = state.settings || {};
  state.last = state.last || {};    // last visited guide section etc.
  let saveTimer;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked */ }
    }, 120);
  }
  const store = {
    get state() { return state; },
    save,
    recordAnswer(id, score) {   // score: 1 correct, 0.5 partial, 0 wrong
      const r = state.q[id] || { n: 0, c: 0 };
      r.n++; r.c += score; r.last = score; r.t = Date.now();
      state.q[id] = r; save();
    },
    toggleFlag(id) {
      const r = state.q[id] || { n: 0, c: 0 };
      r.flag = !r.flag; state.q[id] = r; save(); return r.flag;
    },
    q(id) { return state.q[id]; },
    markRead(id, on) { if (on) state.read[id] = Date.now(); else delete state.read[id]; save(); },
    isRead(id) { return !!state.read[id]; },
    setCard(id, box) { state.cards[id] = box; save(); },
    card(id) { return state.cards[id] || 0; },
    gamePlayed(id, score) {
      const g = state.games[id] || { best: 0, plays: 0 };
      g.plays++;
      if (typeof score === 'number' && score > g.best) g.best = score;
      state.games[id] = g; save(); return g;
    },
    game(id) { return state.games[id] || { best: 0, plays: 0 }; },
    setting(k, v) { if (v === undefined) return state.settings[k]; state.settings[k] = v; save(); },
    reset() { state = { q: {}, read: {}, cards: {}, games: {}, settings: state.settings, last: {} }; save(); },
  };

  // mastery: sum of last scores / number of questions in section
  function mastery(id) {
    const qs = questions[id] || [];
    if (!qs.length) return { pct: 0, answered: 0, total: 0, wrong: 0 };
    let sum = 0, answered = 0, wrong = 0;
    for (const q of qs) {
      const r = state.q[q.id];
      if (r && r.n) { answered++; sum += r.last; if (r.last < 1) wrong++; }
    }
    return { pct: sum / qs.length, answered, total: qs.length, wrong };
  }
  function ledState(id) {
    const m = mastery(id);
    if (!m.answered) return 'off';
    return m.pct >= 0.8 ? 'green' : 'amber';
  }

  return {
    sections, byId, questions, games, gameById, UNITS,
    addSection, addQuestions, addGame, allQuestions,
    el, esc, fmt, html, plain, shuffle, rand, pick, round,
    store, mastery, ledState,
  };
})();
