/* Number crunch: randomized calculation drills for every formula in chapters 1–3. */
(function () {
  const n = x => Number(x).toLocaleString('en-US', { maximumFractionDigits: 6 });
  const sig = (x, p) => Number(Number(x).toPrecision(p || 4));
  const show = (x, p) => n(sig(x, p || 4));
  function C(nn, k) { let r = 1; for (let i = 1; i <= k; i++) r = r * (nn - k + i) / i; return r; }

  // Each generator returns { q, a, unit, steps, tol? }. level: 1 easy, 2 medium, 3 hard.
  const GENS = [
    { id: 'dtrans', ch: 1, level: 1, name: 'Transmission delay', make(k) {
      const Lb = k.pick([500, 1000, 1250, 1500, 2000]); const R = k.pick([1, 2, 5, 10, 100]);
      const L = Lb * 8, d = L / (R * 1e6) * 1e3;
      return { q: `How long does it take to push a **${n(Lb)}-byte** packet onto a **${R} Mbps** link? Answer in ms.`, a: d, unit: 'ms',
        steps: `d_{trans} = L/R = (${n(Lb)} × 8 bits) / (${R} × 10^{6} bits/s) = ${n(L)} / ${n(R * 1e6)} s = **${show(d)} ms**. Bytes become bits first.` };
    } },
    { id: 'dprop', ch: 1, level: 1, name: 'Propagation delay', make(k) {
      const dkm = k.pick([1000, 2500, 4000, 5000, 10000, 36000]); const s = k.pick([2e8, 2.5e8, 3e8]);
      const t = dkm * 1e3 / s * 1e3;
      return { q: `A link is **${n(dkm)} km** long and signals travel at **${s / 1e8} × 10^{8} m/s**. What is the propagation delay in ms?`, a: t, unit: 'ms',
        steps: `d_{prop} = d/s = ${n(dkm * 1e3)} m / ${s / 1e8}×10^{8} m/s = **${show(t)} ms**. Packet length and link rate do not matter for propagation.` };
    } },
    { id: 'bdp', ch: 1, level: 2, name: 'Bits on the link', make(k) {
      const R = k.pick([1, 2, 5, 10]); const dkm = k.pick([1000, 2000, 5000, 20000]); const s = 2.5e8;
      const prop = dkm * 1e3 / s, bdp = R * 1e6 * prop;
      return { q: `Link: **${R} Mbps**, **${n(dkm)} km**, propagation speed 2.5 × 10^{8} m/s. What is the bandwidth-delay product (the maximum number of bits on the link at once)?`, a: bdp, unit: 'bits',
        steps: `d_{prop} = ${n(dkm * 1e3)} / 2.5×10^{8} = ${show(prop * 1e3)} ms. R × d_{prop} = ${R}×10^{6} × ${show(prop)} s = **${n(sig(bdp, 6))} bits**.` };
    } },
    { id: 'bitwidth', ch: 1, level: 2, name: 'Width of a bit', make(k) {
      const R = k.pick([1, 2, 10, 100]); const s = 2.5e8; const w = s / (R * 1e6);
      return { q: `On a **${R} Mbps** link with propagation speed 2.5 × 10^{8} m/s, how long (in metres) is one bit on the wire?`, a: w, unit: 'm',
        steps: `One bit lasts 1/R seconds and the signal moves s metres per second, so width = s/R = 2.5×10^{8} / ${R}×10^{6} = **${show(w)} m**.` };
    } },
    { id: 'e2e', ch: 1, level: 2, name: 'Store-and-forward, N links', make(k) {
      const N = k.pick([2, 3, 4]); const Lb = k.pick([1000, 1500]); const R = k.pick([1, 2, 10]); const dprop = k.pick([0, 1, 2, 5]);
      const tr = Lb * 8 / (R * 1e6) * 1e3; const tot = N * (tr + dprop);
      return { q: `A packet of **${n(Lb)} bytes** crosses **${N} links** (${N - 1} store-and-forward routers). Every link is **${R} Mbps** with **${dprop} ms** propagation delay. Ignore processing and queuing. End-to-end delay in ms?`, a: tot, unit: 'ms',
        steps: `Each link costs L/R + d_{prop} = ${show(tr)} + ${dprop} ms. Store-and-forward means the full transmission repeats on every link: ${N} × (${show(tr)} + ${dprop}) = **${show(tot)} ms**.` };
    } },
    { id: 'e2e-uneq', ch: 1, level: 2, name: 'Unequal link rates', make(k) {
      const Lb = k.pick([1000, 1250, 1500]); const R1 = k.pick([1, 2, 5]); const R2 = k.pick([10, 20, 100]); const R3 = k.pick([2, 4, 8]);
      const L = Lb * 8; const t = (L / (R1 * 1e6) + L / (R2 * 1e6) + L / (R3 * 1e6)) * 1e3;
      return { q: `A **${n(Lb)}-byte** packet goes over three links in series at **${R1}**, **${R2}** and **${R3} Mbps** (store-and-forward; ignore propagation, processing and queuing). Total delay in ms?`, a: t, unit: 'ms',
        steps: `Sum the transmission delay on each link: L/R_{1} + L/R_{2} + L/R_{3} = ${show(L / R1 / 1e3)} + ${show(L / R2 / 1e3)} + ${show(L / R3 / 1e3)} = **${show(t)} ms**.` };
    } },
    { id: 'segment', ch: 1, level: 3, name: 'Message segmentation', make(k) {
      const P = k.pick([10, 20, 50, 100]); const Lkb = k.pick([1, 5, 10]); const N = k.pick([2, 3, 4]); const R = k.pick([1, 2, 5]);
      const L = Lkb * 1e3; const t = (N + P - 1) * L / (R * 1e6); const whole = N * P * L / (R * 1e6);
      return { q: `A message of **${n(P * L)} bits** is split into **${P} packets** of ${n(L)} bits and sent over **${N} links** of **${R} Mbps** each (store-and-forward, no other delays). How long until the destination has the whole message? Answer in seconds.`, a: t, unit: 's',
        steps: `The first packet needs N·L/R; after that one packet arrives every L/R: (N + P − 1)·L/R = (${N} + ${P} − 1) × ${n(L)}/${n(R * 1e6)} = **${show(t)} s**. Without segmenting: N·M/R = ${show(whole)} s.` };
    } },
    { id: 'intensity', ch: 1, level: 2, name: 'Traffic intensity', make(k) {
      const R = k.pick([1, 2, 10]); const L = k.pick([1000, 2000, 5000]); const a = k.pick([100, 200, 400, 800, 1000, 1500]);
      const I = L * a / (R * 1e6);
      return { q: `Packets of **${n(L)} bits** arrive at a queue at **${n(a)} packets/s**; the outgoing link is **${R} Mbps**. What is the traffic intensity La/R?`, a: I, unit: '',
        steps: `La/R = ${n(L)} × ${n(a)} / ${n(R * 1e6)} = **${show(I)}**. ${I > 1 ? 'Greater than 1: bits arrive faster than they leave, so the queue grows without bound (delay → ∞).' : I > 0.8 ? 'Close to 1: queuing delay grows very quickly.' : 'Well below 1: queuing delay stays small on average.'}` };
    } },
    { id: 'qdelay', ch: 1, level: 3, name: 'Average queuing delay', make(k) {
      const N = k.pick([3, 4, 5, 8, 10]); const Lb = k.pick([1000, 1500]); const R = k.pick([1, 2, 10]);
      const L = Lb * 8; const avg = (N - 1) * L / (2 * R * 1e6) * 1e3;
      return { q: `**${N} packets** of ${n(Lb)} bytes arrive at the same instant at an empty queue in front of a **${R} Mbps** link. What is the average queuing delay over the ${N} packets, in ms?`, a: avg, unit: 'ms',
        steps: `Packet n waits (n − 1)·L/R. Average = (L/R)·(0 + 1 + … + (N−1))/N = (N − 1)·L/(2R) = ${N - 1} × ${n(L)} / (2 × ${n(R * 1e6)}) = **${show(avg)} ms**.` };
    } },
    { id: 'throughput', ch: 1, level: 2, name: 'End-to-end throughput', make(k) {
      const Rs = k.pick([2, 5, 10, 20]); const Rc = k.pick([1, 4, 8, 50]); const R = k.pick([30, 50, 100]); const M = k.pick([5, 10, 20, 25]);
      const t = Math.min(Rs, Rc, R / M);
      return { q: `**${M}** downloads share a core link of **${R} Mbps** equally. Each server's access link is **${Rs} Mbps** and each client's is **${Rc} Mbps**. Throughput per download in Mbps?`, a: t, unit: 'Mbps',
        steps: `Throughput = min(R_{s}, R_{c}, R/M) = min(${Rs}, ${Rc}, ${R}/${M} = ${show(R / M)}) = **${show(t)} Mbps**: the bottleneck link sets the rate.` };
    } },
    { id: 'filetime', ch: 1, level: 1, name: 'File transfer time', make(k) {
      const F = k.pick([4, 8, 20, 32]); const R = k.pick([0.5, 1, 2, 4]);
      const t = F * 8 / R;
      return { q: `A **${F} MB** file (1 MB = 10^{6} bytes) moves over a path whose bottleneck throughput is **${R} Mbps**. Roughly how many seconds?`, a: t, unit: 's',
        steps: `Time ≈ F / throughput = ${F} × 8 × 10^{6} bits / ${R} × 10^{6} bits/s = **${show(t)} s**.` };
    } },
    { id: 'circuit', ch: 1, level: 2, name: 'Circuit switching (TDM)', make(k) {
      const R = k.pick([1.536, 2.048, 3.072]); const slots = k.pick([12, 24, 32]); const Fk = k.pick([320, 640, 1280]); const setup = k.pick([250, 500]);
      const per = R * 1e6 / slots; const t = Fk * 1e3 / per + setup / 1e3;
      return { q: `A TDM circuit-switched link of **${R} Mbps** has **${slots} slots**. How long (seconds) to send a **${n(Fk * 1e3)}-bit** file over one circuit, including **${setup} ms** to set it up?`, a: t, unit: 's',
        steps: `Each circuit gets R/slots = ${n(R * 1e6)}/${slots} = ${n(per)} bps. Transfer = ${n(Fk * 1e3)} / ${n(per)} = ${show(Fk * 1e3 / per)} s, plus ${setup / 1e3} s setup = **${show(t)} s**.` };
    } },
    { id: 'users', ch: 1, level: 1, name: 'Users under circuit switching', make(k) {
      const R = k.pick([1, 2, 3, 10]); const u = k.pick([100, 200, 250, 500]); const users = Math.floor(R * 1000 / u);
      return { q: `A **${R} Mbps** link is shared; each user needs **${u} kbps** while active. With circuit switching (capacity reserved per user), how many users can be supported?`, a: users, unit: 'users', tol: 0,
        steps: `Circuit switching reserves the peak rate for everyone: ⌊${R * 1000} kbps / ${u} kbps⌋ = **${users}** users, no matter how rarely they are active.` };
    } },
    { id: 'binom', ch: 1, level: 3, name: 'Packet switching odds', make(k) {
      const N = k.pick([3, 4, 5]); const p = k.pick([0.1, 0.2]);
      const prob = Math.pow(p, N);
      return { q: `**${N}** users each transmit independently **${p * 100}%** of the time. What is the probability that all ${N} are transmitting at the same moment? (Give a decimal.)`, a: prob, unit: '', tol: 0.02,
        steps: `Independent events multiply: p^{N} = ${p}^{${N}} = **${prob.toPrecision(3)}**. In general P(exactly n of N active) = C(N, n)·p^{n}(1 − p)^{N−n}.` };
    } },
    { id: 'binom2', ch: 1, level: 3, name: 'More than k active', make(k) {
      const N = k.pick([10, 12, 15]); const p = 0.1; const kk = k.pick([2, 3]);
      let s = 0; for (let i = 0; i <= kk; i++) s += C(N, i) * Math.pow(p, i) * Math.pow(1 - p, N - i);
      const pr = 1 - s;
      return { q: `**${N}** users, each active independently with probability **0.1**. What is the probability that **more than ${kk}** are active at once?`, a: pr, unit: '', tol: 0.03,
        steps: `P(> ${kk}) = 1 − Σ_{n=0..${kk}} C(${N}, n)(0.1)^{n}(0.9)^{${N}−n} = 1 − ${s.toFixed(4)} = **${pr.toFixed(4)}**.` };
    } },
    { id: 'http-np', ch: 2, level: 1, name: 'Non-persistent HTTP', make(k) {
      const M = k.pick([1, 2, 3, 5, 8, 10]); const RTT = k.pick([10, 20, 50, 100]);
      const t = 2 * RTT * (1 + M);
      return { q: `A page is a base HTML file plus **${M}** small embedded objects. RTT = **${RTT} ms**, transmission times negligible, **non-persistent HTTP, no parallel connections**. Total time in ms?`, a: t, unit: 'ms',
        steps: `Every object (base included) costs 2 RTT: one for the TCP handshake, one for request/response. (1 + ${M}) × 2 × ${RTT} = **${t} ms**.` };
    } },
    { id: 'http-p', ch: 2, level: 2, name: 'Persistent HTTP', make(k) {
      const M = k.pick([2, 3, 5, 8, 10]); const RTT = k.pick([10, 20, 50]); const pipe = k.pick([true, false]);
      const t = pipe ? 3 * RTT : 2 * RTT + M * RTT;
      return { q: `Base HTML + **${M}** small objects, RTT = **${RTT} ms**, **persistent HTTP ${pipe ? 'with' : 'without'} pipelining**. Total time in ms (transmission negligible)?`, a: t, unit: 'ms',
        steps: pipe ? `2 RTT for the connection + base file, then all ${M} requests go back-to-back and arrive within 1 more RTT: 3 × ${RTT} = **${t} ms**.` : `2 RTT for connection + base file, then one RTT per object on the open connection: 2×${RTT} + ${M}×${RTT} = **${t} ms**.` };
    } },
    { id: 'http-par', ch: 2, level: 2, name: 'Parallel connections', make(k) {
      const M = k.pick([5, 8, 10, 12]); const P = k.pick([2, 3, 5]); const RTT = k.pick([10, 20, 40]);
      const t = 2 * RTT + Math.ceil(M / P) * 2 * RTT;
      return { q: `Base HTML + **${M}** objects, RTT = **${RTT} ms**, **non-persistent HTTP with up to ${P} parallel connections**. Total time in ms?`, a: t, unit: 'ms',
        steps: `Base file: 2 RTT. Then the ${M} objects go in ⌈${M}/${P}⌉ = ${Math.ceil(M / P)} waves of parallel connections, 2 RTT each: 2×${RTT} + ${Math.ceil(M / P)}×2×${RTT} = **${t} ms**.` };
    } },
    { id: 'http-dns', ch: 2, level: 3, name: 'DNS + HTTP', make(k) {
      const nd = k.pick([1, 2, 3]); const dns = Array.from({ length: nd }, () => k.pick([3, 5, 10, 20])); const RTT0 = k.pick([10, 20, 30]); const M = k.pick([0, 4, 8]);
      const sum = dns.reduce((a, b) => a + b, 0); const t = sum + 2 * RTT0 + M * 2 * RTT0;
      return { q: `The browser needs **${nd} DNS lookup${nd > 1 ? 's' : ''}** taking ${dns.join(', ')} ms (RTT each), then fetches a base page${M ? ` plus **${M}** objects` : ''} from a server with RTT_{0} = **${RTT0} ms** using **non-persistent serial HTTP**. Total time in ms?`, a: t, unit: 'ms',
        steps: `DNS: ${dns.join(' + ')} = ${sum} ms. Base page: 2RTT_{0} = ${2 * RTT0} ms.${M ? ` Objects: ${M} × 2RTT_{0} = ${M * 2 * RTT0} ms.` : ''} Total **${t} ms**.` };
    } },
    { id: 'p2p', ch: 2, level: 3, name: 'P2P vs client-server', make(k) {
      const F = k.pick([1, 2, 5]) * 1e9; const us = k.pick([10, 20, 30]) * 1e6; const d = k.pick([2, 5, 10]) * 1e6; const u = k.pick([0.3, 0.5, 1, 2]) * 1e6; const N = k.pick([10, 100, 1000]);
      const p2p = k.pick([true, false]);
      const dcs = Math.max(N * F / us, F / d);
      const dp = Math.max(F / us, F / d, N * F / (us + N * u));
      const a = p2p ? dp : dcs;
      return { q: `Distribute a **${F / 1e9} Gbit** file to **N = ${N}** peers. Server upload u_{s} = **${us / 1e6} Mbps**, each peer downloads at d = **${d / 1e6} Mbps** and uploads at u = **${u / 1e6} Mbps**. Minimum distribution time for **${p2p ? 'P2P' : 'client-server'}**, in seconds?`, a, unit: 's',
        steps: p2p ? `D_{P2P} = max(F/u_{s}, F/d_{min}, NF/(u_{s} + Nu)) = max(${show(F / us)}, ${show(F / d)}, ${show(N * F / (us + N * u))}) = **${show(dp)} s**. (Client-server would be ${show(dcs)} s.)` : `D_{cs} = max(NF/u_{s}, F/d_{min}) = max(${show(N * F / us)}, ${show(F / d)}) = **${show(dcs)} s**. (P2P would be ${show(dp)} s.)` };
    } },
    { id: 'cache', ch: 2, level: 2, name: 'Web cache and access link', make(k) {
      const lam = k.pick([10, 15, 20]); const L = k.pick([0.5, 1, 2]); const R = k.pick([15, 20, 30, 50]); const h = k.pick([0, 0.3, 0.4, 0.6]);
      const util = (1 - h) * lam * L / R;
      return { q: `An institution makes **${lam} requests/s** for objects of **${L} Mbit**; its access link is **${R} Mbps**. With a local cache hit rate of **${h}**, what is the access-link utilization?`, a: util, unit: '',
        steps: `Only misses cross the access link: (1 − h)·λ·L / R = ${show(1 - h)} × ${lam} × ${L} / ${R} = **${show(util)}**. ${util >= 1 ? 'At or above 1: queuing delay explodes.' : util > 0.8 ? 'Above 0.8: delays get large.' : 'Low enough that access delay stays small.'}` };
    } },
    { id: 'saw', ch: 3, level: 2, name: 'Stop-and-wait utilization', make(k) {
      const Lb = k.pick([1000, 1500]); const R = k.pick([1, 10, 100, 1000]); const RTT = k.pick([1, 10, 30, 100]);
      const tr = Lb * 8 / (R * 1e6); const U = tr / (RTT / 1e3 + tr);
      return { q: `Stop-and-wait (rdt3.0): packets of **${n(Lb)} bytes**, link **${R >= 1000 ? R / 1000 + ' Gbps' : R + ' Mbps'}**, RTT **${RTT} ms**. Sender utilization (decimal)?`, a: U, unit: '',
        steps: `L/R = ${n(Lb * 8)}/${n(R * 1e6)} = ${show(tr * 1e3)} ms. U = (L/R)/(RTT + L/R) = ${show(tr * 1e3)} / (${RTT} + ${show(tr * 1e3)}) = **${U.toPrecision(3)}**.` };
    } },
    { id: 'pipeU', ch: 3, level: 2, name: 'Pipelined utilization', make(k) {
      const Nw = k.pick([3, 10, 50, 100]); const Lb = 1000; const R = k.pick([100, 1000]); const RTT = k.pick([10, 30]);
      const tr = Lb * 8 / (R * 1e6); const U = Math.min(1, Nw * tr / (RTT / 1e3 + tr));
      return { q: `A pipelined sender keeps **${Nw}** packets of 1,000 bytes in flight per RTT. Link **${R >= 1000 ? '1 Gbps' : R + ' Mbps'}**, RTT **${RTT} ms**. Utilization (decimal, max 1)?`, a: U, unit: '',
        steps: `U = N·(L/R)/(RTT + L/R) = ${Nw} × ${show(tr * 1e3)} / (${RTT} + ${show(tr * 1e3)}) = **${U.toPrecision(3)}**${U === 1 ? ' (capped at 1: the link is saturated)' : ''}.` };
    } },
    { id: 'winneed', ch: 3, level: 3, name: 'Window for target utilization', make(k) {
      const Lb = 1500; const R = k.pick([1, 10, 100]); const RTT = k.pick([20, 30, 50]); const X = k.pick([0.5, 0.9, 0.98]);
      const tr = Lb * 8 / (R * 1e9); const Nw = Math.ceil(X * (RTT / 1e3 + tr) / tr - 1e-9);
      return { q: `How many 1,500-byte packets must be in flight to get sender utilization of at least **${X * 100}%** on a **${R} Gbps** link with RTT **${RTT} ms**? (Smallest whole number.)`, a: Nw, unit: 'packets', tol: 0.001,
        steps: `Need N·(L/R)/(RTT + L/R) ≥ ${X}. L/R = ${show(tr * 1e6)} µs, so N ≥ ${X} × (${RTT} ms + ${show(tr * 1e6)} µs) / ${show(tr * 1e6)} µs = ${show(X * (RTT / 1e3 + tr) / tr, 6)} → **${Nw}**.` };
    } },
    { id: 'seqbits', ch: 3, level: 2, name: 'Sequence-number space', make(k) {
      const kk = k.pick([2, 3, 4, 5, 8]); const sr = k.pick([true, false]);
      const a = sr ? Math.pow(2, kk - 1) : Math.pow(2, kk) - 1;
      return { q: `Sequence numbers use **${kk} bits**. What is the largest safe window size for **${sr ? 'Selective Repeat' : 'Go-Back-N'}**?`, a, unit: 'packets', tol: 0,
        steps: sr ? `SR needs window ≤ half the sequence space: 2^{${kk}}/2 = **${a}**. Larger, and the receiver can't tell a retransmission from a new packet.` : `GBN can use up to 2^{k} − 1 = ${Math.pow(2, kk)} − 1 = **${a}**: one number must stay unused so a full window of new packets isn't confused with retransmissions.` };
    } },
    { id: 'ewma', ch: 3, level: 2, name: 'EstimatedRTT', make(k) {
      const est = k.pick([80, 100, 120, 150]); const s = est + k.pick([-30, -10, 10, 20, 40, 60]);
      const a = 0.875 * est + 0.125 * s;
      return { q: `EstimatedRTT = **${est} ms**. A new SampleRTT of **${s} ms** arrives. New EstimatedRTT with α = 0.125, in ms?`, a, unit: 'ms', tol: 0.002,
        steps: `EstimatedRTT = (1 − α)·EstimatedRTT + α·SampleRTT = 0.875 × ${est} + 0.125 × ${s} = **${show(a, 6)} ms**.` };
    } },
    { id: 'devrtt', ch: 3, level: 3, name: 'DevRTT and timeout', make(k) {
      const est = k.pick([100, 120]); const dev = k.pick([5, 10, 15]); const s = est + k.pick([-20, 10, 30, 50]);
      const dev2 = 0.75 * dev + 0.25 * Math.abs(s - est); const est2 = 0.875 * est + 0.125 * s; const to = est2 + 4 * dev2;
      const ask = k.pick(['dev', 'to']);
      return { q: `EstimatedRTT = **${est} ms**, DevRTT = **${dev} ms**, new SampleRTT = **${s} ms** (α = 0.125, β = 0.25). As in the textbook's solution (and RFC 6298), DevRTT uses the EstimatedRTT from before this sample. ${ask === 'dev' ? 'New DevRTT in ms?' : 'New TimeoutInterval in ms?'}`, a: ask === 'dev' ? dev2 : to, unit: 'ms', tol: 0.005,
        steps: `DevRTT = 0.75×${dev} + 0.25×|${s} − ${est}| = ${show(dev2, 5)}. EstimatedRTT = 0.875×${est} + 0.125×${s} = ${show(est2, 6)}. TimeoutInterval = EstimatedRTT + 4·DevRTT = ${show(est2, 6)} + 4×${show(dev2, 5)} = **${show(to, 5)} ms**.` };
    } },
    { id: 'tcpseq', ch: 3, level: 1, name: 'TCP sequence numbers', make(k) {
      const isn = k.rand(1, 900); const sizes = [k.pick([20, 40, 80, 100]), k.pick([50, 100, 200]), k.pick([10, 30, 60])];
      const which = k.pick([1, 2]); const seq = isn + sizes.slice(0, which).reduce((a, b) => a + b, 0);
      return { q: `A sends three segments carrying **${sizes.join(', ')} bytes**. The first has sequence number **${isn}**. What is the sequence number of segment ${which + 1}?`, a: seq, unit: '', tol: 0,
        steps: `Sequence numbers count bytes: each segment's number is the first byte it carries. ${isn} + ${sizes.slice(0, which).join(' + ')} = **${seq}**.` };
    } },
    { id: 'tcpack', ch: 3, level: 2, name: 'TCP ACK numbers', make(k) {
      const isn = k.rand(100, 900); const a = k.pick([40, 80, 100]); const b = k.pick([20, 40, 60]);
      const lostFirst = k.pick([true, false]);
      const ack = lostFirst ? isn : isn + a + b;
      return { q: `B has received all bytes up to **${isn - 1}**. A sends a segment of **${a} bytes** (seq ${isn}) and then one of **${b} bytes**. ${lostFirst ? 'The first segment is lost; the second arrives.' : 'Both arrive in order.'} What ACK number does B send after the second segment arrives?`, a: ack, unit: '', tol: 0,
        steps: lostFirst ? `ACK = next byte expected. Byte ${isn} is still missing, so B repeats ACK **${isn}** (a duplicate ACK) even though it got the later bytes.` : `B now has everything through ${isn + a + b - 1}, so it ACKs the next byte it expects: ${isn} + ${a} + ${b} = **${ack}** (cumulative).` };
    } },
    { id: 'segments', ch: 3, level: 1, name: 'Segments for a file', make(k) {
      const F = k.pick([10000, 50000, 500000, 1000000]); const mss = k.pick([536, 1000, 1460]);
      const s = Math.ceil(F / mss);
      return { q: `How many TCP segments does a **${n(F)}-byte** file need with MSS = **${n(mss)} bytes**?`, a: s, unit: 'segments', tol: 0,
        steps: `⌈${n(F)} / ${n(mss)}⌉ = **${n(s)}**. MSS limits application data per segment (headers not included).` };
    } },
    { id: 'udplen', ch: 3, level: 1, name: 'UDP length field', make(k) {
      const d = k.pick([12, 32, 100, 512, 1000, 1472]);
      return { q: `A UDP segment carries **${d} bytes** of application data. What value is in the UDP length field?`, a: d + 8, unit: 'bytes', tol: 0,
        steps: `Length counts header plus data. UDP's header is 8 bytes (4 fields × 2 bytes): ${d} + 8 = **${d + 8}**.` };
    } },
    { id: 'timeoutdbl', ch: 3, level: 2, name: 'Timeout doubling', make(k) {
      const to = k.pick([0.5, 0.75, 1, 1.5]); const t = k.pick([1, 2, 3]);
      const a = to * Math.pow(2, t);
      return { q: `TimeoutInterval is **${to} s**. The same segment then times out **${t}** time${t > 1 ? 's' : ''} in a row with no ACK in between. What is the TimeoutInterval now, in seconds?`, a, unit: 's', tol: 0.001,
        steps: `Each timeout doubles the interval instead of recomputing it from EstimatedRTT: ${to} × 2^{${t}} = **${a} s**. It is recomputed from the formula once a fresh ACK updates EstimatedRTT.` };
    } },
  ];

  const CH_LABEL = { 0: 'All formulas', 1: 'Chapter 1: delay, throughput, switching', 2: 'Chapter 2: HTTP, P2P, caching', 3: 'Chapter 3: rdt, windows, TCP' };

  NET.addGame({
    id: 'number-crunch',
    title: 'Number crunch',
    unit: 0,
    sections: ['delay', 'switching', 'http', 'http-advanced', 'p2p', 'rdt3', 'pipelining', 'tcp-basics', 'tcp-rtt'],
    blurb: 'Endless randomized calculation drills for every formula on the midterm, with the worked solution after each answer.',
    how: [
      'Pick a chapter (or all). Each run is 10 problems that get harder as you go.',
      'Type a number in the unit asked. Arithmetic works: `1500*8/10e6`. Answers within 2% count unless the question needs an exact integer.',
      'Read the worked solution after every answer, right or wrong. That is where the learning happens.',
      'Keys: Enter checks, Enter again for the next problem.',
    ],
    mount(root, kit) {
      const { el } = kit;
      let ch = NET.store.setting('crunchCh') || 0;
      const ROUNDS = 10;
      let round = 0, score = 0, streak = 0, cur = null, answered = false;
      const modes = el('div', { class: 'g-modes', role: 'group', 'aria-label': 'Chapter' });
      [0, 1, 2, 3].forEach(c => {
        const b = el('button', { class: 'chip' + (c ? ' u' + c : ''), type: 'button', 'aria-pressed': String(c === ch) }, CH_LABEL[c]);
        b.addEventListener('click', () => { ch = c; NET.store.setting('crunchCh', c); kit.restart(); });
        modes.appendChild(b);
      });
      const hud = kit.hud([['round', 'Problem'], ['score', 'Correct'], ['streak', 'Streak'], ['|'], ['best', 'Best']]);
      const tag = el('div', { class: 'g-row', style: { marginBottom: '8px' } });
      const prompt = el('p', { class: 'g-prompt' });
      const input = kit.numInput({ placeholder: 'your answer', label: 'Answer' });
      input.style.width = '200px';
      const unit = el('span', { class: 'g-mono', style: { fontWeight: 700, color: 'var(--ink-2)' } });
      const check = el('button', { class: 'btn', type: 'button' }, 'Check');
      const nextBtn = el('button', { class: 'btn', type: 'button', hidden: true }, 'Next problem');
      const fb = el('div', { class: 'g-feedback', 'aria-live': 'polite' });
      root.append(modes, hud.node, tag, prompt, el('div', { class: 'g-row' }, input, unit, check, nextBtn), fb);

      const pool = GENS.filter(g => !ch || g.ch === ch);
      const sequence = [];
      // ramp: levels 1→3 across the run, no generator repeated back-to-back
      for (let i = 0; i < ROUNDS; i++) {
        const want = i < 3 ? 1 : i < 7 ? 2 : 3;
        let cands = pool.filter(g => g.level === want);
        if (!cands.length) cands = pool;
        const last = sequence[sequence.length - 1];
        const fresh = cands.filter(g => g !== last && !sequence.includes(g));
        sequence.push(kit.pick(fresh.length ? fresh : cands.filter(g => g !== last).length ? cands.filter(g => g !== last) : cands));
      }

      function evalNum(s) {
        const t = String(s).trim().replace(/,/g, '').replace(/×/g, '*').replace(/\^/g, '**');
        if (!t || !/^[0-9eE+\-*/().\s]+$/.test(t)) return NaN;
        try { return Function('"use strict";return (' + t + ')')(); } catch (e) { return NaN; }
      }
      function load() {
        const g = sequence[round];
        cur = Object.assign({ gen: g }, g.make(kit));
        answered = false;
        hud.set({ round: `${round + 1}/${ROUNDS}`, score, streak, best: kit.best() });
        tag.replaceChildren(el('span', { class: 'g-tag' }, g.name), el('span', { class: 'bars d' + g.level, title: ['', 'Easy', 'Medium', 'Hard'][g.level] }, el('i'), el('i'), el('i')));
        prompt.innerHTML = kit.fmt(cur.q);
        unit.textContent = cur.unit || '';
        input.value = ''; input.disabled = false; input.className = 'g-input'; input.style.width = '200px';
        check.hidden = false; nextBtn.hidden = true;
        kit.feedback(fb, '', '');
        input.focus();
      }
      function submit() {
        if (answered) return;
        const v = evalNum(input.value);
        if (!isFinite(v)) { kit.feedback(fb, 'part', 'Type a number. Arithmetic like `12000/2e6` is fine.'); input.focus(); return; }
        answered = true;
        const tol = cur.tol === undefined ? 0.02 : cur.tol;
        const ok = tol === 0 ? Math.abs(v - cur.a) < 1e-9 : kit.checkNum(v, cur.a, tol);
        if (ok) { score++; streak++; } else streak = 0;
        input.disabled = true; input.classList.add(ok ? 'is-right' : 'is-wrong');
        check.hidden = true; nextBtn.hidden = false; nextBtn.textContent = round === ROUNDS - 1 ? 'See score' : 'Next problem';
        kit.feedback(fb, ok ? 'good' : 'bad', (ok ? '**Correct.** ' : `**Not quite.** Expected ${show(cur.a, 5)}${cur.unit ? ' ' + cur.unit : ''}. `) + cur.steps);
        hud.set({ score, streak });
        nextBtn.focus();
      }
      function next() {
        round++;
        if (round >= ROUNDS) {
          kit.finish({ score, headline: `${score} / ${ROUNDS}`, summary: score >= 8 ? 'Strong. Switch chapters or go again for new numbers.' : 'Every run uses new numbers. Re-read the worked solutions for the ones you missed, then go again.' });
          return;
        }
        load();
      }
      check.addEventListener('click', submit);
      nextBtn.addEventListener('click', next);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
      kit.onKey(e => { if (e.key === 'Enter' && answered && !e.defaultPrevented && e.target !== nextBtn) { e.preventDefault(); next(); } });
      load();
    },
  });
})();
