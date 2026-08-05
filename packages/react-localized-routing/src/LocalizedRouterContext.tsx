import { createContext, use, type ReactElement, type ReactNode } from 'react';

import type { LocalizedRouterContextValue } from './types.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- context is generic per consumer app
const LocalizedRouterContext = createContext<LocalizedRouterContextValue<any, any, any> | undefined>(
    undefined
);
LocalizedRouterContext.displayName = 'LocalizedRouterContext';

export function LocalizedRouterProvider<
    Locale extends string,
    RouteId extends string,
    DefaultLocale extends Locale,
>({
    value,
    children,
}: {
    value: LocalizedRouterContextValue<Locale, RouteId, DefaultLocale>;
    children: ReactNode;
}): ReactElement {
    return <LocalizedRouterContext value={value}>{children}</LocalizedRouterContext>;
}

export function useLocalizedRouterContext<
    Locale extends string = string,
    RouteId extends string = string,
    DefaultLocale extends Locale = Locale,
>(): LocalizedRouterContextValue<Locale, RouteId, DefaultLocale> {
    const value = use(LocalizedRouterContext);
    if (!value) {
        throw new Error('useLocalizedRouterContext must be used within LocalizedRouterProvider');
    }
    return value as LocalizedRouterContextValue<Locale, RouteId, DefaultLocale>;
}
