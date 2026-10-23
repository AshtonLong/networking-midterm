NET.addSection({
  id: 'email',
  unit: 2,
  order: 12,
  title: 'Electronic mail: SMTP & mail access',
  short: 'E-mail & SMTP',
  cheat: 'p.127–129, 134–136',
  text: '§2.3',
  minutes: 25,
  summary: 'Internet e-mail has three parts: user agents, mail servers (each with mailboxes and an outgoing message queue) and SMTP, which pushes mail from the sender’s server directly to the recipient’s server over TCP port 25. The recipient pulls mail from their always-on server with IMAP or HTTP, never SMTP. Expect questions on the roles (SMTP client vs server), the Alice → Bob flow and protocol sequence, the SMTP dialogue, and the difference between `MAIL FROM:` and the `From:` header line.',
  mustKnow: [
    'Three major components: [[user agents]], [[mail servers]] and [[SMTP]].',
    'A mail server has a [[mailbox]] for each user (incoming messages) and a [[message queue]] (outgoing messages waiting to be sent).',
    'SMTP runs [[between mail servers]]. The [[sending]] server is the [[SMTP client]] because it initiates the connection; the [[receiving]] server is the [[SMTP server]]. Every mail server runs both sides.',
    'SMTP uses [[TCP]] port [[25]] and transfers mail [[directly]] from the sender’s server to the recipient’s server, with no intermediate mail servers. If the recipient’s server is down, the sender’s server [[retries]] (about every [[30 minutes]]).',
    'SMTP dialogue: `HELO`, `MAIL FROM:`, `RCPT TO:`, `DATA`, message lines, a line with a single [[period]] (`CRLF.CRLF`), `QUIT`. Connections are [[persistent]]: several messages can share one TCP connection.',
    'SMTP restricts the whole message (body too) to [[7-bit ASCII]], so binary attachments must be encoded; HTTP has no such rule.',
    'Message format: [[header lines]], a [[blank line]], then the [[body]]. `To:`, `From:` and `Subject:` are header lines inside the message, different from the SMTP commands `MAIL FROM:` and `RCPT TO:`.',
    'The sender’s user agent hands mail to its own server (SMTP or HTTP), which [[relays]] it so delivery can be [[retried]].',
    'SMTP is strictly a [[push]] protocol, so the recipient retrieves mail with [[IMAP]] (e.g. Outlook) or [[HTTP]] (Web mail, Gmail app).',
    'Mailboxes live on an [[always-on shared mail server]], because a personal PC or phone cannot stay online all the time.'
  ],
  topics: [
    {
      title: 'E-mail at a glance',
      src: 'text',
      blocks: [
        { p: 'E-mail is an [[asynchronous]] communication medium: people send and read messages when convenient, without coordinating schedules. Compared with postal mail it is fast, easy to distribute and inexpensive, and it supports attachments, hyperlinks, HTML-formatted text and embedded photos.' },
        { diagram: 'email-flow' }
      ]
    },
    {
      title: 'The three components: user agents, mail servers, SMTP',
      src: 'both',
      blocks: [
        { def: 'User agent (mail reader)', text: 'The program a person uses to [[compose, edit, read, reply to, forward and save]] mail messages. Examples: Microsoft Outlook, Apple Mail, Web-based Gmail, the Gmail smartphone app.' },
        { def: 'Mail server', text: 'The core of the e-mail infrastructure. It holds a [[mailbox]] for each of its users, which contains [[incoming]] messages, and a [[message queue]] of [[outgoing]] messages to be sent.' },
        { def: 'SMTP (Simple Mail Transfer Protocol)', text: 'The protocol used [[between mail servers]] to send e-mail messages. It is the principal application-layer protocol for Internet e-mail and uses TCP’s reliable data transfer.' },
        { p: 'A message travels: sender’s user agent → [[sender’s mail server]] (placed in its outgoing queue) → [[recipient’s mail server]] (deposited in the recipient’s mailbox) → read by the recipient’s user agent. When Bob opens his mailbox, his mail server [[authenticates]] him with a username and password.' },
        { p: 'SMTP has a client side and a server side, and [[both run on every mail server]]. When a mail server [[sends]] mail to another server, it acts as an [[SMTP client]]; when it [[receives]] mail, it acts as an [[SMTP server]].' },
        { trap: '“Client” and “server” describe roles in **one connection**, not kinds of machine. The sending mail server is the SMTP client because it **initiates** the SMTP (TCP) connection. The same machine is an SMTP server a moment later when other servers deliver mail to it.' },
        { p: 'Failure handling: if Alice’s server cannot deliver to Bob’s server, it [[holds the message in its queue]] and tries again later, often [[every 30 minutes]] or so. If there is no success after [[several days]], it removes the message and [[notifies the sender]] (Alice) by e-mail.' }
      ]
    },
    {
      title: 'Alice sends Bob a message (Figure 2.15)',
      src: 'both',
      blocks: [
        { steps: [
          'Alice invokes her user agent, gives Bob’s address (bob@someschool.edu), composes the message and tells the agent to send it.',
          'Alice’s user agent sends the message to [[her mail server]], where it is placed in the [[message queue]].',
          'The [[client side of SMTP]] on Alice’s mail server sees the message in the queue and opens a [[TCP connection]] to the SMTP server on [[Bob’s mail server]].',
          'After some initial [[SMTP handshaking]], the SMTP client sends Alice’s message into the TCP connection.',
          'At Bob’s mail server, the server side of SMTP receives the message and places it in [[Bob’s mailbox]].',
          'Bob invokes his user agent to read the message at his convenience.'
        ], title: 'Six steps' },
        { p: 'SMTP does [[not normally use intermediate mail servers]], even across the world. If Alice’s server is in Hong Kong and Bob’s is in St. Louis, the TCP connection runs [[directly]] between the two. If Bob’s server is down, the message [[stays in Alice’s server]] and waits for a new attempt; it is not parked on some intermediate server.' },
        { p: 'Why the two-step send (user agent → own server → recipient’s server)? Without relaying through her own server, Alice’s user agent would have [[no recourse]] if the destination server were unreachable. With the relay, Alice’s server can [[keep retrying]] (say every 30 minutes) until Bob’s server is up. (If Alice’s own server is down, her recourse is to complain to her system administrator.)' }
      ]
    },
    {
      title: 'SMTP in detail',
      src: 'text',
      blocks: [
        { p: 'SMTP is defined in [[RFC 5321]]. It is much older than HTTP (the original RFC dates from 1982) and has some archaic features. Most notably, it restricts the body of every message, not just the headers, to simple [[7-bit ASCII]]. That made sense in the early 1980s but now means binary multimedia must be [[encoded to ASCII]] before SMTP transfer and [[decoded back]] afterwards. HTTP does not require this.' },
        { steps: [
          'The client SMTP (on the sending server) has TCP open a connection to [[port 25]] on the server SMTP (receiving server). If the server is down, the client tries again later.',
          'Application-layer [[handshaking]]: client and server introduce themselves. The client gives the e-mail address of the [[sender]] and of the [[recipient]].',
          'The client [[sends the message]], relying on TCP to deliver it without errors.',
          'If it has more messages for this server, it repeats over the [[same TCP connection]]; otherwise it tells TCP to close the connection.'
        ], title: 'How a transfer works' },
        { table: {
          head: ['Who', 'Line sent', 'Meaning'],
          rows: [
            ['S', '`220 hamburger.edu`', 'Server greets as soon as TCP is up'],
            ['C', '`HELO crepes.fr`', 'Client introduces itself (HELO = HELLO)'],
            ['S', '`250 Hello crepes.fr, pleased to meet you`', 'OK'],
            ['C', '`MAIL FROM: <alice@crepes.fr>`', 'Sender’s address'],
            ['S', '`250 alice@crepes.fr ... Sender ok`', 'OK'],
            ['C', '`RCPT TO: <bob@hamburger.edu>`', 'Recipient’s address'],
            ['S', '`250 bob@hamburger.edu ... Recipient ok`', 'OK'],
            ['C', '`DATA`', 'Message follows'],
            ['S', '`354 Enter mail, end with "." on a line by itself`', 'Go ahead'],
            ['C', '`Do you like ketchup?` / `How about pickles?`', 'The message itself'],
            ['C', '`.`', 'End of message (CRLF.CRLF)'],
            ['S', '`250 Message accepted for delivery`', 'OK'],
            ['C', '`QUIT`', 'Done'],
            ['S', '`221 hamburger.edu closing connection`', 'Server closes']
          ] }, caption: 'The textbook transcript: crepes.fr (C) → hamburger.edu (S), after the TCP connection is up' },
        { list: [
          'The client issues [[five commands]]: `HELO`, `MAIL FROM`, `RCPT TO`, `DATA`, `QUIT`.',
          'End of message: a line containing only a [[single period]]. In ASCII terms every message ends with [[CRLF.CRLF]] (CR = carriage return, LF = line feed).',
          'Every server reply has a [[reply code]] plus an optional English explanation.',
          '[[Persistent connections]]: with several messages for the same receiving server, the client sends them all over one TCP connection. Each message starts with a new `MAIL FROM:`, each ends with an isolated period, and `QUIT` comes only after the last one.'
        ] },
        { p: 'You can talk to an SMTP server yourself with `telnet serverName 25`. You get the 220 reply immediately, then type `HELO`, `MAIL FROM`, `RCPT TO`, `DATA`, the message, a lone `.` and `QUIT`.' },
        { def: 'Handshaking protocol', text: 'A protocol in which the two parties first [[exchange control messages before sending data]]. SMTP handshakes at the application layer (HELO, MAIL FROM, RCPT TO); HTTP does not. Both rely on TCP, whose connection setup is itself a handshake.' },
        { example: {
          q: 'crepes.fr has 3 messages queued for users at hamburger.edu and 2 for users at pizza.it. Using SMTP persistent connections, how many TCP connections, `MAIL FROM:` commands and `QUIT` commands are needed?',
          a: 'One TCP connection per receiving server: **2**. One `MAIL FROM:` per message: 3 + 2 = **5**. One `QUIT` per connection, sent only after all of that server’s messages: **2**. Each message also gets its own `DATA` and ends with its own lone `.`.'
        } },
        { game: 'match-blitz', text: 'Lock in protocol → port (SMTP = TCP 25, DNS = UDP 53, HTTP = TCP 80).' }
      ]
    },
    {
      title: 'SMTP vs HTTP',
      src: 'text',
      blocks: [
        { p: 'Both protocols transfer files (objects) from one host to another, both run over TCP, and both can use [[persistent connections]]. The key differences:' },
        { table: {
          head: ['', 'HTTP', 'SMTP'],
          rows: [
            ['Direction', '[[Pull]]: the host that wants the object opens the TCP connection and requests it', '[[Push]]: the sending mail server opens the TCP connection and pushes the message'],
            ['Data restriction', 'None; binary data can be sent as-is', 'Whole message (headers **and** body) must be [[7-bit ASCII]]'],
            ['Objects per message', 'Each object in its own response message', 'All parts of a message (text, images) placed in [[one message]]'],
            ['End of body', '`Content-Length:` header gives the length in bytes', 'A line with a lone period (`CRLF.CRLF`)'],
            ['Persistent connections', 'Yes (HTTP/1.1 default)', 'Yes (several messages per connection)'],
            ['Handshaking', 'No application-layer handshake', 'Yes (HELO, MAIL FROM, RCPT TO)']
          ] }, caption: 'Push vs pull, ASCII vs binary' },
        { trap: 'Why HTTP cannot use SMTP’s end-of-message marker: an HTTP body can be **binary** data that might happen to contain the bytes CRLF.CRLF, so a lone period would not reliably mark the end. SMTP bodies are 7-bit ASCII text, where the convention is safe. HTTP therefore uses `Content-Length:`.' }
      ]
    },
    {
      title: 'Mail message format',
      src: 'both',
      blocks: [
        { p: 'A mail message is a [[header]] (a series of header lines, defined in [[RFC 5322]]), then a [[blank line]] (CRLF), then the [[body]] (ASCII). As in HTTP, each header line is readable text: a [[keyword, a colon, and a value]].' },
        { list: [
          'Required: every header must have a [[From:]] line and a [[To:]] line.',
          'Optional: [[Subject:]] and other header lines.'
        ] },
        { p: 'A typical message:\n`From: alice@crepes.fr`\n`To: bob@hamburger.edu`\n`Subject: Searching for the meaning of life.`\n(blank line)\n(message body in ASCII)' },
        { trap: 'The `To:`, `From:` and `Subject:` header lines are **part of the mail message itself** (delivered to the user agent). `MAIL FROM:` and `RCPT TO:` are **SMTP commands** in the handshaking between servers. They can differ: spammers forge `From:`, and BCC recipients appear in `RCPT TO:` but not in `To:`.' },
        { p: 'Each mail server (MTA, [[mail transfer agent]]) that handles a message adds a [[Received:]] header line at the top, recording which host it received the message from and when. Reading the Received: lines from bottom (oldest) to top (newest) traces the message’s path, which textbook P17 uses to find a spammer. Honest servers record the true sending host; anything below the first honest server’s line may be forged by the sender.' }
      ]
    },
    {
      title: 'Mail access: where the mailbox lives and how Bob reads it',
      src: 'both',
      blocks: [
        { p: 'Why not run Bob’s mail server on his own PC or phone? A mail server manages mailboxes and runs both sides of SMTP, so Bob’s device would have to be [[always on and connected]], because mail can arrive at any time. That is [[impractical]] for most users. Instead, the user agent runs on the local host and the mailbox sits on an [[always-on shared mail server]] (shared with other users).' },
        { p: 'Sending side: Alice’s user agent uses [[SMTP or HTTP]] to deliver the message to her own mail server, and her mail server, acting as an SMTP client, [[relays]] it to Bob’s mail server with SMTP.' },
        { p: 'Receiving side: Bob’s user agent [[cannot use SMTP]] to get his messages, because retrieving is a [[pull]] operation and SMTP is a [[push]] protocol. Two common methods today:' },
        { list: [
          '[[HTTP]]: used by Web-based e-mail and smartphone apps such as [[Gmail]]. Bob’s mail server then needs an HTTP interface as well as its SMTP interface (for talking to Alice’s server).',
          '[[IMAP]] (Internet Mail Access Protocol, RFC 3501): typically used by desktop clients such as [[Microsoft Outlook]].',
          'Both let Bob [[manage folders]] kept on his mail server: move messages into folders he creates, delete messages, mark messages as important, and so on.'
        ] },
        { table: {
          head: ['Hop', 'Protocol'],
          rows: [
            ['Alice’s user agent → Alice’s mail server', 'SMTP or HTTP'],
            ['Alice’s mail server → Bob’s mail server', 'SMTP (always)'],
            ['Bob’s mail server → Bob’s user agent', 'IMAP or HTTP (never SMTP)']
          ] }, caption: 'Figure 2.16 in words' },
        { example: {
          q: 'Carol writes in desktop Outlook, which sends through her company’s mail server. Dan reads his mail in the Gmail phone app. List the application-layer protocol on each hop.',
          a: 'Carol’s Outlook → Carol’s mail server: **SMTP** (a desktop client pushes outgoing mail with SMTP).\nCarol’s mail server → Dan’s (Gmail) mail server: **SMTP**, server to server, with Carol’s server as the SMTP client.\nDan’s mail server → Dan’s Gmail app: **HTTP**, a pull. SMTP is never used for retrieval.'
        } },
        { p: 'Why TCP? E-mail (like the Web and IMAP access) is [[loss-intolerant]]: every byte must arrive, in order. TCP provides reliable data transfer and UDP does not, so SMTP, IMAP and HTTP all run over TCP.' }
      ]
    }
  ],
  recall: [
    { q: 'Name the three major components of Internet e-mail.', a: 'User agents, mail servers, SMTP.' },
    { q: 'What does a user agent let you do?', a: 'Compose, edit, read, reply to, forward and save mail messages.' },
    { q: 'What two structures does a mail server hold?', a: 'A mailbox per user (incoming messages) and a message queue (outgoing messages).' },
    { q: 'In an SMTP transfer, which server is the client?', a: 'The sending mail server, because it initiates the connection. The receiving server is the SMTP server.' },
    { q: 'What transport and port does SMTP use?', a: 'TCP, port 25.' },
    { q: 'What happens if the recipient’s mail server is down?', a: 'The message stays in the sender’s server queue and is retried (about every 30 min). After several days it is removed and the sender is notified.' },
    { q: 'Does SMTP use intermediate mail servers?', a: 'No. The TCP connection runs directly between the sender’s and recipient’s mail servers.' },
    { q: 'List the five SMTP commands in the textbook transcript, in order.', a: 'HELO, MAIL FROM, RCPT TO, DATA, QUIT.' },
    { q: 'How does SMTP mark the end of a message? How does HTTP mark the end of a body?', a: 'SMTP: a line with a single period (CRLF.CRLF). HTTP: the Content-Length header.' },
    { q: 'What character restriction does SMTP impose?', a: 'The whole message, body included, must be 7-bit ASCII, so binary data must be encoded.' },
    { q: 'Give the three parts of a mail message.', a: 'Header lines, a blank line, the body.' },
    { q: 'Which header lines are required?', a: 'From: and To: (Subject: is optional).' },
    { q: 'How do From:/To: differ from MAIL FROM:/RCPT TO:?', a: 'From:/To: are header lines inside the message. MAIL FROM:/RCPT TO: are SMTP commands in the server-to-server handshake.' },
    { q: 'Why does the sender’s user agent go through its own mail server?', a: 'So the sender’s server can keep retrying if the recipient’s server is temporarily unreachable.' },
    { q: 'Why can’t Bob use SMTP to fetch his mail, and what does he use instead?', a: 'SMTP is a push protocol and fetching is a pull. He uses IMAP (e.g. Outlook) or HTTP (Web mail, Gmail app).' },
    { q: 'Why isn’t the mail server on Bob’s own PC?', a: 'It would have to be always on and connected to receive mail at any time, which is impractical.' },
    { q: 'Name three differences between SMTP and HTTP.', a: 'Push vs pull; SMTP requires 7-bit ASCII; SMTP puts all objects in one message, while HTTP sends one object per response. (Both use persistent connections.)' },
    { q: 'What does MTA stand for?', a: 'Mail transfer agent.' }
  ]
});
