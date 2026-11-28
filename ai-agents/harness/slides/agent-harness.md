# AI Agent Harness

Turning an LLM into a useful, reliable and autonomous agent.

The LLM provides intelligence. The harness provides the infrastructure, tools, memory, execution environment and controls that make intelligence actionable.

---

## What Is an AI Agent Harness?

An AI Agent Harness is the runtime and control infrastructure surrounding a Large Language Model, enabling it to perform multi-step tasks using external tools and information.

> Think of the LLM as the brain and the harness as the body, nervous system, tools and operating environment. A brain can think, but an agent needs a system to act.

A traditional LLM interaction follows a simple request-response pattern. Real-world tasks are different. An agent may need to:

- Search the web and read files
- Execute code and query databases
- Remember earlier decisions
- Recover from errors
- Request human approval before taking important actions

The harness coordinates all of these activities.

---

## Architecture of an AI Agent Harness

A typical architecture separates the model from the runtime infrastructure and the external world.

```
USER / GOAL
     ↓
AI AGENT HARNESS
  ┌─────────────────────────────────────────┐
  │  Agent Loop  │  Tool Execution          │
  │  Memory      │  Safety & Policies       │
  │  Observability  │  Retries & Recovery   │
  └─────────────────────────────────────────┘
     ↓
LLM / MODEL  (GPT · Claude · Gemini · Llama · Qwen)
     ↓
EXTERNAL WORLD
  (APIs · Files · Databases · Browser · Terminal · Salesforce)
```

---

## The Agent Execution Loop

The most important responsibility of a harness is managing the continuous interaction between the model and its tools.

1. Receive user goal
2. Build context and call LLM
3. LLM selects next action
4. **Tool required?**
   - **Yes** → Execute tool → Observe result → Return result to LLM → Repeat
   - **No** → Validate and return final answer

> The harness must enforce a maximum number of iterations, execution timeouts and other stopping conditions. Otherwise, an agent can enter an endless loop.

---

## Core Components

| Component | Responsibility |
|---|---|
| **Agent Controller** | Coordinates model calls, actions, state transitions and completion conditions |
| **Tool Registry** | Defines available tools, their input schemas, permissions and output formats |
| **Tool Executor** | Executes API calls, browser actions, shell commands and database queries |
| **Context Manager** | Manages prompts, conversation history, token limits and relevant information |
| **Memory** | Stores task progress, previous results, user preferences and useful knowledge |
| **Planning** | Breaks complex goals into smaller tasks and tracks their completion |
| **Policy Engine** | Controls access, validates actions and requests approval for sensitive operations |
| **Observability** | Records model calls, tool executions, latency, errors, token usage and cost |
| **Recovery** | Handles retries, timeouts, failed tools, checkpoints and interrupted tasks |

---

## A Practical Example

**Goal:** Research five potential customers and prepare a Salesforce sales intelligence report.

1. **Planning** — Break the goal into research, validation and reporting tasks
2. **Web search** — Identify potential companies
3. **Research** — Collect company profiles and relevant business information
4. **Salesforce** — Query existing accounts to avoid duplicate prospects
5. **Analysis** — Rank prospects using defined business criteria
6. **Report** — Generate a structured report
7. **Approval** — Ask a human before creating or modifying Salesforce records

> The LLM determines what action might be useful. The harness validates, authorizes, executes and records that action.

---

## Safety, Security and Governance

Giving an AI agent access to tools also gives it the potential to affect real systems. The harness must establish firm boundaries.

| Principle | What it means |
|---|---|
| **Least Privilege** | Give agents only the permissions needed for their specific tasks |
| **Sandboxing** | Isolate code execution and file operations |
| **Human Approval** | Require approval for destructive or high-impact actions |
| **Input Validation** | Validate tool arguments; treat external content as untrusted data |
| **Audit Trails** | Record all actions, decisions, approvals and results |
| **Resource Limits** | Enforce token, time, cost and iteration limits |
| **Prompt Injection Defense** | Treat web pages, files and tool results as untrusted — sanitize before including in model context |

> A prompt saying "do not delete files" is not a security boundary. Permissions and execution controls must be enforced by the harness itself.

---

## LLM vs Agent vs Harness

| Concept | Responsibility | Example |
|---|---|---|
| **LLM** | Reasoning and language generation | Claude Opus 5.5 · GPT-4o · Gemini 2.5 Pro · Llama 3 |
| **Agent** | LLM operating with a goal, tools and an action loop | Research agent |
| **Harness** | Runtime, execution, memory, policies and control | Agent runtime |

### Model Independence

A well-designed harness works with multiple models through a common model adapter. The same agent architecture could use a local Qwen model via Ollama, a Candle-based model, or a cloud-hosted GPT or Claude model.

> The model may change. The tools, business rules, security policies and execution architecture can remain.

---

## Model Context Protocol (MCP)

MCP is an open standard from Anthropic that defines how a harness connects an LLM to external tools and data sources through a uniform client–server interface.

- **MCP Server** — Exposes tools, resources and prompts over a standard JSON-RPC transport (stdio, HTTP/SSE). Any application can become an MCP server
- **MCP Client** — The harness discovers available tools at runtime via `tools/list` and invokes them with `tools/call`
- **Resources & Prompts** — Servers expose file-like resources and prompt templates the harness can inject into model context
- **Ecosystem** — Ready-made MCP servers exist for GitHub, Slack, Google Workspace, browsers and databases — usable without custom integration code

> MCP decouples tool providers from harness implementations. Plug any MCP-compatible server into any MCP-aware harness, reducing integration work significantly.

---

## Building an AI Agent Harness in Rust

A lightweight, model-independent agent harness in Rust — the architecture:

```
Rust Agent Controller
        ↓
┌──────────────┬──────────────┬──────────────┬──────────────┐
│Model Adapter │Tool Registry │Memory Store  │Policy Engine │
│Candle/Ollama │Typed ifaces  │rsqlite/Vec DB│Permissions   │
└──────────────┴──────────────┴──────────────┴──────────────┘
        ↓
Execution Runtime — Tokio · Async · Tracing · Error Handling
```

```rust
trait Tool {
    fn name(&self) -> &str;
    async fn execute(
        &self,
        input: serde_json::Value,
    ) -> anyhow::Result<serde_json::Value>;
}

struct AgentHarness {
    model:  Box<dyn Model>,
    tools:  Vec<Box<dyn Tool>>,
    memory: MemoryStore,
    policy: PolicyEngine,
}
```

---

## Rust Technology Stack

| Area | Technology |
|---|---|
| Language | Rust |
| LLM inference | Hugging Face Candle |
| Local model serving | Ollama |
| Async runtime | Tokio |
| Persistent memory | rsqlite — pure-Rust embedded DB, no C bindings, full ACID + WAL |
| Serialization | Serde / JSON |
| Observability | Tracing |
| Tool integration | HTTP APIs / MCP |

**Why rsqlite for agent memory?**
Pure Rust — no C bindings, no unsafe code, no external dependencies. Full SQL pipeline: lexer → parser → typed AST → query engine. ACID transactions, WAL crash recovery, B-tree indexes, window functions, CTEs and upsert. Ships a built-in PostgreSQL wire-protocol server so any `psql` client can query agent memory directly.

> Keep the model adapter separate from the agent controller. This allows replacing the underlying model without redesigning the entire agent system.

---

## Where Is Agent Harness Engineering Heading?

As agents become more capable, the quality of their execution infrastructure becomes increasingly important.

- **Multi-Agent Systems** — Specialized agents collaborating on complex tasks, each with its own role and tool set
- **Long-Running Agents** — Persistent sessions, checkpoints and recovery across hours or days
- **Agent Evaluation** — Testing entire execution trajectories rather than just final answers
- **Human-Agent Collaboration** — Transparent approval workflows and decision-making that keeps humans in control

---

## Conclusion

An LLM is a powerful reasoning engine — but reasoning alone is not enough to accomplish real-world work.

The AI Agent Harness provides the execution loop, tools, memory, context, permissions, observability and recovery mechanisms that turn a model into a useful agent.

The most important architectural insight:

> The model and the harness should be treated as separate engineering layers.

**Build the harness well. The model can evolve.**
