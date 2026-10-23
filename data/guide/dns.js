NET.addSection({
  id: 'dns',
  unit: 2,
  order: 11,
  title: 'DNS, the Internet’s directory',
  short: 'DNS',
  cheat: 'p.111–122',
  text: '§2.4',
  minutes: 40,
  summary: 'DNS turns human-friendly hostnames into the IP addresses routers need. It is a distributed, hierarchical database (root, TLD and authoritative servers) plus an application-layer protocol over UDP port 53, with a local DNS server acting as each host’s proxy. Exams love the resolution walk-through (8 messages), iterative vs recursive queries, how caching changes the message count, and resource-record types (A, NS, CNAME, MX).',
  mustKnow: [
    'DNS is (1) a [[distributed, hierarchical database]] of name servers and (2) an [[application-layer protocol]] for querying it. Queries and replies go over [[UDP port 53]].',
    'Services: hostname → IP translation, [[host aliasing]] (alias → canonical hostname), [[mail server aliasing]] (via MX records) and [[load distribution]] (one name → a rotating set of IPs).',
    'It is not centralized because one server would be a [[single point of failure]], could not handle the [[traffic volume]], would be [[distant]] (slow) for most users, and would be impossible to [[maintain]].',
    'The hierarchy is [[root]] → [[TLD]] → [[authoritative]]. Root servers give the IPs of TLD servers; TLD servers give the IPs of authoritative servers; authoritative servers give the final answer.',
    'Root service: [[13]] root servers, run by multiple organizations under [[IANA]] coordination, with about [[2000]] instances worldwide (lecture; the 2020 textbook says “more than 1000”). [[Verisign]] runs .com and [[Educause]] runs .edu.',
    'The [[local DNS server]] is [[not part of the hierarchy]]. It is provided by the ISP (via [[DHCP]]) or is a public server such as Google DNS, and it acts as a [[proxy]]: it forwards queries into the hierarchy, returns answers and caches them.',
    'An uncached lookup takes [[8 messages]] ([[4 queries + 4 replies]]): host → local, local ↔ root, local ↔ TLD, local ↔ authoritative, local → host.',
    'In practice the host → local query is [[recursive]] and the rest are [[iterative]]. A fully recursive chain also uses 8 messages.',
    '[[Caching]] cuts delay and traffic. Any DNS server can answer from its cache even if it is [[not authoritative]]; entries expire after their [[TTL]]. Because local servers cache TLD addresses, [[root servers are rarely contacted]].',
    'A resource record is ([[Name, Value, Type, TTL]]). Types: [[A]] (hostname → IP), [[NS]] (domain → authoritative server’s hostname), [[CNAME]] (alias → canonical name), [[MX]] (alias → mail server’s canonical name).',
    'DNS query and reply use the [[same message format]]: a 12-byte header (16-bit [[identification]], flags), then question, answer, authority and additional sections.'
  ],
  topics: [
    {
      title: 'Two ways to identify a host',
      src: 'both',
      blocks: [
        { p: 'A host can be identified by a [[hostname]] (www.facebook.com, gaia.cs.umass.edu) or by an [[IP address]]. Hostnames are mnemonic, so people like them, but they give little or no information about the host’s location. Being [[variable-length alphanumeric]] strings, they would also be hard for routers to process.' },
        { p: 'An IPv4 address is a [[32-bit]] (4-byte) identifier with a rigid [[hierarchical]] structure, e.g. 121.7.106.83. Each dotted number is one byte from 0 to 255. Reading left to right gives more and more specific information about where the host sits in the Internet. Routers use IP addresses to route and address datagrams.' },
        { p: 'People prefer hostnames; routers prefer fixed-length, hierarchical IP addresses. Reconciling the two needs a [[directory service]] that translates hostnames to IP addresses. That is the main task of DNS.' }
      ]
    },
    {
      title: 'What DNS is and how applications use it',
      src: 'both',
      blocks: [
        { def: 'DNS (Domain Name System)', text: '(1) A [[distributed database]] implemented in a [[hierarchy of DNS servers]], and (2) an [[application-layer protocol]] that lets hosts query that database. It translates between hostnames and IP addresses. Servers are often UNIX machines running BIND software.' },
        { p: 'DNS runs over [[UDP]] and uses [[port 53]]. All DNS query and reply messages are sent in UDP datagrams to port 53.' },
        { p: 'Other application protocols, including [[HTTP]] and [[SMTP]], use DNS to turn user-supplied hostnames into IP addresses. An application calls the client side of DNS (on UNIX, `gethostbyname()`), which sends a query and, after milliseconds to seconds, receives the mapping. To the application, DNS is a [[black box]] doing a simple translation.' },
        { steps: [
          'The user’s machine runs the client side of the DNS application.',
          'The browser [[extracts the hostname]] (www.someschool.edu) from the URL and passes it to the DNS client.',
          'The DNS client sends a [[query]] containing the hostname to a DNS server.',
          'The DNS client eventually receives a [[reply]] that includes the IP address for the hostname.',
          'The browser uses that IP address and port [[80]] to open a TCP connection to the HTTP server process.'
        ], title: 'Browser fetching www.someschool.edu/index.html' },
        { p: 'DNS [[adds delay]], sometimes a lot, before the real application traffic can start. Fortunately the answer is often [[cached in a nearby DNS server]], which reduces both DNS traffic and average delay.' },
        { p: 'DNS is a core Internet function, but users never interact with it directly and it is [[implemented at the application layer]] by clients and servers at the network edge. It fits the Internet’s design philosophy of keeping [[complexity at the edge]] rather than in the core routers.' }
      ]
    },
    {
      title: 'Services DNS provides',
      src: 'both',
      blocks: [
        { list: [
          '[[Hostname-to-IP-address translation]], the main job.',
          '[[Host aliasing]]: a host with a complicated [[canonical hostname]] such as relay1.west-coast.enterprise.com can have simpler aliases (enterprise.com, www.enterprise.com). DNS returns the canonical name and the IP address for a given alias.',
          '[[Mail server aliasing]]: Bob’s address can be bob@yahoo.com even though Yahoo’s mail server’s canonical name is something like relay1.west-coast.yahoo.com. DNS maps the easy-to-remember mail domain to the canonical mail server via an [[MX record]]. MX also lets a company’s mail server and Web server share the same alias (both called enterprise.com).',
          '[[Load distribution]]: a busy site such as cnn.com is replicated over several servers, each with its own IP address. One name maps to the whole set; DNS returns the entire set but [[rotates the order]] in each reply. Clients usually use the [[first address]], so traffic spreads across the replicas. This is also used for replicated mail servers, and CDNs such as Akamai use DNS in more sophisticated ways.'
        ] },
        { def: 'Canonical hostname', text: 'The real, often complicated name of a host (relay1.west-coast.enterprise.com), as opposed to its more mnemonic [[alias]] names.' },
        { trap: 'Load distribution is not one IP chosen at random per user; DNS returns **all** the addresses and rotates their **order**. The client usually picks the first one.' }
      ]
    },
    {
      title: 'Why DNS is not centralized',
      src: 'both',
      blocks: [
        { p: 'Simplest possible design: one DNS server holding every mapping, with all clients querying it. That does not work at Internet scale.' },
        { list: [
          '[[Single point of failure]]: if the one server crashes, so does the entire Internet.',
          '[[Traffic volume]]: one server would have to handle every DNS query for the HTTP requests and e-mails of hundreds of millions of hosts.',
          '[[Distant centralized database]]: one server cannot be close to everyone. Put it in New York and queries from Australia cross the globe over slow, congested links, giving [[high latency]].',
          '[[Maintenance]]: the database would be huge and would need updating constantly for every new host.'
        ] },
        { p: 'In short, a centralized database [[doesn’t scale]]. DNS is therefore [[distributed by design]]: no single server holds all the mappings.' }
      ]
    },
    {
      title: 'The DNS hierarchy: root, TLD and authoritative servers',
      src: 'both',
      blocks: [
        { p: 'DNS uses many servers, organized [[hierarchically]] and distributed around the world. There are three classes of server: [[root DNS servers]], [[top-level domain (TLD) DNS servers]] and [[authoritative DNS servers]]. Figure 2.17 shows the root at the top; below it the com, org and edu TLD servers; below those the authoritative servers for amazon.com, facebook.com, pbs.org, nyu.edu, umass.edu and so on.' },
        { steps: [
          'The client contacts a [[root server]], which returns the IP addresses of TLD servers for [[com]].',
          'The client contacts a com [[TLD server]], which returns the IP address of an [[authoritative server for amazon.com]].',
          'The client contacts the amazon.com [[authoritative server]], which returns the [[IP address of www.amazon.com]].'
        ], title: 'First approximation: resolving www.amazon.com' },
        { table: {
          head: ['Level', 'Gives back', 'Facts to know'],
          rows: [
            ['Root', 'IP addresses of [[TLD servers]]', '13 root servers, copies run by multiple organizations (12 per the textbook), coordinated by IANA. About 2000 instances worldwide handling tens of billions of queries a day (lecture); “more than 1000” instances (textbook, 2020)'],
            ['TLD', 'IP addresses of [[authoritative servers]]', 'One server or cluster per TLD: com, org, net, edu, gov and country TLDs (uk, fr, ca, jp). Verisign Global Registry Services runs com; Educause runs edu'],
            ['Authoritative', 'The [[actual record]] (e.g. the A record) for hosts in its domain', 'Every organization with publicly accessible hosts (Web, mail) must provide them. It can run its own server or pay a provider; universities and large companies run a primary and a secondary (backup)']
          ] }, caption: 'Who answers what' },
        { trap: 'The root does **not** know www.amazon.com’s address, and the TLD usually does not either. Each level only **refers** you one level down. Only the authoritative server (or a cache) holds the final hostname-to-IP mapping.' }
      ]
    },
    {
      title: 'The local DNS server',
      src: 'cheat',
      blocks: [
        { def: 'Local DNS server (default name server)', text: 'A DNS server that is [[not strictly part of the hierarchy]] but is [[central to DNS operation]]. Every ISP (residential or institutional) has one, or a host can use a [[public server such as Google DNS]].' },
        { list: [
          'How the host learns it: when the host connects, the ISP gives it the IP addresses of one or more local DNS servers, typically through [[DHCP]].',
          'Where it is: [[close to the host]]. For an institutional ISP it may be on the same LAN; for a residential ISP it is usually no more than a few routers away.',
          'What it does: acts as a [[proxy]]. It receives the host’s query, [[forwards it into the hierarchy]], returns the result to the host and [[caches]] it. It is the host’s gateway into the hierarchy without being a delegated level of it.'
        ] },
        { trap: 'Three-level hierarchy = root, TLD, authoritative. The local DNS server is **not** a fourth level, even though every query passes through it.' }
      ]
    },
    {
      title: 'Resolving a name: the 8-message walk-through (Figure 2.19)',
      src: 'both',
      blocks: [
        { p: 'Host cse.nyu.edu wants the IP address of gaia.cs.umass.edu. Its local DNS server is dns.nyu.edu, and the authoritative server for gaia is dns.umass.edu. Nothing is cached.' },
        { steps: [
          '(1) cse.nyu.edu → dns.nyu.edu: query for gaia.cs.umass.edu.',
          '(2) dns.nyu.edu → a [[root server]]: same query.',
          '(3) Root → dns.nyu.edu: it notes the [[edu]] suffix and returns a list of IP addresses of [[TLD servers for edu]].',
          '(4) dns.nyu.edu → an edu TLD server: same query.',
          '(5) TLD → dns.nyu.edu: it notes the [[umass.edu]] suffix and returns the IP address of the authoritative server [[dns.umass.edu]].',
          '(6) dns.nyu.edu → dns.umass.edu: same query.',
          '(7) dns.umass.edu → dns.nyu.edu: the [[IP address of gaia.cs.umass.edu]].',
          '(8) dns.nyu.edu → cse.nyu.edu: the answer.'
        ], title: 'Uncached resolution' },
        { diagram: 'dns-iterative' },
        { p: 'Total: [[8 DNS messages]], [[4 queries and 4 replies]], to get one mapping. Caching (below) cuts this down.' },
        { p: 'Intermediate servers: the TLD server may know only an [[intermediate DNS server]]. Suppose dns.umass.edu is the university’s server and each department runs its own authoritative server. dns.umass.edu then replies with the address of [[dns.cs.umass.edu]], and the local server must query that too. This adds one query and one reply, for [[10 messages]] in total.' },
        { example: {
          q: 'Count the DNS messages for one lookup in each case (the host always asks its local DNS server): (a) nothing cached; (b) nothing cached, but there is an intermediate university server before the departmental authoritative server; (c) the local server has the edu TLD server’s address cached; (d) the local server has the hostname itself cached.',
          a: '(a) host→local, local↔root (2), local↔TLD (2), local↔auth (2), local→host = **8**.\n(b) one more query/reply pair, local↔intermediate: **10**.\n(c) skip the root: host→local, local↔TLD (2), local↔auth (2), local→host = **6**.\n(d) the local server answers from its cache: query + reply = **2**.'
        } }
      ]
    },
    {
      title: 'Recursive vs iterative queries',
      src: 'text',
      blocks: [
        { def: 'Recursive query', text: 'Asks the contacted server to [[obtain the mapping on the requester’s behalf]]. The server does the work of contacting other servers and returns the final answer.' },
        { def: 'Iterative query', text: 'The contacted server [[replies directly to the requester]] with the best information it has, usually a [[referral]] to the next server to ask. The requester does the next step itself.' },
        { p: 'In Figure 2.19 the query from cse.nyu.edu to dns.nyu.edu is [[recursive]]: “get me the answer.” The next three queries (to root, TLD and authoritative) are [[iterative]], because every reply comes straight back to dns.nyu.edu. **This is the usual pattern in practice:** host → local recursive, everything else iterative.' },
        { p: 'In theory any query can be either. In Figure 2.20 every query is recursive: (1) host → local, (2) local → root, (3) root → TLD, (4) TLD → authoritative, (5) authoritative → TLD, (6) TLD → root, (7) root → local, (8) local → host. That is still [[8 messages]], but the root and TLD servers now [[do the work and hold the pending query]] for everyone. That is a heavy burden on the upper levels of the hierarchy, which is why they answer iteratively.' },
        { diagram: 'dns-recursive' },
        { table: {
          head: ['', 'Usual (Fig 2.19)', 'All recursive (Fig 2.20)'],
          rows: [
            ['Host → local', 'Recursive', 'Recursive'],
            ['Local → root', 'Iterative (root replies to local)', 'Recursive (root asks TLD itself)'],
            ['Who contacts the authoritative server', 'Local DNS server', 'TLD server'],
            ['Messages for one uncached lookup', '8', '8']
          ] } },
        { trap: 'Recursion does not reduce the message count for a single lookup (8 either way). The difference is **who** sends the queries and who must keep state. Do not confuse “recursive” with “cached.”' },
        { game: 'dns-resolver', text: 'Play the local DNS server: choose who to ask next and watch caching shrink later rounds.' }
      ]
    },
    {
      title: 'DNS caching',
      src: 'both',
      blocks: [
        { p: 'When a DNS server receives a reply (for example, a hostname → IP mapping), it can [[cache]] any of the information in its local memory. If a later query for the same hostname arrives, it can answer from the cache [[even if it is not authoritative]] for that hostname. Caching [[reduces delay]] and [[reduces the number of DNS messages]] crossing the Internet.' },
        { p: 'Mappings are not permanent, so cached entries are [[discarded after a period of time]] (often two days). The period is set by the record’s [[TTL]].' },
        { p: 'Example: apricot.nyu.edu asks dns.nyu.edu for cnn.com. A few hours later kiwi.nyu.edu asks for cnn.com too. dns.nyu.edu answers kiwi [[immediately from its cache]], without querying any other DNS server: [[2 messages]] instead of 8.' },
        { p: 'A local DNS server also caches the [[IP addresses of TLD servers]], so it can [[bypass the root servers]]. Because of this, root servers are involved in [[only a very small fraction]] of DNS queries.' },
        { example: {
          q: 'From the local DNS server, the RTTs are: host ↔ local 2 ms, local ↔ root 30 ms, local ↔ TLD 40 ms, local ↔ authoritative 50 ms. Ignoring processing time, how long does a lookup take (a) with nothing cached, (b) with the TLD address cached, (c) with the hostname cached?',
          a: '(a) 2 + 30 + 40 + 50 = **122 ms**.\n(b) the root is skipped: 2 + 40 + 50 = **92 ms**.\n(c) only the host ↔ local exchange: **2 ms**. This is why the cheat sheet says caching in nearby servers reduces latency.'
        } }
      ]
    },
    {
      title: 'Resource records (RRs)',
      src: 'text',
      blocks: [
        { p: 'DNS servers store [[resource records]]. Each DNS reply carries one or more RRs.' },
        { formula: '(Name, Value, Type, TTL)',
          where: [['Name, Value', 'meaning depends on Type'], ['Type', 'A, NS, CNAME, MX, …'], ['TTL', 'time to live: when the record should be removed from a cache']],
          note: 'A resource record is a four-tuple.' },
        { table: {
          head: ['Type', 'Name', 'Value', 'Example'],
          rows: [
            ['A', 'Hostname', '[[IP address]] of that host', '(relay1.bar.foo.com, 145.37.93.126, A)'],
            ['NS', '[[Domain]]', 'Hostname of an [[authoritative DNS server]] for the domain', '(foo.com, dns.foo.com, NS)'],
            ['CNAME', '[[Alias]] hostname', '[[Canonical hostname]]', '(foo.com, relay1.bar.foo.com, CNAME)'],
            ['MX', 'Alias (mail domain)', 'Canonical name of the [[mail server]]', '(foo.com, mail.bar.foo.com, MX)']
          ] }, caption: 'The four record types to know' },
        { p: 'MX records let mail servers have simple aliases. The same alias (foo.com) can name both the mail server and the Web server: a client asking for the [[MX]] record gets the mail server’s canonical name, and one asking for the [[CNAME]] record gets the other server’s canonical name.' },
        { p: 'An authoritative server for a hostname holds a [[Type A record]] for it; a non-authoritative server may also have one in its cache. A server that is **not** authoritative holds a [[Type NS record]] for the domain containing the hostname, plus a [[Type A record]] giving the IP address of the DNS server named in the NS record’s Value field.' },
        { example: {
          q: 'The edu TLD server is not authoritative for gaia.cs.umass.edu. Which records does it use to point a querier in the right direction?',
          a: 'An NS record for the enclosing domain, `(umass.edu, dns.umass.edu, NS)`, plus an A record so the querier can reach that server, `(dns.umass.edu, 128.119.40.111, A)`. The NS alone gives only a name, and the querier would need yet another lookup to find its address. The A record supplies the address directly.'
        } },
        { trap: 'NS → Value is a **hostname** (of a DNS server), not an IP address. A → Value is the IP address. CNAME and MX both map an alias to a canonical **name**, so you still need an A record to get the IP.' },
        { game: 'match-blitz', text: 'Rapid-fire protocol → transport → port drills: DNS is UDP 53, SMTP is TCP 25, HTTP is TCP 80.' }
      ]
    },
    {
      title: 'DNS message format',
      src: 'text',
      blocks: [
        { p: 'There are only two kinds of DNS message, [[query]] and [[reply]], and both use the [[same format]] (Figure 2.21).' },
        { list: [
          '[[Header section]], the first [[12 bytes]]: a [[16-bit identification]] number that is copied into the reply so the client can [[match replies to queries]]; a flags field; and four “number-of” fields giving how many questions, answer RRs, authority RRs and additional RRs follow.',
          'Flags: a 1-bit [[query/reply]] flag (0 = query, 1 = reply); a 1-bit [[authoritative]] flag, set in a reply when the server is authoritative for the queried name; a 1-bit [[recursion-desired]] flag, set by a client (host or DNS server) that wants the server to perform recursion when it lacks the record; and a 1-bit [[recursion-available]] flag, set in a reply if the server supports recursion.',
          '[[Question section]]: the name being queried and the type of question (e.g. Type A for an address, Type MX for a mail server).',
          '[[Answer section]] (in replies): the RRs for the queried name. There can be several, e.g. multiple IP addresses for replicated Web servers.',
          '[[Authority section]]: records of other [[authoritative servers]].',
          '[[Additional section]]: other helpful records. Example: a reply to an MX query has the mail server’s canonical name in the answer section and a [[Type A record for that canonical name]] in the additional section.'
        ] },
        { p: 'You can send DNS queries yourself with [[nslookup]] (Windows and UNIX) to any root, TLD or authoritative server; it prints the records in the reply.' },
        { trap: 'The query/reply flag is 0 for a query and 1 for a reply. “Authoritative” and “recursion-available” are meaningful in **replies**, while “recursion-desired” is set by the **asker**.' }
      ]
    },
    {
      title: 'Inserting records: registering networkutopia.com',
      src: 'text',
      blocks: [
        { def: 'Registrar', text: 'A commercial entity that [[verifies the uniqueness]] of a domain name, [[enters it into the DNS database]] and charges a small fee. Registrars are accredited by [[ICANN]]. Before 1999, [[Network Solutions]] had a monopoly on registration for com, net and org.' },
        { steps: [
          'Register networkutopia.com at a registrar, giving the names and IP addresses of your [[primary and secondary authoritative DNS servers]] (dns1.networkutopia.com at 212.212.212.1, and dns2.networkutopia.com at 212.212.212.2).',
          'For each authoritative server the registrar puts a [[Type NS]] and a [[Type A]] record into the [[TLD com servers]], e.g. `(networkutopia.com, dns1.networkutopia.com, NS)` and `(dns1.networkutopia.com, 212.212.212.1, A)`.',
          'You make sure your [[own authoritative servers]] hold the Type A record for your Web server www.networkutopia.com and the Type MX record for your mail server mail.networkutopia.com.'
        ], title: 'Getting a new domain into DNS' },
        { p: 'Records used to be configured statically from a file; the DNS protocol now also has an [[UPDATE]] option for adding and deleting records dynamically (RFC 2136, RFC 3007).' },
        { steps: [
          'Alice’s host in Australia sends a query for www.networkutopia.com to her local DNS server.',
          'The local server contacts a [[TLD com server]], first contacting a [[root server]] only if no com TLD address is cached.',
          'The TLD server replies with the [[NS and A records]] that the registrar inserted.',
          'The local server queries [[212.212.212.1]] (dns1) for the Type A record of www.networkutopia.com.',
          'dns1 returns the Web server’s IP address (say 212.212.71.4), and the local server passes it to Alice’s host.',
          'Alice’s browser opens a TCP connection to 212.212.71.4 and sends its HTTP request.'
        ], title: 'Verifying it works: Alice visits www.networkutopia.com' },
        { trap: 'The registrar puts records into the **TLD** servers (NS + A for your DNS servers). Your Web server’s A record and your MX record go into **your authoritative** servers, not the TLD.' }
      ]
    },
    {
      title: 'DNS vulnerabilities',
      src: 'text',
      blocks: [
        { list: [
          '[[DDoS on the root servers]], 21 Oct 2002: a botnet flooded all 13 root IP addresses with ICMP ping messages. It caused [[minimal damage]], because many root servers had [[packet filters blocking ICMP pings]] and most local DNS servers [[cache TLD server addresses]], so queries often bypass the root anyway.',
          '[[DDoS on TLD servers]] is potentially more effective: DNS queries are [[harder to filter]] than pings, and TLD servers are [[not as easily bypassed]]. On 21 Oct 2016 the TLD provider [[Dyn]] was attacked with DNS lookups from a [[Mirai]] botnet of about 100,000 IoT devices (printers, cameras, baby monitors), disrupting Amazon, Twitter, Netflix, GitHub and Spotify for almost a day.',
          '[[Man-in-the-middle]]: the attacker intercepts queries and returns bogus replies.',
          '[[DNS poisoning]]: the attacker sends bogus replies to a DNS server so it accepts [[bogus records into its cache]], which can redirect users to the attacker’s site.',
          '[[DNSSEC]] (DNS Security Extensions) is a secured version of DNS designed to protect against these exploits.'
        ] },
        { trap: 'Caching is part of DNS’s defense: because local servers cache TLD addresses, a root outage hurts far less than a TLD outage.' }
      ]
    }
  ],
  recall: [
    { q: 'What transport protocol and port does DNS use?', a: 'UDP, port 53.' },
    { q: 'Give DNS’s two-part definition.', a: 'A distributed database implemented in a hierarchy of DNS servers, plus an application-layer protocol that lets hosts query it.' },
    { q: 'Name the four services DNS provides.', a: 'Hostname-to-IP translation, host aliasing, mail server aliasing, load distribution.' },
    { q: 'Give four reasons DNS is not centralized.', a: 'Single point of failure, traffic volume, distant database (latency), maintenance.' },
    { q: 'What are the three levels of the DNS hierarchy?', a: 'Root, top-level domain (TLD), authoritative.' },
    { q: 'What does a root server return? A TLD server?', a: 'Root: IP addresses of TLD servers. TLD: IP addresses of authoritative servers.' },
    { q: 'How many root servers are there, who coordinates them, and how many instances are there?', a: '13 root servers, run by multiple organizations, coordinated by IANA; about 2000 instances (lecture), more than 1000 (textbook, 2020).' },
    { q: 'Who maintains the .com and .edu TLD servers?', a: 'Verisign (.com) and Educause (.edu).' },
    { q: 'Is the local DNS server part of the hierarchy? What does it do?', a: 'No. It is provided by the ISP via DHCP (or is a public server such as Google DNS) and acts as a proxy: it forwards queries into the hierarchy, returns answers and caches them.' },
    { q: 'How many DNS messages does an uncached lookup take?', a: '8: 4 queries and 4 replies.' },
    { q: 'Which query in Figure 2.19 is recursive?', a: 'Only host → local DNS server. The queries to root, TLD and authoritative servers are iterative.' },
    { q: 'How many messages if the TLD server refers you to an intermediate DNS server?', a: '10.' },
    { q: 'Why are root servers rarely contacted?', a: 'Local DNS servers cache the IP addresses of TLD servers.' },
    { q: 'What are the four fields of a resource record?', a: '(Name, Value, Type, TTL).' },
    { q: 'What are Name and Value for type NS?', a: 'Name is a domain; Value is the hostname of an authoritative DNS server for that domain.' },
    { q: 'Which record type gives a mail server’s canonical name, and which gives another server’s canonical name?', a: 'MX for the mail server; CNAME for the other server.' },
    { q: 'How big is the DNS header, and what is the identification field for?', a: '12 bytes. The 16-bit ID is copied into the reply so the client can match it to its query.' },
    { q: 'Name the four DNS header flags.', a: 'Query/reply, authoritative, recursion-desired, recursion-available.' },
    { q: 'Which records does a registrar insert into the TLD servers?', a: 'An NS record and an A record for each of your authoritative DNS servers.' },
    { q: 'Why is a DDoS on TLD servers potentially worse than one on root servers?', a: 'DNS queries are harder to filter than ICMP pings, and TLD servers can’t be bypassed by caching as easily as the root can.' }
  ]
});
