import type { ReactElement, ReactNode } from 'react';

import { Route } from 'react-router-dom';

import { localizeRoutePath } from './localizeRoutePath.js';
import type { LocalizationConfig, LocalizedRouteMap } from './types.js';

export function createLocalizedRoute<
    Locale extends string,
    RouteId extends string,
    DefaultLocale extends Locale,
>(
    routes: LocalizedRouteMap<Locale, RouteId, DefaultLocale>,
    defaultLocale: DefaultLocale,
    locale: Locale,
    routeId: RouteId,
    element: ReactNode,
    config: LocalizationConfig
): ReactElement {
    return (
        <Route
            key={routeId}
            element={element}
            path={localizeRoutePath(routes, defaultLocale, locale, routeId, null, config)}
        />
    );
}
