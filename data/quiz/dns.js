NET.addQuestions('dns', [
  // ---------- Basics, services, design ----------
  { id: 'dns-01', d: 1, type: 'mc', src: 'cheat',
    q: 'DNS queries are normally carried by which transport protocol and port?',
    choices: ['TCP port 25', 'TCP port 53', 'UDP port 53', 'UDP port 80'],
    a: 2,
    why: 'All DNS query and reply messages are sent in UDP datagrams to port 53. TCP 25 is SMTP, and port 80 is HTTP. The usual trap is TCP 53: DNS needs no connection setup for a one-question, one-answer exchange.' },

  { id: 'dns-02', d: 1, type: 'mc', src: 'cheat',
    q: 'Which best describes DNS?',
    choices: ['A transport-layer protocol that replaces port numbers with names', 'A single central database run by IANA that every host queries', 'A distributed, hierarchical database of name servers plus an application-layer protocol for querying it', 'A network-layer protocol implemented in routers that rewrites hostnames into IP addresses'],
    a: 2,
    why: 'DNS is both (1) a distributed database implemented in a hierarchy of servers and (2) an application-layer protocol. It runs on end systems at the network edge, not in routers, and is deliberately not centralized.' },

  { id: 'dns-03', d: 1, type: 'tf', src: 'cheat',
    q: 'True or false: Routers prefer hostnames over IP addresses because hostnames indicate where the host is located.',
    a: false,
    why: 'False. Hostnames are variable-length and say little about location, so routers would find them hard to process. Routers use fixed-length, hierarchical IP addresses (32 bits for IPv4). Hostnames exist for humans, and DNS translates between the two.' },

  { id: 'dns-04', d: 1, type: 'multi', src: 'cheat',
    q: 'Which of these services does DNS provide? Select all that apply.',
    choices: ['Mail server aliasing', 'Encryption of Web traffic', 'Host aliasing (alias → canonical hostname)', 'Reliable delivery of e-mail messages', 'Hostname-to-IP-address translation', 'Load distribution among replicated servers'],
    a: [0, 2, 4, 5],
    why: 'DNS provides translation, host aliasing, mail server aliasing (via MX records) and load distribution (a rotating set of IP addresses for one name). E-mail delivery is SMTP’s job, and encryption is TLS’s.' },

  { id: 'dns-05', d: 1, type: 'mc', src: 'cheat',
    q: 'cnn.com is replicated on several servers. Each DNS reply for cnn.com contains the whole set of IP addresses, but in a rotated order. Which DNS service is this?',
    choices: ['Load distribution', 'Host aliasing', 'Caching', 'Mail server aliasing'],
    a: 0,
    why: 'Load distribution: one name maps to a set of addresses, and DNS rotates their order in each reply. Clients usually use the first address listed, so traffic spreads across the replicas. Host aliasing maps an alias to a canonical name, which is a different service.' },

  { id: 'dns-07', d: 2, type: 'mc', src: 'cheat',
    q: 'Bob’s address is bob@yahoo.com, but Yahoo’s mail server is really called relay1.west-coast.yahoo.com. Which DNS feature makes this work, and through which record type?',
    choices: ['Mail server aliasing, through an MX record', 'Host aliasing, through an A record', 'Load distribution, through an NS record', 'Mail server aliasing, through an NS record'],
    a: 0,
    why: 'Mail server aliasing maps an easy-to-remember mail domain to the canonical mail-server name through MX records. An A record maps a name to an IP address, and an NS record names an authoritative DNS server, so neither does this job.' },

  { id: 'dns-08', d: 2, type: 'multi', src: 'cheat',
    q: 'Why is DNS not implemented as one centralized server? Select all that apply.',
    choices: ['Central servers cannot cache records', 'It would be far away from most clients, adding high latency', 'It would be huge and hard to keep updated for every new host', 'It could not handle the enormous query traffic volume', 'It would be a single point of failure', 'A central server could only use TCP, which DNS forbids'],
    a: [1, 2, 3, 4],
    why: 'The four textbook reasons are single point of failure, traffic volume, distant centralized database, and maintenance. In short, it doesn’t scale. The TCP and caching options are made up: the choice of transport has nothing to do with centralization, and any server can cache.' },

  { id: 'dns-09', d: 2, type: 'short', src: 'cheat',
    q: 'DNS is a core Internet service, yet it is implemented at the application layer rather than in routers. Explain how this fits the Internet’s design philosophy.',
    a: 'DNS translation is performed by DNS clients and servers running on end systems at the network edge, using UDP like any other application, while routers in the core only forward packets. This follows the principle of keeping most complexity at the network edge rather than in the core.',
    keys: ['edge', 'core|routers', 'application layer|end systems|clients and servers', 'complexity'],
    why: 'The textbook’s “Principles in Practice” box notes that DNS, a critical core function, is implemented with clients and servers at the edge, another example of putting complexity at the edges. Users don’t interact with DNS directly; HTTP, SMTP and other applications call it.' },

  { id: 'dns-10', d: 2, type: 'order', src: 'cheat',
    q: 'A user types www.someschool.edu/index.html into a browser. Order the steps up to the TCP connection.',
    items: ['Browser extracts the hostname from the URL', 'Browser passes the hostname to the DNS client on the same machine', 'DNS client sends a query containing the hostname to a DNS server', 'DNS client receives a reply containing the IP address', 'Browser opens a TCP connection to that IP address on port 80'],
    why: 'DNS runs first and adds delay before any HTTP traffic. Only once the IP address is known can the browser connect to the HTTP server process at port 80.' },

  { id: 'dns-11', d: 1, type: 'tf', src: 'cheat',
    q: 'True or false: Besides Web browsers, other application protocols such as SMTP also rely on DNS to translate hostnames into IP addresses.',
    a: true,
    why: 'True. Many application protocols, including HTTP and SMTP, rely on DNS for hostname resolution; mail servers are not configured with a table of every other mail server’s address. A mail server finds the recipient’s mail server by querying DNS, using MX records for mail server aliasing.' },

  // ---------- Hierarchy ----------
  { id: 'dns-12', d: 1, type: 'mc', src: 'cheat',
    q: 'The three levels of the DNS server hierarchy are:',
    choices: ['Root, top-level domain (TLD), authoritative', 'Local, root, authoritative', 'Root, regional, local', 'Root, TLD, local'],
    a: 0,
    why: 'The hierarchy is root → TLD → authoritative. The local DNS server is central to DNS but **not** part of the hierarchy; it is the host’s proxy into it.' },

  { id: 'dns-13', d: 1, type: 'mc', src: 'cheat',
    q: 'What is the main role of a root DNS server?',
    choices: ['Provide the IP addresses of TLD servers', 'Provide the IP address of the requested host', 'Register new domain names', 'Provide the IP addresses of local DNS servers'],
    a: 0,
    why: 'Root servers point you to the TLD servers (for example, those for com or edu). Authoritative servers give the host’s address, local servers are learned via DHCP, and registrars register names.' },

  { id: 'dns-14', d: 1, type: 'mc', src: 'cheat',
    q: 'What does a TLD DNS server return in the normal resolution procedure?',
    choices: ['The IP address of the requested host', 'The IP address of an authoritative DNS server for the domain', 'The IP addresses of the root servers', 'The MX record of every host in the TLD'],
    a: 1,
    why: 'A TLD server (e.g. com) knows which authoritative server handles amazon.com and returns its address. The authoritative server then returns the host’s IP address.' },

  { id: 'dns-15', d: 1, type: 'tf', src: 'cheat',
    q: 'True or false: The local DNS server is one of the three levels of the DNS hierarchy.',
    a: false,
    why: 'False. The local DNS server “does not strictly belong to the hierarchy” but is central to DNS. It acts as a proxy that forwards host queries into the root/TLD/authoritative hierarchy.' },

  { id: 'dns-16', d: 2, type: 'order', src: 'cheat',
    q: 'To a first approximation, order the servers a client contacts to resolve www.amazon.com, from first to last.',
    items: ['A root server, which returns the addresses of com TLD servers', 'A com TLD server, which returns the address of an amazon.com authoritative server', 'An amazon.com authoritative server, which returns the IP address of www.amazon.com'],
    why: 'Each level refers you one step down: root → com TLD → amazon.com authoritative. Only the last one actually holds the hostname-to-IP mapping.' },

  { id: 'dns-17', d: 1, type: 'num', src: 'cheat',
    q: 'How many distinct root servers is the root DNS service built from (each replicated as many instances)?',
    a: 13, unit: 'root servers', tol: 0,
    why: 'There are 13 root servers. Each is replicated worldwide: the lecture cites about 2000 instances handling tens of billions of queries daily, and the 2020 textbook says “more than 1000” instances. They are run by multiple organizations (12 per the textbook) and coordinated by IANA.' },

  { id: 'dns-18', d: 2, type: 'mc', src: 'cheat',
    q: 'Which description of the root DNS service is correct?',
    choices: ['One root server per country, coordinated by ICANN-accredited registrars', 'Copies of 13 root servers, run by multiple organizations under IANA coordination, about 2000 instances worldwide', '13 physical machines, each run by Verisign', 'A single root server in the United States with 13 backup copies'],
    a: 1,
    why: 'Per the lecture: a small set of 13 root servers, replicated as about 2000 instances worldwide, run by multiple organizations and coordinated by IANA, handling tens of billions of queries a day. Verisign runs the .com TLD, not the root, and registrars register names.' },

  { id: 'dns-19', d: 1, type: 'mc', src: 'cheat',
    q: 'Which pairing of TLD and the organization that maintains its servers is correct?',
    choices: ['ICANN runs every TLD directly', 'IANA runs .com, and Verisign runs .edu', 'Verisign runs .com, and Educause runs .edu', 'Verisign runs .edu, and Educause runs .com'],
    a: 2,
    why: 'Verisign Global Registry Services maintains the com TLD servers, and Educause maintains the edu TLD servers. Each TLD (com, org, net, edu, gov, uk, fr, ca, jp…) has one server or a cluster.' },

  { id: 'dns-20', d: 2, type: 'mc', src: 'text',
    q: 'Which organizations must provide publicly accessible authoritative DNS records?',
    choices: ['Every organization with publicly accessible hosts such as Web or mail servers (it may run its own server or pay a provider)', 'Only ISPs', 'Only organizations whose hosts use IPv6', 'Only organizations that own a TLD'],
    a: 0,
    why: 'Anyone with public hosts must publish the name → address records, either on their own authoritative server or one run by a service provider. Most universities and large companies run a primary and a secondary (backup) authoritative server.' },

  // ---------- Local DNS ----------
  { id: 'dns-21', d: 2, type: 'mc', src: 'cheat',
    q: 'How does a host typically get a local DNS server?',
    choices: ['The browser contains a built-in copy of the DNS database', 'IANA assigns each host a root server to use as its local server', 'Its ISP supplies the server’s IP address, usually via DHCP, or the host uses a public server such as Google DNS', 'It uses the authoritative server of whatever site it is visiting'],
    a: 2,
    why: 'Each ISP (residential or institutional) runs a local DNS server and gives hosts its address, typically through DHCP. Public resolvers like Google DNS also work. It is usually close to the host: on the same LAN, or a few routers away.' },

  { id: 'dns-22', d: 2, type: 'short', src: 'cheat',
    q: 'Explain what it means that the local DNS server “acts as a proxy” for a host.',
    a: 'The host sends its query only to the local DNS server, which forwards it into the DNS hierarchy (root, TLD and authoritative servers) on the host’s behalf. It then returns the result to the host and caches it for later queries. It is the host’s gateway into the hierarchy without being a level of it.',
    keys: ['forward|into the hierarchy|on behalf', 'root|TLD|authoritative', 'return|reply to the host', 'cache'],
    why: 'This is the cheat sheet’s “local DNS as proxy” point. Because the local server caches, later queries from any host in the ISP may be answered without touching the hierarchy at all.' },

  // ---------- Resolution ----------
  { id: 'dns-23', d: 3, type: 'order', src: 'cheat',
    q: 'Host cse.nyu.edu resolves gaia.cs.umass.edu with nothing cached (Figure 2.19). Put the 8 messages in order.',
    items: ['Host → local DNS server: query', 'Local DNS → root server: query', 'Root → local DNS: addresses of edu TLD servers', 'Local DNS → edu TLD server: query', 'TLD → local DNS: address of dns.umass.edu', 'Local DNS → dns.umass.edu: query', 'dns.umass.edu → local DNS: IP address of gaia.cs.umass.edu', 'Local DNS → host: the answer'],
    why: 'The local server does all the legwork: root (refers to edu TLD) → TLD (refers to umass.edu’s authoritative server) → authoritative (gives the answer). That is 4 queries and 4 replies.' },

  { id: 'dns-24', d: 1, type: 'num', src: 'cheat',
    q: 'How many DNS messages (queries plus replies) does the textbook’s uncached resolution of one hostname take?',
    a: 8, unit: 'messages', tol: 0,
    why: '4 queries (host→local, local→root, local→TLD, local→authoritative) and 4 replies, for 8 messages. Caching cuts this down.' },

  { id: 'dns-25', d: 2, type: 'mc', src: 'text',
    q: 'In Figure 2.19, which queries are recursive?',
    choices: ['None; all DNS queries are iterative', 'All four queries', 'Only the query from the host to its local DNS server', 'Only the queries from the local DNS server to the root, TLD and authoritative servers'],
    a: 2,
    why: 'cse.nyu.edu asks dns.nyu.edu to get the mapping on its behalf, which is recursive. The next three are iterative because each reply comes straight back to dns.nyu.edu, which then asks the next server itself. This is the usual pattern in practice.' },

  { id: 'dns-26', d: 3, type: 'tf', src: 'text',
    q: 'True or false: If every query in the chain is recursive (Figure 2.20), resolving one uncached hostname still takes 8 DNS messages.',
    a: true,
    why: 'True. The chain is host→local→root→TLD→authoritative, then back authoritative→TLD→root→local→host: 4 queries + 4 replies = 8. Recursion changes **who** sends each query (and who holds state), not how many messages there are.' },

  { id: 'dns-27', d: 3, type: 'mc', src: 'text',
    q: 'In the fully recursive chain of Figure 2.20, which server sends the query to the authoritative server dns.umass.edu?',
    choices: ['The local DNS server dns.nyu.edu', 'The root server', 'The edu TLD server', 'The requesting host cse.nyu.edu'],
    a: 2,
    why: 'Fully recursive: host → local → root → TLD → authoritative. The TLD server asks the authoritative server and passes the answer back up the chain. In the usual (Figure 2.19) pattern, the local server would send this query instead.' },

  { id: 'dns-28', d: 3, type: 'short', src: 'text',
    q: 'Compare iterative and recursive DNS queries. Why does the usual practice make only the host → local query recursive?',
    a: 'With a recursive query, the contacted server obtains the answer on the requester’s behalf by querying other servers itself. With an iterative query, the server replies directly with a referral to the next server and the requester continues. Keeping root and TLD queries iterative means those heavily loaded upper-level servers just give quick referrals instead of doing the work and holding state for everyone’s lookups. The local DNS server does the legwork for its own hosts.',
    keys: ['on behalf|obtains the answer', 'referral|replies directly|next server', 'root|TLD|upper level', 'load|burden|state'],
    why: 'The textbook defines the two kinds and says the host→local query is typically recursive and the rest iterative. The lecture slides ask about “heavy load at upper levels of hierarchy” for recursive resolution.' },

  { id: 'dns-29', d: 3, type: 'num', src: 'text',
    q: 'The edu TLD server knows only dns.umass.edu, an intermediate university server, which refers queries for names ending in cs.umass.edu to the departmental authoritative server dns.cs.umass.edu. How many DNS messages does resolving gaia.cs.umass.edu take with nothing cached?',
    a: 10, unit: 'messages', tol: 0,
    why: 'Host↔local (2) + local↔root (2) + local↔TLD (2) + local↔dns.umass.edu (2) + local↔dns.cs.umass.edu (2) = 10. The extra intermediate referral adds one query/reply pair. The textbook: “In this case, a total of 10 DNS messages are sent!”' },

  { id: 'dns-30', d: 3, type: 'order', src: 'ch2-P19',
    q: 'Textbook P19 (adapted; no dig needed). Starting at a root server, list the DNS servers in the delegation chain for gaia.cs.umass.edu, where the university server refers department names to a departmental server.',
    items: ['A root server ([a–m].root-servers.net)', 'An edu TLD server', 'dns.umass.edu (the university’s DNS server)', 'dns.cs.umass.edu (the department’s authoritative server)'],
    why: 'Each server delegates by returning the name (and address) of a server lower in the hierarchy: root → edu TLD → dns.umass.edu → dns.cs.umass.edu, which holds the A record for gaia. Running dig +trace against real sites needs live tools, so that part of P19 is skipped.' },

  // ---------- Caching ----------
  { id: 'dns-31', d: 2, type: 'tf', src: 'cheat',
    q: 'True or false: A DNS server may answer a query from its cache even if it is not authoritative for that hostname.',
    a: true,
    why: 'True. When a server receives a reply it can cache the mapping and answer later queries for the same name directly, even if it is not authoritative. This reduces delay and DNS traffic.' },

  { id: 'dns-32', d: 2, type: 'mc', src: 'cheat',
    q: 'Why are root DNS servers involved in only a small fraction of DNS queries?',
    choices: ['Root servers forward all queries to Google DNS', 'Hosts query TLD servers directly, never their local server', 'Root servers handle only IPv6 queries', 'Local DNS servers cache the IP addresses of TLD servers, so they can skip the root'],
    a: 3,
    why: 'Once a local server has cached the com (or edu, …) TLD server addresses, it can go straight to the TLD server. This is why root servers are “bypassed for all but a very small fraction of DNS queries.”' },

  { id: 'dns-33', d: 2, type: 'num', src: 'text',
    q: 'apricot.nyu.edu looked up cnn.com through dns.nyu.edu. A few hours later kiwi.nyu.edu asks dns.nyu.edu for cnn.com, and the entry is still cached. How many DNS messages does kiwi’s lookup take?',
    a: 2, unit: 'messages', tol: 0,
    why: 'kiwi’s query to dns.nyu.edu plus the reply from its cache gives 2 messages. No other DNS server is contacted, compared with 8 messages uncached.' },

  { id: 'dns-34', d: 3, type: 'num', src: 'text',
    q: 'The local DNS server has the IP addresses of the com TLD servers cached, but nothing else about www.example.com. How many DNS messages does the host’s lookup take?',
    a: 6, unit: 'messages', tol: 0,
    why: 'The root is skipped: host→local, local→TLD, TLD→local, local→authoritative, authoritative→local, local→host = 6. Eight messages minus the root query/reply pair.' },

  { id: 'dns-35', d: 3, type: 'num', src: 'text',
    ctx: 'A host’s local DNS server is 2 ms away (RTT). From the local server, the RTT to a root server is 30 ms, to the TLD server 40 ms, and to the authoritative server 50 ms. Ignore processing and transmission time; the host → local query is recursive and the rest are iterative.',
    q: 'How long does the lookup take with nothing cached? Answer in ms.',
    a: 122, unit: 'ms', tol: 0,
    why: 'Each exchange costs one RTT: host↔local 2 + local↔root 30 + local↔TLD 40 + local↔authoritative 50 = 122 ms. DNS adds this delay before the browser can even open its TCP connection.' },

  { id: 'dns-36', d: 3, type: 'num', src: 'text',
    ctx: 'A host’s local DNS server is 2 ms away (RTT). From the local server, the RTT to a root server is 30 ms, to the TLD server 40 ms, and to the authoritative server 50 ms. Ignore processing and transmission time; the host → local query is recursive and the rest are iterative.',
    q: 'A few minutes later another host in the same ISP looks up a **different** name in the same TLD. The local server has the TLD server’s address cached but nothing else. How long does this lookup take? Answer in ms.',
    a: 92, unit: 'ms', tol: 0,
    why: 'The root is skipped: 2 (host↔local) + 40 (TLD) + 50 (authoritative) = 92 ms. If the name itself had been cached, it would take just 2 ms. This is how caching in nearby servers reduces latency and traffic.' },

  { id: 'dns-37', d: 2, type: 'tf', src: 'text',
    q: 'True or false: Once a DNS server caches a hostname-to-IP mapping, it keeps it indefinitely, because mappings never change.',
    a: false,
    why: 'False. Hosts and mappings are “by no means permanent,” so cached entries are discarded after a period of time (often two days). The record’s TTL determines when it is removed from a cache.' },

  // ---------- Resource records ----------
  { id: 'dns-38', d: 1, type: 'mc', src: 'text',
    q: 'A DNS resource record is a four-tuple consisting of:',
    choices: ['(Source IP, Source port, Dest IP, Dest port)', '(Domain, Registrar, Owner, Expiry)', '(Name, IP, Port, Protocol)', '(Name, Value, Type, TTL)'],
    a: 3,
    why: 'RR = (Name, Value, Type, TTL). The meaning of Name and Value depends on Type, and TTL says when the record should be removed from a cache. The 4-tuple of addresses and ports identifies TCP sockets, which is a different topic.' },

  { id: 'dns-40', d: 2, type: 'mc', src: 'text',
    q: 'What does the record (foo.com, dns.foo.com, NS) tell you?',
    choices: ['The IP address of foo.com is dns.foo.com', 'dns.foo.com is the mail server for foo.com', 'foo.com is an alias for the canonical hostname dns.foo.com', 'dns.foo.com is an authoritative DNS server that knows how to obtain the IP addresses of hosts in the domain foo.com'],
    a: 3,
    why: 'For Type NS, Name is a domain and Value is the hostname of an authoritative DNS server for it. NS records route queries further along the chain. An alias would be CNAME, a mail server would be MX, and an IP address would be an A record.' },

  { id: 'dns-41', d: 2, type: 'mc', src: 'text',
    q: 'What does the record (foo.com, relay1.bar.foo.com, CNAME) mean?',
    choices: ['relay1.bar.foo.com is the authoritative DNS server for foo.com', 'foo.com is the canonical hostname for the alias relay1.bar.foo.com', 'relay1.bar.foo.com is the canonical hostname for the alias foo.com', 'relay1.bar.foo.com is the mail server for foo.com'],
    a: 2,
    why: 'For CNAME, Name is the alias and Value is the canonical name. A common trap is reading it backwards. The mail-server equivalent is MX, and the DNS-server version is NS.' },

  { id: 'dns-42', d: 2, type: 'mc', src: 'text',
    q: 'A mail server wants to deliver mail to bob@foo.com. Which record type should it ask DNS for to learn the canonical name of foo.com’s mail server?',
    choices: ['CNAME', 'MX', 'NS', 'A'],
    a: 1,
    why: 'MX records map a mail alias (foo.com) to the canonical mail-server name (e.g. mail.bar.foo.com). It then needs an A record for that name, which DNS typically supplies in the additional section of the reply. CNAME gives canonical names for other servers.' },

  { id: 'dns-43', d: 2, type: 'short', src: 'ch2-R19',
    q: 'Textbook R19. Is it possible for an organization’s Web server and mail server to have exactly the same alias for a hostname (for example, foo.com)? What would be the type for the RR that contains the hostname of the mail server?',
    a: 'Yes. A query for the MX record of foo.com returns the canonical name of the mail server, while a query for the CNAME record of foo.com returns the canonical name of the Web server. So both can share the alias foo.com. The RR containing the mail server’s hostname is Type MX, e.g. (foo.com, mail.bar.foo.com, MX).',
    keys: ['yes', 'MX', 'CNAME', 'canonical'],
    why: 'The textbook: “by using the MX record, a company can have the same aliased name for its mail server and for one of its other servers (such as its Web server).” Mail software asks for MX, and other clients ask for CNAME/A.' },

  { id: 'dns-44', d: 3, type: 'mc', src: 'text',
    q: 'The edu TLD server is not authoritative for gaia.cs.umass.edu. Which records does it hold to direct the query onward?',
    choices: ['(umass.edu, 128.119.40.111, NS)', '(gaia.cs.umass.edu, 128.119.245.12, A) only', '(umass.edu, dns.umass.edu, CNAME) only', '(umass.edu, dns.umass.edu, NS) and (dns.umass.edu, 128.119.40.111, A)'],
    a: 3,
    why: 'A non-authoritative server holds an NS record for the domain containing the host, plus an A record giving the IP address of the DNS server named in the NS record. An NS Value is a **hostname**, never an IP address, which rules out the option that pairs umass.edu with an IP address in an NS record. The host’s own A record lives on the authoritative server.' },

  // ---------- Messages ----------
  { id: 'dns-45', d: 1, type: 'tf', src: 'text',
    q: 'True or false: DNS uses different message formats for queries and replies.',
    a: false,
    why: 'False. Query and reply are the only two kinds of DNS message, and both use the same format: a 12-byte header followed by question, answer, authority and additional sections. A flag in the header distinguishes them (0 = query, 1 = reply).' },

  { id: 'dns-46', d: 1, type: 'num', src: 'text',
    q: 'How many bytes long is the header section of a DNS message?',
    a: 12, unit: 'bytes', tol: 0,
    why: 'The first 12 bytes are the header: the 16-bit identification, the flags, and four 16-bit “number-of” counts (questions, answer RRs, authority RRs, additional RRs).' },

  { id: 'dns-47', d: 2, type: 'mc', src: 'text',
    q: 'What is the purpose of the 16-bit identification field in a DNS message?',
    choices: ['It identifies which root server should handle the query', 'It is the TTL of the answer', 'It holds the client’s port number', 'It is copied into the reply so the client can match replies to the queries it sent'],
    a: 3,
    why: 'Because DNS runs over connectionless UDP, the client may have several queries outstanding. The server copies the ID into its reply, so the client knows which query each reply answers.' },

  { id: 'dns-48', d: 2, type: 'multi', src: 'text',
    q: 'Which 1-bit flags appear in the DNS header’s flags field? Select all that apply.',
    choices: ['Recursion-available', 'Query/reply', 'Recursion-desired', 'Encrypted', 'Cached', 'Authoritative'],
    a: [0, 1, 2, 5],
    why: 'Query/reply (0/1); authoritative (set in a reply from an authoritative server); recursion-desired (set by a client wanting recursion); recursion-available (set in a reply if the server supports recursion). The textbook names no “cached” or “encrypted” flag.' },

  { id: 'dns-49', d: 2, type: 'mc', src: 'text',
    q: 'A host wants its local DNS server to resolve a name fully on its behalf. Which header flag does the host set in its query?',
    choices: ['Recursion-available', 'Query/reply = 1', 'Recursion-desired', 'Authoritative'],
    a: 2,
    why: 'The asker sets recursion-desired. The server sets recursion-available in its reply if it supports recursion, and sets authoritative if it is authoritative for the name. Query/reply = 1 means the message is a reply.' },

  { id: 'dns-50', d: 3, type: 'mc', src: 'text',
    q: 'A DNS server answers an MX query for hamburger.edu. In which section of the reply is the Type A record giving the IP address of the mail server’s canonical name?',
    choices: ['The additional section', 'The authority section', 'The answer section', 'The question section'],
    a: 0,
    why: 'The answer section holds the MX record (the canonical mail-server name). The additional section carries “helpful” records, such as the A record for that canonical name, saving a second lookup. The authority section lists other authoritative servers.' },

  { id: 'dns-51', d: 2, type: 'mc', src: 'text',
    q: 'Which section of a DNS message contains records of other authoritative servers?',
    choices: ['Answer section', 'Additional section', 'Authority section', 'Header'],
    a: 2,
    why: 'Authority section: records for authoritative servers. Answer section: RRs for the queried name (possibly several, e.g. replicated Web servers). Additional section: other helpful records.' },

  // ---------- Registering ----------
  { id: 'dns-52', d: 1, type: 'mc', src: 'text',
    q: 'You register networkutopia.com. Which organization accredits the registrar you use?',
    choices: ['The IETF', 'ICANN', 'IANA', 'Verisign'],
    a: 1,
    why: 'Registrars are commercial entities that verify the name is unique, enter it into the DNS database and charge a fee. ICANN accredits them. IANA coordinates the root servers, and Verisign runs the com TLD. Before 1999, Network Solutions had a monopoly on com, net and org.' },

  { id: 'dns-53', d: 3, type: 'multi', src: 'text',
    q: 'You register networkutopia.com with primary and secondary authoritative servers dns1.networkutopia.com (212.212.212.1) and dns2.networkutopia.com (212.212.212.2). Which records does the registrar make sure are entered into the com TLD servers? Select all that apply.',
    choices: ['(dns1.networkutopia.com, 212.212.212.1, A)', '(networkutopia.com, mail.networkutopia.com, MX)', 'An NS record and an A record for dns2.networkutopia.com', '(networkutopia.com, dns1.networkutopia.com, NS)', '(www.networkutopia.com, 212.212.71.4, A)'],
    a: [0, 2, 3],
    why: 'For **each** authoritative server the registrar puts an NS record and an A record into the TLD servers. The Web server’s A record and the MX record go into **your own** authoritative servers, not the TLD.' },

  { id: 'dns-54', d: 3, type: 'mc', src: 'text',
    q: 'Alice in Australia looks up www.networkutopia.com. Her local DNS server has just received the com TLD server’s reply containing (networkutopia.com, dns1.networkutopia.com, NS) and (dns1.networkutopia.com, 212.212.212.1, A). What does the local server do next?',
    choices: ['Queries 212.212.212.1 for the Type A record of www.networkutopia.com', 'Returns 212.212.212.1 to Alice’s browser as the Web server’s address', 'Queries a root server for networkutopia.com', 'Contacts the registrar for the Web server’s address'],
    a: 0,
    why: 'The TLD reply is a referral: it says who is authoritative and how to reach it. The local server queries dns1 (212.212.212.1), which returns the Web server’s A record (say 212.212.71.4). That is the address passed to Alice. Returning 212.212.212.1 would send her browser to the DNS server, not the Web server.' },

  // ---------- Security ----------
  { id: 'dns-55', d: 3, type: 'multi', src: 'text',
    q: 'Which statements about DNS attacks are correct? Select all that apply.',
    choices: ['Local DNS servers’ caching of TLD addresses helped blunt the root attack', 'In DNS poisoning, an attacker gets a DNS server to accept bogus records into its cache', 'The October 2002 ICMP-ping flood against the root servers caused minimal damage', 'DNSSEC was designed to protect against such exploits', 'The 2016 attack on Dyn targeted root servers with ICMP pings', 'Man-in-the-middle attacks on DNS are impossible because DNS uses UDP'],
    a: [0, 1, 2, 3],
    why: 'The 2002 root attack failed because of ICMP packet filters and because cached TLD addresses let queries bypass the root. Poisoning plants bogus cache records, and DNSSEC counters these attacks. The 2016 Dyn attack was a flood of **DNS queries** against a **TLD** provider from a Mirai IoT botnet, not root pings. Man-in-the-middle attacks (intercepting queries and returning bogus replies) are a real threat.' },

  { id: 'dns-56', d: 3, type: 'short', src: 'text',
    q: 'Why is a DDoS attack that floods TLD servers with DNS queries potentially more effective than the 2002 ping flood against the root servers?',
    a: 'DNS queries are much harder to filter than ICMP pings, because they look like legitimate traffic, so the TLD servers cannot simply drop them. Also, TLD servers are not as easily bypassed as root servers: local DNS servers often cache TLD addresses and skip the root, but they still need the TLD to find authoritative servers for names that aren’t cached.',
    keys: ['harder to filter|cannot filter|legitimate', 'ICMP|ping', 'bypass|cache', 'TLD'],
    why: 'In 2002 the root servers blocked ICMP pings and were mostly bypassed anyway thanks to caching. The 2016 Dyn attack (DNS lookups from about 100,000 Mirai-infected IoT devices) disrupted Amazon, Twitter, Netflix, GitHub and Spotify for almost a day.' },

  // ---------- Problems ----------
  { id: 'dns-57', d: 3, type: 'short', src: 'ch2-P20',
    q: 'Textbook P20. Suppose you can access the caches in the local DNS servers of your department. Can you propose a way to roughly determine the Web servers (outside your department) that are most popular among the users in your department? Explain.',
    a: 'Periodically take snapshots of the local DNS servers’ caches and count how often each external Web server’s hostname appears. The more users visit a server, the more often DNS queries for it are sent, so its record is cached (and refreshed after each TTL expiry) more often. The servers that appear most frequently across snapshots are the most popular.',
    keys: ['snapshot|periodically|sample', 'cache', 'most frequently|count|frequency', 'more users|more queries|popular'],
    why: 'Popular names are queried often, so they are present in the cache most of the time. Rarely visited names appear only occasionally and age out after their TTL. This is the approach in the official solution, which cites a measurement study of DNS caches.' },

  { id: 'dns-58', d: 3, type: 'short', src: 'ch2-P21',
    q: 'Textbook P21. Your department has a local DNS server for all its computers. You are an ordinary user, not an administrator. Can you determine whether an external Web site was likely accessed from a computer in your department a couple of seconds ago? Explain.',
    a: 'Yes. Query the local DNS server for that site’s name (e.g. with dig) and look at the query time. If someone accessed the site seconds ago, its record is cached at the local server and the reply comes back almost instantly (about 0 ms). If not, the local server must contact other DNS servers and the query takes noticeably longer.',
    keys: ['yes', 'query the local DNS|dig|nslookup', 'cached|cache', 'query time|response time|fast|0 ms'],
    why: 'A cache hit at the local server costs only the host↔local round trip; a miss adds the TLD/authoritative trips. The timing difference leaks whether the name was recently looked up.' }
]);
