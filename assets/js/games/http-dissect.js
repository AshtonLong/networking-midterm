(function () {
  const ROUNDS = 10;
  const CATEGORIES = ['Request line', 'Status line', 'Header line', 'Blank line', 'Body line'];

  function line(text, type, why) { return { text, type, why }; }
  function exchange(request, requestHeaders, requestBody, response, responseHeaders, responseBody) {
    const rows = request.slice();
    requestHeaders.forEach(x => rows.push(x));
    rows.push(line('', 'Blank line', 'The empty line ends the HTTP headers. Any message body begins after it.'));
    (requestBody || []).forEach(x => rows.push(x));
    // Message framing ends the request body; an extra blank line is not part
    // of HTTP syntax. Mark the next response line as a visual boundary instead.
    response.forEach((x, i) => rows.push(i === 0 ? Object.assign({}, x, { exchangeStart: true }) : x));
    responseHeaders.forEach(x => rows.push(x));
    rows.push(line('', 'Blank line', 'The empty line ends the HTTP headers. Any message body begins after it.'));
    (responseBody || []).forEach(x => rows.push(x));
    return rows;
  }

  function makeRound(round) {
    const samples = [
      {
        targetText: 'GET /index.html HTTP/1.1',
        rows: exchange([line('GET /index.html HTTP/1.1', 'Request line', '`GET` asks the server to send the selected resource. The request line has a method, target, and HTTP version.')], [
          line('Host: www.example.net', 'Header line', '`Host` names the target authority. HTTP/1.1 requests require a Host field.'),
          line('Accept-Language: en', 'Header line', '`Accept-Language` tells the server which natural languages the client prefers.')
        ], [], [line('HTTP/1.1 200 OK', 'Status line', '`200 OK` is a successful response status line. It begins with the HTTP version, then a status code and reason phrase.')], [
          line('Content-Type: text/html', 'Header line', '`Content-Type` describes the media type of the representation in the body.'),
          line('Content-Length: 33', 'Header line', '`Content-Length` gives the message-body size in bytes for this response.')
        ], [line('<html><body>Welcome</body></html>', 'Body line', 'The body carries the returned representation. Here it is HTML requested with GET.')])
      },
      {
        targetText: 'Host: www.example.net',
        rows: exchange([line('HEAD /catalog HTTP/1.1', 'Request line', '`HEAD` requests the headers a GET would return, without a response body.')], [
          line('Host: www.example.net', 'Header line', '`Host` is a request header that names the target authority, which lets a server or proxy select the right Web site. This sample uses `HEAD`, which returns the headers a GET would return without a response body.'),
          line('Connection: keep-alive', 'Header line', '`Connection` communicates connection-specific options. HTTP/1.1 connections are persistent by default unless closed.')
        ], [], [line('HTTP/1.1 200 OK', 'Status line', '`200 OK` reports successful handling of the request.')], [line('Content-Type: text/plain', 'Header line', '`Content-Type` identifies the representation as plain text.')], [])
      },
      {
        targetText: '',
        rows: exchange([line('GET /weather HTTP/1.1', 'Request line', '`GET` requests the weather resource.')], [
          line('Host: api.example.net', 'Header line', '`Host` identifies the authority receiving the request.'),
          line('User-Agent: StudyBrowser/1.0', 'Header line', '`User-Agent` identifies information about the client software.')
        ], [], [line('HTTP/1.1 200 OK', 'Status line', '`200 OK` indicates a successful response.')], [
          line('Date: Thu, 22 Oct 2026 12:00:00 GMT', 'Header line', '`Date` gives the time the response was generated.'),
          line('Content-Type: application/json', 'Header line', '`Content-Type` says the response representation is JSON.')
        ], [line('{"forecast":"sunny"}', 'Body line', 'The JSON text is the response body, after the header/body separator.')])
      },
      {
        targetText: 'HTTP/1.1 200 OK',
        rows: exchange([line('GET /logo.png HTTP/1.1', 'Request line', '`GET` asks for the image representation.')], [line('Host: images.example.net', 'Header line', '`Host` names the request authority.')], [], [
          line('HTTP/1.1 200 OK', 'Status line', '`200 OK` is a 2xx success status: the server found and returned the requested representation.'),
          line('Server: ExampleHTTP/2.4', 'Header line', '`Server` provides information about the software handling the response.'),
          line('Content-Type: image/png', 'Header line', '`Content-Type` identifies the returned media as PNG image data.')
        ], [line('Content-Length: 2048', 'Header line', '`Content-Length` gives the response body length in bytes.')], [line('[PNG image data]', 'Body line', 'The body contains the requested image bytes; the bracketed text here represents those bytes.')])
      },
      {
        targetText: 'Content-Type: application/json',
        rows: exchange([line('POST /comments HTTP/1.1', 'Request line', '`POST` submits data to the target resource.')], [
          line('Host: forum.example.net', 'Header line', '`Host` identifies the target Web authority.'),
          line('Content-Type: application/json', 'Header line', 'This request header identifies the body’s format so the server can interpret the submitted JSON.'),
          line('Content-Length: 16', 'Header line', '`Content-Length` states the size of the request body in bytes.')
        ], [line('{"text":"Hello"}', 'Body line', 'The JSON comment is the request body; POST submits this data to the server.')], [line('HTTP/1.1 201 Created', 'Status line', '`201 Created` means the request succeeded and created a resource.')], [line('Content-Type: text/plain', 'Header line', '`Content-Type` identifies the response representation format.')], [line('Comment saved', 'Body line', 'This text is the response body.')])
      },
      {
        targetText: '<p>Welcome back.</p>',
        rows: exchange([line('GET /home HTTP/1.1', 'Request line', '`GET` requests the home representation.')], [line('Host: www.example.net', 'Header line', '`Host` identifies the destination authority.')], [], [line('HTTP/1.1 200 OK', 'Status line', '`200 OK` reports a successful response.')], [
          line('Content-Type: text/html', 'Header line', '`Content-Type` identifies the returned representation as HTML.'),
          line('Content-Length: 20', 'Header line', '`Content-Length` gives the number of body bytes.')
        ], [line('<p>Welcome back.</p>', 'Body line', 'This HTML is body content. Body lines follow the empty separator and are not header metadata.')])
      },
      {
        targetText: 'POST /search HTTP/1.1',
        rows: exchange([line('POST /search HTTP/1.1', 'Request line', '`POST` submits the search data to the target. The request line contains the method, target, and HTTP version.')], [
          line('Host: search.example.net', 'Header line', '`Host` identifies the site receiving the request.'),
          line('Content-Type: application/x-www-form-urlencoded', 'Header line', '`Content-Type` describes the submitted request-body format.'),
          line('Content-Length: 10', 'Header line', '`Content-Length` gives the submitted body size in bytes.')
        ], [line('q=networks', 'Body line', 'The search parameter is in the request body.')], [line('HTTP/1.1 200 OK', 'Status line', '`200 OK` indicates the server successfully returned a response.')], [line('Content-Type: text/html', 'Header line', '`Content-Type` identifies the returned representation format.')], [line('<p>Results</p>', 'Body line', 'The HTML results are the response body.')])
      },
      {
        targetText: 'If-Modified-Since: Mon, 19 Oct 2026 09:00:00 GMT',
        rows: exchange([line('GET /manual.pdf HTTP/1.1', 'Request line', '`GET` requests the PDF representation.')], [
          line('Host: docs.example.net', 'Header line', '`Host` names the destination authority.'),
          line('If-Modified-Since: Mon, 19 Oct 2026 09:00:00 GMT', 'Header line', 'This conditional request header asks for the object only if it changed since the supplied time. Its date comes from an earlier `Last-Modified` response header.')
        ], [], [line('HTTP/1.1 304 Not Modified', 'Status line', '`304 Not Modified` says the cached representation is still current; the response has no entity body.')], [
          line('Date: Thu, 22 Oct 2026 12:00:00 GMT', 'Header line', '`Date` records when this response was generated.'),
          line('Last-Modified: Mon, 19 Oct 2026 09:00:00 GMT', 'Header line', '`Last-Modified` gives the representation’s modification time and can be used for later revalidation.')
        ], [])
      },
      {
        targetText: 'HTTP/1.1 304 Not Modified',
        rows: exchange([line('GET /news.html HTTP/1.1', 'Request line', '`GET` requests the news representation.')], [
          line('Host: news.example.net', 'Header line', '`Host` identifies the request authority.'),
          line('If-None-Match: "v7"', 'Header line', '`If-None-Match` carries an entity tag so a cache can ask whether its stored representation is still current.')
        ], [], [line('HTTP/1.1 304 Not Modified', 'Status line', '`304 Not Modified` is a response status line. The client can reuse its cached copy, so this response has no entity body.'),
          line('ETag: "v7"', 'Header line', '`ETag` is a validator for a representation and can be compared with `If-None-Match`.')
        ], [], [])
      },
      {
        targetText: 'HTTP/1.1 405 Method Not Allowed',
        rows: exchange([line('POST /archive HTTP/1.1', 'Request line', '`POST` attempts to submit data to the archive resource.')], [line('Host: library.example.net', 'Header line', '`Host` identifies the target site.')], [], [
          line('HTTP/1.1 405 Method Not Allowed', 'Status line', '`405 Method Not Allowed` means the resource does not support this method. It is a 4xx client-error response; `404 Not Found` instead means the requested resource was not found.'),
          line('Allow: GET, HEAD', 'Header line', '`Allow` lists methods supported by the resource; here it explains why the POST was rejected.'),
          line('Content-Length: 0', 'Header line', '`Content-Length: 0` indicates an empty response body.')
        ], [], [])
      }
    ];
    const sample = samples[round];
    const targetIndex = sample.rows.findIndex(row => row.text === sample.targetText);
    return { rows: sample.rows, targetIndex };
  }

  NET.addGame({
    id: 'http-dissect',
    title: 'HTTP dissect',
    unit: 2,
    sections: ['http-messages', 'http-advanced'],
    blurb: 'Classify HTTP message lines and learn what common methods, headers, and status codes mean.',
    how: [
      'Classify the highlighted line in each HTTP request or response.',
      'The sample marks an empty CRLF separator as [blank line] so it remains visible.',
      'Keys: 1–5 choose an answer; Enter goes to the next round.'
    ],
    mount(root, kit) {
      const { el } = kit;
      const style = el('style', { text: '.gm-http-dissect .gm-http-log { overflow-x:auto; padding:10px; margin-bottom:14px; background:var(--surface-2); border:1px solid var(--rule); border-radius:8px; } .gm-http-dissect .gm-http-line { display:grid; grid-template-columns:2.2em max-content; gap:10px; min-height:1.55em; white-space:pre; font: .9rem/1.55 var(--font-mono); } .gm-http-dissect .gm-http-line .gm-n { text-align:right; color:var(--ink-3); user-select:none; } .gm-http-dissect .gm-http-line .gm-code { color:var(--ink); } .gm-http-dissect .gm-http-line.is-target { background:var(--amber-soft); outline:1px solid var(--amber); border-radius:3px; } .gm-http-dissect .gm-http-line.is-blank .gm-code { color:var(--ink-3); font-style:italic; } .gm-http-dissect .gm-http-line.is-exchange-start { border-top:1px solid var(--rule-strong); padding-top:5px; margin-top:5px; }' });
      const hud = kit.hud([['round', 'Round'], ['score', 'Correct'], ['|'], ['best', 'Best']]);
      const prompt = el('p', { class: 'g-prompt' });
      const sub = el('p', { class: 'g-sub' }, 'Classify the highlighted line. [blank line] is notation for an empty CRLF line.');
      const log = el('div', { class: 'gm-http-log', role: 'group', 'aria-label': 'HTTP message sample' });
      const optionHost = el('div');
      const feedback = el('div', { class: 'g-feedback', 'aria-live': 'polite' });
      const next = el('button', { class: 'btn', type: 'button', hidden: true }, 'Next round');
      const stage = el('div', { class: 'gm-http-dissect' }, style, hud.node, prompt, sub, log, optionHost, feedback, el('div', { class: 'g-actions' }, next));
      root.appendChild(stage);

      let round = 0, score = 0, answered = false, currentButtons = [];
      let current = null;
      function load() {
        answered = false;
        current = makeRound(round);
        prompt.textContent = `Line ${current.targetIndex + 1}: what kind of HTTP line is highlighted?`;
        log.replaceChildren(...current.rows.map((row, i) => {
          const target = i === current.targetIndex;
          const isBlank = row.type === 'Blank line';
          return el('div', { class: `gm-http-line${target ? ' is-target' : ''}${isBlank ? ' is-blank' : ''}${row.exchangeStart ? ' is-exchange-start' : ''}`, 'aria-current': target ? 'true' : null, 'aria-label': `${i + 1}${row.exchangeStart ? ', response begins' : ''}${target ? ', highlighted' : ''}: ${isBlank ? 'blank line' : row.text}` },
            el('span', { class: 'gm-n', 'aria-hidden': 'true' }, String(i + 1).padStart(2, '0')),
            el('span', { class: 'gm-code' }, target && isBlank ? '[blank line]' : row.text));
        }));
        hud.set({ round: `${round + 1}/${ROUNDS}`, score, best: kit.best() });
        kit.feedback(feedback, '', '');
        next.hidden = true;
        const opts = kit.choices(CATEGORIES, (i, btn, btns) => choose(i, btn, btns), 'g-opts');
        currentButtons = opts.buttons;
        optionHost.replaceChildren(opts);
        currentButtons[0].focus();
      }
      function choose(index, btn, btns) {
        if (answered) return;
        answered = true;
        const target = current.rows[current.targetIndex];
        const selected = CATEGORIES[index];
        const ok = selected === target.type;
        if (ok) score++;
        btn.classList.add(ok ? 'is-right' : 'is-wrong');
        btns.forEach((b, i) => { if (CATEGORIES[i] === target.type) b.classList.add('is-right'); });
        kit.lock(btns);
        kit.feedback(feedback, ok ? 'good' : 'bad', `${ok ? '**Correct.** ' : `**Not quite.** This is a **${target.type.toLowerCase()}**. `}${target.why}`);
        hud.set({ score });
        next.textContent = round === ROUNDS - 1 ? 'See score' : 'Next round';
        next.hidden = false;
        next.focus();
      }
      function advance() {
        round++;
        if (round >= ROUNDS) {
          kit.finish({ score, headline: `${score} / ${ROUNDS}`, summary: score >= 8 ? 'You can separate the request/status lines, headers, separator, and body.' : 'Read from the start line through headers, then the empty separator, then the body. Methods and status codes belong in the first line of their message.' });
          return;
        }
        load();
      }
      next.addEventListener('click', advance);
      kit.onKey(e => {
        if (answered && e.key === 'Enter' && e.target !== next) { e.preventDefault(); advance(); return; }
        if (!answered && /^[1-5]$/.test(e.key) && currentButtons[Number(e.key) - 1]) {
          e.preventDefault(); currentButtons[Number(e.key) - 1].click();
        }
      });
      load();
    }
  });
})();
