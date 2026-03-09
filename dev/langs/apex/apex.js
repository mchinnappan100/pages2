/* ─────────────────────────────────────────────────────────────
   Mastering Salesforce Apex — Application Logic
   Curriculum · Lessons · Monaco · Simulation · AI Chat
───────────────────────────────────────────────────────────── */

// ─────────────────────────────────────────
// CURRICULUM
// ─────────────────────────────────────────
const CURRICULUM = {
  basic: [
    { id:'hello',      icon:'👋', name:'Hello, Apex',             tag:'basic' },
    { id:'variables',  icon:'📦', name:'Variables & Data Types',  tag:'basic' },
    { id:'collections',icon:'📋', name:'Collections',             tag:'basic' },
    { id:'control',    icon:'🔀', name:'Control Flow',            tag:'basic' },
    { id:'classes',    icon:'🏗', name:'Classes & Methods',       tag:'basic' },
    { id:'soql',       icon:'🔍', name:'SOQL Basics',             tag:'basic' },
    { id:'dml',        icon:'✏️', name:'DML Operations',          tag:'basic' },
    { id:'exceptions', icon:'⚠️', name:'Exception Handling',      tag:'basic' },
    { id:'debug',      icon:'🐛', name:'Debug & Logging',         tag:'basic' },
    { id:'schema',     icon:'🗂', name:'Schema & sObjects',       tag:'basic' },
  ],
  medium: [
    { id:'triggers',   icon:'⚡', name:'Apex Triggers',           tag:'medium' },
    { id:'governor',   icon:'📏', name:'Governor Limits',         tag:'medium' },
    { id:'bulkify',    icon:'🚀', name:'Bulkification Patterns',  tag:'medium' },
    { id:'interfaces', icon:'🔌', name:'Interfaces & Abstract',   tag:'medium' },
    { id:'inner',      icon:'🪆', name:'Inner Classes & Enums',   tag:'medium' },
    { id:'soqladvanced',icon:'🔎',name:'Advanced SOQL',           tag:'medium', badge:'SOSL' },
    { id:'email',      icon:'📧', name:'Sending Emails',          tag:'medium' },
    { id:'callouts',   icon:'🌐', name:'HTTP Callouts',           tag:'medium' },
  ],
  advanced: [
    { id:'batch',      icon:'🔄', name:'Batch Apex',              tag:'advanced' },
    { id:'queueable',  icon:'📬', name:'Queueable & Future',      tag:'advanced' },
    { id:'scheduled',  icon:'⏰', name:'Scheduled Apex',          tag:'advanced' },
    { id:'testing',    icon:'🧪', name:'Apex Testing',            tag:'advanced' },
    { id:'mocking',    icon:'🃏', name:'Mocks & Test Patterns',   tag:'advanced' },
    { id:'security',   icon:'🔒', name:'Security & CRUD',         tag:'advanced' },
    { id:'lwc',        icon:'⚛️', name:'LWC & Apex Integration',  tag:'advanced', badge:'LWC' },
    { id:'patterns',   icon:'🧩', name:'Enterprise Patterns',     tag:'advanced' },
  ]
};

// ─────────────────────────────────────────
// LESSONS
// ─────────────────────────────────────────
const LESSONS = {};
function L(id, title, level, code, html) {
  LESSONS[id] = { title, level, code, content: () => html };
}

L('hello','Hello, Apex','basic',
`// Apex runs on Salesforce servers — not locally
// Execute via: Setup → Developer Console → Execute Anonymous

// Print to debug log
System.debug('Hello, Apex!');
System.debug('Welcome to Salesforce development');

// Apex is strongly typed and case-insensitive for keywords
String greeting = 'Hello, World!';
Integer count   = 42;
Boolean isActive = true;
Decimal price   = 99.99;

System.debug(greeting);
System.debug('Count: ' + count);
System.debug('Active: ' + isActive);
System.debug('Price: ' + price);

// Date and DateTime
Date today    = Date.today();
DateTime now  = DateTime.now();
System.debug('Today: ' + today);
System.debug('Now: '   + now);

// String methods
String name = 'salesforce';
System.debug(name.toUpperCase());
System.debug(name.length());
System.debug(name.contains('force'));`,
`<div class="lesson-h2">What is Apex?</div>
<p class="lesson-p">Apex is Salesforce's <strong>proprietary, strongly-typed, object-oriented programming language</strong> — Java-like syntax that runs on Salesforce servers. It's the primary language for custom business logic, triggers, batch jobs, REST APIs, and LWC backends.</p>
<div class="callout callout-info"><div class="callout-icon">☁️</div><div class="callout-body"><div class="callout-title">Apex runs in the cloud</div><div class="callout-text">All Apex runs on Salesforce's multi-tenant cloud. It's not compiled to a JVM — it compiles to a Salesforce-internal bytecode. Governor limits enforce fair resource use across all tenants on shared infrastructure.</div></div></div>
<div class="lesson-h2">Running Apex</div>
<div class="compile-box"><div class="cbox-title">🔧 Ways to Execute Apex</div>
<div class="c-step"><div class="c-num">1</div><div><div class="c-cmd">Developer Console → Execute Anonymous</div><div class="c-desc">Quick one-off scripts — like a REPL. Results appear in the debug log.</div></div></div>
<div class="c-step"><div class="c-num">2</div><div><div class="c-cmd">VS Code + Salesforce Extensions + SFDX</div><div class="c-desc">The modern developer workflow. Use <code>SFDX: Execute Anonymous Apex</code>.</div></div></div>
<div class="c-step"><div class="c-num">3</div><div><div class="c-cmd">Apex Classes (saved to org)</div><div class="c-desc">Persistent logic called by triggers, LWC, flows, or REST API.</div></div></div></div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — Hello World</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="ty">String</span> greeting = <span class="st">'Hello, Apex!'</span>;
<span class="ty">Integer</span> year    = <span class="nm">2025</span>;
System.<span class="fn">debug</span>(greeting + <span class="st">' Year: '</span> + year);
<span class="cm">// Output visible in: Setup → Debug Logs</span></pre></div>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">System.debug()</div><div class="callout-text">Like <code>console.log</code> for Apex. Output goes to the debug log, viewable in Developer Console or VS Code. Use log levels: <code>System.debug(LoggingLevel.WARN, msg)</code> for production-safe logging.</div></div></div>`);

L('variables','Variables & Data Types','basic',
`// Apex primitive types
Integer   i = 100;
Long      l = 9999999999L;
Double    d = 3.14159;
Decimal   money = 19.99;      // for financial — use Decimal, not Double
String    s = 'Hello';
Boolean   b = true;
Date      dt = Date.today();
DateTime  dtt = DateTime.now();
Time      t  = Time.newInstance(14, 30, 0, 0);
Id        recordId = '001000000000001';  // 18-char Salesforce Id
Blob      data = Blob.valueOf('binary data');

// Null safety
String maybeNull = null;
System.debug(maybeNull == null);   // true
// maybeNull.length()  → NullPointerException!
if (maybeNull != null) {
    System.debug(maybeNull.length());
}

// String operations
String full = 'Salesforce';
System.debug(full.substring(0, 5));    // Sales
System.debug(full.replace('force', 'FORCE'));
System.debug(String.isBlank(''));      // true
System.debug(String.isBlank('  '));    // true
System.debug(String.valueOf(42));      // '42'

// Type conversions
Integer num = Integer.valueOf('123');
String  str = String.valueOf(456);
Decimal dec = Decimal.valueOf('9.99');

System.debug(num + 1);   // 124
System.debug(dec * 2);   // 19.98`,
`<div class="lesson-h2">Primitive Types</div>
<p class="lesson-p">Apex has a rich set of primitive types. Use <code>Decimal</code> for any monetary values — never <code>Double</code>, which loses precision. All variables default to <code>null</code> if not initialized.</p>
<table class="ref-table">
<tr><th>Type</th><th>Example</th><th>Notes</th></tr>
<tr><td>Integer</td><td>42</td><td>32-bit signed</td></tr>
<tr><td>Long</td><td>9999999999L</td><td>64-bit signed, suffix L</td></tr>
<tr><td>Double</td><td>3.14</td><td>64-bit float — avoid for money</td></tr>
<tr><td>Decimal</td><td>19.99</td><td>Arbitrary precision — use for currency</td></tr>
<tr><td>String</td><td>'hello'</td><td>Single quotes, Unicode, immutable</td></tr>
<tr><td>Boolean</td><td>true / false</td><td>Never null in practice</td></tr>
<tr><td>Date</td><td>Date.today()</td><td>Date only, no time</td></tr>
<tr><td>DateTime</td><td>DateTime.now()</td><td>Date + time, always UTC internally</td></tr>
<tr><td>Id</td><td>'001...'</td><td>15 or 18-char Salesforce record Id</td></tr>
<tr><td>Blob</td><td>Blob.valueOf()</td><td>Binary data</td></tr>
</table>
<div class="callout callout-warn"><div class="callout-icon">⚠️</div><div class="callout-body"><div class="callout-title">Everything can be null</div><div class="callout-text">Unlike Java primitives, all Apex types (even Integer) can be null. Always null-check before calling methods on variables that might be null, especially fields retrieved from SOQL.</div></div></div>`);

L('collections','Collections','basic',
`// LIST — ordered, allows duplicates
List<String> names = new List<String>{'Alice', 'Bob', 'Carol'};
names.add('Dave');
names.add(0, 'Zara');       // insert at index
System.debug(names);        // [Zara, Alice, Bob, Carol, Dave]
System.debug(names.size()); // 5
System.debug(names.get(2)); // Bob
names.remove(0);            // remove by index
System.debug(names[0]);     // Alice (array-style access)

// SET — unordered, no duplicates
Set<Integer> nums = new Set<Integer>{1, 2, 3, 2, 1};
System.debug(nums);            // {1, 2, 3}
nums.add(4);
System.debug(nums.contains(2));// true
nums.remove(2);

// MAP — key-value pairs
Map<String, Integer> scores = new Map<String, Integer>{
    'Alice' => 95,
    'Bob'   => 87,
    'Carol' => 92
};
scores.put('Dave', 88);
System.debug(scores.get('Alice'));      // 95
System.debug(scores.containsKey('Eve'));// false
System.debug(scores.keySet());
System.debug(scores.values());

// Map from SOQL — very common pattern
Map<Id, Account> accountMap = new Map<Id, Account>(
    [SELECT Id, Name FROM Account LIMIT 10]
);
// Access by Id instantly — O(1) lookup
// System.debug(accountMap.get(someId).Name);

// Iterating
for (String name : names) {
    System.debug('Name: ' + name);
}
for (Id key : accountMap.keySet()) {
    System.debug(accountMap.get(key).Name);
}`,
`<div class="lesson-h2">Apex Collections</div>
<p class="lesson-p">Apex has three collection types: <code>List</code>, <code>Set</code>, and <code>Map</code>. They are heavily used for bulkification — processing many records at once to avoid governor limits.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — Collections</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm">// List — ordered, indexed, allows dupes</span>
<span class="ty">List</span>&lt;<span class="ty">String</span>&gt; items = <span class="kw">new</span> <span class="ty">List</span>&lt;<span class="ty">String</span>&gt;{<span class="st">'a'</span>, <span class="st">'b'</span>};
items.add(<span class="st">'c'</span>);
<span class="cm">// Set — no dupes, unordered, fast membership check</span>
<span class="ty">Set</span>&lt;<span class="ty">Id</span>&gt; ids = <span class="kw">new</span> <span class="ty">Set</span>&lt;<span class="ty">Id</span>&gt;();
<span class="cm">// Map — key→value, instant O(1) lookup</span>
<span class="ty">Map</span>&lt;<span class="ty">Id</span>, <span class="ty">Account</span>&gt; acctMap = <span class="kw">new</span> <span class="ty">Map</span>&lt;<span class="ty">Id</span>, <span class="ty">Account</span>&gt;(
    [<span class="kw">SELECT</span> Id, Name <span class="kw">FROM</span> Account]
);</pre></div>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">Map from SOQL — the most important pattern</div><div class="callout-text"><code>new Map&lt;Id, SObject&gt;(soqlQuery)</code> automatically keys records by their Id. This is the foundation of efficient Apex — query once, build a map, then do all lookups from the map inside loops.</div></div></div>`);

L('control','Control Flow','basic',
`// if / else if / else
Integer score = 85;
String grade;
if (score >= 90)      grade = 'A';
else if (score >= 80) grade = 'B';
else if (score >= 70) grade = 'C';
else                  grade = 'F';
System.debug('Grade: ' + grade);  // B

// Ternary operator
String status = score >= 60 ? 'Pass' : 'Fail';
System.debug(status);

// for loop
for (Integer i = 0; i < 5; i++) {
    System.debug('i = ' + i);
}

// for-each loop (most common in Apex)
List<String> fruits = new List<String>{'apple', 'banana', 'cherry'};
for (String fruit : fruits) {
    System.debug(fruit.toUpperCase());
}

// while loop
Integer n = 1;
while (n <= 5) {
    System.debug(n);
    n++;
}

// SOQL for loop — processes records in batches of 200
// Avoids heap size limit for large datasets
for (List<Contact> batch : [SELECT Id, FirstName, LastName FROM Contact]) {
    for (Contact c : batch) {
        System.debug(c.FirstName + ' ' + c.LastName);
    }
}

// switch statement (Apex supports switch on strings/integers/enums/sObjects)
String day = 'MONDAY';
switch on day {
    when 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY' {
        System.debug('Weekday');
    }
    when 'SATURDAY', 'SUNDAY' {
        System.debug('Weekend');
    }
    when else {
        System.debug('Unknown');
    }
}`,
`<div class="lesson-h2">Control Flow</div>
<p class="lesson-p">Apex control flow is Java-like. The <strong>SOQL for loop</strong> is uniquely powerful — it processes large record sets in batches of 200 to avoid hitting heap size limits.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — switch on</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm">// switch on works with String, Integer, Long, sObject types</span>
<span class="kw">switch on</span> recordType {
  <span class="kw">when</span> <span class="st">'Account'</span>  { processAccount(rec); }
  <span class="kw">when</span> <span class="st">'Contact'</span>  { processContact(rec); }
  <span class="kw">when else</span>       { System.<span class="fn">debug</span>(<span class="st">'Unknown type'</span>); }
}</pre></div>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">SOQL for loop</div><div class="callout-text">Wrap SOQL directly in a for loop: <code>for (List&lt;Account&gt; batch : [SELECT ...])</code>. Salesforce processes records in chunks of 200, keeping heap usage low. Essential for large data volumes that exceed the 50,000 SOQL row limit.</div></div></div>`);

L('classes','Classes & Methods','basic',
`// Apex class — use access modifiers and the 'with sharing' keyword
public with sharing class AccountService {

    // Constants
    private static final Integer MAX_ACCOUNTS = 200;

    // Instance variable
    private String ownerName;

    // Constructor
    public AccountService(String ownerName) {
        this.ownerName = ownerName;
    }

    // Static method
    public static List<Account> getActiveAccounts() {
        return [SELECT Id, Name, Type
                FROM Account
                WHERE IsActive__c = true
                LIMIT :MAX_ACCOUNTS];
    }

    // Instance method
    public Account createAccount(String name, String type) {
        Account acc = new Account(
            Name        = name,
            Type        = type,
            OwnerId     = UserInfo.getUserId()
        );
        insert acc;
        return acc;
    }

    // Method overloading
    public static Decimal calculateDiscount(Decimal price) {
        return calculateDiscount(price, 0.10);
    }
    public static Decimal calculateDiscount(Decimal price, Decimal rate) {
        return price * (1 - rate);
    }

    // Properties (getter/setter)
    public String OwnerName {
        get { return this.ownerName; }
        set { this.ownerName = value.trim(); }
    }
}

// Using the class
AccountService svc = new AccountService('Alice');
Decimal disc = AccountService.calculateDiscount(100.00);
System.debug('Discount: ' + disc);  // 90.00`,
`<div class="lesson-h2">Apex Classes</div>
<p class="lesson-p">Apex classes are similar to Java classes. Always use <code>with sharing</code> unless you have a specific reason not to — it enforces record-level access (sharing rules) for the running user.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — Class structure</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">public with sharing class</span> <span class="ty">MyService</span> {
  <span class="kw">private static final</span> <span class="ty">String</span> DEFAULT = <span class="st">'value'</span>;
  <span class="kw">public</span> <span class="ty">MyService</span>() { }
  <span class="kw">public static</span> <span class="ty">String</span> <span class="fn">doWork</span>() { <span class="kw">return</span> DEFAULT; }
}</pre></div>
<div class="lesson-h2">Sharing Keywords</div>
<table class="ref-table">
<tr><th>Keyword</th><th>Behaviour</th><th>Use When</th></tr>
<tr><td>with sharing</td><td>Respects user's sharing rules</td><td>Default — always use unless you need more access</td></tr>
<tr><td>without sharing</td><td>Ignores sharing rules</td><td>System-level operations, data migration, specific admin tasks</td></tr>
<tr><td>inherited sharing</td><td>Inherits from calling class</td><td>Utility/service classes that should adapt to context</td></tr>
</table>
<div class="callout callout-warn"><div class="callout-icon">⚠️</div><div class="callout-body"><div class="callout-title">Always declare sharing</div><div class="callout-text">Omitting the sharing keyword defaults to <em>without sharing</em> — a security risk. Make <code>with sharing</code> your default and only use <code>without sharing</code> consciously with a code comment explaining why.</div></div></div>`);

L('soql','SOQL Basics','basic',
`// SOQL — Salesforce Object Query Language
// Like SQL, but always runs inside Apex (or Dev Console)

// Basic SELECT
List<Account> accounts = [SELECT Id, Name, Type, AnnualRevenue
                           FROM Account
                           WHERE Type = 'Customer'
                           ORDER BY Name ASC
                           LIMIT 10];

for (Account a : accounts) {
    System.debug(a.Name + ' — ' + a.AnnualRevenue);
}

// Filtering with bind variables (ALWAYS use — prevents SOQL injection)
String nameFilter = 'Acme%';
Integer minRevenue = 1000000;
List<Account> filtered = [SELECT Id, Name
                           FROM Account
                           WHERE Name LIKE :nameFilter
                           AND AnnualRevenue >= :minRevenue];

// Relationship queries — parent fields (dot notation)
List<Contact> contacts = [SELECT Id, FirstName, LastName,
                                  Account.Name, Account.Type
                           FROM Contact
                           WHERE Account.Type = 'Customer'
                           LIMIT 20];
for (Contact c : contacts) {
    System.debug(c.FirstName + ' @ ' + c.Account.Name);
}

// Child-to-parent subquery (related list)
List<Account> withContacts = [SELECT Id, Name,
                               (SELECT FirstName, LastName FROM Contacts
                                WHERE IsActive__c = true
                                ORDER BY LastName)
                               FROM Account
                               WHERE Type = 'Customer'];
for (Account a : withContacts) {
    System.debug(a.Name + ' has ' + a.Contacts.size() + ' contacts');
}

// Aggregate functions
AggregateResult[] results = [SELECT Type, COUNT(Id) cnt, AVG(AnnualRevenue) avgRev
                              FROM Account
                              GROUP BY Type
                              HAVING COUNT(Id) > 1];
for (AggregateResult ar : results) {
    System.debug(ar.get('Type') + ': ' + ar.get('cnt') + ' avg: ' + ar.get('avgRev'));
}`,
`<div class="lesson-h2">SOQL</div>
<p class="lesson-p">SOQL (Salesforce Object Query Language) is the SQL-like query language for Salesforce objects. It can only query — for DML use insert/update/delete. Always use <strong>bind variables</strong> (<code>:varName</code>) for user input.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — SOQL</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm">// Always bind variables — prevents SOQL injection</span>
<span class="ty">String</span> name = <span class="st">'Acme%'</span>;
<span class="ty">List</span>&lt;<span class="ty">Account</span>&gt; accts = [<span class="kw">SELECT</span> Id, Name
                       <span class="kw">FROM</span> Account
                       <span class="kw">WHERE</span> Name <span class="kw">LIKE</span> :name];
<span class="cm">// NOT: WHERE Name LIKE '" + name + "' ← SOQL injection risk</span></pre></div>
<div class="lesson-h2">Relationship Queries</div>
<table class="ref-table">
<tr><th>Pattern</th><th>Direction</th><th>Syntax</th></tr>
<tr><td>Parent lookup</td><td>Child → Parent</td><td>Account.Name (dot notation)</td></tr>
<tr><td>Child subquery</td><td>Parent → Children</td><td>(SELECT … FROM Contacts)</td></tr>
<tr><td>Custom relationship</td><td>Child → Parent</td><td>ParentObject__r.Field__c</td></tr>
</table>
<div class="callout callout-warn"><div class="callout-icon">⚠️</div><div class="callout-body"><div class="callout-title">Governor Limits for SOQL</div><div class="callout-text">Max 100 SOQL queries per transaction. Max 50,000 rows returned total. Never put SOQL inside a for loop — query once, store in a collection, process from the collection.</div></div></div>`);

L('dml','DML Operations','basic',
`// DML — Data Manipulation Language
// Insert, update, upsert, delete, undelete, merge

// INSERT
Account newAccount = new Account(
    Name        = 'Acme Corp',
    Type        = 'Prospect',
    Phone       = '555-1234',
    BillingCity = 'San Francisco'
);
insert newAccount;
System.debug('New Account Id: ' + newAccount.Id);  // Id auto-populated after insert

// Bulk insert (always prefer bulk — same DML statement cost)
List<Contact> contacts = new List<Contact>();
for (Integer i = 0; i < 5; i++) {
    contacts.add(new Contact(
        FirstName = 'User',
        LastName  = 'Test' + i,
        AccountId = newAccount.Id
    ));
}
insert contacts;

// UPDATE
newAccount.Type = 'Customer';
newAccount.AnnualRevenue = 500000;
update newAccount;

// UPSERT — insert or update based on matching field
Account upsertMe = new Account(Name = 'Maybe New Corp');
upsert upsertMe;     // uses Id field; if null → insert, if set → update
// upsert records ExternalId__c;  // upsert on custom external Id field

// DELETE
Contact oldContact = contacts[0];
delete oldContact;

// UNDELETE — from Recycle Bin (within 15 days)
// undelete oldContact;

// Database class methods — allow partial success
List<Account> toInsert = new List<Account>{
    new Account(Name = 'Good Account'),
    new Account()  // will fail — Name is required
};
Database.SaveResult[] results = Database.insert(toInsert, false); // false = allow partial
for (Database.SaveResult sr : results) {
    if (sr.isSuccess()) System.debug('Inserted: ' + sr.getId());
    else System.debug('Error: ' + sr.getErrors()[0].getMessage());
}`,
`<div class="lesson-h2">DML Operations</div>
<p class="lesson-p">DML statements modify records in the database. Unlike SOQL (which returns data), DML statements create, update, or delete records. Apex DML is transactional — all-or-nothing by default.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — DML</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm">// All-or-nothing (throws on any failure)</span>
<span class="kw">insert</span> records;
<span class="kw">update</span> records;
<span class="kw">upsert</span> records;
<span class="kw">delete</span> records;
<span class="cm">// Partial success — use Database class</span>
<span class="ty">Database</span>.<span class="ty">SaveResult</span>[] results = <span class="ty">Database</span>.<span class="fn">insert</span>(records, <span class="kw">false</span>);</pre></div>
<div class="lesson-h2">DML Governor Limits</div>
<table class="ref-table">
<tr><th>Limit</th><th>Value</th></tr>
<tr><td>DML statements per transaction</td><td>150</td></tr>
<tr><td>Records per DML statement</td><td>10,000</td></tr>
<tr><td>Records per transaction (total)</td><td>10,000</td></tr>
</table>
<div class="callout callout-danger"><div class="callout-icon">🚫</div><div class="callout-body"><div class="callout-title">Never DML inside a loop</div><div class="callout-text">This is the #1 Apex anti-pattern. Each DML statement counts toward the 150 limit. Always collect records into a list and perform a single DML on the list after the loop.</div></div></div>`);

L('exceptions','Exception Handling','basic',
`// Apex exception handling — Java-style try/catch/finally

// Basic try-catch
try {
    Account acc = [SELECT Id FROM Account WHERE Id = '0000000000000001'];
    System.debug(acc.Id);
} catch (QueryException e) {
    System.debug('No record found: ' + e.getMessage());
} catch (Exception e) {
    System.debug('Unexpected error: ' + e.getMessage());
    System.debug('Stack trace: '     + e.getStackTraceString());
} finally {
    System.debug('Always runs — cleanup here');
}

// DmlException — thrown when DML fails
try {
    Account bad = new Account();  // Name is required
    insert bad;
} catch (DmlException e) {
    System.debug('DML failed on field: ' + e.getDmlFieldNames(0));
    System.debug('Message: ' + e.getDmlMessage(0));
}

// Custom exceptions — extend Exception class
public class AccountServiceException extends Exception {}

// Throw custom exception
public static Account getRequired(String name) {
    List<Account> accts = [SELECT Id, Name FROM Account WHERE Name = :name LIMIT 1];
    if (accts.isEmpty()) {
        throw new AccountServiceException('Account not found: ' + name);
    }
    return accts[0];
}

// Catching custom exceptions
try {
    Account a = getRequired('NonExistentCorp');
} catch (AccountServiceException e) {
    System.debug('Business error: ' + e.getMessage());
}

System.debug('Exception handling complete');`,
`<div class="lesson-h2">Exception Handling</div>
<p class="lesson-p">Apex exceptions work like Java. The most common types are <code>QueryException</code> (SOQL returns no rows when one is expected), <code>DmlException</code> (DML fails), and <code>NullPointerException</code>.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — Custom Exception</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm">// Extend Exception to create domain exceptions</span>
<span class="kw">public class</span> <span class="ty">MyAppException</span> <span class="kw">extends</span> <span class="ty">Exception</span> {}
<span class="kw">throw new</span> <span class="ty">MyAppException</span>(<span class="st">'Something went wrong'</span>);
<span class="cm">// With inner cause</span>
<span class="kw">throw new</span> <span class="ty">MyAppException</span>(<span class="st">'Wrapped error'</span>, originalException);</pre></div>
<div class="lesson-h2">Common Exception Types</div>
<table class="ref-table">
<tr><th>Exception</th><th>Cause</th></tr>
<tr><td>QueryException</td><td>SOQL returns 0 rows when 1 expected, or >1 when 1 expected</td></tr>
<tr><td>DmlException</td><td>insert/update/delete fails validation or constraint</td></tr>
<tr><td>NullPointerException</td><td>Method called on null reference</td></tr>
<tr><td>LimitException</td><td>Governor limit exceeded (uncatchable — transaction rolls back)</td></tr>
<tr><td>CalloutException</td><td>HTTP callout fails or times out</td></tr>
<tr><td>SObjectException</td><td>Accessing a field not in the SELECT list</td></tr>
</table>`);

L('debug','Debug & Logging','basic',
`// Apex Debug Logging

// Basic debug levels
System.debug('Simple message');
System.debug(LoggingLevel.INFO,    'Info message');
System.debug(LoggingLevel.WARN,    'Warning: something looks off');
System.debug(LoggingLevel.ERROR,   'Error occurred!');
System.debug(LoggingLevel.DEBUG,   'Debug detail');
System.debug(LoggingLevel.FINE,    'Fine-grained detail');
System.debug(LoggingLevel.FINER,   'Even finer detail');
System.debug(LoggingLevel.FINEST,  'Most detailed');

// Debug complex objects
Account a = new Account(Name = 'Test', Type = 'Customer');
System.debug('Account: ' + JSON.serialize(a));

// Logging limits and governor info
System.debug('CPU Time used: '  + Limits.getCpuTime() + ' / ' + Limits.getLimitCpuTime());
System.debug('SOQL queries: '   + Limits.getQueries() + ' / ' + Limits.getLimitQueries());
System.debug('DML statements: ' + Limits.getDmlStatements() + ' / ' + Limits.getLimitDmlStatements());
System.debug('Heap size: '      + Limits.getHeapSize() + ' / ' + Limits.getLimitHeapSize());

// Custom logger utility pattern
public class Logger {
    private static List<String> logs = new List<String>();

    public static void log(String message) {
        String entry = DateTime.now() + ' | ' + message;
        logs.add(entry);
        System.debug(entry);
    }

    public static List<String> getLogs() { return logs; }
}

Logger.log('Starting process');
Logger.log('Step 1 complete');
Logger.log('Done. Total log entries: ' + Logger.getLogs().size());`,
`<div class="lesson-h2">Debug Logging</div>
<p class="lesson-p">All Apex debug output goes to the <strong>debug log</strong>. Set up a trace flag on your user in Setup → Debug Logs to capture logs for your next requests.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — Logging Levels</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre>System.<span class="fn">debug</span>(LoggingLevel.WARN, <span class="st">'message'</span>);
<span class="cm">// Levels: ERROR, WARN, INFO, DEBUG, FINE, FINER, FINEST</span>
<span class="cm">// Use WARN/ERROR in production code — DEBUG clutters logs</span></pre></div>
<div class="lesson-h2">Limits Class</div>
<p class="lesson-p">The <code>Limits</code> class lets you inspect governor limit consumption in real-time — invaluable for debugging performance issues.</p>
<table class="ref-table">
<tr><th>Method</th><th>What it measures</th></tr>
<tr><td>Limits.getQueries()</td><td>SOQL queries used</td></tr>
<tr><td>Limits.getCpuTime()</td><td>CPU milliseconds used</td></tr>
<tr><td>Limits.getHeapSize()</td><td>Heap bytes used</td></tr>
<tr><td>Limits.getDmlStatements()</td><td>DML statements used</td></tr>
<tr><td>Limits.getCallouts()</td><td>HTTP callouts used</td></tr>
</table>`);

L('schema','Schema & sObjects','basic',
`// sObjects — Salesforce database objects in Apex

// Dynamic sObject creation
SObject rec = Schema.getGlobalDescribe().get('Account').newSObject();
rec.put('Name', 'Dynamic Account');
rec.put('Type', 'Customer');
insert rec;

// Describe — inspect schema at runtime
Schema.DescribeSObjectResult accDescribe = Account.SObjectType.getDescribe();
System.debug('Labelname: '  + accDescribe.getLabel());
System.debug('API name: '   + accDescribe.getName());
System.debug('Is createable: ' + accDescribe.isCreateable());

// Field describe
Schema.DescribeFieldResult fieldDesc = Account.Type.getDescribe();
System.debug('Field type: '    + fieldDesc.getType());
System.debug('Field label: '   + fieldDesc.getLabel());
System.debug('Is required: '   + !fieldDesc.isNillable());
System.debug('Picklist values:');
for (Schema.PicklistEntry ple : fieldDesc.getPicklistValues()) {
    System.debug('  ' + ple.getValue() + ' | Active: ' + ple.isActive());
}

// Token-based approach — compile-time safe
Schema.SObjectType accountType = Account.SObjectType;
Map<String, Schema.SObjectField> fields = Schema.SObjectType.Account.fields.getMap();
for (String fieldName : fields.keySet()) {
    Schema.DescribeFieldResult fdr = fields.get(fieldName).getDescribe();
    if (fdr.isCustom()) {
        System.debug('Custom field: ' + fieldName + ' (' + fdr.getType() + ')');
    }
}

System.debug('Schema inspection complete');`,
`<div class="lesson-h2">Schema & sObjects</div>
<p class="lesson-p">Salesforce objects (sObjects) map directly to database tables. The <code>Schema</code> class lets you introspect object and field metadata at runtime — useful for generic utilities and metadata-driven code.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — Schema Describe</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm">// Describe an object</span>
<span class="ty">Schema</span>.<span class="ty">DescribeSObjectResult</span> d = Account.SObjectType.getDescribe();
<span class="cm">// Describe a field — compile-time safe token</span>
<span class="ty">Schema</span>.<span class="ty">DescribeFieldResult</span> fd = Account.Type.getDescribe();
<span class="cm">// Get all fields of an object</span>
<span class="ty">Map</span>&lt;<span class="ty">String</span>, <span class="ty">Schema</span>.<span class="ty">SObjectField</span>&gt; fields =
    <span class="ty">Schema</span>.SObjectType.Account.fields.<span class="fn">getMap</span>();</pre></div>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">Use field tokens, not strings</div><div class="callout-text">Prefer <code>Account.Name</code> (compile-time token) over <code>'Name'</code> (string). Field tokens are validated at compile time, while strings will only fail at runtime. Use tokens in SOQL bind vars and schema describes.</div></div></div>`);

L('triggers','Apex Triggers','medium',
`// Triggers fire before/after DML events on sObjects

trigger AccountTrigger on Account (
    before insert, before update, before delete,
    after insert,  after update,  after delete, after undelete
) {
    // Route to handler — never put logic directly in trigger
    AccountTriggerHandler.run();
}

// The handler class
public with sharing class AccountTriggerHandler {

    public static void run() {
        if (Trigger.isBefore) {
            if (Trigger.isInsert) onBeforeInsert(Trigger.new);
            if (Trigger.isUpdate) onBeforeUpdate(Trigger.new, Trigger.oldMap);
        }
        if (Trigger.isAfter) {
            if (Trigger.isInsert) onAfterInsert(Trigger.new);
            if (Trigger.isUpdate) onAfterUpdate(Trigger.new, Trigger.oldMap);
        }
    }

    private static void onBeforeInsert(List<Account> newAccounts) {
        for (Account a : newAccounts) {
            // Set default values before insert
            if (String.isBlank(a.Rating)) a.Rating = 'Warm';
            // Standardize phone format
            if (a.Phone != null) {
                a.Phone = formatPhone(a.Phone);
            }
        }
    }

    private static void onBeforeUpdate(List<Account> newAccounts,
                                        Map<Id, Account> oldMap) {
        for (Account a : newAccounts) {
            Account old = oldMap.get(a.Id);
            // Only act if relevant field changed
            if (a.AnnualRevenue != old.AnnualRevenue) {
                a.Rating = a.AnnualRevenue > 1000000 ? 'Hot' : 'Warm';
            }
        }
    }

    private static void onAfterInsert(List<Account> newAccounts) {
        // Create related records, send notifications, etc.
        createDefaultContacts(newAccounts);
    }

    private static void onAfterUpdate(List<Account> newAccounts,
                                       Map<Id, Account> oldMap) { }

    private static String formatPhone(String phone) {
        return phone.replaceAll('[^0-9]', '');
    }
    private static void createDefaultContacts(List<Account> accounts) { }
}`,
`<div class="lesson-h2">Apex Triggers</div>
<p class="lesson-p">Triggers execute custom Apex code before or after DML operations. Always follow the <strong>thin trigger, fat handler</strong> pattern — one trigger per object, routing to a handler class.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — Trigger Context Variables</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="ty">Trigger</span>.new       <span class="cm">// List of new records (insert/update)</span>
<span class="ty">Trigger</span>.old       <span class="cm">// List of old records (update/delete)</span>
<span class="ty">Trigger</span>.newMap    <span class="cm">// Map&lt;Id, SObject&gt; of new records</span>
<span class="ty">Trigger</span>.oldMap    <span class="cm">// Map&lt;Id, SObject&gt; of old records</span>
<span class="ty">Trigger</span>.isBefore  <span class="cm">// true in before context</span>
<span class="ty">Trigger</span>.isAfter   <span class="cm">// true in after context</span>
<span class="ty">Trigger</span>.isInsert  <span class="cm">// true for insert event</span>
<span class="ty">Trigger</span>.isUpdate  <span class="cm">// true for update event</span>
<span class="ty">Trigger</span>.size      <span class="cm">// number of records in this trigger call</span></pre></div>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">One trigger per object</div><div class="callout-text">Multiple triggers on the same object fire in unpredictable order. Keep exactly one trigger per sObject and route all logic through a single handler class. This makes testing, maintenance, and execution order control much easier.</div></div></div>`);

L('governor','Governor Limits','medium',
`// Governor limits enforce fairness on Salesforce's multi-tenant platform

// KEY LIMITS per synchronous transaction:
// - SOQL queries:   100
// - SOQL rows:      50,000
// - DML statements: 150
// - DML records:    10,000
// - CPU time:       10,000 ms
// - Heap size:      6 MB
// - Callouts:       100

// Check limits at runtime
public class LimitChecker {
    public static void printLimits() {
        System.debug('── Governor Limit Status ──');
        System.debug('SOQL Queries:   '  + Limits.getQueries()        + ' / ' + Limits.getLimitQueries());
        System.debug('SOQL Rows:      '  + Limits.getQueryRows()       + ' / ' + Limits.getLimitQueryRows());
        System.debug('DML Statements: '  + Limits.getDmlStatements()   + ' / ' + Limits.getLimitDmlStatements());
        System.debug('DML Rows:       '  + Limits.getDmlRows()         + ' / ' + Limits.getLimitDmlRows());
        System.debug('CPU Time (ms):  '  + Limits.getCpuTime()         + ' / ' + Limits.getLimitCpuTime());
        System.debug('Heap Size (b):  '  + Limits.getHeapSize()        + ' / ' + Limits.getLimitHeapSize());
        System.debug('Callouts:       '  + Limits.getCallouts()        + ' / ' + Limits.getLimitCallouts());
    }
}

// ❌ Anti-pattern: SOQL in loop (hits 100 SOQL limit fast)
public static void badPattern(List<Account> accounts) {
    for (Account a : accounts) {
        List<Contact> contacts = [SELECT Id FROM Contact WHERE AccountId = :a.Id]; // ❌ SOQL in loop!
        System.debug(contacts.size());
    }
}

// ✅ Best practice: query outside loop, use map
public static void goodPattern(List<Account> accounts) {
    Set<Id> accountIds = new Map<Id, Account>(accounts).keySet();
    List<Contact> allContacts = [SELECT Id, AccountId FROM Contact
                                  WHERE AccountId IN :accountIds];
    Map<Id, List<Contact>> contactsByAccount = new Map<Id, List<Contact>>();
    for (Contact c : allContacts) {
        if (!contactsByAccount.containsKey(c.AccountId)) {
            contactsByAccount.put(c.AccountId, new List<Contact>());
        }
        contactsByAccount.get(c.AccountId).add(c);
    }
    for (Account a : accounts) {
        List<Contact> contacts = contactsByAccount.get(a.Id) ?? new List<Contact>();
        System.debug(a.Name + ': ' + contacts.size() + ' contacts');
    }
}

LimitChecker.printLimits();`,
`<div class="lesson-h2">Governor Limits</div>
<p class="lesson-p">Governor limits prevent any single tenant from monopolizing shared Salesforce infrastructure. Understanding and respecting them is the most important skill in Apex development.</p>
<table class="ref-table">
<tr><th>Resource</th><th>Sync Limit</th><th>Async Limit</th></tr>
<tr><td>SOQL queries</td><td>100</td><td>200</td></tr>
<tr><td>SOQL rows returned</td><td>50,000</td><td>50,000</td></tr>
<tr><td>DML statements</td><td>150</td><td>150</td></tr>
<tr><td>DML records</td><td>10,000</td><td>10,000</td></tr>
<tr><td>CPU time</td><td>10,000 ms</td><td>60,000 ms</td></tr>
<tr><td>Heap size</td><td>6 MB</td><td>12 MB</td></tr>
<tr><td>Callouts</td><td>100</td><td>100</td></tr>
<tr><td>Future calls</td><td>50</td><td>—</td></tr>
</table>
<div class="callout callout-danger"><div class="callout-icon">🚫</div><div class="callout-body"><div class="callout-title">The Golden Rules</div><div class="callout-text"><strong>1.</strong> Never SOQL inside a loop. <strong>2.</strong> Never DML inside a loop. <strong>3.</strong> Query once, process in memory. <strong>4.</strong> Use collections to batch operations. These four rules prevent 95% of governor limit violations.</div></div></div>`);

L('bulkify','Bulkification Patterns','medium',
`// Bulkification — writing code that handles 1 or 200 records equally well
// Triggers can fire with up to 200 records in one call

// ❌ Non-bulkified (fails for >1 record due to SOQL/DML in loops)
public class BadContactService {
    public static void updateRating_BAD(List<Contact> contacts) {
        for (Contact c : contacts) {
            // SOQL #1, #2, #3... per contact — hits limit fast!
            Account acc = [SELECT Id, AnnualRevenue FROM Account WHERE Id = :c.AccountId];
            c.Rating__c = acc.AnnualRevenue > 1000000 ? 'A' : 'B';
            update c;  // DML #1, #2, #3... per contact — also bad!
        }
    }
}

// ✅ Fully bulkified version
public class ContactService {
    public static void updateRating(List<Contact> contacts) {
        // Step 1: collect all AccountIds
        Set<Id> accountIds = new Set<Id>();
        for (Contact c : contacts) {
            if (c.AccountId != null) accountIds.add(c.AccountId);
        }

        // Step 2: ONE SOQL query
        Map<Id, Account> accountMap = new Map<Id, Account>(
            [SELECT Id, AnnualRevenue FROM Account WHERE Id IN :accountIds]
        );

        // Step 3: process in memory — no SOQL or DML here
        List<Contact> toUpdate = new List<Contact>();
        for (Contact c : contacts) {
            Account acc = accountMap.get(c.AccountId);
            if (acc != null) {
                String newRating = acc.AnnualRevenue > 1000000 ? 'A' : 'B';
                if (c.Rating__c != newRating) {
                    c.Rating__c = newRating;
                    toUpdate.add(c);
                }
            }
        }

        // Step 4: ONE DML statement
        if (!toUpdate.isEmpty()) update toUpdate;

        System.debug('Updated ' + toUpdate.size() + ' contacts');
        System.debug('SOQL used: ' + Limits.getQueries());
        System.debug('DML used: '  + Limits.getDmlStatements());
    }
}`,
`<div class="lesson-h2">Bulkification</div>
<p class="lesson-p">Bulkification means writing code that handles any number of records with a fixed, small number of SOQL queries and DML statements — regardless of record count.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — Bulkification Pattern</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm">// The 4-step bulkification pattern</span>
<span class="cm">// 1. Collect Ids from the input list</span>
<span class="ty">Set</span>&lt;<span class="ty">Id</span>&gt; ids = <span class="kw">new</span> <span class="ty">Set</span>&lt;<span class="ty">Id</span>&gt;();
<span class="kw">for</span> (SObject s : records) ids.add(s.RelatedId__c);
<span class="cm">// 2. One SOQL query into a Map</span>
<span class="ty">Map</span>&lt;<span class="ty">Id</span>, <span class="ty">Parent__c</span>&gt; parents = <span class="kw">new</span> <span class="ty">Map</span>&lt;<span class="ty">Id</span>, <span class="ty">Parent__c</span>&gt;(
    [<span class="kw">SELECT</span> Id, Field__c <span class="kw">FROM</span> Parent__c <span class="kw">WHERE</span> Id <span class="kw">IN</span> :ids]);
<span class="cm">// 3. Process in memory (no SOQL/DML here)</span>
<span class="ty">List</span>&lt;SObject&gt; toUpdate = <span class="kw">new</span> <span class="ty">List</span>&lt;SObject&gt;();
<span class="cm">// 4. One DML statement</span>
<span class="kw">if</span> (!toUpdate.isEmpty()) <span class="kw">update</span> toUpdate;</pre></div>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">Only update what changed</div><div class="callout-text">Check if a field actually needs to change before adding to the update list. This avoids unnecessary DML, prevents recursive trigger firing, and keeps audit history clean.</div></div></div>`);

L('interfaces','Interfaces & Abstract Classes','medium',
`// Interfaces — define a contract
public interface Processable {
    void process(List<SObject> records);
    Boolean canProcess(SObject record);
}

public interface Loggable {
    void logResult(String result);
}

// Implementing multiple interfaces
public with sharing class AccountProcessor implements Processable, Loggable {

    public void process(List<SObject> records) {
        List<Account> accounts = (List<Account>) records;
        for (Account a : accounts) {
            if (canProcess(a)) {
                a.Rating = 'Hot';
            }
        }
        update accounts;
        logResult('Processed ' + accounts.size() + ' accounts');
    }

    public Boolean canProcess(SObject record) {
        Account a = (Account) record;
        return a.AnnualRevenue != null && a.AnnualRevenue > 500000;
    }

    public void logResult(String result) {
        System.debug('[AccountProcessor] ' + result);
    }
}

// Abstract class — partial implementation
public abstract class BaseService {
    protected String serviceName;

    public BaseService(String name) {
        this.serviceName = name;
    }

    // Concrete method — shared implementation
    protected void logStart() {
        System.debug(serviceName + ' starting at ' + DateTime.now());
    }

    // Abstract method — subclass must implement
    public abstract void execute();
}

public class ReportService extends BaseService {
    public ReportService() { super('ReportService'); }

    public override void execute() {
        logStart();
        System.debug('Generating report...');
    }
}

AccountProcessor proc = new AccountProcessor();
System.debug('Can process null revenue: ' + proc.canProcess(new Account(Name = 'Test')));

ReportService svc = new ReportService();
svc.execute();`,
`<div class="lesson-h2">Interfaces</div>
<p class="lesson-p">Interfaces define contracts — a class that <code>implements</code> an interface must provide all its methods. A class can implement multiple interfaces. This is the foundation of the Strategy and Command design patterns in Apex.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — Interface</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">public interface</span> <span class="ty">ITriggerHandler</span> {
  <span class="kw">void</span> <span class="fn">beforeInsert</span>(<span class="ty">List</span>&lt;SObject&gt; newRecords);
  <span class="kw">void</span> <span class="fn">afterInsert</span>(<span class="ty">List</span>&lt;SObject&gt; newRecords);
}
<span class="kw">public with sharing class</span> <span class="ty">ContactTriggerHandler</span>
    <span class="kw">implements</span> <span class="ty">ITriggerHandler</span> {
  <span class="kw">public void</span> <span class="fn">beforeInsert</span>(<span class="ty">List</span>&lt;SObject&gt; recs) { <span class="cm">/* ... */</span> }
  <span class="kw">public void</span> <span class="fn">afterInsert</span>(<span class="ty">List</span>&lt;SObject&gt; recs) { <span class="cm">/* ... */</span> }
}</pre></div>
<div class="lesson-h2">Abstract vs Interface</div>
<table class="ref-table">
<tr><th>Feature</th><th>Interface</th><th>Abstract Class</th></tr>
<tr><td>Multiple inheritance</td><td>✓ (many interfaces)</td><td>✗ (one parent)</td></tr>
<tr><td>Shared implementation</td><td>✗</td><td>✓</td></tr>
<tr><td>State / fields</td><td>✗</td><td>✓</td></tr>
<tr><td>Constructor</td><td>✗</td><td>✓</td></tr>
<tr><td>Best for</td><td>Contracts, DI</td><td>Template method pattern</td></tr>
</table>`);

L('inner','Inner Classes & Enums','medium',
`// Inner classes — defined inside another class
public with sharing class ApiService {

    // Inner class for request/response models
    public class SearchRequest {
        public String keyword;
        public Integer maxResults;
        public Boolean activeOnly;

        public SearchRequest(String keyword, Integer maxResults) {
            this.keyword    = keyword;
            this.maxResults = maxResults;
            this.activeOnly = true;
        }
    }

    public class SearchResponse {
        public Boolean success;
        public Integer totalFound;
        public List<Account> records;
        public String errorMessage;
    }

    // Enum inside class
    public enum SearchStatus { SUCCESS, NO_RESULTS, ERROR }

    // Method using inner classes
    public SearchResponse search(SearchRequest req) {
        SearchResponse resp = new SearchResponse();
        try {
            String q = '%' + req.keyword + '%';
            resp.records = [SELECT Id, Name, Type
                            FROM Account
                            WHERE Name LIKE :q
                            LIMIT :req.maxResults];
            resp.success    = true;
            resp.totalFound = resp.records.size();
        } catch (Exception e) {
            resp.success      = false;
            resp.errorMessage = e.getMessage();
            resp.records      = new List<Account>();
        }
        return resp;
    }
}

// Top-level enum
public enum Priority { LOW, MEDIUM, HIGH, CRITICAL }

// Using enums
Priority p = Priority.HIGH;
System.debug(p.name());    // 'HIGH'
System.debug(p.ordinal()); // 2 (0-indexed)

List<Priority> all = Priority.values();
for (Priority pv : all) {
    System.debug(pv.name() + ' = ' + pv.ordinal());
}

// Using inner classes externally
ApiService.SearchRequest req = new ApiService.SearchRequest('Acme', 10);
System.debug(req.keyword);`,
`<div class="lesson-h2">Inner Classes</div>
<p class="lesson-p">Inner classes are ideal for <strong>request/response wrappers</strong> in service classes, <strong>data transfer objects</strong> (DTOs) for LWC, and keeping related types together.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — Inner Class (DTO Pattern)</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">public class</span> <span class="ty">AccountService</span> {
  <span class="kw">public class</span> <span class="ty">AccountDto</span> {   <span class="cm">// inner class</span>
    <span class="kw">public</span> <span class="ty">Id</span>      id;
    <span class="kw">public</span> <span class="ty">String</span>  name;
    <span class="kw">public</span> <span class="ty">String</span>  type;
  }
  <span class="kw">public static</span> <span class="ty">AccountDto</span> <span class="fn">toDto</span>(<span class="ty">Account</span> a) {
    <span class="ty">AccountDto</span> dto = <span class="kw">new</span> <span class="ty">AccountDto</span>();
    dto.id = a.Id; dto.name = a.Name; dto.type = a.Type;
    <span class="kw">return</span> dto;
  }
}
<span class="cm">// Access from outside: AccountService.AccountDto d = new AccountService.AccountDto();</span></pre></div>
<div class="lesson-h2">Enums</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — Enum</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">public enum</span> <span class="ty">Status</span> { PENDING, ACTIVE, CLOSED, CANCELLED }
<span class="ty">Status</span> s = <span class="ty">Status</span>.ACTIVE;
s.name();    <span class="cm">// 'ACTIVE'</span>
s.ordinal(); <span class="cm">// 1</span>
<span class="ty">Status</span>.values(); <span class="cm">// [PENDING, ACTIVE, CLOSED, CANCELLED]</span></pre></div>`);

L('soqladvanced','Advanced SOQL & SOSL','medium',
`// Dynamic SOQL — build query strings at runtime
public static List<SObject> dynamicQuery(String objectName, List<String> fields, String whereClause) {
    String query = 'SELECT ' + String.join(fields, ', ')
                 + ' FROM '  + objectName;
    if (!String.isBlank(whereClause)) {
        query += ' WHERE ' + whereClause;
    }
    query += ' LIMIT 100';
    return Database.query(query);
}

// Dynamic SOQL — use carefully, bind vars prevent injection
String objName   = 'Contact';
List<String> flds = new List<String>{'Id', 'FirstName', 'LastName', 'Email'};
List<SObject> results = dynamicQuery(objName, flds, 'IsActive__c = true');
System.debug('Dynamic results: ' + results.size());

// Semi-joins and anti-joins
// Records WITH matching children (semi-join)
List<Account> withOpps = [SELECT Id, Name
                           FROM Account
                           WHERE Id IN (SELECT AccountId FROM Opportunity
                                        WHERE StageName = 'Closed Won')];

// Records WITHOUT matching children (anti-join)
List<Account> withoutContacts = [SELECT Id, Name
                                  FROM Account
                                  WHERE Id NOT IN (SELECT AccountId FROM Contact)];

System.debug('Accounts with Closed Won opps: '  + withOpps.size());
System.debug('Accounts without contacts: '       + withoutContacts.size());

// SOSL — Salesforce Object Search Language (full-text search)
List<List<SObject>> searchResults = [FIND 'Acme*'
                                      IN ALL FIELDS
                                      RETURNING Account(Id, Name),
                                               Contact(Id, FirstName, LastName),
                                               Opportunity(Id, Name, StageName)
                                      LIMIT 10];

List<Account>     foundAccounts = (List<Account>)     searchResults[0];
List<Contact>     foundContacts = (List<Contact>)     searchResults[1];
List<Opportunity> foundOpps     = (List<Opportunity>) searchResults[2];

System.debug('SOSL found ' + foundAccounts.size()  + ' accounts');
System.debug('SOSL found ' + foundContacts.size()  + ' contacts');
System.debug('SOSL found ' + foundOpps.size()      + ' opportunities');`,
`<div class="lesson-h2">Advanced SOQL & SOSL</div>
<p class="lesson-p">Beyond basic queries: dynamic SOQL builds queries at runtime, semi-joins/anti-joins filter by related records, and SOSL does full-text search across multiple objects simultaneously.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — SOSL</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm">// SOSL searches across multiple objects at once</span>
<span class="ty">List</span>&lt;<span class="ty">List</span>&lt;SObject&gt;&gt; r = [<span class="kw">FIND</span> <span class="st">'Acme*'</span>
  <span class="kw">IN ALL FIELDS</span>
  <span class="kw">RETURNING</span> <span class="ty">Account</span>(Id, Name), <span class="ty">Contact</span>(Id, LastName)];
<span class="ty">List</span>&lt;<span class="ty">Account</span>&gt; accts = (<span class="ty">List</span>&lt;<span class="ty">Account</span>&gt;) r[<span class="nm">0</span>];</pre></div>
<div class="lesson-h2">SOQL vs SOSL</div>
<table class="ref-table">
<tr><th>Feature</th><th>SOQL</th><th>SOSL</th></tr>
<tr><td>Searches</td><td>One object type</td><td>Multiple objects at once</td></tr>
<tr><td>Search type</td><td>Exact / wildcard</td><td>Full-text (indexed)</td></tr>
<tr><td>Returns</td><td>List&lt;SObject&gt;</td><td>List&lt;List&lt;SObject&gt;&gt;</td></tr>
<tr><td>Governor limit</td><td>100 queries / 50k rows</td><td>20 SOSL / 2000 rows</td></tr>
<tr><td>Best for</td><td>Precise filtering by fields</td><td>Search bars, global search</td></tr>
</table>`);

L('email','Sending Emails','medium',
`// Apex Email — SingleEmailMessage and MassEmailMessage

// Single email
Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
mail.setToAddresses(new List<String>{'user@example.com'});
mail.setCcAddresses(new List<String>{'manager@example.com'});
mail.setSubject('Account Created: ' + 'Acme Corp');
mail.setPlainTextBody('A new account has been created in Salesforce.');
mail.setHtmlBody('<h1>New Account</h1><p>Acme Corp has been created.</p>');
mail.setSenderDisplayName('Salesforce Notifications');
// mail.setReplyTo('noreply@yourcompany.com');

// Associate with a record (shows in activity history)
// mail.setWhatId(accountId);
// mail.setTargetObjectId(contactId);  // must be Contact/Lead/User

Messaging.SendEmailResult[] results = Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{mail});
for (Messaging.SendEmailResult r : results) {
    System.debug('Email sent: ' + r.isSuccess());
    if (!r.isSuccess()) {
        System.debug('Errors: ' + r.getErrors());
    }
}

// Email template-based (best practice for reusable emails)
public static void sendTemplateEmail(Id contactId, String templateName) {
    EmailTemplate template = [SELECT Id FROM EmailTemplate
                               WHERE DeveloperName = :templateName LIMIT 1];
    Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
    mail.setTargetObjectId(contactId);
    mail.setTemplateId(template.Id);
    mail.setSaveAsActivity(true);
    Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{mail});
}

// OrgWideEmailAddress — send from shared address
OrgWideEmailAddress[] owea = [SELECT Id FROM OrgWideEmailAddress
                               WHERE Address = 'noreply@myorg.com'];
if (!owea.isEmpty()) {
    mail.setOrgWideEmailAddressId(owea[0].Id);
}

System.debug('Email functionality demonstrated');`,
`<div class="lesson-h2">Sending Emails from Apex</div>
<p class="lesson-p">Apex can send emails programmatically using <code>Messaging.SingleEmailMessage</code>. For production, use email templates rather than hardcoded HTML — they're translatable, editable by admins, and testable.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — Send Email</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="ty">Messaging</span>.<span class="ty">SingleEmailMessage</span> m = <span class="kw">new</span> <span class="ty">Messaging</span>.<span class="ty">SingleEmailMessage</span>();
m.<span class="fn">setToAddresses</span>(<span class="kw">new</span> <span class="ty">List</span>&lt;<span class="ty">String</span>&gt;{<span class="st">'user@example.com'</span>});
m.<span class="fn">setSubject</span>(<span class="st">'Subject here'</span>);
m.<span class="fn">setHtmlBody</span>(<span class="st">'&lt;p&gt;Body&lt;/p&gt;'</span>);
<span class="ty">Messaging</span>.<span class="fn">sendEmail</span>(<span class="kw">new</span> <span class="ty">List</span>&lt;<span class="ty">Messaging</span>.<span class="ty">SingleEmailMessage</span>&gt;{m});</pre></div>
<div class="callout callout-info"><div class="callout-icon">ℹ️</div><div class="callout-body"><div class="callout-title">Email Governor Limits</div><div class="callout-text">Max 10 <code>sendEmail()</code> calls per transaction. Max 5,000 emails/day to external addresses. Set <code>setTargetObjectId</code> to a Contact, Lead, or User to log the email in activity history automatically.</div></div></div>`);

L('callouts','HTTP Callouts','medium',
`// HTTP Callouts — call external REST APIs from Apex
// Must add Remote Site or Named Credential in Setup first

public with sharing class WeatherService {

    // Named Credential approach (recommended — hides credentials)
    public static Map<String, Object> getWeather(String city) {
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:WeatherAPI/weather?q=' + EncodingUtil.urlEncode(city, 'UTF-8'));
        req.setMethod('GET');
        req.setHeader('Content-Type', 'application/json');
        req.setTimeout(10000);  // 10 second timeout

        HttpResponse res = http.send(req);

        if (res.getStatusCode() == 200) {
            return (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
        } else {
            throw new CalloutException('Weather API error: ' + res.getStatus() + ' ' + res.getBody());
        }
    }

    // POST request with JSON body
    public static String createExternalRecord(Map<String, Object> payload) {
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://api.example.com/records');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('Authorization', 'Bearer ' + getAccessToken());
        req.setBody(JSON.serialize(payload));
        req.setTimeout(20000);

        HttpResponse res = http.send(req);
        if (res.getStatusCode() == 201) {
            Map<String, Object> body = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            return (String) body.get('id');
        }
        throw new CalloutException('Create failed: ' + res.getStatusCode());
    }

    private static String getAccessToken() {
        // In real code: query Custom Setting or Named Credential
        return 'your-token-here';
    }
}

System.debug('HTTP callout class defined');
System.debug('Remember: callouts CANNOT be made from triggers (use @future or Queueable)');`,
`<div class="lesson-h2">HTTP Callouts</div>
<p class="lesson-p">Apex can call external REST and SOAP APIs using <code>Http</code>, <code>HttpRequest</code>, and <code>HttpResponse</code>. Always set up a <strong>Remote Site Setting</strong> or <strong>Named Credential</strong> first — callouts to unapproved endpoints are blocked.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — HTTP GET</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="ty">Http</span> http = <span class="kw">new</span> <span class="ty">Http</span>();
<span class="ty">HttpRequest</span> req = <span class="kw">new</span> <span class="ty">HttpRequest</span>();
req.<span class="fn">setEndpoint</span>(<span class="st">'callout:MyNamedCred/endpoint'</span>);
req.<span class="fn">setMethod</span>(<span class="st">'GET'</span>);
<span class="ty">HttpResponse</span> res = http.<span class="fn">send</span>(req);
<span class="kw">if</span> (res.<span class="fn">getStatusCode</span>() == <span class="nm">200</span>) {
    <span class="ty">Map</span>&lt;<span class="ty">String</span>, <span class="ty">Object</span>&gt; data =
        (<span class="ty">Map</span>&lt;<span class="ty">String</span>, <span class="ty">Object</span>&gt;) JSON.<span class="fn">deserializeUntyped</span>(res.<span class="fn">getBody</span>());
}</pre></div>
<div class="callout callout-warn"><div class="callout-icon">⚠️</div><div class="callout-body"><div class="callout-title">Callouts in Triggers</div><div class="callout-text">You cannot make synchronous callouts from triggers (or any code called synchronously by a DML operation). Use <code>@future(callout=true)</code> or a Queueable job instead — these run asynchronously after the DML commits.</div></div></div>`);

L('batch','Batch Apex','advanced',
`// Batch Apex — process millions of records in chunks
// Implements Database.Batchable<SObject>

global class AccountRatingBatch implements Database.Batchable<SObject>,
                                            Database.Stateful {  // preserves state between chunks

    // Counters (preserved by Database.Stateful)
    global Integer processed = 0;
    global Integer updated   = 0;
    global Integer errors    = 0;

    // Start: define the query (returns QueryLocator)
    global Database.QueryLocator start(Database.BatchableContext ctx) {
        System.debug('Batch ' + ctx.getJobId() + ' starting');
        return Database.getQueryLocator([
            SELECT Id, Name, AnnualRevenue, Rating
            FROM Account
            WHERE Type = 'Customer'
        ]);
    }

    // Execute: called with each chunk (default 200 records)
    global void execute(Database.BatchableContext ctx, List<Account> scope) {
        List<Account> toUpdate = new List<Account>();

        for (Account a : scope) {
            processed++;
            String newRating;
            if      (a.AnnualRevenue == null)        newRating = 'Cold';
            else if (a.AnnualRevenue >= 10000000)    newRating = 'Hot';
            else if (a.AnnualRevenue >= 1000000)     newRating = 'Warm';
            else                                     newRating = 'Cold';

            if (a.Rating != newRating) {
                a.Rating = newRating;
                toUpdate.add(a);
            }
        }

        if (!toUpdate.isEmpty()) {
            Database.SaveResult[] results = Database.update(toUpdate, false);
            for (Database.SaveResult sr : results) {
                if (sr.isSuccess()) updated++;
                else { errors++; System.debug('Error: ' + sr.getErrors()[0].getMessage()); }
            }
        }
    }

    // Finish: runs once after all chunks complete
    global void finish(Database.BatchableContext ctx) {
        AsyncApexJob job = [SELECT Id, Status, NumberOfErrors
                            FROM AsyncApexJob WHERE Id = :ctx.getJobId()];
        System.debug('Batch complete. Status: ' + job.Status);
        System.debug('Processed: ' + processed + ', Updated: ' + updated + ', Errors: ' + errors);

        // Send completion email
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setToAddresses(new List<String>{UserInfo.getUserEmail()});
        mail.setSubject('Batch Job Complete');
        mail.setPlainTextBody('Processed: ' + processed + ' Updated: ' + updated);
        Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{mail});
    }
}

// Execute the batch
// Database.executeBatch(new AccountRatingBatch(), 200);  // 200 = chunk size

System.debug('Batch class defined. Execute with: Database.executeBatch(new AccountRatingBatch(), 200)');`,
`<div class="lesson-h2">Batch Apex</div>
<p class="lesson-p">Batch Apex processes millions of records by splitting them into manageable chunks. Each chunk runs in its own transaction with fresh governor limits — making it possible to process data sets that would hit limits in a single transaction.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — Batch Structure</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">global class</span> <span class="ty">MyBatch</span> <span class="kw">implements</span> <span class="ty">Database</span>.<span class="ty">Batchable</span>&lt;SObject&gt; {
  <span class="kw">global</span> <span class="ty">Database</span>.<span class="ty">QueryLocator</span> <span class="fn">start</span>(<span class="ty">Database</span>.<span class="ty">BatchableContext</span> ctx) {
    <span class="kw">return</span> <span class="ty">Database</span>.<span class="fn">getQueryLocator</span>([<span class="kw">SELECT</span> Id <span class="kw">FROM</span> Account]);
  }
  <span class="kw">global void</span> <span class="fn">execute</span>(<span class="ty">Database</span>.<span class="ty">BatchableContext</span> ctx, <span class="ty">List</span>&lt;<span class="ty">Account</span>&gt; scope) {
    <span class="cm">// Process scope (up to 200 records)</span>
  }
  <span class="kw">global void</span> <span class="fn">finish</span>(<span class="ty">Database</span>.<span class="ty">BatchableContext</span> ctx) {
    <span class="cm">// Post-processing, notifications</span>
  }
}
<span class="ty">Database</span>.<span class="fn">executeBatch</span>(<span class="kw">new</span> <span class="ty">MyBatch</span>(), <span class="nm">200</span>);</pre></div>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">Chunk size tuning</div><div class="callout-text">Default chunk size is 200. Reduce to 50-100 if your execute() does complex SOQL or callouts. Only 5 batch jobs can run concurrently on a Salesforce org — consider Queueable for smaller data sets.</div></div></div>`);

L('queueable','Queueable & Future','advanced',
`// Future methods — simple async (fire and forget)
public class FutureExamples {

    @future
    public static void updateExternalSystem(List<Id> accountIds) {
        // Runs asynchronously after current transaction commits
        // Can do callouts, no governor limit sharing with parent
        List<Account> accounts = [SELECT Id, Name FROM Account WHERE Id IN :accountIds];
        for (Account a : accounts) {
            System.debug('Syncing: ' + a.Name);
            // Make callout here
        }
    }

    @future(callout=true)  // callout=true required for HTTP
    public static void callExternalAPI(String payload) {
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://api.example.com/sync');
        req.setMethod('POST');
        req.setBody(payload);
        HttpResponse res = http.send(req);
        System.debug('API response: ' + res.getStatusCode());
    }
}

// Queueable — more powerful than @future
// Supports non-primitive params, job chaining, monitoring
public class SyncQueueable implements Queueable, Database.AllowsCallouts {
    private List<Account> accounts;
    private Integer batchIndex;

    public SyncQueueable(List<Account> accounts, Integer batchIndex) {
        this.accounts   = accounts;
        this.batchIndex = batchIndex;
    }

    public void execute(QueueableContext ctx) {
        System.debug('Processing batch ' + batchIndex + ' of ' + accounts.size());

        // Do work
        for (Account a : accounts) {
            System.debug('Processing: ' + a.Name);
        }

        // Chain the next job (process next batch)
        List<Account> nextBatch = getNextBatch(batchIndex + 1);
        if (!nextBatch.isEmpty()) {
            System.enqueueJob(new SyncQueueable(nextBatch, batchIndex + 1));
        }
    }

    private List<Account> getNextBatch(Integer index) {
        return new List<Account>(); // simplified
    }
}

// Enqueue the job
// Id jobId = System.enqueueJob(new SyncQueueable(accounts, 0));
// System.debug('Job Id: ' + jobId);

System.debug('@future: use for simple async with primitive params');
System.debug('Queueable: use when you need complex params, chaining, or callouts');`,
`<div class="lesson-h2">Queueable & Future</div>
<p class="lesson-p">Asynchronous Apex runs after the current transaction commits, with separate governor limits. Use <code>@future</code> for simple fire-and-forget tasks, and <code>Queueable</code> when you need complex parameters, job chaining, or monitoring.</p>
<div class="lesson-h2">Async Apex Comparison</div>
<table class="ref-table">
<tr><th>Feature</th><th>@future</th><th>Queueable</th><th>Batch</th><th>Scheduled</th></tr>
<tr><td>Complex params</td><td>✗ primitives only</td><td>✓</td><td>✓</td><td>✗</td></tr>
<tr><td>Job chaining</td><td>✗</td><td>✓</td><td>✗</td><td>✗</td></tr>
<tr><td>Callouts</td><td>✓</td><td>✓</td><td>✓</td><td>✗</td></tr>
<tr><td>Monitor in UI</td><td>✗</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><td>Large data</td><td>✗</td><td>Limited</td><td>✓ millions</td><td>Via batch</td></tr>
<tr><td>When to use</td><td>Simple async</td><td>Chains/callouts</td><td>Mass data</td><td>Scheduled</td></tr>
</table>
<div class="callout callout-warn"><div class="callout-icon">⚠️</div><div class="callout-body"><div class="callout-title">@future limitations</div><div class="callout-text">Parameters must be primitive types or collections of primitives. You cannot pass sObjects — pass Ids instead and re-query. Max 50 <code>@future</code> calls per transaction, and they cannot be called from a Batch or Scheduled context.</div></div></div>`);

L('scheduled','Scheduled Apex','advanced',
`// Scheduled Apex — runs on a cron schedule
// Maximum 100 scheduled jobs per org

public class DailyCleanupJob implements Schedulable {

    public void execute(SchedulableContext ctx) {
        System.debug('Daily cleanup running at: ' + DateTime.now());

        // Typically kick off a batch job
        Database.executeBatch(new AccountRatingBatch(), 200);

        // Or do simple work directly
        deleteOldLogs();
    }

    private void deleteOldLogs() {
        DateTime cutoff = DateTime.now().addDays(-30);
        List<ApexLog> oldLogs = [SELECT Id FROM ApexLog WHERE LogLength > 0
                                  AND StartTime < :cutoff LIMIT 1000];
        if (!oldLogs.isEmpty()) delete oldLogs;
        System.debug('Deleted ' + oldLogs.size() + ' old logs');
    }
}

// Schedule programmatically
// Cron expression: Seconds Minutes Hours DayOfMonth Month DayOfWeek Year
public static void scheduleJob() {
    // Every day at 2:00 AM
    String cron = '0 0 2 * * ?';
    String jobName = 'Daily Account Cleanup';

    // Remove existing job if present
    for (CronTrigger ct : [SELECT Id FROM CronTrigger WHERE CronJobDetail.Name = :jobName]) {
        System.abortJob(ct.Id);
    }

    // Schedule the job
    String jobId = System.schedule(jobName, cron, new DailyCleanupJob());
    System.debug('Scheduled job Id: ' + jobId);
}

// Query scheduled jobs
List<CronTrigger> jobs = [SELECT Id, CronJobDetail.Name, NextFireTime, State
                           FROM CronTrigger
                           WHERE CronJobDetail.JobType = '7'  // 7 = Apex Scheduled
                           ORDER BY NextFireTime];
for (CronTrigger job : jobs) {
    System.debug(job.CronJobDetail.Name + ' → ' + job.NextFireTime + ' [' + job.State + ']');
}

// Common cron examples
System.debug('Every hour:        0 0 * * * ?');
System.debug('Every day at 6am:  0 0 6 * * ?');
System.debug('Every Monday 9am:  0 0 9 ? * MON');
System.debug('1st of month noon: 0 0 12 1 * ?');`,
`<div class="lesson-h2">Scheduled Apex</div>
<p class="lesson-p">Scheduled Apex implements <code>Schedulable</code> and runs on a cron-like schedule. It's most commonly used to kick off Batch jobs at off-peak hours.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — Schedule</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="kw">public class</span> <span class="ty">MyJob</span> <span class="kw">implements</span> <span class="ty">Schedulable</span> {
  <span class="kw">public void</span> <span class="fn">execute</span>(<span class="ty">SchedulableContext</span> ctx) {
    <span class="ty">Database</span>.<span class="fn">executeBatch</span>(<span class="kw">new</span> <span class="ty">MyBatch</span>(), <span class="nm">200</span>);
  }
}
<span class="cm">// Run every day at 3am</span>
System.<span class="fn">schedule</span>(<span class="st">'My Daily Job'</span>, <span class="st">'0 0 3 * * ?'</span>, <span class="kw">new</span> <span class="ty">MyJob</span>());</pre></div>
<div class="lesson-h2">Cron Expression Format</div>
<table class="ref-table">
<tr><th>Position</th><th>Field</th><th>Values</th></tr>
<tr><td>1</td><td>Seconds</td><td>0–59</td></tr>
<tr><td>2</td><td>Minutes</td><td>0–59</td></tr>
<tr><td>3</td><td>Hours</td><td>0–23</td></tr>
<tr><td>4</td><td>Day of month</td><td>1–31 or ?</td></tr>
<tr><td>5</td><td>Month</td><td>1–12 or JAN–DEC</td></tr>
<tr><td>6</td><td>Day of week</td><td>1–7 or SUN–SAT or ?</td></tr>
<tr><td>7</td><td>Year (optional)</td><td>1970–2099</td></tr>
</table>`);

L('testing','Apex Testing','advanced',
`// Apex requires 75%+ code coverage to deploy to production
// @isTest annotation marks test classes — excluded from code coverage metrics

@isTest
private class AccountServiceTest {

    // Test data setup — runs once before all test methods
    @TestSetup
    static void setup() {
        List<Account> accounts = new List<Account>{
            new Account(Name = 'Hot Corp',  AnnualRevenue = 5000000, Type = 'Customer'),
            new Account(Name = 'Warm Corp', AnnualRevenue = 500000,  Type = 'Customer'),
            new Account(Name = 'Cold Corp', AnnualRevenue = 0,       Type = 'Customer')
        };
        insert accounts;
    }

    @isTest
    static void testGetActiveAccounts_returnsCustomers() {
        // Arrange: data from @TestSetup

        // Act
        Test.startTest();  // resets governor limits
        List<Account> result = AccountService.getActiveAccounts();
        Test.stopTest();   // waits for async jobs

        // Assert
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assert(!result.isEmpty(), 'Should return at least one account');
    }

    @isTest
    static void testCalculateDiscount_defaultRate() {
        Decimal price = 100.00;
        Decimal expected = 90.00;

        Decimal result = AccountService.calculateDiscount(price);

        System.assertEquals(expected, result, 'Default 10% discount should return 90.00');
    }

    @isTest
    static void testCalculateDiscount_customRate() {
        System.assertEquals(75.00, AccountService.calculateDiscount(100.00, 0.25),
            '25% discount on 100 should be 75');
        System.assertEquals(50.00, AccountService.calculateDiscount(100.00, 0.50),
            '50% discount on 100 should be 50');
    }

    @isTest
    static void testCreateAccount_insertsRecord() {
        AccountService svc = new AccountService('Alice');
        Test.startTest();
        Account result = svc.createAccount('Test Corp', 'Prospect');
        Test.stopTest();

        System.assertNotEquals(null, result.Id, 'Inserted account should have an Id');
        Account queried = [SELECT Name, Type FROM Account WHERE Id = :result.Id];
        System.assertEquals('Test Corp', queried.Name);
        System.assertEquals('Prospect', queried.Type);
    }

    @isTest
    static void testGetRequired_throwsWhenNotFound() {
        try {
            AccountService.getRequired('This Account Does Not Exist XYZ');
            System.assert(false, 'Should have thrown an exception');
        } catch (AccountService.AccountServiceException e) {
            System.assert(e.getMessage().contains('not found'), 'Exception message should mention not found');
        }
    }
}`,
`<div class="lesson-h2">Apex Testing</div>
<p class="lesson-p">Salesforce requires at least <strong>75% test coverage</strong> to deploy. But coverage is a floor, not a goal — write tests that verify behaviour, not just touch lines. Use <code>System.assert</code>, <code>assertEquals</code>, and meaningful failure messages.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — Test Structure</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="de">@isTest</span>
<span class="kw">private class</span> <span class="ty">MyClassTest</span> {
  <span class="de">@TestSetup</span>
  <span class="kw">static void</span> <span class="fn">setup</span>() { <span class="cm">/* create test data — runs once */</span> }
  <span class="de">@isTest</span>
  <span class="kw">static void</span> <span class="fn">testHappyPath</span>() {
    Test.<span class="fn">startTest</span>();  <span class="cm">// fresh governor limits</span>
    <span class="cm">// ... call your code ...</span>
    Test.<span class="fn">stopTest</span>();   <span class="cm">// flush async jobs</span>
    System.<span class="fn">assertEquals</span>(expected, actual, <span class="st">'message'</span>);
  }
}</pre></div>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">Test.startTest() / stopTest()</div><div class="callout-text">These two calls are critical. <code>startTest()</code> resets all governor limits so your test code runs with a clean slate. <code>stopTest()</code> flushes all async operations (future, queueable, batch) synchronously — ensuring async code finishes before your assertions run.</div></div></div>`);

L('mocking','Mocks & Test Patterns','advanced',
`// Apex mocking — use interfaces + dependency injection

// The interface to mock
public interface IAccountRepository {
    List<Account> findByType(String type);
    Account findById(Id id);
    void save(Account a);
}

// Production implementation
public with sharing class AccountRepository implements IAccountRepository {
    public List<Account> findByType(String type) {
        return [SELECT Id, Name, AnnualRevenue FROM Account WHERE Type = :type];
    }
    public Account findById(Id id) {
        return [SELECT Id, Name FROM Account WHERE Id = :id];
    }
    public void save(Account a) { upsert a; }
}

// Service that takes the repo via constructor (dependency injection)
public with sharing class AccountService2 {
    private IAccountRepository repo;

    public AccountService2() { this.repo = new AccountRepository(); }
    public AccountService2(IAccountRepository repo) { this.repo = repo; }  // testable!

    public Integer countByType(String type) {
        return repo.findByType(type).size();
    }
}

// ── MOCK IMPLEMENTATION (in @isTest class) ──
@isTest
private class AccountService2Test {

    // Mock repo — no database access
    private class MockAccountRepository implements IAccountRepository {
        private List<Account> accounts;

        public MockAccountRepository(List<Account> accounts) {
            this.accounts = accounts;
        }
        public List<Account> findByType(String type) {
            List<Account> result = new List<Account>();
            for (Account a : accounts) if (a.Type == type) result.add(a);
            return result;
        }
        public Account findById(Id id) {
            for (Account a : accounts) if (a.Id == id) return a;
            return null;
        }
        public void save(Account a) { /* no-op in test */ }
    }

    @isTest
    static void testCountByType_usesMock() {
        List<Account> fakeAccounts = new List<Account>{
            new Account(Name = 'A', Type = 'Customer'),
            new Account(Name = 'B', Type = 'Customer'),
            new Account(Name = 'C', Type = 'Partner')
        };
        AccountService2 svc = new AccountService2(new MockAccountRepository(fakeAccounts));

        Integer customerCount = svc.countByType('Customer');
        System.assertEquals(2, customerCount, 'Should find 2 customers');

        Integer partnerCount = svc.countByType('Partner');
        System.assertEquals(1, partnerCount, 'Should find 1 partner');
    }
}`,
`<div class="lesson-h2">Mocking in Apex</div>
<p class="lesson-p">Apex doesn't have a built-in mocking framework like Java's Mockito, but you can use the <strong>interface + dependency injection</strong> pattern to swap production implementations with test doubles in unit tests.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — DI Pattern</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm">// Testable design: inject dependency via constructor</span>
<span class="kw">public class</span> <span class="ty">OrderService</span> {
  <span class="kw">private</span> <span class="ty">IEmailSender</span> emailer;
  <span class="kw">public</span> <span class="ty">OrderService</span>()                        { <span class="kw">this</span>.emailer = <span class="kw">new</span> <span class="ty">EmailSender</span>(); }
  <span class="kw">public</span> <span class="ty">OrderService</span>(<span class="ty">IEmailSender</span> emailer)   { <span class="kw">this</span>.emailer = emailer; }
}
<span class="cm">// In test: inject MockEmailSender — no real emails sent</span>
<span class="ty">OrderService</span> svc = <span class="kw">new</span> <span class="ty">OrderService</span>(<span class="kw">new</span> <span class="ty">MockEmailSender</span>());</pre></div>
<div class="lesson-h2">HTTP Callout Mocking</div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — HttpCalloutMock</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="de">@isTest</span>
<span class="kw">global class</span> <span class="ty">MockHttpResponse</span> <span class="kw">implements</span> <span class="ty">HttpCalloutMock</span> {
  <span class="kw">global</span> <span class="ty">HttpResponse</span> <span class="fn">respond</span>(<span class="ty">HttpRequest</span> req) {
    <span class="ty">HttpResponse</span> res = <span class="kw">new</span> <span class="ty">HttpResponse</span>();
    res.<span class="fn">setStatusCode</span>(<span class="nm">200</span>);
    res.<span class="fn">setBody</span>(<span class="st">'{"id":"abc123"}'</span>);
    <span class="kw">return</span> res;
  }
}
<span class="cm">// In test: Test.setMock(HttpCalloutMock.class, new MockHttpResponse());</span></pre></div>`);

L('security','Security & CRUD','advanced',
`// Apex security — FLS (Field Level Security) and CRUD checks

// ── CRUD CHECKS ──
public with sharing class SecureAccountService {

    public List<Account> getAccounts() {
        // Check READ access before querying
        if (!Schema.sObjectType.Account.isAccessible()) {
            throw new SecurityException('No read access to Account');
        }
        return [SELECT Id, Name, Type FROM Account LIMIT 100];
    }

    public Account createAccount(String name) {
        // Check CREATE access before DML
        if (!Schema.sObjectType.Account.isCreateable()) {
            throw new SecurityException('No create access to Account');
        }
        Account a = new Account(Name = name);
        insert a;
        return a;
    }

    // ── FIELD-LEVEL SECURITY (FLS) ──
    public static Map<String, Object> getAccountSafe(Id accountId) {
        Map<String, Object> result = new Map<String, Object>();

        // Check which fields are accessible
        Map<String, Schema.SObjectField> fields = Schema.SObjectType.Account.fields.getMap();
        List<String> accessibleFields = new List<String>();
        for (String fieldName : new List<String>{'Name', 'Type', 'AnnualRevenue', 'Phone'}) {
            if (fields.get(fieldName.toLowerCase()).getDescribe().isAccessible()) {
                accessibleFields.add(fieldName);
            }
        }

        // Build dynamic SOQL with only accessible fields
        String query = 'SELECT ' + String.join(accessibleFields, ', ')
                     + ' FROM Account WHERE Id = :accountId';
        Account acc = Database.query(query);
        for (String f : accessibleFields) result.put(f, acc.get(f));
        return result;
    }
}

// Security.stripInaccessible — modern approach (API 48.0+)
Account acc = new Account(Name = 'Test', Phone = '555-0000', AnnualRevenue = 999999);
SObjectAccessDecision decision = Security.stripInaccessible(AccessType.CREATABLE, new List<Account>{acc});
insert decision.getRecords();

System.debug('Security checks demonstrated');
System.debug('Always use "with sharing" and check CRUD/FLS for user-facing operations');`,
`<div class="lesson-h2">Security in Apex</div>
<p class="lesson-p">Apex runs with the permissions of the running user when you use <code>with sharing</code>, but field-level security (FLS) is <strong>not automatically enforced</strong> — you must check it explicitly, or use <code>Security.stripInaccessible()</code>.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — stripInaccessible (modern)</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm">// Strips fields the user can't access before DML</span>
<span class="ty">SObjectAccessDecision</span> decision =
    <span class="ty">Security</span>.<span class="fn">stripInaccessible</span>(<span class="ty">AccessType</span>.CREATABLE, records);
<span class="kw">insert</span> decision.<span class="fn">getRecords</span>();
<span class="cm">// Also available: READABLE, UPDATABLE, UPSERTABLE</span></pre></div>
<div class="lesson-h2">Security Checklist</div>
<ul class="lesson-ul">
  <li>Always use <code>with sharing</code> on classes exposed to users</li>
  <li>Use <code>Security.stripInaccessible()</code> before DML with user-provided data</li>
  <li>Check <code>isAccessible()</code> / <code>isCreateable()</code> / <code>isUpdateable()</code> for user-facing queries</li>
  <li>Always use bind variables in SOQL — never string concatenation</li>
  <li>Never hardcode credentials — use Named Credentials or Custom Settings</li>
  <li>Use <code>ESAPI</code> or <code>String.escapeSingleQuotes()</code> if you must build dynamic SOQL with user input</li>
</ul>`);

L('lwc','LWC & Apex Integration','advanced',
`// LWC (Lightning Web Components) + Apex integration

// ── SERVER-SIDE CONTROLLER ──
public with sharing class AccountController {

    // @AuraEnabled — exposes method to LWC/Aura
    // cacheable=true — allows client-side caching (GET-equivalent)
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts(String searchTerm, String type) {
        String likeTerm = '%' + (searchTerm ?? '') + '%';
        List<Account> results = [
            SELECT Id, Name, Type, AnnualRevenue, Phone, Rating
            FROM Account
            WHERE Name LIKE :likeTerm
            AND (Type = :type OR :type = null OR :type = '')
            ORDER BY Name ASC
            LIMIT 50
        ];
        return results;
    }

    // No cacheable for mutations
    @AuraEnabled
    public static Account createAccount(String name, String type, Decimal revenue) {
        if (String.isBlank(name)) {
            AuraHandledException e = new AuraHandledException('Name is required');
            e.setMessage('Name is required');
            throw e;
        }
        Account acc = new Account(Name = name, Type = type, AnnualRevenue = revenue);
        insert acc;
        return acc;
    }

    // Return wrapper class for complex data
    @AuraEnabled(cacheable=true)
    public static AccountSummary getAccountSummary(Id accountId) {
        Account acc = [SELECT Id, Name, Type, AnnualRevenue,
                       (SELECT Id FROM Contacts),
                       (SELECT Id FROM Opportunities WHERE StageName = 'Closed Won')
                       FROM Account WHERE Id = :accountId];
        return new AccountSummary(acc);
    }

    public class AccountSummary {
        @AuraEnabled public Id    id;
        @AuraEnabled public String name;
        @AuraEnabled public String type;
        @AuraEnabled public Decimal revenue;
        @AuraEnabled public Integer contactCount;
        @AuraEnabled public Integer wonOpportunities;

        public AccountSummary(Account a) {
            this.id             = a.Id;
            this.name           = a.Name;
            this.type           = a.Type;
            this.revenue        = a.AnnualRevenue;
            this.contactCount   = a.Contacts.size();
            this.wonOpportunities = a.Opportunities.size();
        }
    }
}

System.debug('@AuraEnabled methods are accessible from LWC using wire or imperative calls');`,
`<div class="lesson-h2">Apex for LWC</div>
<p class="lesson-p">LWC components call Apex methods annotated with <code>@AuraEnabled</code>. Use <code>cacheable=true</code> for read-only queries (enables <code>@wire</code>) and omit it for mutations (use imperative calls).</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — @AuraEnabled Controller</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="de">@AuraEnabled</span>(cacheable=<span class="kw">true</span>)
<span class="kw">public static</span> <span class="ty">List</span>&lt;<span class="ty">Account</span>&gt; <span class="fn">getAccounts</span>(<span class="ty">String</span> type) {
    <span class="kw">return</span> [<span class="kw">SELECT</span> Id, Name <span class="kw">FROM</span> Account <span class="kw">WHERE</span> Type = :type];
}</pre></div>
<div class="code-block"><div class="cb-header"><span class="cb-lang">JavaScript — LWC Wire</span><div class="cb-actions"><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm">// In LWC JS file</span>
<span class="kw">import</span> { wire } <span class="kw">from</span> <span class="st">'lwc'</span>;
<span class="kw">import</span> getAccounts <span class="kw">from</span> <span class="st">'@salesforce/apex/AccountController.getAccounts'</span>;
<span class="de">@wire</span>(getAccounts, { type: <span class="st">'$selectedType'</span> })
accounts;  <span class="cm">// { data, error } — auto-updates when selectedType changes</span>
<span class="cm">// Imperative (for mutations):</span>
<span class="kw">await</span> <span class="fn">createAccount</span>({ name: <span class="st">'Acme'</span>, type: <span class="st">'Customer'</span> });</pre></div>
<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-body"><div class="callout-title">@AuraEnabled on wrapper fields</div><div class="callout-text">When returning inner/wrapper classes from <code>@AuraEnabled</code> methods, every field you want accessible in LWC must also have the <code>@AuraEnabled</code> annotation. Fields without it are stripped from the serialized response.</div></div></div>`);

L('patterns','Enterprise Patterns','advanced',
`// Enterprise Apex design patterns

// ── 1. SERVICE LAYER ──
// Separates business logic from triggers and controllers
public with sharing class OpportunityService {
    private static IEmailService emailService = new EmailService();

    public static void onAfterClose(List<Opportunity> wonOpps) {
        List<Task> followUps = new List<Task>();
        Set<Id> ownerIds = new Set<Id>();

        for (Opportunity opp : wonOpps) {
            followUps.add(new Task(
                Subject     = 'Post-close follow-up: ' + opp.Name,
                WhatId      = opp.Id,
                OwnerId     = opp.OwnerId,
                ActivityDate = Date.today().addDays(7),
                Status      = 'Not Started',
                Priority    = 'High'
            ));
            ownerIds.add(opp.OwnerId);
        }

        if (!followUps.isEmpty()) insert followUps;
        emailService.notifyOwners(ownerIds, 'Congratulations — deal closed!');
    }
}

// ── 2. TRIGGER FRAMEWORK ──
// Prevents multiple triggers, centralises dispatch
public abstract class TriggerHandler {
    protected virtual void beforeInsert(List<SObject> newList) {}
    protected virtual void afterInsert(List<SObject> newList) {}
    protected virtual void beforeUpdate(List<SObject> newList, Map<Id,SObject> oldMap) {}
    protected virtual void afterUpdate(List<SObject> newList, Map<Id,SObject> oldMap) {}

    public void run() {
        if (Trigger.isBefore) {
            if (Trigger.isInsert) beforeInsert(Trigger.new);
            if (Trigger.isUpdate) beforeUpdate(Trigger.new, Trigger.oldMap);
        }
        if (Trigger.isAfter) {
            if (Trigger.isInsert) afterInsert(Trigger.new);
            if (Trigger.isUpdate) afterUpdate(Trigger.new, Trigger.oldMap);
        }
    }
}

// ── 3. SELECTOR LAYER ──
public with sharing class AccountSelector {
    public static List<Account> getByIds(Set<Id> ids) {
        return [SELECT Id, Name, Type, AnnualRevenue, OwnerId
                FROM Account WHERE Id IN :ids];
    }
    public static Map<Id, Account> getMapByIds(Set<Id> ids) {
        return new Map<Id, Account>(getByIds(ids));
    }
}

System.debug('Service Layer: business logic in service classes');
System.debug('Selector Layer: all SOQL in dedicated selector classes');
System.debug('Trigger Framework: one trigger → handler → service');`,
`<div class="lesson-h2">Enterprise Apex Patterns</div>
<p class="lesson-p">Large Salesforce orgs use layered architecture to keep code maintainable, testable, and free of governor limit issues.</p>
<div class="code-block"><div class="cb-header"><span class="cb-lang">Apex — Architecture Layers</span><div class="cb-actions"><button class="cb-btn" onclick="loadCode()">⊞ Editor</button><button class="cb-btn" onclick="copyBlock(this)">⎘ Copy</button></div></div>
<pre><span class="cm">// Trigger (thin — routing only)</span>
<span class="kw">trigger</span> <span class="ty">OpportunityTrigger</span> <span class="kw">on</span> <span class="ty">Opportunity</span> (after update) {
  <span class="kw">new</span> <span class="ty">OpportunityTriggerHandler</span>().<span class="fn">run</span>();
}
<span class="cm">// Handler (context routing)</span>
<span class="kw">class</span> <span class="ty">OpportunityTriggerHandler</span> <span class="kw">extends</span> <span class="ty">TriggerHandler</span> {
  <span class="kw">protected override void</span> <span class="fn">afterUpdate</span>(<span class="ty">List</span>&lt;SObject&gt; newList, <span class="ty">Map</span>&lt;<span class="ty">Id</span>,SObject&gt; oldMap) {
    <span class="ty">OpportunityService</span>.<span class="fn">onAfterClose</span>(getWonOpps(newList, oldMap));
  }
}
<span class="cm">// Service (business logic)</span>
<span class="cm">// Selector (SOQL)</span></pre></div>
<div class="lesson-h2">Key Libraries & Frameworks</div>
<table class="ref-table">
<tr><th>Framework</th><th>Purpose</th></tr>
<tr><td>FFLIB Apex Commons</td><td>Service/Selector/Domain/UOW pattern (Force.com)</td></tr>
<tr><td>Apex Trigger Framework</td><td>Standard trigger dispatch pattern</td></tr>
<tr><td>ApexMocks</td><td>Full mocking framework for Apex</td></tr>
<tr><td>LWC OSS</td><td>Open source LWC for development outside Salesforce</td></tr>
<tr><td>Salesforce DX (SFDX)</td><td>Modern CLI-based dev/deploy tooling</td></tr>
</table>`);

// ─────────────────────────────────────────
// SIMULATED OUTPUT
// ─────────────────────────────────────────
const SIM = {
  hello:       ['16:24:05 USER_DEBUG Hello, Apex!','16:24:05 USER_DEBUG Welcome to Salesforce development','16:24:05 USER_DEBUG Hello, World!','16:24:05 USER_DEBUG Count: 42','16:24:05 USER_DEBUG Active: true','16:24:05 USER_DEBUG Price: 99.99','16:24:05 USER_DEBUG Today: 2025-01-15','16:24:05 USER_DEBUG Now: 2025-01-15 16:24:05','16:24:05 USER_DEBUG SALESFORCE','16:24:05 USER_DEBUG 10','16:24:05 USER_DEBUG true'],
  variables:   ['16:24:06 USER_DEBUG Sales','16:24:06 USER_DEBUG SalesFORCE','16:24:06 USER_DEBUG true','16:24:06 USER_DEBUG true','16:24:06 USER_DEBUG 42','16:24:06 USER_DEBUG true','16:24:06 USER_DEBUG 124','16:24:06 USER_DEBUG 19.98'],
  collections: ['16:24:07 USER_DEBUG (Zara, Alice, Bob, Carol, Dave)','16:24:07 USER_DEBUG 5','16:24:07 USER_DEBUG Bob','16:24:07 USER_DEBUG Alice','16:24:07 USER_DEBUG {1, 2, 3}','16:24:07 USER_DEBUG true','16:24:07 USER_DEBUG 95','16:24:07 USER_DEBUG false','16:24:07 USER_DEBUG {Alice, Bob, Carol, Dave}','16:24:07 USER_DEBUG (95, 87, 92, 88)','16:24:07 USER_DEBUG Name: Alice','16:24:07 USER_DEBUG Name: Bob','16:24:07 USER_DEBUG Name: Carol','16:24:07 USER_DEBUG Name: Dave'],
  control:     ['16:24:08 USER_DEBUG Grade: B','16:24:08 USER_DEBUG Pass','16:24:08 USER_DEBUG i = 0','16:24:08 USER_DEBUG i = 1','16:24:08 USER_DEBUG i = 2','16:24:08 USER_DEBUG APPLE','16:24:08 USER_DEBUG BANANA','16:24:08 USER_DEBUG CHERRY','16:24:08 USER_DEBUG Weekday'],
  classes:     ['16:24:09 USER_DEBUG Discount: 90.00'],
  soql:        ['16:24:10 USER_DEBUG Acme Corp — 5000000','16:24:10 USER_DEBUG TechStart — 1200000','16:24:10 USER_DEBUG Alice @ Acme Corp','16:24:10 USER_DEBUG Acme Corp has 3 contacts','16:24:10 USER_DEBUG Customer: 42 avg: 2300000'],
  dml:         ['16:24:11 USER_DEBUG New Account Id: 0016g00000XXXXX','16:24:11 USER_DEBUG Inserted: 0036g00000YYYYY','16:24:11 USER_DEBUG Inserted: 0036g00000YYYZ1','16:24:11 USER_DEBUG Inserted: 0036g00000YYYZ2','16:24:11 USER_DEBUG Inserted: Good Account Id','16:24:11 USER_DEBUG Error: Required fields are missing: [Name]'],
  exceptions:  ['16:24:12 USER_DEBUG No record found: List has no rows for assignment to SObject','16:24:12 USER_DEBUG Always runs — cleanup here','16:24:12 USER_DEBUG DML failed on field: (Name)','16:24:12 USER_DEBUG Message: Required fields are missing: [Name]','16:24:12 USER_DEBUG Business error: Account not found: NonExistentCorp','16:24:12 USER_DEBUG Exception handling complete'],
  debug:       ['16:24:13 USER_DEBUG Simple message','16:24:13 USER_DEBUG|INFO|Info message','16:24:13 USER_DEBUG|WARN|Warning: something looks off','16:24:13 USER_DEBUG CPU Time used: 142 / 10000','16:24:13 USER_DEBUG SOQL queries: 0 / 100','16:24:13 USER_DEBUG DML statements: 0 / 150','16:24:13 USER_DEBUG Heap size: 8192 / 6291456','16:24:13 USER_DEBUG 2025-01-15 16:24:13 | Starting process','16:24:13 USER_DEBUG 2025-01-15 16:24:13 | Step 1 complete','16:24:13 USER_DEBUG 2025-01-15 16:24:13 | Done. Total log entries: 3'],
  schema:      ['16:24:14 USER_DEBUG Labelname: Account','16:24:14 USER_DEBUG API name: Account','16:24:14 USER_DEBUG Is createable: true','16:24:14 USER_DEBUG Field type: PICKLIST','16:24:14 USER_DEBUG Field label: Account Type','16:24:14 USER_DEBUG Prospect | Active: true','16:24:14 USER_DEBUG Customer | Active: true','16:24:14 USER_DEBUG Partner | Active: true','16:24:14 USER_DEBUG Schema inspection complete'],
  triggers:    ['16:24:15 USER_DEBUG [AccountTriggerHandler] Trigger.new has 3 records','16:24:15 USER_DEBUG [onBeforeInsert] Setting default rating for: Acme Corp','16:24:15 USER_DEBUG [onAfterInsert] Creating default contacts for 3 accounts'],
  governor:    ['16:24:16 USER_DEBUG ── Governor Limit Status ──','16:24:16 USER_DEBUG SOQL Queries:   1 / 100','16:24:16 USER_DEBUG SOQL Rows:      5 / 50000','16:24:16 USER_DEBUG DML Statements: 0 / 150','16:24:16 USER_DEBUG DML Rows:       0 / 10000','16:24:16 USER_DEBUG CPU Time (ms):  248 / 10000','16:24:16 USER_DEBUG Heap Size (b):  16384 / 6291456','16:24:16 USER_DEBUG Callouts:       0 / 100'],
  bulkify:     ['16:24:17 USER_DEBUG Updated 47 contacts','16:24:17 USER_DEBUG SOQL used: 1','16:24:17 USER_DEBUG DML used: 1'],
  interfaces:  ['16:24:18 USER_DEBUG Can process null revenue: false','16:24:18 USER_DEBUG [ReportService] starting at 2025-01-15 16:24:18','16:24:18 USER_DEBUG Generating report...'],
  inner:       ['16:24:19 USER_DEBUG HIGH','16:24:19 USER_DEBUG 2','16:24:19 USER_DEBUG LOW = 0','16:24:19 USER_DEBUG MEDIUM = 1','16:24:19 USER_DEBUG HIGH = 2','16:24:19 USER_DEBUG CRITICAL = 3','16:24:19 USER_DEBUG Acme'],
  soqladvanced:['16:24:20 USER_DEBUG Dynamic results: 12','16:24:20 USER_DEBUG Accounts with Closed Won opps: 8','16:24:20 USER_DEBUG Accounts without contacts: 23','16:24:20 USER_DEBUG SOSL found 4 accounts','16:24:20 USER_DEBUG SOSL found 7 contacts','16:24:20 USER_DEBUG SOSL found 2 opportunities'],
  email:       ['16:24:21 USER_DEBUG Email sent: true','16:24:21 USER_DEBUG Email functionality demonstrated'],
  callouts:    ['16:24:22 USER_DEBUG HTTP callout class defined','16:24:22 USER_DEBUG Remember: callouts CANNOT be made from triggers (use @future or Queueable)'],
  batch:       ['16:24:23 USER_DEBUG Batch class defined. Execute with: Database.executeBatch(new AccountRatingBatch(), 200)'],
  queueable:   ['16:24:24 USER_DEBUG @future: use for simple async with primitive params','16:24:24 USER_DEBUG Queueable: use when you need complex params, chaining, or callouts'],
  scheduled:   ['16:24:25 USER_DEBUG Daily Account Cleanup → 2025-01-16 02:00:00 [WAITING]','16:24:25 USER_DEBUG Every hour:        0 0 * * * ?','16:24:25 USER_DEBUG Every day at 6am:  0 0 6 * * ?','16:24:25 USER_DEBUG Every Monday 9am:  0 0 9 ? * MON','16:24:25 USER_DEBUG 1st of month noon: 0 0 12 1 * ?'],
  testing:     ['16:24:26 USER_DEBUG Test.startTest() called — limits reset','16:24:26 USER_DEBUG Test.stopTest() called — async flushed','','16:24:26 System.AssertException: null','16:24:26 CUMULATIVE_LIMIT_USAGE','16:24:26   Number of SOQL queries: 2 out of 100','16:24:26   Number of DML statements: 2 out of 150','16:24:26 ','16:24:26 Test run result: SUCCESS (5/5 passed, 94% coverage)'],
  mocking:     ['16:24:27 USER_DEBUG [MockAccountRepository] findByType(Customer) → 2 records','16:24:27 USER_DEBUG [MockAccountRepository] findByType(Partner) → 1 record','16:24:27 Test run result: SUCCESS (2/2 passed — no DML, no SOQL used)'],
  security:    ['16:24:28 USER_DEBUG Security checks demonstrated','16:24:28 USER_DEBUG Always use "with sharing" and check CRUD/FLS for user-facing operations'],
  lwc:         ['16:24:29 USER_DEBUG @AuraEnabled methods are accessible from LWC using wire or imperative calls'],
  patterns:    ['16:24:30 USER_DEBUG Service Layer: business logic in service classes','16:24:30 USER_DEBUG Selector Layer: all SOQL in dedicated selector classes','16:24:30 USER_DEBUG Trigger Framework: one trigger → handler → service'],
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
    value: `// Welcome to Mastering Salesforce Apex!
// Select a topic from the sidebar to load example code.

// Quick start — Apex in Execute Anonymous:
String greeting = 'Hello, Apex!';
System.debug(greeting);

// Query some records
List<Account> accounts = [SELECT Id, Name, Type
                           FROM Account
                           LIMIT 5];
for (Account a : accounts) {
    System.debug(a.Name + ' (' + a.Type + ')');
}
`,
    language: 'java',  // closest to Apex in Monaco
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
    document.getElementById('edFname').textContent = id.charAt(0).toUpperCase() + id.slice(1) + '.cls';
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
      <span class="l-tag" style="background:var(--bg3);border:1px solid var(--border);color:var(--text3);font-family:var(--mono);font-size:10px;">Apex · API 62.0</span>
    </div>
    <div class="lesson-divider"></div>
    <div>${lesson.content()}</div>
    <div class="lesson-nav">
      <button class="nav-btn primary" onclick="runCode()">▶ Execute Anonymous</button>
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
      <div class="callout callout-info"><div class="callout-icon">🏋</div><div class="callout-body"><div class="callout-title">Practice Problems</div><div class="callout-text">Write solutions in the editor. Test in a Salesforce Developer Org (free at developer.salesforce.com). Aim for fully bulkified, test-covered code.</div></div></div>
      <div class="lesson-h2">SOQL & Data</div>
      <ul class="lesson-ul">
        <li>Write a SOQL query that returns all Accounts with more than 3 related Contacts, ordered by Contact count descending</li>
        <li>Build a method that takes a Set of Account Ids and returns a <code>Map&lt;Id, List&lt;Opportunity&gt;&gt;</code> — keyed by AccountId</li>
        <li>Write a dynamic SOQL builder that accepts an sObject type, a list of field names, and a WHERE clause string</li>
        <li>Create a SOSL search method that searches Accounts and Contacts simultaneously and returns a combined result wrapper</li>
      </ul>
      <div class="lesson-h2">Triggers & DML</div>
      <ul class="lesson-ul">
        <li>Write a fully bulkified trigger on Opportunity that creates a follow-up Task when Stage changes to 'Closed Won'</li>
        <li>Build a trigger that prevents deletion of Account records with open Opportunities — add a field-level error</li>
        <li>Create a handler class using the abstract TriggerHandler framework pattern with proper before/after routing</li>
        <li>Implement an Account trigger that rolls up the count of related Contacts to a <code>ContactCount__c</code> field</li>
      </ul>
      <div class="lesson-h2">Async & Advanced</div>
      <ul class="lesson-ul">
        <li>Build a Batch class that finds all Contacts without an email and marks them <code>Invalid__c = true</code>, with a completion email</li>
        <li>Create a Queueable that chains itself to process a large list in chunks of 10, logging progress each iteration</li>
        <li>Write a test class for an HTTP callout service using <code>HttpCalloutMock</code>, testing both success (200) and error (500) responses</li>
        <li>Implement an <code>@AuraEnabled</code> method that takes a search term and returns a wrapper class with pagination info</li>
      </ul>
    </div>`;
  } else if (tab === 'reference') {
    pane.innerHTML = `<div class="fade-in" style="max-width:780px">
      <div class="lesson-title">Quick Reference</div>
      <div class="lesson-divider"></div>
      <div class="lesson-h2">Governor Limits (Synchronous)</div>
      <table class="ref-table">
        <tr><th>Resource</th><th>Limit</th></tr>
        <tr><td>SOQL queries</td><td>100</td></tr>
        <tr><td>SOQL rows returned</td><td>50,000</td></tr>
        <tr><td>DML statements</td><td>150</td></tr>
        <tr><td>DML records</td><td>10,000</td></tr>
        <tr><td>CPU time</td><td>10,000 ms</td></tr>
        <tr><td>Heap size</td><td>6 MB</td></tr>
        <tr><td>Callouts</td><td>100</td></tr>
        <tr><td>@future calls</td><td>50</td></tr>
        <tr><td>Queueable jobs enqueued</td><td>50</td></tr>
        <tr><td>Email (sendEmail)</td><td>10 calls/transaction</td></tr>
      </table>
      <div class="lesson-h2">DML Statements</div>
      <table class="ref-table">
        <tr><th>Statement</th><th>Notes</th></tr>
        <tr><td>insert</td><td>Creates records; populates Id field</td></tr>
        <tr><td>update</td><td>Updates existing records</td></tr>
        <tr><td>upsert</td><td>insert or update based on Id or external Id</td></tr>
        <tr><td>delete</td><td>Moves to Recycle Bin (soft delete)</td></tr>
        <tr><td>undelete</td><td>Restores from Recycle Bin (15-day window)</td></tr>
        <tr><td>merge</td><td>Merge 2–3 duplicate records</td></tr>
        <tr><td>Database.insert(list, false)</td><td>Allow partial success</td></tr>
      </table>
      <div class="lesson-h2">Trigger Context Variables</div>
      <table class="ref-table">
        <tr><th>Variable</th><th>Type</th><th>Available in</th></tr>
        <tr><td>Trigger.new</td><td>List&lt;SObject&gt;</td><td>before/after insert, before/after update</td></tr>
        <tr><td>Trigger.old</td><td>List&lt;SObject&gt;</td><td>before/after update, before/after delete</td></tr>
        <tr><td>Trigger.newMap</td><td>Map&lt;Id, SObject&gt;</td><td>before/after update, after insert</td></tr>
        <tr><td>Trigger.oldMap</td><td>Map&lt;Id, SObject&gt;</td><td>before/after update, before/after delete</td></tr>
        <tr><td>Trigger.isBefore/isAfter</td><td>Boolean</td><td>all</td></tr>
        <tr><td>Trigger.isInsert/isUpdate/isDelete</td><td>Boolean</td><td>all</td></tr>
        <tr><td>Trigger.isExecuting</td><td>Boolean</td><td>all — true in trigger context</td></tr>
        <tr><td>Trigger.size</td><td>Integer</td><td>all</td></tr>
      </table>
      <div class="lesson-h2">Common Apex Classes</div>
      <table class="ref-table">
        <tr><th>Class</th><th>Purpose</th></tr>
        <tr><td>System</td><td>debug(), assert(), currentPageReference()</td></tr>
        <tr><td>Limits</td><td>getQueries(), getCpuTime(), getHeapSize()</td></tr>
        <tr><td>Schema</td><td>getGlobalDescribe(), DescribeSObjectResult</td></tr>
        <tr><td>Database</td><td>insert/update with partial, query(), executeBatch()</td></tr>
        <tr><td>Test</td><td>startTest(), stopTest(), setMock(), isRunningTest()</td></tr>
        <tr><td>UserInfo</td><td>getUserId(), getUserEmail(), getOrganizationId()</td></tr>
        <tr><td>JSON</td><td>serialize(), deserialize(), deserializeUntyped()</td></tr>
        <tr><td>Date/DateTime</td><td>today(), now(), addDays(), format()</td></tr>
        <tr><td>String</td><td>isBlank(), valueOf(), format(), escapeSingleQuotes()</td></tr>
        <tr><td>Math</td><td>abs(), round(), floor(), ceil(), max(), min()</td></tr>
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
  navigator.clipboard.writeText(editor.getValue()).then(() => addOut('// Copied to clipboard', 'li'));
}
function resetCode() {
  if (!editor || !curTopic) return;
  const l = LESSONS[curTopic];
  if (l) { editor.setValue(l.code); curCode = l.code; }
  clearOutput();
}

// ─────────────────────────────────────────
// SIMULATED RUN (Execute Anonymous style)
// ─────────────────────────────────────────
async function runCode() {
  const ind = document.getElementById('outInd');
  const out = document.getElementById('outBody');
  ind.className = 'out-ind running';
  out.innerHTML = '<span class="li">Compiling Apex...</span>';
  await sleep(300);
  out.innerHTML = '<span class="li">Execute Anonymous: Success</span>\n\n';
  await sleep(180);
  ind.className = 'out-ind success';
  const lines = SIM[curTopic] || ['// (no simulated output for this topic)'];
  for (const line of lines) {
    out.innerHTML += escHtml(line) + '\n';
    await sleep(30);
  }
  out.innerHTML += `\n<span class="ls">// Execute Anonymous complete | Heap: ${Math.floor(Math.random()*50+10)}KB / 6MB | CPU: ${Math.floor(Math.random()*200+50)}ms / 10000ms</span>`;
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
  document.getElementById('outBody').innerHTML = '<span class="li">// Ready — click ▶ Execute Anonymous</span>';
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
  let sys = 'You are an expert Salesforce Apex developer and architect. Be practical and idiomatic. Use triple-backtick ```apex code blocks. Always write bulkified code, mention governor limits when relevant, and follow Salesforce best practices: with sharing, one trigger per object, service layer pattern, test coverage. Assume API version 62.0 (Spring \'25).';
  if (curTopic && LESSONS[curTopic]) {
    sys += ` The student is studying "${LESSONS[curTopic].title}".`;
    if (editor) { const code = editor.getValue(); if (code && code.length < 2000) sys += ` Their editor:\n\`\`\`apex\n${code}\n\`\`\``; }
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
  h = h.replace(/```(?:apex|java|javascript|js|bash|sh|soql|json)?\n?([\s\S]*?)```/g, (_, code) => `<pre>${code.trimEnd()}</pre>`);
  h = h.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  h = h.replace(/\n/g, '<br>');
  return h;
}
function now() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }