export type LocalizationConfig = {
    useLocaleInPath: boolean;
    usePrefixForDefaultLocale: boolean;
};

export type RouteParams = {
    urlParams?: Record<string, string | number>;
    query?: Record<string, string | number>;
    hash?: string;
} | null;

export type FormPathParams = {
    pathname: string;
    urlParams?: Record<string, string | number>;
    query?: Record<string, string | number>;
    hash?: string;
};

export type LocaleRouteMap<RouteId extends string> = Record<RouteId, { href: string }>;

export type LocalizedRouteMap<
    Locale extends string,
    RouteId extends string,
    DefaultLocale extends Locale = Locale,
> = { [K in DefaultLocale]: LocaleRouteMap<RouteId> } & Partial<
    Record<Exclude<Locale, DefaultLocale>, Partial<LocaleRouteMap<RouteId>>>
>;

export type FindRouteResult<RouteId extends string> = {
    routeId: RouteId;
    params: RouteParams;
} | null;

export type LocalizedRouterContextValue<
    Locale extends string,
    RouteId extends string,
    DefaultLocale extends Locale = Locale,
> = {
    config: LocalizationConfig;
    defaultLocale: DefaultLocale;
    routes: LocalizedRouteMap<Locale, RouteId, DefaultLocale>;
};
