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
  // closeMergeView disposes editors; reset remaining state
  merge.chunks = []; merge.currentConflict = -1; merge.visible = false;
  merge._srcA = ''; merge._srcB = '';
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
    chunk shape:
      { type:'eq',       lines:[...] }
      { type:'conflict', aLines:[...], bLines:[...], choice: null|'A'|'B'|'both', idx:N,
        _expanded: bool }  // for folded equal regions
  */
  currentConflict: -1,
  visible: false,
  scrollSync: true,
  _roObserver: null,
  _scrollLock: false,
};

/* ══════════════════════════════════════════════════
   DIFF ENGINE — simple, correct LCS-based line diff
   ══════════════════════════════════════════════════ */

// Standard Wagner-Fischer LCS on line arrays.
// Returns an array of ops: {t:'eq'|'del'|'ins', val, ai?, bi?}
function lineDiff(a, b) {
  const n = a.length, m = b.length;

  // Build LCS length table
  const dp = Array.from({length: n + 1}, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (a[i] === b[j]) {
        dp[i][j] = dp[i+1][j+1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i+1][j], dp[i][j+1]);
      }
    }
  }

  // Trace back to get ops
  const ops = [];
  let i = 0, j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && a[i] === b[j]) {
      ops.push({t:'eq', val:a[i], ai:i, bi:j}); i++; j++;
    } else if (j < m && (i >= n || dp[i][j+1] >= dp[i+1][j])) {
      ops.push({t:'ins', val:b[j], bi:j}); j++;
    } else {
      ops.push({t:'del', val:a[i], ai:i}); i++;
    }
  }
  return ops;
}

/* ── Build chunk list from diff ops ── */
// Produces clean eq / conflict chunks with no duplicate lines.
// No post-processing trimming needed because lineDiff() is correct.
function buildChunks(linesA, linesB) {
  const ops = lineDiff(linesA, linesB);
  const rawChunks = [];
  let i = 0;

  while (i < ops.length) {
    if (ops[i].t === 'eq') {
      const lines = [];
      while (i < ops.length && ops[i].t === 'eq') { lines.push(ops[i].val); i++; }
      rawChunks.push({ type: 'eq', lines });
    } else {
      const aLines = [], bLines = [];
      while (i < ops.length && ops[i].t !== 'eq') {
        if (ops[i].t === 'del') aLines.push(ops[i].val);
        else                    bLines.push(ops[i].val);
        i++;
      }
      rawChunks.push({ type: 'conflict', aLines, bLines });
    }
  }

  // Assign indices and metadata
  let conflictIdx = 0, bLinePos = 1;
  return rawChunks.map(ch => {
    if (ch.type === 'eq') {
      bLinePos += ch.lines.length;
      return { type:'eq', lines:ch.lines, _expanded: ch.lines.length <= 6 };
    } else {
      const start = bLinePos;
      bLinePos += ch.bLines.length;
      return {
        type:'conflict', aLines:ch.aLines, bLines:ch.bLines,
        choice:null, idx:conflictIdx++,
        _bLineStart:start, _resultLen:ch.bLines.length,
      };
    }
  });
}

/* ── Build result text from current choices ── */
// Unresolved conflicts: use bLines as placeholder (keeps File C = File B baseline)
// choice='A': replace with incoming (A) lines
// choice='B': keep current (B) lines  — same as unresolved placeholder, but explicit
// choice='both': A lines followed by B lines
function buildResult() {
  const lines = [];
  merge.chunks.forEach(ch => {
    if (ch.type === 'eq') {
      lines.push(...ch.lines);
    } else {
      switch (ch.choice) {
        case 'A':    lines.push(...ch.aLines); break;
        case 'B':    lines.push(...ch.bLines); break;
        case 'both': lines.push(...ch.aLines, ...ch.bLines); break;
        default:     lines.push(...ch.bLines); break; // unresolved → show B as placeholder
      }
    }
  });
  return lines.join('\n');
}

/* ════════════════════════════════════════════════════════
   SIDE PANE MONACO EDITORS + OVERLAY CODELENS WIDGETS
   ════════════════════════════════════════════════════════ */

/* ── Create or recreate a read-only Monaco editor in a container ── */
function createSideEditor(containerId, value) {
  const mon = window._monaco;
  const theme = state.theme === 'dark' ? 'df-dark' : 'df-light';
  return mon.editor.create(document.getElementById(containerId), {
    theme,
    language: state.lang,
    value,
    readOnly: true,
    fontSize: 12,
    fontFamily: "'JetBrains Mono', monospace",
    fontLigatures: true,
    lineHeight: 19,
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    minimap: { enabled: false },
    scrollbar: { vertical: 'auto', horizontal: 'hidden', alwaysConsumeMouseWheel: false },
    padding: { top: 4, bottom: 4 },
    glyphMargin: false,
    lineNumbers: 'on',
    renderLineHighlight: 'none',
    contextmenu: false,
    // Hide the cursor entirely in read-only panes
    cursorStyle: 'line',
    cursorWidth: 0,
  });
}

/* ── Apply color decorations to a side editor ── */
// Highlights conflict lines (red for A, green for B) and dims resolved ones
function applyDecorations(editor, side) {
  const mon = window._monaco;
  const decorations = [];

  let lineNum = 1;
  merge.chunks.forEach(ch => {
    if (ch.type === 'eq') {
      lineNum += ch.lines.length;
      return;
    }
    const myLines = side === 'A' ? ch.aLines : ch.bLines;
    const chosen  = ch.choice;
    const lineCount = myLines.length || 1; // at least 1 for empty-side placeholder

    // Color class based on resolution state
    let cls;
    if (!chosen) {
      cls = side === 'A' ? 'merge-line-del' : 'merge-line-ins';
    } else if (chosen === side) {
      cls = side === 'A' ? 'merge-line-chosen-a' : 'merge-line-chosen-b';
    } else if (chosen === 'both') {
      cls = 'merge-line-chosen-both';
    } else {
      cls = 'merge-line-dimmed'; // other side was chosen
    }

    for (let i = 0; i < lineCount; i++) {
      decorations.push({
        range: new mon.Range(lineNum + i, 1, lineNum + i, 1),
        options: {
          isWholeLine: true,
          className: cls,
          marginClassName: cls + '-margin',
        },
      });
    }
    lineNum += lineCount;
  });

  // Replace all decorations atomically
  const key = side === 'A' ? '_decorA' : '_decorB';
  merge[key] = editor.deltaDecorations(merge[key] || [], decorations);
}

/* ── CodeLens overlay widget — floats over a line in the editor ── */
// We create one overlay widget per conflict, positioned at the first line
// of that conflict region. Overlay widgets survive editor redraws.
function buildLensWidget(conflictIdx, side, editor) {
  const mon = window._monaco;
  const ch = merge.chunks.find(c => c.type === 'conflict' && c.idx === conflictIdx);
  if (!ch) return null;

  // Compute which line this conflict starts at (in this side's text)
  let lineStart = 1;
  for (const c of merge.chunks) {
    if (c.type === 'conflict' && c.idx === conflictIdx) break;
    lineStart += c.type === 'eq' ? c.lines.length : (side === 'A' ? c.aLines : c.bLines).length || 1;
  }

  const chosen = ch.choice;
  const isCurrent = conflictIdx === merge.currentConflict;

  // Build the DOM node for this widget
  const domNode = document.createElement('div');
  domNode.className = 'codelens-overlay-widget' +
    (isCurrent ? ' is-current' : '') +
    (chosen ? ' resolved' : ' unresolved');
  domNode.dataset.conflictIdx = conflictIdx;
  domNode.dataset.side = side;

  // Gutter label
  const gutter = document.createElement('span');
  gutter.className = 'cow-gutter';
  gutter.textContent = `C${conflictIdx + 1}`;
  domNode.appendChild(gutter);

  // Buttons
  const addBtn = (label, cls, choice) => {
    const btn = document.createElement('button');
    btn.className = 'codelens-btn ' + cls + (chosen === choice ? ' active-choice' : '');
    btn.textContent = label;
    btn.addEventListener('mousedown', e => {
      e.preventDefault(); e.stopPropagation();
      resolveConflict(conflictIdx, choice);
    });
    domNode.appendChild(btn);
  };
  addBtn('Accept Incoming', 'accept-incoming', 'A');
  addBtn('Accept Current',  'accept-current',  'B');
  addBtn('Accept Both',     'accept-both',     'both');
  if (chosen !== null) addBtn('↩ Undo', 'accept-none', null);

  // Monaco IOverlayWidget
  const widgetId = `lens-${side}-${conflictIdx}`;
  return {
    getId()        { return widgetId; },
    getDomNode()   { return domNode; },
    getPosition()  {
      return {
        preference: mon.editor.OverlayWidgetPositionPreference.TOP_RIGHT_CORNER,
      };
    },
    // Custom positioning — we position absolutely relative to the editor
    _lineStart: lineStart,
  };
}

/* ── Rebuild all overlay widgets + viewZones for one side editor ── */
// viewZones inject a blank row ABOVE each conflict's first line,
// creating real physical space so the action bar never covers code.
function refreshOverlayWidgets(editor, side) {
  const wKey = side === 'A' ? '_widgetsA'   : '_widgetsB';
  const zKey = side === 'A' ? '_viewZonesA' : '_viewZonesB';

  // Remove old overlay widgets
  (merge[wKey] || []).forEach(w => {
    editor.removeOverlayWidget(w);
    if (w._dispose) w._dispose();
  });
  merge[wKey] = [];

  // Remove old view zones
  editor.changeViewZones(acc => {
    (merge[zKey] || []).forEach(id => acc.removeZone(id));
  });
  merge[zKey] = [];

  const conflicts = merge.chunks.filter(c => c.type === 'conflict');
  if (!conflicts.length) return;

  const WIDGET_HEIGHT = 26; // px — matches CSS height of .codelens-overlay-widget

  conflicts.forEach(ch => {
    // Which line does this conflict start on in this side's editor?
    let lineStart = 1;
    for (const c of merge.chunks) {
      if (c.type === 'conflict' && c.idx === ch.idx) break;
      lineStart += c.type === 'eq'
        ? c.lines.length
        : ((side === 'A' ? c.aLines : c.bLines).length || 1);
    }

    const chosen    = ch.choice;
    const isCurrent = ch.idx === merge.currentConflict;

    // Step 1: inject a viewZone (blank row) ABOVE lineStart
    // This physically pushes the conflict code down — no code is hidden.
    let zoneId;
    editor.changeViewZones(acc => {
      const ph = document.createElement('div');
      zoneId = acc.addZone({
        afterLineNumber: Math.max(0, lineStart - 1),
        heightInPx: WIDGET_HEIGHT,
        domNode: ph,
        suppressMouseDown: false,
      });
    });
    merge[zKey].push(zoneId);

    // Step 2: build the overlay widget DOM
    const widgetDom = document.createElement('div');
    widgetDom.className = 'codelens-overlay-widget' +
      (isCurrent ? ' is-current' : '') +
      (chosen     ? ' resolved'   : ' unresolved');
    widgetDom.dataset.conflictIdx = ch.idx;

    const gutter = document.createElement('span');
    gutter.className = 'cow-gutter';
    gutter.textContent = `C${ch.idx + 1}`;
    widgetDom.appendChild(gutter);

    const addBtn = (label, cls, choice) => {
      const btn = document.createElement('button');
      btn.className = 'codelens-btn ' + cls + (chosen === choice ? ' active-choice' : '');
      btn.textContent = label;
      btn.addEventListener('mousedown', e => {
        e.preventDefault(); e.stopPropagation();
        resolveConflict(ch.idx, choice);
      });
      widgetDom.appendChild(btn);
    };
    addBtn('Accept Incoming', 'accept-incoming', 'A');
    addBtn('Accept Current',  'accept-current',  'B');
    addBtn('Accept Both',     'accept-both',     'both');
    if (chosen !== null) addBtn('↩ Undo', 'accept-none', null);

    // Step 3: create and register overlay widget
    const widget = {
      getId()      { return `lens-${side}-${ch.idx}`; },
      getDomNode() { return widgetDom; },
      getPosition(){ return null; }, // manual positioning
    };

    editor.addOverlayWidget(widget);

    // Step 4: position widget inside the viewZone gap
    // The viewZone sits before lineStart, so its top =
    // getTopForLineNumber(lineStart) - WIDGET_HEIGHT
    function positionWidget() {
      const lineTop    = editor.getTopForLineNumber(lineStart);
      const scrollTop  = editor.getScrollTop();
      const layoutInfo = editor.getLayoutInfo();
      widgetDom.style.position = 'absolute';
      widgetDom.style.top      = (lineTop - WIDGET_HEIGHT - scrollTop) + 'px';
      widgetDom.style.left     = layoutInfo.contentLeft + 'px';
      widgetDom.style.right    = '0';
      widgetDom.style.height   = WIDGET_HEIGHT + 'px';
      widgetDom.style.zIndex   = '10';
    }

    positionWidget();

    const d1 = editor.onDidScrollChange(positionWidget);
    const d2 = editor.onDidLayoutChange(positionWidget);
    const d3 = editor.onDidChangeModelContent(positionWidget);
    widget._dispose = () => { d1.dispose(); d2.dispose(); d3.dispose(); };

    merge[wKey].push(widget);
  });
}

/* ── Render/refresh both side editors ── */
function renderSidePanes() {
  if (merge.editorA) {
    applyDecorations(merge.editorA, 'A');
    refreshOverlayWidgets(merge.editorA, 'A');
  }
  if (merge.editorB) {
    applyDecorations(merge.editorB, 'B');
    refreshOverlayWidgets(merge.editorB, 'B');
  }
  renderOverviewGutter();
}

/* ── Resolve a conflict — update choice then full-rebuild File C ── */
// We use a full setValue(buildResult()) rather than surgical edits.
// Surgical edits were brittle: _resultLen drift, word-wrap edge cases,
// and interleaved del/ins ops all caused off-by-one line errors.
// buildResult() is O(n) in file size but always correct.
function resolveConflict(conflictIdx, choice) {
  const ch = merge.chunks.find(c => c.type === 'conflict' && c.idx === conflictIdx);
  if (!ch) return;
  ch.choice = choice;

  if (merge.editorM) {
    // Preserve cursor/scroll position so the editor doesn't jump
    const scrollTop = merge.editorM.getScrollTop();
    merge.editorM.getModel().setValue(buildResult());
    merge.editorM.setScrollTop(scrollTop);
    updateMergeStatus();
  }

  renderSidePanes();
  updateConflictUI();

  // Auto-advance to next unresolved
  if (choice !== null) {
    const conflicts = merge.chunks.filter(c => c.type === 'conflict');
    const next = conflicts.find(c => c.idx > conflictIdx && c.choice === null);
    if (next) {
      setTimeout(() => scrollToConflict(next.idx), 100);
    } else if (conflicts.every(c => c.choice !== null)) {
      showToast('✓ All conflicts resolved — Save Merge to download');
    }
  }
}

/* ── Delete the now-unused surgical helpers ── */
// getConflictLineRange is no longer called; kept for reference only.
function getConflictLineRange(targetIdx) {
  let lineStart = 1;
  for (const ch of merge.chunks) {
    if (ch.type === 'eq') { lineStart += ch.lines.length; continue; }
    if (ch.idx === targetIdx) return { start: lineStart, end: lineStart + ch._resultLen - 1, currentLen: ch._resultLen };
    lineStart += ch._resultLen;
  }
  return null;
}

/* ── Scroll both side Monaco editors to a conflict ── */
function scrollToConflict(conflictIdx) {
  merge.currentConflict = conflictIdx;

  // Compute the first line of this conflict in each side's text
  const lineForSide = (side) => {
    let ln = 1;
    for (const c of merge.chunks) {
      if (c.type === 'conflict' && c.idx === conflictIdx) break;
      ln += c.type === 'eq' ? c.lines.length : ((side === 'A' ? c.aLines : c.bLines).length || 1);
    }
    return ln;
  };

  if (merge.editorA) merge.editorA.revealLineInCenter(lineForSide('A'));
  if (merge.editorB) merge.editorB.revealLineInCenter(lineForSide('B'));

  // Refresh overlay widgets (updates is-current styling)
  renderSidePanes();
  updateConflictUI();
}

/* ── Synchronized scrolling — A ↔ B Monaco editors ── */
function setupScrollSync() {
  if (!merge.editorA || !merge.editorB) return;

  // Store disposables so we can clean up on close
  merge._syncDisposables = merge._syncDisposables || [];
  merge._syncDisposables.forEach(d => d.dispose());
  merge._syncDisposables = [];

  const sync = (src, dst) => src.onDidScrollChange(e => {
    if (!merge.scrollSync || merge._scrollLock) return;
    merge._scrollLock = true;
    dst.setScrollTop(e.scrollTop);
    requestAnimationFrame(() => { merge._scrollLock = false; });
  });

  merge._syncDisposables.push(sync(merge.editorA, merge.editorB));
  merge._syncDisposables.push(sync(merge.editorB, merge.editorA));
}

function goToConflict(delta) {
  const conflicts = merge.chunks.filter(c => c.type === 'conflict');
  if (!conflicts.length) return;
  const cur = conflicts.findIndex(c => c.idx === merge.currentConflict);
  const next = Math.max(0, Math.min(conflicts.length - 1, cur + delta));
  scrollToConflict(conflicts[next].idx);
}

/* ── Apply a choice to all conflicts then full-rebuild ── */
function applyChoiceToAll(choice) {
  if (!merge.editorM) return;
  merge.chunks.forEach(ch => { if (ch.type === 'conflict') ch.choice = choice; });
  merge.editorM.getModel().setValue(buildResult());
  updateMergeStatus();
}

/* ── Bulk accept helpers ── */
function acceptAll(side) {
  applyChoiceToAll(side);
  renderSidePanes(); updateConflictUI();
  showToast('All conflicts → ' + (side === 'A' ? 'Incoming (A)' : 'Current (B)'));
}

function acceptAllBoth() {
  applyChoiceToAll('both');
  renderSidePanes(); updateConflictUI();
  showToast('All conflicts → A + B combined');
}

/* ── Update progress counter, badge, progress bar ── */
function updateConflictUI() {
  const conflicts = merge.chunks.filter(c => c.type === 'conflict');
  const total    = conflicts.length;
  const resolved = conflicts.filter(c => c.choice !== null).length;
  const remaining = total - resolved;

  document.getElementById('totalConflicts').textContent   = total;
  document.getElementById('resolvedCount').textContent    = resolved;
  document.getElementById('mergeConflictStatus').textContent = remaining + ' unresolved';

  const badge = document.getElementById('conflictBadge');
  badge.style.display = remaining > 0 ? '' : 'none';
  badge.textContent = remaining + ' unresolved';

  const pct = total > 0 ? Math.round((resolved / total) * 100) : 100;
  const bar = document.getElementById('mergeProgressBar');
  if (bar) {
    bar.style.width = pct + '%';
    bar.style.background = pct === 100 ? 'var(--green)' : 'var(--accent)';
  }

  // Current conflict indicator in toolbar
  const nav = document.getElementById('conflictNavLabel');
  if (nav && merge.currentConflict >= 0) {
    const pos = conflicts.findIndex(c => c.idx === merge.currentConflict) + 1;
    nav.textContent = pos + ' / ' + total;
  }
}

function updateMergeStatus() {
  const model = merge.editorM && merge.editorM.getModel();
  if (model) document.getElementById('mergeLinesStatus').textContent = model.getLineCount() + ' lines';
}

/* ── Conflict minimap (overview gutter in result pane) ── */
function renderOverviewGutter() {
  const gutter = document.getElementById('conflictOverview');
  if (!gutter) return;
  gutter.innerHTML = '';
  const conflicts = merge.chunks.filter(c => c.type === 'conflict');
  if (!conflicts.length) return;

  const total = merge.chunks.reduce((acc, ch) =>
    acc + (ch.type === 'eq' ? ch.lines.length : Math.max(ch.aLines.length, ch.bLines.length) + 1), 0);
  if (!total) return;

  let lineOffset = 0;
  merge.chunks.forEach(ch => {
    const chLen = ch.type === 'eq'
      ? ch.lines.length
      : Math.max(ch.aLines.length, ch.bLines.length) + 1;
    if (ch.type === 'conflict') {
      const mark = document.createElement('div');
      const state_cls =
        ch.choice === null   ? 'unresolved'     :
        ch.choice === 'A'    ? 'resolved-a'     :
        ch.choice === 'B'    ? 'resolved-b'     : 'resolved-both';
      mark.className = 'overview-mark ' + state_cls;
      mark.style.top    = (lineOffset / total * 100) + '%';
      mark.style.height = Math.max(4, chLen / total * 100) + '%';
      mark.title = 'Conflict ' + (ch.idx + 1) + ' · ' + (ch.choice ? 'resolved' : 'unresolved');
      mark.addEventListener('click', () => scrollToConflict(ch.idx));
      gutter.appendChild(mark);
    }
    lineOffset += chLen;
  });
}


/* ── Open merge view ── */
function openMergeView() {
  if (!state.modelsCreated) return showToast('Load both files first');
  merge.visible = true;

  document.getElementById('editorArea').classList.remove('visible');
  document.getElementById('mergeArea').classList.add('visible');
  document.getElementById('mergeToggle').classList.add('active');
  document.getElementById('downloadMerge').style.display = '';

  document.getElementById('mergeLabelA').textContent = state.fileNameA;
  document.getElementById('mergeLabelB').textContent = state.fileNameB;

  const diffModel = state.diffEditor.getModel();
  const srcA = diffModel ? diffModel.original.getValue() : (state.rawA || state.contentA);
  const srcB = diffModel ? diffModel.modified.getValue() : (state.rawB || state.contentB);
  merge._srcB = srcB;
  merge._srcA = srcA;

  merge.chunks = buildChunks(srcA.split('\n'), srcB.split('\n'));
  const conflicts = merge.chunks.filter(c => c.type === 'conflict');
  merge.currentConflict = conflicts.length > 0 ? conflicts[0].idx : -1;

  // ── Dispose old editors ──
  ['editorA','editorB','editorM'].forEach(k => { if (merge[k]) { merge[k].dispose(); merge[k] = null; } });
  if (merge._roObserver) { merge._roObserver.disconnect(); merge._roObserver = null; }
  merge._widgetsA = []; merge._widgetsB = [];
  merge._decorA   = []; merge._decorB   = [];
  merge._viewZonesA = []; merge._viewZonesB = [];

  const mon = window._monaco;
  const theme = state.theme === 'dark' ? 'df-dark' : 'df-light';
  const editorBase = {
    theme, language: state.lang,
    fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
    fontLigatures: true, lineHeight: 19,
    scrollBeyondLastLine: false, wordWrap: 'on',
    minimap: { enabled: false },
    scrollbar: { vertical: 'auto', horizontal: 'hidden' },
    padding: { top: 4, bottom: 4 },
    glyphMargin: false, lineNumbers: 'on',
    renderLineHighlight: 'line', contextmenu: false,
    readOnly: true,
  };

  // ── Side editor A (Incoming — srcA, read-only) ──
  merge.editorA = mon.editor.create(document.getElementById('paneA'), { ...editorBase, value: srcA });

  // ── Side editor B (Current — srcB, read-only) ──
  merge.editorB = mon.editor.create(document.getElementById('paneB'), { ...editorBase, value: srcB });

  // ── Result editor C (editable — starts as srcB) ──
  merge.editorM = mon.editor.create(document.getElementById('mergeEditorM'), {
    ...editorBase,
    readOnly: false,
    value: srcB,
    renderLineHighlight: 'line',
  });

  // ── Apply decorations + overlay widgets ──
  renderSidePanes();

  // ── Synchronized scrolling (A ↔ B, ratio-based) ──
  setupScrollSync();

  // ── ResizeObserver for all three editors ──
  merge._roObserver = new ResizeObserver(() => {
    merge.editorA && merge.editorA.layout();
    merge.editorB && merge.editorB.layout();
    merge.editorM && merge.editorM.layout();
  });
  merge._roObserver.observe(document.getElementById('paneA'));
  merge._roObserver.observe(document.getElementById('paneB'));
  merge._roObserver.observe(document.getElementById('mergeEditorM'));

  updateConflictUI();
  updateMergeStatus();

  if (merge.currentConflict >= 0) {
    setTimeout(() => scrollToConflict(merge.currentConflict), 150);
  }
}

/* ── Close merge view ── */
function closeMergeView() {
  merge.visible = false;
  // Dispose overlay widget scroll listeners
  ['_widgetsA','_widgetsB'].forEach(k => {
    (merge[k] || []).forEach(w => { if (w._dispose) w._dispose(); });
    merge[k] = [];
  });
  // Remove view zones
  if (merge.editorA) merge.editorA.changeViewZones(acc => { (merge._viewZonesA||[]).forEach(id => acc.removeZone(id)); });
  if (merge.editorB) merge.editorB.changeViewZones(acc => { (merge._viewZonesB||[]).forEach(id => acc.removeZone(id)); });
  merge._viewZonesA = []; merge._viewZonesB = [];
  // Dispose sync listeners
  (merge._syncDisposables || []).forEach(d => d.dispose());
  merge._syncDisposables = [];
  // Dispose editors (they will remove their DOM nodes)
  ['editorA','editorB','editorM'].forEach(k => { if (merge[k]) { merge[k].dispose(); merge[k] = null; } });
  if (merge._roObserver) { merge._roObserver.disconnect(); merge._roObserver = null; }

  document.getElementById('mergeArea').classList.remove('visible');
  document.getElementById('editorArea').classList.add('visible');
  document.getElementById('mergeToggle').classList.remove('active');
  document.getElementById('downloadMerge').style.display = 'none';
}

/* ── Wire all merge buttons ── */
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
  document.getElementById('scrollSyncToggle').classList.toggle('active', merge.scrollSync);
  showToast('Scroll sync: ' + (merge.scrollSync ? 'on' : 'off'));
});

document.getElementById('clearMerge').addEventListener('click', () => {
  if (!merge.editorM) return;
  merge.chunks.forEach(ch => {
    if (ch.type === 'conflict') {
      ch.choice = null;
      ch._resultLen = ch.bLines.length; // reset to B baseline
    }
  });
  // Restore File C to exact copy of File B — the ground truth
  merge.editorM.getModel().setValue(merge._srcB || '');
  merge.currentConflict = merge.chunks.filter(c => c.type === 'conflict')[0]?.idx ?? -1;
  renderSidePanes(); updateConflictUI(); updateMergeStatus();
  showToast('Reset — File C restored to File B baseline');
});

document.getElementById('downloadMerge').addEventListener('click', () => {
  if (!merge.editorM) return showToast('Open merge view first');
  const unresolved = merge.chunks.filter(c => c.type === 'conflict' && c.choice === null).length;
  if (unresolved > 0) showToast(unresolved + ' conflicts unresolved — using File B as fallback');
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