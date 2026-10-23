NET.addSection({
  id: "internetworking",
  unit: 1,
  order: 4,
  title: "Internetworking & universal service",
  short: "Internetworking",
  cheat: "p.34–47",
  text: "§1.3.3, §1.5 (connections)",
  minutes: 25,
  summary: "Why no single network technology serves every need (LAN vs WAN), why unconnected networks create the island problem, why heterogeneous networks can't simply be wired or bridged together, and how routers plus Internet protocols build one virtual network that delivers universal service. Learn the definitions (universal service, internetwork, router, intranet, virtual network) closely, plus the reasons for multiple routers and the factors behind topology choice.",
  mustKnow: [
    "No single technology fits every need. A [[LAN]] is optimized for high speed over short distances, a [[WAN]] for long distances, so organizations use [[multiple physical networks]].",
    "[[Universal service]]: a user on any computer in any organization can send to any other user, like any telephone calling any other telephone.",
    "The [[island problem]]: with unconnected networks, a computer reaches only its own network, so users had to [[physically move]] to a computer on the other network.",
    "Heterogeneous networks can't be joined [[by wires or bridging]], because each technology has its own [[packet (frame) format and addressing]].",
    "[[Internetworking]] uses hardware ([[routers]]) to interconnect networks and software ([[protocols]]) to communicate across them. The result is an internetwork, or internet.",
    "Routers carry a [[common internetwork packet]] and [[re-encapsulate]] it in each link's native frame, so [[link-level compatibility]] is not required.",
    "A router is dedicated hardware with a [[processor]], [[memory]], and [[an interface for each network]].",
    "Multiple routers give [[load balancing and performance]] plus [[redundancy]] (no single point of failure). Protocol software reroutes around failures.",
    "Topology depends on: [[bandwidth of the networks]], [[expected traffic]], [[reliability requirements]], cost, and router performance.",
    "An [[intranet]] is a private organization's internet for its employees. The [[Internet]] (capital I) is the global one. The line between them is blurred: same equipment and protocols, and gateways connect them.",
    "An internet is a [[virtual network]]: software hides [[physical connections, physical addresses and routing]], giving the illusion of one seamless, uniform network."
  ],
  topics: [
    {
      title: "Network technology trade-offs: LAN vs WAN",
      src: "cheat",
      blocks: [
        { p: "No single networking technology meets every requirement. Engineers trade off speed, distance and cost:" },
        { table: {
            head: ["", "LAN (local area network)", "WAN (wide area network)"],
            rows: [
              ["Optimized for", "[[High-speed]] communication over [[short distances]]", "Communication over [[long distances]]"],
              ["Typical use", "A building or campus", "Linking sites across cities or countries"]
            ] } },
        { p: "So large organizations with varied needs run [[multiple physical networks]] and choose the best network type for each task. That immediately raises the question of how a computer on one network talks to a computer on another." },
        { trap: "“Use one technology everywhere” is not the answer: no technology is best at both high speed over short range and long distance at reasonable cost. The answer is to interconnect different networks." }
      ]
    },
    {
      title: "Universal service and the island problem",
      src: "both",
      blocks: [
        { def: "Universal service", text: "The ability for a user on [[any computer in any organization]] to send messages or data to [[any other user]]. It is analogous to the [[telephone system]], which lets any telephone communicate with any other telephone." },
        { p: "**The island problem:** when multiple networks are not interconnected, each network acts as a [[separate island]]. A computer can communicate only with computers on the [[same network]]. Sending a message to someone on another network meant [[physically moving to a computer on that network]], which reduced user satisfaction and productivity." },
        { p: "Why universal service is worth so much (Problem P19): if each of n users sends one message to each of the other users, there are [[n(n − 1)]] messages, which grows like [[n^{2}]]. This supports Metcalfe's law, which says a network's value is proportional to the square of its number of users. Joining islands into one internet makes the whole far more valuable than the separate pieces." },
        { example: {
            q: "Two separate islands have 50 users each. Using the P19 model (each user sends one message to every user it can reach), how many messages are possible before and after the islands are interconnected?",
            a: "Before: each island has 50 × 49 = 2,450 messages, so 2 × 2,450 = 4,900 in total.\nAfter: one network of 100 users gives 100 × 99 = 9,900 messages.\nInterconnecting roughly doubles the possible communication (4,900 → 9,900) without adding a single user. That is the payoff of universal service." } }
      ]
    },
    {
      title: "Heterogeneous network incompatibility",
      src: "cheat",
      blocks: [
        { p: "Universal service does **not** require everyone to use a single network technology. But heterogeneous technologies [[cannot simply be joined]] by connecting wires or by bridging. Each technology has its own [[packet format]] and its own [[addressing method]], and a frame built for one technology [[cannot be transmitted]] on a network that uses a different technology." },
        { table: {
            head: ["Network (cheat-sheet Figure 24)", "Frame layout", "Addressing"],
            rows: [
              ["Ethernet LAN", "Dest · Src · Type · Data · FCS", "Two address fields (destination, source)"],
              ["Wi-Fi WLAN", "Frame control · Duration · Addr1 · Addr2 · Addr3 · Data · FCS", "Three address fields"],
              ["WAN", "Flag · Address · Control · Data · FCS", "A single address field"]
            ] },
          caption: "Figure 24: “direct connection fails” between these networks because the frame formats and addressing differ; routers interconnect them into an internetwork." },
        { trap: "Plugging an Ethernet cable into a WAN line doesn't connect the networks. The WAN equipment can't parse an Ethernet frame (different fields, different address scheme). Something must translate between them, and that something is a router running internet protocols." }
      ]
    },
    {
      title: "Internetworking: routers and a common packet",
      src: "both",
      blocks: [
        { def: "Internetworking", text: "Enables universal service across different network technologies by using [[hardware to interconnect the networks]] and [[software to enable communication]] across them. The connected networks form an [[internetwork]], or internet." },
        { p: "The key trick: routers carry a [[common internetwork packet]] and [[re-encapsulate]] it in the native frame required on each link. So an internetwork can connect networks that cannot exchange native frames, and [[link-level compatibility is not required]] for internetwork communication." },
        { p: "In Kurose's terms, the common packet is the [[IP datagram]]. The link layer may differ on every link (Ethernet on one, PPP on the next), and a router implements layers 1–3. It removes the incoming frame's link header, reads the datagram's destination IP address, and puts the **same datagram** into a **new frame** for the outgoing link." },
        { steps: [
          "Host A (on an Ethernet LAN) puts the IP datagram inside an [[Ethernet frame]] addressed to router R1.",
          "R1 strips the Ethernet frame, reads the destination IP address, and wraps the datagram in a [[WAN frame]] for the long-distance link to R2.",
          "R2 strips the WAN frame and wraps the same datagram in a [[Wi-Fi frame]] for the wireless LAN.",
          "Host B removes the Wi-Fi frame and passes the datagram up its stack. The datagram crossed three incompatible networks, yet no frame ever left its own network."
        ], title: "A datagram crossing Ethernet → WAN → Wi-Fi" },
        { p: "Scale: an internet may contain [[a few networks]] or, like the global Internet, [[tens of thousands]]. Each network may contain anywhere from [[no computers to hundreds]]." },
        { game: "encap", text: "Practice what a router strips and rebuilds and what survives end to end." }
      ]
    },
    {
      title: "Routers and internet design",
      src: "cheat",
      blocks: [
        { def: "Router", text: "The [[primary device]] used to connect heterogeneous networks. It is a dedicated hardware system with a [[processor]], [[memory]], and an [[interface for each network]] it connects." },
        { p: "Why deploy **multiple** routers rather than one?" },
        { list: [
          "[[Load balancing]] and improved performance: traffic is spread across routers.",
          "[[Redundancy]]: protection against a [[single point of failure]]. Protocol software [[monitors connections]] and [[reroutes traffic]] when a network or router fails."
        ] },
        { p: "The choice of internet topology (which networks connect through which routers) depends on:" },
        { list: [
          "the [[bandwidth]] of the physical networks,",
          "the [[expected traffic]],",
          "the organization's [[reliability requirements]],",
          "[[cost]],",
          "the [[performance of available router hardware]]."
        ] },
        { example: {
            q: "A company joins four LANs with a single central router. What are the risks, and what would you change?",
            a: "That single router is a single point of failure: if it fails, no LAN can reach any other, and the company is back to the island problem. All inter-LAN traffic also funnels through one box, which can become a performance bottleneck.\nFix: add routers and redundant paths so traffic can be load-balanced, and let routing protocol software detect a failed router or network and reroute around it. How many routers and which links depend on the networks' bandwidth, the expected traffic, the reliability requirements, cost and router performance." } }
      ]
    },
    {
      title: "Intranet versus Internet",
      src: "cheat",
      blocks: [
        { table: {
            head: ["Term", "Meaning"],
            rows: [
              ["internet (lowercase)", "Any internetwork: networks interconnected by routers"],
              ["[[Internet]] (uppercase I)", "The current [[global Internet]] and its associated protocols"],
              ["[[intranet]]", "An internet [[owned by a private organization]], intended for use only by the organization's [[employees]]"]
            ] } },
        { p: "The distinction is [[blurred]], for two reasons. Organizations use the [[same equipment and protocol software]] for their intranets that ISPs use for the global Internet. And organizational intranets often [[connect to the global Internet through gateways]]." },
        { trap: "An intranet is not a different technology. It runs the same TCP/IP protocols on the same kind of routers. What makes it an intranet is **who owns it and who may use it**." }
      ]
    },
    {
      title: "Universal service and virtual networks",
      src: "cheat",
      blocks: [
        { p: "Internet protocols enable universal service by [[resolving differences in frame formats and physical addresses]] between the underlying networks. Networks using different technologies can then communicate, provided the [[routers agree to forward]] information." },
        { def: "Virtual network system", text: "An internet is an [[abstraction]] of the communication system. Internet software [[hides physical network connections, physical addresses, and routing information]], giving users and application programs the [[illusion of a single seamless, uniform network]]." },
        { table: {
            head: ["User's view (virtual)", "Actual structure (physical)"],
            rows: [
              ["One big network with every host attached to it", "Many separate physical networks of different technologies"],
              ["Hosts identified by one uniform kind of address (IP address)", "Each network has its own physical address format"],
              ["Just send to the destination", "Routers forward packets hop by hop using forwarding tables"]
            ] } },
        { p: "This is the same idea as the socket API in the foundations section: an application sees one uniform network service and never deals with Ethernet vs Wi-Fi vs WAN frames." }
      ]
    },
    {
      title: "Connecting to Kurose: the Internet as a network of networks",
      src: "text",
      blocks: [
        { p: "Kurose (§1.1.1, §1.3.3) describes the same idea at global scale. End systems connect through access ISPs, and the access ISPs must themselves be interconnected. The result is a [[network of networks]], and understanding that phrase is the key to understanding the Internet. Each ISP network is [[managed independently]], but every one [[runs the IP protocol]] and conforms to certain naming and address conventions. That shared IP layer is the common internetwork packet that makes universal service possible." },
        { p: "This connects to §1.5: routers implement layers 1–3, there is [[only one IP protocol]] that every network-layer component must run, and different links can use [[different link-layer protocols]]. That is exactly the lecture's “common packet, re-encapsulated per link”." },
        { p: "Internetworking can even bridge different **switching** paradigms. To place a call from a PC to an ordinary phone (Problem P34), voice travels as packets over the packet-switched Internet to a [[gateway]] connected to both networks. The gateway converts it into the telephone network's format and places a call over the [[circuit-switched]] telephone network to the phone, and does the reverse for the other direction." }
      ]
    }
  ],
  recall: [
    { q: "LAN vs WAN: what is each optimized for?", a: "LAN: high-speed communication over short distances. WAN: communication over long distances." },
    { q: "Why do large organizations run multiple physical networks?", a: "No single technology meets every requirement, so they choose the best network type for each task." },
    { q: "Define universal service. What is the analogy?", a: "Any user on any computer in any organization can send messages or data to any other user. Like the telephone system: any phone can call any phone." },
    { q: "What is the island problem?", a: "Unconnected networks are separate islands: a computer can only reach computers on its own network, so users had to physically move to a computer on the other network." },
    { q: "Does universal service require a single network technology?", a: "No." },
    { q: "Why can't heterogeneous networks be joined by wires or bridging?", a: "Each technology has its own packet (frame) format and addressing method, so a frame for one can't be transmitted on another." },
    { q: "Define internetworking.", a: "Using hardware to interconnect networks and software to communicate across them, giving universal service. The result is an internetwork (internet)." },
    { q: "How does an internet connect networks that can't exchange native frames?", a: "Routers carry a common internetwork packet and re-encapsulate it in each link's native frame, so link-level compatibility isn't needed." },
    { q: "How big can an internet be?", a: "From a few networks to tens of thousands (the Internet). Each network may have no computers or hundreds." },
    { q: "Define a router.", a: "The primary device that connects heterogeneous networks: dedicated hardware with a processor, memory and an interface for each network." },
    { q: "Two reasons for multiple routers?", a: "Load balancing and performance; redundancy (no single point of failure), with software rerouting on failure." },
    { q: "Five factors in choosing an internet topology?", a: "Bandwidth of the physical networks, expected traffic, reliability requirements, cost, router hardware performance." },
    { q: "Intranet vs Internet?", a: "Intranet: owned by a private organization for its employees only. Internet (capital I): the current global Internet and its protocols." },
    { q: "Why is the intranet/Internet distinction blurred?", a: "Same equipment and protocol software as ISPs use, and intranets often connect to the Internet through gateways." },
    { q: "How do Internet protocols enable universal service?", a: "By resolving differences in frame formats and physical addresses between networks (routers must agree to forward)." },
    { q: "Why is an internet a virtual network system?", a: "Software hides physical connections, physical addresses and routing, giving the illusion of one seamless, uniform network." },
    { q: "P19: n users each message every other user. How many messages?", a: "n(n − 1), about n^{2}, which is consistent with Metcalfe's law." }
  ]
});
