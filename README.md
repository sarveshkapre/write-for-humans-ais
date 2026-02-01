# Write for Humans + AIs

Publishing layer that generates AI-canonical artifacts for a static site or docs set:
- `/llms.txt` and `/llms-full.txt`
- Clean per-URL Markdown with stable anchors
- JSON-LD for claims/glossary metadata
- Content-addressed builds
- A lightweight “AI comprehension fidelity” eval harness

## Status
Scaffolded with an MVP CLI pipeline. Not yet released.

## Quickstart (MVP target)
```bash
npm install
npm run build
npm run wfha -- --input ./examples/site --out ./dist
```

Safety note: by default the CLI refuses to wipe an output directory outside the current working directory (or equal to it). If you really need that, pass `--force`.
Also, the output directory must be outside the input directory to avoid accidentally ingesting generated files.
By default builds are deterministic; pass `--timestamps` if you want wall-clock timestamps in outputs.
File discovery ignores `node_modules/`, `build/`, `dist/`, and `.git/` by default; pass `--no-ignore` to include them.
Symlinked directories are skipped by default; pass `--follow-symlinks` if you need them.
CLI prints a concise build summary (pages, eval, outputs) after completion.

## Outputs (MVP target)
- `dist/llms.txt`
- `dist/llms-full.txt`
- `dist/markdown/*.md`
- `dist/manifest.json`
- `dist/claims.jsonld`
- `dist/eval/report.json`

## Notes
- Local-first, no auth, no network by default.
- Deterministic builds with stable hashes.

## License
MIT
