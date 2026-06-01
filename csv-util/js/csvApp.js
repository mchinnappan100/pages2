// csvApp.js — CSV Editor, Grid View, SQL Query, CSV Diff
// mohan chinnappan

// ─── helpers ──────────────────────────────────────────────────────────────────

function escHtml(s) {
    return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function getDelimiter() {
    return document.getElementById('delimiter-select').value;
}

// Parse CSV text → {fields, data, errors}
function parseCsv(text, delim) {
    const result = Papa.parse(text.trim(), {
        header: true,
        delimiter: delim ?? getDelimiter(),
        skipEmptyLines: true,
        dynamicTyping: true
    });
    return result;
}

// Array-of-objects → CSV string
function toCsv(rows, delim) {
    if (!rows || !rows.length) return '';
    return Papa.unparse(rows, { delimiter: delim ?? getDelimiter() });
}

// Array-of-objects → TSV
function toTsv(rows) { return toCsv(rows, '\t'); }

// Detect column type from sample values
function detectType(values) {
    const nonNull = values.filter(v => v !== null && v !== '' && v !== undefined);
    if (!nonNull.length) return 'empty';
    if (nonNull.every(v => typeof v === 'number')) return 'number';
    if (nonNull.every(v => typeof v === 'boolean')) return 'boolean';
    return 'string';
}

function download(content, filename, mime) {
    const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(new Blob([content], { type: mime })),
        download: filename
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

// ─── Monaco setup ─────────────────────────────────────────────────────────────

require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor/min/vs' } });

require(['vs/editor/editor.main'], function () {

    const INIT_CSV =
`id,name,department,salary,age,active
1,Alice Johnson,Engineering,95000,31,true
2,Bob Smith,Marketing,72000,45,true
3,Carol White,Engineering,105000,29,true
4,Dave Brown,HR,58000,52,false
5,Eve Davis,Engineering,112000,38,true
6,Frank Miller,Marketing,68000,41,true
7,Grace Wilson,Finance,88000,34,true
8,Henry Moore,HR,55000,47,false
9,Iris Taylor,Engineering,98000,27,true
10,Jack Anderson,Finance,91000,39,true`;

    // ══ EDITOR TAB ════════════════════════════════════════════════════════════

    const mainEditor = monaco.editor.create(document.getElementById('editor-csv'), {
        value: INIT_CSV, language: 'plaintext', theme: 'vs-dark',
        automaticLayout: true, minimap: { enabled: false },
        wordWrap: 'off', scrollBeyondLastLine: false
    });

    // ── stats pane ────────────────────────────────────────────────────────────

    function renderStats(text) {
        const statsPane = document.getElementById('csv-stats');
        const status    = document.getElementById('parse-status');
        const r = parseCsv(text);

        if (r.errors && r.errors.length && !r.data.length) {
            status.className = 'parse-status parse-err';
            status.textContent = '✗ Parse error';
            statsPane.innerHTML = `<span class="parse-err">${escHtml(r.errors[0].message)}</span>`;
            return;
        }

        status.className = 'parse-status parse-ok';
        status.textContent = '✓ Valid';

        const rows   = r.data;
        const fields = r.meta.fields || [];
        const numRows = rows.length;

        // column types & stats
        const colStats = fields.map(f => {
            const vals = rows.map(row => row[f]);
            const type = detectType(vals);
            const nullCount = vals.filter(v => v === null || v === '').length;
            let extra = '';
            if (type === 'number') {
                const nums = vals.filter(v => typeof v === 'number');
                const sum = nums.reduce((a, b) => a + b, 0);
                const min = Math.min(...nums), max = Math.max(...nums);
                const avg = nums.length ? (sum / nums.length).toFixed(2) : 'N/A';
                extra = `min=${min} max=${max} avg=${avg}`;
            } else if (type === 'string') {
                const uniq = new Set(vals.filter(v => v !== null && v !== '')).size;
                extra = `${uniq} unique`;
            }
            return { f, type, nullCount, extra };
        });

        const typeBadge = t => `<span class="type-badge type-${t}">${t}</span>`;

        statsPane.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-card-val">${numRows}</div><div class="stat-card-lbl">Rows</div></div>
            <div class="stat-card"><div class="stat-card-val">${fields.length}</div><div class="stat-card-lbl">Columns</div></div>
            <div class="stat-card"><div class="stat-card-val">${colStats.filter(c=>c.type==='number').length}</div><div class="stat-card-lbl">Numeric</div></div>
            <div class="stat-card"><div class="stat-card-val">${colStats.filter(c=>c.type==='string').length}</div><div class="stat-card-lbl">Text</div></div>
        </div>
        <table class="col-type-table">
          <thead><tr><th>#</th><th>Column</th><th>Type</th><th>Nulls</th><th>Stats</th></tr></thead>
          <tbody>${colStats.map((c, i) => `
            <tr>
              <td>${i+1}</td>
              <td><strong>${escHtml(c.f)}</strong></td>
              <td>${typeBadge(c.type)}</td>
              <td>${c.nullCount || '—'}</td>
              <td style="color:#9399b2;font-size:.75rem;">${escHtml(c.extra)}</td>
            </tr>`).join('')}
          </tbody>
        </table>`;
    }

    // Shared state for the Grid tab — declared here so refreshAll can write to them.
    let gridData = [], gridFields = [], gridSortCol = null, gridSortAsc = true;

    // Parse the CSV, update stats pane, AND cache the data for the grid/SQL tabs.
    // Called on init and on every editor change.
    function refreshAll(text) {
        renderStats(text);
        const r = parseCsv(text);
        if (r.data && r.data.length && r.meta && r.meta.fields && r.meta.fields.length) {
            gridData   = r.data;
            gridFields = r.meta.fields;
        }
    }

    refreshAll(INIT_CSV);
    mainEditor.onDidChangeModelContent(() => refreshAll(mainEditor.getValue()));

    // ── toolbar buttons ───────────────────────────────────────────────────────

    document.getElementById('download-csv-btn').addEventListener('click', () =>
        download(mainEditor.getValue(), 'output.csv', 'text/csv'));

    document.getElementById('download-tsv-btn').addEventListener('click', () => {
        const r = parseCsv(mainEditor.getValue());
        if (r.data.length) download(toTsv(r.data), 'output.tsv', 'text/tab-separated-values');
    });

    document.getElementById('download-json-btn').addEventListener('click', () => {
        const r = parseCsv(mainEditor.getValue());
        if (r.data.length) download(JSON.stringify(r.data, null, 2), 'output.json', 'application/json');
    });

    document.getElementById('json2csv-btn').addEventListener('click', () => {
        try {
            const arr = JSON.parse(mainEditor.getValue());
            if (!Array.isArray(arr)) { alert('Root must be a JSON array of objects.'); return; }
            mainEditor.setValue(toCsv(arr));
        } catch (e) { alert('JSON parse error: ' + e.message); }
    });

    // ── file input / drag-drop ────────────────────────────────────────────────

    function loadText(text) {
        // if JSON array, auto-convert
        try {
            const arr = JSON.parse(text);
            if (Array.isArray(arr)) { mainEditor.setValue(toCsv(arr)); return; }
        } catch (_) {}
        mainEditor.setValue(text);
    }

    document.getElementById('csvFileInput').addEventListener('change', (e) => {
        const f = e.target.files[0]; if (!f) return;
        const fr = new FileReader(); fr.onload = ev => loadText(ev.target.result); fr.readAsText(f);
    });

    const dropArea = document.getElementById('dropArea');
    dropArea.addEventListener('dragenter', e => e.preventDefault(), false);
    dropArea.addEventListener('dragover',  e => e.preventDefault(), false);
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0]; if (!f) return;
        const fr = new FileReader(); fr.onload = ev => loadText(ev.target.result); fr.readAsText(f);
    }, false);

    // ══ GRID TAB ══════════════════════════════════════════════════════════════

    function buildGrid(rows, fields) {
        gridData   = rows;
        gridFields = fields;
        renderGrid(rows, fields);
    }

    function renderGrid(rows, fields) {
        const container = document.getElementById('csv-grid');
        const filterVal = document.getElementById('grid-filter').value.toLowerCase();

        const filtered = filterVal
            ? rows.filter(r => fields.some(f => String(r[f] ?? '').toLowerCase().includes(filterVal)))
            : rows;

        document.getElementById('grid-row-count').textContent =
            filterVal ? `${filtered.length} / ${rows.length} rows` : `${rows.length} rows`;

        const sortIcon = (f) => {
            if (gridSortCol !== f) return '';
            return `<span class="sort-icon">${gridSortAsc ? '▲' : '▼'}</span>`;
        };

        const header = `<thead><tr>${fields.map(f =>
            `<th data-col="${escHtml(f)}">${escHtml(f)}${sortIcon(f)}</th>`
        ).join('')}</tr></thead>`;

        const body = `<tbody>${filtered.map(row =>
            `<tr>${fields.map(f => `<td title="${escHtml(String(row[f]??''))}">${escHtml(String(row[f]??''))}</td>`).join('')}</tr>`
        ).join('')}</tbody>`;

        container.innerHTML = `<table>${header}${body}</table>`;

        // sort on header click
        container.querySelectorAll('th').forEach(th => {
            th.addEventListener('click', () => {
                const col = th.dataset.col;
                if (gridSortCol === col) gridSortAsc = !gridSortAsc;
                else { gridSortCol = col; gridSortAsc = true; }
                const sorted = [...rows].sort((a, b) => {
                    const av = a[col], bv = b[col];
                    if (av == null) return 1; if (bv == null) return -1;
                    return gridSortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
                });
                renderGrid(sorted, fields);
            });
        });
    }

    document.getElementById('grid-filter').addEventListener('input', () =>
        renderGrid(gridData, gridFields));

    document.getElementById('grid-reset-sort').addEventListener('click', () => {
        gridSortCol = null; gridSortAsc = true;
        if (gridData.length) renderGrid(gridData, gridFields);
    });

    // When the Grid tab becomes visible, render from the cached gridData.
    document.getElementById('grid-tab').addEventListener('shown.bs.tab', () => {
        if (gridData.length) renderGrid(gridData, gridFields);
    });

    // ══ SQL TAB ═══════════════════════════════════════════════════════════════

    const sqlInputEditor = monaco.editor.create(document.getElementById('sql-input-editor'), {
        value: INIT_CSV, language: 'plaintext', theme: 'vs-dark',
        automaticLayout: true, minimap: { enabled: false }, wordWrap: 'off'
    });

    document.getElementById('sql-tab').addEventListener('shown.bs.tab', () => {
        sqlInputEditor.setValue(mainEditor.getValue());
        sqlInputEditor.layout();
        rebuildSqlAc();
    });

    // Register parsed CSV rows into alasql as a named in-memory table called "csv"
    // so users can write  SELECT … FROM csv  without any special syntax.
    function registerCsvTable(rows) {
        alasql('DROP TABLE IF EXISTS csv');
        alasql('CREATE TABLE csv');
        alasql.tables.csv.data = rows;
    }

    function runSql() {
        const query   = document.getElementById('sql-query-input').value.trim();
        const results = document.getElementById('sql-results-pane');
        if (!query) return;

        const r = parseCsv(sqlInputEditor.getValue());
        if (!r.data.length) {
            results.innerHTML = '<p class="sql-meta text-danger">CSV parse error or empty data.</p>';
            return;
        }

        registerCsvTable(r.data);

        try {
            const rows = alasql(query);
            if (!Array.isArray(rows)) {
                results.innerHTML = `<p class="sql-meta">Result: <strong>${escHtml(String(rows))}</strong></p>`;
                return;
            }
            if (!rows.length) {
                results.innerHTML = '<p class="sql-meta">Query returned 0 rows.</p>';
                return;
            }
            const cols = Object.keys(rows[0]);
            const header = `<thead><tr>${cols.map(c => `<th>${escHtml(c)}</th>`).join('')}</tr></thead>`;
            const body   = `<tbody>${rows.map(row =>
                `<tr>${cols.map(c => `<td>${escHtml(String(row[c]??''))}</td>`).join('')}</tr>`
            ).join('')}</tbody>`;
            results.innerHTML = `<p class="sql-meta">${rows.length} row(s)</p><table class="sql-table">${header}${body}</table>`;
        } catch (e) {
            results.innerHTML = `<p class="sql-meta text-danger">SQL error: ${escHtml(e.message)}</p>`;
        }
    }

    document.getElementById('sql-run-btn').addEventListener('click', runSql);
    document.getElementById('sql-query-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !sqlAcVisible()) { e.preventDefault(); runSql(); }
    });

    // ── SQL autocomplete ──────────────────────────────────────────────────────

    let sqlAcCols = [], sqlAcActive = -1, sqlAcDropdown = null;

    function rebuildSqlAc() {
        const r = parseCsv(sqlInputEditor.getValue());
        sqlAcCols = r.meta.fields || [];
    }
    rebuildSqlAc();
    sqlInputEditor.onDidChangeModelContent(() => rebuildSqlAc());

    const SQL_KEYWORDS = [
        { expr: 'SELECT * FROM csv',                                   desc: 'Select all rows',                      tag: 'basic' },
        { expr: 'SELECT * FROM csv LIMIT 10',                          desc: 'First 10 rows',                        tag: 'basic' },
        { expr: 'SELECT * FROM csv WHERE col > 0',                     desc: 'Filter rows by condition',             tag: 'filter' },
        { expr: "SELECT * FROM csv WHERE col = 'value'",               desc: 'Filter by string equality',            tag: 'filter' },
        { expr: 'SELECT * FROM csv WHERE col LIKE "%text%"',           desc: 'Filter by pattern match',              tag: 'filter' },
        { expr: 'SELECT * FROM csv WHERE col IS NULL',                 desc: 'Rows where column is null',            tag: 'filter' },
        { expr: 'SELECT * FROM csv WHERE col BETWEEN 10 AND 50',       desc: 'Range filter',                         tag: 'filter' },
        { expr: 'SELECT col1, col2 FROM csv',                          desc: 'Select specific columns',              tag: 'basic' },
        { expr: 'SELECT DISTINCT col FROM csv',                        desc: 'Unique values of a column',            tag: 'basic' },
        { expr: 'SELECT * FROM csv ORDER BY col ASC',                  desc: 'Sort ascending',                       tag: 'sort' },
        { expr: 'SELECT * FROM csv ORDER BY col DESC',                 desc: 'Sort descending',                      tag: 'sort' },
        { expr: 'SELECT * FROM csv ORDER BY col1 DESC, col2 ASC',      desc: 'Multi-column sort',                    tag: 'sort' },
        { expr: 'SELECT col, COUNT(*) AS n FROM csv GROUP BY col',     desc: 'Count by group',                       tag: 'agg' },
        { expr: 'SELECT col, SUM(val) FROM csv GROUP BY col',          desc: 'Sum by group',                         tag: 'agg' },
        { expr: 'SELECT col, AVG(val) FROM csv GROUP BY col',          desc: 'Average by group',                     tag: 'agg' },
        { expr: 'SELECT col, MIN(val), MAX(val) FROM csv GROUP BY col',desc: 'Min/max by group',                     tag: 'agg' },
        { expr: 'SELECT COUNT(*) AS total FROM csv',                   desc: 'Total row count',                      tag: 'agg' },
        { expr: 'SELECT SUM(col) AS total FROM csv',                   desc: 'Sum a column',                         tag: 'agg' },
        { expr: 'SELECT AVG(col) AS avg FROM csv',                     desc: 'Average of a column',                  tag: 'agg' },
        { expr: 'SELECT MIN(col) AS min, MAX(col) AS max FROM csv',    desc: 'Min and max of a column',              tag: 'agg' },
        { expr: 'SELECT col, COUNT(*) AS n FROM csv GROUP BY col HAVING n > 1', desc: 'Groups with count > 1',      tag: 'agg' },
        { expr: 'SELECT col, ROUND(AVG(val),2) AS avg FROM csv GROUP BY col', desc: 'Rounded average by group',     tag: 'agg' },
        { expr: 'SELECT * FROM csv WHERE col > (SELECT AVG(col) FROM csv)', desc: 'Rows above average',             tag: 'sub' },
        { expr: 'SELECT * FROM csv WHERE active = true',               desc: 'Filter boolean column',               tag: 'filter' },
        { expr: "SELECT UPPER(name) AS name FROM csv",                 desc: 'Uppercase a column',                   tag: 'fn' },
        { expr: "SELECT LOWER(name) AS name FROM csv",                 desc: 'Lowercase a column',                   tag: 'fn' },
        { expr: "SELECT TRIM(col) AS col FROM csv",                    desc: 'Trim whitespace',                      tag: 'fn' },
        { expr: "SELECT LEN(col) AS len FROM csv",                     desc: 'String length',                        tag: 'fn' },
        { expr: "SELECT REPLACE(col,'old','new') AS col FROM csv",     desc: 'Replace in string',                    tag: 'fn' },
        { expr: "SELECT col, col * 1.1 AS col_plus_10pct FROM csv",    desc: 'Computed column',                      tag: 'fn' },
        { expr: "SELECT col, CASE WHEN val > 50 THEN 'high' ELSE 'low' END AS level FROM csv", desc: 'Conditional column', tag: 'fn' },
    ];

    const SQL_TAG_ORDER = [
        ['basic','Basic Selects'], ['filter','Filtering'], ['sort','Sorting'],
        ['agg','Aggregation'], ['fn','Functions & Expressions'], ['sub','Subqueries'],
    ];

    function sqlAcVisible() { return sqlAcDropdown && sqlAcDropdown.style.display !== 'none'; }

    function getSqlAcItems(text) {
        const token = text.match(/(\w+)$/)?.[1] ?? '';
        if (!token || token.length < 2) return [];
        const lower = token.toLowerCase();
        const colMatches = sqlAcCols.filter(c => c.toLowerCase().startsWith(lower)).slice(0, 6).map(c => ({ label: c, tag: 'col' }));
        const kwMatches  = SQL_KEYWORDS.filter(k => k.expr.toLowerCase().includes(lower)).slice(0, 8).map(k => ({ label: k.expr, tag: k.tag }));
        return [...colMatches, ...kwMatches].slice(0, 12);
    }

    buildAcDropdown(
        document.getElementById('sql-query-input'),
        () => sqlAcDropdown, d => { sqlAcDropdown = d; },
        () => sqlAcActive,   v => { sqlAcActive = v; },
        getSqlAcItems, sqlAcVisible
    );

    // ── SQL help drawer ───────────────────────────────────────────────────────

    buildHelpDrawer({
        overlayId: 'sql-help-overlay', drawerId: 'sql-help-drawer',
        searchId: 'sql-help-search',   bodyId:   'sql-help-body',
        btnId: 'sql-help-btn',         closeId:  'sql-help-close',
        inputId: 'sql-query-input',
        items: SQL_KEYWORDS, tagOrder: SQL_TAG_ORDER, exprField: 'expr'
    });

    // ══ DIFF TAB ══════════════════════════════════════════════════════════════

    const SAMPLE_B =
`id,name,department,salary,age,active
1,Alice Johnson,Engineering,99000,31,true
2,Bob Smith,Sales,75000,45,true
4,Dave Brown,HR,58000,53,true
5,Eve Davis,Engineering,115000,38,true
6,Frank Miller,Marketing,68000,41,false
7,Grace Wilson,Finance,92000,34,true
8,Henry Moore,HR,57000,47,false
9,Iris Taylor,Engineering,103000,27,true
10,Jack Anderson,Finance,91000,40,true
11,Karen Lee,Engineering,87000,30,true`;

    const diffEditorA = monaco.editor.create(document.getElementById('diff-editor-a'), {
        value: INIT_CSV, language: 'plaintext', theme: 'vs-dark',
        automaticLayout: true, minimap: { enabled: false }
    });
    const diffEditorB = monaco.editor.create(document.getElementById('diff-editor-b'), {
        value: SAMPLE_B, language: 'plaintext', theme: 'vs-dark',
        automaticLayout: true, minimap: { enabled: false }
    });

    function attachFileLoader(inputId, editor) {
        document.getElementById(inputId).addEventListener('change', (e) => {
            const f = e.target.files[0]; if (!f) return;
            const fr = new FileReader();
            fr.onload = ev => editor.setValue(ev.target.result);
            fr.readAsText(f);
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

        const rA = parseCsv(diffEditorA.getValue());
        const rB = parseCsv(diffEditorB.getValue());
        if (!rA.data.length) { status.textContent = 'CSV A is empty or invalid'; return; }
        if (!rB.data.length) { status.textContent = 'CSV B is empty or invalid'; return; }

        const container = document.getElementById('diff-results');

        // Determine key column (first column by convention, or 'id' if exists)
        const fieldsA = rA.meta.fields || [];
        const fieldsB = rB.meta.fields || [];
        const keyCol  = (fieldsA.includes('id') ? 'id' : fieldsA[0]) || fieldsA[0];
        const allCols = [...new Set([...fieldsA, ...fieldsB])];

        const mapA = Object.fromEntries(rA.data.map(r => [String(r[keyCol]), r]));
        const mapB = Object.fromEntries(rB.data.map(r => [String(r[keyCol]), r]));
        const allKeys = [...new Set([...Object.keys(mapA), ...Object.keys(mapB)])];

        let added = 0, deleted = 0, changed = 0;
        const rows = allKeys.map(k => {
            const a = mapA[k], b = mapB[k];
            if (!a) { added++;   return { kind: 'A', key: k, a: null, b }; }
            if (!b) { deleted++; return { kind: 'D', key: k, a, b: null }; }
            const changedCols = allCols.filter(c => String(a[c]??'') !== String(b[c]??''));
            if (changedCols.length) { changed++; return { kind: 'C', key: k, a, b, changedCols }; }
            return null;
        }).filter(Boolean);

        if (!rows.length) {
            container.innerHTML = '<p class="text-success p-3">✓ No differences — the two CSV files are semantically identical.</p>';
            status.textContent = ''; return;
        }
        status.textContent = `+${added} added  −${deleted} deleted  ~${changed} changed`;

        const kindLabel = { A: 'Added', D: 'Deleted', C: 'Changed' };
        const colHeader = allCols.map(c => `<th>${escHtml(c)}</th>`).join('');

        const tableRows = rows.map(row => {
            const cls = row.kind === 'A' ? 'diff-row-added' : row.kind === 'D' ? 'diff-row-deleted' : 'diff-row-changed';
            const src = row.b ?? row.a;
            const cells = allCols.map(c => {
                const val = escHtml(String(src[c] ?? ''));
                const highlight = row.kind === 'C' && row.changedCols.includes(c);
                return highlight
                    ? `<td><span class="diff-cell-changed">${val}</span></td>`
                    : `<td>${val}</td>`;
            }).join('');
            return `<tr class="${cls}">
                <td><span class="badge-${row.kind}">${kindLabel[row.kind]}</span></td>
                <td>${escHtml(row.key)}</td>
                ${cells}
            </tr>`;
        }).join('');

        container.innerHTML = `
            <p class="text-warning p-2 mb-0">
                <strong>${rows.length}</strong> difference(s) — key column: <code>${escHtml(keyCol)}</code>
            </p>
            <table class="diff-table">
              <thead><tr><th>Type</th><th>${escHtml(keyCol)}</th>${colHeader}</tr></thead>
              <tbody>${tableRows}</tbody>
            </table>`;
    });

    // ── verbatim diff ─────────────────────────────────────────────────────────

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
                    original: monaco.editor.createModel(textA, 'plaintext'),
                    modified: monaco.editor.createModel(textB, 'plaintext')
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

    // ══ COMPARE TAB ═══════════════════════════════════════════════════════════

    let cmpSrcRows = [], cmpTgtRows = [], cmpSrcFields = [], cmpTgtFields = [];

    function loadCmpFile(inputId, onLoad) {
        document.getElementById(inputId).addEventListener('change', (e) => {
            const f = e.target.files[0]; if (!f) return;
            const fr = new FileReader();
            fr.onload = ev => {
                const r = parseCsv(ev.target.result);
                onLoad(r.data, r.meta.fields || [], f);
            };
            fr.readAsText(f);
        });
    }

    // ── pill-based key column selector ───────────────────────────────────────

    const PILL_COLORS = 12; // matches data-pi=0..11 in CSS

    function populateKeyColSelect(fields) {
        const bar = document.getElementById('cmp-pill-bar');
        bar.innerHTML = '';
        const idCol = fields.find(f => f.toLowerCase() === 'id');
        fields.forEach((f, i) => {
            const pill = document.createElement('span');
            pill.className = 'cmp-pill';
            pill.dataset.col = f;
            pill.dataset.pi  = String(i % PILL_COLORS);
            pill.textContent = f;
            // default: select 'id' if present, else all
            const selected = idCol ? f === idCol : true;
            pill.classList.add(selected ? 'on' : 'off');
            pill.addEventListener('click', () => {
                pill.classList.toggle('on');
                pill.classList.toggle('off');
            });
            bar.appendChild(pill);
        });
    }

    // Returns array of currently selected key column names
    function getSelectedKeyCols() {
        return [...document.querySelectorAll('#cmp-pill-bar .cmp-pill.on')]
            .map(p => p.dataset.col);
    }

    // Composite key string from a row
    function makeCompositeKey(row, keyCols) {
        return keyCols.map(c => String(row[c] ?? '')).join('||');
    }

    document.getElementById('cmp-select-all').addEventListener('click', () => {
        document.querySelectorAll('#cmp-pill-bar .cmp-pill').forEach(p => {
            p.classList.add('on'); p.classList.remove('off');
        });
    });
    document.getElementById('cmp-clear-all').addEventListener('click', () => {
        document.querySelectorAll('#cmp-pill-bar .cmp-pill').forEach(p => {
            p.classList.add('off'); p.classList.remove('on');
        });
    });

    // file name display helper
    function showFileName(spanId, file) {
        document.getElementById(spanId).textContent = file ? file.name : 'No file';
    }

    loadCmpFile('cmp-file-src', (rows, fields, file) => {
        cmpSrcRows   = rows;
        cmpSrcFields = fields;
        populateKeyColSelect(fields);
        showFileName('cmp-src-name', file);
    });

    loadCmpFile('cmp-file-tgt', (rows, fields, file) => {
        cmpTgtRows   = rows;
        cmpTgtFields = fields;
        showFileName('cmp-tgt-name', file);
    });

    document.getElementById('cmp-use-editor-btn').addEventListener('click', () => {
        const r = parseCsv(mainEditor.getValue());
        if (!r.data.length) return;
        cmpSrcRows   = r.data;
        cmpSrcFields = r.meta.fields || [];
        populateKeyColSelect(cmpSrcFields);
        document.getElementById('cmp-src-name').textContent = 'from editor';
        document.getElementById('cmp-status').textContent = '';
    });

    document.getElementById('cmp-run-btn').addEventListener('click', runCompare);

    function runCompare() {
        const status  = document.getElementById('cmp-status');
        const summary = document.getElementById('cmp-summary');
        const results = document.getElementById('cmp-results');

        if (!cmpSrcRows.length) { status.textContent = 'Load a Source file first.'; return; }
        if (!cmpTgtRows.length) { status.textContent = 'Load a Target file first.'; return; }

        const keyCols = getSelectedKeyCols();
        if (!keyCols.length) { status.textContent = 'Select at least one key column.'; return; }

        const allCols    = [...new Set([...cmpSrcFields, ...cmpTgtFields])];
        const nonKeyCols = allCols.filter(c => !keyCols.includes(c));
        const keyLabel   = keyCols.join(' + ');
        const keySetAll  = new Set(keyCols);

        // When ALL columns are selected as keys, every differing row ends up
        // "only in source/target" and Value Differences is always empty.
        // Detect this case and switch to fuzzy-match mode:
        // treat every column as a value column, pair rows by positional index
        // (or by best matching score when counts differ).
        const allColsAreKeys = nonKeyCols.length === 0;

        if (allColsAreKeys) {
            // pair by index, all columns are value columns
            const pairingCols = allCols;
            const len = Math.min(cmpSrcRows.length, cmpTgtRows.length);
            const valueDiffs = [];
            for (let i = 0; i < len; i++) {
                const a = cmpSrcRows[i], b = cmpTgtRows[i];
                const changedCols = pairingCols.filter(c => String(a[c] ?? '') !== String(b[c] ?? ''));
                if (changedCols.length) valueDiffs.push({ key: String(i + 1), a, b, changedCols });
            }
            const onlySrc = cmpSrcRows.slice(len);
            const onlyTgt = cmpTgtRows.slice(len);
            const same    = len - valueDiffs.length;

            status.textContent = `All-column mode (index-paired) · Key: row number`;
            renderCompareResults(summary, results, cmpSrcRows.length, cmpTgtRows.length,
                onlySrc, onlyTgt, valueDiffs, same, allCols, ['row#']);
            return;
        }

        // build lookup maps by composite key
        const srcMap = Object.fromEntries(cmpSrcRows.map(r => [makeCompositeKey(r, keyCols), r]));
        const tgtMap = Object.fromEntries(cmpTgtRows.map(r => [makeCompositeKey(r, keyCols), r]));
        const srcKeys = new Set(Object.keys(srcMap));
        const tgtKeys = new Set(Object.keys(tgtMap));

        const onlySrc = [...srcKeys].filter(k => !tgtKeys.has(k)).map(k => srcMap[k]);
        const onlyTgt = [...tgtKeys].filter(k => !srcKeys.has(k)).map(k => tgtMap[k]);
        const inBoth  = [...srcKeys].filter(k => tgtKeys.has(k));

        const valueDiffs = inBoth.map(k => {
            const a = srcMap[k], b = tgtMap[k];
            const changedCols = nonKeyCols.filter(c => String(a[c] ?? '') !== String(b[c] ?? ''));
            return changedCols.length ? { key: k, a, b, changedCols } : null;
        }).filter(Boolean);

        const same = inBoth.length - valueDiffs.length;
        status.textContent = `Key: ${keyLabel}`;

        renderCompareResults(summary, results, cmpSrcRows.length, cmpTgtRows.length,
            onlySrc, onlyTgt, valueDiffs, same, allCols, keyCols);
    }

    // ── shared results renderer ───────────────────────────────────────────────

    function renderCompareResults(summary, results, srcCount, tgtCount,
                                   onlySrc, onlyTgt, valueDiffs, same, allCols, keyCols) {
        // summary cards
        summary.style.display = 'flex';
        summary.innerHTML = `
            <div class="cmp-card"><div class="cmp-card-val cmp-val-src">${srcCount}</div><div class="cmp-card-lbl">Source Records</div></div>
            <div class="cmp-card"><div class="cmp-card-val cmp-val-tgt">${tgtCount}</div><div class="cmp-card-lbl">Target Records</div></div>
            <div class="cmp-card"><div class="cmp-card-val cmp-val-only-src">${onlySrc.length}</div><div class="cmp-card-lbl">Only in Source</div></div>
            <div class="cmp-card"><div class="cmp-card-val cmp-val-only-tgt">${onlyTgt.length}</div><div class="cmp-card-lbl">Only in Target</div></div>
            <div class="cmp-card"><div class="cmp-card-val cmp-val-diff">${valueDiffs.length}</div><div class="cmp-card-lbl">Value Differences</div></div>
            <div class="cmp-card"><div class="cmp-card-val cmp-val-same">${same}</div><div class="cmp-card-lbl">Identical Records</div></div>`;

        // result sections
        results.innerHTML = [
            buildCmpSection('&#128202; Only in Source', onlySrc, cmpSrcFields, 'cmp-row-src', '#fab387', 'source-only'),
            buildCmpSection('&#128202; Only in Target', onlyTgt, cmpTgtFields, 'cmp-row-tgt', '#cba6f7', 'target-only'),
            buildCmpSectionDiff('&#128202; Value Differences', valueDiffs, allCols, keyCols),
        ].join('');

        // wire toggle buttons
        results.querySelectorAll('.cmp-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tgt = document.getElementById(btn.dataset.target);
                if (!tgt) return;
                const hidden = tgt.style.display === 'none';
                tgt.style.display = hidden ? '' : 'none';
                btn.textContent = hidden ? '▲ Hide Details' : '▼ Show Details';
            });
        });

        // wire download buttons
        results.querySelectorAll('.cmp-dl-btn[data-kind]').forEach(btn => {
            btn.addEventListener('click', () => {
                const kind = btn.dataset.kind;
                let rows, fname;
                if      (kind === 'source-only') { rows = onlySrc; fname = 'only-in-source.csv'; }
                else if (kind === 'target-only') { rows = onlyTgt; fname = 'only-in-target.csv'; }
                else if (kind === 'diffs') {
                    rows = valueDiffs.map(d => {
                        const row = {};
                        keyCols.forEach(c => { if (c !== 'row#') row[c] = d.a[c]; });
                        d.changedCols.forEach(c => {
                            row[`${c}_source`] = d.a[c];
                            row[`${c}_target`] = d.b[c];
                        });
                        return row;
                    });
                    fname = 'value-differences.csv';
                }
                if (rows && rows.length) download(toCsv(rows), fname, 'text/csv');
            });
        });
    }

    function buildCmpSection(title, rows, fields, rowCls, titleColor, dlKind) {
        const count = rows.length;
        const tableId = `cmp-tbl-${dlKind}`;
        if (!count) {
            return `<div class="cmp-section">
                <div class="cmp-section-header">
                    <span class="cmp-section-title" style="color:${titleColor}">${title} <span style="opacity:.6">(${count})</span></span>
                </div>
                <p class="cmp-empty">No records in this category ✓</p>
            </div>`;
        }
        const header = fields.map(f => `<th>${escHtml(f)}</th>`).join('');
        const body   = rows.map(row =>
            `<tr class="${rowCls}">${fields.map(f => `<td>${escHtml(String(row[f] ?? ''))}</td>`).join('')}</tr>`
        ).join('');
        return `<div class="cmp-section">
            <div class="cmp-section-header">
                <span class="cmp-section-title" style="color:${titleColor}">${title} <span style="opacity:.6">(${count})</span></span>
                <div class="cmp-section-actions">
                    <button class="cmp-toggle-btn" data-target="${tableId}">▼ Show Details</button>
                    <button class="btn btn-sm cmp-dl-btn" data-kind="${dlKind}"
                        style="background:#45475a;color:#cdd6f4;border:none;">&#128229; Download CSV</button>
                </div>
            </div>
            <div id="${tableId}" style="display:none; overflow-x:auto;">
                <table class="cmp-table"><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>
            </div>
        </div>`;
    }

    function buildCmpSectionDiff(title, diffs, allCols, keyCols) {
        const count = diffs.length;
        const tableId = 'cmp-tbl-diffs';
        if (!count) {
            return `<div class="cmp-section">
                <div class="cmp-section-header">
                    <span class="cmp-section-title" style="color:#f38ba8">${title} <span style="opacity:.6">(${count})</span></span>
                </div>
                <p class="cmp-empty">No value differences found ✓</p>
            </div>`;
        }
        // header: key cols first (excluding virtual 'row#'), then remaining cols
        const keySet     = new Set(keyCols);
        const realKeyCols = keyCols.filter(c => c !== 'row#');
        const cols = [...realKeyCols, ...allCols.filter(c => !keySet.has(c))];
        const showRowNum = keyCols.includes('row#');
        const header = (showRowNum ? '<th>#</th>' : '') + cols.map(c => `<th>${escHtml(c)}</th>`).join('');
        const body   = diffs.map(d => {
            const rowNumCell = showRowNum ? `<td><strong>${escHtml(d.key)}</strong></td>` : '';
            const cells = cols.map(c => {
                if (keySet.has(c)) return `<td><strong>${escHtml(String(d.a[c] ?? ''))}</strong></td>`;
                if (d.changedCols.includes(c)) {
                    return `<td><span class="cmp-cell-old">${escHtml(String(d.a[c] ?? ''))}</span>`
                         + `<span class="cmp-cell-new">${escHtml(String(d.b[c] ?? ''))}</span></td>`;
                }
                return `<td style="opacity:.5">${escHtml(String(d.a[c] ?? ''))}</td>`;
            }).join('');
            return `<tr class="cmp-row-diff">${rowNumCell}${cells}</tr>`;
        }).join('');
        return `<div class="cmp-section">
            <div class="cmp-section-header">
                <span class="cmp-section-title" style="color:#f38ba8">${title} <span style="opacity:.6">(${count})</span></span>
                <div class="cmp-section-actions">
                    <button class="cmp-toggle-btn" data-target="${tableId}">▼ Show Details</button>
                    <button class="btn btn-sm cmp-dl-btn" data-kind="diffs"
                        style="background:#45475a;color:#cdd6f4;border:none;">&#128229; Download CSV</button>
                </div>
            </div>
            <div id="${tableId}" style="display:none; overflow-x:auto;">
                <table class="cmp-table"><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>
            </div>
        </div>`;
    }

    // diff vertical splitter (A | B)
    makeVSplitter('diff-inputs-row', 'diff-col-a', 'diff-col-b', 'diff-gutter', () => {
        diffEditorA.layout(); diffEditorB.layout(); relayoutDiffEditor();
    });

    // diff horizontal splitter (editors ↕ results)
    makeHSplitter('diff-pane', 'diff-inputs-row', 'diff-h-gutter', () => {
        diffEditorA.layout(); diffEditorB.layout(); relayoutDiffEditor();
    });

    // ══ SHARED SPLITTER FACTORIES ══════════════════════════════════════════════

    function makeVSplitter(containerSel, colAId, colBId, gutterId, onDrag) {
        const container = typeof containerSel === 'string' && containerSel.includes('-')
            ? document.getElementById(containerSel) || document.querySelector(containerSel)
            : document.querySelector(containerSel);
        const colA   = document.getElementById(colAId);
        const colB   = document.getElementById(colBId);
        const gutter = document.getElementById(gutterId);
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
            if (onDrag) onDrag();
        });
        gutter.addEventListener('pointerup',          () => { dragging = false; gutter.classList.remove('dragging'); });
        gutter.addEventListener('lostpointercapture', () => { dragging = false; gutter.classList.remove('dragging'); });
    }

    function makeHSplitter(paneId, topRowId, gutterId, onDrag) {
        const pane    = document.getElementById(paneId);
        const topRow  = document.getElementById(topRowId);
        const gutter  = document.getElementById(gutterId);
        let dragging = false, startY = 0, startTopH = 0;
        gutter.addEventListener('pointerdown', (e) => {
            e.preventDefault(); dragging = true; startY = e.clientY;
            startTopH = topRow.getBoundingClientRect().height;
            gutter.classList.add('dragging'); gutter.setPointerCapture(e.pointerId);
        });
        gutter.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            const total = pane.getBoundingClientRect().height - 8;
            const newH = Math.min(Math.max(startTopH + (e.clientY - startY), total * .1), total * .85);
            topRow.style.flex = `0 0 ${newH}px`;
            if (onDrag) onDrag();
        });
        gutter.addEventListener('pointerup',          () => { dragging = false; gutter.classList.remove('dragging'); });
        gutter.addEventListener('lostpointercapture', () => { dragging = false; gutter.classList.remove('dragging'); });
    }

    // editor vertical splitter (selector form)
    makeVSplitter('.editor-container', 'csv-monaco-col', 'csv-stats-col', 'editor-gutter',
        () => mainEditor.layout());

    // ══ SHARED AUTOCOMPLETE ════════════════════════════════════════════════════

    function buildAcDropdown(inputEl, getDD, setDD, getActive, setActive, getItems, isVisible) {
        inputEl.addEventListener('input', () => {
            const items = getItems(inputEl.value);
            if (items.length) showAc(inputEl, getDD, setDD, setActive, items);
            else hideAc(getDD, setActive);
        });
        inputEl.addEventListener('keydown', (e) => {
            if (!isVisible()) return;
            const dd   = getDD();
            const rows = dd ? dd.querySelectorAll('.ac-item') : [];
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(getActive()+1, rows.length-1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(getActive()-1, 0)); }
            else if ((e.key === 'Tab' || e.key === 'Enter') && getActive() >= 0) {
                e.preventDefault(); applyAc(inputEl, rows[getActive()].dataset.value, getDD, setActive); return;
            } else if (e.key === 'Escape') { hideAc(getDD, setActive); return; }
            else return;
            rows.forEach((r, i) => r.classList.toggle('active', i === getActive()));
            if (getActive() >= 0) rows[getActive()].scrollIntoView({ block: 'nearest' });
        });
        document.addEventListener('click', (e) => { if (e.target !== inputEl) hideAc(getDD, setActive); });
    }

    function showAc(inputEl, getDD, setDD, setActive, items) {
        let dd = getDD();
        if (!dd) { dd = document.createElement('div'); dd.className = 'ac-dropdown'; document.body.appendChild(dd); setDD(dd); }
        setActive(-1);
        dd.innerHTML = items.map((item, i) =>
            `<div class="ac-item" data-idx="${i}" data-value="${escHtml(item.label)}">
                <span>${escHtml(item.label)}</span><span class="ac-tag">${item.tag}</span>
            </div>`).join('');
        const rect = inputEl.getBoundingClientRect();
        dd.style.cssText = `display:block; left:${rect.left}px; top:${rect.bottom}px; width:${Math.max(rect.width,320)}px;`;
        dd.querySelectorAll('.ac-item').forEach(el =>
            el.addEventListener('mousedown', (e) => { e.preventDefault(); applyAc(inputEl, el.dataset.value, getDD, setActive); })
        );
    }
    function hideAc(getDD, setActive) { const d = getDD(); if (d) d.style.display='none'; setActive(-1); }
    function applyAc(inputEl, value, getDD, setActive) {
        inputEl.value = value; hideAc(getDD, setActive); inputEl.focus();
    }

    // ══ SHARED HELP DRAWER ════════════════════════════════════════════════════

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
            document.querySelectorAll(`#${bodyId} .help-example`).forEach(el =>
                el.classList.toggle('hidden', !!q && !el.dataset.expr.toLowerCase().includes(q) && !el.dataset.desc.toLowerCase().includes(q)));
            document.querySelectorAll(`#${bodyId} .help-section`).forEach(sec =>
                sec.classList.toggle('hidden', ![...sec.querySelectorAll('.help-example')].some(el => !el.classList.contains('hidden'))));
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
