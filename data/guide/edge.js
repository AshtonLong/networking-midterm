NET.addSection({
  id: 'edge',
  unit: 1,
  order: 5,
  title: 'The Internet: edge, access, core & ISPs',
  short: 'Edge, core & ISPs',
  cheat: 'p.48–56, 64–67',
  text: '§1.1.1–1.1.2, §1.2, §1.3.3',
  minutes: 40,
  summary: 'What the Internet is made of (hosts, links, packet switches, ISPs, protocols, standards) and what it offers applications (a socket “hook”). Then its three regions — edge, access network, core — every home, enterprise and mobile access technology with its devices, rates and shared-vs-dedicated behaviour, the physical media, and how ISPs interconnect into a network of networks. Expect definition, classification and “shared or dedicated?” questions, plus easy L/R arithmetic.',
  mustKnow: [
    'Host = end system: an Internet-connected device at the [[edge]] that [[runs applications]] (a Web server is a host).',
    'Packet switches forward packets: [[routers]] connect multiple networks (network core); [[link-layer switches]] connect devices within a LAN (access networks).',
    'Access network = the network linking an end system to its [[edge router]] (the first router on the path to any distant end system). Three types: [[residential, institutional, mobile]].',
    'Network core = the [[mesh of packet switches and links]] (routers) interconnecting end systems — a network of networks.',
    'Host sending function: split the message into L-bit packets, send at rate R → transmission delay [[L/R]] seconds (L in bits, R in bits/s).',
    'DSL: telco twisted pair → [[DSLAM]] in the central office; FDM bands 0–4 kHz phone, 4–50 kHz upstream, 50 kHz–1 MHz downstream; [[dedicated]] line, asymmetric.',
    'Cable (HFC): fiber to neighborhood nodes + coax to homes, [[CMTS]] at the head end; a [[shared broadcast]] medium — no collisions downstream (one sender), multiple-access protocol upstream.',
    'FTTH (PON): ONT at home → [[optical splitter]] (shared fiber, fewer than 100 homes) → [[OLT]] in the central office; downstream packets replicated at the splitter.',
    'Guided media (twisted pair, coax, fiber) vs [[unguided]] (terrestrial radio, satellite). Fiber: light pulses, tens–hundreds of Gbps, immune to EM noise. GEO satellite: 36,000 km up, about [[280 ms]] propagation.',
    'Network of networks: access ISPs → regional ISPs → [[tier-1 ISPs]] (customer pays provider), plus PoPs, multi-homing, [[settlement-free peering]], IXPs and content-provider networks (Google).',
    'Standards: the [[IETF]] writes [[RFCs]] (TCP, IP, HTTP, SMTP); the IEEE 802 committee specifies Ethernet and WiFi.'
  ],
  topics: [
    {
      title: 'Nuts-and-bolts view: what the Internet is made of',
      src: 'both',
      blocks: [
        { p: 'The Internet is a computer network that interconnects billions of computing devices. There are two ways to describe it: the **nuts-and-bolts** view (its hardware and software pieces) and the **services** view (an infrastructure that provides services to distributed applications).' },
        { def: 'End systems (hosts)', text: 'Internet-connected devices located at the Internet’s [[edge]] that [[run applications]]: desktops, laptops, smartphones, tablets, servers, and “things” such as TVs, game consoles, thermostats, cars and traffic lights. Host = end system; the terms are interchangeable.' },
        { def: 'Communication links', text: 'Connect end systems and packet switches. Made of physical media: [[optical fibre]], copper cables (twisted pair as used by Ethernet, coaxial cable), [[wireless radio]] signals (Wi-Fi, cellular) and satellite connections. A link’s transmission rate is its **bandwidth**, measured in [[bits per second]].' },
        { def: 'Packets', text: 'The sending end system [[segments the data and adds header bytes]] to each segment; the resulting packages are packets. They travel through the network and are reassembled into the original data at the destination.' },
        { def: 'Packet switch', text: 'Takes a packet arriving on one of its incoming links and forwards it on one of its outgoing links. Two prominent types: [[routers]] (typically in the network core) and [[link-layer switches]] (typically in access networks). Both forward packets toward their ultimate destination.' },
        { table: { head: ['', 'Link-layer switch', 'Router'], rows: [
          ['Connects', 'Devices [[within one LAN]]', '[[Multiple networks]] together'],
          ['Typically found in', 'Access networks', 'The network core'],
          ['Common job', 'Forwards packets toward the destination', 'Forwards packets toward the destination']
        ] }, caption: 'Lecture wording: “A switch connects devices within a LAN, while a router connects multiple networks together.”' },
        { def: 'Route (path)', text: 'The sequence of communication links and packet switches a packet traverses from the sending end system to the receiving end system.' },
        { p: 'Transportation analogy: packets = [[trucks]], communication links = highways and roads, packet switches = [[intersections]], end systems = buildings. A factory splits its cargo across a fleet of trucks; each truck travels independently through the road network, and the cargo is regrouped at the warehouse.' },
        { def: 'Network', text: 'A group of [[interconnected devices]], [[communication links]] (fibre, wireless, …), and [[routers and other networking hardware]].' },
        { def: 'The Internet', text: 'A global system of interconnected networks that connects independent networks and devices worldwide, built through interconnected [[Internet Service Providers (ISPs)]].' },
        { p: 'End systems reach the Internet through ISPs: residential ISPs (cable or telephone companies), corporate ISPs, university ISPs, public WiFi in airports, hotels and cafés, and cellular data ISPs. Each ISP is itself a [[network of packet switches and communication links]]. ISPs also connect content providers’ servers directly to the Internet. Lower-tier ISPs interconnect through national and international upper-tier ISPs (high-speed routers joined by fiber). Every ISP is managed independently but runs the [[IP protocol]] and follows naming and address conventions.' },
        { def: 'Protocols', text: 'Control the sending and receiving of information. [[TCP]] (Transmission Control Protocol) and [[IP]] (Internet Protocol) are the most important; IP specifies the [[format of the packets]] sent and received among routers and end systems. The Internet’s principal protocols are collectively called TCP/IP.' },
        { p: 'Standards ensure [[interoperability]]: everyone must agree on what each protocol does so independently built systems work together. Internet standards are developed by the [[IETF]] (Internet Engineering Task Force); its standards documents are [[RFCs]] (requests for comments — nearly 9000 of them) and define protocols such as TCP, IP, HTTP and SMTP. Other bodies standardize network links: the [[IEEE 802]] LAN Standards Committee specifies Ethernet and WiFi. Examples of networking standards and technologies that provide wired and wireless connectivity: [[Ethernet, Wi-Fi and 4G/5G]].' },
        { trap: 'RFCs are not informal suggestions — despite the name, they are the IETF’s detailed standards documents. And the IETF does not standardize Ethernet or WiFi; the IEEE 802 committee does.' }
      ]
    },
    {
      title: 'Services view: the Internet as a platform for applications',
      src: 'both',
      blocks: [
        { p: 'The Internet is also an infrastructure that provides services to [[distributed applications]] — applications involving multiple end systems that exchange data: the Web, e-mail, messaging, maps with real-time traffic, music and video streaming, social media, video conferencing, multi-player games, location-based recommendations.' },
        { p: 'Internet applications run on [[end systems]], **not** in the packet switches of the network core. Packet switches help move the data but are not concerned with the application that is the source or sink of that data.' },
        { def: 'Socket interface (the API “hooks”)', text: 'The [[programming interface]] the Internet offers to distributed applications: a set of rules a sending program must follow so the Internet can deliver its data to a specific destination program on another end system. It lets sending and receiving apps connect to and use Internet [[transport services]].' },
        { p: 'Postal analogy: Alice can’t drop a letter out of her window; the postal service requires an envelope, Bob’s name, address and zip code, a stamp and an official mailbox — the [[postal service interface]]. The socket interface is the Internet’s equivalent. Just as the post office offers express delivery, confirmation and ordinary mail, the Internet offers [[multiple services]], and an application chooses one (TCP or UDP, Chapter 2).' }
      ]
    },
    {
      title: 'The network edge: hosts, clients, servers and data centers',
      src: 'both',
      blocks: [
        { def: 'Network edge', text: 'The [[end systems (hosts)]] of the Internet, which include clients and servers. Hosts are called hosts because they [[host (run) application programs]] such as a Web browser, a Web server, an e-mail client or an e-mail server.' },
        { list: [
          '**Clients** (informally): desktops, laptops, smartphones — the devices people use.',
          '**Servers**: more powerful machines that store and distribute Web pages, stream video, relay e-mail. Most servers we get search results, e-mail, Web pages and video from are located in large [[data centers]] (Google, as of 2020: 19 data centers on four continents holding several million servers).'
        ] },
        { p: 'Data centers (Google, Microsoft, Amazon, Alibaba) house tens to hundreds of thousands of hosts and contain their own internal networks. Three purposes, using Amazon as the example: (1) [[serve e-commerce pages]] to users; (2) act as [[massively parallel computing]] infrastructure for the company’s own data processing; (3) provide [[cloud computing]] to other companies (Airbnb runs its whole service on Amazon Web Services).' },
        { p: 'Data-center hosts are called [[blades]]: commodity “pizza box” hosts with CPU, memory and disk, stacked in racks of typically [[20 to 40]] blades; racks are interconnected by data-center network designs (Chapter 6).' }
      ]
    },
    {
      title: 'Access networks, the edge router, and the network core',
      src: 'both',
      blocks: [
        { def: 'Access network', text: 'The network that physically links an end system to the [[first router (edge router)]] on the path from the end system to any other distant end system. Access networks use wired or wireless links.' },
        { def: 'Edge router', text: 'The [[first router]] on the path from an end system toward another distant end system.' },
        { def: 'Network core', text: 'The interconnected [[mesh of packet switches and links]] that connects the Internet’s end systems; it consists of interconnected routers and is a [[network of networks]].' },
        { p: 'Three types of access networks connect end systems to the edge router: [[residential]] access networks (homes: DSL, cable, FTTH, 5G fixed wireless), [[institutional]] access networks (schools, companies: Ethernet, WiFi), and [[mobile]] access networks (Wi-Fi, 4G/5G).' },
        { table: { head: ['Region', 'What it is', 'Examples'], rows: [
          ['Network edge', 'The end systems (hosts)', 'Laptop, phone, thermostat, Web server in a data center'],
          ['Access network', 'Links an end system to its edge router', 'DSL line, cable HFC, FTTH, campus Ethernet, WiFi, 4G/5G'],
          ['Network core', 'Mesh of packet switches (routers) and links', 'Routers and fiber of regional and tier-1 ISPs']
        ] }, caption: 'Edge vs access vs core — the lecture’s DISTINGUISH bullet.' },
        { trap: 'The edge is the **hosts themselves**, not the cable to them. The access network is the link(s) between a host and its edge router; the core starts beyond the edge router.' }
      ]
    },
    {
      title: 'Home access 1: DSL',
      src: 'text',
      blocks: [
        { p: 'DSL (digital subscriber line): the home gets Internet access from the same [[local telephone company (telco)]] that provides its wired phone service, so the telco is also the ISP. The home’s DSL modem turns digital data into high-frequency tones and sends them over the existing [[twisted-pair telephone line]] to the telco’s [[central office (CO)]], where a [[DSLAM]] (digital subscriber line access multiplexer) translates the analog signals from many homes back into digital format.' },
        { table: { head: ['Frequency band', 'Carries'], rows: [
          ['0 – 4 kHz', 'Ordinary two-way [[telephone]] channel'],
          ['4 – 50 kHz', 'Medium-speed [[upstream]] data channel'],
          ['50 kHz – 1 MHz', 'High-speed [[downstream]] data channel']
        ] }, caption: 'One line, three bands: frequency-division multiplexing (FDM) makes a single DSL link look like three separate links, so a phone call and an Internet connection share it at the same time.' },
        { list: [
          'Home side: a [[splitter]] separates the data and telephone signals and forwards the data signal to the DSL modem.',
          'CO side: the DSLAM separates data and phone signals and sends the data into the Internet. Hundreds or even thousands of households connect to one DSLAM.',
          'Rates (standards): downstream [[24 Mbps and 52 Mbps]], upstream [[3.5 Mbps and 16 Mbps]]; the newest standard allows 1 Gbps aggregate (up + down). Different up/down rates make the access [[asymmetric]].',
          'Achieved rates can be lower: the provider may cap the rate (tiered pricing), and the rate falls with distance from the CO, the wire gauge, and electrical interference. DSL is designed for short distances — beyond roughly [[5 to 10 miles]] from the CO the home needs another access technology.',
          'Each home’s line to the CO is its own: the DSL transmission rate is [[dedicated]], not shared with neighbors.'
        ] },
        { trap: 'Upstream sits **below** downstream in frequency (4–50 kHz vs 50 kHz–1 MHz) and is the slower channel. And because the bands are separate (FDM), a phone call does not eat into the data channels.' }
      ]
    },
    {
      title: 'Home access 2: cable (hybrid fiber coax)',
      src: 'text',
      blocks: [
        { p: 'Cable Internet access reuses the cable-TV company’s infrastructure. [[Fiber optics]] connect the cable head end to neighborhood-level junctions (fiber nodes); traditional [[coaxial cable]] then reaches individual houses and apartments. Each neighborhood junction typically supports [[500 to 5,000]] homes. Because both fiber and coax are used, the system is called [[hybrid fiber coax (HFC)]].' },
        { list: [
          'Home side: a [[cable modem]], typically an external device connected to the home PC through an Ethernet port.',
          'Head-end side: the [[CMTS]] (cable modem termination system) plays the role of DSL’s DSLAM — it turns the analog signals sent by cable modems in many homes back into digital format.',
          'The HFC network is divided into a downstream and an upstream channel; access is typically [[asymmetric]] (downstream faster).',
          'DOCSIS 2.0: [[40 Mbps]] downstream / 30 Mbps upstream. DOCSIS 3.0: [[1.2 Gbps]] downstream / 100 Mbps upstream. Actual rates may be lower (contracted rates, media impairments).'
        ] },
        { p: 'Key property: cable is a [[shared broadcast medium]]. Every packet sent by the head end travels downstream on every link to every home, and every packet sent by a home travels on the shared upstream channel to the head end. So if several users download video simultaneously, each receives at a rate [[well below the aggregate]] downstream rate; but if only a few users are Web surfing, they rarely request at exactly the same moment, so each may get the full downstream rate.' },
        { p: 'Collisions: downstream there is only one sender (the head end), so [[no collisions]] can occur. The upstream channel is shared by many homes’ modems, so a distributed [[multiple access protocol]] is needed to coordinate transmissions and avoid collisions (Chapter 6).' },
        { example: { q: 'A DOCSIS 3.0 neighborhood (1.2 Gbps downstream) has 40 homes all downloading large files at once, sharing equally. What rate does each get? What if only one home is downloading?', a: 'Shared equally: 1.2 Gbps ÷ 40 = 1,200 Mbps ÷ 40 = 30 Mbps each.\nOne active home: it can get (up to) the full 1.2 Gbps, minus contract caps or impairments — the channel is shared on demand, not cut into fixed slices.' } }
      ]
    },
    {
      title: 'Home access 3: fiber to the home and 5G fixed wireless',
      src: 'text',
      blocks: [
        { p: 'Fiber to the home (FTTH) provides an optical fiber path from the CO directly to the home, with potential rates in the [[gigabits per second]] range. Distribution options: **direct fiber** (one fiber leaves the CO for each home) or, more commonly, a fiber from the CO [[shared by many homes]] that is split into per-customer fibers only near the homes. Two splitting architectures compete: [[AON]] (active optical network — essentially switched Ethernet) and [[PON]] (passive optical network, used by Verizon FiOS).' },
        { steps: [
          'In the home, a home router (typically wireless) connects to the [[ONT]] (optical network terminator).',
          'Each ONT has a dedicated fiber to a neighborhood [[optical splitter]].',
          'The splitter combines a number of homes (typically [[fewer than 100]]) onto a single shared fiber.',
          'The shared fiber runs to the [[OLT]] (optical line terminator) in the telco’s CO, which converts between optical and electrical signals.',
          'The OLT connects to the Internet via a telco router.'
        ], title: 'PON, from the home to the Internet' },
        { p: 'In PON, all packets sent from the OLT to the splitter are [[replicated at the splitter]] (similar to a cable head end), so the downstream fiber is shared by the homes on that splitter.' },
        { p: '**5G fixed wireless**: using [[beam-forming]], data is sent wirelessly from the provider’s base station to a modem in the home, with a WiFi router connected to it (possibly bundled). It promises high-speed residential access [[without installing cabling]] from the CO to the home, which is costly and failure-prone.' },
        { trap: 'ONT = at the home (the network’s “terminator” at your end); OLT = in the central office (the “line” terminator on the telco side). The PON splitter is passive: it copies downstream packets to every home on it — it does not switch.' }
      ]
    },
    {
      title: 'Enterprise and home LANs: Ethernet and WiFi',
      src: 'text',
      blocks: [
        { p: 'On corporate and university campuses, and increasingly in homes, a [[local area network (LAN)]] connects end systems to the edge router. [[Ethernet]] is by far the most prevalent: users connect with [[twisted-pair copper wire]] to an Ethernet switch (or a network of switches), which connects through an institutional router to the institution’s ISP.' },
        { list: [
          'Ethernet rates: users typically have [[100 Mbps to tens of Gbps]] access to the switch; servers may have [[1 Gbps to 10 Gbps]].',
          'Wireless LAN: users send/receive packets to/from an [[access point]] connected to the enterprise’s (usually wired Ethernet) network. Users must be within [[a few tens of meters]] of the access point.',
          'WiFi = [[IEEE 802.11]] wireless LAN technology, now nearly everywhere (universities, offices, cafés, airports, homes, airplanes); it provides a [[shared]] transmission rate of more than 100 Mbps.',
          'Typical home network: broadband access (cable modem or DSL) + a home router + a wireless access point (base station) + wired PCs, roaming laptops and Internet-connected appliances.'
        ] }
      ]
    },
    {
      title: 'Wide-area wireless: 3G, 4G LTE and 5G',
      src: 'both',
      blocks: [
        { p: 'Mobile devices use the same wireless infrastructure as [[cellular telephony]], sending and receiving packets through a [[base station]] operated by the cellular network provider. Unlike WiFi (tens of meters), a user only needs to be within [[a few tens of kilometers]] of the base station.' },
        { list: [
          '4G (LTE): real-world download speeds of up to [[60 Mbps]].',
          '5G: a fifth generation of even higher-speed wide-area wireless, already being deployed (Chapter 7).'
        ] },
        { table: { head: ['', 'WiFi (IEEE 802.11)', '4G / 5G cellular'], rows: [
          ['Range', 'A few tens of meters', 'A few tens of kilometers'],
          ['Connects to', 'Access point on an enterprise or home network', 'Base station run by the cellular provider'],
          ['Rate', 'Shared, more than 100 Mbps', '4G up to 60 Mbps real-world; 5G higher'],
          ['Access-network type', 'Institutional / home (also mobile)', 'Mobile (wide-area)']
        ] }, caption: 'Textbook R10: compare the two most popular wireless access technologies.' }
      ]
    },
    {
      title: 'Access technologies at a glance',
      src: 'text',
      blocks: [
        { table: { head: ['Technology', 'Setting', 'Medium', 'Key devices', 'Rates (textbook)', 'Shared or dedicated?'], rows: [
          ['DSL', 'Home', 'Telephone twisted pair', 'DSL modem, splitter, DSLAM in CO', '24/52 Mbps down, 3.5/16 Mbps up; newest 1 Gbps aggregate', 'Dedicated line to the CO'],
          ['Cable (HFC)', 'Home', 'Fiber + coax', 'Cable modem, CMTS at head end', 'DOCSIS 2.0: 40/30 Mbps; 3.0: 1.2 Gbps/100 Mbps', 'Shared (broadcast)'],
          ['FTTH (PON)', 'Home', 'Optical fiber', 'ONT, splitter, OLT in CO', 'Gbps range', 'Shared from splitter to OLT (direct fiber: dedicated)'],
          ['5G fixed wireless', 'Home', 'Radio (beam-forming)', 'Base station, home modem + WiFi router', 'High speed', 'Wireless medium (usually shared)'],
          ['Ethernet', 'Enterprise, home', 'Twisted pair (switched)', 'Ethernet switch, institutional router', '100 Mbps–tens of Gbps; servers 1–10 Gbps', 'Own twisted pair to the switch'],
          ['WiFi (802.11)', 'Enterprise, home, public', 'Radio, tens of meters', 'Access point', 'Shared > 100 Mbps', 'Shared'],
          ['3G/4G/5G', 'Wide-area mobile', 'Radio, tens of km', 'Base station', '4G up to 60 Mbps', 'Shared']
        ] }, caption: 'Textbook R4 and R9 in one table: classify each technology and know shared vs dedicated.' }
      ]
    },
    {
      title: 'Packet transmission: the host sending function',
      src: 'cheat',
      blocks: [
        { steps: [
          'The host takes an [[application message]].',
          'It breaks the message into smaller chunks, [[packets of length L bits]].',
          'It transmits each packet into the access network at [[transmission rate R]] (also called the link capacity or link bandwidth).'
        ], title: 'Host sending function' },
        { formula: 'd_{trans} = L / R', where: [['L', 'packet length in bits'], ['R', 'link transmission rate in bits/s'], ['d_{trans}', 'seconds needed to transmit (push) all L bits into the link']], note: 'Convert bytes to bits (× 8). Rates use powers of 10: 1 kbps = 10^{3} bps, 1 Mbps = 10^{6} bps, 1 Gbps = 10^{9} bps.' },
        { example: { q: 'A host sends 1,500-byte packets into a 20 Mbps access link. What is the transmission delay of one packet?', a: 'L = 1,500 bytes × 8 = 12,000 bits.\nd_{trans} = L/R = 12,000 / (20 × 10^{6}) = 0.0006 s = 0.6 ms.' } },
        { trap: 'The most common slip is forgetting × 8 for bytes, which makes the answer 8 times too small. The second is using 2^{20} for “Mega”: link rates are powers of 10.' },
        { game: 'number-crunch', text: 'Drill L/R conversions (bytes → bits, Mbps → bps) until they are automatic.' }
      ]
    },
    {
      title: 'Physical media: guided vs unguided',
      src: 'both',
      blocks: [
        { def: 'Physical link', text: 'The [[medium connecting a transmitter and a receiver]]. A bit traveling from source to destination is transmitted many times — once per transmitter–receiver pair along the path — as electromagnetic waves or optical pulses. The medium need not be the same on every hop.' },
        { table: { head: ['', 'Guided media', 'Unguided media'], rows: [
          ['How the signal travels', 'Along a [[solid medium]]', 'Freely through [[the atmosphere and outer space]]'],
          ['Examples', 'Twisted-pair copper, coaxial cable, fiber-optic cable', 'Terrestrial radio (wireless LAN, cellular), satellite radio']
        ] } },
        { p: 'Cost: the physical cable is usually cheap compared with the [[labor of installing it]], which can be orders of magnitude higher. That is why builders often install twisted pair, optical fiber and coaxial cable in every room at once — avoiding a second round of labor later.' }
      ]
    },
    {
      title: 'Twisted pair and coaxial cable',
      src: 'text',
      blocks: [
        { p: 'Twisted-pair copper wire is the [[least expensive and most commonly used]] guided medium; more than 99% of wired connections from telephone handsets to the local telephone switch use it. It consists of two insulated copper wires (about 1 mm thick) in a regular spiral; the wires are [[twisted to reduce electrical interference]] from similar pairs close by. Pairs are bundled in a protective shield; one wire pair is one communication link.' },
        { list: [
          '[[Unshielded twisted pair (UTP)]] is used for computer networks within a building (LANs): 10 Mbps to 10 Gbps, depending on wire thickness and transmitter–receiver distance.',
          'Modern [[category 6a]] cable reaches 10 Gbps for distances up to 100 m. Twisted pair, not fiber, became the dominant high-speed LAN medium.',
          'Residential access over twisted pair: dial-up modems up to [[56 kbps]]; DSL tens of Mbps for homes close to the central office.'
        ] },
        { p: 'Coaxial cable also has two copper conductors, but they are [[concentric]] rather than parallel; with special insulation and shielding it achieves high data rates. It is common in cable TV systems, and with cable modems gives residential access at hundreds of Mbps. The transmitter shifts the digital signal to a specific frequency band, and the resulting analog signal goes to one or more receivers. Coax can be a [[guided shared medium]]: many end systems connect directly to the cable, and each receives whatever the others send.' }
      ]
    },
    {
      title: 'Optical fiber',
      src: 'both',
      blocks: [
        { p: 'An optical fiber is a thin, flexible glass medium that conducts [[pulses of light, each pulse representing a bit]].' },
        { list: [
          'Tremendous bit rates: [[tens to hundreds of Gbps]] on a single fiber (high-speed point-to-point transmission).',
          '[[Immune to electromagnetic interference]] and very low signal attenuation up to 100 km, so [[repeaters can be spaced far apart]] → [[low error rate]]. Fiber is also very hard to tap.',
          'The preferred [[long-haul]] guided medium, especially for overseas links; used exclusively by many long-distance telephone networks and prevalent in the Internet backbone.',
          'Drawback: the high cost of optical devices (transmitters, receivers, switches) has hindered its use for short-haul transport such as LANs and home access.',
          'Optical Carrier standards: [[OC-n = n × 51.8 Mbps]], from 51.8 Mbps up to 39.8 Gbps; in use: OC-1, OC-3, OC-12, OC-24, OC-48, OC-96, OC-192, OC-768.'
        ] },
        { example: { q: 'What are the rates of OC-48 and OC-192 links?', a: 'OC-48 = 48 × 51.8 Mbps = 2,486.4 Mbps ≈ 2.49 Gbps.\nOC-192 = 192 × 51.8 Mbps = 9,945.6 Mbps ≈ 9.95 Gbps.' } }
      ]
    },
    {
      title: 'Wireless media: terrestrial radio and satellite',
      src: 'both',
      blocks: [
        { p: 'Wireless media carry signals as electromagnetic waves without wires. They are usually a [[shared, half-duplex]] medium, and are affected by [[reflection, physical obstructions, interference and noise]].' },
        { p: 'Terrestrial radio is attractive because it needs no installed wire, can [[penetrate walls]], gives connectivity to [[mobile users]], and can carry a signal over long distances. Its behaviour depends heavily on the propagation environment and the distance:' },
        { list: [
          '[[Path loss]] and [[shadow fading]]: signal strength decreases with distance and around/through obstructing objects.',
          '[[Multipath fading]]: caused by signal reflection off interfering objects.',
          '[[Interference]]: from other transmissions and electromagnetic signals.'
        ] },
        { table: { head: ['Radio channel class', 'Distance', 'Examples'], rows: [
          ['Very short', 'One or two meters', 'Wireless headsets, keyboards, medical devices'],
          ['Local area', 'Ten to a few hundred meters', 'Wireless LANs (WiFi)'],
          ['Wide area', 'Tens of kilometers', 'Cellular access (4G/5G)']
        ] } },
        { p: 'A communication satellite links two or more Earth-based microwave transmitter/receivers called [[ground stations]]. It receives on one frequency band, regenerates the signal using a repeater, and transmits on another frequency.' },
        { table: { head: ['', 'Geostationary (GEO)', 'Low-earth orbit (LEO)'], rows: [
          ['Altitude', '[[36,000 km]] above Earth’s surface', 'Much closer to Earth'],
          ['Position', 'Permanently above the same spot', 'Rotates around Earth; may communicate with other satellites'],
          ['Propagation delay', 'About [[280 ms]] ground → satellite → ground', 'Much smaller'],
          ['Use', 'Hundreds of Mbps; areas without DSL or cable access', 'Needs [[many satellites]] for continuous coverage; future Internet access']
        ] } },
        { example: { q: 'Best case: both ground stations are directly beneath a GEO satellite and the signal travels at 3 × 10^{8} m/s. What is the ground → satellite → ground propagation delay?', a: 'Path ≈ 2 × 36,000 km = 72,000 km = 7.2 × 10^{7} m.\nd_{prop} = 7.2 × 10^{7} / (3 × 10^{8}) = 0.24 s = 240 ms.\nReal ground stations are usually not directly beneath the satellite, so the slant paths are longer — hence the textbook’s figure of about 280 ms.' } }
      ]
    },
    {
      title: 'A network of networks: how ISPs interconnect',
      src: 'both',
      blocks: [
        { p: 'End systems connect through an [[access ISP]] using DSL, cable, FTTH, WiFi or cellular; the access ISP can also be a university or a company. To let all end systems reach each other, the access ISPs must themselves be interconnected. Linking every access ISP directly to every other one (a [[full mesh]]) is far too costly. The structure that evolved is driven mostly by [[economics and national policy]], not performance. The textbook builds it up step by step:' },
        { steps: [
          '**Structure 1**: one global transit ISP connects all access ISPs. The access ISP pays, so it is the [[customer]]; the global ISP is the [[provider]].',
          '**Structure 2**: [[multiple competing global transit ISPs]], which must interconnect with each other — a two-tier hierarchy.',
          '**Structure 3**: a multi-tier hierarchy — access ISPs → [[regional ISPs]] → [[tier-1 ISPs]] (sometimes more levels, e.g., in China: city → provincial → national → tier-1). Customer–provider relationship at every level.',
          '**Structure 4**: Structure 3 plus [[PoPs, multi-homing, peering and IXPs]].',
          '**Structure 5 (today’s Internet)**: Structure 4 plus [[content-provider networks]] such as Google’s.'
        ], title: 'Network structures 1 → 5' },
        { diagram: 'network-of-networks' },
        { def: 'Tier-1 ISP', text: 'Top of the hierarchy: like the imaginary global transit ISP, but without a presence in every city. About [[a dozen]] exist (e.g., Level 3, AT&T, Sprint, NTT). No group officially sanctions tier-1 status. Tier-1s [[pay no one]] and peer with one another settlement-free.' },
        { def: 'Customer–provider', text: 'Each access ISP pays the regional ISP it connects to, and each regional ISP pays its tier-1 (an access ISP may also connect to, and pay, a tier-1 directly). The payment reflects the [[amount of traffic exchanged]].' },
        { def: 'PoP (point of presence)', text: 'A group of one or more routers at the same location in a provider’s network where [[customer ISPs connect]] into the provider. PoPs exist at [[all levels except the bottom]] (access ISP) level. A customer can lease a high-speed link from a third-party telecom provider to connect one of its routers to a router at the PoP.' },
        { def: 'Multi-homing', text: 'Connecting to [[two or more provider ISPs]]. Any ISP except a tier-1 may multi-home (an access ISP with two regional ISPs, or two regionals plus a tier-1; a regional ISP with several tier-1s). Benefit: it keeps sending and receiving packets [[if one provider fails]].' },
        { def: 'Peering', text: 'Two nearby ISPs [[at the same level]] of the hierarchy directly connect their networks so traffic between them bypasses upstream intermediaries. Usually [[settlement-free]] — neither pays the other. Motivation: [[reduce payments]] to their providers. Tier-1 ISPs also peer with each other settlement-free.' },
        { def: 'IXP (Internet exchange point)', text: 'A meeting point where [[multiple ISPs peer]] together, created by a [[third-party company]]; typically a stand-alone building with its own switches. More than 600 exist. The IXP operator earns money by charging each connecting ISP a (relatively small) fee, which may depend on traffic volume.' },
        { def: 'Content-provider network (e.g., Google)', text: 'A [[private TCP/IP network]] interconnecting the provider’s data centers (Google: 19 major data centers plus smaller ones of a few hundred servers, often located inside IXPs). It spans the globe but is [[separate from the public Internet]] and carries only traffic to/from Google servers. It tries to [[bypass the upper tiers]] by peering settlement-free with lower-tier ISPs (directly or at IXPs), but still connects to — and [[pays]] — tier-1 ISPs to reach access ISPs it can only reach through them.' },
        { p: 'Why build one? The content provider [[reduces its payments to upper-tier ISPs]] and gains [[greater control over how its services are delivered]] to end users.' },
        { p: 'Big picture: about a dozen tier-1 ISPs and hundreds of thousands of lower-tier ISPs of very different coverage. Users and content providers are customers of lower-tier ISPs; lower-tier ISPs are customers of higher-tier ISPs; higher tiers interconnect with each other; and major content providers connect directly into lower-tier ISPs where possible.' },
        { trap: 'Peering is between ISPs at the **same** level and is usually free; customer–provider links connect **different** levels and are paid by the customer. A tier-1 cannot multi-home (it has no providers) and pays no one — yet it does peer.' },
        { example: { q: 'Access ISP A connects to regional ISP R1 and directly to tier-1 ISP T1. Regional ISPs R1 and R2 peer at an IXP. R1 buys transit from T1. Who pays whom?', a: 'A pays R1 and A pays T1 (A is multi-homed: two providers).\nR1 pays T1 (customer → provider).\nR1 and R2 peer settlement-free: no payment between them (each may pay the IXP operator a connection fee).\nT1 pays nobody for transit.' } }
      ]
    }
  ],
  recall: [
    { q: 'Is there any difference between a host and an end system? Is a Web server one?', a: 'No difference (host = end system). Yes, a Web server is an end system.' },
    { q: 'Switch vs router: what does each connect, and where is each typically found?', a: 'Link-layer switch: devices within a LAN, typically in access networks. Router: multiple networks, typically in the network core.' },
    { q: 'Define access network and edge router.', a: 'Access network: the network linking an end system to the first router on its path to any distant end system. Edge router: that first router.' },
    { q: 'Name the three types of access networks.', a: 'Residential, institutional (schools, companies), mobile (Wi-Fi, 4G/5G).' },
    { q: 'Who develops Internet standards, and what are the documents called? Who standardizes Ethernet/WiFi?', a: 'The IETF; RFCs. The IEEE 802 LAN Standards Committee.' },
    { q: 'What are the API “hooks” of the services view?', a: 'The socket interface: rules a sending program follows so the Internet delivers its data to a program on another end system.' },
    { q: 'DSL frequency bands?', a: '0–4 kHz telephone, 4–50 kHz upstream, 50 kHz–1 MHz downstream (FDM).' },
    { q: 'DSL device in the central office? Cable equivalent at the head end?', a: 'DSLAM. CMTS.' },
    { q: 'Is HFC shared or dedicated? Collisions downstream?', a: 'Shared broadcast medium. No downstream collisions (only the head end sends); upstream needs a multiple access protocol.' },
    { q: 'DOCSIS 2.0 and 3.0 rates?', a: '2.0: 40 Mbps down / 30 Mbps up. 3.0: 1.2 Gbps down / 100 Mbps up.' },
    { q: 'PON components from home to CO?', a: 'Home router → ONT → optical splitter (fewer than 100 homes share a fiber) → OLT in the CO → telco router.' },
    { q: 'WiFi range vs cellular range? 4G real-world rate?', a: 'A few tens of meters vs a few tens of kilometers. Up to 60 Mbps.' },
    { q: 'Ethernet access rates for users and servers?', a: 'Users 100 Mbps to tens of Gbps; servers 1–10 Gbps.' },
    { q: 'Guided vs unguided media, with examples?', a: 'Guided: signal along a solid medium (twisted pair, coax, fiber). Unguided: through atmosphere/space (terrestrial radio, satellite).' },
    { q: 'Why is twisted pair twisted? What can Cat 6a do?', a: 'To reduce electrical interference from nearby pairs. 10 Gbps up to 100 m.' },
    { q: 'Why does fiber have a low error rate? OC-n rate?', a: 'Immune to EM noise and low attenuation, so repeaters can be far apart. n × 51.8 Mbps.' },
    { q: 'GEO altitude and propagation delay? LEO drawback?', a: '36,000 km; about 280 ms. LEO satellites move, so many are needed for continuous coverage.' },
    { q: 'List network structures 1–5.', a: '1 single global transit ISP; 2 multiple global ISPs; 3 multi-tier hierarchy (access, regional, tier-1); 4 + PoPs, multi-homing, peering, IXPs; 5 + content-provider networks.' },
    { q: 'Where do PoPs exist? Who cannot multi-home? What is settlement-free peering?', a: 'All levels except access ISPs. Tier-1 ISPs. Same-level ISPs directly connect and neither pays the other.' },
    { q: 'Why do content providers like Google build private networks?', a: 'To reduce payments to upper-tier ISPs and control how their services reach users (they peer with lower-tier ISPs, bypassing upper tiers).' }
  ]
});
