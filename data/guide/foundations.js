NET.addSection({
  id: "foundations",
  unit: 1,
  order: 1,
  title: "Networking, data communications & protocols",
  short: "Foundations",
  cheat: "p.8–11, p.17–18",
  text: "§1.1.1 (standards), §1.1.3",
  minutes: 25,
  summary: "What the field of networking covers (data communications, packet-switching technologies, TCP/IP internetworking, applications), the difference between public and private networks, and what a protocol actually is: format, order and actions. Expect definition questions (data communications, public network, protocol, interoperability), the “faster link but no faster transfer” diagnosis, and “why do standards matter?”.",
  mustKnow: [
    "[[Data communications]] is the study of how information travels through wired, wireless and optical media as [[physical signals]]. It is the foundation under computer networking.",
    "A unified network lets developers learn [[one networking API]] and a few core functions, so they can build applications without knowing low-level hardware or protocols.",
    "A link doubled its bit rate but the transfer isn't faster? Give one cause per area. Data comms: [[errors or signalling overhead]]. Packet technology: [[a shared or slower access segment is the bottleneck]]. TCP/IP/application: [[congestion control, server limits, latency, application serialization]].",
    "A **public** network is a [[subscription-based service from a service provider]]. “Public” refers to [[availability]], not to whether data is visible.",
    "A **private** network is [[controlled by one organization]] with restricted access. It may still use [[leased service-provider connections]].",
    "Communication needs [[at least two entities]] (sender and receiver) that agree on [[data representation, how communication begins and proceeds, and message format]].",
    "Interoperability requires the communicating entities to [[follow the same rules]].",
    "Kurose: a protocol defines the [[format and order]] of messages exchanged between two or more entities, and the [[actions taken]] when a message is sent or received or another event occurs.",
    "Lecture: a protocol defines the rules for communication, including [[error handling]] and [[responses to unexpected events]].",
    "Internet standards come from the [[IETF]] and are published as [[RFCs]]. The [[IEEE 802]] committee standardizes Ethernet and Wi-Fi. Standards exist so that independently built products [[interoperate]]."
  ],
  topics: [
    {
      title: "What “networking” covers",
      src: "cheat",
      blocks: [
        { p: "The lecture treats networking as a stack of ideas sitting on a physical foundation. Cheat-sheet Figure 2 shows application, transport, network and link boxes stacked on a wide **data communication** base, next to copper, fibre and wireless transmission media. Each area answers a different question:" },
        { table: {
            head: ["Area", "Question it answers", "Examples"],
            rows: [
              ["[[Data communications]]", "How do bits physically travel as signals over a medium?", "Encoding, signals, copper, fibre, wireless, bit errors"],
              ["[[Packet switching / network technologies]]", "How do devices share links and move packets within one network?", "Ethernet, Wi-Fi, cellular; framing, medium sharing"],
              ["[[Internetworking (TCP/IP)]]", "How do different networks join into one Internet?", "IP's common packet format and addressing, routers"],
              ["[[Network applications]]", "How do programs on different hosts use the network?", "Web, e-mail; the socket API"]
            ] },
          caption: "The areas of networking used throughout the course (and in the “diagnose the slow link” question)." },
        { def: "Data communications", text: "The study of how information travels through [[wired, wireless, and optical media]] by encoding and transmitting data using [[physical signals]]. It provides the [[foundation]] for computer networking." },
        { p: "Why a unified network matters to programmers: every network offers the same service, so a developer learns [[one networking API]] and [[a few core functions]] and can build applications **without knowing low-level hardware or protocols**. Understanding what happens underneath still pays off, because it helps you write [[faster, cleaner, and more reliable]] applications. For example, knowing about latency explains why an app that makes 50 small round trips feels slow on a long-distance link." },
        { trap: "Data communications is not “the whole network”. It is only the bottom foundation (signals and media). Packet switching, internetworking and applications are separate areas built on top of it, and a problem can come from any of them." }
      ]
    },
    {
      title: "Diagnosing why extra link capacity is not used",
      src: "cheat",
      blocks: [
        { p: "A classic exam scenario: a new optical link **doubles the raw bit rate**, but a file transfer finishes in almost the same time. The expected answer gives **one explanation from each networking area**:" },
        { table: {
            head: ["Area", "Explanation"],
            rows: [
              ["Data communications", "[[Errors or signalling overhead]] limit the usable rate. Retransmitted or corrupted bits and encoding/signalling overhead mean the raw bit rate is not the useful bit rate."],
              ["Packet technology", "[[A shared or slower access segment]] elsewhere on the path is the bottleneck, so the faster link just sits idle part of the time."],
              ["TCP/IP / application", "[[Transport congestion control, server limits, latency, or application serialization]] (one request at a time, waiting for each reply) prevent the sender from using the extra capacity."]
            ] } },
        { example: {
            q: "A lab upgrades its campus uplink from 1 Gbps to 2 Gbps, but downloading a 100 MB file from a remote server still takes about 8 s. Give one plausible cause from each area.",
            a: "Data communications: the new link has a high bit-error rate or heavy encoding/signalling overhead, so its usable rate is far below 2 Gbps.\nPacket technology: the bottleneck is somewhere else, for example the server's 100 Mbps access link or a shared Wi-Fi segment. Check: 100 MB = 800 Mb, and 800 Mb ÷ 100 Mbps = 8 s, which matches the observed time.\nTCP/IP / application: TCP congestion control (or a small window over a long RTT) caps the sending rate, the server throttles each client, or the application fetches the file in pieces and waits for each reply before asking for the next." } },
        { trap: "End-to-end transfer speed is set by the **slowest** part of the whole system (the bottleneck), and that may be hardware, protocol or application. Upgrading a link that wasn't the bottleneck changes almost nothing." }
      ]
    },
    {
      title: "Public and private networks",
      src: "cheat",
      blocks: [
        { def: "Public network", text: "A [[subscription-based]] service available through a [[service provider]]. “Public” refers to [[availability]] (anyone can subscribe), **not** to data visibility." },
        { def: "Private network", text: "A network [[controlled by one organization]] with [[restricted access]]. A private network [[may use leased service-provider connections]] and is still private." },
        { table: {
            head: ["", "Public network", "Private network"],
            rows: [
              ["Who may use it", "Anyone who subscribes", "Only the owning organization and those it allows"],
              ["Who controls it", "The service provider", "The organization"],
              ["Is the data visible to others?", "Not because it is public. “Public” only means it is available to subscribers", "Not applicable: access is restricted"],
              ["Can it use provider facilities?", "It **is** the provider's service", "Yes, e.g. leased lines between branch offices"]
            ] } },
        { trap: "“Public” does not mean insecure or visible. A company that links its branch offices with leased lines from a telecom provider has a **private** network, because the organization controls it and access is restricted." },
        { example: {
            q: "Classify each as public or private: (a) a home broadband subscription from a cable company, (b) a bank's network linking its branches over leased lines, (c) a cellular data plan, (d) a university lab network open only to enrolled students.",
            a: "(a) Public: a subscription service from a provider.\n(b) Private: one organization controls it and restricts access, even though it uses leased provider lines.\n(c) Public: a subscription service.\n(d) Private: controlled by one organization with restricted access." } }
      ]
    },
    {
      title: "Communication, interoperability and protocols",
      src: "both",
      blocks: [
        { list: [
          "Communication requires [[at least two entities]]: a sender and a receiver.",
          "Both must agree on [[how data is represented]], [[how communication begins and proceeds]], and [[how messages are formatted]].",
          "[[Interoperability]] requires the communicating entities to [[follow the same rules]]."
        ] },
        { def: "Protocol (lecture)", text: "Defines the [[rules for communication]], including [[error handling]] and [[responses to unexpected events]]." },
        { def: "Protocol (Kurose §1.1.3)", text: "Defines the [[format]] and the [[order]] of messages exchanged between two or more communicating entities, as well as the [[actions taken]] on the transmission and/or receipt of a message or other event." },
        { p: "Memory hook: **format, order, actions**, plus what to do when something goes wrong. The two definitions agree: a protocol is not just a message layout. It also fixes the sequence of messages and the reaction to each message, timeout or error." },
        { trap: "Two programs that use the same message **format** but expect a different **order** (for example, one sends its request before the other has replied to the opening greeting) do not interoperate. All three parts must match." }
      ]
    },
    {
      title: "The human analogy and a real network protocol (Figure 1.2)",
      src: "text",
      blocks: [
        { steps: [
          "You say “Hi” to [[initiate]] communication.",
          "The other person replies “Hi”. You take this as an indication that you can [[proceed]].",
          "You ask “Got the time?”",
          "They reply “2:00”."
        ], title: "Human protocol: asking someone the time" },
        { p: "Other replies trigger different actions. “Don't bother me” or “I don't speak English” signals unwillingness or inability, so the protocol is to [[not ask for the time]]. If there is [[no response at all]], you eventually give up, which is like a timeout. So a human protocol has specific **messages** and specific **actions** taken in response to replies **or other events**, such as no reply within some amount of time." },
        { p: "If people run different protocols (one has manners and the other doesn't, or one understands the concept of time and the other doesn't), the protocols [[do not interoperate]] and no useful work gets done. The same holds in networking: it takes two or more entities running the [[same protocol]] to accomplish a task." },
        { p: "A second analogy is the classroom. The teacher asks “Are there any questions?”, a message to all students. You raise your hand, an implicit message. The teacher says “Yes…”, encouraging you to go on. You ask, and the teacher answers. Again, messages plus conventional actions taken when they are sent and received." },
        { steps: [
          "Your computer sends a [[TCP connection request]] message to the Web server and waits.",
          "The server returns a [[TCP connection reply]].",
          "Knowing it is now OK to proceed, your computer sends a [[GET]] message naming the Web page.",
          "The server returns the [[file]] (the Web page)."
        ], title: "Network protocol: fetching a Web page (right half of Figure 1.2)" },
        { table: {
            head: ["Human protocol", "Network protocol"],
            rows: [
              ["“Hi”", "TCP connection request"],
              ["“Hi” (reply)", "TCP connection reply"],
              ["“Got the time?”", "GET request for a page"],
              ["“2:00”", "The file is returned"],
              ["No answer, so give up", "Timeout, then retry or abort"]
            ] } },
        { p: "In network protocols, the entities exchanging messages are the hardware or software components of devices (computers, phones, routers). **All** Internet activity involving two or more communicating remote entities is governed by a protocol. Kurose's examples: [[hardware-implemented protocols]] in two network interface cards control the flow of bits on the wire; [[congestion-control]] protocols in end systems control the rate at which packets are sent; protocols in [[routers]] determine a packet's path from source to destination." },
        { example: {
            q: "Point out the format, the order, and the actions in the Web-page exchange of Figure 1.2.",
            a: "Format: every message has a defined structure. A GET message names the requested page in a fixed layout, and the connection request and reply have defined fields.\nOrder: connection request, then connection reply, then GET, then file. The GET must not be sent before the connection reply arrives.\nActions: when the connection reply arrives, the client sends GET. When GET arrives, the server returns the file. If no reply arrives within some time, the client retries or gives up." } }
      ]
    },
    {
      title: "Standards: why they matter",
      src: "text",
      blocks: [
        { p: "Protocols only work if every party implements them the same way. Everyone must agree on what each protocol does so that people can create systems and products that [[interoperate]]. That is the job of [[standards]]: they let a browser from one company talk to a server from another, over routers from a third." },
        { list: [
          "Internet standards are developed by the [[IETF]] (Internet Engineering Task Force).",
          "IETF standards documents are called [[RFCs]] (requests for comments). They began as general requests for comments on design problems of the Internet's precursor. Today they are technical and detailed and define protocols such as [[TCP, IP, HTTP and SMTP]]. There are nearly 9000 RFCs.",
          "Other bodies standardize network components, especially links. The [[IEEE 802 LAN Standards Committee]] specifies the [[Ethernet and Wi-Fi]] standards."
        ] },
        { trap: "Don't mix them up. The IETF writes RFCs for Internet protocols (IP, TCP, HTTP, SMTP). IEEE 802 standardizes LAN link technologies (Ethernet, Wi-Fi)." },
        { example: {
            q: "Why are standards important for protocols? (Review Question R3)",
            a: "A protocol only works if all communicating entities agree on the message format, the order of messages and the actions taken. Standards (IETF RFCs, IEEE 802) write that agreement down publicly. Different vendors and developers can then build hosts, routers and applications independently that still interoperate. Without standards, each vendor's products would only talk to each other." } }
      ]
    }
  ],
  recall: [
    { q: "Define data communications.", a: "The study of how information travels through wired, wireless and optical media by encoding and transmitting data as physical signals. It is the foundation for computer networking." },
    { q: "Why does a unified network simplify application development?", a: "Developers learn one networking API and a few core functions and can build applications without knowing low-level hardware or protocols." },
    { q: "Does understanding the network still help an application developer?", a: "Yes. It helps create faster, cleaner and more reliable applications." },
    { q: "Faster link, same transfer time: what is the data-communications explanation?", a: "Errors or signalling overhead limit the usable rate." },
    { q: "Faster link, same transfer time: what is the packet-technology explanation?", a: "A shared or slower access segment is the bottleneck." },
    { q: "Faster link, same transfer time: what is the TCP/IP/application explanation?", a: "Transport congestion control, server limits, latency or application serialization prevent use of the extra capacity." },
    { q: "Define a public network. What does “public” refer to?", a: "A subscription-based service available through a service provider. “Public” refers to availability, not data visibility." },
    { q: "Define a private network. Can it use provider connections?", a: "Controlled by one organization with restricted access. Yes, it may use leased service-provider connections." },
    { q: "What must communicating entities agree on?", a: "How data is represented, how communication begins and proceeds, and how messages are formatted." },
    { q: "What does interoperability require?", a: "The communicating entities must follow the same rules." },
    { q: "Kurose's definition of a protocol?", a: "The format and order of messages exchanged between two or more communicating entities, and the actions taken on the transmission and/or receipt of a message or other event." },
    { q: "What does the lecture's protocol definition explicitly add?", a: "Error handling and responses to unexpected events." },
    { q: "List the four messages on the network side of Figure 1.2 in order.", a: "TCP connection request, TCP connection reply, GET, file." },
    { q: "In the human time-of-day protocol, what action follows no response?", a: "Give up asking that person (a timeout-like action)." },
    { q: "Give three of Kurose's examples of protocols at work in the Internet.", a: "Hardware protocols in network interface cards controlling bits on the wire; congestion control in end systems controlling send rate; router protocols determining a packet's path." },
    { q: "Who develops Internet standards and what are the documents called?", a: "The IETF; the documents are RFCs (requests for comments)." },
    { q: "Who standardizes Ethernet and Wi-Fi?", a: "The IEEE 802 LAN Standards Committee." },
    { q: "Why are standards important for protocols?", a: "So that systems and products built independently by different parties interoperate." }
  ]
});
