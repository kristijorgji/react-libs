import { formPath } from './formPath.js';
import type { LocalizationConfig, LocalizedRouteMap, RouteParams } from './types.js';

export function localizeRoutePath<
    Locale extends string,
    RouteId extends string,
    DefaultLocale extends Locale,
>(
    routes: LocalizedRouteMap<Locale, RouteId, DefaultLocale>,
    defaultLocale: DefaultLocale,
    locale: Locale,
    routeId: RouteId,
    params: RouteParams | undefined,
    config: LocalizationConfig
): string {
    const defaultRoutes = routes[defaultLocale];
    let localizedRawPath = defaultRoutes[routeId].href;

    const localeRoutes = routes[locale as keyof typeof routes] as
        | Partial<Record<RouteId, { href: string }>>
        | undefined;
    if (localeRoutes?.[routeId]) {
        localizedRawPath = localeRoutes[routeId].href;
    }

    const { useLocaleInPath, usePrefixForDefaultLocale } = config;
    if (useLocaleInPath && (usePrefixForDefaultLocale || locale !== defaultLocale)) {
        localizedRawPath = `/${locale}${localizedRawPath}`;
    }

    return formPath({
        pathname: localizedRawPath,
        ...(params ?? {}),
    });
}
