# `@kristijorgji/react-localized-routing`

Locale-aware React Router helpers for apps that map stable route IDs to per-locale path templates (with optional `/{locale}` prefixes).

## Install

```bash
pnpm add @kristijorgji/react-localized-routing
```

**Peers:** `react` ^19, `react-dom` ^19, `react-router-dom` ^7, `i18next` >=23, `react-i18next` >=15.

## Concepts

- **App owns** the route ID table and page elements.
- **This package owns** path localization, matching, `<Route>` factories, and locale↔URL sync hooks.
- Pass `routes`, `defaultLocale`, and `LocalizationConfig` explicitly (or via `LocalizedRouterProvider` / `createLocalizedRouting`).

### Config flags

| Flag | Meaning |
| ---- | ------- |
| `useLocaleInPath` | Prefix paths with `/{locale}` |
| `usePrefixForDefaultLocale` | Also prefix the default locale (e.g. `/en/settings`) |

## Minimal usage

```tsx
import {
  LocalizedRouterProvider,
  createAllReactRoutes,
  createLocalizedRouting,
  useNormalizeDefaultLocalePath,
  useSyncRouteWithLocale,
} from '@kristijorgji/react-localized-routing';
import { Route, Routes } from 'react-router-dom';

const config = { useLocaleInPath: false, usePrefixForDefaultLocale: false };
const defaultLocale = 'en' as const;
const routes = {
  en: {
    INDEX: { href: '/' },
    SETTINGS: { href: '/settings' },
  },
  de: {
    SETTINGS: { href: '/einstellungen' },
  },
} as const;

const { localizeRoutePath } = createLocalizedRouting({
  routes,
  defaultLocale,
  config,
});

function AppRouter() {
  useSyncRouteWithLocale(config, defaultLocale, routes);
  useNormalizeDefaultLocalePath(config, defaultLocale, routes.en, routes);

  const reactRoutes = createAllReactRoutes(
    config,
    defaultLocale,
    ['en', 'de'] as const,
    {
      INDEX: <HomePage />,
      SETTINGS: <SettingsPage />,
    },
    routes
  );

  return (
    <LocalizedRouterProvider value={{ config, defaultLocale, routes }}>
      <Routes>
        {reactRoutes}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </LocalizedRouterProvider>
  );
}
```

Use `LocalizedNavLink`, `useLocalizedNavigate`, and `useMatchedRoute` inside the provider. Use the bound `localizeRoutePath` from `createLocalizedRouting` for non-React redirects.

## License

MIT
