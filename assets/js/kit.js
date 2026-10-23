/* Game kit: shared helpers every mini-game receives in mount(root, kit).
   A game registers with NET.addGame({ id, title, unit, sections, blurb, how, mount }).
   mount() builds UI inside `root` (an empty .g-stage element) and may return a cleanup function. */
(function () {
  const { el, fmt, shuffle, rand, pick, round, store } = NET;

  function makeKit(game, root, remount) {
    const timers = new Set();
    const keyHandlers = new Set();
    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function onKeydown(e) {
      if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) && e.key !== 'Enter' && e.key !== 'Escape') return;
      keyHandlers.forEach(h => h(e));
    }
    document.addEventListener('keydown', onKeydown);

    const kit = {
      el, fmt, shuffle, rand, pick, round, reducedMotion,
      game,

      /* HTML string with inline markup → element */
      md(tag, cls, s) { const n = document.createElement(tag); if (cls) n.className = cls; n.innerHTML = fmt(s); return n; },

      /* Status bar. fields: array of [key, label]. Returns { node, set(obj) }. */
      hud(fields) {
        const vals = {};
        const node = el('div', { class: 'g-hud', role: 'status', 'aria-live': 'polite' });
        fields.forEach(([k, label], i) => {
          if (k === '|') { node.appendChild(el('span', { class: 'g-spacer' })); return; }
          const b = el('b', null, '0');
          vals[k] = b;
          node.appendChild(el('span', { class: 'g-stat' }, label, b));
        });
        return { node, set(o) { for (const [k, v] of Object.entries(o)) if (vals[k]) vals[k].textContent = v; } };
      },

      /* Feedback strip: kit.feedback(node, 'good'|'bad'|'part'|'', markupString) */
      feedback(node, kind, s) {
        node.className = 'g-feedback' + (kind ? ' ' + kind : '');
        node.innerHTML = s ? fmt(s) : '';
      },

      /* Numeric answer checking: relative tolerance (default 2%), with an absolute floor for answers near 0. */
      checkNum(input, answer, tol) {
        const v = parseFloat(String(input).replace(/,/g, '').trim());
        if (!isFinite(v)) return false;
        const t = tol === undefined ? 0.02 : tol;
        if (answer === 0) return Math.abs(v) < 1e-9 + t;
        return Math.abs(v - answer) <= Math.abs(answer) * t + 1e-12;
      },
      numInput(opts) {
        const o = opts || {};
        return el('input', { class: 'g-input', type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false',
          placeholder: o.placeholder || '', 'aria-label': o.label || 'Answer', style: o.width ? { width: o.width } : null });
      },

      /* Option buttons. choices: array of strings (inline markup ok). onPick(index, button, allButtons). */
      choices(choices, onPick, cls) {
        const wrap = el('div', { class: cls || 'g-opts' });
        const btns = choices.map((c, i) => {
          const b = el('button', { class: 'g-opt', type: 'button', html: fmt(c) });
          b.addEventListener('click', () => onPick(i, b, btns));
          wrap.appendChild(b);
          return b;
        });
        wrap.buttons = btns;
        return wrap;
      },
      lock(btns) { btns.forEach(b => { b.disabled = true; }); },

      /* Keyboard: handler(e) receives keydown events while the game is mounted (ignored while typing, except Enter/Escape). */
      onKey(h) { keyHandlers.add(h); return () => keyHandlers.delete(h); },

      /* Timers that are cleared automatically when the game unmounts. */
      after(ms, fn) { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; },
      every(ms, fn) { const t = setInterval(fn, ms); timers.add(t); return t; },
      clear(t) { clearTimeout(t); clearInterval(t); timers.delete(t); },
      frame(fn) { // requestAnimationFrame loop; return false from fn to stop
        let id; const loop = ts => { if (fn(ts) !== false) id = requestAnimationFrame(loop); };
        id = requestAnimationFrame(loop);
        const stop = () => cancelAnimationFrame(id);
        timers.add(stop); return stop;
      },

      /* Persist a finished run. Returns { best, plays, isBest }. */
      record(score) {
        const before = store.game(game.id).best;
        const g = store.gamePlayed(game.id, score);
        return { best: g.best, plays: g.plays, isBest: typeof score === 'number' && score > before };
      },
      best() { return store.game(game.id).best; },

      /* Standard end screen. Replaces root content. */
      finish(o) {
        const r = kit.record(o.score);
        root.innerHTML = '';
        const again = el('button', { class: 'btn', type: 'button', onclick: () => remount() }, o.againLabel || 'Play again');
        root.appendChild(el('div', { class: 'g-end' },
          el('h2', null, o.headline || String(o.score)),
          el('p', { html: fmt((o.summary || '') + (r.isBest ? ' New best.' : r.best ? ` Best: ${r.best}.` : '')) }),
          el('div', { class: 'btn-row', style: { justifyContent: 'center' } }, again,
            ...(o.extra || []))));
        again.focus();
        return r;
      },

      restart() { remount(); },

      /* SVG helper: kit.svg('rect', {x:..}) creates namespaced SVG elements */
      svg(tag, attrs, ...kids) {
        const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
        if (attrs) for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) n.setAttribute(k, v);
        kids.flat().forEach(k => { if (k !== null && k !== undefined) n.appendChild(typeof k === 'string' || typeof k === 'number' ? document.createTextNode(String(k)) : k); });
        return n;
      },

      /* Internal: called by the app when navigating away. */
      _destroy() {
        timers.forEach(t => { if (typeof t === 'function') t(); else { clearTimeout(t); clearInterval(t); } });
        timers.clear();
        keyHandlers.clear();
        document.removeEventListener('keydown', onKeydown);
      },
    };
    return kit;
  }

  NET.makeKit = makeKit;
})();
