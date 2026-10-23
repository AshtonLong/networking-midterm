NET.addSection({
  id: "mux",
  unit: 3,
  order: 16,
  title: "Multiplexing & demultiplexing",
  short: "Mux & demux",
  cheat: "p.174–191",
  text: "§3.2",
  minutes: 30,
  summary: "Multiplexing and demultiplexing are how the transport layer turns IP's host-to-host delivery into process-to-process delivery, using port numbers. Expect questions on port ranges, the UDP 2-tuple vs the TCP 4-tuple, how ports swap in replies, and counting the sockets on clients and servers.",
  mustKnow: [
    "**Multiplexing** (sender): gather data from [[many sockets]], add headers carrying [[port numbers]], pass the segments to the network layer. **Demultiplexing** (receiver): use the header fields to deliver each segment to the [[correct socket]].",
    "Port numbers are [[16-bit]]: 0–65535. Ports [[0–1023]] are well-known: HTTP [[80]], FTP 21, Telnet 23, SMTP 25, DNS 53.",
    "UDP socket = [[2-tuple]] (destination IP, destination port). Different sources sending to the same destination IP and port reach the [[same socket]].",
    "TCP socket = [[4-tuple]] (source IP, source port, destination IP, destination port). Different source IP or source port → [[different sockets]].",
    "The source port is part of the [[return address]]: the reply's destination port is the request's source port, and the reply's source port is the request's [[destination port]].",
    "UDP client: `socket(AF_INET, SOCK_DGRAM)` gets an [[OS-assigned]] port unless you call `bind()`. Servers bind a [[well-known port]] their clients know.",
    "A TCP server has one [[welcoming (listening) socket]]; each `accept()` creates a new [[connection socket]] identified by the 4-tuple.",
    "Listening socket + 2 accepted connections = [[3 sockets]]. A client talking to two servers needs [[2 connections and 2 sockets]] and no listening socket.",
    "One server process can hold [[many connection sockets]] (e.g. one thread each). Non-persistent HTTP creates and closes a new socket for [[every request/response]]."
  ],
  topics: [
    {
      title: "Why multiplexing and demultiplexing exist",
      src: "both",
      blocks: [
        { p: "IP delivers a datagram to a **host**, but a host runs many network processes at once. Example: you download web pages while running one FTP session and two Telnet sessions, so [[four processes]] are running (one HTTP, one FTP, two Telnet). When a segment arrives, the transport layer must hand it to the right one. Extending host-to-host delivery to process-to-process delivery is transport-layer [[multiplexing and demultiplexing]]." },
        { p: "A process has one or more **sockets**, the doors through which data passes between the network and the process. The transport layer does not deliver data directly to a process; it delivers to an [[intermediary socket]]. A host can have many sockets at once, so each socket has a [[unique identifier]], and the identifier's format differs for UDP and TCP." },
        { def: "Demultiplexing", text: "At the receiving host: take segments from the network layer, examine their header fields (the [[destination port]]; for TCP, all four address fields), and deliver each segment's data to the [[correct socket]]." },
        { def: "Multiplexing", text: "At the sending host: [[gather data chunks]] from different sockets, encapsulate each chunk with header information that will later be used for demultiplexing (including port numbers), and pass the resulting segments to the [[network layer]]." },
        { p: "Figure 3.2 shows three hosts. The middle host runs processes P1 and P2, each with a socket. Its transport layer must demultiplex arriving segments to P1 or P2, and multiplex outgoing data from both sockets into segments for the network layer. Mux/demux is needed whenever a single protocol at one layer is used by [[multiple protocols at the next higher layer]], not only at the transport layer." },
        { list: [
          "Household analogy: Bill [[demultiplexes]]. He reads whom each arriving letter is addressed to and hands it to that sibling.",
          "Ann [[multiplexes]]. She collects her siblings' letters and gives them to the mail carrier."
        ] }
      ]
    },
    {
      title: "Mux and demux, step by step",
      src: "cheat",
      blocks: [
        { steps: [
          "The transport layer [[gathers data chunks]] from multiple sockets.",
          "It encapsulates each chunk with header information, including the [[source and destination port numbers]].",
          "This creates the segments.",
          "It passes the segments to the [[network layer]]."
        ], title: "Multiplexing at the sending host" },
        { steps: [
          "The transport layer receives segments from the [[network layer]].",
          "It checks the [[destination port number]] in the segment header (TCP checks all four: source IP, source port, destination IP, destination port).",
          "It delivers the segment's data to the [[correct socket]], and through it to the application process."
        ], title: "Demultiplexing at the receiving host" },
        { p: "Mux/demux has two requirements: (1) sockets have [[unique identifiers]]; (2) each segment carries fields that say which socket it is for, namely the [[source port number]] and [[destination port number]] fields. Figure 3.3 draws the segment 32 bits wide: the first row is source port # | dest port #, followed by the other header fields and then the application data (message)." },
        { game: "demux", text: "Route arriving segments to the right UDP or TCP socket by port and 4-tuple; this is the core exam skill for this section." }
      ]
    },
    {
      title: "Port numbers",
      src: "both",
      blocks: [
        { list: [
          "Each port number is a [[16-bit]] number, ranging from [[0 to 65535]] (65,536 values).",
          "Ports [[0–1023]] are the **well-known port numbers**. They are restricted, reserved for well-known application protocols such as HTTP ([[80]]) and FTP ([[21]]). The list was published in RFC 1700 and is now maintained at IANA (RFC 3232).",
          "A new application must be [[assigned a port number]]. When implementing an RFC protocol, use its well-known port; for proprietary applications, avoid the well-known ports.",
          "Simplest demux design: give each socket a port number; when a segment arrives, read its [[destination port]] and direct it to that socket. That is basically what UDP does; TCP is a little more subtle."
        ] },
        { table: { head: ["Protocol", "Well-known server port", "Usual transport"], rows: [
          ["HTTP", "80", "TCP"],
          ["HTTPS", "443", "TCP"],
          ["FTP", "21", "TCP"],
          ["Telnet", "23", "TCP"],
          ["SMTP", "25", "TCP"],
          ["DNS", "53", "UDP"]
        ] }, caption: "Ports worth knowing cold" },
        { trap: "There are [[1024]] well-known ports (0 through 1023 inclusive), not 1023, and [[65,536]] possible ports in total (0 through 65535)." }
      ]
    },
    {
      title: "Connectionless (UDP) multiplexing and demultiplexing",
      src: "both",
      blocks: [
        { code: "from socket import *\nclientSocket = socket(AF_INET, SOCK_DGRAM)   # UDP socket; port assigned automatically\nclientSocket.bind(('', 19157))                # optional: pick local port 19157 yourself", caption: "Creating a UDP socket, optionally binding a specific local port" },
        { list: [
          "Without `bind()`, the transport layer assigns a port automatically. Textbook: a port in [[1024–65535]] not currently used by any other UDP port on the host. Lecture: the system assigns an available [[temporary port]] when the socket first sends data, and the exact range depends on the OS.",
          "`bind(('', 19157))` associates local port 19157 with the socket (`''` means any local address).",
          "The usual split: the **client** lets the transport layer assign its port; the **server** binds a specific port its clients know, e.g. a [[well-known port]] such as UDP 53 for DNS."
        ] },
        { p: "Worked example from the textbook: a process on Host A with UDP port 19157 sends data to a process with UDP port 46428 on Host B. A's transport layer builds a segment containing the data, source port [[19157]], destination port [[46428]] and two other values (length and checksum, §3.3). The network layer puts it in an IP datagram and makes a best-effort attempt to deliver it. B's transport layer reads destination port 46428 and delivers the segment to that socket. B may run many processes, each with its own UDP socket; it demultiplexes by destination port." },
        { def: "UDP socket identifier", text: "A UDP socket is fully identified by the two-tuple ([[destination IP address]], [[destination port number]])." },
        { trap: "Two UDP segments with different source IP addresses and/or source ports but the same destination IP and destination port are delivered to the [[same socket]], and so to the same process. The process tells the senders apart from the source address that `recvfrom()` returns with each message." }
      ]
    },
    {
      title: "The source port: a return address",
      src: "both",
      blocks: [
        { p: "Why carry a source port at all? It is part of the [[return address]]. When B replies to A, the destination port of the B-to-A segment is taken from the [[source port]] of the A-to-B segment. The complete return address is A's IP address plus that source port." },
        { table: { head: ["Segment", "Source port", "Destination port"], rows: [
          ["A → B (request)", "19157", "46428"],
          ["B → A (reply)", "46428", "19157"]
        ] }, caption: "Figure 3.4: source and destination ports swap in the reply" },
        { code: "message, clientAddress = serverSocket.recvfrom(2048)   # clientAddress = (client IP, client port)\nmodifiedMessage = message.decode().upper()\nserverSocket.sendto(modifiedMessage.encode(), clientAddress)  # reply goes back to the client's port", caption: "UDPServer.py: recvfrom() extracts the client's source address, sendto() uses it as the destination" },
        { example: {
          q: "A DNS client at 10.0.0.5, UDP port 51000, queries a resolver at 10.0.0.53, UDP port 53. Give the four address fields of the resolver's reply.",
          a: "Source IP 10.0.0.53, source port 53 (the request's destination port).\nDestination IP 10.0.0.5, destination port 51000 (the request's source port).\nThe resolver learned 10.0.0.5:51000 from recvfrom(). The ports sit in the UDP header; the IP addresses sit in the IP header."
        } },
        { trap: "Spoofing: a UDP reply goes to whatever source address the request carried. If a client at X forges source address Y, the server sends its response to [[Y]], not to X (textbook P57a). UDP itself provides no end-point authentication." }
      ]
    },
    {
      title: "Connection-oriented (TCP) demultiplexing",
      src: "both",
      blocks: [
        { def: "TCP socket identifier", text: "A TCP socket is identified by the four-tuple ([[source IP]], [[source port]], destination IP, destination port). The host uses [[all four values]] to demultiplex an arriving segment." },
        { p: "So, unlike UDP, two arriving TCP segments with different source IP addresses or source port numbers go to [[two different sockets]]. The one exception is a segment carrying the original [[connection-establishment request]], which goes to the welcoming socket." },
        { steps: [
          "The TCP server application has a [[welcoming socket]] that waits for connection-establishment requests on its port (e.g. 12000).",
          "The client creates a socket and connects: `clientSocket = socket(AF_INET, SOCK_STREAM)`, then `clientSocket.connect((serverName, 12000))`.",
          "The connection-establishment request is just a TCP segment with destination port 12000, a [[special connection-establishment bit]] set in the TCP header (the SYN bit, §3.5), and a source port chosen by the client.",
          "The server host's OS finds the process waiting on port 12000, and that process creates a new socket: `connectionSocket, addr = serverSocket.accept()`.",
          "The server's transport layer notes four values from the request: source port, source IP, destination port and its own IP. These identify the new [[connection socket]], and every later segment matching all four is demultiplexed to it."
        ], title: "How a TCP connection socket is created" },
        { code: "serverSocket = socket(AF_INET, SOCK_STREAM)\nserverSocket.bind(('', 12000))\nserverSocket.listen(1)                              # welcoming (listening) socket\nwhile True:\n    connectionSocket, addr = serverSocket.accept()  # a new socket for each connection\n    # ... recv / send on connectionSocket ...\n    connectionSocket.close()                        # the listening socket stays open", caption: "TCP server: one welcoming socket, one new connection socket per accept()" },
        { table: { head: ["", "UDP", "TCP"], rows: [
          ["Socket identified by", "2-tuple (dest IP, dest port)", "4-tuple (src IP, src port, dest IP, dest port)"],
          ["Fields used to demultiplex", "Destination IP and port", "All four"],
          ["Different senders → same server port", "Same socket", "Different sockets (one per connection)"],
          ["How the server knows the sender", "recvfrom() returns the source IP/port", "Implied by which connection socket the data arrives on"],
          ["Server-side sockets", "One socket for all clients", "One welcoming socket + one connection socket per client"]
        ] }, caption: "UDP vs TCP demultiplexing" }
      ]
    },
    {
      title: "Many clients on one port: Figure 3.5",
      src: "both",
      blocks: [
        { p: "Host C opens two HTTP sessions to web server B, and Host A opens one. All three use destination port [[80]]. C assigns source ports 26145 and 7532; A, choosing independently, also happens to pick 26145. That is fine: B can still separate the two 26145 connections because their [[source IP addresses]] differ (A vs C)." },
        { table: { head: ["Connection", "Source IP", "Source port", "Dest IP", "Dest port"], rows: [
          ["C, session 1", "C", "26145", "B", "80"],
          ["C, session 2", "C", "7532", "B", "80"],
          ["A", "A", "26145", "B", "80"]
        ] }, caption: "Figure 3.5: three distinct four-tuples, so three connection sockets on B" },
        { list: [
          "A server can use the same port (e.g. 80) for many simultaneous connections because the complete [[four-tuple]] differs for each connection.",
          "Two connections from the same host to the same server port must use [[different source ports]] (C used 26145 and 7532), or their four-tuples would be identical.",
          "Two different hosts [[may]] pick the same source port, because their IP addresses differ.",
          "All segments to the web server, both connection-establishment segments and those carrying HTTP requests, have destination port 80. The server tells clients apart by [[source IP and source port]]."
        ] },
        { example: {
          q: "Host D (two browser tabs) and Host E connect to server S on port 443. D uses source ports 50001 and 50002; E uses 50001. Give the ports and IP addresses in segments from S back to each, and count S's sockets.",
          a: "S → D, tab 1: source S:443, destination D:50001.\nS → D, tab 2: source S:443, destination D:50002.\nS → E: source S:443, destination E:50001.\nRule: swap source and destination for both the ports (UDP/TCP header) and the IP addresses (IP header).\nSockets on S: 3 connection sockets + 1 welcoming socket = 4."
        } }
      ]
    },
    {
      title: "Counting sockets",
      src: "cheat",
      blocks: [
        { list: [
          "A server with one listening socket that has accepted two TCP connections has [[3 sockets]]: 1 listening + 2 connected. Each `accept()` returns a separate connected socket, and the listening socket remains available to accept more.",
          "A client process connecting to two server processes on different hosts needs [[2 TCP connections]] and 2 connected sockets, with a separate handshake for each. It needs [[no listening socket]]: it initiates the connections, and each connected socket can both send and receive.",
          "One server process can manage [[several connected sockets]]; a server machine can run many processes at once; the server need not create a new process for every TCP connection.",
          "A UDP server needs only [[one socket]] for all of its clients."
        ] },
        { example: {
          q: "A server process listens on TCP port 80. Three clients each hold four persistent connections to it. (a) How many sockets does the server process have? (b) If the same service ran over UDP with the same three clients, how many server sockets would it need?",
          a: "(a) 1 listening socket + 3 × 4 = 12 connection sockets → 13 sockets.\n(b) 1. A UDP socket is identified only by (destination IP, destination port), so every client's segments arrive on the same socket."
        } }
      ]
    },
    {
      title: "Web servers, threads and HTTP persistence",
      src: "text",
      blocks: [
        { p: "Figure 3.5 shows a web server that spawns a new process for each connection, each with its own connection socket. That is not required. Today's high-performing web servers often use [[one process]] and create a new [[thread]] (a lightweight subprocess) with a new connection socket for each client connection. At any moment, many connection sockets with different identifiers can be attached to the same process." },
        { list: [
          "Persistent HTTP: the client and server exchange all HTTP messages through the [[same server socket]] for the whole life of the connection.",
          "Non-persistent HTTP: a new TCP connection, and therefore a new socket, is [[created and closed for every request/response]]. Frequent socket creation and closing can severely hurt the performance of a busy web server (OS tricks can soften this)."
        ] },
        { example: {
          q: "A page has a base HTML file plus 6 images, all on one server. One client fetches it first with non-persistent HTTP (one object per connection), then with persistent HTTP. How many server connection sockets are created each time?",
          a: "Non-persistent: 7 objects → 7 TCP connections → 7 connection sockets created and closed.\nPersistent: 1 connection → 1 connection socket, reused for all 7 objects.\n(The welcoming socket exists in both cases and is not counted.)"
        } }
      ]
    },
    {
      title: "Port scanning",
      src: "text",
      blocks: [
        { p: "A server process waits on an open port. Ports map to applications: some are reserved (Web, FTP, DNS, SMTP), and others are used by convention, e.g. Microsoft SQL Server listens on [[UDP port 1434]]. So finding an open port tells you which application is probably running. System administrators want this information, and so do attackers “casing the joint”: a SQL server on port 1434 had a buffer-overflow flaw exploited by the [[Slammer worm]]." },
        { list: [
          "[[nmap]] is the most widely used port scanner (freely available, included in most Linux distributions).",
          "For TCP, nmap scans ports sequentially, looking for ports [[accepting TCP connections]]. For UDP, it looks for ports that [[respond to UDP segments]].",
          "It reports ports as open, closed or unreachable, and it can scan any target host anywhere in the Internet."
        ] }
      ]
    }
  ],
  recall: [
    { q: "What does demultiplexing do?", a: "Delivers the data in an arriving segment to the correct socket, using header fields (the destination port)." },
    { q: "What does multiplexing do?", a: "Gathers data from multiple sockets, adds headers (including port numbers) to form segments, and passes them to the network layer." },
    { q: "Port number size and range?", a: "16 bits; 0–65535." },
    { q: "Well-known port range, and the ports of HTTP and FTP?", a: "0–1023; HTTP 80, FTP 21." },
    { q: "What identifies a UDP socket?", a: "The 2-tuple (destination IP address, destination port number)." },
    { q: "What identifies a TCP socket?", a: "The 4-tuple (source IP, source port, destination IP, destination port)." },
    { q: "Two UDP segments from different senders to the same destination IP and port go where?", a: "To the same socket." },
    { q: "Two TCP segments from different senders to the same destination IP and port go where?", a: "To different sockets (one per connection), except the initial connection request, which goes to the welcoming socket." },
    { q: "What is the source port for?", a: "It is part of the return address: the reply uses it as the destination port." },
    { q: "If A→B segments have source port x and destination port y, what do B→A segments have?", a: "Source port y, destination port x." },
    { q: "Which port does a UDP socket get if you never call bind()?", a: "An unused port assigned automatically by the transport layer/OS (textbook: 1024–65535; actual range is OS-dependent)." },
    { q: "Which Python call lets a UDP server learn the client's IP and port?", a: "recvfrom()." },
    { q: "What creates a TCP connection socket on the server?", a: "accept() on the welcoming (listening) socket." },
    { q: "How many sockets does a server have with one listening socket and two accepted connections?", a: "3." },
    { q: "A client connects to two servers on different hosts over TCP: how many connections and sockets?", a: "2 connections, 2 connected sockets, 2 handshakes, no listening socket." },
    { q: "Why can Hosts A and C both use source port 26145 to reach B:80?", a: "Their source IP addresses differ, so the 4-tuples differ." },
    { q: "How does non-persistent HTTP affect server sockets?", a: "A new socket is created and closed for every request/response." },
    { q: "Name the popular port scanner.", a: "nmap." }
  ]
});
