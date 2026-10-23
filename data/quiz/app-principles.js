NET.addQuestions('app-principles', [
  { id: 'app-principles-01', d: 1, type: 'mc', src: 'cheat',
    q: 'Which is the best definition of a network application?',
    choices: [
      'The protocol stack inside the operating system that moves bytes between hosts',
      'Two or more programs running on different hosts that exchange messages over the network',
      'Any program that runs on a server in a data center',
      'A program running on a router that forwards packets between networks'
    ],
    a: 1,
    why: 'A network application is two or more programs on different hosts (end systems) exchanging messages — e.g., a browser and a Web server. Routers do not run network applications (they work at the network layer and below). The protocol stack (transport and below) is the OS’s plumbing the app uses, not the app. A single program in a data center is only one side of an application.' },

  { id: 'app-principles-02', d: 1, type: 'tf', src: 'cheat',
    q: 'To deploy a new network application (or a new version of its message format) across the Internet, the developer must also install new software on the routers along the path.',
    a: false,
    why: 'False. Application logic is implemented only on end hosts (clients and servers); routers and switches only forward packets and operate at the network layer and below. Developers do not — and cannot — write application software for network-core devices. This edge deployment is exactly what makes development, distribution and updates easy.' },

  { id: 'app-principles-03', d: 3, type: 'mc', src: 'cheat',
    q: 'A company pushes an update that changes its app’s message format on every client and server worldwide, overnight. Why does no router in the Internet need to change?',
    choices: [
      'The new message format is carried in the IP header, which routers already know how to parse and forward',
      'Routers run a backward-compatible application layer that accepts any message format the app sends',
      'Routers automatically download application updates from the app’s servers during idle periods',
      'Routers forward packets using only network-layer information and never interpret application messages'
    ],
    a: 3,
    why: 'Routers forward datagrams using network-layer information only; application messages are opaque payload to them. So an app can be updated globally without touching router forwarding logic. The one condition: the new version must keep using transport/network services the Internet supports (e.g., still TCP or UDP over IP). Application data is not in the IP header, and routers have no application layer.' },

  { id: 'app-principles-04', d: 2, type: 'short', src: 'ch2-R2',
    q: 'R2: What is the difference between network architecture and application architecture?',
    a: 'Network architecture is the layered organization of the communication system (e.g., the five-layer Internet stack); from the application developer’s point of view it is fixed and provides a specific set of services. Application architecture is designed by the application developer and dictates how the application is structured over the end systems — typically client-server or peer-to-peer.',
    keys: ['network architecture = layered stack|layer|stack', 'fixed, provides services|fixed|services', 'application architecture designed by the developer|developer|design', 'client-server or P2P|client-server|client server|p2p|peer'],
    why: 'Textbook §2.1.1: “an application’s architecture is distinctly different from the network architecture.” The developer cannot change the network architecture (it just offers services such as TCP and UDP), but chooses the application architecture — client-server or P2P — to decide which end systems play which roles.' },

  { id: 'app-principles-05', d: 1, type: 'multi', src: 'cheat',
    q: 'Which are characteristics of a client-server application? Select all that apply.',
    choices: [
      'Capacity grows automatically because each new client adds service capacity',
      'An always-on server serves requests from many clients',
      'Clients may be only occasionally online and often have dynamic IP addresses',
      'Clients communicate directly with each other to share the load',
      'Clients initiate contact with the server',
      'The server has a fixed, well-known IP address'
    ],
    a: [1, 2, 4, 5],
    why: 'Client-server: an always-on server with a fixed, well-known IP handles many clients; clients initiate contact, may be intermittently online and have dynamic addresses. Clients do NOT talk to each other directly (two browsers never communicate in the Web app). “Each newcomer adds capacity” is self-scalability — a P2P property.' },

  { id: 'app-principles-06', d: 3, type: 'multi', src: 'cheat',
    q: 'Which statements describe P2P applications such as BitTorrent? Select all that apply.',
    choices: [
      'Peers communicate directly without passing through a dedicated server',
      'They need significant server infrastructure and bandwidth in data centers',
      'They are easier to manage and secure than client-server apps because there is no single server',
      'They are cost effective because they need little server infrastructure and server bandwidth',
      'Each peer both requests and provides resources, so new peers add capacity as well as demand (self-scalability)',
      'Peers are intermittently connected and their IP addresses change'
    ],
    a: [0, 3, 4, 5],
    why: 'P2P: no always-on central server; peers (user-controlled desktops/laptops) talk directly, have dual roles, self-scale, are intermittently available with changing IPs, and are cheap (little server infrastructure/bandwidth). The catch: decentralization makes them HARDER to manage — the textbook lists security, performance and reliability as the challenges. Heavy data-center infrastructure is the client-server model.' },

  { id: 'app-principles-07', d: 2, type: 'mc', src: 'text',
    q: 'Why do popular client-server services (search engines, social media, Web mail) run in data centers?',
    choices: [
      'Data centers let clients communicate directly with each other to share the load',
      'Data centers eliminate the provider’s recurring bandwidth and interconnection costs',
      'Data centers turn the service into a P2P application that scales by itself',
      'One server host can’t keep up with all the requests, so many hosts act as one powerful virtual server'
    ],
    a: 3,
    why: 'One server would be overwhelmed by a popular service, so a data center housing many hosts (up to hundreds of thousands of servers) forms a powerful virtual server; Google, for example, has 19 data centers. It does not remove costs — servers must be powered and maintained, and the provider pays recurring interconnection and bandwidth costs. It is still client-server: clients still talk only to the (virtual) server.' },

  { id: 'app-principles-08', d: 1, type: 'mc', src: 'ch2-R3',
    q: 'R3: For a communication session between a pair of processes, which process is the client and which is the server?',
    choices: [
      'The process that uploads a file is always the client',
      'The process that sends more data is the server; the one that receives more is the client',
      'The process that initiates contact is the client; the process that waits to be contacted is the server',
      'The process running on the always-on host is the client'
    ],
    a: 2,
    why: 'Definition (§2.1.2): in the context of a session, the process that initiates the communication is the client; the one that waits to be contacted is the server. It has nothing to do with who sends more data. In P2P file sharing the uploader is the server (the downloader initiated the request).' },

  { id: 'app-principles-09', d: 2, type: 'short', src: 'ch2-R4',
    q: 'R4: For a P2P file-sharing application, do you agree with the statement “There is no notion of client and server sides of a communication session”? Why or why not?',
    a: 'No, I disagree. In any given session one peer initiates (asks for a file) and the other waits to be contacted. The peer that is receiving (downloading) the file is the client and the peer that is sending (uploading) it is the server. A peer can play both roles over time, but in each session the labels still apply.',
    keys: ['disagree|disagree|not agree|false|incorrect', 'the initiating peer is the client|initiat|contact', 'downloading peer = client|download|receiv|request', 'uploading peer = server|upload|send|provid', 'labels hold per session|session|both roles|both'],
    why: 'Textbook: when Peer A asks Peer B to send a file, A is the client and B is the server for that session. A P2P process can be both a client and a server (it uploads and downloads), and the cheat sheet notes P2P applications also have client and server processes.' },

  { id: 'app-principles-10', d: 1, type: 'mc', src: 'cheat',
    q: 'Two processes running on the same host communicate with each other through:',
    choices: [
      'The physical layer of the host’s network card',
      'A DNS lookup followed by a TCP connection to port 80',
      'The nearest router, which loops the packets back',
      'Interprocess communication governed by the host’s operating system'
    ],
    a: 3,
    why: 'Processes on the same end system use interprocess communication with rules set by the local operating system. Processes on different hosts communicate by exchanging messages across the network. Routers and DNS have nothing to do with communication inside one host.' },

  { id: 'app-principles-11', d: 1, type: 'mc', src: 'cheat',
    q: 'A socket is the interface between:',
    choices: [
      'The application layer and the transport layer within a host',
      'The network layer and the link layer of a router',
      'Two routers on the same link',
      'The transport layer and the network layer within a host'
    ],
    a: 0,
    why: 'A socket is the software interface (the API) between an application process and the transport layer — the process’s “door” to the network. Everything below it (transport, network, link, physical) is controlled by the OS.' },

  { id: 'app-principles-12', d: 2, type: 'multi', src: 'cheat',
    q: 'Which parts of an end host are controlled by the operating system rather than by the application developer? Select all that apply.',
    choices: [
      'The link and physical layers',
      'The network layer',
      'The transport layer (e.g., TCP with its buffers and variables)',
      'The code that writes messages into the socket',
      'The format of the application’s messages'
    ],
    a: [0, 1, 2],
    why: 'Cheat sheet: the socket (application side) is controlled by the application developer; the transport, network, link and physical layers are controlled by the operating system. The message format and the code that reads/writes the socket are the developer’s application-layer work.' },

  { id: 'app-principles-13', d: 2, type: 'mc', src: 'text',
    q: 'On the transport-layer side of the socket, what control does the application developer have?',
    choices: [
      'Control of the route its packets take through the network core, set via the socket',
      'None at all — the OS even picks between TCP and UDP for the application',
      'Only the choice of transport protocol, plus perhaps a few parameters like max buffer and segment sizes',
      'Full control of TCP’s retransmission timers and congestion-control algorithms'
    ],
    a: 2,
    why: 'Textbook §2.1.2: the developer controls everything on the application side but has little control of the transport side — (1) the choice of transport protocol and (2) perhaps fixing a few transport-layer parameters like maximum buffer and maximum segment sizes. TCP’s algorithms are implemented by the OS, and routing is done by the network layer.' },

  { id: 'app-principles-14', d: 1, type: 'short', src: 'ch2-R5',
    q: 'R5: What information is used by a process running on one host to identify a process running on another host?',
    a: 'The IP address of the destination host (identifies which host) and the port number of the destination socket/process on that host (identifies which process).',
    keys: ['IP address of the host|ip address|ip', 'port number of the process|port', 'identifies the host|host', 'identifies the process/socket|process|socket'],
    why: 'Two identifiers are needed: the IP address picks the host; the port number picks the process (socket) on that host, because a host can run many network applications at once. E.g., a Web server is port 80 and an SMTP mail server is port 25 at the server’s IP address.' },

  { id: 'app-principles-15', d: 1, type: 'num', src: 'cheat',
    q: 'How many bits long is an IPv6 address? (Answer in bits.)',
    a: 128, unit: 'bits',
    why: 'A host interface may use a 32-bit IPv4 address or a 128-bit IPv6 address (128 bits = 16 bytes). Do not mix them up: 32 is IPv4.' },

  { id: 'app-principles-16', d: 2, type: 'num', src: 'cheat', tol: 0.01,
    q: 'An IPv4 address is 32 bits long. How many distinct IPv4 addresses are possible? (Give the count.)',
    a: 4294967296, unit: 'addresses',
    why: 'Each of the 32 bits can be 0 or 1, so there are 2^{32} = 4,294,967,296 ≈ 4.3 billion possible IPv4 addresses. (IPv6, at 128 bits, has 2^{128}.)' },

  { id: 'app-principles-17', d: 1, type: 'mc', src: 'cheat',
    q: 'Which well-known port numbers identify an HTTP (Web) server and an SMTP (mail) server?',
    choices: ['HTTP 25, SMTP 80', 'HTTP 443, SMTP 53', 'HTTP 80, SMTP 25', 'HTTP 8080, SMTP 110'],
    a: 2,
    why: 'HTTP uses port 80 (HTTPS uses 443) and SMTP uses port 25. 53 is DNS. Well-known port numbers for standard protocols are listed by IANA.' },

  { id: 'app-principles-18', d: 2, type: 'mc', src: 'cheat',
    q: 'Why is a port number needed in addition to the destination IP address?',
    choices: [
      'IP addresses are not unique, so the port number disambiguates hosts that share an address',
      'The port number tells the routers along the path which outgoing link to take',
      'The port number encrypts the message so only the receiving process can read it',
      'A host runs many network apps at once; the IP picks the host and the port picks the process (socket)'
    ],
    a: 3,
    why: 'The IP address identifies which host; the port number identifies which process/socket on that host. Without the port, the receiving host could not tell whether a message is for its Web server, its mail server, or another app. Routers forward on IP addresses, not ports, and ports provide no security.' },

  { id: 'app-principles-19', d: 1, type: 'multi', src: 'cheat',
    q: 'Which are the four broad dimensions of service a transport protocol can offer an application? Select all that apply.',
    choices: ['Throughput', 'Timing', 'Reliable data transfer', 'Routing across the network core', 'Security', 'Hostname-to-IP-address translation'],
    a: [0, 1, 2, 4],
    why: 'The four dimensions: reliable data transfer, throughput, timing (low end-to-end delay), and security (encryption, integrity, authentication). Routing is a network-layer job; name translation is DNS, an application-layer service.' },

  { id: 'app-principles-20', d: 3, type: 'short', src: 'ch2-R8',
    q: 'R8: List the four broad classes of services that a transport protocol can provide. For each class, indicate whether UDP, TCP, both, or neither provides it.',
    a: 'Reliable data transfer — TCP yes, UDP no. Throughput guarantee — neither. Timing (delay) guarantee — neither. Security (confidentiality via encryption, integrity, authentication) — neither natively; TCP can be enhanced at the application layer with TLS to get it.',
    keys: ['reliable data transfer: TCP yes, UDP no|reliab', 'throughput: neither|throughput', 'timing: neither|timing|delay', 'security: neither (TLS adds it to TCP)|security|tls|encrypt'],
    why: 'TCP gives a reliable, in-order byte stream; UDP gives best-effort only. “Conspicuously missing” from both are throughput and timing guarantees — today’s Internet transport protocols provide neither. Neither TCP nor UDP encrypts; TLS, an application-layer enhancement of TCP, adds encryption, integrity and end-point authentication.' },

  { id: 'app-principles-21', d: 2, type: 'mc', src: 'text',
    q: 'Which describes an elastic application?',
    choices: [
      'It needs every bit delivered within 100 ms, e.g., interactive multiplayer games',
      'It tolerates some data loss, e.g., conversational audio and video conferencing',
      'It needs a guaranteed minimum throughput, e.g., Internet telephony encoding voice at 32 kbps',
      'It uses as much or as little throughput as is available, e.g., e-mail, file transfer, Web'
    ],
    a: 3,
    why: 'Elastic apps make use of whatever throughput is available (more is better, but there is no minimum). Needing a minimum rate = bandwidth-sensitive. Tolerating loss = loss-tolerant (a different dimension). A 100 ms bound is a timing requirement.' },

  { id: 'app-principles-22', d: 3, type: 'mc', src: 'text',
    q: 'An Internet telephony app encodes voice at 32 kbps, but the path currently delivers only 16 kbps. According to the textbook, what is the situation?',
    choices: [
      'Nothing changes — telephony is elastic, so the call simply takes longer',
      'Telephony is loss-tolerant, so losing half the bits only causes a glitch',
      'It is bandwidth-sensitive: it must re-encode at a lower rate or give up',
      'TCP retransmissions will make up the missing throughput over time'
    ],
    a: 2,
    why: 'Applications with throughput requirements are bandwidth-sensitive. The textbook’s example: a 32 kbps voice app that cannot get 32 kbps must re-encode at a lower rate (and get enough throughput for that) or give up — receiving half the needed throughput is of little or no use. Loss tolerance covers occasional lost packets, not losing half the stream; retransmissions cannot create capacity.' },

  { id: 'app-principles-23', d: 2, type: 'num', src: 'text',
    q: 'A voice app encodes at 32 kbps and sends 20 ms of speech in each message. How many bytes of encoded voice does each message carry? (Answer in bytes.)',
    a: 80, unit: 'bytes',
    why: 'Bits per message = rate × time = 32,000 bits/s × 0.020 s = 640 bits.\nBytes = 640 / 8 = 80 bytes.\nTrap: kbps means 10^{3} bits per second, and divide by 8 to get bytes.' },

  { id: 'app-principles-24', d: 2, type: 'num', src: 'text',
    q: 'Suppose a transport service could guarantee 1 Mbps of throughput. How many complete 32 kbps voice streams fit within that guarantee? (Use 1 Mbps = 10^6 bps; answer a whole number of streams.)',
    a: 31, unit: 'streams',
    why: '10^{6} bits/s ÷ 32,000 bits/s per stream = 31.25 → 31 complete streams. Each is bandwidth-sensitive: a 32nd stream would get only 0.25 × 32 kbps = 8 kbps, which is of little use to it.' },

  { id: 'app-principles-25', d: 3, type: 'multi', src: 'text',
    q: 'According to Figure 2.4 (requirements of selected network applications), which statements are true? Select all that apply.',
    choices: [
      'Streaming stored audio/video is time-sensitive only on the order of a few seconds',
      'E-mail and file transfer need no loss and are elastic',
      'Internet telephony/video conferencing is loss-tolerant and time-sensitive (100s of msec)',
      'Interactive games need several Mbps of throughput',
      'Web documents are loss-tolerant and time-sensitive'
    ],
    a: [0, 1, 2],
    why: 'Figure 2.4: file transfer, e-mail, Web documents → no loss, elastic, not time-sensitive. Telephony/video conferencing → loss-tolerant, audio few kbps–1 Mbps, video 10 kbps–5 Mbps, time-sensitive 100s of msec. Stored streaming → loss-tolerant, time-sensitive a few seconds. Interactive games → loss-tolerant, only a few kbps–10 kbps, 100s of msec. Smartphone messaging → no loss, elastic, “yes and no” for timing.' },

  { id: 'app-principles-26', d: 3, type: 'short', src: 'ch2-R7',
    q: 'R7: In Figure 2.4 no application requires both no data loss and timing. Conceive of an application that requires no data loss and is also highly time-sensitive, and explain why.',
    a: 'Example: remote control of machinery or remote surgery, real-time financial trading (orders and price updates), or a multiplayer game’s critical state updates. Every message must arrive intact (a lost “stop” command or trade is unacceptable), and it must arrive within a tight delay bound (hundreds of ms or less) or it is useless. Neither TCP nor UDP can guarantee both, so such apps depend on fast networks and careful application design.',
    keys: ['no data loss allowed|no loss|no data loss|loss-intolerant|intolerant|lossless|reliab|every', 'highly time-sensitive|time-sensitive|time sensitive|delay|real-time|real time|latency|fast', 'a concrete example|surgery|remote|trading|stock|game|control|robot'],
    why: 'Any answer works if it shows both requirements: loss intolerance (data correctness matters, e.g., commands or transactions) and time sensitivity (late data is useless). Figure 2.4’s closest row is smartphone messaging: no loss, elastic, timing “yes and no”.' },

  { id: 'app-principles-27', d: 1, type: 'tf', src: 'cheat',
    q: 'TCP guarantees the application a minimum throughput, because it is a reliable protocol.',
    a: false,
    why: 'False. TCP provides reliable, connection-oriented delivery with flow and congestion control, but no latency or throughput guarantees (and no built-in security). Reliability means the data eventually arrives correctly and in order — not how fast.' },

  { id: 'app-principles-28', d: 2, type: 'multi', src: 'cheat',
    q: 'Which services does TCP provide to applications? Select all that apply.',
    choices: [
      'Built-in encryption of application data',
      'A connection set up by handshaking before data flows',
      'Congestion control',
      'A guaranteed upper bound on end-to-end delay',
      'Flow control',
      'Reliable, in-order delivery with no missing or duplicate bytes'
    ],
    a: [1, 2, 4, 5],
    why: 'TCP: connection-oriented (handshake first, full-duplex connection, must be torn down), reliable in-order byte stream, flow control and congestion control. It gives no timing or throughput guarantees and no encryption (TLS adds that on top).' },

  { id: 'app-principles-29', d: 2, type: 'multi', src: 'cheat',
    q: 'Which statements about UDP are true? Select all that apply.',
    choices: [
      'It is connectionless: there is no handshaking before the processes start communicating',
      'It has no congestion control, so the sender can push data into the network layer at any rate',
      'It provides flow control so the receiver is never overwhelmed',
      'It guarantees a minimum bandwidth because it has so little overhead',
      'Messages may never arrive, and those that do may arrive out of order'
    ],
    a: [0, 1, 4],
    why: 'UDP is no-frills and lightweight: connectionless, unreliable (no delivery guarantee, possible reordering), no flow control, no congestion control (send at any rate — though actual throughput can still be limited by links and congestion), and no latency or bandwidth guarantees.' },

  { id: 'app-principles-30', d: 2, type: 'mc', src: 'text',
    q: 'The textbook describes TCP’s congestion control as a service mainly for:',
    choices: [
      'Reducing the end-to-end delay seen by time-sensitive applications like telephony',
      'The general welfare of the Internet: throttling senders under congestion, aiming at fair shares',
      'The direct benefit of the sending process, by guaranteeing it a minimum throughput',
      'Protecting the confidentiality of data in transit by limiting who can send'
    ],
    a: 1,
    why: 'Congestion control throttles a sending process (client or server) when the path is congested and tries to limit each TCP connection to its fair share of bandwidth — good for the Internet as a whole, not a direct benefit to the app. It can actually slow an app down, which is one reason real-time apps prefer UDP.' },

  { id: 'app-principles-31', d: 3, type: 'short', src: 'ch2-R6',
    q: 'R6: Suppose you wanted to do a transaction from a remote client to a server as fast as possible. Would you use UDP or TCP? Why?',
    a: 'UDP. With UDP the client just sends the request into a UDP socket and the server replies, so the transaction completes in about one RTT. With TCP, one RTT is first spent on connection setup (the handshake) and a second RTT on the request/response, so at least two RTTs. The trade-off is that UDP gives no reliability, so the app must cope with a lost request or reply itself.',
    keys: ['UDP|udp', 'no connection setup|handshake|setup|set up|connectionless', 'UDP: 1 RTT|1 rtt|one rtt|one round', 'TCP: 2 RTTs|2 rtt|two rtt|extra rtt|two round|2 round'],
    why: 'UDP needs no connection setup; TCP must complete its handshake first (SYN, SYNACK = 1 RTT; the request can ride with the third segment), then the request/response costs another RTT. That is exactly why “no connection setup” is listed as a reason to choose UDP.' },

  { id: 'app-principles-32', d: 2, type: 'num', src: 'ch2-R6',
    q: 'The RTT between a client and a server is 60 ms and transmission times are negligible. How long (in ms) does a single request/response transaction take over TCP if a new connection must be set up first?',
    a: 120, unit: 'ms',
    why: 'Handshake (SYN → SYNACK) = 1 RTT = 60 ms. Request (sent with the third handshake segment) → response = 1 RTT = 60 ms. Total = 2 × 60 = 120 ms. Over UDP the same transaction takes 1 RTT = 60 ms.' },

  { id: 'app-principles-33', d: 3, type: 'num', src: 'text',
    q: 'A client performs 5 independent request/response transactions one after another, each over a brand-new TCP connection. RTT = 40 ms, transmission times negligible. How many ms in total would be saved by doing the same 5 transactions over UDP instead (assuming nothing is lost)?',
    a: 200, unit: 'ms',
    why: 'TCP: each transaction = 1 RTT setup + 1 RTT request/response = 80 ms → 5 × 80 = 400 ms.\nUDP: each transaction = 1 RTT = 40 ms → 5 × 40 = 200 ms.\nSaved = 400 − 200 = 200 ms (one handshake RTT per transaction).' },

  { id: 'app-principles-34', d: 2, type: 'mc', src: 'ch2-R9a',
    q: 'R9 (part 1): TLS adds encryption, data integrity and end-point authentication to TCP. Does TLS operate at the transport layer or the application layer?',
    choices: [
      'The network layer, inside every router',
      'The application layer — it is an enhancement of TCP implemented above TCP, inside the application',
      'The link layer, on each hop',
      'The transport layer, as a third Internet transport protocol alongside TCP and UDP'
    ],
    a: 1,
    why: 'TLS is not a third transport protocol on the same level as TCP and UDP; it is an enhancement of TCP whose enhancements are implemented in the application layer. The app passes cleartext to a TLS socket; TLS encrypts and hands the result to TCP.' },

  { id: 'app-principles-35', d: 2, type: 'short', src: 'ch2-R9b',
    q: 'R9 (part 2): If an application developer wants TCP to be enhanced with TLS, what does the developer have to do?',
    a: 'Include TLS code — existing, highly optimized TLS libraries/classes — in both the client and the server sides of the application, and send/receive through the TLS socket API (similar to the TCP socket API) instead of directly through the TCP socket.',
    keys: ['include TLS code/libraries|librar|tls code|classes|include tls', 'in both client and server|both', 'use the TLS socket API|socket|api'],
    why: 'Because TLS lives in the application layer, the OS’s TCP does not do it for you: both ends of the app must link TLS code. TLS then sits between the app and TCP: cleartext → TLS socket → encrypted → TCP socket, and the reverse at the receiver.' },

  { id: 'app-principles-36', d: 3, type: 'order', src: 'text',
    q: 'Put the steps of sending data over TCP enhanced with TLS in the correct order.',
    items: [
      'Sending process passes cleartext data to the TLS socket',
      'TLS in the sending host encrypts the data',
      'Encrypted data goes into the sending TCP socket and travels over the Internet',
      'Receiving TCP socket passes the encrypted data up to TLS',
      'TLS in the receiving host decrypts the data',
      'TLS passes the cleartext through its TLS socket to the receiving process'
    ],
    why: 'Textbook “Securing TCP”: cleartext → TLS socket → TLS encrypts → TCP socket → Internet → receiving TCP socket → TLS decrypts → cleartext through the TLS socket to the receiving process. Only encrypted data ever crosses the network, so a sniffer on any link sees ciphertext.' },

  { id: 'app-principles-37', d: 1, type: 'tf', src: 'text',
    q: 'TLS is a third Internet transport protocol, on the same level as TCP and UDP.',
    a: false,
    why: 'False. The Internet offers exactly two transport protocols, TCP and UDP. TLS is an enhancement of TCP implemented at the application layer (with its own socket API).' },

  { id: 'app-principles-38', d: 2, type: 'mc', src: 'text',
    q: 'In Figure 2.5, which application is listed with “UDP or TCP” as its underlying transport protocol?',
    choices: [
      'Internet telephony (SIP, RTP, Skype)',
      'File transfer (FTP)',
      'Streaming multimedia (HTTP, DASH)',
      'Remote terminal access (Telnet)',
      'Electronic mail (SMTP)'
    ],
    a: 0,
    why: 'Figure 2.5: e-mail (SMTP), remote terminal access (Telnet), Web (HTTP 1.1), file transfer (FTP) and streaming multimedia (HTTP e.g. YouTube, DASH) all use TCP. Internet telephony (SIP, RTP, or proprietary like Skype) uses UDP or TCP. Streaming is the classic trap — it runs over TCP.' },

  { id: 'app-principles-39', d: 3, type: 'mc', src: 'text',
    q: 'Why do Internet telephony apps usually prefer UDP, yet are often designed to fall back to TCP?',
    choices: [
      'The SIP standard requires UDP, while TCP is reserved for sending file attachments',
      'UDP encrypts voice by default, but TCP gets through congested links faster',
      'To dodge TCP’s congestion control and overhead; but firewalls often block UDP, so TCP is the backup',
      'UDP guarantees low delay, but it cannot carry voice packets larger than a few bytes'
    ],
    a: 2,
    why: 'Telephony can tolerate some loss but needs a minimal rate, so it avoids TCP congestion control (which can throttle it) and overhead by using UDP. Because many firewalls are configured to block most UDP traffic, these apps are often designed to use TCP as a backup. UDP guarantees nothing about delay and provides no encryption.' },

  { id: 'app-principles-40', d: 2, type: 'short', src: 'ch2-R11',
    q: 'R11: Why do HTTP, SMTP, and IMAP run on top of TCP rather than on UDP?',
    a: 'Web pages, e-mail messages and mailbox data are loss-intolerant: these applications need all data to arrive without errors, in the correct order and without gaps. TCP provides this reliable, in-order data transfer; UDP does not, so with UDP each application would have to implement reliability itself.',
    keys: ['need reliable data transfer|reliab', 'all data, in order, no gaps|order|gap|no loss|lost|without loss|complete', 'loss-intolerant apps|intolerant|all data|all the data|every byte|cannot lose', 'UDP does not provide it|udp'],
    why: 'Figure 2.4: Web documents and e-mail are “no loss”, elastic, not time-sensitive — so the services UDP lacks (reliability) matter and the guarantees nobody offers (timing) do not. TCP’s reliable data transfer guarantees all data eventually gets to its destination.' },

  { id: 'app-principles-41', d: 2, type: 'short', src: 'ch2-R10',
    q: 'R10: What is meant by a handshaking protocol?',
    a: 'A protocol in which the two communicating entities first exchange control messages (a handshake) to set up state and prepare for the transfer before any application data is sent. TCP is the standard example: its three-way handshake sets up the connection before HTTP messages flow. (At the application layer, SMTP also handshakes with greetings before mail transfer, whereas HTTP itself does not.)',
    keys: ['exchange control messages first|control|handshak|exchange', 'before sending data|before', 'set up state / a connection|set up|setup|prepare|connection|state', 'e.g., TCP three-way handshake|tcp|three-way|three way|3-way'],
    why: 'Textbook §2.1.4: TCP has the client and server exchange transport-layer control information before application-level messages begin to flow — the handshaking procedure that alerts both sides to prepare for an onslaught of packets. UDP is connectionless: no handshake.' },

  { id: 'app-principles-42', d: 3, type: 'multi', src: 'text',
    q: 'Which application → application-layer protocol → transport pairings match Figure 2.5? Select all that apply.',
    choices: [
      'Internet telephony → SIP/RTP or proprietary → UDP or TCP',
      'File transfer → FTP → TCP',
      'Remote terminal access → Telnet → TCP',
      'Web → HTTP → UDP',
      'Electronic mail → SMTP → TCP',
      'Streaming multimedia → DASH → UDP'
    ],
    a: [0, 1, 2, 4],
    why: 'The Web (HTTP) runs over TCP, not UDP. Streaming multimedia (HTTP/DASH, e.g., YouTube) also runs over TCP. Everything loss-intolerant in the table uses TCP for reliable data transfer; only telephony uses UDP (or TCP as fallback).' },

  { id: 'app-principles-43', d: 2, type: 'multi', src: 'text',
    q: 'Which of the following does an application-layer protocol define? Select all that apply.',
    choices: [
      'The semantics — the meaning of the information in the fields',
      'Rules for when and how a process sends messages and responds to them',
      'The path that packets take through the routers',
      'The IP addresses assigned to the hosts',
      'The types of messages exchanged (e.g., request and response messages)',
      'The syntax of each message type — its fields and how they are delineated'
    ],
    a: [0, 1, 4, 5],
    why: '§2.1.5: an application-layer protocol defines message types, syntax, semantics, and the rules for when/how to send and respond. Routing is the network layer’s job, and address assignment is not part of an application protocol.' },

  { id: 'app-principles-44', d: 1, type: 'mc', src: 'text',
    q: 'Which is an example of a proprietary application-layer protocol (intentionally not in the public domain)?',
    choices: ['FTP (RFC 959)', 'SMTP (RFC 5321)', 'Skype’s protocols', 'HTTP (RFC 7230)'],
    a: 2,
    why: 'Public protocols are specified in RFCs, so independent implementations interoperate (a browser following the HTTP RFC works with any server following it). Skype uses proprietary protocols: one team controls both ends, and outside developers cannot interoperate. (Cheat sheet: an RFC protocol should use its assigned well-known port; a proprietary app should avoid well-known ports.)' },

  { id: 'app-principles-45', d: 3, type: 'mc', src: 'text',
    q: 'Which statement best captures the relationship between the Web and HTTP?',
    choices: [
      'HTTP and the Web are the same thing: HTTP is the whole Web application',
      'HTTP is only one piece of the Web, which also includes HTML, browsers and Web servers',
      'The Web is a P2P application, and HTTP is its proprietary, unpublished protocol',
      'HTTP defines how browsers render pages; the Web is the routers that carry them'
    ],
    a: 1,
    why: 'A network application is more than its protocol. The Web = HTML + browsers (e.g., Chrome) + servers (e.g., Apache) + HTTP, which defines the format and sequence of messages between browser and server. HTTP says nothing about how a page is displayed. The Web is client-server, and HTTP is a public RFC protocol. (Netflix likewise = servers + clients + the DASH protocol.)' },

  { id: 'app-principles-46', d: 1, type: 'short', src: 'ch2-R1',
    q: 'R1: List five nonproprietary Internet applications and the application-layer protocols that they use.',
    a: 'Web — HTTP; e-mail — SMTP (plus IMAP for retrieval); file transfer — FTP; remote terminal access — Telnet; directory (name) service — DNS; P2P file sharing — BitTorrent; streaming video — DASH.',
    keys: ['Web: HTTP|http', 'E-mail: SMTP/IMAP|smtp|imap|pop', 'File transfer: FTP|ftp', 'Remote login: Telnet|telnet|ssh', 'Others: DNS / BitTorrent / DASH|dns|bittorrent|dash|sip'],
    why: 'Any five correct application/protocol pairs. All of these are defined in public documents (mostly RFCs), unlike Skype’s proprietary protocols. Figure 2.5 gives SMTP, Telnet, HTTP 1.1 and FTP directly.' },

  { id: 'app-principles-47', d: 3, type: 'mc', src: 'cheat',
    q: 'Which application is the best fit for UDP?',
    choices: [
      'An online banking app transferring funds between accounts at peak hours',
      'An e-mail client quickly sending a message with several large attachments',
      'A large software-update download that must arrive byte-for-byte correct',
      'A multiplayer game sending 30 position updates per second, where a late update is useless'
    ],
    a: 3,
    why: 'Choose UDP when the app does not need the services UDP lacks: UDP is best-effort and connectionless, with no setup delay and no reliability, flow or congestion control. Position updates are loss-tolerant and time-sensitive — retransmitting a stale update is pointless. Banking, software updates and e-mail are loss-intolerant and need TCP’s reliable delivery.' },

  { id: 'app-principles-48', d: 3, type: 'tf', src: 'text',
    q: 'Because neither TCP nor UDP provides timing or throughput guarantees, time-sensitive applications such as Internet telephony cannot run over today’s Internet.',
    a: false,
    why: 'False. The Internet has hosted time-sensitive apps for years. They often work fairly well because they are designed to cope with the lack of guarantees. The textbook’s summary: today’s Internet can often provide satisfactory service to time-sensitive applications, but it cannot provide any timing or throughput guarantees (clever design has limits when delay is excessive or throughput is low).' },

  { id: 'app-principles-49', d: 2, type: 'mc', src: 'text',
    q: 'Besides confidentiality (encryption), which other security services can a transport protocol provide, according to the textbook?',
    choices: [
      'Host aliasing and load distribution',
      'Data integrity and end-point authentication',
      'Guaranteed throughput and bounded delay',
      'Congestion control and flow control'
    ],
    a: 1,
    why: 'Security dimension: encryption/decryption gives confidentiality even if data is observed in transit; a transport protocol can also provide data integrity and end-point authentication (cheat: “encryption, integrity protection, and authentication”). Congestion/flow control are TCP mechanisms, not security; throughput/delay are other dimensions; aliasing and load distribution are DNS services.' },

  { id: 'app-principles-50', d: 2, type: 'tf', src: 'text',
    q: 'DNS, which translates hostnames into IP addresses, is an example of core network functionality implemented at the application layer, and users normally invoke it only indirectly through other applications.',
    a: true,
    why: 'True (§2.1.6). DNS provides a directory service; most users never interact with it directly but invoke it through the Web, file transfer and e-mail. It shows how a core network function (name-to-address translation) can live at the application layer, at the network edge.' }
]);
