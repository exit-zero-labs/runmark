<!-- @format -->

# testing/runmark

This directory contains the flow notes, automated tests, and judge-oriented validation assets used to test `runmark` itself and to support LLM-as-a-judge workflows.

The goal is not only to prove that the engine works, but also to make the expected validation flow easy for humans and coding agents to inspect and repeat.

## Current layout

```text
flows/             scenario writeups and flow notes as coverage grows
judge/             pass/fail checklists and validation guidance for coding agents
runmark.examples.test.mjs public example validation and runnable example coverage
runmark.unit.test.mjs focused engine and CLI contract coverage
runmark.e2e.test.mjs CLI and MCP end-to-end coverage against the canonical example
```

## Included assets

- `../../examples/pause-resume/` exercises envs, blocks, body files, request definitions, runs, pause/resume, and secrets
- `../../examples/getting-started/` and `../../examples/api-key-body-file/` cover the smaller public examples
- `judge/basic-flow.md` captures the expected end-to-end acceptance behavior
- `runmark.unit.test.mjs` pins focused behavior such as extraction taint, interpolation, session redaction, and CLI exit-code mapping
- `runmark.examples.test.mjs` validates every public example and executes the quickstart and API-key flows against a mock server
- `runmark.e2e.test.mjs` covers validate, describe, explain, run, session/artifact inspection, pause/resume, redaction, traversal safety, and CLI/MCP parity

## Fast manual validation loop

Use the canonical example project when you want to exercise the current v0 workflow by hand:

```bash
pnpm build
node apps/cli/dist/index.js validate --project-root examples/pause-resume
node apps/cli/dist/index.js describe --run smoke --project-root examples/pause-resume
node apps/cli/dist/index.js explain variables --request ping --project-root examples/pause-resume
```

For the full paused-run workflow, the E2E test spins up a mock server and rewrites the example environment at runtime so the commands exercise a real HTTP flow safely.

## When to update this directory

If a change affects user-visible validation behavior, update all of the following together:

1. the example project under `examples/`
2. the executable assertions in `runmark.e2e.test.mjs`
3. the human-and-agent acceptance checklist in `judge/basic-flow.md`
