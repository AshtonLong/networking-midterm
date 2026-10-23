# Mini-game spec

Mini-games live in `assets/js/games/<id>.js`, one file per game, plain browser
JavaScript (ES2020, no modules, no imports, no libraries, no build step). Each
file is wrapped in an IIFE and registers itself:

```js
(function () {
  NET.addGame({
    id: 'dns-resolver',            // must equal the file name
    title: 'DNS resolver',         // sentence case
    unit: 2,                       // 1, 2, 3 (chapter); use 0 for cross-chapter
    sections: ['dns'],             // guide section ids this game teaches (see list below)
    blurb: 'One sentence for the games grid: what the player does.',
    how: ['Short bullet on how to play.', 'Keyboard: 1–4 pick, Enter next.'],
    mount(root, kit) {
      // build the UI inside root (an empty .g-stage element)
      // optionally return a cleanup function
    },
  });
})();
```

Preview a game in isolation by opening
`tools/game-harness.html?game=<id>` (add `&theme=dark` for dark mode). The full
app (index.html) mounts games the same way. Syntax-check with
`node --check assets/js/games/<id>.js`. Put pure simulation/answer logic in
plain functions you can sanity-test in node (copy them into a scratch script —
the game file itself expects a browser).

## The `kit` object (see `assets/js/kit.js`)

| member | use |
|---|---|
| `kit.el(tag, attrs, ...children)` | create DOM; attrs: `class`, `text`, `html`, `onclick`, `style` object, any attribute |
| `kit.svg(tag, attrs, ...children)` | create SVG elements |
| `kit.md(tag, cls, s)` / `kit.fmt(s)` | inline markup (`**bold**`, `` `code` ``, `_{sub}`, `^{sup}`) → HTML |
| `kit.hud([[key,label],…,['|'],…])` → `{node, set({key: value})}` | standard status bar; `['|']` inserts a spacer |
| `kit.feedback(node, 'good'|'bad'|'part'|'', s)` | style a `.g-feedback` element and set its text (inline markup) |
| `kit.choices(strings, onPick(i, btn, btns), cls?)` | grid of `.g-opt` buttons; `kit.lock(btns)` disables them |
| `kit.numInput({placeholder, label, width})` | text input for numbers; `kit.checkNum(value, answer, tol=0.02)` |
| `kit.onKey(handler)` | keydown while mounted (ignored inside inputs except Enter/Escape) |
| `kit.after(ms, fn)`, `kit.every(ms, fn)`, `kit.frame(fn)`, `kit.clear(t)` | timers/animation loops auto-cleared on unmount — never use raw setTimeout/setInterval/requestAnimationFrame |
| `kit.finish({score, headline, summary, againLabel})` | standard end screen; records best score; "Play again" remounts |
| `kit.record(score)`, `kit.best()` | persist without the end screen |
| `kit.shuffle(a)`, `kit.rand(lo, hi)`, `kit.pick(a)`, `kit.round(x, sig)` | helpers |
| `kit.reducedMotion` | true if the user prefers reduced motion — skip/shorten animations |

## CSS classes you should use (defined in `assets/css/styles.css`)

`.g-hud .g-stat .g-spacer` status bar · `.g-modes` row of `.chip` buttons
(`aria-pressed="true"` for the active one) · `.g-prompt` question text ·
`.g-sub` secondary line · `.g-card` tinted panel · `.g-opts` + `.g-opt`
(`.is-right`, `.is-wrong`, `.is-picked`) answer buttons · `.g-row`, `.g-actions`
flex rows · `.btn` (`.secondary`, `.ghost`, `.small`, `.good`, `.bad`) buttons ·
`.g-input` (`.is-right`, `.is-wrong`) and `.g-label` inputs · `.g-feedback`
(`.good`, `.bad`, `.part`) · `.g-canvas` wrapper for an SVG · `.g-end` ·
`.g-mono` · `.g-grid2` two columns (stacks on mobile) · `.g-tag` (`.good`,
`.bad`) small pills · `.g-slot` (`.is-target`) drop zones · `.g-token` draggable
tokens · `table.data` tables · `.led` (`.green`, `.amber`, `.off`) status dots ·
`.chip`, `.chip-row`.

If you need a few game-specific styles, inject one `<style>` element from your
file with selectors prefixed by your game id class (e.g. `.gm-dns …`) and put
that class on your top-level container. Only use the CSS custom properties for
colour: `--ink --ink-2 --ink-3 --surface --surface-2 --surface-3 --rule
--rule-strong --u1 --u2 --u3 (chapter colours) --ack --ack-soft (correct) --nak
--nak-soft (wrong) --amber --amber-soft --plate (dark faceplate)` and the fonts
`--font-text --font-display --font-mono`. In SVG use `fill="var(--ink)"` style
attributes or `currentColor`, so dark mode works. No new fonts, no images.

## Design rules

- The games teach. Every wrong answer shows *why* with the rule or the worked
  computation, in one or two sentences. Correct answers get a short confirmation
  plus the key fact.
- Ramp difficulty within a run (first rounds easy, last rounds hard) and offer
  mode chips where it makes sense (e.g. protocol choice).
- Runs are short (8–12 rounds, 2–5 minutes) and end with `kit.finish` showing a
  score out of the maximum and a one-line takeaway.
- Networking logic must be exactly right (textbook conventions: Kurose & Ross 8th ed.).
  Derive answers by computation in code, never hard-code a number that
  could drift from its inputs.
- Keyboard accessible: real `<button>`s, visible focus (already styled), number
  keys for options where natural, Enter to submit/continue. Don't rely on
  drag-and-drop alone — always offer click/keyboard alternatives.
- Responsive down to 360 px wide. SVGs scale (`viewBox`, width 100%); wide
  diagrams go in `.g-canvas` which scrolls horizontally on small screens.
- Motion only in response to the player (a packet travelling after "send", etc.)
  and respect `kit.reducedMotion`.
- Copy: plain, specific, sentence case, no emoji, no exclamation marks, no
  all-caps labels, no "→" on buttons. Buttons say what they do ("Check",
  "Next round", "Send packet").
- No `console.log` left behind; no global variables besides the IIFE.

## Section ids (for `sections`)

foundations, switching, layers, internetworking, edge, delay, app-principles,
http, http-messages, http-advanced, dns, email, p2p, sockets, transport-intro,
mux, udp, rdt-basics, rdt3, pipelining, tcp-basics, tcp-rtt.
