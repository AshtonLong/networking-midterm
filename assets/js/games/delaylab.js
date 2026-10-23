/* Delay lab: transmission vs propagation delay, store-and-forward, queuing and throughput
   (Kurose & Ross 8th ed., sections 1.3-1.4). Two modes: a "watch the wire" sandbox and a
   scored 10-round challenge. All answers are computed from the scenario's inputs. */
(function () {
  'use strict';

  /* ---------- number formatting ---------- */
  const SUPS = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻' };
  const sig = (x, p) => Number(Number(x).toPrecision(p || 4));
  const sep = x => x.toLocaleString('en-US', { maximumFractionDigits: 12 });

  /* Number for display. Markup (10^{8}) by default; plain=true uses unicode superscripts (for SVG text). */
  function num(x, p, plain) {
    if (!isFinite(x)) return String(x);
    if (x === 0) return '0';
    const a = Math.abs(x);
    if (a >= 1e7 || a < 1e-3) {
      let e = Math.floor(Math.log10(a));
      let m = sig(x / Math.pow(10, e), p || 4);
      if (Math.abs(m) >= 10) { m = sig(m / 10, p || 4); e += 1; }
      if (plain) return m + '×10' + String(e).split('').map(c => SUPS[c]).join('');
      return `${m} × 10^{${e}}`;
    }
    return sep(sig(x, p || 4));
  }
  function timeUnit(sec) {
    const a = Math.abs(sec);
    if (a >= 1) return ['s', 1];
    if (a >= 1e-3) return ['ms', 1e-3];
    if (a >= 1e-6) return ['µs', 1e-6];
    return ['ns', 1e-9];
  }
  function ft(sec, plain) {
    if (sec === 0) return '0 s';
    const [u, f] = timeUnit(sec);
    return `${num(sec / f, 4, plain)} ${u}`;
  }
  function fr(bps) { // link rate, textbook prefixes (k = 10^3, M = 10^6, G = 10^9)
    if (bps >= 1e9) return `${num(bps / 1e9)} Gbps`;
    if (bps >= 1e6) return `${num(bps / 1e6)} Mbps`;
    if (bps >= 1e3) return `${num(bps / 1e3)} kbps`;
    return `${num(bps)} bps`;
  }
  function rsi(bps) { // rate written for substitution: "10 × 10^{6}"
    if (bps >= 1e9) return `${num(bps / 1e9)} × 10^{9}`;
    if (bps >= 1e6) return `${num(bps / 1e6)} × 10^{6}`;
    if (bps >= 1e3) return `${num(bps / 1e3)} × 10^{3}`;
    return num(bps);
  }
  function fd(m, plain) { return m >= 1000 ? `${num(m / 1000, 4, plain)} km` : `${num(m, 4, plain)} m`; }
  const pct = x => Math.floor(x * 100 + 1e-9) + '%';
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

  /* ---------- pure simulation (store-and-forward over N equal links) ---------- */
  function derive(p) {
    const dt = p.Lbits / p.R, dp = p.d / p.s, hop = dt + dp;
    return Object.assign({}, p, { dt, dp, hop, T: p.N * hop, bdp: p.R * dp });
  }
  /* State of link i (0-based) at time t: link i starts when node i has the whole packet, t = i·(L/R + d/s). */
  function linkState(p, i, t) {
    const tau = t - i * p.hop;
    return {
      tau,
      lead: clamp(p.s * tau, 0, p.d),            // leading edge (first bit), metres from the link's sender
      trail: clamp(p.s * (tau - p.dt), 0, p.d),  // trailing edge (last bit) leaves the sender at L/R
      sent: clamp(tau / p.dt, 0, 1),
      recv: clamp((tau - p.dp) / p.dt, 0, 1),
    };
  }
  function nodeName(p, j) { return j === 0 ? 'the source' : j === p.N ? 'the destination' : `router ${j}`; }
  function events(p) {
    const ev = [];
    for (let i = 0; i < p.N; i++) {
      const b = i * p.hop;
      ev.push({ t: b, what: i === 0 ? 'The source starts transmitting onto link 1.' : `Router ${i} has the whole packet and starts transmitting onto link ${i + 1}.` });
      ev.push({ t: b + p.dp, what: `First bit reaches ${nodeName(p, i + 1)}.` });
      ev.push({ t: b + p.dt, what: `Last bit leaves ${nodeName(p, i)}.` });
      ev.push({ t: b + p.hop, what: `Last bit reaches ${nodeName(p, i + 1)}.` });
    }
    ev.sort((a, b) => a.t - b.t);
    const out = [];
    const eps = 1e-9 * p.T;
    ev.forEach(e => {
      const last = out[out.length - 1];
      if (last && Math.abs(last.t - e.t) <= eps) last.what += ' ' + e.what;
      else out.push({ t: e.t, what: e.what });
    });
    return out;
  }
  function statusAt(p, t) {
    if (t >= p.T * (1 - 1e-9)) return `Delivered: the last bit reached the destination at t = ${ft(p.T)} = N(d_{trans} + d_{prop}).`;
    const i = Math.min(p.N - 1, Math.floor(t / p.hop));
    const st = linkState(p, i, t);
    const from = nodeName(p, i), to = nodeName(p, i + 1);
    const Cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    const a = st.sent < 1
      ? `${Cap(from)} has pushed ${pct(st.sent)} of the packet onto link ${i + 1} (done at t = ${ft(i * p.hop + p.dt)})`
      : `${Cap(from)} finished transmitting at t = ${ft(i * p.hop + p.dt)}`;
    const b = st.tau < p.dp
      ? `the first bit is ${fd(st.lead)} along the ${fd(p.d)} link (reaches ${to} at t = ${ft(i * p.hop + p.dp)})`
      : `${to} has received ${pct(st.recv)} of the packet`;
    const onWire = p.R * (st.lead - st.trail) / p.s;
    return `${a}; ${b}. Bits on link ${i + 1} right now: ${num(Math.round(onWire))}.`;
  }

  /* ---------- challenge question generators ---------- */
  function makeGenerators(kit) {
    const P = kit.pick, rint = kit.rand;
    const S25 = 2.5e8;
    /* time answer in a readable unit; traps are given in seconds and converted */
    function timeQ(sec, o) {
      const [unit, f] = timeUnit(sec);
      return { kind: 'num', unit, answer: sec / f, traps: (o.traps || []).map(tr => ({ v: tr.v / f, m: tr.m })) };
    }
    const PROP_SETS = [
      { s: 2e8, km: [100, 200, 400, 1000, 2000, 4000, 10000] },
      { s: 2.5e8, km: [250, 500, 1000, 2500, 5000, 10000, 20000] },
      { s: 3e8, km: [300, 600, 1500, 3000, 6000, 9000, 36000] },
    ];
    function intensityScenario(I) {
      for (let tries = 0; tries < 200; tries++) {
        const L = P([1000, 2000, 5000, 8000, 10000]);
        const R = P([1e6, 2e6, 10e6]);
        const a = I * R / L;
        if (Number.isInteger(Math.round(a * 1e9) / 1e9) && a >= 1) return { L, R, a: Math.round(a) };
      }
      return { L: 1000, R: 1e6, a: Math.round(I * 1000) };
    }
    function intensityWhy(I) {
      if (I > 1) return 'La/R > 1: bits arrive faster than the link can send them, so the queue grows without bound and queuing delay approaches infinity. Design rule: keep traffic intensity no greater than 1.';
      if (I >= 0.85) return 'La/R < 1 but close to 1: the queue is bounded on average, yet with random arrivals the average queuing delay grows steeply as La/R approaches 1.';
      return 'La/R is small: arrivals are few and far between, so an arriving packet rarely finds a queue and the average queuing delay is close to zero.';
    }

    const gens = {
      trans_bits() {
        const L = P([1000, 2000, 4000, 8000, 10000, 12000, 20000, 100000, 1e6]);
        const R = P([1e6, 2e6, 5e6, 10e6, 100e6, 1e9]);
        const sec = L / R;
        const q = timeQ(sec, {});
        q.prompt = `A packet of **${num(L)} bits** is pushed onto a **${fr(R)}** link. What is its transmission delay, in ${q.unit}?`;
        q.work = `d_{trans} = L/R = ${num(L)} bits ÷ (${rsi(R)} bits/s) = **${ft(sec)}**.`;
        return q;
      },
      trans_bytes() {
        const Lb = P([500, 1000, 1250, 1500, 2000, 4000, 5000]);
        const R = P([1e6, 2e6, 2.5e6, 5e6, 10e6, 100e6]);
        const L = Lb * 8, sec = L / R;
        const q = timeQ(sec, { traps: [{ v: Lb / R, m: 'That is L/R with L still in bytes: multiply bytes by 8 first.' }] });
        q.prompt = `A **${num(Lb)}-byte** packet is sent on a **${fr(R)}** link. What is its transmission delay, in ${q.unit}?`;
        q.work = `L = ${num(Lb)} bytes × 8 = ${num(L)} bits, so d_{trans} = L/R = ${num(L)} bits ÷ (${rsi(R)} bits/s) = **${ft(sec)}**.`;
        return q;
      },
      prop() {
        const set = P(PROP_SETS), km = P(set.km), d = km * 1000, sec = d / set.s;
        const q = timeQ(sec, {});
        q.prompt = `A link is **${num(km)} km** long and signals propagate at **${num(set.s)} m/s**. What is the propagation delay, in ${q.unit}?`;
        q.work = `d_{prop} = d/s = ${num(d)} m ÷ (${num(set.s)} m/s) = **${ft(sec)}**. It depends only on distance and propagation speed, not on packet length or link rate.`;
        return q;
      },
      prop_distract() { // R18
        let Lb, R, km, tries = 0;
        do { Lb = P([1000, 1500]); R = P([1e6, 2e6, 10e6]); km = P([1000, 2500, 5000, 10000]); tries++; }
        while (tries < 50 && Math.abs(Lb * 8 / R - km * 1000 / S25) < 1e-12); // keep L/R different from d/s
        const d = km * 1000, dp = d / S25, dt = Lb * 8 / R;
        const q = timeQ(dp, { traps: [{ v: dt + dp, m: 'That adds the transmission delay L/R; propagating over the link takes only d/s.' }, { v: dt, m: 'That is the transmission delay L/R, not the propagation delay.' }] });
        q.prompt = `A **${num(Lb)}-byte** packet is sent over a **${num(km)} km** link with **R = ${fr(R)}** and **s = 2.5 × 10^{8} m/s**. How long does it take a bit to propagate from one end of the link to the other, in ${q.unit}?`;
        q.work = `Propagation delay does not depend on L or R: d_{prop} = d/s = ${num(d)} m ÷ (2.5 × 10^{8} m/s) = **${ft(dp)}**. (L/R = ${ft(dt)} is the separate transmission delay.)`;
        return q;
      },
      race() { // R17 / P6 e-f
        const Lb = P([500, 1000, 1500, 2000]), R = P([1e6, 2e6, 10e6, 100e6]), s = P([2e8, S25]);
        const L = Lb * 8, dt = L / R, x = s * dt;
        const equal = Math.random() < 0.15;
        const d = equal ? x : x * P([0.1, 0.2, 0.25, 0.4, 2.5, 4, 5, 10]);
        const dp = d / s;
        const correct = equal ? 2 : (dt < dp ? 0 : 1);
        const why = correct === 0
          ? `Since d_{trans} < d_{prop}, the last bit leaves A at t = ${ft(dt)}, before the first bit reaches B at t = ${ft(dp)}: the whole packet is on the wire at once.`
          : correct === 1
            ? `Since d_{trans} > d_{prop}, the first bit reaches B at t = ${ft(dp)} while A is still transmitting (until t = ${ft(dt)}).`
            : `d_{trans} = d_{prop}, so the last bit leaves A at exactly the moment the first bit arrives at B.`;
        return {
          kind: 'choice',
          prompt: `Host A starts sending a **${num(Lb)}-byte** packet at t = 0 over a **${fr(R)}** link that is **${fd(d)}** long (s = ${num(s)} m/s). Which happens first?`,
          options: ['A finishes transmitting the last bit', 'The first bit reaches B', 'Both happen at the same instant'],
          correct,
          work: `d_{trans} = L/R = ${num(L)} bits ÷ (${rsi(R)} bits/s) = ${ft(dt)}; d_{prop} = d/s = ${num(d)} m ÷ (${num(s)} m/s) = ${ft(dp)}. ${why}`,
        };
      },
      edge_pos() { // P6e
        const Lb = P([1000, 1500, 2000]), R = P([1e6, 2e6, 10e6]), s = P([2e8, S25]);
        const L = Lb * 8, dt = L / R, x = s * dt, d = x * P([2, 2.5, 4, 5, 10]), dp = d / s;
        return {
          kind: 'num', unit: 'km', answer: x / 1000,
          traps: [{ v: d / 1000, m: 'The first bit has not reached B yet, because d_{prop} > d_{trans}.' }],
          prompt: `Host A starts sending a **${num(Lb)}-byte** packet at t = 0 on a **${fr(R)}** link to B, **${fd(d)}** away (s = ${num(s)} m/s). At t = d_{trans}, when A has just finished transmitting, how far from A is the **first** bit, in km?`,
          work: `d_{trans} = L/R = ${num(L)} bits ÷ (${rsi(R)} bits/s) = ${ft(dt)}. The first bit has been travelling at s for that long: s·d_{trans} = ${num(s)} m/s × ${ft(dt)} = **${num(x / 1000)} km**. That is short of B because d_{prop} = ${ft(dp)} > d_{trans}.`,
        };
      },
      equal_distance() { // P6g
        const Lb = P([1000, 1500, 2000]), R = P([1e6, 2e6, 10e6, 100e6]), s = P([2e8, S25]);
        const L = Lb * 8, dt = L / R, x = s * dt;
        return {
          kind: 'num', unit: 'km', answer: x / 1000,
          prompt: `With s = ${num(s)} m/s, L = ${num(Lb)} bytes and R = ${fr(R)}, for what link length does d_{prop} equal d_{trans}? Answer in km.`,
          work: `Set d/s = L/R, so d = s·L/R = ${num(s)} m/s × (${num(L)} bits ÷ ${rsi(R)} bits/s) = ${num(s)} × ${ft(dt)} = **${num(x / 1000)} km**.`,
        };
      },
      bdp() { // P25a
        const km = P([1000, 2500, 5000, 10000, 20000]), R = P([1e6, 2e6, 5e6, 10e6]);
        const d = km * 1000, dp = d / S25, b = R * dp;
        return {
          kind: 'num', unit: 'bits', answer: b, hint: 'Large numbers can be typed as 1.6e5.',
          prompt: `Hosts A and B are **${num(km)} km** apart on one direct link with **R = ${fr(R)}** and s = 2.5 × 10^{8} m/s. What is the bandwidth-delay product R·d_{prop}, in bits?`,
          work: `d_{prop} = d/s = ${num(d)} m ÷ (2.5 × 10^{8} m/s) = ${ft(dp)}. R·d_{prop} = ${rsi(R)} bits/s × ${ft(dp)} = **${num(b)} bits**: the most bits that can be on the link at any instant.`,
        };
      },
      bdp_width() { // P25d-e
        const km = P([1000, 5000, 20000]), R = P([1e6, 2e6, 5e6, 10e6, 100e6]);
        const w = S25 / R;
        return {
          kind: 'num', unit: 'm', answer: w,
          prompt: `On a **${num(km)} km** link with **R = ${fr(R)}** and s = 2.5 × 10^{8} m/s, what is the width of one bit along the link, in metres?`,
          work: `Width = link length ÷ bits on the link = d ÷ (R·d/s) = s/R = 2.5 × 10^{8} m/s ÷ (${rsi(R)} bits/s) = **${num(w)} m**. It does not depend on the link length.`,
        };
      },
      e2e_equal() {
        const N = rint(2, 4), Lb = P([1000, 1500, 2000]), R = P([1e6, 2e6, 2.5e6, 10e6]), km = P([500, 1000, 2000, 2500, 5000]);
        const dt = Lb * 8 / R, dp = km * 1000 / S25, hop = dt + dp, tot = N * hop;
        const q = timeQ(tot, { traps: [
          { v: (N - 1) * hop, m: `You counted routers instead of links: ${N - 1} router${N - 1 > 1 ? 's' : ''} means N = ${N} links.` },
          { v: N * dt + dp, m: 'The packet propagates over every link: add d_{prop} N times.' },
          { v: dt + N * dp, m: 'Store-and-forward: each router receives the whole packet before sending it on, so L/R is paid on every link.' },
          { v: hop, m: 'That is a single link; multiply by the number of links N.' },
        ] });
        q.prompt = `A **${num(Lb)}-byte** packet goes from A to B through **${N - 1} store-and-forward router${N - 1 > 1 ? 's' : ''}**. Every link is ${fr(R)} and ${num(km)} km long (s = 2.5 × 10^{8} m/s). Ignoring processing and queuing, what is the end-to-end delay, in ${q.unit}?`;
        q.work = `${N - 1} router${N - 1 > 1 ? 's' : ''} means N = ${N} links. Each link costs d_{trans} + d_{prop} = ${ft(dt)} + ${ft(dp)} = ${ft(hop)}, so d_{end-end} = N(L/R + d_{prop}) = ${N} × ${ft(hop)} = **${ft(tot)}**.`;
        return q;
      },
      e2e_noprop() { // eq. 1.1
        const N = rint(2, 5), L = P([8000, 10000, 12000, 20000]), R = P([1e6, 2e6, 5e6, 10e6]);
        const dt = L / R, tot = N * dt;
        const q = timeQ(tot, { traps: [{ v: dt, m: 'Each router must receive the entire packet before forwarding it, so L/R is paid on all N links: N·L/R.' }, { v: (N - 1) * dt, m: 'N links (N − 1 routers) means N transmissions: N·L/R.' }] });
        q.prompt = `A **${num(L)}-bit** packet crosses **${N} links** (${N - 1} store-and-forward router${N - 1 > 1 ? 's' : ''}), each ${fr(R)}. Ignore propagation, processing and queuing. What is the end-to-end delay, in ${q.unit}?`;
        q.work = `d_{end-end} = N·L/R = ${N} × (${num(L)} bits ÷ ${rsi(R)} bits/s) = ${N} × ${ft(dt)} = **${ft(tot)}**.`;
        return q;
      },
      e2e_unequal() {
        const L = P([8000, 10000, 20000, 40000]);
        const rates = kit.shuffle([1e6, 2e6, 4e6, 5e6, 10e6]).slice(0, 3);
        const parts = rates.map(r => L / r), tot = parts.reduce((a, b) => a + b, 0), rmin = Math.min(...rates);
        const q = timeQ(tot, { traps: [
          { v: L / rmin, m: 'That is only the slowest link. Store-and-forward pays L/R_{i} on every link.' },
          { v: 3 * L / rmin, m: 'Each link transmits at its own rate: add L/R_{1} + L/R_{2} + L/R_{3}.' },
        ] });
        q.prompt = `A **${num(L)}-bit** packet crosses three store-and-forward links of **${rates.map(fr).join('**, **')}** in that order. Ignore propagation, processing and queuing. What is the end-to-end delay, in ${q.unit}?`;
        q.work = `Each link transmits the whole packet at its own rate: L/R_{1} + L/R_{2} + L/R_{3} = ${parts.map(x => ft(x)).join(' + ')} = **${ft(tot)}**.`;
        return q;
      },
      e2e_proc() { // P10
        const combo = P([[1500, 2.5e6], [1000, 2e6], [2000, 10e6], [1250, 1e6]]);
        const Lb = combo[0], R = combo[1];
        const kms = [rint(1, 5) * 1000, rint(1, 5) * 1000, rint(1, 5) * 1000];
        const proc = P([3, 4, 5]) * 1e-3;
        const dt = Lb * 8 / R, sumkm = kms[0] + kms[1] + kms[2], dps = sumkm * 1000 / S25;
        const tot = 3 * dt + dps + 2 * proc;
        const q = timeQ(tot, { traps: [
          { v: 3 * dt + dps + 3 * proc, m: 'Three links have two packet switches between them, so add d_{proc} twice.' },
          { v: 3 * dt + dps, m: 'Add the processing delay at each of the two switches.' },
          { v: dt + dps + 2 * proc, m: 'Store-and-forward: L/R is paid on each of the three links.' },
        ] });
        q.prompt = `A **${num(Lb)}-byte** packet crosses three links joined by two packet switches. All links are **${fr(R)}** with s = 2.5 × 10^{8} m/s, and their lengths are **${kms.map(k => num(k)).join(' km, ')} km**. Each switch adds **d_{proc} = ${num(proc * 1e3)} ms**; there is no queuing. What is the end-to-end delay, in ${q.unit}?`;
        q.work = `Transmission: 3 × L/R = 3 × ${ft(dt)} = ${ft(3 * dt)}. Propagation: (d_{1} + d_{2} + d_{3})/s = ${num(sumkm * 1000)} m ÷ (2.5 × 10^{8} m/s) = ${ft(dps)}. Processing: 2 × ${ft(proc)} = ${ft(2 * proc)}. Total = **${ft(tot)}**.`;
        return q;
      },
      intensity_num() {
        const I = P([0.25, 0.4, 0.5, 0.6, 0.75, 0.8, 0.9, 1.2, 1.25, 1.5, 2]);
        const sc = intensityScenario(I);
        return {
          kind: 'num', unit: '(ratio)', answer: sc.L * sc.a / sc.R,
          prompt: `Packets of **${num(sc.L)} bits** arrive at a router's output queue at an average of **a = ${num(sc.a)} packets/s**; the outgoing link is **${fr(sc.R)}**. What is the traffic intensity La/R?`,
          work: `La/R = ${num(sc.L)} × ${num(sc.a)} ÷ (${rsi(sc.R)}) = ${num(sc.L * sc.a)} ÷ ${num(sc.R)} = **${num(sc.L * sc.a / sc.R)}**. ${intensityWhy(sc.L * sc.a / sc.R)}`,
        };
      },
      intensity_choice() {
        const band = rint(0, 2);
        const I = band === 0 ? P([1.2, 1.5, 2]) : band === 1 ? P([0.9, 0.95]) : P([0.1, 0.2, 0.25]);
        const sc = intensityScenario(I);
        const Ireal = sc.L * sc.a / sc.R;
        const correct = Ireal > 1 ? 0 : Ireal >= 0.85 ? 1 : 2;
        return {
          kind: 'choice',
          prompt: `Packets of **${num(sc.L)} bits** arrive at random at **${num(sc.a)} packets/s** to a **${fr(sc.R)}** link with a very large buffer. Which describes the queue?`,
          options: [
            'It grows without bound: bits arrive faster than the link can send them',
            'It stays bounded, but La/R is close to 1, so the average queuing delay is large',
            'It stays bounded and La/R is small, so the average queuing delay is small',
          ],
          correct,
          work: `La/R = ${num(sc.L)} × ${num(sc.a)} ÷ (${rsi(sc.R)}) = **${num(Ireal)}**. ${intensityWhy(Ireal)}`,
        };
      },
      queue_avg() { // P13a
        const N = rint(3, 10), combo = P([[1000, 1e6], [1250, 1e6], [1500, 2.5e6], [1000, 2e6], [1500, 10e6], [1250, 10e6]]);
        const Lb = combo[0], R = combo[1], dt = Lb * 8 / R, avg = (N - 1) * dt / 2;
        const q = timeQ(avg, { traps: [
          { v: (N - 1) * dt, m: 'That is the wait of the last packet only. Average over all N packets: (N − 1)L/(2R).' },
          { v: N * dt / 2, m: 'The first packet waits 0, the nth waits (n − 1)L/R; the average is (N − 1)L/(2R), not NL/(2R).' },
          { v: (N - 1) * (Lb / R) / 2, m: 'L was still in bytes: multiply by 8 first.' },
        ] });
        q.prompt = `**${N} packets** of ${num(Lb)} bytes arrive **simultaneously** at an empty output link of **${fr(R)}**. What is their **average** queuing delay, in ${q.unit}?`;
        q.work = `L/R = ${num(Lb * 8)} bits ÷ (${rsi(R)} bits/s) = ${ft(dt)}. The nth packet sent waits (n − 1)L/R, so the average is (L/R)(0 + 1 + … + (N − 1))/N = (N − 1)L/(2R) = ${N - 1} × ${ft(dt)} ÷ 2 = **${ft(avg)}**.`;
        return q;
      },
      seg_total() { // P31 b-c
        const sc = segScenario();
        const q = timeQ(sc.seg, { traps: [
          { v: sc.whole, m: 'That is the time without segmentation, N·M/R.' },
          { v: sc.N * sc.P * sc.dt, m: 'Packets overlap on different links. It is (N + P − 1)·L/R, not N·P·L/R.' },
          { v: sc.P * sc.dt, m: 'After the source finishes, the last packet still has N − 1 more links to cross: (N + P − 1)·L/R.' },
        ] });
        q.prompt = `A **${num(sc.M)}-bit** message crosses **${sc.N} links** (${sc.N - 1} store-and-forward packet switch${sc.N - 1 > 1 ? 'es' : ''}), each **${fr(sc.R)}**; ignore propagation, queuing and processing. It is split into **${sc.P} packets** of ${num(sc.L)} bits. How long until the destination has the whole message, in ${q.unit}?`;
        q.work = `Each packet takes L/R = ${num(sc.L)} bits ÷ (${rsi(sc.R)} bits/s) = ${ft(sc.dt)} per link. The first packet arrives after N·L/R, then one more arrives every L/R: (N + P − 1)·L/R = (${sc.N} + ${sc.P} − 1) × ${ft(sc.dt)} = **${ft(sc.seg)}**.`;
        q.tol = 0.005; // (N + P − 1) vs P differ by only (N − 1)/P, so check tightly (answers are exact)
        return q;
      },
      seg_compare() {
        const sc = segScenario();
        const save = sc.whole - sc.seg;
        const q = timeQ(save, { traps: [{ v: sc.seg, m: 'That is the segmented delivery time itself; subtract it from N·M/R.' }, { v: sc.whole, m: 'That is the unsegmented time; subtract the segmented time (N + P − 1)·L/R.' }] });
        q.prompt = `A **${num(sc.M)}-bit** message crosses **${sc.N} store-and-forward links** of **${fr(sc.R)}** each (ignore propagation, queuing and processing). How much sooner does it arrive if it is split into **${sc.P} packets** of ${num(sc.L)} bits instead of being sent whole? Answer in ${q.unit}.`;
        q.work = `Whole message: N·M/R = ${sc.N} × ${ft(sc.M / sc.R)} = ${ft(sc.whole)}. Segmented: (N + P − 1)·L/R = ${sc.N + sc.P - 1} × ${ft(sc.dt)} = ${ft(sc.seg)}. Saving = **${ft(save)}**: with packets, all the links work at the same time.`;
        return q;
      },
      tput_min() {
        const [Rs, Rc] = kit.shuffle([500e3, 1e6, 2e6, 5e6, 10e6, 20e6, 100e6]).slice(0, 2);
        const m = Math.min(Rs, Rc), unit = m < 1e6 ? 'kbps' : 'Mbps', f = unit === 'kbps' ? 1e3 : 1e6;
        return {
          kind: 'num', unit, answer: m / f, traps: [{ v: Math.max(Rs, Rc) / f, m: 'Throughput is limited by the slowest link on the path: take the minimum.' }],
          prompt: `A server with a **${fr(Rs)}** access link sends a large file to a client whose access link is **${fr(Rc)}**. The core is much faster and carries no other traffic. What is the end-to-end throughput, in ${unit}?`,
          work: `Throughput = min{R_{s}, R_{c}} = min{${fr(Rs)}, ${fr(Rc)}} = **${fr(m)}**. The bottleneck link sets the rate.`,
        };
      },
      tput_file() { // R19
        const rates = kit.shuffle([100e3, 500e3, 1e6, 2e6, 4e6]).slice(0, 3);
        const Fb = P([1e6, 2e6, 4e6, 5e6]);
        const m = Math.min(...rates), sec = Fb * 8 / m;
        return {
          kind: 'num', unit: 's', answer: sec,
          traps: [{ v: Fb / m, m: 'Convert the file size to bits first (× 8).' }, { v: Fb * 8 / Math.max(...rates), m: 'Use the bottleneck (smallest) rate.' }],
          prompt: `The path from A to B has three links: **R_{1} = ${fr(rates[0])}**, **R_{2} = ${fr(rates[1])}**, **R_{3} = ${fr(rates[2])}**. With no other traffic, roughly how long does a **${num(Fb)}-byte** file take (file size ÷ throughput), in seconds?`,
          work: `Throughput = min{R_{1}, R_{2}, R_{3}} = ${fr(m)}. Time ≈ F/throughput = ${num(Fb)} × 8 bits ÷ (${rsi(m)} bits/s) = **${num(sec)} s**.`,
        };
      },
      tput_shared() { // Fig 1.20(b)
        let Rs, Rc, R, M, m, tries = 0;
        const wantShared = Math.random() < 0.65;
        do {
          M = P([4, 5, 8, 10, 20]); R = P([5e6, 10e6, 20e6, 40e6]);
          Rs = P([1e6, 2e6, 5e6, 10e6]); Rc = P([500e3, 1e6, 2e6, 4e6]);
          m = Math.min(Rs, Rc, R / M);
          tries++;
        } while (tries < 100 && ((wantShared ? R / M !== m : R / M === m) || Rs === Rc || R / M === Rs || R / M === Rc));
        const unit = m < 1e6 ? 'kbps' : 'Mbps', f = unit === 'kbps' ? 1e3 : 1e6;
        return {
          kind: 'num', unit, answer: m / f,
          traps: [{ v: Math.min(Rs, Rc) / f, m: 'The shared core link gives each download only R/M; include it in the minimum.' }, { v: R / f, m: 'The core link is split equally among the downloads: R/M each.' }],
          prompt: `**${M} servers** each send a file to their own client at the same time. Every server access link is **R_{s} = ${fr(Rs)}**, every client access link is **R_{c} = ${fr(Rc)}**, and all ${M} downloads cross one core link of **R = ${fr(R)}** that is shared equally; other core links are very fast. What is each download's throughput, in ${unit}?`,
          work: `Each download gets R/M = ${fr(R)} ÷ ${M} = ${fr(R / M)} of the shared link, so throughput = min{R_{s}, R_{c}, R/M} = min{${fr(Rs)}, ${fr(Rc)}, ${fr(R / M)}} = **${fr(m)}**.`,
        };
      },
    };
    /* drop "common mistake" values that fall within the tolerance of the true answer */
    Object.keys(gens).forEach(k => {
      const g = gens[k];
      gens[k] = () => {
        const q = g();
        if (q.traps) q.traps = q.traps.filter(tr => Math.abs(tr.v - q.answer) > (q.tol || 0.02) * Math.abs(q.answer) * 1.5);
        return q;
      };
    });
    return gens;

    function segScenario() {
      for (let tries = 0; tries < 200; tries++) {
        const M = P([1e6, 2e6, 4e6, 8e6]), Pk = P([10, 20, 50, 100]), R = P([1e6, 2e6, 5e6, 10e6]), N = rint(2, 4);
        const L = M / Pk;
        if (!Number.isInteger(L)) continue;
        const dt = L / R;
        return { M, P: Pk, R, N, L, dt, seg: (N + Pk - 1) * dt, whole: N * M / R };
      }
      return { M: 1e6, P: 100, R: 5e6, N: 3, L: 1e4, dt: 2e-3, seg: 102 * 2e-3, whole: 0.6 };
    }
  }

  const POOLS = [
    ['trans_bits', 'prop'],
    ['trans_bytes', 'prop', 'trans_bits'],
    ['prop_distract', 'race', 'bdp'],
    ['edge_pos', 'race', 'equal_distance', 'bdp'],
    ['e2e_equal', 'e2e_noprop'],
    ['e2e_unequal', 'e2e_proc', 'e2e_equal'],
    ['intensity_num', 'intensity_choice', 'queue_avg'],
    ['seg_total', 'queue_avg', 'tput_min', 'tput_file'],
    ['tput_shared', 'seg_compare', 'tput_file', 'e2e_proc'],
    ['seg_compare', 'tput_shared', 'bdp_width', 'intensity_choice', 'e2e_proc'],
  ];

  /* ---------- sandbox value ladders ---------- */
  const L_VALUES = [40, 100, 500, 1000, 1500, 2000, 5000, 10000, 12000, 50000, 100000, 1000000];
  const R_VALUES = [56e3, 1e5, 1e6, 2e6, 10e6, 100e6, 1e9, 10e9];
  const D_VALUES = [10, 100, 1e3, 1e4, 1e5, 5e5, 1e6, 2.5e6, 5e6, 1e7, 2e7, 3.6e7];
  const S_VALUES = [2e8, 2.5e8, 3e8];

  const CSS = `
.gm-delay .gm-controls { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px 20px; margin-bottom: 14px; }
.gm-delay .gm-ctl output { font-family: var(--font-mono); font-weight: 600; color: var(--ink); font-size: 0.95rem; }
.gm-delay .gm-ctl .g-row { gap: 6px; }
.gm-delay input[type="range"] { width: 100%; accent-color: var(--u1); margin: 2px 0 0; }
.gm-delay .gm-unitchips .chip { padding: 2px 10px; font-size: 0.82rem; }
.gm-delay svg text { font-family: var(--font-text); fill: var(--ink); font-size: 13px; }
.gm-delay svg .t-small { font-size: 11px; fill: var(--ink-2); }
.gm-delay svg .t-big { font-family: var(--font-display); font-size: 22px; font-weight: 700; }
.gm-delay svg .t-node { font-weight: 700; font-size: 12px; }
.gm-delay .gm-case { margin-bottom: 12px; }
.gm-delay .gm-case .g-tag { margin-right: 8px; }
.gm-delay .gm-status { min-height: 2.6em; color: var(--ink-2); font-size: 0.95rem; margin: 0 0 8px; }
.gm-delay .gm-scrub { flex: 1 1 200px; min-width: 160px; }
.gm-delay .gm-tablewrap { overflow-x: auto; margin-top: 14px; }
.gm-delay table.data td.gm-val { font-family: var(--font-mono); white-space: nowrap; font-weight: 700; }
.gm-delay table.data td.gm-formula { color: var(--ink-2); font-size: 0.9rem; }
.gm-delay .gm-unit { font-family: var(--font-mono); color: var(--ink-2); }
.gm-delay .gm-qopts { grid-template-columns: 1fr; }
@media (max-width: 560px) { .gm-delay table.data th, .gm-delay table.data td { padding: 6px 8px; } }
`;
  function injectCss() {
    if (document.getElementById('gm-delay-css')) return;
    const s = document.createElement('style');
    s.id = 'gm-delay-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  NET.addGame({
    id: 'delaylab',
    title: 'Delay lab',
    unit: 1,
    sections: ['delay', 'switching', 'edge'],
    blurb: 'Watch a packet’s first and last bits cross store-and-forward links, then solve ten delay, queuing and throughput problems.',
    how: [
      '**Watch the wire**: set L, R, d, s and the number of links, then play or scrub through time. The readouts show every formula with your numbers.',
      '**Challenge**: 10 rounds that ramp from L/R and d/s to store-and-forward, message segmentation, traffic intensity and throughput. Answers within 2% count.',
      'Keyboard: arrow keys move a focused slider; Enter checks an answer and moves to the next round; 1–3 pick an option.',
    ],
    mount(root, kit) {
      injectCss();
      const el = kit.el;
      const wrap = el('div', { class: 'gm-delay' });
      root.appendChild(wrap);

      let teardown = null;
      let keyAct = null; // current key handler for the active mode

      kit.onKey(e => { if (keyAct) keyAct(e); });

      const chips = el('div', { class: 'g-modes', role: 'group', 'aria-label': 'Mode' });
      const chipWire = el('button', { class: 'chip u1', type: 'button', 'aria-pressed': 'true', onclick: () => setMode('wire') }, 'Watch the wire');
      const chipChal = el('button', { class: 'chip u1', type: 'button', 'aria-pressed': 'false', onclick: () => setMode('challenge') }, 'Challenge');
      chips.append(chipWire, chipChal);
      const body = el('div');
      wrap.append(chips, body);

      function setMode(m) {
        if (teardown) { teardown(); teardown = null; }
        keyAct = null;

        chipWire.setAttribute('aria-pressed', String(m === 'wire'));
        chipChal.setAttribute('aria-pressed', String(m === 'challenge'));
        body.innerHTML = '';
        teardown = m === 'wire' ? mountWire(body) : mountChallenge(body);
      }

      /* ================= Watch the wire ================= */
      function mountWire(host) {
        const st = { li: 4, bytes: true, ri: 4, di: 6, si: 1, N: 2 };
        let p = null, t = 0, playing = false, stopLoop = null, ev = [], dyn = null;

        const controls = el('div', { class: 'gm-controls' });
        function slider(label, values, key, fmtv) {
          const out = el('output');
          const input = el('input', { type: 'range', min: 0, max: values.length - 1, step: 1, value: st[key], 'aria-label': label });
          const show = () => { out.textContent = fmtv(values[st[key]]); input.setAttribute('aria-valuetext', out.textContent); };
          input.addEventListener('input', () => { st[key] = +input.value; show(); rebuild(); });
          show();
          const lab = el('label', { class: 'g-label gm-ctl' }, el('span', null, label + ': ', out), input);
          return { node: lab, show };
        }
        const unitTxt = () => (st.bytes ? 'bytes' : 'bits');
        const sL = slider('Packet length L', L_VALUES, 'li', v => `${num(v)} ${unitTxt()}${st.bytes ? ` (${num(v * 8)} bits)` : ''}`);
        const bBits = el('button', { class: 'chip', type: 'button', 'aria-pressed': 'false', onclick: () => setUnit(false) }, 'bits');
        const bBytes = el('button', { class: 'chip', type: 'button', 'aria-pressed': 'true', onclick: () => setUnit(true) }, 'bytes');
        function setUnit(b) { st.bytes = b; bBits.setAttribute('aria-pressed', String(!b)); bBytes.setAttribute('aria-pressed', String(b)); sL.show(); rebuild(); }
        const lWrap = el('div', null, sL.node, el('div', { class: 'chip-row gm-unitchips', role: 'group', 'aria-label': 'Unit of L', style: { marginTop: '4px' } }, bBits, bBytes));
        const sR = slider('Link rate R', R_VALUES, 'ri', v => fr(v));
        const sD = slider('Link length d (each link)', D_VALUES, 'di', v => fd(v, true));
        const sS = slider('Propagation speed s', S_VALUES, 'si', v => `${num(v, 4, true)} m/s`);
        const nOut = el('output');
        const nIn = el('input', { type: 'range', min: 1, max: 4, step: 1, value: st.N, 'aria-label': 'Number of links N' });
        const showN = () => { nOut.textContent = `${st.N} (${st.N - 1} router${st.N - 1 === 1 ? '' : 's'})`; nIn.setAttribute('aria-valuetext', nOut.textContent); };
        nIn.addEventListener('input', () => { st.N = +nIn.value; showN(); rebuild(); });
        showN();
        const sN = el('label', { class: 'g-label gm-ctl' }, el('span', null, 'Links N: ', nOut), nIn);
        controls.append(lWrap, sR.node, sD.node, sS.node, sN);

        const caseBox = el('div', { class: 'g-card gm-case', 'aria-live': 'polite' });
        const canvas = el('div', { class: 'g-canvas' });
        const status = el('p', { class: 'gm-status', 'aria-live': 'polite' });
        const playBtn = el('button', { class: 'btn small', type: 'button', onclick: () => (playing ? pause() : play()) }, 'Play');
        const nextBtn = el('button', { class: 'btn secondary small', type: 'button', onclick: stepEvent }, 'Next event');
        const resetBtn = el('button', { class: 'btn ghost small', type: 'button', onclick: () => { pause(); t = 0; render(); } }, 'Reset');
        const scrub = el('input', { type: 'range', min: 0, max: 1000, step: 1, value: 0, class: 'gm-scrub', 'aria-label': 'Time' });
        scrub.addEventListener('input', () => { pause(); t = p.T * (+scrub.value) / 1000; render(true); });
        const transport = el('div', { class: 'g-row', style: { marginBottom: '6px' } });
        if (!kit.reducedMotion) transport.appendChild(playBtn);
        transport.append(nextBtn, resetBtn, scrub);
        const table = el('div', { class: 'gm-tablewrap' });
        host.append(controls, caseBox, canvas, transport, status, table);

        function params() {
          return derive({ Lbits: L_VALUES[st.li] * (st.bytes ? 8 : 1), R: R_VALUES[st.ri], d: D_VALUES[st.di], s: S_VALUES[st.si], N: st.N });
        }

        function rebuild() {
          pause();
          p = params();
          ev = events(p);
          t = 0;
          buildSvg();
          renderCase();
          renderTable();
          render();
        }

        function renderCase() {
          caseBox.innerHTML = '';
          const rel = Math.abs(p.dt - p.dp) <= 1e-9 * Math.max(p.dt, p.dp);
          let tag, txt;
          if (rel) {
            tag = el('span', { class: 'g-tag' }, 'Equal');
            txt = `d_{trans} = d_{prop} = ${ft(p.dt)}: the last bit leaves the sender at the very moment the first bit reaches the next node.`;
          } else if (p.dt < p.dp) {
            tag = el('span', { class: 'g-tag good' }, 'Sender finishes first');
            txt = `d_{trans} = ${ft(p.dt)} < d_{prop} = ${ft(p.dp)}: the sender pushes out the last bit at t = ${ft(p.dt)}, **before** the first bit reaches the next node at t = ${ft(p.dp)}. The whole packet is on the wire at once (the link could hold R·d_{prop} = ${num(p.bdp)} bits).`;
          } else {
            tag = el('span', { class: 'g-tag bad' }, 'First bit arrives first');
            txt = `d_{trans} = ${ft(p.dt)} > d_{prop} = ${ft(p.dp)}: the first bit reaches the next node at t = ${ft(p.dp)} while the sender is **still transmitting** (until t = ${ft(p.dt)}). At most R·d_{prop} = ${num(p.bdp)} bits are on the link at any instant.`;
          }
          caseBox.append(tag, kit.md('span', null, txt));
        }

        function renderTable() {
          const L = p.Lbits;
          const rows = [
            ['Transmission delay d_{trans}', `L/R = ${num(L)} bits ÷ ${fr(p.R)}`, ft(p.dt)],
            ['Propagation delay d_{prop}', `d/s = ${fd(p.d)} ÷ ${num(p.s)} m/s`, ft(p.dp)],
            [`First bit arrives at ${p.N === 1 ? 'the destination' : 'router 1'}`, 't = d_{prop}', ft(p.dp)],
            [`Last bit arrives at ${p.N === 1 ? 'the destination' : 'router 1'}`, 't = d_{trans} + d_{prop}', ft(p.hop)],
          ];
          if (p.N > 1) rows.push(['First bit arrives at the destination', `(N − 1)(d_{trans} + d_{prop}) + d_{prop}`, ft((p.N - 1) * p.hop + p.dp)]);
          rows.push([`End-to-end delay (N = ${p.N})`, `N(L/R + d_{prop}) = ${p.N} × (${ft(p.dt)} + ${ft(p.dp)})`, ft(p.T)]);
          rows.push(['Bandwidth-delay product', `R·d_{prop} = ${fr(p.R)} × ${ft(p.dp)}; the packet is ${num(L)} bits`, `${num(p.bdp)} bits`]);
          rows.push(['Width of one bit on the wire', 's/R', fd(p.s / p.R)]);
          const tb = el('table', { class: 'data' },
            el('thead', null, el('tr', null, el('th', null, 'Quantity'), el('th', null, 'Formula with your numbers'), el('th', null, 'Value'))),
            el('tbody', null, rows.map(r => el('tr', null, kit.md('td', null, r[0]), kit.md('td', 'gm-formula', r[1]), kit.md('td', 'gm-val', r[2])))));
          table.innerHTML = '';
          table.appendChild(tb);
        }

        function buildSvg() {
          const W = 800, H = 150, NW = 84, NH = 60, y0 = 62;
          const linkLen = (W - 20 - (p.N + 1) * NW) / p.N;
          const S = kit.svg;
          const svg = S('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Packet crossing ${p.N} link${p.N > 1 ? 's' : ''}; see the status line below for the current state.` });
          const timeText = S('text', { x: 10, y: 28, class: 't-big' }, 't = 0');
          svg.appendChild(timeText);
          svg.appendChild(S('text', { x: W - 10, y: 28, 'text-anchor': 'end', class: 't-small' }, `end-to-end ${ft(p.T, true)}`));
          const nodes = [], links = [];
          for (let j = 0; j <= p.N; j++) {
            const x = 10 + j * (NW + linkLen);
            const label = j === 0 ? 'Source' : j === p.N ? 'Destination' : `Router ${j}`;
            svg.appendChild(S('rect', { x, y: y0, width: NW, height: NH, rx: 7, fill: 'var(--surface-2)', stroke: 'var(--rule-strong)' }));
            svg.appendChild(S('text', { x: x + NW / 2, y: y0 + 20, 'text-anchor': 'middle', class: 't-node' }, label));
            svg.appendChild(S('rect', { x: x + 9, y: y0 + NH - 22, width: NW - 18, height: 9, rx: 2, fill: 'var(--surface-3)', stroke: 'var(--rule-strong)', 'stroke-width': 0.5 }));
            const fill = S('rect', { x: x + 9, y: y0 + NH - 22, width: 0, height: 9, rx: 2, fill: 'var(--u1)' });
            svg.appendChild(fill);
            const pctT = S('text', { x: x + NW / 2, y: y0 + NH + 16, 'text-anchor': 'middle', class: 't-small' }, '');
            svg.appendChild(pctT);
            nodes.push({ x, fill, pctT, w: NW - 18 });
          }
          for (let i = 0; i < p.N; i++) {
            const x = 10 + (i + 1) * NW + i * linkLen;
            const wy = y0 + NH / 2 - 7;
            svg.appendChild(S('text', { x: x + linkLen / 2, y: y0 - 14, 'text-anchor': 'middle', class: 't-small' }, `link ${i + 1}`));
            svg.appendChild(S('rect', { x, y: wy, width: linkLen, height: 14, fill: 'var(--surface-3)', stroke: 'var(--rule-strong)', 'stroke-width': 0.75 }));
            const bar = S('rect', { x, y: wy, width: 0, height: 14, fill: 'var(--u1)', visibility: 'hidden' });
            const leadG = S('g', { visibility: 'hidden' },
              S('line', { x1: 0, x2: 0, y1: wy - 9, y2: wy, stroke: 'var(--ink)', 'stroke-width': 1.5 }),
              S('text', { x: 0, y: wy - 12, 'text-anchor': 'middle', class: 't-small' }, 'first bit'));
            const trailG = S('g', { visibility: 'hidden' },
              S('line', { x1: 0, x2: 0, y1: wy + 14, y2: wy + 23, stroke: 'var(--ink)', 'stroke-width': 1.5 }),
              S('text', { x: 0, y: wy + 34, 'text-anchor': 'middle', class: 't-small' }, 'last bit'));
            svg.append(bar, leadG, trailG);
            links.push({ x, len: linkLen, bar, leadG, trailG });
          }
          canvas.innerHTML = '';
          canvas.appendChild(svg);
          dyn = { timeText, nodes, links };
        }

        function render(fromScrub) {
          if (!dyn) return;
          dyn.timeText.textContent = `t = ${ft(t, true)}`;
          const states = [];
          for (let i = 0; i < p.N; i++) {
            const s = linkState(p, i, t);
            states.push(s);
            const L = dyn.links[i];
            const active = s.tau > 0 && s.tau < p.hop && s.lead > s.trail;
            if (active) {
              let w = Math.max(3, (s.lead - s.trail) / p.d * L.len);
              let bx = L.x + s.trail / p.d * L.len;
              if (bx + w > L.x + L.len) bx = L.x + L.len - w;
              L.bar.setAttribute('x', bx); L.bar.setAttribute('width', w); L.bar.setAttribute('visibility', 'visible');
            } else L.bar.setAttribute('visibility', 'hidden');
            const leadOn = s.tau > 0 && s.tau < p.dp;
            L.leadG.setAttribute('visibility', leadOn ? 'visible' : 'hidden');
            if (leadOn) L.leadG.setAttribute('transform', `translate(${L.x + s.lead / p.d * L.len},0)`);
            const trailOn = s.tau > p.dt && s.tau < p.hop;
            L.trailG.setAttribute('visibility', trailOn ? 'visible' : 'hidden');
            if (trailOn) L.trailG.setAttribute('transform', `translate(${L.x + s.trail / p.d * L.len},0)`);
          }
          for (let j = 0; j <= p.N; j++) {
            let f, lbl;
            if (j === 0) { f = 1 - states[0].sent; lbl = `${pct(f)} left to send`; }
            else if (j === p.N) { f = states[p.N - 1].recv; lbl = `${pct(f)} received`; }
            else { f = clamp(states[j - 1].recv - states[j].sent, 0, 1); lbl = `holding ${pct(f)}`; }
            const n = dyn.nodes[j];
            n.fill.setAttribute('width', Math.max(0, f * n.w));
            n.pctT.textContent = lbl;
          }
          if (!fromScrub) scrub.value = Math.round(p.T ? t / p.T * 1000 : 0);
          scrub.setAttribute('aria-valuetext', `t = ${ft(t, true)} of ${ft(p.T, true)}`);
          const evNow = ev.filter(e => e.t <= t * (1 + 1e-9) + 1e-15).pop();
          status.innerHTML = kit.fmt((evNow && t > 0 ? `**Last event (t = ${ft(evNow.t)}):** ${evNow.what} ` : '') + statusAt(p, t));
        }

        function play() {
          if (t >= p.T * (1 - 1e-9)) t = 0;
          playing = true;
          playBtn.textContent = 'Pause';
          const wall = Math.max(4000, 2600 * p.N);
          let last = null;
          stopLoop = kit.frame(ts => {
            if (!playing) return false;
            if (last === null) last = ts;
            const step = (ts - last) / wall * p.T;
            last = ts;
            t = Math.min(p.T, t + step);
            render();
            if (t >= p.T) { pause(); return false; }
            return true;
          });
        }
        function pause() {
          playing = false;
          if (stopLoop) { stopLoop(); stopLoop = null; }
          playBtn.textContent = 'Play';
        }
        function stepEvent() {
          pause();
          const nxt = ev.find(e => e.t > t * (1 + 1e-9) + 1e-15);
          t = nxt ? nxt.t : 0;
          render();
        }

        rebuild();
        keyAct = null;
        return () => pause();
      }

      /* ================= Challenge ================= */
      function mountChallenge(host) {
        const ROUNDS = 10;
        const gens = makeGenerators(kit);
        const used = new Set();
        let round = 0, score = 0;
        const hud = kit.hud([['round', 'Round'], ['score', 'Score'], ['|'], ['best', 'Best']]);
        const area = el('div');
        host.append(hud.node, area);

        function nextRound() {
          if (round >= ROUNDS) return end();
          round++;
          hud.set({ round: `${round}/${ROUNDS}`, score: String(score), best: String(kit.best() || 0) });
          const pool = POOLS[round - 1];
          const fresh = pool.filter(k => !used.has(k));
          const key = kit.pick(fresh.length ? fresh : pool);
          used.add(key);
          show(gens[key]());
        }

        function show(q) {
          area.innerHTML = '';
          area.appendChild(kit.md('p', 'g-prompt', q.prompt));
          if (q.hint) area.appendChild(kit.md('p', 'g-sub', q.hint));
          const fb = el('div', { class: 'g-feedback', 'aria-live': 'polite' });
          const nextBtn = el('button', { class: 'btn', type: 'button', onclick: nextRound, style: { display: 'none' } }, round >= ROUNDS ? 'See results' : 'Next round');
          let answered = false;
          const finishQ = () => { answered = true; nextBtn.style.display = ''; keyAct = e => { if (e.key === 'Enter' && !/^(BUTTON|A)$/.test(e.target.tagName)) { e.preventDefault(); nextRound(); } }; };

          if (q.kind === 'choice') {
            const opts = kit.choices(q.options, i => pick(i), 'g-opts gm-qopts');
            function pick(i) {
              if (answered) return;
              const btns = opts.buttons;
              btns[i].classList.add(i === q.correct ? 'is-right' : 'is-wrong');
              btns[q.correct].classList.add('is-right');
              kit.lock(btns);
              if (i === q.correct) { score++; kit.feedback(fb, 'good', `**Correct.** ${q.work}`); }
              else kit.feedback(fb, 'bad', `**Not quite.** ${q.work}`);
              hud.set({ score: String(score) });
              finishQ();
            }
            opts.buttons.forEach((b, i) => b.insertBefore(el('span', { class: 'g-tag', style: { marginRight: '8px' } }, String(i + 1)), b.firstChild));
            area.append(opts, fb, el('div', { class: 'g-actions' }, nextBtn));
            keyAct = e => { const n = parseInt(e.key, 10); if (n >= 1 && n <= q.options.length) pick(n - 1); };
            return;
          }

          const inp = kit.numInput({ placeholder: 'Your answer', label: `Answer in ${q.unit}` });
          const checkBtn = el('button', { class: 'btn', type: 'button', onclick: check }, 'Check');
          area.append(el('div', { class: 'g-row' }, inp, el('span', { class: 'gm-unit' }, q.unit), checkBtn), fb, el('div', { class: 'g-actions' }, nextBtn));
          function check() {
            if (answered) return;
            const raw = inp.value.trim();
            const v = parseFloat(raw.replace(/,/g, ''));
            if (!raw || !isFinite(v)) { kit.feedback(fb, 'part', 'Type a number first (for example 1.2 or 1.6e5).'); return; }
            const ok = kit.checkNum(raw, q.answer, q.tol);
            inp.readOnly = true;
            checkBtn.disabled = true;
            inp.classList.add(ok ? 'is-right' : 'is-wrong');
            if (ok) { score++; kit.feedback(fb, 'good', `**Correct.** ${q.work}`); }
            else {
              let why = '';
              const trap = (q.traps || []).find(tr => kit.checkNum(raw, tr.v));
              if (trap) why = trap.m + ' ';
              else if (kit.checkNum(raw, q.answer * 1000) || kit.checkNum(raw, q.answer / 1000)) why = `Check your units: that is off by a factor of 1,000 (the answer is in ${q.unit}). `;
              else if (kit.checkNum(raw, q.answer * 8) || kit.checkNum(raw, q.answer / 8)) why = 'Off by a factor of 8: check the bytes-to-bits conversion. ';
              kit.feedback(fb, 'bad', `**Not quite.** You entered ${raw}; the answer is **${num(q.answer)} ${q.unit === '(ratio)' ? '' : q.unit}**. ${why}${q.work}`);
            }
            hud.set({ score: String(score) });
            finishQ();
          }
          keyAct = e => { if (e.key === 'Enter' && e.target === inp) { e.preventDefault(); check(); } };
          inp.focus();
        }

        function end() {
          keyAct = null;
          const tips = score >= 9 ? 'You can do these under exam pressure.' : score >= 6 ? 'Re-read the worked formulas for the ones you missed.' : 'Revisit section 1.4 and try the wire sandbox again.';
          kit.finish({
            score,
            headline: `${score}/${ROUNDS}`,
            summary: `${tips} Takeaway: each store-and-forward link costs L/R + d/s, queues blow up when La/R > 1, and throughput is the bottleneck rate.`,
          });
        }

        nextRound();
        return () => {};
      }

      setMode('wire');
      return () => { if (teardown) teardown(); };
    },
  });
})();
