NET.addQuestions('delay', [
  // ---------- The four delays ----------
  { id: 'delay-01', d: 1, type: 'multi', src: 'text',
    q: 'Which are the four components of nodal delay at a router? Select all that apply.',
    choices: ['Processing delay', 'Queuing delay', 'Transmission delay', 'Propagation delay', 'Routing-protocol convergence delay', 'Encapsulation delay'],
    a: [0, 1, 2, 3],
    why: 'd_{nodal} = d_{proc} + d_{queue} + d_{trans} + d_{prop}. Routing protocols set forwarding tables in the background; they are not a per-packet delay component. Encapsulation is not one of the four.' },

  { id: 'delay-02', d: 1, type: 'order', src: 'text',
    q: 'Order the delays a packet experiences at router A as it is forwarded to router B.',
    items: ['Nodal processing (examine header, check bit errors)', 'Queuing (wait in the output buffer)', 'Transmission (push all bits onto the link, L/R)', 'Propagation (bits travel to router B, d/s)'],
    why: 'The packet arrives and A processes the header to choose the outbound link; it waits in that link’s queue; when its turn comes its bits are pushed onto the link (L/R); each bit then propagates to B (d/s). Once the last bit reaches B, B repeats the sequence.' },

  { id: 'delay-03', d: 1, type: 'mc', src: 'cheat',
    q: 'The transmission delay L/R is…',
    choices: [
      'the time for one bit to travel from one end of the link to the other',
      'the time the packet waits in the output buffer',
      'the time to push all of the packet’s bits onto the link',
      'the time to examine the packet header'
    ],
    a: 2,
    why: 'L/R (L bits, R bits/s) is the time to transmit — push out — the entire packet. One bit’s travel time is propagation (d/s), waiting is queuing, header examination is processing.' },

  { id: 'delay-04', d: 1, type: 'mc', src: 'text',
    q: 'The propagation speed of signals in physical media such as fiber and twisted pair is in the range of…',
    choices: ['2 × 10^{8} to 3 × 10^{8} m/s', '2 × 10^{6} to 3 × 10^{6} m/s', '3 × 10^{8} to 3 × 10^{9} m/s', 'About 343 m/s'],
    a: 0,
    why: 'Propagation speed depends on the medium and is equal to or a little less than the speed of light (3 × 10^{8} m/s). Nothing travels faster than light, ruling out “3 × 10^{8} to 3 × 10^{9}”; 343 m/s is the speed of sound.' },

  { id: 'delay-05', d: 1, type: 'tf', src: 'text',
    q: 'True or false: the transmission delay of a packet increases with the distance between the two routers.',
    a: false,
    why: 'False. Transmission delay L/R depends only on packet length and link rate; it “has nothing to do with the distance between the two routers.” Distance affects the propagation delay d/s.' },

  { id: 'delay-06', d: 1, type: 'mc', src: 'text',
    q: 'Which delay component can differ from one packet to the next, even for packets of the same size on the same path?',
    choices: ['Processing', 'Transmission', 'Propagation', 'Queuing'],
    a: 3,
    why: 'Queuing delay depends on how many packets are already waiting, which changes constantly; that is why it is described statistically (average, variance, probability of exceeding a value). For fixed L, R and path, transmission and propagation are constant and processing is essentially constant.' },

  { id: 'delay-07', d: 1, type: 'mc', src: 'text',
    q: 'What does nodal processing delay include, and how large is it in high-speed routers?',
    choices: [
      'Waiting for earlier packets to be transmitted; up to seconds',
      'Examining the header to choose the outbound link and checking for bit errors; microseconds or less',
      'Pushing the packet’s bits onto the link; milliseconds',
      'The time for signals to cross the link; milliseconds in WANs'
    ],
    a: 1,
    why: 'Processing = header examination (forwarding decision) plus possibly bit-error checking; in high-speed routers it is on the order of microseconds or less. The other options describe queuing, transmission and propagation.' },

  { id: 'delay-08', d: 1, type: 'short', src: 'ch1-R16',
    q: 'Consider sending a packet from a source host to a destination host over a fixed route. List the delay components in the end-to-end delay. Which of these delays are constant and which are variable?',
    a: 'At each node: processing delay, queuing delay, transmission delay and propagation delay. On a fixed route with a given packet size, transmission (L/R) and propagation (d/s) are constant, and processing is (essentially) constant. Queuing delay is variable — it depends on the current congestion and varies from packet to packet.',
    keys: ['processing', 'transmission', 'propagation', 'queuing|queueing', 'variable|varies', 'constant|fixed'],
    why: 'The only component that depends on other traffic is queuing. (Some solutions also call processing slightly variable, but the textbook treats it as constant and usually negligible.)' },

  { id: 'delay-09', d: 2, type: 'multi', src: 'text',
    q: 'Which statements about the relative size of the delay components are true? Select all that apply.',
    choices: [
      'Propagation delay can be hundreds of milliseconds over a geostationary satellite link',
      'Propagation delay is negligible (a few microseconds) between two routers on the same campus',
      'Transmission delay is typically negligible on 10 Mbps-and-faster LAN links',
      'Transmission delay can be hundreds of milliseconds for large packets on a dial-up modem link',
      'Processing delay is usually negligible but strongly influences a router’s maximum throughput',
      'Queuing delay is always the dominant term'
    ],
    a: [0, 1, 2, 3, 4],
    why: 'All except the last come straight from the textbook. Example: 1,500 bytes on 56 kbps dial-up = 12,000/56,000 ≈ 214 ms of transmission delay. Queuing can be zero (empty queue) or huge (intensity near 1), so it is not always dominant.' },

  { id: 'delay-10', d: 2, type: 'num', src: 'cheat',
    q: 'What is the transmission delay of a 1,500-byte packet on a 100 Mbps link? Answer in μs.',
    a: 120, unit: 'μs',
    why: 'L = 1,500 × 8 = 12,000 bits; R = 100 × 10^{6} bits/s.\nL/R = 12,000 / 10^{8} = 1.2 × 10^{-4} s = 120 μs (= 0.12 ms).\nThe same packet on 10 Mbps takes 1.2 ms. Forgetting × 8 gives 15 μs.' },

  { id: 'delay-11', d: 2, type: 'mc', src: 'ch1-R18',
    ctx: 'A packet of 1,000 bytes is sent over a link of distance 2,500 km, propagation speed 2.5 × 10^{8} m/s, and transmission rate 2 Mbps.',
    q: 'How long does it take the packet to propagate over the link?',
    choices: ['14 ms', '10 ms', '4 ms', '0.01 ms'],
    a: 1,
    why: 'Propagation delay = d/s = 2.5 × 10^{6} m / 2.5 × 10^{8} m/s = 0.01 s = 10 ms.\n4 ms is the transmission delay (8,000 bits / 2 × 10^{6} bps); 14 ms (= 4 + 10) is the time until the whole packet has arrived, not the propagation time; 0.01 is the answer in seconds mislabelled as ms.' },

  { id: 'delay-12', d: 1, type: 'mc', src: 'ch1-R18',
    ctx: 'A packet of 1,000 bytes is sent over a link of distance 2,500 km, propagation speed 2.5 × 10^{8} m/s, and transmission rate 2 Mbps.',
    q: 'More generally, how long does it take a packet of length L to propagate over a link of distance d, propagation speed s and transmission rate R? Does this delay depend on packet length? On transmission rate?',
    choices: [
      'L/R + d/s; it depends on both',
      'd/s; it depends on the packet length but not the rate',
      'L/R; it depends on the rate only',
      'd/s; it depends on neither the packet length nor the transmission rate'
    ],
    a: 3,
    why: 'Propagation is the travel time of a bit: d/s, a function of distance and medium only. Changing L or R changes the transmission delay, never the propagation delay.' },

  { id: 'delay-13', d: 2, type: 'mc', src: 'ch1-R17',
    ctx: 'Adapted from R17 (the transmission-vs-propagation animation). A link is 1,000 km long with propagation speed 2.8 × 10^{8} m/s. Case 1: a 1,000-byte packet at 1 Mbps. Case 2: a 100-byte packet at 10 Mbps.',
    q: 'In which case does the sender finish transmitting before the first bit reaches the receiver?',
    choices: ['Case 2 only', 'Case 1 only', 'Both cases', 'Neither case'],
    a: 0,
    why: 'd_{prop} = 10^{6} / 2.8 × 10^{8} ≈ 3.57 ms in both cases.\nCase 1: d_{trans} = 8,000 / 10^{6} = 8 ms > 3.57 ms → the first bit reaches the receiver while the sender is still transmitting.\nCase 2: d_{trans} = 800 / 10^{7} = 80 μs < 3.57 ms → the sender finishes first; at that moment the first bit is only 2.8 × 10^{8} × 80 μs = 22.4 km down the link.\nRule: sender finishes first exactly when d_{trans} < d_{prop}.' },

  { id: 'delay-14', d: 2, type: 'num', src: 'text',
    q: 'Caravan analogy with tollbooths 150 km apart: a 10-car caravan, each tollbooth serves one car every 12 seconds, cars travel at 100 km/h, and the whole caravan lines up at a tollbooth before being served. How long from when the caravan is lined up before one tollbooth until it is lined up before the next? Answer in minutes.',
    a: 92, unit: 'min',
    why: 'Transmission (serving 10 cars): 10 × 12 s = 120 s = 2 min.\nPropagation (150 km at 100 km/h): 1.5 h = 90 min.\nTotal = 2 + 90 = 92 min. (With the textbook’s 100 km spacing it is 2 + 60 = 62 min.)' },

  { id: 'delay-15', d: 3, type: 'num', src: 'ch1-P5a',
    ctx: 'Car-caravan analogy: each tollbooth serves one car every 12 seconds, cars propagate at 100 km/hour, and the whole caravan must be lined up at a tollbooth before its cars are served.',
    q: 'A 10-car caravan travels 175 km, beginning in front of one tollbooth, passing through a second tollbooth, and finishing just after a third tollbooth. What is the end-to-end delay? Answer in minutes.',
    a: 111, unit: 'min',
    why: 'Three tollbooths serve the caravan: 3 × (10 × 12 s) = 3 × 2 min = 6 min.\nPropagation over the whole 175 km at 100 km/h: 1.75 h = 105 min (e.g., two 87.5 km legs of 52.5 min each — the split does not matter).\nTotal = 6 + 105 = 111 min.\nTrap: counting only two service times (the caravan “finishes just after” the third tollbooth, so the third booth serves it too).' },

  { id: 'delay-16', d: 3, type: 'num', src: 'ch1-P5b',
    ctx: 'Car-caravan analogy: each tollbooth serves one car every 12 seconds, cars propagate at 100 km/hour, and the whole caravan must be lined up at a tollbooth before its cars are served.',
    q: 'Repeat the 175 km, three-tollbooth trip, but with eight cars in the caravan instead of ten. What is the end-to-end delay? Answer in minutes.',
    a: 109.8, unit: 'min',
    why: 'Service per tollbooth: 8 × 12 s = 96 s = 1.6 min; three tollbooths → 4.8 min.\nPropagation is unchanged: 105 min (it depends on distance, not on the number of cars).\nTotal = 4.8 + 105 = 109.8 min = 109 min 48 s. A smaller “packet” only shrinks the transmission part.' },

  // ---------- Problem P6 ----------
  { id: 'delay-17', d: 1, type: 'mc', src: 'ch1-P6a',
    ctx: 'Hosts A and B are connected by a single link of rate R bps, separated by m meters; the propagation speed along the link is s meters/sec. Host A sends a packet of L bits to Host B.',
    q: 'Parts (a)–(c): express the propagation delay, the transmission time, and the end-to-end delay (ignoring processing and queuing delays).',
    choices: [
      'd_{prop} = s/m; d_{trans} = R/L; end-to-end = R/L + s/m',
      'd_{prop} = m/s; d_{trans} = L/R; end-to-end = max(L/R, m/s)',
      'd_{prop} = m/s; d_{trans} = L/R; end-to-end = L/R + m/s',
      'd_{prop} = L/R; d_{trans} = m/s; end-to-end = L/R + m/s'
    ],
    a: 2,
    why: 'Propagation = distance ÷ speed = m/s. Transmission = bits ÷ rate = L/R. The last bit leaves A at L/R and needs m/s more to arrive, so end-to-end = L/R + m/s. (The choice with d_{prop} = L/R and d_{trans} = m/s swaps the names — the classic confusion.)' },

  { id: 'delay-18', d: 1, type: 'mc', src: 'ch1-P6d',
    ctx: 'Hosts A and B are connected by a single link of rate R bps, separated by m meters; the propagation speed along the link is s meters/sec. Host A sends a packet of L bits to Host B.',
    q: 'Host A begins to transmit the packet at time t = 0. At time t = d_{trans}, where is the last bit of the packet?',
    choices: [
      'Already at Host B',
      'Halfway along the link',
      'Still waiting in Host A’s buffer',
      'Just leaving Host A — it has just been pushed onto the link'
    ],
    a: 3,
    why: 'd_{trans} = L/R is precisely the time to push all L bits onto the link, so at t = d_{trans} the last bit has just entered the link at A. It still needs d_{prop} to reach B.' },

  { id: 'delay-19', d: 2, type: 'mc', src: 'ch1-P6e',
    ctx: 'Hosts A and B are connected by a single link of rate R bps, separated by m meters; the propagation speed along the link is s meters/sec. Host A sends a packet of L bits to Host B, starting at t = 0.',
    q: 'Parts (e)–(f): at t = d_{trans}, where is the first bit of the packet (e) if d_{prop} > d_{trans}, and (f) if d_{prop} < d_{trans}?',
    choices: [
      '(e) Already at B; (f) in the link, not yet at B',
      '(e) Still at A; (f) still at A',
      '(e) In the link, a distance s·d_{trans} from A, not yet at B; (f) already arrived at B',
      '(e) In the link; (f) in the link'
    ],
    a: 2,
    why: 'The first bit left A at t = 0 and has been travelling for d_{trans} seconds, covering s·d_{trans} meters. (e) If it needs longer than that to cross (d_{prop} > d_{trans}), it is still in the link. (f) If d_{prop} < d_{trans}, it arrived at B before A finished sending — like the fast caravan whose first cars reach the next tollbooth before the last cars leave.' },

  { id: 'delay-20', d: 3, type: 'num', src: 'ch1-P6g',
    ctx: 'Hosts A and B are connected by a single link of rate R bps, separated by m meters; the propagation speed along the link is s meters/sec. Host A sends a packet of L bits to Host B.',
    q: 'Suppose s = 2.5 × 10^{8} m/s, L = 1,500 bytes and R = 10 Mbps. Find the distance m so that d_{prop} equals d_{trans}. Answer in km.',
    a: 300, unit: 'km',
    why: 'Set m/s = L/R → m = L·s/R.\nL = 1,500 × 8 = 12,000 bits → d_{trans} = 12,000 / 10^{7} = 1.2 ms.\nm = s × 1.2 ms = 2.5 × 10^{8} × 1.2 × 10^{-3} = 3 × 10^{5} m = 300 km.\nForgetting × 8 gives 37.5 km.' },

  // ---------- Bandwidth-delay product (P25–P29) ----------
  { id: 'delay-21', d: 2, type: 'num', src: 'ch1-P25a',
    ctx: 'Hosts A and B are 20,000 km apart and connected by a direct link of R = 5 Mbps. The propagation speed over the link is 2.5 × 10^{8} m/s.',
    q: 'Calculate the bandwidth-delay product, R × d_{prop}. Answer in bits.',
    a: 400000, unit: 'bits',
    why: 'd_{prop} = 2 × 10^{7} m / 2.5 × 10^{8} m/s = 0.08 s.\nR × d_{prop} = 5 × 10^{6} bits/s × 0.08 s = 4 × 10^{5} = 400,000 bits.' },

  { id: 'delay-22', d: 3, type: 'num', src: 'ch1-P25b',
    ctx: 'Hosts A and B are 20,000 km apart and connected by a direct link of R = 5 Mbps. The propagation speed over the link is 2.5 × 10^{8} m/s.',
    q: 'A file of 800,000 bits is sent from A to B continuously as one large message. What is the maximum number of bits that will be in the link at any given time? Answer in bits.',
    a: 400000, unit: 'bits',
    why: 'Bits enter at R and each stays in the link for d_{prop} = 0.08 s, so at most R × d_{prop} = 400,000 bits are in flight. The file (800,000 bits) is longer than that, so the link fills up to the bandwidth-delay product: 400,000 bits. (When the file is shorter than R × d_{prop}, the answer is the file size — see P27.)' },

  { id: 'delay-23', d: 2, type: 'short', src: 'ch1-P25c',
    ctx: 'Hosts A and B are 20,000 km apart and connected by a direct link of R = 5 Mbps. The propagation speed over the link is 2.5 × 10^{8} m/s.',
    q: 'Provide an interpretation of the bandwidth-delay product.',
    a: 'It is the maximum number of bits that can be in the link (“in flight”) at one time — the capacity of the pipe. The sender transmits R bits per second and each bit takes d_{prop} seconds to reach the receiver, so by the time the first bit arrives the sender has put R × d_{prop} bits into the link.',
    keys: ['maximum|max', 'bits', 'in the link|in flight|in the pipe|on the wire', 'first bit arrives|propagation|d_prop|d_{prop}'],
    why: 'Picture the link as a pipe of length d_{prop} seconds being filled at R bits/s. A large bandwidth-delay product means lots of data in transit — which is why waiting for an acknowledgment after each packet (P28b) wastes so much capacity on long fast links.' },

  { id: 'delay-24', d: 2, type: 'num', src: 'ch1-P25d',
    ctx: 'Hosts A and B are 20,000 km apart and connected by a direct link of R = 5 Mbps. The propagation speed over the link is 2.5 × 10^{8} m/s.',
    q: 'What is the width (in meters) of a bit in the link? Answer in m.',
    a: 50, unit: 'm',
    why: 'The link of 2 × 10^{7} m holds 4 × 10^{5} bits, so each bit is 2 × 10^{7} / 4 × 10^{5} = 50 m wide (equivalently s/R = 2.5 × 10^{8} / 5 × 10^{6} = 50 m). That is shorter than a football field (about 91 m for 100 yards, around 100–110 m for a soccer pitch).' },

  { id: 'delay-25', d: 2, type: 'mc', src: 'ch1-P25e',
    q: 'Derive a general expression for the width of a bit in terms of the propagation speed s, the transmission rate R, and the length of the link m.',
    choices: ['R/s', 's/R', 'm/s', 'm·R/s'],
    a: 1,
    why: 'Width = link length ÷ bits in the link = m / (R × d_{prop}) = m / (R × m/s) = s/R. The link length cancels: a bit occupies s/R meters regardless of how long the link is. Faster links (bigger R) mean narrower bits.' },

  { id: 'delay-26', d: 2, type: 'num', src: 'ch1-P26',
    q: 'For the P25 link (20,000 km, propagation speed 2.5 × 10^{8} m/s), suppose we can change R. For what value of R is the width of a bit as long as the length of the link? Answer in bits/s. (The 8th edition says “Referring to problem P24”, but it means the P25 link.)',
    a: 12.5, unit: 'bps',
    why: 'Width of a bit = s/R. Set s/R = m → R = s/m = 2.5 × 10^{8} / 2 × 10^{7} = 12.5 bits/s. At that rate one bit fills the whole 20,000 km link.' },

  { id: 'delay-27', d: 2, type: 'num', src: 'ch1-P27a',
    ctx: 'Same 20,000 km link (propagation speed 2.5 × 10^{8} m/s) as in P25, but now R = 500 Mbps. (The book says “problem P24” but means P25.)',
    q: 'Calculate the bandwidth-delay product, R × d_{prop}. Answer in bits.',
    a: 40000000, unit: 'bits',
    why: 'd_{prop} is unchanged: 2 × 10^{7} / 2.5 × 10^{8} = 0.08 s.\nR × d_{prop} = 5 × 10^{8} × 0.08 = 4 × 10^{7} bits (100 times the 5 Mbps case).' },

  { id: 'delay-28', d: 3, type: 'num', src: 'ch1-P27b',
    ctx: 'Same 20,000 km link (propagation speed 2.5 × 10^{8} m/s) as in P25, but now R = 500 Mbps. (The book says “problem P24” but means P25.)',
    q: 'A file of 800,000 bits is sent continuously as one big message. What is the maximum number of bits that will be in the link at any given time? Answer in bits.',
    a: 800000, unit: 'bits',
    why: 'The link could hold R × d_{prop} = 4 × 10^{7} bits, but the file is only 800,000 bits. The whole file is transmitted in 800,000 / 5 × 10^{8} = 1.6 ms — long before its first bit arrives (80 ms) — so at most the entire file, 800,000 bits, is in the link. Max bits in link = min(file size, R × d_{prop}).' },

  { id: 'delay-29', d: 2, type: 'num', src: 'ch1-P27c',
    ctx: 'Same 20,000 km link (propagation speed 2.5 × 10^{8} m/s) as in P25, but now R = 500 Mbps. (The book says “problem P24” but means P25.)',
    q: 'What is the width of a bit in the link? Answer in m.',
    a: 0.5, unit: 'm',
    why: 'Width = s/R = 2.5 × 10^{8} / 5 × 10^{8} = 0.5 m. Raising R by 100× shrinks each bit by 100× (from 50 m to 0.5 m).' },

  { id: 'delay-30', d: 2, type: 'num', src: 'ch1-P28a',
    ctx: 'Back to the P25 link: Hosts A and B are 20,000 km apart, R = 5 Mbps, propagation speed 2.5 × 10^{8} m/s. A file of 800,000 bits is sent from A to B. (The book says “problem P24” but means P25.)',
    q: 'How long does it take to send the file (until B has received all of it), assuming it is sent continuously? Answer in seconds.',
    a: 0.24, unit: 's',
    why: 'Transmission: 800,000 / 5 × 10^{6} = 0.16 s for the last bit to leave A.\nPropagation: that last bit then needs d_{prop} = 0.08 s.\nTotal = 0.16 + 0.08 = 0.24 s.' },

  { id: 'delay-31', d: 3, type: 'num', src: 'ch1-P28b',
    ctx: 'Back to the P25 link: Hosts A and B are 20,000 km apart, R = 5 Mbps, propagation speed 2.5 × 10^{8} m/s. A file of 800,000 bits is sent from A to B. (The book says “problem P24” but means P25.)',
    q: 'Now the file is broken into 20 packets of 40,000 bits each. Each packet is acknowledged by the receiver, the ACK’s transmission time is negligible, and the sender cannot send a packet until the preceding one is acknowledged. How long does it take to send the file, counting until the sender receives the ACK for the last packet? Answer in seconds.',
    a: 3.36, unit: 's',
    why: 'Per packet: transmit 40,000 / 5 × 10^{6} = 0.008 s, propagate to B 0.08 s, ACK propagates back 0.08 s → 0.168 s.\n20 packets × 0.168 s = 3.36 s.\n(If you stop when B receives the last packet instead of its ACK, subtract one 0.08 s: 3.28 s.)' },

  { id: 'delay-32', d: 3, type: 'short', src: 'ch1-P28c',
    ctx: 'Back to the P25 link: Hosts A and B are 20,000 km apart, R = 5 Mbps, propagation speed 2.5 × 10^{8} m/s. A file of 800,000 bits is sent from A to B. (The book says “problem P24” but means P25.)',
    q: 'Compare the results of sending the file continuously (0.24 s) and sending 20 packets with stop-and-wait acknowledgments (3.36 s). Explain the difference.',
    a: 'Stop-and-wait takes 3.36 s, about 14 times longer than the 0.24 s continuous transfer. Continuous sending pays the propagation delay once, and the total transmission time is the same in both cases (0.16 s). Stop-and-wait pays a full round trip of propagation (2 × 0.08 s = 0.16 s) for every one of the 20 packets, during which the sender sits idle. On a link with a large bandwidth-delay product, waiting for each ACK wastes most of the capacity.',
    keys: ['14|longer|slower', 'round trip|RTT|2 × 0.08|ACK', 'idle|waiting|wait', 'once|single'],
    why: 'Same 0.16 s of transmission in both cases; the difference is 20 round trips of 0.16 s each minus the single 0.08 s. This motivates pipelining (sending multiple packets before ACKs return) in Chapter 3.' },

  { id: 'delay-33', d: 2, type: 'num', src: 'ch1-P29a',
    ctx: 'A 10 Mbps microwave link connects a geostationary satellite (36,000 km above Earth) to its base station on Earth. Every minute the satellite takes a digital photo and sends it to the base station. Assume a propagation speed of 2.4 × 10^{8} m/s.',
    q: 'What is the propagation delay of the link? Answer in ms.',
    a: 150, unit: 'ms',
    why: 'd_{prop} = 3.6 × 10^{7} m / 2.4 × 10^{8} m/s = 0.15 s = 150 ms (one way, satellite to base station).' },

  { id: 'delay-34', d: 2, type: 'num', src: 'ch1-P29b',
    ctx: 'A 10 Mbps microwave link connects a geostationary satellite (36,000 km above Earth) to its base station on Earth. Every minute the satellite takes a digital photo and sends it to the base station. Assume a propagation speed of 2.4 × 10^{8} m/s.',
    q: 'What is the bandwidth-delay product, R × d_{prop}? Answer in bits.',
    a: 1500000, unit: 'bits',
    why: 'R × d_{prop} = 10^{7} bits/s × 0.15 s = 1.5 × 10^{6} bits in flight on the link.' },

  { id: 'delay-35', d: 3, type: 'num', src: 'ch1-P29c',
    ctx: 'A 10 Mbps microwave link connects a geostationary satellite (36,000 km above Earth) to its base station on Earth. Every minute the satellite takes a digital photo and sends it to the base station. Assume a propagation speed of 2.4 × 10^{8} m/s.',
    q: 'Let x denote the size of the photo. What is the minimum value of x for the microwave link to be continuously transmitting? Answer in bits.',
    a: 600000000, unit: 'bits',
    why: 'A new photo is produced every 60 s. For the link never to go idle, transmitting one photo must take at least 60 s: x/R ≥ 60 s → x ≥ 10^{7} × 60 = 6 × 10^{8} bits (75 MB). Propagation delay does not matter here — it delays the stream but does not idle the transmitter.' },

  // ---------- Queuing and traffic intensity ----------
  { id: 'delay-36', d: 1, type: 'tf', src: 'text',
    q: 'True or false: a golden rule of traffic engineering is to design the system so that the traffic intensity La/R is no greater than 1.',
    a: true,
    why: 'True. If La/R > 1, bits arrive on average faster than the link can send them, the queue grows without bound and queuing delay approaches infinity (or, with a real finite buffer, packets are dropped).' },

  { id: 'delay-37', d: 2, type: 'num', src: 'text',
    q: '1,000-byte packets arrive at a router at an average rate of 1,100 packets/s, destined for a 10 Mbps outbound link. What is the traffic intensity? Answer as a decimal.',
    a: 0.88, unit: '',
    why: 'L = 8,000 bits; a = 1,100 packets/s → La = 8.8 × 10^{6} bits/s.\nLa/R = 8.8 × 10^{6} / 10^{7} = 0.88. Below 1, so the queue is stable, but close enough to 1 that the average queuing delay will be noticeable.' },

  { id: 'delay-38', d: 2, type: 'mc', src: 'ch1-R21',
    ctx: 'Adapted from R21 (the queuing-and-loss animation): packets are emitted at a maximum rate of 500 packets/s into a router whose output link has a minimum transmission rate of 350 packets/s; the buffer is finite and packets are emitted at random times.',
    q: 'What is the traffic intensity, and if you run the experiment twice, does packet loss begin at the same time in both runs?',
    choices: [
      '≈ 1.43; loss eventually occurs in both runs, but the time until the first loss differs because the emission process is random',
      '≈ 0.70; no loss ever occurs',
      '≈ 1.43; loss always begins at exactly the same instant',
      '≈ 0.70; loss begins immediately'
    ],
    a: 0,
    why: 'Traffic intensity = arrival rate ÷ service rate = 500 / 350 ≈ 1.43 > 1, so the queue builds up and the finite buffer eventually overflows in every run. Because arrivals are random, the queue fills at a different pace each time, so the time to first loss varies between runs. (0.70 is the inverted ratio.)' },

  { id: 'delay-39', d: 2, type: 'mc', src: 'text',
    q: 'Packets of L bits arrive perfectly periodically, exactly one every L/R seconds, at a link of rate R (so La/R = 1). What is the queuing delay?',
    choices: [
      'Infinite, because La/R = 1',
      '(N − 1)L/(2R)',
      'Zero: each packet arrives just as the previous one finishes, so it always finds an empty queue',
      'L/R for every packet'
    ],
    a: 2,
    why: 'The textbook’s point: with La/R ≤ 1, the nature of the arrivals matters. Perfectly periodic arrivals at one per L/R never overlap, so no packet waits. The same average rate delivered in bursts would cause queuing. The “intensity near 1 → huge delay” curve applies to random arrivals.' },

  { id: 'delay-40', d: 2, type: 'mc', src: 'text',
    q: 'With random arrivals, traffic intensity on a link rises from 0.90 to 0.95 (about a 5% increase). What happens to the average queuing delay, per Figure 1.18?',
    choices: [
      'It rises by about 5%',
      'It falls, because the link is used more efficiently',
      'It stays the same until La/R exceeds 1',
      'It increases by a much larger percentage — delay rises steeply as La/R approaches 1'
    ],
    a: 3,
    why: 'Near 1, “a small percentage increase in the intensity will result in a much larger percentage-wise increase in delay.” Using P14’s model (queuing delay ∝ I/(1 − I)): 0.90/0.10 = 9 vs 0.95/0.05 = 19 — the delay roughly doubles for a 5% rise in load.' },

  { id: 'delay-41', d: 2, type: 'num', src: 'text',
    q: 'Eight 1,500-byte packets arrive at the same instant at an idle 12 Mbps link. What is their average queuing delay? Answer in ms.',
    a: 3.5, unit: 'ms',
    why: 'L/R = 12,000 / 12 × 10^{6} = 1 ms.\nQueuing delays: 0, 1, 2, …, 7 ms → average = (0 + 1 + … + 7)/8 = 28/8 = 3.5 ms.\nFormula: (N − 1)L/(2R) = 7 × 1 ms / 2 = 3.5 ms.' },

  { id: 'delay-42', d: 3, type: 'mc', src: 'ch1-P13a',
    q: 'N packets arrive simultaneously at a link at which no packets are currently being transmitted or queued. Each packet has length L and the link rate is R. What is the average queuing delay for the N packets?',
    choices: ['(N − 1)L/(2R)', 'NL/(2R)', '(N − 1)L/R', 'L/(2R)'],
    a: 0,
    why: 'The nth packet transmitted waits for n − 1 others: (n − 1)L/R. Average over n = 1…N: (L/R)·(0 + 1 + … + (N − 1))/N = (L/R)·(N − 1)N/2 / N = (N − 1)L/(2R). (N − 1)L/R is the last packet’s wait, not the average.' },

  { id: 'delay-43', d: 3, type: 'mc', src: 'ch1-P13b',
    q: 'Now suppose N such packets (length L, link rate R) arrive together every LN/R seconds. What is the average queuing delay of a packet?',
    choices: [
      'It grows without bound, because La/R = 1',
      '(N − 1)L/(2R) — each batch finds an empty queue because the previous batch takes exactly NL/R to transmit',
      'Zero, because the arrivals are periodic',
      'NL/R'
    ],
    a: 1,
    why: 'Transmitting a batch takes N·L/R, exactly the time until the next batch arrives, so every batch sees the same situation as in part (a): average (N − 1)L/(2R). Here La/R = 1, yet the delay is finite, because the arrivals are deterministic; and it is not zero, because they are bursty.' },

  { id: 'delay-44', d: 2, type: 'num', src: 'ch1-P12',
    ctx: 'A packet switch receives a packet and determines its outbound link. When the packet arrives, one other packet is halfway done being transmitted on this outbound link and four other packets are waiting to be transmitted. Packets are transmitted in order of arrival. All packets are 1,500 bytes and the link rate is 2.5 Mbps.',
    q: 'What is the queuing delay for the packet? Answer in ms.',
    a: 21.6, unit: 'ms',
    why: 'L/R = 12,000 / 2.5 × 10^{6} = 4.8 ms per packet.\nRemaining half of the current packet: 2.4 ms. Four waiting packets: 4 × 4.8 = 19.2 ms.\nQueuing delay = 2.4 + 19.2 = 21.6 ms. (In bits: (4 × 12,000 + 6,000) / 2.5 × 10^{6} = 54,000 / 2.5 × 10^{6}.)' },

  { id: 'delay-45', d: 2, type: 'mc', src: 'ch1-P12',
    ctx: 'A packet switch receives a packet and determines its outbound link. When the packet arrives, one other packet is halfway done being transmitted on this outbound link and four other packets are waiting to be transmitted. Packets are transmitted in order of arrival. All packets are 1,500 bytes and the link rate is 2.5 Mbps.',
    q: 'More generally, what is the queuing delay when all packets have length L, the transmission rate is R, x bits of the currently-being-transmitted packet have been transmitted, and n packets are already in the queue?',
    choices: ['(nL + x)/R', '(n + 1)L/R', '[nL + (L − x)]/R', 'nL/R'],
    a: 2,
    why: 'The arriving packet must wait for the untransmitted rest of the current packet, L − x bits, and for all n queued packets, nL bits: [nL + (L − x)]/R. Check with the numbers: n = 4, x = L/2 → 4.5 × 4.8 ms = 21.6 ms.' },

  { id: 'delay-46', d: 3, type: 'mc', src: 'ch1-P14a',
    ctx: 'Let I = La/R denote the traffic intensity, and suppose the queuing delay takes the form I·L / [R(1 − I)] for I < 1.',
    q: 'What is the total delay, i.e., queuing delay plus transmission delay?',
    choices: ['(L/R) / (1 − I)', 'I·L / [R(1 − I)]', 'L/R + I', '(L/R)(1 − I)'],
    a: 0,
    why: 'Total = I·(L/R)/(1 − I) + L/R = (L/R)·[I/(1 − I) + (1 − I)/(1 − I)] = (L/R)/(1 − I). Check: I = 0 gives just L/R (no waiting); I → 1 gives infinity. I·L/[R(1 − I)] is the queuing part only.' },

  { id: 'delay-47', d: 3, type: 'short', src: 'ch1-P14b',
    ctx: 'Let I = La/R denote the traffic intensity, and suppose the queuing delay takes the form I·L / [R(1 − I)] for I < 1.',
    q: 'Describe the plot of the total delay as a function of L/R (keep the packet arrival rate a fixed).',
    a: 'Let x = L/R. Because I = La/R = a·x, the total delay is x/(1 − a·x). It starts at 0 when x = 0, grows roughly linearly for small x (where it is about x, the transmission delay), then curves sharply upward and goes to infinity as x approaches 1/a, i.e., as the traffic intensity approaches 1. For x ≥ 1/a the queue is unstable and the formula no longer applies.',
    keys: ['1 − ax|1 - ax|1 − I|1 - I', 'increases|grows|rises', 'infinity|∞|unbounded|blows up', '1/a|approaches 1|I → 1|I = 1'],
    why: 'Same shape as Figure 1.18 (delay vs traffic intensity), because with a fixed a, L/R and I are proportional. The vertical asymptote sits at L/R = 1/a: a packet’s service time equals the mean gap between arrivals.' },

  { id: 'delay-48', d: 3, type: 'mc', src: 'ch1-P15',
    q: 'Let a denote the packet arrival rate (packets/s) and μ the link’s transmission rate in packets/s. Using the total delay (L/R)/(1 − I) from P14, what is the total delay in terms of a and μ?',
    choices: ['a/(μ − a)', '1/μ', 'μ/(μ − a)', '1/(μ − a)'],
    a: 3,
    why: 'μ = R/L, so L/R = 1/μ and I = La/R = a/μ.\nTotal = (1/μ)/(1 − a/μ) = 1/(μ − a).\nExample: μ = 1,000 packets/s, a = 900 packets/s → 1/100 s = 10 ms; at a = 990 it is 100 ms.' },

  { id: 'delay-49', d: 3, type: 'num', src: 'ch1-P16',
    q: 'Little’s formula: N = a·d, where N = average number of packets in the buffer plus the packet being transmitted, a = packet arrival rate, and d = average total delay (queuing + transmission). On average the buffer contains 100 packets, the average queuing delay is 20 ms, and the link transmits 100 packets/s. Using Little’s formula and assuming no loss, what is the average packet arrival rate? Answer in packets/s.',
    a: 3366.67, unit: 'packets/s',
    why: 'N counts the packet being transmitted too: N = 100 + 1 = 101.\nd = queuing + transmission = 20 ms + 1/100 s = 20 + 10 = 30 ms = 0.03 s.\na = N/d = 101 / 0.03 ≈ 3,366.7 packets/s.\nTraps: using N = 100 and d = 20 ms gives 5,000. Note: these textbook numbers are not physically consistent (a sustained 3,367 packets/s exceeds the 100 packets/s link and could not run without loss); the exercise tests the method N = a·d.' },

  // ---------- Packet loss ----------
  { id: 'delay-50', d: 2, type: 'multi', src: 'text',
    q: 'Which statements about packet loss are true? Select all that apply.',
    choices: [
      'It occurs when an arriving packet finds the finite buffer full',
      'The fraction of lost packets increases as traffic intensity increases',
      'From the end system’s viewpoint, a lost packet entered the network core but never emerged at the destination',
      'A lost packet may be retransmitted on an end-to-end basis',
      'Loss is caused mainly by long propagation distances',
      'With finite buffers, delay truly approaches infinity as traffic intensity approaches 1'
    ],
    a: [0, 1, 2, 3],
    why: 'Loss = buffer overflow, and it gets worse as intensity rises, so node performance is measured by delay and loss probability. Distance causes propagation delay, not loss. Because buffers are finite, delay does not really go to infinity — packets get dropped instead.' },

  { id: 'delay-51', d: 3, type: 'mc', src: 'ch1-P22a',
    ctx: 'Figure 1.19(b): N links between the server and the client. Each link has packet-loss probability p, independently of the others. If a packet is lost anywhere on the path, the server retransmits it.',
    q: 'What is the probability that a packet sent by the server is successfully received?',
    choices: ['1 − p^{N}', '(1 − p)^{N}', '1 − N·p', 'p^{N}'],
    a: 1,
    why: 'The packet must survive every link: (1 − p) on each of N independent links → (1 − p)^{N}. 1 − p^{N} would be “not lost on all links”, which is wrong; 1 − Np is only an approximation for tiny p.' },

  { id: 'delay-52', d: 3, type: 'num', src: 'ch1-P22b',
    ctx: 'Figure 1.19(b): N links between the server and the client. Each link has packet-loss probability p, independently of the others. If a packet is lost anywhere on the path, the server retransmits it.',
    q: 'On average, how many times will the server re-transmit a packet before the client receives it? Evaluate the general formula for N = 4 links and p = 0.05. Answer as a decimal.',
    a: 0.2277, unit: '',
    why: 'Success probability per attempt: p_{s} = (1 − p)^{N} = 0.95^{4} ≈ 0.8145.\nThe number of transmissions until success is geometric with mean 1/p_{s} ≈ 1.2277.\nRetransmissions = transmissions − 1 = 1/(1 − p)^{N} − 1 ≈ 0.2277.\nTrap: answering 1.23 counts the original transmission as a retransmission.' },

  // ---------- End-to-end delay ----------
  { id: 'delay-53', d: 2, type: 'num', src: 'text',
    q: 'A path has 5 links (4 routers). Packets are 1,000 bytes; every link is 50 Mbps and 600 km long with propagation speed 2 × 10^{8} m/s; every transmitting node has a processing delay of 50 μs; there is no queuing. Using d_{end-end} = N(d_{proc} + d_{trans} + d_{prop}), what is the end-to-end delay? Answer in ms.',
    a: 16.05, unit: 'ms',
    why: 'd_{trans} = 8,000 / 5 × 10^{7} = 0.16 ms.\nd_{prop} = 6 × 10^{5} / 2 × 10^{8} = 3 ms.\nd_{proc} = 0.05 ms.\nd_{end-end} = 5 × (0.05 + 0.16 + 3) = 5 × 3.21 = 16.05 ms.\nTrap: N is the number of links (routers + 1), not the number of routers.' },

  { id: 'delay-54', d: 2, type: 'mc', src: 'ch1-P2',
    q: 'Equation 1.1 gives the end-to-end delay N·L/R for one packet of length L over N links of rate R (store-and-forward, ignoring propagation, processing and queuing). Generalize it to P such packets sent back-to-back over the N links.',
    choices: ['N·P·L/R', '(N + P − 1)·L/R', '(N + P)·L/R', 'N·L/R + P'],
    a: 1,
    why: 'The first packet arrives after N·L/R. Behind it the packets move like a pipeline: each following packet arrives L/R after the one before, adding (P − 1)·L/R. Total = (N + P − 1)·L/R. Example: N = 3, P = 4, L = 1,500 bytes, R = 10 Mbps → 6 × 1.2 ms = 7.2 ms, versus 14.4 ms if you wrongly use N·P·L/R (no pipelining).' },

  { id: 'delay-55', d: 3, type: 'mc', src: 'ch1-P10a',
    ctx: 'A packet of length L starts at end system A and travels over three links to a destination end system; the links are connected by two packet switches. Link i has length d_{i}, propagation speed s_{i} and transmission rate R_{i} (i = 1, 2, 3). Each packet switch delays each packet by d_{proc}. No queuing; store-and-forward.',
    q: 'What is the total end-to-end delay?',
    choices: [
      'L/R_{1} + d_{1}/s_{1} + d_{2}/s_{2} + d_{3}/s_{3} + 2·d_{proc}',
      '3·L/R_{1} + d_{1}/s_{1} + d_{2}/s_{2} + d_{3}/s_{3} + 3·d_{proc}',
      'L/R_{1} + L/R_{2} + L/R_{3} + d_{1}/s_{1} + d_{2}/s_{2} + d_{3}/s_{3} + 3·d_{proc}',
      'L/R_{1} + L/R_{2} + L/R_{3} + d_{1}/s_{1} + d_{2}/s_{2} + d_{3}/s_{3} + 2·d_{proc}'
    ],
    a: 3,
    why: 'Store-and-forward: the packet is transmitted onto each of the three links (L/R_{i} each, at that link’s own rate) and propagates across each (d_{i}/s_{i}). Only the two packet switches add d_{proc} (the problem gives no processing at the end systems). The choice with a single L/R_{1} forgets that each switch retransmits the packet; 3·L/R_{1} wrongly assumes equal rates; 3·d_{proc} counts a third switch that does not exist.' },

  { id: 'delay-56', d: 3, type: 'num', src: 'ch1-P10b',
    ctx: 'A packet of length L starts at end system A and travels over three links to a destination end system; the links are connected by two packet switches. Link i has length d_{i}, propagation speed s_{i} and transmission rate R_{i} (i = 1, 2, 3). Each packet switch delays each packet by d_{proc}. No queuing; store-and-forward.',
    q: 'Now the packet is 1,500 bytes, the propagation speed on all three links is 2.5 × 10^{8} m/s, all three links are 2.5 Mbps, the switch processing delay is 3 ms, and the links are 5,000 km, 4,000 km and 1,000 km long. What is the end-to-end delay? Answer in ms.',
    a: 60.4, unit: 'ms',
    why: 'Transmission: 12,000 / 2.5 × 10^{6} = 4.8 ms per link × 3 = 14.4 ms.\nPropagation: 5 × 10^{6}/2.5 × 10^{8} = 20 ms; 4 × 10^{6}/2.5 × 10^{8} = 16 ms; 10^{6}/2.5 × 10^{8} = 4 ms → 40 ms.\nProcessing: 2 switches × 3 ms = 6 ms.\nTotal = 14.4 + 40 + 6 = 60.4 ms.' },

  { id: 'delay-57', d: 3, type: 'num', src: 'ch1-P11',
    ctx: 'Same path as P10: 1,500-byte packet, three links of 5,000 km, 4,000 km and 1,000 km, propagation speed 2.5 × 10^{8} m/s on all links. Now R_{1} = R_{2} = R_{3} = 2.5 Mbps and d_{proc} = 0.',
    q: 'Suppose the packet switches do not store-and-forward: they immediately transmit each bit they receive, without waiting for the entire packet. What is the end-to-end delay? Answer in ms.',
    a: 44.8, unit: 'ms',
    why: 'Without store-and-forward (and with equal rates), the bits stream straight through the switches, so the packet’s transmission time is paid only once: L/R = 4.8 ms. Propagation still adds up over all links: 20 + 16 + 4 = 40 ms.\nTotal = 4.8 + 40 = 44.8 ms (versus 60.4 ms with store-and-forward and 3 ms processing).' },

  { id: 'delay-58', d: 3, type: 'mc', src: 'ch1-P17a',
    q: 'Generalize Equation 1.2, d_{end-end} = N(d_{proc} + d_{trans} + d_{prop}), to heterogeneous processing delays, transmission rates and propagation delays at the N nodes/links.',
    choices: [
      'Σ_{i=1..N} (d_{proc,i} + L/R_{i} + d_{prop,i})',
      'N·(d_{proc} + d_{trans} + d_{prop}) using the largest value of each',
      'Σ_{i=1..N} d_{prop,i} + L/min_{i}R_{i}',
      'N·max_{i}(d_{proc,i} + L/R_{i} + d_{prop,i})'
    ],
    a: 0,
    why: 'Each node i adds its own processing, its own transmission delay L/R_{i} onto its outgoing link, and that link’s propagation delay; with store-and-forward these simply add. Σ d_{prop,i} + L/min R_{i} mixes in the throughput (bottleneck) mindset; the “largest value” and “max” choices overestimate.' },

  { id: 'delay-59', d: 2, type: 'short', src: 'ch1-P17b',
    q: 'Extend the heterogeneous end-to-end delay formula to include an average queuing delay d_{queue} at each node. Write the formula and say what each term is.',
    a: 'd_{end-end} = Σ_{i=1..N} (d_{proc,i} + d_{queue,i} + L/R_{i} + d_{prop,i}). For each of the N nodes on the path (the source and each router): its processing delay, its average queuing delay, its transmission delay onto the next link (packet length over that link’s rate), and that link’s propagation delay (length over propagation speed).',
    keys: ['sum|Σ|add', 'queue|queuing', 'L/R', 'prop|propagation|d/s', 'proc|processing'],
    why: 'It is just the nodal delay d_{proc} + d_{queue} + d_{trans} + d_{prop} summed hop by hop. If every hop is identical it collapses to N(d_{proc} + d_{queue} + d_{trans} + d_{prop}).' },

  { id: 'delay-60', d: 3, type: 'num', src: 'ch1-P7',
    q: 'VoIP: Host A converts analog voice to a digital 64 kbps bit stream on the fly and groups the bits into 56-byte packets. There is one link between Hosts A and B; its transmission rate is 10 Mbps and its propagation delay is 10 ms. As soon as A gathers a packet it sends it; as soon as B receives an entire packet it converts the bits to an analog signal. How much time elapses from when a bit is created at A until it is decoded at B? Answer in ms.',
    a: 17.0448, unit: 'ms', tol: 0.005,
    why: 'Consider the first bit of a packet.\nPacketization: it waits until the whole packet is filled: 56 × 8 = 448 bits / 64,000 bps = 7 ms.\nTransmission: 448 / 10^{7} = 44.8 μs = 0.0448 ms.\nPropagation: 10 ms.\nTotal = 7 + 0.0448 + 10 = 17.0448 ms. The packetization delay is a big chunk — the media packetization delay of §1.4.3.' },

  { id: 'delay-61', d: 2, type: 'multi', src: 'text',
    q: 'Which of these are end-system or application delays, beyond the four nodal delays at routers? Select all that apply.',
    choices: [
      'Media packetization delay: a VoIP sender filling a packet with encoded speech before sending',
      'A WiFi or cable-modem host purposely delaying its transmission to share the medium',
      'Propagation delay across a transatlantic fiber',
      'Queuing delay in a congested core router'
    ],
    a: [0, 1],
    why: 'The textbook lists these two additional end-system delays: deliberate delays in shared-medium protocols (Chapter 6) and VoIP packetization delay (which can hurt call quality). Propagation and queuing in the network are ordinary nodal delays.' },

  // ---------- RTT and Traceroute ----------
  { id: 'delay-62', d: 1, type: 'mc', src: 'cheat',
    q: 'Which is the lecture’s definition of RTT (round-trip time)?',
    choices: [
      'The time to transmit a whole file one way',
      'The one-way propagation delay only',
      'The time for a small packet to travel client → server → client; it includes propagation, queuing and processing delays',
      'The transmission delay of an acknowledgment'
    ],
    a: 2,
    why: 'RTT is measured with a small packet, so transmission time is negligible and the RTT is made of propagation, queuing and processing delays in both directions. It is the unit of HTTP timing (e.g., 2 RTTs + file transmission time for non-persistent HTTP).' },

  { id: 'delay-63', d: 1, type: 'mc', src: 'text',
    q: 'For each router on the path, what does Traceroute report?',
    choices: [
      'Its full forwarding table',
      'Only the one-way propagation delay to it',
      'Its current queue length',
      'Its hop number, name and IP address, and three round-trip delays from the source'
    ],
    a: 3,
    why: 'Each router that receives its probe sends back a message with its name and address; the source times the round trip. The experiment runs three times, so each line shows three RTTs (an asterisk marks a probe with no reply).' },

  { id: 'delay-64', d: 2, type: 'num', src: 'text',
    q: 'There are 9 routers on the path from a source to a destination. With Traceroute’s standard three trials, how many probe packets does the source send in total?',
    a: 30, unit: 'packets',
    why: 'With N − 1 routers the source sends N special packets per trial — one for each router plus one that reaches the destination host. 9 routers → N = 10 per trial; × 3 trials = 30 (3·N).' },

  { id: 'delay-65', d: 2, type: 'mc', src: 'text',
    q: 'In the textbook’s Traceroute from UMass to the Sorbonne, the round-trip delay to router 12 is smaller than to router 11, even though router 12 is farther away. Why?',
    choices: [
      'Router 12 is physically closer to the source than router 11',
      'Router 11 uses a slower link technology',
      'Queuing delays vary over time, so a probe to a later router can see less queuing than a probe to an earlier one',
      'Traceroute reports one-way delays, which are not additive'
    ],
    a: 2,
    why: 'Each probe is a separate packet sent at a different moment, and the RTT includes queuing delay, which varies with congestion. So RTT(n) > RTT(n + 1) is possible. Traceroute reports round-trip, not one-way, delays.' },

  { id: 'delay-66', d: 3, type: 'mc', src: 'text',
    ctx: 'Two lines of the textbook’s Traceroute (UMass → Paris):\n7  nox300gw1-umass-re.nox.org (192.5.89.101)  3.165 ms  7.326 ms  7.311 ms\n8  198.71.45.237 (198.71.45.237)  77.826 ms  77.246 ms  77.744 ms',
    q: 'Roughly what one-way propagation delay does the link between routers 7 and 8 contribute?',
    choices: ['About 72 ms', 'About 36 ms', 'About 78 ms', 'About 0.7 ms'],
    a: 1,
    why: 'Average RTT to router 7 ≈ (3.165 + 7.326 + 7.311)/3 ≈ 5.9 ms; to router 8 ≈ 77.6 ms. The difference, about 71.7 ms, is a round trip across the new link, so one way ≈ 36 ms. This is the transatlantic fiber link the textbook points out. 72 ms forgets that RTT covers both directions; 78 ms is the whole RTT from the source.' },

  // ---------- Throughput ----------
  { id: 'delay-67', d: 1, type: 'mc', src: 'text',
    q: 'A file of F bits takes T seconds for Host B to receive completely. What is the average throughput of the transfer?',
    choices: ['F/T bits/s', 'T/F bits/s', 'F × T bits/s', 'Always min{R_{s}, R_{c}}'],
    a: 0,
    why: 'Average throughput = F/T bits/s. Instantaneous throughput is the rate at which B is receiving at a particular instant. min{R_{s}, R_{c}} is the ideal throughput predicted by the bottleneck model, not the definition.' },

  { id: 'delay-68', d: 1, type: 'mc', src: 'text',
    q: 'With no other traffic, what is the end-to-end throughput of a path whose links have rates R_{1}, R_{2}, …, R_{N}?',
    choices: ['max{R_{1}, …, R_{N}}', 'R_{1} + R_{2} + … + R_{N}', 'min{R_{1}, …, R_{N}}', 'The average of the rates'],
    a: 2,
    why: 'Bits flow like fluid through pipes: the narrowest pipe — the bottleneck link — limits the flow. Throughput = min{R_{1}, …, R_{N}}.' },

  { id: 'delay-69', d: 1, type: 'tf', src: 'text',
    q: 'True or false: in today’s Internet, the constraining factor for throughput is typically the access network, because the core is over-provisioned with high-speed links.',
    a: true,
    why: 'True. With a core of very fast, lightly congested links, throughput ≈ min{R_{s}, R_{c}} — the server’s or client’s access link. The exception is when many flows share a core link (Figure 1.20b).' },

  { id: 'delay-70', d: 2, type: 'multi', src: 'text',
    q: 'Which statements about throughput are true? Select all that apply.',
    choices: [
      'Instantaneous throughput is the rate at which the receiver is getting bits at a given instant',
      'Some Internet telephony applications need an instantaneous throughput consistently above about 24 kbps',
      'File transfers are delay-tolerant but want the highest possible throughput',
      'Throughput is determined by the propagation speed of the medium',
      'If R_{s} > R_{c} and the server keeps sending at R_{s}, the backlog at the router keeps growing'
    ],
    a: [0, 1, 2, 4],
    why: 'Thresholds from the textbook: over 24 kbps for some telephony, over 256 kbps for some real-time video. Propagation speed affects delay, not throughput. When the server pumps faster than the router can forward (R_{s} > R_{c}), bits pile up at the router — “a most undesirable situation.”' },

  { id: 'delay-71', d: 1, type: 'num', src: 'ch1-R19',
    ctx: 'Host A sends a large file to Host B over a path of three links with rates R_{1} = 500 kbps, R_{2} = 2 Mbps and R_{3} = 1 Mbps. Assume no other traffic in the network.',
    q: '(a) What is the throughput for the file transfer? Answer in kbps.',
    a: 500, unit: 'kbps',
    why: 'Throughput = min{500 kbps, 2,000 kbps, 1,000 kbps} = 500 kbps — the bottleneck is link 1.' },

  { id: 'delay-72', d: 2, type: 'num', src: 'ch1-R19',
    ctx: 'Host A sends a large file to Host B over a path of three links with rates R_{1} = 500 kbps, R_{2} = 2 Mbps and R_{3} = 1 Mbps. Assume no other traffic in the network.',
    q: '(b) The file is 4 million bytes. Dividing the file size by the throughput, roughly how long does the transfer take? Answer in seconds.',
    a: 64, unit: 's',
    why: 'F = 4 × 10^{6} bytes × 8 = 3.2 × 10^{7} bits.\nT = 3.2 × 10^{7} / 5 × 10^{5} = 64 s.\nForgetting × 8 gives 8 s.' },

  { id: 'delay-73', d: 2, type: 'num', src: 'ch1-R19',
    ctx: 'Host A sends a large file to Host B over a path of three links with rates R_{1} = 500 kbps, R_{2} = 2 Mbps and R_{3} = 1 Mbps. Assume no other traffic in the network.',
    q: '(c) Repeat with R_{2} reduced to 100 kbps. Roughly how long does the 4-million-byte transfer take now? Answer in seconds.',
    a: 320, unit: 's',
    why: 'New throughput = min{500, 100, 1,000} kbps = 100 kbps — link 2 is now the bottleneck.\nT = 3.2 × 10^{7} bits / 10^{5} bits/s = 320 s.' },

  { id: 'delay-74', d: 2, type: 'num', src: 'text',
    q: 'Ten client–server pairs download simultaneously. Each server’s access link is R_{s} = 2 Mbps, each client’s access link is R_{c} = 1 Mbps, and all ten downloads cross one core link of R = 5 Mbps that divides its rate equally; all other links are much faster and there is no other traffic. What is the throughput of each download? Answer in kbps.',
    a: 500, unit: 'kbps',
    why: 'Each download gets min{R_{s}, R_{c}, R/10} = min{2 Mbps, 1 Mbps, 0.5 Mbps} = 500 kbps. The bottleneck has moved from the access network into the core, even though the core link (5 Mbps) is faster than any access link — because 10 flows share it.' },

  { id: 'delay-75', d: 2, type: 'mc', src: 'ch1-P20',
    q: 'Generalize the Figure 1.20(b) example to M client–server pairs. Server links have rate R_{s}, client links R_{c}, and the shared network link R; all other links have abundant capacity, and there is no other traffic. What is the throughput of each download?',
    choices: ['min{R_{s}, R_{c}, R}', 'min{R_{s}, R_{c}}/M', 'R/M', 'min{R_{s}, R_{c}, R/M}'],
    a: 3,
    why: 'Each flow is limited by its server link, its client link, and its equal share R/M of the common link. Example: R_{s} = 2, R_{c} = 1, R = 5 Mbps: M = 10 → 0.5 Mbps (core is the bottleneck); M = 4 → min{2, 1, 1.25} = 1 Mbps (the client access link is the bottleneck again). R/M alone ignores the access links; dividing min{R_{s}, R_{c}} by M wrongly shares the access links, which are not shared.' },

  { id: 'delay-76', d: 3, type: 'short', src: 'ch1-P21',
    q: 'In Figure 1.19(b), suppose there are M paths between the server and the client and no two paths share any link. Path k (k = 1, …, M) consists of N links with rates R^{k}_{1}, R^{k}_{2}, …, R^{k}_{N}. If the server can use only one path, what is the maximum throughput it can achieve? If it can use all M paths?',
    a: 'One path: each path’s throughput is its bottleneck, min_{i} R^{k}_{i}, so the best single path gives max over k of min_{i} R^{k}_{i}. All M paths at once: the disjoint paths work in parallel, so the throughputs add: Σ_{k=1..M} min_{i} R^{k}_{i}.',
    keys: ['max|maximum|largest', 'min|bottleneck', 'sum|Σ|add', 'disjoint|parallel|each path'],
    why: 'Inside a path, rates combine by min (the bottleneck); across disjoint parallel paths, throughputs add. Choosing one path means picking the one with the largest bottleneck.' },

  { id: 'delay-77', d: 3, type: 'mc', src: 'ch1-P23a',
    ctx: 'Figure 1.19(a): server → router → client. The first link has rate R_{s}, the second R_{c}; both links have propagation delay d_{prop}. Packets are L bits and there is no other traffic.',
    q: 'The bottleneck is the first link (R_{s} < R_{c}). The server sends two packets back to back. What is the packet inter-arrival time at the destination, i.e., from when the last bit of the first packet arrives until the last bit of the second packet arrives?',
    choices: ['L/R_{s}', 'L/R_{c}', 'L/R_{s} + L/R_{c}', 'd_{prop}'],
    a: 0,
    why: 'The last bits leave the server L/R_{s} apart. At the router, packet 1 finishes on the faster second link (L/R_{c} < L/R_{s}) before packet 2 has fully arrived, so packet 2 never queues; both packets then experience identical delays, and the spacing L/R_{s} is preserved at the client. The bottleneck link sets the spacing — the basis of “packet-pair” bandwidth probing.' },

  { id: 'delay-78', d: 3, type: 'short', src: 'ch1-P23b',
    ctx: 'Figure 1.19(a): server → router → client. The first link has rate R_{s}, the second R_{c}; both links have propagation delay d_{prop}. Packets are L bits and there is no other traffic.',
    q: 'Now the second link is the bottleneck (R_{c} < R_{s}). Is it possible that the second packet queues at the input queue of the second link? Explain. If the server waits T seconds after finishing the first packet before starting the second, how large must T be to ensure no queuing before the second link?',
    a: 'Yes. Sent back to back, packet 2 is completely at the router at 2L/R_{s} + d_{prop}, but packet 1 does not finish on link 2 until L/R_{s} + d_{prop} + L/R_{c}, which is later because L/R_{c} > L/R_{s} — so packet 2 must wait. If packet 2 starts T seconds after packet 1 finishes, it is fully at the router at 2L/R_{s} + T + d_{prop}. No queuing requires 2L/R_{s} + T + d_{prop} ≥ L/R_{s} + d_{prop} + L/R_{c}, i.e., T ≥ L/R_{c} − L/R_{s} (equivalently, start-to-start spacing of at least L/R_{c}).',
    keys: ['yes', 'L/R_c|L/Rc|L/R_{c}', 'L/R_c − L/R_s|L/Rc - L/Rs|L/R_c - L/R_s|L/Rc − L/Rs|L/R_{c} − L/R_{s}', 'wait|queue|busy'],
    why: 'Packets arrive at the router every L/R_{s} but leave only every L/R_{c}. To avoid a queue, packets must be spaced at least L/R_{c} apart start-to-start; back-to-back sending already gives L/R_{s}, so the extra gap is L/R_{c} − L/R_{s}. (If T is measured from the start of the first packet instead, the condition is T ≥ L/R_{c}.)' },

  { id: 'delay-79', d: 2, type: 'mc', src: 'ch1-P24',
    q: 'You must urgently deliver 50 terabytes of data from Boston to Los Angeles. You have a dedicated 100 Mbps link. Would you prefer to transmit the data over the link or use FedEx overnight delivery?',
    choices: [
      'The link: it needs only about 4,000 s ≈ 1.1 hours',
      'FedEx: the link would need about 4 × 10^{6} s ≈ 46 days',
      'The link: it needs about 4.6 days',
      'FedEx, because the link needs about 5.8 days'
    ],
    a: 1,
    why: '50 TB = 50 × 10^{12} bytes × 8 = 4 × 10^{14} bits.\nT = 4 × 10^{14} / 10^{8} bps = 4 × 10^{6} s ≈ 46.3 days — overnight shipping wins easily.\n5.8 days is what you get if you forget × 8 (FedEx still wins, but the number is wrong); the other options are factor-of-10 slips.' }
]);
