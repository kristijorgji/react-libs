import { localizeRoutePath } from './localizeRoutePath.js';
import type { LocalizationConfig, LocalizedRouteMap, RouteParams } from './types.js';

export type CreateLocalizedRoutingOptions<
    Locale extends string,
    RouteId extends string,
    DefaultLocale extends Locale,
> = {
    routes: LocalizedRouteMap<Locale, RouteId, DefaultLocale>;
    defaultLocale: DefaultLocale;
    config: LocalizationConfig;
};

/**
 * Returns a pre-bound `localizeRoutePath` closed over app routes/config.
 * Useful for non-React call sites (auth redirects, logout, etc.).
 */
export function createLocalizedRouting<
    Locale extends string,
    RouteId extends string,
    DefaultLocale extends Locale,
>({
    routes,
    defaultLocale,
    config,
}: CreateLocalizedRoutingOptions<Locale, RouteId, DefaultLocale>): {
    localizeRoutePath: (locale: Locale, routeId: RouteId, params?: RouteParams) => string;
} {
    return {
        localizeRoutePath: (locale, routeId, params) =>
            localizeRoutePath(routes, defaultLocale, locale, routeId, params, config),
    };
}
