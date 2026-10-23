(function () {
  const ROUNDS = 10;
  function optionsFor(answer, distractors, kit) {
    return kit.shuffle([answer].concat(distractors)).slice(0, 4);
  }

  function makeQuestion(index, kit) {
    const questions = [
      {
        prompt: 'HTTP is an application protocol. Which layer does it belong to?', answer: 'Application layer',
        wrong: ['Transport layer', 'Network layer', 'Link layer'],
        why: 'HTTP defines Web request and response messages, so it is an **application-layer** protocol. TCP or QUIC carries those messages below it.'
      },
      {
        prompt: 'A browser opens ordinary HTTP without TLS. What is the default server port?', answer: 'Port 80',
        wrong: ['Port 25', 'Port 53', 'Port 443'],
        why: 'The default port for HTTP is **80**. Port 25 is SMTP, port 53 is DNS, and port 443 is the usual HTTPS service port.'
      },
      {
        prompt: 'Which item is a transport-layer protocol?', answer: 'TCP',
        wrong: ['HTTP', 'IP', 'Ethernet'],
        why: '**TCP** is a transport protocol. HTTP is application layer, IP is network layer, and Ethernet is link layer.'
      },
      {
        prompt: 'Which pairing identifies the usual server-to-server SMTP service?', answer: 'SMTP over TCP, destination port 25',
        wrong: ['SMTP over UDP, destination port 25', 'HTTP over TCP, destination port 25', 'SMTP over TCP, destination port 53'],
        why: 'SMTP transfers mail between mail servers using **TCP port 25**. Port numbers identify the destination process on a host.'
      },
      {
        prompt: 'For a typical DNS lookup of a record, which transport and port are commonly used?', answer: 'UDP, port 53',
        wrong: ['TCP, port 80', 'UDP, port 25', 'TCP, port 443'],
        why: 'A typical DNS query uses **UDP port 53**. DNS can also use TCP port 53, including for zone transfers and some larger exchanges.'
      },
      {
        prompt: 'A router forwards an IP datagram. Which protocol layer’s fields does it use in the basic Internet model?', answer: 'Network layer (IP)',
        wrong: ['Application layer (HTTP)', 'Transport layer (TCP or UDP ports)', 'Link layer only'],
        why: 'A router forwards using **network-layer IP fields**. In the basic model it does not inspect TCP/UDP ports; end hosts use those ports to deliver data to processes.'
      },
      {
        prompt: 'A browser uses traditional HTTPS with TLS over TCP. Which pairing is correct?', answer: 'Application protocol HTTPS, TCP transport, server port 443',
        wrong: ['Transport protocol HTTPS, UDP transport, server port 80', 'Application protocol HTTPS, TCP transport, server port 25', 'Network protocol HTTPS, IP transport, server port 443'],
        why: 'Traditional HTTPS uses **TCP port 443**, with TLS protecting the application data. TLS is not a separate transport protocol.'
      },
      {
        prompt: 'Which description matches HTTP/3?', answer: 'HTTP is application layer; QUIC runs over UDP, commonly on server port 443',
        wrong: ['HTTP/3 runs directly over TCP port 80', 'QUIC is a network-layer protocol carried by TCP', 'HTTP/3 replaces IP and uses port 443 itself'],
        why: 'HTTP/3 runs over **QUIC**, which is implemented above UDP; HTTP/3 commonly uses UDP port 443. It does not use TCP.'
      },
      {
        prompt: 'Which statement about process delivery is correct?', answer: 'IP gets a datagram to a host; the transport destination port selects a process/socket there',
        wrong: ['The IP address alone selects a process on the host', 'The port number identifies the destination host across networks', 'Routers use the application port to choose a Web page'],
        why: 'An **IP address identifies the destination host** and a **transport port identifies a socket/process** on that host. Routers forward using IP-layer information.'
      },
      {
        prompt: 'A Web message is encapsulated for transmission. Which sequence names its units from application layer down to the link?', answer: 'HTTP message, TCP segment, IP datagram, link-layer frame',
        wrong: ['HTTP segment, IP frame, TCP datagram, Ethernet message', 'TCP message, HTTP datagram, link segment, IP frame', 'IP message, HTTP segment, Ethernet datagram, TCP frame'],
        why: 'The application creates an **HTTP message**; TCP carries it in a **segment**, IP carries that in a **datagram**, and the link layer sends the datagram in a **frame**.'
      }
    ];
    const q = questions[index];
    return { prompt: q.prompt, answer: q.answer, options: optionsFor(q.answer, q.wrong, kit), why: q.why };
  }

  NET.addGame({
    id: 'match-blitz',
    title: 'Match blitz',
    unit: 0,
    sections: ['app-principles', 'layers', 'email', 'transport-intro', 'udp'],
    blurb: 'Match familiar Internet protocols to their layer, transport, and well-known port.',
    how: [
      'Choose the correct protocol, layer, transport, or port relationship in each round.',
      'Rounds move from direct matches to protocol-stack details. Read the explanation after every answer.',
      'Keys: 1–4 choose an answer; Enter goes to the next round.'
    ],
    mount(root, kit) {
      const { el } = kit;
      const style = el('style', { text: '.gm-match-blitz .gm-fact { margin: 0 0 14px; }' });
      const hud = kit.hud([['round', 'Round'], ['score', 'Correct'], ['|'], ['best', 'Best']]);
      const prompt = el('p', { class: 'g-prompt' });
      const fact = el('div', { class: 'g-card gm-fact' });
      const optionHost = el('div');
      const feedback = el('div', { class: 'g-feedback', 'aria-live': 'polite' });
      const next = el('button', { class: 'btn', type: 'button', hidden: true }, 'Next round');
      const stage = el('div', { class: 'gm-match-blitz' }, style, hud.node, prompt, fact, optionHost, feedback, el('div', { class: 'g-actions' }, next));
      root.appendChild(stage);

      let round = 0;
      let score = 0;
      let answered = false;
      let currentButtons = [];
      function load() {
        answered = false;
        const q = makeQuestion(round, kit);
        prompt.textContent = q.prompt;
        fact.textContent = round < 3 ? 'Start with the layer or default port. Later rounds combine protocol, transport, and process delivery.' : round < 7 ? 'Check which layer owns the protocol and what the port identifies.' : 'Read each relationship carefully; HTTP/3 uses a different transport from HTTP/1.1 and HTTP/2.';
        hud.set({ round: `${round + 1}/${ROUNDS}`, score, best: kit.best() });
        kit.feedback(feedback, '', '');
        next.hidden = true;
        const opts = kit.choices(q.options, (i, btn, btns) => choose(i, btn, btns), 'g-opts');
        currentButtons = opts.buttons;
        optionHost.replaceChildren(opts);
        currentButtons[0].focus();
        stage.dataset.answer = q.answer;
        stage.dataset.why = q.why;
      }
      function choose(index, btn, btns) {
        if (answered) return;
        answered = true;
        const q = { answer: stage.dataset.answer, why: stage.dataset.why };
        const selected = btn.textContent.trim();
        const ok = selected === q.answer;
        if (ok) score++;
        btn.classList.add(ok ? 'is-right' : 'is-wrong');
        btns.forEach((b, i) => { if (b.textContent.trim() === q.answer) b.classList.add('is-right'); });
        kit.lock(btns);
        kit.feedback(feedback, ok ? 'good' : 'bad', `${ok ? '**Correct.** ' : `**Not quite.** The answer is **${q.answer}**. `}${q.why}`);
        hud.set({ score });
        next.textContent = round === ROUNDS - 1 ? 'See score' : 'Next round';
        next.hidden = false;
        next.focus();
      }
      function advance() {
        round++;
        if (round >= ROUNDS) {
          kit.finish({ score, headline: `${score} / ${ROUNDS}`, summary: score >= 8 ? 'Protocol, layer, transport, and port relationships are in good shape.' : 'Keep the distinctions clear: IP addresses identify hosts, ports identify processes, and protocols belong to specific layers.' });
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
