---
"@exit-zero-labs/runmark": minor
---

Dataset-driven evals: `runmark eval list`, `runmark eval run`, `runmark new eval`.

- New tracked kind at `runmark/evals/<id>.eval.yaml` pairing a target run or request with a JSONL or CSV dataset. Each row becomes its own session with row-scoped variable overrides. Per-row pass/fail reuses the request's own `expect` assertions.
- `runmark eval run <id>` fans out with bounded `concurrency` and writes an aggregated summary to `runmark/artifacts/evals/<id>/<ts>/summary.{json,md}`. Exits non-zero when any row failed, suitable for CI gates.
- `runmark eval list` enumerates tracked evals, and `runmark new eval <id>` scaffolds a starter eval plus the expected dataset path.
- New exports from `@exit-zero-labs/runmark-execution`: `listEvalDefinitions`, `runEval`, `EvalListEntry`, `EvalRowOutcome`, `EvalRunResult`.
- Added `examples/eval-basic` showing the end-to-end loop against the bundled demo server.

LLM-as-judge, `runmark eval diff`, and MCP parity tools are intentionally deferred.
