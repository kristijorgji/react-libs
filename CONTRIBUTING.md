# Contributing to react-libs

## Prerequisites

- Node.js `>= 22.16.0` (`.nvmrc`)
- pnpm `9.15.4`

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
```

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/). Examples: `feat(react-localized-routing): …`, `fix(…): …`, `docs: …`, `chore: …`.

**Versioning is driven by Changesets, not by commit types.** Do not bolt on semantic-release — that would double-bump packages.

## Pull request checklist

- [ ] `pnpm build && pnpm test && pnpm lint` pass locally
- [ ] If you changed anything under `packages/**`, you added a changeset (`pnpm changeset`)
- [ ] For chore-only PRs with no package impact: `pnpm changeset --empty`

CI enforces changesets on PRs that touch `packages/**` via `pnpm changeset status --since=origin/<base>`. Dependabot dependency PRs are exempt from that gate (build/test/lint still run); intentional releases still use human changesets.

## Releasing (Changesets)

This monorepo publishes **multiple independent packages**.

### Developer-facing convention

Every PR that changes `packages/**` includes a changeset:

```bash
pnpm changeset
```

Pick the affected packages, a bump type (`patch` / `minor` / `major`), and write one human sentence. That produces `.changeset/<id>.md`, committed with the code.

### Two-phase release

1. **PR with code + changeset** merges to `main`.
2. `changesets/action` sees pending changesets and opens a **chore: version packages** PR (version bumps + CHANGELOGs + lockfile refresh via `pnpm ci:version`).
3. Merging that version PR runs `pnpm ci:publish` (`pnpm -r build && changeset publish`), which publishes only packages whose version is not already on the registry, creates `pkg@version` tags, and opens GitHub Releases.

Nothing publishes on the first merge. The version PR is the review gate; merging it is the act of releasing. A partially-failed publish is safe to re-run.

### Root scripts

| Script | Purpose |
| ------ | ------- |
| `pnpm changeset` | Create a changeset interactively |
| `pnpm ci:version` | `changeset version` then `pnpm install --lockfile-only` |
| `pnpm ci:publish` | Build all packages, then `changeset publish` |

### GitHub Actions

- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — build, test, lint, changeset status, React peer smoke
- [`.github/workflows/release.yml`](.github/workflows/release.yml) — Changesets action on push to `main`

Maintainer one-time repo setup: [docs/maintainer-release-setup.md](docs/maintainer-release-setup.md).

Publishes use **Trusted Publishing (OIDC)** from [`.github/workflows/release.yml`](.github/workflows/release.yml). Do **not** set `NPM_TOKEN` / `NODE_AUTH_TOKEN` on the Release job — a present token bypasses OIDC. The workflow upgrades npm to ≥ 11.5.1 and sets `permissions.id-token: write`.

Each package keeps `"publishConfig": { "access": "public", "provenance": true }`; under Trusted Publishing, provenance is also generated automatically.

### Per-package manifest conventions

Every publishable package must include:

- `"publishConfig": { "access": "public", "provenance": true }`
- `"files": ["dist", "README.md", "LICENSE"]` (allow-list — no `.npmignore`)
- `"repository": { "type": "git", "url": "git+https://github.com/kristijorgji/react-libs.git", "directory": "packages/<name>" }`
- `"type": "module"`, `"exports"`, `"types"`, `"engines": { "node": ">=22.16.0" }`, `"license": "MIT"`
- Its own `README.md` (renders on npm) and a Changesets-generated `CHANGELOG.md` (never hand-edit)

Internal deps use `workspace:^`; pnpm rewrites them to real semver at publish time.

### Pre-releases

```bash
pnpm changeset pre enter next   # publish under dist-tag `next`
# … iterate …
pnpm changeset pre exit         # before a real latest release
```

## Local linking

```bash
# in a consumer repo
pnpm add link:../react-libs/packages/react-localized-routing
```
