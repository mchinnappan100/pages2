/* ─────────────────────────────────────────────────────────────
   Mastering Python — Application Logic
   Curriculum · Lessons · Monaco · Simulation · AI Chat
───────────────────────────────────────────────────────────── */

// ─────────────────────────────────────────
// CURRICULUM
// ─────────────────────────────────────────
const CURRICULUM = {
  basic: [
    { id:'hello',      icon:'👋', name:'Hello, World!',         tag:'basic' },
    { id:'variables',  icon:'📦', name:'Variables & Types',      tag:'basic' },
    { id:'strings',    icon:'📝', name:'Strings',                tag:'basic' },
    { id:'control',    icon:'🔀', name:'Control Flow',           tag:'basic' },
    { id:'functions',  icon:'⚡', name:'Functions',              tag:'basic' },
    { id:'lists',      icon:'📋', name:'Lists & Tuples',         tag:'basic' },
    { id:'dicts',      icon:'🗺', name:'Dictionaries & Sets',    tag:'basic' },
    { id:'classes',    icon:'🏗', name:'Classes & OOP',          tag:'basic' },
    { id:'fileio',     icon:'📁', name:'File I/O',               tag:'basic' },
    { id:'exceptions', icon:'⚠️', name:'Exceptions',             tag:'basic' },
  ],
  medium: [
    { id:'comprehensions', icon:'🔣', name:'Comprehensions',         tag:'medium' },
    { id:'iterators',      icon:'🔄', name:'Iterators & Generators', tag:'medium' },
    { id:'decorators',     icon:'🎨', name:'Decorators',             tag:'medium' },
    { id:'context',        icon:'🔧', name:'Context Managers',       tag:'medium' },
    { id:'functools',      icon:'λ',  name:'Functional Tools',       tag:'medium' },
    { id:'modules',        icon:'📦', name:'Modules & Packages',     tag:'medium' },
    { id:'typing',         icon:'🏷', name:'Type Hints',             tag:'medium', badge:'3.10+' },
    { id:'testing',        icon:'🧪', name:'Testing',                tag:'medium' },
  ],
  advanced: [
    { id:'async',       icon:'🌊', name:'Async / Await',           tag:'advanced' },
    { id:'numpy',       icon:'🔢', name:'NumPy',                   tag:'advanced', badge:'data' },
    { id:'pandas',      icon:'🐼', name:'Pandas',                  tag:'advanced', badge:'data' },
    { id:'ml',          icon:'🤖', name:'Scikit-learn & ML',       tag:'advanced', badge:'ml' },
    { id:'webapi',      icon:'🌐', name:'FastAPI & Web',           tag:'advanced', badge:'web' },
    { id:'concurrency', icon:'⚙️', name:'Concurrency & Threads',   tag:'advanced' },
    { id:'metaclass',   icon:'🔮', name:'Metaclasses & Protocols', tag:'advanced' },
    { id:'perf',        icon:'📈', name:'Performance & Profiling', tag:'advanced', badge:'perf' },
  ]
};

// ─────────────────────────────────────────
// LESSONS
// ─────────────────────────────────────────
const LESSONS = {};
function L(id, title, level, code, html) {
  LESSONS[id] = { title, level, code, content: () => html };
}

L('hello','Hello, World!','basic',
`import sys
import platform

print("Hello, World!")
print(f"Python {sys.version}")
print(f"Platform: {platform.system()}")

name = "Pythonista"
year = 2024
print(f"Welcome, {name}! Year: {year}")

x, y, z = 1, 2, 3
print(x, y, z)

for _ in range(3):
    print("spam", end=" ")
print()`,
`<div class="lesson-h2">Welcome to Python</div>
<p class="lesson-p">Python is the world's most popular programming language — used in web development, data science, machine learning, automation, and scripting. Its philosophy: <em>"There should be one obvious way to do it."</em></p>
<div class="callout callout-info"><div class="callout-icon">ℹ️</div><div class="callout-body"><div class="callout-title">Why Python?</div><div class="callout-text">Python powers Instagram, Spotify, Dropbox, Reddit, NASA, and virtually every major ML framework. NumPy, PyTorch, TensorFlow, FastAPI, Django — the ecosystem is unmatched for data and AI work.</div></div></div>
<div class="lesson-h2">Your First Program</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">print</span>(<span class="st">"Hello, World!"</span>)

<span class="cm"># f-strings (3.6+) — the preferred way to format</span>
name = <span class="st">"Alice"</span>
age  = <span class="nm">30</span>
<span class="kw">print</span>(<span class="st">f"{name} is {age} years old"</span>)</pre></div>
<div class="lesson-h2">Setup</div>
<div class="compile-box"><div class="cbox-title">🔧 Getting Started</div>
<div class="c-step"><div class="c-num">1</div><div><div class="c-cmd">brew install python   # or python.org</div><div class="c-desc">Verify with <code>python3 --version</code>. Use <code>pyenv</code> for multiple versions.</div></div></div>
<div class="c-step"><div class="c-num">2</div><div><div class="c-cmd">python3 main.py</div><div class="c-desc">Run a script directly from the terminal.</div></div></div>
<div class="c-step"><div class="c-num">3</div><div><div class="c-cmd">python3 -m venv .venv && source .venv/bin/activate</div><div class="c-desc">Always use virtual environments for projects.</div></div></div>
<div class="c-step"><div class="c-num">4</div><div><div class="c-cmd">pip install numpy pandas scikit-learn fastapi</div><div class="c-desc">Install packages from PyPI.</div></div></div></div>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">Indentation is syntax</div><div class="callout-text">Python uses 4-space indentation to define code blocks — no curly braces. Inconsistent indentation causes <code>IndentationError</code>. PEP 8 is Python's style guide.</div></div></div>`);

L('variables','Variables & Types','basic',
`x = 42
pi = 3.14159
name = "Python"
active = True
nothing = None

print(type(x), type(pi), type(name))

a = b = c = 0
x, y = 1, 2
x, y = y, x   # swap!
print(x, y)

n = int("42")
f = float("3.14")
s = str(100)
b = bool(0)
print(n, f, s, b)

big = 10 ** 100
print(big)

count = 0
count += 1
count *= 2
print(count)

import re
text = "price: $42.50"
if m := re.search(r'\\$(\\d+\\.\\d+)', text):
    print(f"Found price: {m.group(1)}")`,
`<div class="lesson-h2">Dynamic Typing</div>
<p class="lesson-p">Python variables are <strong>dynamically typed</strong>. The type is attached to the object, not the variable. You can reassign a variable to any type at any time.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — Variables</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre>x = <span class="nm">42</span>         <span class="cm"># int</span>
x = <span class="st">"hello"</span>    <span class="cm"># now str — fine!</span>
x = [<span class="nm">1</span>, <span class="nm">2</span>, <span class="nm">3</span>] <span class="cm"># now list</span>
<span class="kw">print</span>(<span class="bi">type</span>(x)) <span class="cm"># &lt;class 'list'&gt;</span>
a, b = b, a    <span class="cm"># swap — no temp needed</span></pre></div>
<div class="lesson-h2">Built-in Types</div>
<table class="ref-table">
<tr><th>Type</th><th>Example</th><th>Notes</th></tr>
<tr><td>int</td><td>42, -7, 10**100</td><td>Arbitrary precision</td></tr>
<tr><td>float</td><td>3.14, 1e9</td><td>64-bit IEEE 754</td></tr>
<tr><td>bool</td><td>True, False</td><td>Subclass of int</td></tr>
<tr><td>str</td><td>"hello"</td><td>Immutable Unicode</td></tr>
<tr><td>bytes</td><td>b"data"</td><td>Immutable byte seq</td></tr>
<tr><td>NoneType</td><td>None</td><td>The null value</td></tr>
</table>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">Truthiness</div><div class="callout-text"><code>0</code>, <code>0.0</code>, <code>""</code>, <code>[]</code>, <code>{}</code>, <code>set()</code>, and <code>None</code> are all falsy. Everything else is truthy. Use directly in <code>if x:</code>.</div></div></div>`);

L('strings','Strings','basic',
`s = "Hello, Python!"
print(len(s))
print(s.upper())
print(s[0], s[-1])
print(s[7:13])
print(s[::-1])

name, score = "Alice", 98.5
print(f"{name} scored {score:.1f}%")
print(f"{2**10 = }")
print(f"{'center':^20}")

words = "  hello world  "
print(words.strip())
print(words.split())
print(", ".join(["a", "b", "c"]))
print("hello".replace("l", "L"))
print("Python".startswith("Py"))
print("hello world".find("world"))

path = r"C:\\Users\\name\\file.txt"
print(path)

text = """Line 1
Line 2
Line 3"""
print(text.count("Line"))`,
`<div class="lesson-h2">String Basics</div>
<p class="lesson-p">Python strings are immutable Unicode sequences. They support rich slicing, a large method library, and expressive f-string formatting.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — Strings</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre>s = <span class="st">"Hello, World!"</span>
s[<span class="nm">0</span>]          <span class="cm"># 'H'</span>
s[-<span class="nm">1</span>]         <span class="cm"># '!'</span>
s[<span class="nm">7</span>:<span class="nm">12</span>]       <span class="cm"># 'World'</span>
s[::<span class="nm">-1</span>]       <span class="cm"># reversed</span>
s.<span class="fn">upper</span>()     <span class="cm"># 'HELLO, WORLD!'</span>
s.<span class="fn">split</span>(<span class="st">","</span>)  <span class="cm"># ['Hello', ' World!']</span>
<span class="st">" "</span>.<span class="fn">join</span>([<span class="st">"a"</span>,<span class="st">"b"</span>])  <span class="cm"># 'a b'</span></pre></div>
<div class="lesson-h2">f-Strings (Python 3.6+)</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — f-strings</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre>name = <span class="st">"Alice"</span>; n = <span class="nm">3.14159</span>
<span class="kw">print</span>(<span class="st">f"{n:.2f}"</span>)        <span class="cm"># 3.14</span>
<span class="kw">print</span>(<span class="st">f"{2**10 = }"</span>)     <span class="cm"># 2**10 = 1024 (debug!)</span>
<span class="kw">print</span>(<span class="st">f"{name:>10}"</span>)     <span class="cm"># right-align in 10 chars</span>
<span class="kw">print</span>(<span class="st">f"{1000000:,}"</span>)    <span class="cm"># 1,000,000</span>
<span class="kw">print</span>(<span class="st">f"{0.5:.0%}"</span>)      <span class="cm"># 50%</span></pre></div>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">Strings are immutable</div><div class="callout-text">Operations like <code>.upper()</code> return a new string. For building strings in a loop, collect in a list and <code>"".join()</code> at the end — much faster than <code>s += ...</code>.</div></div></div>`);

L('control','Control Flow','basic',
`def grade(score):
    match score // 10:
        case 10 | 9: return 'A'
        case 8:      return 'B'
        case 7:      return 'C'
        case 6:      return 'D'
        case _:      return 'F'

x = 42
if x > 100:
    print("big")
elif x > 10:
    print("medium")
else:
    print("small")

label = "even" if x % 2 == 0 else "odd"
print(label)

fruits = ["apple", "banana", "cherry"]
for i, fruit in enumerate(fruits, start=1):
    print(f"{i}. {fruit}")

pairs = zip([1, 2, 3], ["a", "b", "c"])
for n, c in pairs:
    print(n, c)

n = 1
while n < 32:
    n *= 2
else:
    print(f"final n = {n}")

for s in [95, 82, 71, 55]:
    print(f"{s}: {grade(s)}")`,
`<div class="lesson-h2">if / elif / else</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — Conditionals</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">if</span> x > <span class="nm">0</span>:
    <span class="kw">print</span>(<span class="st">"positive"</span>)
<span class="kw">elif</span> x == <span class="nm">0</span>:
    <span class="kw">print</span>(<span class="st">"zero"</span>)
<span class="kw">else</span>:
    <span class="kw">print</span>(<span class="st">"negative"</span>)
result = <span class="st">"yes"</span> <span class="kw">if</span> condition <span class="kw">else</span> <span class="st">"no"</span>
<span class="kw">if</span> <span class="nm">0</span> &lt;= age &lt; <span class="nm">18</span>: <span class="kw">print</span>(<span class="st">"minor"</span>) <span class="cm"># chained</span></pre></div>
<div class="lesson-h2">Loops</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — for / while</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">for</span> i <span class="kw">in</span> <span class="bi">range</span>(<span class="nm">5</span>): <span class="kw">print</span>(i)
<span class="kw">for</span> i, v <span class="kw">in</span> <span class="bi">enumerate</span>(lst):  ... <span class="cm"># index+value</span>
<span class="kw">for</span> a, b <span class="kw">in</span> <span class="bi">zip</span>(l1, l2):    ... <span class="cm"># parallel</span>
<span class="kw">for</span> v <span class="kw">in</span> <span class="bi">reversed</span>(lst):    ...
<span class="kw">for</span> v <span class="kw">in</span> <span class="bi">sorted</span>(lst):      ...</pre></div>
<div class="lesson-h2">match / case (3.10+)</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — match</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">match</span> command.split():
    <span class="kw">case</span> [<span class="st">"quit"</span>]:
        <span class="kw">print</span>(<span class="st">"quitting"</span>)
    <span class="kw">case</span> [<span class="st">"go"</span>, direction]:
        <span class="kw">print</span>(<span class="st">f"going {direction}"</span>)
    <span class="kw">case</span> [<span class="st">"pick"</span>, *items]:
        <span class="kw">print</span>(<span class="st">f"picking {items}"</span>)
    <span class="kw">case</span> _:
        <span class="kw">print</span>(<span class="st">"unknown"</span>)</pre></div>`);

L('functions','Functions','basic',
`from functools import cache

def greet(name: str, greeting: str = "Hello") -> str:
    """Return a greeting string."""
    return f"{greeting}, {name}!"

print(greet("Alice"))
print(greet("Bob", greeting="Hi"))

def stats(*nums: float) -> dict:
    return {"min": min(nums), "max": max(nums),
            "mean": sum(nums) / len(nums)}

print(stats(3, 1, 4, 1, 5, 9, 2, 6))

def config(**kwargs):
    for k, v in kwargs.items():
        print(f"  {k} = {v}")

config(host="localhost", port=8080, debug=True)

double = lambda x: x * 2
print(list(map(double, [1, 2, 3, 4, 5])))

@cache
def fib(n: int) -> int:
    if n < 2: return n
    return fib(n-1) + fib(n-2)

print([fib(i) for i in range(10)])

args = [1, 2, 3]
def add(a, b, c): return a + b + c
print(add(*args))`,
`<div class="lesson-h2">Defining Functions</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — Functions</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">def</span> <span class="fn">greet</span>(name: <span class="ty">str</span>, greeting: <span class="ty">str</span> = <span class="st">"Hello"</span>) -> <span class="ty">str</span>:
    <span class="dc">"""Docstring — shown in help() and IDEs."""</span>
    <span class="kw">return</span> <span class="st">f"{greeting}, {name}!"</span>
<span class="fn">greet</span>(<span class="st">"Alice"</span>)
<span class="fn">greet</span>(<span class="st">"Bob"</span>, greeting=<span class="st">"Hi"</span>)</pre></div>
<div class="lesson-h2">*args and **kwargs</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — Variadic</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">def</span> <span class="fn">f</span>(*args, **kwargs):
    <span class="kw">print</span>(args)    <span class="cm"># tuple of positional args</span>
    <span class="kw">print</span>(kwargs)  <span class="cm"># dict of keyword args</span>
<span class="cm"># Positional-only (/) and keyword-only (*)</span>
<span class="kw">def</span> <span class="fn">g</span>(pos_only, /, normal, *, kw_only): ...
<span class="cm"># Unpacking</span>
<span class="kw">print</span>(*[<span class="nm">1</span>, <span class="nm">2</span>, <span class="nm">3</span>])
<span class="fn">func</span>(**{<span class="st">"a"</span>: <span class="nm">1</span>})</pre></div>
<div class="callout callout-warn"><div class="callout-icon">⚠️</div><div class="callout-body"><div class="callout-title">Mutable default arguments trap</div><div class="callout-text">Never: <code>def f(lst=[]):</code> — the list is shared across all calls. Use <code>def f(lst=None): lst = lst or []</code> instead. Classic Python gotcha.</div></div></div>`);

L('lists','Lists & Tuples','basic',
`from collections import deque, namedtuple

fruits = ["apple", "banana", "cherry"]
fruits.append("date")
fruits.insert(1, "avocado")
fruits.remove("banana")
print(fruits)
print(fruits[1:3])
print(fruits[::-1])

nums = [3, 1, 4, 1, 5, 9, 2, 6]
nums.sort()
print(nums)
print(sorted(nums, reverse=True))

stack = []
stack.append(1); stack.append(2); stack.append(3)
print(stack.pop())

queue = deque([1, 2, 3])
queue.append(4)
print(queue.popleft())

point = (3, 4)
x, y = point
print(x, y)

Point = namedtuple("Point", ["x", "y"])
p = Point(x=3, y=4)
print(p.x, p.y)

first, *rest = [1, 2, 3, 4, 5]
*init, last  = [1, 2, 3, 4, 5]
print(first, rest, init, last)`,
`<div class="lesson-h2">Lists</div>
<p class="lesson-p">Lists are Python's workhorse — mutable, ordered, and can hold any mix of types. They support rich slicing and many methods.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — Lists</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre>lst = [<span class="nm">1</span>, <span class="nm">2</span>, <span class="nm">3</span>]
lst.<span class="fn">append</span>(<span class="nm">4</span>)
lst.<span class="fn">extend</span>([<span class="nm">5</span>, <span class="nm">6</span>])
lst.<span class="fn">insert</span>(<span class="nm">0</span>, <span class="nm">0</span>)
lst.<span class="fn">pop</span>()
lst.<span class="fn">remove</span>(<span class="nm">3</span>)
lst[<span class="nm">1</span>:<span class="nm">3</span>]          <span class="cm"># slice</span>
lst[::<span class="nm">-1</span>]         <span class="cm"># reversed copy</span></pre></div>
<div class="lesson-h2">Tuples & Unpacking</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — Tuples</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre>point = (<span class="nm">3</span>, <span class="nm">4</span>)
x, y = point              <span class="cm"># unpack</span>
first, *rest = [<span class="nm">1</span>,<span class="nm">2</span>,<span class="nm">3</span>,<span class="nm">4</span>] <span class="cm"># starred unpack</span>
a, b = b, a               <span class="cm"># swap</span>
<span class="kw">from</span> <span class="pk">typing</span> <span class="kw">import</span> NamedTuple
<span class="kw">class</span> <span class="ty">Point</span>(NamedTuple):
    x: <span class="ty">float</span>; y: <span class="ty">float</span></pre></div>`);

L('dicts','Dictionaries & Sets','basic',
`from collections import Counter, defaultdict

person = {"name": "Alice", "age": 30, "city": "NYC"}
person["email"] = "alice@py.dev"
person["age"]   = 31
del person["city"]
print(person)

print(person.get("phone", "N/A"))

for key, val in person.items():
    print(f"  {key}: {val}")

defaults = {"color": "blue", "size": 10}
custom   = {"size": 20, "weight": 5}
merged   = defaults | custom
print(merged)

words = "the quick brown fox jumps over the lazy dog the".split()
c = Counter(words)
print(c.most_common(3))

dd = defaultdict(list)
dd["fruits"].append("apple")
dd["fruits"].append("banana")
print(dict(dd))

s1 = {1, 2, 3, 4}
s2 = {3, 4, 5, 6}
print(s1 | s2)
print(s1 & s2)
print(s1 - s2)
print(s1 ^ s2)`,
`<div class="lesson-h2">Dictionaries</div>
<p class="lesson-p">Python dicts maintain insertion order since 3.7 and are highly optimised. They're everywhere — function kwargs, JSON, configuration.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — dict</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre>d = {<span class="st">"a"</span>: <span class="nm">1</span>, <span class="st">"b"</span>: <span class="nm">2</span>}
d[<span class="st">"c"</span>] = <span class="nm">3</span>
d.<span class="fn">get</span>(<span class="st">"x"</span>, <span class="nm">0</span>)         <span class="cm"># safe lookup with default</span>
d.<span class="fn">setdefault</span>(<span class="st">"d"</span>, <span class="nm">4</span>)  <span class="cm"># insert if missing</span>
d.<span class="fn">pop</span>(<span class="st">"a"</span>)            <span class="cm"># remove and return</span>
d1 | d2               <span class="cm"># merge (3.9+)</span></pre></div>
<div class="lesson-h2">Sets</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — set</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre>s = {<span class="nm">1</span>, <span class="nm">2</span>, <span class="nm">3</span>}
s.<span class="fn">add</span>(<span class="nm">4</span>)
s.<span class="fn">discard</span>(<span class="nm">99</span>)   <span class="cm"># no error if missing</span>
<span class="nm">3</span> <span class="kw">in</span> s           <span class="cm"># O(1) membership test</span>
s1 | s2          <span class="cm"># union</span>
s1 &amp; s2          <span class="cm"># intersection</span>
s1 - s2          <span class="cm"># difference</span>
s1 ^ s2          <span class="cm"># symmetric difference</span></pre></div>`);

L('classes','Classes & OOP','basic',
`from dataclasses import dataclass
from abc import ABC, abstractmethod

@dataclass
class Point:
    x: float
    y: float
    def distance(self) -> float:
        return (self.x**2 + self.y**2) ** 0.5

p = Point(3, 4)
print(p, p.distance())

class Animal(ABC):
    def __init__(self, name: str):
        self.name = name
    @abstractmethod
    def speak(self) -> str: ...

class Dog(Animal):
    def speak(self) -> str:
        return f"{self.name} says Woof!"

class Cat(Animal):
    def speak(self) -> str:
        return f"{self.name} says Meow!"

animals = [Dog("Rex"), Cat("Luna"), Dog("Buddy")]
for a in animals:
    print(a.speak())

@dataclass
class Vector:
    x: float; y: float
    def __add__(self, o): return Vector(self.x+o.x, self.y+o.y)
    def __mul__(self, s): return Vector(self.x*s, self.y*s)
    def __abs__(self):   return (self.x**2+self.y**2)**0.5

v = Vector(3,4) + Vector(1,1)
print(v, abs(v))`,
`<div class="lesson-h2">Classes</div>
<p class="lesson-p">Python supports full OOP. Modern Python favours <code>@dataclass</code> to reduce boilerplate, and ABCs to define interfaces.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — class</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">class</span> <span class="ty">Dog</span>:
    species = <span class="st">"Canis lupus"</span>   <span class="cm"># class attribute</span>
    <span class="kw">def</span> <span class="fn">__init__</span>(<span class="kw">self</span>, name: <span class="ty">str</span>):
        <span class="kw">self</span>.name = name
    <span class="kw">def</span> <span class="fn">speak</span>(<span class="kw">self</span>) -> <span class="ty">str</span>:
        <span class="kw">return</span> <span class="st">f"{self.name} says Woof!"</span>
    <span class="de">@classmethod</span>
    <span class="kw">def</span> <span class="fn">create</span>(<span class="kw">cls</span>, name): <span class="kw">return</span> <span class="kw">cls</span>(name)</pre></div>
<div class="lesson-h2">@dataclass</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — dataclass</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">from</span> <span class="pk">dataclasses</span> <span class="kw">import</span> dataclass, field
<span class="de">@dataclass</span>
<span class="kw">class</span> <span class="ty">Person</span>:
    name: <span class="ty">str</span>
    age:  <span class="ty">int</span>
    tags: <span class="ty">list</span> = field(default_factory=<span class="bi">list</span>)
<span class="cm"># Auto-generates __init__, __repr__, __eq__</span>
p = <span class="ty">Person</span>(<span class="st">"Alice"</span>, <span class="nm">30</span>)
<span class="kw">print</span>(p)  <span class="cm"># Person(name='Alice', age=30, tags=[])</span></pre></div>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">Dunder methods make objects Pythonic</div><div class="callout-text">Implement <code>__repr__</code>, <code>__eq__</code>, <code>__hash__</code>, <code>__len__</code>, <code>__getitem__</code>, <code>__iter__</code>, <code>__add__</code> etc. to make your objects work naturally with Python builtins.</div></div></div>`);

L('fileio','File I/O','basic',
`import json
import csv
import io
import pathlib

with open("/tmp/example.txt", "w") as f:
    f.write("Hello, File!\\n")
    f.writelines(["line 2\\n", "line 3\\n"])

with open("/tmp/example.txt") as f:
    content = f.read()
    print(repr(content))

with open("/tmp/example.txt") as f:
    for line in f:
        print(line.rstrip())

p = pathlib.Path(".")
print([f.name for f in p.iterdir() if f.is_file()][:3])

data = {"name": "Alice", "scores": [95, 87, 92], "active": True}
json_str = json.dumps(data, indent=2)
print(json_str)
loaded = json.loads(json_str)
print(loaded["name"], loaded["scores"])

csv_data = "name,age,city\\nAlice,30,NYC\\nBob,25,LA"
reader = csv.DictReader(io.StringIO(csv_data))
for row in reader:
    print(dict(row))`,
`<div class="lesson-h2">File Operations</div>
<p class="lesson-p">Always use the <code>with</code> statement for files — it guarantees the file is closed even if an exception occurs.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — File I/O</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">with</span> <span class="bi">open</span>(<span class="st">"file.txt"</span>, <span class="st">"w"</span>) <span class="kw">as</span> f:
    f.<span class="fn">write</span>(<span class="st">"hello\\n"</span>)
<span class="kw">with</span> <span class="bi">open</span>(<span class="st">"file.txt"</span>) <span class="kw">as</span> f:
    text = f.<span class="fn">read</span>()
<span class="kw">with</span> <span class="bi">open</span>(<span class="st">"file.txt"</span>) <span class="kw">as</span> f:
    <span class="kw">for</span> line <span class="kw">in</span> f:
        <span class="kw">print</span>(line.<span class="fn">rstrip</span>())</pre></div>
<div class="lesson-h2">pathlib</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — pathlib</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">from</span> <span class="pk">pathlib</span> <span class="kw">import</span> Path
p = <span class="ty">Path</span>(<span class="st">"data/config.json"</span>)
p.parent; p.name; p.stem; p.suffix
p.<span class="fn">exists</span>(); p.<span class="fn">is_file</span>(); p.<span class="fn">is_dir</span>()
p.<span class="fn">read_text</span>(); p.<span class="fn">write_text</span>(<span class="st">"..."</span>)
<span class="kw">for</span> f <span class="kw">in</span> <span class="ty">Path</span>(<span class="st">"."</span>).<span class="fn">glob</span>(<span class="st">"*.py"</span>): <span class="kw">print</span>(f)</pre></div>`);

L('exceptions','Exceptions','basic',
`class AppError(Exception):
    """Base class for application errors."""

class ValidationError(AppError):
    def __init__(self, field: str, msg: str):
        super().__init__(f"{field}: {msg}")
        self.field = field

class NotFoundError(AppError):
    pass

def safe_divide(a, b):
    try:
        result = a / b
    except ZeroDivisionError:
        return None
    except TypeError as e:
        raise ValueError(f"Bad input: {e}") from e
    else:
        return result
    finally:
        pass

print(safe_divide(10, 2))
print(safe_divide(10, 0))

def get_user(uid: int):
    if uid <= 0:
        raise ValidationError("uid", "must be positive")
    if uid > 100:
        raise NotFoundError(f"User {uid} not found")
    return {"id": uid, "name": "Alice"}

for uid in [5, -1, 999]:
    try:
        print("Found:", get_user(uid))
    except ValidationError as e:
        print(f"Validation: {e}")
    except NotFoundError as e:
        print(f"Not found: {e}")`,
`<div class="lesson-h2">try / except / else / finally</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — Exceptions</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">try</span>:
    result = risky()
<span class="kw">except</span> (<span class="ty">ValueError</span>, <span class="ty">TypeError</span>) <span class="kw">as</span> e:
    <span class="kw">print</span>(<span class="st">f"Error: {e}"</span>)
<span class="kw">except</span> <span class="ty">Exception</span>:
    <span class="kw">raise</span>            <span class="cm"># re-raise</span>
<span class="kw">else</span>:
    <span class="kw">print</span>(<span class="st">"success"</span>)  <span class="cm"># no exception</span>
<span class="kw">finally</span>:
    <span class="kw">print</span>(<span class="st">"cleanup"</span>)  <span class="cm"># always runs</span></pre></div>
<div class="lesson-h2">Custom Exceptions</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — Custom</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">class</span> <span class="ty">AppError</span>(<span class="ty">Exception</span>): ...
<span class="kw">class</span> <span class="ty">ValidationError</span>(<span class="ty">AppError</span>):
    <span class="kw">def</span> <span class="fn">__init__</span>(<span class="kw">self</span>, field, msg):
        <span class="bi">super</span>().<span class="fn">__init__</span>(<span class="st">f"{field}: {msg}"</span>)
        <span class="kw">self</span>.field = field
<span class="cm"># Exception chaining</span>
<span class="kw">raise</span> <span class="ty">AppError</span>(<span class="st">"oops"</span>) <span class="kw">from</span> original</pre></div>`);

L('comprehensions','Comprehensions','medium',
`import re

squares = [x**2 for x in range(10)]
print(squares)

evens = [x for x in range(20) if x % 2 == 0]
print(evens)

matrix = [[i*j for j in range(1,4)] for i in range(1,4)]
for row in matrix: print(row)

word_len = {w: len(w) for w in ["hello", "world", "python"]}
print(word_len)

unique_lens = {len(w) for w in ["cat","dog","fish","bird","ant"]}
print(sorted(unique_lens))

total = sum(x**2 for x in range(1_000_000))
print(total)

labels = ["even" if x % 2 == 0 else "odd" for x in range(6)]
print(labels)

texts = ["price: $42", "no price here", "cost: $99.99"]
prices = [m.group(1) for t in texts if (m := re.search(r'\\$(\\d+\\.?\\d*)', t))]
print(prices)`,
`<div class="lesson-h2">List Comprehensions</div>
<p class="lesson-p">Comprehensions are one of Python's most distinctive features — concise, readable, and typically faster than equivalent for-loops.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — Comprehensions</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm"># [expression for item in iterable if condition]</span>
squares = [x**<span class="nm">2</span> <span class="kw">for</span> x <span class="kw">in</span> <span class="bi">range</span>(<span class="nm">10</span>)]
evens   = [x    <span class="kw">for</span> x <span class="kw">in</span> <span class="bi">range</span>(<span class="nm">20</span>) <span class="kw">if</span> x % <span class="nm">2</span> == <span class="nm">0</span>]
flat    = [x    <span class="kw">for</span> row <span class="kw">in</span> matrix <span class="kw">for</span> x <span class="kw">in</span> row]
d = {k: v**<span class="nm">2</span> <span class="kw">for</span> k, v <span class="kw">in</span> items}
s = {x % <span class="nm">5</span> <span class="kw">for</span> x <span class="kw">in</span> <span class="bi">range</span>(<span class="nm">20</span>)}</pre></div>
<div class="lesson-h2">Generator Expressions</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — Generators</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm"># Lazy, O(1) memory — use () instead of []</span>
total = <span class="bi">sum</span>(x**<span class="nm">2</span> <span class="kw">for</span> x <span class="kw">in</span> <span class="bi">range</span>(<span class="nm">10</span>**<span class="nm">8</span>))
<span class="bi">max</span>(x*x <span class="kw">for</span> x <span class="kw">in</span> data)
<span class="st">", "</span>.<span class="fn">join</span>(<span class="bi">str</span>(x) <span class="kw">for</span> x <span class="kw">in</span> nums)
<span class="bi">any</span>(x > <span class="nm">0</span> <span class="kw">for</span> x <span class="kw">in</span> data)</pre></div>`);

L('iterators','Iterators & Generators','medium',
`import itertools

def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

def take(n, iterable):
    return list(itertools.islice(iterable, n))

print(take(10, fibonacci()))

def accumulator():
    total = 0
    while True:
        val = yield total
        if val is None: break
        total += val

acc = accumulator()
next(acc)
print(acc.send(10))
print(acc.send(20))
print(acc.send(5))

class CountDown:
    def __init__(self, start): self.current = start
    def __iter__(self): return self
    def __next__(self):
        if self.current <= 0: raise StopIteration
        self.current -= 1
        return self.current + 1

print(list(CountDown(5)))

print(list(itertools.chain([1,2],[3,4],[5])))
print(list(itertools.accumulate([1,2,3,4,5])))`,
`<div class="lesson-h2">Generator Functions</div>
<p class="lesson-p">A generator function uses <code>yield</code> to produce values one at a time. Execution pauses between yields — enabling infinite sequences and memory-efficient processing.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — yield</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">def</span> <span class="fn">read_chunks</span>(path, size=<span class="nm">8192</span>):
    <span class="kw">with</span> <span class="bi">open</span>(path, <span class="st">'rb'</span>) <span class="kw">as</span> f:
        <span class="kw">while</span> chunk := f.<span class="fn">read</span>(size):
            <span class="kw">yield</span> chunk
<span class="kw">def</span> <span class="fn">counter</span>(start=<span class="nm">0</span>):
    n = start
    <span class="kw">while</span> <span class="kw">True</span>:
        <span class="kw">yield</span> n; n += <span class="nm">1</span>
<span class="kw">def</span> <span class="fn">chain</span>(*iters):
    <span class="kw">for</span> it <span class="kw">in</span> iters: <span class="kw">yield from</span> it</pre></div>
<div class="lesson-h2">itertools</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — itertools</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre>it.<span class="fn">chain</span>([<span class="nm">1</span>,<span class="nm">2</span>],[<span class="nm">3</span>,<span class="nm">4</span>])
it.<span class="fn">islice</span>(gen, <span class="nm">10</span>)
it.<span class="fn">product</span>(<span class="st">"AB"</span>, repeat=<span class="nm">2</span>)
it.<span class="fn">combinations</span>([<span class="nm">1</span>,<span class="nm">2</span>,<span class="nm">3</span>], <span class="nm">2</span>)
it.<span class="fn">permutations</span>([<span class="nm">1</span>,<span class="nm">2</span>,<span class="nm">3</span>], <span class="nm">2</span>)
it.<span class="fn">groupby</span>(sorted_data, key)
it.<span class="fn">accumulate</span>([<span class="nm">1</span>,<span class="nm">2</span>,<span class="nm">3</span>,<span class="nm">4</span>])  <span class="cm"># 1 3 6 10</span></pre></div>`);

L('decorators','Decorators','medium',
`import time
import functools

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

def retry(times=3, exceptions=(Exception,)):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(times):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    if attempt == times - 1: raise
                    print(f"Retry {attempt+1}/{times}: {e}")
        return wrapper
    return decorator

@timer
def slow_sum(n: int) -> int:
    return sum(range(n))

print(slow_sum(1_000_000))

class Memoize:
    def __init__(self, func):
        self.func = func
        self.cache = {}
        functools.update_wrapper(self, func)
    def __call__(self, *args):
        if args not in self.cache:
            self.cache[args] = self.func(*args)
        return self.cache[args]

@Memoize
def fib(n): return n if n < 2 else fib(n-1) + fib(n-2)
print([fib(i) for i in range(10)])`,
`<div class="lesson-h2">What is a Decorator?</div>
<p class="lesson-p">A decorator is a function that wraps another function, adding behaviour. <code>@syntax</code> is sugar for <code>func = decorator(func)</code>.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — Decorator</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">import</span> <span class="pk">functools</span>
<span class="kw">def</span> <span class="fn">my_decorator</span>(func):
    <span class="de">@functools.wraps</span>(func)  <span class="cm"># preserves metadata</span>
    <span class="kw">def</span> <span class="fn">wrapper</span>(*args, **kwargs):
        <span class="kw">print</span>(<span class="st">"before"</span>)
        result = func(*args, **kwargs)
        <span class="kw">print</span>(<span class="st">"after"</span>)
        <span class="kw">return</span> result
    <span class="kw">return</span> wrapper
<span class="de">@my_decorator</span>
<span class="kw">def</span> <span class="fn">say_hello</span>(): <span class="kw">print</span>(<span class="st">"hello"</span>)</pre></div>
<div class="lesson-h2">Built-in Decorators</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — stdlib decorators</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">from</span> <span class="pk">functools</span> <span class="kw">import</span> cache, lru_cache, cached_property
<span class="de">@cache</span>                    <span class="cm"># memoize (unbounded)</span>
<span class="de">@lru_cache</span>(maxsize=<span class="nm">128</span>)  <span class="cm"># bounded LRU cache</span>
<span class="de">@cached_property</span>          <span class="cm"># compute once</span>
<span class="de">@staticmethod</span>             <span class="cm"># no self/cls</span>
<span class="de">@classmethod</span>              <span class="cm"># cls instead of self</span>
<span class="de">@property</span>                 <span class="cm"># getter/setter</span>
<span class="de">@abstractmethod</span>           <span class="cm"># must override</span></pre></div>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">Always @functools.wraps</div><div class="callout-text">Without it, your wrapper loses <code>__name__</code>, <code>__doc__</code>, and other metadata. This breaks introspection and tracebacks.</div></div></div>`);

L('context','Context Managers','medium',
`from contextlib import contextmanager, suppress
import time

@contextmanager
def timer(label: str):
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        print(f"{label}: {elapsed:.4f}s")

with timer("sum"):
    total = sum(range(1_000_000))
    print(f"sum = {total}")

class TempFile:
    def __init__(self, path):
        self.path = path
    def __enter__(self):
        self.f = open(self.path, "w")
        return self.f
    def __exit__(self, exc_type, exc_val, tb):
        self.f.close()
        import os; os.unlink(self.path)
        return False

with TempFile("/tmp/tmpfile.txt") as f:
    f.write("temporary")
    print("File written")
print("File cleaned up")

with suppress(FileNotFoundError):
    open("nonexistent.txt")
print("Continued after suppressed error")`,
`<div class="lesson-h2">Context Managers</div>
<p class="lesson-p">Context managers implement the <code>with</code> statement — guaranteeing setup and teardown even when exceptions occur. Essential for files, locks, and connections.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — __enter__ / __exit__</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">class</span> <span class="ty">DB</span>:
    <span class="kw">def</span> <span class="fn">__enter__</span>(<span class="kw">self</span>):
        <span class="kw">self</span>.conn = <span class="fn">connect</span>()
        <span class="kw">return</span> <span class="kw">self</span>.conn
    <span class="kw">def</span> <span class="fn">__exit__</span>(<span class="kw">self</span>, exc_type, val, tb):
        <span class="kw">self</span>.conn.<span class="fn">close</span>()
        <span class="kw">return</span> <span class="kw">False</span>  <span class="cm"># don't suppress errors</span>
<span class="kw">with</span> <span class="ty">DB</span>() <span class="kw">as</span> conn: conn.<span class="fn">execute</span>(<span class="st">"SELECT 1"</span>)</pre></div>
<div class="lesson-h2">@contextmanager</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — @contextmanager</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">from</span> <span class="pk">contextlib</span> <span class="kw">import</span> contextmanager, suppress
<span class="de">@contextmanager</span>
<span class="kw">def</span> <span class="fn">managed</span>():
    resource = <span class="fn">acquire</span>()
    <span class="kw">try</span>:
        <span class="kw">yield</span> resource
    <span class="kw">finally</span>:
        <span class="fn">release</span>(resource)
<span class="cm"># Suppress specific exceptions</span>
<span class="kw">with</span> suppress(<span class="ty">FileNotFoundError</span>):
    <span class="bi">open</span>(<span class="st">"maybe.txt"</span>)</pre></div>`);

L('functools','Functional Tools','medium',
`from functools import reduce, partial, lru_cache
from operator import mul

numbers = list(range(1, 11))
squared = list(map(lambda x: x**2, numbers))
evens   = list(filter(lambda x: x % 2 == 0, numbers))
product = reduce(mul, numbers)
print(squared[:5])
print(evens)
print(f"10! = {product}")

def power(base, exp): return base ** exp
square = partial(power, exp=2)
cube   = partial(power, exp=3)
print(list(map(square, [1,2,3,4,5])))
print(list(map(cube,   [1,2,3,4,5])))

@lru_cache(maxsize=None)
def fib(n: int) -> int:
    return n if n < 2 else fib(n-1) + fib(n-2)

print(fib(50))
print(fib.cache_info())

people = [("Alice", 30), ("Bob", 25), ("Carol", 35)]
by_age  = sorted(people, key=lambda p: p[1])
by_name = sorted(people, key=lambda p: p[0].lower())
print(by_age)
print(by_name)

print(all(x > 0 for x in [1,2,3]))
print(any(x > 5 for x in [1,2,6]))
print(sum(range(101)))`,
`<div class="lesson-h2">Functional Tools</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — map / filter / reduce</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">from</span> <span class="pk">functools</span> <span class="kw">import</span> reduce
<span class="kw">from</span> <span class="pk">operator</span> <span class="kw">import</span> mul
nums = [<span class="nm">1</span>,<span class="nm">2</span>,<span class="nm">3</span>,<span class="nm">4</span>,<span class="nm">5</span>]
<span class="bi">list</span>(<span class="bi">map</span>(<span class="kw">lambda</span> x: x**<span class="nm">2</span>, nums))
<span class="bi">list</span>(<span class="bi">filter</span>(<span class="kw">lambda</span> x: x%<span class="nm">2</span>, nums))
reduce(mul, nums)   <span class="cm"># 120</span>
<span class="cm"># Often clearer as comprehensions:</span>
[x**<span class="nm">2</span> <span class="kw">for</span> x <span class="kw">in</span> nums]
[x <span class="kw">for</span> x <span class="kw">in</span> nums <span class="kw">if</span> x%<span class="nm">2</span>]</pre></div>
<div class="lesson-h2">functools.partial</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — partial</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">from</span> <span class="pk">functools</span> <span class="kw">import</span> partial
<span class="kw">def</span> <span class="fn">power</span>(base, exp): <span class="kw">return</span> base ** exp
square = partial(power, exp=<span class="nm">2</span>)
<span class="bi">print</span>(square(<span class="nm">5</span>))   <span class="cm"># 25</span>
<span class="bi">sorted</span>(words, key=partial(<span class="ty">str</span>.count, <span class="st">"a"</span>))</pre></div>`);

L('modules','Modules & Packages','medium',
`import os, sys, re
from collections import defaultdict, Counter
from datetime import datetime, timedelta

print(os.getcwd())
print(os.environ.get("HOME", "unknown"))
print(os.path.join("a", "b", "c.txt"))

print(sys.version_info[:3])
print(sys.platform)

text = "Contact: alice@example.com and bob@go.dev"
emails = re.findall(r'[\\w.]+@[\\w.]+', text)
print(emails)

pattern = re.compile(r'(\\d{4})-(\\d{2})-(\\d{2})')
m = pattern.match("2024-03-15")
if m: print(m.group(0), m.groups())

dd = defaultdict(list)
dd["key"].append(1); dd["key"].append(2)
print(dict(dd))

c = Counter("abracadabra")
print(c.most_common(3))

now = datetime.now()
print(now.strftime("%Y-%m-%d %H:%M:%S"))
print(f"Tomorrow: {(now + timedelta(days=1)).date()}")`,
`<div class="lesson-h2">Standard Library</div>
<p class="lesson-p">Python's standard library is vast — "batteries included." These are the modules you'll use most often.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — Key Modules</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">import</span> <span class="pk">os</span>, <span class="pk">sys</span>, <span class="pk">re</span>, <span class="pk">json</span>
<span class="kw">import</span> <span class="pk">pathlib</span>, <span class="pk">shutil</span>
<span class="kw">import</span> <span class="pk">datetime</span>, <span class="pk">time</span>
<span class="kw">import</span> <span class="pk">collections</span>, <span class="pk">itertools</span>
<span class="kw">import</span> <span class="pk">functools</span>, <span class="pk">operator</span>
<span class="kw">import</span> <span class="pk">math</span>, <span class="pk">statistics</span>, <span class="pk">random</span>
<span class="kw">import</span> <span class="pk">threading</span>, <span class="pk">multiprocessing</span>
<span class="kw">import</span> <span class="pk">csv</span>, <span class="pk">sqlite3</span>, <span class="pk">logging</span></pre></div>
<div class="compile-box"><div class="cbox-title">📁 Package Commands</div>
<div class="c-step"><div class="c-num">1</div><div><div class="c-cmd">python3 -m venv .venv && source .venv/bin/activate</div></div></div>
<div class="c-step"><div class="c-num">2</div><div><div class="c-cmd">pip install -e .</div><div class="c-desc">Editable install for development.</div></div></div>
<div class="c-step"><div class="c-num">3</div><div><div class="c-cmd">pip install uv && uv pip install numpy</div><div class="c-desc"><code>uv</code> is 10-100x faster than pip.</div></div></div></div>`);

L('typing','Type Hints','medium',
`from typing import TypeVar, Protocol
from collections.abc import Callable, Sequence

def greet(name: str, times: int = 1) -> str:
    return (name + "! ") * times

def find_user(uid: int) -> dict | None:
    db = {1: {"name": "Alice"}}
    return db.get(uid)

def process(val: int | str | None) -> str:
    match val:
        case int(n): return f"int: {n}"
        case str(s): return f"str: {s}"
        case None:   return "none"
        case _:      return "unknown"

T = TypeVar('T')
def first(items: Sequence[T]) -> T | None:
    return items[0] if items else None

class Drawable(Protocol):
    def draw(self) -> str: ...

class Circle:
    def draw(self) -> str: return "○"

class Square:
    def draw(self) -> str: return "□"

def render(shape: Drawable) -> None:
    print(shape.draw())

render(Circle())
render(Square())
print(greet("Alice", 3))
print(find_user(1))
print(process(42), process("hi"), process(None))
print(first([10, 20, 30]))`,
`<div class="lesson-h2">Type Hints</div>
<p class="lesson-p">Type hints (PEP 484, Python 3.5+) make code self-documenting and enable static analysis with mypy or pyright. Checked by tools, not at runtime.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — Type Hints</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm"># Python 3.10+ — use built-in types directly</span>
<span class="kw">def</span> <span class="fn">f</span>(x: <span class="ty">int</span> | <span class="ty">str</span> | <span class="kw">None</span>) -> <span class="ty">str</span>: ...
<span class="kw">def</span> <span class="fn">g</span>() -> <span class="ty">list</span>[<span class="ty">int</span>]: ...
<span class="kw">def</span> <span class="fn">h</span>() -> <span class="ty">dict</span>[<span class="ty">str</span>, <span class="ty">int</span>]: ...
<span class="kw">def</span> <span class="fn">apply</span>(f: <span class="ty">Callable</span>[[<span class="ty">int</span>], <span class="ty">str</span>], x: <span class="ty">int</span>) -> <span class="ty">str</span>: ...</pre></div>
<div class="lesson-h2">Protocol — Structural Subtyping</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — Protocol</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">from</span> <span class="pk">typing</span> <span class="kw">import</span> Protocol
<span class="kw">class</span> <span class="ty">Serializable</span>(<span class="ty">Protocol</span>):
    <span class="kw">def</span> <span class="fn">to_json</span>(<span class="kw">self</span>) -> <span class="ty">str</span>: ...
<span class="cm"># Any class with to_json() satisfies this</span>
<span class="cm"># No inheritance needed! (duck typing with types)</span></pre></div>
<div class="compile-box"><div class="cbox-title">🔧 Type Checking</div>
<div class="c-step"><div class="c-num">1</div><div><div class="c-cmd">pip install mypy && mypy main.py</div></div></div>
<div class="c-step"><div class="c-num">2</div><div><div class="c-cmd">pip install pyright && pyright main.py</div><div class="c-desc">Faster and stricter — used by VS Code Pylance.</div></div></div></div>`);

L('testing','Testing','medium',
`import pytest

def fizzbuzz(n: int) -> str:
    if n % 15 == 0: return "FizzBuzz"
    if n % 3 == 0:  return "Fizz"
    if n % 5 == 0:  return "Buzz"
    return str(n)

def binary_search(arr: list, target: int) -> int:
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:   return mid
        elif arr[mid] < target:  lo = mid + 1
        else:                    hi = mid - 1
    return -1

def test_fizzbuzz():
    assert fizzbuzz(15) == "FizzBuzz"
    assert fizzbuzz(3)  == "Fizz"
    assert fizzbuzz(5)  == "Buzz"
    assert fizzbuzz(7)  == "7"

def test_binary_search():
    arr = [1, 3, 5, 7, 9, 11]
    assert binary_search(arr, 7) == 3
    assert binary_search(arr, 1) == 0
    assert binary_search(arr, 4) == -1

test_fizzbuzz()
test_binary_search()
print("All tests passed!")

for n, exp in [(1,"1"),(3,"Fizz"),(5,"Buzz"),(15,"FizzBuzz")]:
    assert fizzbuzz(n) == exp
print("Parametrized tests passed!")`,
`<div class="lesson-h2">pytest</div>
<p class="lesson-p">pytest is Python's de-facto testing framework. Test files start with <code>test_</code>, test functions start with <code>test_</code>. No class needed, just assertions.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — pytest</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">def</span> <span class="fn">test_add</span>():
    <span class="kw">assert</span> add(<span class="nm">2</span>, <span class="nm">3</span>) == <span class="nm">5</span>
<span class="kw">def</span> <span class="fn">test_raises</span>():
    <span class="kw">with</span> pytest.<span class="fn">raises</span>(<span class="ty">ZeroDivisionError</span>):
        divide(<span class="nm">1</span>, <span class="nm">0</span>)
<span class="de">@pytest.mark.parametrize</span>(<span class="st">"a,b,c"</span>, [
    (<span class="nm">1</span>,<span class="nm">2</span>,<span class="nm">3</span>), (<span class="nm">0</span>,<span class="nm">0</span>,<span class="nm">0</span>), (-<span class="nm">1</span>,<span class="nm">1</span>,<span class="nm">0</span>)
])
<span class="kw">def</span> <span class="fn">test_add_params</span>(a, b, c):
    <span class="kw">assert</span> add(a, b) == c</pre></div>
<div class="compile-box"><div class="cbox-title">🔧 Test Commands</div>
<div class="c-step"><div class="c-num">1</div><div><div class="c-cmd">pytest -v</div></div></div>
<div class="c-step"><div class="c-num">2</div><div><div class="c-cmd">pytest -k "fizz" --tb=short</div></div></div>
<div class="c-step"><div class="c-num">3</div><div><div class="c-cmd">pytest --cov=mylib --cov-report=html</div><div class="c-desc">Requires pytest-cov.</div></div></div></div>`);

L('async','Async / Await','advanced',
`import asyncio
import time

async def fetch(name: str, url: str) -> str:
    delay = len(url) / 50
    await asyncio.sleep(delay)
    return f"[{name}] fetched {url} in {delay:.2f}s"

async def fetch_all(urls: list[str]) -> list[str]:
    tasks = [fetch("session", url) for url in urls]
    return await asyncio.gather(*tasks)

async def producer(queue: asyncio.Queue, n: int):
    for i in range(n):
        await asyncio.sleep(0.01)
        await queue.put(i)
        print(f"produced {i}")
    await queue.put(None)

async def consumer(queue: asyncio.Queue):
    while True:
        item = await queue.get()
        if item is None: break
        print(f"consumed {item}")

async def main():
    urls = ["https://a.com/api", "https://b.org/data", "https://c.net/info"]
    start = time.perf_counter()
    results = await fetch_all(urls)
    for r in results: print(r)
    print(f"Total: {time.perf_counter()-start:.2f}s")

    queue = asyncio.Queue(maxsize=5)
    await asyncio.gather(producer(queue, 3), consumer(queue))

asyncio.run(main())`,
`<div class="lesson-h2">Async / Await</div>
<p class="lesson-p"><code>async</code>/<code>await</code> enables concurrent I/O without threads. An <code>async def</code> coroutine can pause at <code>await</code>, letting other coroutines run.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — asyncio</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">import</span> <span class="pk">asyncio</span>
<span class="kw">async def</span> <span class="fn">fetch</span>(url: <span class="ty">str</span>) -> <span class="ty">str</span>:
    <span class="kw">await</span> asyncio.<span class="fn">sleep</span>(<span class="nm">1</span>)   <span class="cm"># non-blocking</span>
    <span class="kw">return</span> <span class="st">f"data from {url}"</span>
<span class="kw">async def</span> <span class="fn">main</span>():
    <span class="cm"># Concurrent: ~1s instead of 3s</span>
    r1, r2, r3 = <span class="kw">await</span> asyncio.<span class="fn">gather</span>(
        <span class="fn">fetch</span>(<span class="st">"a.com"</span>), <span class="fn">fetch</span>(<span class="st">"b.com"</span>), <span class="fn">fetch</span>(<span class="st">"c.com"</span>)
    )
asyncio.<span class="fn">run</span>(main())</pre></div>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">Async ecosystem</div><div class="callout-text"><code>aiohttp</code> for async HTTP, <code>asyncpg</code> for async PostgreSQL, <code>aiofiles</code> for async file I/O, <code>httpx</code> for both sync/async. FastAPI is built entirely on asyncio.</div></div></div>`);

L('numpy','NumPy','advanced',
`import numpy as np

a = np.array([1, 2, 3, 4, 5])
b = np.arange(0, 10, 2)
c = np.linspace(0, 1, 6)
print("shape:", a.shape, a.dtype)
print("arange:", b)
print("linspace:", c)

x = np.array([1.0, 2.0, 3.0, 4.0])
print(x * 2)
print(x ** 2)
print(np.sqrt(x))
print(np.sum(x), np.mean(x), np.std(x))

A = np.ones((3, 3))
v = np.array([1, 2, 3])
print(A + v)

m = np.arange(16).reshape(4, 4)
print(m[1:3, 1:3])
print(m[m > 8])
print(m[:, 0])

rng  = np.random.default_rng(42)
data = rng.normal(0, 1, (3, 3))
print(data.round(2))

a_mat = np.array([[2, 1], [1, 3]])
b_vec = np.array([5, 10])
x_sol = np.linalg.solve(a_mat, b_vec)
print("Solution:", x_sol)`,
`<div class="lesson-h2">NumPy</div>
<p class="lesson-p">NumPy is the foundation of Python's data science ecosystem. Its <code>ndarray</code> supports vectorised operations — eliminating the need for explicit loops and running at C speed.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — NumPy Arrays</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">import</span> <span class="pk">numpy</span> <span class="kw">as</span> np
a = np.<span class="fn">array</span>([<span class="nm">1</span>, <span class="nm">2</span>, <span class="nm">3</span>])
a.shape; a.dtype; a.ndim
m = np.<span class="fn">arange</span>(<span class="nm">12</span>).<span class="fn">reshape</span>(<span class="nm">3</span>, <span class="nm">4</span>)
m.T           <span class="cm"># transpose</span>
m.<span class="fn">flatten</span>()  <span class="cm"># 1D copy</span>
A @ B         <span class="cm"># matrix multiply</span></pre></div>
<div class="lesson-h2">Vectorised Operations</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — NumPy Ops</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm"># ufuncs: element-wise, no Python loops</span>
np.<span class="fn">sqrt</span>(a); np.<span class="fn">exp</span>(a); np.<span class="fn">log</span>(a)
a.<span class="fn">sum</span>(); a.<span class="fn">mean</span>(); a.<span class="fn">std</span>(); a.<span class="fn">max</span>()
a[a > <span class="nm">2</span>]              <span class="cm"># boolean indexing</span>
np.<span class="fn">where</span>(a > <span class="nm">0</span>, a, <span class="nm">0</span>) <span class="cm"># conditional select</span>
np.<span class="fn">ones</span>((<span class="nm">3</span>,<span class="nm">1</span>)) + np.<span class="fn">arange</span>(<span class="nm">3</span>) <span class="cm"># broadcasting</span></pre></div>`);

L('pandas','Pandas','advanced',
`import pandas as pd
import numpy as np

data = {
    "name":   ["Alice", "Bob", "Carol", "Dave", "Eve"],
    "dept":   ["Eng", "Sales", "Eng", "HR", "Sales"],
    "salary": [95000, 72000, 88000, 65000, 78000],
    "years":  [5, 3, 7, 2, 4],
}
df = pd.DataFrame(data)
print(df)
print(df.dtypes)

print(df[df["dept"] == "Eng"])
print(df[df["salary"] > 80000])

df["bonus"] = df["salary"] * 0.1
df["seniority"] = pd.cut(df["years"],
    bins=[0, 2, 5, 10], labels=["junior", "mid", "senior"])
print(df)

summary = df.groupby("dept")["salary"].agg(["mean","min","max"])
print(summary)

print(df.sort_values("salary", ascending=False).head(3))
print(df["salary"].describe())
print(f"Corr years/salary: {df['years'].corr(df['salary']):.3f}")`,
`<div class="lesson-h2">Pandas DataFrames</div>
<p class="lesson-p">Pandas is Python's data manipulation library. A <code>DataFrame</code> is a 2D table with labelled rows and columns — like a spreadsheet in code with powerful SQL-like operations.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — DataFrame</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre>df = pd.<span class="fn">read_csv</span>(<span class="st">"data.csv"</span>)
df.<span class="fn">head</span>(); df.<span class="fn">info</span>(); df.<span class="fn">describe</span>()
df.<span class="fn">isnull</span>().<span class="fn">sum</span>()   <span class="cm"># missing values</span>
df.<span class="fn">shape</span>            <span class="cm"># (rows, cols)</span></pre></div>
<div class="lesson-h2">Selection & GroupBy</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — Pandas Ops</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre>df[<span class="st">"col"</span>]                   <span class="cm"># Series</span>
df[[<span class="st">"a"</span>, <span class="st">"b"</span>]]             <span class="cm"># DataFrame</span>
df[df[<span class="st">"x"</span>] > <span class="nm">0</span>]             <span class="cm"># boolean filter</span>
df.<span class="fn">query</span>(<span class="st">"x > 0 and y == 'A'"</span>)
df.<span class="fn">groupby</span>(<span class="st">"dept"</span>)[<span class="st">"sal"</span>].<span class="fn">mean</span>()
df.<span class="fn">pivot_table</span>(values=<span class="st">"salary"</span>, index=<span class="st">"dept"</span>)
df.<span class="fn">merge</span>(other, on=<span class="st">"id"</span>)   <span class="cm"># SQL join</span>
df.<span class="fn">to_csv</span>(<span class="st">"out.csv"</span>, index=<span class="kw">False</span>)</pre></div>`);

L('ml','Scikit-learn & ML','advanced',
`import numpy as np
from sklearn.datasets import make_classification, make_regression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

X, y = make_classification(n_samples=1000, n_features=10,
                            n_informative=5, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)

pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("clf",    RandomForestClassifier(n_estimators=100, random_state=42))
])
pipe.fit(X_train, y_train)
y_pred = pipe.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")

cv_scores = cross_val_score(pipe, X, y, cv=5)
print(f"CV: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

X_r, y_r = make_regression(n_samples=500, n_features=5, noise=10, random_state=42)
X_tr, X_te, y_tr, y_te = train_test_split(X_r, y_r, test_size=0.2, random_state=42)
ridge = Pipeline([("sc", StandardScaler()), ("reg", Ridge(alpha=1.0))])
ridge.fit(X_tr, y_tr)
print(f"R² score: {ridge.score(X_te, y_te):.4f}")

rf = pipe.named_steps["clf"]
top3 = sorted(enumerate(rf.feature_importances_), key=lambda x: -x[1])[:3]
print("Top features:")
for i, imp in top3:
    print(f"  feature_{i}: {imp:.4f}")`,
`<div class="lesson-h2">Scikit-learn</div>
<p class="lesson-p">Scikit-learn is Python's definitive ML library — consistent API, comprehensive algorithms. Every estimator follows <code>fit()</code>/<code>predict()</code>.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — sklearn Pipeline</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">from</span> <span class="pk">sklearn.pipeline</span> <span class="kw">import</span> Pipeline
pipe = Pipeline([
    (<span class="st">"scaler"</span>, StandardScaler()),
    (<span class="st">"model"</span>,  RandomForestClassifier())
])
pipe.<span class="fn">fit</span>(X_train, y_train)
preds = pipe.<span class="fn">predict</span>(X_test)
probs = pipe.<span class="fn">predict_proba</span>(X_test)</pre></div>
<div class="lesson-h2">The ML Ecosystem</div>
<ul class="lesson-ul">
  <li><strong>scikit-learn:</strong> Classical ML — linear models, trees, SVMs, clustering</li>
  <li><strong>PyTorch:</strong> Deep learning — dynamic graphs, great for research</li>
  <li><strong>TensorFlow/Keras:</strong> Deep learning — production deployment</li>
  <li><strong>XGBoost / LightGBM:</strong> Gradient boosting — often best for tabular data</li>
  <li><strong>HuggingFace Transformers:</strong> Pre-trained LLMs, BERT, GPT variants</li>
  <li><strong>Matplotlib / Seaborn / Plotly:</strong> Visualisation</li>
</ul>`);

L('webapi','FastAPI & Web','advanced',
`from pydantic import BaseModel, field_validator
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: str
    age: int
    role: str = "user"

    @field_validator("age")
    @classmethod
    def age_must_be_valid(cls, v):
        if not 0 <= v <= 150:
            raise ValueError("age must be 0-150")
        return v

class UserResponse(UserCreate):
    id: int
    created_at: datetime

print("=== Pydantic Validation ===")
try:
    u = UserCreate(name="Alice", email="alice@py.dev", age=30)
    print(u.model_dump())
except Exception as e:
    print(f"Error: {e}")

try:
    bad = UserCreate(name="X", email="x@x.com", age=-5)
except Exception as e:
    print(f"Validation caught: {e}")

ROUTES = [
    ("GET",    "/",               "root"),
    ("GET",    "/users/{id}",     "get_user"),
    ("POST",   "/users",          "create_user"),
    ("PUT",    "/users/{id}",     "update_user"),
    ("DELETE", "/users/{id}",     "delete_user"),
]
print("\\n=== FastAPI Routes ===")
for method, path, handler in ROUTES:
    print(f"  {method:6} {path:20} → {handler}")
print("\\nRun with: uvicorn main:app --reload")`,
`<div class="lesson-h2">FastAPI</div>
<p class="lesson-p">FastAPI is Python's fastest-growing web framework — automatic OpenAPI docs, Pydantic validation, async support, type-hint driven.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — FastAPI</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">from</span> <span class="pk">fastapi</span> <span class="kw">import</span> FastAPI, HTTPException
<span class="kw">from</span> <span class="pk">pydantic</span> <span class="kw">import</span> BaseModel
app = FastAPI()
<span class="kw">class</span> <span class="ty">Item</span>(BaseModel):
    name: <span class="ty">str</span>; price: <span class="ty">float</span>
<span class="de">@app.get</span>(<span class="st">"/items/{item_id}"</span>)
<span class="kw">async def</span> <span class="fn">get_item</span>(item_id: <span class="ty">int</span>):
    <span class="kw">return</span> {<span class="st">"id"</span>: item_id}
<span class="de">@app.post</span>(<span class="st">"/items"</span>, status_code=<span class="nm">201</span>)
<span class="kw">async def</span> <span class="fn">create_item</span>(item: <span class="ty">Item</span>):
    <span class="kw">return</span> item</pre></div>
<div class="compile-box"><div class="cbox-title">🔧 FastAPI Setup</div>
<div class="c-step"><div class="c-num">1</div><div><div class="c-cmd">pip install fastapi uvicorn[standard]</div></div></div>
<div class="c-step"><div class="c-num">2</div><div><div class="c-cmd">uvicorn main:app --reload</div><div class="c-desc">Auto-reload on file changes.</div></div></div>
<div class="c-step"><div class="c-num">3</div><div><div class="c-cmd">http://localhost:8000/docs</div><div class="c-desc">Automatic interactive Swagger UI — no extra setup needed.</div></div></div></div>`);

L('concurrency','Concurrency & Threads','advanced',
`import threading
import multiprocessing
import concurrent.futures
import time

# Threading (I/O bound — GIL shared)
def io_task(n):
    time.sleep(0.1)
    return n * n

start = time.perf_counter()
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
    results = list(ex.map(io_task, range(8)))
print(f"ThreadPool: {results}")
print(f"Time: {time.perf_counter()-start:.2f}s")

# Multiprocessing (CPU bound — bypasses GIL)
def cpu_task(n):
    return sum(i*i for i in range(n))

start = time.perf_counter()
with concurrent.futures.ProcessPoolExecutor(max_workers=2) as ex:
    results = list(ex.map(cpu_task, [100_000]*4))
print(f"ProcessPool: {results}")
print(f"Time: {time.perf_counter()-start:.2f}s")

# threading.Lock for shared state
counter = 0
lock = threading.Lock()

def increment(n):
    global counter
    for _ in range(n):
        with lock:
            counter += 1

threads = [threading.Thread(target=increment, args=(1000,)) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
print(f"Counter: {counter}")  # always 4000`,
`<div class="lesson-h2">The GIL Problem</div>
<p class="lesson-p">Python's GIL (Global Interpreter Lock) means threads can't run Python code in true parallel. Use <strong>threads</strong> for I/O-bound work (HTTP requests, file I/O) and <strong>multiprocessing</strong> for CPU-bound work.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — concurrent.futures</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">from</span> <span class="pk">concurrent.futures</span> <span class="kw">import</span> ThreadPoolExecutor, ProcessPoolExecutor
<span class="cm"># I/O bound → threads</span>
<span class="kw">with</span> ThreadPoolExecutor(max_workers=<span class="nm">8</span>) <span class="kw">as</span> ex:
    results = <span class="bi">list</span>(ex.<span class="fn">map</span>(fetch_url, urls))
<span class="cm"># CPU bound → processes</span>
<span class="kw">with</span> ProcessPoolExecutor() <span class="kw">as</span> ex:
    results = <span class="bi">list</span>(ex.<span class="fn">map</span>(cpu_task, data))</pre></div>
<div class="callout callout-info"><div class="callout-icon">ℹ️</div><div class="callout-body"><div class="callout-title">asyncio vs threads vs multiprocessing</div><div class="callout-text"><strong>asyncio</strong>: best for many concurrent I/O tasks (web servers, API clients). <strong>Threading</strong>: simple concurrent I/O, legacy code. <strong>Multiprocessing</strong>: CPU-intensive work, data processing, ML training.</div></div></div>`);

L('metaclass','Metaclasses & Protocols','advanced',
`from typing import Protocol, runtime_checkable
from abc import ABCMeta, abstractmethod

# Metaclass: controls class creation
class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Database(metaclass=Singleton):
    def __init__(self):
        self.connected = True
        print("Database connected!")

db1 = Database()
db2 = Database()
print(db1 is db2)  # True — same instance

# __init_subclass__: hook into subclass creation
class Plugin:
    _registry = {}
    def __init_subclass__(cls, name=None, **kwargs):
        super().__init_subclass__(**kwargs)
        if name:
            Plugin._registry[name] = cls

class JSONPlugin(Plugin, name="json"):
    def process(self, data): return str(data)

class CSVPlugin(Plugin, name="csv"):
    def process(self, data): return ",".join(str(x) for x in data)

print(Plugin._registry)

# runtime_checkable Protocol
@runtime_checkable
class Sizeable(Protocol):
    def __len__(self) -> int: ...

print(isinstance([], Sizeable))   # True
print(isinstance({}, Sizeable))   # True
print(isinstance(42, Sizeable))   # False`,
`<div class="lesson-h2">Metaclasses</div>
<p class="lesson-p">A metaclass is the "class of a class" — it controls how classes are created. The built-in metaclass is <code>type</code>. Metaclasses are a powerful but rarely-needed tool.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — Metaclass</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">class</span> <span class="ty">Meta</span>(<span class="bi">type</span>):
    <span class="kw">def</span> <span class="fn">__new__</span>(mcs, name, bases, namespace):
        cls = <span class="bi">super</span>().<span class="fn">__new__</span>(mcs, name, bases, namespace)
        <span class="kw">print</span>(<span class="st">f"Class {name} created"</span>)
        <span class="kw">return</span> cls
<span class="kw">class</span> <span class="ty">MyClass</span>(metaclass=<span class="ty">Meta</span>): ...
<span class="cm"># Prints: "Class MyClass created"</span>
<span class="cm"># Use __init_subclass__ (simpler than metaclass)</span>
<span class="kw">class</span> <span class="ty">Base</span>:
    <span class="kw">def</span> <span class="fn">__init_subclass__</span>(cls, **kw):
        <span class="bi">print</span>(<span class="st">f"Subclass: {cls.__name__}"</span>)</pre></div>
<div class="lesson-h2">runtime_checkable Protocol</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — Protocol</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">from</span> <span class="pk">typing</span> <span class="kw">import</span> Protocol, runtime_checkable
<span class="de">@runtime_checkable</span>
<span class="kw">class</span> <span class="ty">Drawable</span>(<span class="ty">Protocol</span>):
    <span class="kw">def</span> <span class="fn">draw</span>(<span class="kw">self</span>) -> <span class="ty">str</span>: ...
<span class="cm"># Now isinstance() works at runtime</span>
<span class="bi">isinstance</span>(circle, <span class="ty">Drawable</span>)  <span class="cm"># True/False</span></pre></div>`);

L('perf','Performance & Profiling','advanced',
`import cProfile
import pstats
import io
import timeit
import sys

# timeit: micro-benchmarking
list_time = timeit.timeit('[x**2 for x in range(1000)]', number=10000)
gen_time  = timeit.timeit('sum(x**2 for x in range(1000))', number=10000)
print(f"list comp: {list_time:.3f}s")
print(f"generator: {gen_time:.3f}s")

# String building
def slow_concat(n):
    s = ""
    for i in range(n):
        s += str(i)
    return s

def fast_join(n):
    return "".join(str(i) for i in range(n))

t1 = timeit.timeit(lambda: slow_concat(1000), number=1000)
t2 = timeit.timeit(lambda: fast_join(1000),   number=1000)
print(f"concat: {t1:.3f}s  join: {t2:.3f}s  speedup: {t1/t2:.1f}x")

# cProfile
def target():
    return sum(x**2 for x in range(100_000))

pr = cProfile.Profile()
pr.enable()
target()
pr.disable()

s = io.StringIO()
ps = pstats.Stats(pr, stream=s).sort_stats('cumulative')
ps.print_stats(5)
print(s.getvalue()[:500])

print("\\nTips: use line_profiler, memory_profiler, py-spy")
print(f"CPython {sys.version_info[:2]} — try PyPy for 5-10x speedup")`,
`<div class="lesson-h2">Profiling</div>
<p class="lesson-p">Never optimise without measuring first. Use <code>timeit</code> for micro-benchmarks and <code>cProfile</code> for finding hotspots in real code.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Python — timeit & cProfile</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">import</span> <span class="pk">timeit</span>
t = timeit.<span class="fn">timeit</span>(<span class="st">'[x**2 for x in range(1000)]'</span>, number=<span class="nm">10000</span>)
<span class="kw">import</span> <span class="pk">cProfile</span>
cProfile.<span class="fn">run</span>(<span class="st">'my_function()'</span>, sort=<span class="st">'cumulative'</span>)</pre></div>
<div class="lesson-h2">Optimisation Techniques</div>
<ul class="lesson-ul">
  <li>Use <code>"".join()</code> not <code>+=</code> for string building in loops</li>
  <li>Generator expressions over list comprehensions when not indexing</li>
  <li><code>__slots__</code> to reduce memory for classes with many instances</li>
  <li><code>@functools.lru_cache</code> for expensive, pure functions</li>
  <li><code>numpy</code> vectorisation instead of Python loops on numbers</li>
  <li>Line-level profiling: <code>pip install line_profiler</code></li>
  <li>Memory profiling: <code>pip install memory_profiler</code></li>
  <li>Sampling profiler: <code>pip install py-spy</code> (no code changes)</li>
  <li>Try PyPy for 5-10x speedup on pure-Python CPU-bound code</li>
</ul>`);

// ─────────────────────────────────────────
// SIMULATED OUTPUT
// ─────────────────────────────────────────
const SIM = {
  hello:         ['Hello, World!','Python 3.12.0 (main)','Platform: Linux','Welcome, Pythonista! Year: 2024','1 2 3','spam spam spam '],
  variables:     ['<class \'int\'> <class \'float\'> <class \'str\'>','2 1','42 3.14 100 False','10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000','2','Found price: 42.50'],
  strings:       ['14','HELLO, PYTHON!','H !','Python','!nohtyP ,olleH','Alice scored 98.5%','2**10 = 1024','       center       ','hello world','[\'hello\', \'world\']','a, b, c','heLLo','True','6','C:\\\\Users\\\\name\\\\file.txt','3'],
  control:       ['medium','even','1. apple','2. banana','3. cherry','1 a','2 b','3 c','final n = 32','95: A','82: B','71: C','55: F'],
  functions:     ['Hello, Alice!','Hi, Bob!','{ \'min\': 1, \'max\': 9, \'mean\': 3.875 }','  host = localhost','  port = 8080','  debug = True','[2, 4, 6, 8, 10]','[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]','6'],
  lists:         ['[\'apple\', \'avocado\', \'cherry\', \'date\']','[\'avocado\', \'cherry\']','[\'date\', \'cherry\', \'avocado\', \'apple\']','[1, 1, 2, 3, 4, 5, 6, 9]','[9, 6, 5, 4, 3, 2, 1, 1]','3','1','3 4','3 4','1 [2, 3, 4, 5] [1, 2, 3, 4] 5'],
  dicts:         ['{ \'name\': \'Alice\', \'age\': 31, \'email\': \'alice@py.dev\' }','N/A','  name: Alice','  age: 31','  email: alice@py.dev','{ \'color\': \'blue\', \'size\': 20, \'weight\': 5 }','[(\'the\', 3), (\'is\', 1), (\'quick\', 1)]','{ \'fruits\': [\'apple\', \'banana\'] }','{1, 2, 3, 4, 5, 6}','{3, 4}','{1, 2}','{1, 2, 5, 6}'],
  classes:       ['Point(x=3.0, y=4.0) 5.0','Rex says Woof!','Luna says Meow!','Buddy says Woof!','Vector(x=4, y=5) 6.4031242374328485'],
  fileio:        ['\'Hello, File!\\nline 2\\nline 3\\n\'','Hello, File!','line 2','line 3','[\'mastering-python.css\', \'mastering-python.js\', \'mastering-python.html\']','{\n  "name": "Alice",\n  "scores": [95, 87, 92],\n  "active": true\n}','Alice [95, 87, 92]','{ \'name\': \'Alice\', \'age\': \'30\', \'city\': \'NYC\' }','{ \'name\': \'Bob\', \'age\': \'25\', \'city\': \'LA\' }'],
  exceptions:    ['5.0','None','Found: { \'id\': 5, \'name\': \'Alice\' }','Validation: uid: must be positive','Not found: User 999 not found'],
  comprehensions:['[0, 1, 4, 9, 16, 25, 36, 49, 64, 81]','[0, 2, 4, 6, 8, 10, 12, 14, 16, 18]','[1, 2, 3]','[2, 4, 6]','[3, 6, 9]','{ \'hello\': 5, \'world\': 5, \'python\': 6 }','{3, 4, 5}','333333283333335000000','[\'even\', \'odd\', \'even\', \'odd\', \'even\', \'odd\']','[\'42\', \'99.99\']'],
  iterators:     ['[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]','10','30','35','[5, 4, 3, 2, 1]','[1, 2, 3, 4, 5]','[1, 3, 6, 10, 15]'],
  decorators:    ['slow_sum took 0.0312s','499999500000','[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]'],
  context:       ['sum = 499999500000','sum: 0.0281s','File written','File cleaned up','Continued after suppressed error'],
  functools:     ['[1, 4, 9, 16, 25]','[2, 4, 6, 8, 10]','10! = 3628800','[1, 4, 9, 16, 25]','[1, 8, 27, 64, 125]','12586269025','CacheInfo(hits=48, misses=51, maxsize=None, currsize=51)','[(\'Bob\', 25), (\'Alice\', 30), (\'Carol\', 35)]','[(\'Alice\', 30), (\'Bob\', 25), (\'Carol\', 35)]','True','True','5050'],
  modules:       ['/home/user','unknown','/a/b/c.txt','(3, 12, 0)','linux','[\'alice@example.com\', \'bob@go.dev\']','2024-03-15 (\'2024\', \'03\', \'15\')','{ \'key\': [1, 2] }','[(\'a\', 4), (\'b\', 2), (\'r\', 2)]','2024-03-15 12:00:00','Tomorrow: 2024-03-16'],
  typing:        ['Alice! Alice! Alice! ','{ \'id\': 1, \'name\': \'Alice\' }','int: 42 str: hi none','10','○','□'],
  testing:       ['All tests passed!','Parametrized tests passed!'],
  async:         ['[session] fetched https://a.com/api in 0.18s','[session] fetched https://b.org/data in 0.22s','[session] fetched https://c.net/info in 0.22s','Total: 0.23s','produced 0','produced 1','produced 2','consumed 0','consumed 1','consumed 2'],
  numpy:         ['shape: (5,) int64','arange: [0 2 4 6 8]','linspace: [0.  0.2 0.4 0.6 0.8 1. ]','[2. 4. 6. 8.]','[1. 4. 9. 16.]','[1.   1.414 1.732 2.   ]','10.0 2.5 1.118033988749895','[[2. 3. 4.]\n [2. 3. 4.]\n [2. 3. 4.]]','[[ 5  6]\n [ 9 10]]','[ 9 10 11 12 13 14 15]','[0 4 8 12]','Solution: [1. 3.]'],
  pandas:        ['   name   dept  salary  years\n0  Alice    Eng   95000      5\n1    Bob  Sales   72000      3\n2  Carol    Eng   88000      7\n3   Dave     HR   65000      2\n4    Eve  Sales   78000      4','name      object\ndept      object\nsalary     int64\nyears      int64','   name dept  salary  years\n0  Alice  Eng   95000      5\n2  Carol  Eng   88000      7','Corr years/salary: 0.987'],
  ml:            ['Accuracy: 0.9250','CV: 0.9180 ± 0.0124','R² score: 0.9912','Top features:','  feature_3: 0.1854','  feature_0: 0.1623','  feature_7: 0.1401'],
  webapi:        ['=== Pydantic Validation ===','{ \'name\': \'Alice\', \'email\': \'alice@py.dev\', \'age\': 30, \'role\': \'user\' }','Validation caught: 1 validation error for UserCreate\nage\n  Value error, age must be 0-150','','=== FastAPI Routes ===','  GET    /                    → root','  GET    /users/{id}          → get_user','  POST   /users               → create_user','  PUT    /users/{id}          → update_user','  DELETE /users/{id}          → delete_user','','Run with: uvicorn main:app --reload'],
  concurrency:   ['ThreadPool: [0, 1, 4, 9, 16, 25, 36, 49]','Time: 0.21s','ProcessPool: [0, 0, 0, 0]','Time: 0.84s','Counter: 4000'],
  metaclass:     ['Database connected!','True','{ \'json\': <class \'__main__.JSONPlugin\'>, \'csv\': <class \'__main__.CSVPlugin\' >}','True','True','False'],
  perf:          ['list comp: 1.243s','generator: 0.891s','concat: 2.341s  join: 0.412s  speedup: 5.7x','         5 function calls in 0.032 seconds','   ncalls  tottime  percall  cumtime  percall filename','        1    0.000    0.000    0.032    0.032 <string>:1','Tips: use line_profiler, memory_profiler, py-spy','CPython (3, 12) — try PyPy for 5-10x speedup'],
};

// ─────────────────────────────────────────
// STATE
// ─────────────────────────────────────────
let curLevel = 'basic';
let curTopic = null;
let editor   = null;
let edLoaded = false;
let edVisible = true;
let curCode  = '';

// ─────────────────────────────────────────
// MONACO EDITOR INIT
// ─────────────────────────────────────────
require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
require(['vs/editor/editor.main'], () => {
  edLoaded = true;
  editor = monaco.editor.create(document.getElementById('monacoContainer'), {
    value: '# Select a topic to begin\n# or write Python code here\n\nprint("Hello, Python!")\n\nfor i in range(5):\n    print(f"  {i}: {i**2}")\n',
    language: 'python',
    theme: edTheme(),
    fontSize: 13,
    fontFamily: "'JetBrains Mono', monospace",
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    renderLineHighlight: 'all',
    automaticLayout: true,
    wordWrap: 'off',
    tabSize: 4,
    insertSpaces: true,
    folding: true,
    bracketPairColorization: { enabled: true },
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
  const q = document.getElementById('searchInput').value.toLowerCase();
  const list = document.getElementById('topicList');
  let html = '';
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
    document.getElementById('edFname').textContent = `${id}.py`;
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
      <span class="l-tag" style="background:var(--bg3);border:1px solid var(--border);color:var(--text3);font-family:var(--mono);font-size:10px;">Python 3.12+</span>
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
      <div class="callout callout-info"><div class="callout-icon">🏋</div><div class="callout-body"><div class="callout-title">Practice Problems</div><div class="callout-text">Write solutions in the editor and click ▶ Run. Covers all focus areas.</div></div></div>
      <div class="lesson-h2">Basics</div>
      <ul class="lesson-ul">
        <li>Write a <code>fibonacci(n)</code> using both recursion and <code>@cache</code>; compare timings with <code>timeit</code></li>
        <li>Implement <code>flatten(nested)</code> that works for arbitrarily deep nested lists using generators</li>
        <li>Build a word frequency counter: read from a string, return top-10 sorted by frequency</li>
        <li>Create a generic <code>LRUCache</code> class using <code>collections.OrderedDict</code></li>
      </ul>
      <div class="lesson-h2">Data Science</div>
      <ul class="lesson-ul">
        <li>Load a CSV with Pandas, clean null values, and compute per-group statistics</li>
        <li>Use NumPy to implement linear regression from scratch (no sklearn)</li>
        <li>Build a data pipeline: generate synthetic data → normalise → train/test split → evaluate</li>
        <li>Implement k-means clustering with NumPy; visualise with Matplotlib</li>
      </ul>
      <div class="lesson-h2">Web & Concurrency</div>
      <ul class="lesson-ul">
        <li>Build a FastAPI CRUD API for a todo list with Pydantic models and in-memory storage</li>
        <li>Write an async web scraper using <code>aiohttp</code> that fetches 10 URLs concurrently</li>
        <li>Implement a producer-consumer queue using <code>asyncio.Queue</code></li>
        <li>Write an HTTP middleware decorator that logs request timing and status code</li>
      </ul>
    </div>`;
  } else if (tab === 'reference') {
    pane.innerHTML = `<div class="fade-in" style="max-width:780px">
      <div class="lesson-title">Quick Reference</div>
      <div class="lesson-divider"></div>
      <div class="lesson-h2">String Formatting</div>
      <table class="ref-table">
        <tr><th>Format Spec</th><th>Meaning</th><th>Example</th></tr>
        <tr><td>:.2f</td><td>2 decimal places</td><td>3.14</td></tr>
        <tr><td>:,</td><td>Thousands separator</td><td>1,000,000</td></tr>
        <tr><td>:.0%</td><td>Percentage</td><td>75%</td></tr>
        <tr><td>:>10</td><td>Right-align in 10</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Alice</td></tr>
        <tr><td>:^20</td><td>Centre in 20</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Alice&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td></tr>
        <tr><td>:08d</td><td>Zero-pad to 8 digits</td><td>00000042</td></tr>
        <tr><td>:#x</td><td>Hex with 0x prefix</td><td>0x2a</td></tr>
        <tr><td>:e</td><td>Scientific notation</td><td>4.200000e+01</td></tr>
        <tr><td>= </td><td>Debug self-doc</td><td>x = 42</td></tr>
      </table>
      <div class="lesson-h2">Python CLI Commands</div>
      <table class="ref-table">
        <tr><th>Command</th><th>Purpose</th></tr>
        <tr><td>python3 main.py</td><td>Run a script</td></tr>
        <tr><td>python3 -i main.py</td><td>Run then enter REPL</td></tr>
        <tr><td>python3 -m module</td><td>Run module as script</td></tr>
        <tr><td>python3 -c "print(42)"</td><td>One-liner</td></tr>
        <tr><td>pip install pkg</td><td>Install from PyPI</td></tr>
        <tr><td>pip install -r req.txt</td><td>Install from file</td></tr>
        <tr><td>pip list / pip show</td><td>List / inspect packages</td></tr>
        <tr><td>python3 -m pytest -v</td><td>Run tests</td></tr>
        <tr><td>python3 -m cProfile</td><td>Profile a script</td></tr>
        <tr><td>python3 -m timeit</td><td>Micro-benchmark</td></tr>
      </table>
      <div class="lesson-h2">Essential Packages</div>
      <table class="ref-table">
        <tr><th>Package</th><th>Purpose</th></tr>
        <tr><td>numpy</td><td>Numerical arrays, linear algebra</td></tr>
        <tr><td>pandas</td><td>DataFrames, data manipulation</td></tr>
        <tr><td>matplotlib / seaborn</td><td>Visualisation</td></tr>
        <tr><td>scikit-learn</td><td>Classical ML</td></tr>
        <tr><td>pytorch / tensorflow</td><td>Deep learning</td></tr>
        <tr><td>fastapi + uvicorn</td><td>Modern async web API</td></tr>
        <tr><td>pydantic</td><td>Data validation & settings</td></tr>
        <tr><td>sqlalchemy</td><td>ORM & database toolkit</td></tr>
        <tr><td>pytest</td><td>Testing framework</td></tr>
        <tr><td>requests / httpx</td><td>HTTP client (sync/async)</td></tr>
        <tr><td>aiohttp</td><td>Async HTTP client/server</td></tr>
        <tr><td>click / typer</td><td>CLI frameworks</td></tr>
        <tr><td>pydantic-settings</td><td>Environment config</td></tr>
        <tr><td>black / ruff</td><td>Formatting / linting</td></tr>
        <tr><td>mypy / pyright</td><td>Static type checking</td></tr>
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
  navigator.clipboard.writeText(editor.getValue()).then(() => addOut('# Copied!', 'li'));
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
  out.innerHTML = '<span class="li"># Running…</span>';
  await sleep(280);
  ind.className = 'out-ind success';
  const lines = SIM[curTopic] || ['# (no simulated output for this topic)'];
  out.innerHTML = `<span class="li">$ python3 ${curTopic || 'main'}.py</span>\n\n`;
  for (const line of lines) {
    out.innerHTML += escHtml(line) + '\n';
    await sleep(40);
  }
  out.innerHTML += `\n<span class="ls"># exited with code 0</span>`;
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
  document.getElementById('outBody').innerHTML = '<span class="li"># Ready — click ▶ Run</span>';
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
  let sys = 'You are an expert Python tutor. Be practical, idiomatic, and Pythonic. Use triple-backtick ```python code blocks. Mention type hints, dataclasses, and modern Python 3.10+ features when relevant.';
  if (curTopic && LESSONS[curTopic]) {
    sys += ` The student is studying "${LESSONS[curTopic].title}".`;
    if (editor) { const code = editor.getValue(); if (code && code.length < 2000) sys += ` Their editor:\n\`\`\`python\n${code}\n\`\`\``; }
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
  h = h.replace(/```(?:python|py|bash|sh)?\n?([\s\S]*?)```/g, (_, code) => `<pre>${code.trimEnd()}</pre>`);
  h = h.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  h = h.replace(/\n/g, '<br>');
  return h;
}
function now() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
