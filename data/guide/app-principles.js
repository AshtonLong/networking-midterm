NET.addSection({
  id: 'app-principles',
  unit: 2,
  order: 7,
  title: 'Application architectures, processes & transport services',
  short: 'App principles',
  cheat: 'p.72–82',
  text: '§2.1',
  minutes: 35,
  summary: 'What a network application is, where its code runs (only at the edge), the two application architectures (client-server vs P2P), how processes talk through sockets and are addressed by IP address + port, and the four transport services an app can ask for — and which of them TCP and UDP actually deliver. Almost every later Chapter 2 question (HTTP, DNS, email) leans on this vocabulary.',
  mustKnow: [
    'A network application = [[two or more programs on different hosts]] exchanging messages. Application logic lives only on [[end hosts]]; routers and switches only forward packets (network layer and below).',
    'Client-server: [[always-on server]] with a [[fixed, well-known IP address]]; clients initiate, may have dynamic IPs, never talk to each other directly. P2P: no always-on server, peers talk directly, [[self-scalable]] and cheap but hard to manage (BitTorrent).',
    'In any session, the process that [[initiates contact]] is the client and the one that [[waits to be contacted]] is the server — even in P2P.',
    'A [[socket]] is the interface (API) between the application process and the transport layer. The developer controls the application side; the [[operating system]] controls transport, network, link and physical.',
    'A process is addressed by [[IP address + port number]]. IPv4 = [[32 bits]], IPv6 = [[128 bits]]. Well-known ports: HTTP [[80]], SMTP [[25]].',
    'Four transport service dimensions: [[reliable data transfer, throughput, timing, security]].',
    'TCP: [[connection-oriented]] (handshake), reliable in-order byte stream, flow + congestion control. UDP: [[connectionless]], best-effort, no reliability, no flow or congestion control.',
    'Neither TCP nor UDP gives [[timing or throughput guarantees]] or built-in encryption.',
    '[[TLS]] is an enhancement of TCP implemented at the [[application layer]] — not a third transport protocol.',
    'Elastic apps (email, file transfer, Web) use whatever throughput exists; [[bandwidth-sensitive]] apps need a minimum rate. Loss-intolerant: file/Web/email; loss-tolerant: real-time audio/video.',
    'An application-layer protocol defines message [[types]], [[syntax]], [[semantics]] and rules for when/how to send and respond.'
  ],
  topics: [
    {
      title: 'What a network application is, and why its code lives at the edge',
      src: 'both',
      blocks: [
        { def: 'Network application', text: '[[Two or more programs]] running on [[different hosts]] (end systems) that communicate by exchanging messages over the network.' },
        { p: 'Examples: the Web is a [[browser program]] on the user’s host talking to a [[Web server program]] on the server host; Netflix is a Netflix app on your phone/laptop talking to a Netflix server program. The software can be written in C, Java, Python, etc. — but it runs on end systems only.' },
        { p: 'You do **not** write software for network-core devices (routers, link-layer switches) — and you could not even if you wanted to: core devices do not function at the application layer; they work at the [[network layer and below]]. Confining application software to end systems is what allowed the rapid development and deployment of a vast array of network applications.' },
        { list: [
          'Application logic is implemented on [[end hosts]] (clients and servers); routers and switches only [[forward packets]].',
          'This [[edge deployment]] simplifies development, distribution and updates.',
          'An application can be updated globally [[without changing router forwarding logic]]: routers implement general packet forwarding and need not know the application changed — as long as the new version still uses the supported transport and network services.',
          'Servers are often (not always) housed in [[data centers]].'
        ] },
        { trap: 'Trap: “Deploying a new app (or a new version of its message format) requires upgrading routers on the path.” False — routers never look at application messages; only the client and server programs change.' },
        { diagram: 'stack' }
      ]
    },
    {
      title: 'Application architecture: client-server vs peer-to-peer',
      src: 'both',
      blocks: [
        { p: 'Do not confuse the two “architectures”. The [[network architecture]] (e.g., the five-layer Internet stack) is fixed from the developer’s point of view and provides a specific set of services. The [[application architecture]] is designed by the application developer and dictates how the application is structured over the various end systems. The two predominant paradigms are client-server and peer-to-peer (P2P).' },
        { def: 'Client-server architecture', text: 'An [[always-on]] host, the server, services requests from many other hosts, the clients. The server has a [[fixed, well-known IP address]], so a client can always contact it by sending a packet to that address.' },
        { list: [
          'Clients [[initiate contact]], may be only occasionally online and often have [[dynamic IP addresses]].',
          'Clients [[do not communicate directly]] with each other (two browsers never talk to each other in the Web application).',
          'Examples: the [[Web]], FTP, Telnet, e-mail.'
        ] },
        { p: 'A single server host often cannot keep up with all client requests (a popular social network would be overwhelmed), so a [[data center]] housing a large number of hosts is used to create a powerful [[virtual server]]. Search engines (Google, Bing, Baidu), e-commerce (Amazon, eBay, Alibaba), Web mail (Gmail, Yahoo Mail) and social media (Facebook, Instagram, Twitter, WeChat) run in one or more data centers. Google has 19 data centers worldwide. A data center can have hundreds of thousands of servers that must be powered and maintained, and the provider pays [[recurring interconnection and bandwidth costs]] for data sent out of its data centers.' },
        { def: 'Peer-to-peer (P2P) architecture', text: 'Minimal or [[no reliance on dedicated, always-on servers]]. The application exploits [[direct communication]] between pairs of intermittently connected hosts called [[peers]] — desktops and laptops controlled by users (homes, universities, offices), not owned by the service provider.' },
        { list: [
          'Peers have [[dual roles]]: they request resources and provide them.',
          '[[Self-scalability]]: each peer adds workload (requests files) but also adds service capacity (distributes files to other peers).',
          '[[Cost effective]]: no significant server infrastructure or server bandwidth needed.',
          'Peers are [[intermittently available]] and change IP addresses.',
          'Challenges: [[security, performance and reliability]] — it is harder to manage because it is decentralized.',
          'Example: the file-sharing application [[BitTorrent]].'
        ] },
        { table: {
          head: ['', 'Client-server', 'P2P'],
          rows: [
            ['Always-on server?', 'Yes (often a data center)', 'No (minimal or none)'],
            ['Addresses', 'Server: fixed, well-known IP; clients: often dynamic', 'Peers: intermittent, changing IPs'],
            ['Who talks to whom', 'Clients ↔ server only; clients never talk directly', 'Peers talk directly'],
            ['Scaling', 'Add servers / data centers', 'Self-scaling: new peers add capacity and demand'],
            ['Cost', 'Server infrastructure + recurring bandwidth', 'Low server and bandwidth cost'],
            ['Management', 'Centralized, easier', 'Decentralized: security, performance, reliability harder'],
            ['Examples', 'Web, FTP, Telnet, e-mail', 'BitTorrent file sharing']
          ] }, caption: 'Figure 2.2 in words: (a) client-server, (b) P2P' },
        { example: { q: 'Classify each: (1) a search engine run from Google data centers, (2) BitTorrent, (3) two browsers loading the same page, (4) a new peer joining a file-sharing swarm. Which architecture, and does it add capacity?', a: '(1) Client-server — the data center acts as one powerful virtual server; capacity comes from the provider buying servers.\n(2) P2P — peers upload to each other.\n(3) Client-server — each browser talks only to the Web server; the two browsers never talk to each other.\n(4) P2P self-scalability — the new peer adds demand (it downloads) but also adds upload capacity for everyone else.' } }
      ]
    },
    {
      title: 'Processes: who is the client, who is the server',
      src: 'both',
      blocks: [
        { def: 'Process', text: 'A [[program that is running]] within an end system. It is processes, not programs, that communicate.' },
        { list: [
          'Processes on the [[same host]] communicate with [[interprocess communication]], governed by the host’s operating system.',
          'Processes on [[different hosts]] (possibly with different OSes) communicate by [[exchanging messages]] across the network: the sender creates and sends messages; the receiver receives them and possibly responds.',
          'Communicating application processes reside in the [[application layer]] of the five-layer stack.'
        ] },
        { def: 'Client and server processes', text: 'In the context of a communication session between a pair of processes, the process that [[initiates the communication]] is the [[client]]; the process that [[waits to be contacted]] to begin the session is the [[server]].' },
        { list: [
          'Web: the [[browser]] process is the client; the Web server process is the server.',
          'P2P file sharing: the peer that is [[downloading]] is the client; the peer that is [[uploading]] is the server. When Peer A asks Peer B for a file, A is the client and B is the server for that session.',
          'A P2P process can be both a client and a server (it uploads and downloads), but in any one session we can still label one process client and the other server. P2P applications therefore **do** have client processes and server processes.',
          'When there is no confusion we talk of the “[[client side]] and [[server side]]” of an application.'
        ] },
        { trap: 'Trap (R4): “In P2P there is no notion of client and server sides of a session.” Wrong. In every session one peer initiates (client — usually the downloader) and the other waits (server — the uploader).' }
      ]
    },
    {
      title: 'Sockets: the door between a process and the network',
      src: 'both',
      blocks: [
        { def: 'Socket', text: 'The software interface through which a process sends messages into, and receives messages from, the network. It is the interface between the [[application layer and the transport layer]] within a host, also called the [[Application Programming Interface (API)]] between the application and the network.' },
        { p: 'Analogy: a process is a [[house]] and its socket is its [[door]]. To send a message, the process shoves it out the door, trusting a transportation infrastructure on the other side to carry it to the door of the destination process; at the destination, the message passes through the receiving process’s door and the process acts on it.' },
        { table: {
          head: ['Part of the host', 'Controlled by'],
          rows: [
            ['Application process (application-layer side of the socket)', 'Application developer'],
            ['Socket', 'Application developer (the developer’s handle on the network)'],
            ['Transport layer (e.g., TCP with its buffers and variables)', 'Operating system'],
            ['Network, link, physical layers', 'Operating system']
          ] }, caption: 'Figure 2.3 in words: process → socket → TCP (buffers, variables) → Internet → TCP → socket → process' },
        { p: 'The developer has [[little control]] of the transport-layer side. The only control is (1) the [[choice of transport protocol]] (TCP or UDP) and (2) perhaps the ability to fix a few transport parameters such as [[maximum buffer size and maximum segment size]]. Once the protocol is chosen, the application is built on that protocol’s services.' },
        { trap: 'Trap: the socket is not the transport layer and not a port number. It is the interface (API) between the process and transport; the port number is the identifier of a socket on the host.' }
      ]
    },
    {
      title: 'Addressing processes: IP address + port number',
      src: 'both',
      blocks: [
        { p: 'To send to a process on another host you need [[two identifiers]]: (1) the address of the [[host]] and (2) an identifier of the [[receiving process (socket)]] on that host.' },
        { def: 'IP address', text: 'Identifies [[which host]] (more precisely, a host interface). [[IPv4]] addresses are [[32 bits]]; [[IPv6]] addresses are [[128 bits]]. For now think of it as uniquely identifying the host.' },
        { def: 'Port number', text: 'Identifies [[which process/socket]] on the destination host. Needed because a host generally runs [[many network applications]] at once.' },
        { list: [
          'Popular applications have [[well-known ports]]: a Web server (HTTP) is port [[80]]; a mail server (SMTP) is port [[25]]. (HTTPS uses 443.)',
          'The list of well-known ports for Internet standard protocols is kept at [[IANA]] (www.iana.org). Ports are covered in depth in Chapter 3.',
          'If you implement an RFC-defined protocol, use its assigned well-known port; a proprietary application should avoid well-known ports.'
        ] },
        { example: { q: 'How many distinct IPv4 addresses exist, and how many bytes long is an IPv6 address?', a: 'IPv4 is 32 bits → 2^{32} = 4,294,967,296 (about 4.3 billion) addresses.\nIPv6 is 128 bits → 128 / 8 = 16 bytes (2^{128} addresses).' } },
        { trap: 'Trap: the IP address alone is not enough (which of the host’s many processes?), and the port alone is not enough (port 80 on which host?). You need both.' },
        { game: 'match-blitz', text: 'Drill protocol → port and protocol → transport until 80/25/443/53 are automatic.' }
      ]
    },
    {
      title: 'The four transport service dimensions',
      src: 'both',
      blocks: [
        { p: 'A network (the Internet included) can offer more than one transport protocol, and the developer must pick one — like choosing train vs plane between two cities (train: downtown pickup; plane: shorter travel time). Possible transport services fall along [[four dimensions]]: [[reliable data transfer]], [[throughput]], [[timing]] and [[security]].' },
        { def: 'Reliable data transfer', text: 'A guaranteed data delivery service: the sending process passes data into the socket and knows with complete confidence it will arrive [[without errors]] (and completely) at the receiving process.' },
        { list: [
          'Why it is needed: packets get lost — a packet can [[overflow a router buffer]], or be [[discarded after bits are corrupted]].',
          '[[Loss-intolerant]] apps need it: e-mail, file transfer, remote host access, Web document transfers, financial applications.',
          '[[Loss-tolerant]] apps can live without it: multimedia such as conversational audio/video, where lost data causes only a small glitch.'
        ] },
        { def: 'Throughput', text: 'Available throughput = the [[rate at which the sending process can deliver bits]] to the receiving process. It fluctuates because other sessions share the path and come and go. A transport service could guarantee throughput of at least [[r bits/sec]].' },
        { list: [
          '[[Bandwidth-sensitive]] apps have a minimum throughput requirement. Example: Internet telephony encoding voice at [[32 kbps]] needs data delivered at that rate; with less it must encode at a lower rate or give up — half the needed throughput is of little or no use. Many multimedia apps are bandwidth-sensitive (some use adaptive coding to match available throughput).',
          '[[Elastic]] apps use as much or as little throughput as happens to be available: [[e-mail, file transfer, Web transfers]]. More is better, but there is no minimum.'
        ] },
        { def: 'Timing', text: 'A delay guarantee, e.g., every bit the sender pumps into the socket arrives at the receiver’s socket [[no more than 100 msec later]].' },
        { list: [
          'Wanted by [[interactive real-time]] apps: Internet telephony, virtual environments, teleconferencing, multiplayer games (long delays → unnatural pauses, unrealistic games).',
          'Non-real-time apps prefer lower delay but have no tight end-to-end delay constraint.'
        ] },
        { def: 'Security', text: 'E.g., the transport protocol encrypts at the sender and decrypts at the receiver → [[confidentiality]]. Other security services: [[data integrity]] and [[end-point authentication]].' },
        { example: { q: 'A voice app encodes at 32 kbps and puts 20 ms of speech in each message. How many bytes of voice per message? If the network delivers only 16 kbps, what happens?', a: 'Bits per message = 32,000 bits/s × 0.020 s = 640 bits = 640 / 8 = 80 bytes.\nAt 16 kbps the app gets only half its required rate. It is bandwidth-sensitive: it must re-encode at ≤ 16 kbps (lower quality) or give up — receiving half the needed throughput is of little use.' } }
      ]
    },
    {
      title: 'What applications need (Figure 2.4)',
      src: 'both',
      blocks: [
        { table: {
          head: ['Application', 'Data loss', 'Throughput', 'Time-sensitive'],
          rows: [
            ['File transfer/download', 'No loss', 'Elastic', 'No'],
            ['E-mail', 'No loss', 'Elastic', 'No'],
            ['Web documents', 'No loss', 'Elastic (few kbps)', 'No'],
            ['Internet telephony / video conferencing', 'Loss-tolerant', 'Audio: few kbps–1 Mbps; video: 10 kbps–5 Mbps', 'Yes: 100s of msec'],
            ['Streaming stored audio/video', 'Loss-tolerant', 'Same as above', 'Yes: few seconds'],
            ['Interactive games', 'Loss-tolerant', 'Few kbps–10 kbps', 'Yes: 100s of msec'],
            ['Smartphone messaging', 'No loss', 'Elastic', 'Yes and no']
          ] }, caption: 'Figure 2.4 — requirements of selected network applications' },
        { list: [
          'File transfers and Web transactions are [[loss-intolerant]] → need reliable delivery; real-time media are [[loss-tolerant]].',
          'Internet calls and interactive games need [[low end-to-end delay]] (100s of msec); stored streaming tolerates [[a few seconds]].',
          '[[Minimum-rate]] (bandwidth-sensitive) applications need enough bandwidth for a target quality; [[elastic]] applications adapt to whatever bandwidth is available.'
        ] },
        { example: { q: 'R7: No row of Figure 2.4 needs both no loss and tight timing. Conceive an application that does.', a: 'Any real-time control or decision system where every byte matters and late data is useless: e.g., remote control of machinery or remote surgery (every command must arrive and arrive quickly), real-time stock trading/price feeds, or game state updates that must all be applied within a few hundred ms. Smartphone messaging (“Yes and no” for timing) is a mild case: no loss allowed and users expect near-instant delivery.' } }
      ]
    },
    {
      title: 'Internet transport: TCP services vs UDP services',
      src: 'both',
      blocks: [
        { p: 'The Internet (TCP/IP networks) offers applications exactly [[two transport protocols]]: [[TCP]] and [[UDP]]. Choosing between them is one of the first decisions when you create a new network application.' },
        { def: 'TCP — connection-oriented service', text: 'Client and server exchange transport-layer control information ([[handshaking]]) before application messages flow, alerting both to prepare for an onslaught of packets. Afterwards a [[TCP connection]] exists between the two processes’ sockets. It is [[full-duplex]] (both can send at the same time). When finished, the application must [[tear down]] the connection.' },
        { def: 'TCP — reliable data transfer service', text: 'TCP delivers all data sent [[without error and in the proper order]]: the same stream of bytes arrives at the receiving socket with [[no missing or duplicate bytes]].' },
        { p: 'TCP also has [[congestion control]] — a service for the [[general welfare of the Internet]] rather than for the direct benefit of the communicating processes. It throttles a sender (client or server) when the network is congested and tries to limit each connection to its [[fair share]] of bandwidth. TCP also provides [[flow control]] (do not overflow the receiver).' },
        { def: 'UDP', text: 'A [[no-frills, lightweight]] transport protocol with minimal services: [[connectionless]] (no handshaking), [[unreliable]] (no guarantee a message ever arrives; messages may arrive [[out of order]]), and [[no congestion control]] — the sender can pump data into the network layer at any rate it pleases (actual end-to-end throughput may still be lower because of link capacity or congestion).' },
        { table: {
          head: ['', 'TCP', 'UDP'],
          rows: [
            ['Connection setup', 'Yes — handshake before data', 'None (connectionless)'],
            ['Reliable, in-order delivery', 'Yes', 'No (best-effort; loss, reordering possible)'],
            ['Flow control', 'Yes', 'No'],
            ['Congestion control', 'Yes (throttles sender)', 'No (send at any rate)'],
            ['Timing / latency guarantee', 'No', 'No'],
            ['Throughput / minimum-bandwidth guarantee', 'No', 'No'],
            ['Built-in security (encryption)', 'No (add TLS)', 'No']
          ] }, caption: 'Cheat-sheet comparison (lecture p.72–82)' },
        { trap: 'Trap: “TCP guarantees throughput/delay because it is reliable.” No. TCP guarantees that data eventually arrives correctly and in order — not when, and not at what rate. Neither TCP nor UDP gives timing or throughput guarantees.' }
      ]
    },
    {
      title: 'Securing TCP: TLS',
      src: 'text',
      blocks: [
        { p: 'Neither TCP nor UDP encrypts anything: the bytes a process passes into its socket are the bytes that travel over every link. A [[cleartext password]] sent into a socket can be sniffed on any intervening link.' },
        { def: 'TLS (Transport Layer Security, RFC 5246)', text: 'An [[enhancement of TCP]] that does everything TCP does plus process-to-process security: [[encryption, data integrity and end-point authentication]]. TLS is [[not a third transport protocol]] alongside TCP and UDP; its enhancements are [[implemented in the application layer]].' },
        { list: [
          'To use TLS, the developer must [[include TLS code]] (existing, highly optimized libraries and classes) in [[both the client and the server]] sides of the application.',
          'TLS has its own [[socket API]], similar to the traditional TCP socket API.'
        ] },
        { steps: [
          'The sending process passes [[cleartext]] data to the [[TLS socket]].',
          'TLS in the sending host [[encrypts]] the data and passes the encrypted data to the [[TCP socket]].',
          'The encrypted data travels over the Internet to the TCP socket in the receiving process.',
          'The receiving TCP socket passes the encrypted data up to TLS, which [[decrypts]] it.',
          'TLS passes the cleartext data through its TLS socket to the receiving process.'
        ], title: 'Data path with TLS' },
        { trap: 'Trap (R9): “TLS operates at the transport layer.” It provides transport-like security services, but it is implemented at the application layer, on top of TCP.' }
      ]
    },
    {
      title: 'What the Internet does not provide, and who uses what (Figure 2.5)',
      src: 'both',
      blocks: [
        { p: 'Of the four dimensions, TCP provides reliable data transfer, and TCP can be enhanced at the application layer with TLS for security. Conspicuously missing: [[throughput and timing guarantees]] — today’s Internet transport protocols provide neither. Time-sensitive apps (e.g., Internet telephony) still work fairly well because they are [[designed to cope]] with the lack of guarantees, but clever design has limits when delay is excessive or throughput is limited.' },
        { table: {
          head: ['Application', 'Application-layer protocol', 'Transport'],
          rows: [
            ['Electronic mail', 'SMTP [RFC 5321]', 'TCP'],
            ['Remote terminal access', 'Telnet [RFC 854]', 'TCP'],
            ['Web', 'HTTP 1.1 [RFC 7230]', 'TCP'],
            ['File transfer', 'FTP [RFC 959]', 'TCP'],
            ['Streaming multimedia', 'HTTP (e.g., YouTube), DASH', 'TCP'],
            ['Internet telephony', 'SIP [RFC 3261], RTP [RFC 3550], or proprietary (e.g., Skype)', 'UDP or TCP']
          ] }, caption: 'Figure 2.5 — popular apps, their application-layer protocols and transport' },
        { list: [
          'E-mail, remote terminal access, the Web and file transfer use TCP primarily for its [[reliable data transfer]]: all data eventually gets there.',
          'Internet telephony tolerates some loss but needs a minimal rate, so it usually prefers [[UDP]] to circumvent TCP’s [[congestion control and packet overheads]].',
          'Because many [[firewalls block UDP]], telephony apps often use [[TCP as a backup]] when UDP fails.'
        ] },
        { p: '**Why choose UDP?** UDP is best-effort and connectionless: [[no connection setup]] delay, and no reliability, flow or congestion control slowing the sender. It fits applications that [[do not need those transport services]] (or would rather supply what they need themselves).' },
        { example: { q: 'R6: You want a single request/response transaction between a remote client and a server to finish as fast as possible. RTT = 60 ms, transmission times negligible. UDP or TCP, and how long does each take?', a: 'UDP: the client sends the request into a UDP socket and the server replies → 1 RTT = 60 ms.\nTCP: one RTT to set up the connection (SYN, SYNACK), then the request (riding on the third handshake segment) and the reply → 2 RTT = 120 ms.\nSo use UDP — it saves the handshake RTT (60 ms here). The cost: no reliability, so the app must handle a lost request or reply itself.' } }
      ]
    },
    {
      title: 'Application-layer protocols: what they define; public vs proprietary',
      src: 'both',
      blocks: [
        { p: 'An [[application-layer protocol]] defines how an application’s processes, running on different end systems, pass messages to each other. In particular it defines:' },
        { list: [
          'The [[types of messages]] exchanged — e.g., request messages and response messages.',
          'The [[syntax]] of the message types — the fields and how they are delineated.',
          'The [[semantics]] of the fields — the meaning of the information in them.',
          '[[Rules]] for determining when and how a process sends messages and responds to messages.'
        ] },
        { def: 'Public (open) protocol', text: 'Specified in [[RFCs]], so in the public domain. Example: HTTP [RFC 7230]. A browser that follows the HTTP RFC can retrieve pages from [[any Web server]] that also follows it — independent implementations interoperate.' },
        { def: 'Proprietary protocol', text: 'Intentionally not public; one team controls both ends, so outside developers cannot interoperate. Example: [[Skype]].' },
        { p: 'A network application is more than its protocol. The [[Web]] = HTML (document format standard) + Web browsers (Chrome, Internet Explorer) + Web servers (Apache, Microsoft servers) + the application-layer protocol [[HTTP]], which defines the format and sequence of messages between browser and server. Netflix = video servers, billing/client-management servers, client apps + the [[DASH]] protocol. The protocol is only one (important) piece.' },
        { list: [
          'Applications studied in Chapter 2: the [[Web]] (HTTP — simple and popular), [[electronic mail]] (the Internet’s first killer app; uses several application-layer protocols), [[DNS]] (directory service; users invoke it indirectly through other apps), [[P2P]] file sharing, and [[video streaming]] over CDNs.',
          'DNS shows how a piece of core network functionality — name-to-address translation — can be [[implemented at the application layer]].'
        ] },
        { example: { q: 'R1: List five nonproprietary Internet applications and the application-layer protocols they use.', a: 'Web → HTTP; e-mail → SMTP (sending/relay), IMAP (retrieval); file transfer → FTP; remote login → Telnet; name lookup (directory service) → DNS; P2P file sharing → BitTorrent protocol; streaming video → DASH (over HTTP). Any five pairs.' } }
      ]
    }
  ],
  recall: [
    { q: 'Define a network application.', a: 'Two or more programs running on different hosts that exchange messages.' },
    { q: 'Why do new apps never require router changes?', a: 'Application logic lives only on end hosts; routers just forward packets at the network layer and below, as long as the app uses supported transport/network services.' },
    { q: 'Network architecture vs application architecture?', a: 'Network architecture = fixed layered stack providing services; application architecture = designed by the developer (client-server or P2P), dictates how the app is structured over end systems.' },
    { q: 'Four properties of a client-server server.', a: 'Always on, fixed well-known IP address, serves many clients, clients never talk to each other directly.' },
    { q: 'P2P: one big advantage and three challenges.', a: 'Self-scalability (and low cost); challenges: security, performance, reliability (decentralized, hard to manage).' },
    { q: 'Which process is the client in a session?', a: 'The one that initiates contact; the server waits to be contacted.' },
    { q: 'In P2P file sharing, which peer is the client?', a: 'The downloading peer (the one that initiates the request); the uploading peer is the server.' },
    { q: 'What is a socket?', a: 'The interface (API) between the application process and the transport layer within a host — the process’s “door”.' },
    { q: 'What may the developer control on the transport side of the socket?', a: 'Only the choice of transport protocol and maybe a few parameters (max buffer size, max segment size).' },
    { q: 'Two identifiers needed to address a remote process?', a: 'The host’s IP address and the process’s port number.' },
    { q: 'IPv4 vs IPv6 address sizes?', a: '32 bits vs 128 bits.' },
    { q: 'Well-known ports for HTTP and SMTP?', a: 'HTTP 80, SMTP 25.' },
    { q: 'Four transport service dimensions?', a: 'Reliable data transfer, throughput, timing, security.' },
    { q: 'Elastic vs bandwidth-sensitive?', a: 'Elastic uses whatever throughput is available (email, file transfer, Web); bandwidth-sensitive needs a minimum rate (e.g., 32 kbps voice).' },
    { q: 'What do TCP and UDP both fail to provide?', a: 'Timing guarantees, throughput guarantees, and encryption.' },
    { q: 'Where is TLS implemented and what must the developer do?', a: 'At the application layer as an enhancement of TCP; include TLS libraries in both client and server and use the TLS socket API.' },
    { q: 'Why do telephony apps prefer UDP but keep TCP as backup?', a: 'UDP avoids TCP congestion control and overhead; firewalls often block UDP.' },
    { q: 'Four things an application-layer protocol defines?', a: 'Message types, syntax, semantics, rules for when/how to send and respond.' },
    { q: 'Example of a public and a proprietary app-layer protocol?', a: 'Public: HTTP (RFC 7230). Proprietary: Skype.' }
  ]
});
