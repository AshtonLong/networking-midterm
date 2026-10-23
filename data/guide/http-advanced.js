NET.addSection({
  id: 'http-advanced',
  unit: 2,
  order: 10,
  title: 'Cookies, web caching & HTTP/2',
  short: 'Cookies, cache, H2',
  cheat: '',
  text: '§2.2.4–2.2.6',
  minutes: 35,
  summary: 'Three upgrades on top of basic HTTP. Cookies give a stateless protocol a memory of who you are; web caches (proxy servers) and the conditional GET cut response time and access-link traffic; HTTP/2 (and HTTP/3 over QUIC) beat head-of-line blocking by splitting messages into frames and interleaving them on one connection. These lecture slides were left off the cheat sheet, so expect textbook-style questions, especially the institutional-network caching calculation (P9) and frame counting (P13, P14).',
  mustKnow: [
    'Cookie technology has [[four components]]: a `Set-cookie:` header line in the HTTP [[response]], a `Cookie:` header line in later HTTP [[requests]], a [[cookie file]] on the user’s host managed by the browser, and a [[back-end database]] at the Web site.',
    'Cookies create a [[user session layer]] on top of [[stateless]] HTTP; they are controversial because of [[privacy]] (sites can combine them with account info and sell it).',
    'A Web cache, also called a [[proxy server]], is both a [[server]] (to browsers) and a [[client]] (to origin servers). It is usually purchased and installed by an [[ISP]] or institution.',
    'Caches help for two reasons: lower [[response time]] for clients and less traffic on the institution’s [[access link]] (so costly upgrades can wait). Hit rates are typically [[0.2–0.7]].',
    'Traffic intensity on a link = [[request rate × object size ÷ link rate]]. As it approaches [[1]], queuing delay grows without bound.',
    'Textbook example: 15 req/s × 1 Mbit over a 15 Mbps access link gives intensity [[1.0]]. A cache with hit rate 0.4 cuts it to [[0.6]] and the average response time to about [[1.2 s]], which beats upgrading the link to 100 Mbps (≈ 2 s) and costs much less.',
    'A [[conditional GET]] is a GET request with an [[If-Modified-Since]] header line, whose value is copied from the earlier `Last-Modified:` header. If the object is unchanged, the server replies [[304 Not Modified]] with an empty body.',
    'HTTP/1.1 suffers [[head-of-line (HOL) blocking]]: a large object at the front of a single TCP connection delays the small objects behind it. Browsers work around it with up to [[six]] parallel TCP connections.',
    'HTTP/2 splits every message into [[frames]] and [[interleaves]] them on [[one TCP connection]]. It adds [[prioritization]] (weights 1–256), [[server push]], binary framing and header compression, and leaves methods, status codes, URLs and header fields unchanged.',
    'HTTP/3 runs over [[QUIC]], a transport implemented in the application layer on top of [[UDP]]. QUIC itself provides interleaving, per-stream flow control and low-latency connection setup.'
  ],
  topics: [
    {
      title: 'Why stateless HTTP needs cookies',
      src: 'text',
      blocks: [
        { p: 'An HTTP server is [[stateless]]: it keeps no information about a client’s earlier requests. Statelessness [[simplifies server design]] and has let engineers build high-performance servers that handle thousands of simultaneous TCP connections.' },
        { p: 'Web sites often still need to [[identify users]], either to [[restrict user access]] or to [[serve content based on the user’s identity]]. HTTP does this with **cookies**, defined in [[RFC 6265]]. Most major commercial Web sites use them.' },
        { def: 'Cookie', text: 'A unique [[identification number]] that a site assigns to a browser on its first visit. The browser sends it back with every later request so the site can recognize the user and keep track of them.' }
      ]
    },
    {
      title: 'The four components of cookie technology',
      src: 'text',
      blocks: [
        { list: [
          '(1) A cookie header line in the HTTP [[response]] message: `Set-cookie: 1678`.',
          '(2) A cookie header line in the HTTP [[request]] message: `Cookie: 1678`.',
          '(3) A [[cookie file]] kept on the user’s end system and [[managed by the browser]]. It holds one line per site: the site’s hostname and its ID.',
          '(4) A [[back-end database]] at the Web site, with an entry [[indexed by the ID]].'
        ] },
        { table: {
          head: ['Component', 'Where it lives / travels', 'Who creates it'],
          rows: [
            ['`Set-cookie:` header', 'HTTP response, server → client', 'Server, on the first visit'],
            ['`Cookie:` header', 'Every later HTTP request, client → server', 'Browser, read from the cookie file'],
            ['Cookie file', 'User’s host', 'Browser (hostname + ID per site)'],
            ['Back-end database', 'Web site', 'Server (entry indexed by ID)']
          ] }, caption: 'Figure 2.10 in words' },
        { steps: [
          'Susan’s browser sends an ordinary HTTP request to Amazon. Her cookie file already holds `ebay: 8734` from an earlier eBay visit, but nothing for Amazon.',
          'Amazon’s server creates a unique identification number, [[1678]], and creates an entry in its [[back-end database]] indexed by it.',
          'Amazon’s HTTP response includes the header line `Set-cookie: 1678`.',
          'The browser appends a line with the server’s [[hostname]] and the ID (`amazon: 1678`) to its cookie file.',
          'Every later request to Amazon, even [[one week later]], carries `Cookie: 1678`. The server uses the ID for a cookie-specific action: it looks up and updates that user’s database entry.'
        ], title: 'Susan’s first visit to Amazon (Figure 2.10)' },
        { p: 'With the ID alone, Amazon does not necessarily know Susan’s name, but it knows [[exactly which pages user 1678 visited, in which order and at what times]]. Amazon uses this for its [[shopping cart]] (a list of intended purchases she pays for together at the end of the session) and for [[recommendations]] based on pages she viewed before.' },
        { p: 'If Susan registers (full name, e-mail, postal address, credit card), Amazon stores that in the database entry, which ties her name to ID 1678 and to every page she has ever visited. That is how [[one-click shopping]] works: on a later visit she need not re-enter anything.' },
        { def: 'User session layer', text: 'Cookies create a [[user session layer on top of stateless HTTP]]. For example, after you log in to Web-based e-mail (Hotmail), the browser sends cookie information with each request so the server can identify you throughout the session.' },
        { trap: 'Direction trap: `Set-cookie:` travels **server → client** inside a **response**; `Cookie:` travels **client → server** inside **requests**. The cookie file is on the **client** and the database is on the **server**. The cookie holds only an ID number; your personal data lives in the site’s database. HTTP itself stays stateless: the state is in the cookie file and the database, not in the protocol.' },
        { p: 'Privacy: cookies are [[controversial]] because they can be considered an [[invasion of privacy]]. By combining cookies with user-supplied account information, a site can learn a lot about a user and potentially [[sell this information to a third party]].' },
        { example: {
          q: 'Susan’s cookie file holds `ebay: 8734`. She visits Amazon for the first time, then reloads Amazon pages twice. (a) Which message carries a `Set-cookie:` line, and what does the server do before sending it? (b) How many of her Amazon requests carry a `Cookie:` line? (c) What is in her cookie file afterwards?',
          a: '(a) Only Amazon’s first response carries `Set-cookie: 1678`. Before sending it, the server generated the unique ID 1678 and created a back-end database entry indexed by that ID.\n(b) Her first request could not carry an Amazon cookie because none existed yet. Each of the two reloads carries `Cookie: 1678`, so the answer is **2**. The eBay ID is never sent to Amazon; the browser sends only the ID for the site being contacted.\n(c) Two lines: `ebay: 8734` and `amazon: 1678` (hostname + ID for each site).'
        } }
      ]
    },
    {
      title: 'Web caches (proxy servers)',
      src: 'text',
      blocks: [
        { def: 'Web cache (proxy server)', text: 'A network entity that satisfies HTTP requests [[on behalf of an origin Web server]]. It has its own disk storage and keeps [[copies of recently requested objects]]. A browser can be configured so that all its HTTP requests go to the cache first (RFC 7234).' },
        { steps: [
          'The browser opens a TCP connection to the [[Web cache]] and sends it an HTTP request for the object.',
          'The cache checks whether it has a local copy. On a [[hit]], it returns the object in an HTTP response to the browser.',
          'On a [[miss]], the cache opens a TCP connection to the [[origin server]] (www.someschool.edu) and sends an HTTP request. The origin server returns the object in an HTTP response.',
          'The cache [[stores a copy]] locally and sends a copy to the browser in an HTTP response over the [[existing browser–cache TCP connection]].'
        ], title: 'Browser requests http://www.someschool.edu/campus.gif through a cache' },
        { p: 'A cache is [[both a server and a client]] at the same time. It is a **server** when it receives requests from and sends responses to browsers, and a **client** when it sends requests to and receives responses from origin servers.' },
        { p: 'Who runs it: a Web cache is typically [[purchased and installed by an ISP]]. A university might install one on its campus network and configure all campus browsers to use it; a residential ISP such as Comcast might install caches and preconfigure the browsers it ships.' },
        { list: [
          '[[Reduce response time]] for client requests, especially when the bottleneck bandwidth between client and origin server is much smaller than between client and cache (often a fast LAN).',
          '[[Reduce traffic on the institution’s access link]], so the institution does not have to upgrade bandwidth as quickly. This saves money.',
          'Reduce [[Web traffic in the Internet as a whole]], which improves performance for all applications.'
        ] },
        { def: 'Hit rate', text: 'The fraction of requests a cache satisfies itself. In practice it ranges from [[0.2 to 0.7]].' },
        { p: 'This is also why the `Host:` request header exists: when the browser’s TCP connection goes to a proxy rather than the origin server, the [[proxy cache needs the Host header]] to know which server to fetch from (§2.2.3).' },
        { trap: 'A hit gets a big speed-up. A miss still pays the full Internet delay, but it is helped too, because the access link carries less traffic and so has much less queuing. In the textbook example a miss takes about 2.01 s instead of minutes. That is why the textbook says caching can reduce delay even for objects that are not cached.' }
      ]
    },
    {
      title: 'The institutional-network example (Figures 2.12 and 2.13)',
      src: 'text',
      blocks: [
        { p: 'Setup: an institutional [[100 Mbps LAN]] is connected to the Internet by a [[15 Mbps access link]] between an institution router and an Internet router. Average object size is [[1 Mbit]]; browsers request [[15 objects/s]] from origin servers all over the globe; HTTP requests are negligibly small. The [[Internet delay]], from when the Internet-side router forwards a request until it receives the response, averages [[2 s]].' },
        { p: 'Total response time = [[LAN delay + access delay + Internet delay]].' },
        { formula: 'traffic intensity = (a × L) / R',
          where: [['a', 'average rate of objects crossing the link (requests/s)'], ['L', 'average object size (bits)'], ['R', 'link transmission rate (bits/s)']],
          note: 'Same La/R as §1.4.2. Near 0, queuing delay is negligible. Below about 0.8 on this link it is tens of ms. As it approaches 1 the delay grows without bound.' },
        { list: [
          'LAN: 15 × 1 Mbit / 100 Mbps = [[0.15]] → at most tens of ms, so the LAN delay can be neglected.',
          'Access link: 15 × 1 Mbit / 15 Mbps = [[1.0]] → delay grows without bound, and the average response time is [[minutes]]. Unacceptable.'
        ] },
        { table: {
          head: ['Fix', 'Access-link intensity', 'Access delay', 'Avg response time', 'Cost'],
          rows: [
            ['Do nothing', '15 × 1 / 15 = 1.0', 'Unbounded', 'Minutes', '—'],
            ['Upgrade access link to 100 Mbps', '15 × 1 / 100 = 0.15', 'Negligible', '≈ 2 s (just the Internet delay)', 'Costly'],
            ['Install a cache, hit rate 0.4', '0.6 × 1.0 = 0.6', 'Tens of ms (intensity < 0.8)', '0.4 × 0.01 + 0.6 × 2.01 ≈ 1.21 s', 'Cheap (public-domain software on inexpensive PCs)']
          ] }, caption: 'Upgrade vs cache' },
        { p: 'With the cache, 40% of requests are satisfied on the LAN almost immediately ([[≈ 10 ms]]). Only the other 60% cross the access link, so its intensity falls from 1.0 to [[0.6]]. Average delay = 0.4 × (0.01 s) + 0.6 × (2.01 s) = [[1.21 s]], just over 1.2 s. The cache gives a **lower** response time than the 100 Mbps upgrade **and** avoids the upgrade cost.' },
        { formula: 'access delay = Δ / (1 − Δβ)',
          where: [['Δ', 'average time to send one object over the access link = L / R (s)'], ['β', 'arrival rate of objects to the access link (objects/s)'], ['Δβ', 'traffic intensity of the access link']],
          note: 'Model used in textbook Problem P9. It only works for Δβ < 1; at Δβ ≥ 1 the delay is unbounded. With a cache, β = miss rate × request rate.' },
        { example: {
          q: 'An institution’s browsers request 20 objects/s of average size 500,000 bits over a 15 Mbps access link; the Internet delay is 2 s. Use access delay = Δ/(1 − Δβ). (a) What is the average response time without a cache? (b) What is it with a cache whose hit rate is 0.5, if hits take ≈ 0 s?',
          a: '(a) Δ = L/R = 500,000 / 15,000,000 = 0.0333 s. Intensity Δβ = 0.0333 × 20 = 0.667. Access delay = 0.0333 / (1 − 0.667) = 0.1 s. Response time = 0.1 + 2 = **2.1 s**.\n(b) Only misses cross the access link: β = 0.5 × 20 = 10 objects/s, so intensity = 0.333. Access delay = 0.0333 / (1 − 0.333) = 0.05 s, and a miss takes 0.05 + 2 = 2.05 s. Weighted average = 0.5 × 0 + 0.5 × 2.05 = **1.025 s**.'
        } },
        { trap: 'Two separate averages cause most mistakes. (1) The access-link intensity uses only the **miss** traffic, so multiply by (1 − hit rate). (2) The final answer is a **weighted average** of hit time and miss time. Also check whether a problem gives the hit rate or the **miss** rate: P9 gives a miss rate of 0.4, the reverse of the textbook example.' },
        { game: 'number-crunch', text: 'Drill traffic-intensity and cache response-time calculations until the weighted average is automatic.' }
      ]
    },
    {
      title: 'CDNs: caches everywhere',
      src: 'text',
      blocks: [
        { p: 'Through [[Content Distribution Networks (CDNs)]], Web caches matter more and more. A CDN company installs many [[geographically distributed caches]] throughout the Internet, which keeps much of the traffic local.' },
        { list: [
          '[[Shared CDNs]] serve many content providers: [[Akamai]], Limelight.',
          '[[Dedicated CDNs]] serve one company’s own content: [[Google]], [[Netflix]].'
        ] },
        { p: 'CDN server placement and selection are covered in §2.6.' }
      ]
    },
    {
      title: 'The conditional GET',
      src: 'text',
      blocks: [
        { p: 'Caching introduces a new problem: the cached copy may be [[stale]], because the object on the Web server may have changed since it was cached. HTTP lets a cache check that its copy is up to date with the **conditional GET** (RFC 7232).' },
        { def: 'Conditional GET', text: 'An HTTP request message that (1) uses the [[GET]] method and (2) includes an [[If-Modified-Since:]] header line. It tells the server to send the object [[only if it has been modified since the given date]].' },
        { steps: [
          'Cache → server, on behalf of a browser: `GET /fruit/kiwi.gif HTTP/1.1` and `Host: www.exotiquecuisine.com`.',
          'Server → cache: `HTTP/1.1 200 OK`, with `Date: Sat, 3 Oct 2015 15:39:29`, `Last-Modified: Wed, 9 Sep 2015 09:23:24`, `Content-Type: image/gif`, and the object. The cache forwards the object to the browser, caches it, and [[stores the last-modified date]] with it.',
          'One week later another browser requests the same object through the cache. The cache sends `GET /fruit/kiwi.gif HTTP/1.1`, `Host: www.exotiquecuisine.com`, `If-modified-since: Wed, 9 Sep 2015 09:23:24`. The date is [[exactly the earlier Last-Modified value]].',
          'The object has not changed, so the server replies `HTTP/1.1 304 Not Modified` (with `Date:` and `Server:` headers) and an [[empty entity body]]. The cache then forwards [[its own cached copy]] to the browser.'
        ], title: 'The kiwi.gif example' },
        { p: 'Why no body in a 304: sending the object again would [[waste bandwidth]] and [[increase user-perceived response time]], especially for a large object. If the object **has** changed, the server sends it normally (`200 OK` with the new object and a new `Last-Modified:`).' },
        { trap: 'The `If-Modified-Since:` value comes from the earlier response’s `Last-Modified:` header, **not** its `Date:` header (`Date:` is only when that response was generated). A `304 Not Modified` is still a full response message with a status line and headers; only the entity body is empty.' },
        { p: 'The `Last-Modified:` header is critical for caching in both places: in the [[browser’s local cache]] and in [[network proxy caches]]. The cheat sheet’s HTTP-messages list also names `Cache-Control`, `Expires` and `ETag` as caching-related response headers; the textbook’s validation mechanism is `Last-Modified` + `If-Modified-Since`.' },
        { example: {
          q: 'A browser’s local cache holds /img/logo.png from www.site.com, received with `Date: Tue, 3 Mar 2026 08:00:00 GMT` and `Last-Modified: Mon, 2 Mar 2026 10:00:00 GMT`. Write the revalidation request, then give the response in each case: (a) the logo is unchanged, (b) the logo was edited yesterday.',
          a: 'Request:\n`GET /img/logo.png HTTP/1.1`\n`Host: www.site.com`\n`If-Modified-Since: Mon, 2 Mar 2026 10:00:00 GMT` (the Last-Modified value, not the Date value)\n(blank line)\n(a) `HTTP/1.1 304 Not Modified` with an empty body. The browser uses its cached copy.\n(b) `HTTP/1.1 200 OK` carrying the new image and a new `Last-Modified:` date, which the cache stores for next time.'
        } },
        { game: 'http-dissect', text: 'Label the parts of real HTTP request/response messages, including the Last-Modified and Date headers that caching depends on.' }
      ]
    },
    {
      title: 'HTTP/2 motivation: head-of-line blocking',
      src: 'text',
      blocks: [
        { p: 'HTTP/2 (RFC 7540) was standardized in [[2015]], the first new version since HTTP/1.1 ([[1997]]). By 2020 over 40% of the top 10 million Web sites supported it, as did most browsers.' },
        { list: [
          'Reduce perceived latency through request and response [[multiplexing over a single TCP connection]].',
          'Request [[prioritization]].',
          '[[Server push]].',
          'Efficient [[compression of HTTP header fields]].'
        ] },
        { p: 'HTTP/2 does [[not change]] HTTP methods, status codes, URLs or header fields. It changes [[how the data is formatted and transported]] between client and server.' },
        { def: 'Head-of-line (HOL) blocking', text: 'In HTTP/1.1 all of a page’s objects go over one persistent TCP connection in order. If a [[large object]] (say, a video clip near the top of the page) is first and the path has a low-to-medium-speed bottleneck link, the [[small objects behind it wait]]. The object at the head of the line blocks the rest.' },
        { p: 'HTTP/1.1 workaround: open [[multiple parallel TCP connections]] so a page’s objects are sent in parallel and the small objects arrive and render sooner.' },
        { p: 'TCP congestion control gives browsers a second, unintended incentive. It tries to give each TCP connection sharing a bottleneck an equal share, so with n connections each gets about [[1/n]] of the bandwidth. By opening several connections for one page, the browser can “cheat” and [[grab a larger share]]. Many HTTP/1.1 browsers open [[up to six]] parallel connections.' },
        { p: 'HTTP/2 aims to get rid of, or reduce, parallel connections for one page. This [[reduces the number of sockets]] servers must open and maintain and lets [[TCP congestion control operate as intended]]. With only one connection, though, HTTP/2 needs its own way to avoid HOL blocking.' },
        { example: {
          q: 'A bottleneck link is shared by 4 TCP connections belonging to other users. How much of the link does your page get with 1 TCP connection, and with 6 parallel connections?',
          a: 'Each connection gets about 1/n of the bottleneck. With 1 connection: n = 5, so you get 1/5 = **20%**. With 6 connections: n = 10, and you hold 6 of them, so 6/10 = **60%**. This is the “cheating” that HTTP/2 tries to remove.'
        } }
      ]
    },
    {
      title: 'HTTP/2 framing and interleaving',
      src: 'text',
      blocks: [
        { p: 'The HTTP/2 fix for HOL blocking: break each message into small [[frames]], and [[interleave]] the request and response messages on the [[same TCP connection]].' },
        { p: 'Textbook example: a page has one large video clip and 8 small objects, so the browser sends 9 concurrent requests and the server has 9 competing responses. All frames are the same length; the video is [[1000 frames]] and each small object is [[2 frames]]. With interleaving, the server sends one video frame, then the first frame of each small object, then a second video frame, then the last frame of each small object. All small objects are done after [[18 frames]]. Without interleaving they finish only after [[1016 frames]].' },
        { p: 'The [[framing sub-layer]] does the work. The response’s [[header field becomes one frame]] and the [[body becomes one or more frames]]. These are interleaved with the frames of other responses and sent over the single persistent TCP connection. At the client, the framing sub-layer reassembles the frames into the original messages, which the browser then processes as usual. Client requests are framed and interleaved the same way.' },
        { p: 'Breaking a message into independent frames, interleaving them and reassembling them at the other end is the [[single most important enhancement]] of HTTP/2.' },
        { p: 'The framing sub-layer also [[binary-encodes]] the frames (HTTP/1.1 is ASCII text). Binary protocols are [[more efficient to parse]], produce [[slightly smaller frames]] and are [[less error-prone]].' },
        { example: {
          q: 'A page has a 500-frame video and 4 images of 4 frames each. (a) How many frame times pass before all images are sent if the video goes first with no interleaving? (b) With interleaving (one video frame, then one frame of each unfinished image, repeat)? (c) With prioritization instead, where every image beats the video and image 1 > image 2 > image 3 > image 4: when is image 3 finished?',
          a: '(a) The whole video, then the images: 500 + 4 × 4 = **516** frame times.\n(b) Each round is 1 video frame + 4 image frames = 5 frame times, and each image needs 4 rounds, so 4 × 5 = **20** frame times.\n(c) Image 1 takes frames 1–4, image 2 frames 5–8, image 3 frames 9–12, so it is done at **12**.'
        } },
        { trap: 'Interleaving does not make the large object arrive sooner; the video actually finishes slightly later. What drops sharply is the delay before the **small** objects arrive, which is what the user perceives. The bytes sent and the single TCP connection are the same.' }
      ]
    },
    {
      title: 'HTTP/2 prioritization and server push',
      src: 'text',
      blocks: [
        { p: 'The framing sub-layer organizes messages into parallel [[streams]] of data to the same requestor. When a client sends concurrent requests, it can give each one a [[weight between 1 and 256]]; a [[higher number means higher priority]]. The server uses the weights to send frames of the highest-priority responses first. The client can also state each message’s [[dependency]] on other messages by giving the [[ID of the message it depends on]].' },
        { def: 'Server push', text: 'The server sends [[multiple responses for a single client request]]. Because the HTML base page lists the objects needed to render the page, the server can [[analyze the HTML]], identify those objects, and push them before the client asks. This [[eliminates the latency of waiting for the requests]].' },
        { trap: 'Weight 256 is the **highest** priority and 1 the lowest. With server push, the client never sends requests for the pushed objects; the server works out what to send by reading the base HTML page itself.' }
      ]
    },
    {
      title: 'HTTP/3 and QUIC',
      src: 'text',
      blocks: [
        { p: '[[QUIC]] (Chapter 3) is a new “transport” protocol [[implemented in the application layer]] over the bare-bones [[UDP]] protocol. Its features suit HTTP well: [[message multiplexing (interleaving)]], [[per-stream flow control]] and [[low-latency connection establishment]].' },
        { p: '[[HTTP/3]] is a new version of HTTP designed to run over QUIC. As of 2020 it was described in Internet drafts and not yet fully standardized. QUIC already does many HTTP/2 jobs (such as interleaving), so HTTP/3 has a [[simpler, streamlined design]].' },
        { table: {
          head: ['', 'HTTP/1.1', 'HTTP/2', 'HTTP/3'],
          rows: [
            ['Runs over', 'TCP', 'TCP (one connection per page)', 'QUIC over UDP'],
            ['Standardized', '1997', '2015 (RFC 7540)', 'Internet drafts as of 2020'],
            ['Message encoding', 'ASCII text', 'Binary frames', 'Binary frames'],
            ['Answer to HOL blocking', 'Up to ~6 parallel TCP connections', 'Frames interleaved on one TCP connection', 'Interleaving built into QUIC'],
            ['Extras', '—', 'Prioritization, server push, header compression', 'Per-stream flow control, fast connection setup']
          ] }, caption: 'HTTP versions at a glance' },
        { trap: 'HTTP/3 does **not** run over TCP. QUIC is not built into the operating system like TCP; it is implemented in the application layer on top of UDP.' }
      ]
    }
  ],
  recall: [
    { q: 'Name the four components of cookie technology.', a: '`Set-cookie:` header line in the HTTP response; `Cookie:` header line in HTTP requests; a cookie file on the user’s host managed by the browser; a back-end database at the Web site.' },
    { q: 'Which HTTP message carries `Set-cookie:`, and which carries `Cookie:`?', a: '`Set-cookie:` is in the server’s response; `Cookie:` is in the browser’s later requests.' },
    { q: 'What does each line of the browser’s cookie file hold?', a: 'The server’s hostname and the identification number it assigned (e.g. amazon: 1678).' },
    { q: 'What do cookies add on top of stateless HTTP, and why are they controversial?', a: 'A user session layer. They raise privacy concerns: combined with account information, a site learns a lot about a user and may sell it to third parties.' },
    { q: 'Why is a Web cache both a client and a server?', a: 'It is a server to browsers (receives their requests, sends responses) and a client to origin servers (sends requests, receives responses).' },
    { q: 'Give the two main reasons Web caches are deployed.', a: 'They reduce response time for client requests and reduce traffic on the institution’s access link (and in the Internet as a whole).' },
    { q: 'What is the typical range of cache hit rates?', a: '0.2 to 0.7.' },
    { q: 'Textbook example: what is the access-link traffic intensity without and with a 0.4-hit-rate cache?', a: '15 × 1 Mbit / 15 Mbps = 1.0 without; 0.6 with the cache.' },
    { q: 'What is the average response time in the textbook example with the cache, and how is it computed?', a: '0.4 × 0.01 s + 0.6 × 2.01 s ≈ 1.21 s.' },
    { q: 'What two conditions make a request a conditional GET?', a: 'It uses the GET method and it includes an If-Modified-Since: header line.' },
    { q: 'Where does the If-Modified-Since value come from?', a: 'The Last-Modified: header of the earlier response that delivered the cached object.' },
    { q: 'How does the server answer a conditional GET for an unchanged object?', a: '`HTTP/1.1 304 Not Modified` with an empty entity body.' },
    { q: 'What is HOL blocking in HTTP/1.1?', a: 'On a single TCP connection, a large object at the head of the line delays the small objects queued behind it.' },
    { q: 'Why do HTTP/1.1 browsers open parallel TCP connections, and how many?', a: 'To get around HOL blocking and to grab a bigger share of bottleneck bandwidth (TCP gives each connection about 1/n). Up to six.' },
    { q: 'What is the single most important enhancement of HTTP/2?', a: 'Breaking messages into independent frames, interleaving them on one TCP connection, and reassembling them at the other end.' },
    { q: 'What do HTTP/2 priority weights look like?', a: 'A weight between 1 and 256 per message, higher meaning higher priority, plus an optional dependency on another message’s ID.' },
    { q: 'What is HTTP/2 server push?', a: 'The server sends extra responses for objects it finds referenced in the HTML base page, before the client asks for them.' },
    { q: 'What does HTTP/2 leave unchanged?', a: 'Methods, status codes, URLs and header fields; only the formatting and transport change.' },
    { q: 'What does HTTP/3 run over?', a: 'QUIC, which is implemented in the application layer over UDP.' },
    { q: 'Give one shared and one dedicated CDN.', a: 'Shared: Akamai (or Limelight). Dedicated: Google (or Netflix).' }
  ]
});
