/* Hand-built SVG diagrams referenced by guide blocks: { diagram: key }.
   Colours come from CSS custom properties so both themes work. */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  let uid = 0;
  const STYLE_KEYS = ['fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'font-size', 'font-weight', 'font-family', 'opacity', 'text-anchor', 'dominant-baseline', 'font-style'];

  function S(tag, attrs, ...kids) {
    const n = document.createElementNS(NS, tag);
    let style = '';
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === undefined || v === null) continue;
      if (STYLE_KEYS.includes(k)) style += `${k}:${v};`;
      else n.setAttribute(k, v);
    }
    if (style) n.setAttribute('style', style);
    kids.flat().forEach(k => { if (k !== null && k !== undefined) n.appendChild(typeof k === 'string' || typeof k === 'number' ? document.createTextNode(String(k)) : k); });
    return n;
  }
  const C = {
    ink: 'var(--ink)', ink2: 'var(--ink-2)', ink3: 'var(--ink-3)', rule: 'var(--rule)', ruleS: 'var(--rule-strong)',
    s1: 'var(--surface)', s2: 'var(--surface-2)', s3: 'var(--surface-3)',
    u1: 'var(--u1)', u2: 'var(--u2)', u3: 'var(--u3)', u1s: 'var(--u1-soft)', u2s: 'var(--u2-soft)', u3s: 'var(--u3-soft)',
    ack: 'var(--ack)', acks: 'var(--ack-soft)', nak: 'var(--nak)', amber: 'var(--amber)', ambers: 'var(--amber-soft)',
  };
  const FONT = 'var(--font-text)', MONO = 'var(--font-mono)', DISP = 'var(--font-display)';

  function svgRoot(w, h, title) {
    const id = 'dg' + (++uid);
    const root = S('svg', { viewBox: `0 0 ${w} ${h}`, role: 'img', 'aria-label': title, 'font-family': FONT });
    root.appendChild(S('title', null, title));
    const defs = S('defs');
    ['ink', 'ack', 'nak', 'u2', 'u3', 'ink2'].forEach(c => {
      defs.appendChild(S('marker', { id: `${id}-${c}`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' },
        S('path', { d: 'M0,0 L10,5 L0,10 z', fill: C[c] })));
    });
    root.appendChild(defs);
    root.mk = c => `url(#${id}-${c || 'ink'})`;
    return root;
  }
  function T(x, y, s, o) {
    const p = Object.assign({ x, y, fill: C.ink, 'font-size': '13px' }, o || {});
    const lines = String(s).split('\n');
    if (lines.length === 1) return S('text', p, s);
    const t = S('text', p);
    lines.forEach((ln, i) => t.appendChild(S('tspan', { x, dy: i ? '1.2em' : 0 }, ln)));
    return t;
  }
  function box(x, y, w, h, o) {
    return S('rect', Object.assign({ x, y, width: w, height: h, rx: 4, fill: C.s1, stroke: C.ruleS, 'stroke-width': '1.2px' }, o || {}));
  }
  function line(x1, y1, x2, y2, o) {
    return S('line', Object.assign({ x1, y1, x2, y2, stroke: C.ink, 'stroke-width': '1.5px' }, o || {}));
  }
  function arrow(root, x1, y1, x2, y2, color, o) {
    return line(x1, y1, x2, y2, Object.assign({ stroke: C[color || 'ink'], 'marker-end': root.mk(color || 'ink') }, o || {}));
  }

  const D = {};

  D.stack = () => {
    const r = svgRoot(640, 300, 'Five-layer Internet protocol stack');
    const rows = [
      ['Application', 'HTTP, IMAP, SMTP, DNS', 'message', C.u2s, C.u2],
      ['Transport', 'TCP, UDP', 'segment', C.u3s, C.u3],
      ['Network', 'IP, routing protocols', 'datagram', C.u1s, C.u1],
      ['Link', 'Ethernet, Wi-Fi, PPP', 'frame', C.s2, C.ink3],
      ['Physical', 'bits on the wire, fibre, radio', 'bits', C.s3, C.ink3],
    ];
    r.appendChild(T(20, 22, 'Layer', { fill: C.ink2, 'font-size': '12px', 'font-weight': 700 }));
    r.appendChild(T(200, 22, 'Example protocols', { fill: C.ink2, 'font-size': '12px', 'font-weight': 700 }));
    r.appendChild(T(520, 22, 'Packet name', { fill: C.ink2, 'font-size': '12px', 'font-weight': 700 }));
    rows.forEach(([name, ex, pdu, bg, edge], i) => {
      const y = 34 + i * 52;
      r.appendChild(box(10, y, 620, 46, { fill: bg, stroke: 'none' }));
      r.appendChild(S('rect', { x: 10, y, width: 6, height: 46, fill: edge }));
      r.appendChild(T(28, y + 29, name, { 'font-size': '19px', 'font-weight': 600, 'font-family': DISP }));
      r.appendChild(T(200, y + 28, ex, { 'font-size': '14px' }));
      r.appendChild(T(520, y + 28, pdu, { 'font-size': '14px', 'font-weight': 700, 'font-family': MONO }));
    });
    return { node: r, caption: 'Top to bottom: application, transport, network, link, physical. Each layer’s packet has its own name.' };
  };

  D.encapsulation = () => {
    const r = svgRoot(780, 330, 'Encapsulation across a host, switch, router and host');
    const layers = ['application', 'transport', 'network', 'link', 'physical'];
    const pdus = [['M'], ['Ht', 'M'], ['Hn', 'Ht', 'M'], ['Hl', 'Hn', 'Ht', 'M'], []];
    const colors = { M: C.s3, Ht: C.u3s, Hn: C.u1s, Hl: C.s2 };
    const strokes = { M: C.ruleS, Ht: C.u3, Hn: C.u1, Hl: C.ink3 };
    const devs = [
      { x: 20, name: 'Source host', from: 0 },
      { x: 330, name: 'Link-layer switch', from: 3 },
      { x: 470, name: 'Router', from: 2 },
      { x: 640, name: 'Destination host', from: 0 },
    ];
    const LH = 40, top = 50, W = 120;
    devs.forEach(d => {
      r.appendChild(T(d.x + W / 2, 30, d.name, { 'text-anchor': 'middle', 'font-weight': 700 }));
      layers.forEach((L, i) => {
        if (i < d.from) return;
        r.appendChild(box(d.x, top + i * LH, W, LH - 6, { fill: C.s1 }));
        r.appendChild(T(d.x + W / 2, top + i * LH + 22, L, { 'text-anchor': 'middle', 'font-size': '12.5px', fill: C.ink2 }));
      });
    });
    // PDUs at source
    pdus.forEach((parts, i) => {
      let x = 160;
      parts.forEach(p => {
        const w = p === 'M' ? 40 : 28;
        r.appendChild(box(x, top + i * LH + 4, w, LH - 14, { fill: colors[p], stroke: strokes[p], rx: 2 }));
        r.appendChild(T(x + w / 2, top + i * LH + 22, p, { 'text-anchor': 'middle', 'font-family': MONO, 'font-size': '12px', 'font-weight': 600 }));
        x += w + 2;
      });
    });
    const names = ['message', 'segment', 'datagram', 'frame'];
    names.forEach((n, i) => r.appendChild(T(160, top + i * LH - 1, n, { 'font-size': '10.5px', fill: C.ink3 })));
    // path
    const yb = top + 4 * LH + 30;
    const path = `M ${80} ${top + 34} V ${yb} H ${390} V ${top + 3 * LH + 17} V ${yb} H ${530} V ${top + 2 * LH + 17} V ${yb} H ${700} V ${top + 34}`;
    r.appendChild(S('path', { d: path, fill: 'none', stroke: C.u2, 'stroke-width': '2.5px', 'stroke-dasharray': '6 4', 'marker-end': r.mk('u2') }));
    r.appendChild(T(390, yb + 22, 'switch processes link + physical', { 'text-anchor': 'middle', 'font-size': '12px', fill: C.ink2 }));
    r.appendChild(T(540, yb + 22, 'router: network + link + physical', { 'text-anchor': 'start', 'font-size': '12px', fill: C.ink2 }));
    r.appendChild(T(80, yb + 22, 'hosts implement all five', { 'text-anchor': 'middle', 'font-size': '12px', fill: C.ink2 }));
    return { node: r, caption: 'Each layer adds its header on the way down (Ht, Hn, Hl) and the peer layer removes it on the way up. Switches only look at link-layer headers; routers look at network-layer headers too.' };
  };

  D['delay-components'] = () => {
    const r = svgRoot(720, 230, 'Four components of nodal delay');
    // router A
    r.appendChild(box(30, 60, 260, 110, { fill: C.s2 }));
    r.appendChild(T(40, 52, 'Router A', { 'font-weight': 700 }));
    r.appendChild(box(50, 95, 60, 40, { fill: C.s1 }));
    r.appendChild(T(80, 120, 'process', { 'text-anchor': 'middle', 'font-size': '12px' }));
    // queue
    for (let i = 0; i < 5; i++) r.appendChild(S('rect', { x: 130 + i * 24, y: 100, width: 20, height: 30, fill: i < 3 ? C.u2s : C.s1, stroke: C.ruleS }));
    r.appendChild(arrow(r, 110, 115, 128, 115));
    // output link
    r.appendChild(S('rect', { x: 250, y: 100, width: 36, height: 30, fill: C.u2, stroke: C.u2 }));
    r.appendChild(line(290, 115, 600, 115, { 'stroke-width': '3px', stroke: C.ink3 }));
    r.appendChild(box(600, 75, 90, 80, { fill: C.s2 }));
    r.appendChild(T(645, 120, 'Router B', { 'text-anchor': 'middle', 'font-weight': 700 }));
    r.appendChild(S('rect', { x: 400, y: 104, width: 70, height: 22, fill: C.u2, opacity: 0.85 }));
    const lab = (x, y, a, b) => { r.appendChild(T(x, y, a, { 'text-anchor': 'middle', 'font-family': MONO, 'font-weight': 600 })); r.appendChild(T(x, y + 16, b, { 'text-anchor': 'middle', 'font-size': '11.5px', fill: C.ink2 })); };
    lab(80, 190, 'd_proc', 'check bits, read header');
    lab(180, 190, 'd_queue', 'wait for the link');
    lab(268, 30, 'd_trans = L/R', 'push all bits onto link');
    lab(450, 190, 'd_prop = d/s', 'bit travels the wire');
    r.appendChild(line(268, 52, 268, 96, { stroke: C.ink3, 'stroke-dasharray': '3 3' }));
    r.appendChild(line(180, 135, 180, 172, { stroke: C.ink3, 'stroke-dasharray': '3 3' }));
    r.appendChild(line(80, 135, 80, 172, { stroke: C.ink3, 'stroke-dasharray': '3 3' }));
    r.appendChild(line(450, 128, 450, 172, { stroke: C.ink3, 'stroke-dasharray': '3 3' }));
    return { node: r, caption: 'd_nodal = d_proc + d_queue + d_trans + d_prop. Transmission depends on packet length and link rate; propagation depends on distance and signal speed.' };
  };

  D['store-forward'] = () => {
    const r = svgRoot(720, 210, 'Store-and-forward transmission over three links');
    const xs = [60, 260, 460, 660];
    const names = ['Source', 'Router 1', 'Router 2', 'Destination'];
    xs.forEach((x, i) => {
      r.appendChild(S('circle', { cx: x, cy: 70, r: 22, fill: C.s2, stroke: C.ruleS }));
      r.appendChild(T(x, 108, names[i], { 'text-anchor': 'middle', 'font-weight': 600 }));
      if (i < 3) {
        r.appendChild(line(x + 24, 70, xs[i + 1] - 24, 70, { 'stroke-width': '3px', stroke: C.ink3 }));
        r.appendChild(T((x + xs[i + 1]) / 2, 58, 'rate R', { 'text-anchor': 'middle', 'font-size': '12px', fill: C.ink2 }));
      }
    });
    const rows = [['t = L/R', 1], ['t = 2L/R', 2], ['t = 3L/R', 3]];
    rows.forEach(([t, k], i) => {
      const y = 140 + i * 22;
      r.appendChild(T(20, y + 4, t, { 'font-family': MONO, 'font-size': '12px' }));
      r.appendChild(S('rect', { x: xs[k] - 18, y: y - 9, width: 36, height: 14, fill: C.u1, rx: 2 }));
      r.appendChild(T(xs[k] + 26, y + 4, k < 3 ? `whole packet stored at ${names[k]}` : 'whole packet received', { 'font-size': '12px', fill: C.ink2 }));
    });
    return { node: r, caption: 'A router must receive the entire packet before it starts sending it on. One packet over N links of rate R: d_end-to-end = N·L/R (ignoring propagation, queuing, processing).' };
  };

  D['network-of-networks'] = () => {
    const r = svgRoot(720, 300, 'Network of networks: ISP hierarchy');
    const node = (x, y, w, label, fill, stroke) => { r.appendChild(box(x - w / 2, y - 16, w, 32, { fill, stroke, rx: 16 })); r.appendChild(T(x, y + 5, label, { 'text-anchor': 'middle', 'font-size': '12.5px', 'font-weight': 600 })); };
    const t1 = [[230, 50], [490, 50]];
    const ixp = [360, 120];
    const reg = [[150, 160], [360, 190], [570, 160]];
    const acc = [[80, 250], [200, 250], [310, 260], [420, 260], [530, 250], [650, 250]];
    const cp = [650, 95];
    const L = (a, b, o) => r.appendChild(line(a[0], a[1], b[0], b[1], Object.assign({ stroke: C.ruleS, 'stroke-width': '2px' }, o || {})));
    L(t1[0], t1[1], { stroke: C.u1, 'stroke-dasharray': '6 4' });
    t1.forEach(t => L(t, ixp));
    reg.forEach((g, i) => { L(g, t1[i < 2 ? 0 : 1]); if (i === 1) L(g, t1[1]); });
    L(reg[0], ixp); L(reg[2], ixp);
    acc.forEach((a, i) => L(a, reg[Math.min(2, Math.floor(i / 2))]));
    L(acc[3], reg[2]);
    L(cp, t1[1]); L(cp, ixp); L(cp, reg[2]);
    t1.forEach(t => node(t[0], t[1], 110, 'Tier-1 ISP', C.u1s, C.u1));
    node(ixp[0], ixp[1], 60, 'IXP', C.ambers, C.amber);
    reg.forEach(g => node(g[0], g[1], 120, 'Regional ISP', C.s2, C.ruleS));
    acc.forEach(a => node(a[0], a[1], 92, 'Access ISP', C.s1, C.ruleS));
    node(cp[0], cp[1], 130, 'Content provider', C.u2s, C.u2);
    r.appendChild(T(360, 34, 'peer', { 'text-anchor': 'middle', 'font-size': '11px', fill: C.u1 }));
    return { node: r, caption: 'Access ISPs buy transit from regional ISPs, which buy from tier-1 ISPs. Peers at the same level exchange traffic directly or at an IXP. Content providers like Google run their own networks that connect at IXPs and to lower-tier ISPs.' };
  };

  function timeline(r, xa, xb, top, bottom, la, lb) {
    r.appendChild(T(xa, top - 12, la, { 'text-anchor': 'middle', 'font-weight': 700 }));
    r.appendChild(T(xb, top - 12, lb, { 'text-anchor': 'middle', 'font-weight': 700 }));
    r.appendChild(line(xa, top, xa, bottom, { stroke: C.ink3, 'stroke-width': '2px' }));
    r.appendChild(line(xb, top, xb, bottom, { stroke: C.ink3, 'stroke-width': '2px' }));
    r.appendChild(T(xa - 10, bottom + 14, 'time', { 'text-anchor': 'end', 'font-size': '11px', fill: C.ink3 }));
  }
  function brace(r, x, y1, y2, label, side) {
    const s = side === 'right' ? 1 : -1;
    r.appendChild(S('path', { d: `M ${x} ${y1} h ${s * 8} V ${y2} h ${-s * 8}`, fill: 'none', stroke: C.ink2, 'stroke-width': '1.4px' }));
    r.appendChild(T(x + s * 14, (y1 + y2) / 2 + 4, label, { 'text-anchor': side === 'right' ? 'start' : 'end', 'font-size': '12.5px', 'font-weight': 600 }));
  }

  D['http-nonpersistent'] = () => {
    const r = svgRoot(680, 330, 'Non-persistent HTTP timing: two RTTs plus transmission time');
    const xa = 230, xb = 470, top = 40;
    timeline(r, xa, xb, top, 300, 'Client', 'Server');
    r.appendChild(arrow(r, xa, 50, xb, 80)); r.appendChild(T(350, 56, 'TCP SYN', { 'text-anchor': 'middle', 'font-size': '12px' }));
    r.appendChild(arrow(r, xb, 80, xa, 110)); r.appendChild(T(350, 88, 'SYNACK', { 'text-anchor': 'middle', 'font-size': '12px' }));
    r.appendChild(arrow(r, xa, 110, xb, 140, 'u2')); r.appendChild(T(350, 118, 'ACK + HTTP request', { 'text-anchor': 'middle', 'font-size': '12px', fill: C.u2, 'font-weight': 700 }));
    r.appendChild(S('polygon', { points: `${xb},140 ${xb},200 ${xa},230 ${xa},170`, fill: C.u2s, stroke: C.u2 }));
    r.appendChild(T(350, 190, 'response carrying the file', { 'text-anchor': 'middle', 'font-size': '12px' }));
    brace(r, xa - 14, 50, 110, 'connect: 1 RTT', 'left');
    brace(r, xa - 14, 110, 170, 'request/response: 1 RTT', 'left');
    brace(r, xa - 14, 170, 230, 'transmit file', 'left');
    brace(r, xb + 14, 140, 200, 'server sends file', 'right');
    r.appendChild(T(350, 280, 'total ≈ 2 RTT + file transmission time', { 'text-anchor': 'middle', 'font-weight': 700 }));
    return { node: r, caption: 'The request rides on the third handshake segment, so each non-persistent object costs 2 RTT plus its transmission time.' };
  };

  D['email-flow'] = () => {
    const r = svgRoot(760, 200, 'E-mail delivery from Alice to Bob');
    const nodes = [[70, 'Alice’s user agent', C.s1], [260, 'Alice’s mail server', C.s2], [500, 'Bob’s mail server', C.s2], [690, 'Bob’s user agent', C.s1]];
    nodes.forEach(([x, n, f]) => { r.appendChild(box(x - 70, 60, 140, 56, { fill: f })); r.appendChild(T(x, 92, n, { 'text-anchor': 'middle', 'font-size': '12.5px', 'font-weight': 700 })); });
    r.appendChild(T(260, 140, 'message queue (outgoing)', { 'text-anchor': 'middle', 'font-size': '11.5px', fill: C.ink2 }));
    r.appendChild(T(500, 140, 'mailbox (incoming)', { 'text-anchor': 'middle', 'font-size': '11.5px', fill: C.ink2 }));
    r.appendChild(arrow(r, 142, 88, 188, 88, 'u2'));
    r.appendChild(T(165, 50, 'SMTP or HTTP', { 'text-anchor': 'middle', 'font-size': '11.5px', fill: C.u2, 'font-weight': 700 }));
    r.appendChild(arrow(r, 332, 88, 428, 88, 'u2'));
    r.appendChild(T(380, 50, 'SMTP, TCP port 25', { 'text-anchor': 'middle', 'font-size': '11.5px', fill: C.u2, 'font-weight': 700 }));
    r.appendChild(T(380, 108, 'push', { 'text-anchor': 'middle', 'font-size': '11px', fill: C.ink2 }));
    r.appendChild(arrow(r, 618, 88, 572, 88, 'u3'));
    r.appendChild(T(595, 50, 'IMAP or HTTP', { 'text-anchor': 'middle', 'font-size': '11.5px', fill: C.u3, 'font-weight': 700 }));
    r.appendChild(T(595, 108, 'pull', { 'text-anchor': 'middle', 'font-size': '11px', fill: C.ink2 }));
    r.appendChild(T(380, 180, 'The sending server is the SMTP client; the receiving server is the SMTP server.', { 'text-anchor': 'middle', 'font-size': '12px', fill: C.ink2 }));
    return { node: r, caption: 'SMTP pushes mail between servers. The recipient pulls it with IMAP or HTTP, never with SMTP.' };
  };

  function dnsBase(title) {
    const r = svgRoot(720, 330, title);
    const P = { host: [110, 270], local: [110, 130], root: [360, 50], tld: [610, 130], auth: [610, 270] };
    const nm = { host: ['requesting host', 'cse.nyu.edu'], local: ['local DNS server', 'dns.nyu.edu'], root: ['root DNS server', ''], tld: ['TLD DNS server', '.edu'], auth: ['authoritative DNS', 'dns.umass.edu'] };
    Object.entries(P).forEach(([k, [x, y]]) => {
      const f = k === 'local' ? C.u2s : k === 'host' ? C.s1 : C.s2;
      r.appendChild(box(x - 75, y - 26, 150, 52, { fill: f, stroke: k === 'local' ? C.u2 : C.ruleS }));
      r.appendChild(T(x, y - 4, nm[k][0], { 'text-anchor': 'middle', 'font-size': '12.5px', 'font-weight': 700 }));
      if (nm[k][1]) r.appendChild(T(x, y + 14, nm[k][1], { 'text-anchor': 'middle', 'font-size': '11.5px', 'font-family': MONO, fill: C.ink2 }));
    });
    r.appendChild(T(360, 318, 'query: gaia.cs.umass.edu', { 'text-anchor': 'middle', 'font-size': '12px', 'font-family': MONO, fill: C.ink2 }));
    return { r, P };
  }
  function num(r, x, y, n, color) {
    r.appendChild(S('circle', { cx: x, cy: y, r: 10, fill: color || C.ink }));
    r.appendChild(T(x, y + 4, String(n), { 'text-anchor': 'middle', 'font-size': '11px', 'font-weight': 700, fill: 'var(--bg)' }));
  }
  function seg(r, a, b, off, n, color) {
    // offset line from a to b perpendicular by off px; numbered at middle
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
    const ox = -dy / len * off, oy = dx / len * off;
    const sh = 34 / len;
    const x1 = a[0] + dx * sh + ox, y1 = a[1] + dy * sh + oy, x2 = b[0] - dx * sh + ox, y2 = b[1] - dy * sh + oy;
    r.appendChild(arrow(r, x1, y1, x2, y2, color === C.u2 ? 'u2' : 'ink'));
    num(r, (x1 + x2) / 2 + ox * 0.9, (y1 + y2) / 2 + oy * 0.9, n, color);
  }
  D['dns-iterative'] = () => {
    const { r, P } = dnsBase('Iterative DNS resolution: 8 messages');
    seg(r, P.host, P.local, -12, 1); seg(r, P.local, P.host, -12, 8, C.u2);
    seg(r, P.local, P.root, -10, 2); seg(r, P.root, P.local, -10, 3, C.u2);
    seg(r, P.local, P.tld, -10, 4); seg(r, P.tld, P.local, -10, 5, C.u2);
    seg(r, P.local, P.auth, -10, 6); seg(r, P.auth, P.local, -10, 7, C.u2);
    return { node: r, caption: 'Iterative: the local server asks root (2), which refers it to the .edu TLD (3); the TLD refers it to umass’s authoritative server (5); that server returns the IP (7). 4 queries + 4 replies = 8 messages.' };
  };
  D['dns-recursive'] = () => {
    const { r, P } = dnsBase('Recursive DNS resolution: 8 messages');
    seg(r, P.host, P.local, -12, 1); seg(r, P.local, P.host, -12, 8, C.u2);
    seg(r, P.local, P.root, -10, 2); seg(r, P.root, P.local, -10, 7, C.u2);
    seg(r, P.root, P.tld, -10, 3); seg(r, P.tld, P.root, -10, 6, C.u2);
    seg(r, P.tld, P.auth, -10, 4); seg(r, P.auth, P.tld, -10, 5, C.u2);
    return { node: r, caption: 'Recursive: each server asks the next on the requester’s behalf, and replies travel back along the chain. This puts the load on root and TLD servers, so in practice the local server queries iteratively.' };
  };

  function headerGrid(r, rows, y0, x0, W) {
    const bit = W / 32;
    // ruler
    [0, 8, 16, 24, 31].forEach(b => r.appendChild(T(x0 + b * bit + bit / 2, y0 - 8, String(b), { 'text-anchor': 'middle', 'font-size': '10.5px', fill: C.ink3, 'font-family': MONO })));
    let y = y0;
    rows.forEach(row => {
      const h = row.h || 34;
      let b = 0;
      row.f.forEach(([label, bits, opts]) => {
        const o = opts || {};
        r.appendChild(S('rect', { x: x0 + b * bit, y, width: bits * bit, height: h, fill: o.fill || C.s1, stroke: C.ruleS, 'stroke-width': '1.2px' }));
        r.appendChild(T(x0 + (b + bits / 2) * bit, y + h / 2 + 4, label, { 'text-anchor': 'middle', 'font-size': o.small ? '10px' : '12.5px', 'font-weight': o.bold ? 700 : 400, 'font-family': o.mono ? MONO : FONT }));
        b += bits;
      });
      y += h;
    });
    return y;
  }
  D['udp-segment'] = () => {
    const r = svgRoot(560, 190, 'UDP segment structure');
    const y = headerGrid(r, [
      { f: [['source port #', 16, { fill: C.u3s }], ['dest port #', 16, { fill: C.u3s }]] },
      { f: [['length', 16, { fill: C.u3s }], ['checksum', 16, { fill: C.u3s }]] },
      { h: 58, f: [['application data (message)', 32, { fill: C.s2 }]] },
    ], 30, 20, 520);
    r.appendChild(T(20, y + 22, '32 bits wide. Header = 4 fields × 2 bytes = 8 bytes. Length counts header + data, in bytes.', { 'font-size': '12px', fill: C.ink2 }));
    return { node: r, caption: 'The destination IP address is not in the UDP header: it is in the IP header.' };
  };
  D['tcp-segment'] = () => {
    const r = svgRoot(580, 330, 'TCP segment structure');
    const flags = ['CWR', 'ECE', 'URG', 'ACK', 'PSH', 'RST', 'SYN', 'FIN'];
    const y = headerGrid(r, [
      { f: [['source port #', 16, { fill: C.u3s }], ['dest port #', 16, { fill: C.u3s }]] },
      { f: [['sequence number', 32, { fill: C.u3s, bold: true }]] },
      { f: [['acknowledgment number', 32, { fill: C.u3s, bold: true }]] },
      { h: 40, f: [['head len', 4, { small: true }], ['unused', 4, { small: true }], ...flags.map(fl => [fl, 1, { small: true, mono: true }]), ['receive window', 16]] },
      { f: [['Internet checksum', 16], ['urgent data pointer', 16]] },
      { f: [['options (variable length)', 32, { fill: C.s2 }]] },
      { h: 46, f: [['application data (variable length)', 32, { fill: C.s2 }]] },
    ], 30, 20, 540);
    r.appendChild(T(20, y + 20, 'Typical header: 20 bytes (no options). Seq and ACK count bytes, not segments.', { 'font-size': '12px', fill: C.ink2 }));
    // rotate flag labels: done via small font; fine at this width
    return { node: r, caption: 'Flags: ACK (ack field valid), SYN/FIN (set up / tear down), RST (reset), PSH, URG; CWR/ECE for congestion notification. Receive window is for flow control.' };
  };

  D['stop-and-wait'] = () => {
    const r = svgRoot(640, 330, 'Stop-and-wait timing');
    const xa = 200, xb = 460, top = 40;
    timeline(r, xa, xb, top, 300, 'Sender', 'Receiver');
    const t0 = 50, tL = 80, pr = 120; // L/R = 30px, RTT/2 = 120px
    r.appendChild(S('polygon', { points: `${xa},${t0} ${xa},${tL} ${xb},${tL + pr} ${xb},${t0 + pr}`, fill: C.u3s, stroke: C.u3 }));
    r.appendChild(arrow(r, xb, tL + pr, xa, tL + 2 * pr, 'ack'));
    r.appendChild(T(xa - 10, t0 + 4, 'first bit sent, t = 0', { 'text-anchor': 'end', 'font-size': '12px' }));
    r.appendChild(T(xa - 10, tL + 4, 'last bit sent, t = L/R', { 'text-anchor': 'end', 'font-size': '12px' }));
    r.appendChild(T(xb + 10, t0 + pr + 4, 'first bit arrives', { 'font-size': '12px' }));
    r.appendChild(T(xb + 10, tL + pr + 4, 'last bit arrives, send ACK', { 'font-size': '12px' }));
    r.appendChild(T(xa - 10, tL + 2 * pr + 4, 'ACK arrives, send next', { 'text-anchor': 'end', 'font-size': '12px', 'font-weight': 700 }));
    r.appendChild(T(xa - 10, tL + 2 * pr + 20, 't = RTT + L/R', { 'text-anchor': 'end', 'font-size': '12px', 'font-family': MONO }));
    brace(r, xa + 10, t0, tL, 'L/R', 'right');
    r.appendChild(T(330, 315, 'U_sender = (L/R) / (RTT + L/R)', { 'text-anchor': 'middle', 'font-family': MONO, 'font-weight': 600 }));
    return { node: r, caption: 'The sender is busy only for L/R out of every RTT + L/R. With RTT = 30 ms, L = 8000 bits, R = 1 Gbps: U ≈ 0.00027.' };
  };

  D.pipelining = () => {
    const r = svgRoot(640, 330, 'Pipelined sending of three packets');
    const xa = 200, xb = 460, top = 40;
    timeline(r, xa, xb, top, 300, 'Sender', 'Receiver');
    const t0 = 50, d = 26, pr = 110;
    [0, 1, 2].forEach(k => {
      const a = t0 + k * d, b = a + d;
      r.appendChild(S('polygon', { points: `${xa},${a} ${xa},${b} ${xb},${b + pr} ${xb},${a + pr}`, fill: k === 0 ? C.u3s : k === 1 ? C.u2s : C.u1s, stroke: C.ruleS }));
      r.appendChild(arrow(r, xb, b + pr, xa, b + 2 * pr, 'ack'));
    });
    r.appendChild(T(xa - 10, t0 + 4, 't = 0', { 'text-anchor': 'end', 'font-size': '12px' }));
    r.appendChild(T(xa - 10, t0 + 3 * d + 4, 't = 3L/R', { 'text-anchor': 'end', 'font-size': '12px' }));
    r.appendChild(T(xa - 10, t0 + d + 2 * pr + 4, 'first ACK: RTT + L/R', { 'text-anchor': 'end', 'font-size': '12px', 'font-weight': 700 }));
    r.appendChild(T(330, 318, 'U_sender = 3(L/R) / (RTT + L/R)', { 'text-anchor': 'middle', 'font-family': MONO, 'font-weight': 600 }));
    return { node: r, caption: 'Sending N packets before waiting multiplies utilization by N (here 3). It needs more sequence numbers and buffering.' };
  };

  function seqStrip(r, y, cells, x0, w) {
    cells.forEach((c, i) => {
      const fills = { acked: C.ack, sent: C.amber, usable: C.u2s, unusable: C.s3, buffered: C.u3, expected: C.s1, rcvok: C.u2s };
      r.appendChild(S('rect', { x: x0 + i * w, y, width: w - 3, height: 30, rx: 2, fill: fills[c], stroke: c === 'usable' || c === 'expected' || c === 'rcvok' ? C.u2 : 'none', 'stroke-width': '1.2px' }));
      r.appendChild(T(x0 + i * w + (w - 3) / 2, y + 20, String(i), { 'text-anchor': 'middle', 'font-size': '11px', 'font-family': MONO, fill: c === 'acked' || c === 'buffered' ? '#fff' : C.ink }));
    });
  }
  function legend(r, items, y) {
    let x = 20;
    items.forEach(([fill, stroke, label]) => {
      r.appendChild(S('rect', { x, y: y - 10, width: 14, height: 14, rx: 2, fill, stroke: stroke || 'none' }));
      r.appendChild(T(x + 20, y + 2, label, { 'font-size': '12px' }));
      x += 32 + label.length * 6.3;
    });
  }
  D['gbn-window'] = () => {
    const r = svgRoot(700, 170, 'Go-Back-N sender view of sequence numbers');
    const cells = []; for (let i = 0; i < 20; i++) cells.push(i < 5 ? 'acked' : i < 9 ? 'sent' : i < 12 ? 'usable' : 'unusable');
    const x0 = 20, w = 33;
    seqStrip(r, 50, cells, x0, w);
    r.appendChild(S('path', { d: `M ${x0 + 5 * w} 44 v -10 H ${x0 + 12 * w - 3} v 10`, fill: 'none', stroke: C.ink, 'stroke-width': '2px' }));
    r.appendChild(T(x0 + 8.5 * w, 28, 'window size N = 7', { 'text-anchor': 'middle', 'font-weight': 700, 'font-size': '12.5px' }));
    r.appendChild(arrow(r, x0 + 5 * w + 14, 110, x0 + 5 * w + 14, 84));
    r.appendChild(T(x0 + 5 * w + 14, 126, 'send_base', { 'text-anchor': 'middle', 'font-family': MONO, 'font-size': '12px' }));
    r.appendChild(arrow(r, x0 + 9 * w + 14, 110, x0 + 9 * w + 14, 84));
    r.appendChild(T(x0 + 9 * w + 14, 126, 'nextseqnum', { 'text-anchor': 'middle', 'font-family': MONO, 'font-size': '12px' }));
    legend(r, [[C.ack, null, 'already ACKed'], [C.amber, null, 'sent, not yet ACKed'], [C.u2s, C.u2, 'usable, not yet sent'], [C.s3, null, 'not usable']], 158);
    return { node: r, caption: 'The window [send_base, send_base + N − 1] slides forward as cumulative ACKs arrive.' };
  };
  D['sr-windows'] = () => {
    const r = svgRoot(700, 290, 'Selective Repeat sender and receiver windows');
    const x0 = 20, w = 33;
    r.appendChild(T(20, 30, 'Sender view', { 'font-weight': 700 }));
    const sc = []; for (let i = 0; i < 20; i++) sc.push(i < 4 ? 'acked' : i < 11 ? ([5, 7].includes(i) ? 'acked' : i < 9 ? 'sent' : 'usable') : 'unusable');
    seqStrip(r, 40, sc, x0, w);
    r.appendChild(S('path', { d: `M ${x0 + 4 * w} 78 v 8 H ${x0 + 11 * w - 3} v -8`, fill: 'none', stroke: C.ink, 'stroke-width': '2px' }));
    r.appendChild(T(x0 + 4 * w, 104, 'send_base', { 'font-family': MONO, 'font-size': '12px' }));
    r.appendChild(T(x0 + 7.5 * w, 104, 'window N = 7', { 'font-size': '12px', 'font-weight': 700 }));
    r.appendChild(T(20, 150, 'Receiver view', { 'font-weight': 700 }));
    const rc = []; for (let i = 0; i < 20; i++) rc.push(i < 4 ? 'acked' : i < 11 ? ([5, 7, 8].includes(i) ? 'buffered' : 'rcvok') : 'unusable');
    rc[4] = 'expected';
    seqStrip(r, 160, rc, x0, w);
    r.appendChild(S('path', { d: `M ${x0 + 4 * w} 198 v 8 H ${x0 + 11 * w - 3} v -8`, fill: 'none', stroke: C.ink, 'stroke-width': '2px' }));
    r.appendChild(T(x0 + 4 * w, 224, 'rcv_base', { 'font-family': MONO, 'font-size': '12px' }));
    legend(r, [[C.ack, null, 'ACKed / delivered'], [C.amber, null, 'sent, not ACKed'], [C.u3, null, 'out of order: buffered + ACKed'], [C.u2s, C.u2, 'acceptable / usable'], [C.s3, null, 'not usable']], 270);
    return { node: r, caption: 'SR ACKs each packet individually. The receiver buffers 5, 7, 8 until 4 arrives, then delivers 4–5 and slides. Window size must be at most half the sequence-number space.' };
  };

  D['tcp-handshake'] = () => {
    const r = svgRoot(680, 290, 'TCP three-way handshake');
    const xa = 200, xb = 480, top = 40;
    timeline(r, xa, xb, top, 260, 'Client', 'Server');
    r.appendChild(arrow(r, xa, 60, xb, 110, 'u3'));
    r.appendChild(T(340, 72, 'SYN = 1, seq = client_isn', { 'text-anchor': 'middle', 'font-family': MONO, 'font-size': '12px' }));
    r.appendChild(arrow(r, xb, 120, xa, 170, 'u3'));
    r.appendChild(T(340, 132, 'SYN = 1, seq = server_isn,', { 'text-anchor': 'middle', 'font-family': MONO, 'font-size': '12px' }));
    r.appendChild(T(340, 148, 'ack = client_isn + 1', { 'text-anchor': 'middle', 'font-family': MONO, 'font-size': '12px' }));
    r.appendChild(arrow(r, xa, 180, xb, 230, 'u3'));
    r.appendChild(T(340, 192, 'SYN = 0, seq = client_isn + 1,', { 'text-anchor': 'middle', 'font-family': MONO, 'font-size': '12px' }));
    r.appendChild(T(340, 208, 'ack = server_isn + 1 (may carry data)', { 'text-anchor': 'middle', 'font-family': MONO, 'font-size': '12px' }));
    r.appendChild(T(xa - 10, 64, 'connection request', { 'text-anchor': 'end', 'font-size': '12px' }));
    r.appendChild(T(xb + 10, 124, 'connection granted', { 'font-size': '12px' }));
    r.appendChild(T(xa - 10, 184, 'ACK', { 'text-anchor': 'end', 'font-size': '12px' }));
    return { node: r, caption: 'Both sides pick random initial sequence numbers. The SYN consumes one sequence number, which is why the ACKs say isn + 1.' };
  };

  NET.diagram = function (key) {
    const f = D[key];
    if (!f) return null;
    try { return f(); } catch (e) { return null; }
  };
  NET.diagramKeys = Object.keys(D);
})();
