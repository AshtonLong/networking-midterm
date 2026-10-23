(function () {
NET.addSection({
  id: 'p2p',
  unit: 2,
  order: 13,
  title: 'P2P file distribution & video streaming',
  short: 'P2P & video/CDNs',
  cheat: '',
  text: '§2.5–2.6',
  minutes: 45,
  summary: 'How one file reaches N peers faster when the peers help upload (P2P self-scaling, captured by the D_{cs} and D_{P2P} formulas), how BitTorrent organises that in practice, and how Netflix and YouTube stream video with DASH and content distribution networks (CDNs). Expect a textbook-P22-style distribution-time calculation plus definition and reasoning questions on BitTorrent, DASH and CDNs.',
  mustKnow: [
    'Client-server: [[D_{cs} = max{ N·F/u_{s} , F/d_{min} }]], which grows linearly with N.',
    'P2P: [[D_{P2P} = max{ F/u_{s} , F/d_{min} , N·F/(u_{s} + Σu_{i}) }]]. The server sends each bit only once, and every new peer adds upload capacity, so P2P is [[self-scaling]].',
    'BitTorrent: a [[torrent]] is all peers sharing one file; the [[tracker]] registers peers and hands a newcomer about 50 random peer IPs; files move in [[256 KB chunks]] over TCP connections to neighbours.',
    '[[Rarest first]] decides which chunk to request. [[Tit-for-tat]] decides whom to upload to: the top 4 suppliers are unchoked (re-evaluated every [[10 s]]) plus 1 random neighbour optimistically unchoked every [[30 s]]. Everyone else is choked.',
    'An overlay network has peers as nodes and TCP connections as edges. It contains [[no routers]]. A DHT is a database whose records are spread over the peers.',
    'Smooth playout needs [[average end-to-end throughput ≥ video bit rate]].',
    'DASH: several bit-rate versions, each with its own URL, listed in a [[manifest file]]. The [[client]] measures bandwidth and picks each few-second chunk with an HTTP GET (byte range).',
    'CDN placement: [[enter deep]] (Akamai: clusters inside access ISPs, thousands of sites) vs [[bring home]] (Limelight: large clusters at tens of sites, usually IXPs).',
    'CDNs usually redirect clients with [[DNS]]: the content provider’s authoritative server returns a CDN hostname, and the CDN’s DNS returns the IP of the chosen server.',
    'Cluster selection: [[geographically closest]] (geo-IP of the LDNS) or [[real-time measurements]] (probing LDNSs). The CDN sees the LDNS, not the client.',
    'Netflix: private CDN, [[push]] caching at off-peak hours, no DNS redirect, DASH with about 4 s chunks. YouTube: private CDN, [[pull]] caching, DNS redirect, no DASH (the user picks the version).'
  ],
  topics: [
    {
      title: 'Why P2P scales: the file-distribution problem',
      src: 'text',
      blocks: [
        { p: 'The Web, e-mail and DNS rely on always-on infrastructure servers. In a [[peer-to-peer (P2P)]] architecture, intermittently connected hosts called [[peers]] talk to each other directly. Peers are PCs, laptops and phones owned by users, not by a service provider. The textbook’s main P2P example is distributing one large file (a Linux release, an OS patch, a video) from one server to many peers.' },
        { p: 'With **client-server** distribution, the server must send a full copy to every peer, which puts an enormous load on the server and uses a lot of server bandwidth. With **P2P** distribution, any peer can [[redistribute any portion of the file it has already received]] to other peers, so each newcomer adds demand **and** upload capacity. That property is [[self-scalability]].' },
        { list: [
          'Lecture recap: P2P has [[no always-on central server]]. Peers communicate directly and have dual roles (they request and provide resources).',
          'P2P is self-scaling, because new peers bring new service capacity as well as new demand.',
          'Peers are intermittently connected and their IP addresses change. A decentralised system is [[harder to manage]] and faces security, performance and reliability challenges.',
          'P2P is cost-effective: it needs little server infrastructure or server bandwidth.',
          'As of 2020 the most popular P2P file-distribution protocol is [[BitTorrent]] (originally by Bram Cohen). Many independent BitTorrent clients follow the same protocol, just as many browsers follow HTTP.'
        ] },
        { trap: 'P2P removes the dedicated always-on server, **not** the client and server roles. In each session, the peer that initiates the contact (the downloader) is the client and the peer that waits (the uploader) is the server.' }
      ]
    },
    {
      title: 'The distribution-time model (Figure 2.22)',
      src: 'text',
      blocks: [
        { p: 'Figure 2.22 shows one server and N peers, each attached to the Internet by its own access link. The quantity we compute is the distribution time.' },
        { def: 'Distribution time', text: 'The time it takes to get a complete copy of the file to [[all N peers]]. The last peer to finish determines it.' },
        { table: { head: ['Symbol', 'Meaning'], rows: [
          ['F', 'file size in **bits**'],
          ['N', 'number of peers that want a copy'],
          ['u_{s}', 'upload rate of the server’s access link'],
          ['u_{i}', 'upload rate of peer i’s access link'],
          ['d_{i}', 'download rate of peer i’s access link'],
          ['d_{min}', 'min{d_{1}, …, d_{N}}, the slowest downloader'],
          ['u_{total}', 'u_{s} + u_{1} + … + u_{N}, the total upload capacity of the system']
        ] }, caption: 'Notation used in every distribution-time problem' },
        { list: [
          'Assumption 1: the Internet core has [[abundant bandwidth]], so all bottlenecks are in the [[access networks]].',
          'Assumption 2: the server and the peers run no other network application, so all of their upload and download bandwidth goes to this file.',
          'Fluid model (used for the P2P bound): a peer can forward a bit as soon as it receives it. Real systems forward chunks, so the P2P formula is a good approximation.'
        ] }
      ]
    },
    {
      title: 'Client-server distribution time D_{cs}',
      src: 'text',
      blocks: [
        { list: [
          'The server must transmit one copy to **each** of the N peers, so it sends N·F bits through a link of rate u_{s}. That takes at least [[N·F/u_{s}]].',
          'The slowest peer cannot receive F bits faster than its download rate, so the time is at least [[F/d_{min}]].'
        ] },
        { formula: 'D_{cs} = max{ N·F / u_{s} , F / d_{min} }',
          where: [['N·F/u_{s}', 'server upload bound: N copies through one link'], ['F/d_{min}', 'slowest-downloader bound']],
          note: 'Equation 2.1. It is a lower bound, and the server can schedule its transmissions to achieve it (Problem P23), so treat it as the actual distribution time. With F in bits and rates in bits/s, the answer is in seconds.' },
        { p: 'For large N the N·F/u_{s} term wins, so D_{cs} [[grows linearly with N]] and without bound. If the number of peers grows a thousand-fold (from 1,000 to 1,000,000), the distribution time also grows a thousand-fold.' },
        { example: { q: 'F = 1 Gbit, u_{s} = 100 Mbps, d_{min} = 10 Mbps. Find D_{cs} for N = 5 and for N = 50.', a: 'N = 5: N·F/u_{s} = 5 × 10^{9} / 10^{8} = 50 s, and F/d_{min} = 10^{9} / 10^{7} = 100 s. D_{cs} = max(50, 100) = **100 s**. The slowest downloader is the bottleneck.\nN = 50: N·F/u_{s} = 50 × 10^{9} / 10^{8} = 500 s, and F/d_{min} = 100 s. D_{cs} = **500 s**. Now the server’s upload link is the bottleneck.' } },
        { trap: 'Don’t forget the F/d_{min} term. With few peers, the slowest downloader can dominate. In textbook P22 with N = 10, N·F/u_{s} = 6,667 s but F/d_{min} = 10,000 s, so D_{cs} = 10,000 s.' }
      ]
    },
    {
      title: 'P2P distribution time D_{P2P}',
      src: 'text',
      blocks: [
        { list: [
          'Only the server has the file at the start, so it must push **each bit at least once** into its access link: at least [[F/u_{s}]]. Unlike client-server, the server may never need to send that bit again, because peers can redistribute it.',
          'The slowest peer still needs at least [[F/d_{min}]].',
          'In total, N·F bits must be **uploaded** by someone, and the total upload capacity is u_{s} + u_{1} + … + u_{N}. So the time is at least [[N·F/(u_{s} + Σu_{i})]].'
        ] },
        { formula: 'D_{P2P} = max{ F / u_{s} , F / d_{min} , N·F / (u_{s} + u_{1} + … + u_{N}) }',
          where: [['F/u_{s}', 'server must send one copy'], ['F/d_{min}', 'slowest downloader'], ['N·F/(u_{s} + Σu_{i})', 'all N copies limited by total upload capacity']],
          note: 'Equations 2.2 and 2.3. This is a lower bound. If peers can forward each bit as soon as it arrives, some redistribution scheme achieves it [Kumar 2006] (Problem P24 proves a special case), so take it as the minimum distribution time. If all peers upload at u, then Σu_{i} = N·u.' },
        { example: { q: 'Same file as before (F = 1 Gbit, u_{s} = 100 Mbps, d_{min} = 10 Mbps), and each peer uploads at u = 2 Mbps. Find D_{P2P} for N = 50 and N = 1000, and compare with client-server.', a: 'N = 50: F/u_{s} = 10 s, F/d_{min} = 100 s, and N·F/(u_{s} + N·u) = 50 × 10^{9} / ((100 + 100) × 10^{6}) = 250 s. So D_{P2P} = **250 s** (client-server: 500 s).\nN = 1000: F/u_{s} = 10 s, F/d_{min} = 100 s, and N·F/(u_{s} + N·u) = 10^{12} / ((100 + 2000) × 10^{6}) = 476.2 s. So D_{P2P} = **476.2 s**, while D_{cs} = 1000 × 10^{9} / 10^{8} = **10,000 s**.\nGrowing N by 20× barely doubled the P2P time, because every peer added upload capacity.' } },
        { trap: 'The server term in D_{P2P} is F/u_{s} (one copy), **not** N·F/u_{s}. The denominator of the third term **includes the server**: u_{s} + Σu_{i}, not just Σu_{i}.' },
        { trap: 'Units: kbps = 10^{3} bps, Mbps = 10^{6} bps, Gbit = 10^{9} bits. A 20 Gbit file over a 2 Mbps download link takes 20 × 10^{9} / (2 × 10^{6}) = 10,000 s ≈ 2.78 h.' }
      ]
    },
    {
      title: 'Figure 2.23: client-server grows linearly, P2P stays bounded',
      src: 'text',
      blocks: [
        { p: 'Figure 2.23 sets every peer’s upload rate to u, with [[F/u = 1 hour]] (a peer can upload the whole file in an hour), [[u_{s} = 10u]], and d_{min} ≥ u_{s} so downloads never matter.' },
        { list: [
          'Client-server: D_{cs} = N·F/u_{s} = [[N/10 hours]]. This is a straight line that grows without bound.',
          'P2P: D_{P2P} = max{ F/u_{s}, N·F/(u_{s} + N·u) } = max{ 0.1, [[N/(10 + N)]] } hours. This is always below 1 hour and approaches F/u = 1 hour as N → ∞.'
        ] },
        { table: { head: ['N', 'D_{cs} (hours)', 'D_{P2P} (hours)'], rows: [
          ['5', '0.5', '0.333'],
          ['10', '1.0', '0.5'],
          ['20', '2.0', '0.667'],
          ['30', '3.0', '0.75'],
          ['35', '3.5', '0.778']
        ] }, caption: 'Values behind Figure 2.23 (x-axis N up to 35, y-axis up to 3.5 h)' },
        { p: 'Takeaway: P2P’s minimum distribution time is **always less** than client-server and stays [[under 1 hour for any N]]. Applications with a P2P architecture are self-scaling because peers are [[redistributors as well as consumers]] of bits.' },
        { example: { q: 'In the Figure 2.23 setup, N = 40. Compute D_{cs} and D_{P2P}.', a: 'D_{cs} = N/10 = 40/10 = **4 hours**.\nD_{P2P} = max{0.1, N/(10 + N)} = max{0.1, 40/50} = **0.8 hours** (48 min).' } },
        { game: 'number-crunch', text: 'Drill D_{cs} and D_{P2P} with random F, N, u_{s}, u and d_{min} until spotting the dominant term is automatic.' }
      ]
    },
    {
      title: 'Achieving the bounds: the schemes behind P23 and P24',
      src: 'text',
      blocks: [
        { p: 'Both formulas start out as lower bounds. Homework problems P23 and P24 show schedules that actually achieve them in a fluid model, where the server can send to several peers at once at different rates as long as the total does not exceed u_{s}.' },
        { example: { q: 'P23 (client-server): give a schedule that achieves max{N·F/u_{s}, F/d_{min}}.', a: 'Case u_{s}/N ≤ d_{min}: the server sends to all N peers in parallel at rate u_{s}/N each. Every peer can absorb that rate, and the total is exactly u_{s}. Each peer finishes after F/(u_{s}/N) = **N·F/u_{s}**.\nCase u_{s}/N ≥ d_{min}: the server sends to every peer in parallel at rate d_{min}. The total N·d_{min} ≤ u_{s}, so this is feasible. Each peer finishes after **F/d_{min}**.\nConclusion: u_{s}/N ≤ d_{min} exactly when N·F/u_{s} ≥ F/d_{min}, so the scheme always achieves the larger term. Both terms are also lower bounds, so D_{cs} = max{N·F/u_{s}, F/d_{min}}.' } },
        { example: { q: 'P24 (P2P, d_{min} huge): let u = u_{1} + … + u_{N}. Give schemes for the two cases u_{s} ≤ (u_{s} + u)/N and u_{s} ≥ (u_{s} + u)/N.', a: 'Case u_{s} ≤ (u_{s} + u)/N, which is equivalent to (N − 1)·u_{s} ≤ u: split the file into N parts, with part i of size (u_{i}/u)·F. The server sends part i to peer i at rate r_{i} = (u_{i}/u)·u_{s}, so Σr_{i} = u_{s}. Peer i forwards part i to each of the other N − 1 peers at rate r_{i}. That needs (N − 1)·r_{i} = (N − 1)·u_{s}·u_{i}/u ≤ u_{i}, which holds in this case. Every peer receives at r_{i} + Σ_{j≠i} r_{j} = u_{s}, so all finish at **F/u_{s}**.\nCase u_{s} ≥ (u_{s} + u)/N: let r_{i} = u_{i}/(N − 1) and r_{N+1} = (u_{s} − u/(N − 1))/N. The server sends peer i a stream at r_{i} (which peer i forwards to the other N − 1 peers, using exactly u_{i}) plus a private stream at r_{N+1}. The server’s total is u/(N − 1) + N·r_{N+1} = u_{s}. Each peer receives Σr_{j} + r_{N+1} = (u_{s} + u)/N, so all finish at **N·F/(u_{s} + u)**.\nConclusion: in each case the scheme achieves the larger of F/u_{s} and N·F/(u_{s} + u), and both are lower bounds, so D_{P2P} = max{F/u_{s}, N·F/(u_{s} + Σu_{i})} when d_{min} is not a bottleneck.' } }
      ]
    },
    {
      title: 'BitTorrent: torrents, trackers, chunks, neighbours',
      src: 'text',
      blocks: [
        { def: 'Torrent', text: 'The collection of [[all peers participating in the distribution of a particular file]]. At any instant a torrent may have fewer than ten or more than a thousand peers.' },
        { def: 'Chunk', text: 'Peers download equal-size pieces of the file from one another. The typical chunk size is [[256 KBytes]].' },
        { def: 'Tracker', text: 'An [[infrastructure node]] for each torrent. A joining peer registers with it and periodically tells it that it is still in the torrent, so the tracker knows which peers are participating.' },
        { steps: [
          'Alice joins the torrent and registers with the [[tracker]].',
          'The tracker randomly selects a subset of participating peers ([[about 50]]) and sends Alice their IP addresses.',
          'Alice tries to open concurrent [[TCP connections]] to all of them. The peers she connects to are her [[neighbouring peers]].',
          'Neighbours change over time: some leave, and peers outside the original 50 may open TCP connections to Alice.',
          'Periodically, Alice asks each neighbour for its list of chunks (L neighbours give her L lists).',
          'Alice requests the chunks she lacks over the TCP connections, choosing them with rarest first.'
        ], title: 'How a new peer (Alice) gets going (Figure 2.24)' },
        { list: [
          'A new peer has [[no chunks]] and accumulates them over time. It [[uploads while it downloads]].',
          'Once it has the whole file, a peer may leave **selfishly** or stay **altruistically** and keep uploading.',
          'Any peer may leave at any time holding only a subset of the chunks, and rejoin later.'
        ] }
      ]
    },
    {
      title: 'BitTorrent: rarest first and tit-for-tat',
      src: 'text',
      blocks: [
        { p: 'Alice has two decisions to make: (1) **which chunks to request** first from her neighbours, and (2) **which neighbours to send** requested chunks to.' },
        { def: 'Rarest first', text: 'Among the chunks she lacks, Alice requests first the ones with the [[fewest copies among her neighbours]]. Rare chunks then get redistributed quickly, which roughly [[equalises the number of copies]] of each chunk in the torrent.' },
        { def: 'Tit-for-tat (trading algorithm)', text: 'Alice gives priority to the neighbours that are [[currently supplying her data at the highest rate]].' },
        { list: [
          'Alice continually measures the rate at which she receives bits from each neighbour.',
          'She sends chunks to the [[4 peers]] feeding her fastest. These four are [[unchoked]].',
          'She recalculates the rates and possibly changes the top 4 every [[10 seconds]].',
          'Every [[30 seconds]] she also picks [[one additional neighbour at random]] and sends it chunks. That peer is [[optimistically unchoked]].',
          'All other neighbours are [[choked]] and get nothing from Alice. At most 4 + 1 = 5 neighbours receive from her at once.'
        ] },
        { p: 'Why optimistic unchoking matters: if Alice sends to a random peer Bob, she may become one of **Bob’s** top-4 uploaders, so Bob starts sending to her. If Bob is fast enough, he enters Alice’s top 4, and the two keep trading until one finds a better partner. The effect is that [[peers with compatible upload rates find each other]]. Random selection also lets [[new peers with no chunks]] get their first chunks, so they have something to trade.' },
        { def: 'Free-riding', text: 'Downloading without uploading. Without tit-for-tat (or a variant), most users would likely be [[free-riders]] and BitTorrent probably would not exist. The incentive can be circumvented, but BitTorrent still runs with millions of simultaneous peers in hundreds of thousands of torrents.' },
        { list: [ 'Mechanisms the textbook mentions but does not cover: pieces (mini-chunks), pipelining, random first selection, endgame mode, anti-snubbing.' ] },
        { trap: 'Rarest first decides **which chunk to request**. Tit-for-tat (unchoking) decides **whom to upload to**. Swapping the two is a classic MC trap.' },
        { trap: 'Timers: the top-4 unchoked set is re-evaluated every **10 s**, and the optimistic unchoke changes every **30 s**. “Unchoked” means Alice **sends** to that peer.' }
      ]
    },
    {
      title: 'Overlay networks and distributed hash tables',
      src: 'text',
      blocks: [
        { def: 'Overlay network', text: 'The logical network formed by the peers of a P2P system. [[Nodes are the participating peers]]. There is an [[edge]] between peers A and B if they have a (semi-permanent) [[TCP connection]] between them. Routers are [[not]] part of the overlay, because one overlay edge is a logical link that may cross many routers.' },
        { p: 'In BitTorrent, the overlay consists of each peer plus edges to its neighbours. It changes constantly as neighbours come and go.' },
        { example: { q: '4 peers each hold a TCP connection to every other peer. Those connections pass through 12 routers in total. How many nodes and edges does the overlay have?', a: 'Nodes are peers only: **4**. Edges are TCP connections: one per pair, 4 × 3 / 2 = **6**. The 12 routers do not appear in the overlay.\nIn general, N fully connected peers give N nodes and N(N − 1)/2 edges (textbook P25).' } },
        { def: 'Distributed hash table (DHT)', text: 'A simple database whose [[records are distributed over the peers]] of a P2P system. DHTs are widely implemented, for example in BitTorrent.' }
      ]
    },
    {
      title: 'Internet video: bit rates and compression',
      src: 'text',
      blocks: [
        { p: 'Streaming video (Netflix, YouTube, Amazon Prime) is about [[80% of Internet traffic]] (2020 estimate). The textbook covers **streaming stored video**: prerecorded content placed on servers and requested on demand.' },
        { list: [
          'A video is a sequence of images displayed at a constant rate, for example [[24 or 30 images per second]].',
          'An uncompressed image is an array of pixels, and each pixel is encoded in bits for luminance and colour.',
          'Video can be [[compressed]], trading quality against bit rate. Modern compression can reach essentially any bit rate, and a higher bit rate gives better quality.'
        ] },
        { table: { head: ['Quality', 'Typical compressed bit rate'], rows: [
          ['Low quality', '[[100 kbps]]'],
          ['HD movie streaming', 'over [[4 Mbps]]'],
          ['4K streaming', 'more than [[10 Mbps]]']
        ] } },
        { def: 'Key performance measure', text: 'Average end-to-end throughput. For continuous playout, the network must provide an average throughput [[at least as large as the compressed video bit rate]].' },
        { p: 'Compression can also produce [[several versions]] of the same video at different quality levels (for example 300 kbps, 1 Mbps and 3 Mbps). A user on fast broadband might pick 3 Mbps, and a smartphone on 3G might pick 300 kbps.' },
        { example: { q: 'The textbook says a 2 Mbps video lasting 67 minutes uses about 1 gigabyte. Verify.', a: 'Bits = 2 × 10^{6} bits/s × 67 × 60 s = 8.04 × 10^{9} bits.\nBytes = 8.04 × 10^{9} / 8 = 1.005 × 10^{9} bytes ≈ **1 GB** of storage and of traffic.' } }
      ]
    },
    {
      title: 'HTTP streaming and DASH',
      src: 'text',
      blocks: [
        { steps: [
          'The video is stored on an HTTP server as an [[ordinary file with a URL]].',
          'The client opens a TCP connection and sends an [[HTTP GET]] for that URL.',
          'The server sends the file in an HTTP response as fast as the network and traffic conditions allow.',
          'The client collects the bytes in a [[client application buffer]].',
          'When the buffer exceeds a [[predetermined threshold]], playback begins. The player grabs frames from the buffer, decompresses them and displays them while later parts are still arriving.'
        ], title: 'Plain HTTP streaming' },
        { p: 'Shortcoming of plain HTTP streaming (used by YouTube since its start): [[all clients receive the same encoding]], even though available bandwidth varies a lot across clients and over time for the same client.' },
        { def: 'DASH', text: '[[Dynamic Adaptive Streaming over HTTP]]. The video is encoded into several versions, each at a different bit rate and quality. The client dynamically requests [[chunks a few seconds long]] and chooses the version for each chunk.' },
        { list: [
          'Each version is stored on the HTTP server under a [[different URL]].',
          'A [[manifest file]] provides the URL of each version along with its bit rate.',
          'The client [[requests the manifest first]] to learn which versions exist.',
          'The client then requests **one chunk at a time** with an HTTP GET that names a URL and a [[byte range]].',
          'While downloading, the client measures the received bandwidth and runs a [[rate-determination algorithm]] to choose the next chunk.',
          'Lots of buffered video and high measured bandwidth: pick a high-bit-rate chunk. Little buffer and low bandwidth: pick a low-bit-rate chunk. The client can switch quality freely.'
        ] },
        { p: 'Benefits: clients with different access rates (3G vs fibre) get different encodings, and a client adapts **during** a session when its bandwidth changes, which matters for mobile users moving relative to base stations.' },
        { example: { q: 'Versions: 300 kbps, 1 Mbps, 3 Mbps. Chunks hold 4 s of video. The client measures 1.5 Mbps. How long does one 4 s chunk take to download at 3 Mbps and at 1 Mbps, and which should the client pick?', a: '3 Mbps chunk: 4 s × 3 Mbps = 12 Mbit, and 12 / 1.5 = **8 s** to download 4 s of video. The buffer drains by 4 s per chunk, so playback would eventually freeze.\n1 Mbps chunk: 4 Mbit / 1.5 Mbps ≈ **2.67 s** per 4 s of video. The buffer grows.\nPick the 1 Mbps version: the highest rate that stays below the measured throughput.' } },
        { trap: 'In DASH the **client** chooses the bit rate chunk by chunk. The server only stores the versions and the manifest. It is still plain HTTP GET over TCP, not a special push protocol.' }
      ]
    },
    {
      title: 'Content distribution networks (CDNs)',
      src: 'text',
      blocks: [
        { p: 'Why not stream everything from one massive data center? There are [[three problems]]:' },
        { list: [
          '**Distant clients:** packets cross many links and ISPs, possibly on other continents. If any link’s throughput is below the video consumption rate, the end-to-end throughput (set by the [[bottleneck link]]) is too low and playback freezes. More links make this more likely.',
          '**Wasted bandwidth:** a popular video is sent [[many times over the same links]], and the video company pays its provider ISP to send the same bytes again and again.',
          '**Single point of failure:** if the data center or its Internet links go down, no video can be streamed.'
        ] },
        { def: 'CDN', text: 'A content distribution network manages servers in [[multiple geographically distributed locations]], stores copies of videos (and other Web content: documents, images, audio) on them, and tries to direct each user request to the CDN location that gives the [[best user experience]].' },
        { table: { head: ['', 'Private CDN', 'Third-party CDN'], rows: [
          ['Owner', 'the content provider itself', 'a CDN company serving many content providers'],
          ['Examples', '[[Google’s CDN]] (YouTube), Netflix Open Connect', '[[Akamai]], Limelight, Level-3']
        ] } },
        { table: { head: ['', 'Enter deep', 'Bring home'], rows: [
          ['Pioneer / example', '[[Akamai]]', '[[Limelight]] and many others'],
          ['Where clusters go', 'inside [[access ISPs]] all over the world', 'large clusters at a few key sites, usually [[IXPs]]'],
          ['How many sites', 'thousands of locations', 'a smaller number (for example tens)'],
          ['Benefit', 'close to users: fewer links and routers, so lower delay and higher throughput', 'lower maintenance and management overhead'],
          ['Cost', 'highly distributed, so hard to maintain and manage', 'possibly higher delay and lower throughput for users']
        ] }, caption: 'The two server-placement philosophies (textbook R24)' },
        { p: 'Content placement: a CDN usually does not store every video in every cluster, because some videos are rarely viewed or only popular in some countries. Many CDNs use a simple [[pull]] strategy: if a cluster lacks a requested video, it fetches it (from a central repository or another cluster), stores a copy and streams it to the client at the same time. When storage is full, it evicts videos that are not requested often, like a Web cache. The alternative is [[push]]: the CDN places content in clusters ahead of time (Netflix pushes at off-peak hours).' }
      ]
    },
    {
      title: 'CDN operation: intercepting requests with DNS',
      src: 'text',
      blocks: [
        { p: 'When a browser asks for a video URL, the CDN must intercept the request so it can (1) [[choose a suitable server cluster]] for that client at that time and (2) [[redirect]] the request to a server in that cluster. Most CDNs do this with [[DNS]].' },
        { steps: [
          'The user visits the Web page at NetCinema (the content provider).',
          'The user clicks http://video.netcinema.com/6Y7B23V, and the host sends a [[DNS query for video.netcinema.com]].',
          'The user’s local DNS server (LDNS) relays the query to NetCinema’s [[authoritative DNS server]]. That server sees “video” in the name and, instead of an IP address, returns a [[hostname in KingCDN’s domain]] (for example a1105.kingcdn.com).',
          'The query now enters [[KingCDN’s private DNS infrastructure]]. The LDNS queries a1105.kingcdn.com, and KingCDN’s DNS returns the IP address of a KingCDN content server. **This is where the server is chosen.**',
          'The LDNS forwards that IP address to the user’s host.',
          'The client opens a [[direct TCP connection]] to that KingCDN server and sends an HTTP GET for the video. With DASH, the server first sends a manifest file listing a URL for each version.'
        ], title: 'DNS redirect: NetCinema uses third-party CDN KingCDN (Figure 2.25)' },
        { trap: 'NetCinema’s authoritative server does **not** return the video server’s IP. It hands the query over to the CDN by returning a CDN hostname, and the CDN’s own DNS picks the server. The CDN learns the IP of the client’s **LDNS**, not the client’s own IP.' }
      ]
    },
    {
      title: 'Cluster selection strategies',
      src: 'text',
      blocks: [
        { p: 'A [[cluster selection strategy]] dynamically directs each client to a server cluster or data center. From the DNS lookup, the CDN learns the [[IP address of the client’s LDNS]] and picks a cluster based on it. Real strategies are proprietary. Two simple ones:' },
        { def: 'Geographically closest', text: 'Commercial [[geo-location databases]] (for example Quova, MaxMind) map each LDNS IP to a location. The CDN picks the cluster with the fewest kilometres “as the bird flies” from the LDNS. This works reasonably well for a large fraction of clients.' },
        { list: [
          'Problem 1: the geographically closest cluster may not be closest in [[network path length or hop count]].',
          'Problem 2 (true of every DNS-based approach): some users use a [[remote LDNS]], so the LDNS location may be far from the client.',
          'Problem 3: it [[ignores variation in delay and available bandwidth over time]] and always assigns a client the same cluster.'
        ] },
        { def: 'Real-time measurements', text: 'Clusters periodically probe LDNSs worldwide (for example with [[ping messages or DNS queries]]) to measure current delay and loss, and pick the best cluster under current traffic conditions. Drawback: [[many LDNSs are configured not to respond]] to such probes.' },
        { list: [
          'Other factors that matter besides delay, loss and bandwidth (textbook R25):',
          '[[Load balancing]]: don’t send clients to overloaded clusters. YouTube sometimes directs a client to a more distant cluster for this reason.',
          'Diurnal (time-of-day) effects, and variation across DNS servers within one network.',
          '[[Content availability]]: rarely accessed videos may exist in only a few clusters. Netflix first finds which servers hold the movie.',
          'Relieving [[hot spots]] created by suddenly popular content.',
          '[[ISP delivery cost]]: choosing clusters so that traffic flows over the cheapest ISP relationships.'
        ] }
      ]
    },
    {
      title: 'Case studies: Google’s network, Netflix, YouTube',
      src: 'text',
      blocks: [
        { list: [
          'Google’s private CDN has three tiers.',
          'Tier 1: [[19 mega data centers]] (North America, Europe, Asia), each with on the order of 100,000 servers. They serve dynamic, personalised content such as search results and Gmail.',
          'Tier 2: about [[90 clusters in IXPs]], each with hundreds of servers. They serve static content, including [[YouTube videos]] (this tier is “bring home”).',
          'Tier 3: many hundreds of [[enter-deep clusters inside access ISPs]], each with tens of servers in a single rack. They perform TCP splitting and serve static content, such as the static parts of search-result pages.',
          'All tiers are linked by Google’s own private network. A search query goes to a nearby enter-deep cache, which returns the static parts and forwards the query over Google’s network to a mega data center for the personalised results.'
        ] },
        { list: [
          'Netflix uses two main components: the [[Amazon cloud]] and its own [[private CDN]].',
          'The Amazon cloud runs the Web site (registration and login, billing, catalogue, recommendations). It also does [[content ingestion]] (uploads studio masters), [[content processing]] (creates many formats at multiple bit rates for DASH) and [[uploading versions to the CDN]].',
          'In 2007 Netflix used three third-party CDNs. It now uses only its own CDN, with racks in over 200 IXP locations and hundreds of residential ISPs. Each server has several 10 Gbps Ethernet ports and over 100 TB of storage. IXP installations hold the entire library, including every DASH version.',
          'Netflix uses [[push caching]]: videos are pushed to CDN servers during [[off-peak hours]], not pulled on cache misses. Sites that can’t hold everything get the most popular videos, chosen day to day.',
          'When a user picks a movie, Netflix software in the Amazon cloud finds which CDN servers have it and picks the “best” one. A rack inside the user’s ISP is preferred if it has the movie, otherwise a nearby IXP server is used.',
          'Netflix sends the client that server’s IP plus a [[manifest file]]. The client then uses a [[proprietary DASH]] with HTTP byte-range GETs and chunks of about [[4 seconds]]. Because Netflix tells the client the server directly, it [[does not need DNS redirect]].'
        ] },
        { list: [
          'YouTube is the world’s largest video-sharing site (launched April 2005, bought by Google November 2006). It uses Google’s [[private CDN]], with clusters in hundreds of IXP and ISP locations plus the data centers.',
          'Unlike Netflix, YouTube uses [[pull caching]] and [[DNS redirect]].',
          'Cluster selection: usually the cluster with the [[lowest RTT]] to the client, but sometimes a more distant one to balance load.',
          'Streaming: plain HTTP streaming with a small number of versions. YouTube [[does not use DASH]]: the user selects a version manually.',
          'It uses HTTP [[byte-range requests]] to limit how much is sent after a target amount has been prefetched, which saves bandwidth wasted when users reposition or stop early.',
          'Uploads also travel over HTTP (client to server). Google data centers convert each video to YouTube’s format and create multiple bit-rate versions.'
        ] },
        { table: { head: ['', 'Netflix', 'YouTube'], rows: [
          ['CDN', 'private (racks in IXPs and ISPs)', 'private (Google clusters in IXPs and ISPs, plus data centers)'],
          ['Filling caches', '[[push]] at off-peak hours', '[[pull]] (on demand)'],
          ['Directing the client', 'its software in the Amazon cloud tells the client the server IP (no DNS redirect)', '[[DNS redirect]], usually to the lowest-RTT cluster'],
          ['Adaptation', 'proprietary [[DASH]], about 4 s chunks', 'no DASH: the user picks the version manually'],
          ['Video processing', 'Amazon cloud', 'Google data centers']
        ] }, caption: 'Netflix vs YouTube at a glance' }
      ]
    }
  ],
  recall: [
    { q: 'Write D_{cs}.', a: 'D_{cs} = max{ N·F/u_{s} , F/d_{min} }. It grows linearly with N.' },
    { q: 'Write D_{P2P}.', a: 'D_{P2P} = max{ F/u_{s} , F/d_{min} , N·F/(u_{s} + Σu_{i}) }.' },
    { q: 'Why is the server term F/u_{s} in P2P but N·F/u_{s} in client-server?', a: 'In P2P the server only has to inject each bit once, because peers redistribute it. In client-server it must send all N copies itself.' },
    { q: 'What two assumptions does the distribution-time model make?', a: 'The core has abundant bandwidth (bottlenecks are only in access links), and server and peers devote all their bandwidth to this file.' },
    { q: 'Figure 2.23 setup: F/u = 1 h, u_{s} = 10u. D_{cs} and D_{P2P} as functions of N?', a: 'D_{cs} = N/10 h. D_{P2P} = max{0.1, N/(10 + N)} h, which is always below 1 h.' },
    { q: 'Define torrent, tracker and chunk.', a: 'Torrent: all peers sharing one file. Tracker: infrastructure node where peers register, which gives newcomers about 50 random peer IPs. Chunk: an equal-size piece of the file, typically 256 KB.' },
    { q: 'What does rarest first decide, and why is it used?', a: 'Which missing chunk to request first: the one with the fewest copies among the neighbours. It spreads rare chunks quickly and roughly equalises copies.' },
    { q: 'Tit-for-tat: how many peers are unchoked, and how often is the set re-evaluated?', a: 'The top 4 suppliers (by rate to Alice), re-evaluated every 10 s, plus 1 random optimistically unchoked peer every 30 s.' },
    { q: 'How does a brand-new peer with no chunks get its first chunk?', a: 'Another peer optimistically unchokes it (picks it at random) and sends it chunks.' },
    { q: 'Overlay network: what are the nodes, what are the edges, and does it include routers?', a: 'Nodes are peers, edges are TCP connections between peers, and routers are not included.' },
    { q: 'What is a DHT?', a: 'A distributed hash table: a simple database whose records are spread over the peers of a P2P system.' },
    { q: 'What is the most important performance measure for streaming video?', a: 'Average end-to-end throughput, which must be at least the video’s bit rate.' },
    { q: 'What does a DASH manifest file contain, and who picks the bit rate?', a: 'A URL for each version along with its bit rate. The client picks the bit rate for each chunk based on measured bandwidth and buffer level.' },
    { q: 'What is the main shortcoming of plain HTTP streaming?', a: 'Every client gets the same encoding regardless of its bandwidth or how that bandwidth changes.' },
    { q: 'Name three problems with serving all video from one mega data center.', a: 'Distant clients hit bottleneck links (freezing), popular videos cross the same links repeatedly (wasted bandwidth and cost), and it is a single point of failure.' },
    { q: 'Enter deep vs bring home?', a: 'Enter deep (Akamai): clusters inside access ISPs at thousands of sites, close to users, hard to manage. Bring home (Limelight): large clusters at tens of sites (IXPs), easier to manage, more delay.' },
    { q: 'In the NetCinema/KingCDN example, what does NetCinema’s authoritative DNS server return?', a: 'A hostname in KingCDN’s domain (for example a1105.kingcdn.com), not an IP address. KingCDN’s DNS then returns the content server’s IP.' },
    { q: 'Two cluster-selection strategies and one drawback of each?', a: 'Geographically closest: geographic distance is not network distance, a remote LDNS misleads it, and it ignores load and time variation. Real-time measurement: many LDNSs ignore probes.' },
    { q: 'Netflix vs YouTube: caching, redirection, adaptation?', a: 'Netflix: push at off-peak hours, its software tells the client the server (no DNS redirect), proprietary DASH with about 4 s chunks. YouTube: pull, DNS redirect, no DASH (manual version choice).' }
  ]
});
})();
