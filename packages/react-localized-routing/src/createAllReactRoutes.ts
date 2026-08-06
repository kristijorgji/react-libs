import type { ReactElement, ReactNode } from 'react';

import { createLocalizedRoute } from './createLocalizedRoute.js';
import type { LocalizationConfig, LocalizedRouteMap } from './types.js';

const NoLocaleInPathConfig: LocalizationConfig = {
    useLocaleInPath: false,
    usePrefixForDefaultLocale: false,
};

export function createAllReactRoutes<
    Locale extends string,
    RouteId extends string,
    DefaultLocale extends Locale,
>(
    config: LocalizationConfig,
    defaultLocale: DefaultLocale,
    supportedLocales: readonly Locale[],
    routeConfigs: Record<RouteId, ReactNode>,
    routes: LocalizedRouteMap<Locale, RouteId, DefaultLocale>
): ReactElement[] {
    const reactRoutes: ReactElement[] = [];

    /**
     * Add default locale routes without a prefix.
     * This ensures that `useProperDefaultLocalePath` can properly redirect
     * from prefixed paths like `/en/settings` to `/settings` and the other way around based on
     * `usePrefixForDefaultLocale` value
     */
    reactRoutes.push(
        ...Object.entries(routeConfigs).map(([routeId, element]) =>
            createLocalizedRoute(
                routes,
                defaultLocale,
                defaultLocale,
                routeId as RouteId,
                element as ReactNode,
                NoLocaleInPathConfig
            )
        )
    );

    /**
     * Do not repeat the same routes as above for the defaultLocale if we have config.useLocaleInPath = false
     */
    const forLocales =
        config.useLocaleInPath === false
            ? supportedLocales.filter((l) => l !== defaultLocale)
            : supportedLocales;

    /**
     * Add other locale routes so we can open them on first page load, example /einstellungen
     */
    reactRoutes.push(
        ...forLocales.flatMap((locale) =>
            Object.entries(routeConfigs).map(([routeId, element]) =>
                createLocalizedRoute(
                    routes,
                    defaultLocale,
                    locale,
                    routeId as RouteId,
                    element as ReactNode,
                    config
                )
            )
        )
    );

    return reactRoutes;
}
