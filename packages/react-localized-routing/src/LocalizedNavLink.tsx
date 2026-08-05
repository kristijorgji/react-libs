import type { FC } from 'react';

import { useTranslation } from 'react-i18next';
import { type NavLinkProps, NavLink as ReactRouterNavLink } from 'react-router-dom';

import { localizeRoutePath } from './localizeRoutePath.js';
import { useLocalizedRouterContext } from './LocalizedRouterContext.js';
import type { RouteParams } from './types.js';

type WithRouteProps<RouteId extends string> = {
    routeId: RouteId;
    params?: NonNullable<RouteParams>;
};

type WithHrefProps = {
    href: string;
};

type Props<RouteId extends string> = Omit<NavLinkProps, 'to'> & (WithRouteProps<RouteId> | WithHrefProps);

export function LocalizedNavLink<RouteId extends string = string>(
    p: Props<RouteId>
): ReturnType<FC> {
    const { i18n } = useTranslation();
    const { config, defaultLocale, routes } = useLocalizedRouterContext<string, RouteId>();

    let props: NavLinkProps;

    if ('routeId' in p && p.routeId) {
        const { routeId, params, ...rest } = p as Omit<NavLinkProps, 'to'> & WithRouteProps<RouteId>;
        props = {
            ...rest,
            to: localizeRoutePath(
                routes,
                defaultLocale,
                i18n.language,
                routeId,
                params,
                config
            ),
        };
    } else {
        const { href, ...rest } = p as Omit<NavLinkProps, 'to'> & WithHrefProps;
        props = {
            ...rest,
            to: href,
        };
    }

    return <ReactRouterNavLink {...props} />;
}
