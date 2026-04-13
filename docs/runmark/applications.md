<!-- @format -->

# Runmark applications

**Status**: Active reference  
**Previous name**: `httpi`  
**Companion docs**: [brand foundation](brand-foundation.md), [voice and messaging](voice-and-messaging.md), [visual system](visual-system.md), [rebrand transition](rebrand-transition.md)

---

## 1. Purpose

This document shows how the Runmark system should be applied across repo-owned
surfaces now that the rename has shipped.

The goal is consistency: one product name, one package name, one command, one
folder layout, and one migration path for people who still know the product as
`httpi`.

## 2. Docs site

### Goal

Make the docs site feel like the canonical Runmark home, not a partially
renamed transition surface.

### Recommended structure

1. Quickstart
2. Migration guide from `httpi`
3. Brand foundation
4. Voice and messaging
5. Visual system
6. Applications
7. Rebrand transition

### Page behavior

- use concise intros
- prefer tables over long bullets for rules
- use card grids for navigation between Runmark pages
- keep code and evidence examples on dark surfaces in both themes

## 3. README and GitHub surface

### Goal

Keep the GitHub entry point aligned with the shipped package, binary, and
project layout.

### Recommended approach

- use `# Runmark` as the only primary product heading
- install `@exit-zero-labs/runmark`
- show `runmark/` and `runmark/artifacts/` in all file trees
- link the migration guide when historical `httpi` users need context

### README structure

1. `# Runmark`
2. one-paragraph product definition
3. install block
4. what it solves
5. project layout
6. core commands
7. examples
8. migration note from `httpi`

## 4. Product and CLI surfaces

### Goal

Make Runmark feel like a serious tool without over-branding the CLI.

### Guidance

- CLI help should stay neutral and dense
- product pages can carry more serif-led identity
- screenshots should favor:
  1. command output
  2. file trees
  3. saved run state
  4. explicit pause/resume moments

### Avoid

- decorative ASCII banners
- marketing-heavy terminal screenshots
- faux dashboards that imply product features that do not exist

## 5. Diagram language

### Preferred diagram sequence

**Tracked files -> Validate -> Run -> Pause -> Inspect saved outputs -> Resume**

### Elements to show repeatedly

- request files
- run files
- `runmark/artifacts/`
- CLI
- MCP
- session record
- saved outputs
- checkpoint

### Avoid

- generic funnel graphics
- “AI agent brain” art
- DAG-heavy orchestration diagrams that make the product look like a workflow engine

## 6. Social, launch, and share surfaces

### Goal

Keep short-form launch material tied to the repo-native workflow story.

### Share-card pattern

- dark background
- one serif statement
- one mono code or path fragment
- one accent mark in Signal
- one checkpoint accent in Ember

### Short-form copy examples

- **Run API workflows from files in your repo.**
- **Tracked definitions. Local evidence. One engine.**
- **Pause, inspect, resume.**

## 7. Historical-name guidance

Use `httpi` only when a surface is explicitly helping an existing user migrate:

- migration docs
- release notes
- compatibility FAQs
- before/after mapping tables

Avoid dual naming on normal product pages. Outside migration context, the
canonical name is **Runmark**.

## 8. Application checklist

| Surface | Must show | Must avoid |
| --- | --- | --- |
| docs site | repo-native job, file tree, workflow loop, migration guide for old users | stale “draft” framing or broken old-name links |
| README | clear product statement, install, migration link | mixed `httpi` and `runmark` without a mapping purpose |
| screenshots | files, CLI, saved outputs, explicit state | fake UI or dashboards |
| comparisons | repo files vs workspace, saved outputs vs hidden state | “X killer” framing |
| launch copy | clear rename reason, workflow/evidence story | protocol-only framing |
