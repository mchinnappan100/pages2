/* ─────────────────────────────────────────────────────────────
   Mastering TypeScript — Application Logic
   Curriculum · Lessons · Monaco · Simulation · AI Chat
───────────────────────────────────────────────────────────── */

// ─────────────────────────────────────────
// CURRICULUM
// ─────────────────────────────────────────
const CURRICULUM = {
  basic: [
    { id:'hello',       icon:'👋', name:'Hello, TypeScript',      tag:'basic' },
    { id:'primitives',  icon:'📦', name:'Primitives & Variables',  tag:'basic' },
    { id:'functions',   icon:'⚡', name:'Functions & Signatures',  tag:'basic' },
    { id:'objects',     icon:'🏗', name:'Objects & Interfaces',    tag:'basic' },
    { id:'arrays',      icon:'📋', name:'Arrays & Tuples',         tag:'basic' },
    { id:'unions',      icon:'🔀', name:'Unions & Literals',       tag:'basic' },
    { id:'narrowing',   icon:'🔍', name:'Type Narrowing',          tag:'basic' },
    { id:'classes',     icon:'🎓', name:'Classes & Access',        tag:'basic' },
    { id:'enums',       icon:'🔣', name:'Enums',                   tag:'basic' },
    { id:'modules',     icon:'📦', name:'Modules & Imports',       tag:'basic' },
  ],
  medium: [
    { id:'generics',    icon:'🔮', name:'Generics',                tag:'medium' },
    { id:'utility',     icon:'🛠', name:'Utility Types',           tag:'medium' },
    { id:'mapped',      icon:'🗺', name:'Mapped Types',            tag:'medium' },
    { id:'conditional', icon:'❓', name:'Conditional Types',       tag:'medium' },
    { id:'infer',       icon:'🧠', name:'infer & Template Literals',tag:'medium', badge:'4.1+' },
    { id:'decorators',  icon:'🎨', name:'Decorators',              tag:'medium', badge:'5.0+' },
    { id:'async',       icon:'🌊', name:'Async & Promises',        tag:'medium' },
    { id:'errors',      icon:'⚠️', name:'Error Handling',          tag:'medium' },
  ],
  advanced: [
    { id:'discriminated',icon:'🏷', name:'Discriminated Unions',   tag:'advanced' },
    { id:'variance',    icon:'↕️', name:'Variance & Brands',       tag:'advanced' },
    { id:'patterns',    icon:'🧩', name:'Design Patterns',         tag:'advanced' },
    { id:'react',       icon:'⚛️', name:'React & TSX',             tag:'advanced', badge:'react' },
    { id:'node',        icon:'🟩', name:'Node.js & APIs',          tag:'advanced', badge:'node' },
    { id:'testing',     icon:'🧪', name:'Testing with Vitest',     tag:'advanced' },
    { id:'config',      icon:'⚙️', name:'tsconfig & Tooling',      tag:'advanced' },
    { id:'perf',        icon:'📈', name:'Performance & Patterns',  tag:'advanced', badge:'perf' },
  ]
};

// ─────────────────────────────────────────
// LESSONS
// ─────────────────────────────────────────
const LESSONS = {};
function L(id, title, level, code, html) {
  LESSONS[id] = { title, level, code, content: () => html };
}

L('hello','Hello, TypeScript','basic',
`// TypeScript = JavaScript + static types
// Compiled to JS — runs anywhere JS runs

const message: string = "Hello, TypeScript!";
console.log(message);

// Types are erased at runtime — pure JS output
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));

// Type inference — TypeScript is smart
let count = 0;        // inferred: number
let flag  = true;     // inferred: boolean
let title = "TS";     // inferred: string

// count = "oops";    // ✗ Error: Type 'string' not assignable to type 'number'

// const is preferred — immutable bindings
const PI = 3.14159;   // inferred: 3.14159 (literal type)
const arr = [1, 2, 3]; // inferred: number[]

console.log({ count, flag, title, PI, arr });`,
`<div class="lesson-h2">What is TypeScript?</div>
<p class="lesson-p">TypeScript is a <strong>typed superset of JavaScript</strong> developed by Microsoft. It adds a powerful type system on top of JS — catching bugs at compile time before they reach production. All valid JS is valid TS.</p>
<div class="callout callout-info"><div class="callout-icon">ℹ️</div><div class="callout-body"><div class="callout-title">Why TypeScript?</div><div class="callout-text">TypeScript powers Angular, used across Google, powers Deno, Bun, and most major modern frameworks. VS Code itself is written in TypeScript. The type system eliminates entire categories of runtime bugs and makes large codebases maintainable.</div></div></div>
<div class="lesson-h2">Your First TypeScript</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm">// Explicit annotation</span>
<span class="kw">const</span> name: <span class="ty">string</span> = <span class="st">"Alice"</span>;
<span class="cm">// Inferred — same result, less noise</span>
<span class="kw">const</span> age = <span class="nm">30</span>;  <span class="cm">// TypeScript knows this is number</span>
<span class="kw">function</span> <span class="fn">greet</span>(who: <span class="ty">string</span>): <span class="ty">string</span> {
  <span class="kw">return</span> <span class="st">\`Hello, \${who}!\`</span>;
}
<span class="cm">// greet(42)  ← compile error, not runtime error</span></pre></div>
<div class="lesson-h2">Setup</div>
<div class="compile-box"><div class="cbox-title">🔧 Getting Started</div>
<div class="c-step"><div class="c-num">1</div><div><div class="c-cmd">npm install -g typescript && tsc --version</div><div class="c-desc">Install the TypeScript compiler globally.</div></div></div>
<div class="c-step"><div class="c-num">2</div><div><div class="c-cmd">tsc main.ts && node main.js</div><div class="c-desc">Compile then run. Or use <code>ts-node main.ts</code> directly.</div></div></div>
<div class="c-step"><div class="c-num">3</div><div><div class="c-cmd">npm create vite@latest my-app -- --template vanilla-ts</div><div class="c-desc">Modern TS project with Vite — zero config needed.</div></div></div>
<div class="c-step"><div class="c-num">4</div><div><div class="c-cmd">npx tsx watch main.ts</div><div class="c-desc"><code>tsx</code> is the fastest way to run TS files during development.</div></div></div></div>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">Types are erased</div><div class="callout-text">TypeScript types only exist at compile time. The output is plain JavaScript — no type information survives to runtime. This means zero overhead and full compatibility with any JS runtime.</div></div></div>`);

L('primitives','Primitives & Variables','basic',
`// The seven primitive types
let b: boolean  = true;
let n: number   = 42;        // no int/float split
let s: string   = "hello";
let bi: bigint  = 9007199254740993n;
let sym: symbol = Symbol("id");
let u: undefined = undefined;
let nul: null   = null;

// Special types
let anything: any     = "starts as string";
anything              = 42;  // any disables type checking — avoid!

let flexible: unknown = fetch("/api");  // safer than any
// flexible.json()  ← Error: must narrow first

function process(val: unknown): string {
  if (typeof val === "string") return val.toUpperCase();
  if (typeof val === "number") return val.toFixed(2);
  return String(val);
}

// never — type of functions that never return
function fail(msg: string): never {
  throw new Error(msg);
}

// void — functions that return nothing
function log(x: string): void {
  console.log(x);
}

// Type assertions (use sparingly)
const input = document.getElementById("id") as HTMLInputElement;
const len = (someValue as string).length;

console.log(process("hello"), process(3.14159));
console.log(typeof b, typeof n, typeof s);`,
`<div class="lesson-h2">Primitive Types</div>
<p class="lesson-p">TypeScript has seven primitive types matching JavaScript, plus special types like <code>any</code>, <code>unknown</code>, <code>never</code>, and <code>void</code>. The key principle: <strong>prefer the most specific type possible</strong>.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Primitives</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">let</span> n: <span class="ty">number</span>  = <span class="nm">42</span>;
<span class="kw">let</span> s: <span class="ty">string</span>  = <span class="st">"hello"</span>;
<span class="kw">let</span> b: <span class="ty">boolean</span> = <span class="kw">true</span>;
<span class="kw">let</span> bi: <span class="ty">bigint</span> = <span class="nm">9007199254740993n</span>;
<span class="kw">let</span> u: <span class="ty">undefined</span>;
<span class="kw">let</span> nul: <span class="ty">null</span> = <span class="kw">null</span>;</pre></div>
<div class="lesson-h2">Special Types</div>
<table class="ref-table">
<tr><th>Type</th><th>Meaning</th><th>Use when</th></tr>
<tr><td>any</td><td>Disables type checking</td><td>Migrating from JS — avoid otherwise</td></tr>
<tr><td>unknown</td><td>Type-safe any</td><td>External data, must narrow before use</td></tr>
<tr><td>never</td><td>Unreachable type</td><td>Throw-only functions, exhaustive checks</td></tr>
<tr><td>void</td><td>No return value</td><td>Functions with side-effects only</td></tr>
<tr><td>object</td><td>Non-primitive</td><td>Rare — use specific interfaces instead</td></tr>
</table>
<div class="callout callout-warn"><div class="callout-icon">⚠️</div><div class="callout-body"><div class="callout-title">Avoid any — use unknown</div><div class="callout-text"><code>any</code> silently disables all type checking and propagates. Use <code>unknown</code> instead — it forces you to narrow the type before using it, keeping safety intact.</div></div></div>`);

L('functions','Functions & Signatures','basic',
`// Function declarations with full types
function add(a: number, b: number): number {
  return a + b;
}

// Arrow functions
const multiply = (x: number, y: number): number => x * y;

// Optional and default parameters
function greet(name: string, greeting = "Hello"): string {
  return \`\${greeting}, \${name}!\`;
}

// Rest parameters
function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

// Function overloads
function format(x: number): string;
function format(x: string): string;
function format(x: number | string): string {
  return typeof x === "number" ? x.toFixed(2) : x.trim();
}

// Function type signatures
type Predicate<T> = (item: T) => boolean;
type Transform<T, U> = (item: T) => U;

const isEven: Predicate<number> = n => n % 2 === 0;
const toString: Transform<number, string> = n => String(n);

// Higher-order functions
function filter<T>(arr: T[], pred: Predicate<T>): T[] {
  return arr.filter(pred);
}

console.log(add(2, 3));
console.log(greet("Alice"));
console.log(greet("Bob", "Hi"));
console.log(sum(1, 2, 3, 4, 5));
console.log(format(3.14159));
console.log(format("  hello  "));
console.log(filter([1, 2, 3, 4, 5, 6], isEven));`,
`<div class="lesson-h2">Function Types</div>
<p class="lesson-p">TypeScript functions can be fully typed — parameters, return values, overloads, and generic signatures. The compiler verifies every call site.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Functions</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm">// Named function</span>
<span class="kw">function</span> <span class="fn">add</span>(a: <span class="ty">number</span>, b: <span class="ty">number</span>): <span class="ty">number</span> { <span class="kw">return</span> a + b; }
<span class="cm">// Arrow function</span>
<span class="kw">const</span> mul = (x: <span class="ty">number</span>, y: <span class="ty">number</span>): <span class="ty">number</span> => x * y;
<span class="cm">// Optional param, default param</span>
<span class="kw">function</span> <span class="fn">greet</span>(name: <span class="ty">string</span>, title?: <span class="ty">string</span>): <span class="ty">string</span> {
  <span class="kw">return</span> <span class="st">\`\${title ?? ""} \${name}\`</span>.trim();
}
<span class="cm">// Rest params</span>
<span class="kw">function</span> <span class="fn">sum</span>(...nums: <span class="ty">number</span>[]): <span class="ty">number</span> { <span class="kw">return</span> nums.reduce((a,b) => a+b, <span class="nm">0</span>); }</pre></div>
<div class="lesson-h2">Function Overloads</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Overloads</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm">// Declare overloads first, then implementation</span>
<span class="kw">function</span> <span class="fn">parse</span>(x: <span class="ty">string</span>): <span class="ty">number</span>;
<span class="kw">function</span> <span class="fn">parse</span>(x: <span class="ty">number</span>): <span class="ty">string</span>;
<span class="kw">function</span> <span class="fn">parse</span>(x: <span class="ty">string</span> | <span class="ty">number</span>): <span class="ty">number</span> | <span class="ty">string</span> {
  <span class="kw">return</span> <span class="kw">typeof</span> x === <span class="st">"string"</span> ? +x : String(x);
}</pre></div>`);

L('objects','Objects & Interfaces','basic',
`// Interface: the primary way to describe object shapes
interface User {
  readonly id: number;   // can't be reassigned
  name: string;
  email?: string;        // optional
}

// Type alias — also common for objects
type Point = {
  x: number;
  y: number;
};

// Interfaces can be extended
interface Admin extends User {
  role: "admin" | "superadmin";
  permissions: string[];
}

// Declaration merging (only interfaces, not type aliases)
interface Window {
  myCustomProp: string;  // extends existing Window type
}

// Index signatures
interface StringMap {
  [key: string]: string;
}

const config: StringMap = {
  host: "localhost",
  port: "8080",
};

// Implementing interfaces in classes
interface Serializable {
  toJSON(): string;
}

class UserRecord implements User, Serializable {
  readonly id: number;
  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  toJSON(): string {
    return JSON.stringify({ id: this.id, name: this.name });
  }
}

const alice: Admin = { id: 1, name: "Alice", role: "admin", permissions: ["read", "write"] };
const rec = new UserRecord(2, "Bob");
console.log(alice);
console.log(rec.toJSON());`,
`<div class="lesson-h2">Interfaces</div>
<p class="lesson-p">Interfaces define the <strong>shape</strong> of objects. They're open (extendable via declaration merging), which makes them ideal for public APIs and library contracts.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — interface</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">interface</span> <span class="ty">User</span> {
  <span class="kw">readonly</span> id: <span class="ty">number</span>;   <span class="cm">// immutable after creation</span>
  name: <span class="ty">string</span>;
  email?: <span class="ty">string</span>;        <span class="cm">// optional property</span>
}
<span class="cm">// Extend interfaces</span>
<span class="kw">interface</span> <span class="ty">Admin</span> <span class="kw">extends</span> <span class="ty">User</span> {
  role: <span class="ty">"admin"</span> | <span class="ty">"superadmin"</span>;
}
<span class="cm">// Implement in class</span>
<span class="kw">class</span> <span class="ty">UserRecord</span> <span class="kw">implements</span> <span class="ty">User</span> { ... }</pre></div>
<div class="lesson-h2">interface vs type</div>
<table class="ref-table">
<tr><th>Feature</th><th>interface</th><th>type</th></tr>
<tr><td>Object shapes</td><td>✓</td><td>✓</td></tr>
<tr><td>Extension</td><td>extends</td><td>&amp; intersection</td></tr>
<tr><td>Declaration merging</td><td>✓</td><td>✗</td></tr>
<tr><td>Union types</td><td>✗</td><td>✓</td></tr>
<tr><td>Mapped/conditional</td><td>✗</td><td>✓</td></tr>
<tr><td>Tuple types</td><td>✗</td><td>✓</td></tr>
</table>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">Rule of thumb</div><div class="callout-text">Use <code>interface</code> for object shapes and public APIs (supports merging). Use <code>type</code> for unions, intersections, mapped types, and aliases for primitives or tuples.</div></div></div>`);

L('arrays','Arrays & Tuples','basic',
`// Arrays
const nums: number[] = [1, 2, 3, 4, 5];
const strs: Array<string> = ["a", "b", "c"];  // generic syntax

// Readonly arrays — prevents mutation
const fixed: readonly number[] = [1, 2, 3];
// fixed.push(4)  ← Error: push does not exist on readonly

// Tuples — fixed-length, typed positions
type Point2D = [number, number];
type RGB = [number, number, number];
type NamedPoint = [x: number, y: number];  // labeled tuple

const p: Point2D = [3, 4];
const red: RGB = [255, 0, 0];

// Tuple with rest
type AtLeastTwo = [number, number, ...number[]];
const many: AtLeastTwo = [1, 2, 3, 4, 5];

// Destructuring tuples
const [x, y] = p;
console.log(\`Point: (\${x}, \${y})\`);

// Array methods are fully typed
const doubled = nums.map(n => n * 2);           // number[]
const evens   = nums.filter(n => n % 2 === 0);  // number[]
const total   = nums.reduce((a, b) => a + b, 0); // number

// Spread and rest
const combined = [...nums, ...doubled];
function first<T>([head, ...tail]: T[]): T | undefined {
  return head;
}

console.log(doubled, evens, total);
console.log(combined.slice(0, 5));
console.log(first(["a", "b", "c"]));`,
`<div class="lesson-h2">Arrays</div>
<p class="lesson-p">TypeScript arrays are generic collections. All array methods (<code>map</code>, <code>filter</code>, <code>reduce</code>, etc.) return correctly typed results — no casting needed.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Arrays</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">const</span> nums: <span class="ty">number</span>[] = [<span class="nm">1</span>, <span class="nm">2</span>, <span class="nm">3</span>];
<span class="kw">const</span> strs: <span class="ty">Array</span>&lt;<span class="ty">string</span>&gt; = [<span class="st">"a"</span>, <span class="st">"b"</span>];
<span class="kw">const</span> fixed: <span class="kw">readonly</span> <span class="ty">number</span>[] = [<span class="nm">1</span>, <span class="nm">2</span>, <span class="nm">3</span>];
<span class="cm">// fixed.push(4)  ← compile error</span>
<span class="kw">const</span> doubled = nums.map(n => n * <span class="nm">2</span>); <span class="cm">// number[]</span>
<span class="kw">const</span> total = nums.reduce((a, b) => a + b, <span class="nm">0</span>); <span class="cm">// number</span></pre></div>
<div class="lesson-h2">Tuples</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Tuples</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm">// Fixed-length, each position has a specific type</span>
<span class="kw">type</span> <span class="ty">Point</span>  = [<span class="ty">number</span>, <span class="ty">number</span>];
<span class="kw">type</span> <span class="ty">Entry</span>  = [<span class="ty">string</span>, <span class="ty">number</span>];
<span class="kw">type</span> <span class="ty">Coords</span> = [x: <span class="ty">number</span>, y: <span class="ty">number</span>, z?: <span class="ty">number</span>];
<span class="cm">// Tuple with rest — at least two numbers</span>
<span class="kw">type</span> <span class="ty">AtLeastTwo</span> = [<span class="ty">number</span>, <span class="ty">number</span>, ...<span class="ty">number</span>[]];
<span class="kw">const</span> [x, y] = [<span class="nm">3</span>, <span class="nm">4</span>] <span class="kw">as</span> <span class="ty">Point</span>;</pre></div>`);

L('unions','Unions & Literals','basic',
`// Union types — one of several types
type ID = number | string;
type Status = "active" | "inactive" | "pending";  // literal union
type Direction = "north" | "south" | "east" | "west";

function printId(id: ID): void {
  if (typeof id === "string") {
    console.log("String ID:", id.toUpperCase());
  } else {
    console.log("Number ID:", id.toFixed(0));
  }
}

// Intersection types — combine multiple types
type Timestamped = { createdAt: Date; updatedAt: Date };
type Named       = { name: string };
type Entity      = Named & Timestamped & { id: number };

// Discriminated unions — the most important pattern
type Shape =
  | { kind: "circle";    radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle";  base: number;  height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":    return Math.PI * shape.radius ** 2;
    case "rectangle": return shape.width * shape.height;
    case "triangle":  return 0.5 * shape.base * shape.height;
  }
}

// const assertions — narrow to literal types
const palette = ["red", "green", "blue"] as const;
// palette: readonly ["red", "green", "blue"]
type Color = typeof palette[number]; // "red" | "green" | "blue"

const config = { env: "prod", debug: false } as const;
// config.env: "prod"  (not string)

printId(42);
printId("abc-123");
console.log(area({ kind: "circle", radius: 5 }).toFixed(2));
console.log(area({ kind: "rectangle", width: 4, height: 6 }));`,
`<div class="lesson-h2">Union Types</div>
<p class="lesson-p">Union types (<code>A | B</code>) mean a value can be one of several types. Literal unions create a closed set of allowed values — TypeScript's answer to enums for strings.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Unions</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">type</span> <span class="ty">Status</span> = <span class="st">"active"</span> | <span class="st">"inactive"</span> | <span class="st">"pending"</span>;
<span class="kw">type</span> <span class="ty">ID</span>     = <span class="ty">number</span> | <span class="ty">string</span>;
<span class="kw">type</span> <span class="ty">Result</span> = { ok: <span class="ty">true</span>; value: <span class="ty">string</span> }
            | { ok: <span class="ty">false</span>; error: <span class="ty">Error</span> };</pre></div>
<div class="lesson-h2">Discriminated Unions</div>
<p class="lesson-p">The most powerful TypeScript pattern — a shared <strong>discriminant field</strong> (like <code>kind</code> or <code>type</code>) lets TypeScript narrow to the exact member in a switch/if.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Discriminated Union</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">type</span> <span class="ty">Action</span> =
  | { type: <span class="st">"SET_USER"</span>;  payload: <span class="ty">User</span> }
  | { type: <span class="st">"SET_ERROR"</span>; payload: <span class="ty">string</span> }
  | { type: <span class="st">"RESET"</span> };
<span class="kw">function</span> <span class="fn">reducer</span>(action: <span class="ty">Action</span>) {
  <span class="kw">switch</span> (action.type) {
    <span class="kw">case</span> <span class="st">"SET_USER"</span>: <span class="cm">// action.payload is User here</span>
    <span class="kw">case</span> <span class="st">"RESET"</span>:   <span class="cm">// no payload available here</span>
  }
}</pre></div>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">as const</div><div class="callout-text">Adding <code>as const</code> to an object or array narrows all its values to their literal types. <code>const x = "hello" as const</code> gives type <code>"hello"</code>, not <code>string</code>. Essential for discriminated unions and config objects.</div></div></div>`);

L('narrowing','Type Narrowing','basic',
`// TypeScript narrows types based on runtime checks

function processValue(val: string | number | null): string {
  // typeof guard
  if (typeof val === "string") return val.toUpperCase();
  if (typeof val === "number") return val.toFixed(2);
  return "null";
}

// instanceof guard
function formatDate(d: Date | string): string {
  if (d instanceof Date) return d.toISOString();
  return new Date(d).toISOString();
}

// in operator guard
interface Cat { meow(): void }
interface Dog { bark(): void }
type Pet = Cat | Dog;

function makeNoise(pet: Pet): void {
  if ("meow" in pet) pet.meow();
  else               pet.bark();
}

// Truthiness narrowing
function printName(name: string | undefined): void {
  if (name) console.log(name.toUpperCase());
  else      console.log("Anonymous");
}

// Type predicates (user-defined guards)
interface Fish { swim(): void }
interface Bird { fly():  void }

function isFish(animal: Fish | Bird): animal is Fish {
  return "swim" in animal;
}

// Exhaustiveness checking with never
type Shape = { kind: "circle"; r: number } | { kind: "square"; s: number };
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.r ** 2;
    case "square": return shape.s ** 2;
    default:
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}

console.log(processValue("hello"));
console.log(processValue(3.14));
console.log(processValue(null));`,
`<div class="lesson-h2">Type Narrowing</div>
<p class="lesson-p">TypeScript's control flow analysis automatically narrows types inside branches. When you check <code>typeof x === "string"</code>, TypeScript knows <code>x</code> is a string for the rest of that block.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Narrowing</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">function</span> <span class="fn">process</span>(val: <span class="ty">string</span> | <span class="ty">number</span> | <span class="ty">null</span>) {
  <span class="kw">if</span> (<span class="kw">typeof</span> val === <span class="st">"string"</span>) <span class="kw">return</span> val.toUpperCase();
  <span class="kw">if</span> (<span class="kw">typeof</span> val === <span class="st">"number"</span>) <span class="kw">return</span> val.toFixed(<span class="nm">2</span>);
  <span class="kw">return</span> <span class="st">"null"</span>;  <span class="cm">// TypeScript knows val is null here</span>
}</pre></div>
<div class="lesson-h2">Narrowing Techniques</div>
<table class="ref-table">
<tr><th>Guard</th><th>Example</th><th>Narrows</th></tr>
<tr><td>typeof</td><td>typeof x === "string"</td><td>Primitives</td></tr>
<tr><td>instanceof</td><td>x instanceof Date</td><td>Class instances</td></tr>
<tr><td>in</td><td>"swim" in x</td><td>Object shapes</td></tr>
<tr><td>truthiness</td><td>if (x)</td><td>Removes null/undefined/0/""</td></tr>
<tr><td>equality</td><td>x === "circle"</td><td>Literal types</td></tr>
<tr><td>type predicate</td><td>x is Fish</td><td>Custom — any shape</td></tr>
</table>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">Exhaustiveness with never</div><div class="callout-text">Assign the default case to <code>never</code> in a switch. If you add a new union member without handling it, TypeScript gives a compile error — the ultimate safety net for discriminated unions.</div></div></div>`);

L('classes','Classes & Access Modifiers','basic',
`// TypeScript adds access modifiers and more to JS classes

class BankAccount {
  readonly id: string;
  private balance: number;
  protected owner: string;

  // Parameter properties — shorthand for constructor
  constructor(
    id: string,
    owner: string,
    private readonly currency: string = "USD",
  ) {
    this.id      = id;
    this.owner   = owner;
    this.balance = 0;
  }

  get funds(): string {
    return \`\${this.balance} \${this.currency}\`;
  }

  deposit(amount: number): this {     // returns this for chaining
    if (amount <= 0) throw new Error("Amount must be positive");
    this.balance += amount;
    return this;
  }

  withdraw(amount: number): this {
    if (amount > this.balance) throw new Error("Insufficient funds");
    this.balance -= amount;
    return this;
  }

  toString(): string {
    return \`Account[\${this.id}] \${this.owner}: \${this.funds}\`;
  }
}

// Abstract classes
abstract class Animal {
  abstract speak(): string;
  move(): void { console.log("moving..."); }
}

class Cat extends Animal {
  speak(): string { return "meow"; }
}

const acct = new BankAccount("acc-1", "Alice");
acct.deposit(1000).deposit(500).withdraw(200);
console.log(acct.toString());

const cat = new Cat();
console.log(cat.speak());
cat.move();`,
`<div class="lesson-h2">Classes</div>
<p class="lesson-p">TypeScript adds access modifiers, parameter properties, abstract classes, and getter/setters to JavaScript classes. All checked at compile time.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Class</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">class</span> <span class="ty">Person</span> {
  <span class="kw">readonly</span> id: <span class="ty">number</span>;     <span class="cm">// can't reassign after init</span>
  <span class="kw">private</span> age: <span class="ty">number</span>;     <span class="cm">// only accessible in class</span>
  <span class="kw">protected</span> name: <span class="ty">string</span>;  <span class="cm">// accessible in subclasses</span>
  <span class="cm">// Parameter property shorthand:</span>
  <span class="kw">constructor</span>(<span class="kw">public</span> email: <span class="ty">string</span>) {}
}</pre></div>
<div class="lesson-h2">Access Modifiers</div>
<table class="ref-table">
<tr><th>Modifier</th><th>Accessible from</th></tr>
<tr><td>public (default)</td><td>Anywhere</td></tr>
<tr><td>private</td><td>The class itself only</td></tr>
<tr><td>protected</td><td>Class + subclasses</td></tr>
<tr><td>readonly</td><td>Read anywhere, write only in constructor</td></tr>
<tr><td>#field (JS private)</td><td>Class only, truly private at runtime</td></tr>
</table>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">Parameter properties</div><div class="callout-text">Prefix constructor params with an access modifier to automatically create and assign an instance property: <code>constructor(private name: string)</code> is identical to declaring <code>private name: string</code> and assigning <code>this.name = name</code> in the constructor body.</div></div></div>`);

L('enums','Enums','basic',
`// Numeric enum (default)
enum Direction {
  North = 0,
  South,
  East,
  West,
}

console.log(Direction.North);  // 0
console.log(Direction[0]);     // "North" — reverse mapping

// String enum — preferred for readability
enum Status {
  Active   = "ACTIVE",
  Inactive = "INACTIVE",
  Pending  = "PENDING",
}

function handleStatus(s: Status): void {
  switch (s) {
    case Status.Active:   console.log("User is active"); break;
    case Status.Inactive: console.log("User is inactive"); break;
    case Status.Pending:  console.log("Awaiting approval"); break;
  }
}

// const enum — inlined at compile time (no runtime object)
const enum HttpMethod {
  GET    = "GET",
  POST   = "POST",
  PUT    = "PUT",
  DELETE = "DELETE",
}

// Modern alternative: const object + type (often preferred)
const ROLE = {
  Admin:  "admin",
  Editor: "editor",
  Viewer: "viewer",
} as const;

type Role = typeof ROLE[keyof typeof ROLE];  // "admin" | "editor" | "viewer"

function hasAccess(role: Role): boolean {
  return role === ROLE.Admin || role === ROLE.Editor;
}

handleStatus(Status.Active);
handleStatus(Status.Pending);
console.log(hasAccess("admin"));
console.log(hasAccess("viewer"));`,
`<div class="lesson-h2">Enums</div>
<p class="lesson-p">Enums define a set of named constants. TypeScript has numeric and string enums — string enums are more debuggable since values are human-readable.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — String Enum</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">enum</span> <span class="ty">Status</span> {
  Active   = <span class="st">"ACTIVE"</span>,
  Inactive = <span class="st">"INACTIVE"</span>,
  Pending  = <span class="st">"PENDING"</span>,
}
<span class="cm">// Use in function signatures</span>
<span class="kw">function</span> <span class="fn">greet</span>(s: <span class="ty">Status</span>): <span class="ty">void</span> { ... }
<span class="fn">greet</span>(<span class="ty">Status</span>.Active);</pre></div>
<div class="lesson-h2">Modern Alternative: const Object</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — const object pattern</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">const</span> ROLE = { Admin: <span class="st">"admin"</span>, Editor: <span class="st">"editor"</span> } <span class="kw">as const</span>;
<span class="kw">type</span> <span class="ty">Role</span> = <span class="kw">typeof</span> ROLE[<span class="kw">keyof typeof</span> ROLE];
<span class="cm">// "admin" | "editor" — no enum runtime overhead</span></pre></div>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">Prefer string enums or const objects</div><div class="callout-text">Numeric enums have surprising reverse-mapping behaviour. String enums or <code>as const</code> objects are more transparent, tree-shakeable, and don't require special handling in JSON serialisation.</div></div></div>`);

L('modules','Modules & Imports','basic',
`// TypeScript uses ES Modules (ESM)
// Named exports
export interface Config {
  host: string;
  port: number;
  debug?: boolean;
}

export const defaultConfig: Config = {
  host: "localhost",
  port: 3000,
};

export function createUrl(config: Config): string {
  return \`http://\${config.host}:\${config.port}\`;
}

// Default export
export default class App {
  private config: Config;
  constructor(config: Partial<Config> = {}) {
    this.config = { ...defaultConfig, ...config };
  }
  start(): void {
    console.log(\`App started at \${createUrl(this.config)}\`);
  }
}

// Re-exports
// export { createUrl as makeUrl } from "./utils";
// export * from "./types";
// export * as utils from "./utils";

// Type-only imports (erased at compile time)
// import type { Config } from "./config";

// Dynamic imports (lazy loading)
async function loadHeavyModule() {
  const { HeavyClass } = await import("./heavy");
  return new HeavyClass();
}

// Simulate the module
const app = new App({ port: 8080 });
app.start();
console.log(createUrl(defaultConfig));
console.log(defaultConfig);`,
`<div class="lesson-h2">ES Modules in TypeScript</div>
<p class="lesson-p">TypeScript compiles to ES modules (or CommonJS, configurable). Use named exports for most things and a single default export per module for the main class or function.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Exports</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm">// utils.ts</span>
<span class="kw">export interface</span> <span class="ty">Config</span> { host: <span class="ty">string</span>; port: <span class="ty">number</span>; }
<span class="kw">export function</span> <span class="fn">createUrl</span>(c: <span class="ty">Config</span>): <span class="ty">string</span> { ... }
<span class="kw">export default class</span> <span class="ty">App</span> { ... }
<span class="cm">// main.ts</span>
<span class="kw">import</span> App, { createUrl, <span class="kw">type</span> Config } <span class="kw">from</span> <span class="st">"./utils"</span>;
<span class="kw">import</span> * <span class="kw">as</span> utils <span class="kw">from</span> <span class="st">"./utils"</span>;</pre></div>
<div class="lesson-h2">Module Resolution</div>
<div class="compile-box"><div class="cbox-title">🔧 Key tsconfig Settings</div>
<div class="c-step"><div class="c-num">1</div><div><div class="c-cmd">"module": "ESNext"</div><div class="c-desc">Output ES modules. Use <code>NodeNext</code> for Node.js projects.</div></div></div>
<div class="c-step"><div class="c-num">2</div><div><div class="c-cmd">"moduleResolution": "bundler"</div><div class="c-desc">Best for Vite/webpack projects. Use <code>NodeNext</code> for Node.</div></div></div>
<div class="c-step"><div class="c-num">3</div><div><div class="c-cmd">"paths": { "@/*": ["./src/*"] }</div><div class="c-desc">Path aliases — map <code>@/utils</code> to <code>src/utils</code>.</div></div></div></div>`);

L('generics','Generics','medium',
`// Generic functions
function identity<T>(arg: T): T { return arg; }
function first<T>(arr: T[]): T | undefined { return arr[0]; }
function last<T>(arr: T[]): T | undefined { return arr[arr.length - 1]; }

// Generic with constraints
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Generic interfaces
interface Repository<T extends { id: number }> {
  findById(id: number): T | undefined;
  findAll(): T[];
  save(item: T): T;
  delete(id: number): boolean;
}

// Generic class
class Stack<T> {
  private items: T[] = [];

  push(item: T): void  { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
  peek(): T | undefined { return this.items[this.items.length - 1]; }
  get size(): number { return this.items.length; }
  isEmpty(): boolean { return this.items.length === 0; }
  toArray(): T[] { return [...this.items]; }
}

// Multiple type parameters
function zip<A, B>(a: A[], b: B[]): [A, B][] {
  return a.map((v, i) => [v, b[i]]);
}

// Default type parameters (TS 2.3+)
interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message: string;
}

const stack = new Stack<number>();
stack.push(1); stack.push(2); stack.push(3);
console.log(stack.pop(), stack.peek(), stack.size);

const zipped = zip([1, 2, 3], ["a", "b", "c"]);
console.log(zipped);

const user = { id: 1, name: "Alice", age: 30 };
console.log(getProperty(user, "name"));`,
`<div class="lesson-h2">Generics</div>
<p class="lesson-p">Generics let you write reusable, type-safe code that works with <em>any</em> type, while preserving type information. Think of <code>T</code> as a type parameter — filled in at the call site.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Generics</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm">// T is inferred at the call site</span>
<span class="kw">function</span> <span class="fn">wrap</span>&lt;<span class="ty">T</span>&gt;(val: <span class="ty">T</span>): { value: <span class="ty">T</span> } { <span class="kw">return</span> { value: val }; }
<span class="fn">wrap</span>(<span class="nm">42</span>)          <span class="cm">// { value: number }</span>
<span class="fn">wrap</span>(<span class="st">"hello"</span>)     <span class="cm">// { value: string }</span>
<span class="cm">// Constraints</span>
<span class="kw">function</span> <span class="fn">longest</span>&lt;<span class="ty">T</span> <span class="kw">extends</span> { length: <span class="ty">number</span> }&gt;(a: <span class="ty">T</span>, b: <span class="ty">T</span>): <span class="ty">T</span> {
  <span class="kw">return</span> a.length >= b.length ? a : b;
}</pre></div>
<div class="lesson-h2">keyof & typeof</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — keyof / typeof</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">type</span> <span class="ty">Keys</span> = <span class="kw">keyof</span> <span class="ty">User</span>;         <span class="cm">// "id" | "name" | "email"</span>
<span class="kw">type</span> <span class="ty">Val</span>  = <span class="ty">User</span>[<span class="st">"name"</span>];        <span class="cm">// string  (indexed access)</span>
<span class="kw">type</span> <span class="ty">Conf</span> = <span class="kw">typeof</span> defaultConfig; <span class="cm">// infer type from value</span>
<span class="kw">function</span> <span class="fn">get</span>&lt;<span class="ty">T</span>, <span class="ty">K</span> <span class="kw">extends keyof</span> <span class="ty">T</span>&gt;(o: <span class="ty">T</span>, k: <span class="ty">K</span>): <span class="ty">T</span>[<span class="ty">K</span>] {
  <span class="kw">return</span> o[k];
}</pre></div>`);

L('utility','Utility Types','medium',
`interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  role: "admin" | "user";
}

// Partial — all props optional
type UserUpdate = Partial<User>;

// Required — all props required (reverse of Partial)
type StrictUser = Required<User>;

// Pick — select specific props
type UserSummary = Pick<User, "id" | "name" | "role">;

// Omit — exclude specific props
type PublicUser = Omit<User, "email" | "age">;

// Readonly — all props readonly
type ImmutableUser = Readonly<User>;

// Record — map keys to a value type
type RoleMap = Record<"admin" | "user", string[]>;
const permissions: RoleMap = {
  admin: ["read", "write", "delete"],
  user:  ["read"],
};

// ReturnType, Parameters — extract from function types
function createUser(name: string, age: number): User {
  return { id: Date.now(), name, email: "", age, role: "user" };
}
type CreateUserReturn = ReturnType<typeof createUser>;  // User
type CreateUserParams = Parameters<typeof createUser>;  // [string, number]

// Exclude / Extract — filter union members
type Nums   = Exclude<string | number | boolean, string | boolean>; // number
type Strs   = Extract<string | number | boolean, string | boolean>; // string | boolean

// NonNullable
type Safe = NonNullable<string | null | undefined>;  // string

const update: UserUpdate = { name: "Alice" };  // only name needed
const summary: UserSummary = { id: 1, name: "Alice", role: "admin" };
console.log(permissions.admin);
console.log(update, summary);`,
`<div class="lesson-h2">Utility Types</div>
<p class="lesson-p">TypeScript ships with a powerful set of built-in generic utility types that transform existing types. They're essential for DRY type definitions.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Utility Types</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="ty">Partial</span>&lt;<span class="ty">T</span>&gt;          <span class="cm">// all props optional</span>
<span class="ty">Required</span>&lt;<span class="ty">T</span>&gt;         <span class="cm">// all props required</span>
<span class="ty">Readonly</span>&lt;<span class="ty">T</span>&gt;         <span class="cm">// all props readonly</span>
<span class="ty">Pick</span>&lt;<span class="ty">T</span>, <span class="ty">K</span>&gt;          <span class="cm">// keep only K keys</span>
<span class="ty">Omit</span>&lt;<span class="ty">T</span>, <span class="ty">K</span>&gt;          <span class="cm">// remove K keys</span>
<span class="ty">Record</span>&lt;<span class="ty">K</span>, <span class="ty">V</span>&gt;        <span class="cm">// map K to V</span>
<span class="ty">ReturnType</span>&lt;<span class="kw">typeof</span> fn&gt;<span class="cm">// fn's return type</span>
<span class="ty">Parameters</span>&lt;<span class="kw">typeof</span> fn&gt;<span class="cm">// fn's param tuple</span>
<span class="ty">Exclude</span>&lt;<span class="ty">T</span>, <span class="ty">U</span>&gt;       <span class="cm">// remove U from T union</span>
<span class="ty">Extract</span>&lt;<span class="ty">T</span>, <span class="ty">U</span>&gt;       <span class="cm">// keep only U from T union</span>
<span class="ty">NonNullable</span>&lt;<span class="ty">T</span>&gt;      <span class="cm">// remove null/undefined</span>
<span class="ty">Awaited</span>&lt;<span class="ty">T</span>&gt;          <span class="cm">// unwrap Promise type</span></pre></div>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">Composition pattern</div><div class="callout-text">Combine utility types: <code>Readonly&lt;Partial&lt;User&gt;&gt;</code> gives all-optional and all-readonly. <code>Omit&lt;Required&lt;User&gt;, "id"&gt;</code> removes id and makes everything else required.</div></div></div>`);

L('mapped','Mapped Types','medium',
`// Mapped types — transform every property in a type

// Reimplementing built-in utility types
type MyPartial<T>  = { [K in keyof T]?: T[K] };
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type MyRecord<K extends string, V> = { [P in K]: V };

interface User { id: number; name: string; age: number }

// Add modifiers
type Mutable<T> = { -readonly [K in keyof T]: T[K] };   // remove readonly
type Complete<T> = { [K in keyof T]-?: T[K] };           // remove optional

// Remap keys with as clause
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};
// Getters<User> = { getId(): number; getName(): string; ... }

// Filter properties by value type
type StringOnly<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K]
};
type UserStrings = StringOnly<User>; // { name: string }

// Practical: make API patch type (all fields optional, id required)
type PatchPayload<T extends { id: number }> =
  Pick<T, "id"> & Partial<Omit<T, "id">>;

type UserPatch = PatchPayload<User>;

const patch: UserPatch = { id: 1, name: "New Name" };
console.log(patch);

// Deep readonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

type ReadonlyUser = DeepReadonly<User>;
const frozen: ReadonlyUser = { id: 1, name: "Alice", age: 30 };
console.log(frozen);`,
`<div class="lesson-h2">Mapped Types</div>
<p class="lesson-p">Mapped types iterate over the keys of a type and transform each property. They're the building block for all built-in utility types like <code>Partial</code> and <code>Readonly</code>.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Mapped Types</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm">// { [K in keyof T]: ... }</span>
<span class="kw">type</span> <span class="ty">Nullable</span>&lt;<span class="ty">T</span>&gt; = { [<span class="ty">K</span> <span class="kw">in keyof</span> <span class="ty">T</span>]: <span class="ty">T</span>[<span class="ty">K</span>] | <span class="kw">null</span> };
<span class="cm">// Add/remove modifiers with + and -</span>
<span class="kw">type</span> <span class="ty">Mutable</span>&lt;<span class="ty">T</span>&gt; = { -<span class="kw">readonly</span> [<span class="ty">K</span> <span class="kw">in keyof</span> <span class="ty">T</span>]: <span class="ty">T</span>[<span class="ty">K</span>] };
<span class="kw">type</span> <span class="ty">Complete</span>&lt;<span class="ty">T</span>&gt; = { [<span class="ty">K</span> <span class="kw">in keyof</span> <span class="ty">T</span>]-?: <span class="ty">T</span>[<span class="ty">K</span>] };</pre></div>
<div class="lesson-h2">Key Remapping (as clause)</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Key Remapping</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm">// Rename keys with 'as'</span>
<span class="kw">type</span> <span class="ty">Getters</span>&lt;<span class="ty">T</span>&gt; = {
  [<span class="ty">K</span> <span class="kw">in keyof</span> <span class="ty">T</span> <span class="kw">as</span> <span class="st">\`get\${Capitalize&lt;string & K&gt;}\`</span>]: () => <span class="ty">T</span>[<span class="ty">K</span>]
};
<span class="cm">// Filter with never</span>
<span class="kw">type</span> <span class="ty">StringKeys</span>&lt;<span class="ty">T</span>&gt; = {
  [<span class="ty">K</span> <span class="kw">in keyof</span> <span class="ty">T</span> <span class="kw">as</span> <span class="ty">T</span>[<span class="ty">K</span>] <span class="kw">extends</span> <span class="ty">string</span> ? <span class="ty">K</span> : <span class="kw">never</span>]: <span class="ty">T</span>[<span class="ty">K</span>]
};</pre></div>`);

L('conditional','Conditional Types','medium',
`// Conditional types: T extends U ? X : Y

type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false

// Extracting inner types
type Unwrap<T> = T extends Promise<infer U>  ? U
               : T extends Array<infer U>    ? U
               : T extends ((...a: any[]) => infer U) ? U
               : T;

type P = Unwrap<Promise<number>>;    // number
type Q = Unwrap<string[]>;           // string
type R = Unwrap<() => boolean>;      // boolean
type S = Unwrap<number>;             // number

// Distributive conditional types
type ToArray<T> = T extends any ? T[] : never;
type Arr = ToArray<string | number>;  // string[] | number[]

// NonNullable re-implementation
type MyNonNullable<T> = T extends null | undefined ? never : T;

// Deep Partial using conditional types
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

interface Config {
  db: { host: string; port: number };
  cache: { ttl: number; max: number };
}

type PartialConfig = DeepPartial<Config>;

const cfg: PartialConfig = {
  db: { host: "localhost" }  // port is optional!
};

console.log(cfg);
// Demonstrate type narrowing via conditional
function unwrap<T>(val: T): Unwrap<T> {
  return val as any;
}`,
`<div class="lesson-h2">Conditional Types</div>
<p class="lesson-p">Conditional types (<code>T extends U ? X : Y</code>) enable type-level branching — expressing logic in the type system itself. They're the foundation of many utility types.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Conditional</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">type</span> <span class="ty">IsArray</span>&lt;<span class="ty">T</span>&gt; = <span class="ty">T</span> <span class="kw">extends</span> <span class="ty">any</span>[] ? <span class="kw">true</span> : <span class="kw">false</span>;
<span class="kw">type</span> <span class="ty">Flatten</span>&lt;<span class="ty">T</span>&gt; = <span class="ty">T</span> <span class="kw">extends</span> <span class="ty">Array</span>&lt;<span class="kw">infer</span> <span class="ty">U</span>&gt; ? <span class="ty">U</span> : <span class="ty">T</span>;
<span class="cm">// Distributive: applies to each union member</span>
<span class="kw">type</span> <span class="ty">ToArr</span>&lt;<span class="ty">T</span>&gt; = <span class="ty">T</span> <span class="kw">extends</span> <span class="kw">any</span> ? <span class="ty">T</span>[] : <span class="kw">never</span>;
<span class="kw">type</span> <span class="ty">X</span> = <span class="ty">ToArr</span>&lt;<span class="ty">string</span> | <span class="ty">number</span>&gt;; <span class="cm">// string[] | number[]</span></pre></div>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">infer keyword</div><div class="callout-text"><code>infer</code> captures a type variable inside a conditional type. It's how TypeScript extracts inner types: <code>T extends Promise&lt;infer U&gt;</code> binds U to whatever type is inside the Promise.</div></div></div>`);

L('infer','infer & Template Literals','medium',
`// infer — capture types from positions in a generic

// Extract the element type of an array
type ElementOf<T extends any[]> = T extends (infer U)[] ? U : never;
type E = ElementOf<string[]>;   // string

// Extract return type of a function
type MyReturn<T extends (...a: any[]) => any> =
  T extends (...a: any[]) => infer R ? R : never;

type Num = MyReturn<() => number>;  // number

// Extract first argument
type FirstArg<T extends (...a: any[]) => any> =
  T extends (first: infer F, ...rest: any[]) => any ? F : never;

type FA = FirstArg<(x: string, y: number) => void>;  // string

// Template literal types (TS 4.1+)
type EventName<T extends string> = \`on\${Capitalize<T>}\`;
type Click  = EventName<"click">;   // "onClick"
type Change = EventName<"change">;  // "onChange"

// Create event handler object type
type DOMHandlers<T extends string> = {
  [K in T as \`on\${Capitalize<K>}\`]: (e: Event) => void;
};

// Splitting/extracting from strings
type Split<S extends string, D extends string> =
  S extends \`\${infer Head}\${D}\${infer Tail}\`
    ? [Head, ...Split<Tail, D>]
    : [S];

type Parts = Split<"a.b.c", ".">;   // ["a", "b", "c"]

// Practical: CSS property validator
type CSSUnit = "px" | "em" | "rem" | "%" | "vh" | "vw";
type CSSValue = \`\${number}\${CSSUnit}\`;

const width: CSSValue  = "100px";   // ✓
const height: CSSValue = "50vh";    // ✓
// const bad: CSSValue = "100pt";  // ✗ Error

console.log(width, height);`,
`<div class="lesson-h2">infer Keyword</div>
<p class="lesson-p"><code>infer</code> declares a type variable to be inferred inside a conditional type. It lets you extract types from complex generic positions.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — infer</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">type</span> <span class="ty">Awaited</span>&lt;<span class="ty">T</span>&gt; =
  <span class="ty">T</span> <span class="kw">extends</span> <span class="ty">Promise</span>&lt;<span class="kw">infer</span> <span class="ty">U</span>&gt; ? <span class="ty">Awaited</span>&lt;<span class="ty">U</span>&gt; : <span class="ty">T</span>;
<span class="kw">type</span> <span class="ty">UnpackTuple</span>&lt;<span class="ty">T</span>&gt; =
  <span class="ty">T</span> <span class="kw">extends</span> [<span class="kw">infer</span> <span class="ty">Head</span>, ...<span class="kw">infer</span> <span class="ty">Tail</span>] ? [<span class="ty">Head</span>, <span class="ty">Tail</span>] : <span class="kw">never</span>;</pre></div>
<div class="lesson-h2">Template Literal Types (4.1+)</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Template Literals</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">type</span> <span class="ty">Route</span> = <span class="st">\`/\${string}\`</span>;        <span class="cm">// any string starting with /</span>
<span class="kw">type</span> <span class="ty">EventOn</span>&lt;<span class="ty">T</span> <span class="kw">extends</span> <span class="ty">string</span>&gt; = <span class="st">\`on\${Capitalize&lt;T&gt;}\`</span>;
<span class="kw">type</span> <span class="ty">CSSPx</span>  = <span class="st">\`\${number}px\`</span>;       <span class="cm">// "42px", "0px", etc.</span>
<span class="cm">// String manipulation types</span>
<span class="ty">Uppercase</span>&lt;<span class="st">"hello"</span>&gt;   <span class="cm">// "HELLO"</span>
<span class="ty">Lowercase</span>&lt;<span class="st">"HELLO"</span>&gt;   <span class="cm">// "hello"</span>
<span class="ty">Capitalize</span>&lt;<span class="st">"hello"</span>&gt;  <span class="cm">// "Hello"</span>
<span class="ty">Uncapitalize</span>&lt;<span class="st">"Hello"</span>&gt; <span class="cm">// "hello"</span></pre></div>`);

L('decorators','Decorators','medium',
`// Decorators (TypeScript 5.0 — Stage 3 proposal)
// Enable with "experimentalDecorators": true in tsconfig

// Class decorator
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
  console.log(\`Sealed: \${constructor.name}\`);
}

// Method decorator
function log(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(\`Calling \${propertyKey}(\${args.join(", ")})\`);
    const result = original.apply(this, args);
    console.log(\`  → \${JSON.stringify(result)}\`);
    return result;
  };
  return descriptor;
}

// Property decorator
function validate(min: number, max: number) {
  return function (target: any, key: string) {
    let val: number;
    Object.defineProperty(target, key, {
      get: () => val,
      set: (v: number) => {
        if (v < min || v > max) throw new Error(\`\${key} must be \${min}-\${max}\`);
        val = v;
      },
    });
  };
}

@sealed
class Calculator {
  @log
  add(a: number, b: number): number { return a + b; }

  @log
  multiply(a: number, b: number): number { return a * b; }
}

const calc = new Calculator();
calc.add(3, 4);
calc.multiply(5, 6);`,
`<div class="lesson-h2">Decorators</div>
<p class="lesson-p">Decorators are functions that annotate and modify classes, methods, properties, and parameters. TypeScript 5.0 implements the Stage 3 TC39 proposal.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Decorators</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm">// Class decorator</span>
<span class="de">@sealed</span>
<span class="kw">class</span> <span class="ty">Example</span> { ... }
<span class="cm">// Method decorator</span>
<span class="kw">class</span> <span class="ty">Service</span> {
  <span class="de">@log</span>
  <span class="fn">process</span>(data: <span class="ty">string</span>): <span class="ty">string</span> { <span class="kw">return</span> data; }
}
<span class="cm">// Decorator factory (takes arguments)</span>
<span class="de">@retry</span>({ times: <span class="nm">3</span>, delay: <span class="nm">1000</span> })
<span class="fn">fetchData</span>(): <span class="ty">Promise</span>&lt;<span class="ty">Data</span>&gt; { ... }</pre></div>
<div class="callout callout-info"><div class="callout-icon">ℹ️</div><div class="callout-body"><div class="callout-title">Decorator ecosystem</div><div class="callout-text">Decorators power frameworks like Angular, NestJS, TypeORM, and class-validator. Enable with <code>"experimentalDecorators": true</code> for legacy decorators, or <code>"useDefineForClassFields": true</code> for Stage 3 decorators in TS 5.0+.</div></div></div>`);

L('async','Async & Promises','medium',
`// TypeScript fully types async/await and Promises

async function fetchUser(id: number): Promise<{ name: string; id: number }> {
  const res = await fetch(\`https://api.example.com/users/\${id}\`);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}

// Promise combinators — all typed
async function demo(): Promise<void> {
  // Simulate data
  const delay = (ms: number, val: string) =>
    new Promise<string>(resolve => setTimeout(() => resolve(val), ms));

  // All settle concurrently
  const [a, b, c] = await Promise.all([
    delay(100, "one"),
    delay(50,  "two"),
    delay(80,  "three"),
  ]);
  console.log("all:", a, b, c);

  // First to resolve wins
  const fastest = await Promise.race([
    delay(200, "slow"),
    delay(50,  "fast"),
  ]);
  console.log("race:", fastest);

  // All settle, even if some fail
  const results = await Promise.allSettled([
    Promise.resolve("ok"),
    Promise.reject(new Error("fail")),
    Promise.resolve("also ok"),
  ]);
  results.forEach(r => {
    if (r.status === "fulfilled") console.log("✓", r.value);
    else                          console.log("✗", r.reason.message);
  });

  // First to resolve without rejection
  const first = await Promise.any([
    Promise.reject(new Error("one failed")),
    delay(100, "winner"),
  ]);
  console.log("any:", first);
}

demo();`,
`<div class="lesson-h2">Async / Await</div>
<p class="lesson-p">TypeScript fully types async functions and Promises. The return type of an <code>async</code> function is always <code>Promise&lt;T&gt;</code> where <code>T</code> is the type of the <code>return</code> value.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — async/await</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">async function</span> <span class="fn">fetchUser</span>(id: <span class="ty">number</span>): <span class="ty">Promise</span>&lt;<span class="ty">User</span>&gt; {
  <span class="kw">const</span> res = <span class="kw">await</span> fetch(<span class="st">\`/api/users/\${id}\`</span>);
  <span class="kw">if</span> (!res.ok) <span class="kw">throw new</span> <span class="ty">Error</span>(<span class="st">\`HTTP \${res.status}\`</span>);
  <span class="kw">return</span> res.<span class="fn">json</span>() <span class="kw">as</span> <span class="ty">Promise</span>&lt;<span class="ty">User</span>&gt;;
}</pre></div>
<div class="lesson-h2">Promise Combinators</div>
<table class="ref-table">
<tr><th>Method</th><th>Behaviour</th></tr>
<tr><td>Promise.all</td><td>All must resolve; rejects on first failure</td></tr>
<tr><td>Promise.allSettled</td><td>Waits for all, returns {status, value/reason}[]</td></tr>
<tr><td>Promise.race</td><td>First to settle (resolve or reject) wins</td></tr>
<tr><td>Promise.any</td><td>First to resolve wins; throws AggregateError if all fail</td></tr>
</table>`);

L('errors','Error Handling','medium',
`// TypeScript doesn't type catch variables by default
// Use "useUnknownInCatchVariables": true in tsconfig

// Result type pattern — no thrown exceptions
type Ok<T>  = { ok: true;  value: T };
type Err<E> = { ok: false; error: E };
type Result<T, E = Error> = Ok<T> | Err<E>;

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return { ok: false, error: "Division by zero" };
  return { ok: true, value: a / b };
}

const r1 = divide(10, 2);
const r2 = divide(10, 0);

if (r1.ok) console.log("Result:", r1.value);
else       console.log("Error:", r1.error);
console.log(r2.ok ? r2.value : r2.error);

// Custom error classes
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(\`\${resource} not found\`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

// Type-safe error handling
function handleError(error: unknown): string {
  if (error instanceof NotFoundError) return \`404: \${error.message}\`;
  if (error instanceof AppError)      return \`App error [\${error.code}]: \${error.message}\`;
  if (error instanceof Error)         return \`Error: \${error.message}\`;
  return "Unknown error";
}

try {
  throw new NotFoundError("User");
} catch (e) {
  console.log(handleError(e));
}`,
`<div class="lesson-h2">Error Handling Patterns</div>
<p class="lesson-p">TypeScript offers two main approaches to errors: the traditional <code>try/catch</code> with typed custom errors, and the functional <em>Result type</em> pattern that makes errors explicit in return types.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Result Type</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">type</span> <span class="ty">Result</span>&lt;<span class="ty">T</span>, <span class="ty">E</span> = <span class="ty">Error</span>&gt; =
  | { ok: <span class="kw">true</span>;  value: <span class="ty">T</span> }
  | { ok: <span class="kw">false</span>; error: <span class="ty">E</span> };
<span class="kw">function</span> <span class="fn">safeDiv</span>(a: <span class="ty">number</span>, b: <span class="ty">number</span>): <span class="ty">Result</span>&lt;<span class="ty">number</span>, <span class="ty">string</span>&gt; {
  <span class="kw">if</span> (b === <span class="nm">0</span>) <span class="kw">return</span> { ok: <span class="kw">false</span>, error: <span class="st">"zero"</span> };
  <span class="kw">return</span> { ok: <span class="kw">true</span>, value: a / b };
}</pre></div>
<div class="lesson-h2">Custom Error Classes</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Custom Errors</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">class</span> <span class="ty">AppError</span> <span class="kw">extends</span> <span class="ty">Error</span> {
  <span class="kw">constructor</span>(msg: <span class="ty">string</span>, <span class="kw">public readonly</span> code: <span class="ty">string</span>) {
    <span class="kw">super</span>(msg); <span class="kw">this</span>.name = <span class="st">"AppError"</span>;
    Object.<span class="fn">setPrototypeOf</span>(<span class="kw">this</span>, AppError.prototype);
  }
}
<span class="cm">// Always call setPrototypeOf — fixes instanceof in transpiled code</span></pre></div>`);

L('discriminated','Discriminated Unions','advanced',
`// Discriminated unions are the most powerful TypeScript pattern

// State machine pattern
type LoadingState = { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User[] }
  | { status: "error";   error: Error };

interface User { id: number; name: string }

function renderState(state: LoadingState): string {
  switch (state.status) {
    case "idle":    return "Ready to load";
    case "loading": return "Loading…";
    case "success": return \`\${state.data.length} users loaded\`;
    case "error":   return \`Error: \${state.error.message}\`;
  }
}

// Redux-style action pattern
type Action =
  | { type: "ADD_TODO";    payload: { text: string } }
  | { type: "TOGGLE_TODO"; payload: { id: number } }
  | { type: "DELETE_TODO"; payload: { id: number } }
  | { type: "CLEAR_ALL" };

interface Todo { id: number; text: string; done: boolean }

function reducer(todos: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case "ADD_TODO":
      return [...todos, { id: Date.now(), text: action.payload.text, done: false }];
    case "TOGGLE_TODO":
      return todos.map(t => t.id === action.payload.id ? { ...t, done: !t.done } : t);
    case "DELETE_TODO":
      return todos.filter(t => t.id !== action.payload.id);
    case "CLEAR_ALL":
      return [];
  }
}

let todos: Todo[] = [];
todos = reducer(todos, { type: "ADD_TODO", payload: { text: "Learn TypeScript" } });
todos = reducer(todos, { type: "ADD_TODO", payload: { text: "Build something" } });
todos = reducer(todos, { type: "TOGGLE_TODO", payload: { id: todos[0].id } });
console.log(todos);

const states: LoadingState[] = [
  { status: "idle" },
  { status: "loading" },
  { status: "success", data: [{ id: 1, name: "Alice" }] },
  { status: "error", error: new Error("Network timeout") },
];
states.forEach(s => console.log(renderState(s)));`,
`<div class="lesson-h2">Discriminated Unions in Practice</div>
<p class="lesson-p">Discriminated unions model state machines, Redux actions, API responses, and event systems. The shared literal field lets TypeScript know exactly which member you're working with.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — State Machine</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">type</span> <span class="ty">State</span> =
  | { status: <span class="st">"idle"</span> }
  | { status: <span class="st">"loading"</span> }
  | { status: <span class="st">"success"</span>; data: <span class="ty">Data</span> }
  | { status: <span class="st">"error"</span>;   error: <span class="ty">Error</span> };
<span class="kw">function</span> <span class="fn">render</span>(s: <span class="ty">State</span>): <span class="ty">string</span> {
  <span class="kw">switch</span> (s.status) {
    <span class="kw">case</span> <span class="st">"success"</span>: <span class="kw">return</span> s.data.name; <span class="cm">// data available here</span>
    <span class="kw">case</span> <span class="st">"error"</span>:   <span class="kw">return</span> s.error.message;
  }
}</pre></div>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">Model impossibility</div><div class="callout-text">A discriminated union makes impossible states unrepresentable. You can't have <code>{ status: "success" }</code> without <code>data</code>, or <code>{ status: "error" }</code> without <code>error</code>. The type enforces correctness at compile time.</div></div></div>`);

L('variance','Variance & Brands','advanced',
`// Branded types — make primitives nominally typed

type UserId   = number & { readonly _brand: "UserId" };
type OrderId  = number & { readonly _brand: "OrderId" };
type Email    = string & { readonly _brand: "Email" };

// Brand constructors
function userId(n: number): UserId   { return n as UserId; }
function orderId(n: number): OrderId { return n as OrderId; }
function email(s: string): Email {
  if (!s.includes("@")) throw new Error("Invalid email");
  return s as Email;
}

function getUser(id: UserId): string { return \`User \${id}\`; }
function getOrder(id: OrderId): string { return \`Order \${id}\`; }

const uid = userId(1);
const oid = orderId(42);

console.log(getUser(uid));
console.log(getOrder(oid));
// getUser(oid)  ← Compile error: OrderId not assignable to UserId

// Covariance vs contravariance
// A function is CONTRAVARIANT in parameter types
type Logger = (msg: string) => void;
// Accepts any logger that handles string (or more general types)

// Arrays are COVARIANT
type Animal = { name: string };
type Cat = Animal & { meow(): void };
// Cat[] is assignable to Animal[]

// ReadonlyArray is covariant; mutable Array has variance issues
function processAnimals(animals: readonly Animal[]): void {
  animals.forEach(a => console.log(a.name));
}

const cats: Cat[] = [
  { name: "Luna",  meow: () => console.log("meow") },
  { name: "Mochi", meow: () => console.log("mrow") },
];

processAnimals(cats);  // ✓ Cat[] is assignable to readonly Animal[]

const em = email("alice@example.com");
console.log(em);`,
`<div class="lesson-h2">Branded Types</div>
<p class="lesson-p">TypeScript uses <em>structural typing</em> — two types with the same shape are interchangeable. Brands make primitives <em>nominally</em> typed, preventing accidental mix-ups of IDs, emails, and other domain primitives.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Brands</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">type</span> <span class="ty">UserId</span>  = <span class="ty">number</span> & { <span class="kw">readonly</span> _brand: <span class="st">"UserId"</span> };
<span class="kw">type</span> <span class="ty">OrderId</span> = <span class="ty">number</span> & { <span class="kw">readonly</span> _brand: <span class="st">"OrderId"</span> };
<span class="cm">// Now getUser(orderId) is a compile error!</span>
<span class="kw">function</span> <span class="fn">makeUserId</span>(n: <span class="ty">number</span>): <span class="ty">UserId</span> { <span class="kw">return</span> n <span class="kw">as</span> <span class="ty">UserId</span>; }</pre></div>
<div class="lesson-h2">Variance</div>
<table class="ref-table">
<tr><th>Position</th><th>Variance</th><th>Assignability</th></tr>
<tr><td>Function return</td><td>Covariant</td><td>Subtype assignable to supertype</td></tr>
<tr><td>Function param</td><td>Contravariant</td><td>Supertype assignable to subtype</td></tr>
<tr><td>ReadonlyArray</td><td>Covariant</td><td>Cat[] assignable to Animal[]</td></tr>
<tr><td>Mutable Array</td><td>Invariant</td><td>Exact type only</td></tr>
</table>`);

L('patterns','Design Patterns','advanced',
`// TypeScript-idiomatic design patterns

// 1. Builder pattern with method chaining
class QueryBuilder<T extends Record<string, unknown>> {
  private conditions: string[] = [];
  private _limit = 100;
  private _offset = 0;

  where(field: keyof T, value: T[keyof T]): this {
    this.conditions.push(\`\${String(field)} = '\${value}'\`);
    return this;
  }

  limit(n: number): this { this._limit = n; return this; }
  offset(n: number): this { this._offset = n; return this; }

  build(): string {
    const where = this.conditions.length
      ? \`WHERE \${this.conditions.join(" AND ")}\`
      : "";
    return \`SELECT * FROM table \${where} LIMIT \${this._limit} OFFSET \${this._offset}\`;
  }
}

// 2. Factory pattern
interface Logger { log(msg: string): void; error(msg: string): void }

function createLogger(type: "console" | "silent"): Logger {
  if (type === "silent") return { log: () => {}, error: () => {} };
  return {
    log:   msg => console.log(\`[LOG] \${msg}\`),
    error: msg => console.error(\`[ERR] \${msg}\`),
  };
}

// 3. Mixin pattern
type Constructor<T = {}> = new (...args: any[]) => T;

function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    createdAt = new Date();
    updatedAt = new Date();
    touch(): void { this.updatedAt = new Date(); }
  };
}

function Activatable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    isActive = false;
    activate():   void { this.isActive = true; }
    deactivate(): void { this.isActive = false; }
  };
}

class User { constructor(public name: string) {} }
const TimestampedActivatableUser = Timestamped(Activatable(User));
const user = new TimestampedActivatableUser("Alice");
user.activate();
console.log(user.name, user.isActive, user.createdAt.toISOString().split("T")[0]);

const q = new QueryBuilder<{ name: string; status: string }>()
  .where("status", "active")
  .limit(10)
  .build();
console.log(q);`,
`<div class="lesson-h2">TypeScript Design Patterns</div>
<p class="lesson-p">TypeScript's type system enables safer, more expressive implementations of classic design patterns. Types verify pattern correctness at compile time.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Builder</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">class</span> <span class="ty">QueryBuilder</span> {
  <span class="fn">where</span>(field: <span class="ty">string</span>, val: <span class="ty">string</span>): <span class="kw">this</span> { <span class="kw">return</span> <span class="kw">this</span>; }
  <span class="fn">limit</span>(n: <span class="ty">number</span>): <span class="kw">this</span>               { <span class="kw">return</span> <span class="kw">this</span>; }
  <span class="fn">build</span>(): <span class="ty">string</span>                         { <span class="kw">return</span> <span class="st">"..."</span>; }
}
<span class="cm">// Returning 'this' enables chaining with subclasses</span>
<span class="kw">new</span> QueryBuilder().<span class="fn">where</span>(<span class="st">"x"</span>, <span class="st">"1"</span>).<span class="fn">limit</span>(<span class="nm">10</span>).<span class="fn">build</span>();</pre></div>
<div class="lesson-h2">Mixin Pattern</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Mixins</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">type</span> <span class="ty">Ctor</span>&lt;<span class="ty">T</span> = {}&gt; = <span class="kw">new</span> (...args: <span class="ty">any</span>[]) => <span class="ty">T</span>;
<span class="kw">function</span> <span class="fn">Serializable</span>&lt;<span class="ty">B</span> <span class="kw">extends</span> <span class="ty">Ctor</span>&gt;(Base: <span class="ty">B</span>) {
  <span class="kw">return class extends</span> Base {
    <span class="fn">toJSON</span>(): <span class="ty">string</span> { <span class="kw">return</span> JSON.<span class="fn">stringify</span>(<span class="kw">this</span>); }
  };
}
<span class="kw">class</span> <span class="ty">SerializableUser</span> = <span class="fn">Serializable</span>(User);</pre></div>`);

L('react','React & TSX','advanced',
`// React + TypeScript — component typing patterns

import React, { useState, useEffect, useCallback, type FC } from "react";

// 1. Function component with typed props
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  children?: React.ReactNode;
}

const Button: FC<ButtonProps> = ({
  label,
  onClick,
  variant = "primary",
  disabled = false,
}) => (
  <button className={\`btn btn-\${variant}\`} onClick={onClick} disabled={disabled}>
    {label}
  </button>
);

// 2. Generic list component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}

function List<T>({ items, renderItem, keyExtractor, emptyMessage = "No items" }: ListProps<T>) {
  if (!items.length) return <p>{emptyMessage}</p>;
  return (
    <ul>
      {items.map((item, i) => (
        <li key={keyExtractor(item)}>{renderItem(item, i)}</li>
      ))}
    </ul>
  );
}

// 3. Typed useState and useReducer
interface User { id: number; name: string; active: boolean }

type UserAction =
  | { type: "SET"; user: User }
  | { type: "TOGGLE_ACTIVE" }
  | { type: "CLEAR" };

function userReducer(state: User | null, action: UserAction): User | null {
  switch (action.type) {
    case "SET":          return action.user;
    case "TOGGLE_ACTIVE": return state ? { ...state, active: !state.active } : null;
    case "CLEAR":        return null;
  }
}

// 4. Custom hook with typed return
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const inc  = useCallback(() => setCount(c => c + 1), []);
  const dec  = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initial), [initial]);
  return { count, inc, dec, reset } as const;
}

// Simulate output
console.log("React + TypeScript component patterns ready.");
console.log("Button, List<T>, useCounter hook, discriminated reducer — all typed.");`,
`<div class="lesson-h2">React + TypeScript</div>
<p class="lesson-p">TypeScript makes React components self-documenting — props are validated at compile time, hooks return correctly typed values, and event handlers are fully typed.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Component Props</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">interface</span> <span class="ty">CardProps</span> {
  title: <span class="ty">string</span>;
  children: <span class="ty">React.ReactNode</span>;
  onClose?: () => <span class="ty">void</span>;
  variant?: <span class="st">"default"</span> | <span class="st">"elevated"</span>;
}
<span class="kw">const</span> Card: <span class="ty">FC</span>&lt;<span class="ty">CardProps</span>&gt; = ({ title, children, onClose }) => (
  &lt;<span class="ty">div</span>&gt;
    &lt;<span class="ty">h2</span>&gt;{title}&lt;/<span class="ty">h2</span>&gt;
    {children}
    {onClose && &lt;<span class="ty">button</span> onClick={onClose}&gt;✕&lt;/<span class="ty">button</span>&gt;}
  &lt;/<span class="ty">div</span>&gt;
);</pre></div>
<div class="lesson-h2">Event Handlers</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — React Events</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm">// Events are fully typed</span>
<span class="kw">const</span> handleClick = (e: <span class="ty">React.MouseEvent</span>&lt;<span class="ty">HTMLButtonElement</span>&gt;) => {};
<span class="kw">const</span> handleChange = (e: <span class="ty">React.ChangeEvent</span>&lt;<span class="ty">HTMLInputElement</span>&gt;) => {
  <span class="kw">const</span> value = e.target.value;  <span class="cm">// string</span>
};
<span class="kw">const</span> handleSubmit = (e: <span class="ty">React.FormEvent</span>&lt;<span class="ty">HTMLFormElement</span>&gt;) => {
  e.<span class="fn">preventDefault</span>();
};</pre></div>`);

L('node','Node.js & APIs','advanced',
`// Node.js + TypeScript — REST API patterns
import express, { Request, Response, NextFunction } from "express";
import { z } from "zod";  // runtime validation

// Zod schemas — single source of truth for runtime + types
const CreateUserSchema = z.object({
  name:  z.string().min(1).max(100),
  email: z.string().email(),
  age:   z.number().int().min(0).max(150).optional(),
});

type CreateUserDto = z.infer<typeof CreateUserSchema>;

// Typed request/response wrappers
interface TypedRequest<TBody = unknown, TParams = {}, TQuery = {}> extends Request {
  body:   TBody;
  params: TParams & Record<string, string>;
  query:  TQuery & Record<string, string>;
}

// Repository pattern
interface UserRepository {
  findById(id: number): Promise<User | null>;
  create(dto: CreateUserDto): Promise<User>;
  list(): Promise<User[]>;
}

interface User { id: number; name: string; email: string }

// In-memory repo for demo
class InMemoryUserRepo implements UserRepository {
  private users: User[] = [];
  private nextId = 1;

  async findById(id: number): Promise<User | null> {
    return this.users.find(u => u.id === id) ?? null;
  }
  async create(dto: CreateUserDto): Promise<User> {
    const user: User = { id: this.nextId++, name: dto.name, email: dto.email };
    this.users.push(user);
    return user;
  }
  async list(): Promise<User[]> { return [...this.users]; }
}

// Simulate API
const repo = new InMemoryUserRepo();
async function demo() {
  const alice = await repo.create({ name: "Alice", email: "alice@ts.dev" });
  const bob   = await repo.create({ name: "Bob",   email: "bob@ts.dev", age: 30 });
  const all   = await repo.list();
  console.log("Created:", alice, bob);
  console.log("All users:", all);
  console.log("Find 1:", await repo.findById(1));
}
demo();`,
`<div class="lesson-h2">Node.js + TypeScript</div>
<p class="lesson-p">TypeScript transforms Node.js development — typed request/response objects, schema validation, and repository patterns all prevent entire classes of runtime errors.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Express + Zod</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">import</span> { z } <span class="kw">from</span> <span class="st">"zod"</span>;
<span class="kw">const</span> Schema = z.object({
  name:  z.<span class="fn">string</span>().<span class="fn">min</span>(<span class="nm">1</span>),
  email: z.<span class="fn">string</span>().<span class="fn">email</span>(),
});
<span class="kw">type</span> <span class="ty">Dto</span> = z.<span class="fn">infer</span>&lt;<span class="kw">typeof</span> Schema&gt;; <span class="cm">// types from schema</span>
<span class="cm">// Validate at runtime with full type safety</span>
<span class="kw">const</span> result = Schema.<span class="fn">safeParse</span>(req.body);
<span class="kw">if</span> (!result.success) <span class="kw">return</span> res.<span class="fn">status</span>(<span class="nm">400</span>).<span class="fn">json</span>(result.error);</pre></div>
<div class="compile-box"><div class="cbox-title">🔧 Node.js TypeScript Setup</div>
<div class="c-step"><div class="c-num">1</div><div><div class="c-cmd">npm install -D typescript @types/node ts-node</div></div></div>
<div class="c-step"><div class="c-num">2</div><div><div class="c-cmd">npm install express zod && npm install -D @types/express</div></div></div>
<div class="c-step"><div class="c-num">3</div><div><div class="c-cmd">npx tsx watch src/index.ts</div><div class="c-desc">Fast dev server — no compile step needed.</div></div></div></div>`);

L('testing','Testing with Vitest','advanced',
`// Vitest — the fastest TypeScript test runner

import { describe, it, expect, vi, beforeEach } from "vitest";

// Pure function tests
function add(a: number, b: number): number { return a + b; }
function divide(a: number, b: number): number {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}

describe("math", () => {
  it("adds numbers", () => {
    expect(add(2, 3)).toBe(5);
    expect(add(-1, 1)).toBe(0);
  });

  it("divides numbers", () => {
    expect(divide(10, 2)).toBe(5);
    expect(divide(7, 2)).toBeCloseTo(3.5);
  });

  it("throws on divide by zero", () => {
    expect(() => divide(1, 0)).toThrow("Division by zero");
  });
});

// Typed mock
interface EmailService {
  send(to: string, subject: string, body: string): Promise<void>;
}

class UserService {
  constructor(private email: EmailService) {}
  async registerUser(name: string, emailAddr: string): Promise<{ id: number; name: string }> {
    const user = { id: Date.now(), name };
    await this.email.send(emailAddr, "Welcome!", \`Hi \${name}\`);
    return user;
  }
}

describe("UserService", () => {
  let emailMock: EmailService;
  let service: UserService;

  beforeEach(() => {
    emailMock = { send: vi.fn().mockResolvedValue(undefined) };
    service = new UserService(emailMock);
  });

  it("registers a user and sends welcome email", async () => {
    const user = await service.registerUser("Alice", "alice@ts.dev");
    expect(user.name).toBe("Alice");
    expect(emailMock.send).toHaveBeenCalledWith("alice@ts.dev", "Welcome!", "Hi Alice");
  });
});

// Run simulated output
console.log("✓ math > adds numbers");
console.log("✓ math > divides numbers");
console.log("✓ math > throws on divide by zero");
console.log("✓ UserService > registers user and sends welcome email");
console.log("");
console.log("Test Files  1 passed (1)");
console.log("Tests       4 passed (4)");`,
`<div class="lesson-h2">Vitest</div>
<p class="lesson-p">Vitest is the fastest TypeScript-native test runner — built on Vite, with native ESM support, Jest-compatible API, and built-in type checking.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Vitest</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">import</span> { describe, it, expect, vi } <span class="kw">from</span> <span class="st">"vitest"</span>;
describe(<span class="st">"Calculator"</span>, () => {
  it(<span class="st">"adds numbers"</span>, () => {
    expect(<span class="fn">add</span>(<span class="nm">2</span>, <span class="nm">3</span>)).<span class="fn">toBe</span>(<span class="nm">5</span>);
  });
  it(<span class="st">"throws on bad input"</span>, () => {
    expect(() => <span class="fn">divide</span>(<span class="nm">1</span>, <span class="nm">0</span>)).<span class="fn">toThrow</span>(<span class="st">"zero"</span>);
  });
});</pre></div>
<div class="compile-box"><div class="cbox-title">🔧 Vitest Commands</div>
<div class="c-step"><div class="c-num">1</div><div><div class="c-cmd">npm install -D vitest</div></div></div>
<div class="c-step"><div class="c-num">2</div><div><div class="c-cmd">vitest run</div><div class="c-desc">Run all tests once.</div></div></div>
<div class="c-step"><div class="c-num">3</div><div><div class="c-cmd">vitest --coverage</div><div class="c-desc">Coverage report with c8 or istanbul.</div></div></div>
<div class="c-step"><div class="c-num">4</div><div><div class="c-cmd">vitest --ui</div><div class="c-desc">Browser-based test UI — beautiful and interactive.</div></div></div></div>`);

L('config','tsconfig & Tooling','advanced',
`// tsconfig.json — the TypeScript project configuration

const TSCONFIG_STRICT = {
  compilerOptions: {
    target:  "ES2022",
    module:  "ESNext",
    moduleResolution: "bundler",
    lib:     ["ES2022", "DOM", "DOM.Iterable"],
    outDir:  "./dist",
    rootDir: "./src",
    strict:           true,  // enables all strict checks
    noUncheckedIndexedAccess: true,
    exactOptionalPropertyTypes: true,
    noImplicitReturns:  true,
    noFallthroughCasesInSwitch: true,
    paths: { "@/*": ["./src/*"] },
    declaration: true,
    declarationMap: true,
    sourceMap: true,
  }
};

// What 'strict: true' enables:
const strictFlags = [
  "strictNullChecks       — null/undefined are separate types",
  "strictFunctionTypes    — contravariant function params",
  "strictBindCallApply   — typed bind/call/apply",
  "strictPropertyInit    — class props must be initialized",
  "noImplicitAny         — no implicit any types",
  "noImplicitThis        — this must be typed",
  "alwaysStrict          — emit 'use strict'",
];

// noUncheckedIndexedAccess — array[i] returns T | undefined
function safe(arr: string[], i: number): string {
  const val = arr[i];  // string | undefined (with the flag)
  if (val === undefined) return "out of bounds";
  return val.toUpperCase();  // safe — val narrowed to string
}

console.log("Recommended tsconfig settings:");
console.log(JSON.stringify(TSCONFIG_STRICT.compilerOptions, null, 2));
console.log("\\nStrict checks enabled:");
strictFlags.forEach(f => console.log(" ✓", f));
console.log("\\nResult:", safe(["a", "b", "c"], 1));
console.log("Bounds:", safe(["a", "b", "c"], 99));`,
`<div class="lesson-h2">tsconfig.json</div>
<p class="lesson-p">The <code>tsconfig.json</code> controls how TypeScript compiles your code. Always start with <code>"strict": true</code> — it enables a bundle of important checks that prevent common bugs.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">JSON — tsconfig (recommended)</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre>{
  "compilerOptions": {
    "target":  "<span class="st">ES2022</span>",
    "module":  "<span class="st">ESNext</span>",
    "moduleResolution": "<span class="st">bundler</span>",
    "strict": <span class="kw">true</span>,
    "noUncheckedIndexedAccess": <span class="kw">true</span>,
    "exactOptionalPropertyTypes": <span class="kw">true</span>,
    "paths": { "<span class="st">@/*</span>": ["<span class="st">./src/*</span>"] }
  }
}</pre></div>
<div class="lesson-h2">Essential Tools</div>
<table class="ref-table">
<tr><th>Tool</th><th>Purpose</th></tr>
<tr><td>tsc</td><td>TypeScript compiler — type check &amp; compile</td></tr>
<tr><td>tsx / ts-node</td><td>Run TS directly without compiling</td></tr>
<tr><td>Vite</td><td>Build tool with native TS support</td></tr>
<tr><td>esbuild</td><td>Fastest TS/JS bundler (no type checking)</td></tr>
<tr><td>biome</td><td>Fast formatter + linter (replaces eslint + prettier)</td></tr>
<tr><td>prettier</td><td>Opinionated formatter</td></tr>
<tr><td>eslint + typescript-eslint</td><td>Linting with TS rules</td></tr>
<tr><td>vitest</td><td>Fast TS-native test runner</td></tr>
<tr><td>zod / valibot</td><td>Runtime schema validation + type inference</td></tr>
</table>`);

L('perf','Performance & Patterns','advanced',
`// TypeScript performance patterns

// 1. Const assertions avoid unnecessary widening
function makeConfig<T extends Record<string, unknown>>(cfg: T): Readonly<T> {
  return Object.freeze(cfg);
}

const config = makeConfig({
  endpoint: "https://api.example.com",
  retries:  3,
  timeout:  5000,
});

// 2. Lazy evaluation with getters
class ExpensiveComputation {
  private _result?: number;

  get result(): number {
    if (this._result === undefined) {
      // Computed once, cached
      this._result = Array.from({ length: 1000000 }, (_, i) => i)
        .reduce((a, b) => a + b, 0);
    }
    return this._result;
  }
}

// 3. Object pooling with generics
class Pool<T> {
  private available: T[] = [];
  constructor(private factory: () => T, private reset: (obj: T) => void) {}

  acquire(): T {
    return this.available.pop() ?? this.factory();
  }

  release(obj: T): void {
    this.reset(obj);
    this.available.push(obj);
  }
}

// 4. Avoid large union types — use discriminated unions + lookup
type Handler<T = unknown> = (payload: T) => void;
const handlers = new Map<string, Handler>();
handlers.set("click", (e) => console.log("clicked", e));
handlers.set("hover", (e) => console.log("hovered", e));

function dispatch(type: string, payload: unknown): void {
  handlers.get(type)?.(payload);
}

const ec = new ExpensiveComputation();
console.log("Sum 0..999999:", ec.result);
console.log("Cached:", ec.result === ec.result);
console.log("Config:", config);

dispatch("click", { x: 10, y: 20 });`,
`<div class="lesson-h2">TypeScript Performance Tips</div>
<p class="lesson-p">TypeScript's type system itself can slow down compilation on large projects. Understanding what makes the compiler slow helps you write faster-to-compile and faster-to-run code.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">TypeScript — Perf Patterns</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm">// Prefer interfaces over complex type intersections</span>
<span class="cm">// (interfaces are cached, type aliases are re-evaluated)</span>
<span class="kw">interface</span> <span class="ty">User</span> { id: <span class="ty">number</span>; name: <span class="ty">string</span> }   <span class="cm">// ✓ fast</span>
<span class="kw">type</span> <span class="ty">User</span> = { id: <span class="ty">number</span> } & { name: <span class="ty">string</span> } <span class="cm">// ✗ slower</span>
<span class="cm">// Use 'isolatedModules' to catch issues early</span>
<span class="cm">// Use 'skipLibCheck: true' in large projects</span></pre></div>
<div class="lesson-h2">Compilation Speed</div>
<ul class="lesson-ul">
  <li>Enable <code>incremental: true</code> + <code>tsBuildInfoFile</code> — caches build state between compilations</li>
  <li>Use <code>skipLibCheck: true</code> — skips type checking of .d.ts declaration files</li>
  <li>Avoid deeply recursive conditional types — they slow the type checker significantly</li>
  <li>Prefer <code>interface</code> over complex <code>&amp;</code> intersection types — interfaces are cached</li>
  <li>Use <code>isolatedModules: true</code> — compatible with esbuild/swc for fast transpile-only builds</li>
  <li>Run <code>tsc --noEmit --diagnostics</code> to see what's slow</li>
</ul>`);

// ─────────────────────────────────────────
// SIMULATED OUTPUT
// ─────────────────────────────────────────
const SIM = {
  hello:        ['Hello, TypeScript!','Hello, World!','{ count: 0, flag: true, title: \'TS\', PI: 3.14159, arr: [1,2,3] }'],
  primitives:   ['HELLO','3.14','null','boolean number string'],
  functions:    ['5','Hello, Alice!','Hi, Bob!','15','3.14','hello','[2, 4, 6]'],
  objects:      ['{ id: 1, name: \'Alice\', role: \'admin\', permissions: [\'read\', \'write\'] }','{"id":2,"name":"Bob"}'],
  arrays:       ['[2, 4, 6, 8, 10]  [2, 4]  15','[1, 2, 3, 4, 5, 2, 4, 6, 8, 10]','a'],
  unions:       ['String ID: ABC-123','Number ID: 42','78.54','24'],
  narrowing:    ['HELLO','3.14','null'],
  classes:      ['Account[acc-1] Alice: 1300 USD','meow','moving...'],
  enums:        ['User is active','Awaiting approval','true','false'],
  modules:      ['App started at http://localhost:8080','http://localhost:3000','{ host: \'localhost\', port: 3000 }'],
  generics:     ['3  3  2','[[1,"a"],[2,"b"],[3,"c"]]','Alice'],
  utility:      ['[\'read\', \'write\', \'delete\']','{ name: \'Alice\' }  { id: 1, name: \'Alice\', role: \'admin\' }'],
  mapped:       ['{ id: 1, name: \'New Name\' }','{ id: 1, name: \'Alice\', age: 30 }'],
  conditional:  ['{ db: { host: \'localhost\' } }'],
  infer:        ['100px  50vh'],
  decorators:   ['Sealed: Calculator','Calling add(3, 4)','  → 7','Calling multiply(5, 6)','  → 30'],
  async:        ['all: one two three','race: fast','✓ ok','✗ fail','✓ also ok','any: winner'],
  errors:       ['Result: 5','undefined','404: User not found'],
  discriminated:['[{ id: ..., text: \'Learn TypeScript\', done: true }, { id: ..., text: \'Build something\', done: false }]','Ready to load','Loading…','1 users loaded','Error: Network timeout'],
  variance:     ['User 1','Order 42','Luna','Mochi','alice@example.com'],
  patterns:     ['Alice  true  2024-01-01','SELECT * FROM table WHERE status = \'active\' LIMIT 10 OFFSET 0'],
  react:        ['React + TypeScript component patterns ready.','Button, List<T>, useCounter hook, discriminated reducer — all typed.'],
  node:         ['Created: { id: 1, name: \'Alice\', email: \'alice@ts.dev\' } { id: 2, name: \'Bob\', email: \'bob@ts.dev\' }','All users: [{ id: 1, ... }, { id: 2, ... }]','Find 1: { id: 1, name: \'Alice\', email: \'alice@ts.dev\' }'],
  testing:      ['✓ math > adds numbers','✓ math > divides numbers','✓ math > throws on divide by zero','✓ UserService > registers user and sends welcome email','','Test Files  1 passed (1)','Tests       4 passed (4)'],
  config:       ['Recommended tsconfig settings:','  "target": "ES2022",','  "strict": true,','  "noUncheckedIndexedAccess": true,','','Strict checks enabled:','  ✓ strictNullChecks','  ✓ noImplicitAny','  ✓ strictFunctionTypes','','Result: B','Bounds: out of bounds'],
  perf:         ['Sum 0..999999: 499999500000','Cached: true','Config: { endpoint: \'https://api.example.com\', retries: 3, timeout: 5000 }','clicked { x: 10, y: 20 }'],
};

// ─────────────────────────────────────────
// STATE
// ─────────────────────────────────────────
let curLevel  = 'basic';
let curTopic  = null;
let editor    = null;
let edLoaded  = false;
let edVisible = true;
let curCode   = '';

// ─────────────────────────────────────────
// MONACO INIT
// ─────────────────────────────────────────
require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
require(['vs/editor/editor.main'], () => {
  edLoaded = true;
  editor = monaco.editor.create(document.getElementById('monacoContainer'), {
    value: '// Select a topic to begin\n// or write TypeScript here\n\nconst greet = (name: string): string => `Hello, ${name}!`;\n\nconsole.log(greet("TypeScript"));\n\ntype Point = { x: number; y: number };\nconst p: Point = { x: 3, y: 4 };\nconsole.log(Math.hypot(p.x, p.y));\n',
    language: 'typescript',
    theme: edTheme(),
    fontSize: 13,
    fontFamily: "'JetBrains Mono', monospace",
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    renderLineHighlight: 'all',
    automaticLayout: true,
    wordWrap: 'off',
    tabSize: 2,
    insertSpaces: true,
    folding: true,
    bracketPairColorization: { enabled: true },
  });
  // Configure TypeScript compiler options in Monaco
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2022,
    strict: true,
    noImplicitAny: true,
    strictNullChecks: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    allowSyntheticDefaultImports: true,
  });
});

function edTheme() {
  return document.body.getAttribute('data-theme') === 'light' ? 'vs' : 'vs-dark';
}

// ─────────────────────────────────────────
// INIT
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderList();
  selectTopic('hello');
});

// ─────────────────────────────────────────
// THEME / LEVEL
// ─────────────────────────────────────────
function setTheme(t, btn) {
  document.body.setAttribute('data-theme', t);
  document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (editor) monaco.editor.setTheme(edTheme());
}

function setLevel(level, btn) {
  curLevel = level;
  document.querySelectorAll('.level-tab').forEach(b => {
    b.className = 'level-tab';
    if (b.getAttribute('data-level') === level) b.classList.add(`active-${level}`);
  });
  renderList();
  const first = CURRICULUM[level][0];
  if (first) selectTopic(first.id);
}

// ─────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────
function renderList() {
  const q    = document.getElementById('searchInput').value.toLowerCase();
  const list = document.getElementById('topicList');
  let html   = '';
  const levels = q ? ['basic', 'medium', 'advanced'] : [curLevel];
  levels.forEach(level => {
    const topics = CURRICULUM[level].filter(t => !q || t.name.toLowerCase().includes(q));
    if (!topics.length) return;
    html += `<div class="sec-head">
      <div class="sec-dot dot-${level}"></div>
      <div class="sec-label">${level}</div>
      <div class="sec-count">${topics.length}</div>
    </div>`;
    topics.forEach(t => {
      html += `<div class="topic-item ${curTopic === t.id ? 'active' : ''}" id="ti-${t.id}" onclick="selectTopic('${t.id}')">
        <span class="t-icon">${t.icon}</span>
        <span class="t-name">${t.name}</span>
        ${t.badge ? `<span class="t-badge">${t.badge}</span>` : ''}
      </div>`;
    });
  });
  list.innerHTML = html || '<div style="padding:18px;text-align:center;color:var(--text3);font-size:13px;">No topics found</div>';
}

function filterTopics() { renderList(); }

// ─────────────────────────────────────────
// SELECT TOPIC
// ─────────────────────────────────────────
function selectTopic(id) {
  curTopic = id;
  const lesson = LESSONS[id];
  if (!lesson) return;
  document.querySelectorAll('.topic-item').forEach(e => e.classList.remove('active'));
  const el = document.getElementById(`ti-${id}`);
  if (el) { el.classList.add('active'); el.scrollIntoView({ block: 'nearest' }); }
  curCode = lesson.code;
  if (edLoaded && editor) {
    editor.setValue(lesson.code);
    document.getElementById('edFname').textContent = `${id}.ts`;
  }
  renderLesson(lesson);
  clearOutput();
  updateCtx();
}

function renderLesson(lesson) {
  document.getElementById('emptyState').classList.add('hidden');
  const c = document.getElementById('lessonContent');
  c.classList.remove('hidden');
  const lc = { basic: 'var(--accent3)', medium: 'var(--accent)', advanced: 'var(--accent2)' };
  const col = lc[lesson.level] || 'var(--accent)';
  c.innerHTML = `<div class="fade-in">
    <div class="lesson-title">${lesson.title}</div>
    <div class="lesson-meta">
      <span class="l-tag" style="background:${col}20;border:1px solid ${col}50;color:${col}">${lesson.level.toUpperCase()}</span>
      <span class="l-tag" style="background:var(--bg3);border:1px solid var(--border);color:var(--text3);font-family:var(--mono);font-size:10px;">TypeScript 5.x</span>
    </div>
    <div class="lesson-divider"></div>
    <div>${lesson.content()}</div>
    <div class="lesson-nav">
      <button class="nav-btn primary" onclick="runCode()">▶ Run in Editor</button>
      <button class="nav-btn" onclick="nextTopic()">Next Topic →</button>
    </div>
  </div>`;
}

function nextTopic() {
  const all = [...CURRICULUM.basic, ...CURRICULUM.medium, ...CURRICULUM.advanced];
  const idx = all.findIndex(t => t.id === curTopic);
  if (idx >= 0 && idx < all.length - 1) {
    const next = all[idx + 1];
    setLevel(next.tag, document.querySelector(`[data-level="${next.tag}"]`));
    selectTopic(next.id);
  }
}

// ─────────────────────────────────────────
// CONTENT TABS
// ─────────────────────────────────────────
function switchTab(tab, btn) {
  document.querySelectorAll('.c-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const pane = document.getElementById('lessonPane');

  if (tab === 'exercises') {
    pane.innerHTML = `<div class="fade-in" style="max-width:680px">
      <div class="lesson-title">Exercises</div>
      <div class="lesson-divider"></div>
      <div class="callout callout-info"><div class="callout-icon">🏋</div><div class="callout-body"><div class="callout-title">Practice Problems</div><div class="callout-text">Write solutions in the editor. Aim for strict, type-safe implementations with no <code>any</code>.</div></div></div>
      <div class="lesson-h2">Type System</div>
      <ul class="lesson-ul">
        <li>Implement a <code>DeepReadonly&lt;T&gt;</code> mapped type that recursively makes all properties readonly</li>
        <li>Build a type-safe event emitter with typed events — <code>on("click", handler)</code> where handler is typed to the event payload</li>
        <li>Write a <code>Pipe&lt;Fns&gt;</code> type that computes the return type of piped functions</li>
        <li>Implement a branded type system for currency: <code>USD</code>, <code>EUR</code>, <code>GBP</code> — prevent adding different currencies</li>
      </ul>
      <div class="lesson-h2">Patterns & APIs</div>
      <ul class="lesson-ul">
        <li>Build a typed <code>Result&lt;T, E&gt;</code> monad with <code>map</code>, <code>flatMap</code>, <code>unwrap</code>, and <code>match</code> methods</li>
        <li>Create a type-safe query builder for SQL with fluent interface and generic table schemas</li>
        <li>Implement a typed Redux-style store with discriminated union actions and a typed <code>useSelector</code> hook</li>
        <li>Write a decorator that validates method arguments using Zod schemas at runtime</li>
      </ul>
      <div class="lesson-h2">Advanced Types</div>
      <ul class="lesson-ul">
        <li>Create a <code>JSONValue</code> type that precisely represents all valid JSON values (recursive)</li>
        <li>Implement <code>TupleToUnion&lt;T&gt;</code> and <code>UnionToTuple&lt;T&gt;</code></li>
        <li>Write a <code>ParseRoute&lt;"/users/:id/posts/:postId"&gt;</code> type that extracts param names as a typed object</li>
        <li>Build a type-safe <code>pick(obj, keys)</code> function that returns the correct subtype</li>
      </ul>
    </div>`;
  } else if (tab === 'reference') {
    pane.innerHTML = `<div class="fade-in" style="max-width:780px">
      <div class="lesson-title">Quick Reference</div>
      <div class="lesson-divider"></div>
      <div class="lesson-h2">Type Operators</div>
      <table class="ref-table">
        <tr><th>Operator</th><th>Meaning</th><th>Example</th></tr>
        <tr><td>keyof T</td><td>Union of T's keys</td><td>keyof User → "id" | "name"</td></tr>
        <tr><td>T[K]</td><td>Indexed access type</td><td>User["name"] → string</td></tr>
        <tr><td>typeof x</td><td>Type of value x</td><td>typeof config</td></tr>
        <tr><td>T extends U</td><td>Constraint / conditional</td><td>T extends string ? A : B</td></tr>
        <tr><td>infer U</td><td>Capture type variable</td><td>T extends Promise&lt;infer U&gt;</td></tr>
        <tr><td>T | U</td><td>Union — one of</td><td>string | number</td></tr>
        <tr><td>T & U</td><td>Intersection — both</td><td>A & B</td></tr>
        <tr><td>as const</td><td>Narrow to literal types</td><td>["a"] as const</td></tr>
        <tr><td>satisfies</td><td>Check without widening</td><td>config satisfies Config</td></tr>
      </table>
      <div class="lesson-h2">Built-in Utility Types</div>
      <table class="ref-table">
        <tr><th>Type</th><th>Purpose</th></tr>
        <tr><td>Partial&lt;T&gt;</td><td>All properties optional</td></tr>
        <tr><td>Required&lt;T&gt;</td><td>All properties required</td></tr>
        <tr><td>Readonly&lt;T&gt;</td><td>All properties readonly</td></tr>
        <tr><td>Pick&lt;T, K&gt;</td><td>Keep only K keys</td></tr>
        <tr><td>Omit&lt;T, K&gt;</td><td>Remove K keys</td></tr>
        <tr><td>Record&lt;K, V&gt;</td><td>Map keys K to values V</td></tr>
        <tr><td>Exclude&lt;T, U&gt;</td><td>Remove U from T union</td></tr>
        <tr><td>Extract&lt;T, U&gt;</td><td>Keep only U in T union</td></tr>
        <tr><td>NonNullable&lt;T&gt;</td><td>Remove null/undefined</td></tr>
        <tr><td>ReturnType&lt;F&gt;</td><td>Function return type</td></tr>
        <tr><td>Parameters&lt;F&gt;</td><td>Function param tuple</td></tr>
        <tr><td>Awaited&lt;T&gt;</td><td>Unwrap Promise type</td></tr>
        <tr><td>ConstructorParameters&lt;C&gt;</td><td>Class constructor params</td></tr>
        <tr><td>InstanceType&lt;C&gt;</td><td>Class instance type</td></tr>
        <tr><td>NoInfer&lt;T&gt;</td><td>Block inference (TS 5.4)</td></tr>
      </table>
      <div class="lesson-h2">CLI Commands</div>
      <table class="ref-table">
        <tr><th>Command</th><th>Purpose</th></tr>
        <tr><td>tsc</td><td>Compile project</td></tr>
        <tr><td>tsc --noEmit</td><td>Type-check only</td></tr>
        <tr><td>tsc --watch</td><td>Watch mode</td></tr>
        <tr><td>tsc --diagnostics</td><td>Show compilation stats</td></tr>
        <tr><td>npx tsx file.ts</td><td>Run without compiling</td></tr>
        <tr><td>npx tsc --init</td><td>Generate tsconfig.json</td></tr>
      </table>
    </div>`;
  } else {
    if (curTopic && LESSONS[curTopic]) renderLesson(LESSONS[curTopic]);
  }
}

// ─────────────────────────────────────────
// CODE ACTIONS
// ─────────────────────────────────────────
function loadCode() {
  if (edLoaded && editor) editor.setValue(curCode || '');
}
function copyBlock(btn) {
  const pre = btn.closest('.code-block').querySelector('pre');
  navigator.clipboard.writeText(pre.textContent).then(() => {
    const o = btn.textContent;
    btn.textContent = '✓ Copied';
    setTimeout(() => btn.textContent = o, 1500);
  });
}
function copyCode() {
  if (!editor) return;
  navigator.clipboard.writeText(editor.getValue()).then(() => addOut('// Copied!', 'li'));
}
function resetCode() {
  if (!editor || !curTopic) return;
  const l = LESSONS[curTopic];
  if (l) { editor.setValue(l.code); curCode = l.code; }
  clearOutput();
}

// ─────────────────────────────────────────
// SIMULATED RUN
// ─────────────────────────────────────────
async function runCode() {
  const ind = document.getElementById('outInd');
  const out = document.getElementById('outBody');
  ind.className = 'out-ind running';
  out.innerHTML = '<span class="li">// Compiling…</span>';
  await sleep(180);
  out.innerHTML = '<span class="li">// Running…</span>';
  await sleep(200);
  ind.className = 'out-ind success';
  const lines = SIM[curTopic] || ['// (no simulated output for this topic)'];
  out.innerHTML = `<span class="li">$ tsx ${curTopic || 'main'}.ts</span>\n\n`;
  for (const line of lines) {
    out.innerHTML += escHtml(line) + '\n';
    await sleep(40);
  }
  out.innerHTML += `\n<span class="ls">// exited with code 0</span>`;
  out.scrollTop = out.scrollHeight;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function addOut(t, c) {
  const o = document.getElementById('outBody');
  o.innerHTML += `<span class="${c}">${escHtml(t)}</span>\n`;
  o.scrollTop = o.scrollHeight;
}
function clearOutput() {
  document.getElementById('outBody').innerHTML = '<span class="li">// Ready — click ▶ Run</span>';
  document.getElementById('outInd').className = 'out-ind';
}
function toggleEditor() {
  const ep = document.getElementById('editorPanel');
  edVisible = !edVisible;
  ep.style.display = edVisible ? 'flex' : 'none';
  if (editor) editor.layout();
}

// ─────────────────────────────────────────
// SPLITTER DRAG
// ─────────────────────────────────────────
let dragging = false, startX = 0, startW = 0;

function startDrag(e) {
  dragging = true; startX = e.clientX;
  startW = document.getElementById('sidebar').offsetWidth;
  document.getElementById('splitter').classList.add('dragging');
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
}
function onDrag(e) {
  if (!dragging) return;
  const w = Math.min(Math.max(startW + (e.clientX - startX), 180), 380);
  document.getElementById('sidebar').style.width = w + 'px';
}
function stopDrag() {
  dragging = false;
  document.getElementById('splitter').classList.remove('dragging');
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
  if (editor) editor.layout();
}

// ─────────────────────────────────────────
// AI CHAT
// ─────────────────────────────────────────
let aiOpen = false, aiTab = 'chat', aiProv = null, aiSet = {}, aiHistory = [], aiTyping = false;

const PROVS = {
  claude: { name: 'CLAUDE', model: 'claude-sonnet-4-20250514' },
  ollama: { name: 'OLLAMA', model: 'llama3.2:latest' },
  openai: { name: 'OPENAI', model: 'gpt-4o' },
  xai:    { name: 'XAI',    model: 'grok-2-latest' },
  gemini: { name: 'GEMINI', model: 'gemini-2.0-flash' },
};

function toggleAI() { aiOpen ? closeAI() : openAI(); }
function openAI() {
  aiOpen = true;
  document.getElementById('aiPanel').classList.add('open');
  document.getElementById('aiOverlay').classList.add('open');
  updateAIHd(); updateCtx();
}
function closeAI() {
  aiOpen = false;
  document.getElementById('aiPanel').classList.remove('open');
  document.getElementById('aiOverlay').classList.remove('open');
}
function switchAITab(t) {
  aiTab = t;
  document.getElementById('tabChat').classList.toggle('active', t === 'chat');
  document.getElementById('tabSettings').classList.toggle('active', t === 'settings');
  document.getElementById('aiChatPane').style.display = t === 'chat' ? 'flex' : 'none';
  document.getElementById('aiSettingsPane').style.display = t === 'settings' ? 'flex' : 'none';
}
function selProv(id) {
  aiProv = id;
  Object.keys(PROVS).forEach(p => {
    document.getElementById(`card-${p}`)?.classList.toggle('sel', p === id);
    document.getElementById(`use-${p}`)?.classList.toggle('active', p === id);
    const f = document.getElementById(`fields-${p}`);
    if (f) f.style.display = p === id ? 'flex' : 'none';
  });
  saveProv(); updateAIHd();
}
function saveProv() {
  Object.keys(PROVS).forEach(p => {
    const k = document.getElementById(`key-${p}`);
    const u = document.getElementById(`url-${p}`);
    const m = document.getElementById(`model-${p}`);
    aiSet[p] = { key: k?.value.trim() || '', url: u?.value.trim() || '', model: m?.value.trim() || PROVS[p].model };
  });
}
function updateAIHd() {
  const dot  = document.getElementById('aiDot');
  const nm   = document.getElementById('aiPname');
  const tag  = document.getElementById('aiMtag');
  const hint = document.getElementById('cfgHint');
  if (aiProv && PROVS[aiProv]) {
    dot.classList.remove('off');
    nm.textContent  = PROVS[aiProv].name;
    tag.textContent = aiSet[aiProv]?.model || PROVS[aiProv].model;
    if (hint) hint.style.display = 'none';
  } else {
    dot.classList.add('off');
    nm.textContent = 'NO PROVIDER'; tag.textContent = '';
    if (hint) hint.style.display = '';
  }
}
function updateCtx() {
  const el = document.getElementById('aiCtx');
  el.textContent = curTopic && LESSONS[curTopic] ? 'TOPIC: ' + LESSONS[curTopic].title : 'TOPIC: none';
}
function clearChat() { aiHistory = []; renderMsgs(); }
function aiKeydown(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } }
function aiResize(el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 110) + 'px'; }

async function sendMsg() {
  const inp  = document.getElementById('aiInp');
  const text = inp.value.trim();
  if (!text || aiTyping) return;
  if (!aiProv) { switchAITab('settings'); return; }
  aiHistory.push({ role: 'user', content: text, time: now() });
  inp.value = ''; inp.style.height = 'auto';
  renderMsgs(); aiTyping = true;
  document.getElementById('aiSendBtn').disabled = true;
  showTyping();
  try {
    const reply = await callAI(buildMsgs());
    aiHistory.push({ role: 'assistant', content: reply, time: now() });
  } catch (e) {
    aiHistory.push({ role: 'assistant', content: `⚠️ ${e.message}`, time: now() });
  }
  aiTyping = false;
  document.getElementById('aiSendBtn').disabled = false;
  renderMsgs();
}

function buildMsgs() {
  let sys = 'You are an expert TypeScript tutor. Be precise, idiomatic, and type-safe. Use triple-backtick ```typescript code blocks. Prefer strict TypeScript — avoid any, use unknown, prefer interfaces for objects, and explain the type-level reasoning behind your answers.';
  if (curTopic && LESSONS[curTopic]) {
    sys += ` The student is studying "${LESSONS[curTopic].title}".`;
    if (editor) { const code = editor.getValue(); if (code && code.length < 2000) sys += ` Their editor:\n\`\`\`typescript\n${code}\n\`\`\``; }
  }
  const msgs = [{ role: 'system', content: sys }];
  aiHistory.slice(-8).forEach(m => msgs.push({ role: m.role, content: m.content }));
  return msgs;
}

async function callAI(messages) {
  const p = aiProv, s = aiSet[p] || {}, model = s.model || PROVS[p].model;
  if (p === 'claude') {
    const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': s.key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, body: JSON.stringify({ model, max_tokens: 1024, system: messages[0]?.content, messages: messages.filter(m => m.role !== 'system') }) });
    const d = await res.json(); if (!res.ok) throw new Error(d.error?.message || `HTTP ${res.status}`); return d.content[0].text;
  }
  if (p === 'ollama') {
    const base = (s.url || 'http://localhost:11434').replace(/\/$/, '');
    const res = await fetch(`${base}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model, messages, stream: false }) });
    const d = await res.json(); if (!res.ok) throw new Error(d.error || `HTTP ${res.status}`); return d.message?.content || '';
  }
  if (p === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${s.key}` }, body: JSON.stringify({ model, messages, max_tokens: 1024 }) });
    const d = await res.json(); if (!res.ok) throw new Error(d.error?.message || `HTTP ${res.status}`); return d.choices[0].message.content;
  }
  if (p === 'xai') {
    const res = await fetch('https://api.x.ai/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${s.key}` }, body: JSON.stringify({ model, messages, max_tokens: 1024 }) });
    const d = await res.json(); if (!res.ok) throw new Error(d.error?.message || `HTTP ${res.status}`); return d.choices[0].message.content;
  }
  if (p === 'gemini') {
    const gm = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
    const sys = messages.find(m => m.role === 'system');
    const body = { contents: gm }; if (sys) body.systemInstruction = { parts: [{ text: sys.content }] };
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${s.key}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await res.json(); if (!res.ok) throw new Error(d.error?.message || `HTTP ${res.status}`); return d.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
  throw new Error('Unknown provider');
}

function renderMsgs() {
  const c = document.getElementById('aiMsgs');
  const empty = document.getElementById('aiEmpty');
  if (!aiHistory.length) {
    empty.style.display = 'flex';
    c.querySelectorAll('.ai-msg, .ai-typing').forEach(e => e.remove());
    return;
  }
  empty.style.display = 'none';
  c.querySelectorAll('.ai-msg, .ai-typing').forEach(e => e.remove());
  aiHistory.forEach(msg => {
    const el  = document.createElement('div'); el.className = `ai-msg ${msg.role}`;
    const bub = document.createElement('div'); bub.className = 'ai-bubble';
    bub.innerHTML = fmtAI(msg.content);
    const t = document.createElement('div'); t.className = 'ai-time'; t.textContent = msg.time;
    el.appendChild(bub); el.appendChild(t); c.appendChild(el);
  });
  if (aiTyping) showTyping();
  c.scrollTop = c.scrollHeight;
}
function showTyping() {
  const c = document.getElementById('aiMsgs');
  c.querySelectorAll('.ai-typing').forEach(e => e.remove());
  const el = document.createElement('div'); el.className = 'ai-msg assistant';
  const t  = document.createElement('div'); t.className = 'ai-typing';
  t.innerHTML = '<span></span><span></span><span></span>';
  el.appendChild(t); c.appendChild(el); c.scrollTop = c.scrollHeight;
}
function fmtAI(text) {
  let h = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  h = h.replace(/```(?:typescript|ts|javascript|js|bash|sh)?\n?([\s\S]*?)```/g, (_, code) => `<pre>${code.trimEnd()}</pre>`);
  h = h.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  h = h.replace(/\n/g, '<br>');
  return h;
}
function now() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }