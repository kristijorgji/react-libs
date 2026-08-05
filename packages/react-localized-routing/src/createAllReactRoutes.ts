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

    const forLocales =
        config.useLocaleInPath === false
            ? supportedLocales.filter((l) => l !== defaultLocale)
            : supportedLocales;

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
