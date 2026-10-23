/* TCP RTT estimator and timeout calculation drills. */
(function () {
  const ROUNDS = [
    { samples: 1, target: 'estimate' },
    { samples: 1, target: 'estimate' },
    { samples: 1, target: 'estimate' },
    { samples: 1, target: 'deviation' },
    { samples: 1, target: 'deviation' },
    { samples: 1, target: 'timeout' },
    { samples: 1, target: 'timeout' },
    { samples: 2, target: 'estimate' },
    { samples: 3, target: 'deviation' },
    { samples: 4, target: 'timeout' },
  ];
  const ALPHA = 0.125;
  const BETA = 0.25;
  const fmt = x => Number(x).toLocaleString('en-US', { maximumFractionDigits: 3 });

  function makeRound(k, spec) {
    const initial = {
      estimate: k.pick([72, 80, 96, 100, 120, 144]),
      deviation: k.pick([6, 8, 10, 12, 16, 20]),
    };
    const pool = [48, 64, 72, 88, 96, 104, 120, 136, 152, 168, 184, 208];
    const samples = Array.from({ length: spec.samples }, () => k.pick(pool));
    let estimate = initial.estimate;
    let deviation = initial.deviation;
    const steps = samples.map(sample => {
      const previousEstimate = estimate;
      const previousDeviation = deviation;
      // Kurose/RFC order: update DevRTT with the estimate from before this sample.
      deviation = (1 - BETA) * previousDeviation + BETA * Math.abs(sample - previousEstimate);
      estimate = (1 - ALPHA) * previousEstimate + ALPHA * sample;
      const timeout = estimate + 4 * deviation;
      return { sample, previousEstimate, previousDeviation, estimate, deviation, timeout };
    });
    const final = steps[steps.length - 1];
    const answers = { estimate: final.estimate, deviation: final.deviation, timeout: final.timeout };
    const names = { estimate: 'EstimatedRTT', deviation: 'DevRTT', timeout: 'TimeoutInterval' };
    const targetName = names[spec.target];
    const sampleText = spec.samples === 1 ? 'the listed SampleRTT value' : `the ${spec.samples} listed SampleRTT values in order`;
    return {
      spec,
      initial,
      samples,
      steps,
      answer: answers[spec.target],
      targetName,
      question: `Starting from EstimatedRTT = ${fmt(initial.estimate)} ms and DevRTT = ${fmt(initial.deviation)} ms, apply ${sampleText}. What is the ${targetName} after the final sample?`,
    };
  }

  function readDecimal(value) {
    const s = String(value).trim().replace(/,/g, '');
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(s)) return NaN;
    return Number(s);
  }

  NET.addGame({
    id: 'rtt-estimator',
    title: 'TCP RTT estimator',
    unit: 3,
    sections: ['tcp-rtt'],
    blurb: 'Update EstimatedRTT, DevRTT, and the timeout interval from randomized RTT samples.',
    how: [
      'Enter the requested value in milliseconds. The run moves from single updates to longer sample chains.',
      'Use α = 0.125 for EstimatedRTT and β = 0.25 for DevRTT.',
      'For each sample, update DevRTT using the previous EstimatedRTT, then update EstimatedRTT; the timeout uses both new values.',
      'Keys: Enter checks, then Enter again moves to the next round.',
    ],
    mount(root, kit) {
      const rounds = ROUNDS.map(spec => makeRound(kit, spec));
      let round = 0, score = 0, answered = false;
      const hud = kit.hud([['round', 'Round'], ['score', 'Correct'], ['|'], ['best', 'Best']]);
      const tag = kit.el('div', { class: 'g-row', style: { marginBottom: '8px' } });
      const state = kit.el('div', { class: 'g-card', role: 'group', 'aria-label': 'Initial RTT estimates' });
      const samples = kit.el('div', { class: 'g-card', role: 'group', 'aria-label': 'RTT samples' });
      const reminder = kit.el('p', { class: 'g-sub' }, 'For every sample, DevRTT uses the previous EstimatedRTT. Then update EstimatedRTT, and compute TimeoutInterval from the new estimate and deviation.');
      const prompt = kit.el('p', { class: 'g-prompt' });
      const input = kit.numInput({ placeholder: 'milliseconds', label: 'Answer in milliseconds' });
      input.style.width = '190px';
      const unit = kit.el('span', { class: 'g-mono', style: { fontWeight: 700, color: 'var(--ink-2)' } }, 'ms');
      const check = kit.el('button', { class: 'btn', type: 'button' }, 'Check');
      const next = kit.el('button', { class: 'btn', type: 'button', hidden: true }, 'Next round');
      const fb = kit.el('div', { class: 'g-feedback', 'aria-live': 'polite' });
      const work = kit.el('div', { 'aria-label': 'Worked RTT update' });
      root.append(hud.node, tag, state, samples, reminder, prompt,
        kit.el('div', { class: 'g-row' }, input, unit, check, next), fb, work);

      function renderWork(current) {
        work.replaceChildren(kit.el('h3', { class: 'g-sub', style: { margin: '14px 0 8px' } }, 'Worked updates'));
        current.steps.forEach((s, i) => {
          const card = kit.el('div', { class: 'g-card' },
            kit.el('strong', null, `Sample ${i + 1}: ${fmt(s.sample)} ms`),
            kit.el('p', { style: { margin: '8px 0 4px' } }, `Prior state: EstimatedRTT = ${fmt(s.previousEstimate)} ms; DevRTT = ${fmt(s.previousDeviation)} ms.`),
            kit.el('p', { style: { margin: '4px 0' } }, `DevRTT = 0.75 × ${fmt(s.previousDeviation)} + 0.25 × |${fmt(s.sample)} − ${fmt(s.previousEstimate)}| = ${fmt(s.deviation)} ms.`),
            kit.el('p', { style: { margin: '4px 0' } }, `EstimatedRTT = 0.875 × ${fmt(s.previousEstimate)} + 0.125 × ${fmt(s.sample)} = ${fmt(s.estimate)} ms.`),
            kit.el('p', { style: { margin: '4px 0 0' } }, `TimeoutInterval = ${fmt(s.estimate)} + 4 × ${fmt(s.deviation)} = ${fmt(s.timeout)} ms.`));
          work.appendChild(card);
        });
      }

      function load() {
        const current = rounds[round];
        answered = false;
        hud.set({ round: `${round + 1}/${ROUNDS.length}`, score, best: kit.best() });
        tag.replaceChildren(kit.el('span', { class: 'g-tag' }, `${current.spec.samples === 1 ? 'Single sample' : `${current.spec.samples}-sample chain`}`),
          kit.el('span', { class: 'g-tag' }, `Find ${current.targetName}`));
        state.replaceChildren(
          kit.el('p', { class: 'g-sub', style: { margin: '0 0 6px' } }, 'Starting estimates'),
          kit.el('div', { class: 'g-mono' }, `EstimatedRTT = ${fmt(current.initial.estimate)} ms`),
          kit.el('div', { class: 'g-mono' }, `DevRTT = ${fmt(current.initial.deviation)} ms`));
        samples.replaceChildren(
          kit.el('p', { class: 'g-sub', style: { margin: '0 0 6px' } }, 'SampleRTT values, in order'),
          kit.el('div', { class: 'g-row' }, ...current.samples.map((sample, i) => kit.el('span', { class: 'g-tag' }, `Sample ${i + 1}: ${fmt(sample)} ms`))));
        prompt.textContent = current.question;
        input.value = '';
        input.disabled = false;
        input.className = 'g-input';
        check.hidden = false;
        next.hidden = true;
        work.replaceChildren();
        kit.feedback(fb, '', '');
        input.focus();
      }

      function submit() {
        if (answered) return;
        const value = readDecimal(input.value);
        if (!Number.isFinite(value)) {
          kit.feedback(fb, 'part', 'Enter a number in milliseconds, such as 105 or 105.25.');
          input.focus();
          return;
        }
        const current = rounds[round];
        const correct = Math.abs(value - current.answer) <= 0.006;
        answered = true;
        if (correct) score++;
        input.disabled = true;
        input.classList.add(correct ? 'is-right' : 'is-wrong');
        check.hidden = true;
        next.hidden = false;
        next.textContent = round === ROUNDS.length - 1 ? 'See score' : 'Next round';
        hud.set({ score });
        kit.feedback(fb, correct ? 'good' : 'bad', `${correct ? '**Correct.** ' : `**Not quite.** ${current.targetName} is ${fmt(current.answer)} ms. `}DevRTT uses the estimate from before each current sample.`);
        renderWork(current);
        next.focus();
      }

      function advance() {
        round++;
        if (round >= ROUNDS.length) {
          kit.finish({
            score,
            headline: `${score} / ${ROUNDS.length}`,
            summary: score >= 8
              ? 'Each sample updates DevRTT using the previous estimate, then updates EstimatedRTT; the timeout uses both new values.'
              : 'Keep the update order straight: previous EstimatedRTT for DevRTT, new EstimatedRTT, then EstimatedRTT + 4·DevRTT.',
          });
          return;
        }
        load();
      }

      check.addEventListener('click', submit);
      next.addEventListener('click', advance);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
      kit.onKey(e => { if (e.key === 'Enter' && answered && !e.defaultPrevented && e.target !== next) { e.preventDefault(); advance(); } });
      load();
    },
  });
})();
