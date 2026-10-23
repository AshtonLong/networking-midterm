NET.addQuestions("layers", [
  { id: "layers-01", d: 1, type: "order", src: "cheat",
    q: "Order the five layers of the Internet protocol stack from top to bottom.",
    items: ["Application", "Transport", "Network", "Link", "Physical"],
    why: "Top to bottom: application, transport, network, link, physical. Kurose's book is organized top-down in this order: Chapter 2 is the application layer, Chapter 3 transport, and so on." },

  { id: "layers-02", d: 1, type: "mc", src: "cheat",
    q: "What is the packet at the **transport** layer called?",
    choices: [
      "Datagram",
      "Message",
      "Segment",
      "Frame"
    ],
    a: 2,
    why: "Transport layer gives a **segment**. Message = application, datagram = network, frame = link. Kurose uses “segment” for both TCP and UDP and reserves “datagram” for the network layer." },

  { id: "layers-03", d: 1, type: "mc", src: "ch1-R24",
    q: "What is a network-layer **datagram**?",
    choices: [
      "A link-layer header plus a network-layer packet (H_{l}H_{n}H_{t}M)",
      "An application message plus a transport header (H_{t}M)",
      "The raw bits on the physical medium",
      "A transport-layer segment plus a network-layer header (H_{n}H_{t}M)"
    ],
    a: 3,
    why: "The network layer takes the segment (H_{t}M) from transport and adds H_{n} (e.g. source and destination IP addresses), forming the datagram H_{n}H_{t}M. H_{t}M is a segment and H_{l}H_{n}H_{t}M is a frame." },

  { id: "layers-04", d: 2, type: "short", src: "ch1-R24",
    q: "R24: What is an application-layer message? A transport-layer segment? A network-layer datagram? A link-layer frame?",
    a: "A message is the data an application sends to its peer application (e.g. an HTTP request). A segment is a transport-layer packet: a transport header plus the application message. A datagram is a network-layer packet: a network header plus the segment. A frame is a link-layer packet: a link-layer header plus the datagram.",
    keys: ["message|application data", "segment|transport header", "datagram|network header", "frame|link header|link-layer header"],
    why: "Each PDU is the layer's header plus, as payload, the PDU from the layer above: M, then H_{t}M, then H_{n}H_{t}M, then H_{l}H_{n}H_{t}M. This is encapsulation, and the nesting is what the cheat sheet's matryoshka figure shows." },

  { id: "layers-05", d: 2, type: "short", src: "ch1-R23",
    q: "R23: What are the five layers in the Internet protocol stack? What are the principal responsibilities of each?",
    a: "Application: network applications and their protocols (HTTP, SMTP, DNS) exchanging messages. Transport: moves application messages between application endpoints, process to process (TCP: reliable, flow and congestion control; UDP: no frills). Network: moves datagrams from source host to destination host through routers (IP plus routing protocols). Link: moves frames from one node to the adjacent node over a single link (Ethernet, Wi-Fi, PPP). Physical: moves the individual bits across the medium.",
    keys: ["application", "transport|process", "network|host to host|route", "link|adjacent|neighbo", "physical|bits"],
    why: "One line per layer is enough. Add the PDU for full marks: message, segment, datagram, frame (bits for physical). Link vs physical is easy to blur: the link layer moves the whole frame one hop, and the physical layer moves its individual bits." },

  { id: "layers-06", d: 3, type: "short", src: "ch1-R22",
    q: "R22: List five tasks that a layer can perform. Is it possible that one (or more) of these tasks could be performed by two (or more) layers?",
    a: "Error control, flow control, segmentation and reassembly, multiplexing, and connection setup. Yes: the same task can be done at more than one layer. For example, error control is done per link by some link-layer protocols and end to end by TCP.",
    keys: ["error", "flow", "segment|reassembl", "multiplex", "connection setup|connection", "yes|more than one|both layers|duplicat"],
    why: "Kurose names this duplication as a drawback of layering: “many protocol stacks provide error recovery on both a per-link basis and an end-to-end basis.” Congestion control and routing/addressing are acceptable extra examples of layer tasks." },

  { id: "layers-07", d: 2, type: "mc", src: "ch1-R22",
    q: "Which is the textbook's example of a task performed by more than one layer?",
    choices: [
      "Error recovery, done both per link (link layer) and end to end (transport layer)",
      "Routing, done both by the application layer and the physical layer",
      "Port numbering, done both by Ethernet and by IP",
      "Bit encoding, done both by TCP and by HTTP"
    ],
    a: 0,
    why: "Kurose: many stacks provide error recovery both per link and end to end. That duplication is listed as a drawback of layering. The other options pair functions with layers that don't perform them (routing is network layer, bit encoding is physical, ports are transport)." },

  { id: "layers-08", d: 1, type: "mc", src: "ch1-R25",
    q: "R25: Which layers of the Internet protocol stack does a **router** process?",
    choices: [
      "Network and transport only",
      "All five layers",
      "Physical, link and network (layers 1–3)",
      "Physical and link only (layers 1–2)"
    ],
    a: 2,
    why: "Routers implement layers 1 through 3, so they can run IP (layer 3) and forward on IP addresses. They don't implement transport or application, which run only in hosts." },

  { id: "layers-09", d: 1, type: "mc", src: "ch1-R25",
    q: "R25: Which layers does a **link-layer switch** process?",
    choices: [
      "All five layers",
      "Physical, link and network (layers 1–3)",
      "Physical and link (layers 1–2)",
      "Only the physical layer"
    ],
    a: 2,
    why: "Link-layer switches implement layers 1 and 2. They recognize layer-2 addresses such as Ethernet addresses, but not IP addresses. Routers go one layer higher, to 3." },

  { id: "layers-10", d: 1, type: "tf", src: "ch1-R25",
    q: "R25: A host processes all five layers of the Internet protocol stack.",
    a: true,
    why: "True. Hosts implement all five layers (application down to physical). This is consistent with the Internet architecture putting much of its complexity at the network edge." },

  { id: "layers-11", d: 2, type: "multi", src: "cheat",
    q: "Which of the following are **application-layer** protocols? Select all that apply.",
    choices: [
      "DNS",
      "IMAP",
      "HTTP",
      "PPP",
      "TCP",
      "SMTP"
    ],
    a: [0, 1, 2, 5],
    why: "The lecture's application-layer examples are HTTP, IMAP, SMTP and DNS. TCP is transport and PPP is link. DNS is a classic trap: it performs a network function (name to address translation), but it is an application-layer protocol running on end systems." },

  { id: "layers-12", d: 1, type: "mc", src: "cheat",
    q: "PPP belongs to which layer?",
    choices: [
      "Transport",
      "Link",
      "Network",
      "Application"
    ],
    a: 1,
    why: "Lecture link-layer examples: Ethernet, Wi-Fi, **PPP**. These protocols move data between neighboring devices over a single link." },

  { id: "layers-13", d: 2, type: "mc", src: "cheat",
    q: "Which layer “routes datagrams across interconnected networks” and includes IP and routing protocols?",
    choices: [
      "Link",
      "Network",
      "Transport",
      "Application"
    ],
    a: 1,
    why: "That is the network layer: IP plus routing protocols, moving datagrams host to host. Transport is process to process. Link moves frames between neighboring devices. Application defines message formats and meanings." },

  { id: "layers-14", d: 2, type: "mc", src: "cheat",
    q: "What service does the **transport** layer provide?",
    choices: [
      "Transfer of frames between neighboring devices",
      "Host-to-host routing of datagrams across networks",
      "Transmission of bits through the physical medium",
      "Process-to-process data transfer between applications"
    ],
    a: 3,
    why: "Transport (TCP, UDP) delivers data between **processes**. The network layer is host to host, the link layer is neighbor to neighbor, and the physical layer moves bits. “Process-to-process vs host-to-host” is one of the most frequently tested distinctions." },

  { id: "layers-15", d: 1, type: "mc", src: "cheat",
    q: "Which is the lecture's definition of a **protocol suite** (protocol family)?",
    choices: [
      "A list of the port numbers used by applications",
      "A set of protocols, each handling a specific networking function, that work together to cover all aspects of communication in a coordinated manner",
      "A single protocol that handles every networking function",
      "The hardware that implements the physical layer"
    ],
    a: 1,
    why: "A suite divides the work: each protocol takes one function, and together they cover everything. TCP/IP is the Internet's suite. The defining idea is that no single protocol does it all." },

  { id: "layers-16", d: 1, type: "mc", src: "cheat",
    q: "According to the lecture, what does a **layered reference model** do?",
    choices: [
      "Organizes a complex system by defining its components and their relationships",
      "Specifies the exact bit rate of every link",
      "Guarantees that packets are never lost",
      "Assigns IP addresses to hosts"
    ],
    a: 0,
    why: "A layered reference model is an organizing tool. It defines the components (layers) and how they relate (each uses the one below and serves the one above). It doesn't fix bit rates, guarantee delivery or assign addresses." },

  { id: "layers-17", d: 2, type: "mc", src: "cheat",
    q: "Why does modularization in a layered model simplify maintenance and updates?",
    choices: [
      "Every layer is implemented in hardware, so it never needs updates",
      "All layers share a single header, so only one field changes",
      "Layers can skip the layer below to save time",
      "Changes within one layer are transparent to the other layers"
    ],
    a: 3,
    why: "As long as a layer keeps offering the same service to the layer above and uses the same service below, its implementation can change without the others noticing. For example, a new Wi-Fi version doesn't require changes to TCP." },

  { id: "layers-18", d: 2, type: "order", src: "cheat",
    q: "Order the encapsulation steps at the **source** host.",
    items: [
      "Application creates message M",
      "Transport adds H_{t}, forming the segment H_{t}M",
      "Network adds H_{n}, forming the datagram H_{n}H_{t}M",
      "Link adds H_{l}, forming the frame H_{l}H_{n}H_{t}M",
      "The frame's bits are transmitted using physical-layer services"
    ],
    why: "Headers are added on the way **down**, each wrapping everything above it, so the outermost header belongs to the lowest layer. At the receiver the steps run in reverse (de-encapsulation)." },

  { id: "layers-19", d: 3, type: "mc", src: "cheat",
    q: "According to the lecture, what kind of information does the **network** header H_{n} carry, compared with the transport header H_{t}?",
    choices: [
      "Both carry exactly the same information",
      "H_{n}: the application's message format. H_{t}: the physical signal encoding",
      "H_{n}: the link-layer address of the next hop. H_{t}: the IP addresses",
      "H_{n}: information needed for delivery across networks (e.g. source and destination host addresses). H_{t}: information needed to provide transport services"
    ],
    a: 3,
    why: "The cheat sheet's wording: the transport header contains information needed to provide transport services (Kurose: which application to deliver to, error-detection bits), and the network header contains information needed for delivery across networks (source and destination end-system addresses). Next-hop link addresses belong in the link header H_{l}." },

  { id: "layers-20", d: 2, type: "tf", src: "cheat",
    q: "The network layer delivers the transport segment between hosts using link-layer services.",
    a: true,
    why: "True. This is the lecture's layer service dependency: transport delivers messages between processes using network services; network delivers segments between hosts using link services; link transfers the datagram between neighboring devices; the frame goes out using physical-layer services." },

  { id: "layers-21", d: 1, type: "mc", src: "cheat",
    q: "An application message is split into **three** transport segments, all sent over the same link. What is normally added on that link?",
    choices: [
      "One network header but three sets of link-layer overhead",
      "One network header and one set of link-layer overhead shared by all three segments",
      "Three network headers and three sets of link-layer overhead",
      "Three network headers but only one set of link-layer overhead"
    ],
    a: 2,
    why: "Each segment travels in its **own** datagram, and each datagram in its **own** frame. So you pay network and link overhead once per segment: 3 and 3. This holds absent aggregation or other special mechanisms." },

  { id: "layers-22", d: 2, type: "num", src: "cheat",
    q: "A message is split into 4 transport segments, each sent separately over the same link. Counting transport, network and link-layer headers together, how many headers cross that link?",
    a: 12, unit: "headers",
    why: "Each segment has 1 transport header and travels in its own datagram (1 network header) inside its own frame (1 link header): 3 headers per segment.\n4 segments × 3 = 12 headers." },

  { id: "layers-23", d: 3, type: "num", src: "cheat",
    q: "A 6,000-byte application message is sent in segments carrying at most 1,460 bytes of data each. Each segment gets a 20-byte transport header, a 20-byte network header and 18 bytes of link-layer header plus trailer. How many bytes in total cross the first link?",
    a: 6290, unit: "bytes",
    why: "Segments needed = ⌈6,000 / 1,460⌉ = 5 (4 × 1,460 = 5,840, plus one more segment for the last 160 bytes).\nOverhead per segment = 20 + 20 + 18 = 58 bytes. Total overhead = 5 × 58 = 290 bytes.\nTotal = 6,000 + 290 = 6,290 bytes." },

  { id: "layers-24", d: 3, type: "num", src: "cheat",
    q: "A 1,200-byte message is sent as one segment with a 20-byte transport header, a 20-byte network header and 18 bytes of link-layer header plus trailer. What percentage of the frame is application data? Answer in %.",
    a: 95.39, unit: "%", tol: 0.01,
    why: "Frame size = 1,200 + 20 + 20 + 18 = 1,258 bytes.\nEfficiency = 1,200 / 1,258 = 0.9539, so 95.4%.\nOverhead = 58 / 1,258 ≈ 4.6%." },

  { id: "layers-25", d: 2, type: "num", src: "cheat",
    q: "A chat app sends a 40-byte message in its own segment (20-byte transport header, 20-byte network header, 18 bytes of link overhead). What percentage of the frame is application data? Answer in %.",
    a: 40.82, unit: "%", tol: 0.01,
    why: "Frame = 40 + 58 = 98 bytes. Efficiency = 40 / 98 ≈ 40.8%.\nMore than half the bytes are headers. Small messages carry high header overhead relative to their data." },

  { id: "layers-26", d: 3, type: "num", src: "cheat",
    q: "A 4,000-byte message is split into 4 equal segments. Headers: 20-byte transport, 20-byte network, 26 bytes of link-layer overhead. How many bytes of overhead (all headers and trailers) cross the first link?",
    a: 264, unit: "bytes",
    why: "Per segment: 20 + 20 + 26 = 66 bytes, and each of the 4 segments gets its own datagram and frame.\nOverhead = 4 × 66 = 264 bytes (total on the link 4,264 bytes, about 93.8% efficient). Sending one 4,000-byte segment would cost only 66 bytes of overhead." },

  { id: "layers-27", d: 3, type: "num", src: "text",
    q: "A datagram travels host A → switch → router R1 → router R2 → switch → router R3 → host B. Counting host A's original encapsulation, how many times is a **new link-layer frame** (new link header) built for this datagram?",
    a: 4, unit: "frames",
    why: "A new link header is built by every device that goes up to layer 3 and sends on, plus the source: host A (1), R1 (2), R2 (3), R3 (4).\nLink-layer switches only process layers 1–2. They forward the frame they received rather than de-encapsulating to the datagram and building a new frame.\nAnswer: 4." },

  { id: "layers-28", d: 3, type: "mc", src: "text",
    q: "On the same path (A → switch → R1 → R2 → switch → R3 → B), where is the datagram's network-layer header H_{n} added?",
    choices: [
      "Only at router R3, the last router",
      "At host A and again at every router",
      "At every switch and router",
      "Only at host A. Routers read it to forward but don't add another network header"
    ],
    a: 3,
    why: "Encapsulation into a datagram happens once, at the source. Routers de-encapsulate only the link layer, read H_{n} (the destination IP address), and re-encapsulate the **same datagram** in a new frame. The common internetwork packet survives end to end while the frames change hop by hop." },

  { id: "layers-29", d: 2, type: "mc", src: "text",
    q: "Which two layers of the 7-layer OSI model are **not** present in the Internet protocol stack?",
    choices: [
      "Session and data link",
      "Presentation and transport",
      "Presentation and session",
      "Network and session"
    ],
    a: 2,
    why: "OSI layers: application, presentation, session, transport, network, data link, physical. The Internet's five drop **presentation** and **session**. Data link corresponds to the Internet's link layer." },

  { id: "layers-30", d: 1, type: "order", src: "text",
    q: "Order the seven layers of the OSI reference model from top to bottom.",
    items: ["Application", "Presentation", "Session", "Transport", "Network", "Data link", "Physical"],
    why: "Mnemonic: “All People Seem To Need Data Processing.” The presentation and session layers sit between application and transport, and those are the two the Internet stack lacks." },

  { id: "layers-31", d: 2, type: "mc", src: "text",
    q: "Which services belong to the OSI **presentation** layer?",
    choices: [
      "Delimiting and synchronization of data exchange, including checkpointing and recovery",
      "Routing datagrams between hosts",
      "Moving frames between adjacent nodes",
      "Data compression, data encryption and data description"
    ],
    a: 3,
    why: "The presentation layer lets communicating applications interpret the meaning of exchanged data: compression, encryption and data description. Delimiting, synchronization and checkpointing belong to the **session** layer. Routing datagrams and moving frames between adjacent nodes are the network and link layers." },

  { id: "layers-32", d: 2, type: "mc", src: "text",
    q: "Which service belongs to the OSI **session** layer?",
    choices: [
      "Delimiting and synchronization of data exchange, including a means to build checkpointing and recovery",
      "Translating hostnames into IP addresses",
      "Data compression and encryption",
      "Error detection on a single link"
    ],
    a: 0,
    why: "Session layer: delimiting and synchronization of data exchange, plus checkpointing and recovery. Compression and encryption are presentation. Name translation is DNS, an Internet application-layer protocol. Per-link error detection is the link layer." },

  { id: "layers-33", d: 2, type: "short", src: "text",
    q: "Name the two OSI layers missing from the Internet stack, say what each does, and explain who provides those services for an Internet application that needs them.",
    a: "The presentation layer helps applications interpret exchanged data (compression, encryption, data description). The session layer provides delimiting and synchronization of data exchange, including checkpointing and recovery. The Internet stack has neither, so if an application needs these services, the application developer must build them into the application.",
    keys: ["presentation", "session", "compress|encrypt|data description|interpret", "synchroniz|delimit|checkpoint|recovery", "developer|application itself|built into the application"],
    why: "The Internet's design choice is to leave these optional functions to the application rather than force them on every app. For example, an app that needs encryption uses a library (such as TLS) inside the application, not a separate network layer." },

  { id: "layers-34", d: 2, type: "multi", src: "text",
    q: "Which are potential **drawbacks** of protocol layering according to Kurose? Select all that apply.",
    choices: [
      "Layering makes it impossible to discuss system components in a structured way",
      "Functionality at one layer may need information (e.g. a timestamp) that is present only in another layer, violating the separation of layers",
      "One layer may duplicate lower-layer functionality, e.g. error recovery both per link and end to end",
      "Changing one layer's implementation forces every other layer to change"
    ],
    a: [1, 2],
    why: "Kurose's two drawbacks are duplication and cross-layer information needs. The other two options contradict the **advantages** of layering: modularity, meaning a layer's implementation can change without affecting the others, and a structured way to discuss a complex system." },

  { id: "layers-35", d: 1, type: "mc", src: "text",
    q: "In a layered architecture, how does each layer provide its service?",
    choices: [
      "By calling the services of the layer directly above",
      "By talking directly to the physical layer, bypassing the layers in between",
      "By re-implementing every lower layer itself",
      "By performing actions within that layer and by using the services of the layer directly below"
    ],
    a: 3,
    why: "Kurose, using the airline example: each layer provides its service by (1) performing certain actions within that layer and (2) using the services of the layer directly below it. The gate layer, for instance, loads people and relies on the runway-to-runway service." },

  { id: "layers-36", d: 3, type: "short", src: "ch1-P30",
    q: "P30: Consider the airline analogy for layering and the addition of headers to PDUs as they flow down the protocol stack. Is there an equivalent notion of header information added to passengers and baggage as they move down the airline protocol stack?",
    a: "Yes. As a passenger moves down the airline layers, each layer attaches information that its peer layer at the arrival airport uses. The ticket layer issues a ticket (name, flight, destination). The baggage layer puts a baggage tag (destination airport, flight, claim number) on each bag and gives the passenger the matching claim stub. The gate layer issues a boarding pass and seat assignment. At the destination, the peer layers use and remove this information (bags are matched to claim stubs), which is like de-encapsulation.",
    keys: ["yes", "ticket", "baggage tag|bag tag|tag", "boarding pass|seat", "peer|arrival|destination|claim"],
    why: "A header carries information that the **same layer at the other end** needs. The baggage tag is the cleanest analogy: the check-in (baggage layer) attaches it, and the baggage-claim (baggage layer at the arrival airport) reads it, while the takeoff and routing layers never look at it, just as routers never read H_{t}." },

  { id: "layers-37", d: 2, type: "mc", src: "text",
    q: "Which layers are typically implemented in a network interface card (e.g. an Ethernet or Wi-Fi card)?",
    choices: [
      "Link and physical",
      "Application and transport",
      "Only the network layer",
      "Transport and network"
    ],
    a: 0,
    why: "Link and physical layers handle communication over a specific link, so they live in the NIC for that link. Application and transport are software in end systems. The network layer is a mix of hardware and software." },

  { id: "layers-38", d: 3, type: "tf", src: "text",
    q: "If a link-layer protocol provides reliable delivery, it provides the same service as TCP's reliable delivery.",
    a: false,
    why: "False. Link-layer reliable delivery works from the transmitting node, **over one link**, to the receiving node. TCP provides reliable delivery **end to end**, from one end system to another across many links. A packet can be delivered reliably on every link and still be lost inside a router (e.g. a buffer overflow), so end-to-end reliability is still needed." },

  { id: "layers-39", d: 3, type: "mc", src: "text",
    q: "A datagram is carried by Ethernet on its first link and by PPP on its next link. Which statement is correct?",
    choices: [
      "Each link must run the same link-layer protocol for IP to work",
      "The datagram must be converted to a TCP segment between the two links",
      "The network layer may receive a different service from each link-layer protocol along the route",
      "The physical layer decides which link protocol to use"
    ],
    a: 2,
    why: "Kurose: a datagram may be handled by different link-layer protocols on different links (Ethernet, then PPP), and the network layer receives a different service from each. IP doesn't care. The router simply re-frames the same datagram for each link." },

  { id: "layers-40", d: 2, type: "tf", src: "text",
    q: "There are many IP protocols in the Internet's network layer, and each ISP chooses which one to run.",
    a: false,
    why: "False. There is **only one IP protocol**, and all Internet components that have a network layer must run it. What varies is the **routing** protocols: there are many, and within its own network an administrator can run any routing protocol. IP is the glue that binds the Internet together." },

  { id: "layers-41", d: 3, type: "mc", src: "text",
    q: "A link-layer switch receives a frame. Which addresses can it recognize and use?",
    choices: [
      "Both IP addresses and port numbers",
      "Port numbers in the transport header",
      "IP addresses, but not Ethernet addresses",
      "Layer-2 addresses such as Ethernet addresses, but not IP addresses"
    ],
    a: 3,
    why: "Switches implement only layers 1–2. Kurose: link-layer switches do not recognize IP addresses but can recognize layer-2 addresses such as Ethernet addresses. Routers (layers 1–3) use IP addresses. Neither looks at port numbers." },

  { id: "layers-42", d: 3, type: "short", src: "text",
    q: "Describe what a link-layer switch does with an arriving frame and what a router does with one. Which headers does each examine, and does either build a new frame?",
    a: "A link-layer switch processes only up to layer 2. It reads the frame's link-layer (e.g. Ethernet) destination address and forwards the frame out the right port, without looking at the IP header. A router goes up to layer 3. It removes the link-layer header, reads the destination IP address in the datagram, looks it up in its forwarding table, and encapsulates the same datagram in a new link-layer frame for the outgoing link. Neither touches the transport header or the message.",
    keys: ["switch|layer 2|link layer", "Ethernet address|link-layer address|layer-2 address|MAC", "router|layer 3|network layer", "IP address|forwarding table", "new frame|new link|re-encapsulat|remove|strip"],
    why: "This is Figure 1.24 and the cheat sheet's “layer delivery across devices”. The router's strip-and-rebuild of the frame is also what makes internetworking work across different link technologies: the IP datagram is the common packet, and the frames are local to each link." },

  { id: "layers-43", d: 2, type: "mc", src: "text",
    q: "In the airline analogy, the gate layer changes to boarding passengers by height. What happens to the rest of the airline system?",
    choices: [
      "Nothing changes, because the gate layer still provides the same service (loading and unloading people); only its implementation changed",
      "The airplane-routing layer must take the new boarding order into account",
      "The baggage layer must start sorting bags by height",
      "Every layer must be redesigned, because the gate layer's service changed"
    ],
    a: 0,
    why: "This is Kurose's modularity example. Changing **how** a layer implements its service is hidden from the others as long as the service itself (loading and unloading people) and its use of the layer below stay the same. Changing the service itself would be different." },

  { id: "layers-44", d: 3, type: "mc", src: "text",
    q: "Layer n offers reliable delivery even though layer n − 1 below it is unreliable. According to Kurose, how is this possible?",
    choices: [
      "It isn't possible: no layer can be more reliable than the one below it",
      "Layer n bypasses layer n − 1 and talks to the physical layer directly",
      "Layer n − 1 must first be upgraded to be reliable",
      "Layer n uses layer n − 1's unreliable delivery and adds its own functions to detect and retransmit lost messages"
    ],
    a: 3,
    why: "A layer provides its service by performing its own actions plus using the service of the layer below. That is how TCP (transport) delivers reliably over IP's unreliable best-effort service: it detects losses and retransmits. Reliability can be **added** at a higher layer." },

  { id: "layers-45", d: 2, type: "mc", src: "text",
    q: "In Kurose's interoffice-memo analogy for encapsulation, what corresponds to the network-layer **datagram**?",
    choices: [
      "The postal envelope with the two branch offices' postal addresses, which contains the interoffice envelope",
      "The memo itself",
      "The interoffice envelope with Bob's name and department",
      "The receiving mailroom"
    ],
    a: 0,
    why: "Memo = message. Interoffice envelope (Bob's name and department) = segment. Postal envelope (branch-office postal addresses) = datagram, which encapsulates the segment just as the postal envelope holds the interoffice envelope. The receiving mailroom extracting the interoffice envelope is de-encapsulation." },

  { id: "layers-46", d: 1, type: "tf", src: "cheat",
    q: "The lecture's Figure 21 uses nested matryoshka dolls to show encapsulation: each layer's PDU contains the complete PDU of the layer above.",
    a: true,
    why: "True. The frame holds the datagram, which holds the segment, which holds the message, like dolls nested inside dolls. That is why a frame is written H_{l}H_{n}H_{t}M." },

  { id: "layers-47", d: 2, type: "tf", src: "cheat",
    q: "The physical layer's job is to move entire frames from one network device to the neighboring device.",
    a: false,
    why: "False. Moving the **whole frame** to the neighboring device is the **link** layer's job. The physical layer moves the **individual bits** of that frame through the medium and hardware. Its protocols depend on the medium: Ethernet has different physical-layer protocols for twisted pair, coax and fibre." }
]);
