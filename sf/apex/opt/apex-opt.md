# Engineering Proposal: Apex Runtime Metadata Access Optimization and Static Performance Analysis

## 1. Executive Summary

Salesforce Apex applications frequently access metadata, configuration, and other effectively immutable information multiple times within the same transaction.

For example, application code may repeatedly perform operations such as:

* Querying Custom Metadata Types.
* Querying Custom Settings.
* Reading configuration records.
* Resolving object/field metadata.
* Loading application configuration through shared framework classes.
* Reconstructing the same metadata/configuration object multiple times.

In many cases, the underlying information does not change during the lifetime of the transaction. Yet application code may repeatedly execute the same retrieval logic.

This proposal introduces an **Apex Runtime Metadata Optimization Engine**, complemented by a **static AST-based analyzer**, that identifies repeated metadata/configuration access and automatically avoids redundant work where Salesforce can prove that the result is safe to reuse.

The concept is similar in spirit to **compiler optimization and tree shaking**:

> If the runtime can determine that a value is immutable within a transaction and that repeated computation produces the same result, the runtime should eliminate redundant computation.

The proposal has two complementary layers:

1. **Compile-time / static analysis** — detect suspicious repeated metadata access patterns using an Apex AST.
2. **Runtime optimization** — transparently cache eligible metadata/configuration results within a transaction.

The goal is to improve Apex transaction performance without requiring developers to manually implement caching everywhere.

---

# 2. Problem Statement

A common Apex pattern looks like this:

```apex
public void process(Order__c order) {

    Config__mdt config = ConfigService.getConfig('ORDER');

    // Process order...

    Config__mdt config2 = ConfigService.getConfig('ORDER');

    // Process something else...

    Config__mdt config3 = ConfigService.getConfig('ORDER');

    // More processing...
}
```

If `ConfigService.getConfig('ORDER')` ultimately performs the same metadata lookup three times, the transaction may perform unnecessary work.

This becomes particularly problematic in large frameworks where:

* Triggers execute multiple times.
* The same record is saved repeatedly.
* Multiple handlers independently request the same configuration.
* Managed-package/framework code calls shared metadata utilities.
* Several layers of abstraction hide the fact that the same information is being retrieved repeatedly.

A simplified call graph might look like:

```text
Trigger
  |
  +-- Handler A
  |     |
  |     +-- ConfigService.getConfig()
  |
  +-- Handler B
  |     |
  |     +-- ConfigService.getConfig()
  |
  +-- Handler C
        |
        +-- ConfigService.getConfig()
```

The runtime may effectively perform:

```text
Metadata lookup
Metadata lookup
Metadata lookup
```

even though the desired value is identical.

---

# 3. Goals

The proposed system should:

### Primary goals

1. Detect repeated metadata/configuration access.
2. Identify calls whose results are safe to reuse within a transaction.
3. Reduce redundant database/metadata retrieval.
4. Reduce CPU consumption.
5. Reduce unnecessary SOQL execution where applicable.
6. Reduce repeated deserialization/configuration processing.
7. Provide developers with actionable diagnostics.
8. Preserve Apex behavioral semantics.
9. Require little or no application-code modification for runtime optimizations.

### Secondary goals

The analyzer should eventually identify broader redundant computation patterns beyond metadata.

For example:

```text
Repeated SOQL
Repeated describe calls
Repeated configuration resolution
Repeated serialization
Repeated parsing
Repeated pure computation
```

---

# 4. Non-Goals

The initial implementation should **not** attempt to optimize arbitrary Apex code.

In particular, the first version should avoid:

* General-purpose compiler optimization.
* Automatic modification of developer source code.
* Cross-transaction caching.
* Distributed caching.
* Caching mutable business data.
* Guessing whether arbitrary methods are side-effect free.

The initial scope should focus on:

> **Transaction-local, deterministic, effectively immutable metadata/configuration access.**

---

# 5. Key Concept

The fundamental optimization is:

```text
Repeated computation
        ↓
Can the runtime prove the result is stable?
        ↓
Yes
        ↓
Reuse transaction-local result
```

Conceptually:

```text
Before

Apex code
   |
   +--> metadata lookup
   |
   +--> metadata lookup
   |
   +--> metadata lookup
```

becomes:

```text
After

Apex code
   |
   +--> metadata lookup
   |
   +--> transaction cache
   |
   +--> transaction cache
```

The developer does not necessarily need to know that this optimization occurred.

---

# 6. Why AST Analysis Is Important

Apex source code can be represented as an Abstract Syntax Tree.

For example:

```apex
ConfigService.getConfig('ORDER');
ConfigService.getConfig('ORDER');
```

could conceptually become:

```text
CallExpression
 ├── Method: getConfig
 ├── Receiver: ConfigService
 └── Arguments
      └── Literal: "ORDER"
```

The analyzer can compare calls based on:

* Class
* Method
* Arguments
* Receiver
* Context
* Data dependencies

For example:

```text
ConfigService.getConfig("ORDER")
ConfigService.getConfig("ORDER")
```

can be recognized as structurally equivalent.

This enables a **redundant computation detector**.

---

# 7. Proposed Architecture

```text
                   Apex Source
                       |
                       v
                +--------------+
                | Apex Parser  |
                +--------------+
                       |
                       v
                 +-----------+
                 | Apex AST  |
                 +-----------+
                       |
             +---------+---------+
             |                   |
             v                   v
      Static Analyzer       Optimization
             |               Candidate
             v                   |
      Performance Rules          |
             |                   |
             +---------+---------+
                       |
                       v
               Optimization Model
                       |
          +------------+-------------+
          |                          |
          v                          v
   Developer Diagnostics       Apex Runtime
                               Optimization
```

---

# 8. Static Analyzer

The static analyzer would operate similarly to tools such as PMD, ESLint, or compiler optimization passes.

It would construct an AST and identify suspicious patterns.

Example:

```apex
public void execute() {

    MetadataService.getConfiguration();

    doSomething();

    MetadataService.getConfiguration();

    doSomethingElse();
}
```

The analyzer could report:

```text
APEX-PERF-001

Repeated metadata retrieval detected.

MetadataService.getConfiguration()
is invoked multiple times within the same execution path.

Recommendation:
Cache the result for the duration of the transaction.
```

---

# 9. AST Rule: Duplicate Metadata Access

The first rule could be:

### APEX-PERF-001 — Repeated Metadata Retrieval

Detect:

```apex
getConfig('ORDER');
getConfig('ORDER');
```

or:

```apex
Schema.getGlobalDescribe();
Schema.getGlobalDescribe();
```

or equivalent known metadata APIs.

The analyzer should produce:

```text
Severity: Warning

Repeated metadata access

Method:
ConfigService.getConfig(String)

Argument:
"ORDER"

Occurrences:
3

Estimated redundant calls:
2

Recommendation:
Reuse the first result within the transaction.
```

---

# 10. AST Rule: Equivalent Calls Through Different Variables

The analyzer should also recognize:

```apex
String type = 'ORDER';

getConfig(type);
getConfig(type);
```

and potentially:

```apex
String type = 'ORDER';

getConfig(type);

...

String type2 = 'ORDER';

getConfig(type2);
```

The analyzer can use constant propagation to determine that:

```text
type == type2 == "ORDER"
```

This moves the analyzer beyond simple text matching.

---

# 11. Control Flow Analysis

AST matching alone is insufficient.

Consider:

```apex
if (condition) {
    getConfig('ORDER');
}

if (condition) {
    getConfig('ORDER');
}
```

The analyzer needs some understanding of control flow.

A better architecture is:

```text
AST
 ↓
Control Flow Graph
 ↓
Data Flow Analysis
 ↓
Redundant Computation Analysis
```

This allows the analyzer to reason about:

* branches
* loops
* assignments
* variable mutations
* method calls
* execution paths

---

# 12. Loop Detection

A particularly valuable optimization target is repeated metadata access inside loops.

Example:

```apex
for (Order__c order : orders) {

    Config__mdt config =
        ConfigService.getConfig('ORDER');

    process(order, config);
}
```

If there are 1,000 records:

```text
Config lookup × 1,000
```

may occur.

The analyzer could identify:

```text
Metadata lookup is loop invariant.
```

and recommend:

```apex
Config__mdt config =
    ConfigService.getConfig('ORDER');

for (Order__c order : orders) {
    process(order, config);
}
```

This is much closer to a traditional compiler optimization:

> **Loop-invariant code motion**

---

# 13. Tree Shaking Analogy

The proposal is related to tree shaking, but technically the optimization is broader.

Tree shaking generally removes code that is unreachable or unused.

The proposed Apex optimization engine would perform several related transformations:

```text
Dead-code elimination
        +
Common-subexpression elimination
        +
Loop-invariant code motion
        +
Memoization
        +
Constant propagation
        +
Transaction-local caching
```

The most relevant compiler analogy is:

### Common Subexpression Elimination

For example:

```text
A = expensiveMetadataLookup(X)

B = expensiveMetadataLookup(X)
```

can become:

```text
A = expensiveMetadataLookup(X)

B = A
```

provided the runtime can prove that:

```text
lookup(X)
```

is deterministic and side-effect free for the relevant scope.

---

# 14. Runtime Transaction Cache

Static analysis can identify candidates, but the strongest optimization would happen inside the Apex runtime.

Conceptually:

```text
Transaction
│
├── Request metadata A
│       │
│       └── Cache miss
│             ↓
│         Retrieve
│             ↓
│         Cache result
│
├── Request metadata A
│       │
│       └── Cache hit
│
└── Request metadata A
        │
        └── Cache hit
```

The cache would live only for the transaction.

Therefore:

```text
Transaction 1
   Metadata A → cache

Transaction ends
   cache discarded

Transaction 2
   Metadata A → new transaction cache
```

This avoids many correctness concerns associated with persistent caching.

---

# 15. Cache Key

A transaction cache key could conceptually contain:

```text
Namespace
+
Metadata operation
+
Object/type
+
Arguments
+
Relevant API version
```

For example:

```text
salesforce
|
+-- CustomMetadata
    |
    +-- Config__mdt
    |
    +-- ORDER
```

becomes a deterministic cache key.

---

# 16. Eligibility Model

The runtime should not cache every method.

Each operation should have an optimization classification.

### Tier 1 — Safe

Known immutable metadata operations.

Examples:

```text
Custom Metadata
Object metadata
Field metadata
Describe information
Platform metadata definitions
```

These are strong candidates.

### Tier 2 — Conditionally safe

Operations where Salesforce can prove transaction-level stability.

Examples:

```text
Configuration services
Framework metadata providers
Cached platform services
```

### Tier 3 — Unsafe

Potentially mutable application data.

Examples:

```text
SELECT Id, Status__c FROM Order__c
```

These should not automatically be cached merely because the same query was executed twice.

---

# 17. Metadata Purity Contract

A useful platform concept would be a metadata purity classification.

For example:

```text
@TransactionImmutable
public class MetadataProvider {
}
```

or at the platform level:

```text
Method classification:

PURE
TRANSACTION_STABLE
MUTABLE
UNKNOWN
```

Conceptually:

```text
PURE
  |
  +-- Same inputs
  +-- Same result
  +-- No side effects

TRANSACTION_STABLE
  |
  +-- Result stable within transaction
  +-- May depend on transaction context

MUTABLE
  |
  +-- Result can change

UNKNOWN
  |
  +-- Do not optimize
```

The runtime would only automatically memoize:

```text
PURE
TRANSACTION_STABLE
```

operations.

---

# 18. Developer Diagnostics

The platform could expose optimization information through debug logs.

For example:

```text
APEX PERFORMANCE OPTIMIZER

Optimization candidate:
ConfigService.getConfig("ORDER")

Calls detected:       8
Calls eliminated:     7

Estimated CPU saved:  14 ms
Estimated query saved: 7
Cache hit ratio:      87.5%
```

This would be extremely valuable for developers.

---

# 19. Execution Trace

A developer could enable an optimization trace:

```text
Transaction Optimization Trace

14:02:31.001
Metadata lookup:
  Config__mdt / ORDER
  CACHE MISS

14:02:31.003
Metadata lookup:
  Config__mdt / ORDER
  CACHE HIT

14:02:31.003
Metadata lookup:
  Config__mdt / ORDER
  CACHE HIT

14:02:31.004
Metadata lookup:
  Config__mdt / ORDER
  CACHE HIT
```

This makes the optimization observable rather than mysterious.

---

# 20. Governor Limit Implications

This optimization could have significant governor-limit benefits.

For example:

```text
Current

100 metadata requests
100 SOQL queries
CPU = 950 ms
```

After optimization:

```text
1 metadata request
1 SOQL query
CPU = 300 ms
```

However, the platform should be careful about whether cached operations count toward governor limits.

There should be a clear distinction between:

```text
Physical operation
```

and:

```text
Logical Apex operation
```

The optimization should ideally prevent the physical work entirely.

---

# 21. Example: Trigger Framework

Consider:

```apex
trigger OrderTrigger on Order__c
    before update {

    TriggerHandler.execute();
}
```

The framework might contain:

```text
TriggerHandler
   |
   +-- ConfigurationManager
   |
   +-- ValidationManager
   |
   +-- PricingManager
   |
   +-- FulfillmentManager
```

Each component independently calls:

```apex
ConfigurationManager.getConfig();
```

Today:

```text
ValidationManager → lookup
PricingManager     → lookup
FulfillmentManager → lookup
```

With transaction-local memoization:

```text
ValidationManager → lookup → cache
PricingManager    → cache
FulfillmentManager → cache
```

This is particularly valuable for shared enterprise frameworks.

---

# 22. Example: Recursive / Repeated Trigger Processing

A more interesting case is repeated DML:

```apex
update order;

...

update order;

...

update order;
```

Each framework invocation may independently load the same configuration.

The runtime can maintain:

```text
Transaction
   |
   +-- Configuration cache
   |
   +-- Describe cache
   |
   +-- Metadata cache
```

Therefore repeated framework execution does not necessarily mean repeated metadata retrieval.

---

# 23. Static Analyzer Rules

The initial analyzer could contain rules such as:

| Rule          | Description                             |
| ------------- | --------------------------------------- |
| APEX-PERF-001 | Repeated metadata retrieval             |
| APEX-PERF-002 | Metadata lookup inside loop             |
| APEX-PERF-003 | Repeated describe call                  |
| APEX-PERF-004 | Repeated configuration lookup           |
| APEX-PERF-005 | Repeated SOQL with identical predicates |
| APEX-PERF-006 | Repeated serialization                  |
| APEX-PERF-007 | Repeated expensive computation          |
| APEX-PERF-008 | Loop-invariant computation              |
| APEX-PERF-009 | Redundant object construction           |
| APEX-PERF-010 | Repeated framework initialization       |

---

# 24. Confidence Levels

The analyzer should avoid noisy recommendations.

Each finding should have a confidence score.

```text
HIGH

Known immutable metadata API.
Same arguments.
Same transaction scope.

MEDIUM

Known configuration provider.
Likely transaction stable.

LOW

Custom method.
Purity cannot be proven.
```

Example:

```text
APEX-PERF-001

Repeated metadata access

Confidence: HIGH
Occurrences: 5
Potential redundant calls: 4
```

This makes the tool much more useful in large codebases.

---

# 25. Automatic Optimization Levels

The runtime could eventually provide optimization modes.

### Level 0

No optimization.

```text
Normal Apex execution
```

### Level 1

Safe platform metadata caching.

```text
Describe
Custom Metadata
Known immutable metadata
```

### Level 2

Compiler/static-analysis guided optimization.

```text
Common subexpression elimination
Loop invariant detection
```

### Level 3

Aggressive optimization.

Only after the platform has enough semantic information to prove safety.

---

# 26. Developer Experience

The developer should see something similar to:

```text
┌─────────────────────────────────────────────┐
│ Apex Performance Analyzer                   │
├─────────────────────────────────────────────┤
│                                             │
│ ⚠ APEX-PERF-001                             │
│                                             │
│ Repeated metadata retrieval                 │
│                                             │
│ ConfigService.getConfig("ORDER")            │
│                                             │
│ Occurrences: 8                              │
│ Redundant calls: 7                          │
│                                             │
│ Estimated CPU impact: HIGH                  │
│ Confidence: HIGH                            │
│                                             │
│ Recommendation                              │
│ Cache the configuration for the transaction │
│ or allow Apex Runtime optimization.         │
│                                             │
└─────────────────────────────────────────────┘
```

---

# 27. IDE Integration

This could integrate directly into:

* VS Code
* Salesforce Code Analyzer
* Salesforce CLI
* CI/CD pipelines
* Developer Console
* Deployment validation

For example:

```bash
sf apex performance scan
```

Output:

```text
Apex Performance Scan

Files scanned:       2,143
Methods scanned:     18,927

Findings:
  High:      12
  Medium:    37
  Low:       91

Potential redundant metadata calls:
  347

Potential CPU savings:
  High
```

---

# 28. CI/CD Integration

Performance rules could become deployment quality gates.

Example:

```text
Performance Quality Gate

FAIL

APEX-PERF-002
Metadata lookup inside loop

File:
OrderProcessor.cls

Estimated amplification:
1 → N

N = number of records processed
```

This is especially valuable because performance problems can otherwise remain hidden until production.

---

# 29. Important Correctness Considerations

The most important challenge is **semantic correctness**.

The runtime must never transform:

```apex
A();
A();
```

into:

```apex
A();
reuse(A);
```

unless it can prove that the two calls are equivalent.

Potential issues include:

### Side effects

```apex
incrementCounter();
```

must not be memoized.

### Mutable data

```apex
SELECT ...
```

may observe changes.

### User context

Some operations may depend on:

```text
User
Permission
Sharing
Locale
Currency
Session
Transaction state
```

The cache key and eligibility model must account for these.

---

# 30. Security Considerations

Caching must respect Salesforce security semantics.

The optimization must not allow:

```text
User A's metadata/result
        ↓
User B
```

to be accidentally reused.

Transaction-local scope substantially reduces this risk.

The runtime should also ensure that security-sensitive context is part of the optimization boundary where necessary.

---

# 31. Metrics

The platform should measure:

```text
Metadata requests
Metadata cache hits
Metadata cache misses
Redundant computations eliminated
CPU saved
SOQL saved
Heap impact
Cache memory
```

Example:

```text
Transaction Performance

Metadata operations:        47
Cache hits:                 31
Cache misses:               16
Redundant work eliminated:  31

Estimated CPU saved:        82 ms
```

Aggregated telemetry could identify the most expensive framework patterns.

---

# 32. Adaptive Optimization

A more advanced implementation could use runtime profiling.

Suppose Salesforce observes:

```text
ConfigService.getConfig("ORDER")
```

being invoked thousands of times across transactions with identical semantics.

The platform could identify it as a strong optimization candidate.

Conceptually:

```text
Production telemetry
       ↓
Pattern detection
       ↓
Optimization candidate
       ↓
Platform optimization rules
```

This could eventually become an **adaptive Apex runtime optimizer**.

---

# 33. Relationship to JIT Compilation

The proposal aligns naturally with a modern Apex execution architecture.

Conceptually:

```text
Apex Source
     ↓
Parser
     ↓
AST
     ↓
Semantic Analysis
     ↓
Optimization
     ↓
Intermediate Representation
     ↓
Runtime / JIT
     ↓
Execution
```

Optimization passes could include:

```text
Constant folding
Dead code elimination
Common subexpression elimination
Loop invariant code motion
Inlining
Memoization
Metadata access elimination
```

The metadata optimization proposal could therefore be the beginning of a broader **Apex compiler optimization framework**.

---

# 34. Proposed MVP

The first version should be intentionally narrow.

### Phase 1 — Static Analyzer

Implement:

```text
Apex AST
+
Control Flow Graph
+
Known metadata API catalog
```

Detect:

```text
Repeated describe calls
Repeated Custom Metadata access
Repeated configuration retrieval
Metadata access inside loops
```

No runtime modification initially.

---

### Phase 2 — Runtime Metadata Cache

Implement transaction-local caching for a carefully selected set of platform operations.

For example:

```text
Schema describe
Custom Metadata
Known immutable metadata
```

Measure:

```text
CPU
heap
latency
cache hit rate
```

---

### Phase 3 — Compiler-Assisted Optimization

Use AST/data-flow information to identify:

```text
Common subexpressions
Loop invariant operations
Deterministic configuration calls
```

Feed those optimization hints into the Apex runtime.

---

### Phase 4 — Adaptive Optimization

Use aggregate runtime telemetry to identify:

```text
High-frequency redundant operations
High-cost metadata providers
Framework hotspots
```

Then continuously improve optimization rules.

---

# 35. Success Criteria

The project should be considered successful if it demonstrates measurable reductions in:

```text
CPU time
SOQL usage
Metadata retrieval
Transaction latency
Heap allocation
```

without changing application behavior.

A representative target could be:

```text
20–50% reduction in repeated metadata/configuration work
in transactions exhibiting the targeted patterns.
```

The exact target should be established through benchmark workloads rather than assumed.

---

# 36. Benchmark Strategy

Create representative Apex workloads:

### Benchmark A — Repeated metadata

```text
100 repeated metadata lookups
```

### Benchmark B — Trigger framework

```text
Multiple handlers
Repeated configuration resolution
```

### Benchmark C — Loop

```text
200 records
Metadata lookup per record
```

### Benchmark D — Recursive processing

```text
Multiple DML operations
Repeated framework initialization
```

Measure:

```text
Baseline CPU
Optimized CPU

Baseline SOQL
Optimized SOQL

Baseline heap
Optimized heap

Baseline latency
Optimized latency
```

---

# 37. Long-Term Vision

The long-term goal is not simply:

> "Cache metadata."

It is:

> **Make Apex execution aware of redundant computation and eliminate work that cannot affect the result.**

The architecture could evolve into:

```text
                 Apex Source
                      |
                      v
                Apex Compiler
                      |
             +--------+--------+
             |                 |
             v                 v
           AST            Semantic Model
             |                 |
             +--------+--------+
                      |
                      v
               Optimization IR
                      |
       +--------------+--------------+
       |              |              |
       v              v              v
    Dead Code     CSE / Memoize   Loop Invariant
    Elimination   Metadata        Code Motion
                      |
                      v
                 Apex Runtime
                      |
                      v
             Transaction Execution
```

This would allow Salesforce to progressively make Apex applications faster **without requiring every developer to become a performance expert**.

---

# 38. Recommendation

I recommend pursuing this as a **two-part initiative**:

### 1. Apex Performance Analyzer

A static AST/data-flow analyzer that identifies:

```text
Repeated metadata access
Metadata inside loops
Repeated configuration retrieval
Repeated describe operations
Other redundant computation
```

### 2. Apex Runtime Optimization Layer

A transaction-scoped optimizer that transparently memoizes operations that Salesforce can prove are:

```text
Immutable
Deterministic
Side-effect free
Transaction safe
```

The combination is significantly more powerful than either approach independently.

The analyzer tells developers:

> **"You are doing unnecessary work."**

The runtime optimizer can eventually make the answer:

> **"Don't worry — Salesforce already eliminated it."**

---

# 39. Proposed Project Name

A few possible names:

* **Apex Optimizer**
* **Apex Performance Engine**
* **Apex Smart Runtime**
* **Apex Optimization Framework**
* **Apex Runtime Optimizer (ARO)**
* **Apex Performance Intelligence (API)**
* **Apex Compiler Optimization Engine**

My preference would be:

## **Apex Runtime Optimization Engine (AROE)**

with the static analyzer branded separately as:

## **Apex Performance Analyzer (APA)**

Together:

```text
Apex Performance Analyzer
          +
Apex Runtime Optimization Engine
          =
Intelligent Apex Execution
```

This provides a natural path from **static detection → developer guidance → compiler optimization → transparent runtime optimization**.
