NET.addSection({
  id: "switching",
  unit: 1,
  order: 2,
  title: "Packet switching vs circuit switching",
  short: "Switching",
  cheat: "p.12–16",
  text: "§1.3.1, §1.3.2",
  minutes: 45,
  summary: "There are two fundamental ways to move data through a network core. Circuit switching reserves a path (implemented with FDM or TDM). Packet switching sends addressed packets on demand, using store-and-forward, output queues and forwarding tables. Exams love the N·L/R and (N+P−1)·L/R store-and-forward formulas, TDM/FDM circuit-rate and file-transfer calculations, the statistical-multiplexing binomial examples (10 vs 35 users), message segmentation, the six design questions, and why TCP/IP exists.",
  mustKnow: [
    "Circuit switching [[reserves resources]] (link transmission rate, buffers) end to end for the whole session after a [[setup phase]]. It gives a guaranteed constant rate, but reserved capacity is [[wasted when idle]].",
    "Packet switching uses no reservation. Packets carry a [[destination address]] and use links [[on demand]], so they may [[queue]] or be lost (best effort, no guarantees).",
    "Store-and-forward: a switch must receive the [[entire packet]] before sending its first bit onward. One packet over N links takes [[N·L/R]]; P packets back-to-back take [[(N+P−1)·L/R]].",
    "Packets wait in the [[output buffer]] of a busy link (queuing delay). A full buffer means [[packet loss]] (the arriving or an already-queued packet is dropped).",
    "Routers look up the destination IP address in a [[forwarding table]] (address → outbound link). [[Routing protocols]] fill those tables automatically.",
    "FDM gives each circuit its own [[frequency band]] all the time (telephone: [[4 kHz]]). TDM gives each circuit [[one slot per frame]], so its rate = [[frame rate × bits per slot]].",
    "Circuit file-transfer time = setup + file size ÷ (link rate ÷ circuits per link). It is [[independent of the number of links]].",
    "Statistical multiplexing example: 1 Mbps link, users need 100 kbps and are active 10% of the time. Circuit switching supports [[10 users]]; packet switching handles [[35 users]] with P(more than 10 active) ≈ [[0.0004]].",
    "The six design questions: [[addressing, discovery, packet sizing and framing]], [[medium sharing, wireless adaptation, trade-offs]].",
    "No single packet technology meets every need, so networks are interconnected with [[open standards]] (TCP/IP), which use a [[common packet format and common addressing]]."
  ],
  topics: [
    {
      title: "Two ways to move data through the core",
      src: "both",
      blocks: [
        { def: "Circuit switching", text: "Establishes a [[dedicated end-to-end connection]] before any data is transmitted. The resources along the path (buffers, link transmission rate) are [[reserved for the duration]] of the communication session." },
        { def: "Packet switching", text: "Sends data [[without a dedicated circuit]] using [[store-and-forward]] transmission. Resources are not reserved; messages use them [[on demand]]. It is the foundation of the modern Internet." },
        { p: "Kurose's restaurant analogy: circuit switching is a restaurant that [[requires reservations]]. You have to call ahead (circuit setup), but once there you're seated immediately. Packet switching is a restaurant that takes no reservations. There's no hassle beforehand, but you may [[wait for a table]] (queuing)." },
        { table: {
            head: ["", "Circuit switching", "Packet switching"],
            rows: [
              ["Setup before data", "Yes: a circuit is established, and switches on the path keep [[connection state]]", "No"],
              ["Resources", "A fraction of each link reserved for the whole session", "Shared on demand, packet by packet"],
              ["Rate", "Guaranteed constant rate", "The full link rate when the link is free, less when it is busy"],
              ["Delay", "Predictable, no queuing", "Variable queuing delay; packets may be lost"],
              ["Idle periods", "Reserved capacity is [[wasted]]", "Other users use the capacity"],
              ["Example", "Traditional telephone network", "The Internet: [[best effort]], no guarantees"]
            ] } }
      ]
    },
    {
      title: "How packet switching works",
      src: "both",
      blocks: [
        { list: [
          "Users [[share network resources]].",
          "Data is divided into [[small packets]]. The source breaks long messages into chunks and adds header bytes to each.",
          "Each packet includes a [[destination address]].",
          "Network devices use [[forwarding information]] to deliver packets."
        ] },
        { p: "A packet crosses each link at that link's [[full transmission rate]] R, so pushing an L-bit packet onto the link takes L/R seconds. The two predominant packet switches are [[routers]] (typically in the network core) and [[link-layer switches]] (typically in access networks). The sequence of links and switches a packet traverses is its route or path." },
        { formula: "d_{trans} = L / R",
          where: [["L", "packet length (bits)"], ["R", "link transmission rate (bits/s)"]],
          note: "Convert bytes to bits (× 8) and Mbps to 10^{6} bits/s before dividing." }
      ]
    },
    {
      title: "Store-and-forward transmission",
      src: "both",
      blocks: [
        { def: "Store-and-forward", text: "The packet switch must receive the [[entire packet]] before it can begin to transmit the [[first bit]] of the packet onto the outbound link. Until then it buffers (“stores”) the bits; then it “forwards”." },
        { diagram: "store-forward" },
        { steps: [
          "t = 0: the source starts transmitting the packet.",
          "t = L/R: the source has finished, and the whole packet is stored at the router.",
          "t = L/R: the router begins forwarding the packet onto the next link.",
          "t = [[2L/R]]: the destination has received the whole packet."
        ], title: "One packet: source → router → destination (Figure 1.11, propagation ignored)" },
        { p: "If the router forwarded bits the moment they arrived instead of storing the whole packet, the total would be only L/R. Kurose notes that routers need to receive, store and process the entire packet before forwarding." },
        { steps: [
          "t = L/R: the router has packet 1 and starts forwarding it; the source starts packet 2.",
          "t = 2L/R: the destination has packet 1; the router has packet 2.",
          "t = 3L/R: the destination has packets 1 and 2; the router has packet 3.",
          "t = [[4L/R]]: the destination has all three packets."
        ], title: "Three packets back-to-back over the same two links" },
        { formula: "d_{end-to-end} = N · L / R",
          where: [["N", "number of links (there are N − 1 routers)"], ["L", "packet length (bits)"], ["R", "rate of every link (bits/s)"]],
          note: "Kurose Eq. 1.1: one packet, equal-rate links, ignoring propagation, queuing and processing." },
        { formula: "d = (N + P − 1) · L / R",
          where: [["P", "number of packets sent back-to-back"], ["N", "number of links"]],
          note: "The first packet takes N·L/R; after that, one more packet finishes every L/R (the links work like a pipeline). Check: N = 2, P = 3 gives 4L/R." },
        { formula: "d = L/R_{1} + L/R_{2} + … + L/R_{N}",
          where: [["R_{i}", "rate of link i"]],
          note: "Unequal link rates (e.g. Review Question R11): add one full transmission time per link, because each switch stores the whole packet first." },
        { example: {
            q: "A 1,500-byte packet crosses 4 links of 2 Mbps each (3 routers). Ignoring propagation, queuing and processing, what is the end-to-end delay? What if 10 such packets are sent back-to-back?",
            a: "L = 1,500 × 8 = 12,000 bits. L/R = 12,000 / (2 × 10^{6}) = 6 ms.\nOne packet: N·L/R = 4 × 6 ms = 24 ms.\n10 packets: (N + P − 1)·L/R = (4 + 10 − 1) × 6 ms = 13 × 6 ms = 78 ms." } },
        { game: "delaylab", text: "Watch store-and-forward happen hop by hop and check your N·L/R answers." }
      ]
    },
    {
      title: "Message segmentation: why send packets instead of one big message",
      src: "text",
      blocks: [
        { p: "With **message switching**, the whole message is one unit and every switch stores the [[entire message]] before forwarding it, so only one link is busy at a time. With **message segmentation**, the source splits the message into packets, and while packet 1 is on link 2, packet 2 is already on link 1. The links work in parallel, which is called [[pipelining]]." },
        { example: {
            q: "A 2 × 10^{6}-bit message crosses 3 links of 10 Mbps each (2 packet switches). Compare sending it whole with sending it as 200 packets of 10,000 bits (ignore headers, propagation and queuing).",
            a: "Whole message: one hop takes 2 × 10^{6} / 10^{7} = 0.2 s. With store-and-forward over 3 hops: 3 × 0.2 = 0.6 s.\nPackets: L/R = 10^{4} / 10^{7} = 1 ms. (N + P − 1)·L/R = (3 + 200 − 1) × 1 ms = 202 ms = 0.202 s.\nSegmentation is about 3× faster because all three links transmit at the same time." } },
        { list: [
          "Advantage: much lower end-to-end delay thanks to [[pipelining]].",
          "Advantage: a bit error forces retransmission of [[one small packet]], not the whole message.",
          "Advantage: a huge message can't [[hog]] a switch's link and buffer and block small packets behind it, so switches need less buffer space."
        ] },
        { list: [
          "Drawback: packets must be [[put back in order and reassembled]] at the destination.",
          "Drawback: every packet carries its own [[header]], so total header overhead grows with the number of packets."
        ] },
        { formula: "d(S) = (F/S + N − 1) · (S + h) / R    is smallest at    S = √(F·h / (N − 1))",
          where: [["F", "file size (bits)"], ["S", "payload bits per packet"], ["h", "header bits per packet"], ["N", "number of links"]],
          note: "Smaller packets pipeline better but add more headers, so the best packet size is in between. Problem P33 (N = 3, h = 80) gives S = √(40F)." },
        { trap: "Propagation delay doesn't change the comparison. Message switching and packet switching each pay one propagation delay per link (N·d_{prop}). Segmentation only saves **transmission** time." }
      ]
    },
    {
      title: "Queuing delays and packet loss",
      src: "text",
      blocks: [
        { p: "Each packet switch has an [[output buffer]] (output queue) for every attached link, holding packets about to be sent on that link. If an arriving packet finds the link busy transmitting another packet, it [[waits in the output buffer]]. This [[queuing delay]] is variable and depends on how congested the network is." },
        { p: "Buffer space is finite. If an arriving packet finds the buffer completely full, [[packet loss]] occurs: either the [[arriving packet or one of the already-queued packets]] is dropped." },
        { p: "Figure 1.12: Hosts A and B send packets to E over [[100 Mbps]] Ethernet links into a router whose outgoing link is [[15 Mbps]]. If during a short interval the combined arrival rate exceeds 15 Mbps, congestion occurs and packets queue in that link's output buffer. If A and B each send a burst of five back-to-back packets at the same time, most of those packets will spend some time waiting. It is like queuing for a bank teller or at a tollbooth." },
        { trap: "Queuing happens at the **output** buffer of the outgoing link, because the arrival rate exceeds that link's rate. Fast input links don't prevent it; here the 100 Mbps inputs are what overwhelm the 15 Mbps output." }
      ]
    },
    {
      title: "Forwarding tables and routing protocols",
      src: "text",
      blocks: [
        { p: "In the Internet every end system has an [[IP address]]. The source puts the destination's IP address in the packet's [[header]]. Like a postal address, the IP address has a [[hierarchical]] structure." },
        { def: "Forwarding table", text: "Each router's table mapping [[destination addresses (or portions of them)]] to the router's [[outbound links]]. When a packet arrives, the router examines the destination address, searches its forwarding table, and directs the packet to the matching outbound link." },
        { def: "Routing protocol", text: "A protocol used to [[automatically set the forwarding tables]]. For example, it may determine the shortest path from each router to each destination and use the results to configure the tables (Chapter 5)." },
        { p: "Driving analogy: Joe drives from Philadelphia to 156 Lakeside Drive, Orlando, asking for directions instead of using a map. Each gas-station attendant reads only [[part of the address]]. Florida means take I-95 South. In Jacksonville, Orlando means continue to Daytona Beach. In Daytona Beach, Orlando means take I-4. In Orlando, Lakeside Drive means take this road. Finally a kid on a bicycle reads 156 and points to the house. The attendants and the kid are [[routers]]. Joe never knows the whole route in advance; each step is decided locally from the destination address." },
        { trap: "**Forwarding** is local: look up the table and move the packet to an output link. **Routing** is network-wide: compute the paths that fill the tables. A router does both, but they are different jobs." }
      ]
    },
    {
      title: "The six design questions for packet-switched networks",
      src: "cheat",
      blocks: [
        { table: {
            head: ["Design question", "What it asks"],
            rows: [
              ["[[Addressing]]", "How is the destination identified?"],
              ["[[Discovery]]", "How is the destination's address found?"],
              ["[[Packet sizing and framing]]", "How are packets sized and separated?"],
              ["[[Medium sharing]]", "How do devices share a link fairly?"],
              ["[[Wireless adaptation]]", "How is packet switching applied to radio links?"],
              ["[[Trade-offs]]", "How are speed, range and cost balanced?"]
            ] },
          caption: "Every packet-switched network must answer these six." },
        { p: "Mnemonic: **A D P M W T**, “A Dog Packs My Wet Towel”: Addressing, Discovery, Packet sizing/framing, Medium sharing, Wireless adaptation, Trade-offs." },
        { trap: "Addressing and discovery are different questions. Addressing is **how a destination is identified** (the address format). Discovery is **how you find out** a particular destination's address." }
      ]
    },
    {
      title: "TCP/IP internetworking",
      src: "cheat",
      blocks: [
        { p: "No single packet-switching technology could meet every need (LAN vs WAN, wired vs wireless, speed vs range vs cost). So different networks are [[interconnected using open standards]], and these standards form the [[TCP/IP protocol suite]]." },
        { p: "TCP/IP supports diverse technologies through a [[common packet format]] and a [[common addressing system]] (IP addresses). Cheat-sheet Figure 5 shows Wi-Fi, Ethernet, fibre and cellular networks joined into one Internet: every one of them carries the same IP packets with the same kind of IP source and destination addresses." },
        { trap: "TCP/IP doesn't replace Ethernet or Wi-Fi; it runs **over** them. Each network keeps its own technology and frame format, and IP adds a common layer on top. See the Internetworking & universal service section." }
      ]
    },
    {
      title: "Circuit switching in detail",
      src: "text",
      blocks: [
        { p: "Traditional telephone networks are circuit switched. Before the sender can send, the network establishes a bona fide connection, called a [[circuit]], and the switches on the path maintain [[connection state]] for it. The network also reserves a [[constant transmission rate]] (a fraction of each link's capacity) for the duration of the connection, so the sender gets a guaranteed constant rate." },
        { p: "Figure 1.13: four circuit switches are connected in a ring by four links, and each link carries [[four circuits]]. For Host A to talk to Host B, the network reserves one circuit on each of two links (in the figure, the 2nd circuit of the first link and the 4th of the second). Each connection gets [[one fourth]] of each link's capacity, so with 1 Mbps links every circuit has [[250 kbps]] dedicated." },
        { p: "Contrast with packet switching: a packet is sent [[without reserving any link resources]]. If a link is congested, the packet waits in a buffer at the sending side of that link. The Internet makes its [[best effort]] to deliver packets in a timely manner but makes no guarantees." }
      ]
    },
    {
      title: "Multiplexing circuits: FDM and TDM",
      src: "text",
      blocks: [
        { def: "FDM (frequency-division multiplexing)", text: "The link's frequency spectrum is divided among the connections; each connection gets a dedicated [[frequency band]] for its duration. Telephone bands are typically [[4 kHz]] wide, and the width of a band is called its [[bandwidth]]. FM radio uses FDM to share 88–108 MHz among stations." },
        { def: "TDM (time-division multiplexing)", text: "Time is divided into [[frames]] of fixed duration, each with a fixed number of [[time slots]]. A connection gets [[one slot in every frame]] (the same slot position each frame) for its sole use." },
        { p: "Figure 1.14 contrast: with FDM each circuit [[continuously]] gets a fraction of the bandwidth. With TDM each circuit gets [[all of the bandwidth periodically]], during brief intervals (its slots)." },
        { formula: "R_{circuit} = frame rate × bits per slot  =  R_{link} / slots per frame",
          where: [["frame rate", "frames per second"], ["bits per slot", "bits the circuit sends in its slot"]],
          note: "Kurose: 8,000 frames/s × 8 bits/slot = 64 kbps per circuit." },
        { p: "Why TDM over FDM (Review Question R12): FDM requires sophisticated [[analog hardware]] to shift each signal into its own frequency band. TDM simply takes turns in time." },
        { example: {
            q: "How long does it take to send a 640,000-bit file from Host A to Host B over a circuit-switched network whose links use TDM with 24 slots at 1.536 Mbps, if setting up the circuit takes 500 ms?",
            a: "Circuit rate = 1.536 Mbps / 24 = 64 kbps.\nTransmission time = 640,000 bits / 64,000 bits/s = 10 s.\nTotal = 10 s + 0.5 s setup = 10.5 s.\nThe 10 s doesn't depend on the number of links: it would be 10 s through 1 link or 100 links (propagation delay would add a little)." } },
        { trap: "Don't use N·L/R for circuit switching. There is no store-and-forward: bits stream through the circuit at the reserved rate, so the transmission time is counted **once**, not once per link." },
        { game: "number-crunch", text: "Drill TDM circuit rates, circuit file-transfer times and N·L/R until they're automatic." }
      ]
    },
    {
      title: "Packet vs circuit switching: statistical multiplexing",
      src: "text",
      blocks: [
        { p: "Against circuit switching: dedicated circuits sit [[idle during silent periods]] and nobody else can use them. Examples are pauses in a phone call, or a radiologist who holds a connection open while studying each x-ray. Establishing end-to-end circuits also needs complex [[signaling software]] to coordinate the switches." },
        { p: "Against packet switching: [[variable and unpredictable]] end-to-end delays (mainly queuing) make it less suitable for real-time services such as phone and video calls." },
        { p: "For packet switching: (1) it offers [[better sharing]] of transmission capacity, and (2) it is [[simpler, more efficient, and less costly]] to implement." },
        { example: {
            q: "Users share a 1 Mbps link. Each user generates 100 kbps when active and is active only 10% of the time. How many users can circuit switching support? With packet switching and 35 users, how often is the link overloaded?",
            a: "Circuit switching must reserve 100 kbps per user at all times: 1 Mbps / 100 kbps = 10 users. (For example, TDM with 1-second frames split into 10 slots of 100 ms.)\nPacket switching with 35 users: overload needs 11 or more users active at once. The number active is Binomial(35, 0.1), so\nP(≥ 11) = Σ_{n=11}^{35} C(35, n)(0.1)^{n}(0.9)^{35−n} ≈ 0.0004.\nSo 99.96% of the time at most 10 users are active, the aggregate rate is ≤ 1 Mbps, and packets flow essentially without delay, just as with circuit switching. Packet switching gives the same performance while supporting more than three times as many users (35 vs 10)." } },
        { formula: "P(more than N users active) = Σ_{n=N+1}^{M} C(M, n) · p^{n} · (1 − p)^{M−n}",
          where: [["M", "number of users"], ["p", "probability a given user is active"], ["N", "link rate ÷ per-user rate (the number of users circuit switching can support)"]],
          note: "Binomial distribution. When more than N users are active, the arrival rate exceeds the link rate and the output queue grows." },
        { example: {
            q: "10 users share a 1 Mbps link. One user suddenly generates 1,000 packets of 1,000 bits; the others are silent. How long does it take to send them with TDM (10 slots per frame, 1,000 bits per slot) and with packet switching?",
            a: "Total data = 1,000 × 1,000 = 10^{6} bits.\nTDM: the user may use only its 1 slot per frame, which is 1/10 of the link or 100 kbps. 10^{6} / 10^{5} = 10 s, and the other 9 slots in every frame sit idle.\nPacket switching: no one else is sending, so the user gets the full 1 Mbps. 10^{6} / 10^{6} = 1 s." } },
        { p: "The crucial difference: circuit switching [[pre-allocates]] link use regardless of demand, so allocated but unneeded time is wasted. Packet switching allocates link use [[on demand]], sharing capacity packet by packet only among users who have packets to send. This on-demand sharing is called [[statistical multiplexing]]." },
        { p: "Both approaches are still used, but the trend is toward packet switching. Many telephone networks already use packet switching for the expensive [[overseas portion]] of a call." },
        { trap: "Packet switching can match circuit switching's performance here only because users are **bursty** (active 10% of the time). For a steady stream that is always on, reservation wastes nothing, and circuit switching becomes attractive (Problem P3)." }
      ]
    }
  ],
  recall: [
    { q: "Circuit vs packet switching in one line each?", a: "Circuit: reserve a dedicated end-to-end path (rate and buffers) before sending, for the whole session. Packet: send addressed packets with no reservation, using links on demand with store-and-forward." },
    { q: "What does store-and-forward mean?", a: "A switch must receive the entire packet before it transmits the first bit onto the outbound link." },
    { q: "Delay for one L-bit packet over N links of rate R (store-and-forward)?", a: "N·L/R." },
    { q: "Delay for P packets back-to-back over N links?", a: "(N + P − 1)·L/R." },
    { q: "One switch between links of rates R1 and R2: delay for an L-bit packet?", a: "L/R1 + L/R2." },
    { q: "Where do packets wait, and when are they lost?", a: "In the output buffer (queue) of the busy outgoing link. They are lost when the buffer is full, and either the arriving or an already-queued packet is dropped." },
    { q: "What does a forwarding table map?", a: "Destination addresses (or portions of them) to the router's outbound links." },
    { q: "What sets the forwarding tables?", a: "Routing protocols, automatically (e.g. by computing shortest paths)." },
    { q: "Name the six design questions for packet-switched networks.", a: "Addressing, discovery, packet sizing and framing, medium sharing, wireless adaptation, trade-offs." },
    { q: "How does TCP/IP support diverse network technologies?", a: "With a common packet format and a common addressing system." },
    { q: "FDM vs TDM?", a: "FDM: each circuit gets a dedicated frequency band all the time (4 kHz for phone). TDM: each circuit gets one slot in every frame and so uses the full bandwidth periodically." },
    { q: "Rate of a TDM circuit? Give Kurose's numbers.", a: "Frame rate × bits per slot = 8,000 frames/s × 8 bits = 64 kbps." },
    { q: "640,000-bit file, TDM 24 slots, 1.536 Mbps, 500 ms setup: total time?", a: "64 kbps circuit, so 10 s + 0.5 s = 10.5 s, regardless of the number of links." },
    { q: "Figure 1.13: links of 1 Mbps with 4 circuits each give each connection how much?", a: "250 kbps." },
    { q: "1 Mbps link, 100 kbps users active 10% of the time: circuit-switched capacity? Packet-switched example?", a: "10 users. With 35 users, P(≥ 11 active) ≈ 0.0004." },
    { q: "One active user with 10^{6} bits on a 1 Mbps link, TDM with 10 slots: time with TDM vs packet switching?", a: "10 s vs 1 s." },
    { q: "Two arguments for packet switching and one against?", a: "For: better sharing of capacity; simpler, more efficient and cheaper. Against: variable, unpredictable delays, bad for real-time." },
    { q: "Two advantages and two drawbacks of message segmentation?", a: "Advantages: pipelining lowers delay; a bit error costs only one small packet (also, no buffer hogging). Drawbacks: reassembly and ordering at the destination; more header overhead." }
  ]
});
