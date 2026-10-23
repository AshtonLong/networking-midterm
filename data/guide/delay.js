NET.addSection({
  id: 'delay',
  unit: 1,
  order: 6,
  title: 'Delay, loss & throughput',
  short: 'Delay & throughput',
  cheat: 'p.64–67 (L/R), p.83–89 (RTT)',
  text: '§1.4',
  minutes: 55,
  summary: 'The four per-hop delays (processing, queuing, transmission L/R, propagation d/s), how they add up over N links, why queuing delay explodes as traffic intensity La/R approaches 1 and when packets are dropped, and how end-to-end throughput is set by the bottleneck link. This is the most calculation-heavy part of Chapter 1: expect several numeric questions, and most mistakes are unit slips (bytes vs bits, ms vs s) or mixing up transmission and propagation.',
  mustKnow: [
    'd_{nodal} = [[d_{proc} + d_{queue} + d_{trans} + d_{prop}]].',
    'Transmission delay d_{trans} = [[L/R]]: time to push all of a packet’s bits onto the link. Depends on packet length and link rate — [[not on distance]].',
    'Propagation delay d_{prop} = [[d/s]], with s ≈ [[2–3 × 10^{8} m/s]]. Depends on distance and medium — [[not on packet length or rate]].',
    'Queuing delay is the only component that [[varies from packet to packet]]; processing is typically [[microseconds or less]].',
    'Traffic intensity = [[La/R]]. If it exceeds 1 the queue grows without bound — design so it is [[no greater than 1]]; average delay shoots up as it approaches 1.',
    'Packet loss: a packet arriving at a [[full (finite) buffer]] is dropped; the loss fraction rises with traffic intensity.',
    'N links (N − 1 routers), no queuing: d_{end-end} = [[N (d_{proc} + d_{trans} + d_{prop})]]. P packets back-to-back, store-and-forward: [[(N + P − 1) L/R]] plus propagation.',
    'RTT = time for a small packet to go client → server → client; includes [[propagation, queuing and processing]] delays.',
    'Throughput = rate of the [[bottleneck link]]: min{R_{s}, R_{c}} or min{R_{1}, …, R_{N}}; M flows sharing a core link R: [[min{R_{s}, R_{c}, R/M}]].',
    'Bandwidth-delay product R × d_{prop} = [[maximum bits in the link]]; width of one bit = [[s/R]] meters.',
    'Traceroute: N − 1 routers → N probe packets (each sent 3 times); router n answers probe n → route plus [[RTT to every router]].'
  ],
  topics: [
    {
      title: 'The four nodal delays',
      src: 'both',
      blocks: [
        { p: 'A packet goes from the source host through a series of routers to the destination host. At every node (host or router) it suffers several delays, which add up to the [[total nodal delay]]. Picture router A forwarding a packet onto the link to router B (Figure 1.16):' },
        { diagram: 'delay-components' },
        { table: { head: ['Delay', 'What it is', 'Depends on', 'Typical size'], rows: [
          ['Processing d_{proc}', '[[Examining the packet header]] to pick the outbound link; may include [[checking for bit errors]]', 'Router speed', '[[Microseconds or less]] in high-speed routers'],
          ['Queuing d_{queue}', 'Waiting in the output buffer (queue) until earlier packets are transmitted', 'Number of earlier-arriving packets waiting → intensity and nature (burstiness) of traffic', 'Microseconds to milliseconds; [[varies packet to packet]]'],
          ['Transmission d_{trans}', 'Pushing all the packet’s bits onto the link: [[L/R]]', 'Packet length L (bits) and link rate R (bits/s)', 'Microseconds to milliseconds'],
          ['Propagation d_{prop}', 'Time for a bit to travel from the start of the link to router B: [[d/s]]', 'Link length d and propagation speed s of the medium', 'Milliseconds in wide-area networks']
        ] } },
        { formula: 'd_{nodal} = d_{proc} + d_{queue} + d_{trans} + d_{prop}', where: [['d_{proc}', 'nodal processing delay'], ['d_{queue}', 'queuing delay'], ['d_{trans}', 'transmission delay = L/R'], ['d_{prop}', 'propagation delay = d/s']] },
        { steps: [
          'The packet arrives; router A examines its header and checks for bit errors (processing).',
          'It joins the queue (buffer) for the outbound link to B and waits for earlier packets (queuing). Packets are typically served first-come-first-served; if the link is idle and the queue empty, the wait is zero.',
          'Its bits are pushed onto the link one after another (transmission, L/R).',
          'Each bit travels across the link at speed s (propagation, d/s). Once the last bit reaches B, the whole packet is stored at B, and B repeats the process.'
        ], title: 'One packet’s trip through router A' },
        { p: 'Propagation speed depends on the physical medium (fiber, twisted pair, …) and lies between [[2 × 10^{8} m/s and 3 × 10^{8} m/s]] — equal to or a little less than the speed of light.' },
        { formula: 'd_{trans} = L / R        d_{prop} = d / s', where: [['L', 'packet length (bits) — convert bytes × 8'], ['R', 'link transmission rate (bits/s); 1 Mbps = 10^{6} bps'], ['d', 'link length (m)'], ['s', 'propagation speed (m/s)']], note: 'Example: a 1,500-byte packet on a 10 Mbps Ethernet link has d_{trans} = 12,000 / 10^{7} = 1.2 ms.' }
      ]
    },
    {
      title: 'Transmission vs propagation: the caravan analogy',
      src: 'both',
      blocks: [
        { p: 'Transmission delay is the time the router needs to [[push out]] the packet: a function of the packet length and the link rate, with [[nothing to do with distance]]. Propagation delay is the time for one bit to [[travel]] to the next router: a function of distance and medium, with [[nothing to do with packet length or link rate]].' },
        { p: 'Caravan analogy (Figure 1.17): tollbooths every 100 km are routers, highway segments are links, each car is a bit and a 10-car caravan is a packet. Cars travel (propagate) at 100 km/h; each tollbooth serves (transmits) one car every 12 seconds; the whole caravan must line up at a tollbooth before any car is served (store-and-forward).' },
        { example: { q: 'How long from when the caravan is lined up in front of one tollbooth until it is lined up in front of the next?', a: 'Transmission: the tollbooth pushes 10 cars out at 5 cars/min → 10 / 5 = 2 min.\nPropagation: a car travels 100 km at 100 km/h → 1 h = 60 min.\nTotal = 2 + 60 = 62 min (transmission + propagation).' } },
        { p: 'Now let cars travel at 1,000 km/h and the tollbooth serve 1 car per minute. Travel between booths takes [[6 minutes]], but serving the caravan takes [[10 minutes]]: the first cars [[arrive at the second tollbooth before the last cars leave the first]]. Networks do the same thing — when d_{prop} < d_{trans}, the first bits of a packet reach the next router while the sender is still transmitting the rest.' },
        { table: { head: ['Case (sender starts at t = 0)', 'Last bit at t = d_{trans}', 'First bit at t = d_{trans}'], rows: [
          ['d_{prop} > d_{trans}', 'Just leaving the sender', 'Still in the link, s × d_{trans} meters from the sender'],
          ['d_{prop} < d_{trans}', 'Just leaving the sender', 'Already arrived at the receiver']
        ] }, caption: 'Where is the packet when the sender finishes transmitting? (Problem P6 d–f)' },
        { example: { q: 'A 500-byte packet is sent over a 10 km link at 100 Mbps; s = 2 × 10^{8} m/s. Which finishes first — the sender’s transmission, or the first bit’s arrival? Where is the first bit when the sender finishes?', a: 'd_{trans} = 4,000 bits / 10^{8} bps = 40 μs.\nd_{prop} = 10^{4} m / 2 × 10^{8} m/s = 50 μs.\nd_{trans} < d_{prop}, so the sender finishes first.\nAt t = 40 μs the first bit has traveled 2 × 10^{8} × 40 × 10^{-6} = 8,000 m = 8 km (2 km short of the receiver).' } },
        { p: 'Which term dominates? d_{prop} is negligible (a couple of μs) between two routers on one campus but [[hundreds of milliseconds]] over a geostationary satellite link. d_{trans} is negligible for 10 Mbps-and-faster links (LANs) but can be [[hundreds of milliseconds]] for large packets on a dial-up modem (1,500 bytes at 56 kbps ≈ 214 ms). d_{proc} is often negligible, yet it strongly influences a router’s [[maximum throughput]] — the maximum rate at which it can forward packets.' },
        { trap: 'A faster link (bigger R) only shrinks transmission delay; it does not make bits travel faster. A longer cable only adds propagation delay. If a question changes R, recompute L/R; if it changes distance, recompute d/s.' },
        { game: 'delaylab', text: 'Watch a packet’s bits leave the sender and cross the link; change L, R and distance to see which delay dominates.' }
      ]
    },
    {
      title: 'Bits in flight: bandwidth-delay product and the width of a bit',
      src: 'text',
      blocks: [
        { p: 'While the sender transmits continuously at R bits/s, bits leave at one end and arrive d_{prop} seconds later at the other. So at any moment the link holds up to R × d_{prop} bits (Problems P25–P29).' },
        { formula: 'bandwidth-delay product = R × d_{prop}', where: [['R', 'link rate (bits/s)'], ['d_{prop}', 'one-way propagation delay (s)']], note: 'The [[maximum number of bits that can be in the link]] at one time. If the message is shorter than this, the most in the link is the whole message.' },
        { formula: 'width of a bit = m / (R × d_{prop}) = s / R', where: [['m', 'link length (m)'], ['s', 'propagation speed (m/s)']], note: 'Each bit occupies s/R meters of the link: faster links → shorter bits. A bit is as long as the whole link when R = s/m.' },
        { example: { q: 'A 4,000 km link runs at 100 Mbps with s = 2 × 10^{8} m/s. Find d_{prop}, the bandwidth-delay product, and the width of a bit.', a: 'd_{prop} = 4 × 10^{6} m / 2 × 10^{8} m/s = 0.02 s = 20 ms.\nR × d_{prop} = 10^{8} × 0.02 = 2 × 10^{6} bits in flight.\nWidth = s/R = 2 × 10^{8} / 10^{8} = 2 m (check: 4 × 10^{6} m / 2 × 10^{6} bits = 2 m).' } }
      ]
    },
    {
      title: 'Queuing delay and traffic intensity',
      src: 'text',
      blocks: [
        { p: 'Queuing delay is the most complicated component and, unlike the other three, it [[varies from packet to packet]]: if 10 packets arrive at an empty queue at the same time, the first waits 0 and the last waits for the other 9 to be transmitted. So it is described statistically — [[average]], variance, and the probability it exceeds some value. It depends on the arrival rate, the link rate, and whether traffic arrives periodically or in bursts.' },
        { formula: 'traffic intensity I = L·a / R', where: [['a', 'average packet arrival rate (packets/s)'], ['L', 'bits per packet'], ['L·a', 'average rate at which bits arrive (bits/s)'], ['R', 'link transmission rate (bits/s)']], note: 'Dimensionless: (bits arriving per second) ÷ (bits leaving per second). With rates in packets/s it is a/μ, where μ = R/L is the service rate.' },
        { list: [
          '[[La/R > 1]]: bits arrive faster than they can be sent, so the queue grows without bound and (with an infinite buffer) queuing delay → ∞. Golden rule of traffic engineering: [[design the system so traffic intensity is no greater than 1]].',
          'La/R ≤ 1 with [[periodic]] arrivals (one packet every L/R seconds): every packet finds an empty queue → [[no queuing delay]].',
          'La/R ≤ 1 with [[bursts]] (N packets arriving together every (L/R)·N seconds): the first waits 0, the second L/R, the nth (n − 1)L/R → a significant average delay.',
          'Random arrivals (realistic): La/R alone does not fully characterize the delay, but it gives the intuition. Near 0: arrivals are few and far between, so average queuing delay ≈ 0. Near 1: at times the arrival rate exceeds capacity and a queue builds; the average queue grows larger and larger as La/R → 1.'
        ] },
        { p: 'The delay-vs-intensity curve (Figure 1.18) is flat near 0 and shoots up as La/R approaches 1: a [[small percentage increase in traffic intensity]] near 1 causes a [[much larger percentage increase in delay]]. Like a highway that is usually congested: a few extra cars make delays huge.' },
        { formula: 'average queuing delay for N simultaneous arrivals = (N − 1) L / (2R)', note: 'Average of 0, L/R, 2L/R, …, (N − 1)L/R. Same answer when such bursts arrive every NL/R seconds, because each burst finds the queue just emptied (Problem P13).' },
        { formula: 'd_{queue} = [n L + (L − x)] / R', where: [['n', 'packets already waiting in the queue'], ['x', 'bits of the packet currently in transmission that have already been sent']], note: 'Wait for the rest of the current packet plus all n queued packets (Problem P12). FIFO order assumed.' },
        { example: { q: '1,500-byte packets arrive at an average of 800 packets/s at a 10 Mbps link. What is the traffic intensity?', a: 'La = 12,000 bits × 800 /s = 9.6 × 10^{6} bits/s.\nLa/R = 9.6 Mbps / 10 Mbps = 0.96 — close to 1, so expect a large average queuing delay.' } },
        { example: { q: 'Ten 1,000-bit packets arrive together at an idle 1 Mbps link. What is the queuing delay of the last packet, and the average queuing delay?', a: 'L/R = 1,000 / 10^{6} = 1 ms.\nLast (10th) packet waits for 9 transmissions = 9 ms.\nAverage = (0 + 1 + … + 9)/10 ms = 45/10 = 4.5 ms = (N − 1)L/(2R).' } },
        { p: 'Two classic queuing results from the problems: (1) if queuing delay ≈ I·(L/R)/(1 − I) for I < 1, then total delay (queuing + transmission) = (L/R)/(1 − I) = [[1/(μ − a)]] with μ = R/L packets/s. (2) [[Little’s formula]]: N = a · d, where N = average number of packets in the buffer plus the one being transmitted and d = average queuing + transmission delay.' }
      ]
    },
    {
      title: 'Packet loss',
      src: 'text',
      blocks: [
        { p: 'Real queues have finite capacity, so delays do not really reach ∞ as intensity → 1. Instead a packet can arrive to find the [[queue full]]; with nowhere to store it, the router [[drops]] it — the packet is lost. From the end system’s view, the packet went into the network core and never emerged at the destination.' },
        { list: [
          'The [[fraction of lost packets increases]] as traffic intensity increases.',
          'So node performance is measured by delay **and** by the [[probability of packet loss]].',
          'A lost packet may be [[retransmitted end-to-end]] so that all data eventually arrives (TCP, Chapter 3).',
          'Over N links that each drop a packet independently with probability p, a packet survives with probability [[(1 − p)^{N}]]; the expected number of transmissions until success is 1/(1 − p)^{N}, i.e. 1/(1 − p)^{N} − 1 retransmissions (Problem P22).'
        ] },
        { trap: 'Loss comes from buffer overflow (congestion), not from long distance. With a finite buffer and intensity > 1, the result is steady loss rather than infinite delay.' }
      ]
    },
    {
      title: 'End-to-end delay over N links',
      src: 'both',
      blocks: [
        { p: 'With N − 1 routers between source and destination there are [[N links]] and N transmitting nodes (the source plus each router). In an uncongested network (negligible queuing) with identical nodes and links, each node adds processing, transmission and propagation:' },
        { formula: 'd_{end-end} = N (d_{proc} + d_{trans} + d_{prop})', where: [['N', 'number of links = number of routers + 1'], ['d_{trans}', 'L/R'], ['d_{prop}', 'propagation delay of each link']], note: 'Equation 1.2. It generalizes Equation 1.1, d_{end-end} = N L/R (store-and-forward, no processing or propagation).' },
        { formula: 'd_{end-end} = Σ_{i=1..N} (d_{proc,i} + d_{queue,i} + L/R_{i} + d_{i}/s_{i})', note: 'Heterogeneous links and average queuing at each node (Problem P17): just add every node’s delays. With store-and-forward, the transmission delay is paid on every link.' },
        { diagram: 'store-forward' },
        { formula: 'P packets back-to-back over N links: d = (N + P − 1) L / R', note: 'The first packet arrives after N·L/R; each later packet arrives L/R after the previous one, because the links work in parallel (pipelining). Add the propagation delays if they are not negligible (Problem P2).' },
        { example: { q: 'Four links (3 routers), 1,500-byte packets, every link 100 Mbps and 400 km long with s = 2 × 10^{8} m/s, d_{proc} = 20 μs per node, no queuing. What is the end-to-end delay?', a: 'd_{trans} = 12,000 / 10^{8} = 0.12 ms.\nd_{prop} = 4 × 10^{5} m / 2 × 10^{8} m/s = 2 ms.\nd_{end-end} = 4 × (0.02 + 0.12 + 2) ms = 4 × 2.14 = 8.56 ms.' } },
        { trap: 'Count links, not routers: N − 1 routers means N links and N transmissions. If switches do NOT store-and-forward (they forward each bit immediately, equal rates), the packet’s transmission time is paid only once: L/R + Σ d_{prop} (Problem P11).' },
        { game: 'number-crunch', text: 'Randomized end-to-end delay drills: vary N, L, R and link lengths.' }
      ]
    },
    {
      title: 'RTT and Traceroute',
      src: 'both',
      blocks: [
        { def: 'RTT (round-trip time)', text: 'The time for a [[small packet]] to travel [[client → server → client]]. It includes [[propagation, queuing and processing]] delays (a small packet’s transmission time is tiny). Used heavily in HTTP timing (2 RTTs + file transmission time for a non-persistent fetch).' },
        { steps: [
          'The user names a destination host. If there are N − 1 routers on the path, the source sends [[N special packets]] toward the destination, marked 1 through N.',
          'When the [[nth router]] receives the packet marked n, it does not forward it; it [[sends a message back]] to the source containing its name and address.',
          'When the destination host receives packet N, it also replies to the source.',
          'The source records the [[round-trip time]] for each reply and who sent it, reconstructing the route and the round-trip delay to every intervening router.',
          'The whole experiment is repeated [[3 times]], so the source sends 3·N packets (RFC 1393 describes Traceroute).'
        ], title: 'How Traceroute works' },
        { list: [
          'Output columns: hop number n, router name, router IP address, and three round-trip delays.',
          'An asterisk in place of a time means [[no reply]] for that probe (lost); Traceroute then reports fewer than three times.',
          'The RTTs include transmission, propagation, processing and queuing delays.',
          'Because queuing delay varies over time, the RTT to router n can be [[larger than the RTT to router n + 1]] — in the textbook trace (UMass → Sorbonne, 14 routers) router 12’s delay is smaller than router 11’s.',
          'A big jump between consecutive hops means a long link: from router 7 (~6 ms) to router 8 (~78 ms) the RTT jumps because of a [[transatlantic fiber link]] (large propagation delay).'
        ] }
      ]
    },
    {
      title: 'End-system and application delays',
      src: 'text',
      blocks: [
        { list: [
          'A host transmitting into a shared medium (WiFi, cable modem) may [[purposely delay]] its transmission as part of the protocol for sharing the medium with other hosts (Chapter 6).',
          '[[Media packetization delay]] in VoIP: the sender must first fill a packet with encoded, digitized speech before handing it to the Internet. Example: 56-byte packets filled by a 64 kbps voice stream take 448 bits / 64,000 bps = 7 ms to fill. This can hurt the user-perceived call quality (Problem P7).'
        ] }
      ]
    },
    {
      title: 'Throughput and the bottleneck link',
      src: 'text',
      blocks: [
        { def: 'Instantaneous throughput', text: 'The rate (bits/s) at which Host B is receiving the file at a given instant.' },
        { def: 'Average throughput', text: 'For an F-bit file that takes T seconds to fully arrive: [[F/T]] bits/s.' },
        { p: 'Needs differ: Internet telephony wants low delay and an instantaneous throughput consistently above a threshold (e.g., [[over 24 kbps]] for some telephony apps, [[over 256 kbps]] for some real-time video). File transfer tolerates delay but wants the highest possible throughput.' },
        { p: 'Think of bits as fluid and links as pipes. Server → router → client, no other traffic: the server can’t push faster than R_{s} and the router can’t forward faster than R_{c}, so throughput = [[min{R_{s}, R_{c}}]], the rate of the [[bottleneck link]]. If R_{s} > R_{c}, bits pile up at the router and its backlog grows and grows.' },
        { formula: 'throughput = min{R_{1}, R_{2}, …, R_{N}}        transfer time ≈ F / min{R_{1}, …, R_{N}}', note: 'Approximation: ignores store-and-forward, processing delays and protocol issues.' },
        { example: { q: 'You download an MP3 of F = 32 million bits; the server’s link is R_{s} = 2 Mbps and your access link is R_{c} = 1 Mbps. How long does the transfer take?', a: 'Bottleneck = min{2, 1} = 1 Mbps.\nT = 32 × 10^{6} bits / 10^{6} bits/s = 32 s.' } },
        { p: 'Today’s Internet core is [[over-provisioned]] with high-speed links that see little congestion, so the throughput between a server and a client is usually min{R_{s}, R_{c}}: the constraining factor is typically the [[access network]].' },
        { p: 'Shared core link (Figure 1.20b): 10 servers download to 10 clients and all 10 flows cross one core link of rate R, which splits its rate equally. Each download gets [[min{R_{s}, R_{c}, R/10}]]. With R_{s} = 2 Mbps, R_{c} = 1 Mbps and R = 5 Mbps: R/10 = 500 kbps, so the shared core link becomes the bottleneck and each download gets [[500 kbps]]. With M client–server pairs: min{R_{s}, R_{c}, R/M} (Problem P20).' },
        { trap: 'A high-rate link can still be the bottleneck if many flows share it: throughput depends on link rates **and** on intervening traffic. Conversely, if R is huge (say 100 × R_{s}), the shared link is irrelevant and throughput is min{R_{s}, R_{c}} again.' },
        { p: 'Several disjoint paths (Problem P21): using only one path, the best achievable is the largest per-path bottleneck, max_{k} min_{i} R^{k}_{i}; using all M paths at once, the throughputs add: Σ_{k} min_{i} R^{k}_{i}.' },
        { game: 'number-crunch', text: 'Practise bottleneck and shared-link throughput questions until min{…} is instinctive.' }
      ]
    },
    {
      title: 'Exam recipe for delay and throughput problems',
      src: 'both',
      blocks: [
        { steps: [
          'Convert units first: bytes × 8 → bits; kbps/Mbps/Gbps → 10^{3}/10^{6}/10^{9} bits/s; km → m. Keep everything in seconds, convert at the end.',
          'Count links N (= routers + 1) and packets P.',
          'For each link compute L/R_{i} (depends on that link’s rate) and d_{i}/s_{i} (depends on that link’s length).',
          'Add processing at each node that processes the packet and queuing if given ([nL + (L − x)]/R for a FIFO snapshot).',
          'Store-and-forward: transmission is paid on every link. No store-and-forward (cut-through, equal rates): paid once.',
          'For throughput, take the minimum over links of (link rate ÷ number of flows sharing it).',
          'Sanity check which term dominates: LAN → transmission/processing; long WAN or satellite → propagation.'
        ], title: 'Seven-step recipe' },
        { game: 'delaylab', text: 'Check your hand calculations against the animated link.' }
      ]
    }
  ],
  recall: [
    { q: 'Name the four nodal delay components.', a: 'Processing, queuing, transmission, propagation.' },
    { q: 'Formula for transmission delay? Does it depend on distance?', a: 'L/R. No — only on packet length and link rate.' },
    { q: 'Formula for propagation delay? Typical propagation speed?', a: 'd/s; 2 × 10^8 to 3 × 10^8 m/s.' },
    { q: 'Which delay varies packet to packet?', a: 'Queuing delay.' },
    { q: 'What does processing delay include, and how large is it?', a: 'Examining the header to choose the outbound link, checking bit errors; microseconds or less.' },
    { q: 'Caravan: 10 cars, 12 s per car, 100 km at 100 km/h — booth-to-booth time?', a: '2 min transmission + 60 min propagation = 62 min.' },
    { q: 'Define traffic intensity. What is the golden rule?', a: 'La/R. Design the system so it is no greater than 1.' },
    { q: 'What happens to average queuing delay as La/R → 1? When La/R > 1?', a: 'It rises steeply (small intensity increase → large delay increase). It grows without bound (infinite buffer) or packets are dropped (finite buffer).' },
    { q: 'Average queuing delay when N packets arrive at once at an idle link?', a: '(N − 1)L/(2R).' },
    { q: 'When is a packet lost?', a: 'When it arrives at a full buffer and is dropped.' },
    { q: 'End-to-end delay over N identical links (no queuing)?', a: 'N(d_proc + d_trans + d_prop).' },
    { q: 'P packets back-to-back over N store-and-forward links?', a: '(N + P − 1)L/R (plus propagation).' },
    { q: 'Define RTT and what it includes.', a: 'Time for a small packet to go client → server → client; propagation, queuing and processing delays.' },
    { q: 'How many probe packets does Traceroute send for a path with N − 1 routers?', a: 'N per trial, 3 trials → 3N.' },
    { q: 'Why can a later hop show a smaller RTT in Traceroute?', a: 'Queuing delays vary over time.' },
    { q: 'Throughput of a path with no other traffic?', a: 'The bottleneck rate: min over the links.' },
    { q: 'Throughput when M downloads share a core link of rate R?', a: 'min{R_s, R_c, R/M}.' },
    { q: 'Bandwidth-delay product and width of a bit?', a: 'R × d_prop = max bits in the link; width = s/R meters.' },
    { q: 'What is media packetization delay?', a: 'In VoIP, the time to fill a packet with encoded speech before sending it.' },
    { q: 'What usually limits throughput in today’s Internet?', a: 'The access network (the core is over-provisioned).' }
  ]
});
