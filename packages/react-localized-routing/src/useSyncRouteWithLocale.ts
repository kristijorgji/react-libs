import { useEffect, useRef } from 'react';

import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { findRoute } from './findRoute.js';
import { localizeRoutePath } from './localizeRoutePath.js';
import type { LocalizationConfig, LocalizedRouteMap } from './types.js';

/**
 * Synchronizes the current route with the selected locale.
 *
 * Detects language switches and redirects to the equivalent localized path.
 * Use only once at the top level of your application (e.g. in AppRouter).
 */
export function useSyncRouteWithLocale<
    Locale extends string,
    RouteId extends string,
    DefaultLocale extends Locale,
>(
    config: LocalizationConfig,
    defaultLocale: DefaultLocale,
    routes: LocalizedRouteMap<Locale, RouteId, DefaultLocale>
): void {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const prevLocaleRef = useRef<Locale | null>(null);

    useEffect(() => {
        const newLocale = i18n.language as Locale;

        if (prevLocaleRef.current && prevLocaleRef.current !== newLocale) {
            const prevLocale = prevLocaleRef.current;

            const route = findRoute(config, defaultLocale, routes, prevLocale, location);

            if (route) {
                navigate(
                    localizeRoutePath(
                        routes,
                        defaultLocale,
                        newLocale,
                        route.routeId,
                        route.params,
                        config
                    ),
                    { replace: true }
                );
            }
        }

        prevLocaleRef.current = newLocale;
    }, [config, defaultLocale, routes, i18n.language, navigate, location]);
}
