(function () {
  var P3 = "P3. UDP and TCP use 1s complement for their checksums. Suppose you have the following three 8-bit bytes: 01010011, 01100110, 01110100. (UDP and TCP really use 16-bit words; this problem uses 8-bit sums.)";
  var P25 = "P25. We have said that an application may choose UDP for a transport protocol because UDP offers finer application control (than TCP) of what data is sent in a segment and when.";
  var TB = "Textbook checksum example: the segment consists of the three 16-bit words 0110011001100000, 0101010101010101 and 1000111100001100, and the sender's checksum is 1011010100111101.";
  var HI = "A UDP segment goes from source port 19157 to destination port 46428, has length 10 bytes, and carries the 2-byte message “Hi” (ASCII 0x48 0x69). Ignore the IP pseudo-header and count the checksum field as 0 while computing. The 16-bit words are 0x4AD5 (19157), 0xB55C (46428), 0x000A (10) and 0x4869 (“Hi”).";

  NET.addQuestions("udp", [
    { id: "udp-01", d: 1, type: "mc", src: "text",
      q: "How long is the UDP header?",
      choices: ["4 bytes", "16 bytes", "8 bytes", "20 bytes"],
      a: 2,
      why: "Four 2-byte fields (source port, destination port, length, checksum) = 8 bytes. TCP's header is 20 bytes (without options); this small overhead is one reason applications choose UDP." },

    { id: "udp-02", d: 1, type: "mc", src: "cheat",
      q: "Which fields make up the UDP header?",
      choices: [
        "Destination port, length, checksum, receive window",
        "Source port, destination port, length, checksum",
        "Source port, destination port, sequence number, checksum",
        "Source IP, destination IP, length, checksum"
      ],
      a: 1,
      why: "UDP has exactly four header fields. IP addresses live in the IP header, not the UDP header. Sequence numbers and the receive window are TCP fields; UDP has neither, because it does no reliable delivery or flow control." },

    { id: "udp-03", d: 1, type: "num", src: "cheat",
      q: "A UDP segment carries a 100-byte application message. What value is in the length field? (Answer in bytes.)",
      a: 108, unit: "bytes", tol: 0,
      why: "The length field counts the whole UDP segment, header plus data: 8 + 100 = 108 bytes. It has to be explicit because the size of the data field differs from one segment to the next." },

    { id: "udp-04", d: 1, type: "mc", src: "cheat",
      q: "What does MTU stand for?",
      choices: ["Message transport unit", "Maximum transport utilisation", "Minimum transfer unit", "Maximum transmission unit"],
      a: 3,
      why: "MTU = maximum transmission unit: the largest packet a network can carry in one frame (Ethernet: 1500 bytes). IP datagrams larger than the MTU must be fragmented." },

    { id: "udp-05", d: 1, type: "multi", src: "cheat",
      q: "Which of these are characteristics of UDP from the lecture? Select all that apply.",
      choices: ["Byte-stream oriented", "Connectionless", "Message-oriented", "Best-effort delivery", "Operating-system independent", "Congestion-controlled"],
      a: [1, 2, 3, 4],
      why: "The lecture's list is: end-to-end, connectionless, message-oriented, best-effort, arbitrary interaction, operating-system independent, thin layer. A byte stream and congestion control are TCP properties." },

    { id: "udp-06", d: 1, type: "mc", src: "cheat",
      q: "What does it mean that UDP is “end-to-end”?",
      choices: [
        "UDP can distinguish among multiple applications running on a given computer",
        "UDP keeps a connection open between the two end hosts",
        "UDP is implemented in every router along the path",
        "UDP guarantees delivery from end to end"
      ],
      a: 0,
      why: "End-to-end here means UDP gets data to a specific application on the destination computer (via port numbers), not just to the host. It runs only in end systems, guarantees nothing, and keeps no connection." },

    { id: "udp-07", d: 2, type: "mc", src: "cheat",
      q: "UDP is said to allow “arbitrary interaction.” What does that mean?",
      choices: [
        "Any application can read any other application's UDP messages",
        "Messages are delivered in whatever order the application requests",
        "An application can send to many other applications, receive from many, or communicate with exactly one",
        "UDP picks a random destination for each message"
      ],
      a: 2,
      why: "With no connections, one UDP socket isn't tied to a single peer: it can talk 1-to-many, many-to-1 or 1-to-1. (TCP connections are strictly point-to-point.)" },

    { id: "udp-08", d: 2, type: "mc", src: "cheat",
      q: "UDP is described as “operating-system independent.” What does that mean?",
      choices: [
        "It can be used on only one operating system at a time",
        "It bypasses the OS kernel and talks directly to the network card",
        "It runs without any operating system",
        "It identifies application programs with its own means (port numbers) rather than identifiers used by the local OS, such as process IDs"
      ],
      a: 3,
      why: "Process IDs differ between operating systems and change on every run, so a remote host can't use them. UDP's port numbers give an OS-neutral way to name the application on the destination." },

    { id: "udp-09", d: 1, type: "mc", src: "cheat",
      q: "UDP is called a “thin” protocol layer. What does that mean?",
      choices: [
        "It adds almost nothing to IP beyond mux/demux and light error checking, so its overhead is extremely low",
        "It is implemented inside the link layer",
        "It runs only on thin-client devices",
        "It has no header at all"
      ],
      a: 0,
      why: "UDP is a thin layer over IP: ports, length and checksum in an 8-byte header, and no state, handshakes, ACKs or retransmissions. It does have a header, and it is a transport-layer protocol." },

    { id: "udp-10", d: 2, type: "mc", src: "cheat",
      q: "Which statement describes UDP's connectionless communication paradigm?",
      choices: [
        "The application must send at a fixed rate or the connection times out",
        "The application need not pre-establish communication; it can send at any time and wait an arbitrarily long time between messages",
        "The application must exchange a control message before each data message",
        "The application must close the connection after each message"
      ],
      a: 1,
      why: "Connectionless means no setup, no teardown and no keep-alive: send whenever you like, as rarely as you like. Since there is no connection, nothing can time out." },

    { id: "udp-11", d: 1, type: "tf", src: "cheat",
      q: "UDP exchanges control messages (such as connection setup and acknowledgments) in addition to data messages.",
      a: false,
      why: "False. UDP uses no control messages: communication consists only of the data messages themselves. It also keeps no connection state. TCP is the one with SYN, ACK and FIN segments." },

    { id: "udp-12", d: 1, type: "mc", src: "cheat",
      q: "What does UDP's message-oriented interface mean?",
      choices: [
        "UDP splits large messages into MTU-sized datagrams",
        "Each send places the data in a single UDP message; UDP neither divides one message into several datagrams nor combines messages",
        "UDP combines small messages to reduce header overhead",
        "UDP buffers application bytes and sends them in MSS-sized chunks"
      ],
      a: 1,
      why: "One application send = one UDP message = one datagram. Buffering into MSS-sized chunks is TCP's byte-stream behaviour. UDP never splits or combines; if anything is split, it's IP fragmenting the datagram." },

    { id: "udp-13", d: 3, type: "mc", src: "cheat",
      q: "A sender calls sendto() three times on one UDP socket, with messages of 100, 200 and 300 bytes. All three arrive. The receiver then calls recvfrom(2048) once. What does that call return?",
      choices: [
        "Exactly one complete message (100, 200 or 300 bytes, whichever datagram is first in line); later calls return the others",
        "Exactly the 100-byte message, guaranteed, because UDP delivers in order",
        "Up to 2048 bytes of a continuous byte stream",
        "All 600 bytes merged, since 600 is less than 2048"
      ],
      a: 0,
      why: "UDP preserves message boundaries: each recvfrom() returns exactly one message, never a merge. UDP is best-effort and doesn't guarantee order, so whichever datagram arrived first is returned first, not necessarily the 100-byte one. Merging and arbitrary splitting describe TCP's byte stream." },

    { id: "udp-14", d: 1, type: "mc", src: "cheat",
      q: "What is the negative consequence of UDP's message-oriented interface?",
      choices: [
        "Message boundaries are lost at the receiver",
        "Messages may arrive merged together",
        "Each UDP message must fit into a single IP datagram, so IP datagram size limits the maximum message size",
        "Each message needs its own connection"
      ],
      a: 2,
      why: "Since UDP never splits a message, the whole message has to fit in one IP datagram. The positive consequence is the opposite of the distractors: boundaries are preserved, and each message arrives exactly as it was sent." },

    { id: "udp-15", d: 2, type: "mc", src: "cheat",
      q: "Which choice of UDP message size gives the best efficiency?",
      choices: [
        "Exactly 8 bytes, to match the header size",
        "As small as possible, to avoid fragmentation",
        "Larger than the MTU, so that IP fragmentation spreads the load",
        "As large as possible while keeping the whole IP datagram, headers included, within the path MTU"
      ],
      a: 3,
      why: "Small messages waste bandwidth on headers (28 bytes of UDP + IPv4 header each). Messages above the MTU force fragmentation, which reduces efficiency (and losing any fragment loses the whole message). The sweet spot is the largest message that still fits in the path MTU." },

    { id: "udp-16", d: 2, type: "num", src: "cheat",
      q: "Ethernet's MTU is 1500 bytes. With a 20-byte IPv4 header and the 8-byte UDP header, what is the largest UDP payload (application data) that avoids IP fragmentation? (Answer in bytes.)",
      a: 1472, unit: "bytes", tol: 0,
      why: "The whole IP datagram must fit in the MTU: 1500 − 20 (IP header) − 8 (UDP header) = 1472 bytes of data." },

    { id: "udp-17", d: 3, type: "num", src: "cheat",
      q: "An application sends 1-byte UDP messages (e.g. one keystroke each). With an 8-byte UDP header and a 20-byte IPv4 header, what percentage of each IP datagram is application data? (Answer in %.)",
      a: 3.448, unit: "%", tol: 0.02,
      why: "Datagram size = 1 + 8 + 20 = 29 bytes. Efficiency = 1 / 29 = 0.0345 = 3.45%. That is the “very small messages have high header overhead” problem: about 96.5% of the bytes are headers." },

    { id: "udp-18", d: 3, type: "num", src: "cheat",
      q: "IPv4 limits a datagram to 65,535 bytes in total. With a 20-byte IPv4 header and the 8-byte UDP header, what is the largest application payload a single UDP message can carry over IPv4? (Answer in bytes.)",
      a: 65507, unit: "bytes", tol: 0,
      why: "65,535 − 20 − 8 = 65,507 bytes. A UDP message must fit into one IP datagram, so this is the hard cap. Anything bigger makes the send fail, and the application has to split it into several messages itself." },

    { id: "udp-19", d: 2, type: "num", src: "text",
      q: "The UDP length field is 2 bytes. What is the largest value it can hold? (Answer in bytes.)",
      a: 65535, unit: "bytes", tol: 0,
      why: "16 bits → 2^{16} − 1 = 65,535. Because the field counts header + data, that would be 8 header bytes + 65,527 data bytes, but over IPv4 the 20-byte IP header lowers the real payload limit to 65,507." },

    { id: "udp-20", d: 1, type: "num", src: "text",
      q: "Ignoring options, how many bytes of transport-layer header does an application save per segment by using UDP instead of TCP?",
      a: 12, unit: "bytes", tol: 0,
      why: "TCP header = 20 bytes; UDP header = 8 bytes; 20 − 8 = 12 bytes saved per segment." },

    { id: "udp-21", d: 2, type: "multi", src: "text",
      q: "According to Figure 3.6, which applications typically run over UDP? Select all that apply.",
      choices: ["SNMP (network management)", "DASH (streaming multimedia)", "DNS (name translation)", "NFS (remote file server)", "Telnet (remote terminal access)", "SMTP (electronic mail)"],
      a: [0, 2, 3],
      why: "Figure 3.6: SNMP, DNS and NFS are “typically UDP.” SMTP, Telnet, SSH, FTP, HTTP and DASH streaming use TCP. Internet telephony is “UDP or TCP,” and HTTP/3 uses UDP (via QUIC)." },

    { id: "udp-22", d: 2, type: "mc", src: "text",
      q: "Why is UDP preferred over TCP for network management (SNMP)?",
      choices: [
        "SNMP messages are too large for TCP",
        "SNMP requires encryption, which only UDP provides",
        "SNMP runs on routers, which cannot run TCP",
        "Network management must often run when the network is stressed, exactly when reliable, congestion-controlled transfer is hard to achieve"
      ],
      a: 3,
      why: "When the network is congested or failing, TCP's handshakes, retransmissions and rate throttling make transfers slow or impossible. That is exactly when management traffic matters most. UDP provides no encryption, and message size isn't the issue." },

    { id: "udp-23", d: 1, type: "mc", src: "text",
      q: "What is probably the principal reason DNS runs over UDP rather than TCP?",
      choices: [
        "UDP has no connection-establishment delay",
        "DNS messages are too large for TCP",
        "DNS needs reliable, in-order delivery",
        "DNS needs congestion control"
      ],
      a: 0,
      why: "A DNS lookup is a single small query/response. Over TCP it would first need a handshake (an extra RTT), so DNS would be much slower. If a UDP query is lost, the DNS application itself resends or tries another server." },

    { id: "udp-24", d: 2, type: "mc", src: "text",
      q: "TCP keeps per-connection state (buffers, congestion-control parameters, sequence and ACK numbers); UDP keeps none. What benefit does the textbook cite for UDP?",
      choices: [
        "UDP segments always arrive in order",
        "UDP can retransmit lost segments faster",
        "A server devoted to a particular application can typically support many more active clients",
        "UDP headers can leave out the port numbers"
      ],
      a: 2,
      why: "No per-client state means less memory and processing per client, so more clients per server. UDP never retransmits and never guarantees order, and it always carries ports." },

    { id: "udp-25", d: 2, type: "short", src: "ch3-R4",
      q: "Describe why an application developer might choose to run an application over UDP rather than TCP.",
      a: "UDP gives finer control over what data is sent and when: there is no congestion control to throttle the sender and no retransmission holding up new data, which suits real-time apps that need a minimum rate and tolerate some loss. There is no connection-establishment delay (why DNS uses UDP), no connection state (a server can handle more clients), and a smaller header (8 vs 20 bytes). Apps that don't need reliable delivery, or that build what they need into the application, benefit.",
      keys: ["congestion control|throttle|rate", "connection establishment|handshake|setup delay", "connection state|more clients", "header|8 bytes|overhead", "loss|real-time|reliability not needed"],
      why: "The textbook's four reasons are: finer control of what/when, no connection establishment, no connection state, and a small header. The classic example: IP telephony and video conferencing avoid TCP's congestion control and don't need full reliability." },

    { id: "udp-26", d: 2, type: "short", src: "ch3-R5",
      q: "Why is voice and video traffic often sent over TCP rather than UDP in today's Internet? (Hint: the answer has nothing to do with TCP's congestion-control mechanism.)",
      a: "Because many firewalls and organizations block UDP traffic for security reasons, while TCP traffic is allowed through. Sending the media over TCP gets it past those firewalls, and with today's low loss rates TCP's reliability costs little.",
      keys: ["firewall|block", "UDP blocked|block UDP|UDP traffic", "security", "low loss|loss rates are low"],
      why: "Textbook: “When packet loss rates are low, and with some organizations blocking UDP traffic for security reasons, TCP becomes an increasingly attractive protocol for streaming media transport.”" },

    { id: "udp-27", d: 2, type: "short", src: "ch3-R6",
      q: "Is it possible for an application to enjoy reliable data transfer even when the application runs over UDP? If so, how?",
      a: "Yes. The developer builds reliability into the application-layer protocol itself, adding acknowledgments, sequence numbers, timers and retransmission (the mechanisms of §3.4). Google's QUIC does this on top of UDP. It is nontrivial work, but it gives reliability without TCP's congestion-control rate constraints.",
      keys: ["yes", "application layer|in the application|app-layer", "acknowledg|ACK|retransmi|sequence", "QUIC"],
      why: "UDP itself stays unreliable; the reliability lives above it. That is how QUIC (used by Chrome, and underneath HTTP/3) works." },

    { id: "udp-28", d: 3, type: "short", src: "ch3-P25a",
      ctx: P25,
      q: "Why does an application have more control of what data is sent in a segment?",
      a: "With UDP, whatever the application passes in one send call is exactly what goes into one UDP segment: UDP encapsulates that message as-is, without splitting or merging it. With TCP, the application writes bytes into the connection's send buffer, and TCP decides how to carve the byte stream into segments (up to the MSS). One write may be split across several segments, or combined with other writes in one segment.",
      keys: ["send buffer|buffer", "byte stream|stream", "TCP decides|TCP grabs|MSS|split|combine", "one message|exactly what|as-is|one segment"],
      why: "UDP is message-oriented (one send = one segment); TCP is stream-oriented (the application controls bytes, not segment boundaries)." },

    { id: "udp-29", d: 3, type: "short", src: "ch3-P25b",
      ctx: P25,
      q: "Why does an application have more control of when the segment is sent?",
      a: "With UDP, the segment is passed to the network layer as soon as the application hands the data to UDP. With TCP, data waits in the send buffer until TCP releases it: congestion control and flow control can throttle or delay transmission, and TCP keeps retransmitting a segment until it is acknowledged, however long that takes.",
      keys: ["immediately|as soon as|right away", "congestion control|throttle", "flow control|receive window", "retransmi|acknowledg"],
      why: "Textbook: under UDP, “as soon as an application process passes data to UDP, UDP will package the data inside a UDP segment and immediately pass the segment to the network layer.” TCP's sender is throttled by congestion (and flow) control." },

    { id: "udp-30", d: 3, type: "mc", src: "text",
      q: "Suppose many users streamed high-bit-rate video over UDP with no congestion control. What does the textbook predict?",
      choices: [
        "Routers would automatically convert the UDP flows to TCP",
        "Router buffers overflow so badly that few UDP packets get through, and TCP senders cut their rates and are crowded out",
        "TCP flows would grab the bandwidth from the UDP flows, because TCP is more aggressive",
        "Nothing much, because UDP traffic is small compared to TCP traffic"
      ],
      a: 1,
      why: "With no congestion control, the network enters a congested state where little useful work is done: high loss between UDP senders and receivers, and TCP senders (which do back off under loss) are crowded out. That is why researchers propose forcing UDP sources to do adaptive congestion control too. TCP is the polite protocol here, not the aggressive one." },

    { id: "udp-31", d: 2, type: "order", src: "cheat",
      q: "Put the UDP sender's actions in order.",
      items: [
        "UDP is passed an application-layer message",
        "UDP determines the UDP segment header field values",
        "UDP creates the UDP segment",
        "UDP passes the segment to IP"
      ],
      why: "Message in → compute header fields (ports, length, checksum) → build segment → hand to IP. There is no handshake and no buffering step." },

    { id: "udp-32", d: 2, type: "order", src: "cheat",
      q: "Put the UDP receiver's actions in order.",
      items: [
        "UDP receives a segment from IP",
        "UDP checks the UDP checksum header value",
        "UDP extracts the application-layer message",
        "UDP demultiplexes the message up to the application via the socket"
      ],
      why: "The checksum is verified before anything is delivered (a failing segment is discarded). Then the message is extracted and demultiplexed by destination port to the socket." },

    { id: "udp-33", d: 2, type: "mc", src: "cheat",
      q: "A client's UDP socket on port 50123 sends a request to a server on UDP port 53, and the server replies from the same socket. What ports does the reply carry?",
      choices: ["Source 53, destination 50123", "Source 50123, destination 53", "Source 53, destination 53", "Source 50123, destination 50123"],
      a: 0,
      why: "Reply source port = the server's port (the request's destination port, 53). Reply destination port = the client's original source port (50123), which the server got from recvfrom()." },

    { id: "udp-34", d: 1, type: "mc", src: "cheat",
      q: "Where is the destination IP address of a UDP message stored?",
      choices: [
        "In both the UDP and IP headers",
        "In the IP header; the UDP header holds only the destination port",
        "In the UDP header, next to the destination port",
        "Nowhere; routers work it out from the port number"
      ],
      a: 1,
      why: "The UDP header has only ports, length and checksum. The destination IP address is a network-layer field in the IP header, which is what routers use." },

    { id: "udp-35", d: 3, type: "mc", src: "cheat",
      q: "The UDP header has no destination IP address field. How does the IP datagram end up with the right destination address?",
      choices: [
        "IP reads it from the UDP header's destination port",
        "The first router derives it from the destination port",
        "UDP stores it in the checksum field",
        "The application supplies the destination IP address in the send call (e.g. sendto); the OS passes it to IP alongside the UDP segment, and IP writes it into the IP header"
      ],
      a: 3,
      why: "sendto(message, (serverName, serverPort)) gives both: the port goes into the UDP header, and the IP address is handed down with the segment so IP can fill in the datagram's destination address field. Ports never determine IP addresses." },

    { id: "udp-36", d: 1, type: "mc", src: "cheat",
      q: "How does the UDP sender compute the checksum?",
      choices: [
        "It XORs all 32-bit words together",
        "It stores the two's complement of the segment length",
        "It adds all 16-bit words of the segment with one's-complement (wraparound) arithmetic and stores the one's complement of the sum",
        "It adds the bytes as plain binary, truncated to 16 bits, and stores the sum"
      ],
      a: 2,
      why: "Two essentials: (1) wraparound — a carry out of the top bit is added back into the lowest bit, never discarded; (2) the final result is complemented (all bits flipped) before being stored." },

    { id: "udp-37", d: 2, type: "mc", src: "text",
      ctx: TB,
      q: "What is the one's-complement sum of the three data words, before it is complemented?",
      choices: ["0100101011000001", "0100101011000010", "1011101110110101", "1011010100111101"],
      a: 1,
      why: "  0110011001100000\n+ 0101010101010101\n= 1011101110110101 (no carry)\n  1011101110110101\n+ 1000111100001100\n= 1 0100101011000001 (carry out)\nWraparound: 0100101011000001 + 1 = 0100101011000010.\nDistractors: 0100101011000001 drops the carry instead of wrapping it; 1011010100111101 is the checksum (after flipping); 1011101110110101 is only the sum of the first two words." },

    { id: "udp-38", d: 2, type: "short", src: "cheat",
      q: "Compute the UDP checksum of the two 16-bit words 1110011001100110 and 1101010101010101. Give the wrapped sum and the checksum.",
      a: "1110011001100110 + 1101010101010101 = 1 1011101110111011 (carry out). Wrap the carry around: 1011101110111011 + 1 = 1011101110111100 (the sum). Checksum = flip every bit = 0100010001000011.",
      keys: ["1011101110111100", "0100010001000011", "wrap|carry"],
      why: "Check: 1011101110111100 + 0100010001000011 = 1111111111111111, all 1s as required. Common mistakes: dropping the carry (sum 1011101110111011, checksum 0100010001000100) or forgetting to complement." },

    { id: "udp-39", d: 3, type: "mc", src: "cheat",
      ctx: HI,
      q: "What is the UDP checksum?",
      choices: ["0x48A5", "0xB75B", "0xB764", "0xB75A"],
      a: 3,
      why: "  0100101011010101 (0x4AD5)\n+ 1011010101011100 (0xB55C)\n= 1 0000000000110001 → wrap → 0000000000110010 (0x0032)\n+ 0000000000001010 (0x000A) = 0000000000111100 (0x003C)\n+ 0100100001101001 (0x4869) = 0100100010100101 (0x48A5) ← sum\nFlip all bits: 1011011101011010 = 0xB75A ← checksum.\nDistractors: 0x48A5 forgets the final flip; 0xB75B drops the first carry (sum 0x48A4); 0xB764 leaves the length field out of the sum. The header fields are part of the checksum too." },

    { id: "udp-40", d: 3, type: "mc", src: "cheat",
      ctx: TB,
      q: "The receiver gets all four words, but the first word arrives as 0110011001100001 (its last bit flipped from 0 to 1). What does the receiver's check produce, and what does it conclude?",
      choices: [
        "1111111111111110; an error is detected",
        "0000000000000000; no error is detected",
        "0000000000000001; not all 1s, so an error is detected",
        "1111111111111111; no error is detected"
      ],
      a: 2,
      why: "  0110011001100001 + 0101010101010101 = 1011101110110110\n+ 1000111100001100 = 1 0100101011000010 → wrap → 0100101011000011\n+ 1011010100111101 (checksum) = 1 0000000000000000 → wrap → 0000000000000001\nThe correct total would be 1111111111111111; the +1 error rolled it over to 0000000000000001. It contains 0s, so an error is detected and the segment is discarded." },

    { id: "udp-41", d: 2, type: "mc", src: "ch3-P3a",
      ctx: P3,
      q: "What is the 1s complement of the sum of these 8-bit bytes?",
      choices: ["11010001", "00101110", "11010010", "00101101"],
      a: 0,
      why: "  01010011\n+ 01100110\n= 10111001 (no carry)\n  10111001\n+ 01110100\n= 1 00101101 (carry out) → wrap: 00101101 + 1 = 00101110 ← sum\nFlip all bits → 11010001 ← answer.\nDistractors: 00101110 is the sum without the flip; 11010010 flips the dropped-carry sum 00101101; 00101101 is the dropped-carry sum." },

    { id: "udp-42", d: 3, type: "short", src: "ch3-P3b",
      ctx: P3,
      q: "Why is it that UDP takes the 1s complement of the sum; that is, why not just use the sum?",
      a: "Storing the complement makes the receiver's check trivial: the receiver adds all the words, including the checksum, and a correct segment always gives all 1s (a sum plus its own complement = 11…1). With the plain sum stored, the receiver would have to add the data words separately and then compare the result with the checksum field. The one's-complement (end-around carry) arithmetic also keeps every carry, so no overflow information is lost, and it is cheap to compute.",
      keys: ["add all|including the checksum|sum everything", "all 1s|all ones|11111111", "simple|easy|single check|no separate comparison|compare", "carry|wrap"],
      why: "Here: 00101110 + 11010001 = 11111111. The receiver needs no special-case logic: one more addition, then test for all 1s." },

    { id: "udp-43", d: 2, type: "short", src: "ch3-P3c",
      ctx: P3,
      q: "With the 1s complement scheme, how does the receiver detect errors?",
      a: "It adds all the received words, the three data bytes plus the checksum, using the same wraparound sum. If the result is all 1s (11111111), no error is detected. If any bit of the result is 0, an error has occurred, and the segment is discarded.",
      keys: ["add|sum", "including the checksum|checksum", "all 1s|all ones|11111111", "any 0|a zero|not all 1s"],
      why: "For P3 with no errors: 01010011 + 01100110 + 01110100 + 11010001 = 11111111 (with wraparound)." },

    { id: "udp-44", d: 2, type: "tf", src: "ch3-P3d",
      ctx: P3,
      q: "With the 1s complement scheme, a 1-bit error can go undetected.",
      a: false,
      why: "False. Flipping one bit changes one word by ±2^{k}. One's-complement sums are arithmetic modulo 2^{n} − 1 (255 for 8-bit words), and ±2^{k} is never 0 modulo that, so the total changes and the receiver no longer sees all 1s. Every single-bit error, even one in the checksum itself, is detected." },

    { id: "udp-45", d: 3, type: "tf", src: "ch3-P3e",
      ctx: P3,
      q: "With the 1s complement scheme, a 2-bit error can go undetected.",
      a: true,
      why: "True. Example: the last bit of the first byte flips 1 → 0 (01010011 → 01010010) and the last bit of the second byte flips 0 → 1 (01100110 → 01100111). The first byte drops by 1 and the second rises by 1, so 01010010 + 01100111 = 10111001, the same as before. The total, and therefore the check, is unchanged, and the corrupted segment is accepted." },

    { id: "udp-46", d: 2, type: "mc", src: "ch3-P4a",
      q: "Suppose you have the following 2 bytes: 01011100 and 01100101. What is the 1s complement of the sum of these 2 bytes?",
      choices: ["11000001", "10111110", "00111110", "00111111"],
      a: 2,
      why: "  01011100\n+ 01100101\n= 11000001 (no carry out, so nothing to wrap)\nFlip all bits → 00111110.\n11000001 is the sum without the flip." },

    { id: "udp-47", d: 2, type: "mc", src: "ch3-P4b",
      q: "Suppose you have the following 2 bytes: 11011010 and 01100101. What is the 1s complement of the sum of these 2 bytes?",
      choices: ["11000000", "10111111", "01000000", "00111111"],
      a: 1,
      why: "  11011010\n+ 01100101\n= 1 00111111 (carry out) → wrap: 00111111 + 1 = 01000000 ← sum\nFlip all bits → 10111111.\nDistractors: 01000000 is the sum without the flip; 11000000 flips the dropped-carry sum 00111111; 00111111 is the dropped-carry sum." },

    { id: "udp-48", d: 3, type: "mc", src: "ch3-P4c",
      ctx: "P4(a) bytes: 01011100 and 01100101 (sum 11000001, 1s complement 00111110).",
      q: "(c) Which pair shows one bit flipped in each of the 2 bytes such that the 1s complement of the sum does NOT change?",
      choices: ["01011101 and 01100100", "01011000 and 01100001", "01011110 and 01100111", "01011101 and 01100111"],
      a: 0,
      why: "Flip the last bit of each: byte 1 goes 0 → 1 (+1), byte 2 goes 1 → 0 (−1). Net change 0: 01011101 + 01100100 = 11000001, the same sum, so the checksum is still 00111110. This works at any bit position where one byte has a 0 and the other a 1 (bits 0, 3, 4 and 5 here). The other options flip bits that change the sum: 01011110 + 01100111 = 11000101; 01011101 + 01100111 = 11000100; 01011000 + 01100001 = 10111001." },

    { id: "udp-49", d: 3, type: "short", src: "ch3-P5",
      q: "Suppose the UDP receiver computes the Internet checksum for a received UDP segment and finds that it matches the value carried in the checksum field. Can the receiver be absolutely certain that no bit errors have occurred? Explain.",
      a: "No. The checksum is a sum, and some error patterns leave the sum unchanged. For example, if two words have a 0 and a 1 in the same bit position and both of those bits flip (0 → 1 and 1 → 0), the sum, and therefore the computed checksum, is the same, so the check passes even though the data is corrupted. A match only means that no error was detected.",
      keys: ["no|not certain|cannot be certain", "sum unchanged|same sum|cancel", "two bits|2-bit|opposite|0 and 1|both flip", "detect"],
      why: "See P3/P4(c): errors in the same bit position of two words in opposite directions cancel. The checksum is good at catching single-bit errors and many bursts, but it is not a proof of correctness." },

    { id: "udp-50", d: 2, type: "multi", src: "cheat",
      q: "Many link-layer protocols (e.g. Ethernet) already check for errors. Why does UDP still include a checksum? Select all that apply.",
      choices: [
        "Link-layer error checks are switched off whenever UDP is used",
        "End-to-end error detection covers the whole path, as the end-end principle argues",
        "Not every link on the path is guaranteed to use a link-layer protocol with error checking",
        "Bits can be corrupted while a segment sits in a router's memory, even if every link transfer was correct",
        "The UDP checksum lets UDP correct errors that the link layer can only detect"
      ],
      a: [1, 2, 3],
      why: "Link checks cover only individual links, and only on links that have them; errors inside routers (memory) are invisible to them. So error detection must be done end-to-end at the transport layer (end-end principle). Link checks aren't disabled by UDP, and the UDP checksum only detects errors, never corrects them." },

    { id: "udp-51", d: 1, type: "tf", src: "cheat",
      q: "The UDP checksum allows the receiver to correct bit errors in a segment.",
      a: false,
      why: "False. The checksum only detects errors; it cannot locate or fix them, and UDP doesn't recover (no retransmission). A segment that fails the check is discarded." },

    { id: "udp-52", d: 2, type: "mc", src: "cheat",
      q: "What does UDP do with a received segment whose checksum check fails?",
      choices: [
        "Corrects the flipped bits using the checksum",
        "Delivers it normally, because the checksum is only advisory",
        "Sends a NAK asking the sender to retransmit",
        "Discards it silently, with no NAK and no retransmission request (some implementations instead pass it up with a warning)"
      ],
      a: 3,
      why: "Lecture: UDP silently discards datagrams that fail checksum validation. Textbook: UDP doesn't recover from errors; some implementations discard the damaged segment, others pass it to the application with a warning. NAKs and retransmission belong to reliable protocols (rdt, TCP), not UDP." },

    { id: "udp-53", d: 3, type: "mc", src: "cheat",
      q: "An application calls sendto() with a message larger than the maximum UDP/IP size. What happens?",
      choices: [
        "The send operation fails; the application must divide the data into smaller messages itself",
        "UDP splits it into several UDP datagrams, and the receiver's UDP rejoins them",
        "UDP silently truncates the message to fit",
        "The OS automatically switches the transfer to TCP"
      ],
      a: 0,
      why: "UDP never divides an application message into several datagrams. Each accepted message goes into one datagram, and a message too large for that is rejected, so the application must split it." },

    { id: "udp-54", d: 3, type: "mc", src: "cheat",
      q: "A 3,000-byte UDP message is sent over a path whose MTU is 1500 bytes, and IPv4 fragmentation is allowed. Assuming all fragments arrive and the receive buffer is large enough, what does the receiving application get?",
      choices: [
        "Several UDP datagrams created by UDP, each under 1500 bytes",
        "One 3,000-byte message: IP fragments the datagram and reassembles it at the destination before UDP sees it",
        "Nothing: UDP refuses to send any message larger than the MTU",
        "Three messages of about 1,000 bytes, which the application must reassemble"
      ],
      a: 1,
      why: "The 3,028-byte IP datagram (3,000 + 8 + 20) exceeds the MTU, so IPv4 fragments it. Fragmentation and reassembly both happen at the IP layer; UDP only ever sees the complete datagram, and the application receives one message. (If any fragment is lost, the whole message is lost.)" },

    { id: "udp-55", d: 3, type: "mc", src: "cheat",
      q: "An application splits a large message into three smaller messages and sends each with UDP. What happens at the receiver?",
      choices: [
        "They are guaranteed to arrive in order, because they use the same socket",
        "UDP reassembles them into the original message",
        "They arrive as three separate UDP datagrams; the receiving application must recombine them and handle missing or out-of-order pieces",
        "IP reassembles them, because they came from one original message"
      ],
      a: 2,
      why: "To UDP and IP these are three independent messages: no sequence numbers link them, so nothing below the application can rejoin them. They can be lost or reordered (best-effort), and the application has to deal with that. Contrast udp-54, where IP's own fragments are reassembled by IP." },

    { id: "udp-56", d: 2, type: "mc", src: "cheat",
      q: "A developer picks UDP “because it is less complex than TCP.” According to the lecture, is that reasoning sufficient?",
      choices: [
        "Yes; simpler protocols are always faster and therefore better",
        "Yes, but only for file-transfer applications",
        "No; TCP must always be used on the Internet",
        "No; the developer must also check that UDP's delivery service meets the application's needs, or that the application will supply the missing functions"
      ],
      a: 3,
      why: "UDP and TCP differ in the service they offer. A simpler transport is only useful if its delivery service meets the application's needs, or if the application adds what's missing (e.g. its own reliability). File transfer actually needs TCP's reliability." }
  ]);
})();
