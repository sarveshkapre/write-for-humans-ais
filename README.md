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
