NET.addSection({
  id: 'http-messages',
  unit: 2,
  order: 9,
  title: 'HTTP messages, methods & status codes',
  short: 'HTTP messages',
  cheat: 'p.90–98',
  text: '§2.2.3',
  minutes: 30,
  summary: 'The exact anatomy of HTTP/1.1 request and response messages: request line, status line, header lines, the blank CRLF line and the entity body; the five methods (GET, POST, HEAD, PUT, DELETE); the headers the exam loves (Host, Connection, User-agent, Date vs Last-Modified, Content-Length, Content-Type); and the status codes 200, 301, 400, 404, 505. Expect to dissect a captured message line by line.',
  mustKnow: [
    'Request = [[request line]] + [[header lines]] + [[blank line (CRLF)]] + optional [[entity body]]. ASCII text; every line ends with [[CRLF]] (carriage return + line feed).',
    'Request line = [[method, URL, HTTP version]], e.g., `GET /index.html HTTP/1.1`.',
    'Response = [[status line]] + header lines + blank line + entity body (the requested object). Status line = [[version, status code, phrase]], e.g., `HTTP/1.1 200 OK`.',
    'GET: retrieve; parameters in the URL; [[empty entity body]]. POST: form data in the [[entity body]]. HEAD: same headers as GET but [[no object]]. PUT: upload/replace at a URL. DELETE: remove.',
    '`Host:` names the target (virtual) host — [[required]]; needed by [[proxy caches]] and virtual hosting.',
    '`Connection: close` = [[no persistent connection]]: close the TCP connection after this response.',
    '`Date:` = when the [[response was generated]]; `Last-Modified:` = when the [[object last changed]] (key for caching).',
    '`Content-Length:` = [[bytes]] in the body; `Content-Type:` = [[type of the body]] (not the file extension); `Server:` = server software.',
    'Status codes: [[200 OK]], [[301 Moved Permanently]] (new URL in `Location:`), [[400 Bad Request]], [[404 Not Found]], [[505 HTTP Version Not Supported]].',
    'Before HTTP can start, [[DNS]] (over UDP) turns the URL’s hostname into a [[32-bit IPv4 address]]; then TCP to port [[80]].'
  ],
  topics: [
    {
      title: 'Request message format',
      src: 'both',
      blocks: [
        { p: 'There are two types of HTTP messages: [[request]] and [[response]]. Both are written in ordinary [[ASCII text]], readable by any computer-literate human, and every line ends with a [[carriage return and a line feed]] (CRLF).' },
        { table: {
          head: ['Line (each ends with CRLF)', 'Part'],
          rows: [
            ['`GET /somedir/page.html HTTP/1.1`', 'Request line: method, URL, version'],
            ['`Host: www.someschool.edu`', 'Header line'],
            ['`Connection: close`', 'Header line'],
            ['`User-agent: Mozilla/5.0`', 'Header line'],
            ['`Accept-language: fr`', 'Header line'],
            ['(empty line — just CRLF)', 'Blank line: end of the header lines'],
            ['(nothing)', 'Entity body — empty for GET']
          ] }, caption: 'The textbook’s typical request message' },
        { list: [
          'Structure: a [[request line]], then [[header lines]], then a [[blank line]] (an additional CRLF), then an optional [[entity body]].',
          'The example has five lines, each followed by CRLF, and the last line is followed by [[an additional CRLF]]. A request can have many more lines or as few as one.',
          'The request line has three fields separated by spaces: the [[method]] field, the [[URL]] field and the [[HTTP version]] field — e.g., `GET /index.html HTTP/1.1`.',
          'The method field can be GET, POST, HEAD, PUT or DELETE. The great majority of requests use [[GET]]: the browser requests the object named in the URL field (here `/somedir/page.html`) using version HTTP/1.1.'
        ] },
        { table: {
          head: ['Part', 'Layout (sp = space, cr lf = carriage return + line feed)'],
          rows: [
            ['Request line', 'method sp URL sp version cr lf'],
            ['Header lines (any number)', 'header field name: sp value cr lf'],
            ['Blank line', 'cr lf'],
            ['Entity body', 'optional (empty for GET; form input for POST)']
          ] }, caption: 'Figure 2.8 in words — general format of a request message' },
        { example: { q: 'How many CRLFs (carriage-return/line-feed pairs) does the textbook’s 5-line request contain, and how many bytes is the whole message?', a: '5 lines × 1 CRLF each + 1 extra CRLF for the blank line = 6 CRLFs.\nBytes: the five lines have 31 + 24 + 17 + 23 + 19 = 114 characters; plus 6 × 2 = 12 bytes of CR/LF → 126 bytes (ASCII = 1 byte per character).' } },
        { game: 'http-dissect', text: 'Label request lines, header lines, the blank line and bodies in real captured messages until it is instant.' }
      ]
    },
    {
      title: 'Request header lines',
      src: 'both',
      blocks: [
        { def: '`Host:`', text: 'Specifies the host on which the object resides — the [[target (virtual) host]]. It looks redundant because a TCP connection to that host already exists, but it is [[required]]: [[Web proxy caches]] need it, and it lets one server/IP address host many Web sites ([[virtual hosting]]).' },
        { def: '`Connection:`', text: 'Controls persistence. With `Connection: close` the browser tells the server it does not want a persistent connection: [[close the connection after sending the requested object]]. (`Connection: keep-alive` asks for a persistent one.)' },
        { def: '`User-agent:`', text: 'The [[browser type]] making the request (e.g., `Mozilla/5.0`, a Firefox browser). Useful because the server can send [[different versions of the same object]] — all at the same URL — to different types of user agents.' },
        { def: '`Accept-language:`', text: '`Accept-language: fr` says the user prefers a [[French version]] of the object if one exists on the server; otherwise the server sends its default version. It is one of many [[content negotiation]] headers.' },
        { p: 'How does a browser decide which header lines to include? As a function of the [[browser type and version]], the [[user’s configuration]], and whether it currently has a [[cached]] (possibly out-of-date) copy of the object. Web servers similarly vary by product, version and configuration. The HTTP spec defines many more header lines than the few covered here.' },
        { trap: 'Trap: the IP address of the client is not in any HTTP header line — it is in the IP datagram that carries the TCP segment. Host: names the server, not the client.' }
      ]
    },
    {
      title: 'Methods: GET, POST, HEAD, PUT, DELETE',
      src: 'both',
      blocks: [
        { table: {
          head: ['Method', 'What it does', 'Request entity body'],
          rows: [
            ['GET', 'Retrieves the object named in the URL; may carry parameters in the URL', 'Empty'],
            ['POST', 'Submits form (or other) data; the server processes it — e.g., search words typed into a search engine', 'Contains the form input'],
            ['HEAD', 'Like GET, but the response leaves out the requested object — same header lines, no body; used for checking metadata and debugging', 'Empty'],
            ['PUT', 'Uploads an object to a specific path (URL) on a specific server, creating it or completely replacing it — used by Web publishing tools and apps that upload objects', 'The object being uploaded'],
            ['DELETE', 'Deletes an object on a Web server (by a user or an application)', 'Empty']
          ] } },
        { p: '**Form input two ways.** With [[POST]], the user is still requesting a Web page, but its contents depend on what was typed; the [[entity body]] contains the form fields. A form does not have to use POST: HTML forms often use [[GET]] and put the input in the [[requested URL]]. A GET form with two fields filled with monkeys and bananas requests `www.somesite.com/animalsearch?monkeys&bananas`.' },
        { trap: 'Trap: “GET requests carry form data in the body.” No — the GET entity body is empty; GET parameters ride in the URL. And “forms must use POST” is false.' },
        { example: { q: 'Which method? (a) Submitting a login form whose fields go in the body. (b) Seeing a page’s headers (size, type, last-modified) without downloading it. (c) A publishing tool uploading a new version of /index.html. (d) A search form whose words appear after “?” in the URL. (e) Removing /old/page.html from the server.', a: '(a) POST. (b) HEAD. (c) PUT (creates or completely replaces the object at that URL). (d) GET. (e) DELETE.' } }
      ]
    },
    {
      title: 'Response message format',
      src: 'both',
      blocks: [
        { table: {
          head: ['Line (each ends with CRLF)', 'Meaning'],
          rows: [
            ['`HTTP/1.1 200 OK`', 'Status line: version, status code, phrase'],
            ['`Connection: close`', 'Server will close the TCP connection after this message'],
            ['`Date: Tue, 18 Aug 2015 15:44:04 GMT`', 'When the response was created and sent'],
            ['`Server: Apache/2.2.3 (CentOS)`', 'Server software that generated it'],
            ['`Last-Modified: Tue, 18 Aug 2015 15:11:03 GMT`', 'When the object was created or last modified'],
            ['`Content-Length: 6821`', 'Number of bytes in the object'],
            ['`Content-Type: text/html`', 'Type of the object in the body'],
            ['(blank line)', 'End of header lines'],
            ['(data data data data data ...)', 'Entity body = the requested object']
          ] }, caption: 'The textbook’s typical response message (a reply to the request above)' },
        { list: [
          'Three sections: an initial [[status line]], [[header lines]] (six here), then the [[entity body]] — “the meat of the message”, the requested object itself. A blank line separates headers from body.',
          'The status line has three fields: the [[protocol version]], a [[status code]] and a corresponding [[status message (phrase)]]. `HTTP/1.1 200 OK`: the server uses HTTP/1.1 and has found, and is sending, the object.'
        ] },
        { table: {
          head: ['Part', 'Layout'],
          rows: [
            ['Status line', 'version sp status code sp phrase cr lf'],
            ['Header lines', 'header field name: sp value cr lf'],
            ['Blank line', 'cr lf'],
            ['Entity body', 'the requested object (may be empty)']
          ] }, caption: 'Figure 2.9 in words — general format of a response message' }
      ]
    },
    {
      title: 'Response header lines',
      src: 'both',
      blocks: [
        { list: [
          '`Connection: close` — the server is telling the client it will [[close the TCP connection after sending this message]].',
          '`Date:` — the time and date the [[HTTP response was created and sent]]: when the server retrieved the object from its file system, inserted it into the response and sent it. [[Not]] when the object was created or modified.',
          '`Server:` — the [[software]] that generated the response (e.g., an Apache Web server); analogous to `User-agent:` in a request.',
          '`Last-Modified:` — when the [[object was created or last modified]]. Critical for [[object caching]], both in the local client and in network cache (proxy) servers.',
          '`Content-Length:` — the number of [[bytes]] in the object being sent (payload size).',
          '`Content-Type:` — the [[type of the object]] in the entity body, e.g., `text/html`. The object type is officially indicated by Content-Type, [[not by the file extension]].',
          'Caching-related headers also include [[`Cache-Control`]], [[`Expires`]] and [[`ETag`]].'
        ] },
        { trap: 'Trap (P1d): `Date:` is NOT the last-modified time of the object — it is when the response was generated. The object’s change time is `Last-Modified:`.' },
        { example: { q: 'A response says `Content-Length: 2500` and `Content-Type: image/png`. How many bits is the body, and how long does it take to transmit at 1 Mbps? What kind of object is it?', a: 'Content-Length counts bytes: 2500 × 8 = 20,000 bits.\nTransmission time = 20,000 / 1,000,000 = 0.02 s = 20 ms.\nIt is a PNG image — known from Content-Type, regardless of what the URL’s file name ends with.' } }
      ]
    },
    {
      title: 'Status codes',
      src: 'both',
      blocks: [
        { p: 'The status code and its phrase indicate the [[result of the request]].' },
        { table: {
          head: ['Code', 'Phrase', 'Meaning'],
          rows: [
            ['200', 'OK', 'Request succeeded; the information (object) is returned in the response'],
            ['301', 'Moved Permanently', 'Object permanently moved; the new URL is in the `Location:` header; the client software automatically retrieves the new URL'],
            ['400', 'Bad Request', 'Generic error code: the server could not understand the request'],
            ['404', 'Not Found', 'The requested document does not exist on this server'],
            ['505', 'HTTP Version Not Supported', 'The server does not support the requested HTTP protocol version']
          ] }, caption: 'Learn all five: code, phrase, meaning' },
        { p: 'Responses do not always carry an object: a response to a [[HEAD]] request has no entity body, and the [[304 Not Modified]] reply to a conditional GET (next section) has an empty body.' },
        { example: { q: 'Which status code? (a) The client asks for /missing.html, which isn’t on the server. (b) The site moved /old to /new for good. (c) The request line is garbled. (d) The client speaks an HTTP version the server doesn’t implement. (e) Everything worked.', a: '(a) 404 Not Found. (b) 301 Moved Permanently, with `Location: /new` (or the full new URL). (c) 400 Bad Request. (d) 505 HTTP Version Not Supported. (e) 200 OK.' } }
      ]
    },
    {
      title: 'Seeing a real HTTP exchange with telnet',
      src: 'text',
      blocks: [
        { steps: [
          'Type `telnet gaia.cs.umass.edu 80` — this opens a [[TCP connection to port 80]] of that host.',
          'Type the request line `GET /kurose_ross/interactive/index.php HTTP/1.1`.',
          'Type the header line `Host: gaia.cs.umass.edu`.',
          'Press the carriage return [[twice]] — the empty line ends the request.',
          'The server’s response message appears, including the base HTML file. To see only the message lines and not the object, use [[HEAD]] instead of GET.'
        ], title: 'Telnet experiment from §2.2.3' }
      ]
    },
    {
      title: 'Before the first byte: DNS and the protocols behind one URL',
      src: 'cheat',
      blocks: [
        { list: [
          'Hosts have two kinds of identifiers: [[hostnames]] (human-friendly, e.g., `www.someschool.edu`) and [[IP addresses]]. IPv4 addresses are [[32-bit]] identifiers used to route and address datagrams.',
          'Many application protocols, such as [[HTTP and SMTP]], rely on [[DNS]] for hostname resolution.',
          'In a Web request the browser extracts the hostname from the URL, the DNS client queries a DNS server, the reply returns the IP address, and the browser uses that IP and port 80 to open the TCP connection.',
          'DNS [[adds delay]] to the page fetch, but [[caching]] in nearby DNS servers reduces latency and DNS traffic.'
        ] },
        { table: {
          head: ['Protocol', 'Layer', 'Carried by', 'Job when fetching a URL'],
          rows: [
            ['DNS', 'Application', 'UDP (port 53)', 'Translate the URL’s hostname into the server’s IP address'],
            ['HTTP', 'Application', 'TCP (port 80)', 'Request and receive the objects'],
            ['UDP / TCP', 'Transport', 'IP', 'Carry DNS / HTTP messages between processes'],
            ['IP', 'Network', 'link layer', 'Deliver datagrams to the host’s 32-bit address']
          ] } }
      ]
    }
  ],
  recall: [
    { q: 'Four parts of an HTTP request message, in order?', a: 'Request line, header lines, blank line (CRLF), entity body.' },
    { q: 'Three fields of the request line?', a: 'Method, URL, HTTP version (e.g., GET /index.html HTTP/1.1).' },
    { q: 'Three fields of the status line?', a: 'HTTP version, status code, phrase (e.g., HTTP/1.1 200 OK).' },
    { q: 'What ends every line, and what ends the header section?', a: 'CRLF (carriage return + line feed); an extra CRLF — a blank line.' },
    { q: 'Where does GET put form input? POST?', a: 'GET: in the URL (e.g., ?monkeys&bananas), empty body. POST: in the entity body.' },
    { q: 'What does HEAD return?', a: 'The same header lines as GET, without the object — used for debugging/metadata.' },
    { q: 'PUT vs DELETE?', a: 'PUT uploads content to a URL, creating or completely replacing the object; DELETE removes an object.' },
    { q: 'Why is Host: required?', a: 'It names the target virtual host; proxies/Web caches and virtual hosting need it.' },
    { q: 'What does Connection: close mean in a request? In a response?', a: 'Request: please close after sending this object (no persistent connection). Response: the server will close the TCP connection after this message.' },
    { q: 'Why include User-agent:?', a: 'The server can send different versions of the same object (same URL) to different browser types.' },
    { q: 'Date: vs Last-Modified:?', a: 'Date = when the response was created/sent; Last-Modified = when the object was created or last changed (key for caching).' },
    { q: 'Content-Length and Content-Type?', a: 'Length of the body in bytes; type of the body (e.g., text/html) — officially, not the file extension.' },
    { q: 'Five status codes and meanings?', a: '200 OK; 301 Moved Permanently (Location: header, auto-follow); 400 Bad Request; 404 Not Found; 505 HTTP Version Not Supported.' },
    { q: 'How do you see only the response headers via telnet?', a: 'Send HEAD instead of GET.' },
    { q: 'Protocols needed to fetch a URL when the server’s IP is unknown?', a: 'DNS over UDP to resolve the hostname, then HTTP over TCP.' },
    { q: 'Can an HTTP response have an empty body?', a: 'Yes — e.g., the response to HEAD, or a 304 Not Modified.' }
  ]
});
