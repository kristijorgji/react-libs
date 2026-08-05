# react-libs

TypeScript-first React runtime libraries published as scoped npm packages under `@kristijorgji/*`.

## Packages

| Package | Purpose | Docs |
| ------- | ------- | ---- |
| [`@kristijorgji/react-localized-routing`](https://www.npmjs.com/package/@kristijorgji/react-localized-routing) | Locale-aware React Router path helpers, route factories, and sync hooks | [packages/react-localized-routing/README.md](packages/react-localized-routing/README.md) |

## Requirements

- **Node.js** `>= 22.16.0` (see [`.nvmrc`](.nvmrc))
- **pnpm** `9.15.4` (pinned via `packageManager`)

## Quick start

```bash
pnpm add @kristijorgji/react-localized-routing
```

See the package README for peers (`react`, `react-router-dom`, `i18next`, `react-i18next`) and usage.

## Repository layout

```text
packages/
  react-localized-routing/   # first publishable package
```

No Turborepo — use `pnpm -r build` / `pnpm -r test`.

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
pnpm typecheck
```

## Releasing

Versioning uses [Changesets](https://github.com/changesets/changesets). See [CONTRIBUTING.md](CONTRIBUTING.md).

Maintainer one-time setup (GitHub Actions permissions, npm Trusted Publishing): [docs/maintainer-release-setup.md](docs/maintainer-release-setup.md).

## License

[MIT](LICENSE)
