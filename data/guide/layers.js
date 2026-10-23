NET.addSection({
  id: "layers",
  unit: 1,
  order: 3,
  title: "Protocol layers & encapsulation",
  short: "Layers",
  cheat: "p.19–29",
  text: "§1.5",
  minutes: 35,
  summary: "Why networks are organized as a stack of layers, what each of the five Internet layers does (example protocols and PDU names: message, segment, datagram, frame), how encapsulation wraps M into H_{t}M, H_{n}H_{t}M and H_{l}H_{n}H_{t}M, and which layers hosts, routers and link-layer switches implement. Also the 7-layer OSI model. Heavily tested: layer ↔ protocol ↔ PDU matching, which devices process which layers, layering pros and cons, and header-overhead reasoning.",
  mustKnow: [
    "The five layers from top to bottom: [[application, transport, network, link, physical]].",
    "PDU names: application [[message]], transport [[segment]], network [[datagram]], link [[frame]]. The physical layer moves individual bits.",
    "Examples: application HTTP, SMTP, IMAP, DNS; transport [[TCP, UDP]]; network [[IP and routing protocols]]; link [[Ethernet, Wi-Fi, PPP]].",
    "A layer provides its service by (1) [[performing actions within the layer]] and (2) [[using the services of the layer directly below]].",
    "Modularity: a layer's [[implementation]] can change without affecting the rest of the system, as long as its [[service]] stays the same.",
    "Drawbacks of layering: layers may [[duplicate lower-layer functionality]], and one layer may need [[information that lives only in another layer]].",
    "Encapsulation: M → [[H_{t}M]] (segment) → [[H_{n}H_{t}M]] (datagram) → [[H_{l}H_{n}H_{t}M]] (frame).",
    "Hosts implement [[all five]] layers, routers [[layers 1–3]], and link-layer switches [[layers 1–2]].",
    "A message split into 3 segments normally means [[3 network headers and 3 sets of link-layer overhead]] on one link.",
    "OSI has 7 layers. Its extra [[presentation]] and [[session]] layers are missing from the Internet stack, so the [[application developer]] supplies those functions if needed."
  ],
  topics: [
    {
      title: "Protocol suites and layered reference models",
      src: "cheat",
      blocks: [
        { def: "Protocol suite (protocol family)", text: "A set of protocols in which [[each protocol handles a specific networking function]] and the protocols [[work together]] to cover all aspects of communication in a coordinated manner. TCP/IP is the Internet's suite." },
        { def: "Protocol stack", text: "The protocols of the various layers, taken together (Kurose). The Internet protocol stack has [[five layers]]." },
        { def: "Layered reference model", text: "Organizes a complex system by defining its [[components and their relationships]]." },
        { p: "Modularization: in a layered model, [[changes within one layer are transparent to other layers]], which simplifies maintenance and updates. For example, swapping Wi-Fi for Ethernet doesn't require changing TCP or HTTP." }
      ]
    },
    {
      title: "The airline analogy (Figures 1.21–1.22)",
      src: "text",
      blocks: [
        { p: "An airline trip: ticket (purchase) → baggage (check) → gates (load) → runway takeoff → airplane routing … airplane routing → runway landing → gates (unload) → baggage (claim) → ticket (complain). Each function at the departure airport has a matching function at the arrival airport. Read horizontally, the functions form layers: [[ticket, baggage, gate, takeoff/landing, airplane routing]]." },
        { p: "Each layer, together with the layers below it, implements a service. The ticketing layer and below give airline-counter-to-airline-counter transfer of a person. The baggage layer and below give baggage-check-to-baggage-claim transfer of a person and bags, but only for [[already-ticketed]] people. The gate layer gives departure-gate-to-arrival-gate transfer. The takeoff/landing layer gives runway-to-runway transfer." },
        { def: "Service model", text: "The [[services a layer offers to the layer above]] it." },
        { p: "Each layer provides its service by (1) [[performing certain actions within that layer]] (the gate layer loads and unloads people) and (2) [[using the services of the layer directly below]] (the gate layer uses the runway-to-runway service). Networking example: layer n can offer reliable delivery by using layer n − 1's unreliable edge-to-edge delivery and adding functions to [[detect and retransmit lost messages]]. That is exactly how TCP builds reliability on top of unreliable IP." },
        { trap: "Changing a layer's **implementation** is not changing its **service**. If gates started boarding passengers by height, the rest of the airline system would be unchanged, because the gate layer still loads and unloads people. Only implementation changes are hidden from the other layers." }
      ]
    },
    {
      title: "Pros and cons of layering, and where layers live",
      src: "text",
      blocks: [
        { table: {
            head: ["Advantages", "Drawbacks"],
            rows: [
              ["A [[structured way to discuss]] a large, complex system's components", "One layer may [[duplicate lower-layer functionality]], e.g. error recovery both per link and end to end"],
              ["[[Modularity]]: it is easier to update one component, changing a layer's implementation without affecting the others", "Functionality at one layer may need [[information present only in another layer]] (e.g. a timestamp), which violates the separation of layers"]
            ] } },
        { p: "Generic tasks a layer can perform (Review Question R22). Congestion control and addressing/routing are further examples." },
        { list: [
          "[[Error control]]: detect (and possibly recover from) bit errors and losses.",
          "[[Flow control]]: keep a fast sender from overwhelming a slow receiver.",
          "[[Segmentation and reassembly]]: split large data units and rebuild them.",
          "[[Multiplexing]]: let several higher-layer users share one lower-layer service.",
          "[[Connection setup]]: establish state at both ends before data flows."
        ] },
        { p: "The **same task can appear at [[more than one layer]]**. Error control, for instance, is done per link by some link protocols and end to end by TCP." },
        { p: "Where layers are implemented: application- and transport-layer protocols are almost always [[software in the end systems]]. The link and physical layers handle one specific link, so they live in the [[network interface card]] (an Ethernet or Wi-Fi card). The network layer is a [[mix of hardware and software]]. A layer-n protocol is distributed across the end systems, packet switches and other components, so each of them often holds a piece of it." }
      ]
    },
    {
      title: "The five-layer Internet protocol stack",
      src: "both",
      blocks: [
        { diagram: "stack" },
        { table: {
            head: ["Layer", "Job", "Examples", "PDU"],
            rows: [
              ["5 Application", "Supports network applications; defines [[message formats and meanings]]", "HTTP, SMTP, IMAP, DNS, FTP", "[[Message]]"],
              ["4 Transport", "[[Process-to-process]] data transfer between application endpoints", "TCP, UDP", "[[Segment]]"],
              ["3 Network", "Moves datagrams [[host to host]], routing them across interconnected networks", "IP, routing protocols", "[[Datagram]]"],
              ["2 Link", "Moves a frame between [[neighboring]] devices, over one link", "Ethernet, Wi-Fi, PPP, DOCSIS", "[[Frame]]"],
              ["1 Physical", "Moves the [[individual bits]] of a frame through the medium", "Separate protocols per medium (twisted pair, coax, fibre)", "Bits"]
            ] },
          caption: "Top to bottom: application, transport, network, link, physical." },
        { list: [
          "**Application:** the protocol is distributed over multiple end systems, which exchange messages. DNS translates names like www.ietf.org into a [[32-bit]] network address. It is easy to create and deploy new application protocols.",
          "**Transport:** TCP is [[connection-oriented]]. It gives guaranteed delivery, flow control (sender/receiver speed matching), splits long messages into shorter segments, and does [[congestion control]] (a source throttles its rate when the network is congested). UDP is [[connectionless]] and no-frills: no reliability, no flow control, no congestion control.",
          "**Network:** the source transport layer hands the network layer a segment plus a destination address, just as you give the postal service a letter with an address. There is [[only one IP protocol]], and every Internet component with a network layer must run it. There are many routing protocols, and each network's administrator may run any of them. The layer is often just called the [[IP layer]] because IP is the glue that binds the Internet together.",
          "**Link:** at each node the network layer passes the datagram down to the link layer, which delivers it to the [[next node]], where it is passed back up. Link services depend on the protocol. Some provide reliable delivery over [[one link]], which is not the same as TCP's end-to-end reliability. A datagram may be handled by [[different link protocols]] on different links (Ethernet on one, PPP on the next), so the network layer gets a different service from each.",
          "**Physical:** its protocols depend on the link and on the actual [[transmission medium]]. Ethernet alone has separate physical-layer protocols for twisted pair, coax and fibre, and each moves a bit across the link differently."
        ] },
        { trap: "Kurose calls transport-layer packets **segments** for both TCP and UDP and reserves **datagram** for the network layer. Don't call an IP packet a segment or a TCP packet a frame." },
        { game: "match-blitz", text: "Sort protocols into layers at speed: HTTP, DNS, TCP, UDP, IP, Ethernet, Wi-Fi, PPP…" }
      ]
    },
    {
      title: "The OSI seven-layer reference model",
      src: "text",
      blocks: [
        { p: "The International Organization for Standardization (ISO) proposed the Open Systems Interconnection (OSI) model in the late 1970s. It has seven layers, top to bottom: [[application, presentation, session, transport, network, data link, physical]]. Five of them correspond roughly to the Internet's layers." },
        { def: "Presentation layer", text: "Lets communicating applications [[interpret the meaning of the data]] they exchange. Services include [[data compression]], [[data encryption]], and data description (so applications needn't worry about how data is formatted or stored internally)." },
        { def: "Session layer", text: "Provides [[delimiting and synchronization]] of data exchange, including the means to build a [[checkpointing and recovery]] scheme." },
        { p: "The Internet stack has no presentation or session layer. If an Internet application needs those services, it is [[up to the application developer]] to build them into the application, and the developer decides whether they matter." },
        { trap: "Mnemonic, top to bottom: “All People Seem To Need Data Processing” (Application, Presentation, Session, Transport, Network, Data link, Physical). The two OSI layers the Internet lacks sit **between** application and transport." }
      ]
    },
    {
      title: "Encapsulation",
      src: "both",
      blocks: [
        { diagram: "encapsulation" },
        { steps: [
          "The application creates a message [[M]].",
          "The transport layer adds header H_{t}, forming the segment [[H_{t}M]].",
          "The network layer adds header H_{n}, forming the datagram [[H_{n}H_{t}M]].",
          "The link layer adds header H_{l}, forming the frame [[H_{l}H_{n}H_{t}M]].",
          "The frame is transmitted bit by bit using physical-layer services."
        ], title: "Encapsulation at the source" },
        { p: "At every layer a packet has two kinds of fields: [[header fields]] and a [[payload field]]. The payload is typically the [[packet from the layer above]]." },
        { list: [
          "H_{t} (transport header) holds the information needed to provide [[transport services]]: which application to deliver to (port numbers) and [[error-detection bits]].",
          "H_{n} (network header) holds the information needed for [[delivery across networks]]: [[source and destination end-system addresses]] (IP addresses).",
          "H_{l} (link header) holds what is needed to get the frame across the [[current link]] to the next node."
        ] },
        { p: "At the destination the process runs in reverse, called de-encapsulation. Each layer strips its own header, uses it, and passes the payload up." },
        { p: "Kurose's memo analogy: Alice's memo is the **message**. She puts it in an interoffice envelope with Bob's name and department, which is the **segment**. The mailroom puts that inside a postal envelope addressed branch office to branch office, which is the **datagram**. The postal service delivers it, the receiving mailroom extracts the interoffice envelope (de-encapsulation), and Bob opens it and removes the memo." },
        { p: "Cheat-sheet Figure 21 draws the five-layer stack as boxes with [[matryoshka dolls]]. Each layer's PDU contains the entire PDU of the layer above, as each doll contains a smaller doll." },
        { p: "It can get more complex: a large message may be divided into [[multiple segments]], and each segment might itself be divided into multiple datagrams. The receiver must reconstruct the original from the pieces." },
        { game: "encap", text: "Build and strip headers layer by layer, name each PDU, and decide how far up a switch or router goes." }
      ]
    },
    {
      title: "Layer service dependency",
      src: "cheat",
      blocks: [
        { list: [
          "The transport layer delivers [[messages between processes]] using network-layer services.",
          "The network layer delivers the [[transport segment between hosts]] using link-layer services.",
          "The link layer transfers the [[datagram between neighboring devices]].",
          "The frame is transmitted using [[physical-layer]] services."
        ] },
        { trap: "Process-to-process is transport; host-to-host is network; neighbor-to-neighbor (one link) is link. Each layer relies only on the layer directly below it." }
      ]
    },
    {
      title: "Header overhead: the three-segments note",
      src: "cheat",
      blocks: [
        { p: "If a message is split into three transport segments, then on one link there are normally [[three network headers]] and [[three sets of link-layer overhead]]. Each segment travels in its own datagram and its own frame, absent aggregation or other special mechanisms." },
        { formula: "bytes on the link = M + k · (H_{t} + H_{n} + H_{l})",
          where: [["M", "application message bytes"], ["k", "number of segments (one datagram and one frame each)"], ["H", "header bytes per layer (include link trailers in H_{l})"]],
          note: "Efficiency = M ÷ bytes on the link. More segments mean more overhead, and tiny messages are very inefficient." },
        { example: {
            q: "A 3,000-byte message is split into 3 segments. Assume a 20-byte transport header, a 20-byte network header and 18 bytes of link-layer header plus trailer. How many bytes cross the first link, and what fraction is useful data? Compare with sending one 3,000-byte segment.",
            a: "Overhead per segment = 20 + 20 + 18 = 58 bytes. Three segments: 3 × 58 = 174 bytes.\nTotal = 3,000 + 174 = 3,174 bytes. Efficiency = 3,000 / 3,174 ≈ 94.5%.\nOne segment: 3,000 + 58 = 3,058 bytes (≈ 98.1%).\nSplitting tripled the overhead, because every segment needs its own network header and link framing." } },
        { example: {
            q: "Same header sizes. An interactive app sends a 1-byte keystroke in its own segment. What fraction of the frame is user data?",
            a: "Frame = 1 + 58 = 59 bytes. Efficiency = 1 / 59 ≈ 1.7%, so more than 98% of the bytes are headers. Tiny messages waste a lot of capacity." } }
      ]
    },
    {
      title: "Layer delivery across devices (Figure 1.24)",
      src: "both",
      blocks: [
        { table: {
            head: ["Device", "Layers implemented", "What it can read"],
            rows: [
              ["Host (end system)", "[[All five]] (1–5)", "Everything. Application and transport run only here."],
              ["Router", "[[Layers 1–3]]: physical, link, network", "The network header, i.e. [[IP addresses]]. In this model it does not process transport or application data."],
              ["Link-layer switch", "[[Layers 1–2]]: physical, link", "[[Layer-2 (e.g. Ethernet) addresses]] only. It does not recognize IP addresses."]
            ] } },
        { steps: [
          "Source host: M goes down all five layers and leaves as the frame H_{l}H_{n}H_{t}M.",
          "Link-layer switch: passes the frame up to the [[link layer]] only, reads the link-layer address, and sends it out the right port.",
          "Router: goes up to the [[network layer]]. It removes the incoming link header, reads H_{n} (destination IP), looks up its forwarding table, and wraps the datagram in a [[new link-layer frame]] for the next link.",
          "Destination host: up all five layers. Each layer strips its header, and M is delivered to the receiving application."
        ], title: "One message's path: source → switch → router → destination" },
        { p: "Routers and link-layer switches are both packet switches, but they implement only the bottom layers. Hosts implementing all five layers fits the Internet's design of putting much of its [[complexity at the edges]] of the network." },
        { trap: "In the textbook model a router stops at layer 3, so it never looks at transport headers (ports, TCP sequence numbers). A link-layer switch stops at layer 2 and doesn't even understand IP addresses." }
      ]
    }
  ],
  recall: [
    { q: "List the five Internet layers top to bottom.", a: "Application, transport, network, link, physical." },
    { q: "Name the PDU at each of the top four layers.", a: "Message, segment, datagram, frame." },
    { q: "Define a protocol suite.", a: "A set of protocols, each handling a specific networking function, that work together to cover all aspects of communication in a coordinated way." },
    { q: "What does a layered reference model do?", a: "It organizes a complex system by defining its components and their relationships." },
    { q: "Why does modularization simplify maintenance?", a: "Changes within one layer are transparent to the other layers." },
    { q: "How does each layer provide its service?", a: "By performing actions within the layer and by using the services of the layer directly below." },
    { q: "Two drawbacks of layering?", a: "Duplication of lower-layer functionality (e.g. error recovery per link and end to end), and a layer needing information that lives in another layer." },
    { q: "Five tasks a layer can perform?", a: "Error control, flow control, segmentation and reassembly, multiplexing, connection setup." },
    { q: "Which layers are typically implemented in the network interface card?", a: "Link and physical." },
    { q: "Give example protocols for transport, network and link.", a: "Transport: TCP, UDP. Network: IP and routing protocols. Link: Ethernet, Wi-Fi, PPP." },
    { q: "Encapsulation chain from M to a frame?", a: "M → H_{t}M (segment) → H_{n}H_{t}M (datagram) → H_{l}H_{n}H_{t}M (frame)." },
    { q: "What do the transport and network headers carry?", a: "Transport: what is needed for transport services (e.g. which application, error-detection bits). Network: what is needed for delivery across networks (source and destination addresses)." },
    { q: "Which layers do hosts, routers and link-layer switches implement?", a: "Hosts 1–5, routers 1–3, switches 1–2." },
    { q: "A message is split into 3 segments. How many network headers and link-layer overheads are added on one link?", a: "Three of each: one datagram and one frame per segment." },
    { q: "Which two OSI layers are missing from the Internet stack, and what do they do?", a: "Presentation (interpret data: compression, encryption, data description) and session (delimiting, synchronization, checkpointing and recovery)." },
    { q: "Who provides presentation and session services for an Internet app?", a: "The application developer, inside the application." },
    { q: "What does cheat-sheet Figure 21's matryoshka picture mean?", a: "Encapsulation: each layer's PDU contains the whole PDU from the layer above, like nested dolls." },
    { q: "In the layer service dependency, what does each layer deliver?", a: "Transport: messages between processes. Network: segments between hosts. Link: datagrams between neighboring devices. Physical: transmits the frame's bits." }
  ]
});
