# Claude API & MCP Quiz Notes

Questions and answers from a study session on structured outputs, extended thinking, streaming, tool schemas, tool_choice, MCP resources, and file-tool security.

---

## 1. Why is tool_use preferred over "respond in JSON" for structured data extraction?

Tool use moves the schema from a suggestion in the prompt to a constraint on the output.

1. **The schema is enforced, not requested.** You pass a JSON Schema as the tool's `input_schema`, and the model produces a structured call against it. Required fields, enums, types, and nesting are part of the interface. With strict tool use enabled, the API can guarantee schema conformance rather than just make it very likely.
2. **You avoid the usual parsing failures.** Free-text JSON can include preamble, markdown fences, trailing commentary, unescaped characters, or truncated output. With tool use, arguments arrive as a parsed object in a dedicated `tool_use` content block, separate from any prose.
3. **Types and constraints do real work.** Enums restrict categorical values, `required` reduces missing keys, and per-field `description`s guide the model where it's needed.
4. **You can force the behavior.** Setting `tool_choice` to a specific tool makes the model call it rather than answer conversationally.
5. **It composes with agentic workflows.** Structured extraction is just another tool, so one mechanism covers both actions and data output.

**Caveats:**
- Schemas guarantee shape, not correctness. Validate semantically where it matters.
- Very deep or complex schemas can reduce quality; flatter structures usually extract more reliably.
- The "tool" doesn't need to execute anything. A common pattern is defining something like `record_invoice_data` purely as a typed place for the answer.
- Some APIs also offer a dedicated structured-output mode. Check current docs.

### Quiz: Why prefer tool_use?

- A. Tool use is faster
- **B. The API enforces the JSON Schema, guaranteeing valid output, no parsing needed** (correct, with the caveat that a strict guarantee requires strict tool use, and it covers shape only)
- C. Tool use costs fewer tokens
- D. JSON mode doesn't work with Claude

Why not the others: speed isn't the selling point (tool definitions can add slight overhead); tool schemas count as input tokens, so cost is often slightly higher; plain-text JSON works but nothing enforces it.

---

## 2. What does the `thinking` content block contain in extended thinking mode?

- A. The final answer only
- **B. Claude's internal reasoning tokens before the answer, not shown to end users by default** (correct)
- C. Metadata about token usage
- D. The tool calls Claude considered but did not execute

Notes:
- Thinking tokens are billed as output tokens, and `budget_tokens` caps the reasoning.
- The block includes a `signature` field so the API can verify it wasn't tampered with. When continuing a conversation with tool use, pass thinking blocks back unmodified.
- On some newer models, returned thinking may be a summary rather than raw tokens. Check current docs.

Why not the others: the final answer is in the separate `text` block; token usage is in the `usage` object; actual tool calls appear as `tool_use` blocks.

---

## 3. Streaming handler in Python

```python
with client.messages.stream(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role":"user","content":"Hello"}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

- **A. Correct: `.text_stream` yields text deltas as they arrive** (correct)
- B. Wrong, use `stream.content`
- C. Wrong, streaming requires `async` / `await`
- D. Wrong, `flush=True` is not needed

Notes:
- Check the model string against current docs. The most recent Sonnet model string is `claude-sonnet-5-5`.
- After the loop, `stream.get_final_message()` returns the assembled `Message` with `usage` and stop reason.
- For tool use, thinking blocks, etc., iterate over `stream` directly for raw events.
- Async is optional: use `AsyncAnthropic` with `async with` / `async for` if desired.
- `flush=True` prevents stdout buffering from delaying output.

---

## 4. What does the `required` array in a tool's `input_schema` specify?

- A. Tools that must be called together
- **B. Parameters that Claude MUST provide, missing them will cause a schema validation error** (best answer)
- C. Parameters with no default value but that Claude may omit
- D. The order in which parameters should be passed

Notes:
- `required` is standard JSON Schema: an unordered set of property names that must be present.
- Whether a validation error occurs depends on where validation happens. With strict tool use the API guarantees required fields; otherwise validate inputs in your own code before executing the tool.
- It operates within a single tool's input, not across tools.

---

## 5. Which `tool_choice` forces a specific named tool?

- A. `{"type": "auto"}`
- B. `{"type": "any"}`
- **C. `{"type": "tool", "name": "my_tool"}`** (correct)
- D. `{"type": "none"}`

Notes:
- `auto` is the default: Claude decides whether and which tool to call.
- `any` forces some tool call, but Claude picks which.
- `none` prevents tool calls entirely.
- With `tool` or `any`, Claude skips preamble text and goes straight to the tool call.
- Forced tool choice isn't compatible with extended thinking, which supports only `auto` and `none`.

---

## 6. MCP resources: static URI vs. URI template

- A. Static URIs are faster; templates are more flexible
- **B. Static URIs reference fixed content (e.g., `docs://readme`); URI templates include variables resolved at read time (e.g., `db://products/{id}`)** (correct)
- C. Templates require authentication; static URIs do not
- D. There is no practical difference

Notes:
- Static resources are discovered via `resources/list` and read via `resources/read`.
- Templates (RFC 6570) are discovered via `resources/templates/list`; the client fills in variables, then calls `resources/read` with the concrete URI (e.g., `db://products/42`).
- Templates can support argument completion for variables like `{id}`.
- Authentication is a transport/server concern and applies to both.

---

## 7. Critical security check for tools that read user-supplied file paths

- A. Validate the file extension
- **B. Check that the resolved path stays within the allowed base directory (prevent path traversal)** (correct)
- C. Require files to be under 1MB
- D. Always read files as binary

How to do it properly:
- **Resolve first, then check.** Canonicalize (`Path(base, user_path).resolve()` or `realpath`) so `..`, redundant slashes, and symlinks are collapsed before comparing.
- **Verify containment** with something like `resolved.is_relative_to(base)`. Avoid plain `startswith`, which wrongly lets `/data/uploads-evil` pass for base `/data/uploads`.
- **Watch symlinks.** Check the resolved target.
- **Reject absolute paths** or treat all input as relative to the base.
- **Guard against TOCTOU races** by opening the file and validating the opened handle rather than checking and opening separately.

Why not the others: extension checks are easy to bypass and say nothing about location; size limits help with resource exhaustion but not with reading sensitive small files; binary vs. text mode has no security value here.

This matters more for LLM-driven tools, since paths may be influenced by untrusted content such as prompt injection in documents or web pages.
