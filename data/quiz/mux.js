(function () {
  var R1 = "R1. Suppose the network layer provides the following service. The network layer in the source host accepts a segment of maximum size 1,200 bytes and a destination host address from the transport layer. The network layer then guarantees to deliver the segment to the transport layer at the destination host. Many network application processes can be running at the destination host, and the operating system there has assigned a 4-byte port number to each running application process.";
  var P1 = "P1. Client A initiates a Telnet session with Server S. At about the same time, Client B also initiates a Telnet session with Server S. Telnet servers listen on well-known TCP port 23. For definiteness, suppose A's operating system picks source port 467 for its connection and B's picks source port 513.";
  var F35 = "Figure 3.5: web server B listens on port 80 and has three TCP connections. Web client host C has two connections to B, using source ports 26145 and 7532. Web client host A has one connection to B, using source port 26145. Hosts A, C and B have IP addresses A, C and B.";
  var R8 = "R8. A Web server runs in Host C on port 80. It uses persistent connections and is currently receiving requests from two different hosts, A and B.";
  var HOST = "Host S (IP 10.0.0.1) runs a UDP DNS server whose socket is bound to port 53, and a TCP web server with a welcoming socket on port 80 plus two established connections: one from 10.0.0.7 port 40000 and one from 10.0.0.9 port 40000.";

  NET.addQuestions("mux", [
    { id: "mux-01", d: 1, type: "mc", src: "cheat",
      q: "At the receiving host, the job of delivering the data in a transport-layer segment to the correct socket is called ___.",
      choices: ["forwarding", "encapsulation", "multiplexing", "demultiplexing"],
      a: 3,
      why: "Demultiplexing = receiver side: segment → correct socket, chosen by the header fields (destination port; for TCP, all four address fields). Multiplexing is the sender side. Forwarding is what routers do with datagrams." },

    { id: "mux-02", d: 1, type: "mc", src: "cheat",
      q: "At the sending host, gathering data chunks from different sockets, adding header information (including port numbers) to create segments, and passing them to the network layer is called ___.",
      choices: ["demultiplexing", "routing", "multiplexing", "fragmentation"],
      a: 2,
      why: "That is multiplexing: many sockets' data funnelled down into one network layer, each chunk labelled with the ports that the receiver will later use to demultiplex it." },

    { id: "mux-03", d: 1, type: "mc", src: "cheat",
      q: "Multiplexing and demultiplexing extend which delivery service into which?",
      choices: [
        "Hop-by-hop link delivery into host-to-host delivery",
        "Host-to-host delivery (network layer) into process-to-process delivery (transport layer)",
        "Unreliable delivery into reliable delivery",
        "Process-to-process delivery into host-to-host delivery"
      ],
      a: 1,
      why: "IP gets data to the right host; port-based mux/demux gets it to the right process (socket) on that host. Turning unreliable into reliable delivery is a separate job (reliable data transfer, which TCP does and UDP does not)." },

    { id: "mux-04", d: 1, type: "mc", src: "text",
      q: "How many bits long is each port-number field in a TCP or UDP header?",
      choices: ["16", "32", "8", "48"],
      a: 0,
      why: "Each port number is a 16-bit number, so ports range from 0 to 2^{16} − 1 = 65535. (32 bits is an IPv4 address; 48 bits is a MAC address.)" },

    { id: "mux-05", d: 1, type: "mc", src: "cheat",
      q: "Which range of port numbers is reserved as the well-known ports?",
      choices: ["1024–49151", "1–65535", "0–255", "0–1023"],
      a: 3,
      why: "Ports 0–1023 are the well-known (restricted) ports, reserved for well-known application protocols such as HTTP (80) and FTP (21). The textbook says automatically assigned client ports come from 1024–65535." },

    { id: "mux-06", d: 1, type: "mc", src: "cheat",
      q: "Which pairing of protocols with well-known ports is correct?",
      choices: ["HTTP 8080, FTP 20", "HTTP 80, FTP 21", "HTTP 80, FTP 25", "HTTP 21, FTP 80"],
      a: 1,
      why: "HTTP = 80 and FTP = 21 (lecture and textbook). For reference: SMTP = 25, Telnet = 23, DNS = 53, HTTPS = 443." },

    { id: "mux-07", d: 1, type: "mc", src: "cheat",
      q: "A UDP socket is fully identified by ___.",
      choices: [
        "the four-tuple (source IP, source port, destination IP, destination port)",
        "the destination port number alone",
        "the two-tuple (destination IP address, destination port number)",
        "the two-tuple (source IP address, source port number)"
      ],
      a: 2,
      why: "UDP: (destination IP, destination port). The four-tuple is TCP's identifier. The source IP and port do NOT choose a UDP socket; they only form the return address." },

    { id: "mux-08", d: 1, type: "mc", src: "cheat",
      q: "A TCP socket is identified by ___.",
      choices: [
        "the four-tuple (source IP, source port, destination IP, destination port)",
        "the source and destination MAC addresses",
        "the two-tuple (destination IP, destination port)",
        "the destination port and sequence number"
      ],
      a: 0,
      why: "TCP uses all four values, which is stricter than UDP's two-tuple. That is how one server port (e.g. 80) can carry many separate connections." },

    { id: "mux-09", d: 1, type: "num", src: "cheat",
      q: "How many different port numbers can a 16-bit port field represent? (Answer as a number.)",
      a: 65536, unit: "ports", tol: 0,
      why: "2^{16} = 65,536 values: 0 through 65535 inclusive. The highest port number is 65535; the count is 65536." },

    { id: "mux-10", d: 2, type: "num", src: "cheat",
      q: "How many well-known port numbers are there? (Answer as a number.)",
      a: 1024, unit: "ports", tol: 0,
      why: "Well-known ports are 0–1023 inclusive: 1023 − 0 + 1 = 1024 ports. A common off-by-one slip is to answer 1023." },

    { id: "mux-11", d: 1, type: "order", src: "cheat",
      q: "Put the steps of multiplexing at the sending host in order.",
      items: [
        "The transport layer gathers data chunks from the sending sockets",
        "It encapsulates each chunk with header information, including source and destination port numbers",
        "The resulting segments are created",
        "It passes the segments to the network layer"
      ],
      why: "Gather → add headers (with ports) → segments → hand to the network layer, which wraps each segment in an IP datagram." },

    { id: "mux-12", d: 2, type: "order", src: "cheat",
      q: "Put the steps of demultiplexing at the receiving host in order.",
      items: [
        "The transport layer receives a segment from the network layer",
        "It checks the destination port number in the segment header",
        "It identifies the socket associated with that port",
        "It delivers the segment's data through that socket to the application process"
      ],
      why: "Demultiplexing reads header fields (UDP: destination port; TCP: all four of src IP, src port, dst IP, dst port), picks the socket, and hands the data up through it. The data passes through the socket into the attached process." },

    { id: "mux-13", d: 2, type: "mc", src: "text",
      q: "According to the textbook, transport-layer multiplexing requires which two things?",
      choices: [
        "Each process has its own IP address, and each segment carries the process ID",
        "Sockets have unique identifiers, and each segment has special fields indicating the socket it should be delivered to",
        "Each host runs only one process per protocol, and segments carry sequence numbers",
        "Routers keep a table of sockets, and segments carry the router's address"
      ],
      a: 1,
      why: "(1) Unique socket identifiers and (2) segment fields naming the socket. Those fields are the source and destination port numbers (Figure 3.3). Processes don't get their own IP addresses, process IDs are OS-specific, and routers never track sockets." },

    { id: "mux-14", d: 2, type: "mc", src: "cheat",
      q: "A Python client runs clientSocket = socket(AF_INET, SOCK_DGRAM) and never calls bind(). Which port does the socket use?",
      choices: [
        "The same port number as the server it sends to",
        "Port 0, permanently",
        "A well-known port (0–1023) that matches the application",
        "A currently unused port assigned automatically by the transport layer/OS (the textbook says from 1024–65535)"
      ],
      a: 3,
      why: "Without bind(), the transport layer assigns a port not used by any other UDP socket on the host. Textbook: from 1024–65535. Lecture: a temporary port assigned when the socket first sends data, with an OS-dependent range. Clients normally rely on this; servers bind a known port." },

    { id: "mux-15", d: 2, type: "mc", src: "cheat",
      q: "What does clientSocket.bind(('', 19157)) do to a UDP socket?",
      choices: [
        "Sends an empty message to port 19157",
        "Connects the socket to a server listening on port 19157",
        "Associates the socket with local port 19157 (on any local address)",
        "Reserves port 19157 on the destination host"
      ],
      a: 2,
      why: "bind() sets the LOCAL address/port of the socket. The empty string '' means any local interface. It does not contact any other host; UDP has no connections, and bind never affects the remote host." },

    { id: "mux-16", d: 2, type: "mc", src: "cheat",
      q: "Typically, which side lets the transport layer pick its port automatically, and which side binds a specific port?",
      choices: [
        "Client: automatic; server: a specific port its clients know (e.g. UDP 53 for DNS)",
        "Both always bind specific well-known ports",
        "Both always use automatic ports, and DNS tells clients which port the server got",
        "Server: automatic; client: a specific well-known port"
      ],
      a: 0,
      why: "Clients must know where to send, so the server binds a known (often well-known) port. The client's port only needs to be unique on its own host, so the OS picks one, and the server learns it from the arriving segment's source port." },

    { id: "mux-17", d: 2, type: "tf", src: "cheat",
      q: "Two UDP segments with different source IP addresses but the same destination IP address and destination port are delivered to different sockets.",
      a: false,
      why: "False. A UDP socket is identified only by (destination IP, destination port), so both segments go to the same socket and the same process. (For TCP, the different source IPs would put them on different connection sockets.)" },

    { id: "mux-18", d: 2, type: "mc", src: "ch3-R7",
      q: "A process in Host C has a UDP socket with port number 6789. Host A and Host B each send a UDP segment to Host C with destination port 6789. Will both segments be directed to the same socket at Host C, and if so, how can the process tell they came from two different hosts?",
      choices: [
        "Yes, the same socket; for each segment the OS gives the process the source IP address (and port), e.g. via recvfrom()",
        "No; Host C creates a separate socket for each sending host",
        "No; the second segment is discarded because port 6789 is already in use",
        "Yes, the same socket; the process has no way to tell the senders apart"
      ],
      a: 0,
      why: "Both match the 2-tuple (C's IP, 6789), so they go to the same socket. At the socket interface the operating system supplies each segment's source IP address and port (recvfrom() returns them as clientAddress), so the process knows the origin of each and can reply to it." },

    { id: "mux-19", d: 1, type: "mc", src: "ch3-R3",
      q: "In a TCP connection between Host A and Host B, segments from A to B have source port x and destination port y. What are the source and destination ports of segments from B to A?",
      choices: ["Source x, destination y", "Source x, destination x", "Source y, destination x", "Source y, destination y"],
      a: 2,
      why: "The ports swap: B sends from its own port y back to A's port x. A's source port x is the return address for B's replies." },

    { id: "mux-20", d: 2, type: "mc", src: "cheat",
      q: "What is the main purpose of the source port number in a UDP segment?",
      choices: [
        "Routers use it to choose the outgoing link",
        "It is part of the return address: the receiver uses it as the destination port of its reply",
        "It is used as the initial value of the checksum",
        "The receiving host uses it to choose which socket gets the segment"
      ],
      a: 1,
      why: "UDP demultiplexes on the destination port only. The source port, together with the source IP, is the return address: e.g. a UDP server extracts the client's source port with recvfrom() and uses it as the destination port of its reply. Routers never look at ports." },

    { id: "mux-21", d: 2, type: "mc", src: "ch3-P57a",
      q: "A server receives a request in a UDP packet and responds in a UDP packet (as a DNS server does). A client whose real IP address is X sends the request with a spoofed source IP address Y. Where does the server send its response?",
      choices: [
        "To X, because the server can detect the real sender",
        "To both X and Y",
        "Nowhere; UDP rejects datagrams whose source address is spoofed",
        "To Y, the source address carried in the request"
      ],
      a: 3,
      why: "The server builds its reply's destination from the source IP address (and port) of the request, which is the return address. It has no way to know the real sender, so the response goes to Y. UDP does no end-point authentication." },

    { id: "mux-22", d: 2, type: "num", src: "cheat",
      q: "A TCP server has one listening socket and has accepted two client connections. How many sockets does the server have?",
      a: 3, unit: "sockets", tol: 0,
      why: "1 listening socket + 2 connected sockets (each accept() returns a new one) = 3. The listening socket stays open to accept further connections." },

    { id: "mux-23", d: 3, type: "num", src: "cheat",
      q: "A web server process listens on TCP port 80. Five clients each hold two persistent TCP connections to it at the same time. How many sockets does the server process have open, counting the listening socket?",
      a: 11, unit: "sockets", tol: 0,
      why: "5 clients × 2 connections = 10 connections → 10 connection sockets, each with its own four-tuple (they all share local port 80). Add 1 listening socket: 10 + 1 = 11. One process can hold all of them (e.g. one thread per connection)." },

    { id: "mux-24", d: 2, type: "mc", src: "cheat",
      q: "A client process connects over TCP to two server processes running on different hosts. What does the client need?",
      choices: [
        "One TCP socket connected to both servers",
        "One listening socket plus two connected sockets",
        "Two TCP connections with two connected sockets and two handshakes; no listening socket",
        "Two listening sockets, one per server"
      ],
      a: 2,
      why: "Each TCP connection is point-to-point with its own handshake, so there is one connected socket per server. The client initiates the connections, so it needs no listening socket, and each connected socket can both send and receive." },

    { id: "mux-25", d: 2, type: "tf", src: "cheat",
      q: "A server must create a new process for every TCP connection it accepts.",
      a: false,
      why: "False. One server process can manage several connected sockets (e.g. one thread per connection), and a server machine can run many processes. Figure 3.5's process-per-connection design is only one option." },

    { id: "mux-26", d: 2, type: "mc", src: "cheat",
      q: "How can a web server use port 80 for many simultaneous TCP connections?",
      choices: [
        "The server serves connections on port 80 one at a time, in turn",
        "Each connection has a different four-tuple (source IP, source port, destination IP, destination port), so the connections are distinguishable",
        "It cannot; each connection must use a different server port",
        "The clients' MAC addresses distinguish the connections"
      ],
      a: 1,
      why: "TCP demultiplexes on all four values. All connections share destination IP and port 80, but the combination with the client's source IP and source port is unique per connection. MAC addresses are link-layer and are not even end-to-end." },

    { id: "mux-27", d: 3, type: "mc", src: "text",
      ctx: F35,
      q: "Can server B correctly demultiplex the two connections that both use source port 26145?",
      choices: [
        "Yes, because their source IP addresses (A vs C) differ, so their four-tuples differ",
        "No; B must reject the second connection that uses 26145",
        "Yes, because TCP demultiplexes using only the destination port",
        "Only if A and C are on the same subnet"
      ],
      a: 0,
      why: "The four-tuples are (A, 26145, B, 80) and (C, 26145, B, 80). They differ in source IP, so B delivers them to different connection sockets. Hosts choose source ports independently, so this situation is normal. If TCP used only the destination port, all three connections would collide." },

    { id: "mux-28", d: 3, type: "short", src: "ch3-P2a",
      ctx: F35,
      q: "What are the source and destination port values in the segments flowing from the server back to the clients' processes?",
      a: "B → A: source port 80, destination port 26145. B → C (first connection): source port 80, destination port 26145. B → C (second connection): source port 80, destination port 7532.",
      keys: ["source port 80|source 80|from port 80", "26145", "7532", "swap|reverse|invert|destination port is the client"],
      why: "In the reply direction the ports swap. The server's port (80) becomes the source port, and each client's source port becomes the destination port. There are three server→client flows because there are three connections." },

    { id: "mux-29", d: 3, type: "short", src: "ch3-P2b",
      ctx: F35,
      q: "What are the IP addresses in the network-layer datagrams carrying those server-to-client segments?",
      a: "Datagrams to A: source IP B, destination IP A. Datagrams to C (both connections): source IP B, destination IP C.",
      keys: ["source IP B|source B|from B", "destination A|dest IP A|to A", "destination C|dest IP C|to C"],
      why: "The IP addresses swap just like the ports. The addresses are in the IP header (network layer), while the ports are in the TCP header. Both of C's connections use the same IP pair (B → C) and differ only in port." },

    { id: "mux-30", d: 2, type: "num", src: "text",
      ctx: F35,
      q: "Counting the welcoming (listening) socket, how many sockets does server B have for the situation in Figure 3.5?",
      a: 4, unit: "sockets", tol: 0,
      why: "Three connections → three connection sockets (one per four-tuple), plus one welcoming socket on port 80 that accepted them = 4." },

    { id: "mux-31", d: 3, type: "mc", src: "text",
      q: "Which arriving TCP segment is delivered to a socket even though its source IP and port match no existing connection socket's four-tuple?",
      choices: [
        "A retransmitted data segment",
        "A segment whose checksum fails",
        "Any segment with destination port 80",
        "A connection-establishment request (special connection-establishment/SYN bit set), which goes to the welcoming socket"
      ],
      a: 3,
      why: "The textbook notes the exception: two segments with different source IPs/ports go to different sockets, except a segment carrying the original connection-establishment request. That one goes to the server's welcoming socket, and accept() then creates a new connection socket identified by its four-tuple." },

    { id: "mux-32", d: 2, type: "multi", src: "text",
      q: "When the server's transport layer creates a new connection socket for an incoming connection request, which values identify that socket? Select all that apply.",
      choices: [
        "The client's MAC address",
        "The client process's process ID",
        "The server's own IP address",
        "The destination port number in the request segment",
        "The source port number in the request segment",
        "The IP address of the source host"
      ],
      a: [2, 3, 4, 5],
      why: "The four values noted from the connection request (source port, source IP, destination port, its own IP) identify the connection socket; later segments matching all four go to it. MAC addresses are link-layer, and process IDs never appear in segments." },

    { id: "mux-33", d: 2, type: "mc", src: "text",
      q: "How do today's high-performing web servers often handle many client connections?",
      choices: [
        "All clients share a single socket for all requests",
        "A new process listens on a new port for each client",
        "They switch to UDP so no connection sockets are needed",
        "One process creates a new thread with a new connection socket for each client connection"
      ],
      a: 3,
      why: "The textbook: high-performing web servers often use only one process and create a new thread (a lightweight subprocess) with a new connection socket for each client. So many connection sockets, with different four-tuples, can be attached to one process. They all still use port 80." },

    { id: "mux-34", d: 2, type: "num", src: "text",
      q: "One client fetches a page consisting of a base HTML file plus 10 images from one server using non-persistent HTTP (one object per TCP connection). How many server connection sockets are created, and later closed, in total? (Do not count the welcoming socket.)",
      a: 11, unit: "sockets", tol: 0,
      why: "11 objects (1 HTML + 10 images) → 11 TCP connections → 11 connection sockets, each created and closed. With persistent HTTP, a single connection socket would carry all 11 request/responses. This churn of sockets is why non-persistent HTTP can severely hurt a busy server." },

    { id: "mux-35", d: 3, type: "short", src: "ch3-R8",
      ctx: R8,
      q: "Are all of the requests being sent through the same socket at Host C? If they are being passed through different sockets, do both of the sockets have port 80? Discuss and explain.",
      a: "No. For each persistent connection the server creates a separate connection socket, identified by the four-tuple (source IP, source port, destination IP, destination port). Host C uses all four fields of each arriving segment to choose the socket, so A's requests and B's requests go through different sockets. Both sockets do have port 80 as their (destination/local) port; they differ in the source IP address (and possibly source port). Because the socket identifies the client, TCP doesn't need to pass the source IP up with each message as UDP does.",
      keys: ["different sockets|separate socket|two sockets|not the same", "four-tuple|4-tuple|source IP", "port 80|both have port 80|destination port 80", "connection socket|per connection|persistent"],
      why: "This is the TCP counterpart of R7. UDP: one socket for everyone. TCP: one connection socket per connection, all sharing port 80 and told apart by source IP/port." },

    { id: "mux-36", d: 3, type: "short", src: "ch3-R1a",
      ctx: R1,
      q: "(a) Design the simplest possible transport-layer protocol that will get application data to the desired process at the destination host.",
      a: "Call it STP. At the sender, STP accepts from the process a chunk of data of at most 1,196 bytes, a destination host address and a destination port number. It adds a 4-byte header containing the destination port number and hands the segment, with the destination host address, to the network layer. At the destination, STP reads the port number in the header, strips the header, and passes the data to the process that owns that port.",
      keys: ["header|4-byte|four-byte", "destination port|port number", "network layer|destination host address", "deliver|pass|give the data to the process"],
      why: "The minimum is demultiplexing: one header field, the destination port. With a 1,200-byte network limit and a 4-byte header, the data per segment is at most 1,200 − 4 = 1,196 bytes. No connection setup, no reliability: the network layer already guarantees delivery here." },

    { id: "mux-37", d: 2, type: "num", src: "ch3-R1a",
      ctx: R1,
      q: "For the minimal protocol of part (a), which carries only a 4-byte destination port, what is the maximum number of application-data bytes per segment?",
      a: 1196, unit: "bytes", tol: 0,
      why: "The network layer accepts segments of at most 1,200 bytes. Header = one 4-byte port field. 1,200 − 4 = 1,196 bytes of data." },

    { id: "mux-38", d: 3, type: "short", src: "ch3-R1b",
      ctx: R1,
      q: "(b) Modify this protocol so that it provides a “return address” to the destination process.",
      a: "Add a source port field: the header now has two 4-byte fields, source port and destination port (8 bytes). The sender gives STP the data (at most 1,192 bytes), the destination host address, its own (source) port and the destination port. STP builds the segment and passes it with the destination host address to the network layer. The receiving STP delivers the data to the destination-port process together with the source port number (and the source host address, if the network layer passes it up), so the process can address a reply.",
      keys: ["source port", "destination port", "header|8-byte|eight-byte|two fields", "return|reply|respond"],
      why: "This mirrors UDP/TCP: the source port (plus the source IP from the network layer) is the return address. Data limit: 1,200 − 8 = 1,192 bytes." },

    { id: "mux-39", d: 2, type: "num", src: "ch3-R1b",
      ctx: R1,
      q: "With the part (b) protocol (4-byte source port + 4-byte destination port), what is the maximum number of application-data bytes per segment?",
      a: 1192, unit: "bytes", tol: 0,
      why: "Header = 4 + 4 = 8 bytes. 1,200 − 8 = 1,192 bytes of data." },

    { id: "mux-40", d: 2, type: "mc", src: "ch3-R1c",
      ctx: R1,
      q: "(c) In your protocols, does the transport layer have to do anything in the core of the computer network?",
      choices: [
        "No; the transport protocol lives only in the end systems, and the core just moves segments host to host",
        "Yes; routers must read the port numbers to deliver to the right process",
        "Only for the return-address version in part (b)",
        "Yes; routers must add the return address"
      ],
      a: 0,
      why: "The transport layer runs only in the end systems. The network layer (core) delivers to the destination host using the host address, and the destination's transport layer does the demultiplexing. Routers never look at transport fields, as in the household analogy where the postal service never opens envelopes." },

    { id: "mux-41", d: 1, type: "mc", src: "ch3-P1a",
      ctx: P1,
      q: "(a) Give the source and destination port numbers of the segments sent from A to S.",
      choices: ["Source 23, destination 467", "Source 467, destination 513", "Source 467, destination 23", "Source 23, destination 23"],
      a: 2,
      why: "The client sends from its OS-chosen port (467) to the server's well-known Telnet port (23)." },

    { id: "mux-42", d: 1, type: "mc", src: "ch3-P1b",
      ctx: P1,
      q: "(b) Give the source and destination port numbers of the segments sent from B to S.",
      choices: ["Source 23, destination 513", "Source 513, destination 23", "Source 513, destination 467", "Source 23, destination 23"],
      a: 1,
      why: "B's own ephemeral port (513) → server port 23. Both clients target the same server port; S separates them by four-tuple." },

    { id: "mux-43", d: 2, type: "mc", src: "ch3-P1c",
      ctx: P1,
      q: "(c) Give the source and destination port numbers of the segments sent from S to A.",
      choices: ["Source 467, destination 23", "Source 80, destination 467", "Source 23, destination 467", "Source 23, destination 513"],
      a: 2,
      why: "Reverse of A→S: the server sends from port 23 to A's port 467. A's source port was the return address." },

    { id: "mux-44", d: 2, type: "mc", src: "ch3-P1d",
      ctx: P1,
      q: "(d) Give the source and destination port numbers of the segments sent from S to B.",
      choices: ["Source 21, destination 513", "Source 23, destination 513", "Source 23, destination 467", "Source 513, destination 23"],
      a: 1,
      why: "Reverse of B→S: source 23 (server), destination 513 (B's port). Port 21 is FTP, not Telnet." },

    { id: "mux-45", d: 3, type: "tf", src: "ch3-P1e",
      ctx: P1,
      q: "(e) Ignore the specific port numbers above. If A and B are different hosts, it is possible for the source port number in the segments from A to S to be the same as that in the segments from B to S.",
      a: true,
      why: "True. Each host picks its ports independently. Even with the same source port, the four-tuples (A's IP, p, S, 23) and (B's IP, p, S, 23) differ in source IP, so S still demultiplexes correctly (exactly like hosts A and C both using 26145 in Figure 3.5)." },

    { id: "mux-46", d: 3, type: "tf", src: "ch3-P1f",
      ctx: P1,
      q: "(f) Ignore the specific port numbers above. If A and B are the same host, the two sessions' segments to S can use the same source port number.",
      a: false,
      why: "False. With the same host, the source IP, destination IP (S) and destination port (23) are all identical, so the source port is the only thing that can make the two four-tuples differ. The host's OS therefore assigns two different source ports." },

    { id: "mux-47", d: 1, type: "mc", src: "text",
      q: "Which widely used, freely available port scanner probes a target host's ports to find which TCP and UDP ports are open?",
      choices: ["ping", "traceroute", "nslookup", "nmap"],
      a: 3,
      why: "nmap scans ports sequentially: for TCP it looks for ports accepting connections, and for UDP for ports that respond to UDP segments. It reports open, closed or unreachable. Admins use it to inventory services; attackers use it to find vulnerable applications (e.g. SQL Server on UDP 1434, exploited by the Slammer worm). ping tests reachability, traceroute maps the path, nslookup queries DNS." },

    { id: "mux-48", d: 3, type: "short", src: "cheat",
      q: "Why does TCP identify a socket by the full four-tuple while UDP needs only the two-tuple?",
      a: "TCP is connection-oriented: the server keeps a separate connection, with its own socket, buffers and state, for each client, yet all clients send to the same destination IP and port (e.g. port 80). Only the source IP and source port tell those connections apart, so all four values are needed to find the right connection socket. UDP is connectionless: one socket receives every segment addressed to its destination IP and port regardless of sender, and the application learns the sender from the source address returned by recvfrom().",
      keys: ["connection|per-client|each client|state", "same destination port|same port|port 80", "source IP|source port", "connectionless|one socket|recvfrom"],
      why: "Key contrast: TCP = a socket per connection (4-tuple); UDP = a socket per local port (2-tuple), with the sender identified per message." },

    { id: "mux-49", d: 3, type: "mc", src: "cheat",
      ctx: HOST,
      q: "A TCP data segment arrives with source 10.0.0.9:40000 and destination 10.0.0.1:80. Which socket receives it?",
      choices: [
        "The connection socket for (10.0.0.9, 40000, 10.0.0.1, 80)",
        "Both connection sockets, because they share port 80",
        "The welcoming socket on port 80",
        "The connection socket for (10.0.0.7, 40000, 10.0.0.1, 80), since the source port matches"
      ],
      a: 0,
      why: "TCP matches all four values. The source port 40000 alone is ambiguous (both clients use it); the source IP 10.0.0.9 picks the right connection. A data segment on an existing connection does not go to the welcoming socket, and a segment is never delivered to two sockets." },

    { id: "mux-50", d: 3, type: "mc", src: "cheat",
      ctx: HOST,
      q: "A TCP segment with the connection-establishment (SYN) bit set arrives from 10.0.0.12:52000 to 10.0.0.1:80. Which socket handles it, and what happens next?",
      choices: [
        "It is dropped, because port 80 is already in use by two connections",
        "The UDP DNS socket, since no TCP connection matches",
        "The welcoming socket on port 80; accept() then creates a new connection socket identified by (10.0.0.12, 52000, 10.0.0.1, 80)",
        "The connection socket for 10.0.0.7, because it was the first connection on port 80"
      ],
      a: 2,
      why: "Connection requests are the exception to strict four-tuple matching: they go to the welcoming (listening) socket. The server process accepts, and a new connection socket with the new four-tuple is created. TCP and UDP sockets are separate, so a TCP segment never goes to the UDP socket, and port 80 can host any number of connections." },

    { id: "mux-51", d: 2, type: "mc", src: "cheat",
      q: "A process on Host A with UDP port 19157 sends a chunk of data to a process with UDP port 46428 on Host B. What does A's transport layer put into the UDP segment it hands to the network layer?",
      choices: [
        "The data, destination port 46428 and Host B's IP address; no source port is needed for UDP",
        "The data, source port 19157, destination port 46428, and two other header values (length and checksum)",
        "The data, source port 19157, destination port 46428, and a sequence number so B can reorder segments",
        "Only the data; the network layer adds both port numbers when it builds the datagram"
      ],
      a: 1,
      why: "UDP multiplexing: the segment carries the application data, both port numbers and two other header values (length, checksum). The network layer then encapsulates it in an IP datagram (which is where the IP addresses go) and makes a best-effort delivery attempt. At B, the transport layer reads destination port 46428 and delivers to that socket. The source port is the return address B uses for its reply. UDP has no sequence numbers." },

    { id: "mux-52", d: 1, type: "tf", src: "cheat",
      q: "A developer creating a new network application must assign it a port number, and for a proprietary application should avoid the well-known ports 0–1023.",
      a: true,
      why: "True. Every application needs a valid port so that segments can be demultiplexed to it. Well-known ports (0–1023) are reserved for well-known protocols (HTTP 80, FTP 21, …). If you implement an RFC protocol, use its assigned well-known port; a proprietary app should use a port outside that range." }
  ]);
})();
