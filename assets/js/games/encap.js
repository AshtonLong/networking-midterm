/* Encapsulation builder: add and strip headers layer by layer, name each unit, and say which layers devices process. */
(function () {
  const LAYERS = ['Application', 'Transport', 'Network', 'Link', 'Physical'];
  const HDR = { 1: 'Ht', 2: 'Hn', 3: 'Hl' };
  const NAME = ['message', 'segment', 'datagram', 'frame', 'bits'];
  const STYLE = `
  .gm-encap .enc-wrap { display: grid; grid-template-columns: 200px minmax(0, 1fr); gap: 22px; align-items: start; }
  .gm-encap .enc-stack { display: grid; gap: 6px; }
  .gm-encap .enc-layer { padding: 9px 12px; border-radius: 6px; border: 1px solid var(--rule); background: var(--surface); font-family: var(--font-display); font-size: 1.15rem; font-weight: 600; color: var(--ink-2); display: flex; justify-content: space-between; align-items: center; }
  .gm-encap .enc-layer small { font-family: var(--font-text); font-size: 0.78rem; font-weight: 600; color: var(--ink-3); }
  .gm-encap .enc-layer.is-on { border-color: var(--ink); color: var(--ink); box-shadow: inset 4px 0 0 var(--ink); }
  .gm-encap .enc-layer.is-done { color: var(--ink); background: var(--surface-2); }
  .gm-encap .enc-layer.is-off { opacity: 0.4; }
  .gm-encap .enc-pdu { display: flex; gap: 3px; align-items: stretch; min-height: 52px; margin: 4px 0 6px; flex-wrap: wrap; }
  .gm-encap .enc-blk { display: grid; place-items: center; min-width: 46px; padding: 0 10px; height: 48px; border-radius: 4px; font-family: var(--font-mono); font-weight: 600; border: 1.5px solid var(--rule-strong); background: var(--surface-3); }
  .gm-encap .enc-blk.M { min-width: 120px; }
  .gm-encap .enc-blk.Ht { background: var(--u3-soft); border-color: var(--u3); }
  .gm-encap .enc-blk.Hn { background: var(--u1-soft); border-color: var(--u1); }
  .gm-encap .enc-blk.Hl { background: var(--surface-2); border-color: var(--ink-3); }
  .gm-encap .enc-blk.enter { animation: enc-in 0.35s ease-out; }
  .gm-encap .enc-blk.leave { opacity: 0.25; text-decoration: line-through; }
  @keyframes enc-in { from { transform: translateX(-24px); opacity: 0; } to { transform: none; opacity: 1; } }
  .gm-encap .enc-name { font-size: 0.95rem; color: var(--ink-2); margin-bottom: 14px; min-height: 1.4em; }
  @media (max-width: 700px) { .gm-encap .enc-wrap { grid-template-columns: 1fr; } .gm-encap .enc-stack { grid-template-columns: repeat(5, minmax(0, 1fr)); } .gm-encap .enc-layer { font-size: 0.9rem; padding: 6px; flex-direction: column; } }
  @media (prefers-reduced-motion: reduce) { .gm-encap .enc-blk.enter { animation: none; } }`;

  // single-question rounds: { prompt, choices, a (index or array for multi), why, device? }
  function quickRounds(kit) {
    const segs = kit.pick([2, 3, 4]);
    return [
      { prompt: 'A **link-layer switch** receives a frame. Which layers does it process? Select all that apply.', choices: LAYERS, a: [3, 4], multi: true, device: [3, 4],
        why: 'A switch implements only the link and physical layers: it forwards using link-layer header fields and never looks at the IP datagram inside.' },
      { prompt: 'A **router** receives a frame. Which layers does it process? Select all that apply.', choices: LAYERS, a: [2, 3, 4], multi: true, device: [2, 3, 4],
        why: 'A router implements physical, link and network layers. It reads the network header (Hn) to choose the outgoing link, but does not run transport or application protocols.' },
      { prompt: 'Which devices implement **all five** layers?', choices: ['End systems (hosts)', 'Routers', 'Link-layer switches', 'Every device on the path'], a: 0,
        why: 'Only hosts run all five layers. Transport and application protocols live at the network edge; packet switches in the core stop at network (routers) or link (switches).' },
      { prompt: 'A router forwards a datagram from an Ethernet link onto a Wi-Fi link. What happens to the headers?', choices: ['It strips the Ethernet frame header, reads Hn, and wraps the datagram in a new Wi-Fi frame', 'It forwards the Ethernet frame unchanged', 'It rewrites the transport header for the new network', 'It removes Hn because the next network uses different addresses'], a: 0,
        why: 'Different link technologies use different frame formats. The router re-encapsulates the same internetwork datagram in the native frame of each outgoing link; that is what makes internetworking possible.' },
      { prompt: `The transport layer splits a message into **${segs} segments**. How many network-layer headers cross one link?`, choices: ['1', String(segs), String(segs + 1), String(2 * segs)], a: 1,
        why: `Each segment is carried in its own datagram and its own frame, so ${segs} segments mean ${segs} network headers and ${segs} sets of link-layer overhead (absent aggregation).` },
      { prompt: 'Which header carries the information needed for transport services, such as port numbers?', choices: ['Ht, the transport header', 'Hn, the network header', 'Hl, the link header', 'None: ports are in the message'], a: 0,
        why: 'The transport header holds what the transport layer needs (ports to pick the right socket, plus things like sequence numbers for TCP). Hn carries what is needed for delivery across networks (addresses).' },
      { prompt: 'The transport layer delivers messages between processes by using the services of which layer?', choices: ['Network layer', 'Link layer', 'Application layer', 'Physical layer'], a: 0,
        why: 'Each layer uses the one below: transport → network (host to host), network → link (neighbour to neighbour), link → physical (bits on the medium).' },
      { prompt: 'At the destination host, the network layer receives Hn·Ht·M. What does it pass up?', choices: ['Ht·M, a segment', 'M, the message', 'Hn·Ht·M unchanged', 'Hl·Hn·Ht·M, a frame'], a: 0,
        why: 'Each layer removes its own header and hands the rest up: the network layer strips Hn and passes the segment (Ht·M) to transport.' },
      { prompt: 'Which statement about layering is true?', choices: ['A change inside one layer is invisible to the others as long as its service stays the same', 'Every layer must know the internals of the layers below it', 'Layering removes all duplicated functionality', 'Routers must understand application messages'], a: 0,
        why: 'Modularity is the point of layering: a layer’s implementation can change without affecting the rest of the system. (The cost: some functions get duplicated across layers.)' },
    ];
  }

  NET.addGame({
    id: 'encap',
    title: 'Encapsulation builder',
    unit: 1,
    sections: ['layers', 'internetworking'],
    blurb: 'Send a message down the five-layer stack one header at a time, name each unit, then strip it at the other end and route it through a switch and a router.',
    how: [
      'Build rounds: at each layer pick the header that layer adds, then name the unit it creates.',
      'Unwrap rounds: at the receiver, each layer removes its own header and passes the rest up.',
      'Device rounds: pick every layer a switch, router or host processes.',
      'Keys: 1–5 pick an option, Enter continues.',
    ],
    mount(root, kit) {
      const { el } = kit;
      root.classList.add('gm-encap');
      root.appendChild(el('style', null, STYLE));
      const hud = kit.hud([['round', 'Round'], ['score', 'Correct'], ['|'], ['best', 'Best']]);
      const stack = el('div', { class: 'enc-stack', 'aria-label': 'Protocol stack' });
      const layerEls = LAYERS.map((L, i) => el('div', { class: 'enc-layer' }, L, el('small', null, NAME[i])));
      layerEls.forEach(x => stack.appendChild(x));
      const pdu = el('div', { class: 'enc-pdu', 'aria-label': 'Current packet' });
      const name = el('div', { class: 'enc-name', 'aria-live': 'polite' });
      const prompt = el('p', { class: 'g-prompt' });
      const opts = el('div');
      const fb = el('div', { class: 'g-feedback', 'aria-live': 'polite' });
      const actions = el('div', { class: 'g-actions' });
      const right = el('div', null, el('p', { class: 'g-sub', style: { margin: '0 0 2px' } }, 'Packet'), pdu, name, prompt, opts, fb, actions);
      root.append(hud.node, el('div', { class: 'enc-wrap' }, stack, right));

      let score = 0, max = 0, roundIdx = 0;
      const quick = kit.shuffle(quickRounds(kit)).slice(0, 6);
      const plan = ['build', quick[0], quick[1], quick[2], 'unwrap', quick[3], quick[4], quick[5]];
      let pending = null; // function to call for Enter

      function setLayers(active, doneUpTo, dir, off) {
        layerEls.forEach((x, i) => {
          x.className = 'enc-layer' + (i === active ? ' is-on' : '') + (off && off.includes(i) ? ' is-off' : '') +
            (doneUpTo !== null && (dir === 'down' ? i < doneUpTo : i > doneUpTo) ? ' is-done' : '');
        });
      }
      function drawPdu(parts, enterIdx, leaving) {
        pdu.replaceChildren(...parts.map((p, i) => el('span', { class: 'enc-blk ' + p + (i === enterIdx && !kit.reducedMotion ? ' enter' : '') + (leaving === i ? ' leave' : '') }, p)));
      }
      function hudSet() { hud.set({ round: `${Math.min(roundIdx + 1, plan.length)}/${plan.length}`, score: `${score}/${max}`, best: kit.best() }); }
      function ask(text, choices, correct, why, onDone, multi) {
        prompt.innerHTML = kit.fmt(text);
        kit.feedback(fb, '', '');
        actions.replaceChildren();
        max++; hudSet();
        if (multi) {
          const picked = new Set();
          const grid = kit.choices(choices, (i, b) => {
            if (picked.has(i)) { picked.delete(i); b.classList.remove('is-picked'); } else { picked.add(i); b.classList.add('is-picked'); }
          });
          const check = el('button', { class: 'btn', type: 'button' }, 'Check');
          const doCheck = () => {
            const ok = picked.size === correct.length && correct.every(i => picked.has(i));
            grid.buttons.forEach((b, i) => { b.classList.remove('is-picked'); if (correct.includes(i)) b.classList.add('is-right'); else if (picked.has(i)) b.classList.add('is-wrong'); });
            kit.lock(grid.buttons);
            if (ok) score++;
            hudSet();
            kit.feedback(fb, ok ? 'good' : 'bad', (ok ? '**Right.** ' : '**Not quite.** ') + why);
            check.remove();
            continueBtn(onDone);
          };
          check.addEventListener('click', doCheck);
          opts.replaceChildren(grid);
          actions.replaceChildren(check);
          pending = { keys: i => { if (i < choices.length) grid.buttons[i].click(); }, enter: doCheck };
          return;
        }
        const grid = kit.choices(choices, i => {
          const ok = i === correct;
          grid.buttons[correct].classList.add('is-right');
          if (!ok) grid.buttons[i].classList.add('is-wrong');
          kit.lock(grid.buttons);
          if (ok) score++;
          hudSet();
          kit.feedback(fb, ok ? 'good' : 'bad', (ok ? '**Right.** ' : '**Not quite.** ') + why);
          continueBtn(onDone);
        });
        opts.replaceChildren(grid);
        pending = { keys: i => { if (i < choices.length && !grid.buttons[i].disabled) grid.buttons[i].click(); }, enter: null };
      }
      function continueBtn(fn) {
        const b = el('button', { class: 'btn', type: 'button' }, 'Continue');
        b.addEventListener('click', () => { pending = null; fn(); });
        actions.replaceChildren(b);
        b.focus();
        pending = { keys: () => {}, enter: () => b.click() };
      }

      function buildRound(done) {
        let parts = ['M'];
        setLayers(0, null, 'down');
        drawPdu(parts, 0);
        name.textContent = '';
        const nameChoices = kit.shuffle(['message', 'segment', 'datagram', 'frame']);
        ask('The application creates **M** and hands it down. What is it called?', nameChoices, nameChoices.indexOf('message'),
          'An application-layer packet is a **message**.', () => step(1));
        function step(layer) {
          if (layer === 4) {
            setLayers(4, 4, 'down');
            name.textContent = 'frame';
            ask('The link layer passes the frame down. What does the physical layer do with it?', ['Adds a physical header Hp', 'Transmits the frame’s bits over the medium', 'Removes Hl', 'Splits it into segments'], 1,
              'The physical layer moves the individual **bits** over the wire, fibre or radio. There is no physical-layer header in this model.', done);
            return;
          }
          setLayers(layer, layer, 'down');
          const hdrChoices = kit.shuffle(['Ht', 'Hn', 'Hl']);
          ask(`You're at the **${LAYERS[layer].toLowerCase()} layer**. Which header does it add?`, hdrChoices.map(h => '`' + h + '`'), hdrChoices.indexOf(HDR[layer]),
            `The ${LAYERS[layer].toLowerCase()} layer adds \`${HDR[layer]}\`: ${layer === 1 ? 'information needed for transport services such as port numbers' : layer === 2 ? 'information needed to deliver across networks, such as source and destination addresses' : 'information needed to move the unit to the next neighbouring device'}.`, () => {
              parts = [HDR[layer]].concat(parts);
              drawPdu(parts, 0);
              const nc = kit.shuffle(['message', 'segment', 'datagram', 'frame']);
              ask(`Now the unit is \`${parts.join('·')}\`. What is it called?`, nc, nc.indexOf(NAME[layer]),
                `\`${parts.join('·')}\` is a **${NAME[layer]}**${layer === 1 ? ': transport-layer packet' : layer === 2 ? ': network-layer packet' : ': link-layer packet'}.`, () => {
                  name.textContent = NAME[layer];
                  step(layer + 1);
                });
            });
        }
      }

      function unwrapRound(done) {
        let parts = ['Hl', 'Hn', 'Ht', 'M'];
        drawPdu(parts);
        name.textContent = 'frame arriving at the destination host';
        function up(layer) {
          if (layer === 0) {
            setLayers(0, 0, 'up');
            name.textContent = 'message';
            ask('The application layer receives what is left. What is it?', ['`M`, the original message', '`Ht·M`', '`Hn·Ht·M`', 'Bits'], 0, 'After transport strips `Ht`, the application gets exactly the message the sender created.', done);
            return;
          }
          setLayers(layer, layer, 'up');
          const hc = kit.shuffle(['Hl', 'Hn', 'Ht']);
          ask(`At the destination, the **${LAYERS[layer].toLowerCase()} layer** gets \`${parts.join('·')}\`. Which header does it remove?`, hc.map(h => '`' + h + '`'), hc.indexOf(HDR[layer]),
            `Each layer removes only its own header: the ${LAYERS[layer].toLowerCase()} layer reads and strips \`${HDR[layer]}\`, then passes the rest up.`, () => {
              drawPdu(parts, null, 0);
              kit.after(kit.reducedMotion ? 0 : 280, () => {
                parts = parts.slice(1);
                drawPdu(parts);
                name.textContent = parts.length === 1 ? 'message' : NAME[layer - 1] + ' passed up';
                up(layer - 1);
              });
            });
        }
        up(3);
      }

      function quickRound(r, done) {
        drawPdu(['Hl', 'Hn', 'Ht', 'M']);
        name.textContent = '';
        setLayers(-1, null, 'down', r.device ? [0, 1, 2, 3, 4].filter(i => !r.device.includes(i)) : null);
        if (r.device) layerEls.forEach(x => { x.className = 'enc-layer'; });
        ask(r.prompt, r.choices, r.a, r.why, done, !!r.multi);
      }

      function nextRound() {
        if (roundIdx >= plan.length) {
          kit.finish({ score, headline: `${score} / ${max}`, summary: score === max ? 'Every header in the right place.' : 'Remember the pattern: each layer adds its own header going down and removes only that header coming up. Names: message, segment, datagram, frame.' });
          return;
        }
        const r = plan[roundIdx];
        hudSet();
        const done = () => { roundIdx++; nextRound(); };
        if (r === 'build') buildRound(done);
        else if (r === 'unwrap') unwrapRound(done);
        else quickRound(r, done);
      }

      kit.onKey(e => {
        if (!pending) return;
        if (/^[1-6]$/.test(e.key)) { e.preventDefault(); pending.keys(+e.key - 1); }
        else if (e.key === 'Enter' && pending.enter && !(e.target && e.target.tagName === 'BUTTON')) { e.preventDefault(); pending.enter(); }
      });
      nextRound();
    },
  });
})();
