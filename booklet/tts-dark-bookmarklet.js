(() => {
  const TOOLBAR_ID = "tts-dark-toolbar";
  const STYLE_ID = "dev-dark-mode-style";

  // Toggle off if already injected
  const existing = document.getElementById(TOOLBAR_ID);
  if (existing) {
    speechSynthesis.cancel();
    existing.remove();
    return;
  }

  // ---------- State ----------
  let queueIndex = 0;
  let rate = 1;
  let darkOn = false;
  let voices = [];
  let selectedVoice = null;
  let pageChunks = [];
  let pageWrapped = false;
  let activeChunks = [];
  let currentHighlight = null;
  const HIGHLIGHT_STYLE_ID = "tts-highlight-style";

  function loadVoices() {
    voices = speechSynthesis.getVoices();
    if (!voices.length) return;
    const select = document.getElementById("voiceSelect");
    if (!select) return;
    select.innerHTML = voices
      .map((v, i) => `<option value="${i}">${v.name} (${v.lang})</option>`)
      .join("");
    // Try to default to a locale-matching voice
    const defaultIdx = voices.findIndex((v) => v.default) ?? 0;
    select.value = defaultIdx >= 0 ? defaultIdx : 0;
    selectedVoice = voices[select.value];
  }

  // ---------- Word wrapping (for highlight-as-you-read) ----------
  // Wraps every word on the page in a <span> (once) so we can light up
  // the word currently being spoken. Skips scripts, hidden elements,
  // form fields, and our own toolbar.
  function injectHighlightStyle() {
    if (document.getElementById(HIGHLIGHT_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = HIGHLIGHT_STYLE_ID;
    style.textContent = `
      .tts-word.tts-highlight {
        background: #ffe066 !important;
        color: #111 !important;
        border-radius: 2px;
        box-shadow: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Wraps plain text into <span class="tts-word"> elements inside a
  // document fragment, preserving whitespace as plain text nodes.
  // Returns the array of word spans created.
  function wrapWordsIntoFragment(text, frag) {
    const spans = [];
    text.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
      } else {
        const span = document.createElement("span");
        span.className = "tts-word";
        span.textContent = part;
        frag.appendChild(span);
        spans.push(span);
      }
    });
    return spans;
  }

  // Groups a flat list of word spans into speakable chunks
  // (~25 words, breaking on sentence-ending punctuation).
  function groupIntoChunks(wordSpans) {
    const chunks = [];
    let current = [];
    wordSpans.forEach((span) => {
      current.push(span);
      const endsSentence = /[.!?]["')\]]?$/.test(span.textContent);
      if (current.length >= 25 || (endsSentence && current.length >= 8)) {
        chunks.push(buildChunk(current));
        current = [];
      }
    });
    if (current.length) chunks.push(buildChunk(current));
    return chunks;
  }

  function isSkippable(el, skipTags) {
    if (!el) return true;
    if (el.closest(`#${TOOLBAR_ID}`)) return true;
    if (skipTags.has(el.tagName)) return true;
    const style = getComputedStyle(el);
    return style.display === "none" || style.visibility === "hidden";
  }

  const SKIP_TAGS = new Set([
    "SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT",
    "IFRAME", "SVG", "CANVAS", "SELECT", "OPTION",
  ]);

  function prepareWordSpans() {
    if (pageWrapped) return;
    injectHighlightStyle();

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          return isSkippable(node.parentElement, SKIP_TAGS)
            ? NodeFilter.FILTER_REJECT
            : NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const textNodes = [];
    let n;
    while ((n = walker.nextNode())) textNodes.push(n);

    const wordSpans = [];
    textNodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      wordSpans.push(...wrapWordsIntoFragment(node.nodeValue, frag));
      node.parentNode.replaceChild(frag, node);
    });

    pageChunks = groupIntoChunks(wordSpans);
    pageWrapped = true;
  }

  // Wraps only the words inside the current text selection in spans,
  // leaving the rest of the page untouched. Rebuilt fresh each time,
  // since the selection can change between reads.
  function prepareSelectionSpans() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) return [];
    const range = sel.getRangeAt(0);

    const walker = document.createTreeWalker(
      range.commonAncestorContainer,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          if (isSkippable(node.parentElement, SKIP_TAGS)) return NodeFilter.FILTER_REJECT;
          return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
      }
    );

    const textNodes = [];
    let n;
    while ((n = walker.nextNode())) textNodes.push(n);

    injectHighlightStyle();

    const wordSpans = [];
    textNodes.forEach((node) => {
      const start = node === range.startContainer ? range.startOffset : 0;
      const end = node === range.endContainer ? range.endOffset : node.nodeValue.length;
      if (start >= end) return;

      const text = node.nodeValue;
      const frag = document.createDocumentFragment();
      const before = text.slice(0, start);
      const middle = text.slice(start, end);
      const after = text.slice(end);
      if (before) frag.appendChild(document.createTextNode(before));
      wordSpans.push(...wrapWordsIntoFragment(middle, frag));
      if (after) frag.appendChild(document.createTextNode(after));
      node.parentNode.replaceChild(frag, node);
    });

    sel.removeAllRanges(); // clear selection so it doesn't visually clash with highlighting
    return groupIntoChunks(wordSpans);
  }

  function buildChunk(spans) {
    let offset = 0;
    const starts = spans.map((s) => {
      const start = offset;
      offset += s.textContent.length + 1; // +1 for the joining space
      return start;
    });
    return { text: spans.map((s) => s.textContent).join(" "), spans, starts };
  }

  function highlightWordAt(chunk, charIndex) {
    let idx = 0;
    for (let i = 0; i < chunk.starts.length; i++) {
      if (chunk.starts[i] <= charIndex) idx = i;
      else break;
    }
    const span = chunk.spans[idx];
    if (currentHighlight && currentHighlight !== span) {
      currentHighlight.classList.remove("tts-highlight");
    }
    span.classList.add("tts-highlight");
    currentHighlight = span;
    span.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  function clearHighlight() {
    if (currentHighlight) {
      currentHighlight.classList.remove("tts-highlight");
      currentHighlight = null;
    }
  }

  function speakPageWithHighlight() {
    prepareWordSpans();
    activeChunks = pageChunks;
    clearHighlight();
    speechSynthesis.cancel();
    queueIndex = 0;
    playNextHighlightedChunk();
  }

  function speakSelectionWithHighlight() {
    const chunks = prepareSelectionSpans();
    if (!chunks.length) return;
    activeChunks = chunks;
    clearHighlight();
    speechSynthesis.cancel();
    queueIndex = 0;
    playNextHighlightedChunk();
  }

  function playNextHighlightedChunk() {
    if (queueIndex >= activeChunks.length) {
      clearHighlight();
      return;
    }
    const chunk = activeChunks[queueIndex];
    const utter = new SpeechSynthesisUtterance(chunk.text);
    utter.rate = rate;
    if (selectedVoice) utter.voice = selectedVoice;
    utter.onboundary = (e) => {
      if (typeof e.charIndex === "number") highlightWordAt(chunk, e.charIndex);
    };
    utter.onend = () => {
      queueIndex++;
      playNextHighlightedChunk();
    };
    speechSynthesis.speak(utter);
  }

  // ---------- Toolbar UI ----------
  const div = document.createElement("div");
  div.id = TOOLBAR_ID;
  div.innerHTML = `
    <div id="tts-drag-handle" style="cursor:move;font-weight:bold;margin-bottom:6px;user-select:none;">
      🔊 Reader
    </div>
    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px;">
      <button id="speakPage">▶ Read</button>
      <button id="pauseSpeak">⏸ Pause</button>
      <button id="stopSpeak">■ Stop</button>
      <button id="speakSel">📖 Selection</button>
    </div>
    <div style="margin-bottom:6px;">
      <label for="voiceSelect" style="font-size:12px;display:block;margin-bottom:2px;">Voice</label>
      <select id="voiceSelect" style="width:100%;background:#2b2b2b;color:#eee;border:1px solid #555;border-radius:4px;font-size:12px;"></select>
    </div>
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
      <label for="rateSlider" style="font-size:12px;">Speed</label>
      <input id="rateSlider" type="range" min="0.5" max="2" step="0.1" value="1" style="flex:1;">
      <span id="rateVal" style="font-size:12px;width:28px;">1.0x</span>
    </div>
    <button id="toggleDark" style="width:100%;">🌙 Dark Mode</button>
  `;

  Object.assign(div.style, {
    position: "fixed",
    top: "15px",
    right: "15px",
    background: "#222",
    color: "white",
    padding: "10px",
    borderRadius: "8px",
    zIndex: 999999,
    fontFamily: "Arial",
    width: "220px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  });
  div.querySelectorAll("button").forEach((b) =>
    Object.assign(b.style, {
      background: "#333",
      color: "white",
      border: "1px solid #555",
      borderRadius: "4px",
      padding: "4px 6px",
      cursor: "pointer",
      fontSize: "12px",
    })
  );
  document.body.appendChild(div);

  // ---------- Drag support ----------
  const handle = div.querySelector("#tts-drag-handle");
  let dragging = false, offX = 0, offY = 0;
  handle.addEventListener("mousedown", (e) => {
    dragging = true;
    offX = e.clientX - div.getBoundingClientRect().left;
    offY = e.clientY - div.getBoundingClientRect().top;
  });
  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    div.style.left = e.clientX - offX + "px";
    div.style.top = e.clientY - offY + "px";
    div.style.right = "auto";
  });
  document.addEventListener("mouseup", () => (dragging = false));

  // ---------- TTS controls ----------
  div.querySelector("#speakPage").onclick = () => {
    speakPageWithHighlight();
  };

  div.querySelector("#pauseSpeak").onclick = (e) => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      e.target.textContent = "▶ Resume";
    } else if (speechSynthesis.paused) {
      speechSynthesis.resume();
      e.target.textContent = "⏸ Pause";
    }
  };

  div.querySelector("#stopSpeak").onclick = (e) => {
    speechSynthesis.cancel();
    queueIndex = 0;
    clearHighlight();
    div.querySelector("#pauseSpeak").textContent = "⏸ Pause";
  };

  div.querySelector("#speakSel").onclick = () => {
    speakSelectionWithHighlight();
  };

  const slider = div.querySelector("#rateSlider");
  const rateVal = div.querySelector("#rateVal");
  slider.oninput = () => {
    rate = parseFloat(slider.value);
    rateVal.textContent = rate.toFixed(1) + "x";
  };

  const voiceSelect = div.querySelector("#voiceSelect");
  voiceSelect.onchange = () => {
    selectedVoice = voices[voiceSelect.value];
  };

  // Chrome loads voices asynchronously — populate now and again when ready
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;

  // ---------- Dark mode ----------
  function applyDark() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      :root { color-scheme: dark !important; }
      html { background: #121212 !important; filter: none !important; }
      body { background: #121212 !important; color: #e6e6e6 !important; }
      * {
        background-color: transparent !important;
        border-color: #444 !important;
        color: inherit !important;
        box-shadow: none !important;
      }
      div, section, article, nav, aside, header, footer,
      main, table, td, th, tr, ul, ol, li,
      form, fieldset, details, summary {
        background-color: #1b1b1b !important;
      }
      input, textarea, select, button {
        background: #2b2b2b !important;
        color: #eee !important;
        border: 1px solid #555 !important;
      }
      a { color: #64b5ff !important; }
      a:visited { color: #c792ea !important; }
      code, pre { background: #202020 !important; color: #90ee90 !important; }
      img, picture, video, canvas, svg { filter: brightness(.9) contrast(1.05) !important; }
      img:not([src*=".svg"]) { background: transparent !important; }
      ::selection { background: #0d47a1; color: white; }
    `;
    document.head.appendChild(style);
  }

  function removeDark() {
    document.getElementById(STYLE_ID)?.remove();
  }

  div.querySelector("#toggleDark").onclick = (e) => {
    darkOn = !darkOn;
    if (darkOn) {
      applyDark();
      e.target.textContent = "☀ Light Mode";
    } else {
      removeDark();
      e.target.textContent = "🌙 Dark Mode";
    }
  };

  console.log("🔊🌙 TTS + Dark Mode toolbar loaded. Click the toolbar toggle button (rerun this script) to remove it.");
})();