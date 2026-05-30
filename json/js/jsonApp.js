// jsonApp.js — JSON Editor, jq Query, and JSON Diff
// mohan chinnappan

try {
    if (sforce !== undefined) {
        const context = sforce.one.getContext();
        console.log('Salesforce Context:', context);
    }
} catch (e) { /* not in Salesforce */ }

// ─── helpers ─────────────────────────────────────────────────────────────────

const repoUrl = "https://raw.githubusercontent.com/mohan-chinnappan-n/project-docs";

async function fetchText(url) {
    const r = await fetch(url);
    return r.text();
}

function extractUniqueWords(json) {
    return _.uniq(_.flatMapDeep(json, (value, key) =>
        _.isObject(value) ? [key] : [key, String(value)]
    ));
}

// ─── initial data ─────────────────────────────────────────────────────────────

const listDwg = await fetchText(`${repoUrl}/main/json/list.txt`);
const selectionMap = listDwg.trim().split("\n");

let initJSON = await fetchText(`${repoUrl}/main/json/FlattenTest.json`);

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('c')) {
    initJSON = await navigator.clipboard.readText();
}
if (urlParams.has('u')) {
    initJSON = await fetchText(urlParams.get('u'));
}

// ─── Monaco setup ─────────────────────────────────────────────────────────────

require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor/min/vs' } });

require(['vs/editor/editor.main'], function () {

    // ── Editor Tab ──────────────────────────────────────────────────────────

    const mainMonacoEditor = monaco.editor.create(document.getElementById('editor-json'), {
        value: initJSON,
        language: 'json',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false }
    });
    window._mainMonacoEditorRef = mainMonacoEditor;

    const jeContainer = document.getElementById('jsoneditor');
    const jeOptions = {
        mode: 'tree',
        modes: ['code', 'form', 'text', 'tree', 'view', 'preview'],
        onModeChange: (newMode, oldMode) => console.log('Mode:', oldMode, '->', newMode),
        autocomplete: {
            applyTo: ['value'],
            filter: 'contain',
            trigger: 'focus',
            getOptions: (text, path, input, editor) => new Promise((resolve, reject) => {
                const opts = extractUniqueWords(editor.get());
                opts.length > 0 ? resolve(opts) : reject();
            })
        }
    };
    const jeEditor = new JSONEditor(jeContainer, jeOptions);

    try { jeEditor.set(JSON.parse(initJSON)); } catch (_) { }

    mainMonacoEditor.onDidChangeModelContent(() => {
        try { jeEditor.set(JSON.parse(mainMonacoEditor.getValue())); } catch (_) { }
    });

    // Download
    document.getElementById('download-button').addEventListener('click', () => {
        const blob = new Blob([mainMonacoEditor.getValue()], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), { href: url, download: 'output.json' });
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
    });

    // ── autocomplete for file selector ──────────────────────────────────────

    const acConfigMtype = {
        placeHolder: "Search JSON data...",
        selector: "#autoCompleteMtype",
        data: { src: selectionMap },
        resultItem: { highlight: true },
        resultsList: {
            element: (list, data) => {
                const info = document.createElement("p");
                info.innerHTML = data.results.length
                    ? `Displaying <strong>${data.results.length}</strong> of <strong>${data.matches.length}</strong>`
                    : `Found <strong>${data.matches.length}</strong> for <strong>"${data.query}"</strong>`;
                list.prepend(info);
            },
            noResults: true, maxResults: 15, tabSelect: true
        },
        events: {
            input: {
                selection: async (event) => {
                    const sel = event.detail.selection.value;
                    autoCompleteJSMtype.input.value = sel;
                    const data = await fetchText(`${repoUrl}/main/json/${sel}`);
                    mainMonacoEditor.setValue(data);
                }
            }
        }
    };
    const autoCompleteJSMtype = new autoComplete(acConfigMtype);

    // ── jq Tab ──────────────────────────────────────────────────────────────

    const jqInputEditor = monaco.editor.create(document.getElementById('jq-input-editor'), {
        value: initJSON,
        language: 'json',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false }
    });

    const jqOutputEditor = monaco.editor.create(document.getElementById('jq-output-editor'), {
        value: '',
        language: 'json',
        theme: 'vs-dark',
        automaticLayout: true,
        readOnly: true,
        minimap: { enabled: false }
    });

    // Lazy-load jq-web (1.3 MB, only needed for jq tab)
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
        const inputText = jqInputEditor.getValue();
        jqOutputEditor.setValue('// Running...');

        let inputData;
        try {
            inputData = JSON.parse(inputText);
        } catch (e) {
            jqOutputEditor.setValue(`// JSON parse error: ${e.message}`);
            return;
        }

        try {
            const jqLib = await loadJq();
            const result = await jqLib.promised.json(inputData, query);
            jqOutputEditor.setValue(JSON.stringify(result, null, 2));
        } catch (e) {
            // jq-web throws with the jq error message
            jqOutputEditor.setValue(`// jq error: ${e.message || e}`);
        }
    }

    document.getElementById('jq-run-btn').addEventListener('click', runJqQuery);

    document.getElementById('jq-query-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !acDropdownVisible()) { e.preventDefault(); runJqQuery(); }
    });

    document.getElementById('jq-use-editor-btn').addEventListener('click', () => {
        jqInputEditor.setValue(mainMonacoEditor.getValue());
    });

    // Sync jq input when switching to jq tab
    document.getElementById('jq-tab').addEventListener('shown.bs.tab', () => {
        jqInputEditor.setValue(mainMonacoEditor.getValue());
        jqInputEditor.layout();
        jqOutputEditor.layout();
        rebuildAcPaths();
    });

    // ── jq autocomplete ──────────────────────────────────────────────────────

    // Extract dot-paths from any JSON value recursively (max depth 6)
    function extractPaths(obj, prefix = '', depth = 0) {
        const paths = new Set();
        if (depth > 6 || typeof obj !== 'object' || obj === null) return paths;
        const isArr = Array.isArray(obj);
        for (const key of Object.keys(obj)) {
            const segment = isArr ? `[${key}]` : `.${key}`;
            const full = prefix + segment;
            paths.add(full);
            for (const p of extractPaths(obj[key], full, depth + 1)) paths.add(p);
        }
        return paths;
    }

    const JQ_BUILTINS = [
        // identity / basic
        { filter: '.',                   desc: 'Identity — return input unchanged',                  tag: 'identity' },
        { filter: '.foo',                desc: 'Object field access',                                tag: 'field' },
        { filter: '.foo.bar',            desc: 'Nested field access',                                tag: 'field' },
        { filter: '.foo?',               desc: 'Optional field (suppress errors)',                   tag: 'field' },
        { filter: '.["foo"]',            desc: 'Generic object index (useful for keys with spaces)',  tag: 'field' },
        { filter: '.[0]',                desc: 'Array index',                                        tag: 'array' },
        { filter: '.[-1]',               desc: 'Last array element',                                  tag: 'array' },
        { filter: '.[2:5]',              desc: 'Array slice (index 2 to 4)',                          tag: 'array' },
        { filter: '.[]',                 desc: 'Iterate — output each element/value',                tag: 'iterate' },
        { filter: '.[]?',                desc: 'Iterate (suppress errors)',                           tag: 'iterate' },
        // pipe & construction
        { filter: '. | .foo',            desc: 'Pipe output of one filter into another',             tag: 'pipe' },
        { filter: '[.[] | .name]',       desc: 'Array construction',                                 tag: 'construct' },
        { filter: '{name:.name,age:.age}',desc:'Object construction',                                tag: 'construct' },
        { filter: '{(.key): .value}',    desc: 'Dynamic key object construction',                    tag: 'construct' },
        // types & values
        { filter: 'type',                desc: 'Return the type of a value as a string',             tag: 'type' },
        { filter: 'length',              desc: 'Length of string / array / object',                  tag: 'type' },
        { filter: 'utf8bytelength',      desc: 'Byte length of a UTF-8 string',                      tag: 'type' },
        { filter: 'keys',                desc: 'Array of object keys (sorted)',                       tag: 'type' },
        { filter: 'keys_unsorted',       desc: 'Array of object keys (insertion order)',             tag: 'type' },
        { filter: 'values',              desc: 'Array of object values',                             tag: 'type' },
        { filter: 'has("key")',          desc: 'Test if object has key / array has index',           tag: 'test' },
        { filter: 'in({"a":1})',         desc: 'Test if input key is in the given object',           tag: 'test' },
        { filter: 'map(.+1)',            desc: 'Apply filter to every element of array',             tag: 'array' },
        { filter: 'map_values(.+1)',     desc: 'Apply filter to every value of object/array',        tag: 'array' },
        { filter: 'to_entries',          desc: 'Convert object to [{key,value}] array',              tag: 'convert' },
        { filter: 'from_entries',        desc: 'Convert [{key,value}] array to object',              tag: 'convert' },
        { filter: 'with_entries(.value |= .+1)', desc: 'Map over key/value entries',                tag: 'convert' },
        // select & filter
        { filter: 'select(.age > 30)',   desc: 'Keep only inputs matching a condition',              tag: 'filter' },
        { filter: 'select(type == "number")', desc: 'Keep only numbers',                            tag: 'filter' },
        { filter: 'empty',               desc: 'Produce no output (useful to discard)',              tag: 'filter' },
        { filter: 'arrays',              desc: 'Select values that are arrays',                      tag: 'filter' },
        { filter: 'objects',             desc: 'Select values that are objects',                     tag: 'filter' },
        { filter: 'iterables',           desc: 'Select values that are iterables (arrays/objects)',  tag: 'filter' },
        { filter: 'booleans',            desc: 'Select boolean values',                              tag: 'filter' },
        { filter: 'numbers',             desc: 'Select numeric values',                              tag: 'filter' },
        { filter: 'strings',             desc: 'Select string values',                               tag: 'filter' },
        { filter: 'nulls',               desc: 'Select null values',                                 tag: 'filter' },
        { filter: 'scalars',             desc: 'Select non-iterable values',                         tag: 'filter' },
        // recursive / path
        { filter: '..',                  desc: 'Recursive descent — emit all values at all levels',  tag: 'recurse' },
        { filter: '.. | numbers',        desc: 'All numbers anywhere in the structure',              tag: 'recurse' },
        { filter: '.. | strings',        desc: 'All strings anywhere in the structure',              tag: 'recurse' },
        { filter: 'recurse',             desc: 'Same as ..',                                         tag: 'recurse' },
        { filter: 'recurse(.children[])', desc: 'Recurse via a specific path',                       tag: 'recurse' },
        { filter: 'paths',               desc: 'Output all paths in the input',                      tag: 'path' },
        { filter: 'paths(scalars)',      desc: 'Paths to all scalar (leaf) values',                  tag: 'path' },
        { filter: 'path(.foo[])',        desc: 'Output the path of a filter expression',             tag: 'path' },
        { filter: 'getpath(["a","b"])',  desc: 'Get value at path',                                  tag: 'path' },
        { filter: 'setpath(["a"];1)',    desc: 'Set value at path',                                  tag: 'path' },
        { filter: 'delpaths([["a"]])',   desc: 'Delete paths',                                       tag: 'path' },
        { filter: 'leaf_paths',          desc: 'Paths to all leaf (scalar) nodes',                   tag: 'path' },
        // string operations
        { filter: 'split(",")',          desc: 'Split string by delimiter',                          tag: 'string' },
        { filter: 'join(",")',           desc: 'Join array of strings',                              tag: 'string' },
        { filter: 'ltrimstr("prefix")',  desc: 'Remove prefix from string',                          tag: 'string' },
        { filter: 'rtrimstr("suffix")',  desc: 'Remove suffix from string',                          tag: 'string' },
        { filter: 'startswith("http")',  desc: 'Test string prefix',                                 tag: 'string' },
        { filter: 'endswith(".json")',   desc: 'Test string suffix',                                 tag: 'string' },
        { filter: 'ascii_downcase',      desc: 'Convert string to lowercase',                        tag: 'string' },
        { filter: 'ascii_upcase',        desc: 'Convert string to uppercase',                        tag: 'string' },
        { filter: 'test("regex")',       desc: 'Test string against regex',                          tag: 'string' },
        { filter: 'test("regex";"i")',   desc: 'Test string against regex with flags',               tag: 'string' },
        { filter: 'match("(\\\\w+)")',   desc: 'Return regex match object',                          tag: 'string' },
        { filter: 'capture("(?<n>\\\\w+)")', desc: 'Capture named groups as object',                tag: 'string' },
        { filter: 'scan("\\\\d+")',      desc: 'Find all non-overlapping regex matches',             tag: 'string' },
        { filter: 'gsub("a";"b")',       desc: 'Global string substitution',                         tag: 'string' },
        { filter: 'sub("a";"b")',        desc: 'First string substitution',                          tag: 'string' },
        { filter: 'tostring',            desc: 'Convert value to JSON string',                       tag: 'string' },
        { filter: 'tonumber',            desc: 'Parse string to number',                             tag: 'string' },
        { filter: 'explode',             desc: 'String to array of codepoints',                      tag: 'string' },
        { filter: 'implode',             desc: 'Array of codepoints to string',                      tag: 'string' },
        // math
        { filter: 'floor',               desc: 'Round down to integer',                              tag: 'math' },
        { filter: 'ceil',                desc: 'Round up to integer',                                tag: 'math' },
        { filter: 'round',               desc: 'Round to nearest integer',                           tag: 'math' },
        { filter: 'fabs',                desc: 'Absolute value',                                     tag: 'math' },
        { filter: 'sqrt',                desc: 'Square root',                                        tag: 'math' },
        { filter: 'pow(.; 2)',           desc: 'Power: x²',                                          tag: 'math' },
        { filter: 'log',                 desc: 'Natural logarithm',                                  tag: 'math' },
        { filter: 'log2',                desc: 'Base-2 logarithm',                                   tag: 'math' },
        { filter: 'nan',                 desc: 'Not-a-number value',                                 tag: 'math' },
        { filter: 'infinite',            desc: 'Positive infinity',                                  tag: 'math' },
        { filter: 'isinfinite',          desc: 'Test if value is infinite',                          tag: 'math' },
        { filter: 'isnan',               desc: 'Test if value is NaN',                               tag: 'math' },
        { filter: 'isnormal',            desc: 'Test if value is a normal float',                    tag: 'math' },
        // reduce & aggregation
        { filter: 'add',                 desc: 'Sum an array of numbers/strings/arrays',             tag: 'reduce' },
        { filter: 'any',                 desc: 'True if any element is truthy',                      tag: 'reduce' },
        { filter: 'any(. > 0)',          desc: 'True if any element satisfies condition',            tag: 'reduce' },
        { filter: 'all',                 desc: 'True if all elements are truthy',                    tag: 'reduce' },
        { filter: 'all(. > 0)',          desc: 'True if all elements satisfy condition',             tag: 'reduce' },
        { filter: 'flatten',             desc: 'Fully flatten nested arrays',                        tag: 'reduce' },
        { filter: 'flatten(1)',          desc: 'Flatten one level deep',                             tag: 'reduce' },
        { filter: 'range(5)',            desc: 'Produce 0..4',                                        tag: 'reduce' },
        { filter: 'range(1;5)',          desc: 'Produce 1..4',                                        tag: 'reduce' },
        { filter: 'range(0;10;2)',       desc: 'Produce 0,2,4,6,8 (step 2)',                         tag: 'reduce' },
        { filter: 'min',                 desc: 'Minimum value in array',                             tag: 'reduce' },
        { filter: 'max',                 desc: 'Maximum value in array',                             tag: 'reduce' },
        { filter: 'min_by(.age)',        desc: 'Minimum by a key',                                   tag: 'reduce' },
        { filter: 'max_by(.age)',        desc: 'Maximum by a key',                                   tag: 'reduce' },
        { filter: 'unique',              desc: 'Unique elements of array (sorted)',                  tag: 'reduce' },
        { filter: 'unique_by(.name)',    desc: 'Unique by a key',                                    tag: 'reduce' },
        { filter: 'group_by(.dept)',     desc: 'Group array elements by key value',                  tag: 'reduce' },
        { filter: 'sort',                desc: 'Sort array',                                         tag: 'reduce' },
        { filter: 'sort_by(.name)',      desc: 'Sort array by a key',                                tag: 'reduce' },
        { filter: 'sort_by(.age) | reverse', desc: 'Sort descending',                               tag: 'reduce' },
        { filter: 'reverse',             desc: 'Reverse an array',                                   tag: 'reduce' },
        { filter: 'contains({a:1})',     desc: 'Test if input contains given value',                 tag: 'reduce' },
        { filter: 'inside({a:1,b:2})',   desc: 'Test if input is contained in value',                tag: 'reduce' },
        { filter: 'indices(",")',         desc: 'Indices of occurrences in string/array',            tag: 'reduce' },
        { filter: 'index(",")',           desc: 'First index of occurrence',                         tag: 'reduce' },
        { filter: 'rindex(",")',          desc: 'Last index of occurrence',                          tag: 'reduce' },
        { filter: 'first',               desc: 'First element of array/stream',                      tag: 'reduce' },
        { filter: 'last',                desc: 'Last element of array/stream',                       tag: 'reduce' },
        { filter: 'nth(2)',              desc: 'N-th element of array/stream',                       tag: 'reduce' },
        { filter: 'limit(3;.[])',        desc: 'Take at most N results from expression',             tag: 'reduce' },
        { filter: 'until(. >= 100; . * 2)', desc: 'Repeat until condition is true',                 tag: 'reduce' },
        { filter: 'while(. < 100; . * 2)', desc: 'Produce outputs while condition holds',           tag: 'reduce' },
        { filter: 'reduce .[] as $x (0; . + $x)', desc: 'General fold/reduce over array',          tag: 'reduce' },
        { filter: '[foreach .[] as $x (0; . + $x)]', desc: 'Running total with foreach',            tag: 'reduce' },
        // format / convert
        { filter: '@base64',             desc: 'Encode string to base64',                            tag: 'format' },
        { filter: '@base64d',            desc: 'Decode base64 to string',                            tag: 'format' },
        { filter: '@uri',                desc: 'Percent-encode a string',                            tag: 'format' },
        { filter: '@csv',                desc: 'Convert array to CSV row string',                    tag: 'format' },
        { filter: '@tsv',                desc: 'Convert array to TSV row string',                    tag: 'format' },
        { filter: '@html',               desc: 'HTML-escape a string',                               tag: 'format' },
        { filter: '@json',               desc: 'Serialize to compact JSON string',                   tag: 'format' },
        { filter: '@text',               desc: 'Identity (same as tostring for strings)',            tag: 'format' },
        { filter: '@sh',                 desc: 'Shell-quote a string',                               tag: 'format' },
        { filter: 'tojson',              desc: 'Convert to compact JSON string',                     tag: 'format' },
        { filter: 'fromjson',            desc: 'Parse a JSON string',                                tag: 'format' },
        { filter: 'ascii',               desc: 'Integer to/from ASCII character',                    tag: 'format' },
        // conditionals / error
        { filter: 'if .age > 18 then "adult" else "minor" end', desc: 'if-then-else',              tag: 'logic' },
        { filter: '.foo // "default"',   desc: 'Alternative operator — use default if null/false',  tag: 'logic' },
        { filter: 'not',                 desc: 'Boolean negation',                                   tag: 'logic' },
        { filter: 'error("msg")',        desc: 'Abort with an error message',                        tag: 'logic' },
        { filter: 'try . catch "err"',   desc: 'Catch errors and provide fallback',                  tag: 'logic' },
        { filter: 'try-catch',           desc: 'Catch errors (general pattern)',                     tag: 'logic' },
        { filter: 'label-break',         desc: 'Named break out of a generator loop',               tag: 'logic' },
        // variables / def
        { filter: '. as $x | $x * $x',  desc: 'Bind value to a variable',                           tag: 'var' },
        { filter: 'def double: . * 2; [.[] | double]', desc: 'Define and call a local function',    tag: 'var' },
        // misc
        { filter: 'env',                 desc: 'Access environment variables (CLI only)',            tag: 'misc' },
        { filter: '$ENV',                desc: 'Access $ENV object (CLI only)',                      tag: 'misc' },
        { filter: 'debug',               desc: 'Print value to stderr and pass through',            tag: 'misc' },
        { filter: 'debug("msg")',        desc: 'Print labelled debug message to stderr',             tag: 'misc' },
        { filter: 'stderr',              desc: 'Print input to stderr and pass through',             tag: 'misc' },
        { filter: 'input',               desc: 'Read next input (CLI only)',                         tag: 'misc' },
        { filter: 'inputs',              desc: 'Read all remaining inputs (CLI only)',               tag: 'misc' },
        { filter: 'null',                desc: 'Null literal',                                       tag: 'misc' },
        { filter: 'true',                desc: 'True literal',                                       tag: 'misc' },
        { filter: 'false',               desc: 'False literal',                                      tag: 'misc' },
        { filter: 'infinite',            desc: 'IEEE 754 infinity',                                  tag: 'misc' },
        { filter: 'builtins',            desc: 'Array of all builtin function names',               tag: 'misc' },
        { filter: 'modulemeta',          desc: 'Module metadata',                                    tag: 'misc' },
        // practical recipes
        { filter: '[.[] | select(.status == "active")]',  desc: 'Filter array by field value',      tag: 'recipe' },
        { filter: '[.[] | {id,name}]',                    desc: 'Project specific fields from array',tag: 'recipe' },
        { filter: 'group_by(.dept) | map({dept:.[0].dept, count:length})', desc: 'Count by group',  tag: 'recipe' },
        { filter: '[.[] | .price] | add / length',        desc: 'Average of a numeric field',       tag: 'recipe' },
        { filter: '[to_entries[] | select(.value != null) | .key]', desc: 'Keys with non-null values',tag:'recipe'},
        { filter: 'walk(if type == "string" then ascii_upcase else . end)', desc: 'Transform all strings in tree', tag: 'recipe' },
        { filter: '[.. | .id? | select(. != null)]',      desc: 'Extract all "id" fields anywhere', tag: 'recipe' },
        { filter: 'keys[] as $k | .[$k] |= . + 1',       desc: 'Increment every numeric field',    tag: 'recipe' },
        { filter: '[.[] | {(.name): .value}] | add',      desc: 'Array of {name,value} to object',  tag: 'recipe' },
        { filter: 'del(.foo)',                             desc: 'Delete a field',                   tag: 'recipe' },
        { filter: 'del(.[] | .secret)',                    desc: 'Delete field from every array item',tag:'recipe' },
    ];

    // Group builtins by tag for the help panel
    const TAG_ORDER = [
        ['recipe',   'Practical Recipes'],
        ['identity', 'Identity & Basic'],
        ['field',    'Field / Index Access'],
        ['array',    'Arrays'],
        ['iterate',  'Iteration'],
        ['pipe',     'Pipe & Construction'],
        ['construct','Construction'],
        ['type',     'Types & Inspection'],
        ['filter',   'Select & Filter'],
        ['recurse',  'Recursive Descent'],
        ['path',     'Paths'],
        ['string',   'Strings & Regex'],
        ['math',     'Math'],
        ['reduce',   'Reduce & Aggregation'],
        ['format',   'Format & Encode'],
        ['logic',    'Conditionals & Errors'],
        ['var',      'Variables & Functions'],
        ['convert',  'Conversion'],
        ['test',     'Testing'],
        ['misc',     'Miscellaneous'],
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
            html += `</div>`;
        }
        body.innerHTML = html;

        // click-to-use
        body.addEventListener('click', (e) => {
            const row = e.target.closest('.jq-example');
            if (!row) return;
            document.getElementById('jq-query-input').value = row.dataset.filter;
            closeHelpDrawer();
        });
    }

    buildHelpPanel();

    // search
    document.getElementById('jq-help-search').addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('.jq-example').forEach(el => {
            const match = !q || el.dataset.filter.toLowerCase().includes(q) || el.dataset.desc.toLowerCase().includes(q);
            el.classList.toggle('hidden', !match);
        });
        document.querySelectorAll('.jq-help-section').forEach(sec => {
            const anyVisible = [...sec.querySelectorAll('.jq-example')].some(el => !el.classList.contains('hidden'));
            sec.classList.toggle('hidden', !anyVisible);
        });
    });

    function openHelpDrawer() {
        document.getElementById('jq-help-overlay').classList.add('open');
        document.getElementById('jq-help-drawer').classList.add('open');
        document.getElementById('jq-help-search').value = '';
        // reset any previous search filter
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

    // ── jq query autocomplete ────────────────────────────────────────────────

    let acPaths = [];   // dot-paths extracted from current JSON
    let acActive = -1;  // highlighted dropdown item index

    function rebuildAcPaths() {
        try {
            const data = JSON.parse(jqInputEditor.getValue());
            acPaths = [...extractPaths(data)];
        } catch (_) { acPaths = []; }
    }
    rebuildAcPaths();

    // Also rebuild whenever the jq input editor content changes
    jqInputEditor.onDidChangeModelContent(() => rebuildAcPaths());

    const jqQueryInput = document.getElementById('jq-query-input');
    let acDropdown = null;

    function acDropdownVisible() { return acDropdown && acDropdown.style.display !== 'none'; }

    function getAcItems(text) {
        // match the last "word token" (a run of non-space chars at the cursor end)
        const token = text.match(/(\S*)$/)?.[1] ?? '';
        if (!token) return [];

        const lower = token.toLowerCase();
        const pathMatches = acPaths.filter(p => p.toLowerCase().includes(lower)).slice(0, 10)
            .map(p => ({ label: p, tag: 'path' }));
        const builtinMatches = JQ_BUILTINS.filter(b =>
            b.filter.toLowerCase().startsWith(lower) && !pathMatches.find(m => m.label === b.filter)
        ).slice(0, 10).map(b => ({ label: b.filter, tag: b.tag }));

        return [...pathMatches, ...builtinMatches].slice(0, 15);
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
            el.addEventListener('mousedown', (e) => {
                e.preventDefault();
                applyAcItem(el.dataset.value);
            });
        });
    }

    function hideAcDropdown() {
        if (acDropdown) acDropdown.style.display = 'none';
        acActive = -1;
    }

    function applyAcItem(value) {
        // replace last token in the input
        jqQueryInput.value = jqQueryInput.value.replace(/(\S*)$/, value);
        hideAcDropdown();
        jqQueryInput.focus();
    }

    jqQueryInput.addEventListener('input', () => {
        const items = getAcItems(jqQueryInput.value);
        if (items.length) showAcDropdown(items); else hideAcDropdown();
    });

    jqQueryInput.addEventListener('keydown', (e) => {
        if (!acDropdownVisible()) return;
        const rows = acDropdown.querySelectorAll('.jq-ac-item');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            acActive = Math.min(acActive + 1, rows.length - 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            acActive = Math.max(acActive - 1, 0);
        } else if (e.key === 'Tab' || e.key === 'Enter') {
            if (acActive >= 0) { e.preventDefault(); applyAcItem(rows[acActive].dataset.value); return; }
            hideAcDropdown();
            return;
        } else if (e.key === 'Escape') {
            hideAcDropdown(); return;
        } else { return; }
        rows.forEach((r, i) => r.classList.toggle('active', i === acActive));
        if (acActive >= 0) rows[acActive].scrollIntoView({ block: 'nearest' });
    });

    document.addEventListener('click', (e) => {
        if (e.target !== jqQueryInput) hideAcDropdown();
    });

    // ── Diff Tab ─────────────────────────────────────────────────────────────

    const sampleB = JSON.stringify({
        "browsers": ["Chrome", "Safari", "Firefox", "Brave"],
        "chrome_is_best": false,
        "pollution": null,
        "pi": 3.14159,
        "gems": { "unix": ["ken", "dmr", "thompson"], "c": ["dmr"] },
        "greeting": "Hello World!"
    }, null, 2);

    const diffEditorA = monaco.editor.create(document.getElementById('diff-editor-a'), {
        value: initJSON,
        language: 'json',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false }
    });

    const diffEditorB = monaco.editor.create(document.getElementById('diff-editor-b'), {
        value: sampleB,
        language: 'json',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false }
    });

    // File loaders for diff inputs
    function attachFileLoader(inputId, editor) {
        document.getElementById(inputId).addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => editor.setValue(ev.target.result);
            reader.readAsText(file);
        });
    }
    attachFileLoader('diff-file-a', diffEditorA);
    attachFileLoader('diff-file-b', diffEditorB);

    document.getElementById('diff-use-editor-btn').addEventListener('click', () => {
        diffEditorA.setValue(mainMonacoEditor.getValue());
    });

    // Semantic diff using deep-diff
    document.getElementById('diff-semantic-btn').addEventListener('click', () => {
        const status = document.getElementById('diff-status');
        document.getElementById('monaco-diff-container').style.display = 'none';
        document.getElementById('diff-results').style.display = '';

        let jsonA, jsonB;
        try { jsonA = JSON.parse(diffEditorA.getValue()); } catch (e) { status.textContent = `JSON A error: ${e.message}`; return; }
        try { jsonB = JSON.parse(diffEditorB.getValue()); } catch (e) { status.textContent = `JSON B error: ${e.message}`; return; }

        const diffs = DeepDiff.diff(jsonA, jsonB) || [];
        const container = document.getElementById('diff-results');

        if (diffs.length === 0) {
            container.innerHTML = '<p class="text-success p-3">&#10003; No differences found — the two JSON objects are semantically identical.</p>';
            status.textContent = '';
            return;
        }

        const kindLabel = { N: 'Added', D: 'Deleted', E: 'Edited', A: 'Array' };
        const kindDesc  = {
            N: 'New property/value added',
            D: 'Property/value deleted',
            E: 'Value changed',
            A: 'Array element changed'
        };

        let rows = diffs.map(d => {
            const path = (d.path || []).join('.');
            const kind = d.kind;
            let lhs = '', rhs = '';

            if (kind === 'E') {
                lhs = JSON.stringify(d.lhs);
                rhs = JSON.stringify(d.rhs);
            } else if (kind === 'N') {
                rhs = JSON.stringify(d.rhs);
            } else if (kind === 'D') {
                lhs = JSON.stringify(d.lhs);
            } else if (kind === 'A') {
                const idx = d.index;
                const item = d.item;
                lhs = item.kind === 'D' ? JSON.stringify(item.lhs) : '';
                rhs = item.kind === 'N' ? JSON.stringify(item.rhs) : '';
                return `<tr class="diff-kind-${kind}">
                    <td><span class="badge-${kind}">${kindLabel[kind]}</span></td>
                    <td>${escHtml(path)}[${idx}]</td>
                    <td>${escHtml(lhs)}</td>
                    <td>${escHtml(rhs)}</td>
                    <td>${kindDesc[kind]}</td>
                </tr>`;
            }

            return `<tr class="diff-kind-${kind}">
                <td><span class="badge-${kind}">${kindLabel[kind]}</span></td>
                <td>${escHtml(path)}</td>
                <td>${escHtml(lhs)}</td>
                <td>${escHtml(rhs)}</td>
                <td>${kindDesc[kind]}</td>
            </tr>`;
        }).join('');

        container.innerHTML = `
            <p class="text-warning p-2 mb-0">Found <strong>${diffs.length}</strong> semantic difference(s)</p>
            <table class="diff-table">
                <thead><tr><th>Type</th><th>Path</th><th>A (original)</th><th>B (modified)</th><th>Description</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>`;
        status.textContent = `${diffs.length} difference(s)`;
    });

    // Verbatim diff using Monaco diff editor
    let monacoDiffEditor = null;

    // Container is position:absolute inset:0 so offsetWidth/Height are always real.
    const diffContainerEl = document.getElementById('monaco-diff-container');

    function relayoutDiffEditor() {
        if (!monacoDiffEditor) return;
        const { offsetWidth: w, offsetHeight: h } = diffContainerEl;
        if (w > 0 && h > 0) monacoDiffEditor.layout({ width: w, height: h });
    }

    // ResizeObserver keeps Monaco in sync whenever the splitter is dragged.
    new ResizeObserver(() => relayoutDiffEditor()).observe(diffContainerEl);

    document.getElementById('diff-verbatim-btn').addEventListener('click', () => {
        const status    = document.getElementById('diff-status');
        const resultsEl = document.getElementById('diff-results');

        resultsEl.style.display    = 'none';
        diffContainerEl.style.display = 'block';

        const textA = diffEditorA.getValue();
        const textB = diffEditorB.getValue();

        let prettyA = textA, prettyB = textB;
        try { prettyA = JSON.stringify(JSON.parse(textA), null, 2); } catch (_) { }
        try { prettyB = JSON.stringify(JSON.parse(textB), null, 2); } catch (_) { }

        if (monacoDiffEditor) {
            monacoDiffEditor.getModel().original.setValue(prettyA);
            monacoDiffEditor.getModel().modified.setValue(prettyB);
            relayoutDiffEditor();
        } else {
            // One rAF so the browser paints display:block before Monaco reads dimensions.
            requestAnimationFrame(() => {
                monacoDiffEditor = monaco.editor.createDiffEditor(diffContainerEl, {
                    theme: 'vs-dark',
                    automaticLayout: false,
                    readOnly: true,
                    renderSideBySide: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false
                });
                monacoDiffEditor.setModel({
                    original: monaco.editor.createModel(prettyA, 'json'),
                    modified: monaco.editor.createModel(prettyB, 'json')
                });
                monacoDiffEditor.onDidUpdateDiff(() => {
                    const changes = monacoDiffEditor.getLineChanges() || [];
                    status.textContent = `${changes.length} changed region(s)`;
                });
                relayoutDiffEditor();
            });
        }
    });

    // Relayout diff editors when tab shown
    document.getElementById('diff-tab-nav').addEventListener('shown.bs.tab', () => {
        diffEditorA.layout();
        diffEditorB.layout();
        relayoutDiffEditor();
    });

    // ── diff pane drag splitter ──────────────────────────────────────────────
    (function () {
        const row    = document.getElementById('diff-inputs-row');
        const colA   = document.getElementById('diff-col-a');
        const colB   = document.getElementById('diff-col-b');
        const gutter = document.getElementById('diff-gutter');
        const GUTTER_W = 8;
        let dragging = false, startX = 0, startAW = 0;

        gutter.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            dragging = true;
            startX  = e.clientX;
            startAW = colA.getBoundingClientRect().width;
            gutter.classList.add('dragging');
            gutter.setPointerCapture(e.pointerId);
        });

        gutter.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            const total = row.getBoundingClientRect().width - GUTTER_W;
            const delta = e.clientX - startX;
            const newAW = Math.min(Math.max(startAW + delta, total * 0.1), total * 0.9);
            colA.style.flex = `0 0 ${newAW}px`;
            colB.style.flex = `0 0 ${total - newAW}px`;
            diffEditorA.layout();
            diffEditorB.layout();
            relayoutDiffEditor();
        });

        gutter.addEventListener('pointerup', () => {
            dragging = false;
            gutter.classList.remove('dragging');
        });

        gutter.addEventListener('lostpointercapture', () => {
            dragging = false;
            gutter.classList.remove('dragging');
        });
    }());

    // ── diff horizontal splitter (editors ↕ results) ────────────────────────
    (function () {
        const pane    = document.getElementById('diff-pane');
        const topRow  = document.getElementById('diff-inputs-row');
        const hGutter = document.getElementById('diff-h-gutter');
        const GUTTER_H = 8;
        let dragging = false, startY = 0, startTopH = 0;

        hGutter.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            dragging  = true;
            startY    = e.clientY;
            startTopH = topRow.getBoundingClientRect().height;
            hGutter.classList.add('dragging');
            hGutter.setPointerCapture(e.pointerId);
        });

        hGutter.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            const paneH = pane.getBoundingClientRect().height;
            const total = paneH - GUTTER_H;
            const delta = e.clientY - startY;
            const newH  = Math.min(Math.max(startTopH + delta, total * 0.1), total * 0.85);
            topRow.style.flex = `0 0 ${newH}px`;
            diffEditorA.layout();
            diffEditorB.layout();
            relayoutDiffEditor();
        });

        hGutter.addEventListener('pointerup', () => {
            dragging = false;
            hGutter.classList.remove('dragging');
        });

        hGutter.addEventListener('lostpointercapture', () => {
            dragging = false;
            hGutter.classList.remove('dragging');
        });
    }());

    // ── Split (Editor tab only) ──────────────────────────────────────────────

    Split(["#content", "#je"], { sizes: [45, 55] });

});

// ─── File input (main editor tab) ────────────────────────────────────────────

document.getElementById('jsonFileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        // mainMonacoEditor is set inside require callback; use a small delay if needed
        if (window._mainMonacoEditorRef) {
            window._mainMonacoEditorRef.setValue(e.target.result);
        }
    };
    reader.readAsText(file);
});

// Expose drag-and-drop on the dropArea (same as before)
const dropArea = document.getElementById('dropArea');
dropArea.addEventListener('dragenter', (e) => e.preventDefault(), false);
dropArea.addEventListener('dragover',  (e) => e.preventDefault(), false);
dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files.length) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        if (window._mainMonacoEditorRef) window._mainMonacoEditorRef.setValue(ev.target.result);
    };
    reader.readAsText(files[0]);
}, false);

// ─── HTML escape helper ───────────────────────────────────────────────────────

function escHtml(s) {
    return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
