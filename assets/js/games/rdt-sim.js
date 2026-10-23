(function () {
  'use strict';

  let savedMode = 'mixed';

  const RDT21 = [
    {
      level: 1, protocol: 'rdt2.1', side: 'Sender', state: 'Ready to send sequence 0', event: 'The application hands the sender new data.',
      q: 'What does the sender do?', options: [
        'Send packet 0 with a checksum and wait for ACK or NAK.',
        'Send packet 1 and start a timer.',
        'Wait for the receiver to request packet 0.',
        'Send packet 0, then immediately send packet 1 before an ACK.'
      ], answer: 0,
      why: 'rdt2.1 is stop-and-wait. The sender puts sequence number 0 and a checksum on the data packet, sends it, and waits for feedback; rdt2.1 has no loss timer.'
    },
    {
      level: 1, protocol: 'rdt2.1', side: 'Sender', state: 'Waiting for ACK or NAK for packet 0', event: 'An uncorrupted ACK arrives.',
      q: 'What is the sender’s next state?', options: [
        'Ready to send sequence 1.',
        'Resend packet 0 because every ACK is ambiguous.',
        'Wait for a timeout and retransmit packet 0.',
        'Ready to send sequence 0 again.'
      ], answer: 0,
      why: 'A valid ACK confirms packet 0. The alternating sequence number advances modulo 2, so the sender becomes ready to send sequence 1.'
    },
    {
      level: 1, protocol: 'rdt2.1', side: 'Receiver', state: 'Waiting for sequence 0', event: 'An intact data packet with sequence number 0 arrives.',
      q: 'What action does the receiver take?', options: [
        'Deliver the data, send ACK, and wait for sequence 1.',
        'Send NAK and remain waiting for sequence 0.',
        'Send ACK but do not deliver the data.',
        'Deliver the data and keep waiting for sequence 0.'
      ], answer: 0,
      why: 'The intact packet has the expected sequence number. The receiver delivers it once, sends an ACK, and changes state to expect sequence 1.'
    },
    {
      level: 1, protocol: 'rdt2.1', side: 'Receiver', state: 'Waiting for sequence 1', event: 'Packet 0 arrives intact again after its earlier ACK was corrupted.',
      q: 'How does the receiver handle this retransmission?', options: [
        'Send ACK again, but do not deliver packet 0 a second time.',
        'Deliver packet 0 again and send ACK.',
        'Send NAK because packet 0 has the wrong sequence number.',
        'Ignore the packet and send no feedback.'
      ], answer: 0,
      why: 'The receiver is waiting for 1, so intact packet 0 is a duplicate. It ACKs the duplicate to help the sender recover, but does not deliver its data again.'
    },
    {
      level: 1, protocol: 'rdt2.1', side: 'Receiver', state: 'Waiting for sequence 1', event: 'An intact data packet with sequence number 1 arrives.',
      q: 'What action matches the receiver FSM?', options: [
        'Deliver the data, send ACK, and wait for sequence 0.',
        'Send NAK and stay in the same state.',
        'Send ACK but do not deliver the data.',
        'Deliver the data and continue waiting for sequence 1.'
      ], answer: 0,
      why: 'Packet 1 is intact and expected. The receiver delivers it, acknowledges it, and flips its expected sequence number back to 0.'
    },
    {
      level: 2, protocol: 'rdt2.1', side: 'Receiver', state: 'Waiting for sequence 0', event: 'A data packet arrives with a checksum error.',
      q: 'What feedback does the rdt2.1 receiver send?', options: [
        'NAK; it does not deliver the corrupted data and remains waiting for 0.',
        'ACK; it delivers the data and changes to waiting for 1.',
        'ACK for the last good packet; rdt2.1 has no NAK.',
        'Nothing; a timer at the receiver handles corruption.'
      ], answer: 0,
      why: 'rdt2.1 uses checksum detection and ACK/NAK feedback. A corrupted data packet is not delivered; the receiver sends a NAK and keeps its current expected sequence number.'
    },
    {
      level: 2, protocol: 'rdt2.1', side: 'Receiver', state: 'Waiting for sequence 0', event: 'An intact packet with sequence number 1 arrives.',
      q: 'What does the receiver infer?', options: [
        'It is a duplicate of the last packet; send ACK and do not deliver it.',
        'It is new data; deliver it and switch to waiting for 1.',
        'It is corrupted; send NAK and discard it.',
        'It is out of order; buffer it until packet 0 arrives.'
      ], answer: 0,
      why: 'In stop-and-wait, an intact packet with the unexpected number is a retransmission of the last packet. The receiver ACKs it but does not deliver it again; rdt2.1 does not buffer out-of-order data.'
    },
    {
      level: 2, protocol: 'rdt2.1', side: 'Receiver', state: 'Waiting for sequence 1', event: 'A data packet arrives with a checksum error.',
      q: 'What response is correct?', options: [
        'Send NAK and remain waiting for sequence 1.',
        'Send ACK1 and switch to waiting for sequence 0.',
        'Deliver the packet because its sequence number can still be read.',
        'Wait for a timer to expire before sending feedback.'
      ], answer: 0,
      why: 'The checksum says the packet is corrupted, so the sequence number cannot make it safe to deliver. The receiver sends NAK and stays in its current state.'
    },
    {
      level: 3, protocol: 'rdt2.1', side: 'Sender', state: 'Waiting for ACK or NAK for packet 0', event: 'The feedback packet is corrupted.',
      q: 'What does the sender retransmit?', options: [
        'The saved packet 0, still labeled sequence 0.',
        'The same data relabeled as sequence 1.',
        'A new packet 1, because the receiver may have accepted packet 0.',
        'Nothing; rdt2.1 waits for a timeout.'
      ], answer: 0,
      why: 'A corrupted ACK/NAK makes the sender retransmit its saved packet. It must keep the original sequence number so the receiver recognizes a duplicate instead of delivering old data twice.'
    },
    {
      level: 3, protocol: 'rdt2.1', side: 'Sender', state: 'Waiting for ACK or NAK for packet 1', event: 'A valid NAK arrives.',
      q: 'What is the sender’s action?', options: [
        'Retransmit packet 1 with sequence number 1.',
        'Advance to sequence 0 and send new data.',
        'Wait for a timer, then retransmit packet 0.',
        'Retransmit packet 1 but change its sequence number to 0.'
      ], answer: 0,
      why: 'A NAK asks for the current packet again. The retransmission preserves sequence number 1; the sender advances only after a valid ACK.'
    }
  ];

  const RDT30 = [
    {
      level: 1, protocol: 'rdt3.0', side: 'Sender', state: 'Ready to send sequence 0', event: 'The application hands the sender new data.',
      q: 'What does the sender do?', options: [
        'Send packet 0, start the timer, and wait for ACK0.',
        'Send packet 0 without a timer and wait for either ACK or NAK.',
        'Send packet 1 and start a timer for both packets.',
        'Wait until the receiver sends a request.'
      ], answer: 0,
      why: 'rdt3.0 adds a countdown timer to the alternating-bit protocol. The sender starts it on every send and waits for the matching ACK.'
    },
    {
      level: 1, protocol: 'rdt3.0', side: 'Sender', state: 'Waiting for ACK0', event: 'An intact ACK0 arrives.',
      q: 'What does the sender do next?', options: [
        'Stop the timer and become ready to send sequence 1.',
        'Keep the timer running and resend packet 0.',
        'Ignore ACK0 because ACKs do not carry sequence numbers.',
        'Stop the timer and become ready to send sequence 0 again.'
      ], answer: 0,
      why: 'The correct ACK stops the timer and lets the sender advance to the other sequence number. A duplicate or wrong-numbered ACK would not advance it.'
    },
    {
      level: 1, protocol: 'rdt3.0', side: 'Sender', state: 'Ready to send sequence 1', event: 'The application hands the sender new data.',
      q: 'Which action starts the next transfer?', options: [
        'Send packet 1 and start the timer for it.',
        'Send packet 0 and start the timer for it.',
        'Send packets 1 and 0 back to back, then start one timer.',
        'Wait for ACK1 before sending packet 1.'
      ], answer: 0,
      why: 'rdt3.0 is stop-and-wait with alternating sequence numbers. After ACK0, the next new data packet is sequence 1 and its timer starts when it is sent.'
    },
    {
      level: 1, protocol: 'rdt3.0', side: 'Receiver', state: 'Waiting for sequence 0', event: 'An intact packet 0 arrives.',
      q: 'What response does the receiver make?', options: [
        'Deliver the data, send ACK0, and wait for sequence 1.',
        'Send ACK1 and remain waiting for sequence 0.',
        'Deliver the data but send no ACK.',
        'Send NAK and wait for packet 0 again.'
      ], answer: 0,
      why: 'rdt3.0 uses the rdt2.2 receiver: an intact expected packet is delivered and ACKed with its sequence number, then the receiver changes its expected number.'
    },
    {
      level: 1, protocol: 'rdt3.0', side: 'Receiver', state: 'Waiting for sequence 1', event: 'An intact packet 1 arrives.',
      q: 'What action is correct?', options: [
        'Deliver the data, send ACK1, and wait for sequence 0.',
        'Send ACK0 and stay waiting for sequence 1.',
        'Send NAK1 because the protocol uses negative ACKs.',
        'Deliver the data and stay waiting for sequence 1.'
      ], answer: 0,
      why: 'The expected, uncorrupted packet is delivered once and acknowledged. The receiver then expects sequence 0.'
    },
    {
      level: 2, protocol: 'rdt3.0', side: 'Receiver', state: 'Waiting for sequence 0', event: 'A data packet arrives corrupted.',
      q: 'What does the rdt3.0 receiver send?', options: [
        'ACK1, for the last correctly received packet; do not deliver and stay waiting for 0.',
        'NAK0 and switch to waiting for sequence 1.',
        'ACK0 and deliver the corrupted data.',
        'No reply; the receiver starts a timer.'
      ], answer: 0,
      why: 'The rdt3.0 receiver is the rdt2.2 receiver: it sends an ACK for the last correctly received packet (ACK1 here), does not deliver corrupted data, and stays in the same state.'
    },
    {
      level: 2, protocol: 'rdt3.0', side: 'Receiver', state: 'Waiting for sequence 1', event: 'Packet 0 arrives intact after the ACK for packet 0 was lost.',
      q: 'How does the receiver treat this repeated packet?', options: [
        'Send ACK0 again and do not deliver packet 0 again.',
        'Deliver packet 0 again and send ACK0.',
        'Send NAK1 because packet 0 is out of order.',
        'Ignore the packet; the sender’s timer will stop automatically.'
      ], answer: 0,
      why: 'The receiver already delivered packet 0 and now expects 1. It recognizes the retransmitted 0 as a duplicate, re-ACKs it, and avoids duplicate delivery.'
    },
    {
      level: 2, protocol: 'rdt3.0', side: 'Sender', state: 'Waiting for ACK0', event: 'The ACK that arrives is corrupted.',
      q: 'What does the sender do immediately?', options: [
        'Ignore it and let the timer handle recovery.',
        'Retransmit packet 0 immediately, then start a new timer.',
        'Advance to sequence 1 because some ACK arrived.',
        'Send packet 1 as a probe.'
      ], answer: 0,
      why: 'rdt3.0 ignores a corrupted ACK or a wrong-numbered ACK while waiting. The timer remains responsible for recovery; immediate retransmission on every bad ACK could multiply duplicates.'
    },
    {
      level: 3, protocol: 'rdt3.0', side: 'Sender', state: 'Waiting for ACK1', event: 'A valid ACK0 arrives while the sender expects ACK1.',
      q: 'What is the correct sender action?', options: [
        'Ignore ACK0 and continue waiting for ACK1 or timeout.',
        'Retransmit packet 1 immediately because ACK0 is a NAK.',
        'Stop the timer and advance to sequence 0.',
        'Deliver packet 1 to the receiver again.'
      ], answer: 0,
      why: 'ACK0 does not acknowledge the packet currently outstanding. The rdt3.0 sender ignores it and leaves the timer running until ACK1 arrives or the timer expires.'
    },
    {
      level: 3, protocol: 'rdt3.0', side: 'Sender', state: 'Waiting for ACK0; packet 0 was lost', event: 'The timer expires before ACK0 arrives.',
      q: 'What does the sender do?', options: [
        'Retransmit saved packet 0 and restart the timer.',
        'Send packet 1 because packet 0 may have arrived.',
        'Wait indefinitely; rdt3.0 cannot handle data loss.',
        'Send ACK0 to ask the receiver whether packet 0 arrived.'
      ], answer: 0,
      why: 'The sender cannot tell whether data or its ACK was lost, or merely delayed. On timeout it retransmits the current saved packet with its original sequence number and restarts the timer.'
    },
    {
      level: 3, protocol: 'rdt3.0', side: 'Sender', state: 'Waiting for ACK1; packet 1 arrived but its ACK was lost', event: 'The timer expires.',
      q: 'What does the sender do, and what will the receiver do with that retransmission?', options: [
        'Resend packet 1 and restart the timer; receiver re-sends ACK1 without delivering twice.',
        'Advance to sequence 0; the receiver has already accepted packet 1.',
        'Resend packet 0; the receiver treats it as new data.',
        'Send no packet; an ACK loss is not recoverable.'
      ], answer: 0,
      why: 'A lost ACK looks like a lost data packet to the sender, so timeout retransmits packet 1. The receiver recognizes the duplicate sequence number, does not deliver it again, and sends ACK1 again.'
    }
  ];

  function mixedRounds() {
    return [
      RDT21[0], RDT30[0], RDT21[2], RDT30[3], RDT21[5], RDT30[5],
      RDT21[6], RDT30[6], RDT21[8], RDT30[7], RDT30[10]
    ].map(r => Object.assign({}, r));
  }

  function addStyle() {
    if (document.getElementById('gm-rdt-style')) return;
    const s = document.createElement('style');
    s.id = 'gm-rdt-style';
    s.textContent = `
.gm-rdt .rdt-flow { display: grid; grid-template-columns: minmax(0, 1fr) minmax(100px, .7fr) minmax(0, 1fr); gap: 8px; align-items: stretch; margin: 12px 0 16px; }
.gm-rdt .rdt-side { min-width: 0; padding: 10px; border: 1px solid var(--rule); border-radius: var(--r-md); background: var(--surface); color: var(--ink-2); text-align: center; }
.gm-rdt .rdt-side b { display: block; color: var(--ink); }
.gm-rdt .rdt-side.is-active { background: var(--u3-soft); border-color: var(--u3); color: var(--ink); }
.gm-rdt .rdt-state { margin: 0 0 8px; overflow-wrap: anywhere; }
.gm-rdt .rdt-event { margin: 0; }
@media (max-width: 480px) { .gm-rdt .rdt-flow { grid-template-columns: 1fr; } }
`;
    document.head.appendChild(s);
  }

  NET.addGame({
    id: 'rdt-sim',
    title: 'RDT state simulator',
    unit: 3,
    sections: ['rdt-basics', 'rdt3'],
    blurb: 'Choose the sender or receiver FSM action for rdt2.1 and rdt3.0 packets, feedback, duplicates, and timeouts.',
    how: [
      'Read the protocol, current side state, and channel event, then choose its FSM action.',
      'Select a protocol chip for a focused run, or mix both protocols.',
      'Keys: 1–4 choose an answer, Enter continues after the explanation.'
    ],
    mount(root, kit) {
      addStyle();
      root.classList.add('gm-rdt');
      const modes = kit.el('div', { class: 'g-modes', role: 'group', 'aria-label': 'Protocol practice' });
      const modeOptions = [
        ['mixed', 'Compare both'], ['rdt21', 'rdt2.1'], ['rdt30', 'rdt3.0']
      ];
      modeOptions.forEach(([key, label]) => {
        const b = kit.el('button', { class: 'chip u3', type: 'button', 'aria-pressed': String(savedMode === key) }, label);
        b.addEventListener('click', () => {
          if (savedMode !== key) { savedMode = key; kit.restart(); }
        });
        modes.appendChild(b);
      });
      const rounds = savedMode === 'rdt21' ? RDT21.map(r => Object.assign({}, r))
        : savedMode === 'rdt30' ? RDT30.map(r => Object.assign({}, r)) : mixedRounds();
      const hud = kit.hud([['round', 'Round'], ['score', 'Correct'], ['|'], ['best', 'Best']]);
      const protocolTag = kit.el('span', { class: 'g-tag' });
      const levelTag = kit.el('span', { class: 'g-tag' });
      const head = kit.el('div', { class: 'g-row', style: { marginBottom: '8px' } }, protocolTag, levelTag);
      const flow = kit.el('div', { class: 'rdt-flow', 'aria-label': 'Sender, unreliable channel, and receiver' });
      const sender = kit.el('div', { class: 'rdt-side' }, kit.el('b', null, 'Sender'), 'rdt FSM');
      const channel = kit.el('div', { class: 'rdt-side' }, kit.el('b', null, 'Unreliable channel'), 'may corrupt or lose packets');
      const receiver = kit.el('div', { class: 'rdt-side' }, kit.el('b', null, 'Receiver'), 'rdt FSM');
      flow.append(sender, channel, receiver);
      const state = kit.el('div', { class: 'g-card' });
      const stateLine = kit.el('p', { class: 'rdt-state' });
      const eventLine = kit.el('p', { class: 'rdt-event g-sub' });
      state.append(stateLine, eventLine);
      const prompt = kit.el('p', { class: 'g-prompt' });
      const choices = kit.el('div');
      const feedback = kit.el('div', { class: 'g-feedback', 'aria-live': 'polite' });
      const next = kit.el('button', { class: 'btn', type: 'button', hidden: true }, 'Next round');
      root.append(modes, hud.node, head, flow, state, prompt, choices, feedback, kit.el('div', { class: 'g-actions' }, next));

      let roundIndex = 0, score = 0, answered = false, answerButtons = [];

      function loadRound() {
        const r = rounds[roundIndex];
        answered = false;
        hud.set({ round: `${roundIndex + 1}/${rounds.length}`, score, best: kit.best() });
        protocolTag.textContent = r.protocol;
        levelTag.textContent = ['Easy', 'Steady', 'Hard'][r.level - 1];
        sender.classList.toggle('is-active', r.side === 'Sender');
        receiver.classList.toggle('is-active', r.side === 'Receiver');
        channel.lastChild.textContent = r.protocol === 'rdt2.1' ? 'may corrupt; does not lose packets' : 'may corrupt or lose packets';
        channel.classList.toggle('is-active', /lost|corrupt|duplicate|retransmission/i.test(r.event));
        stateLine.innerHTML = `<b>State:</b> ${kit.fmt(r.state)}`;
        eventLine.innerHTML = `<b>Event:</b> ${kit.fmt(r.event)}`;
        prompt.textContent = r.q;
        choices.replaceChildren();
        feedback.textContent = '';
        feedback.className = 'g-feedback';
        next.hidden = true;
        const order = kit.shuffle(r.options.map((_, i) => i));
        const wrap = kit.el('div', { class: 'g-opts', role: 'group', 'aria-label': 'FSM actions' });
        answerButtons = [];
        order.forEach((choiceIndex, visualIndex) => {
          const b = kit.el('button', { class: 'g-opt', type: 'button', html: `${visualIndex + 1}. ${kit.fmt(r.options[choiceIndex])}` });
          b.addEventListener('click', () => submit(choiceIndex, b));
          wrap.appendChild(b);
          answerButtons.push({ button: b, choiceIndex });
        });
        choices.appendChild(wrap);
        if (answerButtons[0]) answerButtons[0].button.focus();
      }

      function submit(choiceIndex, picked) {
        if (answered) return;
        answered = true;
        const r = rounds[roundIndex];
        const correct = choiceIndex === r.answer;
        if (correct) score++;
        answerButtons.forEach(({ button, choiceIndex: i }) => {
          button.disabled = true;
          if (i === r.answer) button.classList.add('is-right');
          else if (button === picked) button.classList.add('is-wrong');
        });
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
          const label = savedMode === 'rdt21' ? 'rdt2.1 adds 1-bit sequence numbers to handle corrupted data and feedback, but it does not handle packet loss.'
            : savedMode === 'rdt30' ? 'rdt3.0 adds a timer to rdt2.2; duplicates are re-ACKed without a second delivery.'
              : 'rdt2.1 retransmits on corrupted feedback; rdt3.0 ignores bad ACKs until its timer expires. Both use sequence numbers to prevent duplicate delivery.';
          kit.finish({ score, headline: `${score} / ${rounds.length}`, summary: label, againLabel: 'Play again' });
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
