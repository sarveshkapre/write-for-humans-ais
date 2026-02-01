# Plan — Write for Humans + AIs

## Goal
Publish a static site (or existing docs/marketing site) into AI-canonical artifacts:
- `/llms.txt` and `/llms-full.txt`
- Clean per-URL Markdown with stable anchors
- JSON-LD for claims/glossary metadata
- Content-addressed build outputs
- Continuous “AI comprehension fidelity” eval harness

## Target users
- Docs/marketing teams who want AI-friendly, citeable docs without sacrificing human UX.
- Developers who need deterministic, versioned content artifacts for RAG.

## Non-goals (MVP)
- No authentication or multi-tenant publishing.
- No remote crawler beyond a local directory.
- No hosted service or cloud queue.

## Stack
- Node.js 20 LTS
- TypeScript
- CLI-first (no server in MVP)
- `remark`/`rehype` for Markdown/HTML transforms
- Node’s built-in `node:test` for tests
- `tsx` for dev scripts

Rationale: fast iteration, rich Markdown/HTML ecosystem, easy CLI distribution, and cross-platform compatibility.

## MVP scope (v0.1.0)
1. Input: local directory containing HTML and/or Markdown.
2. Output:
   - `dist/llms.txt`
   - `dist/llms-full.txt`
   - `dist/markdown/<slug>.md` per source page
   - `dist/manifest.json` (content-addressed hashes)
   - `dist/claims.jsonld` (empty scaffold if none)
3. Stable anchors for headings and inline fragment links preserved.
4. Deterministic builds (sorted inputs, stable hashing, normalized whitespace).
5. Eval harness (retrieval-only):
   - Sample questions -> retrieve relevant doc chunks
   - Score: coverage, correctness proxy, ambiguity
   - Generate `dist/eval/report.json`

## Architecture
- CLI entry: `wfha` (write-for-humans-ais)
- Pipeline:
  1) Discover files (HTML/MD)
  2) Normalize -> clean Markdown AST
  3) Emit per-page Markdown + anchors
  4) Build llms.txt (short) and llms-full.txt (full list)
  5) Hash outputs -> manifest
  6) Run eval harness -> report

## Security notes
- Input path only; no network by default.
- Path traversal protection in file discovery.
- Output directory wipe only within target `dist`.

## Risks
- HTML to Markdown quality varies across inputs.
- Anchor stability across rebuilds.
- Eval harness scoring quality may be subjective.

## Milestones
- M1: CLI skeleton + file discovery
- M2: Markdown normalization + stable anchors
- M3: llms.txt/llms-full.txt generation
- M4: manifest hashing + eval harness
- M5: Docs + CI + v0.1.0

## Tests
- Unit tests for slug/anchor stability
- Snapshot tests for Markdown output normalization
- Integration test: sample input directory -> deterministic `dist`
