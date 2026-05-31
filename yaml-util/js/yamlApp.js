// yamlApp.js — YAML Editor, jq Query, YAML Diff
// mohan chinnappan

// ─── helpers ──────────────────────────────────────────────────────────────────

function escHtml(s) {
    return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Parse YAML or JSON text → JS object; returns {ok, data, error}
function parseYamlOrJson(text) {
    try {
        const data = jsyaml.load(text);
        return { ok: true, data };
    } catch (e) {
        return { ok: false, error: e.message };
    }
}

// Serialise JS object → YAML string
function toYaml(data) { return jsyaml.dump(data, { indent: 2, lineWidth: -1 }); }

// Extract dot-paths from any JS value (used for autocomplete)
function extractPaths(obj, prefix = '', depth = 0) {
    const paths = new Set();
    if (depth > 6 || typeof obj !== 'object' || obj === null) return paths;
    const isArr = Array.isArray(obj);
    for (const key of Object.keys(obj)) {
        const seg  = isArr ? `[${key}]` : `.${key}`;
        const full = prefix + seg;
        paths.add(full);
        for (const p of extractPaths(obj[key], full, depth + 1)) paths.add(p);
    }
    return paths;
}

// ─── Monaco setup ─────────────────────────────────────────────────────────────

require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor/min/vs' } });

require(['vs/editor/editor.main'], function () {

    const INIT_YAML = `# YAML Editor - Kalam
name: JSON Editor Kalam
version: 1.0.0
features:
  - editor
  - jq query
  - diff
browsers:
  - Chrome
  - Safari
  - Firefox
  - Brave
settings:
  theme: dark
  minimap: false
  autosave: true
gems:
  unix:
    - ken
    - dmr
  c:
    - dmr
pi: 3.14159
active: true
`;

    // ══ EDITOR TAB ═══════════════════════════════════════════════════════════

    const mainEditor = monaco.editor.create(document.getElementById('editor-yaml'), {
        value: INIT_YAML,
        language: 'yaml',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        wordWrap: 'on',
        scrollBeyondLastLine: false
    });

    // ── parsed tree ──────────────────────────────────────────────────────────

    function renderTree(data, container) {
        container.innerHTML = '';
        container.appendChild(buildTreeNode(data, null));
    }

    function buildTreeNode(val, key) {
        const wrap = document.createElement('div');
        wrap.className = 'yt-node';

        const isObj = typeof val === 'object' && val !== null;
        const isArr = Array.isArray(val);

        if (key !== null) {
            const kSpan = document.createElement('span');
            kSpan.className = 'yt-key';
            kSpan.textContent = key;
            wrap.appendChild(kSpan);
            const colon = document.createElement('span');
            colon.className = 'yt-colon'; colon.textContent = ':';
            wrap.appendChild(colon);
        }

        if (!isObj) {
            const vSpan = document.createElement('span');
            if (val === null)           vSpan.className = 'yt-val-null';
            else if (typeof val === 'boolean') vSpan.className = 'yt-val-bool';
            else if (typeof val === 'number')  vSpan.className = 'yt-val-num';
            else                        vSpan.className = 'yt-val-str';
            vSpan.textContent = ' ' + (val === null ? 'null' : String(val));
            wrap.appendChild(vSpan);
            return wrap;
        }

        // collapsible branch
        const toggle = document.createElement('span');
        toggle.className = 'yt-toggle'; toggle.textContent = ' ▾';
        const summary = document.createElement('span');
        summary.className = isArr ? 'yt-val-arr' : 'yt-val-obj';
        const count = Object.keys(val).length;
        summary.textContent = ` ${isArr ? `[${count}]` : `{${count}}`}`;
        wrap.appendChild(toggle);
        wrap.appendChild(summary);

        const children = document.createElement('div');
        children.className = 'yt-children';
        const entries = isArr ? val.map((v, i) => [String(i), v]) : Object.entries(val);
        for (const [k, v] of entries) children.appendChild(buildTreeNode(v, k));
        wrap.appendChild(children);

        toggle.addEventListener('click', () => {
            const collapsed = children.classList.toggle('collapsed');
            toggle.textContent = collapsed ? ' ▸' : ' ▾';
        });
        return wrap;
    }

    const treePane    = document.getElementById('yaml-tree');
    const parseStatus = document.getElementById('parse-status');

    function refreshTree() {
        const { ok, data, error } = parseYamlOrJson(mainEditor.getValue());
        if (ok) {
            parseStatus.className = 'parse-status parse-ok';
            parseStatus.textContent = '✓ Valid';
            renderTree(data, treePane);
        } else {
            parseStatus.className = 'parse-status parse-err';
            parseStatus.textContent = '✗ ' + error.split('\n')[0];
        }
    }

    refreshTree();
    mainEditor.onDidChangeModelContent(() => refreshTree());

    // ── download buttons ─────────────────────────────────────────────────────

    function download(content, filename, mime) {
        const a = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(new Blob([content], { type: mime })),
            download: filename
        });
        document.body.appendChild(a); a.click();
        document.body.removeChild(a);
    }

    document.getElementById('download-button').addEventListener('click', () =>
        download(mainEditor.getValue(), 'output.yaml', 'text/yaml'));

    document.getElementById('download-json-button').addEventListener('click', () => {
        const { ok, data } = parseYamlOrJson(mainEditor.getValue());
        if (ok) download(JSON.stringify(data, null, 2), 'output.json', 'application/json');
        else alert('YAML parse error — fix the source first.');
    });

    document.getElementById('convert-json-btn').addEventListener('click', () => {
        const { ok, data, error } = parseYamlOrJson(mainEditor.getValue());
        if (ok) mainEditor.setValue(toYaml(data));
        else alert('Parse error: ' + error);
    });

    // ── file drop / input ─────────────────────────────────────────────────────

    function loadTextIntoMain(text) { mainEditor.setValue(text); }

    document.getElementById('yamlFileInput').addEventListener('change', (e) => {
        const f = e.target.files[0]; if (!f) return;
        const r = new FileReader();
        r.onload = (ev) => {
            const txt = ev.target.result;
            // if JSON, auto-convert to YAML
            try { loadTextIntoMain(toYaml(JSON.parse(txt))); } catch (_) { loadTextIntoMain(txt); }
        };
        r.readAsText(f);
    });

    const dropArea = document.getElementById('dropArea');
    dropArea.addEventListener('dragenter', e => e.preventDefault(), false);
    dropArea.addEventListener('dragover',  e => e.preventDefault(), false);
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0]; if (!f) return;
        const r = new FileReader();
        r.onload = (ev) => {
            const txt = ev.target.result;
            try { loadTextIntoMain(toYaml(JSON.parse(txt))); } catch (_) { loadTextIntoMain(txt); }
        };
        r.readAsText(f);
    }, false);

    // ── editor-tab vertical splitter ──────────────────────────────────────────

    (function () {
        const container = document.querySelector('.editor-container');
        const colA   = document.getElementById('yaml-monaco-col');
        const colB   = document.getElementById('yaml-tree-col');
        const gutter = document.getElementById('editor-gutter');
        const GUTTER_W = 8;
        let dragging = false, startX = 0, startAW = 0;

        gutter.addEventListener('pointerdown', (e) => {
            e.preventDefault(); dragging = true;
            startX = e.clientX;
            startAW = colA.getBoundingClientRect().width;
            gutter.classList.add('dragging'); gutter.setPointerCapture(e.pointerId);
        });
        gutter.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            const total = container.getBoundingClientRect().width - GUTTER_W;
            const newW = Math.min(Math.max(startAW + (e.clientX - startX), total * .1), total * .9);
            colA.style.flex = `0 0 ${newW}px`;
            colB.style.flex = `0 0 ${total - newW}px`;
            mainEditor.layout();
        });
        gutter.addEventListener('pointerup',          () => { dragging = false; gutter.classList.remove('dragging'); });
        gutter.addEventListener('lostpointercapture', () => { dragging = false; gutter.classList.remove('dragging'); });
    }());

    // ══ jq TAB ════════════════════════════════════════════════════════════════

    const jqInputEditor = monaco.editor.create(document.getElementById('jq-input-editor'), {
        value: INIT_YAML, language: 'yaml', theme: 'vs-dark',
        automaticLayout: true, minimap: { enabled: false }, wordWrap: 'on'
    });
    const jqOutputEditor = monaco.editor.create(document.getElementById('jq-output-editor'), {
        value: '', language: 'json', theme: 'vs-dark',
        automaticLayout: true, readOnly: true, minimap: { enabled: false }
    });

    let jqPromise = null;
    function loadJq() {
        if (!jqPromise) {
            jqPromise = new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = 'https://cdn.jsdelivr.net/npm/jq-web@0.5.1/jq.wasm.min.js';
                s.onload = () => resolve(window.jq);
                s.onerror = () => reject(new Error('Failed to load jq-web'));
                document.head.appendChild(s);
            });
        }
        return jqPromise;
    }

    async function runJqQuery() {
        const query = document.getElementById('jq-query-input').value.trim() || '.';
        jqOutputEditor.setValue('// Running…');
        const { ok, data, error } = parseYamlOrJson(jqInputEditor.getValue());
        if (!ok) { jqOutputEditor.setValue(`// YAML parse error: ${error}`); return; }
        try {
            const jqLib = await loadJq();
            const result = await jqLib.promised.json(data, query);
            jqOutputEditor.setValue(JSON.stringify(result, null, 2));
        } catch (e) {
            jqOutputEditor.setValue(`// jq error: ${e.message || e}`);
        }
    }

    document.getElementById('jq-run-btn').addEventListener('click', runJqQuery);
    document.getElementById('jq-query-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !acDropdownVisible()) { e.preventDefault(); runJqQuery(); }
    });
    document.getElementById('jq-use-editor-btn').addEventListener('click', () => {
        jqInputEditor.setValue(mainEditor.getValue());
    });
    document.getElementById('jq-tab').addEventListener('shown.bs.tab', () => {
        jqInputEditor.setValue(mainEditor.getValue());
        jqInputEditor.layout(); jqOutputEditor.layout();
        rebuildAcPaths();
    });

    // ── jq autocomplete ───────────────────────────────────────────────────────

    let acPaths = [], acActive = -1;

    function rebuildAcPaths() {
        const { ok, data } = parseYamlOrJson(jqInputEditor.getValue());
        acPaths = ok ? [...extractPaths(data)] : [];
    }
    rebuildAcPaths();
    jqInputEditor.onDidChangeModelContent(() => rebuildAcPaths());

    const JQ_BUILTINS = [
        { filter: '.',                        desc: 'Identity',                          tag: 'basic' },
        { filter: '.foo',                     desc: 'Object field',                      tag: 'field' },
        { filter: '.foo.bar',                 desc: 'Nested field',                      tag: 'field' },
        { filter: '.foo?',                    desc: 'Optional field',                    tag: 'field' },
        { filter: '.[]',                      desc: 'Iterate array/object values',       tag: 'iter' },
        { filter: '.[0]',                     desc: 'Array index',                       tag: 'array' },
        { filter: '.[-1]',                    desc: 'Last element',                      tag: 'array' },
        { filter: '.[2:5]',                   desc: 'Array slice',                       tag: 'array' },
        { filter: '[.[] | .name]',            desc: 'Array construction',                tag: 'construct' },
        { filter: '{name:.name,age:.age}',    desc: 'Object construction',               tag: 'construct' },
        { filter: 'keys',                     desc: 'Object keys (sorted)',              tag: 'type' },
        { filter: 'values',                   desc: 'Object values',                     tag: 'type' },
        { filter: 'length',                   desc: 'Length of array/string/object',     tag: 'type' },
        { filter: 'type',                     desc: 'Type of value',                     tag: 'type' },
        { filter: 'has("key")',               desc: 'Test if key exists',                tag: 'test' },
        { filter: 'select(.age > 30)',        desc: 'Filter by condition',               tag: 'filter' },
        { filter: 'select(type == "string")', desc: 'Filter by type',                   tag: 'filter' },
        { filter: 'map(.value + 1)',          desc: 'Map over array',                    tag: 'array' },
        { filter: 'map(select(. > 0))',       desc: 'Filter array elements',             tag: 'array' },
        { filter: 'to_entries',               desc: 'Object to [{key,value}]',           tag: 'convert' },
        { filter: 'from_entries',             desc: '[{key,value}] to object',           tag: 'convert' },
        { filter: 'with_entries(.value |= ascii_upcase)', desc: 'Transform entries',     tag: 'convert' },
        { filter: '..',                       desc: 'Recursive descent',                 tag: 'recurse' },
        { filter: '.. | strings',            desc: 'All strings anywhere',              tag: 'recurse' },
        { filter: '.. | numbers',            desc: 'All numbers anywhere',              tag: 'recurse' },
        { filter: 'paths',                   desc: 'All paths in input',                tag: 'path' },
        { filter: 'paths(scalars)',          desc: 'Paths to leaf values',              tag: 'path' },
        { filter: 'add',                     desc: 'Sum array',                         tag: 'reduce' },
        { filter: 'unique',                  desc: 'Unique elements',                   tag: 'reduce' },
        { filter: 'unique_by(.name)',        desc: 'Unique by key',                     tag: 'reduce' },
        { filter: 'group_by(.dept)',         desc: 'Group by key',                      tag: 'reduce' },
        { filter: 'sort_by(.name)',          desc: 'Sort by key',                       tag: 'reduce' },
        { filter: 'sort_by(.age) | reverse', desc: 'Sort descending',                  tag: 'reduce' },
        { filter: 'min_by(.score)',          desc: 'Minimum by key',                    tag: 'reduce' },
        { filter: 'max_by(.score)',          desc: 'Maximum by key',                    tag: 'reduce' },
        { filter: 'flatten',                 desc: 'Flatten nested arrays',             tag: 'array' },
        { filter: 'first',                   desc: 'First element',                     tag: 'array' },
        { filter: 'last',                    desc: 'Last element',                      tag: 'array' },
        { filter: 'reverse',                 desc: 'Reverse array',                     tag: 'array' },
        { filter: 'contains({a:1})',         desc: 'Containment test',                  tag: 'test' },
        { filter: 'split(",")',              desc: 'Split string',                       tag: 'string' },
        { filter: 'join(",")',              desc: 'Join array of strings',               tag: 'string' },
        { filter: 'test("regex")',          desc: 'Test string vs regex',               tag: 'string' },
        { filter: 'ascii_downcase',         desc: 'Lowercase',                          tag: 'string' },
        { filter: 'ascii_upcase',           desc: 'Uppercase',                          tag: 'string' },
        { filter: 'ltrimstr("prefix")',     desc: 'Remove prefix',                      tag: 'string' },
        { filter: 'rtrimstr("suffix")',     desc: 'Remove suffix',                      tag: 'string' },
        { filter: 'startswith("http")',     desc: 'Prefix test',                        tag: 'string' },
        { filter: 'endswith(".yaml")',      desc: 'Suffix test',                        tag: 'string' },
        { filter: 'tostring',              desc: 'Value to JSON string',                tag: 'string' },
        { filter: 'tonumber',              desc: 'Parse string to number',              tag: 'string' },
        { filter: 'floor',                 desc: 'Round down',                          tag: 'math' },
        { filter: 'ceil',                  desc: 'Round up',                            tag: 'math' },
        { filter: 'round',                 desc: 'Round to nearest',                    tag: 'math' },
        { filter: 'fabs',                  desc: 'Absolute value',                      tag: 'math' },
        { filter: 'sqrt',                  desc: 'Square root',                         tag: 'math' },
        { filter: 'if .x > 0 then "pos" else "neg" end', desc: 'if-then-else',         tag: 'logic' },
        { filter: '.foo // "default"',     desc: 'Alternative / default',               tag: 'logic' },
        { filter: 'not',                   desc: 'Boolean negation',                    tag: 'logic' },
        { filter: 'try . catch "err"',     desc: 'Error handling',                      tag: 'logic' },
        { filter: '. as $x | $x * $x',    desc: 'Variable binding',                    tag: 'var' },
        { filter: '@base64',               desc: 'Base64 encode',                       tag: 'format' },
        { filter: '@base64d',              desc: 'Base64 decode',                       tag: 'format' },
        { filter: '@uri',                  desc: 'URL encode',                          tag: 'format' },
        { filter: '@csv',                  desc: 'Array to CSV',                        tag: 'format' },
        { filter: '@tsv',                  desc: 'Array to TSV',                        tag: 'format' },
        { filter: '@json',                 desc: 'Serialize to JSON string',            tag: 'format' },
        { filter: 'del(.foo)',                              desc: 'Delete field',        tag: 'recipe' },
        { filter: '[.[] | select(.status == "active")]',   desc: 'Filter by field',     tag: 'recipe' },
        { filter: '[.[] | {id,name}]',                     desc: 'Project fields',      tag: 'recipe' },
        { filter: '[.[] | .price] | add / length',         desc: 'Average of field',    tag: 'recipe' },
        { filter: 'walk(if type == "string" then ascii_upcase else . end)', desc: 'Transform all strings', tag: 'recipe' },
        { filter: '[.. | .id? | select(. != null)]',       desc: 'All id values',       tag: 'recipe' },
        { filter: 'reduce .[] as $x (0; . + $x)',          desc: 'Fold/reduce',         tag: 'reduce' },
    ];

    const TAG_ORDER = [
        ['recipe','Practical Recipes'], ['basic','Identity & Basic'],
        ['field','Field Access'], ['array','Arrays'], ['iter','Iteration'],
        ['construct','Construction'], ['type','Types & Inspection'],
        ['filter','Select & Filter'], ['recurse','Recursive Descent'],
        ['path','Paths'], ['string','Strings & Regex'], ['math','Math'],
        ['reduce','Reduce & Aggregation'], ['format','Format & Encode'],
        ['logic','Conditionals & Errors'], ['var','Variables'],
        ['convert','Conversion'], ['test','Testing'],
    ];

    function buildHelpPanel() {
        const body = document.getElementById('jq-help-body');
        let html = '';
        for (const [tag, label] of TAG_ORDER) {
            const items = JQ_BUILTINS.filter(b => b.tag === tag);
            if (!items.length) continue;
            html += `<div class="jq-help-section" data-tag="${tag}">
                <div class="jq-help-section-title">${label}</div>`;
            for (const item of items) {
                html += `<div class="jq-example" data-filter="${escHtml(item.filter)}" data-desc="${escHtml(item.desc)}" title="Click to use">
                    <span class="jq-example-filter">${escHtml(item.filter)}</span>
                    <span class="jq-example-desc">${escHtml(item.desc)}</span>
                    <span class="jq-use-badge">use</span>
                </div>`;
            }
            html += '</div>';
        }
        body.innerHTML = html;
        body.addEventListener('click', (e) => {
            const row = e.target.closest('.jq-example');
            if (!row) return;
            document.getElementById('jq-query-input').value = row.dataset.filter;
            closeHelpDrawer();
        });
    }
    buildHelpPanel();

    document.getElementById('jq-help-search').addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('.jq-example').forEach(el => {
            el.classList.toggle('hidden', !!q && !el.dataset.filter.toLowerCase().includes(q) && !el.dataset.desc.toLowerCase().includes(q));
        });
        document.querySelectorAll('.jq-help-section').forEach(sec => {
            sec.classList.toggle('hidden', ![...sec.querySelectorAll('.jq-example')].some(el => !el.classList.contains('hidden')));
        });
    });

    function openHelpDrawer() {
        document.getElementById('jq-help-overlay').classList.add('open');
        document.getElementById('jq-help-drawer').classList.add('open');
        document.getElementById('jq-help-search').value = '';
        document.querySelectorAll('.jq-example, .jq-help-section').forEach(el => el.classList.remove('hidden'));
        document.getElementById('jq-help-search').focus();
    }
    function closeHelpDrawer() {
        document.getElementById('jq-help-overlay').classList.remove('open');
        document.getElementById('jq-help-drawer').classList.remove('open');
    }
    document.getElementById('jq-help-btn').addEventListener('click', openHelpDrawer);
    document.getElementById('jq-help-close').addEventListener('click', closeHelpDrawer);
    document.getElementById('jq-help-overlay').addEventListener('click', closeHelpDrawer);

    // autocomplete
    const jqQueryInput = document.getElementById('jq-query-input');
    let acDropdown = null;

    function acDropdownVisible() { return acDropdown && acDropdown.style.display !== 'none'; }

    function getAcItems(text) {
        const token = text.match(/(\S*)$/)?.[1] ?? '';
        if (!token) return [];
        const lower = token.toLowerCase();
        const pathMatches = acPaths.filter(p => p.toLowerCase().includes(lower)).slice(0, 10)
            .map(p => ({ label: p, tag: 'path' }));
        const builtinMatches = JQ_BUILTINS.filter(b =>
            b.filter.toLowerCase().startsWith(lower) && !pathMatches.find(m => m.label === b.filter)
        ).slice(0, 8).map(b => ({ label: b.filter, tag: b.tag }));
        return [...pathMatches, ...builtinMatches].slice(0, 14);
    }

    function showAcDropdown(items) {
        if (!acDropdown) {
            acDropdown = document.createElement('div');
            acDropdown.id = 'jq-ac-dropdown';
            document.body.appendChild(acDropdown);
        }
        acActive = -1;
        acDropdown.innerHTML = items.map((item, i) =>
            `<div class="jq-ac-item" data-idx="${i}" data-value="${escHtml(item.label)}">
                <span>${escHtml(item.label)}</span>
                <span class="jq-ac-tag">${item.tag}</span>
            </div>`
        ).join('');
        const rect = jqQueryInput.getBoundingClientRect();
        acDropdown.style.cssText = `display:block; left:${rect.left}px; top:${rect.bottom}px; width:${Math.max(rect.width, 300)}px;`;
        acDropdown.querySelectorAll('.jq-ac-item').forEach(el => {
            el.addEventListener('mousedown', (e) => { e.preventDefault(); applyAcItem(el.dataset.value); });
        });
    }

    function hideAcDropdown() {
        if (acDropdown) acDropdown.style.display = 'none'; acActive = -1;
    }

    function applyAcItem(value) {
        jqQueryInput.value = jqQueryInput.value.replace(/(\S*)$/, value);
        hideAcDropdown(); jqQueryInput.focus();
    }

    jqQueryInput.addEventListener('input', () => {
        const items = getAcItems(jqQueryInput.value);
        if (items.length) showAcDropdown(items); else hideAcDropdown();
    });
    jqQueryInput.addEventListener('keydown', (e) => {
        if (!acDropdownVisible()) return;
        const rows = acDropdown.querySelectorAll('.jq-ac-item');
        if (e.key === 'ArrowDown') { e.preventDefault(); acActive = Math.min(acActive + 1, rows.length - 1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); acActive = Math.max(acActive - 1, 0); }
        else if ((e.key === 'Tab' || e.key === 'Enter') && acActive >= 0) { e.preventDefault(); applyAcItem(rows[acActive].dataset.value); return; }
        else if (e.key === 'Escape') { hideAcDropdown(); return; }
        else return;
        rows.forEach((r, i) => r.classList.toggle('active', i === acActive));
        if (acActive >= 0) rows[acActive].scrollIntoView({ block: 'nearest' });
    });
    document.addEventListener('click', (e) => { if (e.target !== jqQueryInput) hideAcDropdown(); });

    // ══ DIFF TAB ══════════════════════════════════════════════════════════════

    const SAMPLE_B = `name: JSON Editor Kalam
version: 2.0.0
features:
  - editor
  - jq query
  - diff
  - export
browsers:
  - Chrome
  - Firefox
settings:
  theme: light
  minimap: true
  autosave: false
pi: 3.14159
active: false
`;

    const diffEditorA = monaco.editor.create(document.getElementById('diff-editor-a'), {
        value: INIT_YAML, language: 'yaml', theme: 'vs-dark',
        automaticLayout: true, minimap: { enabled: false }
    });
    const diffEditorB = monaco.editor.create(document.getElementById('diff-editor-b'), {
        value: SAMPLE_B, language: 'yaml', theme: 'vs-dark',
        automaticLayout: true, minimap: { enabled: false }
    });

    function attachFileLoader(inputId, editor) {
        document.getElementById(inputId).addEventListener('change', (e) => {
            const f = e.target.files[0]; if (!f) return;
            const r = new FileReader();
            r.onload = (ev) => {
                const txt = ev.target.result;
                try { editor.setValue(toYaml(JSON.parse(txt))); } catch (_) { editor.setValue(txt); }
            };
            r.readAsText(f);
        });
    }
    attachFileLoader('diff-file-a', diffEditorA);
    attachFileLoader('diff-file-b', diffEditorB);

    document.getElementById('diff-use-editor-btn').addEventListener('click', () =>
        diffEditorA.setValue(mainEditor.getValue()));

    // ── semantic diff ─────────────────────────────────────────────────────────

    document.getElementById('diff-semantic-btn').addEventListener('click', () => {
        const status = document.getElementById('diff-status');
        document.getElementById('monaco-diff-container').style.display = 'none';
        document.getElementById('diff-results').style.display = '';

        const rA = parseYamlOrJson(diffEditorA.getValue());
        const rB = parseYamlOrJson(diffEditorB.getValue());
        if (!rA.ok) { status.textContent = 'YAML A error: ' + rA.error; return; }
        if (!rB.ok) { status.textContent = 'YAML B error: ' + rB.error; return; }

        const diffs = DeepDiff.diff(rA.data, rB.data) || [];
        const container = document.getElementById('diff-results');
        if (!diffs.length) {
            container.innerHTML = '<p class="text-success p-3">✓ No differences — semantically identical.</p>';
            status.textContent = ''; return;
        }

        const kindLabel = { N:'Added', D:'Deleted', E:'Edited', A:'Array' };
        const kindDesc  = { N:'New key/value added', D:'Key/value deleted', E:'Value changed', A:'Array element changed' };

        const rows = diffs.map(d => {
            const path = (d.path || []).join('.');
            const kind = d.kind;
            let lhs = '', rhs = '';
            if      (kind === 'E') { lhs = JSON.stringify(d.lhs); rhs = JSON.stringify(d.rhs); }
            else if (kind === 'N') { rhs = JSON.stringify(d.rhs); }
            else if (kind === 'D') { lhs = JSON.stringify(d.lhs); }
            else if (kind === 'A') {
                const idx = d.index, item = d.item;
                lhs = item.kind === 'D' ? JSON.stringify(item.lhs) : '';
                rhs = item.kind === 'N' ? JSON.stringify(item.rhs) : '';
                return `<tr class="diff-kind-${kind}"><td><span class="badge-${kind}">${kindLabel[kind]}</span></td>
                    <td>${escHtml(path)}[${idx}]</td><td>${escHtml(lhs)}</td><td>${escHtml(rhs)}</td>
                    <td>${kindDesc[kind]}</td></tr>`;
            }
            return `<tr class="diff-kind-${kind}"><td><span class="badge-${kind}">${kindLabel[kind]}</span></td>
                <td>${escHtml(path)}</td><td>${escHtml(lhs)}</td><td>${escHtml(rhs)}</td>
                <td>${kindDesc[kind]}</td></tr>`;
        }).join('');

        container.innerHTML = `<p class="text-warning p-2 mb-0">Found <strong>${diffs.length}</strong> semantic difference(s)</p>
            <table class="diff-table">
              <thead><tr><th>Type</th><th>Path</th><th>A (original)</th><th>B (modified)</th><th>Description</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>`;
        status.textContent = `${diffs.length} difference(s)`;
    });

    // ── verbatim diff (Monaco diff editor) ───────────────────────────────────

    let monacoDiffEditor = null;
    const diffContainerEl = document.getElementById('monaco-diff-container');

    function relayoutDiffEditor() {
        if (!monacoDiffEditor) return;
        const { offsetWidth: w, offsetHeight: h } = diffContainerEl;
        if (w > 0 && h > 0) monacoDiffEditor.layout({ width: w, height: h });
    }
    new ResizeObserver(() => relayoutDiffEditor()).observe(diffContainerEl);

    document.getElementById('diff-verbatim-btn').addEventListener('click', () => {
        const status    = document.getElementById('diff-status');
        document.getElementById('diff-results').style.display = 'none';
        diffContainerEl.style.display = 'block';

        const textA = diffEditorA.getValue();
        const textB = diffEditorB.getValue();

        if (monacoDiffEditor) {
            monacoDiffEditor.getModel().original.setValue(textA);
            monacoDiffEditor.getModel().modified.setValue(textB);
            relayoutDiffEditor();
        } else {
            requestAnimationFrame(() => {
                monacoDiffEditor = monaco.editor.createDiffEditor(diffContainerEl, {
                    theme: 'vs-dark', automaticLayout: false,
                    readOnly: true, renderSideBySide: true,
                    minimap: { enabled: false }, scrollBeyondLastLine: false
                });
                monacoDiffEditor.setModel({
                    original: monaco.editor.createModel(textA, 'yaml'),
                    modified: monaco.editor.createModel(textB, 'yaml')
                });
                monacoDiffEditor.onDidUpdateDiff(() => {
                    const changes = monacoDiffEditor.getLineChanges() || [];
                    status.textContent = `${changes.length} changed region(s)`;
                });
                relayoutDiffEditor();
            });
        }
    });

    // ── diff tab relayout on tab-show ─────────────────────────────────────────

    document.getElementById('diff-tab-nav').addEventListener('shown.bs.tab', () => {
        diffEditorA.layout(); diffEditorB.layout(); relayoutDiffEditor();
    });

    // ── diff vertical splitter (A | B) ────────────────────────────────────────

    (function () {
        const row    = document.getElementById('diff-inputs-row');
        const colA   = document.getElementById('diff-col-a');
        const colB   = document.getElementById('diff-col-b');
        const gutter = document.getElementById('diff-gutter');
        const GUTTER_W = 8;
        let dragging = false, startX = 0, startAW = 0;

        gutter.addEventListener('pointerdown', (e) => {
            e.preventDefault(); dragging = true;
            startX = e.clientX; startAW = colA.getBoundingClientRect().width;
            gutter.classList.add('dragging'); gutter.setPointerCapture(e.pointerId);
        });
        gutter.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            const total = row.getBoundingClientRect().width - GUTTER_W;
            const newW = Math.min(Math.max(startAW + (e.clientX - startX), total * .1), total * .9);
            colA.style.flex = `0 0 ${newW}px`; colB.style.flex = `0 0 ${total - newW}px`;
            diffEditorA.layout(); diffEditorB.layout();
            relayoutDiffEditor();
        });
        gutter.addEventListener('pointerup',          () => { dragging = false; gutter.classList.remove('dragging'); });
        gutter.addEventListener('lostpointercapture', () => { dragging = false; gutter.classList.remove('dragging'); });
    }());

    // ── diff horizontal splitter (editors ↕ results) ─────────────────────────

    (function () {
        const pane    = document.getElementById('diff-pane');
        const topRow  = document.getElementById('diff-inputs-row');
        const hGutter = document.getElementById('diff-h-gutter');
        const GUTTER_H = 8;
        let dragging = false, startY = 0, startTopH = 0;

        hGutter.addEventListener('pointerdown', (e) => {
            e.preventDefault(); dragging = true;
            startY = e.clientY; startTopH = topRow.getBoundingClientRect().height;
            hGutter.classList.add('dragging'); hGutter.setPointerCapture(e.pointerId);
        });
        hGutter.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            const paneH = pane.getBoundingClientRect().height;
            const total = paneH - GUTTER_H;
            const newH  = Math.min(Math.max(startTopH + (e.clientY - startY), total * .1), total * .85);
            topRow.style.flex = `0 0 ${newH}px`;
            diffEditorA.layout(); diffEditorB.layout();
            relayoutDiffEditor();
        });
        hGutter.addEventListener('pointerup',          () => { dragging = false; hGutter.classList.remove('dragging'); });
        hGutter.addEventListener('lostpointercapture', () => { dragging = false; hGutter.classList.remove('dragging'); });
    }());

});
