# Update (2026-02-01)

## Shipped
- Safer output directory handling: the CLI now refuses to delete an `--out` directory outside the current working directory (or equal to it) unless you pass `--force`.
- Refuse output directories inside the input directory (prevents self-ingesting generated markdown).
- CLI UX polish: `--version/-v` support and expanded `--help`.
- Harder-to-footgun internals: improved path-boundary checks in file discovery.
- Dev ergonomics: `npm test` now runs a build automatically via `pretest`.
- Packaging hygiene: stop ignoring `build/` so installs include the compiled `wfha` bin.

## Verified
```bash
make check
```

## PR Instructions (if needed)
Per repo policy for this run: no PRs.
