NET.addSection({
  id: "rdt3",
  unit: 3,
  order: 19,
  title: "rdt3.0, timers & stop-and-wait performance",
  short: "rdt3.0 & S&W perf",
  cheat: "p.263–272",
  text: "§3.4.1 (rdt3.0, Figures 3.15–3.16), §3.4.2 (stop-and-wait performance, Figures 3.17–3.18)",
  minutes: 35,
  summary: "rdt3.0 (the alternating-bit protocol) adds a countdown timer to rdt2.2 so the sender can recover from lost packets and lost ACKs. It is functionally correct, but as a stop-and-wait protocol its utilization is terrible on fast or long links: U = (L/R)/(RTT + L/R) = 0.00027 for the 1 Gbps cross-country example. Expect timer-rule questions, Figure 3.16 traces (lost packet, lost ACK, premature timeout) and the utilization/throughput calculation.",
  mustKnow: [
    "rdt3.0 = rdt2.2 + a [[countdown timer]]. It handles bit errors, corrupted ACKs and [[packet loss]].",
    "The sender can’t tell a lost data packet, a [[lost ACK]] or an [[overly delayed]] packet apart, and it does the same thing for all three: [[retransmit on timeout]].",
    "Timer rules: [[start]] it every time a packet is sent (new or retransmission), [[stop]] it when the correct ACK arrives, and on a [[timeout]] retransmit and restart it.",
    "A delayed packet can cause a [[premature timeout]] and a duplicate. That is harmless because the receiver uses [[sequence numbers]].",
    "rdt3.0 is the [[alternating-bit protocol]] (seq numbers alternate 0/1). Its receiver FSM is the same as the [[rdt2.2 receiver]].",
    "The rdt3.0 sender [[ignores]] (Λ) corrupted or wrong-numbered ACKs and lets the timer handle recovery. rdt2.2 would retransmit immediately.",
    "U_{sender} = [[(L/R) / (RTT + L/R)]]: the fraction of time the sender is actually putting bits on the link.",
    "Cross-country example: L = 8000 bits, R = 1 Gbps → L/R = [[8 µs]]. RTT = 30 ms → U = [[0.00027]], throughput ≈ [[267 kbps]] on a 1 Gbps link.",
    "Stop-and-wait wastes high-speed or long-RTT links (the sender sits idle). The fix is [[pipelining]].",
    "rdt3.0 handles bit errors, loss and corrupted ACK/NAK, but [[not out-of-order]] packets. It is still stop-and-wait."
  ],
  topics: [
    {
      title: "Adding packet loss: what rdt3.0 must solve",
      src: "both",
      blocks: [
        { p: "New channel model: besides corrupting bits, the channel can [[lose packets]] entirely, which is common in the Internet. That raises two new questions: [[how to detect]] loss, and [[what to do]] when it happens." },
        { p: "The second question is already answered by rdt2.2’s tools: checksums, sequence numbers, ACKs and retransmission. The first needs a [[new mechanism]]. The textbook puts the burden of detecting and recovering from loss on the [[sender]]." },
        { p: "If the data packet or its ACK is lost, no reply ever reaches the sender. If the sender waits long enough to be sure a packet has been lost, it can simply [[retransmit]]. From the sender’s point of view retransmission is a cure-all: it can’t tell whether the [[data packet was lost]], the [[ACK was lost]], or either was just [[overly delayed]], and the action is the same in every case." },
        { def: "rdt3.0", text: "A protocol that reliably transfers data over a channel that can [[corrupt or lose]] packets. It adds [[timeout-based retransmission]] to the checksums, sequence numbers, ACKs and retransmissions it inherits from rdt2.2." }
      ]
    },
    {
      title: "The countdown timer and how long to wait",
      src: "both",
      blocks: [
        { p: "Time-based retransmission needs a [[countdown timer]] that can interrupt the sender after a given time. The sender must be able to do three things with it:" },
        { steps: [
          "[[Start]] the timer each time a packet is sent, whether a first-time packet or a [[retransmission]] (`start_timer`).",
          "Respond to a [[timer interrupt]] (timeout) by retransmitting the current packet and starting the timer again.",
          "[[Stop]] the timer when the [[correct ACK]] arrives (`stop_timer`)."
        ], title: "rdt3.0 timer rules" },
        { p: "**How long to wait?** At least one [[round-trip delay]] between sender and receiver (which may include buffering at intermediate routers), plus the time the receiver needs to [[process]] a packet. That worst-case delay is very hard to estimate, let alone know with certainty, and waiting for a worst case would make recovery slow. In practice the sender chooses a value at which loss is [[likely but not guaranteed]] to have happened." },
        { p: "Consequence: if a packet or its ACK is merely delayed, the sender may retransmit even though nothing was lost. This is a [[premature timeout]], and it puts [[duplicate]] data packets into the channel. rdt2.2’s [[sequence numbers]] already handle duplicates, so this is harmless to correctness." },
        { trap: "A timer is needed even if the RTT were constant and known exactly (textbook R11). The sender would then know that once the timer expires the packet or ACK really is lost (no premature timeouts), but it still needs a timer of that fixed duration to [[detect the loss]] at all. Without one, it would wait forever." }
      ]
    },
    {
      title: "rdt3.0 sender and receiver FSMs (Figure 3.15)",
      src: "both",
      blocks: [
        { table: { head: ["Sender state", "Event", "Actions", "Next state"], rows: [
          ["Wait for call 0 from above", "`rdt_send(data)`", "`sndpkt = make_pkt(0, data, checksum)`; `udt_send(sndpkt)`; `start_timer`", "Wait for ACK0"],
          ["Wait for call 0 from above", "`rdt_rcv(rcvpkt)` (stray/late ACK)", "Λ (ignore)", "stay"],
          ["Wait for ACK0", "`rdt_rcv(rcvpkt) && (corrupt(rcvpkt) || isACK(rcvpkt, 1))`", "Λ (do nothing; let the timer handle it)", "stay"],
          ["Wait for ACK0", "`timeout`", "`udt_send(sndpkt)`; `start_timer`", "stay"],
          ["Wait for ACK0", "`rdt_rcv(rcvpkt) && notcorrupt(rcvpkt) && isACK(rcvpkt, 0)`", "`stop_timer`", "Wait for call 1 from above"],
          ["Wait for call 1 from above", "`rdt_rcv(rcvpkt)`", "Λ (ignore)", "stay"],
          ["Wait for call 1 from above", "`rdt_send(data)`", "`sndpkt = make_pkt(1, data, checksum)`; `udt_send(sndpkt)`; `start_timer`", "Wait for ACK1"],
          ["Wait for ACK1", "`corrupt(rcvpkt) || isACK(rcvpkt, 0)`", "Λ", "stay"],
          ["Wait for ACK1", "`timeout`", "`udt_send(sndpkt)`; `start_timer`", "stay"],
          ["Wait for ACK1", "`notcorrupt(rcvpkt) && isACK(rcvpkt, 1)`", "`stop_timer`", "Wait for call 0 from above"]
        ] }, caption: "rdt3.0 sender: 4 states (ready to send 0, waiting for ACK0, ready to send 1, waiting for ACK1)" },
        { trap: "Compare with rdt2.2. In Wait for ACK0, a corrupted ACK or an ACK1 makes the **rdt2.2** sender [[retransmit immediately]], but the **rdt3.0** sender does [[nothing]] (Λ) and waits for the timeout. Retransmitting on every wrong ACK as well would cause duplicates to multiply after a premature timeout (textbook P12)." },
        { p: "The rdt3.0 sender also has Λ self-loops on `rdt_rcv(rcvpkt)` in the “Wait for call from above” states. A late or duplicate ACK that arrives after the sender has moved on (e.g. after a premature timeout) is simply [[ignored]]." },
        { def: "Alternating-bit protocol", text: "Another name for rdt3.0, because its packet sequence numbers [[alternate between 0 and 1]]. The sender cycles through ready to send seq 0 → waiting for ACK0 → ready to send seq 1 → waiting for ACK1." },
        { p: "**Receiver (textbook P8):** rdt3.0 needs no new receiver. Its receiver FSM is [[the same as the rdt2.2 receiver]] (Figure 3.14). It has two states, Wait for 0 from below and Wait for 1 from below. An intact packet with the expected number is extracted, delivered and ACKed with that number, and the receiver switches state. A corrupted packet or a duplicate (wrong number) gets an ACK for the [[last correctly received]] packet and no delivery. The receiver never needs a timer: loss recovery is entirely the sender’s job." },
        { table: { head: ["Receiver state", "Event", "Actions", "Next state"], rows: [
          ["Wait for 0 from below", "`notcorrupt(rcvpkt) && has_seq0(rcvpkt)`", "`extract`; `deliver_data`; `sndpkt = make_pkt(ACK, 0, checksum)`; `udt_send(sndpkt)`", "Wait for 1 from below"],
          ["Wait for 0 from below", "`corrupt(rcvpkt) || has_seq1(rcvpkt)`", "`sndpkt = make_pkt(ACK, 1, checksum)`; `udt_send(sndpkt)`", "stay"],
          ["Wait for 1 from below", "`notcorrupt(rcvpkt) && has_seq1(rcvpkt)`", "`extract`; `deliver_data`; `sndpkt = make_pkt(ACK, 1, checksum)`; `udt_send(sndpkt)`", "Wait for 0 from below"],
          ["Wait for 1 from below", "`corrupt(rcvpkt) || has_seq0(rcvpkt)`", "`sndpkt = make_pkt(ACK, 0, checksum)`; `udt_send(sndpkt)`", "stay"]
        ] }, caption: "rdt3.0 receiver = rdt2.2 receiver" },
        { p: "Why don’t rdt3.0’s ACKs need their own sequence numbers (textbook P7)? Sequence numbers exist so the **receiver** can detect duplicate **data**. The sender doesn’t need that for ACKs, because a duplicate ACK is [[obvious to the sender]]: once it got the original ACK it moved to the next state, so a later copy is not the ACK it is waiting for and is [[ignored]]. (The ACK field still says which data packet is being acknowledged.)" }
      ]
    },
    {
      title: "rdt3.0 in action: the four scenarios (Figure 3.16)",
      src: "both",
      blocks: [
        { steps: [
          "**(a) No loss:** send pkt0 → receiver gets pkt0, sends ACK0 → sender gets ACK0, sends pkt1 → receiver sends ACK1 → sender gets ACK1, sends pkt0, and so on.",
          "**(b) Lost packet:** pkt1 is lost → the receiver sends nothing → the sender’s [[timeout]] fires → it resends pkt1 → the receiver gets pkt1 and sends ACK1 → the sender gets ACK1 and sends pkt0.",
          "**(c) Lost ACK:** the receiver gets pkt1 and sends ACK1, which is lost → timeout → resend pkt1 → the receiver [[detects a duplicate]] (it is waiting for 0), does not deliver, and resends ACK1 → the sender gets ACK1 and sends pkt0.",
          "**(d) Premature timeout:** ACK1 is merely delayed → the timer expires → the sender resends pkt1 → the late ACK1 arrives, so the sender stops the timer and sends pkt0 → the duplicate pkt1 reaches the receiver, which detects the duplicate and sends ACK1 again → that second ACK1 reaches the sender, which is waiting for ACK0, so it [[does nothing]] → pkt0 arrives and is ACKed normally."
        ], title: "Figure 3.16" },
        { p: "Receive times are always later than send times because of transmission and propagation delay. Brackets on the sender side of the figure mark when the timer is set and when it expires." },
        { example: { q: "Textbook P9: trace rdt3.0 when a data packet and then an ACK are garbled (no loss). The sender starts with pkt0 and the receiver starts in Wait for 0.", a: "1. Sender sends pkt0 and starts the timer → state Wait for ACK0.\n2. pkt0 arrives **corrupted**. Receiver (Wait for 0): `corrupt` → sends ACK1 (duplicate ACK for the last good packet). No delivery.\n3. Sender gets ACK1 while waiting for ACK0 → wrong number → **does nothing**.\n4. Timeout → sender resends pkt0 and restarts the timer.\n5. pkt0 arrives intact → receiver delivers it, sends ACK0 and moves to Wait for 1.\n6. ACK0 arrives **corrupted** → sender does nothing.\n7. Timeout → sender resends pkt0 and restarts the timer.\n8. Receiver (Wait for 1) sees seq 0 → duplicate: sends ACK0, no delivery.\n9. Sender gets an intact ACK0 → `stop_timer` → Wait for call 1 → sends pkt1 when data arrives.\nTotals: pkt0 sent 3 times, delivered once, 2 timeouts." } },
        { game: "rdt-sim", text: "Play the rdt3.0 sender through lost packets, lost ACKs and premature timeouts. Note when the correct move is to do nothing and wait." }
      ]
    },
    {
      title: "Stop-and-wait performance",
      src: "both",
      blocks: [
        { p: "rdt3.0 is functionally correct, but its performance is poor in high-speed networks because it is [[stop-and-wait]]. It sends one packet, then sits [[idle]] for a whole round trip waiting for the ACK." },
        { diagram: "stop-and-wait" },
        { def: "Sender utilization", text: "The fraction of time the sender is actually busy [[sending bits into the channel]]." },
        { formula: "U_{sender} = (L/R) / (RTT + L/R)",
          where: [["L", "packet length (bits), headers included"], ["R", "link transmission rate (bits/s)"], ["L/R", "transmission time d_{trans} of one packet"], ["RTT", "round-trip time (propagation there and back)"]],
          note: "Assumes ACKs are tiny (their transmission time is ignored) and the receiver ACKs as soon as the last bit arrives. Ignoring processing and queuing makes the real figure even worse." },
        { p: "Timeline (Figure 3.18a): first bit leaves at t = 0. The last bit leaves at t = [[L/R]]. The last bit reaches the receiver at t = [[RTT/2 + L/R]], and the receiver sends the ACK. The ACK reaches the sender at t = [[RTT + L/R]], when the next packet can start. So in every RTT + L/R the sender is busy for only L/R." },
        { example: { q: "Cross-country example (Figures 3.17/3.18): West Coast to East Coast, RTT = 30 ms, R = 1 Gbps, L = 1000 bytes. Find d_{trans}, U_{sender} and the effective throughput.", a: "L = 1000 × 8 = 8000 bits.\nd_{trans} = L/R = 8000 / 10^{9} = 8 × 10^{-6} s = 8 µs = 0.008 ms.\nLast bit arrives at the receiver at RTT/2 + L/R = 15 + 0.008 = 15.008 ms. The ACK is back at RTT + L/R = 30.008 ms.\nU = 0.008 / 30.008 = 0.000267 ≈ 0.00027 (busy 2.7 hundredths of 1 percent of the time).\nThroughput = L / (RTT + L/R) = 8000 bits / 0.030008 s ≈ 266,600 bps ≈ 267 kbps, on a 1 Gbps link." } },
        { p: "This shows a network protocol [[limiting the capabilities]] of the underlying hardware: the network manager pays for a gigabit link and gets 267 kbps." },
        { formula: "throughput = L / (RTT + L/R) = U_{sender} × R",
          where: [["L / (RTT + L/R)", "one packet’s bits delivered per send-and-wait cycle"]],
          note: "Answer in bits/s. Watch bytes vs bits (×8) and kbps = 10^{3} bps." },
        { example: { q: "Same link (RTT 30 ms, 1 Gbps) but 1500-byte packets. U and throughput?", a: "L = 12,000 bits → L/R = 12 µs = 0.012 ms.\nU = 0.012 / 30.012 = 0.0003998 ≈ 0.0004.\nThroughput = 12,000 / 0.030012 s ≈ 399,840 bps ≈ 400 kbps." } },
        { example: { q: "The manager upgrades the 1 Gbps link to 10 Gbps (RTT 30 ms, L = 1000 bytes, still stop-and-wait). What happens to throughput?", a: "L/R = 8000 / 10^{10} = 0.8 µs.\nThroughput = 8000 / (0.030 + 0.0000008) s ≈ 266,660 bps ≈ 267 kbps, essentially unchanged.\nThe cycle time is dominated by the RTT, not by L/R, so a faster link barely helps. Only sending more packets per RTT (pipelining) helps." } },
        { example: { q: "Geostationary satellite link: RTT = 540 ms, R = 1 Mbps, L = 1000 bytes, stop-and-wait. U and throughput?", a: "L/R = 8000 / 10^{6} = 8 ms.\nU = 8 / (540 + 8) = 8 / 548 = 0.0146 (1.46%).\nThroughput = 8000 bits / 0.548 s ≈ 14,600 bps ≈ 14.6 kbps." } },
        { example: { q: "How long does stop-and-wait take to deliver a 100-packet file in the cross-country example (each cycle RTT + L/R)?", a: "Each packet costs RTT + L/R = 30.008 ms.\n100 × 30.008 ms = 3000.8 ms ≈ 3.0 s (for 800,000 bits, i.e. ≈ 267 kbps again)." } },
        { trap: "U is a [[fraction]] (0.00027) and throughput is a [[rate]] (267 kbps). Don’t mix them up. Throughput = U × R: 0.000267 × 10^{9} ≈ 267,000 bps." },
        { game: "number-crunch", text: "Drill stop-and-wait utilization and throughput with random L, R and RTT until the units trap stops catching you." }
      ]
    },
    {
      title: "Where rdt3.0 stands",
      src: "both",
      blocks: [
        { list: [
          "**Handles:** bit errors (checksum), [[packet loss]] (timer + retransmit), corrupted ACK/NAK (sequence numbers + duplicate ACKs, no NAK).",
          "**Does not handle:** [[out-of-order]] packets (the channel is assumed not to reorder).",
          "**Is:** [[stop-and-wait]], one packet outstanding at a time."
        ] },
        { table: { head: ["Mechanism", "Role in rdt3.0"], rows: [
          ["Checksum", "Detect [[bit errors]] in data and ACK packets"],
          ["Sequence number (1 bit)", "Let the receiver detect [[duplicate]] data packets (from lost ACKs or premature timeouts)"],
          ["ACK (carrying 0/1)", "Tell the sender which packet arrived correctly. A duplicate ACK means the current packet didn’t."],
          ["Timer", "Detect [[loss]] of a data packet or its ACK and trigger retransmission"]
        ] }, caption: "Checksums, sequence numbers, timers and acknowledgments each play a necessary role" },
        { p: "**Why reordering breaks the alternating-bit protocol (textbook P13).** With only 0/1 numbers, an old copy of a packet that turns up late carries a number that is valid again. Example: D0 (message 1) is delayed in the network and the sender times out and resends it. The copy is delivered and ACKed, then message 2 (D1) completes. Message 3 goes out as D0. Now the [[stale first copy]] of D0 arrives while the receiver expects 0, so it delivers [[old message 1 again]] as if it were message 3 and sends ACK0. The sender takes that ACK0 as confirming message 3. When the real message 3 arrives, it looks like a duplicate and is discarded, so [[message 3 is lost]]." },
        { trap: "rdt3.0 is not “fully reliable” on every channel. It is correct only for a channel that corrupts and loses but does [[not reorder]] packets." }
      ]
    },
    {
      title: "Design variations (textbook problems)",
      src: "text",
      blocks: [
        { example: { q: "P10: The channel can lose packets but has a known maximum delay. Modify rdt2.1 so it works, and argue why.", a: "Add a countdown timer to the sender, set to more than the known maximum round-trip delay. Start it every time a packet (new or retransmitted) is sent. Add a timeout event to both “Wait for ACK or NAK” states that retransmits the current packet and restarts the timer. Stop the timer on a valid ACK.\nWhy it works: a lost data packet → timeout → resend. A lost ACK/NAK → timeout → resend a duplicate, which the rdt2.1 receiver recognises by its sequence number, ACKs and does not deliver. Because the timeout exceeds the maximum delay, it never fires prematurely, so no stale duplicates are in flight to confuse the 1-bit numbers." } },
        { example: { q: "P12: Suppose the rdt3.0 sender, instead of ignoring corrupted or wrong-numbered ACKs, retransmitted the current packet on them. Would the protocol still work?", a: "Correctness: yes. A retransmission is exactly what would happen if the packet had been lost, and the receiver discards duplicates using sequence numbers.\nBut performance collapses once premature timeouts occur. A premature timeout leaves two copies of packet n in flight, so two ACK n’s come back. The first moves the sender on to n+1. The second arrives while it waits for ACK n+1, so it is a “wrong” ACK and triggers a retransmission of n+1. Now n+1 is sent twice, which produces two ACKs, and so on. Every later packet is sent at least twice, and each further premature timeout adds another copy. The number of times packet n is sent grows without bound as n → ∞." } },
        { example: { q: "P16: To beat stop-and-wait’s low utilization, a receiver using rdt3.0 keeps sending back alternating ACK0/ACK1 even for data it hasn’t received yet. Does this increase utilization? Any problems?", a: "Yes, utilization increases. The early ACKs let the sender push out packets without waiting a full RTT each, which effectively pipelines them.\nProblem: reliability is lost. If a data packet is lost or corrupted, the receiver has already “ACKed” it, so the sender never retransmits it and the data is silently lost. Also, with only 0/1 sequence numbers and several packets in flight, packets and ACKs can’t be told apart unambiguously." } },
        { example: { q: "P21: A asks B for data. A sends a request R on a channel that can lose (but not corrupt) R messages, and B answers with data D, which is always delivered correctly. Delays are unknown and variable. A must deliver exactly one copy of each D. Which mechanisms are needed?", a: "Timer at A: R can be lost, so A must time out and resend R.\n1-bit sequence numbers on R and D: delays are variable, so A may resend an R that B already received (a premature timeout). B must recognise the duplicate R and resend the same D, not a new one. A must recognise and discard a duplicate D, delivering only the D whose number matches its current request. A has 4 states (Wait for request 0 from above, Wait for D0, Wait for request 1 from above, Wait for D1). B has 2 states (Wait for R0, Wait for R1).\nNot needed: checksums (nothing is corrupted) and ACKs for D (D always arrives)." } },
        { example: { q: "P19: A broadcasts to B and C over a channel that can independently lose and corrupt packets toward each. A must not take new data until both B and C have the current packet. Key design points?", a: "This is rdt3.0 extended to two receivers. Data packets carry a 1-bit sequence number and a checksum. ACKs must carry the sequence number **and identify the receiver** (B or C). B and C each run the rdt3.0 (rdt2.2) receiver and re-ACK duplicates.\nA’s waiting state must remember whose ACK it already has: none, only B, or only C. A timeout re-broadcasts the packet. A receiver that already has it simply re-ACKs it as a duplicate. A moves to the next sequence number only when both ACKs have arrived." } },
        { example: { q: "P20: A and B each send to C over separate channels that can lose and corrupt (not reorder). C must deliver alternately: A, B, A, B, … Key design points?", a: "A and B each run an rdt3.0 sender (timer, 1-bit sequence number, checksum). C keeps track of whose turn it is and which sequence number it expects from that sender, which gives 4 states: wait for A’s 0, wait for B’s 0, wait for A’s 1, wait for B’s 1. A packet from the sender whose turn it is, with the expected number, is delivered and ACKed, and C moves on. A duplicate (an already-delivered number) from either sender is re-ACKed so that sender can stop retransmitting. A new packet from the sender whose turn it isn’t is not ACKed, so that sender keeps retransmitting until its turn comes. Corrupted packets are ignored or re-ACKed with the last good number." } }
      ]
    }
  ],
  recall: [
    { q: "What single mechanism does rdt3.0 add to rdt2.2, and for what?", a: "A countdown timer, to detect and recover from packet loss." },
    { q: "Name the three events the rdt3.0 sender treats identically.", a: "Lost data packet, lost ACK, overly delayed packet/ACK. All lead to retransmit on timeout." },
    { q: "State the three timer rules.", a: "Start it on every send (including retransmissions). Stop it on the correct ACK. On timeout, retransmit and restart it." },
    { q: "What does a premature timeout cause, and why is it harmless?", a: "An unnecessary retransmission (a duplicate). The receiver detects it by sequence number, re-ACKs it and does not deliver it." },
    { q: "Why is rdt3.0 called the alternating-bit protocol?", a: "Its sequence numbers alternate between 0 and 1." },
    { q: "What is the rdt3.0 receiver FSM?", a: "The same as the rdt2.2 receiver: Wait for 0 / Wait for 1 from below, duplicate ACK for the last good packet." },
    { q: "rdt3.0 sender in Wait for ACK0 receives a corrupted ACK or ACK1. Action?", a: "Nothing (Λ). Wait for the timeout." },
    { q: "Would a timer still be needed if the RTT were constant and known?", a: "Yes. A fixed timer is still the only way to detect that a packet or ACK was lost; there would just be no premature timeouts." },
    { q: "How long should the sender wait before retransmitting?", a: "At least the RTT (including router buffering) plus receiver processing time. In practice a value where loss is likely but not certain." },
    { q: "Stop-and-wait utilization formula?", a: "U = (L/R) / (RTT + L/R)." },
    { q: "Cross-country example numbers?", a: "L = 8000 bits, R = 1 Gbps → L/R = 8 µs. RTT = 30 ms → U = 0.008/30.008 ≈ 0.00027. Throughput ≈ 267 kbps." },
    { q: "When does the ACK for the first packet arrive in stop-and-wait?", a: "t = RTT + L/R (30.008 ms in the example)." },
    { q: "Does upgrading 1 Gbps to 10 Gbps help stop-and-wait over 30 ms RTT?", a: "Barely. Throughput stays ≈ 267 kbps because the RTT dominates. Pipelining is the fix." },
    { q: "What can rdt3.0 not handle?", a: "Out-of-order (reordered) packets. And it is stop-and-wait, so its performance is poor." },
    { q: "Why don’t rdt3.0 ACKs need their own sequence numbers?", a: "The sender recognises a duplicate ACK by its state: it already moved on, so the duplicate isn’t the ACK it is waiting for, and it ignores it." }
  ]
});
