NET.addSection({
  id: "udp",
  unit: 3,
  order: 17,
  title: "UDP: connectionless transport",
  short: "UDP",
  cheat: "p.196–221",
  text: "§3.3",
  minutes: 35,
  summary: "UDP is the no-frills transport protocol: port-based multiplexing, a checksum, and nothing else. Know its characteristics (connectionless, message-oriented, best-effort), why applications still choose it, its 8-byte header, how to compute and verify the one's-complement checksum by hand (and what it cannot catch), and what happens to large messages.",
  mustKnow: [
    "UDP adds only [[mux/demux]] and [[light error checking]] to IP: no handshake (connectionless), no connection state, no control messages.",
    "Lecture characteristics: end-to-end, [[connectionless]], [[message-oriented]], best-effort, arbitrary interaction, OS independent, thin layer.",
    "Message-oriented: one send = [[one UDP message]], never split or combined. Boundaries are preserved, but each message must fit in [[one IP datagram]].",
    "Header = [[8 bytes]] (TCP: 20): source port, destination port, [[length]] (header + data, in bytes), checksum; four 16-bit fields.",
    "Why UDP: finer control over [[what and when]] data is sent, [[no connection establishment]], no connection state, a small header.",
    "Sender checksum: one's-complement sum of all 16-bit words [[with wraparound]], then [[flip every bit]].",
    "Receiver: add all words including the checksum; [[all 1s]] = no error detected, any 0 = error.",
    "The checksum is needed because not every link checks errors and bits can flip in [[router memory]] (end-end principle). It only [[detects]] errors; failing segments are discarded.",
    "Every 1-bit error is caught; some [[2-bit errors]] (opposite flips in the same column) slip through.",
    "The destination port is in the UDP header; the destination [[IP address]] is in the IP header. UDP never splits messages; IP may [[fragment]] and reassembles at the destination."
  ],
  topics: [
    {
      title: "UDP: the bare-bones transport",
      src: "both",
      blocks: [
        { p: "Imagine a “vacuous” transport protocol that passes messages straight between the application and the network layer. It cannot work: at a minimum the transport layer must [[multiplex/demultiplex]] so data reaches the right process. UDP (RFC 768) does about as little as a transport protocol can: apart from mux/demux and some [[light error checking]], it adds nothing to IP. An application using UDP is almost talking directly to IP." },
        { steps: [
          "UDP takes the message from the application process.",
          "It attaches source and destination [[port number]] fields (for mux/demux) plus two other small fields (length and checksum).",
          "It passes the segment to the network layer, which puts it in an IP datagram and makes a [[best-effort]] attempt to deliver it.",
          "If the segment arrives, the receiving UDP uses the [[destination port]] to deliver its data to the correct process."
        ], title: "What UDP does with a message" },
        { p: "There is [[no handshaking]] between the sending and receiving transport-layer entities before a segment is sent. That is why UDP is called **connectionless**." },
        { example: {
          q: "A host's DNS application sends a query over UDP and no reply ever arrives. Who does what?",
          a: "UDP does nothing further: it sent the segment without handshaking and never retransmits.\nThe DNS application may resend the query, try another name server, or tell the invoking application that it cannot get a reply.\nWith UDP, any recovery is the application's job."
        } }
      ]
    },
    {
      title: "UDP's characteristics (lecture list)",
      src: "cheat",
      blocks: [
        { p: "UDP and TCP differ in the [[service]] they offer to applications. The lecture's seven characteristics of UDP:" },
        { list: [
          "**End-to-end**: can [[distinguish among multiple applications]] running on a given computer (via ports).",
          "**Connectionless**: no connection is [[set up]] before sending.",
          "**Message-oriented**: sends and receives [[individual messages]].",
          "**Best-effort**: offers applications the [[same best-effort delivery semantics as IP]]; messages can be lost, duplicated or arrive out of order.",
          "**Arbitrary interaction**: an application can send to [[many]] other applications, receive from many, or communicate with [[exactly one]].",
          "**Operating-system independent**: identifies application programs in a way that does [[not depend on identifiers used by the local OS]] (such as process IDs).",
          "**Thin layer**: a thin protocol layer with [[extremely low overhead]]."
        ] }
      ]
    },
    {
      title: "Connectionless paradigm",
      src: "cheat",
      blocks: [
        { def: "Connectionless communication paradigm", text: "An application using UDP need not [[pre-establish communication]] before sending. It can generate and send data [[at any time]], and it can wait an [[arbitrarily long]] time between two messages." },
        { list: [
          "UDP keeps [[no connection state]]: no per-peer buffers, sequence/ACK numbers or congestion parameters.",
          "UDP uses [[no control messages]]: communication consists only of the data messages themselves (nothing like TCP's SYN, ACK or FIN)."
        ] }
      ]
    },
    {
      title: "Message-oriented interface",
      src: "cheat",
      blocks: [
        { def: "Message-oriented interface", text: "Each time an application asks UDP to send data, UDP places the data in [[a single message]]. It does not [[divide]] an application message into multiple UDP datagrams, and it does not [[combine]] messages for delivery." },
        { list: [
          "Positive consequence: applications [[preserve data boundaries]]. Each message received is exactly the same as was transmitted.",
          "Negative consequence: each UDP message must fit into [[a single IP datagram]], so the IP datagram size limits the maximum UDP message size."
        ] },
        { trap: "TCP is a byte stream: three `send()` calls of 100, 200 and 300 bytes may be read back as one 600-byte chunk, or any other split. UDP: three `sendto()` calls make three datagrams, and each `recvfrom()` returns exactly [[one whole message]]. The messages may still arrive out of order, or not at all." }
      ]
    },
    {
      title: "Message size, efficiency and MTU",
      src: "cheat",
      blocks: [
        { def: "MTU", text: "[[Maximum transmission unit]]: the largest packet a network can carry in one frame. Ethernet's MTU is [[1500 bytes]]." },
        { list: [
          "Very small messages: high [[header overhead]] relative to the data (UDP 8 + IPv4 20 = 28 header bytes per datagram).",
          "Very large messages: the IP datagram may exceed the network MTU and need [[fragmentation]], which reduces efficiency.",
          "For best efficiency, use [[larger messages]] while keeping the complete IP datagram, headers included, within the [[path MTU]]."
        ] },
        { formula: "efficiency = D / (D + H_{UDP} + H_{IP})",
          where: [["D", "application data per message (bytes)"], ["H_{UDP}", "UDP header = 8 bytes"], ["H_{IP}", "IPv4 header = 20 bytes (no options)"]],
          note: "Largest unfragmented UDP payload = MTU − 20 − 8." },
        { example: {
          q: "Over Ethernet (MTU 1500 bytes) with a 20-byte IPv4 header: what is the largest UDP payload that avoids fragmentation, and what is the efficiency at that size compared with a 10-byte payload?",
          a: "Max payload = 1500 − 20 − 8 = 1472 bytes.\nEfficiency = 1472 / 1500 = 98.1%.\n10-byte payload: 10 / (10 + 8 + 20) = 10 / 38 = 26.3%."
        } }
      ]
    },
    {
      title: "Why choose UDP over TCP?",
      src: "both",
      blocks: [
        { list: [
          "**Finer application-level control over what data is sent, and when.** UDP packages the data and passes it to the network layer [[immediately]]. TCP's congestion control can [[throttle]] the sender, and TCP keeps resending a segment until it is acknowledged, however long that takes. Real-time apps want a minimum sending rate, dislike delay, and can tolerate some loss.",
          "**No connection establishment.** No three-way handshake, so [[no setup delay]]. This is probably the principal reason [[DNS]] runs over UDP; it would be much slower over TCP.",
          "**No connection state.** TCP keeps receive/send buffers, congestion-control parameters and sequence/ACK numbers for each connection. UDP keeps none, so a server can typically support [[many more active clients]].",
          "**Small packet header overhead.** [[8 bytes]] per UDP segment vs 20 bytes for TCP."
        ] },
        { trap: "Choosing UDP only because it is [[less complex]] than TCP is not enough. A simpler protocol is useful only if its delivery service meets the application's needs, or if the application supplies whatever additional functions it requires." },
        { table: { head: ["Application", "App-layer protocol", "Transport"], rows: [
          ["Electronic mail", "SMTP", "TCP"],
          ["Remote terminal access", "Telnet", "TCP"],
          ["Secure remote terminal access", "SSH", "TCP"],
          ["Web", "HTTP, HTTP/3", "TCP (HTTP), UDP (HTTP/3)"],
          ["File transfer", "FTP", "TCP"],
          ["Remote file server", "NFS", "Typically UDP"],
          ["Streaming multimedia", "DASH", "TCP"],
          ["Internet telephony", "Typically proprietary", "UDP or TCP"],
          ["Network management", "SNMP", "Typically UDP"],
          ["Name translation", "DNS", "Typically UDP"]
        ] }, caption: "Figure 3.6: popular Internet applications and their transport protocols" },
        { list: [
          "E-mail, remote terminal access, file transfer and the Web (HTTP) need [[reliable data transfer]], so they use TCP.",
          "SNMP (network management) uses UDP because it must often run when the network is [[stressed]], exactly when reliable, congestion-controlled transfer is hard to achieve.",
          "Multimedia (Internet phone, video conferencing, streaming) tolerates a small amount of loss and reacts poorly to TCP's congestion control, so it often uses UDP. TCP is increasingly attractive for streaming, though, because loss rates are low and some organizations [[block UDP traffic]] for security reasons.",
          "HTTP/3 runs over [[QUIC]], which runs over UDP and implements reliability (and congestion control) in the application layer."
        ] },
        { game: "match-blitz", text: "Sort applications and protocols into TCP vs UDP at speed; Figure 3.6 is a favourite exam table." }
      ]
    },
    {
      title: "UDP and congestion control: the controversy",
      src: "text",
      blocks: [
        { p: "UDP has no congestion control, and congestion control is what keeps a network from entering a state where very little useful work gets done. If everyone streamed high-bit-rate video over UDP with no congestion control, routers would overflow so badly that very [[few UDP packets]] would get through. The high loss would also make TCP senders cut their rates. Result: high loss for the UDP flows themselves and [[crowding out]] of TCP sessions. Researchers have proposed mechanisms that force all sources, UDP ones included, to perform adaptive congestion control (e.g. RFC 4340)." },
        { p: "An application can still get reliable delivery over UDP if it builds reliability into the application itself (acknowledgments and retransmissions, §3.4). [[QUIC]], used in Google's Chrome, does exactly this. It is a nontrivial amount of work, but it lets the application “have its cake and eat it too”: reliable communication without being subject to [[TCP's congestion-control]] rate constraints." }
      ]
    },
    {
      title: "UDP sender and receiver actions",
      src: "cheat",
      blocks: [
        { steps: [
          "UDP is passed an [[application-layer message]].",
          "UDP determines the UDP segment [[header field values]] (ports, length, checksum).",
          "UDP creates the UDP segment.",
          "UDP passes the segment to [[IP]]."
        ], title: "UDP sender actions, in order" },
        { steps: [
          "UDP receives a segment from [[IP]].",
          "UDP checks the [[checksum]] header value.",
          "UDP extracts the application-layer message.",
          "UDP [[demultiplexes]] the message up to the application via the socket."
        ], title: "UDP receiver actions, in order" }
      ]
    },
    {
      title: "UDP segment structure",
      src: "both",
      blocks: [
        { diagram: "udp-segment" },
        { def: "UDP header", text: "Four fields of [[2 bytes]] each (8 bytes in total): source port #, dest port #, [[length]], checksum. Then comes the application data (message), e.g. a DNS query or response, or audio samples." },
        { list: [
          "Port numbers: let the destination host pass the data to the right process ([[demultiplexing]]).",
          "Length: the number of bytes in the UDP segment, [[header plus data]]. It must be explicit because the size of the data field [[differs from one segment to the next]].",
          "Checksum: lets the receiver check whether [[errors]] were introduced into the segment. (It is actually also computed over a few fields of the IP header; the textbook ignores this detail.)"
        ] },
        { example: {
          q: "A UDP segment carries a 512-byte application message. What is in the length field? What is the largest value the length field can hold, and the largest UDP payload over IPv4?",
          a: "Length = 8 + 512 = 520 bytes.\nThe field is 16 bits, so its largest value is 2^{16} − 1 = 65,535 bytes.\nAn IPv4 datagram is also limited to 65,535 bytes in total, so with a 20-byte IP header the largest UDP payload is 65,535 − 20 − 8 = 65,507 bytes."
        } },
        { p: "Where are the addresses? The destination [[port]] is in the UDP header; the destination [[IP address]] is in the IP header, not the UDP header. So the application supplies the destination IP address when it sends (e.g. `sendto(data, (serverName, serverPort))`). The OS passes that address to IP alongside the UDP segment, and IP fills it into the destination address field of the IP header." },
        { p: "Reply ports: when a server replies from the same socket to the client's sending socket, the reply's source port is the [[server's port]] (the request's destination port) and its destination port is the [[client's original source port]]." },
        { table: { head: ["Segment", "Source port", "Destination port"], rows: [
          ["Client → server (request)", "50000 (client, OS-assigned)", "53 (server)"],
          ["Server → client (reply)", "53", "50000"]
        ] }, caption: "UDP reply ports, using a DNS-style example" }
      ]
    },
    {
      title: "Computing the UDP checksum (sender)",
      src: "both",
      blocks: [
        { steps: [
          "Treat the segment contents as a sequence of [[16-bit words]] (with the checksum field itself counted as 0 while computing).",
          "Add the words with one's-complement arithmetic: any carry out of the top bit is [[wrapped around]] and added back into the lowest bit.",
          "Take the [[one's complement]] of the final sum (flip every bit: 0 → 1, 1 → 0).",
          "Put the result in the checksum field."
        ], title: "Sender-side checksum" },
        { formula: "checksum = ~(w_{1} + w_{2} + … + w_{n})",
          where: [["w_{i}", "the 16-bit words of the segment"], ["+", "one's-complement addition: a carry out of bit 15 is added back into bit 0 (wraparound)"], ["~", "complement: flip every bit"]],
          note: "Do not drop the carry, and do not forget the final flip. Those are the two classic mistakes." },
        { example: {
          q: "Textbook example: compute the checksum of the three 16-bit words 0110011001100000, 0101010101010101 and 1000111100001100.",
          a: "First two words:\n  0110011001100000\n+ 0101010101010101\n= 1011101110110101 (no carry)\nAdd the third word:\n  1011101110110101\n+ 1000111100001100\n= 1 0100101011000001 (carry out of the top bit)\nWrap the carry around: 0100101011000001 + 1 = 0100101011000010 (the sum)\nOne's complement (flip all bits): 1011010100111101 ← checksum\nReceiver check: 0100101011000010 + 1011010100111101 = 1111111111111111, all 1s, so no error detected."
        } },
        { example: {
          q: "8-bit practice (two wraparounds): compute the 1s-complement checksum of the bytes 11001100, 10101010, 11110000.",
          a: "  11001100\n+ 10101010\n= 1 01110110 → wrap: 01110110 + 1 = 01110111\n  01110111\n+ 11110000\n= 1 01100111 → wrap: 01100111 + 1 = 01101000 (the sum)\nFlip all bits: 10010111 ← checksum\nCheck: 01101000 + 10010111 = 11111111."
        } },
        { game: "checksum", text: "Do several wraparound sums and receiver checks until they are mechanical; there is almost certainly an exam question on this." }
      ]
    },
    {
      title: "Verifying the checksum (receiver)",
      src: "both",
      blocks: [
        { p: "The receiver adds [[all]] the 16-bit words of the received segment, including the checksum, with the same wraparound sum. If there are no errors, the result is [[1111111111111111]], because a sum plus its own complement is all 1s. If any bit of the result is 0, an error occurred during transmission." },
        { example: {
          q: "In the textbook example, the three data words arrive intact but the checksum arrives as 1011010100111111 (bit 1 flipped). What does the receiver compute and conclude?",
          a: "Sum of the three data words (as before): 0100101011000010\n  0100101011000010\n+ 1011010100111111\n= 1 0000000000000001 (carry out)\nWrap: 0000000000000001 + 1 = 0000000000000010\nNot all 1s → error detected → the segment is discarded. (An error in the checksum field itself is caught too.)"
        } }
      ]
    },
    {
      title: "Why a checksum, and what it cannot do",
      src: "both",
      blocks: [
        { list: [
          "Many link-layer protocols (e.g. Ethernet) check for errors, but there is [[no guarantee]] that every link on the path does.",
          "Even if every link transfer is correct, bit errors can be introduced while a segment is stored in a [[router's memory]].",
          "So UDP must provide error detection [[end-to-end]], at the transport layer, if the end-to-end service is to detect errors. Since IP can run over just about any layer-2 protocol, transport-layer error checking is a sensible safety measure."
        ] },
        { def: "End-end principle (Saltzer 1984)", text: "Since certain functionality (here, error detection) must be implemented on an end-end basis, “functions placed at the lower levels may be [[redundant or of little value]] when compared to the cost of providing them at the higher level.”" },
        { list: [
          "The checksum only [[detects]] errors. It does not correct them or recover from them.",
          "UDP [[silently discards]] segments that fail the check: no NAK, no retransmission request. (The textbook notes that some implementations instead pass the damaged segment to the application with a warning.)",
          "It can [[miss some errors]]: if the same bit position flips in opposite directions in two words (one 0 → 1, the other 1 → 0), the sum is unchanged and the check still passes.",
          "Every [[single-bit error]] is detected: one flipped bit changes one word by ±2^{k}, and that always changes the one's-complement sum."
        ] },
        { example: {
          q: "Show a 2-bit error in the textbook's three words that the receiver would NOT detect.",
          a: "Flip the last bit of word 1 (0 → 1) and the last bit of word 2 (1 → 0):\n  0110011001100001\n+ 0101010101010100\n= 1011101110110101, the same partial sum as the original.\nSo the total is still 0100101011000010, and adding the checksum 1011010100111101 still gives 1111111111111111. The receiver sees all 1s and accepts corrupted data."
        } },
        { trap: "“The checksum matched, so the data is error-free.” Wrong: a match means no error was [[detected]]. Errors that cancel out in the sum go unnoticed." }
      ]
    },
    {
      title: "Large messages and fragmentation",
      src: "cheat",
      blocks: [
        { list: [
          "UDP [[never divides]] a large application message into several UDP datagrams. Each accepted message goes into exactly one datagram.",
          "If the message exceeds the allowed UDP/IP size, the [[send operation fails]] and the application must divide the data into smaller messages itself.",
          "If the IP datagram carrying a UDP message exceeds the network MTU, IPv4 may [[fragment]] the IP datagram (if fragmentation is allowed). Fragmentation happens at the [[IP layer]]; UDP still treats the application message as one message.",
          "IP [[reassembles]] the fragments at the destination before passing the complete UDP datagram to UDP, so the application receives one message (assuming successful delivery and a big enough receive buffer).",
          "If the **application** splits a large message into three smaller ones and sends each with UDP, they arrive as [[three separate UDP datagrams]]. UDP does not combine them; the receiving application must combine them if needed and handle any missing or out-of-order pieces."
        ] },
        { table: { head: ["Who splits?", "What the receiving application gets"], rows: [
          ["IP fragmentation (datagram > MTU)", "One message: IP reassembles before UDP sees it"],
          ["The application (3 separate sends)", "Three separate messages: the app must reassemble and handle loss and reordering"],
          ["Nobody: message > maximum UDP/IP size", "Nothing is sent: the send operation fails"]
        ] } },
        { trap: "“UDP will break my 100 KB message into MTU-sized datagrams.” No. UDP never splits messages (and over IPv4 the payload limit is 65,507 bytes). It is TCP that chops a byte stream into segments." }
      ]
    }
  ],
  recall: [
    { q: "What does UDP add to IP?", a: "Only multiplexing/demultiplexing (ports) and light error checking (checksum)." },
    { q: "Why is UDP called connectionless?", a: "No handshaking between sender and receiver transport entities before sending a segment." },
    { q: "List the lecture's UDP characteristics.", a: "End-to-end, connectionless, message-oriented, best-effort, arbitrary interaction, OS independent, thin layer." },
    { q: "What does “arbitrary interaction” mean?", a: "An app can send to many apps, receive from many, or talk to exactly one." },
    { q: "Message-oriented interface: what does UDP never do to messages?", a: "Never splits one message into several datagrams and never combines messages." },
    { q: "Positive and negative consequences of the message-oriented interface?", a: "+ Message boundaries are preserved; − each message must fit in one IP datagram." },
    { q: "Too-small vs too-large UDP messages?", a: "Small: high header overhead. Large: exceed the MTU, so fragmentation. Best: large but within the path MTU." },
    { q: "MTU stands for? Ethernet's MTU?", a: "Maximum transmission unit; 1500 bytes." },
    { q: "Four textbook reasons to choose UDP?", a: "Finer control of what/when data is sent; no connection establishment; no connection state; small header (8 vs 20 bytes)." },
    { q: "Principal reason DNS uses UDP?", a: "No connection-establishment delay." },
    { q: "Why does SNMP use UDP?", a: "Network management must run when the network is stressed, when reliable, congestion-controlled transfer is hard." },
    { q: "Why is voice/video often sent over TCP today?", a: "Many firewalls/organizations block UDP traffic (and loss rates are low)." },
    { q: "UDP header fields and size?", a: "Source port, destination port, length, checksum: 2 bytes each, 8 bytes total." },
    { q: "What does the UDP length field count?", a: "Bytes in the whole UDP segment: header plus data." },
    { q: "UDP receiver actions in order?", a: "Receive segment from IP → check checksum → extract message → demultiplex to the app via the socket." },
    { q: "How does the sender compute the UDP checksum?", a: "One's-complement sum of all 16-bit words with wraparound, then flip all bits." },
    { q: "How does the receiver check the UDP checksum?", a: "Add all words including the checksum; all 1s = no error detected; any 0 = error." },
    { q: "Why have a UDP checksum if links check errors?", a: "Not all links check; errors can occur in router memory; end-to-end detection (end-end principle)." },
    { q: "Can a 1-bit error go undetected? A 2-bit error?", a: "1-bit: no, always detected. 2-bit: yes, if opposite flips in the same bit position cancel." },
    { q: "Where is the destination IP address of a UDP message stored?", a: "In the IP header (the app supplies it on send; the UDP header has only ports)." },
    { q: "Who reassembles a fragmented UDP datagram?", a: "IP at the destination, before handing one complete datagram to UDP." }
  ]
});
