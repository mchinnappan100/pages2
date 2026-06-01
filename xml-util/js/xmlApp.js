// xmlApp.js — XML Editor, XPath Query, jq Query, XML Diff
// mohan chinnappan

// ─── helpers ──────────────────────────────────────────────────────────────────

function escHtml(s) {
    return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── XML helpers — 100% native browser APIs, no fxparser ──────────────────────

const _domParser  = new DOMParser();
const _serializer = new XMLSerializer();

// Parse XML text → {ok, doc, error}
function parseXmlDoc(text) {
    const doc = _domParser.parseFromString(text, 'application/xml');
    const err = doc.querySelector('parsererror');
    if (err) return { ok: false, error: err.textContent.trim().split('\n')[0] };
    return { ok: true, doc };
}

// Parse XML → plain JS object (recursive, for deep-diff and jq)
function xmlDocToObj(node) {
    if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.CDATA_SECTION_NODE) {
        const t = node.textContent.trim();
        return t === '' ? null : t;
    }
    if (node.nodeType === Node.COMMENT_NODE) return null;
    if (node.nodeType === Node.DOCUMENT_NODE) return xmlDocToObj(node.documentElement);

    const obj = {};
    // attributes
    if (node.attributes) {
        for (const attr of node.attributes) obj[`@_${attr.name}`] = attr.value;
    }
    // children
    for (const child of node.childNodes) {
        if (child.nodeType === Node.COMMENT_NODE) continue;
        if (child.nodeType === Node.TEXT_NODE || child.nodeType === Node.CDATA_SECTION_NODE) {
            const t = child.textContent.trim();
            if (t) obj['#text'] = (obj['#text'] ?? '') + t;
            continue;
        }
        if (child.nodeType !== Node.ELEMENT_NODE) continue;
        const name = child.nodeName;
        const val  = xmlDocToObj(child);
        if (obj[name] === undefined) {
            obj[name] = val;
        } else if (Array.isArray(obj[name])) {
            obj[name].push(val);
        } else {
            obj[name] = [obj[name], val];
        }
    }
    // collapse text-only nodes
    const keys = Object.keys(obj);
    if (keys.length === 1 && keys[0] === '#text') return obj['#text'];
    return obj;
}

function parseXml(text) {
    const r = parseXmlDoc(text);
    if (!r.ok) return { ok: false, error: r.error };
    return { ok: true, data: xmlDocToObj(r.doc) };
}

function xmlToJsonStr(text) {
    const r = parseXml(text);
    return r.ok ? JSON.stringify(r.data, null, 2) : null;
}

// JSON object → XML via a simple recursive builder (for JSON→XML button)
function jsonToXml(obj, rootTag = 'root', indent = '') {
    if (typeof obj !== 'object' || obj === null) return `${indent}<${rootTag}>${escHtml(String(obj))}</${rootTag}>\n`;
    let attrs = '', children = '';
    for (const [k, v] of Object.entries(obj)) {
        if (k.startsWith('@_')) { attrs += ` ${k.slice(2)}="${escHtml(String(v))}"`; continue; }
        if (k === '#text') { children += escHtml(String(v)); continue; }
        const items = Array.isArray(v) ? v : [v];
        for (const item of items) {
            if (typeof item === 'object' && item !== null) {
                children += jsonToXml(item, k, indent + '  ');
            } else {
                children += `${indent}  <${k}>${escHtml(String(item ?? ''))}</${k}>\n`;
            }
        }
    }
    const hasNested = children.includes('\n');
    if (!children) return `${indent}<${rootTag}${attrs}/>\n`;
    if (hasNested)  return `${indent}<${rootTag}${attrs}>\n${children}${indent}</${rootTag}>\n`;
    return `${indent}<${rootTag}${attrs}>${children}</${rootTag}>\n`;
}

// Pretty-print XML using the browser's XSLT indent trick
function prettyXml(text) {
    const r = parseXmlDoc(text);
    if (!r.ok) return text;
    // XSLTProcessor for indent
    const xslt = _domParser.parseFromString(
        `<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
           <xsl:output method="xml" indent="yes" omit-xml-declaration="no"/>
           <xsl:template match="@*|node()">
             <xsl:copy><xsl:apply-templates select="@*|node()"/></xsl:copy>
           </xsl:template>
         </xsl:stylesheet>`, 'application/xml');
    try {
        const proc = new XSLTProcessor();
        proc.importStylesheet(xslt);
        const result = proc.transformToDocument(r.doc);
        return _serializer.serializeToString(result);
    } catch (_) {
        // fallback: re-serialise without indent
        return _serializer.serializeToString(r.doc);
    }
}

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

// ─── XPath evaluation (browser's native DOMParser + XPathEvaluator) ───────────

function evalXPath(xmlText, expr) {
    const domParser = new DOMParser();
    const doc = domParser.parseFromString(xmlText, 'application/xml');
    const parseErr = doc.querySelector('parsererror');
    if (parseErr) return { ok: false, error: parseErr.textContent.trim().split('\n')[0] };

    try {
        const result = doc.evaluate(expr, doc, null, XPathResult.ANY_TYPE, null);
        const nodes = [];
        const serializer = new XMLSerializer();

        switch (result.resultType) {
            case XPathResult.NUMBER_TYPE:
                return { ok: true, text: String(result.numberValue) };
            case XPathResult.STRING_TYPE:
                return { ok: true, text: result.stringValue };
            case XPathResult.BOOLEAN_TYPE:
                return { ok: true, text: String(result.booleanValue) };
            default: {
                let node;
                while ((node = result.iterateNext())) {
                    if (node.nodeType === Node.ATTRIBUTE_NODE) {
                        nodes.push(`${node.name}="${escHtml(node.value)}"`);
                    } else if (node.nodeType === Node.TEXT_NODE) {
                        const t = node.textContent.trim();
                        if (t) nodes.push(t);
                    } else {
                        nodes.push(serializer.serializeToString(node));
                    }
                }
                if (!nodes.length) return { ok: true, text: '<!-- no matching nodes -->' };
                return { ok: true, text: nodes.join('\n\n') };
            }
        }
    } catch (e) {
        return { ok: false, error: e.message };
    }
}

// ─── DOM-based tree renderer ──────────────────────────────────────────────────

function renderXmlTree(xmlText, container) {
    container.innerHTML = '';
    const domParser = new DOMParser();
    const doc = domParser.parseFromString(xmlText, 'application/xml');
    const parseErr = doc.querySelector('parsererror');
    if (parseErr) {
        container.innerHTML = `<span style="color:#f44336">Parse error: ${escHtml(parseErr.textContent.trim().split('\n')[0])}</span>`;
        return;
    }
    container.appendChild(buildDomNode(doc.documentElement));
}

function buildDomNode(node) {
    const wrap = document.createElement('div');
    wrap.className = 'xt-node';

    if (node.nodeType === Node.TEXT_NODE) {
        const t = node.textContent.trim();
        if (!t) return document.createTextNode('');
        const s = document.createElement('span');
        s.className = 'xt-text'; s.textContent = t;
        wrap.appendChild(s);
        return wrap;
    }
    if (node.nodeType === Node.COMMENT_NODE) {
        const s = document.createElement('span');
        s.className = 'xt-comment'; s.textContent = `<!-- ${node.textContent.trim()} -->`;
        wrap.appendChild(s); return wrap;
    }
    if (node.nodeType === Node.CDATA_SECTION_NODE) {
        const s = document.createElement('span');
        s.className = 'xt-cdata'; s.textContent = `<![CDATA[${node.textContent}]]>`;
        wrap.appendChild(s); return wrap;
    }

    const hasChildren = [...node.childNodes].some(n =>
        n.nodeType === Node.ELEMENT_NODE ||
        (n.nodeType === Node.TEXT_NODE && n.textContent.trim()) ||
        n.nodeType === Node.COMMENT_NODE
    );

    // opening tag line
    const tagLine = document.createElement('span');

    if (hasChildren) {
        const toggle = document.createElement('span');
        toggle.className = 'xt-toggle'; toggle.textContent = '▾';
        tagLine.appendChild(toggle);

        const children = document.createElement('div');
        children.className = 'xt-children';
        for (const child of node.childNodes) {
            const cn = buildDomNode(child);
            if (cn && cn.textContent !== '') children.appendChild(cn);
        }
        wrap.appendChild(children);   // append before so toggle can ref it

        toggle.addEventListener('click', () => {
            const collapsed = children.classList.toggle('collapsed');
            toggle.textContent = collapsed ? '▸' : '▾';
        });
    } else {
        tagLine.appendChild(document.createTextNode(' '));
    }

    const tagSpan = document.createElement('span');
    tagSpan.className = 'xt-tag';
    tagSpan.textContent = `<${node.nodeName}`;
    tagLine.prepend(tagSpan);           // tag name before toggle

    // attributes
    if (node.attributes && node.attributes.length) {
        const attrSpan = document.createElement('span');
        attrSpan.className = 'xt-attrs';
        const parts = [...node.attributes].map(a =>
            ` <span class="xt-attr-key">${escHtml(a.name)}</span>=<span class="xt-attr-val">"${escHtml(a.value)}"</span>`
        ).join('');
        attrSpan.innerHTML = parts;
        tagLine.appendChild(attrSpan);
    }

    const closeAngle = document.createElement('span');
    closeAngle.className = 'xt-tag';
    closeAngle.textContent = hasChildren ? '>' : ' />';
    tagLine.appendChild(closeAngle);

    // insert tagLine at the TOP of wrap
    wrap.insertBefore(tagLine, wrap.firstChild);

    if (hasChildren) {
        const closingTag = document.createElement('div');
        closingTag.className = 'xt-node';
        const c = document.createElement('span');
        c.className = 'xt-tag'; c.textContent = `</${node.nodeName}>`;
        closingTag.appendChild(c);
        wrap.appendChild(closingTag);
    }

    return wrap;
}

// ─── Monaco setup ─────────────────────────────────────────────────────────────

require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor/min/vs' } });

require(['vs/editor/editor.main'], function () {

    const INIT_XML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="bk101" genre="Computer">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide</title>
    <price>44.95</price>
    <publish_date>2000-10-01</publish_date>
    <description>An in-depth look at creating applications with XML.</description>
  </book>
  <book id="bk102" genre="Fantasy">
    <author>Ralls, Kim</author>
    <title>Midnight Rain</title>
    <price>5.95</price>
    <publish_date>2000-12-16</publish_date>
    <description>A former architect battles corporate zombies.</description>
  </book>
  <book id="bk103" genre="Romance">
    <author>Corets, Eva</author>
    <title>Maeve Ascendant</title>
    <price>5.95</price>
    <publish_date>2000-11-17</publish_date>
    <description>After the collapse of a nanotechnology society the young survivors lay the foundation for a new society.</description>
  </book>
</catalog>`;

    // ══ EDITOR TAB ═══════════════════════════════════════════════════════════

    const mainEditor = monaco.editor.create(document.getElementById('editor-xml'), {
        value: INIT_XML, language: 'xml', theme: 'vs-dark',
        automaticLayout: true, minimap: { enabled: false },
        wordWrap: 'on', scrollBeyondLastLine: false
    });

    const treePane    = document.getElementById('xml-tree');
    const parseStatus = document.getElementById('parse-status');

    function refreshTree() {
        const xml = mainEditor.getValue();
        const domParser = new DOMParser();
        const doc = domParser.parseFromString(xml, 'application/xml');
        const err = doc.querySelector('parsererror');
        if (err) {
            parseStatus.className = 'parse-status parse-err';
            parseStatus.textContent = '✗ ' + err.textContent.trim().split('\n')[0];
            treePane.innerHTML = `<span class="parse-err">${escHtml(err.textContent.trim().split('\n')[0])}</span>`;
        } else {
            parseStatus.className = 'parse-status parse-ok';
            parseStatus.textContent = '✓ Valid';
            renderXmlTree(xml, treePane);
        }
    }

    refreshTree();
    mainEditor.onDidChangeModelContent(() => refreshTree());

    // ── toolbar buttons ────────────────────────────────────────────────────

    function download(content, filename, mime) {
        const a = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(new Blob([content], { type: mime })),
            download: filename
        });
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }

    document.getElementById('download-xml-btn').addEventListener('click', () =>
        download(mainEditor.getValue(), 'output.xml', 'application/xml'));

    document.getElementById('download-json-btn').addEventListener('click', () => {
        const json = xmlToJsonStr(mainEditor.getValue());
        if (json) download(json, 'output.json', 'application/json');
        else alert('XML parse error — fix the source first.');
    });

    document.getElementById('format-btn').addEventListener('click', () => {
        const formatted = prettyXml(mainEditor.getValue());
        mainEditor.setValue(formatted);
    });

    document.getElementById('json2xml-btn').addEventListener('click', () => {
        try {
            const obj = JSON.parse(mainEditor.getValue());
            mainEditor.setValue(jsonToXml(obj));
        } catch (e) {
            alert('Not valid JSON: ' + e.message);
        }
    });

    // ── file drop / input ──────────────────────────────────────────────────

    function loadIntoMain(text) {
        // if it looks like JSON, convert to XML first
        try { mainEditor.setValue(jsonToXml(JSON.parse(text))); } catch (_) { mainEditor.setValue(text); }
    }

    document.getElementById('xmlFileInput').addEventListener('change', (e) => {
        const f = e.target.files[0]; if (!f) return;
        const fr = new FileReader();
        fr.onload = (ev) => loadIntoMain(ev.target.result);
        fr.readAsText(f);
    });

    const dropArea = document.getElementById('dropArea');
    dropArea.addEventListener('dragenter', e => e.preventDefault(), false);
    dropArea.addEventListener('dragover',  e => e.preventDefault(), false);
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0]; if (!f) return;
        const fr = new FileReader();
        fr.onload = (ev) => loadIntoMain(ev.target.result);
        fr.readAsText(f);
    }, false);

    // ── editor-tab vertical splitter ──────────────────────────────────────

    (function () {
        const container = document.querySelector('.editor-container');
        const colA = document.getElementById('xml-monaco-col');
        const colB = document.getElementById('xml-tree-col');
        const gutter = document.getElementById('editor-gutter');
        let dragging = false, startX = 0, startAW = 0;
        gutter.addEventListener('pointerdown', (e) => {
            e.preventDefault(); dragging = true; startX = e.clientX;
            startAW = colA.getBoundingClientRect().width;
            gutter.classList.add('dragging'); gutter.setPointerCapture(e.pointerId);
        });
        gutter.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            const total = container.getBoundingClientRect().width - 8;
            const newW = Math.min(Math.max(startAW + (e.clientX - startX), total * .1), total * .9);
            colA.style.flex = `0 0 ${newW}px`; colB.style.flex = `0 0 ${total - newW}px`;
            mainEditor.layout();
        });
        gutter.addEventListener('pointerup',          () => { dragging = false; gutter.classList.remove('dragging'); });
        gutter.addEventListener('lostpointercapture', () => { dragging = false; gutter.classList.remove('dragging'); });
    }());

    // ══ XPath TAB ═════════════════════════════════════════════════════════════

    const xpathInputEditor = monaco.editor.create(document.getElementById('xpath-input-editor'), {
        value: INIT_XML, language: 'xml', theme: 'vs-dark',
        automaticLayout: true, minimap: { enabled: false }, wordWrap: 'on'
    });
    const xpathOutputEditor = monaco.editor.create(document.getElementById('xpath-output-editor'), {
        value: '', language: 'xml', theme: 'vs-dark',
        automaticLayout: true, readOnly: true, minimap: { enabled: false }
    });

    function runXPath() {
        const expr = document.getElementById('xpath-input').value.trim() || '//*';
        const xml  = xpathInputEditor.getValue();
        const r = evalXPath(xml, expr);
        xpathOutputEditor.setValue(r.ok ? r.text : `<!-- XPath error: ${r.error} -->`);
    }

    document.getElementById('xpath-run-btn').addEventListener('click', runXPath);
    document.getElementById('xpath-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !xpathAcVisible()) { e.preventDefault(); runXPath(); }
    });
    document.getElementById('xpath-use-editor-btn').addEventListener('click', () =>
        xpathInputEditor.setValue(mainEditor.getValue()));
    document.getElementById('xpath-tab').addEventListener('shown.bs.tab', () => {
        xpathInputEditor.setValue(mainEditor.getValue());
        xpathInputEditor.layout(); xpathOutputEditor.layout();
        rebuildXpathAc();
    });

    // XPath autocomplete
    let xpathAcPaths = [], xpathAcActive = -1, xpathAcDropdown = null;

    const XPATH_BUILTINS = [
        { expr: '//*',                         desc: 'All elements in document',              tag: 'select' },
        { expr: '//element',                   desc: 'All <element> nodes anywhere',          tag: 'select' },
        { expr: '/root/child',                 desc: 'Direct child path',                     tag: 'select' },
        { expr: '//book[@id]',                 desc: 'Elements with specific attribute',      tag: 'attr' },
        { expr: '//book[@id="bk101"]',         desc: 'Element with attribute value',          tag: 'attr' },
        { expr: '//@id',                        desc: 'All id attributes',                     tag: 'attr' },
        { expr: '//price[. > 10]',             desc: 'Elements with text value > 10',         tag: 'pred' },
        { expr: '//book[price > 10]',          desc: 'Parent with child value condition',     tag: 'pred' },
        { expr: '//book[last()]',              desc: 'Last book element',                     tag: 'pred' },
        { expr: '//book[1]',                   desc: 'First book element',                    tag: 'pred' },
        { expr: '//book[position() < 3]',      desc: 'First two books',                       tag: 'pred' },
        { expr: '//title[contains(., "XML")]', desc: 'Title containing text',                 tag: 'pred' },
        { expr: '//title[starts-with(., "X")]',desc: 'Title starting with character',        tag: 'pred' },
        { expr: '//book/title',                desc: 'All title children of book',            tag: 'nav' },
        { expr: '//book/title/text()',         desc: 'Text content of title nodes',           tag: 'nav' },
        { expr: '//book/..',                   desc: 'Parent of book elements',               tag: 'nav' },
        { expr: '//book/following-sibling::*', desc: 'Following siblings',                   tag: 'nav' },
        { expr: '//book/preceding-sibling::*', desc: 'Preceding siblings',                   tag: 'nav' },
        { expr: '//book/ancestor::*',          desc: 'All ancestors of book',                tag: 'nav' },
        { expr: '//book/descendant::*',        desc: 'All descendants of book',              tag: 'nav' },
        { expr: 'count(//book)',               desc: 'Count matching elements',               tag: 'fn' },
        { expr: 'sum(//price)',                desc: 'Sum of all price values',               tag: 'fn' },
        { expr: 'string(//title[1])',          desc: 'String value of first title',           tag: 'fn' },
        { expr: 'normalize-space(//title[1])', desc: 'Whitespace-normalised text',            tag: 'fn' },
        { expr: 'concat(//author, " - ", //title)', desc: 'Concatenate values',              tag: 'fn' },
        { expr: 'substring(//title,1,5)',      desc: 'Substring of text value',               tag: 'fn' },
        { expr: 'string-length(//title)',      desc: 'Length of text value',                  tag: 'fn' },
        { expr: 'translate(//title,"abc","ABC")', desc: 'Character translation',              tag: 'fn' },
        { expr: 'not(//book[@genre="Horror"])', desc: 'Boolean negation of expression',      tag: 'fn' },
        { expr: 'name(//*[1])',                desc: 'Tag name of first element',             tag: 'fn' },
        { expr: 'local-name(//*[1])',          desc: 'Local name (without namespace)',        tag: 'fn' },
        { expr: 'namespace-uri(//*[1])',       desc: 'Namespace URI of element',             tag: 'fn' },
        { expr: '//*[text()]',                 desc: 'All elements with text content',       tag: 'misc' },
        { expr: '//*[@*]',                     desc: 'All elements with any attribute',      tag: 'misc' },
        { expr: '//comment()',                 desc: 'All comment nodes',                    tag: 'misc' },
        { expr: '//processing-instruction()',  desc: 'All processing instructions',          tag: 'misc' },
        { expr: '//book | //author',           desc: 'Union of two node sets',               tag: 'misc' },
        { expr: '/catalog/book[genre="Computer" or genre="Fantasy"]', desc: 'OR condition', tag: 'pred' },
        { expr: '/catalog/book[price > 5 and price < 10]',            desc: 'AND condition', tag: 'pred' },
    ];

    const XPATH_TAG_ORDER = [
        ['select','Select Elements'], ['attr','Attributes'], ['pred','Predicates / Filtering'],
        ['nav','Navigation Axes'], ['fn','Functions'], ['misc','Miscellaneous'],
    ];

    function rebuildXpathAc() {
        const { ok, data } = parseXml(xpathInputEditor.getValue());
        xpathAcPaths = ok ? [...extractPaths(data)].map(p => '//' + p.replace(/^\./,'').replace(/\./g,'/')) : [];
    }
    rebuildXpathAc();
    xpathInputEditor.onDidChangeModelContent(() => rebuildXpathAc());

    function xpathAcVisible() { return xpathAcDropdown && xpathAcDropdown.style.display !== 'none'; }

    function getXpathAcItems(text) {
        const token = text.match(/(\S*)$/)?.[1] ?? '';
        if (!token) return [];
        const lower = token.toLowerCase();
        const builtins = XPATH_BUILTINS.filter(b => b.expr.toLowerCase().startsWith(lower))
            .slice(0, 12).map(b => ({ label: b.expr, tag: b.tag }));
        return builtins.slice(0, 14);
    }

    buildAcDropdown(
        document.getElementById('xpath-input'),
        () => xpathAcDropdown,
        (d) => { xpathAcDropdown = d; },
        () => xpathAcActive,
        (v) => { xpathAcActive = v; },
        getXpathAcItems,
        () => xpathAcVisible()
    );

    // ── XPath help drawer ────────────────────────────────────────────────────

    buildHelpDrawer({
        overlayId: 'xpath-help-overlay', drawerId: 'xpath-help-drawer',
        searchId: 'xpath-help-search', bodyId: 'xpath-help-body',
        btnId: 'xpath-help-btn', closeId: 'xpath-help-close',
        inputId: 'xpath-input',
        items: XPATH_BUILTINS, tagOrder: XPATH_TAG_ORDER,
        exprField: 'expr'
    });

    // ══ jq TAB ════════════════════════════════════════════════════════════════

    const jqInputEditor = monaco.editor.create(document.getElementById('jq-input-editor'), {
        value: INIT_XML, language: 'xml', theme: 'vs-dark',
        automaticLayout: true, minimap: { enabled: false }, wordWrap: 'on'
    });
    const jqOutputEditor = monaco.editor.create(document.getElementById('jq-output-editor'), {
        value: '', language: 'json', theme: 'vs-dark',
        automaticLayout: true, readOnly: true, minimap: { enabled: false }
    });

    let jqPromise = null;
    function loadJq() {
        if (!jqPromise) jqPromise = new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/jq-web@0.5.1/jq.wasm.min.js';
            s.onload = () => resolve(window.jq);
            s.onerror = () => reject(new Error('Failed to load jq-web'));
            document.head.appendChild(s);
        });
        return jqPromise;
    }

    async function runJqQuery() {
        const query = document.getElementById('jq-query-input').value.trim() || '.';
        jqOutputEditor.setValue('// Running…');
        const r = parseXml(jqInputEditor.getValue());
        if (!r.ok) { jqOutputEditor.setValue(`// XML parse error: ${r.error}`); return; }
        try {
            const jqLib = await loadJq();
            const result = await jqLib.promised.json(r.data, query);
            jqOutputEditor.setValue(JSON.stringify(result, null, 2));
        } catch (e) { jqOutputEditor.setValue(`// jq error: ${e.message || e}`); }
    }

    document.getElementById('jq-run-btn').addEventListener('click', runJqQuery);
    document.getElementById('jq-query-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !jqAcVisible()) { e.preventDefault(); runJqQuery(); }
    });
    document.getElementById('jq-use-editor-btn').addEventListener('click', () =>
        jqInputEditor.setValue(mainEditor.getValue()));
    document.getElementById('jq-tab').addEventListener('shown.bs.tab', () => {
        jqInputEditor.setValue(mainEditor.getValue());
        jqInputEditor.layout(); jqOutputEditor.layout();
        rebuildJqAc();
    });

    // jq autocomplete
    let jqAcPaths = [], jqAcActive = -1, jqAcDropdown = null;

    const JQ_BUILTINS = [
        { filter: '.',                        desc: 'Identity',                           tag: 'basic' },
        { filter: '.root',                    desc: 'Top-level key',                      tag: 'field' },
        { filter: '.[]',                      desc: 'Iterate values',                     tag: 'iter' },
        { filter: '.[0]',                     desc: 'Array index',                        tag: 'array' },
        { filter: 'keys',                     desc: 'Object keys',                        tag: 'type' },
        { filter: 'values',                   desc: 'Object values',                      tag: 'type' },
        { filter: 'length',                   desc: 'Count elements',                     tag: 'type' },
        { filter: 'type',                     desc: 'Value type',                         tag: 'type' },
        { filter: 'has("key")',               desc: 'Has key?',                           tag: 'test' },
        { filter: 'select(.price > 10)',      desc: 'Filter by condition',                tag: 'filter' },
        { filter: 'map(.title)',              desc: 'Pluck field from array',             tag: 'array' },
        { filter: 'map(select(. != null))',   desc: 'Remove nulls',                       tag: 'array' },
        { filter: 'to_entries',               desc: 'Object → [{key,value}]',             tag: 'convert' },
        { filter: 'from_entries',             desc: '[{key,value}] → object',             tag: 'convert' },
        { filter: '..',                       desc: 'Recursive descent',                  tag: 'recurse' },
        { filter: '.. | strings',            desc: 'All string values',                  tag: 'recurse' },
        { filter: '.. | numbers',            desc: 'All numeric values',                 tag: 'recurse' },
        { filter: 'paths(scalars)',          desc: 'All leaf paths',                     tag: 'path' },
        { filter: '[.. | .["#text"]? | select(. != null)]', desc: 'All text node values', tag: 'recipe' },
        { filter: '[.. | .["@_id"]? | select(. != null)]',  desc: 'All @id attr values',  tag: 'recipe' },
        { filter: 'add',                     desc: 'Sum array',                          tag: 'reduce' },
        { filter: 'unique_by(.title)',        desc: 'Unique by field',                   tag: 'reduce' },
        { filter: 'group_by(.genre)',         desc: 'Group by field',                    tag: 'reduce' },
        { filter: 'sort_by(.price)',          desc: 'Sort by field',                     tag: 'reduce' },
        { filter: 'min_by(.price)',           desc: 'Minimum by field',                  tag: 'reduce' },
        { filter: 'max_by(.price)',           desc: 'Maximum by field',                  tag: 'reduce' },
        { filter: 'del(.foo)',                desc: 'Delete key',                        tag: 'recipe' },
        { filter: 'if .x > 0 then "pos" else "neg" end', desc: 'Conditional',           tag: 'logic' },
        { filter: '.foo // "default"',        desc: 'Default if null',                   tag: 'logic' },
        { filter: 'try . catch "err"',        desc: 'Error handling',                    tag: 'logic' },
        { filter: '@base64',                  desc: 'Base64 encode',                     tag: 'format' },
        { filter: '@uri',                     desc: 'URI encode',                        tag: 'format' },
        { filter: '@csv',                     desc: 'Array to CSV',                      tag: 'format' },
        { filter: 'split(",")',               desc: 'Split string',                      tag: 'string' },
        { filter: 'join(",")',                desc: 'Join strings',                      tag: 'string' },
        { filter: 'test("regex")',            desc: 'Regex test',                        tag: 'string' },
        { filter: 'ascii_downcase',           desc: 'Lowercase',                         tag: 'string' },
        { filter: 'ascii_upcase',             desc: 'Uppercase',                         tag: 'string' },
    ];

    const JQ_TAG_ORDER = [
        ['recipe','Practical Recipes (XML)'], ['basic','Identity & Basic'],
        ['field','Field Access'], ['array','Arrays'], ['iter','Iteration'],
        ['type','Types & Inspection'], ['filter','Select & Filter'],
        ['recurse','Recursive Descent'], ['path','Paths'],
        ['string','Strings'], ['reduce','Reduce & Aggregation'],
        ['format','Format & Encode'], ['logic','Conditionals'],
        ['convert','Conversion'], ['test','Testing'],
    ];

    function rebuildJqAc() {
        const r = parseXml(jqInputEditor.getValue());
        jqAcPaths = r.ok ? [...extractPaths(r.data)] : [];
    }
    rebuildJqAc();
    jqInputEditor.onDidChangeModelContent(() => rebuildJqAc());

    function jqAcVisible() { return jqAcDropdown && jqAcDropdown.style.display !== 'none'; }

    function getJqAcItems(text) {
        const token = text.match(/(\S*)$/)?.[1] ?? '';
        if (!token) return [];
        const lower = token.toLowerCase();
        const paths   = jqAcPaths.filter(p => p.toLowerCase().includes(lower)).slice(0, 8).map(p => ({ label: p, tag: 'path' }));
        const builtins = JQ_BUILTINS.filter(b => b.filter.toLowerCase().startsWith(lower) && !paths.find(m => m.label === b.filter))
            .slice(0, 8).map(b => ({ label: b.filter, tag: b.tag }));
        return [...paths, ...builtins].slice(0, 14);
    }

    buildAcDropdown(
        document.getElementById('jq-query-input'),
        () => jqAcDropdown,
        (d) => { jqAcDropdown = d; },
        () => jqAcActive,
        (v) => { jqAcActive = v; },
        getJqAcItems,
        () => jqAcVisible()
    );

    buildHelpDrawer({
        overlayId: 'jq-help-overlay', drawerId: 'jq-help-drawer',
        searchId: 'jq-help-search', bodyId: 'jq-help-body',
        btnId: 'jq-help-btn', closeId: 'jq-help-close',
        inputId: 'jq-query-input',
        items: JQ_BUILTINS, tagOrder: JQ_TAG_ORDER,
        exprField: 'filter'
    });

    // ══ DIFF TAB ══════════════════════════════════════════════════════════════

    const SAMPLE_B = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="bk101" genre="Computer">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide — 2nd Edition</title>
    <price>49.95</price>
    <publish_date>2024-01-15</publish_date>
    <description>An updated in-depth look at creating applications with XML.</description>
  </book>
  <book id="bk102" genre="Fantasy">
    <author>Ralls, Kim</author>
    <title>Midnight Rain</title>
    <price>7.99</price>
    <publish_date>2000-12-16</publish_date>
    <description>A former architect battles corporate zombies, again.</description>
  </book>
</catalog>`;

    const diffEditorA = monaco.editor.create(document.getElementById('diff-editor-a'), {
        value: INIT_XML, language: 'xml', theme: 'vs-dark',
        automaticLayout: true, minimap: { enabled: false }
    });
    const diffEditorB = monaco.editor.create(document.getElementById('diff-editor-b'), {
        value: SAMPLE_B, language: 'xml', theme: 'vs-dark',
        automaticLayout: true, minimap: { enabled: false }
    });

    function attachFileLoader(inputId, editor) {
        document.getElementById(inputId).addEventListener('change', (e) => {
            const f = e.target.files[0]; if (!f) return;
            const fr = new FileReader();
            fr.onload = (ev) => {
                const txt = ev.target.result;
                try { editor.setValue(jsonToXml(JSON.parse(txt))); } catch (_) { editor.setValue(txt); }
            };
            fr.readAsText(f);
        });
    }
    attachFileLoader('diff-file-a', diffEditorA);
    attachFileLoader('diff-file-b', diffEditorB);

    document.getElementById('diff-use-editor-btn').addEventListener('click', () =>
        diffEditorA.setValue(mainEditor.getValue()));

    // semantic diff — parse both to JS objects, deep-diff
    document.getElementById('diff-semantic-btn').addEventListener('click', () => {
        const status = document.getElementById('diff-status');
        document.getElementById('monaco-diff-container').style.display = 'none';
        document.getElementById('diff-results').style.display = '';

        const rA = parseXml(diffEditorA.getValue());
        const rB = parseXml(diffEditorB.getValue());
        if (!rA.ok) { status.textContent = 'XML A error: ' + rA.error; return; }
        if (!rB.ok) { status.textContent = 'XML B error: ' + rB.error; return; }

        const diffs = DeepDiff.diff(rA.data, rB.data) || [];
        const container = document.getElementById('diff-results');
        if (!diffs.length) {
            container.innerHTML = '<p class="text-success p-3">✓ No differences — semantically identical.</p>';
            status.textContent = ''; return;
        }
        const kindLabel = { N:'Added', D:'Deleted', E:'Edited', A:'Array' };
        const kindDesc  = { N:'New node/attribute added', D:'Node/attribute deleted', E:'Value changed', A:'Array element changed' };
        const rows = diffs.map(d => {
            const path = (d.path || []).join('.');
            const kind = d.kind;
            let lhs = '', rhs = '';
            if      (kind === 'E') { lhs = JSON.stringify(d.lhs); rhs = JSON.stringify(d.rhs); }
            else if (kind === 'N') { rhs = JSON.stringify(d.rhs); }
            else if (kind === 'D') { lhs = JSON.stringify(d.lhs); }
            else if (kind === 'A') {
                const item = d.item;
                lhs = item.kind === 'D' ? JSON.stringify(item.lhs) : '';
                rhs = item.kind === 'N' ? JSON.stringify(item.rhs) : '';
                return `<tr class="diff-kind-${kind}"><td><span class="badge-${kind}">${kindLabel[kind]}</span></td>
                    <td>${escHtml(path)}[${d.index}]</td><td>${escHtml(lhs)}</td><td>${escHtml(rhs)}</td>
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

    // verbatim diff — Monaco diff editor on raw XML text
    let monacoDiffEditor = null;
    const diffContainerEl = document.getElementById('monaco-diff-container');

    function relayoutDiffEditor() {
        if (!monacoDiffEditor) return;
        const { offsetWidth: w, offsetHeight: h } = diffContainerEl;
        if (w > 0 && h > 0) monacoDiffEditor.layout({ width: w, height: h });
    }
    new ResizeObserver(() => relayoutDiffEditor()).observe(diffContainerEl);

    document.getElementById('diff-verbatim-btn').addEventListener('click', () => {
        const status = document.getElementById('diff-status');
        document.getElementById('diff-results').style.display = 'none';
        diffContainerEl.style.display = 'block';

        const textA = prettyXml(diffEditorA.getValue());
        const textB = prettyXml(diffEditorB.getValue());

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
                    original: monaco.editor.createModel(textA, 'xml'),
                    modified: monaco.editor.createModel(textB, 'xml')
                });
                monacoDiffEditor.onDidUpdateDiff(() => {
                    const changes = monacoDiffEditor.getLineChanges() || [];
                    status.textContent = `${changes.length} changed region(s)`;
                });
                relayoutDiffEditor();
            });
        }
    });

    document.getElementById('diff-tab-nav').addEventListener('shown.bs.tab', () => {
        diffEditorA.layout(); diffEditorB.layout(); relayoutDiffEditor();
    });

    // diff vertical splitter (A | B)
    (function () {
        const row = document.getElementById('diff-inputs-row');
        const colA = document.getElementById('diff-col-a');
        const colB = document.getElementById('diff-col-b');
        const gutter = document.getElementById('diff-gutter');
        let dragging = false, startX = 0, startAW = 0;
        gutter.addEventListener('pointerdown', (e) => {
            e.preventDefault(); dragging = true; startX = e.clientX;
            startAW = colA.getBoundingClientRect().width;
            gutter.classList.add('dragging'); gutter.setPointerCapture(e.pointerId);
        });
        gutter.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            const total = row.getBoundingClientRect().width - 8;
            const newW = Math.min(Math.max(startAW + (e.clientX - startX), total * .1), total * .9);
            colA.style.flex = `0 0 ${newW}px`; colB.style.flex = `0 0 ${total - newW}px`;
            diffEditorA.layout(); diffEditorB.layout(); relayoutDiffEditor();
        });
        gutter.addEventListener('pointerup',          () => { dragging = false; gutter.classList.remove('dragging'); });
        gutter.addEventListener('lostpointercapture', () => { dragging = false; gutter.classList.remove('dragging'); });
    }());

    // diff horizontal splitter (editors ↕ results)
    (function () {
        const pane = document.getElementById('diff-pane');
        const topRow = document.getElementById('diff-inputs-row');
        const hGutter = document.getElementById('diff-h-gutter');
        let dragging = false, startY = 0, startTopH = 0;
        hGutter.addEventListener('pointerdown', (e) => {
            e.preventDefault(); dragging = true; startY = e.clientY;
            startTopH = topRow.getBoundingClientRect().height;
            hGutter.classList.add('dragging'); hGutter.setPointerCapture(e.pointerId);
        });
        hGutter.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            const total = pane.getBoundingClientRect().height - 8;
            const newH = Math.min(Math.max(startTopH + (e.clientY - startY), total * .1), total * .85);
            topRow.style.flex = `0 0 ${newH}px`;
            diffEditorA.layout(); diffEditorB.layout(); relayoutDiffEditor();
        });
        hGutter.addEventListener('pointerup',          () => { dragging = false; hGutter.classList.remove('dragging'); });
        hGutter.addEventListener('lostpointercapture', () => { dragging = false; hGutter.classList.remove('dragging'); });
    }());

    // ══ SHARED UTILITIES ══════════════════════════════════════════════════════

    // Generic autocomplete wired to a text input
    function buildAcDropdown(inputEl, getDropdown, setDropdown, getActive, setActive, getItems, isVisible) {
        inputEl.addEventListener('input', () => {
            const items = getItems(inputEl.value);
            if (items.length) showAc(inputEl, getDropdown, setDropdown, setActive, items);
            else hideAc(getDropdown, setActive);
        });
        inputEl.addEventListener('keydown', (e) => {
            if (!isVisible()) return;
            const dropdown = getDropdown();
            const rows = dropdown ? dropdown.querySelectorAll('.ac-item') : [];
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(getActive() + 1, rows.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(getActive() - 1, 0)); }
            else if ((e.key === 'Tab' || e.key === 'Enter') && getActive() >= 0) {
                e.preventDefault(); applyAc(inputEl, rows[getActive()].dataset.value, getDropdown, setActive); return;
            } else if (e.key === 'Escape') { hideAc(getDropdown, setActive); return; }
            else return;
            rows.forEach((r, i) => r.classList.toggle('active', i === getActive()));
            if (getActive() >= 0) rows[getActive()].scrollIntoView({ block: 'nearest' });
        });
        document.addEventListener('click', (e) => { if (e.target !== inputEl) hideAc(getDropdown, setActive); });
    }

    function showAc(inputEl, getDropdown, setDropdown, setActive, items) {
        let dropdown = getDropdown();
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.className = 'ac-dropdown';
            document.body.appendChild(dropdown);
            setDropdown(dropdown);
        }
        setActive(-1);
        dropdown.innerHTML = items.map((item, i) =>
            `<div class="ac-item" data-idx="${i}" data-value="${escHtml(item.label)}">
                <span>${escHtml(item.label)}</span><span class="ac-tag">${item.tag}</span>
            </div>`).join('');
        const rect = inputEl.getBoundingClientRect();
        dropdown.style.cssText = `display:block; left:${rect.left}px; top:${rect.bottom}px; width:${Math.max(rect.width,300)}px;`;
        dropdown.querySelectorAll('.ac-item').forEach(el => {
            el.addEventListener('mousedown', (e) => { e.preventDefault(); applyAc(inputEl, el.dataset.value, getDropdown, setActive); });
        });
    }

    function hideAc(getDropdown, setActive) {
        const d = getDropdown(); if (d) d.style.display = 'none'; setActive(-1);
    }

    function applyAc(inputEl, value, getDropdown, setActive) {
        inputEl.value = inputEl.value.replace(/(\S*)$/, value);
        hideAc(getDropdown, setActive); inputEl.focus();
    }

    // Generic help drawer builder
    function buildHelpDrawer({ overlayId, drawerId, searchId, bodyId, btnId, closeId, inputId, items, tagOrder, exprField }) {
        const body = document.getElementById(bodyId);
        let html = '';
        for (const [tag, label] of tagOrder) {
            const subset = items.filter(b => b.tag === tag);
            if (!subset.length) continue;
            html += `<div class="help-section" data-tag="${tag}"><div class="help-section-title">${label}</div>`;
            for (const item of subset) {
                html += `<div class="help-example" data-expr="${escHtml(item[exprField])}" data-desc="${escHtml(item.desc)}" title="Click to use">
                    <span class="help-example-expr">${escHtml(item[exprField])}</span>
                    <span class="help-example-desc">${escHtml(item.desc)}</span>
                    <span class="help-use-badge">use</span>
                </div>`;
            }
            html += '</div>';
        }
        body.innerHTML = html;

        body.addEventListener('click', (e) => {
            const row = e.target.closest('.help-example');
            if (!row) return;
            document.getElementById(inputId).value = row.dataset.expr;
            closeDrawer();
        });

        document.getElementById(searchId).addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            document.querySelectorAll(`#${bodyId} .help-example`).forEach(el => {
                el.classList.toggle('hidden', !!q && !el.dataset.expr.toLowerCase().includes(q) && !el.dataset.desc.toLowerCase().includes(q));
            });
            document.querySelectorAll(`#${bodyId} .help-section`).forEach(sec => {
                sec.classList.toggle('hidden', ![...sec.querySelectorAll('.help-example')].some(el => !el.classList.contains('hidden')));
            });
        });

        function openDrawer() {
            document.getElementById(overlayId).classList.add('open');
            document.getElementById(drawerId).classList.add('open');
            document.getElementById(searchId).value = '';
            document.querySelectorAll(`#${bodyId} .help-example, #${bodyId} .help-section`)
                .forEach(el => el.classList.remove('hidden'));
            document.getElementById(searchId).focus();
        }
        function closeDrawer() {
            document.getElementById(overlayId).classList.remove('open');
            document.getElementById(drawerId).classList.remove('open');
        }
        document.getElementById(btnId).addEventListener('click', openDrawer);
        document.getElementById(closeId).addEventListener('click', closeDrawer);
        document.getElementById(overlayId).addEventListener('click', closeDrawer);
    }

});
