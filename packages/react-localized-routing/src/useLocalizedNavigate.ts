import { useTranslation } from 'react-i18next';
import { type NavigateOptions, useNavigate as useReactDomNavigate } from 'react-router-dom';

import { localizeRoutePath } from './localizeRoutePath.js';
import { useLocalizedRouterContext } from './LocalizedRouterContext.js';
import type { RouteParams } from './types.js';

type LocalizedNavigate<RouteId extends string> = (
    routeId: RouteId,
    params?: {
        urlParams?: Record<string, string | number>;
        query?: Record<string, string | number>;
        hash?: string;
    },
    options?: NavigateOptions
) => void | Promise<void>;

export function useLocalizedNavigate<
    Locale extends string = string,
    RouteId extends string = string,
    DefaultLocale extends Locale = Locale,
>(): LocalizedNavigate<RouteId> {
    const { i18n } = useTranslation();
    const navigate = useReactDomNavigate();
    const { config, defaultLocale, routes } = useLocalizedRouterContext<Locale, RouteId, DefaultLocale>();

    return (
        routeId: RouteId,
        params?: RouteParams extends null ? never : NonNullable<RouteParams>,
        options?: NavigateOptions
    ): void | Promise<void> => {
        return navigate(
            localizeRoutePath(
                routes,
                defaultLocale,
                i18n.language as Locale,
                routeId,
                params ?? null,
                config
            ),
            options
        );
    };
}
