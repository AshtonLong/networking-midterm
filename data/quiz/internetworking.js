NET.addQuestions("internetworking", [
  { id: "internetworking-01", d: 1, type: "mc", src: "cheat",
    q: "Which pairing correctly states what LANs and WANs are optimized for?",
    choices: [
      "LAN: high-speed communication over short distances. WAN: communication over long distances",
      "LAN: low cost at any distance. WAN: wireless access only",
      "LAN: communication over long distances. WAN: high-speed communication over short distances",
      "Both are optimized for the same thing; they differ only in price"
    ],
    a: 0,
    why: "Lecture: a LAN (local area network) is optimized for high-speed communication over short distances, and a WAN (wide area network) for communication over long distances. Because no single technology does both well, organizations end up with several kinds of networks." },

  { id: "internetworking-02", d: 2, type: "mc", src: "cheat",
    q: "Why do large organizations with varied needs end up running multiple physical networks?",
    choices: [
      "Multiple networks are required to obtain IP addresses",
      "Regulations forbid a single network per organization",
      "Routers can only connect two computers each",
      "No single networking technology meets every requirement, so they choose the best network type for each task"
    ],
    a: 3,
    why: "Technology trade-offs (speed, distance, cost) mean different tasks call for different networks, such as a LAN in each building and a WAN between sites. That diversity is what creates the need for internetworking." },

  { id: "internetworking-03", d: 1, type: "mc", src: "cheat",
    q: "What is **universal service**?",
    choices: [
      "The use of one network technology by every organization",
      "The ability for a user on any computer in any organization to send messages or data to any other user",
      "A government subsidy for rural Internet access",
      "A guarantee that every packet is delivered within a fixed delay"
    ],
    a: 1,
    why: "Universal service means anyone can reach anyone, analogous to the telephone system, where any telephone can call any other telephone. It says nothing about delay guarantees, and it does **not** require a single technology." },

  { id: "internetworking-04", d: 1, type: "mc", src: "cheat",
    q: "Which situation describes the **island problem**?",
    choices: [
      "Networks are not interconnected, so a computer can reach only computers on its own network, and users must physically move to a computer on another network to send there",
      "An ISP refuses to peer with another ISP",
      "Packets queue at a router because too many arrive at once",
      "A wireless network loses connectivity when a user walks out of range"
    ],
    a: 0,
    why: "Each unconnected network is a separate island. Cross-network communication meant physically going to a computer on the other network, which reduced user satisfaction and productivity. Internetworking (universal service) is the cure." },

  { id: "internetworking-05", d: 2, type: "short", src: "cheat",
    q: "Explain the island problem and why it motivated internetworking.",
    a: "When networks are not interconnected, each one is a separate island: a computer can communicate only with computers on the same network. To reach someone on another network, a user had to physically move to a computer attached to that network, which hurt user satisfaction and productivity. Internetworking connects the islands so any user can reach any other user, which is universal service.",
    keys: ["island|separate|not interconnected", "same network|only its own", "physically|move|another computer", "universal service|any user|interconnect"],
    why: "The lecture builds the argument in steps. Technology trade-offs produce many networks. Unconnected networks produce islands. Users want universal service. And heterogeneous networks can't just be wired together, so internetworking with routers and protocols is required." },

  { id: "internetworking-06", d: 2, type: "tf", src: "cheat",
    q: "Achieving universal service requires every organization to use the same single network technology.",
    a: false,
    why: "False. The lecture says explicitly that universal service does **not** require a single network technology. Internetworking provides universal service **across** different technologies by interconnecting them with routers and protocol software." },

  { id: "internetworking-07", d: 2, type: "multi", src: "cheat",
    q: "Why can't heterogeneous network technologies simply be joined by connecting wires or by bridging? Select all that apply.",
    choices: [
      "A frame created for one technology cannot be transmitted on a network using a different technology",
      "Each technology has its own addressing method",
      "The cables are different colours",
      "Their computers run different application programs",
      "Each technology has its own packet (frame) format"
    ],
    a: [0, 1, 4],
    why: "The incompatibility is at the frame level: different formats and different addressing, so a native frame from one network is meaningless on another. Applications and cable colour are irrelevant. The fix is routers that carry a common packet and re-encapsulate it per network." },

  { id: "internetworking-08", d: 2, type: "mc", src: "cheat",
    q: "In cheat-sheet Figure 24, which network's frame has **three** address fields (Addr1, Addr2, Addr3) along with Frame control and Duration fields?",
    choices: [
      "Wi-Fi WLAN",
      "Ethernet LAN",
      "All three share this layout",
      "WAN"
    ],
    a: 0,
    why: "Figure 24's Wi-Fi frame is Frame control · Duration · Addr1 · Addr2 · Addr3 · Data · FCS. Ethernet is Dest · Src · Type · Data · FCS (two addresses), and the WAN frame is Flag · Address · Control · Data · FCS (one address). Different layouts and addressing are exactly why a “direct connection fails”." },

  { id: "internetworking-09", d: 1, type: "mc", src: "cheat",
    q: "How does the lecture define **internetworking**?",
    choices: [
      "Replacing all networks with one high-speed WAN",
      "Sharing one link among users with TDM",
      "Enabling universal service across different network technologies by using hardware to interconnect the networks and software to enable communication across them",
      "Connecting computers within one LAN using a switch"
    ],
    a: 2,
    why: "Internetworking = hardware (routers) + software (protocols) that interconnect networks. The connected networks form an **internetwork**, or internet. Connecting devices inside one LAN is a switch's job, not internetworking." },

  { id: "internetworking-10", d: 2, type: "mc", src: "cheat",
    q: "What allows an internetwork to connect networks that cannot exchange native frames?",
    choices: [
      "Bridges translate every frame bit by bit",
      "Routers carry a common internetwork packet and re-encapsulate it in the native frame required on each link, so link-level compatibility isn't required",
      "All networks are converted to use Ethernet frames",
      "Each host joins every network directly"
    ],
    a: 1,
    why: "The internetwork packet (IP datagram) is the same everywhere, while the frame around it is local to each link. A router unwraps the incoming frame and wraps the same packet in the outgoing network's frame format. Frames never need to cross between incompatible networks." },

  { id: "internetworking-11", d: 2, type: "order", src: "cheat",
    q: "A datagram travels from host A on an Ethernet LAN, through routers R1 and R2, to host B on a Wi-Fi LAN, with a WAN link between R1 and R2. Order the events.",
    items: [
      "Host A wraps the IP datagram in an Ethernet frame addressed to R1",
      "R1 removes the Ethernet frame and reads the destination IP address",
      "R1 wraps the same datagram in a WAN frame and sends it to R2",
      "R2 removes the WAN frame and wraps the datagram in a Wi-Fi frame",
      "Host B removes the Wi-Fi frame and passes the datagram up its stack"
    ],
    why: "At each router: strip the incoming link's frame, read the IP header, forward, then build a new frame in the next link's native format. The datagram is the common packet that stays the same end to end; the three different frames each exist on only one network." },

  { id: "internetworking-12", d: 3, type: "short", src: "cheat",
    q: "A packet must cross an Ethernet LAN, a WAN and a Wi-Fi LAN, three technologies with incompatible frame formats and addressing. Explain how internetworking gets it across even though no Ethernet frame can be sent on the WAN.",
    a: "The source puts its data in a common internetwork packet (an IP datagram with IP addresses) and sends it inside an Ethernet frame to the first router. Each router removes the incoming frame, reads the destination IP address, and re-encapsulates the same packet in the native frame of the next network (a WAN frame, then a Wi-Fi frame). Only the packet travels end to end; each frame stays on its own network, so link-level compatibility is never needed.",
    keys: ["common packet|internetwork packet|IP datagram|IP packet", "router", "re-encapsulat|new frame|native frame|wrap", "strip|remove|unwrap", "link-level compatibility|own network|never crosses"],
    why: "This is the core mechanism of internetworking (cheat p.34–47) and matches Kurose Figure 1.24, where routers implement layers 1–3 and different links run different link-layer protocols. In Kurose's words, IP is the glue that binds the Internet together." },

  { id: "internetworking-13", d: 1, type: "tf", src: "cheat",
    q: "An internet may contain just a few networks or, like the global Internet, tens of thousands, and each network may contain anywhere from no computers to hundreds.",
    a: true,
    why: "True. That's the lecture's statement about scale. Internetworking works the same way whether it joins two networks or tens of thousands." },

  { id: "internetworking-14", d: 1, type: "mc", src: "cheat",
    q: "According to the lecture, what is a **router**?",
    choices: [
      "A cable that joins two different network technologies",
      "A device that connects computers within a single LAN using layer-2 addresses only",
      "The primary device for connecting heterogeneous networks: dedicated hardware with a processor, memory, and an interface for each network",
      "A software program that runs only on end hosts"
    ],
    a: 2,
    why: "A router is special-purpose hardware with a processor, memory, and one interface per attached network. The “single LAN, layer-2 addresses only” option describes a link-layer switch, which connects devices **within** a LAN, while a router connects **multiple networks**." },

  { id: "internetworking-15", d: 2, type: "multi", src: "cheat",
    q: "Why do organizations deploy multiple routers rather than a single one? Select all that apply.",
    choices: [
      "Multiple routers make all the networks use one frame format",
      "Redundancy: no single point of failure",
      "Protocol software can reroute traffic around a failed router or network",
      "Load balancing and improved performance",
      "Multiple routers remove the need for IP addresses"
    ],
    a: [1, 2, 3],
    why: "Multiple routers spread the load and remove the single point of failure, and protocol software monitors connections and reroutes traffic when a network or router fails. Routers don't eliminate addressing (they depend on IP addresses), and they don't unify frame formats (they re-encapsulate per network)." },

  { id: "internetworking-16", d: 2, type: "multi", src: "cheat",
    q: "According to the lecture, which factors determine the choice of internet topology? Select all that apply.",
    choices: [
      "Cost",
      "Performance of available router hardware",
      "Bandwidth of the physical networks",
      "The brand of operating system on users' laptops",
      "The organization's reliability requirements",
      "Expected traffic"
    ],
    a: [0, 1, 2, 4, 5],
    why: "The lecture lists five: bandwidth, expected traffic, reliability requirements, cost, and router hardware performance. End-user operating systems don't affect how networks and routers should be interconnected." },

  { id: "internetworking-17", d: 3, type: "mc", src: "cheat",
    q: "A company connects its four LANs through one central router. The router fails. What happens, and what does the lecture recommend?",
    choices: [
      "Traffic automatically flows through the LAN switches instead, so nothing changes",
      "Each LAN reconfigures to use the same frame format so no router is needed",
      "Only traffic to the global Internet stops, while traffic between LANs continues",
      "All inter-LAN communication stops (the islands return). Deploy multiple routers for redundancy and load balancing, with protocol software that reroutes around failures"
    ],
    a: 3,
    why: "With one router, that router is a single point of failure: when it dies, each LAN is isolated again. Switches can't join heterogeneous networks. Multiple routers provide redundancy and load balancing, and protocol software monitors connections and reroutes when a network or router fails." },

  { id: "internetworking-18", d: 1, type: "mc", src: "cheat",
    q: "What is an **intranet**?",
    choices: [
      "A public subscription network sold by an ISP",
      "An internet owned by a private organization and intended for use only by the organization's employees",
      "The global Internet with an uppercase I",
      "A single Ethernet LAN with no routers"
    ],
    a: 1,
    why: "An intranet is a private organization's internet, used only by its employees. “Internet” with an uppercase I refers to the current global Internet and its associated protocols. An intranet can contain many networks and routers, so it isn't just a single LAN." },

  { id: "internetworking-19", d: 1, type: "mc", src: "cheat",
    q: "What does writing **Internet** with an uppercase I refer to?",
    choices: [
      "A private organization's network for its employees",
      "The current global Internet and its associated protocols",
      "The physical layer of the protocol stack",
      "Any internetwork built by any organization"
    ],
    a: 1,
    why: "Lowercase internet = any internetwork (networks joined by routers). Uppercase Internet = the specific global Internet and its protocols (TCP/IP). An organization's private internet is an intranet." },

  { id: "internetworking-20", d: 2, type: "short", src: "cheat",
    q: "Why is the distinction between an intranet and the Internet described as “blurred”?",
    a: "Organizations build their intranets with the same equipment (routers) and the same protocol software (TCP/IP) that ISPs use for the global Internet. And organizational intranets often connect to the global Internet through gateways, so the two are technically alike and physically joined.",
    keys: ["same equipment|same hardware|routers", "same protocol|TCP/IP|same software", "gateway|connect to the Internet|connected"],
    why: "What separates an intranet from the Internet is ownership and who may use it (private, employees only), not technology. Technically it is a small internet built exactly like the big one, and usually attached to it." },

  { id: "internetworking-21", d: 1, type: "tf", src: "cheat",
    q: "Intranets use completely different equipment and protocol software from those used by ISPs for the global Internet.",
    a: false,
    why: "False. Organizations use the **same** equipment and protocol software for intranets as ISPs use for the Internet. That is one reason the distinction is blurred." },

  { id: "internetworking-22", d: 2, type: "mc", src: "cheat",
    q: "How do Internet protocols enable universal service across different network technologies?",
    choices: [
      "By reserving a circuit across every network for each user",
      "By removing the need for routers",
      "By forcing every network to adopt Ethernet",
      "By resolving differences in frame formats and physical addresses between the underlying networks"
    ],
    a: 3,
    why: "Internet protocols paper over the differences (frame formats, physical addresses) by defining a common packet and a common address. Routers still have to agree to forward information. No technology is replaced, no circuits are reserved, and routers remain essential." },

  { id: "internetworking-23", d: 3, type: "tf", src: "cheat",
    q: "Because Internet protocols hide the differences between networks, routers don't need to agree on how to forward information.",
    a: false,
    why: "False. The lecture says networks using different technologies can communicate **even though routers must agree to forward information**. Hiding frame-format and physical-address differences only works if the routers cooperate under a common protocol (IP) and forward each other's traffic." },

  { id: "internetworking-24", d: 2, type: "mc", src: "cheat",
    q: "An internet is called a **virtual network system** because Internet software hides which details from users and applications?",
    choices: [
      "The destination host's name",
      "Nothing: users see every physical network and router",
      "The application's data",
      "Physical network connections, physical addresses, and routing information"
    ],
    a: 3,
    why: "The abstraction hides physical connections, physical addresses and routing, so users and programs get the illusion of a single, seamless, uniform network. They name a destination and send. They never see which LANs, WANs or routers are involved." },

  { id: "internetworking-25", d: 3, type: "short", src: "cheat",
    q: "Explain why an internet is described as a **virtual network system**. What does the user see, and what is really there?",
    a: "An internet is an abstraction of the communication system. Internet software hides the physical network connections, physical addresses and routing information, so users and applications see a single, seamless, uniform network where every host is reachable with one kind of address. In reality it is many separate physical networks of different technologies, joined by routers that forward packets hop by hop.",
    keys: ["abstraction|illusion|virtual", "hides|hidden", "physical connection|physical address|routing", "single|seamless|uniform|one network", "many networks|routers|separate physical"],
    why: "“Virtual” means the network the user perceives doesn't physically exist as one network. It is constructed by protocol software on top of heterogeneous physical networks. This is why an application can send to any IP address without knowing whether the path crosses Ethernet, Wi-Fi or a WAN." },

  { id: "internetworking-26", d: 3, type: "mc", src: "cheat",
    q: "A router receives an Ethernet frame and forwards its contents onto a PPP (WAN) link. Which statement describes what changes?",
    choices: [
      "Nothing changes: the Ethernet frame is sent unchanged on the PPP link",
      "The router converts the datagram into a TCP segment for the WAN",
      "The IP datagram is discarded and a new one with new source and destination addresses is created",
      "The link-layer frame is replaced (the Ethernet header is removed and a PPP frame is built), while the IP datagram inside is carried on as the common packet"
    ],
    a: 3,
    why: "Routers implement layers 1–3. They strip the incoming link layer, use the IP header to forward, and re-encapsulate the same datagram in the outgoing link's native frame. The datagram (with its end-to-end IP addresses) is the common internetwork packet. The Ethernet frame couldn't be sent on PPP anyway, and routers don't create transport segments." },

  { id: "internetworking-27", d: 2, type: "num", src: "cheat",
    q: "A datagram travels from a host on network 1 to a host on network 5, crossing five different physical networks connected in a chain by four routers. How many different link-layer frames carry the datagram along the way?",
    a: 5, unit: "frames",
    why: "Each physical network needs its own native frame. The source builds frame 1, and each of the 4 routers builds a new frame for the next network: 1 + 4 = 5 frames. The datagram itself is created once, at the source." },

  { id: "internetworking-28", d: 2, type: "num", src: "ch1-P19",
    ctx: "P19: Metcalfe's law states that the value of a computer network is proportional to the square of the number of connected users. Let n be the number of users, and assume each user sends one message to each of the other users.",
    q: "With n = 10 users, how many messages are sent?",
    a: 90, unit: "messages",
    why: "Each of the 10 users sends to the 9 others: 10 × 9 = 90 messages." },

  { id: "internetworking-29", d: 3, type: "short", src: "ch1-P19",
    ctx: "P19: Metcalfe's law states that the value of a computer network is proportional to the square of the number of connected users. Let n be the number of users, and assume each user sends one message to each of the other users.",
    q: "In general, how many messages will be sent? Does your answer support Metcalfe's law?",
    a: "Each of the n users sends to n − 1 others, so n(n − 1) = n^{2} − n messages are sent. For large n this grows like n^{2}, so yes, it supports Metcalfe's law (if a network's value tracks how many communications it makes possible).",
    keys: ["n(n − 1)|n(n-1)|n^2 − n|n^2-n|n2 - n", "square|n^2|n squared|quadratic", "yes|supports"],
    why: "n(n − 1) is dominated by n^{2}: for n = 100 it is 9,900 vs n^{2} = 10,000. This is the quantitative case for universal service. Joining two islands of 50 users raises the possible messages from 2 × 50 × 49 = 4,900 to 100 × 99 = 9,900." },

  { id: "internetworking-30", d: 3, type: "num", src: "ch1-P19",
    q: "Applying P19's model to universal service: two isolated networks (islands) have 30 users each. After they are interconnected, how many **additional** user-to-user messages become possible (each user sends one message to every other user it can reach)?",
    a: 1800, unit: "messages",
    why: "Before: each island has 30 × 29 = 870 messages, so 2 × 870 = 1,740 in total.\nAfter: 60 × 59 = 3,540 messages.\nAdditional = 3,540 − 1,740 = 1,800. That is exactly the 30 × 30 × 2 cross-island messages. Interconnection more than doubles the possible communication with no new users." },

  { id: "internetworking-31", d: 3, type: "short", src: "ch1-P34",
    q: "P34: Skype lets you call an ordinary phone from a PC, so the voice must pass through both the Internet and the telephone network. Discuss how this might be done.",
    a: "The PC's client digitizes the voice and sends it as packets over the packet-switched Internet to a gateway that is attached to both the Internet and the telephone network (ideally near the called phone). The gateway turns the dialed number into telephone-network signaling and places a call over the circuit-switched telephone network. It then converts the voice packets into the phone network's format, and converts the phone's voice into packets for the reverse direction.",
    keys: ["gateway", "packet|Internet|VoIP", "telephone network|circuit|phone network", "convert|translate|format"],
    why: "This is internetworking across different switching technologies: a gateway sits on both networks and translates between them, the way a router re-encapsulates between link technologies. Placing the gateway near the destination keeps most of the path on the cheaper packet-switched Internet. Kurose notes that phone companies already use packet switching for the expensive overseas portion of calls." },

  { id: "internetworking-32", d: 2, type: "mc", src: "text",
    q: "Kurose describes the Internet as a “network of networks”: access ISPs interconnected through higher-tier ISPs, each managed independently. What do all these ISP networks have in common that makes them one Internet?",
    choices: [
      "Each reserves circuits for its customers' traffic",
      "They are all owned by the same company",
      "Each uses the same link-layer technology",
      "Each runs the IP protocol and conforms to certain naming and address conventions"
    ],
    a: 3,
    why: "Kurose §1.1.1: each ISP network, upper-tier or lower-tier, is managed independently, **runs the IP protocol**, and conforms to certain naming and address conventions. That shared IP layer is the lecture's common internetwork packet. Link technologies, owners and business models all differ." }
]);
