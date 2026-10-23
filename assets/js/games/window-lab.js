(function () {
  'use strict';

  const SCENARIOS = [
    {
      level: 1, type: 'arrival', base: 1, packet: 1, window: 4, buffered: [],
      state: 'Both receivers expect packet 1. Packet 1 arrives intact and in order.',
      q: 'Predict the receiver action and ACK behavior in each protocol.',
      why: 'Both receivers deliver the in-order packet. GBN ACKs the highest in-order packet cumulatively; SR sends an individual ACK for that packet. With no gap, both ACK number 1.'
    },
    {
      level: 1, type: 'arrival', base: 2, packet: 4, window: 4, buffered: [],
      state: 'Both receivers expect packet 2. Packet 2 was lost; intact packet 4 arrives out of order.',
      q: 'What does each receiver do with packet 4?',
      why: 'Textbook GBN discards out-of-order packet 4 and re-sends ACK(1), the last in-order packet. SR accepts packet 4 inside its receive window, buffers it, and individually ACKs 4 without delivering past the gap.'
    },
    {
      level: 2, type: 'arrival', base: 2, packet: 2, window: 4, buffered: [3],
      state: 'Packet 3 already arrived while packet 2 was missing: GBN discarded it, while SR buffered it and sent ACK(3). Now intact packet 2 arrives.',
      q: 'How does filling the gap change delivery and ACKs?',
      why: 'GBN delivers packet 2 and ACKs 2; it had discarded packet 3, so packet 3 must arrive again. SR delivers packet 2 and the already-buffered packet 3 in order, then individually ACKs packet 2 (ACK(3) was sent earlier).'
    },
    {
      level: 2, type: 'timeout', base: 2, next: 5, timed: 3, acked: [],
      state: 'Packets 2, 3, and 4 were sent and remain unacknowledged. The timer for packet 3 expires.',
      q: 'Which data packets are retransmitted?',
      why: 'GBN has one timer for the oldest unacknowledged packet and resends every sent, unACKed packet from base through next-1. SR has a logical timer per packet and resends only the packet whose timer expired.'
    },
    {
      level: 2, type: 'ack', base: 2, next: 6, ack: 4, acked: [],
      state: 'Packets 2 through 5 were sent; the sender receives ACK(4). No earlier packets in this window were acknowledged.',
      q: 'How does this ACK affect each sender window?',
      why: 'GBN ACK(4) is cumulative, so all packets through 4 are acknowledged and base moves to 5. SR ACK(4) marks only packet 4; because packet 2 is still the smallest unacknowledged packet, its base stays at 2.'
    },
    {
      level: 2, type: 'arrival', base: 4, packet: 2, window: 4, buffered: [],
      state: 'The receiver has already delivered packets through 3. A retransmitted packet 2 arrives intact after its ACK was lost.',
      q: 'What acknowledgment comes back, and is packet 2 delivered again?',
      why: 'GBN discards this old duplicate and re-ACKs the highest in-order packet, ACK(3). SR recognizes packet 2 in its recently received range, sends ACK(2) again, and does not deliver the data twice.'
    },
    {
      level: 3, type: 'arrival', base: 3, packet: 3, window: 4, buffered: [4],
      state: 'Packet 4 arrived earlier while packet 3 was missing: GBN discarded it and sent ACK(2); SR buffered it and sent ACK(4). Now packet 3 arrives intact.',
      q: 'What does each receiver deliver now?',
      why: 'GBN delivers packet 3 and ACKs 3; it has no buffered packet 4 to release. SR delivers packet 3 followed by buffered packet 4, slides its receive window to 5, and sends individual ACK(3).'
    },
    {
      level: 3, type: 'timeout', base: 2, next: 6, timed: 4, acked: [3, 5],
      state: 'Packets 2 through 5 were sent. In the SR sender, packets 3 and 5 are already individually ACKed; packet 4 times out. In GBN, the outstanding range is 2 through 5.',
      q: 'Which packets does each sender retransmit?',
      why: 'GBN retransmits the full sent-but-unACKed range, packets 2–5. SR retransmits only timed-out packet 4; it does not resend the already ACKed packets 3 or 5.'
    },
    {
      level: 3, type: 'ack-loss', base: 1, next: 4, ack: 2, timed: 1,
      state: 'Packets 1–3 all reached the receiver. ACK(1) was lost; ACK(2) arrives before packet 1’s timer expires.',
      q: 'If recovery is needed for packet 1, what does each sender do?',
      why: 'GBN ACK(2) cumulatively covers packets 1 and 2, so packet 1 does not time out and need retransmission. SR ACK(2) covers only packet 2; missing ACK(1) leaves packet 1 outstanding, so its timer causes packet 1 alone to be resent.'
    },
    {
      level: 3, type: 'tcp',
      state: 'A later TCP segment arrives while an earlier byte range is missing.',
      q: 'Which statement describes TCP relative to these two textbook protocols?',
      choices: [
        'TCP is exactly GBN: it discards all out-of-order data and retransmits every later segment on timeout.',
        'TCP is exactly SR: it uses only individual ACKs and one timer for every segment.',
        'TCP combines features: cumulative ACKs and one timer, often buffers out-of-order data, and SACK can report ranges; it is not exactly GBN or SR.',
        'TCP does not acknowledge data until every segment in the connection has arrived.'
      ], answer: 2,
      why: 'TCP uses cumulative ACKs and a timer for the oldest unACKed data, while implementations commonly buffer out-of-order data; SACK can report received ranges. The guide describes TCP recovery as a hybrid, not an exact implementation of GBN or SR.'
    }
  ];

  function seqRange(first, endExclusive) {
    const out = [];
    for (let n = first; n < endExclusive; n++) out.push(n);
    return out;
  }

  function receiverDecision(protocol, base, packet, window, priorBuffer) {
    if (protocol === 'GBN') {
      if (packet === base) return { action: 'deliver', delivered: [packet], ack: packet, nextBase: base + 1 };
      return { action: 'discard', delivered: [], ack: base - 1, nextBase: base };
    }
    if (packet >= base && packet < base + window) {
      const buffered = new Set(priorBuffer || []);
      buffered.add(packet);
      const delivered = [];
      let nextBase = base;
      while (buffered.has(nextBase)) {
        buffered.delete(nextBase);
        delivered.push(nextBase);
        nextBase++;
      }
      return {
        action: packet === base ? 'accept' : 'buffer',
        delivered,
        ack: packet,
        nextBase,
        buffered: Array.from(buffered).sort((a, b) => a - b)
      };
    }
    if (packet >= base - window && packet < base) {
      return { action: 're-ack', delivered: [], ack: packet, nextBase: base };
    }
    return { action: 'ignore', delivered: [], ack: null, nextBase: base };
  }

  function gbnTimeout(base, next) {
    return seqRange(base, next);
  }

  function srTimeout(packet, next, acked) {
    const sent = packet >= 0 && packet < next;
    return sent && !(acked || []).includes(packet) ? [packet] : [];
  }

  function gbnBaseAfterAck(base, ack) {
    return Math.max(base, ack + 1);
  }

  function srBaseAfterAck(base, ack, acked) {
    const set = new Set(acked || []);
    set.add(ack);
    let nextBase = base;
    while (set.has(nextBase)) nextBase++;
    return { nextBase, acked: Array.from(set).sort((a, b) => a - b) };
  }

  function listPackets(items) {
    return items.length ? items.map(n => `packet ${n}`).join(', ') : 'none';
  }

  function receiverSummary(protocol, result) {
    const ackKind = protocol === 'GBN' ? 'cumulative' : 'individual';
    if (result.action === 'deliver') {
      return `deliver ${listPackets(result.delivered)}; ${ackKind} ACK(${result.ack})`;
    }
    if (result.action === 'accept') {
      return `deliver ${listPackets(result.delivered)}; ${ackKind} ACK(${result.ack})`;
    }
    if (result.action === 'buffer') {
      return `buffer the packet; send ${ackKind} ACK(${result.ack}); deliver none yet`;
    }
    if (result.action === 'discard') {
      return `discard the packet; re-send ${ackKind} ACK(${result.ack})`;
    }
    if (result.action === 're-ack') {
      return `do not deliver again; re-send ${ackKind} ACK(${result.ack})`;
    }
    return 'ignore the packet and send no ACK';
  }

  function makeComparison(r) {
    const g = receiverDecision('GBN', r.base, r.packet, r.window, []);
    const s = receiverDecision('SR', r.base, r.packet, r.window, r.buffered);
    return `GBN: ${receiverSummary('GBN', g)}. SR: ${receiverSummary('SR', s)}.`;
  }

  function solve(r) {
    if (r.type === 'arrival') return makeComparison(r);
    if (r.type === 'timeout') {
      const g = gbnTimeout(r.base, r.next);
      const s = srTimeout(r.timed, r.next, r.acked);
      return `GBN retransmits ${listPackets(g)}. SR retransmits ${listPackets(s)}.`;
    }
    if (r.type === 'ack') {
      const gbnBase = gbnBaseAfterAck(r.base, r.ack);
      const sr = srBaseAfterAck(r.base, r.ack, r.acked);
      return `GBN treats ACK(${r.ack}) cumulatively; base moves to ${gbnBase}. SR marks only packet ${r.ack}; base stays at ${sr.nextBase}.`;
    }
    if (r.type === 'ack-loss') {
      const gbnBase = gbnBaseAfterAck(r.base, r.ack);
      const sr = srBaseAfterAck(r.base, r.ack, []);
      const gExpired = r.timed >= gbnBase;
      const sResent = srTimeout(r.timed, r.next, sr.acked);
      return `GBN: ACK(${r.ack}) covers packet ${r.timed}, so base moves to ${gbnBase} and packet ${r.timed} is not resent. SR: ACK(${r.ack}) covers only packet ${r.ack}; base stays at ${sr.nextBase}, so timeout resends ${listPackets(sResent)}.`;
    }
    return r.choices[r.answer];
  }

  function wrongOptions(r, correct) {
    if (r.type === 'arrival') {
      const g = receiverDecision('GBN', r.base, r.packet, r.window, []);
      const s = receiverDecision('SR', r.base, r.packet, r.window, r.buffered);
      const swapped = `GBN: ${receiverSummary('GBN', Object.assign({}, s, { action: s.action === 'accept' ? 'deliver' : s.action }))}. SR: ${receiverSummary('SR', Object.assign({}, g, { action: g.action === 'deliver' ? 'accept' : g.action }))}.`;
      return [
        swapped,
        `GBN buffers packet ${r.packet} and individually ACKs it; SR discards it and repeats ACK(${r.base - 1}).`,
        `GBN and SR both discard packet ${r.packet}, then re-send ACK(${r.base - 1}).`
      ];
    }
    if (r.type === 'timeout') {
      return [
        `GBN retransmits ${listPackets([r.timed])}. SR retransmits ${listPackets(gbnTimeout(r.base, r.next))}.`,
        `GBN retransmits ${listPackets(seqRange(r.base, r.next).filter(n => n !== r.timed))}. SR retransmits ${listPackets([])}.`,
        'GBN and SR both retransmit every packet in the sender window.'
      ];
    }
    if (r.type === 'ack') {
      return [
        `GBN marks only packet ${r.ack}; base stays at ${r.base}. SR treats it cumulatively; base moves to ${r.ack + 1}.`,
        `Both protocols treat ACK(${r.ack}) cumulatively and move base to ${r.ack + 1}.`,
        `Neither sender can advance its window until every sent packet is ACKed individually.`
      ];
    }
    if (r.type === 'ack-loss') {
      return [
        `GBN retransmits packet ${r.timed} because ACK(${r.ack}) only covers packet ${r.ack}. SR does not retransmit it because ACK(${r.ack}) is cumulative.`,
        'Both protocols avoid retransmission because ACK(2) covers packets 1 and 2.',
        'GBN resends packets 1–3; SR resends packets 1–3.'
      ];
    }
    return [
      'TCP uses cumulative ACKs and discards all out-of-order data, so it is exactly GBN.',
      'TCP uses only individual ACKs and one timer per segment, so it is exactly SR.',
      'TCP does not buffer data or retransmit lost segments.'
    ];
  }

  function addStyle() {
    if (document.getElementById('gm-window-style')) return;
    const s = document.createElement('style');
    s.id = 'gm-window-style';
    s.textContent = `
.gm-window .win-pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; margin: 12px 0; }
.gm-window .win-protocol { min-width: 0; padding: 10px 11px; border: 1px solid var(--rule); border-radius: var(--r-md); background: var(--surface); }
.gm-window .win-protocol b { display: block; margin-bottom: 4px; }
.gm-window .win-protocol p { margin: 0; color: var(--ink-2); font-size: .92rem; }
.gm-window .win-tcp { border-left: 3px solid var(--u3); }
.gm-window .win-answer { line-height: 1.45; }
@media (max-width: 520px) { .gm-window .win-pair { grid-template-columns: 1fr; } }
`;
    document.head.appendChild(s);
  }

  NET.addGame({
    id: 'window-lab',
    title: 'Window lab',
    unit: 3,
    sections: ['pipelining', 'tcp-rtt'],
    blurb: 'Compare Go-Back-N and Selective Repeat receivers, ACKs, windows, buffering, and retransmissions under loss.',
    how: [
      'For each trace, predict the result under both Go-Back-N and Selective Repeat.',
      'Track the receive base, cumulative versus individual ACKs, buffered data, and each protocol’s timeout rule.',
      'Keys: 1–4 choose an answer, Enter continues after the explanation.'
    ],
    mount(root, kit) {
      addStyle();
      root.classList.add('gm-window');
      const rounds = SCENARIOS.map(r => Object.assign({}, r));
      const hud = kit.hud([['round', 'Round'], ['score', 'Correct'], ['|'], ['best', 'Best']]);
      const level = kit.el('span', { class: 'g-tag' });
      const pair = kit.el('div', { class: 'win-pair', 'aria-label': 'Protocols being compared' });
      const gbnPanel = kit.el('div', { class: 'win-protocol' }, kit.el('b', null, 'Go-Back-N'), kit.el('p', null, 'cumulative ACK · discard out of order · one timer'));
      const srPanel = kit.el('div', { class: 'win-protocol' }, kit.el('b', null, 'Selective Repeat'), kit.el('p', null, 'individual ACK · buffer in window · per-packet timers'));
      pair.append(gbnPanel, srPanel);
      const state = kit.el('div', { class: 'g-card' });
      const stateText = kit.el('p', { style: { margin: '0' } });
      state.append(level, stateText);
      const tcpNote = kit.el('div', { class: 'g-card win-tcp', style: { marginTop: '10px' } },
        kit.el('b', null, 'TCP connection'),
        kit.el('span', null, 'TCP is a hybrid. It does not implement GBN or SR exactly.'));
      const prompt = kit.el('p', { class: 'g-prompt' });
      const answer = kit.el('div', { class: 'win-pair', hidden: true, 'aria-live': 'polite' });
      const gbnResult = kit.el('div', { class: 'win-protocol' }, kit.el('b', null, 'Go-Back-N result'), kit.el('p', { class: 'win-answer' }));
      const srResult = kit.el('div', { class: 'win-protocol' }, kit.el('b', null, 'Selective Repeat result'), kit.el('p', { class: 'win-answer' }));
      answer.append(gbnResult, srResult);
      const choices = kit.el('div');
      const feedback = kit.el('div', { class: 'g-feedback', 'aria-live': 'polite' });
      const next = kit.el('button', { class: 'btn', type: 'button', hidden: true }, 'Next round');
      root.append(hud.node, pair, state, tcpNote, prompt, answer, choices, feedback, kit.el('div', { class: 'g-actions' }, next));

      let roundIndex = 0, score = 0, answered = false, answerButtons = [];

      function currentOptions(r) {
        if (r.type === 'tcp') return { options: r.choices.slice(), right: r.answer, computed: r.choices[r.answer] };
        const correct = solve(r);
        const wrongs = wrongOptions(r, correct);
        const unique = [];
        [correct, ...wrongs].forEach(option => { if (!unique.includes(option)) unique.push(option); });
        while (unique.length < 4) unique.push('GBN and SR follow the same rule for every arrival, ACK, and timeout.');
        return { options: unique.slice(0, 4), right: 0, computed: correct };
      }

      function resultPanels(r, computed) {
        answer.hidden = false;
        if (r.type === 'tcp') {
          gbnResult.lastChild.textContent = 'Textbook model: cumulative ACKs, discard out of order, resend all sent-unACKed packets on timeout.';
          srResult.lastChild.textContent = 'Textbook model: individual ACKs, buffer out of order, resend only the timed-out packet.';
        } else {
          const parts = computed.split('. ');
          gbnResult.lastChild.textContent = parts[0] || computed;
          srResult.lastChild.textContent = parts.slice(1).join('. ') || computed;
        }
      }

      function loadRound() {
        const r = rounds[roundIndex];
        answered = false;
        hud.set({ round: `${roundIndex + 1}/${rounds.length}`, score, best: kit.best() });
        level.textContent = ['Easy', 'Steady', 'Hard'][r.level - 1];
        stateText.textContent = r.state;
        prompt.textContent = r.q;
        answer.hidden = true;
        choices.replaceChildren();
        feedback.textContent = '';
        feedback.className = 'g-feedback';
        next.hidden = true;
        const data = currentOptions(r);
        const order = kit.shuffle(data.options.map((_, i) => i));
        const wrap = kit.el('div', { class: 'g-opts', role: 'group', 'aria-label': 'Predictions for GBN and SR' });
        answerButtons = [];
        order.forEach((choiceIndex, visualIndex) => {
          const b = kit.el('button', { class: 'g-opt', type: 'button', html: `${visualIndex + 1}. ${kit.fmt(data.options[choiceIndex])}` });
          b.addEventListener('click', () => submit(choiceIndex, b, data));
          wrap.appendChild(b);
          answerButtons.push({ button: b, choiceIndex });
        });
        choices.appendChild(wrap);
        if (answerButtons[0]) answerButtons[0].button.focus();
      }

      function submit(choiceIndex, picked, data) {
        if (answered) return;
        answered = true;
        const r = rounds[roundIndex];
        const correct = choiceIndex === data.right;
        if (correct) score++;
        answerButtons.forEach(({ button, choiceIndex: i }) => {
          button.disabled = true;
          if (i === data.right) button.classList.add('is-right');
          else if (button === picked) button.classList.add('is-wrong');
        });
        resultPanels(r, data.computed);
        kit.feedback(feedback, correct ? 'good' : 'bad', `${correct ? 'Correct. ' : 'Not quite. '}${r.why}`);
        hud.set({ score });
        next.textContent = roundIndex === rounds.length - 1 ? 'See score' : 'Next round';
        next.hidden = false;
        next.focus();
      }

      function advance() {
        if (!answered) return;
        roundIndex++;
        if (roundIndex >= rounds.length) {
          kit.finish({
            score,
            headline: `${score} / ${rounds.length}`,
            summary: 'GBN trades a simple receiver for cumulative ACKs and broad retransmission. SR buffers and ACKs selectively to resend less. TCP combines features of both models and is not exactly either one.',
            againLabel: 'Play again'
          });
          return;
        }
        loadRound();
      }

      next.addEventListener('click', advance);
      kit.onKey(e => {
        if (!answered && /^[1-4]$/.test(e.key)) {
          e.preventDefault();
          const entry = answerButtons[Number(e.key) - 1];
          if (entry) entry.button.click();
        } else if (answered && e.key === 'Enter' && e.target !== next) {
          e.preventDefault();
          advance();
        }
      });
      loadRound();
    }
  });
})();
