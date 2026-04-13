<!-- @format -->

# GitHub Copilot Instructions for runmark

Primary repository guidance lives in [`AGENTS.md`](../AGENTS.md) and [`.ai/AI.md`](../.ai/AI.md).

Key rules:

- keep `apps/cli` as a thin adapter — it exposes both the `runmark` CLI and the `runmark mcp` stdio MCP server
- keep tracked request intent in `runmark/` and runtime state in `runmark/artifacts/`
- do not add secret literals to tracked files
- prefer path-derived IDs and explicit schemas at public boundaries
- put judge-oriented validation assets under `testing/runmark/`
