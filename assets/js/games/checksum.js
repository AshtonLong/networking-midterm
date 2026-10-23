/* Checksum workbench: the UDP / Internet one's-complement checksum (K&R 8e §3.3.2, problems P3–P5). */
(function () {
  'use strict';

  /* ---- pure logic: begin ---- */
  const CK = (function () {
    const full = w => (1 << w) - 1;                       // all 1s in a w-bit word (w <= 16)
    const bin = (x, w) => (x >>> 0).toString(2).padStart(w, '0');
    const bit = (x, i) => (x >> i) & 1;
    // One column addition of two w-bit words: raw sum, carry out of the top bit, low w bits, and the wrapped-around sum.
    function add(a, b, w) {
      const raw = a + b;
      const carry = raw >> w;
      const low = raw & full(w);
      return { raw, carry, low, sum: carry ? low + 1 : low }; // low + 1 cannot overflow again when carry = 1
    }
    // One's-complement sum of a list of words, wrapping each carry around as it happens.
    function sum(words, w) {
      let acc = words[0];
      for (let i = 1; i < words.length; i++) acc = add(acc, words[i], w).sum;
      return acc;
    }
    const comp = (x, w) => ~x & full(w);
    const checksum = (data, w) => comp(sum(data, w), w);
    // Receiver: add every word including the checksum; all 1s means no error detected.
    const receiverOk = (words, w) => sum(words, w) === full(w);
    // carries[i] = carry INTO column i (column 0 = rightmost); carries[w] = carry out of the top bit.
    function carriesInto(a, b, w) {
      const c = [0];
      for (let i = 0; i < w; i++) c.push((bit(a, i) + bit(b, i) + c[i]) >> 1);
      return c;
    }
    function applyFlips(words, flips) {
      const r = words.slice();
      flips.forEach(f => { r[f.word] ^= (1 << f.col); });
      return r;
    }
    // Classify a set of flipped bits (relative to the sent words) for the explanation.
    function classify(sent, flips) {
      if (flips.length === 1) return 'one';
      const [f, g] = flips;
      if (f.word === g.word) return 'same-word';
      if (f.col !== g.col) return 'diff-col';
      return bit(sent[f.word], f.col) !== bit(sent[g.word], g.col) ? 'cancel' : 'same-dir';
    }
    // Choose bits to flip for a scenario. rnd(lo, hi) is an inclusive random integer. Returns null if impossible.
    function makeFlips(sent, w, kind, rnd) {
      const n = sent.length;
      const pick = a => (a.length ? a[rnd(0, a.length - 1)] : null);
      if (kind === 'one') return [{ word: rnd(0, n - 1), col: rnd(0, w - 1) }];
      if (kind === 'one-cks') return [{ word: n - 1, col: rnd(0, w - 1) }];
      if (kind === 'same-word') {
        const word = rnd(0, n - 1), c1 = rnd(0, w - 1);
        let c2 = rnd(0, w - 2); if (c2 >= c1) c2++;
        return [{ word, col: c1 }, { word, col: c2 }];
      }
      const pairs = [];
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = 0; k < w; k++) {
        const differ = bit(sent[i], k) !== bit(sent[j], k);
        if (kind === 'cancel' && differ) pairs.push([{ word: i, col: k }, { word: j, col: k }]);
        if (kind === 'same-dir' && !differ) pairs.push([{ word: i, col: k }, { word: j, col: k }]);
        if (kind === 'diff-col') for (let m = 0; m < w; m++) if (m !== k) pairs.push([{ word: i, col: k }, { word: j, col: m }]);
      }
      return pick(pairs);
    }
    return { full, bin, bit, add, sum, comp, checksum, receiverOk, carriesInto, applyFlips, classify, makeFlips };
  })();
  /* ---- pure logic: end ---- */

  const P3 = [0b01010011, 0b01100110, 0b01110100];                          // textbook problem P3
  const BOOK = [0b0110011001100000, 0b0101010101010101, 0b1000111100001100]; // textbook §3.3.2 example

  const CONCEPTS = [
    { q: 'Why does the sender put the **one\'s complement** of the sum in the checksum field, instead of the sum itself?',
      opts: ['So the receiver can add every word, checksum included, and simply check for all 1s',
        'So the receiver can use it to correct a flipped bit',
        'Because the complement takes fewer bits than the sum',
        'To hide the data from routers along the path'],
      why: 'A value plus its own complement is all 1s. So if nothing was corrupted, the receiver\'s total (data words plus checksum) is `1111…1`, and any 0 in it means an error.' },
    { q: 'Ethernet and many other links already check for bit errors. Why does UDP still carry a checksum?',
      opts: ['Not every link checks for errors, and bits can flip while a segment sits in a router\'s memory, so detection has to be end to end',
        'So UDP can retransmit segments that arrive damaged',
        'Because link-layer checks only cover the IP header',
        'Because routers use the checksum to find the destination port'],
      why: 'There is no guarantee that every link on the path checks errors, and errors can be introduced in router memory, so UDP detects errors end to end (the end-end principle).' },
    { q: 'At the receiver, the UDP checksum check fails. What does UDP do?',
      opts: ['Discards the segment, or passes it up with a warning; it does not fix or resend it',
        'Asks the sender to retransmit the segment',
        'Uses the checksum to correct the flipped bits',
        'Sends a NAK and waits for a new copy'],
      why: 'UDP only detects errors; it does nothing to recover. Some implementations discard the damaged segment, others pass it to the application with a warning.' },
  ];
  const P5 = {
    q: 'The receiver\'s sum comes out all 1s. Can it be absolutely certain that no bits were flipped?',
    opts: ['No: some multi-bit errors leave the sum unchanged',
      'Yes: an all-1s sum proves the segment is intact',
      'Yes, as long as the segment is small',
      'No, because the checksum misses all 1-bit errors'],
    why: 'Two flips in the same column of different words, one 0→1 and one 1→0, cancel in the sum, so a corrupted segment can still add up to all 1s (textbook P5). Every 1-bit error is caught.',
  };

  const TAKEAWAY = {
    sender: 'Add the words, wrap every carry out back into the lowest bit, then flip every bit: that is the checksum.',
    receiver: 'The receiver adds every word including the checksum: all 1s means no error detected, any 0 means an error.',
    detect: 'Every 1-bit error is caught, but two flips in the same column going opposite ways cancel and slip through.',
  };

  let savedMode = 'sender';

  function injectStyle() {
    if (document.getElementById('gm-checksum-style')) return;
    const s = document.createElement('style');
    s.id = 'gm-checksum-style';
    s.textContent = `
.gm-checksum .ck-words { display: grid; grid-template-columns: max-content max-content; gap: 3px 16px; align-items: baseline; }
.gm-checksum .ck-lbl { color: var(--ink-2); font-family: var(--font-text); font-size: 0.9rem; }
.gm-checksum .ck-bits { font-family: var(--font-mono); font-size: 1.05rem; letter-spacing: 0.04em; white-space: pre; }
.gm-checksum .ck-flip { background: var(--amber-soft); color: var(--ink); outline: 2px solid var(--amber); outline-offset: -1px; border-radius: 2px; font-weight: 700; }
.gm-checksum .ck-colhead { font-family: var(--font-text); font-weight: 700; font-size: 0.85rem; color: var(--ink-2); margin: 0 0 6px; }
.gm-checksum .ck-work { display: grid; grid-template-columns: 1.2em max-content minmax(8em, 1fr); column-gap: 10px; row-gap: 1px; align-items: baseline;
  background: var(--surface-2); border-radius: var(--r-md); padding: 10px 14px; margin: 0 0 10px; overflow-x: auto; }
.gm-checksum .ck-work .s { font-family: var(--font-mono); color: var(--ink-2); text-align: center; }
.gm-checksum .ck-work .d { font-family: var(--font-mono); font-size: 1.02rem; white-space: pre; letter-spacing: 0.04em; }
.gm-checksum .ck-work .n { font-size: 0.85rem; color: var(--ink-2); }
.gm-checksum .ck-work .r-carry .d { color: var(--ink-3); }
.gm-checksum .ck-work .r-res .d { font-weight: 700; }
.gm-checksum .ck-work .c-out { color: var(--amber); font-weight: 700; }
.gm-checksum .ck-work .r-good .n, .gm-checksum .ck-work .r-good .d { color: var(--ack); font-weight: 700; }
.gm-checksum .ck-work .r-bad .n { color: var(--nak); font-weight: 700; }
.gm-checksum .ck-work > div { display: contents; }
.gm-checksum .ck-step { border-top: 1px solid var(--rule); padding-top: 14px; margin-top: 4px; }
.gm-checksum .ck-step .g-prompt { font-size: 1.02rem; }
.gm-checksum .ck-bitrow { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: flex-end; margin-bottom: 10px; }
.gm-checksum .ck-byte { display: flex; gap: 3px; }
.gm-checksum .ck-carrygrp { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 0.75rem; color: var(--ink-2); font-weight: 700; }
.gm-checksum .ck-cell { width: 28px; height: 38px; padding: 0; border: 1px solid var(--rule-strong); border-radius: var(--r-sm); background: var(--surface);
  font-family: var(--font-mono); font-weight: 700; font-size: 1.05rem; cursor: pointer; line-height: 1; }
.gm-checksum .ck-cell.nib { margin-left: 6px; }
.gm-checksum .ck-cell:hover:not(:disabled) { border-color: var(--ink); }
.gm-checksum .ck-cell[aria-pressed="true"] { background: var(--ink); color: var(--bg); border-color: var(--ink); }
.gm-checksum .ck-cell.carry { border-color: var(--amber); border-width: 2px; }
.gm-checksum .ck-cell.is-wrong { box-shadow: 0 0 0 2px var(--nak); }
.gm-checksum .ck-cell:disabled { cursor: default; }
.gm-checksum .ck-text { width: 100%; max-width: 15.5em; }
.gm-checksum .ck-long { grid-template-columns: 1fr; }
.gm-checksum .ck-verdict { grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); max-width: 460px; }
@media (max-width: 560px) { .gm-checksum .ck-cell { width: 27px; height: 36px; } }
`;
    document.head.appendChild(s);
  }

  NET.addGame({
    id: 'checksum',
    title: 'Checksum workbench',
    unit: 3,
    sections: ['udp'],
    blurb: 'Work the UDP one\'s-complement checksum bit by bit as sender and receiver, then predict which bit errors it catches.',
    how: [
      '**Sender**: add the words column by column, wrap any carry out of the top bit back into the lowest bit, then flip every bit to get the checksum.',
      '**Receiver**: add every word including the checksum (with wraparound); all 1s means no error detected.',
      '**Detect it?**: decide whether the flipped bits change the receiver\'s sum.',
      'Click bits to toggle them, or type into the text box. In the bit cells: `0`/`1` set a bit, arrows move, Space toggles, Enter checks. Number keys pick answers.',
    ],
    mount(root, kit) {
      injectStyle();
      const { el } = kit;
      const wrap = el('div', { class: 'gm-checksum' });
      root.appendChild(wrap);

      let mode = savedMode;
      const MODES = [['sender', 'Sender'], ['receiver', 'Receiver'], ['detect', 'Detect it?']];
      const hud = kit.hud([['round', 'Round'], ['score', 'Score']]);
      const modeRow = el('div', { class: 'g-modes', role: 'group', 'aria-label': 'Mode' });
      const chips = MODES.map(([id, label]) => {
        const c = el('button', { class: 'chip u3', type: 'button', 'aria-pressed': String(id === mode),
          onclick: () => {
            if (mode === id) return;
            mode = savedMode = id;
            chips.forEach((b, i) => b.setAttribute('aria-pressed', String(MODES[i][0] === id)));
            start();
          } }, label);
        modeRow.appendChild(c);
        return c;
      });
      const body = el('div');
      wrap.append(hud.node, modeRow, body);

      let rounds = [], idx = -1, score = 0, max = 0, keyHandler = null;
      kit.onKey(e => { if (keyHandler && !e.ctrlKey && !e.metaKey && !e.altKey) keyHandler(e); });
      const isButton = t => t && t.tagName === 'BUTTON';
      const B = (x, w) => '`' + CK.bin(x, w) + '`';

      /* ---------- run building ---------- */
      const randWord = w => kit.rand(1, CK.full(w) - 1);
      function randWords(w, n, needCarry) {
        for (;;) {
          const ws = Array.from({ length: n }, () => randWord(w));
          if (!needCarry) return ws;
          let acc = ws[0], carry = false;
          for (let i = 1; i < n; i++) { const r = CK.add(acc, ws[i], w); carry = carry || !!r.carry; acc = r.sum; }
          if (carry) return ws;
        }
      }
      function concept(q) { return { kind: 'concept', points: 1, q }; }
      function sendRound(w, words, src) { return { kind: 'send', points: words.length, w, words, src }; } // (n-1) additions + complement
      function flipRound(kind, w, n, scenario) {
        for (;;) {
          const data = randWords(w, n, false);
          const sent = data.concat([CK.checksum(data, w)]);
          const flips = scenario === 'none' ? [] : CK.makeFlips(sent, w, scenario, kit.rand);
          if (!flips) continue;
          const recv = CK.applyFlips(sent, flips);
          // keep the explanation honest: the simulated outcome must match the scenario
          const undetected = CK.receiverOk(recv, w);
          if (undetected !== (scenario === 'none' || scenario === 'cancel')) continue;
          return { kind, points: kind === 'recv' ? 2 : 1, w, sent, recv, flips };
        }
      }
      function buildRun(m) {
        const cs = kit.shuffle(CONCEPTS).map(concept);
        if (m === 'sender') {
          const r2 = Math.random() < 0.5 ? sendRound(8, P3.slice(), 'Textbook problem P3') : sendRound(8, randWords(8, 3, false));
          const r3 = Math.random() < 0.5 ? sendRound(16, BOOK.slice(), 'The textbook\'s §3.3.2 example') : sendRound(16, randWords(16, 3, true));
          return [sendRound(8, randWords(8, 2, true)), cs[0], r2, cs[1], r3, cs[2]];
        }
        if (m === 'receiver') {
          const last = kit.pick(['cancel', 'same-dir', 'none']);
          return [flipRound('recv', 8, 2, 'none'), flipRound('recv', 8, 3, 'one'), cs[0],
            flipRound('recv', 16, 2, kit.pick(['none', 'one', 'diff-col'])), cs[1],
            flipRound('recv', 8, 3, last), cs[2]];
        }
        return [flipRound('detect', 8, 2, 'one'), flipRound('detect', 8, 2, 'cancel'), cs[0],
          flipRound('detect', 8, 3, 'same-dir'), flipRound('detect', 8, 2, 'one-cks'), cs[1],
          flipRound('detect', 16, 2, 'diff-col'), flipRound('detect', 16, 3, 'cancel'), cs[2],
          flipRound('detect', 16, 2, kit.pick(['same-word', 'same-dir'])), concept(P5)];
      }

      function start() {
        rounds = buildRun(mode);
        idx = -1; score = 0;
        max = rounds.reduce((s, r) => s + r.points, 0);
        next();
      }
      function updateHud() { hud.set({ round: `${Math.min(idx + 1, rounds.length)} / ${rounds.length}`, score: `${score} / ${max}` }); }
      function next() {
        idx++;
        keyHandler = null;
        if (idx >= rounds.length) {
          kit.finish({ score, headline: `${score} / ${max}`, summary: TAKEAWAY[mode] });
          return;
        }
        updateHud();
        body.innerHTML = '';
        const r = rounds[idx];
        ({ send: renderSend, recv: renderRecv, detect: renderDetect, concept: renderConcept })[r.kind](r);
      }
      function nextButton(container) {
        const b = el('button', { class: 'btn', type: 'button', onclick: next }, idx + 1 >= rounds.length ? 'See results' : 'Next round');
        container.appendChild(el('div', { class: 'g-actions' }, b));
        b.focus();
        keyHandler = e => { if (e.key === 'Enter' && !isButton(e.target)) { e.preventDefault(); next(); } };
      }

      /* ---------- display helpers ---------- */
      // Bits of x as a string, or as spans with the flipped columns highlighted.
      function bitsNode(x, w, flippedCols) {
        const s = CK.bin(x, w);
        if (!flippedCols || !flippedCols.length) return el('span', { class: 'ck-bits' }, s);
        const out = el('span', { class: 'ck-bits' });
        for (let p = 0; p < w; p++) {
          const col = w - 1 - p;
          out.appendChild(flippedCols.includes(col) ? el('span', { class: 'ck-flip' }, s[p]) : document.createTextNode(s[p]));
        }
        return out;
      }
      function wordsCard(words, w, labels, flipsByWord, title) {
        const g = el('div', { class: 'ck-words' });
        words.forEach((x, i) => g.append(el('span', { class: 'ck-lbl' }, labels[i]), bitsNode(x, w, flipsByWord && flipsByWord[i])));
        return el('div', { class: 'g-card' }, title ? el('p', { class: 'ck-colhead' }, title) : null, g);
      }
      const labelsFor = n => Array.from({ length: n }, (_, i) => (i === n - 1 ? 'Checksum' : `Word ${i + 1}`));
      function flipsByWord(flips) {
        const m = {};
        flips.forEach(f => { (m[f.word] = m[f.word] || []).push(f.col); });
        return m;
      }

      // Worked column display: rows of [sign, digits (w+1 chars, leftmost = carry-out column), note, row class, carry-out highlight]
      function work() { return el('div', { class: 'ck-work', role: 'group', 'aria-label': 'Worked addition' }); }
      function row(box, sign, digits, note, cls, hiFirst) {
        const d = el('span', { class: 'd' });
        if (hiFirst && digits[0] !== ' ') { d.appendChild(el('span', { class: 'c-out' }, digits[0])); d.appendChild(document.createTextNode(digits.slice(1))); }
        else d.textContent = digits;
        box.appendChild(el('div', { class: cls || '' }, el('span', { class: 's' }, sign), d, el('span', { class: 'n', html: kit.fmt(note || '') })));
      }
      const sp = n => ' '.repeat(n);
      function addRows(box, a, b, w, aLabel, bLabel, withCarries) {
        const r = CK.add(a, b, w);
        if (withCarries) {
          const c = CK.carriesInto(a, b, w);
          let s = c[w] ? '1' : ' ';
          for (let p = 1; p <= w; p++) s += c[w - p] ? '1' : ' ';
          if (s.trim()) row(box, '', s, 'carries', 'r-carry');
        }
        row(box, '', ' ' + CK.bin(a, w), aLabel);
        row(box, '+', ' ' + CK.bin(b, w), bLabel);
        row(box, '=', (r.carry ? '1' : ' ') + CK.bin(r.low, w), r.carry ? 'carry out of the top bit' : 'no carry out', 'r-res', true);
        return r;
      }
      function wrapRows(box, r, w) {
        row(box, '+', sp(w) + '1', 'wraparound: add the carry to the lowest bit');
        row(box, '=', ' ' + CK.bin(r.sum, w), 'sum', 'r-res');
      }
      // Running receiver-style sum over all words, ending with the all-1s verdict.
      function chain(words, w, labels) {
        const box = work();
        let acc = words[0];
        row(box, '', ' ' + CK.bin(acc, w), labels[0]);
        for (let i = 1; i < words.length; i++) {
          const r = CK.add(acc, words[i], w);
          row(box, '+', ' ' + CK.bin(words[i], w), labels[i]);
          if (r.carry) {
            row(box, '=', '1' + CK.bin(r.low, w), 'carry out: wrap it around', '', true);
            row(box, '+', sp(w) + '1', 'wraparound');
          }
          acc = r.sum;
          const last = i === words.length - 1;
          const ok = acc === CK.full(w);
          row(box, '=', ' ' + CK.bin(acc, w), last ? (ok ? 'all 1s: no error detected' : 'not all 1s: error detected') : 'running sum',
            'r-res' + (last ? (ok ? ' r-good' : ' r-bad') : ''));
        }
        return box;
      }

      /* ---------- bit input: toggle cells plus a text-field alternative ---------- */
      function bitInput(w, opts) {
        const hasCarry = !!opts.carry;
        const n = w + (hasCarry ? 1 : 0);
        const state = [];
        if (hasCarry) state.push(opts.carryVal || 0);
        CK.bin(opts.value || 0, w).split('').forEach(ch => state.push(+ch));
        let active = 0, locked = false, textBad = false;
        const cells = [];
        const rowEl = el('div', { class: 'ck-bitrow', role: 'group', 'aria-label': opts.label || 'Bits' });
        function mkCell(i, label, cls) {
          const c = el('button', { class: 'ck-cell' + (cls ? ' ' + cls : ''), type: 'button', 'aria-label': label, tabindex: i === 0 ? '0' : '-1' });
          c.addEventListener('click', () => { if (locked) return; state[i] ^= 1; active = i; textBad = false; render(); });
          c.addEventListener('focus', () => { active = i; cells.forEach((x, j) => x.setAttribute('tabindex', j === i ? '0' : '-1')); });
          cells[i] = c;
          return c;
        }
        if (hasCarry) rowEl.appendChild(el('span', { class: 'ck-carrygrp' }, 'carry', mkCell(0, 'Carry out of the top bit', 'carry')));
        for (let byte = 0; byte < w / 8; byte++) {
          const g = el('span', { class: 'ck-byte' });
          for (let k = 0; k < 8; k++) {
            const p = byte * 8 + k;              // 0 = most significant bit
            const i = p + (hasCarry ? 1 : 0);
            g.appendChild(mkCell(i, `Bit ${p + 1} of ${w}`, k === 4 ? 'nib' : ''));
          }
          rowEl.appendChild(g);
        }
        const text = el('input', { class: 'g-input ck-text', type: 'text', inputmode: 'numeric', autocomplete: 'off', spellcheck: 'false',
          'aria-label': opts.textLabel || 'Type the bits', placeholder: hasCarry ? `carry, then ${w} bits` : `${w} bits` });
        const fmtState = () => (hasCarry ? state[0] + ' ' + state.slice(1).join('') : state.join(''));
        function render() {
          cells.forEach((c, i) => { c.textContent = String(state[i]); c.setAttribute('aria-pressed', String(state[i] === 1)); c.classList.remove('is-wrong'); });
          if (document.activeElement !== text) text.value = fmtState();
        }
        text.addEventListener('input', () => {
          const s = text.value.replace(/[\s_.,]/g, '');
          textBad = !(/^[01]*$/.test(s) && (s.length === n || (hasCarry && s.length === w)));
          if (textBad) return;
          const full = s.length === n ? s : '0' + s;
          full.split('').forEach((ch, i) => { state[i] = +ch; });
          cells.forEach((c, i) => { c.textContent = String(state[i]); c.setAttribute('aria-pressed', String(state[i] === 1)); });
        });
        text.addEventListener('blur', () => { if (!textBad) text.value = fmtState(); });
        rowEl.addEventListener('keydown', e => {
          const t = cells.indexOf(e.target);
          if (t < 0) return;
          let handled = true;
          if (e.key === 'ArrowRight') cells[Math.min(n - 1, t + 1)].focus();
          else if (e.key === 'ArrowLeft' || e.key === 'Backspace') cells[Math.max(0, t - 1)].focus();
          else if (e.key === 'Home') cells[0].focus();
          else if (e.key === 'End') cells[n - 1].focus();
          else if ((e.key === '0' || e.key === '1') && !locked) { state[t] = +e.key; textBad = false; render(); cells[Math.min(n - 1, t + 1)].focus(); }
          else if (e.key === 'Enter') { if (opts.onEnter) opts.onEnter(); }
          else handled = false;
          if (handled) { e.preventDefault(); e.stopPropagation(); }
        });
        render();
        const node = el('div', null, rowEl, el('label', { class: 'g-label' }, 'Or type the bits', text));
        return {
          node,
          focus() { cells[0].focus(); },
          read() {
            if (textBad) return { ok: false };
            const bits = hasCarry ? state.slice(1) : state;
            return { ok: true, carry: hasCarry ? state[0] : 0, value: parseInt(bits.join(''), 2) };
          },
          lock() { locked = true; cells.forEach(c => { c.disabled = true; }); text.disabled = true; },
          // outline cells that differ from the expected value
          mark(expCarry, expValue) {
            const exp = (hasCarry ? [expCarry] : []).concat(CK.bin(expValue, w).split('').map(Number));
            cells.forEach((c, i) => c.classList.toggle('is-wrong', state[i] !== exp[i]));
          },
        };
      }

      /* ---------- sender round ---------- */
      function renderSend(r) {
        const { w, words } = r;
        const n = words.length;
        body.append(kit.md('p', 'g-prompt', `Sender: compute the checksum of these ${n === 2 ? 'two' : 'three'} ${w}-bit words.`));
        body.append(kit.md('p', 'g-sub', (r.src ? r.src + '. ' : '') + 'Add with wraparound, then take the one\'s complement.'));
        body.append(wordsCard(words, w, words.map((_, i) => `Word ${i + 1}`)));
        const workList = el('div');
        const stepBox = el('div', { class: 'ck-step' });
        const fb = el('div', { class: 'g-feedback', 'aria-live': 'polite' });
        body.append(workList, stepBox, fb);

        const steps = [];
        let acc = words[0];
        for (let k = 1; k < n; k++) {
          const res = CK.add(acc, words[k], w);
          steps.push({ stage: k - 1, type: 'raw', a: acc, b: words[k], aLabel: k === 1 ? 'Word 1' : 'running sum', aName: k === 1 ? 'Word 1' : 'the running sum', bLabel: `Word ${k + 1}`, res });
          if (res.carry) steps.push({ stage: k - 1, type: 'wrap', res });
          acc = res.sum;
        }
        steps.push({ stage: n - 1, type: 'comp', x: acc, cks: CK.comp(acc, w) });
        const stageOk = Array(n).fill(true);
        let si = 0, box = null, input = null;

        function showStep() {
          const s = steps[si];
          stepBox.innerHTML = '';
          let text;
          if (s.type === 'raw') {
            text = `Step ${s.stage + 1}: add ${s.aName} and ${s.bLabel}. Set the carry out of the top bit (0 or 1) and the ${w}-bit result.`;
            input = bitInput(w, { carry: true, value: 0, label: 'Carry out and sum bits', onEnter: check });
          } else if (s.type === 'wrap') {
            text = `The carry out is 1, so wrap it around: add 1 to the lowest bit of ${B(s.res.low, w)}.`;
            input = bitInput(w, { value: s.res.low, label: 'Sum after wraparound', onEnter: check });
          } else {
            text = `Last step: take the one's complement of the sum (flip every bit). The result is the checksum.`;
            input = bitInput(w, { value: s.x, label: 'Checksum bits', onEnter: check });
          }
          stepBox.append(kit.md('p', 'g-prompt', text), input.node,
            el('div', { class: 'g-actions' }, el('button', { class: 'btn', type: 'button', onclick: check }, 'Check')));
          keyHandler = e => { if (e.key === 'Enter' && !isButton(e.target)) { e.preventDefault(); check(); } };
          input.focus();
        }

        function check() {
          const s = steps[si];
          const v = input.read();
          if (!v.ok) { kit.feedback(fb, 'part', `Type exactly ${s.type === 'raw' ? w + 1 : w} bits (0s and 1s)${s.type === 'raw' ? ', carry first' : ''}.`); return; }
          let right, msg;
          if (s.type === 'raw') {
            const { res } = s;
            box = work();
            workList.appendChild(box);
            addRows(box, s.a, s.b, w, s.aLabel, s.bLabel, true);
            right = v.carry === res.carry && v.value === res.low;
            input.mark(res.carry, res.low);
            if (right) msg = res.carry
              ? `Right: the sum needs ${w + 1} bits, so the carry out is 1 and the low ${w} bits are ${B(res.low, w)}.`
              : `Right: no carry out of the top bit, so there is nothing to wrap. Running sum ${B(res.low, w)}.`;
            else if (v.value === res.low) msg = `The ${w} bits are right, but the carry out of the top bit is ${res.carry}. The carries for each column are shown above the sum.`;
            else msg = `Not quite. Column by column, ${B(s.a, w)} + ${B(s.b, w)} gives ${res.carry ? 'carry out `1` and ' : 'no carry out and '}${B(res.low, w)}. Wrong bits are outlined.`;
          } else if (s.type === 'wrap') {
            wrapRows(box, s.res, w);
            right = v.value === s.res.sum;
            input.mark(0, s.res.sum);
            msg = right ? `Right: ${B(s.res.low, w)} + 1 = ${B(s.res.sum, w)}. In one's complement addition the carry is never dropped.`
              : v.value === s.res.low ? `You still need to add the carry: ${B(s.res.low, w)} + 1 = ${B(s.res.sum, w)}. The carry out wraps around; it is never dropped.`
                : `Adding the carry to the lowest bit gives ${B(s.res.low, w)} + 1 = ${B(s.res.sum, w)} (the 1 ripples left through any trailing 1s).`;
          } else {
            box = work();
            workList.appendChild(box);
            row(box, '', ' ' + CK.bin(s.x, w), 'sum');
            row(box, '', ' ' + CK.bin(s.cks, w), 'flip every bit: checksum', 'r-res');
            right = v.value === s.cks;
            input.mark(0, s.cks);
            msg = right ? `Right: the checksum is ${B(s.cks, w)}.`
              : v.value === s.x ? `That is the sum itself. The checksum is its one's complement: flip every bit to get ${B(s.cks, w)}.`
                : `Flipping every bit of ${B(s.x, w)} gives ${B(s.cks, w)}. Wrong bits are outlined.`;
            msg += ` Sum + checksum = ${B(s.x, w)} + ${B(s.cks, w)} = ${B(CK.add(s.x, s.cks, w).sum, w)}, all 1s: exactly what the receiver checks for.`;
          }
          input.lock();
          if (!right) stageOk[s.stage] = false;
          const stageDone = si === steps.length - 1 || steps[si + 1].stage !== s.stage;
          if (stageDone && stageOk[s.stage]) { score++; updateHud(); }
          si++;
          kit.feedback(fb, right ? 'good' : 'bad', msg);
          if (si >= steps.length) {
            stepBox.innerHTML = '';
            stepBox.appendChild(el('p', { class: 'g-sub', style: { margin: '0' } }, `Checksum field: ${CK.bin(s.cks, w)}`));
            nextButton(fb.parentNode.appendChild(el('div')));
          } else if (right) {
            showStep();
          } else {
            const cont = el('button', { class: 'btn', type: 'button', onclick: showStep }, 'Continue with the correct value');
            stepBox.appendChild(el('div', { class: 'g-actions' }, cont));
            cont.focus();
            keyHandler = e => { if (e.key === 'Enter' && !isButton(e.target)) { e.preventDefault(); showStep(); } };
          }
        }
        showStep();
      }

      /* ---------- receiver round ---------- */
      function renderRecv(r) {
        const { w, recv, flips } = r;
        const n = recv.length;
        const labels = labelsFor(n);
        body.append(kit.md('p', 'g-prompt', `Receiver: these ${n} ${w}-bit words arrived; the last one is the checksum. Add them all with wraparound, then decide.`));
        const card = el('div', null, wordsCard(recv, w, labels));
        body.appendChild(card);
        const stepBox = el('div', { class: 'ck-step' });
        const fb = el('div', { class: 'g-feedback', 'aria-live': 'polite' });
        const after = el('div');
        body.append(stepBox, fb, after);
        const input = bitInput(w, { value: 0, label: 'Sum of all words', textLabel: 'Type the sum', onEnter: check });
        let verdict = -1;
        const vopts = kit.choices(['No error detected', 'Error detected'], i => {
          verdict = i;
          vopts.buttons.forEach((b, j) => { b.classList.toggle('is-picked', j === i); b.setAttribute('aria-pressed', String(j === i)); });
        }, 'g-opts ck-verdict');
        vopts.buttons.forEach(b => b.setAttribute('aria-pressed', 'false'));
        const checkBtn = el('button', { class: 'btn', type: 'button', onclick: check }, 'Check');
        stepBox.append(kit.md('p', 'g-prompt', `Sum of all ${n} words (after every wraparound):`), input.node,
          kit.md('p', 'g-prompt', 'Verdict:'), vopts, el('div', { class: 'g-actions' }, checkBtn));
        keyHandler = e => { if (e.key === 'Enter' && !isButton(e.target)) { e.preventDefault(); check(); } };
        input.focus();

        function check() {
          const v = input.read();
          if (!v.ok) { kit.feedback(fb, 'part', `Type exactly ${w} bits (0s and 1s).`); return; }
          if (verdict < 0) { kit.feedback(fb, 'part', 'Pick a verdict too: is an error detected?'); return; }
          const total = CK.sum(recv, w);
          const ok = total === CK.full(w);
          const sumRight = v.value === total;
          const vRight = verdict === (ok ? 0 : 1);
          score += (sumRight ? 1 : 0) + (vRight ? 1 : 0);
          updateHud();
          input.mark(0, total);
          input.lock();
          kit.lock(vopts.buttons);
          checkBtn.disabled = true;
          vopts.buttons[ok ? 0 : 1].classList.add('is-right');
          if (!vRight) vopts.buttons[verdict].classList.add('is-wrong');
          let msg = (sumRight ? `Sum right: ${B(total, w)}. ` : `The sum is ${B(total, w)}. `) +
            (ok ? 'It is all 1s, so no error is detected. ' : 'It contains a 0, so the receiver knows bits were flipped: error detected. ');
          if (!flips.length) msg += 'Nothing was flipped in transit.';
          else if (ok) msg += `In fact ${flips.length} bits were flipped in transit (highlighted): one 0→1 and one 1→0 in the same column, so they cancel and the error slips through.`;
          else msg += `The bit${flips.length > 1 ? 's' : ''} flipped in transit ${flips.length > 1 ? 'are' : 'is'} highlighted.`;
          kit.feedback(fb, sumRight && vRight ? 'good' : sumRight || vRight ? 'part' : 'bad', msg);
          if (flips.length) { card.innerHTML = ''; card.appendChild(wordsCard(recv, w, labels, flipsByWord(flips))); }
          after.appendChild(chain(recv, w, labels));
          nextButton(after);
        }
      }

      /* ---------- detect-it round ---------- */
      function explainFlips(cls, sent, flips) {
        if (cls === 'one') return 'A single flipped bit changes one word by a power of two and nothing cancels it, so the sum cannot stay all 1s. Every 1-bit error is caught.';
        if (cls === 'cancel') return 'Both flips are in the same column of different words: the 0→1 flip adds exactly what the 1→0 flip takes away, so the sum is unchanged and the receiver still gets all 1s. The error slips through.';
        if (cls === 'same-dir') {
          const dir = CK.bit(sent[flips[0].word], flips[0].col) ? '1→0' : '0→1';
          return `Both flips are in the same column but go the same way (both ${dir}), so their changes add up instead of cancelling and the sum changes: caught. Only opposite flips in one column cancel.`;
        }
        if (cls === 'same-word') return 'Both flips are in the same word but in different columns, so that word changes by a combination of two different powers of two, which can never be zero: caught.';
        return 'The flips are in different columns, so their changes are different powers of two and cannot cancel: caught.';
      }
      function renderDetect(r) {
        const { w, sent, recv, flips } = r;
        const n = sent.length;
        const labels = labelsFor(n);
        const fw = flipsByWord(flips);
        body.append(kit.md('p', 'g-prompt', `${flips.length === 1 ? 'One bit was' : flips.length + ' bits were'} flipped in transit (highlighted). Will the receiver's checksum catch the error?`));
        body.append(el('div', { class: 'g-grid2' }, wordsCard(sent, w, labels, fw, 'Sent'), wordsCard(recv, w, labels, fw, 'Received')));
        const fb = el('div', { class: 'g-feedback', 'aria-live': 'polite' });
        const after = el('div');
        const detected = !CK.receiverOk(recv, w);
        const opts = kit.choices(['Yes: the receiver\'s sum will not be all 1s', 'No: the error slips through'], pick, 'g-opts ck-verdict');
        body.append(opts, fb, after);
        keyHandler = e => { if (e.key === '1' || e.key === '2') { e.preventDefault(); opts.buttons[+e.key - 1].click(); } };
        function pick(i) {
          const right = (i === 0) === detected;
          if (right) { score++; updateHud(); }
          kit.lock(opts.buttons);
          opts.buttons[detected ? 0 : 1].classList.add('is-right');
          if (!right) opts.buttons[i].classList.add('is-wrong');
          kit.feedback(fb, right ? 'good' : 'bad', (right ? 'Right. ' : (detected ? 'It is caught. ' : 'It slips through. ')) + explainFlips(CK.classify(sent, flips), sent, flips));
          after.appendChild(chain(recv, w, labels));
          nextButton(after);
        }
      }

      /* ---------- concept round ---------- */
      function renderConcept(r) {
        const q = r.q;
        body.append(el('p', { class: 'g-sub', style: { margin: '0 0 6px' } }, 'Concept check'), kit.md('p', 'g-prompt', q.q));
        const order = kit.shuffle(q.opts.map((_, i) => i));
        const fb = el('div', { class: 'g-feedback', 'aria-live': 'polite' });
        const after = el('div');
        const opts = kit.choices(order.map((k, i) => `${i + 1}. ${q.opts[k]}`), i => {
          const right = order[i] === 0;
          if (right) { score++; updateHud(); }
          kit.lock(opts.buttons);
          opts.buttons[order.indexOf(0)].classList.add('is-right');
          if (!right) opts.buttons[i].classList.add('is-wrong');
          kit.feedback(fb, right ? 'good' : 'bad', (right ? 'Right. ' : 'Not quite. ') + q.why);
          nextButton(after);
        }, 'g-opts ck-long');
        body.append(opts, fb, after);
        keyHandler = e => { const k = +e.key; if (k >= 1 && k <= order.length) { e.preventDefault(); opts.buttons[k - 1].click(); } };
      }

      start();
    },
  });
})();
