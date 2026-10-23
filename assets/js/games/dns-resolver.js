(function () {
  'use strict';

  const ROUNDS = [
    {
      level: 1, mode: 'Usual pattern', active: 'Local DNS', seen: ['Host'], cache: 'No matching entry',
      state: 'The host has sent its usual recursive query to the local DNS server.',
      q: 'What role does the local DNS server play?',
      options: [
        'It is a fourth level in the DNS hierarchy, above the root.',
        'It is a nearby proxy outside the hierarchy; it forwards queries and can cache answers.',
        'It is authoritative for every hostname the host requests.',
        'It only sends the host a root-server address and does not forward queries.'
      ], answer: 1,
      why: 'The hierarchy has three levels: root, TLD, and authoritative. The local DNS server sits outside that hierarchy and acts as the host’s proxy, returning and caching results.'
    },
    {
      level: 1, mode: 'Usual pattern · iterative', active: 'Root', seen: ['Host', 'Local DNS'], cache: 'No TLD-server address cached',
      state: 'The local resolver asked a root server iteratively for www.example.edu. The root replies with a referral to .edu.',
      q: 'Who sends the next query?',
      options: [
        'The local DNS server asks an .edu TLD server.',
        'The root server asks the authoritative server for www.example.edu.',
        'The host asks the .edu TLD server directly.',
        'The root server returns the final IP address for www.example.edu.'
      ], answer: 0,
      why: 'An iterative reply gives the requester the best information available, usually a referral. The local DNS server follows the root’s referral and queries the .edu TLD server.'
    },
    {
      level: 1, mode: 'Usual pattern · iterative', active: 'TLD', seen: ['Host', 'Local DNS', 'Root'], cache: '.edu TLD address now known',
      state: 'The .edu TLD server replies with an NS record and address information for the authoritative server.',
      q: 'What does the local resolver do next?',
      options: [
        'It asks the root server to return the authoritative server’s answer.',
        'It asks the authoritative server for the hostname’s A record.',
        'It treats the TLD referral as the hostname’s final IP address.',
        'It sends the NS record to the host as if it were the A record.'
      ], answer: 1,
      why: 'The TLD points to an authoritative server; it usually does not hold the requested host’s A record. The local resolver asks that authoritative server for the final mapping.'
    },
    {
      level: 1, mode: 'Usual pattern · iterative', active: 'Authoritative', seen: ['Host', 'Local DNS', 'Root', 'TLD'], cache: 'Final A record not cached yet',
      state: 'The authoritative server returns the A record for www.example.edu to the local resolver.',
      q: 'How does the usual resolution finish?',
      options: [
        'The local resolver returns the A-record answer to the host and may cache it for its TTL.',
        'The authoritative server sends the answer directly to the host, bypassing the local resolver.',
        'The local resolver sends the answer back to the root, which delivers it to the host.',
        'The TLD server replaces the A record with a new referral before the host can use it.'
      ], answer: 0,
      why: 'The local DNS server made the iterative queries on the host’s behalf. It returns the final answer to the host and can cache the record until its TTL expires.'
    },
    {
      level: 2, mode: 'Usual pattern · iterative', active: 'Local DNS', seen: ['Host', 'Local DNS', 'Root', 'TLD', 'Authoritative'], cache: 'Nothing cached',
      state: 'The host asks its local resolver; the resolver must query root, TLD, and authoritative servers. Count every query and reply.',
      q: 'How many DNS messages does this uncached lookup use?',
      options: [], answer: 0,
      why: ''
    },
    {
      level: 2, mode: 'Cache hit', active: 'Local DNS', seen: ['Host', 'Local DNS'], cache: 'Final A record cached; TTL still valid',
      state: 'A second host asks the same local resolver for a name whose A record is still in the resolver’s cache.',
      q: 'What happens, and how many DNS messages cross between host and local resolver?',
      options: [
        'The local resolver answers from cache; 2 messages.',
        'The resolver must contact root, TLD, and authoritative servers; 8 messages.',
        'The host queries the authoritative server directly; 2 messages.',
        'The resolver asks the TLD server to validate the cached A record; 4 messages.'
      ], answer: 0,
      why: 'A DNS server may answer from its cache even when it is not authoritative. The host-to-local query and local-to-host reply are the only two messages.'
    },
    {
      level: 2, mode: 'Cache · expired record', active: 'Local DNS', seen: ['Host', 'Local DNS'], cache: '.edu TLD address valid; final A-record TTL expired',
      state: 'The cached hostname-to-IP record has expired, but the local resolver still has the .edu TLD server address cached.',
      q: 'Which server does the local resolver contact first, and how many messages will the lookup use?',
      options: [], answer: 0,
      why: 'An expired A record cannot answer the query. The cached TLD address lets the resolver skip root: host↔local, local↔TLD, and local↔authoritative use six messages.'
    },
    {
      level: 2, mode: 'Fully recursive model', active: 'Root', seen: ['Host', 'Local DNS'], cache: 'Nothing cached · theoretical all-recursive chain',
      state: 'In the all-recursive model, the local resolver sends a recursive query to the root server and asks it to obtain the final answer.',
      q: 'What does the root server do next in this model?',
      options: [
        'It contacts the TLD server on the requester’s behalf and keeps the query pending.',
        'It returns only a referral, leaving the local resolver to ask the TLD.',
        'It answers with the hostname’s final A record from the root zone.',
        'It tells the host to contact the authoritative server directly.'
      ], answer: 0,
      why: 'A recursive query asks the contacted server to obtain the answer. In the textbook’s fully recursive example, root asks TLD and holds the pending query; in practice, the usual pattern is iterative below the local resolver.'
    },
    {
      level: 3, mode: 'Fully recursive model', active: 'TLD', seen: ['Host', 'Local DNS', 'Root'], cache: 'Nothing cached · root is holding the recursive query',
      state: 'The root has recursively asked the .edu TLD server to obtain the answer for www.example.edu.',
      q: 'Who contacts the authoritative server next?',
      options: [
        'The .edu TLD server contacts it and keeps the query pending.',
        'The local resolver contacts it because recursive queries always return referrals.',
        'The host contacts it directly, since the root has completed its work.',
        'The root returns the final answer without involving an authoritative server.'
      ], answer: 0,
      why: 'In the fully recursive model, the TLD server does the next lookup on the root’s behalf. This contrasts with the usual iterative chain, where the local resolver contacts each level itself.'
    },
    {
      level: 3, mode: 'Fully recursive model', active: 'Authoritative', seen: ['Host', 'Local DNS', 'Root', 'TLD'], cache: 'Nothing cached · recursive replies return up the chain',
      state: 'The authoritative server has the final A record and received the recursive query from the TLD server.',
      q: 'Where does the authoritative server send its reply first, and how many messages did the full lookup use?',
      options: [], answer: 0,
      why: 'The authoritative server replies to its immediate requester, the TLD server; the answer then returns through root and local DNS to the host. Four query/reply exchanges still total eight messages.'
    }
  ];

  function messageCount(serverExchanges, hostExchange) {
    return (serverExchanges + (hostExchange ? 1 : 0)) * 2;
  }

  function buildRounds() {
    const rounds = ROUNDS.map(r => Object.assign({}, r));
    const uncached = messageCount(3, true);
    rounds[4].options = [
      `${uncached} messages: host↔local plus root, TLD, and authoritative exchanges.`,
      '6 messages: the root always answers from its cache.',
      '4 messages: only the host-local and authoritative exchanges count.',
      '10 messages: every recursive or iterative query needs two separate replies.'
    ];
    rounds[4].answer = 0;
    rounds[4].why = `There are four query/reply exchanges: host↔local plus local↔root, local↔TLD, and local↔authoritative. ${uncached} messages total.`;

    const cachedTldMessages = messageCount(2, true);
    rounds[6].options = [
      `The local resolver asks the .edu TLD server first; the lookup uses ${cachedTldMessages} messages.`,
      `It asks root first; the lookup uses ${messageCount(3, true)} messages.`,
      'It answers from the expired A record; the lookup uses 2 messages.',
      `It asks the authoritative server directly; the lookup uses ${messageCount(1, true)} messages.`
    ];
    rounds[6].answer = 0;
    rounds[6].why = `The expired A record must be looked up again. The still-valid .edu server address skips root, so host↔local plus TLD and authoritative exchanges use ${cachedTldMessages} messages.`;

    const recursiveMessages = messageCount(3, true);
    rounds[9].options = [
      `It replies to the TLD, which relays the answer through root and local DNS; ${recursiveMessages} messages total.`,
      `It replies directly to the host; ${messageCount(1, true)} messages total.`,
      `It replies to root, which discards the answer and asks the local resolver again; ${messageCount(4, true)} messages total.`,
      `It replies only to the TLD and ends the lookup there; ${messageCount(2, false)} messages total.`
    ];
    rounds[9].answer = 0;
    rounds[9].why = `Recursive replies return to the immediate requester at each level: authoritative→TLD→root→local→host. Recursion changes who contacts whom, not the total; ${recursiveMessages} messages.`;
    return rounds;
  }

  function addStyle() {
    if (document.getElementById('gm-dns-style')) return;
    const s = document.createElement('style');
    s.id = 'gm-dns-style';
    s.textContent = `
.gm-dns .dns-path { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 7px; margin: 12px 0 16px; }
.gm-dns .dns-node { min-width: 0; padding: 9px 7px; border: 1px solid var(--rule); border-radius: var(--r-md); background: var(--surface); text-align: center; color: var(--ink-2); font-size: .88rem; }
.gm-dns .dns-node b { display: block; color: var(--ink); font-size: .95rem; }
.gm-dns .dns-node.is-active { border-color: var(--u2); background: var(--u2-soft); color: var(--ink); box-shadow: inset 0 0 0 1px var(--u2); }
.gm-dns .dns-node.is-seen { border-color: var(--ack); background: var(--ack-soft); color: var(--ink); }
.gm-dns .dns-meta { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.7fr); gap: 10px; margin-bottom: 12px; }
.gm-dns .dns-meta > div { min-width: 0; padding: 9px 11px; border-radius: var(--r-md); background: var(--surface-2); }
.gm-dns .dns-meta small { display: block; color: var(--ink-2); font-size: .78rem; }
.gm-dns .dns-meta b { display: block; overflow-wrap: anywhere; }
@media (max-width: 520px) { .gm-dns .dns-path { grid-template-columns: repeat(2, minmax(0, 1fr)); } .gm-dns .dns-node:last-child { grid-column: span 2; } .gm-dns .dns-meta { grid-template-columns: 1fr; } }
`;
    document.head.appendChild(s);
  }

  NET.addGame({
    id: 'dns-resolver',
    title: 'DNS resolver',
    unit: 2,
    sections: ['dns'],
    blurb: 'Trace iterative and recursive DNS lookups, referrals, and cache hits through the resolver hierarchy.',
    how: [
      'Read each resolver state and choose the next action or reply.',
      'The run has 10 questions that move from basic referrals to caching and fully recursive resolution.',
      'Keys: 1–4 choose an answer, Enter continues after the explanation.'
    ],
    mount(root, kit) {
      addStyle();
      root.classList.add('gm-dns');
      const rounds = buildRounds();
      const hud = kit.hud([['round', 'Round'], ['score', 'Correct'], ['|'], ['best', 'Best']]);
      const stage = kit.el('div', { class: 'g-card' });
      const mode = kit.el('span', { class: 'g-tag' });
      const state = kit.el('p', { class: 'g-sub', style: { margin: '6px 0 0' } });
      const path = kit.el('div', { class: 'dns-path', 'aria-label': 'DNS resolution path' });
      const meta = kit.el('div', { class: 'dns-meta' });
      const cache = kit.el('div');
      const focus = kit.el('div');
      meta.append(cache, focus);
      const prompt = kit.el('p', { class: 'g-prompt' });
      const options = kit.el('div');
      const feedback = kit.el('div', { class: 'g-feedback', 'aria-live': 'polite' });
      const next = kit.el('button', { class: 'btn', type: 'button', hidden: true }, 'Next round');
      stage.append(mode, state);
      root.append(hud.node, stage, path, meta, prompt, options, feedback, kit.el('div', { class: 'g-actions' }, next));

      let roundIndex = 0, score = 0, answered = false, answerButtons = [];
      const actors = ['Host', 'Local DNS', 'Root', 'TLD', 'Authoritative'];

      function loadRound() {
        const r = rounds[roundIndex];
        answered = false;
        hud.set({ round: `${roundIndex + 1}/${rounds.length}`, score, best: kit.best() });
        mode.textContent = r.mode;
        state.textContent = r.state;
        path.replaceChildren(...actors.map(actor => {
          const cls = 'dns-node' + (actor === r.active ? ' is-active' : r.seen.includes(actor) ? ' is-seen' : '');
          return kit.el('div', { class: cls, 'aria-current': actor === r.active ? 'step' : null }, kit.el('b', null, actor), actor === r.active ? 'current step' : r.seen.includes(actor) ? 'visited' : 'in path');
        }));
        cache.replaceChildren(kit.el('small', null, 'Cache state'), kit.el('b', null, r.cache));
        focus.replaceChildren(kit.el('small', null, 'Focus'), kit.el('b', null, r.active));
        prompt.textContent = r.q;
        options.replaceChildren();
        feedback.textContent = '';
        feedback.className = 'g-feedback';
        next.hidden = true;
        const choiceOrder = kit.shuffle(r.options.map((_, i) => i));
        answerButtons = [];
        const wrap = kit.el('div', { class: 'g-opts', role: 'group', 'aria-label': 'Answer choices' });
        choiceOrder.forEach((choiceIndex, visualIndex) => {
          const b = kit.el('button', { class: 'g-opt', type: 'button', html: `${visualIndex + 1}. ${kit.fmt(r.options[choiceIndex])}` });
          b.addEventListener('click', () => submit(choiceIndex, b));
          wrap.appendChild(b);
          answerButtons.push({ button: b, choiceIndex });
        });
        options.appendChild(wrap);
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
          kit.finish({
            score,
            headline: `${score} / ${rounds.length}`,
            summary: 'DNS usually uses a recursive host-to-local query, iterative queries through the hierarchy, and caching to avoid repeated work. Fully recursive resolution changes who asks, not the eight-message count.',
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
