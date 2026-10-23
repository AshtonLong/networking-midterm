(function () {
var UDP_CLIENT = [
  "from socket import *",
  "serverName = 'hostname'",
  "serverPort = 12000",
  "clientSocket = socket(AF_INET, SOCK_DGRAM)",
  "message = input('Input lowercase sentence:')",
  "clientSocket.sendto(message.encode(),(serverName, serverPort))",
  "modifiedMessage, serverAddress = clientSocket.recvfrom(2048)",
  "print(modifiedMessage.decode())",
  "clientSocket.close()"
].join('\n');

var UDP_SERVER = [
  "from socket import *",
  "serverPort = 12000",
  "serverSocket = socket(AF_INET, SOCK_DGRAM)",
  "serverSocket.bind(('', serverPort))",
  'print("The server is ready to receive")',
  "while True:",
  "    message, clientAddress = serverSocket.recvfrom(2048)",
  "    modifiedMessage = message.decode().upper()",
  "    serverSocket.sendto(modifiedMessage.encode(), clientAddress)"
].join('\n');

var TCP_CLIENT = [
  "from socket import *",
  "serverName = 'servername'",
  "serverPort = 12000",
  "clientSocket = socket(AF_INET, SOCK_STREAM)",
  "clientSocket.connect((serverName,serverPort))",
  "sentence = input('Input lowercase sentence:')",
  "clientSocket.send(sentence.encode())",
  "modifiedSentence = clientSocket.recv(1024)",
  "print('From Server: ', modifiedSentence.decode())",
  "clientSocket.close()"
].join('\n');

var TCP_SERVER = [
  "from socket import *",
  "serverPort = 12000",
  "serverSocket = socket(AF_INET,SOCK_STREAM)",
  "serverSocket.bind(('',serverPort))",
  "serverSocket.listen(1)",
  "print('The server is ready to receive')",
  "while True:",
  "    connectionSocket, addr = serverSocket.accept()",
  "    sentence = connectionSocket.recv(1024).decode()",
  "    capitalizedSentence = sentence.upper()",
  "    connectionSocket.send(capitalizedSentence.encode())",
  "    connectionSocket.close()"
].join('\n');

NET.addSection({
  id: 'sockets',
  unit: 2,
  order: 14,
  title: 'Socket programming with UDP & TCP',
  short: 'Sockets (UDP/TCP)',
  cheat: 'p.140–154',
  text: '§2.7',
  minutes: 40,
  summary: 'How a network application is actually written: a client program and a server program that read from and write to sockets. The section covers the textbook’s four Python programs (UDPClient, UDPServer, TCPClient, TCPServer) line by line. Exams ask you to reconstruct the code, explain what each call does (SOCK_DGRAM vs SOCK_STREAM, sendto/recvfrom vs send/recv, bind, listen, accept), count sockets, and predict what breaks when the client starts first.',
  mustKnow: [
    'A [[socket]] is the interface (the “door”) between an application process and the transport layer. The developer controls the application side; the [[operating system]] controls the transport side.',
    '`socket(AF_INET, SOCK_DGRAM)` creates a [[UDP]] socket and `socket(AF_INET, SOCK_STREAM)` creates a [[TCP]] socket. `AF_INET` means [[IPv4]].',
    'UDP: every `sendto(bytes, (host, port))` carries the [[destination address]]. `recvfrom(2048)` returns [[(data, source address)]], and the server replies to that address.',
    'TCP: `connect((host, port))` triggers the [[three-way handshake]], which the OS performs. After that, `send(bytes)` and `recv(1024)` take [[no address]].',
    'Servers `bind((\'\', port))` to a known port. Clients don’t bind: the [[OS picks the client’s port]].',
    'TCP server: `listen(1)` on the welcoming socket, then `accept()` returns a [[new connectionSocket]] plus the client address for each client. Close only connectionSocket; serverSocket stays open.',
    'Socket count: a UDP server needs [[1 socket]] for all clients. A TCP server with n simultaneous clients needs [[n + 1]].',
    'Python 3 sockets carry bytes: [[encode()]] (str → bytes) before sending, [[decode()]] (bytes → str) after receiving.',
    'The server must already be running: a TCP client fails at [[connect()]], and a UDP datagram sent to a port with no socket is simply lost.',
    'Open (RFC-defined) apps use the protocol’s [[well-known port]]. Proprietary apps must [[avoid well-known ports]].',
    'TCP gives a reliable, ordered, bidirectional [[byte stream]] (a pipe) with no message boundaries. UDP sends individual [[messages]] best-effort.'
  ],
  topics: [
    {
      title: 'A network app = a client program + a server program + sockets',
      src: 'both',
      blocks: [
        { p: 'A network application is built as [[two programs, a client and a server]], running on different end systems. When executed they become [[processes]] that communicate by [[reading from and writing to sockets]]. The developer’s main job is writing **both** programs.' },
        { def: 'Socket', text: 'The interface between an application process and the end-to-end transport layer: the endpoint or gateway through which the application talks to the transport protocol, [[TCP or UDP]]. It is also called the API between the application and the network. Analogy: the process is a house and the socket is its [[door]].' },
        { list: [
          'The developer controls [[everything on the application side]] of the socket.',
          'The transport, network, link and physical layers on the other side are controlled by the [[operating system]], so the developer has little control there.',
          'The developer’s only transport-side controls are (1) the [[choice of transport protocol]] and (2) perhaps a few parameters such as maximum buffer and segment sizes.'
        ] },
        { p: 'The first design decision is [[TCP or UDP]]. TCP is connection-oriented and gives a reliable byte-stream channel. UDP is connectionless and sends independent packets with no delivery guarantees.' }
      ]
    },
    {
      title: 'Open vs proprietary applications, and choosing a port',
      src: 'both',
      blocks: [
        { table: { head: ['', 'Open (standardised)', 'Proprietary'], rows: [
          ['Protocol', 'specified in a public standard such as an [[RFC]], so the rules are known to all', 'a [[private, unpublished]] application-layer protocol'],
          ['Who writes the code', 'independent developers (Chrome talking to Apache; a BitTorrent client talking to a tracker)', 'one developer or team writes **both** client and server'],
          ['Interoperability', 'programs interoperate if both follow the RFC', 'outside developers [[cannot interoperate]]'],
          ['Port number', 'use the protocol’s assigned [[well-known port]] (HTTP: 80)', '[[avoid well-known ports]] (the textbook arbitrarily picks 12000)']
        ] }, caption: 'Two kinds of network application' },
        { trap: 'A proprietary app that grabs a well-known port (0–1023), such as 80, can collide with the standard service on that host, and other software will assume it speaks that standard protocol. Only an implementation of the RFC protocol should use the RFC’s port.' }
      ]
    },
    {
      title: 'The running example and how UDP sockets work',
      src: 'both',
      blocks: [
        { steps: [
          'The client reads a line of characters from its keyboard and sends it to the server.',
          'The server receives the data and converts the characters to [[uppercase]].',
          'The server sends the modified data back to the client.',
          'The client receives the modified data and displays the line on its screen.'
        ], title: 'The textbook’s capitalisation app (used for both UDP and TCP)' },
        { p: 'With UDP, before a packet goes out the door, the sender must attach a [[destination address]]: the destination host’s [[IP address]] (routers use it to reach the host) plus the destination socket’s [[port number]] (to pick the right socket on that host). This happens on **every** packet. A port number is assigned to each socket when it is created.' },
        { list: [
          'The [[source address]] (source IP and source port) is also attached, but [[by the operating system]], not by the application code.',
          'The receiver learns the sender’s IP and port from the arriving packet. That is its [[return address]] for replying.',
          'UDP is [[best-effort]]: packets can be lost, duplicated or arrive out of order.',
          'The UDP server must be running [[before the client sends]] its message. A process idles with its socket bound, waiting.'
        ] },
        { steps: [
          'Server (on serverIP): create `serverSocket = socket(AF_INET, SOCK_DGRAM)` and bind it to port x.',
          'Client: create `clientSocket = socket(AF_INET, SOCK_DGRAM)`.',
          'Client: create a datagram addressed to serverIP, port x, and send it via clientSocket.',
          'Server: read the UDP segment from serverSocket.',
          'Server: write the reply to serverSocket, specifying the client’s address and port number.',
          'Client: read the reply datagram from clientSocket.',
          'Client: close clientSocket.'
        ], title: 'UDP client-server activity (Figure 2.27)' }
      ]
    },
    {
      title: 'UDPClient.py line by line',
      src: 'both',
      blocks: [
        { code: UDP_CLIENT, caption: 'UDPClient.py (textbook §2.7.1)' },
        { table: { head: ['Line', 'What it does'], rows: [
          ['`from socket import *`', 'Imports the socket module, the basis of all network communication in Python, so the program can create sockets.'],
          ["`serverName = 'hostname'`", 'The server’s IP address (for example "128.138.32.126") or hostname (for example "cis.poly.edu"). A hostname triggers an automatic **DNS lookup** to get the IP.'],
          ['`serverPort = 12000`', 'The server’s port number, an arbitrary non-well-known port.'],
          ['`clientSocket = socket(AF_INET, SOCK_DGRAM)`', 'Creates the client’s socket. `AF_INET` means the network uses **IPv4**; `SOCK_DGRAM` means a **UDP** socket. No client port is given: the **OS** picks one.'],
          ["`message = input('Input lowercase sentence:')`", 'Prompts the user and stores the typed line in `message` (a str).'],
          ['`clientSocket.sendto(message.encode(),(serverName, serverPort))`', '`encode()` converts str → bytes. `sendto()` attaches the destination address (serverName, serverPort) and sends the packet into the socket. The OS adds the source address.'],
          ['`modifiedMessage, serverAddress = clientSocket.recvfrom(2048)`', 'Waits for a packet. Its data goes into `modifiedMessage`, and its source address (server IP and port) into `serverAddress`. **2048** is the buffer size. The client doesn’t really need serverAddress, since it already knows it.'],
          ['`print(modifiedMessage.decode())`', 'Converts bytes → str and displays the capitalised line.'],
          ['`clientSocket.close()`', 'Closes the socket. The process then terminates.']
        ] } },
        { trap: 'The UDP client never calls `bind()`. The operating system assigns the client’s port automatically. Only the server needs a fixed, known port.' },
        { trap: 'Python 3 sockets send and receive **bytes**, not strings. Call `encode()` before `sendto()`/`send()` and `decode()` after `recvfrom()`/`recv()`.' }
      ]
    },
    {
      title: 'UDPServer.py line by line',
      src: 'both',
      blocks: [
        { code: UDP_SERVER, caption: 'UDPServer.py (textbook §2.7.1)' },
        { table: { head: ['Line', 'What it does'], rows: [
          ['`from socket import *` / `serverPort = 12000`', 'Same start as the client: import the module and set the port.'],
          ['`serverSocket = socket(AF_INET, SOCK_DGRAM)`', 'Creates a UDP (`SOCK_DGRAM`) IPv4 socket.'],
          ["`serverSocket.bind(('', serverPort))`", 'The first line that really differs from the client. It **binds** (assigns) port 12000 to the server’s socket, explicitly in the code. Anyone sending to port 12000 at the server’s IP reaches this socket. The empty string means any of this host’s IP addresses.'],
          ['`print("The server is ready to receive")`', 'Signals that the server is up.'],
          ['`while True:`', 'Loops forever, receiving and processing packets from any client.'],
          ['`message, clientAddress = serverSocket.recvfrom(2048)`', 'Waits for a packet. The data goes into `message`; the source address (client IP **and** port) goes into `clientAddress`, which is the **return address** for the reply.'],
          ['`modifiedMessage = message.decode().upper()`', 'The heart of the app: bytes → str, then capitalise.'],
          ['`serverSocket.sendto(modifiedMessage.encode(), clientAddress)`', 'Attaches the client’s address to the capitalised bytes and sends them into the server’s socket. The OS adds the server address. Then the loop waits for the next packet from any client on any host.']
        ] } },
        { p: 'To test: run [[UDPServer.py first]] on the server host (its process idles until contacted), then UDPClient.py on another host with the correct server hostname or IP. Type a sentence and press Enter. Possible modifications: have the server count the letter “s” and return the count, or let the client keep sending sentences.' },
        { trap: 'A UDP server uses [[one socket for every client]]. Each arriving datagram carries its sender’s address, and the server simply replies to `clientAddress`. There is no per-client socket and no `listen()`/`accept()` in UDP.' }
      ]
    },
    {
      title: 'TCP connection basics: handshake, welcoming socket, pipe',
      src: 'both',
      blocks: [
        { p: 'TCP is [[connection-oriented]]: before client and server send data, they handshake and establish a TCP connection. The [[three-way handshake]] takes place in the transport layer, managed by the [[operating system]], and is completely invisible to the client and server programs. The client triggers it with `connect()`.' },
        { diagram: 'tcp-handshake' },
        { def: 'TCP connection', text: 'Links the [[client IP:port]] and the [[server IP:port]]. One end is attached to the client socket and the other to a server socket.' },
        { list: [
          'Once the connection exists, each side just drops bytes into its socket [[without specifying the destination again]]. Contrast UDP, which attaches a destination to every packet.',
          'TCP provides a [[reliable, ordered, bidirectional byte stream]] between the connected sockets, like a [[pipe]]: every byte the client sends arrives at the server, in order.',
          'Both sides send **and** receive through the same socket, just as people go in and out through the same door.'
        ] },
        { p: 'For the server to react to a client’s first contact, it must be ready in two ways: (1) like UDP, it must already be [[running as a process]]; (2) it must have a special [[welcoming socket]] that accepts initial contact from a client on any host. The client “knocks on the welcoming door” by creating its socket and specifying the server’s IP and the welcoming socket’s port.' },
        { p: 'When the server “hears” the knock, it creates a [[new socket dedicated to that client]]. In the code, the welcoming socket is `serverSocket` and the per-client socket is `connectionSocket`. So a TCP server process has [[two sockets]] (Figure 2.28). The client’s socket and the server’s connection socket are joined by the pipe.' },
        { trap: 'Don’t confuse the **welcoming socket** (`serverSocket`, the initial point of contact for all clients, which never carries client data in this program) with the **connection socket** (`connectionSocket`, created by `accept()` for one client, which carries that client’s bytes).' },
        { steps: [
          'Server (on serverIP): create `serverSocket` (TCP) on port x for incoming requests.',
          'Server: wait for an incoming connection request with `connectionSocket = serverSocket.accept()`.',
          'Client: create `clientSocket` and connect to serverIP, port x. The TCP connection setup (three-way handshake) happens here.',
          'Client: send the request using clientSocket.',
          'Server: read the request from connectionSocket.',
          'Server: write the reply to connectionSocket.',
          'Client: read the reply from clientSocket.',
          'Server closes connectionSocket; client closes clientSocket.'
        ], title: 'TCP client-server activity (Figure 2.29)' }
      ]
    },
    {
      title: 'TCPClient.py line by line',
      src: 'both',
      blocks: [
        { code: TCP_CLIENT, caption: 'TCPClient.py (textbook §2.7.2)' },
        { table: { head: ['Line', 'What it does'], rows: [
          ['`clientSocket = socket(AF_INET, SOCK_STREAM)`', 'Creates an IPv4 **TCP** socket (`SOCK_STREAM`). Again no client port is given: the OS picks it.'],
          ['`clientSocket.connect((serverName,serverPort))`', 'Very different from UDP. It initiates the TCP connection to the server’s welcoming socket; the argument is the server side’s address. The **three-way handshake** runs, and the connection is established.'],
          ["`sentence = input('Input lowercase sentence:')`", 'Reads a line from the user.'],
          ['`clientSocket.send(sentence.encode())`', 'Drops the bytes into the TCP connection. There is **no destination address** and no explicit packet, unlike `sendto()`.'],
          ['`modifiedSentence = clientSocket.recv(1024)`', 'Waits for bytes from the server, up to **1024** bytes per call.'],
          ["`print('From Server: ', modifiedSentence.decode())`", 'Decodes and prints the reply.'],
          ['`clientSocket.close()`', 'Closes the socket **and therefore the TCP connection**. TCP in the client sends a TCP message to TCP in the server (connection teardown, §3.5).']
        ] } },
        { p: 'The textbook’s listing uses `recv(1024)`, while its line-by-line commentary shows `recv(2048)`. Either way, the argument is just the [[maximum number of bytes]] returned by one call.' }
      ]
    },
    {
      title: 'TCPServer.py line by line',
      src: 'both',
      blocks: [
        { code: TCP_SERVER, caption: 'TCPServer.py (textbook §2.7.2)' },
        { table: { head: ['Line', 'What it does'], rows: [
          ['`serverSocket = socket(AF_INET,SOCK_STREAM)`', 'Creates the TCP socket that becomes the **welcoming socket**.'],
          ["`serverSocket.bind(('',serverPort))`", 'Associates port 12000 with the welcoming socket, as in UDPServer.'],
          ['`serverSocket.listen(1)`', 'Listens for TCP connection requests (knocks on the door). The parameter is the **maximum number of queued connections** (at least 1).'],
          ["`print('The server is ready to receive')`", 'Signals readiness.'],
          ['`connectionSocket, addr = serverSocket.accept()`', 'Blocks until a client knocks, then creates a **new socket dedicated to that client** (`connectionSocket`) and returns it with the client’s address `addr` (IP, port). The handshake completes, linking the client’s clientSocket to this connectionSocket.'],
          ['`sentence = connectionSocket.recv(1024).decode()`', 'Reads up to 1024 bytes from **this client’s** connection and converts them to str.'],
          ['`capitalizedSentence = sentence.upper()`', 'Capitalises the line.'],
          ['`connectionSocket.send(capitalizedSentence.encode())`', 'Sends the reply bytes on the connection, with no address needed.'],
          ['`connectionSocket.close()`', 'Closes **only** this client’s connection. `serverSocket` stays open, so another client can knock and be served.']
        ] } },
        { trap: 'The server closes `connectionSocket`, never `serverSocket`, inside the loop. Closing the welcoming socket would stop the server from accepting any further clients.' },
        { game: 'code-order', text: 'Rebuild all four programs from shuffled lines until you can write them from memory. Exams love “put these lines in order” and “fill in the missing call”.' }
      ]
    },
    {
      title: 'UDP vs TCP programs side by side',
      src: 'both',
      blocks: [
        { table: { head: ['', 'UDP', 'TCP'], rows: [
          ['Socket type', '`SOCK_DGRAM`', '`SOCK_STREAM`'],
          ['Connection setup', 'none', '`connect()` on the client triggers the three-way handshake (done by the OS); `listen()` + `accept()` on the server'],
          ['Addressing when sending', 'destination on **every** packet: `sendto(data, (host, port))`', 'only once, in `connect()`; then `send(data)`'],
          ['Receiving', '`recvfrom(2048)` returns (data, sender address)', '`recv(1024)` returns data only (the peer is fixed by the connection)'],
          ['Server sockets', '1 socket for all clients', '1 welcoming socket + 1 connection socket per client'],
          ['Client port', 'chosen by the OS', 'chosen by the OS'],
          ['Server bind', "`bind(('', 12000))`", "`bind(('',12000))`"],
          ['Data unit', 'individual messages (boundaries preserved)', 'byte stream (no boundaries)'],
          ['Delivery', 'best-effort: loss, duplication, reordering possible', 'reliable and in order'],
          ['Server must run first?', 'yes, by the time the client **sends**', 'yes, before the client **connects**']
        ] }, caption: 'The comparison exams test most' },
        { list: [
          'Shared by all four programs: the wildcard import of the socket module (`from socket import` followed by an asterisk), `AF_INET`, `encode()`/`decode()`, port 12000, and `close()`.',
          'Only in UDP: [[sendto]] and [[recvfrom]].',
          'Only in TCP: [[connect]] (client), [[listen]] and [[accept]] (server), and [[send]]/[[recv]].'
        ] }
      ]
    },
    {
      title: 'Counting sockets and who must start first',
      src: 'both',
      blocks: [
        { p: 'Why does the UDP server need [[one socket]] while the TCP server needs [[two]] (textbook R26)? UDP has no connections: datagrams from all clients enter the same socket, each carrying its sender’s address. TCP has a welcoming socket, and **each** time a client connects, `accept()` creates a new connection socket. With n simultaneous connections the TCP server has [[n + 1]] sockets: one welcoming socket plus n connection sockets.' },
        { list: [
          'A server that accepted two TCP connections has [[3 sockets]]: one listening socket and two connected sockets. The listening socket stays available for more clients.',
          'One server process can manage several connected sockets, and the OS distinguishes them by the four-tuple (source IP, source port, dest IP, dest port).',
          'A client that talks to two TCP servers needs two connected sockets (one handshake each) and no listening socket.'
        ] },
        { example: { q: 'One server host runs UDPServer.py and TCPServer.py at the same time. Three TCP clients are currently connected, and two UDP clients are sending. How many sockets do the two server programs have open?', a: 'UDPServer: **1** socket serves both UDP clients.\nTCPServer: 1 welcoming socket + 3 connection sockets = **4**.\nTotal = **5** sockets. (The textbook’s TCPServer actually serves clients one at a time, but a server supporting n simultaneous connections has n + 1 sockets.)' } },
        { p: 'Who must start first (textbook R27, P28)? In TCPClient, the **first** network action is `connect()`, which runs immediately when the program starts. If no server is listening on that port, the handshake fails and [[no TCP connection is made]]. In UDPClient, nothing is sent until the user has typed a line and `sendto()` runs. So the client can be started first, as long as the server is [[running by the time the datagram is sent]]. If it isn’t, the datagram is simply lost and the client waits forever in `recvfrom()`.' },
        { trap: 'If the client’s `serverPort` doesn’t match the port the server bound, the client reaches the wrong process or no process. With TCP the connection fails; with UDP the datagram is lost or delivered to the wrong app. The client’s **own** port being different from 12000 is normal: the OS picks it.' },
        { game: 'demux', text: 'Route arriving segments to sockets and see why one UDP socket serves every client while TCP needs a connection socket per 4-tuple.' }
      ]
    },
    {
      title: 'Byte streams vs messages, fast transactions, parallel connections',
      src: 'text',
      blocks: [
        { p: 'TCP sockets treat data as a [[byte stream]]: two `send()` calls may arrive in one `recv()`, and one `send()` may be split across several. The application must mark its own message boundaries (HTTP, for example, uses CRLF-terminated lines and Content-Length). UDP sockets [[preserve message boundaries]]: each `sendto()` is one message that arrives whole or not at all, but each message must fit in one datagram (textbook P31).' },
        { example: { q: 'Textbook R6 idea: you want a transaction from a remote client to a server done as fast as possible. With RTT = 50 ms and negligible transmission time, how long until the client has the reply over UDP, and over TCP?', a: 'UDP: no handshake. The request goes in the first datagram, so the reply arrives after **1 RTT = 50 ms**.\nTCP: 1 RTT for the handshake (SYN, SYNACK), then 1 RTT for request and reply (the request can ride on the third handshake segment), so **2 RTT = 100 ms** at minimum.\nUDP wins for a single quick transaction; the application must handle any loss itself.' } },
        { p: 'Parallel connections (textbook P30): many browsers can be configured to open several simultaneous TCP connections to a site (HTTP/1.1 browsers typically use up to 6). Advantages: objects download in parallel, which avoids head-of-line blocking, and the browser grabs a [[larger share of the bottleneck bandwidth]]. Disadvantages: it [[hogs bandwidth]] from other users sharing the links, adds sockets and per-connection state at the server, and each connection pays its own handshake.' },
        { p: 'Binding a client port (textbook P29): adding `clientSocket.bind((\'\', 5432))` to UDPClient fixes the client’s port at 5432 instead of letting the OS choose. UDPServer needs [[no change]], because it never hard-codes the client’s port. It reads the port from `clientAddress` in each datagram.' }
      ]
    }
  ],
  recall: [
    { q: 'Define a socket.', a: 'The interface (door) between an application process and the transport layer; the API through which the app talks to TCP or UDP.' },
    { q: 'What does the developer control, and what does the OS control?', a: 'The developer controls the application side of the socket (plus the choice of TCP or UDP and a few parameters). The OS controls the transport, network, link and physical layers.' },
    { q: 'Open vs proprietary app: which port should each use?', a: 'Open (RFC) app: the protocol’s well-known port. Proprietary app: avoid well-known ports.' },
    { q: 'Write the line that creates a UDP socket, and the one that creates a TCP socket.', a: 'socket(AF_INET, SOCK_DGRAM) for UDP and socket(AF_INET, SOCK_STREAM) for TCP. AF_INET = IPv4.' },
    { q: 'What does UDPClient’s send line look like?', a: 'clientSocket.sendto(message.encode(),(serverName, serverPort))' },
    { q: 'What does recvfrom(2048) return?', a: 'A pair: (data, source address), where the source address is (IP, port). 2048 is the buffer size.' },
    { q: 'Write the UDP server’s bind line. Why doesn’t the client bind?', a: "serverSocket.bind(('', serverPort)). The server needs a known port; the client lets the OS pick its port." },
    { q: 'Who attaches the source IP and port to a UDP packet?', a: 'The operating system, automatically, not the application code.' },
    { q: 'What does connect((serverName, serverPort)) do?', a: 'Initiates the TCP connection to the server’s welcoming socket; the OS performs the three-way handshake.' },
    { q: 'What does listen(1) mean?', a: 'Start listening for connection requests; 1 is the maximum number of queued connections (at least 1).' },
    { q: 'What does accept() return?', a: '(connectionSocket, addr): a new socket dedicated to that client, and the client’s address (IP, port).' },
    { q: 'At the end of each TCPServer loop iteration, which socket is closed?', a: 'Only connectionSocket. serverSocket stays open for the next client.' },
    { q: 'How many sockets does a TCP server need for n simultaneous connections? A UDP server?', a: 'TCP: n + 1 (welcoming socket plus one per connection). UDP: 1.' },
    { q: 'Why must the TCP server be started before the TCP client?', a: 'The client calls connect() immediately. With no listening welcoming socket, the handshake fails and no connection is made.' },
    { q: 'Why can the UDP client be started before the UDP server?', a: 'It sends nothing until the user types a line, so it works as long as the server is running by the time sendto() runs.' },
    { q: 'What do encode() and decode() do here?', a: 'encode(): str → bytes before sending; decode(): bytes → str after receiving. Sockets carry bytes.' },
    { q: 'What happens if serverName is a hostname instead of an IP?', a: 'A DNS lookup is automatically performed to get the IP address.' },
    { q: 'What is the first line of every textbook socket program, and why?', a: 'from socket import * : it imports the socket module so the program can create sockets.' },
    { q: 'Byte stream vs messages: which is TCP, and what is the consequence?', a: 'TCP is a byte stream with no message boundaries, so the app must delimit its own messages. UDP preserves message boundaries, but each message must fit in one datagram.' }
  ]
});
})();
