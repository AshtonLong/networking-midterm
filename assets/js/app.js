/* App shell: routing, map (patch panel), guide renderer, games pages, review hub, search. */
(function () {
  const { el, fmt, html, esc, plain, store, UNITS } = NET;
  const main = document.getElementById('main');
  let activeGame = null; // { kit, cleanup }

  /* ---------- theme ---------- */
  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    const b = document.getElementById('theme-btn');
    if (b) b.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  const savedTheme = store.setting('theme');
  applyTheme(savedTheme || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  document.getElementById('theme-btn').addEventListener('click', () => {
    const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(t); store.setting('theme', t);
  });

  /* ---------- helpers ---------- */
  const pad = n => String(n).padStart(2, '0');
  const sectionNum = s => pad(NET.sections.indexOf(s) + 1);
  const unitCls = u => 'u' + u;
  function srcTag(src) {
    if (src === 'cheat') return el('span', { class: 'src', title: 'On the lecture cheat sheet' }, 'Lecture');
    if (src === 'both') return el('span', { class: 'src both', title: 'Lecture cheat sheet, with textbook depth' }, 'Lecture + textbook');
    if (src === 'text') return el('span', { class: 'src text', title: 'Textbook only: not on the cheat sheet' }, 'Textbook only');
    const m = /^ch(\d)-([RP])(\d+)([a-z]?)$/.exec(src || '');
    if (m) return el('span', { class: 'src ex', title: `Textbook chapter ${m[1]} ${m[2] === 'R' ? 'review question' : 'problem'} ${m[2]}${m[3]}` }, `Textbook ${m[2]}${m[3]}${m[4]} (ch. ${m[1]})`);
    return el('span', { class: 'src' }, src || '');
  }
  NET.srcTag = srcTag;
  function bars(d) {
    const label = ['', 'Easy', 'Medium', 'Hard'][d] || '';
    return el('span', { class: 'bars d' + d, role: 'img', 'aria-label': label + ' difficulty', title: label }, el('i'), el('i'), el('i'));
  }
  NET.bars = bars;
  function led(id) { return el('span', { class: 'led ' + NET.ledState(id), title: ledTitle(id) }); }
  function ledTitle(id) {
    const m = NET.mastery(id);
    if (!m.total) return 'No questions loaded';
    if (!m.answered) return `Not started: ${m.total} questions`;
    return `${Math.round(m.pct * 100)}% mastered, ${m.answered} of ${m.total} answered`;
  }
  function toast(msg) {
    const t = el('div', { class: 'toast', role: 'status' }, msg);
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }
  NET.toast = toast;
  function setTitle(t) { document.title = t ? `${t} | Top-down cram` : 'Top-down cram: networking midterm'; }
  function updateNav(tab) {
    document.querySelectorAll('.tab').forEach(a => {
      if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    const missed = NET.allQuestions().filter(q => { const r = store.q(q.id); return r && r.n && r.last < 1; }).length;
    const c = document.getElementById('review-count');
    if (c) { c.textContent = missed; c.hidden = !missed; }
  }

  /* ---------- python highlighting ---------- */
  function highlightPython(code) {
    const re = /(#[^\n]*)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")|\b(from|import|while|for|in|if|else|elif|True|False|None|def|return|as|with|not|and|or|break)\b|\b(\d+)\b|\b([A-Za-z_]\w*)(?=\()/g;
    let out = '', last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      const [tok, com, str, kw, num, fn] = m;
      if (com) out += `<span class="com">${esc(tok)}</span>`;
      else if (str) out += `<span class="str">${esc(tok)}</span>`;
      else if (kw) out += `<span class="kw">${esc(tok)}</span>`;
      else if (num) out += `<span class="num">${esc(tok)}</span>`;
      else if (fn) out += `<span class="fn">${esc(tok)}</span>`;
      last = m.index + tok.length;
    }
    return out + esc(code.slice(last));
  }
  NET.highlightPython = highlightPython;

  /* ---------- block renderer (guide) ---------- */
  function renderBlock(b, mode) {
    const m = mode || 'guide';
    if ('p' in b) return html('p', null, b.p, m);
    if ('list' in b) return el('ul', null, b.list.map(x => html('li', null, x, m)));
    if ('steps' in b) {
      const wrap = el('div');
      if (b.title) wrap.appendChild(html('p', 'steps-title', b.title, m));
      wrap.appendChild(el('ol', { class: 'steps' }, b.steps.map(x => html('li', null, x, m))));
      return wrap;
    }
    if ('def' in b) return el('dl', { class: 'def' }, html('dt', null, b.def, m), html('dd', null, b.text, m));
    if ('formula' in b) {
      const box = el('div', { class: 'formula' }, html('div', 'formula-main', b.formula, m));
      if (b.where && b.where.length) {
        box.appendChild(el('div', { class: 'formula-where' }, b.where.flatMap(([s, d]) => [html('span', 'sym', s, m), html('span', null, d, m)])));
      }
      if (b.note) box.appendChild(html('div', 'formula-note', b.note, m));
      return box;
    }
    if ('table' in b) {
      const t = b.table;
      const tbl = el('table', { class: 'data' },
        el('thead', null, el('tr', null, t.head.map(h => html('th', null, h, m)))),
        el('tbody', null, t.rows.map(r => el('tr', null, r.map((c, i) => {
          const cell = html(i === 0 ? 'th' : 'td', null, c, m);
          if (i === 0) cell.setAttribute('scope', 'row');
          return cell;
        })))));
      const wrap = el('div', { class: 'table-wrap' }, tbl);
      if (b.caption) wrap.appendChild(html('div', 'caption', b.caption, m));
      return wrap;
    }
    if ('trap' in b) {
      const d = el('div', { class: 'trap' }, el('b', { class: 'label' }, 'Exam trap'));
      d.appendChild(html('div', null, b.trap, m));
      return d;
    }
    if ('example' in b) {
      const a = html('div', 'example-a', b.example.a, m);
      a.hidden = true;
      const btn = el('button', { class: 'btn secondary small', type: 'button', 'aria-expanded': 'false' }, 'Show solution');
      btn.addEventListener('click', () => {
        a.hidden = !a.hidden;
        btn.textContent = a.hidden ? 'Show solution' : 'Hide solution';
        btn.setAttribute('aria-expanded', String(!a.hidden));
      });
      const q = el('div', { class: 'example-q' }, el('b', { class: 'label' }, 'Worked example: try it first'));
      q.appendChild(html('div', null, b.example.q, m));
      return el('div', { class: 'example' }, q, btn, a);
    }
    if ('code' in b) {
      const frag = el('div');
      frag.appendChild(el('pre', { class: 'code', html: highlightPython(b.code) }));
      if (b.caption) frag.appendChild(html('p', 'code-cap', b.caption, m));
      return frag;
    }
    if ('diagram' in b) {
      const svg = NET.diagram ? NET.diagram(b.diagram) : null;
      if (!svg) return el('span');
      return el('figure', { class: 'figure' }, svg.node, svg.caption ? html('figcaption', null, svg.caption) : null);
    }
    if ('game' in b) {
      const g = NET.gameById[b.game];
      if (!g) return el('span');
      return el('div', { class: 'game-link' },
        el('p', null, el('b', null, 'Play: ' + g.title), html('span', null, b.text || g.blurb)),
        el('a', { class: 'btn secondary small', href: '#/games/' + g.id }, 'Open game'));
    }
    return el('span');
  }
  NET.renderBlock = renderBlock;

  /* ---------- map ---------- */
  function renderMap() {
    setTitle('');
    updateNav('map');
    const all = NET.allQuestions();
    const answered = all.filter(q => { const r = store.q(q.id); return r && r.n; });
    const missed = answered.filter(q => store.q(q.id).last < 1).length;
    const masteryAll = all.length ? all.reduce((s, q) => s + ((store.q(q.id) || {}).last || 0), 0) / all.length : 0;
    const lastId = store.state.last.guide;
    const lastSec = lastId && NET.byId[lastId];

    const hero = el('section', { class: 'map-hero' },
      el('div', null,
        el('h1', null, 'Top-down cram', el('span', { class: 'sub' }, 'Networking midterm: Kurose & Ross chapters 1–3 and the lecture cheat sheet'))),
      el('div', null,
        el('p', null, `${NET.sections.length} sections. Read each guide with the key terms hidden, prove it on ${all.length} quiz questions that climb from recall to textbook problems, then lock it in with ${NET.games.length} games.`),
        el('div', { class: 'stats' },
          el('div', { class: 'stat' }, el('b', null, String(answered.length)), el('span', null, 'questions answered')),
          el('div', { class: 'stat' }, el('b', null, Math.round(masteryAll * 100) + '%'), el('span', null, 'course mastery')),
          el('div', { class: 'stat' }, el('b', null, String(missed)), el('span', null, 'waiting for review'))),
        el('div', { class: 'btn-row' },
          el('a', { class: 'btn', href: '#/quiz' }, 'Start a quiz'),
          missed ? el('a', { class: 'btn secondary', href: '#/review' }, `Review ${missed} missed`) : null,
          el('a', { class: 'btn ghost', href: '#/guide/' + (lastSec ? lastSec.id : (NET.sections[0] || {}).id) }, lastSec ? `Continue: ${lastSec.short}` : 'Start reading'))));

    const plate = el('div', { class: 'panel-plate', role: 'navigation', 'aria-label': 'Sections' });
    let i = 0;
    [1, 2, 3].forEach(u => {
      const secs = NET.sections.filter(s => s.unit === u);
      if (!secs.length) return;
      plate.appendChild(el('div', { class: 'panel-row' },
        el('div', { class: 'row-label ' + unitCls(u) }, el('b', null, UNITS[u].name), el('span', null, UNITS[u].chapter + `, ${secs.length} sections`)),
        el('div', { class: 'ports' }, secs.map(s => {
          const m = NET.mastery(s.id);
          return el('a', {
            class: 'port ' + unitCls(u), href: '#/guide/' + s.id, style: { '--i': i++ },
            'aria-label': `${sectionNum(s)} ${s.title}. ${ledTitle(s.id)}. ${store.isRead(s.id) ? 'Guide read.' : 'Guide not read yet.'}`,
          },
            el('span', { class: 'port-num' }, sectionNum(s)),
            el('span', { class: 'led ' + NET.ledState(s.id) }),
            el('span', { class: 'jack' + (store.isRead(s.id) ? ' plugged' : '') }),
            el('span', { class: 'port-label' }, s.short),
            m.total ? null : null);
        }))));
    });
    const firstVisit = !sessionStorage.getItem('booted');
    if (firstVisit) { plate.classList.add('boot'); sessionStorage.setItem('booted', '1'); }

    const legend = el('div', { class: 'panel-legend' },
      el('span', null, el('span', { class: 'led off' }), 'Not quizzed yet'),
      el('span', null, el('span', { class: 'led amber' }), 'Quizzed, under 80%'),
      el('span', null, el('span', { class: 'led green' }), '80% or better'),
      el('span', null, el('span', { class: 'legend-jack' }), 'Cable in: guide marked as read'));

    const next = el('section', { class: 'map-next' },
      el('div', { class: 'next-card' }, el('h2', null, 'Read with the answers hidden'),
        el('p', null, 'Turn on recall mode in any guide: key terms become blanks. Say the answer, then click to check.'),
        el('a', { class: 'btn secondary small', href: '#/guide/' + ((NET.sections[0] || {}).id || '') }, 'Open the first guide')),
      el('div', { class: 'next-card' }, el('h2', null, 'Quiz from easy to hard'),
        el('p', null, 'Every section has multiple choice, written answers, calculations and ordering, including the textbook’s own review questions and problems.'),
        el('a', { class: 'btn secondary small', href: '#/quiz' }, 'Build a quiz')),
      el('div', { class: 'next-card' }, el('h2', null, 'Re-drill what you missed'),
        el('p', null, 'Missed questions queue up in Review, next to flashcards, the formula sheet, every exam trap and every comparison table.'),
        el('a', { class: 'btn secondary small', href: '#/review' }, 'Open review')));

    main.replaceChildren(hero, plate, legend, next);
  }

  /* ---------- guide ---------- */
  function sideNav(currentId) {
    const nav = el('nav', { class: 'side-nav', 'aria-label': 'Guide sections' });
    [1, 2, 3].forEach(u => {
      const secs = NET.sections.filter(s => s.unit === u);
      if (!secs.length) return;
      nav.appendChild(el('h2', { class: unitCls(u) }, el('span', { class: 'unit-dot' }), UNITS[u].name));
      nav.appendChild(el('ol', null, secs.map(s => el('li', null,
        el('a', { href: '#/guide/' + s.id, 'aria-current': s.id === currentId ? 'page' : null, title: s.title },
          el('span', { class: 'n' }, sectionNum(s)), el('span', null, s.short), led(s.id))))));
    });
    const select = el('select', { class: 'side-select', 'aria-label': 'Jump to section', onchange: e => { location.hash = '#/guide/' + e.target.value; } },
      NET.sections.map(s => el('option', { value: s.id, selected: s.id === currentId }, `${sectionNum(s)}  ${s.title}`)));
    return { nav, select };
  }

  function renderGuide(id, topicIdx) {
    updateNav('guide');
    const s = NET.byId[id] || NET.byId[store.state.last.guide] || NET.sections[0];
    if (!s) { main.replaceChildren(emptyState('No guide content loaded', 'The data files in data/guide/ did not load.')); return; }
    if (s.id !== id) { location.replace('#/guide/' + s.id); return; }
    store.state.last.guide = s.id; store.save();
    setTitle(s.title);
    const idx = NET.sections.indexOf(s);
    const prev = NET.sections[idx - 1], nxt = NET.sections[idx + 1];
    const recallOn = !!store.setting('recall');

    const article = el('article', { class: 'guide' + (recallOn ? ' recall-mode' : '') });
    const countEl = el('span', { class: 'reveal-count', 'aria-live': 'polite' });
    const recallToggle = el('input', { type: 'checkbox', checked: recallOn });
    const readToggle = el('input', { type: 'checkbox', checked: store.isRead(s.id) });
    const revealAll = el('button', { class: 'btn ghost small', type: 'button', hidden: !recallOn }, 'Reveal all');
    const hideAll = el('button', { class: 'btn ghost small', type: 'button', hidden: !recallOn }, 'Hide again');

    function updateCount() {
      const all = article.querySelectorAll('.cloze');
      const shown = article.querySelectorAll('.cloze.shown');
      countEl.textContent = article.classList.contains('recall-mode') ? `${shown.length} of ${all.length} revealed` : '';
    }
    recallToggle.addEventListener('change', () => {
      article.classList.toggle('recall-mode', recallToggle.checked);
      store.setting('recall', recallToggle.checked);
      revealAll.hidden = hideAll.hidden = !recallToggle.checked;
      updateCount();
    });
    readToggle.addEventListener('change', () => { store.markRead(s.id, readToggle.checked); toast(readToggle.checked ? 'Marked as read' : 'Marked as unread'); });
    revealAll.addEventListener('click', () => { article.querySelectorAll('.cloze').forEach(c => c.classList.add('shown')); updateCount(); });
    hideAll.addEventListener('click', () => { article.querySelectorAll('.cloze').forEach(c => c.classList.remove('shown')); updateCount(); });
    article.addEventListener('click', e => {
      const c = e.target.closest('.cloze');
      if (c && article.classList.contains('recall-mode')) { c.classList.add('shown'); updateCount(); }
    });
    article.addEventListener('keydown', e => {
      const c = e.target.closest && e.target.closest('.cloze');
      if (c && (e.key === 'Enter' || e.key === ' ') && article.classList.contains('recall-mode')) { e.preventDefault(); c.classList.add('shown'); updateCount(); }
    });

    const m = NET.mastery(s.id);
    article.append(
      el('header', { class: 'guide-head' },
        el('div', { class: 'guide-num ' + unitCls(s.unit) }, el('span', { class: 'unit-dot' }), `Section ${sectionNum(s)}`, el('span', null, UNITS[s.unit].name)),
        el('h1', null, s.title),
        el('ul', { class: 'meta' },
          s.cheat ? el('li', null, 'Lecture ', el('b', null, s.cheat)) : el('li', null, el('b', null, 'Not on the cheat sheet')),
          el('li', null, 'Textbook ', el('b', null, s.text)),
          el('li', null, el('b', null, (s.minutes || 20) + ' min'), ' to read'),
          el('li', null, el('b', null, String(m.total)), ' questions', m.answered ? `, ${Math.round(m.pct * 100)}% mastered` : '')),
        el('div', { class: 'guide-tools' },
          el('label', { class: 'switch' }, recallToggle, 'Recall mode: hide key terms'),
          revealAll, hideAll, countEl,
          el('label', { class: 'switch', style: { marginLeft: 'auto' } }, readToggle, 'I’ve read this'))),
      html('p', 'lead', s.summary, 'guide'));

    if (s.mustKnow && s.mustKnow.length) {
      article.appendChild(el('section', { class: 'mustknow', 'aria-labelledby': 'mk-h' },
        el('h2', { id: 'mk-h' }, 'If you remember nothing else'),
        el('ul', null, s.mustKnow.map(x => html('li', null, x, 'guide')))));
    }

    (s.topics || []).forEach((t, i) => {
      const sec = el('section', { class: 'topic', id: `topic-${i + 1}` },
        el('div', { class: 'topic-head' }, html('h2', null, t.title), srcTag(t.src)));
      t.blocks.forEach(b => sec.appendChild(renderBlock(b, 'guide')));
      article.appendChild(sec);
    });

    // games that teach this section, not already linked inline
    const inline = new Set((s.topics || []).flatMap(t => t.blocks.filter(b => b.game).map(b => b.game)));
    const extraGames = NET.games.filter(g => (g.sections || []).includes(s.id) && !inline.has(g.id));
    if (extraGames.length) {
      const sec = el('section', { class: 'topic' }, el('div', { class: 'topic-head' }, el('h2', null, 'Practice in a game')));
      extraGames.forEach(g => sec.appendChild(renderBlock({ game: g.id, text: g.blurb })));
      article.appendChild(sec);
    }

    if (s.recall && s.recall.length) {
      const rec = el('section', { class: 'recall', id: 'recall' },
        el('h2', null, 'Close the book'),
        el('p', null, 'Answer each out loud or on paper before you reveal it.'));
      s.recall.forEach(r => {
        const a = html('div', 'a', r.a);
        a.hidden = true;
        const b = el('button', { class: 'btn secondary small', type: 'button', 'aria-expanded': 'false' }, 'Reveal');
        b.addEventListener('click', () => { a.hidden = !a.hidden; b.textContent = a.hidden ? 'Reveal' : 'Hide'; b.setAttribute('aria-expanded', String(!a.hidden)); });
        rec.appendChild(el('div', { class: 'recall-item' }, html('div', 'q', r.q), b, a));
      });
      rec.appendChild(el('p', { style: { marginTop: '14px' } }, el('a', { class: 'btn secondary small', href: '#/review/cards?s=' + s.id }, 'Drill these as flashcards')));
      article.appendChild(rec);
    }

    article.appendChild(el('div', { class: 'cta-band' },
      el('p', null, `Now prove it: ${m.total} questions on ${s.short}, easy to hard.`),
      el('div', { class: 'btn-row' },
        el('a', { class: 'btn', href: '#/quiz/start?s=' + s.id }, 'Quiz this section'),
        el('a', { class: 'btn secondary', href: '#/quiz?s=' + s.id }, 'Custom quiz'))));

    article.appendChild(el('nav', { class: 'guide-foot', 'aria-label': 'Previous and next section' },
      prev ? el('a', { class: 'foot-card prev', href: '#/guide/' + prev.id }, el('small', null, 'Previous'), el('b', null, prev.title)) : el('span'),
      nxt ? el('a', { class: 'foot-card next', href: '#/guide/' + nxt.id }, el('small', null, 'Next'), el('b', null, nxt.title)) : el('span')));

    const { nav, select } = sideNav(s.id);
    const content = el('div', null, select, article);
    main.replaceChildren(el('div', { class: 'guide-layout' }, nav, content));
    updateCount();
    if (topicIdx) {
      const target = document.getElementById('topic-' + topicIdx) || document.getElementById(topicIdx);
      if (target) requestAnimationFrame(() => target.scrollIntoView());
    } else window.scrollTo(0, 0);
    const cur = nav.querySelector('[aria-current="page"]');
    if (cur) cur.scrollIntoView({ block: 'nearest' });
  }

  function emptyState(title, text, action) {
    return el('div', { class: 'empty' }, el('h2', null, title), el('p', null, text), action || null);
  }
  NET.emptyState = emptyState;

  /* ---------- games ---------- */
  function renderGames() {
    setTitle('Games'); updateNav('games');
    const head = el('header', { class: 'page-head' }, el('h1', null, 'Games'),
      el('p', null, 'Each game drills one mechanism until it’s automatic: building headers, timing packets, resolving names, sorting segments to sockets, playing the rdt state machines. Runs take two to five minutes.'));
    const groups = [[1, 'Foundations'], [2, 'Application layer'], [3, 'Transport layer'], [0, 'Across chapters']];
    const out = [head];
    groups.forEach(([u, name]) => {
      const gs = NET.games.filter(g => (g.unit || 0) === u);
      if (!gs.length) return;
      out.push(el('section', { class: 'games-group ' + (u ? unitCls(u) : '') },
        el('h2', null, u ? el('span', { class: 'unit-dot' }) : null, name),
        el('div', { class: 'games-grid' }, gs.map(g => {
          const st = store.game(g.id);
          return el('a', { class: 'game-tile ' + (u ? unitCls(u) : 'ux'), href: '#/games/' + g.id },
            el('h3', null, g.title), el('p', null, g.blurb),
            el('div', { class: 'tile-foot' },
              el('span', null, (g.sections || []).map(id => NET.byId[id] ? NET.byId[id].short : id).join(', ')),
              el('span', null, st.plays ? `Best ${st.best}` : 'Not played')));
        }))));
    });
    if (!NET.games.length) out.push(emptyState('No games loaded', 'The files in assets/js/games/ did not load.'));
    main.replaceChildren(...out);
    window.scrollTo(0, 0);
  }

  function renderGame(id) {
    updateNav('games');
    const g = NET.gameById[id];
    if (!g) { main.replaceChildren(emptyState('Game not found', `No game called "${id}".`, el('a', { class: 'btn', href: '#/games' }, 'All games'))); return; }
    setTitle(g.title);
    const stage = el('div', { class: 'g-stage' });
    const how = el('details', { class: 'how', open: !store.game(g.id).plays },
      el('summary', null, 'How to play'), el('ul', null, (g.how || []).map(h => html('li', null, h))));
    const related = el('div', { class: 'game-related' }, (g.sections || []).filter(sid => NET.byId[sid]).map(sid =>
      el('a', { class: 'chip', href: '#/guide/' + sid }, 'Guide: ' + NET.byId[sid].short)));
    main.replaceChildren(el('div', { class: 'game-page' },
      el('div', { class: 'game-head' },
        el('div', null, el('a', { href: '#/games', class: 'btn ghost small' }, 'All games'), el('h1', null, g.title), el('p', null, g.blurb)),
        related),
      how, stage));
    function mount() {
      if (activeGame) { activeGame.kit._destroy(); if (typeof activeGame.cleanup === 'function') activeGame.cleanup(); }
      stage.replaceChildren();
      const kit = NET.makeKit(g, stage, mount);
      let cleanup;
      try { cleanup = g.mount(stage, kit); } catch (e) {
        stage.replaceChildren(emptyState('This game hit an error', String(e && e.message || e)));
      }
      activeGame = { kit, cleanup };
    }
    mount();
    window.scrollTo(0, 0);
  }

  /* ---------- review hub ---------- */
  function reviewTabs(cur) {
    const tabs = [['', 'Missed & flagged'], ['cards', 'Flashcards'], ['formulas', 'Formula sheet'], ['tables', 'Comparison tables'], ['traps', 'Exam traps'], ['must', 'Must-know list']];
    return el('nav', { class: 'review-tabs', 'aria-label': 'Review views' }, tabs.map(([k, label]) =>
      el('a', { class: 'chip', href: '#/review' + (k ? '/' + k : ''), 'aria-pressed': String(k === cur) }, label)));
  }

  function renderReview(view, params) {
    updateNav('review');
    const head = el('header', { class: 'page-head' }, el('h1', null, 'Review'),
      el('p', null, 'Everything you got wrong, plus the whole course compressed: flashcards, formulas, traps, tables and the must-know list.'));
    const v = view || '';
    let body;
    if (v === 'cards') body = NET.flashcards(params);
    else if (v === 'formulas') body = collected('formula', 'Formula sheet', 'Every formula from every guide, in course order.');
    else if (v === 'tables') body = collected('table', 'Comparison tables', 'High-yield side-by-side comparisons.');
    else if (v === 'traps') body = collected('trap', 'Exam traps', 'The mistakes the exam is designed to catch.');
    else if (v === 'must') body = mustKnowAll();
    else body = missedView();
    setTitle('Review');
    main.replaceChildren(head, reviewTabs(v), body);
    window.scrollTo(0, 0);
  }

  function missedView() {
    const all = NET.allQuestions();
    const missed = all.filter(q => { const r = store.q(q.id); return r && r.n && r.last < 1; });
    const flagged = all.filter(q => { const r = store.q(q.id); return r && r.flag; });
    const wrap = el('div');
    wrap.appendChild(el('div', { class: 'btn-row', style: { marginBottom: '22px' } },
      el('a', { class: 'btn' + (missed.length ? '' : ' secondary'), href: '#/quiz/start?mode=missed', 'aria-disabled': String(!missed.length) }, `Quiz all ${missed.length} missed`),
      el('a', { class: 'btn secondary', href: '#/quiz/start?mode=flagged' }, `Quiz ${flagged.length} flagged`)));
    if (!missed.length && !flagged.length) {
      wrap.appendChild(emptyState('Nothing to review yet', 'Questions you miss or flag in a quiz collect here, grouped by section.', el('a', { class: 'btn', href: '#/quiz' }, 'Start a quiz')));
      return wrap;
    }
    const table = el('table', { class: 'data' }, el('thead', null, el('tr', null, el('th', null, 'Section'), el('th', null, 'Missed'), el('th', null, 'Flagged'), el('th', null, 'Mastery'), el('th', null, ''))));
    const tb = el('tbody');
    NET.sections.forEach(s => {
      const qs = NET.questions[s.id] || [];
      const mi = qs.filter(q => missed.includes(q)).length;
      const fl = qs.filter(q => flagged.includes(q)).length;
      if (!mi && !fl) return;
      const m = NET.mastery(s.id);
      tb.appendChild(el('tr', null,
        el('th', { scope: 'row' }, el('a', { href: '#/guide/' + s.id }, `${sectionNum(s)} ${s.title}`)),
        el('td', null, String(mi)), el('td', null, String(fl)),
        el('td', null, el('span', { style: { display: 'inline-flex', gap: '8px', alignItems: 'center' } }, led(s.id), Math.round(m.pct * 100) + '%')),
        el('td', null, mi ? el('a', { class: 'btn small secondary', href: `#/quiz/start?mode=missed&s=${s.id}` }, 'Redo missed') : null)));
    });
    table.appendChild(tb);
    wrap.appendChild(el('div', { class: 'table-wrap' }, table));
    return wrap;
  }

  function collected(kind, title, sub) {
    const wrap = el('div');
    let count = 0;
    NET.sections.forEach(s => {
      const items = [];
      (s.topics || []).forEach((t, ti) => t.blocks.forEach(b => { if (kind in b) items.push({ b, ti }); }));
      if (!items.length) return;
      count += items.length;
      const sec = el('section', { class: 'sheet-sec ' + unitCls(s.unit) },
        el('h2', null, el('span', { class: 'unit-dot' }), el('a', { href: '#/guide/' + s.id }, `${sectionNum(s)} ${s.title}`)));
      const cols = el('div', { class: kind === 'table' ? '' : 'sheet-cols' });
      items.forEach(({ b }) => cols.appendChild(renderBlock(b, 'plain')));
      sec.appendChild(cols);
      wrap.appendChild(sec);
    });
    if (!count) wrap.appendChild(emptyState('Nothing here yet', `No ${title.toLowerCase()} in the loaded guides.`));
    return wrap;
  }

  function mustKnowAll() {
    const recallOn = !!store.setting('recall');
    const wrap = el('div', { class: 'guide' + (recallOn ? ' recall-mode' : ''), style: { maxWidth: 'none' } });
    const tog = el('input', { type: 'checkbox', checked: recallOn });
    tog.addEventListener('change', () => { wrap.classList.toggle('recall-mode', tog.checked); store.setting('recall', tog.checked); });
    wrap.addEventListener('click', e => { const c = e.target.closest('.cloze'); if (c) c.classList.add('shown'); });
    wrap.addEventListener('keydown', e => { const c = e.target.closest && e.target.closest('.cloze'); if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); c.classList.add('shown'); } });
    wrap.appendChild(el('div', { class: 'btn-row', style: { marginBottom: '18px' } },
      el('label', { class: 'switch' }, tog, 'Recall mode: hide key terms'),
      el('button', { class: 'btn secondary small', type: 'button', onclick: () => window.print() }, 'Print')));
    NET.sections.forEach(s => {
      if (!s.mustKnow) return;
      wrap.appendChild(el('section', { class: 'sheet-sec ' + unitCls(s.unit) },
        el('h2', null, el('span', { class: 'unit-dot' }), el('a', { href: '#/guide/' + s.id }, `${sectionNum(s)} ${s.title}`)),
        el('ul', null, s.mustKnow.map(x => html('li', null, x, 'guide')))));
    });
    return wrap;
  }

  /* ---------- flashcards ---------- */
  NET.flashcards = function (params) {
    const chosen = new Set((params.get('s') || '').split(',').filter(id => NET.byId[id]));
    const wrap = el('div');
    const chips = el('div', { class: 'chip-row', style: { marginBottom: '20px' } });
    const allChip = el('button', { class: 'chip', type: 'button', 'aria-pressed': String(!chosen.size) }, 'All sections');
    allChip.addEventListener('click', () => { location.hash = '#/review/cards'; });
    chips.appendChild(allChip);
    NET.sections.forEach(s => {
      const c = el('button', { class: 'chip ' + unitCls(s.unit), type: 'button', 'aria-pressed': String(chosen.has(s.id)) }, s.short);
      c.addEventListener('click', () => {
        if (chosen.has(s.id)) chosen.delete(s.id); else chosen.add(s.id);
        location.hash = '#/review/cards' + (chosen.size ? '?s=' + [...chosen].join(',') : '');
      });
      chips.appendChild(c);
    });
    wrap.appendChild(chips);

    let deck = [];
    NET.sections.forEach(s => {
      if (chosen.size && !chosen.has(s.id)) return;
      (s.recall || []).forEach((r, i) => deck.push({ id: `${s.id}#r${i}`, s, q: r.q, a: r.a }));
      (s.topics || []).forEach(t => t.blocks.forEach(b => {
        if (b.def) deck.push({ id: `${s.id}#d:${plain(b.def)}`, s, q: `Define: ${b.def}`, a: b.text });
      }));
    });
    if (!deck.length) { wrap.appendChild(emptyState('No cards', 'No recall prompts in the selected sections.')); return wrap; }
    // lowest box first, shuffled within box
    deck = NET.shuffle(deck).sort((x, y) => store.card(x.id) - store.card(y.id));
    const total = deck.length;
    const mastered = () => deck.filter(c => store.card(c.id) >= 3).length;
    const status = el('p', { class: 'g-sub', style: { textAlign: 'center', margin: '0 0 12px' }, 'aria-live': 'polite' });
    const holder = el('div', { class: 'flashcard' });
    wrap.append(status, holder);
    let i = 0;

    function show() {
      status.textContent = `Card ${i + 1} of ${total}. ${mastered()} known well (box 3 or higher).`;
      const c = deck[i];
      const box = store.card(c.id);
      const ans = html('div', 'fc-a', c.a);
      ans.hidden = true;
      const reveal = el('button', { class: 'btn', type: 'button' }, 'Show answer');
      const grade = el('div', { class: 'btn-row', style: { justifyContent: 'center' }, hidden: true },
        el('button', { class: 'btn bad', type: 'button', onclick: () => rate(0) }, 'Again'),
        el('button', { class: 'btn warn', type: 'button', onclick: () => rate(box) }, 'Hard'),
        el('button', { class: 'btn good', type: 'button', onclick: () => rate(Math.min(4, box + 1)) }, 'Knew it'));
      reveal.addEventListener('click', flip);
      function flip() { ans.hidden = false; reveal.hidden = true; grade.hidden = false; grade.querySelector('.good').focus(); }
      function rate(b) { store.setCard(c.id, b); i = (i + 1) % total; show(); }
      holder.replaceChildren(
        el('div', { class: 'fc-face' },
          el('div', { class: 'fc-sec ' + unitCls(c.s.unit) }, el('span', { class: 'unit-dot' }), `${sectionNum(c.s)} ${c.s.short}`),
          html('div', 'fc-q', c.q), ans),
        el('div', { class: 'fc-boxes', 'aria-label': `Leitner box ${box} of 4` }, [0, 1, 2, 3].map(k => el('i', { class: k < box ? 'on' : '' }))),
        el('div', { class: 'btn-row', style: { justifyContent: 'center' } }, reveal), grade,
        el('p', { class: 'g-sub', style: { textAlign: 'center', marginTop: '14px' } }, 'Keys: Space shows the answer; 1 again, 2 hard, 3 knew it.'));
      holder.onkey = e => {
        if (e.key === ' ' && ans.hidden) { e.preventDefault(); flip(); }
        else if (!ans.hidden && ['1', '2', '3'].includes(e.key)) rate([0, box, Math.min(4, box + 1)][+e.key - 1]);
      };
      reveal.focus();
    }
    show();
    return wrap;
  };
  document.addEventListener('keydown', e => {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName || '')) return;
    const fc = document.querySelector('.flashcard');
    if (fc && fc.onkey) fc.onkey(e);
  });

  /* ---------- search ---------- */
  let searchIndex = null;
  function buildIndex() {
    const idx = [];
    NET.sections.forEach(s => {
      idx.push({ kind: 'Section', title: s.title, text: plain(s.summary), href: '#/guide/' + s.id, s });
      (s.topics || []).forEach((t, ti) => {
        const text = t.blocks.map(b => plain(b.p || (b.list || b.steps || []).join(' ') || (b.def ? b.def + ' ' + b.text : '') || b.formula || b.trap ||
          (b.example ? b.example.q : '') || (b.table ? b.table.rows.flat().join(' ') : ''))).join(' ');
        idx.push({ kind: 'Topic', title: plain(t.title), text, href: `#/guide/${s.id}/${ti + 1}`, s });
        t.blocks.forEach(b => { if (b.def) idx.push({ kind: 'Definition', title: plain(b.def), text: plain(b.text), href: `#/guide/${s.id}/${ti + 1}`, s }); });
      });
    });
    NET.games.forEach(g => idx.push({ kind: 'Game', title: g.title, text: g.blurb, href: '#/games/' + g.id }));
    return idx;
  }
  function openSearch() {
    if (document.querySelector('.search-panel')) return;
    if (!searchIndex) searchIndex = buildIndex();
    const input = el('input', { type: 'search', placeholder: 'Search definitions, topics, games (e.g. MSS, cookie, rdt2.2)', 'aria-label': 'Search' });
    const results = el('div', { class: 'search-results', role: 'listbox' });
    const panel = el('div', { class: 'search-panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Search' }, el('div', { class: 'search-box' }, input, results));
    const prevFocus = document.activeElement;
    function close() { panel.remove(); if (prevFocus) prevFocus.focus(); }
    panel.addEventListener('click', e => { if (e.target === panel) close(); });
    panel.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const links = [...results.querySelectorAll('a')];
        if (!links.length) return;
        e.preventDefault();
        const i = links.indexOf(document.activeElement);
        const n = e.key === 'ArrowDown' ? (i + 1) % links.length : (i <= 0 ? links.length - 1 : i - 1);
        links[n].focus();
      }
    });
    results.addEventListener('click', e => { if (e.target.closest('a')) panel.remove(); });
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      results.replaceChildren();
      if (q.length < 2) return;
      const terms = q.split(/\s+/);
      const hits = searchIndex.map(it => {
        const t = it.title.toLowerCase(), x = it.text.toLowerCase();
        if (!terms.every(w => t.includes(w) || x.includes(w))) return null;
        let score = terms.reduce((a, w) => a + (t.includes(w) ? 10 : 0) + (x.includes(w) ? 1 : 0), 0);
        if (it.kind === 'Definition' && t.includes(q)) score += 15;
        if (t === q) score += 20;
        return { it, score };
      }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 30);
      if (!hits.length) { results.appendChild(el('div', { class: 'none' }, 'No matches. Try a shorter term.')); return; }
      const mark = s => { let h = esc(s); terms.forEach(w => { h = h.replace(new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); }); return h; };
      hits.forEach(({ it }) => {
        const i = it.text.toLowerCase().indexOf(terms[0]);
        const snip = i >= 0 ? (i > 40 ? '…' : '') + it.text.slice(Math.max(0, i - 40), i + 90) + '…' : it.text.slice(0, 120);
        results.appendChild(el('a', { href: it.href, role: 'option' },
          el('span', { html: mark(it.title) }),
          el('small', { html: `${it.kind}${it.s ? ' in ' + esc(it.s.short) : ''}: ${mark(snip)}` })));
      });
    });
    document.body.appendChild(panel);
    input.focus();
  }
  document.getElementById('search-btn').addEventListener('click', openSearch);
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName || '') && !e.ctrlKey && !e.metaKey) { e.preventDefault(); openSearch(); }
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Clear all quiz results, flashcard boxes, read marks and game scores on this device?')) { store.reset(); toast('Progress cleared'); route(); }
  });

  /* ---------- router ---------- */
  function route() {
    if (activeGame) { activeGame.kit._destroy(); if (typeof activeGame.cleanup === 'function') activeGame.cleanup(); activeGame = null; }
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, query] = raw.split('?');
    const params = new URLSearchParams(query || '');
    const parts = path.split('/').filter(Boolean);
    const [a, b, c] = parts;
    if (!a) renderMap();
    else if (a === 'guide') renderGuide(b || store.state.last.guide || (NET.sections[0] || {}).id, c);
    else if (a === 'quiz') { updateNav('quiz'); NET.quiz.route(b, params); }
    else if (a === 'games') b ? renderGame(b) : renderGames();
    else if (a === 'review') renderReview(b, params);
    else renderMap();
    main.focus({ preventScroll: true });
  }
  NET.route = route;
  NET.setTitle = setTitle;
  NET.sectionNum = sectionNum;
  NET.led = led;
  window.addEventListener('hashchange', route);
  route();
})();
