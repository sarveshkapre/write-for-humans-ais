# Changelog

## Unreleased
- Scaffold repo structure and documentation.
- Implement CLI pipeline for local HTML/Markdown input.
- Generate `llms.txt`, `llms-full.txt`, per-page Markdown, manifest, and eval report.
- Add deterministic anchors and basic eval harness.
- Harden output directory cleaning with safety rails (`--force`) and clearer CLI help/version.
- Refuse output directories inside the input directory (prevents self-ingesting generated markdown).
- Fix file discovery path-boundary checks and make `npm test` build automatically.
- Stop ignoring `build/` so package installs include the compiled CLI entrypoint.
- Make `build.fingerprint` deterministic across output directories and (by default) across runs.
- Ignore common heavy/irrelevant directories during file discovery by default (`--no-ignore` to include).
- Skip symlinked directories by default during discovery (`--follow-symlinks` to include).
- Add a concise post-build summary to CLI output (pages/eval/outputs).
