(function () {
  const ROUNDS = 10;
  const STRATEGIES = [
    { id: 'serial', name: 'Nonpersistent, serial' },
    { id: 'persistent', name: 'Persistent, sequential' },
    { id: 'parallel', name: 'Nonpersistent, parallel' }
  ];

  function totals(objects, rtt, parallelLimit) {
    const waves = Math.ceil(objects / parallelLimit);
    return {
      serial: { rtts: 2 * (1 + objects), ms: 2 * (1 + objects) * rtt },
      persistent: { rtts: 2 + objects, ms: (2 + objects) * rtt },
      parallel: { rtts: 2 + 2 * waves, ms: (2 + 2 * waves) * rtt },
      waves
    };
  }

  function makeOptions(answer, scenario, kit) {
    const { objects, rtt, parallelLimit, all } = scenario;
    const candidates = [all.serial.ms, all.persistent.ms, all.parallel.ms,
      (objects + 2) * rtt,
      (2 * objects + 2) * rtt,
      (2 + Math.ceil(objects / parallelLimit)) * rtt,
      (all[answer].rtts - 1) * rtt,
      (all[answer].rtts + 1) * rtt];
    const values = [];
    candidates.forEach(n => { if (n > 0 && !values.includes(n) && n !== all[answer].ms) values.push(n); });
    for (let n = all[answer].ms + rtt; values.length < 3; n += rtt) if (n !== all[answer].ms && !values.includes(n)) values.push(n);
    return kit.shuffle([all[answer].ms].concat(values.slice(0, 3))).map(n => `${n} ms`);
  }

  function drawTimeline(kit, scenario) {
    const all = scenario.all;
    const maxRtts = Math.max(all.serial.rtts, all.persistent.rtts, all.parallel.rtts);
    const width = 920, height = 190, x0 = 232, chartWidth = 660;
    const scale = chartWidth / maxRtts;
    const svg = kit.svg('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': `Three HTTP object load timelines measured in RTT units. There are ${scenario.objects} objects after the base page.` });
    const addText = (x, y, value, size, fill, anchor) => kit.svg('text', { x, y, fill: fill || 'var(--ink-2)', 'font-size': size || 12, 'text-anchor': anchor || 'start' }, String(value));
    svg.appendChild(addText(x0, 14, 'Elapsed time (RTT units)', 11));
    for (let t = 0; t <= maxRtts; t++) {
      const x = x0 + t * scale;
      svg.appendChild(kit.svg('line', { x1: x, y1: 22, x2: x, y2: 176, stroke: 'var(--rule)', 'stroke-width': 1 }));
      svg.appendChild(addText(x, 32, t, 10, 'var(--ink-3)', 'middle'));
    }

    const rows = [
      { id: 'serial', y: 47, label: 'Nonpersistent serial' },
      { id: 'persistent', y: 94, label: 'Persistent sequential' },
      { id: 'parallel', y: 141, label: 'Nonpersistent parallel' }
    ];
    rows.forEach(row => {
      svg.appendChild(addText(4, row.y + 17, row.label, 12, 'var(--ink)', 'start'));
      const blocks = [];
      if (row.id === 'serial') {
        blocks.push({ length: 2, label: 'HTML', fill: 'var(--surface-3)' });
        for (let i = 0; i < scenario.objects; i++) blocks.push({ length: 2, label: `O${i + 1}`, fill: 'var(--ack-soft)' });
      } else if (row.id === 'persistent') {
        blocks.push({ length: 2, label: 'HTML', fill: 'var(--surface-3)' });
        for (let i = 0; i < scenario.objects; i++) blocks.push({ length: 1, label: `O${i + 1}`, fill: 'var(--ack-soft)' });
      } else {
        blocks.push({ length: 2, label: 'HTML', fill: 'var(--surface-3)' });
        let first = 1;
        while (first <= scenario.objects) {
          const last = Math.min(scenario.objects, first + scenario.parallelLimit - 1);
          blocks.push({ length: 2, label: `${first}${last > first ? `–${last}` : ''}`, fill: 'var(--surface-2)', stroke: 'var(--u2)' });
          first = last + 1;
        }
      }
      let offset = 0;
      blocks.forEach(block => {
        const x = x0 + offset * scale;
        const w = block.length * scale;
        svg.appendChild(kit.svg('rect', { x, y: row.y, width: w, height: 25, rx: 3, fill: block.fill, stroke: block.stroke || 'var(--rule-strong)', 'stroke-width': block.stroke ? 2 : 0.8 }));
        if (w > 20) svg.appendChild(addText(x + w / 2, row.y + 16, block.label, Math.min(10, Math.max(8, w / 6)), 'var(--ink)', 'middle'));
        offset += block.length;
      });
    });
    return svg;
  }

  NET.addGame({
    id: 'http-timeline',
    title: 'HTTP timeline',
    unit: 2,
    sections: ['http'],
    blurb: 'Compare object-load times for serial, persistent, and parallel HTTP connections on a changing timeline.',
    how: [
      'Use the RTT, object count, and parallel-connection limit to calculate the requested strategy’s load time.',
      'The timeline measures time in RTT units; transmission times are treated as negligible.',
      'Keys: 1–4 choose a time; Enter goes to the next round.'
    ],
    mount(root, kit) {
      const { el } = kit;
      const style = el('style', { text: '.gm-http-timeline .gm-timeline { margin: 4px 0 8px; } .gm-http-timeline .gm-timeline svg { min-width:760px; } .gm-http-timeline .gm-legend { display:flex; flex-wrap:wrap; gap:8px 16px; margin: 0 0 12px; color:var(--ink-2); font-size:.88rem; } .gm-http-timeline .gm-key { display:inline-flex; align-items:center; gap:6px; } .gm-http-timeline .gm-swatch { width:12px; height:12px; border:1px solid var(--rule-strong); border-radius:2px; display:inline-block; }' });
      const hud = kit.hud([['round', 'Round'], ['score', 'Correct'], ['|'], ['best', 'Best']]);
      const prompt = el('p', { class: 'g-prompt' });
      const sub = el('p', { class: 'g-sub' });
      const card = el('div', { class: 'g-card' });
      const canvas = el('div', { class: 'g-canvas gm-timeline' });
      const legend = el('div', { class: 'gm-legend', 'aria-label': 'Timeline legend' },
        el('span', { class: 'gm-key' }, el('i', { class: 'gm-swatch', style: { background: 'var(--surface-3)' } }), 'Base HTML: setup + request/response'),
        el('span', { class: 'gm-key' }, el('i', { class: 'gm-swatch', style: { background: 'var(--ack-soft)' } }), 'Object request/response'),
        el('span', { class: 'gm-key' }, el('i', { class: 'gm-swatch', style: { background: 'var(--surface-2)', borderColor: 'var(--u2)' } }), 'Parallel wave'));
      card.append(canvas, legend, el('div', { class: 'g-sub', style: { margin: '0' } }, 'Each horizontal block is an RTT interval. In parallel mode, one wave contains up to the stated number of objects.'));
      const optionHost = el('div');
      const feedback = el('div', { class: 'g-feedback', 'aria-live': 'polite' });
      const next = el('button', { class: 'btn', type: 'button', hidden: true }, 'Next round');
      const stage = el('div', { class: 'gm-http-timeline' }, style, hud.node, prompt, sub, card, optionHost, feedback, el('div', { class: 'g-actions' }, next));
      root.appendChild(stage);

      let round = 0, score = 0, answered = false, currentButtons = [];
      let scenario = null, target = null;
      function newScenario() {
        const level = round < 3 ? 1 : round < 7 ? 2 : 3;
        const objects = kit.pick(level === 1 ? [2, 3, 4] : level === 2 ? [4, 5, 6] : [7, 8, 9, 10]);
        const rtt = kit.pick(level === 1 ? [20, 30, 40] : level === 2 ? [20, 40, 60, 80] : [30, 50, 80, 100]);
        const parallelLimit = kit.pick(level === 1 ? [2, 3] : level === 2 ? [2, 3, 4] : [2, 3, 4, 5, 6]);
        const all = totals(objects, rtt, parallelLimit);
        return { objects, rtt, parallelLimit, all };
      }
      function load() {
        answered = false;
        scenario = newScenario();
        target = kit.pick(STRATEGIES);
        prompt.textContent = `How long does ${target.name.toLowerCase()} take?`;
        sub.textContent = `A page has one base HTML file and ${scenario.objects} small objects. RTT is ${scenario.rtt} ms; parallel mode allows up to ${scenario.parallelLimit} connections.`;
        canvas.replaceChildren(drawTimeline(kit, scenario));
        hud.set({ round: `${round + 1}/${ROUNDS}`, score, best: kit.best() });
        kit.feedback(feedback, '', '');
        next.hidden = true;
        const opts = kit.choices(makeOptions(target.id, scenario, kit), (i, btn, btns) => choose(btn.textContent.trim(), btn, btns), 'g-opts');
        currentButtons = opts.buttons;
        optionHost.replaceChildren(opts);
        currentButtons[0].focus();
      }
      function choose(value, btn, btns) {
        if (answered) return;
        answered = true;
        const expected = scenario.all[target.id].ms;
        const ok = value === `${expected} ms`;
        if (ok) score++;
        btn.classList.add(ok ? 'is-right' : 'is-wrong');
        btns.forEach(b => { if (b.textContent.trim() === `${expected} ms`) b.classList.add('is-right'); });
        kit.lock(btns);
        const allText = STRATEGIES.map(s => `**${s.name}:** ${scenario.all[s.id].rtts} RTT = ${scenario.all[s.id].ms} ms`).join('; ');
        const formula = target.id === 'serial'
          ? `Every object, including the base page, costs 2 RTT: 1 RTT for a new TCP connection and 1 RTT for the request and response. So 2 × (1 + ${scenario.objects}) × ${scenario.rtt} = **${expected} ms**.`
          : target.id === 'persistent'
            ? `The TCP connection and base page cost 2 RTT. Each of the ${scenario.objects} later objects costs 1 RTT on the open connection: (2 + ${scenario.objects}) × ${scenario.rtt} = **${expected} ms**.`
            : `The base page costs 2 RTT. The ${scenario.objects} objects fit into ceil(${scenario.objects}/${scenario.parallelLimit}) = ${scenario.all.waves} parallel waves, each costing 2 RTT: (2 + 2 × ${scenario.all.waves}) × ${scenario.rtt} = **${expected} ms**.`;
        const fastest = Math.min(scenario.all.serial.ms, scenario.all.persistent.ms, scenario.all.parallel.ms);
        const fastestNames = STRATEGIES.filter(s => scenario.all[s.id].ms === fastest).map(s => s.name).join(' and ');
        kit.feedback(feedback, ok ? 'good' : 'bad', `${ok ? '**Correct.** ' : `**Not quite.** ${target.name} takes **${expected} ms**. `}${formula} Assuming transmission times are negligible, the comparison is ${allText}. Fastest here: **${fastestNames}**.`);
        hud.set({ score });
        next.textContent = round === ROUNDS - 1 ? 'See score' : 'Next round';
        next.hidden = false;
        next.focus();
      }
      function advance() {
        round++;
        if (round >= ROUNDS) {
          kit.finish({ score, headline: `${score} / ${ROUNDS}`, summary: score >= 8 ? 'You can read the RTT cost of a base page, sequential objects, and parallel waves.' : 'Count the TCP setup and request/response RTTs separately; persistent connections avoid repeating setup for every object.' });
          return;
        }
        load();
      }
      next.addEventListener('click', advance);
      kit.onKey(e => {
        if (answered && e.key === 'Enter' && e.target !== next) { e.preventDefault(); advance(); return; }
        if (!answered && /^[1-4]$/.test(e.key) && currentButtons[Number(e.key) - 1]) {
          e.preventDefault(); currentButtons[Number(e.key) - 1].click();
        }
      });
      load();
    }
  });
})();
