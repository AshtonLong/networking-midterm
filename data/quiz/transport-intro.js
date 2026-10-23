NET.addQuestions("transport-intro", [
  { id: "transport-intro-01", d: 1, type: "mc", src: "cheat",
    q: "The transport layer provides logical communication between ___.",
    choices: ["processes running on different hosts", "network interfaces on the same link", "neighbouring routers", "hosts (end systems)"],
    a: 0,
    why: "Transport = process-to-process. “Hosts” is the network layer's job (IP, host-to-host). “Neighbouring devices on a link” is the link layer. The transport layer makes two processes appear directly connected." },

  { id: "transport-intro-02", d: 1, type: "mc", src: "cheat",
    q: "The network layer (IP) provides logical communication between ___.",
    choices: ["sockets", "hosts", "processes", "application messages"],
    a: 1,
    why: "IP moves datagrams from one host (IP address) to another host. It knows nothing about which process on the host should receive the data; reaching the process is the transport layer's job, using port numbers." },

  { id: "transport-intro-03", d: 1, type: "tf", src: "cheat",
    q: "Routers in the network core read the TCP/UDP port numbers of each segment to decide where to forward it.",
    a: false,
    why: "False. Routers act only on network-layer fields of the datagram (e.g. the destination IP address). They do not examine, act on, or even recognise the transport-layer header. Port numbers are read only by the end systems." },

  { id: "transport-intro-04", d: 1, type: "mc", src: "text",
    q: "Which devices implement transport-layer protocols such as TCP and UDP?",
    choices: ["Only routers in the network core", "Both end systems and routers", "Only link-layer switches", "Only end systems (hosts)"],
    a: 3,
    why: "Transport protocols are implemented in the end systems but not in network routers (Figure 3.1). Routers implement only the network, link and physical layers; switches implement only link and physical." },

  { id: "transport-intro-05", d: 1, type: "mc", src: "cheat",
    q: "In this course, what is a transport-layer packet (TCP or UDP) called?",
    choices: ["Frame", "Message", "Segment", "Datagram"],
    a: 2,
    why: "Segment. “Datagram” is reserved for the network-layer packet, “frame” is the link-layer packet, and “message” is the application-layer data." },

  { id: "transport-intro-06", d: 2, type: "mc", src: "cheat",
    q: "An RFC refers to a “UDP datagram.” Which statement about terminology is correct?",
    choices: [
      "“Datagram” is the link-layer name for a UDP packet",
      "Only TCP packets are transport-layer packets; UDP packets are network-layer packets",
      "RFCs often call a UDP packet a datagram, but the course calls both TCP and UDP packets segments and reserves “datagram” for the network-layer packet",
      "A UDP datagram and an IP datagram are the same packet, so the terms are interchangeable"
    ],
    a: 2,
    why: "Internet literature calls a TCP packet a segment and often calls a UDP packet a datagram, but it also uses “datagram” for IP packets. To avoid confusion the textbook and lecture use segment for both TCP and UDP. A UDP segment is still a transport-layer packet: it is carried inside an IP datagram, it is not the same thing as one." },

  { id: "transport-intro-07", d: 1, type: "tf", src: "cheat",
    q: "Every Internet host has at least one IP address.",
    a: true,
    why: "True. Every host has at least one network-layer address, its IP address (a host with several interfaces has several). The IP address identifies the host; the port number then identifies the process on that host." },

  { id: "transport-intro-08", d: 2, type: "multi", src: "cheat",
    q: "Which statements about IP's service model are true? Select all that apply.",
    choices: [
      "It is considered an unreliable service",
      "It is a best-effort delivery service",
      "It guarantees the integrity of the data in segments",
      "It provides logical communication between hosts",
      "It guarantees in-order delivery of segments"
    ],
    a: [0, 1, 3],
    why: "IP is best-effort: it tries to deliver but guarantees neither delivery, nor order, nor data integrity. That is why it is called unreliable. It provides host-to-host logical communication. In-order delivery and integrity are exactly what IP does NOT guarantee." },

  { id: "transport-intro-09", d: 1, type: "mc", src: "text",
    q: "Which two services are the ONLY services UDP provides?",
    choices: [
      "Process-to-process delivery and error checking",
      "Reliable delivery and congestion control",
      "Error checking and in-order delivery",
      "Process-to-process delivery and flow control"
    ],
    a: 0,
    why: "UDP extends IP's host-to-host delivery to process-to-process delivery (multiplexing/demultiplexing with port numbers) and adds a checksum for error checking. That is all it does. Reliable delivery, flow control, congestion control and ordering are TCP services." },

  { id: "transport-intro-10", d: 1, type: "tf", src: "cheat",
    q: "TCP traffic is regulated by congestion control, whereas an application using UDP can send at any rate it pleases.",
    a: true,
    why: "True. TCP congestion control limits the rate at which TCP senders transmit into the network. UDP has no congestion control, so UDP traffic is unregulated: the application can send at any rate, for as long as it pleases." },

  { id: "transport-intro-11", d: 1, type: "num", src: "text",
    q: "In the textbook's household analogy, each house has 12 kids, and every kid writes one letter per week to each of the 12 cousins in the other house. How many letters does ONE household send per week? (Answer as a number.)",
    a: 144, unit: "letters", tol: 0,
    why: "12 kids × 12 cousins each = 144 letters per week from one household to the other (each letter in its own envelope)." },

  { id: "transport-intro-12", d: 1, type: "mc", src: "text",
    q: "In the household analogy, Ann and Bill correspond to ___.",
    choices: ["the application processes", "the transport-layer protocol", "the hosts", "the network-layer protocol"],
    a: 1,
    why: "Ann and Bill collect mail from, and distribute mail to, their siblings inside the houses, so they are the transport protocol, working only in the end systems. The postal service is the network-layer protocol, the houses are hosts, the cousins are processes, and the letters are application messages." },

  { id: "transport-intro-13", d: 1, type: "mc", src: "text",
    q: "In the household analogy, the postal service (including the mail carriers) corresponds to ___, and the houses correspond to ___.",
    choices: [
      "the network-layer protocol; processes",
      "the transport-layer protocol; processes",
      "the link layer; routers",
      "the network-layer protocol; hosts"
    ],
    a: 3,
    why: "The postal service moves mail house-to-house, which is host-to-host: the network layer. Houses = hosts (end systems). The cousins inside the houses are the processes." },

  { id: "transport-intro-14", d: 2, type: "mc", src: "text",
    q: "When Ann and Bill go on vacation, Susan and Harvey take over: they collect mail less often and occasionally lose letters. What networking idea does this illustrate?",
    choices: [
      "Because the network layer is unreliable, transport can never add reliability",
      "A network can offer multiple transport protocols, each with a different service model (e.g. UDP vs TCP)",
      "Routers sometimes drop packets when their buffers overflow",
      "Processes must restart whenever the transport protocol changes"
    ],
    a: 1,
    why: "Susan/Harvey and Ann/Bill are two different “transport protocols” running over the same postal service, offering different service models. The Internet likewise offers UDP and TCP over the same IP. The loss here happens in the end systems (the houses), not in the postal service, so it is not about routers." },

  { id: "transport-intro-15", d: 2, type: "mc", src: "cheat",
    q: "The postal service gives no maximum bound on delivery time between the two houses. What follows, in the analogy and in the Internet?",
    choices: [
      "Ann and Bill can guarantee a delay bound by distributing mail faster inside the house",
      "Only UDP is limited this way; TCP can guarantee a delay bound",
      "Ann and Bill cannot guarantee a maximum delay either; a transport protocol cannot guarantee delay if the network layer cannot",
      "Transport can guarantee a delay bound by retransmitting lost segments"
    ],
    a: 2,
    why: "Transport services are constrained by the network layer's service model. If IP gives no delay or bandwidth guarantee between hosts, neither TCP nor UDP can give one between processes. Retransmission adds reliability but makes delay worse, not bounded." },

  { id: "transport-intro-16", d: 3, type: "multi", src: "cheat",
    q: "IP loses, garbles and duplicates packets and keeps nothing confidential. Which services can a transport protocol still provide on top of it? Select all that apply.",
    choices: [
      "Reliable data transfer",
      "A guaranteed minimum throughput",
      "Error detection on each segment",
      "Encryption so intruders cannot read application messages",
      "A guaranteed maximum end-to-end delay"
    ],
    a: [0, 2, 3],
    why: "Services the end systems can implement alone are possible: reliability (detect and recover from loss, corruption and duplication with checksums, sequence numbers, ACKs, timers, retransmission), encryption (encrypt in the sender, decrypt in the receiver), and error detection (a checksum). Delay and bandwidth guarantees depend on what happens inside the network, so transport cannot create them if IP does not provide them." },

  { id: "transport-intro-17", d: 1, type: "order", src: "cheat",
    q: "Put the sending-side transport actions in order.",
    items: [
      "The application process passes a message to the transport layer through its socket",
      "The transport layer breaks the message into chunks if needed",
      "The transport layer adds a transport-layer header to each chunk, forming a segment",
      "The segment is passed to the network layer",
      "The network layer encapsulates the segment in a datagram and sends it toward the destination"
    ],
    why: "Message → (chunks) → header added = segment → handed to the network layer → wrapped in an IP datagram. The transport layer never builds the datagram itself; the network layer does." },

  { id: "transport-intro-18", d: 2, type: "order", src: "cheat",
    q: "Put the receiving-side steps in order.",
    items: [
      "The datagram arrives at the destination host's network layer",
      "The network layer extracts the transport-layer segment from the datagram",
      "The segment is passed up to the transport layer",
      "The transport layer processes the segment",
      "The data is delivered to the receiving application process"
    ],
    why: "Decapsulation runs bottom-up: the network layer strips the datagram and hands the segment up; the transport layer processes it (e.g. checks it and picks the socket by port) and makes the data available to the application." },

  { id: "transport-intro-19", d: 3, type: "multi", src: "text",
    q: "Which services does TCP provide that UDP does NOT? Select all that apply.",
    choices: [
      "Congestion control",
      "Guaranteed minimum throughput",
      "Error detection using a checksum",
      "Reliable, in-order data transfer",
      "Flow control",
      "Process-to-process delivery using port numbers"
    ],
    a: [0, 3, 4],
    why: "TCP adds reliable in-order delivery (using flow control, sequence numbers, ACKs and timers) and congestion control. Port-based process-to-process delivery and checksums are provided by BOTH protocols; those are UDP's only two services. Neither protocol guarantees throughput." },

  { id: "transport-intro-20", d: 2, type: "mc", src: "text",
    q: "According to the textbook, TCP congestion control is best described as ___.",
    choices: [
      "a service for the Internet as a whole: it keeps any one connection from swamping links and routers",
      "a mechanism that guarantees each packet a maximum delay",
      "a service to the invoking application that guarantees it a minimum sending rate",
      "a mechanism in routers that inspects TCP headers and drops excess segments"
    ],
    a: 0,
    why: "The textbook calls congestion control “not so much a service provided to the invoking application as … a service for the Internet as a whole, … for the general good.” It works by regulating the senders' rates in the end systems. It guarantees neither a rate nor a delay, and routers do not inspect TCP headers." },

  { id: "transport-intro-21", d: 2, type: "mc", src: "text",
    q: "TCP congestion control strives to give each connection that crosses a congested link ___.",
    choices: [
      "the full link rate in turn (round robin)",
      "bandwidth proportional to its round-trip time",
      "priority according to its port number",
      "an equal share of the link bandwidth"
    ],
    a: 3,
    why: "TCP aims for fairness: each connection traversing a congested link should get an equal share of its bandwidth, which TCP achieves by regulating each sender's rate." },

  { id: "transport-intro-22", d: 2, type: "mc", src: "cheat",
    q: "At what point does an application developer choose between UDP and TCP?",
    choices: [
      "Never; the network layer picks based on congestion",
      "Never; each router picks based on the destination port",
      "Per packet, by setting a header field on each send",
      "When creating the socket (SOCK_DGRAM for UDP, SOCK_STREAM for TCP)"
    ],
    a: 3,
    why: "The developer must specify one of the two transport protocols when creating the socket, e.g. socket(AF_INET, SOCK_DGRAM) for UDP or socket(AF_INET, SOCK_STREAM) for TCP. Neither the network layer nor routers choose the transport protocol." },

  { id: "transport-intro-23", d: 2, type: "tf", src: "cheat",
    q: "If host A can reach host B over IP, a process on A using UDP can exchange messages with a process on B that only accepts TCP connections.",
    a: false,
    why: "False. Applications can exchange messages only if both endpoints use compatible transport protocols. IP connectivity only gets datagrams between hosts; a UDP segment will not be accepted by a TCP-only server process." },

  { id: "transport-intro-24", d: 2, type: "mc", src: "text",
    q: "In Figure 3.1 (logical end-to-end transport between two end systems), which layers does each router along the path implement?",
    choices: ["Transport, network and link", "Network, link and physical", "Only the physical layer", "All five layers"],
    a: 1,
    why: "Routers implement the bottom three layers (network, link, physical). Only the end systems have the application and transport layers, which is why transport-layer communication is “logical” and end-to-end." },

  { id: "transport-intro-25", d: 2, type: "short", src: "cheat",
    q: "Explain the difference between the logical communication provided by the transport layer and that provided by the network layer.",
    a: "The network layer provides logical communication between hosts: IP moves datagrams from one host (IP address) to another. The transport layer provides logical communication between processes on those hosts: it extends host-to-host delivery to process-to-process delivery (multiplexing/demultiplexing with port numbers), so the applications appear directly connected.",
    keys: ["process|processes|process-to-process", "host|hosts|host-to-host", "port|multiplex|demultiplex|socket"],
    why: "Keyword pair: transport = process-to-process; network = host-to-host. The bridge between them is multiplexing/demultiplexing using port numbers." },

  { id: "transport-intro-26", d: 2, type: "short", src: "cheat",
    q: "Why is IP called an unreliable service?",
    a: "Because IP's service model is best-effort: it tries to deliver datagrams but guarantees nothing. It does not guarantee that segments are delivered, that they arrive in order, or that the data in them arrives intact (integrity).",
    keys: ["best-effort|best effort|no guarantee", "delivery|lost|loss", "order", "integrity|corrupt|intact|errors"],
    why: "The three things IP does not guarantee are delivery, order and data integrity. TCP adds all three back for applications that need them." },

  { id: "transport-intro-27", d: 3, type: "short", src: "ch3-R2a",
    ctx: "R2. On a certain planet everyone belongs to a family of six, each family lives in its own house, each house has a unique address, and each person in a house has a unique name. The mail service delivers letters from source house to destination house; it requires that (1) the letter be in an envelope and (2) the address of the destination house, and nothing more, be clearly written on the envelope. Each family has a delegate who collects and distributes letters for the other members. The letters themselves do not necessarily say who the recipient is.",
    q: "(a) Using R1's solution (a minimal transport protocol) as inspiration, describe a protocol the delegates can use to deliver letters from a sending family member to a receiving family member.",
    a: "The sender gives the delegate the letter, the destination house address and the recipient's name. The delegate writes the recipient's name at the top of the letter (a “header”), puts the letter in an envelope, writes only the destination house address on the envelope, and hands it to the mail service. At the destination the delegate opens the envelope, reads the name at the top of the letter, and gives the letter to that family member. (To allow replies, the delegate can also write the sender's name on the letter, like a source port.)",
    keys: ["recipient name|name of the recipient|name", "top of the letter|header|write the name on the letter", "envelope|house address", "delegate gives|hand|deliver to the family member|distribute"],
    why: "This is exactly mux/demux: the name on the letter plays the role of the destination port number (in the transport header), and the house address on the envelope plays the role of the destination IP address (in the network header). The sending delegate multiplexes; the receiving delegate demultiplexes." },

  { id: "transport-intro-28", d: 2, type: "short", src: "ch3-R2b",
    ctx: "R2. On a certain planet everyone belongs to a family of six, each family lives in its own house, each house has a unique address, and each person in a house has a unique name. The mail service delivers letters from source house to destination house; it requires that (1) the letter be in an envelope and (2) the address of the destination house, and nothing more, be clearly written on the envelope. Each family has a delegate who collects and distributes letters for the other members. The letters themselves do not necessarily say who the recipient is.",
    q: "(b) In your protocol, does the mail service ever have to open the envelope and examine the letter in order to provide its service?",
    a: "No. The mail service only needs the destination house address written on the envelope. The recipient's name is inside the envelope and is read only by the receiving delegate. Likewise, routers read only the network-layer header (IP addresses), never the transport header (port numbers).",
    keys: ["no", "address on the envelope|house address|only the envelope", "router|network layer|IP header|transport header"],
    why: "The envelope is the network-layer header and the name on the letter is the transport header. The mail service (network layer) never looks inside, just as routers never inspect transport-layer fields." },

  { id: "transport-intro-29", d: 3, type: "mc", src: "cheat",
    q: "A video-call app needs every packet delivered within 150 ms. It runs over the Internet, whose network layer provides best-effort service. Which statement is correct?",
    choices: [
      "Neither TCP nor UDP can guarantee the 150 ms bound, because transport cannot provide a delay guarantee the network layer lacks",
      "TCP can guarantee it by retransmitting lost packets quickly",
      "UDP can guarantee it because it has no handshake and no congestion control",
      "It is guaranteed if the app opens both a TCP and a UDP socket"
    ],
    a: 0,
    why: "Delay guarantees cannot be created at the ends if the network layer offers none. TCP's retransmissions add delay. UDP avoids handshake and throttling delays, which makes it faster on average, but it still guarantees nothing. Opening two sockets changes nothing about IP's best-effort service." },

  { id: "transport-intro-30", d: 3, type: "tf", src: "cheat",
    q: "Because IP is unreliable, no protocol running on top of IP can deliver data reliably and in order.",
    a: false,
    why: "False. TCP runs on top of unreliable IP and still provides reliable, in-order delivery between processes, using sequence numbers, acknowledgments, timers/retransmission and flow control in the end systems. Reliability can be added end-to-end; delay and bandwidth guarantees cannot." },

  { id: "transport-intro-31", d: 3, type: "short", src: "text",
    q: "Explain how TCP turns IP's unreliable host-to-host service into a reliable process-to-process service, and name one guarantee TCP still cannot give.",
    a: "TCP uses port numbers (multiplexing/demultiplexing) to reach the right process, and uses flow control, sequence numbers, acknowledgments and timers with retransmission so that data is delivered correctly and in order even though IP may lose, corrupt or reorder segments. It still cannot guarantee a delay bound or a minimum throughput, because IP provides neither.",
    keys: ["sequence number", "acknowledg|ACK", "timer|timeout|retransmi", "delay|throughput|bandwidth|timing"],
    why: "Textbook §3.1.2: “Using flow control, sequence numbers, acknowledgments, and timers … TCP ensures that data is delivered from sending process to receiving process, correctly and in order.” Timing and bandwidth guarantees are network-dependent, so TCP cannot add them." },

  { id: "transport-intro-32", d: 3, type: "multi", src: "cheat",
    q: "A developer writes a client using socket(AF_INET, SOCK_DGRAM). Which statements are true? Select all that apply.",
    choices: [
      "Routers on the path inspect its UDP port numbers to forward it",
      "Its traffic is not regulated by congestion control",
      "It can exchange messages only with a server process that also uses UDP",
      "The client uses UDP",
      "Its segments are delivered reliably because IP retransmits lost datagrams"
    ],
    a: [1, 2, 3],
    why: "SOCK_DGRAM = UDP. UDP traffic is unregulated (no congestion control). Both ends must use a compatible transport protocol, so the server must also use UDP. IP never retransmits (it is best-effort), and routers act only on IP-header fields, never on transport ports." },

  { id: "transport-intro-33", d: 2, type: "mc", src: "cheat",
    q: "In encapsulation, the transport layer adds header H_{t} to application message M. What is H_{t}·M called, and what does the network layer then form?",
    choices: [
      "A frame; the network layer adds H_{n} to form a packet",
      "A segment; the network layer adds H_{l} to form a frame",
      "A segment; the network layer adds H_{n} to form a datagram",
      "A datagram; the network layer adds H_{n} to form a segment"
    ],
    a: 2,
    why: "M → H_{t}·M is a segment → H_{n}·H_{t}·M is a datagram → H_{l}·H_{n}·H_{t}·M is a frame (built by the link layer, not the network layer)." },

  { id: "transport-intro-34", d: 2, type: "num", src: "cheat",
    q: "A sending transport layer splits a 6,000-byte application message into 5 chunks. How many network-layer datagrams carry this message onto the first link, assuming no aggregation?",
    a: 5, unit: "datagrams", tol: 0,
    why: "Each chunk gets its own transport header → 5 segments. Each segment is encapsulated in its own datagram → 5 datagrams (and 5 frames on the link). Splitting multiplies header overhead at every layer below." },

  { id: "transport-intro-35", d: 2, type: "short", src: "cheat",
    q: "What is the name for extending IP's host-to-host delivery into process-to-process delivery, and why is an IP address alone not enough to reach an application?",
    a: "It is transport-layer multiplexing and demultiplexing. An IP address identifies only the host, and a host runs many application processes at once, so the transport layer adds port numbers to identify the socket/process on that host.",
    keys: ["multiplexing|demultiplexing", "IP address identifies the host|host only|only the host", "port", "many processes|multiple processes|many applications|socket"],
    why: "Reaching a process takes two identifiers: the host's IP address (network layer) and the process's port number (transport layer). Section 3.2 covers how ports are used." },

  { id: "transport-intro-36", d: 3, type: "order", src: "cheat",
    q: "A message travels from process P1 on host A to process P2 on host B through one router. Put the events in order.",
    items: [
      "Transport layer on A adds a header (with port numbers) to form a segment",
      "Network layer on A encapsulates the segment in an IP datagram",
      "The router examines only the datagram's network-layer fields and forwards it",
      "Network layer on B extracts the segment from the datagram",
      "Transport layer on B uses the segment header to deliver the data to P2's socket"
    ],
    why: "Transport work happens only at the two ends (first and last steps). The router in the middle processes only the network-layer header; it never looks at the transport header." },

  { id: "transport-intro-37", d: 3, type: "tf", src: "cheat",
    q: "TCP congestion control works by routers reading TCP headers and dropping the segments of connections that exceed their fair share.",
    a: false,
    why: "False on two counts. Routers do not inspect transport-layer headers at all. TCP congestion control is carried out by the TCP senders in the end systems, which regulate their own sending rates. UDP senders do no such regulation." }
]);
