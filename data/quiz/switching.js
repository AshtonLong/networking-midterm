NET.addQuestions("switching", [
  { id: "switching-01", d: 1, type: "mc", src: "cheat",
    q: "Which statement defines **circuit switching**?",
    choices: [
      "Each router looks up the destination address in a forwarding table",
      "Packets are buffered in output queues and dropped when the queues are full",
      "Data is sent in addressed packets without any dedicated path, using store-and-forward",
      "A dedicated end-to-end connection is established before any data is transmitted"
    ],
    a: 3,
    why: "Circuit switching sets up a dedicated end-to-end connection (a circuit) **before** any data flows, and reserves resources along the path for the session. The other three choices describe packet switching (no dedicated circuit, forwarding tables, output queues and loss)." },

  { id: "switching-02", d: 1, type: "mc", src: "cheat",
    q: "Which statement about **packet switching** is correct?",
    choices: [
      "It reserves a constant transmission rate on every link before sending",
      "It divides each link into frequency bands, one per user",
      "It sends data without a dedicated circuit using store-and-forward transmission, and it is the foundation of the modern Internet",
      "It requires a call-setup phase in which every switch stores connection state"
    ],
    a: 2,
    why: "Lecture definition: packet switching sends data **without a dedicated circuit** using **store-and-forward** transmission, and it forms the foundation of the modern Internet. Reserving rate, call setup with per-connection state, and per-user frequency bands (FDM) are all circuit-switching features." },

  { id: "switching-03", d: 1, type: "multi", src: "cheat",
    q: "Which of the following describe packet switching? Select all that apply.",
    choices: [
      "Users share network resources",
      "A dedicated path is reserved before transmission begins",
      "Each packet includes a destination address",
      "Network devices use forwarding information to deliver packets",
      "Each packet is guaranteed a constant rate along the path",
      "Data is divided into small packets"
    ],
    a: [0, 2, 3, 5],
    why: "The lecture's four points: users **share** resources, data is divided into **packets**, each packet carries a **destination address**, and devices use **forwarding information** to deliver it. Reserved paths and guaranteed constant rates belong to circuit switching. Packet switching is best effort, with no guarantees." },

  { id: "switching-04", d: 1, type: "mc", src: "cheat",
    q: "Which of the six packet-switching design questions asks **how the destination is identified**?",
    choices: [
      "Addressing",
      "Discovery",
      "Medium sharing",
      "Packet sizing and framing"
    ],
    a: 0,
    why: "**Addressing** asks how the destination is identified. **Discovery** asks how its address is found, **packet sizing and framing** asks how packets are sized and separated, and **medium sharing** asks how devices share a link fairly." },

  { id: "switching-05", d: 2, type: "mc", src: "cheat",
    q: "A host knows it wants to reach a particular printer but must first find out what that printer's address is. Which design question is this?",
    choices: [
      "Medium sharing",
      "Addressing",
      "Trade-offs",
      "Discovery"
    ],
    a: 3,
    why: "**Discovery** is how a destination's address is **found**. Addressing is a different question: how destinations are **identified** at all (the address scheme). The trap is mixing up “what is an address” with “how do I learn this host's address”." },

  { id: "switching-06", d: 2, type: "mc", src: "cheat",
    q: "Network designers must decide how large a packet may be and how a receiver tells where one packet ends and the next begins. Which design question is this?",
    choices: [
      "Addressing",
      "Wireless adaptation",
      "Packet sizing and framing",
      "Discovery"
    ],
    a: 2,
    why: "**Packet sizing and framing** asks how packets are sized and separated. Framing means marking packet boundaries on the link. The others concern identifying destinations (addressing), finding their addresses (discovery) and applying packet switching to radio links (wireless adaptation)." },

  { id: "switching-07", d: 2, type: "multi", src: "cheat",
    q: "Which of the following are among the lecture's **six design questions** for packet-switched networks? Select all that apply.",
    choices: [
      "Medium sharing",
      "Wireless adaptation",
      "Addressing",
      "Billing",
      "Discovery",
      "Encryption strength"
    ],
    a: [0, 1, 2, 4],
    why: "The six are: addressing, discovery, packet sizing and framing, medium sharing, wireless adaptation, and trade-offs (speed, range, cost). Encryption strength and billing are not on the list." },

  { id: "switching-08", d: 2, type: "short", src: "cheat",
    q: "List the six design questions that every packet-switched network must address, and say in a few words what each one asks.",
    a: "Addressing: how the destination is identified. Discovery: how its address is found. Packet sizing and framing: how packets are sized and separated. Medium sharing: how devices share a link fairly. Wireless adaptation: how packet switching is applied to radio links. Trade-offs: how speed, range and cost are balanced.",
    keys: ["address", "discover", "siz|fram", "medium|shar", "wireless|radio", "trade"],
    why: "Mnemonic: A D P M W T (“A Dog Packs My Wet Towel”). Watch the addressing/discovery distinction: identifying a destination vs finding its address." },

  { id: "switching-09", d: 2, type: "mc", src: "cheat",
    q: "According to the lecture, why was the TCP/IP protocol suite created?",
    choices: [
      "No single packet-switching technology could meet every need, so different networks were interconnected using open standards, and those standards form TCP/IP",
      "Circuit switching could not carry voice, so TCP/IP was created to carry telephone calls",
      "Ethernet was too slow, so TCP/IP was created to replace it",
      "Routers needed a way to reserve bandwidth for each connection"
    ],
    a: 0,
    why: "Different technologies suit different needs (LAN vs WAN, wired vs wireless), so no single one wins. TCP/IP is the set of **open standards** used to **interconnect** them. It runs over Ethernet rather than replacing it, and it makes no bandwidth reservations." },

  { id: "switching-10", d: 1, type: "mc", src: "cheat",
    q: "How does TCP/IP support diverse network technologies such as Wi-Fi, Ethernet, fibre and cellular?",
    choices: [
      "By reserving a circuit across every network",
      "With a common packet format and a common addressing system",
      "By requiring every network to use the same frame format",
      "By converting all networks to Ethernet"
    ],
    a: 1,
    why: "Lecture: TCP/IP supports diverse technologies through a **common packet format** and a **common addressing system** (IP packets and IP addresses). Each underlying network keeps its own frame format, and IP packets ride inside those frames." },

  { id: "switching-11", d: 3, type: "tf", src: "cheat",
    q: "To join Wi-Fi, Ethernet and cellular networks into one Internet, TCP/IP requires all of them to adopt the same link-layer frame format.",
    a: false,
    why: "False. The networks keep their **own** frame formats. TCP/IP adds a common **packet** format (IP) and common addressing on top, and routers carry the IP packet inside whatever native frame each network uses." },

  { id: "switching-12", d: 1, type: "mc", src: "text",
    q: "What does **store-and-forward** transmission mean?",
    choices: [
      "The switch must receive the entire packet before it begins transmitting the first bit of that packet onto the outbound link",
      "The source stores all packets until the destination confirms a circuit is set up",
      "The switch stores the packet permanently in case the destination asks for it later",
      "The switch forwards each bit as soon as it arrives"
    ],
    a: 0,
    why: "Kurose §1.3.1: most packet switches use store-and-forward at the inputs to links, meaning the **whole packet** must arrive and be buffered before the first bit goes out. Forwarding each bit as soon as it arrives is the opposite, often called cut-through." },

  { id: "switching-13", d: 2, type: "mc", src: "ch1-R11",
    q: "R11: Exactly one store-and-forward packet switch sits between a sending host and a receiving host. The host-to-switch link has rate R1 and the switch-to-host link has rate R2. Ignoring queuing, propagation and processing delay, what is the end-to-end delay for a packet of length L?",
    choices: [
      "2L/max(R1, R2)",
      "L/(R1 + R2)",
      "L/R1 + L/R2",
      "L/min(R1, R2)"
    ],
    a: 2,
    why: "The source needs L/R1 to push the packet onto link 1. Because of store-and-forward, the switch waits for all L bits before it starts link 2, which takes another L/R2. Total = **L/R1 + L/R2**. L/min(R1, R2) would be right only if the switch forwarded bits immediately." },

  { id: "switching-14", d: 2, type: "num", src: "text",
    q: "A 1,500-byte packet goes host → store-and-forward switch → host. The first link is 1 Mbps and the second is 10 Mbps. Ignoring queuing, propagation and processing, what is the end-to-end delay? Answer in ms.",
    a: 13.2, unit: "ms",
    why: "L = 1,500 × 8 = 12,000 bits.\nLink 1: L/R1 = 12,000 / 10^{6} = 0.012 s = 12 ms.\nLink 2: L/R2 = 12,000 / 10^{7} = 0.0012 s = 1.2 ms.\nTotal = 12 + 1.2 = 13.2 ms. The slow link dominates, but with store-and-forward you still pay both transmission times." },

  { id: "switching-15", d: 1, type: "num", src: "text",
    q: "A 1,000-byte packet travels over 5 links of 10 Mbps each (store-and-forward at every switch). Ignoring propagation, queuing and processing, what is the end-to-end delay? Answer in ms.",
    a: 4, unit: "ms",
    why: "L = 1,000 × 8 = 8,000 bits. L/R = 8,000 / 10^{7} = 0.8 ms.\nd = N·L/R = 5 × 0.8 ms = 4 ms." },

  { id: "switching-16", d: 2, type: "mc", src: "ch1-P2",
    q: "P2: Equation 1.1 gives N·L/R for one packet over N links of rate R. Generalize it: what is the delay to send **P** such packets back-to-back over the N links (ignoring propagation, queuing and processing)?",
    choices: [
      "(N + P − 1)·L/R",
      "N·P·L/R",
      "N·L/R + P",
      "(N + P)·L/R"
    ],
    a: 0,
    why: "The first packet reaches the destination at N·L/R. The packets follow one behind the other, so each later packet arrives L/R after the previous one, adding (P − 1)·L/R. Total = (N + P − 1)·L/R. Check with Figure 1.11 (N = 2, P = 3): 4L/R. N·P·L/R wrongly assumes no pipelining, as if each packet waited for the previous one to reach the destination." },

  { id: "switching-17", d: 3, type: "num", src: "ch1-P2",
    q: "Applying P2: a source sends 50 packets of 1,000 bytes back-to-back over 3 links of 4 Mbps each. Ignoring propagation, queuing and processing, when does the destination receive the last bit? Answer in ms.",
    a: 104, unit: "ms",
    why: "L = 8,000 bits; L/R = 8,000 / (4 × 10^{6}) = 2 ms.\nd = (N + P − 1)·L/R = (3 + 50 − 1) × 2 ms = 52 × 2 = 104 ms.\nA common mistake is N·P·L/R = 3 × 50 × 2 = 300 ms, which ignores that all three links transmit different packets at the same time." },

  { id: "switching-18", d: 2, type: "mc", src: "text",
    q: "In Figure 1.11 a source sends three L-bit packets back-to-back through one store-and-forward router to the destination (both links rate R, no propagation delay). When has the destination received all three packets?",
    choices: [
      "3L/R",
      "4L/R",
      "6L/R",
      "2L/R"
    ],
    a: 1,
    why: "At L/R the router has packet 1 and starts forwarding it while the source sends packet 2. At 2L/R the destination has packet 1. At 3L/R it has packet 2, and at **4L/R** it has packet 3. This is (N + P − 1)·L/R = (2 + 3 − 1)·L/R. 6L/R would be the delay if nothing overlapped." },

  { id: "switching-19", d: 3, type: "tf", src: "text",
    q: "If the router in Figure 1.11 forwarded each bit as soon as it arrived instead of using store-and-forward, the delay for one packet over the two links would be L/R (ignoring propagation).",
    a: true,
    why: "True. Kurose: “If the switch instead forwarded bits as soon as they arrive … then the total delay would be L/R since bits are not held up at the router.” With store-and-forward it is 2L/R. Routers store-and-forward because they need to receive, store and process the whole packet before forwarding." },

  { id: "switching-20", d: 2, type: "num", src: "ch1-P31a",
    ctx: "P31 (Figure 1.27): A 10^{6}-bit message is sent from a source host to a destination host over three links: source → packet switch → packet switch → destination. Every link is 5 Mbps. Ignore propagation, queuing and processing delays. Switches use store-and-forward.",
    q: "Without message segmentation, how long does it take to move the message from the source host to the first packet switch? Answer in seconds.",
    a: 0.2, unit: "s",
    why: "Transmission time of the whole message on one link = 10^{6} bits / (5 × 10^{6} bits/s) = 0.2 s." },

  { id: "switching-21", d: 2, type: "num", src: "ch1-P31a",
    ctx: "P31 (Figure 1.27): A 10^{6}-bit message is sent from a source host to a destination host over three links: source → packet switch → packet switch → destination. Every link is 5 Mbps. Ignore propagation, queuing and processing delays. Switches use store-and-forward.",
    q: "Still without segmentation, what is the total time to move the message from the source host to the destination host? Answer in seconds.",
    a: 0.6, unit: "s",
    why: "Each switch must store the entire 10^{6}-bit message before forwarding it, so the three hops happen one after another.\nTotal = 3 × 0.2 s = 0.6 s (that is, N·L/R with N = 3 and L = the whole message)." },

  { id: "switching-22", d: 2, type: "num", src: "ch1-P31b",
    ctx: "P31 (Figure 1.27): A 10^{6}-bit message is sent from a source host to a destination host over three links: source → packet switch → packet switch → destination. Every link is 5 Mbps. Ignore propagation, queuing and processing delays. Switches use store-and-forward.",
    q: "Now the message is segmented into 100 packets of 10,000 bits each. How long does it take to move the first packet from the source host to the first switch? Answer in ms.",
    a: 2, unit: "ms",
    why: "L/R = 10^{4} bits / (5 × 10^{6} bits/s) = 2 × 10^{−3} s = 2 ms." },

  { id: "switching-23", d: 3, type: "num", src: "ch1-P31b",
    ctx: "P31 (Figure 1.27): A 10^{6}-bit message is sent from a source host to a destination host over three links: source → packet switch → packet switch → destination. Every link is 5 Mbps. Ignore propagation, queuing and processing delays. Switches use store-and-forward.",
    q: "With 100 packets of 10,000 bits: while the first packet is sent from the first switch to the second switch, the second packet is sent from the source to the first switch. At what time is the second packet fully received at the first switch? Answer in ms.",
    a: 4, unit: "ms",
    why: "The source sends packet 1 from 0 to 2 ms, then immediately sends packet 2 from 2 to 4 ms. Packet 2 is fully received at the first switch at **4 ms**, exactly while packet 1 is crossing the second link (2–4 ms). That overlap is the pipelining that segmentation buys." },

  { id: "switching-24", d: 3, type: "num", src: "ch1-P31c",
    ctx: "P31 (Figure 1.27): A 10^{6}-bit message is sent from a source host to a destination host over three links: source → packet switch → packet switch → destination. Every link is 5 Mbps. Ignore propagation, queuing and processing delays. Switches use store-and-forward.",
    q: "With segmentation into 100 packets of 10,000 bits, how long does it take to move the whole file from source host to destination host? Answer in ms.",
    a: 204, unit: "ms",
    why: "The first packet arrives at 3 × 2 ms = 6 ms. Each of the remaining 99 packets arrives 2 ms after the one before it: 6 + 99 × 2 = 204 ms.\nSame thing with the formula: (N + P − 1)·L/R = (3 + 100 − 1) × 2 ms = 204 ms = 0.204 s.\nCompare with 0.6 s without segmentation: segmentation is about 2.9× faster because the three links work in parallel instead of one at a time." },

  { id: "switching-25", d: 2, type: "multi", src: "ch1-P31d",
    q: "P31(d): Besides reducing end-to-end delay, what are reasons to use message segmentation? Select all that apply.",
    choices: [
      "A bit error requires retransmitting only one small packet instead of the whole message",
      "Segmentation removes the need for headers",
      "Without segmentation, one huge message can occupy a switch's link and buffer for a long time and delay other users' small packets",
      "Segmentation guarantees packets arrive in order",
      "Switches need less buffer space for small packets than for whole messages"
    ],
    a: [0, 2, 4],
    why: "Smaller units limit the cost of a bit error (only that packet is resent), stop one large message from hogging links and buffers, and need less switch memory. Segmentation **adds** headers (one per packet), and packets can arrive out of order, so the receiver must reorder and reassemble them." },

  { id: "switching-26", d: 2, type: "short", src: "ch1-P31e",
    q: "P31(e): Discuss the drawbacks of message segmentation.",
    a: "Packets must be put back in sequence and reassembled into the message at the destination, which adds work and buffering. And because every packet carries its own header, the total header overhead grows with the number of packets. Very small packets waste a large fraction of each link on headers.",
    keys: ["reassembl|sequence|order", "header|overhead"],
    why: "This is the cost side of the trade-off in P33. Small packets improve pipelining but multiply header bytes. The receiver must also deal with packets that arrive out of order and put them back together." },

  { id: "switching-27", d: 3, type: "num", src: "ch1-P32",
    ctx: "P32 (adapted from the Message Segmentation animation): Same network as P31 (three 5 Mbps links, 10^{6}-bit message, 100 packets of 10,000 bits), but now each link also has a propagation delay of 10 ms.",
    q: "With message segmentation, when does the destination receive the last bit? Answer in ms.",
    a: 234, unit: "ms",
    why: "Without propagation it took (N + P − 1)·L/R = 204 ms. Each packet also needs one propagation delay per link, and with equal links the pipeline still flows without queuing, so add N·d_{prop} = 3 × 10 ms = 30 ms.\nTotal = 204 + 30 = 234 ms.\nFor message switching: 3 × 0.2 s + 3 × 10 ms = 0.63 s = 630 ms. Propagation adds the same 30 ms to both, so segmentation still saves 396 ms." },

  { id: "switching-28", d: 3, type: "mc", src: "ch1-P32",
    q: "P32: How do link propagation delays affect the overall end-to-end delay of packet switching with message segmentation compared with message switching?",
    choices: [
      "Propagation delay is paid once per packet, so segmentation becomes slower than message switching",
      "Propagation delay only affects message switching",
      "Propagation delay cancels the benefit of pipelining",
      "Both pay one propagation delay per link (N·d_{prop}), so propagation adds the same amount to each and doesn't change the time saved by segmentation"
    ],
    a: 3,
    why: "Propagation is the travel time of a bit across a link. In both schemes the last bit crosses each of the N links once, so both get + N·d_{prop}. Propagation overlaps with the pipelined transmissions instead of being paid per packet. Segmentation saves only **transmission** time, and that saving is unchanged." },

  { id: "switching-29", d: 3, type: "mc", src: "ch1-P33",
    q: "P33: A file of F bits crosses 3 uncongested links (2 switches), each of rate R. The source segments it into S-bit segments and adds an 80-bit header to each, so packets are L = 80 + S bits. Ignoring propagation, which segment size S minimizes the time to move the file?",
    choices: [
      "S = 80",
      "S = F",
      "S = √(80F)",
      "S = √(40F)"
    ],
    a: 3,
    why: "Number of packets = F/S. With store-and-forward over 3 links:\nd(S) = (F/S + 3 − 1)·(80 + S)/R = (F/S + 2)(80 + S)/R.\nExpand the numerator: F + 80F/S + 2S + 160.\nd/dS: −80F/S^{2} + 2 = 0, so S^{2} = 40F and **S = √(40F)**.\nS = F (no segmentation) loses all pipelining. S = 80 makes half of every packet header." },

  { id: "switching-30", d: 3, type: "num", src: "ch1-P33",
    q: "Using P33's result, what segment size S minimizes the delay for a file of F = 10^{6} bits (3 links, 80-bit headers)? Answer in bits.",
    a: 6325, unit: "bits", tol: 0.02,
    why: "S = √(40F) = √(40 × 10^{6}) = √(4 × 10^{7}) ≈ 6,325 bits.\nCheck with R = 1 Mbps: d = (10^{6}/6,325 + 2)(80 + 6,325)/10^{6} ≈ 1.025 s. Sending the file as one packet takes 3 × (10^{6} + 80)/10^{6} ≈ 3.0 s, and 1,000-bit segments take ≈ 1.082 s. Both are worse." },

  { id: "switching-31", d: 1, type: "mc", src: "text",
    q: "In a packet switch, where does a packet wait when the outgoing link is busy transmitting another packet?",
    choices: [
      "On the incoming link, which pauses until the router is free",
      "In the output buffer (output queue) for that outgoing link",
      "In the sending host's application",
      "In the routing protocol's table"
    ],
    a: 1,
    why: "Each packet switch keeps an **output buffer** for every attached link. A packet that needs a busy link waits there, and that wait is the queuing delay. It varies with how congested the network is." },

  { id: "switching-32", d: 2, type: "mc", src: "text",
    q: "A packet arrives at a router and finds the output buffer for its link completely full. According to Kurose, what happens?",
    choices: [
      "The router sends the packet back to the source",
      "Packet loss: either the arriving packet or one of the already-queued packets is dropped",
      "The packet is forwarded on a random other link",
      "The router reserves more buffer space from a neighbouring router"
    ],
    a: 1,
    why: "Buffer space is finite, so when it's full **packet loss** occurs. The arriving packet, or one already in the queue, is dropped. Packet-switched networks don't bounce packets back or borrow buffers." },

  { id: "switching-33", d: 2, type: "mc", src: "text",
    q: "In Figure 1.12, Hosts A and B send to Host E over 100 Mbps Ethernet links into a router whose outgoing link is 15 Mbps. When does congestion (queuing) occur at the router?",
    choices: [
      "Only when the arrival rate exceeds 100 Mbps",
      "Only when A and B send to different destinations",
      "When, over a short interval, the combined arrival rate of packets exceeds 15 Mbps",
      "Never, because the input links are faster than the output link"
    ],
    a: 2,
    why: "Queuing builds in the 15 Mbps link's output buffer whenever arrivals (in bits/s) exceed **15 Mbps** for a while. For example, A and B each send a burst of five back-to-back packets at once. Fast 100 Mbps inputs make this **more** likely, not less." },

  { id: "switching-34", d: 1, type: "mc", src: "text",
    q: "What does a router's **forwarding table** map?",
    choices: [
      "Destination addresses (or portions of them) to the router's outbound links",
      "Each circuit to its time slot",
      "Each link to its propagation delay",
      "Source addresses to application port numbers"
    ],
    a: 0,
    why: "Each router has a forwarding table that maps destination addresses, or portions of them, to outbound links. When a packet arrives, the router looks up the destination IP address in the header and sends the packet to the matching link." },

  { id: "switching-35", d: 1, type: "tf", src: "text",
    q: "In the Internet, forwarding tables are set automatically by routing protocols, for example by computing shortest paths to each destination.",
    a: true,
    why: "True. Kurose: the Internet has special **routing protocols** that automatically set forwarding tables, e.g. by determining the shortest path from each router to each destination. Forwarding uses the table; routing builds it." },

  { id: "switching-36", d: 2, type: "short", src: "ch1-R20",
    q: "R20: End system A wants to send a large file to end system B. At a high level, how does A create packets from the file? When a packet arrives at a router, what information does the router use to pick the outgoing link? Why is packet switching in the Internet like driving between cities and asking for directions along the way?",
    a: "A breaks the file into chunks and adds a header to each chunk, forming packets. Each header includes B's IP address as the destination. A router looks up the packet's destination IP address in its forwarding table to choose the outbound link. Like a driver asking at each gas station, each router uses (part of) the destination address to choose only the next step, and no one needs the whole route in advance.",
    keys: ["chunk|break|divide|segment", "header", "destination IP|destination address", "forwarding table|outbound link|outgoing link", "directions|ask|gas station|next step"],
    why: "In Kurose's analogy, Joe drives from Philadelphia to 156 Lakeside Drive, Orlando, and asks gas-station attendants along the way. Each extracts part of the address (Florida, Orlando, Lakeside Drive, 156) and gives the next direction. Attendants are routers, the address is the packet's hierarchical destination IP address, and each “which road” answer is a forwarding-table lookup." },

  { id: "switching-37", d: 2, type: "mc", src: "text",
    q: "In Kurose's driving analogy, each gas-station attendant reads only part of Joe's destination address and tells him the next road. What do the attendants represent?",
    choices: [
      "Links that carry the bits",
      "Circuits reserved for Joe's trip",
      "End systems that run the application",
      "Routers, each using a portion of the packet's destination address to choose the next outbound link"
    ],
    a: 3,
    why: "The attendants (and the kid on the bicycle) are **routers**. Because addresses are hierarchical, each router matches only the part of the address it needs (as the attendant in Jacksonville cares only about “Orlando”) and forwards toward it. No router knows the whole path in advance." },

  { id: "switching-38", d: 1, type: "mc", src: "text",
    q: "In a circuit-switched network, which resources are reserved for the duration of a communication session?",
    choices: [
      "Only the sending host's CPU",
      "Resources along the path such as buffers and link transmission rate",
      "Only the destination's IP address",
      "Nothing; resources are used on demand"
    ],
    a: 1,
    why: "Kurose: in circuit-switched networks, the resources needed along a path (**buffers, link transmission rate**) are reserved for the session's duration. In packet-switched networks nothing is reserved, so packets may queue." },

  { id: "switching-39", d: 1, type: "num", src: "text",
    q: "A circuit-switched link of 1.6 Mbps is divided into 4 circuits (as in Figure 1.13). What transmission rate does each end-to-end connection get? Answer in kbps.",
    a: 400, unit: "kbps",
    why: "Each connection gets 1/4 of each link it uses: 1.6 Mbps / 4 = 0.4 Mbps = 400 kbps. With Kurose's 1 Mbps links the answer is 250 kbps." },

  { id: "switching-40", d: 2, type: "num", src: "ch1-P4a",
    ctx: "P4: The circuit-switched network of Figure 1.13 has four switches connected in a ring by four links, and each link has four circuits. Label the switches A, B, C, D going clockwise, so the links are A–B, B–C, C–D and D–A.",
    q: "What is the maximum number of simultaneous connections that can be in progress at one time in this network?",
    a: 16, unit: "connections",
    why: "A connection needs at least one circuit on at least one link. The most connections fit when each uses just one link, i.e. connections between adjacent switches (A–B, B–C, C–D, D–A).\nMaximum = 4 links × 4 circuits = 16 connections." },

  { id: "switching-41", d: 3, type: "num", src: "ch1-P4b",
    ctx: "P4: The circuit-switched network of Figure 1.13 has four switches connected in a ring by four links, and each link has four circuits. Label the switches A, B, C, D going clockwise, so the links are A–B, B–C, C–D and D–A.",
    q: "Suppose all connections are between switches A and C. What is the maximum number of simultaneous connections?",
    a: 8, unit: "connections",
    why: "An A–C connection must use two links: A–B–C or A–D–C.\nVia B: 4 connections use up all circuits on A–B and B–C.\nVia D: 4 more use up A–D and D–C.\nMaximum = 4 + 4 = 8." },

  { id: "switching-42", d: 3, type: "mc", src: "ch1-P4c",
    ctx: "P4: The circuit-switched network of Figure 1.13 has four switches connected in a ring by four links, and each link has four circuits. Label the switches A, B, C, D going clockwise, so the links are A–B, B–C, C–D and D–A.",
    q: "We want four connections between A and C **and** four connections between B and D. Can all eight be routed?",
    choices: [
      "No: the four A–C calls necessarily use every circuit on two links",
      "Yes: route two A–C calls via B and two via D, and two B–D calls via A and two via C, so every link carries exactly 4 circuits",
      "Only if each link had 8 circuits",
      "No: the ring can carry at most 6 two-hop calls"
    ],
    a: 1,
    why: "Split each group across both directions around the ring:\nA–C via B: 2 calls on A–B and B–C. A–C via D: 2 calls on A–D and D–C.\nB–D via A: 2 calls on B–A and A–D. B–D via C: 2 calls on B–C and C–D.\nLink loads: A–B = 2 + 2 = 4, B–C = 2 + 2 = 4, C–D = 2 + 2 = 4, D–A = 2 + 2 = 4. Every link is exactly full, so yes, all 8 fit. The claim that the A–C calls necessarily use up two whole links only holds if all four take the same side." },

  { id: "switching-43", d: 1, type: "mc", src: "text",
    q: "With frequency-division multiplexing (FDM) in a telephone network, what does each connection get?",
    choices: [
      "The full link bandwidth whenever it has data",
      "A dedicated frequency band (typically 4 kHz wide) for the duration of the connection",
      "A dedicated physical wire",
      "One time slot in every frame"
    ],
    a: 1,
    why: "FDM divides the link's frequency spectrum, and each connection gets its own **frequency band** for its duration. Telephone bands are typically **4 kHz**, and the band's width is called its bandwidth. One slot per frame is TDM. Full bandwidth on demand is packet switching." },

  { id: "switching-44", d: 2, type: "mc", src: "text",
    q: "Which statement correctly contrasts FDM and TDM (Figure 1.14)?",
    choices: [
      "FDM: each circuit gets all the bandwidth in brief slots. TDM: each circuit continuously gets a fraction of the bandwidth",
      "FDM: each circuit continuously gets a fraction of the bandwidth. TDM: each circuit gets all of the bandwidth periodically, during brief time slots",
      "FDM and TDM both allocate bandwidth only when a user has data to send",
      "TDM requires analog hardware to shift signals into frequency bands"
    ],
    a: 1,
    why: "That is Figure 1.14's caption. The option giving FDM the brief full-bandwidth slots swaps them. Both are circuit-switching techniques that reserve capacity whether or not it is used, so “allocate only when a user has data” describes packet switching instead. The analog frequency-shifting hardware is needed for **FDM**, not TDM." },

  { id: "switching-45", d: 2, type: "num", src: "text",
    q: "A TDM link sends 4,000 frames per second, and each slot holds 10 bits. What is the transmission rate of one circuit? Answer in kbps.",
    a: 40, unit: "kbps",
    why: "TDM circuit rate = frame rate × bits per slot = 4,000 frames/s × 10 bits = 40,000 bits/s = 40 kbps. (Kurose's example: 8,000 × 8 = 64 kbps.)" },

  { id: "switching-46", d: 3, type: "num", src: "text",
    q: "How long does it take to send a 960,000-bit file over a circuit-switched network whose links use TDM with 32 slots at 2.048 Mbps, if setting up the end-to-end circuit takes 250 ms? Answer in seconds.",
    a: 15.25, unit: "s",
    why: "Circuit rate = 2.048 Mbps / 32 = 64 kbps.\nTransmission = 960,000 / 64,000 = 15 s.\nTotal = 15 s + 0.25 s = 15.25 s.\nThis is the same method as Kurose's 640,000-bit example (64 kbps, 10 s + 0.5 s = 10.5 s). There is no per-link multiplication." },

  { id: "switching-47", d: 2, type: "tf", src: "text",
    q: "In a circuit-switched network, the time to transmit a file over an established circuit is the same whether the circuit passes through one link or a hundred links (ignoring propagation delay).",
    a: true,
    why: "True. Kurose: “the transmission time is independent of the number of links.” The circuit streams bits end to end at its reserved rate with no store-and-forward at each switch, so file size ÷ circuit rate is paid once. Propagation delay would add a little per link." },

  { id: "switching-48", d: 2, type: "short", src: "ch1-R12",
    q: "R12: What advantage does a circuit-switched network have over a packet-switched network? What advantages does TDM have over FDM in a circuit-switched network?",
    a: "A circuit-switched network can guarantee a certain amount of end-to-end bandwidth (a constant rate with no queuing) for the duration of a call. Packet-switched networks like the Internet make no such guarantees. TDM's advantage over FDM: FDM needs sophisticated analog hardware to shift each signal into its own frequency band, while TDM simply gives each circuit the whole link during its time slots.",
    keys: ["guarantee|guaranteed|reserved|dedicated", "bandwidth|rate|constant", "analog|frequency band|shift"],
    why: "Circuit switching reserves capacity, so the rate is predictable and there is no queuing delay, which is good for real-time voice. The Internet is best effort. For TDM vs FDM, the textbook answer is that FDM requires analog hardware to move each signal into its frequency band. TDM is a simpler, digital time-sharing scheme." },

  { id: "switching-49", d: 1, type: "num", src: "ch1-R13a",
    ctx: "R13: Users share a 2 Mbps link. Each user transmits continuously at 1 Mbps when transmitting, but transmits only 20 percent of the time.",
    q: "When circuit switching is used, how many users can be supported?",
    a: 2, unit: "users",
    why: "Circuit switching must reserve each user's full 1 Mbps at all times: 2 Mbps / 1 Mbps = 2 users." },

  { id: "switching-50", d: 2, type: "short", src: "ch1-R13b",
    ctx: "R13: Users share a 2 Mbps link. Each user transmits continuously at 1 Mbps when transmitting, but transmits only 20 percent of the time.",
    q: "Now suppose packet switching is used. Why will there be essentially no queuing delay before the link if two or fewer users transmit at the same time? Why will there be queuing delay if three users transmit at the same time?",
    a: "With two or fewer active users the total input rate is at most 2 × 1 Mbps = 2 Mbps, which the 2 Mbps link can carry, so packets don't pile up. With three active users the input is 3 Mbps, more than the 2 Mbps link rate. Packets arrive faster than they can be sent, so the queue grows.",
    keys: ["2 Mbps|link rate|capacity", "3 Mbps|exceeds|greater than|more than", "queue grow|queue|faster than"],
    why: "A queue grows whenever the aggregate arrival rate exceeds the output link rate. It keeps growing until the arrival rate drops back below the link rate, and then it drains." },

  { id: "switching-51", d: 1, type: "num", src: "ch1-R13c",
    ctx: "R13: Users share a 2 Mbps link. Each user transmits continuously at 1 Mbps when transmitting, but transmits only 20 percent of the time.",
    q: "Find the probability that a given user is transmitting.",
    a: 0.2, unit: "",
    why: "Each user transmits 20% of the time, so p = 0.2." },

  { id: "switching-52", d: 2, type: "num", src: "ch1-R13d",
    ctx: "R13: Users share a 2 Mbps link. Each user transmits continuously at 1 Mbps when transmitting, but transmits only 20 percent of the time.",
    q: "Suppose there are three users. Find the probability that at any given time all three are transmitting simultaneously. (This is also the fraction of time during which the queue grows.)",
    a: 0.008, unit: "", tol: 0.02,
    why: "Users are independent, so P(all three) = 0.2 × 0.2 × 0.2 = 0.2^{3} = 0.008.\nThe queue grows only when the input (3 Mbps) exceeds the link (2 Mbps), which happens only when all three transmit. So the queue grows 0.8% of the time." },

  { id: "switching-53", d: 1, type: "num", src: "ch1-P8a",
    ctx: "P8: Users share a 10 Mbps link. Each user requires 200 kbps when transmitting, but transmits only 10 percent of the time.",
    q: "When circuit switching is used, how many users can be supported?",
    a: 50, unit: "users",
    why: "10 Mbps / 200 kbps = 10,000 kbps / 200 kbps = 50 users. Each needs its 200 kbps reserved all the time." },

  { id: "switching-54", d: 1, type: "num", src: "ch1-P8b",
    ctx: "P8: Users share a 10 Mbps link. Each user requires 200 kbps when transmitting, but transmits only 10 percent of the time.",
    q: "With packet switching, find the probability that a given user is transmitting.",
    a: 0.1, unit: "",
    why: "Each user transmits 10% of the time, so p = 0.1." },

  { id: "switching-55", d: 2, type: "mc", src: "ch1-P8c",
    ctx: "P8: Users share a 10 Mbps link. Each user requires 200 kbps when transmitting, but transmits only 10 percent of the time.",
    q: "Suppose there are 120 users. What is the probability that at any given time **exactly n** users are transmitting simultaneously?",
    choices: [
      "C(120, n) · (0.9)^{n} · (0.1)^{120−n}",
      "n / 120",
      "C(120, n) · (0.1)^{n} · (0.9)^{120−n}",
      "(0.1)^{n}"
    ],
    a: 2,
    why: "Each user is independently active with p = 0.1, so the number active is Binomial(120, 0.1). Choose which n users are active (C(120, n) ways), multiply by p^{n} for those being active and (1 − p)^{120−n} for the rest being idle. The option with (0.9)^{n}(0.1)^{120−n} swaps p and 1 − p." },

  { id: "switching-56", d: 3, type: "num", src: "ch1-P8c",
    ctx: "P8: Users share a 10 Mbps link. Each user requires 200 kbps when transmitting, but transmits only 10 percent of the time.",
    q: "With 120 users, what is the probability that exactly 12 users are transmitting at a given time? Give a decimal (e.g. 0.25).",
    a: 0.1205, unit: "", tol: 0.02,
    why: "P(12) = C(120, 12) · (0.1)^{12} · (0.9)^{108}.\nC(120, 12) ≈ 1.054 × 10^{16}, (0.1)^{12} = 10^{−12}, (0.9)^{108} ≈ 1.14 × 10^{−5}.\nP(12) ≈ 0.1205. Twelve is the mean (120 × 0.1), and even so the probability of hitting it exactly is only about 12%." },

  { id: "switching-57", d: 3, type: "mc", src: "ch1-P8d",
    ctx: "P8: Users share a 10 Mbps link. Each user requires 200 kbps when transmitting, but transmits only 10 percent of the time.",
    q: "With 120 users, what is the probability that 51 or more users are transmitting simultaneously (i.e. the link is overloaded)?",
    choices: [
      "About 0.5",
      "About 0.12",
      "About 0.0004",
      "About 2 × 10^{−20}, essentially zero"
    ],
    a: 3,
    why: "P(≥ 51) = Σ_{n=51}^{120} C(120, n)(0.1)^{n}(0.9)^{120−n} = 1 − Σ_{n=0}^{50} (…) ≈ 2.1 × 10^{−20}.\nSanity check with the normal approximation: mean = 120 × 0.1 = 12, standard deviation = √(120 × 0.1 × 0.9) ≈ 3.29. Reaching 51 is about (50.5 − 12)/3.29 ≈ 11.7 standard deviations above the mean, which practically never happens.\nSo packet switching serves 120 users where circuit switching serves 50, with essentially no overload. 0.0004 is the textbook's 35-user example, not this one." },

  { id: "switching-58", d: 1, type: "num", src: "ch1-P9a",
    ctx: "P9: In Kurose's packet-vs-circuit example, users generate 100 kbps when busy and are busy with probability p = 0.1. Now the 1 Mbps link is replaced by a 1 Gbps link.",
    q: "What is N, the maximum number of users that can be supported simultaneously under circuit switching?",
    a: 10000, unit: "users",
    why: "N = 1 Gbps / 100 kbps = 10^{9} / 10^{5} = 10,000 users." },

  { id: "switching-59", d: 3, type: "mc", src: "ch1-P9b",
    ctx: "P9: In Kurose's packet-vs-circuit example, users generate 100 kbps when busy and are busy with probability p = 0.1. Now the 1 Mbps link is replaced by a 1 Gbps link.",
    q: "Now consider packet switching with M users. Which formula gives the probability that **more than N** users are sending data?",
    choices: [
      "C(M, N) · p^{N} · (1 − p)^{M−N}",
      "Σ_{n=N+1}^{M} C(M, n) · p^{n} · (1 − p)^{M−n}",
      "Σ_{n=0}^{N} C(M, n) · p^{n} · (1 − p)^{M−n}",
      "1 − p^{M}"
    ],
    a: 1,
    why: "The number of active users is Binomial(M, p). “More than N” means n = N + 1 through M, so sum those terms. The sum from n = 0 to N is the complement (at most N active, i.e. no overload), and C(M, N)·p^{N}·(1 − p)^{M−N} is P(exactly N). Equivalently, the answer is 1 − Σ_{n=0}^{N} C(M, n) p^{n} (1 − p)^{M−n}." },

  { id: "switching-60", d: 2, type: "mc", src: "text",
    q: "In Kurose's example (1 Mbps link; each user needs 100 kbps when active and is active 10% of the time), circuit switching supports 10 users. How many users does the textbook show packet switching can serve with essentially the same performance?",
    choices: [
      "11 users",
      "10 users",
      "35 users",
      "100 users"
    ],
    a: 2,
    why: "With 35 users, P(11 or more active at once) ≈ 0.0004. So 99.96% of the time at most 10 are active, the aggregate rate is ≤ 1 Mbps, and packets flow essentially without delay. That is more than three times the users of circuit switching for practically the same performance, which is the power of statistical multiplexing." },

  { id: "switching-61", d: 3, type: "num", src: "text",
    q: "Same setup as Kurose's example (1 Mbps link, 100 kbps per active user, each active independently with p = 0.1), but now 40 users share the link. What is the probability that 11 or more are active at once (so the queue grows)? Give a decimal.",
    a: 0.00147, unit: "", tol: 0.05,
    why: "The overload threshold is still N = 1 Mbps / 100 kbps = 10.\nP(≥ 11) = Σ_{n=11}^{40} C(40, n)(0.1)^{n}(0.9)^{40−n} ≈ 0.00147.\nThat is about 3.5× the 35-user value (≈ 0.00042) but still only about 0.15% of the time. Adding users slowly raises the overload probability." },

  { id: "switching-62", d: 2, type: "num", src: "text",
    q: "20 users share a 2 Mbps link using TDM with 20 slots per frame. One user suddenly has 4 × 10^{6} bits to send while everyone else is silent. How long does the transfer take with TDM? Answer in seconds. (With packet switching it would take 2 s.)",
    a: 40, unit: "s",
    why: "Under TDM the user may use only its own slot: 1/20 of 2 Mbps = 100 kbps.\nTime = 4 × 10^{6} / 10^{5} = 40 s, while the other 19 slots in every frame sit idle.\nPacket switching gives the lone active user the full 2 Mbps: 4 × 10^{6} / (2 × 10^{6}) = 2 s. This is Kurose's second example (10 s vs 1 s) with different numbers." },

  { id: "switching-63", d: 2, type: "multi", src: "text",
    q: "Which arguments do proponents of packet switching make (Kurose §1.3.2)? Select all that apply.",
    choices: [
      "It is simpler, more efficient and less costly to implement",
      "It never loses packets",
      "Circuit switching wastes reserved capacity during silent periods",
      "It offers better sharing of transmission capacity than circuit switching",
      "It guarantees a constant end-to-end delay"
    ],
    a: [0, 2, 3],
    why: "Proponents argue that packet switching shares capacity better and is simpler, more efficient and cheaper, and they point out that circuits sit idle during silences (the phone-call and radiologist examples). Packet switching does **not** guarantee delay (its delay is variable, which is the main criticism) and it **can** lose packets when buffers overflow." },

  { id: "switching-64", d: 2, type: "mc", src: "text",
    q: "Kurose's radiologist sets up a circuit, requests an x-ray, studies it, then requests another. What does this example illustrate?",
    choices: [
      "Store-and-forward adds delay at every hop",
      "Packet switching has unpredictable delay",
      "TDM is more efficient than FDM",
      "Circuit switching wastes reserved resources during idle periods, when other connections can't use them"
    ],
    a: 3,
    why: "While the radiologist contemplates the image, the circuit's reserved bandwidth goes unused, and nobody else can use it. Proponents of packet switching use this (and silent periods in phone calls) to argue that circuit switching is wasteful." },

  { id: "switching-65", d: 2, type: "tf", src: "text",
    q: "Critics argue that packet switching is not suitable for real-time services such as phone and video calls, mainly because of its variable and unpredictable queuing delays.",
    a: true,
    why: "True. Variable, unpredictable end-to-end delay, caused mainly by queuing, is the classic criticism of packet switching for real-time services. The counter-argument is better sharing, plus being simpler, more efficient and cheaper." },

  { id: "switching-66", d: 3, type: "short", src: "ch1-P3a",
    ctx: "P3: An application transmits data at a steady rate (the sender generates an N-bit unit of data every k time units, where k is small and fixed). Once started, it runs for a relatively long period of time.",
    q: "Would a packet-switched or a circuit-switched network be more appropriate for this application? Why?",
    a: "Circuit switching. The application has steady, predictable, long-lived demand, so a circuit with exactly the needed rate can be reserved once. The setup cost is spread over a long session, no reserved capacity is wasted because the app is never idle, and the app gets a guaranteed rate with no queuing delay.",
    keys: ["circuit", "steady|constant|predictable", "long|setup|amortiz", "guarantee|reserved|not wasted|no waste|no queuing"],
    why: "Packet switching wins when traffic is bursty (statistical multiplexing exploits idle periods). This traffic has no idle periods, so the main drawback of circuit switching, wasted reserved capacity, disappears. Its advantages remain: a guaranteed rate and predictable delay." },

  { id: "switching-67", d: 3, type: "short", src: "ch1-P3b",
    ctx: "P3: An application transmits data at a steady rate (the sender generates an N-bit unit of data every k time units, where k is small and fixed). Once started, it runs for a relatively long period of time.",
    q: "Suppose a packet-switched network is used, the only traffic comes from such applications, and the sum of the application data rates is less than the capacity of each and every link. Is some form of congestion control needed? Why?",
    a: "No (or essentially none). Even in the worst case, when all the applications transmit at once over a link, that link has enough capacity for the sum of their rates. Arrivals never exceed any link's rate for long, queues don't build up, and there is no congestion to control.",
    keys: ["no|not needed|unnecessary", "sum|enough capacity|less than capacity|sufficient", "simultaneous|worst case|all at once|at the same time", "no queue|little queuing|no congestion|queues don't build"],
    why: "Congestion happens when the aggregate arrival rate at a link exceeds its capacity. Here that can't happen on any link, even if everyone transmits simultaneously, so at most there is momentary queuing from packets arriving at the same instant. Congestion control would have nothing to do." }
]);
