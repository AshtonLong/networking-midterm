NET.addSection({
  id: "rdt-basics",
  unit: 3,
  order: 18,
  title: "Reliable data transfer: rdt1.0 → rdt2.2",
  short: "rdt1.0 → rdt2.2",
  cheat: "p.241–262",
  text: "§3.4 intro, §3.4.1 (rdt1.0, rdt2.0, rdt2.1, rdt2.2)",
  minutes: 40,
  summary: "How to build a reliable channel on top of an unreliable one, one fix at a time: rdt1.0 (perfect channel), rdt2.0 (bit errors: checksum + ACK/NAK + retransmission = ARQ), rdt2.1 (1-bit sequence numbers so a garbled ACK/NAK can be survived) and rdt2.2 (NAK-free: duplicate ACKs replace NAKs). Exams test the FSM transitions (“receiver is in state X and gets packet Y — what does it do?”), why each fix was needed, and the protocol capability comparison.",
  mustKnow: [
    "ARQ needs exactly three things: [[error detection]] (checksum bits), [[receiver feedback]] (ACK/NAK) and [[retransmission]] by the sender.",
    "rdt1.0 assumes a [[perfect channel]]: no errors, no loss, so there are [[no ACKs or NAKs]] and each FSM has one state.",
    "rdt2.0 assumes bits can be corrupted but packets are [[never lost]] and arrive [[in order]]. Its sender is [[stop-and-wait]]: no new data until a valid ACK.",
    "rdt2.0’s fatal flaw: a [[corrupted ACK/NAK]]. The sender can’t tell what happened, and blindly resending creates [[duplicates]] the receiver can’t recognise.",
    "rdt2.1 fix: a [[1-bit sequence number]] (0/1) on data packets. Duplicates are ACKed but [[not delivered]]. ACK/NAK carry no sequence number because they always refer to the [[last packet sent]].",
    "A retransmission always keeps its [[original sequence number]]. Relabelling it makes old data look new, so it gets delivered twice.",
    "rdt2.1 FSMs have [[twice as many states]] as rdt2.0: the sender has [[4]], the receiver has [[2]] (Wait for 0 / Wait for 1 from below).",
    "rdt2.2 is [[NAK-free]]: the receiver ACKs the [[last correctly received packet]], so a [[duplicate ACK]] works as a NAK. ACKs now carry a sequence number (ACK0/ACK1) and the sender checks it.",
    "rdt2.1 survives bad feedback by [[adding sequence numbers]]. rdt2.2 survives it by [[using duplicate ACKs instead of NAKs]].",
    "rdt1.0, 2.0, 2.1 and 2.2 cannot handle [[packet loss]] (that needs a timer, rdt3.0) or [[out-of-order]] packets. All are stop-and-wait."
  ],
  topics: [
    {
      title: "The reliable data transfer problem",
      src: "text",
      blocks: [
        { p: "Reliable data transfer (rdt) is a general problem. It appears at the [[transport]], [[link]] and [[application]] layers, and the textbook calls it a candidate for the top of a “top-ten” list of networking problems. TCP is the main example: a reliable protocol running on top of IP, which is [[unreliable]]." },
        { def: "Service model (what upper layers see)", text: "A [[reliable channel]]: no transferred bits are [[corrupted]], none are [[lost]], and all are delivered [[in the order sent]]. This is exactly the service TCP gives applications." },
        { def: "Service implementation (what rdt does)", text: "The rdt protocol has to provide that abstraction even though the layer below it is an [[unreliable channel]]. That lower layer could be one physical link or a whole internetwork; here it is modelled as an unreliable point-to-point channel." },
        { list: [
          "`rdt_send(data)`: called [[from above]] on the sending side to hand data to rdt.",
          "`udt_send(packet)`: rdt sends a packet into the [[unreliable]] channel. Both sides use it (udt = unreliable data transfer).",
          "`rdt_rcv(packet)`: called [[from below]] when a packet arrives on the receiving side of the channel.",
          "`deliver_data(data)`: rdt hands data [[up to the upper layer]] at the receiver."
        ] },
        { p: "The textbook says “packet” rather than “segment” because the theory applies to any layer. It also considers only [[unidirectional]] data transfer (sender → receiver). Packets still travel both ways, because the receiver sends [[control packets]] (ACKs/NAKs) back with `udt_send()`. Bidirectional (full-duplex) transfer is conceptually no harder, just more tedious to describe." },
        { p: "Standing assumption for all of §3.4: the channel may corrupt or lose packets but [[does not reorder]] them." },
        { def: "Finite-state machine (FSM) notation", text: "Each side has its own FSM. On a transition arrow, the [[event]] causing it is written above the horizontal line and the [[actions]] taken are written below. [[Λ]] means “no event” or “no action”. A [[dashed arrow]] marks the initial state." }
      ]
    },
    {
      title: "rdt1.0: a perfectly reliable channel",
      src: "both",
      blocks: [
        { p: "The underlying channel is assumed to be [[completely reliable]]: no bit errors and no loss. The sender and receiver FSMs each have [[one state]], so every transition goes from that state back to itself." },
        { table: { head: ["Side", "State", "Event", "Actions"], rows: [
          ["Sender", "Wait for call from above", "`rdt_send(data)`", "`packet = make_pkt(data)`; `udt_send(packet)`"],
          ["Receiver", "Wait for call from below", "`rdt_rcv(packet)`", "`extract(packet, data)`; `deliver_data(data)`"]
        ] }, caption: "rdt1.0 (Figure 3.9)" },
        { list: [
          "No difference between a unit of data and a packet.",
          "All packets flow sender → receiver. Nothing can go wrong, so the receiver sends [[no feedback]] (no ACKs or NAKs).",
          "The receiver is assumed to be able to receive as fast as the sender sends, so there is [[no need to ask the sender to slow down]] (no flow control)."
        ] }
      ]
    },
    {
      title: "rdt2.0: bit errors, ACK/NAK and ARQ",
      src: "both",
      blocks: [
        { p: "New channel model: bits in a packet [[may be corrupted]], which happens in physical components as a packet is transmitted, propagates or is buffered. rdt2.0 still assumes packets are [[not lost]] and arrive [[in order]]." },
        { p: "Human analogy: someone taking dictation over the phone says “OK” after each sentence (a [[positive acknowledgment]]) or “Please repeat that” (a [[negative acknowledgment]]). Protocols that recover by retransmitting like this are called ARQ protocols." },
        { def: "ARQ (Automatic Repeat reQuest)", text: "A reliable data transfer protocol that recovers from corrupted packets through retransmission. It needs three capabilities: [[error detection]], [[receiver feedback]] and [[retransmission]]." },
        { list: [
          "**Error detection:** the receiver must detect bit errors, so the sender adds extra bits in a [[checksum]] field (like the UDP Internet checksum).",
          "**Receiver feedback:** the sender can only learn the receiver’s view through explicit replies: [[ACK]] (received OK) or [[NAK]] (received in error). In principle these could be [[1 bit]] long (0 = NAK, 1 = ACK).",
          "**Retransmission:** a packet received in error is [[sent again]] by the sender."
        ] },
        { table: { head: ["Side / state", "Event", "Actions", "Next state"], rows: [
          ["Sender: Wait for call from above", "`rdt_send(data)`", "`sndpkt = make_pkt(data, checksum)`; `udt_send(sndpkt)`", "Wait for ACK or NAK"],
          ["Sender: Wait for ACK or NAK", "`rdt_rcv(rcvpkt) && isNAK(rcvpkt)`", "`udt_send(sndpkt)` (resend the last packet)", "Wait for ACK or NAK (stay)"],
          ["Sender: Wait for ACK or NAK", "`rdt_rcv(rcvpkt) && isACK(rcvpkt)`", "Λ", "Wait for call from above"],
          ["Receiver: Wait for call from below", "`rdt_rcv(rcvpkt) && corrupt(rcvpkt)`", "`sndpkt = make_pkt(NAK)`; `udt_send(sndpkt)`", "same (only state)"],
          ["Receiver: Wait for call from below", "`rdt_rcv(rcvpkt) && notcorrupt(rcvpkt)`", "`extract(rcvpkt, data)`; `deliver_data(data)`; `sndpkt = make_pkt(ACK)`; `udt_send(sndpkt)`", "same (only state)"]
        ] }, caption: "rdt2.0 FSMs (Figure 3.10): sender has 2 states, receiver has 1" },
        { def: "Stop-and-wait", text: "While the sender is in “Wait for ACK or NAK” it [[cannot accept new data]]: `rdt_send()` cannot occur. It sends nothing new until it is sure the current packet arrived correctly, i.e. until a [[valid ACK]] arrives. rdt2.0 is therefore called the Stop-and-Wait protocol." },
        { trap: "The receiver delivers good data [[before]] sending the ACK (`extract`, `deliver_data`, then `make_pkt(ACK)`). A corrupted packet is never delivered; it just gets a NAK." },
        { example: { q: "rdt2.0. The sender gets data D from above. The first transmission of D is corrupted and the second arrives intact. List every packet sent on the channel, in order, and say when D is delivered.", a: "1. Sender: `rdt_send(D)` → `sndpkt = make_pkt(D, checksum)`, `udt_send(sndpkt)`, then go to Wait for ACK or NAK.\n2. Receiver: `corrupt(rcvpkt)` → sends NAK. Nothing is delivered.\n3. Sender: `isNAK` → `udt_send(sndpkt)` again and stays in Wait for ACK or NAK.\n4. Receiver: `notcorrupt` → `extract`, `deliver_data(D)` (D is delivered here, once), then sends ACK.\n5. Sender: `isACK` → back to Wait for call from above. Only now can new data be accepted.\nPackets on the channel: D, NAK, D, ACK (4 in total)." } }
      ]
    },
    {
      title: "rdt2.0’s fatal flaw: corrupted ACK/NAK",
      src: "both",
      blocks: [
        { p: "rdt2.0 never considers that the [[ACK or NAK itself can be corrupted]]. Adding checksum bits to ACK/NAK packets lets the sender detect the damage, but the hard part is [[recovery]]: with a garbled reply, the sender has [[no way of knowing]] whether the receiver got the last data packet correctly." },
        { p: "Three possible fixes, and why each falls short:" },
        { list: [
          "**Ask the receiver to repeat** (“What did you say?”). This adds a new sender → receiver packet type, and that request can be garbled too. The receiver then can’t tell whether it is dictation or a request, and the exchange can [[loop]] under repeated corruption.",
          "**Add enough checksum bits to correct errors** (error-correcting codes). This handles a channel that corrupts but does not lose packets, and only works [[within the code’s correction capability]]. It does [[nothing for packet loss]].",
          "**Just resend the current data packet** when the ACK/NAK is garbled. This introduces [[duplicate packets]]. The receiver doesn’t know whether its last ACK/NAK got through, so it [[cannot tell new data from a retransmission]]."
        ] },
        { p: "The fix adopted by almost all real protocols, TCP included: [[number the data packets]]. Put a [[sequence number]] in a new header field, and the receiver compares it with what it expects to see whether a packet is a retransmission." },
        { list: [
          "rdt2.0 **handles:** bit errors in data packets (checksum + ACK/NAK + retransmission).",
          "rdt2.0 **does not handle:** packet loss, [[corrupted ACK/NAK]] packets, or out-of-order packets.",
          "rdt2.0 **is:** a stop-and-wait protocol."
        ] }
      ]
    },
    {
      title: "rdt2.1: 1-bit sequence numbers",
      src: "both",
      blocks: [
        { def: "rdt2.1", text: "rdt2.0 plus a [[sequence number field on data packets]]. The receiver uses it to tell a [[new packet]] from a [[duplicate]]." },
        { p: "For stop-and-wait, a [[1-bit]] sequence number (0/1) is enough. Same number as the last packet received means a retransmission. A changed number (moving “forward” in [[modulo-2]] arithmetic) means a new packet." },
        { p: "ACK and NAK packets [[do not need sequence numbers]] in rdt2.1. The channel does not lose packets, so any ACK/NAK, garbled or not, must be a response to the [[most recently transmitted]] data packet." },
        { steps: [
          "Send new packets alternating between sequence numbers [[0 and 1]].",
          "A valid (uncorrupted) [[ACK]] moves the sender on to the next sequence number.",
          "A [[NAK or a corrupted ACK/NAK]] causes retransmission of the current packet.",
          "A retransmission keeps the [[original sequence number]].",
          "Wait for a valid ACK before accepting new data (still stop-and-wait)."
        ], title: "rdt2.1 sender rule" },
        { table: { head: ["Sender state", "Event", "Actions", "Next state"], rows: [
          ["Wait for call 0 from above", "`rdt_send(data)`", "`sndpkt = make_pkt(0, data, checksum)`; `udt_send(sndpkt)`", "Wait for ACK or NAK 0"],
          ["Wait for ACK or NAK 0", "`corrupt(rcvpkt) || isNAK(rcvpkt)`", "`udt_send(sndpkt)` (resend pkt 0)", "stay"],
          ["Wait for ACK or NAK 0", "`notcorrupt(rcvpkt) && isACK(rcvpkt)`", "Λ", "Wait for call 1 from above"],
          ["Wait for call 1 from above", "`rdt_send(data)`", "`sndpkt = make_pkt(1, data, checksum)`; `udt_send(sndpkt)`", "Wait for ACK or NAK 1"],
          ["Wait for ACK or NAK 1", "`corrupt(rcvpkt) || isNAK(rcvpkt)`", "`udt_send(sndpkt)` (resend pkt 1)", "stay"],
          ["Wait for ACK or NAK 1", "`notcorrupt(rcvpkt) && isACK(rcvpkt)`", "Λ", "Wait for call 0 from above"]
        ] }, caption: "rdt2.1 sender (Figure 3.11): 4 states" },
        { p: "The four sender states, in the cheat sheet’s words: [[ready to send seq 0]], [[sent seq 0 and waiting for feedback]], [[ready to send seq 1]], [[sent seq 1 and waiting for feedback]]." },
        { steps: [
          "Packet [[corrupted]] → send [[NAK]].",
          "Uncorrupted with the [[expected]] sequence number → extract, [[deliver]], send ACK, flip to expecting the other number.",
          "Uncorrupted but a [[duplicate]] (wrong sequence number) → send [[ACK]] (the sender evidently missed the earlier ACK) and [[do not deliver]] it."
        ], title: "rdt2.1 receiver rule" },
        { table: { head: ["Receiver state", "Event", "Actions", "Next state"], rows: [
          ["Wait for 0 from below", "`notcorrupt(rcvpkt) && has_seq0(rcvpkt)`", "`extract`; `deliver_data`; `sndpkt = make_pkt(ACK, checksum)`; `udt_send(sndpkt)`", "Wait for 1 from below"],
          ["Wait for 0 from below", "`corrupt(rcvpkt)`", "`sndpkt = make_pkt(NAK, checksum)`; `udt_send(sndpkt)`", "stay"],
          ["Wait for 0 from below", "`notcorrupt(rcvpkt) && has_seq1(rcvpkt)` (duplicate)", "`sndpkt = make_pkt(ACK, checksum)`; `udt_send(sndpkt)` (no delivery)", "stay"],
          ["Wait for 1 from below", "`notcorrupt(rcvpkt) && has_seq1(rcvpkt)`", "`extract`; `deliver_data`; ACK", "Wait for 0 from below"],
          ["Wait for 1 from below", "`corrupt(rcvpkt)`", "NAK", "stay"],
          ["Wait for 1 from below", "`notcorrupt(rcvpkt) && has_seq0(rcvpkt)` (duplicate)", "ACK (no delivery)", "stay"]
        ] }, caption: "rdt2.1 receiver (Figure 3.12): 2 states" },
        { p: "State structure: the rdt2.1 sender and receiver FSMs have [[twice as many states]] as rdt2.0 (sender 2 → 4, receiver 1 → 2). Each state records whether the packet currently being sent or expected has sequence number 0 or 1. The seq = 0 states are [[mirror images]] of the seq = 1 states, differing only in how the sequence number is handled." },
        { trap: "**Never relabel a retransmission.** Suppose packet 0 was delivered, the receiver moved to “Wait for 1”, and its ACK was corrupted. If the sender resends the same data labelled **1**, the receiver sees the expected number, treats old data as new and [[delivers it twice]]. Retransmissions must keep the [[original sequence number]]. Here that is 0, which the receiver recognises as a duplicate, ACKs and discards." },
        { example: { q: "rdt2.1. Sender sends data D0 with seq 0. It arrives intact and the receiver sends an ACK, but the ACK is corrupted. Trace what both sides do until the sender is ready for new data.", a: "1. Receiver (Wait for 0): `notcorrupt && has_seq0` → deliver D0, send ACK, move to Wait for 1.\n2. ACK corrupted. Sender (Wait for ACK or NAK 0): `corrupt(rcvpkt)` → resend pkt 0 (still seq 0) and stay.\n3. Receiver (Wait for 1): `notcorrupt && has_seq0` → duplicate. Send ACK, do NOT deliver, stay in Wait for 1.\n4. Sender: `notcorrupt && isACK` → move to Wait for call 1 from above.\nResult: D0 delivered exactly once. 2 data transmissions, 2 ACKs." } },
        { list: [
          "rdt2.1 **handles:** corrupted data packets and [[corrupted ACK/NAK feedback]].",
          "rdt2.1 **does not handle:** [[packet loss]] or out-of-order packets.",
          "rdt2.1 **is:** stop-and-wait."
        ] },
        { game: "rdt-sim", text: "Play the rdt2.1 receiver and sender: for each arriving packet, pick the exact FSM action until duplicate handling is automatic." }
      ]
    },
    {
      title: "rdt2.2: a NAK-free protocol",
      src: "both",
      blocks: [
        { p: "Observation: instead of a NAK, the receiver can send an [[ACK for the last correctly received packet]]. A sender that gets [[two ACKs for the same packet]] (duplicate ACKs) knows the packet [[after]] the twice-ACKed one was not received correctly. rdt2.2 uses this idea to drop NAKs completely." },
        { list: [
          "**Receiver:** the ACK must now [[name the packet it acknowledges]]: `make_pkt(ACK, 0, checksum)` or `make_pkt(ACK, 1, checksum)`. So rdt2.2 ACK sequence numbers are [[0 and 1]].",
          "**Sender:** must [[check the ACK’s number]]: `isACK(rcvpkt, 0)` or `isACK(rcvpkt, 1)`.",
          "An ACK for the [[previous]] packet now does the job of a NAK and triggers retransmission of the current packet."
        ] },
        { table: { head: ["State", "Event", "Actions", "Next state"], rows: [
          ["Sender: Wait for call 0 from above", "`rdt_send(data)`", "`sndpkt = make_pkt(0, data, checksum)`; `udt_send(sndpkt)`", "Wait for ACK 0"],
          ["Sender: Wait for ACK 0", "`corrupt(rcvpkt) || isACK(rcvpkt, 1)`", "`udt_send(sndpkt)` (resend pkt 0)", "stay"],
          ["Sender: Wait for ACK 0", "`notcorrupt(rcvpkt) && isACK(rcvpkt, 0)`", "Λ", "Wait for call 1 from above"],
          ["Sender: Wait for ACK 1", "`corrupt(rcvpkt) || isACK(rcvpkt, 0)`", "`udt_send(sndpkt)` (resend pkt 1)", "stay"],
          ["Sender: Wait for ACK 1", "`notcorrupt(rcvpkt) && isACK(rcvpkt, 1)`", "Λ", "Wait for call 0 from above"],
          ["Receiver: Wait for 0 from below", "`notcorrupt(rcvpkt) && has_seq0(rcvpkt)`", "`extract`; `deliver_data`; `sndpkt = make_pkt(ACK, 0, checksum)`; `udt_send(sndpkt)`", "Wait for 1 from below"],
          ["Receiver: Wait for 0 from below", "`corrupt(rcvpkt) || has_seq1(rcvpkt)`", "`sndpkt = make_pkt(ACK, 1, checksum)`; `udt_send(sndpkt)` (duplicate ACK1)", "stay"],
          ["Receiver: Wait for 1 from below", "`notcorrupt(rcvpkt) && has_seq1(rcvpkt)`", "`extract`; `deliver_data`; `sndpkt = make_pkt(ACK, 1, checksum)`; `udt_send(sndpkt)`", "Wait for 0 from below"],
          ["Receiver: Wait for 1 from below", "`corrupt(rcvpkt) || has_seq0(rcvpkt)`", "`sndpkt = make_pkt(ACK, 0, checksum)`; `udt_send(sndpkt)` (duplicate ACK0)", "stay"]
        ] }, caption: "rdt2.2 (Figures 3.13 and 3.14). Sender has 4 states, receiver has 2. The sender’s “Wait for call 1 from above” row mirrors the call-0 row." },
        { steps: [
          "Sender retransmits when the received ACK is [[corrupted]] or its sequence number [[does not match]] the current packet.",
          "Receiver, on a packet that is [[corrupt]] or has the [[wrong sequence number]], sends a duplicate ACK for the [[last correctly received]] packet (ACK0 or ACK1)."
        ], title: "rdt2.2 rules" },
        { p: "rdt2.2 is [[still stop-and-wait]]: the sender waits for a valid ACK for the current packet before sending new data. The 0/1 sequence numbers still prevent confusion between [[new and retransmitted]] packets." },
        { trap: "Look at the receiver self-loops in Figure 3.14. In **Wait for 0** a bad or duplicate packet triggers **ACK1** (1 was the last packet received correctly). In **Wait for 1** it triggers **ACK0**. Students often swap these." },
        { example: { q: "rdt2.2. The sender is in Wait for ACK 1 and has just sent pkt1. pkt1 arrives corrupted. What does each side do?", a: "Receiver (Wait for 1 from below): `corrupt(rcvpkt)` → send `make_pkt(ACK, 0, checksum)` (a duplicate ACK0, since 0 was the last packet received correctly) and stay.\nSender (Wait for ACK 1): receives ACK0, the wrong number, so the event `corrupt(rcvpkt) || isACK(rcvpkt, 0)` fires → resend pkt1 (seq still 1) and stay.\nThe duplicate ACK0 did the job a NAK would have done in rdt2.1." } },
        { table: { head: ["", "rdt2.1", "rdt2.2"], rows: [
          ["How it survives corrupted feedback", "Adds [[sequence numbers]] to data packets", "Uses [[duplicate ACKs instead of NAKs]] (data still carries 0/1)"],
          ["Feedback types", "ACK and NAK", "ACK only"],
          ["Do ACKs carry a sequence number?", "No (they always refer to the last packet sent)", "Yes: ACK0 / ACK1"],
          ["Receiver on a corrupted packet", "NAK", "ACK for the last correctly received packet"],
          ["Receiver on a duplicate", "ACK, don’t deliver", "ACK that sequence number, don’t deliver"],
          ["Sender retransmits on", "NAK or corrupted ACK/NAK", "Corrupted ACK or ACK with the wrong number"],
          ["Operation", "Stop-and-wait", "Stop-and-wait"]
        ] }, caption: "rdt2.1 vs rdt2.2" },
        { p: "Why NAK-free matters: rdt3.0 reuses the [[rdt2.2 receiver]] unchanged, and TCP is also ACK-only (it uses duplicate ACKs for fast retransmit)." },
        { p: "ACK-only versus NAK-only (textbook P14). A [[NAK-only]] receiver can only notice that packet x is missing when packet [[x+1 arrives]] and reveals the gap. If the sender transmits rarely, recovery waits for the next packet, which may be a long time away, so [[ACK-based]] feedback is better. If the sender has lots of data and losses are rare, NAK-only sends feedback only when something goes wrong, so it [[greatly reduces feedback traffic]] and recovers quickly because the next packet arrives soon." }
      ]
    },
    {
      title: "Capability comparison: rdt1.0 → rdt3.0",
      src: "cheat",
      blocks: [
        { table: { head: ["Protocol", "Channel it is designed for", "Bit errors", "Corrupted ACK/NAK", "Packet loss", "Out-of-order", "Sending style", "Mechanism added"], rows: [
          ["rdt1.0", "Perfect", "No (none occur)", "N/A: no ACK/NAK", "No", "No", "Stop-and-wait (lecture table)", "None: send and deliver"],
          ["rdt2.0", "Bit errors, no loss", "Yes", "[[No]]", "No", "No", "Stop-and-wait", "Checksum, ACK/NAK, retransmit"],
          ["rdt2.1", "Bit errors (data and feedback)", "Yes", "Yes, via [[sequence numbers]]", "No", "No", "Stop-and-wait", "1-bit seq number on data"],
          ["rdt2.2", "Same as 2.1", "Yes", "Yes, via [[duplicate ACKs]]", "No", "No", "Stop-and-wait", "ACK0/ACK1, no NAK"],
          ["rdt3.0", "Bit errors + loss", "Yes", "Yes", "Yes, via [[timer]]", "[[No]]", "Stop-and-wait", "Countdown timer"]
        ] }, caption: "Lecture comparison table (GBN and SR, both pipelined, are added in the pipelining section)" },
        { trap: "The lecture table lists rdt1.0 through rdt3.0 as [[stop-and-wait]], meaning one packet at a time and not pipelined. Strictly speaking, rdt1.0 has nothing to wait for, since there is no feedback. For “which are stop-and-wait vs pipelined?”, answer: rdt1.0–3.0 stop-and-wait; GBN and SR pipelined." },
        { list: [
          "rdt1.0: perfect channel, [[no ACKs or NAKs]].",
          "rdt2.0: bit errors yes; loss no; corrupted ACK/NAK [[no]].",
          "rdt2.1 / rdt2.2: add handling of corrupted feedback; still no loss handling.",
          "rdt3.0: bit errors, loss and corrupted ACK/NAK, but [[not out-of-order]] packets."
        ] }
      ]
    }
  ],
  recall: [
    { q: "What three capabilities does every ARQ protocol need?", a: "Error detection (checksum), receiver feedback (ACK/NAK), retransmission." },
    { q: "Name the four rdt interface calls and who calls each.", a: "rdt_send() (upper layer → sender), udt_send() (rdt → unreliable channel, both sides), rdt_rcv() (channel → receiver side), deliver_data() (receiver rdt → upper layer)." },
    { q: "In FSM notation, what goes above and below the line, and what does Λ mean?", a: "Event above, actions below. Λ = no event or no action. A dashed arrow marks the initial state." },
    { q: "What does rdt2.0 assume about the channel?", a: "Bits may be corrupted, but packets are not lost and arrive in order." },
    { q: "Why is rdt2.0 called stop-and-wait?", a: "In Wait for ACK or NAK it cannot accept new data. It sends nothing new until a valid ACK arrives." },
    { q: "What is rdt2.0’s fatal flaw?", a: "Corrupted ACK/NAK packets: the sender can’t tell whether the last data packet arrived correctly." },
    { q: "Why doesn’t “just resend on a garbled ACK/NAK” work in rdt2.0?", a: "It creates duplicates, and without sequence numbers the receiver can’t tell new data from a retransmission." },
    { q: "How many sequence-number bits does stop-and-wait need?", a: "1 (0/1)." },
    { q: "Why don’t rdt2.1 ACK/NAKs need sequence numbers?", a: "No loss, so any ACK/NAK must refer to the most recently transmitted data packet." },
    { q: "rdt2.1 receiver gets an uncorrupted packet with the wrong sequence number. Action?", a: "Send ACK, do not deliver (it is a duplicate), stay in the same state." },
    { q: "State counts (sender, receiver) for rdt2.0 and rdt2.1?", a: "rdt2.0: 2 and 1. rdt2.1: 4 and 2 (twice as many)." },
    { q: "What goes wrong if a retransmission is relabelled with the next sequence number?", a: "The receiver thinks old data is new and delivers it twice. Retransmissions must keep the original number." },
    { q: "How does rdt2.2 signal “that packet was bad” without a NAK?", a: "It sends a duplicate ACK for the last correctly received packet (ACK0/ACK1)." },
    { q: "rdt2.2 sender in Wait for ACK 0 receives ACK1. Action?", a: "Resend pkt0 (wrong ACK number = treated like a NAK) and stay." },
    { q: "rdt2.1 vs rdt2.2: how does each handle corrupted feedback?", a: "rdt2.1 adds sequence numbers. rdt2.2 uses duplicate ACKs instead of NAKs (and ACKs carry 0/1)." },
    { q: "Which of rdt1.0–2.2 can handle packet loss?", a: "None. Loss needs a timer (rdt3.0)." },
    { q: "When is a NAK-only protocol better than ACK-based?", a: "When the sender has lots of data and losses are rare (little feedback, quick gap detection). Worse when data is sent infrequently (a loss is only noticed when the next packet arrives)." }
  ]
});
