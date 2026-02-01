# AGENTS

## Repo intent
This repo publishes AI-canonical artifacts from a local directory of HTML/Markdown.

## Commands
- `make setup` — install deps
- `make dev` — run CLI in watch/dev mode
- `make test` — unit/integration tests
- `make lint` — lint
- `make typecheck` — typecheck
- `make build` — build
- `make check` — lint + typecheck + test + build (quality gate)
- `make release` — build + package

## Conventions
- TypeScript, ESM.
- Deterministic output: stable sorting, normalized whitespace.
- No network by default; inputs must be local paths.
- Update `docs/CHANGELOG.md` for user-facing changes.

## Structure
- `src/` — core pipeline
- `src/cli/` — CLI entry
- `src/lib/` — transforms + hashing + eval
- `examples/` — sample input site
- `docs/` — repo docs (all markdown except README)
