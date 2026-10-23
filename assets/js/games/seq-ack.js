/* TCP sequence and cumulative-ACK drills. */
(function () {
  const ROUNDS = 10;
  const n = x => Number(x).toLocaleString('en-US');

  function segment(from, to, seq, ack, flags, data, note) {
    return { from, to, seq, ack, flags, data, note };
  }

  function makeRounds(k) {
    const rounds = [];

    // Easy: advance the byte number after ordinary data in either direction.
    {
      const seq = k.rand(10000, 50000), peerSeq = k.rand(60000, 90000);
      const len = k.pick([4, 8, 12, 20, 32]);
      rounds.push({
        kind: 'Sequence advancement',
        question: `A sends ${len} data bytes beginning at sequence ${n(seq)}. What sequence number does A use next?`,
        answer: seq + len,
        why: `Sequence numbers count data bytes. A uses ${n(seq)} + ${len} = ${n(seq + len)} next.`,
        segments: [
          segment('A', 'B', seq, peerSeq, ['ACK'], len, 'A sends ordinary data.'),
          segment('B', 'A', peerSeq, seq + len, ['ACK'], 0, 'B acknowledges the next byte it expects from A.'),
        ],
      });
    }
    {
      const seq = k.rand(20000, 55000), peerSeq = k.rand(70000, 95000);
      const len = k.pick([6, 10, 16, 24, 40]);
      rounds.push({
        kind: 'Sequence advancement',
        question: `B sends ${len} data bytes beginning at sequence ${n(seq)}. What sequence number does B use next?`,
        answer: seq + len,
        why: `The sequence field names the first data byte. Add the ${len} bytes: ${n(seq)} + ${len} = ${n(seq + len)}.`,
        segments: [
          segment('B', 'A', seq, peerSeq, ['ACK'], len, 'B sends ordinary data.'),
          segment('A', 'B', peerSeq, seq + len, ['ACK'], 0, 'A acknowledges the next byte it expects from B.'),
        ],
      });
    }

    // SYN consumes one sequence number even though it carries no data.
    {
      const client = k.rand(10000, 60000), server = k.rand(70000, 120000);
      rounds.push({
        kind: 'Handshake sequence',
        question: `A starts with a SYN at sequence ${n(client)}. What sequence number comes next after that SYN?`,
        answer: client + 1,
        why: `A SYN consumes one sequence number despite carrying no data: ${n(client)} + 1 = ${n(client + 1)}. The server's SYNACK acknowledges that next expected byte.`,
        segments: [
          segment('A', 'B', client, null, ['SYN'], 0, 'Connection request.'),
          segment('B', 'A', server, client + 1, ['SYN', 'ACK'], 0, 'The SYNACK acknowledges A’s SYN and carries B’s initial sequence number.'),
          segment('A', 'B', client + 1, server + 1, ['ACK'], 0, 'The final handshake ACK; the connection is established.'),
        ],
      });
    }

    // Ask for the ACK in a SYNACK: it names A's next expected byte.
    {
      const client = k.rand(15000, 65000), server = k.rand(80000, 130000);
      rounds.push({
        kind: 'Handshake ACK',
        question: `A sends SYN with sequence ${n(client)}. What ACK number belongs in B’s SYNACK?`,
        answer: client + 1,
        why: `The ACK field names the next byte expected from the other side. A’s SYN uses one sequence number, so B acknowledges ${n(client)} + 1 = ${n(client + 1)}.`,
        segments: [
          segment('A', 'B', client, null, ['SYN'], 0, 'A’s initial SYN.'),
          segment('B', 'A', server, '?', ['SYN', 'ACK'], 0, 'Fill in the ACK for A’s SYN.'),
          segment('A', 'B', client + 1, server + 1, ['ACK'], 0, 'A acknowledges B’s SYN.'),
        ],
      });
    }

    // A pure ACK has a sequence field but consumes no sequence space.
    {
      const client = k.rand(25000, 70000), server = k.rand(90000, 140000);
      const len = k.pick([5, 9, 14, 22]);
      const ackSeq = client + len;
      rounds.push({
        kind: 'Pure ACK',
        question: `A’s last segment is a pure ACK with sequence ${n(ackSeq)} and no data. What sequence number does A use next?`,
        answer: ackSeq,
        why: `A pure ACK consumes no sequence numbers: it has no data, SYN, or FIN. A’s next sequence number stays ${n(ackSeq)}.`,
        segments: [
          segment('A', 'B', client, server, ['ACK'], len, 'Earlier data from A.'),
          segment('B', 'A', server, ackSeq, ['ACK'], 0, 'B acknowledges A’s data.'),
          segment('A', 'B', ackSeq, server, ['ACK'], 0, 'This pure ACK carries no data.'),
        ],
      });
    }

    // Data and a piggybacked ACK advance only the sender's data sequence.
    {
      const aSeq = k.rand(30000, 80000), bSeq = k.rand(100000, 160000);
      const aLen = k.pick([7, 11, 18, 28]), bLen = k.pick([8, 13, 21, 36]);
      rounds.push({
        kind: 'Data with piggybacked ACK',
        question: `B sends ${bLen} data bytes with an ACK. Its sequence number is ${n(bSeq)}. What sequence number does B use next?`,
        answer: bSeq + bLen,
        why: `The ACK acknowledges A’s stream and does not change B’s own sequence advancement. B’s data uses ${bLen} numbers: ${n(bSeq)} + ${bLen} = ${n(bSeq + bLen)}.`,
        segments: [
          segment('A', 'B', aSeq, bSeq, ['ACK'], aLen, 'A sends data.'),
          segment('B', 'A', bSeq, aSeq + aLen, ['ACK'], bLen, 'B sends data and piggybacks the cumulative ACK for A.'),
        ],
      });
    }

    // FIN consumes a sequence number after any data carried by the segment.
    {
      const seq = k.rand(40000, 90000), peerSeq = k.rand(110000, 170000);
      const priorLen = k.pick([6, 10, 15, 24]);
      const finSeq = seq + priorLen;
      rounds.push({
        kind: 'FIN acknowledgment',
        question: `B has received A’s ${priorLen} data bytes, then an in-order FIN at sequence ${n(finSeq)}. What ACK number should B send?`,
        answer: finSeq + 1,
        why: `B acknowledges the next expected sequence-space position. FIN consumes one number, so ${n(finSeq)} + 1 = ${n(finSeq + 1)}.`,
        segments: [
          segment('A', 'B', seq, peerSeq, ['ACK'], priorLen, 'A sends the last data bytes.'),
          segment('A', 'B', finSeq, peerSeq, ['FIN', 'ACK'], 0, 'A closes its sending direction.'),
          segment('B', 'A', peerSeq, finSeq + 1, ['ACK'], 0, 'B acknowledges the FIN’s sequence number.'),
        ],
      });
    }
    {
      const seq = k.rand(45000, 95000), peerSeq = k.rand(120000, 180000);
      const len = k.pick([4, 9, 17, 26, 35]);
      rounds.push({
        kind: 'Data and FIN',
        question: `A sends ${len} data bytes and a FIN in one segment starting at sequence ${n(seq)}. What sequence number does A use next?`,
        answer: seq + len + 1,
        why: `Data uses ${len} numbers and FIN uses one more: ${n(seq)} + ${len} + 1 = ${n(seq + len + 1)}. The ACK field refers to B’s stream and does not affect this result.`,
        segments: [
          segment('A', 'B', seq, peerSeq, ['FIN', 'ACK'], len, 'The segment carries data and then FIN.'),
          segment('B', 'A', peerSeq, seq + len + 1, ['ACK'], 0, 'B cumulatively acknowledges the data and FIN.'),
        ],
      });
    }

    // Cumulative ACKs stay at the first missing byte, then cross buffered data.
    {
      const expected = k.rand(50000, 100000), peerSeq = k.rand(140000, 200000);
      const gap = k.pick([5, 9, 14, 20]), later = k.pick([8, 12, 18, 30]);
      rounds.push({
        kind: 'Cumulative ACK with a gap',
        question: `B next expects byte ${n(expected)}. A’s segment starting at ${n(expected + gap)} arrives first with ${later} bytes. What ACK number does B send?`,
        answer: expected,
        why: `A cumulative ACK reports the first missing byte. Byte ${n(expected)} is still missing, so B sends ACK ${n(expected)} even though later bytes arrived.`,
        segments: [
          segment('A', 'B', expected + gap, peerSeq, ['ACK'], later, 'Out of order: the byte range beginning at the first gap plus one.'),
          segment('B', 'A', peerSeq, expected, ['ACK'], 0, 'Duplicate cumulative ACK: B still expects the missing byte.'),
        ],
      });
    }
    {
      const expected = k.rand(55000, 105000), peerSeq = k.rand(145000, 205000);
      const gap = k.pick([6, 10, 15, 24]), later = k.pick([7, 13, 19, 32]);
      rounds.push({
        kind: 'Cumulative ACK after filling a gap',
        question: `B buffers ${later} out-of-order bytes starting at ${n(expected + gap)}. Then bytes ${n(expected)} through ${n(expected + gap - 1)} arrive. What ACK does B send now?`,
        answer: expected + gap + later,
        why: `With the receiver buffering out-of-order data, filling the ${gap}-byte gap makes the buffered range contiguous. B now expects byte ${n(expected)} + ${gap} + ${later} = ${n(expected + gap + later)}.`,
        segments: [
          segment('A', 'B', expected + gap, peerSeq, ['ACK'], later, 'Arrives first and is buffered beyond the gap.'),
          segment('B', 'A', peerSeq, expected, ['ACK'], 0, 'The cumulative ACK stays at the first missing byte.'),
          segment('A', 'B', expected, peerSeq, ['ACK'], gap, 'The missing bytes arrive and fill the gap.'),
          segment('B', 'A', peerSeq, expected + gap + later, ['ACK'], 0, 'ACK advances over the newly contiguous buffered bytes.'),
        ],
      });
    }

    return rounds;
  }

  function readInteger(value) {
    const s = String(value).trim();
    if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(s)) return NaN;
    return Number(s.replace(/,/g, ''));
  }

  NET.addGame({
    id: 'seq-ack',
    title: 'TCP sequence and ACK drills',
    unit: 3,
    sections: ['tcp-basics'],
    blurb: 'Work through randomized TCP exchanges and calculate byte sequence numbers and cumulative ACKs.',
    how: [
      'Read each segment exchange, then enter the requested sequence or ACK number.',
      'Sequence numbers advance by data bytes; SYN and FIN each consume one number, while a pure ACK consumes none.',
      'ACKs name the next byte expected and acknowledge only a contiguous prefix of the stream.',
      'Keys: Enter checks, then Enter again moves to the next round.',
    ],
    mount(root, kit) {
      const rounds = makeRounds(kit);
      let round = 0, score = 0, answered = false;
      const hud = kit.hud([['round', 'Round'], ['score', 'Correct'], ['|'], ['best', 'Best']]);
      const tag = kit.el('div', { class: 'g-row', style: { marginBottom: '8px' } });
      const prompt = kit.el('p', { class: 'g-prompt' });
      const reminder = kit.el('p', { class: 'g-sub' }, 'Seq counts data bytes; SYN and FIN each use one sequence number. ACK is the next byte expected from the other side.');
      const exchange = kit.el('div', { role: 'list', 'aria-label': 'TCP segment exchange' });
      const input = kit.numInput({ placeholder: 'whole number', label: 'Sequence or ACK number' });
      input.style.width = '190px';
      const check = kit.el('button', { class: 'btn', type: 'button' }, 'Check');
      const next = kit.el('button', { class: 'btn', type: 'button', hidden: true }, 'Next round');
      const fb = kit.el('div', { class: 'g-feedback', 'aria-live': 'polite' });
      root.append(hud.node, tag, exchange, reminder, prompt,
        kit.el('div', { class: 'g-row' }, input, check, next), fb);

      function load() {
        const current = rounds[round];
        answered = false;
        hud.set({ round: `${round + 1}/${ROUNDS}`, score, best: kit.best() });
        tag.replaceChildren(kit.el('span', { class: 'g-tag' }, current.kind));
        exchange.replaceChildren(...current.segments.map((s, i) => kit.el('div', { class: 'g-card', role: 'listitem' },
          kit.el('div', { class: 'g-row' },
            kit.el('strong', null, `${s.from} to ${s.to}`),
            kit.el('span', { class: 'g-tag' }, `Segment ${i + 1}`),
            kit.el('span', { class: 'g-tag' }, s.flags.join(' + '))),
          kit.el('div', { class: 'g-mono', style: { marginTop: '6px', overflowWrap: 'anywhere' } },
            `seq ${n(s.seq)} · ack ${s.ack === null ? '—' : s.ack === '?' ? '?' : n(s.ack)} · data ${s.data} ${s.data === 1 ? 'byte' : 'bytes'}`),
          s.note ? kit.el('p', { class: 'g-sub', style: { margin: '6px 0 0' } }, s.note) : null)));
        prompt.textContent = current.question;
        input.value = '';
        input.disabled = false;
        input.className = 'g-input';
        check.hidden = false;
        next.hidden = true;
        kit.feedback(fb, '', '');
        input.focus();
      }

      function submit() {
        if (answered) return;
        const value = readInteger(input.value);
        if (!Number.isFinite(value)) {
          kit.feedback(fb, 'part', 'Enter a whole sequence or ACK number.');
          input.focus();
          return;
        }
        const current = rounds[round];
        const correct = value === current.answer;
        answered = true;
        if (correct) score++;
        input.disabled = true;
        input.classList.add(correct ? 'is-right' : 'is-wrong');
        check.hidden = true;
        next.hidden = false;
        next.textContent = round === ROUNDS - 1 ? 'See score' : 'Next round';
        hud.set({ score });
        kit.feedback(fb, correct ? 'good' : 'bad', `${correct ? '**Correct.** ' : `**Not quite.** The answer is ${n(current.answer)}. `}${current.why}`);
        next.focus();
      }

      function advance() {
        round++;
        if (round >= ROUNDS) {
          kit.finish({
            score,
            headline: `${score} / ${ROUNDS}`,
            summary: score >= 8
              ? 'Sequence numbers count bytes plus SYN and FIN; cumulative ACKs name the first byte still expected.'
              : 'For each direction, count data bytes and control flags that consume sequence space. An ACK names the next byte expected in the opposite direction.',
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
