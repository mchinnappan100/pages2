/* ══════════════════════════════════════════════════
   DiffForge — app.js
   ══════════════════════════════════════════════════ */

/* ── Global state ── */
const state = {
  rawA: '',
  rawB: '',
  contentA: '',
  contentB: '',
  fileNameA: 'file-a.xml',
  fileNameB: 'file-b.xml',
  lang: 'xml',
  diffMode: 'inline',
  diffType: 'semantic',
  theme: 'dark',
  diffEditor: null,
  modelsCreated: false
};

/* ══════════════════════════════════════════════════
   THEME
   ══════════════════════════════════════════════════ */
function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  const icon = document.getElementById('themeIcon');
  if (state.theme === 'light') {
    icon.setAttribute('d', 'M12 3C9 3 6.5 5.5 6.5 8.5S9 14 12 14c3 0 5.5-2.5 5.5-5.5A5.5 5.5 0 0012 3z');
  } else {
    icon.setAttribute('d', 'M8 3V1M8 15v-2M3 8H1M15 8h-2M4.2 4.2L2.8 2.8M13.2 13.2l-1.4-1.4M4.2 11.8l-1.4 1.4M13.2 2.8l-1.4 1.4M11 8a3 3 0 11-6 0 3 3 0 016 0z');
  }
  if (state.diffEditor) {
    monaco.editor.setTheme(state.theme === 'dark' ? 'df-dark' : 'df-light');
  }
  if (merge.editorM) {
    monaco.editor.setTheme(state.theme === 'dark' ? 'df-dark' : 'df-light');
  }
}

document.getElementById('themeToggle').addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
});

/* ══════════════════════════════════════════════════
   UTILITIES
   ══════════════════════════════════════════════════ */
function fmtSize(s) {
  const b = new Blob([s]).size;
  return b < 1024 ? b + ' B' : (b / 1024).toFixed(1) + ' KB';
}

function detectLang(name) {
  const ext = name.split('.').pop().toLowerCase();
  const map = {
    xml:'xml', meta:'xml', object:'xml', field:'xml', layout:'xml',
    profile:'xml', permissionset:'xml', flow:'xml', workflow:'xml',
    page:'xml', component:'xml', app:'xml',
    json:'json',
    apex:'apex', cls:'apex', trigger:'apex',
    js:'javascript', html:'html', htm:'html', css:'css',
  };
  return map[ext] || 'plaintext';
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}

/* ══════════════════════════════════════════════════
   FORMAT / NORMALIZE
   ══════════════════════════════════════════════════ */
function formatXML(src) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(src.trim(), 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error('parse error');
    function serializeNode(node, depth) {
      const tab = '  ', indent = tab.repeat(depth);
      if (node.nodeType === Node.TEXT_NODE) {
        const t = node.textContent.trim();
        return t ? indent + t + '\n' : '';
      }
      if (node.nodeType === Node.COMMENT_NODE) return indent + '<!--' + node.textContent + '-->\n';
      if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE)
        return indent + '<?' + node.target + ' ' + node.data + '?>\n';
      if (node.nodeType !== Node.ELEMENT_NODE) return '';
      let attrs = '';
      for (const a of node.attributes) attrs += ' ' + a.name + '="' + a.value + '"';
      const tag = node.tagName;
      const children = Array.from(node.childNodes);
      const childText = children.filter(c => c.nodeType === Node.TEXT_NODE && c.textContent.trim());
      if (children.length === 0) return indent + '<' + tag + attrs + '/>\n';
      if (childText.length === children.length)
        return indent + '<' + tag + attrs + '>' + node.textContent.trim() + '</' + tag + '>\n';
      let inner = '';
      for (const child of children) inner += serializeNode(child, depth + 1);
      return indent + '<' + tag + attrs + '>\n' + inner + indent + '</' + tag + '>\n';
    }
    let out = '<?xml version="1.0" encoding="UTF-8"?>\n';
    for (const child of doc.childNodes) {
      if (child.nodeType === Node.PROCESSING_INSTRUCTION_NODE) continue;
      out += serializeNode(child, 0);
    }
    return out.trim();
  } catch {
    let formatted = '', indent = 0;
    const tab = '  ';
    src.replace(/>\s*</g, '>\n<').split('\n').forEach(node => {
      const n = node.trim(); if (!n) return;
      if (n.startsWith('</')) indent--;
      formatted += tab.repeat(Math.max(0, indent)) + n + '\n';
      if (!n.startsWith('</') && !n.endsWith('/>') && !n.includes('</') && n.startsWith('<') && !n.startsWith('<?') && !n.startsWith('<!')) indent++;
    });
    return formatted.trim();
  }
}

function formatJSON(src) {
  try { return JSON.stringify(JSON.parse(src), null, 2); } catch { return src; }
}

function formatContent(content, lang) {
  if (lang === 'xml') return formatXML(content);
  if (lang === 'json') return formatJSON(content);
  return content;
}

function normalizeForSemantic(content, lang) {
  if (lang === 'xml') return formatXML(content.replace(/>\s+</g, '><').trim());
  if (lang === 'json') return formatJSON(content);
  return content;
}

/* ══════════════════════════════════════════════════
   MONACO SETUP
   ══════════════════════════════════════════════════ */
require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });
require(['vs/editor/editor.main'], function() {

  monaco.editor.defineTheme('df-dark', {
    base: 'vs-dark', inherit: true,
    rules: [
      { token: 'tag', foreground: '7c6af7' },
      { token: 'attribute.name', foreground: '60a5fa' },
      { token: 'attribute.value', foreground: '34d399' },
      { token: 'string', foreground: '34d399' },
      { token: 'number', foreground: 'fbbf24' },
      { token: 'keyword', foreground: 'f472b6' },
    ],
    colors: {
      'editor.background': '#18181c',
      'editor.foreground': '#e8e8f0',
      'editor.lineHighlightBackground': '#1e1e24',
      'editorLineNumber.foreground': '#3a3a4a',
      'editorLineNumber.activeForeground': '#7c6af7',
      'editor.selectionBackground': '#7c6af730',
      'diffEditor.insertedTextBackground': '#34d39920',
      'diffEditor.removedTextBackground': '#f8717120',
      'diffEditor.insertedLineBackground': '#34d39910',
      'diffEditor.removedLineBackground': '#f8717110',
      'diffEditorGutter.insertedLineBackground': '#34d39930',
      'diffEditorGutter.removedLineBackground': '#f8717130',
      'scrollbarSlider.background': '#3a3a4a60',
      'editorWidget.background': '#18181c',
      'minimap.background': '#14141800',
    }
  });

  monaco.editor.defineTheme('df-light', {
    base: 'vs', inherit: true,
    rules: [
      { token: 'tag', foreground: '5a48d4' },
      { token: 'attribute.name', foreground: '2563eb' },
      { token: 'attribute.value', foreground: '059669' },
      { token: 'string', foreground: '059669' },
      { token: 'number', foreground: 'd97706' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#18181c',
      'editorLineNumber.foreground': '#b4b4c8',
      'editorLineNumber.activeForeground': '#5a48d4',
      'editor.selectionBackground': '#5a48d430',
      'diffEditor.insertedTextBackground': '#05966920',
      'diffEditor.removedTextBackground': '#dc262620',
      'diffEditor.insertedLineBackground': '#05966910',
      'diffEditor.removedLineBackground': '#dc262610',
      'diffEditorGutter.insertedLineBackground': '#05966930',
      'diffEditorGutter.removedLineBackground': '#dc262630',
    }
  });

  state.diffEditor = monaco.editor.createDiffEditor(document.getElementById('monaco-container'), {
    theme: 'df-dark',
    renderSideBySide: false,
    ignoreTrimWhitespace: true,
    diffAlgorithm: 'advanced',
    enableSplitViewResizing: true,
    originalEditable: true,
    modifiedEditable: true,
    fontSize: 13,
    fontFamily: "'JetBrains Mono', monospace",
    fontLigatures: true,
    lineHeight: 21,
    scrollBeyondLastLine: false,
    minimap: { enabled: true, scale: 1 },
    renderOverviewRuler: true,
    scrollbar: { vertical: 'auto', horizontal: 'auto' },
    padding: { top: 12, bottom: 12 },
    wordWrap: 'on',
    diffWordWrap: 'on',
  });

  function setModels() {
    const existing = state.diffEditor.getModel();
    if (existing) { existing.original.dispose(); existing.modified.dispose(); }
    let srcA = state.rawA || state.contentA;
    let srcB = state.rawB || state.contentB;
    if (state.diffType === 'semantic') {
      srcA = normalizeForSemantic(srcA, state.lang);
      srcB = normalizeForSemantic(srcB, state.lang);
    }
    const orig = monaco.editor.createModel(srcA, state.lang);
    const mod  = monaco.editor.createModel(srcB, state.lang);
    state.diffEditor.setModel({ original: orig, modified: mod });
    state.modelsCreated = true;
    setTimeout(() => { updateDiffStats(); updateStatus(); }, 300);
  }

  window._setModels = setModels;
  window._monaco = monaco;

  if (state.rawA !== '' && state.rawB !== '') {
    setModels();
    showEditorArea();
  }

  state.diffEditor.onDidUpdateDiff(() => updateDiffStats());
  const ro = new ResizeObserver(() => state.diffEditor.layout());
  ro.observe(document.getElementById('monaco-container'));
});

/* ══════════════════════════════════════════════════
   DIFF EDITOR UI
   ══════════════════════════════════════════════════ */
function updateDiffStats() {
  if (!state.diffEditor) return;
  const changes = state.diffEditor.getLineChanges();
  if (!changes) return;
  let ins = 0, del = 0;
  changes.forEach(c => {
    if (c.modifiedEndLineNumber >= c.modifiedStartLineNumber)
      ins += c.modifiedEndLineNumber - c.modifiedStartLineNumber + 1;
    if (c.originalEndLineNumber >= c.originalStartLineNumber)
      del += c.originalEndLineNumber - c.originalStartLineNumber + 1;
  });
  document.getElementById('insCount').textContent = ins;
  document.getElementById('delCount').textContent = del;
}

function updateModeBadge() {
  const typeLabel = state.diffType === 'semantic' ? 'Semantic' : 'Whitespace';
  const modeLabel = state.diffMode === 'inline' ? 'Inline' : 'Split';
  document.getElementById('modeBadge').innerHTML = `
    <svg width="10" height="10" viewBox="0 0 10 10" fill="var(--accent)"><circle cx="5" cy="5" r="4"/></svg>
    ${typeLabel} · ${modeLabel}
  `;
}

function updateStatus() {
  document.getElementById('langStatus').textContent = state.lang.toUpperCase();
  let cA = state.contentA, cB = state.contentB;
  if (state.diffEditor && state.modelsCreated) {
    const m = state.diffEditor.getModel();
    if (m) { cA = m.original.getValue(); cB = m.modified.getValue(); }
  }
  document.getElementById('sizeStatus').textContent = fmtSize(cA) + ' / ' + fmtSize(cB);
  document.getElementById('lineStatus').textContent = cA.split('\n').length + ' / ' + cB.split('\n').length + ' lines';
}

function showEditorArea() {
  document.getElementById('uploadPanel').classList.add('hidden');
  document.getElementById('editorArea').classList.add('visible');
  document.getElementById('labelA').textContent = state.fileNameA;
  document.getElementById('labelB').textContent = state.fileNameB;
  document.getElementById('editorHeader').style.display = state.diffMode === 'side' ? 'grid' : 'none';
  updateModeBadge();
  updateStatus();
}

/* ══════════════════════════════════════════════════
   FILE READING
   ══════════════════════════════════════════════════ */
function readFile(file, which) {
  const reader = new FileReader();
  reader.onload = e => {
    const content = e.target.result;
    const lang = detectLang(file.name);
    if (which === 'A') {
      state.rawA = content; state.contentA = content; state.fileNameA = file.name;
      state.lang = lang;
      document.getElementById('langSelect').value = lang in {xml:1,json:1,javascript:1,html:1,css:1,plaintext:1} ? lang : 'xml';
      document.getElementById('nameA').textContent = file.name;
      document.getElementById('badgeA').classList.add('visible');
      const ta = document.getElementById('pasteA'); if (ta) ta.value = content;
    } else {
      state.rawB = content; state.contentB = content; state.fileNameB = file.name;
      document.getElementById('nameB').textContent = file.name;
      document.getElementById('badgeB').classList.add('visible');
      const ta = document.getElementById('pasteB'); if (ta) ta.value = content;
    }
    if (state.rawA !== '' && state.rawB !== '') {
      if (window._setModels) { window._setModels(); showEditorArea(); }
    }
  };
  reader.readAsText(file);
}

document.getElementById('fileInputA').addEventListener('change', e => { if (e.target.files[0]) readFile(e.target.files[0], 'A'); });
document.getElementById('fileInputB').addEventListener('change', e => { if (e.target.files[0]) readFile(e.target.files[0], 'B'); });

['A','B'].forEach(which => {
  const zone = document.getElementById('drop' + which);
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0]; if (file) readFile(file, which);
  });
});

/* ══════════════════════════════════════════════════
   TOOLBAR CONTROLS
   ══════════════════════════════════════════════════ */
function activatePill(groupId, value, stateProp) {
  document.querySelectorAll('#' + groupId + ' .pill').forEach(p => {
    p.classList.toggle('active', p.dataset[stateProp === 'diffMode' ? 'mode' : 'type'] === value);
  });
}

document.getElementById('diffModeGroup').addEventListener('click', e => {
  const pill = e.target.closest('.pill'); if (!pill) return;
  state.diffMode = pill.dataset.mode;
  activatePill('diffModeGroup', state.diffMode, 'diffMode');
  if (state.diffEditor) {
    state.diffEditor.updateOptions({ renderSideBySide: state.diffMode === 'side' });
    document.getElementById('editorHeader').style.display = state.diffMode === 'side' ? 'grid' : 'none';
  }
  updateModeBadge();
  showToast(state.diffMode === 'side' ? 'Split view enabled' : 'Inline view enabled');
});

document.getElementById('diffTypeGroup').addEventListener('click', e => {
  const pill = e.target.closest('.pill'); if (!pill) return;
  state.diffType = pill.dataset.type;
  activatePill('diffTypeGroup', state.diffType, 'diffType');
  if (state.diffEditor && state.modelsCreated) window._setModels();
  updateModeBadge();
  showToast(state.diffType === 'semantic'
    ? 'Semantic: whitespace stripped before diff'
    : 'Whitespace: raw file bytes compared');
});

document.getElementById('langSelect').addEventListener('change', e => {
  state.lang = e.target.value;
  if (state.diffEditor && state.modelsCreated) window._setModels();
  updateStatus();
  showToast('Language: ' + state.lang.toUpperCase());
});

let wrapOn = true;
document.getElementById('wrapToggle').addEventListener('click', () => {
  wrapOn = !wrapOn;
  if (state.diffEditor) state.diffEditor.updateOptions({ wordWrap: wrapOn ? 'on' : 'off', diffWordWrap: wrapOn ? 'on' : 'off' });
  const btn = document.getElementById('wrapToggle');
  btn.style.color = wrapOn ? 'var(--accent)' : 'var(--text2)';
  btn.style.borderColor = wrapOn ? 'var(--accent)' : 'var(--border)';
  btn.title = 'Toggle word wrap (currently: ' + (wrapOn ? 'on' : 'off') + ')';
  showToast('Word wrap: ' + (wrapOn ? 'on' : 'off'));
});

document.getElementById('formatBtn').addEventListener('click', () => {
  if (!state.diffEditor || !state.modelsCreated) return showToast('Load both files first');
  const m = state.diffEditor.getModel(); if (!m) return;
  const fA = formatContent(m.original.getValue(), state.lang);
  const fB = formatContent(m.modified.getValue(), state.lang);
  state.rawA = fA; state.rawB = fB; state.contentA = fA; state.contentB = fB;
  window._setModels(); updateStatus();
  showToast('Both sides formatted ✓');
});

function downloadContent(content, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  a.download = name; a.click(); URL.revokeObjectURL(a.href);
}

document.getElementById('downloadA').addEventListener('click', () => {
  if (!state.diffEditor || !state.modelsCreated) return showToast('Load both files first');
  const m = state.diffEditor.getModel();
  downloadContent(m ? m.original.getValue() : state.contentA, state.fileNameA);
  showToast('Saved: ' + state.fileNameA);
});

document.getElementById('downloadB').addEventListener('click', () => {
  if (!state.diffEditor || !state.modelsCreated) return showToast('Load both files first');
  const m = state.diffEditor.getModel();
  downloadContent(m ? m.modified.getValue() : state.contentB, state.fileNameB);
  showToast('Saved: ' + state.fileNameB);
});

document.getElementById('resetBtn').addEventListener('click', () => {
  state.rawA = ''; state.rawB = ''; state.contentA = ''; state.contentB = '';
  state.fileNameA = 'file-a.xml'; state.fileNameB = 'file-b.xml';
  state.modelsCreated = false;
  document.getElementById('fileInputA').value = ''; document.getElementById('fileInputB').value = '';
  document.getElementById('badgeA').classList.remove('visible');
  document.getElementById('badgeB').classList.remove('visible');
  document.getElementById('editorArea').classList.remove('visible');
  document.getElementById('uploadPanel').classList.remove('hidden');
  if (state.diffEditor) state.diffEditor.setModel(null);
  if (merge.visible) closeMergeView();
  if (merge.editorM) { merge.editorM.dispose(); merge.editorM = null; }
  if (merge._roObserver) { merge._roObserver.disconnect(); merge._roObserver = null; }
  merge.chunks = []; merge.currentConflict = -1; merge.visible = false;
  showToast('Reset — load new files');
});

/* ── Tab toggle (File / Paste) ── */
function switchTab(side, tab) {
  document.getElementById('fileTab'  + side).style.display = tab === 'file'  ? '' : 'none';
  document.getElementById('pasteTab' + side).style.display = tab === 'paste' ? '' : 'none';
  document.querySelectorAll('#tabToggle' + side + ' .tab-btn')
    .forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
}
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.side, btn.dataset.tab));
});

['A', 'B'].forEach(side => {
  const ta = document.getElementById('paste' + side); if (!ta) return;
  ta.addEventListener('input', () => {
    const len = ta.value.length;
    document.getElementById('pasteCharCount' + side).textContent = len === 0 ? '0 chars' : len.toLocaleString() + ' chars';
    ta.classList.toggle('has-content', len > 0);
  });
  ta.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = ta.selectionStart, end = ta.selectionEnd;
      ta.value = ta.value.substring(0, s) + '  ' + ta.value.substring(end);
      ta.selectionStart = ta.selectionEnd = s + 2;
    }
  });
});

function loadFromPaste(side, rawText) {
  if (!rawText.trim()) return showToast('Nothing to load — paste some content first');
  const lang = state.lang;
  const name = side === 'A' ? 'pasted-a.' + lang : 'pasted-b.' + lang;
  if (side === 'A') {
    state.rawA = rawText; state.contentA = rawText; state.fileNameA = name;
    document.getElementById('nameA').textContent = name;
    document.getElementById('badgeA').classList.add('visible');
  } else {
    state.rawB = rawText; state.contentB = rawText; state.fileNameB = name;
    document.getElementById('nameB').textContent = name;
    document.getElementById('badgeB').classList.add('visible');
  }
  if (state.rawA !== '' && state.rawB !== '') {
    if (window._setModels) { window._setModels(); showEditorArea(); }
  } else {
    showToast('File ' + side + ' loaded — now load File ' + (side === 'A' ? 'B' : 'A'));
  }
}

document.getElementById('pasteLoadA').addEventListener('click', () => loadFromPaste('A', document.getElementById('pasteA').value));
document.getElementById('pasteLoadB').addEventListener('click', () => loadFromPaste('B', document.getElementById('pasteB').value));


/* ══════════════════════════════════════════════════
   VS CODE-STYLE MERGE ENGINE
   ══════════════════════════════════════════════════ */

const merge = {
  editorM: null,
  chunks: [],
  /*
    chunk: {
      type: 'eq' | 'conflict',
      lines: [...],          // for eq
      aLines: [...],         // for conflict — incoming (File A)
      bLines: [...],         // for conflict — current (File B)
      choice: null | 'A' | 'B' | 'both',
      idx: number
    }
  */
  currentConflict: -1,
  visible: false,
  scrollSync: true,
  _roObserver: null,
  _scrollingSide: null,  // 'A' | 'B' | null — prevents scroll loop
};

/* ── Myers diff (line-level) ── */
function myersDiff(a, b) {
  const n = a.length, m = b.length, max = n + m;
  if (max === 0) return [];
  const v = new Array(2 * max + 3).fill(0);
  const offset = max + 1, trace = [];
  for (let d = 0; d <= max; d++) {
    trace.push([...v]);
    for (let k = -d; k <= d; k += 2) {
      let x = (k === -d || (k !== d && v[k-1+offset] < v[k+1+offset])) ? v[k+1+offset] : v[k-1+offset] + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) { x++; y++; }
      v[k+offset] = x;
      if (x >= n && y >= m) {
        const ops = [];
        let cx = n, cy = m;
        for (let dd = d; dd > 0; dd--) {
          const pv = trace[dd-1], ck = cx - cy;
          const pk = (ck === -dd || (ck !== dd && pv[ck-1+offset] < pv[ck+1+offset])) ? ck+1 : ck-1;
          const px = pv[pk+offset], py = px - pk;
          while (cx > px && cy > py && a[cx-1] === b[cy-1]) { ops.unshift({t:'eq', a:cx-1, b:cy-1}); cx--; cy--; }
          if (ck === pk+1) { ops.unshift({t:'ins', b:cy-1}); cy--; }
          else             { ops.unshift({t:'del', a:cx-1}); cx--; }
        }
        while (cx > 0 && cy > 0) { ops.unshift({t:'eq', a:cx-1, b:cy-1}); cx--; cy--; }
        return ops;
      }
    }
  }
  return [];
}

/* ── Build chunks ── */
function buildChunks(linesA, linesB) {
  const ops = myersDiff(linesA, linesB);
  const chunks = [];
  let conflictIdx = 0, i = 0;
  while (i < ops.length) {
    if (ops[i].t === 'eq') {
      const eqLines = [];
      while (i < ops.length && ops[i].t === 'eq') { eqLines.push(linesA[ops[i].a]); i++; }
      chunks.push({ type: 'eq', lines: eqLines });
    } else {
      const aLines = [], bLines = [];
      while (i < ops.length && ops[i].t !== 'eq') {
        if (ops[i].t === 'del') aLines.push(linesA[ops[i].a]);
        if (ops[i].t === 'ins') bLines.push(linesB[ops[i].b]);
        i++;
      }
      chunks.push({ type: 'conflict', aLines, bLines, choice: null, idx: conflictIdx++ });
    }
  }
  return chunks;
}

/* ── Build result text ── */
function buildResult() {
  const lines = [];
  merge.chunks.forEach(ch => {
    if (ch.type === 'eq') {
      lines.push(...ch.lines);
    } else {
      if (!ch.choice) {
        lines.push(...ch.bLines); // placeholder: use B
      } else if (ch.choice === 'A') {
        lines.push(...ch.aLines);
      } else if (ch.choice === 'B') {
        lines.push(...ch.bLines);
      } else if (ch.choice === 'both') {
        lines.push(...ch.aLines, ...ch.bLines);
      }
    }
  });
  return lines.join('\n');
}

/* ════════════════════════════════════════════════════════
   VS CODE-STYLE SIDE PANE RENDERER
   Renders a read-only annotated code view (like VS Code's
   merge editor side panes) with inline CodeLens actions.
   ════════════════════════════════════════════════════════ */
function renderSidePane(panelEl, side, chunks) {
  panelEl.innerHTML = '';
  let lineNum = 1;
  const totalConflicts = chunks.filter(c => c.type === 'conflict').length;

  chunks.forEach((ch, chunkIndex) => {
    if (ch.type === 'eq') {
      // Equal region — show with normal styling
      const MAX_EQ_LINES = 8;
      const lines = ch.lines;
      if (lines.length > MAX_EQ_LINES) {
        // Show first 3 lines
        lines.slice(0, 3).forEach(l => {
          panelEl.appendChild(makeLine(lineNum++, l, 'eq'));
        });
        // Folded region
        const fold = document.createElement('div');
        fold.className = 'code-line phantom';
        fold.innerHTML = `<span class="line-num">…</span><span class="line-text">  ${lines.length - 6} unchanged lines</span>`;
        panelEl.appendChild(fold);
        lineNum += lines.length - 6;
        // Show last 3 lines
        lines.slice(-3).forEach(l => {
          panelEl.appendChild(makeLine(lineNum++, l, 'eq'));
        });
      } else {
        lines.forEach(l => { panelEl.appendChild(makeLine(lineNum++, l, 'eq')); });
      }
    } else {
      // Conflict region
      const chosen = ch.choice;
      const conflictNum = ch.idx + 1;
      const sideLinesA = ch.aLines;
      const sideLinesB = ch.bLines;

      // ── CodeLens bar (VS Code style inline action bar) ──
      const lens = document.createElement('div');
      lens.className = 'conflict-codelens';
      lens.dataset.conflictIdx = ch.idx;
      lens.dataset.side = side;

      const conflictLabel = document.createElement('span');
      conflictLabel.className = 'codelens-label';
      conflictLabel.textContent = `Conflict ${conflictNum}/${totalConflicts}`;
      lens.appendChild(conflictLabel);

      // Action buttons — only shown in the relevant panes
      const actions = [
        { label: '⬇ Accept Incoming (A)', cls: 'accept-incoming', choice: 'A', show: true },
        { label: '⬆ Accept Current (B)',  cls: 'accept-current',  choice: 'B', show: true },
        { label: '⇅ Accept Both',         cls: 'accept-both',     choice: 'both', show: true },
        { label: '✕ Ignore',              cls: 'accept-none',     choice: null, show: !!chosen },
      ];

      actions.forEach(({ label, cls, choice, show }) => {
        if (!show) return;
        const btn = document.createElement('button');
        btn.className = 'codelens-btn ' + cls;
        btn.textContent = label;
        if (chosen === choice) btn.classList.add('active-choice');
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          resolveConflict(ch.idx, choice);
        });
        lens.appendChild(btn);
      });

      panelEl.appendChild(lens);

      // ── Lines for this side ──
      const myLines = side === 'A' ? sideLinesA : sideLinesB;
      const otherLines = side === 'A' ? sideLinesB : sideLinesA;
      const lineType  = side === 'A' ? 'del' : 'ins';

      // Add my lines
      myLines.forEach(l => {
        const lineEl = makeLine(lineNum++, l, lineType);
        if (chosen === (side === 'A' ? 'A' : 'B')) lineEl.classList.add('chosen-' + side.toLowerCase());
        else if (chosen === 'both') lineEl.classList.add('chosen-both');
        else if (chosen && chosen !== side) lineEl.classList.add('dimmed');
        panelEl.appendChild(lineEl);
      });

      // Phantom lines to align height with other side
      const maxLen = Math.max(myLines.length, otherLines.length);
      for (let i = myLines.length; i < maxLen; i++) {
        const ph = document.createElement('div');
        ph.className = 'code-line phantom';
        ph.style.background = side === 'A' ? 'rgba(248,113,113,0.04)' : 'rgba(52,211,153,0.04)';
        ph.innerHTML = `<span class="line-num"></span><span class="line-text"></span>`;
        panelEl.appendChild(ph);
      }
    }
  });
}

function makeLine(num, text, type) {
  const div = document.createElement('div');
  div.className = 'code-line ' + type;
  const numEl = document.createElement('span');
  numEl.className = 'line-num';
  numEl.textContent = num;
  const textEl = document.createElement('span');
  textEl.className = 'line-text';
  textEl.textContent = text;
  div.appendChild(numEl);
  div.appendChild(textEl);
  return div;
}

/* ── Render both side panes ── */
function renderSidePanes() {
  renderSidePane(document.getElementById('paneA'), 'A', merge.chunks);
  renderSidePane(document.getElementById('paneB'), 'B', merge.chunks);
  renderOverviewGutter();
}

/* ── Conflict resolution ── */
function resolveConflict(conflictIdx, choice) {
  const ch = merge.chunks.find(c => c.type === 'conflict' && c.idx === conflictIdx);
  if (!ch) return;
  ch.choice = choice;

  // Update result editor
  if (merge.editorM) {
    merge.editorM.getModel().setValue(buildResult());
    updateMergeStatus();
  }

  renderSidePanes();
  updateConflictUI();

  // Auto-advance
  if (choice !== null) {
    const conflicts = merge.chunks.filter(c => c.type === 'conflict');
    const nextUnresolved = conflicts.find(c => c.idx > conflictIdx && c.choice === null);
    if (nextUnresolved) {
      setTimeout(() => scrollToConflict(nextUnresolved.idx), 150);
    } else if (conflicts.every(c => c.choice !== null)) {
      showToast('✓ All ' + conflicts.length + ' conflicts resolved — Save Merge to download!');
    }
  }
}

/* ── Scroll to a conflict ── */
function scrollToConflict(conflictIdx) {
  merge.currentConflict = conflictIdx;
  ['paneA', 'paneB'].forEach(id => {
    const lens = document.querySelector(`#${id} .conflict-codelens[data-conflict-idx="${conflictIdx}"]`);
    if (lens) lens.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  updateConflictUI();
}

function goToConflict(delta) {
  const conflicts = merge.chunks.filter(c => c.type === 'conflict');
  if (!conflicts.length) return;
  const curPos = conflicts.findIndex(c => c.idx === merge.currentConflict);
  const nextPos = Math.max(0, Math.min(conflicts.length - 1, curPos + delta));
  scrollToConflict(conflicts[nextPos].idx);
}

/* ── Accept all helpers ── */
function acceptAll(side) {
  merge.chunks.forEach(ch => { if (ch.type === 'conflict') ch.choice = side; });
  if (merge.editorM) merge.editorM.getModel().setValue(buildResult());
  renderSidePanes(); updateConflictUI(); updateMergeStatus();
  showToast('All conflicts → File ' + (side === 'A' ? 'A (Incoming)' : 'B (Current)'));
}

function acceptAllBoth() {
  merge.chunks.forEach(ch => { if (ch.type === 'conflict') ch.choice = 'both'; });
  if (merge.editorM) merge.editorM.getModel().setValue(buildResult());
  renderSidePanes(); updateConflictUI(); updateMergeStatus();
  showToast('All conflicts → A + B combined');
}

/* ── UI counters ── */
function updateConflictUI() {
  const conflicts = merge.chunks.filter(c => c.type === 'conflict');
  const total = conflicts.length;
  const resolved = conflicts.filter(c => c.choice !== null).length;
  const remaining = total - resolved;
  document.getElementById('totalConflicts').textContent = total;
  document.getElementById('resolvedCount').textContent  = resolved;
  document.getElementById('mergeConflictStatus').textContent = remaining + ' unresolved';

  const badge = document.getElementById('conflictBadge');
  badge.style.display = remaining > 0 ? '' : 'none';
  badge.textContent = remaining + ' unresolved';

  // Progress bar
  const pct = total > 0 ? Math.round((resolved / total) * 100) : 100;
  const bar = document.getElementById('mergeProgressBar');
  if (bar) { bar.style.width = pct + '%'; bar.style.background = pct === 100 ? 'var(--green)' : 'var(--accent)'; }
}

function updateMergeStatus() {
  const model = merge.editorM && merge.editorM.getModel();
  if (model) document.getElementById('mergeLinesStatus').textContent = model.getLineCount() + ' lines';
}

/* ── Overview gutter (conflict minimap) ── */
function renderOverviewGutter() {
  const gutter = document.getElementById('conflictOverview');
  if (!gutter) return;
  gutter.innerHTML = '';

  const conflicts = merge.chunks.filter(c => c.type === 'conflict');
  if (!conflicts.length) return;

  const total = merge.chunks.reduce((acc, ch) => {
    return acc + (ch.type === 'eq' ? ch.lines.length : Math.max(ch.aLines.length, ch.bLines.length) + 1);
  }, 0);
  if (!total) return;

  let lineOffset = 0;
  merge.chunks.forEach(ch => {
    const chLen = ch.type === 'eq' ? ch.lines.length : Math.max(ch.aLines.length, ch.bLines.length) + 1;
    if (ch.type === 'conflict') {
      const mark = document.createElement('div');
      mark.className = 'overview-mark ' + (
        ch.choice === null    ? 'unresolved'     :
        ch.choice === 'A'     ? 'resolved-a'     :
        ch.choice === 'B'     ? 'resolved-b'     : 'resolved-both'
      );
      const pct = lineOffset / total, h = Math.max(4, chLen / total * 100);
      mark.style.top    = (pct * 100) + '%';
      mark.style.height = h + '%';
      mark.title = 'Conflict ' + (ch.idx + 1) + ': ' + (ch.choice ? 'resolved' : 'unresolved');
      mark.addEventListener('click', () => scrollToConflict(ch.idx));
      gutter.appendChild(mark);
    }
    lineOffset += chLen;
  });
}

/* ── Synchronized scrolling ── */
function setupScrollSync() {
  const paneA = document.getElementById('paneA');
  const paneB = document.getElementById('paneB');
  if (!paneA || !paneB) return;

  function syncScroll(from, to) {
    return function() {
      if (!merge.scrollSync) return;
      if (merge._scrollingSide === from) return; // prevent loop
      merge._scrollingSide = from;
      const ratio = from === 'A'
        ? paneA.scrollTop / Math.max(1, paneA.scrollHeight - paneA.clientHeight)
        : paneB.scrollTop / Math.max(1, paneB.scrollHeight - paneB.clientHeight);
      const target = to === 'A' ? paneA : paneB;
      target.scrollTop = ratio * (target.scrollHeight - target.clientHeight);
      setTimeout(() => { merge._scrollingSide = null; }, 50);
    };
  }

  paneA.addEventListener('scroll', syncScroll('A', 'B'));
  paneB.addEventListener('scroll', syncScroll('B', 'A'));
}

/* ── Open merge view ── */
function openMergeView() {
  if (!state.modelsCreated) return showToast('Load both files first');
  merge.visible = true;

  document.getElementById('editorArea').classList.remove('visible');
  document.getElementById('mergeArea').classList.add('visible');
  document.getElementById('mergeToggle').classList.add('active');
  document.getElementById('downloadMerge').style.display = '';

  // Label the panes
  document.getElementById('mergeLabelA').textContent = state.fileNameA;
  document.getElementById('mergeLabelB').textContent = state.fileNameB;

  const diffModel = state.diffEditor.getModel();
  const srcA = diffModel ? diffModel.original.getValue() : (state.rawA || state.contentA);
  const srcB = diffModel ? diffModel.modified.getValue() : (state.rawB || state.contentB);

  merge.chunks = buildChunks(srcA.split('\n'), srcB.split('\n'));
  const conflicts = merge.chunks.filter(c => c.type === 'conflict');
  merge.currentConflict = conflicts.length > 0 ? conflicts[0].idx : -1;

  // Render side panes
  renderSidePanes();
  setupScrollSync();

  // Create result editor (middle)
  const mon = window._monaco;
  const theme = state.theme === 'dark' ? 'df-dark' : 'df-light';
  if (merge.editorM) merge.editorM.dispose();
  if (merge._roObserver) merge._roObserver.disconnect();

  merge.editorM = mon.editor.create(document.getElementById('mergeEditorM'), {
    theme, language: state.lang,
    value: buildResult(),
    fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
    fontLigatures: true, lineHeight: 21,
    scrollBeyondLastLine: false, wordWrap: 'on',
    minimap: { enabled: true, scale: 1 },
    scrollbar: { vertical: 'auto', horizontal: 'auto' },
    padding: { top: 8, bottom: 8 },
    glyphMargin: false,
  });

  merge._roObserver = new ResizeObserver(() => merge.editorM && merge.editorM.layout());
  merge._roObserver.observe(document.getElementById('mergeEditorM'));

  updateConflictUI();
  updateMergeStatus();

  // Auto-scroll to first conflict
  if (merge.currentConflict >= 0) setTimeout(() => scrollToConflict(merge.currentConflict), 120);
}

/* ── Close merge view ── */
function closeMergeView() {
  merge.visible = false;
  document.getElementById('mergeArea').classList.remove('visible');
  document.getElementById('editorArea').classList.add('visible');
  document.getElementById('mergeToggle').classList.remove('active');
  document.getElementById('downloadMerge').style.display = 'none';
}

/* ── Wire merge buttons ── */
document.getElementById('mergeToggle').addEventListener('click', () => {
  merge.visible ? closeMergeView() : openMergeView();
});
document.getElementById('prevConflict').addEventListener('click', () => goToConflict(-1));
document.getElementById('nextConflict').addEventListener('click', () => goToConflict(+1));
document.getElementById('acceptAllA').addEventListener('click', () => acceptAll('A'));
document.getElementById('acceptAllB').addEventListener('click', () => acceptAll('B'));
document.getElementById('acceptAllBoth').addEventListener('click', acceptAllBoth);

document.getElementById('scrollSyncToggle').addEventListener('click', () => {
  merge.scrollSync = !merge.scrollSync;
  const btn = document.getElementById('scrollSyncToggle');
  btn.classList.toggle('active', merge.scrollSync);
  showToast('Scroll sync: ' + (merge.scrollSync ? 'on' : 'off'));
});

document.getElementById('clearMerge').addEventListener('click', () => {
  if (!merge.editorM) return;
  merge.chunks.forEach(ch => { if (ch.type === 'conflict') ch.choice = null; });
  merge.editorM.getModel().setValue(buildResult());
  renderSidePanes(); updateConflictUI(); updateMergeStatus();
  showToast('All choices cleared');
});

document.getElementById('downloadMerge').addEventListener('click', () => {
  if (!merge.editorM) return showToast('Open merge view first');
  const unresolved = merge.chunks.filter(c => c.type === 'conflict' && c.choice === null).length;
  if (unresolved > 0) showToast(unresolved + ' conflicts unresolved — using File B as placeholder');
  const content = merge.editorM.getModel().getValue();
  const name = 'file-c-merged.' + state.lang;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  a.download = name; a.click(); URL.revokeObjectURL(a.href);
  showToast('Saved: ' + name);
});

/* ══════════════════════════════════════════════════
   HELP PANEL
   ══════════════════════════════════════════════════ */
const helpPanel    = document.getElementById('helpPanel');
const helpBackdrop = document.getElementById('helpBackdrop');
const helpBtn      = document.getElementById('helpBtn');
const helpClose    = document.getElementById('helpClose');

function openHelp() {
  helpPanel.classList.add('open');
  helpBackdrop.classList.add('open');
  helpBtn.style.color = 'var(--accent)';
  helpBtn.style.borderColor = 'var(--accent)';
  helpBtn.style.background = 'var(--accent-glow)';
  document.body.style.overflow = 'hidden';
}

function closeHelp() {
  helpPanel.classList.remove('open');
  helpBackdrop.classList.remove('open');
  helpBtn.style.color = '';
  helpBtn.style.borderColor = '';
  helpBtn.style.background = '';
  document.body.style.overflow = '';
}

helpBtn.addEventListener('click', () => helpPanel.classList.contains('open') ? closeHelp() : openHelp());
helpClose.addEventListener('click', closeHelp);
helpBackdrop.addEventListener('click', closeHelp);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && helpPanel.classList.contains('open')) closeHelp();
});