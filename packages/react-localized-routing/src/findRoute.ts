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

    if (config.useLocaleInPath) {
        if (normalizedCurrentPath === `/${locale}`) {
            normalizedCurrentPath = `/${locale}/`;
        }
    }

    if (config.useLocaleInPath && !config.usePrefixForDefaultLocale && locale === defaultLocale) {
        normalizedCurrentPath = normalizedCurrentPath.replace(`/${locale}/`, '/');
    }

    const routesForLocale: Record<string, { href: string }> = {
        ...routes[defaultLocale],
        ...(routes[locale as keyof typeof routes] as Record<string, { href: string }> | undefined),
    };

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
