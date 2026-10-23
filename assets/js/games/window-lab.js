/* Loss and retransmission drills for Go-Back-N, Selective Repeat, and TCP. */
(function () {
  const ROUNDS = 10;

  function list(values) {
    if (values.length === 1) return String(values[0]);
    if (values.length === 2) return `${values[0]} and ${values[1]}`;
    return `${values.slice(0, -1).join(', ')}, and ${values[values.length - 1]}`;
  }

  function packetList(packets) {
    return list(packets.map(x => `pkt${x}`));
  }

  function pickChoices(kit, correct, wrong) {
    const choices = Array.from(new Set([correct].concat(wrong))).slice(0, 4);
    let filler = 1;
    while (choices.length < 4) {
      const extra = `None of these (${filler++})`;
      if (extra !== correct) choices.push(extra);
    }
    return kit.shuffle(choices);
  }

  function packetScenario(kit, level) {
    const count = level === 1 ? 5 : level === 2 ? 6 : kit.pick([6, 7]);
    const start = kit.pick([0, 1, 2, 4, 8]);
    // Keep at least two later packets for the out-of-order comparison.
    const lostIndex = level === 1 ? 1 : kit.rand(1, count - 3);
    const packets = Array.from({ length: count }, (_, i) => start + i);
    return { start, packets, lostIndex, lost: packets[lostIndex] };
  }

  function tcpScenario(kit, laterCount) {
    const starts = kit.pick([92, 120, 200, 400, 1000]);
    const lengths = kit.shuffle([6, 8, 12, 15, 20, 24]).slice(0, laterCount + 2);
    const segments = [];
    let seq = starts;
    lengths.forEach((length, i) => {
      segments.push({ seq, length, end: seq + length });
      seq += length;
    });
    return { segments, missing: segments[1], finalAck: segments[segments.length - 1].end };
  }

  function gbnAckRound(kit, level) {
    const s = packetScenario(kit, level);
    const prior = s.packets[s.lostIndex - 1];
    const later = s.packets.slice(s.lostIndex + 1);
    const correct = `ACK${prior}`;
    return {
      protocol: 'GBN', level, scenario: s,
      title: 'Cumulative ACK after a gap',
      question: `${packetList(later)} arrive after pkt${s.lost} was lost. What ACK does the GBN receiver send for the final out-of-order arrival?`,
      choices: pickChoices(kit, correct, [`ACK${s.lost}`, `ACK${later[later.length - 1]}`, `ACK${later[later.length - 1] + 1}`]),
      answer: correct,
      why: `GBN discards each out-of-order packet and re-ACKs the most recently received in-order packet. That packet is pkt${prior}, so the receiver repeats ${correct}.`,
      trace: `Receiver delivered ${packetList(s.packets.slice(0, s.lostIndex))}; it discards ${packetList(later)} and sends duplicate ${correct}s.`,
    };
  }

  function gbnResendRound(kit, level) {
    const s = packetScenario(kit, level);
    const resent = s.packets.slice(s.lostIndex);
    const correct = packetList(resent);
    return {
      protocol: 'GBN', level, scenario: s,
      title: 'Single timer, go back',
      question: `All packets through pkt${s.packets[s.packets.length - 1]} were sent, but pkt${s.lost} was lost. When the timer for the oldest unACKed packet expires, what does the sender retransmit?`,
      choices: pickChoices(kit, correct, [`pkt${s.lost}`, packetList(s.packets.slice(0, s.lostIndex + 1)), packetList(s.packets)]),
      answer: correct,
      why: `GBN has one timer for the oldest unACKed packet. On timeout it resends every sent but unACKed packet, from pkt${s.lost} through pkt${s.packets[s.packets.length - 1]}.`,
      trace: `GBN retransmits ${correct}. The earlier packets were cumulatively ACKed, so they are not resent.`,
    };
  }

  function gbnDeliveryRound(kit, level) {
    const s = packetScenario(kit, level);
    const delivered = packetList(s.packets.slice(0, s.lostIndex));
    const correct = delivered;
    return {
      protocol: 'GBN', level, scenario: s,
      title: 'Receiver behavior',
      question: `Before timeout recovery, which packets has the textbook GBN receiver delivered after pkt${s.lost} was lost?`,
      choices: pickChoices(kit, correct, [packetList(s.packets), packetList(s.packets.slice(s.lostIndex + 1)), `None; it waits for all ACKs`]),
      answer: correct,
      why: `The GBN receiver delivers only an in-order prefix. It discards packets arriving after the missing pkt${s.lost}, so it has delivered only ${correct}.`,
      trace: `Expected next packet: pkt${s.lost}. Later arrivals are out of order, discarded, and answered with a duplicate ACK for pkt${s.packets[s.lostIndex - 1]}.`,
    };
  }

  function srAckRound(kit, level) {
    const s = packetScenario(kit, level);
    const later = s.packets.slice(s.lostIndex + 1);
    const correct = `ACK${later[later.length - 1]}`;
    return {
      protocol: 'SR', level, scenario: s,
      title: 'Selective ACK',
      question: `pkt${s.lost} is lost, then ${packetList(later)} arrive inside the receive window. What ACK is sent for the final later packet?`,
      choices: pickChoices(kit, correct, [`ACK${s.packets[s.lostIndex - 1]}`, `ACK${s.lost}`, `ACK${later[later.length - 1] + 1}`]),
      answer: correct,
      why: `Selective Repeat individually ACKs every correctly received packet inside its receive window, including an out-of-order one. The final later arrival is pkt${later[later.length - 1]}, so it gets ${correct}.`,
      trace: `The receiver buffers ${packetList(later)} and sends one ACK for each of them. Delivery waits for pkt${s.lost}.`,
    };
  }

  function srResendRound(kit, level) {
    const s = packetScenario(kit, level);
    const correct = `pkt${s.lost}`;
    return {
      protocol: 'SR', level, scenario: s,
      title: 'Per-packet timer',
      question: `The ACKs for every received packet arrive at the SR sender, but pkt${s.lost} was lost. When its timer expires, what does the sender retransmit?`,
      choices: pickChoices(kit, correct, [packetList(s.packets.slice(s.lostIndex)), packetList(s.packets), `pkt${s.packets[s.lostIndex - 1]}`]),
      answer: correct,
      why: `SR keeps a logical timer for each unACKed packet. The later packets are already selectively ACKed, so only the missing ${correct} is retransmitted.`,
      trace: `SR retransmits ${correct}; the buffered, already ACKed later packets are not sent again.`,
    };
  }

  function srDeliveryRound(kit, level) {
    const s = packetScenario(kit, level);
    const later = s.packets.slice(s.lostIndex + 1);
    const correct = packetList(s.packets);
    return {
      protocol: 'SR', level, scenario: s,
      title: 'Buffered in-order delivery',
      question: `SR has buffered ${packetList(later)} while waiting for pkt${s.lost}. pkt${s.lost} now arrives. Which packets can it deliver in order?`,
      choices: pickChoices(kit, correct, [`pkt${s.lost}`, packetList(later), packetList(s.packets.slice(0, s.lostIndex))]),
      answer: correct,
      why: `Once pkt${s.lost} fills the gap, it joins the buffered consecutive run. SR delivers pkt${s.lost} and every buffered packet that follows it, completing ${correct}.`,
      trace: `The receive base moves past the filled gap and drains the buffer through pkt${s.packets[s.packets.length - 1]}.`,
    };
  }

  function comparisonRound(kit, level) {
    const s = packetScenario(kit, level);
    const gbnCount = s.packets.length - s.lostIndex;
    const correct = `GBN: ${gbnCount}; SR: 1`;
    return {
      protocol: 'Compare', level, scenario: s,
      title: 'Cost of one loss',
      question: `All ${s.packets.length} packets were sent; pkt${s.lost} was lost and every later packet arrives. How many data packets are retransmitted after timeout under each protocol?`,
      choices: pickChoices(kit, correct, [`GBN: 1; SR: ${gbnCount}`, `GBN: ${s.packets.length}; SR: ${s.packets.length}`, `GBN: 0; SR: 0`]),
      answer: correct,
      why: `GBN retransmits the missing packet plus every later sent-but-unACKed packet, ${gbnCount} in total. SR has ACKed the later packets individually, so it retransmits only pkt${s.lost}.`,
      trace: `GBN sends ${packetList(s.packets.slice(s.lostIndex))} again. SR sends pkt${s.lost} again.`,
    };
  }

  function windowRuleRound(kit, protocol) {
    const k = kit.pick([3, 4, 5]);
    const max = protocol === 'GBN' ? Math.pow(2, k) - 1 : Math.pow(2, k - 1);
    const correct = `${max} packets`;
    const label = protocol === 'GBN' ? 'Go-Back-N' : 'Selective Repeat';
    const wrong = protocol === 'GBN'
      ? [`${Math.pow(2, k - 1)} packets`, `${Math.pow(2, k)} packets`, `${Math.pow(2, k) - 2} packets`]
      : [`${Math.pow(2, k) - 1} packets`, `${Math.pow(2, k)} packets`, `${Math.pow(2, k - 2)} packets`];
    return {
      protocol: label, level: 3, scenario: null,
      title: 'Window and sequence space',
      question: `${label} uses a ${k}-bit packet sequence number. What is the largest safe sender window?`,
      choices: pickChoices(kit, correct, wrong),
      answer: correct,
      why: protocol === 'GBN'
        ? `GBN can use at most 2^${k} − 1 = ${max}: one sequence number stays unused to avoid ambiguity.`
        : `SR needs a window no larger than half the sequence space: 2^${k} / 2 = ${max}. Otherwise an old retransmission can look new.`,
      trace: protocol === 'GBN' ? `Sequence space: 0 through ${Math.pow(2, k) - 1}; one value stays outside a full GBN window.` : `Sequence space: 0 through ${Math.pow(2, k) - 1}; SR’s send and receive windows must occupy at most half of it.`,
    };
  }

  function tcpDuplicateAckRound(kit) {
    const s = tcpScenario(kit, 3);
    const correct = `ACK ${s.missing.seq}`;
    const later = s.segments.slice(2);
    return {
      protocol: 'TCP', level: 2, scenario: s,
      title: 'Duplicate ACK for a gap',
      question: `The segment starting at seq ${s.missing.seq} is lost. A later segment starting at seq ${later[0].seq} arrives. Which immediate ACK does TCP send?`,
      choices: pickChoices(kit, correct, [`ACK ${later[0].end}`, `ACK ${s.finalAck}`, `ACK ${later[0].seq}`]),
      answer: correct,
      why: `TCP’s ACK number is the next byte expected. The missing segment begins at ${s.missing.seq}, so the out-of-order arrival produces duplicate ${correct}.`,
      trace: `TCP buffers the later data in this exercise and keeps its cumulative ACK at ${s.missing.seq} until the gap is filled.`,
    };
  }

  function tcpFastRetransmitRound(kit) {
    const s = tcpScenario(kit, 3);
    const correct = `Seq ${s.missing.seq}`;
    return {
      protocol: 'TCP', level: 3, scenario: s,
      title: 'Three duplicate ACKs',
      question: `The first segment arrives, the segment at seq ${s.missing.seq} is lost, and the next three segments all arrive. After three duplicate ACKs, what does TCP fast retransmit?`,
      choices: pickChoices(kit, correct, [`Seq ${s.segments[s.segments.length - 1].seq}`, `All unACKed segments`, `Nothing until every packet times out`]),
      answer: correct,
      why: `Three duplicate ACKs for ${s.missing.seq} mean the receiver is still missing the segment beginning at that byte. Fast retransmit resends ${correct} before its timer expires.`,
      trace: `The receiver has one original ACK for ${s.missing.seq} plus three duplicates. That is the threshold for fast retransmit.`,
    };
  }

  function tcpCumulativeRound(kit) {
    const s = tcpScenario(kit, 3);
    const correct = `ACK ${s.finalAck}`;
    return {
      protocol: 'TCP', level: 3, scenario: s,
      title: 'ACK after filling the gap',
      question: `TCP buffered all later segments after the lost segment at seq ${s.missing.seq}. When that missing segment is retransmitted and arrives, what cumulative ACK can the receiver send?`,
      choices: pickChoices(kit, correct, [`ACK ${s.missing.end}`, `ACK ${s.missing.seq}`, `ACK ${s.segments[s.segments.length - 1].seq}`]),
      answer: correct,
      why: `The retransmission fills the lower edge of the gap, so the buffered bytes become contiguous. TCP ACKs the first byte after the final buffered segment: ${correct}.`,
      trace: `Cumulative acknowledgment now covers every byte from ${s.segments[0].seq} through ${s.finalAck - 1}.`,
    };
  }

  function tcpTimeoutRound(kit) {
    const s = tcpScenario(kit, 2);
    const correct = `Seq ${s.missing.seq}`;
    return {
      protocol: 'TCP', level: 3, scenario: s,
      title: 'TCP timeout',
      question: `The segment at seq ${s.missing.seq} is still the oldest unACKed segment when TCP’s timer expires. What does TCP retransmit on that timeout?`,
      choices: pickChoices(kit, correct, [`All segments starting at seq ${s.missing.seq} or later`, `Seq ${s.segments[s.segments.length - 1].seq}`, `The newest segment and the oldest segment`]),
      answer: correct,
      why: `TCP has a single timer for the oldest unACKed segment. A timeout retransmits only that oldest segment, ${correct}; it does not repeat the whole outstanding window.`,
      trace: `This is SR-like behavior: later segments remain outstanding but are not retransmitted merely because the oldest timer expires.`,
    };
  }

  function makeRound(kit, mode, index) {
    const mixed = ['gbnAck', 'srAck', 'gbnResend', 'srResend', 'gbnDelivery', 'srDelivery', 'compare', 'windowSR', 'tcpFast', 'tcpCumulative'];
    const plans = {
      gbn: ['gbnAck', 'gbnDelivery', 'gbnResend', 'gbnAck', 'gbnDelivery', 'gbnResend', 'compare', 'gbnResend', 'windowGBN', 'gbnResend'],
      sr: ['srAck', 'srDelivery', 'srResend', 'srAck', 'srDelivery', 'srResend', 'compare', 'srResend', 'windowSR', 'srDelivery'],
      tcp: ['tcpDup', 'tcpTimeout', 'tcpDup', 'tcpFast', 'tcpTimeout', 'tcpCum', 'tcpFast', 'tcpCum', 'tcpTimeout', 'tcpFast'],
      mixed,
    };
    const type = plans[mode][index];
    const level = index < 3 ? 1 : index < 7 ? 2 : 3;
    if (type === 'gbnAck') return gbnAckRound(kit, level);
    if (type === 'gbnDelivery') return gbnDeliveryRound(kit, level);
    if (type === 'gbnResend') return gbnResendRound(kit, level);
    if (type === 'srAck') return srAckRound(kit, level);
    if (type === 'srDelivery') return srDeliveryRound(kit, level);
    if (type === 'srResend') return srResendRound(kit, level);
    if (type === 'compare') return comparisonRound(kit, level);
    if (type === 'windowGBN') return windowRuleRound(kit, 'GBN');
    if (type === 'windowSR') return windowRuleRound(kit, 'SR');
    if (type === 'tcpDup') return tcpDuplicateAckRound(kit);
    if (type === 'tcpTimeout') return tcpTimeoutRound(kit);
    if (type === 'tcpCum') return tcpCumulativeRound(kit);
    return tcpFastRetransmitRound(kit);
  }

  function addStyle() {
    if (document.getElementById('gm-window-style')) return;
    const style = document.createElement('style');
    style.id = 'gm-window-style';
    style.textContent = `
.gm-window .wl-packets { display: flex; gap: 8px; align-items: stretch; min-width: max-content; padding: 2px; }
.gm-window .wl-packet { min-width: 76px; padding: 8px; border: 1px solid var(--rule-strong); border-radius: var(--r-sm); background: var(--surface); text-align: center; font-family: var(--font-mono); }
.gm-window .wl-packet small { display: block; margin-top: 3px; font-family: var(--font-text); color: var(--ink-2); }
.gm-window .wl-packet.is-lost { border-color: var(--nak); background: var(--nak-soft); text-decoration: line-through; }
.gm-window .wl-arrow { align-self: center; color: var(--ink-3); font-weight: 700; }
.gm-window .wl-flow { overflow-x: auto; margin: 0 0 12px; padding-bottom: 2px; }
.gm-window .wl-legend { display: flex; flex-wrap: wrap; gap: 7px; margin: 0 0 8px; }
`;
    document.head.appendChild(style);
  }

  NET.addGame({
    id: 'window-lab',
    title: 'Window loss lab',
    unit: 3,
    sections: ['pipelining', 'tcp-rtt'],
    blurb: 'Trace packet losses through Go-Back-N, Selective Repeat, and TCP, then predict ACKs, buffering, and retransmissions.',
    how: [
      'Read the sender burst and identify the highlighted lost packet or segment.',
      'Choose the receiver or sender action. Runs start with basic ACKs and finish with window limits and TCP fast retransmit.',
      'Use the mode chips to focus on Go-Back-N, Selective Repeat, or TCP.',
      'Keys: 1–4 choose an answer; Enter continues after the explanation.',
    ],
    mount(root, kit) {
      addStyle();
      root.classList.add('gm-window');
      let mode = NET.store.setting('windowLabMode') || 'mixed';
      let round = 0, score = 0, answered = false, current = null;
      const modeOptions = [['mixed', 'Compare'], ['gbn', 'Go-Back-N'], ['sr', 'Selective Repeat'], ['tcp', 'TCP']];
      const modes = kit.el('div', { class: 'g-modes', role: 'group', 'aria-label': 'Practice mode' });
      modeOptions.forEach(([key, label]) => {
        const button = kit.el('button', { class: 'chip u3', type: 'button', 'aria-pressed': String(key === mode) }, label);
        button.addEventListener('click', () => {
          if (mode === key) return;
          NET.store.setting('windowLabMode', key);
          mode = key;
          kit.restart();
        });
        modes.appendChild(button);
      });
      const hud = kit.hud([['round', 'Round'], ['score', 'Correct'], ['|'], ['best', 'Best']]);
      const tags = kit.el('div', { class: 'g-row', style: { marginBottom: '8px' } });
      const visual = kit.el('div');
      const prompt = kit.el('p', { class: 'g-prompt' });
      const options = kit.el('div');
      const feedback = kit.el('div', { class: 'g-feedback', 'aria-live': 'polite' });
      const trace = kit.el('div');
      const actions = kit.el('div', { class: 'g-actions' });
      root.append(modes, hud.node, tags, visual, prompt, options, feedback, trace, actions);

      function renderScenario(s) {
        visual.replaceChildren();
        if (!s) return;
        if (s.packets) {
          const legend = kit.el('div', { class: 'wl-legend' }, kit.el('span', { class: 'g-tag' }, 'Sender burst'), kit.el('span', { class: 'g-tag bad' }, 'Lost in the channel'));
          const cards = [];
          s.packets.forEach((packet, i) => {
            cards.push(kit.el('div', { class: `wl-packet${i === s.lostIndex ? ' is-lost' : ''}` }, `pkt${packet}`, kit.el('small', null, i === s.lostIndex ? 'lost' : 'arrives')));
            if (i < s.packets.length - 1) cards.push(kit.el('span', { class: 'wl-arrow', 'aria-hidden': 'true' }, '›'));
          });
          visual.append(legend, kit.el('div', { class: 'g-canvas wl-flow' }, kit.el('div', { class: 'wl-packets' }, cards)));
          return;
        }
        const cards = [];
        s.segments.forEach((segment, i) => {
          const lost = segment === s.missing;
          cards.push(kit.el('div', { class: `wl-packet${lost ? ' is-lost' : ''}` }, `seq ${segment.seq}`, kit.el('small', null, lost ? `${segment.length} bytes, lost` : `${segment.length} bytes`)));
          if (i < s.segments.length - 1) cards.push(kit.el('span', { class: 'wl-arrow', 'aria-hidden': 'true' }, '›'));
        });
        visual.append(kit.el('div', { class: 'wl-legend' }, kit.el('span', { class: 'g-tag' }, 'TCP sender burst'), kit.el('span', { class: 'g-tag bad' }, 'Lost segment')), kit.el('div', { class: 'g-canvas wl-flow' }, kit.el('div', { class: 'wl-packets' }, cards)));
      }

      function updateHud() {
        hud.set({ round: `${round + 1}/${ROUNDS}`, score, best: kit.best() });
      }

      function load() {
        current = makeRound(kit, mode, round);
        answered = false;
        updateHud();
        tags.replaceChildren(kit.el('span', { class: 'g-tag' }, current.protocol), kit.el('span', { class: 'g-tag' }, ['Easy', 'Medium', 'Hard'][current.level - 1]));
        renderScenario(current.scenario);
        prompt.textContent = current.question;
        trace.replaceChildren();
        actions.replaceChildren();
        kit.feedback(feedback, '', '');
        const choices = kit.choices(current.choices.map((choice, i) => `${i + 1}. ${choice}`), choose);
        options.replaceChildren(choices);
        options.buttons = choices.buttons;
      }

      function choose(index) {
        if (answered) return;
        answered = true;
        const buttons = options.buttons;
        const picked = current.choices[index];
        const rightIndex = current.choices.indexOf(current.answer);
        const correct = picked === current.answer;
        kit.lock(buttons);
        buttons[rightIndex].classList.add('is-right');
        if (!correct) buttons[index].classList.add('is-wrong');
        if (correct) score++;
        updateHud();
        kit.feedback(feedback, correct ? 'good' : 'bad', `${correct ? '**Correct.** ' : `**Not quite.** ${current.why}`}${correct ? current.why : ''}`);
        trace.replaceChildren(kit.el('div', { class: 'g-card' }, kit.el('strong', null, 'Trace'), kit.el('p', { style: { margin: '6px 0 0' } }, current.trace)));
        const next = kit.el('button', { class: 'btn', type: 'button' }, round === ROUNDS - 1 ? 'See score' : 'Next round');
        next.addEventListener('click', advance);
        actions.appendChild(next);
        next.focus();
      }

      function advance() {
        round++;
        if (round >= ROUNDS) {
          kit.finish({
            score,
            headline: `${score} / ${ROUNDS}`,
            summary: score >= 8
              ? 'You can trace the key difference: GBN repeats the outstanding suffix, while SR preserves and ACKs later packets individually.'
              : 'Follow the receiver first: GBN discards an out-of-order packet, SR buffers and ACKs it, and TCP keeps a cumulative ACK for the first missing byte.',
          });
          return;
        }
        load();
      }

      kit.onKey(e => {
        if (!answered && /^[1-4]$/.test(e.key)) {
          e.preventDefault();
          options.buttons[+e.key - 1].click();
        } else if (answered && e.key === 'Enter' && !e.defaultPrevented && !(e.target && e.target.tagName === 'BUTTON')) {
          e.preventDefault();
          const next = actions.querySelector('button');
          if (next) next.click();
        }
      });
      load();
    },
  });
})();
