# Model Context Protocol (MCP)
### Technical White Paper — Slide Deck

> An open protocol that standardizes how AI applications connect to external data sources, tools, and services — eliminating the M×N integration problem once and for all.

**Released:** Nov 25, 2024 · **Author:** Anthropic · **License:** Open Standard · **Transport:** stdio / SSE / HTTP · **Base Protocol:** JSON-RPC 2.0

---

## Slide 1 — What Is MCP?

**The Model Context Protocol (MCP)** is an open standard published by Anthropic in November 2024.

It defines a **universal interface** for connecting AI assistants to systems where data lives:

- Content repositories
- Business tools & APIs
- Databases
- Development environments

> Before MCP, every AI integration required a custom, point-to-point connection. An AI connecting to 10 data sources required 10 separate integrations, each with bespoke auth, data-formatting, and error-handling logic.

---

## Slide 2 — The Core Problem: M×N Integrations

```
Without MCP:   M models × N data sources = M×N custom integrations

With MCP:      Each side implements the standard once → M + N
```

**Analogy:** MCP is to AI integrations what **USB-C** is to device peripherals — one universal connector standard that eliminates incompatible, proprietary adapters.

| Metric | Value |
|--------|-------|
| Open-sourced | Nov 2024 |
| Community MCP servers | 1,000+ |
| Core primitives | 3 |
| Protocol foundation | JSON-RPC 2.0 |

---

## Slide 3 — Industry Adoption

By early 2025, MCP had been adopted by:

- **OpenAI**
- **Google DeepMind**
- **Microsoft**
- **Replit, Sourcegraph, Zed, Cursor, Windsurf**

Making it a **genuine cross-industry standard**, not just an Anthropic protocol.

**Official SDKs:** TypeScript/Node.js (`@modelcontextprotocol/sdk`) and Python (`mcp`), with community SDKs for Go, Rust, Java, and C#.

---

## Slide 4 — Architecture Overview

MCP follows a **client-server architecture** mediated by a host application.

```
HOST APPLICATION (e.g., Claude Desktop)
        │
        ├── MCP Client Instance A ──→ File System Server
        ├── MCP Client Instance B ──→ GitHub Server
        └── MCP Client Instance C ──→ PostgreSQL Server
                    │
              JSON-RPC 2.0
           stdio / SSE / HTTP
```

**The three roles:**

- **Host** — The AI application that orchestrates clients and controls LLM access. Enforces permissions and security boundaries.
- **Client** — A protocol layer inside the host maintaining exactly one stateful connection to one MCP server.
- **Server** — A lightweight process (local or remote HTTP) that exposes tools, resources, and prompts.

---

## Slide 5 — Connection Lifecycle

```
1. Host spawns client
2. Client connects via transport
3. Mutual capability negotiation (initialize / initialized)
4. Client discovers tools / resources / prompts
5. LLM invokes tools during inference
6. Client forwards, streams responses back
7. Graceful shutdown
```

---

## Slide 6 — Core Primitives (1 of 2)

MCP defines **six core primitives** covering every possible way an AI might interact with external systems.

| Primitive | Controlled By | Purpose |
|-----------|---------------|---------|
| **Tools** | Model | Executable actions — functions the LLM calls with JSON Schema parameters |
| **Resources** | App | Structured data sources (files, DB records, API responses) — read-only, like GET endpoints |
| **Prompts** | User | Pre-defined reusable prompt templates exposed by servers; accept arguments |

---

## Slide 7 — Core Primitives (2 of 2)

| Primitive | Direction | Purpose |
|-----------|-----------|---------|
| **Sampling** | Server → Client | Servers request LLM completions — enables nested agentic patterns; host retains control |
| **Notifications** | Bidirectional | Async progress events and cancellation signals; keeps UIs responsive |
| **Roots** | Client → Server | Filesystem paths/URIs defining authorized scope — principled permission boundary |

---

## Slide 8 — Transport Layer

MCP separates protocol from transport. All messages are **JSON-RPC 2.0** over one of these transports:

| Transport | Use Case | Status |
|-----------|----------|--------|
| **stdio** | Local servers spawned as subprocess. Gold standard for IDE integrations and desktop apps. | Stable |
| **HTTP + SSE** | Remote servers. Server pushes via SSE; client sends via POST. Good for shared/multi-client deployments. | Stable |
| **Streamable HTTP** | Simplified HTTP replacing SSE. Single POST endpoint with streaming response. Better for serverless/HTTP2. | 2025 Spec |
| **WebSockets** | Community extension for persistent bidirectional connections; high-frequency tool calls. | Community |

---

## Slide 9 — JSON-RPC Message Example

```json
{
  "jsonrpc": "2.0",
  "id": 42,
  "method": "tools/call",
  "params": {
    "name": "search_documents",
    "arguments": {
      "query": "Q3 revenue report",
      "limit": 5
    }
  }
}
```

---

## Slide 10 — Node.js SDK: Getting Started

```bash
npm install @modelcontextprotocol/sdk zod @anthropic-ai/sdk
# for HTTP server:
npm install express
# run TypeScript directly:
npm install -D ts-node typescript @types/node
```

**Four key server patterns:**

1. File System Server (stdio)
2. PostgreSQL Database Server (stdio)
3. Remote HTTP + SSE Server
4. Programmatic Client + Claude Agentic Loop

---

## Slide 11 — Node.js: File System Server Pattern

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "filesystem-server", version: "1.0.0" });

server.tool(
  "read_file",
  "Read the full contents of a file",
  { filepath: z.string().describe("Path relative to root") },
  async ({ filepath }) => {
    const content = await fs.readFile(path.join(ROOT_DIR, filepath), "utf-8");
    return { content: [{ type: "text", text: content }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

**Key tools exposed:** `list_files`, `read_file`, `write_file`, `search_files`

---

## Slide 12 — Node.js: Claude Agentic Loop

```typescript
// Discover MCP tools → convert to Anthropic format
const { tools: mcpTools } = await client.listTools();
const claudeTools = mcpTools.map((t) => ({
  name: t.name,
  description: t.description ?? "",
  input_schema: t.inputSchema,
}));

// Agentic loop: reason → act → observe → repeat
while (true) {
  const response = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 4096,
    tools: claudeTools,
    messages,
  });

  if (response.stop_reason === "end_turn") break;   // done
  if (response.stop_reason === "tool_use") { /* call MCP tools, append results */ }
}
```

---

## Slide 13 — Python SDK: Getting Started

```bash
pip install mcp anthropic httpx beautifulsoup4
# or with uv (recommended):
uv add mcp anthropic httpx beautifulsoup4
```

**Two API styles:**

| Style | When to Use |
|-------|-------------|
| **Low-level `Server`** | Full control, explicit schema definition |
| **`FastMCP` decorators** | Rapid development — infers JSON Schema from Python type hints & docstrings |

**Four key server patterns:**

1. Web Research Server (DuckDuckGo, no API key)
2. Sandboxed Code Execution Server
3. FastMCP Productivity Server
4. Complete Python Client + Claude

---

## Slide 14 — Python: FastMCP Pattern

```python
from mcp.server.fastmcp import FastMCP
from typing import Annotated

mcp = FastMCP("productivity-server")

@mcp.tool()
def add_todo(
    title: Annotated[str, "Task title"],
    priority: Annotated[str, "Priority: low / medium / high"] = "medium",
) -> str:
    """Add a task to the todo list."""
    # ... implementation
    return f"Added task: {title} [{priority}]"

@mcp.resource("todos://summary")
def todo_summary() -> str:
    """Inject current todo stats into the model's context."""
    return f"Todos: {len(_todos)} total, {done} done, {pending} pending."

if __name__ == "__main__":
    mcp.run()  # defaults to stdio
```

FastMCP **infers JSON Schema** from type hints and docstrings — minimal boilerplate.

---

## Slide 15 — Client Configuration: Claude Desktop

**Config file locations:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["ts-node", "/path/to/mcp-server-filesystem.ts"],
      "env": { "MCP_ROOT": "/Users/me/Documents" }
    },
    "web-research": {
      "command": "python",
      "args": ["/path/to/mcp_server_web.py"]
    }
  }
}
```

---

## Slide 16 — Client Configuration: Claude Code CLI

```bash
# Add a local stdio server
claude mcp add filesystem \
  --command "npx ts-node /path/to/mcp-server-filesystem.ts" \
  --env MCP_ROOT=/Users/me/projects

# Add a remote SSE server
claude mcp add remote \
  --transport sse \
  --url http://my-server.example.com/sse

# Manage servers
claude mcp list
claude mcp test filesystem
claude mcp remove filesystem

# One-shot usage
claude --mcp-server filesystem "Find all TODO comments across the codebase"
```

**Compatible clients:** Claude Desktop, Claude.ai, Claude Code, Cursor, Windsurf, Zed, and more.

---

## Slide 17 — Security Model

MCP operates under a clear **trust hierarchy**: host is root of trust → clients inherit host permissions → servers are explicitly sandboxed.

| Principle | Description |
|-----------|-------------|
| 🔐 **Human-in-the-Loop** | Hosts must expose tool calls to users before execution, especially for writes/deletions |
| 🏝️ **Process Isolation** | Each server runs in its own subprocess; cannot access host memory or other servers |
| 🚧 **Roots & Scope** | Clients communicate authorized scope via filesystem paths/URIs; servers must respect them |
| 🔑 **Secret Management** | Never hardcode credentials; pass via environment variables set in host config |
| ⚠️ **Prompt Injection Risk** | Validate and sanitize tool outputs — especially web scraping and user-supplied data |
| 📋 **Audit Logging** | Log all tool invocations with arguments and results for compliance and debugging |

---

## Slide 18 — Agentic Risk Checklist

When deploying agents with broad tool access:

- [ ] Apply **minimal scope** by default
- [ ] Require explicit **user confirmation** for destructive operations
- [ ] **Rate-limit** tool calls per session
- [ ] Implement **circuit breakers** for unexpected tool usage patterns
- [ ] Never expose database write tools without **human review** of the generated SQL

---

## Slide 19 — Summary

| Aspect | Detail |
|--------|--------|
| **Problem solved** | M×N integration explosion → M+N with a single standard |
| **Released** | November 2024, by Anthropic (open standard) |
| **Protocol** | JSON-RPC 2.0 over stdio, SSE, or HTTP |
| **Primitives** | Tools, Resources, Prompts, Sampling, Notifications, Roots |
| **SDKs** | TypeScript, Python (official); Go, Rust, Java, C# (community) |
| **Adopted by** | OpenAI, Google DeepMind, Microsoft, Cursor, Windsurf, Zed, and more |
| **Key strength** | Universal, composable, secure — build once, connect anywhere |

---

## Resources

- **Spec:** [spec.modelcontextprotocol.io](https://spec.modelcontextprotocol.io)
- **Original white paper:** [mchinnappan100.github.io/pages2/mcp/wp/mcp.html](https://mchinnappan100.github.io/pages2/mcp/wp/mcp.html)
- **Node.js SDK:** `npm install @modelcontextprotocol/sdk`
- **Python SDK:** `pip install mcp`

---

*Model Context Protocol — Open Standard by Anthropic · 2024–2025*