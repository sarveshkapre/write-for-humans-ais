# Write for Humans + AIs — Plan

One-line pitch: Turn a local docs/site directory (HTML/Markdown) into deterministic, AI-canonical artifacts (`llms.txt`, clean Markdown, manifests, eval reports).

## Current Feature Set
- CLI (`wfha`) that builds from a local input directory
- Per-page cleaned Markdown with deterministic heading anchors
- `llms.txt` and `llms-full.txt`
- `manifest.json` with content hashes
- Optional lightweight eval harness (`eval/report.json`)

## Top Risks / Unknowns
- HTML→Markdown fidelity across real-world sites (nav/aside/boilerplate removal).
- Anchor stability and intra-doc link correctness across rebuilds.
- Output safety: avoid destructive `--out` paths; keep builds deterministic.
- Eval harness usefulness: scoring rubric + golden datasets.

## Commands
See `docs/PROJECT.md` for the authoritative command list.

Quick quality gate:
```bash
make check
```

Example build:
```bash
npm run wfha -- --input ./examples/site --out ./dist
```

## Shipped (Most Recent First)
- 2026-02-01: Deterministic builds by default (`--timestamps` opt-in) + stable content-based `build.fingerprint`.
- 2026-02-01: Add output-dir safety rails (`--force`), prevent output-inside-input footgun, improve CLI help/version, and harden path traversal checks.

## Next Up
- Improve HTML-to-Markdown heuristics (boilerplate stripping, better titles).
- Expand integration fixtures + golden deterministic outputs.
- JSON-LD schema + validation for claims/glossary.
