/* Socket code order: Parsons problems and fill-the-blank on the four Python socket programs (K&R 8e §2.7). */
(function () {
  'use strict';

  /* ---- pure logic: begin ---- */
  const CO = (function () {
    // The four programs exactly as listed in §2.7 (typographic quotes replaced by ASCII; the UDPServer
    // sendto line, split across two lines in print, joined). `after` = lines that must come earlier.
    // Implicit rules: the import comes first; in servers, every unindented line comes before `while True:`
    // and every indented line after it.
    const PROGRAMS = {
      UDPClient: { file: 'UDPClient.py', lines: [
        { id: 'imp', code: 'from socket import *', note: 'Imports go first: every other line uses names from the socket module.' },
        { id: 'name', code: 'serverName = \'hostname\'', note: '`serverName` just has to be set before `sendto()` uses it.' },
        { id: 'port', code: 'serverPort = 12000', note: '`serverPort` just has to be set before `sendto()` uses it.' },
        { id: 'sock', code: 'clientSocket = socket(AF_INET, SOCK_DGRAM)', note: 'The socket must exist before anything is sent through it.' },
        { id: 'msg', code: 'message = input(\'Input lowercase sentence:\')', note: 'The message has to be read before it can be sent.' },
        { id: 'send', code: 'clientSocket.sendto(message.encode(),(serverName, serverPort))', after: ['sock', 'msg', 'name', 'port'],
          note: '`sendto()` needs the socket, the message and the server address, so it comes after all of them.' },
        { id: 'recv', code: 'modifiedMessage, serverAddress = clientSocket.recvfrom(2048)', after: ['send'], note: 'The client waits for the reply with `recvfrom()` only after sending its message.' },
        { id: 'print', code: 'print(modifiedMessage.decode())', after: ['recv'], note: 'The reply can be printed only after `recvfrom()` returns it.' },
        { id: 'close', code: 'clientSocket.close()', after: ['recv'], note: 'Close the socket at the end, once the reply has arrived.' },
      ], distractors: [
        { code: 'clientSocket.connect((serverName,serverPort))', why: 'UDP is connectionless: no handshake, so the book\'s UDP client never calls `connect()`. It attaches the server address to each packet with `sendto()`.' },
        { code: 'clientSocket.bind((\'\', serverPort))', why: 'The client does not call `bind()`: the OS picks a free port for it. Only the server binds, to the port its clients know.' },
        { code: 'clientSocket = socket(AF_INET, SOCK_STREAM)', why: '`SOCK_STREAM` makes a TCP socket; UDPClient.py uses `SOCK_DGRAM`.' },
        { code: 'clientSocket.send(message.encode())', why: 'With no connection there is no fixed destination, so a UDP client must name it on every packet: `sendto(data, (serverName, serverPort))`.' },
      ], keys: ['No `bind()` in the client: the OS assigns its port.', '`sendto()` attaches the destination address to every packet because UDP has no connection.'] },

      UDPServer: { file: 'UDPServer.py', lines: [
        { id: 'imp', code: 'from socket import *', note: 'Imports go first: every other line uses names from the socket module.' },
        { id: 'port', code: 'serverPort = 12000', note: '`serverPort` must be set before `bind()` uses it.' },
        { id: 'sock', code: 'serverSocket = socket(AF_INET, SOCK_DGRAM)', note: 'Create the socket before binding it.' },
        { id: 'bind', code: 'serverSocket.bind((\'\', serverPort))', after: ['sock', 'port'], note: '`bind()` assigns port 12000 to the socket, so it needs the socket and `serverPort`, and it must happen before the loop receives anything.' },
        { id: 'print', code: 'print("The server is ready to receive")', after: ['bind'], note: 'Print the ready message once the socket is bound, just before the loop.' },
        { id: 'while', code: 'while True:', note: 'The loop comes after all the setup; the indented lines repeat for every packet.' },
        { id: 'recv', code: 'message, clientAddress = serverSocket.recvfrom(2048)', indent: 1, note: 'Each pass starts by waiting for a packet; `recvfrom()` also returns the client\'s address.' },
        { id: 'mod', code: 'modifiedMessage = message.decode().upper()', indent: 1, after: ['recv'], note: 'The message is capitalized after it is received.' },
        { id: 'send', code: 'serverSocket.sendto(modifiedMessage.encode(), clientAddress)', indent: 1, after: ['mod'], note: 'The reply goes out last, to `clientAddress` from `recvfrom()`.' },
      ], distractors: [
        { code: 'serverSocket.listen(1)', why: '`listen()` is for a TCP welcoming socket. A UDP server just binds and calls `recvfrom()`; there are no connections to wait for.' },
        { code: 'connectionSocket, addr = serverSocket.accept()', indent: 1, why: 'UDP has no connections, so there is nothing to `accept()`: every client\'s datagrams arrive on the one bound socket.' },
        { code: 'serverSocket = socket(AF_INET, SOCK_STREAM)', why: '`SOCK_STREAM` is TCP; UDPServer.py uses `SOCK_DGRAM`.' },
        { code: 'serverSocket.send(modifiedMessage.encode())', indent: 1, why: 'A UDP reply must name its destination: `sendto(…, clientAddress)`, using the address `recvfrom()` returned.' },
      ], keys: ['`bind()` gives the socket the port (12000) that clients send to.', '`recvfrom()` returns the client\'s address, which the reply is sent back to with `sendto()`.'] },

      TCPClient: { file: 'TCPClient.py', lines: [
        { id: 'imp', code: 'from socket import *', note: 'Imports go first: every other line uses names from the socket module.' },
        { id: 'name', code: 'serverName = \'servername\'', note: '`serverName` just has to be set before `connect()` uses it.' },
        { id: 'port', code: 'serverPort = 12000', note: '`serverPort` just has to be set before `connect()` uses it.' },
        { id: 'sock', code: 'clientSocket = socket(AF_INET, SOCK_STREAM)', note: 'Create the TCP socket before connecting it.' },
        { id: 'conn', code: 'clientSocket.connect((serverName,serverPort))', after: ['sock', 'name', 'port'], note: '`connect()` runs the three-way handshake, so it needs the socket and the server\'s name and port, and it must come before any `send()`.' },
        { id: 'sent', code: 'sentence = input(\'Input lowercase sentence:\')', note: 'The sentence has to be read before it is sent.' },
        { id: 'send', code: 'clientSocket.send(sentence.encode())', after: ['conn', 'sent'], note: '`send()` needs an established connection, so it comes after `connect()`.' },
        { id: 'recv', code: 'modifiedSentence = clientSocket.recv(1024)', after: ['send'], note: 'The client reads the reply only after sending its sentence.' },
        { id: 'print', code: 'print(\'From Server: \', modifiedSentence.decode())', after: ['recv'], note: 'The reply can be printed only after `recv()` returns it.' },
        { id: 'close', code: 'clientSocket.close()', after: ['recv'], note: 'Close the socket (and the TCP connection) at the end, once the reply has arrived.' },
      ], distractors: [
        { code: 'clientSocket = socket(AF_INET, SOCK_DGRAM)', why: '`SOCK_DGRAM` is UDP; TCPClient.py needs `SOCK_STREAM`.' },
        { code: 'clientSocket.sendto(sentence.encode(),(serverName, serverPort))', why: 'Over TCP, `connect()` already fixed the destination, so the client just calls `send()`. Naming the address on every packet with `sendto()` is the UDP way.' },
        { code: 'clientSocket.listen(1)', why: 'Only a server listens. The client starts the connection itself with `connect()`.' },
        { code: 'clientSocket.bind((\'\', serverPort))', why: 'The client does not call `bind()`: the OS assigns its port. Only the server binds, to the port clients connect to.' },
      ], keys: ['`connect()` performs the three-way handshake before any data moves.', 'After that, `send()` takes no address: the connection fixes the destination.'] },

      TCPServer: { file: 'TCPServer.py', lines: [
        { id: 'imp', code: 'from socket import *', note: 'Imports go first: every other line uses names from the socket module.' },
        { id: 'port', code: 'serverPort = 12000', note: '`serverPort` must be set before `bind()` uses it.' },
        { id: 'sock', code: 'serverSocket = socket(AF_INET,SOCK_STREAM)', note: 'Create the socket before binding it.' },
        { id: 'bind', code: 'serverSocket.bind((\'\',serverPort))', after: ['sock', 'port'], note: '`bind()` gives the welcoming socket port 12000, so it needs the socket and `serverPort` first.' },
        { id: 'listen', code: 'serverSocket.listen(1)', after: ['bind'], note: '`listen()` comes after `bind()`: the welcoming socket needs its port before it can wait for connection requests on it.' },
        { id: 'print', code: 'print(\'The server is ready to receive\')', after: ['listen'], note: 'Print the ready message once the socket is listening, just before the loop.' },
        { id: 'while', code: 'while True:', note: 'The loop comes after all the setup; the indented lines repeat for every client.' },
        { id: 'acc', code: 'connectionSocket, addr = serverSocket.accept()', indent: 1, note: 'Each pass begins with `accept()`, which waits for a client and returns a new `connectionSocket` dedicated to it.' },
        { id: 'recv', code: 'sentence = connectionSocket.recv(1024).decode()', indent: 1, after: ['acc'], note: 'Data is read from `connectionSocket`, so this comes after `accept()` creates it.' },
        { id: 'cap', code: 'capitalizedSentence = sentence.upper()', indent: 1, after: ['recv'], note: 'The sentence is capitalized after it is received.' },
        { id: 'send', code: 'connectionSocket.send(capitalizedSentence.encode())', indent: 1, after: ['cap'], note: 'The reply goes back through `connectionSocket` after it is computed.' },
        { id: 'close', code: 'connectionSocket.close()', indent: 1, after: ['send'], note: 'Close this client\'s connection socket last; `serverSocket` stays open for the next client.' },
      ], distractors: [
        { code: 'serverSocket = socket(AF_INET,SOCK_DGRAM)', why: 'A TCP server needs `SOCK_STREAM`; a `SOCK_DGRAM` (UDP) socket cannot `listen()` or `accept()`.' },
        { code: 'message, clientAddress = serverSocket.recvfrom(2048)', indent: 1, why: 'A TCP client\'s data arrives on the connection socket from `accept()`, read with `recv()`, not on the welcoming socket with `recvfrom()`.' },
        { code: 'serverSocket.close()', indent: 1, why: 'Closing `serverSocket` would shut the welcoming door after the first client. The loop closes only `connectionSocket`.' },
        { code: 'serverSocket.send(capitalizedSentence.encode())', indent: 1, why: 'The welcoming socket only accepts connections; replies go through `connectionSocket`, the socket dedicated to this client.' },
      ], keys: ['`bind()` then `listen()`: the welcoming socket needs its port before it can listen on it.', '`accept()` returns a new `connectionSocket` for each client, while `serverSocket` stays open for the next one.'] },
    };

    // For every line id, the set of line ids that must appear before it (transitive).
    function mustPrecede(lines) {
      const direct = {};
      lines.forEach(l => { direct[l.id] = new Set(l.after || []); });
      const first = lines[0].id;
      lines.forEach(l => { if (l.id !== first) direct[l.id].add(first); });
      if (direct.while) lines.forEach(l => {
        if (l.indent) direct[l.id].add('while');
        else if (l.id !== 'while') direct.while.add(l.id);
      });
      const memo = {};
      const walk = id => {
        if (memo[id]) return memo[id];
        const s = new Set();
        memo[id] = s;
        direct[id].forEach(d => { s.add(d); walk(d).forEach(x => s.add(x)); });
        return s;
      };
      lines.forEach(l => walk(l.id));
      return memo;
    }
    const popcount = m => { let c = 0; while (m) { c += m & 1; m >>= 1; } return c; };

    // codeIds: ids in the program area, in order (may include distractor ids); binIds: ids in the bin.
    // Returns { ok, strays (distractors left in the code), missing (real lines in the bin), misplaced, viol }.
    function check(lines, codeIds) {
      const real = lines.map(l => l.id);
      const before = mustPrecede(lines);
      const strays = codeIds.filter(id => !real.includes(id));
      const missing = real.filter(id => !codeIds.includes(id));
      const placed = codeIds.filter(id => real.includes(id));
      const pos = {};
      placed.forEach((id, i) => { pos[id] = i; });
      const viol = [];
      placed.forEach(b => before[b].forEach(a => { if (a in pos && pos[a] > pos[b]) viol.push([a, b]); }));
      // Misplaced = smallest set of lines covering every violated pair (ties: the lines farthest from the book's position).
      const canon = {};
      real.forEach((id, i) => { canon[id] = i; });
      let best = { size: 0, mask: 0, disp: 0 };
      if (viol.length) {
        best = null;
        const n = placed.length;
        for (let mask = 1; mask < (1 << n); mask++) {
          const size = popcount(mask);
          if (best && size > best.size) continue;
          if (!viol.every(([a, b]) => ((mask >> pos[a]) & 1) || ((mask >> pos[b]) & 1))) continue;
          let disp = 0;
          placed.forEach((id, i) => { if ((mask >> i) & 1) disp += Math.abs(i - canon[id]); });
          if (!best || size < best.size || disp > best.disp) best = { size, mask, disp };
        }
      }
      const misplaced = placed.filter((id, i) => (best.mask >> i) & 1);
      return { ok: !strays.length && !missing.length && !viol.length, strays, missing, misplaced, viol };
    }
    return { PROGRAMS, mustPrecede, check };
  })();
  /* ---- pure logic: end ---- */

  // Fill-the-blank items: the blank is the `ans` text inside the named program line (taken from PROGRAMS, so it can't drift).
  const BLANKS = [
    { lvl: 1, prog: 'UDPClient', line: 'sock', ans: 'SOCK_DGRAM', opts: ['SOCK_DGRAM', 'SOCK_STREAM', 'AF_INET'], why: '`SOCK_DGRAM` means a UDP socket; `SOCK_STREAM` would be TCP.' },
    { lvl: 1, prog: 'TCPServer', line: 'sock', ans: 'SOCK_STREAM', opts: ['SOCK_STREAM', 'SOCK_DGRAM', 'AF_INET'], why: '`SOCK_STREAM` means a TCP socket; `SOCK_DGRAM` would be UDP.' },
    { lvl: 1, prog: 'UDPClient', line: 'send', ans: 'sendto', opts: ['sendto', 'send', 'connect'], why: 'UDP attaches the destination to every packet, so the client calls `sendto()` with `(serverName, serverPort)`.' },
    { lvl: 1, prog: 'TCPClient', line: 'send', ans: 'send', opts: ['send', 'sendto', 'connect'], why: 'After `connect()` the TCP connection fixes the destination, so `send()` takes just the bytes.' },
    { lvl: 2, prog: 'UDPServer', line: 'recv', ans: 'recvfrom', opts: ['recvfrom', 'recv', 'accept'], why: '`recvfrom()` returns the data and the client\'s address, which the UDP server needs for its reply.' },
    { lvl: 2, prog: 'TCPClient', line: 'recv', ans: 'recv', opts: ['recv', 'recvfrom', 'accept'], why: 'On a TCP connection the other end is already known, so `recv()` returns just the bytes.' },
    { lvl: 2, prog: 'TCPServer', line: 'acc', ans: 'accept', opts: ['accept', 'listen', 'bind', 'connect'], why: '`accept()` waits for a client and returns a new socket dedicated to it, plus the client\'s address.' },
    { lvl: 2, prog: 'TCPServer', line: 'listen', ans: 'listen', opts: ['listen', 'accept', 'bind', 'connect'], why: '`listen(1)` makes `serverSocket` wait for TCP connection requests (the argument is the maximum number of queued connections, at least 1).' },
    { lvl: 2, prog: 'UDPServer', line: 'bind', ans: 'bind', opts: ['bind', 'connect', 'listen', 'sendto'], why: '`bind()` assigns port 12000 to the server\'s socket, so packets sent to that port reach it.' },
    { lvl: 2, prog: 'TCPClient', line: 'conn', ans: 'connect', opts: ['connect', 'bind', 'accept', 'sendto'], why: '`connect()` starts the three-way handshake with the server\'s welcoming socket.' },
    { lvl: 3, prog: 'UDPServer', line: 'bind', ans: '(\'\', serverPort)', opts: ['(\'\', serverPort)', '(serverName, serverPort)', '(serverPort)', '(\'\', 2048)'], why: '`bind()` takes one (host, port) tuple; the empty string means any of this host\'s addresses, and the port is `serverPort` (12000).' },
    { lvl: 3, prog: 'UDPClient', line: 'send', ans: '.encode()', opts: ['.encode()', '.decode()', '.upper()'], why: 'Sockets carry bytes, so the string is converted to bytes with `encode()` before it is sent.' },
    { lvl: 3, prog: 'UDPClient', line: 'print', ans: '.decode()', opts: ['.decode()', '.encode()', '.upper()'], why: '`recvfrom()` returns bytes; `decode()` turns them back into a string to print.' },
    { lvl: 3, prog: 'UDPServer', line: 'mod', ans: '.decode()', opts: ['.decode()', '.encode()', '.upper()'], why: 'The received bytes are decoded into a string before `upper()` capitalizes it.' },
    { lvl: 3, prog: 'UDPClient', line: 'recv', ans: '2048', opts: ['2048', '1024', '12000', '80'], why: 'The UDP programs pass a buffer size of 2048 bytes to `recvfrom()`.' },
    { lvl: 3, prog: 'TCPServer', line: 'recv', ans: '1024', opts: ['1024', '2048', '12000', '1'], why: 'The TCP server reads with `recv(1024)`: up to 1024 bytes at a time.' },
    { lvl: 3, prog: 'TCPServer', line: 'close', ans: 'connectionSocket', opts: ['connectionSocket', 'serverSocket', 'clientSocket'], why: 'Only this client\'s connection socket is closed; the welcoming `serverSocket` stays open for the next client.' },
    { lvl: 3, prog: 'TCPServer', line: 'recv', ans: 'connectionSocket', opts: ['connectionSocket', 'serverSocket', 'clientSocket'], why: 'Data arrives on the connection socket that `accept()` created for this client, not on the welcoming socket.' },
    { lvl: 3, prog: 'UDPServer', line: 'send', ans: 'clientAddress', opts: ['clientAddress', '(serverName, serverPort)', 'serverAddress'], why: 'The reply goes to the address `recvfrom()` returned: the client\'s IP and port.' },
  ];

  let savedMode = 'order';

  function injectStyle() {
    if (document.getElementById('gm-code-order-style')) return;
    const s = document.createElement('style');
    s.id = 'gm-code-order-style';
    s.textContent = `
.gm-code-order .co-file { display: inline-block; font-family: var(--font-mono); font-size: 0.85rem; font-weight: 600; background: var(--plate); color: var(--plate-ink);
  padding: 3px 10px; border-radius: var(--r-sm) var(--r-sm) 0 0; }
.gm-code-order .co-list { list-style: none; margin: 0 0 12px; padding: 6px; background: var(--surface-2); border-radius: 0 var(--r-md) var(--r-md) var(--r-md); min-height: 48px; }
.gm-code-order .co-row { display: flex; align-items: center; gap: 6px; padding: 3px 4px; border-radius: var(--r-sm); border: 1px solid transparent; flex-wrap: wrap; }
.gm-code-order .co-row + .co-row { margin-top: 3px; }
.gm-code-order .co-row.is-grabbed { border-color: var(--u2); background: var(--u2-soft); }
.gm-code-order .co-row.is-dragging { opacity: 0.55; }
.gm-code-order .co-row.drop-before { box-shadow: 0 -3px 0 var(--u2); }
.gm-code-order .co-row.drop-after { box-shadow: 0 3px 0 var(--u2); }
.gm-code-order .co-row.is-wrong { border-color: var(--nak); background: var(--nak-soft); }
.gm-code-order .co-row.is-right { border-color: var(--ack); background: var(--ack-soft); }
.gm-code-order .co-handle { width: 18px; align-self: stretch; display: grid; place-items: center; color: var(--ink-3); cursor: grab; touch-action: none; user-select: none; font-size: 0.9rem; }
.gm-code-order .co-num { width: 1.6em; text-align: right; color: var(--ink-3); font-family: var(--font-mono); font-size: 0.8rem; flex: none; }
.gm-code-order .co-code { flex: 1 1 220px; min-width: 0; text-align: left; font-family: var(--font-mono); font-size: 0.9rem; line-height: 1.35; padding: 6px 8px;
  background: var(--surface); border: 1px solid var(--rule-strong); border-radius: var(--r-sm); cursor: pointer; white-space: pre-wrap; overflow-wrap: anywhere; }
.gm-code-order .co-code:hover:not(:disabled) { border-color: var(--ink); }
.gm-code-order .co-code:disabled { cursor: default; color: var(--ink); }
.gm-code-order .co-code .ind { display: inline-block; width: 4ch; border-left: 2px solid var(--rule-strong); margin-right: 0.2ch; vertical-align: top; align-self: stretch; height: 1.1em; }
.gm-code-order .co-tools { display: flex; gap: 2px; margin-left: auto; }
.gm-code-order .co-tools .btn { padding: 4px 8px; min-width: 32px; }
.gm-code-order .co-bin { list-style: none; margin: 0 0 12px; padding: 6px; border: 2px dashed var(--rule-strong); border-radius: var(--r-md); min-height: 46px; }
.gm-code-order .co-bin .empty-note { color: var(--ink-3); font-size: 0.9rem; padding: 6px; }
.gm-code-order .co-bin-h { font-size: 0.88rem; font-weight: 700; color: var(--ink-2); margin: 0 0 4px; }
.gm-code-order .co-status { min-height: 1.4em; font-size: 0.9rem; color: var(--ink-2); margin: -4px 0 8px; }
.gm-code-order .co-blank-code { font-family: var(--font-mono); font-size: 0.95rem; background: var(--surface-2); border-radius: var(--r-md); padding: 10px 14px; margin-bottom: 14px; overflow-x: auto; }
.gm-code-order .co-blank-code div { white-space: pre; }
.gm-code-order .co-blank-code .ctx { color: var(--ink-3); }
.gm-code-order .co-gap { display: inline-block; min-width: 5ch; border-bottom: 2px solid var(--u2); color: var(--u2); font-weight: 700; text-align: center; }
.gm-code-order .co-gap.filled { border-bottom-color: var(--ack); color: var(--ack); }
.gm-code-order .g-opt { font-family: var(--font-mono); font-weight: 600; }
@media (max-width: 560px) { .gm-code-order .co-code { font-size: 0.84rem; } .gm-code-order .co-tools { width: 100%; justify-content: flex-end; } }
`;
    document.head.appendChild(s);
  }

  NET.addGame({
    id: 'code-order',
    title: 'Socket code order',
    unit: 2,
    sections: ['sockets'],
    blurb: 'Rebuild the textbook\'s UDP and TCP client and server programs line by line, and fill in the socket calls that matter.',
    how: [
      '**Put in order**: arrange the shuffled lines into the working program. Indentation is fixed. Some lines can legitimately swap; any working order counts.',
      'Move a line with its up and down buttons, by dragging its handle, or by clicking it and then clicking where it should go.',
      'Keyboard: Space picks up the focused line, arrow keys move it, Space or Escape drops it; `Delete` sends a line to the bin. Enter checks.',
      'Later rounds slip in lines that don\'t belong: move them to the bin. **Fill the blank** is a quick-fire round; number keys pick.',
    ],
    mount(root, kit) {
      injectStyle();
      const { el } = kit;
      const wrap = el('div', { class: 'gm-code-order' });
      root.appendChild(wrap);

      let mode = savedMode;
      const MODES = [['order', 'Put in order'], ['blank', 'Fill the blank']];
      const hud = kit.hud([['round', 'Round'], ['score', 'Score']]);
      const modeRow = el('div', { class: 'g-modes', role: 'group', 'aria-label': 'Mode' });
      const chips = MODES.map(([id, label]) => {
        const c = el('button', { class: 'chip u2', type: 'button', 'aria-pressed': String(id === mode),
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

      let rounds = [], idx = -1, score = 0, max = 0, keyHandler = null;
      kit.onKey(e => { if (keyHandler && !e.ctrlKey && !e.metaKey && !e.altKey) keyHandler(e); });
      const isButton = t => t && t.tagName === 'BUTTON';

      function start() {
        idx = -1; score = 0;
        if (mode === 'order') {
          const progs = kit.shuffle(Object.keys(CO.PROGRAMS));
          rounds = progs.map((p, i) => ({ kind: 'order', prog: p, nd: [0, 1, 1, 2][i] }));
          max = rounds.length * 3;
        } else {
          const items = kit.shuffle(BLANKS).slice(0, 12).sort((a, b) => a.lvl - b.lvl);
          rounds = items.map(b => ({ kind: 'blank', b }));
          max = rounds.length;
        }
        next();
      }
      function updateHud() { hud.set({ round: `${Math.min(idx + 1, rounds.length)} / ${rounds.length}`, score: `${score} / ${max}` }); }
      function next() {
        idx++;
        keyHandler = null;
        if (idx >= rounds.length) {
          kit.finish({ score, headline: `${score} / ${max}`,
            summary: 'UDP: socket, sendto with an address, recvfrom. TCP: the client connects then sends; the server binds, listens, then accepts a new socket per client.' });
          return;
        }
        updateHud();
        body.innerHTML = '';
        const r = rounds[idx];
        if (r.kind === 'order') renderOrder(r); else renderBlank(r);
      }
      function nextButton(container) {
        const b = el('button', { class: 'btn', type: 'button', onclick: next }, idx + 1 >= rounds.length ? 'See results' : 'Next round');
        container.appendChild(el('div', { class: 'g-actions' }, b));
        b.focus();
        keyHandler = e => { if (e.key === 'Enter' && !isButton(e.target)) { e.preventDefault(); next(); } };
      }

      /* ---------- Parsons round ---------- */
      function renderOrder(r) {
        const prog = CO.PROGRAMS[r.prog];
        const real = prog.lines.map(l => Object.assign({ real: true }, l));
        const extra = kit.shuffle(prog.distractors).slice(0, r.nd).map((d, i) => Object.assign({ id: 'x' + i, real: false }, d));
        const byId = {};
        real.concat(extra).forEach(l => { byId[l.id] = l; });
        const hasBin = extra.length > 0;
        let order;
        do { order = kit.shuffle(real.concat(extra)); } while (CO.check(prog.lines, order.map(l => l.id)).ok);
        let bin = [];
        let grabbed = null, locked = false, checks = 0;
        const marks = {};

        const nWord = ['', 'One line doesn\'t', 'Two lines don\'t'][extra.length];
        body.append(kit.md('p', 'g-prompt', `Put **${prog.file}** in order.` + (hasBin ? ` ${nWord} belong: move ${extra.length > 1 ? 'them' : 'it'} to the bin.` : '')));
        body.append(kit.md('p', 'g-sub', 'Copied from the book\'s §2.7 listing. Indentation is fixed: indented lines run inside `while True:`.'));
        const status = el('p', { class: 'co-status', 'aria-live': 'polite' });
        const listEl = el('ol', { class: 'co-list', 'aria-label': prog.file + ' lines' });
        const binEl = el('ul', { class: 'co-bin', 'aria-label': 'Lines that don\'t belong' });
        const checkBtn = el('button', { class: 'btn', type: 'button', onclick: check }, 'Check');
        const showBtn = el('button', { class: 'btn secondary', type: 'button', onclick: reveal, style: { display: 'none' } }, 'Show the answer');
        const fb = el('div', { class: 'g-feedback', 'aria-live': 'polite' });
        const after = el('div');
        body.append(el('div', { class: 'co-file' }, prog.file), listEl, status);
        if (hasBin) body.append(el('p', { class: 'co-bin-h' }, 'Bin: lines that don\'t belong'), binEl);
        body.append(el('div', { class: 'g-actions' }, checkBtn, showBtn), fb, after);

        function codeNodes(l) {
          return [l.indent ? el('span', { class: 'ind', 'aria-hidden': 'true' }) : null, l.code];
        }
        function focusLine(id) {
          const b = listEl.querySelector(`[data-id="${id}"] .co-code`) || binEl.querySelector(`[data-id="${id}"] .co-code`);
          if (b) b.focus();
        }
        function clearMarks() { Object.keys(marks).forEach(k => delete marks[k]); }
        function moveTo(l, to) {
          const from = order.indexOf(l);
          if (from < 0 || to < 0 || to >= order.length || to === from) return;
          order.splice(from, 1);
          order.splice(to, 0, l);
          clearMarks();
          render();
          status.textContent = `Moved to line ${to + 1} of ${order.length}.`;
          focusLine(l.id);
        }
        function toBin(l) {
          order.splice(order.indexOf(l), 1);
          bin.push(l);
          if (grabbed === l) grabbed = null;
          clearMarks();
          render();
          status.textContent = 'Moved to the bin.';
          const nextRow = listEl.querySelector('.co-code');
          if (nextRow) nextRow.focus();
        }
        function fromBin(l) {
          bin.splice(bin.indexOf(l), 1);
          order.push(l);
          clearMarks();
          render();
          status.textContent = `Put back as line ${order.length}.`;
          focusLine(l.id);
        }
        function toolBtn(label, aria, fn, disabled) {
          return el('button', { class: 'btn ghost small', type: 'button', 'aria-label': aria, title: aria, onclick: fn, disabled: !!disabled || locked }, label);
        }
        function rowFor(l, i) {
          const li = el('li', { class: 'co-row' + (grabbed === l ? ' is-grabbed' : '') + (marks[l.id] ? ' ' + marks[l.id] : ''), 'data-id': l.id });
          const handle = el('span', { class: 'co-handle', 'aria-hidden': 'true', title: 'Drag to move' }, '⋮⋮');
          const code = el('button', { class: 'co-code', type: 'button', disabled: locked,
            'aria-label': `Line ${i + 1} of ${order.length}: ${l.code}${grabbed === l ? ' (picked up)' : ''}` }, ...codeNodes(l));
          code.addEventListener('click', () => {
            if (locked) return;
            if (!grabbed) { grabbed = l; render(); status.textContent = 'Picked up. Use the arrow keys, or click the line whose place it should take; Space drops it.'; focusLine(l.id); }
            else if (grabbed === l) { grabbed = null; render(); status.textContent = 'Dropped.'; focusLine(l.id); }
            else { const g = grabbed; grabbed = null; moveTo(g, order.indexOf(l)); }
          });
          code.addEventListener('keydown', e => {
            if (locked) return;
            const at = order.indexOf(l);
            let handled = true;
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
              const d = e.key === 'ArrowUp' ? -1 : 1;
              if (grabbed === l) moveTo(l, at + d);
              else if (order[at + d]) focusLine(order[at + d].id);
            } else if (e.key === 'Escape' && grabbed) { grabbed = null; render(); focusLine(l.id); }
            else if ((e.key === 'Delete') && hasBin) toBin(l);
            else if (e.key === 'Enter') { check(); }
            else handled = false;
            if (handled) { e.preventDefault(); e.stopPropagation(); }
          });
          const tools = el('span', { class: 'co-tools' },
            toolBtn('▲', 'Move up', () => moveTo(l, order.indexOf(l) - 1), i === 0),
            toolBtn('▼', 'Move down', () => moveTo(l, order.indexOf(l) + 1), i === order.length - 1),
            hasBin ? toolBtn('Bin', 'Move to the bin (doesn\'t belong)', () => toBin(l)) : null);
          handle.addEventListener('pointerdown', e => startDrag(e, l, li, handle));
          li.append(handle, el('span', { class: 'co-num', 'aria-hidden': 'true' }, String(i + 1)), code, tools);
          return li;
        }
        function binRow(l) {
          const li = el('li', { class: 'co-row' + (marks[l.id] ? ' ' + marks[l.id] : ''), 'data-id': l.id });
          const code = el('button', { class: 'co-code', type: 'button', disabled: locked, 'aria-label': `In the bin: ${l.code}. Press to put it back.`, onclick: () => fromBin(l) }, ...codeNodes(l));
          li.append(code, el('span', { class: 'co-tools' }, toolBtn('Put back', 'Put back into the program', () => fromBin(l))));
          return li;
        }
        function render() {
          listEl.innerHTML = '';
          order.forEach((l, i) => listEl.appendChild(rowFor(l, i)));
          if (hasBin) {
            binEl.innerHTML = '';
            if (!bin.length) binEl.appendChild(el('li', { class: 'empty-note' }, 'Empty'));
            bin.forEach(l => binEl.appendChild(binRow(l)));
          }
        }
        // Pointer drag on the handle (mouse, pen or touch).
        function startDrag(e, l, li, handle) {
          if (locked || e.button > 0) return;
          e.preventDefault();
          try { handle.setPointerCapture(e.pointerId); } catch (err) { /* capture is best-effort */ }
          const rows = Array.from(listEl.children);
          const from = order.indexOf(l);
          let ins = from;
          li.classList.add('is-dragging');
          const mark = () => rows.forEach((r, i) => {
            r.classList.toggle('drop-before', i === ins && ins !== from && ins !== from + 1);
            r.classList.toggle('drop-after', i === rows.length - 1 && ins === rows.length && from !== rows.length - 1);
          });
          const onMove = ev => {
            ins = rows.length;
            for (let i = 0; i < rows.length; i++) {
              const b = rows[i].getBoundingClientRect();
              if (ev.clientY < b.top + b.height / 2) { ins = i; break; }
            }
            mark();
          };
          const onUp = () => {
            handle.removeEventListener('pointermove', onMove);
            handle.removeEventListener('pointerup', onUp);
            handle.removeEventListener('pointercancel', onUp);
            const to = ins > from ? ins - 1 : ins;
            if (to !== from) moveTo(l, to); else render();
          };
          handle.addEventListener('pointermove', onMove);
          handle.addEventListener('pointerup', onUp);
          handle.addEventListener('pointercancel', onUp);
        }

        function check() {
          if (locked) return;
          grabbed = null;
          checks++;
          const res = CO.check(prog.lines, order.map(l => l.id));
          clearMarks();
          if (res.ok) {
            const pts = Math.max(1, 4 - checks);
            score += pts;
            updateHud();
            order.forEach(l => { marks[l.id] = 'is-right'; });
            locked = true;
            render();
            const book = prog.lines.map(l => l.id).join() === order.map(l => l.id).join();
            kit.feedback(fb, 'good', `Correct${checks === 1 ? ' on the first check' : ''}: +${pts}. ` +
              (book ? '' : 'Your order differs from the book\'s only in lines that don\'t depend on each other, so it works too. ') + prog.keys.join(' '));
            checkBtn.disabled = true;
            showBtn.style.display = 'none';
            nextButton(after);
            return;
          }
          res.misplaced.concat(res.strays, res.missing).forEach(id => { marks[id] = 'is-wrong'; });
          render();
          const parts = [];
          if (res.strays.length) parts.push(byId[res.strays[0]].why);
          if (res.missing.length) parts.push(`\`${byId[res.missing[0]].code}\` is part of the program: put it back.`);
          res.misplaced.slice(0, 2).forEach(id => parts.push(`\`${byId[id].code}\`: ${byId[id].note}`));
          const count = res.misplaced.length + res.strays.length + res.missing.length;
          kit.feedback(fb, 'bad', `${count} line${count > 1 ? 's' : ''} ${count > 1 ? 'need' : 'needs'} attention (outlined). ` + parts.slice(0, 3).join(' ') +
            (checks < 3 ? ` Fix and check again (worth ${Math.max(1, 3 - checks)} now).` : ''));
          showBtn.style.display = '';
        }
        function reveal() {
          if (locked) return;
          order = real.slice();
          bin = extra.slice();
          locked = true;
          grabbed = null;
          clearMarks();
          render();
          checkBtn.disabled = true;
          showBtn.style.display = 'none';
          kit.feedback(fb, 'part', 'Here is the book\'s order. ' + prog.keys.join(' ') + (extra.length ? ' ' + extra.map(x => x.why).join(' ') : ''));
          nextButton(after);
        }
        keyHandler = e => { if (e.key === 'Enter' && !isButton(e.target)) { e.preventDefault(); check(); } };
        render();
        const first = listEl.querySelector('.co-code');
        if (first) first.focus({ preventScroll: true });
      }

      /* ---------- fill-the-blank round ---------- */
      function renderBlank(r) {
        const b = r.b;
        const prog = CO.PROGRAMS[b.prog];
        const li = prog.lines.findIndex(l => l.id === b.line);
        const line = prog.lines[li];
        const at = line.code.indexOf(b.ans);
        const pad = l => (l.indent ? '    ' : '');
        body.append(kit.md('p', 'g-prompt', `Fill the blank in **${prog.file}**.`));
        const gap = el('span', { class: 'co-gap', 'aria-label': 'blank' }, '?');
        const ctx = l => (l ? el('div', { class: 'ctx' }, pad(l) + l.code) : null);
        body.append(el('div', { class: 'co-blank-code' }, ctx(prog.lines[li - 1]),
          el('div', null, pad(line) + line.code.slice(0, at), gap, line.code.slice(at + b.ans.length)), ctx(prog.lines[li + 1])));
        const opts = kit.shuffle(b.opts);
        const fb = el('div', { class: 'g-feedback', 'aria-live': 'polite' });
        const after = el('div');
        const choices = kit.choices(opts.map(o => o), (i) => {
          const right = opts[i] === b.ans;
          if (right) score++;
          updateHud();
          kit.lock(choices.buttons);
          choices.buttons[opts.indexOf(b.ans)].classList.add('is-right');
          if (!right) choices.buttons[i].classList.add('is-wrong');
          gap.textContent = b.ans;
          gap.classList.add('filled');
          kit.feedback(fb, right ? 'good' : 'bad', (right ? 'Right. ' : `It is \`${b.ans}\`. `) + b.why);
          nextButton(after);
        });
        choices.buttons.forEach((btn, i) => btn.prepend(el('span', { class: 'g-tag', style: { marginRight: '8px' } }, String(i + 1))));
        body.append(choices, fb, after);
        keyHandler = e => { const k = +e.key; if (k >= 1 && k <= opts.length) { e.preventDefault(); choices.buttons[k - 1].click(); } };
      }

      start();
    },
  });
})();
