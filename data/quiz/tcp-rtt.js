NET.addQuestions('tcp-rtt', [
  // ---------- SampleRTT ----------
  { id: 'tcp-rtt-01', d: 1, type: 'mc', src: 'cheat',
    q: 'What is TCP’s SampleRTT for a segment?',
    choices: ["The time from when the segment is sent until the receiving application reads it", "The average round-trip time over the last eight segments", "The one-way propagation delay from sender to receiver", "The time from when the segment is sent (passed to IP) until an acknowledgment for it is received"],
    a: 3,
    why: 'SampleRTT is measured at the sender: from handing the segment to IP until its ACK comes back — a full round trip including queuing and processing delays. It is one raw measurement; the smoothed value is EstimatedRTT (an EWMA, not a plain average of the last 8 samples).' },

  { id: 'tcp-rtt-02', d: 1, type: 'tf', src: 'cheat',
    q: 'TCP measures a SampleRTT for every segment it transmits.',
    a: false,
    why: 'False. Most TCP implementations take only one SampleRTT measurement at a time: only one transmitted-but-unacknowledged segment is being timed at any moment, which gives roughly one new sample per RTT.' },

  { id: 'tcp-rtt-03', d: 1, type: 'tf', src: 'cheat',
    q: 'TCP never computes a SampleRTT for a segment that has been retransmitted.',
    a: true,
    why: 'True (Karn’s algorithm). TCP measures SampleRTT only for segments transmitted once, because the ACK for a retransmitted segment is ambiguous: it might acknowledge the original transmission or the retransmission.' },

  { id: 'tcp-rtt-04', d: 2, type: 'mc', src: 'cheat',
    q: 'A segment is sent at t = 0, its timer expires at t = 1.0 s, it is retransmitted, and an ACK covering it arrives at t = 1.1 s. What SampleRTT does TCP record from this exchange?',
    choices: ["1.1 s", "None", "0.1 s", "0.55 s, the average of the two possibilities"],
    a: 1,
    why: 'TCP never takes a SampleRTT for a retransmitted segment. The ACK could belong to the original (RTT 1.1 s) or to the retransmission (RTT 0.1 s); either guess could badly skew EstimatedRTT, so the exchange produces no sample.' },

  { id: 'tcp-rtt-05', d: 2, type: 'short', src: 'ch3-P33',
    q: 'In Section 3.5.3, we discussed TCP’s estimation of RTT. Why do you think TCP avoids measuring the SampleRTT for retransmitted segments?',
    a: 'Because the measurement is ambiguous. When the ACK arrives after a retransmission, the sender cannot tell whether it acknowledges the original transmission or the retransmission. Timing from the original overestimates the RTT if the retransmission was the one ACKed; timing from the retransmission underestimates it if a late ACK of the original arrived. Either error corrupts EstimatedRTT and the timeout, so TCP skips such samples.',
    keys: ['ambiguous|cannot tell|can’t tell|don’t know', 'original or the retransmission|which transmission|which copy', 'overestimate|too large|too big', 'underestimate|too small', 'EstimatedRTT|timeout'],
    why: 'Concrete case: sent at t = 0, timeout at 1 s, retransmitted, ACK at 1.1 s. The true RTT could be 1.1 s (original merely slow) or 0.1 s (original lost). This is Karn’s algorithm: only segments transmitted exactly once are timed.' },

  { id: 'tcp-rtt-06', d: 1, type: 'mc', src: 'cheat',
    q: 'Why does TCP average SampleRTT values instead of simply using the most recent sample?',
    choices: ["Because SampleRTT can be measured only once per connection, so that one value must be reused", "Because routers report an average RTT in the IP header that the TCP sender must match", "Because the newest sample always includes the receiver’s 500 ms delayed-ACK wait", "Samples fluctuate because of congestion in routers and varying end-system load, so a single sample may be atypical"],
    a: 3,
    why: 'RTT samples vary from segment to segment with queuing in congested routers and with the load on the end systems, so any single SampleRTT may not represent the typical RTT. An EWMA (EstimatedRTT) smooths these fluctuations. Samples arrive about once per RTT, and routers report nothing about RTT.' },

  // ---------- Timeout length ----------
  { id: 'tcp-rtt-07', d: 2, type: 'multi', src: 'cheat',
    q: 'Which statements about choosing TCP’s timeout value are correct? Select all that apply.',
    choices: ["A timeout that is too short causes premature timeouts", "The best timeout equals the most recent SampleRTT", "A timeout that is too long causes the receiver to discard more duplicate segments", "A timeout that is too long makes TCP react slowly to segment loss", "The timeout must be larger than the RTT, or unnecessary retransmissions occur"],
    a: [0, 3, 4],
    why: 'Too short → premature timeouts and needless retransmissions (the ACK was still on its way). Too long → slow reaction to real losses and long transfer delays. A long timeout creates fewer duplicates, not more; and a timeout equal to the latest SampleRTT would fire on roughly every above-average RTT — which is why TCP uses EstimatedRTT plus a 4·DevRTT margin.' },

  // ---------- EWMA formulas ----------
  { id: 'tcp-rtt-08', d: 1, type: 'mc', src: 'cheat',
    q: 'What value of α does RFC 6298 recommend in EstimatedRTT = (1 − α)·EstimatedRTT + α·SampleRTT?',
    choices: ["0.5", "0.125", "0.875", "0.25"],
    a: 1,
    why: 'α = 0.125 = 1/8, so EstimatedRTT = 0.875·EstimatedRTT + 0.125·SampleRTT. 0.25 is β (for DevRTT), and 0.875 is the weight 1 − α on the old estimate — a common swap.' },

  { id: 'tcp-rtt-09', d: 1, type: 'mc', src: 'cheat',
    q: 'What is the recommended value of β in DevRTT = (1 − β)·DevRTT + β·|SampleRTT − EstimatedRTT|?',
    choices: ["0.25", "0.75", "4", "0.125"],
    a: 0,
    why: 'β = 0.25, so DevRTT = 0.75·DevRTT + 0.25·|SampleRTT − EstimatedRTT|. 0.125 is α (EstimatedRTT), 0.75 is the weight 1 − β on the old DevRTT, and 4 is the multiplier on DevRTT in TimeoutInterval.' },

  { id: 'tcp-rtt-10', d: 1, type: 'mc', src: 'cheat',
    q: 'How does TCP compute its retransmission TimeoutInterval?',
    choices: ["SampleRTT + 4 · DevRTT", "EstimatedRTT + 4 · DevRTT", "2 · EstimatedRTT", "4 · EstimatedRTT + DevRTT"],
    a: 1,
    why: 'TimeoutInterval = EstimatedRTT + 4·DevRTT: the smoothed RTT plus a safety margin of four deviations. It uses the smoothed EstimatedRTT, not the latest raw SampleRTT, and the 4 multiplies DevRTT, not EstimatedRTT.' },

  { id: 'tcp-rtt-11', d: 1, type: 'mc', src: 'cheat',
    q: 'Figure 3.32 plots SampleRTT and EstimatedRTT (α = 1/8) for a real connection. How do the two curves compare, and why?',
    choices: ["The curves are identical, because α = 1/8 makes the estimate follow each sample exactly", "EstimatedRTT lies above every SampleRTT, because it includes a safety margin", "EstimatedRTT stays constant at its initial value of 1 second", "EstimatedRTT is a much smoother curve through the jumpy samples, because it is an EWMA in which recent samples weigh more and old samples’ weight decays exponentially"],
    a: 3,
    why: 'Each update moves the estimate only 1/8 of the way toward the new sample, so spikes are smoothed out; recent samples count more and an old sample’s weight shrinks by a factor 0.875 per update (exponential decay). The safety margin belongs to TimeoutInterval (4·DevRTT), not EstimatedRTT, and only α = 1 would track each sample exactly.' },

  { id: 'tcp-rtt-12', d: 2, type: 'mc', src: 'text',
    q: 'Why does TCP add 4·DevRTT to EstimatedRTT rather than a fixed margin?',
    choices: ["DevRTT corrects EstimatedRTT, which always underestimates the RTT", "DevRTT accounts for the 500 ms delayed-ACK timer", "The margin should be large when SampleRTT fluctuates a lot and small when it is stable, and DevRTT measures exactly that fluctuation", "RFC 6298 requires the timeout to be at least four RTTs"],
    a: 2,
    why: 'The timeout must be at least EstimatedRTT but not much larger. A highly variable network needs a wide margin to avoid premature timeouts; a stable one should keep the margin small to react quickly to loss. DevRTT, an EWMA of |SampleRTT − EstimatedRTT|, scales the margin automatically.' },

  // ---------- One-step calculation chain ----------
  { id: 'tcp-rtt-13', d: 2, type: 'num', src: 'cheat',
    ctx: 'Current values: EstimatedRTT = 200 ms, DevRTT = 25 ms. A new SampleRTT of 160 ms arrives. Use α = 0.125, β = 0.25 and the RFC 6298 order: update DevRTT with the previous EstimatedRTT, then update EstimatedRTT.',
    q: 'What is the new EstimatedRTT? Answer in ms.',
    a: 195, unit: 'ms', tol: 0.005,
    why: 'EstimatedRTT = 0.875 × 200 + 0.125 × 160 = 175 + 20 = 195 ms. (This value is the same whichever update order you use.)' },

  { id: 'tcp-rtt-14', d: 2, type: 'num', src: 'cheat',
    ctx: 'Current values: EstimatedRTT = 200 ms, DevRTT = 25 ms. A new SampleRTT of 160 ms arrives. Use α = 0.125, β = 0.25 and the RFC 6298 order: update DevRTT with the previous EstimatedRTT, then update EstimatedRTT.',
    q: 'What is the new DevRTT? Answer in ms.',
    a: 28.75, unit: 'ms', tol: 0.005,
    why: 'DevRTT = 0.75 × 25 + 0.25 × |160 − 200| = 18.75 + 10 = 28.75 ms. The absolute value matters: the sample is below the estimate, but the deviation is +40. (Plugging in the new EstimatedRTT of 195 ms instead gives 0.75 × 25 + 0.25 × 35 = 27.5 ms — the other convention.)' },

  { id: 'tcp-rtt-15', d: 2, type: 'num', src: 'cheat',
    ctx: 'Current values: EstimatedRTT = 200 ms, DevRTT = 25 ms. A new SampleRTT of 160 ms arrives. Use α = 0.125, β = 0.25 and the RFC 6298 order: update DevRTT with the previous EstimatedRTT, then update EstimatedRTT.',
    q: 'What is the new TimeoutInterval? Answer in ms.',
    a: 310, unit: 'ms', tol: 0.005,
    why: 'TimeoutInterval = EstimatedRTT + 4 · DevRTT = 195 + 4 × 28.75 = 195 + 115 = 310 ms. The timeout went up even though the sample went down: the large deviation widened the safety margin. (Other convention: 195 + 4 × 27.5 = 305 ms.)' },

  // ---------- Problem P31 ----------
  { id: 'tcp-rtt-16', d: 2, type: 'num', src: 'ch3-P31',
    ctx: 'Suppose that the five measured SampleRTT values are 106 ms, 120 ms, 140 ms, 90 ms, and 115 ms. Use α = 0.125 and assume EstimatedRTT was 100 ms just before the first of these samples; use β = 0.25 and assume DevRTT was 5 ms just before the first sample. Compute EstimatedRTT, DevRTT and TimeoutInterval after each sample (this site’s convention, RFC 6298: update DevRTT with the previous EstimatedRTT, then EstimatedRTT).',
    q: 'What is EstimatedRTT after the first sample (106 ms)? Answer in ms.',
    a: 100.75, unit: 'ms', tol: 0.002,
    why: 'EstimatedRTT = 0.875 × 100 + 0.125 × 106 = 87.5 + 13.25 = 100.75 ms.' },

  { id: 'tcp-rtt-17', d: 2, type: 'num', src: 'ch3-P31',
    ctx: 'Suppose that the five measured SampleRTT values are 106 ms, 120 ms, 140 ms, 90 ms, and 115 ms. Use α = 0.125 and assume EstimatedRTT was 100 ms just before the first of these samples; use β = 0.25 and assume DevRTT was 5 ms just before the first sample. Compute EstimatedRTT, DevRTT and TimeoutInterval after each sample (this site’s convention, RFC 6298: update DevRTT with the previous EstimatedRTT, then EstimatedRTT).',
    q: 'What is the TimeoutInterval after the first sample? Answer in ms.',
    a: 121.75, unit: 'ms', tol: 0.002,
    why: 'DevRTT = 0.75 × 5 + 0.25 × |106 − 100| = 3.75 + 1.5 = 5.25 ms (using the previous EstimatedRTT, 100).\nEstimatedRTT = 0.875 × 100 + 0.125 × 106 = 100.75 ms.\nTimeoutInterval = 100.75 + 4 × 5.25 = 100.75 + 21 = 121.75 ms.\n(Other convention, DevRTT with the new EstimatedRTT: 0.75 × 5 + 0.25 × 5.25 = 5.0625 → TimeoutInterval = 121.0 ms.)' },

  { id: 'tcp-rtt-18', d: 3, type: 'num', src: 'ch3-P31',
    ctx: 'Suppose that the five measured SampleRTT values are 106 ms, 120 ms, 140 ms, 90 ms, and 115 ms. Use α = 0.125 and assume EstimatedRTT was 100 ms just before the first of these samples; use β = 0.25 and assume DevRTT was 5 ms just before the first sample. Compute EstimatedRTT, DevRTT and TimeoutInterval after each sample (this site’s convention, RFC 6298: update DevRTT with the previous EstimatedRTT, then EstimatedRTT).',
    q: 'What is EstimatedRTT after all five samples? Answer in ms.',
    a: 106.72, unit: 'ms', tol: 0.002,
    why: 'Apply EstimatedRTT = 0.875 · EstimatedRTT + 0.125 · SampleRTT five times:\n106: 0.875 × 100 + 13.25 = 100.75\n120: 0.875 × 100.75 + 15 = 103.16\n140: 0.875 × 103.16 + 17.5 = 107.76\n90: 0.875 × 107.76 + 11.25 = 105.54\n115: 0.875 × 105.54 + 14.375 = 106.72 ms\nThe estimate barely moves (100 → 106.7) while the samples swing from 90 to 140: EWMA smoothing. EstimatedRTT does not depend on the DevRTT update order.' },

  { id: 'tcp-rtt-19', d: 3, type: 'num', src: 'ch3-P31',
    ctx: 'Suppose that the five measured SampleRTT values are 106 ms, 120 ms, 140 ms, 90 ms, and 115 ms. Use α = 0.125 and assume EstimatedRTT was 100 ms just before the first of these samples; use β = 0.25 and assume DevRTT was 5 ms just before the first sample. Compute EstimatedRTT, DevRTT and TimeoutInterval after each sample (this site’s convention, RFC 6298: update DevRTT with the previous EstimatedRTT, then EstimatedRTT).',
    q: 'What is DevRTT after all five samples? Answer in ms.',
    a: 14.57, unit: 'ms', tol: 0.005,
    why: 'DevRTT = 0.75 · DevRTT + 0.25 · |SampleRTT − previous EstimatedRTT|:\n106: 0.75 × 5 + 0.25 × |106 − 100| = 5.25\n120: 0.75 × 5.25 + 0.25 × |120 − 100.75| = 8.75\n140: 0.75 × 8.75 + 0.25 × |140 − 103.16| = 15.77\n90: 0.75 × 15.77 + 0.25 × |90 − 107.76| = 16.27\n115: 0.75 × 16.27 + 0.25 × |115 − 105.54| = 14.57 ms\n(Other convention, using the just-updated EstimatedRTT: 5.06, 8.01, 14.07, 14.43, 12.89 ms.)' },

  { id: 'tcp-rtt-20', d: 3, type: 'num', src: 'ch3-P31',
    ctx: 'Suppose that the five measured SampleRTT values are 106 ms, 120 ms, 140 ms, 90 ms, and 115 ms. Use α = 0.125 and assume EstimatedRTT was 100 ms just before the first of these samples; use β = 0.25 and assume DevRTT was 5 ms just before the first sample. Compute EstimatedRTT, DevRTT and TimeoutInterval after each sample (this site’s convention, RFC 6298: update DevRTT with the previous EstimatedRTT, then EstimatedRTT).',
    q: 'What is the TimeoutInterval after all five samples? Answer in ms.',
    a: 164.99, unit: 'ms', tol: 0.005,
    why: 'TimeoutInterval = EstimatedRTT + 4 · DevRTT after each sample:\n106: 100.75 + 4 × 5.25 = 121.75\n120: 103.16 + 4 × 8.75 = 138.16\n140: 107.76 + 4 × 15.77 = 170.86\n90: 105.54 + 4 × 16.27 = 170.62\n115: 106.72 + 4 × 14.57 = 164.99 ms (about 165 ms)\nThe 140 ms spike inflates DevRTT and keeps the timeout high for several samples. (Other convention: 121.00, 135.19, 164.02, 163.28, 158.30 ms.)' },

  // ---------- Problem P32 ----------
  { id: 'tcp-rtt-21', d: 3, type: 'mc', src: 'ch3-P32a',
    ctx: 'Consider the TCP procedure for estimating RTT. Suppose that α = 0.1. Let SampleRTT_{1} be the most recent sample RTT, let SampleRTT_{2} be the next most recent sample RTT, and so on. Write S_{k} for SampleRTT_{k}.',
    q: 'For a given TCP connection, suppose four acknowledgments have been returned with corresponding sample RTTs SampleRTT_{4}, SampleRTT_{3}, SampleRTT_{2}, and SampleRTT_{1}. Express EstimatedRTT in terms of the four sample RTTs (take the first sample, S_{4}, as the initial estimate).',
    choices: ["0.1·S_{1} + 0.09·S_{2} + 0.081·S_{3} + 0.0729·S_{4}", "0.729·S_{1} + 0.081·S_{2} + 0.09·S_{3} + 0.1·S_{4}", "0.1·S_{1} + 0.09·S_{2} + 0.081·S_{3} + 0.729·S_{4}", "0.25·S_{1} + 0.25·S_{2} + 0.25·S_{3} + 0.25·S_{4}"],
    a: 2,
    why: 'Start with EstimatedRTT = S_{4}.\nAfter S_{3}: 0.9·S_{4} + 0.1·S_{3}\nAfter S_{2}: 0.9(0.9·S_{4} + 0.1·S_{3}) + 0.1·S_{2} = 0.81·S_{4} + 0.09·S_{3} + 0.1·S_{2}\nAfter S_{1}: 0.729·S_{4} + 0.081·S_{3} + 0.09·S_{2} + 0.1·S_{1}\nThe k-th most recent sample gets α(1 − α)^{k−1} = 0.1 × 0.9^{k−1}; the oldest also keeps the leftover weight of being the starting value. Weights sum to 1 (0.1 + 0.09 + 0.081 + 0.729). The 0.729·S_{1} version reverses recent and old; the version ending in 0.0729·S_{4} is missing the weight of an earlier initial estimate (0.9^{4} = 0.6561), so its weights do not sum to 1; equal 0.25 weights is a plain average, not an EWMA.' },

  { id: 'tcp-rtt-22', d: 3, type: 'short', src: 'ch3-P32b',
    ctx: 'Consider the TCP procedure for estimating RTT. Suppose that α = 0.1. Let SampleRTT_{1} be the most recent sample RTT, let SampleRTT_{2} be the next most recent sample RTT, and so on. Write S_{k} for SampleRTT_{k}.',
    q: 'Generalize your formula from part (a) for n sample RTTs.',
    a: 'EstimatedRTT = α·[S_{1} + (1 − α)·S_{2} + (1 − α)^{2}·S_{3} + … + (1 − α)^{n−2}·S_{n−1}] + (1 − α)^{n−1}·S_{n}. With α = 0.1: 0.1·Σ_{j=1}^{n−1} 0.9^{j−1}·S_{j} + 0.9^{n−1}·S_{n}. The j-th most recent sample has weight α(1 − α)^{j−1}.',
    keys: ['α(1 − α)^{j−1}|0.1·0.9^{j−1}|0.9^(j-1)|(1-a)^(j-1)', '(1 − α)^{n−1}|0.9^{n−1}|0.9^(n-1)|oldest sample', 'sum|Σ|summation', 'most recent gets α|recent samples weigh more'],
    why: 'Unroll EstimatedRTT = (1 − α)·EstimatedRTT + α·SampleRTT n − 1 times starting from S_{n}: each update multiplies every older term by (1 − α) and adds α times the newest sample. Check that the weights sum to 1: α[1 + (1 − α) + … + (1 − α)^{n−2}] = 1 − (1 − α)^{n−1}, plus (1 − α)^{n−1} for S_{n} gives 1.' },

  { id: 'tcp-rtt-23', d: 3, type: 'short', src: 'ch3-P32c',
    ctx: 'Consider the TCP procedure for estimating RTT. Suppose that α = 0.1. Let SampleRTT_{1} be the most recent sample RTT, let SampleRTT_{2} be the next most recent sample RTT, and so on. Write S_{k} for SampleRTT_{k}.',
    q: 'For the formula in part (b), let n approach infinity. Comment on why this averaging procedure is called an exponential moving average.',
    a: 'As n → ∞ the (1 − α)^{n−1} term goes to zero and EstimatedRTT = α·Σ_{j=1}^{∞} (1 − α)^{j−1}·S_{j} = 0.1·Σ 0.9^{j−1}·S_{j}. A sample’s weight falls by a factor of 0.9 for every newer sample, i.e. it decays exponentially (geometrically) with its age: recent samples dominate and old ones fade away. Hence “exponential (weighted) moving average”.',
    keys: ['0.9^{j−1}|(1 − α)^{j−1}|0.9^(j-1)', 'decays exponentially|exponential|geometric', 'recent samples weigh more|recent samples dominate|old samples fade', 'initial term vanishes|goes to zero|goes to 0'],
    why: 'With α = 0.1, a sample 10 updates old has weight 0.1 × 0.9^{9} ≈ 0.039, and one 30 updates old ≈ 0.0047: the influence of history decays exponentially. With TCP’s α = 0.125 the decay is a bit faster (factor 0.875 per update).' },

  // ---------- Timer management ----------
  { id: 'tcp-rtt-24', d: 1, type: 'mc', src: 'cheat',
    q: 'Before any RTT samples are available, what TimeoutInterval does RFC 6298 recommend?',
    choices: ["3 seconds", "500 ms", "200 ms", "1 second"],
    a: 3,
    why: 'The recommended initial TimeoutInterval is 1 second. 500 ms is the maximum delayed-ACK wait at the receiver — a different timer.' },

  { id: 'tcp-rtt-25', d: 1, type: 'mc', src: 'cheat',
    q: 'When TCP’s retransmission timer expires, what happens to the TimeoutInterval used for the next timer?',
    choices: ["It is reset to 1 second", "It is set to twice the previous value", "It is recomputed from EstimatedRTT + 4·DevRTT, using the timed-out segment as a new sample", "It is halved so that the next loss is detected faster"],
    a: 1,
    why: 'On each timeout TCP retransmits the oldest unACKed segment and doubles the timeout interval (exponential backoff) instead of deriving it from EstimatedRTT and DevRTT. A timed-out segment never yields a SampleRTT. Once the timer is restarted after new data or an ACK, the formula is used again.' },

  { id: 'tcp-rtt-26', d: 2, type: 'num', src: 'text',
    q: 'The TimeoutInterval for the oldest unacknowledged segment is 0.75 s when the timer first expires. TCP retransmits the segment; the timer expires again before any ACK arrives, and TCP retransmits once more. What timer interval is set after this second retransmission? Answer in seconds.',
    a: 3, unit: 's',
    why: 'Each timeout doubles the interval: 0.75 s expires → retransmit, new interval 1.5 s → expires → retransmit, new interval 3.0 s. The intervals grow exponentially; EstimatedRTT and DevRTT are not used again until the timer is restarted after new data or an ACK.' },

  { id: 'tcp-rtt-27', d: 2, type: 'mc', src: 'cheat',
    q: 'After several timeouts have doubled the TimeoutInterval, when does TCP go back to computing it as EstimatedRTT + 4·DevRTT?',
    choices: ["Never; once doubled, the timeout keeps growing for the rest of the connection", "Only when the connection is closed and a new one is opened with fresh state", "When the timer is next started after data arrives from the application or an ACK is received", "As soon as three duplicate ACKs have been received for the oldest segment"],
    a: 2,
    why: 'Doubling applies only to the timeout event. Whenever the timer is started after either of the other two events — data received from above, or an ACK received (with EstimatedRTT updated) — TimeoutInterval is derived from the most recent EstimatedRTT and DevRTT again.' },

  { id: 'tcp-rtt-28', d: 2, type: 'short', src: 'text',
    q: 'Why does TCP double the timeout interval after each timeout instead of recomputing it from EstimatedRTT and DevRTT?',
    a: 'A timeout is most likely caused by congestion (router queues full, packets dropped or long queuing delays). If senders kept retransmitting at the same pace they would make the congestion worse, so each retransmission waits twice as long — exponential backoff, a limited form of congestion control. It also avoids a premature timeout for a segment that will soon be acknowledged.',
    keys: ['congestion', 'retransmitting persistently makes it worse|make congestion worse|polite', 'limited form of congestion control|backoff|exponential', 'premature timeout'],
    why: 'The textbook gives both reasons: doubling avoids a premature timeout for a segment that will soon be ACKed, and it is a limited form of congestion control (Ethernet’s CSMA/CD uses a similar idea). Example: 0.75 s → 1.5 s → 3.0 s.' },

  { id: 'tcp-rtt-29', d: 3, type: 'short', src: 'ch3-P42',
    q: 'In Section 3.5.4, we discussed the doubling of the timeout interval after a timeout event. This mechanism is a form of congestion control. Why does TCP need a window-based congestion-control mechanism (as studied in Section 3.7) in addition to this doubling-timeout-interval mechanism?',
    a: 'Doubling the timeout only slows down retransmission of the segment that timed out, and only after a timeout has happened. It does not limit how much new data the sender keeps pumping into the network — other segments can still be sent at full speed. A window-based mechanism limits the amount of unacknowledged data in flight (the sending rate) all the time, so the sender actually reduces its load on a congested network instead of just retransmitting more slowly.',
    keys: ['only affects retransmission|only the timed-out segment|only retransmissions', 'does not limit new data|new segments still sent|still sends new data', 'window limits data in flight|unacknowledged data|outstanding data', 'reduce load|reduce sending rate|sending rate'],
    why: 'Picture a sender with a huge window: even with a doubled timer for its lost segment, it can keep blasting new segments into the congested router. Exponential timer backoff reacts to repeated loss of one segment; window-based congestion control regulates the whole flow (details in §3.7, beyond this midterm).' },

  { id: 'tcp-rtt-30', d: 3, type: 'short', src: 'ch3-R14f',
    q: 'True or false, and explain: Suppose that the last SampleRTT in a TCP connection is equal to 1 sec. The current value of TimeoutInterval for the connection will necessarily be ≥ 1 sec.',
    a: 'The publisher’s answer key says false: TimeoutInterval is not set from the last SampleRTT; it is EstimatedRTT + 4·DevRTT, and both are EWMAs over the whole history of samples, so one 1 s sample does not by itself fix the timeout. (Caveat: if you work the algebra with α = 1/8 and β = 1/4, the value computed right after a sample S never comes out below S, and doubling only increases it — so justify whichever answer you give.)',
    keys: ['false', 'EstimatedRTT + 4·DevRTT|EstimatedRTT + 4 DevRTT|EstimatedRTT plus 4', 'average|EWMA|history', 'not the last sample alone|not just the last sample|not only the last'],
    why: 'Expected exam answer: false, because the timeout comes from the smoothed averages, not from the most recent sample. The subtlety: right after a sample S arrives, EstimatedRTT moves to E + (S − E)/8 and DevRTT gains at least |S − E|/4, so if S > E the new timeout is at least E + (S − E)/8 + (S − E) > S, and if S < E the new EstimatedRTT alone is already above S. Example: EstimatedRTT = 0.1 s, DevRTT = 0.01 s, SampleRTT = 1 s → DevRTT = 0.2325 s, EstimatedRTT = 0.2125 s, TimeoutInterval = 1.1425 s. So a carefully argued “true” is also defensible; what earns the marks is the formula-based reasoning.' },

  // ---------- Simplified sender ----------
  { id: 'tcp-rtt-31', d: 1, type: 'mc', src: 'cheat',
    q: 'In the TCP sender, what is SendBase?',
    choices: ["The sequence number of the oldest unacknowledged byte", "The last byte the receiving application has read", "The sequence number of the next byte to be sent", "The initial sequence number chosen during the handshake"],
    a: 0,
    why: 'SendBase = oldest unacknowledged byte, so SendBase − 1 is the last byte known to be received correctly and in order. The next byte to be sent is NextSeqNum; the ISN is only the starting value of both variables.' },

  { id: 'tcp-rtt-32', d: 1, type: 'mc', src: 'text',
    q: 'How many retransmission timers does the TCP sender of Figure 3.33 (following RFC 6298) use?',
    choices: ["None — it relies only on duplicate ACKs", "One, associated with the oldest unacknowledged segment", "One per unacknowledged segment", "One per byte in the send buffer"],
    a: 1,
    why: 'Per-segment timers (as in Selective Repeat) cost considerable overhead, so RFC 6298 recommends a single retransmission timer even when many segments are outstanding; think of it as timing the oldest unACKed segment. TCP uses this timer plus (with fast retransmit) duplicate ACKs.' },

  { id: 'tcp-rtt-33', d: 2, type: 'order', src: 'cheat',
    q: 'Order the TCP sender’s actions when it receives data from the application above (simplified sender, Figure 3.33).',
    items: ['Create a TCP segment with sequence number NextSeqNum', 'If the timer is not currently running, start it', 'Pass the segment to IP', 'NextSeqNum = NextSeqNum + length(data)'],
    why: 'The segment is stamped with NextSeqNum (the byte number of its first data byte); the timer is started only if it is not already running (it times the oldest unACKed segment); the segment goes down to IP; then NextSeqNum advances by the number of data bytes.' },

  { id: 'tcp-rtt-34', d: 2, type: 'mc', src: 'cheat',
    q: 'The TCP sender receives an ACK with value y, where y > SendBase. What does it do?',
    choices: ["Sets SendBase = y and restarts the timer if any segments are still unacknowledged", "Sets SendBase = y − 1 and stops the timer, since all outstanding data is acknowledged", "Counts it as a duplicate ACK toward the three needed for a fast retransmit", "Retransmits the segment starting at byte y, because the receiver is asking for it"],
    a: 0,
    why: 'y > SendBase means the cumulative ACK covers one or more previously unACKed segments (every byte before y). SendBase moves to y, and the single timer is restarted for the new oldest unACKed segment if data is still outstanding. Resending the segment at y is the fast-retransmit response to three duplicate ACKs (y = SendBase), not to an ACK of new data.' },

  // ---------- Three scenarios ----------
  { id: 'tcp-rtt-35', d: 2, type: 'mc', src: 'cheat',
    q: 'Host A sends a segment with seq = 92 and 8 bytes of data. Host B receives it, but B’s ACK is lost. A times out and retransmits. What does B do with the retransmitted segment?',
    choices: ["Sends ACK 92 to ask for the segment again", "Discards the duplicate bytes and sends ACK 100 again", "Ignores it without sending anything", "Delivers the bytes to the application a second time"],
    a: 1,
    why: 'From the sequence number, B sees it already has bytes 92–99, so it discards them (no duplicate delivery) and re-sends the cumulative ACK 100 so A can advance SendBase. Staying silent would leave A timing out forever; ACK 92 would claim B is missing data it already has.' },

  { id: 'tcp-rtt-36', d: 2, type: 'mc', src: 'cheat',
    q: 'A sends seq 92 (8 bytes) and seq 100 (20 bytes) back to back. Both arrive, and B sends ACK 100 and ACK 120, but both ACKs are delayed past A’s timeout. What does A retransmit at the timeout?',
    choices: ["Only seq 92; seq 100 is not resent if ACK 120 arrives before the new timeout", "Only seq 100, the most recent segment", "Nothing until three duplicate ACKs arrive", "Both seq 92 and seq 100 (Go-Back-N style)"],
    a: 0,
    why: 'A timeout makes TCP retransmit only the oldest unACKed segment (seq 92) and restart the timer. When ACK 120 arrives (cumulative: everything through byte 119), SendBase jumps to 120 and seq 100 is never resent. This is a premature timeout: nothing was actually lost.' },

  { id: 'tcp-rtt-37', d: 2, type: 'mc', src: 'cheat',
    q: 'Again A sends seq 92 (8 bytes) and seq 100 (20 bytes). This time ACK 100 is lost, but ACK 120 arrives just before the timeout. What does A retransmit?',
    choices: ["Nothing — ACK 120 cumulatively acknowledges both segments", "Seq 92 only, because its ACK was lost", "Seq 100 only", "Both segments"],
    a: 0,
    why: 'ACK 120 says B has every byte through 119, which covers the lost ACK 100. SendBase moves from 92 to 120 and nothing is retransmitted (Figure 3.36) — the main payoff of cumulative ACKs.' },

  // ---------- Receiver ACK generation ----------
  { id: 'tcp-rtt-38', d: 1, type: 'mc', src: 'cheat',
    q: 'An in-order segment with the expected sequence number arrives, and all earlier data has already been acknowledged. What does the TCP receiver do (RFC 5681)?',
    choices: ["Delays the ACK: waits up to 500 ms for another in-order segment and sends an ACK if none arrives", "Sends no ACK until the application has read the data from the receive buffer", "Immediately sends an ACK for the segment, since it arrived in order", "Immediately sends a duplicate ACK for the last in-order byte it holds"],
    a: 0,
    why: 'This is the delayed-ACK rule, the only “wait” rule in Table 3.2: wait up to 500 ms so one ACK can cover two segments. If a second in-order segment arrives in time, the receiver immediately sends one cumulative ACK for both. Duplicate ACKs are for gaps.' },

  { id: 'tcp-rtt-39', d: 2, type: 'mc', src: 'cheat',
    q: 'A receiver has all bytes up to 3,999 and expects byte 4,000. A segment with seq = 5,000 arrives. What does the receiver do?',
    choices: ["Immediately sends a duplicate ACK with ACK number 4,000", "Waits up to 500 ms, then sends ACK 4,000", "Immediately sends ACK 6,000 for the new segment", "Immediately sends a NAK for byte 4,000"],
    a: 0,
    why: 'An out-of-order segment with a higher-than-expected sequence number reveals a gap, so the receiver immediately sends a duplicate ACK giving the next expected byte — the lower end of the gap, 4,000. It may buffer the new segment, but cumulative ACKs cannot acknowledge bytes beyond the gap, and TCP has no NAKs.' },

  { id: 'tcp-rtt-40', d: 2, type: 'multi', src: 'cheat',
    q: 'In which of these situations does a TCP receiver send an ACK immediately, without waiting? Select all that apply.',
    choices: ["An in-order segment arrives while another in-order segment is still waiting for its ACK", "An in-order segment arrives and all earlier data is already acknowledged", "An out-of-order segment with a higher-than-expected sequence number arrives", "A segment arrives that fills the gap, starting at the lower end of the gap"],
    a: [0, 2, 3],
    why: 'Table 3.2: two in-order segments → one immediate cumulative ACK for both; gap detected → immediate duplicate ACK; gap filled from its lower end → immediate ACK. Only an in-order segment arriving when all earlier data is already ACKed gets the delayed ACK (wait up to 500 ms for another in-order segment).' },

  { id: 'tcp-rtt-41', d: 1, type: 'tf', src: 'text',
    q: 'When a TCP receiver detects a gap in the byte stream, it sends a negative acknowledgment (NAK) naming the missing bytes.',
    a: false,
    why: 'False. TCP does not use negative acknowledgments. The receiver re-acknowledges the last in-order byte (a duplicate ACK carrying the next expected byte); three duplicate ACKs act as an implicit NAK that triggers fast retransmit.' },

  // ---------- Fast retransmit ----------
  { id: 'tcp-rtt-42', d: 1, type: 'mc', src: 'cheat',
    q: 'What triggers a TCP fast retransmit?',
    choices: ["The timer reaching half of TimeoutInterval", "A NAK from the receiver", "Three duplicate ACKs for the same data", "A single duplicate ACK"],
    a: 2,
    why: 'After three duplicate ACKs (four ACKs with the same ACK number), the sender assumes the segment after the ACKed data is lost and resends it before its timer expires. One duplicate may just be reordering; TCP has no NAKs; and there is no half-timeout rule.' },

  { id: 'tcp-rtt-43', d: 2, type: 'num', src: 'cheat',
    ctx: 'Figure 3.37: Host A sends seq 92 (8 bytes), seq 100 (20 bytes), seq 120 (15 bytes), seq 135 (6 bytes) and seq 141 (16 bytes) back to back. The segment with seq 100 is lost; all others arrive, and B buffers out-of-order segments.',
    q: 'In total, how many ACKs carrying ACK number 100 does A receive by the time it performs the fast retransmit?',
    a: 4, unit: 'ACKs',
    why: 'Seq 92 → ACK 100 (the original ACK). Seq 120, 135 and 141 each arrive out of order → three duplicate ACK 100s. Three duplicates = four ACKs with the same number, which triggers the fast retransmit of seq 100 before its timer expires.' },

  { id: 'tcp-rtt-44', d: 3, type: 'num', src: 'cheat',
    ctx: 'Figure 3.37: Host A sends seq 92 (8 bytes), seq 100 (20 bytes), seq 120 (15 bytes), seq 135 (6 bytes) and seq 141 (16 bytes) back to back. The segment with seq 100 is lost; all others arrive, and B buffers out-of-order segments.',
    q: 'After the fast retransmit, the retransmitted segment (seq 100, 20 bytes) arrives at B. What acknowledgment number does B send?',
    a: 157, unit: '',
    why: 'B already buffered bytes 120–156 (15 + 6 + 16 = 37 bytes). The retransmission fills bytes 100–119, so B now has everything from 92 through 156 in order and sends the cumulative ACK 141 + 16 = 157. Answering 120 forgets that B buffered the out-of-order segments; 156 is the last byte received, not the next one expected.' },

  { id: 'tcp-rtt-45', d: 2, type: 'short', src: 'ch3-P36',
    q: 'In Section 3.5.4, we saw that TCP waits until it has received three duplicate ACKs before performing a fast retransmit. Why do you think the TCP designers chose not to perform a fast retransmit after the first duplicate ACK for a segment is received?',
    a: 'Because a duplicate ACK does not necessarily mean loss: IP can reorder segments, and a segment that is merely delayed behind a later one triggers one (or two) duplicate ACKs before it arrives and fills the gap. Retransmitting on the first duplicate would cause many unnecessary retransmissions. Three duplicates make it very likely the segment really is lost, and it is still much faster than waiting for the timeout.',
    keys: ['reorder|out of order|reordering', 'not necessarily lost|merely delayed|delayed segment', 'unnecessary retransmissions|spurious retransmission|needless retransmission', 'likely lost|more confidence|really lost'],
    why: 'Example: n and n + 1 are sent, and n + 1 overtakes n. The receiver sends one duplicate ACK (still asking for n), then n arrives and the next ACK jumps past both. A one-duplicate rule would resend n for nothing. The receiver-side cause of duplicates is a gap “that could be the result of lost or reordered segments”.' },

  // ---------- Problems P34 / P35 ----------
  { id: 'tcp-rtt-46', d: 3, type: 'short', src: 'ch3-P34',
    ctx: 'SendBase (Section 3.5.4) is the sequence number of the oldest unacknowledged byte at the sender. LastByteRcvd (Section 3.5.5) is the number of the last byte in the data stream that has arrived from the network and been placed in the receive buffer at the receiver (that section assumes the receiver discards out-of-order segments, so this is in-order data).',
    q: 'What is the relationship between the variable SendBase in Section 3.5.4 and the variable LastByteRcvd in Section 3.5.5?',
    a: 'At any time, SendBase − 1 ≤ LastByteRcvd. SendBase − 1 is the last byte the sender knows has been received correctly and in order; the receiver may already have received more (its ACKs are still in flight or were lost), so LastByteRcvd can be larger.',
    keys: ['SendBase − 1 ≤ LastByteRcvd|SendBase-1 <= LastByteRcvd|SendBase - 1 ≤ LastByteRcvd', 'last byte the sender knows|known to be received', 'ACKs in flight|acknowledgements in the pipe|lost ACK|in transit', 'receiver may have more|can be larger|greater'],
    why: 'The sender’s knowledge lags the receiver’s state by up to an RTT. Example: B has everything through byte 499, but ACK 500 is still traveling; A still has SendBase = 300, so SendBase − 1 = 299 ≤ 499. They are equal only when every ACK has arrived and nothing is in flight.' },

  { id: 'tcp-rtt-47', d: 3, type: 'short', src: 'ch3-P35',
    ctx: 'LastByteRcvd (Section 3.5.5) is the last byte that has arrived and been placed in the receiver’s buffer (in-order data). y (Section 3.5.4) is the value in the ACK field of an acknowledgment that the sender has just received.',
    q: 'What is the relationship between the variable LastByteRcvd in Section 3.5.5 and the variable y in Section 3.5.4?',
    a: 'When the sender receives an ACK with value y, it knows the receiver has everything up through byte y − 1. The receiver may have received more since it sent that ACK (later ACKs in flight, or this ACK may be an old one with y ≤ SendBase), so y − 1 ≤ LastByteRcvd.',
    keys: ['y − 1 ≤ LastByteRcvd|y-1 <= LastByteRcvd|y - 1 ≤ LastByteRcvd', 'everything up through y − 1|bytes before y|up to y-1', 'more may have arrived|later ACKs in flight|in transit', 'old ACK|duplicate|y ≤ SendBase'],
    why: 'An ACK is a snapshot of the receiver’s state from about half an RTT earlier, so y − 1 can only be behind or equal to the receiver’s current LastByteRcvd. Together with P34: y − 1 ≤ LastByteRcvd and SendBase − 1 ≤ LastByteRcvd.' },

  // ---------- GBN vs SR vs TCP (P37) ----------
  { id: 'tcp-rtt-48', d: 3, type: 'mc', src: 'ch3-P37a',
    ctx: 'Compare GBN, SR, and TCP (no delayed ACK). Assume that the timeout values for all three protocols are sufficiently long such that five consecutive data segments and their corresponding ACKs can be received (if not lost in the channel) by the receiving host (Host B) and the sending host (Host A) respectively. Suppose Host A sends five data segments to Host B, and the second segment (sent from A) is lost. In the end, all five data segments have been correctly received by Host B. Number the segments 1–5; for TCP, write each ACK as the number of the next segment expected.',
    q: 'For Go-Back-N: how many segments has Host A sent in total and how many ACKs has Host B sent in total? What are their sequence numbers?',
    choices: ["A sends 9 segments (1–5, then 2–5); B sends 5 ACKs (1, 2, 3, 4, 5)", "A sends 10 segments (1–5 twice); B sends 9 ACKs", "A sends 9 segments (1, 2, 3, 4, 5, then 2, 3, 4, 5); B sends 8 ACKs (1, 1, 1, 1, then 2, 3, 4, 5)", "A sends 6 segments (1–5, then 2); B sends 5 ACKs (1, 3, 4, 5, 2)"],
    a: 2,
    why: 'GBN receiver: 1 arrives → ACK 1; 2 is lost; 3, 4, 5 arrive out of order and are discarded, each re-ACKing the last in-order packet → ACK 1, ACK 1, ACK 1. On the timeout A goes back to 2 and resends 2, 3, 4, 5, which B ACKs 2, 3, 4, 5. Totals: 5 + 4 = 9 segments and 4 + 4 = 8 ACKs.' },

  { id: 'tcp-rtt-49', d: 3, type: 'mc', src: 'ch3-P37a',
    ctx: 'Compare GBN, SR, and TCP (no delayed ACK). Assume that the timeout values for all three protocols are sufficiently long such that five consecutive data segments and their corresponding ACKs can be received (if not lost in the channel) by the receiving host (Host B) and the sending host (Host A) respectively. Suppose Host A sends five data segments to Host B, and the second segment (sent from A) is lost. In the end, all five data segments have been correctly received by Host B. Number the segments 1–5; for TCP, write each ACK as the number of the next segment expected.',
    q: 'For Selective Repeat: how many segments has Host A sent in total and how many ACKs has Host B sent in total? What are their sequence numbers?',
    choices: ["A sends 6 segments (1–5, then 2); B sends 5 ACKs (2, 2, 2, 2, 6)", "A sends 5 segments; B sends 5 ACKs (1, 2, 3, 4, 5)", "A sends 6 segments (1, 2, 3, 4, 5, then 2); B sends 5 ACKs (1, 3, 4, 5, then 2)", "A sends 9 segments (1–5, then 2–5); B sends 8 ACKs (1, 1, 1, 1, 2, 3, 4, 5)"],
    a: 2,
    why: 'SR ACKs each packet individually and buffers 3, 4, 5: ACK 1, ACK 3, ACK 4, ACK 5. Only packet 2’s timer expires, so only 2 is resent; B ACKs it (ACK 2) and delivers 2–5 in order. Totals: 6 segments, 5 ACKs. The “ACKs 2, 2, 2, 2, 6” pattern is TCP’s, and “9 segments, 8 ACKs” is GBN’s.' },

  { id: 'tcp-rtt-50', d: 3, type: 'mc', src: 'ch3-P37a',
    ctx: 'Compare GBN, SR, and TCP (no delayed ACK). Assume that the timeout values for all three protocols are sufficiently long such that five consecutive data segments and their corresponding ACKs can be received (if not lost in the channel) by the receiving host (Host B) and the sending host (Host A) respectively. Suppose Host A sends five data segments to Host B, and the second segment (sent from A) is lost. In the end, all five data segments have been correctly received by Host B. Number the segments 1–5; for TCP, write each ACK as the number of the next segment expected.',
    q: 'For TCP (receiver buffers out-of-order segments): how many segments has Host A sent in total and how many ACKs has Host B sent in total? What are the ACK numbers?',
    choices: ["A sends 6 segments; B sends 4 ACKs: 2, 2, 2, 6", "A sends 9 segments (1–5, then 2–5); B sends 8 ACKs: 2, 2, 2, 2, 3, 4, 5, 6", "A sends 6 segments (1–5, then 2); B sends 5 ACKs: 1, 3, 4, 5, 2", "A sends 6 segments (1, 2, 3, 4, 5, then 2); B sends 5 ACKs: 2, 2, 2, 2, then 6"],
    a: 3,
    why: 'TCP ACKs carry the next expected segment. Segment 1 → ACK 2. Segments 3, 4, 5 arrive out of order → three duplicate ACK 2s (and are buffered). Three duplicate ACKs trigger a fast retransmit of segment 2 without waiting for the timeout; B then has 1–5 → cumulative ACK 6. Totals: 6 segments, 5 ACKs (four ACK 2s and one ACK 6).' },

  { id: 'tcp-rtt-51', d: 3, type: 'mc', src: 'ch3-P37b',
    ctx: 'Compare GBN, SR, and TCP (no delayed ACK). Assume that the timeout values for all three protocols are sufficiently long such that five consecutive data segments and their corresponding ACKs can be received (if not lost in the channel) by the receiving host (Host B) and the sending host (Host A) respectively. Suppose Host A sends five data segments to Host B, and the second segment (sent from A) is lost. In the end, all five data segments have been correctly received by Host B. Number the segments 1–5; for TCP, write each ACK as the number of the next segment expected.',
    q: 'If the timeout values for all three protocols are much longer than 5 RTT, which protocol successfully delivers all five data segments in the shortest time interval?',
    choices: ["All three take the same time, because each must wait for a timeout", "Go-Back-N, because cumulative ACKs are faster to process", "TCP, because fast retransmit resends segment 2 after three duplicate ACKs without waiting for the timeout", "Selective Repeat, because it resends only segment 2"],
    a: 2,
    why: 'GBN and SR detect the loss of segment 2 only through its timeout, which here is longer than 5 RTT. TCP receives three duplicate ACKs (from segments 3, 4, 5) about one RTT after sending and fast-retransmits immediately. SR resends less than GBN, but it still waits for the timer.' },

  { id: 'tcp-rtt-52', d: 3, type: 'multi', src: 'text',
    q: 'Which features make TCP’s error recovery resemble Selective Repeat rather than Go-Back-N? Select all that apply.',
    choices: ["On a timeout, TCP retransmits only the oldest unacknowledged segment, not every later segment", "TCP acknowledgments are cumulative", "A single retransmission timer is used", "The sender keeps only SendBase and NextSeqNum", "With the SACK option (RFC 2018), the receiver can acknowledge out-of-order segments selectively", "Many TCP receivers buffer correctly received out-of-order segments"],
    a: [0, 4, 5],
    why: 'SR-like: buffering out-of-order data, resending at most one segment per timeout (none if a later cumulative ACK arrives in time), and selective acknowledgment plus selective retransmission. GBN-like: cumulative ACKs, sender state of just SendBase and NextSeqNum, and one timer. So TCP is best described as a hybrid of GBN and SR.' }
]);
