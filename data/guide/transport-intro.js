NET.addSection({
  id: "transport-intro",
  unit: 3,
  order: 15,
  title: "Transport-layer services",
  short: "Transport services",
  cheat: "p.163–173",
  text: "§3.1",
  minutes: 20,
  summary: "The transport layer gives application processes the illusion of a direct link to processes on other hosts. Exams test the process-to-process vs host-to-host distinction, the fact that transport runs only in end systems, what the network layer's limits mean for transport, and exactly what UDP and TCP each add on top of IP's best-effort service.",
  mustKnow: [
    "Transport layer = logical communication between [[processes]] on different hosts; network layer = logical communication between [[hosts]].",
    "Transport protocols run only in [[end systems]]. Routers act only on [[network-layer fields]] and never inspect transport headers.",
    "Sender: (possibly) split the message into chunks, add a transport header → [[segment]] → network layer wraps it in a [[datagram]]. Receiver: network layer extracts the segment, transport delivers the data to the app.",
    "Transport cannot guarantee what the network cannot: no [[delay or bandwidth guarantees]] over IP. It CAN add [[reliable data transfer]] and [[encryption]] on top of an unreliable network.",
    "IP is [[best-effort]] (unreliable): no guarantee of delivery, order, or data integrity. Every host has [[at least one IP address]].",
    "UDP provides only two services: [[process-to-process delivery]] (multiplexing/demultiplexing) and [[error checking]].",
    "TCP adds [[reliable data transfer]] (flow control, sequence numbers, ACKs, timers) and [[congestion control]].",
    "TCP traffic is [[regulated]] by congestion control; UDP traffic is unregulated — the app can send at [[any rate]] it pleases.",
    "The developer picks UDP or TCP [[when creating the socket]]. Both ends must use a [[compatible transport protocol]]; IP connectivity alone is not enough.",
    "Terminology: the transport packet is a [[segment]] (for both TCP and UDP); [[datagram]] is reserved for the network-layer packet."
  ],
  topics: [
    {
      title: "Logical communication between processes",
      src: "both",
      blocks: [
        { def: "Logical communication", text: "From the application's point of view, the hosts running the communicating processes [[appear directly connected]], even if they are on opposite sides of the planet, joined by many routers and many kinds of links. The transport layer hides the [[underlying network infrastructure]] from applications." },
        { p: "Figure 3.1 draws logical end-to-end transport between, for example, a home network and a data-center network, through local, regional and national/global ISPs. Only the two **end systems** implement all five layers. Every router in between implements only the [[network, link and physical]] layers — there is no transport layer in a router." },
        { list: [
          "Transport-layer protocols are implemented in the [[end systems]], not in network routers.",
          "Routers act only on the [[network-layer fields]] of the datagram. They neither act on nor recognise any information the transport layer added.",
          "Inside an end system, the transport protocol moves messages between application processes and the network edge (the network layer). It has [[no say]] in how messages move through the network core.",
          "A network can offer more than one transport protocol. The Internet offers [[TCP and UDP]], each with a different set of services."
        ] },
        { diagram: "stack" },
        { trap: "“Routers run TCP because TCP traffic passes through them.” Wrong. A router forwards IP datagrams using IP-header fields only; the TCP or UDP header is just payload to it. Port numbers, sequence numbers and checksums of the segment are read only at the two end systems." }
      ]
    },
    {
      title: "Sending and receiving a segment",
      src: "both",
      blocks: [
        { steps: [
          "The sending application process passes a message to the transport layer (through its socket).",
          "The transport layer (possibly) breaks the message into [[smaller chunks]].",
          "It adds a [[transport-layer header]] to each chunk, creating a transport-layer segment.",
          "It passes each segment to the network layer, which encapsulates it in a network-layer packet (a [[datagram]]) and sends it toward the destination."
        ], title: "Sending side" },
        { steps: [
          "The network layer at the receiving host [[extracts the segment]] from the arriving datagram.",
          "It passes the segment up to the transport layer.",
          "The transport layer [[processes the segment]] (checks it, finds the right socket).",
          "It makes the segment's data available to the [[receiving application]] process."
        ], title: "Receiving side" },
        { diagram: "encapsulation" },
        { p: "In encapsulation notation: message M → segment H_{t}·M → datagram H_{n}·H_{t}·M → frame H_{l}·H_{n}·H_{t}·M. The transport header H_{t} holds what transport services need (e.g. [[port numbers]], a checksum). The network header H_{n} holds what is needed to reach the [[destination host]] (e.g. IP addresses)." },
        { example: {
          q: "A transport layer splits a 6,000-byte application message into 5 chunks. How many transport headers are added, and how many network-layer datagrams carry the message onto the first link (no aggregation)?",
          a: "Each chunk gets its own transport header → 5 segments → 5 transport headers.\nEach segment travels in its own datagram → 5 datagrams (5 network headers), and each datagram goes in its own frame on the link → 5 sets of link-layer overhead."
        } }
      ]
    },
    {
      title: "Transport vs network layer: the household analogy",
      src: "both",
      blocks: [
        { p: "Two houses, one on the East Coast and one on the West Coast, each home to [[12 kids]]; the kids in one house are cousins of the kids in the other. Every kid writes every cousin once a week, one letter per envelope, sent by the postal service. So each household sends [[144 letters]] (12 × 12) to the other each week. **Ann** (West Coast house) and **Bill** (East Coast house) collect their siblings' outgoing mail and hand it to the postal carrier, and they distribute incoming mail to their siblings." },
        { table: { head: ["In the analogy", "In the network"], rows: [
          ["Letters in envelopes", "Application messages"],
          ["Cousins (the kids)", "Processes"],
          ["Houses", "Hosts (end systems)"],
          ["Ann and Bill", "Transport-layer protocol"],
          ["Postal service (incl. mail carriers)", "Network-layer protocol"]
        ] }, caption: "Textbook mapping (§3.1.1) — memorise it" },
        { list: [
          "The postal service moves mail [[house to house]] (host-to-host), not person to person.",
          "Ann and Bill provide [[cousin-to-cousin]] (process-to-process) delivery. To the cousins, Ann and Bill **are** the mail service, even though they are only the end-system part of delivery.",
          "Ann and Bill work only [[inside their homes]]. They never sort mail at an intermediate mail center, just as transport protocols live only in end systems and routers never act on transport information.",
          "When they go on vacation, [[Susan and Harvey]] substitute: they collect and drop off mail less often and occasionally lose letters (the family dog chews some). Different collectors = different service model, just as a network can offer [[multiple transport protocols]] with different service models.",
          "If the postal service promises no maximum delivery time, Ann and Bill cannot promise one either: transport services are [[constrained by the network layer's]] service model.",
          "Bill handing out arriving letters by name is [[demultiplexing]]; Ann collecting her siblings' letters for the carrier is [[multiplexing]] (see §3.2)."
        ] },
        { example: {
          q: "Extend the analogy. What plays the role of (a) a router, and (b) the destination port number?",
          a: "(a) An intermediate post office or mail-sorting center: part of the postal service (network layer). It reads only the house address on the envelope, never the letter inside.\n(b) The cousin's name. Bill uses it to decide which sibling gets the letter, just as the receiving transport layer uses the destination port to choose the socket."
        } }
      ]
    },
    {
      title: "What transport can and cannot add over the network layer",
      src: "both",
      blocks: [
        { p: "Transport services are limited by what the network layer provides. If the network layer cannot guarantee [[delay or bandwidth]] for segments between hosts, the transport layer cannot guarantee them for messages between processes." },
        { p: "Some services can still be added even though the network layer lacks them, because the end systems can implement them alone:" },
        { table: { head: ["Service", "Possible over IP?", "Why / how"], rows: [
          ["Reliable data transfer", "Yes", "End systems detect and repair loss, corruption (garbling) and duplication with checksums, sequence numbers, ACKs, timers and retransmission (TCP)"],
          ["Confidentiality (encryption)", "Yes", "Encrypt application messages so intruders cannot read them, even though the network layer cannot keep segments confidential (Ch. 8)"],
          ["Error detection", "Yes", "Checksum field in the UDP/TCP header"],
          ["Maximum delay bound", "No", "IP promises no timing, so neither TCP nor UDP can"],
          ["Bandwidth / throughput guarantee", "No", "IP reserves no bandwidth"]
        ] } },
        { trap: "Do not conclude “IP is unreliable, so nothing above it can be reliable.” TCP builds a reliable, in-order service on top of unreliable IP. What transport can NOT create is a [[timing or bandwidth guarantee]]." }
      ]
    },
    {
      title: "IP's best-effort service model",
      src: "both",
      blocks: [
        { def: "Best-effort delivery (IP)", text: "IP makes its “best effort” to deliver segments between communicating hosts but makes [[no guarantees]]: not delivery, not [[orderly delivery]], not the [[integrity]] of the data in the segments. For these reasons IP is called an unreliable service." },
        { list: [
          "IP provides logical communication between [[hosts]], not processes.",
          "Every host has [[at least one]] network-layer address, its IP address (Chapter 4).",
          "An IP address gets a datagram to the right host only. Reaching the right process needs the transport layer's [[port numbers]]."
        ] }
      ]
    },
    {
      title: "UDP and TCP: what each adds to IP",
      src: "both",
      blocks: [
        { p: "The most fundamental job of both UDP and TCP is to extend IP's host-to-host delivery into [[process-to-process]] delivery. This is called transport-layer [[multiplexing and demultiplexing]] (§3.2). Both also check integrity by putting [[error-detection fields]] in their headers." },
        { table: { head: ["", "UDP", "TCP"], rows: [
          ["Full name", "User Datagram Protocol", "Transmission Control Protocol"],
          ["Connection", "Connectionless (no handshake)", "Connection-oriented (handshake first)"],
          ["Process-to-process delivery", "Yes", "Yes"],
          ["Error checking (checksum)", "Yes", "Yes"],
          ["Reliable, in-order delivery", "No — unreliable, like IP", "Yes (flow control, sequence numbers, ACKs, timers)"],
          ["Congestion control", "No — unregulated, any rate", "Yes — sending rate is regulated"],
          ["Delay / throughput guarantees", "No", "No"],
          ["Header size", "8 bytes", "20 bytes"]
        ] } },
        { p: "Process-to-process delivery and error checking are the **only two** services UDP provides. Like IP, UDP is [[unreliable]]: data sent by one process may arrive damaged, or not at all." },
        { p: "TCP converts IP's unreliable service between end systems into a [[reliable data transport]] service between processes: data is delivered correctly and in order. TCP also provides **congestion control**, which is less a service to the invoking application than a service to the [[Internet as a whole]] (“for the general good”). It keeps any one TCP connection from swamping the links and routers with traffic, and it strives to give each connection crossing a congested link an [[equal share]] of the link bandwidth by regulating the rate at which TCP senders transmit." },
        { trap: "Congestion control regulates [[TCP]] traffic only. UDP traffic is unregulated: an application using UDP can send at any rate it pleases, for as long as it pleases." },
        { list: [
          "The developer must choose UDP or TCP, and the choice is made [[when creating the socket]] (`SOCK_DGRAM` = UDP, `SOCK_STREAM` = TCP).",
          "Two applications can exchange messages only if both ends use a [[compatible transport protocol]]. IP reachability alone is not enough: a UDP sender cannot talk to a server that only accepts TCP connections."
        ] },
        { game: "match-blitz", text: "Drill protocol → layer and protocol → transport (TCP or UDP) until the answers are automatic." }
      ]
    },
    {
      title: "Terminology: segment vs datagram",
      src: "cheat",
      blocks: [
        { def: "Segment", text: "The transport-layer packet. The course and textbook say [[segment]] for both TCP and UDP packets." },
        { def: "Datagram", text: "Reserved for the [[network-layer]] packet (the IP datagram)." },
        { trap: "Internet literature (the RFCs) calls a TCP packet a segment but often calls a UDP packet a [[datagram]], and also uses “datagram” for the IP packet. To avoid confusion, say “UDP segment” and keep “datagram” for the network layer. Exam questions may still write “UDP datagram”, so read for meaning." }
      ]
    }
  ],
  recall: [
    { q: "The transport layer provides logical communication between ___?", a: "Processes running on different hosts." },
    { q: "The network layer provides logical communication between ___?", a: "Hosts." },
    { q: "Where are transport-layer protocols implemented?", a: "Only in end systems, not in routers." },
    { q: "Do routers look at TCP/UDP headers?", a: "No. They act only on network-layer (IP) fields of the datagram." },
    { q: "Household analogy: who is the transport-layer protocol, and what is the network-layer protocol?", a: "Ann and Bill are the transport protocol; the postal service (with its mail carriers) is the network-layer protocol." },
    { q: "Household analogy: hosts = ? processes = ? application messages = ?", a: "Houses; cousins (kids); letters in envelopes." },
    { q: "How many letters does each household send per week, and why?", a: "144 = 12 kids × 12 cousins." },
    { q: "What do Susan and Harvey illustrate?", a: "Different transport protocols offering different service models (less frequent pickup, lost letters)." },
    { q: "Name two services transport can provide even when the network layer does not.", a: "Reliable data transfer and encryption/confidentiality (also error detection)." },
    { q: "Name two guarantees transport cannot provide over IP.", a: "Delay (timing) guarantees and bandwidth/throughput guarantees." },
    { q: "What does IP's best-effort service NOT guarantee?", a: "Delivery, in-order delivery, and data integrity." },
    { q: "What are the only two services UDP provides?", a: "Process-to-process delivery (multiplexing/demultiplexing) and error checking." },
    { q: "Which mechanisms does TCP use for reliable data transfer?", a: "Flow control, sequence numbers, acknowledgments and timers." },
    { q: "Who is TCP congestion control mainly a service for?", a: "The Internet as a whole: it stops one connection swamping links and aims for equal shares." },
    { q: "Is UDP traffic rate-regulated?", a: "No. A UDP application can send at any rate, for as long as it likes." },
    { q: "When does a developer choose between UDP and TCP?", a: "When creating the socket (SOCK_DGRAM vs SOCK_STREAM)." },
    { q: "Segment vs datagram?", a: "Segment = transport-layer packet (TCP and UDP); datagram = network-layer packet." }
  ]
});
