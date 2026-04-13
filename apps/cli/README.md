# @exit-zero-labs/runmark

CLI package for `runmark`, the file-based HTTP workflow runner for humans and AI agents.

## Install

```bash
npm install -g @exit-zero-labs/runmark
runmark --version
```

To update an existing global install:

```bash
npm install -g @exit-zero-labs/runmark@latest
runmark --version
```

## Quick start

```bash
runmark init
runmark validate
runmark describe --run smoke
runmark explain variables --request ping
runmark run --run smoke
```

When `--project-root` is omitted, the CLI discovers the nearest `runmark/config.yaml`.

## MCP

`runmark mcp` starts the stdio MCP server for agents.

Because MCP servers are often launched outside the target repository, every MCP tool call must include `projectRoot` pointing at the project directory that contains `runmark/config.yaml`.

## What this package does

- scaffolds a tracked `runmark/` project with `runmark init`
- validates definitions before execution
- runs requests and multi-step runs
- starts `runmark mcp` for MCP clients
- persists sessions and artifacts under `runmark/artifacts/`
- lets you inspect artifacts and explicitly resume paused or failed runs

## Support

Support development via GitHub Sponsors or Open Collective:

- <https://github.com/sponsors/exit-zero-labs>
- <https://opencollective.com/exit-zero-labs>

GitHub Sponsors is the primary recurring path. Open Collective is the secondary path for one-time support and public budget visibility. Repo-level support notes live at <https://github.com/exit-zero-labs/runmark/blob/main/docs/support.md>.

## More docs

- repository overview: <https://github.com/exit-zero-labs/runmark#readme>
- agent-oriented guidance: <https://github.com/exit-zero-labs/runmark/blob/main/docs/agent-guide.md>
- technical architecture: <https://github.com/exit-zero-labs/runmark/blob/main/docs/architecture.md>
