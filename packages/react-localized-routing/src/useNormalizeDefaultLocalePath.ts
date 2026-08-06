import { useEffect, useRef } from 'react';

import { useTranslation } from 'react-i18next';
import { type PathMatch, matchPath, useLocation, useNavigate } from 'react-router-dom';

import { localizeRoutePath } from './localizeRoutePath.js';
import { searchParamsToRecord } from './queryUtils.js';
import type { LocaleRouteMap, LocalizationConfig, LocalizedRouteMap } from './types.js';

/**
 * Syncs the browser URL with the configured localization behavior regarding default locale prefixes.
 * Assuming default locale is en
 * - Redirects from `/en/...` to `/...` when `usePrefixForDefaultLocale` is false (i.e., cleaner URLs).
 * - Redirects from `/...` to `/en/...` when `usePrefixForDefaultLocale` is true.
 *
 * Should be used only once at the top level of your app (e.g., in AppRouter).
 */
export function useNormalizeDefaultLocalePath<
    Locale extends string,
    RouteId extends string,
    DefaultLocale extends Locale,
>(
    config: LocalizationConfig,
    defaultLocale: DefaultLocale,
    defaultLocaleRoutes: LocaleRouteMap<RouteId>,
    routes: LocalizedRouteMap<Locale, RouteId, DefaultLocale>
): void {
    const location = useLocation();
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const prevLocaleRef = useRef<Locale | null>(null);

    useEffect(() => {
        const newLocale = i18n.language as Locale;
        const pathname = location.pathname;

        if (newLocale !== defaultLocale) {
            return;
        }

        if (prevLocaleRef.current !== null) {
            return;
        }

        const hasLocaleInPath =
            pathname.startsWith(`/${defaultLocale}/`) || pathname === `/${defaultLocale}`;

        /**
         * Do nothing if we cannot find a valid route
         */
        let matchedRouteId: RouteId | undefined;
        let match: PathMatch | undefined;
        for (const [routeId, route] of Object.entries(defaultLocaleRoutes) as [
            RouteId,
            { href: string },
        ][]) {
            const routeHref = hasLocaleInPath ? `/${defaultLocale}${route.href}` : route.href;

            match = matchPath({ path: routeHref, end: true }, pathname) ?? undefined;
            if (match) {
                matchedRouteId = routeId;
                break;
            }
        }

        if (!match || matchedRouteId === undefined) {
            return;
        }

        let navigateToNormalizedPath = false;
        if (config.useLocaleInPath && config.usePrefixForDefaultLocale) {
            if (!hasLocaleInPath) {
                navigateToNormalizedPath = true;
            }
        } else if (hasLocaleInPath) {
            navigateToNormalizedPath = true;
        }

        prevLocaleRef.current = newLocale;

        if (navigateToNormalizedPath) {
            navigate(
                localizeRoutePath(
                    routes,
                    defaultLocale,
                    defaultLocale,
                    matchedRouteId,
                    {
                        urlParams: match.params as Record<string, string | number>,
                        query: searchParamsToRecord(new URLSearchParams(location.search)),
                        hash: location.hash,
                    },
                    config
                ),
                {
                    replace: true,
                }
            );
        }
    }, [
        config,
        defaultLocale,
        defaultLocaleRoutes,
        routes,
        i18n.language,
        location.pathname,
        location.hash,
        navigate,
        location.search,
    ]);
}
