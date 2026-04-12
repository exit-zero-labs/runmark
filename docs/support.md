<!-- @format -->

# Support httpi

`httpi` is intended to be sustained by donations.

## Current donation paths

The active support paths in the repo and package metadata are:

- <https://github.com/sponsors/exit-zero-labs>
- <https://opencollective.com/exit-zero-labs>

Use GitHub Sponsors for recurring support inside the GitHub workflow. Use Open Collective for one-time support and for the public-facing budget surface around project funding.

## What donations fund

Donations are intended to fund work that keeps the project usable and maintained:

- maintenance and bug fixes
- docs, examples, and test coverage
- CI, release, and package maintenance
- roadmap work that improves the CLI and MCP surfaces without breaking the core model

## Principles

- keep the tool open and technically focused
- avoid donation nags in normal CLI or MCP execution paths
- prefer a few clear support entrypoints over repeated prompts
- use recurring donations to support ongoing maintenance
- keep Open Collective tied to real transparency, not vague promises

## Platform roles

- **GitHub Sponsors:** primary recurring support path
- **Open Collective:** secondary path for one-time support and public budget visibility

## Donation metrics

Track a small set of support metrics and review them before changing copy or adding more donation entrypoints.

| Metric | Definition | Source |
| --- | --- | --- |
| Active recurring sponsors | Count of active GitHub Sponsors subscriptions at month end | GitHub Sponsors dashboard |
| Monthly recurring support | Total monthly recurring amount from GitHub Sponsors | GitHub Sponsors dashboard |
| One-time donations | Contributions received through Open Collective that are not recurring | Open Collective contributions / transactions |
| New donors | Unique first-time supporters across GitHub Sponsors and Open Collective for the month | Platform exports or a manual monthly rollup |
| Support surface attribution | Which surface drove the donor: repo README, package README, issue template, or support doc | Platform referrers if available; otherwise add a dedicated redirect or tagged-link layer before optimizing copy around source data |

## Review cadence

- review support metrics once per month, not per release or per commit
- keep one lightweight log with month, active sponsors, recurring total, one-time total, new donors, and notable changes
- do not add CLI telemetry or runtime donation prompts just to collect support analytics
- only change support copy when the metrics show a discovery problem or a clearly stronger surface

## Planned follow-up

1. keep the Open Collective page aligned with the repo support copy and funding purpose
2. link any public budget or expense view from this document once you want that surfaced explicitly
3. review whether donor acknowledgment stays purely lightweight or grows into a defined policy
