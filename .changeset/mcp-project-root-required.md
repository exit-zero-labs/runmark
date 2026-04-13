---
"@exit-zero-labs/httpi": minor
---

Require `projectRoot` on every `httpi mcp` tool call.

MCP servers are often launched outside the target repository, so tool calls no
longer fall back to server cwd-based project discovery. MCP clients must now
send `projectRoot` on every tool invocation, pointing at the repository
directory that contains `httpi/config.yaml`.
