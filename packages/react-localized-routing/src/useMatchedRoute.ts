import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { findRoute } from './findRoute.js';
import { useLocalizedRouterContext } from './LocalizedRouterContext.js';
import type { FindRouteResult } from './types.js';

export function useMatchedRoute<
    Locale extends string = string,
    RouteId extends string = string,
    DefaultLocale extends Locale = Locale,
>(): FindRouteResult<RouteId> {
    const { i18n } = useTranslation();
    const location = useLocation();
    const routerContext = useLocalizedRouterContext<Locale, RouteId, DefaultLocale>();

    return useMemo(() => {
        const currentLocale = i18n.language as Locale;

        return findRoute(
            routerContext.config,
            routerContext.defaultLocale,
            routerContext.routes,
            currentLocale,
            location
        );
    }, [i18n.language, location, routerContext.config, routerContext.defaultLocale, routerContext.routes]);
}
