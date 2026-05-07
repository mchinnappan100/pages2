    /* ─────────────────────────────────────────────
       State
    ───────────────────────────────────────────── */
    let editorLeft, editorRight, diffEditor;
    let filenameLeft = 'left.txt';
    let filenameRight = 'right.txt';
    let currentDiffMode = 'text'; // 'text' | 'xml'

    /* ─────────────────────────────────────────────
       Sample XML files
    ───────────────────────────────────────────── */
    const SAMPLE_LEFT = `<?xml version="1.0" encoding="UTF-8"?>
<customer>
    <id>1001</id>
    <name>
        <first>John</first>
        <last>Doe</last>
    </name>
    <contact>
        <email>john.doe@example.com</email>
        <phone>+1-555-1234</phone>
    </contact>
    <address country="USA">
        <city>New York</city>
        <zip>10001</zip>
    </address>
</customer>`;

    const SAMPLE_RIGHT = `<?xml version="1.0" encoding="UTF-8"?>
<customer>
    <contact>
        <phone>+1-555-1234</phone>
        <email>john.doe@example.com</email>
    </contact>
    <address country="USA">
        <zip>10001</zip>
        <city>New York</city>
    </address>
    <name>
        <last>Doe</last>
        <first>John</first>
    </name>
    <id>
        1001
    </id>
</customer>`;

    const SAMPLE_JSON_LEFT = ` {
  "id": 101,
  "name": {
    "first": "Alice",
    "last": "Smith"
  },
  "skills": [
    "JavaScript",
    "Python",
    "SQL"
  ],
  "active": true,
  "contact": {
    "email": "alice.smith@example.com",
    "phone": "+1-555-9876"
  }
}`;

    const SAMPLE_JSON_RIGHT = `{
  "contact": {
    "phone": "+1-555-9876",
    "email": "alice.smith@example.com"
  },
  "active": true,
  "skills": [
    "JavaScript",
    "Python",
    "SQL"
  ],
  "name": {
    "last": "Smith",
    "first": "Alice"
  },
  "id": 101
}
  `;

    /* ─────────────────────────────────────────────
       Monaco init
    ───────────────────────────────────────────── */
    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
    require(["vs/editor/editor.main"], function() {
      editorLeft = monaco.editor.create(document.getElementById('leftEditor'), {
        value: SAMPLE_LEFT,
        language: "xml",
        theme: "vs-dark",
        automaticLayout: true,
        fontSize: 13,
        minimap: { enabled: true },
        wordWrap: 'on',
        lineNumbers: 'on',
        renderWhitespace: 'selection',
        scrollBeyondLastLine: false,
        folding: true,
        foldingStrategy: 'indentation',
        bracketPairColorization: { enabled: true },
      });

      editorRight = monaco.editor.create(document.getElementById('rightEditor'), {
        value: SAMPLE_RIGHT,
        language: "xml",
        theme: "vs-dark",
        automaticLayout: true,
        fontSize: 13,
        minimap: { enabled: true },
        wordWrap: 'on',
        lineNumbers: 'on',
        renderWhitespace: 'selection',
        scrollBeyondLastLine: false,
        folding: true,
        foldingStrategy: 'indentation',
        bracketPairColorization: { enabled: true },
      });

      diffEditor = monaco.editor.createDiffEditor(document.getElementById('diffEditor'), {
        theme: "vs-dark",
        automaticLayout: true,
        fontSize: 13,
        renderSideBySide: true,
        ignoreTrimWhitespace: false,
        originalEditable: false,
      });

      // Set default mode to XML Semantic on startup
      setDiffMode('xml');
      document.getElementById('leftFilename').textContent = 'customer-original.xml';
      document.getElementById('rightFilename').textContent = 'customer-modified.xml';
      filenameLeft = 'customer-original.xml';
      filenameRight = 'customer-modified.xml';
    });

    /* ─────────────────────────────────────────────
       Mode selector
    ───────────────────────────────────────────── */
    function setDiffMode(mode) {
      currentDiffMode = mode;
      document.getElementById('modeText').classList.toggle('active', mode === 'text');
      document.getElementById('modeXml').classList.toggle('active',  mode === 'xml');
      document.getElementById('modeJson').classList.toggle('active', mode === 'json');

      if (!window._userLoadedFiles) {
        if (mode === 'json') {
          editorLeft.setValue(SAMPLE_JSON_LEFT);
          editorRight.setValue(SAMPLE_JSON_RIGHT);
          monaco.editor.setModelLanguage(editorLeft.getModel(),  'json');
          monaco.editor.setModelLanguage(editorRight.getModel(), 'json');
          document.getElementById('leftFilename').textContent  = 'user-original.json';
          document.getElementById('rightFilename').textContent = 'user-modified.json';
          filenameLeft  = 'user-original.json';
          filenameRight = 'user-modified.json';
        } else if (mode === 'xml') {
          editorLeft.setValue(SAMPLE_LEFT);
          editorRight.setValue(SAMPLE_RIGHT);
          monaco.editor.setModelLanguage(editorLeft.getModel(),  'xml');
          monaco.editor.setModelLanguage(editorRight.getModel(), 'xml');
          document.getElementById('leftFilename').textContent  = 'customer-original.xml';
          document.getElementById('rightFilename').textContent = 'customer-modified.xml';
          filenameLeft  = 'customer-original.xml';
          filenameRight = 'customer-modified.xml';
        }
      }
    }

    /* ─────────────────────────────────────────────
       Compare button
    ───────────────────────────────────────────── */
    document.getElementById('compareBtn').addEventListener('click', () => {
      if (currentDiffMode === 'xml') {
        runXmlSemanticDiff();
      } else if (currentDiffMode === 'json') {
        runJsonSemanticDiff();
      } else {
        runTextDiff();
      }
    });

    function runTextDiff() {
      document.getElementById('editors').classList.add('hidden');
      document.getElementById('xmlDiffView').classList.add('hidden');
      document.getElementById('jsonDiffView').classList.add('hidden');
      document.getElementById('diffContainer').classList.remove('hidden');
      const leftModel  = editorLeft.getModel();
      const rightModel = editorRight.getModel();
      diffEditor.setModel({ original: leftModel, modified: rightModel });
      showToast('Text diff ready', 'success');
    }

    function exitDiffView() {
      document.getElementById('editors').classList.remove('hidden');
      document.getElementById('diffContainer').classList.add('hidden');
      document.getElementById('xmlDiffView').classList.add('hidden');
      document.getElementById('jsonDiffView').classList.add('hidden');
    }

    /* ─────────────────────────────────────────────
       XML Semantic Diff Engine
    ───────────────────────────────────────────── */
    function runXmlSemanticDiff() {
      const leftText  = editorLeft.getValue();
      const rightText = editorRight.getValue();

      if (!leftText.trim() && !rightText.trim()) {
        showToast('Both editors are empty', 'error'); return;
      }

      let leftDoc, rightDoc;
      try {
        leftDoc  = new DOMParser().parseFromString(leftText, 'application/xml');
        rightDoc = new DOMParser().parseFromString(rightText, 'application/xml');
      } catch(e) {
        showToast('XML parse error', 'error'); return;
      }

      // Check for parser errors
      const leftErr  = leftDoc.querySelector('parsererror');
      const rightErr = rightDoc.querySelector('parsererror');
      if (leftErr || rightErr) {
        const container = document.getElementById('xmlDiffContainer');
        container.innerHTML = `<div class="xd-error">
          ⚠️ XML Parse Error:<br>
          ${leftErr  ? '<b>Original:</b> ' + escHtml(leftErr.textContent.substring(0,200))  + '<br>' : ''}
          ${rightErr ? '<b>Modified:</b> ' + escHtml(rightErr.textContent.substring(0,200)) : ''}
        </div>`;
        showDiffPanel();
        return;
      }

      const changes = [];
      diffNodes(leftDoc.documentElement, rightDoc.documentElement, '', changes);

      renderXmlDiff(changes, leftText, rightText);
      showDiffPanel();
      showToast(`XML semantic diff: ${changes.length} change(s)`, changes.length ? 'success' : 'info');
    }

    function showDiffPanel() {
      document.getElementById('editors').classList.add('hidden');
      document.getElementById('diffContainer').classList.add('hidden');
      document.getElementById('jsonDiffView').classList.add('hidden');
      document.getElementById('xmlDiffView').classList.remove('hidden');
    }

    /* ── Core recursive XML differ ── */
    function diffNodes(left, right, path, changes) {
      if (!left && !right) return;

      const nodePath = path + '/' + (left || right).nodeName;

      // Both exist — compare
      if (left && right) {
        // 1. Compare attributes
        const leftAttrs  = getAttrs(left);
        const rightAttrs = getAttrs(right);
        const allAttrKeys = new Set([...Object.keys(leftAttrs), ...Object.keys(rightAttrs)]);

        for (const key of allAttrKeys) {
          const lv = leftAttrs[key];
          const rv = rightAttrs[key];
          if (lv === undefined) {
            changes.push({ type:'added',   path: nodePath + '/@' + key, left: null, right: rv });
          } else if (rv === undefined) {
            changes.push({ type:'removed', path: nodePath + '/@' + key, left: lv,  right: null });
          } else if (lv !== rv) {
            changes.push({ type:'changed', path: nodePath + '/@' + key, left: lv,  right: rv });
          }
        }

        // 2. Compare direct text content (ignore mixed content children for now)
        const leftText  = getDirectText(left);
        const rightText = getDirectText(right);
        if (leftText !== rightText) {
          if (leftText === '' && rightText !== '') {
            changes.push({ type:'added',   path: nodePath + '/text()', left: null, right: rightText });
          } else if (leftText !== '' && rightText === '') {
            changes.push({ type:'removed', path: nodePath + '/text()', left: leftText, right: null });
          } else {
            changes.push({ type:'changed', path: nodePath + '/text()', left: leftText, right: rightText });
          }
        }

        // 3. Recurse into child elements
        const leftChildren  = getElementChildren(left);
        const rightChildren = getElementChildren(right);

        // Group by tag name for matching
        const leftByTag  = groupByTag(leftChildren);
        const rightByTag = groupByTag(rightChildren);
        const allTags = new Set([...Object.keys(leftByTag), ...Object.keys(rightByTag)]);

        for (const tag of allTags) {
          const lArr = leftByTag[tag]  || [];
          const rArr = rightByTag[tag] || [];
          const max  = Math.max(lArr.length, rArr.length);
          for (let i = 0; i < max; i++) {
            const lNode = lArr[i] || null;
            const rNode = rArr[i] || null;
            const idxPath = lArr.length > 1 || rArr.length > 1 ? `[${i+1}]` : '';
            if (!lNode) {
              // Entire element added
              collectAdded(rNode, path + '/' + (left||right).nodeName + '/' + tag + idxPath, changes);
            } else if (!rNode) {
              // Entire element removed
              collectRemoved(lNode, path + '/' + (left||right).nodeName + '/' + tag + idxPath, changes);
            } else {
              diffNodes(lNode, rNode, path + '/' + (left||right).nodeName, changes);
            }
          }
        }

      } else if (!left) {
        collectAdded(right, path, changes);
      } else {
        collectRemoved(left, path, changes);
      }
    }

    function collectAdded(node, path, changes) {
      changes.push({ type:'added', path: path + '/' + node.nodeName, left: null, right: serializeNode(node) });
    }
    function collectRemoved(node, path, changes) {
      changes.push({ type:'removed', path: path + '/' + node.nodeName, left: serializeNode(node), right: null });
    }

    function getAttrs(node) {
      const out = {};
      if (!node.attributes) return out;
      for (const a of node.attributes) out[a.name] = a.value;
      return out;
    }

    function getDirectText(node) {
      let t = '';
      for (const child of node.childNodes) {
        if (child.nodeType === 3) t += child.nodeValue.trim();
      }
      return t;
    }

    function getElementChildren(node) {
      return Array.from(node.childNodes).filter(n => n.nodeType === 1);
    }

    function groupByTag(nodes) {
      const g = {};
      for (const n of nodes) {
        const tag = n.nodeName;
        if (!g[tag]) g[tag] = [];
        g[tag].push(n);
      }
      return g;
    }

    function serializeNode(node) {
      const s = new XMLSerializer();
      let xml = s.serializeToString(node);
      // Trim xmlns junk for readability
      xml = xml.replace(/ xmlns(?::[a-z]+)?="[^"]*"/g, '');
      if (xml.length > 300) xml = xml.substring(0, 300) + '…';
      return xml;
    }

    /* ─────────────────────────────────────────────
       Render XML diff results
    ───────────────────────────────────────────── */
    function renderXmlDiff(changes, leftRaw, rightRaw) {
      const container = document.getElementById('xmlDiffContainer');

      if (changes.length === 0) {
        container.innerHTML = `
          <div style="text-align:center;padding:40px;color:#6b7280;">
            <div style="font-size:48px;margin-bottom:12px;">✅</div>
            <div style="font-size:16px;color:#d1d5db;font-weight:600;">XML documents are semantically identical</div>
            <div style="font-size:12px;margin-top:6px;">No structural or attribute differences found</div>
          </div>`;
        return;
      }

      const added   = changes.filter(c => c.type === 'added').length;
      const removed = changes.filter(c => c.type === 'removed').length;
      const changed = changes.filter(c => c.type === 'changed').length;

      let html = `
        <div class="xd-summary">
          <div class="xd-summary-item"><div class="xd-dot" style="background:#22c55e"></div><b style="color:#86efac">${added}</b>&nbsp;added</div>
          <div class="xd-summary-item"><div class="xd-dot" style="background:#ef4444"></div><b style="color:#fca5a5">${removed}</b>&nbsp;removed</div>
          <div class="xd-summary-item"><div class="xd-dot" style="background:#f59e0b"></div><b style="color:#fde68a">${changed}</b>&nbsp;changed</div>
          <div class="xd-summary-item" style="margin-left:auto;color:#6b7280">${changes.length} total change(s)</div>
        </div>`;

      for (const c of changes) {
        const isAttr = c.path.includes('/@');
        const isText = c.path.includes('/text()');
        // For attrs/text use plain escaped values; for full elements use XML highlighting
        const fmtRight = val => (isAttr || isText) ? `<span style="font-style:italic">${escHtml(String(val))}</span>` : `<code style="display:block;margin-top:6px;white-space:pre-wrap;word-break:break-all">${highlightXml(String(val))}</code>`;
        const fmtLeft  = val => (isAttr || isText) ? `<span style="font-style:italic">${escHtml(String(val))}</span>` : `<code style="display:block;margin-top:6px;white-space:pre-wrap;word-break:break-all">${highlightXml(String(val))}</code>`;

        if (c.type === 'added') {
          html += `
            <div class="xd-section xd-added">
              <div class="xd-path">${escHtml(c.path)}</div>
              <span class="xd-label xd-label-add">ADDED</span>
              ${fmtRight(c.right)}
            </div>`;
        } else if (c.type === 'removed') {
          html += `
            <div class="xd-section xd-removed">
              <div class="xd-path">${escHtml(c.path)}</div>
              <span class="xd-label xd-label-del">REMOVED</span>
              ${fmtLeft(c.left)}
            </div>`;
        } else if (c.type === 'changed') {
          html += `
            <div class="xd-section xd-changed">
              <div class="xd-path">${escHtml(c.path)}</div>
              <span class="xd-label xd-label-change">CHANGED</span>
              <span style="color:#fca5a5;text-decoration:line-through">${escHtml(String(c.left))}</span>
              <span style="color:#9ca3af;margin:0 6px">→</span>
              <span style="color:#86efac">${escHtml(String(c.right))}</span>
            </div>`;
        }
      }

      container.innerHTML = html;
    }

    /* ─────────────────────────────────────────────
       JSON Semantic Diff Engine
    ───────────────────────────────────────────── */
    function runJsonSemanticDiff() {
      const leftText  = editorLeft.getValue();
      const rightText = editorRight.getValue();
      if (!leftText.trim() && !rightText.trim()) {
        showToast('Both editors are empty', 'error'); return;
      }
      let leftObj, rightObj;
      try { leftObj  = JSON.parse(leftText);  } catch(e) {
        showDiffPanelJson(`<div class="xd-error">⚠️ JSON Parse Error (Original):<br>${escHtml(e.message)}</div>`); return;
      }
      try { rightObj = JSON.parse(rightText); } catch(e) {
        showDiffPanelJson(`<div class="xd-error">⚠️ JSON Parse Error (Modified):<br>${escHtml(e.message)}</div>`); return;
      }
      const changes = [];
      diffJson(leftObj, rightObj, '$', changes);
      renderJsonDiff(changes);
      showDiffPanelJson();
      showToast(`JSON semantic diff: ${changes.length} change(s)`, changes.length ? 'success' : 'info');
    }

    function showDiffPanelJson(errorHtml) {
      document.getElementById('editors').classList.add('hidden');
      document.getElementById('diffContainer').classList.add('hidden');
      document.getElementById('xmlDiffView').classList.add('hidden');
      document.getElementById('jsonDiffView').classList.remove('hidden');
      if (errorHtml) document.getElementById('jsonDiffContainer').innerHTML = errorHtml;
    }

    function diffJson(left, right, path, changes) {
      const lType = jsonType(left);
      const rType = jsonType(right);

      // Type changed — treat as replaced
      if (lType !== rType) {
        changes.push({ type:'changed', path, left, right });
        return;
      }

      if (lType === 'object') {
        const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);
        for (const key of allKeys) {
          const childPath = `${path}.${key}`;
          if (!(key in left)) {
            changes.push({ type:'added',   path: childPath, left: undefined, right: right[key] });
          } else if (!(key in right)) {
            changes.push({ type:'removed', path: childPath, left: left[key],  right: undefined });
          } else {
            diffJson(left[key], right[key], childPath, changes);
          }
        }
      } else if (lType === 'array') {
        const maxLen = Math.max(left.length, right.length);
        for (let i = 0; i < maxLen; i++) {
          const childPath = `${path}[${i}]`;
          if (i >= left.length) {
            changes.push({ type:'added',   path: childPath, left: undefined, right: right[i] });
          } else if (i >= right.length) {
            changes.push({ type:'removed', path: childPath, left: left[i],  right: undefined });
          } else {
            diffJson(left[i], right[i], childPath, changes);
          }
        }
      } else {
        // Primitives
        if (left !== right) {
          changes.push({ type:'changed', path, left, right });
        }
      }
    }

    function jsonType(v) {
      if (v === null) return 'null';
      if (Array.isArray(v)) return 'array';
      return typeof v; // 'object', 'string', 'number', 'boolean'
    }

    function renderJsonDiff(changes) {
      const container = document.getElementById('jsonDiffContainer');
      if (changes.length === 0) {
        container.innerHTML = `
          <div style="text-align:center;padding:40px;color:#6b7280;">
            <div style="font-size:48px;margin-bottom:12px;">✅</div>
            <div style="font-size:16px;color:#d1d5db;font-weight:600;">JSON documents are semantically identical</div>
            <div style="font-size:12px;margin-top:6px;">No structural or value differences found</div>
          </div>`;
        return;
      }

      const added   = changes.filter(c => c.type === 'added').length;
      const removed = changes.filter(c => c.type === 'removed').length;
      const changed = changes.filter(c => c.type === 'changed').length;

      let html = `
        <div class="xd-summary">
          <div class="xd-summary-item"><div class="xd-dot" style="background:#22c55e"></div><b style="color:#86efac">${added}</b>&nbsp;added</div>
          <div class="xd-summary-item"><div class="xd-dot" style="background:#ef4444"></div><b style="color:#fca5a5">${removed}</b>&nbsp;removed</div>
          <div class="xd-summary-item"><div class="xd-dot" style="background:#f59e0b"></div><b style="color:#fde68a">${changed}</b>&nbsp;changed</div>
          <div class="xd-summary-item" style="margin-left:auto;color:#6b7280">${changes.length} total change(s)</div>
        </div>`;

      for (const c of changes) {
        const isComplex = v => v !== null && typeof v === 'object';
        const fmtVal = v => {
          if (v === undefined) return '<em style="color:#6b7280">undefined</em>';
          if (isComplex(v)) return `<code style="display:block;margin-top:6px;white-space:pre-wrap;word-break:break-all;font-size:12px">${highlightJson(JSON.stringify(v, null, 2))}</code>`;
          return `<span style="font-style:italic">${highlightJson(JSON.stringify(v))}</span>`;
        };

        if (c.type === 'added') {
          html += `<div class="xd-section xd-added">
            <div class="xd-path">${escHtml(c.path)}</div>
            <span class="xd-label xd-label-add">ADDED</span>${fmtVal(c.right)}
          </div>`;
        } else if (c.type === 'removed') {
          html += `<div class="xd-section xd-removed">
            <div class="xd-path">${escHtml(c.path)}</div>
            <span class="xd-label xd-label-del">REMOVED</span>${fmtVal(c.left)}
          </div>`;
        } else if (c.type === 'changed') {
          html += `<div class="xd-section xd-changed">
            <div class="xd-path">${escHtml(c.path)}</div>
            <span class="xd-label xd-label-change">CHANGED</span>
            ${fmtVal(c.left)}
            <span style="color:#9ca3af;margin:0 8px;font-size:16px">→</span>
            ${fmtVal(c.right)}
          </div>`;
        }
      }
      container.innerHTML = html;
    }

    /* JSON syntax highlighter for diff display */
    function highlightJson(str) {
      let s = escHtml(String(str));
      // String values (after colon) and string keys
      s = s.replace(/(&quot;)((?:[^&]|&amp;|&lt;|&gt;)*)(&quot;)(\s*:)/g,
        '<span style="color:#9cdcfe">$1$2$3</span><span style="color:#d4d4d4">$4</span>');
      s = s.replace(/:\s*(&quot;)((?:[^&]|&amp;|&lt;|&gt;)*)(&quot;)/g,
        ': <span style="color:#ce9178">$1$2$3</span>');
      // Standalone string values (array items)
      s = s.replace(/^(\s*)(&quot;)((?:[^&]|&amp;)*)(&quot;)(\s*,?)$/gm,
        '$1<span style="color:#ce9178">$2$3$4</span>$5');
      // Numbers
      s = s.replace(/:\s*(-?\d+\.?\d*)/g, ': <span style="color:#b5cea8">$1</span>');
      // Booleans & null
      s = s.replace(/:\s*(true|false|null)/g, ': <span style="color:#569cd6">$1</span>');
      // Brackets
      s = s.replace(/([{}\[\]])/g, '<span style="color:#ffd700">$1</span>');
      return s;
    }

    function escHtml(str) {
      return String(str)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;');
    }

    /* Simple XML syntax highlighter for diff display */
    function highlightXml(str) {
      let s = escHtml(String(str));
      // Processing instructions
      s = s.replace(/(&lt;\?)([a-zA-Z]+)(.*?)(\?&gt;)/g,
        '<span style="color:#608b4e">$1$2$3$4</span>');
      // Attributes: name="value"
      s = s.replace(/\s([\w:-]+)=((?:&quot;)[^&]*(?:&quot;))/g,
        ' <span style="color:#9cdcfe">$1</span>=<span style="color:#ce9178">$2</span>');
      // Closing tags </tag>
      s = s.replace(/(&lt;\/)([\w:.-]+)(&gt;)/g,
        '<span style="color:#808080">$1</span><span style="color:#4ec9b0">$2</span><span style="color:#808080">$3</span>');
      // Self-closing tags <tag/>
      s = s.replace(/(&lt;)([\w:.-]+)([^&]*?)(\/&gt;)/g,
        '<span style="color:#808080">$1</span><span style="color:#4ec9b0">$2</span>$3<span style="color:#808080">$4</span>');
      // Opening tags <tag
      s = s.replace(/(&lt;)([\w:.-]+)/g,
        '<span style="color:#808080">$1</span><span style="color:#4ec9b0">$2</span>');
      // Remaining >
      s = s.replace(/(&gt;)/g, '<span style="color:#808080">$1</span>');
      return s;
    }

    /* ─────────────────────────────────────────────
       Misc controls
    ───────────────────────────────────────────── */
    document.getElementById('clearAll').addEventListener('click', () => {
      if (confirm('Clear all content? This cannot be undone.')) {
        editorLeft.setValue(''); editorRight.setValue('');
        filenameLeft = 'left.txt'; filenameRight = 'right.txt';
        document.getElementById('leftFilename').textContent = '';
        document.getElementById('rightFilename').textContent = '';
        exitDiffView();
        showToast('All content cleared', 'info');
      }
    });

    document.getElementById('toggleTheme').addEventListener('click', () => {
      const html = document.documentElement;
      if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        monaco.editor.setTheme('vs');
      } else {
        html.classList.add('dark');
        monaco.editor.setTheme('vs-dark');
      }
    });

    document.getElementById('leftFile').addEventListener('change',  e => handleFileInput(e, 'left'));
    document.getElementById('rightFile').addEventListener('change', e => handleFileInput(e, 'right'));

    function handleFileInput(e, which) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        if (which === 'left') {
          editorLeft.setValue(ev.target.result);
          filenameLeft = file.name;
          document.getElementById('leftFilename').textContent = file.name;
          setLanguage(editorLeft, file.name);
          autoDetectMode(file.name);
        } else {
          editorRight.setValue(ev.target.result);
          filenameRight = file.name;
          document.getElementById('rightFilename').textContent = file.name;
          setLanguage(editorRight, file.name);
          autoDetectMode(file.name);
        }
        showToast(`Loaded ${file.name}`, 'success');
      };
      reader.readAsText(file);
    }

    function autoDetectMode(filename) {
      const ext = filename.split('.').pop().toLowerCase();
      window._userLoadedFiles = true;
      if (ext === 'xml' || ext === 'xsd' || ext === 'xsl' || ext === 'xslt' || ext === 'pom' || ext === 'svg') {
        setDiffMode('xml');
        showToast('XML file detected — switched to XML Semantic mode', 'info');
      } else if (ext === 'json') {
        setDiffMode('json');
        showToast('JSON file detected — switched to JSON Semantic mode', 'info');
      }
    }

    function setLanguage(editor, filename) {
      const ext = filename.split('.').pop().toLowerCase();
      const map = {
        js:'javascript', json:'json', py:'python', html:'html', css:'css',
        xml:'xml', xsd:'xml', xsl:'xml', xslt:'xml', svg:'xml', pom:'xml',
        java:'java', cpp:'cpp', c:'cpp', h:'cpp', ts:'typescript',
        md:'markdown', sql:'sql'
      };
      monaco.editor.setModelLanguage(editor.getModel(), map[ext] || 'plaintext');
    }

    async function copyToClipboard(which) {
      const text = which === 'left' ? editorLeft.getValue() : editorRight.getValue();
      try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success');
      } catch { showToast('Failed to copy', 'error'); }
    }

    function downloadFile(which) {
      const text     = which === 'left' ? editorLeft.getValue() : editorRight.getValue();
      const filename = which === 'left' ? filenameLeft : filenameRight;
      const blob = new Blob([text], {type:'text/plain'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename; a.click();
      showToast(`Downloaded ${filename}`, 'success');
    }

    function showToast(msg, type = 'info') {
      const colors = { success:'bg-green-600', error:'bg-red-600', info:'bg-blue-600' };
      const el = document.createElement('div');
      el.textContent = msg;
      el.className = `fixed right-6 bottom-20 ${colors[type]} text-white px-4 py-3 rounded-lg shadow-2xl z-50 animate-in`;
      document.body.appendChild(el);
      setTimeout(() => {
        el.style.opacity = '0'; el.style.transform = 'translateY(10px)';
        el.style.transition = 'all 0.3s ease';
        setTimeout(() => el.remove(), 300);
      }, 2500);
    }

    /* ─────────────────────────────────────────────
       Drag & Drop
    ───────────────────────────────────────────── */
    ['leftDropZone', 'rightDropZone'].forEach(id => {
      const zone  = document.getElementById(id);
      const which = id.includes('left') ? 'left' : 'right';

      zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drag-over'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
      zone.addEventListener('drop', e => {
        e.preventDefault(); zone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          if (which === 'left') {
            editorLeft.setValue(ev.target.result);
            filenameLeft = file.name;
            document.getElementById('leftFilename').textContent = file.name;
            setLanguage(editorLeft, file.name);
            autoDetectMode(file.name);
          } else {
            editorRight.setValue(ev.target.result);
            filenameRight = file.name;
            document.getElementById('rightFilename').textContent = file.name;
            setLanguage(editorRight, file.name);
            autoDetectMode(file.name);
          }
          showToast(`Dropped ${file.name}`, 'success');
        };
        reader.readAsText(file);
      });
    });