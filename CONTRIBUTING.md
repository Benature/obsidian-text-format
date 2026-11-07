# Contributing

## Development setup

1. Use Node.js 22 or a compatible newer release.
2. Install dependencies reproducibly with `npm ci`.
3. Run the checks before submitting changes:

   ```sh
   npm test
   npm run lint
   npm run build
   ```

`npm run lint` uses `eslint-plugin-obsidianmd` to check Obsidian API compatibility, security findings, and plugin guidelines. Keep the existing regression tests passing and add a focused test for each bug fix when practical.

## Release

Releases are created by `.github/workflows/release.yml` when a version tag is pushed. The workflow must run the tests, lint, and production build; upload only `main.js`, `manifest.json`, and `styles.css`; generate release notes; and create build-provenance attestations for the JavaScript and CSS assets.

Before tagging, update `manifest.json`, `versions.json`, and `CHANGELOG.md`, then commit those changes on `master`.
