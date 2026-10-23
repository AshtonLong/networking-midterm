NET.addSection({
  id: 'tcp-basics',
  unit: 3,
  order: 21,
  title: 'TCP connections, segments, sequence & ACK numbers',
  short: 'TCP basics',
  cheat: 'p.292–301',
  text: '§3.5.1–3.5.2, §3.5.6 (handshake)',
  minutes: 40,
  summary: 'TCP is the Internet’s connection-oriented, reliable byte-stream transport. This section covers what a TCP “connection” really is (state in the two end systems only), the three-way handshake, send/receive buffers and the MSS, every field of the TCP header, and the byte-numbered sequence numbers and cumulative ACK numbers that exam problems ask you to fill in.',
  mustKnow: [
    'A TCP connection is [[logical]]: its state (buffers, variables, sockets) lives [[only in the two end systems]]; routers and switches keep no TCP state and see only [[IP datagrams]].',
    'TCP is [[full-duplex]] (data both ways at once) and [[point-to-point]] (one sender, one receiver) — [[no multicast]].',
    'Three-way handshake: [[SYN]] (seq = client_isn) → [[SYNACK]] (seq = server_isn, ack = client_isn + 1) → [[ACK]] (SYN = 0, ack = server_isn + 1, [[may carry data]]).',
    '[[MSS]] = maximum application data per segment (headers not counted). Ethernet MTU [[1500]] bytes − 40 bytes of TCP/IP headers = MSS [[1460]] bytes.',
    'Sequence numbers count [[bytes]], not segments: a segment’s seq number is the byte-stream number of its [[first data byte]]. Next seq = seq + data length.',
    'ACK number = [[next byte expected]] from the other side. ACKs are [[cumulative]]: they acknowledge everything up to the first missing byte.',
    'Initial sequence numbers are chosen [[randomly]] so a stale segment from an old connection is not mistaken for a valid one.',
    'Header: 16-bit ports, [[32-bit]] seq and ack numbers, 4-bit header length (in [[32-bit words]]), flags (URG ACK PSH RST SYN FIN + CWR ECE), 16-bit receive window, checksum, urgent pointer, options. Typical header = [[20 bytes]].',
    'An ACK can ride on a data segment going the other way: [[piggybacking]].',
    'Out-of-order segments: the RFCs [[leave it to the implementor]] (discard or buffer); buffering is more efficient and is what is used in practice.',
    'TCP gives reliability, flow control and congestion control, but [[no delay or throughput guarantee]] and [[no built-in security]].'
  ],
  topics: [
    {
      title: 'What a TCP connection is',
      src: 'both',
      blocks: [
        { p: 'TCP is the Internet’s [[connection-oriented]], reliable transport protocol (RFCs 793, 1122, 2018, 5681, 7323). Connection-oriented means that before one process can send data to another, the two must first [[handshake]]: send each other preliminary segments that set the parameters of the transfer. During connection establishment [[both sides initialize TCP state variables]] (sequence numbers, buffers, window sizes, timers).' },
        { def: 'Logical connection', text: 'A TCP connection is **not** an end-to-end TDM or FDM circuit as in circuit switching. It is [[logical]]: the common state resides [[only in the TCPs of the two end systems]]. Because TCP runs only in end systems, routers and link-layer switches keep no TCP connection state and are completely oblivious to connections — they see [[datagrams, not connections]].' },
        { def: 'What a connection consists of', text: 'At each host: [[buffers]] (a send buffer and a receive buffer), [[state variables]], and a [[socket]] connection to the process. No buffers or variables are allocated in the network elements in between (routers, switches, repeaters).' },
        { list: [
          '[[Full-duplex]]: with a connection between process A and process B, data can flow A → B at the same time as B → A. Each host tracks sequence numbers for the bytes it sends and ACK numbers for the bytes it receives from the opposite direction.',
          '[[Point-to-point]]: always exactly one sender and one receiver. **Multicasting** — one sender to many receivers in a single send operation — is [[not possible with TCP]] (“two hosts are company and three are a crowd”).',
          'The process that initiates the connection is the [[client]]; the other is the [[server]]. A Python client starts it with `clientSocket.connect((serverName, serverPort))`; the client’s TCP (in the operating system) then performs the handshake with the server’s TCP.',
          'A connection joins client IP:port and server IP:port, with a socket at each end. Once it is set up, each side just writes bytes into its socket without naming the destination again; TCP delivers a reliable, ordered, bidirectional byte stream, like a pipe.',
          'From TCP’s perspective the Internet delivers data end-to-end [[without inspecting or modifying the data contents]]; the numbering, checking and reassembly all happen in the end hosts.'
        ] },
        { trap: '“Connection-oriented” does not mean a reserved path or reserved bandwidth. Datagrams of one TCP connection are forwarded like any others, and routers do not know the connection exists. If a question asks what TCP state a router stores, the answer is none.' }
      ]
    },
    {
      title: 'TCP vs UDP: the service TCP offers',
      src: 'cheat',
      blocks: [
        { p: 'From the lecture’s DISTINGUISH bullet: TCP provides [[reliable, connection-oriented]] delivery with [[flow and congestion control]] and needs connection setup before data transfer, but gives [[no latency or throughput guarantee]] and [[no built-in security]]. UDP is best-effort and connectionless with none of these services.' },
        { table: {
          head: ['', 'TCP', 'UDP'],
          rows: [
            ['Connection setup', 'Yes — three-way handshake before data', 'None (connectionless)'],
            ['Delivery', 'Reliable, in-order byte stream', 'Best effort: segments may be lost, duplicated, reordered'],
            ['Flow control', 'Yes (receive window field)', 'No'],
            ['Congestion control', 'Yes (sender is throttled)', 'No (app can send at any rate)'],
            ['Delay (timing) guarantee', 'No', 'No'],
            ['Throughput / minimum bandwidth guarantee', 'No', 'No'],
            ['Built-in security', 'No (TLS adds it above TCP)', 'No'],
            ['Data unit', 'Unstructured byte stream (no message boundaries)', 'Individual messages'],
            ['Connection state', 'Buffers + variables at both end hosts', 'None'],
            ['Typical header', '20 bytes', '8 bytes']
          ]
        } },
        { trap: 'TCP is reliable, but it does **not** guarantee delay, throughput or security. Distractors like “TCP guarantees a minimum bandwidth” or “TCP encrypts the data” are false.' }
      ]
    },
    {
      title: 'The three-way handshake',
      src: 'both',
      blocks: [
        { p: 'The client application tells its TCP that it wants a connection; the two TCPs then exchange three special segments. The first two carry [[no application-layer data]]; the [[third may carry data]]. Three segments, hence “three-way handshake”.' },
        { diagram: 'tcp-handshake' },
        { steps: [
          'SYN segment: the client TCP sends a segment with the [[SYN bit = 1]], no data, and a randomly chosen initial sequence number [[client_isn]] in the sequence number field. It travels inside an IP datagram like any other segment.',
          'SYNACK segment (“connection granted”): the server [[allocates TCP buffers and variables]], then replies with SYN = 1, its own random [[server_isn]] in the sequence field, and acknowledgment field = [[client_isn + 1]]. Still no data.',
          'ACK segment: on receiving the SYNACK the client allocates its own buffers and variables and replies with [[SYN = 0]], seq = client_isn + 1 and ack = [[server_isn + 1]]. This segment [[may carry client-to-server data]].',
          'Connection established: every later segment has SYN = 0 and both sides can send data.'
        ], title: 'Connection establishment, step by step' },
        { p: 'Why “+ 1”? The SYN and the SYNACK each [[use up one sequence number]] even though they carry no data. So the client’s first data byte is numbered client_isn + 1 and the server’s first data byte is server_isn + 1.' },
        { example: {
          q: 'The client picks client_isn = 4,200 and the server picks server_isn = 9,000. Give the SYN bit, seq and ack of all three handshake segments, and the number of the client’s first data byte.',
          a: 'SYN: SYN = 1, seq = 4,200 (no valid ack yet).\nSYNACK: SYN = 1, seq = 9,000, ack = 4,200 + 1 = 4,201.\nACK: SYN = 0, seq = 4,201, ack = 9,000 + 1 = 9,001 (may also carry data).\nThe client’s first data byte is 4,201. If the third segment carries data, its seq is 4,201; if it is a pure ACK, the next data segment still starts at 4,201 (a pure ACK uses no sequence numbers).'
        } },
        { p: 'Timing: the SYN and SYNACK cost [[one RTT]] before the client can send; because the third segment can carry data (for example an HTTP request), non-persistent HTTP costs 2 RTTs plus transmission time per object.' },
        { p: 'Teardown, briefly (not examined in depth): either side may close. The closing side sends a segment with the [[FIN]] bit set; the other side ACKs it, later sends its own FIN, and the first side ACKs that; then the buffers and variables in both hosts are deallocated. A host that receives a SYN for a port where no socket is listening replies with a segment whose [[RST]] bit is set (“I don’t have a socket for that segment”).' },
        { trap: 'The handshake creates state only in the two end hosts; routers forward the SYN, SYNACK and ACK like any other datagrams. And only the third segment may carry data — the SYN and SYNACK never do.' }
      ]
    },
    {
      title: 'Send and receive buffers, MSS and MTU',
      src: 'both',
      blocks: [
        { p: 'Once the connection is up, a process passes a stream of data through its socket. TCP puts it in the connection’s [[send buffer]] (set aside during the handshake). From time to time TCP grabs a chunk, pairs it with a TCP header to form a [[segment]], and passes it to IP, which encapsulates each segment in its own IP datagram. RFC 793 only says TCP should “send that data in segments at its own convenience”. At the other end, TCP places the segment’s data in the [[receive buffer]] and the application reads the stream from there. [[Each side has its own send buffer and its own receive buffer]].' },
        { steps: [
          'The process writes bytes into its socket.',
          'TCP stores them in the connection’s send buffer.',
          'TCP takes at most MSS bytes and adds a TCP header, forming a segment.',
          'IP encapsulates the segment in a datagram and sends it into the network.',
          'The receiving TCP places the segment’s data in the receive buffer.',
          'The receiving process reads the byte stream out of the receive buffer.'
        ], title: 'The path of application data' },
        { def: 'MSS (maximum segment size)', text: 'The maximum amount of [[application-layer data]] TCP puts in one segment — **not** the size of the segment including headers (confusing name, but entrenched). It is set from the [[MTU]] (maximum transmission unit: the largest link-layer frame the sending host can send) so that the segment plus TCP/IP headers fits in one frame.' },
        { formula: 'MSS = MTU − (TCP header + IP header) = 1500 − 40 = 1460 bytes',
          where: [['MTU', 'largest link-layer frame payload; Ethernet and PPP use 1,500 bytes'], ['40', '20-byte TCP header + 20-byte IP header (typical, no options)'], ['MSS', 'maximum application data in one segment']],
          note: 'Path MTU discovery (RFC 1191) finds the largest frame that fits on every link of the path and sets the MSS from it.' },
        { p: 'A large file (an image on a web page) is cut into chunks of size MSS, except the last chunk, which is usually smaller. Interactive applications (Telnet, ssh) often put only [[1 byte]] of data in a segment: 20-byte header + 1 byte = a [[21-byte]] segment.' },
        { p: 'The send buffer is finite, and TCP drains it only as fast as segments can go out onto the link. If the process writes into the socket faster than that, the send buffer [[fills up]] and the process is held back to TCP’s sending rate — a local limit that is neither flow control nor congestion control (Problem P43).' },
        { trap: 'MSS ≠ MTU. The MTU (1500 on Ethernet) is the link-layer limit; the MSS (1460) counts TCP payload only. If a question says “segment of 1,500 bytes including headers”, the data part is smaller.' }
      ]
    },
    {
      title: 'TCP segment structure (Figure 3.29)',
      src: 'text',
      blocks: [
        { p: 'A TCP segment is header fields plus a data field holding a chunk of application data (at most MSS bytes). Like UDP, the header has source and destination port numbers (for multiplexing/demultiplexing) and a checksum; TCP adds the fields it needs for reliable data transfer, flow control and connection management.' },
        { diagram: 'tcp-segment' },
        { table: {
          head: ['Field', 'Size', 'Purpose'],
          rows: [
            ['Source port #, dest port #', '16 bits each', 'Multiplexing / demultiplexing'],
            ['Sequence number', '32 bits', 'Byte-stream number of the first data byte in this segment'],
            ['Acknowledgment number', '32 bits', 'Next byte expected from the other side (valid only if ACK bit = 1)'],
            ['Header length', '4 bits', 'Header length in 32-bit words (usually 5 → 20 bytes); needed because options make the header variable-length'],
            ['Unused', '4 bits', 'Reserved'],
            ['CWR, ECE flags', '1 bit each', 'Explicit congestion notification (§3.7)'],
            ['URG flag', '1 bit', 'Segment holds data the sending upper layer marked “urgent”'],
            ['ACK flag', '1 bit', 'The acknowledgment field holds a valid value'],
            ['PSH flag', '1 bit', 'Receiver should pass the data to the upper layer immediately'],
            ['RST, SYN, FIN flags', '1 bit each', 'Connection setup and teardown'],
            ['Receive window', '16 bits', 'Flow control: number of bytes the receiver is willing to accept'],
            ['Internet checksum', '16 bits', 'Error detection (same 1s-complement idea as UDP)'],
            ['Urgent data pointer', '16 bits', 'Location of the last byte of urgent data'],
            ['Options', 'variable', 'MSS negotiation, window scaling factor for high-speed networks, time-stamping'],
            ['Data', 'variable (≤ MSS)', 'Application data; may be empty (e.g. a pure ACK)']
          ]
        }, caption: 'TCP header fields, in the order of Figure 3.29 (rows are 32 bits wide)' },
        { list: [
          'The header-length field counts [[32-bit words]]: value 5 → 5 × 4 = [[20 bytes]], the typical header with an empty options field. The 4-bit field tops out at 15 → 60 bytes (40 bytes of options).',
          'The typical TCP header of [[20 bytes]] is [[12 bytes more]] than UDP’s 8-byte header.',
          'The flag field has six classic bits — [[URG, ACK, PSH, RST, SYN, FIN]] — plus CWR and ECE for congestion notification. [[SYN, FIN and RST]] are for connection setup and teardown.',
          'In practice [[PSH, URG and the urgent data pointer are not used]]; they are described for completeness.',
          'The receive window (rwnd) field exists for TCP’s [[flow control]] (keeping the sender from overflowing the receiver’s buffer). Flow-control calculations are beyond this midterm; know the field and its purpose.'
        ] },
        { example: {
          q: 'A captured TCP header has header-length field = 8. How long is the header, and how many bytes of options does it carry?',
          a: 'The field counts 32-bit (4-byte) words: 8 × 4 = 32 bytes.\nThe fixed part of the header is 20 bytes, so options = 32 − 20 = 12 bytes.'
        } },
        { trap: 'Header length is not in bytes: a value of 5 means 20 bytes. Field widths: seq and ack are 32 bits; ports, receive window, checksum and urgent pointer are 16 bits; header length is 4 bits.' }
      ]
    },
    {
      title: 'Sequence numbers: numbering bytes, not segments',
      src: 'both',
      blocks: [
        { p: 'TCP views data as an [[unstructured, but ordered, stream of bytes]]. Sequence numbers run over the stream of transmitted bytes, not over the series of segments. The sequence number of a segment is the [[byte-stream number of the first byte]] in its data field.' },
        { example: {
          q: 'Host A sends a 500,000-byte file to Host B, MSS = 1,000 bytes, and the first byte is numbered 0. How many segments does TCP build, and what are their sequence numbers? (Figure 3.30)',
          a: '500,000 / 1,000 = 500 segments.\nSegment 1 holds bytes 0–999 → seq 0.\nSegment 2 holds bytes 1,000–1,999 → seq 1,000.\nSegment 3 → seq 2,000, and so on.\nSegment 500 holds bytes 499,000–499,999 → seq 499,000.'
        } },
        { formula: 'next seq = seq + (number of data bytes in this segment)',
          where: [['seq', 'sequence number of the current segment'], ['data bytes', 'payload length only, header not counted']],
          note: 'A pure ACK (0 data bytes) does not advance the sequence number. SYN (and FIN) each count as one sequence number.' },
        { def: 'Initial sequence number (ISN)', text: 'Figure 3.30 starts at 0 for simplicity, but in reality both sides [[randomly choose]] an initial sequence number. This minimizes the chance that a segment still in the network from an [[earlier, already-terminated connection]] between the same two hosts (and same port numbers) is mistaken for a valid segment of the new connection. Proper randomization also defends against some security attacks.' },
        { p: 'The sequence-number field is 32 bits, so there are [[2^{32} = 4,294,967,296]] distinct byte numbers (about 4.29 GB of data before the numbers wrap around).' },
        { example: {
          q: 'A 4,000-byte message is sent with MSS = 1,460 bytes. The client’s ISN was 5,000, so its first data byte is 5,001. Give each segment’s seq and size, and the ACK number the receiver returns once it has everything.',
          a: 'Segment 1: seq 5,001, 1,460 bytes (bytes 5,001–6,460).\nSegment 2: seq 5,001 + 1,460 = 6,461, 1,460 bytes.\nSegment 3: seq 6,461 + 1,460 = 7,921, 4,000 − 2,920 = 1,080 bytes (bytes 7,921–9,000).\nFinal ACK = 7,921 + 1,080 = 9,001 (next byte expected).'
        } },
        { trap: 'If a segment has sequence number m, the next segment’s sequence number is **not** m + 1. It is m + (number of data bytes in segment m).' }
      ]
    },
    {
      title: 'Acknowledgment numbers, cumulative ACKs and piggybacking',
      src: 'both',
      blocks: [
        { p: 'TCP is full-duplex, so segments arriving at A from B carry sequence numbers for the B → A byte stream. The [[acknowledgment number]] that Host A puts in its segment is the [[sequence number of the next byte A is expecting from B]].' },
        { list: [
          'A has received bytes 0–535 from B → A puts [[536]] in the acknowledgment field.',
          'A has received bytes 0–535 and 900–1,000, but not 536–899 → A’s next ACK is still [[536]]. TCP acknowledges bytes only up to the [[first missing byte]] in the stream, so TCP provides [[cumulative acknowledgments]].'
        ] },
        { def: 'Piggybacking', text: 'A single segment can carry data in one direction and acknowledge data received from the other direction at the same time. The ACK is said to be [[piggybacked]] on the data segment.' },
        { def: 'Out-of-order segments', text: 'In the example above, bytes 900–1,000 arrived before 536–899. The TCP RFCs impose [[no rule]] here and [[leave it to the implementor]]: (1) discard out-of-order segments immediately (simpler receiver), or (2) keep the out-of-order bytes and wait for the missing bytes to fill the gap — [[more efficient in network bandwidth, and the approach taken in practice]].' },
        { example: {
          q: 'B has received all of A’s bytes up through 799. A sends seq 800 (200 bytes, lost), seq 1,000 (200 bytes) and seq 1,200 (100 bytes). What ACK numbers does B send? Later the retransmitted seq 800 arrives: what does B ACK (a) if B buffered the out-of-order data, (b) if B discarded it?',
          a: 'Seq 1,000 arrives: gap at 800 → ACK 800. Seq 1,200 arrives: still missing 800 → ACK 800 again (a duplicate ACK).\n(a) Buffered: B now has 800–1,299 in order → ACK 1,300.\n(b) Discarded: B has only 800–999 → ACK 1,000, and A must resend 1,000 and 1,200 too.'
        } },
        { trap: 'The ACK number in a segment from A says nothing about A’s own data. A segment with seq = 38 and 4 data bytes does not necessarily carry ack = 42; 42 is what B would put in its ACK back to A. The ack field always refers to the other direction’s byte stream.' },
        { game: 'seq-ack', text: 'Fill in seq and ACK numbers on segment exchanges until it is automatic — the most common TCP exam calculation.' }
      ]
    },
    {
      title: 'Telnet case study (Figure 3.31)',
      src: 'text',
      blocks: [
        { p: 'Telnet (RFC 854) is an interactive remote-login application over TCP (largely replaced by SSH because Telnet sends everything, passwords included, unencrypted). Host A starts the session, so A is the client and B the server. Every character the user types is sent to the server, which [[echoes it back]] so the user sees it was received and processed; each character crosses the network twice.' },
        { p: 'Starting sequence numbers: client [[42]], server [[79]]. After the connection is set up but before any data is sent, the client is waiting for byte 79 and the server is waiting for byte 42. The user types the single letter ‘C’ and goes for a coffee:' },
        { steps: [
          'Client → server: [[Seq = 42, ACK = 79]], data = ‘C’ (1 byte). The ACK is 79 because the client has not yet received any data from the server.',
          'Server → client: [[Seq = 79, ACK = 43]], data = ‘C’ (the echo). ACK 43 says “I got everything up through byte 42”; seq 79 is the first byte the server sends. The ACK is [[piggybacked]] on the server-to-client data.',
          'Client → server: [[Seq = 43, ACK = 80]], empty data field. Its sole purpose is to ACK the echoed ‘C’. It still has a sequence number because the header always has a sequence number field.'
        ], title: 'The three segments after the user types ‘C’' },
        { trap: 'The third segment has seq 43 but carries no data, so it does not use up byte 43: the next data byte the client sends is still numbered 43. Likewise the server’s next data byte is 80.' }
      ]
    }
  ],
  recall: [
    { q: 'Where does the state of a TCP connection live?', a: 'Only in the two end systems (buffers, state variables, sockets). Routers, switches and repeaters keep none; they see only IP datagrams.' },
    { q: 'What do full-duplex and point-to-point mean for TCP?', a: 'Full-duplex: data flows both ways at the same time. Point-to-point: exactly one sender and one receiver. So there is no multicast.' },
    { q: 'Which process is the client in TCP?', a: 'The one that initiates the connection; the other is the server.' },
    { q: 'Give the three handshake segments with their flags and numbers.', a: 'SYN (SYN = 1, seq = client_isn) → SYNACK (SYN = 1, seq = server_isn, ack = client_isn + 1) → ACK (SYN = 0, seq = client_isn + 1, ack = server_isn + 1).' },
    { q: 'Which handshake segment may carry application data?', a: 'Only the third (the client’s ACK).' },
    { q: 'When does the server allocate buffers and variables for a new connection?', a: 'When it receives the SYN, before sending the SYNACK (the client allocates when it receives the SYNACK).' },
    { q: 'What is the MSS, and what is it with an Ethernet MTU?', a: 'Maximum application data per segment, headers excluded. 1500 − 40 = 1460 bytes.' },
    { q: 'What is the sequence number of a TCP segment?', a: 'The byte-stream number of the first data byte in the segment.' },
    { q: 'What is the acknowledgment number?', a: 'The sequence number of the next byte the sender of the ACK expects from the other side.' },
    { q: 'What makes TCP ACKs cumulative?', a: 'An ACK acknowledges all bytes up to the first missing byte; out-of-order bytes beyond a gap are not acknowledged.' },
    { q: 'Why are initial sequence numbers random?', a: 'So a segment from an earlier, terminated connection between the same hosts and ports is not mistaken for a valid segment of the new connection (and for security).' },
    { q: 'What do the RFCs say a receiver must do with out-of-order segments?', a: 'Nothing; it is left to the implementor. Discard or buffer; buffering is more efficient and used in practice.' },
    { q: 'Field sizes: ports, seq, ack, header length, receive window, checksum?', a: '16, 32, 32, 4, 16, 16 bits.' },
    { q: 'In what unit is the header length field, and what is the typical header size?', a: '32-bit words; typically 5 words = 20 bytes.' },
    { q: 'Which flags handle connection setup and teardown?', a: 'SYN, FIN and RST.' },
    { q: 'What does the ACK bit mean?', a: 'The acknowledgment field contains a valid value.' },
    { q: 'Telnet: the client (start 42) and server (start 79) exchange the letter ‘C’. List the three segments.', a: 'Seq 42, ACK 79, ‘C’; Seq 79, ACK 43, ‘C’; Seq 43, ACK 80, no data.' },
    { q: 'What is piggybacking?', a: 'Carrying an acknowledgment in a segment that also carries data in the reverse direction.' },
    { q: 'What does TCP not guarantee?', a: 'Delay (timing), throughput/minimum bandwidth, and security (no built-in encryption).' }
  ]
});
