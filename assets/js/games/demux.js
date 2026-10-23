/* Socket sorter: transport-layer demultiplexing (K&R 8e §3.2). */
(function () {
  'use strict';

  /* ---- pure logic: begin ---- */
  const DM = (function () {
    // Sockets: { type: 'udp' | 'listen' | 'conn', ip, port, srcIP?, srcPort? } (ip/port are this host's side).
    // Segment: { proto: 'UDP' | 'TCP', srcIP, srcPort, dstIP, dstPort, syn }.
    function demux(seg, sockets) {
      if (seg.proto === 'UDP') {
        // UDP: (destination IP, destination port) only
        return sockets.find(s => s.type === 'udp' && s.ip === seg.dstIP && s.port === seg.dstPort) || null;
      }
      // TCP: full 4-tuple first
      const conn = sockets.find(s => s.type === 'conn' && s.srcIP === seg.srcIP && s.srcPort === seg.srcPort && s.ip === seg.dstIP && s.port === seg.dstPort);
      if (conn) return conn;
      // a connection request (SYN) with no matching connection goes to the welcoming socket on that port
      if (seg.syn) return sockets.find(s => s.type === 'listen' && s.ip === seg.dstIP && s.port === seg.dstPort) || null;
      return null;
    }
    // The connection socket that accept() creates for a SYN, identified by the SYN's 4-tuple.
    function connFromSyn(seg) {
      return { type: 'conn', srcIP: seg.srcIP, srcPort: seg.srcPort, ip: seg.dstIP, port: seg.dstPort };
    }
    // A reply goes back from the socket that received the request: swap source and destination.
    function reply(req) {
      return { proto: req.proto, srcIP: req.dstIP, srcPort: req.dstPort, dstIP: req.srcIP, dstPort: req.srcPort };
    }
    // TCP sockets a server has on a port: one welcoming socket plus one per open connection.
    function tcpSocketsOnPort(sockets, port) {
      return sockets.filter(s => (s.type === 'listen' || s.type === 'conn') && s.port === port).length;
    }
    const tuple = s => `(${s.srcIP}, ${s.srcPort}, ${s.dstIP}, ${s.dstPort})`;
    return { demux, connFromSyn, reply, tcpSocketsOnPort, tuple };
  })();
  /* ---- pure logic: end ---- */

  const SERVER_IP = '128.119.40.186';
  const HOST = { A: '74.125.3.10', C: '155.33.8.2', D: '23.41.9.77', E: '66.102.7.19', F: '198.51.100.23' };
  const LETTER = Object.fromEntries(Object.entries(HOST).map(([k, v]) => [v, k]));
  LETTER[SERVER_IP] = 'B';

  function initialSockets() {
    return [
      { type: 'udp', ip: SERVER_IP, port: 53 },
      { type: 'udp', ip: SERVER_IP, port: 6789 },
      { type: 'udp', ip: SERVER_IP, port: 19157 },
      { type: 'listen', ip: SERVER_IP, port: 80 },
      { type: 'conn', srcIP: HOST.A, srcPort: 9157, ip: SERVER_IP, port: 80 },
      { type: 'conn', srcIP: HOST.C, srcPort: 5775, ip: SERVER_IP, port: 80 },
      { type: 'conn', srcIP: HOST.C, srcPort: 9157, ip: SERVER_IP, port: 80 },
    ];
  }

  let savedMode = 'sort';

  function injectStyle() {
    if (document.getElementById('gm-demux-style')) return;
    const s = document.createElement('style');
    s.id = 'gm-demux-style';
    s.textContent = `
.gm-demux { position: relative; }
.gm-demux .dm-host { display: flex; flex-wrap: wrap; gap: 4px 14px; align-items: baseline; margin: 0 0 8px; }
.gm-demux .dm-host h3 { font-family: var(--font-display); font-size: 1.35rem; font-weight: 600; margin: 0; }
.gm-demux .dm-seg { border: 2px solid var(--u3); border-radius: var(--r-md); padding: 10px 12px; margin: 0 0 16px; background: var(--surface); }
.gm-demux .dm-seg-title { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-weight: 700; margin: 0 0 8px; }
.gm-demux .dm-hdr { display: grid; grid-template-columns: 7.2em repeat(2, minmax(0, 1fr)); gap: 4px; align-items: stretch; }
.gm-demux .dm-hdr .k { font-size: 0.8rem; color: var(--ink-2); font-weight: 700; align-self: center; }
.gm-demux .dm-f { background: var(--surface-2); border-radius: var(--r-sm); padding: 4px 8px; min-width: 0; }
.gm-demux .dm-f small { display: block; font-size: 0.72rem; color: var(--ink-2); font-weight: 700; }
.gm-demux .dm-f b { font-family: var(--font-mono); font-weight: 600; font-size: 0.98rem; overflow-wrap: anywhere; }
.gm-demux .dm-groups { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: 12px 16px; margin-bottom: 10px; }
.gm-demux .dm-group h4 { margin: 0 0 6px; font-size: 0.85rem; color: var(--ink-2); }
.gm-demux .dm-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 8px; }
.gm-demux .dm-sock { position: relative; text-align: left; padding: 8px 10px 8px 34px; border: 1px solid var(--rule-strong); border-radius: var(--r-md);
  background: var(--surface); cursor: pointer; line-height: 1.3; min-height: 58px; }
.gm-demux .dm-sock:hover:not(:disabled) { border-color: var(--ink); }
.gm-demux .dm-sock:disabled { cursor: default; }
.gm-demux .dm-sock .key { position: absolute; left: 8px; top: 8px; width: 19px; height: 19px; border-radius: 4px; background: var(--surface-3); color: var(--ink-2);
  font-size: 0.75rem; font-weight: 700; display: grid; place-items: center; }
.gm-demux .dm-sock .t { display: block; font-weight: 700; font-size: 0.92rem; }
.gm-demux .dm-sock .id { display: block; font-family: var(--font-mono); font-size: 0.82rem; color: var(--ink-2); overflow-wrap: anywhere; }
.gm-demux .dm-sock.udp { border-left: 4px solid var(--u2); }
.gm-demux .dm-sock.listen { border-left: 4px solid var(--amber); }
.gm-demux .dm-sock.conn { border-left: 4px solid var(--u3); }
.gm-demux .dm-sock.is-right { background: var(--ack-soft); border-color: var(--ack); box-shadow: inset 0 0 0 1px var(--ack); }
.gm-demux .dm-sock.is-wrong { background: var(--nak-soft); border-color: var(--nak); box-shadow: inset 0 0 0 1px var(--nak); }
.gm-demux .dm-sock.dm-new { animation: dm-pop 0.6s ease-out; }
.gm-demux .dm-sock .new-tag { margin-left: 6px; }
.gm-demux .dm-none { margin: 4px 0 0; }
.gm-demux .dm-fly { position: absolute; z-index: 5; pointer-events: none; padding: 2px 8px; border-radius: 999px; background: var(--u3); color: #fff;
  font-size: 0.75rem; font-weight: 700; transition: transform 0.45s ease-in-out, opacity 0.45s ease-in; }
@keyframes dm-pop { 0% { transform: scale(0.85); opacity: 0; box-shadow: 0 0 0 4px var(--amber-soft); } 60% { opacity: 1; } 100% { transform: scale(1); box-shadow: none; } }
.gm-demux .dm-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 16px; margin-bottom: 8px; }
.gm-demux .dm-field { border: 1px solid var(--rule); border-radius: var(--r-md); padding: 8px 10px; }
.gm-demux .dm-field .lab { font-weight: 700; font-size: 0.88rem; color: var(--ink-2); margin: 0 0 6px; }
.gm-demux .dm-field .chip { font-family: var(--font-mono); }
.gm-demux .dm-field.is-right { border-color: var(--ack); background: var(--ack-soft); }
.gm-demux .dm-field.is-wrong { border-color: var(--nak); background: var(--nak-soft); }
@media (max-width: 860px) { .gm-demux .dm-groups { grid-template-columns: 1fr; } }
@media (max-width: 560px) { .gm-demux .dm-form { grid-template-columns: 1fr; } .gm-demux .dm-hdr { grid-template-columns: 1fr 1fr; } .gm-demux .dm-hdr .k { grid-column: 1 / -1; } }
`;
    document.head.appendChild(s);
  }

  NET.addGame({
    id: 'demux',
    title: 'Socket sorter',
    unit: 3,
    sections: ['mux'],
    blurb: 'Deliver arriving UDP and TCP segments to the right socket on a busy server, then write the reply segment\'s addresses.',
    how: [
      '**Sort segments**: read the arriving segment\'s protocol, addresses and ports, then click the socket that receives it, or "No matching socket".',
      'UDP sockets are identified by (dest IP, dest port); TCP connection sockets by the full 4-tuple. A SYN with no matching connection goes to the welcoming socket.',
      '**Write the reply**: pick the reply segment\'s source and destination IP and port.',
      'Keyboard: number keys pick sockets or answers, `0` picks "No matching socket", Enter continues.',
    ],
    mount(root, kit) {
      injectStyle();
      const { el } = kit;
      const wrap = el('div', { class: 'gm-demux' });
      root.appendChild(wrap);

      let mode = savedMode;
      const MODES = [['sort', 'Sort segments'], ['reply', 'Write the reply']];
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

      const ROUNDS = 10;
      let idx = -1, score = 0, keyHandler = null, sockets, plan, hist;
      kit.onKey(e => { if (keyHandler && !e.ctrlKey && !e.metaKey && !e.altKey) keyHandler(e); });
      const isButton = t => t && t.tagName === 'BUTTON';
      const eph = () => kit.rand(49152, 65535);
      const who = ip => (LETTER[ip] ? ` (${LETTER[ip]})` : '');
      const ipp = (ip, port) => `${ip}:${port}`;

      function start() {
        idx = -1; score = 0;
        sockets = initialSockets();
        hist = { udp: null, synSeg: null, usedConn: [] };
        plan = mode === 'sort'
          ? ['udp-basic', 'tcp-existing', 'udp-same', 'tcp-sameport', 'syn-new', 'after-syn', 'count-live']
            .concat(kit.shuffle(['udp-to-tcp-port', 'tcp-unknown', 'syn-to-udp-port', 'syn-existing-host']).slice(0, 3))
          : ['r-dns', 'r-udpserver', 'r-web', 'count-tcp', 'r-fig34', 'r-tcpserver', 'r-reverse', 'r-sameport', 'count-other', 'r-game'];
        next();
      }
      function updateHud() { hud.set({ round: `${Math.min(idx + 1, ROUNDS)} / ${ROUNDS}`, score: `${score} / ${ROUNDS}` }); }
      function next() {
        idx++;
        keyHandler = null;
        if (idx >= ROUNDS) {
          kit.finish({ score, headline: `${score} / ${ROUNDS}`,
            summary: mode === 'sort'
              ? 'UDP demultiplexes on (dest IP, dest port); TCP uses the full 4-tuple, so one port 80 serves many connections.'
              : 'A reply swaps the pairs: the request\'s source IP and port become the reply\'s destination.' });
          return;
        }
        updateHud();
        body.innerHTML = '';
        const t = plan[idx];
        if (t.startsWith('count')) renderCount(t);
        else if (t.startsWith('r-')) renderReply(t);
        else renderSort(t);
      }
      function nextButton(container) {
        const b = el('button', { class: 'btn', type: 'button', onclick: next }, idx + 1 >= ROUNDS ? 'See results' : 'Next round');
        container.appendChild(el('div', { class: 'g-actions' }, b));
        b.focus();
        keyHandler = e => { if (e.key === 'Enter' && !isButton(e.target)) { e.preventDefault(); next(); } };
      }

      /* ---------- segment generation (sort mode) ---------- */
      const conns = () => sockets.filter(s => s.type === 'conn');
      const udpPorts = () => sockets.filter(s => s.type === 'udp').map(s => s.port);
      function segFor(type) {
        const T = (srcIP, srcPort, dstPort, syn) => ({ proto: 'TCP', srcIP, srcPort, dstIP: SERVER_IP, dstPort, syn: !!syn });
        const U = (srcIP, srcPort, dstPort) => ({ proto: 'UDP', srcIP, srcPort, dstIP: SERVER_IP, dstPort, syn: false });
        const anyHost = () => HOST[kit.pick(['A', 'C', 'D', 'F'])];
        switch (type) {
          case 'udp-basic': return U(anyHost(), eph(), kit.pick(udpPorts()));
          case 'udp-same': {
            const prev = hist.udp;
            if (!prev) return U(anyHost(), eph(), kit.pick(udpPorts()));
            const ip = HOST[kit.pick(['A', 'C', 'D', 'F'].filter(k => HOST[k] !== prev.srcIP))];
            let port; do { port = eph(); } while (port === prev.srcPort);
            return U(ip, port, prev.dstPort);
          }
          case 'tcp-existing': {
            const c = conns().find(s => s.srcPort === 5775) || conns()[0];
            return T(c.srcIP, c.srcPort, c.port);
          }
          case 'tcp-sameport': {
            const pair = conns().filter(s => s.srcPort === 9157);
            const c = pair.find(s => !hist.usedConn.includes(s)) || kit.pick(pair);
            return T(c.srcIP, c.srcPort, c.port);
          }
          case 'syn-new': return T(HOST.E, eph(), 80, true);
          case 'after-syn': {
            const s = hist.synSeg;
            return s ? T(s.srcIP, s.srcPort, s.dstPort) : T(HOST.A, 9157, 80);
          }
          case 'udp-to-tcp-port': return U(anyHost(), eph(), 80);
          case 'tcp-unknown': return kit.pick([T(HOST.A, 5775, 80), T(HOST.D, 9157, 80)]);
          case 'syn-to-udp-port': return T(anyHost(), eph(), kit.pick([53, 6789]), true);
          case 'syn-existing-host': return T(HOST.C, 26145, 80, true);
          default: throw new Error('unknown round ' + type);
        }
      }

      /* ---------- display ---------- */
      function sockLabel(s) {
        if (s.type === 'udp') return { t: `UDP socket, port ${s.port}`, id: [`(${s.ip}, ${s.port})`] };
        if (s.type === 'listen') return { t: `TCP welcoming socket, port ${s.port}`, id: ['listening for connection requests'] };
        return { t: 'TCP connection socket', id: [`src ${ipp(s.srcIP, s.srcPort)}${who(s.srcIP)}`, `dst ${ipp(s.ip, s.port)}`] };
      }
      function sockButton(s, n, onPick, fresh) {
        const L = sockLabel(s);
        const b = el('button', { class: `dm-sock ${s.type}${fresh ? ' dm-new' : ''}`, type: 'button', onclick: () => onPick(s, b) },
          el('span', { class: 'key', 'aria-hidden': 'true' }, String(n)),
          el('span', { class: 't' }, L.t, fresh ? el('span', { class: 'g-tag new-tag' }, 'new') : null),
          ...L.id.map(x => el('span', { class: 'id' }, x)));
        b.setAttribute('aria-label', `${n}: ${L.t}, ${L.id.join(', ')}`);
        return b;
      }
      function segCard(seg, title) {
        const f = (k, v) => el('div', { class: 'dm-f' }, el('small', null, k), el('b', null, v));
        return el('div', { class: 'dm-seg', role: 'group', 'aria-label': title },
          el('p', { class: 'dm-seg-title' }, title, el('span', { class: 'g-tag' }, seg.proto), seg.syn ? el('span', { class: 'g-tag' }, 'SYN (connection request)') : null),
          el('div', { class: 'dm-hdr' },
            el('span', { class: 'k' }, 'IP header'), f('source IP', seg.srcIP + who(seg.srcIP)), f('dest IP', seg.dstIP + who(seg.dstIP)),
            el('span', { class: 'k' }, `${seg.proto} header`), f('source port', String(seg.srcPort)), f('dest port', String(seg.dstPort))));
      }
      // A small "segment" pill that travels to the receiving socket after the player answers.
      function fly(fromEl, toEl, done) {
        if (kit.reducedMotion || !fromEl || !toEl) { done(); return; }
        const base = wrap.getBoundingClientRect();
        const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
        const pill = el('div', { class: 'dm-fly', 'aria-hidden': 'true' }, 'segment');
        wrap.appendChild(pill);
        const x0 = a.left - base.left + a.width / 2 - 30, y0 = a.top - base.top + a.height / 2 - 10;
        pill.style.left = x0 + 'px'; pill.style.top = y0 + 'px';
        const dx = b.left - base.left + b.width / 2 - 30 - x0, dy = b.top - base.top + b.height / 2 - 10 - y0;
        void pill.offsetWidth;
        pill.style.transform = `translate(${dx}px, ${dy}px)`;
        kit.after(480, () => { pill.style.opacity = '0'; kit.after(200, () => pill.remove()); done(); });
      }

      /* ---------- sort round ---------- */
      function explain(seg, target) {
        const d = `(${seg.dstIP}, ${seg.dstPort})`;
        const tup = DM.tuple(seg);
        if (seg.proto === 'UDP') {
          if (target) {
            let s = `UDP demultiplexes on the destination only: ${d} picks the UDP socket on port ${seg.dstPort}. The source ${ipp(seg.srcIP, seg.srcPort)} plays no part, so every client sending to port ${seg.dstPort} shares this socket.`;
            if (hist.udp && hist.udp !== seg && hist.udp.dstPort === seg.dstPort && hist.udp.srcIP !== seg.srcIP) s += ` That is why it lands in the same socket as the earlier segment from ${ipp(hist.udp.srcIP, hist.udp.srcPort)}.`;
            return s;
          }
          const tcpThere = sockets.some(s => s.type !== 'udp' && s.port === seg.dstPort);
          return `No UDP socket has ${d}.` + (tcpThere ? ` The TCP sockets on port ${seg.dstPort} don't count: UDP and TCP demultiplex separately.` : '') +
            ' The segment is not delivered (the host typically sends back an ICMP error).';
        }
        if (target && target.type === 'conn') {
          let s = `TCP uses the full 4-tuple ${tup}, and exactly one connection socket matches it.`;
          const twin = conns().find(c => c !== target && c.srcPort === seg.srcPort && c.srcIP !== seg.srcIP);
          const sib = conns().find(c => c !== target && c.srcIP === seg.srcIP && c.srcPort !== seg.srcPort);
          if (twin) s += ` The socket for ${ipp(twin.srcIP, twin.srcPort)} has the same source port but a different source IP, so it is a different socket.`;
          else if (sib) s += ` ${seg.srcIP}${who(seg.srcIP)} also has a connection from port ${sib.srcPort}; a different source port means a different socket.`;
          return s;
        }
        if (target && target.type === 'listen') {
          return `It is a SYN (connection request) and no connection socket has the 4-tuple ${tup} yet, so the welcoming socket on port ${seg.dstPort} takes it. ` +
            `Once the handshake completes, \`accept()\` returns a new connection socket identified by that 4-tuple. It still uses port ${seg.dstPort}.`;
        }
        if (seg.syn) {
          const udpThere = sockets.some(s => s.type === 'udp' && s.port === seg.dstPort);
          return `This SYN asks for TCP port ${seg.dstPort}, but no TCP socket is listening there` +
            (udpThere ? ` (the UDP socket on port ${seg.dstPort} doesn't count: TCP and UDP ports are separate)` : '') +
            '. The host answers with a TCP reset (RST) segment.';
        }
        const samePort = conns().find(c => c.srcPort === seg.srcPort);
        const sameHost = conns().find(c => c.srcIP === seg.srcIP);
        let s = `No connection socket has the 4-tuple ${tup}, and it is not a SYN, so the welcoming socket does not take it either.`;
        if (samePort) s += ` Source port ${seg.srcPort} is in use by ${samePort.srcIP}${who(samePort.srcIP)}, not by ${seg.srcIP}${who(seg.srcIP)}.`;
        else if (sameHost) s += ` ${seg.srcIP}${who(seg.srcIP)} is connected, but not from port ${seg.srcPort}.`;
        return s + ' The host answers with a TCP reset (RST) segment.';
      }

      function renderSort(type) {
        const seg = segFor(type);
        const target = DM.demux(seg, sockets);
        body.append(el('div', { class: 'dm-host' }, el('h3', null, `Server host B, IP ${SERVER_IP}`),
          el('span', { class: 'g-sub', style: { margin: '0' } }, 'Which socket does the transport layer deliver this segment to?')));
        const card = segCard(seg, `Segment ${idx + 1} arriving`);
        body.appendChild(card);

        const btns = [];
        const listUdp = el('div', { class: 'dm-list' });
        const listTcp = el('div', { class: 'dm-list' });
        let n = 0;
        sockets.forEach(s => {
          const b = sockButton(s, ++n, pick);
          btns.push([s, b]);
          (s.type === 'udp' ? listUdp : listTcp).appendChild(b);
        });
        const none = el('button', { class: 'btn secondary dm-none', type: 'button', onclick: () => pick(null, none) }, 'No matching socket (0)');
        const fb = el('div', { class: 'g-feedback', 'aria-live': 'polite' });
        const after = el('div');
        body.append(el('div', { class: 'dm-groups' },
          el('div', { class: 'dm-group' }, el('h4', null, 'UDP sockets'), listUdp),
          el('div', { class: 'dm-group' }, el('h4', null, 'TCP sockets'), listTcp)), none, fb, after);

        keyHandler = e => {
          if (e.key === '0' || e.key === 'n' || e.key === 'N') { e.preventDefault(); none.click(); return; }
          const k = +e.key;
          if (k >= 1 && k <= btns.length) { e.preventDefault(); btns[k - 1][1].click(); }
        };

        function pick(s, btn) {
          const right = s === target;
          if (right) score++;
          updateHud();
          btns.forEach(([, b]) => { b.disabled = true; });
          none.disabled = true;
          const targetBtn = target ? btns.find(([x]) => x === target)[1] : none;
          targetBtn.classList.add('is-right');
          if (!right) btn.classList.add('is-wrong');
          if (!target) { none.classList.remove('secondary'); none.classList.add(right ? 'good' : 'bad'); }
          if (!right && !s) { none.classList.remove('secondary'); none.classList.add('bad'); }
          const pre = right ? 'Right. ' : (target ? 'It goes to the highlighted socket. ' : 'No socket matches this one. ');
          kit.feedback(fb, right ? 'good' : 'bad', pre + explain(seg, target));
          if (seg.proto === 'UDP' && target) hist.udp = seg;
          if (target && target.type === 'conn') hist.usedConn.push(target);
          keyHandler = null;
          fly(card, targetBtn, () => {
            if (target && target.type === 'listen') {
              const ns = DM.connFromSyn(seg);
              sockets.push(ns);
              hist.synSeg = seg;
              const nb = sockButton(ns, btns.length + 1, () => {}, true);
              nb.disabled = true;
              listTcp.appendChild(nb);
            }
            nextButton(after);
          });
        }
      }

      /* ---------- count rounds ---------- */
      function renderCount(t) {
        let q, ans, why, near;
        if (t === 'count-live') {
          const n = conns().filter(c => c.port === 80).length;
          ans = DM.tcpSocketsOnPort(sockets, 80);
          q = `Quick check: right now the Web server on host B has ${n} open TCP connections on port 80. How many TCP sockets does it have for port 80?`;
          why = `One welcoming socket plus one connection socket per open connection: ${n} + 1 = ${ans}. They all use port 80; the 4-tuple tells them apart.`;
          near = [n, n + 2, 1];
        } else if (t === 'count-tcp') {
          const n = kit.rand(2, 6);
          ans = n + 1;
          q = `A TCP server (like TCPServer.py) has accepted ${n} connections, all still open. How many sockets does the server process have?`;
          why = `Each \`accept()\` returns a new connection socket, and the welcoming socket stays open for more clients: ${n} + 1 = ${ans}.`;
          near = [n, 1, 2 * n];
        } else if (Math.random() < 0.5) {
          const n = kit.rand(3, 8);
          ans = 1;
          q = `A UDP server (like UDPServer.py) is exchanging messages with ${n} different clients at once. How many sockets does it use?`;
          why = `Just one. Every client sends to the same (dest IP, dest port), so all segments land in the same socket; \`recvfrom()\` tells the server who each one came from.`;
          near = [n, n + 1, 2];
        } else {
          const n = kit.rand(4, 7), k = kit.rand(1, n - 2);
          ans = n - k + 1;
          q = `A TCP server accepted ${n} connections and has since closed ${k} of them with \`connectionSocket.close()\`. How many sockets does it have open now?`;
          why = `${n} − ${k} = ${n - k} connection sockets remain, plus the welcoming socket, which stays open: ${ans}.`;
          near = [n - k, n + 1, n - k + 2];
        }
        const cands = [...new Set([ans].concat(near, [ans + 1, ans + 2, ans + 3]))].filter(x => x >= 1).slice(0, 4).sort((a, b) => a - b);
        body.append(kit.md('p', 'g-prompt', q));
        const fb = el('div', { class: 'g-feedback', 'aria-live': 'polite' });
        const after = el('div');
        const opts = kit.choices(cands.map((c, i) => `${i + 1}. ${c}`), (i) => {
          const right = cands[i] === ans;
          if (right) score++;
          updateHud();
          kit.lock(opts.buttons);
          opts.buttons[cands.indexOf(ans)].classList.add('is-right');
          if (!right) opts.buttons[i].classList.add('is-wrong');
          kit.feedback(fb, right ? 'good' : 'bad', (right ? 'Right. ' : `It is ${ans}. `) + why);
          nextButton(after);
        });
        body.append(opts, fb, after);
        keyHandler = e => { const k = +e.key; if (k >= 1 && k <= cands.length) { e.preventDefault(); opts.buttons[k - 1].click(); } };
      }

      /* ---------- write-the-reply rounds ---------- */
      function replyScenario(t) {
        const p = eph();
        switch (t) {
          case 'r-dns': return { req: { proto: 'UDP', srcIP: '10.0.0.5', srcPort: p, dstIP: '1.2.3.4', dstPort: 53 },
            story: `A laptop (10.0.0.5) sends a DNS query from UDP port ${p} to the DNS server 1.2.3.4 on port 53. Fill in the server's reply.` };
          case 'r-udpserver': return { req: { proto: 'UDP', srcIP: HOST.C, srcPort: p, dstIP: SERVER_IP, dstPort: 12000 },
            story: `UDPClient.py on ${HOST.C} sends a sentence; the OS picked source port ${p}. UDPServer.py on ${SERVER_IP} (port 12000) answers with \`sendto(…, clientAddress)\`. Fill in that reply.` };
          case 'r-web': return { req: { proto: 'TCP', srcIP: HOST.C, srcPort: 7532, dstIP: SERVER_IP, dstPort: 80 },
            story: `Host C (${HOST.C}) sends an HTTP request over its open TCP connection from port 7532 to the Web server ${SERVER_IP} on port 80. Fill in the segment the server's connection socket sends back.`, tcpServer: true };
          case 'r-fig34': return { req: { proto: 'UDP', srcIP: HOST.A, srcPort: 19157, dstIP: SERVER_IP, dstPort: 46428 },
            story: `Host A (${HOST.A}) sends a UDP segment from port 19157 to server B (${SERVER_IP}) port 46428, as in Figure 3.4. Fill in B's reply.` };
          case 'r-tcpserver': return { req: { proto: 'TCP', srcIP: HOST.D, srcPort: p, dstIP: SERVER_IP, dstPort: 12000 },
            story: `TCPClient.py on ${HOST.D} (port ${p}) sends a sentence to TCPServer.py on ${SERVER_IP}, port 12000. Fill in the segment that carries \`connectionSocket.send(…)\` back.`, tcpServer: true };
          case 'r-reverse': return { req: { proto: 'TCP', srcIP: SERVER_IP, srcPort: 80, dstIP: HOST.C, dstPort: 26145 },
            story: `This time the Web server ${SERVER_IP} (port 80) sends a segment to Host C (${HOST.C}) on port 26145. Fill in the segment C sends back.` };
          case 'r-sameport': return { req: { proto: 'TCP', srcIP: HOST.A, srcPort: 26145, dstIP: SERVER_IP, dstPort: 80 },
            story: `Host A (${HOST.A}) happens to use source port 26145, the same as one of Host C's connections (Figure 3.5), to reach ${SERVER_IP} port 80. Fill in the server's reply to A.`, tcpServer: true };
          default: return { req: { proto: 'UDP', srcIP: '192.168.1.20', srcPort: p, dstIP: '203.0.113.9', dstPort: 27015 },
            story: `A game client (192.168.1.20, UDP port ${p}) sends a position update to a game server at 203.0.113.9 port 27015. Fill in the server's reply.` };
        }
      }
      function renderReply(t) {
        const sc = replyScenario(t);
        const req = sc.req;
        const ans = DM.reply(req);
        body.append(kit.md('p', 'g-prompt', sc.story));
        body.appendChild(segCard(req, 'Request segment'));
        const ips = kit.shuffle([req.srcIP, req.dstIP]);
        const portSet = [req.srcPort, req.dstPort];
        let newPort = 0;
        if (sc.tcpServer) { do { newPort = eph(); } while (portSet.includes(newPort)); portSet.push(newPort); }
        const ports = kit.shuffle(portSet);
        const fields = [['srcIP', 'Source IP', ips], ['srcPort', 'Source port', ports], ['dstIP', 'Destination IP', ips], ['dstPort', 'Destination port', ports]];
        const chosen = {};
        const fieldEls = {};
        const form = el('div', { class: 'dm-form' });
        fields.forEach(([key, label, vals]) => {
          const row = el('div', { class: 'chip-row', role: 'group', 'aria-label': label });
          const bs = vals.map(v => {
            const b = el('button', { class: 'chip', type: 'button', 'aria-pressed': 'false', onclick: () => {
              chosen[key] = v;
              bs.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
            } }, String(v));
            row.appendChild(b);
            return b;
          });
          const f = el('div', { class: 'dm-field' }, el('p', { class: 'lab' }, label), row);
          fieldEls[key] = { f, bs };
          form.appendChild(f);
        });
        const checkBtn = el('button', { class: 'btn', type: 'button', onclick: check }, 'Check');
        const fb = el('div', { class: 'g-feedback', 'aria-live': 'polite' });
        const after = el('div');
        body.append(kit.md('p', 'g-prompt', `Reply segment (${req.proto}):`), form, el('div', { class: 'g-actions' }, checkBtn), fb, after);
        keyHandler = e => { if (e.key === 'Enter' && !isButton(e.target)) { e.preventDefault(); check(); } };
        function check() {
          const missing = fields.filter(([k]) => chosen[k] === undefined);
          if (missing.length) { kit.feedback(fb, 'part', `Pick a value for ${missing.map(m => m[1].toLowerCase()).join(', ')}.`); return; }
          let allRight = true;
          fields.forEach(([k]) => {
            const ok = chosen[k] === ans[k];
            allRight = allRight && ok;
            fieldEls[k].f.classList.add(ok ? 'is-right' : 'is-wrong');
            fieldEls[k].bs.forEach(b => { b.disabled = true; });
          });
          checkBtn.disabled = true;
          if (allRight) score++;
          updateHud();
          let msg = `The reply is ${ipp(ans.srcIP, ans.srcPort)} → ${ipp(ans.dstIP, ans.dstPort)}. The request's source (IP, port) becomes the reply's destination, and the reply leaves from the socket that got the request, so its source is the request's destination.`;
          if (sc.tcpServer) msg += ` The connection socket made by \`accept()\` still uses port ${req.dstPort}; it is told apart from the welcoming socket by its 4-tuple, not by a new port number.`;
          if (sc.tcpServer && chosen.srcPort === newPort) msg += ` (${newPort} is not a port the server uses here.)`;
          if (req.proto === 'UDP' && t === 'r-udpserver') msg += ' `recvfrom()` handed the server `clientAddress` = (client IP, client port) for exactly this.';
          kit.feedback(fb, allRight ? 'good' : 'bad', (allRight ? 'Right. ' : 'Not quite. ') + msg);
          nextButton(after);
        }
      }

      start();
    },
  });
})();
