# sf-rust Overview

## What is sf-rust?
sf-rust is a native Salesforce developer CLI written entirely in Rust.
No Node.js. No npm. No C++ addons. Just a single statically-linked binary.

## Key features
- Org management: login, logout, display, list, open
- Data queries: SOQL with pagination, CSV, JSON, Parquet, Excel, SQLite output
- Apex: execute, test, logs, profiler
- Metadata: deploy and retrieve via SOAP Metadata API
- Packages: create and install
- DevOps pipeline commands
- Git utilities: format-aware diffs for Apex, XML, JSON
- File viewer: Markdown, YAML, XML, JSON, CSV, Apex with Monaco editor
- AI assistant: Claude, OpenAI, xAI/Grok, Ollama, Gemini
- RAG: ask questions about your documents
- Utilities: QR code, hash (MD5/SHA-256/SHA-512), base64/URL/hex encode, JSON query

## Installation
```
make install       # builds release binary and installs to ~/.local/bin/
```

## Quick alias
```bash
alias sfr="$HOME/.local/bin/sf-rust"
```

## Credential security
All tokens stored AES-256-GCM encrypted at:
  ~/.sf-rust/credentials.json
  ~/.sf-rust/.key (32-byte AES key, chmod 600)

## API version
Fetched live from GET /services/data/ (org max version).
Default fallback: 62.0

## Shell completions
```
sfr completion zsh > ~/.zfunc/_sf-rust
sfr completion bash > ~/.bash_completion.d/sf-rust
sfr completion fish > ~/.config/fish/completions/sf-rust.fish
```

## Man pages
56 man pages installed to ~/.local/share/man/man1/
Access with: man sf-rust, man sf-rust-data-query, man sf-rust-org-login-web
