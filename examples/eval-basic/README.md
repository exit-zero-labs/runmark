# eval-basic

Minimal dataset-driven eval. Fans out a JSONL dataset across the bundled demo
server's `/ping` endpoint to show off `runmark eval run`.

## Try it

```sh
# 1. Start the bundled demo server in another terminal
runmark demo start

# 2. Run the eval (from this directory)
runmark eval run ping-matrix

# 3. Inspect the aggregated summary
cat runmark/artifacts/evals/ping-matrix/*/summary.md | less
```

Each dataset row becomes its own session with row-scoped variable overrides
(`inputs`). Per-row pass/fail reuses the request's own `expect` assertions, so
expectations live in one place.
