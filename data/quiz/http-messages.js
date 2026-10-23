(function () {
  var P1 = 'Textbook P1 — true or false?';
  var P4 = 'Textbook P4. Wireshark captured the following ASCII characters when a browser sent an HTTP GET message. `<cr><lf>` marks a single carriage-return character followed by a single line-feed character (shown here at the end of each line):\n' +
    '`GET /cs453/index.html HTTP/1.1<cr><lf>`\n' +
    '`Host: gaia.cs.umass.edu<cr><lf>`\n' +
    '`User-Agent: Mozilla/5.0 (Windows;U; Windows NT 5.1; en-US; rv:1.7.2) Gecko/20040804 Netscape/7.2 (ax)<cr><lf>`\n' +
    '`Accept: text/xml, application/xml, application/xhtml+xml, text/html;q=0.9, text/plain;q=0.8, image/png, ∗/∗;q=0.5<cr><lf>`\n' +
    '`Accept-Language: en-us,en;q=0.5<cr><lf>`\n' +
    '`Accept-Encoding: zip,deflate<cr><lf>`\n' +
    '`Accept-Charset: ISO-8859-1,utf-8;q=0.7,∗;q=0.7<cr><lf>`\n' +
    '`Keep-Alive: 300<cr><lf>`\n' +
    '`Connection:keep-alive<cr><lf>`\n' +
    '`<cr><lf>`\n' +
    'Answer each part and say where in the message you found the answer.';
  var P5 = 'Textbook P5. The server’s reply to the GET message of P4 (`<cr><lf>` = carriage return + line feed):\n' +
    '`HTTP/1.1 200 OK<cr><lf>`\n' +
    '`Date: Tue, 07 Mar 2008 12:39:45 GMT<cr><lf>`\n' +
    '`Server: Apache/2.0.52 (Fedora)<cr><lf>`\n' +
    '`Last-Modified: Sat, 10 Dec 2005 18:27:46 GMT<cr><lf>`\n' +
    '`ETag: "526c3-f22-a88a4c80"<cr><lf>`\n' +
    '`Accept-Ranges: bytes<cr><lf>`\n' +
    '`Content-Length: 3874<cr><lf>`\n' +
    '`Keep-Alive: timeout=max=100<cr><lf>`\n' +
    '`Connection: Keep-Alive<cr><lf>`\n' +
    '`Content-Type: text/html; charset=ISO-8859-1<cr><lf>`\n' +
    '`<cr><lf>`\n' +
    '`<!doctype html public "-//w3c//dtd html 4.0 transitional//en"><lf>`\n' +
    '`<html><lf>`\n' +
    '`<head><lf>`\n' +
    '`<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1"><lf>`\n' +
    '`<meta name="GENERATOR" content="Mozilla/4.79 [en] (Windows NT 5.0; U) Netscape]"><lf>`\n' +
    '`<title>CMPSCI 453 / 591 / NTU-ST550A Spring 2005 homepage</title><lf>`\n' +
    '`</head><lf>`\n' +
    '(much more document text follows, not shown)\n' +
    'Answer each part and say where in the message you found the answer.';
  var BODY = 'The textbook’s example response contains `Content-Length: 6821` and `Content-Type: text/html`.';

  NET.addQuestions('http-messages', [
    { id: 'http-messages-01', d: 1, type: 'order', src: 'cheat',
      q: 'Put the parts of an HTTP request message in order, from first byte to last.',
      items: ['Request line', 'Header lines', 'Blank line (an extra CRLF)', 'Entity body (optional)'],
      why: 'An HTTP request = request line, header lines, a blank line (CRLF) marking the end of the headers, then an optional entity body (empty for GET, form data for POST). A response has the same shape with a status line in place of the request line.' },

    { id: 'http-messages-02', d: 1, type: 'mc', src: 'cheat',
      q: 'What three fields make up the request line of an HTTP request?',
      choices: ['HTTP version, status code, phrase', 'Host, URL, port number', 'Method, URL, HTTP version', 'Method, Host header, Connection header'],
      a: 2,
      why: 'Request line = method sp URL sp version, e.g., `GET /index.html HTTP/1.1`. “Version, status code, phrase” is the status line of a response. Host and Connection are header lines, not part of the request line.' },

    { id: 'http-messages-03', d: 1, type: 'mc', src: 'cheat',
      q: 'What three fields make up the status line of an HTTP response?',
      choices: ['Status code, Date, Server', 'HTTP version, status code, phrase', 'Version, Content-Length, Content-Type', 'Method, URL, HTTP version'],
      a: 1,
      why: 'Status line = protocol version, status code, and a corresponding status message (reason phrase), e.g., `HTTP/1.1 200 OK`. Date, Server, Content-Length and Content-Type are header lines.' },

    { id: 'http-messages-04', d: 1, type: 'tf', src: 'cheat',
      q: 'HTTP/1.1 request and response messages are written in ordinary ASCII text, and each line ends with a carriage return and a line feed (CRLF).',
      a: true,
      why: 'True. HTTP/1.1 messages are human-readable ASCII; every line ends with CRLF, and an extra CRLF (blank line) ends the header section. (HTTP/2 later switched to binary framing.)' },

    { id: 'http-messages-05', d: 2, type: 'mc', src: 'cheat',
      q: 'How does the receiver know where the header lines of an HTTP request end?',
      choices: [
        'The header section ends where the TCP segment ends',
        'The last header line is always `Connection:`, which ends the header section',
        'A NULL byte is placed right after the final header line',
        'An extra CRLF: an empty (blank) line follows the last header line'
      ],
      a: 3,
      why: 'Each header line ends with CRLF, and the last one is followed by an additional CRLF — the blank line. Whatever follows is the entity body. Header order is not fixed, and TCP is a byte stream, so segment boundaries mean nothing to HTTP.' },

    { id: 'http-messages-06', d: 3, type: 'num', src: 'text',
      q: 'The textbook’s request message has five lines: `GET /somedir/page.html HTTP/1.1`, `Host: www.someschool.edu`, `Connection: close`, `User-agent: Mozilla/5.0`, `Accept-language: fr`. How many CRLF (carriage return + line feed) pairs does the complete message contain?',
      a: 6, unit: 'CRLFs',
      why: 'Each of the 5 lines is followed by a CRLF (5), and the last line is followed by an additional CRLF — the blank line that ends the headers (1). Total = 6. (In bytes: 114 characters + 12 CR/LF bytes = 126 bytes.)' },

    { id: 'http-messages-07', d: 1, type: 'mc', src: 'cheat',
      q: 'What does the entity body of a GET request contain?',
      choices: ['The form input the user typed into the page', 'Nothing — it is empty; any parameters go in the URL', 'The object being uploaded to the server', 'A copy of the Host header for proxy caches'],
      a: 1,
      why: 'GET retrieves a resource and may include parameters in the URL; the GET entity body is empty. Form input in the body = POST; an uploaded object in the body = PUT.' },

    { id: 'http-messages-08', d: 2, type: 'mc', src: 'cheat',
      q: 'A form is submitted with the POST method. Where is the user’s input carried?',
      choices: ['In the entity body of the request', 'In the request line’s version field', 'In the Host header line', 'In the URL, after a “?” character'],
      a: 0,
      why: 'POST submits form (or other) data in the request body, and the server processes it; the user is still requesting a page whose contents depend on the input. Input after “?” in the URL is how a GET-based form sends it.' },

    { id: 'http-messages-09', d: 2, type: 'mc', src: 'text',
      q: 'An HTML form uses the GET method; it has two fields, filled in with “monkeys” and “bananas”. Which URL does the browser request?',
      choices: [
        'www.somesite.com/animalsearch, with the inputs in the entity body',
        'monkeys&bananas.somesite.com/animalsearch',
        'www.somesite.com/monkeys/bananas/animalsearch',
        'www.somesite.com/animalsearch?monkeys&bananas'
      ],
      a: 3,
      why: 'Forms do not have to use POST. With GET, the input is included in the requested URL: `www.somesite.com/animalsearch?monkeys&bananas` — the “extended URLs” you see while surfing. With GET the entity body is empty.' },

    { id: 'http-messages-10', d: 2, type: 'mc', src: 'cheat',
      q: 'When a server receives a HEAD request, what does it send back?',
      choices: [
        'The object plus every object it references',
        'The same headers a GET would get, but without the object',
        'The object itself, with no header lines',
        'Only the status line, with no header lines'
      ],
      a: 1,
      why: 'HEAD is like GET, but the server leaves the requested object out of the response. It is useful for checking metadata (size, type, last-modified) and for debugging. In the telnet experiment, swapping GET for HEAD shows just the message lines.' },

    { id: 'http-messages-11', d: 2, type: 'mc', src: 'cheat',
      q: 'Which method sends content in the request body to a specific URL, creating the resource there or completely replacing it if it already exists?',
      choices: ['HEAD', 'GET', 'PUT', 'POST'],
      a: 2,
      why: 'PUT uploads an object to a specific path on a specific server (used by Web publishing tools and apps that upload objects), creating or completely replacing it. POST also carries a body, but the data is submitted for the server to process (e.g., form input), not stored as the object at that URL.' },

    { id: 'http-messages-12', d: 3, type: 'multi', src: 'cheat',
      q: 'Which method/use pairings are correct? Select all that apply.',
      choices: [
        'HEAD — upload an object’s header lines to the server',
        'PUT — fetch the newest version of an object, bypassing caches',
        'DELETE — remove an object from a Web server',
        'HEAD — get only the header lines, e.g., to check metadata or debug',
        'POST — submit form data in the entity body for the server to process',
        'GET — retrieve an object; any parameters ride in the URL'
      ],
      a: [2, 3, 4, 5],
      why: 'GET retrieves; POST submits body data; HEAD returns GET’s headers without the body; PUT uploads (creates or replaces) content at a URL — it does not fetch anything; DELETE removes a resource. HEAD uploads nothing.' },

    { id: 'http-messages-13', d: 1, type: 'mc', src: 'cheat',
      q: 'What does the `Host:` request header line specify?',
      choices: [
        'The host (virtual host) on which the requested object resides',
        'The browser software that is making the request',
        'The time the object was last modified on the server',
        'The IP address of the client sending the request'
      ],
      a: 0,
      why: '`Host: www.someschool.edu` names the target host of the object. The client’s IP is not in any HTTP header (it is in the IP datagram); the browser type is `User-agent:`; modification time is the response header `Last-Modified:`.' },

    { id: 'http-messages-14', d: 3, type: 'short', src: 'cheat',
      q: 'A TCP connection to the server’s IP address already exists. Why does an HTTP/1.1 request still need a `Host:` header line? Give two reasons.',
      a: 'One IP address/server can host many Web sites (virtual hosting), so Host tells the server which site’s object is wanted. And Web proxy caches need it to know which origin server the request is for, since the request line usually carries only the path. That is why Host is a required header in HTTP/1.1.',
      keys: ['virtual hosting: many sites on one IP|virtual|many sites|multiple sites|many web sites|multiple web sites|same ip|one ip', 'proxy / Web caches need it|proxy|cache', 'required in HTTP/1.1|required|mandatory|must'],
      why: 'Cheat sheet: the Host header specifies the target virtual host; it is required and supports proxies and virtual hosting. Textbook: it might seem unnecessary because a TCP connection is already in place, but the information is required by Web proxy caches (§2.2.5).' },

    { id: 'http-messages-15', d: 1, type: 'mc', src: 'cheat',
      q: 'A browser includes `Connection: close` in its request. What is it telling the server?',
      choices: [
        'Keep this TCP connection open for future requests',
        'The browser window showing the page has been closed',
        'No persistent connection: close the TCP connection after sending the object',
        'It is closing its socket immediately, before any response arrives'
      ],
      a: 2,
      why: 'The Connection request header controls persistence; `Connection: close` avoids a persistent connection — the server should close the connection after sending the object. `Connection: keep-alive` would ask for the opposite.' },

    { id: 'http-messages-16', d: 2, type: 'mc', src: 'text',
      q: 'A request includes `Accept-language: fr`. What should the server do?',
      choices: [
        'Send the object only if it is in French; otherwise reply 404 Not Found',
        'Machine-translate the object into French before sending it',
        'Note that the client runs a French operating system',
        'Send a French version if the server has one; otherwise its default version'
      ],
      a: 3,
      why: '`Accept-language:` states a preference: send the French version if such an object exists, otherwise the default version. It is one of many content negotiation headers available in HTTP.' },

    { id: 'http-messages-17', d: 1, type: 'mc', src: 'cheat',
      q: 'In an HTTP response, what does the `Date:` header line indicate?',
      choices: [
        'When the server created and sent this response',
        'The time a cached copy of the object expires',
        'The time and date the object was last modified',
        'The time and date the client sent its request'
      ],
      a: 0,
      why: '`Date:` is when the server generated the response (retrieved the object from its file system, inserted it in the response and sent it). The object’s modification time is `Last-Modified:`; expiry is `Expires:`.' },

    { id: 'http-messages-18', d: 2, type: 'tf', src: 'ch2-P1d', ctx: P1,
      q: 'P1d: The `Date:` header in the HTTP response message indicates when the object in the response was last modified.',
      a: false,
      why: 'False. `Date:` gives the time the response was created and sent, not the object’s modification time. The `Last-Modified:` header gives when the object was created or last changed.' },

    { id: 'http-messages-19', d: 2, type: 'short', src: 'text',
      q: 'Explain the difference between the `Date:` and `Last-Modified:` response headers, and why `Last-Modified:` matters.',
      a: 'Date: is when the server created and sent this response. Last-Modified: is when the object itself was created or last changed. Last-Modified is critical for caching: browsers and proxy caches store it with the object and later ask the server whether the object has changed since then (conditional GET).',
      keys: ['Date = when the response was created/sent|response|sent|generated', 'Last-Modified = when the object last changed|object|changed|modified', 'matters for caching|cach|conditional'],
      why: 'Textbook: Date is “not the time when the object was created or last modified”. Last-Modified is critical for object caching, both in the local client and in network cache servers (proxies).' },

    { id: 'http-messages-20', d: 2, type: 'mc', src: 'cheat',
      q: 'What does the `Content-Length:` response header give?',
      choices: [
        'The number of TCP segments needed to carry the response',
        'The number of header lines in the response',
        'The number of bytes in the object (entity body) being sent',
        'The number of bits in the whole response, headers included'
      ],
      a: 2,
      why: 'Content-Length = payload size in bytes — the number of bytes in the object being sent. It says nothing about headers or segments, and it is bytes, not bits.' },

    { id: 'http-messages-21', d: 2, type: 'tf', src: 'text',
      q: 'A browser decides whether the entity body is HTML by looking at the file extension at the end of the URL.',
      a: false,
      why: 'False. The object type is officially indicated by the `Content-Type:` header (e.g., `text/html`), not by the file extension.' },

    { id: 'http-messages-22', d: 2, type: 'mc', src: 'cheat',
      q: 'The `Server:` response header (e.g., `Server: Apache/2.2.3 (CentOS)`) is analogous to which request header?',
      choices: ['`User-agent:`', '`Accept-language:`', '`Last-Modified:`', '`Host:`'],
      a: 0,
      why: '`Server:` names the software generating the response (an Apache Web server here), just as `User-agent:` names the browser that generated the request.' },

    { id: 'http-messages-23', d: 3, type: 'multi', src: 'cheat',
      q: 'Which header lines are related to caching? Select all that apply.',
      choices: ['`Host`', '`ETag`', '`Cache-Control`', '`User-agent`', '`Last-Modified`', '`Expires`'],
      a: [1, 2, 4, 5],
      why: 'Cheat sheet: caching-related headers such as Cache-Control, Expires and ETag. Textbook: Last-Modified is critical for object caching in the client and in proxy caches (it feeds the conditional GET’s If-Modified-Since). User-agent names the browser; Host names the target host.' },

    { id: 'http-messages-24', d: 3, type: 'mc', src: 'cheat',
      q: 'A response contains `Connection: close`, and the page still needs 3 more objects from the same server. What happens?',
      choices: [
        'The client must wait for the server’s idle timeout before requesting more',
        'The client reuses the same TCP connection for the remaining objects',
        'The server closes TCP after this response; each further object needs a new connection',
        'The server pushes the remaining objects without further requests'
      ],
      a: 2,
      why: '`Connection: close` in a response means the server will end TCP after this response. Each remaining object then needs a new connection: 2 RTT each (setup + request/response) instead of 1 RTT on a persistent connection. Server push is an HTTP/2 feature.' },

    { id: 'http-messages-25', d: 1, type: 'mc', src: 'cheat',
      q: 'What does status code `200 OK` mean?',
      choices: [
        'The object has not been modified since the given date',
        'The request succeeded and the object is returned in the response',
        'The requested object has moved permanently to a new URL',
        'The server could not understand the request it received'
      ],
      a: 1,
      why: '200 OK: request succeeded, content returned. Moved permanently = 301; could not understand = 400; not modified = 304 (conditional GET).' },

    { id: 'http-messages-26', d: 1, type: 'mc', src: 'cheat',
      q: 'Status code `404 Not Found` means:',
      choices: [
        'The requested document does not exist on this server',
        'The server does not support the requested HTTP version',
        'The server could not understand the request',
        'The object has moved to a new URL'
      ],
      a: 0,
      why: '404 = the document does not exist on the server. 400 = request not understood; 505 = HTTP version not supported; 301 = moved permanently.' },

    { id: 'http-messages-27', d: 2, type: 'short', src: 'cheat',
      q: 'What does status code 301 mean, where does the client find the object’s new location, and what does the client software do?',
      a: '301 Moved Permanently: the requested object has been permanently moved. The new URL is given in the `Location:` header of the response, and the client software automatically retrieves the new URL.',
      keys: ['Moved Permanently|moved permanently|permanently moved|permanent', 'new URL in the Location: header|location', 'client automatically fetches it|automatic|redirect|retriev|fetch'],
      why: 'Textbook §2.2.3 / cheat sheet: 301 Moved Permanently — the new URL is specified in the Location: header; the browser follows it automatically.' },

    { id: 'http-messages-28', d: 2, type: 'mc', src: 'cheat',
      q: 'Which status code is the generic error meaning the server could not understand the request?',
      choices: ['505 HTTP Version Not Supported', '404 Not Found', '400 Bad Request', '301 Moved Permanently'],
      a: 2,
      why: '400 Bad Request is the generic “could not understand the request” code. 404 means the request was understood but the document does not exist; 505 means the version is unsupported.' },

    { id: 'http-messages-29', d: 3, type: 'multi', src: 'text',
      q: 'Which scenario → status code pairings are correct? Select all that apply.',
      choices: [
        'The server receives a request it cannot parse → 400 Bad Request',
        'The requested document does not exist → 400 Bad Request',
        'The client uses an HTTP version the server does not support → 505 HTTP Version Not Supported',
        'The client requests a file that does not exist on the server → 404 Not Found',
        'The page was permanently moved to a new URL → 301 Moved Permanently',
        'The request succeeds and the object is returned → 301 Moved Permanently'
      ],
      a: [0, 2, 3, 4],
      why: '200 OK = success with content; 301 = moved permanently (Location: header); 400 = generic “not understood”; 404 = document doesn’t exist; 505 = HTTP version not supported. The two wrong pairings swap codes: success is 200 (not 301), and a missing document is 404 (not 400).' },

    { id: 'http-messages-30', d: 3, type: 'tf', src: 'ch2-P1e', ctx: P1,
      q: 'P1e: HTTP response messages never have an empty message body.',
      a: false,
      why: 'False. A response to a HEAD request carries the headers but no object, and a `304 Not Modified` reply to a conditional GET has an empty entity body. The entity body is “optional” in the general format.' },

    { id: 'http-messages-31', d: 2, type: 'num', src: 'text', ctx: BODY,
      q: 'How many bits are in the entity body? (Answer in bits.)',
      a: 54568, unit: 'bits',
      why: 'Content-Length counts bytes: 6821 bytes × 8 bits/byte = 54,568 bits.' },

    { id: 'http-messages-32', d: 3, type: 'num', src: 'text', ctx: BODY,
      q: 'Ignoring headers and propagation, how long does it take to transmit that entity body onto a 1 Mbps link? (Answer in ms.)',
      a: 54.568, unit: 'ms',
      why: 'L = 6821 × 8 = 54,568 bits; R = 1 Mbps = 10^{6} bits/s.\nL/R = 54,568 / 1,000,000 = 0.054568 s = 54.568 ms.\nTrap: using 6821 bits (forgetting × 8) gives 6.8 ms.' },

    { id: 'http-messages-33', d: 3, type: 'short', src: 'ch2-P3',
      q: 'P3: Consider an HTTP client that wants to retrieve a Web document at a given URL. The IP address of the HTTP server is initially unknown. What transport and application-layer protocols besides HTTP are needed in this scenario?',
      a: 'Application layer: DNS, to translate the hostname in the URL into the server’s IP address (in addition to HTTP). Transport layer: UDP to carry the DNS query and reply (port 53) and TCP to carry the HTTP request and response (port 80).',
      keys: ['DNS (application layer)|dns', 'UDP carries DNS|udp', 'TCP carries HTTP|tcp', 'resolves hostname to IP address|resolv|translat|ip address|hostname|lookup|look up'],
      why: 'HTTP, like SMTP, relies on DNS for hostname resolution: the browser extracts the hostname, the DNS client queries a DNS server (over UDP), gets the IP address, and then opens a TCP connection to that IP on port 80 for HTTP. (IP is used underneath both.)' },

    { id: 'http-messages-34', d: 3, type: 'short', src: 'ch2-P4a', ctx: P4,
      q: 'P4a: What is the URL of the document requested by the browser?',
      a: '`http://gaia.cs.umass.edu/cs453/index.html` — the host name comes from the `Host:` header line and the path `/cs453/index.html` from the request line.',
      keys: ['gaia.cs.umass.edu|gaia.cs.umass.edu', '/cs453/index.html|/cs453/index.html|cs453/index.html', 'Host: header + request line|host|request line'],
      why: 'A URL = hostname + path name. The request line carries only the path (`GET /cs453/index.html HTTP/1.1`); the hostname is in `Host: gaia.cs.umass.edu`. Combining them gives http://gaia.cs.umass.edu/cs453/index.html.' },

    { id: 'http-messages-35', d: 1, type: 'mc', src: 'ch2-P4b', ctx: P4,
      q: 'P4b: What version of HTTP is the browser running?',
      choices: ['HTTP/1.1', 'HTTP/1.0', 'It cannot be determined from the message', 'HTTP/2'],
      a: 0,
      why: 'The version is the third field of the request line: `GET /cs453/index.html HTTP/1.1`.' },

    { id: 'http-messages-36', d: 2, type: 'mc', src: 'ch2-P4c', ctx: P4,
      q: 'P4c: Does the browser request a non-persistent or a persistent connection?',
      choices: [
        'It cannot be told from an HTTP request',
        'Persistent — the `Connection:keep-alive` header line (with `Keep-Alive: 300`)',
        'Non-persistent — the message contains `Connection: close`',
        'Non-persistent — an HTTP/1.1 request always closes after one object'
      ],
      a: 1,
      why: 'The last header line is `Connection:keep-alive`, so the browser asks for a persistent connection. A non-persistent request would say `Connection: close`.' },

    { id: 'http-messages-37', d: 3, type: 'mc', src: 'ch2-P4d', ctx: P4,
      q: 'P4d: What is the IP address of the host on which the browser is running?',
      choices: [
        '127.0.0.1, since the browser always runs on the local host',
        'It is encoded in the Windows field of the User-Agent line',
        'It can’t be determined from the HTTP message — it is in the IP datagram header',
        'gaia.cs.umass.edu — it is given in the Host: header line'
      ],
      a: 2,
      why: 'Trick question. No HTTP header carries the client’s IP address. You would need the source address of the IP datagram that carried the TCP segment containing this GET. `Host:` names the server (and is a hostname, not an IP address).' },

    { id: 'http-messages-38', d: 2, type: 'short', src: 'ch2-P4e', ctx: P4,
      q: 'P4e: What type of browser initiates this message? Why is the browser type needed in an HTTP request message?',
      a: 'The `User-Agent:` line shows Mozilla/5.0 — a Netscape 7.2 browser (Gecko engine) on Windows NT 5.1. The browser type is sent so the server can send different versions of the same object (same URL) to different types of browsers.',
      keys: ['Mozilla/5.0 (Netscape 7.2)|mozilla|netscape', 'from the User-Agent line|user-agent|user agent', 'server sends different versions|different version|versions|tailor|customi', 'of the same object/URL|same object|same url|same'],
      why: 'Textbook: the User-agent header line specifies the browser type; it is useful because the server can send different versions of the same object, each addressed by the same URL, to different types of user agents.' },

    { id: 'http-messages-39', d: 2, type: 'num', src: 'ch2-P4', ctx: P4,
      q: 'How many header lines does this request message contain? (Do not count the request line or the blank line.)',
      a: 8, unit: 'header lines',
      why: 'Host, User-Agent, Accept, Accept-Language, Accept-Encoding, Accept-Charset, Keep-Alive, Connection = 8 header lines. The first line is the request line, and the final `<cr><lf>` alone is the blank line ending the headers; the entity body is empty (GET).' },

    { id: 'http-messages-40', d: 3, type: 'num', src: 'ch2-P4', ctx: P4,
      q: 'How many bytes does the request line `GET /cs453/index.html HTTP/1.1` occupy, including its terminating carriage return and line feed?',
      a: 32, unit: 'bytes',
      why: 'ASCII = 1 byte per character. “GET” (3) + space (1) + “/cs453/index.html” (17) + space (1) + “HTTP/1.1” (8) = 30 characters, plus CR (1) + LF (1) = 32 bytes.' },

    { id: 'http-messages-41', d: 2, type: 'short', src: 'ch2-P5a', ctx: P5,
      q: 'P5a: Was the server able to successfully find the document or not? What time was the document reply provided?',
      a: 'Yes — the status line is `HTTP/1.1 200 OK`. The reply was provided on Tue, 07 Mar 2008 at 12:39:45 GMT, as given by the `Date:` header line.',
      keys: ['yes: 200 OK|yes|200', 'Tue, 07 Mar 2008 12:39:45 GMT|07 mar 2008|7 mar 2008|12:39|march 7|mar 07', 'from the Date: header|date'],
      why: '200 OK means the request succeeded and the object is in the body. The `Date:` header is the time the response was created and sent — not the Last-Modified time (Sat, 10 Dec 2005).' },

    { id: 'http-messages-42', d: 1, type: 'mc', src: 'ch2-P5b', ctx: P5,
      q: 'P5b: When was the document last modified?',
      choices: ['Tue, 07 Mar 2008 12:39:45 GMT', 'It is not stated in the response', 'Sat, 10 Dec 2005 18:27:46 GMT', 'At the moment the response was sent'],
      a: 2,
      why: 'The `Last-Modified:` header line: Sat, 10 Dec 2005 18:27:46 GMT. The 2008 timestamp is the `Date:` header (when the response was sent).' },

    { id: 'http-messages-43', d: 1, type: 'num', src: 'ch2-P5c', ctx: P5,
      q: 'P5c: How many bytes are there in the document being returned?',
      a: 3874, unit: 'bytes',
      why: 'The `Content-Length: 3874` header line gives the number of bytes in the object (entity body): 3874 bytes.' },

    { id: 'http-messages-44', d: 3, type: 'short', src: 'ch2-P5d', ctx: P5,
      q: 'P5d (part 1): What are the first 5 bytes of the document being returned?',
      a: '`<!doc` — the entity body starts right after the blank line (the `<cr><lf>` on its own) that ends the header lines, with `<!doctype html public ...`; its first five characters are <, !, d, o, c.',
      keys: ['<!doc|doc', 'body starts after the blank line|blank|empty line|after the header|entity body|body'],
      why: 'Everything after the empty line is the entity body — the document itself. In ASCII each character is one byte, so the first 5 bytes are `<!doc`.' },

    { id: 'http-messages-45', d: 2, type: 'mc', src: 'ch2-P5d', ctx: P5,
      q: 'P5d (part 2): Did the server agree to a persistent connection?',
      choices: [
        'No — HTTP/1.1 servers always close after one object',
        'It cannot be determined from an HTTP response',
        'No — the response contains `Connection: close`',
        'Yes — `Connection: Keep-Alive` (with a `Keep-Alive:` header line)'
      ],
      a: 3,
      why: 'The response carries `Connection: Keep-Alive` and `Keep-Alive: timeout=max=100`, so the server agreed to keep the TCP connection open. Had it refused, it would have sent `Connection: close`.' },

    { id: 'http-messages-46', d: 2, type: 'mc', src: 'cheat',
      q: 'Which statement about host identifiers is correct?',
      choices: [
        'Hostnames are 32-bit numbers that DNS converts into text',
        'Routers forward datagrams using hostnames such as www.someschool.edu',
        'IPv4 addresses are 32-bit and used for routing; hostnames are for humans',
        'IPv4 addresses are 128-bit identifiers chosen by the users'
      ],
      a: 2,
      why: 'Routers need the 32-bit IPv4 address (IPv6 is 128 bits); people prefer domain names. DNS translates between hostnames and IP addresses.' },

    { id: 'http-messages-47', d: 2, type: 'tf', src: 'cheat',
      q: 'Application protocols such as HTTP and SMTP rely on DNS to translate the hostname a user supplies into an IP address.',
      a: true,
      why: 'True. Users type hostnames (URLs, e-mail domains); before HTTP or SMTP can open a TCP connection, DNS must resolve the hostname to an IP address.' },

    { id: 'http-messages-48', d: 2, type: 'mc', src: 'cheat',
      q: 'DNS lookups add delay to fetching a Web page. What reduces that delay (and DNS traffic)?',
      choices: [
        'Caching hostname-to-IP mappings in nearby DNS servers',
        'Including a Host: header in the request',
        'Running DNS over TCP instead of UDP',
        'Using persistent HTTP connections'
      ],
      a: 0,
      why: 'DNS adds delay, but caching in nearby DNS servers (e.g., the local DNS server) reduces latency and traffic: a cached mapping answers immediately without walking the DNS hierarchy. Persistent HTTP saves TCP setup RTTs, not DNS time; TCP would add a handshake.' },

    { id: 'http-messages-49', d: 3, type: 'short', src: 'cheat',
      q: 'Write a minimal HTTP/1.1 request that fetches `/notes/ch2.html` from `www.example.edu` and asks the server to close the connection after responding. Say where each CRLF goes.',
      a: '`GET /notes/ch2.html HTTP/1.1` CRLF\n`Host: www.example.edu` CRLF\n`Connection: close` CRLF\nthen an empty line (just CRLF) and no entity body.',
      keys: ['GET /notes/ch2.html HTTP/1.1|get /notes/ch2.html http/1.1', 'Host: www.example.edu|host: www.example.edu|host www.example.edu', 'Connection: close|connection: close|connection close', 'blank line (extra CRLF) at the end|blank|empty line|extra crlf|crlf crlf'],
      why: 'Request line = method sp URL sp version CRLF (the URL field holds the path). Host is required and names the server. `Connection: close` turns off persistence. The blank line (extra CRLF) ends the headers; a GET has no body.' },

    { id: 'http-messages-50', d: 2, type: 'mc', src: 'text',
      q: 'In the textbook’s telnet experiment (`telnet gaia.cs.umass.edu 80`, then type a request and press return twice), what change shows you only the HTTP message lines without receiving the object?',
      choices: ['Add a `Connection: close` header line', 'Replace GET with HEAD', 'Replace GET with PUT', 'Connect to port 25 instead of 80'],
      a: 1,
      why: 'HEAD returns the response message without the requested object. Telnet to port 80 opens a TCP connection to the Web server; pressing return twice sends the blank line that ends the request. Port 25 is SMTP.' },

    { id: 'http-messages-51', d: 1, type: 'num', src: 'cheat',
      q: 'What is the default HTTP server port number?',
      a: 80, unit: '',
      why: 'The default HTTP server port is 80 (HTTPS uses 443). That is why the telnet experiment connects to port 80.' },

    { id: 'http-messages-52', d: 2, type: 'short', src: 'text',
      q: 'Describe the two ways an HTML form’s input can reach the server, and where the input sits in each HTTP request.',
      a: 'With POST, the input is carried in the request’s entity body (the URL just names the page or script). With GET, the entity body is empty and the input is appended to the requested URL, e.g., `www.somesite.com/animalsearch?monkeys&bananas`.',
      keys: ['POST: input in the entity body|post', 'entity body|body', 'GET: input in the URL|get', 'appended to the URL (after ?)|url|query'],
      why: 'Textbook §2.2.3: POST is often used for forms (e.g., search words); its entity body holds what the user entered. But forms often use GET instead, placing the inputs in the URL.' },

    { id: 'http-messages-53', d: 1, type: 'mc', src: 'cheat',
      q: 'In a `200 OK` response to a GET request, what does the entity body contain?',
      choices: [
        'The header lines describing the object',
        'The requested object itself (e.g., the HTML file)',
        'The request message, echoed back to the client',
        'Only the status code and phrase, repeated'
      ],
      a: 1,
      why: 'A response message = status line, header lines, a blank line, then the entity body — “the meat of the message”, containing the requested object itself. Header lines come before the blank line, and the status line is the first line.' }
  ]);
})();
