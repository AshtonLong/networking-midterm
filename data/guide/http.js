NET.addSection({
  id: 'http',
  unit: 2,
  order: 8,
  title: 'HTTP: connections & timing',
  short: 'HTTP timing',
  cheat: 'p.83–89',
  text: '§2.2.1–2.2.2',
  minutes: 40,
  summary: 'HTTP is the Web’s client-server, request-response protocol: it runs over TCP (port 80, HTTPS 443) and is stateless. The exam’s favourite calculation lives here — how long a page takes to load with non-persistent, parallel, persistent and pipelined connections — so learn the RTT counting rules cold: 2 RTT + transmit time per non-persistent object, and why persistent connections save N−1 setup RTTs.',
  mustKnow: [
    'HTTP = the Web’s application-layer protocol, [[client-server request-response]]; runs over [[TCP]] on port [[80]] (HTTPS: [[443]]).',
    'HTTP is [[stateless]]: the server keeps no information about past client requests; each request is handled independently.',
    'A Web page = a [[base HTML file]] + [[referenced objects]]; each object has a URL = [[hostname + path name]].',
    'Non-persistent: [[one request/response per TCP connection]] (HTTP/1.0). Persistent: many objects over [[one TCP connection]], closed when done or after an [[idle timeout]] (HTTP/1.1 default).',
    'RTT = time for a [[small packet]] to go client → server → client; includes [[propagation, queuing and processing]] delay.',
    'One non-persistent object costs [[2 RTT + file transmission time]]: 1 RTT for SYN/SYNACK, 1 RTT for request (piggybacked on the 3rd handshake segment) + response.',
    'Base + N referenced objects (no transmission time): non-persistent serial [[2(N+1) RTT]]; persistent without pipelining [[(N+2) RTT]]; persistent with pipelining [[3 RTT]]; M parallel non-persistent [[2 + 2⌈N/M⌉ RTT]].',
    'Pipelining: the client sends [[back-to-back requests]] without waiting for replies; the server returns objects back-to-back.',
    'Persistent avoids [[N−1 setup RTTs]] for N sequential objects and the [[per-connection TCP buffers and variables]] that burden the server.',
    'A DNS lookup adds [[RTT_{1} + … + RTT_{n}]] before the TCP connection can start.'
  ],
  topics: [
    {
      title: 'HTTP and the Web: pages, objects, URLs',
      src: 'both',
      blocks: [
        { def: 'HTTP (HyperText Transfer Protocol)', text: 'The Web’s [[application-layer protocol]]. It uses a [[client-server request-response]] model: the client (browser) requests, receives and displays Web objects; the server delivers the requested objects.' },
        { p: 'HTTP is defined in RFC 1945 (HTTP/1.0), RFC 7230 (HTTP/1.1) and RFC 7540 (HTTP/2). It is implemented in [[two programs]] — a client program and a server program on different end systems — that talk by exchanging HTTP messages. HTTP defines the [[structure of the messages]] and [[how they are exchanged]].' },
        { def: 'Web page and object', text: 'A Web page (document) consists of [[objects]]. An object is simply a [[file]] — an HTML file, JPEG image, JavaScript file, CSS style sheet, video clip — addressable by a [[single URL]].' },
        { list: [
          'Most pages = a [[base HTML file]] + several [[referenced objects]]; the base file references the other objects by their URLs.',
          'HTML text + five JPEG images = [[six objects]].',
          'When a user requests a page (e.g., clicks a hyperlink), the browser sends HTTP [[request messages]] for the objects in the page; the server responds with HTTP [[response messages]] containing the objects.'
        ] },
        { def: 'URL', text: 'Two components: the [[hostname]] of the server that houses the object and the object’s [[path name]]. In `http://www.someSchool.edu/someDepartment/picture.gif` the hostname is `www.someSchool.edu` and the path name is `/someDepartment/picture.gif`.' },
        { p: 'Browsers (Chrome, Internet Explorer) implement the [[client side]] of HTTP, so “browser” and “client” are used interchangeably. Web servers (Apache, Microsoft Internet Information Server) implement the [[server side]] and house Web objects. Figure 2.6: a PC running Internet Explorer and an Android phone running Chrome each send HTTP requests to a server running Apache and get HTTP responses back.' },
        { example: { q: 'A page’s base HTML file references 3 PNG images, 1 CSS file and 2 JavaScript files, all on www.example.com. How many objects is the page, and what are the hostname and path in http://www.example.com/img/logo.png?', a: 'Objects = 1 base HTML + 3 + 1 + 2 = 7 objects (every separately addressable file counts).\nHostname = www.example.com; path name = /img/logo.png.' } }
      ]
    },
    {
      title: 'HTTP runs over TCP',
      src: 'both',
      blocks: [
        { list: [
          'HTTP/1.1 and HTTP/2 run over [[TCP]], not UDP.',
          'The HTTP client (browser) first [[initiates a TCP connection]] to the server, usually on port [[80]] for plain HTTP (the default HTTP port) or [[443]] for HTTPS; the server accepts the connection.',
          'Client and server then access TCP through their [[socket]] interfaces: the client sends requests into its socket and receives responses from it; the server does the reverse.'
        ] },
        { p: 'Once the client sends a message into its socket, the message is out of the client’s hands and “in the hands of TCP”. Because TCP provides [[reliable data transfer]], every request eventually arrives intact at the server and every response arrives intact at the client. This is a great advantage of a [[layered architecture]]: HTTP need not worry about lost data or how TCP recovers from loss or reordering — that is the job of TCP and the layers below.' },
        { trap: 'Trap: HTTP has no retransmission mechanism of its own and does not run over UDP. Reliability comes entirely from TCP underneath.' }
      ]
    },
    {
      title: 'HTTP is stateless',
      src: 'both',
      blocks: [
        { def: 'Stateless protocol', text: 'The server is [[not required to retain client state]] between requests: it sends requested files [[without storing any state information about the client]], and each request is handled independently.' },
        { p: 'If a client asks for the same object twice within a few seconds, the server does not say “I just sent you that” — it [[resends the object]], having completely forgotten what it did earlier. Statelessness simplifies server design and lets high-performance Web servers handle thousands of simultaneous TCP connections. (Cookies, in the next section, build a user-session layer on top of stateless HTTP.)' },
        { p: 'The Web uses the [[client-server]] architecture: a Web server is always on, with a fixed IP address, and services requests from potentially millions of browsers.' },
        { table: {
          head: ['Version', 'Spec', 'Notes'],
          rows: [
            ['HTTP/1.0', 'RFC 1945 (early 1990s)', 'Non-persistent connections'],
            ['HTTP/1.1', 'RFC 7230', 'Persistent connections by default; the majority of HTTP transactions as of 2020'],
            ['HTTP/2', 'RFC 7540 (2015)', 'Increasingly supported; still over TCP (covered later)']
          ] } },
        { trap: 'Trap: stateless is not the same as connectionless. HTTP runs over connection-oriented TCP and may even keep that connection open (persistent), yet the HTTP server still remembers nothing about the client’s previous requests.' }
      ]
    },
    {
      title: 'Non-persistent vs persistent connections',
      src: 'both',
      blocks: [
        { p: 'When a client makes a series of requests over TCP (back-to-back, periodically or intermittently), the developer must decide: send each request/response pair over a [[separate TCP connection]] — [[non-persistent]] connections — or send all of them over the [[same TCP connection]] — [[persistent]] connections. HTTP uses persistent connections in its default mode but can be configured to use non-persistent ones.' },
        { def: 'Non-persistent HTTP', text: 'A separate TCP connection for each request/response: establish a TCP connection, transfer [[one object]], close the connection; each additional object triggers a [[new TCP connection]].' },
        { steps: [
          'The HTTP client initiates a TCP connection to `www.someSchool.edu` on port [[80]], the default HTTP port. There is a socket at the client and a socket at the server.',
          'The client sends an HTTP request message via its socket; it includes the path name `/someDepartment/home.index`.',
          'The server process receives the request via its socket, retrieves the object from storage (RAM or disk), [[encapsulates it in an HTTP response]] message and sends it via its socket.',
          'The server process tells TCP to close the connection — but TCP does not actually terminate it until it [[knows the client received the response intact]].',
          'The client receives the response; the TCP connection terminates. The message says the object is HTML; the client extracts it, examines it and finds references to the [[10 JPEG objects]].',
          'Steps 1–4 are repeated for [[each of the 10 JPEGs]].'
        ], title: 'Non-persistent walk-through: base HTML + 10 JPEGs at http://www.someSchool.edu/someDepartment/home.index' },
        { list: [
          'Each non-persistent TCP connection carries [[exactly one request message and one response message]].',
          'This 11-object page generates [[11 TCP connections]].',
          '[[HTTP/1.0]] employs non-persistent connections.',
          'As the browser receives the page it displays it; two browsers may display it differently. HTTP has [[nothing to do with how a page is interpreted]] — it only defines the communication protocol between the client and server programs.'
        ] },
        { p: '**Serial vs parallel.** The client may fetch the 10 JPEGs over 10 [[serial]] TCP connections, or fetch some of them over [[parallel]] TCP connections. Users can configure some browsers to control the degree of parallelism; parallel connections [[shorten the response time]]. (Many HTTP/1.1 browsers open up to six parallel connections.)' },
        { def: 'Persistent HTTP (HTTP/1.1)', text: 'The server [[leaves the TCP connection open]] after sending a response, so subsequent requests and responses between the [[same client and server]] reuse the connection.' },
        { steps: [
          'Open a [[single TCP connection]] to the server.',
          'Reuse it to fetch [[multiple objects]] between the same client and server — an entire page (base + 10 images), or even multiple pages on the same server — possibly pipelined.',
          'Close it when done or after an [[idle timeout]] (the server closes a connection that has not been used for a configurable timeout interval).'
        ], title: 'Persistent procedure' },
        { def: 'Pipelining (HTTP/1.1)', text: 'The client issues [[back-to-back requests]] without waiting for replies to pending requests, and the server returns the objects [[back-to-back]]. The textbook calls persistent connections with pipelining the [[default mode]] of HTTP.' },
        { list: [
          'Non-persistent shortcoming 1: a brand-new connection must be established and maintained per object — [[TCP buffers and variables]] at both client and server. A server serving hundreds of clients simultaneously pays this burden for every object.',
          'Non-persistent shortcoming 2: [[each object suffers 2 RTTs]] — one to set up TCP, one to request and receive the object.',
          'So persistent HTTP [[reduces latency]] and [[lowers server overhead]] by avoiding repeated TCP setup/teardown and the extra per-object TCP state/buffers.'
        ] },
        { table: {
          head: ['', 'Non-persistent', 'Persistent, no pipelining', 'Persistent with pipelining'],
          rows: [
            ['TCP connections for base + N objects', 'N + 1', '1', '1'],
            ['Requests per connection', 'Exactly 1', 'Many, one at a time', 'Many, back-to-back'],
            ['Cost per referenced object', '2 RTT', '1 RTT', '≈ 1 RTT for all of them together'],
            ['Typical use', 'HTTP/1.0', 'HTTP/1.1 when the client waits for each reply', 'HTTP/1.1 default mode (textbook)']
          ] } },
        { trap: 'Trap: a persistent connection does not make HTTP stateful. The TCP connection persists; the HTTP server still treats each request independently.' }
      ]
    },
    {
      title: 'RTT and the 2 RTT + transmit rule',
      src: 'both',
      blocks: [
        { def: 'Round-trip time (RTT)', text: 'The time for a [[small packet]] to travel from client to server and then back to the client. It includes [[propagation, queuing (in routers and switches) and processing]] delays — but not the transmission time of a large file.' },
        { diagram: 'http-nonpersistent' },
        { steps: [
          'Client sends a small TCP segment (SYN); server acknowledges and responds with a small TCP segment (SYNACK). These first two parts of the [[three-way handshake]] take [[1 RTT]].',
          'Client sends the HTTP request message [[combined with the third part of the handshake]] (the ACK).',
          'The request arrives and the server sends the HTML file into the connection. Request/response takes [[1 more RTT]].',
          'Add the time for the server to [[transmit the file]].'
        ], title: 'Back-of-the-envelope time for one object (Figure 2.7)' },
        { formula: 'T_{object} = 2 · RTT + L/R',
          where: [['RTT', 'round-trip time (s)'], ['L', 'file size in bits (bytes × 8)'], ['R', 'transmission rate of the bottleneck link (bits/s)']],
          note: 'Non-persistent HTTP pays this for every object. Persistent HTTP pays it only for the first object; each later object costs RTT + L/R (or less with pipelining).' },
        { example: { q: 'RTT = 80 ms. The base HTML file is 50 KB (50,000 bytes) and the server’s link is 10 Mbps. How long from clicking the link until the whole file is received (non-persistent HTTP)?', a: 'L = 50,000 × 8 = 400,000 bits.\nL/R = 400,000 / 10,000,000 = 0.04 s = 40 ms.\nTotal = 2 × RTT + L/R = 160 + 40 = 200 ms.' } },
        { trap: 'Trap: it is 2 RTT, not 3 (or 1.5). The request rides with the third handshake segment, so the handshake costs only 1 RTT before the request is on its way. Connection teardown is not counted.' }
      ]
    },
    {
      title: 'Page-load timing recipes',
      src: 'both',
      blocks: [
        { p: 'The base HTML file always comes first — the browser only learns what to fetch next by parsing it. Then come the N referenced objects. If transmission times are “negligible”, count only RTTs; otherwise add each object’s L/R.' },
        { table: {
          head: ['Strategy', 'Time for base + N referenced objects (transmission negligible)'],
          rows: [
            ['Non-persistent, serial', '2 RTT + N × 2 RTT = 2(N+1) RTT'],
            ['Non-persistent, M parallel connections', '2 RTT + ⌈N/M⌉ × 2 RTT'],
            ['Persistent, no pipelining', '2 RTT + N × RTT = (N+2) RTT'],
            ['Persistent with pipelining', '2 RTT + 1 RTT = 3 RTT'],
            ['Uncached DNS lookup first (n DNS servers)', 'add RTT_{1} + RTT_{2} + … + RTT_{n} to any of the above']
          ] }, caption: 'Memorize these four lines — every HTTP timing problem is a variation' },
        { formula: 'saved = (N − 1) · RTT',
          where: [['N', 'number of objects fetched one after another over one persistent connection (no pipelining)']],
          note: 'Cheat sheet: only the first object pays the TCP setup RTT, so N−1 setup RTTs are avoided compared with N separate connections; each sequential request-response still costs an RTT.' },
        { example: { q: 'Base HTML + 10 referenced objects on one server; RTT = 20 ms; transmission negligible. Find the page time for (a) non-persistent serial, (b) non-persistent with 5 parallel connections, (c) persistent without pipelining, (d) persistent with pipelining.', a: '(a) 2 RTT (base) + 10 × 2 RTT = 22 RTT = 440 ms.\n(b) 2 RTT + ⌈10/5⌉ × 2 RTT = 2 + 4 = 6 RTT = 120 ms.\n(c) 2 RTT + 10 × 1 RTT = 12 RTT = 240 ms.\n(d) 2 RTT + 1 RTT = 3 RTT = 60 ms.\nCheck (a) − (c) = 10 RTT saved = (11 objects − 1) setup RTTs.' } },
        { example: { q: 'Base HTML + 3 referenced objects, each object 200,000 bits; bottleneck rate 4 Mbps; RTT = 100 ms. Find the page time for non-persistent serial, persistent without pipelining, persistent with pipelining, and 3 parallel non-persistent connections that share the link equally.', a: 'Per-object transmission T = 200,000 / 4,000,000 = 0.05 s = 50 ms.\nNon-persistent serial: 4 × (2 × 100 + 50) = 1000 ms.\nPersistent, no pipelining: (200 + 50) + 3 × (100 + 50) = 700 ms.\nPersistent, pipelined: (200 + 50) + 100 + 3 × 50 = 500 ms (one RTT for the burst of requests, then the 3 objects arrive back-to-back).\n3 parallel, sharing: (200 + 50) + 200 + 3 × 50 = 600 ms (each connection gets R/3, so each object takes 150 ms — the same as sending all 3 back-to-back at full rate).' } },
        { trap: 'Traps: (1) count the base object — “a page with 10 images” is 11 objects; (2) parallel rounds = ⌈N/M⌉, not N/M; (3) the DNS RTTs come before the first TCP handshake and are paid once; (4) bytes → bits before dividing by R.' },
        { game: 'http-timeline', text: 'Set RTT, object count and connection strategy and watch the timeline — the fastest way to make these formulas automatic.' },
        { game: 'number-crunch', text: 'Randomized 2 RTT + L/R and page-load drills until you stop miscounting RTTs.' }
      ]
    },
    {
      title: 'When parallel or persistent connections do not help',
      src: 'text',
      blocks: [
        { p: 'Parallel and persistent connections win by [[hiding RTTs]]. If the link is very slow, the time is dominated by [[transmission]], not RTTs: parallel connections merely [[split the same bandwidth]], and persistence saves only a few tiny handshake packets.' },
        { example: { q: 'A 10 m link runs at 1,000 bits/s. Control packets (SYN, SYNACK, request) are 100 bits; each object is one 50,000-bit data packet. A base page references 5 objects. N parallel connections each get 1/N of the link. Compare non-persistent serial, 5 parallel non-persistent, and persistent.', a: 'Propagation: 10 m / 3×10^{8} m/s ≈ 0.03 µs → negligible.\nOne non-persistent object at full rate: 3 × 100/1000 + 50,000/1000 = 0.3 + 50 = 50.3 s.\nSerial: 6 × 50.3 = 301.8 s.\n5 parallel (base first, then 5 at 200 bps each): 50.3 + (3 × 100/200 + 50,000/200) = 50.3 + 251.5 = 301.8 s — identical to serial.\nPersistent: 50.3 + 5 × (100/1000 + 50,000/1000) = 50.3 + 250.5 = 300.8 s — only 1 s (≈0.3%) better.\nConclusion: when transmission dominates, neither trick helps much.' } },
        { list: [
          '**Fairness / grabbing bandwidth:** if a shared link gives each TCP connection an equal share, a user who opens more parallel connections gets a [[bigger share]] (10 connections vs 4 users with 1 each → 10/14 ≈ 71% of the link).',
          'If everyone opens the same number of parallel connections, the shares even out again (each user back to 1/5), yet no one can drop back to one connection without losing out — an [[arms race]]. (Reducing parallel connections is one goal of HTTP/2.)',
          'Many simultaneous connections: advantage — potentially [[faster downloads]] for you; disadvantages — you may [[hog shared bandwidth]] and slow other users, and each connection costs the server [[sockets, TCP buffers and variables]].'
        ] }
      ]
    },
    {
      title: 'Closing persistent connections, idle timeouts, and security',
      src: 'text',
      blocks: [
        { list: [
          'Either side signals that a persistent connection is ending with the [[`Connection: close`]] header line. In a request, the client asks the server to close after sending this object; in a response, the server announces it will close the TCP connection after this message. So [[both client and server]] can signal the close.',
          'A server (or client) closes a connection that has been [[idle]] for a configurable timeout. Race condition: one side can start closing an “idle” connection at the very moment the other side starts sending a new request on it — so clients must be prepared to [[retry on a new connection]].',
          'HTTP itself provides [[no encryption]]; HTTP/1.1 messages are cleartext ASCII. Confidentiality comes from running HTTP over [[TLS]] (HTTPS, port 443), the application-layer enhancement of TCP.',
          'Can a client open several simultaneous connections to one server? Yes. The original HTTP/1.1 spec (RFC 2616) advised a single-user client to keep [[no more than 2]] connections per server (a recommendation, not a hard limit); today’s browsers commonly open [[up to six]].'
        ] }
      ]
    }
  ],
  recall: [
    { q: 'HTTP transport protocol and default ports?', a: 'TCP; port 80 for HTTP, 443 for HTTPS.' },
    { q: 'What does “HTTP is stateless” mean?', a: 'The server keeps no information about past client requests; it handles each request independently (it will resend an object it just sent).' },
    { q: 'What is a Web object? What makes up a page?', a: 'A file addressable by a single URL; a page = base HTML file + referenced objects.' },
    { q: 'Two components of a URL?', a: 'Hostname of the server + path name of the object.' },
    { q: 'Non-persistent HTTP in one sentence?', a: 'One TCP connection per request/response — at most one object per connection, then close.' },
    { q: 'How many TCP connections for base HTML + 10 images, non-persistent?', a: '11.' },
    { q: 'Which HTTP version used non-persistent connections; which defaults to persistent?', a: 'HTTP/1.0 non-persistent; HTTP/1.1 persistent.' },
    { q: 'Define RTT and what it includes.', a: 'Time for a small packet to go client → server → client; includes propagation, queuing and processing delays.' },
    { q: 'Why does one non-persistent object cost 2 RTT + transmit?', a: '1 RTT for SYN/SYNACK; request piggybacks on the 3rd handshake segment; 1 RTT for request/response; plus file transmission time.' },
    { q: 'Define pipelining.', a: 'Client sends requests back-to-back without waiting for replies; server returns objects back-to-back.' },
    { q: 'Base + N objects, persistent without pipelining?', a: '(N + 2) RTT (+ transmission times).' },
    { q: 'Base + N objects, persistent with pipelining?', a: '3 RTT (+ transmission times).' },
    { q: 'Base + N objects, M parallel non-persistent?', a: '2 RTT + ⌈N/M⌉ × 2 RTT.' },
    { q: 'Two shortcomings of non-persistent HTTP?', a: 'Per-object TCP buffers/variables at client and server (server burden) and 2 RTTs per object.' },
    { q: 'When does a persistent connection close?', a: 'When the client or server sends Connection: close and finishes, or after an idle timeout.' },
    { q: 'How do DNS lookups change the page time?', a: 'Add RTT_{1} + … + RTT_{n} for the n DNS servers visited, before the first TCP handshake.' },
    { q: 'When do parallel connections not help?', a: 'When transmission time dominates: they just split the same link bandwidth.' }
  ]
});
