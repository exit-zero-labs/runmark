# Changelog

This changelog tracks user-visible changes for the current `0.1.x` line.

## Unreleased

- prepare scoped npm publishing for the `@exit-zero-labs/httpi` CLI and `@exit-zero-labs/httpi-mcp` adapter with Changesets-based release automation
- keep the shared engine workspace packages private while publishing standalone CLI and MCP install surfaces

## 0.1.0

- initial file-based `httpi/` plus `.httpi/` workflow model
- shared execution engine used by both the CLI and MCP adapters
- request/run validation, describe, explain, run, session, artifact, and resume flows
- pause/resume with definition drift checks and persisted local session state
- artifact capture with header/value redaction and local runtime safety checks
- JSON Schema and IDE support for tracked YAML authoring
- focused unit coverage plus fixture-backed CLI/MCP end-to-end coverage
