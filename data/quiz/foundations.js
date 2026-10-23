NET.addQuestions("foundations", [
  { id: "foundations-01", d: 1, type: "mc", src: "cheat",
    q: "Which statement best defines **data communications**?",
    choices: [
      "The programming interface that applications use to send data across the Internet",
      "The set of rules that fixes message format, message order and the actions taken by communicating entities",
      "The study of how information travels through wired, wireless and optical media by encoding and transmitting data as physical signals",
      "The interconnection of different network technologies by routers to provide universal service"
    ],
    a: 2,
    why: "Data communications is the physical foundation of networking: signals over copper, fibre and wireless media. Rules for message format, order and actions describe a protocol. Interconnecting technologies with routers is internetworking. The programming interface is the socket API, which belongs to the network-applications area." },

  { id: "foundations-02", d: 1, type: "mc", src: "cheat",
    q: "In the lecture's Figure 2, the network protocol stack (application, transport, network, link) is drawn sitting on top of what?",
    choices: [
      "A single global router",
      "The application layer",
      "A data communication foundation, alongside copper, fibre and wireless transmission media",
      "The IETF's RFC documents"
    ],
    a: 2,
    why: "Figure 2 shows the protocol layers resting on a wide **data communication** base, next to copper, fibre and wireless media. The point is that data communications (signals and media) is the foundation every higher layer depends on." },

  { id: "foundations-03", d: 1, type: "mc", src: "cheat",
    q: "According to the lecture, how does a unified network simplify application development?",
    choices: [
      "Developers learn one networking API and a few core functions and can build applications without knowing low-level hardware or protocols",
      "Every application gets a dedicated circuit, so developers never deal with delay",
      "Routers run the application logic, so end hosts only display results",
      "Applications no longer need any transport protocol"
    ],
    a: 0,
    why: "Because every network offers the same service through the same interface, a programmer learns one API (sockets) and a few core functions. Applications still use transport protocols. The Internet is packet switched, so there are no dedicated circuits. Application logic runs on end hosts, not routers." },

  { id: "foundations-04", d: 2, type: "tf", src: "cheat",
    q: "Because a unified network hides low-level details behind one API, understanding how the network works gives application developers no practical benefit.",
    a: false,
    why: "False. The lecture says the API lets you build applications **without** knowing the low-level details, but understanding the network still helps you create **faster, cleaner and more reliable** applications. For example, knowing about latency explains why many small sequential requests are slow." },

  { id: "foundations-05", d: 1, type: "mc", src: "cheat",
    q: "In the term **public network**, what does “public” refer to?",
    choices: [
      "Government ownership of the network",
      "Use of open-source protocol software",
      "Availability: anyone can subscribe to the service through a service provider",
      "Visibility: any subscriber can read the data other users send"
    ],
    a: 2,
    why: "A public network is a subscription-based service available through a service provider. “Public” refers to **availability**, not data visibility. Your traffic is not readable by other subscribers just because the network is public." },

  { id: "foundations-06", d: 3, type: "tf", src: "cheat",
    q: "A network that an organization builds from lines leased from a telecom provider cannot be a private network, because the lines belong to the provider.",
    a: false,
    why: "False. A private network is one that is controlled by one organization with restricted access, and the lecture says explicitly that a private network **may use leased service-provider connections**. Who owns the copper or fibre doesn't decide it. Control and restricted access do." },

  { id: "foundations-07", d: 2, type: "multi", src: "cheat",
    q: "Which of the following are **private** networks? Select all that apply.",
    choices: [
      "A bank's network linking its branches over leased lines, usable only by bank staff",
      "A company's internal network that only its employees can access",
      "A home broadband subscription from a cable company",
      "A university research network restricted to lab members",
      "A cellular data plan sold to the general public"
    ],
    a: [0, 1, 3],
    why: "Private means controlled by one organization with restricted access, so the bank network (even over leased lines), the company network and the restricted research network are private. Home broadband and a cellular data plan are subscription services that anyone can buy from a provider, so they are public networks." },

  { id: "foundations-08", d: 1, type: "mc", src: "cheat",
    q: "At minimum, how many entities does communication require, and what are they?",
    choices: [
      "Two: a sender and a receiver",
      "One: a host talking to the network",
      "Three: a sender, a router and a receiver",
      "Two: a client and a router"
    ],
    a: 0,
    why: "Communication requires at least two entities, a **sender** and a **receiver**, and both must agree on how data is represented, how communication begins and proceeds, and how messages are formatted. A router is not required: two hosts on one link can communicate directly." },

  { id: "foundations-09", d: 2, type: "multi", src: "cheat",
    q: "According to the lecture, which of these must both communicating entities agree on? Select all that apply.",
    choices: [
      "How messages are formatted",
      "How communication begins and proceeds",
      "The physical distance between them",
      "How data is represented",
      "Which hardware vendor built each device"
    ],
    a: [0, 1, 3],
    why: "Both entities must agree on data **representation**, how communication **begins and proceeds**, and message **format**. Vendor and distance don't matter. Agreeing on rules (protocols and standards) is exactly what lets devices from different vendors interoperate at any distance." },

  { id: "foundations-10", d: 1, type: "mc", src: "cheat",
    q: "Interoperability requires that the communicating entities…",
    choices: [
      "be built by the same manufacturer",
      "run the same operating system",
      "follow the same rules",
      "be attached to the same physical network"
    ],
    a: 2,
    why: "Interoperability requires communicating entities to **follow the same rules**, meaning the same protocol. Different operating systems, manufacturers and even network technologies can interoperate as long as they follow the same protocols. That is why the Internet works across Windows, Linux, phones and routers from many vendors." },

  { id: "foundations-11", d: 1, type: "mc", src: "text",
    q: "Kurose defines a protocol as specifying which things?",
    choices: [
      "The sender, the receiver and the link between them",
      "The source address, the destination address and the port number",
      "The format and order of messages exchanged between communicating entities, and the actions taken on transmission/receipt of a message or other event",
      "The bit rate, the propagation delay and the queuing delay of a link"
    ],
    a: 2,
    why: "Kurose §1.1.3: “A protocol defines the **format** and the **order** of messages exchanged between two or more communicating entities, as well as the **actions** taken on the transmission and/or receipt of a message or other event.” The other choices list entities, performance measures or header fields, not what a protocol defines." },

  { id: "foundations-12", d: 2, type: "mc", src: "cheat",
    q: "The lecture's definition of a protocol explicitly includes something that a list of message formats alone would miss. What is it?",
    choices: [
      "The price charged by the service provider",
      "The propagation speed of the physical medium",
      "Error handling and responses to unexpected events",
      "The application's user interface"
    ],
    a: 2,
    why: "Lecture: a protocol defines the rules for communication, **including error handling and responses to unexpected events**. That matches Kurose's “actions taken on … other events”, such as a timeout when no reply arrives. Medium speed, UI and price are not part of a protocol." },

  { id: "foundations-13", d: 1, type: "order", src: "text",
    q: "Put the steps of the human “what time is it?” protocol (Kurose Figure 1.2) in order.",
    items: [
      "You say “Hi” to start the conversation",
      "The other person replies “Hi”",
      "You ask “Got the time?”",
      "The other person replies “2:00”"
    ],
    why: "The greeting initiates communication, and the returned “Hi” is taken as permission to proceed. Only then do you ask for the time, and the answer comes last. A different reply to the first “Hi” (e.g. “Don't bother me”) would change your next action: you would not ask." },

  { id: "foundations-14", d: 2, type: "order", src: "text",
    q: "Put the messages of the Web-page exchange in Kurose Figure 1.2 in the order they are sent.",
    items: [
      "Client sends a TCP connection request",
      "Server returns a TCP connection reply",
      "Client sends a GET message naming the page",
      "Server returns the file"
    ],
    why: "The computer first asks for a connection and waits. Once the reply arrives, it knows it is OK to request the document, so it sends GET, and the server returns the Web page (file). This mirrors Hi, Hi, Got the time?, 2:00. Sending GET before the connection reply would break the protocol's **order**." },

  { id: "foundations-15", d: 2, type: "mc", src: "text",
    q: "In the human time-of-day protocol, the other person answers your opening “Hi” with “Don't bother me!”. What does the protocol say you do next?",
    choices: [
      "Ask for the time anyway",
      "Ask for the time in a different language",
      "Repeat “Hi” until they answer “Hi”",
      "Don't ask for the time"
    ],
    a: 3,
    why: "A reply other than a cordial “Hi” signals unwillingness or inability to communicate, so the protocol is **not** to ask for the time. This shows the “actions” part of a protocol: what you do depends on which message you received. A network client likewise doesn't send GET if the connection is refused." },

  { id: "foundations-16", d: 2, type: "mc", src: "text",
    q: "You greet someone, get no response at all, and eventually give up. Which part of Kurose's protocol definition does this illustrate?",
    choices: [
      "An action taken in response to an event other than a received message (no reply within some time)",
      "The number of layers in the protocol stack",
      "The format of a message",
      "The physical medium the message travels over"
    ],
    a: 0,
    why: "Kurose stresses actions taken on the transmission/receipt of a message **or other event**, such as no reply within some amount of time. Giving up after silence is the human version of a timeout. Network protocols use timeouts to retransmit or abort." },

  { id: "foundations-17", d: 3, type: "tf", src: "text",
    q: "A protocol only needs to define the format of each message; the order in which messages are exchanged can be left to each implementation.",
    a: false,
    why: "False. **Order** is one of the defining elements of a protocol, along with format and actions. In Figure 1.2 the client must not send GET before the connection reply arrives. If two implementations assumed different orders they would not interoperate, even with identical message formats." },

  { id: "foundations-18", d: 3, type: "mc", src: "cheat",
    q: "Programs X and Y use identical message formats. X waits for a greeting before it accepts any request; Y sends its request immediately without greeting. What happens, and why?",
    choices: [
      "They interoperate, because the message formats match",
      "They interoperate as long as both run on the same network technology",
      "They fail only if packets are lost in the network",
      "They fail to interoperate, because a protocol must fix the order of messages as well as their format"
    ],
    a: 3,
    why: "Interoperability requires following the **same rules**, and the rules include how communication begins and proceeds (order), not just message format. Y's request arrives when X expects a greeting, so X doesn't act on it as Y expects. Sharing a network technology doesn't fix a protocol mismatch, and this failure happens even with zero loss." },

  { id: "foundations-19", d: 3, type: "mc", src: "text",
    q: "Which of these is **not** part of what a protocol defines, according to Kurose?",
    choices: [
      "The actions taken when a message is received or a timer expires",
      "The order in which messages are exchanged",
      "The format of the messages",
      "The programming language used to implement the communicating entities"
    ],
    a: 3,
    why: "A protocol specifies format, order and actions. It is deliberately independent of how it is implemented: a Python client and a C server interoperate if both follow the protocol. That independence is the reason standards can be written once and implemented by many vendors." },

  { id: "foundations-20", d: 2, type: "short", src: "text",
    q: "Kurose says protocols are running “everywhere” in the Internet. Give three examples of protocols at work in different places (hint: on the wire, in end systems, in routers).",
    a: "Hardware-implemented protocols in two physically connected network interface cards control the flow of bits on the wire. Congestion-control protocols in end systems control the rate at which packets are transmitted between sender and receiver. Protocols in routers determine a packet's path from source to destination.",
    keys: ["network interface|NIC|bits on the wire|hardware", "congestion|sending rate|rate", "router|path|route"],
    why: "All activity in the Internet that involves two or more communicating remote entities is governed by a protocol. Kurose's three examples cover hardware (NICs), end-system software (congestion control) and the network core (routing). Later chapters study each of these in detail." },

  { id: "foundations-21", d: 1, type: "mc", src: "text",
    q: "Who develops Internet standards, and what are the standards documents called?",
    choices: [
      "The IETF; the documents are IEEE 802 specifications",
      "The IETF; the documents are RFCs",
      "Tier-1 ISPs; the documents are peering agreements",
      "The IEEE 802 committee; the documents are RFCs"
    ],
    a: 1,
    why: "Internet standards are developed by the **Internet Engineering Task Force (IETF)**, and its standards documents are **requests for comments (RFCs)**, which define TCP, IP, HTTP, SMTP and more. IEEE 802 is a different body that standardizes LAN links such as Ethernet and Wi-Fi." },

  { id: "foundations-22", d: 1, type: "mc", src: "text",
    q: "Which body specifies the Ethernet and Wi-Fi standards?",
    choices: [
      "The IEEE 802 LAN Standards Committee",
      "The IETF",
      "The Internet's tier-1 ISPs",
      "Each router vendor separately"
    ],
    a: 0,
    why: "Kurose: other bodies besides the IETF specify standards for network components, most notably links. The **IEEE 802 LAN Standards Committee** specifies Ethernet and Wi-Fi. The IETF handles Internet protocols such as IP, TCP, HTTP and SMTP." },

  { id: "foundations-23", d: 1, type: "tf", src: "text",
    q: "RFCs are the IETF documents that define Internet protocols such as TCP, IP, HTTP and SMTP.",
    a: true,
    why: "True. RFCs (requests for comments) started as general requests for comments on design problems of the Internet's precursor. Today they are technical, detailed standards, and there are nearly 9000 of them." },

  { id: "foundations-24", d: 2, type: "short", src: "ch1-R3",
    q: "R3: Why are standards important for protocols?",
    a: "A protocol only works if every communicating entity agrees on the message formats, the order of messages and the actions taken. Standards record that agreement publicly so that people and companies can build systems and products independently that still interoperate. For the Internet, the IETF publishes these as RFCs; IEEE 802 does it for Ethernet and Wi-Fi.",
    keys: ["interoperate|interoperability|work together", "agree|same rules|same protocol", "independent|different vendors|different companies|different products", "IETF|RFC|IEEE"],
    why: "Kurose: “it's important that everyone agree on what each and every protocol does, so that people can create systems and products that interoperate. This is where standards come into play.” Without standards, a browser from one company could not talk to a server from another, and a Wi-Fi card from one vendor could not join another vendor's access point." },

  { id: "foundations-25", d: 3, type: "short", src: "cheat",
    q: "A new optical link doubles the raw bit rate, but file-transfer completion time barely changes. Give one explanation from each networking area: data communications, packet technology, and TCP/IP/application.",
    a: "Data communications: errors or signalling overhead limit the usable rate. Packet technology: a shared or slower access segment elsewhere on the path is the bottleneck. TCP/IP/application: transport congestion control, server limits, latency, or application serialization prevents the sender from using the extra capacity.",
    keys: ["error|signalling|signaling|overhead", "shared|slower|bottleneck|access segment", "congestion control|server|latency|serialization|serialisation"],
    why: "This is the lecture's diagnosis exercise. The end-to-end rate is limited by the slowest component, and that component can be physical (errors), a network segment (bottleneck link) or software (TCP's congestion control, a busy server, round-trip latency, an application that waits for each reply). A faster link only helps if it was the bottleneck." },

  { id: "foundations-26", d: 2, type: "mc", src: "cheat",
    q: "Which explanation for “doubled bit rate, same transfer time” belongs to the **packet technology** area?",
    choices: [
      "TCP congestion control limits the sending rate",
      "A shared or slower access segment elsewhere on the path is the bottleneck",
      "The application requests one block at a time and waits for each reply",
      "Bit errors and signalling overhead reduce the usable rate"
    ],
    a: 1,
    why: "The packet-technology explanation is a **shared or slower access segment** acting as the bottleneck. Bit errors and signalling overhead are data communications. Congestion control and application serialization belong to TCP/IP/application." },

  { id: "foundations-27", d: 2, type: "mc", src: "cheat",
    q: "A fibre link signals at its full raw bit rate, but frequent bit errors force so many retransmissions that the usable rate is about half. Which networking area does this explanation belong to?",
    choices: [
      "Packet switching technology",
      "TCP/IP internetworking",
      "Data communications",
      "Network applications"
    ],
    a: 2,
    why: "Bit errors and signalling overhead are about how bits travel as physical signals, which is **data communications**. It is the lecture's first diagnosis: errors or signalling overhead limit the usable rate." },

  { id: "foundations-28", d: 3, type: "multi", src: "cheat",
    q: "A company replaces a 1 Gbps link with a 2 Gbps link, yet a large download takes the same time as before. Which of the following could explain this? Select all that apply.",
    choices: [
      "Doubling the bit rate doubled the link's propagation delay",
      "TCP congestion control is limiting the sender's rate",
      "The server's own access link is only 100 Mbps",
      "The new link has a high bit-error rate, so much of its raw capacity is wasted",
      "The application fetches one small block at a time and waits for each reply over a long RTT"
    ],
    a: [1, 2, 3, 4],
    why: "The server-link, congestion-control, block-at-a-time and bit-error options are the lecture's explanations: a slower segment as bottleneck (packet technology), congestion control and application serialization over latency (TCP/IP/application), and errors (data communications). The propagation-delay option is false: propagation delay depends on distance and signal speed, not on the bit rate, and a higher bit rate never makes propagation slower." },

  { id: "foundations-29", d: 2, type: "num", src: "cheat",
    q: "A 200 MB file is downloaded through a newly upgraded 2 Gbps campus link, but the server's access link is only 50 Mbps. Ignoring all other effects, how long does the transfer take? Answer in seconds (1 MB = 10^{6} bytes).",
    a: 32, unit: "s",
    why: "File size = 200 × 10^{6} bytes × 8 = 1.6 × 10^{9} bits.\nThe transfer can go no faster than the slowest link: min(2 Gbps, 50 Mbps) = 50 Mbps.\nTime = (1.6 × 10^{9} bits) / (50 × 10^{6} bits/s) = 32 s.\nWith the old 1 Gbps link the answer is also 32 s, so the upgrade doesn't help because the server's access segment is the bottleneck." },

  { id: "foundations-30", d: 2, type: "num", src: "cheat",
    q: "After a link upgrade to 2 Gbps, TCP congestion control (over a long RTT) still holds a transfer to an average of 40 Mbps. How long does a 500 MB file take? Answer in seconds (1 MB = 10^{6} bytes).",
    a: 100, unit: "s",
    why: "500 MB = 500 × 10^{6} × 8 = 4 × 10^{9} bits.\nAchieved rate = 40 Mbps = 4 × 10^{7} bits/s.\nTime = (4 × 10^{9} bits) / (4 × 10^{7} bits/s) = 100 s.\nThis is the TCP/IP/application explanation: the transport protocol, not the link, decides how fast data actually flows, so the 2 Gbps capacity sits unused." },

  { id: "foundations-31", d: 3, type: "short", src: "cheat",
    q: "Explain the difference between a public and a private network. A company connects its offices using lines leased from a telecom provider, and only employees can use the network. Is it public or private? Why?",
    a: "A public network is a subscription-based service that anyone can obtain from a service provider. “Public” refers to availability, not to data being visible. A private network is controlled by one organization and has restricted access. The company's network is private: one organization controls it and restricts access, and using leased provider connections doesn't change that.",
    keys: ["subscription|subscribe|service provider", "availability|not visibility|not data visibility", "one organization|single organization|controlled by", "restricted", "leased"],
    why: "Ownership of the physical lines is a common trap. The lecture's definitions depend on **who can use it** (anyone subscribing vs. one organization's restricted users) and **who controls it**. A private network may use leased service-provider connections." },

  { id: "foundations-32", d: 2, type: "short", src: "text",
    q: "Using Kurose's definition of a protocol, identify the format, order and action elements in the human “Got the time?” exchange.",
    a: "Format: the specific messages used (“Hi”, “Got the time?”, “2:00”). Order: greet first, wait for the returned “Hi”, then ask, then receive the time. Actions: a cordial “Hi” means proceed and ask; a rude reply means don't ask; no reply within some time means give up.",
    keys: ["format|messages", "order|sequence|first", "action", "no reply|timeout|give up"],
    why: "Kurose: transmitted and received messages, and actions taken when these messages are sent or received or other events occur, are at the heart of a human protocol, and the same is true of network protocols. The “give up after silence” action shows that protocols also react to non-message events." },

  { id: "foundations-33", d: 3, type: "short", src: "cheat",
    q: "List the three things the lecture says communicating entities must agree on, and explain what happens if two entities follow different rules.",
    a: "They must agree on how data is represented, how communication begins and proceeds, and how messages are formatted. If they follow different rules they do not interoperate: messages are misread or arrive when unexpected, so no useful communication happens.",
    keys: ["represent", "begin|proceed|start", "format", "interoperat|no useful|cannot communicate|fail"],
    why: "Interoperability requires the entities to follow the same rules. Kurose's human analogy makes the same point: if one person has manners and the other doesn't, the protocols don't interoperate and no useful work is accomplished." },

  { id: "foundations-34", d: 3, type: "short", src: "ch1-P1",
    ctx: "P1: Design an application-level protocol between an ATM and a bank's centralized computer. It must verify the user's card and password, query the account balance (kept at the central computer), and make a withdrawal, including the case where the account lacks funds. List the messages exchanged and the actions taken, and state your assumptions about the underlying transport service.",
    q: "Sketch your protocol: the messages each side sends, the actions on receipt, how insufficient funds is handled, and what you assume about the transport service.",
    a: "Assume a reliable, in-order transport such as TCP. The ATM sends its card ID and then the password; the bank replies OK or ERR and the session ends on ERR. The ATM can send BALANCE (bank replies with the amount) or WITHDRAW amount; the bank replies OK and debits the account if funds suffice (ATM then dispenses cash) or ERR insufficient-funds (ATM dispenses nothing and shows an error). A BYE message ends the session.",
    keys: ["card|HELO|user ID", "password|PIN", "balance", "withdraw|amount", "insufficient|not enough|ERR", "reliable|TCP|in order"],
    why: "One workable design (many are acceptable if format, order and actions are all specified):\nATM → bank: HELO <cardID>, PASSWD <pin>, BALANCE, WITHDRAW <amount>, BYE.\nBank → ATM: PASSWD (requests password), OK (last command succeeded), ERR <reason>, AMOUNT <balance>, BYE.\nSimple withdrawal, no errors (in the style of Figure 1.2):\nATM: HELO 1234 → Bank: PASSWD\nATM: PASSWD 9999 → Bank: OK\nATM: WITHDRAW 200 → Bank checks the balance, debits 200 → OK\nATM dispenses $200.\nATM: BYE → Bank: BYE\nActions: on a wrong password the bank sends ERR and the ATM ends the session (or allows a limited number of retries). On WITHDRAW with too little money the bank sends ERR insufficient-funds, the balance is unchanged, and the ATM dispenses nothing. The bank must debit only once per approved withdrawal.\nTransport assumption: messages are delivered reliably and in order (e.g. TCP), so the protocol needn't handle loss or reordering. If the transport were unreliable, you would add sequence numbers, timeouts and retransmission, and make WITHDRAW idempotent so a retransmission doesn't debit twice." }
]);
