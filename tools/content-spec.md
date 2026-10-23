# Content spec — Networking midterm study site

This site is a cram-focused study guide for a midterm covering Kurose & Ross,
*Computer Networking: A Top-Down Approach* (8th ed.) chapters 1–3 (through
§3.5.4), plus the lecture material summarised in the class cheat sheet.

Every section of the site has two data files, written as plain JavaScript that
calls global registration functions (no modules, no imports, no build step):

```
data/guide/<id>.js   →  NET.addSection({...})
data/quiz/<id>.js    →  NET.addQuestions('<id>', [...])
```

Files must be valid ES2017 that runs in a browser via a classic `<script>` tag.
Use plain double- or single-quoted strings or template literals. Do not put
literal newlines inside quoted strings; use `\n` (or a template literal).
Validate with `node tools/validate.js` before finishing (it loads every data
file and checks the schema).

## Sources (read these)

- Cheat sheet text: `C:/Users/Ashton/AppData/Local/Temp/netmid/cheat_utf8.txt`.
  The cheat sheet is the professor's lecture distilled. **Every bullet that maps
  to your section must be taught in the guide and tested by at least one
  question.** Page refs like `p.83–89` are lecture-slide pages.
- Textbook text, split by section:
  `C:/Users/Ashton/AppData/Local/Temp/netmid/tb/*.txt`
  (`ch1_problems.txt`, `ch2_problems.txt`, `ch3_problems.txt` hold the end-of-
  chapter Review Questions R# and Problems P#).
- PDF extraction artifacts: `#` usually means `×` (e.g. `2.5 # 108 m/s` is
  2.5 × 10^8 m/s); exponents are flattened (`108` → 10^8); Greek letters
  (α, β) and some symbols are dropped. Reconstruct them carefully.

## Section object (guide file)

```js
NET.addSection({
  id: 'dns',                 // given to you; also the file name
  unit: 2,                   // 1 = Foundations (Ch 1), 2 = Application layer (Ch 2), 3 = Transport layer (Ch 3)
  order: 13,                 // given to you; global ordering
  title: 'DNS, the Internet’s directory',
  short: 'DNS',              // ≤ 18 chars, for nav
  cheat: 'p.111–122',        // lecture pages from the cheat sheet; '' if none
  text: '§2.4',              // textbook sections
  minutes: 25,               // honest estimate of study time for the guide
  summary: 'Two or three sentences: what this is and why it matters on the exam.',
  mustKnow: [                // 6–12 items. "If you remember nothing else."
    'DNS queries go over [[UDP port 53]].',
    '...'
  ],
  topics: [                  // the teaching content, in teaching order
    {
      title: 'Why DNS is distributed',
      src: 'cheat',          // 'cheat' (on cheat sheet / lectures), 'text' (textbook only), or 'both'
      blocks: [ /* see block types */ ]
    }
  ],
  recall: [                  // 10–20 rapid "close the book" prompts → also used as flashcards
    { q: 'What 3 levels make up the DNS hierarchy?', a: 'Root, TLD, authoritative.' }
  ]
});
```

### Block types (inside `topics[].blocks`)

Each block is an object with exactly one of these shapes:

```js
{ p: 'Paragraph. Inline markup allowed.' }
{ list: ['item', 'item'] }                          // unordered bullets
{ steps: ['first', 'then', 'finally'], title: 'Optional title' }  // ONLY for a real sequence/procedure
{ def: 'Term', text: 'Definition.' }
{ formula: 'd_{trans} = L / R',
  where: [['L', 'packet length (bits)'], ['R', 'link rate (bits/s)']],
  note: 'Optional: when to use it / units trap.' }
{ table: { head: ['', 'TCP', 'UDP'], rows: [['Setup', '3-way handshake', 'None']] }, caption: 'Optional' }
{ trap: 'Common exam trap / misconception and the correct version.' }
{ example: { q: 'Worked example problem (with numbers).', a: 'Full worked solution, step by step. Use \n for line breaks.' } }
{ code: 'from socket import *\nserverPort = 12000', caption: 'Optional' }   // python only
{ diagram: 'dns-iterative' }                        // see diagram list
{ game: 'dns-resolver', text: 'Why to play it: one sentence.' }   // see game list
```

`example.a` is hidden until the reader clicks "Show solution" — use worked
examples generously; they are active recall.

### Inline markup (all strings: p, list, def, trap, q, a, choices, why, …)

- `**bold**` for emphasis (sparingly).
- `` `code` `` for code, header names, commands (`GET`, `Connection: close`, `recvfrom()`).
- `[[key term]]` marks the thing a student must recall. In the guide's
  "recall mode" these become click-to-reveal blanks, turning the guide into a
  cloze test. Use 1–3 per paragraph/list item, on the *answer-worthy* part
  (a number, a name, a rule), not on filler words. Do NOT use `[[...]]` in quiz questions.
- `_{x}` subscript, `^{x}` superscript: `d_{prop}`, `2^{k}`, `10^{8}`.
- `\n` line break.
- Do NOT write HTML; `<`, `>` and `&` are escaped automatically (write `N ≤ 2^{k-1}`, `a < b` freely).
- Never use `*` for multiplication (it collides with italics markup). Use `×` or `·`.
  Single `*` is not supported as italics — use `**bold**` or nothing.

### Diagram keys you may reference (`{ diagram: key }`)

These are hand-drawn SVGs built into the site. Use only these keys:

| key | shows |
|---|---|
| `stack` | five-layer Internet stack with example protocols and PDU names |
| `encapsulation` | M → Ht·M → Hn·Ht·M → Hl·Hn·Ht·M across host, switch, router, host (layers each device implements) |
| `delay-components` | nodal delay at a router: processing, queuing, transmission, propagation |
| `store-forward` | store-and-forward: packet of L bits across N links; N·L/R |
| `network-of-networks` | tier-1 ISPs, regional ISPs, access ISPs, IXP, content-provider network |
| `http-nonpersistent` | timing: TCP SYN / SYNACK (1 RTT) + request/response (1 RTT) + transmit file |
| `email-flow` | user agent → sender mail server → (SMTP) → receiver mail server → user agent (IMAP/HTTP) |
| `dns-iterative` | host, local DNS, root, TLD, authoritative; 8 numbered messages, iterative |
| `dns-recursive` | same, recursive chain |
| `udp-segment` | UDP header: source port, dest port, length, checksum (32 bits wide), data |
| `tcp-segment` | TCP header layout (ports, seq, ack, header length, flags, rwnd, checksum, urgent ptr, options, data) |
| `stop-and-wait` | timing: first bit at t=0, last bit at L/R, ACK back at RTT + L/R |
| `pipelining` | timing: 3 packets back-to-back vs stop-and-wait |
| `gbn-window` | sender sequence space: acked / sent-not-acked / usable / not usable, send_base, nextseqnum, window N |
| `sr-windows` | SR sender and receiver windows side by side |
| `tcp-handshake` | SYN (client_isn) → SYNACK (server_isn, ack client_isn+1) → ACK (+ maybe data) |

### Game keys you may reference (`{ game: key, text }`)

| key | what the player does |
|---|---|
| `encap` | builds and strips headers layer by layer; names each PDU; says which layers a switch/router processes |
| `delaylab` | animated link: computes transmission, propagation, store-and-forward, end-to-end delays and throughput |
| `number-crunch` | endless randomized calculation drills for every formula in the course |
| `match-blitz` | rapid-fire sorting: protocol → layer, protocol → transport, protocol → port |
| `dns-resolver` | plays the local DNS server; picks which server to ask next; caching across rounds |
| `http-timeline` | computes page-load time for non-persistent / parallel / persistent / pipelined HTTP and sees the timeline |
| `http-dissect` | labels parts of real HTTP request/response messages |
| `code-order` | reorders shuffled Python UDP/TCP client and server code (Parsons problems) |
| `demux` | routes arriving segments to the correct UDP/TCP socket by port / 4-tuple |
| `checksum` | computes a one's-complement checksum with wraparound, then verifies at the receiver |
| `rdt-sim` | plays the rdt2.0/2.1/2.2/3.0 sender or receiver and chooses the right FSM action per event |
| `window-lab` | GBN vs Selective Repeat sliding windows: drop packets/ACKs, predict retransmissions |
| `seq-ack` | fills in TCP sequence and acknowledgment numbers on a segment exchange |
| `rtt-estimator` | computes EstimatedRTT, DevRTT and TimeoutInterval sample by sample |

## Question objects (quiz file)

```js
NET.addQuestions('dns', [
  { id: 'dns-01', d: 1, type: 'mc', src: 'cheat',
    q: 'DNS queries are normally carried by which transport protocol and port?',
    choices: ['TCP port 53', 'UDP port 53', 'UDP port 80', 'TCP port 25'],
    a: 1,
    why: 'Explanation shown after answering. Say why the right answer is right AND why the tempting wrong ones are wrong.' },
  ...
]);
```

Common fields on every question:

- `id`: `'<sectionId>-NN'` (two+ digits, unique within the file, stable).
- `d`: difficulty — `1` easy (recall a fact/definition), `2` medium (apply, distinguish, one-step calculation, explain why), `3` hard (multi-step calculation, scenario analysis, edge cases, traps, most textbook P-problems).
- `type`: one of `mc`, `multi`, `tf`, `num`, `short`, `order`.
- `src`: `'cheat'` (tests lecture/cheat-sheet material), `'text'` (textbook-only material), or a textbook exercise reference `'ch1-R13'`, `'ch1-P7'`, `'ch3-P22'` (chapter-R#/P#; add a part letter if split: `'ch1-P7b'`).
- `ctx` (optional): shared scenario text shown above the question — use it to split a multi-part textbook problem into several standalone questions (repeat the same `ctx` string on each part).
- `q`: the question (inline markup ok, but no `[[...]]`).
- `why`: explanation / worked solution. Mandatory. For calculations show every step with units.

Per type:

| type | extra fields | grading |
|---|---|---|
| `mc` | `choices` (3–5 strings), `a` (index, 0-based) | auto |
| `multi` | `choices` (4–6), `a` (array of indices, ≥ 2 correct) — question text must say "Select all that apply." | auto, all-or-nothing |
| `tf` | `a` (`true`/`false`) | auto |
| `num` | `a` (number), `unit` (string, e.g. `'ms'`, `'%'`, `'bits'`, `''`), optional `tol` (relative tolerance, default 0.02) | auto |
| `short` | `a` (model answer, 1–4 sentences), `keys` (array of 2–6 key ideas; each may list synonyms separated by `|`, e.g. `'stateless|no state'`) | student types an answer, sees model answer + which key ideas they hit, then self-grades |
| `order` | `items` (array in the CORRECT order, 3–8 items) | auto (UI shuffles) |

Rules for questions:

- 30–50 questions per section (more for calculation-heavy sections). Mix: ~55–65% `mc`/`multi`/`tf`, the rest `short`/`num`/`order`. Every section needs at least 6 `short` and, where the material has numbers, at least 6 `num`.
- Difficulty spread per section: roughly 30% d1, 40% d2, 30% d3.
- **Include every textbook Review Question and Problem that belongs to your sections** (unless it requires an external resource: Wireshark, a website, an applet, "in your city", a programming assignment — adapt applet ones into a computed question when possible). Split multi-part problems into separate questions sharing `ctx`. Prefer `num` when a part has a numeric answer; `short` when it asks to explain. Tag `src` with the exercise id.
- Distractors must be plausible — use real misconceptions (TCP vs UDP swaps, RTT counting off by one, transmission vs propagation, bits vs bytes, 2-tuple vs 4-tuple, cumulative vs selective ACK).
- Calculation answers: **compute them with Python** and double-check units (bits vs bytes, ms vs s, kbps = 10^3 bps, Mbps = 10^6 bps unless the textbook problem says otherwise). For `num`, put the expected unit in `unit` and say in `q` which unit to answer in.
- Never ask something whose answer depends on opinion or on information not in the sources.
- Do not repeat the same question in two phrasings in one section, except as a deliberate easy→hard ladder.
- `why` should teach: someone who got it wrong must understand afterwards.

## Writing style

Plain, direct, specific. Sentence case. No filler ("In this section we will…"),
no emoji, no hype. Prefer concrete numbers and examples. Teach the *why*.
Write for a student cramming the night before: dense but clear. Use the
cheat sheet's terminology exactly where it has one (e.g. "six design
questions", "island problem", "universal service", "message-oriented").

## Before you finish

1. Coverage check: walk the cheat-sheet bullets mapped to your sections one by one and confirm each is taught in a topic AND tested by a question. Walk the textbook subsections too.
2. Answer-key check: re-read every question; confirm `a` indexes the correct choice, numbers were computed (Python), `order.items` is in correct order, `multi` answers are complete.
3. Run `node tools/validate.js` from the repo root and fix every error.
