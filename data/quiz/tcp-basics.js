NET.addQuestions('tcp-basics', [
  // ---------- What a TCP connection is ----------
  { id: 'tcp-basics-01', d: 1, type: 'mc', src: 'cheat',
    q: 'Where is the state of a TCP connection (buffers, sequence-number variables) kept?',
    choices: ["In a connection table held by the destination’s ISP", "In every router along the path", "In the two end systems and in the first-hop (edge) routers", "Only in the two end systems"],
    a: 3,
    why: 'TCP runs only in end systems, so the connection is logical: buffers, state variables and sockets exist only at the two hosts. Routers and switches keep no TCP state and are oblivious to connections — they just forward IP datagrams. The edge-router and ISP options describe circuit-style reservations that TCP never makes.' },

  { id: 'tcp-basics-02', d: 1, type: 'tf', src: 'cheat',
    q: 'A single TCP connection can deliver data from one sender to several receivers in one send operation (multicast).',
    a: false,
    why: 'False. TCP is point-to-point: exactly one sender and one receiver per connection, and multicasting is not possible with TCP. It is full-duplex, though — both of the two endpoints can send at the same time.' },

  { id: 'tcp-basics-03', d: 1, type: 'mc', src: 'cheat',
    q: 'In TCP terminology, which process is the client?',
    choices: ["The process with the lower port number", "The process that initiates the connection", "The process that sends the most data", "The process that creates the listening socket"],
    a: 1,
    why: 'The process that initiates the connection (sends the SYN, e.g. via `clientSocket.connect(...)`) is the client; the other is the server. Port numbers and data volume do not define the roles, and the listening socket belongs to the server.' },

  { id: 'tcp-basics-04', d: 1, type: 'tf', src: 'cheat',
    q: 'From TCP’s perspective, the Internet delivers the data in a segment end-to-end without inspecting or modifying the data contents.',
    a: true,
    why: 'True. Routers look only at network-layer fields of the datagram; they neither read nor change the application data, and they do not even know TCP connections exist. All numbering, checking and reassembly of the byte stream happens in TCP at the end hosts.' },

  { id: 'tcp-basics-05', d: 2, type: 'multi', src: 'cheat',
    q: 'Which of the following are part of a TCP connection between hosts A and B? Select all that apply.',
    choices: ["A send buffer and a receive buffer at B", "A socket at each end connecting TCP to the process", "Bandwidth reserved on each link for the connection", "State variables such as sequence and acknowledgment numbers at both hosts", "A send buffer and a receive buffer at A", "A connection entry in every router on the path"],
    a: [0, 1, 3, 4],
    why: 'A TCP connection is buffers, variables and a socket connection to a process at each of the two hosts — and each side has its own send buffer and its own receive buffer because the connection is full-duplex. Nothing is allocated in routers, switches or repeaters, and no bandwidth is reserved: the connection is logical, not a circuit.' },

  { id: 'tcp-basics-06', d: 2, type: 'short', src: 'cheat',
    q: 'Why is a TCP connection described as “logical”, and what does it actually consist of?',
    a: 'It is not a circuit through the network: the connection state lives only in the TCPs of the two end systems, while the routers and switches in between keep no TCP state and see only IP datagrams. It consists of buffers (send and receive), state variables (sequence and ACK numbers etc.) and a socket to the process at each of the two hosts.',
    keys: ['only in the end systems|only in the two hosts|end hosts|end systems', 'routers keep no state|routers see only datagrams|routers unaware|routers are oblivious', 'buffers', 'variables|state', 'socket'],
    why: 'Contrast with circuit switching, where a TDM/FDM circuit is set up through every switch. TCP’s handshake initializes state only at the two hosts (both sides initialize their TCP state variables); the network just carries datagrams end-to-end.' },

  // ---------- TCP vs UDP ----------
  { id: 'tcp-basics-07', d: 2, type: 'multi', src: 'cheat',
    q: 'Which of the following does TCP provide to applications? Select all that apply.',
    choices: ["Built-in encryption of the data", "Congestion control", "Flow control", "A guaranteed minimum throughput", "A bound on end-to-end delay", "Reliable, in-order delivery of a byte stream"],
    a: [1, 2, 5],
    why: 'TCP provides reliable, connection-oriented delivery with flow control and congestion control (after connection setup). It gives no latency or throughput guarantee — the network layer cannot guarantee them, so the transport layer cannot either — and no built-in security (encryption is added above TCP, e.g. with TLS).' },

  { id: 'tcp-basics-08', d: 2, type: 'mc', src: 'cheat',
    q: 'Which statement correctly distinguishes TCP from UDP?',
    choices: ["TCP guarantees a minimum throughput and reliable delivery, while UDP guarantees neither", "TCP provides built-in encryption and integrity checking, while UDP provides only a checksum", "Neither guarantees delay or minimum bandwidth, but only TCP requires connection setup and provides reliability, flow control and congestion control", "UDP provides flow control but not congestion control, while TCP provides both of them"],
    a: 2,
    why: 'TCP: reliable, connection-oriented, flow and congestion control, setup before data, no latency/throughput guarantee, no built-in security. UDP: best-effort, connectionless, no reliability, no flow or congestion control, no setup, no latency/bandwidth guarantee, no built-in security. The other options each invent a service one of them does not have.' },

  // ---------- Three-way handshake ----------
  { id: 'tcp-basics-09', d: 1, type: 'order', src: 'cheat',
    q: 'Put the steps of TCP connection establishment in order.',
    items: ['Client sends a SYN segment: SYN = 1, seq = client_isn, no data', 'Server allocates buffers and variables and sends a SYNACK: SYN = 1, seq = server_isn, ack = client_isn + 1', 'Client allocates buffers and variables and sends an ACK: SYN = 0, ack = server_isn + 1, possibly carrying data', 'Both sides exchange data segments with SYN = 0'],
    why: 'Client initiates with SYN → server grants the connection with a SYNACK (allocating its resources when the SYN arrives) → client acknowledges with SYN = 0 (allocating its resources when the SYNACK arrives); only this third segment may carry data. Afterwards every segment has SYN = 0.' },

  { id: 'tcp-basics-10', d: 1, type: 'mc', src: 'text',
    q: 'Which flag bit is set to 1 in the first segment a client sends to open a TCP connection?',
    choices: ["SYN", "ACK", "FIN", "PSH", "RST"],
    a: 0,
    why: 'The first handshake segment is the SYN segment: SYN = 1, no data, seq = client_isn. The SYNACK has both SYN and ACK set. FIN closes a connection, RST answers a segment for which no socket exists, and PSH asks the receiver to pass data up immediately.' },

  { id: 'tcp-basics-11', d: 1, type: 'tf', src: 'cheat',
    q: 'In the TCP three-way handshake, the third segment (the client’s ACK of the SYNACK) may carry application data.',
    a: true,
    why: 'True. The SYN and SYNACK carry no application data; the third segment may carry client-to-server data. That is why an HTTP request can ride on the third handshake segment, so non-persistent HTTP costs 2 RTTs per object.' },

  { id: 'tcp-basics-12', d: 2, type: 'num', src: 'text',
    ctx: 'A client opens a TCP connection with client_isn = 2,345; the server picks server_isn = 8,800.',
    q: 'What value is in the acknowledgment field of the server’s SYNACK segment?',
    a: 2346, unit: '',
    why: 'SYNACK: SYN = 1, seq = server_isn = 8,800, ack = client_isn + 1 = 2,346. The SYN used up one sequence number, so the server now expects byte 2,346 from the client. (8,801 is what the client will put in its ACK.)' },

  { id: 'tcp-basics-13', d: 3, type: 'mc', src: 'text',
    ctx: 'A client opens a TCP connection with client_isn = 2,345; the server picks server_isn = 8,800.',
    q: 'Which values does the client put in the third handshake segment?',
    choices: ["SYN = 0, seq = 2,345, ack = 8,800", "SYN = 1, seq = 2,346, ack = 8,801", "SYN = 0, seq = 2,346, ack = 8,801", "SYN = 0, seq = 8,801, ack = 2,346"],
    a: 2,
    why: 'The connection is now established, so SYN = 0. Its seq is client_isn + 1 = 2,346 (the SYN used up 2,345), and it acknowledges the SYNACK with ack = server_isn + 1 = 8,801. Keeping SYN = 1 is wrong (only the first two segments set it); seq 2,345 / ack 8,800 forgets that SYN and SYNACK each consume a sequence number; seq 8,801 / ack 2,346 swaps the client’s and server’s numbers.' },

  { id: 'tcp-basics-14', d: 3, type: 'num', src: 'text',
    ctx: 'A client opens a TCP connection with client_isn = 2,345; the server picks server_isn = 8,800.',
    q: 'The client’s third handshake segment carries 100 bytes of data. What is the sequence number of the client’s next data segment?',
    a: 2446, unit: '',
    why: 'The third segment has seq = client_isn + 1 = 2,346 and carries bytes 2,346–2,445. The next segment starts right after: 2,346 + 100 = 2,446. (Had the third segment been a pure ACK with no data, the next data segment would start at 2,346.)' },

  // ---------- Buffers, MSS, MTU ----------
  { id: 'tcp-basics-15', d: 1, type: 'mc', src: 'cheat',
    q: 'TCP’s MSS is derived from the link-layer MTU. What is the MTU of Ethernet?',
    choices: ["65,535 bytes", "576 bytes", "1,500 bytes", "1,460 bytes"],
    a: 2,
    why: 'Ethernet (and PPP) have an MTU of 1,500 bytes. 1,460 bytes is the resulting MSS (1,500 − 40 bytes of TCP/IP headers) — the classic MTU/MSS mix-up. The other two values are not Ethernet’s MTU.' },

  { id: 'tcp-basics-16', d: 2, type: 'num', src: 'cheat',
    q: 'A host’s link has an MTU of 1,500 bytes, and the TCP and IP headers are 20 bytes each (no options). What MSS should TCP use? Answer in bytes.',
    a: 1460, unit: 'bytes',
    why: 'The MSS is the largest amount of application data such that segment + TCP/IP headers fit in one frame: 1,500 − (20 + 20) = 1,460 bytes. Answering 1,500 confuses the MSS with the MTU; 1,480 forgets the TCP header.' },

  { id: 'tcp-basics-17', d: 2, type: 'tf', src: 'text',
    q: 'The MSS is the maximum size of a TCP segment including its TCP header.',
    a: false,
    why: 'False. The MSS is the maximum amount of application-layer data in a segment, not counting headers (a confusing but entrenched name). With Ethernet: MTU 1,500 − 40 bytes of TCP/IP headers = MSS 1,460 bytes of data.' },

  { id: 'tcp-basics-18', d: 2, type: 'order', src: 'cheat',
    q: 'Order the path of application data through TCP, from the sending process to the receiving process.',
    items: ['Sending process writes data into its socket', 'TCP places the data in the connection’s send buffer', 'TCP takes up to MSS bytes and adds a TCP header to form a segment', 'IP encapsulates the segment in a datagram and sends it into the network', 'Receiving TCP places the segment’s data in the receive buffer', 'Receiving process reads the byte stream from the receive buffer'],
    why: 'Socket → send buffer (set aside during the handshake) → segment with at most MSS bytes of data plus a header → IP datagram → receiver’s receive buffer → application reads. TCP grabs data from the send buffer “at its own convenience”; the application reads the receive buffer whenever it wants. Each side has its own pair of buffers.' },

  // ---------- Segment structure ----------
  { id: 'tcp-basics-19', d: 1, type: 'mc', src: 'text',
    q: 'How long is a typical TCP header (no options)?',
    choices: ["8 bytes", "40 bytes", "20 bytes", "60 bytes"],
    a: 2,
    why: '20 bytes — 12 bytes more than UDP’s 8-byte header. 40 bytes is the TCP and IP headers together (the amount subtracted from the MTU to get the MSS), and 60 bytes is the largest possible TCP header (header length field = 15 words).' },

  { id: 'tcp-basics-20', d: 2, type: 'num', src: 'text',
    q: 'A TCP header’s 4-bit header-length field contains 7. How long is the TCP header? Answer in bytes.',
    a: 28, unit: 'bytes',
    why: 'The header-length field counts 32-bit words (4 bytes each): 7 × 4 = 28 bytes — the 20-byte fixed header plus 8 bytes of options. A value of 5 is the typical 20-byte header with an empty options field.' },

  { id: 'tcp-basics-21', d: 2, type: 'multi', src: 'text',
    q: 'Which TCP flag bits are used for connection setup and teardown? Select all that apply.',
    choices: ["FIN", "URG", "PSH", "RST", "SYN", "ECE"],
    a: [0, 3, 4],
    why: 'SYN (open), FIN (close) and RST (reset: “I have no socket for that segment”) handle connection management. PSH asks the receiver to pass data up immediately and URG marks urgent data (both essentially unused in practice); ECE and CWR are for explicit congestion notification.' },

  { id: 'tcp-basics-22', d: 1, type: 'tf', src: 'ch3-R14e',
    q: 'The TCP segment has a field in its header for rwnd.',
    a: true,
    why: 'True. The 16-bit receive window field carries rwnd, the number of bytes the receiver is willing to accept; it is how TCP’s flow control tells the sender how much free buffer space the receiver has.' },

  // ---------- Sequence numbers ----------
  { id: 'tcp-basics-23', d: 1, type: 'tf', src: 'cheat',
    q: 'TCP numbers its segments 0, 1, 2, … so the receiver can put them back in order.',
    a: false,
    why: 'False. TCP numbers bytes, not segments. It treats data as an unstructured but ordered byte stream, and a segment’s sequence number is the byte-stream number of its first data byte (e.g. 0, 1,000, 2,000, … for 1,000-byte segments).' },

  { id: 'tcp-basics-24', d: 1, type: 'tf', src: 'cheat',
    q: 'Every TCP connection starts its sequence numbers at 0.',
    a: false,
    why: 'False. Each side randomly chooses its initial sequence number (client_isn, server_isn). Textbook figures that start at 0 do so only for simplicity.' },

  { id: 'tcp-basics-25', d: 2, type: 'mc', src: 'cheat',
    q: 'Why does each side of a TCP connection choose its initial sequence number randomly?',
    choices: ["To make it unlikely that a delayed segment from an earlier connection between the same hosts and ports is accepted as valid", "So the receiver can use the sequence number field to detect bit errors in the segment header", "Because every connection on the Internet must use globally unique sequence numbers for its bytes", "To spread the segments of different connections evenly across the router queues on the path"],
    a: 0,
    why: 'A segment still wandering in the network from an already-terminated connection (same two hosts, same port numbers) could otherwise fall inside the new connection’s sequence space and be mistaken for valid data. Random ISNs make that unlikely and also harden TCP against some attacks. Routers ignore sequence numbers, the checksum handles bit errors, and there is no global uniqueness requirement.' },

  { id: 'tcp-basics-26', d: 3, type: 'short', src: 'cheat',
    q: 'Suppose every TCP connection started its sequence numbers at 0. Describe a concrete way this could corrupt data, and explain how random initial sequence numbers help.',
    a: 'A connection between the same two hosts and ports is closed and quickly reopened. A delayed segment from the old connection (say seq 1,000) still in the network arrives and falls inside the new connection’s expected range, so the receiver accepts stale bytes as new data. With randomly chosen ISNs the new connection’s sequence space is very unlikely to overlap the old one, so the stale segment is rejected.',
    keys: ['old connection|earlier connection|previous connection', 'delayed segment|still in the network|stale', 'same hosts and ports|same port numbers|same ports', 'mistaken for valid|accepted as new data|accepted as valid', 'random|unlikely to overlap'],
    why: 'This is the textbook’s reason. Random ISNs are also hard to guess, which makes the handshake work as a weak source-address check (Problem P57b).' },

  { id: 'tcp-basics-27', d: 2, type: 'tf', src: 'ch3-R14d',
    q: 'Host A is sending a large file to Host B over a TCP connection. If the sequence number for a segment of this connection is m, then the sequence number for the subsequent segment will necessarily be m + 1.',
    a: false,
    why: 'False. Sequence numbers count bytes. The next segment’s sequence number is m + (number of data bytes in segment m) — e.g. with 1,000-byte segments, 0 is followed by 1,000. It would be m + 1 only if the segment carried exactly one byte.' },

  { id: 'tcp-basics-28', d: 3, type: 'mc', src: 'cheat',
    q: 'Host A has sent all its data up through byte 499. It now sends B a pure acknowledgment (no data) with seq = 500 and ack = 900. A moment later A’s application writes 100 new bytes. What sequence number does the segment carrying them have?',
    choices: ["501", "600", "500", "900"],
    a: 2,
    why: 'A pure ACK carries no data, so it uses no sequence numbers: byte 500 is still the next byte to send. This is exactly the Telnet case — the client’s pure ACK has Seq 43 and its next data segment also has Seq 43. 501 would be right only if the empty segment consumed a number (only SYN and FIN do); 900 is the ACK number, which refers to B’s byte stream.' },

  { id: 'tcp-basics-29', d: 3, type: 'num', src: 'cheat',
    q: 'Right after the handshake, a client sends a 6,000-byte file. Its ISN was 1,000 (so the first data byte is 1,001) and the MSS is 1,460 bytes. When the server has received the whole file, what acknowledgment number does it send?',
    a: 7001, unit: '',
    why: 'Segments: seq 1,001 (1,460 B), 2,461 (1,460 B), 3,921 (1,460 B), 5,381 (1,460 B), 6,841 (160 B) — five segments, 4 × 1,460 + 160 = 6,000 bytes. The last byte is 1,001 + 6,000 − 1 = 7,000, so the next expected byte is 7,001. Common slips: 7,000 (last byte instead of next byte) or 6,001 (forgetting the ISN offset).' },

  { id: 'tcp-basics-30', d: 2, type: 'num', src: 'ch3-P26a',
    ctx: 'Consider transferring an enormous file of L bytes from Host A to Host B. Assume an MSS of 536 bytes.',
    q: 'What is the maximum value of L such that TCP sequence numbers are not exhausted? Recall that the TCP sequence number field has 4 bytes. Answer in bytes.',
    a: 4294967296, unit: 'bytes',
    why: 'A 4-byte (32-bit) sequence number field can number 2^{32} = 4,294,967,296 distinct bytes, so L ≤ 2^{32} bytes ≈ 4.29 GB (4 GiB). The MSS does not matter here: sequence numbers count bytes, not segments.' },

  { id: 'tcp-basics-31', d: 3, type: 'num', src: 'ch3-P26b',
    ctx: 'Consider transferring an enormous file of L bytes from Host A to Host B. Assume an MSS of 536 bytes.',
    q: 'For the L you obtained in (a), find how long it takes to transmit the file. Assume that a total of 66 bytes of transport, network, and data-link header are added to each segment before the resulting packet is sent out over a 155 Mbps link. Ignore flow control and congestion control so A can pump out the segments back to back and continuously. Answer in seconds.',
    a: 248.97, unit: 's', tol: 0.01,
    why: 'Number of segments = ⌈2^{32} / 536⌉ = ⌈8,012,998.69⌉ = 8,012,999.\nHeader bytes = 66 × 8,012,999 = 528,857,934 bytes.\nTotal = 4,294,967,296 + 528,857,934 = 4,823,825,230 bytes = 38,590,601,840 bits.\nTime = 38,590,601,840 / (155 × 10^{6} bit/s) ≈ 249 s (about 4.15 minutes).\nTraps: forgetting × 8 (bytes → bits) gives about 31 s; forgetting the headers gives about 222 s.' },

  // ---------- ACK numbers ----------
  { id: 'tcp-basics-32', d: 1, type: 'mc', src: 'cheat',
    q: 'What does the acknowledgment number in a TCP segment from Host A to Host B mean?',
    choices: ["The number of bytes A has received from B so far", "The sequence number of the next byte A expects to receive from B", "The sequence number of the last byte A has received from B", "The sequence number of the segment from B that is being acknowledged"],
    a: 1,
    why: 'The ACK number is the next byte expected. If A has received B’s bytes 0–535, it sends ACK 536, not 535 (“last byte received” is the off-by-one trap). It is not a byte count (ISNs are random), and it does not name a segment — TCP ACKs are cumulative over bytes.' },

  { id: 'tcp-basics-33', d: 2, type: 'num', src: 'cheat',
    q: 'Host A has received from Host B bytes 0 through 1,199 and bytes 2,000 through 2,499, but nothing in between. What acknowledgment number does A put in its next segment to B?',
    a: 1200, unit: '',
    why: 'ACK = next byte expected = the first missing byte, 1,200. TCP ACKs are cumulative, so bytes 2,000–2,499 (out of order) cannot be acknowledged until the gap 1,200–1,999 is filled. 2,500 is “highest byte” thinking; 1,199 is the off-by-one trap.' },

  { id: 'tcp-basics-34', d: 2, type: 'mc', src: 'cheat',
    q: 'What do the TCP RFCs require a receiver to do with a correctly received but out-of-order segment?',
    choices: ["Nothing specific — discarding or buffering is left to the implementor; buffering is used in practice", "It must discard the segment, exactly like a Go-Back-N receiver", "It must send a NAK for the missing bytes", "It must buffer the segment and send a selective ACK for it"],
    a: 0,
    why: 'The RFCs impose no rule. Either choice is allowed: discard (simpler receiver) or keep the out-of-order bytes and wait for the gap to fill (more efficient in network bandwidth, the approach taken in practice). TCP has no NAKs; a receiver that sees a gap sends a duplicate cumulative ACK. Selective ACKs exist only as the optional SACK extension.' },

  { id: 'tcp-basics-35', d: 1, type: 'tf', src: 'cheat',
    q: 'A TCP segment can carry data from A to B and, in the same segment, acknowledge data that A received from B.',
    a: true,
    why: 'True. This is piggybacking: the ACK rides on a data segment going the other way. In the Telnet example the server’s echo of ‘C’ (Seq 79, ACK 43) both carries data and acknowledges the client’s byte 42.' },

  { id: 'tcp-basics-36', d: 2, type: 'tf', src: 'ch3-R14a',
    q: 'Host A is sending Host B a large file over a TCP connection. Assume Host B has no data to send Host A. Host B will not send acknowledgments to Host A because Host B cannot piggyback the acknowledgments on data.',
    a: false,
    why: 'False. Piggybacking is optional. B sends ACK segments with an empty data field (like the third Telnet segment, Seq 43 / ACK 80, which carries no data). Without these ACKs, A would time out and retransmit.' },

  { id: 'tcp-basics-37', d: 2, type: 'tf', src: 'ch3-R14g',
    q: 'Suppose Host A sends one segment with sequence number 38 and 4 bytes of data over a TCP connection to Host B. In this same segment, the acknowledgment number is necessarily 42.',
    a: false,
    why: 'False. The ACK number in A’s segment refers to the B → A byte stream: it is the next byte A expects from B, which has nothing to do with A’s own seq 38. 42 (= 38 + 4) is the value B would put in its acknowledgment back to A.' },

  { id: 'tcp-basics-38', d: 3, type: 'mc', src: 'cheat',
    q: 'In the middle of a connection, Host A sends B a segment with seq = 1,200, 100 bytes of data, and ack = 5,000. Which statement is correct?',
    choices: ["A has received all of B’s bytes up through 4,999, and this segment carries A’s bytes 1,200–1,299", "B has received all of A’s bytes up through 4,999", "A has received all of B’s bytes up through 5,000, and this segment carries A’s bytes 1,201–1,300", "B will answer with ack = 5,100"],
    a: 0,
    why: 'Full-duplex: each direction has its own byte stream and each host tracks both. The seq field (1,200) numbers A’s data in this segment: bytes 1,200–1,299. The ack field (5,000) is the next byte A expects from B, so A has B’s bytes through 4,999. When B gets this segment it acknowledges with 1,300, not 5,100.' },

  { id: 'tcp-basics-39', d: 1, type: 'num', src: 'ch3-R15a',
    ctx: 'Host A sends two TCP segments back to back to Host B over a TCP connection. The first segment has sequence number 90; the second has sequence number 110.',
    q: 'How much data is in the first segment? Answer in bytes.',
    a: 20, unit: 'bytes',
    why: 'Sequence numbers number bytes, and the second segment starts right after the first: 110 − 90 = 20 bytes (bytes 90–109).' },

  { id: 'tcp-basics-40', d: 2, type: 'num', src: 'ch3-R15b',
    ctx: 'Host A sends two TCP segments back to back to Host B over a TCP connection. The first segment has sequence number 90; the second has sequence number 110.',
    q: 'Suppose that the first segment is lost but the second segment arrives at B. In the acknowledgment that Host B sends to Host A, what will be the acknowledgment number?',
    a: 90, unit: '',
    why: 'B is still waiting for byte 90, the first missing byte, so it sends ACK 90. Cumulative ACKs cannot acknowledge the out-of-order bytes from 110 on; B may buffer them, but its ACK stays at 90 until the gap is filled. Answering 110 or anything higher acknowledges bytes B does not have in order.' },

  { id: 'tcp-basics-41', d: 3, type: 'num', src: 'cheat',
    ctx: 'B has received all of A’s bytes up through 1,999. A then sends three segments: seq 2,000 (1,000 bytes), seq 3,000 (1,000 bytes) and seq 4,000 (500 bytes). The segment with seq 2,000 is lost; the other two arrive. Later A’s timer expires and A retransmits seq 2,000, which arrives.',
    q: 'Assume B buffers out-of-order segments. What acknowledgment number does B send when the retransmitted seq 2,000 arrives?',
    a: 4500, unit: '',
    why: 'While byte 2,000 was missing, B answered each out-of-order arrival with a duplicate ACK 2,000. Once the retransmission fills the gap, B holds bytes 2,000–4,499 in order (2,000 + 1,000 + 1,000 + 500 = 4,500), so it sends one cumulative ACK 4,500. A never needs to resend seq 3,000 or 4,000.' },

  { id: 'tcp-basics-42', d: 3, type: 'mc', src: 'cheat',
    ctx: 'B has received all of A’s bytes up through 1,999. A then sends three segments: seq 2,000 (1,000 bytes), seq 3,000 (1,000 bytes) and seq 4,000 (500 bytes). The segment with seq 2,000 is lost; the other two arrive. Later A’s timer expires and A retransmits seq 2,000, which arrives.',
    q: 'Now assume instead that B discards out-of-order segments (the RFCs allow this). What does B send when the retransmitted seq 2,000 arrives, and what must A still do?',
    choices: ["ACK 3,000; A must still resend the segments starting at 3,000 and 4,000", "ACK 3,000; nothing more is needed because ACKs are cumulative", "ACK 4,500; nothing more is needed", "ACK 2,000; A must resend all three segments"],
    a: 0,
    why: 'B threw away bytes 3,000–4,499, so after the retransmission it holds only 2,000–2,999 in order and ACKs 3,000; A must resend the other two segments. This is why buffering is more efficient in network bandwidth and is used in practice. A cumulative ACK cannot cover bytes the receiver no longer has.' },

  // ---------- Telnet ----------
  { id: 'tcp-basics-43', d: 2, type: 'short', src: 'ch3-R16',
    ctx: 'Telnet example (Figure 3.31): the client’s and server’s starting sequence numbers are 42 and 79. After the user types ‘C’, three segments are exchanged: Seq 42 / ACK 79 carrying ‘C’; Seq 79 / ACK 43 carrying the echoed ‘C’; Seq 43 / ACK 80 with no data.',
    q: 'A few seconds after typing ‘C’, the user types the letter ‘R’. After typing ‘R’, how many segments are sent, and what is put in the sequence number and acknowledgment fields of the segments?',
    a: 'Three segments. Client → server: seq = 43, ack = 80, data ‘R’. Server → client (echo): seq = 80, ack = 44, data ‘R’. Client → server (pure ACK): seq = 44, ack = 81.',
    keys: ['three segments|3 segments', 'seq 43, ack 80|seq = 43|seq=43', 'seq 80, ack 44|ack = 44|ack=44', 'seq 44, ack 81|ack = 81|ack=81'],
    why: 'After the ‘C’ exchange the client’s next byte is 43 (its pure ACK with Seq 43 used no sequence number) and it expects server byte 80; the server’s next byte is 80 and it expects client byte 43. Typing ‘R’ repeats the pattern: the client sends byte 43 (‘R’) with ACK 80; the server ACKs it with 44 and echoes ‘R’ as its byte 80 (piggybacked ACK); the client ACKs the echo with 81 in a data-less segment whose seq is 44.' },

  // ---------- Problem P27 ----------
  { id: 'tcp-basics-44', d: 3, type: 'mc', src: 'ch3-P27a',
    ctx: 'Host A and B are communicating over a TCP connection, and Host B has already received from A all bytes up through byte 126. Suppose Host A then sends two segments to Host B back-to-back. The first and second segments contain 80 and 40 bytes of data, respectively. In the first segment, the sequence number is 127, the source port number is 302, and the destination port number is 80. Host B sends an acknowledgment whenever it receives a segment from Host A.',
    q: 'In the second segment sent from Host A to B, what are the sequence number, source port number, and destination port number?',
    choices: ["seq 207, source port 80, destination port 302", "seq 167, source port 302, destination port 80", "seq 207, source port 302, destination port 80", "seq 128, source port 302, destination port 80"],
    a: 2,
    why: 'The first segment carries bytes 127–206 (80 bytes), so the second starts at 127 + 80 = 207. It travels in the same direction on the same connection, so the ports are unchanged: source 302, destination 80. 128 treats sequence numbers as per-segment; 167 adds the second segment’s length (40) instead of the first’s; swapped ports belong to B → A segments.' },

  { id: 'tcp-basics-45', d: 3, type: 'mc', src: 'ch3-P27b',
    ctx: 'Host A and B are communicating over a TCP connection, and Host B has already received from A all bytes up through byte 126. Suppose Host A then sends two segments to Host B back-to-back. The first and second segments contain 80 and 40 bytes of data, respectively. In the first segment, the sequence number is 127, the source port number is 302, and the destination port number is 80. Host B sends an acknowledgment whenever it receives a segment from Host A.',
    q: 'If the first segment arrives before the second segment, in the acknowledgment of the first arriving segment, what is the acknowledgment number, the source port number, and the destination port number?',
    choices: ["ack 206, source port 80, destination port 302", "ack 207, source port 80, destination port 302", "ack 207, source port 302, destination port 80", "ack 247, source port 80, destination port 302"],
    a: 1,
    why: 'After bytes 127–206 arrive, B expects byte 207 → ACK 207 (206 is the last byte received, the off-by-one trap). The ACK travels from B to A, so the ports swap: source 80, destination 302. 247 would be the ACK after both segments.' },

  { id: 'tcp-basics-46', d: 3, type: 'num', src: 'ch3-P27c',
    ctx: 'Host A and B are communicating over a TCP connection, and Host B has already received from A all bytes up through byte 126. Suppose Host A then sends two segments to Host B back-to-back. The first and second segments contain 80 and 40 bytes of data, respectively. In the first segment, the sequence number is 127, the source port number is 302, and the destination port number is 80. Host B sends an acknowledgment whenever it receives a segment from Host A.',
    q: 'If the second segment arrives before the first segment, in the acknowledgment of the first arriving segment, what is the acknowledgment number?',
    a: 127, unit: '',
    why: 'The second segment (bytes 207–246) arrives out of order. B still has only bytes through 126, so the first missing byte is 127 and B sends ACK 127 — a duplicate of its earlier ACK. Cumulative ACKs cannot acknowledge 207–246 yet (B may buffer them). When segment 127 finally arrives, a buffering B jumps straight to ACK 247.' },

  { id: 'tcp-basics-47', d: 3, type: 'short', src: 'ch3-P27d',
    ctx: 'Host A and B are communicating over a TCP connection, and Host B has already received from A all bytes up through byte 126. Suppose Host A then sends two segments to Host B back-to-back. The first and second segments contain 80 and 40 bytes of data, respectively. In the first segment, the sequence number is 127, the source port number is 302, and the destination port number is 80. Host B sends an acknowledgment whenever it receives a segment from Host A.',
    q: 'Suppose the two segments sent by A arrive in order at B. The first acknowledgment is lost and the second acknowledgment arrives after the first timeout interval. Describe the timing diagram: every segment (sequence number and bytes of data) and every acknowledgment (ACK number), assuming no additional packet loss.',
    a: 'A sends seq 127 (80 bytes) and seq 207 (40 bytes). B replies ACK 207 (lost) and ACK 247. A’s timer for seq 127 expires before ACK 247 arrives, so A retransmits seq 127 (80 bytes) only. ACK 247 then arrives and covers both segments, so seq 207 is never resent. B discards the duplicate bytes 127–206 and sends ACK 247 again.',
    keys: ['seq 127 80 bytes|127 (80|seq 127', 'seq 207 40 bytes|207 (40|seq 207', 'ACK 207 lost', 'ACK 247', 'retransmit seq 127|retransmits 127|resend 127|resends 127', 'only the oldest|207 is not resent|not retransmit 207'],
    why: 'Timeline:\nA → B: seq 127, 80 bytes; seq 207, 40 bytes.\nB → A: ACK 207 (lost); ACK 247 (delayed).\nTimeout at A → retransmit only the oldest unACKed segment: seq 127, 80 bytes; restart the timer.\nACK 247 arrives → cumulative, SendBase = 247, seq 207 is never retransmitted.\nThe duplicate seq 127 reaches B, which discards it and re-sends ACK 247.\nThis combines the premature-timeout rule (only the oldest segment is resent) with cumulative ACKs.' },

  { id: 'tcp-basics-48', d: 3, type: 'num', src: 'ch3-P27d',
    ctx: 'Host A and B are communicating over a TCP connection, and Host B has already received from A all bytes up through byte 126. Suppose Host A then sends two segments to Host B back-to-back. The first and second segments contain 80 and 40 bytes of data, respectively. In the first segment, the sequence number is 127, the source port number is 302, and the destination port number is 80. Host B sends an acknowledgment whenever it receives a segment from Host A.',
    q: 'In the part (d) scenario (both segments arrive, the first ACK is lost, the second ACK arrives after A’s timeout), what acknowledgment number does B send when the retransmitted segment arrives?',
    a: 247, unit: '',
    why: 'By then B has every byte through 246 (both original segments arrived). The retransmitted segment (bytes 127–206) is a duplicate, so B discards it and re-acknowledges with the next expected byte, 247 — not 207, because ACKs are cumulative.' },

  // ---------- Problem P57 ----------
  { id: 'tcp-basics-49', d: 2, type: 'short', src: 'ch3-P57a',
    ctx: 'In this problem, we investigate whether either UDP or TCP provides a degree of end-point authentication.',
    q: 'Consider a server that receives a request within a UDP packet and responds to that request within a UDP packet (for example, as done by a DNS server). If a client with IP address X spoofs its address with address Y, where will the server send its response?',
    a: 'To Y, the spoofed source address. UDP has no handshake, so the server simply replies to whatever source address is in the request; the real client at X never sees the response and the server cannot tell the request did not come from Y.',
    keys: ['to Y|address Y', 'source address|spoofed', 'no handshake|connectionless|no verification'],
    why: 'UDP is connectionless: nothing in the exchange checks that the source address is genuine, so the reply goes to Y (who may be the victim of reflected traffic). Contrast with TCP’s handshake in part (b), where the random server_isn has to be echoed back.' },

  { id: 'tcp-basics-50', d: 3, type: 'short', src: 'ch3-P57b',
    ctx: 'In this problem, we investigate whether either UDP or TCP provides a degree of end-point authentication.',
    q: 'Suppose a server receives a SYN with IP source address Y, and after responding with a SYNACK, receives an ACK with IP source address Y with the correct acknowledgment number. Assuming the server chooses a random initial sequence number and there is no “man-in-the-middle”, can the server be certain that the client is indeed at Y (and not at some other address X that is spoofing Y)?',
    a: 'Yes (with very high probability). The SYNACK carrying the random server_isn was sent to Y, so only a host at Y saw it. The ACK must carry server_isn + 1; a spoofer at X never received the SYNACK and would have to guess a random 32-bit number. So a correct ACK shows the client really is at Y.',
    keys: ['yes', 'SYNACK sent to Y|only Y receives|only Y sees', 'server_isn + 1|correct acknowledgment number|ack number', 'random|guess|cannot guess'],
    why: 'This is a second reason random ISNs matter: the handshake works as a return-address check. If ISNs were predictable (always 0, say), the attacker at X could forge the ACK without ever seeing the SYNACK. A man-in-the-middle who can read the SYNACK breaks the argument, which is why the problem rules it out.' },

  // ---------- Problem P43 (send buffer) ----------
  { id: 'tcp-basics-51', d: 3, type: 'short', src: 'ch3-P43',
    q: 'Host A is sending an enormous file to Host B over a TCP connection. Over this connection there is never any packet loss and the timers never expire. The link connecting Host A to the Internet has rate R bps. The process in Host A can send data into its TCP socket at S bps, where S = 10 · R. The TCP receive buffer is large enough to hold the entire file, and the send buffer can hold only one percent of the file. What would prevent the process in Host A from continuously passing data to its TCP socket at rate S bps? TCP flow control? TCP congestion control? Or something else? Elaborate.',
    a: 'Something else: the send buffer. Flow control never throttles A, because B’s receive buffer can hold the whole file; congestion control never throttles A, because there is no loss and no timer expires. But TCP can drain the send buffer only at the link rate R, ten times slower than S, so the small send buffer (1% of the file) fills up quickly. Once it is full, the process can pass data into the socket only as fast as TCP sends it out — on average R, not S.',
    keys: ['send buffer', 'fills up|becomes full|full', 'link rate R|rate R|drained at R', 'not flow control|receive buffer holds the whole file', 'not congestion control|no loss'],
    why: 'Recall the data path: process → socket → TCP send buffer → segments onto the link at rate R. Flow control protects the receive buffer (not an issue here) and congestion control reacts to loss (none here). The bottleneck is local: data enters the send buffer at S = 10R but leaves at only R, so after the buffer fills the socket write blocks and the process’s average rate drops to R.' }
]);
