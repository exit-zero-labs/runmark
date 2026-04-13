<!-- @format -->

# Runmark rebrand transition

**Status**: Shipped  
**Previous name**: `httpi`  
**Companion docs**: [brand foundation](brand-foundation.md), [applications](applications.md)

---

## 1. Purpose

This document records the completed rename from `httpi` to Runmark and the
migration surfaces that still matter for existing users.

The rename is no longer staged. The repository, npm package, binary, project
folder, docs host, examples, tests, and public docs now use the Runmark name.

## 2. Name mapping

| Surface | Old | New |
| --- | --- | --- |
| product name | `httpi` | `Runmark` |
| local project folder | `httpi/` | `runmark/` |
| GitHub repo | `exit-zero-labs/httpi` | `exit-zero-labs/runmark` |
| npm package | `@exit-zero-labs/httpi` | `@exit-zero-labs/runmark` |
| binary | `httpi` | `runmark` |
| docs site | `httpi.exitzerolabs.com` | `runmark.exitzerolabs.com` |

## 3. What shipped together

- GitHub repo references now use `exit-zero-labs/runmark`
- npm publishing now uses `@exit-zero-labs/runmark`
- the CLI binary is `runmark`
- project discovery expects `runmark/config.yaml`
- runtime state lives under `runmark/artifacts/`
- examples, tests, docs, and package metadata were updated in the same pass
- the docs host is `runmark.exitzerolabs.com`

## 4. Migration expectations

Existing users should update all of the following together:

1. global or CI installs
2. MCP client config
3. shell scripts and README snippets
4. repository links
5. on-disk project folder names

There is no long-term compatibility alias. This rename ships as a clean break.
Migration guidance stays in the docs, but old identifiers should now be treated
as historical only.

## 5. Guardrails

### Do not let both names live indefinitely

Long-term dual naming creates confusion in:

- docs
- support questions
- package installs
- examples
- agent prompts

### Do not bury the folder rename

The folder rename from `httpi/` to `runmark/` is product-defining because it
changes:

- project layout examples
- project-root discovery
- docs and screenshots
- user muscle memory

Treat it as a first-class migration item, not a cleanup afterthought.

## 6. Cleanup rule

Keep `httpi` only where it directly helps migration or historical
understanding:

- migration docs
- release notes
- before/after mapping tables
- rename rationale

Reject new stale `httpi` references in package metadata, CLI help, examples,
tests, docs, issue templates, and agent instructions.

## 7. Summary

Runmark is now the canonical name everywhere. `httpi` remains only as the old
name users may still need help migrating away from.
