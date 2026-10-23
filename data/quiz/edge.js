NET.addQuestions('edge', [
  // ---------- Nuts and bolts ----------
  { id: 'edge-01', d: 1, type: 'mc', src: 'cheat',
    q: 'In Internet terminology, what is an end system (host)?',
    choices: [
      'A router at the edge of an ISP’s network',
      'Any device that forwards packets from an incoming link to an outgoing link',
      'An Internet-connected device at the network’s edge that runs applications',
      'The first router on the path from a home to the rest of the Internet'
    ],
    a: 2,
    why: 'End systems (hosts) sit at the Internet’s edge and run — “host” — application programs: PCs, phones, servers, IoT things. A device that forwards packets between links is a packet switch (router or link-layer switch), and the first router on the path is the edge router; both are network equipment, not end systems.' },

  { id: 'edge-02', d: 1, type: 'short', src: 'ch1-R1',
    q: 'What is the difference between a host and an end system? List several different types of end systems. Is a Web server an end system?',
    a: 'There is no difference: “host” and “end system” are used interchangeably. End systems include desktop PCs, laptops, smartphones, tablets, servers (Web, e-mail) and non-traditional “things” such as TVs, game consoles, thermostats, cars and traffic lights. Yes — a Web server is an end system: it sits at the network edge and runs (hosts) an application program, the Web server.',
    keys: ['no difference|same|interchangeable', 'PC|laptop|smartphone|tablet|desktop', 'server', 'yes'],
    why: 'Textbook: “host = end system”. Hosts are sometimes split into clients (desktops, laptops, phones) and servers (more powerful machines, mostly in data centers) — but both kinds are end systems. A Web server is the classic example of a server-type end system; it is not part of the network core, because it runs an application rather than forwarding other people’s packets.' },

  { id: 'edge-03', d: 1, type: 'mc', src: 'cheat',
    q: 'Which statement correctly distinguishes a (link-layer) switch from a router?',
    choices: [
      'A switch connects devices within a LAN; a router connects multiple networks together',
      'A switch connects multiple networks together; a router connects devices within one LAN',
      'A switch forwards packets; a router only forwards circuits',
      'A router is an end system; a switch is a packet switch'
    ],
    a: 0,
    why: 'Lecture: “A switch connects devices within a LAN, while a router connects multiple networks together.” Both are packet switches (both forward packets), so the “circuits” and “end system” choices are wrong; swapping LAN and multiple networks is the classic mistake.' },

  { id: 'edge-04', d: 2, type: 'mc', src: 'text',
    q: 'According to the textbook, where are the two main types of packet switch typically used?',
    choices: [
      'Routers in access networks; link-layer switches in the network core',
      'Both only inside end systems',
      'Link-layer switches only in tier-1 ISPs; routers only in homes',
      'Link-layer switches in access networks; routers in the network core'
    ],
    a: 3,
    why: '“Link-layer switches are typically used in access networks, while routers are typically used in the network core.” This matches the LAN-vs-networks distinction: a campus Ethernet switch joins the devices of one LAN (access), while core routers join networks (ISPs) together.' },

  { id: 'edge-05', d: 1, type: 'multi', src: 'cheat',
    q: 'Which of the following are kinds of communication links (media) the Internet uses? Select all that apply.',
    choices: ['Optical fibre', 'Copper cable (e.g., Ethernet twisted pair, coax)', 'Wireless radio (Wi-Fi, cellular)', 'Satellite connections', 'Routers'],
    a: [0, 1, 2, 3],
    why: 'Lecture: communication links include optical fibre, copper cables (e.g., Ethernet), wireless radio signals (Wi-Fi, cellular) and satellite connections. A router is a packet switch — a device that links connect — not a link.' },

  { id: 'edge-06', d: 1, type: 'mc', src: 'cheat',
    q: 'The transmission rate (bandwidth) of a communication link is measured in…',
    choices: ['bytes per packet', 'bits per second', 'packets per hop', 'meters per second'],
    a: 1,
    why: 'Link bandwidth = transmission rate in bits per second (bps, kbps = 10^{3} bps, Mbps = 10^{6} bps, Gbps = 10^{9} bps). Meters per second is a propagation speed — a property of the medium, not of the link rate. Bytes per packet is a packet size.' },

  { id: 'edge-07', d: 2, type: 'multi', src: 'cheat',
    q: 'Which statements match the lecture/textbook definitions? Select all that apply.',
    choices: [
      'A network consists of interconnected devices, communication links, and routers and other networking hardware',
      'The Internet is a global system of interconnected networks, built through interconnected ISPs',
      'The Internet is a single network operated by one global provider',
      'Each ISP is itself a network of packet switches and communication links',
      'A network requires every link to use the same physical medium'
    ],
    a: [0, 1, 3],
    why: 'A network = devices + links + routers/hardware. The Internet = a network of networks: independently managed ISP networks interconnected (all running IP). There is no single global provider. Media can differ on every hop — a bit may cross twisted pair, then fiber, then radio.' },

  { id: 'edge-08', d: 1, type: 'mc', src: 'cheat',
    q: 'Which organization develops most Internet standards, and what are its standards documents called?',
    choices: ['IEEE 802; RFCs', 'IETF; RFCs', 'IETF; IEEE standards', 'ISO; DOCSIS documents'],
    a: 1,
    why: 'The Internet Engineering Task Force (IETF) develops Internet standards; its documents are Requests for Comments (RFCs), which define protocols such as TCP, IP, HTTP and SMTP. IEEE 802 is a different body that standardizes Ethernet and WiFi; DOCSIS is the cable-modem standard.' },

  { id: 'edge-09', d: 2, type: 'multi', src: 'cheat',
    q: 'Which statements about protocols and standards are true? Select all that apply.',
    choices: [
      'RFCs define protocols such as TCP, IP, HTTP and SMTP',
      'The IEEE 802 LAN Standards Committee specifies Ethernet and WiFi',
      'RFCs are informal suggestions that implementations can ignore without hurting interoperability',
      'IP specifies the format of the packets sent and received among routers and end systems',
      'Ethernet, Wi-Fi and 4G/5G are examples of standards/technologies providing wired and wireless connectivity',
      'Standards are unnecessary as long as each vendor documents its own protocol'
    ],
    a: [0, 1, 3, 4],
    why: 'Standards exist so independently built products interoperate — so a vendor-private protocol defeats the purpose, and RFCs are not optional suggestions despite the name. IP’s job, per the textbook, is to specify the packet format; TCP and IP together are the core of TCP/IP.' },

  { id: 'edge-10', d: 2, type: 'mc', src: 'cheat',
    q: 'In the “services view” of the Internet, what do the API “hooks” provide?',
    choices: [
      'A way for routers to run application code in the network core',
      'Physical connectors for twisted-pair and coaxial cable',
      'A billing interface between customer and provider ISPs',
      'A programming (socket) interface through which a sending program asks the Internet to deliver data to a specific program on another end system'
    ],
    a: 3,
    why: 'The Internet offers distributed applications a programming interface — the socket interface — a set of rules the sending program must follow (like the postal service’s envelope/address/stamp rules) so the Internet can deliver its data to the destination program and use Internet transport services. Applications run on end systems, not in routers.' },

  { id: 'edge-11', d: 1, type: 'tf', src: 'text',
    q: 'True or false: Internet applications such as the Web and e-mail run in the packet switches of the network core as well as in end systems.',
    a: false,
    why: 'False. Applications run only on end systems. Packet switches help exchange data but “are not concerned with the application that is the source or sink of data.” That is why a new application can be deployed without changing any router.' },

  { id: 'edge-12', d: 2, type: 'multi', src: 'cheat',
    q: 'Which statements about servers and data centers are true? Select all that apply.',
    choices: [
      'Servers are often located in large data centers',
      'Data centers serve e-commerce pages, run massively parallel computations for their owner, and provide cloud computing to other companies',
      'Data-center hosts (blades) are stacked in racks of typically 20–40',
      'Data centers are the routers of the network core that forward transit traffic between ISPs',
      'Client devices such as smartphones are usually housed in data centers'
    ],
    a: [0, 1, 2],
    why: 'Most servers we use live in data centers (Google: 19 data centers, several million servers). Amazon example of the three purposes: e-commerce pages, internal parallel computing, cloud services (AWS — Airbnb runs there). Hosts are commodity “blades” in racks of 20–40. Data-center machines are hosts at the edge, not core routers, and clients are users’ own devices.' },

  // ---------- Edge, access, core ----------
  { id: 'edge-13', d: 1, type: 'mc', src: 'cheat',
    q: 'What is an access network?',
    choices: [
      'The network that physically links an end system to the first router (edge router) on its path to any distant end system',
      'The mesh of routers that interconnects ISPs',
      'Any wireless network',
      'A content provider’s private network'
    ],
    a: 0,
    why: 'Definition: the access network connects an end system to its edge router. It may be wired (DSL, cable, FTTH, Ethernet) or wireless (WiFi, 4G/5G) — so “any wireless network” is too narrow and also not the definition. The mesh of routers is the core.' },

  { id: 'edge-14', d: 1, type: 'mc', src: 'cheat',
    q: 'For a given end system, which router is its edge router?',
    choices: [
      'Any router owned by a tier-1 ISP',
      'The router at the nearest IXP',
      'The first router on the path from that end system toward another distant end system',
      'The router closest to the destination server'
    ],
    a: 2,
    why: 'The edge router is where the end system’s access network ends: the first router on its path to any distant end system. Tier-1 and IXP routers are deep in the core. The router nearest the destination server is that server’s edge router, not yours.' },

  { id: 'edge-15', d: 1, type: 'multi', src: 'cheat',
    q: 'Which are the three types of access networks named in lecture? Select all that apply.',
    choices: ['Residential access networks', 'Institutional access networks (schools, companies)', 'Mobile access networks (Wi-Fi, 4G/5G)', 'Tier-1 access networks', 'Peering access networks'],
    a: [0, 1, 2],
    why: 'Residential (home: DSL, cable, FTTH, 5G fixed wireless), institutional (Ethernet/WiFi LANs in schools and companies) and mobile (Wi-Fi, 4G/5G). Tier-1 and peering are terms from the ISP hierarchy in the core, not access-network types.' },

  { id: 'edge-16', d: 3, type: 'mc', src: 'cheat',
    q: 'Your laptop is plugged into a cable modem at home. The modem reaches the cable company over an HFC line to the head end, where the cable company’s router connects to a regional ISP and then to a tier-1 ISP. Which classification is correct?',
    choices: [
      'Laptop = network core; HFC line = network edge; regional/tier-1 routers = access network',
      'Laptop and HFC line = network edge; head-end router and beyond = access network',
      'Laptop = access network; HFC line = network core; tier-1 ISP = network edge',
      'Laptop = network edge; the HFC line from the modem to the cable company’s first router = access network; regional and tier-1 routers = network core'
    ],
    a: 3,
    why: 'Edge = end systems (the laptop). Access network = the link(s) connecting the end system to its edge router — here the HFC line from the cable modem to the cable company’s first router at the head end. Core = the mesh of routers and links beyond it (regional and tier-1 ISPs). The common mistake is to call the access link “the edge”; the edge is the hosts themselves.' },

  { id: 'edge-17', d: 1, type: 'mc', src: 'cheat',
    q: 'What is the network core?',
    choices: [
      'The end systems at the edge of the Internet',
      'The link from a home to its edge router',
      'The interconnected mesh of packet switches and links (routers) that connects the Internet’s end systems — a network of networks',
      'The set of all servers in data centers'
    ],
    a: 2,
    why: 'Core = mesh of packet switches and links interconnecting the end systems; it consists of interconnected routers and is a network of networks (ISPs). “The end systems” describes the edge, “the link from a home to its edge router” is an access network, and data-center servers are hosts at the edge.' },

  { id: 'edge-18', d: 2, type: 'short', src: 'cheat',
    q: 'Distinguish the network edge, an access network and the network core, giving one example of each.',
    a: 'The network edge is the end systems (hosts) — e.g., a laptop or a Web server. An access network directly links an end system to the first router (edge router) on its path to a distant end system — e.g., a DSL or cable line, campus Ethernet, WiFi, or 4G/5G. The network core is the interconnected mesh of packet switches and links (routers) that connects end systems — e.g., the routers and fiber of regional and tier-1 ISPs.',
    keys: ['end systems|hosts', 'edge router|first router', 'DSL|cable|Ethernet|WiFi|4G|5G|FTTH', 'mesh|packet switches|routers', 'ISP|network of networks'],
    why: 'This is the lecture’s DISTINGUISH bullet. Mnemonic: edge = who (hosts), access = how they get on (the first hop to the edge router), core = what carries traffic between networks (router mesh).' },

  { id: 'edge-19', d: 2, type: 'num', src: 'cheat',
    q: 'A host breaks an application message into packets of 1,500 bytes and sends them into its access network at R = 20 Mbps. What is the transmission delay of one packet? Answer in ms.',
    a: 0.6, unit: 'ms',
    why: 'Host sending function: d_{trans} = L/R.\nL = 1,500 bytes × 8 = 12,000 bits; R = 20 Mbps = 20 × 10^{6} bits/s.\nL/R = 12,000 / 20,000,000 = 0.0006 s = 0.6 ms.\nTrap: forgetting × 8 gives 0.075 ms.' },

  // ---------- Access technologies ----------
  { id: 'edge-20', d: 2, type: 'short', src: 'ch1-R4',
    q: 'List four access technologies. Classify each one as home access, enterprise access, or wide-area wireless access.',
    a: 'Home access: DSL, cable (HFC), fiber to the home (FTTH), 5G fixed wireless (also old dial-up). Enterprise (and home) access: Ethernet and WiFi LANs. Wide-area wireless access: 3G, 4G LTE and 5G cellular.',
    keys: ['DSL|cable|HFC|FTTH|fiber', 'home|residential', 'Ethernet|WiFi|802.11', 'enterprise|institutional', '4G|5G|LTE|3G|cellular', 'wide-area|mobile'],
    why: 'Any four from the three groups earns full credit. Note that Ethernet and WiFi began in enterprises but are now standard parts of home networks, and 5G appears twice: 5G fixed wireless is a home technology, while 5G cellular is wide-area wireless.' },

  { id: 'edge-21', d: 2, type: 'order', src: 'text',
    q: 'Order the three channels on a DSL telephone line from the lowest frequency band to the highest.',
    items: ['Two-way telephone channel (0–4 kHz)', 'Upstream data channel (4–50 kHz)', 'Downstream data channel (50 kHz–1 MHz)'],
    why: 'DSL uses frequency-division multiplexing: voice at 0–4 kHz, medium-speed upstream at 4–50 kHz, high-speed downstream at 50 kHz–1 MHz. The widest (highest) band carries the fastest direction — downstream — which is why DSL is asymmetric.' },

  { id: 'edge-22', d: 1, type: 'mc', src: 'text',
    q: 'In DSL access, which device in the telco’s central office translates the analog signals from many homes back to digital and sends the data into the Internet?',
    choices: ['CMTS', 'DSLAM', 'OLT', 'ONT'],
    a: 1,
    why: 'DSLAM = digital subscriber line access multiplexer, in the central office; it also separates the data and phone signals. CMTS is the cable equivalent at the cable head end; OLT (central office) and ONT (home) belong to fiber-to-the-home.' },

  { id: 'edge-23', d: 1, type: 'mc', src: 'text',
    q: 'Why are DSL and cable access described as asymmetric?',
    choices: [
      'Their downstream and upstream transmission rates differ (downstream is faster)',
      'The modem and the central-office equipment run different protocols',
      'Upstream travels over fiber while downstream travels over copper',
      'Only one of the two directions carries IP packets'
    ],
    a: 0,
    why: 'Asymmetric = different rates in each direction. DSL: e.g., 24 Mbps down vs 3.5 Mbps up; cable DOCSIS 3.0: 1.2 Gbps down vs 100 Mbps up. Both directions carry ordinary IP traffic over the same medium.' },

  { id: 'edge-24', d: 3, type: 'tf', src: 'text',
    q: 'True or false: on a DSL line, starting a telephone call reduces the Internet downstream rate, because voice and data share the same wire.',
    a: false,
    why: 'False. They do share one wire, but frequency-division multiplexing places voice at 0–4 kHz, upstream data at 4–50 kHz and downstream data at 50 kHz–1 MHz. The single DSL link behaves like three separate links, so a call and an Internet connection proceed simultaneously without taking each other’s band. A splitter in the home and the DSLAM in the CO separate the signals.' },

  { id: 'edge-25', d: 3, type: 'num', src: 'text',
    q: 'A DSL home has 24 Mbps downstream and 3.5 Mbps upstream. It uploads a 21 MB (21 × 10^{6} bytes) video, and later downloads the same file, each at the full rate. How many seconds longer does the upload take than the download?',
    a: 41, unit: 's',
    why: 'File = 21 × 10^{6} × 8 = 168 × 10^{6} bits.\nUpload uses the upstream rate: 168 × 10^{6} / 3.5 × 10^{6} = 48 s.\nDownload uses the downstream rate: 168 × 10^{6} / 24 × 10^{6} = 7 s.\nDifference = 48 − 7 = 41 s. Asymmetric access makes uploads much slower.' },

  { id: 'edge-26', d: 2, type: 'mc', src: 'ch1-R5',
    q: 'Is the HFC (cable) transmission rate dedicated or shared among users?',
    choices: [
      'Dedicated: each home has its own coax back to the head end',
      'Dedicated downstream, shared upstream',
      'Shared: HFC is a broadcast medium — downstream packets reach every home and the homes share the upstream channel',
      'Shared downstream only; upstream is dedicated per home'
    ],
    a: 2,
    why: 'Cable is a shared broadcast medium in both directions: every packet from the head end travels on every downstream link to every home, and every home’s packets travel on the one upstream channel to the head end. That is why many simultaneous video downloads each get far less than the aggregate rate.' },

  { id: 'edge-27', d: 2, type: 'short', src: 'ch1-R5',
    q: 'Are collisions possible in a downstream HFC channel? Why or why not? What about upstream?',
    a: 'No collisions downstream: only one node — the cable head end (CMTS) — transmits on the downstream channel, broadcasting to all homes, so there is never a second simultaneous sender to collide with. Upstream, many homes’ cable modems share one channel, so collisions are possible and a distributed multiple access protocol is needed to coordinate them.',
    keys: ['no|not possible', 'one sender|single sender|only the head end|CMTS', 'broadcast', 'upstream|many homes', 'multiple access protocol|coordinate'],
    why: 'A collision requires two transmitters on the same channel at once. Downstream has exactly one transmitter. The textbook explicitly notes that because the upstream channel is shared, “a distributed multiple access protocol is needed to coordinate transmissions and avoid collisions” (Chapter 6).' },

  { id: 'edge-28', d: 1, type: 'mc', src: 'text',
    q: 'Which describes a hybrid fiber-coax (HFC) network?',
    choices: [
      'Coax from the head end to neighborhood nodes, then fiber to each home; DSLAM at the head end',
      'Fiber all the way to each home; OLT at the head end',
      'Twisted pair to each home; CMTS in each home',
      'Fiber from the head end to neighborhood fiber nodes, then coax to homes; CMTS at the head end'
    ],
    a: 3,
    why: 'Fiber runs from the cable head end to neighborhood junctions (each serving 500–5,000 homes), and coaxial cable runs from there to the homes. Each home has a cable modem; the cable modem termination system (CMTS) at the head end plays the DSLAM’s role. Fiber-to-every-home with an OLT is FTTH.' },

  { id: 'edge-29', d: 2, type: 'num', src: 'text',
    q: 'A DOCSIS 3.0 neighborhood has a 1.2 Gbps downstream channel. 40 homes are simultaneously downloading large files and share the channel equally. What downstream rate does each home get? Answer in Mbps.',
    a: 30, unit: 'Mbps',
    why: 'Shared broadcast medium: 1.2 Gbps = 1,200 Mbps; 1,200 / 40 = 30 Mbps per home. If only one home were active it could get (up to) the full 1.2 Gbps — capacity is shared on demand.' },

  { id: 'edge-30', d: 3, type: 'mc', src: 'text',
    q: 'Two cable customers on the same neighborhood channel compare speeds. Alice, in the evening while about 30 neighbors stream video, gets far below the advertised downstream rate. Bob, in the morning while a few neighbors browse the Web, gets close to the full rate. What is the best explanation?',
    choices: [
      'The downstream channel is a shared broadcast medium: many simultaneous heavy downloads split the aggregate rate, while sparse Web requests rarely overlap, so each user can get the full rate',
      'Bob’s coax is dedicated while Alice’s is shared',
      'Collisions on the downstream channel increase in the evening',
      'The CMTS gives each home a fixed time slot regardless of demand'
    ],
    a: 0,
    why: 'This is exactly the textbook’s example. Sharing is on demand: with many concurrent downloads each gets a slice; with few, bursty Web requests each request usually has the channel to itself. Downstream collisions are impossible (single sender), and nothing is fixed per home.' },

  { id: 'edge-31', d: 3, type: 'short', src: 'ch1-R9',
    q: 'HFC, DSL and FTTH are all used for residential access. For each, give a range of transmission rates and say whether the transmission rate is shared or dedicated.',
    a: 'HFC (cable): DOCSIS 2.0 gives 40 Mbps down / 30 Mbps up and DOCSIS 3.0 gives 1.2 Gbps down / 100 Mbps up; the rate is shared among the homes on the cable (broadcast medium). DSL: downstream 24–52 Mbps, upstream 3.5–16 Mbps (newest standard up to 1 Gbps aggregate), falling with distance from the CO; the line from home to CO is dedicated. FTTH: potentially gigabits per second; with PON the fiber between the splitter and the OLT is shared by the (fewer than 100) homes on that splitter (direct fiber would be dedicated).',
    keys: ['HFC|cable', 'shared', 'DSL', 'dedicated', 'FTTH|fiber', 'Gbps|gigabit'],
    why: 'Key pattern: DSL = dedicated (your own twisted pair to the DSLAM), cable = shared (broadcast coax/fiber), FTTH PON = shared downstream (packets replicated at the splitter). Rates to know: DSL 24/52 down, 3.5/16 up; DOCSIS 2.0 40/30 Mbps; DOCSIS 3.0 1.2 Gbps/100 Mbps; FTTH in the Gbps range.' },

  { id: 'edge-32', d: 3, type: 'order', src: 'text',
    q: 'Order the components of an FTTH passive optical network (PON) from the home to the Internet.',
    items: ['Home (wireless) router', 'ONT (optical network terminator)', 'Optical splitter', 'OLT (optical line terminator) in the central office', 'Telco router to the Internet'],
    why: 'Home router → ONT in the home → dedicated fiber to the neighborhood splitter → one shared fiber (fewer than 100 homes) → OLT in the CO, which converts optical ↔ electrical → telco router → Internet. Memory hook: ONT is at the home end; OLT is at the line (telco) end.' },

  { id: 'edge-33', d: 3, type: 'multi', src: 'text',
    q: 'Which statements about fiber to the home are true? Select all that apply.',
    choices: [
      'In a PON, packets sent from the OLT toward the homes are replicated at the splitter',
      'An AON (active optical network) is essentially switched Ethernet',
      'A splitter typically combines fewer than 100 homes onto one shared fiber',
      'The OLT is located in each home and converts optical to electrical signals',
      'Direct fiber runs one fiber from the central office to each home',
      'A PON splitter actively switches each downstream packet only to its destination home'
    ],
    a: [0, 1, 2, 4],
    why: 'The OLT is in the central office (the ONT is in the home), so the “OLT in each home” statement is false. A PON splitter is passive: it replicates downstream packets to all homes (like a cable head end) rather than switching them, so the “actively switches” statement is false. Direct fiber is the simplest (one fiber per home), but sharing a fiber among many homes is more common.' },

  { id: 'edge-34', d: 2, type: 'mc', src: 'text',
    q: 'What does 5G fixed wireless offer for residential access?',
    choices: [
      'It reuses the home’s existing telephone twisted pair',
      'Using beam-forming from a provider’s base station to a modem in the home, it offers high-speed access without laying costly, failure-prone cable from the CO to the home',
      'A dedicated fiber to each home',
      'Coverage only within a few tens of meters, like WiFi'
    ],
    a: 1,
    why: 'With 5G fixed wireless, data goes wirelessly from the provider’s base station to a home modem (a WiFi router attaches to it, like with a cable or DSL modem). The selling point is avoiding expensive, failure-prone cabling from the telco CO to each home.' },

  { id: 'edge-35', d: 3, type: 'multi', src: 'text',
    q: 'In which of these situations do users share transmission capacity with other homes or users? Select all that apply.',
    choices: [
      'The cable HFC downstream channel',
      'The cable HFC upstream channel',
      'A DSL line between one home and the central office',
      'The PON fiber between the splitter and the OLT',
      'A WiFi (802.11) access point’s channel'
    ],
    a: [0, 1, 3, 4],
    why: 'Cable is shared in both directions (broadcast downstream, shared upstream channel). PON replicates downstream packets at the splitter, so the fiber to the OLT is shared. WiFi provides a “shared transmission rate” and wireless media are usually shared. A DSL line is the home’s own twisted pair to the DSLAM — dedicated (though many lines terminate at one DSLAM).' },

  { id: 'edge-36', d: 1, type: 'mc', src: 'ch1-R7',
    q: 'What transmission rates do Ethernet LAN users typically have to their Ethernet switch, according to the textbook?',
    choices: ['Up to 56 kbps', '24 to 52 Mbps', '100 Mbps to tens of Gbps (servers often 1–10 Gbps)', '4 kHz per user'],
    a: 2,
    why: 'Ethernet users typically have 100 Mbps to tens of Gbps access to the switch; servers may have 1 Gbps to 10 Gbps. 56 kbps is dial-up, 24–52 Mbps is DSL downstream, and 4 kHz is a bandwidth in Hz (a phone channel), not a bit rate.' },

  { id: 'edge-37', d: 1, type: 'multi', src: 'ch1-R8',
    q: 'Which physical media can Ethernet run over, based on the textbook? Select all that apply.',
    choices: ['Twisted-pair copper wire', 'Optical fiber', 'The 0–4 kHz voice band of a DSL line', 'Terrestrial radio in the 802.11 sense'],
    a: [0, 1],
    why: 'Ethernet users connect over twisted-pair copper to an Ethernet switch (the most common case), and Ethernet also runs over fiber — e.g., an AON FTTH network is “essentially switched Ethernet” over optical fiber. The DSL voice band is a telephone channel, and 802.11 radio is WiFi, a different link technology.' },

  { id: 'edge-38', d: 2, type: 'short', src: 'ch1-R10',
    q: 'Describe the most popular wireless Internet access technologies today. Compare and contrast them.',
    a: 'WiFi (IEEE 802.11 wireless LAN): users within a few tens of meters of an access point attached to a (wired) enterprise or home network; a shared rate of more than 100 Mbps; found in homes, campuses, cafés, airports. Wide-area cellular (3G, 4G LTE, 5G): devices talk to a base station run by the cellular provider and can be tens of kilometers away; 4G gives real-world downloads up to about 60 Mbps, 5G more. WiFi = short range, high shared rate, local; cellular = wide-area coverage and mobility, operated by a cellular provider.',
    keys: ['WiFi|802.11|wireless LAN', 'access point|tens of meters', '4G|5G|LTE|cellular', 'base station|kilometers', 'Mbps|rate'],
    why: 'The contrasts examiners look for: range (tens of meters vs tens of kilometers), what you attach to (access point vs provider base station), and rate (WiFi > 100 Mbps shared; 4G ~60 Mbps; 5G higher). Both are shared wireless media.' },

  { id: 'edge-39', d: 2, type: 'num', src: 'text',
    q: '4G offers real-world download speeds of up to 60 Mbps. At that rate, how long does downloading a 300 MB (300 × 10^{6} bytes) video take? Answer in seconds.',
    a: 40, unit: 's',
    why: '300 × 10^{6} bytes × 8 = 2.4 × 10^{9} bits.\nT = 2.4 × 10^{9} / 60 × 10^{6} = 40 s.\nForgetting × 8 gives 5 s.' },

  // ---------- Physical media ----------
  { id: 'edge-40', d: 1, type: 'mc', src: 'cheat',
    q: 'What is a physical link?',
    choices: ['The medium connecting a transmitter and a receiver', 'The logical connection between two processes', 'An entry in a router’s forwarding table', 'The contract between a customer ISP and its provider'],
    a: 0,
    why: 'A physical link is the medium between a transmitter–receiver pair. A bit crossing the Internet is retransmitted over many such links, and the medium can differ on each one (twisted pair, fiber, radio, …).' },

  { id: 'edge-41', d: 1, type: 'mc', src: 'cheat',
    q: 'Which classification of physical media is correct?',
    choices: [
      'Guided: terrestrial radio, satellite. Unguided: fiber, coaxial cable',
      'Guided: fiber only. Unguided: all copper media',
      'Guided: WiFi. Unguided: Ethernet',
      'Guided: fiber, twisted pair, coaxial cable. Unguided: terrestrial radio, satellite'
    ],
    a: 3,
    why: 'Guided media carry signals along a solid medium (copper, fibre, coax). Unguided media carry them freely through the atmosphere or space (radio waves: wireless LAN, cellular, satellite).' },

  { id: 'edge-42', d: 2, type: 'mc', src: 'text',
    q: 'Why do builders often install twisted pair, fiber and coax in every room even if only one medium is needed now?',
    choices: [
      'The cable material is the most expensive part of a network',
      'Installation labor can cost orders of magnitude more than the material, so installing all media once avoids paying for labor again later',
      'Building codes require three different media',
      'Each medium can carry only one protocol'
    ],
    a: 1,
    why: 'The textbook notes the actual cost of the physical link is often minor compared with the labor of installing it. Since another medium may be needed in the future, laying all of them at once saves money.' },

  { id: 'edge-43', d: 2, type: 'multi', src: 'text',
    q: 'Which statements about twisted-pair copper wire are true? Select all that apply.',
    choices: [
      'It is the least expensive and most commonly used guided transmission medium',
      'The wires are twisted to reduce electrical interference from nearby pairs',
      'Category 6a cable can reach 10 Gbps for distances up to about 100 m',
      'Fiber has completely replaced twisted pair for high-speed LANs',
      'Dial-up modems over twisted pair reach up to 56 kbps'
    ],
    a: [0, 1, 2, 4],
    why: 'Twisted pair is cheapest and most common (over 99% of handset-to-switch phone wiring). Twisting cuts interference between pairs. Cat 6a: 10 Gbps up to 100 m — twisted pair became the dominant high-speed LAN medium, despite predictions that fiber would replace it. UTP LAN rates range 10 Mbps–10 Gbps; dial-up reached 56 kbps.' },

  { id: 'edge-44', d: 2, type: 'mc', src: 'text',
    q: 'What distinguishes coaxial cable from twisted pair?',
    choices: [
      'Coax carries pulses of light',
      'Coax has two concentric (not parallel) copper conductors with special insulation and shielding, and can serve as a guided shared medium',
      'Coax is an unguided medium',
      'Coax is a single insulated copper wire twisted into a spiral'
    ],
    a: 1,
    why: 'Both use two copper conductors, but in coax they are concentric. Coax supports high rates (hundreds of Mbps for cable Internet), and many end systems can attach directly to one cable, each receiving what the others send — a guided shared medium. Light pulses = fiber.' },

  { id: 'edge-45', d: 2, type: 'multi', src: 'cheat',
    q: 'Which statements about optical fibre are true? Select all that apply.',
    choices: [
      'It is glass fibre carrying pulses of light, each pulse representing a bit',
      'It is a shared, half-duplex medium affected by reflection and obstructions',
      'A single fibre supports high-speed point-to-point rates of tens to hundreds of Gbps',
      'It has a low error rate because repeaters can be spaced far apart and it is immune to electromagnetic noise',
      'It dominates short LAN runs because optical transmitters and receivers are cheap'
    ],
    a: [0, 2, 3],
    why: 'Lecture: fibre = glass carrying light pulses (one pulse per bit), tens to hundreds of Gbps point-to-point, and a low error rate “because repeaters can be spaced far apart and it is immune to electromagnetic noise.” Textbook adds: very low attenuation up to 100 km and very hard to tap, so it is the preferred long-haul medium. Shared/half-duplex with reflections describes wireless media, and the high cost of optical devices is exactly what has kept fibre out of most short-haul LAN and home links (twisted pair dominates LANs).' },

  { id: 'edge-46', d: 2, type: 'num', src: 'text',
    q: 'Optical Carrier links run at OC-n = n × 51.8 Mbps. What is the rate of an OC-48 link? Answer in Gbps.',
    a: 2.4864, unit: 'Gbps',
    why: 'OC-48 = 48 × 51.8 Mbps = 2,486.4 Mbps = 2.4864 Gbps (≈ 2.5 Gbps). The OC range runs from OC-1 = 51.8 Mbps up to OC-768 ≈ 39.8 Gbps.' },

  { id: 'edge-47', d: 2, type: 'multi', src: 'cheat',
    q: 'Which properties of wireless media are emphasized in lecture? Select all that apply.',
    choices: [
      'Usually a shared medium',
      'Usually half-duplex',
      'Affected by reflection and physical obstructions',
      'Affected by interference and noise',
      'Immune to electromagnetic interference',
      'Signals are guided along a solid medium'
    ],
    a: [0, 1, 2, 3],
    why: 'Wireless media transmit electromagnetic waves without wires; they are usually shared and half-duplex and suffer reflection, obstructions, interference and noise. Immunity to EM interference describes fibre, and “guided along a solid medium” is the definition of guided media.' },

  { id: 'edge-48', d: 2, type: 'multi', src: 'text',
    q: 'Which statements about terrestrial radio channels are true? Select all that apply.',
    choices: [
      'Shadow fading: signal strength drops around or through obstructing objects',
      'Multipath fading is caused by signal reflections off interfering objects',
      'Wireless LANs use local-area radio channels (ten to a few hundred meters)',
      'Cellular access uses wide-area radio channels (tens of kilometers)',
      'Radio signals cannot penetrate walls',
      'Radio channels are unaffected by other transmissions'
    ],
    a: [0, 1, 2, 3],
    why: 'Impairments: path loss and shadow fading (distance, obstructions), multipath fading (reflections), interference (other transmissions/EM signals). Classes: very short (1–2 m: headsets, keyboards), local (WiFi), wide area (cellular). A listed advantage of radio is that it can penetrate walls.' },

  { id: 'edge-49', d: 1, type: 'mc', src: 'text',
    q: 'Geostationary satellites orbit at roughly what altitude, and what ground-to-ground propagation delay do they introduce?',
    choices: ['About 36,000 km; about 280 ms', 'About 500 km; about 3 ms', 'About 36,000 km; about 2.8 ms', 'About 3,600 km; about 28 s'],
    a: 0,
    why: 'GEO satellites sit 36,000 km above the surface to stay over one spot; ground station → satellite → ground station adds about 280 ms of propagation delay. Their links run at hundreds of Mbps and serve areas without DSL or cable.' },

  { id: 'edge-50', d: 3, type: 'num', src: 'text',
    q: 'A GEO satellite is 36,000 km above Earth. Assume both ground stations are directly beneath it (the shortest possible path) and the signal travels at 3 × 10^{8} m/s. What is the ground → satellite → ground propagation delay? Answer in ms.',
    a: 240, unit: 'ms',
    why: 'The signal goes up and back down: 2 × 36,000 km = 72,000 km = 7.2 × 10^{7} m.\nd_{prop} = 7.2 × 10^{7} / 3 × 10^{8} = 0.24 s = 240 ms.\nTraps: using one leg only (120 ms) or forgetting km → m. Real ground stations are not directly beneath the satellite, so slant paths are longer — that is why the textbook quotes about 280 ms.' },

  { id: 'edge-51', d: 2, type: 'tf', src: 'text',
    q: 'True or false: a LEO (low-earth orbit) satellite stays above one spot on Earth, so a single LEO satellite can cover a region continuously.',
    a: false,
    why: 'False. LEO satellites are much closer to Earth and rotate around it, so they do not stay over one spot; providing continuous coverage of an area requires many satellites. Staying over one spot is the property of geostationary satellites (at 36,000 km).' },

  // ---------- Network of networks ----------
  { id: 'edge-52', d: 1, type: 'mc', src: 'text',
    q: 'Why don’t access ISPs simply connect directly to every other access ISP?',
    choices: [
      'It would violate the IP protocol',
      'Access ISPs cannot run routers',
      'A full mesh would be far too costly: each access ISP would need a separate link to each of hundreds of thousands of others',
      'Tier-1 ISPs legally forbid it'
    ],
    a: 2,
    why: 'The naive full-mesh design is “much too costly” — hence the hierarchy of transit providers, plus peering and IXPs, that make up today’s network of networks.' },

  { id: 'edge-53', d: 1, type: 'mc', src: 'text',
    q: 'In a customer–provider relationship between ISPs, who pays whom?',
    choices: [
      'The provider pays the customer for the traffic it carries',
      'Neither pays (settlement-free)',
      'Both pay a tier-1 ISP',
      'The customer ISP pays the provider ISP, roughly reflecting the traffic exchanged'
    ],
    a: 3,
    why: 'Customer pays provider: access ISP → regional ISP → tier-1, with the amount reflecting the traffic exchanged. Settlement-free (nobody pays) describes peering between ISPs at the same level.' },

  { id: 'edge-54', d: 3, type: 'order', src: 'text',
    q: 'Order the textbook’s network structures from Structure 1 to Structure 5 (today’s Internet).',
    items: [
      'A single global transit ISP connects all access ISPs',
      'Multiple competing global transit ISPs (two-tier hierarchy)',
      'Multi-tier hierarchy: access ISPs → regional ISPs → tier-1 ISPs',
      'The hierarchy plus PoPs, multi-homing, peering and IXPs',
      'All of the above plus content-provider networks (e.g., Google)'
    ],
    why: 'Each structure fixes a problem of the previous one: one global ISP (1) invites competitors (2); no ISP is in every city, so regional ISPs appear under tier-1s (3); real ISPs add PoPs, multi-homing, peering and IXPs to cut cost and add resilience (4); finally content providers build their own networks (5).' },

  { id: 'edge-55', d: 2, type: 'multi', src: 'text',
    q: 'Which statements about tier-1 ISPs are true? Select all that apply.',
    choices: [
      'There are roughly a dozen of them (e.g., Level 3, AT&T, Sprint, NTT)',
      'They do not pay any provider for transit',
      'They peer with one another, settlement-free',
      'An official body certifies tier-1 status',
      'They have a presence in every city in the world'
    ],
    a: [0, 1, 2],
    why: 'Tier-1s sit at the top, so they have no provider to pay, and they interconnect by settlement-free peering. Nobody officially sanctions tier-1 status (“if you have to ask…”), and unlike the imaginary global transit ISP they do not have a presence in every city.' },

  { id: 'edge-56', d: 2, type: 'mc', src: 'text',
    q: 'What is a PoP, and at which levels of the ISP hierarchy does it exist?',
    choices: [
      'A meeting point where many ISPs peer; only at the tier-1 level',
      'A home router; only at the access level',
      'A group of one or more routers at one location in a provider’s network where customer ISPs connect; at all levels except the bottom (access ISP) level',
      'A content-provider data center; only inside IXPs'
    ],
    a: 2,
    why: 'A point of presence is where customers plug into a provider: one or more routers in one location. Customers can lease a high-speed link from a third-party telecom provider to reach it. Access ISPs (the bottom) have no customer ISPs, so they have no PoPs. The many-ISP meeting point is an IXP.' },

  { id: 'edge-57', d: 2, type: 'short', src: 'text',
    q: 'What is multi-homing? Which ISPs can do it, and why would an ISP bother?',
    a: 'Multi-homing means an ISP connects to two or more provider ISPs (e.g., an access ISP to two regional ISPs, possibly plus a tier-1; a regional ISP to several tier-1s). Any ISP except a tier-1 can multi-home (a tier-1 has no providers). The benefit is resilience: the ISP can keep sending and receiving packets into the Internet even if one of its providers fails.',
    keys: ['two or more|multiple|several', 'provider', 'except tier-1|not tier-1|tier-1 cannot', 'fail|failure|outage|redundan'],
    why: 'Multi-homing is one of the four additions in Network Structure 4 (PoPs, multi-homing, peering, IXPs). Don’t confuse it with peering: multi-homing means several providers (paid), while peering means a same-level neighbour (usually free).' },

  { id: 'edge-58', d: 2, type: 'short', src: 'ch1-R14',
    q: 'Why will two ISPs at the same level of the hierarchy often peer with each other?',
    a: 'To reduce costs. Customer ISPs pay their providers according to the traffic exchanged, so if two nearby same-level ISPs send each other a lot of traffic, connecting directly lets that traffic bypass the upstream providers they would otherwise pay. Peering is typically settlement-free — neither ISP pays the other.',
    keys: ['reduce cost|save money|cheaper|avoid paying', 'provider|upstream', 'directly|direct connection|bypass', 'settlement-free|neither pays|free'],
    why: 'Without peering, traffic from ISP X to its neighbour Y would climb to a common provider and back down, and both would pay transit for it. A direct (or IXP) peering link carries it for free and often by a shorter path.' },

  { id: 'edge-59', d: 2, type: 'short', src: 'ch1-R14',
    q: 'How does an IXP earn money?',
    a: 'An IXP is built and run by a third-party company as a meeting point (a building with its own switches) where many ISPs peer. It earns money by charging each ISP that connects to it a (relatively small) fee, which may depend on the amount of traffic the ISP sends to or receives from the IXP.',
    keys: ['charge|fee', 'each ISP|ISPs that connect|connecting ISPs', 'traffic|amount'],
    why: 'The ISPs peering across the IXP do not pay each other (settlement-free), but they do pay the IXP operator for the facility and switch ports. More than 600 IXPs exist.' },

  { id: 'edge-60', d: 3, type: 'short', src: 'ch1-R15',
    q: 'Some content providers have created their own networks. Describe Google’s network. What motivates content providers to create these networks?',
    a: 'Google operates a private TCP/IP network that interconnects all of its data centers (19 major ones plus smaller ones of a few hundred servers, often located inside IXPs). It spans the globe but is separate from the public Internet and carries only traffic to/from Google servers. It tries to bypass the upper tiers of the Internet by peering settlement-free with lower-tier ISPs, either directly or at IXPs; because some access ISPs can only be reached through tier-1 networks, it also connects to and pays tier-1 ISPs. Motivation: reduce payments to upper-tier ISPs and gain greater control over how its services are ultimately delivered to end users.',
    keys: ['private network|own network|private TCP/IP', 'data centers', 'peer|peering|bypass', 'lower-tier|IXP', 'reduce payments|lower cost|save money|pay less', 'control'],
    why: 'This is Network Structure 5. Two motives to memorise: money (less transit paid to upper tiers) and control (service delivery/performance). And the nuance examiners like: Google still connects to and pays tier-1 ISPs.' },

  { id: 'edge-61', d: 2, type: 'tf', src: 'text',
    q: 'True or false: Google’s private network carries only traffic to and from Google servers, yet Google still connects to tier-1 ISPs and pays them for the traffic it exchanges with them.',
    a: true,
    why: 'True — both halves are in the textbook. The private network is separate from the public Internet and carries no transit traffic for others. Google peers settlement-free with lower-tier ISPs (directly or at IXPs) to bypass the upper tiers, but because many access ISPs can only be reached through tier-1 networks, it also connects to tier-1s and pays them. The payoff is lower transit bills overall plus control over service delivery.' },

  { id: 'edge-62', d: 3, type: 'multi', src: 'text',
    ctx: 'Access ISP A connects to regional ISP R1 and also directly to tier-1 ISP T1. Regional ISPs R1 and R2 are in the same region and connect to each other at an IXP. R1 is a customer of T1, R2 is a customer of tier-1 T2, and T1 and T2 interconnect.',
    q: 'Which payments occur? Select all that apply.',
    choices: [
      'A pays R1',
      'A pays T1',
      'R1 pays R2 for the traffic exchanged over their IXP connection',
      'R1 pays T1',
      'T1 pays T2 for traffic between them',
      'R1 and R2 may each pay the IXP operator a fee'
    ],
    a: [0, 1, 3, 5],
    why: 'A is multi-homed: it is a customer of both R1 and T1, so it pays both. R1 is T1’s customer, so it pays T1. R1–R2 at the IXP is same-level peering, typically settlement-free, so neither pays the other — but both pay the IXP operator its connection fee. Tier-1s peer with each other settlement-free, so T1 does not pay T2.' },

  { id: 'edge-63', d: 3, type: 'mc', src: 'text',
    q: 'Which statement about the ISP ecosystem is FALSE?',
    choices: [
      'An access ISP may connect directly to a tier-1 ISP, in which case it pays the tier-1',
      'PoPs exist at every level of the hierarchy, including access ISPs',
      'Any ISP except a tier-1 may multi-home',
      'The Internet’s structure evolved mainly because of economics and national policy rather than performance'
    ],
    a: 1,
    why: 'PoPs exist in all levels except the bottom (access ISP) level — access ISPs have no customer ISPs to connect. The other three are straight from the textbook: access ISPs can buy directly from tier-1s, tier-1s cannot multi-home (no providers), and the evolution is “driven by economics and national policy.”' },

  { id: 'edge-64', d: 3, type: 'multi', src: 'text',
    q: 'A DSL subscriber measures a downstream rate well below the 52 Mbps the standard allows. Which factors from the textbook could explain this? Select all that apply.',
    choices: [
      'The provider deliberately limits the rate because the customer bought a cheaper tier',
      'A long distance between the home and the central office',
      'The gauge (thickness) of the twisted-pair line',
      'Electrical interference on the line',
      'Neighbors on the same DSLAM are downloading at the same time, splitting a shared line'
    ],
    a: [0, 1, 2, 3],
    why: 'Textbook: achieved DSL rates can be lower because of tiered service (deliberate caps), distance to the CO, wire gauge and electrical interference; beyond about 5–10 miles DSL is not offered at all. The line itself is dedicated to the home, so neighbours’ downloads do not split it (that sharing effect is the cable/HFC story).' }
]);
