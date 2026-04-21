---
"@exit-zero-labs/runmark": minor
---

CI-friendly reporters and always-on session summaries.

- `runmark run` and `runmark resume` now accept repeatable `--reporter <format>[:path]` flags with `json`, `summary` (Markdown), `junit`, `tap`, and `github` (Actions annotation) formats. Default artifacts land at `runmark/artifacts/reports/<sessionId>.<ext>`.
- Every session now writes `summary.json` and `summary.md` next to its manifest under `runmark/artifacts/history/<sessionId>/`, so operators and CI have a stable inspection surface without opting in.
- New public exports from `@exit-zero-labs/runmark-execution`: `formatReporter`, `buildSessionSummary`, `writeSessionSummaryArtifacts`, and their types (`ReporterFormat`, `SessionSummary`, `SessionStepSummary`, `ReporterArtifact`).
