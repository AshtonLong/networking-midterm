NET.addSection({
  id: 'tcp-rtt',
  unit: 3,
  order: 22,
  title: 'TCP RTT estimation, timeouts & fast retransmit',
  short: 'TCP RTT & timers',
  cheat: 'p.302–311',
  text: '§3.5.3–3.5.4',
  minutes: 45,
  summary: 'How TCP turns noisy RTT measurements into a retransmission timeout (EstimatedRTT, DevRTT, TimeoutInterval), and how its single-timer sender, cumulative ACKs, timeout doubling, receiver ACK rules and fast retransmit give reliable delivery over IP. Expect an EWMA calculation chain, seq/ACK timelines with lost segments or ACKs, and “why” questions (Karn’s rule, three duplicate ACKs, GBN vs SR vs TCP).',
  mustKnow: [
    'SampleRTT = time from a segment being [[sent (passed to IP)]] until [[its ACK arrives]]; only [[one]] measurement at a time, and [[never for a retransmitted segment]].',
    'EstimatedRTT = (1 − α)·EstimatedRTT + α·SampleRTT with α = [[0.125]] (1/8): an [[exponential weighted moving average]] (EWMA).',
    'DevRTT = (1 − β)·DevRTT + β·|SampleRTT − EstimatedRTT| with β = [[0.25]].',
    'TimeoutInterval = [[EstimatedRTT + 4·DevRTT]]; initial value [[1 second]] (RFC 6298).',
    'Update order used here (RFC 6298): DevRTT with the [[previous]] EstimatedRTT, then EstimatedRTT, then TimeoutInterval.',
    'Timeout too short → [[premature timeouts / unnecessary retransmissions]]; too long → [[slow reaction to segment loss]].',
    'On a timeout TCP retransmits [[only the oldest unACKed segment]] and [[doubles]] the timeout; it recomputes the formula when the timer is restarted after new data or an ACK.',
    '[[SendBase]] = oldest unacknowledged byte. ACK y with y > SendBase → SendBase = y, restart the timer if anything is still unACKed.',
    'Receiver: in-order segment with nothing pending → [[delayed ACK, wait up to 500 ms]]; gap → [[immediate duplicate ACK]] for the next expected byte.',
    'Fast retransmit: [[3 duplicate ACKs]] (4 ACKs for the same data) → resend the missing segment [[before its timer expires]].',
    'A later [[cumulative ACK]] covers a lost earlier ACK; the receiver [[discards]] duplicate retransmitted data and re-ACKs.',
    'TCP’s error recovery is a [[hybrid of Go-Back-N and Selective Repeat]].'
  ],
  topics: [
    {
      title: 'Reliable data transfer on top of unreliable IP',
      src: 'text',
      blocks: [
        { p: 'IP does not guarantee delivery, in-order delivery, or data integrity: datagrams can overflow router buffers, arrive out of order, or have bits flipped. TCP builds a reliable service on top of it: the byte stream a process reads from its receive buffer is [[uncorrupted, without gaps, without duplication, and in sequence]] — exactly the stream the other side sent.' },
        { p: 'It reuses the rdt toolkit of §3.4: error detection (checksum), [[sequence numbers]], [[cumulative ACKs]], [[timers]] and [[retransmission]]. TCP also [[pipelines]]: many segments can be sent but not yet ACKed (how many is set by flow and congestion control, which are outside this midterm). Like rdt3.0, TCP cannot tell whether a segment was lost, its ACK was lost, or either is just late — in every case its response is the same: [[retransmit]].' }
      ]
    },
    {
      title: 'Why the timeout length matters',
      src: 'both',
      blocks: [
        { p: 'TCP recovers from lost segments with a timeout/retransmit mechanism, so it needs a timeout value. The timeout must be [[larger than the round-trip time]] (time from sending a segment until it is acknowledged), but not by too much:' },
        { list: [
          '[[Too short]] → [[premature timeouts]] and [[unnecessary retransmissions]] (the ACK was still on its way).',
          '[[Too long]] → TCP [[reacts slowly to segment loss]]: a lost segment is not resent quickly, giving large data-transfer delays.'
        ] },
        { p: 'The catch: the RTT is not constant. SampleRTT values fluctuate from segment to segment because of [[congestion in the routers]] (queuing delay) and the [[varying load on the end systems]], so any single SampleRTT may be atypical. TCP therefore averages the samples (EstimatedRTT) and adds a safety margin based on how much they vary (DevRTT).' }
      ]
    },
    {
      title: 'Measuring SampleRTT',
      src: 'both',
      blocks: [
        { def: 'SampleRTT', text: 'For a segment: the time between when it is [[sent (passed to IP)]] and when [[an acknowledgment for it is received]].' },
        { list: [
          'Most TCPs take [[only one SampleRTT measurement at a time]]: at any moment only one of the transmitted-but-unACKed segments is being timed, so a new SampleRTT arrives about [[once every RTT]].',
          'TCP [[never computes a SampleRTT for a segment that has been retransmitted]]; it only measures segments transmitted once (Karn’s algorithm).',
          'Why: when the ACK for a retransmitted segment arrives, the sender cannot tell whether it acknowledges the [[original transmission or the retransmission]]. Matching it to the wrong one gives a sample that is far too large or far too small and corrupts the estimate.'
        ] },
        { trap: 'A segment that times out and is resent produces no RTT sample at all — not a sample measured from the first send, and not one measured from the retransmission.' }
      ]
    },
    {
      title: 'EstimatedRTT: an exponential weighted moving average',
      src: 'both',
      blocks: [
        { formula: 'EstimatedRTT = (1 − α) · EstimatedRTT + α · SampleRTT',
          where: [['α', '0.125 = 1/8 (recommended in RFC 6298)'], ['EstimatedRTT (right side)', 'the previous estimate'], ['SampleRTT', 'the newest measurement']],
          note: 'Read it as a programming statement: new value from the old value. With α = 0.125 it is EstimatedRTT = 0.875 · EstimatedRTT + 0.125 · SampleRTT.' },
        { p: 'This is an [[exponential weighted moving average (EWMA)]]: [[recent samples have more influence]] than old ones (they better reflect current congestion), and the weight of any given sample [[decays exponentially]] — every later update multiplies it by (1 − α) = 0.875.' },
        { table: {
          head: ['Sample age (updates ago)', '0 (newest)', '1', '2', '3', 'k'],
          rows: [['Weight in EstimatedRTT, α = 1/8', '0.125', '0.109', '0.096', '0.084', 'α(1 − α)^{k}']]
        }, caption: 'Each step back in time multiplies the weight by 0.875' },
        { example: {
          q: 'Starting from an estimate E_{0}, expand EstimatedRTT after three samples S_{1} (oldest), S_{2}, S_{3} (newest) for a general α.',
          a: 'After S_{1}: E_{1} = (1 − α)E_{0} + αS_{1}\nAfter S_{2}: E_{2} = (1 − α)E_{1} + αS_{2} = (1 − α)^{2}E_{0} + α(1 − α)S_{1} + αS_{2}\nAfter S_{3}: E_{3} = (1 − α)^{3}E_{0} + α(1 − α)^{2}S_{1} + α(1 − α)S_{2} + αS_{3}\nEach step back in time multiplies a sample’s weight by (1 − α): geometric (exponential) decay. The weights add up to 1.'
        } },
        { example: {
          q: 'EstimatedRTT = 100 ms and a SampleRTT of 140 ms arrives. What is the new EstimatedRTT?',
          a: 'EstimatedRTT = 0.875 × 100 + 0.125 × 140 = 87.5 + 17.5 = 105 ms.\nA 40 ms jump in the sample moves the estimate only 1/8 of the way: 5 ms.'
        } },
        { p: 'Figure 3.32 plots a real connection (gaia.cs.umass.edu in Massachusetts → fantasia.eurecom.fr in France) with α = 1/8: the SampleRTT curve jumps up and down sharply (the axis spans 100–350 ms), while the EstimatedRTT curve is a much [[smoother line]] through the samples — the EWMA [[smooths out the variations]].' }
      ]
    },
    {
      title: 'DevRTT and the TimeoutInterval',
      src: 'both',
      blocks: [
        { formula: 'DevRTT = (1 − β) · DevRTT + β · |SampleRTT − EstimatedRTT|',
          where: [['β', '0.25 (recommended in RFC 6298)'], ['|…|', 'absolute value: a deviation is never negative']],
          note: 'DevRTT is an EWMA of how far SampleRTT strays from EstimatedRTT. Little fluctuation → small DevRTT; lots of fluctuation → large DevRTT.' },
        { formula: 'TimeoutInterval = EstimatedRTT + 4 · DevRTT',
          where: [['EstimatedRTT', 'the floor: the timeout must be at least this, or retransmissions would be unnecessary'], ['4 · DevRTT', 'the safety margin: large when RTT fluctuates a lot, small when it is stable']],
          note: 'Not too much larger than EstimatedRTT either, or lost segments would be resent too slowly.' },
        { def: 'Update order used on this site', text: 'When a new SampleRTT arrives this site follows [[RFC 6298]] (and the publisher’s solution to Problem P31): (1) update DevRTT using the [[previous]] EstimatedRTT; (2) update EstimatedRTT; (3) TimeoutInterval = new EstimatedRTT + 4 · new DevRTT. The textbook prints the EstimatedRTT formula first; if your instructor updates EstimatedRTT first and plugs the new value into DevRTT, EstimatedRTT comes out identical but DevRTT and TimeoutInterval are slightly smaller. On an exam, write down which order you use.' },
        { example: {
          q: 'EstimatedRTT = 80 ms and DevRTT = 10 ms. A SampleRTT of 120 ms arrives (α = 0.125, β = 0.25). Find DevRTT, EstimatedRTT and TimeoutInterval. Then a SampleRTT of 70 ms arrives: repeat.',
          a: 'Sample 120 ms:\nDevRTT = 0.75 × 10 + 0.25 × |120 − 80| = 7.5 + 10 = 17.5 ms\nEstimatedRTT = 0.875 × 80 + 0.125 × 120 = 70 + 15 = 85 ms\nTimeoutInterval = 85 + 4 × 17.5 = 155 ms\nSample 70 ms:\nDevRTT = 0.75 × 17.5 + 0.25 × |70 − 85| = 13.125 + 3.75 = 16.875 ms\nEstimatedRTT = 0.875 × 85 + 0.125 × 70 = 74.375 + 8.75 = 83.125 ms\nTimeoutInterval = 83.125 + 4 × 16.875 = 150.625 ms\n(Other order, DevRTT with the new EstimatedRTT: DevRTT 16.25 → timeout 150 ms, then 15.47 → 145 ms. EstimatedRTT is the same either way.)'
        } },
        { trap: 'Classic slips: dropping the absolute value in DevRTT; multiplying EstimatedRTT by 4 instead of DevRTT; swapping α and β (α = 0.125 goes with EstimatedRTT, β = 0.25 with DevRTT); putting the (1 − α) weight on the new sample instead of on the old estimate.' },
        { game: 'rtt-estimator', text: 'Grind EstimatedRTT → DevRTT → TimeoutInterval sample by sample; P31-style chains are a classic exam calculation.' },
        { game: 'number-crunch', text: 'Mixed drills: one-step EWMA updates, timeouts and seq/ACK arithmetic under time pressure.' }
      ]
    },
    {
      title: 'Managing the timer: initial value, doubling, recomputing',
      src: 'both',
      blocks: [
        { list: [
          'Initial TimeoutInterval = [[1 second]] (RFC 6298), used before any RTT samples exist.',
          'Whenever a timeout occurs, TCP retransmits the unACKed segment with the smallest sequence number and sets the next timeout to [[twice the previous value]] instead of using EstimatedRTT and DevRTT. Example: 0.75 s expires → retransmit, new timer 1.5 s → expires again → retransmit, new timer 3.0 s. The intervals grow [[exponentially]].',
          'Whenever the timer is started after either of the other two events — [[data received from the application]] or an [[ACK received]] — TimeoutInterval is [[derived again from the most recent EstimatedRTT and DevRTT]]. As soon as a segment is ACKed and EstimatedRTT is updated, the formula is back in charge.'
        ] },
        { p: 'Why double? It is a [[limited form of congestion control]]. A timer expiration is most likely caused by [[congestion]] — too many packets arriving at some router queue, causing drops or long queuing delays. If sources kept retransmitting at the same pace, the congestion could get worse; instead each sender politely retransmits after longer and longer intervals (Ethernet’s CSMA/CD uses a similar idea).' },
        { example: {
          q: 'TimeoutInterval is 1 s and the same segment times out three times in a row. What is the timer value after each timeout, and how long after the original transmission is the third retransmission sent?',
          a: 'Timeout 1 (at t = 1 s): retransmit, timer = 2 s.\nTimeout 2 (at t = 1 + 2 = 3 s): retransmit, timer = 4 s.\nTimeout 3 (at t = 3 + 4 = 7 s): retransmit, timer = 8 s.\nSo the third retransmission leaves 7 s after the original. When an ACK for new data finally arrives and the timer is restarted, TimeoutInterval is computed again from EstimatedRTT + 4·DevRTT. (None of these retransmissions gives an RTT sample.)'
        } }
      ]
    },
    {
      title: 'The simplified TCP sender (Figure 3.33)',
      src: 'both',
      blocks: [
        { p: 'A timer per unACKed segment is simple in theory but has considerable overhead, so RFC 6298 recommends a [[single retransmission timer]] even with many segments outstanding. Think of it as belonging to the [[oldest unacknowledged segment]]. Assumptions for the figure: data flows one way (A → B), A sends a large file, no flow- or congestion-control limits.' },
        { def: 'SendBase', text: 'The sequence number of the [[oldest unacknowledged byte]]. So SendBase − 1 is the last byte known to have been received correctly and in order at the receiver.' },
        { def: 'NextSeqNum', text: 'The sequence number of the next byte to send (starts at the initial sequence number, like SendBase).' },
        { steps: [
          'Create a TCP segment with sequence number NextSeqNum.',
          'If the timer is not currently running, start it (expiration = TimeoutInterval).',
          'Pass the segment to IP.',
          'NextSeqNum = NextSeqNum + length(data).'
        ], title: 'Event 1 — data received from the application above' },
        { steps: [
          'Retransmit the not-yet-acknowledged segment with the [[smallest sequence number]] (the segment that caused the timeout).',
          'Start (restart) the timer.'
        ], title: 'Event 2 — timer timeout' },
        { list: [
          'Event 3 — ACK received with ACK field value y. ACKs are cumulative: y acknowledges every byte before byte y.',
          'If [[y > SendBase]]: the ACK covers one or more previously unACKed segments → set [[SendBase = y]], and if any segments are still not yet acknowledged, [[restart the timer]].',
          'If y ≤ SendBase: nothing new is acknowledged. The simplified sender ignores it; the fast-retransmit sender counts it as a duplicate ACK.'
        ] },
        { trap: 'The timer is not restarted when a new segment is sent while the timer is already running — it keeps timing the oldest unACKed segment. It is restarted on a timeout, and on an ACK that advances SendBase while data is still outstanding.' }
      ]
    },
    {
      title: 'Three retransmission scenarios (Figures 3.34–3.36)',
      src: 'both',
      blocks: [
        { example: {
          q: 'Lost ACK (Figure 3.34). A sends one segment, seq = 92 with 8 bytes, and waits for ACK 100. B receives it, but B’s ACK 100 is lost. What happens?',
          a: 'A’s timer expires → A retransmits seq 92 (8 bytes) and restarts the timer.\nB sees from the sequence number that it already has bytes 92–99, so it discards the duplicate bytes and sends ACK 100 again.\nA receives ACK 100 and sets SendBase = 100.'
        } },
        { example: {
          q: 'Premature timeout (Figure 3.35). A sends seq 92 (8 bytes) and seq 100 (20 bytes) back to back. Both arrive and B sends ACK 100 and ACK 120, but neither ACK reaches A before the timeout. What does A retransmit?',
          a: 'At the timeout A resends only the oldest unACKed segment, seq 92, and restarts the timer.\nACK 100 and ACK 120 then arrive; ACK 120 moves SendBase to 120.\nAs long as ACK 120 arrives before the new timeout, segment 100 is never retransmitted.\nWhen the duplicate seq 92 reaches B, B discards it and ACKs 120 (it already has everything through byte 119).'
        } },
        { example: {
          q: 'Cumulative ACK saves the day (Figure 3.36). Same two segments, but ACK 100 is lost and ACK 120 arrives just before the timeout. What does A retransmit?',
          a: 'Nothing. ACK 120 is cumulative: it says B has received everything up through byte 119, which covers the lost ACK 100.\nSendBase jumps from 92 to 120, and neither segment is resent.'
        } },
        { table: {
          head: ['Scenario', 'What went wrong', 'A retransmits', 'Lesson'],
          rows: [
            ['Fig 3.34', 'ACK 100 lost', 'seq 92', 'Receiver discards the duplicate data and re-ACKs'],
            ['Fig 3.35', 'Both ACKs late (premature timeout)', 'seq 92 only', 'A timeout resends only the oldest unACKed segment'],
            ['Fig 3.36', 'ACK 100 lost, ACK 120 on time', 'nothing', 'A later cumulative ACK covers an earlier lost ACK']
          ]
        } }
      ]
    },
    {
      title: 'Receiver ACK generation (Table 3.2, RFC 5681)',
      src: 'both',
      blocks: [
        { table: {
          head: ['Event at the receiver', 'TCP receiver action'],
          rows: [
            ['In-order segment with the expected seq #; all data up to it already ACKed', 'Delayed ACK: wait up to 500 ms for another in-order segment; if none arrives, send an ACK'],
            ['In-order segment with the expected seq #; one other in-order segment waiting for its ACK', 'Immediately send a single cumulative ACK, ACKing both in-order segments'],
            ['Out-of-order segment with higher-than-expected seq # (gap detected)', 'Immediately send a duplicate ACK giving the seq # of the next expected byte (the lower end of the gap)'],
            ['Segment that partially or completely fills a gap', 'Immediately send an ACK, provided the segment starts at the lower end of the gap']
          ]
        } },
        { p: 'TCP has [[no negative acknowledgments]]. When a segment with a higher-than-expected sequence number reveals a gap (lost or reordered segments), the receiver simply re-acknowledges the last in-order byte it has: a [[duplicate ACK]] — an ACK that reacknowledges data for which the sender already got an ACK. (Table 3.2 assumes the receiver keeps out-of-order segments.)' },
        { list: [
          'Only one rule waits: the [[500 ms]] delayed ACK for a lone in-order segment. Every other rule says [[immediately]].',
          'Two in-order segments in a row → one cumulative ACK for both (so with delayed ACKs, roughly every second segment is ACKed).'
        ] }
      ]
    },
    {
      title: 'Fast retransmit',
      src: 'both',
      blocks: [
        { p: 'Timeout-triggered retransmission can be slow: the timeout period is relatively long, which delays resending a lost packet and increases end-to-end delay. But a sender usually sends many segments back to back, so one lost segment produces many back-to-back duplicate ACKs. If the sender receives [[three duplicate ACKs]] for the same data — [[four ACKs]] with the same ACK number in total — it takes this as a sign that the segment following the ACKed data was lost and performs a [[fast retransmit]] (RFC 5681): it resends that segment [[before its timer expires]]. Three duplicate ACKs act as an [[implicit NAK]].' },
        { example: {
          q: 'Figure 3.37: A sends seq 92 (8 bytes), seq 100 (20 bytes, lost), seq 120 (15 bytes), seq 135 (6 bytes), seq 141 (16 bytes). B buffers out-of-order data. Which ACKs does B send, when does A retransmit, and what does B ACK after the retransmission?',
          a: 'Seq 92 arrives → ACK 100.\nSeq 120 arrives (gap) → duplicate ACK 100 (1st duplicate).\nSeq 135 → duplicate ACK 100 (2nd). Seq 141 → duplicate ACK 100 (3rd).\nA has now received four ACKs of 100 (the original + 3 duplicates) → fast retransmit of seq 100 (20 bytes) immediately, without waiting for the timeout.\nB fills the gap and now has bytes 100–156 in order → ACK = 141 + 16 = 157.'
        } },
        { list: [
          'ACK received with value y, [[y > SendBase]]: SendBase = y; restart the timer if any segments are still unACKed (same as before).',
          'Otherwise it is a duplicate ACK: increment the duplicate-ACK count for y; when the count reaches [[3]], resend the segment with [[sequence number y]].'
        ] },
        { p: 'Why wait for three instead of one? Duplicate ACKs are also caused by [[segments reordered in the network]], not just losses. A reordered segment typically causes only one or two duplicates before the gap fills by itself. Waiting for three makes it much more likely the segment is really lost, so TCP avoids [[unnecessary retransmissions]].' },
        { trap: '“Three duplicate ACKs” means the original ACK plus three duplicates = four identical ACKs. The segment resent is the one starting at the duplicated ACK number y (the next expected byte), not the most recent segment sent.' }
      ]
    },
    {
      title: 'Is TCP Go-Back-N or Selective Repeat?',
      src: 'text',
      blocks: [
        { p: 'GBN-like: TCP ACKs are [[cumulative]], correctly received out-of-order segments are not individually ACKed, and the sender only needs [[SendBase and NextSeqNum]]. SR-like: many TCPs [[buffer correctly received out-of-order segments]], and a timeout resends [[only one segment]], not the whole window.' },
        { table: {
          head: ['Feature', 'Go-Back-N', 'Selective Repeat', 'TCP'],
          rows: [
            ['ACKs', 'Cumulative', 'Individual per packet', 'Cumulative (SACK option adds selective)'],
            ['Sender bookkeeping', 'send_base, nextseqnum', 'ACKed flag per packet', 'SendBase, NextSeqNum'],
            ['Out-of-order arrivals', 'Discarded', 'Buffered', 'Usually buffered (implementor’s choice)'],
            ['Timers', 'One (oldest unACKed)', 'One per packet', 'One (oldest unACKed)'],
            ['On timeout, resend', 'Packet n and all later ones', 'Only the timed-out packet', 'Only the oldest unACKed segment'],
            ['Extra trick', '—', '—', 'Fast retransmit on 3 duplicate ACKs']
          ]
        } },
        { p: 'Example: segments 1, 2, …, N all arrive in order, and only the ACK for segment n < N is lost; the other N − 1 ACKs arrive before their timeouts. GBN would resend n, n + 1, …, N. TCP resends [[at most one segment]], n — and [[not even that]] if the ACK for n + 1 arrives before n’s timeout.' },
        { def: 'Selective acknowledgment (SACK, RFC 2018)', text: 'A proposed TCP modification that lets the receiver acknowledge out-of-order segments selectively instead of only cumulatively. Combined with selective retransmission (skipping segments already selectively ACKed), TCP looks a lot like SR. Hence TCP’s error recovery is best described as a [[hybrid of GBN and SR]].' },
        { game: 'window-lab', text: 'Drop packets and ACKs in GBN and SR side by side, then predict how TCP’s cumulative ACKs plus single timer would behave differently.' }
      ]
    }
  ],
  recall: [
    { q: 'Define SampleRTT.', a: 'Time from when a segment is sent (passed to IP) until its acknowledgment is received.' },
    { q: 'How many segments does TCP time at once, and which segments are never timed?', a: 'One at a time (about one sample per RTT); retransmitted segments are never used for SampleRTT.' },
    { q: 'Why no SampleRTT for retransmitted segments?', a: 'The ACK is ambiguous: it could acknowledge the original or the retransmission, so the sample could be wildly wrong.' },
    { q: 'EstimatedRTT formula and α?', a: 'EstimatedRTT = (1 − α)·EstimatedRTT + α·SampleRTT, α = 0.125.' },
    { q: 'DevRTT formula and β?', a: 'DevRTT = (1 − β)·DevRTT + β·|SampleRTT − EstimatedRTT|, β = 0.25.' },
    { q: 'TimeoutInterval formula and initial value?', a: 'EstimatedRTT + 4·DevRTT; initially 1 s.' },
    { q: 'Why is EstimatedRTT called an EWMA?', a: 'It is a weighted average where a sample’s weight shrinks by a factor (1 − α) at every update — exponential decay, so recent samples count more.' },
    { q: 'What goes wrong with a timeout that is too short? Too long?', a: 'Too short: premature timeouts and unnecessary retransmissions. Too long: slow reaction to segment loss.' },
    { q: 'Why do SampleRTT values vary?', a: 'Congestion (queuing) in routers and varying load on the end systems.' },
    { q: 'What happens to the timeout on each timer expiration?', a: 'It doubles (retransmit the oldest unACKed segment); it is recomputed from the formula when the timer is next started after new data or an ACK.' },
    { q: 'What is SendBase?', a: 'The sequence number of the oldest unacknowledged byte.' },
    { q: 'Sender action on ACK y > SendBase?', a: 'SendBase = y; restart the timer if any segments are still unACKed.' },
    { q: 'The three events of the simplified TCP sender?', a: 'Data received from the application above; timer timeout; ACK received.' },
    { q: 'Receiver action for an in-order segment when all earlier data is already ACKed?', a: 'Delayed ACK: wait up to 500 ms for the next in-order segment, then send an ACK if none arrives.' },
    { q: 'Receiver action when an out-of-order segment reveals a gap?', a: 'Immediately send a duplicate ACK carrying the next expected byte (the lower end of the gap).' },
    { q: 'What triggers fast retransmit, and what is resent?', a: 'Three duplicate ACKs (4 ACKs with the same value y): resend the segment starting at y before its timer expires.' },
    { q: 'After a timeout, which segments does TCP resend?', a: 'Only the oldest unacknowledged one; later ones are not resent if their ACKs arrive before the new timeout.' },
    { q: 'What does the receiver do with a retransmitted segment it already has?', a: 'Discards the duplicate bytes and re-sends the cumulative ACK.' },
    { q: 'Is TCP GBN or SR?', a: 'A hybrid: cumulative ACKs and SendBase/NextSeqNum like GBN; buffering out-of-order data, resending only one segment, and SACK like SR.' }
  ]
});
