NET.addSection({
  id: "pipelining",
  unit: 3,
  order: 20,
  title: "Pipelining: Go-Back-N & Selective Repeat",
  short: "GBN & SR",
  cheat: "p.273–288",
  text: "§3.4.2 (pipelining), §3.4.3 Go-Back-N, §3.4.4 Selective Repeat (Figures 3.17–3.27, Table 3.1)",
  minutes: 50,
  summary: "Pipelining lets the sender keep up to N unacknowledged packets in flight, multiplying stop-and-wait’s utilization. Go-Back-N uses cumulative ACKs, one timer and a receiver that discards out-of-order packets, so one loss resends everything outstanding. Selective Repeat ACKs packets individually, keeps a logical timer per packet and buffers out-of-order packets, so only the lost one is resent. Heavily examined: window positions, which packets are resent after a loss, possible ACK values in flight, and window size versus sequence-number space (SR: N ≤ half the space).",
  mustKnow: [
    "Pipelining: up to N packets in flight → U = [[N(L/R) / (RTT + L/R)]] (capped at 1). With 3 packets, U triples: 0.00027 → [[≈ 0.0008]].",
    "Pipelining requires a [[larger sequence-number range]], [[sender buffering]] of unACKed packets, and sometimes [[receiver buffering]] of out-of-order packets.",
    "k-bit sequence numbers range over [[0 to 2^{k} − 1]] and all arithmetic is [[modulo 2^{k}]] (a ring).",
    "GBN window: send_base to send_base + N − 1. Sent but not yet ACKed: send_base to [[nextseqnum − 1]].",
    "GBN ACKs are [[cumulative]]: ACK(n) confirms every packet ≤ n, and the window slides to start at [[n + 1]].",
    "GBN uses [[one timer]] (for the oldest unACKed packet). On timeout it resends [[that packet and all later sent-but-unACKed packets]].",
    "GBN receiver keeps only [[expectedseqnum]] (rcv_base): it delivers and ACKs in-order packets, and [[discards]] out-of-order ones, re-ACKing the last in-order packet.",
    "SR: [[individual (selective) ACKs]], a [[logical timer per packet]], resend [[only]] the timed-out packet. The receiver [[buffers]] out-of-order packets.",
    "SR receiver: in rcv_base to rcv_base + N − 1 → ACK and buffer, deliver any in-order run. In rcv_base − N to rcv_base − 1 → [[ACK again]]. Otherwise ignore.",
    "Window vs sequence space: SR needs [[N ≤ 2^{k}/2]] (half the space); GBN needs [[N ≤ 2^{k} − 1]].",
    "At high error rates GBN’s pipeline [[clogs with unnecessary retransmissions]]. SR avoids this.",
    "Only [[SR]] handles out-of-order packets. GBN and SR are both [[pipelined]]; rdt1.0–3.0 are stop-and-wait."
  ],
  topics: [
    {
      title: "Pipelining",
      src: "both",
      blocks: [
        { p: "The cure for stop-and-wait’s dismal utilization: let the sender transmit [[multiple packets without waiting for acknowledgments]]. The many in-transit packets can be visualised as filling a pipeline, hence [[pipelining]]." },
        { diagram: "pipelining" },
        { formula: "U_{sender} = 3 (L/R) / (RTT + L/R)",
          where: [["3", "packets sent back-to-back before waiting"], ["L", "packet length (bits)"], ["R", "link rate (bits/s)"], ["RTT", "round-trip time"]],
          note: "General form for a window of N packets: U = N(L/R)/(RTT + L/R), up to a maximum of 1 (the pipe is full). Three packets give exactly 3× the stop-and-wait utilization." },
        { example: { q: "Cross-country link (RTT 30 ms, R = 1 Gbps, L = 1000 bytes): utilization with 3 packets pipelined?", a: "L/R = 0.008 ms, so 3L/R = 0.024 ms.\nU = 0.024 / 30.008 = 0.0008 (the lecture slides round this to ≈ 0.00081 = 3 × 0.00027).\nThroughput ≈ 3 × 267 kbps ≈ 800 kbps. Still tiny, but tripled." } },
        { example: { q: "Textbook P15: same cross-country link (RTT 30 ms, 1 Gbps) with 1500-byte packets. How big must the window be for utilization above 98%?", a: "L = 12,000 bits → L/R = 12 µs = 0.012 ms.\nN × 0.012 / (30 + 0.012) > 0.98\nN > 0.98 × 30.012 / 0.012 = 0.98 × 2501 = 2450.98\nN = 2451 packets." } },
        { example: { q: "Same link with 1000-byte packets: how many packets must be outstanding to keep the sender busy 100% of the time?", a: "U = 1 when N × L/R ≥ RTT + L/R.\nN ≥ 30.008 / 0.008 = 3751 packets.\nSanity check with the bandwidth-delay product: R × RTT = 10^{9} × 0.030 = 3 × 10^{7} bits = 3750 packets of 8000 bits, plus the one being transmitted." } },
        { p: "Consequences of pipelining for a reliable protocol:" },
        { list: [
          "The [[range of sequence numbers must increase]]: each in-transit packet (not counting retransmissions) needs a unique number, and many can be unACKed at once.",
          "The sender must [[buffer packets that are sent but not yet acknowledged]], because it may have to retransmit them.",
          "The receiver may need to [[buffer correctly received but out-of-order packets]] (SR does, GBN doesn’t).",
          "How much sequence space and buffering is needed depends on how the protocol reacts to lost, corrupted and delayed packets. The two basic approaches are [[Go-Back-N]] and [[Selective Repeat]]."
        ] },
        { game: "number-crunch", text: "Drill pipelined-utilization and window-size-for-X% problems with random numbers." }
      ]
    },
    {
      title: "Sequence numbers and the sliding window",
      src: "both",
      blocks: [
        { p: "A packet’s sequence number lives in a fixed-length header field. With [[k bits]], sequence numbers range from [[0 to 2^{k} − 1]], and all sequence-number arithmetic is done [[modulo 2^{k}]]. Think of a ring of size 2^{k}, where 2^{k} − 1 is followed by 0. rdt3.0 had k = 1 (numbers 0, 1). TCP has a [[32-bit]] field that counts [[bytes]], not packets." },
        { def: "Window size N", text: "The maximum number of [[unacknowledged]] packets allowed in the pipeline. The permissible range of sequence numbers is a window of size N that slides forward as ACKs arrive, hence [[sliding-window protocol]]." },
        { p: "Why limit N at all? [[Flow control]] (§3.5: don’t overrun the receiver) and [[congestion control]] (§3.7: don’t overload the network) are the reasons." },
        { example: { q: "k = 3 bits, window N = 4, send_base = 6. Which sequence numbers are in the window?", a: "Sequence space 0–7 (modulo 8).\nWindow = 6, 7, 0, 1 (it wraps around the ring).\nIf ACK(7) then arrives (GBN, cumulative), send_base becomes 0 and the window is 0, 1, 2, 3." } }
      ]
    },
    {
      title: "Go-Back-N sender",
      src: "both",
      blocks: [
        { def: "Go-Back-N (GBN)", text: "A sliding-window protocol in which the sender may transmit multiple packets without waiting for ACKs, but may have at most [[N unacknowledged packets]] in the pipeline. Each packet carries a [[k-bit sequence number]]." },
        { diagram: "gbn-window" },
        { table: { head: ["Sequence numbers", "Meaning (Figure 3.19)"], rows: [
          ["0 to base − 1", "Already transmitted and [[ACKed]]"],
          ["base to nextseqnum − 1", "[[Sent, not yet ACKed]] (must stay buffered)"],
          ["nextseqnum to base + N − 1", "[[Usable]]: can be sent immediately if data arrives"],
          ["≥ base + N", "[[Not usable]] until the packet at base is ACKed"]
        ] }, caption: "base (the lecture’s send_base) = oldest unACKed packet; nextseqnum = smallest unused sequence number. Window = base to base + N − 1." },
        { list: [
          "**Invocation from above** (`rdt_send()`): if the window is not full (nextseqnum < base + N), make the packet, send it, start the timer if it is the only outstanding packet (base == nextseqnum), and increment nextseqnum. If the window is full, [[return the data to the upper layer]] (`refuse_data`), which implicitly says “try later”. A real implementation would buffer it or use a semaphore/flag so `rdt_send()` is only called when there is room.",
          "**Receipt of an ACK:** ACK(n) is a [[cumulative acknowledgment]], meaning all packets up to and including n arrived. Set base = n + 1 (the window slides). If base == nextseqnum (nothing outstanding), stop the timer. Otherwise restart it. A corrupted ACK is ignored (Λ).",
          "**Timeout:** restart the timer and [[resend every packet sent but not yet ACKed]] (base to nextseqnum − 1). That behaviour gives the protocol its name."
        ] },
        { table: { head: ["Event", "Actions (Figure 3.20, extended FSM with one state “Wait”)"], rows: [
          ["Initialisation", "`base = 1`; `nextseqnum = 1`"],
          ["`rdt_send(data)`", "`if (nextseqnum < base + N) { sndpkt[nextseqnum] = make_pkt(nextseqnum, data, checksum); udt_send(sndpkt[nextseqnum]); if (base == nextseqnum) start_timer; nextseqnum++ } else refuse_data(data)`"],
          ["`rdt_rcv(rcvpkt) && notcorrupt(rcvpkt)`", "`base = getacknum(rcvpkt) + 1; if (base == nextseqnum) stop_timer else start_timer`"],
          ["`rdt_rcv(rcvpkt) && corrupt(rcvpkt)`", "Λ"],
          ["`timeout`", "`start_timer; udt_send(sndpkt[base]); udt_send(sndpkt[base+1]); … udt_send(sndpkt[nextseqnum−1])`"]
        ] }, caption: "GBN sender" },
        { p: "It is called an [[extended FSM]] because it adds variables (base, nextseqnum), operations on them and conditional actions, so it starts to look like a program. A real implementation is [[event-based]]: procedures run on (1) an upper-layer call to `rdt_send()`, (2) a [[timer interrupt]], and (3) a lower-layer call to `rdt_rcv()`." },
        { p: "The single timer can be thought of as the timer for the [[oldest transmitted but not yet ACKed]] packet." },
        { trap: "On a GBN timeout the sender resends **all** outstanding packets (base to nextseqnum − 1), not just the one that timed out and not the whole window. Usable-but-unsent numbers are not “retransmitted”." }
      ]
    },
    {
      title: "Go-Back-N receiver",
      src: "both",
      blocks: [
        { steps: [
          "If packet n arrives [[correctly and in order]] (the last data delivered came from packet n − 1): send [[ACK n]] and deliver the data.",
          "In [[all other cases]] (corrupted, out of order, duplicate): [[discard]] the packet and resend the ACK for the [[most recently received in-order packet]]."
        ], title: "GBN receiver rules" },
        { table: { head: ["Event", "Actions (Figure 3.21)"], rows: [
          ["Initialisation", "`expectedseqnum = 1`; `sndpkt = make_pkt(0, ACK, checksum)`"],
          ["`rdt_rcv(rcvpkt) && notcorrupt(rcvpkt) && hasseqnum(rcvpkt, expectedseqnum)`", "`extract(rcvpkt, data)`; `deliver_data(data)`; `sndpkt = make_pkt(expectedseqnum, ACK, checksum)`; `udt_send(sndpkt)`; `expectedseqnum++`"],
          ["`default`", "`udt_send(sndpkt)` (re-ACK the last in-order packet)"]
        ] }, caption: "GBN receiver: the only state variable is expectedseqnum (the lecture calls it rcv_base)" },
        { p: "Packets are delivered one at a time and in order, so if packet k has been delivered, every packet below k has too. That makes [[cumulative ACKs]] the natural choice. The receiver therefore ACKs the [[highest in-order sequence number]] received, which can mean sending [[duplicate ACKs]]." },
        { p: "**Why discard a correctly received out-of-order packet?** Data must be delivered in order. If n is expected and n + 1 arrives, the receiver could buffer n + 1. But if n was lost, the GBN sender will [[retransmit both n and n + 1]] anyway. Discarding keeps the receiver simple, with [[no receiver buffering]]: the sender tracks the window edges and nextseqnum, while the receiver tracks only [[expectedseqnum]]. The downside: the retransmission of the discarded packet might itself be lost or garbled, causing even more retransmissions." },
        { trap: "Lecture nuance: GBN [[discards or buffers]] out-of-order packets as a design choice, but either way it [[re-ACKs the last in-order packet]]. The textbook GBN discards. The lecture comparison table says GBN “does not handle out-of-order packets because it discards them”." },
        { p: "GBN already has almost all the techniques TCP uses for reliable transfer: [[sequence numbers]], [[cumulative ACKs]], [[checksums]] and a [[timeout/retransmit]] operation." },
        { list: [
          "GBN **handles:** bit errors, [[packet loss]], corrupted ACK/NAK (via cumulative/duplicate ACKs).",
          "GBN **does not handle:** [[out-of-order]] packets (it discards them).",
          "GBN **is:** [[pipelined]]."
        ] }
      ]
    },
    {
      title: "Go-Back-N in operation (Figure 3.22)",
      src: "both",
      blocks: [
        { steps: [
          "Window N = 4: the sender sends pkt0, pkt1, pkt2, pkt3, then must wait (window full).",
          "pkt2 is [[lost]].",
          "Receiver: pkt0 → deliver, ACK0. pkt1 → deliver, ACK1.",
          "Sender: ACK0 → window slides, sends pkt4. ACK1 → slides, sends pkt5.",
          "Receiver: pkt3, pkt4, pkt5 are out of order → [[discard each]] and send [[ACK1]] each time (duplicate ACKs).",
          "pkt2’s timer expires → sender resends [[pkt2, pkt3, pkt4, pkt5]].",
          "Receiver: pkt2 → deliver, ACK2. pkt3 → deliver, ACK3. And so on."
        ], title: "Figure 3.22 (N = 4, pkt2 lost)" },
        { example: { q: "Textbook P37 (GBN part): Host A sends 5 segments (numbered 1–5) and segment 2 is lost. The timeout is long enough for 5 segments and their ACKs to be received. In the end all 5 arrive. How many segments does A send and how many ACKs does B send (GBN)?", a: "B: seg1 → ACK1. seg3, seg4, seg5 are out of order → discarded, ACK1 each.\nA’s timer for seg2 expires → resend 2, 3, 4, 5.\nB: ACK2, ACK3, ACK4, ACK5.\nA sent 9 segments: 1, 2, 3, 4, 5, 2, 3, 4, 5.\nB sent 8 ACKs: 1, 1, 1, 1, 2, 3, 4, 5." } },
        { example: { q: "GBN, N = 3, packets 0–2 all arrive, but ACK1 is lost (ACK0 and ACK2 get through). What does the sender retransmit?", a: "Nothing. ACK2 is cumulative: it confirms 0, 1 and 2, so base jumps to 3 and the timer stops. A later cumulative ACK covers an earlier lost ACK. (Compare SR, where each ACK covers only one packet.)" } },
        { game: "window-lab", text: "Drop packets and ACKs in GBN and predict exactly which packets get resent and which ACK numbers come back." }
      ]
    },
    {
      title: "Why GBN struggles → the Selective Repeat idea",
      src: "both",
      blocks: [
        { p: "GBN can fill the pipeline, but when the [[window size and bandwidth-delay product are both large]], many packets are in flight. A single packet error makes GBN resend a large number of packets, [[many unnecessarily]], including ones the receiver got correctly but discarded as out of order. As the error rate rises, the pipeline [[clogs]] with these unnecessary retransmissions. In the dictation analogy, every garbled word forces the surrounding 1,000 words (a window of 1,000) to be repeated." },
        { p: "Selective Repeat (SR) avoids this by retransmitting [[only the packets it suspects were lost or corrupted]]. That requires the receiver to [[individually acknowledge]] each correctly received packet, and to [[buffer out-of-order packets]] until the missing ones arrive, then deliver a batch in order to the upper layer. A window of N still limits the number of outstanding packets, but unlike GBN the sender may already have ACKs for some packets inside its window." }
      ]
    },
    {
      title: "Selective Repeat sender",
      src: "both",
      blocks: [
        { diagram: "sr-windows" },
        { steps: [
          "**Data received from above:** check the next available sequence number. If it is [[within the sender’s window]], packetise and send it. Otherwise buffer it or return it to the upper layer for later, as in GBN.",
          "**Timeout:** each packet has its [[own logical timer]], because only [[that single packet]] is retransmitted on timeout. A [[single hardware timer]] can be used to mimic many logical timers.",
          "**ACK received:** if the ACKed packet is in the window, [[mark it as received]]. If its sequence number equals [[send_base]], move the window base forward to the [[unACKed packet with the smallest sequence number]]. If the window moves and untransmitted packets now fall inside it, transmit them."
        ], title: "SR sender events (Figure 3.24)" },
        { table: { head: ["Symbol", "Meaning"], rows: [
          ["N", "SR [[window size]] (same N for sender and receiver)"],
          ["send_base", "Sender window base: the [[oldest unACKed]] sequence number"],
          ["nextseqnum", "Next sequence number to use"],
          ["rcv_base", "Receiver window base: the [[smallest sequence number not yet received]] (expected, not yet received)"]
        ] } },
        { p: "Sender’s view (Figure 3.23a): numbers are already ACKed, sent but not ACKed, usable but not yet sent, or not usable. Inside the window some sent packets may already be ACKed. Receiver’s view (Figure 3.23b): within rcv_base to rcv_base + N − 1, numbers are [[out of order (buffered) but already ACKed]], expected but not yet received, or acceptable (within window)." }
      ]
    },
    {
      title: "Selective Repeat receiver",
      src: "both",
      blocks: [
        { steps: [
          "Packet with sequence number in [[rcv_base to rcv_base + N − 1]] arrives correctly: it is inside the receive window. Send a [[selective ACK]] for it. If it wasn’t received before, [[buffer]] it. If its number equals [[rcv_base]], deliver it plus any [[consecutively numbered buffered]] packets, and slide the window forward by the number of packets delivered.",
          "Packet with sequence number in [[rcv_base − N to rcv_base − 1]] arrives correctly: [[ACK it again]], even though it was already acknowledged.",
          "Otherwise: [[ignore]] the packet."
        ], title: "SR receiver events (Figure 3.25)" },
        { p: "**Why must the receiver re-ACK packets below its window?** Suppose the ACK for send_base was lost. The sender will time out and retransmit that packet, even though the receiver already has it. If the receiver ignored the retransmission, the sender would never get that ACK and its [[window would never move forward]]. The sender and receiver [[do not always have the same view]] of what has been received, so their windows don’t always coincide." },
        { list: [
          "SR **handles:** bit errors, packet loss, corrupted ACK/NAK, and [[out-of-order]] packets (it buffers them).",
          "SR **is:** [[pipelined]].",
          "SR vs GBN: SR [[buffers]] out-of-order packets and handles them. GBN [[discards]] them."
        ] },
        { example: { q: "Figure 3.26: SR with N = 4, sequence numbers 0–9, pkt2 lost. Trace sender and receiver.", a: "Sender: pkt0, pkt1, pkt2, pkt3 sent (window full). pkt2 lost.\nReceiver: pkt0 → delivered, ACK0. pkt1 → delivered, ACK1 (rcv_base = 2).\nSender: ACK0 → base 1, send pkt4. ACK1 → base 2, send pkt5.\nReceiver: pkt3 → buffered, ACK3. pkt4 → buffered, ACK4. pkt5 → buffered, ACK5.\nSender: ACK3 received → mark 3, nothing sent (base still 2). Likewise ACK4, ACK5.\npkt2 TIMEOUT → resend pkt2 only.\nReceiver: pkt2 → deliver pkt2, pkt3, pkt4, pkt5 together, ACK2, rcv_base = 6.\nSender: ACK2 → base jumps to 6 (smallest unACKed) and pkt6, pkt7, … may be sent." } },
        { example: { q: "Textbook P37 (SR part): A sends 5 segments (1–5), segment 2 is lost, and all 5 eventually arrive. How many segments does A send and how many ACKs does B send?", a: "B: ACK1, then seg3, seg4, seg5 are buffered and individually ACKed (ACK3, ACK4, ACK5).\nA: seg2’s timer expires → resend only seg2.\nB: delivers 2–5, ACK2.\nA sent 6 segments: 1, 2, 3, 4, 5, 2.\nB sent 5 ACKs: 1, 3, 4, 5, 2." } },
        { example: { q: "SR, N = 3, packets 0–2 all arrive, but ACK1 is lost. What happens?", a: "The sender gets ACK0 (base → 1) and ACK2 (mark 2), but base stays at 1, since SR ACKs are not cumulative.\npkt1’s timer expires → resend pkt1.\nThe receiver (rcv_base = 3) sees 1 in rcv_base − N to rcv_base − 1 = 0–2, so it re-ACKs 1.\nThe sender marks 1, and base jumps to 3.\nCost: 1 unnecessary retransmission. GBN would have sent none, because its cumulative ACK2 covers the lost ACK1." } },
        { game: "window-lab", text: "Switch to Selective Repeat and compare: same drops, but only the lost packet is resent and the receiver buffer fills." }
      ]
    },
    {
      title: "Window size vs sequence-number space",
      src: "text",
      blocks: [
        { p: "Because SR sender and receiver windows are not synchronised, a [[finite sequence space]] can make the receiver unable to tell a [[retransmission]] from [[new data]]." },
        { example: { q: "Figure 3.27 dilemma: sequence numbers 0, 1, 2, 3 and SR window size 3. Packets 0, 1, 2 are sent, received and ACKed, so the receiver window is now over 3, 0, 1. Show two scenarios the receiver can’t tell apart.", a: "(a) All three ACKs are lost. The sender times out and retransmits pkt0, the old data. The receiver gets a packet with sequence number 0, which lies inside its window 3, 0, 1, so it accepts it as new. That is wrong.\n(b) All ACKs arrive. The sender slides and sends packets numbered 3, 0, 1. The packet numbered 3 is lost, and the one numbered 0 (new data, the fifth packet) arrives. The receiver gets sequence number 0 and must buffer it as new. That is correct.\nThe receiver sees an identical sequence of events in (a) and (b), behind a figurative curtain. So a window of 3 (one less than the space of 4) doesn’t work." } },
        { formula: "SR: N ≤ 2^{k} / 2      GBN: N ≤ 2^{k} − 1",
          where: [["k", "bits in the sequence-number field (space size 2^{k})"], ["N", "window size"]],
          note: "SR: the window may be at most half the sequence-number space. GBN (receiver window of 1): at most one less than the space." },
        { p: "**Why half (textbook P23)?** Suppose the receiver is waiting for m, so its window is m to m + N − 1. It has ACKed m − 1 and the N − 1 packets before it. If none of those N ACKs has reached the sender, the sender’s window is still m − N to m − 1. So at one instant, sequence numbers from [[m − N up to m + N − 1]] can be in play: 2N distinct numbers. The space must hold them all without wrapping, so 2^{k} ≥ [[2N]]. For GBN, the receiver “window” is just m, so the range is m − N to m: N + 1 numbers, giving 2^{k} ≥ N + 1." },
        { example: { q: "3-bit sequence numbers. Largest window for GBN? For SR?", a: "Space = 2^{3} = 8.\nGBN: N ≤ 8 − 1 = 7.\nSR: N ≤ 8/2 = 4." } },
        { example: { q: "Textbook P22: GBN with window N = 4 and sequence space 1024. At time t the receiver’s next expected packet is k. (a) Possible sender windows? (b) Possible ACK values propagating back to the sender?", a: "(a) The receiver has received and ACKed k − 1 and the 3 packets before it (k − 4 to k − 1). If all those ACKs reached the sender, its window is k to k + 3. If none did, it is k − 4 to k − 1. It can’t be further back: to have sent k − 1, the window must include k − 1. So the window starts at any of k − 4, k − 3, k − 2, k − 1, k (5 possibilities, each N = 4 wide, modulo 1024).\n(b) ACKs k − 4 to k − 1 may be in flight. Also, since the sender has sent up to k − 1, it must have received ACK k − 5 (the window could only reach k − 1 if base ≥ k − 4), and a duplicate ACK k − 5 may still be travelling. The receiver never ACKs anything below k − 5 again. So the ACK values in flight lie in k − 5 to k − 1." } },
        { p: "**Reordering and sequence reuse.** §3.4 assumes the channel doesn’t reorder. Over a real network, an old copy of a packet with sequence or ACK number x can appear even though neither window contains x. The channel effectively buffers packets and emits them at any time. The practical fix is to never reuse a sequence number until the sender is “sure” old packets with that number are gone, by assuming a [[maximum packet lifetime]] of about [[three minutes]] (TCP extensions for high-speed networks, RFC 7323)." }
      ]
    },
    {
      title: "GBN vs SR and the full protocol comparison",
      src: "cheat",
      blocks: [
        { table: { head: ["", "Go-Back-N", "Selective Repeat"], rows: [
          ["ACK type", "[[Cumulative]]: ACK(n) = everything ≤ n", "[[Individual]] (selective): one packet each"],
          ["Timers", "[[One]], for the oldest unACKed packet", "One [[logical timer per packet]] (one hardware timer can simulate them)"],
          ["On timeout", "Resend [[all sent-but-unACKed]] packets", "Resend [[only the timed-out]] packet"],
          ["Receiver: out-of-order packet", "[[Discard]] it, re-ACK the last in-order packet", "[[Buffer]] it, ACK it"],
          ["Receiver state", "expectedseqnum (rcv_base) only", "rcv_base + buffer for N packets"],
          ["Receiver window", "1", "N"],
          ["Max window (k-bit seq)", "2^{k} − 1", "2^{k−1} (half the space)"],
          ["Weakness", "Pipeline clogs at high error rates", "More complex receiver, smaller max window"]
        ] }, caption: "GBN vs SR" },
        { table: { head: ["Protocol", "Bit errors", "Corrupted ACK/NAK", "Packet loss", "Out-of-order", "Sending style"], rows: [
          ["rdt1.0", "No (perfect channel)", "N/A: no ACK/NAK", "No", "No", "Stop-and-wait"],
          ["rdt2.0", "Yes", "No", "No", "No", "Stop-and-wait"],
          ["rdt2.1", "Yes", "Yes (sequence numbers)", "No", "No", "Stop-and-wait"],
          ["rdt2.2", "Yes", "Yes (duplicate ACKs)", "No", "No", "Stop-and-wait"],
          ["rdt3.0", "Yes", "Yes", "Yes (timer)", "No", "Stop-and-wait"],
          ["Go-Back-N", "Yes", "Yes (dup/cumulative ACKs)", "Yes", "[[No]]: discards", "[[Pipelined]]"],
          ["Selective Repeat", "Yes", "Yes", "Yes", "[[Yes]]: buffers", "[[Pipelined]]"]
        ] }, caption: "Lecture capability comparison: high-yield" },
        { table: { head: ["Mechanism", "Use (Table 3.1)"], rows: [
          ["Checksum", "Detect [[bit errors]] in a transmitted packet"],
          ["Timer", "Time out and retransmit a packet whose data or ACK was [[lost]]. Premature timeouts or lost ACKs can cause [[duplicate]] copies at the receiver."],
          ["Sequence number", "Number data packets sequentially. [[Gaps]] reveal lost packets, and repeated numbers reveal duplicates."],
          ["Acknowledgment", "Tell the sender a packet or set of packets arrived correctly. Usually carries a sequence number. Can be [[individual or cumulative]]."],
          ["Negative acknowledgment", "Tell the sender a packet was [[not]] received correctly. Usually carries that packet’s sequence number."],
          ["Window, pipelining", "Limit sending to a range of sequence numbers. Allowing several unACKed packets raises [[utilization]] over stop-and-wait. N may be set by the receiver’s buffering ability, network congestion, or both."]
        ] }, caption: "Summary of reliable data transfer mechanisms" }
      ]
    }
  ],
  recall: [
    { q: "What is pipelining, and what does it do to utilization?", a: "Sending multiple packets before waiting for ACKs. U = N(L/R)/(RTT + L/R); 3 packets triple it." },
    { q: "Three requirements pipelining places on a reliable protocol?", a: "A larger sequence-number range, sender buffering of unACKed packets, and (sometimes) receiver buffering of out-of-order packets." },
    { q: "Range of k-bit sequence numbers?", a: "0 to 2^{k} − 1, with arithmetic modulo 2^{k}." },
    { q: "GBN sender window, and the sent-but-unACKed range?", a: "send_base to send_base + N − 1; sent-unACKed = send_base to nextseqnum − 1." },
    { q: "What does GBN ACK(n) mean, and what does the sender do with it?", a: "Cumulative: all packets ≤ n arrived. Set send_base = n + 1, then stop or restart the timer." },
    { q: "GBN timers and timeout action?", a: "One timer for the oldest unACKed packet. On timeout, resend all sent-but-unACKed packets (base to nextseqnum − 1)." },
    { q: "What does the GBN sender do when rdt_send() is called with a full window?", a: "Refuses it, returning the data to the upper layer (a real implementation would buffer or use a flag/semaphore)." },
    { q: "What does the GBN receiver track, and what does it do with out-of-order packets?", a: "Only expectedseqnum (rcv_base). It discards them and re-ACKs the last in-order packet." },
    { q: "Why can a GBN receiver afford to discard out-of-order packets?", a: "If the missing packet was lost, the sender will resend it and everything after it anyway. Discarding means no receiver buffering." },
    { q: "Why does GBN struggle at high error rates?", a: "One error forces many (often unnecessary) retransmissions, so the pipeline clogs." },
    { q: "Three SR sender events?", a: "Data from above (send if in window, else buffer/refuse). Timeout (resend just that packet; per-packet logical timers). ACK (mark it; if it equals send_base, slide to the smallest unACKed and send newly allowed packets)." },
    { q: "Three SR receiver cases?", a: "In rcv_base to rcv_base + N − 1: ACK, buffer, deliver the in-order run. In rcv_base − N to rcv_base − 1: re-ACK. Otherwise ignore." },
    { q: "Why must the SR receiver re-ACK packets below rcv_base?", a: "Their ACKs may have been lost. Without a re-ACK the sender’s window never advances." },
    { q: "How can SR have a timer per packet with one hardware timer?", a: "A single hardware timer can simulate many logical timers." },
    { q: "SR max window for k-bit sequence numbers? GBN?", a: "SR: 2^{k} / 2 (half the space). GBN: 2^{k} − 1." },
    { q: "Figure 3.27 setup?", a: "4 sequence numbers with window 3: the receiver can’t tell a retransmitted pkt0 from a new packet numbered 0." },
    { q: "Which protocols handle out-of-order packets? Which are pipelined?", a: "Only SR handles out-of-order. GBN and SR are pipelined." },
    { q: "Assumed maximum packet lifetime that guards against stale sequence numbers?", a: "About 3 minutes (RFC 7323, TCP high-speed extensions)." }
  ]
});
