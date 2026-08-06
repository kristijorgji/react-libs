import { type Location, matchPath } from 'react-router-dom';

import { searchParamsToRecord } from './queryUtils.js';
import type { FindRouteResult, LocalizationConfig, LocalizedRouteMap } from './types.js';

export function findRoute<
    Locale extends string,
    RouteId extends string,
    DefaultLocale extends Locale,
>(
    config: LocalizationConfig,
    defaultLocale: DefaultLocale,
    routes: LocalizedRouteMap<Locale, RouteId, DefaultLocale>,
    locale: Locale,
    location: Location
): FindRouteResult<RouteId> {
    let normalizedCurrentPath = location.pathname;

    /**
     * Normalize the path in case user had opened current path /{locale} instead of /{locale}/
     */
    if (config.useLocaleInPath) {
        if (normalizedCurrentPath === `/${locale}`) {
            normalizedCurrentPath = `/${locale}/`;
        }
    }

    /**
     * Remove default locale from the url in case we have disabled usePrefixForDefaultLocale
     * but user stills opens in browser url with prefix
     * example /en/settings -> /settings
     */
    if (config.useLocaleInPath && !config.usePrefixForDefaultLocale && locale === defaultLocale) {
        normalizedCurrentPath = normalizedCurrentPath.replace(`/${locale}/`, '/');
    }

    /*
        Start with the default locale's routes and override locale specific routes
        This allows us to avoid redefining routes that are identical across locales
        (e.g "/" or other shared routes)
     */
    const routesForLocale: Record<string, { href: string }> = {
        ...routes[defaultLocale],
        ...(routes[locale as keyof typeof routes] as Record<string, { href: string }> | undefined),
    };

    // Find which route ID corresponds to the current path in the previous locale and if it matches the path params
    for (const [routeId, route] of Object.entries(routesForLocale)) {
        const routeHref =
            config.useLocaleInPath && (config.usePrefixForDefaultLocale || locale !== defaultLocale)
                ? `/${locale}${route.href}`
                : route.href;

        const match = matchPath({ path: routeHref, end: true }, normalizedCurrentPath);

        if (match) {
            return {
                routeId: routeId as RouteId,
                params: {
                    urlParams: match.params as Record<string, string | number>,
                    query: searchParamsToRecord(new URLSearchParams(location.search)),
                    hash: location.hash,
                },
            };
        }
    }

    return null;
}
