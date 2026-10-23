(function () {
  var P7 = 'Textbook P7. You click a link to obtain a Web page. The IP address for the URL is not cached in your local host, so a DNS lookup is necessary. Suppose n DNS servers are visited before your host receives the IP address; the successive visits incur RTTs of RTT_{1}, …, RTT_{n}. The Web page contains exactly one object, consisting of a small amount of HTML text. Let RTT_{0} denote the RTT between the local host and the server containing the object. Assume zero transmission time for the object.';
  var P8 = 'Textbook P8. Same setup as P7 (a DNS lookup visiting n DNS servers with RTT_{1}, …, RTT_{n}; RTT_{0} between your host and the Web server), but now the HTML file references eight very small objects on the same server. Neglect transmission times.';
  var NUM = 'Numeric version of P7/P8: the DNS lookup visits n = 3 DNS servers with RTT_{1} = 5 ms, RTT_{2} = 25 ms and RTT_{3} = 40 ms. The RTT between your host and the Web server is RTT_{0} = 30 ms. Transmission times are negligible.';
  var TX = 'A page consists of a base HTML file plus 4 referenced objects on the same server. Every object (including the base file) is 100,000 bits, the bottleneck link rate is 10 Mbps, and RTT = 40 ms. Ignore DNS, HTTP header sizes and connection teardown.';
  var P10 = 'Textbook P10. A short, 10-meter link; a sender can transmit at 150 bits/s in both directions. Packets containing data are 100,000 bits; packets containing only control (e.g., ACK or handshaking) are 200 bits. N parallel connections each get 1/N of the link bandwidth. Each downloaded object is 100 Kbits (one data packet), and the initial (base) object references 10 objects from the same sender. Model each non-persistent fetch as three 200-bit control packets (SYN, SYNACK, ACK carrying the request) followed by the data packet.';
  var P11 = 'Textbook P11. Same link and pages as P10 (a 150 bits/s link where N parallel connections each get 1/N of the bandwidth; a base object referencing 10 objects). Now the link is shared by Bob with four other users. Bob uses parallel instances of non-persistent HTTP, and the other four users use non-persistent HTTP without parallel downloads.';
  var P1 = 'Textbook P1 — true or false?';
  var P6 = 'Textbook P6 asks questions about the HTTP/1.1 specification (RFC 2616). Answer from what you know about HTTP/1.1.';

  NET.addQuestions('http', [
    { id: 'http-01', d: 1, type: 'mc', src: 'cheat',
      q: 'Which transport protocol and default server port does plain HTTP use?',
      choices: ['TCP, port 80', 'TCP, port 25', 'UDP, port 53', 'UDP, port 80'],
      a: 0,
      why: 'HTTP/1.1 and HTTP/2 run over TCP; the browser opens a TCP connection to the server, by default on port 80 (443 for HTTPS), and the server accepts it. Port 25 is SMTP; UDP port 53 is DNS.' },

    { id: 'http-02', d: 1, type: 'mc', src: 'cheat',
      q: 'A browser opens a TCP connection for an `https://` URL. Which server port does it usually connect to?',
      choices: ['25', '443', '53', '80'],
      a: 1,
      why: 'HTTPS (HTTP over TLS over TCP) uses port 443; plain HTTP uses port 80. 25 = SMTP, 53 = DNS.' },

    { id: 'http-03', d: 1, type: 'tf', src: 'cheat',
      q: 'An HTTP server is required to remember which objects each client has already requested.',
      a: false,
      why: 'False. HTTP is stateless: the server is not required to retain client state between requests, and each request is handled independently. (Cookies are the add-on used when a site wants to track users.)' },

    { id: 'http-04', d: 2, type: 'mc', src: 'text',
      q: 'A client requests the same object twice within a few seconds. What does the HTTP server do?',
      choices: [
        'Replies that it just sent that object to this client',
        'Ignores the second request as a duplicate',
        'Sends 304 Not Modified because it remembers serving this client',
        'Sends the object again — it keeps no record of having just sent it'
      ],
      a: 3,
      why: 'Because HTTP is stateless, the server has “completely forgotten what it did earlier” and simply resends the object. A 304 Not Modified is only sent in answer to a conditional GET (the client includes If-Modified-Since); it is not the server remembering the client.' },

    { id: 'http-05', d: 1, type: 'num', src: 'text',
      q: 'A Web page contains HTML text and five JPEG images. How many objects does the page consist of?',
      a: 6, unit: 'objects',
      why: 'The base HTML file is itself an object: 1 base HTML file + 5 images = 6 objects, each addressable by its own URL.' },

    { id: 'http-06', d: 1, type: 'mc', src: 'text',
      q: 'In the URL `http://www.someSchool.edu/someDepartment/picture.gif`, what is the hostname?',
      choices: ['/someDepartment/picture.gif', 'www.someSchool.edu', 'http://www.someSchool.edu/someDepartment', 'someDepartment'],
      a: 1,
      why: 'A URL has two components: the hostname of the server that houses the object (`www.someSchool.edu`) and the object’s path name (`/someDepartment/picture.gif`).' },

    { id: 'http-07', d: 2, type: 'tf', src: 'text',
      q: 'The HTTP specification defines how a browser must display (interpret) a Web page, so two browsers always show a page identically.',
      a: false,
      why: 'False. HTTP has nothing to do with how a page is interpreted by a client; the HTTP specifications define only the communication protocol between the client HTTP program and the server HTTP program. Two browsers may display the same page somewhat differently.' },

    { id: 'http-08', d: 1, type: 'mc', src: 'cheat',
      q: 'What characterizes non-persistent HTTP?',
      choices: [
        'The server remembers the client between successive connections',
        'Requests are sent back-to-back without waiting for the replies',
        'One TCP connection carries all of the objects of a page and then closes',
        'A separate TCP connection for each request/response (one object per connection)'
      ],
      a: 3,
      why: 'Non-persistent: establish a TCP connection, transfer one object, close; each additional object triggers a new connection. One connection for everything = persistent; back-to-back requests = pipelining; remembering clients would make HTTP stateful, which it is not.' },

    { id: 'http-09', d: 2, type: 'num', src: 'text',
      q: 'A page consists of a base HTML file and 10 JPEG images, all on the same server. With non-persistent HTTP, how many TCP connections are opened to fetch the page?',
      a: 11, unit: 'connections',
      why: 'Each non-persistent connection carries exactly one request and one response, so 1 (base) + 10 (JPEGs) = 11 TCP connections. Forgetting the base HTML file (answering 10) is the classic slip.' },

    { id: 'http-10', d: 2, type: 'order', src: 'text',
      q: 'Put the steps of fetching a page (base HTML + 10 JPEGs) with non-persistent HTTP in order.',
      items: [
        'Client initiates a TCP connection to the server on port 80',
        'Client sends an HTTP request message (with the path name) into its socket',
        'Server retrieves the object, encapsulates it in an HTTP response message and sends it into its socket',
        'Server tells TCP to close the connection',
        'Client receives the response, the connection terminates, and the client parses the HTML and finds 10 JPEG references',
        'The same connect–request–respond–close cycle repeats for each referenced JPEG'
      ],
      why: 'Textbook §2.2.2 steps 1–6. Note step 4: the server only asks TCP to close; TCP does not actually terminate until it knows the client received the response intact. Only after parsing the base file does the client know which further objects to fetch.' },

    { id: 'http-11', d: 2, type: 'tf', src: 'text',
      q: 'In non-persistent HTTP, as soon as the server process tells TCP to close the connection, TCP immediately terminates it, even if the response is still in flight.',
      a: false,
      why: 'False. The server process tells TCP to close, “but TCP doesn’t actually terminate the connection until it knows for sure that the client has received the response message intact.” The connection terminates after the client receives the response.' },

    { id: 'http-12', d: 1, type: 'mc', src: 'cheat',
      q: 'The round-trip time (RTT) used in HTTP timing calculations is:',
      choices: [
        'Small packet client → server → client: propagation + queuing + processing delays',
        'The time the server needs to read the requested file from disk',
        'The transmission time of the requested file onto the server’s link',
        'Only the one-way propagation delay from the client to the server'
      ],
      a: 0,
      why: 'RTT = time for a small packet to travel from client to server and back; it includes propagation, queuing (in routers and switches) and processing delays. Transmission time of a large file (L/R) is added separately.' },

    { id: 'http-13', d: 2, type: 'mc', src: 'cheat',
      q: 'Why does fetching one object with non-persistent HTTP take about 2 RTT plus the file’s transmission time?',
      choices: [
        'One RTT is spent on a DNS lookup and one on the request/response exchange',
        'The full three-way handshake takes 1.5 RTT and the request/response 0.5 RTT',
        'One RTT is for the request/response and one for closing the TCP connection',
        'SYN/SYNACK take 1 RTT; the request rides on the 3rd handshake segment and its response takes 1 RTT'
      ],
      a: 3,
      why: 'Figure 2.7: SYN → SYNACK = 1 RTT. The HTTP request is piggybacked on the third segment (ACK) of the handshake; request out + first bits of the response back = 1 RTT; then the server’s transmission time for the file. DNS is a separate cost (only if a lookup is needed), and teardown is not counted.' },

    { id: 'http-14', d: 2, type: 'num', src: 'cheat',
      q: 'RTT = 30 ms. A 125,000-byte base HTML file is sent over a 20 Mbps link. With non-persistent HTTP, how long (in ms) from clicking the link until the file is fully received?',
      a: 110, unit: 'ms',
      why: 'L = 125,000 bytes × 8 = 1,000,000 bits.\nL/R = 1,000,000 / 20,000,000 = 0.05 s = 50 ms.\nTotal = 2 × RTT + L/R = 2 × 30 + 50 = 110 ms.\nTrap: forgetting × 8 gives 6.25 ms of transmission and a wrong total of 66.25 ms.' },

    { id: 'http-15', d: 1, type: 'mc', src: 'cheat',
      q: 'What characterizes persistent HTTP?',
      choices: [
        'The server stores the client’s state between successive requests',
        'The server keeps the TCP connection open, so later requests reuse it',
        'The client opens several TCP connections to the same server at once',
        'The TCP connection is never closed by either side'
      ],
      a: 1,
      why: 'Persistent HTTP: open a single TCP connection, reuse it for multiple objects between the same client and server (possibly pipelined), and close it when done or after an idle timeout. It does not make HTTP stateful, and several simultaneous connections are “parallel” connections, a different idea.' },

    { id: 'http-16', d: 1, type: 'mc', src: 'cheat',
      q: 'What is pipelining in HTTP/1.1?',
      choices: [
        'Sending requests back-to-back without waiting for replies; objects return back-to-back',
        'Objects are compressed and chained together before transmission',
        'The client opens multiple parallel TCP connections to the same server',
        'The server pushes objects that the client has not yet requested'
      ],
      a: 0,
      why: 'Pipelining = back-to-back requests on one persistent connection without waiting for replies to pending requests; the server sends the objects back-to-back. Parallel connections are a separate technique; server push is an HTTP/2 feature.' },

    { id: 'http-17', d: 2, type: 'multi', src: 'cheat',
      q: 'Which are advantages of persistent HTTP over non-persistent HTTP? Select all that apply.',
      choices: [
        'Avoids a TCP handshake RTT for every object after the first',
        'Makes the HTTP server remember the client’s state',
        'Avoids allocating TCP buffers and variables for a new connection per object, lowering server overhead',
        'Lets multiple Web pages from the same server travel over one connection',
        'Guarantees a minimum throughput',
        'Encrypts the objects in transit'
      ],
      a: [0, 2, 3],
      why: 'Persistent HTTP reduces latency and server overhead by avoiding repeated TCP setup/teardown and the per-connection TCP state/buffers (a real burden on a server handling hundreds of clients). The same connection can carry a whole page and even multiple pages from the same server. It changes nothing about statelessness, security or throughput guarantees.' },

    { id: 'http-18', d: 1, type: 'mc', src: 'text',
      q: 'Which HTTP version employs non-persistent TCP connections?',
      choices: ['All versions, always', 'HTTP/1.1', 'HTTP/1.0', 'HTTP/2'],
      a: 2,
      why: 'HTTP/1.0 (RFC 1945, early 1990s) employs non-persistent connections. HTTP/1.1 (RFC 7230) introduced persistent connections as the default; HTTP/2 also uses a single persistent TCP connection.' },

    { id: 'http-19', d: 1, type: 'tf', src: 'text',
      q: 'Although HTTP uses persistent connections in its default mode, HTTP clients and servers can be configured to use non-persistent connections instead.',
      a: true,
      why: 'True (textbook §2.2.2). For example, a client can send `Connection: close` to ask the server to close the connection after the response.' },

    { id: 'http-20', d: 2, type: 'mc', src: 'text',
      q: 'With persistent HTTP, when does the server typically close the TCP connection?',
      choices: [
        'Immediately after it finishes sending each requested object',
        'When the connection has not been used for a certain, configurable timeout interval',
        'After exactly 10 objects, as required by the HTTP/1.1 specification',
        'Never — only the client is allowed to close a persistent connection'
      ],
      a: 1,
      why: 'Typically the HTTP server closes a persistent connection when it isn’t used for a certain time (a configurable timeout interval). Closing after each object would be non-persistent. Either side may also close it (e.g., with `Connection: close`).' },

    { id: 'http-21', d: 2, type: 'num', src: 'cheat',
      q: 'A client fetches N = 8 objects one after another from the same server. How many TCP connection-setup RTTs are avoided by using one persistent connection (no pipelining) instead of 8 non-persistent connections?',
      a: 7, unit: 'RTTs',
      why: 'Non-persistent: 8 × 2 RTT = 16 RTT. Persistent without pipelining: the first object pays setup + request = 2 RTT, the other 7 pay 1 RTT each → 9 RTT. Difference = 16 − 9 = 7 = N − 1 setup RTTs avoided. Each sequential request/response still costs an RTT.' },

    { id: 'http-22', d: 2, type: 'mc', src: 'ch2-P7', ctx: P7,
      q: 'How much time elapses from when the client clicks on the link until the client receives the object?',
      choices: [
        'RTT_{1} + … + RTT_{n} + 3·RTT_{0}',
        '2·(RTT_{1} + … + RTT_{n}) + 2·RTT_{0}',
        'RTT_{1} + … + RTT_{n} + RTT_{0}',
        'RTT_{1} + … + RTT_{n} + 2·RTT_{0}'
      ],
      a: 3,
      why: 'First the DNS lookup: RTT_{1} + … + RTT_{n} (each is already a round trip — don’t double it). Then 1 RTT_{0} for the TCP handshake (SYN/SYNACK) and 1 RTT_{0} for the request (piggybacked on the third handshake segment) and response. Transmission time is zero. Total = RTT_{1} + … + RTT_{n} + 2·RTT_{0}.' },

    { id: 'http-23', d: 2, type: 'num', src: 'ch2-P7', ctx: NUM,
      q: 'The page is a single small HTML object (P7). How long, in ms, from the click until the object is received?',
      a: 130, unit: 'ms',
      why: 'DNS: 5 + 25 + 40 = 70 ms.\nTCP handshake + request/response: 2 × RTT_{0} = 2 × 30 = 60 ms.\nTotal = 70 + 60 = 130 ms.' },

    { id: 'http-24', d: 3, type: 'mc', src: 'ch2-P8a', ctx: P8,
      q: 'P8a: How much time elapses with non-persistent HTTP and no parallel TCP connections?',
      choices: [
        'RTT_{1}+…+RTT_{n} + 9·RTT_{0}',
        'RTT_{1}+…+RTT_{n} + 18·RTT_{0}',
        'RTT_{1}+…+RTT_{n} + 16·RTT_{0}',
        'RTT_{1}+…+RTT_{n} + 10·RTT_{0}'
      ],
      a: 1,
      why: 'DNS: RTT_{1}+…+RTT_{n}. Base HTML: 2·RTT_{0}. Each of the 8 objects needs its own connection: 8 × 2·RTT_{0} = 16·RTT_{0}. Total = RTT_{1}+…+RTT_{n} + 18·RTT_{0}. 16 forgets the base file; 10 is persistent without pipelining; 9 wrongly charges 1 RTT per non-persistent object.' },

    { id: 'http-25', d: 3, type: 'mc', src: 'ch2-P8b', ctx: P8,
      q: 'P8b: How much time elapses with non-persistent HTTP and the browser configured for 6 parallel connections?',
      choices: [
        'RTT_{1}+…+RTT_{n} + 2·RTT_{0} + (8/6)·2·RTT_{0}',
        'RTT_{1}+…+RTT_{n} + 3·RTT_{0}',
        'RTT_{1}+…+RTT_{n} + 6·RTT_{0}',
        'RTT_{1}+…+RTT_{n} + 4·RTT_{0}'
      ],
      a: 2,
      why: 'Base HTML first: 2·RTT_{0} (it must arrive before the browser knows about the 8 objects). The 8 objects with 6 parallel connections need ⌈8/6⌉ = 2 rounds (6 objects, then 2), each round 2·RTT_{0} → 4·RTT_{0}. Total = RTT_{1}+…+RTT_{n} + 6·RTT_{0}. Rounds must be whole numbers, so (8/6) is wrong; 4·RTT_{0} forgets the base; 3·RTT_{0} is persistent with pipelining.' },

    { id: 'http-26', d: 3, type: 'mc', src: 'ch2-P8c', ctx: P8,
      q: 'P8c: How much time elapses with persistent HTTP using pipelining (the textbook’s default mode)?',
      choices: [
        'RTT_{1}+…+RTT_{n} + 4·RTT_{0}',
        'RTT_{1}+…+RTT_{n} + 10·RTT_{0}',
        'RTT_{1}+…+RTT_{n} + 2·RTT_{0}',
        'RTT_{1}+…+RTT_{n} + 3·RTT_{0}'
      ],
      a: 3,
      why: 'DNS sum, then 2·RTT_{0} for connection setup + base HTML. The 8 requests are then sent back-to-back on the same connection and the 8 tiny objects come back back-to-back: 1 more RTT_{0}. Total = RTT_{1}+…+RTT_{n} + 3·RTT_{0}. (Without pipelining it would be 2 + 8 = 10·RTT_{0}.)' },

    { id: 'http-27', d: 3, type: 'mc', src: 'ch2-P8c', ctx: P8,
      q: 'P8c variant: How much time elapses with persistent HTTP without pipelining (the browser waits for each response before sending the next request)?',
      choices: [
        'RTT_{1}+…+RTT_{n} + 10·RTT_{0}',
        'RTT_{1}+…+RTT_{n} + 9·RTT_{0}',
        'RTT_{1}+…+RTT_{n} + 3·RTT_{0}',
        'RTT_{1}+…+RTT_{n} + 18·RTT_{0}'
      ],
      a: 0,
      why: 'Setup + base = 2·RTT_{0}; then each of the 8 objects costs one request/response round trip on the already-open connection: 8·RTT_{0}. Total = RTT_{1}+…+RTT_{n} + 10·RTT_{0}. Compared with 18·RTT_{0} non-persistent, it saves 8 setup RTTs (9 objects − 1).' },

    { id: 'http-28', d: 2, type: 'num', src: 'ch2-P8a', ctx: NUM,
      q: 'Now the HTML file references 8 very small objects on the same server (P8a). With non-persistent HTTP and no parallel connections, how long (ms) until all objects are received?',
      a: 610, unit: 'ms',
      why: 'DNS = 5 + 25 + 40 = 70 ms.\nBase = 2 × 30 = 60 ms.\n8 objects × 2 × 30 = 480 ms.\nTotal = 70 + 60 + 480 = 610 ms (= 70 + 18 × 30).' },

    { id: 'http-29', d: 2, type: 'num', src: 'ch2-P8b', ctx: NUM,
      q: 'Same 8 referenced objects, but non-persistent HTTP with the browser configured for 6 parallel connections (P8b). How long (ms) until all objects are received?',
      a: 250, unit: 'ms',
      why: 'DNS = 70 ms. Base = 2 × 30 = 60 ms. 8 objects over 6 connections → ⌈8/6⌉ = 2 rounds × 2 × 30 = 120 ms.\nTotal = 70 + 60 + 120 = 250 ms (= 70 + 6 × 30).' },

    { id: 'http-30', d: 2, type: 'num', src: 'ch2-P8c', ctx: NUM,
      q: 'Same 8 referenced objects, persistent HTTP with pipelining (P8c). How long (ms) until all objects are received?',
      a: 160, unit: 'ms',
      why: 'DNS = 70 ms. Setup + base = 2 × 30 = 60 ms. All 8 requests pipelined, 8 tiny objects back = 1 × 30 = 30 ms.\nTotal = 70 + 60 + 30 = 160 ms (= 70 + 3 × 30).' },

    { id: 'http-31', d: 3, type: 'num', src: 'ch2-P8c', ctx: NUM,
      q: 'Same 8 referenced objects, persistent HTTP without pipelining. How long (ms) until all objects are received?',
      a: 370, unit: 'ms',
      why: 'DNS = 70 ms. Setup + base = 60 ms. 8 sequential request/responses × 30 = 240 ms.\nTotal = 70 + 60 + 240 = 370 ms (= 70 + 10 × 30).' },

    { id: 'http-32', d: 2, type: 'num', src: 'cheat', ctx: TX,
      q: 'How long (ms) does the whole page take with non-persistent HTTP and no parallel connections?',
      a: 450, unit: 'ms',
      why: 'Transmission per object T = 100,000 / 10,000,000 = 0.01 s = 10 ms.\nEach object = 2 × RTT + T = 80 + 10 = 90 ms.\n5 objects (base + 4) × 90 = 450 ms.' },

    { id: 'http-33', d: 3, type: 'num', src: 'cheat', ctx: TX,
      q: 'How long (ms) does the whole page take with one persistent connection without pipelining?',
      a: 290, unit: 'ms',
      why: 'T = 10 ms per object.\nBase: 2 × 40 + 10 = 90 ms.\nEach of 4 objects: 1 RTT + T = 40 + 10 = 50 ms → 200 ms.\nTotal = 90 + 200 = 290 ms (saves 4 setup RTTs = 160 ms vs non-persistent).' },

    { id: 'http-34', d: 3, type: 'num', src: 'cheat', ctx: TX,
      q: 'How long (ms) does the whole page take with one persistent connection with pipelining?',
      a: 170, unit: 'ms',
      why: 'Base: 2 × 40 + 10 = 90 ms.\nThe 4 requests go out back-to-back: 1 RTT = 40 ms until the first object’s bits start arriving, then the 4 objects arrive back-to-back: 4 × 10 = 40 ms.\nTotal = 90 + 40 + 40 = 170 ms.' },

    { id: 'http-35', d: 3, type: 'num', src: 'cheat',
      q: 'A base HTML file references 12 small objects on the same server. The browser uses non-persistent HTTP with up to 5 parallel connections. RTT = 50 ms; transmission times are negligible. How long (ms) until all objects are received?',
      a: 400, unit: 'ms',
      why: 'Base: 2 × 50 = 100 ms (must come first).\n12 objects with 5 connections → ⌈12/5⌉ = 3 rounds (5, 5, 2), each 2 × 50 = 100 ms → 300 ms.\nTotal = 100 + 300 = 400 ms.' },

    { id: 'http-36', d: 2, type: 'mc', src: 'cheat',
      q: 'A page has a base HTML file and N referenced objects. The browser uses non-persistent HTTP with up to M parallel connections. Neglecting transmission times, which expression gives the page-load time?',
      choices: [
        '(N + 2) · RTT',
        '⌈(N+1)/M⌉ · 2·RTT',
        '2·RTT + ⌈N/M⌉ · 2·RTT',
        '2·RTT + (N/M) · RTT'
      ],
      a: 2,
      why: 'The base file must be fetched alone first (2·RTT) — the browser cannot request the referenced objects until it has parsed it, so it cannot share a round with them (that is why ⌈(N+1)/M⌉ is wrong). Then ⌈N/M⌉ rounds, each a full non-persistent fetch of 2·RTT. (N + 2)·RTT is persistent without pipelining.' },

    { id: 'http-37', d: 3, type: 'num', src: 'ch2-P10a', ctx: P10, tol: 0.001,
      q: 'P10 (part 1): Using parallel instances of non-persistent HTTP — the base object first, then all 10 referenced objects over 10 parallel connections — how long does the whole download take? (Answer in seconds.)',
      a: 7377.33, unit: 's',
      why: 'Propagation: 10 m / (3×10^{8} m/s) ≈ 0.033 µs → negligible.\nBase object at 150 bps: 3 × 200/150 + 100,000/150 = 4 + 666.67 = 670.67 s.\n10 parallel connections, 15 bps each: 3 × 200/15 + 100,000/15 = 40 + 6666.67 = 6706.67 s.\nTotal ≈ 670.67 + 6706.67 = 7377.33 s (textbook form: 7377 + 8·T_{p}).' },

    { id: 'http-38', d: 3, type: 'mc', src: 'ch2-P10b', ctx: P10,
      q: 'P10 (part 2): Would parallel downloads via parallel instances of non-persistent HTTP make sense in this case?',
      choices: [
        'No — each connection gets only 15 bps, so the total (≈7377 s) equals the serial time',
        'Yes — parallel connections avoid sending the TCP handshake packets',
        'Yes — 10 parallel connections make the download about 10 times faster',
        'No — parallel connections are not allowed with non-persistent HTTP'
      ],
      a: 0,
      why: 'Serial non-persistent: 11 × (3 × 200/150 + 100,000/150) = 11 × 670.67 = 7377.33 s — exactly the parallel total. Parallel connections help by overlapping RTTs, but here RTTs are negligible (a 10 m link) and the link rate is shared, so splitting it 10 ways gains nothing. Each parallel connection still does its own handshake.' },

    { id: 'http-39', d: 3, type: 'num', src: 'ch2-P10c', ctx: P10, tol: 0.001,
      q: 'P10 (part 3): Now use one persistent HTTP connection (base object, then each referenced object requested in turn). How long does the whole download take? (Answer in seconds.)',
      a: 7350.67, unit: 's',
      why: 'Base object (handshake + request + data): 3 × 200/150 + 100,000/150 = 670.67 s.\nEach of the 10 referenced objects: one 200-bit request + one 100,000-bit data packet = 200/150 + 100,000/150 = 1.33 + 666.67 = 668 s → 10 × 668 = 6680 s.\nTotal ≈ 670.67 + 6680 = 7350.67 s (textbook form: 7351 + 24·T_{p}).' },

    { id: 'http-40', d: 3, type: 'short', src: 'ch2-P10d', ctx: P10,
      q: 'P10 (part 4): Do you expect significant gains with persistent HTTP over the non-persistent case? Justify and explain.',
      a: 'No. Persistent HTTP only saves the two 200-bit handshake packets per referenced object (about 2.67 s each at 150 bps, ≈26.7 s total): roughly 7351 s vs 7377 s, a gain of under 1% (about 0.36%). Propagation on a 10 m link is negligible (≈0.03 µs), so there are no meaningful RTTs to save; the transmission of the 100,000-bit objects dominates.',
      keys: ['no significant gain|not significant|no significant|insignificant|negligible|small|little|minor', 'under 1% (≈27 s of ≈7377 s)|1%|0.36|26|27|percent', 'transmission time dominates|transmission|100,000|100000', 'propagation/RTT negligible on 10 m|propagation|rtt|10 m|10-m|10 meter'],
      why: 'Persistent and parallel connections are RTT-saving techniques. Their value depends on the ratio of RTT to transmission time: on long, fast paths (RTT ≫ L/R) they are huge wins; on this short, slow link (RTT ≈ 0, L/R = 667 s) they are irrelevant.' },

    { id: 'http-41', d: 2, type: 'mc', src: 'ch2-P11a', ctx: P11,
      q: 'P11a: Do Bob’s parallel connections help him get Web pages more quickly?',
      choices: [
        'Yes — bandwidth is split per connection, so his 10 connections grab ≈71% of the link',
        'No — the other users’ connections get priority because they started first',
        'No — the link rate is fixed, so parallel connections cannot help anyone',
        'Yes — but only because parallel connections skip the TCP handshake'
      ],
      a: 0,
      why: 'With bandwidth divided equally per connection, Bob holding 10 of the 14 active connections gets 10/14 ≈ 71% of the 150 bps link, while each other user gets 1/14 ≈ 7%. So yes, he gets his pages faster — at the other users’ expense. (Textbook answer: Bob has more connections, so he gets a larger share of the link bandwidth.)' },

    { id: 'http-42', d: 3, type: 'short', src: 'ch2-P11b', ctx: P11,
      q: 'P11b: If all five users open five parallel instances of non-persistent HTTP, would Bob’s parallel connections still be beneficial? Why or why not?',
      a: 'Compared with everyone using one connection, there is no net gain: with 25 connections each user holds 5/25 = 1/5 of the link — the same share as when nobody used parallel connections. But Bob still needs them relative to the others: if he alone dropped to one connection he would get only 1/21 of the link. So parallel connections remain “beneficial” to Bob defensively, and every user is pushed to open more connections — an arms race.',
      keys: ['each user gets 1/5 again|1/5|20%|20 %|same share|equal|fair', 'no net gain vs. everyone using one|no net|no gain|no advantage|no benefit|not beneficial|no longer', 'Bob still loses if he alone stops|1/21|still|otherwise|less bandwidth|lose', 'arms race: everyone opens more|arms|everyone|all users|race'],
      why: 'Per-connection fair sharing rewards whoever opens more connections, so the advantage disappears once everyone does the same — but abandoning it unilaterally is costly. This bandwidth-grabbing incentive is one reason HTTP/2 aims to use a single TCP connection per page.' },

    { id: 'http-43', d: 2, type: 'tf', src: 'ch2-P1a', ctx: P1,
      q: 'P1a: A user requests a Web page that consists of some text and three images. For this page, the client will send one request message and receive four response messages.',
      a: false,
      why: 'False. The page is 4 objects (base HTML with the text + 3 images). HTTP is request-response: each object needs its own request message, so the client sends 4 requests and receives 4 responses.' },

    { id: 'http-44', d: 2, type: 'tf', src: 'ch2-P1b', ctx: P1,
      q: 'P1b: Two distinct Web pages (for example, `www.mit.edu/research.html` and `www.mit.edu/students.html`) can be sent over the same persistent connection.',
      a: true,
      why: 'True. Both pages are on the same host (www.mit.edu). With persistent connections, multiple Web pages residing on the same server can be sent from the server to the same client over a single persistent TCP connection.' },

    { id: 'http-45', d: 3, type: 'tf', src: 'ch2-P1c', ctx: P1,
      q: 'P1c: With nonpersistent connections between browser and origin server, it is possible for a single TCP segment to carry two distinct HTTP request messages.',
      a: false,
      why: 'False. Each non-persistent TCP connection carries exactly one request message and one response message. Two requests therefore travel on two different TCP connections, and a TCP segment belongs to exactly one connection. (With a persistent, pipelined connection, two small back-to-back requests could share a segment.)' },

    { id: 'http-46', d: 2, type: 'short', src: 'ch2-P6a', ctx: P6,
      q: 'P6a: Explain the mechanism used for signaling between the client and server to indicate that a persistent connection is being closed. Can the client, the server, or both signal the close of a connection?',
      a: 'The `Connection: close` header line. A client that puts `Connection: close` in a request tells the server to close the connection after sending the response; a server that puts `Connection: close` in a response tells the client it will close the TCP connection after this message. Both the client and the server can signal the close.',
      keys: ['the Connection: close header|connection close|connection: close', 'it is a header line|header', 'both client and server can signal|both|either'],
      why: 'Textbook §2.2.3: in the request example, `Connection: close` means the browser does not want a persistent connection; in the response example, the server uses `Connection: close` to tell the client it is going to close the TCP connection after sending the message. Without it, an HTTP/1.1 connection stays open (until an idle timeout).' },

    { id: 'http-47', d: 1, type: 'mc', src: 'ch2-P6b', ctx: P6,
      q: 'P6b: What encryption services are provided by HTTP?',
      choices: [
        'HTTP encrypts the entity body whenever Content-Type is text/html',
        'HTTP/1.1 encrypts all header lines but not the entity body',
        'None — HTTP messages are cleartext; encryption needs HTTP over TLS (HTTPS)',
        'HTTP relies on TCP’s built-in encryption of every segment'
      ],
      a: 2,
      why: 'HTTP provides no encryption; its messages are readable ASCII. TCP has no encryption either. Confidentiality comes from TLS, the application-layer enhancement of TCP (HTTPS, port 443).' },

    { id: 'http-48', d: 2, type: 'short', src: 'ch2-P6c', ctx: P6,
      q: 'P6c: Can a client open three or more simultaneous connections with a given server?',
      a: 'Yes, it is possible — nothing in HTTP prevents it, and browsers can be configured for several parallel connections (many HTTP/1.1 browsers open up to six). However, the HTTP/1.1 spec (RFC 2616) recommended that a single-user client SHOULD NOT maintain more than 2 connections with any server, to limit the load on servers and the network.',
      keys: ['yes, possible|yes|possible', 'RFC 2616 recommends limiting|2616|recommend|should not|should', 'at most 2 per server|2 connections|two connections|two|at most 2', 'browsers open up to six|six|6 parallel|6 connections|up to 6'],
      why: 'The textbook notes users can configure some browsers to control the degree of parallelism, and that many HTTP/1.1 browsers open up to six parallel TCP connections. RFC 2616’s limit of 2 is a recommendation (“SHOULD NOT”), not a hard rule.' },

    { id: 'http-49', d: 3, type: 'short', src: 'ch2-P6d', ctx: P6,
      q: 'P6d: Either a server or a client may close a transport connection between them if either one detects the connection has been idle for some time. Is it possible that one side starts closing a connection while the other side is transmitting data via this connection? Explain.',
      a: 'Yes. Each side decides to close independently. For example, the server decides the connection has been idle and starts to close it at the same moment the client starts sending a new request on it. From the server’s view the connection was idle; from the client’s view a request is in progress. The request is lost with the closing connection, so the client must detect the close and retry on a new connection.',
      keys: ['yes, possible|yes|possible', 'idle timeout decided independently|idle|timeout|independent', 'at the same moment (race)|same time|same moment|simultaneous|race|while', 'client must retry on a new connection|retry|new connection|resend|re-send|reopen'],
      why: 'Closing on an idle timeout is a local decision; messages take time to cross the network, so the two sides can disagree briefly about whether the connection is idle. This race is why HTTP/1.1 clients must be ready to reopen a connection and resend a request.' },

    { id: 'http-50', d: 2, type: 'short', src: 'ch2-P30',
      q: 'P30: Can you configure your browser to open multiple simultaneous connections to a Web site? What are the advantages and disadvantages of having a large number of simultaneous TCP connections?',
      a: 'Yes — many browsers let the user set the degree of parallelism. Advantage: objects download in parallel, so the page can load faster (round trips overlap, and you may get a bigger share of a shared bottleneck). Disadvantages: you may hog the bandwidth and slow down other users sharing the same links, and each connection costs the server (and client) a socket, TCP buffers and variables, increasing server load.',
      keys: ['yes, configurable|yes|configur', 'faster downloads|faster|speed|quick|parallel', 'hogs shared bandwidth|hog|unfair|other users|bandwidth|share', 'more server load (sockets, buffers)|server|buffer|socket|overhead|load'],
      why: 'Parallel connections shorten response time (§2.2.2), but every TCP connection needs buffers and variables at both ends (the same burden that makes non-persistent HTTP costly for servers), and per-connection fair sharing means many connections take bandwidth from others (see P11).' },

    { id: 'http-51', d: 2, type: 'mc', src: 'text',
      q: 'Why doesn’t HTTP need its own mechanism for recovering lost or reordered data?',
      choices: [
        'HTTP messages are too small ever to be lost or reordered',
        'It runs over TCP, which delivers every message intact and in order (layering)',
        'Routers give HTTP traffic priority, so it is never dropped',
        'The HTTP server remembers what it sent and retransmits automatically'
      ],
      a: 1,
      why: 'Once a message is in the socket it is “in the hands of TCP”, whose reliable data transfer guarantees each request and response eventually arrives intact. HTTP need not worry about loss or reordering — that is TCP’s job. Routers don’t prioritize HTTP, and the HTTP server is stateless.' },

    { id: 'http-52', d: 1, type: 'short', src: 'cheat',
      q: 'Explain what it means that HTTP is stateless, and what the server does if the same client requests the same object twice within a few seconds.',
      a: 'The HTTP server maintains no information (state) about clients between requests; each request is handled independently. So if a client asks for the same object twice in a few seconds, the server simply sends the object again — it has forgotten that it already sent it.',
      keys: ['keeps no client state|no state|state|no information|not retain|not remember|forget|forgot', 'each request handled independently|independent|each request|separately', 'resends the object|resend|re-send|again'],
      why: 'Statelessness simplifies server design and lets high-performance servers handle thousands of simultaneous connections. Stateless is about the HTTP server’s memory, not about the TCP connection: HTTP is stateless even over a persistent TCP connection.' },

    { id: 'http-53', d: 1, type: 'mc', src: 'cheat',
      q: 'Which best describes HTTP?',
      choices: [
        'A transport-layer protocol that moves Web pages reliably between routers',
        'A peer-to-peer protocol in which browsers share cached objects',
        'The Web’s application-layer, client-server request-response protocol',
        'The markup language that defines how a Web page is displayed'
      ],
      a: 2,
      why: 'HTTP (HyperText Transfer Protocol) is the Web’s application-layer protocol: the client (browser) requests, receives and displays Web objects; the server delivers the requested objects. It runs over TCP (it is not a transport protocol), the Web is client-server (not P2P), and page display is HTML’s and the browser’s business, not HTTP’s.' }
  ]);
})();
